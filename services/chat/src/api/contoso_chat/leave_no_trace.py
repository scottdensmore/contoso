import re
from typing import Any, Optional

from pydantic import BaseModel


class LntPrincipleModel(BaseModel):
    principle_id: str
    number: int
    title: str
    subtitle: str
    guidelines: list[str]
    backcountry_practices: list[str]


class WildernessZoneModel(BaseModel):
    zone_id: str
    name: str
    region: str
    elevation_zone: str
    human_waste_protocol: str
    food_storage_requirement: str
    campfire_policy: str
    elevation_threshold_ft: Optional[int] = None
    special_rules: list[str]


class WasteComplianceRequest(BaseModel):
    zone_id: str
    elevation_ft: Optional[int] = None
    distance_from_water_ft: int = 200
    group_size: int = 2
    stay_days: int = 2


class WasteComplianceResponse(BaseModel):
    zone_id: str
    human_waste_method: str
    food_storage_method: str
    compliance_status: str
    guidance_notes: list[str]
    required_gear: list[str]
    estimated_wag_bags_needed: int


class PackOutCalcRequest(BaseModel):
    group_size: int = 2
    stay_days: int = 2
    requires_wag_bags: bool = True


class PackOutCalcResponse(BaseModel):
    group_size: int
    stay_days: int
    wag_bags: int
    trash_bags: int
    odor_proof_bags: int
    trowel_needed: bool
    sanitizer_oz: float


class LntIntent(BaseModel):
    action: str  # "principles", "zone_regulations", "compliance_check", "pack_out_calc"
    zone_id: Optional[str] = None
    principle_id: Optional[str] = None
    group_size: Optional[int] = None
    stay_days: Optional[int] = None


DEFAULT_LNT_PRINCIPLES: list[LntPrincipleModel] = [
    LntPrincipleModel(
        principle_id="plan-ahead",
        number=1,
        title="Plan Ahead and Prepare",
        subtitle="Know the regulations and special concerns for the area you'll visit.",
        guidelines=[
            "Know the regulations and special concerns for the area you'll visit.",
            "Prepare for extreme weather, hazards, and emergencies.",
            "Schedule your trip to avoid times of high use.",
            "Visit in small groups when possible. Consider splitting larger groups into smaller groups.",
            "Repackage food to minimize waste.",
            "Use a map, compass, and GPS to navigate; avoid marking paint, rock cairns, or flagging.",
        ],
        backcountry_practices=[
            "Check permit requirements, quotas, and fire bans well in advance.",
            "Verify seasonal snowpack, high-water stream crossings, and avalanche hazard.",
            "Review zone-specific waste and food storage mandates before departure.",
        ],
    ),
    LntPrincipleModel(
        principle_id="durable-surfaces",
        number=2,
        title="Travel and Camp on Durable Surfaces",
        subtitle="Durable surfaces include established trails and campsites, rock, gravel, dry grasses or snow.",
        guidelines=[
            "Durable surfaces include established trails and campsites, rock, gravel, dry grasses or snow.",
            "Protect riparian zones by camping at least 200 feet from lakes and streams.",
            "Good campsites are found, not made. Altering a site is not necessary.",
            "In popular areas: concentrate use on existing trails and campsites; walk single file in the middle of the trail.",
            "In pristine areas: disperse use to prevent the creation of campsites and trails; avoid places where impacts are just beginning.",
        ],
        backcountry_practices=[
            "Stay in the center of the trail even if wet or muddy to prevent trail widening.",
            "Pitch tents on bare ground, rock, or snow rather than alpine vegetation or meadows.",
            "Avoid trampling delicate alpine tundra or cryptobiotic soil crusts.",
        ],
    ),
    LntPrincipleModel(
        principle_id="dispose-waste",
        number=3,
        title="Dispose of Waste Properly",
        subtitle="Pack it in, pack it out. Deposit solid human waste in catholes 6 to 8 inches deep, at least 200 feet from water, camp, and trails.",
        guidelines=[
            "Pack it in, pack it out. Inspect your campsite and rest areas for trash or spilled foods.",
            "Pack out all trash, leftover food, and litter — including biodegradable waste like fruit peels.",
            "Deposit solid human waste in catholes dug 6 to 8 inches deep, at least 200 feet from water, camp, and trails. Cover and disguise the cathole when finished.",
            "In designated sensitive alpine or slot canyon zones, pack out all solid human waste using an approved WAG bag.",
            "Pack out toilet paper and hygiene products.",
            "To wash yourself or your dishes, carry water 200 feet away from streams or lakes and use small amounts of biodegradable soap. Scatter strained dishwater.",
        ],
        backcountry_practices=[
            "Carry a lightweight aluminum trowel for cathole excavation where permitted.",
            "Always carry WAG bags (waste alleviation and gelling bags) in rocky alpine zones or glaciated terrain.",
            "Keep a dedicated odor-proof pack-out bag for used toilet paper and hygiene items.",
        ],
    ),
    LntPrincipleModel(
        principle_id="leave-what-you-find",
        number=4,
        title="Leave What You Find",
        subtitle="Preserve the past: examine, but do not touch cultural or historic structures and artifacts.",
        guidelines=[
            "Preserve the past: examine, but do not touch cultural or historic structures and artifacts.",
            "Leave rocks, plants, and other natural objects as you find them.",
            "Avoid introducing or transporting non-native species.",
            "Do not build structures, furniture, or dig trenches.",
        ],
        backcountry_practices=[
            "Clean boot treads and trekking pole tips between watersheds to stop invasive weed seeds.",
            "Take photos and memories rather than wildflowers, geodes, or wood.",
            "Dismantle user-built rock windbreaks and unauthorized rock cairns.",
        ],
    ),
    LntPrincipleModel(
        principle_id="minimize-campfire",
        number=5,
        title="Minimize Campfire Impacts",
        subtitle="Campfires can cause lasting impacts to the backcountry. Use a lightweight stove for cooking.",
        guidelines=[
            "Campfires can cause lasting impacts to the backcountry. Use a lightweight stove for cooking and enjoy a candle lantern for light.",
            "Where fires are permitted, use established fire rings, fire pans, or mound fires.",
            "Keep fires small. Only use down and dead wood from the ground that can be broken by hand.",
            "Burn all wood and coals to ash, put out campfires completely, then scatter cool ashes.",
        ],
        backcountry_practices=[
            "Check elevation limits and seasonal burn bans before lighting fires.",
            "Never cut branches from live or standing dead trees.",
            "Follow the drown, stir, and feel method until coals are cold to the touch.",
        ],
    ),
    LntPrincipleModel(
        principle_id="respect-wildlife",
        number=6,
        title="Respect Wildlife",
        subtitle="Observe wildlife from a distance. Do not follow or approach them. Never feed animals.",
        guidelines=[
            "Observe wildlife from a distance. Do not follow or approach them.",
            "Never feed animals. Feeding wildlife damages their health, alters natural behaviors, and exposes them to predators.",
            "Protect wildlife and your food by storing rations and trash securely.",
            "Control pets at all times, or leave them at home.",
            "Avoid wildlife during sensitive times: mating, nesting, raising young, or winter.",
        ],
        backcountry_practices=[
            "Carry an approved hard-sided bear canister in bear country.",
            "Use the rule of thumb: if you can't cover the animal with your thumb held at arm's length, you are too close.",
            "Store all scented items including lip balm, toothpaste, and garbage inside bear canisters.",
        ],
    ),
    LntPrincipleModel(
        principle_id="be-considerate",
        number=7,
        title="Be Considerate of Other Visitors",
        subtitle="Respect other visitors and protect the quality of their experience.",
        guidelines=[
            "Respect other visitors and protect the quality of their experience.",
            "Be courteous. Yield to other users on the trail.",
            "Step to the downhill side of the trail when encountering pack stock.",
            "Take breaks and camp away from trails and other visitors.",
            "Let nature's sounds prevail. Avoid loud voices and noises.",
        ],
        backcountry_practices=[
            "Uphill hikers have the right of way; step aside safely to let them pass.",
            "Keep group noise low and use headphones if listening to music.",
            "Dim headlamps when approaching other camps or talking to fellow hikers.",
        ],
    ),
]


DEFAULT_WILDERNESS_ZONES: dict[str, WildernessZoneModel] = {
    "enchantments-core": WildernessZoneModel(
        zone_id="enchantments-core",
        name="The Enchantments - Core Enchantment Zone",
        region="Alpine Lakes Wilderness / Central Cascades",
        elevation_zone="Alpine (>6,500 ft)",
        human_waste_protocol="Mandatory WAG bag pack-out. Catholes strictly prohibited; vault toilets available at designated locations.",
        food_storage_requirement="Mandatory hard-sided bear canister (IGBC approved).",
        campfire_policy="Strictly prohibited year-round at all elevations.",
        elevation_threshold_ft=6500,
        special_rules=[
            "Mandatory pack-out of all solid human waste with WAG bags when toilets are unavailable.",
            "Catholes are strictly prohibited due to fragile granitic soils and extreme visitor density.",
            "Hard-sided bear canisters mandatory for all food, trash, and toiletries.",
            "Campfires strictly prohibited across the entire permit area.",
            "Urinate on bare rock or trail to prevent mountain goats from defoliating alpine vegetation for salt.",
        ],
    ),
    "mount-rainier-muir": WildernessZoneModel(
        zone_id="mount-rainier-muir",
        name="Mount Rainier - Camp Muir & High Alpine Snowfields",
        region="Mount Rainier National Park",
        elevation_zone="High Alpine / Glacial (>10,000 ft)",
        human_waste_protocol="Mandatory Blue Bag / WAG bag pack-out on glaciers, snowfields, and climbing routes.",
        food_storage_requirement="Hard-sided bear canister or rodent-proof hanging.",
        campfire_policy="Prohibited year-round across all backcountry and alpine areas.",
        elevation_threshold_ft=10000,
        special_rules=[
            "Pack out all solid human waste in Blue Bags / WAG bags; deposit in collection barrels at Camp Muir or trailheads.",
            "Never bury waste or trash in snow or crevasses.",
            "Campfires strictly prohibited throughout Mount Rainier backcountry.",
            "Store all food securely from raven and rodent access.",
        ],
    ),
    "olympic-coast": WildernessZoneModel(
        zone_id="olympic-coast",
        name="Olympic National Park - Wilderness Coast",
        region="Olympic Peninsula",
        elevation_zone="Coastal Strip (0-100 ft)",
        human_waste_protocol="Intertidal zone disposal below high-tide line or pit privies where available.",
        food_storage_requirement="Mandatory hard-sided bear canister.",
        campfire_policy="Permitted only on open beach sand below high-tide drift line using driftwood only.",
        elevation_threshold_ft=100,
        special_rules=[
            "Hard-sided bear canisters mandatory between Ozette and South Beach / Hoh River.",
            "Where pit privies are not provided, bury solid waste in the intertidal zone below the high-tide line so the outgoing tide washes it out.",
            "Never bury waste in sand dunes or coastal forest.",
            "Burn driftwood only below the high-tide mark; never leave fires unattended or burn green vegetation.",
        ],
    ),
    "north-cascades-boston": WildernessZoneModel(
        zone_id="north-cascades-boston",
        name="North Cascades - Boston Basin & Sahale Arm",
        region="North Cascades National Park",
        elevation_zone="Subalpine to Alpine (>5,500 ft)",
        human_waste_protocol="WAG bag pack-out mandatory on snow and rock above treeline; catholes (6-8 in) permitted only in low soil zones 200+ ft from water.",
        food_storage_requirement="Hard-sided bear canister mandatory in Boston Basin.",
        campfire_policy="Prohibited above 3,500 ft and entirely in cross-country zones.",
        elevation_threshold_ft=5500,
        special_rules=[
            "Hard-sided bear canisters required for all overnight backcountry camping in Boston Basin.",
            "Pack out all solid waste when camping on rock or snowfields.",
            "No campfires allowed in alpine or cross-country zones.",
            "Pack out all used toilet paper and sanitary products.",
        ],
    ),
    "alpine-lakes-lowland": WildernessZoneModel(
        zone_id="alpine-lakes-lowland",
        name="Alpine Lakes Wilderness - Lowland Forest Valley",
        region="Central Cascades",
        elevation_zone="Lowland Forest (<4,000 ft)",
        human_waste_protocol="Cathole 6-8 inches deep in organic/mineral soil, at least 200 feet from water sources, trails, and campsites.",
        food_storage_requirement="Ursack Major / bear-resistant sack or counterbalance hang (12 ft high, 4 ft out).",
        campfire_policy="Allowed in established USFS fire rings below 4,000 ft, subject to seasonal burn bans.",
        elevation_threshold_ft=4000,
        special_rules=[
            "Catholes must be dug 6-8 inches deep and completely covered with soil and duff.",
            "Pack out all used toilet paper in sealable plastic bags.",
            "Campfires prohibited above 4,000 ft year-round.",
            "Food must be hung or stored in bear-resistant containers.",
        ],
    ),
}


def get_lnt_principles(principle_id: Optional[str] = None) -> list[LntPrincipleModel]:
    """Returns the list of 7 Leave No Trace principles, optionally filtered by principle ID or number."""
    if not principle_id:
        return list(DEFAULT_LNT_PRINCIPLES)

    clean_id = principle_id.strip().lower()
    matches = []
    for p in DEFAULT_LNT_PRINCIPLES:
        if p.principle_id.lower() == clean_id or str(p.number) == clean_id:
            matches.append(p)
    return matches


def get_wilderness_zones(zone_id: Optional[str] = None) -> list[WildernessZoneModel]:
    """Returns wilderness zone regulations, optionally filtered by zone ID."""
    zones = list(DEFAULT_WILDERNESS_ZONES.values())
    if not zone_id:
        return zones

    clean_id = zone_id.strip().lower()
    return [z for z in zones if z.zone_id.lower() == clean_id or clean_id in z.name.lower()]


def get_wilderness_zone_by_id(zone_id: str) -> Optional[WildernessZoneModel]:
    """Finds a single wilderness zone model by ID."""
    clean_id = zone_id.strip().lower()
    for k, v in DEFAULT_WILDERNESS_ZONES.items():
        if k.lower() == clean_id or v.zone_id.lower() == clean_id:
            return v
    return None


def assess_waste_compliance(req: WasteComplianceRequest) -> WasteComplianceResponse:
    """Evaluates human waste and food storage compliance for a given wilderness zone and trip parameters."""
    zone = get_wilderness_zone_by_id(req.zone_id)
    if not zone:
        raise ValueError(f"Wilderness zone '{req.zone_id}' not found")

    guidance_notes: list[str] = []
    required_gear: list[str] = []

    # Water distance check: LNT Principle 3 minimum 200 feet from all water sources
    is_water_violation = req.distance_from_water_ft < 200
    if is_water_violation:
        compliance_status = "violation"
        guidance_notes.append(
            f"Water Distance Violation: Current distance of {req.distance_from_water_ft} feet violates regulations. "
            "Leave No Trace principle 3 mandates that catholes and human waste disposal must be at least 200 feet "
            "(approximately 70 adult paces) away from lakes, rivers, streams, and campsites."
        )
    else:
        compliance_status = "compliant"

    # Zone-specific human waste and food storage mandates
    zid = zone.zone_id
    if zid == "enchantments-core":
        human_waste_method = "WAG bag pack-out mandatory (catholes prohibited; vault toilets where available)"
        food_storage_method = "Hard-sided bear canister mandatory (IGBC approved)"
        estimated_wag_bags = req.group_size * req.stay_days
        required_gear.extend(["WAG bags", "Hard-sided bear canister", "Odor-proof pack-out bag", "Hand sanitizer"])
        guidance_notes.append(
            "The Enchantments Core Zone strictly mandates packing out all solid human waste in WAG bags. "
            "Catholes are prohibited due to fragile granitic soils. Urinate on rocks or trails to protect alpine vegetation from goats."
        )
    elif zid == "mount-rainier-muir":
        human_waste_method = "Blue Bag / WAG bag pack-out mandatory on glaciers and snowfields"
        food_storage_method = "Hard-sided bear canister or rodent-proof hanging"
        estimated_wag_bags = req.group_size * req.stay_days
        required_gear.extend(["WAG bags / Blue Bags", "Hard-sided bear canister", "Odor-proof transport bag", "Hand sanitizer"])
        guidance_notes.append(
            "Mount Rainier high alpine snowfields require carrying Blue Bags/WAG bags. Never bury waste in snow or crevasses."
        )
    elif zid == "olympic-coast":
        human_waste_method = "Intertidal zone disposal below high-tide line or pit privies where available"
        food_storage_method = "Hard-sided bear canister mandatory"
        estimated_wag_bags = 0
        required_gear.extend(["Hard-sided bear canister", "Tide table chart", "Hand sanitizer"])
        guidance_notes.append(
            "Where pit privies are unavailable on the Olympic Coast, bury solid waste in the intertidal zone below the high-tide line. "
            "Catholes in dunes or coastal forests are strictly prohibited."
        )
    elif zid == "north-cascades-boston":
        is_high_elevation = req.elevation_ft is not None and req.elevation_ft >= (zone.elevation_threshold_ft or 5500)
        if is_high_elevation:
            human_waste_method = "WAG bag pack-out mandatory in alpine/snow zone"
            estimated_wag_bags = req.group_size * req.stay_days
            required_gear.extend(["WAG bags", "Odor-proof pack-out bag"])
        else:
            human_waste_method = "Cathole 6-8 inches deep (200+ ft from water) or WAG bag on rock/snow"
            estimated_wag_bags = 0
            required_gear.append("Backcountry trowel")
        food_storage_method = "Hard-sided bear canister mandatory in Boston Basin"
        required_gear.extend(["Hard-sided bear canister", "Hand sanitizer"])
        guidance_notes.append(
            "Boston Basin requires hard-sided bear canisters. Solid waste must be packed out when camping on rock or snowfields."
        )
    elif zid == "alpine-lakes-lowland":
        is_above_limit = req.elevation_ft is not None and req.elevation_ft >= (zone.elevation_threshold_ft or 4000)
        if is_above_limit:
            human_waste_method = "Cathole 6-8 inches deep (200+ ft from water) or WAG bag pack-out"
            estimated_wag_bags = 0
            required_gear.append("Backcountry trowel")
            food_storage_method = "Hard-sided bear canister or Ursack Major"
            required_gear.append("Ursack Major / bear canister")
            guidance_notes.append("Above 4,000 ft in Alpine Lakes Wilderness, campfires are strictly prohibited year-round.")
        else:
            human_waste_method = "Cathole 6-8 inches deep in organic soil (200+ ft from water)"
            estimated_wag_bags = 0
            required_gear.append("Backcountry trowel")
            food_storage_method = "Ursack Major / bear-resistant sack or counterbalance hang (12 ft high, 4 ft out)"
            required_gear.append("Ursack / counterbalance hang kit")
        required_gear.extend(["Sealable trash bag for used toilet paper", "Hand sanitizer"])
        guidance_notes.append("Catholes must be dug 6 to 8 inches deep and at least 200 feet from any water source, trail, or camp.")
    else:
        human_waste_method = "Cathole 6-8 inches deep, 200+ ft from water, trails, and campsites"
        estimated_wag_bags = 0
        food_storage_method = "Bear-resistant container or counter-balance hang"
        required_gear.extend(["Backcountry trowel", "Hand sanitizer"])
        guidance_notes.append("Follow standard Leave No Trace backcountry practices.")

    return WasteComplianceResponse(
        zone_id=zone.zone_id,
        human_waste_method=human_waste_method,
        food_storage_method=food_storage_method,
        compliance_status=compliance_status,
        guidance_notes=guidance_notes,
        required_gear=required_gear,
        estimated_wag_bags_needed=estimated_wag_bags,
    )


def calculate_pack_out_waste(req: PackOutCalcRequest) -> PackOutCalcResponse:
    """Calculates required WAG bags, trash bags, odor-proof bags, trowel requirement, and sanitizer ounces."""
    wag_bags = req.group_size * req.stay_days if req.requires_wag_bags else 0
    trash_bags = max(1, (req.stay_days + 1) // 2)
    odor_proof_bags = max(1, (req.group_size + 1) // 2)
    trowel_needed = not req.requires_wag_bags
    sanitizer_oz = round(req.group_size * req.stay_days * 0.5, 1)

    return PackOutCalcResponse(
        group_size=req.group_size,
        stay_days=req.stay_days,
        wag_bags=wag_bags,
        trash_bags=trash_bags,
        odor_proof_bags=odor_proof_bags,
        trowel_needed=trowel_needed,
        sanitizer_oz=sanitizer_oz,
    )


def detect_lnt_intent(query: str) -> Optional[LntIntent]:
    """Detects inquiries regarding Leave No Trace principles, cathole depths, WAG bags, bear canisters, and waste rules."""
    q_lower = query.lower()

    lnt_triggers = [
        "leave no trace", "lnt", "principles of lnt", "7 principles", "seven principles",
        "outdoor ethics", "cathole", "cat hole", "catholes", "cat holes",
        "human waste", "wag bag", "wag bags", "waste alleviation", "blue bag", "blue bags",
        "trowel", "pack it out", "pack-it-out", "pack out waste", "waste supplies",
        "pack out poop", "poop in the woods", "toilet paper pack out", "how deep to dig",
        "bear canister", "bear canisters", "bear can", "bear cans", "bear vault", "ursack",
        "food storage", "food storage requirement", "food storage rule", "food storage rules",
        "waste compliance", "waste regulation", "waste regulations", "pack-out-calc",
    ]

    has_lnt_kw = any(trig in q_lower for trig in lnt_triggers)

    # Secondary topic triggers
    has_waste = any(w in q_lower for w in ["waste", "poop", "defecat", "trowel", "toilet paper"])
    has_food_storage = any(w in q_lower for w in ["bear canister", "bear can", "bear vault", "ursack"])
    has_water_distance = "feet from water" in q_lower or "ft from water" in q_lower or ("distance" in q_lower and "water" in q_lower)
    has_lnt_principles = "principle" in q_lower and any(p in q_lower for p in ["lnt", "trace", "1", "2", "3", "4", "5", "6", "7"])

    # If it's a zone query, it must be asking about waste, rules, regulations, food storage, or campfires in that zone
    zone_triggers = [
        "enchantment", "enchantments", "camp muir", "rainier high alpine",
        "olympic coast", "boston basin", "sahale", "alpine lakes lowland",
    ]
    has_zone = any(zt in q_lower for zt in zone_triggers)
    has_regulations = any(r in q_lower for r in ["regulation", "regulations", "rule", "rules", "compliance", "compliant", "protocol", "policy", "policies"])
    is_zone_lnt = has_zone and (has_waste or has_food_storage or (has_regulations and ("wilderness" in q_lower or "waste" in q_lower or "camp" in q_lower)))

    if not (has_lnt_kw or has_waste or has_food_storage or has_water_distance or has_lnt_principles or is_zone_lnt):
        return None

    # Identify Wilderness Zone if present
    zone_id: Optional[str] = None
    if "enchantment" in q_lower:
        zone_id = "enchantments-core"
    elif "muir" in q_lower or "rainier" in q_lower:
        zone_id = "mount-rainier-muir"
    elif "olympic" in q_lower or "coast" in q_lower:
        zone_id = "olympic-coast"
    elif "boston" in q_lower or "sahale" in q_lower:
        zone_id = "north-cascades-boston"
    elif "alpine lakes" in q_lower or "lowland" in q_lower:
        zone_id = "alpine-lakes-lowland"

    # Identify Principle ID if present
    principle_id: Optional[str] = None
    if "plan ahead" in q_lower or "principle 1" in q_lower:
        principle_id = "plan-ahead"
    elif "durable surface" in q_lower or "principle 2" in q_lower:
        principle_id = "durable-surfaces"
    elif "dispose waste" in q_lower or "cathole" in q_lower or "principle 3" in q_lower:
        principle_id = "dispose-waste"
    elif "leave what you find" in q_lower or "principle 4" in q_lower:
        principle_id = "leave-what-you-find"
    elif "minimize campfire" in q_lower or "campfire" in q_lower or "principle 5" in q_lower:
        principle_id = "minimize-campfire"
    elif "respect wildlife" in q_lower or "wildlife" in q_lower or "bear" in q_lower or "principle 6" in q_lower:
        principle_id = "respect-wildlife"
    elif "be considerate" in q_lower or "visitors" in q_lower or "principle 7" in q_lower:
        principle_id = "be-considerate"

    # Extract group size & stay days
    group_size: Optional[int] = None
    m_grp = re.search(r"(\d+)\s*(?:people|hikers|campers|group of|person)", q_lower)
    if m_grp:
        try:
            group_size = int(m_grp.group(1))
        except ValueError:
            pass

    stay_days: Optional[int] = None
    m_days = re.search(r"(\d+)\s*(?:days|nights|day|night)", q_lower)
    if m_days:
        try:
            stay_days = int(m_days.group(1))
        except ValueError:
            pass

    # Determine action
    if (
        "pack out" in q_lower
        and ("calc" in q_lower or "supplies" in q_lower or "how many" in q_lower or "need" in q_lower)
    ) or "how many wag" in q_lower or "pack-out-calc" in q_lower:
        action = "pack_out_calc"
    elif (
        "compliance" in q_lower
        or "compliant" in q_lower
        or "can i dig" in q_lower
        or "feet from water" in q_lower
        or ("distance" in q_lower and "water" in q_lower)
    ):
        action = "compliance_check"
    elif zone_id and ("regulation" in q_lower or "rules" in q_lower or "waste" in q_lower or "bear" in q_lower or "zone" in q_lower):
        action = "zone_regulations"
    elif "zone" in q_lower or "wilderness" in q_lower:
        action = "zone_regulations"
    else:
        action = "principles"

    return LntIntent(
        action=action,
        zone_id=zone_id,
        principle_id=principle_id,
        group_size=group_size,
        stay_days=stay_days,
    )


def build_lnt_prompt(intent: LntIntent) -> str:
    """Formats system prompt grounding lines for Leave No Trace principles and wilderness waste regulations."""
    lines = [
        "Contoso Outdoors Leave No Trace (LNT) & Wilderness Waste Regulations Grounding:",
        "- All backcountry travelers must follow the 7 Leave No Trace principles to protect natural ecosystems.",
        "- Human Waste Ethics: Catholes must be 6-8 inches deep and at least 200 feet (70 adult paces) away from all water sources, trails, and campsites.",
        "- Pack-Out Mandates: In sensitive alpine, glacial, or rocky zones (such as The Enchantments Core and Mount Rainier high routes), catholes are prohibited and WAG bag / blue bag pack-outs are strictly mandatory.",
        "- Food Storage: Hard-sided bear canisters (IGBC-certified) are mandatory in high-risk bear zones including The Enchantments Core, Olympic Coast, and Boston Basin.",
    ]

    if intent.zone_id:
        zone = get_wilderness_zone_by_id(intent.zone_id)
        if zone:
            lines.extend([
                f"Target Wilderness Zone: {zone.name} ({zone.zone_id})",
                f"- Region: {zone.region} | Elevation Zone: {zone.elevation_zone}",
                f"- Human Waste Protocol: {zone.human_waste_protocol}",
                f"- Food Storage Requirement: {zone.food_storage_requirement}",
                f"- Campfire Policy: {zone.campfire_policy}",
                f"- Special Rules: {'; '.join(zone.special_rules)}",
            ])
    elif intent.action == "zone_regulations":
        zones = get_wilderness_zones()
        lines.append("Pacific Northwest Wilderness Zone Waste & Food Storage Regulations:")
        for z in zones:
            lines.append(
                f"- {z.name} ({z.zone_id}): Waste={z.human_waste_protocol}; Food={z.food_storage_requirement}; Campfires={z.campfire_policy}"
            )

    if intent.principle_id:
        principles = get_lnt_principles(intent.principle_id)
        if principles:
            p = principles[0]
            lines.extend([
                f"Leave No Trace Principle {p.number}: {p.title}",
                f"- Subtitle: {p.subtitle}",
                f"- Guidelines: {'; '.join(p.guidelines)}",
                f"- Backcountry Practices: {'; '.join(p.backcountry_practices)}",
            ])

    if intent.action == "compliance_check":
        lines.extend([
            "Compliance Verification Rules:",
            "- Catholes within 200 feet of water, camp, or trails constitute a regulatory violation.",
            "- In zones requiring WAG bags (e.g. Enchantments Core), attempting cathole disposal is strictly non-compliant.",
            "- In hard-sided canister zones, hanging food or using soft bags violates park regulations.",
        ])

    if intent.action == "pack_out_calc":
        grp = intent.group_size or 2
        dys = intent.stay_days or 2
        calc = calculate_pack_out_waste(PackOutCalcRequest(group_size=grp, stay_days=dys, requires_wag_bags=True))
        lines.extend([
            f"Waste Pack-Out Supply Estimate for {grp} hikers / {dys} days:",
            f"- WAG Bags: {calc.wag_bags} bags (1 per person/day)",
            f"- Trash Bags: {calc.trash_bags} heavy-duty contractor bags",
            f"- Odor-Proof Barrier Bags: {calc.odor_proof_bags}",
            f"- Hand Sanitizer: {calc.sanitizer_oz} oz (0.5 oz/person/day)",
        ])

    lines.extend([
        "",
        "Instructions for Assistant:",
        "- Prioritize wilderness preservation, environmental ethics, and hiker safety in all advice.",
        "- Clearly distinguish between cathole-permitted zones and mandatory WAG bag pack-out zones.",
        "- Emphasize the 200-foot distance rule from all water sources.",
        "- Reiterate bear canister mandates to prevent wildlife habituation.",
    ])

    return "\n".join(lines)


def format_lnt_response(intent: LntIntent) -> dict[str, Any]:
    """Formats the assistant answer and structured lnt_info metadata."""
    if intent.action == "compliance_check":
        zone_id = intent.zone_id or "enchantments-core"
        group_size = intent.group_size or 2
        stay_days = intent.stay_days or 2
        try:
            compliance = assess_waste_compliance(
                WasteComplianceRequest(
                    zone_id=zone_id,
                    group_size=group_size,
                    stay_days=stay_days,
                )
            )
            zone = get_wilderness_zone_by_id(zone_id)
            zone_name = zone.name if zone else zone_id
            if compliance.compliance_status == "compliant":
                answer = (
                    f"Compliance assessment for {zone_name}: Your plan is compliant. "
                    f"Human waste protocol: {compliance.human_waste_method}. "
                    f"Food storage requirement: {compliance.food_storage_method}. "
                    f"Required gear: {', '.join(compliance.required_gear)}. "
                    f"Guidance: {' '.join(compliance.guidance_notes)}"
                )
            else:
                answer = (
                    f"Compliance assessment for {zone_name}: VIOLATION detected. "
                    f"Guidance notes: {' '.join(compliance.guidance_notes)} "
                    f"Required human waste method: {compliance.human_waste_method}."
                )
            return {
                "answer": answer,
                "lnt_info": {
                    "action": "compliance_check",
                    "compliance": compliance.model_dump(),
                },
            }
        except ValueError:
            pass

    if intent.action == "pack_out_calc":
        group_size = intent.group_size or 2
        stay_days = intent.stay_days or 2
        calc = calculate_pack_out_waste(
            PackOutCalcRequest(group_size=group_size, stay_days=stay_days, requires_wag_bags=True)
        )
        answer = (
            f"Backcountry pack-out waste calculation for {group_size} people for {stay_days} days: "
            f"{calc.wag_bags} WAG bags (waste alleviation bags), {calc.trash_bags} trash bags, "
            f"{calc.odor_proof_bags} odor-proof transport bags, and {calc.sanitizer_oz} oz of hand sanitizer. "
            f"Trowel needed: {'Yes' if calc.trowel_needed else 'No (WAG bags required)'}."
        )
        return {
            "answer": answer,
            "lnt_info": {
                "action": "pack_out_calc",
                "pack_out_calc": calc.model_dump(),
            },
        }

    if intent.action == "zone_regulations":
        if intent.zone_id:
            zone = get_wilderness_zone_by_id(intent.zone_id)
            if zone:
                answer = (
                    f"Regulations for {zone.name}: "
                    f"Human waste protocol: {zone.human_waste_protocol}. "
                    f"Food storage requirement: {zone.food_storage_requirement}. "
                    f"Campfire policy: {zone.campfire_policy}. "
                    f"Special rules: {'; '.join(zone.special_rules)}."
                )
                return {
                    "answer": answer,
                    "lnt_info": {
                        "action": "zone_regulations",
                        "zone": zone.model_dump(),
                    },
                }
        zones = get_wilderness_zones()
        answer = (
            "Pacific Northwest Wilderness Zone regulations overview: "
            + "; ".join(f"{z.name}: {z.human_waste_protocol}" for z in zones)
        )
        return {
            "answer": answer,
            "lnt_info": {
                "action": "zone_regulations",
                "zones": [z.model_dump() for z in zones],
            },
        }

    # Default / principles action
    if intent.principle_id:
        principles = get_lnt_principles(intent.principle_id)
        if len(principles) == 1:
            p = principles[0]
            answer = (
                f"Leave No Trace Principle {p.number}: {p.title}. {p.subtitle} "
                f"Backcountry practices: {'; '.join(p.backcountry_practices)}."
            )
            return {
                "answer": answer,
                "lnt_info": {
                    "action": "principles",
                    "principle": p.model_dump(),
                },
            }

    principles = get_lnt_principles()
    answer = (
        "The 7 Leave No Trace Principles are: "
        + "; ".join(f"{p.number}. {p.title}" for p in principles)
        + ". Always dispose of waste properly and respect wildlife."
    )
    return {
        "answer": answer,
        "lnt_info": {
            "action": "principles",
            "principles": [p.model_dump() for p in principles],
        },
    }
