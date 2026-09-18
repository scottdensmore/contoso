import re
from typing import Any, Optional

from pydantic import BaseModel


class RewardVoucherModel(BaseModel):
    id: str
    title: str
    points_cost: int
    discount_amount: float
    discount_code: str
    description: str
    min_spend: Optional[float] = None


class MemberTierInfo(BaseModel):
    tier_name: str
    points_multiplier: float
    min_points: int
    perks: list[str]


class CustomerLoyaltyInfo(BaseModel):
    customer_id: str
    tier: str
    points_balance: int
    lifetime_points: int
    points_to_next_tier: int
    next_tier: Optional[str] = None
    available_vouchers: list[RewardVoucherModel]


class LoyaltyRedemptionRequest(BaseModel):
    voucher_id: str
    customer_id: Optional[str] = "cust-default"


class LoyaltyRedemptionResponse(BaseModel):
    success: bool
    message: str
    promo_code: Optional[str] = None
    remaining_points: int
    voucher: Optional[RewardVoucherModel] = None


class RewardsIntent(BaseModel):
    action: str  # "balance", "tiers", "vouchers", "redeem"
    customer_id: Optional[str] = None
    voucher_id: Optional[str] = None
    requested_amount: Optional[int] = None


MEMBER_TIERS: list[MemberTierInfo] = [
    MemberTierInfo(
        tier_name="Trailblazer",
        points_multiplier=1.0,
        min_points=0,
        perks=[
            "1x points on all purchases",
            "Birthday bonus 100 points",
            "Member-only sales",
        ],
    ),
    MemberTierInfo(
        tier_name="Pathfinder",
        points_multiplier=1.25,
        min_points=500,
        perks=[
            "1.25x points on all purchases",
            "Free standard shipping on all orders",
            "Early access to seasonal gear releases",
        ],
    ),
    MemberTierInfo(
        tier_name="Summit Explorer",
        points_multiplier=1.5,
        min_points=1500,
        perks=[
            "1.5x points on all purchases",
            "Free expedited shipping",
            "Exclusive VIP gear drops",
            "Free annual equipment tune-up",
        ],
    ),
]

REWARD_VOUCHERS: list[RewardVoucherModel] = [
    RewardVoucherModel(
        id="voucher-10",
        title="$10 Off Any Purchase",
        points_cost=200,
        discount_amount=10.0,
        discount_code="REWARD10",
        description="$10 off any purchase with minimum spend $50",
        min_spend=50.0,
    ),
    RewardVoucherModel(
        id="voucher-25",
        title="$25 Off Gear & Apparel",
        points_cost=500,
        discount_amount=25.0,
        discount_code="REWARD25",
        description="$25 off gear & apparel with minimum spend $100",
        min_spend=100.0,
    ),
    RewardVoucherModel(
        id="voucher-50",
        title="$50 Off Premium Equipment",
        points_cost=1000,
        discount_amount=50.0,
        discount_code="REWARD50",
        description="$50 off premium equipment with minimum spend $150",
        min_spend=150.0,
    ),
    RewardVoucherModel(
        id="voucher-ship",
        title="Free Expedited Shipping",
        points_cost=150,
        discount_amount=15.0,
        discount_code="REWARDSHIP",
        description="Free expedited shipping on your next order",
        min_spend=None,
    ),
]

DEFAULT_CUSTOMER_ID = "cust-default"

DEFAULT_LOYALTY_DATA: dict[str, dict[str, int]] = {
    DEFAULT_CUSTOMER_ID: {
        "points_balance": 650,
        "lifetime_points": 850,
    }
}

_customer_points_db: dict[str, dict[str, int]] = {
    DEFAULT_CUSTOMER_ID: {
        "points_balance": 650,
        "lifetime_points": 850,
    }
}


def reset_rewards_state() -> None:
    """Resets in-memory customer points state for tests."""
    global _customer_points_db
    _customer_points_db = {
        DEFAULT_CUSTOMER_ID: {
            "points_balance": 650,
            "lifetime_points": 850,
        }
    }


def _get_tier_info(lifetime_points: int) -> tuple[str, int, Optional[str]]:
    """Calculates tier, points_to_next_tier, and next_tier from lifetime points."""
    if lifetime_points >= 1500:
        return "Summit Explorer", 0, None
    elif lifetime_points >= 500:
        return "Pathfinder", 1500 - lifetime_points, "Summit Explorer"
    else:
        return "Trailblazer", 500 - lifetime_points, "Pathfinder"


def get_tier_perks(tier_name: Optional[str] = None) -> list[MemberTierInfo]:
    """Returns member tiers and their perks, optionally filtered by tier name."""
    if not tier_name or not tier_name.strip():
        return list(MEMBER_TIERS)
    normalized = tier_name.strip().lower()
    return [t for t in MEMBER_TIERS if t.tier_name.lower() == normalized or normalized in t.tier_name.lower()]


def get_customer_loyalty(customer_id: Optional[str] = None) -> CustomerLoyaltyInfo:
    """Retrieves customer loyalty info including points, tier status, and available vouchers."""
    cid = customer_id.strip() if customer_id and customer_id.strip() else DEFAULT_CUSTOMER_ID
    if cid not in _customer_points_db:
        _customer_points_db[cid] = {
            "points_balance": 0,
            "lifetime_points": 0,
        }
    data = _customer_points_db[cid]
    points_balance = data["points_balance"]
    lifetime_points = data["lifetime_points"]

    tier, points_to_next, next_tier = _get_tier_info(lifetime_points)

    available_vouchers = [v for v in REWARD_VOUCHERS if v.points_cost <= points_balance]

    return CustomerLoyaltyInfo(
        customer_id=cid,
        tier=tier,
        points_balance=points_balance,
        lifetime_points=lifetime_points,
        points_to_next_tier=points_to_next,
        next_tier=next_tier,
        available_vouchers=available_vouchers,
    )


def redeem_voucher(voucher_id: str, customer_id: Optional[str] = None) -> LoyaltyRedemptionResponse:
    """Redeems reward points for a voucher, deducting points from balance."""
    cid = customer_id.strip() if customer_id and customer_id.strip() else DEFAULT_CUSTOMER_ID
    if cid not in _customer_points_db:
        _customer_points_db[cid] = {
            "points_balance": 0,
            "lifetime_points": 0,
        }
    cust = _customer_points_db[cid]

    # Find voucher
    norm_id = voucher_id.strip().lower()
    voucher = next((v for v in REWARD_VOUCHERS if v.id.lower() == norm_id), None)
    if not voucher:
        return LoyaltyRedemptionResponse(
            success=False,
            message=f"Reward voucher '{voucher_id}' not found.",
            remaining_points=cust["points_balance"],
            promo_code=None,
            voucher=None,
        )

    if cust["points_balance"] < voucher.points_cost:
        return LoyaltyRedemptionResponse(
            success=False,
            message=f"Insufficient points balance ({cust['points_balance']}). Voucher '{voucher.title}' requires {voucher.points_cost} points.",
            remaining_points=cust["points_balance"],
            promo_code=None,
            voucher=voucher,
        )

    # Deduct points
    cust["points_balance"] -= voucher.points_cost

    return LoyaltyRedemptionResponse(
        success=True,
        message=f"Successfully redeemed {voucher.title}! Use promo code {voucher.discount_code} at checkout.",
        promo_code=voucher.discount_code,
        remaining_points=cust["points_balance"],
        voucher=voucher,
    )


REWARDS_KEYWORDS = [
    r"\bpoints\b",
    r"\brewards?\b",
    r"\bloyalty\b",
    r"\btiers?\b",
    r"\bpathfinder\b",
    r"\bsummit\s+explorer\b",
    r"\btrailblazer\b",
    r"\bredeem\s+points\b",
    r"\bmember\s+perks\b",
    r"\bperks\b",
    r"\bvouchers?\b",
]

REDEEM_PATTERNS = [
    r"\bredeem\b",
    r"\bclaim\s+voucher\b",
    r"\bexchange\s+points\b",
]

TIER_PATTERNS = [
    r"\bperks\b",
    r"\btiers?\b",
    r"\bbenefits\b",
    r"\bhow\s+to\s+reach\s+summit\b",
]

VOUCHER_PATTERNS = [
    r"\bvouchers?\b",
    r"\bwhat\s+(?:[a-z]+\s+)?vouchers\b",
    r"\bwhat\s+can\s+i\s+get\b",
    r"\bavailable\s+rewards?\b",
    r"\bavailable\s+vouchers?\b",
    r"\bwhich\s+vouchers?\b",
]

BALANCE_PATTERNS = [
    r"\bhow\s+many\s+(?:[a-z]+\s+)?points\b",
    r"\bpoints?\s+balance\b",
    r"\b(?:my|tier|account)\s+status\b",
    r"\bmy\s+points\b",
    r"\bcheck\s+(?:my\s+)?(?:points|balance|status)\b",
    r"\bcurrent\s+(?:rewards?\s+)?balance\b",
    r"\brewards?\s+balance\b",
    r"\bwhat\s+is\s+my\s+(?:tier|status|points|balance)\b",
]


def detect_rewards_intent(query: str) -> Optional[RewardsIntent]:
    """Detects rewards intent, determining action and extracting voucher or points details."""
    if not isinstance(query, str) or not query.strip():
        return None

    cleaned = query.strip()
    lowered = cleaned.lower()

    # Check if query matches any rewards keyword
    matches_keyword = any(re.search(pat, lowered) for pat in REWARDS_KEYWORDS)
    if not matches_keyword:
        return None

    # Determine action
    # 1. Check redeem first
    is_redeem = any(re.search(pat, lowered) for pat in REDEEM_PATTERNS)
    if is_redeem:
        voucher_id = None
        requested_amount = None

        if "voucher-10" in lowered or "$10" in lowered or re.search(r"\b10\s*(?:dollar|off|discount)?\b", lowered):
            voucher_id = "voucher-10"
            requested_amount = 10
        elif "voucher-25" in lowered or "$25" in lowered or re.search(r"\b25\s*(?:dollar|off|discount)?\b", lowered):
            voucher_id = "voucher-25"
            requested_amount = 25
        elif "voucher-50" in lowered or "$50" in lowered or re.search(r"\b50\s*(?:dollar|off|discount)?\b", lowered):
            voucher_id = "voucher-50"
            requested_amount = 50
        elif "voucher-ship" in lowered or "shipping" in lowered or "ship" in lowered:
            voucher_id = "voucher-ship"
        else:
            for v in REWARD_VOUCHERS:
                if v.id in lowered:
                    voucher_id = v.id
                    break

        return RewardsIntent(
            action="redeem",
            voucher_id=voucher_id,
            requested_amount=requested_amount,
            customer_id=DEFAULT_CUSTOMER_ID,
        )

    # 2. Check vouchers (what vouchers, what can i get, available rewards)
    is_vouchers = any(re.search(pat, lowered) for pat in VOUCHER_PATTERNS)
    if is_vouchers:
        return RewardsIntent(
            action="vouchers",
            customer_id=DEFAULT_CUSTOMER_ID,
        )

    # 3. Check explicit balance / status inquiries
    is_balance = any(re.search(pat, lowered) for pat in BALANCE_PATTERNS)
    if is_balance:
        return RewardsIntent(
            action="balance",
            customer_id=DEFAULT_CUSTOMER_ID,
        )

    # 4. Check tiers inquiries (perks, tier, benefits, how to reach summit)
    is_tiers = any(re.search(pat, lowered) for pat in TIER_PATTERNS)
    if is_tiers:
        return RewardsIntent(
            action="tiers",
            customer_id=DEFAULT_CUSTOMER_ID,
        )

    # 5. Default to balance
    return RewardsIntent(
        action="balance",
        customer_id=DEFAULT_CUSTOMER_ID,
    )


def build_rewards_prompt(intent: RewardsIntent, loyalty: Optional[CustomerLoyaltyInfo] = None) -> str:
    """Formats helpful context for the LLM with points balance, tier perks, and available vouchers."""
    if not loyalty:
        loyalty = get_customer_loyalty(intent.customer_id)

    tier_lines = []
    for t in MEMBER_TIERS:
        tier_lines.append(f"- {t.tier_name} ({t.points_multiplier}x points, {t.min_points}+ points): {', '.join(t.perks)}")
    tiers_str = "\n".join(tier_lines)

    voucher_lines = []
    for v in REWARD_VOUCHERS:
        min_spend_str = f", min spend ${v.min_spend:.0f}" if v.min_spend else ""
        voucher_lines.append(f"- {v.title} (Cost: {v.points_cost} pts, Code: {v.discount_code}{min_spend_str}): {v.description}")
    vouchers_str = "\n".join(voucher_lines)

    next_tier_str = (
        f"Points to next tier ({loyalty.next_tier}): {loyalty.points_to_next_tier}"
        if loyalty.next_tier
        else "Highest tier reached"
    )

    return (
        "Contoso Outdoors Customer Loyalty Rewards & Benefits Guidance:\n\n"
        f"Customer Account ({loyalty.customer_id}):\n"
        f"- Current Tier: {loyalty.tier}\n"
        f"- Points Balance: {loyalty.points_balance}\n"
        f"- Lifetime Points: {loyalty.lifetime_points}\n"
        f"- {next_tier_str}\n\n"
        "Membership Tiers & Perks:\n"
        f"{tiers_str}\n\n"
        "Available Rewards Vouchers:\n"
        f"{vouchers_str}\n\n"
        "Instructions for Assistant:\n"
        "- Explain loyalty points balance, tier status, and next-tier progress clearly.\n"
        "- When asked about perks or tiers, detail the benefits of Trailblazer, Pathfinder, and Summit Explorer.\n"
        "- When asked about available vouchers, mention which vouchers the customer can redeem with their balance.\n"
        "- Remind customers that discount codes are applied in the shopping cart drawer during checkout."
    )


def format_rewards_response(
    intent: RewardsIntent,
    loyalty: Optional[CustomerLoyaltyInfo] = None,
) -> dict[str, Any]:
    """Returns formatted human-readable answer and structured rewards_info payload."""
    if not loyalty:
        loyalty = get_customer_loyalty(intent.customer_id)

    if intent.action == "tiers":
        tiers_dump = [t.model_dump() for t in MEMBER_TIERS]
        answer = (
            "Here are the Contoso Outdoors Loyalty Program membership tiers:\n"
            "- Trailblazer (0+ points): 1.0x points on all purchases, birthday bonus 100 points, member-only sales.\n"
            "- Pathfinder (500+ points): 1.25x points on all purchases, free standard shipping on all orders, early access to seasonal gear releases.\n"
            "- Summit Explorer (1500+ points): 1.5x points on all purchases, free expedited shipping, exclusive VIP gear drops, free annual equipment tune-up.\n"
            f"You are currently at the {loyalty.tier} tier."
        )
        return {
            "answer": answer,
            "rewards_info": {
                "action": "tiers",
                "tiers": tiers_dump,
                "current_tier": loyalty.tier,
            },
        }

    if intent.action == "vouchers":
        vouchers_dump = [v.model_dump() for v in loyalty.available_vouchers]
        answer = (
            f"You currently have {loyalty.points_balance} points available. "
            "Here are the rewards vouchers you can redeem right now:\n"
            "- $10 Off Any Purchase (200 points, min spend $50, promo code REWARD10)\n"
            "- $25 Off Gear & Apparel (500 points, min spend $100, promo code REWARD25)\n"
            "- Free Expedited Shipping (150 points, promo code REWARDSHIP)\n"
            "You can also save up for our $50 Off Premium Equipment voucher (1000 points, min spend $150)."
        )
        return {
            "answer": answer,
            "rewards_info": {
                "action": "vouchers",
                "points_balance": loyalty.points_balance,
                "available_vouchers": vouchers_dump,
            },
        }

    if intent.action == "redeem":
        v_id = intent.voucher_id or "voucher-10"
        redemption = redeem_voucher(v_id, loyalty.customer_id)
        if redemption.success:
            answer = (
                f"Redemption confirmed! You have redeemed your points for {redemption.voucher.title if redemption.voucher else 'your voucher'}. "
                f"Your promo code is {redemption.promo_code}. You have {redemption.remaining_points} points remaining. "
                "Apply this promo code in your shopping cart drawer at checkout to enjoy your savings!"
            )
        else:
            answer = (
                f"Unable to redeem voucher: {redemption.message} "
                f"You currently have {redemption.remaining_points} points."
            )
        return {
            "answer": answer,
            "rewards_info": {
                "action": "redeem",
                "redemption": redemption.model_dump(),
            },
        }

    # Default: "balance"
    next_tier_desc = (
        f"You need {loyalty.points_to_next_tier} more points ({loyalty.lifetime_points}/1500) to reach {loyalty.next_tier} tier."
        if loyalty.next_tier
        else "You have reached the highest tier!"
    )
    answer = (
        f"You currently have {loyalty.points_balance} reward points (with {loyalty.lifetime_points} lifetime points). "
        f"You are in the {loyalty.tier} tier. "
        f"{next_tier_desc}"
    )
    return {
        "answer": answer,
        "rewards_info": {
            "action": "balance",
            "loyalty": loyalty.model_dump(),
        },
    }
