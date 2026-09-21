import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_mountaineering_journey():
    """Multi-step API journey test for Glaciated Peak Technical Outfitting Tooling:

    Step 1: Query mountaineering routes with grade filter (GET /api/mountaineering/routes).
    Step 2: Query specific route detail (GET /api/mountaineering/routes/rainier-disappointment-cleaver).
    Step 3: Post to rope team plan endpoint (POST /api/mountaineering/rope-team-plan).
    Step 4: Query mandatory gear checklist (GET /api/mountaineering/gear-checklist).
    Step 5: Post chat query to create_response and verify mountaineering_info metadata.
    Step 6: Post chat query to create_response/stream and assert SSE event mountaineering_info.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query mountaineering routes with grade filter
        # -------------------------------------------------------------------------
        res1 = client.get("/api/mountaineering/routes")
        assert res1.status_code == 200
        routes = res1.json()
        assert len(routes) == 5
        route_ids = [r["route_id"] for r in routes]
        assert "rainier-disappointment-cleaver" in route_ids
        assert "baker-coleman-deming" in route_ids
        assert "shasta-avalanche-gulch" in route_ids
        assert "hood-south-side-pearly-gates" in route_ids
        assert "olympus-blue-glacier" in route_ids

        # Filter by grade
        res1_grade = client.get("/api/mountaineering/routes?grade=grade_iii")
        assert res1_grade.status_code == 200
        grade_iii_routes = res1_grade.json()
        assert len(grade_iii_routes) == 1
        assert grade_iii_routes[0]["route_id"] == "rainier-disappointment-cleaver"

        # -------------------------------------------------------------------------
        # Step 2: Query specific route detail (GET /api/mountaineering/routes/{route_id})
        # -------------------------------------------------------------------------
        res2 = client.get("/api/mountaineering/routes/rainier-disappointment-cleaver")
        assert res2.status_code == 200
        rainier = res2.json()
        assert rainier["route_id"] == "rainier-disappointment-cleaver"
        assert rainier["peak_name"] == "Mount Rainier"
        assert rainier["route_name"] == "Disappointment Cleaver"
        assert rainier["elevation_ft"] == 14411
        assert rainier["vertical_gain_ft"] == 9000
        assert rainier["glacier_grade"] == "grade_iii"
        assert rainier["crevasse_risk"] == "extreme"
        assert rainier["recommended_team_size"] == 3
        assert rainier["recommended_rope_length_m"] == 60
        assert len(rainier["crux_features"]) >= 3

        # 404 for unknown route
        res2_404 = client.get("/api/mountaineering/routes/unknown-route")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Post to rope team plan endpoint (POST /api/mountaineering/rope-team-plan)
        # -------------------------------------------------------------------------
        plan_req = {
            "route_id": "rainier-disappointment-cleaver",
            "team_members_count": 3,
            "snowpack_firmness": "dense_firn",
            "rescue_haul_system": "z_pulley_3_to_1",
        }
        res3 = client.post("/api/mountaineering/rope-team-plan", json=plan_req)
        assert res3.status_code == 200
        plan_data = res3.json()
        assert plan_data["route_id"] == "rainier-disappointment-cleaver"
        assert "Rainier" in plan_data["peak_and_route"]
        assert plan_data["rope_spacing_meters"] == 12.0
        assert plan_data["brake_knots_required"] is True
        assert plan_data["snow_pickets_required"] >= 3
        assert plan_data["prerigged_prusiks_count"] == 6
        assert "3:1" in plan_data["mechanical_advantage"]
        assert plan_data["turnaround_time_hours"] > 0

        # 404 for invalid route
        res3_404 = client.post(
            "/api/mountaineering/rope-team-plan", json={"route_id": "invalid-route"}
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Query mandatory gear checklist (GET /api/mountaineering/gear-checklist)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/mountaineering/gear-checklist")
        assert res4.status_code == 200
        gear_list = res4.json()
        assert len(gear_list) == 6
        gear_ids = [g["item_id"] for g in gear_list]
        assert "ice-axe-steel" in gear_ids
        assert "crampons-steel-12pt" in gear_ids
        assert "dry-rope-glacier" in gear_ids
        assert "crevasse-rescue-kit" in gear_ids
        assert "snow-picket-aluminum" in gear_ids
        assert "climbing-helmet-glacier" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Post chat query to create_response and verify mountaineering_info
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the recommended rope team spacing and do I need brake knots for Disappointment Cleaver on Rainier?",
            "customer_id": "cust-glacier-101",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "mountaineering_info" in data5
        m_info = data5["mountaineering_info"]
        assert m_info is not None
        assert m_info["route_id"] == "rainier-disappointment-cleaver"
        assert "Rainier" in data5["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Post chat query to create_response/stream and assert SSE event
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "What is the recommended rope team spacing and do I need brake knots for Disappointment Cleaver on Rainier?"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        m_event = next((e for e in parsed_events if e.get("event") == "mountaineering_info"), None)
        assert m_event is not None
        assert "mountaineering_info" in m_event
        stream_m_info = m_event["mountaineering_info"]
        assert stream_m_info is not None
        assert stream_m_info["route_id"] == "rainier-disappointment-cleaver"

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Rainier" in full_text


@pytest.mark.anyio
async def test_mountaineering_journey_real_mode_execution():
    """Step 7: Verifies mountaineering prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Alex", "membership": "Diamond", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="For Mount Rainier via Disappointment Cleaver, maintain 12m rope spacing and use brake knots due to extreme crevasse hazard."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the recommended rope team spacing and do I need brake knots for Disappointment Cleaver on Rainier?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "mountaineering_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "mountaineering_prompt" in call_kwargs
        assert "Rainier" in call_kwargs["mountaineering_prompt"]
