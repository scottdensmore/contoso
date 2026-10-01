import math
from enum import Enum
from typing import Any, Literal, Optional, Union

from pydantic import BaseModel, Field, model_validator


class EscapeTechnique(str, Enum):
    SANDTRAP_GHOST_ANCHOR = "sandtrap_ghost_anchor"
    POT_HOLE_ESCAPE_HOOK = "pot_hole_escape_hook"
    WATER_ANCHOR_PACK_TOSS = "water_anchor_pack_toss"
    CHEATER_STICK_REACH = "cheater_stick_reach"


class WaterLevelCondition(str, Enum):
    BONE_DRY_SCOUR = "bone_dry_scour"
    KNEE_WADING_SAND = "knee_wading_sand"
    SEMI_SWIMMING_KEEPER = "semi_swimming_keeper"
    DEEP_SWIMMING_KEEPER = "deep_swimming_keeper"
    FLOODED_SWIMMING_FLUME = "flooded_swimming_flume"


class WallWetness(str, Enum):
    DRY_SLICKROCK = "dry_slickrock"
    DAMP_SANDSTONE = "damp_sandstone"
    SLIPPERY_ALGAE_SCUM = "slippery_algae_scum"


class PotholeSafetyStatus(str, Enum):
    NOMINAL_PARTNER_BOOST = "nominal_partner_boost"
    CAUTION_TECHNICAL_HOOK_REQUIRED = "caution_technical_hook_required"
    CRITICAL_KEEPER_TRAP_HAZARD = "critical_keeper_trap_hazard"


class PotholeCanyonRoute(BaseModel):
    id: str
    title: str = ""
    name: str = ""
    region: str = ""
    range: str = ""
    depth_meters: float = 0.0
    primary_technique: str = "sandtrap_ghost_anchor"
    lip_friction_angle_degrees: float = 60.0
    typical_water_level: str = "semi_swimming_keeper"
    description: str = ""
    highlights: list[str] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "routeId": "id",
                "route_id": "id",
                "depthMeters": "depth_meters",
                "primaryTechnique": "primary_technique",
                "lipFrictionAngleDegrees": "lip_friction_angle_degrees",
                "typicalWaterLevel": "typical_water_level",
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
    def depthMeters(self) -> float:
        return self.depth_meters

    @property
    def primaryTechnique(self) -> str:
        return self.primary_technique

    @property
    def lipFrictionAngleDegrees(self) -> float:
        return self.lip_friction_angle_degrees

    @property
    def typicalWaterLevel(self) -> str:
        return self.typical_water_level


class PotholeDynamicsQuery(BaseModel):
    route_id: str = "neon-canyon-golden-cathedral"
    technique: str = "sandtrap_ghost_anchor"
    water_level: str = "semi_swimming_keeper"
    wall_wetness: str = "slippery_algae_scum"
    team_size: int = 3
    lead_climber_weight_kg: float = 75.0
    lip_height_meters: float = 3.5
    incline_angle_degrees: float = 65.0

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "routeId": "route_id",
                "waterLevel": "water_level",
                "wallWetness": "wall_wetness",
                "teamSize": "team_size",
                "leadClimberWeightKg": "lead_climber_weight_kg",
                "lipHeightMeters": "lip_height_meters",
                "inclineAngleDegrees": "incline_angle_degrees",
            }
            for k, v in mapping.items():
                if k in data and v not in data:
                    data[v] = data[k]
        return data

    @property
    def routeId(self) -> str:
        return self.route_id

    @property
    def waterLevel(self) -> str:
        return self.water_level

    @property
    def wallWetness(self) -> str:
        return self.wall_wetness

    @property
    def teamSize(self) -> int:
        return self.team_size

    @property
    def leadClimberWeightKg(self) -> float:
        return self.lead_climber_weight_kg

    @property
    def lipHeightMeters(self) -> float:
        return self.lip_height_meters

    @property
    def inclineAngleDegrees(self) -> float:
        return self.incline_angle_degrees


class PotholeDynamicsResult(BaseModel):
    route_title: str
    route_id: Optional[str] = None
    effective_hoist_force_n: int
    pack_counterweight_kg: float
    escape_difficulty_index: float
    safety_status: str
    anchor_retrieval_advisory: str
    tactical_escape_protocol: str

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "routeTitle": "route_title",
                "routeId": "route_id",
                "effectiveHoistForceN": "effective_hoist_force_n",
                "packCounterweightKg": "pack_counterweight_kg",
                "escapeDifficultyIndex": "escape_difficulty_index",
                "safetyStatus": "safety_status",
                "anchorRetrievalAdvisory": "anchor_retrieval_advisory",
                "tacticalEscapeProtocol": "tactical_escape_protocol",
            }
            for k, v in mapping.items():
                if k in data and v not in data:
                    data[v] = data[k]
        return data

    @property
    def routeTitle(self) -> str:
        return self.route_title

    @property
    def routeId(self) -> Optional[str]:
        return self.route_id

    @property
    def effectiveHoistForceN(self) -> int:
        return self.effective_hoist_force_n

    @property
    def packCounterweightKg(self) -> float:
        return self.pack_counterweight_kg

    @property
    def escapeDifficultyIndex(self) -> float:
        return self.escape_difficulty_index

    @property
    def safetyStatus(self) -> str:
        return self.safety_status

    @property
    def anchorRetrievalAdvisory(self) -> str:
        return self.anchor_retrieval_advisory

    @property
    def tacticalEscapeProtocol(self) -> str:
        return self.tactical_escape_protocol


class PotholeGearItem(BaseModel):
    item_id: str
    id: str = ""
    name: str = ""
    category: str = ""
    mandatory: bool = True
    description: str = ""
    purpose: str = ""

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "itemId" in data and not data.get("item_id"):
                data["item_id"] = data["itemId"]
            if "id" in data and not data.get("item_id"):
                data["item_id"] = data["id"]
            elif "item_id" in data and not data.get("id"):
                data["id"] = data["item_id"]
            if "purpose" in data and not data.get("description"):
                data["description"] = data["purpose"]
            elif "description" in data and not data.get("purpose"):
                data["purpose"] = data["description"]
        return data

    @property
    def itemId(self) -> str:
        return self.item_id


class PotholeEscapeIntent(BaseModel):
    action: Literal["catalog", "get_route", "calculate", "gear_checklist"] = "catalog"
    route_id: Optional[str] = None
    query: Optional[str] = None
    technique: Optional[str] = None


class FormattedPotholeEscapeResponse(str):
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


DEFAULT_POTHOLE_ROUTES: dict[str, PotholeCanyonRoute] = {
    "neon-canyon-golden-cathedral": PotholeCanyonRoute(
        id="neon-canyon-golden-cathedral",
        title="Neon Canyon Golden Cathedral Keeper Escapes",
        name="Neon Canyon Golden Cathedral Keeper Escapes",
        region="Escalante, Utah",
        range="Grand Staircase-Escalante National Monument",
        depth_meters=18.0,
        primary_technique=EscapeTechnique.SANDTRAP_GHOST_ANCHOR.value,
        lip_friction_angle_degrees=60.0,
        typical_water_level=WaterLevelCondition.SEMI_SWIMMING_KEEPER.value,
        description="World-renowned sandstone cathedral featuring cascading keeper potholes and the ultimate 100ft free-hanging drop through triple natural arches.",
        highlights=[
            "Triple natural bridge rappel",
            "Cold plunge keeper pools",
            "Sandtrap ghost rigging on slickrock bowls",
        ],
    ),
    "choprock-canyon-keepers": PotholeCanyonRoute(
        id="choprock-canyon-keepers",
        title="Choprock Canyon Deep Slot Keeper Series",
        name="Choprock Canyon Deep Slot Keeper Series",
        region="Escalante, Utah",
        range="Grand Staircase-Escalante National Monument",
        depth_meters=22.0,
        primary_technique=EscapeTechnique.POT_HOLE_ESCAPE_HOOK.value,
        lip_friction_angle_degrees=75.0,
        typical_water_level=WaterLevelCondition.DEEP_SWIMMING_KEEPER.value,
        description="Notoriously strenuous slot canyon with sequences of cold, deep swimming keeper potholes carved into fluted Navajo sandstone walls.",
        highlights=[
            "Sustained cold swims",
            "Overhung keeper lip hooking",
            "Cheater stick partner reach-outs",
        ],
    ),
    "black-hole-white-canyon": PotholeCanyonRoute(
        id="black-hole-white-canyon",
        title="The Black Hole of White Canyon",
        name="The Black Hole of White Canyon",
        region="San Juan County, Utah",
        range="Cedar Mesa / White Canyon Complex",
        depth_meters=15.0,
        primary_technique=EscapeTechnique.WATER_ANCHOR_PACK_TOSS.value,
        lip_friction_angle_degrees=50.0,
        typical_water_level=WaterLevelCondition.FLOODED_SWIMMING_FLUME.value,
        description="Dark, cold, water-scoured canyon slot with persistent swimming corridors, floating log jams, and scoured sandstone tubs.",
        highlights=[
            "Cold dark flume swims",
            "Pack toss buoyant anchoring",
            "Continuous neoprene immersion",
        ],
    ),
    "imlay-canyon-sneffels": PotholeCanyonRoute(
        id="imlay-canyon-sneffels",
        title="Imlay Canyon Sneffels Left Fork Keeper Labyrinth",
        name="Imlay Canyon Sneffels Left Fork Keeper Labyrinth",
        region="Zion National Park, Utah",
        range="Zion Canyon Wilderness",
        depth_meters=35.0,
        primary_technique=EscapeTechnique.CHEATER_STICK_REACH.value,
        lip_friction_angle_degrees=70.0,
        typical_water_level=WaterLevelCondition.DEEP_SWIMMING_KEEPER.value,
        description="The premier crucible of American technical canyoneering, packing dozens of cold, water-filled keeper potholes between soaring vertical walls.",
        highlights=[
            "30+ cold keeper potholes",
            "Telescoping cheater stick traverses",
            "Extreme team coordination requirements",
        ],
    ),
    "heaps-canyon-emerald-pools": PotholeCanyonRoute(
        id="heaps-canyon-emerald-pools",
        title="Heaps Canyon Technical Narrows & Emerald Pools",
        name="Heaps Canyon Technical Narrows & Emerald Pools",
        region="Zion National Park, Utah",
        range="Zion Canyon Wilderness",
        depth_meters=45.0,
        primary_technique=EscapeTechnique.SANDTRAP_GHOST_ANCHOR.value,
        lip_friction_angle_degrees=65.0,
        typical_water_level=WaterLevelCondition.SEMI_SWIMMING_KEEPER.value,
        description="Epic full-day endurance canyon with relentless keeper potholes, grueling narrows, and a climactic 280ft final rappel into Emerald Pools.",
        highlights=[
            "Iron Narrows keeper gauntlet",
            "Sandtrap clean ghost retrieval",
            "280ft free-hanging final descent",
        ],
    ),
}

DEFAULT_POTHOLE_GEAR: list[PotholeGearItem] = [
    PotholeGearItem(
        item_id="sandtrap-ghosting-anchor",
        id="sandtrap-ghosting-anchor",
        name="Sandtrap Ghosting Retrievable Sand Anchor",
        category="Retrievable Anchors",
        mandatory=True,
        description="Clean canyoning fabric sand anchor that holds rappels using sand or gravel ballast and releases smoothly upon rope retrieval.",
        purpose="Clean canyoning fabric sand anchor that holds rappels using sand or gravel ballast and releases smoothly upon rope retrieval.",
    ),
    PotholeGearItem(
        item_id="telescoping-cheater-stick",
        id="telescoping-cheater-stick",
        name="Carbon Fiber Telescoping Cheater Stick (3.6m)",
        category="Escape Tools",
        mandatory=True,
        description="Rigid lightweight telescoping pole for hooking slings over distant keeper pothole lips and clipping anchor bolts.",
        purpose="Rigid lightweight telescoping pole for hooking slings over distant keeper pothole lips and clipping anchor bolts.",
    ),
    PotholeGearItem(
        item_id="talon-pothole-escape-hooks",
        id="talon-pothole-escape-hooks",
        name="Talon Pothole Escape Grappling Hook",
        category="Escape Tools",
        mandatory=True,
        description="Three-pronged high-strength escape hook with custom curvature designed to bite slick sandstone lips without damaging rock.",
        purpose="Three-pronged high-strength escape hook with custom curvature designed to bite slick sandstone lips without damaging rock.",
    ),
    PotholeGearItem(
        item_id="water-pack-toss-cord",
        id="water-pack-toss-cord",
        name="Floating Water Anchor Pack Toss Cord (6mm x 30m)",
        category="Rigging Lines",
        mandatory=True,
        description="High-buoyancy dyneema throw cord for launching counterweight backpacks across pothole rims to create an escape anchor.",
        purpose="High-buoyancy dyneema throw cord for launching counterweight backpacks across pothole rims to create an escape anchor.",
    ),
    PotholeGearItem(
        item_id="foot-stirrup-etrier",
        id="foot-stirrup-etrier",
        name="Reinforced 5-Step Canyoneering Etrier Foot Stirrup",
        category="Ascending Systems",
        mandatory=True,
        description="Heavy-duty abrasion-resistant webbing ladder providing critical foot steps for ascending out of deep water-filled potholes.",
        purpose="Heavy-duty abrasion-resistant webbing ladder providing critical foot steps for ascending out of deep water-filled potholes.",
    ),
    PotholeGearItem(
        item_id="full-neoprene-wetsuit",
        id="full-neoprene-wetsuit",
        name="Full 4/3mm Armor-Flex Neoprene Wetsuit",
        category="Thermal Protection",
        mandatory=True,
        description="Reinforced thermal protection suit preventing hypothermia during prolonged immersion in cold canyon keeper potholes.",
        purpose="Reinforced thermal protection suit preventing hypothermia during prolonged immersion in cold canyon keeper potholes.",
    ),
]


def get_pothole_routes(technique: Optional[str] = None) -> list[PotholeCanyonRoute]:
    routes = list(DEFAULT_POTHOLE_ROUTES.values())
    if technique:
        tech_clean = technique.strip().lower()
        routes = [
            r for r in routes
            if r.primary_technique.lower() == tech_clean or tech_clean in r.primary_technique.lower()
        ]
    return routes


def get_pothole_route(route_id: str) -> Optional[PotholeCanyonRoute]:
    clean_id = route_id.strip().lower()
    return DEFAULT_POTHOLE_ROUTES.get(clean_id)


def get_pothole_gear() -> list[PotholeGearItem]:
    return list(DEFAULT_POTHOLE_GEAR)


def calculate_pothole_dynamics(query: PotholeDynamicsQuery) -> PotholeDynamicsResult:
    route = None
    if query.route_id:
        clean_id = query.route_id.strip().lower()
        route = DEFAULT_POTHOLE_ROUTES.get(clean_id)
        if not route:
            raise ValueError(f"Pothole canyon route '{query.route_id}' not found")

    route_title = route.title if route else "Backcountry Desert Slot Canyon Route"

    # Base gravity: lead_climber_weight_kg * 9.81 * math.sin(math.radians(incline_angle_degrees))
    base_gravity = query.lead_climber_weight_kg * 9.81 * math.sin(math.radians(query.incline_angle_degrees))

    # Friction multiplier: dry 0.65, damp 0.85, algae 1.25
    wetness_str = str(query.wall_wetness).lower()
    if WallWetness.DRY_SLICKROCK.value in wetness_str or "dry" in wetness_str:
        friction_mult = 0.65
    elif (
        WallWetness.SLIPPERY_ALGAE_SCUM.value in wetness_str
        or "algae" in wetness_str
        or "slippery" in wetness_str
    ):
        friction_mult = 1.25
    else:
        friction_mult = 0.85

    # Water drag factor: dry 1.0, knee 1.1, semi 1.25, deep 1.4, flume 1.55
    water_str = str(query.water_level).lower()
    if (
        WaterLevelCondition.BONE_DRY_SCOUR.value in water_str
        or "bone" in water_str
        or water_str == "dry"
    ):
        water_drag = 1.0
    elif (
        WaterLevelCondition.KNEE_WADING_SAND.value in water_str
        or "knee" in water_str
        or "wading" in water_str
    ):
        water_drag = 1.1
    elif (
        WaterLevelCondition.DEEP_SWIMMING_KEEPER.value in water_str
        or "deep" in water_str
    ):
        water_drag = 1.4
    elif (
        WaterLevelCondition.FLOODED_SWIMMING_FLUME.value in water_str
        or "flume" in water_str
        or "flooded" in water_str
    ):
        water_drag = 1.55
    else:
        water_drag = 1.25

    effective_hoist_force_n = round(base_gravity * friction_mult * water_drag)
    pack_counterweight_kg = round((effective_hoist_force_n / 9.81) * 0.75, 1)

    # Base difficulty: (lip_height_meters / 6.0) * 0.4 + (incline_angle_degrees / 90.0) * 0.3 + (water_drag - 1.0) * 0.5
    base_difficulty = (
        (query.lip_height_meters / 6.0) * 0.4
        + (query.incline_angle_degrees / 90.0) * 0.3
        + (water_drag - 1.0) * 0.5
    )
    escape_difficulty_index = min(0.99, max(0.12, round(base_difficulty, 2)))

    tech_str = str(query.technique).lower()
    if (
        escape_difficulty_index >= 0.75
        or water_str == WaterLevelCondition.FLOODED_SWIMMING_FLUME.value
        or "flooded" in water_str
        or query.lip_height_meters >= 4.5
    ):
        safety_status = PotholeSafetyStatus.CRITICAL_KEEPER_TRAP_HAZARD.value
        tactical_escape_protocol = (
            "CRITICAL HAZARD: Keeper trap presents severe entrapment and hypothermia hazard. "
            "Do NOT commit entire team into pothole. Deploy water pack toss with buoyant retrieval line "
            "or stage tandem cheater stick reach from rim before swimmer commitment."
        )
    elif (
        escape_difficulty_index >= 0.45
        or EscapeTechnique.POT_HOLE_ESCAPE_HOOK.value in tech_str
        or "hook" in tech_str
    ):
        safety_status = PotholeSafetyStatus.CAUTION_TECHNICAL_HOOK_REQUIRED.value
        tactical_escape_protocol = (
            "TECHNICAL CAUTION: Overhung lip and water drag require mechanical hooking or pack counterweight. "
            "Lead climber ascends with etrier stirrups while team maintains belay tension."
        )
    else:
        safety_status = PotholeSafetyStatus.NOMINAL_PARTNER_BOOST.value
        tactical_escape_protocol = (
            "NOMINAL BOOST: Standard partner boost or shoulder stand from wading depth provides sufficient "
            "elevation for lead climber to hook lip and mantle over."
        )

    if (
        EscapeTechnique.SANDTRAP_GHOST_ANCHOR.value in tech_str
        or "sandtrap" in tech_str
    ):
        anchor_retrieval_advisory = (
            "Deploy Sandtrap on level slickrock setback >= 2m from lip. Pack with clean sand/gravel ballast, "
            "verify dual pull cords are untangled, and ensure smooth edge protection before descending."
        )
    elif (
        EscapeTechnique.WATER_ANCHOR_PACK_TOSS.value in tech_str
        or "toss" in tech_str
    ):
        anchor_retrieval_advisory = (
            f"Submerge pack counterweight to minimum ballast of {pack_counterweight_kg}kg. "
            "Toss over keeper lip with floating dyneema pull cord secured with stopper knots."
        )
    elif (
        EscapeTechnique.POT_HOLE_ESCAPE_HOOK.value in tech_str
        or "hook" in tech_str
    ):
        anchor_retrieval_advisory = (
            "Place talon escape hook into shallow sandstone pocket or lip divot under body weight. "
            "Avoid dynamic shock loading; maintain consistent downward tension on etrier."
        )
    elif (
        EscapeTechnique.CHEATER_STICK_REACH.value in tech_str
        or "cheater" in tech_str
    ):
        anchor_retrieval_advisory = (
            "Extend telescoping carbon cheater stick to clip webbing sling or hook edge. "
            "Check twist-lock collars under tension before transferring climber load."
        )
    else:
        anchor_retrieval_advisory = (
            "Establish reliable primary anchor with retrievable ghost rigging or verified partner "
            "counterweight system before committing to keeper descent."
        )

    return PotholeDynamicsResult(
        route_title=route_title,
        route_id=route.id if route else query.route_id,
        effective_hoist_force_n=effective_hoist_force_n,
        pack_counterweight_kg=pack_counterweight_kg,
        escape_difficulty_index=escape_difficulty_index,
        safety_status=safety_status,
        anchor_retrieval_advisory=anchor_retrieval_advisory,
        tactical_escape_protocol=tactical_escape_protocol,
    )


def detect_pothole_escape_intent(message: str) -> bool:
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
        "snowkite",
        "snowkiting",
        "kite",
        "kiting",
        "foil kite",
        "chickenloop",
        "dog sled",
        "mushing",
        "pulk",
        "crevasse pulk",
    ]
    if any(ex in q for ex in exclusions):
        return False

    keywords = [
        "pothole",
        "pot-hole",
        "ghost anchor",
        "ghost structure",
        "sandtrap",
        "cheater stick",
        "keeper pothole",
        "waterpocket",
        "escape hook",
        "pack toss",
        "keeper trap",
        "etrier",
        "ghost rigging",
        "pothole escape",
        "retrievable sand anchor",
        "talon hook",
    ]
    if any(k in q for k in keywords):
        return True

    route_matches = [
        "neon canyon",
        "golden cathedral",
        "choprock",
        "choprock canyon",
        "black hole",
        "white canyon",
        "imlay",
        "imlay canyon",
        "sneffels",
        "heaps canyon",
        "emerald pools",
        "neon-canyon-golden-cathedral",
        "choprock-canyon-keepers",
        "black-hole-white-canyon",
        "imlay-canyon-sneffels",
        "heaps-canyon-emerald-pools",
    ]
    if any(rm in q for rm in route_matches):
        return True

    return False


def extract_pothole_escape_intent(message: str) -> PotholeEscapeIntent:
    q = message.lower().strip()

    matched_route_id: Optional[str] = None
    if "neon" in q or "cathedral" in q or "golden cathedral" in q:
        matched_route_id = "neon-canyon-golden-cathedral"
    elif "choprock" in q:
        matched_route_id = "choprock-canyon-keepers"
    elif "black hole" in q or "white canyon" in q:
        matched_route_id = "black-hole-white-canyon"
    elif "imlay" in q or "sneffels" in q:
        matched_route_id = "imlay-canyon-sneffels"
    elif "heaps" in q or "emerald pools" in q:
        matched_route_id = "heaps-canyon-emerald-pools"
    else:
        for r_id in DEFAULT_POTHOLE_ROUTES:
            if r_id in q:
                matched_route_id = r_id
                break

    technique: Optional[str] = None
    if "sandtrap" in q or "ghost anchor" in q:
        technique = EscapeTechnique.SANDTRAP_GHOST_ANCHOR.value
    elif "hook" in q or "talon" in q:
        technique = EscapeTechnique.POT_HOLE_ESCAPE_HOOK.value
    elif "pack toss" in q or "water anchor" in q or "throw cord" in q:
        technique = EscapeTechnique.WATER_ANCHOR_PACK_TOSS.value
    elif "cheater stick" in q or "cheater" in q:
        technique = EscapeTechnique.CHEATER_STICK_REACH.value
    elif matched_route_id and matched_route_id in DEFAULT_POTHOLE_ROUTES:
        technique = DEFAULT_POTHOLE_ROUTES[matched_route_id].primary_technique

    calc_keywords = [
        "calculate",
        "hoist force",
        "counterweight",
        "difficulty",
        "dynamics",
        "lip height",
        "incline",
        "effective hoist",
        "escape difficulty",
    ]
    gear_keywords = [
        "gear",
        "checklist",
        "equipment",
        "kit",
        "tools",
        "wetsuit",
        "etrier",
        "stirrup",
    ]

    if any(k in q for k in calc_keywords):
        action: Literal["catalog", "get_route", "calculate", "gear_checklist"] = "calculate"
    elif any(k in q for k in gear_keywords):
        action = "gear_checklist"
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
            "depth",
            "water level",
        ]
    ):
        action = "get_route"
    elif matched_route_id and not any(
        k in q for k in ["routes", "catalog", "list", "options", "all"]
    ):
        action = "get_route"
    else:
        action = "catalog"

    return PotholeEscapeIntent(
        action=action,
        route_id=matched_route_id,
        query=message,
        technique=technique,
    )


def format_pothole_escape_response(
    action: Union[PotholeEscapeIntent, str],
    message: Any = None,
) -> FormattedPotholeEscapeResponse:
    if isinstance(message, dict) and "pothole_escape_info" in message:
        answer = str(
            message.get(
                "answer",
                "Backcountry Desert Slot Canyon Pot-Hole Escape & Ghost Structure Anchor Rigging guidance",
            )
        )
        return FormattedPotholeEscapeResponse(answer, message)

    intent_obj: PotholeEscapeIntent
    if isinstance(action, PotholeEscapeIntent):
        intent_obj = action
    elif isinstance(action, str):
        if action == "pothole_escape" and isinstance(message, str):
            intent_obj = extract_pothole_escape_intent(message)
        elif action in ("calculate", "calculate_dynamics"):
            intent_obj = PotholeEscapeIntent(action="calculate")
        elif action in ("gear", "gear_checklist"):
            intent_obj = PotholeEscapeIntent(action="gear_checklist")
        elif action in ("get_route", "route_detail", "detail"):
            route_id = (
                message
                if isinstance(message, str) and message in DEFAULT_POTHOLE_ROUTES
                else None
            )
            intent_obj = PotholeEscapeIntent(action="get_route", route_id=route_id)
        else:
            intent_obj = PotholeEscapeIntent(action="catalog")
    else:
        intent_obj = PotholeEscapeIntent(action="catalog")

    resolved_action = intent_obj.action

    if resolved_action == "calculate":
        if isinstance(message, PotholeDynamicsResult):
            calc_res = message
        elif isinstance(message, PotholeDynamicsQuery):
            calc_res = calculate_pothole_dynamics(message)
        else:
            calc_q = PotholeDynamicsQuery(
                route_id=intent_obj.route_id or "neon-canyon-golden-cathedral"
            )
            calc_res = calculate_pothole_dynamics(calc_q)

        answer = (
            f"Backcountry Desert Slot Canyon Pothole Escape Dynamics for {calc_res.route_title}: "
            f"Safety Status: {calc_res.safety_status.upper()}. "
            f"Effective Hoist Force: {calc_res.effective_hoist_force_n} N. "
            f"Required Pack Counterweight: {calc_res.pack_counterweight_kg} kg. "
            f"Escape Difficulty Index: {calc_res.escape_difficulty_index}. "
            f"{calc_res.anchor_retrieval_advisory} Protocol: {calc_res.tactical_escape_protocol}"
        )
        calc_info: dict[str, Any] = {
            "pothole_escape_info": {
                "action": "calculate",
                "route_id": calc_res.route_id,
                "calculation": calc_res.model_dump(),
                "effective_hoist_force_n": calc_res.effective_hoist_force_n,
                "pack_counterweight_kg": calc_res.pack_counterweight_kg,
                "escape_difficulty_index": calc_res.escape_difficulty_index,
                "safety_status": calc_res.safety_status,
                "anchor_retrieval_advisory": calc_res.anchor_retrieval_advisory,
                "tactical_escape_protocol": calc_res.tactical_escape_protocol,
            },
            "answer": answer,
        }
        return FormattedPotholeEscapeResponse(answer, calc_info)

    if resolved_action == "gear_checklist":
        checklist = message if isinstance(message, list) else get_pothole_gear()
        items_str = "; ".join(f"{g.name} ({g.description})" for g in checklist)
        answer = (
            f"Mandatory Backcountry Slot Canyon Pothole Escape & Ghost Rigging Gear Checklist ({len(checklist)} items): "
            f"{items_str}. Sandtrap ghost anchors, telescoping cheater sticks, and talon escape hooks "
            f"are mandatory for technical keeper canyon descents."
        )
        gear_info: dict[str, Any] = {
            "pothole_escape_info": {
                "action": "gear_checklist",
                "gear": [g.model_dump() for g in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedPotholeEscapeResponse(answer, gear_info)

    if resolved_action == "get_route":
        route = None
        if intent_obj.route_id:
            route = get_pothole_route(intent_obj.route_id)
        if not route and isinstance(message, PotholeCanyonRoute):
            route = message
        if not route and isinstance(message, str):
            route = get_pothole_route(message)
        if not route:
            route = get_pothole_route("neon-canyon-golden-cathedral")

        if route:
            highlights_str = ", ".join(route.highlights)
            answer = (
                f"Slot Canyon Route: {route.title} ({route.range}, {route.region}). "
                f"Depth: {route.depth_meters}m | Lip Friction Angle: {route.lip_friction_angle_degrees}° | "
                f"Typical Water Level: {route.typical_water_level} | Primary Technique: {route.primary_technique}. "
                f"{route.description} Key Highlights: {highlights_str}."
            )
            route_info: dict[str, Any] = {
                "pothole_escape_info": {
                    "action": "get_route",
                    "route_id": route.id,
                    "route": route.model_dump(),
                },
                "answer": answer,
            }
            return FormattedPotholeEscapeResponse(answer, route_info)

    routes = (
        message
        if isinstance(message, list)
        else get_pothole_routes(technique=intent_obj.technique)
    )
    summary_str = "; ".join(
        f"{r.title} ({r.region}, depth: {r.depth_meters}m, technique: {r.primary_technique})"
        for r in routes
    )
    answer = (
        f"Contoso Backcountry Slot Canyon Pot-Hole Escape Catalog ({len(routes)} routes): {summary_str}. "
        "Inquire about specific slot canyon routes, pothole escape dynamics and counterweight calculations, "
        "or mandatory ghost rigging gear checklists."
    )
    catalog_info: dict[str, Any] = {
        "pothole_escape_info": {
            "action": "catalog",
            "technique": intent_obj.technique,
            "routes": [r.model_dump() for r in routes],
        },
        "answer": answer,
    }
    return FormattedPotholeEscapeResponse(answer, catalog_info)


def build_pothole_escape_prompt(message: Any = None) -> str:
    lines = [
        "Backcountry Desert Slot Canyon Pot-Hole Escape & Ghost Structure Anchor Rigging Guidance:",
        "- Keeper Pothole Escapes: Water-scoured potholes in narrow sandstone slots present severe entrapment risks. Overhung lips and cold swimming pools demand specialized escape techniques, including sandtrap ghost anchors, partner boosts, telescoping cheater sticks, and water-pack counterweight tosses.",
        "- Ghost Anchor Rigging: Clean canyoneering principles require retrievable anchors that leave no trace on natural sandstone. Sandtraps filled with sand or gravel provide reliable rappels that collapse cleanly when retrieved via dedicated pull cords.",
        "- Escape Dynamics: Hoist force depends on lead climber mass, sandstone lip incline angle, wall wetness/algae friction, and swimmer water drag. Counterweight packs must provide sufficient mass to balance the lead climber ascending via etriers.",
        "- Mandatory Technical Kit: Sandtrap ghosting anchor, 3.6m carbon fiber cheater stick, talon escape grappling hook, 6mm floating pack toss line, 5-step etrier stirrup, and 4/3mm Armor-Flex neoprene wetsuit.",
    ]
    route_id = None
    if isinstance(message, PotholeEscapeIntent) and message.route_id:
        route_id = message.route_id
    elif isinstance(message, str):
        detected = detect_pothole_escape_intent(message)
        if detected:
            intent_obj = extract_pothole_escape_intent(message)
            if intent_obj and intent_obj.route_id:
                route_id = intent_obj.route_id

    if route_id:
        r = get_pothole_route(route_id)
        if r:
            lines.append(
                f"- Focused Slot Canyon Route: {r.title} ({r.region}, Range: {r.range}, Depth: {r.depth_meters}m, Lip Angle: {r.lip_friction_angle_degrees}°, Technique: {r.primary_technique})"
            )
    return "\n".join(lines)


def pothole_escape_tool(
    query: Optional[PotholeDynamicsQuery] = None,
    action: Optional[str] = None,
    route_id: Optional[str] = None,
    technique: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    if action in ("calculate", "calculate_dynamics") or query is not None:
        calc_q = query or PotholeDynamicsQuery(
            route_id=route_id or "neon-canyon-golden-cathedral"
        )
        res = calculate_pothole_dynamics(calc_q)
        formatted = format_pothole_escape_response("calculate", res)
        return dict(formatted._data)

    if action in ("gear", "gear_checklist"):
        checklist = get_pothole_gear()
        formatted = format_pothole_escape_response("gear_checklist", checklist)
        return dict(formatted._data)

    if action in ("get_route", "route_detail", "detail") and route_id:
        route = get_pothole_route(route_id)
        if route:
            formatted = format_pothole_escape_response("get_route", route)
            return dict(formatted._data)

    routes = get_pothole_routes(technique=technique)
    formatted = format_pothole_escape_response("catalog", routes)
    return dict(formatted._data)
