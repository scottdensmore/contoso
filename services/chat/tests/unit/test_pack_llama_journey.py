import json
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_pack_llama_journey():
    """Multi-step API journey test for Backcountry Pack-Llama High-Altitude Trekking Tooling:

    Step 1: Check status /api/status.
    Step 2: Query /api/pack-llama/routes with optional rigging filter.
    Step 3: Query /api/pack-llama/routes/high-sierra-bishop-pass and verify 404 for unknown route.
    Step 4: Post /api/pack-llama/calculate with balanced payload and verify 404 for invalid route.
    Step 5: Query /api/pack-llama/gear and verify mandatory tack & safety checklist.
    Step 6: Chat create_response for pack llama inquiries.
    Step 7: Chat create_response/stream verifying SSE tokens and custom events (pack_llama_calculated and pack_llama_lookup).
    """
    # -------------------------------------------------------------------------
    # Step 1: Check status /api/status
    # -------------------------------------------------------------------------
    res1 = client.get("/api/status")
    assert res1.status_code == 200
    status_data = res1.json()
    assert status_data["status"] == "online"
    assert "model_provider" in status_data

    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 2: Query /api/pack-llama/routes
        # -------------------------------------------------------------------------
        res2 = client.get("/api/pack-llama/routes")
        assert res2.status_code == 200
        routes = res2.json()
        assert len(routes) == 5
        route_ids = [r["route_id"] for r in routes]
        assert "high-sierra-bishop-pass" in route_ids
        assert "wind-river-cirque-towers" in route_ids
        assert "san-juan-weminuche-pass" in route_ids
        assert "pasayten-boundary-trail" in route_ids
        assert "uinta-four-lakes-basin" in route_ids

        # Filter by saddle_rigging=wood_crossbuck_pack
        res2_filt = client.get("/api/pack-llama/routes?saddle_rigging=wood_crossbuck_pack")
        assert res2_filt.status_code == 200
        filt_routes = res2_filt.json()
        assert len(filt_routes) == 2
        for r in filt_routes:
            assert r["saddle_rigging"] == "wood_crossbuck_pack"

        # -------------------------------------------------------------------------
        # Step 3: Query /api/pack-llama/routes/high-sierra-bishop-pass
        # -------------------------------------------------------------------------
        res3 = client.get("/api/pack-llama/routes/high-sierra-bishop-pass")
        assert res3.status_code == 200
        bishop = res3.json()
        assert bishop["route_id"] == "high-sierra-bishop-pass"
        assert bishop["elevation_m"] == 3650
        assert bishop["saddle_rigging"] == "wood_crossbuck_pack"
        assert bishop["max_string_llamas"] == 4
        assert len(bishop["highlights"]) == 3

        # 404 for nonexistent route
        res3_404 = client.get("/api/pack-llama/routes/nonexistent-route")
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Post /api/pack-llama/calculate
        # -------------------------------------------------------------------------
        calc_payload = {
            "route_id": "high-sierra-bishop-pass",
            "saddle_rigging": "wood_crossbuck_pack",
            "llama_body_weight_lbs": 360.0,
            "left_pannier_lbs": 32.0,
            "right_pannier_lbs": 32.0,
            "saddle_pad_weight_lbs": 12.0,
            "trail_elevation_m": 3200.0,
        }
        res4 = client.post("/api/pack-llama/calculate", json=calc_payload)
        assert res4.status_code == 200
        calc_data = res4.json()
        assert calc_data["route_id"] == "high-sierra-bishop-pass"
        assert calc_data["total_payload_lbs"] == 76.0
        assert calc_data["weight_difference_lbs"] == 0.0
        assert calc_data["balance_status"] == "perfect_balance"
        assert calc_data["payload_percentage"] == 21.1
        assert calc_data["capacity_status"] == "optimal_working_capacity"
        assert calc_data["highline_spacing_m"] == 3.5
        assert calc_data["daily_water_estimate_gal"] == 2.0
        assert "Leave No Trace" in calc_data["trail_etiquette_guidance"]

        # 404 for invalid route in calculate
        res4_404 = client.post("/api/pack-llama/calculate", json={"route_id": "invalid-route"})
        assert res4_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 5: Query /api/pack-llama/gear
        # -------------------------------------------------------------------------
        res5 = client.get("/api/pack-llama/gear")
        assert res5.status_code == 200
        gear_items = res5.json()
        assert len(gear_items) == 6
        gear_ids = [g["item_id"] for g in gear_items]
        assert "padded-llama-pack-saddle" in gear_ids
        assert "highline-tree-savers-swivels" in gear_ids
        assert "dual-side-balanced-panniers" in gear_ids
        assert "breakaway-lead-and-halter" in gear_ids
        assert "llama-hoof-shears-styptic" in gear_ids
        assert "bear-resistant-food-canisters" in gear_ids

        # -------------------------------------------------------------------------
        # Step 6: Chat create_response for pack llama inquiries
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the highline tree-saver spacing and pannier balance requirement for the High Sierra Bishop Pass llama trek?",
            "customer_id": "cust-llama-101",
        }
        res6 = client.post("/api/create_response", json=chat_req)
        assert res6.status_code == 200
        data6 = res6.json()
        assert "pack_llama_info" in data6
        pl_info = data6["pack_llama_info"]
        assert pl_info is not None
        assert "answer" in data6
        assert len(data6["answer"]) > 0

        # -------------------------------------------------------------------------
        # Step 7: Chat create_response/stream verifying SSE tokens and custom events
        # -------------------------------------------------------------------------
        stream_req_calc = {
            "question": "Calculate pack llama pannier payload balance for 360 lb llama on Bishop Pass route",
        }
        res7_calc = client.post("/api/create_response/stream", json=stream_req_calc)
        assert res7_calc.status_code == 200
        raw_chunks = [c.strip() for c in res7_calc.text.split("\n\n") if c.strip()]
        assert "data: [DONE]" in raw_chunks

        parsed_events = []
        for line in raw_chunks:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        # Verify custom calculation event
        calc_event = next(
            (e for e in parsed_events if e.get("event") == "pack_llama_calculated"), None
        )
        assert calc_event is not None
        assert "pack_llama_info" in calc_event
        assert calc_event["pack_llama_info"]["action"] in ("calculate_packing", "calculate")

        # Verify token streaming events
        token_events = [
            e for e in parsed_events if "chunk" in e or "token" in e or e.get("event") == "token"
        ]
        assert len(token_events) > 0
        full_text = "".join(str(e.get("chunk") or e.get("token", "")) for e in token_events)
        assert len(full_text) > 0

        # Verify lookup custom event
        stream_req_lookup = {
            "question": "Tell me about the High Sierra Bishop Pass llama trek route details",
        }
        res7_lookup = client.post("/api/create_response/stream", json=stream_req_lookup)
        assert res7_lookup.status_code == 200
        raw_chunks_lookup = [c.strip() for c in res7_lookup.text.split("\n\n") if c.strip()]
        assert "data: [DONE]" in raw_chunks_lookup

        parsed_lookup = []
        for line in raw_chunks_lookup:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_lookup.append(json.loads(line.removeprefix("data: ")))

        lookup_event = next(
            (e for e in parsed_lookup if e.get("event") == "pack_llama_lookup"), None
        )
        assert lookup_event is not None
        assert "pack_llama_info" in lookup_event
        assert lookup_event["pack_llama_info"]["route_id"] == "high-sierra-bishop-pass"


@pytest.mark.anyio
async def test_pack_llama_journey_real_mode_execution():
    """Step 8: Verifies pack llama prompt injection and payload parity in real LLM mode."""
    from unittest.mock import AsyncMock, MagicMock

    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Bob", "membership": "PackLlamaGuide", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="On the High Sierra Bishop Pass trek, maintain 3.5m highline tree-saver spacing and balance panniers."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the highline tree-saver spacing and pannier balance requirement for High Sierra Bishop Pass llama trek?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "pack_llama_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "pack_llama_prompt" in call_kwargs
        assert (
            "pack-llama" in call_kwargs["pack_llama_prompt"].lower()
            or "llama" in call_kwargs["pack_llama_prompt"].lower()
        )
        assert (
            "tree-saver" in call_kwargs["pack_llama_prompt"].lower()
            or "highline" in call_kwargs["pack_llama_prompt"].lower()
            or "soft" in call_kwargs["pack_llama_prompt"].lower()
        )
