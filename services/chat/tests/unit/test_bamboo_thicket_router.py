"""Unit tests for the Montane Bamboo-Thicket FastAPI router endpoints."""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestBambooThicketRouter:
    """Tests for /bamboo-thicket, /api/bamboo-thicket, and /api/v1/bamboo-thicket endpoints."""

    def test_list_all_sites(self) -> None:
        resp = client.get("/api/v1/bamboo-thicket/sites")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 4
        assert len(data["sites"]) == 4
        assert len(data["gear_checklist"]) == 6

    def test_filter_sites_by_country_ecotype_and_search(self) -> None:
        resp = client.get("/api/v1/bamboo-thicket/sites", params={"country": "Japan"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 1
        assert data["sites"][0]["id"] == "hidaka-sasa-kurilensis-hokkaido-japan"

        resp_eco = client.get(
            "/api/v1/bamboo-thicket/sites",
            params={"ecotype": "yushania-alpina-montane-belt"},
        )
        assert resp_eco.status_code == 200
        eco_data = resp_eco.json()
        assert eco_data["total"] == 1
        assert eco_data["sites"][0]["id"] == "rwenzori-virunga-yushania-uganda"

        resp_search = client.get(
            "/api/v1/bamboo-thicket/sites",
            params={"search": "Vilcabamba"},
        )
        assert resp_search.status_code == 200
        search_data = resp_search.json()
        assert search_data["total"] == 1
        assert search_data["sites"][0]["id"] == "vilcabamba-colani-chusquea-peru"

    def test_get_site_by_id_found_and_not_found(self) -> None:
        resp = client.get("/api/v1/bamboo-thicket/sites/chirripo-talamanca-chusquea-costa-rica")
        assert resp.status_code == 200
        data = resp.json()
        assert data["site"]["id"] == "chirripo-talamanca-chusquea-costa-rica"
        assert data["site"]["country"] == "Costa Rica"
        assert "baseline_calculation" in data
        assert len(data["gear_checklist"]) == 6

        resp_404 = client.get("/api/v1/bamboo-thicket/sites/unknown-bamboo-ridge")
        assert resp_404.status_code == 404

    def test_calculate_post_and_get(self) -> None:
        payload = {
            "culm_density_per_sq_m": 68.0,
            "culm_diameter_mm": 26.0,
            "ridge_slope_deg": 32.0,
            "wetness_film_pct": 82.0,
            "follower_spacing_m": 3.0,
            "site_id": "chirripo-talamanca-chusquea-costa-rica",
        }
        post_resp = client.post("/api/v1/bamboo-thicket/calculate", json=payload)
        assert post_resp.status_code == 200
        post_data = post_resp.json()
        assert post_data["calculation"]["culm_density_per_sq_m"] == 68.0
        assert post_data["site"]["id"] == "chirripo-talamanca-chusquea-costa-rica"
        assert len(post_data["gear_checklist"]) == 6

        get_resp = client.get(
            "/api/v1/bamboo-thicket/calculate",
            params={
                "culm_density_per_sq_m": 68.0,
                "culm_diameter_mm": 26.0,
                "ridge_slope_deg": 32.0,
                "wetness_film_pct": 82.0,
                "follower_spacing_m": 3.0,
                "site_id": "chirripo-talamanca-chusquea-costa-rica",
            },
        )
        assert get_resp.status_code == 200
        get_data = get_resp.json()
        assert (
            get_data["calculation"]["rebound_whip_kinetic_j"]
            == post_data["calculation"]["rebound_whip_kinetic_j"]
        )

    def test_calculate_validation_error_returns_422(self) -> None:
        bad_payload = {
            "culm_density_per_sq_m": 150.0,
            "culm_diameter_mm": 22.0,
            "ridge_slope_deg": 28.0,
            "wetness_film_pct": 70.0,
            "follower_spacing_m": 3.5,
        }
        resp = client.post("/api/v1/bamboo-thicket/calculate", json=bad_payload)
        assert resp.status_code == 422

    def test_checklist_and_gear_endpoints(self) -> None:
        for path in ["/api/v1/bamboo-thicket/checklist", "/api/v1/bamboo-thicket/gear"]:
            resp = client.get(path)
            assert resp.status_code == 200
            data = resp.json()
            assert data["total"] == 6
            assert len(data["gear_checklist"]) == 6

    def test_all_three_prefix_mounts(self) -> None:
        for prefix in [
            "/bamboo-thicket",
            "/api/bamboo-thicket",
            "/api/v1/bamboo-thicket",
        ]:
            r = client.get(f"{prefix}/sites")
            assert r.status_code == 200
            assert r.json()["total"] == 4
