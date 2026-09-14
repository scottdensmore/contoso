import re
from typing import Optional

from pydantic import BaseModel


class FaqItem(BaseModel):
    faq_id: str
    question: str
    answer: str
    category: str
    keywords: list[str]
    url: Optional[str] = None


class FaqSearchResult(BaseModel):
    query: str
    category: Optional[str] = None
    matches: list[FaqItem]


FAQ_CATALOG: dict[str, FaqItem] = {
    "returns": FaqItem(
        faq_id="returns",
        question="What is the Contoso return policy?",
        answer=(
            "We offer a 30-day return policy on all eligible items. Customers receive a full refund "
            "for items returned in original packaging with tags attached. Contoso Outdoors members receive "
            "free return shipping on all eligible returns."
        ),
        category="returns",
        keywords=[
            "return",
            "returns",
            "refund",
            "refunds",
            "exchange",
            "exchanges",
            "30-day",
            "30 days",
            "return policy",
            "how to return",
            "return shipping",
            "money back",
        ],
        url="/help/returns",
    ),
    "shipping": FaqItem(
        faq_id="shipping",
        question="What are your shipping rates and delivery times?",
        answer=(
            "Standard US domestic delivery takes 3-5 business days and is free on orders over $50 "
            "($5 flat rate for orders under $50). Express 2-day delivery is available for $15, "
            "and overnight shipping is available for $25. We also offer international shipping to select destinations."
        ),
        category="shipping",
        keywords=[
            "shipping",
            "shipping cost",
            "free shipping",
            "how long to ship",
            "international shipping",
            "delivery",
            "delivery time",
            "delivery times",
            "shipping rates",
            "express shipping",
            "overnight",
        ],
        url="/help/shipping",
    ),
    "warranty": FaqItem(
        faq_id="warranty",
        question="What warranty coverage is provided on Contoso gear?",
        answer=(
            "All Contoso brand gear includes a 1-year manufacturer warranty covering defects in materials "
            "and craftsmanship. If your gear breaks or experiences defects under normal outdoor use, "
            "we will repair or replace it at no charge."
        ),
        category="warranty",
        keywords=[
            "warranty",
            "lifetime warranty",
            "guarantee",
            "manufacturer warranty",
            "defect",
            "defects",
            "craftsmanship",
            "repair",
            "broken gear",
        ],
        url="/help/warranty",
    ),
    "price_match": FaqItem(
        faq_id="price_match",
        question="Does Contoso offer a price match guarantee?",
        answer=(
            "We offer a 14-day price match guarantee for identical in-stock items from authorized "
            "outdoor retailers. If you find a lower qualifying price within 14 days of purchase, "
            "contact customer support to receive a price match."
        ),
        category="price_match",
        keywords=[
            "price match",
            "price matching",
            "competitor price",
            "guarantee",
            "lower price",
            "cheaper",
            "price match guarantee",
        ],
        url="/help/price-match",
    ),
    "gear_care": FaqItem(
        faq_id="gear_care",
        question="How should I clean and care for outdoor gear and tents?",
        answer=(
            "For waterproof tent care and outerwear maintenance, clean gently with mild soap and lukewarm water, "
            "avoiding machine washing and harsh detergents. Perform regular seam sealing on tents and reapply "
            "DWR water-repellent coating when needed. Thoroughly clean and air-dry boots after use."
        ),
        category="gear_care",
        keywords=[
            "gear care",
            "clean tent",
            "care for boots",
            "waterproof tent care",
            "seam sealing",
            "washing",
            "cleaning",
            "maintenance",
            "clean",
            "care",
        ],
        url="/help/gear-care",
    ),
    "rewards": FaqItem(
        faq_id="rewards",
        question="What is the Contoso Trailblazer loyalty rewards program?",
        answer=(
            "The Contoso Trailblazer loyalty rewards program lets members earn points on every purchase, "
            "enjoy free return shipping, and access exclusive member gear discounts and early product drops."
        ),
        category="rewards",
        keywords=[
            "rewards",
            "rewards program",
            "loyalty points",
            "trailblazer",
            "loyalty",
            "loyalty rewards",
            "earn points",
            "points",
            "membership",
        ],
        url="/help/rewards",
    ),
    "rentals": FaqItem(
        faq_id="rentals",
        question="Do you offer gear rental services?",
        answer=(
            "Yes, we offer in-store gear rental options at select flagship store locations including "
            "Seattle, Denver, Portland, and Salt Lake City. You can rent tents, backpacks, skis, and camping equipment."
        ),
        category="rentals",
        keywords=[
            "rentals",
            "rent gear",
            "equipment rental",
            "gear rental",
            "rental",
            "renting",
            "rent tent",
            "rent tents",
        ],
        url="/help/rentals",
    ),
}

# Regex patterns prioritized for FAQ intent detection
FAQ_INTENT_PATTERNS: dict[str, list[str]] = {
    "price_match": [
        r"\bprice\s*[- ]?\s*match(ing)?\b",
        r"\bcompetitor\s+price\b",
        r"\bmatch\s+(?:a\s+)?lower\s+price\b",
        r"\bcheaper\s+somewhere\s+else\b",
    ],
    "warranty": [
        r"\blifetime\s+warranty\b",
        r"\bwarranty\b",
        r"\bguarantee\b",
        r"\bmanufacturer\s+warranty\b",
        r"\bdefect(s|ive)?\b",
    ],
    "returns": [
        r"\breturn\s+policy\b",
        r"\bhow\s+to\s+return\b",
        r"\brefunds?\b",
        r"\breturns?\b",
        r"\b30[- ]days?\b",
        r"\breturn\s+shipping\b",
        r"\bmoney\s+back\b",
    ],
    "shipping": [
        r"\bshipping\s+cost\b",
        r"\bfree\s+shipping\b",
        r"\bhow\s+long\s+to\s+ship\b",
        r"\binternational\s+shipping\b",
        r"\bshipping\s+rates?\b",
        r"\bdelivery\s+times?\b",
        r"\bexpress\s+shipping\b",
        r"\bhow\s+much\s+is\s+shipping\b",
    ],
    "gear_care": [
        r"\bclean\s+tent\b",
        r"\bcare\s+for\s+boots\b",
        r"\bgear\s+care\b",
        r"\bwaterproof\s+tent\s+care\b",
        r"\bseam\s+seal(ing)?\b",
        r"\bcare\s+for\s+gear\b",
        r"\bclean(ing)?\s+(?:outdoor\s+)?gear\b",
    ],
    "rewards": [
        r"\brewards\s+program\b",
        r"\bloyalty\s+points\b",
        r"\btrailblazer\b",
        r"\bloyalty\s+rewards?\b",
        r"\bearn\s+points\b",
    ],
    "rentals": [
        r"\brent\s+gear\b",
        r"\bequipment\s+rental\b",
        r"\bgear\s+rental\b",
        r"\bin[- ]store\s+gear\s+rental\b",
        r"\brent\s+(?:a\s+)?(?:tent|skis?|backpack)\b",
    ],
}


def get_all_faqs() -> list[FaqItem]:
    """Returns all FAQ items in the knowledge catalog."""
    return [item.model_copy() for item in FAQ_CATALOG.values()]


def get_faq_by_id(faq_id: str) -> Optional[FaqItem]:
    """Case-insensitive lookup for an FAQ item by ID."""
    if not isinstance(faq_id, str):
        return None
    normalized_id = faq_id.strip().lower()
    if not normalized_id:
        return None
    item = FAQ_CATALOG.get(normalized_id)
    return item.model_copy() if item else None


def search_faqs(query: str, category: Optional[str] = None, limit: int = 3) -> list[FaqItem]:
    """Searches FAQs by query and optional category filter, up to limit."""
    if not isinstance(query, str):
        query = ""

    normalized_query = query.strip().lower()
    normalized_cat = category.strip().lower() if category and isinstance(category, str) else None

    items = list(FAQ_CATALOG.values())
    if normalized_cat:
        items = [item for item in items if item.category.lower() == normalized_cat]

    if not normalized_query:
        selected = items[:limit] if limit > 0 else items
        return [item.model_copy() for item in selected]

    scored_items: list[tuple[float, FaqItem]] = []
    query_tokens = [t for t in re.split(r"\W+", normalized_query) if t]

    for item in items:
        score = 0.0

        for kw in item.keywords:
            kw_lower = kw.lower()
            if normalized_query == kw_lower:
                score += 12.0
            elif kw_lower in normalized_query or normalized_query in kw_lower:
                score += 6.0
            for token in query_tokens:
                if len(token) > 2 and token in kw_lower:
                    score += 2.0

        q_lower = item.question.lower()
        if normalized_query in q_lower:
            score += 8.0
        for token in query_tokens:
            if len(token) > 2 and token in q_lower:
                score += 3.0

        a_lower = item.answer.lower()
        if normalized_query in a_lower:
            score += 5.0
        for token in query_tokens:
            if len(token) > 2 and token in a_lower:
                score += 1.5

        if normalized_query in item.faq_id.lower():
            score += 6.0
        if normalized_query in item.category.lower():
            score += 6.0

        if score > 0.0:
            scored_items.append((score, item))

    scored_items.sort(key=lambda x: x[0], reverse=True)
    selected = [item.model_copy() for _, item in scored_items]
    return selected[:limit] if limit > 0 else selected


def detect_faq_intent(question: str) -> Optional[FaqSearchResult]:
    """Detects FAQ intent from customer questions using keyword/regex matching."""
    if not isinstance(question, str) or not question.strip():
        return None

    cleaned = question.strip()

    for category, patterns in FAQ_INTENT_PATTERNS.items():
        for pattern_str in patterns:
            if re.search(pattern_str, cleaned, re.IGNORECASE):
                primary_item = FAQ_CATALOG.get(category)
                if not primary_item:
                    continue

                # Top matches with primary item first
                matches = [primary_item.model_copy()]
                return FaqSearchResult(
                    query=cleaned,
                    category=category,
                    matches=matches,
                )

    return None


def build_faq_prompt(faq_items: list[FaqItem], question: str) -> str:
    """Formats official store policies for LLM prompt injection."""
    if not faq_items:
        return ""

    lines = [
        "Official Store FAQ & Policy Guidance:",
        f"Customer Question: {question}",
        "",
        "Official Store Policies:",
    ]
    for item in faq_items:
        lines.append(f"- Topic: {item.question} (Category: {item.category})")
        lines.append(f"  Official Policy: {item.answer}")
        if item.url:
            lines.append(f"  Reference URL: {item.url}")

    lines.extend([
        "",
        "Instructions for Assistant:",
        "- Provide an accurate, authoritative answer grounded strictly in the official store policies above.",
        "- Reference applicable policy terms, timeframes (e.g., 30-day returns, 1-year warranty, 14-day price match), and benefits.",
        "- Provide the reference URL to the customer when guiding them on how to proceed.",
        "- Be polite, professional, and clear.",
    ])

    return "\n".join(lines)
