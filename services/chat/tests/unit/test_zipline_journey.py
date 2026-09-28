import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_zipline_journey():
    """Multi-step API journey test for Wilderness Canyon Zipline Canopy Aerial Traversing Tooling:

    Step 1: Health & readiness check (/healthz, /ready, /api/status).
    Step 2: List courses (/api/zipline/courses), filter by course_type.
    Step 3: Fetch specific course detail (/api/zipline/courses/royal-gorge-canyon-extreme) and 404.
    Step 4: Post calculate dynamics (/api/zipline/calculate) and 404 for unknown course.
    Step 5: Get gear checklist (/api/zipline/gear).
    Step 6: Test create_response endpoint with mock client, verifying zipline_info in response payload.
    Step 7: Test create_response/stream SSE endpoint verifying SSE data events (zipline_lookup / zipline_calculated and zipline_info).
    """
    # -------------------------------------------------------------------------
    # Step 1: Health & readiness check
    # -------------------------------------------------------------------------
    res_healthz = client.get("/healthz")
    assert res_healthz.status_code == 200
    assert res_healthz.json()["status"] == "healthy"

    res_ready = client.get("/ready")
    assert res_ready.status_code == 200
    assert res_ready.json()["status"] == "healthy"

    res_status = client.get("/api/status")
    assert res_status.status_code == 200
    assert res_status.json()["status"] == "online"

    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 2: List courses (/api/zipline/courses), filter by course_type
        # -------------------------------------------------------------------------
        res2 = client.get("/api/zipline/courses")
        assert res2.status_code == 200
        courses = res2.json()
        assert len(courses) == 5
        course_ids = [c["course_id"] for c in courses]
        assert "royal-gorge-canyon-extreme" in course_ids
        assert "snake-river-canyon-highline" in course_ids
        assert "haleakala-canopy-rainforest" in course_ids
        assert "red-river-gorge-cliffside" in course_ids
        assert "new-river-gorge-span-express" in course_ids

        # Filter by course_type=canopy_tour
        res2_filt = client.get("/api/zipline/courses?course_type=canopy_tour")
        assert res2_filt.status_code == 200
        filt_courses = res2_filt.json()
        assert len(filt_courses) >= 1
        for c in filt_courses:
            assert c["course_type"] == "canopy_tour"

        # -------------------------------------------------------------------------
        # Step 3: Fetch specific course detail & 404 for unknown
        # -------------------------------------------------------------------------
        res3 = client.get("/api/zipline/courses/royal-gorge-canyon-extreme")
        assert res3.status_code == 200
        detail = res3.json()
        assert detail["course_id"] == "royal-gorge-canyon-extreme"
        assert detail["span_length_ft"] == 2400
        assert detail["vertical_drop_ft"] == 450
        assert "ZipStop" in detail["braking_system"]
        assert len(detail["highlights"]) >= 2

        # 404 for nonexistent course
        res3_404 = client.get("/api/zipline/courses/nonexistent-canyon-course")
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Post calculate dynamics & 404 for unknown course
        # -------------------------------------------------------------------------
        calc_payload = {
            "course_id": "royal-gorge-canyon-extreme",
            "rider_payload_lbs": 175.0,
            "line_length_ft": 2400,
            "slope_grade_percent": 15.0,
            "trolley_bearing": "dual_steel_high_speed",
        }
        res4 = client.post("/api/zipline/calculate", json=calc_payload)
        assert res4.status_code == 200
        calc_data = res4.json()
        assert calc_data["course_id"] == "royal-gorge-canyon-extreme"
        assert 39.0 <= calc_data["calculated_speed_mph"] <= 42.0
        assert calc_data["braking_distance_ft"] > 0
        assert calc_data["cable_tension_kn"] == 23.4
        assert calc_data["safety_rating"] == "optimal_descent_dynamics"
        assert "ZipStop" in calc_data["braking_advisory"]

        # 404 for invalid course in calculate
        res4_404 = client.post("/api/zipline/calculate", json={"course_id": "invalid-course"})
        assert res4_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 5: Get gear checklist (/api/zipline/gear)
        # -------------------------------------------------------------------------
        res5 = client.get("/api/zipline/gear")
        assert res5.status_code == 200
        gear_items = res5.json()
        assert len(gear_items) == 6
        gear_ids = [g["item_id"] for g in gear_items]
        assert "high-speed-zipline-trolley" in gear_ids
        assert "full-body-zipline-harness" in gear_ids
        assert "climbing-helmet-cert" in gear_ids
        assert "heavy-duty-leather-braking-gloves" in gear_ids
        assert "dynamic-backup-lanyard" in gear_ids
        assert "impact-arrest-zipstop-carriage" in gear_ids

        # -------------------------------------------------------------------------
        # Step 6: Test create_response endpoint with mock client
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the cable tension and braking distance for Royal Gorge zipline canopy tour?",
            "customer_id": "cust-zipline-101",
        }
        res6 = client.post("/api/create_response", json=chat_req)
        assert res6.status_code == 200
        data6 = res6.json()
        assert "zipline_info" in data6
        zip_info = data6["zipline_info"]
        assert zip_info is not None
        assert "answer" in data6
        assert len(data6["answer"]) > 0

        # -------------------------------------------------------------------------
        # Step 7: Test create_response/stream SSE endpoint
        # -------------------------------------------------------------------------
        stream_req_calc = {
            "question": "Calculate zipline speed and braking distance for 175 lb rider on Royal Gorge",
        }
        res7_calc = client.post("/api/create_response/stream", json=stream_req_calc)
        assert res7_calc.status_code == 200
        raw_chunks = [c.strip() for c in res7_calc.text.split("\n\n") if c.strip()]
        assert "data: [DONE]" in raw_chunks

        parsed_events = []
        for line in raw_chunks:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        # Verify custom calculation event
        calc_event = next(
            (e for e in parsed_events if e.get("event") in ("zipline_calculated", "calculate_dynamics")),
            None,
        )
        assert calc_event is not None
        assert "zipline_info" in calc_event
        assert calc_event["zipline_info"]["action"] in ("calculate", "calculate_dynamics")

        # Verify zipline_info event
        info_event = next(
            (e for e in parsed_events if e.get("event") == "zipline_info"),
            None,
        )
        assert info_event is not None

        # Verify token streaming events
        token_events = [
            e for e in parsed_events if "chunk" in e or "token" in e or e.get("event") == "token"
        ]
        assert len(token_events) > 0
        full_text = "".join(str(e.get("chunk") or e.get("token", "")) for e in token_events)
        assert len(full_text) > 0

        # Verify lookup custom event
        stream_req_lookup = {
            "question": "Tell me about the Royal Gorge extreme zipline course details",
        }
        res7_lookup = client.post("/api/create_response/stream", json=stream_req_lookup)
        assert res7_lookup.status_code == 200
        raw_chunks_lookup = [c.strip() for c in res7_lookup.text.split("\n\n") if c.strip()]
        assert "data: [DONE]" in raw_chunks_lookup

        parsed_lookup = []
        for line in raw_chunks_lookup:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_lookup.append(json.loads(line.removeprefix("data: ")))

        lookup_event = next(
            (e for e in parsed_lookup if e.get("event") == "zipline_lookup"),
            None,
        )
        assert lookup_event is not None
        assert "zipline_info" in lookup_event
        assert lookup_event["zipline_info"]["course_id"] == "royal-gorge-canyon-extreme"


@pytest.mark.anyio
async def test_zipline_journey_real_mode_execution():
    """Step 8: Verifies zipline prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Alice", "membership": "CanopyGuide", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="On the Royal Gorge canyon zipline, ensure dual ZipStop magnetic braking runout."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the cable tension and ZipStop braking requirement for Royal Gorge canyon zipline?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "zipline_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "zipline_prompt" in call_kwargs
        assert (
            "zipline" in call_kwargs["zipline_prompt"].lower()
            or "canyon" in call_kwargs["zipline_prompt"].lower()
            or "zipstop" in call_kwargs["zipline_prompt"].lower()
        )
