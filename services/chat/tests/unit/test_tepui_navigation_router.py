"""Unit tests for the Table-Mountain Quartzite Tepui & High-Plateau Sandstone Fissure Navigation FastAPI router."""

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


class TestTepuiNavigationSitesEndpoints:
    """Tests for GET /api/tepui-navigation/sites and GET /api/tepui-navigation/sites/{site_id}."""

    def test_list_all_sites(self, client: TestClient) -> None:
        resp = client.get("/api/tepui-navigation/sites")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 4
        ids = {s["id"] for s in data}
        assert "mount-roraima-maverick-plateau" in ids
        assert "auyan-tepui-churun-rim-venezuela" in ids
        assert "kukenan-matawi-tepui-venezuela" in ids
        assert "chiribiquete-tepui-mesas-colombia" in ids

    def test_list_sites_via_all_prefix_mounts(self, client: TestClient) -> None:
        for prefix in (
            "/tepui-navigation",
            "/api/tepui-navigation",
            "/api/v1/tepui-navigation",
        ):
            resp = client.get(f"{prefix}/sites")
            assert resp.status_code == 200
            assert len(resp.json()) == 4

    def test_filter_sites_by_country(self, client: TestClient) -> None:
        resp = client.get("/api/tepui-navigation/sites?country=Venezuela")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 3
        ids = {s["id"] for s in data}
        assert "mount-roraima-maverick-plateau" in ids
        assert "auyan-tepui-churun-rim-venezuela" in ids
        assert "kukenan-matawi-tepui-venezuela" in ids

    def test_filter_sites_by_morphology(self, client: TestClient) -> None:
        resp = client.get(
            "/api/tepui-navigation/sites?morphology=proterozoic-escarpment-ramp"
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "chiribiquete-tepui-mesas-colombia"

    def test_filter_sites_by_difficulty(self, client: TestClient) -> None:
        resp = client.get("/api/tepui-navigation/sites?difficulty=extreme")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2

    def test_filter_sites_by_search(self, client: TestClient) -> None:
        resp = client.get("/api/tepui-navigation/sites?search=Roraima")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "mount-roraima-maverick-plateau"

    def test_get_site_by_id_found(self, client: TestClient) -> None:
        resp = client.get(
            "/api/tepui-navigation/sites/mount-roraima-maverick-plateau"
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == "mount-roraima-maverick-plateau"
        assert data["country"] == "Venezuela"
        assert data["morphology"] == "pseudokarst-fissure-grid"

    def test_get_site_by_id_not_found(self, client: TestClient) -> None:
        resp = client.get("/api/tepui-navigation/sites/nonexistent-tepui-site")
        assert resp.status_code == 404


class TestTepuiNavigationCalculateEndpoint:
    """Tests for POST /api/tepui-navigation/calculate."""

    def test_calculate_valid_request(self, client: TestClient) -> None:
        resp = client.post(
            "/api/tepui-navigation/calculate",
            json={
                "cyanobacteria_biofilm_pct": 68.0,
                "fissure_gap_width_m": 1.6,
                "orographic_rain_mm_hr": 28.0,
                "cloud_visibility_m": 35.0,
                "slab_slope_deg": 14.0,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "biofilm_traction_coefficient" in data
        assert "fissure_bridge_collapse_risk_pct" in data
        assert "orographic_blackout_index" in data
        assert "blackwater_stream_surge_multiplier" in data
        assert data["risk_level"] in ("low", "moderate", "high", "critical")
        assert data["safety_status"] == data["risk_level"]
        assert data["progression_protocol"] in (
            "protocol-1-cairn-corridor-walk",
            "protocol-2-probed-fissure-belay",
            "protocol-3-rope-bridged-chasm-traverse",
            "protocol-4-emergency-overhang-bivouac-lockout",
        )
        assert isinstance(data["warnings"], list)
        assert isinstance(data["recommendations"], list)

    def test_calculate_critical_emergency_overhang_bivouac_lockout(
        self, client: TestClient
    ) -> None:
        resp = client.post(
            "/api/tepui-navigation/calculate",
            json={
                "cyanobacteria_biofilm_pct": 95.0,
                "fissure_gap_width_m": 4.8,
                "orographic_rain_mm_hr": 78.0,
                "cloud_visibility_m": 6.0,
                "slab_slope_deg": 36.0,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["risk_level"] == "critical"
        assert (
            data["progression_protocol"]
            == "protocol-4-emergency-overhang-bivouac-lockout"
        )
        assert len(data["warnings"]) >= 2

    def test_calculate_invalid_biofilm_pct_returns_422(
        self, client: TestClient
    ) -> None:
        resp = client.post(
            "/api/tepui-navigation/calculate",
            json={
                "cyanobacteria_biofilm_pct": 120.0,
                "fissure_gap_width_m": 1.6,
                "orographic_rain_mm_hr": 25.0,
                "cloud_visibility_m": 45.0,
                "slab_slope_deg": 14.0,
            },
        )
        assert resp.status_code == 422

    def test_calculate_invalid_fissure_gap_width_returns_422(
        self, client: TestClient
    ) -> None:
        resp = client.post(
            "/api/tepui-navigation/calculate",
            json={
                "cyanobacteria_biofilm_pct": 65.0,
                "fissure_gap_width_m": 9.5,
                "orographic_rain_mm_hr": 25.0,
                "cloud_visibility_m": 45.0,
                "slab_slope_deg": 14.0,
            },
        )
        assert resp.status_code == 422


class TestTepuiNavigationChecklistEndpoints:
    """Tests for GET /api/tepui-navigation/checklist and GET /api/tepui-navigation/gear."""

    def test_get_checklist(self, client: TestClient) -> None:
        resp = client.get("/api/tepui-navigation/checklist")
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
        resp = client.get("/api/tepui-navigation/gear")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 6
