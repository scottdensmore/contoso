import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_lava_tube_biospeleology_journey():
    """Multi-step API journey test for Subterranean Lava Tube Biospeleology & Troglomorphic Fauna:

    Step 1: Check health and status endpoints (/health, /healthz, /ready, /api/status).
    Step 2: Query /lava-tube-biospeleology/sites and /api/lava-tube-biospeleology/sites with zone filter, single site, and 404.
    Step 3: Post /lava-tube-biospeleology/calculate and /api/lava-tube-biospeleology/calculate (nominal/pristine, critical, and 404).
    Step 4: Query /lava-tube-biospeleology/gear and /api/lava-tube-biospeleology/gear verifying 6 mandatory gear items.
    Step 5: Chat create_response for lava tube biospeleology inquiries (gear, calculation, site detail).
    Step 6: Chat create_response/stream verifying SSE tokens and custom events (lava_tube_biospeleology_calculated, lava_tube_biospeleology_lookup, lava_tube_biospeleology_info).
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
        # Step 2: Query lava tube biospeleology catalog & single site lookup
        # -------------------------------------------------------------------------
        res_sites = client.get("/lava-tube-biospeleology/sites")
        assert res_sites.status_code == 200
        sites = res_sites.json()
        assert len(sites) == 5
        site_ids = [s["id"] for s in sites]
        assert "kazumura-cave-kilauea-root-galleries" in site_ids
        assert "ape-cave-mount-st-helens-basalt" in site_ids
        assert "undara-volcanic-lava-tubes" in site_ids
        assert "manjanggul-jeju-volcanic-tube" in site_ids
        assert "cueva-de-los-verdes-lanzarote" in site_ids

        # Test prefixed route /api/lava-tube-biospeleology/sites
        res_api_sites = client.get("/api/lava-tube-biospeleology/sites")
        assert res_api_sites.status_code == 200
        assert len(res_api_sites.json()) == 5

        # Filter by zone=subterranean_root_curtain_gallery
        res_root = client.get(
            "/lava-tube-biospeleology/sites?zone=subterranean_root_curtain_gallery"
        )
        assert res_root.status_code == 200
        root_data = res_root.json()
        assert len(root_data) == 1
        assert root_data[0]["id"] == "kazumura-cave-kilauea-root-galleries"

        # Filter via /api/lava-tube-biospeleology/sites?zone=subterranean_root_curtain_gallery
        res_api_root = client.get(
            "/api/lava-tube-biospeleology/sites?zone=subterranean_root_curtain_gallery"
        )
        assert res_api_root.status_code == 200
        assert len(res_api_root.json()) == 1

        # Query single site details
        res_kaz = client.get(
            "/lava-tube-biospeleology/sites/kazumura-cave-kilauea-root-galleries"
        )
        assert res_kaz.status_code == 200
        kaz = res_kaz.json()
        assert kaz["id"] == "kazumura-cave-kilauea-root-galleries"
        assert kaz["site_id"] == "kazumura-cave-kilauea-root-galleries"
        assert "Kazumura" in kaz["title"]
        assert kaz["dominant_zone"] == "subterranean_root_curtain_gallery"
        assert len(kaz["highlights"]) >= 3

        # Prefixed single site lookup
        res_api_single = client.get(
            "/api/lava-tube-biospeleology/sites/kazumura-cave-kilauea-root-galleries"
        )
        assert res_api_single.status_code == 200
        assert res_api_single.json()["id"] == "kazumura-cave-kilauea-root-galleries"

        # 404 for unknown site
        res_404 = client.get("/lava-tube-biospeleology/sites/unknown-lava-tube")
        assert res_404.status_code == 404

        res_api_404 = client.get("/api/lava-tube-biospeleology/sites/unknown-lava-tube")
        assert res_api_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Lava Tube Biospeleology Calculation
        # -------------------------------------------------------------------------
        calc_payload_pristine = {
            "site_id": "kazumura-cave-kilauea-root-galleries",
            "ecological_zone": "subterranean_root_curtain_gallery",
            "substrate_feature": "pahoehoe_ropy_bench_ledges",
            "relative_humidity_percent": 99.0,
            "distance_from_skylight_meters": 400.0,
            "ceiling_root_density_per_m2": 45.0,
            "ambient_co2_ppm": 550.0,
        }
        res_calc_nom = client.post(
            "/lava-tube-biospeleology/calculate", json=calc_payload_pristine
        )
        assert res_calc_nom.status_code == 200
        nom_res = res_calc_nom.json()
        assert nom_res["site_id"] == "kazumura-cave-kilauea-root-galleries"
        assert nom_res["conservation_status"] == "pristine_endemic_refugium"
        assert nom_res["troglobite_endemism_index"] >= 0.75
        assert nom_res["microbial_mat_integrity_percent"] >= 85.0

        # Prefixed route /api/lava-tube-biospeleology/calculate
        res_api_calc = client.post(
            "/api/lava-tube-biospeleology/calculate", json=calc_payload_pristine
        )
        assert res_api_calc.status_code == 200
        assert res_api_calc.json()["site_id"] == "kazumura-cave-kilauea-root-galleries"

        # Critical calculation
        calc_payload_crit = {
            "site_id": "ape-cave-mount-st-helens-basalt",
            "ecological_zone": "skylight_entrance_ecotone",
            "substrate_feature": "actinobacterial_golden_slime_wall",
            "relative_humidity_percent": 68.0,
            "distance_from_skylight_meters": 25.0,
            "ceiling_root_density_per_m2": 2.0,
            "ambient_co2_ppm": 2400.0,
        }
        res_calc_crit = client.post(
            "/lava-tube-biospeleology/calculate", json=calc_payload_crit
        )
        assert res_calc_crit.status_code == 200
        crit_res = res_calc_crit.json()
        assert crit_res["conservation_status"] == "critical_anthropogenic_biocontamination"

        # 404 for invalid site
        res_calc_404 = client.post(
            "/lava-tube-biospeleology/calculate",
            json={"site_id": "unknown-lava-tube-system"},
        )
        assert res_calc_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Lava Tube Biospeleology Gear Checklist
        # -------------------------------------------------------------------------
        res_gear = client.get("/lava-tube-biospeleology/gear")
        assert res_gear.status_code == 200
        gear_items = res_gear.json()
        assert len(gear_items) == 6
        assert all(g["mandatory"] is True for g in gear_items)
        gear_ids = [g["id"] for g in gear_items]
        assert "en12492-low-profile-basalt-caving-helmet" in gear_ids
        assert "red-spectrum-low-lux-biosurvey-headlamp" in gear_ids
        assert "neoprene-kevlar-aa-basalt-knee-elbow-pads" in gear_ids
        assert "quaternary-ammonium-boot-decon-kit" in gear_ids
        assert "macro-15x-illuminated-entomological-loupe" in gear_ids
        assert "nondestructive-aspirator-pooter-vial-set" in gear_ids

        # Prefixed gear endpoint
        res_api_gear = client.get("/api/lava-tube-biospeleology/gear")
        assert res_api_gear.status_code == 200
        assert len(res_api_gear.json()) == 6

        # -------------------------------------------------------------------------
        # Step 5: Chat create_response for lava tube biospeleology inquiries
        # -------------------------------------------------------------------------
        chat_req_gear = {
            "question": "What mandatory equipment and pooter aspirator do I need for lava tube biospeleology?",
        }
        res5_gear = client.post("/api/create_response", json=chat_req_gear)
        assert res5_gear.status_code == 200
        gear_ans = res5_gear.json()
        assert "lava_tube_biospeleology_info" in gear_ans
        ltb_gear_info = gear_ans["lava_tube_biospeleology_info"]
        assert ltb_gear_info is not None
        assert ltb_gear_info["action"] == "gear_checklist"
        assert ltb_gear_info["mandatory_count"] == 6

        chat_req_calc = {
            "question": "Calculate troglobite endemism index and root exudate trophic capacity for Kazumura Cave lava tube",
        }
        res5_calc = client.post("/api/create_response", json=chat_req_calc)
        assert res5_calc.status_code == 200
        calc_ans = res5_calc.json()
        assert "lava_tube_biospeleology_info" in calc_ans
        ltb_calc_info = calc_ans["lava_tube_biospeleology_info"]
        assert ltb_calc_info is not None
        assert ltb_calc_info["action"] == "calculate"
        assert "troglobite_endemism_index" in ltb_calc_info
        assert "root_exudate_trophic_capacity_mg_c_m2_day" in ltb_calc_info
        assert "vapor_pressure_deficit_stress_kpa" in ltb_calc_info
        assert "microbial_mat_integrity_percent" in ltb_calc_info

        # Also test via /api/chat
        res5_chat = client.post("/api/chat", json=chat_req_gear)
        assert res5_chat.status_code == 200
        assert "lava_tube_biospeleology_info" in res5_chat.json()

        # -------------------------------------------------------------------------
        # Step 6: Chat create_response/stream SSE events
        # -------------------------------------------------------------------------
        stream_req_calc = {
            "question": "Calculate troglobite endemism index and microbial mat integrity for Kazumura Cave lava tube",
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
            (e for e in parsed_events if e.get("event") == "lava_tube_biospeleology_calculated"),
            None,
        )
        assert calc_event is not None
        assert "lava_tube_biospeleology_info" in calc_event
        assert calc_event["lava_tube_biospeleology_info"]["action"] == "calculate"

        info_event = next(
            (e for e in parsed_events if e.get("event") == "lava_tube_biospeleology_info"),
            None,
        )
        assert info_event is not None
        assert "lava_tube_biospeleology_info" in info_event

        token_events = [
            e
            for e in parsed_events
            if "chunk" in e or "token" in e or e.get("event") == "token"
        ]
        assert len(token_events) > 0

        # 6b. Test lookup custom event via /api/create_response/stream
        stream_req_lookup = {
            "question": "Tell me about Ape Cave Mount St Helens basalt lava tube biospeleology details",
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
            (e for e in parsed_lookup if e.get("event") == "lava_tube_biospeleology_lookup"),
            None,
        )
        assert lookup_event is not None
        assert "lava_tube_biospeleology_info" in lookup_event


@pytest.mark.anyio
async def test_lava_tube_biospeleology_journey_real_mode_execution():
    """Step 7: Verifies lava tube biospeleology prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Pele",
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
                return_value="In Kazumura Cave, Metrosideros root curtains sustain obligate eyeless troglobites."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the non-contact traversal protocol for Kazumura Cave lava tube root curtain galleries?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "lava_tube_biospeleology_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "lava_tube_biospeleology_prompt" in call_kwargs
        prompt_content = call_kwargs["lava_tube_biospeleology_prompt"].lower()
        assert (
            "lava tube" in prompt_content
            or "troglomorphic" in prompt_content
            or "biospeleology" in prompt_content
            or "kazumura" in prompt_content
        )
