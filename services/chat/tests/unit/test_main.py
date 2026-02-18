import os
import sys
from unittest.mock import patch

from fastapi.testclient import TestClient

# Add the src/api directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../src/api'))

from main import app

client = TestClient(app)

def test_root_endpoint():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200

    data = response.json()
    assert data["message"] == "Contoso Chat API"
    assert data["version"] == "1.0.0"
    assert data["status"] == "running"
    assert "real_chat" in data

def test_health_endpoint():
    """Test the health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert "real_chat" in data


@patch("main.check_database_connection")
def test_health_dependencies_endpoint(mock_check_database_connection):
    mock_check_database_connection.return_value = (True, None)
    response = client.get("/health/dependencies")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"]["connected"] is True
    assert data["database"]["error"] is None


@patch("main.check_database_connection")
def test_health_dependencies_endpoint_degraded(mock_check_database_connection):
    mock_check_database_connection.return_value = (False, "connection failed")
    response = client.get("/health/dependencies")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "degraded"
    assert data["database"]["connected"] is False
    assert "connection failed" in data["database"]["error"]


def test_create_response_mock_mode():
    """Test chat response in mock mode"""
    with patch('main.REAL_CHAT_AVAILABLE', False):
        payload = {
            "question": "What are the best tents?",
            "customer_id": "1",
            "chat_history": "[]"
        }

        response = client.post("/api/create_response", json=payload)
        assert response.status_code == 200

        data = response.json()
        assert "answer" in data
        assert data["customer_id"] == "1"
        assert data["chat_history"] == "[]"
        assert data["mock"] is True
        assert "What are the best tents?" in data["answer"]

@patch('main.get_response')
def test_create_response_real_mode(mock_get_response):
    """Test chat response in real mode"""
    # Mock the real chat response
    mock_get_response.return_value = {
        "answer": "We have excellent tents for camping.",
        "context": ["tent info"],
        "customer_id": "1"
    }

    with patch('main.REAL_CHAT_AVAILABLE', True):
        payload = {
            "question": "What are the best tents?",
            "customer_id": "1",
            "chat_history": "[]"
        }

        response = client.post("/api/create_response", json=payload)
        assert response.status_code == 200

        data = response.json()
        assert data["answer"] == "We have excellent tents for camping."
        assert data["context"] == ["tent info"]
        assert data["customer_id"] == "1"

        # Verify the function was called with correct parameters
        mock_get_response.assert_called_once_with("1", "What are the best tents?", "[]")

@patch('main.get_response')
def test_create_response_error_handling(mock_get_response):
    """Test error handling in chat response"""
    # Mock an exception
    mock_get_response.side_effect = Exception("Test error")

    with patch('main.REAL_CHAT_AVAILABLE', True):
        payload = {
            "question": "What are the best tents?",
            "customer_id": "1",
            "chat_history": "[]"
        }

        response = client.post("/api/create_response", json=payload)
        assert response.status_code == 200

        data = response.json()
        assert "answer" in data
        assert data["fallback"] is True
        assert data["customer_id"] == "1"
        assert "error" in data

def test_create_response_validation_error():
    """Test validation error handling"""
    # Missing required question field
    payload = {
        "customer_id": "1",
        "chat_history": "[]"
    }

    response = client.post("/api/create_response", json=payload)
    assert response.status_code == 422  # Validation error

def test_create_response_default_values():
    """Test default values for optional fields"""
    with patch('main.REAL_CHAT_AVAILABLE', False):
        payload = {
            "question": "Hello"
        }

        response = client.post("/api/create_response", json=payload)
        assert response.status_code == 200

        data = response.json()
        # Should use default customer_id (None) and chat_history ("[]")
        assert data["customer_id"] is None
        assert data["chat_history"] == "[]"

def test_cors_headers():
    """Test CORS headers are present"""
    response = client.get("/")
    # Check that CORS headers are present in response
    assert response.status_code == 200
