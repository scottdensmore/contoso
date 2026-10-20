"""Unit tests for the Coastal Intertidal Sabellariid Worm-Reef & Barnacle Ledge FastAPI router endpoints."""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestBarnacleLedgeRouter:
    """Tests for /barnacle-ledge, /api/barnacle-ledge, and /api/v1/barnacle-ledge endpoints."""

    def test_list_all_sites(self) -> None:
        resp = client.get("/api/v1/barnacle-ledge/sites")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 4
        assert len(data["sites"]) == 4
        assert len(data["gear_checklist"]) == 6

    def test_filter_sites_by_country_substrate_type_and_search(self) -> None:
        resp = client.get("/api/v1/barnacle-ledge/sites", params={"country": "Spain"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 1
        assert data["sites"][0]["id"] == "cabo-percebes-costa-da-morte-galicia-spain"

        resp_sub = client.get(
            "/api/v1/barnacle-ledge/sites",
            params={"substrate_type": "sabellariid-honeycomb-worm-reef"},
        )
        assert resp_sub.status_code == 200
        sub_data = resp_sub.json()
        assert sub_data["total"] == 1
        assert sub_data["sites"][0]["id"] == "duckpool-bude-sabellaria-reef-cornwall-uk"

        resp_search = client.get(
            "/api/v1/barnacle-ledge/sites",
            params={"search": "Perpetua"},
        )
        assert resp_search.status_code == 200
        search_data = resp_search.json()
        assert search_data["total"] == 1
        assert search_data["sites"][0]["id"] == "cape-perpetua-yachats-basalt-bench-oregon"

    def test_get_site_by_id_found_and_not_found(self) -> None:
        resp = client.get(
            "/api/v1/barnacle-ledge/sites/cape-perpetua-yachats-basalt-bench-oregon"
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["site"]["id"] == "cape-perpetua-yachats-basalt-bench-oregon"
        assert data["site"]["country"] == "USA"
        assert "baseline_calculation" in data
        assert len(data["gear_checklist"]) == 6

        resp_404 = client.get("/api/v1/barnacle-ledge/sites/unknown-barnacle-ledge-site")
        assert resp_404.status_code == 404

    def test_calculate_post_and_get(self) -> None:
        payload = {
            "swell_height_m": 2.4,
            "swell_period_sec": 15.0,
            "algal_biofilm_cover_pct": 62.0,
            "sabellariid_colony_density_pct": 30.0,
            "ledge_freeboard_m": 1.3,
            "site_id": "cape-perpetua-yachats-basalt-bench-oregon",
        }
        post_resp = client.post("/api/v1/barnacle-ledge/calculate", json=payload)
        assert post_resp.status_code == 200
        post_data = post_resp.json()
        assert post_data["calculation"]["swell_height_m"] == 2.4
        assert post_data["site"]["id"] == "cape-perpetua-yachats-basalt-bench-oregon"
        assert len(post_data["gear_checklist"]) == 6

        get_resp = client.get(
            "/api/v1/barnacle-ledge/calculate",
            params={
                "swell_height_m": 2.4,
                "swell_period_sec": 15.0,
                "algal_biofilm_cover_pct": 62.0,
                "sabellariid_colony_density_pct": 30.0,
                "ledge_freeboard_m": 1.3,
                "site_id": "cape-perpetua-yachats-basalt-bench-oregon",
            },
        )
        assert get_resp.status_code == 200
        get_data = get_resp.json()
        assert (
            get_data["calculation"]["infragravity_overwash_probability_pct"]
            == post_data["calculation"]["infragravity_overwash_probability_pct"]
        )

    def test_calculate_validation_error_returns_422(self) -> None:
        bad_payload = {
            "swell_height_m": 8.5,
            "swell_period_sec": 12.0,
            "algal_biofilm_cover_pct": 40.0,
            "sabellariid_colony_density_pct": 35.0,
            "ledge_freeboard_m": 1.6,
        }
        resp = client.post("/api/v1/barnacle-ledge/calculate", json=bad_payload)
        assert resp.status_code == 422

    def test_checklist_and_gear_endpoints(self) -> None:
        for path in [
            "/api/v1/barnacle-ledge/checklist",
            "/api/v1/barnacle-ledge/gear",
        ]:
            resp = client.get(path)
            assert resp.status_code == 200
            data = resp.json()
            assert data["total"] == 6
            assert len(data["gear_checklist"]) == 6

    def test_all_three_prefix_mounts(self) -> None:
        for prefix in [
            "/barnacle-ledge",
            "/api/barnacle-ledge",
            "/api/v1/barnacle-ledge",
        ]:
            r = client.get(f"{prefix}/sites")
            assert r.status_code == 200
            assert r.json()["total"] == 4
