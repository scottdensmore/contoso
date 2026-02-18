import urllib.error
from unittest.mock import patch

from local_provider_health import evaluate_local_provider_health


@patch.dict("os.environ", {"LLM_PROVIDER": "gcp"}, clear=True)
def test_non_local_provider_skips_checks():
    health = evaluate_local_provider_health()
    assert health["enabled"] is False
    assert health["ready"] is True
    assert health["warnings"] == []
    assert health["errors"] == []


@patch.dict("os.environ", {"LLM_PROVIDER": "local"}, clear=True)
@patch("local_provider_health._missing_python_packages", return_value=["chromadb"])
@patch("local_provider_health._fetch_ollama_models", return_value=["gemma3:12b"])
def test_local_provider_reports_missing_python_packages(
    _mock_fetch_ollama_models, _mock_missing_python_packages
):
    health = evaluate_local_provider_health()
    assert health["enabled"] is True
    assert health["ready"] is False
    assert health["missing_python_packages"] == ["chromadb"]
    assert any("Missing local-provider Python packages" in error for error in health["errors"])


@patch.dict(
    "os.environ",
    {
        "LLM_PROVIDER": "local",
        "LOCAL_MODEL_NAME": "gemma3:12b",
        "OLLAMA_BASE_URL": "http://ollama:11434",
    },
    clear=True,
)
@patch("local_provider_health._missing_python_packages", return_value=[])
@patch("local_provider_health._fetch_ollama_models", return_value=["gemma3:12b", "phi4"])
def test_local_provider_ready_when_model_exists(_mock_fetch_ollama_models, _mock_missing_python_packages):
    health = evaluate_local_provider_health()
    assert health["enabled"] is True
    assert health["ready"] is True
    assert health["ollama_reachable"] is True
    assert health["model_available"] is True
    assert health["errors"] == []


@patch.dict(
    "os.environ",
    {
        "LLM_PROVIDER": "local",
        "LOCAL_MODEL_NAME": "gemma3:12b",
        "OLLAMA_BASE_URL": "http://ollama:11434",
    },
    clear=True,
)
@patch("local_provider_health._missing_python_packages", return_value=[])
@patch("local_provider_health._fetch_ollama_models", return_value=["phi4"])
def test_local_provider_reports_missing_model(_mock_fetch_ollama_models, _mock_missing_python_packages):
    health = evaluate_local_provider_health()
    assert health["enabled"] is True
    assert health["ready"] is False
    assert health["model_available"] is False
    assert any("LOCAL_MODEL_NAME" in error for error in health["errors"])


@patch.dict(
    "os.environ",
    {
        "LLM_PROVIDER": "local",
        "LOCAL_MODEL_NAME": "gemma3:12b",
        "OLLAMA_BASE_URL": "http://host.docker.internal:11434",
    },
    clear=True,
)
@patch("local_provider_health._missing_python_packages", return_value=[])
@patch(
    "local_provider_health._fetch_ollama_models",
    side_effect=[urllib.error.URLError("host not found"), ["gemma3:12b"]],
)
def test_local_provider_uses_localhost_fallback_for_host_docker_internal(
    mock_fetch_ollama_models, _mock_missing_python_packages
):
    health = evaluate_local_provider_health()
    assert health["enabled"] is True
    assert health["ready"] is True
    assert health["ollama_reachable"] is True
    assert health["effective_ollama_base_url"] == "http://localhost:11434"
    assert any("fell back to http://localhost:11434" in warning for warning in health["warnings"])
    assert mock_fetch_ollama_models.call_count == 2
