import os
import sys
from unittest.mock import patch

from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../src/api"))

from main import ChatRequest, app

client = TestClient(app)


def test_web_payload_contract_validates_against_chat_request_model():
    payload = {
        "question": "Recommend a backpack",
        "customer_id": "1",
        "chat_history": "[]",
    }

    request = ChatRequest(**payload)
    assert request.question == payload["question"]
    assert request.customer_id == payload["customer_id"]
    assert request.chat_history == payload["chat_history"]


@patch("main.get_response")
def test_chat_response_contract_includes_answer_for_web_consumer(mock_get_response):
    mock_get_response.return_value = {
        "question": "Recommend a backpack",
        "answer": "Try the TrailPro Backpack.",
        "context": [],
        "customer_id": "1",
    }

    with patch("main.REAL_CHAT_AVAILABLE", True):
        response = client.post(
            "/api/create_response",
            json={
                "question": "Recommend a backpack",
                "customer_id": "1",
                "chat_history": "[]",
            },
        )

    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert isinstance(data["answer"], str)
    assert data["answer"]
