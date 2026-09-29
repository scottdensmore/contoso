import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_smoke_advisory_journey():
    """Multi-step API journey test for Wilderness Forest Fire Smoke Drift & Alpine Air Quality Advisor:

    Step 1: Health check (/health, /healthz, /ready, /api/status).
    Step 2: List stations (/smoke-advisory/stations), filter by layer & severity.
    Step 3: Station detail (/smoke-advisory/stations/pasayten-boundary-fire) and 404 for unknown station.
    Step 4: Calculate (/smoke-advisory/calculate) and 404 for unknown station.
    Step 5: Gear checklist (/smoke-advisory/gear).
    Step 6: Assistant response (/chat and /api/create_response) via create_response.
    Step 7: Assistant streaming response (/chat/stream and /api/create_response/stream) via create_response_stream.
    """
    # -------------------------------------------------------------------------
    # Step 1: Health check (/health)
    # -------------------------------------------------------------------------
    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"

    res_healthz = client.get("/healthz")
    assert res_healthz.status_code == 200
    assert res_healthz.json()["status"] == "healthy"

    res_ready = client.get("/ready")
    assert res_ready.status_code == 200
    assert res_ready.json()["status"] == "healthy"

    res_status = client.get("/api/status")
    assert res_status.status_code == 200
    assert res_status.json()["status"] == "online"

    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 2: List stations (/smoke-advisory/stations)
        # -------------------------------------------------------------------------
        res2 = client.get("/smoke-advisory/stations")
        assert res2.status_code == 200
        stations = res2.json()
        assert len(stations) == 5
        station_ids = [s["id"] for s in stations]
        assert "pasayten-boundary-fire" in station_ids
        assert "sawtooth-wilderness-basin" in station_ids
        assert "sierra-crest-granite-gap" in station_ids
        assert "san-juan-wetterhorn-basin" in station_ids
        assert "bob-marshall-wilderness-complex" in station_ids

        # Also test with /api prefix
        res2_api = client.get("/api/smoke-advisory/stations")
        assert res2_api.status_code == 200
        assert len(res2_api.json()) == 5

        # Filter by layer
        res2_layer = client.get("/smoke-advisory/stations?layer=mid_slope_thermal_belt")
        assert res2_layer.status_code == 200
        layer_stations = res2_layer.json()
        assert len(layer_stations) == 1
        assert layer_stations[0]["id"] == "sawtooth-wilderness-basin"

        # Filter by severity
        res2_sev = client.get("/smoke-advisory/stations?severity=clean_uncompromised")
        assert res2_sev.status_code == 200
        sev_stations = res2_sev.json()
        assert len(sev_stations) == 1
        assert sev_stations[0]["id"] == "san-juan-wetterhorn-basin"

        # -------------------------------------------------------------------------
        # Step 3: Station detail (/smoke-advisory/stations/pasayten-boundary-fire)
        # -------------------------------------------------------------------------
        res3 = client.get("/smoke-advisory/stations/pasayten-boundary-fire")
        assert res3.status_code == 200
        detail = res3.json()
        assert detail["id"] == "pasayten-boundary-fire"
        assert detail["name"] == "Pasayten Boundary Fire Telemetry"
        assert detail["range"] == "Cascade Crest"
        assert detail["elevation_meters"] == 1450
        assert detail["aqi"] == 185
        assert detail["pm25_ug_m3"] == 121.5
        assert detail["severity"] == "unhealthy_wildfire_plume"
        assert detail["layer"] == "valley_basin_trapping"
        assert detail["inversion_trapped"] is True
        assert detail["active_fire_distance_km"] == 18.0
        assert len(detail["highlights"]) >= 3

        # 404 for unknown station
        res3_404 = client.get("/smoke-advisory/stations/unknown-fire-station")
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Calculate (/smoke-advisory/calculate)
        # -------------------------------------------------------------------------
        calc_payload = {
            "station_id": "pasayten-boundary-fire",
            "activity_intensity": "strenuous_alpine_ascent",
            "exposure_hours": 4.0,
            "respirator_type": "none",
        }
        res4 = client.post("/smoke-advisory/calculate", json=calc_payload)
        assert res4.status_code == 200
        calc_data = res4.json()
        assert calc_data["station_id"] == "pasayten-boundary-fire"
        assert calc_data["station_name"] == "Pasayten Boundary Fire Telemetry"
        assert calc_data["layer"] == "valley_basin_trapping"
        assert calc_data["effective_pm25_ug_m3"] == 164.0
        assert calc_data["effective_aqi"] == 214
        assert calc_data["safety_status"] == "critical_hazard_cease_exertion"
        assert calc_data["ventilation_rate_m3_hr"] == 3.2
        assert calc_data["inhaled_particulate_dose_ug"] == round(164.0 * 3.2 * 1.0 * 4.0, 1)

        # 404 for unknown station in calculate
        res4_404 = client.post("/smoke-advisory/calculate", json={"station_id": "nonexistent"})
        assert res4_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 5: Gear checklist (/smoke-advisory/gear)
        # -------------------------------------------------------------------------
        res5 = client.get("/smoke-advisory/gear")
        assert res5.status_code == 200
        gear = res5.json()
        assert len(gear) == 6
        assert all(g["mandatory"] is True for g in gear)
        gear_ids = [g["id"] for g in gear]
        assert "n95-valved-particulate-respirator" in gear_ids
        assert "sealed-smoke-goggles" in gear_ids
        assert "portable-laser-pm25-monitor" in gear_ids
        assert "hepa-micro-tent-purifier" in gear_ids
        assert "electrolyte-saline-eye-rinse" in gear_ids
        assert "bronchodilator-emergency-inhaler-pouch" in gear_ids

        # -------------------------------------------------------------------------
        # Step 6: Assistant response (/chat and /api/create_response)
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the wildfire smoke advisory and particulate air quality for Pasayten Boundary Fire?",
        }
        res6 = client.post("/chat", json=chat_req)
        assert res6.status_code == 200
        chat_data = res6.json()
        assert "smoke_advisory_info" in chat_data
        assert chat_data["smoke_advisory_info"]["action"] in (
            "smoke_advisory",
            "stations_list",
            "station_detail",
        )
        assert len(chat_data["answer"]) > 0

        # Also verify via /api/create_response
        res6_api = client.post("/api/create_response", json=chat_req)
        assert res6_api.status_code == 200
        assert "smoke_advisory_info" in res6_api.json()

        # -------------------------------------------------------------------------
        # Step 7: Assistant streaming response (/chat/stream)
        # -------------------------------------------------------------------------
        stream_req = {
            "question": "What is the wildfire smoke advisory and pm2.5 aqi in the Cascades?",
        }
        res7 = client.post("/chat/stream", json=stream_req)
        assert res7.status_code == 200
        raw_chunks = [c.strip() for c in res7.text.split("\n\n") if c.strip()]
        assert "data: [DONE]" in raw_chunks

        parsed_events = []
        for line in raw_chunks:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        # Verify smoke advisory lookup custom event
        lookup_event = next(
            (e for e in parsed_events if e.get("event") == "smoke_advisory_lookup"),
            None,
        )
        assert lookup_event is not None
        assert "smoke_advisory_info" in lookup_event

        # Verify smoke_advisory_info event
        info_event = next(
            (e for e in parsed_events if e.get("event") == "smoke_advisory_info"),
            None,
        )
        assert info_event is not None

        # Verify token streaming events
        token_events = [
            e for e in parsed_events if "chunk" in e or "token" in e or e.get("event") == "token"
        ]
        assert len(token_events) > 0
        full_text = "".join(str(e.get("chunk") or e.get("token", "")) for e in token_events)
        assert len(full_text) > 0

        # Also verify via /api/create_response/stream
        res7_api = client.post("/api/create_response/stream", json=stream_req)
        assert res7_api.status_code == 200
        assert "data: [DONE]" in res7_api.text


@pytest.mark.anyio
async def test_smoke_advisory_journey_real_mode_execution():
    """Step 8: Verifies smoke advisory prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Taylor", "membership": "WildernessPass", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="Pasayten Boundary Fire telemetry indicates high particulate smoke trapping requiring N95 respirators."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the wildfire smoke advisory and air quality at Pasayten Boundary Fire?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "smoke_advisory_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "smoke_advisory_prompt" in call_kwargs
        assert (
            "smoke" in call_kwargs["smoke_advisory_prompt"].lower()
            or "pm2.5" in call_kwargs["smoke_advisory_prompt"].lower()
        )
