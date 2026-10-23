"""Unit tests for the Coastal Fjord Quick-Clay (Kvikkleire) Marine-Terrace & Retrogressive Slump Navigation FastAPI router."""

from __future__ import annotations

from contoso_chat.routers.quick_clay_terrace import router
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()
app.include_router(router, prefix="/api/quick-clay-terrace")
client = TestClient(app)


class TestQuickClayTerraceRouter:
    """Validate REST endpoints on the quick-clay terrace router."""

    def test_list_all_sites(self) -> None:
        resp = client.get("/api/quick-clay-terrace/sites")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 4
        assert len(data["sites"]) == 4

    def test_filter_sites_query_params(self) -> None:
        resp = client.get("/api/quick-clay-terrace/sites", params={"country": "Norway"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 2
        norway_ids = {s["id"] for s in data["sites"]}
        assert norway_ids == {
            "gauldalen-trondheimsfjord-kvikkleire-norway",
            "romerike-gjerdrum-ravine-terrace-norway",
        }

        resp_dep = client.get(
            "/api/quick-clay-terrace/sites",
            params={"deposit_type": "champlain-sea-leda-clay-terrace"},
        )
        assert resp_dep.status_code == 200
        assert resp_dep.json()["total"] == 1
        assert (
            resp_dep.json()["sites"][0]["id"]
            == "south-nation-lemieux-leda-clay-ontario-canada"
        )

        resp_diff = client.get(
            "/api/quick-clay-terrace/sites", params={"difficulty": "challenging"}
        )
        assert resp_diff.status_code == 200
        assert resp_diff.json()["total"] == 2

    def test_get_single_site_by_id_and_404(self) -> None:
        resp = client.get(
            "/api/quick-clay-terrace/sites/gauldalen-trondheimsfjord-kvikkleire-norway"
        )
        assert resp.status_code == 200
        site = resp.json()
        assert site["country"] == "Norway"
        assert site["deposit_type"] == "glaciomarine-kvikkleire-ravine"
        assert "calc_summary" in site

        not_found = client.get("/api/quick-clay-terrace/sites/nonexistent-kvikkleire-site")
        assert not_found.status_code == 404

    def test_post_and_get_calculate(self) -> None:
        payload = {
            "sensitivity_ratio_st": 135.0,
            "pore_salinity_g_per_l": 0.45,
            "ravine_slope_angle_deg": 32.0,
            "stream_toe_erosion_rate_cm_yr": 80.0,
            "rainfall_saturation_pct": 85.0,
        }
        post_resp = client.post("/api/quick-clay-terrace/calculate", json=payload)
        assert post_resp.status_code == 200
        post_data = post_resp.json()
        assert post_data["risk_level"] in {"high", "critical"}
        assert post_data["retrogressive_liquefaction_risk_pct"] > 50.0
        assert post_data["safe_crown_setback_distance_m"] > 60.0

        get_resp = client.get("/api/quick-clay-terrace/calculate", params=payload)
        assert get_resp.status_code == 200
        assert get_resp.json()["risk_level"] == post_data["risk_level"]

    def test_calculate_validation_error_returns_422(self) -> None:
        bad_payload = {
            "sensitivity_ratio_st": 450.0,
            "pore_salinity_g_per_l": 0.8,
            "ravine_slope_angle_deg": 24.0,
            "stream_toe_erosion_rate_cm_yr": 45.0,
            "rainfall_saturation_pct": 65.0,
        }
        resp = client.post("/api/quick-clay-terrace/calculate", json=bad_payload)
        assert resp.status_code == 422

    def test_checklist_and_gear_endpoints(self) -> None:
        chk = client.get("/api/quick-clay-terrace/checklist")
        assert chk.status_code == 200
        assert chk.json()["total"] == 6
        assert len(chk.json()["checklist"]) == 6

        gear = client.get("/api/quick-clay-terrace/gear")
        assert gear.status_code == 200
        assert gear.json()["total"] == 6
