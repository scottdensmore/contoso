import re
from typing import Any, Optional

from pydantic import BaseModel, Field


class SnowkitingSpotModel(BaseModel):
    spot_id: str
    title: str
    region: str
    country: str
    elevation_m: int
    terrain: str
    typical_wind_knots: str
    best_season: str
    expedition_pulk_friendly: bool
    description: str
    highlights: list[str] = Field(default_factory=list)


class SnowkitingCalculationRequest(BaseModel):
    spot_id: str = "hardangervidda-plateau-norway"
    rider_weight_kg: float = 75.0
    pulk_weight_kg: float = 20.0
    wind_speed_knots: float = 16.0
    snow_surface: str = "groomed_packed"
    kite_type: str = "closed_cell_depower_foil"


class SnowkitingCalculationResponse(BaseModel):
    spot_id: str
    spot_title: str
    total_payload_kg: float
    recommended_kite_area_m2: float
    power_rating: str
    friction_coefficient: float
    glide_efficiency_percent: int
    safety_status: str
    tactical_advisory: str


class SnowkitingGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class SnowkitingIntent(BaseModel):
    action: str  # "spots_list", "spot_detail", "calculate_snowkiting", "gear_checklist"
    spot_id: Optional[str] = None
    terrain: Optional[str] = None


class FormattedSnowkitingResponse(str):
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

    def __contains__(self, key: object) -> bool:
        if isinstance(key, str):
            return key in self._data or super().__contains__(key)
        return False

    def keys(self):
        return self._data.keys()

    def values(self):
        return self._data.values()

    def items(self):
        return self._data.items()


DEFAULT_SNOWKITING_SPOTS: dict[str, SnowkitingSpotModel] = {
    "hardangervidda-plateau-norway": SnowkitingSpotModel(
        spot_id="hardangervidda-plateau-norway",
        title="Hardangervidda Polar Plateau",
        region="Hardangervidda National Park",
        country="Norway",
        elevation_m=1250,
        terrain="polar_plateau",
        typical_wind_knots="14 - 32 knots",
        best_season="November - May",
        expedition_pulk_friendly=True,
        description="Vast arctic-alpine tundra plateau renowned as the premier training ground for polar explorers, featuring unbroken snow cover and endless wind lines.",
        highlights=[
            "Cradle of polar kite exploration",
            "Relentless arctic wind funnels",
            "Expedition pulk multi-day staging",
        ],
    ),
    "camas-prairie-idaho": SnowkitingSpotModel(
        spot_id="camas-prairie-idaho",
        title="Camas Prairie High Basin",
        region="Fairfield, ID",
        country="USA",
        elevation_m=1540,
        terrain="powder_snowfield",
        typical_wind_knots="10 - 22 knots",
        best_season="December - March",
        expedition_pulk_friendly=True,
        description="Wide-open high desert agricultural basin filled with cold powder snow and steady thermal breezes against the Soldier and Sawtooth mountain ranges.",
        highlights=[
            "Sawtooth Mountain backdrop",
            "Unbroken deep champagne powder",
            "Ideal launch and depower arenas",
        ],
    ),
    "col-du-lautaret-alps": SnowkitingSpotModel(
        spot_id="col-du-lautaret-alps",
        title="Col du Lautaret Alpine Basin",
        region="Hautes-Alpes",
        country="France",
        elevation_m=2058,
        terrain="alpine_basin",
        typical_wind_knots="12 - 28 knots",
        best_season="December - April",
        expedition_pulk_friendly=False,
        description="Legendary high-altitude mountain pass in the French Alps offering venturi-accelerated winds, steep natural kickers, and alpine ridge soaring.",
        highlights=[
            "High-alpine thermal venturi wind",
            "Glacial ridge-soaring terrain",
            "Steep ascent kite mountaineering",
        ],
    ),
    "lake-mille-lacs-minnesota": SnowkitingSpotModel(
        spot_id="lake-mille-lacs-minnesota",
        title="Lake Mille Lacs Frozen Expanse",
        region="Isle, MN",
        country="USA",
        elevation_m=380,
        terrain="frozen_lake",
        typical_wind_knots="12 - 25 knots",
        best_season="January - March",
        expedition_pulk_friendly=True,
        description="Expansive frozen inland sea providing thousands of acres of flat, glass-smooth ice and wind-packed snow with zero vertical obstacles.",
        highlights=[
            "Massive 132,000-acre flat icy runway",
            "Long endurance speed reaches",
            "Zero tree or terrain turbulence",
        ],
    ),
    "greenland-icecap-traverse": SnowkitingSpotModel(
        spot_id="greenland-icecap-traverse",
        title="Greenland Ice Sheet South-to-North Route",
        region="Kangerlussuaq to Qaanaaq",
        country="Greenland",
        elevation_m=2500,
        terrain="ice_sheet",
        typical_wind_knots="15 - 40 knots",
        best_season="April - June",
        expedition_pulk_friendly=True,
        description="The ultimate expedition kite-hauling route spanning thousands of kilometers across massive polar ice dome expanses and katabatic storm winds.",
        highlights=[
            "Epic 2,500km polar traverse route",
            "Heavy 90kg expedition pulk hauling",
            "Sub-zero katabatic wind power",
        ],
    ),
}

DEFAULT_SNOWKITING_GEAR: list[SnowkitingGearRequirement] = [
    SnowkitingGearRequirement(
        item_id="depower-foil-snowkite",
        name="10m-12m Closed-Cell High-Depower Ultralight Foil Kite with Internal Drainage",
        category="kite_engine",
        mandatory=True,
        purpose="Provides high-efficiency aerodynamic traction, depower range in shifting polar winds, and internal air valves for relaunch.",
    ),
    SnowkitingGearRequirement(
        item_id="climbing-rated-kite-harness",
        name="CE Certified Mountaineering/Snowkite Seat Harness with Leg Loops",
        category="harness",
        mandatory=True,
        purpose="Distributes heavy traction forces and pulk hauling shock loads safely to climber's pelvis and legs without riding up.",
    ),
    SnowkitingGearRequirement(
        item_id="quick-release-chickenloop-leash",
        name="ISO 21853 Push-Away Quick-Release Chickenloop and 100% Depower Safety Line",
        category="safety_release",
        mandatory=True,
        purpose="Provides instant emergency depower and complete detachment under extreme storm drag or lofting events.",
    ),
    SnowkitingGearRequirement(
        item_id="pulk-harness-tow-bridle",
        name="Shock-Absorbing Rigid Trace Pulk Tow Bridle with Quick-Jettison Carabiner",
        category="hauling",
        mandatory=True,
        purpose="Maintains pulk tracking on icy downwind traverses and isolates the kite harness from sudden sledge shock loads.",
    ),
    SnowkitingGearRequirement(
        item_id="backcountry-gps-inreach",
        name="Satellite Communicator & Glare-Resistant Winter GPS with Waypoint Compass",
        category="navigation",
        mandatory=True,
        purpose="Enables real-time polar waypoint navigation in zero-visibility whiteouts and emergency two-way satellite SOS tracking.",
    ),
    SnowkitingGearRequirement(
        item_id="multi-impact-snow-helmet",
        name="ASTM F2040 / EN 1077 Certified High-Impact Ski & Snowkite Helmet with Face Visor",
        category="protection",
        mandatory=True,
        purpose="Guards against high-velocity ice impact, sled collisions, and extreme sub-zero windchill.",
    ),
]

FRICTION_COEFFICIENTS: dict[str, float] = {
    "frozen_lake_ice": 0.03,
    "hardpack_crust": 0.05,
    "groomed_packed": 0.08,
    "dry_powder": 0.16,
    "sastrugi_drift": 0.22,
}


def get_snowkiting_spots(terrain: Optional[str] = None) -> list[SnowkitingSpotModel]:
    spots = list(DEFAULT_SNOWKITING_SPOTS.values())
    if not terrain:
        return spots
    norm = terrain.strip().lower()
    return [s for s in spots if s.terrain.lower() == norm]


def get_snowkiting_spot_by_id(spot_id: str) -> Optional[SnowkitingSpotModel]:
    return DEFAULT_SNOWKITING_SPOTS.get(spot_id.strip().lower())


def get_snowkiting_gear() -> list[SnowkitingGearRequirement]:
    return list(DEFAULT_SNOWKITING_GEAR)


def calculate_snowkiting(request: SnowkitingCalculationRequest) -> SnowkitingCalculationResponse:
    spot = get_snowkiting_spot_by_id(request.spot_id)
    if not spot:
        raise ValueError(f"Snowkiting spot '{request.spot_id}' not found")

    total_payload_kg = round(request.rider_weight_kg + request.pulk_weight_kg, 1)
    friction_coefficient = FRICTION_COEFFICIENTS.get(request.snow_surface, 0.08)

    wind_speed = max(request.wind_speed_knots, 1.0)
    raw_kite_area = ((total_payload_kg * 1.8) / wind_speed) * (1.0 + friction_coefficient)
    recommended_kite_area_m2 = round(max(4.0, min(18.0, raw_kite_area)), 1)

    glide_efficiency_percent = round((1.0 - (friction_coefficient / 0.30)) * 100)

    if request.wind_speed_knots >= 30 and recommended_kite_area_m2 > 10:
        power_rating = (
            "DANGEROUS OVERPOWER: Extreme lofting and uncontrollable high-speed dragging risk."
        )
    elif request.wind_speed_knots <= 8:
        power_rating = "UNDERPOWERED: Insufficient pull to overcome snow friction and pulk inertia."
    elif request.wind_speed_knots >= 24:
        power_rating = "HIGH POWER: Strong traction pull; continuous depower vigilance required."
    else:
        power_rating = "OPTIMAL POWER: Balanced traction and controlled depower throw."

    if request.wind_speed_knots > 32 or (
        request.kite_type == "inflatable_leading_edge_tubekite" and request.wind_speed_knots > 25
    ):
        safety_status = "hazardous_storm_force"
    elif (
        request.wind_speed_knots > 24
        or request.pulk_weight_kg > 60
        or request.snow_surface == "sastrugi_drift"
    ):
        safety_status = "caution_high_load"
    else:
        safety_status = "approved"

    advisories: list[str] = []
    if safety_status == "hazardous_storm_force":
        advisories.append(
            "STORM FORCE ALERT: Gale or blizzard conditions exceed safe foil kite depower threshold. "
            "Ground kite, secure pulk deadman anchors, and erect storm shelter."
        )
    elif safety_status == "caution_high_load":
        advisories.append(
            "CAUTION: High load or rough sastrugi drifts detected. "
            "Utilize shock-absorbing pulk bridle, maintain conservative wind window angles, and wear full helmet visor."
        )
    else:
        advisories.append(
            "OPTIMAL CONDITIONS: Payload and wind speeds are within ideal depower flight parameters. "
            "Maintain continuous chickenloop quick-release readiness."
        )

    if not spot.expedition_pulk_friendly and request.pulk_weight_kg > 0:
        advisories.append(
            f"Notice: {spot.title} terrain is rugged and not optimized for heavy expedition pulks; "
            f"expect haul resistance."
        )

    tactical_advisory = " ".join(advisories)

    return SnowkitingCalculationResponse(
        spot_id=spot.spot_id,
        spot_title=spot.title,
        total_payload_kg=total_payload_kg,
        recommended_kite_area_m2=recommended_kite_area_m2,
        power_rating=power_rating,
        friction_coefficient=friction_coefficient,
        glide_efficiency_percent=glide_efficiency_percent,
        safety_status=safety_status,
        tactical_advisory=tactical_advisory,
    )


def _has_keyword(text: str, keywords: list[str]) -> bool:
    for kw in keywords:
        if " " in kw:
            if kw in text:
                return True
        else:
            if re.search(r"\b" + re.escape(kw) + r"\b", text):
                return True
    return False


def detect_snowkiting_intent(query: str) -> Optional[SnowkitingIntent]:
    if not query or not query.strip():
        return None

    q = query.lower()

    # Disambiguation guard: water kitesurfing
    water_kitesurfing_keywords = [
        "ocean",
        "waves",
        "surfboard",
        "beach",
        "tropical",
    ]
    if _has_keyword(q, water_kitesurfing_keywords):
        return None

    # Disambiguation guard: downhill resort skiing
    resort_skiing_keywords = [
        "lift ticket",
        "chairlift",
        "ski pass",
    ]
    if _has_keyword(q, resort_skiing_keywords):
        return None

    # Disambiguation guard: package/order tracking
    ecommerce_exclusions = [
        "refund",
        "order #",
        "return label",
        "shipping tracking",
    ]
    if any(k in q for k in ecommerce_exclusions):
        return None

    snowkiting_keywords = [
        "snowkiting",
        "snowkite",
        "snow kite",
        "polar kite",
        "kite expedition",
        "foil snowkite",
        "depower foil",
        "wind window",
        "pulk hauling",
        "pulk tow bridle",
        "pulk tow",
        "pulk harness",
        "chickenloop",
        "snowkite harness",
        "expedition pulk",
        "hardangervidda",
        "camas prairie",
        "lautaret",
        "mille lacs",
        "greenland icecap",
        "greenland ice sheet",
        "kite skiing",
        "kite snowboard",
        "kite sizing in knots",
        "katabatic wind",
    ]
    if not any(k in q for k in snowkiting_keywords):
        return None

    # Detect Spot ID
    spot_id: Optional[str] = None
    if "hardanger" in q:
        spot_id = "hardangervidda-plateau-norway"
    elif "camas" in q or "prairie" in q:
        spot_id = "camas-prairie-idaho"
    elif "lautaret" in q:
        spot_id = "col-du-lautaret-alps"
    elif "mille lacs" in q:
        spot_id = "lake-mille-lacs-minnesota"
    elif "greenland" in q or "icecap" in q or "kangerlussuaq" in q or "qaanaaq" in q:
        spot_id = "greenland-icecap-traverse"

    # Detect Terrain
    terrain: Optional[str] = None
    if "polar plateau" in q or "polar_plateau" in q or "plateau" in q:
        terrain = "polar_plateau"
    elif "powder snowfield" in q or "powder_snowfield" in q or "snowfield" in q or "powder" in q:
        terrain = "powder_snowfield"
    elif "alpine basin" in q or "alpine_basin" in q or "alpine" in q:
        terrain = "alpine_basin"
    elif "frozen lake" in q or "frozen_lake" in q or "lake ice" in q or "frozen" in q:
        terrain = "frozen_lake"
    elif "ice sheet" in q or "ice_sheet" in q:
        terrain = "ice_sheet"

    # Detect Action
    calc_keywords = [
        "calculate",
        "calculation",
        "sizing",
        "kite size",
        "kite area",
        "power rating",
        "depower sizing",
        "knots",
        "friction",
        "glide efficiency",
        "hauling friction",
        "overpower",
    ]
    gear_keywords = [
        "gear",
        "checklist",
        "equipment",
        "safety kit",
        "rescue kit",
        "kit",
        "harness",
        "chickenloop",
        "bridle",
        "gps",
        "helmet",
        "safety release",
        "leash",
    ]
    spot_detail_keywords = [
        "detail",
        "beta",
        "tell me about",
        "highlights",
        "elevation",
        "wind",
        "season",
        "about",
        "pulk friendly",
    ]
    spots_list_keywords = [
        "spots",
        "catalog",
        "list",
        "destinations",
        "show me",
        "locations",
        "where can i",
    ]

    if _has_keyword(q, calc_keywords):
        action = "calculate_snowkiting"
    elif _has_keyword(q, gear_keywords):
        action = "gear_checklist"
    elif spot_id and _has_keyword(q, spot_detail_keywords):
        action = "spot_detail"
    elif _has_keyword(q, spots_list_keywords):
        action = "spots_list"
    elif spot_id:
        action = "spot_detail"
    else:
        action = "spots_list"

    return SnowkitingIntent(
        action=action,
        spot_id=spot_id,
        terrain=terrain,
    )


extract_snowkiting_intent = detect_snowkiting_intent


def build_snowkiting_prompt(intent: SnowkitingIntent) -> str:
    lines = [
        "Backcountry Snowkiting & Polar Kite Expeditions Expert Beta:",
        "- Aerodynamic Traction & Wind Window Dynamics: Depower foil kite sizing (m²) based on rider and pulk weight, friction coefficients, and apparent wind angles.",
        "- Pulk Towing & Friction Coefficients: Hauling dynamics across lake ice (0.03), hardpack crust (0.05), groomed packed (0.08), dry powder (0.16), and sastrugi drifts (0.22).",
        "- Storm Force Safety & Emergency Depower: ISO 21853 push-away chickenloop release, rigid shock-absorbing pulk bridles, and survival limits in >32 knot gale winds.",
    ]

    if intent.spot_id:
        spot = get_snowkiting_spot_by_id(intent.spot_id)
        if spot:
            lines.extend(
                [
                    f"- Focused Snowkite Spot: {spot.title} ({spot.region}, {spot.country})",
                    f"  Elevation: {spot.elevation_m}m | Terrain: {spot.terrain} | Winds: {spot.typical_wind_knots} | Season: {spot.best_season}",
                    f"  Expedition Pulk Friendly: {spot.expedition_pulk_friendly}",
                    f"  Highlights: {', '.join(spot.highlights)}",
                    f"  Description: {spot.description}",
                ]
            )
    else:
        spots = get_snowkiting_spots(terrain=intent.terrain)
        lines.append(
            f"- Featured Iconic Snowkiting Spots: {'; '.join(f'{s.title} ({s.terrain}, {s.country})' for s in spots)}"
        )

    return "\n".join(lines)


def format_snowkiting_response(
    intent: SnowkitingIntent, query: str = ""
) -> FormattedSnowkitingResponse:
    if intent.action == "calculate_snowkiting":
        target_spot_id = intent.spot_id or "hardangervidda-plateau-norway"
        req = SnowkitingCalculationRequest(
            spot_id=target_spot_id,
            rider_weight_kg=75.0,
            pulk_weight_kg=20.0,
            wind_speed_knots=16.0,
            snow_surface="groomed_packed",
            kite_type="closed_cell_depower_foil",
        )
        plan = calculate_snowkiting(req)
        answer = (
            f"Snowkiting Kite Sizing & Pulk Hauling Plan for {plan.spot_title}: "
            f"Payload: {plan.total_payload_kg}kg | Recommended Kite Area: {plan.recommended_kite_area_m2}m² | "
            f"Power Rating: {plan.power_rating} | Friction Coeff: {plan.friction_coefficient:.2f} | "
            f"Glide Efficiency: {plan.glide_efficiency_percent}% | Safety Status: {plan.safety_status}. "
            f"Tactical Advisory: {plan.tactical_advisory}"
        )
        calc_info: dict[str, Any] = {
            "action": "calculate_snowkiting",
            "calculation": plan.model_dump(),
            "plan": plan.model_dump(),
        }
        return FormattedSnowkitingResponse(answer, {"answer": answer, "snowkiting_info": calc_info})

    if intent.action == "gear_checklist":
        gear = get_snowkiting_gear()
        mandatory_count = sum(1 for g in gear if g.mandatory)
        answer = (
            f"Mandatory Polar Snowkiting Safety Kit Checklist ({len(gear)} items): "
            + "; ".join(f"{g.name} ({g.purpose})" for g in gear)
            + ". Always test quick-release chickenloop mechanisms and GPS satellite sync before launching."
        )
        gear_info: dict[str, Any] = {
            "action": "gear_checklist",
            "gear": [g.model_dump() for g in gear],
            "mandatory_count": mandatory_count,
        }
        return FormattedSnowkitingResponse(answer, {"answer": answer, "snowkiting_info": gear_info})

    if intent.action == "spot_detail" and intent.spot_id:
        spot = get_snowkiting_spot_by_id(intent.spot_id)
        if spot:
            answer = (
                f"Backcountry Snowkiting Beta — {spot.title} ({spot.region}, {spot.country}): "
                f"Elevation: {spot.elevation_m}m | Terrain: {spot.terrain} | Winds: {spot.typical_wind_knots} | "
                f"Best Season: {spot.best_season} | Expedition Pulk Friendly: {spot.expedition_pulk_friendly}. "
                f"Highlights: {', '.join(spot.highlights)}. {spot.description}"
            )
            detail_info: dict[str, Any] = {
                "action": "spot_detail",
                "spot": spot.model_dump(),
            }
            return FormattedSnowkitingResponse(
                answer, {"answer": answer, "snowkiting_info": detail_info}
            )

    # Default: spots_list
    spots = get_snowkiting_spots(terrain=intent.terrain)
    summary = "; ".join(f"{s.title} ({s.terrain}, {s.elevation_m}m)" for s in spots)
    answer = (
        f"Contoso Iconic Backcountry Snowkiting & Polar Expedition Catalog ({len(spots)} spots): {summary}. "
        "Inquire about specific snowkite spots, depower foil kite sizing, pulk hauling friction, or mandatory safety gear."
    )
    list_info: dict[str, Any] = {
        "action": "spots_list",
        "spots": [s.model_dump() for s in spots],
    }
    return FormattedSnowkitingResponse(answer, {"answer": answer, "snowkiting_info": list_info})
