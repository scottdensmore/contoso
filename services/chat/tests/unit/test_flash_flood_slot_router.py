"""Unit tests for the High-Desert Slot-Canyon Ephemeral Flash-Flood Hydrograph & Escape-Ledge FastAPI router."""

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


class TestFlashFloodSlotSitesEndpoints:
    """Tests for GET /api/flash-flood-slot/sites and GET /api/flash-flood-slot/sites/{site_id}."""

    def test_list_all_sites(self, client: TestClient) -> None:
        resp = client.get("/api/flash-flood-slot/sites")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 4
        ids = {s["id"] for s in data}
        assert "buckskin-gulch-paria-usa" in ids
        assert "little-wild-horse-bell-usa" in ids
        assert "wadi-mujib-siq-jordan" in ids
        assert "garganta-del-cares-wadi-oman" in ids

    def test_list_sites_via_all_prefix_mounts(self, client: TestClient) -> None:
        for prefix in (
            "/flash-flood-slot",
            "/api/flash-flood-slot",
            "/api/v1/flash-flood-slot",
        ):
            resp = client.get(f"{prefix}/sites")
            assert resp.status_code == 200
            assert len(resp.json()) == 4

    def test_filter_sites_by_country(self, client: TestClient) -> None:
        resp = client.get("/api/flash-flood-slot/sites?country=Oman")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "garganta-del-cares-wadi-oman"

    def test_filter_sites_by_lithology(self, client: TestClient) -> None:
        resp = client.get("/api/flash-flood-slot/sites?lithology=navajo-sandstone-narrows")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "buckskin-gulch-paria-usa"

    def test_filter_sites_by_difficulty(self, client: TestClient) -> None:
        resp = client.get("/api/flash-flood-slot/sites?difficulty=challenging")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2

    def test_filter_sites_by_search(self, client: TestClient) -> None:
        resp = client.get("/api/flash-flood-slot/sites?search=Mujib")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "wadi-mujib-siq-jordan"

    def test_get_site_by_id_found(self, client: TestClient) -> None:
        resp = client.get("/api/flash-flood-slot/sites/little-wild-horse-bell-usa")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == "little-wild-horse-bell-usa"
        assert data["country"] == "United States"
        assert data["lithology"] == "wingate-vertical-fissure"

    def test_get_site_by_id_not_found(self, client: TestClient) -> None:
        resp = client.get("/api/flash-flood-slot/sites/nonexistent-slot-canyon")
        assert resp.status_code == 404


class TestFlashFloodSlotCalculateEndpoint:
    """Tests for POST /api/flash-flood-slot/calculate."""

    def test_calculate_valid_request(self, client: TestClient) -> None:
        resp = client.post(
            "/api/flash-flood-slot/calculate",
            json={
                "catchment_area_km2": 140.0,
                "upstream_rain_mm_hr": 22.0,
                "slot_width_m": 2.4,
                "escape_ledge_height_m": 4.5,
                "distance_to_exit_km": 2.2,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "flood_wave_lag_minutes" in data
        assert "wall_of_water_rise_rate_m_per_min" in data
        assert "peak_discharge_m3_s" in data
        assert "escape_margin_minutes" in data
        assert data["risk_level"] in ("low", "moderate", "high", "critical")
        assert data["safety_status"] == data["risk_level"]
        assert data["escape_class"] in (
            "dry-wash-standard-transit",
            "monitor-high-bench-ledges",
            "immediate-climb-escape-ledge",
            "abort-imminent-flood-bore-entrapment",
        )
        assert isinstance(data["warnings"], list)
        assert isinstance(data["recommendations"], list)

    def test_calculate_critical_flood_bore_abort(self, client: TestClient) -> None:
        resp = client.post(
            "/api/flash-flood-slot/calculate",
            json={
                "catchment_area_km2": 950.0,
                "upstream_rain_mm_hr": 75.0,
                "slot_width_m": 0.9,
                "escape_ledge_height_m": 16.0,
                "distance_to_exit_km": 9.0,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["risk_level"] == "critical"
        assert data["escape_class"] == "abort-imminent-flood-bore-entrapment"
        assert len(data["warnings"]) >= 2

    def test_calculate_invalid_catchment_area_returns_422(self, client: TestClient) -> None:
        resp = client.post(
            "/api/flash-flood-slot/calculate",
            json={
                "catchment_area_km2": 2000.0,
                "upstream_rain_mm_hr": 20.0,
                "slot_width_m": 2.5,
                "escape_ledge_height_m": 4.0,
                "distance_to_exit_km": 2.5,
            },
        )
        assert resp.status_code == 422

    def test_calculate_invalid_slot_width_returns_422(self, client: TestClient) -> None:
        resp = client.post(
            "/api/flash-flood-slot/calculate",
            json={
                "catchment_area_km2": 100.0,
                "upstream_rain_mm_hr": 20.0,
                "slot_width_m": 0.1,
                "escape_ledge_height_m": 4.0,
                "distance_to_exit_km": 2.5,
            },
        )
        assert resp.status_code == 422


class TestFlashFloodSlotChecklistEndpoints:
    """Tests for GET /api/flash-flood-slot/checklist and GET /api/flash-flood-slot/gear."""

    def test_get_checklist(self, client: TestClient) -> None:
        resp = client.get("/api/flash-flood-slot/checklist")
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
        resp = client.get("/api/flash-flood-slot/gear")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 6
