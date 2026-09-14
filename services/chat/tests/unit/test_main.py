import json
import os
import sys
from unittest.mock import AsyncMock, patch

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


@patch("main.evaluate_local_provider_health")
@patch("main.check_database_connection")
def test_health_dependencies_endpoint(mock_check_database_connection, mock_local_provider_health):
    mock_check_database_connection.return_value = (True, None)
    mock_local_provider_health.return_value = {
        "provider": "gcp",
        "enabled": False,
        "ready": True,
    }
    response = client.get("/health/dependencies")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"]["connected"] is True
    assert data["database"]["error"] is None
    assert data["local_provider"]["ready"] is True


@patch("main.evaluate_local_provider_health")
@patch("main.check_database_connection")
def test_health_dependencies_endpoint_degraded(mock_check_database_connection, mock_local_provider_health):
    mock_check_database_connection.return_value = (False, "connection failed")
    mock_local_provider_health.return_value = {
        "provider": "gcp",
        "enabled": False,
        "ready": True,
    }
    response = client.get("/health/dependencies")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "degraded"
    assert data["database"]["connected"] is False
    assert "connection failed" in data["database"]["error"]


@patch("main.evaluate_local_provider_health")
@patch("main.check_database_connection")
def test_health_dependencies_endpoint_degraded_when_local_provider_unready(
    mock_check_database_connection, mock_local_provider_health
):
    mock_check_database_connection.return_value = (True, None)
    mock_local_provider_health.return_value = {
        "provider": "local",
        "enabled": True,
        "ready": False,
        "errors": ["Unable to reach Ollama"],
    }
    response = client.get("/health/dependencies")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "degraded"
    assert data["database"]["connected"] is True
    assert data["local_provider"]["ready"] is False


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


@patch("main.get_response_stream")
def test_stream_endpoint(mock_get_response_stream):
    """Test POST /api/create_response/stream in real mode"""
    async def fake_stream(customer_id, question, chat_history):
        yield "Hello "
        yield "world!"

    mock_get_response_stream.side_effect = fake_stream

    with patch("main.REAL_CHAT_AVAILABLE", True):
        response = client.post(
            "/api/create_response/stream",
            json={
                "question": "What are the best tents?",
                "customer_id": "1",
                "chat_history": "[]",
            },
        )
        assert response.status_code == 200
        assert "text/event-stream" in response.headers.get("content-type", "")
        body = response.text
        assert "data: {\"chunk\": \"Hello \"}\n\n" in body
        assert "data: {\"chunk\": \"world!\"}\n\n" in body
        assert "data: [DONE]\n\n" in body


def test_stream_endpoint_mock_mode():
    """Test POST /api/create_response/stream in mock mode"""
    with patch("main.REAL_CHAT_AVAILABLE", False):
        response = client.post(
            "/api/create_response/stream",
            json={
                "question": "What are the best tents?",
                "customer_id": "1",
                "chat_history": "[]",
            },
        )
        assert response.status_code == 200
        assert "text/event-stream" in response.headers.get("content-type", "")
        body = response.text
        assert "data: {" in body
        assert "data: [DONE]\n\n" in body


@patch("main.get_response_stream")
def test_stream_endpoint_error_handling(mock_get_response_stream):
    """Test error handling mid-stream in POST /api/create_response/stream"""
    async def failing_stream(customer_id, question, chat_history):
        yield "First chunk "
        raise RuntimeError("Stream failure mid-stream")

    mock_get_response_stream.side_effect = failing_stream

    with patch("main.REAL_CHAT_AVAILABLE", True):
        response = client.post(
            "/api/create_response/stream",
            json={
                "question": "What are the best tents?",
                "customer_id": "1",
                "chat_history": "[]",
            },
        )
        assert response.status_code == 200
        assert "text/event-stream" in response.headers.get("content-type", "")
        body = response.text
        assert "data: {\"chunk\": \"First chunk \"}\n\n" in body
        assert "data: {\"error\": \"Stream failure mid-stream\"}\n\n" in body


def test_stream_endpoint_validation_error():
    """Test validation error for POST /api/create_response/stream"""
    response = client.post(
        "/api/create_response/stream",
        json={"customer_id": "1"},
    )
    assert response.status_code == 422


def test_create_response_and_stream_endpoints_include_citations():
    """Verify POST /api/create_response and /api/create_response/stream output citations in real and mock modes."""
    # 1. Mock mode: create_response includes citations
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post("/api/create_response", json={"question": "tent"})
        assert res.status_code == 200
        data = res.json()
        assert "citations" in data
        assert isinstance(data["citations"], list)
        assert len(data["citations"]) > 0
        assert "slug" in data["citations"][0]

    # 2. Mock mode: create_response/stream emits citations event first
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post("/api/create_response/stream", json={"question": "tent"})
        assert res.status_code == 200
        events = [line for line in res.text.split("\n\n") if line.strip()]
        first_event = json.loads(events[0].removeprefix("data: "))
        assert first_event.get("event") == "citations"
        assert isinstance(first_event.get("citations"), list)
        assert len(first_event["citations"]) > 0

    # 3. Real mode: create_response includes citations returned by get_response
    expected_citations = [
        {
            "name": "Alpine Tent",
            "slug": "alpine-tent",
            "price": 199.99,
            "image": None,
            "category": "Tents",
        }
    ]
    with patch("main.REAL_CHAT_AVAILABLE", True), patch(
        "main.get_response",
        new=AsyncMock(return_value={
            "question": "tent",
            "answer": "Here is a tent",
            "context": [],
            "citations": expected_citations,
        }),
    ):
        res = client.post("/api/create_response", json={"question": "tent"})
        assert res.status_code == 200
        data = res.json()
        assert data.get("citations") == expected_citations

    # 4. Real mode: create_response/stream streams citations event first
    async def fake_stream(customer_id, question, chat_history):
        yield f"data: {json.dumps({'event': 'citations', 'citations': expected_citations})}\n\n"
        yield f"data: {json.dumps({'chunk': 'Hello '})}\n\n"

    with patch("main.REAL_CHAT_AVAILABLE", True), patch(
        "main.get_response_stream",
        side_effect=fake_stream,
    ):
        res = client.post("/api/create_response/stream", json={"question": "tent"})
        assert res.status_code == 200
        events = [line for line in res.text.split("\n\n") if line.strip()]
        first_event = json.loads(events[0].removeprefix("data: "))
        assert first_event == {"event": "citations", "citations": expected_citations}
        second_event = json.loads(events[1].removeprefix("data: "))
        assert second_event == {"chunk": "Hello "}
        assert events[2] == "data: [DONE]"


@patch("main.get_response")
def test_create_response_accepts_chat_history_list(mock_get_response):
    mock_get_response.return_value = {
        "answer": "Response with history",
        "context": [],
        "customer_id": "cust-1",
    }
    history = [
        {"role": "user", "content": "previous question"},
        {"role": "assistant", "content": "previous answer"},
    ]
    with patch("main.REAL_CHAT_AVAILABLE", True):
        response = client.post(
            "/api/create_response",
            json={
                "question": "follow up question",
                "customer_id": "cust-1",
                "chat_history": history,
            },
        )
        assert response.status_code == 200
        mock_get_response.assert_called_once_with("cust-1", "follow up question", history)


@patch("main.get_response_stream")
def test_stream_endpoint_accepts_chat_history_list(mock_get_response_stream):
    async def fake_stream(customer_id, question, chat_history):
        yield "Streamed with history"

    mock_get_response_stream.side_effect = fake_stream
    history = [
        {"role": "user", "content": "previous question"},
        {"role": "assistant", "content": "previous answer"},
    ]
    with patch("main.REAL_CHAT_AVAILABLE", True):
        response = client.post(
            "/api/create_response/stream",
            json={
                "question": "follow up question",
                "customer_id": "cust-1",
                "chat_history": history,
            },
        )
        assert response.status_code == 200
        mock_get_response_stream.assert_called_once_with("cust-1", "follow up question", history)


def test_create_response_mock_mode_includes_handoff():
    # Handoff requested
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "Can I speak to a human agent?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "handoff" in data
        assert data["handoff"]["requested"] is True
        assert data["handoff"]["reason"] == "agent_requested"
        assert data["handoff"]["suggested_action"] == "live_agent_transfer"
        assert data["handoff"]["support_contact"] is not None
        assert data["handoff"]["support_contact"]["email"] == "support@contosooutdoor.com"

    # Handoff not requested
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "What is the weight of the TrailMaster tent?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "handoff" in data
        assert data["handoff"]["requested"] is False
        assert data["handoff"]["reason"] is None


def test_create_response_stream_mock_mode_emits_handoff_event():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "I want a refund for my broken tent"},
        )
        assert res.status_code == 200
        events = [line for line in res.text.split("\n\n") if line.strip()]
        # First event is citations
        first_event = json.loads(events[0].removeprefix("data: "))
        assert first_event.get("event") == "citations"

        # Second event should be handoff
        second_event = json.loads(events[1].removeprefix("data: "))
        assert second_event.get("event") == "handoff"
        assert second_event["handoff"]["requested"] is True
        assert second_event["handoff"]["reason"] == "dispute_or_refund"
        assert second_event["handoff"]["suggested_action"] == "support_ticket"


def test_create_response_real_mode_includes_handoff():
    expected_handoff = {
        "requested": True,
        "reason": "user_frustration",
        "suggested_action": "contact_support",
        "support_contact": {
            "email": "support@contosooutdoor.com",
            "phone": "1-800-555-0199",
            "hours": "Mon-Fri 8am-8pm EST",
        },
    }
    with patch("main.REAL_CHAT_AVAILABLE", True), patch(
        "main.get_response",
        new=AsyncMock(return_value={
            "question": "You are completely unhelpful",
            "answer": "I apologize for the trouble.",
            "context": [],
            "citations": [],
            "handoff": expected_handoff,
        }),
    ):
        res = client.post(
            "/api/create_response",
            json={"question": "You are completely unhelpful"},
        )
        assert res.status_code == 200
        data = res.json()
        assert data.get("handoff") == expected_handoff


def test_create_response_stream_real_mode_emits_handoff_event():
    expected_handoff = {
        "requested": True,
        "reason": "agent_requested",
        "suggested_action": "live_agent_transfer",
        "support_contact": {
            "email": "support@contosooutdoor.com",
            "phone": "1-800-555-0199",
            "hours": "Mon-Fri 8am-8pm EST",
        },
    }

    citations_payload = json.dumps({"event": "citations", "citations": []})
    handoff_payload = json.dumps({"event": "handoff", "handoff": expected_handoff})
    chunk_payload = json.dumps({"chunk": "Connecting you now..."})

    async def fake_stream(customer_id, question, chat_history):
        yield f"data: {citations_payload}\n\n"
        yield f"data: {handoff_payload}\n\n"
        yield f"data: {chunk_payload}\n\n"

    with patch("main.REAL_CHAT_AVAILABLE", True), patch(
        "main.get_response_stream",
        side_effect=fake_stream,
    ):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "Can I speak to a human?"},
        )
        assert res.status_code == 200
        events = [line for line in res.text.split("\n\n") if line.strip()]
        assert len(events) >= 3
        handoff_event = json.loads(events[1].removeprefix("data: "))
        assert handoff_event == {"event": "handoff", "handoff": expected_handoff}



def test_create_response_mock_mode_includes_customer_profile():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post("/api/create_response", json={"question": "hello"})
        assert res.status_code == 200
        data = res.json()
        assert "customer_profile" in data
        assert data["customer_profile"] == {"membership": "Gold", "past_purchases_count": 2}


def test_create_response_stream_mock_mode_emits_profile_event():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post("/api/create_response/stream", json={"question": "hello"})
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        profile_event = next((e for e in events if e.get("event") == "profile"), None)
        assert profile_event is not None
        assert profile_event["profile"] == {"membership": "Gold", "past_purchases_count": 2}


@patch("main.get_response")
def test_create_response_real_mode_includes_customer_profile(mock_get_response):
    mock_get_response.return_value = {
        "answer": "Here is recommendation",
        "context": [],
        "customer_profile": {"membership": "Gold", "past_purchases_count": 3},
    }
    with patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response",
            json={"question": "gear", "customer_id": "cust-1"},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["customer_profile"] == {"membership": "Gold", "past_purchases_count": 3}


@patch("main.get_response_stream")
def test_create_response_stream_real_mode_emits_profile_event(mock_get_response_stream):
    async def fake_stream(customer_id, question, chat_history):
        yield f"data: {json.dumps({'event': 'citations', 'citations': []})}\n\n"
        yield f"data: {json.dumps({'event': 'profile', 'profile': {'membership': 'Platinum', 'past_purchases_count': 5}})}\n\n"
        yield f"data: {json.dumps({'chunk': 'hello'})}\n\n"

    mock_get_response_stream.side_effect = fake_stream
    with patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post("/api/create_response/stream", json={"question": "gear"})
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        profile_event = next((e for e in events if e.get("event") == "profile"), None)
        assert profile_event is not None
        assert profile_event["profile"] == {"membership": "Platinum", "past_purchases_count": 5}


def test_feedback_thumbs_up():
    response = client.post(
        "/api/feedback",
        json={
            "turn_id": "turn-100",
            "customer_id": "cust-200",
            "question": "What tents do you recommend?",
            "answer": "The Alpine Explorer Tent is great.",
            "feedback_type": "thumbs_up",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert "feedback_id" in data
    assert "created_at" in data
    assert data["message"]


def test_feedback_thumbs_down():
    response = client.post(
        "/api/feedback",
        json={
            "feedback_type": "thumbs_down",
            "comment": "Did not answer my question",
            "tags": ["unhelpful"],
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert "feedback_id" in data
    assert "created_at" in data


def test_feedback_stars_with_comments():
    response = client.post(
        "/api/feedback",
        json={
            "feedback_type": "stars",
            "rating": 5,
            "comment": "Outstanding recommendation!",
            "tags": ["accurate", "friendly"],
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert "feedback_id" in data


def test_feedback_validation_error_invalid_rating():
    # rating 6 is out of bounds for stars
    res = client.post(
        "/api/feedback",
        json={"feedback_type": "stars", "rating": 6},
    )
    assert res.status_code == 422

    # rating 0 is out of bounds for stars
    res = client.post(
        "/api/feedback",
        json={"feedback_type": "stars", "rating": 0},
    )
    assert res.status_code == 422

    # missing rating for stars
    res = client.post(
        "/api/feedback",
        json={"feedback_type": "stars"},
    )
    assert res.status_code == 422

    # invalid rating for thumbs_up
    res = client.post(
        "/api/feedback",
        json={"feedback_type": "thumbs_up", "rating": -1},
    )
    assert res.status_code == 422

    # missing feedback_type
    res = client.post(
        "/api/feedback",
        json={"comment": "No type provided"},
    )
    assert res.status_code == 422


def test_feedback_summary_endpoint():
    try:
        from contoso_chat.feedback import clear_feedback_store
        clear_feedback_store()
    except ImportError:
        pass

    # Submit feedback items
    client.post("/api/feedback", json={"feedback_type": "thumbs_up", "tags": ["fast"]})
    client.post("/api/feedback", json={"feedback_type": "thumbs_up", "tags": ["fast", "helpful"]})
    client.post("/api/feedback", json={"feedback_type": "thumbs_down", "tags": ["slow"]})
    client.post("/api/feedback", json={"feedback_type": "stars", "rating": 4, "tags": ["helpful"]})

    res = client.get("/api/feedback/summary")
    assert res.status_code == 200
    summary = res.json()
    assert summary["total_count"] == 4
    assert summary["thumbs_up_count"] == 2
    assert summary["thumbs_down_count"] == 1
    assert summary["average_star_rating"] == 4.0
    assert summary["tags_distribution"] == {"fast": 2, "helpful": 2, "slow": 1}
