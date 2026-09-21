import re
from typing import Any, Optional

from pydantic import BaseModel, Field


class FishingLocationModel(BaseModel):
    location_id: str
    name: str
    region: str
    state: str
    elevation_ft: int
    water_type: str
    target_species: list[str]
    recommended_rod_wt: int
    recommended_tippet: str
    active_hatches: list[str]
    catch_and_release: bool
    barbless_required: bool
    description: str
    regulations: list[str]


class FlyMatchRequest(BaseModel):
    location_id: str
    water_temp_f: float = 54.0
    time_of_day: str = "midday"
    surface_activity: str = "rising"


class FlyMatchResponse(BaseModel):
    location_id: str
    location_name: str
    suggested_fly: str
    fly_size: str
    presentation: str
    tippet_size: str
    fish_activity: str
    thermal_warning: Optional[str] = None
    regulations_summary: list[str] = Field(default_factory=list)


class FlyFishingGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool = True
    purpose: str


class FlyFishingIntent(BaseModel):
    action: str  # "locations_list", "location_detail", "fly_match", "gear_regulations"
    location_id: Optional[str] = None
    water_type: Optional[str] = None
    target_species: Optional[str] = None


class FlyFishingGearRegulationsResponse(BaseModel):
    gear: list[FlyFishingGearRequirement]
    mandatory_gear: list[FlyFishingGearRequirement]
    regulations: list[str]
    barbless_rules: list[str]
    leave_no_trace_rules: list[str]
    conservation_ethics: list[str]


DEFAULT_FISHING_LOCATIONS: dict[str, FishingLocationModel] = {
    "upper-yakima-canyon": FishingLocationModel(
        location_id="upper-yakima-canyon",
        name="Upper Yakima River Canyon",
        region="Central Washington Cascades",
        state="WA",
        elevation_ft=1200,
        water_type="freestone_river",
        target_species=["rainbow_trout", "westside_cutthroat"],
        recommended_rod_wt=5,
        recommended_tippet="9ft 4X",
        active_hatches=["stonefly_salmonfly", "caddis_elk_hair"],
        catch_and_release=True,
        barbless_required=True,
        description=(
            "Legendary blue-ribbon freestone river coursing through high-desert basalt canyons, "
            "famous for aggressive native rainbow trout and westslope cutthroat feeding along structured foam lines."
        ),
        regulations=[
            "Single barbless hooks required",
            "Catch-and-release only (immediate return to water)",
            "Artificial flies and lures only; selective gear rules in effect",
            "No motorized watercraft permitted in canyon section",
        ],
    ),
    "enchantment-crystal-lakes": FishingLocationModel(
        location_id="enchantment-crystal-lakes",
        name="Enchantments Crystal Tarns",
        region="Alpine Lakes Wilderness",
        state="WA",
        elevation_ft=6800,
        water_type="alpine_lake",
        target_species=["golden_trout", "westside_cutthroat"],
        recommended_rod_wt=3,
        recommended_tippet="9ft 5X - 6X",
        active_hatches=["midge_chironomid", "terrestrial_hopper"],
        catch_and_release=True,
        barbless_required=True,
        description=(
            "Crystal-clear glacial cirques perched among granite spires, supporting wild California golden "
            "trout and cutthroat feeding on midges and alpine windfalls."
        ),
        regulations=[
            "Single barbless hooks required",
            "Catch-and-release only (immediate return to water)",
            "Wilderness overnight permit required for camp access",
            "Pack out all monofilament leaders and tippet trimmings",
        ],
    ),
    "deschutes-warm-springs": FishingLocationModel(
        location_id="deschutes-warm-springs",
        name="Lower Deschutes River",
        region="Central Oregon High Desert",
        state="OR",
        elevation_ft=1500,
        water_type="tailwater",
        target_species=["rainbow_trout", "bull_trout"],
        recommended_rod_wt=6,
        recommended_tippet="9ft 3X - 4X",
        active_hatches=["stonefly_salmonfly", "caddis_elk_hair"],
        catch_and_release=False,
        barbless_required=True,
        description=(
            "Powerful tailwater famous for native redband rainbow trout and predatory bull trout hiding "
            "in deep current breaks below Warm Springs."
        ),
        regulations=[
            "Single barbless hooks required",
            "Artificial flies and lures only",
            "No fishing from floating devices; bank wading only",
            "Tribal boundary permits required when anchoring or wading east bank",
        ],
    ),
    "metolius-headwaters": FishingLocationModel(
        location_id="metolius-headwaters",
        name="Metolius River Springs",
        region="Cascade Range / Camp Sherman",
        state="OR",
        elevation_ft=2900,
        water_type="spring_creek",
        target_species=["bull_trout", "rainbow_trout"],
        recommended_rod_wt=4,
        recommended_tippet="12ft 6X",
        active_hatches=["mayfly_callibaetis", "caddis_elk_hair"],
        catch_and_release=True,
        barbless_required=True,
        description=(
            "Ultra-clear, spring-fed sanctuary flowing icy 48°F year-round, requiring hyper-delicate dry "
            "fly presentations to fool wary wild rainbow and apex bull trout."
        ),
        regulations=[
            "Single barbless hooks required",
            "Catch-and-release only (immediate return to water)",
            "Strictly fly fishing only with barbless artificial flies",
            "No wading within 50ft of sensitive gravel spawning redds",
        ],
    ),
    "snake-river-grand-teton": FishingLocationModel(
        location_id="snake-river-grand-teton",
        name="Upper Snake River Headwaters",
        region="Grand Teton / Yellowstone",
        state="WY",
        elevation_ft=6700,
        water_type="freestone_river",
        target_species=["westside_cutthroat"],
        recommended_rod_wt=5,
        recommended_tippet="9ft 4X",
        active_hatches=["terrestrial_hopper", "mayfly_callibaetis"],
        catch_and_release=True,
        barbless_required=True,
        description=(
            "Majestic freestone river snaking beneath the Cathedral Group, offering world-class dry-fly "
            "angling for fine-spotted Snake River and westslope cutthroat trout."
        ),
        regulations=[
            "Single barbless hooks required",
            "Catch-and-release only (immediate return to water)",
            "Grand Teton National Park fishing permit required",
            "Felt-soled wading boots strictly prohibited to prevent invasive mudsnail spread",
        ],
    ),
}

DEFAULT_FLY_FISHING_GEAR: list[FlyFishingGearRequirement] = [
    FlyFishingGearRequirement(
        item_id="barbless-fly-box",
        name="Barbless hooks fly selection & silicone fly box",
        category="terminal_tackle",
        mandatory=True,
        purpose="Minimizes tissue damage and allows rapid, stress-free fish release.",
    ),
    FlyFishingGearRequirement(
        item_id="rubber-mesh-net",
        name="Knotless rubber mesh catch-and-release net (preserves fish slime coating)",
        category="conservation",
        mandatory=True,
        purpose="Crucial for keeping fish wet and preserving the protective mucous barrier.",
    ),
    FlyFishingGearRequirement(
        item_id="hemostats-forceps",
        name="Hemostats / forceps with line cutter for gentle hook removal",
        category="tools",
        mandatory=True,
        purpose="Allows swift hook extraction without squeezing the trout vitals or gills.",
    ),
    FlyFishingGearRequirement(
        item_id="tippet-spools",
        name="Fluorocarbon / nylon tippet spools (3X through 6X)",
        category="terminal_tackle",
        mandatory=True,
        purpose="Low-refraction fluorocarbon for crystal alpine tarns and ultra-clear spring creeks.",
    ),
    FlyFishingGearRequirement(
        item_id="wading-safety",
        name="Quick-release wading belt & studded wading boots (swiftwater safety)",
        category="wading_safety",
        mandatory=True,
        purpose="Prevents catastrophic wader inundation in powerful canyon currents.",
    ),
    FlyFishingGearRequirement(
        item_id="polarized-eyewear",
        name="Polarized eye protection with floating lanyard",
        category="tools",
        mandatory=True,
        purpose="Cuts surface glare to spot submerged structure and protects eyes from errant hook casts.",
    ),
]

CONSERVATION_REGULATIONS_LIST: list[str] = [
    "Single barbless hooks required across all catch-and-release fisheries.",
    "Keep fish wet: unhook fish in the water and avoid removing them completely.",
    "Use knotless rubber mesh nets to prevent removing protective trout slime coat.",
    "Pinch all barbs flat before casting to minimize tissue damage.",
    "Never wade across visible gravel redds during trout spawning periods.",
    "Felt-soled wading boots prohibited to prevent aquatic invasive mudsnail transfer.",
    "Hoot Owl Protocol: Suspend angling when water temperatures exceed 65°F to prevent trout mortality.",
    "Pack out 100% of discarded monofilament and fluorocarbon tippet scraps.",
]

BARBLESS_RULES: list[str] = [
    "Barbless or de-barbed hooks must be used at all designated selective gear fisheries.",
    "Pinch hooks flat with hemostats or pliers before knotting to leader.",
    "Allows smooth hook removal without handling trout out of water.",
]

FLY_FISHING_LNT_RULES: list[str] = [
    "Keep wild trout in water while releasing; wet hands before touching fish.",
    "Do not drag fish onto gravel, dry rock, or forest floor.",
    "Pack out all clipped tippet trimmings and monofilament leaders in secure trash containers.",
    "Clean, drain, and dry all wading gear to eliminate invasive didymo algae and mudsnails.",
]


def get_fishing_locations(
    water_type: Optional[str] = None,
    state: Optional[str] = None,
) -> list[FishingLocationModel]:
    results = list(DEFAULT_FISHING_LOCATIONS.values())
    if water_type:
        target_wt = water_type.strip().lower()
        results = [loc for loc in results if loc.water_type.lower() == target_wt]
    if state:
        target_st = state.strip().upper()
        results = [loc for loc in results if loc.state.upper() == target_st]
    return results


def get_fishing_location_by_id(location_id: str) -> Optional[FishingLocationModel]:
    return DEFAULT_FISHING_LOCATIONS.get(location_id)


def get_fly_fishing_gear() -> list[FlyFishingGearRequirement]:
    return DEFAULT_FLY_FISHING_GEAR


def get_fly_fishing_gear_and_regulations() -> FlyFishingGearRegulationsResponse:
    gear = get_fly_fishing_gear()
    return FlyFishingGearRegulationsResponse(
        gear=gear,
        mandatory_gear=[g for g in gear if g.mandatory],
        regulations=CONSERVATION_REGULATIONS_LIST,
        barbless_rules=BARBLESS_RULES,
        leave_no_trace_rules=FLY_FISHING_LNT_RULES,
        conservation_ethics=CONSERVATION_REGULATIONS_LIST,
    )


def calculate_fly_match(req: FlyMatchRequest) -> FlyMatchResponse:
    location = get_fishing_location_by_id(req.location_id)
    if not location:
        raise ValueError(f"Unknown fishing location ID: {req.location_id}")

    # Determine fish activity
    if req.water_temp_f > 65.0 or req.water_temp_f < 45.0:
        fish_activity = "low"
    elif 50.0 <= req.water_temp_f <= 62.0:
        fish_activity = "high"
    else:
        fish_activity = "moderate"

    # Thermal warning threshold
    thermal_warning = (
        "Hoot Owl Alert: Water temperature exceeds 65°F. Cease fishing during afternoon hours to protect native trout from thermal stress."
        if req.water_temp_f > 65.0
        else None
    )

    # Hatch matching and presentation
    suggested_fly = "Parachute Adams"
    fly_size = "#14 - #16"
    presentation = "Dead-drift dry fly presentation along foam lines and bubble seams"
    tippet_size = location.recommended_tippet

    if req.surface_activity == "rising":
        if "stonefly_salmonfly" in location.active_hatches:
            suggested_fly = "Chubby Chernobyl / Salmonfly Dry"
            fly_size = "#6 - #8"
        elif "terrestrial_hopper" in location.active_hatches:
            suggested_fly = "Morrish Hopper / Dave's Hopper"
            fly_size = "#8 - #12"
        elif "caddis_elk_hair" in location.active_hatches:
            suggested_fly = "Elk Hair Caddis / Goddard Caddis"
            fly_size = "#14 - #16"
        elif "mayfly_callibaetis" in location.active_hatches:
            suggested_fly = "Callibaetis Cripple / Parachute Adams"
            fly_size = "#14 - #18"
        elif "midge_chironomid" in location.active_hatches:
            suggested_fly = "Griffith's Gnat / Adult Midge Cluster"
            fly_size = "#18 - #22"
        presentation = "Dead-drift dry fly presentation along foam lines, bubble lanes, and glassy bank seams"
    elif req.surface_activity == "subsurface_feeding":
        if "midge_chironomid" in location.active_hatches:
            suggested_fly = "Zebra Midge / Chromie Chironomid Pupa"
            fly_size = "#16 - #20"
        elif "stonefly_salmonfly" in location.active_hatches:
            suggested_fly = "Pat's Rubber Legs / 20 Incher Stone"
            fly_size = "#8 - #10"
        elif "mayfly_callibaetis" in location.active_hatches:
            suggested_fly = "Beadhead Flashback Hare's Ear / Callibaetis Nymph"
            fly_size = "#14 - #16"
        else:
            suggested_fly = "Beadhead Prince Nymph / Copper John"
            fly_size = "#14 - #16"
        presentation = "Suspended indicator nymphing or drop-shot euro-nymphing through riffles and tail-outs"
        tippet_size = "9ft 5X Fluorocarbon"
    else:  # deep_pool
        suggested_fly = "Conehead Woolly Bugger / Sculpin Streamer"
        fly_size = "#4 - #8"
        presentation = "Cross-current swing with pulsed streamer strips into deep plunge pools and undercut cutbanks"
        tippet_size = "7.5ft 3X - 4X Abrasion-Resistant Tippet"

    # Regulations summary
    regulations_summary: list[str] = []
    if location.barbless_required:
        regulations_summary.append("Single barbless hooks required")
    if location.catch_and_release:
        regulations_summary.append("Catch-and-release only (immediate return to water)")
    for reg in location.regulations:
        if reg not in regulations_summary:
            regulations_summary.append(reg)

    return FlyMatchResponse(
        location_id=location.location_id,
        location_name=location.name,
        suggested_fly=suggested_fly,
        fly_size=fly_size,
        presentation=presentation,
        tippet_size=tippet_size,
        fish_activity=fish_activity,
        thermal_warning=thermal_warning,
        regulations_summary=regulations_summary,
    )


def detect_fly_fishing_intent(query: str) -> Optional[FlyFishingIntent]:
    q = query.lower()

    # Domain exclusions: do not hijack general outdoor queries
    exclusion_patterns = [
        r"\bwater\s+filter(?:ing|ation)?\b",
        r"\bfilter\s+bottle\b",
        r"\bwater\s+purification\b",
        r"\bhot\s+spring(?:s)?\b",
        r"\bgeothermal\b",
        r"\bsoaking\s+pool\b",
        r"\bcampfire\b",
        r"\bfire\s+(?:ban|ring|safety)\b",
        r"\bclimbing\s+shoe(?:s)?\b",
        r"\bbouldering\b",
        r"\btrail\s+run(?:ning)?\b",
        r"\bultramarathon\b",
        r"\breturn\s+label\b",
        r"\border\s*#?\d+\b",
        r"\brefund\b",
    ]
    if any(re.search(pat, q) for pat in exclusion_patterns):
        return None

    # Whitewater / rafting / kayaking exclusion unless explicit fly fishing context
    if any(k in q for k in ["rafting", "whitewater", "paddle", "kayak"]):
        if not any(k in q for k in ["fly fish", "fly-fish", "angling", "fly rod", "tippet", "hatch"]):
            return None

    # Critical disambiguation: require specific fly fishing / angling keywords
    specific_keywords = [
        "fly fishing",
        "fly fish",
        "fly-fishing",
        "fly-fish",
        "mountain angling",
        "alpine angling",
        "trout fishing",
        "alpine lake fishing",
        "cutthroat",
        "golden trout",
        "bull trout",
        "rainbow trout",
        "brook trout",
        "hatch chart",
        "mayfly",
        "mayflies",
        "caddis",
        "stonefly",
        "stoneflies",
        "midge",
        "midges",
        "chironomid",
        "yakima river fishing",
        "deschutes fly fishing",
        "metolius fishing",
        "snake river angling",
        "snake river fishing",
        "fly rod",
        "tippet size",
        "barbless hooks",
        "barbless hook",
        "catch and release trout",
        "water temperature limits for trout",
        "thermal stress for trout",
        "hoot owl",
    ]

    has_specific_keyword = any(k in q for k in specific_keywords)
    if not has_specific_keyword:
        return None

    # Detect Location ID
    location_id: Optional[str] = None
    if any(k in q for k in ["upper yakima", "yakima river", "yakima canyon", "yakima"]):
        location_id = "upper-yakima-canyon"
    elif any(k in q for k in ["enchantment", "crystal tarns", "crystal lakes"]):
        location_id = "enchantment-crystal-lakes"
    elif any(k in q for k in ["deschutes", "warm springs"]):
        location_id = "deschutes-warm-springs"
    elif any(k in q for k in ["metolius", "camp sherman"]):
        location_id = "metolius-headwaters"
    elif any(k in q for k in ["snake river", "grand teton"]):
        location_id = "snake-river-grand-teton"

    # Detect Water Type
    water_type: Optional[str] = None
    if "alpine lake" in q or "alpine tarn" in q or "tarn" in q:
        water_type = "alpine_lake"
    elif "freestone" in q:
        water_type = "freestone_river"
    elif "spring creek" in q or "spring-fed" in q:
        water_type = "spring_creek"
    elif "tailwater" in q:
        water_type = "tailwater"
    elif "high gradient" in q:
        water_type = "high_gradient_stream"

    # Detect Target Species
    target_species: Optional[str] = None
    if "cutthroat" in q or "westslope" in q:
        target_species = "westside_cutthroat"
    elif "golden trout" in q:
        target_species = "golden_trout"
    elif "bull trout" in q:
        target_species = "bull_trout"
    elif "rainbow trout" in q or "redband" in q:
        target_species = "rainbow_trout"
    elif "brook trout" in q:
        target_species = "brook_trout"

    # Determine Action
    gear_keywords = [
        "gear",
        "tackle",
        "regulation",
        "regulations",
        "rules",
        "barbless",
        "mesh net",
        "rubber net",
        "forceps",
        "hemostat",
        "wading belt",
        "wading safety",
        "ethics",
        "conservation",
        "lnt",
        "leave no trace",
        "felt sole",
    ]
    fly_match_keywords = [
        "fly match",
        "match the hatch",
        "suggested fly",
        "which fly",
        "hatch chart",
        "hatches",
        "water temp",
        "temperature",
        "hoot owl",
        "thermal",
        "presentation",
        "dry fly",
        "nymph",
        "streamer",
        "rising",
        "subsurface",
    ]

    has_gear_keyword = any(k in q for k in gear_keywords)
    has_fly_match_keyword = any(k in q for k in fly_match_keywords) or bool(
        re.search(r"\bwhat\s+fly\s+(?:should|to|do|pattern|is)\b", q)
        or re.search(r"\bwhich\s+fly\b", q)
    )

    if has_gear_keyword and not has_fly_match_keyword:
        action = "gear_regulations"
    elif has_fly_match_keyword:
        action = "fly_match"
    elif location_id and any(
        k in q
        for k in [
            "detail",
            "tell me about",
            "about",
            "guide",
            "elevation",
            "water type",
            "species",
            "target species",
            "info",
        ]
    ):
        action = "location_detail"
    elif has_gear_keyword:
        action = "gear_regulations"
    else:
        action = "locations_list"

    return FlyFishingIntent(
        action=action,
        location_id=location_id,
        water_type=water_type,
        target_species=target_species,
    )


def build_fly_fishing_prompt(intent: FlyFishingIntent) -> str:
    lines = [
        "Contoso Outdoors Alpine Fly Fishing & Mountain Angling Grounding:",
        f"- Detected Intent Action: {intent.action.upper()}",
    ]

    if intent.location_id:
        loc = get_fishing_location_by_id(intent.location_id)
        if loc:
            lines.extend(
                [
                    f"- Featured Fishing Water: {loc.name} ({loc.region}, {loc.state}) [ID: {loc.location_id}]",
                    f"  * Elevation: {loc.elevation_ft} ft | Water Type: {loc.water_type}",
                    f"  * Target Species: {', '.join(loc.target_species)}",
                    f"  * Tackle Recommendation: {loc.recommended_rod_wt}-weight rod, {loc.recommended_tippet} leader/tippet",
                    f"  * Active Hatches: {', '.join(loc.active_hatches)}",
                    f"  * Catch and Release: {'Strictly Catch & Release' if loc.catch_and_release else 'Standard selective harvest'}",
                    f"  * Single Barbless Required: {loc.barbless_required}",
                    f"  * Description: {loc.description}",
                    "  * Water Regulations:",
                    *[f"    - {r}" for r in loc.regulations],
                ]
            )
    else:
        lines.append("- Mountain Angling Waters Catalog:")
        for w in get_fishing_locations(water_type=intent.water_type):
            lines.append(
                f"  * {w.name} [{w.location_id}]: {w.state}, {w.elevation_ft}ft, {w.water_type}, "
                f"species: {', '.join(w.target_species)}, rod: {w.recommended_rod_wt}wt, "
                f"C&R: {w.catch_and_release}, barbless: {w.barbless_required}"
            )

    lines.extend(
        [
            "",
            "- Mandatory Conservation Tackle & Angling Gear:",
            *[f"  * {g.name} [{g.category}]: {g.purpose}" for g in get_fly_fishing_gear()],
            "",
            "- Coldwater Trout Conservation Ethics & Thermal Stress Protocols:",
            "  * Keep Fish Wet: Always unhook fish in the water; never lift wild trout out for prolonged photos.",
            "  * Knotless Rubber Mesh Nets: Preserves the protective slime coating essential for pathogen defense.",
            "  * Single Barbless Hooks: Mandatory across selective waters; crush barbs flat with hemostats.",
            "  * Hoot Owl Protocol: Water temperatures >65°F cause severe trout mortality from thermal exhaustion; cease afternoon angling.",
            "  * Invasive Species Prevention: Felt-soled wading boots prohibited; clean, drain, and dry all gear.",
            "  * Redds Protection: Do not wade through or trample clean gravel trout spawning redds.",
            "",
            "Assistant Guidance:",
            "- Ground answers directly in the water specifications, hatch matches, and conservation ethics above.",
            "- Always emphasize coldwater trout conservation ethics, barbless hooks, keeping fish wet, and water temperature safety.",
        ]
    )

    return "\n".join(lines)


def format_fly_fishing_response(intent: FlyFishingIntent) -> dict[str, Any]:
    if intent.action == "gear_regulations":
        gear = get_fly_fishing_gear()
        gear_summary = "; ".join(f"{g.name} ({g.purpose})" for g in gear)
        answer = (
            f"Mandatory Fly Fishing Tackle & Trout Conservation Regulations: "
            f"Essential tackle includes {gear_summary}. "
            f"All selective waters require single barbless hooks and catch-and-release practices. "
            f"Always keep wild trout wet, avoid wading through spawning redds, and cease fishing if water temps exceed 65°F."
        )
        return {
            "answer": answer,
            "fly_fishing_info": {
                "action": "gear_regulations",
                "location_id": intent.location_id,
                "gear": [g.model_dump() for g in gear],
                "regulations": list(CONSERVATION_REGULATIONS_LIST),
                "barbless_rules": list(BARBLESS_RULES),
                "leave_no_trace_rules": list(FLY_FISHING_LNT_RULES),
            },
        }

    if intent.action == "fly_match":
        target_id = intent.location_id or "upper-yakima-canyon"
        try:
            match_res = calculate_fly_match(
                FlyMatchRequest(
                    location_id=target_id,
                    water_temp_f=54.0,
                    time_of_day="midday",
                    surface_activity="rising",
                )
            )
            thermal_txt = f" {match_res.thermal_warning}" if match_res.thermal_warning else ""
            answer = (
                f"Fly Match Advisory for {match_res.location_name}: Suggested pattern is {match_res.suggested_fly} "
                f"(size {match_res.fly_size}) on {match_res.tippet_size} tippet. "
                f"Presentation: {match_res.presentation}. Fish activity is {match_res.fish_activity}.{thermal_txt}"
            )
            return {
                "answer": answer,
                "fly_fishing_info": {
                    "action": "fly_match",
                    "location_id": match_res.location_id,
                    "location_name": match_res.location_name,
                    "suggested_fly": match_res.suggested_fly,
                    "fly_size": match_res.fly_size,
                    "presentation": match_res.presentation,
                    "tippet_size": match_res.tippet_size,
                    "fish_activity": match_res.fish_activity,
                    "thermal_warning": match_res.thermal_warning,
                    "regulations_summary": match_res.regulations_summary,
                    "match": match_res.model_dump(),
                },
            }
        except ValueError:
            pass

    if intent.action == "location_detail" and intent.location_id:
        loc = get_fishing_location_by_id(intent.location_id)
        if loc:
            hatches = ", ".join(loc.active_hatches)
            species = ", ".join(loc.target_species)
            answer = (
                f"{loc.name} ({loc.region}, {loc.state}): Elevation {loc.elevation_ft}ft, water type {loc.water_type}. "
                f"Target species: {species}. Recommended tackle: {loc.recommended_rod_wt}wt rod with {loc.recommended_tippet} tippet. "
                f"Active hatches: {hatches}. {loc.description} Regulations: {'; '.join(loc.regulations)}."
            )
            return {
                "answer": answer,
                "fly_fishing_info": {
                    "action": "location_detail",
                    "location_id": loc.location_id,
                    "location": loc.model_dump(),
                },
            }

    # Default to locations_list
    locations = get_fishing_locations(water_type=intent.water_type)
    locs_summary = "; ".join(
        f"{loc.name} ({loc.state}, {loc.elevation_ft}ft, {loc.recommended_rod_wt}wt rod)"
        for loc in locations
    )
    answer = (
        f"Featured alpine and mountain angling waters: {locs_summary}. "
        f"Ask about specific water hatches, fly matching, thermal water temperatures, or barbless tackle rules."
    )
    return {
        "answer": answer,
        "fly_fishing_info": {
            "action": "locations_list",
            "location_id": intent.location_id,
            "water_type": intent.water_type,
            "target_species": intent.target_species,
            "locations": [loc.model_dump() for loc in locations],
        },
    }
