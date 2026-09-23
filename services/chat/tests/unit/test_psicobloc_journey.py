import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_psicobloc_journey():
    """Multi-step API journey test for Deep Water Soloing & Psicobloc Tooling:

    Step 1: List crags & filter by rock type (GET /api/psicobloc/crags).
    Step 2: Retrieve specific crag detail (GET /api/psicobloc/crags/{crag_id}) and 404 on unknown.
    Step 3: Run calculation via REST endpoint for approved vs hazardous belly flop/shallow water (POST /api/psicobloc/calculate).
    Step 4: Retrieve mandatory DWS safety kit checklist (GET /api/psicobloc/gear).
    Step 5: Test multi-turn conversational chat through create_response verifying psicobloc_info metadata.
    Step 6: Test SSE streaming endpoint create_response/stream for psicobloc queries.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: List crags & filter by rock type
        # -------------------------------------------------------------------------
        res1 = client.get("/api/psicobloc/crags")
        assert res1.status_code == 200
        crags = res1.json()
        assert len(crags) == 5
        crag_ids = [c["crag_id"] for c in crags]
        assert "es-pontas-mallorca" in crag_ids
        assert "cala-barques-cave" in crag_ids
        assert "railay-tonsai-krabi" in crag_ids
        assert "swanage-conner-cove" in crag_ids
        assert "summersville-lake-wv" in crag_ids

        # Filter by rock type
        res1_pocketed = client.get("/api/psicobloc/crags?rock_type=pocketed_limestone")
        assert res1_pocketed.status_code == 200
        pocketed_crags = res1_pocketed.json()
        assert len(pocketed_crags) == 2
        pocketed_ids = [c["crag_id"] for c in pocketed_crags]
        assert "es-pontas-mallorca" in pocketed_ids
        assert "swanage-conner-cove" in pocketed_ids

        res1_karst = client.get("/api/psicobloc/crags?rock_type=karst_limestone")
        assert res1_karst.status_code == 200
        karst_crags = res1_karst.json()
        assert len(karst_crags) == 1
        assert karst_crags[0]["crag_id"] == "railay-tonsai-krabi"

        # -------------------------------------------------------------------------
        # Step 2: Retrieve specific crag (es-pontas-mallorca) & 404 for unknown
        # -------------------------------------------------------------------------
        res2 = client.get("/api/psicobloc/crags/es-pontas-mallorca")
        assert res2.status_code == 200
        espontas = res2.json()
        apontas = espontas
        assert apontas["crag_id"] == "es-pontas-mallorca"
        assert "Es Pontàs" in apontas["title"]
        assert apontas["country"] == "Spain"
        assert apontas["max_height_m"] == 20
        assert apontas["rock_type"] == "pocketed_limestone"
        assert apontas["boat_access_only"] is False
        assert len(apontas["highlights"]) == 3

        res2_404 = client.get("/api/psicobloc/crags/non-existent-crag")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Run calculation via REST endpoint (approved vs hazardous)
        # -------------------------------------------------------------------------
        approved_req = {
            "crag_id": "es-pontas-mallorca",
            "climbing_height_m": 12.0,
            "water_depth_m": 7.0,
            "swell_height_m": 0.6,
            "tide_stage": "high_slack_tide",
            "body_entry_position": "pencil_feet_first_pointed",
        }
        res3_approved = client.post("/api/psicobloc/calculate", json=approved_req)
        assert res3_approved.status_code == 200
        approved_data = res3_approved.json()
        assert approved_data["crag_id"] == "es-pontas-mallorca"
        assert approved_data["impact_velocity_ms"] == 15.3
        assert approved_data["impact_velocity_kmh"] == 55.1
        assert approved_data["min_safe_depth_m"] == 6.1
        assert approved_data["depth_clearance_m"] == 0.9
        assert approved_data["safety_status"] == "approved"
        assert "OPTIMAL" in approved_data["entry_orientation_safety"]

        # Hazardous belly flop
        belly_req = {
            "crag_id": "es-pontas-mallorca",
            "climbing_height_m": 12.0,
            "water_depth_m": 7.0,
            "body_entry_position": "flat_back_or_belly",
        }
        res3_belly = client.post("/api/psicobloc/calculate", json=belly_req)
        assert res3_belly.status_code == 200
        belly_data = res3_belly.json()
        assert belly_data["safety_status"] == "hazardous_prohibited"
        assert "CRITICAL IMPACT TRAUMA" in belly_data["entry_orientation_safety"]

        # Hazardous shallow water
        shallow_req = {
            "crag_id": "es-pontas-mallorca",
            "climbing_height_m": 12.0,
            "water_depth_m": 4.5,
        }
        res3_shallow = client.post("/api/psicobloc/calculate", json=shallow_req)
        assert res3_shallow.status_code == 200
        shallow_data = res3_shallow.json()
        assert shallow_data["safety_status"] == "hazardous_prohibited"
        assert shallow_data["depth_clearance_m"] < 0

        # 404 for invalid crag in calculation
        res3_404 = client.post("/api/psicobloc/calculate", json={"crag_id": "unknown-crag"})
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Retrieve mandatory gear checklist (GET /api/psicobloc/gear)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/psicobloc/gear")
        assert res4.status_code == 200
        gear = res4.json()
        assert len(gear) == 6
        assert all(g["mandatory"] is True for g in gear)
        gear_ids = [g["item_id"] for g in gear]
        assert "liquid-chalk-water-resistant" in gear_ids
        assert "quick-drain-climbing-shoes" in gear_ids
        assert "floating-drybag-chalkbag" in gear_ids
        assert "weighted-cliff-exit-ladder" in gear_ids
        assert "high-visibility-swim-buoy" in gear_ids
        assert "microfiber-chamois-towels" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Test conversational chat through create_response
        # -------------------------------------------------------------------------
        chat_req1 = {
            "question": "What is the mandatory safety checklist for liquid chalk and marine rope ladder exit in psicobloc?",
            "customer_id": "cust-psicobloc-101",
        }
        res5_1 = client.post("/api/create_response", json=chat_req1)
        assert res5_1.status_code == 200
        data5_1 = res5_1.json()
        assert "psicobloc_info" in data5_1
        assert data5_1["psicobloc_info"]["action"] == "gear_checklist"
        assert (
            "liquid chalk" in data5_1["answer"].lower()
            or "marine rope ladder" in data5_1["answer"].lower()
        )

        chat_req2 = {
            "question": "Calculate impact velocity and minimum safe water depth clearance for pencil dive fall at Es Pontas psicobloc",
            "customer_id": "cust-psicobloc-101",
        }
        res5_2 = client.post("/api/create_response", json=chat_req2)
        assert res5_2.status_code == 200
        data5_2 = res5_2.json()
        assert "psicobloc_info" in data5_2
        assert data5_2["psicobloc_info"]["action"] == "calculate_psicobloc"
        assert "Es Pontàs" in data5_2["answer"] or "Velocity" in data5_2["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Test SSE streaming endpoint create_response/stream
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Calculate impact velocity and minimum safe water depth clearance for pencil dive fall at Es Pontas psicobloc"
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

        psico_event = next(
            (
                e
                for e in parsed_events
                if e.get("event") in ("psicobloc_calculation", "psicobloc_info")
            ),
            None,
        )
        assert psico_event is not None
        assert "psicobloc_info" in psico_event or "psicobloc_calculation" in psico_event

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Es Pontàs" in full_text or "Psicobloc" in full_text or "Velocity" in full_text


@pytest.mark.anyio
async def test_psicobloc_journey_real_mode_execution():
    """Step 7: Verifies psicobloc prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(return_value={"firstName": "Alex", "membership": "Gold", "orders": []}),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="Es Pontas requires strict vertical pencil dive entries and marine ladder exits."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Calculate impact velocity and minimum safe water depth clearance for pencil dive fall at Es Pontas psicobloc"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "psicobloc_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "psicobloc_prompt" in call_kwargs
        assert (
            "Es Pontàs" in call_kwargs["psicobloc_prompt"]
            or "Psicobloc" in call_kwargs["psicobloc_prompt"]
        )
