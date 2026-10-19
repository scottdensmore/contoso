"""Unit tests for the Subantarctic Tussock-Grass Peat Bog & Katabatic Headland Navigation FastAPI router."""

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


class TestTussockHeadlandSitesEndpoints:
    """Tests for GET /api/tussock-headland/sites and GET /api/tussock-headland/sites/{site_id}."""

    def test_list_all_sites(self, client: TestClient) -> None:
        resp = client.get("/api/tussock-headland/sites")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 4
        ids = {s["id"] for s in data}
        assert "fortuna-bay-stromness-south-georgia" in ids
        assert "macquarie-island-featherbed-australia" in ids
        assert "enderby-island-megaherb-auckland-nz" in ids
        assert "kerguelen-courbet-azorella-france" in ids

    def test_list_sites_via_all_prefix_mounts(self, client: TestClient) -> None:
        for prefix in (
            "/tussock-headland",
            "/api/tussock-headland",
            "/api/v1/tussock-headland",
        ):
            resp = client.get(f"{prefix}/sites")
            assert resp.status_code == 200
            assert len(resp.json()) == 4

    def test_filter_sites_by_country(self, client: TestClient) -> None:
        resp = client.get("/api/tussock-headland/sites?country=Australia")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "macquarie-island-featherbed-australia"

    def test_filter_sites_by_morphology(self, client: TestClient) -> None:
        resp = client.get(
            "/api/tussock-headland/sites?morphology=chionochloa-megaherb-peat-terrace"
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "enderby-island-megaherb-auckland-nz"

    def test_filter_sites_by_difficulty(self, client: TestClient) -> None:
        resp = client.get("/api/tussock-headland/sites?difficulty=challenging")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2

    def test_filter_sites_by_search(self, client: TestClient) -> None:
        resp = client.get("/api/tussock-headland/sites?search=Kerguelen")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "kerguelen-courbet-azorella-france"

    def test_get_site_by_id_found(self, client: TestClient) -> None:
        resp = client.get("/api/tussock-headland/sites/fortuna-bay-stromness-south-georgia")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == "fortuna-bay-stromness-south-georgia"
        assert data["country"] == "United Kingdom"
        assert data["morphology"] == "poa-flabellata-pedestal-maze"

    def test_get_site_by_id_not_found(self, client: TestClient) -> None:
        resp = client.get("/api/tussock-headland/sites/nonexistent-tussock-site")
        assert resp.status_code == 404


class TestTussockHeadlandCalculateEndpoint:
    """Tests for POST /api/tussock-headland/calculate."""

    def test_calculate_valid_request(self, client: TestClient) -> None:
        resp = client.post(
            "/api/tussock-headland/calculate",
            json={
                "pedestal_height_m": 1.6,
                "katabatic_wind_kmh": 72.0,
                "wallow_trench_depth_cm": 65.0,
                "ambient_temp_c": 2.5,
                "seal_density_per_ha": 24.0,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "katabatic_knockdown_index" in data
        assert "inter_pedestal_pit_entrapment_pct" in data
        assert "wind_chill_effective_c" in data
        assert "fauna_encounter_detour_multiplier" in data
        assert data["risk_level"] in ("low", "moderate", "high", "critical")
        assert data["safety_status"] == data["risk_level"]
        assert data["routing_strategy"] in (
            "open-feldmark-compass-ridge-transit",
            "inter-pedestal-sounding-pole-channel-weave",
            "leeward-terrace-contour-fauna-detour",
            "abort-williwaw-bivy-and-wallow-lockout",
        )
        assert isinstance(data["warnings"], list)
        assert isinstance(data["recommendations"], list)

    def test_calculate_critical_williwaw_abort(self, client: TestClient) -> None:
        resp = client.post(
            "/api/tussock-headland/calculate",
            json={
                "pedestal_height_m": 2.7,
                "katabatic_wind_kmh": 145.0,
                "wallow_trench_depth_cm": 160.0,
                "ambient_temp_c": -9.0,
                "seal_density_per_ha": 100.0,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["risk_level"] == "critical"
        assert data["routing_strategy"] == "abort-williwaw-bivy-and-wallow-lockout"
        assert len(data["warnings"]) >= 2

    def test_calculate_invalid_pedestal_height_returns_422(self, client: TestClient) -> None:
        resp = client.post(
            "/api/tussock-headland/calculate",
            json={
                "pedestal_height_m": 4.5,
                "katabatic_wind_kmh": 60.0,
                "wallow_trench_depth_cm": 50.0,
                "ambient_temp_c": 3.0,
                "seal_density_per_ha": 18.0,
            },
        )
        assert resp.status_code == 422

    def test_calculate_invalid_katabatic_wind_returns_422(self, client: TestClient) -> None:
        resp = client.post(
            "/api/tussock-headland/calculate",
            json={
                "pedestal_height_m": 1.5,
                "katabatic_wind_kmh": 200.0,
                "wallow_trench_depth_cm": 50.0,
                "ambient_temp_c": 3.0,
                "seal_density_per_ha": 18.0,
            },
        )
        assert resp.status_code == 422


class TestTussockHeadlandChecklistEndpoints:
    """Tests for GET /api/tussock-headland/checklist and GET /api/tussock-headland/gear."""

    def test_get_checklist(self, client: TestClient) -> None:
        resp = client.get("/api/tussock-headland/checklist")
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
        resp = client.get("/api/tussock-headland/gear")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 6
