import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_complete_adventures_journey():
    """End-to-end API journey test for Adventure Tours Scheduling & Guide Intent Tooling:

    Step 1: Query GET /api/adventures/tours and verify adventure tour catalog, pricing, and difficulty levels.
    Step 2: Query GET /api/adventures/guides and verify lead guides and AMGA / WFR certifications.
    Step 3: Call POST /api/create_response with "What beginner rock climbing clinics do you offer?"
            and assert adventures_info and detailed response answer.
    Step 4: Stream POST /api/create_response/stream with "Do I need previous experience for glacier travel on Mount Rainier?"
            and verify SSE event: 'adventures_info' frame, token chunks, and data: [DONE].
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query GET /api/adventures/tours
        # Verify adventure tour catalog, pricing, and difficulty levels
        # -------------------------------------------------------------------------
        tours_res = client.get("/api/adventures/tours")
        assert tours_res.status_code == 200
        tours = tours_res.json()
        assert isinstance(tours, list)
        assert len(tours) == 5

        tour_map = {t["tour_id"]: t for t in tours}
        assert "alpine-mountaineering" in tour_map
        alpine = tour_map["alpine-mountaineering"]
        assert alpine["title"] == "Alpine Mountaineering & Glacier Travel"
        assert alpine["location"] == "Mount Rainier"
        assert alpine["duration"] == "3 Days"
        assert alpine["difficulty"] == "Expert"
        assert alpine["price_per_person"] == 650.0
        assert alpine["gear_rental_fee"] == 75.0
        assert alpine["max_group_size"] == 4
        assert alpine["lead_guide_name"] == "Sarah Jenkins"

        assert "outdoor-rock-climbing" in tour_map
        climbing = tour_map["outdoor-rock-climbing"]
        assert climbing["title"] == "Introduction to Outdoor Rock Climbing"
        assert climbing["location"] == "Smith Rock"
        assert climbing["duration"] == "1 Day"
        assert climbing["difficulty"] == "Beginner"
        assert climbing["price_per_person"] == 175.0
        assert climbing["gear_rental_fee"] == 35.0
        assert climbing["max_group_size"] == 6
        assert climbing["lead_guide_name"] == "Marcus Vance"

        assert "backcountry-whitewater" in tour_map
        whitewater = tour_map["backcountry-whitewater"]
        assert whitewater["title"] == "Backcountry Whitewater Rafting Expedition"
        assert whitewater["location"] == "Rogue River"
        assert whitewater["duration"] == "2 Days"
        assert whitewater["difficulty"] == "Intermediate"
        assert whitewater["price_per_person"] == 420.0
        assert whitewater["gear_rental_fee"] == 50.0
        assert whitewater["max_group_size"] == 8
        assert whitewater["lead_guide_name"] == "David Chen"

        assert "wilderness-navigation" in tour_map
        nav = tour_map["wilderness-navigation"]
        assert nav["title"] == "Wilderness Navigation & Compass Clinic"
        assert nav["location"] == "North Cascades"
        assert nav["duration"] == "1 Day"
        assert nav["difficulty"] == "Beginner"
        assert nav["price_per_person"] == 120.0
        assert nav["gear_rental_fee"] == 20.0
        assert nav["max_group_size"] == 10
        assert nav["lead_guide_name"] == "Elena Rostova"

        assert "avalanche-safety" in tour_map
        avy = tour_map["avalanche-safety"]
        assert avy["title"] == "Avalanche Safety & Rescue Basics"
        assert avy["location"] == "Snoqualmie Pass"
        assert avy["duration"] == "1 Day"
        assert avy["difficulty"] == "Intermediate"
        assert avy["price_per_person"] == 150.0
        assert avy["gear_rental_fee"] == 40.0
        assert avy["max_group_size"] == 8
        assert avy["lead_guide_name"] == "Sarah Jenkins"

        # Verify query filters for category and difficulty
        filtered_res = client.get("/api/adventures/tours?category=Rock+Climbing&difficulty=Beginner")
        assert filtered_res.status_code == 200
        filtered_tours = filtered_res.json()
        assert len(filtered_tours) == 1
        assert filtered_tours[0]["tour_id"] == "outdoor-rock-climbing"

        # -------------------------------------------------------------------------
        # Step 2: Query GET /api/adventures/guides
        # Verify lead guides and AMGA / WFR certifications
        # -------------------------------------------------------------------------
        guides_res = client.get("/api/adventures/guides")
        assert guides_res.status_code == 200
        guides = guides_res.json()
        assert isinstance(guides, list)
        assert len(guides) == 4

        guide_map = {g["guide_id"]: g for g in guides}
        assert "sarah-jenkins" in guide_map
        sarah = guide_map["sarah-jenkins"]
        assert sarah["name"] == "Sarah Jenkins"
        assert any("AMGA" in cert for cert in sarah["certifications"])
        assert any("WFR" in cert or "Wilderness First Responder" in cert for cert in sarah["certifications"])
        assert sarah["years_experience"] == 12

        assert "marcus-vance" in guide_map
        marcus = guide_map["marcus-vance"]
        assert marcus["name"] == "Marcus Vance"
        assert any("AMGA" in cert for cert in marcus["certifications"])
        assert marcus["years_experience"] == 9

        assert "david-chen" in guide_map
        david = guide_map["david-chen"]
        assert david["name"] == "David Chen"
        assert any("ACA" in cert or "Kayak" in cert for cert in david["certifications"])
        assert any("Swiftwater" in cert for cert in david["certifications"])
        assert david["years_experience"] == 14

        assert "elena-rostova" in guide_map
        elena = guide_map["elena-rostova"]
        assert elena["name"] == "Elena Rostova"
        assert any("WFR" in cert or "Wilderness First Responder" in cert for cert in elena["certifications"])
        assert elena["years_experience"] == 8

        # -------------------------------------------------------------------------
        # Step 3: Call POST /api/create_response with
        # "What beginner rock climbing clinics do you offer?"
        # Assert adventures_info and detailed response answer
        # -------------------------------------------------------------------------
        chat_res = client.post(
            "/api/create_response",
            json={"question": "What beginner rock climbing clinics do you offer?"},
        )
        assert chat_res.status_code == 200
        chat_data = chat_res.json()
        assert "adventures_info" in chat_data
        adv_info = chat_data["adventures_info"]
        assert adv_info["action"] in ["tours", "recommend"]
        assert adv_info["category"] == "Rock Climbing"
        assert "tours" in adv_info
        assert any(t["tour_id"] == "outdoor-rock-climbing" for t in adv_info["tours"])

        answer = chat_data["answer"]
        assert "Introduction to Outdoor Rock Climbing" in answer
        assert "Smith Rock" in answer
        assert "175" in answer
        assert "Marcus Vance" in answer

        # -------------------------------------------------------------------------
        # Step 4: Stream POST /api/create_response/stream with
        # "Do I need previous experience for glacier travel on Mount Rainier?"
        # Verify SSE event: 'adventures_info' frame, token chunks, and data: [DONE]
        # -------------------------------------------------------------------------
        stream_res = client.post(
            "/api/create_response/stream",
            json={"question": "Do I need previous experience for glacier travel on Mount Rainier?"},
        )
        assert stream_res.status_code == 200
        stream_text = stream_res.text
        assert "data: [DONE]" in stream_text

        events = []
        for block in stream_text.split("\n\n"):
            stripped = block.strip()
            if not stripped:
                continue
            if stripped == "data: [DONE]":
                events.append({"event": "done"})
                continue
            if stripped.startswith("data: "):
                try:
                    events.append(json.loads(stripped.removeprefix("data: ")))
                except json.JSONDecodeError:
                    pass

        # Verify SSE event: 'adventures_info' frame
        adv_event = next((e for e in events if e.get("event") == "adventures_info"), None)
        assert adv_event is not None
        assert "adventures_info" in adv_event
        adv_payload = adv_event["adventures_info"]
        assert adv_payload["action"] == "prerequisites"
        assert adv_payload["tour_id"] == "alpine-mountaineering"
        assert "crampon" in adv_payload["selected_tour"]["prerequisites"].lower() or "experience" in adv_payload["selected_tour"]["prerequisites"].lower()

        # Verify token chunks exist
        chunk_events = [e for e in events if "chunk" in e]
        assert len(chunk_events) > 0
        streamed_answer = "".join(c["chunk"] for c in chunk_events)
        assert "Mount Rainier" in streamed_answer or "Alpine Mountaineering" in streamed_answer
        assert "Sarah Jenkins" in streamed_answer or "experience" in streamed_answer.lower() or "crampon" in streamed_answer.lower()


@pytest.mark.anyio
async def test_adventures_journey_real_mode_execution():
    """Verifies adventure prompt injection and response payload in real mode execution."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value={"firstName": "Alex", "membership": "Gold", "orders": []}),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search_service,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(
            return_value="Introduction to Outdoor Rock Climbing at Smith Rock costs $175 per person and is led by Marcus Vance."
        ),
    ) as mock_llm, patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response",
            json={"question": "What beginner rock climbing clinics do you offer?"},
        )
        assert res.status_code == 200
        data = res.json()

        assert "adventures_info" in data
        assert data["adventures_info"]["action"] in ["tours", "recommend"]
        assert data["adventures_info"]["category"] == "Rock Climbing"

        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "adventures_prompt" in call_kwargs
        assert "Contoso Outdoors Official Adventure Tours" in call_kwargs["adventures_prompt"]
        assert "Introduction to Outdoor Rock Climbing" in call_kwargs["adventures_prompt"]
