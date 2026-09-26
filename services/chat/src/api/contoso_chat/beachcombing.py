import re
from typing import Any, Optional

from pydantic import BaseModel


class BeachcombingSiteModel(BaseModel):
    site_id: str
    title: str
    region: str
    coastline: str
    elevation_m: int
    shoreline_type: str  # gravel_pebble_cove, rocky_intertidal_shelf, barrier_island_sandspit, high_energy_boulder_strand
    primary_glass_colors: list[str]
    typical_tidal_range_m: float
    storm_deposit_index: float
    access_difficulty: str
    description: str
    highlights: list[str]


class BeachcombingRequest(BaseModel):
    site_id: str = "glass-beach-fort-bragg"
    search_hours: float = 3.0
    tidal_drop_m: float = 2.5
    storm_surge_days_ago: int = 3
    tumble_energy: str = "extreme_ocean_surf"


class BeachcombingResponse(BaseModel):
    site_id: str
    site_title: str
    expected_yield_pieces: int
    patina_quality_grade: str  # raw_sharp_break, early_frosting, smooth_frosted_gem, ancient_c_fractured_frost
    patina_rating_percent: int
    optimal_foraging_status: str  # prime_low_tide_wrack_window, suboptimal_slack_scour, hazard_rising_tide_pinch
    rarity_odds: str
    tide_safety_advisory: str
    conservation_advisory: str


class BeachcombingGearItemModel(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class BeachcombingIntent(BaseModel):
    action: str  # sites_list, site_detail, calculate_beachcombing, gear_checklist
    site_id: Optional[str] = None
    shoreline_type: Optional[str] = None


class FormattedBeachcombingResponse(dict):
    def __init__(self, answer: str, data: dict[str, Any]):
        super().__init__(data)
        self.answer = answer

    def __str__(self) -> str:
        return self.answer


BEACHCOMBING_SITES: dict[str, BeachcombingSiteModel] = {
    "glass-beach-fort-bragg": BeachcombingSiteModel(
        site_id="glass-beach-fort-bragg",
        title="Glass Beach & MacKerricher Coves",
        region="Mendocino County, CA",
        coastline="Pacific Northern California",
        elevation_m=4,
        shoreline_type="gravel_pebble_cove",
        primary_glass_colors=["Cobalt Blue", "Seafoam Green", "Amber", "Ruby Red"],
        typical_tidal_range_m=2.1,
        storm_deposit_index=8.4,
        access_difficulty="easy_beach_stroll",
        description="Legendary Pacific shingle cove renowned for high concentrations of smoothed historic glass gems tumbled by continuous wave energy.",
        highlights=[
            "Centuries of continuous Pacific wave action creating micro-fractured frosted pebbles",
            "Rare ruby red lantern glass and cobalt medicinal bottle fragments",
            "MacKerricher State Park boundary tide pool sanctuaries",
        ],
    ),
    "kodiak-island-monashka": BeachcombingSiteModel(
        site_id="kodiak-island-monashka",
        title="Monashka Bay & Mill Bay Strands",
        region="Kodiak Island, AK",
        coastline="Gulf of Alaska",
        elevation_m=2,
        shoreline_type="high_energy_boulder_strand",
        primary_glass_colors=["Japanese Glass Floats", "Forest Green", "Aqua Aqua"],
        typical_tidal_range_m=3.8,
        storm_deposit_index=9.6,
        access_difficulty="moderate_tide_walk",
        description="Subarctic boulder-strewn shoreline facing intense North Pacific storms that wash ashore authentic glass fishing floats and heavy marine flotsam.",
        highlights=[
            "North Pacific storm deposit drift line yielding authentic hand-blown Japanese fishing floats",
            "Heavy boulder gravel surf sorting thick maritime glassware",
            "Extreme tidal variations uncovering sub-tidal wrack shelves",
        ],
    ),
    "cape-may-point-flotsam": BeachcombingSiteModel(
        site_id="cape-may-point-flotsam",
        title="Cape May Point & Sunset Beach",
        region="Cape May County, NJ",
        coastline="Atlantic Mid-Atlantic",
        elevation_m=1,
        shoreline_type="barrier_island_sandspit",
        primary_glass_colors=["Cape May Diamonds (Quartz)", "Olive Wine", "Depression Vaseline"],
        typical_tidal_range_m=1.6,
        storm_deposit_index=7.2,
        access_difficulty="easy_beach_stroll",
        description="Dynamic Delaware Bay convergence spit near the historic concrete ship wreck, rich in quartz pebbles, antique olive wine glass, and fluorescent UV uranium glass.",
        highlights=[
            "Delaware Bay rip-current gravel deposits washing against Sunset Beach",
            "Intertidal finds including UV-reactive depression vaseline glass and quartz Cape May diamonds",
            "Broad sandy barrier spits ideal for sweeping 365nm UV night walks",
        ],
    ),
    "olympic-ruby-beach": BeachcombingSiteModel(
        site_id="olympic-ruby-beach",
        title="Ruby Beach & Destruction Island Drift",
        region="Olympic National Park, WA",
        coastline="Pacific Northwest Wilderness",
        elevation_m=3,
        shoreline_type="rocky_intertidal_shelf",
        primary_glass_colors=["Seafoam", "Smoky Quartz", "Teal Floats"],
        typical_tidal_range_m=3.2,
        storm_deposit_index=9.1,
        access_difficulty="rugged_coastal_scramble",
        description="Wild Olympic sea stack coast backed by monumental driftwood sea walls, receiving powerful North Pacific swell and marine debris.",
        highlights=[
            "Dramatic sea stacks and intertidal surge channels trapping deep-sea drift glass",
            "Garnet-tinted ruby sand deposits mingled with frosted seafoam glassware",
            "Pristine wilderness intertidal shelves accessible only during negative spring tides",
        ],
    ),
    "monhegan-island-lobsterman": BeachcombingSiteModel(
        site_id="monhegan-island-lobsterman",
        title="Monhegan Island Pebble Shingle Coves",
        region="Lincoln County, ME",
        coastline="Gulf of Maine",
        elevation_m=5,
        shoreline_type="gravel_pebble_cove",
        primary_glass_colors=["Deep Cobalt", "Amethyst Sun-Purple", "Black Glass Rum"],
        typical_tidal_range_m=3.0,
        storm_deposit_index=8.8,
        access_difficulty="boat_access_only",
        description="Remote offshore Maine island surrounded by cold North Atlantic rollers, boasting deep pebble shingle beaches holding 19th-century black glass and sun-purpled manganese bottles.",
        highlights=[
            "Offshore island granite shingle coves with aggressive Atlantic rolling pebble tumblers",
            "Rare dark olive black glass from 1800s rum bottles and manganese solarized purple glass",
            "Isolated boat-access wilderness shoreline free from commercial beach harvesting",
        ],
    ),
}

MANDATORY_BEACHCOMBING_GEAR: list[BeachcombingGearItemModel] = [
    BeachcombingGearItemModel(
        item_id="uv-blacklight-365nm",
        name="365nm Longwave UV Blacklight Torch",
        category="illumination",
        mandatory=True,
        purpose="Fluoresces uranium vaseline glass and manganese sun-purple patina on night low tides.",
    ),
    BeachcombingGearItemModel(
        item_id="sand-mesh-sifting-scoop",
        name="Marine Stainless Steel Sand-Sifting Mesh Scoop",
        category="container",
        mandatory=True,
        purpose="Quickly drains sand and brine while retaining smoothed pebbles and sea glass gems.",
    ),
    BeachcombingGearItemModel(
        item_id="neoprene-high-traction-tide-booties",
        name="5mm Neoprene Kevlar-Sole Intertidal Wading Boots",
        category="footwear",
        mandatory=True,
        purpose="Protects against barnacles and sharp rocky intertidal ledges with high-traction soles.",
    ),
    BeachcombingGearItemModel(
        item_id="jewelers-loupe-caliper-set",
        name="10x Achromatic Jeweler's Loupe & Brass Millimeter Gauge",
        category="measurement",
        mandatory=True,
        purpose="Inspects C-shaped hydration micro-fractures, air bubbles, and frosted surface aging.",
    ),
    BeachcombingGearItemModel(
        item_id="padded-compartment-finds-case",
        name="Shockproof Hydro-Sealed Divided Glass Specimen Case",
        category="optics",
        mandatory=True,
        purpose="Protects delicate frosted glass gems from rubbing or fracturing during shoreline treks.",
    ),
    BeachcombingGearItemModel(
        item_id="intertidal-tide-clock-tide-table",
        name="Barometric Intertidal Tide Clock & Emergency Signal Mirror",
        category="safety",
        mandatory=True,
        purpose="Monitors ebb tide windows and alerts to advancing flood tides to prevent headland cutoffs.",
    ),
]


def get_beachcombing_sites(shoreline_type: Optional[str] = None) -> list[BeachcombingSiteModel]:
    sites = list(BEACHCOMBING_SITES.values())
    if not shoreline_type:
        return sites
    norm = shoreline_type.strip().lower().replace("-", "_").replace(" ", "_")
    return [s for s in sites if s.shoreline_type.lower() == norm]


def get_beachcombing_site(site_id: str) -> Optional[BeachcombingSiteModel]:
    return BEACHCOMBING_SITES.get(site_id.strip().lower())


def get_beachcombing_gear() -> list[BeachcombingGearItemModel]:
    return list(MANDATORY_BEACHCOMBING_GEAR)


def calculate_beachcombing(req: BeachcombingRequest) -> BeachcombingResponse:
    site = get_beachcombing_site(req.site_id)
    if not site:
        raise ValueError(f"Beachcombing site '{req.site_id}' not found")

    expected_yield_pieces = max(
        1,
        int(round(req.search_hours * 3.5 * (site.storm_deposit_index / 5.0) * (req.tidal_drop_m / 2.0))),
    )

    if req.tumble_energy == "extreme_ocean_surf" and req.storm_surge_days_ago >= 3:
        patina_grade = "ancient_c_fractured_frost"
        patina_rating = 95
    elif req.tumble_energy == "moderate_bay" or req.storm_surge_days_ago >= 2:
        patina_grade = "smooth_frosted_gem"
        patina_rating = 80
    else:
        patina_grade = "early_frosting"
        patina_rating = 55

    if req.tidal_drop_m >= 2.0 and req.storm_surge_days_ago <= 5:
        foraging_status = "prime_low_tide_wrack_window"
    elif req.storm_surge_days_ago > 8:
        foraging_status = "suboptimal_slack_scour"
    else:
        foraging_status = "hazard_rising_tide_pinch"

    rarity_odds = (
        "1:100 for Cobalt Blue & Ruby Red, 1:25 for Seafoam Green & Amber, "
        "1:500 for Vaseline Uranium Glass & Antique Glass Floats."
    )

    if foraging_status == "hazard_rising_tide_pinch":
        tide_safety_advisory = (
            "HAZARD: Rising tide pinch risk. Rapidly advancing flood tide along rocky headlands "
            "threatens to cut off egress. Maintain line-of-sight to escape routes and ascend above high-water line."
        )
    elif foraging_status == "prime_low_tide_wrack_window":
        tide_safety_advisory = (
            f"OPTIMAL: Prime low tide wrack window active with {req.tidal_drop_m:.1f}m tidal drop. "
            "Forage the freshly exposed wet gravel line 1 to 2 hours prior to minimum low slack."
        )
    else:
        tide_safety_advisory = (
            f"CAUTION: Suboptimal scour conditions ({req.storm_surge_days_ago} days post-surge). "
            "Wave turbulence has shifted fine gravels into sand banks; concentrate search along coarse drift deposits."
        )

    conservation_advisory = (
        "Coastal Conservation Advisory: Practice ethical intertidal beachcombing. Observe local park regulations, "
        "leave historical cultural artifacts in situ, protect nesting shorebirds and sensitive kelp holdfasts, "
        "and pack out plastic marine debris."
    )

    return BeachcombingResponse(
        site_id=site.site_id,
        site_title=site.title,
        expected_yield_pieces=expected_yield_pieces,
        patina_quality_grade=patina_grade,
        patina_rating_percent=patina_rating,
        optimal_foraging_status=foraging_status,
        rarity_odds=rarity_odds,
        tide_safety_advisory=tide_safety_advisory,
        conservation_advisory=conservation_advisory,
    )


def detect_beachcombing_intent(message: str) -> Optional[BeachcombingIntent]:
    if not message or not message.strip():
        return None

    q = message.lower()

    exclusions = [
        "order #",
        "refund",
        "return label",
        "shipping tracking",
        "dogsled",
        "snowshoe",
        "trapping",
        "gold pan",
        "gold panning",
        "rentals",
        "rental",
    ]
    if any(ex in q for ex in exclusions):
        return None

    regex_keywords = [
        r"\bsea\s+glass\b",
        r"\bbeachcomb(?:ing|er|ers)?\b",
        r"\bflotsam\b",
        r"\bjetsam\b",
        r"\bwrack\s+line\b",
        r"\bintertidal\s+forag(?:ing|e)\b",
        r"\bglass\s+floats?\b",
        r"\bvaseline\s+glass\b",
        r"\bhydration\s+patina\b",
        r"\btidal\s+drop\b",
        r"\bglass\s+beach\b",
    ]

    if not any(re.search(pat, q) for pat in regex_keywords):
        return None

    site_patterns = [
        ("glass beach", "glass-beach-fort-bragg"),
        ("fort bragg", "glass-beach-fort-bragg"),
        ("kodiak", "kodiak-island-monashka"),
        ("monashka", "kodiak-island-monashka"),
        ("cape may", "cape-may-point-flotsam"),
        ("ruby beach", "olympic-ruby-beach"),
        ("destruction island", "olympic-ruby-beach"),
        ("olympic", "olympic-ruby-beach"),
        ("monhegan", "monhegan-island-lobsterman"),
    ]

    matched_site_id: Optional[str] = None
    for pattern, s_id in site_patterns:
        if pattern in q:
            matched_site_id = s_id
            break

    gear_terms = [
        "gear",
        "checklist",
        "equipment",
        "torch",
        "blacklight",
        "uv",
        "mesh scoop",
        "scoop",
        "booties",
        "wading boots",
        "loupe",
        "specimen case",
        "tide clock",
    ]
    has_gear_term = any(gt in q for gt in gear_terms)

    # Shoreline type detection
    shoreline_type: Optional[str] = None
    if "gravel_pebble_cove" in q or "pebble cove" in q or "gravel cove" in q or "pebble coves" in q:
        shoreline_type = "gravel_pebble_cove"
    elif "rocky_intertidal_shelf" in q or "intertidal shelf" in q or "rocky shelf" in q:
        shoreline_type = "rocky_intertidal_shelf"
    elif "barrier_island_sandspit" in q or "barrier island" in q or "sandspit" in q or "sand spit" in q:
        shoreline_type = "barrier_island_sandspit"
    elif "high_energy_boulder_strand" in q or "boulder strand" in q:
        shoreline_type = "high_energy_boulder_strand"

    # Action detection
    calc_terms = [
        "calculate",
        "calculation",
        "expected yield",
        "yield",
        "patina",
        "frosting",
        "tumble energy",
        "storm surge",
        "pieces",
    ]
    if any(ct in q for ct in calc_terms):
        action = "calculate_beachcombing"
    elif has_gear_term:
        action = "gear_checklist"
    elif matched_site_id and not any(term in q for term in ["all sites", "all beaches", "list sites", "list beaches", "catalog", "show me all"]):
        action = "site_detail"
    else:
        action = "sites_list"

    return BeachcombingIntent(
        action=action,
        site_id=matched_site_id,
        shoreline_type=shoreline_type,
    )


def format_beachcombing_response(data: Any, query: str = "") -> FormattedBeachcombingResponse:
    if isinstance(data, BeachcombingResponse):
        calc = data
        answer = (
            f"Sea Glass & Coastal Beachcombing Calculation for {calc.site_title}: "
            f"Expected foraging yield is {calc.expected_yield_pieces} pieces "
            f"with {calc.patina_quality_grade.replace('_', ' ').title()} ({calc.patina_rating_percent}% patina frosting rating). "
            f"Foraging Status: {calc.optimal_foraging_status.replace('_', ' ').title()}. "
            f"Rarity Odds: {calc.rarity_odds} "
            f"Tide Advisory: {calc.tide_safety_advisory} "
            f"Conservation Ethics: {calc.conservation_advisory}"
        )
        calc_info: dict[str, Any] = {
            "action": "calculate_beachcombing",
            "site_id": calc.site_id,
            "calculation": calc.model_dump(),
        }
        return FormattedBeachcombingResponse(
            answer,
            {"beachcombing_info": calc_info, "answer": answer},
        )

    if isinstance(data, dict):
        if "beachcombing_info" in data and "answer" in data:
            return FormattedBeachcombingResponse(str(data["answer"]), data)
        if "action" in data and ("calculation" in data or "site_id" in data):
            action_val = str(data.get("action", "calculate_beachcombing"))
            answer_str = f"Beachcombing action '{action_val}' processed."
            calc_dict_info: dict[str, Any] = data
            return FormattedBeachcombingResponse(
                answer_str,
                {"beachcombing_info": calc_dict_info, "answer": answer_str},
            )
        intent = (
            BeachcombingIntent(**data)
            if "action" in data
            else (detect_beachcombing_intent(query or str(data)) or BeachcombingIntent(action="sites_list"))
        )
    elif isinstance(data, BeachcombingIntent):
        intent = data
    else:
        intent = detect_beachcombing_intent(str(data)) or BeachcombingIntent(action="sites_list")

    if intent.action in ("calculate_beachcombing", "calculate"):
        req = BeachcombingRequest(site_id=intent.site_id or "glass-beach-fort-bragg")
        calc_res = calculate_beachcombing(req)
        answer = (
            f"Sea Glass & Coastal Beachcombing Calculation for {calc_res.site_title}: "
            f"Expected foraging yield is {calc_res.expected_yield_pieces} pieces "
            f"with {calc_res.patina_quality_grade.replace('_', ' ').title()} ({calc_res.patina_rating_percent}% patina frosting rating). "
            f"Foraging Status: {calc_res.optimal_foraging_status.replace('_', ' ').title()}. "
            f"Rarity Odds: {calc_res.rarity_odds} "
            f"Tide Advisory: {calc_res.tide_safety_advisory} "
            f"Conservation Ethics: {calc_res.conservation_advisory}"
        )
        calc_info = {
            "action": "calculate_beachcombing",
            "site_id": calc_res.site_id,
            "calculation": calc_res.model_dump(),
        }
        return FormattedBeachcombingResponse(
            answer,
            {"beachcombing_info": calc_info, "answer": answer},
        )

    if intent.action in ("gear_checklist", "gear"):
        gear = get_beachcombing_gear()
        items_str = "; ".join(f"{g.name} ({g.purpose})" for g in gear)
        answer = (
            f"Mandatory Wilderness Sea Glass & Coastal Beachcombing Gear ({len(gear)} items): {items_str}. "
            "Always inspect intertidal ledges for slick kelp holdfasts and verify negative low tide windows before embarking."
        )
        gear_info: dict[str, Any] = {
            "action": "gear_checklist",
            "gear": [g.model_dump() for g in gear],
            "mandatory_count": len(gear),
        }
        return FormattedBeachcombingResponse(
            answer,
            {"beachcombing_info": gear_info, "answer": answer},
        )

    if intent.action == "site_detail" and intent.site_id:
        site = get_beachcombing_site(intent.site_id)
        if site:
            highlights_str = ", ".join(site.highlights)
            colors_str = ", ".join(site.primary_glass_colors)
            answer = (
                f"Beachcombing Site Detail: {site.title} ({site.region}, {site.coastline}). "
                f"Shoreline: {site.shoreline_type.replace('_', ' ').title()} | Elevation: {site.elevation_m}m | "
                f"Tidal Range: {site.typical_tidal_range_m}m | Storm Deposit Index: {site.storm_deposit_index} | "
                f"Access: {site.access_difficulty.replace('_', ' ').title()}. "
                f"Primary Glass Colors: {colors_str}. {site.description} "
                f"Highlights: {highlights_str}."
            )
            detail_info: dict[str, Any] = {
                "action": "site_detail",
                "site_id": site.site_id,
                "site": site.model_dump(),
            }
            return FormattedBeachcombingResponse(
                answer,
                {"beachcombing_info": detail_info, "answer": answer},
            )

    sites = get_beachcombing_sites(shoreline_type=intent.shoreline_type)
    summary_str = "; ".join(
        f"{s.title} ({s.shoreline_type.replace('_', ' ').title()}, {s.region}, storm deposit index: {s.storm_deposit_index})"
        for s in sites
    )
    answer = (
        f"Contoso Wilderness Sea Glass & Coastal Beachcombing Catalog ({len(sites)} sites): {summary_str}. "
        "Inquire about specific beachcombing coves, mandatory UV and sifting gear, or intertidal yield calculations."
    )
    list_info: dict[str, Any] = {
        "action": "sites_list",
        "shoreline_type": intent.shoreline_type,
        "sites": [s.model_dump() for s in sites],
        "count": len(sites),
    }
    return FormattedBeachcombingResponse(
        answer,
        {"beachcombing_info": list_info, "answer": answer},
    )


def build_beachcombing_prompt(intent: Optional[BeachcombingIntent] = None) -> str:
    lines = [
        "Wilderness Sea Glass & Coastal Beachcombing Foraging Guidance:",
        "- Hydration Patina Frosting Scales: Soda-lime and lead glass undergo chemical leaching where alkali ions (Na+, K+) are replaced by water (H3O+), forming micro-crystalline C-shaped surface fractures and velvet matte frosting over 20-50+ years.",
        "- Coastal Storm Deposit Mechanics: Heavy storms and gale swells mobilize offshore submerged gravel beds, sorting flotsam and glass into intertidal drift lines and depositing them along upper wrack lines during post-surge ebb transitions.",
        "- Tidal Drop Velocity & Wrack Windows: Optimal foraging occurs during peak ebbing tides with a minimum tidal drop of 2.0m, searching the wet swash line 1-2 hours before low slack water. Beware of rising tide pinches along rocky headlands.",
        "- Marine Flotsam vs Jetsam: Flotsam refers to debris accidentally lost or washed overboard from vessels; jetsam refers to cargo deliberately jettisoned to lighten a distressed vessel. Beachcombing wrack lines accumulate both alongside natural kelp and driftwood.",
        "- UV Uranium & Manganese Glass Fluorescence: 365nm UV blacklight causes 19th-early 20th century Depression vaseline glass (containing 2% uranium dioxide) to fluoresce brilliant neon green (530nm), and manganese solarized glass to display faint orange/purple hues.",
        "- 5 Iconic Coastal Beachcombing Sites: Glass Beach & MacKerricher Coves (CA), Monashka Bay & Mill Bay Strands (AK), Cape May Point & Sunset Beach (NJ), Ruby Beach & Destruction Island Drift (WA), Monhegan Island Pebble Shingle Coves (ME).",
        "- Mandatory 6-Item Gear Checklist: 365nm Longwave UV Blacklight Torch, Marine Stainless Steel Sand-Sifting Mesh Scoop, 5mm Neoprene Kevlar-Sole Intertidal Wading Boots, 10x Achromatic Jeweler's Loupe & Brass Millimeter Gauge, Shockproof Hydro-Sealed Divided Glass Specimen Case, Barometric Intertidal Tide Clock & Emergency Signal Mirror.",
    ]
    if intent and intent.site_id:
        site = get_beachcombing_site(intent.site_id)
        if site:
            lines.append(
                f"Target Site: {site.title} ({site.region}, {site.coastline}). Shoreline: {site.shoreline_type}. "
                f"Tidal Range: {site.typical_tidal_range_m}m, Storm Deposit Index: {site.storm_deposit_index}. "
                f"Primary Colors: {', '.join(site.primary_glass_colors)}. Description: {site.description}"
            )
    return "\n".join(lines)


def beachcombing_tool(data: dict[str, Any], query: str = "") -> dict[str, Any]:
    formatted = format_beachcombing_response(data, query=query)
    return dict(formatted)
