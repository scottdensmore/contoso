import os

import pytest
import requests
from dotenv import load_dotenv

load_dotenv()

# Get service URL from environment or use localhost for local testing
SERVICE_URL = os.environ.get("SERVICE_URL", "http://localhost:80")

def test_health_endpoint():
    """Test the health check endpoint"""
    response = requests.get(f"{SERVICE_URL}/health")
    assert response.status_code == 200

    data = response.json()
    assert "status" in data
    assert data["status"] == "healthy"

def test_root_endpoint():
    """Test the root endpoint"""
    response = requests.get(f"{SERVICE_URL}/")
    assert response.status_code == 200

    data = response.json()
    assert "message" in data
    assert "version" in data
    assert "status" in data

def test_create_response_basic():
    """Test basic chat response functionality"""
    payload = {
        "question": "What are the best tents?",
        "customer_id": "1",
        "chat_history": "[]"
    }

    response = requests.post(
        f"{SERVICE_URL}/api/create_response",
        json=payload
    )

    assert response.status_code == 200

    data = response.json()
    # Check for either real response format or mock response format
    assert ("answer" in data) or ("response" in data)

    if "answer" in data:
        # Real chat response format
        assert "context" in data
        assert data["customer_id"] == "1"
    else:
        # Mock response format
        assert "response" in data
        assert data["customer_id"] == "1"

def test_create_response_with_customer():
    """Test chat response with different customer ID"""
    payload = {
        "question": "Do you have hiking boots?",
        "customer_id": "5",
        "chat_history": "[]"
    }

    response = requests.post(
        f"{SERVICE_URL}/api/create_response",
        json=payload
    )

    assert response.status_code == 200

    data = response.json()
    assert data["customer_id"] == "5"

def test_create_response_with_chat_history():
    """Test chat response with chat history"""
    payload = {
        "question": "What about waterproof options?",
        "customer_id": "1",
        "chat_history": '[{"role": "user", "content": "Tell me about tents"}, {"role": "assistant", "content": "We have great tents available"}]'
    }

    response = requests.post(
        f"{SERVICE_URL}/api/create_response",
        json=payload
    )

    assert response.status_code == 200

    data = response.json()
    assert ("answer" in data) or ("response" in data)

def test_create_response_invalid_payload():
    """Test error handling with invalid payload"""
    # Missing required question field
    payload = {
        "customer_id": "1",
        "chat_history": "[]"
    }

    response = requests.post(
        f"{SERVICE_URL}/api/create_response",
        json=payload
    )

    # Should return 422 for validation error
    assert response.status_code == 422

@pytest.mark.skipif(
    os.environ.get("SKIP_INTEGRATION_TESTS") == "true",
    reason="Integration tests skipped"
)
def test_response_time():
    """Test that responses are reasonably fast"""
    import time

    payload = {
        "question": "Hello",
        "customer_id": "1",
        "chat_history": "[]"
    }

    start_time = time.time()
    response = requests.post(
        f"{SERVICE_URL}/api/create_response",
        json=payload
    )
    end_time = time.time()

    assert response.status_code == 200

    # Response should be under 30 seconds
    response_time = end_time - start_time
    assert response_time < 30.0, f"Response took {response_time} seconds"
