import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_complete_permits_and_passes_journey():
    """End-to-end API journey test for Backcountry Permits & National Parks Pass Assistant Tooling:

    Step 1: Query GET /api/permits/passes and assert standard pass catalog and prices ($80 America the Beautiful, $0 Military).
    Step 2: Query GET /api/permits/lotteries and assert lottery windows and bear canister requirements for Mount Whitney and The Enchantments.
    Step 3: Call POST /api/create_response with 'Do I need a permit for Mount Whitney or Enchantments?' and assert permits_info and detailed response answer.
    Step 4: Stream POST /api/create_response/stream with 'Which park pass covers Rainier and Olympic National Parks?' and verify SSE event: 'permits_info' frame, token chunks, and data: [DONE].
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query GET /api/permits/passes
        # Assert standard pass catalog and prices ($80 America the Beautiful, $0 Military)
        # -------------------------------------------------------------------------
        passes_res = client.get("/api/permits/passes")
        assert passes_res.status_code == 200
        pass_catalog = passes_res.json()
        assert len(pass_catalog) >= 5

        pass_map = {p["pass_id"]: p for p in pass_catalog}
        assert "america-the-beautiful" in pass_map
        assert pass_map["america-the-beautiful"]["price"] == 80.0
        assert "military-pass" in pass_map
        assert pass_map["military-pass"]["price"] == 0.0
        assert "senior-pass" in pass_map
        assert pass_map["senior-pass"]["price"] == 80.0
        assert "fourth-grade-pass" in pass_map
        assert pass_map["fourth-grade-pass"]["price"] == 0.0
        assert "northwest-forest-pass" in pass_map
        assert pass_map["northwest-forest-pass"]["price"] == 30.0

        # Optional filter check
        filtered_res = client.get("/api/permits/passes?pass_type=military")
        assert filtered_res.status_code == 200
        filtered_passes = filtered_res.json()
        assert len(filtered_passes) == 1
        assert filtered_passes[0]["pass_id"] == "military-pass"

        # -------------------------------------------------------------------------
        # Step 2: Query GET /api/permits/lotteries
        # Assert lottery windows and bear canister requirements for Mount Whitney and The Enchantments
        # -------------------------------------------------------------------------
        lotteries_res = client.get("/api/permits/lotteries")
        assert lotteries_res.status_code == 200
        lotteries_catalog = lotteries_res.json()
        assert len(lotteries_catalog) >= 5

        lottery_map = {lottery["lottery_id"]: lottery for lottery in lotteries_catalog}
        assert "mount-whitney" in lottery_map
        whitney = lottery_map["mount-whitney"]
        assert "February" in whitney["lottery_window"]
        assert whitney["bear_canister_required"] is True
        assert whitney["fee_per_person"] == 15.0

        assert "the-enchantments" in lottery_map
        enchantments = lottery_map["the-enchantments"]
        assert "February" in enchantments["lottery_window"]
        assert enchantments["bear_canister_required"] is True
        assert enchantments["fee_per_person"] == 6.0

        # Also verify GET /api/permits/regulations
        regulations_res = client.get("/api/permits/regulations")
        assert regulations_res.status_code == 200
        regulations = regulations_res.json()
        assert len(regulations) >= 4
        categories = {r["category"] for r in regulations}
        assert "bear_canister" in categories

        # -------------------------------------------------------------------------
        # Step 3: Call POST /api/create_response with "Do I need a permit for Mount Whitney or Enchantments?"
        # Assert permits_info and detailed response answer
        # -------------------------------------------------------------------------
        chat_res_3 = client.post(
            "/api/create_response",
            json={"question": "Do I need a permit for Mount Whitney or Enchantments?"},
        )
        assert chat_res_3.status_code == 200
        data_3 = chat_res_3.json()
        assert "permits_info" in data_3
        assert "answer" in data_3

        permits_info_3 = data_3["permits_info"]
        assert permits_info_3["action"] == "lotteries"
        assert permits_info_3["lotteries"] is not None
        assert len(permits_info_3["lotteries"]) >= 2

        answer_3 = data_3["answer"]
        assert "Mount Whitney" in answer_3 or "Whitney" in answer_3
        assert "Enchantments" in answer_3
        assert "permit" in answer_3.lower() or "lottery" in answer_3.lower()
        assert "bear canister" in answer_3.lower()
        assert "recreation.gov" in answer_3.lower()

        # -------------------------------------------------------------------------
        # Step 4: Stream POST /api/create_response/stream with "Which park pass covers Rainier and Olympic National Parks?"
        # Verify SSE event: 'permits_info' frame, token chunks, and data: [DONE]
        # -------------------------------------------------------------------------
        stream_res_4 = client.post(
            "/api/create_response/stream",
            json={"question": "Which park pass covers Rainier and Olympic National Parks?"},
        )
        assert stream_res_4.status_code == 200

        raw_text = stream_res_4.text
        assert "data: [DONE]" in raw_text

        events = []
        for block in raw_text.split("\n\n"):
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

        # Verify SSE event: 'permits_info' frame
        permits_event = next((e for e in events if e.get("event") == "permits_info"), None)
        assert permits_event is not None
        assert "permits_info" in permits_event
        permits_payload = permits_event["permits_info"]
        assert permits_payload["action"] in ["passes", "recommend"]
        assert permits_payload["passes"] is not None
        assert any(p["pass_id"] == "america-the-beautiful" for p in permits_payload["passes"])

        # Verify token chunks exist
        chunk_events = [e for e in events if "chunk" in e]
        assert len(chunk_events) > 0
        full_streamed_answer = "".join(e["chunk"] for e in chunk_events)
        assert "America the Beautiful" in full_streamed_answer
        assert "$80" in full_streamed_answer
