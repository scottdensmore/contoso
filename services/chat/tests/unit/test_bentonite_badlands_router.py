"""Unit tests for the Arid Badlands Bentonite Popcorn-Clay & Piping-Tunnel Sinkhole Navigation FastAPI router."""

from __future__ import annotations

from contoso_chat.routers.bentonite_badlands import router
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()
app.include_router(router, prefix="/api/bentonite-badlands")
app.include_router(router)
client = TestClient(app)


class TestBentoniteBadlandsRouter:
    """Validate REST endpoints on the bentonite badlands router."""

    def test_health_endpoint(self) -> None:
        resp = client.get("/api/bentonite-badlands/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert data["service"] == "bentonite-badlands"
        assert data["domain"] == "bentonite_badlands"
        assert data["sites_count"] == 4

        direct_resp = client.get("/bentonite-badlands/health")
        assert direct_resp.status_code == 200
        assert direct_resp.json()["status"] == "ok"

    def test_list_all_sites(self) -> None:
        resp = client.get("/api/bentonite-badlands/sites")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 4
        assert len(data["sites"]) == 4

    def test_filter_sites_query_params(self) -> None:
        resp = client.get(
            "/api/bentonite-badlands/sites", params={"country": "USA"}
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 2
        us_ids = {s["id"] for s in data["sites"]}
        assert us_ids == {
            "badlands-sage-creek-chadron-south-dakota",
            "cainville-factory-butte-mancos-shale-utah",
        }

        resp_morph = client.get(
            "/api/bentonite-badlands/sites",
            params={"morphology": "piping-tunnel-bridge"},
        )
        assert resp_morph.status_code == 200
        assert resp_morph.json()["total"] == 1
        assert (
            resp_morph.json()["sites"][0]["id"]
            == "dinosaur-red-deer-bearpaw-badlands-alberta-canada"
        )

        resp_swell = client.get(
            "/api/bentonite-badlands/sites",
            params={"swelling_grade": "moderate-montmorillonite"},
        )
        assert resp_swell.status_code == 200
        assert resp_swell.json()["total"] == 1
        assert (
            resp_swell.json()["sites"][0]["id"]
            == "bardenas-reales-pisquerra-piping-navarra-spain"
        )

        resp_diff = client.get(
            "/api/bentonite-badlands/sites", params={"difficulty": "challenging"}
        )
        assert resp_diff.status_code == 200
        assert resp_diff.json()["total"] == 2

    def test_get_single_site_by_id_and_404(self) -> None:
        resp = client.get(
            "/api/bentonite-badlands/sites/badlands-sage-creek-chadron-south-dakota"
        )
        assert resp.status_code == 200
        site = resp.json()
        assert site["country"] == "USA"
        assert site["morphology"] == "popcorn-crust-mound"
        assert "calc_summary" in site

        not_found = client.get("/api/bentonite-badlands/sites/nonexistent-bentonite-site")
        assert not_found.status_code == 404

    def test_post_and_get_calculate(self) -> None:
        payload = {
            "smectite_free_swell_index_pct": 310.0,
            "popcorn_crust_thickness_cm": 16.0,
            "piping_roof_thickness_cm": 22.0,
            "rainfall_intensity_mm_hr": 24.0,
            "slope_angle_deg": 35.0,
            "sodium_adsorption_ratio_sar": 28.0,
            "hiker_load_kg": 88.0,
        }
        post_resp = client.post("/api/bentonite-badlands/calculate", json=payload)
        assert post_resp.status_code == 200
        post_data = post_resp.json()
        assert post_data["risk_level"] in {"high", "critical"}
        assert post_data["piping_roof_punch_through_risk_pct"] > 50.0
        assert post_data["safe_pipe_bridge_setback_m"] > 8.0

        get_resp = client.get("/api/bentonite-badlands/calculate", params=payload)
        assert get_resp.status_code == 200
        assert get_resp.json()["risk_level"] == post_data["risk_level"]

    def test_calculate_validation_error_returns_422(self) -> None:
        bad_payload = {
            "smectite_free_swell_index_pct": 950.0,
            "popcorn_crust_thickness_cm": 12.0,
            "piping_roof_thickness_cm": 35.0,
            "rainfall_intensity_mm_hr": 10.0,
            "slope_angle_deg": 24.0,
        }
        resp = client.post("/api/bentonite-badlands/calculate", json=bad_payload)
        assert resp.status_code == 422

    def test_gear_checklist_post_and_get_endpoints(self) -> None:
        post_gear = client.post("/api/bentonite-badlands/gear-checklist")
        assert post_gear.status_code == 200
        assert post_gear.json()["total"] == 6
        assert len(post_gear.json()["checklist"]) == 6
        assert len(post_gear.json()["items"]) == 6

        chk = client.get("/api/bentonite-badlands/checklist")
        assert chk.status_code == 200
        assert chk.json()["total"] == 6
        assert len(chk.json()["checklist"]) == 6

        gear = client.get("/api/bentonite-badlands/gear")
        assert gear.status_code == 200
        assert gear.json()["total"] == 6
