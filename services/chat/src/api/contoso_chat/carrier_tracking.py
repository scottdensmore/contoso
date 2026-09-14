import re
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel


class MilestoneStatus(str, Enum):
    COMPLETED = "completed"
    IN_PROGRESS = "in_progress"
    PENDING = "pending"


class ShipmentMilestone(BaseModel):
    milestone_id: str
    name: str
    description: str
    location: str
    timestamp: Optional[str] = None
    status: MilestoneStatus


class CarrierTrackingInfo(BaseModel):
    order_id: str
    carrier: str  # e.g. "FedEx Ground", "UPS Ground"
    tracking_number: str  # e.g. "CTSO-TRK-98765"
    status: str  # "Processing", "Shipped", "Out for Delivery", "Delivered"
    estimated_delivery: str
    current_location: str
    service_level: str  # e.g. "Standard Ground", "2-Day Express"
    milestones: list[ShipmentMilestone]


CARRIER_PHRASE_PATTERNS = [
    r"\btrack(?:\s+the|\s+my)?\s+carrier\b",
    r"\bcarrier\s+tracking\b",
    r"\btrack\s+carrier\b",
    r"\bfedex(?:\s+ground)?\s+tracking\b",
    r"\bups(?:\s+ground)?\s+tracking\b",
    r"\bshipping\s+milestones?\b",
    r"\bshipment\s+milestones?\b",
    r"\btracking\s+number\b",
    r"\bwhere\s+is\s+(?:my\s+|the\s+)?package\b",
    r"\bwhere\s+is\s+(?:my\s+|the\s+)?shipment\b",
    r"\btrack(?:\s+my|\s+the)?\s+package\b",
    r"\btrack(?:\s+my|\s+the)?\s+shipment\b",
    r"\bpackage\s+tracking\b",
    r"\bshipment\s+tracking\b",
    r"\bcarrier\s+status\b",
]

CTSO_TRK_PATTERN = re.compile(r"\b(CTSO-TRK-[A-Za-z0-9_-]+)\b", re.IGNORECASE)
CTSO_ORDER_PATTERN = re.compile(r"\b(CTSO-[A-Za-z0-9_-]+)\b", re.IGNORECASE)
ORD_PATTERN = re.compile(r"\b(ord[_-][A-Za-z0-9_-]+)\b", re.IGNORECASE)
GENERIC_TRACKING_KEYWORD_PATTERN = re.compile(
    r"\b(?:tracking(?:\s+(?:number|id|#|no\.?))?|shipment(?:\s+(?:number|id|#|no\.?))?|package(?:\s+(?:number|id|#|no\.?))?)\s*[:#]?\s*([A-Za-z0-9_-]+)",
    re.IGNORECASE,
)

TRACKING_STOPWORDS = {
    "a",
    "an",
    "the",
    "my",
    "your",
    "our",
    "info",
    "information",
    "details",
    "status",
    "milestone",
    "milestones",
    "update",
    "updates",
    "carrier",
    "number",
    "here",
    "there",
    "now",
    "today",
    "order",
    "package",
    "shipment",
}


def detect_carrier_tracking_intent(question: str) -> dict[str, Any]:
    """Pattern matching / regex for carrier tracking queries and identifier extraction."""
    if not isinstance(question, str) or not question.strip():
        return {"is_carrier_intent": False, "extracted_identifier": None}

    cleaned = question.strip()

    # Check for explicit CTSO tracking number
    trk_match = CTSO_TRK_PATTERN.search(cleaned)
    if trk_match:
        return {
            "is_carrier_intent": True,
            "extracted_identifier": trk_match.group(1),
        }

    # Check for carrier phrases
    is_carrier_query = False
    for pattern in CARRIER_PHRASE_PATTERNS:
        if re.search(pattern, cleaned, re.IGNORECASE):
            is_carrier_query = True
            break

    # If carrier phrase or general intent, try to extract identifier
    extracted_id: Optional[str] = None

    # Check order patterns in the query
    order_match = CTSO_ORDER_PATTERN.search(cleaned)
    if order_match:
        cand = order_match.group(1)
        if not cand.upper().startswith("CTSO-TRK-"):
            extracted_id = cand

    if not extracted_id:
        ord_match = ORD_PATTERN.search(cleaned)
        if ord_match:
            extracted_id = ord_match.group(1)

    if not extracted_id:
        kw_match = GENERIC_TRACKING_KEYWORD_PATTERN.search(cleaned)
        if kw_match:
            candidate = kw_match.group(1).strip()
            if candidate.lower() not in TRACKING_STOPWORDS and len(candidate) > 2:
                extracted_id = candidate

    if is_carrier_query:
        return {
            "is_carrier_intent": True,
            "extracted_identifier": extracted_id,
        }

    if extracted_id and (
        extracted_id.upper().startswith("CTSO-TRK-")
        or "carrier" in cleaned.lower()
        or "fedex" in cleaned.lower()
        or "ups" in cleaned.lower()
        or "shipment" in cleaned.lower()
    ):
        return {
            "is_carrier_intent": True,
            "extracted_identifier": extracted_id,
        }

    return {"is_carrier_intent": False, "extracted_identifier": None}


def lookup_carrier_tracking(identifier: str) -> Optional[CarrierTrackingInfo]:
    """Deterministically resolves carrier tracking details and milestone events for an identifier."""
    if not isinstance(identifier, str):
        return None

    cleaned_id = identifier.strip()
    if not cleaned_id:
        return None

    upper_id = cleaned_id.upper()

    # Validate identifier format
    order_id: str
    tracking_number: str

    if upper_id.startswith("CTSO-TRK-"):
        suffix = cleaned_id[9:].strip()
        if not suffix:
            return None
        tracking_number = f"CTSO-TRK-{suffix.upper()}"
        order_id = f"CTSO-{suffix.upper()}"
    elif upper_id.startswith("CTSO-"):
        suffix = cleaned_id[5:].strip()
        if not suffix:
            return None
        order_id = f"CTSO-{suffix.upper()}"
        tracking_number = f"CTSO-TRK-{suffix.upper()}"
    elif re.match(r"^ord[_-][A-Za-z0-9_-]+$", cleaned_id, re.IGNORECASE):
        suffix = cleaned_id[4:].strip()
        if not suffix:
            return None
        order_id = cleaned_id
        tracking_number = f"CTSO-TRK-{suffix.upper()}"
    else:
        # Invalid identifier format or unknown ID
        return None

    # Deterministic carrier and service level
    carrier = "UPS Ground" if "UPS" in upper_id else "FedEx Ground"
    service_level = "2-Day Express" if "EXPRESS" in upper_id else "Standard Ground"
    carrier_pickup_loc = "UPS Facility, Redmond WA" if carrier == "UPS Ground" else "FedEx Facility, Kent WA"

    # Sequential milestone definitions
    # 1. order_confirmed
    # 2. processing
    # 3. carrier_pickup
    # 4. in_transit
    # 5. out_for_delivery / delivered

    # Determine status & milestone progress based on special test IDs or hash
    if "DELIVERED" in upper_id:
        state_idx = 3  # Delivered
    elif "PROCESSING" in upper_id:
        state_idx = 0  # Processing
    elif "TRANSIT" in upper_id or "SHIPPED" in upper_id or "DEMO" in upper_id:
        state_idx = 1  # Shipped / In Transit
    elif "OUT_FOR_DELIVERY" in upper_id:
        state_idx = 2  # Out for Delivery
    else:
        # Hash-based deterministic state
        state_idx = sum(ord(c) for c in upper_id) % 4

    if state_idx == 0:
        # Processing
        status = "Processing"
        estimated_delivery = "In 3-5 business days"
        current_location = "Distribution Center, Seattle WA"
        milestones = [
            ShipmentMilestone(
                milestone_id="order_confirmed",
                name="Order Confirmed",
                description="Order Confirmed & Payment Processed",
                location="Distribution Center, Seattle WA",
                timestamp="2026-09-10T08:30:00Z",
                status=MilestoneStatus.COMPLETED,
            ),
            ShipmentMilestone(
                milestone_id="processing",
                name="Processing",
                description="Packed and labeled at warehouse",
                location="Distribution Center, Seattle WA",
                timestamp="2026-09-10T10:15:00Z",
                status=MilestoneStatus.IN_PROGRESS,
            ),
            ShipmentMilestone(
                milestone_id="carrier_pickup",
                name="Carrier Pickup",
                description="Package picked up by carrier",
                location=carrier_pickup_loc,
                timestamp=None,
                status=MilestoneStatus.PENDING,
            ),
            ShipmentMilestone(
                milestone_id="in_transit",
                name="In Transit",
                description="In transit between sort facilities",
                location="Transit Hub, Portland OR",
                timestamp=None,
                status=MilestoneStatus.PENDING,
            ),
            ShipmentMilestone(
                milestone_id="delivered",
                name="Delivered",
                description="Delivered to front door / porch",
                location="Destination, Seattle WA",
                timestamp=None,
                status=MilestoneStatus.PENDING,
            ),
        ]
    elif state_idx == 1:
        # Shipped / In Transit
        status = "Shipped"
        estimated_delivery = "In 2 business days"
        current_location = "Transit Hub, Portland OR"
        milestones = [
            ShipmentMilestone(
                milestone_id="order_confirmed",
                name="Order Confirmed",
                description="Order Confirmed & Payment Processed",
                location="Distribution Center, Seattle WA",
                timestamp="2026-09-10T08:30:00Z",
                status=MilestoneStatus.COMPLETED,
            ),
            ShipmentMilestone(
                milestone_id="processing",
                name="Processing",
                description="Packed and labeled at warehouse",
                location="Distribution Center, Seattle WA",
                timestamp="2026-09-10T14:15:00Z",
                status=MilestoneStatus.COMPLETED,
            ),
            ShipmentMilestone(
                milestone_id="carrier_pickup",
                name="Carrier Pickup",
                description="Package picked up by carrier",
                location=carrier_pickup_loc,
                timestamp="2026-09-11T09:00:00Z",
                status=MilestoneStatus.COMPLETED,
            ),
            ShipmentMilestone(
                milestone_id="in_transit",
                name="In Transit",
                description="In transit between sort facilities",
                location="Transit Hub, Portland OR",
                timestamp="2026-09-12T11:45:00Z",
                status=MilestoneStatus.IN_PROGRESS,
            ),
            ShipmentMilestone(
                milestone_id="out_for_delivery",
                name="Out for Delivery",
                description="Out for delivery with courier",
                location="Local Delivery Facility, Seattle WA",
                timestamp=None,
                status=MilestoneStatus.PENDING,
            ),
        ]
    elif state_idx == 2:
        # Out for Delivery
        status = "Out for Delivery"
        estimated_delivery = "Today by 8:00 PM"
        current_location = "Local Delivery Vehicle, Seattle WA"
        milestones = [
            ShipmentMilestone(
                milestone_id="order_confirmed",
                name="Order Confirmed",
                description="Order Confirmed & Payment Processed",
                location="Distribution Center, Seattle WA",
                timestamp="2026-09-10T08:30:00Z",
                status=MilestoneStatus.COMPLETED,
            ),
            ShipmentMilestone(
                milestone_id="processing",
                name="Processing",
                description="Packed and labeled at warehouse",
                location="Distribution Center, Seattle WA",
                timestamp="2026-09-10T14:15:00Z",
                status=MilestoneStatus.COMPLETED,
            ),
            ShipmentMilestone(
                milestone_id="carrier_pickup",
                name="Carrier Pickup",
                description="Package picked up by carrier",
                location=carrier_pickup_loc,
                timestamp="2026-09-11T09:00:00Z",
                status=MilestoneStatus.COMPLETED,
            ),
            ShipmentMilestone(
                milestone_id="in_transit",
                name="In Transit",
                description="In transit between sort facilities",
                location="Transit Hub, Portland OR",
                timestamp="2026-09-12T11:45:00Z",
                status=MilestoneStatus.COMPLETED,
            ),
            ShipmentMilestone(
                milestone_id="out_for_delivery",
                name="Out for Delivery",
                description="Out for delivery with courier",
                location="Local Delivery Vehicle, Seattle WA",
                timestamp="2026-09-13T08:15:00Z",
                status=MilestoneStatus.IN_PROGRESS,
            ),
        ]
    else:
        # Delivered
        status = "Delivered"
        estimated_delivery = "Delivered"
        current_location = "Delivered (Front Porch)"
        milestones = [
            ShipmentMilestone(
                milestone_id="order_confirmed",
                name="Order Confirmed",
                description="Order Confirmed & Payment Processed",
                location="Distribution Center, Seattle WA",
                timestamp="2026-09-10T08:30:00Z",
                status=MilestoneStatus.COMPLETED,
            ),
            ShipmentMilestone(
                milestone_id="processing",
                name="Processing",
                description="Packed and labeled at warehouse",
                location="Distribution Center, Seattle WA",
                timestamp="2026-09-10T14:15:00Z",
                status=MilestoneStatus.COMPLETED,
            ),
            ShipmentMilestone(
                milestone_id="carrier_pickup",
                name="Carrier Pickup",
                description="Package picked up by carrier",
                location=carrier_pickup_loc,
                timestamp="2026-09-11T09:00:00Z",
                status=MilestoneStatus.COMPLETED,
            ),
            ShipmentMilestone(
                milestone_id="in_transit",
                name="In Transit",
                description="In transit between sort facilities",
                location="Transit Hub, Portland OR",
                timestamp="2026-09-12T11:45:00Z",
                status=MilestoneStatus.COMPLETED,
            ),
            ShipmentMilestone(
                milestone_id="delivered",
                name="Delivered",
                description="Delivered to front door / porch",
                location="Destination, Seattle WA",
                timestamp="2026-09-13T16:20:00Z",
                status=MilestoneStatus.COMPLETED,
            ),
        ]

    return CarrierTrackingInfo(
        order_id=order_id,
        carrier=carrier,
        tracking_number=tracking_number,
        status=status,
        estimated_delivery=estimated_delivery,
        current_location=current_location,
        service_level=service_level,
        milestones=milestones,
    )


def build_carrier_milestone_prompt(
    tracking_info: Optional[CarrierTrackingInfo], question: str
) -> str:
    """Generates detailed carrier milestone instructions for LLM response generation."""
    if tracking_info:
        active_milestone: Optional[ShipmentMilestone] = None
        for m in tracking_info.milestones:
            if m.status == MilestoneStatus.IN_PROGRESS:
                active_milestone = m
                break
        if not active_milestone and tracking_info.milestones:
            if all(m.status == MilestoneStatus.COMPLETED for m in tracking_info.milestones):
                active_milestone = tracking_info.milestones[-1]
            else:
                for m in tracking_info.milestones:
                    if m.status == MilestoneStatus.PENDING:
                        active_milestone = m
                        break

        active_name = active_milestone.name if active_milestone else "N/A"
        active_desc = active_milestone.description if active_milestone else "N/A"
        active_loc = active_milestone.location if active_milestone else "N/A"

        milestone_lines = []
        for idx, m in enumerate(tracking_info.milestones, 1):
            ts = f" ({m.timestamp})" if m.timestamp else ""
            milestone_lines.append(
                f"  {idx}. [{m.status.value.upper()}] {m.name}: {m.description} - {m.location}{ts}"
            )
        milestones_formatted = "\n".join(milestone_lines)

        return (
            "Carrier Tracking Information:\n"
            f"- Carrier: {tracking_info.carrier}\n"
            f"- Tracking Number: {tracking_info.tracking_number}\n"
            f"- Order ID: {tracking_info.order_id}\n"
            f"- Status: {tracking_info.status}\n"
            f"- Service Level: {tracking_info.service_level}\n"
            f"- Current Location: {tracking_info.current_location}\n"
            f"- Estimated Delivery: {tracking_info.estimated_delivery}\n"
            f"- Active Milestone: {active_name} ({active_desc} at {active_loc})\n"
            f"- Milestone History:\n{milestones_formatted}\n\n"
            "Instructions for Assistant:\n"
            "Incorporate these carrier tracking details into your response. "
            "Clearly report the carrier name, tracking number, current package location, "
            "active shipment milestone, and estimated delivery date to the customer. "
            "Provide a reassuring and helpful update regarding the shipment's progress."
        )

    return (
        "Carrier Tracking Information:\n"
        "No live carrier tracking information was found for the provided identifier.\n\n"
        "Instructions for Assistant:\n"
        "Politely inform the user that live carrier tracking could not be located for that tracking number or order ID. "
        "Recommend verifying the tracking number or contacting customer support for further assistance."
    )
