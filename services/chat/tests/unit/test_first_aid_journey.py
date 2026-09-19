import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_first_aid_triage_and_medical_protocol_journey():
    """Multi-step API journey test for Wilderness First Aid Triage & Medical Protocol Tooling:

    Step 1: GET /api/first-aid/conditions?category=environmental -> assert Hypothermia, Heat Stroke, and Altitude Sickness returned.
    Step 2: POST /api/first-aid/triage with uncontrollable shivering, fumbling hands, non-ambulatory -> assert Hypothermia match and assisted walkout / SAR.
    Step 3: POST /api/first-aid/kit-calculator with party_size 4, trip_days 5 -> assert scaled quantities for gauze, SAM splint, blister pads, and medications.
    Step 4: POST /api/create_response and SSE stream POST /api/create_response/stream -> verify event: first_aid_info frame and data: [DONE].
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query conditions with category=environmental
        # -> assert Hypothermia, Heat Stroke, and Altitude Sickness returned.
        # -------------------------------------------------------------------------
        res1 = client.get("/api/first-aid/conditions?category=environmental")
        assert res1.status_code == 200
        env_conditions = res1.json()
        assert len(env_conditions) >= 3
        c_titles = " ".join(c["title"] for c in env_conditions)
        assert "Hypothermia" in c_titles
        assert "Heat" in c_titles
        assert "Altitude" in c_titles or "Mountain Sickness" in c_titles or "AMS" in c_titles

        # Condition detail endpoint
        res1_detail = client.get("/api/first-aid/conditions/hypothermia")
        assert res1_detail.status_code == 200
        assert res1_detail.json()["condition_id"] == "hypothermia"
        assert "Hypothermia" in res1_detail.json()["title"]

        # Unknown condition detail -> 404
        assert client.get("/api/first-aid/conditions/unknown-condition-xyz").status_code == 404

        # Evacuation protocol endpoint
        res1_proto = client.get("/api/first-aid/evacuation-protocol")
        assert res1_proto.status_code == 200
        proto_data = res1_proto.json()
        assert "satellite_sos" in proto_data
        assert "helicopter_lz" in proto_data
        assert "ground_evacuation" in proto_data

        # -------------------------------------------------------------------------
        # Step 2: Wilderness Triage assessment for non-ambulatory hypothermic hiker
        # -> assert Hypothermia match and assisted walkout / SAR.
        # -------------------------------------------------------------------------
        triage_payload = {
            "symptoms": ["uncontrollable shivering", "fumbling hands"],
            "is_conscious": True,
            "can_walk": False,
        }
        res2 = client.post("/api/first-aid/triage", json=triage_payload)
        assert res2.status_code == 200
        triage_data = res2.json()
        assert "Hypothermia" in triage_data["condition_match"]
        assert triage_data["sar_recommended"] is True
        assert "Immediate" in triage_data["evacuation_urgency"] or "Urgent" in triage_data["evacuation_urgency"]
        # Assert assisted walkout / SAR in immediate action or treatment steps
        action_and_steps = triage_data["immediate_action"] + " " + " ".join(triage_data["treatment_steps"])
        assert "SAR" in action_and_steps or "Search & Rescue" in action_and_steps or "walkout" in action_and_steps

        # -------------------------------------------------------------------------
        # Step 3: First aid kit calculator for group of 4 on a 5-day trip
        # -> assert scaled quantities for gauze, SAM splint, blister pads, and medications.
        # -------------------------------------------------------------------------
        kit_payload = {
            "party_size": 4,
            "trip_days": 5,
        }
        res3 = client.post("/api/first-aid/kit-calculator", json=kit_payload)
        assert res3.status_code == 200
        kit_data = res3.json()
        assert kit_data["party_size"] == 4
        assert kit_data["trip_days"] == 5
        assert kit_data["total_items"] > 0
        items_dict = {it["name"].lower(): it["quantity"] for it in kit_data["items"]}

        gauze_count = next((qty for name, qty in items_dict.items() if "gauze" in name), 0)
        assert gauze_count >= 16

        splint_count = next((qty for name, qty in items_dict.items() if "splint" in name), 0)
        assert splint_count >= 2

        blister_count = next((qty for name, qty in items_dict.items() if "blister" in name), 0)
        assert blister_count >= 16

        meds_count = next((qty for name, qty in items_dict.items() if "ibuprofen" in name or "medication" in name), 0)
        assert meds_count >= 20

        # -------------------------------------------------------------------------
        # Step 4: Assistant chat interaction and SSE streaming
        # -> verify event: first_aid_info frame and data: [DONE].
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "A hiker fell, has uncontrollable shivering, fumbling hands, and cannot walk. What first aid should we do?",
            "customer_id": "cust-first-aid-101",
        }
        res4_sync = client.post("/api/create_response", json=chat_req)
        assert res4_sync.status_code == 200
        data4_sync = res4_sync.json()
        assert "first_aid_info" in data4_sync
        fa_info = data4_sync["first_aid_info"]
        assert fa_info is not None
        assert "action" in fa_info
        assert "Hypothermia" in data4_sync["answer"] or "First Aid" in data4_sync["answer"]

        # SSE streaming
        res4_stream = client.post(
            "/api/create_response/stream",
            json={"question": "A hiker fell, has uncontrollable shivering, fumbling hands, and cannot walk. What first aid should we do?"},
        )
        assert res4_stream.status_code == 200
        raw_events = [line.strip() for line in res4_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        first_aid_event = next((e for e in parsed_events if e.get("event") == "first_aid_info"), None)
        assert first_aid_event is not None
        assert "first_aid_info" in first_aid_event
        stream_fa_info = first_aid_event["first_aid_info"]
        assert stream_fa_info is not None
        assert "action" in stream_fa_info

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Hypothermia" in full_text or "First Aid" in full_text or "Triage" in full_text


@pytest.mark.anyio
async def test_first_aid_journey_real_mode_execution():
    """Verifies first aid prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value={"firstName": "Alex", "membership": "Platinum", "orders": []}),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search_service,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(
            return_value="Patient shows signs of hypothermia and cannot walk. Shelter immediately, insulate from ground, and activate satellite SOS."
        ),
    ) as mock_llm, patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response",
            json={"question": "A hiker fell, has uncontrollable shivering, and cannot walk. How do we triage and evacuate?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "first_aid_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "first_aid_prompt" in call_kwargs
        assert "First Aid" in call_kwargs["first_aid_prompt"] or "Medical" in call_kwargs["first_aid_prompt"]
        assert "Hypothermia" in call_kwargs["first_aid_prompt"] or "Evacuation" in call_kwargs["first_aid_prompt"]
