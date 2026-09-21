import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_bushcraft_journey():
    """Multi-step API journey test for Wilderness Bushcraft & Fieldcraft Tooling:

    Step 1: Query projects list (GET /api/bushcraft/projects) and filter by discipline.
    Step 2: Query specific project detail (GET /api/bushcraft/projects/boreal-debris-hut-shelter) and test 404.
    Step 3: Run shelter thermal calculation (POST /api/bushcraft/thermal-calc) with debris, ground chill, and reflector wall.
    Step 4: Retrieve mandatory bushcraft kit checklist (GET /api/bushcraft/gear-checklist).
    Step 5: Test chat query via create_response verifying bushcraft_info metadata.
    Step 6: Test SSE streaming via create_response_stream asserting bushcraft_info event.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query projects list (GET /api/bushcraft/projects)
        # -------------------------------------------------------------------------
        res1 = client.get("/api/bushcraft/projects")
        assert res1.status_code == 200
        projects = res1.json()
        assert len(projects) == 5
        p_ids = [p["project_id"] for p in projects]
        assert "boreal-debris-hut-shelter" in p_ids
        assert "cedar-bow-drill-ember" in p_ids
        assert "basswood-bast-fiber-cordage" in p_ids
        assert "mors-kochanski-super-shelter" in p_ids
        assert "birch-bark-water-boiling-vessel" in p_ids

        # Filter by discipline
        res1_shelter = client.get("/api/bushcraft/projects?discipline=shelter_craft")
        assert res1_shelter.status_code == 200
        shelters = res1_shelter.json()
        assert len(shelters) == 2
        assert all(s["discipline"] == "shelter_craft" for s in shelters)

        # -------------------------------------------------------------------------
        # Step 2: Query specific project detail (GET /api/bushcraft/projects/boreal-debris-hut-shelter)
        # -------------------------------------------------------------------------
        res2 = client.get("/api/bushcraft/projects/boreal-debris-hut-shelter")
        assert res2.status_code == 200
        debris_hut = res2.json()
        assert debris_hut["project_id"] == "boreal-debris-hut-shelter"
        assert "Boreal Forest Debris Hut" in debris_hut["title"]
        assert debris_hut["region"] == "Ely, MN"
        assert debris_hut["thermal_rating_r_value"] == 8.0
        assert debris_hut["discipline"] == "shelter_craft"
        assert len(debris_hut["materials_required"]) >= 2
        assert debris_hut["tool_required"]
        assert len(debris_hut["highlights"]) >= 2

        # 404 for unknown project
        res2_404 = client.get("/api/bushcraft/projects/non-existent-project")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Run shelter thermal calculation (POST /api/bushcraft/thermal-calc)
        # -------------------------------------------------------------------------
        calc_payload = {
            "project_id": "boreal-debris-hut-shelter",
            "ambient_temperature_f": 20.0,
            "wind_speed_mph": 10.0,
            "debris_thickness_inches": 24.0,
            "bedding_elevation_inches": 8.0,
            "fire_reflector_wall": True,
        }
        res3 = client.post("/api/bushcraft/thermal-calc", json=calc_payload)
        assert res3.status_code == 200
        calc_data = res3.json()
        assert calc_data["project_id"] == "boreal-debris-hut-shelter"
        assert calc_data["effective_r_value"] > 8.0
        assert calc_data["estimated_interior_temp_f"] > 20.0
        assert calc_data["safety_status"] in ("safe", "advisory")
        assert calc_data["ground_conductive_loss_warning"] is False
        assert len(calc_data["fieldcraft_tips"]) >= 3

        # Thermal calculation with ground chill warning (< 6 inches bedding)
        chill_payload = {
            "project_id": "boreal-debris-hut-shelter",
            "ambient_temperature_f": 20.0,
            "bedding_elevation_inches": 3.0,
        }
        res3_chill = client.post("/api/bushcraft/thermal-calc", json=chill_payload)
        assert res3_chill.status_code == 200
        assert res3_chill.json()["ground_conductive_loss_warning"] is True

        # 404 on invalid project
        res3_404 = client.post(
            "/api/bushcraft/thermal-calc",
            json={"project_id": "non-existent-shelter-id"},
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Retrieve mandatory bushcraft gear checklist (GET /api/bushcraft/gear-checklist)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/bushcraft/gear-checklist")
        assert res4.status_code == 200
        gear = res4.json()
        assert len(gear) == 6
        assert all(g["mandatory"] is True for g in gear)
        gear_ids = [g["item_id"] for g in gear]
        assert "carbon-steel-bushcraft-knife" in gear_ids
        assert "bushcraft-folding-saw" in gear_ids
        assert "ferrocerium-spark-rod" in gear_ids
        assert "single-wall-stainless-canteen-cup" in gear_ids
        assert "tarred-marline-bankline" in gear_ids
        assert "heavy-canvas-wool-blanket" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Test chat query via create_response verifying bushcraft_info metadata
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "How do I build a boreal debris hut shelter in the woods?",
            "customer_id": "cust-bushcraft-202",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "bushcraft_info" in data5
        b_info = data5["bushcraft_info"]
        assert b_info is not None
        assert b_info.get("project_id") == "boreal-debris-hut-shelter" or "debris hut" in str(b_info).lower()
        assert "debris" in data5["answer"].lower() or "shelter" in data5["answer"].lower()

        # -------------------------------------------------------------------------
        # Step 6: Test SSE streaming via create_response_stream asserting bushcraft_info event
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "How do I build a boreal debris hut shelter in the woods?"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        bushcraft_event = next((e for e in parsed_events if e.get("event") == "bushcraft_info"), None)
        assert bushcraft_event is not None
        assert "bushcraft_info" in bushcraft_event
        stream_b_info = bushcraft_event["bushcraft_info"]
        assert stream_b_info is not None
        assert "debris" in str(stream_b_info).lower() or "shelter" in str(stream_b_info).lower()

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "debris" in full_text.lower() or "shelter" in full_text.lower()


@pytest.mark.anyio
async def test_bushcraft_journey_real_mode_execution():
    """Step 7: Verifies bushcraft prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Mors", "membership": "Gold", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="The Boreal Forest Debris Hut is built with a ridgepole, ribs, and thick insulating duff."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "How do I build a boreal debris hut shelter in the woods?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "bushcraft_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "bushcraft_prompt" in call_kwargs
        assert "Boreal" in call_kwargs["bushcraft_prompt"] or "Bushcraft" in call_kwargs["bushcraft_prompt"]
