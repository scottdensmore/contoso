"""Unit tests for the Tropical Tsingy (Pinnacle Karst Labyrinth) & Razor-Limestone Arête Scrambling FastAPI router."""

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


class TestTsingyLabyrinthSitesEndpoints:
    """Tests for GET /api/tsingy-labyrinth/sites and GET /api/tsingy-labyrinth/sites/{site_id}."""

    def test_list_all_sites(self, client: TestClient) -> None:
        resp = client.get("/api/tsingy-labyrinth/sites")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 4
        ids = {s["id"] for s in data}
        assert "bemaraha-grand-tsingy-madagascar" in ids
        assert "ankarana-tsingy-canyon-madagascar" in ids
        assert "mulu-api-pinnacles-borneo-malaysia" in ids
        assert "shilin-naigu-stone-forest-china" in ids

    def test_list_sites_via_all_prefix_mounts(self, client: TestClient) -> None:
        for prefix in (
            "/tsingy-labyrinth",
            "/api/tsingy-labyrinth",
            "/api/v1/tsingy-labyrinth",
        ):
            resp = client.get(f"{prefix}/sites")
            assert resp.status_code == 200
            assert len(resp.json()) == 4

    def test_filter_sites_by_country(self, client: TestClient) -> None:
        resp = client.get("/api/tsingy-labyrinth/sites?country=Madagascar")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2
        ids = {s["id"] for s in data}
        assert "bemaraha-grand-tsingy-madagascar" in ids
        assert "ankarana-tsingy-canyon-madagascar" in ids

    def test_filter_sites_by_morphology(self, client: TestClient) -> None:
        resp = client.get(
            "/api/tsingy-labyrinth/sites?morphology=stone-forest-shilin-pinnacles"
        )
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "shilin-naigu-stone-forest-china"

    def test_filter_sites_by_difficulty(self, client: TestClient) -> None:
        resp = client.get("/api/tsingy-labyrinth/sites?difficulty=extreme")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2

    def test_filter_sites_by_search(self, client: TestClient) -> None:
        resp = client.get("/api/tsingy-labyrinth/sites?search=Ankarana")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "ankarana-tsingy-canyon-madagascar"

    def test_get_site_by_id_found(self, client: TestClient) -> None:
        resp = client.get("/api/tsingy-labyrinth/sites/bemaraha-grand-tsingy-madagascar")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == "bemaraha-grand-tsingy-madagascar"
        assert data["country"] == "Madagascar"
        assert data["morphology"] == "rillenkarren-razor-spires"

    def test_get_site_by_id_not_found(self, client: TestClient) -> None:
        resp = client.get("/api/tsingy-labyrinth/sites/nonexistent-tsingy-site")
        assert resp.status_code == 404


class TestTsingyLabyrinthCalculateEndpoint:
    """Tests for POST /api/tsingy-labyrinth/calculate."""

    def test_calculate_valid_request(self, client: TestClient) -> None:
        resp = client.post(
            "/api/tsingy-labyrinth/calculate",
            json={
                "blade_edge_radius_mm": 1.2,
                "spire_height_m": 45.0,
                "rock_surface_temp_c": 46.0,
                "diaclase_gap_width_m": 1.5,
                "ambient_humidity_pct": 68.0,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "laceration_shear_index" in data
        assert "cord_cut_through_risk_pct" in data
        assert "radiant_sweat_loss_litres_hr" in data
        assert "arete_exposure_factor" in data
        assert data["risk_level"] in ("low", "moderate", "high", "critical")
        assert data["safety_status"] == data["risk_level"]
        assert data["scrambling_class"] in (
            "class-2-corridor-stone-forest-walk",
            "class-3-gloved-diaclase-stemming",
            "class-4-twin-lanyard-arete-via-ferrata",
            "class-5-abort-razor-spire-thermal-lockout",
        )
        assert isinstance(data["warnings"], list)
        assert isinstance(data["recommendations"], list)

    def test_calculate_critical_razor_spire_thermal_lockout(self, client: TestClient) -> None:
        resp = client.post(
            "/api/tsingy-labyrinth/calculate",
            json={
                "blade_edge_radius_mm": 0.3,
                "spire_height_m": 105.0,
                "rock_surface_temp_c": 63.0,
                "diaclase_gap_width_m": 5.8,
                "ambient_humidity_pct": 94.0,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["risk_level"] == "critical"
        assert data["scrambling_class"] == "class-5-abort-razor-spire-thermal-lockout"
        assert len(data["warnings"]) >= 2

    def test_calculate_invalid_blade_edge_radius_returns_422(self, client: TestClient) -> None:
        resp = client.post(
            "/api/tsingy-labyrinth/calculate",
            json={
                "blade_edge_radius_mm": 22.0,
                "spire_height_m": 40.0,
                "rock_surface_temp_c": 42.0,
                "diaclase_gap_width_m": 1.4,
                "ambient_humidity_pct": 65.0,
            },
        )
        assert resp.status_code == 422

    def test_calculate_invalid_spire_height_returns_422(self, client: TestClient) -> None:
        resp = client.post(
            "/api/tsingy-labyrinth/calculate",
            json={
                "blade_edge_radius_mm": 1.5,
                "spire_height_m": 180.0,
                "rock_surface_temp_c": 42.0,
                "diaclase_gap_width_m": 1.4,
                "ambient_humidity_pct": 65.0,
            },
        )
        assert resp.status_code == 422


class TestTsingyLabyrinthChecklistEndpoints:
    """Tests for GET /api/tsingy-labyrinth/checklist and GET /api/tsingy-labyrinth/gear."""

    def test_get_checklist(self, client: TestClient) -> None:
        resp = client.get("/api/tsingy-labyrinth/checklist")
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
        resp = client.get("/api/tsingy-labyrinth/gear")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 6
