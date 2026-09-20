import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_stargazing_journey():
    """Multi-step API journey test for Celestial & Dark Sky Observation Tooling:

    Step 1: Query dark sky sites list (GET /api/stargazing/sites).
    Step 2: Query specific site detail (GET /api/stargazing/sites/prineville-reservoir).
    Step 3: Run viewing window calculation (POST /api/stargazing/viewing-window).
    Step 4: Retrieve meteor shower calendar (GET /api/stargazing/meteor-showers).
    Step 5: Test chat query via create_response verifying stargazing_info metadata.
    Step 6: Test SSE streaming via create_response_stream asserting stargazing_info event.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query dark sky sites list (GET /api/stargazing/sites)
        # -------------------------------------------------------------------------
        res1 = client.get("/api/stargazing/sites")
        assert res1.status_code == 200
        sites = res1.json()
        assert len(sites) == 5
        site_ids = [s["site_id"] for s in sites]
        assert "prineville-reservoir" in site_ids
        assert "artist-point-baker" in site_ids
        assert "john-day-fossil" in site_ids
        assert "copper-ridge-cascades" in site_ids
        assert "crater-lake-rim" in site_ids

        # Filter by bortle_max
        res1_bortle = client.get("/api/stargazing/sites?bortle_max=1")
        assert res1_bortle.status_code == 200
        bortle_1_sites = res1_bortle.json()
        assert len(bortle_1_sites) >= 2
        for s in bortle_1_sites:
            assert s["bortle_class"] <= 1

        # -------------------------------------------------------------------------
        # Step 2: Query specific site detail (GET /api/stargazing/sites/prineville-reservoir)
        # -------------------------------------------------------------------------
        res2 = client.get("/api/stargazing/sites/prineville-reservoir")
        assert res2.status_code == 200
        prineville = res2.json()
        assert prineville["site_id"] == "prineville-reservoir"
        assert "Prineville Reservoir" in prineville["name"]
        assert prineville["region"] == "Central Oregon"
        assert prineville["bortle_class"] in (1, 2)
        assert prineville["sqm_reading"] >= 21.0
        assert prineville["elevation_ft"] == 3230
        assert "summer" in prineville["best_seasons"]
        assert prineville["overnight_camping"] is True
        assert len(prineville["featured_targets"]) > 0

        # Check 404 for unknown site
        res2_404 = client.get("/api/stargazing/sites/unknown-sanctuary-999")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Run viewing window calculation (POST /api/stargazing/viewing-window)
        # -------------------------------------------------------------------------
        calc_payload = {
            "site_id": "prineville-reservoir",
            "moon_phase": "new_moon",
            "cloud_cover_percent": 5,
            "target_type": "milky_way",
        }
        res3 = client.post("/api/stargazing/viewing-window", json=calc_payload)
        assert res3.status_code == 200
        calc_data = res3.json()
        assert calc_data["site_id"] == "prineville-reservoir"
        assert "Prineville" in calc_data["site_name"]
        assert calc_data["score"] >= 80
        assert calc_data["viewing_quality"] in ("Optimal", "Excellent")
        assert len(calc_data["reasons"]) >= 2
        assert any(term in calc_data["recommended_optics"].lower() for term in ["lens", "tripod", "binocular", "optics"])
        assert any(term in calc_data["dark_adaptation_advice"].lower() for term in ["dark adaptation", "red", "vision"])

        # 404 for non-existent site
        res3_404 = client.post(
            "/api/stargazing/viewing-window",
            json={"site_id": "unknown-sanctuary-999"},
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Retrieve meteor shower calendar (GET /api/stargazing/meteor-showers)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/stargazing/meteor-showers")
        assert res4.status_code == 200
        showers = res4.json()
        assert len(showers) == 4
        shower_ids = {s["shower_id"] for s in showers}
        assert shower_ids == {"perseids", "geminids", "orionids", "lyrids"}
        perseids = next(s for s in showers if s["shower_id"] == "perseids")
        assert "Perseid" in perseids["name"]
        assert perseids["zhr_rate"] >= 80

        # -------------------------------------------------------------------------
        # Step 5: Test chat query via create_response
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "Calculate the stargazing viewing window and conditions for Prineville Reservoir with new moon",
            "customer_id": "cust-star-001",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "stargazing_info" in data5
        st_info = data5["stargazing_info"]
        assert st_info is not None
        assert st_info["action"] == "calculate_viewing"
        assert st_info["site_id"] == "prineville-reservoir"
        assert "Prineville" in data5["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Test SSE streaming via create_response_stream
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={"question": "Calculate the stargazing viewing window and conditions for Prineville Reservoir with new moon"},
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        st_event = next((e for e in parsed_events if e.get("event") == "stargazing_info"), None)
        assert st_event is not None
        assert "stargazing_info" in st_event
        stream_st_info = st_event["stargazing_info"]
        assert stream_st_info is not None
        assert stream_st_info["action"] == "calculate_viewing"
        assert stream_st_info["site_id"] == "prineville-reservoir"

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Prineville" in full_text


@pytest.mark.anyio
async def test_stargazing_journey_real_mode_execution():
    """Step 7: Verifies stargazing prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value={"firstName": "Stella", "membership": "Platinum", "orders": []}),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search_service,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(
            return_value="Prineville Reservoir has Bortle 1 darkness with optimal conditions for Milky Way observation."
        ),
    ) as mock_llm, patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response",
            json={"question": "Calculate the stargazing viewing window and conditions for Prineville Reservoir with new moon"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "stargazing_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "stargazing_prompt" in call_kwargs
        assert "Prineville" in call_kwargs["stargazing_prompt"]
