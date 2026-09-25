import json
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_primitive_trapping_journey():
    """Multi-step API journey test for Wilderness Bushcraft Primitive Trapping & Deadfall Tooling:

    Step 1: Query mechanisms with category filter (GET /primitive-trapping/mechanisms and /api/primitive-trapping/mechanisms).
    Step 2: Query specific mechanism detail (GET /primitive-trapping/mechanisms/{mechanism_id}).
    Step 3: Post calculation request (POST /primitive-trapping/calculate).
    Step 4: Query mandatory safety gear items (GET /primitive-trapping/gear).
    Step 5: Post chat query to create_response and verify primitive_trapping_info metadata.
    Step 6: Post chat query to create_response/stream and assert SSE event primitive_trapping_info.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query mechanisms catalog and filter
        # -------------------------------------------------------------------------
        res1 = client.get("/primitive-trapping/mechanisms")
        if res1.status_code == 404:
            res1 = client.get("/api/primitive-trapping/mechanisms")
        assert res1.status_code == 200
        mechanisms = res1.json()
        assert len(mechanisms) == 5
        mech_ids = [m["mechanism_id"] for m in mechanisms]
        assert "figure-4-deadfall" in mech_ids
        assert "paiute-deadfall" in mech_ids
        assert "promontory-peg-snare" in mech_ids
        assert "spring-pole-snare" in mech_ids
        assert "rolling-log-deadfall" in mech_ids

        # Filter category=deadfall
        res1_deadfall = client.get("/primitive-trapping/mechanisms?category=deadfall")
        if res1_deadfall.status_code == 404:
            res1_deadfall = client.get("/api/primitive-trapping/mechanisms?category=deadfall")
        assert res1_deadfall.status_code == 200
        deadfalls = res1_deadfall.json()
        assert len(deadfalls) == 3
        assert all(m["category"] == "deadfall" for m in deadfalls)

        # Filter category=snare
        res1_snare = client.get("/primitive-trapping/mechanisms?category=snare")
        if res1_snare.status_code == 404:
            res1_snare = client.get("/api/primitive-trapping/mechanisms?category=snare")
        assert res1_snare.status_code == 200
        snares = res1_snare.json()
        assert len(snares) == 2
        assert all(m["category"] == "snare" for m in snares)

        # -------------------------------------------------------------------------
        # Step 2: Query specific mechanism detail
        # -------------------------------------------------------------------------
        res2 = client.get("/primitive-trapping/mechanisms/figure-4-deadfall")
        if res2.status_code == 404:
            res2 = client.get("/api/primitive-trapping/mechanisms/figure-4-deadfall")
        assert res2.status_code == 200
        fig4 = res2.json()
        assert fig4["mechanism_id"] == "figure-4-deadfall"
        assert "Figure-4" in fig4["title"]
        assert fig4["cordage_required"] is False
        assert len(fig4["highlights"]) == 3

        # 404 for unknown mechanism
        res2_404 = client.get("/primitive-trapping/mechanisms/nonexistent-mechanism")
        if res2_404.status_code != 404:
            res2_404 = client.get("/api/primitive-trapping/mechanisms/nonexistent-mechanism")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Post calculation request
        # -------------------------------------------------------------------------
        calc_payload = {
            "mechanism_id": "figure-4-deadfall",
            "quarry": "snowshoe_hare",
            "deadfall_weight_lbs": 18.0,
            "notch_depth_mm": 4.0,
            "cordage_type": "tarred_bankline",
        }
        res3 = client.post("/primitive-trapping/calculate", json=calc_payload)
        if res3.status_code == 404:
            res3 = client.post("/api/primitive-trapping/calculate", json=calc_payload)
        assert res3.status_code == 200
        calc_data = res3.json()
        assert calc_data["mechanism_id"] == "figure-4-deadfall"
        assert calc_data["quarry"] == "snowshoe_hare"
        assert calc_data["quarry_weight_lbs"] == 3.5
        assert calc_data["deadfall_weight_lbs"] == 18.0
        assert calc_data["lethality_status"] == "humane_instant_dispatch"
        assert calc_data["sensitivity_status"] == "optimal_sensitivity"
        assert calc_data["estimated_trip_force_oz"] == 3.2
        assert "ethical" in calc_data["legal_ethics_advisory"].lower() or "ethics" in calc_data["legal_ethics_advisory"].lower()

        # -------------------------------------------------------------------------
        # Step 4: Query mandatory safety gear
        # -------------------------------------------------------------------------
        res4 = client.get("/primitive-trapping/gear")
        if res4.status_code == 404:
            res4 = client.get("/api/primitive-trapping/gear")
        assert res4.status_code == 200
        gear_list = res4.json()
        assert len(gear_list) == 6
        gear_ids = [g["item_id"] for g in gear_list]
        assert "carving-bushcraft-knife" in gear_ids
        assert "tarred-bank-line" in gear_ids
        assert "inert-training-peg-set" in gear_ids
        assert "safety-flagging-tape" in gear_ids
        assert "spring-wire-snare-gauge" in gear_ids
        assert "survival-regulations-guide" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Post chat query to create_response and verify primitive_trapping_info
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "How do I calculate the deadfall stone weight ratio for a snowshoe hare using a figure-4 deadfall?",
            "customer_id": "cust-trapper-01",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "primitive_trapping_info" in data5
        trap_info = data5["primitive_trapping_info"]
        assert trap_info is not None
        assert "Figure-4" in data5["answer"] or "figure-4" in data5["answer"].lower()

        # -------------------------------------------------------------------------
        # Step 6: Post chat query to create_response/stream and assert SSE event
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Tell me about the Paiute deadfall hair trigger toggle mechanism"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        trap_event = next((e for e in parsed_events if e.get("event") in ("primitive_trapping_info", "primitive_trapping_mechanism_detail")), None)
        assert trap_event is not None
        assert "primitive_trapping_info" in trap_event
        stream_trap_info = trap_event["primitive_trapping_info"]
        assert stream_trap_info is not None

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Paiute" in full_text or "paiute" in full_text.lower()


@pytest.mark.anyio
async def test_primitive_trapping_journey_real_mode_execution():
    """Step 7: Verifies primitive trapping prompt injection and payload parity in real LLM mode."""
    from unittest.mock import AsyncMock, MagicMock

    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Ethan", "membership": "Platinum", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="For snowshoe hare survival trapping, a figure-4 deadfall requires at least 17.5 lbs of deadweight for humane dispatch."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "How do I calculate the deadfall stone weight ratio for a snowshoe hare using a figure-4 deadfall?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "primitive_trapping_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "primitive_trapping_prompt" in call_kwargs
        assert "Primitive Trapping" in call_kwargs["primitive_trapping_prompt"]
