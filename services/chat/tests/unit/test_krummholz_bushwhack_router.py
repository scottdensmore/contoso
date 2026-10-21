"""Unit tests for the Subalpine Krummholz & Wind-Sculpted Dwarf-Conifer Thicket Bushwhacking FastAPI router."""

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


class TestKrummholzBushwhackSitesEndpoints:
    """Tests for GET /api/krummholz-bushwhack/sites and GET /api/krummholz-bushwhack/sites/{site_id}."""

    def test_list_all_sites(self, client: TestClient) -> None:
        resp = client.get("/api/krummholz-bushwhack/sites")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 4
        ids = {s["id"] for s in data}
        assert "presidential-krummholz-whitemtns-usa" in ids
        assert "karwendel-latschenkiefer-tyrol-austria" in ids
        assert "garibaldi-slide-alder-subalpine-canada" in ids
        assert "tateyama-hai-matsu-alps-japan" in ids

    def test_list_sites_via_all_prefix_mounts(self, client: TestClient) -> None:
        for prefix in (
            "/krummholz-bushwhack",
            "/api/krummholz-bushwhack",
            "/api/v1/krummholz-bushwhack",
        ):
            resp = client.get(f"{prefix}/sites")
            assert resp.status_code == 200
            assert len(resp.json()) == 4

    def test_filter_sites_by_country(self, client: TestClient) -> None:
        resp = client.get("/api/krummholz-bushwhack/sites?country=Austria")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "karwendel-latschenkiefer-tyrol-austria"

    def test_filter_sites_by_ecotype(self, client: TestClient) -> None:
        resp = client.get("/api/krummholz-bushwhack/sites?ecotype=balsam-fir-spruce-mat")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "presidential-krummholz-whitemtns-usa"

    def test_filter_sites_by_difficulty(self, client: TestClient) -> None:
        resp = client.get("/api/krummholz-bushwhack/sites?difficulty=challenging")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 2

    def test_filter_sites_by_search(self, client: TestClient) -> None:
        resp = client.get("/api/krummholz-bushwhack/sites?search=Tateyama")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["id"] == "tateyama-hai-matsu-alps-japan"

    def test_get_site_by_id_found(self, client: TestClient) -> None:
        resp = client.get("/api/krummholz-bushwhack/sites/garibaldi-slide-alder-subalpine-canada")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == "garibaldi-slide-alder-subalpine-canada"
        assert data["country"] == "Canada"
        assert data["ecotype"] == "subalpine-larch-alder-thicket"

    def test_get_site_by_id_not_found(self, client: TestClient) -> None:
        resp = client.get("/api/krummholz-bushwhack/sites/nonexistent-krummholz-site")
        assert resp.status_code == 404


class TestKrummholzBushwhackCalculateEndpoint:
    """Tests for POST /api/krummholz-bushwhack/calculate."""

    def test_calculate_valid_request(self, client: TestClient) -> None:
        resp = client.post(
            "/api/krummholz-bushwhack/calculate",
            json={
                "stems_per_sq_meter": 14.0,
                "canopy_mat_height_m": 1.3,
                "snow_moat_depth_cm": 35.0,
                "slope_angle_deg": 18.0,
                "pack_width_cm": 45.0,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "effective_velocity_km_h" in data
        assert "tree_well_spruce_trap_risk_pct" in data
        assert "metabolic_kcal_per_hour" in data
        assert "branch_snag_resistance_index" in data
        assert data["risk_level"] in ("low", "moderate", "high", "critical")
        assert data["safety_status"] == data["risk_level"]
        assert data["transit_strategy"] in (
            "frost-ridge-rock-hopping-leads",
            "streamlined-pack-creek-bed-bypass",
            "probe-tested-canopy-crawling",
            "abort-impenetrable-spruce-trap-labyrinth",
        )
        assert isinstance(data["warnings"], list)
        assert isinstance(data["recommendations"], list)

    def test_calculate_critical_spruce_trap_abort(self, client: TestClient) -> None:
        resp = client.post(
            "/api/krummholz-bushwhack/calculate",
            json={
                "stems_per_sq_meter": 40.0,
                "canopy_mat_height_m": 2.9,
                "snow_moat_depth_cm": 210.0,
                "slope_angle_deg": 42.0,
                "pack_width_cm": 78.0,
            },
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["risk_level"] == "critical"
        assert data["transit_strategy"] == "abort-impenetrable-spruce-trap-labyrinth"
        assert len(data["warnings"]) >= 2

    def test_calculate_invalid_stems_per_sq_meter_returns_422(self, client: TestClient) -> None:
        resp = client.post(
            "/api/krummholz-bushwhack/calculate",
            json={
                "stems_per_sq_meter": 60.0,
                "canopy_mat_height_m": 1.4,
                "snow_moat_depth_cm": 40.0,
                "slope_angle_deg": 18.0,
                "pack_width_cm": 45.0,
            },
        )
        assert resp.status_code == 422

    def test_calculate_invalid_canopy_mat_height_returns_422(self, client: TestClient) -> None:
        resp = client.post(
            "/api/krummholz-bushwhack/calculate",
            json={
                "stems_per_sq_meter": 12.0,
                "canopy_mat_height_m": 0.1,
                "snow_moat_depth_cm": 40.0,
                "slope_angle_deg": 18.0,
                "pack_width_cm": 45.0,
            },
        )
        assert resp.status_code == 422


class TestKrummholzBushwhackChecklistEndpoints:
    """Tests for GET /api/krummholz-bushwhack/checklist and GET /api/krummholz-bushwhack/gear."""

    def test_get_checklist(self, client: TestClient) -> None:
        resp = client.get("/api/krummholz-bushwhack/checklist")
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
        resp = client.get("/api/krummholz-bushwhack/gear")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) == 6
