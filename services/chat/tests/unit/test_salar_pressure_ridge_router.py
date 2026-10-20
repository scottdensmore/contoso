"""Unit tests for the High-Altitude Salar Pressure-Ridge FastAPI router endpoints."""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestSalarPressureRidgeRouter:
    """Tests for /salar-pressure-ridge, /api/salar-pressure-ridge, and /api/v1/salar-pressure-ridge endpoints."""

    def test_list_all_sites(self) -> None:
        resp = client.get("/api/v1/salar-pressure-ridge/sites")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 4
        assert len(data["sites"]) == 4
        assert len(data["gear_checklist"]) == 6

    def test_filter_sites_by_country_morphology_and_search(self) -> None:
        resp = client.get("/api/v1/salar-pressure-ridge/sites", params={"country": "Chile"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 1
        assert data["sites"][0]["id"] == "atacama-soncor-cordillera-sal-chile"

        resp_morph = client.get(
            "/api/v1/salar-pressure-ridge/sites",
            params={"morphology": "polygonal-halite-pressure-crust"},
        )
        assert resp_morph.status_code == 200
        morph_data = resp_morph.json()
        assert morph_data["total"] == 1
        assert morph_data["sites"][0]["id"] == "arizaro-cono-arita-puna-argentina"

        resp_search = client.get(
            "/api/v1/salar-pressure-ridge/sites",
            params={"search": "Chalviri"},
        )
        assert resp_search.status_code == 200
        search_data = resp_search.json()
        assert search_data["total"] == 1
        assert search_data["sites"][0]["id"] == "chalviri-termas-polques-bolivia"

    def test_get_site_by_id_found_and_not_found(self) -> None:
        resp = client.get("/api/v1/salar-pressure-ridge/sites/uyuni-incahuasi-ojos-bolivia")
        assert resp.status_code == 200
        data = resp.json()
        assert data["site"]["id"] == "uyuni-incahuasi-ojos-bolivia"
        assert data["site"]["country"] == "Bolivia"
        assert "baseline_calculation" in data
        assert len(data["gear_checklist"]) == 6

        resp_404 = client.get("/api/v1/salar-pressure-ridge/sites/unknown-salar-ridge")
        assert resp_404.status_code == 404

    def test_calculate_post_and_get(self) -> None:
        payload = {
            "crust_thickness_cm": 16.0,
            "brine_eye_proximity_m": 8.0,
            "ridge_relief_cm": 58.0,
            "solar_uv_index": 17.0,
            "packsled_load_kg": 60.0,
            "site_id": "uyuni-incahuasi-ojos-bolivia",
        }
        post_resp = client.post("/api/v1/salar-pressure-ridge/calculate", json=payload)
        assert post_resp.status_code == 200
        post_data = post_resp.json()
        assert post_data["calculation"]["crust_thickness_cm"] == 16.0
        assert post_data["site"]["id"] == "uyuni-incahuasi-ojos-bolivia"
        assert len(post_data["gear_checklist"]) == 6

        get_resp = client.get(
            "/api/v1/salar-pressure-ridge/calculate",
            params={
                "crust_thickness_cm": 16.0,
                "brine_eye_proximity_m": 8.0,
                "ridge_relief_cm": 58.0,
                "solar_uv_index": 17.0,
                "packsled_load_kg": 60.0,
                "site_id": "uyuni-incahuasi-ojos-bolivia",
            },
        )
        assert get_resp.status_code == 200
        get_data = get_resp.json()
        assert (
            get_data["calculation"]["crust_punch_through_probability_pct"]
            == post_data["calculation"]["crust_punch_through_probability_pct"]
        )

    def test_calculate_validation_error_returns_422(self) -> None:
        bad_payload = {
            "crust_thickness_cm": 200.0,
            "brine_eye_proximity_m": 25.0,
            "ridge_relief_cm": 32.0,
            "solar_uv_index": 14.0,
            "packsled_load_kg": 45.0,
        }
        resp = client.post("/api/v1/salar-pressure-ridge/calculate", json=bad_payload)
        assert resp.status_code == 422

    def test_checklist_and_gear_endpoints(self) -> None:
        for path in ["/api/v1/salar-pressure-ridge/checklist", "/api/v1/salar-pressure-ridge/gear"]:
            resp = client.get(path)
            assert resp.status_code == 200
            data = resp.json()
            assert data["total"] == 6
            assert len(data["gear_checklist"]) == 6

    def test_all_three_prefix_mounts(self) -> None:
        for prefix in [
            "/salar-pressure-ridge",
            "/api/salar-pressure-ridge",
            "/api/v1/salar-pressure-ridge",
        ]:
            r = client.get(f"{prefix}/sites")
            assert r.status_code == 200
            assert r.json()["total"] == 4
