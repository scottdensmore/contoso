import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_trip_planner_e2e_journey():
    """End-to-end API journey test for trip planning, packing & calorie tooling:

    Step 1: Query GET /api/planner/templates and verify available trip templates and baseline configurations.
    Step 2: Query POST /api/planner/generate with {"duration_days": 3, "group_size": 2, "climate": "cold"}
            and assert total calories (~20,400 kcal), daily water, and cold-weather gear in checklist.
    Step 3: Call POST /api/create_response with "Plan a 3-day backpacking trip in the Cascades with packing
            list and calorie needs" and assert trip_planner_info and detailed response answer.
    Step 4: Stream POST /api/create_response/stream with "What water capacity and gear do I need for desert hiking?"
            and verify SSE event: 'trip_planner_info' frame, token chunks, and data: [DONE].
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query GET /api/planner/templates
        # -------------------------------------------------------------------------
        res_step1 = client.get("/api/planner/templates")
        assert res_step1.status_code == 200
        templates = res_step1.json()
        assert isinstance(templates, list)
        assert len(templates) >= 3
        template_ids = [t["id"] for t in templates]
        assert "weekend-backpacking" in template_ids
        for t in templates:
            assert "name" in t
            assert "duration_days" in t
            assert "group_size" in t
            assert "climate" in t
            assert "recommended_daily_calories" in t
            assert "recommended_daily_water_liters" in t

        # -------------------------------------------------------------------------
        # Step 2: Query POST /api/planner/generate with cold climate parameters
        # -------------------------------------------------------------------------
        payload_step2 = {
            "duration_days": 3,
            "group_size": 2,
            "climate": "cold",
        }
        res_step2 = client.post("/api/planner/generate", json=payload_step2)
        assert res_step2.status_code == 200
        plan = res_step2.json()
        assert plan["duration_days"] == 3
        assert plan["group_size"] == 2
        assert plan["total_calories_kcal"] == 20400
        assert plan["daily_calories_per_person"] == 3400
        assert plan["daily_water_liters_per_person"] == 3.0
        assert plan["total_water_capacity_liters"] == 6.0
        assert plan["estimated_base_weight_kg"] > 0

        # Assert cold-weather gear in checklist
        checklist = plan["checklist"]
        assert len(checklist) >= 10
        checklist_text = " ".join(item["name"].lower() for item in checklist)
        assert "4-season" in checklist_text
        assert "microspikes" in checklist_text or "crampons" in checklist_text
        assert "subzero" in checklist_text or "cold-weather" in checklist_text or "0°f" in checklist_text

        # -------------------------------------------------------------------------
        # Step 3: Call POST /api/create_response for 3-day Cascades backpacking
        # -------------------------------------------------------------------------
        payload_step3 = {
            "question": "Plan a 3-day backpacking trip in the Cascades with packing list and calorie needs"
        }
        res_step3 = client.post("/api/create_response", json=payload_step3)
        assert res_step3.status_code == 200
        data_step3 = res_step3.json()
        assert "trip_planner_info" in data_step3
        assert "answer" in data_step3

        info_step3 = data_step3["trip_planner_info"]
        assert info_step3["duration_days"] == 3
        assert info_step3["total_calories_kcal"] > 0
        assert info_step3["daily_water_liters_per_person"] == 3.0
        assert len(info_step3["checklist"]) >= 10

        answer_step3 = data_step3["answer"]
        assert "3-day" in answer_step3.lower() or "3 day" in answer_step3.lower()
        assert "calories" in answer_step3.lower() or "kcal" in answer_step3.lower()
        assert "water" in answer_step3.lower()
        assert "checklist" in answer_step3.lower() or "gear" in answer_step3.lower() or "essentials" in answer_step3.lower()

        # -------------------------------------------------------------------------
        # Step 4: Stream POST /api/create_response/stream for desert hiking water/gear
        # -------------------------------------------------------------------------
        payload_step4 = {
            "question": "What water capacity and gear do I need for desert hiking?"
        }
        res_step4 = client.post("/api/create_response/stream", json=payload_step4)
        assert res_step4.status_code == 200
        raw_events = [
            line.removeprefix("data: ")
            for line in res_step4.text.split("\n\n")
            if line.strip() and line.startswith("data: ")
        ]
        assert "[DONE]" in raw_events

        parsed_events = []
        for raw in raw_events:
            if raw == "[DONE]":
                continue
            try:
                parsed_events.append(json.loads(raw))
            except json.JSONDecodeError:
                pass

        # Verify SSE event: 'trip_planner_info' frame
        planner_event = next((e for e in parsed_events if e.get("event") == "trip_planner_info"), None)
        assert planner_event is not None
        assert "trip_planner_info" in planner_event
        desert_info = planner_event["trip_planner_info"]
        assert desert_info["daily_water_liters_per_person"] == 4.5
        assert desert_info["total_water_capacity_liters"] == 4.5

        # Verify token chunks streamed
        chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(chunks) > 0
        full_streamed_answer = "".join(chunks)
        assert "4.5" in full_streamed_answer or "desert" in full_streamed_answer.lower()
        assert "water" in full_streamed_answer.lower()


@pytest.mark.anyio
async def test_trip_planner_journey_real_mode_execution():
    """Verify chat_request real-mode handler includes trip_planner_info and prompt injection."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    mock_llm_response = (
        "Here is your comprehensive 3-day backpacking wilderness plan. "
        "Your total calorie target is 9,000 kcal (3,000 kcal/day/person) and daily water carrying capacity is 3.0 liters."
    )

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value={"firstName": "Alex", "membership": "Gold", "orders": []}),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search_service,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(return_value=mock_llm_response),
    ) as mock_llm, patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response",
            json={"question": "Plan a 3-day backpacking trip in the Cascades with packing list and calorie needs"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "trip_planner_info" in data
        assert data["trip_planner_info"]["duration_days"] == 3
        assert data["trip_planner_info"]["daily_calories_per_person"] == 3000

        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "trip_planner_prompt" in call_kwargs
        assert "Contoso Outdoors" in call_kwargs["trip_planner_prompt"]
