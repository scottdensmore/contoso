import re
from typing import Any, Optional

STORE_POLICIES: dict[str, dict[str, Any]] = {
    "returns": {
        "id": "returns",
        "title": "Returns & Refunds Policy",
        "summary": "30-day return policy, full refund in original packaging, free return shipping for members.",
        "details": (
            "We offer a 30-day return policy on all eligible items. Customers receive a full refund "
            "for items returned in original packaging with tags attached. Contoso Outdoors members receive "
            "free return shipping on all eligible returns."
        ),
        "return_window_days": 30,
        "conditions": [
            "30-day return window from delivery date",
            "Full refund in original packaging and tags attached",
            "Free return shipping for Contoso members",
        ],
    },
    "price_match": {
        "id": "price_match",
        "title": "Price-Match Guarantee",
        "summary": "14-day price-match guarantee against authorized outdoor retailers for identical in-stock items.",
        "details": (
            "We offer a 14-day price-match guarantee against authorized outdoor retailers for identical "
            "in-stock items. If you find a qualifying lower competitor price within 14 days of purchase, "
            "contact support and we will match the lower price."
        ),
        "guarantee_window_days": 14,
        "conditions": [
            "Valid within 14 days of purchase",
            "Authorized outdoor retailers only",
            "Item must be identical (model, size, color) and currently in stock",
        ],
    },
    "shipping": {
        "id": "shipping",
        "title": "Shipping Tiers & Delivery Policy",
        "summary": "Free standard shipping on orders over $50 ($5 under $50), 2-day express ($15), overnight ($25).",
        "details": (
            "Our shipping tiers include free standard shipping on orders over $50 ($5 flat fee on orders under $50), "
            "2-day express delivery for $15, and overnight shipping for $25."
        ),
        "tiers": [
            {"tier": "standard", "cost": "Free over $50, $5 under $50", "speed": "3-5 business days"},
            {"tier": "express", "cost": "$15", "speed": "2 business days"},
            {"tier": "overnight", "cost": "$25", "speed": "1 business day"},
        ],
    },
    "warranty": {
        "id": "warranty",
        "title": "Warranty Policy",
        "summary": "Lifetime manufacturer defect warranty on Contoso gear; 1-year warranty on partner brands.",
        "details": (
            "We stand behind every product we sell. All Contoso-branded gear includes a lifetime manufacturer defect "
            "warranty. Partner brands carry a 1-year manufacturer warranty. Defective items or broken gear "
            "eligible under warranty will be repaired or replaced."
        ),
        "coverage": {
            "contoso_gear": "Lifetime manufacturer defect warranty",
            "partner_brands": "1-year manufacturer warranty",
        },
    },
    "privacy": {
        "id": "privacy",
        "title": "Customer Privacy Pledge",
        "summary": "Customer privacy pledge, no data selling, encrypted transactions.",
        "details": (
            "We uphold a strict customer privacy pledge: we never sell your personal data or personal information. "
            "All payment transactions and customer account data are protected with industry-standard encryption "
            "and enterprise data security protocols."
        ),
        "pledge": [
            "Customer privacy pledge",
            "No data selling",
            "Encrypted transactions and secure customer data",
        ],
    },
}

# Policy keyword patterns prioritized by specificity
POLICY_KEYWORD_PATTERNS: dict[str, list[str]] = {
    "price_match": [
        r"\bprice\s*[- ]?\s*match\b",
        r"\bcompetitor\s+price\b",
        r"\bcheaper\s+somewhere\s+else\b",
        r"\bmatch\s+price\b",
        r"\bmatch\s+(?:a\s+)?lower\s+price\b",
        r"\blower\s+price\b",
        r"\bprice\s+matching\b",
    ],
    "returns": [
        r"\breturns?\s+policy\b",
        r"\bmoney\s+back\b",
        r"\b30\s*[- ]?\s*days?\b",
        r"\b30-day\b",
        r"\breturns?\b",
        r"\brefunds?\b",
        r"\bexchanges?\b",
    ],
    "shipping": [
        r"\bshipping\s+cost\b",
        r"\bdelivery\s+time\b",
        r"\bshipping\s+speed\b",
        r"\bhow\s+much\s+is\s+shipping\b",
        r"\bovernight\s+shipping\b",
        r"\bexpress\s+delivery\b",
        r"\bovernight\s+delivery\b",
        r"\bshipping\s+tiers?\b",
        r"\bshipping\s+fee\b",
        r"\bshipping\s+options?\b",
        r"\bshipping\b",
        r"\bdelivery\b",
    ],
    "warranty": [
        r"\blifetime\s+warranty\b",
        r"\bbroken\s+gear\s+replacement\b",
        r"\bbroken\s+gear\b",
        r"\bdefect\s+warranty\b",
        r"\bwarrant(?:y|ies)\b",
        r"\bguarantee\b",
    ],
    "privacy": [
        r"\bprivacy\s+policy\b",
        r"\bdata\s+security\b",
        r"\bsell\s+my\s+data\b",
        r"\bpersonal\s+information\b",
        r"\bprivacy\s+pledge\b",
        r"\bprivacy\b",
    ],
}


def get_store_policies() -> list[dict[str, Any]]:
    """Returns copies of all store policies in the catalog."""
    return [dict(policy) for policy in STORE_POLICIES.values()]


def get_policy_by_id(policy_id: str) -> Optional[dict[str, Any]]:
    """Case-insensitive lookup by policy id."""
    if not isinstance(policy_id, str):
        return None
    normalized = policy_id.strip().lower()
    if not normalized:
        return None
    policy = STORE_POLICIES.get(normalized)
    return dict(policy) if policy else None


def detect_policy_intent(question: str) -> dict[str, Any]:
    """Analyzes question for policy keywords across returns, price matching, shipping, warranty, and privacy."""
    default_result: dict[str, Any] = {
        "is_policy_query": False,
        "policy_type": None,
        "matched_policy": None,
        "confidence": 0.0,
    }

    if not isinstance(question, str) or not question.strip():
        return default_result

    cleaned = question.strip()

    for policy_type, patterns in POLICY_KEYWORD_PATTERNS.items():
        for pattern_str in patterns:
            if re.search(pattern_str, cleaned, re.IGNORECASE):
                policy = STORE_POLICIES.get(policy_type)
                return {
                    "is_policy_query": True,
                    "policy_type": policy_type,
                    "matched_policy": dict(policy) if policy else None,
                    "confidence": 1.0,
                }

    return default_result


def build_policy_prompt(policy: dict[str, Any]) -> str:
    """Formats grounding instructions for LLM prompt injection."""
    policy_id = policy.get("id", "policy")
    title = policy.get("title", policy_id.replace("_", " ").title())
    summary = policy.get("summary", "")
    details = policy.get("details", "")

    lines = [
        f"Store Policy Grounding - {title}:",
        f"Summary: {summary}",
        f"Details: {details}",
        "",
        "Instructions for Assistant:",
        "- Ground your answer strictly in the official Contoso Outdoors store policy provided above.",
        "- Accurately state all applicable timeframes, thresholds, conditions, and member benefits.",
        "- If the customer has an inquiry regarding competitor prices or returns, guide them with clarity and warmth.",
        "- Be professional, helpful, and concise.",
    ]
    return "\n".join(lines)
