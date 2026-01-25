import pytest
import os
import sys
from pathlib import Path

# Add the src/api directory to the Python path
api_dir = Path(__file__).parent.parent / "src" / "api"
sys.path.insert(0, str(api_dir))

@pytest.fixture(scope="session")
def service_url():
    """Get the service URL for integration tests"""
    return os.environ.get("SERVICE_URL", "http://localhost:80")

@pytest.fixture
def mock_env_vars(monkeypatch):
    """Set up mock environment variables for testing"""
    monkeypatch.setenv("PROJECT_ID", "test-project")
    monkeypatch.setenv("REGION", "us-central1")
    monkeypatch.setenv("GEMINI_MODEL_NAME", "gemini-2.5-flash")

@pytest.fixture
def sample_chat_request():
    """Sample chat request data for tests"""
    return {
        "question": "What are the best camping tents?",
        "customer_id": "1",
        "chat_history": "[]"
    }

@pytest.fixture
def sample_chat_response():
    """Sample chat response data for tests"""
    return {
        "answer": "We have excellent camping tents available including the Alpine Explorer Tent.",
        "context": [
            {
                "id": "1",
                "title": "Alpine Explorer Tent",
                "content": "8-person tent with excellent weather protection"
            }
        ],
        "customer_id": "1"
    }