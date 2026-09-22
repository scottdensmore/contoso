import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_coasteering_journey():
    """Multi-step API journey test for Coastal Sea Cliff Coasteering & Swell Safety Tooling:

    Step 1: Query coasteering routes with grade filter (GET /api/coasteering/routes).
    Step 2: Query specific route detail (GET /api/coasteering/routes/point-lobos-granite-coves).
    Step 3: Post to jump safety calculation endpoint (POST /api/coasteering/jump-safety).
    Step 4: Query mandatory coasteering gear checklist (GET /api/coasteering/gear-checklist).
    Step 5: Post chat query to create_response and verify coasteering_info metadata.
    Step 6: Post chat query to create_response/stream and assert SSE event coasteering_info.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query coasteering routes with grade filter
        # -------------------------------------------------------------------------
        res1 = client.get("/api/coasteering/routes")
        assert res1.status_code == 200
        routes = res1.json()
        assert len(routes) == 5
        route_ids = [r["route_id"] for r in routes]
        assert "point-lobos-granite-coves" in route_ids
        assert "depoe-bay-spouting-horn-surge" in route_ids
        assert "acadia-otter-cliffs-traverse" in route_ids
        assert "la-jolla-coves-caves-traverse" in route_ids
        assert "cape-flattery-pacific-surge" in route_ids

        # Filter by grade
        res1_grade = client.get("/api/coasteering/routes?grade=grade_2_moderate_coastal")
        assert res1_grade.status_code == 200
        grade2_routes = res1_grade.json()
        assert len(grade2_routes) == 2
        grade2_ids = [r["route_id"] for r in grade2_routes]
        assert "point-lobos-granite-coves" in grade2_ids
        assert "acadia-otter-cliffs-traverse" in grade2_ids

        # -------------------------------------------------------------------------
        # Step 2: Query specific route detail (GET /api/coasteering/routes/{route_id})
        # -------------------------------------------------------------------------
        res2 = client.get("/api/coasteering/routes/point-lobos-granite-coves")
        assert res2.status_code == 200
        route = res2.json()
        assert route["route_id"] == "point-lobos-granite-coves"
        assert "Point Lobos" in route["title"]
        assert route["coasteering_grade"] == "grade_2_moderate_coastal"
        assert route["distance_km"] == 2.8
        assert route["max_jump_height_m"] == 5.5
        assert route["sea_cave_count"] == 2
        assert len(route["highlights"]) == 3

        # 404 for unknown route
        res2_404 = client.get("/api/coasteering/routes/unknown-sea-cliff-route")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Post to jump safety calculation endpoint (POST /api/coasteering/jump-safety)
        # -------------------------------------------------------------------------
        jump_req = {
            "route_id": "point-lobos-granite-coves",
            "jump_height_m": 4.0,
            "water_depth_m": 5.5,
            "swell_height_m": 1.0,
            "swell_period_seconds": 12.0,
            "tide_state": "slack_water",
            "water_aerated_with_foam": False,
        }
        res3 = client.post("/api/coasteering/jump-safety", json=jump_req)
        assert res3.status_code == 200
        safety_data = res3.json()
        assert safety_data["route_id"] == "point-lobos-granite-coves"
        assert "Point Lobos" in safety_data["route_title"]
        assert safety_data["safety_status"] == "safe_jump_conditions"
        assert safety_data["depth_margin_m"] > 0
        assert len(safety_data["body_position_guide"]) > 10

        # 404 for non-existent route in jump safety
        res3_404 = client.post(
            "/api/coasteering/jump-safety", json={"route_id": "invalid-coasteering-route"}
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Query mandatory coasteering gear checklist (GET /api/coasteering/gear-checklist)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/coasteering/gear-checklist")
        assert res4.status_code == 200
        gear_list = res4.json()
        assert len(gear_list) == 6
        gear_ids = [g["item_id"] for g in gear_list]
        assert "high-impact-watersports-helmet" in gear_ids
        assert "reinforced-steamer-wetsuit" in gear_ids
        assert "high-buoyancy-coasteering-pfd" in gear_ids
        assert "sticky-rubber-water-boots" in gear_ids
        assert "neoprene-impact-gloves" in gear_ids
        assert "coasteering-throwline-whistle" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Post chat query to create_response and verify coasteering_info
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "Verify cliff jump safety, depth margin, and swell timing for Point Lobos coasteering",
            "customer_id": "cust-coasteer-101",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "coasteering_info" in data5
        coasteer_info = data5["coasteering_info"]
        assert coasteer_info is not None
        assert coasteer_info["action"] == "jump_safety"
        assert coasteer_info["safety_assessment"]["route_id"] == "point-lobos-granite-coves"
        assert "Point Lobos" in data5["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Post chat query to create_response/stream and assert SSE event
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Verify cliff jump safety, depth margin, and swell timing for Point Lobos coasteering"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        coasteer_event = next(
            (e for e in parsed_events if e.get("event") == "coasteering_info"), None
        )
        assert coasteer_event is not None
        assert "coasteering_info" in coasteer_event
        stream_coasteer_info = coasteer_event["coasteering_info"]
        assert stream_coasteer_info is not None
        assert stream_coasteer_info["action"] == "jump_safety"
        assert stream_coasteer_info["safety_assessment"]["route_id"] == "point-lobos-granite-coves"

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Point Lobos" in full_text


@pytest.mark.anyio
async def test_coasteering_journey_real_mode_execution():
    """Step 7: Verifies coasteering prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Morgan", "membership": "Gold", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="Point Lobos Granite Headlands Traverse offers moderate coastal sea cliff scrambling."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Verify cliff jump safety, depth margin, and swell timing for Point Lobos coasteering"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "coasteering_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "coasteering_prompt" in call_kwargs
        assert "Point Lobos" in call_kwargs["coasteering_prompt"]
