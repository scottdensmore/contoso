import json
from unittest.mock import patch

import pytest
from contoso_chat.rewards import reset_rewards_state
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_rewards_state():
    reset_rewards_state()
    yield
    reset_rewards_state()


def test_complete_loyalty_rewards_journey():
    """
    End-to-end API journey test for customer loyalty rewards & benefits tooling:
    - Step 1: Inquire about loyalty rewards program and membership tiers -> Assistant explains Trailblazer, Pathfinder, Summit Explorer perks.
    - Step 2: Check current rewards balance and tier status -> Assistant returns 650 points, Pathfinder tier, and 850 points needed for Summit Explorer.
    - Step 3: Inquire about available vouchers -> Assistant lists $10 off (200 pts) and $25 off (500 pts).
    - Step 4: Redeem $10 off voucher -> Assistant confirms redemption, provides promo code REWARD10, and reports remaining 450 points.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Diagnostics & REST Endpoints verification
        # -------------------------------------------------------------------------
        profile_res = client.get("/api/loyalty/profile")
        assert profile_res.status_code == 200
        profile_data = profile_res.json()
        assert profile_data["customer_id"] == "cust-default"
        assert profile_data["points_balance"] == 650
        assert profile_data["lifetime_points"] == 850
        assert profile_data["tier"] == "Pathfinder"
        assert profile_data["points_to_next_tier"] == 650
        assert profile_data["next_tier"] == "Summit Explorer"
        assert len(profile_data["available_vouchers"]) > 0

        tiers_res = client.get("/api/loyalty/tiers")
        assert tiers_res.status_code == 200
        tiers_data = tiers_res.json()
        assert len(tiers_data) == 3
        tier_names = [t["tier_name"] for t in tiers_data]
        assert "Trailblazer" in tier_names
        assert "Pathfinder" in tier_names
        assert "Summit Explorer" in tier_names

        # -------------------------------------------------------------------------
        # Step 1: Inquire about loyalty rewards program and membership tiers ->
        # Assistant explains Trailblazer, Pathfinder, Summit Explorer perks
        # -------------------------------------------------------------------------
        step1_res = client.post(
            "/api/create_response",
            json={"question": "Tell me about your loyalty rewards program and membership tiers"},
        )
        assert step1_res.status_code == 200
        step1_data = step1_res.json()

        assert "rewards_info" in step1_data
        assert step1_data["rewards_info"]["action"] == "tiers"
        assert len(step1_data["rewards_info"]["tiers"]) == 3

        answer1 = step1_data["answer"]
        assert "Trailblazer" in answer1
        assert "Pathfinder" in answer1
        assert "Summit Explorer" in answer1
        assert "1.0x" in answer1 or "1x" in answer1.lower()
        assert "1.25x" in answer1
        assert "1.5x" in answer1

        # Streaming verification for Step 1
        stream_res_1 = client.post(
            "/api/create_response/stream",
            json={"question": "What are the member perks and tier benefits?"},
        )
        assert stream_res_1.status_code == 200
        events_1 = [
            json.loads(line.removeprefix("data: "))
            for line in stream_res_1.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        rewards_event_1 = next((e for e in events_1 if e.get("event") == "rewards_info"), None)
        assert rewards_event_1 is not None
        assert rewards_event_1["rewards_info"]["action"] == "tiers"

        # -------------------------------------------------------------------------
        # Step 2: Check current rewards balance and tier status ->
        # Assistant returns 650 points, Pathfinder tier, and 850 points needed for Summit Explorer
        # -------------------------------------------------------------------------
        step2_res = client.post(
            "/api/create_response",
            json={"question": "How many reward points do I have and what is my tier status?"},
        )
        assert step2_res.status_code == 200
        step2_data = step2_res.json()

        assert "rewards_info" in step2_data
        rewards_info2 = step2_data["rewards_info"]
        assert rewards_info2["action"] == "balance"
        assert rewards_info2["loyalty"]["points_balance"] == 650
        assert rewards_info2["loyalty"]["tier"] == "Pathfinder"
        assert rewards_info2["loyalty"]["points_to_next_tier"] == 650
        assert rewards_info2["loyalty"]["next_tier"] == "Summit Explorer"

        answer2 = step2_data["answer"]
        assert "650" in answer2
        assert "Pathfinder" in answer2
        assert "Summit Explorer" in answer2

        # Streaming verification for Step 2
        stream_res_2 = client.post(
            "/api/create_response/stream",
            json={"question": "Can you check my points balance?"},
        )
        assert stream_res_2.status_code == 200
        events_2 = [
            json.loads(line.removeprefix("data: "))
            for line in stream_res_2.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        rewards_event_2 = next((e for e in events_2 if e.get("event") == "rewards_info"), None)
        assert rewards_event_2 is not None
        assert rewards_event_2["rewards_info"]["action"] == "balance"
        assert rewards_event_2["rewards_info"]["loyalty"]["points_balance"] == 650

        # -------------------------------------------------------------------------
        # Step 3: Inquire about available vouchers ->
        # Assistant lists $10 off (200 pts) and $25 off (500 pts)
        # -------------------------------------------------------------------------
        step3_res = client.post(
            "/api/create_response",
            json={"question": "What reward vouchers are available for me to get?"},
        )
        assert step3_res.status_code == 200
        step3_data = step3_res.json()

        assert "rewards_info" in step3_data
        rewards_info3 = step3_data["rewards_info"]
        assert rewards_info3["action"] == "vouchers"
        assert rewards_info3["points_balance"] == 650
        voucher_ids = [v["id"] for v in rewards_info3["available_vouchers"]]
        assert "voucher-10" in voucher_ids
        assert "voucher-25" in voucher_ids

        answer3 = step3_data["answer"]
        assert "$10" in answer3
        assert "200" in answer3
        assert "$25" in answer3
        assert "500" in answer3

        # Streaming verification for Step 3
        stream_res_3 = client.post(
            "/api/create_response/stream",
            json={"question": "What can I get with my rewards?"},
        )
        assert stream_res_3.status_code == 200
        events_3 = [
            json.loads(line.removeprefix("data: "))
            for line in stream_res_3.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        rewards_event_3 = next((e for e in events_3 if e.get("event") == "rewards_info"), None)
        assert rewards_event_3 is not None
        assert rewards_event_3["rewards_info"]["action"] == "vouchers"

        # -------------------------------------------------------------------------
        # Step 4: Redeem $10 off voucher ->
        # Assistant confirms redemption, provides promo code REWARD10, and reports remaining 450 points
        # -------------------------------------------------------------------------
        # First test REST endpoint redemption
        rest_redeem_res = client.post(
            "/api/loyalty/redeem",
            json={"voucher_id": "voucher-10", "customer_id": "cust-default"},
        )
        assert rest_redeem_res.status_code == 200
        rest_redeem_data = rest_redeem_res.json()
        assert rest_redeem_data["success"] is True
        assert rest_redeem_data["promo_code"] == "REWARD10"
        assert rest_redeem_data["remaining_points"] == 450

        # Reset state to test via conversational assistant
        reset_rewards_state()

        step4_res = client.post(
            "/api/create_response",
            json={"question": "Redeem my points for a $10 discount voucher"},
        )
        assert step4_res.status_code == 200
        step4_data = step4_res.json()

        assert "rewards_info" in step4_data
        rewards_info4 = step4_data["rewards_info"]
        assert rewards_info4["action"] == "redeem"
        assert rewards_info4["redemption"]["success"] is True
        assert rewards_info4["redemption"]["promo_code"] == "REWARD10"
        assert rewards_info4["redemption"]["remaining_points"] == 450

        answer4 = step4_data["answer"]
        assert "REWARD10" in answer4
        assert "450" in answer4

        # Verify updated profile reflects the deduction (450 points)
        updated_profile_res = client.get("/api/loyalty/profile")
        assert updated_profile_res.status_code == 200
        assert updated_profile_res.json()["points_balance"] == 450
