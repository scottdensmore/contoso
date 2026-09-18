import re
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel


class SentimentRating(str, Enum):
    POSITIVE = "positive"
    MIXED = "mixed"
    NEGATIVE = "negative"


class ProductReviewSummary(BaseModel):
    product_slug: str
    product_name: str
    average_rating: float
    total_reviews: int
    sentiment: SentimentRating
    pros: list[str]
    cons: list[str]
    key_quote: str
    recommendation_percentage: int


REVIEW_SUMMARY_CATALOG: dict[str, ProductReviewSummary] = {
    "trailmaster-x4-tent": ProductReviewSummary(
        product_slug="trailmaster-x4-tent",
        product_name="TrailMaster X4 Tent",
        average_rating=4.7,
        total_reviews=48,
        sentiment=SentimentRating.POSITIVE,
        pros=[
            "Waterproof double-wall construction",
            "Spacious 4-person capacity",
            "Simple 10-minute setup",
        ],
        cons=[
            "Packed weight is slightly heavy",
            "Stakes could be sturdier",
        ],
        key_quote="Weathered heavy alpine storms without a single drop inside; remarkably spacious for four campers.",
        recommendation_percentage=94,
    ),
    "adventurer-pro-backpack": ProductReviewSummary(
        product_slug="adventurer-pro-backpack",
        product_name="Adventurer Pro Backpack",
        average_rating=4.8,
        total_reviews=62,
        sentiment=SentimentRating.POSITIVE,
        pros=[
            "Ergonomic lumbar support",
            "Durable ripstop nylon",
            "Hydration bladder compatible",
        ],
        cons=[
            "Side water bottle pockets are tight when fully loaded",
        ],
        key_quote="The lumbar support made carrying 45 lbs through the backcountry feel effortless.",
        recommendation_percentage=96,
    ),
    "summit-breeze-jacket": ProductReviewSummary(
        product_slug="summit-breeze-jacket",
        product_name="Summit Breeze Jacket",
        average_rating=4.5,
        total_reviews=35,
        sentiment=SentimentRating.POSITIVE,
        pros=[
            "Windproof and breathable",
            "Lightweight packable design",
            "Adjustable storm hood",
        ],
        cons=[
            "Runs slightly trim in shoulders",
        ],
        key_quote="Cuts ridge winds completely while venting heat exceptionally well on steep climbs.",
        recommendation_percentage=89,
    ),
    "alpine-trekker-boots": ProductReviewSummary(
        product_slug="alpine-trekker-boots",
        product_name="Alpine Trekker Boots",
        average_rating=4.6,
        total_reviews=51,
        sentiment=SentimentRating.POSITIVE,
        pros=[
            "Vibram high-traction outsole",
            "Gore-Tex waterproof membrane",
            "Excellent ankle support",
        ],
        cons=[
            "Requires 1-2 days break-in period",
        ],
        key_quote="Zero blisters across 40 miles of rugged rocky trail and dry feet through stream crossings.",
        recommendation_percentage=91,
    ),
    "ridge-rest-sleeping-pad": ProductReviewSummary(
        product_slug="ridge-rest-sleeping-pad",
        product_name="Ridge Rest Sleeping Pad",
        average_rating=4.4,
        total_reviews=29,
        sentiment=SentimentRating.POSITIVE,
        pros=[
            "High R-value insulation",
            "Quick inflation valve",
            "Comfortable 3-inch thickness",
        ],
        cons=[
            "Packed roll is slightly bulky",
        ],
        key_quote="Warmest sleeping pad I've used for sub-freezing nights on cold rocky ground.",
        recommendation_percentage=86,
    ),
}

REVIEW_TRIGGER_PATTERNS: list[str] = [
    r"\bwhat\s+do\s+customers\s+think\b",
    r"\breviews?\s+(?:for|of|on|about)\b",
    r"\bpros\s+and\s+cons\b",
    r"\bcustomer\s+feedback\b",
    r"\bis\s+it\s+good\s+quality\b",
    r"\bis\s+(?:the|this|that)?\s*[a-z0-9\s-]+\s+good(?:\s+quality)?\b",
    r"\bcomplaints?\s+(?:about|for|on)\b",
    r"\bratings?\s+(?:for|of|on|about)\b",
    r"\bwould\s+customers\s+recommend\b",
    r"\bcustomer\s+opinions?\b",
    r"\bcustomer\s+reviews?\b",
    r"\bcustomer\s+ratings?\b",
    r"\breview\s+summary\b",
    r"\bwhat\s+are\s+the\s+pros\b",
    r"\bfeedback\s+on\b",
    r"\bopinions?\s+on\b",
]

PRODUCT_DETECTION_PATTERNS: list[tuple[str, list[str]]] = [
    (
        "trailmaster-x4-tent",
        [
            r"trailmaster-x4-tent",
            r"trailmaster(?:-|\s+)x4(?:-|\s+)tent",
            r"trailmaster(?:-|\s+)x4",
            r"trailmaster(?:-|\s+)tent",
            r"\btrailmaster\b",
            r"\btent\b",
        ],
    ),
    (
        "adventurer-pro-backpack",
        [
            r"adventurer-pro-backpack",
            r"adventurer(?:-|\s+)pro(?:-|\s+)backpack",
            r"adventurer(?:-|\s+)pro(?:-|\s+)pack",
            r"adventurer(?:-|\s+)pro\b",
            r"adventurer(?:-|\s+)backpack",
            r"\badventurer\b",
            r"\bbackpack\b",
        ],
    ),
    (
        "summit-breeze-jacket",
        [
            r"summit-breeze-jacket",
            r"summit(?:-|\s+)breeze(?:-|\s+)jacket",
            r"summit(?:-|\s+)breeze\b",
            r"summit(?:-|\s+)jacket",
            r"\bjacket\b",
        ],
    ),
    (
        "alpine-trekker-boots",
        [
            r"alpine-trekker-boots",
            r"alpine(?:-|\s+)trekker(?:-|\s+)boots?",
            r"alpine(?:-|\s+)trekker\b",
            r"alpine(?:-|\s+)boots?",
            r"trekker(?:-|\s+)boots?",
            r"\bboots?\b",
        ],
    ),
    (
        "ridge-rest-sleeping-pad",
        [
            r"ridge-rest-sleeping-pad",
            r"ridge(?:-|\s+)rest(?:-|\s+)sleeping(?:-|\s+)pad",
            r"ridge(?:-|\s+)rest(?:-|\s+)pad",
            r"ridge(?:-|\s+)rest\b",
            r"sleeping(?:-|\s+)pad\b",
            r"\bpad\b",
        ],
    ),
]


def get_review_summary(product_slug: str) -> Optional[ProductReviewSummary]:
    """Retrieves structured review summary for a given product slug."""
    if not isinstance(product_slug, str) or not product_slug.strip():
        return None
    normalized_slug = product_slug.strip().lower()
    return REVIEW_SUMMARY_CATALOG.get(normalized_slug)


def detect_review_sentiment_intent(question: str) -> dict[str, Any]:
    """Detects review sentiment intent from question, extracting product slug and summary."""
    default_res: dict[str, Any] = {
        "is_review_intent": False,
        "product_slug": None,
        "summary": None,
    }
    if not isinstance(question, str) or not question.strip():
        return default_res

    cleaned = question.strip()
    is_triggered = any(re.search(pat, cleaned, re.IGNORECASE) for pat in REVIEW_TRIGGER_PATTERNS)
    if not is_triggered:
        return default_res

    # Detect product slug from known catalog items and aliases
    detected_slug: Optional[str] = None
    for slug, patterns in PRODUCT_DETECTION_PATTERNS:
        if any(re.search(p, cleaned, re.IGNORECASE) for p in patterns):
            detected_slug = slug
            break

    # If no known product matched, try extracting a slug format (e.g. unknown-product-999)
    if not detected_slug:
        slug_match = re.search(r"\b([a-z0-9]+(?:-[a-z0-9]+)+)\b", cleaned, re.IGNORECASE)
        if slug_match:
            detected_slug = slug_match.group(1).lower()

    summary = get_review_summary(detected_slug) if detected_slug else None

    return {
        "is_review_intent": True,
        "product_slug": detected_slug,
        "summary": summary,
    }


def build_review_summary_prompt(
    summary: Optional[ProductReviewSummary], question: str
) -> str:
    """Formats customer feedback, pros, cons, ratings, and sentiment for LLM prompt injection."""
    if not summary:
        return ""

    lines = [
        "Contoso Outdoors Verified Customer Review & Sentiment Summary:",
        f"Customer Question: {question}",
        "",
        f"Product: {summary.product_name} (Slug: {summary.product_slug})",
        f"Average Rating: {summary.average_rating}/5.0 stars ({summary.total_reviews} verified customer reviews)",
        f"Overall Sentiment: {summary.sentiment.value.upper()} ({summary.recommendation_percentage}% of customers recommend this product)",
        "",
        "Customer Pros (What buyers love):",
        *[f"- {pro}" for pro in summary.pros],
        "",
        "Customer Cons (Criticisms and limitations):",
        *[f"- {con}" for con in summary.cons],
        "",
        f'Key Customer Quote: "{summary.key_quote}"',
        "",
        "Instructions for Assistant:",
        "- Synthesize real customer feedback objectively based on the verified review summary above.",
        "- Highlight key strengths and pros that customers appreciate.",
        "- Transparently address known cons or limitations so the customer can make an informed decision.",
        "- Mention the overall customer rating, review volume, and recommendation percentage.",
        "- Maintain a helpful, balanced, and authentic outdoor gear advisory tone.",
    ]
    return "\n".join(lines)
