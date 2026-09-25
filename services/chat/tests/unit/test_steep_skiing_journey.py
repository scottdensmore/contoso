import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_steep_skiing_journey():
    """Multi-step API journey test for Alpine Ski Mountaineering & Steep Couloir Assistant Tooling:

    Step 1: Catalog lookup & grade filtering (GET /api/steep-skiing/couloirs).
    Step 2: Detail lookup (GET /api/steep-skiing/couloirs/corbets-couloir-jackson) & 404 on unknown couloir.
    Step 3: Steep couloir dynamics & sluff calculation (POST /api/steep-skiing/calculate).
    Step 4: Mandatory ski mountaineering gear checklist (GET /api/steep-skiing/gear).
    Step 5: Conversational chat query through create_response with steep_skiing_info metadata.
    Step 6: SSE streaming endpoint create_response/stream asserting steep_skiing_info / steep_skiing_calculation events.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Catalog lookup & grade filtering
        # -------------------------------------------------------------------------
        res1 = client.get("/api/steep-skiing/couloirs")
        assert res1.status_code == 200
        couloirs = res1.json()
        assert len(couloirs) == 5
        couloir_ids = [c["id"] for c in couloirs]
        assert "corbets-couloir-jackson" in couloir_ids
        assert "tuckerman-ravine-headwall" in couloir_ids
        assert "silver-couloir-buffalo" in couloir_ids
        assert "terminal-cancer-couloir" in couloir_ids
        assert "mount-superior-south-face" in couloir_ids

        # Filter by grade
        res1_filtered = client.get("/api/steep-skiing/couloirs?grade=Class_3_Extreme_50_55")
        assert res1_filtered.status_code == 200
        class_3 = res1_filtered.json()
        assert len(class_3) == 2
        class_3_ids = [c["id"] for c in class_3]
        assert "tuckerman-ravine-headwall" in class_3_ids
        assert "mount-superior-south-face" in class_3_ids

        # -------------------------------------------------------------------------
        # Step 2: Detail lookup & 404 on unknown
        # -------------------------------------------------------------------------
        res2 = client.get("/api/steep-skiing/couloirs/corbets-couloir-jackson")
        assert res2.status_code == 200
        corbets = res2.json()
        assert corbets["id"] == "corbets-couloir-jackson"
        assert "Corbet's Couloir" in corbets["name"]
        assert corbets["max_slope_angle_deg"] == 50.0
        assert corbets["vertical_drop_meters"] == 180.0
        assert corbets["choke_width_meters"] == 3.5
        assert len(corbets["highlights"]) >= 3

        res2_404 = client.get("/api/steep-skiing/couloirs/unknown-couloir-xyz")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Calculation via POST /api/steep-skiing/calculate
        # -------------------------------------------------------------------------
        calc_req = {
            "couloir_id": "corbets-couloir-jackson",
            "slope_angle_deg": 50.0,
            "snow_surface": "packed_powder",
            "skier_weight_kg": 80.0,
            "sluff_release_distance_meters": 35.0,
        }
        res3 = client.post("/api/steep-skiing/calculate", json=calc_req)
        assert res3.status_code == 200
        calc_data = res3.json()
        assert calc_data["couloir_name"] == "Corbet's Couloir & S&S Chute"
        assert calc_data["sluff_velocity_km_h"] > 0
        assert calc_data["hop_turn_edge_load_n"] > 0
        assert calc_data["fall_consequence_index"] in (
            "moderate_arrestable",
            "severe_injury_risk",
            "catastrophic_unmitigated",
        )
        assert calc_data["recommended_style"] in (
            "fluid_turns",
            "hop_turns",
            "side_slipping_choke",
            "ski_belay_rappel",
        )
        assert len(calc_data["sluff_management_strategy"]) > 0

        # Narrow choke calculation (Terminal Cancer Couloir = 2.0m choke)
        tc_req = {
            "couloir_id": "terminal-cancer-couloir",
            "slope_angle_deg": 46.0,
            "snow_surface": "packed_powder",
            "skier_weight_kg": 75.0,
            "sluff_release_distance_meters": 15.0,
        }
        res3_tc = client.post("/api/steep-skiing/calculate", json=tc_req)
        assert res3_tc.status_code == 200
        tc_data = res3_tc.json()
        assert tc_data["choke_warning"] is not None
        assert "choke restriction" in tc_data["choke_warning"].lower()

        # Invalid couloir returns 404
        res3_404 = client.post(
            "/api/steep-skiing/calculate", json={"couloir_id": "unknown-nonexistent-couloir"}
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Gear checklist via GET /api/steep-skiing/gear
        # -------------------------------------------------------------------------
        res4 = client.get("/api/steep-skiing/gear")
        assert res4.status_code == 200
        gear = res4.json()
        assert len(gear) == 6
        assert all(g["mandatory"] is True for g in gear)
        gear_ids = [g["id"] for g in gear]
        assert "technical-ski-mountaineering-axes" in gear_ids
        assert "certified-ski-crampons" in gear_ids
        assert "ultralight-ski-rad-line" in gear_ids
        assert "ski-carry-airbag-backpack" in gear_ids
        assert "aluminum-snow-stake-fluke" in gear_ids
        assert "triple-certified-ski-climbing-helmet" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Conversational chat query with steep_skiing_info metadata
        # -------------------------------------------------------------------------
        chat_req1 = {
            "question": "What mandatory ski crampons, harscheisen, and rad line gear do I need for steep couloirs?",
            "customer_id": "cust-ski-101",
        }
        res5_1 = client.post("/api/create_response", json=chat_req1)
        assert res5_1.status_code == 200
        data5_1 = res5_1.json()
        assert "steep_skiing_info" in data5_1
        assert data5_1["steep_skiing_info"]["action"] == "gear_checklist"
        assert len(data5_1["steep_skiing_info"]["gear"]) == 6

        chat_req2 = {
            "question": "Calculate sluff velocity and hop-turn edge loading on Corbet's Couloir",
            "customer_id": "cust-ski-101",
        }
        res5_2 = client.post("/api/create_response", json=chat_req2)
        assert res5_2.status_code == 200
        data5_2 = res5_2.json()
        assert "steep_skiing_info" in data5_2
        assert data5_2["steep_skiing_info"]["action"] == "calculate_couloir"
        assert "calculation" in data5_2["steep_skiing_info"]

        # Also test service path /api/chat/service/create_response
        res5_3 = client.post("/api/chat/service/create_response", json=chat_req2)
        assert res5_3.status_code == 200
        data5_3 = res5_3.json()
        assert "steep_skiing_info" in data5_3

        # -------------------------------------------------------------------------
        # Step 6: SSE streaming query asserting event steep_skiing_info
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Calculate sluff velocity and hop-turn edge loading on Corbet's Couloir",
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

        steep_event = next(
            (
                e
                for e in parsed_events
                if e.get("event") in ("steep_skiing_calculation", "steep_skiing_info")
            ),
            None,
        )
        assert steep_event is not None
        assert "steep_skiing_info" in steep_event or "steep_skiing_calculation" in steep_event

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert (
            "Corbet's Couloir" in full_text
            or "Sluff Velocity" in full_text
            or "Hop-Turn" in full_text
            or "Steep" in full_text
        )


@pytest.mark.anyio
async def test_steep_skiing_journey_real_mode_execution():
    """Step 7: Verifies steep skiing prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Coombs", "membership": "Platinum", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="Corbet's Couloir features a 50-degree chute and mandatory cornice drop at Jackson Hole."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Tell me about Corbet's Couloir steep skiing and sluff velocity calculation."
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "steep_skiing_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "steep_skiing_prompt" in call_kwargs
        assert (
            "Corbet" in call_kwargs["steep_skiing_prompt"]
            or "Alpine Ski Mountaineering" in call_kwargs["steep_skiing_prompt"]
            or "Couloir" in call_kwargs["steep_skiing_prompt"]
        )
