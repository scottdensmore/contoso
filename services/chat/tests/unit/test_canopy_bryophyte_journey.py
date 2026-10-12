import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_canopy_bryophyte_journey():
    """Multi-step API journey test for Backcountry Temperate Rainforest Epiphytic Bryophyte & Canopy Tree-Fern Ecology:

    Step 1: Check health and status endpoints (/health, /healthz, /ready, /api/status).
    Step 2: Query /canopy-bryophyte/sites and /api/canopy-bryophyte/sites with filters, plus single site and 404 on invalid site.
    Step 3: Post /canopy-bryophyte/calculate and /api/canopy-bryophyte/calculate (nominal, critical, and 404 on invalid site).
    Step 4: Query /canopy-bryophyte/gear and /api/canopy-bryophyte/gear verifying 6 mandatory gear items.
    Step 5: Chat create_response for canopy bryophyte inquiries (gear, calculation, site detail).
    Step 6: Chat create_response/stream verifying SSE tokens and custom events (canopy_bryophyte_calculated, canopy_bryophyte_lookup, canopy_bryophyte_info).
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
        # Step 2: Query canopy bryophyte catalog & single site lookup
        # -------------------------------------------------------------------------
        res_sites = client.get("/canopy-bryophyte/sites")
        assert res_sites.status_code == 200
        sites = res_sites.json()
        assert len(sites) == 5
        site_ids = [s["id"] for s in sites]
        assert "hoh-river-hall-of-mosses" in site_ids
        assert "tarkine-takayna-rainforest" in site_ids
        assert "fiordland-milford-sound-canopy" in site_ids
        assert "yakushima-ancient-cedar-moss" in site_ids
        assert "great-bear-rainforest-fjords" in site_ids

        # Test prefixed route /api/canopy-bryophyte/sites
        res_api_sites = client.get("/api/canopy-bryophyte/sites")
        assert res_api_sites.status_code == 200
        assert len(res_api_sites.json()) == 5

        # Filter by stratum=tree_fern_caudex_skirt
        res_tf = client.get("/canopy-bryophyte/sites?stratum=tree_fern_caudex_skirt")
        assert res_tf.status_code == 200
        tf_data = res_tf.json()
        assert len(tf_data) == 1
        assert tf_data[0]["id"] == "tarkine-takayna-rainforest"

        # Filter by stratum=mid_canopy_branch_mats
        res_mid = client.get("/api/canopy-bryophyte/sites?stratum=mid_canopy_branch_mats")
        assert res_mid.status_code == 200
        mid_data = res_mid.json()
        assert len(mid_data) == 2
        mid_ids = [s["id"] for s in mid_data]
        assert "hoh-river-hall-of-mosses" in mid_ids
        assert "yakushima-ancient-cedar-moss" in mid_ids

        # Query single site details
        res_single = client.get("/canopy-bryophyte/sites/hoh-river-hall-of-mosses")
        assert res_single.status_code == 200
        single_site = res_single.json()
        assert single_site["id"] == "hoh-river-hall-of-mosses"
        assert single_site["site_id"] == "hoh-river-hall-of-mosses"
        assert "Hall of Mosses" in single_site["title"]
        assert single_site["elevation_meters"] == 180.0
        assert single_site["dominant_stratum"] == "mid_canopy_branch_mats"
        assert single_site["primary_substrate"] == "bigleaf_maple_epiphyte_limb"
        assert len(single_site["highlights"]) >= 3

        # Prefixed single site lookup
        res_api_single = client.get("/api/canopy-bryophyte/sites/tarkine-takayna-rainforest")
        assert res_api_single.status_code == 200
        assert res_api_single.json()["id"] == "tarkine-takayna-rainforest"

        # 404 for unknown site
        res_404 = client.get("/canopy-bryophyte/sites/unknown-cloud-canopy")
        assert res_404.status_code == 404

        res_api_404 = client.get("/api/canopy-bryophyte/sites/unknown-cloud-canopy")
        assert res_api_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Canopy Bryophyte Dynamics Calculation
        # -------------------------------------------------------------------------
        calc_payload_nominal = {
            "site_id": "hoh-river-hall-of-mosses",
            "stratum": "mid_canopy_branch_mats",
            "substrate": "bigleaf_maple_epiphyte_limb",
            "ambient_humidity_percent": 88.0,
            "canopy_height_meters": 35.0,
            "fog_drip_rate_mm_day": 5.0,
            "mat_thickness_cm": 14.0,
        }
        res_calc_nom = client.post("/canopy-bryophyte/calculate", json=calc_payload_nominal)
        assert res_calc_nom.status_code == 200
        nom_res = res_calc_nom.json()
        assert nom_res["site_id"] == "hoh-river-hall-of-mosses"
        assert nom_res["conservation_status"] == "pristine_climax_bryosphere"
        assert nom_res["water_storage_capacity_liters_m2"] >= 10.0
        assert "Strict canopy rigging protocol" in nom_res["canopy_access_protocol"]
        assert "Diagnostic microscopy protocol" in nom_res["microscope_identification_advisory"]

        # Prefixed route /api/canopy-bryophyte/calculate
        res_api_calc = client.post("/api/canopy-bryophyte/calculate", json=calc_payload_nominal)
        assert res_api_calc.status_code == 200
        assert res_api_calc.json()["site_id"] == "hoh-river-hall-of-mosses"

        # Critical calculation with low ambient humidity and thin mat
        calc_payload_crit = {
            "site_id": "great-bear-rainforest-fjords",
            "stratum": "emergent_outer_canopy",
            "substrate": "sitka_spruce_bark",
            "ambient_humidity_percent": 42.0,
            "canopy_height_meters": 45.0,
            "fog_drip_rate_mm_day": 0.4,
            "mat_thickness_cm": 1.5,
        }
        res_calc_crit = client.post("/canopy-bryophyte/calculate", json=calc_payload_crit)
        assert res_calc_crit.status_code == 200
        crit_res = res_calc_crit.json()
        assert crit_res["conservation_status"] == "microclimate_desiccation_warning"
        assert crit_res["poikilohydric_recovery_time_minutes"] > 40.0

        # 404 for invalid site
        res_calc_404 = client.post(
            "/canopy-bryophyte/calculate", json={"site_id": "unknown-canopy-forest"}
        )
        assert res_calc_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Canopy Bryophyte Gear Checklist
        # -------------------------------------------------------------------------
        res_gear = client.get("/canopy-bryophyte/gear")
        assert res_gear.status_code == 200
        gear_items = res_gear.json()
        assert len(gear_items) == 6
        assert all(g["mandatory"] is True for g in gear_items)
        gear_ids = [g["item_id"] for g in gear_items]
        assert "arborist-friction-cambium-saver" in gear_ids
        assert "lightweight-srt-canopy-ascent-kit" in gear_ids
        assert "handheld-20x-achromatic-loupe" in gear_ids
        assert "digital-ultrasonic-fog-canopy-hygrometer" in gear_ids
        assert "breathable-botanical-collection-pouches" in gear_ids
        assert "tree-fern-caudex-caliper-gauge" in gear_ids

        # Prefixed gear endpoint /api/canopy-bryophyte/gear
        res_api_gear = client.get("/api/canopy-bryophyte/gear")
        assert res_api_gear.status_code == 200
        assert len(res_api_gear.json()) == 6

        # -------------------------------------------------------------------------
        # Step 5: Chat create_response for canopy bryophyte inquiries
        # -------------------------------------------------------------------------
        # 5a. Gear inquiry via /api/create_response
        chat_req_gear = {
            "question": "What mandatory equipment, cambium saver, and 20x loupe do I need for canopy bryophyte research?",
        }
        res5_gear = client.post("/api/create_response", json=chat_req_gear)
        assert res5_gear.status_code == 200
        gear_ans = res5_gear.json()
        assert "canopy_bryophyte_info" in gear_ans
        cb_gear_info = gear_ans["canopy_bryophyte_info"]
        assert cb_gear_info is not None
        assert cb_gear_info["action"] == "gear_checklist"
        assert cb_gear_info["mandatory_count"] == 6

        # 5b. Calculation inquiry via /api/create_response
        chat_req_calc = {
            "question": "Calculate canopy bryophyte water storage and epiphyte biomass dynamics for Hoh River Hall of Mosses",
        }
        res5_calc = client.post("/api/create_response", json=chat_req_calc)
        assert res5_calc.status_code == 200
        calc_ans = res5_calc.json()
        assert "canopy_bryophyte_info" in calc_ans
        cb_calc_info = calc_ans["canopy_bryophyte_info"]
        assert cb_calc_info is not None
        assert cb_calc_info["action"] == "calculate"
        assert "water_storage_capacity_liters_m2" in cb_calc_info
        assert "poikilohydric_recovery_time_minutes" in cb_calc_info

        # 5c. Site inquiry via /api/create_response
        chat_req_site = {
            "question": "Tell me about the Takayna tree-fern caudex skirts and canopy bryophytes",
        }
        res5_site = client.post("/api/create_response", json=chat_req_site)
        assert res5_site.status_code == 200
        site_ans = res5_site.json()
        assert "canopy_bryophyte_info" in site_ans
        cb_site_info = site_ans["canopy_bryophyte_info"]
        assert cb_site_info is not None
        assert cb_site_info["action"] == "get_site"
        assert cb_site_info["site_id"] == "tarkine-takayna-rainforest"

        # Also test via /api/chat
        res5_chat = client.post("/api/chat", json=chat_req_gear)
        assert res5_chat.status_code == 200
        assert "canopy_bryophyte_info" in res5_chat.json()

        # -------------------------------------------------------------------------
        # Step 6: Chat create_response/stream SSE events
        # -------------------------------------------------------------------------
        # 6a. Test calculation custom event via /chat/stream
        stream_req_calc = {
            "question": "Calculate canopy epiphyte water storage capacity and biomass dynamics for Takayna tree-fern skirts",
        }
        res6_calc = client.post("/chat/stream", json=stream_req_calc)
        assert res6_calc.status_code == 200
        raw_chunks = [c.strip() for c in res6_calc.text.split("\n\n") if c.strip()]
        assert "data: [DONE]" in raw_chunks

        parsed_events = []
        for line in raw_chunks:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        calc_event = next(
            (e for e in parsed_events if e.get("event") == "canopy_bryophyte_calculated"),
            None,
        )
        assert calc_event is not None
        assert "canopy_bryophyte_info" in calc_event
        assert calc_event["canopy_bryophyte_info"]["action"] == "calculate"

        info_event = next(
            (e for e in parsed_events if e.get("event") == "canopy_bryophyte_info"),
            None,
        )
        assert info_event is not None
        assert "canopy_bryophyte_info" in info_event

        token_events = [
            e
            for e in parsed_events
            if "chunk" in e or "token" in e or e.get("event") == "token"
        ]
        assert len(token_events) > 0

        # 6b. Test lookup custom event via /api/create_response/stream
        stream_req_lookup = {
            "question": "Tell me about Fiordland Milford Sound canopy bryophyte drapes",
        }
        res6_lookup = client.post(
            "/api/create_response/stream", json=stream_req_lookup
        )
        assert res6_lookup.status_code == 200
        raw_chunks_lookup = [
            c.strip() for c in res6_lookup.text.split("\n\n") if c.strip()
        ]
        assert "data: [DONE]" in raw_chunks_lookup

        parsed_lookup = []
        for line in raw_chunks_lookup:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_lookup.append(json.loads(line.removeprefix("data: ")))

        lookup_event = next(
            (e for e in parsed_lookup if e.get("event") == "canopy_bryophyte_lookup"),
            None,
        )
        assert lookup_event is not None
        assert "canopy_bryophyte_info" in lookup_event


@pytest.mark.anyio
async def test_canopy_bryophyte_journey_real_mode_execution():
    """Step 7: Verifies canopy bryophyte prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Rowan",
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
                return_value="In Hoh River Hall of Mosses, epiphytic bryophyte cushions require cambium protection."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the canopy bryophyte water storage capacity and cambium protocol for Hoh River?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "canopy_bryophyte_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "canopy_bryophyte_prompt" in call_kwargs
        prompt_content = call_kwargs["canopy_bryophyte_prompt"].lower()
        assert (
            "bryophyte" in prompt_content
            or "canopy" in prompt_content
            or "cambium" in prompt_content
            or "tree-fern" in prompt_content
        )
