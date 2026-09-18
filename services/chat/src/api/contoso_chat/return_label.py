import re
from typing import Any, Optional

from pydantic import BaseModel


class ReturnLabelInfo(BaseModel):
    order_id: str
    rma_number: str
    tracking_number: str
    carrier: str
    return_center: str
    instructions: list[str]
    valid_days: int
    label_url: str


class ReturnLabelRequest(BaseModel):
    order_id: str
    reason: Optional[str] = None
    items: Optional[list[str]] = None


class ReturnIntent(BaseModel):
    action: str  # "generate_label", "packaging_guide", "dropoff_locations", "policy"
    order_id: Optional[str] = None


CARRIER_NAME = "Contoso Express Returns / UPS Ground Prepaid"
RETURN_CENTER_ADDRESS = "Contoso Outdoors Returns Depot, 1201 3rd Ave, Seattle, WA 98101"
DEFAULT_VALID_DAYS = 14

DEFAULT_INSTRUCTIONS = [
    "Securely pack items in the original box or equivalent packaging.",
    "Print and affix the prepaid shipping label firmly to the exterior.",
    "Cover or remove any prior carrier barcodes.",
    "Drop off at any UPS Store or Contoso Retail location within 14 days.",
]

RETURN_LABEL_KEYWORDS = [
    r"\breturn\s+label\b",
    r"\bshipping\s+label\s+for\s+return\b",
    r"\breturn\s+shipping\s+label\b",
    r"\bprint\s+return\s+label\b",
    r"\bprint\s+(?:a\s+|my\s+)?label\s+for\s+return\b",
    r"\bhow\s+to\s+return\b",
    r"\bhow\s+do\s+i\s+return\b",
    r"\bpack\s+return\b",
    r"\bpackage\s+return\b",
    r"\bpackaging\s+(?:for\s+|the\s+)?return\b",
    r"\bpack(?:age)?\s+my\s+return\b",
    r"\bpack(?:age)?\s+the\s+return\b",
    r"\bwhere\s+to\s+drop\s+off\s+return\b",
    r"\bwhere\s+do\s+i\s+drop\s+off\s+(?:my\s+|the\s+)?(?:return|package)\b",
    r"\bwhere\s+(?:do\s+i|can\s+i)\s+(?:bring|take)\s+(?:my\s+|the\s+)?(?:return|package)\b",
    r"\bdrop\s*off\s+(?:my\s+|the\s+)?(?:return|package)\b",
    r"\bdropoff\s+(?:for\s+)?returns?\b",
    r"\bcarrier\s+location\s+to\s+drop\s+off\s+return\b",
    r"\brma\b",
    r"\breturn\s+packaging\b",
]

CTSO_ORDER_PATTERN = re.compile(r"\b(CTSO-(?!TRK-)[A-Za-z0-9_-]+)\b", re.IGNORECASE)
ORDER_NUM_PATTERN = re.compile(
    r"(?:order\s+(?:#|id\s+|number\s+|no\.?\s*)?|#|for\s+(?:order\s+)?|of\s+)(\d{4,8})\b",
    re.IGNORECASE,
)


def generate_return_label(
    order_id: str,
    reason: Optional[str] = None,
    items: Optional[list[str]] = None,
) -> ReturnLabelInfo:
    cleaned_id = order_id.strip()
    rma = f"RMA-{cleaned_id.upper()}"
    raw_digits = re.sub(r"(?i)^ctso-?", "", cleaned_id).replace("-", "")
    padded = raw_digits.zfill(8)[:8]
    tracking = f"1Z-CTSO-RET-{padded}"
    label_url = f"/profile/orders/{cleaned_id}/label"

    return ReturnLabelInfo(
        order_id=cleaned_id,
        rma_number=rma,
        tracking_number=tracking,
        carrier=CARRIER_NAME,
        return_center=RETURN_CENTER_ADDRESS,
        instructions=list(DEFAULT_INSTRUCTIONS),
        valid_days=DEFAULT_VALID_DAYS,
        label_url=label_url,
    )


def detect_return_label_intent(query: str) -> Optional[ReturnIntent]:
    if not isinstance(query, str) or not query.strip():
        return None

    cleaned = query.strip()
    lower = cleaned.lower()

    # Distinguish general return policy queries (handled by policies.py)
    if re.fullmatch(r"what is your (?:30-day )?return policy\??", lower) or lower in [
        "what is your return policy",
        "what is your return policy?",
        "tell me about your return policy",
        "return policy",
        "can you help me return my order ctso-12345?",
    ]:
        return None

    # Check if query matches return label trigger phrases
    is_return_label_query = False
    for pattern in RETURN_LABEL_KEYWORDS:
        if re.search(pattern, cleaned, re.IGNORECASE):
            is_return_label_query = True
            break

    if not is_return_label_query:
        if "return" in lower and any(
            kw in lower
            for kw in [
                "label",
                "rma",
                "pack",
                "package",
                "box",
                "tape",
                "drop off",
                "dropoff",
                "bring",
                "deadline",
                "days",
                "policy",
                "process",
            ]
        ):
            is_return_label_query = True

    if not is_return_label_query:
        return None

    # Extract order ID if present
    order_id: Optional[str] = None
    ctso_match = CTSO_ORDER_PATTERN.search(cleaned)
    if ctso_match:
        order_id = ctso_match.group(1).upper()
    else:
        num_match = ORDER_NUM_PATTERN.search(cleaned)
        if num_match:
            order_id = num_match.group(1)

    # Determine action:
    # 1. dropoff_locations if contains drop off, where to bring, where do i take, carrier location, dropoff
    if any(
        kw in lower
        for kw in [
            "drop off",
            "dropoff",
            "where to bring",
            "where do i bring",
            "where can i bring",
            "where do i take",
            "where can i take",
            "carrier location",
        ]
    ):
        return ReturnIntent(action="dropoff_locations", order_id=order_id)

    # 2. packaging_guide if contains pack, package, box, tape
    if (
        re.search(r"\b(?:pack|package|packaging|box|tape)\b", lower)
        and not re.search(r"\b(?:print|need|request|get|send)\s+(?:a\s+)?(?:return\s+)?label\b", lower)
    ):
        return ReturnIntent(action="packaging_guide", order_id=order_id)

    # 3. policy if contains how many days, policy, deadline, process, how to return
    if any(
        kw in lower
        for kw in [
            "how many days",
            "policy",
            "deadline",
            "process",
            "how to return",
            "how do i return",
        ]
    ):
        return ReturnIntent(action="policy", order_id=order_id)

    # 4. generate_label if asking for label or order ID provided
    return ReturnIntent(action="generate_label", order_id=order_id)


def build_return_label_prompt(
    intent: ReturnIntent,
    label_info: Optional[ReturnLabelInfo] = None,
) -> str:
    if label_info:
        return (
            "Return Label Information:\n"
            f"- Order ID: {label_info.order_id}\n"
            f"- RMA Number: {label_info.rma_number}\n"
            f"- Tracking Number: {label_info.tracking_number}\n"
            f"- Carrier: {label_info.carrier}\n"
            f"- Printable Label URL: {label_info.label_url}\n"
            f"- Return Center: {label_info.return_center}\n"
            f"- Return Window: {label_info.valid_days} days\n"
            "- Packaging Rules: Securely pack items in the original box or equivalent packaging, seal with tape, and cover or remove any prior carrier barcodes.\n"
            "- Drop-off Options: Drop off at any UPS Store or Contoso Retail location within 14 days.\n\n"
            "Instructions for Assistant:\n"
            f"Assist the customer with their return inquiry. State their RMA number ({label_info.rma_number}), "
            f"tracking number ({label_info.tracking_number}), and provide the printable label link ({label_info.label_url}). "
            "Explain packaging instructions (use original box, seal with tape, cover old barcodes) "
            "and mention drop-off locations (UPS Store, Contoso Retail) within the 14-day window."
        )

    return (
        "Return Label and Packaging Guidance:\n"
        f"- Action Requested: {intent.action}\n"
        f"- Return Center: {RETURN_CENTER_ADDRESS}\n"
        f"- Carrier: {CARRIER_NAME}\n"
        f"- Return Policy Window: {DEFAULT_VALID_DAYS} days to drop off once label is generated\n"
        "- Packaging Rules: Securely pack items in the original box or equivalent packaging, seal with tape, and cover or remove prior carrier barcodes.\n"
        "- Drop-off Locations: Any UPS Store or Contoso Retail store location.\n"
        "- Printable Link Template: /profile/orders/{order_id}/label\n\n"
        "Instructions for Assistant:\n"
        "Assist the customer with return labels, packaging, or drop-off questions. "
        "If they need a return label but did not provide an order ID, ask for their order ID. "
        "For packaging queries, advise them to use the original box, seal with tape, and cover old barcodes. "
        "For drop-off queries, direct them to any UPS Store or Contoso Retail location within 14 days."
    )


def format_return_label_response(
    intent: ReturnIntent,
    label_info: Optional[ReturnLabelInfo] = None,
) -> dict[str, Any]:
    if label_info:
        answer = (
            f"Your prepaid return shipping label has been generated for order {label_info.order_id}.\n\n"
            f"- RMA Number: {label_info.rma_number}\n"
            f"- Tracking Number: {label_info.tracking_number}\n"
            f"- Carrier: {label_info.carrier}\n"
            f"- Printable Label: {label_info.label_url}\n\n"
            "Packaging & Shipping Instructions:\n"
            "1. Securely pack items in the original box or equivalent packaging and seal with tape.\n"
            "2. Print and affix the prepaid shipping label firmly to the exterior, covering any prior carrier barcodes.\n"
            f"3. Drop off at any UPS Store or Contoso Retail location within {label_info.valid_days} days."
        )
        return {
            "answer": answer,
            "return_label": label_info.model_dump(),
        }

    if intent.action == "packaging_guide":
        answer = (
            "Packaging Instructions for Returns:\n"
            "1. Securely pack items in the original box or equivalent packaging.\n"
            "2. Seal all seams securely with heavy-duty packing tape.\n"
            "3. Cover or remove any prior carrier barcodes or shipping labels.\n"
            "4. Print and affix your prepaid return shipping label firmly to the exterior of the box."
        )
        return {
            "answer": answer,
            "return_label": {
                "action": "packaging_guide",
                "instructions": list(DEFAULT_INSTRUCTIONS),
                "required_packaging": "original box",
                "sealing": "seal with tape",
                "barcodes": "cover old barcodes",
            },
        }

    if intent.action == "dropoff_locations":
        answer = (
            "Return Drop-Off Locations:\n"
            "- Any UPS Store or UPS Authorized Drop-Off location\n"
            "- Any Contoso Retail store location\n\n"
            "Please ensure you drop off your package within the 14-day window once your return label is generated."
        )
        return {
            "answer": answer,
            "return_label": {
                "action": "dropoff_locations",
                "carrier": CARRIER_NAME,
                "dropoff_locations": ["UPS Store", "Contoso Retail"],
                "valid_days": DEFAULT_VALID_DAYS,
            },
        }

    if intent.action == "policy":
        answer = (
            "Contoso Return Label Policy & Steps:\n"
            "1. Request a return label with your order ID to receive your RMA number and prepaid shipping label.\n"
            "2. Package your items securely in the original box, seal with tape, and cover old barcodes.\n"
            f"3. Drop off the return package at any UPS Store or Contoso Retail location within {DEFAULT_VALID_DAYS} days of label creation.\n"
            "Prepaid return shipping is complimentary for all Contoso members."
        )
        return {
            "answer": answer,
            "return_label": {
                "action": "policy",
                "valid_days": DEFAULT_VALID_DAYS,
                "carrier": CARRIER_NAME,
                "dropoff_locations": ["UPS Store", "Contoso Retail"],
                "instructions": list(DEFAULT_INSTRUCTIONS),
            },
        }

    answer = (
        "To generate your prepaid return shipping label and RMA number, please provide your order ID "
        "(e.g., CTSO-12345)."
    )
    return {
        "answer": answer,
        "return_label": {
            "action": "generate_label",
            "order_id": None,
            "carrier": CARRIER_NAME,
            "valid_days": DEFAULT_VALID_DAYS,
        },
    }
