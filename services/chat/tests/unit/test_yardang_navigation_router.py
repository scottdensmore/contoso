"""Unit tests for the Aeolian Yardang & Mega-Dune Slip-Face Star-Dune Desert Navigation FastAPI router."""

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


class TestYardangNavigationSitesEndpoints:
    """Tests for GET /api/yardang-navigation/sites and GET /api/yardang-navigation/sites/{site_id}."""

    def test_list_all_sites(self, client: TestClient) -> None:
        resp = client.get("/api/yardang-navigation/sites")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 4
        ids = {s["id"] for s in data}
        assert "dasht-e-lut-kaluts-iran" in ids
        assert "badain-jaran-star-dunes-china" in ids
        assert "lop-nur-yardang-xinjiang-china" in ids
        assert "borkou-ennedi-yardangs-chad" in ids

    def test_list_sites_via_all_prefix_mounts(self, client: TestClient) -> None:
        for prefix in (
            "/yardang-navigation",
            "/api/yardang-navigation",
            "/api/v1/yardang-navigation",
        ):
            resp = client.get(f"{prefix}/sites")
            assert resp.status_code == 200
            assert len(resp.json()) == 4

    def test_filter_sites_by_country(self, client: TestClient) -> None:
        resp = client.get("/api/yardang-navigation/sites?country=China")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2
        ids = {s["id"] for s in data}
        assert "badain-jaran-star-dunes-china" in ids
        assert "lop-nur-yardang-xinjiang-china" in ids

    def test_filter_sites_by_morphology(self, client: TestClient) -> None:
        resp = client.get("/api/yardang-navigation/sites?morphology=barchanoid-interdune-gassi")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "borkou-ennedi-yardangs-chad"

    def test_filter_sites_by_difficulty(self, client: TestClient) -> None:
        resp = client.get("/api/yardang-navigation/sites?difficulty=extreme")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2

    def test_filter_sites_by_search(self, client: TestClient) -> None:
        resp = client.get("/api/yardang-navigation/sites?search=Kalut")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "dasht-e-lut-kaluts-iran"

    def test_get_site_by_id_found(self, client: TestClient) -> None:
        resp = client.get("/api/yardang-navigation/sites/dasht-e-lut-kaluts-iran")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == "dasht-e-lut-kaluts-iran"
        assert data["country"] == "Iran"
        assert data["morphology"] == "kalut-mega-yardang-corridor"

    def test_get_site_by_id_not_found(self, client: TestClient) -> None:
        resp = client.get("/api/yardang-navigation/sites/nonexistent-yardang-site")
        assert resp.status_code == 404


class TestYardangNavigationCalculateEndpoint:
    """Tests for POST /api/yardang-navigation/calculate."""

    def test_calculate_valid_request(self, client: TestClient) -> None:
        resp = client.post(
            "/api/yardang-navigation/calculate",
            json={
                "slip_face_angle_deg": 32.0,
                "wind_speed_kmh": 48.0,
                "corridor_width_m": 24.0,
                "sand_surface_temp_c": 46.0,
                "visibility_m": 320.0,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "avalanche_slip_safety_factor" in data
        assert "venturi_wind_acceleration_ratio" in data
        assert "triboelectric_gnss_noise_index" in data
        assert "stride_sinkage_energy_multiplier" in data
        assert data["risk_level"] in ("low", "moderate", "high", "critical")
        assert data["safety_status"] == data["risk_level"]
        assert "routing_strategy" in data
        assert isinstance(data["warnings"], list)
        assert isinstance(data["recommendations"], list)

    def test_calculate_critical_haboob_grainflow_lockout(self, client: TestClient) -> None:
        resp = client.post(
            "/api/yardang-navigation/calculate",
            json={
                "slip_face_angle_deg": 39.0,
                "wind_speed_kmh": 112.0,
                "corridor_width_m": 5.0,
                "sand_surface_temp_c": 68.0,
                "visibility_m": 12.0,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["risk_level"] == "critical"
        assert len(data["warnings"]) >= 2

    def test_calculate_invalid_slip_face_angle_returns_422(self, client: TestClient) -> None:
        resp = client.post(
            "/api/yardang-navigation/calculate",
            json={
                "slip_face_angle_deg": 55.0,
                "wind_speed_kmh": 40.0,
                "corridor_width_m": 25.0,
                "sand_surface_temp_c": 42.0,
                "visibility_m": 400.0,
            },
        )
        assert resp.status_code == 422

    def test_calculate_invalid_corridor_width_returns_422(self, client: TestClient) -> None:
        resp = client.post(
            "/api/yardang-navigation/calculate",
            json={
                "slip_face_angle_deg": 32.0,
                "wind_speed_kmh": 40.0,
                "corridor_width_m": 0.5,
                "sand_surface_temp_c": 42.0,
                "visibility_m": 400.0,
            },
        )
        assert resp.status_code == 422


class TestYardangNavigationChecklistEndpoints:
    """Tests for GET /api/yardang-navigation/checklist and GET /api/yardang-navigation/gear."""

    def test_get_checklist(self, client: TestClient) -> None:
        resp = client.get("/api/yardang-navigation/checklist")
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
        resp = client.get("/api/yardang-navigation/gear")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 6
