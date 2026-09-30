import math
from typing import Any, Literal, Optional, Union

from pydantic import BaseModel, Field, model_validator

GlacierTerrain = Literal[
    "polar_icecap_plateau",
    "crevassed_icefall_labyrinth",
    "moraine_firn_basin",
    "wind_scoured_sastrugi",
    "steep_alpine_headwall",
]

PulkRiggingSystem = Literal[
    "rigid_fiberglass_shaft_harness",
    "rope_trace_with_brake_fin",
    "dual_skier_tandem_haul",
]

SnowIceCondition = Literal[
    "hard_blue_ice",
    "wind_packed_firn",
    "deep_unconsolidated_powder",
    "wet_heavy_slush",
]

CrevasseRisk = Literal[
    "low",
    "moderate",
    "high",
    "extreme",
]

CrevasseArrestSafety = Literal[
    "nominal_dynamic_hold",
    "caution_overrun_risk",
    "critical_arrest_failure_alert",
]


class CrevassePulkRoute(BaseModel):
    id: str
    title: str = ""
    name: str = ""
    region: str = ""
    system: str = ""
    elevation_m: int = 0
    average_slope_deg: float = 0.0
    crevasse_risk: str = "moderate"
    primary_rigging: str = "rigid_fiberglass_shaft_harness"
    terrain: str = "polar_icecap_plateau"
    description: str = ""
    highlights: list[str] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "routeId": "id",
                "route_id": "id",
                "elevationMeters": "elevation_m",
                "averageSlopeDeg": "average_slope_deg",
                "crevassedRisk": "crevasse_risk",
                "primaryRigging": "primary_rigging",
            }
            for k, v in mapping.items():
                if k in data and v not in data:
                    data[v] = data[k]
            if "title" in data and "name" not in data:
                data["name"] = data["title"]
            elif "name" in data and "title" not in data:
                data["title"] = data["name"]
        return data

    @property
    def elevationMeters(self) -> int:
        return self.elevation_m

    @property
    def averageSlopeDeg(self) -> float:
        return self.average_slope_deg

    @property
    def crevassedRisk(self) -> str:
        return self.crevasse_risk

    @property
    def primaryRigging(self) -> str:
        return self.primary_rigging


class PulkGearItem(BaseModel):
    id: str
    item_id: str = ""
    name: str = ""
    category: str = ""
    mandatory: bool = True
    description: str = ""
    purpose: str = ""

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "itemId" in data and not data.get("id"):
                data["id"] = data["itemId"]
            if "id" in data and not data.get("item_id"):
                data["item_id"] = data["id"]
            elif "item_id" in data and not data.get("id"):
                data["id"] = data["item_id"]
            if "description" in data and not data.get("purpose"):
                data["purpose"] = data["description"]
            elif "purpose" in data and not data.get("description"):
                data["description"] = data["purpose"]
        return data


class PulkDynamicsQuery(BaseModel):
    route_id: str = "denali-kahiltna-glacier-highway"
    rigging_system: str = "rigid_fiberglass_shaft_harness"
    payload_kg: float = 50.0
    hauler_weight_kg: float = 78.0
    incline_degrees: float = 7.0
    snow_condition: str = "wind_packed_firn"
    crevasse_hazard: str = "moderate"

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "routeId": "route_id",
                "riggingSystem": "rigging_system",
                "payloadKg": "payload_kg",
                "haulerWeightKg": "hauler_weight_kg",
                "inclineDegrees": "incline_degrees",
                "snowCondition": "snow_condition",
                "crevasseHazard": "crevasse_hazard",
            }
            for k, v in mapping.items():
                if k in data and v not in data:
                    data[v] = data[k]
        return data

    @property
    def routeId(self) -> str:
        return self.route_id

    @property
    def riggingSystem(self) -> str:
        return self.rigging_system

    @property
    def payloadKg(self) -> float:
        return self.payload_kg

    @property
    def haulerWeightKg(self) -> float:
        return self.hauler_weight_kg

    @property
    def inclineDegrees(self) -> float:
        return self.incline_degrees

    @property
    def snowCondition(self) -> str:
        return self.snow_condition

    @property
    def crevasseHazard(self) -> str:
        return self.crevasse_hazard


class PulkDynamicsResult(BaseModel):
    route_title: str = "Glacial Haul Route"
    route_id: str = "denali-kahiltna-glacier-highway"
    tow_force_newtons: int = 0
    gravity_force_newtons: int = 0
    friction_force_newtons: int = 0
    downhill_overrun_joules: int = 0
    crevasse_arrest_force_kilonewtons: float = 0.0
    arrest_safety: str = "nominal_dynamic_hold"
    rigging_advisory: str = ""
    crevasse_extraction_protocol: str = ""

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "routeTitle": "route_title",
                "routeId": "route_id",
                "towForceNewtons": "tow_force_newtons",
                "gravityForceNewtons": "gravity_force_newtons",
                "frictionForceNewtons": "friction_force_newtons",
                "downhillOverrunJoules": "downhill_overrun_joules",
                "crevasseArrestForceKiloNewtons": "crevasse_arrest_force_kilonewtons",
                "arrestSafety": "arrest_safety",
                "riggingAdvisory": "rigging_advisory",
                "crevasseExtractionProtocol": "crevasse_extraction_protocol",
            }
            for k, v in mapping.items():
                if k in data and v not in data:
                    data[v] = data[k]
        return data

    @property
    def routeTitle(self) -> str:
        return self.route_title

    @property
    def routeId(self) -> str:
        return self.route_id

    @property
    def towForceNewtons(self) -> int:
        return self.tow_force_newtons

    @property
    def gravityForceNewtons(self) -> int:
        return self.gravity_force_newtons

    @property
    def frictionForceNewtons(self) -> int:
        return self.friction_force_newtons

    @property
    def downhillOverrunJoules(self) -> int:
        return self.downhill_overrun_joules

    @property
    def crevasseArrestForceKiloNewtons(self) -> float:
        return self.crevasse_arrest_force_kilonewtons

    @property
    def arrestSafety(self) -> str:
        return self.arrest_safety

    @property
    def riggingAdvisory(self) -> str:
        return self.rigging_advisory

    @property
    def crevasseExtractionProtocol(self) -> str:
        return self.crevasse_extraction_protocol


class CrevassePulkIntent(BaseModel):
    action: str
    route_id: Optional[str] = None
    terrain: Optional[str] = None
    risk: Optional[str] = None


class FormattedCrevassePulkResponse(str):
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


DEFAULT_CREVASSE_PULK_ROUTES: dict[str, CrevassePulkRoute] = {
    "denali-kahiltna-glacier-highway": CrevassePulkRoute(
        id="denali-kahiltna-glacier-highway",
        title="Denali Kahiltna Glacier Pulk Ascent",
        name="Denali Kahiltna Glacier Pulk Ascent",
        region="Alaska Range, Alaska, USA",
        system="Kahiltna Glacier Basin",
        elevation_m=2200,
        average_slope_deg=8.5,
        crevasse_risk="high",
        primary_rigging="rigid_fiberglass_shaft_harness",
        terrain="crevassed_icefall_labyrinth",
        description="High-volume glacial freighting route ascending from Kahiltna Base Camp with active snow bridges and deep hidden crevasses.",
        highlights=[
            "Heavily crevassed lower icefall maze",
            "Heavy 60kg double-carry expedition loads",
            "Rigid fiberglass shafts preventing downhill sled overrun",
        ],
    ),
    "bagley-icefield-traverse": CrevassePulkRoute(
        id="bagley-icefield-traverse",
        title="Bagley Icefield Polar Traverse",
        name="Bagley Icefield Polar Traverse",
        region="St. Elias Mountains, Alaska, USA",
        system="Wrangell-St. Elias Glacial System",
        elevation_m=1850,
        average_slope_deg=3.2,
        crevasse_risk="moderate",
        primary_rigging="rope_trace_with_brake_fin",
        terrain="polar_icecap_plateau",
        description="Massive non-polar subarctic icefield with endless wind-packed firm firn and vast rolling expanses requiring low-friction glider pulks.",
        highlights=[
            "Endless glacial icecap horizon",
            "Sastrugi wind-ridge navigation",
            "Long-distance multi-week unsupported sledging",
        ],
    ),
    "ruth-gorge-great-gorge-freight": CrevassePulkRoute(
        id="ruth-gorge-great-gorge-freight",
        title="Ruth Glacier Great Gorge Sled Haul",
        name="Ruth Glacier Great Gorge Sled Haul",
        region="Central Alaska Range, Alaska, USA",
        system="Ruth Amphitheater Karst-Granite",
        elevation_m=1550,
        average_slope_deg=6.0,
        crevasse_risk="moderate",
        primary_rigging="rigid_fiberglass_shaft_harness",
        terrain="moraine_firn_basin",
        description="Towering granite wall canyon with steep glacier drops, medial moraines, and rapid weather shifts demanding stable pulk control.",
        highlights=[
            "Enclosed granite amphitheater corridor",
            "Medial moraine rock debris transitions",
            "Downhill brake cord deployment",
        ],
    ),
    "columbia-icefield-athabasca": CrevassePulkRoute(
        id="columbia-icefield-athabasca",
        title="Columbia Icefield Glacial Plateau Sledging",
        name="Columbia Icefield Glacial Plateau Sledging",
        region="Canadian Rockies, Alberta, Canada",
        system="Columbia Icefield Basin",
        elevation_m=2800,
        average_slope_deg=5.5,
        crevasse_risk="high",
        primary_rigging="dual_skier_tandem_haul",
        terrain="wind_scoured_sastrugi",
        description="Wind-scoured subalpine ice dome characterized by deep lateral crevasses and severe katabatic crosswinds.",
        highlights=[
            "Hard-packed wind sastrugi ridges",
            "Severe sub-zero wind chill factors",
            "Tandem crevasse rope rescue backup",
        ],
    ),
    "mount-rainier-ingraham-glacier": CrevassePulkRoute(
        id="mount-rainier-ingraham-glacier",
        title="Mount Rainier Ingraham Direct Pulk Staging",
        name="Mount Rainier Ingraham Direct Pulk Staging",
        region="Cascade Range, Washington, USA",
        system="Mount Rainier Volcano Glaciers",
        elevation_m=3300,
        average_slope_deg=16.0,
        crevasse_risk="extreme",
        primary_rigging="rigid_fiberglass_shaft_harness",
        terrain="steep_alpine_headwall",
        description="Steep volcanic crevasse chutes requiring winch pulleys, crampon front-pointing, and positive lock sled anchors.",
        highlights=[
            "Steep headwall incline hauling",
            "Serac fall zone velocity requirements",
            "High-angle crevasse arrest protocols",
        ],
    ),
}

DEFAULT_PULK_GEAR: list[PulkGearItem] = [
    PulkGearItem(
        id="reinforced-uhmwpe-expedition-pulk",
        name="UHMWPE Heavy-Duty Glacial Expedition Pulk (160cm / 80L)",
        category="pulk",
        mandatory=True,
        description="Ultra-high-molecular-weight polyethylene hull with twin aluminum tracking skags for tracking across hard glacial blue ice",
    ),
    PulkGearItem(
        id="rigid-fiberglass-crossover-shafts",
        name="Locking Aluminum-Jointed Fiberglass Haul Shafts with Hip Harness",
        category="harness",
        mandatory=True,
        description="Prevents the pulk from fishtailing or smashing into the mountaineer's heels during steep glacial descents",
    ),
    PulkGearItem(
        id="downhill-trailing-rope-brake",
        name="Braided Steel-Core Choke Rope & Prusik Friction Brake",
        category="braking",
        mandatory=True,
        description="Automatically tightens underneath the hull during steep descents to maintain manageable sled descent speeds",
    ),
    PulkGearItem(
        id="crevasse-arrest-prussik-haul-rig",
        name="Pre-Rigged 8mm Rad-Line Crevasse Drop Harness & Progress Capture Pulley",
        category="crevasse_safety",
        mandatory=True,
        description="Allows instant dynamic anchor arrest if either the climber or the pulk plunges into a concealed glacial bergschrund",
    ),
    PulkGearItem(
        id="dual-directional-crevasse-fluke",
        name="Forged Aluminum Glacial Snow Anchor Deadman Fluke",
        category="anchors",
        mandatory=True,
        description="Rapidly driven into firn snow to build emergency load-rated belays during pulk hauling or crevasse rescue",
    ),
    PulkGearItem(
        id="sub-zero-sled-lashing-cover",
        name="Waterproof 1000D Cordura Fitted Pulk Duffel Cover with Compression Straps",
        category="storage",
        mandatory=True,
        description="Encloses sleeping systems, fuel cans, and freeze-dried rations to survive blizzard rollovers without load spill",
    ),
]

FRICTION_COEFFICIENTS: dict[str, float] = {
    "hard_blue_ice": 0.04,
    "wind_packed_firn": 0.07,
    "deep_unconsolidated_powder": 0.16,
    "wet_heavy_slush": 0.22,
}


def get_crevasse_pulk_routes(
    terrain: Optional[str] = None,
    risk: Optional[str] = None,
) -> list[CrevassePulkRoute]:
    routes = list(DEFAULT_CREVASSE_PULK_ROUTES.values())
    if terrain:
        norm_terrain = terrain.strip().lower().replace("-", "_").replace(" ", "_")
        routes = [
            r
            for r in routes
            if r.terrain.lower().replace("-", "_").replace(" ", "_") == norm_terrain
        ]
    if risk:
        norm_risk = risk.strip().lower()
        routes = [r for r in routes if r.crevasse_risk.lower() == norm_risk]
    return routes


def get_crevasse_pulk_route(route_id: str) -> Optional[CrevassePulkRoute]:
    norm_id = route_id.strip().lower()
    for k, r in DEFAULT_CREVASSE_PULK_ROUTES.items():
        if (
            k.lower() == norm_id
            or r.id.lower() == norm_id
            or r.title.lower() == norm_id
            or r.name.lower() == norm_id
            or norm_id in r.title.lower()
        ):
            return r
    return None


def get_crevasse_pulk_gear() -> list[PulkGearItem]:
    return list(DEFAULT_PULK_GEAR)


def calculate_pulk_dynamics(query: PulkDynamicsQuery) -> PulkDynamicsResult:
    route = get_crevasse_pulk_route(query.route_id)
    if not route:
        raise ValueError(f"Crevasse pulk route '{query.route_id}' not found")

    route_title = route.title
    mu = FRICTION_COEFFICIENTS.get(query.snow_condition, 0.07)
    rad = (query.incline_degrees * math.pi) / 180.0

    gravity_force_newtons = round(query.payload_kg * 9.81 * math.sin(rad))
    friction_force_newtons = round(mu * query.payload_kg * 9.81 * math.cos(rad))
    tow_force_newtons = gravity_force_newtons + friction_force_newtons

    downhill_overrun_joules = round(
        0.5 * query.payload_kg * (2.0 * 2.0)
        + query.payload_kg * 9.81 * math.sin(rad) * 1.5
    )

    crevasse_arrest_force_kilonewtons = (
        round(((query.payload_kg * 9.81 * 1.6) / 1000.0) * 100.0) / 100.0
    )

    if (
        query.incline_degrees > 14
        and query.rigging_system != "rigid_fiberglass_shaft_harness"
    ):
        arrest_safety = "critical_arrest_failure_alert"
        rigging_advisory = (
            "CRITICAL: Non-rigid rope traces on slopes exceeding 14° risk sled collision and uncontrollable downhill overrun. "
            "Rigid crossover fiberglass shafts are strictly required to lock pulk tracking."
        )
        crevasse_extraction_protocol = (
            "Emergency deadman anchor deployment required. Drop ice axe into dynamic self-arrest, deploy twin snow flukes, "
            "isolate pulk load with Rad-Line progress capture pulley, and prepare 3:1 Z-pulley hoist."
        )
    elif query.payload_kg > 70 and query.crevasse_hazard == "extreme":
        arrest_safety = "caution_overrun_risk"
        rigging_advisory = (
            "CAUTION: Heavy expedition load (>70kg) in high-angle extreme crevasse hazard. "
            "Trailing friction rope brake and dual-skier tandem or rigid crossover shafts must be engaged to prevent sled runout."
        )
        crevasse_extraction_protocol = (
            "Equalized snow fluke anchors required before approaching bergschrund transitions. "
            "Keep 6:1 compound mechanical advantage rescue rig staged with dry-treated dynamic line."
        )
    else:
        arrest_safety = "nominal_dynamic_hold"
        rigging_advisory = (
            "NOMINAL: Pulk tow dynamics and slope resistance are well within standard glacier haul limits. "
            "Maintain steady haul cadence and inspect shaft cross-joints periodically."
        )
        crevasse_extraction_protocol = (
            "Standard crevasse arrest protocol: Dynamic self-arrest in firn snowpack, lock haul harness tension, "
            "set deadman fluke anchor, and transfer sled weight before assessing crevasse lip."
        )

    return PulkDynamicsResult(
        route_title=route_title,
        route_id=route.id,
        tow_force_newtons=tow_force_newtons,
        gravity_force_newtons=gravity_force_newtons,
        friction_force_newtons=friction_force_newtons,
        downhill_overrun_joules=downhill_overrun_joules,
        crevasse_arrest_force_kilonewtons=crevasse_arrest_force_kilonewtons,
        arrest_safety=arrest_safety,
        rigging_advisory=rigging_advisory,
        crevasse_extraction_protocol=crevasse_extraction_protocol,
    )


def detect_crevasse_pulk_intent(message: str) -> bool:
    if not message or not message.strip():
        return False

    q = message.lower().strip()

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
        "lookout",
        "alidade",
        "osborne",
        "snowshoe",
        "sandboarding",
        "cave diving",
        "siphon",
        "sump",
        "caving",
        "speleothem",
        "cave pearl",
        "bog shoeing",
        "bog-shoeing",
        "muskeg",
        "peatland",
        "ski touring",
        "steep skiing",
        "nordic",
        "telemark",
        "falconry",
        "llama",
        "pack llama",
        "zipline",
        "zip line",
        "turtle patrol",
        "sea turtle",
        "night via ferrata",
        "via ferrata",
        "canyon bouldering",
        "bouldering",
        "mudflat trekking",
        "mudflat",
        "weather station",
        "anemometry",
        "smoke advisory",
        "smoke",
        "rentals",
        "rental",
    ]
    if any(ex in q for ex in exclusions):
        return False

    keywords = [
        "pulk",
        "crevasse pulk",
        "sled haul",
        "sled hauling",
        "pulk sled",
        "pulk harness",
        "glacial sledging",
        "haul shaft",
        "sledging",
        "glacier pulk",
    ]
    if any(k in q for k in keywords):
        return True

    route_matches = [
        "kahiltna glacier",
        "kahiltna",
        "bagley icefield",
        "ruth glacier",
        "great gorge",
        "columbia icefield",
        "ingraham glacier",
        "denali-kahiltna",
        "bagley-icefield",
        "ruth-gorge",
        "columbia-icefield",
        "mount-rainier-ingraham",
    ]
    if any(rm in q for rm in route_matches):
        return True

    if any(k in q for k in DEFAULT_CREVASSE_PULK_ROUTES):
        return True

    return False


def extract_crevasse_pulk_intent(message: str) -> CrevassePulkIntent:
    q = message.lower().strip()

    matched_route_id: Optional[str] = None
    if "kahiltna" in q or "denali" in q:
        matched_route_id = "denali-kahiltna-glacier-highway"
    elif "bagley" in q or "st elias" in q or "st. elias" in q:
        matched_route_id = "bagley-icefield-traverse"
    elif "ruth" in q or "great gorge" in q:
        matched_route_id = "ruth-gorge-great-gorge-freight"
    elif "columbia" in q or "athabasca" in q:
        matched_route_id = "columbia-icefield-athabasca"
    elif "rainier" in q or "ingraham" in q:
        matched_route_id = "mount-rainier-ingraham-glacier"
    else:
        for r_id in DEFAULT_CREVASSE_PULK_ROUTES:
            if r_id in q:
                matched_route_id = r_id
                break

    terrain: Optional[str] = None
    if "polar_icecap_plateau" in q or "polar icecap" in q:
        terrain = "polar_icecap_plateau"
    elif "crevassed_icefall_labyrinth" in q or "icefall labyrinth" in q:
        terrain = "crevassed_icefall_labyrinth"
    elif "moraine_firn_basin" in q or "moraine firn" in q:
        terrain = "moraine_firn_basin"
    elif "wind_scoured_sastrugi" in q or "sastrugi" in q:
        terrain = "wind_scoured_sastrugi"
    elif "steep_alpine_headwall" in q or "alpine headwall" in q:
        terrain = "steep_alpine_headwall"

    risk: Optional[str] = None
    if "extreme" in q:
        risk = "extreme"
    elif "high" in q:
        risk = "high"
    elif "moderate" in q:
        risk = "moderate"
    elif "low" in q:
        risk = "low"

    calc_keywords = [
        "calculate",
        "tow force",
        "gravity force",
        "friction force",
        "overrun",
        "dynamics",
        "arrest force",
        "joules",
        "newtons",
    ]
    gear_keywords = [
        "gear",
        "checklist",
        "equipment",
        "shafts",
        "fluke",
        "rad-line",
        "rope brake",
    ]

    if any(k in q for k in calc_keywords):
        action = "calculate"
    elif any(k in q for k in gear_keywords):
        action = "gear"
    elif matched_route_id and any(
        k in q
        for k in [
            "detail",
            "details",
            "about",
            "tell me",
            "describe",
            "highlights",
            "route",
            "slope",
            "elevation",
        ]
    ):
        action = "route_detail"
    elif matched_route_id and not any(
        k in q for k in ["routes", "catalog", "list", "options", "all"]
    ):
        action = "route_detail"
    else:
        action = "routes_list"

    return CrevassePulkIntent(
        action=action,
        route_id=matched_route_id,
        terrain=terrain,
        risk=risk,
    )


def format_crevasse_pulk_response(
    intent: Union[CrevassePulkIntent, str],
    data: Any = None,
) -> FormattedCrevassePulkResponse:
    if isinstance(data, dict) and "crevasse_pulk_info" in data:
        answer = str(
            data.get(
                "answer",
                "Alpine Glacial Sledging & Crevasse Pulk Expedition guidance",
            )
        )
        return FormattedCrevassePulkResponse(answer, data)

    intent_obj: CrevassePulkIntent
    if isinstance(intent, CrevassePulkIntent):
        intent_obj = intent
    elif isinstance(intent, str):
        if intent == "crevasse_pulk" and isinstance(data, str):
            intent_obj = extract_crevasse_pulk_intent(data)
        elif intent in ("calculate", "calculate_dynamics"):
            intent_obj = CrevassePulkIntent(action="calculate")
        elif intent in ("gear", "gear_checklist"):
            intent_obj = CrevassePulkIntent(action="gear")
        elif intent in ("route_detail", "detail"):
            route_id = (
                data
                if isinstance(data, str) and data in DEFAULT_CREVASSE_PULK_ROUTES
                else None
            )
            intent_obj = CrevassePulkIntent(action="route_detail", route_id=route_id)
        else:
            intent_obj = CrevassePulkIntent(action=intent)
    else:
        intent_obj = CrevassePulkIntent(action="routes_list")

    action = intent_obj.action

    if action in ("calculate", "calculate_dynamics"):
        if isinstance(data, PulkDynamicsResult):
            calc_res = data
        elif isinstance(data, PulkDynamicsQuery):
            calc_res = calculate_pulk_dynamics(data)
        else:
            calc_q = PulkDynamicsQuery(
                route_id=intent_obj.route_id or "denali-kahiltna-glacier-highway",
            )
            calc_res = calculate_pulk_dynamics(calc_q)

        answer = (
            f"Alpine Glacial Pulk Dynamics Telemetry for {calc_res.route_title}: "
            f"Arrest Safety: {calc_res.arrest_safety.upper()}. "
            f"Tow Force: {calc_res.tow_force_newtons} N (Gravity: {calc_res.gravity_force_newtons} N, Friction: {calc_res.friction_force_newtons} N). "
            f"Downhill Overrun: {calc_res.downhill_overrun_joules} J. "
            f"Crevasse Arrest Force: {calc_res.crevasse_arrest_force_kilonewtons} kN. "
            f"{calc_res.rigging_advisory} Protocol: {calc_res.crevasse_extraction_protocol}"
        )
        calc_info: dict[str, Any] = {
            "crevasse_pulk_info": {
                "action": "calculate",
                "route_id": calc_res.route_id,
                "calculation": calc_res.model_dump(),
                "tow_force_newtons": calc_res.tow_force_newtons,
                "gravity_force_newtons": calc_res.gravity_force_newtons,
                "friction_force_newtons": calc_res.friction_force_newtons,
                "downhill_overrun_joules": calc_res.downhill_overrun_joules,
                "crevasse_arrest_force_kilonewtons": calc_res.crevasse_arrest_force_kilonewtons,
                "arrest_safety": calc_res.arrest_safety,
                "rigging_advisory": calc_res.rigging_advisory,
                "crevasse_extraction_protocol": calc_res.crevasse_extraction_protocol,
            },
            "answer": answer,
        }
        return FormattedCrevassePulkResponse(answer, calc_info)

    if action in ("gear", "gear_checklist"):
        checklist = data if isinstance(data, list) else get_crevasse_pulk_gear()
        items_str = "; ".join(f"{g.name} ({g.description})" for g in checklist)
        answer = (
            f"Mandatory Alpine Glacial Sledging & Crevasse Pulk Gear Checklist ({len(checklist)} items): "
            f"{items_str}. Rigid fiberglass haul shafts, deadman snow flukes, and pre-rigged rad-line crevasse harnesses "
            f"are mandatory for all glaciated routes."
        )
        gear_info: dict[str, Any] = {
            "crevasse_pulk_info": {
                "action": "gear",
                "gear": [g.model_dump() for g in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedCrevassePulkResponse(answer, gear_info)

    if action in ("route_detail", "detail"):
        route = None
        if intent_obj.route_id:
            route = get_crevasse_pulk_route(intent_obj.route_id)
        if not route and isinstance(data, CrevassePulkRoute):
            route = data
        if not route and isinstance(data, str):
            route = get_crevasse_pulk_route(data)
        if not route:
            route = get_crevasse_pulk_route("denali-kahiltna-glacier-highway")

        if route:
            highlights_str = ", ".join(route.highlights)
            answer = (
                f"Alpine Glacial Pulk Route: {route.title} ({route.system}, {route.region}). "
                f"Elevation: {route.elevation_m}m | Average Slope: {route.average_slope_deg}° | "
                f"Crevasse Risk: {route.crevasse_risk} | Primary Rigging: {route.primary_rigging} | "
                f"Terrain: {route.terrain}. "
                f"{route.description} Key Highlights: {highlights_str}."
            )
            route_info: dict[str, Any] = {
                "crevasse_pulk_info": {
                    "action": "route_detail",
                    "route_id": route.id,
                    "route": route.model_dump(),
                },
                "answer": answer,
            }
            return FormattedCrevassePulkResponse(answer, route_info)

    routes = (
        data
        if isinstance(data, list)
        else get_crevasse_pulk_routes(
            terrain=intent_obj.terrain,
            risk=intent_obj.risk,
        )
    )
    summary_str = "; ".join(
        f"{r.title} ({r.region}, {r.terrain}, risk: {r.crevasse_risk}, rigging: {r.primary_rigging})"
        for r in routes
    )
    answer = (
        f"Contoso Alpine Glacial Sledging & Crevasse Pulk Catalog ({len(routes)} routes): {summary_str}. "
        "Inquire about specific glacial pulk routes, tow dynamics and downhill overrun calculations, "
        "or mandatory glacier sledging gear checklists."
    )
    list_info: dict[str, Any] = {
        "crevasse_pulk_info": {
            "action": "routes_list",
            "terrain": intent_obj.terrain,
            "risk": intent_obj.risk,
            "routes": [r.model_dump() for r in routes],
        },
        "answer": answer,
    }
    return FormattedCrevassePulkResponse(answer, list_info)


def build_crevasse_pulk_prompt(intent_or_question: Any = None) -> str:
    lines = [
        "Alpine Glacial Sledging & Crevasse Pulk Expedition Guidance:",
        "- Glacial Terrain & Pulk Rigging: Hauling heavy expedition pulks across crevassed terrain demands matched rigging systems: rigid fiberglass crossover shafts prevent sled overrun into haulers on slopes >14°, while rope traces with brake fins provide rolling efficiency on flat polar plateaus.",
        "- Crevasse Arrest Dynamics: When traversing active crevasse fields, sled overrun momentum creates substantial dynamic arrest forces (often exceeding 1.5 kN). Pre-rigged dynamic harnesses, progress capture pulleys, and deadman snow fluke anchors are critical.",
        "- Downhill Runout Control: High incline slopes require trailing braided steel choke ropes or prusik friction brakes to prevent runaway sled acceleration into bergschrunds.",
        "- Mandatory Expedition Gear: UHMWPE expedition pulk (160cm/80L), locking fiberglass haul shafts, downhill choke rope brake, 8mm rad-line crevasse arrest rig, deadman snow fluke, and sub-zero 1000D Cordura duffel lashing cover.",
    ]
    route_id = None
    if isinstance(intent_or_question, CrevassePulkIntent) and intent_or_question.route_id:
        route_id = intent_or_question.route_id
    elif isinstance(intent_or_question, str):
        detected = detect_crevasse_pulk_intent(intent_or_question)
        if detected:
            intent_obj = extract_crevasse_pulk_intent(intent_or_question)
            if intent_obj and intent_obj.route_id:
                route_id = intent_obj.route_id

    if route_id:
        r = get_crevasse_pulk_route(route_id)
        if r:
            lines.append(
                f"- Focused Glacial Route: {r.title} ({r.region}, System: {r.system}, Elevation: {r.elevation_m}m, Slope: {r.average_slope_deg}°, Risk: {r.crevasse_risk}, Rigging: {r.primary_rigging})"
            )
    return "\n".join(lines)


def crevasse_pulk_tool(
    query: Optional[PulkDynamicsQuery] = None,
    action: Optional[str] = None,
    route_id: Optional[str] = None,
    terrain: Optional[str] = None,
    risk: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    if action in ("calculate", "calculate_dynamics") or query is not None:
        calc_q = query or PulkDynamicsQuery(
            route_id=route_id or "denali-kahiltna-glacier-highway"
        )
        res = calculate_pulk_dynamics(calc_q)
        formatted = format_crevasse_pulk_response("calculate", res)
        return dict(formatted._data)

    if action in ("gear", "gear_checklist"):
        checklist = get_crevasse_pulk_gear()
        formatted = format_crevasse_pulk_response("gear", checklist)
        return dict(formatted._data)

    if action in ("route_detail", "detail") and route_id:
        route = get_crevasse_pulk_route(route_id)
        if route:
            formatted = format_crevasse_pulk_response("route_detail", route)
            return dict(formatted._data)

    routes = get_crevasse_pulk_routes(terrain=terrain, risk=risk)
    formatted = format_crevasse_pulk_response("routes_list", routes)
    return dict(formatted._data)
