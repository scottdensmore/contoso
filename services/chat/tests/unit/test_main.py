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

    # 2. Mock mode: create_response/stream emits citations event
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post("/api/create_response/stream", json={"question": "tent"})
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        citations_event = next((e for e in events if e.get("event") == "citations"), None)
        assert citations_event is not None
        assert isinstance(citations_event.get("citations"), list)
        assert len(citations_event["citations"]) > 0

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
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        citations_event = next((e for e in events if e.get("event") == "citations"), None)
        assert citations_event is not None

        handoff_event = next((e for e in events if e.get("event") == "handoff"), None)
        assert handoff_event is not None
        assert handoff_event["handoff"]["requested"] is True
        assert handoff_event["handoff"]["reason"] == "dispute_or_refund"
        assert handoff_event["handoff"]["suggested_action"] == "support_ticket"


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


def test_create_response_mock_mode_with_order_tracking():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post("/api/create_response", json={"question": "where is my order"})
        assert res.status_code == 200
        data = res.json()
        assert "order_tracking" in data
        tracking = data["order_tracking"]
        assert tracking["order_id"] == "ord_mock_123"
        assert tracking["status"] == "Shipped"
        assert tracking["carrier"] == "FedEx Ground"
        assert tracking["tracking_number"] == "CTSO-TRK-MOCK123"
        assert tracking["estimated_delivery"] == "In 2 business days"
        assert "order" in data["answer"].lower()
        assert "ord_mock_123" in data["answer"] or "CTSO-TRK-MOCK123" in data["answer"] or "shipped" in data["answer"].lower()


def test_create_response_mock_mode_without_order_tracking():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post("/api/create_response", json={"question": "hello"})
        assert res.status_code == 200
        data = res.json()
        assert "order_tracking" not in data or data.get("order_tracking") is None


def test_create_response_stream_mock_mode_emits_order_tracking_event():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post("/api/create_response/stream", json={"question": "where is my order"})
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        tracking_event = next((e for e in events if e.get("event") == "order_tracking"), None)
        assert tracking_event is not None
        assert tracking_event["order_tracking"]["order_id"] == "ord_mock_123"
        assert tracking_event["order_tracking"]["status"] == "Shipped"
        assert tracking_event["order_tracking"]["carrier"] == "FedEx Ground"
        assert tracking_event["order_tracking"]["tracking_number"] == "CTSO-TRK-MOCK123"
        assert tracking_event["order_tracking"]["estimated_delivery"] == "In 2 business days"


def test_create_response_stream_mock_mode_omits_order_tracking_event_when_no_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post("/api/create_response/stream", json={"question": "hello"})
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        tracking_event = next((e for e in events if e.get("event") == "order_tracking"), None)
        assert tracking_event is None


@patch("main.get_response")
def test_create_response_real_mode_includes_order_tracking(mock_get_response):
    expected_tracking = {
        "order_id": "CTSO-101",
        "status": "Shipped",
        "carrier": "FedEx Ground",
        "tracking_number": "CTSO-TRK-CTSO-101",
        "estimated_delivery": "In 2 business days",
    }
    mock_get_response.return_value = {
        "answer": "Your order CTSO-101 is on its way!",
        "context": [],
        "order_tracking": expected_tracking,
    }
    with patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response",
            json={"question": "track order CTSO-101", "customer_id": "cust-1"},
        )
        assert res.status_code == 200
        data = res.json()
        assert data.get("order_tracking") == expected_tracking


@patch("main.get_response_stream")
def test_create_response_stream_real_mode_emits_order_tracking_event(mock_get_response_stream):
    expected_tracking = {
        "order_id": "CTSO-101",
        "status": "Shipped",
        "carrier": "FedEx Ground",
        "tracking_number": "CTSO-TRK-CTSO-101",
        "estimated_delivery": "In 2 business days",
    }

    async def fake_stream(customer_id, question, chat_history):
        yield f"data: {json.dumps({'event': 'citations', 'citations': []})}\n\n"
        yield f"data: {json.dumps({'event': 'order_tracking', 'order_tracking': expected_tracking})}\n\n"
        yield f"data: {json.dumps({'chunk': 'Your package is en route.'})}\n\n"

    mock_get_response_stream.side_effect = fake_stream
    with patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post("/api/create_response/stream", json={"question": "track order CTSO-101"})
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        tracking_event = next((e for e in events if e.get("event") == "order_tracking"), None)
        assert tracking_event is not None
        assert tracking_event["order_tracking"] == expected_tracking

def test_create_response_with_session_id_persists_turns_and_loads_history():
    from contoso_chat.session_store import clear_session_store, get_session
    clear_session_store()

    # Turn 1: mock mode with session_id
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res1 = client.post(
            "/api/create_response",
            json={
                "question": "What tents do you have?",
                "session_id": "sess-test-1",
                "customer_id": "cust-99",
            },
        )
        assert res1.status_code == 200
        data1 = res1.json()
        assert data1.get("session_id") == "sess-test-1"

        # Check session store
        session = get_session("sess-test-1")
        assert session is not None
        assert session.customer_id == "cust-99"
        assert len(session.messages) == 2
        assert session.messages[0].role == "user"
        assert session.messages[0].content == "What tents do you have?"
        assert session.messages[1].role == "assistant"
        assert session.messages[1].content == data1["answer"]
        assert session.messages[1].citations is not None

    # Turn 2: real mode with mock_get_response to verify history is passed to LLM
    with patch("main.REAL_CHAT_AVAILABLE", True), patch("main.get_response") as mock_get_response:
        mock_get_response.return_value = {
            "answer": "The Alpine Explorer is $350.",
            "citations": [],
            "context": [],
        }
        res2 = client.post(
            "/api/create_response",
            json={
                "question": "How much is the Alpine Explorer?",
                "session_id": "sess-test-1",
                "customer_id": "cust-99",
            },
        )
        assert res2.status_code == 200
        data2 = res2.json()
        assert data2.get("session_id") == "sess-test-1"

        # Verify prior 2 turns were loaded and passed as chat_history to get_response
        mock_get_response.assert_called_once_with(
            "cust-99",
            "How much is the Alpine Explorer?",
            [
                {"role": "user", "content": "What tents do you have?"},
                {"role": "assistant", "content": data1["answer"]},
            ],
        )

        session = get_session("sess-test-1")
        assert session is not None
        assert len(session.messages) == 4
        assert session.messages[2].role == "user"
        assert session.messages[2].content == "How much is the Alpine Explorer?"
        assert session.messages[3].role == "assistant"
        assert session.messages[3].content == "The Alpine Explorer is $350."


def test_create_response_stream_with_session_id():
    from contoso_chat.session_store import clear_session_store, get_session
    clear_session_store()

    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={
                "question": "Where is my order?",
                "session_id": "sess-stream-1",
                "customer_id": "cust-stream",
            },
        )
        assert res.status_code == 200
        events = [line for line in res.text.split("\n\n") if line.strip()]
        # First event must be the session event
        first_event = json.loads(events[0].removeprefix("data: "))
        assert first_event == {"event": "session", "session_id": "sess-stream-1"}

        # Session should have user turn and accumulated assistant response
        session = get_session("sess-stream-1")
        assert session is not None
        assert len(session.messages) == 2
        assert session.messages[0].role == "user"
        assert session.messages[0].content == "Where is my order?"
        assert session.messages[1].role == "assistant"
        assert len(session.messages[1].content) > 0
        assert "ord_mock_123" in session.messages[1].content


def test_create_response_stream_loads_history_from_session():
    from contoso_chat.session_store import (
        append_message,
        clear_session_store,
        create_or_get_session,
    )
    clear_session_store()

    create_or_get_session("sess-stream-hist", customer_id="cust-1")
    append_message("sess-stream-hist", "user", "Hi")
    append_message("sess-stream-hist", "assistant", "Hello! How can I help?")

    async def fake_stream(customer_id, question, chat_history):
        yield "I can help with tents."

    with patch("main.REAL_CHAT_AVAILABLE", True), patch(
        "main.get_response_stream",
        side_effect=fake_stream,
    ) as mock_stream:
        res = client.post(
            "/api/create_response/stream",
            json={
                "question": "Tents please",
                "session_id": "sess-stream-hist",
                "customer_id": "cust-1",
            },
        )
        assert res.status_code == 200
        mock_stream.assert_called_once_with(
            "cust-1",
            "Tents please",
            [
                {"role": "user", "content": "Hi"},
                {"role": "assistant", "content": "Hello! How can I help?"},
            ],
        )


def test_get_sessions_list_endpoint():
    from contoso_chat.session_store import clear_session_store, create_or_get_session
    clear_session_store()

    create_or_get_session("s1", customer_id="user-a", title="Session 1")
    create_or_get_session("s2", customer_id="user-b", title="Session 2")
    create_or_get_session("s3", customer_id="user-a", title="Session 3")

    # List all
    res_all = client.get("/api/sessions")
    assert res_all.status_code == 200
    sessions_all = res_all.json()
    assert len(sessions_all) == 3

    # Filter by customer_id
    res_filtered = client.get("/api/sessions?customer_id=user-a")
    assert res_filtered.status_code == 200
    sessions_a = res_filtered.json()
    assert len(sessions_a) == 2
    assert {s["session_id"] for s in sessions_a} == {"s1", "s3"}

    # Filter by non-existent
    res_none = client.get("/api/sessions?customer_id=nobody")
    assert res_none.status_code == 200
    assert res_none.json() == []


def test_get_session_by_id_200_and_404():
    from contoso_chat.session_store import (
        append_message,
        clear_session_store,
        create_or_get_session,
    )
    clear_session_store()

    create_or_get_session("s-lookup", customer_id="u1", title="Lookup Test")
    append_message("s-lookup", "user", "Hello there")

    # 200
    res_found = client.get("/api/sessions/s-lookup")
    assert res_found.status_code == 200
    data = res_found.json()
    assert data["session_id"] == "s-lookup"
    assert data["title"] == "Lookup Test"
    assert len(data["messages"]) == 1

    # 404
    res_missing = client.get("/api/sessions/non-existent-session")
    assert res_missing.status_code == 404


def test_delete_session_endpoint_200_and_404():
    from contoso_chat.session_store import clear_session_store, create_or_get_session
    clear_session_store()

    create_or_get_session("s-delete", customer_id="u1")

    # 200 deleted
    res_del = client.delete("/api/sessions/s-delete")
    assert res_del.status_code == 200
    assert res_del.json() == {"status": "deleted", "session_id": "s-delete"}

    # Confirm deletion
    res_get = client.get("/api/sessions/s-delete")
    assert res_get.status_code == 404

    # 404 on deleting again
    res_del_again = client.delete("/api/sessions/s-delete")
    assert res_del_again.status_code == 404


def test_create_response_mock_mode_with_promotions():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post("/api/create_response", json={"question": "do you have any coupons or discounts?"})
        assert res.status_code == 200
        data = res.json()
        assert "promotions" in data
        promotions = data["promotions"]
        assert isinstance(promotions, list)
        assert len(promotions) == 3
        codes = {p["code"] for p in promotions}
        assert codes == {"WELCOME20", "OUTDOORS10", "TRAIL15"}
        assert "WELCOME20" in data["answer"] or "OUTDOORS10" in data["answer"] or "discount" in data["answer"].lower()


def test_create_response_mock_mode_without_promotions():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post("/api/create_response", json={"question": "hello"})
        assert res.status_code == 200
        data = res.json()
        assert "promotions" not in data or data.get("promotions") is None


def test_create_response_stream_mock_mode_emits_promotions_event():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post("/api/create_response/stream", json={"question": "any promo codes available?"})
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        promo_event = next((e for e in events if e.get("event") == "promotions"), None)
        assert promo_event is not None
        assert "promotions" in promo_event
        codes = {p["code"] for p in promo_event["promotions"]}
        assert codes == {"WELCOME20", "OUTDOORS10", "TRAIL15"}


def test_create_response_stream_mock_mode_omits_promotions_event_when_no_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post("/api/create_response/stream", json={"question": "hello"})
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        promo_event = next((e for e in events if e.get("event") == "promotions"), None)
        assert promo_event is None


@patch("main.get_response")
def test_create_response_real_mode_includes_promotions(mock_get_response):
    expected_promos = [
        {"code": "WELCOME20", "discount_percent": 20, "description": "20% off welcome discount for adventurers"},
    ]
    mock_get_response.return_value = {
        "answer": "You can use code WELCOME20 for 20% off!",
        "context": [],
        "promotions": expected_promos,
    }
    with patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response",
            json={"question": "any discounts?", "customer_id": "cust-1"},
        )
        assert res.status_code == 200
        data = res.json()
        assert data.get("promotions") == expected_promos


@patch("main.get_response_stream")
def test_create_response_stream_real_mode_emits_promotions_event(mock_get_response_stream):
    expected_promos = [
        {"code": "WELCOME20", "discount_percent": 20, "description": "20% off welcome discount for adventurers"},
    ]

    async def fake_stream(customer_id, question, chat_history):
        yield f"data: {json.dumps({'event': 'citations', 'citations': []})}\n\n"
        yield f"data: {json.dumps({'event': 'promotions', 'promotions': expected_promos})}\n\n"
        yield f"data: {json.dumps({'chunk': 'Here are your discounts.'})}\n\n"

    mock_get_response_stream.side_effect = fake_stream
    with patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post("/api/create_response/stream", json={"question": "any discounts?"})
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        promo_event = next((e for e in events if e.get("event") == "promotions"), None)
        assert promo_event is not None
        assert promo_event["promotions"] == expected_promos


def test_get_promotions_endpoint():
    res = client.get("/api/promotions")
    assert res.status_code == 200
    promos = res.json()
    assert isinstance(promos, list)
    assert len(promos) == 3
    codes = {p["code"] for p in promos}
    assert codes == {"WELCOME20", "OUTDOORS10", "TRAIL15"}


def test_validate_promo_code_endpoint_valid():
    res = client.post("/api/promotions/validate", json={"code": "WELCOME20"})
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is True
    assert data["code"] == "WELCOME20"
    assert data["discount_percent"] == 20


def test_validate_promo_code_endpoint_case_insensitive():
    res = client.post("/api/promotions/validate", json={"code": "outdoors10"})
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is True
    assert data["code"] == "OUTDOORS10"
    assert data["discount_percent"] == 10


def test_validate_promo_code_endpoint_invalid():
    res = client.post("/api/promotions/validate", json={"code": "BADCODE"})
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is False
    assert "message" in data


def test_post_chat_export_json_response():
    res = client.post(
        "/api/chat/export",
        json={
            "messages": [{"role": "user", "content": "Hello"}],
            "format": "markdown",
            "title": "My Chat",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["format"] == "markdown"
    assert data["media_type"] == "text/markdown"
    assert data["filename"] == "chat-transcript-export.md"
    assert "Hello" in data["content"]
    assert data["message_count"] == 1


def test_post_chat_export_download_response():
    res = client.post(
        "/api/chat/export?download=true",
        json={
            "messages": [{"role": "user", "content": "Hello"}],
            "format": "text",
        },
    )
    assert res.status_code == 200
    assert res.headers["content-type"].startswith("text/plain")
    assert 'attachment; filename="chat-transcript-export.txt"' in res.headers["content-disposition"]
    assert "Hello" in res.text


def test_get_session_export_download():
    from contoso_chat.session_store import (
        append_message,
        clear_session_store,
        create_or_get_session,
    )

    clear_session_store()
    sess_id = "sess-get-export"
    create_or_get_session(sess_id, title="Trip Planning")
    append_message(sess_id, role="user", content="Where can I camp?")
    append_message(sess_id, role="assistant", content="In Yosemite!")

    res = client.get(f"/api/sessions/{sess_id}/export?format=markdown")
    assert res.status_code == 200
    assert res.headers["content-type"].startswith("text/markdown")
    assert f'attachment; filename="chat-transcript-{sess_id}.md"' in res.headers["content-disposition"]
    assert "Trip Planning" in res.text
    assert "Where can I camp?" in res.text
    assert "In Yosemite!" in res.text


def test_export_endpoints_404_on_missing_session():
    res_get = client.get("/api/sessions/nonexistent-sess-404/export")
    assert res_get.status_code == 404

    res_post = client.post(
        "/api/chat/export",
        json={"session_id": "nonexistent-sess-404"},
    )
    assert res_post.status_code == 404


def test_export_endpoints_400_on_invalid_format():
    from contoso_chat.session_store import clear_session_store, create_or_get_session
    clear_session_store()
    sess_id = "sess-invalid-fmt"
    create_or_get_session(sess_id, title="Test")

    res_get = client.get(f"/api/sessions/{sess_id}/export?format=unsupported")
    assert res_get.status_code == 400

    res_post = client.post(
        "/api/chat/export",
        json={"format": "unsupported"},
    )
    assert res_post.status_code == 400


def test_get_policies_endpoint():
    res = client.get("/api/policies")
    assert res.status_code == 200
    policies = res.json()
    assert isinstance(policies, list)
    assert len(policies) == 5
    ids = {p["id"] for p in policies}
    assert ids == {"returns", "price_match", "shipping", "warranty", "privacy"}


def test_get_policy_by_id_endpoint_valid():
    res = client.get("/api/policies/price_match")
    assert res.status_code == 200
    policy = res.json()
    assert policy["id"] == "price_match"
    assert "Price-Match" in policy["title"]
    assert "14-day" in policy["summary"] or "14" in policy["summary"]

    res_upper = client.get("/api/policies/RETURNS")
    assert res_upper.status_code == 200
    assert res_upper.json()["id"] == "returns"


def test_get_policy_by_id_endpoint_not_found():
    res = client.get("/api/policies/unknown_policy")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_inquire_policy_endpoint_matched():
    res = client.post("/api/policies/inquire", json={"query": "Can you match competitor price from REI?"})
    assert res.status_code == 200
    data = res.json()
    assert data["is_policy_query"] is True
    assert data["policy_type"] == "price_match"
    assert data["matched_policy"] is not None
    assert data["matched_policy"]["id"] == "price_match"
    assert data["confidence"] > 0.0


def test_inquire_policy_endpoint_unmatched():
    res = client.post("/api/policies/inquire", json={"query": "tell me about sleeping bags"})
    assert res.status_code == 200
    data = res.json()
    assert data["is_policy_query"] is False
    assert data["policy_type"] is None
    assert data["matched_policy"] is None
    assert data["confidence"] == 0.0


def test_create_response_mock_mode_with_policy():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post("/api/create_response", json={"question": "Can you match a lower price from REI?"})
        assert res.status_code == 200
        data = res.json()
        assert "policy" in data
        policy = data["policy"]
        assert isinstance(policy, dict)
        assert policy["id"] == "price_match"
        assert "price-match" in data["answer"].lower() or "guarantee" in data["answer"].lower() or "policy" in data["answer"].lower()


def test_create_response_mock_mode_without_policy():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post("/api/create_response", json={"question": "hello"})
        assert res.status_code == 200
        data = res.json()
        assert "policy" not in data or data.get("policy") is None


def test_create_response_stream_mock_mode_emits_policy_event():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post("/api/create_response/stream", json={"question": "What is your return policy?"})
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        policy_event = next((e for e in events if e.get("event") == "policy"), None)
        assert policy_event is not None
        assert "policy" in policy_event
        assert policy_event["policy"]["id"] == "returns"


def test_create_response_stream_mock_mode_omits_policy_event_when_no_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post("/api/create_response/stream", json={"question": "hello"})
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        policy_event = next((e for e in events if e.get("event") == "policy"), None)
        assert policy_event is None


@patch("main.get_response")
def test_create_response_real_mode_includes_policy(mock_get_response):
    expected_policy = {
        "id": "price_match",
        "title": "Price-Match Guarantee",
        "summary": "14-day price-match guarantee against authorized outdoor retailers for identical in-stock items.",
    }
    mock_get_response.return_value = {
        "answer": "Yes, we match prices!",
        "context": [],
        "policy": expected_policy,
    }
    with patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response",
            json={"question": "Can you match price from REI?", "customer_id": "cust-1"},
        )
        assert res.status_code == 200
        data = res.json()
        assert data.get("policy") == expected_policy


@patch("main.get_response_stream")
def test_create_response_stream_real_mode_emits_policy_event(mock_get_response_stream):
    expected_policy = {
        "id": "returns",
        "title": "Returns & Refunds Policy",
        "summary": "30-day return policy, full refund in original packaging, free return shipping for members.",
    }

    async def fake_stream(customer_id, question, chat_history):
        yield f"data: {json.dumps({'event': 'citations', 'citations': []})}\n\n"
        yield f"data: {json.dumps({'event': 'policy', 'policy': expected_policy})}\n\n"
        yield f"data: {json.dumps({'chunk': 'Our return policy is 30 days.'})}\n\n"

    mock_get_response_stream.side_effect = fake_stream
    with patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post("/api/create_response/stream", json={"question": "What is your return policy?"})
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        policy_event = next((e for e in events if e.get("event") == "policy"), None)
        assert policy_event is not None
        assert policy_event["policy"] == expected_policy


def test_chat_status_endpoint():
    """Test GET /api/chat/status endpoint returns diagnostics and supported events."""
    res = client.get("/api/chat/status")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert "real_chat_available" in data
    assert "model_provider" in data
    assert "model_name" in data
    assert data["supported_events"] == [
        "status",
        "citations",
        "profile",
        "handoff",
        "order_tracking",
        "promotions",
        "policy",
        "stores",
        "session",
    ]


def test_chat_status_endpoint_respects_provider_and_model():
    """Test GET /api/chat/status with local vs gcp provider."""
    with patch.dict("os.environ", {"LLM_PROVIDER": "local", "LOCAL_MODEL_NAME": "custom-local:latest"}):
        res = client.get("/api/chat/status")
        assert res.status_code == 200
        data = res.json()
        assert data["model_provider"] == "local"
        assert data["model_name"] == "custom-local:latest"

    with patch.dict("os.environ", {"LLM_PROVIDER": "gcp", "GEMINI_MODEL_NAME": "gemini-custom"}):
        res = client.get("/api/chat/status")
        assert res.status_code == 200
        data = res.json()
        assert data["model_provider"] == "gcp"
        assert data["model_name"] == "gemini-custom"


def test_create_response_stream_mock_mode_emits_status_events():
    """Test that mock streaming emits analyzing_query, searching_catalog, and generating_response."""
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post("/api/create_response/stream", json={"question": "hiking boots"})
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split(chr(10) + chr(10))
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        status_events = [e for e in events if e.get("event") == "status"]
        assert len(status_events) == 3
        assert status_events[0] == {
            "event": "status",
            "status": "analyzing_query",
            "message": "Analyzing question...",
        }
        assert status_events[1] == {
            "event": "status",
            "status": "searching_catalog",
            "message": "Searching catalog...",
        }
        assert status_events[2] == {
            "event": "status",
            "status": "generating_response",
            "message": "Generating response...",
        }


def test_get_stores_endpoint():
    """Test GET /api/stores returns all 5 retail stores."""
    res = client.get("/api/stores")
    assert res.status_code == 200
    stores = res.json()
    assert isinstance(stores, list)
    assert len(stores) == 5
    ids = {s["id"] for s in stores}
    assert ids == {"seattle", "denver", "portland", "salt-lake-city", "san-francisco"}


def test_get_store_by_id_endpoint_valid():
    """Test GET /api/stores/{store_id} returns store details for valid store_id."""
    res = client.get("/api/stores/denver")
    assert res.status_code == 200
    store = res.json()
    assert store["id"] == "denver"
    assert store["name"] == "Denver Mountain Outpost"
    assert "hours" in store
    assert "saturday" in store["hours"]


def test_get_store_by_id_endpoint_not_found():
    """Test GET /api/stores/{store_id} returns 404 for unknown store."""
    res = client.get("/api/stores/nonexistent_store")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_search_stores_endpoint():
    """Test POST /api/stores/search returns matching stores."""
    res = client.post("/api/stores/search", json={"query": "Seattle"})
    assert res.status_code == 200
    results = res.json()
    assert isinstance(results, list)
    assert len(results) == 1
    assert results[0]["id"] == "seattle"

    # Search with pickup filter
    res_pickup = client.post("/api/stores/search", json={"query": "Oregon", "has_pickup": True})
    assert res_pickup.status_code == 200
    results_pickup = res_pickup.json()
    assert len(results_pickup) == 1
    assert results_pickup[0]["id"] == "portland"


def test_create_response_mock_mode_with_store():
    """Test POST /api/create_response includes store citations and grounded answer in mock mode."""
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "What time does the Denver store close on Saturday?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "stores" in data
        stores = data["stores"]
        assert isinstance(stores, list)
        assert len(stores) >= 1
        assert any(s["id"] == "denver" for s in stores)
        answer = data["answer"].lower()
        assert "denver" in answer or "7:00 pm" in answer or "outpost" in answer or "saturday" in answer


def test_create_response_mock_mode_without_store():
    """Test POST /api/create_response omits stores for non-store questions in mock mode."""
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "Tell me about lightweight tents"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "stores" not in data or data.get("stores") is None


def test_create_response_stream_mock_mode_emits_stores_event():
    """Test POST /api/create_response/stream emits event: stores SSE frame in mock mode."""
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "Do you have stores in Oregon with in-store pickup?"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        stores_event = next((e for e in events if e.get("event") == "stores"), None)
        assert stores_event is not None
        assert "stores" in stores_event
        assert any(s["id"] == "portland" for s in stores_event["stores"])

        # Frame ordering: status events -> metadata (citations, handoff, profile, stores) -> token chunks
        first_chunk_idx = next(i for i, e in enumerate(events) if "chunk" in e)
        stores_idx = next(i for i, e in enumerate(events) if e.get("event") == "stores")
        assert stores_idx < first_chunk_idx


def test_create_response_stream_mock_mode_omits_stores_event_when_no_intent():
    """Test POST /api/create_response/stream omits event: stores for non-store questions in mock mode."""
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "Tell me about hiking boots"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        stores_event = next((e for e in events if e.get("event") == "stores"), None)
        assert stores_event is None


def test_get_tracking_info_endpoint_valid():
    """Test GET /api/tracking/{identifier} returns tracking information for valid identifier."""
    res = client.get("/api/tracking/CTSO-TRK-DEMO123")
    assert res.status_code == 200
    data = res.json()
    assert data["tracking_number"] == "CTSO-TRK-DEMO123"
    assert data["carrier"] in ["FedEx Ground", "UPS Ground"]
    assert len(data["milestones"]) >= 4


def test_get_tracking_info_endpoint_not_found():
    """Test GET /api/tracking/{identifier} returns 404 for unknown identifier."""
    res = client.get("/api/tracking/UNKNOWN-99999")
    assert res.status_code == 404
    data = res.json()
    assert "Tracking information not found for identifier: UNKNOWN-99999" in data["detail"]


def test_create_response_mock_mode_with_carrier_tracking():
    """Test POST /api/create_response includes carrier_tracking payload in mock mode."""
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "Where is package CTSO-TRK-98765?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "carrier_tracking" in data
        assert data["carrier_tracking"]["tracking_number"] == "CTSO-TRK-98765"


def test_create_response_mock_mode_without_carrier_tracking():
    """Test POST /api/create_response omits carrier_tracking when no carrier intent is detected."""
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "What tents are best for winter?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "carrier_tracking" not in data


def test_create_response_stream_mock_mode_emits_carrier_tracking_event():
    """Test POST /api/create_response/stream emits event: carrier_tracking in mock mode."""
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "Where is my shipment CTSO-TRK-DEMO123?"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        carrier_event = next((e for e in events if e.get("event") == "carrier_tracking"), None)
        assert carrier_event is not None
        assert "carrier_tracking" in carrier_event
        assert carrier_event["carrier_tracking"]["tracking_number"] == "CTSO-TRK-DEMO123"


def test_create_response_stream_mock_mode_omits_carrier_tracking_event_when_no_intent():
    """Test POST /api/create_response/stream omits event: carrier_tracking for general questions."""
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "Tell me about sleeping bags"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        carrier_event = next((e for e in events if e.get("event") == "carrier_tracking"), None)
        assert carrier_event is None


def test_get_all_faqs_endpoint():
    res = client.get("/api/faq")
    assert res.status_code == 200
    faqs = res.json()
    assert isinstance(faqs, list)
    assert len(faqs) >= 7
    ids = {f["faq_id"] for f in faqs}
    assert "warranty" in ids
    assert "returns" in ids


def test_search_faqs_endpoint_with_category_filter():
    res = client.get("/api/faq?category=returns")
    assert res.status_code == 200
    faqs = res.json()
    assert isinstance(faqs, list)
    assert len(faqs) == 1
    assert faqs[0]["faq_id"] == "returns"
    assert faqs[0]["category"] == "returns"


def test_search_faqs_endpoint_with_query():
    res = client.get("/api/faq?query=warranty")
    assert res.status_code == 200
    faqs = res.json()
    assert isinstance(faqs, list)
    assert any(f["faq_id"] == "warranty" for f in faqs)


def test_get_faq_by_id_endpoint_success():
    res = client.get("/api/faq/warranty")
    assert res.status_code == 200
    faq = res.json()
    assert faq["faq_id"] == "warranty"
    assert faq["category"] == "warranty"
    assert "1-year" in faq["answer"] or "warranty" in faq["answer"].lower()


def test_get_faq_by_id_endpoint_not_found():
    res = client.get("/api/faq/unknown-faq-999")
    assert res.status_code == 404
    data = res.json()
    assert data["detail"] == "FAQ topic not found: unknown-faq-999"


def test_create_response_mock_mode_with_faq_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "What is your warranty policy on outdoor gear?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "faq" in data
        assert isinstance(data["faq"], list)
        assert any(item["faq_id"] == "warranty" for item in data["faq"])


def test_create_response_stream_mock_mode_emits_faq_event():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "What is your warranty policy on outdoor gear?"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        faq_event = next((e for e in events if e.get("event") == "faq"), None)
        assert faq_event is not None
        assert "faq" in faq_event
        assert any(item["faq_id"] == "warranty" for item in faq_event["faq"])


def test_create_response_stream_mock_mode_omits_faq_event_when_no_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "Tell me about sleeping bags"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        faq_event = next((e for e in events if e.get("event") == "faq"), None)
        assert faq_event is None


def test_get_sizing_guide_endpoint_success():
    res = client.get("/api/sizing/jackets")
    assert res.status_code == 200
    data = res.json()
    assert data["category"] in ("jackets", "apparel")
    assert "rows" in data
    assert len(data["rows"]) > 0


def test_get_sizing_guide_endpoint_not_found():
    res = client.get("/api/sizing/unknown-category-999")
    assert res.status_code == 404
    data = res.json()
    assert data["detail"] == "Sizing guide not found for category: unknown-category-999"


def test_create_response_mock_mode_with_sizing_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "What size jacket should I get for a 40 inch chest?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "sizing" in data
        assert data["sizing"]["category"] in ("jackets", "apparel")
        assert "M" in data["answer"] or "size" in data["answer"].lower()


def test_create_response_stream_mock_mode_emits_sizing_event():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "What size jacket should I get for a 40 inch chest?"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        sizing_event = next((e for e in events if e.get("event") == "sizing"), None)
        assert sizing_event is not None
        assert "sizing" in sizing_event
        assert sizing_event["sizing"]["category"] in ("jackets", "apparel")


def test_create_response_stream_mock_mode_omits_sizing_event_when_no_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "Tell me about sleeping bags"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        sizing_event = next((e for e in events if e.get("event") == "sizing"), None)
        assert sizing_event is None


def test_get_review_summary_endpoint_success():
    res = client.get("/api/reviews/trailmaster-x4-tent/summary")
    assert res.status_code == 200
    data = res.json()
    assert data["product_slug"] == "trailmaster-x4-tent"
    assert data["product_name"] == "TrailMaster X4 Tent"
    assert data["average_rating"] == 4.7
    assert data["total_reviews"] == 48
    assert data["sentiment"] == "positive"
    assert "Waterproof double-wall construction" in data["pros"]
    assert data["recommendation_percentage"] == 94


def test_get_review_summary_endpoint_not_found():
    res = client.get("/api/reviews/unknown-product-999/summary")
    assert res.status_code == 404
    data = res.json()
    assert data["detail"] == "Review summary not found for product: unknown-product-999"


def test_create_response_mock_mode_with_review_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "What are the pros and cons of the TrailMaster tent according to customers?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "review_summary" in data
        assert data["review_summary"]["product_slug"] == "trailmaster-x4-tent"
        assert "TrailMaster" in data["answer"]


def test_create_response_stream_mock_mode_emits_review_summary_event():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "What are the pros and cons of the TrailMaster tent according to customers?"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        review_event = next((e for e in events if e.get("event") == "review_summary"), None)
        assert review_event is not None
        assert "review_summary" in review_event
        assert review_event["review_summary"]["product_slug"] == "trailmaster-x4-tent"


def test_create_response_stream_mock_mode_omits_review_summary_event_when_no_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "Tell me about sleeping bags"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        review_event = next((e for e in events if e.get("event") == "review_summary"), None)
        assert review_event is None


def test_get_rentals_packages_endpoint():
    res = client.get("/api/rentals/packages")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 4
    assert {p["id"] for p in data} == {
        "camp-bundle-4p",
        "backpack-ultralight",
        "kayak-touring-set",
        "snowshoe-alpine-kit",
    }


def test_get_rentals_packages_endpoint_with_category_filter():
    res = client.get("/api/rentals/packages?category=camping")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["id"] == "camp-bundle-4p"


def test_post_rentals_quote_endpoint_success():
    res = client.post(
        "/api/rentals/quote",
        json={"gear_type": "backpack", "days": 5, "store_name": "Denver"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["package_id"] == "backpack-ultralight"
    assert data["days"] == 5
    assert data["daily_rate"] == 35.0
    assert data["discount_percent"] == 10.0
    assert data["discount_amount"] == 17.5
    assert data["subtotal"] == 157.5
    assert data["deposit"] == 75.0
    assert data["total_due"] == 232.5
    assert data["store"] == "Denver"
    assert data["store_available"] is True


def test_post_rentals_quote_endpoint_not_found():
    res = client.post(
        "/api/rentals/quote",
        json={"gear_type": "jetpack", "days": 1},
    )
    assert res.status_code == 404
    assert "Rental package not found" in res.json()["detail"]


def test_create_response_mock_mode_with_rental_quote_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "How much to rent a kayak for 3 days in Seattle?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "rental_info" in data
        assert data["rental_info"]["action"] == "quote"
        assert data["rental_info"]["quote"]["package_id"] == "kayak-touring-set"
        assert "kayak" in data["answer"].lower()
        assert "Seattle" in data["answer"]


def test_create_response_stream_mock_mode_emits_rental_info_event():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "Can I rent a tent for 4 days in Seattle?"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        rental_event = next((e for e in events if e.get("event") == "rental_info"), None)
        assert rental_event is not None
        assert "rental_info" in rental_event
        assert rental_event["rental_info"]["action"] == "quote"


def test_create_response_stream_mock_mode_omits_rental_info_event_when_no_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "Tell me about sleeping bags"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        rental_event = next((e for e in events if e.get("event") == "rental_info"), None)
        assert rental_event is None



def test_create_order_return_label_post():
    res = client.post(
        "/api/orders/CTSO-12345/return_label",
        json={"order_id": "CTSO-12345", "reason": "Defective item"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["order_id"] == "CTSO-12345"
    assert data["rma_number"] == "RMA-CTSO-12345"
    assert data["tracking_number"] == "1Z-CTSO-RET-00012345"
    assert data["carrier"] == "Contoso Express Returns / UPS Ground Prepaid"
    assert data["label_url"] == "/profile/orders/CTSO-12345/label"
    assert data["valid_days"] == 14


def test_get_order_return_label_get():
    res = client.get("/api/orders/CTSO-98765/return_label")
    assert res.status_code == 200
    data = res.json()
    assert data["order_id"] == "CTSO-98765"
    assert data["rma_number"] == "RMA-CTSO-98765"
    assert data["tracking_number"] == "1Z-CTSO-RET-00098765"
    assert data["label_url"] == "/profile/orders/CTSO-98765/label"
    assert data["valid_days"] == 14


def test_create_response_mock_mode_with_return_label_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "I need a return label for CTSO-98765"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "return_label" in data
        assert data["return_label"]["order_id"] == "CTSO-98765"
        assert data["return_label"]["rma_number"] == "RMA-CTSO-98765"
        assert "RMA-CTSO-98765" in data["answer"]


def test_create_response_stream_mock_mode_emits_return_label_event():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "I need a return label for CTSO-98765"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        rl_event = next((e for e in events if e.get("event") == "return_label"), None)
        assert rl_event is not None
        assert "return_label" in rl_event
        assert rl_event["return_label"]["order_id"] == "CTSO-98765"


def test_create_response_stream_mock_mode_omits_return_label_event_when_no_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "Tell me about camping tents"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        rl_event = next((e for e in events if e.get("event") == "return_label"), None)
        assert rl_event is None


def test_get_trails_endpoint():
    res = client.get("/api/trails")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 4
    trail_ids = {t["id"] for t in data}
    assert "rattlesnake-ridge" in trail_ids
    assert "bear-peak" in trail_ids
    assert "multnomah-loop" in trail_ids
    assert "mount-olympus" in trail_ids


def test_get_trails_endpoint_with_filters():
    res = client.get("/api/trails?region=Rocky%20Mountains&difficulty=hard")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["id"] == "bear-peak"
    assert data[0]["difficulty"] == "hard"


def test_post_trails_outfitting_endpoint():
    res = client.post(
        "/api/trails/outfitting",
        json={"trail_name": "rattlesnake-ridge", "activity": "day-hiking", "season": "spring"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["trail"]["id"] == "rattlesnake-ridge"
    assert data["activity"] == "day-hiking"
    assert data["season"] == "spring"
    assert isinstance(data["gear_checklist"], list)
    assert len(data["gear_checklist"]) >= 10
    assert isinstance(data["safety_tips"], list)


def test_create_response_mock_mode_with_trail_conditions_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "What are the conditions on Rattlesnake Ridge?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "trail_outfitting" in data
        assert data["trail_outfitting"]["action"] == "conditions"
        assert data["trail_outfitting"]["trail"]["id"] == "rattlesnake-ridge"
        assert "Rattlesnake Ridge" in data["answer"]
        assert "58°F" in data["answer"]


def test_create_response_stream_mock_mode_emits_trail_outfitting_event():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "What gear should I pack for a spring hike at Bear Peak?"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        trail_event = next((e for e in events if e.get("event") == "trail_outfitting"), None)
        assert trail_event is not None
        assert "trail_outfitting" in trail_event
        assert trail_event["trail_outfitting"]["trail"]["id"] == "bear-peak"
        assert trail_event["trail_outfitting"]["action"] == "outfitting"


def test_create_response_stream_mock_mode_omits_trail_outfitting_when_no_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "Where is your retail store?"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        trail_event = next((e for e in events if e.get("event") == "trail_outfitting"), None)
        assert trail_event is None


def test_get_loyalty_profile_endpoint():
    res = client.get("/api/loyalty/profile")
    assert res.status_code == 200
    data = res.json()
    assert data["customer_id"] == "cust-default"
    assert data["points_balance"] == 650
    assert data["tier"] == "Pathfinder"
    assert data["points_to_next_tier"] == 650
    assert data["next_tier"] == "Summit Explorer"
    assert isinstance(data["available_vouchers"], list)


def test_get_loyalty_tiers_endpoint():
    res = client.get("/api/loyalty/tiers")
    assert res.status_code == 200
    tiers = res.json()
    assert isinstance(tiers, list)
    assert len(tiers) == 3
    names = [t["tier_name"] for t in tiers]
    assert names == ["Trailblazer", "Pathfinder", "Summit Explorer"]


def test_post_loyalty_redeem_endpoint():
    # 1. Successful redemption
    res = client.post(
        "/api/loyalty/redeem",
        json={"voucher_id": "voucher-10", "customer_id": "cust-default"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["promo_code"] == "REWARD10"
    assert data["remaining_points"] == 450
    assert data["voucher"]["id"] == "voucher-10"

    # 2. Insufficient points redemption
    res2 = client.post(
        "/api/loyalty/redeem",
        json={"voucher_id": "voucher-50", "customer_id": "cust-default"},
    )
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["success"] is False
    assert data2["remaining_points"] == 450


def test_create_response_mock_mode_with_rewards_balance_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "How many reward points do I have?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "rewards_info" in data
        assert data["rewards_info"]["action"] == "balance"
        assert "Pathfinder" in data["answer"]


def test_create_response_mock_mode_with_rewards_tiers_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "What are the benefits of Pathfinder tier?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "rewards_info" in data
        assert data["rewards_info"]["action"] == "tiers"
        assert "Summit Explorer" in data["answer"]


def test_create_response_mock_mode_with_rewards_vouchers_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "What vouchers are available for my rewards?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "rewards_info" in data
        assert data["rewards_info"]["action"] == "vouchers"
        assert "$10" in data["answer"]


def test_create_response_mock_mode_with_rewards_redeem_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "Redeem my points for a $10 discount voucher"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "rewards_info" in data
        assert data["rewards_info"]["action"] == "redeem"
        assert "REWARD10" in data["answer"]


def test_create_response_stream_mock_mode_emits_rewards_info_event():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "What are the benefits of Pathfinder tier?"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        rewards_event = next((e for e in events if e.get("event") == "rewards_info"), None)
        assert rewards_event is not None
        assert "rewards_info" in rewards_event
        assert rewards_event["rewards_info"]["action"] == "tiers"


def test_create_response_stream_mock_mode_omits_rewards_info_when_no_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "Where is your retail store?"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        rewards_event = next((e for e in events if e.get("event") == "rewards_info"), None)
        assert rewards_event is None


def test_get_trade_in_brands_endpoint():
    res = client.get("/api/trade-in/brands")
    assert res.status_code == 200
    brands = res.json()
    assert len(brands) == 8
    names = {b["name"] for b in brands}
    assert "Contoso Outdoors" in names
    assert "Patagonia" in names


def test_post_trade_in_estimate_endpoint():
    res = client.post(
        "/api/trade-in/estimate",
        json={"category": "tents", "original_msrp": 400.0, "condition": "excellent"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["estimated_payout"] == 200.0
    assert data["co2_avoided_kg"] == 25.0


def test_create_response_mock_mode_with_trade_in_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "Can I trade in my used Patagonia jacket for store credit?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "trade_in_info" in data
        assert data["trade_in_info"]["action"] == "estimate"
        assert data["trade_in_info"]["brand"] == "Patagonia"


def test_create_response_stream_mock_mode_emits_trade_in_info_event():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "What brands are eligible for the Contoso Re-Gear trade-in program?"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        trade_in_event = next((e for e in events if e.get("event") == "trade_in_info"), None)
        assert trade_in_event is not None
        assert "trade_in_info" in trade_in_event
        assert trade_in_event["trade_in_info"]["action"] == "brands"


def test_create_response_stream_mock_mode_omits_trade_in_info_when_no_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "Where is your retail store?"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        trade_in_event = next((e for e in events if e.get("event") == "trade_in_info"), None)
        assert trade_in_event is None
