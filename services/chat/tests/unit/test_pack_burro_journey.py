import json
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_pack_burro_journey():
    """Multi-step API journey test for Wilderness Pack-Burro Racing & Ass Packing Tooling:

    Step 1: Query pack burro courses with burro_type filter (GET /pack-burro/courses and /api/pack-burro/courses).
    Step 2: Query specific course detail (GET /pack-burro/courses/{course_id}).
    Step 3: Post to payload calculation endpoint (POST /pack-burro/calculate).
    Step 4: Query mandatory burro gear checklist (GET /pack-burro/gear).
    Step 5: Post chat query to create_response and verify pack_burro_info metadata.
    Step 6: Post chat query to create_response/stream and assert SSE event pack_burro_info.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query pack burro courses with burro_type filter
        # -------------------------------------------------------------------------
        res1 = client.get("/pack-burro/courses")
        if res1.status_code == 404:
            res1 = client.get("/api/pack-burro/courses")
        assert res1.status_code == 200
        courses = res1.json()
        assert len(courses) == 5
        course_ids = [c["course_id"] for c in courses]
        assert "leadville-boom-days-mosquito-pass" in course_ids
        assert "fairplay-burro-days-pass" in course_ids
        assert "buena-vista-gold-rush-days" in course_ids
        assert "georgetown-canyon-burro-run" in course_ids
        assert "idaho-springs-tombstone-dash" in course_ids

        # Filter by burro_type=mammoth_donkey
        res1_mammoth = client.get("/pack-burro/courses?burro_type=mammoth_donkey")
        if res1_mammoth.status_code == 404:
            res1_mammoth = client.get("/api/pack-burro/courses?burro_type=mammoth_donkey")
        assert res1_mammoth.status_code == 200
        mammoth_courses = res1_mammoth.json()
        assert len(mammoth_courses) == 1
        assert mammoth_courses[0]["course_id"] == "georgetown-canyon-burro-run"
        assert mammoth_courses[0]["default_burro_type"] == "mammoth_donkey"

        # -------------------------------------------------------------------------
        # Step 2: Query specific course detail
        # -------------------------------------------------------------------------
        res2 = client.get("/pack-burro/courses/leadville-boom-days-mosquito-pass")
        if res2.status_code == 404:
            res2 = client.get("/api/pack-burro/courses/leadville-boom-days-mosquito-pass")
        assert res2.status_code == 200
        leadville_course = res2.json()
        assert leadville_course["course_id"] == "leadville-boom-days-mosquito-pass"
        assert "Mosquito Pass" in leadville_course["title"]
        assert leadville_course["summit_elevation_m"] == 4019
        assert leadville_course["max_grade_percent"] == 24

        # 404 for unknown course
        res2_404 = client.get("/pack-burro/courses/unknown-course")
        if res2_404.status_code != 404:
            res2_404 = client.get("/api/pack-burro/courses/unknown-course")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Post to payload calculation endpoint
        # -------------------------------------------------------------------------
        calc_payload = {
            "course_id": "leadville-boom-days-mosquito-pass",
            "burro_type": "standard_burro",
            "pack_weight_lbs": 35.0,
            "slope_gradient_percent": 18.0,
            "runner_pace_min_per_mile": 10.0,
        }
        res3 = client.post("/pack-burro/calculate", json=calc_payload)
        if res3.status_code == 404:
            res3 = client.post("/api/pack-burro/calculate", json=calc_payload)
        assert res3.status_code == 200
        calc_data = res3.json()
        assert calc_data["course_id"] == "leadville-boom-days-mosquito-pass"
        assert calc_data["weight_status"] == "regulation_compliant"
        assert calc_data["braking_force_lbs"] == 16
        assert calc_data["oxygen_level_percent"] == 62
        assert calc_data["team_status"] == "optimal_race_cadence"

        # 404 for invalid course in calculate
        res3_404 = client.post("/pack-burro/calculate", json={"course_id": "invalid-pack-course"})
        if res3_404.status_code != 404:
            res3_404 = client.post("/api/pack-burro/calculate", json={"course_id": "invalid-pack-course"})
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Query mandatory burro gear checklist
        # -------------------------------------------------------------------------
        res4 = client.get("/pack-burro/gear")
        if res4.status_code == 404:
            res4 = client.get("/api/pack-burro/gear")
        assert res4.status_code == 200
        gear_list = res4.json()
        assert len(gear_list) == 6
        gear_ids = [g["item_id"] for g in gear_list]
        assert "regulation-pack-saddle" in gear_ids
        assert "prospector-mining-kit" in gear_ids
        assert "cotton-lead-rope" in gear_ids
        assert "equine-cooling-electrolyte" in gear_ids
        assert "hoof-pick-and-rasp" in gear_ids
        assert "high-visibility-runner-vest" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Post chat query to create_response and verify pack_burro_info
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the mandatory 33 lb pack saddle rule for the Leadville Boom Days Mosquito Pass burro race?",
            "customer_id": "cust-burro-77",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "pack_burro_info" in data5
        pb_info = data5["pack_burro_info"]
        assert pb_info is not None
        assert pb_info["course_id"] == "leadville-boom-days-mosquito-pass"

        # -------------------------------------------------------------------------
        # Step 6: Post chat query to create_response/stream and assert SSE event
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Tell me about the Leadville Boom Days Mosquito Pass burro race course"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        pb_event = next((e for e in parsed_events if e.get("event") == "pack_burro_info"), None)
        assert pb_event is not None
        assert "pack_burro_info" in pb_event
        stream_pb_info = pb_event["pack_burro_info"]
        assert stream_pb_info is not None
        assert stream_pb_info["course_id"] == "leadville-boom-days-mosquito-pass"

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Leadville" in full_text or "Mosquito Pass" in full_text


@pytest.mark.anyio
async def test_pack_burro_journey_real_mode_execution():
    """Step 7: Verifies pack burro prompt injection and payload parity in real LLM mode."""
    from unittest.mock import AsyncMock, MagicMock

    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Calamity", "membership": "Gold", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="For the Leadville Boom Days Mosquito Pass burro race, a regulation 33 lb sawbuck pack saddle is mandatory."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Tell me about the Leadville Boom Days Mosquito Pass burro race course"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "pack_burro_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "pack_burro_prompt" in call_kwargs
        assert "Leadville" in call_kwargs["pack_burro_prompt"] or "Mosquito Pass" in call_kwargs["pack_burro_prompt"]
