"""Unit tests for the Karst Tiankeng (Giant Collapse Sinkhole) & Vertical Cloud-Forest Rim Descent FastAPI router."""

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


class TestTiankengDescentSitesEndpoints:
    """Tests for GET /api/tiankeng-descent/sites and GET /api/tiankeng-descent/sites/{site_id}."""

    def test_list_all_sites(self, client: TestClient) -> None:
        resp = client.get("/api/tiankeng-descent/sites")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 4
        ids = {s["id"] for s in data}
        assert "xiaozhai-tiankeng-chongqing-china" in ids
        assert "dashiwei-tiankeng-leye-china" in ids
        assert "sotano-de-las-golondrinas-mexico" in ids
        assert "sima-humboldt-sarisarinama-venezuela" in ids

    def test_list_sites_via_all_prefix_mounts(self, client: TestClient) -> None:
        for prefix in (
            "/tiankeng-descent",
            "/api/tiankeng-descent",
            "/api/v1/tiankeng-descent",
        ):
            resp = client.get(f"{prefix}/sites")
            assert resp.status_code == 200
            assert len(resp.json()) == 4

    def test_filter_sites_by_country(self, client: TestClient) -> None:
        resp = client.get("/api/tiankeng-descent/sites?country=Mexico")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "sotano-de-las-golondrinas-mexico"

    def test_filter_sites_by_morphology(self, client: TestClient) -> None:
        resp = client.get("/api/tiankeng-descent/sites?morphology=twin-window-karst-chasm")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "dashiwei-tiankeng-leye-china"

    def test_filter_sites_by_difficulty(self, client: TestClient) -> None:
        resp = client.get("/api/tiankeng-descent/sites?difficulty=extreme")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 3

    def test_filter_sites_by_search(self, client: TestClient) -> None:
        resp = client.get("/api/tiankeng-descent/sites?search=Sarisarinama")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "sima-humboldt-sarisarinama-venezuela"

    def test_get_site_by_id_found(self, client: TestClient) -> None:
        resp = client.get("/api/tiankeng-descent/sites/xiaozhai-tiankeng-chongqing-china")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == "xiaozhai-tiankeng-chongqing-china"
        assert data["country"] == "China"
        assert data["morphology"] == "collapse-mega-doline"

    def test_get_site_by_id_not_found(self, client: TestClient) -> None:
        resp = client.get("/api/tiankeng-descent/sites/nonexistent-tiankeng-site")
        assert resp.status_code == 404


class TestTiankengDescentCalculateEndpoint:
    """Tests for POST /api/tiankeng-descent/calculate."""

    def test_calculate_valid_request(self, client: TestClient) -> None:
        resp = client.post(
            "/api/tiankeng-descent/calculate",
            json={
                "vertical_drop_m": 320.0,
                "rebelay_count": 5,
                "fog_humidity_pct": 85.0,
                "overhang_angle_deg": -5.0,
                "waterfall_spray_litres_min": 35.0,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "wet_rope_friction_multiplier" in data
        assert "descender_thermal_c" in data
        assert "limestone_spall_trajectory_risk_pct" in data
        assert "free_hang_bounce_amplitude_m" in data
        assert data["risk_level"] in ("low", "moderate", "high", "critical")
        assert data["safety_status"] == data["risk_level"]
        assert data["rigging_strategy"] in (
            "continuous-free-hang-6-bar-rack",
            "segmented-rebelay-lip-deviation",
            "offset-pendulum-spray-avoidance-rig",
            "abort-monsoon-waterfall-plume-lockout",
        )
        assert isinstance(data["warnings"], list)
        assert isinstance(data["recommendations"], list)

    def test_calculate_critical_monsoon_waterfall_abort(self, client: TestClient) -> None:
        resp = client.post(
            "/api/tiankeng-descent/calculate",
            json={
                "vertical_drop_m": 620.0,
                "rebelay_count": 1,
                "fog_humidity_pct": 99.0,
                "overhang_angle_deg": 24.0,
                "waterfall_spray_litres_min": 420.0,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["risk_level"] == "critical"
        assert data["rigging_strategy"] == "abort-monsoon-waterfall-plume-lockout"
        assert len(data["warnings"]) >= 2

    def test_calculate_invalid_vertical_drop_returns_422(self, client: TestClient) -> None:
        resp = client.post(
            "/api/tiankeng-descent/calculate",
            json={
                "vertical_drop_m": 800.0,
                "rebelay_count": 4,
                "fog_humidity_pct": 85.0,
                "overhang_angle_deg": -5.0,
                "waterfall_spray_litres_min": 35.0,
            },
        )
        assert resp.status_code == 422

    def test_calculate_invalid_rebelay_count_returns_422(self, client: TestClient) -> None:
        resp = client.post(
            "/api/tiankeng-descent/calculate",
            json={
                "vertical_drop_m": 300.0,
                "rebelay_count": 25,
                "fog_humidity_pct": 85.0,
                "overhang_angle_deg": -5.0,
                "waterfall_spray_litres_min": 35.0,
            },
        )
        assert resp.status_code == 422


class TestTiankengDescentChecklistEndpoints:
    """Tests for GET /api/tiankeng-descent/checklist and GET /api/tiankeng-descent/gear."""

    def test_get_checklist(self, client: TestClient) -> None:
        resp = client.get("/api/tiankeng-descent/checklist")
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
        resp = client.get("/api/tiankeng-descent/gear")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 6
