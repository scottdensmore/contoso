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
    from contoso_chat.rewards import reset_rewards_state
    reset_rewards_state()


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
        from contoso_chat.rewards import reset_rewards_state
        reset_rewards_state()


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


def test_get_planner_templates_endpoint():
    res = client.get("/api/planner/templates")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 3
    ids = {t["id"] for t in data}
    assert "weekend-backpacking" in ids
    assert "alpine-expedition" in ids
    assert "desert-trek" in ids
    assert "winter-wilderness" in ids


def test_post_planner_generate_endpoint():
    res = client.post(
        "/api/planner/generate",
        json={"duration_days": 3, "group_size": 2, "climate": "cold"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["duration_days"] == 3
    assert data["group_size"] == 2
    assert data["total_calories_kcal"] == 20400
    assert data["daily_calories_per_person"] == 3400
    assert data["daily_water_liters_per_person"] == 3.0
    assert data["total_water_capacity_liters"] == 6.0
    assert len(data["checklist"]) >= 10
    checklist_text = " ".join(item["name"].lower() for item in data["checklist"])
    assert "4-season" in checklist_text


def test_create_response_mock_mode_with_trip_planner_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "Plan a 3-day backpacking trip in the Cascades with packing list and calorie needs"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "trip_planner_info" in data
        assert data["trip_planner_info"]["duration_days"] == 3
        assert data["trip_planner_info"]["daily_calories_per_person"] == 3000
        assert "3-day" in data["answer"].lower() or "3 day" in data["answer"].lower()


def test_create_response_stream_mock_mode_emits_trip_planner_info_event():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "What water capacity and gear do I need for desert hiking?"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        planner_event = next((e for e in events if e.get("event") == "trip_planner_info"), None)
        assert planner_event is not None
        assert "trip_planner_info" in planner_event
        assert planner_event["trip_planner_info"]["daily_water_liters_per_person"] == 4.5


def test_create_response_stream_mock_mode_omits_trip_planner_info_when_no_intent():
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
        planner_event = next((e for e in events if e.get("event") == "trip_planner_info"), None)
        assert planner_event is None


def test_post_safety_beacon_register_endpoint():
    res = client.post(
        "/api/safety/beacon/register",
        json={
            "device_type": "garmin_inreach",
            "imei": "300434012345678",
            "owner_name": "Jordan Smith",
            "emergency_contact": "Casey Smith",
            "emergency_phone": "555-019-1234",
            "trip_zone": "cascades",
            "return_date": "2026-10-10",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["device_id"].startswith("SBR-")
    assert data["status"] == "ACTIVE_MONITORING"
    assert data["trip_zone"] == "cascades"
    assert "registered_at" in data
    assert "instructions" in data


def test_post_safety_beacon_checkin_endpoint():
    reg_res = client.post(
        "/api/safety/beacon/register",
        json={
            "device_type": "spot",
            "imei": "300434098765432",
            "owner_name": "Robin Hood",
            "emergency_contact": "Marion",
            "emergency_phone": "555-019-5566",
            "trip_zone": "tetons",
        },
    )
    assert reg_res.status_code == 200
    dev_id = reg_res.json()["device_id"]

    check_res = client.post(
        "/api/safety/beacon/checkin",
        json={"device_id": dev_id, "status_message": "Reached basecamp", "coordinates": "43.7904,-110.6818"},
    )
    assert check_res.status_code == 200
    data = check_res.json()
    assert data["device_id"] == dev_id
    assert data["status"] == "CHECKIN_CONFIRMED"
    assert "Reached basecamp" in data["message"]


def test_post_safety_beacon_checkin_endpoint_not_found():
    res = client.post(
        "/api/safety/beacon/checkin",
        json={"device_id": "SBR-NONEXISTENT", "status_message": "OK"},
    )
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_get_safety_protocols_endpoint():
    res = client.get("/api/safety/protocols")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 5
    types = {p["incident_type"] for p in data}
    assert {"hypothermia", "wildlife", "lightning", "altitude", "injury"}.issubset(types)


def test_get_safety_protocol_by_id_endpoint_success():
    res = client.get("/api/safety/protocols/hypothermia")
    assert res.status_code == 200
    data = res.json()
    assert data["incident_type"] == "hypothermia"
    assert data["severity"] == "CRITICAL"
    assert len(data["first_response_steps"]) >= 4


def test_get_safety_protocol_by_id_endpoint_not_found():
    res = client.get("/api/safety/protocols/non_existent_emergency")
    assert res.status_code == 404


def test_get_safety_avalanche_endpoint_all():
    res = client.get("/api/safety/avalanche")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 5
    zones = {a["zone"] for a in data}
    assert zones == {"cascades", "rockies", "sierra", "wasatch", "tetons"}


def test_get_safety_avalanche_endpoint_with_zone():
    res = client.get("/api/safety/avalanche?zone=cascades")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 1
    assert data[0]["zone"] == "cascades"
    assert data[0]["danger_rating"] == "Considerable"


def test_get_safety_avalanche_endpoint_unknown_zone():
    res = client.get("/api/safety/avalanche?zone=everest")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 0


def test_create_response_mock_mode_with_safety_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "What is the emergency protocol for a bear encounter?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "safety_info" in data
        assert data["safety_info"]["action"] == "emergency_protocol"
        assert "bear spray" in data["answer"].lower() or "stand ground" in data["answer"].lower()


def test_create_response_stream_mock_mode_emits_safety_info_event():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "What is the avalanche advisory for Cascades?"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        safety_event = next((e for e in events if e.get("event") == "safety_info"), None)
        assert safety_event is not None
        assert "safety_info" in safety_event
        assert safety_event["safety_info"]["action"] == "avalanche_advisory"


def test_create_response_stream_mock_mode_omits_safety_info_when_no_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "What waterproof jackets do you sell?"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        safety_event = next((e for e in events if e.get("event") == "safety_info"), None)
        assert safety_event is None


def test_get_shuttle_routes_endpoint_all():
    res = client.get("/api/shuttles/routes")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 4
    route_ids = {r["route_id"] for r in data}
    assert "enchantments-connector" in route_ids
    assert "rainier-express" in route_ids


def test_get_shuttle_routes_endpoint_filtered():
    res_cascades = client.get("/api/shuttles/routes?region=cascades")
    assert res_cascades.status_code == 200
    data_cascades = res_cascades.json()
    assert len(data_cascades) >= 1
    assert all(r["region"] == "cascades" for r in data_cascades)

    res_conn = client.get("/api/shuttles/routes?connector_only=true")
    assert res_conn.status_code == 200
    data_conn = res_conn.json()
    assert len(data_conn) >= 1
    assert all(r["is_connector"] is True for r in data_conn)


def test_post_shuttle_quote_endpoint_success():
    res = client.post(
        "/api/shuttles/quote",
        json={"route_id": "enchantments-connector", "seats": 2},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["route_id"] == "enchantments-connector"
    assert data["seats"] == 2
    assert data["price_per_seat"] == 30.0
    assert data["total_price"] == 60.0
    assert len(data["departure_times"]) >= 4


def test_post_shuttle_quote_endpoint_not_found():
    res = client.post(
        "/api/shuttles/quote",
        json={"route_id": "nonexistent-route", "seats": 1},
    )
    assert res.status_code == 404


def test_post_shuttle_book_endpoint_success():
    res = client.post(
        "/api/shuttles/book",
        json={
            "route_id": "enchantments-connector",
            "departure_date": "2026-10-03",
            "departure_time": "06:30",
            "seats": 2,
            "passenger_name": "Taylor Swift",
            "passenger_email": "taylor@example.com",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["booking_id"].startswith("SHT-")
    assert data["route_id"] == "enchantments-connector"
    assert data["departure_date"] == "2026-10-03"
    assert data["departure_time"] == "06:30"
    assert data["seats"] == 2
    assert data["total_price"] == 60.0
    assert data["status"] == "confirmed"
    assert "instructions" in data


def test_post_shuttle_book_endpoint_not_found():
    res = client.post(
        "/api/shuttles/book",
        json={
            "route_id": "nonexistent-route",
            "departure_date": "2026-10-03",
            "departure_time": "06:30",
            "seats": 1,
            "passenger_name": "Taylor Swift",
            "passenger_email": "taylor@example.com",
        },
    )
    assert res.status_code == 404


def test_get_shuttles_carpools_endpoint():
    res = client.get("/api/shuttles/carpools")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 2

    res_filtered = client.get("/api/shuttles/carpools?destination=Rainier")
    assert res_filtered.status_code == 200
    data_filtered = res_filtered.json()
    assert len(data_filtered) >= 1
    assert all("Rainier".lower() in c["destination_trailhead"].lower() for c in data_filtered)


def test_post_shuttles_carpools_endpoint():
    res = client.post(
        "/api/shuttles/carpools",
        json={
            "origin_city": "Bend",
            "destination_trailhead": "Broken Top Trailhead",
            "departure_date": "2026-10-20",
            "seats_available": 2,
            "driver_name": "Morgan Riley",
            "contact_info": "morgan.riley@example.com",
            "notes": "High clearance 4x4 vehicle",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["carpool_id"].startswith("CPL-")
    assert data["origin_city"] == "Bend"
    assert data["seats_available"] == 2
    assert "created_at" in data


def test_create_response_mock_mode_with_shuttle_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "Are there shuttles for the Enchantments?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "shuttle_info" in data
        assert data["shuttle_info"]["action"] == "routes"
        assert "connector" in data["answer"].lower() or "shuttle" in data["answer"].lower()


def test_create_response_stream_mock_mode_emits_shuttle_info_event():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "What time does the Mount Rainier shuttle leave?"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        shuttle_event = next((e for e in events if e.get("event") == "shuttle_info"), None)
        assert shuttle_event is not None
        assert "shuttle_info" in shuttle_event
        assert shuttle_event["shuttle_info"]["action"] == "schedule"


def test_get_alpine_huts_endpoint():
    res = client.get("/api/huts")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 4

    res_cascades = client.get("/api/huts?range=cascades")
    assert res_cascades.status_code == 200
    cascades_huts = res_cascades.json()
    assert len(cascades_huts) >= 1
    assert all(h["range_name"] == "cascades" for h in cascades_huts)

    res_diff = client.get("/api/huts?difficulty=Technical")
    assert res_diff.status_code == 200
    tech_huts = res_diff.json()
    assert len(tech_huts) >= 1
    assert all(h["difficulty"] == "Technical" for h in tech_huts)


def test_get_alpine_hut_by_id_endpoint():
    res = client.get("/api/huts/asgard-refuge")
    assert res.status_code == 200
    data = res.json()
    assert data["hut_id"] == "asgard-refuge"
    assert data["elevation_feet"] == 7850
    assert "Microspikes" in data["mandatory_gear"]

    res_404 = client.get("/api/huts/unknown-hut")
    assert res_404.status_code == 404


def test_post_hut_quote_endpoint():
    res = client.post(
        "/api/huts/quote",
        json={"hut_id": "asgard-refuge", "nights": 2, "guests": 2},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["hut_id"] == "asgard-refuge"
    assert data["total_price"] == 180.0
    assert data["nights"] == 2
    assert data["guests"] == 2

    res_404 = client.post(
        "/api/huts/quote",
        json={"hut_id": "nonexistent-hut", "nights": 1, "guests": 1},
    )
    assert res_404.status_code == 404


def test_post_hut_book_endpoint():
    res = client.post(
        "/api/huts/book",
        json={
            "hut_id": "asgard-refuge",
            "checkin_date": "2026-10-15",
            "nights": 2,
            "guests": 2,
            "guest_name": "Jordan Romero",
            "guest_email": "jordan@example.com",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["booking_id"].startswith("HUT-")
    assert data["hut_id"] == "asgard-refuge"
    assert data["total_price"] == 180.0
    assert data["status"] == "confirmed"
    assert "instructions" in data

    res_404 = client.post(
        "/api/huts/book",
        json={
            "hut_id": "nonexistent-hut",
            "checkin_date": "2026-10-15",
            "nights": 1,
            "guests": 1,
            "guest_name": "Jordan Romero",
            "guest_email": "jordan@example.com",
        },
    )
    assert res_404.status_code == 404


def test_create_response_mock_mode_with_hut_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "Can I stay at the Asgard Pass alpine refuge?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "hut_info" in data
        assert data["hut_info"]["action"] == "huts"
        assert "Asgard Pass" in data["answer"]


def test_create_response_stream_mock_mode_emits_hut_info_event():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "How much does a bunk at Mueller Ridge cabin cost for 2 nights?"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        hut_event = next((e for e in events if e.get("event") == "hut_info"), None)
        assert hut_event is not None
        assert "hut_info" in hut_event
        assert hut_event["hut_info"]["action"] == "quote"


def test_get_volunteer_projects_endpoint():
    res = client.get("/api/volunteer/projects")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 4

    res_cascades = client.get("/api/volunteer/projects?region=Cascades")
    assert res_cascades.status_code == 200
    cascades = res_cascades.json()
    assert len(cascades) >= 2
    assert all(p["region"] == "Cascades" for p in cascades)

    res_diff = client.get("/api/volunteer/projects?difficulty=Strenuous")
    assert res_diff.status_code == 200
    strenuous = res_diff.json()
    assert len(strenuous) >= 1
    assert all(p["difficulty"] == "Strenuous" for p in strenuous)


def test_get_volunteer_project_by_id_endpoint():
    res = client.get("/api/volunteer/projects/mailbox-drainage")
    assert res.status_code == 200
    data = res.json()
    assert data["project_id"] == "mailbox-drainage"
    assert "Pulaski" in data["required_tools"]

    res_404 = client.get("/api/volunteer/projects/nonexistent-project")
    assert res_404.status_code == 404


def test_post_volunteer_register_endpoint():
    res = client.post(
        "/api/volunteer/register",
        json={
            "project_id": "mailbox-drainage",
            "volunteer_name": "Alex Honnold",
            "volunteer_email": "alex@example.com",
            "emergency_contact": "Clair Honnold",
            "emergency_phone": "555-0199",
            "waiver_acknowledged": True,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["registration_id"].startswith("VOL-")
    assert data["project_id"] == "mailbox-drainage"
    assert data["status"] == "confirmed"
    assert "instructions" in data

    res_404 = client.post(
        "/api/volunteer/register",
        json={
            "project_id": "nonexistent-project",
            "volunteer_name": "Alex Honnold",
            "volunteer_email": "alex@example.com",
            "emergency_contact": "Clair Honnold",
            "emergency_phone": "555-0199",
            "waiver_acknowledged": True,
        },
    )
    assert res_404.status_code == 404


def test_get_volunteer_impact_endpoint():
    res = client.get("/api/volunteer/impact")
    assert res.status_code == 200
    data = res.json()
    assert data["total_hours_logged"] >= 10000
    assert data["trails_maintained_miles"] > 0


def test_create_response_mock_mode_with_volunteer_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "How can I volunteer for trail work in the Cascades?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "volunteer_info" in data
        assert data["volunteer_info"]["action"] == "projects"
        assert "Mailbox Peak" in data["answer"]


def test_create_response_stream_mock_mode_emits_volunteer_info_event():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "How many volunteer hours has Contoso logged?"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        vol_event = next((e for e in events if e.get("event") == "volunteer_info"), None)
        assert vol_event is not None
        assert "volunteer_info" in vol_event
        assert vol_event["volunteer_info"]["action"] == "impact"


def test_get_water_sources_endpoint():
    res = client.get("/api/water/sources")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 4

    res_cascades = client.get("/api/water/sources?region=Cascades")
    assert res_cascades.status_code == 200
    cascades = res_cascades.json()
    assert len(cascades) >= 2
    assert all(s["region"] == "Cascades" for s in cascades)

    res_rel = client.get("/api/water/sources?reliability=Seasonal")
    assert res_rel.status_code == 200
    seasonal = res_rel.json()
    assert len(seasonal) >= 2
    assert all(s["reliability"] == "Seasonal" for s in seasonal)


def test_get_water_source_by_id_endpoint():
    res = client.get("/api/water/sources/colchuck-creek")
    assert res.status_code == 200
    data = res.json()
    assert data["source_id"] == "colchuck-creek"
    assert data["elevation_feet"] == 4100
    assert data["flow_status"] == "Flowing Strong"

    res_404 = client.get("/api/water/sources/nonexistent-source")
    assert res_404.status_code == 404


def test_post_water_hydration_endpoint():
    res = client.post(
        "/api/water/hydration",
        json={"distance_miles": 10.0, "elevation_gain_feet": 3000, "temp_fahrenheit": 80},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total_liters_needed"] == 3.8
    assert data["recommended_carrying_capacity_liters"] in (2.5, 3.0)
    assert "2.5 - 3.0 L" in data["hydration_advice"]


def test_post_water_reports_endpoint():
    res = client.post(
        "/api/water/reports",
        json={
            "source_id": "colchuck-creek",
            "reporter_name": "Alex Honnold",
            "flow_status": "Moderate Trickle",
            "turbidity": "Clear",
            "notes": "Late summer flow reduction.",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["report_id"].startswith("WTR-")
    assert data["source_name"] == "Colchuck Creek Footbridge Crossing"
    assert data["flow_status"] == "Moderate Trickle"
    assert data["status"] == "verified"

    res_404 = client.post(
        "/api/water/reports",
        json={
            "source_id": "nonexistent-source",
            "reporter_name": "Alex Honnold",
            "flow_status": "Dry",
            "turbidity": "High",
        },
    )
    assert res_404.status_code == 404


def test_get_water_pathogens_endpoint():
    res = client.get("/api/water/pathogens")
    assert res.status_code == 200
    data = res.json()
    assert "pathogens" in data
    assert "technologies" in data
    assert "hollow_fiber" in data["technologies"]


def test_create_response_mock_mode_with_water_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "Where can I get water on the Colchuck Lake trail?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "water_info" in data
        assert data["water_info"]["action"] == "sources"
        assert "Colchuck Creek" in data["answer"]


def test_create_response_stream_mock_mode_emits_water_info_event():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "Does a Sawyer Squeeze kill cryptosporidium or viruses?"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        water_event = next((e for e in events if e.get("event") == "water_info"), None)
        assert water_event is not None
        assert "water_info" in water_event
        assert water_event["water_info"]["action"] in ("filtration", "pathogens")


def test_get_fire_zones_endpoint():
    res = client.get("/api/fire-safety/zones")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 5

    res_reg = client.get("/api/fire-safety/zones?region=North Cascades")
    assert res_reg.status_code == 200
    assert len(res_reg.json()) >= 1

    res_danger = client.get("/api/fire-safety/zones?danger_level=extreme")
    assert res_danger.status_code == 200
    assert len(res_danger.json()) == 1


def test_get_fire_zone_by_id_endpoint():
    res = client.get("/api/fire-safety/zones/alpine-lakes")
    assert res.status_code == 200
    data = res.json()
    assert data["zone_id"] == "alpine-lakes"
    assert data["name"] == "Alpine Lakes Wilderness"

    res_404 = client.get("/api/fire-safety/zones/nonexistent-zone")
    assert res_404.status_code == 404


def test_post_fire_safety_check_stove_endpoint():
    res_canister = client.post(
        "/api/fire-safety/check-stove",
        json={"zone_id": "alpine-lakes", "stove_type": "canister stove"},
    )
    assert res_canister.status_code == 200
    assert res_canister.json()["is_allowed"] is True

    res_alcohol = client.post(
        "/api/fire-safety/check-stove",
        json={"zone_id": "alpine-lakes", "stove_type": "alcohol stove"},
    )
    assert res_alcohol.status_code == 200
    assert res_alcohol.json()["is_allowed"] is False

    res_404 = client.post(
        "/api/fire-safety/check-stove",
        json={"zone_id": "nonexistent", "stove_type": "canister"},
    )
    assert res_404.status_code == 404


def test_post_fire_safety_reports_endpoint():
    res = client.post(
        "/api/fire-safety/reports",
        json={
            "zone_id": "north-cascades-stehekin",
            "location_description": "Smoke near trail",
            "report_type": "smoke",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["report_id"].startswith("FIR-")
    assert data["status"] == "confirmed"

    res_404 = client.post(
        "/api/fire-safety/reports",
        json={
            "zone_id": "nonexistent",
            "location_description": "Smoke",
            "report_type": "smoke",
        },
    )
    assert res_404.status_code == 404


def test_get_fire_safety_protocol_endpoint():
    res = client.get("/api/fire-safety/protocol")
    assert res.status_code == 200
    data = res.json()
    assert "principles" in data
    assert "drown_stir_technique" in data


def test_create_response_mock_mode_with_fire_safety_intent():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response",
            json={"question": "Are campfires allowed in Alpine Lakes Wilderness?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "fire_safety_info" in data
        assert data["fire_safety_info"]["action"] == "regulations"
        assert "Alpine Lakes" in data["answer"]


def test_create_response_stream_mock_mode_emits_fire_safety_info_event():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "Can I use an alcohol stove in Alpine Lakes Wilderness?"},
        )
        assert res.status_code == 200
        events = [
            json.loads(line.removeprefix("data: "))
            for line in res.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        fire_event = next((e for e in events if e.get("event") == "fire_safety_info"), None)
        assert fire_event is not None
        assert "fire_safety_info" in fire_event
        assert fire_event["fire_safety_info"]["action"] == "stove_check"
