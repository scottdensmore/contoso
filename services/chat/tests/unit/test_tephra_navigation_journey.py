"""Multi-Step API User Journey Test for Volcanic Tephra, Ash-Fall & Lapilli Scree Slope Descent & Respirator Guide.

Covers the 7-step end-to-end API user journey:
  Step 1: Health probes (/health, /, /api/health)
  Step 2: Catalog discovery & filtering (/api/v1/tephra-navigation/sites + country, tephra_lithology, difficulty, search filters)
  Step 3: Single site detail lookup (yasur-ash-plain-vanuatu & chaiten-rhyolite-pumice-chile) & 404 check
  Step 4: Tephra navigation safety calculation (POST /api/v1/tephra-navigation/calculate: nominal low risk vs critical cristobalite/grain-flow abort + 400/422 validation)
  Step 5: Mandatory gear checklist (GET /api/v1/tephra-navigation/checklist & /api/tephra-navigation/gear)
  Step 6: Synchronous chat endpoints (POST /api/chat, POST /api/v1/chat, POST /api/v1/chat/message for calculation, site lookup, and general info)
  Step 7: Streaming SSE chat endpoints (POST /api/chat/stream & POST /api/v1/stream verifying event: metadata action and event: done)
"""

import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_tephra_navigation_multi_step_journey():
    # -------------------------------------------------------------------------
    # Step 1: Health probes (/health, /, /api/health)
    # -------------------------------------------------------------------------
    for path in ("/health", "/", "/api/health"):
        resp = client.get(path)
        assert resp.status_code == 200
        assert resp.json().get("status") in ("healthy", "running", "ok")

    # -------------------------------------------------------------------------
    # Step 2: Catalog discovery & filtering (/api/v1/tephra-navigation/sites)
    # -------------------------------------------------------------------------
    sites_resp = client.get("/api/v1/tephra-navigation/sites")
    assert sites_resp.status_code == 200
    sites = sites_resp.json()
    assert len(sites) == 4

    # Verify prefix parity (/api/tephra-navigation/sites and /tephra-navigation/sites)
    for alt_prefix in ("/api/tephra-navigation", "/tephra-navigation"):
        alt_resp = client.get(f"{alt_prefix}/sites")
        assert alt_resp.status_code == 200
        assert len(alt_resp.json()) == 4

    # Filter by country
    country_resp = client.get("/api/v1/tephra-navigation/sites", params={"country": "Vanuatu"})
    assert country_resp.status_code == 200
    assert len(country_resp.json()) == 1
    assert country_resp.json()[0]["id"] == "yasur-ash-plain-vanuatu"

    # Filter by tephra_lithology
    lith_resp = client.get(
        "/api/v1/tephra-navigation/sites",
        params={"tephra_lithology": "vitrophyric-ash"},
    )
    assert lith_resp.status_code == 200
    assert len(lith_resp.json()) == 1
    assert lith_resp.json()[0]["id"] == "chaiten-rhyolite-pumice-chile"

    # Filter by difficulty
    diff_resp = client.get("/api/v1/tephra-navigation/sites", params={"difficulty": "challenging"})
    assert diff_resp.status_code == 200
    assert len(diff_resp.json()) == 2
    assert {s["id"] for s in diff_resp.json()} == {
        "acatenango-fuego-tephra-guatemala",
        "tarawera-scoria-chute-nz",
    }

    # Filter by search
    search_resp = client.get("/api/v1/tephra-navigation/sites", params={"search": "Tarawera"})
    assert search_resp.status_code == 200
    assert len(search_resp.json()) == 1
    assert search_resp.json()[0]["id"] == "tarawera-scoria-chute-nz"

    # -------------------------------------------------------------------------
    # Step 3: Single site detail lookup & 404 check
    # -------------------------------------------------------------------------
    detail_resp = client.get("/api/v1/tephra-navigation/sites/yasur-ash-plain-vanuatu")
    assert detail_resp.status_code == 200
    yasur = detail_resp.json()
    assert yasur["id"] == "yasur-ash-plain-vanuatu"
    assert yasur["name"] == "Mount Yasur Ash Plain & Scoria Cone Apron"
    assert yasur["country"] == "Vanuatu"
    assert yasur["tephra_lithology"] == "scoria-lapilli"
    assert yasur["difficulty"] == "moderate"

    not_found_resp = client.get("/api/v1/tephra-navigation/sites/nonexistent-tephra-site")
    assert not_found_resp.status_code == 404

    # -------------------------------------------------------------------------
    # Step 4: Tephra navigation calculation (POST /api/v1/tephra-navigation/calculate)
    # -------------------------------------------------------------------------
    # 4a. Nominal / low risk calculation
    calc_nominal_resp = client.post(
        "/api/v1/tephra-navigation/calculate",
        json={
            "slope_angle_deg": 14.0,
            "ash_depth_cm": 12.0,
            "wind_speed_kmh": 10.0,
            "cristobalite_pct": 2.0,
            "grain_size_mm": 8.0,
        },
    )
    assert calc_nominal_resp.status_code == 200
    nominal_data = calc_nominal_resp.json()
    assert nominal_data["risk_level"] == "low"
    assert nominal_data["respirator_class"] == "N95-goggles"
    assert nominal_data["grain_flow_factor_of_safety"] >= 1.55

    # 4b. Critical cristobalite / grain-flow hazard abort
    calc_critical_resp = client.post(
        "/api/v1/tephra-navigation/calculate",
        json={
            "slope_angle_deg": 44.0,
            "ash_depth_cm": 140.0,
            "wind_speed_kmh": 68.0,
            "cristobalite_pct": 22.0,
            "grain_size_mm": 0.25,
        },
    )
    assert calc_critical_resp.status_code == 200
    critical_data = calc_critical_resp.json()
    assert critical_data["risk_level"] == "critical"
    assert critical_data["respirator_class"] == "abort-silicosis-grainflow-hazard"
    assert critical_data["resuspended_pm10_ug_m3"] > nominal_data["resuspended_pm10_ug_m3"]
    assert (
        critical_data["grain_flow_factor_of_safety"] < nominal_data["grain_flow_factor_of_safety"]
    )
    assert critical_data["downslope_slide_ratio"] > nominal_data["downslope_slide_ratio"]
    assert critical_data["filter_clog_hours"] < nominal_data["filter_clog_hours"]

    # 4c. Out-of-range validation (400 / 422)
    calc_invalid_resp = client.post(
        "/api/v1/tephra-navigation/calculate",
        json={
            "slope_angle_deg": 62.0,
            "ash_depth_cm": 40.0,
            "wind_speed_kmh": 20.0,
            "cristobalite_pct": 8.0,
            "grain_size_mm": 2.0,
        },
    )
    assert calc_invalid_resp.status_code in (400, 422)

    # -------------------------------------------------------------------------
    # Step 5: Mandatory gear checklist (GET /api/v1/tephra-navigation/checklist)
    # -------------------------------------------------------------------------
    checklist_resp = client.get("/api/v1/tephra-navigation/checklist")
    assert checklist_resp.status_code == 200
    checklist_items = checklist_resp.json()
    assert len(checklist_items) >= 6
    assert all(item["mandatory"] is True for item in checklist_items)

    # -------------------------------------------------------------------------
    # Step 6: Synchronous chat endpoints (/api/v1/chat, /api/v1/chat/message, /api/chat)
    # -------------------------------------------------------------------------
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # 6a. Calculation query via /api/v1/chat
        chat_calc_resp = client.post(
            "/api/v1/chat",
            json={
                "customer_id": "1",
                "question": (
                    "Calculate tephra navigation on Volcán Chaitén with "
                    "slope angle 39 deg, ash depth 110 cm, wind speed 52 km/h, "
                    "cristobalite 21%, grain size 0.25 mm"
                ),
                "chat_history": [],
            },
        )
        assert chat_calc_resp.status_code == 200
        chat_calc_body = chat_calc_resp.json()
        assert "tephra_navigation_info" in chat_calc_body
        assert chat_calc_body["tephra_navigation_info"]["action"] == "tephra_navigation_calculated"
        assert "resuspended_pm10_ug_m3" in chat_calc_body["tephra_navigation_info"]

        # 6b. Site lookup query via /api/v1/chat/message
        chat_lookup_resp = client.post(
            "/api/v1/chat/message",
            json={
                "customer_id": "1",
                "message": "Tell me about Mount Yasur Ash Plain & Scoria Cone Apron tephra site details",
                "chat_history": [],
            },
        )
        assert chat_lookup_resp.status_code == 200
        chat_lookup_body = chat_lookup_resp.json()
        assert "tephra_navigation_info" in chat_lookup_body
        assert chat_lookup_body["tephra_navigation_info"]["action"] == "tephra_navigation_lookup"
        assert chat_lookup_body["tephra_navigation_info"]["site"]["id"] == "yasur-ash-plain-vanuatu"

        # 6c. General info query via /api/chat
        chat_info_resp = client.post(
            "/api/chat",
            json={
                "customer_id": "1",
                "question": "What mandatory respirator and gaiter gear is needed for volcanic tephra and lapilli scree descent?",
                "chat_history": [],
            },
        )
        assert chat_info_resp.status_code == 200
        chat_info_body = chat_info_resp.json()
        assert "tephra_navigation_info" in chat_info_body
        assert chat_info_body["tephra_navigation_info"]["action"] == "tephra_navigation_info"
        assert len(chat_info_body["tephra_navigation_info"]["sites"]) == 4

        # -------------------------------------------------------------------------
        # Step 7: Streaming SSE chat endpoints (/api/v1/stream & /api/chat/stream)
        # -------------------------------------------------------------------------
        with client.stream(
            "POST",
            "/api/v1/stream",
            json={
                "customer_id": "1",
                "question": (
                    "Calculate tephra navigation for slope angle 36 deg, "
                    "ash depth 65 cm, wind speed 42 km/h, cristobalite 12.5%, "
                    "grain size 1.8 mm"
                ),
                "chat_history": [],
            },
        ) as stream_resp:
            assert stream_resp.status_code == 200
            raw_text = "".join(stream_resp.iter_text())

        assert "event: metadata" in raw_text
        assert "tephra_navigation_calculated" in raw_text
        assert "event: done" in raw_text

        lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
        metadata_payload = None
        for idx, line in enumerate(lines):
            if line == "event: metadata" and idx + 1 < len(lines):
                next_line = lines[idx + 1]
                if next_line.startswith("data: "):
                    metadata_payload = json.loads(next_line[len("data: ") :])
                    break
        assert metadata_payload is not None
        assert metadata_payload["action"] == "tephra_navigation_calculated"
        assert "resuspended_pm10_ug_m3" in metadata_payload
        assert "grain_flow_factor_of_safety" in metadata_payload
