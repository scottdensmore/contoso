import re
from typing import Any, Optional

ACTIVE_PROMOTIONS: dict[str, dict[str, Any]] = {
    "WELCOME20": {
        "code": "WELCOME20",
        "discount_percent": 20,
        "description": "20% off welcome discount for adventurers",
    },
    "OUTDOORS10": {
        "code": "OUTDOORS10",
        "discount_percent": 10,
        "description": "10% off site-wide",
    },
    "TRAIL15": {
        "code": "TRAIL15",
        "discount_percent": 15,
        "description": "15% off trail equipment",
    },
}

PROMO_CODE_STOPWORDS = {
    "is",
    "for",
    "to",
    "in",
    "the",
    "a",
    "an",
    "and",
    "or",
    "please",
    "here",
    "available",
    "valid",
    "applied",
    "work",
    "works",
    "working",
    "does",
    "do",
    "you",
    "have",
    "any",
    "i",
    "can",
    "get",
    "me",
    "my",
    "your",
    "there",
    "now",
    "today",
    "discount",
    "discounts",
    "promo",
    "promos",
    "coupon",
    "coupons",
    "code",
    "codes",
    "sale",
    "sales",
    "deal",
    "deals",
    "voucher",
    "vouchers",
    "offer",
    "offers",
}

EXPLICIT_PROMO_CODE_PATTERNS = [
    re.compile(
        r"\b(?:promo|promotional|coupon|discount|voucher)?\s*codes?\s*(?:is|:|#)?\s*['\"]?([A-Za-z0-9_-]+)['\"]?",
        re.IGNORECASE,
    ),
    re.compile(
        r"\b(?:promo|coupon|voucher)\s+['\"]?([A-Za-z0-9_-]+)['\"]?",
        re.IGNORECASE,
    ),
]

PROMO_INTENT_KEYWORD_PATTERNS = [
    r"\bpromos?\b",
    r"\bpromotions?\b",
    r"\bpromotional\b",
    r"\bcoupons?\b",
    r"\bdiscounts?\b",
    r"\bdeals?\b",
    r"\bsales?\b",
    r"\bvouchers?\b",
    r"\boffers?\b",
    r"\bpromo\s+codes?\b",
    r"\bdiscount\s+codes?\b",
    r"\bcoupon\s+codes?\b",
]


def get_active_promotions() -> list[dict[str, Any]]:
    """Returns list of active promo codes with description and discount percentages."""
    return [dict(promo) for promo in ACTIVE_PROMOTIONS.values()]


def validate_promo_code(code: str) -> dict[str, Any]:
    """Case-insensitive validation against active promotions."""
    if not isinstance(code, str) or not code.strip():
        return {"valid": False, "message": "Code not found or expired"}

    normalized = code.strip().upper()
    if normalized in ACTIVE_PROMOTIONS:
        promo = ACTIVE_PROMOTIONS[normalized]
        return {
            "valid": True,
            "code": promo["code"],
            "discount_percent": promo["discount_percent"],
            "description": promo["description"],
        }
    return {"valid": False, "message": "Code not found or expired"}


def detect_promo_intent(question: str) -> dict[str, Any]:
    """Regex and pattern matching for promotional inquiries and promo code extraction."""
    if not isinstance(question, str) or not question.strip():
        return {"is_promo_intent": False, "extracted_code": None}

    cleaned = question.strip()

    # 1. Check for any known active promotion code directly
    for code in ACTIVE_PROMOTIONS:
        if re.search(rf"\b{re.escape(code)}\b", cleaned, re.IGNORECASE):
            return {"is_promo_intent": True, "extracted_code": code}

    # 2. Check for explicit code patterns (e.g. promo code SUMMER25)
    for pattern in EXPLICIT_PROMO_CODE_PATTERNS:
        match = pattern.search(cleaned)
        if match:
            candidate = match.group(1).strip().strip("'\"").upper()
            if candidate and candidate.lower() not in PROMO_CODE_STOPWORDS:
                return {"is_promo_intent": True, "extracted_code": candidate}

    # 3. Check for general promotional intent keywords
    for pattern_str in PROMO_INTENT_KEYWORD_PATTERNS:
        if re.search(pattern_str, cleaned, re.IGNORECASE):
            return {"is_promo_intent": True, "extracted_code": None}

    return {"is_promo_intent": False, "extracted_code": None}


def build_promo_prompt(promo_info: Optional[dict[str, Any]], question: str) -> str:
    """Generates guidance instructing the LLM to highlight active promotions, explain cart drawer application, and celebrate savings."""
    active_promos = get_active_promotions()
    promo_lines = [
        f"- {p['code']}: {p['discount_percent']}% off ({p['description']})"
        for p in active_promos
    ]
    promos_formatted = "\n".join(promo_lines)

    extracted_code = promo_info.get("extracted_code") if promo_info else None
    specific_status = ""
    if extracted_code:
        validation = validate_promo_code(extracted_code)
        if validation["valid"]:
            specific_status = (
                f"\nCustomer inquired about code '{extracted_code}': It is VALID for "
                f"{validation['discount_percent']}% off! Confirm this code to the customer."
            )
        else:
            specific_status = (
                f"\nCustomer inquired about code '{extracted_code}': This code is NOT found or expired. "
                f"Kindly inform them and recommend our active promotions instead."
            )

    return (
        "Promotional Discounts & Offers Guidance:\n"
        "Active Promotions:\n"
        f"{promos_formatted}"
        f"{specific_status}\n\n"
        "Instructions for Assistant:\n"
        "- Highlight our active promo codes (WELCOME20, OUTDOORS10, and TRAIL15) and what discount they provide.\n"
        "- Explain to the customer how to apply promo codes in the shopping cart drawer during checkout.\n"
        "- Celebrate savings enthusiastically and help them get the best deal on their outdoor gear.\n"
        "- If the customer provided a specific code, validate it and explain its status clearly."
    )
