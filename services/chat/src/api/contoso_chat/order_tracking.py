import re
from datetime import datetime, timezone
from typing import Any, Optional

ORDER_ID_STOPWORDS = {
    "a",
    "an",
    "the",
    "my",
    "your",
    "our",
    "this",
    "that",
    "some",
    "status",
    "tracking",
    "history",
    "details",
    "info",
    "information",
    "cancellation",
    "update",
    "updates",
    "item",
    "items",
    "product",
    "products",
    "tent",
    "tents",
    "backpack",
    "backpacks",
    "boots",
    "jacket",
    "gear",
    "arrive",
    "arrives",
    "arrived",
    "ship",
    "ships",
    "shipped",
    "shipping",
    "deliver",
    "delivers",
    "delivered",
    "delivery",
    "package",
    "packages",
    "here",
    "there",
    "now",
    "yet",
    "today",
    "tomorrow",
    "soon",
}

TRACKING_PHRASE_PATTERNS = [
    r"\bwhere\s+is\s+(?:my\s+|the\s+)?order\b",
    r"\btrack(?:\s+my|\s+the)?\s+order\b",
    r"\border\s+tracking\b",
    r"\btracking\s+order\b",
    r"\border\s+status\b",
    r"\bstatus\s+of\s+(?:my\s+|the\s+)?order\b",
    r"\bwhen\s+will\s+(?:my\s+|the\s+)?order\s+(?:arrive|be\s+delivered|ship)\b",
    r"\bhas\s+(?:my\s+|the\s+)?order\s+shipped\b",
    r"\bdid\s+(?:my\s+|the\s+)?order\s+ship\b",
    r"\bis\s+(?:my\s+|the\s+)?order\s+on\s+the\s+way\b",
    r"\bpackage\s+status\b",
    r"\btrack\s+package\b",
    r"\bwhere\s+is\s+my\s+package\b",
]

EXPLICIT_CTSO_PATTERN = re.compile(r"\b(CTSO-[A-Za-z0-9_-]+)\b", re.IGNORECASE)
ORDER_HASH_PATTERN = re.compile(r"#([A-Za-z0-9_-]+)", re.IGNORECASE)
EXPLICIT_ORDER_ID_KEYWORD_PATTERN = re.compile(
    r"\border\s+(?:#|id\s+|number\s+|no\.?\s*)([A-Za-z0-9_-]+)",
    re.IGNORECASE,
)
GENERIC_ORDER_ID_PATTERN = re.compile(
    r"\border\s+([A-Za-z0-9_-]+)",
    re.IGNORECASE,
)


def _is_plausible_generic_order_id(candidate: str) -> bool:
    cand_lower = candidate.lower()
    if cand_lower in ORDER_ID_STOPWORDS:
        return False
    if cand_lower.startswith("ctso-"):
        return True
    if any(ch.isdigit() for ch in candidate) or ("-" in candidate and len(candidate) > 2):
        return True
    return False


def detect_order_tracking_intent(question: str) -> dict[str, Any]:
    """Pattern matching / regex for order tracking intent and order_id extraction."""
    if not isinstance(question, str) or not question.strip():
        return {"is_tracking_intent": False, "extracted_order_id": None}

    cleaned_question = question.strip()

    # 1. Check for explicit CTSO order ID
    ctso_match = EXPLICIT_CTSO_PATTERN.search(cleaned_question)
    if ctso_match:
        return {
            "is_tracking_intent": True,
            "extracted_order_id": ctso_match.group(1),
        }

    # 2. Check for #<id>
    hash_match = ORDER_HASH_PATTERN.search(cleaned_question)
    if hash_match:
        extracted = hash_match.group(1).strip()
        if extracted.lower() not in ORDER_ID_STOPWORDS:
            return {
                "is_tracking_intent": True,
                "extracted_order_id": extracted,
            }

    # 3. Check for "order #/<id keyword> <id>"
    kw_match = EXPLICIT_ORDER_ID_KEYWORD_PATTERN.search(cleaned_question)
    if kw_match:
        extracted = kw_match.group(1).strip()
        if extracted.lower() not in ORDER_ID_STOPWORDS:
            return {
                "is_tracking_intent": True,
                "extracted_order_id": extracted,
            }

    # 4. Check for "order <id>" where <id> contains digits/hyphens
    gen_kw_match = GENERIC_ORDER_ID_PATTERN.search(cleaned_question)
    if gen_kw_match:
        extracted = gen_kw_match.group(1).strip()
        if _is_plausible_generic_order_id(extracted):
            return {
                "is_tracking_intent": True,
                "extracted_order_id": extracted,
            }

    # 5. Check for general tracking intent phrases
    for pattern in TRACKING_PHRASE_PATTERNS:
        if re.search(pattern, cleaned_question, re.IGNORECASE):
            return {
                "is_tracking_intent": True,
                "extracted_order_id": None,
            }

    return {"is_tracking_intent": False, "extracted_order_id": None}


def _parse_order_date(order: dict[str, Any]) -> datetime:
    """Extracts and parses datetime from an order dict, returning timezone-aware UTC datetime."""
    raw = order.get("date") or order.get("createdAt")
    if isinstance(raw, datetime):
        return raw if raw.tzinfo else raw.replace(tzinfo=timezone.utc)
    if isinstance(raw, str) and raw.strip():
        try:
            clean_str = raw.strip().replace("Z", "+00:00")
            parsed = datetime.fromisoformat(clean_str)
            return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
        except (ValueError, TypeError):
            pass
    return datetime.min.replace(tzinfo=timezone.utc)


def lookup_order_tracking(
    customer_id: Optional[str],
    order_id: Optional[str] = None,
    customer_orders: Optional[list[dict[str, Any]]] = None,
    current_time: Optional[datetime] = None,
) -> Optional[dict[str, Any]]:
    """Resolves order tracking details for a customer order."""
    if not customer_id or not customer_orders:
        return None

    matched_order: Optional[dict[str, Any]] = None

    if order_id:
        target = order_id.strip().lstrip("#").lower()
        for o in customer_orders:
            if not isinstance(o, dict):
                continue
            oid = str(o.get("id", "")).strip().lstrip("#").lower()
            if oid == target:
                matched_order = o
                break
        if not matched_order:
            return None
    else:
        # Fallback to most recent order
        valid_orders = [o for o in customer_orders if isinstance(o, dict) and o.get("id")]
        if not valid_orders:
            return None
        matched_order = max(valid_orders, key=_parse_order_date)

    now = current_time if current_time is not None else datetime.now(timezone.utc)
    if now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)

    order_dt = _parse_order_date(matched_order)
    if order_dt == datetime.min.replace(tzinfo=timezone.utc):
        elapsed_seconds = 0.0
    else:
        elapsed_seconds = (now - order_dt).total_seconds()

    found_order_id = str(matched_order.get("id", ""))
    prefix_id = found_order_id[:8]

    if elapsed_seconds < 24 * 3600:
        status = "Processing"
        carrier = None
        tracking_number = None
        estimated_delivery = "In 3-5 business days"
        status_message = "Preparing for shipment at fulfillment center"
    elif elapsed_seconds <= 72 * 3600:
        status = "Shipped"
        carrier = "FedEx Ground"
        tracking_number = f"CTSO-TRK-{prefix_id}"
        estimated_delivery = "In 2 business days"
        status_message = "In transit with carrier"
    else:
        status = "Delivered"
        carrier = "FedEx Ground"
        tracking_number = f"CTSO-TRK-{prefix_id}"
        estimated_delivery = "Delivered"
        status_message = "Delivered to front door / porch"

    return {
        "order_id": matched_order.get("id"),
        "date": matched_order.get("date"),
        "status": status,
        "carrier": carrier,
        "tracking_number": tracking_number,
        "estimated_delivery": estimated_delivery,
        "status_message": status_message,
        "items_count": len(matched_order.get("items", []) or []),
        "total": matched_order.get("total"),
    }


def build_order_tracking_prompt(
    tracking_info: Optional[dict[str, Any]], question: str
) -> str:
    """Generates prompt guidance for LLM based on tracking resolution."""
    if tracking_info:
        return (
            "Order Tracking Information:\n"
            f"- Order ID: {tracking_info.get('order_id')}\n"
            f"- Order Date: {tracking_info.get('date')}\n"
            f"- Status: {tracking_info.get('status')}\n"
            f"- Carrier: {tracking_info.get('carrier') or 'N/A'}\n"
            f"- Tracking Number: {tracking_info.get('tracking_number') or 'N/A'}\n"
            f"- Estimated Delivery: {tracking_info.get('estimated_delivery')}\n"
            f"- Status Details: {tracking_info.get('status_message')}\n"
            f"- Total Items: {tracking_info.get('items_count')}\n"
            f"- Total Amount: {tracking_info.get('total')}\n\n"
            "Instructions for Assistant:\n"
            "Incorporate these order tracking details into your response. "
            "Provide the customer with their order ID, fulfillment status, carrier, "
            "tracking number (if available), and estimated arrival date. "
            "Be professional, reassuring, and concise."
        )
    return (
        "Order Tracking Information:\n"
        "No active orders or tracking information found for this customer.\n\n"
        "Instructions for Assistant:\n"
        "Politely inform the user that no active orders were found. "
        "Recommend checking the Profile Orders page or contacting customer support for further assistance."
    )
