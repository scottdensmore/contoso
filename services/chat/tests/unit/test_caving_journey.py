import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_caving_journey():
    """Multi-step API journey test for Alpine Caving & Single Rope Technique (SRT) Tooling:

    Step 1: Query caving routes with grade filter (GET /api/caving/caves).
    Step 2: Query specific cave detail (GET /api/caving/caves/{cave_id}).
    Step 3: Post to SRT rigging plan calculation endpoint (POST /api/caving/rigging-plan).
    Step 4: Query mandatory caving gear checklist (GET /api/caving/gear-checklist).
    Step 5: Post chat query to create_response and verify caving_info metadata.
    Step 6: Post chat query to create_response/stream and assert SSE event caving_info.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query caving routes with grade filter
        # -------------------------------------------------------------------------
        res1 = client.get("/api/caving/caves")
        assert res1.status_code == 200
        caves = res1.json()
        assert len(caves) == 5
        cave_ids = [c["cave_id"] for c in caves]
        assert "fantastic-pit-ellisons-cave" in cave_ids
        assert "mammoth-cave-historic-dallons" in cave_ids
        assert "leprechaun-cave-bighorns" in cave_ids
        assert "carlsbad-caverns-slaughter-canyon" in cave_ids
        assert "tumbling-rock-cave-passages" in cave_ids

        # Filter by grade
        res1_grade = client.get("/api/caving/caves?grade=class_4_vertical_srt")
        assert res1_grade.status_code == 200
        class_4_caves = res1_grade.json()
        assert len(class_4_caves) == 1
        assert class_4_caves[0]["cave_id"] == "fantastic-pit-ellisons-cave"

        # -------------------------------------------------------------------------
        # Step 2: Query specific cave detail (GET /api/caving/caves/{cave_id})
        # -------------------------------------------------------------------------
        res2 = client.get("/api/caving/caves/fantastic-pit-ellisons-cave")
        assert res2.status_code == 200
        cave = res2.json()
        assert cave["cave_id"] == "fantastic-pit-ellisons-cave"
        assert "Fantastic Pit" in cave["title"]
        assert cave["cave_grade"] == "class_4_vertical_srt"
        assert cave["depth_m"] == 325
        assert cave["deepest_pitch_m"] == 179
        assert cave["typical_duration_hours"] == 10.0
        assert cave["rebelays_required"] == 2
        assert cave["waterproof_oversuit_required"] is True
        assert len(cave["highlights"]) >= 3

        # 404 for unknown cave
        res2_404 = client.get("/api/caving/caves/unknown-caving-system")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Post to SRT rigging plan calculation endpoint (POST /api/caving/rigging-plan)
        # -------------------------------------------------------------------------
        rigging_req = {
            "cave_id": "fantastic-pit-ellisons-cave",
            "pitch_depth_m": 179.0,
            "caver_weight_kg": 75.0,
            "caver_pack_weight_kg": 10.0,
            "rope_diameter_mm": 10.0,
            "rope_abrasion_risk": "none_clean_drop",
            "rebelay_configured": True,
        }
        res3 = client.post("/api/caving/rigging-plan", json=rigging_req)
        assert res3.status_code == 200
        rigging_data = res3.json()
        assert rigging_data["cave_id"] == "fantastic-pit-ellisons-cave"
        assert "Fantastic Pit" in rigging_data["cave_title"]
        assert rigging_data["total_suspended_weight_kg"] == 85.0
        assert rigging_data["safety_status"] == "safe"
        assert "rappel rack" in rigging_data["descender_recommendation"].lower()
        assert "configured" in rigging_data["rebelay_advisory"].lower()
        assert "white-nose syndrome" in rigging_data["biosecurity_notice"].lower()

        # 404 for non-existent cave in rigging plan
        res3_404 = client.post("/api/caving/rigging-plan", json={"cave_id": "invalid-caving-route"})
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Query mandatory caving gear checklist (GET /api/caving/gear-checklist)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/caving/gear-checklist")
        assert res4.status_code == 200
        gear_list = res4.json()
        assert len(gear_list) == 6
        gear_ids = [g["item_id"] for g in gear_list]
        assert "en12492-caving-helmet-mount" in gear_ids
        assert "secondary-backup-headlamp" in gear_ids
        assert "caving-srt-frog-system" in gear_ids
        assert "caving-bobbin-rack-descender" in gear_ids
        assert "heavy-cordura-caving-oversuit" in gear_ids
        assert "wns-biosecurity-decon-kit" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Post chat query to create_response and verify caving_info
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "Calculate single rope technique SRT rigging plan and rope stretch for Fantastic Pit in Ellison's cave",
            "customer_id": "cust-caver-101",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "caving_info" in data5
        caving_info = data5["caving_info"]
        assert caving_info is not None
        assert caving_info["action"] == "rigging_plan"
        assert caving_info["plan"]["cave_id"] == "fantastic-pit-ellisons-cave"
        assert "Fantastic Pit" in data5["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Post chat query to create_response/stream and assert SSE event
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Calculate single rope technique SRT rigging plan and rope stretch for Fantastic Pit in Ellison's cave"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        caving_event = next((e for e in parsed_events if e.get("event") == "caving_info"), None)
        assert caving_event is not None
        assert "caving_info" in caving_event
        stream_caving_info = caving_event["caving_info"]
        assert stream_caving_info is not None
        assert stream_caving_info["action"] == "rigging_plan"
        assert stream_caving_info["plan"]["cave_id"] == "fantastic-pit-ellisons-cave"

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Fantastic Pit" in full_text


@pytest.mark.anyio
async def test_caving_journey_real_mode_execution():
    """Step 7: Verifies caving prompt injection and payload parity in real LLM mode."""
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
                return_value="Fantastic Pit in Ellison's Cave is a world-class 586ft unbroken vertical drop requiring Single Rope Technique (SRT)."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Calculate single rope technique SRT rigging plan and rope stretch for Fantastic Pit in Ellison's cave"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "caving_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "caving_prompt" in call_kwargs
        assert "Fantastic Pit" in call_kwargs["caving_prompt"]
