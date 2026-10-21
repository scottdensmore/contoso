"""Unit tests for the FastAPI tephra_navigation router and chat/stream integration."""

from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_tephra_navigation_router_sites_and_filters():
    for prefix in (
        "/api/v1/tephra-navigation",
        "/api/tephra-navigation",
        "/tephra-navigation",
    ):
        res_sites = client.get(f"{prefix}/sites")
        assert res_sites.status_code == 200
        data = res_sites.json()
        sites = data["sites"] if isinstance(data, dict) and "sites" in data else data
        assert len(sites) == 4

        res_country = client.get(f"{prefix}/sites", params={"country": "Vanuatu"})
        assert res_country.status_code == 200
        country_sites = (
            res_country.json()["sites"]
            if isinstance(res_country.json(), dict) and "sites" in res_country.json()
            else res_country.json()
        )
        assert len(country_sites) == 1
        assert country_sites[0]["id"] == "yasur-ash-plain-vanuatu"

        res_lith = client.get(f"{prefix}/sites", params={"tephra_lithology": "vitrophyric-ash"})
        assert res_lith.status_code == 200
        lith_sites = (
            res_lith.json()["sites"]
            if isinstance(res_lith.json(), dict) and "sites" in res_lith.json()
            else res_lith.json()
        )
        assert len(lith_sites) == 1
        assert lith_sites[0]["id"] == "chaiten-rhyolite-pumice-chile"

        res_diff = client.get(f"{prefix}/sites", params={"difficulty": "challenging"})
        assert res_diff.status_code == 200
        diff_sites = (
            res_diff.json()["sites"]
            if isinstance(res_diff.json(), dict) and "sites" in res_diff.json()
            else res_diff.json()
        )
        assert len(diff_sites) == 2

        res_search = client.get(f"{prefix}/sites", params={"search": "Tarawera"})
        assert res_search.status_code == 200
        search_sites = (
            res_search.json()["sites"]
            if isinstance(res_search.json(), dict) and "sites" in res_search.json()
            else res_search.json()
        )
        assert len(search_sites) == 1
        assert search_sites[0]["id"] == "tarawera-scoria-chute-nz"


def test_tephra_navigation_router_site_detail_and_404():
    for prefix in (
        "/api/v1/tephra-navigation",
        "/api/tephra-navigation",
        "/tephra-navigation",
    ):
        res_ok = client.get(f"{prefix}/sites/acatenango-fuego-tephra-guatemala")
        assert res_ok.status_code == 200
        assert res_ok.json()["id"] == "acatenango-fuego-tephra-guatemala"
        assert res_ok.json()["country"] == "Guatemala"

        res_404 = client.get(f"{prefix}/sites/nonexistent-volcano-site")
        assert res_404.status_code == 404


def test_tephra_navigation_router_calculate_and_validation():
    for prefix in (
        "/api/v1/tephra-navigation",
        "/api/tephra-navigation",
        "/tephra-navigation",
    ):
        res_low = client.post(
            f"{prefix}/calculate",
            json={
                "slope_angle_deg": 14.0,
                "ash_depth_cm": 12.0,
                "wind_speed_kmh": 10.0,
                "cristobalite_pct": 2.0,
                "grain_size_mm": 8.0,
            },
        )
        assert res_low.status_code == 200
        body_low = res_low.json()
        assert body_low["risk_level"] == "low"
        assert body_low["respirator_class"] == "N95-goggles"

        res_crit = client.post(
            f"{prefix}/calculate",
            json={
                "slope_angle_deg": 44.0,
                "ash_depth_cm": 140.0,
                "wind_speed_kmh": 68.0,
                "cristobalite_pct": 22.0,
                "grain_size_mm": 0.25,
            },
        )
        assert res_crit.status_code == 200
        body_crit = res_crit.json()
        assert body_crit["risk_level"] == "critical"
        assert body_crit["respirator_class"] == "abort-silicosis-grainflow-hazard"

        res_invalid = client.post(
            f"{prefix}/calculate",
            json={
                "slope_angle_deg": 65.0,
                "ash_depth_cm": 40.0,
                "wind_speed_kmh": 20.0,
                "cristobalite_pct": 8.0,
                "grain_size_mm": 2.0,
            },
        )
        assert res_invalid.status_code in (400, 422)


def test_tephra_navigation_router_checklist():
    for prefix in (
        "/api/v1/tephra-navigation",
        "/api/tephra-navigation",
        "/tephra-navigation",
    ):
        res_checklist = client.get(f"{prefix}/checklist")
        assert res_checklist.status_code == 200
        items = (
            res_checklist.json()["checklist"]
            if isinstance(res_checklist.json(), dict) and "checklist" in res_checklist.json()
            else res_checklist.json()
        )
        assert len(items) >= 6

        res_gear = client.get(f"{prefix}/gear")
        assert res_gear.status_code == 200
        assert len(res_gear.json()) >= 6


def test_tephra_navigation_chat_and_stream_integration():
    with patch("main.REAL_CHAT_AVAILABLE", False):
        chat_res = client.post(
            "/api/v1/chat",
            json={
                "customer_id": "1",
                "question": "Calculate tephra navigation on Mount Yasur with slope angle 24 deg, ash depth 35 cm, wind speed 22 km/h, cristobalite 3.5%, grain size 4.5 mm",
                "chat_history": [],
            },
        )
        assert chat_res.status_code == 200
        body = chat_res.json()
        assert "tephra_navigation_info" in body
        assert body["tephra_navigation_info"]["action"] == "tephra_navigation_calculated"

        msg_res = client.post(
            "/api/v1/chat/message",
            json={
                "message": "Tell me about Volcán Chaitén Obsidian Dome & Cristobalite Ash Apron tephra site",
            },
        )
        assert msg_res.status_code == 200
        msg_body = msg_res.json()
        assert "tephra_navigation_info" in msg_body
        assert msg_body["tephra_navigation_info"]["action"] == "tephra_navigation_lookup"

        with client.stream(
            "POST",
            "/api/v1/stream",
            json={
                "customer_id": "1",
                "question": "What respirator gear is needed for volcanic tephra and lapilli scree descent?",
                "chat_history": [],
            },
        ) as s_resp:
            assert s_resp.status_code == 200
            raw = "".join(s_resp.iter_text())
        assert "event: metadata" in raw
        assert "tephra_navigation_info" in raw
        assert "event: done" in raw
