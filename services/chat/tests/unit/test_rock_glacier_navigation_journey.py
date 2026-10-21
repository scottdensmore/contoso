"""Multi-Step API User Journey Test for High-Alpine Talus & Boulder-Field Periglacial Rock-Glacier Navigation.

Covers the 7-step end-to-end API user journey:
  Step 1: Health probes (/health, /, /api/health)
  Step 2: Catalog discovery & filtering (/api/rock-glacier-navigation/sites + filters + 422 validation)
  Step 3: Single site detail lookup (sourdough-peak-mccarthy-creek-rock-glacier) & 404 check
  Step 4: Navigation safety calculation (POST /api/rock-glacier-navigation/calculate: nominal cryo-cemented carapace vs critical oversteepened scarp/thaw-slump abort + 422 validation)
  Step 5: Mandatory gear checklist (GET /api/rock-glacier-navigation/gear)
  Step 6: Synchronous chat endpoint (POST /api/chat for calculation, site lookup, and general info)
  Step 7: Streaming SSE chat endpoint (POST /api/chat/stream verifying event: metadata action and event: done)
"""

import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_rock_glacier_navigation_multi_step_journey():

    # -------------------------------------------------------------------------
    # Step 1: Health probes (/health, /, /api/health)
    # -------------------------------------------------------------------------
    for path in ("/health", "/", "/api/health"):
        resp = client.get(path)
        assert resp.status_code == 200
        assert resp.json().get("status") in ("healthy", "running", "ok")

    # -------------------------------------------------------------------------
    # Step 2: Catalog discovery & filtering (/api/rock-glacier-navigation/sites + filters + 422 validation)
    # -------------------------------------------------------------------------
    sites_resp = client.get("/api/rock-glacier-navigation/sites")
    assert sites_resp.status_code == 200
    sites = sites_resp.json()
    assert len(sites) == 5

    # Verify dual-prefix parity (/rock-glacier-navigation/sites)
    dual_sites_resp = client.get("/rock-glacier-navigation/sites")
    assert dual_sites_resp.status_code == 200
    assert len(dual_sites_resp.json()) == 5

    # Filter by morphology
    morph_filtered = client.get(
        "/api/rock-glacier-navigation/sites",
        params={"morphology": "active_lobate_ice_cored_carapace"},
    )
    assert morph_filtered.status_code == 200
    assert len(morph_filtered.json()) == 1
    assert (
        morph_filtered.json()[0]["id"]
        == "sourdough-peak-mccarthy-creek-rock-glacier"
    )

    # Filter by ice_state
    ice_filtered = client.get(
        "/api/rock-glacier-navigation/sites",
        params={"ice_state": "cryo_cemented_permafrost_lock"},
    )
    assert ice_filtered.status_code == 200
    assert len(ice_filtered.json()) == 2
    assert {s["id"] for s in ice_filtered.json()} == {
        "sourdough-peak-mccarthy-creek-rock-glacier",
        "nesters-ridge-wheeler-peak-quartzite-blockfield",
    }

    # Filter by technique
    tech_filtered = client.get(
        "/api/rock-glacier-navigation/sites",
        params={"technique": "three_point_imbricated_slab_stepping"},
    )
    assert tech_filtered.status_code == 200
    assert len(tech_filtered.json()) == 2

    # Invalid filter returns 422
    invalid_filter = client.get(
        "/api/rock-glacier-navigation/sites",
        params={"morphology": "invalid_periglacial_morphology"},
    )
    assert invalid_filter.status_code == 422

    # -------------------------------------------------------------------------
    # Step 3: Single site detail lookup (sourdough-peak-mccarthy-creek-rock-glacier) & 404 check
    # -------------------------------------------------------------------------
    detail_resp = client.get(
        "/api/rock-glacier-navigation/sites/sourdough-peak-mccarthy-creek-rock-glacier"
    )
    assert detail_resp.status_code == 200
    sourdough = detail_resp.json()
    assert sourdough["id"] == "sourdough-peak-mccarthy-creek-rock-glacier"
    assert sourdough["morphology"] == "active_lobate_ice_cored_carapace"
    assert sourdough["ice_state"] == "cryo_cemented_permafrost_lock"
    assert sourdough["technique"] == "compression_ridge_crest_hopping"
    assert sourdough["elevation"] == 1720
    assert sourdough["mean_block_diameter_cm"] == 75.0
    assert sourdough["slope_angle_deg"] == 21.0
    assert sourdough["active_layer_thaw_depth_cm"] == 65.0
    assert sourdough["interstitial_void_ratio_percent"] == 22.0

    not_found_resp = client.get(
        "/api/rock-glacier-navigation/sites/nonexistent-rock-glacier-lobe"
    )
    assert not_found_resp.status_code == 404

    # -------------------------------------------------------------------------
    # Step 4: Navigation safety calculation (POST /api/rock-glacier-navigation/calculate)
    # -------------------------------------------------------------------------
    # 4a. Nominal cryo-cemented carapace
    calc_nominal_resp = client.post(
        "/api/rock-glacier-navigation/calculate",
        json={
            "morphology": "active_lobate_ice_cored_carapace",
            "ice_state": "cryo_cemented_permafrost_lock",
            "technique": "compression_ridge_crest_hopping",
            "mean_block_diameter_cm": 90.0,
            "slope_angle_deg": 19.0,
            "active_layer_thaw_depth_cm": 60.0,
            "interstitial_void_ratio_percent": 20.0,
            "ambient_air_temp_c": -4.0,
            "pack_weight_kg": 12.0,
        },
    )
    assert calc_nominal_resp.status_code == 200
    nominal_data = calc_nominal_resp.json()
    assert (
        nominal_data["safety_status"] == "nominal_cryo_cemented_carapace"
    )
    assert nominal_data["block_rotational_stability_index"] >= 1.75
    assert nominal_data["perched_block_tip_probability"] < 0.22

    # 4b. Critical oversteepened scarp / thaw-slump abort
    calc_abort_resp = client.post(
        "/api/rock-glacier-navigation/calculate",
        json={
            "morphology": "oversteepened_frontal_talus_apron",
            "ice_state": "isothermal_debris_creep_slump",
            "technique": "belayed_frontal_scarp_switchbacking",
            "mean_block_diameter_cm": 55.0,
            "slope_angle_deg": 41.0,
            "active_layer_thaw_depth_cm": 230.0,
            "interstitial_void_ratio_percent": 46.0,
            "ambient_air_temp_c": 16.0,
            "pack_weight_kg": 26.0,
        },
    )
    assert calc_abort_resp.status_code == 200
    abort_data = calc_abort_resp.json()
    assert (
        abort_data["safety_status"]
        == "abort_oversteepened_scarp_or_thaw_rotation"
    )
    assert (
        abort_data["block_rotational_stability_index"]
        < nominal_data["block_rotational_stability_index"]
    )
    assert (
        abort_data["perched_block_tip_probability"]
        > nominal_data["perched_block_tip_probability"]
    )
    assert (
        abort_data["sub_carapace_void_entrapment_risk_percent"]
        > nominal_data["sub_carapace_void_entrapment_risk_percent"]
    )

    # 4c. Out-of-range 422 validation
    calc_invalid_resp = client.post(
        "/api/rock-glacier-navigation/calculate",
        json={
            "morphology": "active_lobate_ice_cored_carapace",
            "ice_state": "cryo_cemented_permafrost_lock",
            "technique": "compression_ridge_crest_hopping",
            "mean_block_diameter_cm": 8.0,
            "slope_angle_deg": 19.0,
            "active_layer_thaw_depth_cm": 60.0,
            "interstitial_void_ratio_percent": 20.0,
            "ambient_air_temp_c": -4.0,
            "pack_weight_kg": 12.0,
        },
    )
    assert calc_invalid_resp.status_code == 422

    # -------------------------------------------------------------------------
    # Step 5: Mandatory gear checklist (GET /api/rock-glacier-navigation/gear)
    # -------------------------------------------------------------------------
    gear_resp = client.get("/api/rock-glacier-navigation/gear")
    assert gear_resp.status_code == 200
    gear_items = gear_resp.json()
    assert len(gear_items) == 6
    assert all(item["mandatory"] is True for item in gear_items)
    assert {g["id"] for g in gear_items} == {
        "stiff-shank-vibram-megagrip-mountaineering-boots",
        "kevlar-reinforced-nitrile-palm-boulder-gloves",
        "fixed-section-chromoly-scrambling-staff-no-baskets",
        "uiia-certified-rockfall-and-impact-climbing-helmet",
        "high-collar-ballistic-nylon-talus-gaiters",
        "compact-dyneema-cord-and-pulley-block-extrication-kit",
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
                    "Calculate rock glacier navigation safety at Dos Lenguas with "
                    "block diameter 68 cm, slope angle 39 deg, active layer thaw depth 210 cm, "
                    "void ratio 42%, air temp 14 C, pack weight 22 kg"
                ),
                "chat_history": [],
            },
        )
        assert chat_calc_resp.status_code == 200
        chat_calc_body = chat_calc_resp.json()
        assert "rock_glacier_navigation_info" in chat_calc_body
        assert (
            chat_calc_body["rock_glacier_navigation_info"]["action"]
            == "rock_glacier_navigation_calculated"
        )
        assert (
            "block_rotational_stability_index"
            in chat_calc_body["rock_glacier_navigation_info"]
        )

        # 6b. Site lookup query
        chat_lookup_resp = client.post(
            "/api/chat",
            json={
                "customer_id": "1",
                "question": "Tell me about Sourdough Peak McCarthy Creek rock glacier site details",
                "chat_history": [],
            },
        )
        assert chat_lookup_resp.status_code == 200
        chat_lookup_body = chat_lookup_resp.json()
        assert "rock_glacier_navigation_info" in chat_lookup_body
        assert (
            chat_lookup_body["rock_glacier_navigation_info"]["action"]
            == "rock_glacier_navigation_lookup"
        )
        assert (
            chat_lookup_body["rock_glacier_navigation_info"]["site"]["id"]
            == "sourdough-peak-mccarthy-creek-rock-glacier"
        )

        # 6c. General info query
        chat_info_resp = client.post(
            "/api/chat",
            json={
                "customer_id": "1",
                "question": "What mandatory gear and protocols are needed for periglacial rock glacier and boulder-field navigation?",
                "chat_history": [],
            },
        )
        assert chat_info_resp.status_code == 200
        chat_info_body = chat_info_resp.json()
        assert "rock_glacier_navigation_info" in chat_info_body
        assert (
            chat_info_body["rock_glacier_navigation_info"]["action"]
            == "rock_glacier_navigation_info"
        )
        assert (
            len(chat_info_body["rock_glacier_navigation_info"]["sites"]) == 5
        )
        assert (
            len(
                chat_info_body["rock_glacier_navigation_info"][
                    "gear_checklist"
                ]
            )
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
                    "Calculate rock glacier navigation safety for block diameter 75 cm, "
                    "slope angle 21 deg, thaw depth 65 cm, void ratio 22%, "
                    "air temp -2 C, pack weight 14 kg"
                ),
                "chat_history": [],
            },
        ) as stream_resp:
            assert stream_resp.status_code == 200
            raw_text = "".join(stream_resp.iter_text())

        assert "event: metadata" in raw_text
        assert "rock_glacier_navigation_calculated" in raw_text
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
            metadata_payload["action"] == "rock_glacier_navigation_calculated"
        )
        assert "block_rotational_stability_index" in metadata_payload
