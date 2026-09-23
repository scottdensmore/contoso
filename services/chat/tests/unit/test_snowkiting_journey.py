import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_snowkiting_journey():
    """Multi-step API journey test for Backcountry Snowkiting & Polar Kite Expeditions Tooling:

    Step 1: List spots & filter by terrain (GET /api/snowkiting/spots).
    Step 2: Retrieve specific spot detail (GET /api/snowkiting/spots/{spot_id}) and 404 on unknown.
    Step 3: Run calculation via REST endpoint for approved vs storm force overpowered (POST /api/snowkiting/calculate).
    Step 4: Retrieve mandatory polar snowkiting safety kit checklist (GET /api/snowkiting/gear).
    Step 5: Test multi-turn conversational chat through create_response verifying snowkiting_info metadata.
    Step 6: Test SSE streaming endpoint create_response/stream for snowkiting queries.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: List spots & filter by terrain
        # -------------------------------------------------------------------------
        res1 = client.get("/api/snowkiting/spots")
        assert res1.status_code == 200
        spots = res1.json()
        assert len(spots) == 5
        spot_ids = [s["spot_id"] for s in spots]
        assert "hardangervidda-plateau-norway" in spot_ids
        assert "camas-prairie-idaho" in spot_ids
        assert "col-du-lautaret-alps" in spot_ids
        assert "lake-mille-lacs-minnesota" in spot_ids
        assert "greenland-icecap-traverse" in spot_ids

        # Filter by terrain
        res1_plateau = client.get("/api/snowkiting/spots?terrain=polar_plateau")
        assert res1_plateau.status_code == 200
        plateau_spots = res1_plateau.json()
        assert len(plateau_spots) == 1
        assert plateau_spots[0]["spot_id"] == "hardangervidda-plateau-norway"

        res1_lake = client.get("/api/snowkiting/spots?terrain=frozen_lake")
        assert res1_lake.status_code == 200
        lake_spots = res1_lake.json()
        assert len(lake_spots) == 1
        assert lake_spots[0]["spot_id"] == "lake-mille-lacs-minnesota"

        # -------------------------------------------------------------------------
        # Step 2: Retrieve specific spot (hardangervidda-plateau-norway) & 404 for unknown
        # -------------------------------------------------------------------------
        res2 = client.get("/api/snowkiting/spots/hardangervidda-plateau-norway")
        assert res2.status_code == 200
        hardanger = res2.json()
        assert hardanger["spot_id"] == "hardangervidda-plateau-norway"
        assert hardanger["title"] == "Hardangervidda Polar Plateau"
        assert hardanger["country"] == "Norway"
        assert hardanger["elevation_m"] == 1250
        assert hardanger["terrain"] == "polar_plateau"
        assert hardanger["expedition_pulk_friendly"] is True
        assert len(hardanger["highlights"]) == 3

        res2_404 = client.get("/api/snowkiting/spots/non-existent-spot")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Run calculation via REST endpoint (approved vs storm force overpowered)
        # -------------------------------------------------------------------------
        approved_req = {
            "spot_id": "hardangervidda-plateau-norway",
            "rider_weight_kg": 75.0,
            "pulk_weight_kg": 20.0,
            "wind_speed_knots": 16.0,
            "snow_surface": "groomed_packed",
            "kite_type": "closed_cell_depower_foil",
        }
        res3_approved = client.post("/api/snowkiting/calculate", json=approved_req)
        assert res3_approved.status_code == 200
        approved_data = res3_approved.json()
        assert approved_data["spot_id"] == "hardangervidda-plateau-norway"
        assert approved_data["total_payload_kg"] == 95.0
        assert approved_data["recommended_kite_area_m2"] == 11.5
        assert approved_data["power_rating"].startswith("OPTIMAL POWER")
        assert approved_data["safety_status"] == "approved"
        assert approved_data["glide_efficiency_percent"] == 73
        assert len(approved_data["tactical_advisory"]) > 10

        storm_req = {
            "spot_id": "greenland-icecap-traverse",
            "rider_weight_kg": 85.0,
            "pulk_weight_kg": 40.0,
            "wind_speed_knots": 38.0,
            "snow_surface": "sastrugi_drift",
            "kite_type": "closed_cell_depower_foil",
        }
        res3_storm = client.post("/api/snowkiting/calculate", json=storm_req)
        assert res3_storm.status_code == 200
        storm_data = res3_storm.json()
        assert storm_data["safety_status"] == "hazardous_storm_force"
        assert "STORM FORCE" in storm_data["tactical_advisory"]

        # 404 for invalid spot in calculation
        res3_404 = client.post("/api/snowkiting/calculate", json={"spot_id": "unknown-spot"})
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Retrieve mandatory gear checklist (GET /api/snowkiting/gear)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/snowkiting/gear")
        assert res4.status_code == 200
        gear = res4.json()
        assert len(gear) == 6
        assert all(g["mandatory"] is True for g in gear)
        gear_ids = [g["item_id"] for g in gear]
        assert "depower-foil-snowkite" in gear_ids
        assert "climbing-rated-kite-harness" in gear_ids
        assert "quick-release-chickenloop-leash" in gear_ids
        assert "pulk-harness-tow-bridle" in gear_ids
        assert "backcountry-gps-inreach" in gear_ids
        assert "multi-impact-snow-helmet" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Test conversational chat through create_response
        # -------------------------------------------------------------------------
        chat_req1 = {
            "question": "What is the mandatory safety checklist for chickenloop safety release and snowkite harness?",
            "customer_id": "cust-snowkite-101",
        }
        res5_1 = client.post("/api/create_response", json=chat_req1)
        assert res5_1.status_code == 200
        data5_1 = res5_1.json()
        assert "snowkiting_info" in data5_1
        assert data5_1["snowkiting_info"]["action"] == "gear_checklist"
        assert "chickenloop" in data5_1["answer"].lower() or "harness" in data5_1["answer"].lower()

        chat_req2 = {
            "question": "Calculate kite sizing in knots and pulk hauling friction for Hardangervidda snowkiting",
            "customer_id": "cust-snowkite-101",
        }
        res5_2 = client.post("/api/create_response", json=chat_req2)
        assert res5_2.status_code == 200
        data5_2 = res5_2.json()
        assert "snowkiting_info" in data5_2
        assert data5_2["snowkiting_info"]["action"] == "calculate_snowkiting"
        assert "Hardangervidda" in data5_2["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Test SSE streaming endpoint create_response/stream
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Calculate kite sizing in knots and pulk hauling friction for Hardangervidda snowkiting"
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

        snowkite_event = next(
            (
                e
                for e in parsed_events
                if e.get("event") in ("snowkiting_calculation", "snowkiting_info")
            ),
            None,
        )
        assert snowkite_event is not None
        assert "snowkiting_info" in snowkite_event or "snowkiting_calculation" in snowkite_event

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Hardangervidda" in full_text or "Snowkiting" in full_text


@pytest.mark.anyio
async def test_snowkiting_journey_real_mode_execution():
    """Step 7: Verifies snowkiting prompt injection and payload parity in real LLM mode."""
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
                return_value="Hardangervidda requires closed-cell depower foil kites and rigid pulk tow bridles."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Calculate kite sizing in knots and pulk hauling friction for Hardangervidda snowkiting"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "snowkiting_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "snowkiting_prompt" in call_kwargs
        assert "Hardangervidda" in call_kwargs["snowkiting_prompt"]
