import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_cave_mineralogy_journey():
    """Multi-step API journey test for Wilderness Caving Cave Pearl Karst Mineralogy & Speleothem Survey Tooling:

    Step 1: Check health and status endpoints (/health, /healthz, /ready, /api/status).
    Step 2: Query /cave-mineralogy/caves and /api/cave-mineralogy/caves with query filters.
    Step 3: Query /cave-mineralogy/caves/carlsbad-rookery-chamber and verify 404 for unknown site.
    Step 4: Post /cave-mineralogy/calculate and verify 404 for invalid site.
    Step 5: Query /cave-mineralogy/gear and verify 6 mandatory gear items.
    Step 6: Chat create_response for cave mineralogy inquiries.
    Step 7: Chat create_response/stream verifying SSE tokens and custom events (cave_mineralogy_calculated and cave_mineralogy_lookup).
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
        # Step 2: Query caves catalog
        # -------------------------------------------------------------------------
        res_caves = client.get("/cave-mineralogy/caves")
        assert res_caves.status_code == 200
        caves = res_caves.json()
        assert len(caves) == 5
        site_ids = [c["id"] for c in caves]
        assert "carlsbad-rookery-chamber" in site_ids
        assert "lechuguilla-chandelier-room" in site_ids
        assert "organ-cave-anthodite-gallery" in site_ids
        assert "mammoth-frozen-niagara" in site_ids
        assert "blanchard-springs-coral-grotto" in site_ids

        # Test prefixed route /api/cave-mineralogy/caves
        res_api_caves = client.get("/api/cave-mineralogy/caves")
        assert res_api_caves.status_code == 200
        assert len(res_api_caves.json()) == 5

        # Test alternative path /cave-mineralogy/sites
        res_sites = client.get("/cave-mineralogy/sites")
        assert res_sites.status_code == 200
        assert len(res_sites.json()) == 5

        # Filter by speleothem_type=cave_pearl_pisolith
        res_pisolith = client.get("/cave-mineralogy/caves?speleothem_type=cave_pearl_pisolith")
        assert res_pisolith.status_code == 200
        pisolith_data = res_pisolith.json()
        assert len(pisolith_data) == 1
        assert pisolith_data[0]["id"] == "carlsbad-rookery-chamber"

        # Filter by conservation=threatened_microclimate_desiccation
        res_threatened = client.get(
            "/cave-mineralogy/caves?conservation=threatened_microclimate_desiccation"
        )
        assert res_threatened.status_code == 200
        threatened_data = res_threatened.json()
        assert len(threatened_data) == 1
        assert threatened_data[0]["id"] == "lechuguilla-chandelier-room"

        # -------------------------------------------------------------------------
        # Step 3: Query single cave details
        # -------------------------------------------------------------------------
        res_carlsbad = client.get("/cave-mineralogy/caves/carlsbad-rookery-chamber")
        assert res_carlsbad.status_code == 200
        carlsbad = res_carlsbad.json()
        assert carlsbad["id"] == "carlsbad-rookery-chamber"
        assert carlsbad["site_id"] == "carlsbad-rookery-chamber"
        assert "Rookery Nest" in carlsbad["name"]
        assert carlsbad["region"] == "Guadalupe Mountains, New Mexico"
        assert carlsbad["system"] == "Capitan Reef Karst"
        assert carlsbad["max_depth_m"] == 250
        assert carlsbad["ambient_temp_c"] == 13.5
        assert carlsbad["humidity_percent"] == 98
        assert carlsbad["speleothem_type"] == "cave_pearl_pisolith"
        assert carlsbad["host_rock"] == "permian_evaporite_gypsum"
        assert carlsbad["conservation_status"] == "pristine_active_growth"
        assert len(carlsbad["highlights"]) == 3

        # Prefixed single site lookup /api/cave-mineralogy/caves/carlsbad-rookery-chamber
        res_api_single = client.get("/api/cave-mineralogy/caves/carlsbad-rookery-chamber")
        assert res_api_single.status_code == 200
        assert res_api_single.json()["id"] == "carlsbad-rookery-chamber"

        # 404 for unknown site
        res_404 = client.get("/cave-mineralogy/caves/unknown-sinkhole-cavern")
        assert res_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Mineral Accretion Calculation
        # -------------------------------------------------------------------------
        calc_payload = {
            "site_id": "carlsbad-rookery-chamber",
            "speleothem_type": "cave_pearl_pisolith",
            "drip_rate_dpm": 24.0,
            "water_ph": 7.8,
            "calcium_carbonate_ppm": 220.0,
            "survey_hours": 4.0,
        }
        res_calc = client.post("/cave-mineralogy/calculate", json=calc_payload)
        assert res_calc.status_code == 200
        calc_res = res_calc.json()
        assert calc_res["site_id"] == "carlsbad-rookery-chamber"
        assert "Rookery Nest" in calc_res["site_title"]
        assert calc_res["calcite_saturation_index"] == 0.53
        assert calc_res["pool_agitation_joules_per_hour"] == 1.08
        assert calc_res["rotation_state"] == "stable_laminar_accretion"
        assert calc_res["estimated_accretion_microns_per_year"] == 16
        assert calc_res["triage_status"] == "nominal_active_mineralization"
        assert "conservation_advisory" in calc_res
        assert "monitoring_protocol" in calc_res

        # Test prefixed route /api/cave-mineralogy/calculate
        res_api_calc = client.post("/api/cave-mineralogy/calculate", json=calc_payload)
        assert res_api_calc.status_code == 200
        assert res_api_calc.json()["site_id"] == "carlsbad-rookery-chamber"

        # 404 for invalid site
        res_calc_404 = client.post(
            "/cave-mineralogy/calculate", json={"site_id": "unknown-abyss"}
        )
        assert res_calc_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 5: Speleothem Gear Checklist
        # -------------------------------------------------------------------------
        res_gear = client.get("/cave-mineralogy/gear")
        assert res_gear.status_code == 200
        gear_items = res_gear.json()
        assert len(gear_items) == 6
        assert all(g["mandatory"] is True for g in gear_items)
        gear_ids = [g["item_id"] for g in gear_items]
        assert "uv-365nm-forensic-lamp" in gear_ids
        assert "digital-micro-caliper-laser" in gear_ids
        assert "waterproof-hydro-ph-ec-meter" in gear_ids
        assert "lint-free-nitrile-caver-gloves" in gear_ids
        assert "subterranean-acoustic-drip-counter" in gear_ids
        assert "sealed-pelican-specimen-case" in gear_ids

        # Test prefixed route /api/cave-mineralogy/gear
        res_api_gear = client.get("/api/cave-mineralogy/gear")
        assert res_api_gear.status_code == 200
        assert len(res_api_gear.json()) == 6

        # -------------------------------------------------------------------------
        # Step 6: Chat create_response
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the calcite saturation index and cave pearl rotation state at Carlsbad Rookery Chamber?",
            "customer_id": "cust-speleologist-101",
        }
        res6 = client.post("/api/create_response", json=chat_req)
        assert res6.status_code == 200
        data6 = res6.json()
        assert "cave_mineralogy_info" in data6
        cm_info = data6["cave_mineralogy_info"]
        assert cm_info is not None
        assert "answer" in data6
        assert len(data6["answer"]) > 0

        # Also test /chat and /api/chat/service/create_response
        res6_chat = client.post("/chat", json=chat_req)
        assert res6_chat.status_code == 200
        assert "cave_mineralogy_info" in res6_chat.json()

        res6_service = client.post("/api/chat/service/create_response", json=chat_req)
        assert res6_service.status_code == 200
        assert "cave_mineralogy_info" in res6_service.json()

        # -------------------------------------------------------------------------
        # Step 7: Chat create_response/stream SSE tokens and custom events
        # -------------------------------------------------------------------------
        # Test calculation custom event
        stream_req_calc = {
            "question": "Calculate calcite saturation index and pool agitation for cave pearls at 24 dpm",
        }
        res7_calc = client.post("/api/create_response/stream", json=stream_req_calc)
        assert res7_calc.status_code == 200
        raw_chunks = [c.strip() for c in res7_calc.text.split("\n\n") if c.strip()]
        assert "data: [DONE]" in raw_chunks

        parsed_events = []
        for line in raw_chunks:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        calc_event = next(
            (e for e in parsed_events if e.get("event") == "cave_mineralogy_calculated"),
            None,
        )
        assert calc_event is not None
        assert "cave_mineralogy_info" in calc_event
        assert calc_event["cave_mineralogy_info"]["action"] in (
            "calculate_accretion",
            "calculate",
        )

        token_events = [
            e for e in parsed_events if "chunk" in e or "token" in e or e.get("event") == "token"
        ]
        assert len(token_events) > 0
        full_text = "".join(str(e.get("chunk") or e.get("token", "")) for e in token_events)
        assert len(full_text) > 0

        # Test lookup custom event
        stream_req_lookup = {
            "question": "Tell me about Carlsbad Caverns Rookery Nest cave pearls details",
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
            (e for e in parsed_lookup if e.get("event") == "cave_mineralogy_lookup"),
            None,
        )
        assert lookup_event is not None
        assert "cave_mineralogy_info" in lookup_event
        assert lookup_event["cave_mineralogy_info"]["site_id"] == "carlsbad-rookery-chamber"


@pytest.mark.anyio
async def test_cave_mineralogy_journey_real_mode_execution():
    """Step 8: Verifies cave mineralogy prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Hazel", "membership": "Explorer", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="At Carlsbad Caverns Rookery Nest, shallow agitated splash pools host spherical calcite cave pearls."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the calcite saturation index for cave pearls at Carlsbad Caverns Rookery Nest?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "cave_mineralogy_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "cave_mineralogy_prompt" in call_kwargs
        prompt_content = call_kwargs["cave_mineralogy_prompt"].lower()
        assert (
            "cave pearl" in prompt_content
            or "carlsbad" in prompt_content
            or "mineralogy" in prompt_content
            or "speleothem" in prompt_content
        )
