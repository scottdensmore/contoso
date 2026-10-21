"""Unit tests for the Subterranean Gypsum-Karst Dissolution Maze & Evaporite Breakdown-Hall Speleology FastAPI router endpoints."""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestGypsumKarstRouter:
    """Tests for /gypsum-karst, /api/gypsum-karst, and /api/v1/gypsum-karst endpoints."""

    def test_list_all_sites(self) -> None:
        resp = client.get("/api/v1/gypsum-karst/sites")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 4
        assert len(data["sites"]) == 4
        assert len(data["gear_checklist"]) == 6

    def test_filter_sites_by_country_morphology_and_search(self) -> None:
        resp = client.get(
            "/api/v1/gypsum-karst/sites", params={"country": "Ukraine"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 1
        assert data["sites"][0]["id"] == "optimisticeskaja-ozerna-podolia-ukraine"

        resp_morph = client.get(
            "/api/v1/gypsum-karst/sites",
            params={"morphology": "messinian-selenite-epigenetic-gorge"},
        )
        assert resp_morph.status_code == 200
        morph_data = resp_morph.json()
        assert morph_data["total"] == 1
        assert (
            morph_data["sites"][0]["id"]
            == "spipola-acquafredda-vena-del-gesso-italy"
        )

        resp_search = client.get(
            "/api/v1/gypsum-karst/sites",
            params={"search": "Covadura"},
        )
        assert resp_search.status_code == 200
        search_data = resp_search.json()
        assert search_data["total"] == 1
        assert (
            search_data["sites"][0]["id"]
            == "sorbas-covadura-yesos-almeria-spain"
        )

    def test_get_site_by_id_found_and_not_found(self) -> None:
        resp = client.get(
            "/api/v1/gypsum-karst/sites/optimisticeskaja-ozerna-podolia-ukraine"
        )
        assert resp.status_code == 200
        data = resp.json()
        assert (
            data["site"]["id"]
            == "optimisticeskaja-ozerna-podolia-ukraine"
        )
        assert data["site"]["country"] == "Ukraine"
        assert "baseline_calculation" in data
        assert len(data["gear_checklist"]) == 6

        resp_404 = client.get(
            "/api/v1/gypsum-karst/sites/unknown-gypsum-karst-site"
        )
        assert resp_404.status_code == 404

    def test_calculate_post_and_get(self) -> None:
        payload = {
            "junction_count_per_100m": 32.0,
            "ceiling_bed_thickness_cm": 9.0,
            "surface_rain_inflow_mm_hr": 24.0,
            "anhydrite_swelling_pct": 42.0,
            "party_acoustic_decibels": 78.0,
            "site_id": "optimisticeskaja-ozerna-podolia-ukraine",
        }
        post_resp = client.post("/api/v1/gypsum-karst/calculate", json=payload)
        assert post_resp.status_code == 200
        post_data = post_resp.json()
        assert post_data["calculation"]["junction_count_per_100m"] == 32.0
        assert (
            post_data["site"]["id"]
            == "optimisticeskaja-ozerna-podolia-ukraine"
        )
        assert len(post_data["gear_checklist"]) == 6

        get_resp = client.get(
            "/api/v1/gypsum-karst/calculate",
            params={
                "junction_count_per_100m": 32.0,
                "ceiling_bed_thickness_cm": 9.0,
                "surface_rain_inflow_mm_hr": 24.0,
                "anhydrite_swelling_pct": 42.0,
                "party_acoustic_decibels": 78.0,
                "site_id": "optimisticeskaja-ozerna-podolia-ukraine",
            },
        )
        assert get_resp.status_code == 200
        get_data = get_resp.json()
        assert (
            get_data["calculation"]["ceiling_slab_peel_probability_pct"]
            == post_data["calculation"]["ceiling_slab_peel_probability_pct"]
        )

    def test_calculate_validation_error_returns_422(self) -> None:
        bad_payload = {
            "junction_count_per_100m": 60.0,
            "ceiling_bed_thickness_cm": 20.0,
            "surface_rain_inflow_mm_hr": 10.0,
            "anhydrite_swelling_pct": 25.0,
            "party_acoustic_decibels": 65.0,
        }
        resp = client.post("/api/v1/gypsum-karst/calculate", json=bad_payload)
        assert resp.status_code == 422

    def test_checklist_and_gear_endpoints(self) -> None:
        for path in [
            "/api/v1/gypsum-karst/checklist",
            "/api/v1/gypsum-karst/gear",
        ]:
            resp = client.get(path)
            assert resp.status_code == 200
            data = resp.json()
            assert data["total"] == 6
            assert len(data["gear_checklist"]) == 6

    def test_all_three_prefix_mounts(self) -> None:
        for prefix in [
            "/gypsum-karst",
            "/api/gypsum-karst",
            "/api/v1/gypsum-karst",
        ]:
            r = client.get(f"{prefix}/sites")
            assert r.status_code == 200
            assert r.json()["total"] == 4
