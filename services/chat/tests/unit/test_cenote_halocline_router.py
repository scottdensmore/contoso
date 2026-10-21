"""Unit tests for the Cenote Halocline FastAPI router endpoints."""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestCenoteHaloclineRouter:
    """Tests for /cenote-halocline, /api/cenote-halocline, and /api/v1/cenote-halocline endpoints."""

    def test_list_all_sites(self) -> None:
        resp = client.get("/api/v1/cenote-halocline/sites")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 4
        assert len(data["sites"]) == 4
        assert len(data["gear_checklist"]) == 6

    def test_filter_sites_by_country_morphology_and_search(self) -> None:
        resp = client.get("/api/v1/cenote-halocline/sites", params={"country": "Bahamas"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 1
        assert data["sites"][0]["id"] == "dan-s-cave-abaco-anchialine-bahamas"

        resp_morph = client.get(
            "/api/v1/cenote-halocline/sites",
            params={"morphology": "meromictic-h2s-cloud-bell-sinkhole"},
        )
        assert resp_morph.status_code == 200
        morph_data = resp_morph.json()
        assert morph_data["total"] == 1
        assert morph_data["sites"][0]["id"] == "angelita-h2s-cloud-tulum-mexico"

        resp_search = client.get(
            "/api/v1/cenote-halocline/sites",
            params={"search": "Dos Ojos"},
        )
        assert resp_search.status_code == 200
        search_data = resp_search.json()
        assert search_data["total"] == 1
        assert search_data["sites"][0]["id"] == "sac-actun-pet-cembalo-mexico"

    def test_get_site_by_id_found_and_not_found(self) -> None:
        resp = client.get("/api/v1/cenote-halocline/sites/ox-bel-ha-halocline-tulum-mexico")
        assert resp.status_code == 200
        data = resp.json()
        assert data["site"]["id"] == "ox-bel-ha-halocline-tulum-mexico"
        assert data["site"]["country"] == "Mexico"
        assert "baseline_calculation" in data
        assert len(data["gear_checklist"]) == 6

        resp_404 = client.get("/api/v1/cenote-halocline/sites/unknown-cenote-conduit")
        assert resp_404.status_code == 404

    def test_calculate_post_and_get(self) -> None:
        payload = {
            "salinity_delta_ppt": 31.0,
            "tannic_doc_mg_l": 18.0,
            "silt_clay_fraction_pct": 55.0,
            "penetration_distance_m": 450.0,
            "h2s_concentration_ppm": 12.0,
            "site_id": "ox-bel-ha-halocline-tulum-mexico",
        }
        post_resp = client.post("/api/v1/cenote-halocline/calculate", json=payload)
        assert post_resp.status_code == 200
        post_data = post_resp.json()
        assert post_data["calculation"]["salinity_delta_ppt"] == 31.0
        assert post_data["site"]["id"] == "ox-bel-ha-halocline-tulum-mexico"
        assert len(post_data["gear_checklist"]) == 6

        get_resp = client.get(
            "/api/v1/cenote-halocline/calculate",
            params={
                "salinity_delta_ppt": 31.0,
                "tannic_doc_mg_l": 18.0,
                "silt_clay_fraction_pct": 55.0,
                "penetration_distance_m": 450.0,
                "h2s_concentration_ppm": 12.0,
                "site_id": "ox-bel-ha-halocline-tulum-mexico",
            },
        )
        assert get_resp.status_code == 200
        get_data = get_resp.json()
        assert (
            get_data["calculation"]["schlieren_optical_blur_index"]
            == post_data["calculation"]["schlieren_optical_blur_index"]
        )

    def test_calculate_validation_error_returns_422(self) -> None:
        bad_payload = {
            "salinity_delta_ppt": 50.0,
            "tannic_doc_mg_l": 12.0,
            "silt_clay_fraction_pct": 40.0,
            "penetration_distance_m": 250.0,
            "h2s_concentration_ppm": 2.0,
        }
        resp = client.post("/api/v1/cenote-halocline/calculate", json=bad_payload)
        assert resp.status_code == 422

    def test_checklist_and_gear_endpoints(self) -> None:
        for path in ["/api/v1/cenote-halocline/checklist", "/api/v1/cenote-halocline/gear"]:
            resp = client.get(path)
            assert resp.status_code == 200
            data = resp.json()
            assert data["total"] == 6
            assert len(data["gear_checklist"]) == 6

    def test_all_three_prefix_mounts(self) -> None:
        for prefix in [
            "/cenote-halocline",
            "/api/cenote-halocline",
            "/api/v1/cenote-halocline",
        ]:
            r = client.get(f"{prefix}/sites")
            assert r.status_code == 200
            assert r.json()["total"] == 4
