import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_whitewater_journey():
    """Multi-step API journey test for Wilderness Waterway & Whitewater Tooling:

    Step 1: Query river runs (GET /api/whitewater/runs).
    Step 2: Retrieve specific run detail (GET /api/whitewater/runs/skykomish-boulder-drop).
    Step 3: Run safety evaluation (POST /api/whitewater/safety-eval) for intermediate paddler on Class IV.
    Step 4: Retrieve river safety protocols (GET /api/whitewater/protocols).
    Step 5: Test chat query via create_response verifying whitewater_info metadata.
    Step 6: Test SSE streaming via create_response_stream asserting whitewater_info event.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query river runs (GET /api/whitewater/runs)
        # -------------------------------------------------------------------------
        res1 = client.get("/api/whitewater/runs")
        assert res1.status_code == 200
        runs = res1.json()
        assert len(runs) == 5
        run_ids = [r["run_id"] for r in runs]
        assert "wenatchee-tumwater" in run_ids
        assert "skykomish-boulder-drop" in run_ids
        assert "white-salmon-husum" in run_ids
        assert "snoqualmie-middle-fork" in run_ids
        assert "deschutes-maupin" in run_ids

        # Filter by class_rating
        res1_class = client.get("/api/whitewater/runs?class_rating=Class IV")
        assert res1_class.status_code == 200
        class_iv_runs = res1_class.json()
        assert any(r["run_id"] == "skykomish-boulder-drop" for r in class_iv_runs)

        # Filter by region
        res1_region = client.get("/api/whitewater/runs?region=Oregon")
        assert res1_region.status_code == 200
        or_runs = res1_region.json()
        assert len(or_runs) == 1
        assert or_runs[0]["run_id"] == "deschutes-maupin"

        # -------------------------------------------------------------------------
        # Step 2: Retrieve specific run detail (GET /api/whitewater/runs/skykomish-boulder-drop)
        # -------------------------------------------------------------------------
        res2 = client.get("/api/whitewater/runs/skykomish-boulder-drop")
        assert res2.status_code == 200
        sky = res2.json()
        assert sky["run_id"] == "skykomish-boulder-drop"
        assert sky["river"] == "Skykomish River"
        assert sky["class_rating"] == "Class IV"
        assert sky["length_miles"] == 8.5
        assert sky["current_flow_cfs"] == 3400
        assert sky["min_runnable_cfs"] == 1500
        assert sky["max_runnable_cfs"] == 9000
        assert sky["flow_status"] == "Optimal Medium"
        assert sky["water_temp_f"] == 46.0
        assert sky["gauge_station_id"] == "USGS-12134500"
        assert len(sky["key_rapids"]) >= 1

        # Check 404 for unknown run
        assert client.get("/api/whitewater/runs/unknown-run-999").status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Run safety evaluation (POST /api/whitewater/safety-eval)
        # -------------------------------------------------------------------------
        safety_payload = {
            "run_id": "skykomish-boulder-drop",
            "craft": "kayak",
            "paddler_skill": "intermediate",
            "flow_cfs": 3400,
        }
        res3 = client.post("/api/whitewater/safety-eval", json=safety_payload)
        assert res3.status_code == 200
        safety_data = res3.json()
        assert safety_data["run_id"] == "skykomish-boulder-drop"
        assert safety_data["flow_status"] == "Optimal Medium"
        assert safety_data["is_runnable"] is True
        assert safety_data["suitability"] == "not_recommended"
        assert "intermediate" in safety_data["recommendation_text"].lower()
        assert safety_data["cold_water_immersion_warning"] is True
        assert len(safety_data["required_gear"]) >= 4
        assert len(safety_data["safety_checklist"]) >= 3

        # 404 for non-existent run
        res3_404 = client.post(
            "/api/whitewater/safety-eval",
            json={"run_id": "non-existent-run"},
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Retrieve river safety protocols (GET /api/whitewater/protocols)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/whitewater/protocols")
        assert res4.status_code == 200
        protocols_data = res4.json()
        assert "title" in protocols_data
        assert "defensive_swimming_position" in protocols_data
        assert len(protocols_data["defensive_swimming_position"]) >= 2
        assert "strainer_hazards" in protocols_data
        assert "river_rescue_protocols" in protocols_data
        assert "cold_water_immersion_rules" in protocols_data
        assert "essential_gear" in protocols_data

        # -------------------------------------------------------------------------
        # Step 5: Test chat query via create_response
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "Can an intermediate paddler safely kayak Skykomish Boulder Drop right now?",
            "customer_id": "cust-ww-201",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "whitewater_info" in data5
        ww_info = data5["whitewater_info"]
        assert ww_info is not None
        assert ww_info["run_id"] == "skykomish-boulder-drop"
        assert "Skykomish" in data5["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Test SSE streaming via create_response_stream
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Can an intermediate paddler safely kayak Skykomish Boulder Drop right now?"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        ww_event = next((e for e in parsed_events if e.get("event") == "whitewater_info"), None)
        assert ww_event is not None
        assert "whitewater_info" in ww_event
        stream_ww_info = ww_event["whitewater_info"]
        assert stream_ww_info is not None
        assert stream_ww_info["run_id"] == "skykomish-boulder-drop"

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Skykomish" in full_text


@pytest.mark.anyio
async def test_whitewater_journey_real_mode_execution():
    """Verifies whitewater prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Morgan", "membership": "Platinum", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="Skykomish Boulder Drop is Class IV and flow is currently 3400 cfs, which is not recommended for intermediate paddlers."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Can an intermediate paddler safely kayak Skykomish Boulder Drop right now?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "whitewater_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "whitewater_prompt" in call_kwargs
        assert "Skykomish" in call_kwargs["whitewater_prompt"]
