"""Unit tests for the Thermokarst Tundra FastAPI router endpoints."""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestThermokarstTundraRouter:
    """Tests for /thermokarst-tundra and /api/v1/thermokarst-tundra endpoints."""

    def test_list_all_sites(self) -> None:
        resp = client.get("/api/v1/thermokarst-tundra/sites")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 4
        assert len(data["sites"]) == 4
        assert len(data["gear_checklist"]) == 6

    def test_filter_sites_by_country_and_morphology(self) -> None:
        resp = client.get("/api/v1/thermokarst-tundra/sites", params={"country": "Canada"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 1
        assert data["sites"][0]["id"] == "tuktoyaktuk-pingo-polygons-canada"

        resp_morph = client.get(
            "/api/v1/thermokarst-tundra/sites",
            params={"morphology": "retrogressive-thaw-slump-headwall"},
        )
        assert resp_morph.status_code == 200
        morph_data = resp_morph.json()
        assert morph_data["total"] == 1
        assert morph_data["sites"][0]["id"] == "batagaika-mega-slump-yakutia"

    def test_get_site_by_id_found_and_not_found(self) -> None:
        resp = client.get("/api/v1/thermokarst-tundra/sites/noatak-foothills-tussock-alaska-usa")
        assert resp.status_code == 200
        data = resp.json()
        assert data["site"]["id"] == "noatak-foothills-tussock-alaska-usa"
        assert data["site"]["country"] == "United States"
        assert " baseline_calculation" in f" { ' '.join(data.keys()) }"
        assert len(data["gear_checklist"]) == 6

        resp_404 = client.get("/api/v1/thermokarst-tundra/sites/unknown-arctic-basin")
        assert resp_404.status_code == 404

    def test_calculate_post_and_get(self) -> None:
        payload = {
            "active_layer_depth_cm": 90.0,
            "trough_water_depth_cm": 65.0,
            "soil_moisture_saturation_pct": 85.0,
            "eriophorum_tussock_height_cm": 40.0,
            "pack_load_kg": 22.0,
            "site_id": "batagaika-mega-slump-yakutia",
        }
        post_resp = client.post("/api/v1/thermokarst-tundra/calculate", json=payload)
        assert post_resp.status_code == 200
        post_data = post_resp.json()
        assert post_data["calculation"]["active_layer_depth_cm"] == 90.0
        assert post_data["site"]["id"] == "batagaika-mega-slump-yakutia"
        assert len(post_data["gear_checklist"]) == 6

        get_resp = client.get(
            "/api/v1/thermokarst-tundra/calculate",
            params={
                "active_layer_depth_cm": 90.0,
                "trough_water_depth_cm": 65.0,
                "soil_moisture_saturation_pct": 85.0,
                "eriophorum_tussock_height_cm": 40.0,
                "pack_load_kg": 22.0,
                "site_id": "batagaika-mega-slump-yakutia",
            },
        )
        assert get_resp.status_code == 200
        get_data = get_resp.json()
        assert (
            get_data["calculation"]["suprapermafrost_liquefaction_index"]
            == post_data["calculation"]["suprapermafrost_liquefaction_index"]
        )

    def test_calculate_validation_error_returns_422(self) -> None:
        bad_payload = {
            "active_layer_depth_cm": 250.0,
            "trough_water_depth_cm": 40.0,
            "soil_moisture_saturation_pct": 75.0,
            "eriophorum_tussock_height_cm": 30.0,
            "pack_load_kg": 18.0,
        }
        resp = client.post("/api/v1/thermokarst-tundra/calculate", json=bad_payload)
        assert resp.status_code == 422

    def test_checklist_endpoint(self) -> None:
        resp = client.get("/api/v1/thermokarst-tundra/checklist")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 6
        assert len(data["gear_checklist"]) == 6

    def test_all_three_prefix_mounts(self) -> None:
        for prefix in [
            "/thermokarst-tundra",
            "/api/thermokarst-tundra",
            "/api/v1/thermokarst-tundra",
        ]:
            r = client.get(f"{prefix}/sites")
            assert r.status_code == 200
            assert r.json()["total"] == 4
