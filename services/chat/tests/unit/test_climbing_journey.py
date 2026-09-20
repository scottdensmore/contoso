import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_climbing_journey():
    """Multi-step API journey test for Backcountry Climbing & Alpine Crag Beta Tooling:

    Step 1: Query climbing crags (GET /api/climbing/crags) and verify count and filters.
    Step 2: Query specific crag (GET /api/climbing/crags/index-lower-town-wall) and inspect routes (Godzilla, City Park).
    Step 3: Run rack calculation (POST /api/climbing/rack-calc) for multi-pitch trad.
    Step 4: Retrieve rappel safety protocol (GET /api/climbing/rappel-safety).
    Step 5: Test chat query via create_response verifying climbing_info metadata.
    Step 6: Test SSE streaming via create_response_stream asserting climbing_info event.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query climbing crags (GET /api/climbing/crags)
        # -------------------------------------------------------------------------
        res1 = client.get("/api/climbing/crags")
        assert res1.status_code == 200
        crags = res1.json()
        assert len(crags) == 5
        crag_ids = [c["crag_id"] for c in crags]
        assert "index-lower-town-wall" in crag_ids
        assert "leavenworth-castle-rock" in crag_ids
        assert "vantage-feathers" in crag_ids
        assert "washington-pass-liberty-bell" in crag_ids
        assert "smith-rock-dihedrals" in crag_ids

        # Filter by rock_type
        res1_granite = client.get("/api/climbing/crags?rock_type=Granite")
        assert res1_granite.status_code == 200
        granite_crags = res1_granite.json()
        assert len(granite_crags) >= 2
        assert all("granite" in c["rock_type"].lower() for c in granite_crags)

        # Filter by discipline
        res1_sport = client.get("/api/climbing/crags?discipline=sport")
        assert res1_sport.status_code == 200
        sport_crags = res1_sport.json()
        assert len(sport_crags) >= 2
        assert any(c["crag_id"] == "smith-rock-dihedrals" for c in sport_crags)

        # -------------------------------------------------------------------------
        # Step 2: Query specific crag (GET /api/climbing/crags/index-lower-town-wall)
        # -------------------------------------------------------------------------
        res2 = client.get("/api/climbing/crags/index-lower-town-wall")
        assert res2.status_code == 200
        index_crag = res2.json()
        assert index_crag["crag_id"] == "index-lower-town-wall"
        assert index_crag["rock_type"] == "Granite"
        assert index_crag["helmet_required"] is True
        routes = index_crag["routes"]
        route_names = [r["name"] for r in routes]
        assert "Godzilla" in route_names
        assert "City Park" in route_names

        godzilla = next(r for r in routes if r["name"] == "Godzilla")
        assert godzilla["grade"] == "5.9+"
        assert godzilla["protection_type"] == "trad"
        assert "layback" in godzilla["description"].lower() or "crack" in godzilla["description"].lower()

        # Check 404 for unknown crag
        assert client.get("/api/climbing/crags/unknown-crag-999").status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Run rack calculation (POST /api/climbing/rack-calc) for multi-pitch trad
        # -------------------------------------------------------------------------
        calc_payload = {
            "route_type": "trad",
            "pitches": 3,
            "crux_grade": "5.10a",
            "route_length_ft": 320,
        }
        res3 = client.post("/api/climbing/rack-calc", json=calc_payload)
        assert res3.status_code == 200
        rack_data = res3.json()
        assert "cams_description" in rack_data
        assert "nuts_description" in rack_data
        assert rack_data["slings_count"] >= 10
        assert rack_data["quickdraws_count"] >= 2
        assert rack_data["rope_length_m"] >= 70
        assert rack_data["weight_est_lbs"] > 10.0
        assert len(rack_data["special_gear"]) >= 4

        # -------------------------------------------------------------------------
        # Step 4: Retrieve rappel safety protocol (GET /api/climbing/rappel-safety)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/climbing/rappel-safety")
        assert res4.status_code == 200
        rappel_data = res4.json()
        assert "title" in rappel_data
        assert "pre_rappel_checklist" in rappel_data
        assert len(rappel_data["pre_rappel_checklist"]) >= 3
        assert "backup_systems" in rappel_data
        assert "anchor_evaluation_principles" in rappel_data
        assert "essential_gear" in rappel_data
        assert any("stopper knot" in item.lower() for item in rappel_data["pre_rappel_checklist"])

        # -------------------------------------------------------------------------
        # Step 5: Test chat query via create_response
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What route beta do you have for Godzilla at Index Lower Town Wall?",
            "customer_id": "cust-climb-101",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "climbing_info" in data5
        climb_info = data5["climbing_info"]
        assert climb_info is not None
        assert climb_info["action"] == "crag_detail"
        assert climb_info["crag"]["crag_id"] == "index-lower-town-wall"
        assert "Godzilla" in data5["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Test SSE streaming via create_response_stream
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "What route beta do you have for Godzilla at Index Lower Town Wall?"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        climb_event = next((e for e in parsed_events if e.get("event") == "climbing_info"), None)
        assert climb_event is not None
        assert "climbing_info" in climb_event
        stream_climb_info = climb_event["climbing_info"]
        assert stream_climb_info is not None
        assert stream_climb_info["action"] == "crag_detail"
        assert stream_climb_info["crag"]["crag_id"] == "index-lower-town-wall"

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Godzilla" in full_text or "Index" in full_text


@pytest.mark.anyio
async def test_climbing_journey_real_mode_execution():
    """Verifies climbing prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Alex", "membership": "Gold", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="Godzilla (5.9+) is a classic 110-foot crack at Index Lower Town Wall. Rappel with a 70m rope."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Tell me about climbing Godzilla at Index Lower Town Wall"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "climbing_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "climbing_prompt" in call_kwargs
        assert "Index" in call_kwargs["climbing_prompt"]
