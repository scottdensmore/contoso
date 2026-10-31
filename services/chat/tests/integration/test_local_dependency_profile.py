"""Offline integration checks for the installed full profile.

Run this file explicitly after setup-full. No Ollama server, cloud credentials,
model download or GPU is needed. Embeddings and completions are deterministic
fixtures; the installed Chroma/LiteLLM APIs and application adapters are real.
"""

import asyncio
import builtins
import os
import socket
from functools import partial
from unittest.mock import patch

import pytest


@pytest.fixture(autouse=True)
def offline_profile(monkeypatch, tmp_path):
    monkeypatch.setenv("ANONYMIZED_TELEMETRY", "False")
    monkeypatch.setenv("LITELLM_LOCAL_MODEL_COST_MAP", "True")
    monkeypatch.setenv("HF_HUB_OFFLINE", "1")
    monkeypatch.setenv("CHROMA_DB_PATH", str(tmp_path / "chroma"))
    monkeypatch.setenv("OLLAMA_BASE_URL", "http://unused.invalid:11434")
    monkeypatch.setenv("LOCAL_MODEL_NAME", "profile-smoke")
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.delenv("GOOGLE_APPLICATION_CREDENTIALS", raising=False)

    def no_network(*args, **kwargs):
        raise AssertionError("The dependency profile smoke test must stay offline")

    monkeypatch.setattr(socket, "getaddrinfo", no_network)
    monkeypatch.setattr(socket.socket, "connect", no_network)


def test_local_profile_keeps_default_onnx_embedding_without_torch():
    original_import = builtins.__import__

    def without_unused_stack(name, *args, **kwargs):
        if name.split(".")[0] in {"torch", "sentence_transformers"}:
            raise AssertionError("The configured default embedding must not import PyTorch")
        return original_import(name, *args, **kwargs)

    # Existing users may still have these unused distributions installed. Their
    # presence is harmless; the configured embedding path must not use them.
    with patch("builtins.__import__", side_effect=without_unused_stack):
        from chromadb.utils import embedding_functions

        default = embedding_functions.DefaultEmbeddingFunction()
        assert default.name() == "default"
        # Exercise backend selection, replacing only the inference object that
        # would otherwise download Chroma's ONNX model on first use.
        with patch(
            "chromadb.utils.embedding_functions.onnx_mini_lm_l6_v2.ONNXMiniLM_L6_V2"
        ) as onnx:
            onnx.return_value.return_value = [[1.0, 0.0]]
            vectors = default(["tent"])
        onnx.assert_called_once_with()
        onnx.return_value.assert_called_once_with(["tent"])
        assert list(vectors[0]) == [1.0, 0.0]



def test_local_vector_adapter_with_real_chroma_and_fixture_embeddings():
    import chromadb
    import contoso_chat.search_service as search_service
    from chromadb.api.types import Documents, EmbeddingFunction
    from chromadb.config import Settings

    class FixtureEmbedding(EmbeddingFunction[Documents]):
        def __init__(self):
            pass

        def get_config(self):
            return {}

        @staticmethod
        def build_from_config(config):
            return FixtureEmbedding()

        def __call__(self, input):
            return [[1.0, 0.0] for _ in input]

        @staticmethod
        def name():
            return "offline-profile-fixture"

    client = chromadb.PersistentClient(
        path=os.environ["CHROMA_DB_PATH"],
        settings=Settings(anonymized_telemetry=False),
    )
    embedding = FixtureEmbedding()
    collection = client.create_collection("products", embedding_function=embedding)
    collection.add(ids=["tent"], documents=["A trail tent"], metadatas=[{"sku": "tent"}])
    with patch.object(search_service.embedding_functions, "DefaultEmbeddingFunction", return_value=embedding):
        service = search_service.LocalVectorSearch()
        result = service.search("tent", limit=1)
    assert result == [{"sku": "tent", "content": "A trail tent"}]


def test_local_llm_adapter_with_real_litellm_mock_response():
    import litellm
    from contoso_chat.chat_request import generate_llm_response

    # LiteLLM's own mock-response mode exercises its response models without
    # calling Ollama; only inference output is substituted, not the package.
    completion = partial(litellm.completion, mock_response="offline answer")
    with patch.object(litellm, "completion", completion):
        result = asyncio.run(generate_llm_response(
            prompt="A tent?", context="[]", user_name="Taylor", provider="local",
            project_id=None, location=None, model_name="unused",
        ))
    assert result == "offline answer"
