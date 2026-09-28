from typing import Any, Optional

from pydantic import BaseModel


class TurtlePatrolSectorModel(BaseModel):
    sector_id: str
    title: str
    beach_location: str
    region: str
    beach_length_km: float
    primary_species: str
    patrol_zone: str
    avg_nests_per_km: int
    description: str
    highlights: list[str]


class TurtlePatrolRequest(BaseModel):
    sector_id: str = "cape-hatteras-barrier-spit"
    patrol_length_km: float = 18.0
    moon_phase_illumination_percent: float = 15.0
    ambient_temperature_c: float = 28.0
    predator_pressure: str = "moderate"


class TurtlePatrolResponse(BaseModel):
    sector_id: str
    sector_title: str
    patrol_zone: str
    primary_species: str
    patrol_length_km: float
    estimated_emergence_count: int
    incubation_days_estimate: int
    predator_loss_risk_percent: int
    conservation_status: str
    patrol_frequency_recommendation: str
    conservation_advisory: str


class TurtlePatrolGearModel(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class TurtlePatrolIntent(BaseModel):
    action: str
    sector_id: Optional[str] = None
    patrol_zone: Optional[str] = None

    def __bool__(self) -> bool:
        return bool(self.action)


class FormattedTurtlePatrolResponse(str):
    _data: dict[str, Any]

    def __new__(cls, answer: str, data: dict[str, Any]):
        instance = super().__new__(cls, answer)
        instance._data = data
        return instance

    def get(self, key: str, default: Any = None) -> Any:
        return self._data.get(key, default)

    def __getitem__(self, key: Any) -> Any:
        if isinstance(key, str) and key in self._data:
            return self._data[key]
        return super().__getitem__(key)


TURTLE_PATROL_SECTORS: dict[str, TurtlePatrolSectorModel] = {
    "cape-hatteras-barrier-spit": TurtlePatrolSectorModel(
        sector_id="cape-hatteras-barrier-spit",
        title="Cape Hatteras North Spit Barrier Beach",
        beach_location="Outer Banks, NC",
        region="Outer Banks, NC",
        beach_length_km=18.5,
        primary_species="loggerhead",
        patrol_zone="barrier_island_dunes",
        avg_nests_per_km=14,
        description="Dynamic barrier spit subject to high-energy Atlantic surf, where nesting loggerheads rely on pitch-dark dune horizons free of light pollution.",
        highlights=[
            "Dark sky dune barrier perimeter",
            "Ghost crab predator track surveying",
            "Tidal surge nest relocation markers",
        ],
    ),
    "cumberland-island-wilderness-beach": TurtlePatrolSectorModel(
        sector_id="cumberland-island-wilderness-beach",
        title="Cumberland Island Wilderness Coast",
        beach_location="Georgia Sea Islands, GA",
        region="Georgia Sea Islands, GA",
        beach_length_km=27.0,
        primary_species="loggerhead",
        patrol_zone="coastal_wildlife_refuge",
        avg_nests_per_km=22,
        description="Pristine wilderness island seashore protected within a coastal wildlife refuge, featuring expansive maritime oak hammocks and dense loggerhead clutch clusters.",
        highlights=[
            "Maritime oak forest backcountry access",
            "Dawn hatchling tracks to surf verification",
            "Feral predator exclusion cage monitoring",
        ],
    ),
    "padre-island-national-seashore": TurtlePatrolSectorModel(
        sector_id="padre-island-national-seashore",
        title="Padre Island Malaquite Beach Patrol",
        beach_location="Gulf Coast, TX",
        region="Gulf Coast, TX",
        beach_length_km=32.0,
        primary_species="kemps_ridley",
        patrol_zone="barrier_island_dunes",
        avg_nests_per_km=18,
        description="The longest undeveloped barrier island in the world, serving as the premier nesting stronghold for critically endangered Kemp's ridley daylight arribadas.",
        highlights=[
            "Kemp's ridley daytime arribada sweeps",
            "Corral incubation facility transport",
            "Four-wheel-drive remote beach tracking",
        ],
    ),
    "archie-carr-national-refuge": TurtlePatrolSectorModel(
        sector_id="archie-carr-national-refuge",
        title="Archie Carr Barrier Reef Coast",
        beach_location="Melbourne Beach, FL",
        region="Melbourne Beach, FL",
        beach_length_km=21.0,
        primary_species="green_sea_turtle",
        patrol_zone="coastal_wildlife_refuge",
        avg_nests_per_km=35,
        description="Globally significant green turtle rookery spanning 20 miles of coastal dunes, subject to rigorous thermal data monitoring and urban light shielding patrols.",
        highlights=[
            "High-density green turtle nesting clusters",
            "Artificial light pollution mitigation patrols",
            "Thermal clutch temperature data logging",
        ],
    ),
    "culebra-resaca-beach-atoll": TurtlePatrolSectorModel(
        sector_id="culebra-resaca-beach-atoll",
        title="Culebra Resaca & Brava Coastal Cays",
        beach_location="Culebra, PR",
        region="Culebra, PR",
        beach_length_km=12.0,
        primary_species="leatherback",
        patrol_zone="remote_cays_atoll",
        avg_nests_per_km=9,
        description="Isolated Caribbean archipelago pocket beaches with steep sand berms where massive pelagic leatherbacks navigate offshore reefs to deposit deep clutches.",
        highlights=[
            "Massive leatherback body-pit triangulation",
            "Rough surf nocturnal emergence observation",
            "Reef coral barrier tide timing navigation",
        ],
    ),
}

TURTLE_PATROL_GEAR: list[TurtlePatrolGearModel] = [
    TurtlePatrolGearModel(
        item_id="red-led-headlamp-monochrome",
        name="Narrow-Spectrum Red LED Headlamp (600nm+ Sea Turtle Safe)",
        category="lighting",
        mandatory=True,
        purpose="Monochromatic red light above 600nm wavelength to navigate dunes without blinding nesting females or causing hatchling phototactic misorientation.",
    ),
    TurtlePatrolGearModel(
        item_id="dune-predator-exclusion-cages",
        name="Stainless Self-Anchoring Predator Exclusion Wire Cages",
        category="protection",
        mandatory=True,
        purpose="Marine-grade stainless mesh enclosures anchored into dune sand to protect buried clutches against ghost crabs, raccoons, and feral canids.",
    ),
    TurtlePatrolGearModel(
        item_id="night-patrol-gps-caliper-kit",
        name="Sub-Meter Handheld GPS & Digital Clutch Caliper Kit",
        category="survey",
        mandatory=True,
        purpose="High-accuracy differential GPS receiver and precision digital calipers for recording exact crawl tracks, body pit coords, and egg cavity dimensions.",
    ),
    TurtlePatrolGearModel(
        item_id="soft-touch-hatchling-carrier",
        name="Damp-Sand Aerated Soft-Touch Transport Cooler",
        category="transport",
        mandatory=True,
        purpose="Insulated passive-airflow carrier bedded with native damp sand for safely conveying disoriented or stranded hatchlings to the water line.",
    ),
    TurtlePatrolGearModel(
        item_id="high-tide-bamboo-marker-poles",
        name="Reflective Weatherproof Bamboo Survey Stakes & Nest Tags",
        category="marking",
        mandatory=True,
        purpose="Biodegradable reflective bamboo markers and engraved weatherproof tags to delineate spring high-tide boundaries and nest numbers.",
    ),
    TurtlePatrolGearModel(
        item_id="coastal-high-intensity-uv-filter",
        name="Coastal Dune VHF Transceiver & Emergency Distress Strobe",
        category="safety",
        mandatory=True,
        purpose="Submersible multi-channel marine VHF radio and high-intensity strobe beacon for patroller emergency communication across remote barrier beaches.",
    ),
]


def get_turtle_patrol_sectors(patrol_zone: Optional[str] = None) -> list[TurtlePatrolSectorModel]:
    sectors = list(TURTLE_PATROL_SECTORS.values())
    if not patrol_zone:
        return sectors
    norm = patrol_zone.strip().lower().replace("-", "_").replace(" ", "_")
    return [s for s in sectors if s.patrol_zone.lower() == norm]


def get_turtle_patrol_sector(sector_id: str) -> Optional[TurtlePatrolSectorModel]:
    return TURTLE_PATROL_SECTORS.get(sector_id.strip().lower())


def get_turtle_patrol_gear_checklist() -> list[TurtlePatrolGearModel]:
    return list(TURTLE_PATROL_GEAR)


def calculate_turtle_patrol_dynamics(req: TurtlePatrolRequest) -> TurtlePatrolResponse:
    sector = get_turtle_patrol_sector(req.sector_id)
    if not sector:
        raise ValueError(f"Turtle patrol sector '{req.sector_id}' not found")

    pressure_factors = {
        "low": 0.08,
        "moderate": 0.20,
        "critical": 0.42,
    }
    pressure_factor = pressure_factors.get(req.predator_pressure, 0.20)

    estimated_emergence_count = max(
        5, int(round(sector.avg_nests_per_km * (req.patrol_length_km / 5.0) * 8.5))
    )

    incubation_days_estimate = int(
        round(min(70.0, max(45.0, 55.0 - (req.ambient_temperature_c - 28.0) * 2.2)))
    )

    predator_loss_risk_percent = int(
        min(95.0, round((pressure_factor * 100.0) + (req.moon_phase_illumination_percent * 0.15)))
    )

    if req.predator_pressure == "critical" or predator_loss_risk_percent >= 45:
        conservation_status = "critical_tidal_washout_hazard"
    elif req.predator_pressure == "moderate" or predator_loss_risk_percent >= 20:
        conservation_status = "elevated_predator_advisory"
    else:
        conservation_status = "optimal_nesting_conditions"

    if conservation_status == "critical_tidal_washout_hazard":
        patrol_frequency_recommendation = (
            "Continuous nocturnal sweeps (every 30-45 min) with immediate predator cage "
            "installation and nest relocation above the spring surge line."
        )
        conservation_advisory = (
            "CRITICAL ALERT: Extreme predator activity or imminent tidal inundation risk. "
            "Deploy reinforced exclusion mesh immediately and alert coastal biology teams."
        )
    elif conservation_status == "elevated_predator_advisory":
        patrol_frequency_recommendation = (
            "High-frequency sweeps (every 90-120 min) focusing on ghost crab tracks, "
            "feral predator exclusion, and dawn hatchling emergence monitoring."
        )
        conservation_advisory = (
            "ELEVATED ADVISORY: Heightened predator pressure or bright moonlight increases "
            "vulnerability. Maintain continuous dark-beach protocols and verify cage anchors."
        )
    else:
        patrol_frequency_recommendation = (
            "Standard dusk and pre-dawn monitoring sweeps (twice per night) to log new crawls, "
            "record clutch coordinates, and inspect nest perimeters."
        )
        conservation_advisory = (
            "OPTIMAL CONDITIONS: Favorable sand thermal balance and subdued predator pressure. "
            "Preserve natural barrier dune darkness and minimize footprint impact."
        )

    return TurtlePatrolResponse(
        sector_id=sector.sector_id,
        sector_title=sector.title,
        patrol_zone=sector.patrol_zone,
        primary_species=sector.primary_species,
        patrol_length_km=req.patrol_length_km,
        estimated_emergence_count=estimated_emergence_count,
        incubation_days_estimate=incubation_days_estimate,
        predator_loss_risk_percent=predator_loss_risk_percent,
        conservation_status=conservation_status,
        patrol_frequency_recommendation=patrol_frequency_recommendation,
        conservation_advisory=conservation_advisory,
    )


def detect_turtle_patrol_intent(query: str) -> Optional[TurtlePatrolIntent]:
    if not query or not query.strip():
        return None

    q = query.lower()

    exclusions = [
        "order #",
        "refund",
        "return label",
        "shipping tracking",
        "burro",
        "horse",
        "pack goat",
        "dogsled",
        "trapping",
        "gold pan",
        "beachcombing",
        "fire lookout",
        "snowshoe",
        "sandboarding",
        "cave diving",
        "caving",
        "ski touring",
        "steep skiing",
        "nordic",
        "telemark",
        "falconry",
        "llama",
        "pack llama",
        "zipline",
        "zip line",
        "rentals",
        "rental",
    ]
    if any(ex in q for ex in exclusions):
        return None

    keywords = [
        "turtle patrol",
        "sea turtle",
        "hatchling conservation",
        "barrier beach patrol",
        "loggerhead",
        "green turtle",
        "green sea turtle",
        "leatherback",
        "kemp's ridley",
        "kemps ridley",
        "predator exclusion cage",
        "exclusion cage",
        "arribada",
        "turtle nesting",
        "dark-sky emergence",
        "emergence sweeps",
        "incubation days",
        "barrier beach patrolling",
        "hatchling",
        "nesting female",
        "nest relocation",
        "nesting rookery",
    ]

    has_keyword = any(k in q for k in keywords)

    sector_patterns = [
        ("cape hatteras", "cape-hatteras-barrier-spit"),
        ("hatteras", "cape-hatteras-barrier-spit"),
        ("cumberland island", "cumberland-island-wilderness-beach"),
        ("cumberland", "cumberland-island-wilderness-beach"),
        ("padre island", "padre-island-national-seashore"),
        ("padre", "padre-island-national-seashore"),
        ("malaquite", "padre-island-national-seashore"),
        ("archie carr", "archie-carr-national-refuge"),
        ("archie", "archie-carr-national-refuge"),
        ("culebra", "culebra-resaca-beach-atoll"),
        ("resaca", "culebra-resaca-beach-atoll"),
        ("brava", "culebra-resaca-beach-atoll"),
    ]

    matched_sector_id: Optional[str] = None
    for pattern, s_id in sector_patterns:
        if pattern in q:
            matched_sector_id = s_id
            break

    if not has_keyword and not matched_sector_id:
        return None

    matched_zone: Optional[str] = None
    if "barrier_island_dunes" in q or "barrier island" in q or "dunes" in q:
        matched_zone = "barrier_island_dunes"
    elif "coastal_wildlife_refuge" in q or "wildlife refuge" in q or "refuge" in q:
        matched_zone = "coastal_wildlife_refuge"
    elif "remote_cays_atoll" in q or "cays" in q or "atoll" in q:
        matched_zone = "remote_cays_atoll"
    elif "maritime_estuary_spit" in q or "estuary" in q:
        matched_zone = "maritime_estuary_spit"

    calc_keywords = [
        "calculate",
        "calculation",
        "calc",
        "dynamics",
        "emergence count",
        "emergence",
        "incubation",
        "incubation days",
        "predator loss",
        "predator risk",
        "moon phase",
        "ambient temperature",
        "estimate",
    ]

    gear_keywords = [
        "gear",
        "checklist",
        "equipment",
        "red headlamp",
        "headlamp",
        "600nm",
        "exclusion cage",
        "exclusion cages",
        "caliper",
        "soft-touch carrier",
        "cooler",
        "bamboo marker",
        "marker poles",
        "vhf",
    ]

    if any(k in q for k in calc_keywords):
        action = "calculate"
    elif any(k in q for k in gear_keywords):
        action = "gear"
    elif matched_sector_id and any(
        k in q for k in ["detail", "details", "about", "describe", "tell me", "rookery"]
    ):
        action = "sector_detail"
    else:
        action = (
            "sector_detail"
            if (
                matched_sector_id
                and not any(
                    k in q
                    for k in [
                        "sectors",
                        "catalog",
                        "list",
                        "options",
                        "all",
                        "routes",
                    ]
                )
            )
            else "sectors_list"
        )

    return TurtlePatrolIntent(
        action=action,
        sector_id=matched_sector_id,
        patrol_zone=matched_zone,
    )


def format_turtle_patrol_response(
    intent: Any,
    query: str = "",
) -> FormattedTurtlePatrolResponse:
    if isinstance(intent, TurtlePatrolResponse):
        calc = intent
        answer = (
            f"Wilderness Sea Turtle Hatchling Conservation Dynamics Analysis for {calc.sector_title}: "
            f"Estimated emergence count is {calc.estimated_emergence_count} hatchlings across {calc.patrol_length_km} km. "
            f"Incubation timeline estimate: {calc.incubation_days_estimate} days. "
            f"Predator loss risk: {calc.predator_loss_risk_percent}% ({calc.conservation_status.replace('_', ' ').title()}). "
            f"Patrol recommendation: {calc.patrol_frequency_recommendation} "
            f"Conservation advisory: {calc.conservation_advisory}"
        )
        calc_info: dict[str, Any] = {
            "turtle_patrol_info": {
                "action": "calculate",
                "sector_id": calc.sector_id,
                "calculation": calc.model_dump(),
            },
            "answer": answer,
        }
        return FormattedTurtlePatrolResponse(answer, calc_info)

    if isinstance(intent, dict):
        if "turtle_patrol_info" in intent and "answer" in intent:
            return FormattedTurtlePatrolResponse(str(intent["answer"]), intent)
        parsed_intent = (
            TurtlePatrolIntent(**intent)
            if "action" in intent
            else (
                detect_turtle_patrol_intent(str(query) or str(intent))
                or TurtlePatrolIntent(action="sectors_list")
            )
        )
    elif isinstance(intent, TurtlePatrolIntent):
        parsed_intent = intent
    else:
        parsed_intent = detect_turtle_patrol_intent(str(intent)) or TurtlePatrolIntent(
            action="sectors_list"
        )

    if parsed_intent.action in ("calculate", "calculate_dynamics"):
        calc_req = (
            query
            if isinstance(query, TurtlePatrolRequest)
            else TurtlePatrolRequest(
                sector_id=parsed_intent.sector_id or "cape-hatteras-barrier-spit"
            )
        )
        calc_res = calculate_turtle_patrol_dynamics(calc_req)
        answer = (
            f"Wilderness Sea Turtle Hatchling Conservation Dynamics Analysis for {calc_res.sector_title}: "
            f"Estimated emergence count is {calc_res.estimated_emergence_count} hatchlings across {calc_res.patrol_length_km} km. "
            f"Incubation timeline estimate: {calc_res.incubation_days_estimate} days. "
            f"Predator loss risk: {calc_res.predator_loss_risk_percent}% ({calc_res.conservation_status.replace('_', ' ').title()}). "
            f"Patrol recommendation: {calc_res.patrol_frequency_recommendation} "
            f"Conservation advisory: {calc_res.conservation_advisory}"
        )
        calc_info = {
            "turtle_patrol_info": {
                "action": "calculate",
                "sector_id": calc_res.sector_id,
                "calculation": calc_res.model_dump(),
            },
            "answer": answer,
        }
        return FormattedTurtlePatrolResponse(answer, calc_info)

    if parsed_intent.action in ("gear", "gear_checklist"):
        checklist = get_turtle_patrol_gear_checklist()
        items_str = "; ".join(f"{item.name} ({item.purpose})" for item in checklist)
        answer = (
            f"Mandatory Wilderness Sea Turtle Hatchling Conservation Gear Checklist ({len(checklist)} items): "
            f"{items_str}. Patrollers must utilize narrow-spectrum red LED headlamps (600nm+) and carry "
            f"self-anchoring predator exclusion cages to protect vulnerable clutches."
        )
        gear_info: dict[str, Any] = {
            "turtle_patrol_info": {
                "action": "gear",
                "gear": [item.model_dump() for item in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedTurtlePatrolResponse(answer, gear_info)

    if parsed_intent.action == "sector_detail" and parsed_intent.sector_id:
        sector = get_turtle_patrol_sector(parsed_intent.sector_id)
        if sector:
            highlights_str = ", ".join(sector.highlights)
            answer = (
                f"Turtle Patrol Sector: {sector.title} ({sector.beach_location}, {sector.region}). "
                f"Beach Length: {sector.beach_length_km} km | Primary Species: {sector.primary_species.replace('_', ' ').title()} | "
                f"Patrol Zone: {sector.patrol_zone.replace('_', ' ').title()} | Avg Nests/km: {sector.avg_nests_per_km}. "
                f"{sector.description} Key Highlights: {highlights_str}."
            )
            detail_info: dict[str, Any] = {
                "turtle_patrol_info": {
                    "action": "sector_detail",
                    "sector_id": sector.sector_id,
                    "sector": sector.model_dump(),
                },
                "answer": answer,
            }
            return FormattedTurtlePatrolResponse(answer, detail_info)

    sectors = get_turtle_patrol_sectors(patrol_zone=parsed_intent.patrol_zone)
    summary_str = "; ".join(
        f"{s.title} ({s.beach_length_km} km, {s.primary_species.replace('_', ' ').title()}, {s.avg_nests_per_km} nests/km)"
        for s in sectors
    )
    answer = (
        f"Contoso Wilderness Sea Turtle Hatchling Conservation Catalog ({len(sectors)} sectors): {summary_str}. "
        f"Ask about specific sector details, nocturnal emergence and incubation dynamics calculations, "
        f"or mandatory dark-sky red headlamp and predator exclusion gear checklists."
    )
    list_info: dict[str, Any] = {
        "turtle_patrol_info": {
            "action": "sectors_list",
            "patrol_zone": parsed_intent.patrol_zone,
            "sectors": [s.model_dump() for s in sectors],
        },
        "answer": answer,
    }
    return FormattedTurtlePatrolResponse(answer, list_info)


def build_turtle_patrol_prompt(intent: Optional[TurtlePatrolIntent] = None) -> str:
    lines = [
        "Wilderness Sea Turtle Hatchling Conservation & Barrier Beach Patrolling Guidance:",
        "- Dark-Sky Emergence Dynamics: Hatchlings emerge nocturnally when surface sand temperatures cool, orienting towards the brightest natural horizon (the ocean reflection). Artificial white light disrupts crawl trajectories; monochromatic red LED light (>600nm) must be enforced.",
        "- Predator Exclusion & Arribada Protection: Ghost crabs, raccoons, and feral hogs predate clutches. Install stainless wire exclusion cages flush with sand level. In Kemp's ridley arribada corridors, coordinate sweeps with daytime high winds.",
        "- Temperature-Dependent Sex Determination: Sand temperature dictates incubation duration and sex ratios. Temperatures around 28-29°C produce balanced clutches; higher temperatures accelerate emergence but skew female.",
        "- Mandatory 6-Item Gear Checklist: Narrow-Spectrum Red LED Headlamp (600nm+), Stainless Self-Anchoring Predator Exclusion Wire Cages, Sub-Meter Handheld GPS & Digital Clutch Caliper Kit, Damp-Sand Aerated Soft-Touch Transport Cooler, Reflective Weatherproof Bamboo Survey Stakes & Nest Tags, Coastal Dune VHF Transceiver & Emergency Distress Strobe.",
    ]
    if intent and intent.sector_id:
        s = get_turtle_patrol_sector(intent.sector_id)
        if s:
            lines.append(
                f"- Focused Sector: {s.title} ({s.beach_location}, {s.region}, "
                f"Length: {s.beach_length_km} km, Species: {s.primary_species}, Avg Nests/km: {s.avg_nests_per_km})"
            )
    return "\n".join(lines)


def turtle_patrol_tool(
    request: Optional[TurtlePatrolRequest] = None,
    action: Optional[str] = None,
    sector_id: Optional[str] = None,
    patrol_zone: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    if action == "calculate" or request is not None:
        calc_req = request or TurtlePatrolRequest(
            sector_id=sector_id or "cape-hatteras-barrier-spit"
        )
        res = calculate_turtle_patrol_dynamics(calc_req)
        formatted = format_turtle_patrol_response(res)
        return dict(formatted._data)

    intent = TurtlePatrolIntent(
        action=action or "sectors_list",
        sector_id=sector_id,
        patrol_zone=patrol_zone,
    )
    formatted = format_turtle_patrol_response(intent)
    return dict(formatted._data)
