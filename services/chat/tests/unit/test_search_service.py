from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import contoso_chat.search_service as search_service
import pytest
from contoso_chat.search_service import LocalVectorSearch, VertexAISearch, get_search_service


def test_local_vector_search_formats_results():
    mock_collection = MagicMock()
    mock_collection.query.return_value = {
        "metadatas": [[{"sku": "abc123"}]],
        "documents": [["Trail-ready tent"]],
    }
    mock_client = MagicMock()
    mock_client.get_collection.return_value = mock_collection

    with patch("contoso_chat.search_service.chromadb.PersistentClient", return_value=mock_client), patch(
        "contoso_chat.search_service.embedding_functions.DefaultEmbeddingFunction",
        return_value="embedding-fn",
    ):
        service = LocalVectorSearch()

    results = service.search("best tent", limit=3)

    assert results == [{"sku": "abc123", "content": "Trail-ready tent"}]
    mock_collection.query.assert_called_once_with(query_texts=["best tent"], n_results=3)


def test_local_vector_search_returns_empty_on_init_error():
    mock_client = MagicMock()
    mock_client.get_collection.side_effect = RuntimeError("failed to load collection")

    with patch("contoso_chat.search_service.chromadb.PersistentClient", return_value=mock_client), patch(
        "contoso_chat.search_service.embedding_functions.DefaultEmbeddingFunction",
        return_value="embedding-fn",
    ):
        service = LocalVectorSearch()

    assert service.collection is None
    assert service.search("anything") == []


def test_vertex_ai_search_returns_document_dicts():
    mock_client = MagicMock()
    mock_client.search.return_value = SimpleNamespace(results=[SimpleNamespace(document="doc-1")])

    with patch(
        "contoso_chat.search_service.discoveryengine.SearchServiceClient",
        return_value=mock_client,
    ), patch(
        "contoso_chat.search_service.discoveryengine.SearchRequest",
        side_effect=lambda **kwargs: kwargs,
    ) as mock_request, patch(
        "contoso_chat.search_service.discoveryengine.Document.to_dict",
        return_value={"id": "doc-1"},
    ) as mock_to_dict:
        service = VertexAISearch("project-1", "us-central1", "search-app-1")
        results = service.search("tent", limit=2)

    assert results == [{"id": "doc-1"}]
    mock_request.assert_called_once_with(
        serving_config=service.serving_config,
        query="tent",
        page_size=2,
    )
    mock_to_dict.assert_called_once_with("doc-1")


def test_vertex_ai_search_returns_empty_on_error():
    mock_client = MagicMock()
    mock_client.search.side_effect = RuntimeError("search error")

    with patch(
        "contoso_chat.search_service.discoveryengine.SearchServiceClient",
        return_value=mock_client,
    ), patch(
        "contoso_chat.search_service.discoveryengine.SearchRequest",
        side_effect=lambda **kwargs: kwargs,
    ):
        service = VertexAISearch("project-1", "us-central1", "search-app-1")
        results = service.search("tent")

    assert results == []


def test_get_search_service_returns_local_provider():
    local_service = object()
    with patch.dict("os.environ", {"LLM_PROVIDER": "local"}, clear=True), patch(
        "contoso_chat.search_service.LocalVectorSearch",
        return_value=local_service,
    ) as mock_local:
        result = get_search_service()

    assert result is local_service
    mock_local.assert_called_once_with()


def test_get_search_service_local_requires_optional_dependencies():
    with patch.dict("os.environ", {"LLM_PROVIDER": "local"}, clear=True), patch.object(
        search_service,
        "chromadb",
        SimpleNamespace(PersistentClient=None),
    ), patch.object(
        search_service,
        "embedding_functions",
        SimpleNamespace(DefaultEmbeddingFunction=None),
    ):
        with pytest.raises(
            RuntimeError,
            match="Local vector search dependencies are not installed",
        ):
            get_search_service()


def test_get_search_service_requires_vertex_env_vars():
    with patch.dict("os.environ", {"LLM_PROVIDER": "gcp"}, clear=True):
        with pytest.raises(
            ValueError,
            match="PROJECT_ID, REGION, and DISCOVERY_ENGINE_DATASTORE_ID must be set",
        ):
            get_search_service()


def test_get_search_service_returns_vertex_provider():
    vertex_service = object()
    with patch.dict(
        "os.environ",
        {
            "LLM_PROVIDER": "gcp",
            "PROJECT_ID": "project-1",
            "REGION": "us-central1",
            "DISCOVERY_ENGINE_DATASTORE_ID": "search-app-1",
        },
        clear=True,
    ), patch("contoso_chat.search_service.VertexAISearch", return_value=vertex_service) as mock_vertex:
        result = get_search_service()

    assert result is vertex_service
    mock_vertex.assert_called_once_with("project-1", "us-central1", "search-app-1")
