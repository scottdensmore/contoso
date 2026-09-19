import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_wilderness_weather_journey():
    """Multi-step API journey test for Wilderness Weather & Alpine Microclimate Tooling:

    Step 1: Query forecast zones (GET /api/weather/zones) and verify zone count.
    Step 2: Query specific zone (GET /api/weather/zones/mount-rainier) and inspect freezing level & storm warning.
    Step 3: Run microclimate calculation (POST /api/weather/microclimate) for 10,000 ft on exposed ridge.
    Step 4: Retrieve lightning safety protocols (GET /api/weather/protocols).
    Step 5: Test chat query via create_response verifying weather_info metadata.
    Step 6: Test SSE streaming via create_response_stream asserting weather_info event.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query forecast zones (GET /api/weather/zones)
        # -------------------------------------------------------------------------
        res1 = client.get("/api/weather/zones")
        assert res1.status_code == 200
        zones = res1.json()
        assert len(zones) == 5
        zone_ids = [z["zone_id"] for z in zones]
        assert "mount-rainier" in zone_ids
        assert "mount-baker" in zone_ids
        assert "snoqualmie-alpental" in zone_ids
        assert "stevens-crest" in zone_ids
        assert "olympic-hurricane" in zone_ids

        # Query with zone_id filter
        res1_filter = client.get("/api/weather/zones?zone_id=mount-rainier")
        assert res1_filter.status_code == 200
        filtered = res1_filter.json()
        assert len(filtered) == 1
        assert filtered[0]["zone_id"] == "mount-rainier"

        # -------------------------------------------------------------------------
        # Step 2: Query specific zone (GET /api/weather/zones/mount-rainier)
        # -------------------------------------------------------------------------
        res2 = client.get("/api/weather/zones/mount-rainier")
        assert res2.status_code == 200
        rainier = res2.json()
        assert rainier["zone_id"] == "mount-rainier"
        assert rainier["freezing_level_ft"] == 7500
        assert rainier["storm_warning"] is True
        assert rainier["base_elevation_ft"] == 5400
        assert rainier["summit_elevation_ft"] == 14411
        assert rainier["base_temp_f"] == 44.0
        assert rainier["summit_temp_f"] == 12.0
        assert rainier["lightning_risk"] == "moderate"
        assert rainier["wind_speed_mph"] == 25.0
        assert rainier["wind_gust_mph"] == 45.0
        assert rainier["condition"] == "snow_flurries"

        # Check 404 for unknown zone
        assert client.get("/api/weather/zones/unknown-pass-999").status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Run microclimate calculation (POST /api/weather/microclimate)
        # -------------------------------------------------------------------------
        micro_payload = {
            "zone_id": "mount-rainier",
            "target_elevation_ft": 10000.0,
            "exposure_level": "exposed_ridge",
        }
        res3 = client.post("/api/weather/microclimate", json=micro_payload)
        assert res3.status_code == 200
        micro_data = res3.json()
        assert micro_data["zone_id"] == "mount-rainier"
        assert micro_data["target_elevation_ft"] == 10000.0
        assert micro_data["estimated_temp_f"] == pytest.approx(27.9, rel=1e-2)
        assert micro_data["estimated_wind_speed_mph"] == pytest.approx(40.0, rel=1e-2)
        assert micro_data["is_below_freezing"] is True
        assert micro_data["hypothermia_risk"] == "critical"
        assert len(micro_data["layering_advice"]) >= 3
        assert len(micro_data["weather_advisory"]) > 0

        # 404 for non-existent zone
        res3_404 = client.post(
            "/api/weather/microclimate",
            json={"zone_id": "non-existent-zone", "target_elevation_ft": 6000.0},
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Retrieve lightning safety protocols (GET /api/weather/protocols)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/weather/protocols")
        assert res4.status_code == 200
        proto_data = res4.json()
        assert "title" in proto_data
        assert "lightning_safety" in proto_data
        assert "whiteout_navigation" in proto_data

        # -------------------------------------------------------------------------
        # Step 5: Test chat query via create_response
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the weather forecast and freezing level at Mount Rainier?",
            "customer_id": "cust-weather-101",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "weather_info" in data5
        w_info = data5["weather_info"]
        assert w_info is not None
        assert "action" in w_info
        assert "Mount Rainier" in data5["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Test SSE streaming via create_response_stream
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={"question": "What is the weather forecast and freezing level at Mount Rainier?"},
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        w_event = next((e for e in parsed_events if e.get("event") == "weather_info"), None)
        assert w_event is not None
        assert "weather_info" in w_event
        stream_w_info = w_event["weather_info"]
        assert stream_w_info is not None
        assert "action" in stream_w_info

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Mount Rainier" in full_text


@pytest.mark.anyio
async def test_weather_journey_real_mode_execution():
    """Verifies weather prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value={"firstName": "Alex", "membership": "Platinum", "orders": []}),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search_service,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(
            return_value="Mount Rainier has an active storm warning with freezing level at 7,500 ft and heavy snow flurries."
        ),
    ) as mock_llm, patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response",
            json={"question": "What is the weather forecast and freezing level for Mount Rainier?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "weather_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "weather_prompt" in call_kwargs
        assert "Weather" in call_kwargs["weather_prompt"]
        assert "Mount Rainier" in call_kwargs["weather_prompt"]
