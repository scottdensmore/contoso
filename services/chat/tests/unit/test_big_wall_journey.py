import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_big_wall_journey():
    """Multi-step API journey test for Alpine Big Wall Aid Climbing & Portaledge Tooling:

    Step 1: List routes & filter by aid rating (GET /api/big-wall/routes).
    Step 2: Retrieve specific route detail (GET /api/big-wall/routes/{route_id}) and 404 on unknown.
    Step 3: Run haul calculation via REST endpoint for standard vs extreme slab loads (POST /api/big-wall/calculate).
    Step 4: Retrieve mandatory big wall safety kit checklist (GET /api/big-wall/gear).
    Step 5: Test multi-turn conversational chat through create_response verifying big_wall_info metadata.
    Step 6: Test SSE streaming endpoint create_response/stream for big wall queries.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: List routes & filter by aid rating
        # -------------------------------------------------------------------------
        res1 = client.get("/api/big-wall/routes")
        assert res1.status_code == 200
        routes = res1.json()
        assert len(routes) == 5
        route_ids = [r["id"] for r in routes]
        assert "el-capitan-nose" in route_ids
        assert "half-dome-regular-northwest" in route_ids
        assert "fisher-towers-titan" in route_ids
        assert "zion-prodigal-son" in route_ids
        assert "leaning-tower-west-face" in route_ids

        # Filter by aid rating C2
        res1_c2 = client.get("/api/big-wall/routes?aid_rating=C2")
        assert res1_c2.status_code == 200
        c2_routes = res1_c2.json()
        assert len(c2_routes) == 2
        c2_ids = [r["id"] for r in c2_routes]
        assert "el-capitan-nose" in c2_ids
        assert "zion-prodigal-son" in c2_ids

        # Filter by aid rating A2+
        res1_a2 = client.get("/api/big-wall/routes?aid_rating=A2%2B")
        assert res1_a2.status_code == 200
        a2_routes = res1_a2.json()
        assert len(a2_routes) == 1
        assert a2_routes[0]["id"] == "fisher-towers-titan"

        # -------------------------------------------------------------------------
        # Step 2: Retrieve specific route detail & 404 on unknown
        # -------------------------------------------------------------------------
        res2 = client.get("/api/big-wall/routes/el-capitan-nose")
        assert res2.status_code == 200
        nose = res2.json()
        assert nose["id"] == "el-capitan-nose"
        assert "The Nose" in nose["name"]
        assert nose["pitches"] == 31
        assert nose["height_meters"] == 1000
        assert nose["typical_pig_weight_kg"] == 85.0
        assert len(nose["highlights"]) >= 3

        res2_404 = client.get("/api/big-wall/routes/non-existent-route")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Run haul calculation via REST endpoint
        # -------------------------------------------------------------------------
        standard_req = {
            "route_id": "el-capitan-nose",
            "pig_weight_kg": 85.0,
            "haul_system": "2:1_mechanical_advantage",
            "wall_angle": "vertical",
            "climber_weight_kg": 75.0,
        }
        res3_standard = client.post("/api/big-wall/calculate", json=standard_req)
        assert res3_standard.status_code == 200
        calc_data = res3_standard.json()
        assert calc_data["route_name"] == "The Nose — El Capitan"
        assert calc_data["mechanical_advantage_ratio"] == 2.0
        assert calc_data["effective_pull_force_kg"] == 57.5
        assert calc_data["counterweight_sufficient"] is True
        assert calc_data["haul_effort_level"] == "moderate"

        # Extreme slab load with counterweight deficiency
        extreme_req = {
            "route_id": "el-capitan-nose",
            "pig_weight_kg": 110.0,
            "haul_system": "1:1_direct",
            "wall_angle": "slab",
            "climber_weight_kg": 70.0,
        }
        res3_extreme = client.post("/api/big-wall/calculate", json=extreme_req)
        assert res3_extreme.status_code == 200
        extreme_data = res3_extreme.json()
        assert extreme_data["counterweight_sufficient"] is False
        assert extreme_data["haul_effort_level"] == "extreme_two_person"
        assert "Effective pull force exceeds climber bodyweight" in extreme_data["safety_warning"]
        assert "Heavy bag dragging on slab" in extreme_data["safety_warning"]
        assert "Expedition double-pig load" in extreme_data["safety_warning"]

        # 404 for invalid route in calculate
        res3_404 = client.post(
            "/api/big-wall/calculate",
            json={"route_id": "non-existent-wall", "pig_weight_kg": 70.0},
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Retrieve mandatory gear checklist (GET /api/big-wall/gear)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/big-wall/gear")
        assert res4.status_code == 200
        gear = res4.json()
        assert len(gear) == 6
        assert all(g["mandatory"] is True for g in gear)
        gear_ids = [g["id"] for g in gear]
        assert "full-portaledge-storm-fly" in gear_ids
        assert "progress-capture-hauling-pulley" in gear_ids
        assert "adjustable-daisy-chains-etriers" in gear_ids
        assert "beak-and-cam-hook-set" in gear_ids
        assert "haul-bag-pig-dry-containment" in gear_ids
        assert "aluminum-waste-haul-tube" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Test conversational chat through create_response
        # -------------------------------------------------------------------------
        chat_req1 = {
            "question": "What is the mandatory big wall gear checklist for portaledge and hauling pig?",
            "customer_id": "cust-big-wall-101",
        }
        res5_1 = client.post("/api/create_response", json=chat_req1)
        assert res5_1.status_code == 200
        data5_1 = res5_1.json()
        assert "big_wall_info" in data5_1
        assert data5_1["big_wall_info"]["action"] == "gear_checklist"
        assert (
            "portaledge" in data5_1["answer"].lower() or "hauling pig" in data5_1["answer"].lower()
        )

        chat_req2 = {
            "question": "Calculate haul effort and mechanical advantage for 85kg pig on El Capitan",
            "customer_id": "cust-big-wall-101",
        }
        res5_2 = client.post("/api/create_response", json=chat_req2)
        assert res5_2.status_code == 200
        data5_2 = res5_2.json()
        assert "big_wall_info" in data5_2
        assert data5_2["big_wall_info"]["action"] == "calculate_haul"
        assert "El Capitan" in data5_2["answer"] or "Pull Force" in data5_2["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Test SSE streaming endpoint create_response/stream
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Calculate haul effort and mechanical advantage for 85kg pig on El Capitan"
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

        big_wall_event = next(
            (
                e
                for e in parsed_events
                if e.get("event") in ("big_wall_calculation", "big_wall_info")
            ),
            None,
        )
        assert big_wall_event is not None
        assert "big_wall_info" in big_wall_event or "big_wall_calculation" in big_wall_event

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "El Capitan" in full_text or "Haul" in full_text or "Pull Force" in full_text


@pytest.mark.anyio
async def test_big_wall_journey_real_mode_execution():
    """Step 7: Verifies big wall prompt injection and payload parity in real LLM mode."""
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
                return_value="El Capitan Nose requires 2:1 or 3:1 mechanical advantage hauling and waste haul tubes."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Calculate haul effort and mechanical advantage for 85kg pig on El Capitan"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "big_wall_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "big_wall_prompt" in call_kwargs
        assert (
            "El Capitan" in call_kwargs["big_wall_prompt"]
            or "Big Wall" in call_kwargs["big_wall_prompt"]
        )
