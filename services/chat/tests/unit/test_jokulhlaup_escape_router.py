"""Unit tests for the Subglacial Jökulhlaup Escape FastAPI router endpoints."""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestJokulhlaupEscapeRouter:
    """Tests for /jokulhlaup-escape, /api/jokulhlaup-escape, and /api/v1/jokulhlaup-escape endpoints."""

    def test_list_all_sites(self) -> None:
        resp = client.get("/api/v1/jokulhlaup-escape/sites")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 4
        assert len(data["sites"]) == 4
        assert len(data["gear_checklist"]) == 6

    def test_filter_sites_by_country_trigger_mechanism_and_search(self) -> None:
        resp = client.get("/api/v1/jokulhlaup-escape/sites", params={"country": "Chile"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["total"] == 1
        assert data["sites"][0]["id"] == "cachet-dos-colonia-patagonia-chile"

        resp_trig = client.get(
            "/api/v1/jokulhlaup-escape/sites",
            params={"trigger_mechanism": "marginal-ice-dam-flotation"},
        )
        assert resp_trig.status_code == 200
        trig_data = resp_trig.json()
        assert trig_data["total"] == 1
        assert trig_data["sites"][0]["id"] == "suicide-basin-mendenhall-juneau-alaska"

        resp_search = client.get(
            "/api/v1/jokulhlaup-escape/sites",
            params={"search": "Kyagar"},
        )
        assert resp_search.status_code == 200
        search_data = resp_search.json()
        assert search_data["total"] == 1
        assert search_data["sites"][0]["id"] == "kyagar-shaksgam-karakoram-pakistan-china"

    def test_get_site_by_id_found_and_not_found(self) -> None:
        resp = client.get(
            "/api/v1/jokulhlaup-escape/sites/grimsvotn-skeidararsandur-vatnajokull-iceland"
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["site"]["id"] == "grimsvotn-skeidararsandur-vatnajokull-iceland"
        assert data["site"]["country"] == "Iceland"
        assert "baseline_calculation" in data
        assert len(data["gear_checklist"]) == 6

        resp_404 = client.get("/api/v1/jokulhlaup-escape/sites/unknown-jokulhlaup-site")
        assert resp_404.status_code == 404

    def test_calculate_post_and_get(self) -> None:
        payload = {
            "ice_dam_drawdown_cm_per_hr": 85.0,
            "proglacial_conductivity_us_cm": 560.0,
            "subglacial_tremor_amplitude_um": 14.0,
            "canyon_floor_distance_from_portal_km": 3.5,
            "vertical_gain_to_safe_terrace_m": 65.0,
            "site_id": "grimsvotn-skeidararsandur-vatnajokull-iceland",
        }
        post_resp = client.post("/api/v1/jokulhlaup-escape/calculate", json=payload)
        assert post_resp.status_code == 200
        post_data = post_resp.json()
        assert post_data["calculation"]["ice_dam_drawdown_cm_per_hr"] == 85.0
        assert post_data["site"]["id"] == "grimsvotn-skeidararsandur-vatnajokull-iceland"
        assert len(post_data["gear_checklist"]) == 6

        get_resp = client.get(
            "/api/v1/jokulhlaup-escape/calculate",
            params={
                "ice_dam_drawdown_cm_per_hr": 85.0,
                "proglacial_conductivity_us_cm": 560.0,
                "subglacial_tremor_amplitude_um": 14.0,
                "canyon_floor_distance_from_portal_km": 3.5,
                "vertical_gain_to_safe_terrace_m": 65.0,
                "site_id": "grimsvotn-skeidararsandur-vatnajokull-iceland",
            },
        )
        assert get_resp.status_code == 200
        get_data = get_resp.json()
        assert (
            get_data["calculation"]["estimated_peak_discharge_m3s"]
            == post_data["calculation"]["estimated_peak_discharge_m3s"]
        )

    def test_calculate_validation_error_returns_422(self) -> None:
        bad_payload = {
            "ice_dam_drawdown_cm_per_hr": 300.0,
            "proglacial_conductivity_us_cm": 280.0,
            "subglacial_tremor_amplitude_um": 6.5,
            "canyon_floor_distance_from_portal_km": 4.5,
            "vertical_gain_to_safe_terrace_m": 55.0,
        }
        resp = client.post("/api/v1/jokulhlaup-escape/calculate", json=bad_payload)
        assert resp.status_code == 422

    def test_checklist_and_gear_endpoints(self) -> None:
        for path in [
            "/api/v1/jokulhlaup-escape/checklist",
            "/api/v1/jokulhlaup-escape/gear",
        ]:
            resp = client.get(path)
            assert resp.status_code == 200
            data = resp.json()
            assert data["total"] == 6
            assert len(data["gear_checklist"]) == 6

    def test_all_three_prefix_mounts(self) -> None:
        for prefix in [
            "/jokulhlaup-escape",
            "/api/jokulhlaup-escape",
            "/api/v1/jokulhlaup-escape",
        ]:
            r = client.get(f"{prefix}/sites")
            assert r.status_code == 200
            assert r.json()["total"] == 4
