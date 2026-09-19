import re
import uuid
from typing import Any, Optional

from pydantic import BaseModel


class AlpineHutModel(BaseModel):
    hut_id: str
    name: str
    range_name: str
    elevation_feet: int
    capacity_bunks: int
    price_per_night: float
    difficulty: str  # Moderate, Strenuous, Technical
    amenities: list[str]
    mandatory_gear: list[str]
    description: str


class HutAvailabilityRequest(BaseModel):
    hut_id: Optional[str] = None
    range_name: Optional[str] = None
    nights: int = 1
    guests: int = 1


class HutAvailabilityResponse(BaseModel):
    hut_id: str
    name: str
    range_name: str
    elevation_feet: int
    price_per_night: float
    nights: int = 1
    guests: int = 1
    total_price: float
    available: bool = True
    difficulty: str
    amenities: list[str]
    mandatory_gear: list[str]


class HutBookingRequest(BaseModel):
    hut_id: str
    checkin_date: str
    nights: int
    guests: int
    guest_name: str
    guest_email: str


class HutBookingResponse(BaseModel):
    booking_id: str  # Format: HUT-XXXXX
    hut_id: str
    hut_name: str
    checkin_date: str
    nights: int
    guests: int
    total_price: float
    status: str = "confirmed"
    instructions: str


class HutIntent(BaseModel):
    action: str  # "huts", "quote", "book", "gear", "rules"
    hut_id: Optional[str] = None
    range_name: Optional[str] = None
    nights: Optional[int] = None
    guests: Optional[int] = None
    difficulty: Optional[str] = None


ALPINE_HUTS: dict[str, AlpineHutModel] = {
    "asgard-refuge": AlpineHutModel(
        hut_id="asgard-refuge",
        name="Asgard Pass High Alpine Refuge",
        range_name="cascades",
        elevation_feet=7850,
        capacity_bunks=12,
        price_per_night=45.0,
        difficulty="Strenuous",
        amenities=["Wood Stove", "Solar Lighting", "Composting Toilet", "Snow Melt Cistern"],
        mandatory_gear=["Sleeping Bag Liner", "Headlamp", "Microspikes"],
        description=(
            "A stone-and-timber high alpine refuge perched at Asgard Pass in the Cascades "
            "with breathtaking views of the Enchantments and Stuart Range."
        ),
    ),
    "mueller-ridge": AlpineHutModel(
        hut_id="mueller-ridge",
        name="Mueller Ridge Backcountry Cabin",
        range_name="olympic",
        elevation_feet=5400,
        capacity_bunks=8,
        price_per_night=35.0,
        difficulty="Moderate",
        amenities=["Propane Cooktop", "Rainwater Catchment", "Bear Proof Storage"],
        mandatory_gear=["Sleeping Bag Liner", "Water Filter"],
        description=(
            "A remote cedar cabin nestled along Mueller Ridge in the Olympic Mountains, "
            "surrounded by old-growth subalpine fir."
        ),
    ),
    "cirque-towers": AlpineHutModel(
        hut_id="cirque-towers",
        name="Cirque of the Towers Alpine Shelter",
        range_name="wind_river",
        elevation_feet=10200,
        capacity_bunks=6,
        price_per_night=50.0,
        difficulty="Technical",
        amenities=["Solar Radio Beacon", "Bunk Mats", "First Aid Station"],
        mandatory_gear=["Sleeping Bag Liner", "Helmet", "Satellite Communicator"],
        description=(
            "A rugged alpine weather shelter situated beneath soaring granite spires "
            "in Wyoming's Wind River Range."
        ),
    ),
    "red-mountain-yurt": AlpineHutModel(
        hut_id="red-mountain-yurt",
        name="Red Mountain Backcountry Yurt",
        range_name="san_juan",
        elevation_feet=11200,
        capacity_bunks=10,
        price_per_night=40.0,
        difficulty="Strenuous",
        amenities=["Wood Stove", "Kitchenette", "Fire Pit", "Sauna Tent"],
        mandatory_gear=["Sleeping Bag Liner", "Avalanche Beacon", "Shovel", "Probe"],
        description=(
            "A high-elevation yurt in Colorado's San Juan Mountains offering winter ski touring "
            "and summer alpine hiking."
        ),
    ),
}

HUT_BOOKINGS: list[HutBookingResponse] = []

HUT_TRIGGERS = [
    r"\balpine hut\b",
    r"\balpine huts\b",
    r"\bbackcountry cabin\b",
    r"\bbackcountry cabins\b",
    r"\bmountain shelter\b",
    r"\bmountain shelters\b",
    r"\byurt reservation\b",
    r"\byurt\b",
    r"\byurts\b",
    r"\basgard pass refuge\b",
    r"\basgard refuge\b",
    r"\basgard pass\b",
    r"\bbunk booking\b",
    r"\bbunk bookings\b",
    r"\bbunk availability\b",
    r"\bbunk\b",
    r"\bbunks\b",
    r"\bhut gear\b",
    r"\bhut rules\b",
    r"\bhut\b",
    r"\bhuts\b",
    r"\bremote shelter\b",
    r"\bremote shelters\b",
    r"\balpine refuge\b",
    r"\balpine refuges\b",
    r"\bmountain refuge\b",
    r"\bmountain refuges\b",
    r"\bmueller ridge\b",
    r"\bcirque of the towers\b",
    r"\bcirque shelter\b",
    r"\bred mountain yurt\b",
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
    "nine": 9,
    "ten": 10,
}


def get_alpine_huts(
    range_name: Optional[str] = None,
    difficulty: Optional[str] = None,
) -> list[AlpineHutModel]:
    """Returns alpine huts filtered by range and difficulty."""
    huts = list(ALPINE_HUTS.values())
    if range_name:
        rn_clean = range_name.strip().lower()
        huts = [h for h in huts if h.range_name.lower() == rn_clean]
    if difficulty:
        diff_clean = difficulty.strip().lower()
        huts = [h for h in huts if h.difficulty.lower() == diff_clean]
    return huts


def get_alpine_hut_by_id(hut_id: str) -> Optional[AlpineHutModel]:
    """Looks up an alpine hut by its ID."""
    clean_id = hut_id.strip().lower()
    for hid, hut in ALPINE_HUTS.items():
        if hid.lower() == clean_id:
            return hut
    return None


def calculate_hut_quote(req: HutAvailabilityRequest) -> Optional[HutAvailabilityResponse]:
    """Calculates price quote and returns availability for an alpine hut."""
    target_hut: Optional[AlpineHutModel] = None
    if req.hut_id:
        target_hut = get_alpine_hut_by_id(req.hut_id)
    elif req.range_name:
        matching = get_alpine_huts(range_name=req.range_name)
        if matching:
            target_hut = matching[0]

    if not target_hut:
        return None

    effective_nights = max(1, req.nights)
    effective_guests = max(1, req.guests)
    total_price = round(target_hut.price_per_night * effective_nights * effective_guests, 2)

    return HutAvailabilityResponse(
        hut_id=target_hut.hut_id,
        name=target_hut.name,
        range_name=target_hut.range_name,
        elevation_feet=target_hut.elevation_feet,
        price_per_night=target_hut.price_per_night,
        nights=effective_nights,
        guests=effective_guests,
        total_price=total_price,
        available=True,
        difficulty=target_hut.difficulty,
        amenities=target_hut.amenities,
        mandatory_gear=target_hut.mandatory_gear,
    )


def book_alpine_hut(req: HutBookingRequest) -> HutBookingResponse:
    """Simulates booking bunks in an alpine hut."""
    hut = get_alpine_hut_by_id(req.hut_id)
    if not hut:
        raise ValueError(f"Alpine hut '{req.hut_id}' not found")

    booking_id = f"HUT-{uuid.uuid4().hex[:5].upper()}"
    effective_nights = max(1, req.nights)
    effective_guests = max(1, req.guests)
    total_price = round(hut.price_per_night * effective_nights * effective_guests, 2)

    instructions = (
        f"Reservation confirmed for {req.guest_name} at {hut.name} ({hut.range_name.replace('_', ' ').title()}). "
        f"Check-in date: {req.checkin_date} for {effective_nights} night(s) and {effective_guests} guest(s). "
        f"Door lock code will be sent 24 hours prior. Access directions: Follow the alpine trail from trailhead to {hut.elevation_feet} ft. "
        f"Mandatory safety gear required on arrival: {', '.join(hut.mandatory_gear)}. "
        "All guests must bring an individual sleeping bag liner for bunk hygiene. "
        "Strict Leave-No-Trace rules: pack out all trash and waste."
    )

    response = HutBookingResponse(
        booking_id=booking_id,
        hut_id=hut.hut_id,
        hut_name=hut.name,
        checkin_date=req.checkin_date,
        nights=effective_nights,
        guests=effective_guests,
        total_price=total_price,
        status="confirmed",
        instructions=instructions,
    )
    HUT_BOOKINGS.append(response)
    return response


def detect_hut_intent(query: str) -> Optional[HutIntent]:
    """Detects alpine hut and backcountry shelter inquiries."""
    query_lower = query.lower()
    matched = any(re.search(pat, query_lower) for pat in HUT_TRIGGERS)
    if not matched:
        return None

    # Determine action
    has_book = bool(re.search(r"\b(book|reserve|reservation|booking)\b", query_lower))
    has_quote = bool(re.search(r"\b(quote|cost|price|how much|fare|rates?)\b", query_lower))
    has_gear = bool(re.search(r"\b(gear|equipment|bring|what do i need|mandatory gear|required gear)\b", query_lower))
    has_rules = bool(re.search(r"\b(rule|rules|etiquette|pack it out|pack-it-out|leave no trace|leave-no-trace)\b", query_lower))

    if has_book:
        action = "book"
    elif has_quote:
        action = "quote"
    elif has_gear and not has_rules:
        action = "gear"
    elif has_rules and not has_gear:
        action = "rules"
    elif has_gear and has_rules:
        action = "gear"
    else:
        action = "huts"

    # Extract nights
    nights: Optional[int] = None
    night_match = re.search(r"\b(\d+)\s*(?:night|nights)\b", query_lower)
    if night_match:
        nights = int(night_match.group(1))
    else:
        word_night = re.search(
            r"\b(one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:night|nights)\b",
            query_lower,
        )
        if word_night:
            nights = NUMBER_WORDS.get(word_night.group(1).lower())

    # Extract guests / bunks
    guests: Optional[int] = None
    guest_match = re.search(
        r"\b(\d+)\s*(?:bunk|bunks|guest|guests|person|people|adventurer|adventurers)\b",
        query_lower,
    )
    if guest_match:
        guests = int(guest_match.group(1))
    else:
        word_guest = re.search(
            r"\b(one|two|three|four|five|six|seven|eight|nine|ten)\s*(?:bunk|bunks|guest|guests|person|people|adventurer|adventurers)\b",
            query_lower,
        )
        if word_guest:
            guests = NUMBER_WORDS.get(word_guest.group(1).lower())

    # Extract hut_id and range_name
    hut_id: Optional[str] = None
    range_name: Optional[str] = None

    if re.search(r"\basgard\b", query_lower):
        hut_id = "asgard-refuge"
        range_name = "cascades"
    elif re.search(r"\bmueller\b", query_lower):
        hut_id = "mueller-ridge"
        range_name = "olympic"
    elif re.search(r"\bcirque\b", query_lower):
        hut_id = "cirque-towers"
        range_name = "wind_river"
    elif re.search(r"\bred mountain\b", query_lower):
        hut_id = "red-mountain-yurt"
        range_name = "san_juan"
    elif re.search(r"\bcascades?\b", query_lower):
        range_name = "cascades"
    elif re.search(r"\bolympic\b", query_lower):
        range_name = "olympic"
    elif re.search(r"\bwind river\b", query_lower):
        range_name = "wind_river"
    elif re.search(r"\bsan juan\b", query_lower):
        range_name = "san_juan"

    # Extract difficulty if mentioned
    difficulty: Optional[str] = None
    if re.search(r"\bmoderate\b", query_lower):
        difficulty = "Moderate"
    elif re.search(r"\bstrenuous\b", query_lower):
        difficulty = "Strenuous"
    elif re.search(r"\btechnical\b", query_lower):
        difficulty = "Technical"

    return HutIntent(
        action=action,
        hut_id=hut_id,
        range_name=range_name,
        nights=nights,
        guests=guests,
        difficulty=difficulty,
    )


def build_hut_prompt(intent: HutIntent) -> str:
    """Builds grounding context for backcountry alpine huts, gear requirements, and rules."""
    lines = [
        "Contoso Outdoors Backcountry Alpine Huts & Refuges Grounding:",
        "- Purpose: Provide backcountry alpine shelter logistics, bunk availability, safety gear verification, and Leave-No-Trace hut etiquette.",
        "",
        "Alpine Huts Catalog:",
    ]

    huts = get_alpine_huts(range_name=intent.range_name, difficulty=intent.difficulty)
    if intent.hut_id:
        target = get_alpine_hut_by_id(intent.hut_id)
        if target:
            huts = [target]

    for h in huts:
        lines.append(
            f"- {h.name} (ID: {h.hut_id}, Range: {h.range_name}, Elevation: {h.elevation_feet:,} ft, Difficulty: {h.difficulty}): "
            f"Capacity: {h.capacity_bunks} bunks. Rate: ${h.price_per_night:.2f}/bunk/night. "
            f"Amenities: {', '.join(h.amenities)}. Mandatory Gear: {', '.join(h.mandatory_gear)}. "
            f"Description: {h.description}"
        )

    lines.extend([
        "",
        "Mandatory Gear Requirements:",
        "- Universal Hygiene Requirement: All bunk guests MUST bring an individual Sleeping Bag Liner. Wool blankets are provided at bunks, but direct skin contact with blankets is strictly prohibited for backcountry hygiene.",
        "- Asgard Pass High Alpine Refuge (7,850 ft, Strenuous): Sleeping Bag Liner, Headlamp, Microspikes (steep snow/ice on pass).",
        "- Mueller Ridge Backcountry Cabin (5,400 ft, Moderate): Sleeping Bag Liner, Water Filter.",
        "- Cirque of the Towers Alpine Shelter (10,200 ft, Technical): Sleeping Bag Liner, Climbing Helmet, Satellite Communicator (remote rockfall and weather exposure).",
        "- Red Mountain Backcountry Yurt (11,200 ft, Strenuous): Sleeping Bag Liner, Avalanche Beacon, Shovel, Probe (high-consequence avalanche terrain).",
        "",
        "Hut Rules & Backcountry Etiquette:",
        "1. Pack It Out: Strict pack-it-out leave-no-trace ethics. Pack out all trash, leftover food, containers, and personal waste. No trash disposal facilities exist at high elevations.",
        "2. Sleeping Bag Liners: Mandatory on all bunk mattresses.",
        "3. Water Conservation: Melt cisterns and rainwater catchments are precious shared resources. Treat before drinking.",
        "4. Quiet Hours: 21:00 to 06:00 to ensure rested climbers and mountaineers.",
        "5. Safety & Fire: Composting toilets must be used properly. Open flames forbidden except inside designated stoves.",
    ])

    return "\n".join(lines)


def format_hut_response(intent: HutIntent) -> dict[str, Any]:
    """Generates assistant reply text and structured hut_info metadata."""
    if intent.action == "quote":
        hut_id = intent.hut_id or ("asgard-refuge" if intent.range_name == "cascades" else "asgard-refuge")
        req = HutAvailabilityRequest(
            hut_id=hut_id,
            range_name=intent.range_name,
            nights=intent.nights or 1,
            guests=intent.guests or 1,
        )
        quote = calculate_hut_quote(req)
        if quote:
            answer = (
                f"Alpine Hut Quote for {quote.name} ({quote.elevation_feet:,} ft, {quote.difficulty}): "
                f"{quote.guests} guest(s) for {quote.nights} night(s) at ${quote.price_per_night:.2f}/bunk/night "
                f"is a total of ${quote.total_price:.2f}. "
                f"Amenities: {', '.join(quote.amenities)}. "
                f"Mandatory safety gear required: {', '.join(quote.mandatory_gear)} (plus mandatory sleeping bag liner)."
            )
            return {
                "answer": answer,
                "hut_info": {
                    "action": "quote",
                    "quote": quote.model_dump(),
                },
            }

    if intent.action == "gear":
        hut = get_alpine_hut_by_id(intent.hut_id) if intent.hut_id else None
        if hut:
            answer = (
                f"Mandatory safety gear for {hut.name} ({hut.elevation_feet:,} ft, {hut.difficulty}): "
                f"{', '.join(hut.mandatory_gear)}. "
                "In addition, all guests must bring an individual sleeping bag liner to protect bunk hygiene. "
                "Hut rules require strict pack-it-out leave-no-trace ethics and observance of quiet hours (21:00-06:00)."
            )
            return {
                "answer": answer,
                "hut_info": {
                    "action": "gear",
                    "hut_id": hut.hut_id,
                    "hut_name": hut.name,
                    "mandatory_gear": hut.mandatory_gear,
                    "rules": [
                        "Pack-it-out leave-no-trace ethics",
                        "Mandatory sleeping bag liner for bunks",
                        "Quiet hours 21:00-06:00",
                    ],
                },
            }
        else:
            answer = (
                "Mandatory gear for backcountry alpine huts: All bunks require an individual sleeping bag liner. "
                "High-elevation refuges require specific alpine safety gear such as microspikes (Asgard Pass), "
                "helmet and satellite communicator (Cirque of the Towers), or avalanche beacon, shovel, and probe (Red Mountain Yurt)."
            )
            return {
                "answer": answer,
                "hut_info": {
                    "action": "gear",
                    "mandatory_gear": ["Sleeping Bag Liner", "Headlamp", "Appropriate Alpine Protection"],
                },
            }

    if intent.action == "rules":
        hut = get_alpine_hut_by_id(intent.hut_id) if intent.hut_id else None
        gear_note = f" Mandatory safety gear for {hut.name}: {', '.join(hut.mandatory_gear)}." if hut else ""
        rules_list = [
            "Pack-it-out leave-no-trace ethics (carry out all trash, food scraps, and packaging)",
            f"Mandatory sleeping bag liner for all bunks.{gear_note}",
            "Quiet hours observed from 21:00 to 06:00",
            "Conserve snow melt cistern and rainwater catchment supplies",
            "Use composting toilets properly; no non-biodegradable items",
            "No open flames inside huts except in designated stoves",
        ]
        answer = (
            f"Backcountry Alpine Hut Rules & Leave-No-Trace Etiquette{f' for {hut.name}' if hut else ''}:\n"
            "1. Pack-it-out: Pack out all trash and waste. No trash disposal exists in the alpine zone.\n"
            f"2. Sleeping Bag Liners: Mandatory for all bunk guests for backcountry hygiene.{gear_note}\n"
            "3. Quiet Hours: 21:00 to 06:00 to allow rested starts for mountaineers.\n"
            "4. Water & Stove: Conserve shared cistern water and wood/propane resources.\n"
            "5. Facilities: Use composting toilets properly and leave the hut cleaner than you found it."
        )
        return {
            "answer": answer,
            "hut_info": {
                "action": "rules",
                "rules": rules_list,
            },
        }

    if intent.action == "book":
        hut = get_alpine_hut_by_id(intent.hut_id) if intent.hut_id else None
        guests_count = intent.guests or 1
        nights_count = intent.nights or 1
        hut_name = hut.name if hut else "our backcountry alpine huts"
        price_str = f" (${hut.price_per_night:.2f}/bunk/night)" if hut else ""
        gear_str = f" Mandatory gear: {', '.join(hut.mandatory_gear)}." if hut else ""
        answer = (
            f"To book {guests_count} bunk(s) for {nights_count} night(s) at {hut_name}{price_str}, "
            f"you can confirm your booking via our reservation tooling with your check-in date and contact details.{gear_str} "
            "Remember that sleeping bag liners and pack-it-out etiquette are strictly mandatory."
        )
        return {
            "answer": answer,
            "hut_info": {
                "action": "book",
                "hut_id": hut.hut_id if hut else None,
                "hut_name": hut.name if hut else None,
                "guests": guests_count,
                "nights": nights_count,
            },
        }

    # Default action: "huts"
    huts = get_alpine_huts(range_name=intent.range_name, difficulty=intent.difficulty)
    if intent.hut_id:
        target = get_alpine_hut_by_id(intent.hut_id)
        if target:
            huts = [target]

    huts_dump = [h.model_dump() for h in huts]
    huts_summary = "; ".join(
        [
            f"{h.name} ({h.elevation_feet:,} ft, {h.difficulty}, ${h.price_per_night:.2f}/night, gear: {', '.join(h.mandatory_gear)})"
            for h in huts
        ]
    )
    answer = (
        f"Contoso Outdoors manages remote backcountry alpine huts and mountain shelters: {huts_summary}. "
        "All stays require an individual sleeping bag liner and strict adherence to pack-it-out leave-no-trace ethics."
    )
    return {
        "answer": answer,
        "hut_info": {
            "action": "huts",
            "range_name": intent.range_name,
            "difficulty": intent.difficulty,
            "huts": huts_dump,
        },
    }
