import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_leave_no_trace_journey():
    """Multi-step API journey test for Leave No Trace & Wilderness Waste Regulations Tooling:

    Step 1: Query LNT principles (GET /api/lnt/principles) and verify 7 principles.
    Step 2: Query wilderness zones (GET /api/lnt/zones) and inspect Enchantments Core rules.
    Step 3: Run compliance check (POST /api/lnt/compliance) for Enchantments Core and verify WAG bag & bear canister mandates.
    Step 4: Run pack-out calculator (POST /api/lnt/pack-out-calc) for 4 people / 3 days.
    Step 5: Test chat query via create_response verifying lnt_info metadata.
    Step 6: Test SSE streaming via create_response_stream asserting lnt_info event.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query LNT principles and verify 7 principles
        # -------------------------------------------------------------------------
        res1 = client.get("/api/lnt/principles")
        assert res1.status_code == 200
        principles = res1.json()
        assert len(principles) == 7
        assert [p["number"] for p in principles] == [1, 2, 3, 4, 5, 6, 7]

        # Check filtering by principle_id
        res1_filter = client.get("/api/lnt/principles?principle_id=dispose-waste")
        assert res1_filter.status_code == 200
        filtered_principles = res1_filter.json()
        assert len(filtered_principles) == 1
        assert filtered_principles[0]["principle_id"] == "dispose-waste"
        assert filtered_principles[0]["number"] == 3

        # -------------------------------------------------------------------------
        # Step 2: Query wilderness zones and inspect Enchantments Core rules
        # -------------------------------------------------------------------------
        res2 = client.get("/api/lnt/zones")
        assert res2.status_code == 200
        zones = res2.json()
        assert len(zones) == 5
        enchantments = next((z for z in zones if z["zone_id"] == "enchantments-core"), None)
        assert enchantments is not None
        assert "Enchantments" in enchantments["name"]
        assert "WAG" in enchantments["human_waste_protocol"]
        assert "bear canister" in enchantments["food_storage_requirement"].lower()

        # Query single zone with ?zone_id=
        res2_zone = client.get("/api/lnt/zones?zone_id=enchantments-core")
        assert res2_zone.status_code == 200
        assert len(res2_zone.json()) == 1
        assert res2_zone.json()[0]["zone_id"] == "enchantments-core"

        # -------------------------------------------------------------------------
        # Step 3: Run compliance check for Enchantments Core
        # -> verify WAG bag & bear canister mandates.
        # -------------------------------------------------------------------------
        res3 = client.post(
            "/api/lnt/compliance",
            json={
                "zone_id": "enchantments-core",
                "elevation_ft": 7500,
                "distance_from_water_ft": 200,
                "group_size": 2,
                "stay_days": 3,
            },
        )
        assert res3.status_code == 200
        compliance = res3.json()
        assert compliance["zone_id"] == "enchantments-core"
        assert compliance["compliance_status"] == "compliant"
        assert "wag bag" in compliance["human_waste_method"].lower()
        assert "bear canister" in compliance["food_storage_method"].lower()
        assert compliance["estimated_wag_bags_needed"] == 6  # 2 people * 3 days
        assert any("wag bag" in g.lower() for g in compliance["required_gear"])
        assert any("bear canister" in g.lower() for g in compliance["required_gear"])

        # Check 404 for invalid zone
        res3_404 = client.post(
            "/api/lnt/compliance",
            json={"zone_id": "non-existent-zone"},
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Run pack-out calculator for 4 people / 3 days
        # -------------------------------------------------------------------------
        res4 = client.post(
            "/api/lnt/pack-out-calc",
            json={
                "group_size": 4,
                "stay_days": 3,
                "requires_wag_bags": True,
            },
        )
        assert res4.status_code == 200
        pack_calc = res4.json()
        assert pack_calc["group_size"] == 4
        assert pack_calc["stay_days"] == 3
        assert pack_calc["wag_bags"] == 12
        assert pack_calc["trash_bags"] >= 1
        assert pack_calc["odor_proof_bags"] >= 1
        assert pack_calc["trowel_needed"] is False
        assert pack_calc["sanitizer_oz"] == 6.0

        # -------------------------------------------------------------------------
        # Step 5: Test chat query via create_response verifying lnt_info metadata
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What are the human waste regulations and bear canister rules for the Enchantments Core?",
            "customer_id": "cust-lnt-101",
        }
        res5_sync = client.post("/api/create_response", json=chat_req)
        assert res5_sync.status_code == 200
        data5_sync = res5_sync.json()
        assert "lnt_info" in data5_sync
        lnt_info = data5_sync["lnt_info"]
        assert lnt_info is not None
        assert "action" in lnt_info
        assert "Enchantments" in data5_sync["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Test SSE streaming via create_response_stream asserting lnt_info event
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={"question": "What are the human waste regulations and bear canister rules for the Enchantments Core?"},
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        lnt_event = next((e for e in parsed_events if e.get("event") == "lnt_info"), None)
        assert lnt_event is not None
        assert "lnt_info" in lnt_event
        stream_lnt_info = lnt_event["lnt_info"]
        assert stream_lnt_info is not None
        assert "action" in stream_lnt_info

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Enchantments" in full_text


@pytest.mark.anyio
async def test_leave_no_trace_journey_real_mode_execution():
    """Verifies LNT prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value={"firstName": "Taylor", "membership": "Gold", "orders": []}),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search_service,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(
            return_value="In the Enchantments Core zone, all human waste must be packed out in WAG bags and hard-sided bear canisters are mandatory."
        ),
    ) as mock_llm, patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response",
            json={"question": "What are the human waste regulations and bear canister rules for the Enchantments Core?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "lnt_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "lnt_prompt" in call_kwargs
        assert "Leave No Trace" in call_kwargs["lnt_prompt"]
        assert "Enchantments" in call_kwargs["lnt_prompt"]
