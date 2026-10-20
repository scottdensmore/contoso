"""Unit tests for the Subalpine Boulder-Talus Air-Draft Ice Cave & Cold-Trap Block-Field FastAPI router endpoints."""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestTalusColdTrapRouter:
    """Tests for /talus-cold-trap, /api/talus-cold-trap, and /api/v1/talus-cold-trap endpoints."""

    def test_list_all_sites(self) -> None:
        resp = client.get("/api/v1/talus-cold-trap/sites")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 4
        assert len(data["sites"]) == 4
        assert len(data["gear_checklist"]) == 6

    def test_filter_sites_by_country_regime_and_search(self) -> None:
        resp = client.get(
            "/api/v1/talus-cold-trap/sites", params={"country": "Czech Republic"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 1
        assert data["sites"][0]["id"] == "kamenec-crevice-ice-talus-bohemia-czechia"

        resp_regime = client.get(
            "/api/v1/talus-cold-trap/sites",
            params={"regime": "algific-dolomite-cold-vent-slope"},
        )
        assert resp_regime.status_code == 200
        regime_data = resp_regime.json()
        assert regime_data["total"] == 1
        assert regime_data["sites"][0]["id"] == "driftless-algific-talus-slopes-iowa"

        resp_search = client.get(
            "/api/v1/talus-cold-trap/sites",
            params={"search": "Mahoosuc"},
        )
        assert resp_search.status_code == 200
        search_data = resp_search.json()
        assert search_data["total"] == 1
        assert (
            search_data["sites"][0]["id"]
            == "king-ravine-mahosuc-notch-white-mountains-nh"
        )

    def test_get_site_by_id_found_and_not_found(self) -> None:
        resp = client.get(
            "/api/v1/talus-cold-trap/sites/king-ravine-mahosuc-notch-white-mountains-nh"
        )
        assert resp.status_code == 200
        data = resp.json()
        assert (
            data["site"]["id"]
            == "king-ravine-mahosuc-notch-white-mountains-nh"
        )
        assert data["site"]["country"] == "USA"
        assert "baseline_calculation" in data
        assert len(data["gear_checklist"]) == 6

        resp_404 = client.get(
            "/api/v1/talus-cold-trap/sites/unknown-talus-cold-trap-site"
        )
        assert resp_404.status_code == 404

    def test_calculate_post_and_get(self) -> None:
        payload = {
            "ambient_air_temp_c": 24.0,
            "crevice_void_depth_m": 15.0,
            "moss_humus_masking_pct": 72.0,
            "boulder_block_span_m": 4.5,
            "cold_draft_velocity_ms": 3.6,
            "site_id": "king-ravine-mahosuc-notch-white-mountains-nh",
        }
        post_resp = client.post("/api/v1/talus-cold-trap/calculate", json=payload)
        assert post_resp.status_code == 200
        post_data = post_resp.json()
        assert post_data["calculation"]["ambient_air_temp_c"] == 24.0
        assert (
            post_data["site"]["id"]
            == "king-ravine-mahosuc-notch-white-mountains-nh"
        )
        assert len(post_data["gear_checklist"]) == 6

        get_resp = client.get(
            "/api/v1/talus-cold-trap/calculate",
            params={
                "ambient_air_temp_c": 24.0,
                "crevice_void_depth_m": 15.0,
                "moss_humus_masking_pct": 72.0,
                "boulder_block_span_m": 4.5,
                "cold_draft_velocity_ms": 3.6,
                "site_id": "king-ravine-mahosuc-notch-white-mountains-nh",
            },
        )
        assert get_resp.status_code == 200
        get_data = get_resp.json()
        assert (
            get_data["calculation"]["verglas_glaze_slip_probability_pct"]
            == post_data["calculation"]["verglas_glaze_slip_probability_pct"]
        )

    def test_calculate_validation_error_returns_422(self) -> None:
        bad_payload = {
            "ambient_air_temp_c": 45.0,
            "crevice_void_depth_m": 10.0,
            "moss_humus_masking_pct": 50.0,
            "boulder_block_span_m": 3.2,
            "cold_draft_velocity_ms": 2.4,
        }
        resp = client.post("/api/v1/talus-cold-trap/calculate", json=bad_payload)
        assert resp.status_code == 422

    def test_checklist_and_gear_endpoints(self) -> None:
        for path in [
            "/api/v1/talus-cold-trap/checklist",
            "/api/v1/talus-cold-trap/gear",
        ]:
            resp = client.get(path)
            assert resp.status_code == 200
            data = resp.json()
            assert data["total"] == 6
            assert len(data["gear_checklist"]) == 6

    def test_all_three_prefix_mounts(self) -> None:
        for prefix in [
            "/talus-cold-trap",
            "/api/talus-cold-trap",
            "/api/v1/talus-cold-trap",
        ]:
            r = client.get(f"{prefix}/sites")
            assert r.status_code == 200
            assert r.json()["total"] == 4
