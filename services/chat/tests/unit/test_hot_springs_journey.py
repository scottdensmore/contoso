import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_hot_springs_journey():
    """Multi-step API journey test for Backcountry Hot Springs & Geothermal Soaking Tooling:

    Step 1: Query springs list with filters (GET /api/hot-springs/springs).
    Step 2: Query specific spring detail (GET /api/hot-springs/springs/scenic-hot-springs).
    Step 3: Calculate soaking plan (POST /api/hot-springs/soaking-plan).
    Step 4: Retrieve gear & ethics guidelines (GET /api/hot-springs/gear-ethics).
    Step 5: Test chat query via create_response verifying hot_springs_info metadata.
    Step 6: Test SSE streaming via create_response_stream asserting hot_springs_info event.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query springs list (GET /api/hot-springs/springs)
        # -------------------------------------------------------------------------
        res1 = client.get("/api/hot-springs/springs")
        assert res1.status_code == 200
        springs = res1.json()
        assert len(springs) == 5
        s_ids = [s["spring_id"] for s in springs]
        assert "scenic-hot-springs" in s_ids
        assert "goldmyer-hot-springs" in s_ids
        assert "bagby-hot-springs" in s_ids
        assert "travertine-hot-springs" in s_ids
        assert "kirkham-hot-springs" in s_ids

        # Filter by access difficulty
        res1_access = client.get("/api/hot-springs/springs?access=easy_walk")
        assert res1_access.status_code == 200
        easy_springs = res1_access.json()
        assert len(easy_springs) == 3
        assert all(s["access_difficulty"] == "easy_walk" for s in easy_springs)

        # Filter by state
        res1_state = client.get("/api/hot-springs/springs?state=WA")
        assert res1_state.status_code == 200
        wa_springs = res1_state.json()
        assert len(wa_springs) == 2
        assert all(s["state"] == "WA" for s in wa_springs)

        # -------------------------------------------------------------------------
        # Step 2: Query specific spring detail (GET /api/hot-springs/springs/scenic-hot-springs)
        # -------------------------------------------------------------------------
        res2 = client.get("/api/hot-springs/springs/scenic-hot-springs")
        assert res2.status_code == 200
        scenic = res2.json()
        assert scenic["spring_id"] == "scenic-hot-springs"
        assert scenic["name"] == "Scenic Hot Springs"
        assert scenic["state"] == "WA"
        assert scenic["temperature_f"] == 104
        assert scenic["pool_type"] == "cedar_tub"
        assert scenic["mineral_profile"] == "lithium_silica"
        assert scenic["access_difficulty"] == "moderate_hike"
        assert scenic["hike_distance_miles"] == 4.4
        assert scenic["elevation_gain_ft"] == 1100
        assert scenic["clothing_optional"] is True
        assert scenic["fee_required"] is True
        assert scenic["winter_access"] is True
        assert len(scenic["leave_no_trace_rules"]) >= 2

        # 404 for unknown spring
        res2_404 = client.get("/api/hot-springs/springs/unknown-hot-spring")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Calculate soaking plan (POST /api/hot-springs/soaking-plan)
        # -------------------------------------------------------------------------
        soak_payload = {
            "spring_id": "scenic-hot-springs",
            "party_size": 2,
            "season": "summer",
            "soak_duration_minutes": 45,
        }
        res3 = client.post("/api/hot-springs/soaking-plan", json=soak_payload)
        assert res3.status_code == 200
        plan = res3.json()
        assert plan["spring_id"] == "scenic-hot-springs"
        assert plan["spring_name"] == "Scenic Hot Springs"
        assert plan["temperature_f"] == 104
        assert plan["safe_max_session_minutes"] == 30
        assert plan["hydration_liters_required"] >= 2.0
        assert plan["electrolytes_recommended_mg"] > 0
        assert len(plan["hazards"]) >= 1
        assert any("exceeds safe single session limit" in h.lower() for h in plan["hazards"])
        assert len(plan["ethics_rules"]) >= 3

        # 404 for non-existent spring
        res3_404 = client.post(
            "/api/hot-springs/soaking-plan",
            json={"spring_id": "non-existent-spring"},
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Retrieve gear & ethics guidelines (GET /api/hot-springs/gear-ethics)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/hot-springs/gear-ethics")
        assert res4.status_code == 200
        gear_ethics = res4.json()
        assert "mandatory_gear" in gear_ethics
        assert len(gear_ethics["mandatory_gear"]) == 6
        gear_ids = {g["item_id"] for g in gear_ethics["mandatory_gear"]}
        assert "gear-booties" in gear_ids
        assert "gear-towel" in gear_ids
        assert "gear-hydration" in gear_ids
        assert "gear-dry-bag" in gear_ids
        assert "gear-headlamp" in gear_ids
        assert "gear-waste-bags" in gear_ids
        assert "ethics_rules" in gear_ethics or "leave_no_trace_rules" in gear_ethics
        rules = gear_ethics.get("ethics_rules") or gear_ethics.get("leave_no_trace_rules")
        assert len(rules) >= 4

        # -------------------------------------------------------------------------
        # Step 5: Test chat query via create_response verifying hot_springs_info metadata
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the soaking plan and safe session duration for Scenic Hot Springs?",
            "customer_id": "cust-soaker-202",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "hot_springs_info" in data5
        hs_info = data5["hot_springs_info"]
        assert hs_info is not None
        assert "scenic" in str(hs_info).lower() or hs_info.get("spring_id") == "scenic-hot-springs"
        assert "Scenic" in data5["answer"] or "soak" in data5["answer"].lower()

        # -------------------------------------------------------------------------
        # Step 6: Test SSE streaming via create_response_stream asserting hot_springs_info event
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "What is the soaking plan and safe session duration for Scenic Hot Springs?"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        hs_event = next((e for e in parsed_events if e.get("event") == "hot_springs_info"), None)
        assert hs_event is not None
        assert "hot_springs_info" in hs_event
        stream_hs_info = hs_event["hot_springs_info"]
        assert stream_hs_info is not None
        assert "scenic" in str(stream_hs_info).lower()

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "scenic" in full_text.lower() or "soak" in full_text.lower() or "temperature" in full_text.lower()


@pytest.mark.anyio
async def test_hot_springs_journey_real_mode_execution():
    """Step 7: Verifies hot springs prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value={"firstName": "Kilior", "membership": "Platinum", "orders": []}),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search_service,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(
            return_value="For Scenic Hot Springs, soak at 104°F with a max 30-minute session and pack mandatory neoprene booties."
        ),
    ) as mock_llm, patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the soaking plan and safe session duration for Scenic Hot Springs?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "hot_springs_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "hot_springs_prompt" in call_kwargs
        assert "Scenic Hot Springs" in call_kwargs["hot_springs_prompt"]
