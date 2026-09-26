import json
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_pack_goat_journey():
    """Multi-step API journey test for Backcountry Pack-Goat Alpine Packing & High-Pass Trekking Tooling:

    Step 1: Check status /api/status.
    Step 2: Query /api/pack-goat/routes with optional rigging filter.
    Step 3: Query /api/pack-goat/routes/wind-river-titcomb-basin and verify 404 for unknown route.
    Step 4: Post /api/pack-goat/calculate with balanced payload and verify 404 for invalid route.
    Step 5: Query /api/pack-goat/gear and verify mandatory tack & safety checklist.
    Step 6: Chat create_response for pack goat inquiries.
    Step 7: Chat create_response/stream verifying SSE tokens and custom events (pack_goat_calculated and pack_goat_lookup).
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
        # Step 2: Query /api/pack-goat/routes
        # -------------------------------------------------------------------------
        res2 = client.get("/api/pack-goat/routes")
        assert res2.status_code == 200
        routes = res2.json()
        assert len(routes) == 5
        route_ids = [r["route_id"] for r in routes]
        assert "wind-river-titcomb-basin" in route_ids
        assert "sawtooth-alice-toxaway" in route_ids
        assert "eagle-cap-lakes-basin" in route_ids
        assert "uinta-highline-kings-peak" in route_ids
        assert "maroon-bells-four-pass" in route_ids

        # Filter by saddle_rigging=flexible_tree_harness
        res2_filt = client.get("/api/pack-goat/routes?saddle_rigging=flexible_tree_harness")
        assert res2_filt.status_code == 200
        filt_routes = res2_filt.json()
        assert len(filt_routes) == 2
        for r in filt_routes:
            assert r["saddle_rigging"] == "flexible_tree_harness"

        # -------------------------------------------------------------------------
        # Step 3: Query /api/pack-goat/routes/wind-river-titcomb-basin
        # -------------------------------------------------------------------------
        res3 = client.get("/api/pack-goat/routes/wind-river-titcomb-basin")
        assert res3.status_code == 200
        titcomb = res3.json()
        assert titcomb["route_id"] == "wind-river-titcomb-basin"
        assert titcomb["elevation_m"] == 3300
        assert titcomb["bighorn_buffer_m"] == 200
        assert titcomb["max_string_goats"] == 4
        assert len(titcomb["highlights"]) == 3

        # 404 for nonexistent route
        res3_404 = client.get("/api/pack-goat/routes/nonexistent-route")
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Post /api/pack-goat/calculate
        # -------------------------------------------------------------------------
        calc_payload = {
            "route_id": "wind-river-titcomb-basin",
            "goat_breed": "alpine_dairy",
            "goat_body_weight_lbs": 180.0,
            "left_pannier_lbs": 18.0,
            "right_pannier_lbs": 18.0,
            "saddle_pad_weight_lbs": 6.0,
            "saddle_rigging": "crossbuck_sawbuck",
        }
        res4 = client.post("/api/pack-goat/calculate", json=calc_payload)
        assert res4.status_code == 200
        calc_data = res4.json()
        assert calc_data["route_id"] == "wind-river-titcomb-basin"
        assert calc_data["total_payload_lbs"] == 42.0
        assert calc_data["weight_difference_lbs"] == 0.0
        assert calc_data["balance_status"] == "perfectly_balanced"
        assert calc_data["payload_percentage"] == 23.3
        assert calc_data["payload_status"] == "full_working_capacity"
        assert calc_data["bighorn_buffer_m"] == 200
        assert calc_data["recommended_daily_forage_pellets_lbs"] == 3.6

        # 404 for invalid route in calculate
        res4_404 = client.post("/api/pack-goat/calculate", json={"route_id": "invalid-route"})
        assert res4_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 5: Query /api/pack-goat/gear
        # -------------------------------------------------------------------------
        res5 = client.get("/api/pack-goat/gear")
        assert res5.status_code == 200
        gear_items = res5.json()
        assert len(gear_items) == 6
        gear_ids = [g["item_id"] for g in gear_items]
        assert "weed-free-certified-forage" in gear_ids
        assert "high-vis-orange-safety-vest" in gear_ids
        assert "highline-swivel-tether-kit" in gear_ids
        assert "hoof-trimming-shears-styptic" in gear_ids
        assert "crossbuck-saddle-breeching" in gear_ids
        assert "bear-resistant-pannier-liner" in gear_ids

        # -------------------------------------------------------------------------
        # Step 6: Chat create_response for pack goat inquiries
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the bighorn sheep separation buffer and weed-free pellet requirement for the Wind River Titcomb Basin pack goat trek?",
            "customer_id": "cust-goat-101",
        }
        res6 = client.post("/api/create_response", json=chat_req)
        assert res6.status_code == 200
        data6 = res6.json()
        assert "pack_goat_info" in data6
        pg_info = data6["pack_goat_info"]
        assert pg_info is not None
        assert "answer" in data6
        assert len(data6["answer"]) > 0

        # -------------------------------------------------------------------------
        # Step 7: Chat create_response/stream verifying SSE tokens and custom events
        # -------------------------------------------------------------------------
        stream_req_calc = {
            "question": "Calculate pack goat pannier payload balance for 180 lb Alpine dairy goat on Titcomb Basin route",
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
            (e for e in parsed_events if e.get("event") == "pack_goat_calculated"), None
        )
        assert calc_event is not None
        assert "pack_goat_info" in calc_event
        assert calc_event["pack_goat_info"]["action"] in ("calculate_packing", "calculate")

        # Verify token streaming events
        token_events = [
            e for e in parsed_events if "chunk" in e or "token" in e or e.get("event") == "token"
        ]
        assert len(token_events) > 0
        full_text = "".join(str(e.get("chunk") or e.get("token", "")) for e in token_events)
        assert len(full_text) > 0

        # Verify lookup custom event
        stream_req_lookup = {
            "question": "Tell me about the Wind River Titcomb Basin pack goat trek route details",
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
            (e for e in parsed_lookup if e.get("event") == "pack_goat_lookup"), None
        )
        assert lookup_event is not None
        assert "pack_goat_info" in lookup_event
        assert lookup_event["pack_goat_info"]["route_id"] == "wind-river-titcomb-basin"


@pytest.mark.anyio
async def test_pack_goat_journey_real_mode_execution():
    """Step 8: Verifies pack goat prompt injection and payload parity in real LLM mode."""
    from unittest.mock import AsyncMock, MagicMock

    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Alice", "membership": "AlpinePacker", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="On the Wind River Titcomb Basin goat trek, maintain a 200m buffer from bighorn sheep and feed 3.6 lbs weed-free pellets daily."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the bighorn sheep separation buffer and weed-free pellet requirement for Wind River Titcomb Basin pack goat trek?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "pack_goat_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "pack_goat_prompt" in call_kwargs
        assert (
            "Pack-Goat" in call_kwargs["pack_goat_prompt"]
            or "pack-goat" in call_kwargs["pack_goat_prompt"].lower()
        )
        assert (
            "Mycoplasma ovipneumoniae" in call_kwargs["pack_goat_prompt"]
            or "mycoplasma" in call_kwargs["pack_goat_prompt"].lower()
        )
