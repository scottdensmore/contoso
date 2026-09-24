import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_river_rafting_journey():
    """Multi-step API journey test for Backcountry Whitewater Rafting & Oar-Frame Assistant Tooling:

    Step 1: Catalog lookup & filtering (GET /api/river-rafting/expeditions).
    Step 2: Detail lookup (GET /api/river-rafting/expeditions/colorado-river-grand-canyon) & 404 on unknown expedition.
    Step 3: Rafting calculation for leverage and hole punch momentum (POST /api/river-rafting/calculate).
    Step 4: Mandatory multi-day rafting and oar frame safety gear checklist (GET /api/river-rafting/gear).
    Step 5: Conversational chat query through create_response with river_rafting_info metadata.
    Step 6: SSE streaming endpoint create_response/stream asserting river_rafting_info / river_rafting_calculation events.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Catalog lookup & filtering
        # -------------------------------------------------------------------------
        res1 = client.get("/api/river-rafting/expeditions")
        assert res1.status_code == 200
        expeditions = res1.json()
        assert len(expeditions) == 5
        expedition_ids = [e["id"] for e in expeditions]
        assert "colorado-river-grand-canyon" in expedition_ids
        assert "middle-fork-salmon-river" in expedition_ids
        assert "rogue-river-wilderness" in expedition_ids
        assert "selway-river-wilderness" in expedition_ids
        assert "green-river-gates-of-lodore" in expedition_ids

        # Filter by difficulty
        res1_filtered = client.get("/api/river-rafting/expeditions?difficulty=Class%20V")
        assert res1_filtered.status_code == 200
        class_v = res1_filtered.json()
        assert len(class_v) == 2
        class_v_ids = [e["id"] for e in class_v]
        assert "colorado-river-grand-canyon" in class_v_ids
        assert "selway-river-wilderness" in class_v_ids

        # Filter by river
        res1_salmon = client.get("/api/river-rafting/expeditions?river=Salmon")
        assert res1_salmon.status_code == 200
        salmon_trips = res1_salmon.json()
        assert len(salmon_trips) == 1
        assert salmon_trips[0]["id"] == "middle-fork-salmon-river"

        # -------------------------------------------------------------------------
        # Step 2: Detail lookup & 404 on unknown
        # -------------------------------------------------------------------------
        res2 = client.get("/api/river-rafting/expeditions/colorado-river-grand-canyon")
        assert res2.status_code == 200
        gc = res2.json()
        assert gc["id"] == "colorado-river-grand-canyon"
        assert "Grand Canyon" in gc["name"]
        assert gc["mileage_miles"] == 226.0
        assert gc["typical_days"] == 18
        assert gc["recommended_raft_size_feet"] == 18.0
        assert len(gc["highlights"]) >= 3

        res2_404 = client.get("/api/river-rafting/expeditions/unknown-river-canyon")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Calculation via POST /api/river-rafting/calculate
        # -------------------------------------------------------------------------
        calc_req = {
            "expedition_id": "colorado-river-grand-canyon",
            "raft_length_feet": 18.0,
            "rigged_payload_kg": 650.0,
            "oar_length_feet": 10.0,
            "inboard_leverage_inches": 33.0,
            "entry_speed_knots": 6.0,
        }
        res3 = client.post("/api/river-rafting/calculate", json=calc_req)
        assert res3.status_code == 200
        calc_data = res3.json()
        assert calc_data["expedition_name"] == "Colorado River — Grand Canyon Expedition"
        assert calc_data["leverage_ratio"] == 2.64
        assert calc_data["total_displacement_liters"] == 834
        assert calc_data["hole_punch_momentum_ns"] == 2451
        assert calc_data["punch_feasibility"] == "punch_clean"
        assert 50.0 <= calc_data["back_ferry_efficiency_score"] <= 100.0
        assert len(calc_data["stability_warning"]) > 0
        assert len(calc_data["oar_rig_recommendation"]) > 0

        # Invalid expedition returns 404
        res3_404 = client.post(
            "/api/river-rafting/calculate", json={"expedition_id": "unknown-whitewater-tarn"}
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Gear checklist via GET /api/river-rafting/gear
        # -------------------------------------------------------------------------
        res4 = client.get("/api/river-rafting/gear")
        assert res4.status_code == 200
        gear = res4.json()
        assert len(gear) == 6
        assert all(g["mandatory"] is True for g in gear)
        gear_ids = [g["id"] for g in gear]
        assert "modular-aluminum-oar-frame" in gear_ids
        assert "counterbalanced-composite-oars" in gear_ids
        assert "gasketed-aluminum-drybox" in gear_ids
        assert "heavy-duty-drop-bag-cargo-net" in gear_ids
        assert "high-flotation-type-v-pfd" in gear_ids
        assert "firepan-clean-waste-groover" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Conversational chat query with river_rafting_info metadata
        # -------------------------------------------------------------------------
        chat_req1 = {
            "question": "What mandatory groover toilet and drybox gear do I need for multi-day oar frame rafting?",
            "customer_id": "cust-raft-101",
        }
        res5_1 = client.post("/api/create_response", json=chat_req1)
        assert res5_1.status_code == 200
        data5_1 = res5_1.json()
        assert "river_rafting_info" in data5_1
        assert data5_1["river_rafting_info"]["action"] == "gear_checklist"
        assert len(data5_1["river_rafting_info"]["gear"]) == 6

        chat_req2 = {
            "question": "Calculate oar leverage ratio and hole punch momentum for Grand Canyon rafting",
            "customer_id": "cust-raft-101",
        }
        res5_2 = client.post("/api/create_response", json=chat_req2)
        assert res5_2.status_code == 200
        data5_2 = res5_2.json()
        assert "river_rafting_info" in data5_2
        assert data5_2["river_rafting_info"]["action"] == "calculate_raft"
        assert "calculation" in data5_2["river_rafting_info"]

        # Also test service path /api/chat/service/create_response
        res5_3 = client.post("/api/chat/service/create_response", json=chat_req2)
        assert res5_3.status_code == 200
        data5_3 = res5_3.json()
        assert "river_rafting_info" in data5_3

        # -------------------------------------------------------------------------
        # Step 6: SSE streaming query asserting event river_rafting_info
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Calculate oar leverage ratio and hole punch momentum for Grand Canyon rafting",
            },
        )
        assert res6_stream.status_code == 200
        sep = chr(10) + chr(10)
        raw_events = [line.strip() for line in res6_stream.text.split(sep) if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        raft_event = next(
            (
                e
                for e in parsed_events
                if e.get("event") in ("river_rafting_calculation", "river_rafting_info")
            ),
            None,
        )
        assert raft_event is not None
        assert "river_rafting_info" in raft_event or "river_rafting_calculation" in raft_event

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert (
            "Colorado River" in full_text
            or "Grand Canyon" in full_text
            or "Leverage" in full_text
            or "Punch" in full_text
            or "Momentum" in full_text
        )


@pytest.mark.anyio
async def test_river_rafting_journey_real_mode_execution():
    """Step 7: Verifies river rafting prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Powell", "membership": "Platinum", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="The Colorado River Grand Canyon expedition requires 18ft rafts and counterbalanced oars to navigate Lava Falls."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Tell me about Grand Canyon rafting expeditions and oar frame leverage calculations."
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "river_rafting_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "river_rafting_prompt" in call_kwargs
        assert (
            "Grand Canyon" in call_kwargs["river_rafting_prompt"]
            or "Whitewater Rafting" in call_kwargs["river_rafting_prompt"]
            or "Leverage" in call_kwargs["river_rafting_prompt"]
        )
