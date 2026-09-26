import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_fire_lookout_journey():
    """Multi-step API journey test for Backcountry Fire Lookout Tower Wilderness Spotting:

    Diagnostics: Verify chat status (/api/chat/status).
    Step 1: Query catalog GET /fire-lookout/towers and filter by structure type.
    Step 2: Query specific tower GET /fire-lookout/towers/winchester-mountain-lookout.
    Step 3: Post calculation request POST /fire-lookout/calculate and verify bearing and plume alert level.
    Step 4: Query gear GET /fire-lookout/gear and verify all 6 items.
    Step 5: Post chat request to POST /api/create_response and assert fire_lookout_info and answer.
    Step 6: Stream chat response via POST /api/create_response/stream and assert SSE events (fire_lookout_*).
    """
    # -------------------------------------------------------------------------
    # Diagnostics check: /api/chat/status
    # -------------------------------------------------------------------------
    diag_res = client.get("/api/chat/status")
    assert diag_res.status_code == 200
    diag_data = diag_res.json()
    assert diag_data["status"] == "online"
    assert "model_provider" in diag_data

    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query catalog GET /fire-lookout/towers and filter by structure type
        # -------------------------------------------------------------------------
        res1 = client.get("/fire-lookout/towers")
        if res1.status_code == 404:
            res1 = client.get("/api/fire-lookout/towers")
        assert res1.status_code == 200
        towers = res1.json()
        assert len(towers) == 5
        tower_ids = [t["tower_id"] for t in towers]
        assert "winchester-mountain-lookout" in tower_ids
        assert "desolation-peak-lookout" in tower_ids
        assert "mount-cammerer-lookout" in tower_ids
        assert "black-elk-peak-lookout" in tower_ids
        assert "sundance-mountain-lookout" in tower_ids

        # Filter by tower_structure=live_in_wood_cab_l4
        res1_wood = client.get("/fire-lookout/towers?tower_structure=live_in_wood_cab_l4")
        if res1_wood.status_code == 404:
            res1_wood = client.get("/api/fire-lookout/towers?tower_structure=live_in_wood_cab_l4")
        assert res1_wood.status_code == 200
        wood_towers = res1_wood.json()
        assert len(wood_towers) == 2
        assert all(t["tower_structure"] == "live_in_wood_cab_l4" for t in wood_towers)

        # Filter by tower_structure=stone_cupola_ground_cab
        res1_stone = client.get("/fire-lookout/towers?tower_structure=stone_cupola_ground_cab")
        if res1_stone.status_code == 404:
            res1_stone = client.get("/api/fire-lookout/towers?tower_structure=stone_cupola_ground_cab")
        assert res1_stone.status_code == 200
        stone_towers = res1_stone.json()
        assert len(stone_towers) == 2
        assert all(t["tower_structure"] == "stone_cupola_ground_cab" for t in stone_towers)

        # Filter by tower_structure=steel_skeletal_tower
        res1_steel = client.get("/fire-lookout/towers?tower_structure=steel_skeletal_tower")
        if res1_steel.status_code == 404:
            res1_steel = client.get("/api/fire-lookout/towers?tower_structure=steel_skeletal_tower")
        assert res1_steel.status_code == 200
        steel_towers = res1_steel.json()
        assert len(steel_towers) == 1
        assert steel_towers[0]["tower_id"] == "sundance-mountain-lookout"

        # -------------------------------------------------------------------------
        # Step 2: Query specific tower GET /fire-lookout/towers/winchester-mountain-lookout
        # -------------------------------------------------------------------------
        res2 = client.get("/fire-lookout/towers/winchester-mountain-lookout")
        if res2.status_code == 404:
            res2 = client.get("/api/fire-lookout/towers/winchester-mountain-lookout")
        assert res2.status_code == 200
        tower_detail = res2.json()
        assert tower_detail["tower_id"] == "winchester-mountain-lookout"
        assert "Winchester Mountain" in tower_detail["title"]
        assert tower_detail["tower_structure"] == "live_in_wood_cab_l4"
        assert tower_detail["elevation_m"] == 1988
        assert tower_detail["viewshed_radius_km"] == 65
        assert tower_detail["osborne_alidade_equipped"] is True
        assert len(tower_detail["highlights"]) >= 2

        # 404 check for unknown tower
        res2_404 = client.get("/fire-lookout/towers/nonexistent-tower-peak")
        if res2_404.status_code != 404:
            res2_404 = client.get("/api/fire-lookout/towers/nonexistent-tower-peak")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Post calculation request POST /fire-lookout/calculate
        # -------------------------------------------------------------------------
        calc_payload = {
            "tower_id": "winchester-mountain-lookout",
            "azimuth_degrees": 45.0,
            "vertical_angle_degrees": -1.5,
            "estimated_distance_km": 15.0,
            "smoke_behavior": "dense_vertical_convection",
            "wind_speed_mph": 12.0,
        }
        res3 = client.post("/fire-lookout/calculate", json=calc_payload)
        if res3.status_code == 404:
            res3 = client.post("/api/fire-lookout/calculate", json=calc_payload)
        assert res3.status_code == 200
        calc_res = res3.json()
        assert calc_res["tower_id"] == "winchester-mountain-lookout"
        assert "45° (NE)" in calc_res["triangulated_bearing"]
        assert "Dist: 15.0 km" in calc_res["triangulated_bearing"]
        assert "Vert: -1.5°" in calc_res["triangulated_bearing"]
        assert calc_res["convection_index_percent"] == 85
        assert calc_res["plume_alert_level"] == "confirmed_wildfire_dispatch"
        assert calc_res["observation_status"] == "clear_line_of_sight"
        assert calc_res["effective_viewshed_km"] == 65
        assert "triangulation_advisory" in calc_res and len(calc_res["triangulation_advisory"]) > 0
        assert "holdover_fire_advisory" in calc_res and len(calc_res["holdover_fire_advisory"]) > 0
        assert "tower_safety_advisory" in calc_res and len(calc_res["tower_safety_advisory"]) > 0

        # Extreme blowup calculation
        calc_extreme = {
            "tower_id": "desolation-peak-lookout",
            "azimuth_degrees": 120.0,
            "vertical_angle_degrees": 1.0,
            "estimated_distance_km": 20.0,
            "smoke_behavior": "pyrocumulus_pulsing",
            "wind_speed_mph": 15.0,
        }
        res3_ext = client.post("/fire-lookout/calculate", json=calc_extreme)
        if res3_ext.status_code == 404:
            res3_ext = client.post("/api/fire-lookout/calculate", json=calc_extreme)
        assert res3_ext.status_code == 200
        assert res3_ext.json()["plume_alert_level"] == "extreme_blowup_evacuation"
        assert res3_ext.json()["convection_index_percent"] == 95

        # Lightning storm hazard
        calc_hazard = {
            "tower_id": "sundance-mountain-lookout",
            "wind_speed_mph": 45.0,
        }
        res3_haz = client.post("/fire-lookout/calculate", json=calc_hazard)
        if res3_haz.status_code == 404:
            res3_haz = client.post("/api/fire-lookout/calculate", json=calc_hazard)
        assert res3_haz.status_code == 200
        assert res3_haz.json()["observation_status"] == "active_lightning_storm_hazard"

        # -------------------------------------------------------------------------
        # Step 4: Query gear GET /fire-lookout/gear
        # -------------------------------------------------------------------------
        res4 = client.get("/fire-lookout/gear")
        if res4.status_code == 404:
            res4 = client.get("/api/fire-lookout/gear")
        assert res4.status_code == 200
        gear_list = res4.json()
        assert len(gear_list) == 6
        assert all(g["mandatory"] is True for g in gear_list)
        gear_ids = [g["item_id"] for g in gear_list]
        assert "osborne-alidade-sighting-peep" in gear_ids
        assert "high-magnification-roof-binocular" in gear_ids
        assert "usfs-topographic-panoramic-maps" in gear_ids
        assert "handheld-vhf-forest-net-transceiver" in gear_ids
        assert "sling-psychrometer-hygrothermometer" in gear_ids
        assert "faraday-lightning-ground-cable" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Post chat request to POST /api/create_response
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "Calculate bearing azimuth and convection index for smoke plume at Winchester Mountain lookout",
            "customer_id": "cust-lookout-01",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "fire_lookout_info" in data5
        lookout_info = data5["fire_lookout_info"]
        assert lookout_info is not None
        assert lookout_info["action"] == "calculate_lookout"
        assert "Winchester" in data5["answer"] or "Lookout" in data5["answer"]

        # Gear checklist chat query
        gear_chat_req = {
            "question": "What mandatory fire lookout gear do I need for Osborne fire finder alidade sighting?",
            "customer_id": "cust-lookout-02",
        }
        res5_gear = client.post("/api/create_response", json=gear_chat_req)
        assert res5_gear.status_code == 200
        data5_gear = res5_gear.json()
        assert "fire_lookout_info" in data5_gear
        assert data5_gear["fire_lookout_info"]["action"] == "gear_checklist"
        assert data5_gear["fire_lookout_info"]["mandatory_count"] == 6

        # -------------------------------------------------------------------------
        # Step 6: Stream chat response via POST /api/create_response/stream
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Tell me about Desolation Peak fire lookout tower and Kerouac"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        lookout_event = next(
            (
                e for e in parsed_events
                if e.get("event") in (
                    "fire_lookout_info",
                    "fire_lookout_tower_detail",
                    "fire_lookout_towers",
                    "fire_lookout_calculation",
                    "fire_lookout_gear",
                )
            ),
            None,
        )
        assert lookout_event is not None
        assert "fire_lookout_info" in lookout_event
        stream_lookout_info = lookout_event["fire_lookout_info"]
        assert stream_lookout_info is not None

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Desolation Peak" in full_text or "Lookout" in full_text or "desolation" in full_text.lower()


@pytest.mark.anyio
async def test_fire_lookout_journey_real_mode_execution():
    """Step 7: Verifies fire lookout prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Jack", "membership": "Firewatch", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="From Winchester Mountain Lookout, the smoke plume bearing is 45 degrees NE with 85% convection index."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "How do I calculate fire lookout bearing and convection for Winchester Mountain lookout tower?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "fire_lookout_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "fire_lookout_prompt" in call_kwargs
        assert "Wilderness Fire Lookout" in call_kwargs["fire_lookout_prompt"]
        assert "Osborne Fire Finder" in call_kwargs["fire_lookout_prompt"]
