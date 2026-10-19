"""Unit tests for the Subterranean Glacière Cave Navigation FastAPI router."""

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


class TestGlaciereCavingSitesEndpoints:
    """Tests for GET /api/glaciere-caving/sites and GET /api/glaciere-caving/sites/{site_id}."""

    def test_list_all_sites(self, client: TestClient) -> None:
        resp = client.get("/api/glaciere-caving/sites")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 4
        ids = {s["id"] for s in data}
        assert "eisriesenwelt-tennengebirge-austria" in ids
        assert "scarisoara-glaciere-apuseni-romania" in ids
        assert "bandera-ice-cave-el-malpais-usa" in ids
        assert "lofthellir-lava-glaciere-iceland" in ids

    def test_list_sites_via_all_prefix_mounts(self, client: TestClient) -> None:
        for prefix in ("/glaciere-caving", "/api/glaciere-caving", "/api/v1/glaciere-caving"):
            resp = client.get(f"{prefix}/sites")
            assert resp.status_code == 200
            assert len(resp.json()) == 4

    def test_filter_sites_by_country(self, client: TestClient) -> None:
        resp = client.get("/api/glaciere-caving/sites?country=Austria")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "eisriesenwelt-tennengebirge-austria"

    def test_filter_sites_by_morphology(self, client: TestClient) -> None:
        resp = client.get("/api/glaciere-caving/sites?morphology=permafrost-fissure-glaciere")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "lofthellir-lava-glaciere-iceland"

    def test_filter_sites_by_difficulty(self, client: TestClient) -> None:
        resp = client.get("/api/glaciere-caving/sites?difficulty=challenging")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2

    def test_filter_sites_by_search(self, client: TestClient) -> None:
        resp = client.get("/api/glaciere-caving/sites?search=Bandera")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "bandera-ice-cave-el-malpais-usa"

    def test_get_site_by_id_found(self, client: TestClient) -> None:
        resp = client.get("/api/glaciere-caving/sites/scarisoara-glaciere-apuseni-romania")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == "scarisoara-glaciere-apuseni-romania"
        assert data["country"] == "Romania"
        assert data["morphology"] == "stratified-firn-plug-pit"

    def test_get_site_by_id_not_found(self, client: TestClient) -> None:
        resp = client.get("/api/glaciere-caving/sites/nonexistent-glaciere-cave")
        assert resp.status_code == 404


class TestGlaciereCavingCalculateEndpoint:
    """Tests for POST /api/glaciere-caving/calculate."""

    def test_calculate_valid_request(self, client: TestClient) -> None:
        resp = client.post(
            "/api/glaciere-caving/calculate",
            json={
                "floor_ice_slope_deg": 22.0,
                "cave_air_temp_c": -2.5,
                "meltwater_film_mm": 1.0,
                "co2_ppm": 950.0,
                "hoarfrost_ceiling_thickness_cm": 18.0,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "ice_friction_coefficient" in data
        assert "crampon_shear_safety_factor" in data
        assert "hoarfrost_detachment_risk_pct" in data
        assert "hypoxic_co2_index" in data
        assert data["risk_level"] in ("low", "moderate", "high", "critical")
        assert data["safety_status"] == data["risk_level"]
        assert data["traction_class"] in (
            "microspikes-10pt",
            "steel-12pt-crampons-ice-axe",
            "front-point-dual-tools-ice-screws",
            "abort-glaze-co2-collapse-hazard",
        )
        assert isinstance(data["warnings"], list)
        assert isinstance(data["recommendations"], list)

    def test_calculate_critical_glaze_and_co2_abort(self, client: TestClient) -> None:
        resp = client.post(
            "/api/glaciere-caving/calculate",
            json={
                "floor_ice_slope_deg": 48.0,
                "cave_air_temp_c": 2.0,
                "meltwater_film_mm": 9.0,
                "co2_ppm": 15000.0,
                "hoarfrost_ceiling_thickness_cm": 80.0,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["risk_level"] == "critical"
        assert data["traction_class"] == "abort-glaze-co2-collapse-hazard"
        assert len(data["warnings"]) >= 2

    def test_calculate_invalid_slope_returns_422(self, client: TestClient) -> None:
        resp = client.post(
            "/api/glaciere-caving/calculate",
            json={
                "floor_ice_slope_deg": 80.0,
                "cave_air_temp_c": -2.0,
                "meltwater_film_mm": 1.0,
                "co2_ppm": 800.0,
                "hoarfrost_ceiling_thickness_cm": 15.0,
            },
        )
        assert resp.status_code == 422

    def test_calculate_invalid_co2_returns_422(self, client: TestClient) -> None:
        resp = client.post(
            "/api/glaciere-caving/calculate",
            json={
                "floor_ice_slope_deg": 18.0,
                "cave_air_temp_c": -2.0,
                "meltwater_film_mm": 1.0,
                "co2_ppm": 100.0,
                "hoarfrost_ceiling_thickness_cm": 15.0,
            },
        )
        assert resp.status_code == 422


class TestGlaciereCavingChecklistEndpoints:
    """Tests for GET /api/glaciere-caving/checklist and GET /api/glaciere-caving/gear."""

    def test_get_checklist(self, client: TestClient) -> None:
        resp = client.get("/api/glaciere-caving/checklist")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 6
        for item in data:
            assert "item" in item
            assert "category" in item
            assert "priority" in item
            assert "rationale" in item

    def test_get_gear_alias(self, client: TestClient) -> None:
        resp = client.get("/api/glaciere-caving/gear")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 6
