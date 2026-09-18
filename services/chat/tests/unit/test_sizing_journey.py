import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_complete_sizing_and_fit_advisor_journey():
    """
    End-to-End API journey test for Sizing & Fit Advisor Assistant Tooling:
    - Step 1: GET /api/sizing/jackets returns apparel size guide with all sizes and measurements.
    - Step 2: GET /api/sizing/footwear returns footwear size guide with US/EU conversions.
    - Step 3: POST /api/create_response asking "What size jacket should I get for a 40 inch chest?"
              returns response with sizing payload.
    - Step 4: POST /api/create_response/stream emits event: sizing frame in SSE stream.
    - Step 5: GET /api/sizing/unknown-category-999 returns 404 cleanly.
    """
    # -------------------------------------------------------------------------
    # Step 1: GET /api/sizing/jackets returns apparel size guide with all sizes and measurements
    # -------------------------------------------------------------------------
    jackets_res = client.get("/api/sizing/jackets")
    assert jackets_res.status_code == 200
    jackets_guide = jackets_res.json()
    assert "category" in jackets_guide
    assert jackets_guide["category"] in ("jackets", "apparel")
    assert "title" in jackets_guide
    assert "description" in jackets_guide
    assert "measurement_instructions" in jackets_guide
    assert "rows" in jackets_guide
    assert isinstance(jackets_guide["rows"], list)

    jacket_sizes = [r["size"] for r in jackets_guide["rows"]]
    for size in ["XS", "S", "M", "L", "XL", "XXL"]:
        assert size in jacket_sizes

    m_row = next(r for r in jackets_guide["rows"] if r["size"] == "M")
    assert "chest_in" in m_row["measurements"]
    assert "chest_cm" in m_row["measurements"]
    assert "waist_in" in m_row["measurements"]
    assert "waist_cm" in m_row["measurements"]

    # -------------------------------------------------------------------------
    # Step 2: GET /api/sizing/footwear returns footwear size guide with US/EU conversions
    # -------------------------------------------------------------------------
    footwear_res = client.get("/api/sizing/footwear")
    assert footwear_res.status_code == 200
    footwear_guide = footwear_res.json()
    assert "rows" in footwear_guide
    assert len(footwear_guide["rows"]) >= 6

    # Verify US / EU conversions exist in measurements
    has_eu = any("eu" in r["measurements"] for r in footwear_guide["rows"])
    has_us_or_length = any(
        "us" in r["measurements"] or "foot_length_in" in r["measurements"] or "foot_length_cm" in r["measurements"]
        for r in footwear_guide["rows"]
    )
    assert has_eu
    assert has_us_or_length

    # -------------------------------------------------------------------------
    # Step 3: POST /api/create_response asking
    #         "What size jacket should I get for a 40 inch chest?"
    #         returns response with sizing payload
    # -------------------------------------------------------------------------
    with patch("main.REAL_CHAT_AVAILABLE", False):
        chat_res = client.post(
            "/api/create_response",
            json={"question": "What size jacket should I get for a 40 inch chest?"},
        )
        assert chat_res.status_code == 200
        chat_data = chat_res.json()

        assert "answer" in chat_data
        assert "sizing" in chat_data
        sizing_payload = chat_data["sizing"]
        assert isinstance(sizing_payload, dict)
        assert sizing_payload.get("category") in ("jackets", "apparel")
        assert "rows" in sizing_payload
        assert len(sizing_payload["rows"]) > 0

        # Answer should provide sizing advice
        assert "M" in chat_data["answer"] or "size" in chat_data["answer"].lower()

    # -------------------------------------------------------------------------
    # Step 4: POST /api/create_response/stream emits event: sizing frame in SSE stream
    # -------------------------------------------------------------------------
    with patch("main.REAL_CHAT_AVAILABLE", False):
        stream_res = client.post(
            "/api/create_response/stream",
            json={"question": "What size jacket should I get for a 40 inch chest?"},
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

        sizing_event = next((e for e in parsed_events if e.get("event") == "sizing"), None)
        assert sizing_event is not None
        assert "sizing" in sizing_event
        assert sizing_event["sizing"].get("category") in ("jackets", "apparel")

        # Event: 'sizing' frame must be emitted before text chunk tokens
        sizing_idx = next(i for i, e in enumerate(parsed_events) if e.get("event") == "sizing")
        chunk_indices = [i for i, e in enumerate(parsed_events) if "chunk" in e]
        assert len(chunk_indices) > 0
        assert sizing_idx < chunk_indices[0], "Sizing SSE frame must be emitted before text chunk tokens"

    # -------------------------------------------------------------------------
    # Step 5: GET /api/sizing/unknown-category-999 returns 404 cleanly
    # -------------------------------------------------------------------------
    not_found_res = client.get("/api/sizing/unknown-category-999")
    assert not_found_res.status_code == 404
    error_data = not_found_res.json()
    assert error_data["detail"] == "Sizing guide not found for category: unknown-category-999"
