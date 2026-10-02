import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_tundra_lichen_journey():
    """Multi-step API journey test for Wilderness Subarctic Tundra Lichenology & Saxicolous Bryophyte Ecology Tooling:

    Step 1: Check health and status endpoints (/health, /healthz, /ready, /api/status).
    Step 2: Query /tundra-lichen/sites and /api/tundra-lichen/sites with query filters, plus single site and 404 on invalid site.
    Step 3: Post /tundra-lichen/calculate and /api/tundra-lichen/calculate (nominal, critical, and 404 on invalid site).
    Step 4: Query /tundra-lichen/gear and /api/tundra-lichen/gear verifying 6 mandatory gear items.
    Step 5: Chat create_response for tundra lichen inquiries (gear, calculation, route detail).
    Step 6: Chat create_response/stream verifying SSE tokens and custom events (tundra_lichen_calculated, tundra_lichen_lookup, tundra_lichen_info).
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
        # Step 2: Query tundra lichen catalog & single site lookup
        # -------------------------------------------------------------------------
        res_sites = client.get("/tundra-lichen/sites")
        assert res_sites.status_code == 200
        sites = res_sites.json()
        assert len(sites) == 5
        site_ids = [s["id"] for s in sites]
        assert "denali-polychrome-pass" in site_ids
        assert "torngat-mountains-fjords" in site_ids
        assert "wrangell-st-elias-root-glacier" in site_ids
        assert "beartooth-plateau-alpine-tundra" in site_ids
        assert "brooks-range-anaktuvuk-pass" in site_ids

        # Test prefixed route /api/tundra-lichen/sites
        res_api_sites = client.get("/api/tundra-lichen/sites")
        assert res_api_sites.status_code == 200
        assert len(res_api_sites.json()) == 5

        # Filter by morphology=crustose_saxicolous
        res_crustose = client.get("/tundra-lichen/sites?morphology=crustose_saxicolous")
        assert res_crustose.status_code == 200
        crustose_data = res_crustose.json()
        assert len(crustose_data) == 2
        crustose_ids = [s["id"] for s in crustose_data]
        assert "denali-polychrome-pass" in crustose_ids
        assert "beartooth-plateau-alpine-tundra" in crustose_ids

        # Filter by morphology=fruticose_macrolichen
        res_fruticose = client.get("/api/tundra-lichen/sites?morphology=fruticose_macrolichen")
        assert res_fruticose.status_code == 200
        fruticose_data = res_fruticose.json()
        assert len(fruticose_data) == 1
        assert fruticose_data[0]["id"] == "torngat-mountains-fjords"

        # Query single site details
        res_denali = client.get("/tundra-lichen/sites/denali-polychrome-pass")
        assert res_denali.status_code == 200
        denali = res_denali.json()
        assert denali["id"] == "denali-polychrome-pass"
        assert denali["site_id"] == "denali-polychrome-pass"
        assert "Polychrome Pass" in denali["title"]
        assert denali["elevation_meters"] == 1150
        assert denali["dominant_morphology"] == "crustose_saxicolous"
        assert denali["substrate_type"] == "volcanic_basalt_outcrop"
        assert denali["permafrost_status"] == "discontinuous_permafrost"
        assert len(denali["highlights"]) == 3

        # Prefixed single site lookup /api/tundra-lichen/sites/denali-polychrome-pass
        res_api_single = client.get("/api/tundra-lichen/sites/denali-polychrome-pass")
        assert res_api_single.status_code == 200
        assert res_api_single.json()["id"] == "denali-polychrome-pass"

        # 404 for unknown site
        res_404 = client.get("/tundra-lichen/sites/unknown-frozen-scree")
        assert res_404.status_code == 404

        res_api_404 = client.get("/api/tundra-lichen/sites/unknown-frozen-scree")
        assert res_api_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Lichen Dynamics Calculation
        # -------------------------------------------------------------------------
        calc_payload_nominal = {
            "site_id": "denali-polychrome-pass",
            "morphology": "crustose_saxicolous",
            "substrate": "volcanic_basalt_outcrop",
            "colony_diameter_mm": 70.0,
            "annual_growth_rate_mm_yr": 0.35,
            "uv_exposure_index": 5.0,
            "snow_cover_duration_months": 7.0,
            "air_deposition": "pristine_baseline",
        }
        res_calc_nom = client.post("/tundra-lichen/calculate", json=calc_payload_nominal)
        assert res_calc_nom.status_code == 200
        nom_res = res_calc_nom.json()
        assert nom_res["site_id"] == "denali-polychrome-pass"
        assert nom_res["estimated_colony_age_years"] == 200
        assert nom_res["bioindicator_health_index"] >= 0.75
        assert nom_res["conservation_status"] == "optimal_pristine_climax"
        assert "OPTIMAL CLIMAX" in nom_res["lichenometry_advisory"]
        assert "KOH" in nom_res["chemical_spot_test_protocol"]

        # Prefixed route /api/tundra-lichen/calculate
        res_api_calc = client.post("/api/tundra-lichen/calculate", json=calc_payload_nominal)
        assert res_api_calc.status_code == 200
        assert res_api_calc.json()["site_id"] == "denali-polychrome-pass"

        # Critical calculation with elevated anthropogenic air deposition
        calc_payload_crit = {
            "site_id": "torngat-mountains-fjords",
            "morphology": "fruticose_macrolichen",
            "substrate": "granitic_gneiss_boulder",
            "colony_diameter_mm": 100.0,
            "annual_growth_rate_mm_yr": 0.50,
            "uv_exposure_index": 6.0,
            "snow_cover_duration_months": 7.0,
            "air_deposition": "elevated_anthropogenic",
        }
        res_calc_crit = client.post("/tundra-lichen/calculate", json=calc_payload_crit)
        assert res_calc_crit.status_code == 200
        crit_res = res_calc_crit.json()
        assert crit_res["conservation_status"] == "critical_cryoturbation_disturbance"
        assert "CRITICAL CONSERVATION ALERT" in crit_res["lichenometry_advisory"]

        # 404 for invalid site
        res_calc_404 = client.post(
            "/tundra-lichen/calculate", json={"site_id": "unknown-glacier-crust"}
        )
        assert res_calc_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Tundra Lichenology Gear Checklist
        # -------------------------------------------------------------------------
        res_gear = client.get("/tundra-lichen/gear")
        assert res_gear.status_code == 200
        gear_items = res_gear.json()
        assert len(gear_items) == 6
        assert all(g["mandatory"] is True for g in gear_items)
        gear_ids = [g["item_id"] for g in gear_items]
        assert "achromatic-field-loupe-20x" in gear_ids
        assert "chemical-spot-test-reagent-kit" in gear_ids
        assert "subarctic-specimen-chisels" in gear_ids
        assert "digital-lichenometry-caliper" in gear_ids
        assert "breathable-specimen-herbarium-packets" in gear_ids
        assert "field-uv-fluorescence-torch" in gear_ids

        # Prefixed gear endpoint /api/tundra-lichen/gear
        res_api_gear = client.get("/api/tundra-lichen/gear")
        assert res_api_gear.status_code == 200
        assert len(res_api_gear.json()) == 6

        # -------------------------------------------------------------------------
        # Step 5: Chat create_response for tundra lichen inquiries
        # -------------------------------------------------------------------------
        # 5a. Gear inquiry via /api/create_response
        chat_req_gear = {
            "question": "What mandatory field equipment do I need for subarctic lichenology research?",
        }
        res5_gear = client.post("/api/create_response", json=chat_req_gear)
        assert res5_gear.status_code == 200
        gear_ans = res5_gear.json()
        assert "tundra_lichen_info" in gear_ans
        tl_gear_info = gear_ans["tundra_lichen_info"]
        assert tl_gear_info is not None
        assert tl_gear_info["action"] == "gear_checklist"
        assert tl_gear_info["mandatory_count"] == 6

        # 5b. Calculation inquiry via /api/create_response
        chat_req_calc = {
            "question": "Calculate radial colony age and lichenometry dynamics for Denali Polychrome Pass",
        }
        res5_calc = client.post("/api/create_response", json=chat_req_calc)
        assert res5_calc.status_code == 200
        calc_ans = res5_calc.json()
        assert "tundra_lichen_info" in calc_ans
        tl_calc_info = calc_ans["tundra_lichen_info"]
        assert tl_calc_info is not None
        assert tl_calc_info["action"] == "calculate"
        assert "estimated_colony_age_years" in tl_calc_info
        assert "bioindicator_health_index" in tl_calc_info
        assert "desiccation_resilience_score" in tl_calc_info

        # Also test via /api/chat
        res5_chat = client.post("/api/chat", json=chat_req_gear)
        assert res5_chat.status_code == 200
        assert "tundra_lichen_info" in res5_chat.json()

        # -------------------------------------------------------------------------
        # Step 6: Chat create_response/stream SSE events
        # -------------------------------------------------------------------------
        # 6a. Test calculation custom event via /chat/stream
        stream_req_calc = {
            "question": "Calculate lichenometry dynamics and colony age for Beartooth Plateau",
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
            (e for e in parsed_events if e.get("event") == "tundra_lichen_calculated"),
            None,
        )
        assert calc_event is not None
        assert "tundra_lichen_info" in calc_event
        assert calc_event["tundra_lichen_info"]["action"] == "calculate"

        info_event = next(
            (e for e in parsed_events if e.get("event") == "tundra_lichen_info"),
            None,
        )
        assert info_event is not None
        assert "tundra_lichen_info" in info_event

        token_events = [
            e
            for e in parsed_events
            if "chunk" in e or "token" in e or e.get("event") == "token"
        ]
        assert len(token_events) > 0

        # 6b. Test lookup custom event via /api/create_response/stream
        stream_req_lookup = {
            "question": "Tell me about Wrangell St Elias Root Glacier lichen research site details",
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
            (e for e in parsed_lookup if e.get("event") == "tundra_lichen_lookup"),
            None,
        )
        assert lookup_event is not None
        assert "tundra_lichen_info" in lookup_event


@pytest.mark.anyio
async def test_tundra_lichen_journey_real_mode_execution():
    """Step 7: Verifies tundra lichen prompt injection and payload parity in real LLM mode."""
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
                return_value="In Denali Polychrome Pass, Rhizocarpon geographicum colonies provide glacial chronology."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the lichenometry protocol for yellow map lichen at Denali Polychrome Pass?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "tundra_lichen_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "tundra_lichen_prompt" in call_kwargs
        prompt_content = call_kwargs["tundra_lichen_prompt"].lower()
        assert (
            "lichen" in prompt_content
            or "lichenology" in prompt_content
            or "rhizocarpon" in prompt_content
            or "tundra" in prompt_content
        )
