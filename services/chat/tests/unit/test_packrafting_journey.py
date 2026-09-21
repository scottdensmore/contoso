import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_packrafting_journey():
    """Multi-step API journey test for Backcountry Packrafting River Expedition Outfitting Tooling:

    Step 1: Query packraft routes with river grade filter (GET /api/packrafting/routes).
    Step 2: Query specific route detail (GET /api/packrafting/routes/frank-church-middle-fork-salmon).
    Step 3: Post to packraft plan calculation endpoint (POST /api/packrafting/plan).
    Step 4: Query mandatory packraft gear checklist (GET /api/packrafting/gear-checklist).
    Step 5: Post chat query to create_response and verify packrafting_info metadata.
    Step 6: Post chat query to create_response/stream and assert SSE event packrafting_info.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query packraft routes with river grade filter
        # -------------------------------------------------------------------------
        res1 = client.get("/api/packrafting/routes")
        assert res1.status_code == 200
        routes = res1.json()
        assert len(routes) == 5
        route_ids = [r["route_id"] for r in routes]
        assert "frank-church-middle-fork-salmon" in route_ids
        assert "bob-marshall-south-fork-flathead" in route_ids
        assert "alaska-talkeetna-river-wilderness" in route_ids
        assert "escalante-river-desert-canyon" in route_ids
        assert "green-river-desolation-canyon" in route_ids

        # Filter by river_grade
        res1_grade = client.get("/api/packrafting/routes?river_grade=class_iv_technical")
        assert res1_grade.status_code == 200
        grade_iv_routes = res1_grade.json()
        assert len(grade_iv_routes) == 1
        assert grade_iv_routes[0]["route_id"] == "alaska-talkeetna-river-wilderness"

        # -------------------------------------------------------------------------
        # Step 2: Query specific route detail (GET /api/packrafting/routes/{route_id})
        # -------------------------------------------------------------------------
        res2 = client.get("/api/packrafting/routes/frank-church-middle-fork-salmon")
        assert res2.status_code == 200
        route = res2.json()
        assert route["route_id"] == "frank-church-middle-fork-salmon"
        assert "Middle Fork Salmon" in route["river_name"]
        assert route["river_miles"] == 96.0
        assert route["portage_miles"] == 4.5
        assert route["river_grade"] == "class_iii_moderate"
        assert route["flow_status"] == "optimal"
        assert route["current_flow_cfs"] == 2100
        assert route["spraydeck_required"] is True
        assert len(route["portage_features"]) >= 2

        # 404 for unknown route
        res2_404 = client.get("/api/packrafting/routes/unknown-packraft-route")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Post to packraft plan calculation endpoint (POST /api/packrafting/plan)
        # -------------------------------------------------------------------------
        plan_req = {
            "route_id": "frank-church-middle-fork-salmon",
            "paddler_skill": "intermediate",
            "flow_rate_cfs": 2100,
            "boat_capacity_kg": 135.0,
            "total_payload_kg": 95.0,
        }
        res3 = client.post("/api/packrafting/plan", json=plan_req)
        assert res3.status_code == 200
        plan_data = res3.json()
        assert plan_data["route_id"] == "frank-church-middle-fork-salmon"
        assert "Middle Fork Salmon" in plan_data["river_and_section"]
        assert plan_data["flow_feasibility"] == "navigable"
        assert plan_data["recommended_spraydeck"] == "whitewater_deck"
        assert plan_data["payload_margin_kg"] == 40.0
        assert 200 <= plan_data["paddle_length_cm"] <= 225
        assert len(plan_data["safety_advisory"]) > 20

        # 404 for non-existent route in plan
        res3_404 = client.post(
            "/api/packrafting/plan", json={"route_id": "invalid-packraft-route"}
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Query mandatory packraft gear checklist (GET /api/packrafting/gear-checklist)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/packrafting/gear-checklist")
        assert res4.status_code == 200
        gear_list = res4.json()
        assert len(gear_list) == 6
        gear_ids = [g["item_id"] for g in gear_list]
        assert "tizip-packraft-hull" in gear_ids
        assert "breakdown-paddle-carbon" in gear_ids
        assert "low-profile-whitewater-pfd" in gear_ids
        assert "nylon-inflation-bag" in gear_ids
        assert "whitewater-helmet" in gear_ids
        assert "emergency-tpu-repair-kit" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Post chat query to create_response and verify packrafting_info
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "Calculate packraft flow CFS, spraydeck for packraft, and boat capacity payload margin for talkeetna river packraft",
            "customer_id": "cust-packraft-101",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "packrafting_info" in data5
        pr_info = data5["packrafting_info"]
        assert pr_info is not None
        assert pr_info["action"] == "packraft_plan"
        assert pr_info["plan"]["route_id"] == "alaska-talkeetna-river-wilderness"
        assert "Talkeetna" in data5["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Post chat query to create_response/stream and assert SSE event
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Calculate packraft flow CFS, spraydeck for packraft, and boat capacity payload margin for talkeetna river packraft"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        pr_event = next((e for e in parsed_events if e.get("event") == "packrafting_info"), None)
        assert pr_event is not None
        assert "packrafting_info" in pr_event
        stream_pr_info = pr_event["packrafting_info"]
        assert stream_pr_info is not None
        assert stream_pr_info["action"] == "packraft_plan"
        assert stream_pr_info["plan"]["route_id"] == "alaska-talkeetna-river-wilderness"

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Talkeetna" in full_text


@pytest.mark.anyio
async def test_packrafting_journey_real_mode_execution():
    """Step 7: Verifies packrafting prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Rowan", "membership": "Gold", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="Talkeetna River deep wilderness traverse requires a whitewater spraydeck and proper payload margin for Class IV rapids."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Calculate packraft flow CFS, spraydeck for packraft, and boat capacity payload margin for talkeetna river packraft"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "packrafting_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "packrafting_prompt" in call_kwargs
        assert "Talkeetna" in call_kwargs["packrafting_prompt"]
