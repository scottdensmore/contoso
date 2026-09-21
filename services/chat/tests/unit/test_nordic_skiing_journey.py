import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_nordic_skiing_journey():
    """Multi-step API journey test for Nordic & Cross-Country Ski Grooming & Kick Wax Advisor Tooling:

    Step 1: Query trails with discipline filter (GET /api/nordic-skiing/trails?discipline=skate).
    Step 2: Query specific trail detail (GET /api/nordic-skiing/trails/methow-valley-community-trail).
    Step 3: Post to wax plan calculation endpoint (POST /api/nordic-skiing/wax-plan).
    Step 4: Query mandatory Nordic equipment checklist (GET /api/nordic-skiing/gear-checklist).
    Step 5: Post chat query to create_response and verify nordic_skiing_info metadata.
    Step 6: Post chat query to create_response/stream and assert SSE event nordic_skiing_info.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query trails with discipline filter (GET /api/nordic-skiing/trails)
        # -------------------------------------------------------------------------
        res1 = client.get("/api/nordic-skiing/trails")
        assert res1.status_code == 200
        trails = res1.json()
        assert len(trails) == 5
        trail_ids = [t["trail_id"] for t in trails]
        assert "methow-valley-community-trail" in trail_ids
        assert "trapp-family-sugar-road" in trail_ids
        assert "devil-thumb-ranch-high-lonesome" in trail_ids
        assert "royal-gorge-rainbow-ridge" in trail_ids
        assert "boundary-waters-banadad-trail" in trail_ids

        # Filter by discipline
        res1_skate = client.get("/api/nordic-skiing/trails?discipline=skate")
        assert res1_skate.status_code == 200
        skate_trails = res1_skate.json()
        assert len(skate_trails) == 4
        skate_ids = [t["trail_id"] for t in skate_trails]
        assert "boundary-waters-banadad-trail" not in skate_ids
        assert "methow-valley-community-trail" in skate_ids

        # -------------------------------------------------------------------------
        # Step 2: Query specific trail detail (GET /api/nordic-skiing/trails/{trail_id})
        # -------------------------------------------------------------------------
        res2 = client.get("/api/nordic-skiing/trails/methow-valley-community-trail")
        assert res2.status_code == 200
        methow = res2.json()
        assert methow["trail_id"] == "methow-valley-community-trail"
        assert methow["trail_name"] == "Methow Community Trail"
        assert "Winthrop" in methow["region"] or "Washington" in methow["region"]
        assert methow["distance_km"] == 30.0
        assert methow["groomed_daily"] is True
        assert methow["skate_lane_width_m"] >= 8.0
        assert methow["classic_tracks_count"] >= 2
        assert len(methow["trail_highlights"]) >= 2

        # 404 for unknown trail
        res2_404 = client.get("/api/nordic-skiing/trails/unknown-nordic-trail")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Post to wax plan calculation endpoint (POST /api/nordic-skiing/wax-plan)
        # -------------------------------------------------------------------------
        wax_req = {
            "trail_id": "methow-valley-community-trail",
            "air_temperature_f": 24.0,
            "snow_condition": "packed_powder",
            "ski_base_type": "waxable",
        }
        res3 = client.post("/api/nordic-skiing/wax-plan", json=wax_req)
        assert res3.status_code == 200
        plan_data = res3.json()
        assert plan_data["trail_id"] == "methow-valley-community-trail"
        assert "Methow" in plan_data["trail_and_system"]
        assert "Blue Extra" in plan_data["recommended_kick_wax"]
        assert plan_data["klister_required"] is False
        assert "fast" in plan_data["glide_speed_rating"].lower() or "optimal" in plan_data["glide_speed_rating"].lower()
        assert len(plan_data["wax_advisory"]) > 20

        # 404 for non-existent trail in wax plan
        res3_404 = client.post(
            "/api/nordic-skiing/wax-plan", json={"trail_id": "invalid-nordic-trail"}
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Query mandatory Nordic equipment checklist (GET /api/nordic-skiing/gear-checklist)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/nordic-skiing/gear-checklist")
        assert res4.status_code == 200
        gear_list = res4.json()
        assert len(gear_list) == 6
        gear_ids = [g["item_id"] for g in gear_list]
        assert any("boot" in gid or "nnn" in gid or "prolink" in gid for gid in gear_ids)
        assert any("pole" in gid or "carbon" in gid for gid in gear_ids)
        assert any("apparel" in gid or "softshell" in gid for gid in gear_ids)
        assert any("wax" in gid for gid in gear_ids)
        assert any("hydration" in gid for gid in gear_ids)

        # -------------------------------------------------------------------------
        # Step 5: Post chat query to create_response and verify nordic_skiing_info
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the kick wax recommendation for 25 degrees at Methow Valley cross-country ski trails?",
            "customer_id": "cust-nordic-202",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "nordic_skiing_info" in data5
        n_info = data5["nordic_skiing_info"]
        assert n_info is not None
        assert n_info["action"] == "wax_plan"
        assert n_info["wax_plan"]["trail_id"] == "methow-valley-community-trail"
        assert "Methow" in data5["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Post chat query to create_response/stream and assert SSE event
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "What is the kick wax recommendation for 25 degrees at Methow Valley cross-country ski trails?"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        nordic_event = next(
            (e for e in parsed_events if e.get("event") == "nordic_skiing_info"), None
        )
        assert nordic_event is not None
        assert "nordic_skiing_info" in nordic_event
        stream_n_info = nordic_event["nordic_skiing_info"]
        assert stream_n_info is not None
        assert stream_n_info["action"] == "wax_plan"
        assert stream_n_info["wax_plan"]["trail_id"] == "methow-valley-community-trail"

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Methow" in full_text


@pytest.mark.anyio
async def test_nordic_skiing_journey_real_mode_execution():
    """Step 7: Verifies nordic skiing prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(return_value={"firstName": "Alex", "membership": "Gold", "orders": []}),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="At 25 degrees on the Methow Community Trail, Swix Blue Extra V40 hardwax will provide optimal kick and glide."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the kick wax recommendation for 25 degrees at Methow Valley cross-country ski trails?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "nordic_skiing_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "nordic_skiing_prompt" in call_kwargs
        assert "Methow Community Trail" in call_kwargs["nordic_skiing_prompt"]
