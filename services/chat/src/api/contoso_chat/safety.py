import re
import secrets
from datetime import datetime, timezone
from typing import Any, Optional

from pydantic import BaseModel


class BeaconDevice(BaseModel):
    device_id: str
    device_type: str  # garmin_inreach, zoleo, spot, bivy_stick, apple_satellite
    imei: str
    owner_name: str
    emergency_contact: str
    emergency_phone: str
    trip_zone: str
    return_date: Optional[str] = None
    status: str = "ACTIVE_MONITORING"
    last_checkin: Optional[str] = None


class BeaconRegistrationRequest(BaseModel):
    device_type: str
    imei: str
    owner_name: str
    emergency_contact: str
    emergency_phone: str
    trip_zone: str
    return_date: Optional[str] = None


class BeaconRegistrationResponse(BaseModel):
    device_id: str
    device_type: str
    imei: str
    owner_name: str
    trip_zone: str
    status: str
    registered_at: str
    instructions: str


class BeaconCheckinRequest(BaseModel):
    device_id: str
    status_message: str = "OK"
    coordinates: Optional[str] = None


class BeaconCheckinResponse(BaseModel):
    device_id: str
    status: str
    timestamp: str
    message: str


class EmergencyProtocol(BaseModel):
    incident_type: str  # hypothermia, wildlife, lightning, altitude, injury
    title: str
    severity: str  # CRITICAL, URGENT, MONITOR
    first_response_steps: list[str]
    sar_signaling_instructions: list[str]
    precautions: list[str]


class AvalancheAdvisory(BaseModel):
    zone: str
    zone_name: str
    danger_rating: str  # Low, Moderate, Considerable, High, Extreme
    elevation_band: str
    primary_hazard: str
    summary: str
    recommended_actions: list[str]


class SafetyIntent(BaseModel):
    action: str  # "register_beacon", "checkin_beacon", "emergency_protocol", "avalanche_advisory", "sar_procedure"
    device_type: Optional[str] = None
    imei: Optional[str] = None
    incident_type: Optional[str] = None
    zone: Optional[str] = None
    device_id: Optional[str] = None


AVALANCHE_ADVISORIES: dict[str, AvalancheAdvisory] = {
    "cascades": AvalancheAdvisory(
        zone="cascades",
        zone_name="Washington Cascades (Stevens Pass, Snoqualmie, Rainier)",
        danger_rating="Considerable",
        elevation_band="Above Treeline (5,000+ ft)",
        primary_hazard="Wind Slab & Persistent Weak Layer",
        summary="Recent heavy snowfall combined with gusty westerly winds has loaded leeward slopes above treeline. A buried layer of surface hoar from last week remains reactive to human triggers on north through east aspects.",
        recommended_actions=[
            "Carefully evaluate snowpack and terrain before committing to steep slopes",
            "Identify and avoid wind-loaded convex rollovers above 5,000 feet",
            "Carry avalanche transceiver, probe, and shovel; ensure all party members have companion rescue practice",
            "Travel one at a time across exposed avalanche paths",
        ],
    ),
    "rockies": AvalancheAdvisory(
        zone="rockies",
        zone_name="Colorado Central & Northern Rockies",
        danger_rating="High",
        elevation_band="All Elevations",
        primary_hazard="Deep Persistent Slab",
        summary="Dangerous avalanche conditions exist across all elevations. A weak basal facet layer is stressed by recent heavy slab loads. Very large, destructive human-triggered and natural avalanches are likely.",
        recommended_actions=[
            "Avoid all avalanche terrain and slope angles steeper than 30 degrees",
            "Stay out from underneath large runout zones and avalanche paths",
            "Stick to low-angle ridge lines and sheltered valley floors away from steep overhead hazards",
            "Ensure satellite communication beacon is active and check in before travel",
        ],
    ),
    "sierra": AvalancheAdvisory(
        zone="sierra",
        zone_name="Sierra Nevada & Lake Tahoe",
        danger_rating="Moderate",
        elevation_band="Near & Above Treeline",
        primary_hazard="Wet Loose & Cornice Fall",
        summary="Solar radiation and unseasonably warm daytime temperatures will promote wet loose sluffs on sunny aspects by midday. Overhanging ridge cornices are fragile and prone to collapse.",
        recommended_actions=[
            "Plan early morning ascents and exit solar slopes before snow becomes wet and unsupportable",
            "Stay well back from corniced ridgelines",
            "Watch for rollerballs and pinwheels as early warning signs of wet slab activity",
            "Wear helmets and carry avalanche rescue gear",
        ],
    ),
    "wasatch": AvalancheAdvisory(
        zone="wasatch",
        zone_name="Utah Wasatch Range",
        danger_rating="Considerable",
        elevation_band="Above 8,000 ft",
        primary_hazard="Wind Drifted Snow",
        summary="Strong ridge-top winds have created dense wind slabs on upper elevation north- and east-facing terrain above 8,000 ft. Triggering an avalanche is likely on steep open slopes.",
        recommended_actions=[
            "Avoid steep, wind-pillowed leeward slopes and cross-loaded gullies",
            "Perform quick hand pits and pole tests to check for cohesive slab bonding",
            "Maintain wide spacing between group members",
            "Check current UDOT and Utah Avalanche Center updates",
        ],
    ),
    "tetons": AvalancheAdvisory(
        zone="tetons",
        zone_name="Grand Teton & Jackson Hole",
        danger_rating="Moderate",
        elevation_band="Mid & High Elevation",
        primary_hazard="Wind Slab",
        summary="Isolated wind slabs remain reactive on steep alpine faces and couloirs. Low-density snow beneath moderate crusts requires cautious route selection in alpine terrain.",
        recommended_actions=[
            "Assess local wind effect and avoid isolated areas of wind-stiffened snow",
            "Use caution around terrain traps like gullies, creek beds, and cliff drops",
            "Carry satellite SOS device and avalanche rescue beacon, probe, shovel",
            "Practice buddy checks and beacon function checks at trailhead",
        ],
    ),
}


EMERGENCY_PROTOCOLS: dict[str, EmergencyProtocol] = {
    "hypothermia": EmergencyProtocol(
        incident_type="hypothermia",
        title="Hypothermia & Cold Exposure",
        severity="CRITICAL",
        first_response_steps=[
            "Dry clothing immediately",
            "Wrap in sleeping bag & vapor barrier",
            "Administer warm sweetened liquids if conscious",
            "Do NOT rub frostbitten skin or apply direct intense heat",
        ],
        sar_signaling_instructions=[
            "Trigger satellite SOS beacon if core temperature continues to drop or patient exhibits altered mental status",
            "Signal emergency aircraft using 3 audible whistle blasts or high-visibility orange ground marker",
            "Transmit GPS coordinates and patient vital signs to Search and Rescue dispatch via 2-way satellite messaging",
        ],
        precautions=[
            "Prevent further conductive and convective heat loss using an insulated ground pad and windbreak",
            "Handle the patient gently to prevent ventricular fibrillation and cardiac arrhythmias",
            "Never give alcohol, caffeine, or sedatives to a hypothermia patient",
        ],
    ),
    "wildlife": EmergencyProtocol(
        incident_type="wildlife",
        title="Bear & Apex Predator Encounter",
        severity="URGENT",
        first_response_steps=[
            "Do NOT run",
            "Stand ground and make calm low voice",
            "Deploy bear spray at 30-40 feet",
            "Group together to appear larger",
        ],
        sar_signaling_instructions=[
            "Trigger satellite SOS beacon immediately if a predatory attack occurs or serious lacerations/bites are sustained",
            "Activate emergency beacon tracking mode if actively pursued or surrounded by predators in remote terrain",
            "Relay predator species, aggressive behaviors, and exact terrain coordinates to wildlife emergency responders",
        ],
        precautions=[
            "Never climb a tree to escape a grizzly or brown bear",
            "Store all food, scented toiletries, and cookware in certified bear canisters 100 yards downwind from camp",
            "Always carry bear spray in an immediate quick-draw holster, never packed inside your backpack",
        ],
    ),
    "lightning": EmergencyProtocol(
        incident_type="lightning",
        title="High-Ridge Lightning Storm",
        severity="CRITICAL",
        first_response_steps=[
            "Descend ridgelines immediately below treeline",
            "Avoid isolated tall trees and rock overhangs",
            "Assume lightning crouch on insulated foam pad",
            "Spread party members 20-30 feet apart",
        ],
        sar_signaling_instructions=[
            "Trigger satellite SOS beacon immediately if any party member is struck by lightning",
            "Begin CPR immediately if breathing or pulse has stopped (lightning strike victims do NOT hold an electrical charge)",
            "Message rescue dispatch with casualty counts, burn severity, and neurological trauma symptoms",
        ],
        precautions=[
            "Descend from exposed summits and high passes before noon when convective storm clouds begin developing",
            "Discard external metal frame packs and metal trekking poles away from your crouch site if hair stands on end",
            "Avoid shallow caves, dripping rock walls, and wet crevices which conduct electrical ground currents",
        ],
    ),
    "altitude": EmergencyProtocol(
        incident_type="altitude",
        title="Acute Mountain Sickness (AMS)",
        severity="URGENT",
        first_response_steps=[
            "Descend 1,500 to 2,000 feet immediately",
            "Cease all ascent until symptoms fully resolve",
            "Rest and hydrate with electrolyte balance",
            "Never leave symptomatic individual unattended",
        ],
        sar_signaling_instructions=[
            "Trigger satellite SOS beacon if symptoms progress to HAPE (persistent cough, pink frothy sputum, gurgling rales) or HACE (ataxia, severe confusion)",
            "Request emergency helicopter medevac if descent route is blocked by technical alpine terrain or avalanche hazards",
            "Provide dispatch with altitude profile, rate of descent, and patient oxygen saturation if pulse oximeter available",
        ],
        precautions=[
            "Adhere to the 'climb high, sleep low' acclimatization principle (no more than 1,000-1,500 ft elevation gain per night above 8,000 ft)",
            "Avoid sedatives, alcohol, and excessive physical exhaustion during early acclimatization days",
            "Monitor companions continuously for coordination changes, irrational behavior, or lethargy",
        ],
    ),
    "injury": EmergencyProtocol(
        incident_type="injury",
        title="Backcountry Fracture or Dislocation",
        severity="CRITICAL",
        first_response_steps=[
            "Immobilize and splint with trekking poles and foam padding",
            "Check distal pulses and sensation",
            "Elevate injured limb if possible",
            "Trigger satellite SOS beacon if non-ambulatory",
        ],
        sar_signaling_instructions=[
            "Activate SOS beacon on Garmin inReach, Zoleo, or SPOT with medical priority tag",
            "Clear a 50x50 foot flat, unobstructed landing zone for SAR helicopter evacuation",
            "Signal approaching rescue teams with high-visibility orange signal sheet or mirror flashes",
        ],
        precautions=[
            "Do not attempt to reduce open compound fractures in backcountry conditions without wilderness medicine certification",
            "Recheck distal pulse, motor function, and sensation every 15 minutes after applying a splint",
            "Protect immobilized patients from environmental hypothermia during extended rescue wait periods",
        ],
    ),
}

# In-memory store
BEACON_STORE: dict[str, BeaconDevice] = {}


def register_safety_beacon(req: BeaconRegistrationRequest) -> BeaconRegistrationResponse:
    """Registers a wilderness satellite beacon in the in-memory store."""
    code = secrets.token_hex(3).upper()[:5]
    device_id = f"SBR-{code}"
    now_iso = datetime.now(timezone.utc).isoformat()

    device = BeaconDevice(
        device_id=device_id,
        device_type=req.device_type,
        imei=req.imei,
        owner_name=req.owner_name,
        emergency_contact=req.emergency_contact,
        emergency_phone=req.emergency_phone,
        trip_zone=req.trip_zone,
        return_date=req.return_date,
        status="ACTIVE_MONITORING",
        last_checkin=None,
    )
    BEACON_STORE[device_id] = device

    instructions = (
        f"Beacon {device_id} registered successfully for {req.trip_zone}. "
        "Maintain battery power, send a check-in ping upon departure, and trigger hardware SOS for immediate emergency response."
    )
    return BeaconRegistrationResponse(
        device_id=device_id,
        device_type=req.device_type,
        imei=req.imei,
        owner_name=req.owner_name,
        trip_zone=req.trip_zone,
        status="ACTIVE_MONITORING",
        registered_at=now_iso,
        instructions=instructions,
    )


def record_beacon_checkin(req: BeaconCheckinRequest) -> BeaconCheckinResponse:
    """Records a status check-in ping for an existing registered beacon."""
    device = BEACON_STORE.get(req.device_id)
    if not device:
        raise KeyError(f"Beacon device '{req.device_id}' not found in registry")

    now_iso = datetime.now(timezone.utc).isoformat()
    device.last_checkin = now_iso

    message = (
        f"Check-in recorded for device {req.device_id} in {device.trip_zone}. "
        f"Status: {req.status_message}. Coordinates: {req.coordinates or 'Not provided'}."
    )
    return BeaconCheckinResponse(
        device_id=req.device_id,
        status="CHECKIN_CONFIRMED",
        timestamp=now_iso,
        message=message,
    )


def get_beacon(device_id: str) -> Optional[BeaconDevice]:
    """Retrieves a registered beacon device from the in-memory store."""
    return BEACON_STORE.get(device_id)


def get_avalanche_advisory(zone: str) -> Optional[AvalancheAdvisory]:
    """Retrieves an avalanche advisory by zone key or region alias."""
    if not zone:
        return None
    zone_clean = zone.strip().lower()
    if zone_clean in AVALANCHE_ADVISORIES:
        return AVALANCHE_ADVISORIES[zone_clean]

    # Check aliases and substrings
    for key, advisory in AVALANCHE_ADVISORIES.items():
        if (
            key in zone_clean
            or zone_clean in advisory.zone_name.lower()
            or (key == "cascades" and any(p in zone_clean for p in ["cascade", "rainier", "stevens", "snoqualmie"]))
            or (key == "rockies" and any(p in zone_clean for p in ["rocky", "colorado"]))
            or (key == "sierra" and any(p in zone_clean for p in ["tahoe", "nevada"]))
            or (key == "wasatch" and any(p in zone_clean for p in ["utah"]))
            or (key == "tetons" and any(p in zone_clean for p in ["teton", "jackson"]))
        ):
            return advisory
    return None


def list_avalanche_advisories() -> list[AvalancheAdvisory]:
    """Lists all regional avalanche advisories."""
    return list(AVALANCHE_ADVISORIES.values())


PROTOCOL_ALIASES: dict[str, str] = {
    "hypothermia": "hypothermia",
    "cold": "hypothermia",
    "frostbite": "hypothermia",
    "wildlife": "wildlife",
    "bear": "wildlife",
    "predator": "wildlife",
    "cougar": "wildlife",
    "lightning": "lightning",
    "storm": "lightning",
    "thunderstorm": "lightning",
    "altitude": "altitude",
    "ams": "altitude",
    "mountain sickness": "altitude",
    "altitude sickness": "altitude",
    "hape": "altitude",
    "hace": "altitude",
    "injury": "injury",
    "fracture": "injury",
    "dislocation": "injury",
    "broken bone": "injury",
    "splint": "injury",
}


def get_emergency_protocol(incident_type: str) -> Optional[EmergencyProtocol]:
    """Retrieves an emergency protocol by incident type or common alias."""
    if not incident_type:
        return None
    inc_clean = incident_type.strip().lower()
    if inc_clean in EMERGENCY_PROTOCOLS:
        return EMERGENCY_PROTOCOLS[inc_clean]

    target = PROTOCOL_ALIASES.get(inc_clean)
    if target and target in EMERGENCY_PROTOCOLS:
        return EMERGENCY_PROTOCOLS[target]

    for key, protocol in EMERGENCY_PROTOCOLS.items():
        if key in inc_clean or inc_clean in protocol.title.lower():
            return protocol
    return None


def list_emergency_protocols() -> list[EmergencyProtocol]:
    """Lists all emergency protocols."""
    return list(EMERGENCY_PROTOCOLS.values())


def detect_safety_intent(query: str) -> Optional[SafetyIntent]:
    """Detects safety inquiry, beacon registration/check-in, emergency protocol, or avalanche advisory."""
    if not query:
        return None
    q = query.lower()

    # Safety-related keywords
    keywords = [
        "satellite beacon",
        "beacon",
        "inreach",
        "zoleo",
        "spot",
        "bivy stick",
        "apple satellite",
        "sos",
        "sar",
        "search and rescue",
        "emergency protocol",
        "emergency",
        "avalanche",
        "snowpack",
        "hypothermia",
        "cold exposure",
        "bear encounter",
        "bear",
        "wildlife",
        "predator",
        "lightning",
        "altitude sickness",
        "mountain sickness",
        "ams",
        "fracture",
        "dislocation",
        "splint",
        "beacon check-in",
        "checkin",
        "check-in",
        "safety registration",
        "safety protocol",
        "field treatment",
    ]
    if not any(kw in q for kw in keywords):
        return None

    # Detect device_id if present (e.g. SBR-XXXXX)
    device_id_match = re.search(r"\b(sbr-[a-z0-9]{4,8})\b", q)
    device_id = device_id_match.group(1).upper() if device_id_match else None

    # Detect device_type
    device_type = None
    if "inreach" in q or "garmin" in q:
        device_type = "garmin_inreach"
    elif "zoleo" in q:
        device_type = "zoleo"
    elif "spot" in q:
        device_type = "spot"
    elif "bivy" in q:
        device_type = "bivy_stick"
    elif "apple" in q or "iphone" in q:
        device_type = "apple_satellite"

    # Detect zone
    zone = None
    if any(z in q for z in ["cascade", "cascades", "stevens pass", "snoqualmie", "rainier"]):
        zone = "cascades"
    elif any(z in q for z in ["rockies", "rocky", "colorado"]):
        zone = "rockies"
    elif any(z in q for z in ["sierra", "tahoe", "nevada"]):
        zone = "sierra"
    elif any(z in q for z in ["wasatch", "utah"]):
        zone = "wasatch"
    elif any(z in q for z in ["teton", "tetons", "jackson hole"]):
        zone = "tetons"

    # Detect incident_type
    incident_type = None
    if any(i in q for i in ["hypothermia", "cold exposure", "frostbite"]):
        incident_type = "hypothermia"
    elif any(i in q for i in ["bear", "wildlife", "predator", "cougar"]):
        incident_type = "wildlife"
    elif any(i in q for i in ["lightning", "thunderstorm", "electric storm"]):
        incident_type = "lightning"
    elif any(i in q for i in ["altitude", "ams", "mountain sickness", "hape", "hace"]):
        incident_type = "altitude"
    elif any(i in q for i in ["fracture", "dislocation", "splint", "broken bone", "broken leg", "injury"]):
        incident_type = "injury"

    # Detect action
    if any(k in q for k in ["register", "registration", "add beacon", "sign up beacon"]):
        action = "register_beacon"
    elif any(k in q for k in ["check-in", "checkin", "check in", "ping beacon", "beacon ping"]):
        if "emergency protocol" in q or "protocols" in q:
            action = "emergency_protocol"
        else:
            action = "checkin_beacon"
    elif any(k in q for k in ["avalanche", "snowpack"]):
        action = "avalanche_advisory"
    elif incident_type or any(k in q for k in ["emergency protocol", "first aid", "treatment", "protocol", "protocols"]):
        action = "emergency_protocol"
    elif any(k in q for k in ["sar", "search and rescue", "sos", "evacuation", "distress"]):
        action = "sar_procedure"
    else:
        action = "emergency_protocol"

    return SafetyIntent(
        action=action,
        device_type=device_type,
        incident_type=incident_type,
        zone=zone,
        device_id=device_id,
    )


def build_safety_prompt(intent: SafetyIntent) -> str:
    """Builds a contextual prompt injecting relevant safety protocols, beacon instructions, or avalanche advisories."""
    lines = [
        "Contoso Outdoors Wilderness Safety & Emergency Advisory Grounding:",
    ]

    if intent.action == "emergency_protocol" or intent.incident_type:
        protocol = get_emergency_protocol(intent.incident_type or "")
        if protocol:
            lines.extend([
                f"Emergency Protocol: {protocol.title} (Severity: {protocol.severity})",
                "First-Response Steps:",
                *[f"- {step}" for step in protocol.first_response_steps],
                "SAR Signaling Instructions:",
                *[f"- {step}" for step in protocol.sar_signaling_instructions],
                "Precautions:",
                *[f"- {prec}" for prec in protocol.precautions],
            ])
        else:
            lines.append("Available Emergency Protocols:")
            for p in list_emergency_protocols():
                lines.append(f"- {p.title} ({p.severity}): {'; '.join(p.first_response_steps[:2])}")

    elif intent.action == "avalanche_advisory" or intent.zone:
        advisory = get_avalanche_advisory(intent.zone or "")
        if advisory:
            lines.extend([
                f"Regional Avalanche Advisory: {advisory.zone_name}",
                f"Danger Rating: {advisory.danger_rating}",
                f"Elevation Band: {advisory.elevation_band}",
                f"Primary Hazard: {advisory.primary_hazard}",
                f"Summary: {advisory.summary}",
                "Recommended Actions:",
                *[f"- {act}" for act in advisory.recommended_actions],
            ])
        else:
            lines.append("Regional Avalanche Advisories:")
            for a in list_avalanche_advisories():
                lines.append(f"- {a.zone_name}: {a.danger_rating} ({a.elevation_band}, {a.primary_hazard})")

    elif intent.action == "register_beacon":
        lines.extend([
            "Satellite SOS Beacon Registration Guidance:",
            "- Supported Devices: Garmin inReach, Zoleo Satellite Communicator, SPOT Gen4, Bivy Stick, Apple Satellite SOS.",
            "- Registry requires device IMEI, owner details, emergency contacts, trip zone, and return date.",
            "- Once registered, customer receives an SBR-XXXXX registration ID for automated status tracking and check-ins.",
        ])

    elif intent.action == "checkin_beacon":
        lines.extend([
            "Satellite SOS Beacon Check-In Procedures:",
            "- Customers can send status pings (e.g., OK, Delayed, Camp reached) with optional GPS coordinates.",
            "- Check-in pings update device last_checkin timestamp in Contoso safety monitoring.",
            "- If overdue past return date without check-in, emergency contacts and local SAR can be alerted.",
        ])

    elif intent.action == "sar_procedure":
        lines.extend([
            "Search and Rescue (SAR) & Satellite SOS Emergency Procedure:",
            "- Hardware SOS: Press and hold dedicated SOS button on Garmin inReach, Zoleo, or SPOT device until countdown completes.",
            "- Confirmation: Verify 2-way dispatch confirmation message with SAR response center (IERCC / GEOS).",
            "- Positioning: Stay in place with clear view of open sky; avoid moving unless active objective hazard (rockfall/avalanche) threatens location.",
            "- Aircraft Signaling: Display international distress signals (3 whistle blasts, orange ground sheet, mirror flashes).",
        ])

    lines.extend([
        "",
        "Instructions for Assistant:",
        "- Prioritize immediate life safety and clarity in all responses.",
        "- Quote exact emergency first-response steps and SAR signaling procedures where applicable.",
        "- Emphasize carrying the Ten Essentials, avalanche safety gear (transceiver, probe, shovel), and an active satellite communicator.",
    ])

    return "\n".join(lines)


def format_safety_response(intent: SafetyIntent) -> dict[str, Any]:
    """Formats assistant reply text and structured safety_info metadata."""
    if intent.action == "emergency_protocol" and intent.incident_type:
        protocol = get_emergency_protocol(intent.incident_type)
        if protocol:
            steps_str = "; ".join(protocol.first_response_steps)
            sar_str = "; ".join(protocol.sar_signaling_instructions)
            answer = (
                f"Emergency Protocol for {protocol.title} (Severity: {protocol.severity}): "
                f"Immediate first-response steps: {steps_str}. "
                f"SAR signaling & evacuation instructions: {sar_str}."
            )
            return {
                "answer": answer,
                "safety_info": {
                    "action": "emergency_protocol",
                    "incident_type": intent.incident_type,
                    "protocol": protocol.model_dump(),
                    "available_protocols": [p.model_dump() for p in list_emergency_protocols()],
                },
            }

    if intent.action == "emergency_protocol":
        answer = (
            "Contoso Outdoors Emergency Protocols & Safety Tooling: "
            "We provide standardized first-response protocols for hypothermia, bear/wildlife encounters, "
            "high-ridge lightning storms, acute mountain sickness (AMS), and backcountry fracture/injury, "
            "as well as satellite SOS beacon registration and regional avalanche advisories."
        )
        return {
            "answer": answer,
            "safety_info": {
                "action": "emergency_protocol",
                "incident_type": None,
                "available_protocols": [p.model_dump() for p in list_emergency_protocols()],
                "supported_devices": ["garmin_inreach", "zoleo", "spot", "bivy_stick", "apple_satellite"],
            },
        }

    if intent.action == "avalanche_advisory":
        advisory = get_avalanche_advisory(intent.zone or "")
        if advisory:
            actions_str = "; ".join(advisory.recommended_actions)
            answer = (
                f"Regional Avalanche Advisory for {advisory.zone_name}: "
                f"Danger Rating is {advisory.danger_rating} ({advisory.elevation_band}). "
                f"Primary hazard: {advisory.primary_hazard}. {advisory.summary} "
                f"Recommended precautions: {actions_str}."
            )
            return {
                "answer": answer,
                "safety_info": {
                    "action": "avalanche_advisory",
                    "zone": intent.zone,
                    "advisory": advisory.model_dump(),
                    "available_zones": list(AVALANCHE_ADVISORIES.keys()),
                },
            }
        else:
            summaries = [
                f"{a.zone_name}: {a.danger_rating} ({a.elevation_band}, {a.primary_hazard})"
                for a in list_avalanche_advisories()
            ]
            answer = (
                "Current Regional Avalanche Advisories: "
                + "; ".join(summaries)
                + ". Always check avalanche.org or local avalanche center forecasts before traveling in the backcountry."
            )
            return {
                "answer": answer,
                "safety_info": {
                    "action": "avalanche_advisory",
                    "zone": None,
                    "advisories": [a.model_dump() for a in list_avalanche_advisories()],
                },
            }

    if intent.action == "register_beacon":
        device_str = f" for your {intent.device_type.replace('_', ' ').title()}" if intent.device_type else ""
        zone_str = f" in {intent.zone.title()}" if intent.zone else ""
        answer = (
            f"You can register your satellite SOS beacon{device_str}{zone_str} with Contoso Outdoors Safety Registry. "
            "Submit your device IMEI, trip zone, emergency contact, and return date to receive an automated monitoring ID (SBR-XXXXX). "
            "In the field, perform check-in pings to confirm status."
        )
        return {
            "answer": answer,
            "safety_info": {
                "action": "register_beacon",
                "device_type": intent.device_type,
                "zone": intent.zone,
                "supported_devices": ["garmin_inreach", "zoleo", "spot", "bivy_stick", "apple_satellite"],
            },
        }

    if intent.action == "checkin_beacon":
        id_str = f" for beacon {intent.device_id}" if intent.device_id else ""
        answer = (
            f"Satellite beacon check-in{id_str}: Send status pings (e.g., OK, Camp Reached) along with GPS coordinates "
            "to update active monitoring. If you experience an emergency, activate hardware SOS immediately."
        )
        return {
            "answer": answer,
            "safety_info": {
                "action": "checkin_beacon",
                "device_id": intent.device_id,
                "device_type": intent.device_type,
                "zone": intent.zone,
            },
        }

    # Default sar_procedure or safety general
    answer = (
        "Search and Rescue (SAR) & Satellite Emergency Procedure: "
        "Activate your 2-way satellite SOS beacon (Garmin inReach, Zoleo, SPOT). "
        "Remain stationary with sky visibility, reply to dispatcher text queries, "
        "and signal rescue aircraft with 3 whistle blasts or orange ground panels."
    )
    return {
        "answer": answer,
        "safety_info": {
            "action": "sar_procedure",
            "available_protocols": [p.model_dump() for p in list_emergency_protocols()],
        },
    }
