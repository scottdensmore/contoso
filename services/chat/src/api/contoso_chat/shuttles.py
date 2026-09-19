import re
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from pydantic import BaseModel


class ShuttleRouteModel(BaseModel):
    route_id: str
    name: str
    region: str
    origin: str
    destination: str
    duration_minutes: int
    price_per_seat: float
    departure_times: list[str]
    is_connector: bool
    parking_permit_required: bool
    parking_advice: str


class ShuttleQuoteRequest(BaseModel):
    route_id: Optional[str] = None
    region: Optional[str] = None
    seats: int = 1


class ShuttleQuoteResponse(BaseModel):
    route_id: str
    route_name: str
    origin: str
    destination: str
    seats: int
    price_per_seat: float
    total_price: float
    duration_minutes: int
    departure_times: list[str]
    parking_advice: str


class ShuttleBookingRequest(BaseModel):
    route_id: str
    departure_date: str
    departure_time: str
    seats: int
    passenger_name: str
    passenger_email: str


class ShuttleBookingResponse(BaseModel):
    booking_id: str  # Format: SHT-XXXXX
    route_id: str
    route_name: str
    departure_date: str
    departure_time: str
    seats: int
    total_price: float
    status: str = "confirmed"
    instructions: str


class CarpoolOfferRequest(BaseModel):
    origin_city: str
    destination_trailhead: str
    departure_date: str
    seats_available: int
    driver_name: str
    contact_info: str
    notes: Optional[str] = None


class CarpoolOfferResponse(BaseModel):
    carpool_id: str  # Format: CPL-XXXXX
    origin_city: str
    destination_trailhead: str
    departure_date: str
    seats_available: int
    driver_name: str
    contact_info: str
    notes: Optional[str] = None
    created_at: str


class ShuttleIntent(BaseModel):
    action: str  # "routes", "quote", "book", "carpool", "schedule"
    route_id: Optional[str] = None
    region: Optional[str] = None
    seats: Optional[int] = None
    trailhead: Optional[str] = None
    departure_date: Optional[str] = None


SHUTTLE_ROUTES: dict[str, ShuttleRouteModel] = {
    "enchantments-connector": ShuttleRouteModel(
        route_id="enchantments-connector",
        name="Enchantments Through-Hike Connector",
        region="cascades",
        origin="Snow Lakes Trailhead",
        destination="Stuart/Colchuck Trailhead",
        duration_minutes=35,
        price_per_seat=30.0,
        departure_times=["05:30", "06:30", "07:30", "09:00"],
        is_connector=True,
        parking_permit_required=True,
        parking_advice=(
            "Northwest Forest Pass or America the Beautiful Pass required to park at Snow Lakes Trailhead. "
            "Park your vehicle at the Snow Lakes Trailhead exit and take the early morning shuttle to Stuart/Colchuck "
            "Trailhead so you can hike straight through back to your car without leaving two vehicles."
        ),
    ),
    "rainier-express": ShuttleRouteModel(
        route_id="rainier-express",
        name="Mount Rainier Skyline & Paradise Shuttle",
        region="rainier",
        origin="Ashford Gateway",
        destination="Paradise Visitor Center",
        duration_minutes=45,
        price_per_seat=25.0,
        departure_times=["07:00", "08:30", "10:00", "13:00"],
        is_connector=False,
        parking_permit_required=True,
        parking_advice=(
            "National Park entrance pass required. Riding the Ashford shuttle bypasses the summer timed-entry "
            "vehicle reservations required for private cars in the Paradise corridor."
        ),
    ),
    "olympic-coast": ShuttleRouteModel(
        route_id="olympic-coast",
        name="Olympic Coast Wilderness Transit",
        region="olympic",
        origin="Forks Transit Center",
        destination="Rialto Beach & Ozette",
        duration_minutes=55,
        price_per_seat=35.0,
        departure_times=["08:00", "11:00", "15:00"],
        is_connector=True,
        parking_permit_required=True,
        parking_advice=(
            "Olympic National Park pass required for trailhead parking. Park at Forks Transit Center for free "
            "long-term parking without a separate parking permit."
        ),
    ),
    "rockies-loop": ShuttleRouteModel(
        route_id="rockies-loop",
        name="Colorado Continental Divide Shuttle",
        region="rockies",
        origin="Estes Park",
        destination="Bear Lake Trailhead",
        duration_minutes=30,
        price_per_seat=20.0,
        departure_times=["06:00", "07:30", "09:00", "14:00"],
        is_connector=False,
        parking_permit_required=True,
        parking_advice=(
            "Rocky Mountain National Park pass required. Taking the Estes Park shuttle avoids Bear Lake Road "
            "timed-entry vehicle reservation requirements."
        ),
    ),
}

CARPOOL_OFFERS: list[CarpoolOfferResponse] = [
    CarpoolOfferResponse(
        carpool_id="CPL-10001",
        origin_city="Seattle",
        destination_trailhead="Mount Rainier - Paradise",
        departure_date="2026-10-03",
        seats_available=2,
        driver_name="Sarah M.",
        contact_info="sarah.m@example.com",
        notes="Leaving from Green Lake Park & Ride at 6:00 AM. Splitting gas and park entry fee.",
        created_at="2026-09-18T10:00:00Z",
    ),
    CarpoolOfferResponse(
        carpool_id="CPL-10002",
        origin_city="Bellevue",
        destination_trailhead="Stuart Lake Trailhead (Enchantments)",
        departure_date="2026-10-10",
        seats_available=3,
        driver_name="Dave K.",
        contact_info="dave.k@example.com",
        notes="Early start for Colchuck Lake day hike. Have Northwest Forest Pass.",
        created_at="2026-09-18T11:30:00Z",
    ),
    CarpoolOfferResponse(
        carpool_id="CPL-10003",
        origin_city="Denver",
        destination_trailhead="Bear Lake Trailhead (RMNP)",
        departure_date="2026-10-15",
        seats_available=2,
        driver_name="Alex R.",
        contact_info="alex.r@example.com",
        notes="Heading out for sunrise photography. Meet at Boulder Park-n-Ride.",
        created_at="2026-09-19T07:15:00Z",
    ),
]


def get_shuttle_routes(
    region: Optional[str] = None,
    connector_only: bool = False,
) -> list[ShuttleRouteModel]:
    """Returns shuttle routes filtered by region and connector status."""
    routes = list(SHUTTLE_ROUTES.values())
    if region:
        reg_clean = region.strip().lower()
        routes = [r for r in routes if r.region.lower() == reg_clean]
    if connector_only:
        routes = [r for r in routes if r.is_connector]
    return routes


def get_shuttle_route_by_id(route_id: str) -> Optional[ShuttleRouteModel]:
    """Looks up a shuttle route by its ID."""
    clean_id = route_id.strip().lower()
    for rid, route in SHUTTLE_ROUTES.items():
        if rid.lower() == clean_id:
            return route
    return None


def calculate_shuttle_quote(route_id: str, seats: int = 1) -> Optional[ShuttleQuoteResponse]:
    """Calculates price quote and returns departure schedules for a route."""
    route = get_shuttle_route_by_id(route_id)
    if not route:
        return None
    effective_seats = max(1, seats)
    total_price = round(route.price_per_seat * effective_seats, 2)
    return ShuttleQuoteResponse(
        route_id=route.route_id,
        route_name=route.name,
        origin=route.origin,
        destination=route.destination,
        seats=effective_seats,
        price_per_seat=route.price_per_seat,
        total_price=total_price,
        duration_minutes=route.duration_minutes,
        departure_times=route.departure_times,
        parking_advice=route.parking_advice,
    )


def book_shuttle(req: ShuttleBookingRequest) -> ShuttleBookingResponse:
    """Simulates booking seats on a shuttle route."""
    route = get_shuttle_route_by_id(req.route_id)
    if not route:
        raise ValueError(f"Route '{req.route_id}' not found")
    booking_id = f"SHT-{uuid.uuid4().hex[:5].upper()}"
    total_price = round(route.price_per_seat * max(1, req.seats), 2)
    instructions = (
        f"Please arrive at {route.origin} at least 15 minutes prior to your {req.departure_time} departure. "
        f"Show booking confirmation #{booking_id} to the shuttle driver. "
        f"Parking advice: {route.parking_advice}"
    )
    return ShuttleBookingResponse(
        booking_id=booking_id,
        route_id=route.route_id,
        route_name=route.name,
        departure_date=req.departure_date,
        departure_time=req.departure_time,
        seats=req.seats,
        total_price=total_price,
        status="confirmed",
        instructions=instructions,
    )


def list_carpools(destination: Optional[str] = None) -> list[CarpoolOfferResponse]:
    """Lists carpool offers, optionally filtered by destination trailhead."""
    if not destination:
        return list(CARPOOL_OFFERS)
    dest_clean = destination.strip().lower()
    return [c for c in CARPOOL_OFFERS if dest_clean in c.destination_trailhead.lower()]


def create_carpool_offer(req: CarpoolOfferRequest) -> CarpoolOfferResponse:
    """Registers a new community carpool offer."""
    carpool_id = f"CPL-{uuid.uuid4().hex[:5].upper()}"
    created_at = datetime.now(timezone.utc).isoformat()
    offer = CarpoolOfferResponse(
        carpool_id=carpool_id,
        origin_city=req.origin_city,
        destination_trailhead=req.destination_trailhead,
        departure_date=req.departure_date,
        seats_available=req.seats_available,
        driver_name=req.driver_name,
        contact_info=req.contact_info,
        notes=req.notes,
        created_at=created_at,
    )
    CARPOOL_OFFERS.append(offer)
    return offer


SHUTTLE_TRIGGERS = [
    r"\bshuttle\b",
    r"\bshuttles\b",
    r"\btrailhead transit\b",
    r"\bcarpool\b",
    r"\bcarpools\b",
    r"\bcarpooling\b",
    r"\brideshare\b",
    r"\brideshares\b",
    r"\bride share\b",
    r"\benchantments connector\b",
    r"\bride to trailhead\b",
    r"\btwo cars\b",
    r"\bpoint-to-point hike transit\b",
    r"\bthrough-hike connector\b",
    r"\bconnector shuttle\b",
    r"\btransit to trailhead\b",
]

NUMBER_WORDS = {
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
}


def detect_shuttle_intent(query: str) -> Optional[ShuttleIntent]:
    """Detects shuttle and carpool inquiries, extracting intent action and details."""
    query_lower = query.lower()
    matched_trigger = any(re.search(pat, query_lower) for pat in SHUTTLE_TRIGGERS)
    if not matched_trigger:
        return None

    # Determine action
    action = "routes"
    if re.search(r"\b(carpool|carpools|carpooling|rideshare|rideshares|ride share|share a ride)\b", query_lower):
        action = "carpool"
    elif re.search(r"\b(book|reserve|reservation|ticket|tickets)\b", query_lower):
        action = "book"
    elif re.search(r"\b(quote|cost|price|fare|how much|seats? quote)\b", query_lower) and not re.search(r"\b(what time|schedule|departure|when does|leave|leaves)\b", query_lower):
        action = "quote"
    elif re.search(r"\b(schedule|timetable|departure|departures|what time|when does|leave|leaves)\b", query_lower):
        action = "schedule"

    # Extract seats
    seats: Optional[int] = None
    seat_match = re.search(r"\b(\d+)\s*(?:seat|seats|passenger|passengers|person|people|ticket|tickets)\b", query_lower)
    if seat_match:
        seats = int(seat_match.group(1))
    else:
        word_seat_match = re.search(
            r"\b(one|two|three|four|five|six|seven|eight)\s*(?:seat|seats|passenger|passengers|person|people|ticket|tickets)\b",
            query_lower,
        )
        if word_seat_match:
            seats = NUMBER_WORDS.get(word_seat_match.group(1).lower())

    # Extract route and region
    route_id: Optional[str] = None
    region: Optional[str] = None
    trailhead: Optional[str] = None

    if re.search(r"\b(enchantment|enchantments|colchuck|stuart|snow lakes?)\b", query_lower):
        route_id = "enchantments-connector"
        region = "cascades"
        trailhead = "Snow Lakes Trailhead"
    elif re.search(r"\b(rainier|paradise|skyline|ashford)\b", query_lower):
        route_id = "rainier-express"
        region = "rainier"
        trailhead = "Mount Rainier - Paradise"
    elif re.search(r"\b(olympic|rialto|ozette|forks)\b", query_lower):
        route_id = "olympic-coast"
        region = "olympic"
        trailhead = "Rialto Beach & Ozette"
    elif re.search(r"\b(rockies|rocky mountain|bear lake|estes park|divide)\b", query_lower):
        route_id = "rockies-loop"
        region = "rockies"
        trailhead = "Bear Lake Trailhead"
    elif re.search(r"\bcascades?\b", query_lower):
        region = "cascades"

    # Extract departure date if present
    date_match = re.search(r"\b(\d{4}-\d{2}-\d{2})\b", query)
    departure_date = date_match.group(1) if date_match else None

    return ShuttleIntent(
        action=action,
        route_id=route_id,
        region=region,
        seats=seats,
        trailhead=trailhead,
        departure_date=departure_date,
    )


def build_shuttle_prompt(intent: ShuttleIntent) -> str:
    """Builds grounding context for the assistant with route schedules, fares, and parking tips."""
    lines = [
        "Contoso Outdoors Trailhead Shuttle & Rideshare Grounding:",
        "- Purpose: Connect hikers to remote trailheads and through-hikes without requiring two vehicles or risking limited trailhead parking.",
        "",
        "Available Shuttle Routes:",
    ]

    routes = get_shuttle_routes(region=intent.region)
    if intent.route_id:
        target_route = get_shuttle_route_by_id(intent.route_id)
        if target_route:
            routes = [target_route]

    for r in routes:
        connector_tag = " [Through-Hike Connector]" if r.is_connector else ""
        lines.append(
            f"- {r.name}{connector_tag} (ID: {r.route_id}, Region: {r.region}): "
            f"{r.origin} -> {r.destination}. Duration: {r.duration_minutes} min. "
            f"Fare: ${r.price_per_seat:.2f}/seat. Departures: {', '.join(r.departure_times)}. "
            f"Parking Advice: {r.parking_advice}"
        )

    lines.append("")
    lines.append("Community Carpool Rideshare Tooling:")
    lines.append(
        "- Adventurers can view community carpool listings or post their own offers to split gas and park entry fees."
    )
    relevant_carpools = list_carpools(destination=intent.trailhead)
    if relevant_carpools:
        lines.append("Current Carpool Offers:")
        for c in relevant_carpools[:3]:
            lines.append(
                f"- [{c.carpool_id}] {c.origin_city} to {c.destination_trailhead} on {c.departure_date} "
                f"({c.seats_available} seats open, Driver: {c.driver_name}, Contact: {c.contact_info}). Notes: {c.notes or 'None'}"
            )

    lines.append("")
    lines.append(
        "Guidance: Provide exact route details, departure times, per-seat pricing, and parking permit advice. "
        "Recommend leaving one car at the through-hike terminus (e.g. Snow Lakes) and shuttling to the start (Stuart/Colchuck)."
    )

    return "\n".join(lines)


def format_shuttle_response(intent: ShuttleIntent) -> dict[str, Any]:
    """Generates text reply and structured shuttle_info metadata."""
    if intent.action == "quote":
        effective_seats = intent.seats or 1
        route_id = intent.route_id or "enchantments-connector"
        quote = calculate_shuttle_quote(route_id, seats=effective_seats)
        if quote:
            answer = (
                f"Shuttle Quote for {quote.route_name}: {quote.seats} seat(s) at ${quote.price_per_seat:.2f}/seat "
                f"is ${quote.total_price:.2f}. Departures from {quote.origin} are scheduled at {', '.join(quote.departure_times)}. "
                f"Parking tip: {quote.parking_advice}"
            )
            return {
                "answer": answer,
                "shuttle_info": {
                    "action": "quote",
                    "quote": quote.model_dump(),
                },
            }

    if intent.action == "carpool":
        carpools = list_carpools(destination=intent.trailhead)
        carpools_dump = [c.model_dump() for c in carpools]
        if carpools:
            carpool_summaries = "; ".join(
                [f"{c.origin_city} to {c.destination_trailhead} ({c.departure_date}, {c.seats_available} seats)" for c in carpools[:2]]
            )
            answer = (
                f"We found {len(carpools)} community carpool offer(s) matching your destination: {carpool_summaries}. "
                "You can also register your own carpool offer via our rideshare coordination tooling."
            )
        else:
            answer = (
                "There are currently no community carpool offers posted for this specific destination. "
                "You can post a new carpool offer to find trail companions and share transportation."
            )
        return {
            "answer": answer,
            "shuttle_info": {
                "action": "carpool",
                "destination": intent.trailhead,
                "carpools": carpools_dump,
            },
        }

    if intent.action == "schedule":
        route_id = intent.route_id or "rainier-express"
        route = get_shuttle_route_by_id(route_id)
        if route:
            answer = (
                f"The departure times for {route.name} from {route.origin} to {route.destination} "
                f"are: {', '.join(route.departure_times)}. Trip duration is approximately {route.duration_minutes} minutes. "
                f"Fare is ${route.price_per_seat:.2f} per seat."
            )
            return {
                "answer": answer,
                "shuttle_info": {
                    "action": "schedule",
                    "route": route.model_dump(),
                },
            }

    # Default action: "routes"
    routes = get_shuttle_routes(region=intent.region)
    if intent.route_id:
        target = get_shuttle_route_by_id(intent.route_id)
        if target:
            routes = [target]
    routes_dump = [r.model_dump() for r in routes]
    route_names = ", ".join([r.name for r in routes])
    answer = (
        f"Contoso Outdoors Trailhead Shuttle Service offers scheduled routes including: {route_names}. "
        "For through-hikes like the Enchantments, park at the exit trailhead (Snow Lakes) and take our connector shuttle "
        "to the entry trailhead (Stuart Lake) to hike back to your vehicle without needing two cars."
    )
    return {
        "answer": answer,
        "shuttle_info": {
            "action": "routes",
            "region": intent.region,
            "routes": routes_dump,
        },
    }
