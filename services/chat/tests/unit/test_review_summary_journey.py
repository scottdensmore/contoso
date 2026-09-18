import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_complete_review_summary_journey():
    """
    End-to-End API journey test for Product Review Summary & Sentiment Tooling:
    - Step 1: GET /api/reviews/trailmaster-x4-tent/summary returns review summary with pros, cons, sentiment, and rating.
    - Step 2: GET /api/reviews/adventurer-pro-backpack/summary returns backpack review summary.
    - Step 3: POST /api/create_response asking "What are the pros and cons of the TrailMaster tent according to customers?"
              returns response with review_summary payload.
    - Step 4: POST /api/create_response/stream emits event: review_summary frame in SSE stream.
    - Step 5: GET /api/reviews/unknown-product-999/summary returns 404 cleanly.
    """
    # -------------------------------------------------------------------------
    # Step 1: GET /api/reviews/trailmaster-x4-tent/summary returns review summary with pros, cons, sentiment, and rating
    # -------------------------------------------------------------------------
    res1 = client.get("/api/reviews/trailmaster-x4-tent/summary")
    assert res1.status_code == 200
    tent_summary = res1.json()
    assert tent_summary["product_slug"] == "trailmaster-x4-tent"
    assert tent_summary["product_name"] == "TrailMaster X4 Tent"
    assert tent_summary["average_rating"] == 4.7
    assert tent_summary["total_reviews"] == 48
    assert tent_summary["sentiment"] == "positive"
    assert "Waterproof double-wall construction" in tent_summary["pros"]
    assert "Packed weight is slightly heavy" in tent_summary["cons"]
    assert tent_summary["recommendation_percentage"] == 94
    assert "key_quote" in tent_summary

    # -------------------------------------------------------------------------
    # Step 2: GET /api/reviews/adventurer-pro-backpack/summary returns backpack review summary
    # -------------------------------------------------------------------------
    res2 = client.get("/api/reviews/adventurer-pro-backpack/summary")
    assert res2.status_code == 200
    bp_summary = res2.json()
    assert bp_summary["product_slug"] == "adventurer-pro-backpack"
    assert bp_summary["product_name"] == "Adventurer Pro Backpack"
    assert bp_summary["average_rating"] == 4.8
    assert bp_summary["total_reviews"] == 62
    assert bp_summary["sentiment"] == "positive"
    assert "Ergonomic lumbar support" in bp_summary["pros"]
    assert "Side water bottle pockets are tight when fully loaded" in bp_summary["cons"]
    assert bp_summary["recommendation_percentage"] == 96

    # -------------------------------------------------------------------------
    # Step 3: POST /api/create_response asking
    #         "What are the pros and cons of the TrailMaster tent according to customers?"
    #         returns response with review_summary payload
    # -------------------------------------------------------------------------
    with patch("main.REAL_CHAT_AVAILABLE", False):
        chat_res = client.post(
            "/api/create_response",
            json={"question": "What are the pros and cons of the TrailMaster tent according to customers?"},
        )
        assert chat_res.status_code == 200
        chat_data = chat_res.json()

        assert "answer" in chat_data
        assert "review_summary" in chat_data
        summary_payload = chat_data["review_summary"]
        assert isinstance(summary_payload, dict)
        assert summary_payload.get("product_slug") == "trailmaster-x4-tent"
        assert summary_payload.get("average_rating") == 4.7
        assert "Waterproof double-wall construction" in summary_payload.get("pros", [])
        assert "Packed weight is slightly heavy" in summary_payload.get("cons", [])

    # -------------------------------------------------------------------------
    # Step 4: POST /api/create_response/stream emits event: review_summary frame in SSE stream
    # -------------------------------------------------------------------------
    with patch("main.REAL_CHAT_AVAILABLE", False):
        stream_res = client.post(
            "/api/create_response/stream",
            json={"question": "What are the pros and cons of the TrailMaster tent according to customers?"},
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

        review_event = next((e for e in parsed_events if e.get("event") == "review_summary"), None)
        assert review_event is not None
        assert "review_summary" in review_event
        assert review_event["review_summary"].get("product_slug") == "trailmaster-x4-tent"

        # Event: 'review_summary' frame must be emitted before text chunk tokens
        review_idx = next(i for i, e in enumerate(parsed_events) if e.get("event") == "review_summary")
        chunk_indices = [i for i, e in enumerate(parsed_events) if "chunk" in e]
        assert len(chunk_indices) > 0
        assert review_idx < chunk_indices[0], "Review summary SSE frame must be emitted before text chunk tokens"

    # -------------------------------------------------------------------------
    # Step 5: GET /api/reviews/unknown-product-999/summary returns 404 cleanly
    # -------------------------------------------------------------------------
    not_found_res = client.get("/api/reviews/unknown-product-999/summary")
    assert not_found_res.status_code == 404
    error_data = not_found_res.json()
    assert error_data["detail"] == "Review summary not found for product: unknown-product-999"
