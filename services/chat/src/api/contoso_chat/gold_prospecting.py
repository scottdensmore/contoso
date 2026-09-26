import re
from typing import Any, Optional

from pydantic import BaseModel


class ProspectingSiteModel(BaseModel):
    site_id: str
    title: str
    region: str
    river_system: str
    elevation_m: int
    typical_gravel_type: str
    deposit_type: str  # stream_gravel_riffle, inside_bend_gravel_bar, bedrock_crevice, bench_placer_terrace
    max_historical_yield_g_per_ton: float
    access_difficulty: str
    description: str
    highlights: list[str]


class PlacerRequest(BaseModel):
    site_id: str = "american-river-south-fork"
    gravel_volume_buckets: float = 5.0
    sluice_slope_deg: float = 7.0
    stream_flow_velocity_fps: float = 3.5
    separation_method: str = "sluice_box"


class PlacerResponse(BaseModel):
    site_id: str
    site_title: str
    expected_concentrate_grams: float
    recovery_efficiency_percent: int
    sluice_status: str  # optimal_riffle_recovery, underflow_clogging_risk, scour_blowout_velocity
    density_ratio: float
    recovery_advisory: str
    regulatory_advisory: str


class ProspectingGearItemModel(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class ProspectingIntent(BaseModel):
    action: str  # sites_list, site_detail, calculate_placer, gear_checklist
    site_id: Optional[str] = None
    deposit_type: Optional[str] = None


class FormattedProspectingResponse(dict[str, Any]):
    def __init__(self, answer: str, data: dict[str, Any]):
        super().__init__(data)
        self.answer = answer

    def __str__(self) -> str:
        return self.answer


DEFAULT_PROSPECTING_SITES: dict[str, ProspectingSiteModel] = {
    "american-river-south-fork": ProspectingSiteModel(
        site_id="american-river-south-fork",
        title="South Fork American River & Coloma Shallows",
        region="El Dorado County, CA",
        river_system="American River Basin",
        elevation_m=230,
        typical_gravel_type="Cobble & Quartz Gravel Bar",
        deposit_type="inside_bend_gravel_bar",
        max_historical_yield_g_per_ton=4.8,
        access_difficulty="easy_walk_in",
        description="Historic California Gold Rush discovery epicenter at Sutter's Mill with rich inside-bend point bars and quartz cobble paystreaks.",
        highlights=[
            "Historic Discovery Site at Sutter's Mill / Coloma Shallows",
            "Inside river bends with heavy quartz cobble paystreaks",
            "Public recreation panning corridors along BLM river parcels",
        ],
    ),
    "cache-creek-colorado": ProspectingSiteModel(
        site_id="cache-creek-colorado",
        title="Cache Creek Placer Basin & Granite Gulch",
        region="Chaffee County, CO",
        river_system="Arkansas River Basin",
        elevation_m=2850,
        typical_gravel_type="Glacial Till & Granite Boulders",
        deposit_type="bench_placer_terrace",
        max_historical_yield_g_per_ton=3.2,
        access_difficulty="moderate_hike",
        description="High-altitude Rocky Mountain glacial bench placer terrace with coarse gold trapped above granitic false bedrock and heavy black sands.",
        highlights=[
            "Glacial bench gravels perched above Arkansas River canyon",
            "Designated BLM public mineral collecting area",
            "Heavy black magnetic sand concentrations with coarse pickers",
        ],
    ),
    "fairbanks-pedro-creek": ProspectingSiteModel(
        site_id="fairbanks-pedro-creek",
        title="Pedro Creek & Tanana Valley Basin",
        region="Interior Alaska, AK",
        river_system="Tanana River System",
        elevation_m=310,
        typical_gravel_type="Schist & Bedrock Crevice Fractures",
        deposit_type="bedrock_crevice",
        max_historical_yield_g_per_ton=6.5,
        access_difficulty="rugged_canyon_scramble",
        description="Interior Alaska gold rush stream where Felix Pedro discovered coarse nugget gold embedded in decomposed birch creek schist bedrock crevices.",
        highlights=[
            "Decomposed schist bedrock crevices with high coarse nugget retention",
            "Sub-arctic permafrost gravel outwash benches",
            "Historic high-grade placer yield near Felix Pedro discovery monument",
        ],
    ),
    "rogue-river-galice": ProspectingSiteModel(
        site_id="rogue-river-galice",
        title="Galice Creek & Rogue River Canyon",
        region="Josephine County, OR",
        river_system="Rogue River Basin",
        elevation_m=195,
        typical_gravel_type="Metamorphic River Gravels",
        deposit_type="stream_gravel_riffle",
        max_historical_yield_g_per_ton=3.9,
        access_difficulty="moderate_hike",
        description="Rugged Klamath-Siskiyou metamorphic canyon featuring heavy stream gravel riffles and exposed serpentine bedrock trap pockets.",
        highlights=[
            "Dynamic gravel riffles refreshed annually by winter flash runoff",
            "Rich mineralized serpentine and greenstone bedrock traps",
            "Klamath Mountains gold belt placer with flood gold deposits",
        ],
    ),
    "swift-river-new-hampshire": ProspectingSiteModel(
        site_id="swift-river-new-hampshire",
        title="Swift River Glacial Placer Bed",
        region="White Mountains, NH",
        river_system="Saco River Basin",
        elevation_m=380,
        typical_gravel_type="Glacial Outwash & Quartz Sand",
        deposit_type="stream_gravel_riffle",
        max_historical_yield_g_per_ton=1.4,
        access_difficulty="easy_walk_in",
        description="New England glacial placer stream flowing through White Mountain National Forest featuring glacial flour and fine flake gold.",
        highlights=[
            "Fine glacial flake gold trapped behind boulder obstructions",
            "Scenic White Mountain National Forest stream panning corridor",
            "Ideal non-motorized educational panning stream for beginners",
        ],
    ),
}

DEFAULT_PROSPECTING_GEAR: list[ProspectingGearItemModel] = [
    ProspectingGearItemModel(
        item_id="dual-riffle-gold-pan",
        name="14-Inch Deep-Drop Dual Riffle Gravity Pan",
        category="pan",
        mandatory=True,
        purpose="90-degree deep riffles and micro-riffles for gravity stratification and flake retention.",
    ),
    ProspectingGearItemModel(
        item_id="classifier-sieve-set",
        name="1/2-Inch & 1/4-Inch Stainless Classifier Sieve Set",
        category="classifier",
        mandatory=True,
        purpose="Stainless steel mesh screens sized for 5-gal buckets to discard barren river cobbles.",
    ),
    ProspectingGearItemModel(
        item_id="compact-backpacking-sluice",
        name="50-Inch Aircraft Aluminum Backpacking Sluice Box",
        category="sluice",
        mandatory=True,
        purpose="Hungarian riffles, expanded grate, and blue miner's moss for high-volume stream recovery.",
    ),
    ProspectingGearItemModel(
        item_id="hardened-crevice-tool-set",
        name="Drop-Forged Bedrock Crevice Tool & Spoon Pick",
        category="crevice_tools",
        mandatory=True,
        purpose="Forged carbon steel pry bars to scrape compacted bedrock fissures and trap pockets.",
    ),
    ProspectingGearItemModel(
        item_id="suction-snuffer-bottle-vials",
        name="High-Vacuum Snuffer Bottle & Glass Collection Vials",
        category="recovery",
        mandatory=True,
        purpose="Silicone suction bulb to vacuum fine gold flakes directly into glass storage vials.",
    ),
    ProspectingGearItemModel(
        item_id="magnetic-black-sand-separator",
        name="Rare-Earth 8-lb Magnet Black Sand Separator",
        category="magnet",
        mandatory=True,
        purpose="Plunger neodymium magnet to extract magnetite iron sand away from clean gold concentrates.",
    ),
]


def get_prospecting_sites(deposit_type: Optional[str] = None) -> list[ProspectingSiteModel]:
    sites = list(DEFAULT_PROSPECTING_SITES.values())
    if deposit_type:
        dep_clean = deposit_type.strip().lower()
        sites = [s for s in sites if s.deposit_type.lower() == dep_clean]
    return sites


def get_prospecting_site(site_id: str) -> Optional[ProspectingSiteModel]:
    return DEFAULT_PROSPECTING_SITES.get(site_id.strip().lower())


def get_prospecting_gear() -> list[ProspectingGearItemModel]:
    return list(DEFAULT_PROSPECTING_GEAR)


def calculate_placer_recovery(req: PlacerRequest) -> PlacerResponse:
    site = get_prospecting_site(req.site_id)
    if site is None:
        site = DEFAULT_PROSPECTING_SITES["american-river-south-fork"]

    expected_concentrate_grams = round(
        (req.gravel_volume_buckets * 0.45 * (site.max_historical_yield_g_per_ton / 5.0)),
        2,
    )

    if (5.0 <= req.sluice_slope_deg <= 8.0) and (2.5 <= req.stream_flow_velocity_fps <= 4.5):
        sluice_status = "optimal_riffle_recovery"
        recovery_efficiency_percent = 92
    elif (req.sluice_slope_deg < 5.0) or (req.stream_flow_velocity_fps < 2.5):
        sluice_status = "underflow_clogging_risk"
        recovery_efficiency_percent = 64
    else:
        sluice_status = "scour_blowout_velocity"
        recovery_efficiency_percent = 48

    density_ratio = 7.28

    if sluice_status == "optimal_riffle_recovery":
        recovery_advisory = (
            f"Optimal sluice pitch ({req.sluice_slope_deg}°) and stream velocity ({req.stream_flow_velocity_fps} fps). "
            f"Hungarian riffles and blue miner's moss are achieving {recovery_efficiency_percent}% recovery efficiency "
            "with steady sediment fluidization and minimal fine flake blowout."
        )
    elif sluice_status == "underflow_clogging_risk":
        recovery_advisory = (
            f"Warning: Sluice slope ({req.sluice_slope_deg}°) or water flow ({req.stream_flow_velocity_fps} fps) is insufficient. "
            "Heavy black magnetic sands and river cobble will pack riffles, preventing gravity stratification and dropping recovery to 64%."
        )
    else:
        recovery_advisory = (
            f"Warning: Sluice pitch ({req.sluice_slope_deg}°) or water velocity ({req.stream_flow_velocity_fps} fps) is excessive. "
            "High turbulence creates riffle scouring, blowing fine gold flakes and concentrates out of the sluice tail (48% efficiency)."
        )

    regulatory_advisory = (
        "Always verify BLM, USFS, or state mining claim status prior to prospecting. "
        "Use non-motorized hand panning and sluicing tools only in authorized corridors, practice Leave No Trace, "
        "avoid disturbing salmonid spawning gravels, and completely refill all test holes."
    )

    return PlacerResponse(
        site_id=site.site_id,
        site_title=site.title,
        expected_concentrate_grams=expected_concentrate_grams,
        recovery_efficiency_percent=recovery_efficiency_percent,
        sluice_status=sluice_status,
        density_ratio=density_ratio,
        recovery_advisory=recovery_advisory,
        regulatory_advisory=regulatory_advisory,
    )


def detect_gold_prospecting_intent(message: str) -> Optional[ProspectingIntent]:
    q = message.lower().strip()

    exclusions = [
        "order #",
        "refund",
        "return label",
        "shipping tracking",
        "dogsled",
        "metal detector",
        "rentals",
        "rental",
        "snowshoe",
        "trapping",
    ]
    if any(ex in q for ex in exclusions):
        return None

    keywords = [
        r"\b(?:gold\s+)?panning\b",
        r"\bgold\s+pan(?:s)?\b",
        r"\bplacer\b",
        r"\bsluice(?:\s*box)?\b",
        r"\briffles?\b",
        r"\bblack\s+sand\b",
        r"\bsnuffer\s+bottle\b",
        r"\bbedrock\s+crevice\b",
        r"\bminer'?s\s+moss\b",
        r"\bgold\s+prospecting\b",
    ]
    if not any(re.search(pattern, q) for pattern in keywords):
        return None

    matched_site_id: Optional[str] = None
    if "american river" in q or "coloma" in q:
        matched_site_id = "american-river-south-fork"
    elif "cache creek" in q:
        matched_site_id = "cache-creek-colorado"
    elif "pedro creek" in q or "tanana" in q:
        matched_site_id = "fairbanks-pedro-creek"
    elif "galice" in q or "rogue river" in q:
        matched_site_id = "rogue-river-galice"
    elif "swift river" in q:
        matched_site_id = "swift-river-new-hampshire"

    detected_deposit_type: Optional[str] = None
    if "inside bend" in q or "inside_bend" in q or "gravel bar" in q or "point bar" in q:
        detected_deposit_type = "inside_bend_gravel_bar"
    elif "bedrock crevice" in q or "bedrock_crevice" in q or "bedrock" in q or "crevice" in q:
        detected_deposit_type = "bedrock_crevice"
    elif "bench placer" in q or "bench_placer" in q or "terrace" in q or "bench" in q:
        detected_deposit_type = "bench_placer_terrace"
    elif "stream gravel riffle" in q or "stream_gravel_riffle" in q or "riffle" in q:
        detected_deposit_type = "stream_gravel_riffle"

    calc_keywords = [
        "calculate",
        "calculation",
        "estimate",
        "yield",
        "recovery",
        "sluice angle",
        "pitch",
        "buckets",
        "velocity",
        "flow pitch",
        "separation ratio",
    ]
    gear_keywords = [
        "gear",
        "checklist",
        "equipment",
        "kit",
        "classifier",
        "sieve",
        "snuffer bottle",
        "snuffer",
        "black sand separator",
        "magnet",
        "crevice tool",
    ]

    if any(cw in q for cw in calc_keywords):
        return ProspectingIntent(
            action="calculate_placer",
            site_id=matched_site_id or "american-river-south-fork",
            deposit_type=detected_deposit_type,
        )

    if any(gw in q for gw in gear_keywords):
        return ProspectingIntent(
            action="gear_checklist",
            site_id=matched_site_id,
            deposit_type=detected_deposit_type,
        )

    if matched_site_id:
        return ProspectingIntent(
            action="site_detail",
            site_id=matched_site_id,
            deposit_type=detected_deposit_type,
        )

    return ProspectingIntent(
        action="sites_list",
        site_id=None,
        deposit_type=detected_deposit_type,
    )


def format_gold_prospecting_response(data: Any, query: str = "") -> FormattedProspectingResponse:
    if isinstance(data, PlacerResponse):
        calc = data
        answer = (
            f"Placer Mineral Prospecting & Sluice Calculation for {calc.site_title}: "
            f"Expected gold concentrate yield is {calc.expected_concentrate_grams:.2f} grams "
            f"with {calc.recovery_efficiency_percent}% recovery efficiency (Status: {calc.sluice_status}). "
            f"Specific gravity density separation ratio: {calc.density_ratio:.2f}:1 (Gold 19.3 vs Quartz 2.65). "
            f"Advisory: {calc.recovery_advisory} Regulations: {calc.regulatory_advisory}"
        )
        calc_info: dict[str, Any] = {
            "action": "calculate_placer",
            "site_id": calc.site_id,
            "calculation": calc.model_dump(),
        }
        return FormattedProspectingResponse(
            answer,
            {"gold_prospecting_info": calc_info, "answer": answer},
        )

    if isinstance(data, dict):
        if "gold_prospecting_info" in data and "answer" in data:
            return FormattedProspectingResponse(str(data["answer"]), data)
        if "action" in data and ("calculation" in data or "site_id" in data):
            action_val = str(data.get("action", "calculate_placer"))
            answer_str = f"Placer prospecting action '{action_val}' processed."
            calc_dict_info: dict[str, Any] = data
            return FormattedProspectingResponse(
                answer_str,
                {"gold_prospecting_info": calc_dict_info, "answer": answer_str},
            )
        intent = (
            ProspectingIntent(**data)
            if "action" in data
            else (detect_gold_prospecting_intent(query or str(data)) or ProspectingIntent(action="sites_list"))
        )
    elif isinstance(data, ProspectingIntent):
        intent = data
    else:
        intent = detect_gold_prospecting_intent(str(data)) or ProspectingIntent(action="sites_list")

    if intent.action in ("calculate_placer", "calculate"):
        req = PlacerRequest(site_id=intent.site_id or "american-river-south-fork")
        calc_res = calculate_placer_recovery(req)
        answer = (
            f"Placer Mineral Prospecting & Sluice Calculation for {calc_res.site_title}: "
            f"Expected gold concentrate yield is {calc_res.expected_concentrate_grams:.2f} grams "
            f"with {calc_res.recovery_efficiency_percent}% recovery efficiency (Status: {calc_res.sluice_status}). "
            f"Specific gravity density separation ratio: {calc_res.density_ratio:.2f}:1 (Gold 19.3 vs Quartz 2.65). "
            f"Advisory: {calc_res.recovery_advisory} Regulations: {calc_res.regulatory_advisory}"
        )
        calc_info = {
            "action": "calculate_placer",
            "site_id": calc_res.site_id,
            "calculation": calc_res.model_dump(),
        }
        return FormattedProspectingResponse(
            answer,
            {"gold_prospecting_info": calc_info, "answer": answer},
        )

    if intent.action in ("gear_checklist", "gear"):
        gear = get_prospecting_gear()
        items_str = "; ".join(f"{g.name} ({g.purpose})" for g in gear)
        answer = (
            f"Mandatory Wilderness Gold Prospecting & Placer Recovery Gear ({len(gear)} items): {items_str}. "
            "Ensure all stream cobbles are classified through 1/4-inch mesh before feeding sluice or gravity pan."
        )
        gear_info: dict[str, Any] = {
            "action": "gear_checklist",
            "gear": [g.model_dump() for g in gear],
            "mandatory_count": len(gear),
        }
        return FormattedProspectingResponse(
            answer,
            {"gold_prospecting_info": gear_info, "answer": answer},
        )

    if intent.action == "site_detail" and intent.site_id:
        site = get_prospecting_site(intent.site_id)
        if site:
            highlights_str = ", ".join(site.highlights)
            answer = (
                f"Placer Site Detail: {site.title} ({site.region}, {site.river_system}). "
                f"Deposit Type: {site.deposit_type.replace('_', ' ').title()} | Elevation: {site.elevation_m}m | "
                f"Gravel Type: {site.typical_gravel_type} | Historical Yield: {site.max_historical_yield_g_per_ton} g/ton | "
                f"Access: {site.access_difficulty.replace('_', ' ').title()}. {site.description} "
                f"Highlights: {highlights_str}."
            )
            detail_info: dict[str, Any] = {
                "action": "site_detail",
                "site_id": site.site_id,
                "site": site.model_dump(),
            }
            return FormattedProspectingResponse(
                answer,
                {"gold_prospecting_info": detail_info, "answer": answer},
            )

    sites = get_prospecting_sites(deposit_type=intent.deposit_type)
    summary_str = "; ".join(
        f"{s.title} ({s.deposit_type.replace('_', ' ').title()}, {s.region}, max historical yield: {s.max_historical_yield_g_per_ton} g/ton)"
        for s in sites
    )
    answer = (
        f"Contoso Placer Mineral Prospecting & Gold Panning Catalog ({len(sites)} sites): {summary_str}. "
        "Inquire about specific site details, mandatory prospecting gear, or sluice recovery yield calculations."
    )
    list_info: dict[str, Any] = {
        "action": "sites_list",
        "deposit_type": intent.deposit_type,
        "sites": [s.model_dump() for s in sites],
        "count": len(sites),
    }
    return FormattedProspectingResponse(
        answer,
        {"gold_prospecting_info": list_info, "answer": answer},
    )


def build_gold_prospecting_prompt(intent: Optional[ProspectingIntent] = None) -> str:
    lines = [
        "Wilderness Gold Panning & Placer Mineral Prospecting Guidance:",
        "- Specific Gravity Density Separation: Gold boasts an extreme specific gravity of 19.3 compared to host quartz and granitic gravels (~2.65), resulting in a high density separation ratio of 7.28:1.",
        "- Sluice Box Hydraulics: Maintain a slope pitch of 5° to 8° (roughly 1 inch of drop per foot) and a stream flow velocity of 2.5 to 4.5 fps. Slopes <5° or velocity <2.5 fps cause heavy magnetite black sand clogging, while slopes >8° or velocity >4.5 fps scour riffles and blow out fine flake concentrates.",
        "- Recovery Materials: Utilize Hungarian riffles, expanded steel mesh grates, and blue unbacked miner's moss for optimal boundary layer fluidization and fine flake retention.",
        "- Clean Concentrates: Remove magnetic black sands with an 8-lb plunger rare-earth magnet and draw fine placer flakes into glass storage vials using a silicone suction snuffer bottle.",
        "- Environmental & Legal Compliance: Non-motorized recreational panning and sluicing must follow BLM and USFS rules. Respect active mining claims, protect riparian stream corridors, avoid fish spawning riffles, and refill test excavations.",
    ]
    if intent and intent.site_id:
        site = get_prospecting_site(intent.site_id)
        if site:
            lines.append(
                f"Target Site: {site.title} ({site.region}). Deposit: {site.deposit_type}. "
                f"Historical Yield: {site.max_historical_yield_g_per_ton} g/ton. Description: {site.description}"
            )
    return "\n".join(lines)


def gold_prospecting_tool(data: dict[str, Any], query: str = "") -> dict[str, Any]:
    formatted = format_gold_prospecting_response(data, query=query)
    return dict(formatted)
