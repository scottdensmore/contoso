import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_ski_touring_journey():
    """Multi-step API journey test for Backcountry Ski Touring & Splitboard Tooling:

    Step 1: Query ski tour routes (GET /api/ski-touring/routes) and verify routes.
    Step 2: Retrieve specific route detail (GET /api/ski-touring/routes/muir-snowfield).
    Step 3: Run skinning pace calculation (POST /api/ski-touring/pace-calc) for moderate fitness on firm snow.
    Step 4: Retrieve skin track etiquette and uphill policies (GET /api/ski-touring/etiquette).
    Step 5: Test chat query via create_response verifying ski_tour_info metadata.
    Step 6: Test SSE streaming via create_response_stream asserting ski_tour_info event.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query ski tour routes (GET /api/ski-touring/routes)
        # -------------------------------------------------------------------------
        res1 = client.get("/api/ski-touring/routes")
        assert res1.status_code == 200
        routes = res1.json()
        assert len(routes) == 5
        route_ids = [r["route_id"] for r in routes]
        assert "muir-snowfield" in route_ids
        assert "kendal-lakes" in route_ids
        assert "artist-point-table" in route_ids
        assert "silver-basin" in route_ids
        assert "blewett-pass-diamond" in route_ids

        # Filter by difficulty
        res1_diff = client.get("/api/ski-touring/routes?difficulty=advanced")
        assert res1_diff.status_code == 200
        diff_routes = res1_diff.json()
        assert len(diff_routes) == 2
        assert {r["route_id"] for r in diff_routes} == {"muir-snowfield", "silver-basin"}

        # Filter by zone
        res1_zone = client.get("/api/ski-touring/routes?zone=volcano_alpine")
        assert res1_zone.status_code == 200
        zone_routes = res1_zone.json()
        assert len(zone_routes) == 1
        assert zone_routes[0]["route_id"] == "muir-snowfield"

        # -------------------------------------------------------------------------
        # Step 2: Retrieve specific route detail (GET /api/ski-touring/routes/muir-snowfield)
        # -------------------------------------------------------------------------
        res2 = client.get("/api/ski-touring/routes/muir-snowfield")
        assert res2.status_code == 200
        muir = res2.json()
        assert muir["route_id"] == "muir-snowfield"
        assert muir["name"] == "Camp Muir Snowfield"
        assert muir["region"] == "Mount Rainier National Park"
        assert muir["zone"] == "volcano_alpine"
        assert muir["difficulty"] == "advanced"
        assert muir["distance_miles"] == 9.0
        assert muir["elevation_gain_ft"] == 4600
        assert muir["max_elevation_ft"] == 10080
        assert muir["avg_uphill_hours"] == 4.5
        assert muir["avalanche_terrain_rating"] == "challenging"

        # Check 404 for unknown route
        assert client.get("/api/ski-touring/routes/unknown-route-999").status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Run skinning pace calculation (POST /api/ski-touring/pace-calc)
        # -------------------------------------------------------------------------
        pace_payload = {
            "route_id": "muir-snowfield",
            "fitness_level": "moderate",
            "snow_condition": "firm_skin_track",
            "party_size": 2,
        }
        res3 = client.post("/api/ski-touring/pace-calc", json=pace_payload)
        assert res3.status_code == 200
        pace_data = res3.json()
        assert pace_data["route_id"] == "muir-snowfield"
        assert pace_data["vertical_feet_per_hour"] == 1120
        assert pace_data["estimated_uphill_minutes"] == 246
        assert pace_data["estimated_descent_minutes"] == 72
        assert pace_data["total_tour_minutes"] == 338
        assert pace_data["transition_count"] == 2
        assert pace_data["recommended_turnaround_time"] == "11:06"
        assert pace_data["hydration_liters"] == 3.9
        assert pace_data["calories_burned"] == 2214
        assert len(pace_data["gear_recommendations"]) >= 4

        # 404 for non-existent route
        res3_404 = client.post(
            "/api/ski-touring/pace-calc",
            json={"route_id": "non-existent-tour"},
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Retrieve skin track etiquette and uphill policies (GET /api/ski-touring/etiquette)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/ski-touring/etiquette")
        assert res4.status_code == 200
        etiquette_data = res4.json()
        assert "title" in etiquette_data
        assert "skin_track_etiquette" in etiquette_data
        assert len(etiquette_data["skin_track_etiquette"]) >= 4
        assert "resort_uphill_policies" in etiquette_data
        assert "splitboard_transition_tips" in etiquette_data

        # -------------------------------------------------------------------------
        # Step 5: Test chat query via create_response
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the skinning pace and uphill time for Camp Muir Snowfield?",
            "customer_id": "cust-ski-101",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "ski_tour_info" in data5
        st_info = data5["ski_tour_info"]
        assert st_info is not None
        assert st_info["route_id"] == "muir-snowfield"
        assert "Camp Muir" in data5["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Test SSE streaming via create_response_stream
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={"question": "What is the skinning pace and uphill time for Camp Muir Snowfield?"},
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        st_event = next((e for e in parsed_events if e.get("event") == "ski_tour_info"), None)
        assert st_event is not None
        assert "ski_tour_info" in st_event
        stream_st_info = st_event["ski_tour_info"]
        assert stream_st_info is not None
        assert stream_st_info["route_id"] == "muir-snowfield"

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Camp Muir" in full_text


@pytest.mark.anyio
async def test_ski_touring_journey_real_mode_execution():
    """Verifies ski touring prompt injection and payload parity in real LLM mode."""
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
            return_value="Camp Muir Snowfield ascent is estimated at 246 minutes with 4600 ft vert gain."
        ),
    ) as mock_llm, patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response",
            json={"question": "What is the skinning pace and uphill time for Camp Muir Snowfield?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "ski_tour_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "ski_tour_prompt" in call_kwargs
        assert "Camp Muir" in call_kwargs["ski_tour_prompt"]
