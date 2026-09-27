import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_telemark_skiing_journey():
    """Multi-step API journey test for Alpine Telemark Skiing & Freeheel Backcountry Descending Tooling:

    Step 1: Check status /api/status.
    Step 2: Query /api/telemark-skiing/zones with optional binding system filter.
    Step 3: Query /api/telemark-skiing/zones/silverton-mountain-powder and verify 404 for unknown zone.
    Step 4: Post /api/telemark-skiing/calculate and verify 404 for invalid zone.
    Step 5: Query /api/telemark-skiing/gear and verify mandatory gear checklist.
    Step 6: Chat create_response for telemark skiing inquiries.
    Step 7: Chat create_response/stream verifying SSE tokens and custom events (telemark_calculated and telemark_lookup).
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
        # Step 2: Query /api/telemark-skiing/zones
        # -------------------------------------------------------------------------
        res2 = client.get("/api/telemark-skiing/zones")
        assert res2.status_code == 200
        zones = res2.json()
        assert len(zones) == 5
        zone_ids = [z["zone_id"] for z in zones]
        assert "silverton-mountain-powder" in zone_ids
        assert "mad-river-glen-trees" in zone_ids
        assert "alta-catherine-pass" in zone_ids
        assert "rogers-pass-asulkan" in zone_ids
        assert "tuckerman-ravine-bowl" in zone_ids

        # Filter by system=ntn_modern
        res2_filt = client.get("/api/telemark-skiing/zones?system=ntn_modern")
        assert res2_filt.status_code == 200
        filt_zones = res2_filt.json()
        assert len(filt_zones) == 3
        for z in filt_zones:
            assert z["primary_binding"] == "ntn_modern"

        # -------------------------------------------------------------------------
        # Step 3: Query /api/telemark-skiing/zones/silverton-mountain-powder
        # -------------------------------------------------------------------------
        res3 = client.get("/api/telemark-skiing/zones/silverton-mountain-powder")
        assert res3.status_code == 200
        silverton = res3.json()
        assert silverton["zone_id"] == "silverton-mountain-powder"
        assert "Silverton Mountain" in silverton["title"]
        assert silverton["region"] == "San Juan Mountains, Colorado, USA"
        assert silverton["elevation_m"] == 4100
        assert silverton["primary_binding"] == "ntn_modern"
        assert silverton["steepness_deg"] == 45
        assert len(silverton["highlights"]) == 3

        # 404 for nonexistent zone
        res3_404 = client.get("/api/telemark-skiing/zones/nonexistent-zone")
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Post /api/telemark-skiing/calculate
        # -------------------------------------------------------------------------
        calc_payload = {
            "zone_id": "silverton-mountain-powder",
            "binding_system": "ntn_modern",
            "skier_weight_lbs": 170.0,
            "snow_condition": "deep_blower_powder",
            "turn_style": "fluid_deep_knee_lunges",
            "tension_level": 3,
        }
        res4 = client.post("/api/telemark-skiing/calculate", json=calc_payload)
        assert res4.status_code == 200
        calc_data = res4.json()
        assert calc_data["zone_id"] == "silverton-mountain-powder"
        assert calc_data["effective_resistance_nm"] == 45.0
        assert calc_data["tip_drive_edge_pressure_index"] == 0.56
        assert calc_data["resistance_rating"] == "balanced_all_mountain"
        assert "bellows_strain_warning" in calc_data
        assert "lead_change_advisory" in calc_data
        assert "edge_transition_guidance" in calc_data

        # 404 for invalid zone in calculate
        res4_404 = client.post("/api/telemark-skiing/calculate", json={"zone_id": "invalid-zone"})
        assert res4_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 5: Query /api/telemark-skiing/gear
        # -------------------------------------------------------------------------
        res5 = client.get("/api/telemark-skiing/gear")
        assert res5.status_code == 200
        gear_items = res5.json()
        assert len(gear_items) == 6
        gear_ids = [g["item_id"] for g in gear_items]
        assert "telemark-bellows-boots" in gear_ids
        assert "touring-climbing-skins" in gear_ids
        assert "safety-leash-release-cables" in gear_ids
        assert "adjustable-whippet-poles" in gear_ids
        assert "binding-spare-cartridge-kit" in gear_ids
        assert "avalanche-airbag-rescue-pack" in gear_ids

        # -------------------------------------------------------------------------
        # Step 6: Chat create_response for telemark skiing inquiries
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the knee resistance and edge drive pressure index for telemark skiing Silverton Mountain?",
            "customer_id": "cust-telemark-skier-42",
        }
        res6 = client.post("/api/create_response", json=chat_req)
        assert res6.status_code == 200
        data6 = res6.json()
        assert "telemark_skiing_info" in data6
        tele_info = data6["telemark_skiing_info"]
        assert tele_info is not None
        assert "answer" in data6
        assert len(data6["answer"]) > 0

        # Also test service path /api/chat/service/create_response
        res6_service = client.post("/api/chat/service/create_response", json=chat_req)
        assert res6_service.status_code == 200
        data6_service = res6_service.json()
        assert "telemark_skiing_info" in data6_service

        # -------------------------------------------------------------------------
        # Step 7: Chat create_response/stream verifying SSE tokens and custom events
        # -------------------------------------------------------------------------
        stream_req_calc = {
            "question": "Calculate telemark spring tension and knee resistance for NTN bindings",
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
            (e for e in parsed_events if e.get("event") == "telemark_calculated"), None
        )
        assert calc_event is not None
        assert "telemark_skiing_info" in calc_event
        assert calc_event["telemark_skiing_info"]["action"] in ("calculate_activity", "calculate")

        # Verify token streaming events
        token_events = [
            e for e in parsed_events if "chunk" in e or "token" in e or e.get("event") == "token"
        ]
        assert len(token_events) > 0
        full_text = "".join(str(e.get("chunk") or e.get("token", "")) for e in token_events)
        assert len(full_text) > 0

        # Verify lookup custom event
        stream_req_lookup = {
            "question": "Tell me about Silverton Mountain telemark skiing details",
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
            (e for e in parsed_lookup if e.get("event") == "telemark_lookup"), None
        )
        assert lookup_event is not None
        assert "telemark_skiing_info" in lookup_event
        assert lookup_event["telemark_skiing_info"]["zone_id"] == "silverton-mountain-powder"


@pytest.mark.anyio
async def test_telemark_skiing_journey_real_mode_execution():
    """Step 8: Verifies telemark skiing prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Knut", "membership": "Summit", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="Silverton Mountain provides high-altitude telemark skiing with 45.0 Nm forward knee resistance on modern NTN bindings."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the knee resistance and edge drive pressure index for telemark skiing Silverton Mountain?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "telemark_skiing_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "telemark_prompt" in call_kwargs
        assert (
            "telemark" in call_kwargs["telemark_prompt"].lower()
            or "silverton" in call_kwargs["telemark_prompt"].lower()
        )
