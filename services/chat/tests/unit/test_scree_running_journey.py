import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_scree_running_journey():
    """Multi-step API journey test for High-Altitude Alpine Scramble Ridge Crest Scree Running:

    Step 1: Check health and status endpoints (/health, /healthz, /ready, /api/status).
    Step 2: Query /scree-running/sites and /api/scree-running/sites with grading filter.
    Step 3: Query single site detail /scree-running/sites/{site_id} and 404 on missing site.
    Step 4: Post /scree-running/calculate and /api/scree-running/calculate (nominal, critical, and 404 on invalid site).
    Step 5: Query /scree-running/gear and /api/scree-running/gear verifying 6 mandatory gear items.
    Step 6: Chat create_response for scree running inquiries (gear, calculation, site detail).
    Step 7: Chat create_response/stream verifying SSE tokens and custom events (scree_running_calculated, scree_running_lookup, scree_running_info).
    """
    # -------------------------------------------------------------------------
    # Step 1: Health & Status checks
    # -------------------------------------------------------------------------
    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"

    res_healthz = client.get("/healthz")
    assert res_healthz.status_code == 200

    res_ready = client.get("/ready")
    assert res_ready.status_code == 200

    res_status = client.get("/api/status")
    assert res_status.status_code == 200
    status_data = res_status.json()
    assert status_data["status"] == "online"
    assert "model_provider" in status_data

    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 2: Query scree running catalog & filter by grading
        # -------------------------------------------------------------------------
        res_sites = client.get("/scree-running/sites")
        assert res_sites.status_code == 200
        sites = res_sites.json()
        assert len(sites) == 5
        site_ids = [s["id"] for s in sites]
        assert "mount-sneffels-south-slopes" in site_ids
        assert "mount-stephen-fossil-talus" in site_ids
        assert "great-gable-wastwater-screes" in site_ids
        assert "mount-teide-volcanic-cinder-scree" in site_ids
        assert "mount-nelson-scree-corridor" in site_ids

        # Test prefixed route /api/scree-running/sites
        res_api_sites = client.get("/api/scree-running/sites")
        assert res_api_sites.status_code == 200
        assert len(res_api_sites.json()) == 5

        # Filter by grading=fine_shale_pea_scree
        res_pea = client.get("/scree-running/sites?grading=fine_shale_pea_scree")
        assert res_pea.status_code == 200
        pea_data = res_pea.json()
        assert len(pea_data) >= 1
        assert pea_data[0]["id"] == "mount-sneffels-south-slopes"

        # Filter by grading=coarse_angular_talus_rubble
        res_talus = client.get(
            "/api/scree-running/sites?grading=coarse_angular_talus_rubble"
        )
        assert res_talus.status_code == 200
        talus_data = res_talus.json()
        assert len(talus_data) == 1
        assert talus_data[0]["id"] == "mount-stephen-fossil-talus"

        # -------------------------------------------------------------------------
        # Step 3: Query single site details & 404 on missing site
        # -------------------------------------------------------------------------
        res_single = client.get("/scree-running/sites/mount-sneffels-south-slopes")
        assert res_single.status_code == 200
        single_site = res_single.json()
        assert single_site["id"] == "mount-sneffels-south-slopes"
        assert single_site["site_id"] == "mount-sneffels-south-slopes"
        assert "Mount Sneffels" in single_site["title"]
        assert single_site["dominant_grading"] == "fine_shale_pea_scree"
        assert len(single_site["highlights"]) >= 3

        # Prefixed single site lookup
        res_api_single = client.get(
            "/api/scree-running/sites/great-gable-wastwater-screes"
        )
        assert res_api_single.status_code == 200
        assert res_api_single.json()["id"] == "great-gable-wastwater-screes"

        # 404 for unknown site
        res_404 = client.get("/scree-running/sites/unknown-scree-site")
        assert res_404.status_code == 404

        res_api_404 = client.get("/api/scree-running/sites/unknown-scree-site")
        assert res_api_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Scree Running Dynamics Calculation (nominal, critical, 404)
        # -------------------------------------------------------------------------
        calc_payload_nominal = {
            "site_id": "mount-sneffels-south-slopes",
            "scree_grading": "fine_shale_pea_scree",
            "descent_gait": "heel_plunge_sliding_glide",
            "slope_angle_degrees": 32.0,
            "descent_vertical_meters": 400.0,
            "runner_weight_kg": 70.0,
            "scree_depth_cm": 25.0,
        }
        res_calc_nom = client.post(
            "/scree-running/calculate", json=calc_payload_nominal
        )
        assert res_calc_nom.status_code == 200
        nom_res = res_calc_nom.json()
        assert nom_res["site_id"] == "mount-sneffels-south-slopes"
        assert nom_res["descent_velocity_kmh"] > 0
        assert nom_res["ankle_impact_force_kn"] > 0
        assert nom_res["slide_arrest_distance_meters"] > 0
        assert nom_res["scree_run_duration_minutes"] > 0
        assert nom_res["safety_status"] == "optimal_gliding_conditions"

        # Prefixed route /api/scree-running/calculate
        res_api_calc = client.post(
            "/api/scree-running/calculate", json=calc_payload_nominal
        )
        assert res_api_calc.status_code == 200
        assert res_api_calc.json()["site_id"] == "mount-sneffels-south-slopes"

        # Critical calculation with severe rockfall / ankle hazard
        calc_payload_crit = {
            "site_id": "mount-stephen-fossil-talus",
            "scree_grading": "coarse_angular_talus_rubble",
            "descent_gait": "rapid_cadence_hop_braking",
            "slope_angle_degrees": 43.0,
            "descent_vertical_meters": 650.0,
            "runner_weight_kg": 92.0,
            "scree_depth_cm": 4.0,
        }
        res_calc_crit = client.post(
            "/scree-running/calculate", json=calc_payload_crit
        )
        assert res_calc_crit.status_code == 200
        crit_res = res_calc_crit.json()
        assert crit_res["safety_status"] == "severe_rockfall_warning"
        assert len(crit_res["braking_technique_advisory"]) > 10
        assert len(crit_res["gaiter_and_protection_protocol"]) > 10

        # 404 for invalid site
        res_calc_404 = client.post(
            "/scree-running/calculate",
            json={"site_id": "unknown-scree-corridor"},
        )
        assert res_calc_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 5: Scree Running Gear Checklist
        # -------------------------------------------------------------------------
        res_gear = client.get("/scree-running/gear")
        assert res_gear.status_code == 200
        gear_items = res_gear.json()
        assert len(gear_items) == 6
        assert all(g["mandatory"] is True for g in gear_items)
        gear_ids = [g["id"] for g in gear_items]
        assert "scree-running-high-cuff-dust-gaiters" in gear_ids
        assert "reinforced-toe-talus-running-shoes" in gear_ids
        assert "ultra-light-climbing-helmet-en12492" in gear_ids
        assert "carbon-z-pole-folding-trekking-poles" in gear_ids
        assert "leather-palm-abrasion-scramble-gloves" in gear_ids
        assert "high-wrap-ballistic-sunglasses" in gear_ids

        # Prefixed gear endpoint /api/scree-running/gear
        res_api_gear = client.get("/api/scree-running/gear")
        assert res_api_gear.status_code == 200
        assert len(res_api_gear.json()) == 6

        # -------------------------------------------------------------------------
        # Step 6: Chat create_response for scree running inquiries
        # -------------------------------------------------------------------------
        # 6a. Gear inquiry via /api/create_response
        chat_req_gear = {
            "question": "What mandatory scree gaiters, helmet, and gear checklist do I need for scree running?",
        }
        res6_gear = client.post("/api/create_response", json=chat_req_gear)
        assert res6_gear.status_code == 200
        gear_ans = res6_gear.json()
        assert "scree_running_info" in gear_ans
        sr_gear_info = gear_ans["scree_running_info"]
        assert sr_gear_info is not None
        assert sr_gear_info["action"] == "gear_checklist"
        assert sr_gear_info["mandatory_count"] == 6

        # 6b. Calculation inquiry via /api/create_response
        chat_req_calc = {
            "question": "Calculate scree running descent velocity and ankle impact force for Mount Sneffels pea scree",
        }
        res6_calc = client.post("/api/create_response", json=chat_req_calc)
        assert res6_calc.status_code == 200
        calc_ans = res6_calc.json()
        assert "scree_running_info" in calc_ans
        sr_calc_info = calc_ans["scree_running_info"]
        assert sr_calc_info is not None
        assert sr_calc_info["action"] == "calculate"
        assert "descent_velocity_kmh" in sr_calc_info
        assert "ankle_impact_force_kn" in sr_calc_info

        # 6c. Site inquiry via /api/create_response
        chat_req_site = {
            "question": "Tell me about details of the Wastwater Screes scree running route",
        }
        res6_site = client.post("/api/create_response", json=chat_req_site)
        assert res6_site.status_code == 200
        site_ans = res6_site.json()
        assert "scree_running_info" in site_ans
        sr_site_info = site_ans["scree_running_info"]
        assert sr_site_info is not None
        assert sr_site_info["action"] == "get_site"
        assert sr_site_info["site_id"] == "great-gable-wastwater-screes"

        # Also test via /api/chat
        res6_chat = client.post("/api/chat", json=chat_req_gear)
        assert res6_chat.status_code == 200
        assert "scree_running_info" in res6_chat.json()

        # -------------------------------------------------------------------------
        # Step 7: Chat create_response/stream SSE events
        # -------------------------------------------------------------------------
        # 7a. Test calculation custom event via /chat/stream
        stream_req_calc = {
            "question": "Calculate scree running descent velocity and slide arrest distance for Mount Sneffels",
        }
        res7_calc = client.post("/chat/stream", json=stream_req_calc)
        assert res7_calc.status_code == 200
        raw_chunks = [
            c.strip() for c in res7_calc.text.split("\n\n") if c.strip()
        ]
        assert "data: [DONE]" in raw_chunks

        parsed_events = []
        for line in raw_chunks:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        calc_event = next(
            (
                e
                for e in parsed_events
                if e.get("event") == "scree_running_calculated"
            ),
            None,
        )
        assert calc_event is not None
        assert "scree_running_info" in calc_event
        assert calc_event["scree_running_info"]["action"] == "calculate"

        info_event = next(
            (e for e in parsed_events if e.get("event") == "scree_running_info"),
            None,
        )
        assert info_event is not None
        assert "scree_running_info" in info_event

        token_events = [
            e
            for e in parsed_events
            if "chunk" in e or "token" in e or e.get("event") == "token"
        ]
        assert len(token_events) > 0

        # 7b. Test lookup custom event via /api/create_response/stream
        stream_req_lookup = {
            "question": "Tell me about Mount Stephen talus run details and rockfall hazards",
        }
        res7_lookup = client.post(
            "/api/create_response/stream", json=stream_req_lookup
        )
        assert res7_lookup.status_code == 200
        raw_chunks_lookup = [
            c.strip() for c in res7_lookup.text.split("\n\n") if c.strip()
        ]
        assert "data: [DONE]" in raw_chunks_lookup

        parsed_lookup = []
        for line in raw_chunks_lookup:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_lookup.append(json.loads(line.removeprefix("data: ")))

        lookup_event = next(
            (
                e
                for e in parsed_lookup
                if e.get("event") == "scree_running_lookup"
            ),
            None,
        )
        assert lookup_event is not None
        assert "scree_running_info" in lookup_event


@pytest.mark.anyio
async def test_scree_running_journey_real_mode_execution():
    """Verifies scree running prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Sierra",
                    "membership": "Summit",
                    "orders": [],
                }
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="On Mount Sneffels pea scree, use heel-plunge gliding and high-cuff dust gaiters."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the heel plunge scree running technique and gaiter protocol for Mount Sneffels?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "scree_running_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "scree_running_prompt" in call_kwargs
        prompt_content = call_kwargs["scree_running_prompt"].lower()
        assert (
            "scree" in prompt_content
            or "heel" in prompt_content
            or "gaiter" in prompt_content
        )
