import json
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_mountain_weather_journey():
    """Multi-step API journey test for High-Altitude Mountain Weather Routing & Jet Stream Tooling:

    Step 1: Query sectors catalog and synoptic level filter (GET /mountain-weather/sectors).
    Step 2: Query specific sector detail (GET /mountain-weather/sectors/{sector_id}).
    Step 3: Post calculation request (POST /mountain-weather/calculate).
    Step 4: Query mandatory mountain weather gear checklist (GET /mountain-weather/gear).
    Step 5: Post chat query to create_response and verify mountain_weather_info metadata.
    Step 6: Post chat query to create_response/stream and assert SSE event mountain_weather_info.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query sectors catalog and filter
        # -------------------------------------------------------------------------
        res1 = client.get("/mountain-weather/sectors")
        if res1.status_code == 404:
            res1 = client.get("/api/mountain-weather/sectors")
        assert res1.status_code == 200
        sectors = res1.json()
        assert len(sectors) == 5
        sector_ids = [s["sector_id"] for s in sectors]
        assert "denali-south-buttress" in sector_ids
        assert "mount-washington-ridge" in sector_ids
        assert "rainier-columbia-crest" in sector_ids
        assert "everest-south-col" in sector_ids
        assert "matterhorn-hornli-ridge" in sector_ids

        # Filter synoptic_level=600mb
        res1_600 = client.get("/mountain-weather/sectors?synoptic_level=600mb")
        if res1_600.status_code == 404:
            res1_600 = client.get("/api/mountain-weather/sectors?synoptic_level=600mb")
        assert res1_600.status_code == 200
        sectors_600 = res1_600.json()
        assert len(sectors_600) == 2
        assert all(s["synoptic_level"] == "600mb" for s in sectors_600)

        # -------------------------------------------------------------------------
        # Step 2: Query specific sector detail
        # -------------------------------------------------------------------------
        res2 = client.get("/mountain-weather/sectors/denali-south-buttress")
        if res2.status_code == 404:
            res2 = client.get("/api/mountain-weather/sectors/denali-south-buttress")
        assert res2.status_code == 200
        denali = res2.json()
        assert denali["sector_id"] == "denali-south-buttress"
        assert "Denali" in denali["title"]
        assert denali["elevation_m"] == 6190
        assert denali["venturi_multiplier"] == 2.2
        assert denali["synoptic_level"] == "500mb"
        assert len(denali["highlights"]) == 3

        # 404 for unknown sector
        res2_404 = client.get("/mountain-weather/sectors/k2-abruzzi-spur")
        if res2_404.status_code != 404:
            res2_404 = client.get("/api/mountain-weather/sectors/k2-abruzzi-spur")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Post calculation request
        # -------------------------------------------------------------------------
        calc_payload = {
            "sector_id": "denali-south-buttress",
            "baseline_wind_mph": 25.0,
            "barometric_drop_hpa": 2.8,
            "jet_stream_offset_km": 60,
            "air_temp_f": 5.0,
        }
        res3 = client.post("/mountain-weather/calculate", json=calc_payload)
        if res3.status_code == 404:
            res3 = client.post("/api/mountain-weather/calculate", json=calc_payload)
        assert res3.status_code == 200
        calc_data = res3.json()
        assert calc_data["sector_id"] == "denali-south-buttress"
        assert calc_data["elevation_m"] == 6190
        # summit_wind_mph = round(25 * 2.2 + (100 - 60) * 0.25) = round(55 + 10) = 65
        assert calc_data["summit_wind_mph"] == 65
        assert calc_data["barometric_trend"] == "rapid_storm_warning"
        assert calc_data["summit_window_status"] == "abort_severe_winds_whiteout"
        assert "Denali" in calc_data["route_advisory"]

        # -------------------------------------------------------------------------
        # Step 4: Query mandatory mountain weather gear checklist
        # -------------------------------------------------------------------------
        res4 = client.get("/mountain-weather/gear")
        if res4.status_code == 404:
            res4 = client.get("/api/mountain-weather/gear")
        assert res4.status_code == 200
        gear_list = res4.json()
        assert len(gear_list) == 6
        gear_ids = [g["item_id"] for g in gear_list]
        assert "barometric-altimeter-watch" in gear_ids
        assert "ultralight-anemometer" in gear_ids
        assert "satellite-synoptic-inreach" in gear_ids
        assert "aviation-synoptic-chart" in gear_ids
        assert "thermal-face-mask-goggles" in gear_ids
        assert "emergency-hypothermia-bivy" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Post chat query to create_response and verify mountain_weather_info
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "Calculate venturi wind multiplier and summit window advisory for Denali South Buttress",
            "customer_id": "cust-climber-01",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "mountain_weather_info" in data5
        mw_info = data5["mountain_weather_info"]
        assert mw_info is not None
        assert "Denali" in data5["answer"] or "denali" in data5["answer"].lower()

        # -------------------------------------------------------------------------
        # Step 6: Post chat query to create_response/stream and assert SSE event
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "What is the 500mb jet stream forecast for Denali South Buttress?"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        mw_event = next(
            (e for e in parsed_events if e.get("event") in ("mountain_weather_info", "mountain_weather_sector_detail")),
            None,
        )
        assert mw_event is not None
        assert "mountain_weather_info" in mw_event
        stream_mw_info = mw_event["mountain_weather_info"]
        assert stream_mw_info is not None

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Denali" in full_text or "denali" in full_text.lower()


@pytest.mark.anyio
async def test_mountain_weather_journey_real_mode_execution():
    """Step 7: Verifies mountain weather prompt injection and payload parity in real LLM mode."""
    from unittest.mock import AsyncMock, MagicMock

    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Alex", "membership": "Summit", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="The 500mb synoptic analysis for Denali South Buttress indicates severe jet stream venturi compression."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the 500mb jet stream forecast for Denali South Buttress?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "mountain_weather_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "mountain_weather_prompt" in call_kwargs
        assert "Mountain Weather" in call_kwargs["mountain_weather_prompt"]
