import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_beachcombing_journey():
    """Multi-step API journey test for Wilderness Sea Glass & Coastal Beachcombing:

    Diagnostics: Verify chat status (/api/chat/status).
    Step 1: Query catalog GET /beachcombing/sites and filter by shoreline type.
    Step 2: Query specific site GET /beachcombing/sites/glass-beach-fort-bragg.
    Step 3: Post calculation request POST /beachcombing/calculate and verify patina and tide metrics.
    Step 4: Query gear GET /beachcombing/gear and verify all 6 items.
    Step 5: Post chat request to POST /api/create_response and assert beachcombing_info and answer.
    Step 6: Stream chat response via POST /api/create_response/stream and assert SSE events (beachcombing_*).
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
        # Step 1: Query catalog GET /beachcombing/sites and filter by shoreline type
        # -------------------------------------------------------------------------
        res1 = client.get("/beachcombing/sites")
        if res1.status_code == 404:
            res1 = client.get("/api/beachcombing/sites")
        assert res1.status_code == 200
        sites = res1.json()
        assert len(sites) == 5
        site_ids = [s["site_id"] for s in sites]
        assert "glass-beach-fort-bragg" in site_ids
        assert "kodiak-island-monashka" in site_ids
        assert "cape-may-point-flotsam" in site_ids
        assert "olympic-ruby-beach" in site_ids
        assert "monhegan-island-lobsterman" in site_ids

        # Filter by gravel_pebble_cove
        res1_cove = client.get("/beachcombing/sites?shoreline_type=gravel_pebble_cove")
        if res1_cove.status_code == 404:
            res1_cove = client.get("/api/beachcombing/sites?shoreline_type=gravel_pebble_cove")
        assert res1_cove.status_code == 200
        cove_sites = res1_cove.json()
        assert len(cove_sites) == 2
        cove_ids = [s["site_id"] for s in cove_sites]
        assert "glass-beach-fort-bragg" in cove_ids
        assert "monhegan-island-lobsterman" in cove_ids

        # Filter by high_energy_boulder_strand
        res1_boulder = client.get("/beachcombing/sites?shoreline_type=high_energy_boulder_strand")
        if res1_boulder.status_code == 404:
            res1_boulder = client.get("/api/beachcombing/sites?shoreline_type=high_energy_boulder_strand")
        assert res1_boulder.status_code == 200
        boulder_sites = res1_boulder.json()
        assert len(boulder_sites) == 1
        assert boulder_sites[0]["site_id"] == "kodiak-island-monashka"

        # Filter by barrier_island_sandspit
        res1_spit = client.get("/beachcombing/sites?shoreline_type=barrier_island_sandspit")
        if res1_spit.status_code == 404:
            res1_spit = client.get("/api/beachcombing/sites?shoreline_type=barrier_island_sandspit")
        assert res1_spit.status_code == 200
        spit_sites = res1_spit.json()
        assert len(spit_sites) == 1
        assert spit_sites[0]["site_id"] == "cape-may-point-flotsam"

        # Filter by rocky_intertidal_shelf
        res1_shelf = client.get("/beachcombing/sites?shoreline_type=rocky_intertidal_shelf")
        if res1_shelf.status_code == 404:
            res1_shelf = client.get("/api/beachcombing/sites?shoreline_type=rocky_intertidal_shelf")
        assert res1_shelf.status_code == 200
        shelf_sites = res1_shelf.json()
        assert len(shelf_sites) == 1
        assert shelf_sites[0]["site_id"] == "olympic-ruby-beach"

        # -------------------------------------------------------------------------
        # Step 2: Query specific site GET /beachcombing/sites/glass-beach-fort-bragg
        # -------------------------------------------------------------------------
        res2 = client.get("/beachcombing/sites/glass-beach-fort-bragg")
        if res2.status_code == 404:
            res2 = client.get("/api/beachcombing/sites/glass-beach-fort-bragg")
        assert res2.status_code == 200
        site_detail = res2.json()
        assert site_detail["site_id"] == "glass-beach-fort-bragg"
        assert "Glass Beach" in site_detail["title"]
        assert site_detail["elevation_m"] == 4
        assert site_detail["shoreline_type"] == "gravel_pebble_cove"
        assert site_detail["typical_tidal_range_m"] == 2.1
        assert site_detail["storm_deposit_index"] == 8.4
        assert site_detail["access_difficulty"] == "easy_beach_stroll"
        assert "Cobalt Blue" in site_detail["primary_glass_colors"]
        assert len(site_detail["highlights"]) >= 3

        # 404 check for unknown site
        res2_404 = client.get("/beachcombing/sites/nonexistent-beach-spot")
        if res2_404.status_code != 404:
            res2_404 = client.get("/api/beachcombing/sites/nonexistent-beach-spot")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Post calculation request POST /beachcombing/calculate
        # -------------------------------------------------------------------------
        calc_payload = {
            "site_id": "glass-beach-fort-bragg",
            "search_hours": 3.0,
            "tidal_drop_m": 2.5,
            "storm_surge_days_ago": 3,
            "tumble_energy": "extreme_ocean_surf",
        }
        res3 = client.post("/beachcombing/calculate", json=calc_payload)
        if res3.status_code == 404:
            res3 = client.post("/api/beachcombing/calculate", json=calc_payload)
        assert res3.status_code == 200
        calc_res = res3.json()
        assert calc_res["site_id"] == "glass-beach-fort-bragg"
        assert calc_res["expected_yield_pieces"] == 22
        assert calc_res["patina_quality_grade"] == "ancient_c_fractured_frost"
        assert calc_res["patina_rating_percent"] == 95
        assert calc_res["optimal_foraging_status"] == "prime_low_tide_wrack_window"
        assert "rarity_odds" in calc_res and len(calc_res["rarity_odds"]) > 0
        assert "tide_safety_advisory" in calc_res and len(calc_res["tide_safety_advisory"]) > 0
        assert "conservation_advisory" in calc_res and len(calc_res["conservation_advisory"]) > 0

        # Suboptimal slack scour calculation
        calc_suboptimal = {
            "site_id": "cape-may-point-flotsam",
            "search_hours": 2.0,
            "tidal_drop_m": 1.5,
            "storm_surge_days_ago": 10,
            "tumble_energy": "moderate_bay",
        }
        res3_sub = client.post("/beachcombing/calculate", json=calc_suboptimal)
        if res3_sub.status_code == 404:
            res3_sub = client.post("/api/beachcombing/calculate", json=calc_suboptimal)
        assert res3_sub.status_code == 200
        assert res3_sub.json()["optimal_foraging_status"] == "suboptimal_slack_scour"
        assert res3_sub.json()["patina_quality_grade"] == "smooth_frosted_gem"
        assert res3_sub.json()["patina_rating_percent"] == 80

        # Hazard rising tide pinch calculation
        calc_hazard = {
            "site_id": "olympic-ruby-beach",
            "search_hours": 1.0,
            "tidal_drop_m": 1.0,
            "storm_surge_days_ago": 1,
            "tumble_energy": "gentle_estuary",
        }
        res3_haz = client.post("/beachcombing/calculate", json=calc_hazard)
        if res3_haz.status_code == 404:
            res3_haz = client.post("/api/beachcombing/calculate", json=calc_hazard)
        assert res3_haz.status_code == 200
        assert res3_haz.json()["optimal_foraging_status"] == "hazard_rising_tide_pinch"
        assert res3_haz.json()["patina_quality_grade"] == "early_frosting"
        assert res3_haz.json()["patina_rating_percent"] == 55

        # -------------------------------------------------------------------------
        # Step 4: Query gear GET /beachcombing/gear
        # -------------------------------------------------------------------------
        res4 = client.get("/beachcombing/gear")
        if res4.status_code == 404:
            res4 = client.get("/api/beachcombing/gear")
        assert res4.status_code == 200
        gear_list = res4.json()
        assert len(gear_list) == 6
        assert all(g["mandatory"] is True for g in gear_list)
        gear_ids = [g["item_id"] for g in gear_list]
        assert "uv-blacklight-365nm" in gear_ids
        assert "sand-mesh-sifting-scoop" in gear_ids
        assert "neoprene-high-traction-tide-booties" in gear_ids
        assert "jewelers-loupe-caliper-set" in gear_ids
        assert "padded-compartment-finds-case" in gear_ids
        assert "intertidal-tide-clock-tide-table" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Post chat request to POST /api/create_response
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the expected sea glass yield and patina frosting for 3 hours at Glass Beach Fort Bragg?",
            "customer_id": "cust-beachcomber-01",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "beachcombing_info" in data5
        beach_info = data5["beachcombing_info"]
        assert beach_info is not None
        assert beach_info["action"] == "calculate_beachcombing"
        assert "Glass Beach" in data5["answer"] or "Sea Glass" in data5["answer"]

        # Gear checklist chat query
        gear_chat_req = {
            "question": "What mandatory beachcombing gear and 365nm UV blacklight do I need for intertidal foraging?",
            "customer_id": "cust-beachcomber-02",
        }
        res5_gear = client.post("/api/create_response", json=gear_chat_req)
        assert res5_gear.status_code == 200
        data5_gear = res5_gear.json()
        assert "beachcombing_info" in data5_gear
        assert data5_gear["beachcombing_info"]["action"] == "gear_checklist"
        assert data5_gear["beachcombing_info"]["mandatory_count"] == 6

        # -------------------------------------------------------------------------
        # Step 6: Stream chat response via POST /api/create_response/stream
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Tell me about the Monashka Bay strand on Kodiak Island and Japanese glass floats"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        beach_event = next(
            (
                e for e in parsed_events
                if e.get("event") in (
                    "beachcombing_info",
                    "beachcombing_site_detail",
                    "beachcombing_sites",
                    "beachcombing_calculation",
                    "beachcombing_gear",
                )
            ),
            None,
        )
        assert beach_event is not None
        assert "beachcombing_info" in beach_event
        stream_beach_info = beach_event["beachcombing_info"]
        assert stream_beach_info is not None

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Monashka" in full_text or "Kodiak" in full_text or "Sea Glass" in full_text or "floats" in full_text.lower()


@pytest.mark.anyio
async def test_beachcombing_journey_real_mode_execution():
    """Step 7: Verifies beachcombing prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Marina", "membership": "Diamond", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="At Glass Beach Fort Bragg, 3 hours of foraging during negative low tide yield approximately 22 pieces with ancient C-fractured frost patina."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Calculate expected sea glass yield and hydration patina frosting for 3 hours at Glass Beach Fort Bragg"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "beachcombing_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "beachcombing_prompt" in call_kwargs
        assert "Hydration Patina Frosting Scales" in call_kwargs["beachcombing_prompt"]
        assert "365nm" in call_kwargs["beachcombing_prompt"]
