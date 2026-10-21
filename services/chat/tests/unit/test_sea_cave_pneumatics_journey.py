"""Multi-Step API User Journey Test for Coastal Blowhole, Surge Channel & Sea-Cave Pneumatic Wave-Hazard Navigation.

Covers the 7-step end-to-end API user journey:
  Step 1: Health probes (/health, /, /api/health)
  Step 2: Catalog discovery & filtering (/api/sea-cave-pneumatics/sites + filters + invalid filter validation)
  Step 3: Single site detail lookup (mendocino-devils-punchbowl-russian-gulch-siphon) & 404 check
  Step 4: Pneumatic safety calculation (POST /api/sea-cave-pneumatics/calculate: nominal vented arch window vs critical long-period piston-seal abort + invalid input validation)
  Step 5: Mandatory gear checklist (GET /api/sea-cave-pneumatics/gear)
  Step 6: Synchronous chat endpoint (POST /api/chat for calculation, site lookup, and general info)
  Step 7: Streaming SSE chat endpoint (POST /api/chat/stream verifying event: metadata action and event: done)
"""

import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_sea_cave_pneumatics_multi_step_journey():

    # -------------------------------------------------------------------------
    # Step 1: Health probes (/health, /, /api/health)
    # -------------------------------------------------------------------------
    for path in ("/health", "/", "/api/health"):
        resp = client.get(path)
        assert resp.status_code == 200
        assert resp.json().get("status") in ("healthy", "running", "ok")

    # -------------------------------------------------------------------------
    # Step 2: Catalog discovery & filtering (/api/sea-cave-pneumatics/sites + filters + validation)
    # -------------------------------------------------------------------------
    sites_resp = client.get("/api/sea-cave-pneumatics/sites")
    assert sites_resp.status_code == 200
    sites = sites_resp.json()
    assert len(sites) == 5

    # Verify dual-prefix parity (/sea-cave-pneumatics/sites)
    dual_sites_resp = client.get("/sea-cave-pneumatics/sites")
    assert dual_sites_resp.status_code == 200
    assert len(dual_sites_resp.json()) == 5

    # Filter by morphology
    morph_filtered = client.get(
        "/api/sea-cave-pneumatics/sites",
        params={"morphology": "boulder_choked_collapse_doline"},
    )
    assert morph_filtered.status_code == 200
    assert len(morph_filtered.json()) == 1
    assert (
        morph_filtered.json()[0]["id"]
        == "mendocino-devils-punchbowl-russian-gulch-siphon"
    )

    # Filter by wave_regime
    wave_filtered = client.get(
        "/api/sea-cave-pneumatics/sites",
        params={"wave_regime": "long_period_forerunner_swell_17s"},
    )
    assert wave_filtered.status_code == 200
    assert len(wave_filtered.json()) == 2
    assert {s["id"] for s in wave_filtered.json()} == {
        "mendocino-devils-punchbowl-russian-gulch-siphon",
        "na-pali-honopu-open-ceiling-lava-sea-cave",
    }

    # Filter by traversal_mode
    mode_filtered = client.get(
        "/api/sea-cave-pneumatics/sites",
        params={"traversal_mode": "sit_on_top_sea_kayak_sprint"},
    )
    assert mode_filtered.status_code == 200
    assert len(mode_filtered.json()) == 2
    assert {s["id"] for s in mode_filtered.json()} == {
        "mendocino-devils-punchbowl-russian-gulch-siphon",
        "pictured-rocks-lovers-leap-sandstone-sea-caves",
    }

    # Invalid filter returns 400 or 422
    invalid_filter = client.get(
        "/api/sea-cave-pneumatics/sites",
        params={"morphology": "invalid_littoral_conduit_morphology"},
    )
    assert invalid_filter.status_code in (400, 422)

    # -------------------------------------------------------------------------
    # Step 3: Single site detail lookup (mendocino-devils-punchbowl-russian-gulch-siphon) & 404 check
    # -------------------------------------------------------------------------
    detail_resp = client.get(
        "/api/sea-cave-pneumatics/sites/mendocino-devils-punchbowl-russian-gulch-siphon"
    )
    assert detail_resp.status_code == 200
    mendocino = detail_resp.json()
    assert (
        mendocino["id"] == "mendocino-devils-punchbowl-russian-gulch-siphon"
    )
    assert mendocino["morphology"] == "boulder_choked_collapse_doline"
    assert mendocino["wave_regime"] == "long_period_forerunner_swell_17s"
    assert mendocino["traversal_mode"] == "sit_on_top_sea_kayak_sprint"
    assert mendocino["elevation"] == 0
    assert mendocino["portal_ceiling_clearance_m"] == 3.2
    assert mendocino["typical_significant_wave_height_m"] == 1.8
    assert mendocino["typical_swell_period_seconds"] == 15.0
    assert mendocino["chamber_convergence_ratio"] == 2.4
    assert mendocino["chamber_length_m"] == 62.0

    not_found_resp = client.get(
        "/api/sea-cave-pneumatics/sites/nonexistent-sea-cave-siphon"
    )
    assert not_found_resp.status_code == 404

    # -------------------------------------------------------------------------
    # Step 4: Pneumatic safety calculation (POST /api/sea-cave-pneumatics/calculate)
    # -------------------------------------------------------------------------
    # 4a. Nominal vented arch window
    calc_nominal_resp = client.post(
        "/api/sea-cave-pneumatics/calculate",
        json={
            "morphology": "dual_portal_littoral_through_arch",
            "wave_regime": "short_period_wind_chop_8s",
            "traversal_mode": "sit_on_top_sea_kayak_sprint",
            "portal_ceiling_clearance_m": 5.2,
            "significant_wave_height_m": 0.6,
            "swell_period_seconds": 8.0,
            "chamber_convergence_ratio": 1.2,
            "tide_height_above_mllw_m": 0.2,
            "chamber_length_m": 38.0,
        },
    )
    assert calc_nominal_resp.status_code == 200
    nominal_data = calc_nominal_resp.json()
    assert (
        nominal_data["safety_status"] == "nominal_vented_slack_swell_window"
    )
    assert nominal_data["portal_piston_seal_probability"] < 0.25
    assert nominal_data["pneumatic_overpressure_kpa"] < 12.0

    # 4b. Critical long-period piston-seal abort
    calc_abort_resp = client.post(
        "/api/sea-cave-pneumatics/calculate",
        json={
            "morphology": "constricted_pneumatic_blowhole_shaft",
            "wave_regime": "infragravity_sneaker_wave_group_22s",
            "traversal_mode": "rope_belayed_rim_standoff_observation",
            "portal_ceiling_clearance_m": 1.2,
            "significant_wave_height_m": 3.4,
            "swell_period_seconds": 20.0,
            "chamber_convergence_ratio": 4.5,
            "tide_height_above_mllw_m": 2.1,
            "chamber_length_m": 60.0,
        },
    )
    assert calc_abort_resp.status_code == 200
    abort_data = calc_abort_resp.json()
    assert (
        abort_data["safety_status"]
        == "abort_pneumatic_piston_seal_and_blowhole_eruption"
    )
    assert (
        abort_data["portal_piston_seal_probability"]
        > nominal_data["portal_piston_seal_probability"]
    )
    assert (
        abort_data["pneumatic_overpressure_kpa"]
        > nominal_data["pneumatic_overpressure_kpa"]
    )
    assert (
        abort_data["rebound_surge_velocity_ms"]
        > nominal_data["rebound_surge_velocity_ms"]
    )

    # 4c. Out-of-range validation
    calc_invalid_resp = client.post(
        "/api/sea-cave-pneumatics/calculate",
        json={
            "morphology": "dual_portal_littoral_through_arch",
            "wave_regime": "short_period_wind_chop_8s",
            "traversal_mode": "sit_on_top_sea_kayak_sprint",
            "portal_ceiling_clearance_m": 0.1,
            "significant_wave_height_m": 0.6,
            "swell_period_seconds": 8.0,
            "chamber_convergence_ratio": 1.2,
            "tide_height_above_mllw_m": 0.2,
            "chamber_length_m": 38.0,
        },
    )
    assert calc_invalid_resp.status_code in (400, 422)

    # -------------------------------------------------------------------------
    # Step 5: Mandatory gear checklist (GET /api/sea-cave-pneumatics/gear)
    # -------------------------------------------------------------------------
    gear_resp = client.get("/api/sea-cave-pneumatics/gear")
    assert gear_resp.status_code == 200
    gear_items = gear_resp.json()
    assert len(gear_items) == 6
    assert all(item["mandatory"] is True for item in gear_items)
    assert {g["id"] for g in gear_items} == {
        "ce-en1385-whitewater-and-surf-impact-helmet",
        "vented-acoustic-barotrauma-surf-earplugs",
        "high-flotation-quick-release-coasteering-pfd",
        "blunt-tip-titanium-line-cutter-and-kelp-knife",
        "dual-beam-ipx8-submersible-headlamp-and-strobe",
        "digital-swell-set-interval-chronograph-and-tide-table",
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
                    "Calculate sea cave pneumatic wave safety at Kiama blowhole with "
                    "portal clearance 1.4 m, wave height 2.8 m, swell period 18 s, "
                    "convergence ratio 4.1, tide 1.6 m, chamber length 54 m"
                ),
                "chat_history": [],
            },
        )
        assert chat_calc_resp.status_code == 200
        chat_calc_body = chat_calc_resp.json()
        assert "sea_cave_pneumatics_info" in chat_calc_body
        assert (
            chat_calc_body["sea_cave_pneumatics_info"]["action"]
            == "sea_cave_pneumatics_calculated"
        )
        assert (
            "portal_piston_seal_probability"
            in chat_calc_body["sea_cave_pneumatics_info"]
        )

        # 6b. Site lookup query
        chat_lookup_resp = client.post(
            "/api/chat",
            json={
                "customer_id": "1",
                "question": "Tell me about Mendocino Devils Punchbowl Russian Gulch sea cave site details",
                "chat_history": [],
            },
        )
        assert chat_lookup_resp.status_code == 200
        chat_lookup_body = chat_lookup_resp.json()
        assert "sea_cave_pneumatics_info" in chat_lookup_body
        assert (
            chat_lookup_body["sea_cave_pneumatics_info"]["action"]
            == "sea_cave_pneumatics_lookup"
        )
        assert (
            chat_lookup_body["sea_cave_pneumatics_info"]["site"]["id"]
            == "mendocino-devils-punchbowl-russian-gulch-siphon"
        )

        # 6c. General info query
        chat_info_resp = client.post(
            "/api/chat",
            json={
                "customer_id": "1",
                "question": "What mandatory gear and protocols are needed for coastal blowhole, surge channel, and sea-cave pneumatic navigation?",
                "chat_history": [],
            },
        )
        assert chat_info_resp.status_code == 200
        chat_info_body = chat_info_resp.json()
        assert "sea_cave_pneumatics_info" in chat_info_body
        assert (
            chat_info_body["sea_cave_pneumatics_info"]["action"]
            == "sea_cave_pneumatics_info"
        )
        assert len(chat_info_body["sea_cave_pneumatics_info"]["sites"]) == 5
        assert (
            len(chat_info_body["sea_cave_pneumatics_info"]["gear_checklist"])
            == 6
        )

        # -------------------------------------------------------------------------
        # Step 7: Streaming SSE chat endpoint (POST /api/chat/stream)
        # -------------------------------------------------------------------------
        with client.stream(
            "POST",
            "/api/chat/stream",
            json={
                "customer_id": "1",
                "question": (
                    "Calculate sea cave pneumatic safety for portal clearance 3.2 m, "
                    "wave height 1.8 m, swell period 15 s, convergence ratio 2.4, "
                    "tide 0.8 m, chamber length 62 m"
                ),
                "chat_history": [],
            },
        ) as stream_resp:
            assert stream_resp.status_code == 200
            raw_text = "".join(stream_resp.iter_text())

        assert "event: metadata" in raw_text
        assert "sea_cave_pneumatics_calculated" in raw_text
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
        assert (
            metadata_payload["action"] == "sea_cave_pneumatics_calculated"
        )
        assert "portal_piston_seal_probability" in metadata_payload
