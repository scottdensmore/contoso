import json
import sys
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from contoso_chat.chat_request import (
    generate_llm_response,
    get_customer_from_postgres,
    get_response,
)


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.anyio
async def test_get_customer_from_postgres_returns_none_for_empty_id():
    with patch("contoso_chat.chat_request.Prisma") as mock_prisma:
        result = await get_customer_from_postgres("")

    assert result is None
    mock_prisma.assert_not_called()


@pytest.mark.anyio
async def test_get_customer_from_postgres_returns_customer_dump():
    mock_db = MagicMock()
    mock_db.connect = AsyncMock()
    mock_db.disconnect = AsyncMock()
    mock_user = MagicMock()
    mock_user.model_dump.return_value = {"firstName": "Taylor"}
    mock_db.user.find_unique = AsyncMock(return_value=mock_user)

    with patch("contoso_chat.chat_request.Prisma", return_value=mock_db):
        result = await get_customer_from_postgres("cust-1")

    assert result == {"firstName": "Taylor"}
    mock_db.connect.assert_awaited_once()
    mock_db.user.find_unique.assert_awaited_once()
    mock_db.disconnect.assert_awaited_once()


@pytest.mark.anyio
async def test_get_customer_from_postgres_returns_none_when_missing():
    mock_db = MagicMock()
    mock_db.connect = AsyncMock()
    mock_db.disconnect = AsyncMock()
    mock_db.user.find_unique = AsyncMock(return_value=None)

    with patch("contoso_chat.chat_request.Prisma", return_value=mock_db):
        result = await get_customer_from_postgres("cust-1")

    assert result is None
    mock_db.connect.assert_awaited_once()
    mock_db.user.find_unique.assert_awaited_once()
    mock_db.disconnect.assert_awaited_once()


@pytest.mark.anyio
async def test_get_customer_from_postgres_returns_none_on_exception():
    mock_db = MagicMock()
    mock_db.connect = AsyncMock(side_effect=RuntimeError("db down"))
    mock_db.disconnect = AsyncMock()

    with patch("contoso_chat.chat_request.Prisma", return_value=mock_db):
        result = await get_customer_from_postgres("cust-1")

    assert result is None
    mock_db.connect.assert_awaited_once()


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
async def test_generate_llm_response_gcp_provider():
    mock_init = MagicMock()
    mock_part = MagicMock(return_value="prompt-part")
    mock_model_instance = MagicMock()
    mock_model_instance.generate_content.return_value = SimpleNamespace(text="gcp answer")
    mock_model_class = MagicMock(return_value=mock_model_instance)

    with patch.dict(
        sys.modules,
        {
            "vertexai": SimpleNamespace(init=mock_init),
            "vertexai.generative_models": SimpleNamespace(
                GenerativeModel=mock_model_class,
                Part=SimpleNamespace(from_text=mock_part),
            ),
        },
    ):
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
    mock_init.assert_called_once_with(project="project-1", location="us-central1")
    mock_model_class.assert_called_once_with("gemini-2.5-flash")
    mock_part.assert_called_once()
    mock_model_instance.generate_content.assert_called_once_with(["prompt-part"])


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
    )
