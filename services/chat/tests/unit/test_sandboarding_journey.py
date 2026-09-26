import json
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_sandboarding_journey():
    """Multi-step API journey test for Backcountry Sandboarding & Desert Dune Gliding Tooling:

    Step 1: Check status /api/status.
    Step 2: Query /api/sandboarding/dunes with optional style filter.
    Step 3: Query /api/sandboarding/dunes/great-sand-dunes-star-dune and verify 404 for unknown dune.
    Step 4: Post /api/sandboarding/calculate and verify 404 for invalid dune.
    Step 5: Query /api/sandboarding/gear and verify mandatory gear checklist.
    Step 6: Chat create_response for sandboarding inquiries.
    Step 7: Chat create_response/stream verifying SSE tokens and custom events (sandboarding_calculated and sandboarding_lookup).
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
        # Step 2: Query /api/sandboarding/dunes
        # -------------------------------------------------------------------------
        res2 = client.get("/api/sandboarding/dunes")
        assert res2.status_code == 200
        dunes = res2.json()
        assert len(dunes) == 5
        dune_ids = [d["dune_id"] for d in dunes]
        assert "great-sand-dunes-star-dune" in dune_ids
        assert "oregon-dunes-florence-bowl" in dune_ids
        assert "coral-pink-sand-dunes" in dune_ids
        assert "bruneau-dunes-mega-ridge" in dune_ids
        assert "white-sands-alkali-flats" in dune_ids

        # Filter by style=twin_tip_freestyle
        res2_filt = client.get("/api/sandboarding/dunes?style=twin_tip_freestyle")
        assert res2_filt.status_code == 200
        filt_dunes = res2_filt.json()
        assert len(filt_dunes) == 2
        for d in filt_dunes:
            assert d["primary_style"] == "twin_tip_freestyle"

        # -------------------------------------------------------------------------
        # Step 3: Query /api/sandboarding/dunes/great-sand-dunes-star-dune
        # -------------------------------------------------------------------------
        res3 = client.get("/api/sandboarding/dunes/great-sand-dunes-star-dune")
        assert res3.status_code == 200
        star_dune = res3.json()
        assert star_dune["dune_id"] == "great-sand-dunes-star-dune"
        assert star_dune["elevation_m"] == 2600
        assert star_dune["dune_height_m"] == 230
        assert star_dune["max_slope_deg"] == 34
        assert star_dune["sand_type"] == "Alpine Quartz & Volcanic Sand"
        assert len(star_dune["highlights"]) == 3

        # 404 for nonexistent dune
        res3_404 = client.get("/api/sandboarding/dunes/nonexistent-dune")
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Post /api/sandboarding/calculate
        # -------------------------------------------------------------------------
        calc_payload = {
            "dune_id": "great-sand-dunes-star-dune",
            "board_style": "directional_carver",
            "rider_weight_lbs": 165.0,
            "slope_degrees": 32.0,
            "sand_condition": "dry_temperate_loose",
            "wax_type": "silicone_speed_wax",
        }
        res4 = client.post("/api/sandboarding/calculate", json=calc_payload)
        assert res4.status_code == 200
        calc_data = res4.json()
        assert calc_data["dune_id"] == "great-sand-dunes-star-dune"
        assert calc_data["dune_title"] == "Great Sand Dunes Star Dune Slipface"
        assert calc_data["kinetic_friction_coefficient"] == 0.22
        assert calc_data["slipface_risk"] == "moderate_surface_sluff"
        assert calc_data["wax_reapplication_runs"] == 2
        assert calc_data["estimated_top_speed_mph"] > 20.0
        assert "thermal_base_warning" in calc_data
        assert "rider_technique_advisory" in calc_data

        # 404 for invalid dune in calculate
        res4_404 = client.post("/api/sandboarding/calculate", json={"dune_id": "invalid-dune"})
        assert res4_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 5: Query /api/sandboarding/gear
        # -------------------------------------------------------------------------
        res5 = client.get("/api/sandboarding/gear")
        assert res5.status_code == 200
        gear_items = res5.json()
        assert len(gear_items) == 6
        gear_ids = [g["item_id"] for g in gear_items]
        assert "sealed-sand-goggles" in gear_ids
        assert "hard-sand-speed-wax" in gear_ids
        assert "thermal-sand-socks" in gear_ids
        assert "desert-hydration-pack" in gear_ids
        assert "board-base-scraper" in gear_ids
        assert "sun-sand-shield-buff" in gear_ids

        # -------------------------------------------------------------------------
        # Step 6: Chat create_response for sandboarding inquiries
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the top speed and slipface avalanche risk for sandboarding Great Sand Dunes star dune slipface?",
            "customer_id": "cust-sand-101",
        }
        res6 = client.post("/api/create_response", json=chat_req)
        assert res6.status_code == 200
        data6 = res6.json()
        assert "sandboarding_info" in data6
        sand_info = data6["sandboarding_info"]
        assert sand_info is not None
        assert "answer" in data6
        assert len(data6["answer"]) > 0

        # -------------------------------------------------------------------------
        # Step 7: Chat create_response/stream verifying SSE tokens and custom events
        # -------------------------------------------------------------------------
        stream_req_calc = {
            "question": "Calculate sandboard speed with silicone speed wax on 32 degree slope",
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
            (e for e in parsed_events if e.get("event") == "sandboarding_calculated"), None
        )
        assert calc_event is not None
        assert "sandboarding_info" in calc_event
        assert calc_event["sandboarding_info"]["action"] in ("calculate_glide", "calculate")

        # Verify token streaming events
        token_events = [
            e for e in parsed_events if "chunk" in e or "token" in e or e.get("event") == "token"
        ]
        assert len(token_events) > 0
        full_text = "".join(str(e.get("chunk") or e.get("token", "")) for e in token_events)
        assert len(full_text) > 0

        # Verify lookup custom event
        stream_req_lookup = {
            "question": "Tell me about the Great Sand Dunes star dune sandboarding details",
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
            (e for e in parsed_lookup if e.get("event") == "sandboarding_lookup"), None
        )
        assert lookup_event is not None
        assert "sandboarding_info" in lookup_event
        assert lookup_event["sandboarding_info"]["dune_id"] == "great-sand-dunes-star-dune"


@pytest.mark.anyio
async def test_sandboarding_journey_real_mode_execution():
    """Step 8: Verifies sandboarding prompt injection and payload parity in real LLM mode."""
    from unittest.mock import AsyncMock, MagicMock

    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Sam", "membership": "DuneRider", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="On the Great Sand Dunes Star Dune slipface, top speed reaches 28 mph with silicone speed wax."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the top speed on Great Sand Dunes star dune slipface with silicone speed wax?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "sandboarding_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "sandboarding_prompt" in call_kwargs
        assert (
            "Sandboarding" in call_kwargs["sandboarding_prompt"]
            or "sandboarding" in call_kwargs["sandboarding_prompt"].lower()
        )
