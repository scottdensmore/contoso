"""Multi-Step API User Journey Test for Subarctic River Aufeis (Icings) & Overflow Ice Sheet Crossing.

Covers the 7-step end-to-end API user journey:
  Step 1: Health probes (/health, /, /api/health)
  Step 2: Catalog discovery & filtering (/api/aufeis-crossing/sites + filters + 422 validation)
  Step 3: Single site detail lookup (canning-river-shublik-springs-aufeis) & 404 check
  Step 4: Crossing safety calculation (POST /api/aufeis-crossing/calculate: nominal cryolocked laminar sheet vs abort pressurized lens/cavity collapse + 422 validation)
  Step 5: Mandatory gear checklist (GET /api/aufeis-crossing/gear)
  Step 6: Synchronous chat endpoint (POST /api/chat for calculation, site lookup, and general info)
  Step 7: Streaming SSE chat endpoint (POST /api/chat/stream verifying event: metadata action and event: done)
"""

import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_aufeis_crossing_multi_step_journey():

    # -------------------------------------------------------------------------
    # Step 1: Health probes (/health, /, /api/health)
    # -------------------------------------------------------------------------
    for path in ("/health", "/", "/api/health"):
        resp = client.get(path)
        assert resp.status_code == 200
        assert resp.json().get("status") in ("healthy", "running", "ok")

    # -------------------------------------------------------------------------
    # Step 2: Catalog discovery & filtering (/api/aufeis-crossing/sites + filters + 422 validation)
    # -------------------------------------------------------------------------
    sites_resp = client.get("/api/aufeis-crossing/sites")
    assert sites_resp.status_code == 200
    sites = sites_resp.json()
    assert len(sites) == 5

    # Verify dual-prefix parity (/aufeis-crossing/sites)
    dual_sites_resp = client.get("/aufeis-crossing/sites")
    assert dual_sites_resp.status_code == 200
    assert len(dual_sites_resp.json()) == 5

    # Filter by morphology
    morph_filtered = client.get(
        "/api/aufeis-crossing/sites",
        params={"morphology": "perennial_tundra_spring_naled"},
    )
    assert morph_filtered.status_code == 200
    assert len(morph_filtered.json()) == 2
    assert {s["id"] for s in morph_filtered.json()} == {
        "canning-river-shublik-springs-aufeis",
        "moma-valley-ulakhan-taryn-giant-naled",
    }

    # Filter by overflow_state
    hydro_filtered = client.get(
        "/api/aufeis-crossing/sites",
        params={"overflow_state": "vitreous_dry_cryolock"},
    )
    assert hydro_filtered.status_code == 200
    assert len(hydro_filtered.json()) == 2

    # Filter by traversal_mode
    mode_filtered = client.get(
        "/api/aufeis-crossing/sites",
        params={"traversal_mode": "nordic_backcountry_ski_glide"},
    )
    assert mode_filtered.status_code == 200
    assert len(mode_filtered.json()) == 2

    # Invalid filter returns 422
    invalid_filter = client.get(
        "/api/aufeis-crossing/sites",
        params={"morphology": "invalid_aufeis_morphology"},
    )
    assert invalid_filter.status_code == 422

    # -------------------------------------------------------------------------
    # Step 3: Single site detail lookup (canning-river-shublik-springs-aufeis) & 404 check
    # -------------------------------------------------------------------------
    detail_resp = client.get(
        "/api/aufeis-crossing/sites/canning-river-shublik-springs-aufeis"
    )
    assert detail_resp.status_code == 200
    canning = detail_resp.json()
    assert canning["id"] == "canning-river-shublik-springs-aufeis"
    assert canning["morphology"] == "perennial_tundra_spring_naled"
    assert canning["overflow_state"] == "vitreous_dry_cryolock"
    assert canning["traversal_mode"] == "nordic_backcountry_ski_glide"
    assert canning["elevation"] == 420
    assert canning["mean_upper_crust_thickness_cm"] == 26.0

    not_found_resp = client.get(
        "/api/aufeis-crossing/sites/nonexistent-aufeis-basin"
    )
    assert not_found_resp.status_code == 404

    # -------------------------------------------------------------------------
    # Step 4: Crossing safety calculation (POST /api/aufeis-crossing/calculate)
    # -------------------------------------------------------------------------
    # 4a. Nominal cryolocked laminar sheet crossing
    calc_nominal_resp = client.post(
        "/api/aufeis-crossing/calculate",
        json={
            "morphology": "perennial_tundra_spring_naled",
            "overflow_state": "vitreous_dry_cryolock",
            "traversal_mode": "nordic_backcountry_ski_glide",
            "upper_crust_thickness_cm": 28.0,
            "slush_water_lens_depth_cm": 6.0,
            "ambient_air_temp_c": -22.0,
            "hydrostatic_head_kpa": 10.0,
            "traveler_plus_pulk_load_kg": 95.0,
            "cavity_span_m": 0.5,
        },
    )
    assert calc_nominal_resp.status_code == 200
    nominal_data = calc_nominal_resp.json()
    assert nominal_data["safety_status"] == "nominal_cryolocked_laminar_sheet"
    assert nominal_data["effective_crust_bearing_margin"] >= 1.7
    assert nominal_data["slush_breakthrough_probability"] < 0.25

    # 4b. Critical thin pressurized blister abort
    calc_abort_resp = client.post(
        "/api/aufeis-crossing/calculate",
        json={
            "morphology": "pressurized_groundwater_frost_blister",
            "overflow_state": "hollow_drained_air_cavity_vault",
            "traversal_mode": "belayed_ice_screw_probe_team",
            "upper_crust_thickness_cm": 6.0,
            "slush_water_lens_depth_cm": 70.0,
            "ambient_air_temp_c": -28.0,
            "hydrostatic_head_kpa": 72.0,
            "traveler_plus_pulk_load_kg": 145.0,
            "cavity_span_m": 4.5,
        },
    )
    assert calc_abort_resp.status_code == 200
    abort_data = calc_abort_resp.json()
    assert (
        abort_data["safety_status"]
        == "abort_pressurized_lens_or_cavity_collapse"
    )
    assert (
        abort_data["effective_crust_bearing_margin"]
        < nominal_data["effective_crust_bearing_margin"]
    )
    assert (
        abort_data["slush_breakthrough_probability"]
        > nominal_data["slush_breakthrough_probability"]
    )
    assert (
        abort_data["cavity_vault_collapse_risk_percent"]
        > nominal_data["cavity_vault_collapse_risk_percent"]
    )

    # 4c. Out-of-range 422 validation
    calc_invalid_resp = client.post(
        "/api/aufeis-crossing/calculate",
        json={
            "morphology": "perennial_tundra_spring_naled",
            "overflow_state": "vitreous_dry_cryolock",
            "traversal_mode": "nordic_backcountry_ski_glide",
            "upper_crust_thickness_cm": 0.4,
            "slush_water_lens_depth_cm": 6.0,
            "ambient_air_temp_c": 22.0,
            "hydrostatic_head_kpa": 12.0,
            "traveler_plus_pulk_load_kg": 95.0,
            "cavity_span_m": 0.6,
        },
    )
    assert calc_invalid_resp.status_code == 422

    # -------------------------------------------------------------------------
    # Step 5: Mandatory gear checklist (GET /api/aufeis-crossing/gear)
    # -------------------------------------------------------------------------
    gear_resp = client.get("/api/aufeis-crossing/gear")
    assert gear_resp.status_code == 200
    gear_items = gear_resp.json()
    assert len(gear_items) == 6
    assert all(item["mandatory"] is True for item in gear_items)
    assert {g["id"] for g in gear_items} == {
        "graduated-chisel-tip-ice-sounding-bar",
        "vapor-barrier-neoprene-insulated-overboots",
        "ptfe-fluoropolymer-ski-base-anti-ice-scraper",
        "retractable-dual-ice-awls-and-throw-bag",
        "tubular-22cm-express-ice-screws-and-v-threader",
        "sealed-drybag-pulk-hull-and-floating-tow-tether",
    }

    # -------------------------------------------------------------------------
    # Step 6: Synchronous chat endpoint (POST /api/chat)
    # -------------------------------------------------------------------------
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # 6a. Calculation query
        chat_calc_resp = client.post(
            "/api/chat",
            json={
                "customer_id": "1",
                "question": (
                    "Calculate aufeis crossing safety at Canning River Shublik Springs with "
                    "crust thickness 14 cm, slush lens depth 26 cm, air temp -22 C, "
                    "hydrostatic head 38 kPa, load 140 kg, cavity span 1.2 m"
                ),
                "chat_history": [],
            },
        )
        assert chat_calc_resp.status_code == 200
        chat_calc_body = chat_calc_resp.json()
        assert "aufeis_crossing_info" in chat_calc_body
        assert (
            chat_calc_body["aufeis_crossing_info"]["action"]
            == "aufeis_crossing_calculated"
        )
        assert (
            "effective_crust_bearing_margin"
            in chat_calc_body["aufeis_crossing_info"]
        )

        # 6b. Site lookup query
        chat_lookup_resp = client.post(
            "/api/chat",
            json={
                "customer_id": "1",
                "question": "Tell me about Canning River Shublik Springs aufeis site details",
                "chat_history": [],
            },
        )
        assert chat_lookup_resp.status_code == 200
        chat_lookup_body = chat_lookup_resp.json()
        assert "aufeis_crossing_info" in chat_lookup_body
        assert (
            chat_lookup_body["aufeis_crossing_info"]["action"]
            == "aufeis_crossing_lookup"
        )
        assert (
            chat_lookup_body["aufeis_crossing_info"]["site"]["id"]
            == "canning-river-shublik-springs-aufeis"
        )

        # 6c. General info query
        chat_info_resp = client.post(
            "/api/chat",
            json={
                "customer_id": "1",
                "question": "What mandatory gear and protocols are needed for subarctic river aufeis and overflow ice crossing?",
                "chat_history": [],
            },
        )
        assert chat_info_resp.status_code == 200
        chat_info_body = chat_info_resp.json()
        assert "aufeis_crossing_info" in chat_info_body
        assert (
            chat_info_body["aufeis_crossing_info"]["action"]
            == "aufeis_crossing_info"
        )
        assert len(chat_info_body["aufeis_crossing_info"]["sites"]) == 5
        assert len(chat_info_body["aufeis_crossing_info"]["gear_checklist"]) == 6

        # -------------------------------------------------------------------------
        # Step 7: Streaming SSE chat endpoint (POST /api/chat/stream)
        # -------------------------------------------------------------------------
        with client.stream(
            "POST",
            "/api/chat/stream",
            json={
                "customer_id": "1",
                "question": (
                    "Calculate aufeis crossing safety for crust thickness 24 cm, slush lens depth 8 cm, "
                    "air temp -28 C, hydrostatic head 15 kPa, load 125 kg, cavity span 0.8 m"
                ),
                "chat_history": [],
            },
        ) as stream_resp:
            assert stream_resp.status_code == 200
            raw_text = "".join(stream_resp.iter_text())

        assert "event: metadata" in raw_text
        assert "aufeis_crossing_calculated" in raw_text
        assert "event: done" in raw_text

        # Parse metadata payload from SSE lines
        lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
        metadata_payload = None
        for idx, line in enumerate(lines):
            if line == "event: metadata" and idx + 1 < len(lines):
                next_line = lines[idx + 1]
                if next_line.startswith("data: "):
                    metadata_payload = json.loads(next_line[len("data: ") :])
                    break
        assert metadata_payload is not None
        assert metadata_payload["action"] == "aufeis_crossing_calculated"
        assert "effective_crust_bearing_margin" in metadata_payload
