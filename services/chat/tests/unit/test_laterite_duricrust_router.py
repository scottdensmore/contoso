"""Unit tests for the Tropical Laterite Duricrust & Bauxite Ferricrete FastAPI router."""

from __future__ import annotations

from contoso_chat.routers.laterite_duricrust import router
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()
app.include_router(router, prefix="/api/laterite-duricrust")
client = TestClient(app)


class TestLateriteDuricrustRouter:
    """Validate REST endpoints on the laterite duricrust router."""

    def test_list_all_sites(self) -> None:
        resp = client.get("/api/laterite-duricrust/sites")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 4
        assert len(data["sites"]) == 4

    def test_filter_sites_query_params(self) -> None:
        resp = client.get("/api/laterite-duricrust/sites", params={"country": "Guinea"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 1
        assert data["sites"][0]["id"] == "fouta-djallon-bowe-labe-guinea"

        resp_type = client.get("/api/laterite-duricrust/sites", params={"duricrust_type": "canga"})
        assert resp_type.status_code == 200
        assert resp_type.json()["total"] == 1
        assert resp_type.json()["sites"][0]["id"] == "serra-dos-carajas-canga-para-brazil"

        resp_diff = client.get("/api/laterite-duricrust/sites", params={"difficulty": "extreme"})
        assert resp_diff.status_code == 200
        assert resp_diff.json()["total"] == 2

    def test_get_single_site_by_id_and_404(self) -> None:
        resp = client.get(
            "/api/laterite-duricrust/sites/mitchell-plateau-ngauwudu-kimberley-australia"
        )
        assert resp.status_code == 200
        site = resp.json()
        assert site["country"] == "Australia"
        assert "calc_summary" in site

        not_found = client.get("/api/laterite-duricrust/sites/nonexistent-laterite-mesa")
        assert not_found.status_code == 404

    def test_post_and_get_calculate(self) -> None:
        payload = {
            "pisolite_gravel_depth_mm": 38.0,
            "scarp_slope_angle_deg": 32.0,
            "saprolite_undercut_span_m": 2.9,
            "surface_rock_temp_c": 56.0,
            "convective_storm_proximity_km": 7.5,
        }
        post_resp = client.post("/api/laterite-duricrust/calculate", json=payload)
        assert post_resp.status_code == 200
        post_data = post_resp.json()
        assert post_data["risk_level"] in {"high", "critical"}
        assert post_data["pisolite_ball_bearing_slip_pct"] > 40.0

        get_resp = client.get("/api/laterite-duricrust/calculate", params=payload)
        assert get_resp.status_code == 200
        assert get_resp.json()["risk_level"] == post_data["risk_level"]

    def test_calculate_validation_error_returns_422(self) -> None:
        bad_payload = {
            "pisolite_gravel_depth_mm": 120.0,
            "scarp_slope_angle_deg": 24.0,
            "saprolite_undercut_span_m": 1.4,
            "surface_rock_temp_c": 48.0,
            "convective_storm_proximity_km": 18.0,
        }
        resp = client.post("/api/laterite-duricrust/calculate", json=bad_payload)
        assert resp.status_code == 422

    def test_checklist_and_gear_endpoints(self) -> None:
        chk = client.get("/api/laterite-duricrust/checklist")
        assert chk.status_code == 200
        assert chk.json()["total"] == 6
        assert len(chk.json()["checklist"]) == 6

        gear = client.get("/api/laterite-duricrust/gear")
        assert gear.status_code == 200
        assert gear.json()["total"] == 6
