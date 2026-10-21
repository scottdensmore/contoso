"""Unit tests for the Boreal String-Bog (Aapa Mire) Flark-Pool & Palsa Permafrost-Mound FastAPI router endpoints."""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestAapaPalsaMireRouter:
    """Tests for /aapa-palsa-mire, /api/aapa-palsa-mire, and /api/v1/aapa-palsa-mire endpoints."""

    def test_list_all_sites(self) -> None:
        resp = client.get("/api/v1/aapa-palsa-mire/sites")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 4
        assert len(data["sites"]) == 4
        assert len(data["gear_checklist"]) == 6

    def test_filter_sites_by_country_morphology_and_search(self) -> None:
        resp = client.get(
            "/api/v1/aapa-palsa-mire/sites", params={"country": "Finland"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 1
        assert data["sites"][0]["id"] == "voda-viiankiaapa-sodankyla-lapland-finland"

        resp_morph = client.get(
            "/api/v1/aapa-palsa-mire/sites",
            params={"morphology": "ice-cored-palsa-dome-plateau"},
        )
        assert resp_morph.status_code == 200
        morph_data = resp_morph.json()
        assert morph_data["total"] == 1
        assert (
            morph_data["sites"][0]["id"]
            == "tavvavuoma-kummavuopio-palsa-norrbotten-sweden"
        )

        resp_search = client.get(
            "/api/v1/aapa-palsa-mire/sites",
            params={"search": "Viiankiaapa"},
        )
        assert resp_search.status_code == 200
        search_data = resp_search.json()
        assert search_data["total"] == 1
        assert (
            search_data["sites"][0]["id"]
            == "voda-viiankiaapa-sodankyla-lapland-finland"
        )

    def test_get_site_by_id_found_and_not_found(self) -> None:
        resp = client.get(
            "/api/v1/aapa-palsa-mire/sites/voda-viiankiaapa-sodankyla-lapland-finland"
        )
        assert resp.status_code == 200
        data = resp.json()
        assert (
            data["site"]["id"]
            == "voda-viiankiaapa-sodankyla-lapland-finland"
        )
        assert data["site"]["country"] == "Finland"
        assert "baseline_calculation" in data
        assert len(data["gear_checklist"]) == 6

        resp_404 = client.get(
            "/api/v1/aapa-palsa-mire/sites/unknown-aapa-palsa-mire-site"
        )
        assert resp_404.status_code == 404

    def test_calculate_post_and_get(self) -> None:
        payload = {
            "strang_width_m": 0.9,
            "flark_trough_span_m": 28.0,
            "active_thaw_depth_cm": 85.0,
            "palsa_rim_fissure_score": 72.0,
            "hiker_pack_weight_kg": 26.0,
            "site_id": "voda-viiankiaapa-sodankyla-lapland-finland",
        }
        post_resp = client.post("/api/v1/aapa-palsa-mire/calculate", json=payload)
        assert post_resp.status_code == 200
        post_data = post_resp.json()
        assert post_data["calculation"]["strang_width_m"] == 0.9
        assert (
            post_data["site"]["id"]
            == "voda-viiankiaapa-sodankyla-lapland-finland"
        )
        assert len(post_data["gear_checklist"]) == 6

        get_resp = client.get(
            "/api/v1/aapa-palsa-mire/calculate",
            params={
                "strang_width_m": 0.9,
                "flark_trough_span_m": 28.0,
                "active_thaw_depth_cm": 85.0,
                "palsa_rim_fissure_score": 72.0,
                "hiker_pack_weight_kg": 26.0,
                "site_id": "voda-viiankiaapa-sodankyla-lapland-finland",
            },
        )
        assert get_resp.status_code == 200
        get_data = get_resp.json()
        assert (
            get_data["calculation"]["strang_shear_breakthrough_risk_pct"]
            == post_data["calculation"]["strang_shear_breakthrough_risk_pct"]
        )

    def test_calculate_validation_error_returns_422(self) -> None:
        bad_payload = {
            "strang_width_m": 9.5,
            "flark_trough_span_m": 15.0,
            "active_thaw_depth_cm": 50.0,
            "palsa_rim_fissure_score": 40.0,
            "hiker_pack_weight_kg": 22.0,
        }
        resp = client.post("/api/v1/aapa-palsa-mire/calculate", json=bad_payload)
        assert resp.status_code == 422

    def test_checklist_and_gear_endpoints(self) -> None:
        for path in [
            "/api/v1/aapa-palsa-mire/checklist",
            "/api/v1/aapa-palsa-mire/gear",
        ]:
            resp = client.get(path)
            assert resp.status_code == 200
            data = resp.json()
            assert data["total"] == 6
            assert len(data["gear_checklist"]) == 6

    def test_all_three_prefix_mounts(self) -> None:
        for prefix in [
            "/aapa-palsa-mire",
            "/api/aapa-palsa-mire",
            "/api/v1/aapa-palsa-mire",
        ]:
            r = client.get(f"{prefix}/sites")
            assert r.status_code == 200
            assert r.json()["total"] == 4
