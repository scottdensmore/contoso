import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_canyoneering_journey():
    """Multi-step API journey test for Alpine Canyoneering & Technical Slot Canyon Outfitting Tooling:

    Step 1: Query slot canyon routes with technical grade filter (GET /api/canyoneering/routes).
    Step 2: Query specific route detail (GET /api/canyoneering/routes/zion-subway-left-fork).
    Step 3: Post to rope rigging plan calculation endpoint (POST /api/canyoneering/rigging-plan).
    Step 4: Query mandatory canyoneering gear checklist (GET /api/canyoneering/gear-checklist).
    Step 5: Post chat query to create_response and verify canyoneering_info metadata.
    Step 6: Post chat query to create_response/stream and assert SSE event canyoneering_info.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query slot canyon routes with technical grade filter
        # -------------------------------------------------------------------------
        res1 = client.get("/api/canyoneering/routes")
        assert res1.status_code == 200
        routes = res1.json()
        assert len(routes) == 5
        route_ids = [r["route_id"] for r in routes]
        assert "zion-subway-left-fork" in route_ids
        assert "zion-mystery-canyon" in route_ids
        assert "escalante-choprock-canyon" in route_ids
        assert "san-rafael-black-hole" in route_ids
        assert "robbers-roost-bluejohn" in route_ids

        # Filter by technical_grade
        res1_grade = client.get("/api/canyoneering/routes?technical_grade=class_4b")
        assert res1_grade.status_code == 200
        grade_4b_routes = res1_grade.json()
        assert len(grade_4b_routes) == 1
        assert grade_4b_routes[0]["route_id"] == "escalante-choprock-canyon"

        # -------------------------------------------------------------------------
        # Step 2: Query specific route detail (GET /api/canyoneering/routes/{route_id})
        # -------------------------------------------------------------------------
        res2 = client.get("/api/canyoneering/routes/zion-subway-left-fork")
        assert res2.status_code == 200
        route = res2.json()
        assert route["route_id"] == "zion-subway-left-fork"
        assert "Subway" in route["canyon_name"]
        assert route["technical_grade"] == "class_3b"
        assert route["flash_flood_risk"] == "moderate"
        assert route["longest_rappel_ft"] == 30
        assert route["max_rappel_ft"] == 30
        assert route["number_of_rappels"] == 3
        assert route["wetsuit_thickness_mm"] == 4
        assert len(route["anchor_features"]) >= 3

        # 404 for unknown route
        res2_404 = client.get("/api/canyoneering/routes/unknown-canyon-route")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Post to rope rigging plan calculation endpoint (POST /api/canyoneering/rigging-plan)
        # -------------------------------------------------------------------------
        rigging_req = {
            "route_id": "zion-subway-left-fork",
            "team_size": 4,
            "rope_diameter_mm": 9.0,
            "pull_cord_type": "dedicated_pull_line",
            "water_immersion_level": "pothole_swimming",
        }
        res3 = client.post("/api/canyoneering/rigging-plan", json=rigging_req)
        assert res3.status_code == 200
        rigging_data = res3.json()
        assert rigging_data["route_id"] == "zion-subway-left-fork"
        assert "Subway" in rigging_data["canyon_and_route"]
        assert rigging_data["rope_length_ft"] == 45
        assert rigging_data["pull_cord_length_ft"] == 45
        assert "pull line" in rigging_data["rigging_anchor_system"].lower()
        assert rigging_data["rigging_status"] in ("safe", "caution")
        assert "4mm" in rigging_data["neoprene_spec"]
        assert len(rigging_data["safety_advisory"]) > 20

        # 404 for non-existent route in rigging plan
        res3_404 = client.post(
            "/api/canyoneering/rigging-plan", json={"route_id": "invalid-canyon-route"}
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Query mandatory canyoneering gear checklist (GET /api/canyoneering/gear-checklist)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/canyoneering/gear-checklist")
        assert res4.status_code == 200
        gear_list = res4.json()
        assert len(gear_list) == 6
        gear_ids = [g["item_id"] for g in gear_list]
        assert "canyon-harness-seat" in gear_ids
        assert "static-canyon-rope" in gear_ids
        assert "variable-friction-descender" in gear_ids
        assert "sealed-neoprene-wetsuit" in gear_ids
        assert "canyon-helmet" in gear_ids
        assert "pothole-escape-kit" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Post chat query to create_response and verify canyoneering_info
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "Calculate canyoneering rope length, pull cord, and fiddle stick retrieval for mystery canyon",
            "customer_id": "cust-canyon-101",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "canyoneering_info" in data5
        c_info = data5["canyoneering_info"]
        assert c_info is not None
        assert c_info["action"] == "rigging_plan"
        assert c_info["plan"]["route_id"] == "zion-mystery-canyon"
        assert "Mystery Canyon" in data5["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Post chat query to create_response/stream and assert SSE event
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Calculate canyoneering rope length, pull cord, and fiddle stick retrieval for mystery canyon"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        canyon_event = next((e for e in parsed_events if e.get("event") == "canyoneering_info"), None)
        assert canyon_event is not None
        assert "canyoneering_info" in canyon_event
        stream_c_info = canyon_event["canyoneering_info"]
        assert stream_c_info is not None
        assert stream_c_info["action"] == "rigging_plan"
        assert stream_c_info["plan"]["route_id"] == "zion-mystery-canyon"

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Mystery Canyon" in full_text


@pytest.mark.anyio
async def test_canyoneering_journey_real_mode_execution():
    """Step 7: Verifies canyoneering prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Morgan", "membership": "Gold", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="Mystery Canyon in Zion features 12 rappels culminating in a dramatic 120ft drop into The Narrows."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Calculate canyoneering rope length, pull cord, and fiddle stick retrieval for mystery canyon"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "canyoneering_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "canyoneering_prompt" in call_kwargs
        assert "Mystery Canyon" in call_kwargs["canyoneering_prompt"]
