"""Unit tests for the High-Altitude Volcanic Obsidian-Flow & Glass-Block Coulee Scrambling FastAPI router."""

from __future__ import annotations

from contoso_chat.routers.obsidian_coulee import router
from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()
app.include_router(router, prefix="/api/obsidian-coulee")
client = TestClient(app)


class TestObsidianCouleeRouter:
    """Validate REST endpoints on the obsidian coulee router."""

    def test_list_all_sites(self) -> None:
        resp = client.get("/api/obsidian-coulee/sites")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 4
        assert len(data["sites"]) == 4

    def test_filter_sites_query_params(self) -> None:
        resp = client.get("/api/obsidian-coulee/sites", params={"country": "Iceland"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 1
        assert data["sites"][0]["id"] == "hrafntinnusker-torfajokull-obsidian-plateau-iceland"

        resp_lith = client.get(
            "/api/obsidian-coulee/sites",
            params={"lithology": "pumiceous-carapace-glass-dome"},
        )
        assert resp_lith.status_code == 200
        assert resp_lith.json()["total"] == 1
        assert (
            resp_lith.json()["sites"][0]["id"]
            == "glass-mountain-medicine-lake-volcano-california"
        )

        resp_diff = client.get(
            "/api/obsidian-coulee/sites", params={"difficulty": "challenging"}
        )
        assert resp_diff.status_code == 200
        assert resp_diff.json()["total"] == 2

    def test_get_single_site_by_id_and_404(self) -> None:
        resp = client.get(
            "/api/obsidian-coulee/sites/big-obsidian-flow-newberry-caldera-oregon"
        )
        assert resp.status_code == 200
        site = resp.json()
        assert site["country"] == "USA"
        assert site["lithology"] == "banded-rhyolite-obsidian-coulee"
        assert "calc_summary" in site

        not_found = client.get("/api/obsidian-coulee/sites/nonexistent-obsidian-flow")
        assert not_found.status_code == 404

    def test_post_and_get_calculate(self) -> None:
        payload = {
            "conchoidal_flake_density_pct": 78.0,
            "block_instability_tilt_deg": 34.0,
            "vesicular_pumice_crust_ratio_pct": 64.0,
            "coulee_crest_relief_m": 82.0,
            "scrambler_pack_mass_kg": 22.0,
        }
        post_resp = client.post("/api/obsidian-coulee/calculate", json=payload)
        assert post_resp.status_code == 200
        post_data = post_resp.json()
        assert post_data["risk_level"] in {"high", "critical"}
        assert post_data["surgical_laceration_severity_score"] > 50.0
        assert post_data["boot_lug_shred_rate_mm_per_km"] > 1.5

        get_resp = client.get("/api/obsidian-coulee/calculate", params=payload)
        assert get_resp.status_code == 200
        assert get_resp.json()["risk_level"] == post_data["risk_level"]

    def test_calculate_validation_error_returns_422(self) -> None:
        bad_payload = {
            "conchoidal_flake_density_pct": 125.0,
            "block_instability_tilt_deg": 22.0,
            "vesicular_pumice_crust_ratio_pct": 35.0,
            "coulee_crest_relief_m": 45.0,
            "scrambler_pack_mass_kg": 16.0,
        }
        resp = client.post("/api/obsidian-coulee/calculate", json=bad_payload)
        assert resp.status_code == 422

    def test_checklist_and_gear_endpoints(self) -> None:
        chk = client.get("/api/obsidian-coulee/checklist")
        assert chk.status_code == 200
        assert chk.json()["total"] == 6
        assert len(chk.json()["checklist"]) == 6

        gear = client.get("/api/obsidian-coulee/gear")
        assert gear.status_code == 200
        assert gear.json()["total"] == 6
