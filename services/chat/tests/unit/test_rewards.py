import pytest
from contoso_chat.rewards import (
    CustomerLoyaltyInfo,
    LoyaltyRedemptionResponse,
    RewardsIntent,
    build_rewards_prompt,
    detect_rewards_intent,
    format_rewards_response,
    get_customer_loyalty,
    get_tier_perks,
    redeem_voucher,
    reset_rewards_state,
)


@pytest.fixture(autouse=True)
def setup_and_teardown():
    reset_rewards_state()
    yield
    reset_rewards_state()


class TestCustomerLoyaltyProfile:
    def test_get_customer_loyalty_default_customer(self):
        profile = get_customer_loyalty()
        assert isinstance(profile, CustomerLoyaltyInfo)
        assert profile.customer_id == "cust-default"
        assert profile.points_balance == 650
        assert profile.lifetime_points == 850
        assert profile.tier == "Pathfinder"
        assert profile.points_to_next_tier == 650
        assert profile.next_tier == "Summit Explorer"
        assert isinstance(profile.available_vouchers, list)
        voucher_ids = [v.id for v in profile.available_vouchers]
        assert "voucher-10" in voucher_ids
        assert "voucher-25" in voucher_ids
        assert "voucher-ship" in voucher_ids
        assert "voucher-50" not in voucher_ids

    def test_get_customer_loyalty_explicit_id(self):
        profile = get_customer_loyalty("cust-default")
        assert profile.customer_id == "cust-default"
        assert profile.points_balance == 650


class TestMemberTiers:
    def test_get_all_tier_perks(self):
        tiers = get_tier_perks()
        assert isinstance(tiers, list)
        assert len(tiers) == 3
        tier_names = [t.tier_name for t in tiers]
        assert tier_names == ["Trailblazer", "Pathfinder", "Summit Explorer"]

    def test_get_tier_perks_by_name(self):
        pathfinder = get_tier_perks("Pathfinder")
        assert len(pathfinder) == 1
        tier = pathfinder[0]
        assert tier.tier_name == "Pathfinder"
        assert tier.points_multiplier == 1.25
        assert tier.min_points == 500
        assert "Free standard shipping on all orders" in tier.perks

        trailblazer = get_tier_perks("trailblazer")
        assert len(trailblazer) == 1
        assert trailblazer[0].points_multiplier == 1.0

        summit = get_tier_perks("Summit Explorer")
        assert len(summit) == 1
        assert summit[0].points_multiplier == 1.5

    def test_get_tier_perks_unknown(self):
        res = get_tier_perks("Diamond Member")
        assert res == []


class TestVoucherRedemption:
    def test_successful_voucher_redemption(self):
        res = redeem_voucher("voucher-10", "cust-default")
        assert isinstance(res, LoyaltyRedemptionResponse)
        assert res.success is True
        assert res.promo_code == "REWARD10"
        assert res.remaining_points == 450
        assert res.voucher is not None
        assert res.voucher.id == "voucher-10"
        assert "REWARD10" in res.message

        # Verify state persistence
        updated = get_customer_loyalty("cust-default")
        assert updated.points_balance == 450
        # Lifetime points should remain unchanged
        assert updated.lifetime_points == 850

    def test_insufficient_balance_rejection(self):
        # Default customer has 650 points; voucher-50 costs 1000 points
        res = redeem_voucher("voucher-50", "cust-default")
        assert res.success is False
        assert res.promo_code is None
        assert res.remaining_points == 650
        assert "insufficient" in res.message.lower()

        # Balance remains unchanged
        updated = get_customer_loyalty("cust-default")
        assert updated.points_balance == 650

    def test_subsequent_redemption_insufficient_points(self):
        # 1st redemption: 650 - 200 = 450
        res1 = redeem_voucher("voucher-10", "cust-default")
        assert res1.success is True
        assert res1.remaining_points == 450

        # 2nd redemption: voucher-25 costs 500 points > 450
        res2 = redeem_voucher("voucher-25", "cust-default")
        assert res2.success is False
        assert res2.remaining_points == 450
        assert "insufficient" in res2.message.lower()

    def test_invalid_voucher_id(self):
        res = redeem_voucher("voucher-nonexistent", "cust-default")
        assert res.success is False
        assert "not found" in res.message.lower()
        assert res.remaining_points == 650


class TestDetectRewardsIntent:
    @pytest.mark.parametrize(
        ("query", "expected_action"),
        [
            ("How many reward points do I have?", "balance"),
            ("Can you check my points balance?", "balance"),
            ("What is my loyalty status?", "balance"),
            ("What are the benefits of Pathfinder tier?", "tiers"),
            ("Tell me about member perks", "tiers"),
            ("How to reach summit explorer?", "tiers"),
            ("What vouchers are available?", "vouchers"),
            ("What can I get with my rewards?", "vouchers"),
            ("What can i get with my points?", "vouchers"),
            ("Available rewards for my account", "vouchers"),
            ("Redeem my points for a $10 discount voucher", "redeem"),
            ("Claim voucher for shipping", "redeem"),
            ("I want to exchange points for a reward", "redeem"),
        ],
    )
    def test_detect_rewards_intent_actions(self, query: str, expected_action: str):
        intent = detect_rewards_intent(query)
        assert intent is not None
        assert isinstance(intent, RewardsIntent)
        assert intent.action == expected_action

    def test_detect_rewards_intent_extracts_voucher(self):
        intent = detect_rewards_intent("Redeem my points for a $10 discount voucher")
        assert intent is not None
        assert intent.action == "redeem"
        assert intent.voucher_id == "voucher-10"
        assert intent.requested_amount == 10

        intent2 = detect_rewards_intent("Redeem $25 off voucher")
        assert intent2 is not None
        assert intent2.action == "redeem"
        assert intent2.voucher_id == "voucher-25"
        assert intent2.requested_amount == 25

        intent3 = detect_rewards_intent("Claim voucher for free shipping")
        assert intent3 is not None
        assert intent3.action == "redeem"
        assert intent3.voucher_id == "voucher-ship"

    def test_detect_rewards_intent_non_rewards_queries(self):
        assert detect_rewards_intent("Do you have waterproof hiking boots?") is None
        assert detect_rewards_intent("Where is my order CTSO-12345?") is None
        assert detect_rewards_intent("What is your return policy?") is None
        assert detect_rewards_intent("") is None


class TestPromptAndResponseFormatting:
    def test_build_rewards_prompt(self):
        intent = RewardsIntent(action="balance")
        loyalty = get_customer_loyalty("cust-default")
        prompt = build_rewards_prompt(intent, loyalty)
        assert "Loyalty Rewards & Benefits Guidance" in prompt
        assert "Pathfinder" in prompt
        assert "650" in prompt
        assert "Trailblazer" in prompt
        assert "Summit Explorer" in prompt

    def test_format_rewards_response_balance(self):
        intent = RewardsIntent(action="balance")
        loyalty = get_customer_loyalty("cust-default")
        resp = format_rewards_response(intent, loyalty)
        assert "rewards_info" in resp
        assert resp["rewards_info"]["action"] == "balance"
        assert "650" in resp["answer"]
        assert "Pathfinder" in resp["answer"]
        assert "Summit Explorer" in resp["answer"]

    def test_format_rewards_response_tiers(self):
        intent = RewardsIntent(action="tiers")
        resp = format_rewards_response(intent)
        assert "rewards_info" in resp
        assert resp["rewards_info"]["action"] == "tiers"
        assert len(resp["rewards_info"]["tiers"]) == 3
        assert "Trailblazer" in resp["answer"]
        assert "Pathfinder" in resp["answer"]
        assert "Summit Explorer" in resp["answer"]

    def test_format_rewards_response_vouchers(self):
        intent = RewardsIntent(action="vouchers")
        loyalty = get_customer_loyalty("cust-default")
        resp = format_rewards_response(intent, loyalty)
        assert "rewards_info" in resp
        assert resp["rewards_info"]["action"] == "vouchers"
        assert "$10" in resp["answer"]
        assert "200" in resp["answer"]
        assert "$25" in resp["answer"]
        assert "500" in resp["answer"]

    def test_format_rewards_response_redeem(self):
        intent = RewardsIntent(action="redeem", voucher_id="voucher-10")
        resp = format_rewards_response(intent)
        assert "rewards_info" in resp
        assert resp["rewards_info"]["action"] == "redeem"
        assert resp["rewards_info"]["redemption"]["success"] is True
        assert "REWARD10" in resp["answer"]
        assert "450" in resp["answer"]
