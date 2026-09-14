import json
import sys
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from contoso_chat.chat_request import (
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

    assert chunks == [
        f"data: {json.dumps({'event': 'citations', 'citations': [{'name': 'Trailmaster X4', 'slug': None, 'price': None, 'image': None, 'category': None}]})}\n\n",
        f"data: {json.dumps({'event': 'handoff', 'handoff': {'requested': False, 'reason': None, 'suggested_action': None, 'support_contact': None}})}\n\n",
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

    assert len(events) == 4
    assert events[0] == f"data: {json.dumps({'event': 'citations', 'citations': [{'name': 'Trailmaster X4', 'slug': 'trailmaster-x4', 'price': 150, 'image': '/images/trailmaster.webp', 'category': 'Tents'}]})}\n\n"
    assert events[1] == f"data: {json.dumps({'event': 'handoff', 'handoff': {'requested': False, 'reason': None, 'suggested_action': None, 'support_contact': None}})}\n\n"
    assert events[2] == f"data: {json.dumps({'chunk': 'chunk 1 '})}\n\n"
    assert events[3] == f"data: {json.dumps({'chunk': 'chunk 2'})}\n\n"


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

    assert len(frames) >= 2
    citations_data = json.loads(frames[0].removeprefix("data: "))
    assert citations_data.get("event") == "citations"

    handoff_data = json.loads(frames[1].removeprefix("data: "))
    assert handoff_data.get("event") == "handoff"
    assert handoff_data["handoff"]["requested"] is True
    assert handoff_data["handoff"]["reason"] == "dispute_or_refund"
    assert handoff_data["handoff"]["suggested_action"] == "support_ticket"
