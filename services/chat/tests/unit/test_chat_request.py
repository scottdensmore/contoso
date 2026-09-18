import json
import sys
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from contoso_chat.chat_request import (
    build_customer_profile_context,
    detect_handoff_intent,
    extract_product_citations,
    format_chat_history,
    format_chat_history_prompt,
    generate_llm_response,
    generate_llm_response_stream,
    get_customer_from_postgres,
    get_response,
    get_response_stream,
)


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.anyio
async def test_get_customer_from_postgres_returns_none_for_empty_id():
    with patch("db.fetch_customer") as mock_fetch:
        result = await get_customer_from_postgres("")

    assert result is None
    mock_fetch.assert_not_called()


@pytest.mark.anyio
async def test_get_customer_from_postgres_returns_customer():
    with patch("db.fetch_customer", AsyncMock(return_value={"firstName": "Taylor"})) as mock_fetch:
        result = await get_customer_from_postgres("cust-1")

    assert result == {"firstName": "Taylor"}
    mock_fetch.assert_awaited_once_with("cust-1")


@pytest.mark.anyio
async def test_get_customer_from_postgres_returns_none_when_missing():
    with patch("db.fetch_customer", AsyncMock(return_value=None)):
        result = await get_customer_from_postgres("cust-1")

    assert result is None


@pytest.mark.anyio
async def test_get_customer_from_postgres_returns_none_on_exception():
    with patch("db.fetch_customer", AsyncMock(side_effect=RuntimeError("db down"))):
        result = await get_customer_from_postgres("cust-1")

    assert result is None


@pytest.mark.anyio
async def test_generate_llm_response_local_provider():
    mock_completion = MagicMock(
        return_value=SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content="local answer"))]
        )
    )

    with patch.dict(
        sys.modules,
        {"litellm": SimpleNamespace(completion=mock_completion)},
    ), patch.dict(
        "os.environ",
        {"OLLAMA_BASE_URL": "http://ollama:11434", "LOCAL_MODEL_NAME": "mistral"},
        clear=False,
    ):
        result = await generate_llm_response(
            prompt="Best tent?",
            context='[{"sku":"abc123"}]',
            user_name="Taylor",
            provider="local",
            project_id="unused-project",
            location="unused-region",
            model_name="unused-model",
        )

    assert result == "local answer"
    mock_completion.assert_called_once()
    kwargs = mock_completion.call_args.kwargs
    assert kwargs["model"] == "ollama/mistral"
    assert kwargs["api_base"] == "http://ollama:11434"
    assert kwargs["temperature"] == 0.7


@pytest.mark.anyio
async def test_generate_llm_response_local_provider_requires_optional_dependencies():
    with patch.dict(sys.modules, {"litellm": None}):
        with pytest.raises(
            RuntimeError,
            match="Local LLM provider dependencies are not installed",
        ):
            await generate_llm_response(
                prompt="Best tent?",
                context='[{"sku":"abc123"}]',
                user_name="Taylor",
                provider="local",
                project_id="unused-project",
                location="unused-region",
                model_name="unused-model",
            )


@pytest.mark.anyio
async def test_generate_llm_response_gcp_provider():
    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = SimpleNamespace(text="gcp answer")
    mock_client_class = MagicMock(return_value=mock_client)

    with patch("google.genai.Client", mock_client_class):
        result = await generate_llm_response(
            prompt="Best tent?",
            context='[{"sku":"abc123"}]',
            user_name="Taylor",
            provider="gcp",
            project_id="project-1",
            location="us-central1",
            model_name="gemini-2.5-flash",
        )

    assert result == "gcp answer"
    mock_client_class.assert_called_once_with(
        vertexai=True, project="project-1", location="us-central1"
    )
    mock_client.models.generate_content.assert_called_once()
    kwargs = mock_client.models.generate_content.call_args.kwargs
    assert kwargs["model"] == "gemini-2.5-flash"
    sent_prompt = kwargs["contents"]
    assert isinstance(sent_prompt, str)
    assert "Best tent?" in sent_prompt
    assert "abc123" in sent_prompt
    assert "Taylor" in sent_prompt


@pytest.mark.anyio
async def test_get_response_uses_customer_name_and_env_settings():
    product_context = [{"sku": "abc123", "name": "Trailmaster X4"}]
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = product_context

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value={"firstName": "Taylor"}),
    ) as mock_get_customer, patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search_service,
    ) as mock_get_search_service, patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(return_value="answer text"),
    ) as mock_generate, patch.dict(
        "os.environ",
        {
            "PROJECT_ID": "project-1",
            "REGION": "us-central1",
            "LLM_PROVIDER": "local",
            "GEMINI_MODEL_NAME": "custom-model",
        },
        clear=True,
    ):
        result = await get_response("cust-1", "Best tent?", "[]")

    expected_profile = build_customer_profile_context({"firstName": "Taylor"})
    assert result == {
        "question": "Best tent?",
        "answer": "answer text",
        "context": product_context,
        "citations": [
            {
                "name": "Trailmaster X4",
                "slug": None,
                "price": None,
                "image": None,
                "category": None,
            }
        ],
        "handoff": {
            "requested": False,
            "reason": None,
            "suggested_action": None,
            "support_contact": None,
        },
        "customer_profile": {
            "membership": None,
            "past_purchases_count": 0,
        },
    }
    mock_get_customer.assert_awaited_once_with("cust-1")
    mock_get_search_service.assert_called_once_with()
    mock_search_service.search.assert_called_once_with("Best tent?", limit=5)
    mock_generate.assert_awaited_once_with(
        "Best tent?",
        json.dumps(product_context, indent=2),
        "Taylor",
        "local",
        "project-1",
        "us-central1",
        "custom-model",
        chat_history="[]",
        customer_profile=expected_profile,
    )


@pytest.mark.anyio
async def test_get_response_defaults_to_guest_and_default_model():
    product_context = [{"sku": "abc123"}]
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = product_context

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=None),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search_service,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(return_value="guest answer"),
    ) as mock_generate, patch.dict("os.environ", {}, clear=True):
        result = await get_response("cust-1", "Best tent?", "[]")

    assert result["answer"] == "guest answer"
    mock_generate.assert_awaited_once_with(
        "Best tent?",
        json.dumps(product_context, indent=2),
        "Guest",
        "gcp",
        None,
        None,
        "gemini-2.5-flash",
        chat_history="[]",
        customer_profile=build_customer_profile_context(None),
    )


@pytest.mark.anyio
async def test_generate_llm_response_stream_gcp():
    mock_chunks = [
        SimpleNamespace(text="Hello "),
        SimpleNamespace(text=""),
        SimpleNamespace(text="world!"),
    ]
    mock_client = MagicMock()
    mock_client.models.generate_content_stream.return_value = mock_chunks
    mock_client_class = MagicMock(return_value=mock_client)

    with patch("google.genai.Client", mock_client_class):
        stream = generate_llm_response_stream(
            prompt="Best tent?",
            context='[{"sku":"abc123"}]',
            user_name="Taylor",
            provider="gcp",
            project_id="project-1",
            location="us-central1",
            model_name="gemini-2.5-flash",
        )
        if hasattr(stream, "__aiter__"):
            chunks = [chunk async for chunk in stream]
        else:
            chunks = list(stream)

    assert chunks == ["Hello ", "world!"]
    mock_client_class.assert_called_once_with(
        vertexai=True, project="project-1", location="us-central1"
    )
    mock_client.models.generate_content_stream.assert_called_once()
    kwargs = mock_client.models.generate_content_stream.call_args.kwargs
    assert kwargs["model"] == "gemini-2.5-flash"
    assert "Best tent?" in kwargs["contents"]
    assert "abc123" in kwargs["contents"]
    assert "Taylor" in kwargs["contents"]


@pytest.mark.anyio
async def test_generate_llm_response_stream_local():
    mock_chunks = [
        SimpleNamespace(
            choices=[SimpleNamespace(delta=SimpleNamespace(content="Local "))]
        ),
        SimpleNamespace(
            choices=[SimpleNamespace(delta=SimpleNamespace(content="stream"))]
        ),
        SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content=None))]),
    ]
    mock_completion = MagicMock(return_value=mock_chunks)

    with patch.dict(
        sys.modules,
        {"litellm": SimpleNamespace(completion=mock_completion)},
    ), patch.dict(
        "os.environ",
        {"OLLAMA_BASE_URL": "http://ollama:11434", "LOCAL_MODEL_NAME": "mistral"},
        clear=False,
    ):
        stream = generate_llm_response_stream(
            prompt="Best tent?",
            context='[{"sku":"abc123"}]',
            user_name="Taylor",
            provider="local",
            project_id="unused-project",
            location="unused-region",
            model_name="unused-model",
        )
        if hasattr(stream, "__aiter__"):
            chunks = [chunk async for chunk in stream]
        else:
            chunks = list(stream)

    assert chunks == ["Local ", "stream"]
    mock_completion.assert_called_once()
    kwargs = mock_completion.call_args.kwargs
    assert kwargs["model"] == "ollama/mistral"
    assert kwargs["stream"] is True


@pytest.mark.anyio
async def test_get_response_stream():
    product_context = [{"sku": "abc123", "name": "Trailmaster X4"}]
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = product_context

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value={"firstName": "Taylor"}),
    ) as mock_get_customer, patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search_service,
    ) as mock_get_search_service, patch(
        "contoso_chat.chat_request.generate_llm_response_stream",
        return_value=iter(["streamed ", "tokens"]),
    ) as mock_generate_stream, patch.dict(
        "os.environ",
        {
            "PROJECT_ID": "project-1",
            "REGION": "us-central1",
            "LLM_PROVIDER": "gcp",
            "GEMINI_MODEL_NAME": "custom-model",
        },
        clear=True,
    ):
        stream = get_response_stream("cust-1", "Best tent?", "[]")
        chunks = [chunk async for chunk in stream]

    expected_profile = build_customer_profile_context({"firstName": "Taylor"})
    assert chunks == [
        f"data: {json.dumps({'event': 'status', 'status': 'searching_catalog', 'message': 'Searching product catalog...'})}\n\n",
        f"data: {json.dumps({'event': 'status', 'status': 'generating_response', 'message': 'Generating response...'})}\n\n",
        f"data: {json.dumps({'event': 'citations', 'citations': [{'name': 'Trailmaster X4', 'slug': None, 'price': None, 'image': None, 'category': None}]})}\n\n",
        f"data: {json.dumps({'event': 'handoff', 'handoff': {'requested': False, 'reason': None, 'suggested_action': None, 'support_contact': None}})}\n\n",
        f"data: {json.dumps({'event': 'profile', 'profile': {'membership': None, 'past_purchases_count': 0}})}\n\n",
        f"data: {json.dumps({'chunk': 'streamed '})}\n\n",
        f"data: {json.dumps({'chunk': 'tokens'})}\n\n",
    ]
    mock_get_customer.assert_awaited_once_with("cust-1")
    mock_get_search_service.assert_called_once_with()
    mock_search_service.search.assert_called_once_with("Best tent?", limit=5)
    mock_generate_stream.assert_called_once_with(
        "Best tent?",
        json.dumps(product_context, indent=2),
        "Taylor",
        "gcp",
        "project-1",
        "us-central1",
        "custom-model",
        chat_history="[]",
        customer_profile=expected_profile,
    )

@pytest.mark.anyio
async def test_generate_llm_response_stream_local_provider_requires_optional_dependencies():
    with patch.dict(sys.modules, {"litellm": None}):
        with pytest.raises(
            RuntimeError,
            match="Local LLM provider dependencies are not installed",
        ):
            list(
                generate_llm_response_stream(
                    prompt="Best tent?",
                    context='[{"sku":"abc123"}]',
                    user_name="Taylor",
                    provider="local",
                    project_id="unused-project",
                    location="unused-region",
                    model_name="unused-model",
                )
            )


def test_extract_product_citations():
    raw_context = [
        {
            "name": "Alpine Explorer Tent",
            "slug": "alpine-explorer-tent",
            "price": 350,
            "image": "/images/tent.webp",
            "category": "Tents",
        },
        {
            "title": "Summit Climber Backpack",
            "slug": "summit-climber-backpack",
            "price": 120,
            "image": "/images/backpack.webp",
            "categoryName": "Backpacks",
        },
        {
            # Duplicate slug with different name or metadata - should be deduplicated
            "name": "Alpine Explorer Tent Duplicate",
            "slug": "alpine-explorer-tent",
            "price": 350,
            "image": "/images/tent_alt.webp",
            "category": "Tents",
        },
    ]

    citations = extract_product_citations(raw_context)

    assert len(citations) == 2
    assert citations[0] == {
        "name": "Alpine Explorer Tent",
        "slug": "alpine-explorer-tent",
        "price": 350,
        "image": "/images/tent.webp",
        "category": "Tents",
    }
    assert citations[1] == {
        "name": "Summit Climber Backpack",
        "slug": "summit-climber-backpack",
        "price": 120,
        "image": "/images/backpack.webp",
        "category": "Backpacks",
    }


@pytest.mark.anyio
async def test_get_response_includes_citations():
    product_context = [
        {
            "name": "Trailmaster X4",
            "slug": "trailmaster-x4",
            "price": 150,
            "image": "/images/trailmaster.webp",
            "category": "Tents",
        }
    ]
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = product_context

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value={"firstName": "Taylor"}),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search_service,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(return_value="answer text"),
    ), patch.dict(
        "os.environ",
        {"PROJECT_ID": "project-1", "REGION": "us-central1"},
        clear=True,
    ):
        result = await get_response("cust-1", "Best tent?", "[]")

    assert "citations" in result
    assert result["citations"] == [
        {
            "name": "Trailmaster X4",
            "slug": "trailmaster-x4",
            "price": 150,
            "image": "/images/trailmaster.webp",
            "category": "Tents",
        }
    ]
    assert result["answer"] == "answer text"
    assert result["question"] == "Best tent?"
    assert result["context"] == product_context


@pytest.mark.anyio
async def test_get_response_stream_emits_citations_event():
    product_context = [
        {
            "name": "Trailmaster X4",
            "slug": "trailmaster-x4",
            "price": 150,
            "image": "/images/trailmaster.webp",
            "category": "Tents",
        }
    ]
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = product_context

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value={"firstName": "Taylor"}),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search_service,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response_stream",
        return_value=iter(["chunk 1 ", "chunk 2"]),
    ), patch.dict(
        "os.environ",
        {"PROJECT_ID": "project-1", "REGION": "us-central1"},
        clear=True,
    ):
        stream = get_response_stream("cust-1", "Best tent?", "[]")
        events = [chunk async for chunk in stream]

    assert len(events) == 7
    assert events[0] == f"data: {json.dumps({'event': 'status', 'status': 'searching_catalog', 'message': 'Searching product catalog...'})}\n\n"
    assert events[1] == f"data: {json.dumps({'event': 'status', 'status': 'generating_response', 'message': 'Generating response...'})}\n\n"
    assert events[2] == f"data: {json.dumps({'event': 'citations', 'citations': [{'name': 'Trailmaster X4', 'slug': 'trailmaster-x4', 'price': 150, 'image': '/images/trailmaster.webp', 'category': 'Tents'}]})}\n\n"
    assert events[3] == f"data: {json.dumps({'event': 'handoff', 'handoff': {'requested': False, 'reason': None, 'suggested_action': None, 'support_contact': None}})}\n\n"
    assert events[4] == f"data: {json.dumps({'event': 'profile', 'profile': {'membership': None, 'past_purchases_count': 0}})}\n\n"
    assert events[5] == f"data: {json.dumps({'chunk': 'chunk 1 '})}\n\n"
    assert events[6] == f"data: {json.dumps({'chunk': 'chunk 2'})}\n\n"


def test_format_chat_history_with_json_string_role_content():
    history_json = json.dumps([
        {"role": "user", "content": "What sleeping bags do you have?"},
        {"role": "assistant", "content": "We have the Alpine Down sleeping bag."},
    ])
    result = format_chat_history(history_json)
    assert result == [
        {"role": "user", "content": "What sleeping bags do you have?"},
        {"role": "assistant", "content": "We have the Alpine Down sleeping bag."},
    ]


def test_format_chat_history_with_json_string_role_message():
    history_json = json.dumps([
        {"role": "user", "message": "Can I use it in winter?"},
        {"role": "assistant", "message": "Yes, it is rated down to 0 degrees."},
    ])
    result = format_chat_history(history_json)
    assert result == [
        {"role": "user", "content": "Can I use it in winter?"},
        {"role": "assistant", "content": "Yes, it is rated down to 0 degrees."},
    ]


def test_format_chat_history_with_list_qa_format():
    qa_list = [
        {
            "question": "What tents do you recommend?",
            "answer": "The Trailmaster X4 is great for camping.",
        },
        {
            "question": "Is it waterproof?",
            "answer": "Yes, it has a 3000mm hydrostatic head rating.",
        },
    ]
    result = format_chat_history(qa_list)
    assert result == [
        {"role": "user", "content": "What tents do you recommend?"},
        {"role": "assistant", "content": "The Trailmaster X4 is great for camping."},
        {"role": "user", "content": "Is it waterproof?"},
        {"role": "assistant", "content": "Yes, it has a 3000mm hydrostatic head rating."},
    ]


def test_format_chat_history_truncates_to_max_turns():
    qa_list = [
        {"question": f"Q{i}", "answer": f"A{i}"}
        for i in range(6)
    ]
    result = format_chat_history(qa_list, max_turns=4)
    assert len(result) == 4
    assert result == [
        {"role": "user", "content": "Q4"},
        {"role": "assistant", "content": "A4"},
        {"role": "user", "content": "Q5"},
        {"role": "assistant", "content": "A5"},
    ]


def test_format_chat_history_default_max_turns_ten():
    qa_list = [
        {"question": f"Q{i}", "answer": f"A{i}"}
        for i in range(7)
    ]
    result = format_chat_history(qa_list)
    assert len(result) == 10
    assert result[0] == {"role": "user", "content": "Q2"}
    assert result[-1] == {"role": "assistant", "content": "A6"}


def test_format_chat_history_invalid_inputs():
    assert format_chat_history(None) == []
    assert format_chat_history(12345) == []
    assert format_chat_history("invalid json") == []
    assert format_chat_history("{\"key\": \"value\"}") == []
    assert format_chat_history("42") == []
    assert format_chat_history([None, "string", 123]) == []
    assert format_chat_history([{"foo": "bar"}]) == []
    assert format_chat_history([{"role": "user"}]) == []
    assert format_chat_history([{"content": "hello"}]) == []
    assert format_chat_history([{"role": "user", "content": ""}]) == []
    assert format_chat_history([{"question": "", "answer": "hi"}]) == []
    assert format_chat_history([{"question": "hi", "answer": ""}]) == []


def test_format_chat_history_prompt_non_empty():
    history = [
        {"role": "user", "content": "Do you have hiking boots?"},
        {"role": "assistant", "content": "Yes, we recommend Trail Walker boots."},
    ]
    prompt_text = format_chat_history_prompt(history)
    expected = "Conversation History:\nUser: Do you have hiking boots?\nAssistant: Yes, we recommend Trail Walker boots."
    assert prompt_text == expected


def test_format_chat_history_prompt_empty():
    assert format_chat_history_prompt([]) == ""
    assert format_chat_history_prompt(None) == ""


@pytest.mark.anyio
async def test_generate_llm_response_local_provider_includes_history():
    mock_completion = MagicMock(
        return_value=SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content="local response with history"))]
        )
    )

    with patch.dict(
        sys.modules,
        {"litellm": SimpleNamespace(completion=mock_completion)},
    ), patch.dict(
        "os.environ",
        {"OLLAMA_BASE_URL": "http://ollama:11434", "LOCAL_MODEL_NAME": "mistral"},
        clear=False,
    ):
        history = [
            {"role": "user", "content": "I like lightweight gear."},
            {"role": "assistant", "content": "Got it, ultralight is a great choice."},
        ]
        result = await generate_llm_response(
            prompt="Which tent?",
            context='[{"sku":"abc123"}]',
            user_name="Taylor",
            provider="local",
            project_id="unused-project",
            location="unused-region",
            model_name="unused-model",
            chat_history=history,
        )

    assert result == "local response with history"
    mock_completion.assert_called_once()
    kwargs = mock_completion.call_args.kwargs
    messages = kwargs["messages"]
    assert len(messages) == 4
    assert messages[0]["role"] == "system"
    assert messages[1] == {"role": "user", "content": "I like lightweight gear."}
    assert messages[2] == {"role": "assistant", "content": "Got it, ultralight is a great choice."}
    assert messages[3]["role"] == "user"
    assert "Which tent?" in messages[3]["content"]


@pytest.mark.anyio
async def test_generate_llm_response_gcp_provider_includes_history():
    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = SimpleNamespace(text="gcp answer with history")
    mock_client_class = MagicMock(return_value=mock_client)

    with patch("google.genai.Client", mock_client_class):
        history = [
            {"role": "user", "content": "I like lightweight gear."},
            {"role": "assistant", "content": "Got it, ultralight is a great choice."},
        ]
        result = await generate_llm_response(
            prompt="Which tent?",
            context='[{"sku":"abc123"}]',
            user_name="Taylor",
            provider="gcp",
            project_id="project-1",
            location="us-central1",
            model_name="gemini-2.5-flash",
            chat_history=history,
        )

    assert result == "gcp answer with history"
    mock_client.models.generate_content.assert_called_once()
    kwargs = mock_client.models.generate_content.call_args.kwargs
    sent_prompt = kwargs["contents"]
    assert "Conversation History:" in sent_prompt
    assert "User: I like lightweight gear." in sent_prompt
    assert "Assistant: Got it, ultralight is a great choice." in sent_prompt
    assert "Catalog Context:" in sent_prompt
    assert "User Question: Which tent?" in sent_prompt


@pytest.mark.anyio
async def test_generate_llm_response_stream_local_includes_history():
    mock_chunks = [
        SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content="streamed"))]),
    ]
    mock_completion = MagicMock(return_value=mock_chunks)

    with patch.dict(
        sys.modules,
        {"litellm": SimpleNamespace(completion=mock_completion)},
    ), patch.dict(
        "os.environ",
        {"OLLAMA_BASE_URL": "http://ollama:11434", "LOCAL_MODEL_NAME": "mistral"},
        clear=False,
    ):
        history = [{"role": "user", "content": "Prior question"}]
        stream = generate_llm_response_stream(
            prompt="Best tent?",
            context='[{"sku":"abc123"}]',
            user_name="Taylor",
            provider="local",
            project_id="unused-project",
            location="unused-region",
            model_name="unused-model",
            chat_history=history,
        )
        chunks = list(stream)

    assert chunks == ["streamed"]
    kwargs = mock_completion.call_args.kwargs
    messages = kwargs["messages"]
    assert len(messages) == 3
    assert messages[1] == {"role": "user", "content": "Prior question"}


@pytest.mark.anyio
async def test_generate_llm_response_stream_gcp_includes_history():
    mock_chunks = [SimpleNamespace(text="streamed")]
    mock_client = MagicMock()
    mock_client.models.generate_content_stream.return_value = mock_chunks
    mock_client_class = MagicMock(return_value=mock_client)

    with patch("google.genai.Client", mock_client_class):
        history = [{"role": "user", "content": "Prior question"}]
        stream = generate_llm_response_stream(
            prompt="Best tent?",
            context='[{"sku":"abc123"}]',
            user_name="Taylor",
            provider="gcp",
            project_id="project-1",
            location="us-central1",
            model_name="gemini-2.5-flash",
            chat_history=history,
        )
        chunks = list(stream)

    assert chunks == ["streamed"]
    kwargs = mock_client.models.generate_content_stream.call_args.kwargs
    assert "Conversation History:" in kwargs["contents"]
    assert "User: Prior question" in kwargs["contents"]


@pytest.mark.anyio
async def test_get_response_passes_chat_history_to_generate_llm_response():
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []
    chat_history = [{"role": "user", "content": "previous question"}]

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value={"firstName": "Taylor"}),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search_service,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(return_value="answer text"),
    ) as mock_generate:
        await get_response("cust-1", "follow up question", chat_history)

    assert mock_generate.call_args.kwargs.get("chat_history") == chat_history or (
        len(mock_generate.call_args.args) >= 8 and mock_generate.call_args.args[7] == chat_history
    )


@pytest.mark.anyio
async def test_get_response_stream_passes_chat_history_to_generate_llm_response_stream():
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []
    chat_history = [{"role": "user", "content": "previous question"}]

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value={"firstName": "Taylor"}),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search_service,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response_stream",
        return_value=iter(["chunk"]),
    ) as mock_generate_stream:
        stream = get_response_stream("cust-1", "follow up question", chat_history)
        _ = [chunk async for chunk in stream]

    assert mock_generate_stream.call_args.kwargs.get("chat_history") == chat_history or (
        len(mock_generate_stream.call_args.args) >= 8 and mock_generate_stream.call_args.args[7] == chat_history
    )


def test_detect_handoff_intent_agent_requested():
    result = detect_handoff_intent("Can I talk to a human agent?")
    assert result["requested"] is True
    assert result["reason"] == "agent_requested"
    assert result["suggested_action"] == "live_agent_transfer"
    assert result["support_contact"] == {
        "email": "support@contosooutdoor.com",
        "phone": "1-800-555-0199",
        "hours": "Mon-Fri 8am-8pm EST",
    }

    # Additional human agent request phrases
    for phrase in [
        "I need a real person",
        "Please connect me to an operator",
        "Can I speak with a customer service representative?",
        "I want to talk to someone",
        "speak with a person",
    ]:
        res = detect_handoff_intent(phrase)
        assert res["requested"] is True
        assert res["reason"] == "agent_requested"
        assert res["suggested_action"] == "live_agent_transfer"


def test_detect_handoff_intent_dispute_or_refund():
    result = detect_handoff_intent("I want a refund for my broken tent")
    assert result["requested"] is True
    assert result["reason"] == "dispute_or_refund"
    assert result["suggested_action"] == "support_ticket"
    assert result["support_contact"] == {
        "email": "support@contosooutdoor.com",
        "phone": "1-800-555-0199",
        "hours": "Mon-Fri 8am-8pm EST",
    }

    # Additional dispute phrases
    for phrase in [
        "cancel my order immediately",
        "I need to dispute charge on my card",
        "The item is defective item",
        "My stolen package never arrived",
        "I want to speak to manager",
        "Get me your supervisor",
    ]:
        res = detect_handoff_intent(phrase)
        assert res["requested"] is True
        assert res["reason"] == "dispute_or_refund"
        assert res["suggested_action"] == "support_ticket"


def test_detect_handoff_intent_user_frustration():
    result = detect_handoff_intent("You are completely unhelpful")
    assert result["requested"] is True
    assert result["reason"] == "user_frustration"
    assert result["suggested_action"] == "contact_support"
    assert result["support_contact"] == {
        "email": "support@contosooutdoor.com",
        "phone": "1-800-555-0199",
        "hours": "Mon-Fri 8am-8pm EST",
    }

    # Additional frustration phrases
    for phrase in [
        "you are useless",
        "This bot is not helping at all",
        "stop repeating the same thing",
        "this is ridiculous",
        "terrible service from Contoso",
    ]:
        res = detect_handoff_intent(phrase)
        assert res["requested"] is True
        assert res["reason"] == "user_frustration"
        assert res["suggested_action"] == "contact_support"


def test_detect_handoff_intent_product_inquiry_not_requested():
    for query in [
        "What is the weight of the TrailMaster tent?",
        "Do you have sleeping bags rated for freezing temperatures?",
        "How much is the Alpine Explorer?",
        "Can you recommend hiking boots for beginners?",
    ]:
        res = detect_handoff_intent(query)
        assert res == {
            "requested": False,
            "reason": None,
            "suggested_action": None,
            "support_contact": None,
        }


def test_detect_handoff_intent_empty_and_null_inputs():
    expected = {
        "requested": False,
        "reason": None,
        "suggested_action": None,
        "support_contact": None,
    }
    assert detect_handoff_intent("") == expected
    assert detect_handoff_intent(None) == expected
    assert detect_handoff_intent("   ", None) == expected
    assert detect_handoff_intent(123) == expected


def test_detect_handoff_intent_from_chat_history():
    history = [
        {"role": "user", "content": "I need to talk to a human agent"},
        {"role": "assistant", "content": "I can help connect you."},
    ]
    res = detect_handoff_intent("", history)
    assert res["requested"] is True
    assert res["reason"] == "agent_requested"


@pytest.mark.anyio
async def test_get_response_includes_handoff_structure():
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=None),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search_service,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(return_value="Support transfer initiated."),
    ):
        result = await get_response("cust-1", "I need to talk to a human agent", "[]")

    assert "handoff" in result
    assert result["handoff"]["requested"] is True
    assert result["handoff"]["reason"] == "agent_requested"
    assert result["handoff"]["suggested_action"] == "live_agent_transfer"


@pytest.mark.anyio
async def test_get_response_stream_yields_handoff_frame():
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=None),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search_service,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response_stream",
        return_value=iter(["chunk 1"]),
    ):
        stream = get_response_stream("cust-1", "I want a refund for my broken tent", "[]")
        frames = [f async for f in stream]

    assert len(frames) >= 4
    citations_data = next(
        json.loads(f.removeprefix("data: "))
        for f in frames
        if json.loads(f.removeprefix("data: ")).get("event") == "citations"
    )
    assert citations_data.get("event") == "citations"

    handoff_data = next(
        json.loads(f.removeprefix("data: "))
        for f in frames
        if json.loads(f.removeprefix("data: ")).get("event") == "handoff"
    )
    assert handoff_data.get("event") == "handoff"
    assert handoff_data["handoff"]["requested"] is True
    assert handoff_data["handoff"]["reason"] == "dispute_or_refund"
    assert handoff_data["handoff"]["suggested_action"] == "support_ticket"



def test_build_customer_profile_context_none():
    result = build_customer_profile_context(None)
    assert result == {
        "user_name": "Guest",
        "membership": None,
        "past_purchases": [],
        "profile_prompt": "",
    }


def test_build_customer_profile_context_no_orders():
    customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}
    result = build_customer_profile_context(customer)
    assert result["user_name"] == "Taylor"
    assert result["membership"] == "Gold"
    assert result["past_purchases"] == []
    expected_prompt = (
        "Customer Profile:\n"
        "- Name: Taylor\n"
        "- Membership Tier: Gold\n"
        "- Past Purchases: None\n"
        "- Recommendation Guidelines: Tailor product suggestions to complement the customer's existing gear and acknowledge their membership status when relevant."
    )
    assert result["profile_prompt"] == expected_prompt


def test_build_customer_profile_context_user_name_fallbacks():
    c1 = {"name": "Jordan Rivers", "membership": "Silver"}
    res1 = build_customer_profile_context(c1)
    assert res1["user_name"] == "Jordan Rivers"

    c2 = {"membership": "Bronze"}
    res2 = build_customer_profile_context(c2)
    assert res2["user_name"] == "Valued Customer"


def test_build_customer_profile_context_multiple_orders_deduplication_and_categories():
    customer = {
        "firstName": "Alex",
        "membership": "Platinum",
        "orders": [
            {
                "items": [
                    {
                        "product": {
                            "name": "Alpine Explorer Tent",
                            "category": "Tents",
                        }
                    },
                    {
                        "product": {
                            "name": "TrailMaster Sleeping Bag",
                            "category": "Sleeping Bags",
                        }
                    },
                ]
            },
            {
                "items": [
                    {
                        "product": {
                            "name": "Alpine Explorer Tent",  # duplicate product name
                            "category": "Tents",            # duplicate category
                        }
                    },
                    {
                        "product": {
                            "name": "Summit Hiking Backpack",
                            "category": "Backpacks",
                        }
                    },
                ]
            },
        ],
    }
    result = build_customer_profile_context(customer)
    assert result["user_name"] == "Alex"
    assert result["membership"] == "Platinum"
    assert "Alpine Explorer Tent" in result["past_purchases"]
    assert "TrailMaster Sleeping Bag" in result["past_purchases"]
    assert "Summit Hiking Backpack" in result["past_purchases"]
    assert len(result["past_purchases"]) == len(set(result["past_purchases"]))

    prompt = result["profile_prompt"]
    assert "Customer Profile:" in prompt
    assert "- Name: Alex" in prompt
    assert "- Membership Tier: Platinum" in prompt
    assert "- Past Purchases: " in prompt
    assert "Alpine Explorer Tent" in prompt
    assert "- Recommendation Guidelines: Tailor product suggestions to complement the customer's existing gear and acknowledge their membership status when relevant." in prompt


@pytest.mark.anyio
async def test_generate_llm_response_local_injects_profile_prompt():
    mock_completion = MagicMock(
        return_value=SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content="recommended answer"))]
        )
    )
    profile_prompt = (
        "Customer Profile:\n"
        "- Name: Taylor\n"
        "- Membership Tier: Gold\n"
        "- Past Purchases: Tent\n"
        "- Recommendation Guidelines: Tailor product suggestions to complement the customer's existing gear and acknowledge their membership status when relevant."
    )

    with patch.dict(
        sys.modules,
        {"litellm": SimpleNamespace(completion=mock_completion)},
    ), patch.dict(
        "os.environ",
        {"OLLAMA_BASE_URL": "http://ollama:11434", "LOCAL_MODEL_NAME": "mistral"},
        clear=False,
    ):
        result = await generate_llm_response(
            prompt="Best boots?",
            context="[]",
            user_name="Taylor",
            provider="local",
            project_id="unused",
            location="unused",
            model_name="unused",
            customer_profile={"profile_prompt": profile_prompt},
        )

    assert result == "recommended answer"
    messages = mock_completion.call_args.kwargs["messages"]
    system_msg = messages[0]["content"]
    assert profile_prompt in system_msg


@pytest.mark.anyio
async def test_generate_llm_response_gcp_injects_profile_prompt():
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "gcp recommended answer"
    mock_client.models.generate_content.return_value = mock_response

    profile_prompt = "Customer Profile:\n- Name: Taylor\n- Membership Tier: Gold"

    with patch("google.genai.Client", return_value=mock_client):
        result = await generate_llm_response(
            prompt="Best boots?",
            context="[]",
            user_name="Taylor",
            provider="gcp",
            project_id="proj",
            location="us-central1",
            model_name="gemini-2.5-flash",
            customer_profile={"profile_prompt": profile_prompt},
        )

    assert result == "gcp recommended answer"
    contents = mock_client.models.generate_content.call_args.kwargs["contents"]
    assert profile_prompt in contents
    assert contents.index(profile_prompt) < contents.index("Catalog Context:")


def test_generate_llm_response_stream_local_injects_profile_prompt():
    chunk = SimpleNamespace(choices=[SimpleNamespace(delta=SimpleNamespace(content="streamed"))])
    mock_completion = MagicMock(return_value=iter([chunk]))
    profile_prompt = "Customer Profile:\n- Name: Jordan"

    with patch.dict(
        sys.modules,
        {"litellm": SimpleNamespace(completion=mock_completion)},
    ), patch.dict(
        "os.environ",
        {"OLLAMA_BASE_URL": "http://ollama:11434", "LOCAL_MODEL_NAME": "mistral"},
        clear=False,
    ):
        chunks = list(
            generate_llm_response_stream(
                prompt="Any boots?",
                context="[]",
                user_name="Jordan",
                provider="local",
                project_id="unused",
                location="unused",
                model_name="unused",
                customer_profile={"profile_prompt": profile_prompt},
            )
        )

    assert chunks == ["streamed"]
    messages = mock_completion.call_args.kwargs["messages"]
    assert profile_prompt in messages[0]["content"]


def test_generate_llm_response_stream_gcp_injects_profile_prompt():
    mock_client = MagicMock()
    mock_chunk = MagicMock(text="gcp stream chunk")
    mock_client.models.generate_content_stream.return_value = iter([mock_chunk])
    profile_prompt = "Customer Profile:\n- Name: Jordan"

    with patch("google.genai.Client", return_value=mock_client):
        chunks = list(
            generate_llm_response_stream(
                prompt="Any boots?",
                context="[]",
                user_name="Jordan",
                provider="gcp",
                project_id="proj",
                location="us-central1",
                model_name="gemini-2.5-flash",
                profile_prompt=profile_prompt,
            )
        )

    assert chunks == ["gcp stream chunk"]
    contents = mock_client.models.generate_content_stream.call_args.kwargs["contents"]
    assert profile_prompt in contents
    assert contents.index(profile_prompt) < contents.index("Catalog Context:")


@pytest.mark.anyio
async def test_get_response_includes_customer_profile():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {
        "firstName": "Morgan",
        "membership": "Gold",
        "orders": [
            {"items": [{"product": {"name": "Tent", "category": "Tents"}}]},
            {"items": [{"product": {"name": "Boots", "category": "Footwear"}}]},
        ],
    }

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(return_value="Answer with profile"),
    ) as mock_llm:
        result = await get_response("cust-1", "Recommend gear", "[]")

    assert "customer_profile" in result
    assert result["customer_profile"]["membership"] == "Gold"
    assert result["customer_profile"]["past_purchases_count"] == 2
    mock_llm.assert_awaited_once()


@pytest.mark.anyio
async def test_get_response_stream_yields_profile_frame():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {
        "firstName": "Morgan",
        "membership": "Gold",
        "orders": [
            {"items": [{"product": {"name": "Tent", "category": "Tents"}}]},
            {"items": [{"product": {"name": "Boots", "category": "Footwear"}}]},
        ],
    }

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response_stream",
        return_value=iter(["chunk 1"]),
    ):
        stream = get_response_stream("cust-1", "Recommend gear", "[]")
        frames = [f async for f in stream]

    event_types = []
    profile_frame = None
    for frame in frames:
        if frame.startswith("data: "):
            data = json.loads(frame.removeprefix("data: "))
            if "event" in data:
                event_types.append(data["event"])
                if data["event"] == "profile":
                    profile_frame = data

    assert "citations" in event_types
    assert "handoff" in event_types
    assert "profile" in event_types
    assert profile_frame is not None
    assert profile_frame["profile"]["membership"] == "Gold"
    assert profile_frame["profile"]["past_purchases_count"] == 2


@pytest.mark.anyio
async def test_get_response_with_order_tracking_intent():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {
        "firstName": "Taylor",
        "membership": "Gold",
        "orders": [
            {
                "id": "CTSO-ORD-001",
                "date": "2026-09-12T10:00:00Z",
                "total": 129.99,
                "items": [{"id": 1}],
            }
        ],
    }

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(return_value="Your order CTSO-ORD-001 has shipped."),
    ) as mock_llm:
        result = await get_response("cust-1", "where is my order", "[]")

    assert "order_tracking" in result
    tracking = result["order_tracking"]
    assert tracking is not None
    assert tracking["order_id"] == "CTSO-ORD-001"
    assert "status" in tracking
    # Verify tracking guidance was passed to LLM
    mock_llm.assert_awaited_once()
    call_kwargs = mock_llm.await_args.kwargs
    assert "order_tracking_prompt" in call_kwargs or any(
        "CTSO-ORD-001" in str(arg) for arg in mock_llm.await_args.args
    ) or "CTSO-ORD-001" in str(call_kwargs.get("order_tracking_prompt", ""))


@pytest.mark.anyio
async def test_get_response_with_specific_order_id():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {
        "firstName": "Taylor",
        "membership": "Gold",
        "orders": [
            {
                "id": "CTSO-ORD-999",
                "date": "2026-09-13T09:00:00Z",
                "total": 50.0,
                "items": [],
            },
            {
                "id": "CTSO-ORD-123",
                "date": "2026-09-10T10:00:00Z",
                "total": 200.0,
                "items": [],
            },
        ],
    }

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(return_value="Your order CTSO-ORD-123 is delivered."),
    ):
        result = await get_response("cust-1", "track order CTSO-ORD-123", "[]")

    assert "order_tracking" in result
    assert result["order_tracking"]["order_id"] == "CTSO-ORD-123"


@pytest.mark.anyio
async def test_get_response_without_order_tracking_intent():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(return_value="We have great tents."),
    ):
        result = await get_response("cust-1", "Recommend a tent", "[]")

    assert result.get("order_tracking") is None


@pytest.mark.anyio
async def test_get_response_stream_yields_order_tracking_frame():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {
        "firstName": "Taylor",
        "membership": "Gold",
        "orders": [
            {
                "id": "CTSO-ORD-001",
                "date": "2026-09-12T10:00:00Z",
                "total": 129.99,
                "items": [{"id": 1}],
            }
        ],
    }

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response_stream",
        return_value=iter(["chunk 1"]),
    ):
        stream = get_response_stream("cust-1", "where is my order", "[]")
        frames = [f async for f in stream]

    event_types = []
    tracking_frame = None
    for frame in frames:
        if frame.startswith("data: "):
            data = json.loads(frame.removeprefix("data: "))
            if "event" in data:
                event_types.append(data["event"])
                if data["event"] == "order_tracking":
                    tracking_frame = data

    assert "order_tracking" in event_types
    assert tracking_frame is not None
    assert tracking_frame["order_tracking"]["order_id"] == "CTSO-ORD-001"


@pytest.mark.anyio
async def test_get_response_stream_omits_order_tracking_frame_when_no_intent():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response_stream",
        return_value=iter(["chunk 1"]),
    ):
        stream = get_response_stream("cust-1", "Recommend a tent", "[]")
        frames = [f async for f in stream]

    event_types = [
        json.loads(f.removeprefix("data: "))["event"]
        for f in frames
        if f.startswith("data: ") and "event" in json.loads(f.removeprefix("data: "))
    ]
    assert "order_tracking" not in event_types


@pytest.mark.anyio
async def test_get_response_with_promo_intent():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(return_value="You can use code WELCOME20 for 20% off!"),
    ) as mock_llm:
        result = await get_response("cust-1", "do you have any coupons?", "[]")

    assert "promotions" in result
    promotions = result["promotions"]
    assert isinstance(promotions, list)
    assert any(p["code"] == "WELCOME20" for p in promotions)

    mock_llm.assert_awaited_once()
    call_kwargs = mock_llm.await_args.kwargs
    assert "promo_prompt" in call_kwargs or any(
        "WELCOME20" in str(arg) for arg in mock_llm.await_args.args
    ) or "WELCOME20" in str(call_kwargs.get("promo_prompt", ""))


@pytest.mark.anyio
async def test_get_response_without_promo_intent():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(return_value="We have great tents."),
    ):
        result = await get_response("cust-1", "Recommend a tent", "[]")

    assert result.get("promotions") is None


@pytest.mark.anyio
async def test_get_response_stream_yields_promotions_frame():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response_stream",
        return_value=iter(["chunk 1"]),
    ):
        stream = get_response_stream("cust-1", "any discounts available?", "[]")
        frames = [f async for f in stream]

    event_types = []
    promo_frame = None
    for frame in frames:
        if frame.startswith("data: "):
            data = json.loads(frame.removeprefix("data: "))
            if "event" in data:
                event_types.append(data["event"])
                if data["event"] == "promotions":
                    promo_frame = data

    assert "promotions" in event_types
    assert promo_frame is not None
    assert any(p["code"] == "WELCOME20" for p in promo_frame["promotions"])


@pytest.mark.anyio
async def test_get_response_stream_omits_promotions_frame_when_no_intent():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response_stream",
        return_value=iter(["chunk 1"]),
    ):
        stream = get_response_stream("cust-1", "Recommend a tent", "[]")
        frames = [f async for f in stream]

    event_types = [
        json.loads(f.removeprefix("data: "))["event"]
        for f in frames
        if f.startswith("data: ") and "event" in json.loads(f.removeprefix("data: "))
    ]
    assert "promotions" not in event_types


@pytest.mark.anyio
async def test_generate_llm_response_local_provider_includes_promo_prompt():
    mock_completion = MagicMock(
        return_value=SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content="local promo answer"))]
        )
    )

    with patch.dict(
        sys.modules,
        {"litellm": SimpleNamespace(completion=mock_completion)},
    ), patch.dict(
        "os.environ",
        {"OLLAMA_BASE_URL": "http://ollama:11434", "LOCAL_MODEL_NAME": "mistral"},
        clear=False,
    ):
        result = await generate_llm_response(
            prompt="any coupons?",
            context="[]",
            user_name="Taylor",
            provider="local",
            project_id="unused",
            location="unused",
            model_name="unused",
            promo_prompt="Promotions: Use code WELCOME20",
        )

    assert result == "local promo answer"
    messages = mock_completion.call_args.kwargs["messages"]
    system_message = next(m["content"] for m in messages if m["role"] == "system")
    assert "Promotions: Use code WELCOME20" in system_message


@pytest.mark.anyio
async def test_generate_llm_response_gcp_provider_includes_promo_prompt():
    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = SimpleNamespace(text="gcp promo answer")
    mock_client_class = MagicMock(return_value=mock_client)

    with patch("google.genai.Client", mock_client_class):
        result = await generate_llm_response(
            prompt="any coupons?",
            context="[]",
            user_name="Taylor",
            provider="gcp",
            project_id="project-1",
            location="us-central1",
            model_name="gemini-2.5-flash",
            promo_prompt="Promotions: Use code WELCOME20",
        )

    assert result == "gcp promo answer"
    kwargs = mock_client.models.generate_content.call_args.kwargs
    sent_prompt = kwargs["contents"]
    assert "Promotions: Use code WELCOME20" in sent_prompt


@pytest.mark.anyio
async def test_get_response_with_policy_intent():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(return_value="We offer a 14-day price-match guarantee against authorized outdoor retailers!"),
    ) as mock_llm:
        result = await get_response("cust-1", "Can you match a lower price from REI?", "[]")

    assert "policy" in result
    policy = result["policy"]
    assert isinstance(policy, dict)
    assert policy["id"] == "price_match"

    mock_llm.assert_awaited_once()
    call_kwargs = mock_llm.await_args.kwargs
    assert "policy_prompt" in call_kwargs or any(
        "Price-Match" in str(arg) for arg in mock_llm.await_args.args
    ) or "Price-Match" in str(call_kwargs.get("policy_prompt", ""))


@pytest.mark.anyio
async def test_get_response_without_policy_intent():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(return_value="We have great tents."),
    ):
        result = await get_response("cust-1", "Recommend a tent", "[]")

    assert result.get("policy") is None


@pytest.mark.anyio
async def test_get_response_stream_yields_policy_frame():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response_stream",
        return_value=iter(["chunk 1"]),
    ):
        stream = get_response_stream("cust-1", "What is your return policy?", "[]")
        frames = [f async for f in stream]

    event_types = []
    policy_frame = None
    for frame in frames:
        if frame.startswith("data: "):
            data = json.loads(frame.removeprefix("data: "))
            if "event" in data:
                event_types.append(data["event"])
                if data["event"] == "policy":
                    policy_frame = data

    assert "policy" in event_types
    assert policy_frame is not None
    assert policy_frame["policy"]["id"] == "returns"


@pytest.mark.anyio
async def test_get_response_stream_omits_policy_frame_when_no_intent():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response_stream",
        return_value=iter(["chunk 1"]),
    ):
        stream = get_response_stream("cust-1", "Recommend a tent", "[]")
        frames = [f async for f in stream]

    event_types = [
        json.loads(f.removeprefix("data: "))["event"]
        for f in frames
        if f.startswith("data: ") and "event" in json.loads(f.removeprefix("data: "))
    ]
    assert "policy" not in event_types


@pytest.mark.anyio
async def test_generate_llm_response_local_provider_includes_policy_prompt():
    mock_completion = MagicMock(
        return_value=SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content="local policy answer"))]
        )
    )

    with patch.dict(
        sys.modules,
        {"litellm": SimpleNamespace(completion=mock_completion)},
    ), patch.dict(
        "os.environ",
        {"OLLAMA_BASE_URL": "http://ollama:11434", "LOCAL_MODEL_NAME": "mistral"},
        clear=False,
    ):
        result = await generate_llm_response(
            prompt="What is your return policy?",
            context="[]",
            user_name="Taylor",
            provider="local",
            project_id="unused",
            location="unused",
            model_name="unused",
            policy_prompt="Store Policy Grounding: Returns Policy",
        )

    assert result == "local policy answer"
    messages = mock_completion.call_args.kwargs["messages"]
    system_message = next(m["content"] for m in messages if m["role"] == "system")
    assert "Store Policy Grounding: Returns Policy" in system_message


@pytest.mark.anyio
async def test_generate_llm_response_gcp_provider_includes_policy_prompt():
    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = SimpleNamespace(text="gcp policy answer")
    mock_client_class = MagicMock(return_value=mock_client)

    with patch("google.genai.Client", mock_client_class):
        result = await generate_llm_response(
            prompt="What is your return policy?",
            context="[]",
            user_name="Taylor",
            provider="gcp",
            project_id="project-1",
            location="us-central1",
            model_name="gemini-2.5-flash",
            policy_prompt="Store Policy Grounding: Returns Policy",
        )

    assert result == "gcp policy answer"
    kwargs = mock_client.models.generate_content.call_args.kwargs
    sent_prompt = kwargs["contents"]
    assert "Store Policy Grounding: Returns Policy" in sent_prompt


@pytest.mark.anyio
async def test_get_response_stream_emits_status_events():
    product_context = [{'sku': 'sku-1', 'name': 'Trailmaster X4'}]
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = product_context

    with patch(
        'contoso_chat.chat_request.get_customer_from_postgres',
        new=AsyncMock(return_value={'firstName': 'Taylor', 'membership': 'Gold', 'orders': []}),
    ), patch(
        'contoso_chat.chat_request.get_search_service',
        return_value=mock_search_service,
    ), patch(
        'contoso_chat.chat_request.generate_llm_response_stream',
        return_value=iter(['streamed ', 'tokens']),
    ), patch.dict(
        'os.environ',
        {'PROJECT_ID': 'project-1', 'REGION': 'us-central1'},
        clear=True,
    ):
        stream = get_response_stream('cust-1', 'Best tent?', '[]')
        chunks = [chunk async for chunk in stream]

    parsed_events = [
        json.loads(c.removeprefix('data: '))
        for c in chunks
        if c.startswith('data: ')
    ]

    status_events = [e for e in parsed_events if e.get('event') == 'status']
    assert len(status_events) == 2
    assert status_events[0] == {
        'event': 'status',
        'status': 'searching_catalog',
        'message': 'Searching product catalog...',
    }
    assert status_events[1] == {
        'event': 'status',
        'status': 'generating_response',
        'message': 'Generating response...',
    }

    citations_idx = next(i for i, e in enumerate(parsed_events) if e.get('event') == 'citations')
    first_chunk_idx = next(i for i, e in enumerate(parsed_events) if 'chunk' in e)
    assert parsed_events[0]['event'] == 'status'
    assert parsed_events[0]['status'] == 'searching_catalog'
    assert parsed_events[1]['event'] == 'status'
    assert parsed_events[1]['status'] == 'generating_response'
    assert citations_idx > 1
    assert first_chunk_idx > citations_idx


@pytest.mark.anyio
async def test_get_response_with_store_hours_intent():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(return_value="The Denver Mountain Outpost closes at 7:00 PM on Saturday."),
    ) as mock_llm:
        result = await get_response("cust-1", "What time does the Denver store close on Saturday?", "[]")

    assert "stores" in result
    stores = result["stores"]
    assert isinstance(stores, list)
    assert len(stores) >= 1
    assert any(s["id"] == "denver" for s in stores)

    mock_llm.assert_awaited_once()
    call_kwargs = mock_llm.await_args.kwargs
    assert "store_prompt" in call_kwargs or any(
        "Denver" in str(arg) for arg in mock_llm.await_args.args
    ) or "Denver" in str(call_kwargs.get("store_prompt", ""))


@pytest.mark.anyio
async def test_get_response_with_store_location_intent():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(return_value="Our Seattle Flagship is located at 220 Pike Street."),
    ):
        result = await get_response("cust-1", "Where is your store in Seattle?", "[]")

    assert "stores" in result
    stores = result["stores"]
    assert isinstance(stores, list)
    assert any(s["id"] == "seattle" for s in stores)


@pytest.mark.anyio
async def test_get_response_without_store_intent():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(return_value="We have great tents."),
    ):
        result = await get_response("cust-1", "Recommend a tent", "[]")

    assert result.get("stores") is None


@pytest.mark.anyio
async def test_get_response_stream_yields_stores_frame():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response_stream",
        return_value=iter(["chunk 1"]),
    ):
        stream = get_response_stream("cust-1", "Do you have stores in Oregon with in-store pickup?", "[]")
        frames = [f async for f in stream]

    event_types = []
    stores_frame = None
    for frame in frames:
        if frame.startswith("data: "):
            data = json.loads(frame.removeprefix("data: "))
            if "event" in data:
                event_types.append(data["event"])
                if data["event"] == "stores":
                    stores_frame = data

    assert "stores" in event_types
    assert stores_frame is not None
    assert isinstance(stores_frame["stores"], list)
    assert any(s["id"] == "portland" for s in stores_frame["stores"])

    stores_idx = next(i for i, e in enumerate(event_types) if e == "stores")
    first_chunk_idx = next(i for i, f in enumerate(frames) if "chunk" in json.loads(f.removeprefix("data: ")))
    assert stores_idx < first_chunk_idx


@pytest.mark.anyio
async def test_get_response_stream_omits_stores_frame_when_no_intent():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response_stream",
        return_value=iter(["chunk 1"]),
    ):
        stream = get_response_stream("cust-1", "Recommend a tent", "[]")
        frames = [f async for f in stream]

    event_types = [
        json.loads(f.removeprefix("data: "))["event"]
        for f in frames
        if f.startswith("data: ") and "event" in json.loads(f.removeprefix("data: "))
    ]
    assert "stores" not in event_types


@pytest.mark.anyio
async def test_generate_llm_response_local_provider_includes_store_prompt():
    mock_completion = MagicMock(
        return_value=SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content="local store answer"))]
        )
    )

    with patch.dict(
        sys.modules,
        {"litellm": SimpleNamespace(completion=mock_completion)},
    ), patch.dict(
        "os.environ",
        {"OLLAMA_BASE_URL": "http://ollama:11434", "LOCAL_MODEL_NAME": "mistral"},
        clear=False,
    ):
        result = await generate_llm_response(
            prompt="What time does Denver store close on Saturday?",
            context="[]",
            user_name="Taylor",
            provider="local",
            project_id="unused",
            location="unused",
            model_name="unused",
            store_prompt="Store Locations & Hours Grounding: Denver Mountain Outpost",
        )

    assert result == "local store answer"
    messages = mock_completion.call_args.kwargs["messages"]
    system_message = next(m["content"] for m in messages if m["role"] == "system")
    assert "Store Locations & Hours Grounding: Denver Mountain Outpost" in system_message


@pytest.mark.anyio
async def test_generate_llm_response_gcp_provider_includes_store_prompt():
    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = SimpleNamespace(text="gcp store answer")
    mock_client_class = MagicMock(return_value=mock_client)

    with patch("google.genai.Client", mock_client_class):
        result = await generate_llm_response(
            prompt="What time does Denver store close on Saturday?",
            context="[]",
            user_name="Taylor",
            provider="gcp",
            project_id="project-1",
            location="us-central1",
            model_name="gemini-2.5-flash",
            store_prompt="Store Locations & Hours Grounding: Denver Mountain Outpost",
        )

    assert result == "gcp store answer"
    kwargs = mock_client.models.generate_content.call_args.kwargs
    sent_prompt = kwargs["contents"]
    assert "Store Locations & Hours Grounding: Denver Mountain Outpost" in sent_prompt


@pytest.mark.anyio
async def test_get_response_with_faq_intent():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(return_value="Our return policy gives you 30 days to return gear in original packaging."),
    ) as mock_llm:
        result = await get_response("cust-1", "What is your return policy?", "[]")

    assert "faq" in result
    faq_matches = result["faq"]
    assert isinstance(faq_matches, list)
    assert len(faq_matches) > 0
    assert any(item["faq_id"] == "returns" for item in faq_matches)

    mock_llm.assert_awaited_once()
    call_kwargs = mock_llm.await_args.kwargs
    assert "faq_prompt" in call_kwargs or any(
        "return policy" in str(arg).lower() for arg in mock_llm.await_args.args
    ) or "return policy" in str(call_kwargs.get("faq_prompt", "")).lower()


@pytest.mark.anyio
async def test_get_response_without_faq_intent():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(return_value="We have great tents."),
    ):
        result = await get_response("cust-1", "Recommend a tent for camping", "[]")

    assert result.get("faq") is None


@pytest.mark.anyio
async def test_get_response_stream_yields_faq_frame():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response_stream",
        return_value=iter(["chunk 1"]),
    ):
        stream = get_response_stream("cust-1", "What is your warranty coverage?", "[]")
        frames = [f async for f in stream]

    event_types = []
    faq_frame = None
    for frame in frames:
        if frame.startswith("data: "):
            data = json.loads(frame.removeprefix("data: "))
            if "event" in data:
                event_types.append(data["event"])
                if data["event"] == "faq":
                    faq_frame = data

    assert "faq" in event_types
    assert faq_frame is not None
    assert any(item["faq_id"] == "warranty" for item in faq_frame["faq"])


@pytest.mark.anyio
async def test_get_response_stream_omits_faq_frame_when_no_intent():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response_stream",
        return_value=iter(["chunk 1"]),
    ):
        stream = get_response_stream("cust-1", "Recommend a tent", "[]")
        frames = [f async for f in stream]

    event_types = [
        json.loads(f.removeprefix("data: "))["event"]
        for f in frames
        if f.startswith("data: ") and "event" in json.loads(f.removeprefix("data: "))
    ]
    assert "faq" not in event_types


@pytest.mark.anyio
async def test_generate_llm_response_local_provider_includes_faq_prompt():
    mock_completion = MagicMock(
        return_value=SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content="local faq answer"))]
        )
    )

    with patch.dict(
        sys.modules,
        {"litellm": SimpleNamespace(completion=mock_completion)},
    ), patch.dict(
        "os.environ",
        {"OLLAMA_BASE_URL": "http://ollama:11434", "LOCAL_MODEL_NAME": "mistral"},
        clear=False,
    ):
        result = await generate_llm_response(
            prompt="What is your return policy?",
            context="[]",
            user_name="Taylor",
            provider="local",
            project_id="unused",
            location="unused",
            model_name="unused",
            faq_prompt="Official Store FAQ: Returns are within 30 days.",
        )

    assert result == "local faq answer"
    messages = mock_completion.call_args.kwargs["messages"]
    system_message = next(m["content"] for m in messages if m["role"] == "system")
    assert "Official Store FAQ: Returns are within 30 days." in system_message


@pytest.mark.anyio
async def test_generate_llm_response_gcp_provider_includes_faq_prompt():
    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = SimpleNamespace(text="gcp faq answer")
    mock_client_class = MagicMock(return_value=mock_client)

    with patch("google.genai.Client", mock_client_class):
        result = await generate_llm_response(
            prompt="What is your return policy?",
            context="[]",
            user_name="Taylor",
            provider="gcp",
            project_id="project-1",
            location="us-central1",
            model_name="gemini-2.5-flash",
            faq_prompt="Official Store FAQ: Returns are within 30 days.",
        )

    assert result == "gcp faq answer"
    kwargs = mock_client.models.generate_content.call_args.kwargs
    sent_prompt = kwargs["contents"]
    assert "Official Store FAQ: Returns are within 30 days." in sent_prompt


@pytest.mark.anyio
async def test_get_response_with_sizing_intent():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(return_value="Size M is recommended for a 40 inch chest."),
    ) as mock_llm:
        result = await get_response("cust-1", "What size jacket should I get for a 40 inch chest?", "[]")

    assert "sizing" in result
    sizing_payload = result["sizing"]
    assert isinstance(sizing_payload, dict)
    assert sizing_payload["category"] in ("jackets", "apparel")
    assert "rows" in sizing_payload
    assert len(sizing_payload["rows"]) > 0

    mock_llm.assert_awaited_once()
    call_kwargs = mock_llm.await_args.kwargs
    assert "sizing_prompt" in call_kwargs
    assert "Sizing" in call_kwargs["sizing_prompt"]


@pytest.mark.anyio
async def test_get_response_without_sizing_intent():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(return_value="Here are our tents."),
    ):
        result = await get_response("cust-1", "Recommend a tent for camping", "[]")

    assert result.get("sizing") is None


@pytest.mark.anyio
async def test_get_response_stream_yields_sizing_frame():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response_stream",
        return_value=iter(["chunk 1"]),
    ):
        stream = get_response_stream("cust-1", "What size jacket should I get for a 40 inch chest?", "[]")
        frames = [f async for f in stream]

    event_types = []
    sizing_frame = None
    for frame in frames:
        if frame.startswith("data: "):
            data = json.loads(frame.removeprefix("data: "))
            if "event" in data:
                event_types.append(data["event"])
                if data["event"] == "sizing":
                    sizing_frame = data

    assert "sizing" in event_types
    assert sizing_frame is not None
    assert sizing_frame["sizing"]["category"] in ("jackets", "apparel")


@pytest.mark.anyio
async def test_get_response_stream_omits_sizing_frame_when_no_intent():
    mock_search = MagicMock()
    mock_search.search.return_value = []
    fake_customer = {"firstName": "Taylor", "membership": "Gold", "orders": []}

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value=fake_customer),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response_stream",
        return_value=iter(["chunk 1"]),
    ):
        stream = get_response_stream("cust-1", "Recommend a camp stove", "[]")
        frames = [f async for f in stream]

    event_types = []
    for frame in frames:
        if frame.startswith("data: "):
            data = json.loads(frame.removeprefix("data: "))
            if "event" in data:
                event_types.append(data["event"])

    assert "sizing" not in event_types


@pytest.mark.anyio
async def test_generate_llm_response_local_provider_includes_sizing_prompt():
    mock_litellm_completion = MagicMock(
        return_value=SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content="local sizing answer"))]
        )
    )

    with patch.dict("sys.modules", {"litellm": SimpleNamespace(completion=mock_litellm_completion)}):
        result = await generate_llm_response(
            prompt="What size jacket for 40 inch chest?",
            context="[]",
            user_name="Taylor",
            provider="local",
            project_id=None,
            location=None,
            model_name="gemma3:12b",
            sizing_prompt="Sizing Guide: Jackets. Recommended Size: M.",
        )

    assert result == "local sizing answer"
    mock_litellm_completion.assert_called_once()
    kwargs = mock_litellm_completion.call_args.kwargs
    messages = kwargs["messages"]
    system_msg = next((m["content"] for m in messages if m["role"] == "system"), "")
    assert "Sizing Guide: Jackets. Recommended Size: M." in system_msg


@pytest.mark.anyio
async def test_generate_llm_response_gcp_provider_includes_sizing_prompt():
    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = SimpleNamespace(text="gcp sizing answer")
    mock_client_class = MagicMock(return_value=mock_client)

    with patch("google.genai.Client", mock_client_class):
        result = await generate_llm_response(
            prompt="What size jacket for 40 inch chest?",
            context="[]",
            user_name="Taylor",
            provider="gcp",
            project_id="project-1",
            location="us-central1",
            model_name="gemini-2.5-flash",
            sizing_prompt="Sizing Guide: Jackets. Recommended Size: M.",
        )

    assert result == "gcp sizing answer"
    kwargs = mock_client.models.generate_content.call_args.kwargs
    sent_prompt = kwargs["contents"]
    assert "Sizing Guide: Jackets. Recommended Size: M." in sent_prompt
