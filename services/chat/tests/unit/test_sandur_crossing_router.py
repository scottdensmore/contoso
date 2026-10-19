"""Unit tests for the Glacial Outwash Braided-River Sandur & Quicksand Silt-Bar Crossing FastAPI router."""

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


class TestSandurCrossingSitesEndpoints:
    """Tests for GET /api/sandur-crossing/sites and GET /api/sandur-crossing/sites/{site_id}."""

    def test_list_all_sites(self, client: TestClient) -> None:
        resp = client.get("/api/sandur-crossing/sites")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 4
        ids = {s["id"] for s in data}
        assert "skeidararsandur-krossa-iceland" in ids
        assert "slim-river-kaskawulsh-canada" in ids
        assert "rakaia-gorge-braids-nz" in ids
        assert "copper-river-sheridan-alaska-usa" in ids

    def test_list_sites_via_all_prefix_mounts(self, client: TestClient) -> None:
        for prefix in (
            "/sandur-crossing",
            "/api/sandur-crossing",
            "/api/v1/sandur-crossing",
        ):
            resp = client.get(f"{prefix}/sites")
            assert resp.status_code == 200
            assert len(resp.json()) == 4

    def test_filter_sites_by_country(self, client: TestClient) -> None:
        resp = client.get("/api/sandur-crossing/sites?country=Iceland")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "skeidararsandur-krossa-iceland"

    def test_filter_sites_by_morphology(self, client: TestClient) -> None:
        resp = client.get(
            "/api/sandur-crossing/sites?morphology=anastomosing-glacial-silt-braid"
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "slim-river-kaskawulsh-canada"

    def test_filter_sites_by_difficulty(self, client: TestClient) -> None:
        resp = client.get("/api/sandur-crossing/sites?difficulty=challenging")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2

    def test_filter_sites_by_search(self, client: TestClient) -> None:
        resp = client.get("/api/sandur-crossing/sites?search=Rakaia")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "rakaia-gorge-braids-nz"

    def test_get_site_by_id_found(self, client: TestClient) -> None:
        resp = client.get("/api/sandur-crossing/sites/copper-river-sheridan-alaska-usa")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == "copper-river-sheridan-alaska-usa"
        assert data["country"] == "United States"
        assert data["morphology"] == "tidal-estuarine-glacial-delta"

    def test_get_site_by_id_not_found(self, client: TestClient) -> None:
        resp = client.get("/api/sandur-crossing/sites/nonexistent-sandur-site")
        assert resp.status_code == 404


class TestSandurCrossingCalculateEndpoint:
    """Tests for POST /api/sandur-crossing/calculate."""

    def test_calculate_valid_request(self, client: TestClient) -> None:
        resp = client.post(
            "/api/sandur-crossing/calculate",
            json={
                "water_depth_m": 0.50,
                "flow_velocity_ms": 1.3,
                "hour_of_day_24": 8,
                "silt_flour_concentration_mg_l": 950.0,
                "hiker_mass_kg": 75.0,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "hydrodynamic_momentum_product" in data
        assert "quicksand_liquefaction_index" in data
        assert "diurnal_discharge_multiplier" in data
        assert "bedload_boulder_roll_risk_pct" in data
        assert data["risk_level"] in ("low", "moderate", "high", "critical")
        assert data["safety_status"] == data["risk_level"]
        assert data["crossing_technique"] in (
            "solo-diagonal-pole-riffle-stride",
            "tripod-pole-eddy-line-ferry",
            "mutual-support-linked-wedge-formation",
            "abort-bivouac-until-dawn-minimum",
        )
        assert isinstance(data["warnings"], list)
        assert isinstance(data["recommendations"], list)

    def test_calculate_critical_afternoon_surge_abort(self, client: TestClient) -> None:
        resp = client.post(
            "/api/sandur-crossing/calculate",
            json={
                "water_depth_m": 1.25,
                "flow_velocity_ms": 3.1,
                "hour_of_day_24": 16,
                "silt_flour_concentration_mg_l": 4100.0,
                "hiker_mass_kg": 68.0,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["risk_level"] == "critical"
        assert data["crossing_technique"] == "abort-bivouac-until-dawn-minimum"
        assert len(data["warnings"]) >= 2

    def test_calculate_invalid_water_depth_returns_422(self, client: TestClient) -> None:
        resp = client.post(
            "/api/sandur-crossing/calculate",
            json={
                "water_depth_m": 3.0,
                "flow_velocity_ms": 1.2,
                "hour_of_day_24": 7,
                "silt_flour_concentration_mg_l": 800.0,
                "hiker_mass_kg": 75.0,
            },
        )
        assert resp.status_code == 422

    def test_calculate_invalid_flow_velocity_returns_422(self, client: TestClient) -> None:
        resp = client.post(
            "/api/sandur-crossing/calculate",
            json={
                "water_depth_m": 0.5,
                "flow_velocity_ms": 0.01,
                "hour_of_day_24": 7,
                "silt_flour_concentration_mg_l": 800.0,
                "hiker_mass_kg": 75.0,
            },
        )
        assert resp.status_code == 422


class TestSandurCrossingChecklistEndpoints:
    """Tests for GET /api/sandur-crossing/checklist and GET /api/sandur-crossing/gear."""

    def test_get_checklist(self, client: TestClient) -> None:
        resp = client.get("/api/sandur-crossing/checklist")
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
        resp = client.get("/api/sandur-crossing/gear")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 6
