import re
from typing import Any, Optional

from pydantic import BaseModel


class TradeInEstimateModel(BaseModel):
    category: str
    brand: Optional[str] = None
    original_msrp: float
    condition: str
    estimated_payout: float
    co2_avoided_kg: float
    condition_summary: str


class EligibleBrandModel(BaseModel):
    brand_id: str
    name: str
    tier: str
    accepted_categories: list[str]


class TradeInIntent(BaseModel):
    action: str  # "estimate", "brands", "condition_guide", "sustainability"
    category: Optional[str] = None
    brand: Optional[str] = None
    condition: Optional[str] = None
    msrp: Optional[float] = None


class TradeInEstimateRequest(BaseModel):
    category: str
    original_msrp: float
    condition: Optional[str] = "very_good"
    brand: Optional[str] = None


ELIGIBLE_BRANDS: list[EligibleBrandModel] = [
    EligibleBrandModel(
        brand_id="contoso-outdoors",
        name="Contoso Outdoors",
        tier="house",
        accepted_categories=["tents", "backpacks", "jackets", "sleeping_bags", "footwear"],
    ),
    EligibleBrandModel(
        brand_id="patagonia",
        name="Patagonia",
        tier="premium",
        accepted_categories=["jackets", "backpacks", "sleeping_bags", "footwear"],
    ),
    EligibleBrandModel(
        brand_id="arcteryx",
        name="Arc'teryx",
        tier="premium",
        accepted_categories=["jackets", "backpacks", "footwear"],
    ),
    EligibleBrandModel(
        brand_id="the-north-face",
        name="The North Face",
        tier="standard",
        accepted_categories=["tents", "backpacks", "jackets", "sleeping_bags", "footwear"],
    ),
    EligibleBrandModel(
        brand_id="mountain-hardwear",
        name="Mountain Hardwear",
        tier="standard",
        accepted_categories=["tents", "backpacks", "jackets", "sleeping_bags"],
    ),
    EligibleBrandModel(
        brand_id="osprey",
        name="Osprey",
        tier="premium",
        accepted_categories=["backpacks"],
    ),
    EligibleBrandModel(
        brand_id="big-agnes",
        name="Big Agnes",
        tier="premium",
        accepted_categories=["tents", "sleeping_bags"],
    ),
    EligibleBrandModel(
        brand_id="nemo-equipment",
        name="Nemo Equipment",
        tier="premium",
        accepted_categories=["tents", "sleeping_bags"],
    ),
]

CONDITION_MULTIPLIERS: dict[str, float] = {
    "excellent": 0.50,
    "very_good": 0.40,
    "fair": 0.25,
}

CONDITION_SUMMARIES: dict[str, str] = {
    "excellent": "Like new condition with minimal or no signs of wear, fully functional with all original components, zippers, and seams intact.",
    "very_good": "Minor cosmetic wear from normal use, clean, fully functional with no structural defects or tears.",
    "fair": "Visible wear, superficial scratches or scuffs, fully operable with all closures working.",
}

CATEGORY_CO2_AVOIDED_KG: dict[str, float] = {
    "tents": 25.0,
    "backpacks": 18.0,
    "jackets": 12.0,
    "sleeping_bags": 15.0,
    "footwear": 10.0,
}

DEFAULT_CATEGORY_MSRP: dict[str, float] = {
    "tents": 350.0,
    "backpacks": 220.0,
    "jackets": 200.0,
    "sleeping_bags": 250.0,
    "footwear": 160.0,
}

CATEGORY_ALIASES: dict[str, str] = {
    "tent": "tents",
    "tents": "tents",
    "shelter": "tents",
    "backpack": "backpacks",
    "backpacks": "backpacks",
    "pack": "backpacks",
    "packs": "backpacks",
    "rucksack": "backpacks",
    "daypack": "backpacks",
    "jacket": "jackets",
    "jackets": "jackets",
    "coat": "jackets",
    "parka": "jackets",
    "outerwear": "jackets",
    "shell": "jackets",
    "rain jacket": "jackets",
    "fleece": "jackets",
    "sleeping bag": "sleeping_bags",
    "sleeping_bag": "sleeping_bags",
    "sleeping bags": "sleeping_bags",
    "sleeping_bags": "sleeping_bags",
    "quilt": "sleeping_bags",
    "footwear": "footwear",
    "boot": "footwear",
    "boots": "footwear",
    "shoe": "footwear",
    "shoes": "footwear",
    "trail shoes": "footwear",
    "hiking boots": "footwear",
}

BRAND_NORMALIZATION: dict[str, str] = {
    "contoso": "Contoso Outdoors",
    "contoso outdoors": "Contoso Outdoors",
    "patagonia": "Patagonia",
    "arc'teryx": "Arc'teryx",
    "arcteryx": "Arc'teryx",
    "arc teryx": "Arc'teryx",
    "the north face": "The North Face",
    "north face": "The North Face",
    "tnf": "The North Face",
    "mountain hardwear": "Mountain Hardwear",
    "mountain hardware": "Mountain Hardwear",
    "osprey": "Osprey",
    "big agnes": "Big Agnes",
    "nemo": "Nemo Equipment",
    "nemo equipment": "Nemo Equipment",
}

TRADE_IN_TRIGGERS: list[str] = [
    r"\btrade[- ]?ins?\b",
    r"\btrading[- ]?in\b",
    r"\bre[- ]?gears?\b",
    r"\bused[- ]gear\b",
    r"\bgear[- ]buyback\b",
    r"\bbuyback\b",
    r"\bcircular\s+economy\b",
    r"\bstore\s+credit\b.*\b(?:gear|used|trade|jacket|tent|pack|bag|boots?)\b",
    r"\b(?:trade|sell)\s+my\s+used\b",
    r"\b(?:trade|sell)\s+in\s+my\b",
    r"\bpre[- ]owned\s+gear\b",
]


def get_eligible_brands() -> list[EligibleBrandModel]:
    """Returns the list of eligible trade-in brands and accepted categories."""
    return [b.model_copy() for b in ELIGIBLE_BRANDS]


def normalize_category(category: Optional[str]) -> str:
    """Normalizes gear category strings to canonical catalog keys."""
    if not category or not isinstance(category, str):
        return "gear"
    cleaned = category.strip().lower()
    return CATEGORY_ALIASES.get(cleaned, cleaned)


def normalize_condition(condition: Optional[str]) -> str:
    """Normalizes condition strings to canonical condition tiers."""
    if not condition or not isinstance(condition, str):
        return "very_good"
    cleaned = condition.strip().lower().replace("-", "_").replace(" ", "_")
    if cleaned in ["excellent", "like_new", "mint", "pristine"]:
        return "excellent"
    if cleaned in ["fair", "used", "worn"]:
        return "fair"
    return "very_good"


def normalize_brand(brand: Optional[str]) -> Optional[str]:
    """Normalizes brand names to official brand title."""
    if not brand or not isinstance(brand, str) or not brand.strip():
        return None
    cleaned = brand.strip().lower()
    return BRAND_NORMALIZATION.get(cleaned, brand.strip().title())


def estimate_trade_in_payout(
    category: str,
    original_msrp: float,
    condition: str = "very_good",
    brand: Optional[str] = None,
) -> TradeInEstimateModel:
    """Calculates trade-in payout, CO2 avoided, and condition summary based on MSRP and condition tier."""
    canonical_cat = normalize_category(category)
    canonical_cond = normalize_condition(condition)
    canonical_brand = normalize_brand(brand)

    multiplier = CONDITION_MULTIPLIERS.get(canonical_cond, 0.40)
    payout = round(max(0.0, original_msrp) * multiplier, 2)
    co2_kg = CATEGORY_CO2_AVOIDED_KG.get(canonical_cat, 12.0)
    summary = CONDITION_SUMMARIES.get(
        canonical_cond,
        "Minor cosmetic wear from normal use, clean, fully functional.",
    )

    return TradeInEstimateModel(
        category=canonical_cat,
        brand=canonical_brand,
        original_msrp=round(original_msrp, 2),
        condition=canonical_cond,
        estimated_payout=payout,
        co2_avoided_kg=co2_kg,
        condition_summary=summary,
    )


def detect_trade_in_intent(query: str) -> Optional[TradeInIntent]:
    """Detects customer trade-in inquiries, identifying action, category, brand, condition, and MSRP."""
    if not query or not isinstance(query, str) or not query.strip():
        return None

    cleaned = query.strip()
    is_triggered = any(re.search(pat, cleaned, re.IGNORECASE) for pat in TRADE_IN_TRIGGERS)
    if not is_triggered:
        return None

    # Extract brand
    detected_brand: Optional[str] = None
    for brand_key, canonical_name in BRAND_NORMALIZATION.items():
        if re.search(r"\b" + re.escape(brand_key) + r"\b", cleaned, re.IGNORECASE):
            detected_brand = canonical_name
            break

    # Extract category
    detected_cat: Optional[str] = None
    for alias_key, canonical_cat in CATEGORY_ALIASES.items():
        if re.search(r"\b" + re.escape(alias_key) + r"\b", cleaned, re.IGNORECASE):
            detected_cat = canonical_cat
            break

    # Extract condition
    detected_condition: Optional[str] = None
    if re.search(r"\b(?:excellent|like\s+new|mint|pristine)\b", cleaned, re.IGNORECASE):
        detected_condition = "excellent"
    elif re.search(r"\b(?:very\s+good|great|good)\b", cleaned, re.IGNORECASE):
        detected_condition = "very_good"
    elif re.search(r"\b(?:fair|worn|well[- ]used)\b", cleaned, re.IGNORECASE):
        detected_condition = "fair"

    # Extract MSRP
    detected_msrp: Optional[float] = None
    msrp_match = re.search(
        r"(?:\$|\b(?:msrp|worth|cost|bought\s+for|retail(?:ing)?\s+(?:for|at)?)\s*(?:of\s*)?\$?)\s*(\d+(?:\.\d{1,2})?)",
        cleaned,
        re.IGNORECASE,
    )
    if msrp_match:
        try:
            detected_msrp = float(msrp_match.group(1))
        except (ValueError, TypeError):
            detected_msrp = None

    # Detect action
    if re.search(r"\b(?:sustainability|carbon|co2|environment(?:al)?|climate|emissions?)\b", cleaned, re.IGNORECASE):
        action = "sustainability"
    elif re.search(
        r"\b(?:brands?|eligible\s+brands?|accepted\s+brands?|who\s+do\s+you\s+accept|which\s+brands)\b",
        cleaned,
        re.IGNORECASE,
    ):
        action = "brands"
    elif re.search(
        r"\b(?:condition\s+(?:guide|requirements?|tiers?|standards?)|what\s+condition|tier\s+payouts?)\b",
        cleaned,
        re.IGNORECASE,
    ):
        action = "condition_guide"
    else:
        # Defaults to estimate when asking about specific items or trade-in value
        action = "estimate"

    return TradeInIntent(
        action=action,
        category=detected_cat,
        brand=detected_brand,
        condition=detected_condition,
        msrp=detected_msrp,
    )


def build_trade_in_prompt(intent: TradeInIntent) -> str:
    """Builds helpful system prompt context with Re-Gear trade-in policies, brands, condition multipliers, and sustainability."""
    lines = [
        "Contoso Outdoors Re-Gear Trade-In & Sustainability Guidance:",
        f"Detected Action: {intent.action}",
    ]
    if intent.brand:
        lines.append(f"Gear Brand: {intent.brand}")
    if intent.category:
        lines.append(f"Gear Category: {intent.category}")
    if intent.condition:
        lines.append(f"Condition: {intent.condition}")
    if intent.msrp is not None:
        lines.append(f"Original MSRP: ${intent.msrp:.2f}")

    lines.append("")
    lines.append("Eligible Brands & Categories:")
    for b in ELIGIBLE_BRANDS:
        cats = ", ".join(b.accepted_categories)
        lines.append(f"- {b.name} (Tier: {b.tier}, Categories: {cats})")

    lines.append("")
    lines.append("Condition Tiers & Payout Multipliers (Paid via Contoso Store Credit):")
    lines.append("- Excellent (50% of MSRP): Like-new, no visible wear, fully functional.")
    lines.append("- Very Good (40% of MSRP): Minor cosmetic wear, clean, fully functional.")
    lines.append("- Fair (25% of MSRP): Visible wear, fully operable.")

    lines.append("")
    lines.append("Sustainability Impact (Average CO2 avoided per item):")
    lines.append("- Tents: ~25.0 kg CO2 avoided")
    lines.append("- Backpacks: ~18.0 kg CO2 avoided")
    lines.append("- Sleeping Bags: ~15.0 kg CO2 avoided")
    lines.append("- Jackets: ~12.0 kg CO2 avoided")
    lines.append("- Footwear: ~10.0 kg CO2 avoided")

    if intent.action == "estimate" and intent.msrp and intent.category:
        estimate = estimate_trade_in_payout(
            category=intent.category,
            original_msrp=intent.msrp,
            condition=intent.condition or "very_good",
            brand=intent.brand,
        )
        lines.append("")
        lines.append(f"Calculated Trade-In Valuation for {estimate.brand or 'gear'}:")
        lines.append(f"- Category: {estimate.category}")
        lines.append(f"- Condition: {estimate.condition}")
        lines.append(f"- Payout: ${estimate.estimated_payout:.2f} store credit")
        lines.append(f"- Environmental Impact: {estimate.co2_avoided_kg:.1f} kg CO2 avoided")

    lines.append("")
    lines.append("Instructions for Assistant:")
    lines.append("- Always highlight that trade-in payouts are provided as Contoso Store Credit gift cards.")
    lines.append("- Emphasize the circular economy benefits and emissions avoided by trading in gear.")
    lines.append("- Explain condition tiers and accepted brands clearly and invite the customer to visit any Contoso store or trade in online.")

    return "\n".join(lines)


def format_trade_in_response(intent: TradeInIntent) -> dict[str, Any]:
    """Formats trade-in answers and structured trade_in_info payload for chat responses."""
    if intent.action == "brands":
        brands = get_eligible_brands()
        brand_list_str = "\n".join(
            f"- {b.name} ({b.tier.title()} tier - accepts {', '.join(b.accepted_categories)})"
            for b in brands
        )
        answer = (
            "Through the Contoso Re-Gear program, we accept pre-owned gear from the following eligible brands:\n"
            f"{brand_list_str}\n\n"
            "All accepted trade-ins receive Contoso store credit gift cards that can be used online or at any retail location."
        )
        return {
            "answer": answer,
            "trade_in_info": {
                "action": "brands",
                "eligible_brands": [b.model_dump() for b in brands],
                "accepted_categories": ["tents", "backpacks", "jackets", "sleeping_bags", "footwear"],
            },
        }

    if intent.action == "condition_guide":
        answer = (
            "Contoso Re-Gear Condition Tiers and Trade-In Payouts:\n"
            "- Excellent (50% of MSRP): Like new, minimal/no wear, all zippers and seams perfect.\n"
            "- Very Good (40% of MSRP): Light cosmetic wear from normal trail use, clean, fully functional.\n"
            "- Fair (25% of MSRP): Visible cosmetic scuffs or wear, fully operable closures.\n\n"
            "Gear must be clean and free of unrepairable damage. Payouts are issued as Contoso store credit gift cards."
        )
        return {
            "answer": answer,
            "trade_in_info": {
                "action": "condition_guide",
                "condition_tiers": {
                    "excellent": {"multiplier": 0.50, "payout_percent": "50%"},
                    "very_good": {"multiplier": 0.40, "payout_percent": "40%"},
                    "fair": {"multiplier": 0.25, "payout_percent": "25%"},
                },
            },
        }

    if intent.action == "sustainability":
        answer = (
            "The Contoso Re-Gear program champions the outdoor circular economy by keeping quality gear in the field "
            "and out of landfills. On average, trading in and recirculating outdoor gear avoids:\n"
            "- Tents: 25.0 kg CO2\n"
            "- Backpacks: 18.0 kg CO2\n"
            "- Sleeping Bags: 15.0 kg CO2\n"
            "- Jackets: 12.0 kg CO2\n"
            "- Footwear: 10.0 kg CO2\n\n"
            "By choosing to trade in, you actively reduce manufacturing emissions and conserve valuable outdoor resources."
        )
        return {
            "answer": answer,
            "trade_in_info": {
                "action": "sustainability",
                "co2_avoided_kg_by_category": CATEGORY_CO2_AVOIDED_KG,
            },
        }

    # Default action: "estimate"
    cat = intent.category or "jackets"
    cond = intent.condition or "very_good"
    msrp = intent.msrp if intent.msrp is not None else DEFAULT_CATEGORY_MSRP.get(cat, 200.0)

    estimate = estimate_trade_in_payout(
        category=cat,
        original_msrp=msrp,
        condition=cond,
        brand=intent.brand,
    )

    brand_disp = f"{intent.brand} " if intent.brand else ""
    cond_disp = cond.replace("_", " ")

    answer = (
        f"Yes! You can trade in your used {brand_disp}{cat} for Contoso store credit through our Re-Gear program. "
        f"For an item in {cond_disp} condition (original MSRP ~${msrp:.2f}), "
        f"your estimated trade-in valuation is ${estimate.estimated_payout:.2f} in store credit gift card. "
        f"Trading in this gear also helps the planet by avoiding approximately {estimate.co2_avoided_kg:.1f} kg of CO2 emissions! "
        "You can bring your gear to any Contoso store or mail it in to receive your credit."
    )

    return {
        "answer": answer,
        "trade_in_info": {
            "action": "estimate",
            "category": cat,
            "brand": intent.brand,
            "condition": cond,
            "estimate": estimate.model_dump(),
            "payout_type": "store_credit",
        },
    }
