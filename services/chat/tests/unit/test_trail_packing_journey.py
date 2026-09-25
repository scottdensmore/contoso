import json
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_trail_packing_journey():
    """Multi-step API journey test for Wilderness Equestrian Trail Packing & Horse Packing Expeditions:

    Step 1: Query pack routes with saddle_type filter (GET /trail-packing/routes and /api/trail-packing/routes).
    Step 2: Query specific route detail (GET /trail-packing/routes/{route_id}).
    Step 3: Post to payload calculation endpoint (POST /trail-packing/calculate).
    Step 4: Query mandatory tack checklist (GET /trail-packing/gear).
    Step 5: Post chat query to create_response and verify trail_packing_info metadata.
    Step 6: Post chat query to create_response/stream and assert SSE event trail_packing_info.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query pack routes with saddle filter
        # -------------------------------------------------------------------------
        res1 = client.get("/trail-packing/routes")
        if res1.status_code == 404:
            res1 = client.get("/api/trail-packing/routes")
        assert res1.status_code == 200
        routes = res1.json()
        assert len(routes) == 5
        route_ids = [r["route_id"] for r in routes]
        assert "bob-marshall-wilderness" in route_ids
        assert "pasayten-wilderness" in route_ids
        assert "wind-river-range" in route_ids
        assert "pecos-wilderness" in route_ids
        assert "frank-church-river-of-no-return" in route_ids

        # Filter by saddle_type=decker
        res1_saddle = client.get("/trail-packing/routes?saddle_type=decker")
        if res1_saddle.status_code == 404:
            res1_saddle = client.get("/api/trail-packing/routes?saddle_type=decker")
        assert res1_saddle.status_code == 200
        decker_routes = res1_saddle.json()
        assert len(decker_routes) == 3
        assert all(r["saddle_type"] == "decker" for r in decker_routes)

        # -------------------------------------------------------------------------
        # Step 2: Query specific route detail
        # -------------------------------------------------------------------------
        res2 = client.get("/trail-packing/routes/bob-marshall-wilderness")
        if res2.status_code == 404:
            res2 = client.get("/api/trail-packing/routes/bob-marshall-wilderness")
        assert res2.status_code == 200
        bob_route = res2.json()
        assert bob_route["route_id"] == "bob-marshall-wilderness"
        assert "Chinese Wall" in bob_route["title"]
        assert bob_route["saddle_type"] == "decker"
        assert bob_route["elevation_m"] == 2300
        assert bob_route["max_string_mules"] == 6

        # 404 for unknown route
        res2_404 = client.get("/trail-packing/routes/unknown-route")
        if res2_404.status_code != 404:
            res2_404 = client.get("/api/trail-packing/routes/unknown-route")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Post to payload calculation endpoint
        # -------------------------------------------------------------------------
        calc_payload = {
            "route_id": "bob-marshall-wilderness",
            "stock_animal": "mule",
            "left_pannier_lbs": 65.0,
            "right_pannier_lbs": 65.0,
            "top_pack_lbs": 20.0,
            "hitch_type": "diamond_hitch",
        }
        res3 = client.post("/trail-packing/calculate", json=calc_payload)
        if res3.status_code == 404:
            res3 = client.post("/api/trail-packing/calculate", json=calc_payload)
        assert res3.status_code == 200
        calc_data = res3.json()
        assert calc_data["route_id"] == "bob-marshall-wilderness"
        assert calc_data["stock_animal"] == "mule"
        assert calc_data["total_payload_lbs"] == 150.0
        assert calc_data["weight_difference_lbs"] == 0.0
        assert calc_data["balance_status"] == "balanced"
        assert calc_data["payload_capacity_status"] == "within_capacity"
        assert calc_data["highline_spacing_m"] >= 3.0
        assert "diamond" in calc_data["recommended_hitch_adjustment"].lower()

        # 404 for invalid route in calculate
        res3_404 = client.post("/trail-packing/calculate", json={"route_id": "invalid-pack-route"})
        if res3_404.status_code != 404:
            res3_404 = client.post("/api/trail-packing/calculate", json={"route_id": "invalid-pack-route"})
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Query mandatory tack checklist
        # -------------------------------------------------------------------------
        res4 = client.get("/trail-packing/gear")
        if res4.status_code == 404:
            res4 = client.get("/api/trail-packing/gear")
        assert res4.status_code == 200
        gear_list = res4.json()
        assert len(gear_list) == 6
        gear_ids = [g["item_id"] for g in gear_list]
        assert "tree-saver-highline-straps" in gear_ids
        assert "breakaway-lead-ropes" in gear_ids
        assert "contoured-pack-pads" in gear_ids
        assert "bear-resistant-panniers" in gear_ids
        assert "easyboot-trail-spares" in gear_ids
        assert "leather-punch-mending-kit" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Post chat query to create_response and verify trail_packing_info
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "How do I balance my panniers with a diamond hitch for a Bob Marshall wilderness pack string?",
            "customer_id": "cust-packer-99",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "trail_packing_info" in data5
        tp_info = data5["trail_packing_info"]
        assert tp_info is not None
        assert tp_info["route_id"] == "bob-marshall-wilderness"
        assert "Bob Marshall Wilderness" in data5["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Post chat query to create_response/stream and assert SSE event
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Tell me about the Bob Marshall wilderness pack string expedition"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        tp_event = next((e for e in parsed_events if e.get("event") == "trail_packing_info"), None)
        assert tp_event is not None
        assert "trail_packing_info" in tp_event
        stream_tp_info = tp_event["trail_packing_info"]
        assert stream_tp_info is not None
        assert stream_tp_info["route_id"] == "bob-marshall-wilderness"

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Bob Marshall" in full_text


@pytest.mark.anyio
async def test_trail_packing_journey_real_mode_execution():
    """Step 7: Verifies trail packing prompt injection and payload parity in real LLM mode."""
    from unittest.mock import AsyncMock, MagicMock

    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Clara", "membership": "Gold", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="For Bob Marshall wilderness pack string expeditions, decker pack saddles with balanced 65 lb panniers are recommended."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Tell me about the Bob Marshall wilderness pack string expedition"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "trail_packing_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "trail_packing_prompt" in call_kwargs
        assert "Bob Marshall Wilderness" in call_kwargs["trail_packing_prompt"]
