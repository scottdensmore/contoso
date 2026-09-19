import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_complete_gear_repair_journey():
    """End-to-end API journey test for Gear Repair Diagnosis & Maintenance Intent Tooling:

    Step 1: Query GET /api/repair/services and verify available repair services catalog and rates.
    Step 2: Query POST /api/repair/diagnose with {'issue': 'broken zipper on tent', 'gear_type': 'tent'}
            and verify diagnosed service (5 zipper fix, 3 days turnaround).
    Step 3: Call POST /api/create_response with 'My rain jacket is wetting out, can you reproof the DWR waterproofing?'
            and assert repair_info and detailed response answer.
    Step 4: Stream POST /api/create_response/stream with 'How much to sharpen and wax my snowboard?'
            and verify SSE event: 'repair_info' frame, token chunks, and data: [DONE].
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query GET /api/repair/services
        # Verify available repair services catalog and rates
        # -------------------------------------------------------------------------
        services_res = client.get("/api/repair/services")
        assert services_res.status_code == 200
        services = services_res.json()
        assert isinstance(services, list)
        assert len(services) == 12

        service_map = {s["service_id"]: s for s in services}
        assert "tent-seam-sealing" in service_map
        assert service_map["tent-seam-sealing"]["price"] == 35.0
        assert service_map["tent-seam-sealing"]["turnaround_days"] == 4

        assert "tent-zipper-slider" in service_map
        assert service_map["tent-zipper-slider"]["price"] == 25.0
        assert service_map["tent-zipper-slider"]["turnaround_days"] == 3

        assert "tent-fabric-patch" in service_map
        assert service_map["tent-fabric-patch"]["price"] == 30.0
        assert service_map["tent-fabric-patch"]["turnaround_days"] == 4

        assert "tent-pole-restringing" in service_map
        assert service_map["tent-pole-restringing"]["price"] == 20.0
        assert service_map["tent-pole-restringing"]["turnaround_days"] == 2

        assert "apparel-dwr-reproofing" in service_map
        assert service_map["apparel-dwr-reproofing"]["price"] == 30.0
        assert service_map["apparel-dwr-reproofing"]["turnaround_days"] == 3

        assert "apparel-down-baffle" in service_map
        assert service_map["apparel-down-baffle"]["price"] == 40.0
        assert service_map["apparel-down-baffle"]["turnaround_days"] == 5

        assert "apparel-jacket-zipper" in service_map
        assert service_map["apparel-jacket-zipper"]["price"] == 35.0
        assert service_map["apparel-jacket-zipper"]["turnaround_days"] == 4

        assert "pack-zipper-repair" in service_map
        assert service_map["pack-zipper-repair"]["price"] == 25.0
        assert service_map["pack-zipper-repair"]["turnaround_days"] == 4

        assert "pack-buckle-replacement" in service_map
        assert service_map["pack-buckle-replacement"]["price"] == 15.0
        assert service_map["pack-buckle-replacement"]["turnaround_days"] == 2

        assert "pack-frame-repair" in service_map
        assert service_map["pack-frame-repair"]["price"] == 30.0
        assert service_map["pack-frame-repair"]["turnaround_days"] == 3

        assert "winter-edge-wax" in service_map
        assert service_map["winter-edge-wax"]["price"] == 45.0
        assert service_map["winter-edge-wax"]["turnaround_days"] == 2

        assert "winter-ptex-weld" in service_map
        assert service_map["winter-ptex-weld"]["price"] == 50.0
        assert service_map["winter-ptex-weld"]["turnaround_days"] == 4

        # Verify category filter parameter works
        winter_res = client.get("/api/repair/services?category=winter")
        assert winter_res.status_code == 200
        winter_services = winter_res.json()
        assert len(winter_services) == 2
        assert {s["service_id"] for s in winter_services} == {"winter-edge-wax", "winter-ptex-weld"}

        # -------------------------------------------------------------------------
        # Step 2: Query POST /api/repair/diagnose
        # with {'issue': 'broken zipper on tent', 'gear_type': 'tent'}
        # Verify diagnosed service (5 zipper fix, 3 days turnaround)
        # -------------------------------------------------------------------------
        diagnose_res = client.post(
            "/api/repair/diagnose",
            json={"issue": "broken zipper on tent", "gear_type": "tent"},
        )
        assert diagnose_res.status_code == 200
        diagnosis = diagnose_res.json()
        assert diagnosis["issue_description"] == "broken zipper on tent"
        assert diagnosis["diagnosed_service"] is not None
        assert diagnosis["diagnosed_service"]["service_id"] == "tent-zipper-slider"
        assert diagnosis["diagnosed_service"]["name"] == "Tent Zipper Slider Replacement"
        assert diagnosis["estimated_cost"] == 25.0
        assert diagnosis["turnaround_days"] == 3
        assert diagnosis["is_covered_by_warranty"] is False
        assert len(diagnosis["recommendation"]) > 0
        assert diagnosis["self_care_tip"] is not None

        # -------------------------------------------------------------------------
        # Step 3: Call POST /api/create_response with
        # 'My rain jacket is wetting out, can you reproof the DWR waterproofing?'
        # Assert repair_info and detailed response answer
        # -------------------------------------------------------------------------
        chat_res = client.post(
            "/api/create_response",
            json={"question": "My rain jacket is wetting out, can you reproof the DWR waterproofing?"},
        )
        assert chat_res.status_code == 200
        chat_data = chat_res.json()
        assert "repair_info" in chat_data
        repair_info = chat_data["repair_info"]
        assert repair_info["action"] == "diagnose"
        assert "diagnosis" in repair_info
        diag = repair_info["diagnosis"]
        assert diag["diagnosed_service"]["service_id"] == "apparel-dwr-reproofing"
        assert diag["estimated_cost"] == 30.0
        assert diag["turnaround_days"] == 3

        answer = chat_data["answer"]
        assert "DWR" in answer or "reproofing" in answer.lower()
        assert "30" in answer
        assert "3" in answer

        # -------------------------------------------------------------------------
        # Step 4: Stream POST /api/create_response/stream with
        # 'How much to sharpen and wax my snowboard?'
        # Verify SSE event: 'repair_info' frame, token chunks, and data: [DONE]
        # -------------------------------------------------------------------------
        stream_res = client.post(
            "/api/create_response/stream",
            json={"question": "How much to sharpen and wax my snowboard?"},
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

        # Verify SSE event: 'repair_info' frame
        repair_event = next((e for e in events if e.get("event") == "repair_info"), None)
        assert repair_event is not None
        assert "repair_info" in repair_event
        repair_payload = repair_event["repair_info"]
        assert repair_payload["action"] == "diagnose"
        assert repair_payload["diagnosis"]["diagnosed_service"]["service_id"] == "winter-edge-wax"
        assert repair_payload["diagnosis"]["estimated_cost"] == 45.0

        # Verify token chunks exist
        chunk_events = [e for e in events if "chunk" in e]
        assert len(chunk_events) > 0
        streamed_answer = "".join(c["chunk"] for c in chunk_events)
        assert "45" in streamed_answer or "wax" in streamed_answer.lower()


@pytest.mark.anyio
async def test_repair_journey_real_mode_execution():
    """Verifies repair prompt injection and response payload in real mode execution."""
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
            return_value="Our Tent Zipper Slider Replacement service costs 5 and takes approximately 3 days."
        ),
    ) as mock_llm, patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response",
            json={"question": "I have a broken zipper on tent, what is the repair cost?"},
        )
        assert res.status_code == 200
        data = res.json()

        assert "repair_info" in data
        assert data["repair_info"]["action"] == "diagnose"
        assert data["repair_info"]["diagnosis"]["diagnosed_service"]["service_id"] == "tent-zipper-slider"

        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "repair_prompt" in call_kwargs
        assert "Contoso Outdoors Official Gear Repair" in call_kwargs["repair_prompt"]
        assert "Tent Zipper Slider Replacement" in call_kwargs["repair_prompt"]
