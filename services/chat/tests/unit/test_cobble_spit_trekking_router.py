"""Unit tests for the Coastal Kelp-Wrack Boulder Reef & Intertidal Cobble Spit Trekking FastAPI router."""

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


class TestCobbleSpitTrekkingSitesEndpoints:
    """Tests for GET /api/cobble-spit-trekking/sites and GET /api/cobble-spit-trekking/sites/{site_id}."""

    def test_list_all_sites(self, client: TestClient) -> None:
        resp = client.get("/api/cobble-spit-trekking/sites")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 4
        ids = {s["id"] for s in data}
        assert "dungeness-spit-olympic-usa" in ids
        assert "chesil-beach-fleet-uk" in ids
        assert "west-coast-trail-boulder-reef-canada" in ids
        assert "farewell-spit-boulder-bank-nz" in ids

    def test_list_sites_via_all_prefix_mounts(self, client: TestClient) -> None:
        for prefix in (
            "/cobble-spit-trekking",
            "/api/cobble-spit-trekking",
            "/api/v1/cobble-spit-trekking",
        ):
            resp = client.get(f"{prefix}/sites")
            assert resp.status_code == 200
            assert len(resp.json()) == 4

    def test_filter_sites_by_country(self, client: TestClient) -> None:
        resp = client.get("/api/cobble-spit-trekking/sites?country=Canada")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "west-coast-trail-boulder-reef-canada"

    def test_filter_sites_by_morphology(self, client: TestClient) -> None:
        resp = client.get("/api/cobble-spit-trekking/sites?morphology=storm-berm-cobble-bar")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "chesil-beach-fleet-uk"

    def test_filter_sites_by_difficulty(self, client: TestClient) -> None:
        resp = client.get("/api/cobble-spit-trekking/sites?difficulty=challenging")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2

    def test_filter_sites_by_search(self, client: TestClient) -> None:
        resp = client.get("/api/cobble-spit-trekking/sites?search=Dungeness")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "dungeness-spit-olympic-usa"

    def test_get_site_by_id_found(self, client: TestClient) -> None:
        resp = client.get("/api/cobble-spit-trekking/sites/farewell-spit-boulder-bank-nz")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == "farewell-spit-boulder-bank-nz"
        assert data["country"] == "New Zealand"
        assert data["morphology"] == "glacio-fluvial-tombolo"

    def test_get_site_by_id_not_found(self, client: TestClient) -> None:
        resp = client.get("/api/cobble-spit-trekking/sites/nonexistent-cobble-spit")
        assert resp.status_code == 404


class TestCobbleSpitTrekkingCalculateEndpoint:
    """Tests for POST /api/cobble-spit-trekking/calculate."""

    def test_calculate_valid_request(self, client: TestClient) -> None:
        resp = client.post(
            "/api/cobble-spit-trekking/calculate",
            json={
                "median_cobble_diameter_mm": 120.0,
                "kelp_wrack_depth_cm": 20.0,
                "berm_slope_deg": 14.0,
                "swell_height_m": 1.5,
                "pack_load_kg": 15.0,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "mucilage_slip_coefficient" in data
        assert "ankle_roll_torque_index" in data
        assert "swash_runup_cutoff_minutes" in data
        assert "effective_pace_km_h" in data
        assert data["risk_level"] in ("low", "moderate", "high", "critical")
        assert data["safety_status"] == data["risk_level"]
        assert data["footwear_class"] in (
            "trail-runner-trekking-poles",
            "high-cuff-scree-boot-dual-poles",
            "tungsten-studded-felt-boot-wading-staff",
            "abort-swash-overwash-entrapment",
        )
        assert isinstance(data["warnings"], list)
        assert isinstance(data["recommendations"], list)

    def test_calculate_critical_swash_overwash_abort(self, client: TestClient) -> None:
        resp = client.post(
            "/api/cobble-spit-trekking/calculate",
            json={
                "median_cobble_diameter_mm": 480.0,
                "kelp_wrack_depth_cm": 110.0,
                "berm_slope_deg": 34.0,
                "swell_height_m": 5.5,
                "pack_load_kg": 35.0,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["risk_level"] == "critical"
        assert data["footwear_class"] == "abort-swash-overwash-entrapment"
        assert len(data["warnings"]) >= 2

    def test_calculate_invalid_cobble_diameter_returns_422(self, client: TestClient) -> None:
        resp = client.post(
            "/api/cobble-spit-trekking/calculate",
            json={
                "median_cobble_diameter_mm": 750.0,
                "kelp_wrack_depth_cm": 20.0,
                "berm_slope_deg": 12.0,
                "swell_height_m": 1.2,
                "pack_load_kg": 14.0,
            },
        )
        assert resp.status_code == 422

    def test_calculate_invalid_swell_height_returns_422(self, client: TestClient) -> None:
        resp = client.post(
            "/api/cobble-spit-trekking/calculate",
            json={
                "median_cobble_diameter_mm": 100.0,
                "kelp_wrack_depth_cm": 20.0,
                "berm_slope_deg": 12.0,
                "swell_height_m": 12.0,
                "pack_load_kg": 14.0,
            },
        )
        assert resp.status_code == 422


class TestCobbleSpitTrekkingChecklistEndpoints:
    """Tests for GET /api/cobble-spit-trekking/checklist and GET /api/cobble-spit-trekking/gear."""

    def test_get_checklist(self, client: TestClient) -> None:
        resp = client.get("/api/cobble-spit-trekking/checklist")
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
        resp = client.get("/api/cobble-spit-trekking/gear")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 6
