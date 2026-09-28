import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_weather_station_journey():
    """Multi-step API journey test for Alpine Weather Station Telemetry & Anemometry Tooling:

    Step 1: Health & readiness check (/healthz, /ready, /api/status).
    Step 2: List stations (/api/weather-station/stations), filter by alpine_zone.
    Step 3: Fetch specific station detail (/api/weather-station/stations/everest-south-col-station) and 404.
    Step 4: Post calculate dynamics (/api/weather-station/calculate) and 404 for unknown station.
    Step 5: Get gear checklist (/api/weather-station/gear).
    Step 6: Test create_response endpoint with mock client, verifying weather_station_info in response payload.
    Step 7: Test create_response/stream SSE endpoint verifying SSE data events (weather_station_lookup / weather_station_calculated and weather_station_info).
    """
    # -------------------------------------------------------------------------
    # Step 1: Health & readiness check
    # -------------------------------------------------------------------------
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
        # Step 2: List stations (/api/weather-station/stations), filter by alpine_zone
        # -------------------------------------------------------------------------
        res2 = client.get("/api/weather-station/stations")
        assert res2.status_code == 200
        stations = res2.json()
        assert len(stations) == 5
        station_ids = [s["station_id"] for s in stations]
        assert "everest-south-col-station" in station_ids
        assert "denali-football-field-station" in station_ids
        assert "mount-washington-observatory" in station_ids
        assert "matterhorn-solvay-station" in station_ids
        assert "aconcagua-colera-high-camp" in station_ids

        # Also test without /api prefix
        res2_no_prefix = client.get("/weather-station/stations")
        assert res2_no_prefix.status_code == 200
        assert len(res2_no_prefix.json()) == 5

        # Filter by alpine_zone=high_altitude_col
        res2_filt = client.get("/api/weather-station/stations?alpine_zone=high_altitude_col")
        assert res2_filt.status_code == 200
        filt_stations = res2_filt.json()
        assert len(filt_stations) == 2
        filt_ids = [s["station_id"] for s in filt_stations]
        assert "everest-south-col-station" in filt_ids
        assert "aconcagua-colera-high-camp" in filt_ids

        # -------------------------------------------------------------------------
        # Step 3: Fetch specific station detail & 404 for unknown
        # -------------------------------------------------------------------------
        res3 = client.get("/api/weather-station/stations/everest-south-col-station")
        assert res3.status_code == 200
        detail = res3.json()
        assert detail["station_id"] == "everest-south-col-station"
        assert detail["title"] == "Everest South Col Alpine Weather Station"
        assert detail["elevation_m"] == 7945
        assert detail["alpine_zone"] == "high_altitude_col"
        assert len(detail["highlights"]) >= 3

        res3_no_prefix = client.get("/weather-station/stations/everest-south-col-station")
        assert res3_no_prefix.status_code == 200
        assert res3_no_prefix.json()["station_id"] == "everest-south-col-station"

        # 404 for nonexistent station
        res3_404 = client.get("/api/weather-station/stations/nonexistent-station")
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Post calculate dynamics & 404 for unknown station
        # -------------------------------------------------------------------------
        calc_payload = {
            "station_id": "everest-south-col-station",
            "ambient_temp_c": -18.0,
            "wind_speed_kph": 65.0,
            "solar_irradiance_wm2": 450.0,
            "rime_icing_probability_percent": 25.0,
        }
        res4 = client.post("/api/weather-station/calculate", json=calc_payload)
        assert res4.status_code == 200
        calc_data = res4.json()
        assert calc_data["station_id"] == "everest-south-col-station"
        assert calc_data["battery_discharge_rate_w"] == 25
        assert calc_data["wind_dynamic_pressure_nm2"] == 78
        assert calc_data["telemetry_status"] == "advisory_rime_icing_detected"

        res4_no_prefix = client.post("/weather-station/calculate", json=calc_payload)
        assert res4_no_prefix.status_code == 200
        assert res4_no_prefix.json()["station_id"] == "everest-south-col-station"

        # 404 for invalid station in calculate
        res4_404 = client.post("/api/weather-station/calculate", json={"station_id": "invalid-station"})
        assert res4_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 5: Get gear checklist (/api/weather-station/gear)
        # -------------------------------------------------------------------------
        res5 = client.get("/api/weather-station/gear")
        assert res5.status_code == 200
        gear_items = res5.json()
        assert len(gear_items) == 6
        gear_ids = [g["item_id"] for g in gear_items]
        assert "heated-sonic-anemometer-sensor" in gear_ids
        assert "arctic-lifepo4-battery-pack" in gear_ids
        assert "iridium-satellite-burst-transceiver" in gear_ids
        assert "titanium-guywire-mast-anchors" in gear_ids
        assert "anti-rime-hydrophobic-dome" in gear_ids
        assert "lightning-dissipation-ground-rod" in gear_ids

        res5_no_prefix = client.get("/weather-station/gear")
        assert res5_no_prefix.status_code == 200
        assert len(res5_no_prefix.json()) == 6

        # -------------------------------------------------------------------------
        # Step 6: Test create_response endpoint with mock client
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "Calculate alpine weather station telemetry dynamics for Everest South Col",
            "customer_id": "cust-weather-station-101",
        }
        res6 = client.post("/api/create_response", json=chat_req)
        assert res6.status_code == 200
        data6 = res6.json()
        assert "weather_station_info" in data6
        ws_info = data6["weather_station_info"]
        assert ws_info is not None
        assert "answer" in data6
        assert len(data6["answer"]) > 0

        # -------------------------------------------------------------------------
        # Step 7: Test create_response/stream SSE endpoint
        # -------------------------------------------------------------------------
        stream_req_calc = {
            "question": "Calculate weather station battery discharge and wind dynamic pressure for Everest South Col",
        }
        res7_calc = client.post("/api/create_response/stream", json=stream_req_calc)
        assert res7_calc.status_code == 200
        raw_chunks = [c.strip() for c in res7_calc.text.split("\n\n") if c.strip()]
        assert "data: [DONE]" in raw_chunks

        parsed_events = []
        for line in raw_chunks:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        # Verify custom calculation event
        calc_event = next(
            (e for e in parsed_events if e.get("event") in ("weather_station_calculated", "calculate")),
            None,
        )
        assert calc_event is not None
        assert "weather_station_info" in calc_event

        # Verify weather_station_info event
        info_event = next(
            (e for e in parsed_events if e.get("event") == "weather_station_info"),
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

        # Verify lookup custom event
        stream_req_lookup = {
            "question": "Tell me about the Mount Washington observatory alpine weather station and heated anemometer",
        }
        res7_lookup = client.post("/api/create_response/stream", json=stream_req_lookup)
        assert res7_lookup.status_code == 200
        raw_chunks_lookup = [c.strip() for c in res7_lookup.text.split("\n\n") if c.strip()]
        assert "data: [DONE]" in raw_chunks_lookup

        parsed_lookup = []
        for line in raw_chunks_lookup:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_lookup.append(json.loads(line.removeprefix("data: ")))

        lookup_event = next(
            (e for e in parsed_lookup if e.get("event") == "weather_station_lookup"),
            None,
        )
        assert lookup_event is not None
        assert "weather_station_info" in lookup_event


@pytest.mark.anyio
async def test_weather_station_journey_real_mode_execution():
    """Step 8: Verifies weather station prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Alex", "membership": "AlpineClub", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="Everest South Col weather station requires heated ultrasonic anemometers and titanium guy-wire rigging."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Calculate alpine weather station telemetry dynamics for Everest South Col"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "weather_station_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "weather_station_prompt" in call_kwargs
        assert (
            "weather station" in call_kwargs["weather_station_prompt"].lower()
            or "anemometer" in call_kwargs["weather_station_prompt"].lower()
        )
