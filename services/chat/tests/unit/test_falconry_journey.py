import json
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_falconry_journey():
    """Multi-step API journey test for Wilderness Falconry Raptor Handling & Free-Flight Hunting Tooling:

    Step 1: Check status /api/status.
    Step 2: Query /api/falconry/grounds with optional species filter.
    Step 3: Query /api/falconry/grounds/sagebrush-sea-wyoming and verify 404 for unknown ground.
    Step 4: Post /api/falconry/calculate and verify 404 for invalid ground.
    Step 5: Query /api/falconry/gear and verify mandatory gear checklist.
    Step 6: Chat create_response for falconry inquiries.
    Step 7: Chat create_response/stream verifying SSE tokens and custom events (falconry_calculated and falconry_lookup).
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
        # Step 2: Query /api/falconry/grounds
        # -------------------------------------------------------------------------
        res2 = client.get("/api/falconry/grounds")
        assert res2.status_code == 200
        grounds = res2.json()
        assert len(grounds) == 5
        ground_ids = [g["ground_id"] for g in grounds]
        assert "sagebrush-sea-wyoming" in ground_ids
        assert "snake-river-birds-of-prey" in ground_ids
        assert "san-luis-valley-alpine-plateau" in ground_ids
        assert "sonoran-desert-bajada" in ground_ids
        assert "bighorn-basin-badlands" in ground_ids

        # Filter by species=peregrine_falcon
        res2_filt = client.get("/api/falconry/grounds?species=peregrine_falcon")
        assert res2_filt.status_code == 200
        filt_grounds = res2_filt.json()
        assert len(filt_grounds) == 2
        for g in filt_grounds:
            assert g["primary_species"] == "peregrine_falcon"

        # -------------------------------------------------------------------------
        # Step 3: Query /api/falconry/grounds/sagebrush-sea-wyoming
        # -------------------------------------------------------------------------
        res3 = client.get("/api/falconry/grounds/sagebrush-sea-wyoming")
        assert res3.status_code == 200
        sagebrush = res3.json()
        assert sagebrush["ground_id"] == "sagebrush-sea-wyoming"
        assert sagebrush["title"] == "Red Desert High Steppe & Sagebrush Sea"
        assert sagebrush["region"] == "Sweetwater County, Wyoming, USA"
        assert sagebrush["elevation_m"] == 2100
        assert sagebrush["primary_species"] == "gyrfalcon"
        assert sagebrush["flight_style"] == "level_speed_pursuit"
        assert len(sagebrush["highlights"]) == 3

        # 404 for nonexistent ground
        res3_404 = client.get("/api/falconry/grounds/nonexistent-ground")
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Post /api/falconry/calculate
        # -------------------------------------------------------------------------
        calc_payload = {
            "ground_id": "sagebrush-sea-wyoming",
            "raptor_species": "peregrine_falcon",
            "base_molt_weight_grams": 900.0,
            "target_weight_grams": 790.0,
            "pitch_altitude_m": 250.0,
            "ambient_temp_c": 10.0,
        }
        res4 = client.post("/api/falconry/calculate", json=calc_payload)
        assert res4.status_code == 200
        calc_data = res4.json()
        assert calc_data["ground_id"] == "sagebrush-sea-wyoming"
        assert calc_data["ground_title"] == "Red Desert High Steppe & Sagebrush Sea"
        assert calc_data["raptor_species"] == "peregrine_falcon"
        assert calc_data["weight_deviation_percent"] == -12.2
        assert calc_data["conditioning_status"] == "prime_hunting_condition"
        assert calc_data["estimated_stoop_speed_mph"] > 100.0
        assert calc_data["telemetry_range_km"] == 40.5
        assert "weight_conditioning_advisory" in calc_data
        assert "flight_recovery_guidance" in calc_data

        # 404 for invalid ground in calculate
        res4_404 = client.post("/api/falconry/calculate", json={"ground_id": "invalid-ground"})
        assert res4_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 5: Query /api/falconry/gear
        # -------------------------------------------------------------------------
        res5 = client.get("/api/falconry/gear")
        assert res5.status_code == 200
        gear_items = res5.json()
        assert len(gear_items) == 6
        gear_ids = [g["item_id"] for g in gear_items]
        assert "vhf-gps-telemetry-transmitter" in gear_ids
        assert "elk-hide-falconry-gauntlet" in gear_ids
        assert "handcrafted-aylmeri-jesses" in gear_ids
        assert "dutch-blocked-raptor-hood" in gear_ids
        assert "digital-gram-field-scale" in gear_ids
        assert "feathered-leather-training-lure" in gear_ids

        # -------------------------------------------------------------------------
        # Step 6: Chat create_response for falconry inquiries
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the peregrine stoop speed and weight calibration for falconry at Snake River canyon?",
            "customer_id": "cust-falconer-101",
        }
        res6 = client.post("/api/create_response", json=chat_req)
        assert res6.status_code == 200
        data6 = res6.json()
        assert "falconry_info" in data6
        falconry_info = data6["falconry_info"]
        assert falconry_info is not None
        assert "answer" in data6
        assert len(data6["answer"]) > 0

        # -------------------------------------------------------------------------
        # Step 7: Chat create_response/stream verifying SSE tokens and custom events
        # -------------------------------------------------------------------------
        stream_req_calc = {
            "question": "Calculate peregrine falcon stoop speed from 250 meters pitch",
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
            (e for e in parsed_events if e.get("event") == "falconry_calculated"), None
        )
        assert calc_event is not None
        assert "falconry_info" in calc_event
        assert calc_event["falconry_info"]["action"] in ("calculate_conditioning", "calculate")

        # Verify token streaming events
        token_events = [
            e for e in parsed_events if "chunk" in e or "token" in e or e.get("event") == "token"
        ]
        assert len(token_events) > 0
        full_text = "".join(str(e.get("chunk") or e.get("token", "")) for e in token_events)
        assert len(full_text) > 0

        # Verify lookup custom event
        stream_req_lookup = {
            "question": "Tell me about falconry Snake River birds of prey canyon grounds",
        }
        res7_lookup = client.post("/api/create_response/stream", json=stream_req_lookup)
        assert res7_lookup.status_code == 200
        raw_chunks_lookup = [c.strip() for c in res7_lookup.text.split("\n\n") if c.strip()]
        assert "data: [DONE]" in raw_chunks_lookup

        parsed_lookup = []
        for line in raw_chunks_lookup:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_lookup.append(json.loads(line.removeprefix("data: ")))

        lookup_event = next((e for e in parsed_lookup if e.get("event") == "falconry_lookup"), None)
        assert lookup_event is not None
        assert "falconry_info" in lookup_event
        assert lookup_event["falconry_info"]["ground_id"] == "snake-river-birds-of-prey"


@pytest.mark.anyio
async def test_falconry_journey_real_mode_execution():
    """Step 8: Verifies falconry prompt injection and payload parity in real LLM mode."""
    from unittest.mock import AsyncMock, MagicMock

    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Hawker", "membership": "RaptorMaster", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="At Morley Nelson Snake River Canyon, peregrine falcons reach stoop speeds exceeding 140 mph."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={"question": "What is the peregrine stoop speed at Snake River Canyon?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "falconry_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "falconry_prompt" in call_kwargs
        assert (
            "Falconry" in call_kwargs["falconry_prompt"]
            or "falconry" in call_kwargs["falconry_prompt"].lower()
        )
