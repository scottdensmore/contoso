import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_complete_faq_intent_and_instant_answers_journey():
    """
    End-to-End API journey test for FAQ Intent Detection & Instant Answers Tooling:
    - Step 1: GET /api/faq returns all categorized FAQs.
    - Step 2: GET /api/faq/warranty returns specific warranty policy details.
    - Step 3: POST /api/create_response with question "What is your warranty policy on outdoor gear?"
              returns answer with faq payload.
    - Step 4: POST /api/create_response/stream emits event: faq frame in SSE stream.
    - Step 5: GET /api/faq/unknown-faq-999 returns 404 cleanly.
    - Step 6: Query GET /api/faq?category=returns filters results by category.
    """
    # -------------------------------------------------------------------------
    # Step 1: GET /api/faq returns all categorized FAQs
    # -------------------------------------------------------------------------
    faq_res = client.get("/api/faq")
    assert faq_res.status_code == 200
    faqs = faq_res.json()
    assert isinstance(faqs, list)
    assert len(faqs) >= 7

    faq_ids = {item["faq_id"] for item in faqs}
    required_ids = {
        "returns",
        "shipping",
        "warranty",
        "price_match",
        "gear_care",
        "rewards",
        "rentals",
    }
    assert required_ids.issubset(faq_ids)

    for item in faqs:
        assert "faq_id" in item
        assert "question" in item
        assert "answer" in item
        assert "category" in item
        assert "keywords" in item
        assert isinstance(item["keywords"], list)
        assert len(item["keywords"]) > 0

    # -------------------------------------------------------------------------
    # Step 2: GET /api/faq/warranty returns specific warranty policy details
    # -------------------------------------------------------------------------
    warranty_res = client.get("/api/faq/warranty")
    assert warranty_res.status_code == 200
    warranty_item = warranty_res.json()
    assert warranty_item["faq_id"] == "warranty"
    assert warranty_item["category"] == "warranty"
    assert "1-year" in warranty_item["answer"] or "warranty" in warranty_item["answer"].lower()
    assert "materials" in warranty_item["answer"].lower() or "craftsmanship" in warranty_item["answer"].lower()
    assert warranty_item.get("url") is not None

    # -------------------------------------------------------------------------
    # Step 3: POST /api/create_response with question
    #         "What is your warranty policy on outdoor gear?"
    #         returns answer with faq payload
    # -------------------------------------------------------------------------
    with patch("main.REAL_CHAT_AVAILABLE", False):
        chat_res = client.post(
            "/api/create_response",
            json={"question": "What is your warranty policy on outdoor gear?"},
        )
        assert chat_res.status_code == 200
        chat_data = chat_res.json()

        assert "answer" in chat_data
        assert "faq" in chat_data
        faq_payload = chat_data["faq"]
        assert isinstance(faq_payload, list)
        assert len(faq_payload) > 0

        matched_warranty = next((item for item in faq_payload if item["faq_id"] == "warranty"), None)
        assert matched_warranty is not None
        assert matched_warranty["category"] == "warranty"
        assert "1-year" in matched_warranty["answer"] or "warranty" in matched_warranty["answer"].lower()

        # Answer provides policy guidance
        assert "warranty" in chat_data["answer"].lower()

    # -------------------------------------------------------------------------
    # Step 4: POST /api/create_response/stream emits event: faq frame in SSE stream
    # -------------------------------------------------------------------------
    with patch("main.REAL_CHAT_AVAILABLE", False):
        stream_res = client.post(
            "/api/create_response/stream",
            json={"question": "What is your warranty policy on outdoor gear?"},
        )
        assert stream_res.status_code == 200
        assert "text/event-stream" in stream_res.headers.get("content-type", "")

        raw_lines = [
            line.strip()
            for line in stream_res.text.split("\n\n")
            if line.strip() and line.strip() != "data: [DONE]"
        ]
        parsed_events = []
        for raw in raw_lines:
            assert raw.startswith("data: ")
            parsed_events.append(json.loads(raw.removeprefix("data: ")))

        faq_event = next((e for e in parsed_events if e.get("event") == "faq"), None)
        assert faq_event is not None
        assert "faq" in faq_event
        assert isinstance(faq_event["faq"], list)
        assert any(item["faq_id"] == "warranty" for item in faq_event["faq"])

        # Event: 'faq' frame must be emitted before text chunk tokens
        faq_idx = next(i for i, e in enumerate(parsed_events) if e.get("event") == "faq")
        chunk_indices = [i for i, e in enumerate(parsed_events) if "chunk" in e]
        assert len(chunk_indices) > 0
        assert faq_idx < chunk_indices[0], "FAQ SSE frame must be emitted before text chunk tokens"

    # -------------------------------------------------------------------------
    # Step 5: GET /api/faq/unknown-faq-999 returns 404 cleanly
    # -------------------------------------------------------------------------
    not_found_res = client.get("/api/faq/unknown-faq-999")
    assert not_found_res.status_code == 404
    error_data = not_found_res.json()
    assert error_data["detail"] == "FAQ topic not found: unknown-faq-999"

    # -------------------------------------------------------------------------
    # Step 6: Query GET /api/faq?category=returns filters results by category
    # -------------------------------------------------------------------------
    filtered_res = client.get("/api/faq?category=returns")
    assert filtered_res.status_code == 200
    filtered_faqs = filtered_res.json()
    assert isinstance(filtered_faqs, list)
    assert len(filtered_faqs) == 1
    assert filtered_faqs[0]["faq_id"] == "returns"
    assert filtered_faqs[0]["category"] == "returns"
    assert "30-day" in filtered_faqs[0]["answer"] or "30" in filtered_faqs[0]["answer"]
