import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from contoso_chat.fire_safety import reset_fire_store
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_fire_danger_and_regulations_journey():
    """Multi-step API journey test for Fire Danger Index & Campfire Regulations Tooling:

    Step 1: GET /api/fire-safety/zones?danger_level=extreme -> assert North Cascades / Stehekin total ban returned.
    Step 2: POST /api/fire-safety/check-stove for Alpine Lakes Wilderness with alcohol stove (prohibited) and canister stove (allowed).
    Step 3: POST /api/fire-safety/reports -> submit smoke report and verify confirmed FIR- tracking ID and status.
    Step 4: POST /api/create_response and SSE stream POST /api/create_response/stream -> verify event: fire_safety_info frame and data: [DONE].
    """
    reset_fire_store()
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query fire zones with extreme danger level
        # -> assert North Cascades / Stehekin total ban returned.
        # -------------------------------------------------------------------------
        res1 = client.get("/api/fire-safety/zones?danger_level=extreme")
        assert res1.status_code == 200
        extreme_zones = res1.json()
        assert len(extreme_zones) >= 1
        stehekin = next((z for z in extreme_zones if "stehekin" in z["zone_id"]), None)
        assert stehekin is not None
        assert "North Cascades" in stehekin["name"]
        assert stehekin["danger_level"].lower() == "extreme"
        assert "total" in stehekin["restriction_stage"].lower() and "ban" in stehekin["restriction_stage"].lower()
        assert stehekin["campfires_allowed"] is False

        # Check detail endpoint
        res1_detail = client.get(f"/api/fire-safety/zones/{stehekin['zone_id']}")
        assert res1_detail.status_code == 200
        assert res1_detail.json()["zone_id"] == stehekin["zone_id"]

        # Check 404 for unknown zone
        assert client.get("/api/fire-safety/zones/unknown-zone-999").status_code == 404

        # -------------------------------------------------------------------------
        # Step 2: Stove compliance check for Alpine Lakes Wilderness
        # -> alcohol stove (prohibited) and canister stove (allowed).
        # -------------------------------------------------------------------------
        res2_alcohol = client.post(
            "/api/fire-safety/check-stove",
            json={"zone_id": "alpine-lakes", "stove_type": "alcohol stove"},
        )
        assert res2_alcohol.status_code == 200
        alcohol_data = res2_alcohol.json()
        assert alcohol_data["zone_id"] == "alpine-lakes"
        assert alcohol_data["stove_type"] == "alcohol stove"
        assert alcohol_data["is_allowed"] is False
        assert len(alcohol_data["reason"]) > 0
        assert len(alcohol_data["precautions"]) > 0

        res2_canister = client.post(
            "/api/fire-safety/check-stove",
            json={"zone_id": "alpine-lakes", "stove_type": "canister stove"},
        )
        assert res2_canister.status_code == 200
        canister_data = res2_canister.json()
        assert canister_data["zone_id"] == "alpine-lakes"
        assert canister_data["stove_type"] == "canister stove"
        assert canister_data["is_allowed"] is True
        assert len(canister_data["precautions"]) > 0

        # Check 404 for non-existent zone
        res2_404 = client.post(
            "/api/fire-safety/check-stove",
            json={"zone_id": "unknown-zone", "stove_type": "canister stove"},
        )
        assert res2_404.status_code == 404

        # Verify safety protocol endpoint
        res_proto = client.get("/api/fire-safety/protocol")
        assert res_proto.status_code == 200
        proto_data = res_proto.json()
        assert "principles" in proto_data
        assert "drown_stir_technique" in proto_data

        # -------------------------------------------------------------------------
        # Step 3: Submit wildfire smoke report
        # -> verify confirmed FIR- tracking ID and status.
        # -------------------------------------------------------------------------
        report_payload = {
            "zone_id": "north-cascades-stehekin",
            "location_description": "Rising smoke plume observed on ridge above Rainbow Falls",
            "report_type": "smoke",
            "contact_phone": "206-555-0182",
        }
        res3 = client.post("/api/fire-safety/reports", json=report_payload)
        assert res3.status_code == 200
        report_data = res3.json()
        assert report_data["report_id"].startswith("FIR-")
        assert report_data["zone_id"] == "north-cascades-stehekin"
        assert report_data["location_description"] == report_payload["location_description"]
        assert report_data["status"] == "confirmed"
        assert len(report_data["hotline_number"]) > 0
        assert len(report_data["reported_at"]) > 0

        # Check 404 for invalid zone report
        res3_404 = client.post(
            "/api/fire-safety/reports",
            json={"zone_id": "non-existent", "location_description": "test", "report_type": "smoke"},
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Assistant chat interaction and SSE streaming
        # -> verify event: fire_safety_info frame and data: [DONE].
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "Can I have a campfire or use my canister stove in Alpine Lakes Wilderness?",
            "customer_id": "cust-fire-101",
        }
        res4_sync = client.post("/api/create_response", json=chat_req)
        assert res4_sync.status_code == 200
        data4_sync = res4_sync.json()
        assert "fire_safety_info" in data4_sync
        fs_info = data4_sync["fire_safety_info"]
        assert fs_info is not None
        assert "action" in fs_info
        assert "Alpine Lakes" in data4_sync["answer"]

        # SSE streaming
        res4_stream = client.post(
            "/api/create_response/stream",
            json={"question": "Can I have a campfire or use my canister stove in Alpine Lakes Wilderness?"},
        )
        assert res4_stream.status_code == 200
        raw_events = [line.strip() for line in res4_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        fire_event = next((e for e in parsed_events if e.get("event") == "fire_safety_info"), None)
        assert fire_event is not None
        assert "fire_safety_info" in fire_event
        stream_fs_info = fire_event["fire_safety_info"]
        assert stream_fs_info is not None
        assert "action" in stream_fs_info

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Alpine Lakes" in full_text


@pytest.mark.anyio
async def test_fire_safety_journey_real_mode_execution():
    """Verifies fire safety prompt injection and payload parity in real LLM mode."""
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
            return_value="In Alpine Lakes Wilderness, campfires are prohibited under Stage 1 restrictions, but canister stoves are permitted."
        ),
    ) as mock_llm, patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response",
            json={"question": "What are the campfire regulations and stove rules in Alpine Lakes Wilderness?"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "fire_safety_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "fire_safety_prompt" in call_kwargs
        assert "Fire Safety" in call_kwargs["fire_safety_prompt"] or "Campfire" in call_kwargs["fire_safety_prompt"]
        assert "Alpine Lakes" in call_kwargs["fire_safety_prompt"]
