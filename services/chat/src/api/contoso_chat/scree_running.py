import math
from enum import Enum
from typing import Any, Literal, Optional, Union

from pydantic import BaseModel, Field, model_validator


class ScreeGradingClass(str, Enum):
    FINE_SHALE_PEA_SCREE = "fine_shale_pea_scree"
    MEDIUM_SLATE_GRAVEL_SCREE = "medium_slate_gravel_scree"
    COARSE_ANGULAR_TALUS_RUBBLE = "coarse_angular_talus_rubble"
    UNCONSOLIDATED_MORAINE_SCREE = "unconsolidated_moraine_scree"
    HARDPAN_EMBEDDED_SCREE_SHEET = "hardpan_embedded_scree_sheet"


class DescentGaitTechnique(str, Enum):
    HEEL_PLUNGE_SLIDING_GLIDE = "heel_plunge_sliding_glide"
    RAPID_CADENCE_HOP_BRAKING = "rapid_cadence_hop_braking"
    SIDEWAYS_EDGING_SKATE = "sideways_edging_skate"
    POLE_STABILIZED_QUAD_BRAKING = "pole_stabilized_quad_braking"


class RockfallExposureTier(str, Enum):
    LOW_ISOLATED_SCREE_FAN = "low_isolated_scree_fan"
    MODERATE_LATERAL_CHUTE_DRIFT = "moderate_lateral_chute_drift"
    SEVERE_OVERHEAD_COULOIR_FUNNEL = "severe_overhead_couloir_funnel"
    CRITICAL_SPONTANEOUS_SCARP_SHED = "critical_spontaneous_scarp_shed"


class ScreeSafetyStatus(str, Enum):
    OPTIMAL_GLIDING_CONDITIONS = "optimal_gliding_conditions"
    ELEVATED_ANKLE_HAZARD = "elevated_ankle_hazard"
    SEVERE_ROCKFALL_WARNING = "severe_rockfall_warning"


class ScreeRunningSite(BaseModel):
    id: str
    title: str = ""
    name: str = ""
    site_id: str = ""
    region: str = ""
    range: str = ""
    elevation_meters: float = 0.0
    dominant_grading: str = ScreeGradingClass.FINE_SHALE_PEA_SCREE.value
    default_gait: str = DescentGaitTechnique.HEEL_PLUNGE_SLIDING_GLIDE.value
    rockfall_exposure: str = RockfallExposureTier.MODERATE_LATERAL_CHUTE_DRIFT.value
    description: str = ""
    highlights: list[str] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "siteId": "id",
                "site_id": "id",
                "elevationMeters": "elevation_meters",
                "dominantGrading": "dominant_grading",
                "defaultGait": "default_gait",
                "rockfallExposure": "rockfall_exposure",
            }
            for k, v in mapping.items():
                if k in data and v not in data:
                    data[v] = data[k]
            if "title" in data and "name" not in data:
                data["name"] = data["title"]
            elif "name" in data and "title" not in data:
                data["title"] = data["name"]
            if "id" in data and not data.get("site_id"):
                data["site_id"] = data["id"]
        return data

    @property
    def siteId(self) -> str:
        return self.id

    @property
    def elevationMeters(self) -> float:
        return self.elevation_meters

    @property
    def dominantGrading(self) -> str:
        return self.dominant_grading

    @property
    def defaultGait(self) -> str:
        return self.default_gait

    @property
    def rockfallExposure(self) -> str:
        return self.rockfall_exposure


class ScreeRunningQuery(BaseModel):
    site_id: str = "mount-sneffels-south-slopes"
    scree_grading: Optional[str] = None
    descent_gait: Optional[str] = None
    slope_angle_degrees: float = 32.0
    descent_vertical_meters: float = 400.0
    runner_weight_kg: float = 72.0
    scree_depth_cm: float = 22.0

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "siteId": "site_id",
                "screeGrading": "scree_grading",
                "dominantGrading": "scree_grading",
                "dominant_grading": "scree_grading",
                "descentGait": "descent_gait",
                "defaultGait": "descent_gait",
                "default_gait": "descent_gait",
                "slopeAngleDegrees": "slope_angle_degrees",
                "descentVerticalMeters": "descent_vertical_meters",
                "runnerWeightKg": "runner_weight_kg",
                "screeDepthCm": "scree_depth_cm",
            }
            for k, v in mapping.items():
                if k in data and v not in data:
                    data[v] = data[k]
        return data

    @property
    def siteId(self) -> str:
        return self.site_id

    @property
    def screeGrading(self) -> Optional[str]:
        return self.scree_grading

    @property
    def descentGait(self) -> Optional[str]:
        return self.descent_gait

    @property
    def slopeAngleDegrees(self) -> float:
        return self.slope_angle_degrees

    @property
    def descentVerticalMeters(self) -> float:
        return self.descent_vertical_meters

    @property
    def runnerWeightKg(self) -> float:
        return self.runner_weight_kg

    @property
    def screeDepthCm(self) -> float:
        return self.scree_depth_cm


class ScreeRunningResult(BaseModel):
    site_title: str
    site_id: Optional[str] = None
    descent_velocity_kmh: float
    ankle_impact_force_kn: float
    slide_arrest_distance_meters: float
    scree_run_duration_minutes: int
    safety_status: str
    braking_technique_advisory: str
    gaiter_and_protection_protocol: str

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "siteTitle": "site_title",
                "siteId": "site_id",
                "descentVelocityKmh": "descent_velocity_kmh",
                "ankleImpactForceKn": "ankle_impact_force_kn",
                "slideArrestDistanceMeters": "slide_arrest_distance_meters",
                "screeRunDurationMinutes": "scree_run_duration_minutes",
                "safetyStatus": "safety_status",
                "brakingTechniqueAdvisory": "braking_technique_advisory",
                "gaiterAndProtectionProtocol": "gaiter_and_protection_protocol",
            }
            for k, v in mapping.items():
                if k in data and v not in data:
                    data[v] = data[k]
        return data

    @property
    def siteTitle(self) -> str:
        return self.site_title

    @property
    def siteId(self) -> Optional[str]:
        return self.site_id

    @property
    def descentVelocityKmh(self) -> float:
        return self.descent_velocity_kmh

    @property
    def ankleImpactForceKn(self) -> float:
        return self.ankle_impact_force_kn

    @property
    def slideArrestDistanceMeters(self) -> float:
        return self.slide_arrest_distance_meters

    @property
    def screeRunDurationMinutes(self) -> int:
        return self.scree_run_duration_minutes

    @property
    def safetyStatus(self) -> str:
        return self.safety_status

    @property
    def brakingTechniqueAdvisory(self) -> str:
        return self.braking_technique_advisory

    @property
    def gaiterAndProtectionProtocol(self) -> str:
        return self.gaiter_and_protection_protocol


class ScreeRunningGearItem(BaseModel):
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
            if "item_id" in data and not data.get("id"):
                data["id"] = data["item_id"]
            if "id" in data and not data.get("item_id"):
                data["item_id"] = data["id"]
            if "purpose" in data and not data.get("description"):
                data["description"] = data["purpose"]
            elif "description" in data and not data.get("purpose"):
                data["purpose"] = data["description"]
        return data

    @property
    def itemId(self) -> str:
        return self.id


class ScreeRunningIntent(BaseModel):
    action: Literal["catalog", "get_site", "calculate", "gear_checklist"] = "catalog"
    site_id: Optional[str] = None
    query: Optional[str] = None
    grading: Optional[str] = None


class FormattedScreeRunningResponse(str):
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


DEFAULT_SCREE_RUNNING_SITES: dict[str, ScreeRunningSite] = {
    "mount-sneffels-south-slopes": ScreeRunningSite(
        id="mount-sneffels-south-slopes",
        title="Mount Sneffels South Slopes Scree Chute",
        name="Mount Sneffels South Slopes Scree Chute",
        site_id="mount-sneffels-south-slopes",
        region="San Juan Mountains, Colorado, USA",
        range="Sneffels Range (San Juan Mountains)",
        elevation_meters=4315.0,
        dominant_grading=ScreeGradingClass.FINE_SHALE_PEA_SCREE.value,
        default_gait=DescentGaitTechnique.HEEL_PLUNGE_SLIDING_GLIDE.value,
        rockfall_exposure=RockfallExposureTier.MODERATE_LATERAL_CHUTE_DRIFT.value,
        description=(
            "High-altitude 14er descent corridor below Lavender Col featuring deep volcanic pea-scree beds ideal for controlled heel-plunge gliding alongside a rocky gully."
        ),
        highlights=[
            "Sustained 34-degree fine volcanic pea-scree descent from Lavender Col (3,990m to 3,600m)",
            "Cushioned gravel beds enabling long heel-plunge sliding strides",
            "Requires single-file diagonal spacing to avoid triggering lateral rockfall in the V-notch chute",
        ],
    ),
    "mount-stephen-fossil-talus": ScreeRunningSite(
        id="mount-stephen-fossil-talus",
        title="Mount Stephen Trilobite & Summit Talus Chutes",
        name="Mount Stephen Trilobite & Summit Talus Chutes",
        site_id="mount-stephen-fossil-talus",
        region="Yoho National Park, British Columbia, Canada",
        range="Canadian Rockies (President Range)",
        elevation_meters=3199.0,
        dominant_grading=ScreeGradingClass.COARSE_ANGULAR_TALUS_RUBBLE.value,
        default_gait=DescentGaitTechnique.RAPID_CADENCE_HOP_BRAKING.value,
        rockfall_exposure=RockfallExposureTier.CRITICAL_SPONTANEOUS_SCARP_SHED.value,
        description=(
            "Steep Cambrian shale and dolomitic limestone scree fans descending over 2,000 vertical meters above Field, demanding rapid cadence footwork and strict rockfall awareness."
        ),
        highlights=[
            "Relentless 38-degree angular shale and limestone talus aprons",
            "High overhead rockfall exposure beneath towering dolomitic cliffs",
            "Protected fossil zones requiring designated descent corridors outside restricted beds",
        ],
    ),
    "great-gable-wastwater-screes": ScreeRunningSite(
        id="great-gable-wastwater-screes",
        title="Great Gable & Illgill Head Wastwater Screes",
        name="Great Gable & Illgill Head Wastwater Screes",
        site_id="great-gable-wastwater-screes",
        region="Wasdale, Lake District National Park, Cumbria, UK",
        range="Cumbrian Mountains (Western Fells)",
        elevation_meters=899.0,
        dominant_grading=ScreeGradingClass.MEDIUM_SLATE_GRAVEL_SCREE.value,
        default_gait=DescentGaitTechnique.HEEL_PLUNGE_SLIDING_GLIDE.value,
        rockfall_exposure=RockfallExposureTier.LOW_ISOLATED_SCREE_FAN.value,
        description=(
            "Classic British fell-running scree descent plunging down Borrowdale Volcanic slate gravel chutes from Great Gable and above Wastwater lake."
        ),
        highlights=[
            "Historic fell-running slate scree chutes descending from Great Napes and Stone Cove",
            "Consistent medium-grade slate gravel ideal for rhythm heel-sliding",
            "Panoramic views over Wastwater—England's deepest glacial lake",
        ],
    ),
    "mount-teide-volcanic-cinder-scree": ScreeRunningSite(
        id="mount-teide-volcanic-cinder-scree",
        title="Pico del Teide Montaña Blanca Pumice & Cinder Scree",
        name="Pico del Teide Montaña Blanca Pumice & Cinder Scree",
        site_id="mount-teide-volcanic-cinder-scree",
        region="Tenerife, Canary Islands, Spain",
        range="Cordillera Dorsal / Teide National Park",
        elevation_meters=3715.0,
        dominant_grading=ScreeGradingClass.UNCONSOLIDATED_MORAINE_SCREE.value,
        default_gait=DescentGaitTechnique.POLE_STABILIZED_QUAD_BRAKING.value,
        rockfall_exposure=RockfallExposureTier.MODERATE_LATERAL_CHUTE_DRIFT.value,
        description=(
            "High-altitude stratovolcano descent across deep unconsolidated pumice lapilli and abrasive basaltic cinder sheets requiring high-cuff dust gaiters and carbon poles."
        ),
        highlights=[
            "Deep volcanic pumice and lapilli cinder fields from 3,550m to 2,350m",
            "Extreme fine volcanic dust plumes necessitating sealed high-cuff gaiters and ballistic eyewear",
            "Rapid vertical drop across open volcanic cones and lava channels",
        ],
    ),
    "mount-nelson-scree-corridor": ScreeRunningSite(
        id="mount-nelson-scree-corridor",
        title="Mount Nelson East Ridge Scree & Moraine Corridor",
        name="Mount Nelson East Ridge Scree & Moraine Corridor",
        site_id="mount-nelson-scree-corridor",
        region="Purcell Mountains, British Columbia, Canada",
        range="Columbia Mountains (Purcell Range)",
        elevation_meters=3313.0,
        dominant_grading=ScreeGradingClass.HARDPAN_EMBEDDED_SCREE_SHEET.value,
        default_gait=DescentGaitTechnique.SIDEWAYS_EDGING_SKATE.value,
        rockfall_exposure=RockfallExposureTier.SEVERE_OVERHEAD_COULOIR_FUNNEL.value,
        description=(
            "High-alpine scramble ridge crest transitions into a steep hardpan-embedded quartzite scree and glacial moraine chute where ball-bearing gravel over firm dirt demands edging control."
        ),
        highlights=[
            "Exposed alpine ridge scramble transitioning into a 900m vertical quartzite scree couloir",
            "Deceptive ball-bearing surface gravel over consolidated glacial hardpan",
            "Mandatory sideways edging skate technique to prevent uncontrolled slip-outs",
        ],
    ),
}

DEFAULT_SCREE_RUNNING_GEAR: list[ScreeRunningGearItem] = [
    ScreeRunningGearItem(
        id="scree-running-high-cuff-dust-gaiters",
        item_id="scree-running-high-cuff-dust-gaiters",
        name="High-Cuff Cordura Scree & Volcanic Dust Gaiters",
        category="footwear_protection",
        mandatory=True,
        description=(
            "Abrasion-resistant 1000D Cordura ankle gaiters with replaceable under-arch Hypalon straps that seal out pea gravel, sharp shale splinters, and volcanic cinder."
        ),
        purpose=(
            "Abrasion-resistant 1000D Cordura ankle gaiters with replaceable under-arch Hypalon straps that seal out pea gravel, sharp shale splinters, and volcanic cinder."
        ),
    ),
    ScreeRunningGearItem(
        id="reinforced-toe-talus-running-shoes",
        item_id="reinforced-toe-talus-running-shoes",
        name="Reinforced TPU Toe-Cap & Rock-Plate Scree Running Shoes",
        category="footwear",
        mandatory=True,
        description=(
            "Mountain scramble running footwear featuring full-length carbon/ESS rock plates, Kevlar-reinforced uppers, and 6mm Vibram Megagrip braking lugs."
        ),
        purpose=(
            "Mountain scramble running footwear featuring full-length carbon/ESS rock plates, Kevlar-reinforced uppers, and 6mm Vibram Megagrip braking lugs."
        ),
    ),
    ScreeRunningGearItem(
        id="ultra-light-climbing-helmet-en12492",
        item_id="ultra-light-climbing-helmet-en12492",
        name="Ultra-Light EN12492 Alpine Scramble & Rockfall Helmet",
        category="head_protection",
        mandatory=True,
        description=(
            "Dual-certified EPP/EPS foam and polycarbonate shell helmet engineered for lateral and crown rockfall impacts in steep scree couloirs."
        ),
        purpose=(
            "Dual-certified EPP/EPS foam and polycarbonate shell helmet engineered for lateral and crown rockfall impacts in steep scree couloirs."
        ),
    ),
    ScreeRunningGearItem(
        id="carbon-z-pole-folding-trekking-poles",
        item_id="carbon-z-pole-folding-trekking-poles",
        name="Carbon Fiber Z-Pole Folding Trekking Poles with Scree Baskets",
        category="stability_poles",
        mandatory=True,
        description=(
            "Reinforced carbon-shaft poles with carbide flex tips and 50mm scree baskets for outrigger balance and quad-braking during high-speed talus descents."
        ),
        purpose=(
            "Reinforced carbon-shaft poles with carbide flex tips and 50mm scree baskets for outrigger balance and quad-braking during high-speed talus descents."
        ),
    ),
    ScreeRunningGearItem(
        id="leather-palm-abrasion-scramble-gloves",
        item_id="leather-palm-abrasion-scramble-gloves",
        name="Goat-Leather Palm Abrasion & Talus Scramble Gloves",
        category="hand_protection",
        mandatory=True,
        description=(
            "Full-finger breathable stretch gloves with reinforced goat-leather palms and knuckle guards to prevent lacerations during sliding arrests on sharp shale."
        ),
        purpose=(
            "Full-finger breathable stretch gloves with reinforced goat-leather palms and knuckle guards to prevent lacerations during sliding arrests on sharp shale."
        ),
    ),
    ScreeRunningGearItem(
        id="high-wrap-ballistic-sunglasses",
        item_id="high-wrap-ballistic-sunglasses",
        name="High-Wrap ANSI Z87.1 Ballistic Dust & Ricochet Sunglasses",
        category="eye_protection",
        mandatory=True,
        description=(
            "Shatterproof polycarbonate wrap-around lenses with vented foam brow seals to shield eyes from airborne silica dust and ricocheting rock chips."
        ),
        purpose=(
            "Shatterproof polycarbonate wrap-around lenses with vented foam brow seals to shield eyes from airborne silica dust and ricocheting rock chips."
        ),
    ),
]


def get_scree_running_sites(
    grading: Optional[str] = None,
) -> list[ScreeRunningSite]:
    all_sites = list(DEFAULT_SCREE_RUNNING_SITES.values())
    if not grading:
        return all_sites
    norm = grading.strip().lower().replace("-", "_").replace(" ", "_")
    return [s for s in all_sites if s.dominant_grading.lower() == norm]


def get_scree_running_site(site_id: str) -> Optional[ScreeRunningSite]:
    return DEFAULT_SCREE_RUNNING_SITES.get(site_id.strip().lower())


def get_scree_running_gear() -> list[ScreeRunningGearItem]:
    return list(DEFAULT_SCREE_RUNNING_GEAR)


def calculate_scree_running_dynamics(
    query: ScreeRunningQuery,
) -> ScreeRunningResult:
    site = get_scree_running_site(query.site_id)
    if not site:
        raise ValueError(f"Scree running site '{query.site_id}' not found")

    grading = query.scree_grading or site.dominant_grading
    gait = query.descent_gait or site.default_gait
    exposure = site.rockfall_exposure

    # Clamp inputs to realistic physical bounds
    slope_angle = min(50.0, max(15.0, float(query.slope_angle_degrees)))
    vertical_meters = min(2500.0, max(50.0, float(query.descent_vertical_meters)))
    runner_weight = min(130.0, max(40.0, float(query.runner_weight_kg)))
    scree_depth = min(60.0, max(1.0, float(query.scree_depth_cm)))

    # 1. Descent Velocity (km/h)
    grading_speed_factor = 1.0
    if grading == ScreeGradingClass.FINE_SHALE_PEA_SCREE.value:
        grading_speed_factor = 1.25
    elif grading == ScreeGradingClass.MEDIUM_SLATE_GRAVEL_SCREE.value:
        grading_speed_factor = 1.15
    elif grading == ScreeGradingClass.UNCONSOLIDATED_MORAINE_SCREE.value:
        grading_speed_factor = 0.95
    elif grading == ScreeGradingClass.HARDPAN_EMBEDDED_SCREE_SHEET.value:
        grading_speed_factor = 0.85
    elif grading == ScreeGradingClass.COARSE_ANGULAR_TALUS_RUBBLE.value:
        grading_speed_factor = 0.65

    gait_speed_factor = 1.0
    if gait == DescentGaitTechnique.HEEL_PLUNGE_SLIDING_GLIDE.value:
        gait_speed_factor = 1.2
    elif gait == DescentGaitTechnique.SIDEWAYS_EDGING_SKATE.value:
        gait_speed_factor = 1.0
    elif gait == DescentGaitTechnique.RAPID_CADENCE_HOP_BRAKING.value:
        gait_speed_factor = 0.9
    elif gait == DescentGaitTechnique.POLE_STABILIZED_QUAD_BRAKING.value:
        gait_speed_factor = 0.8

    depth_bonus = 1.08 if 12.0 <= scree_depth <= 35.0 else 0.88
    slope_factor = 0.75 + ((slope_angle - 20.0) / 30.0) * 0.55
    raw_velocity = 9.2 * grading_speed_factor * gait_speed_factor * depth_bonus * slope_factor
    descent_velocity_kmh = min(22.0, max(2.5, round(raw_velocity, 1)))

    # 2. Ankle Impact Force (kN)
    # Cushion decreases with shallower scree depth and coarser rock
    cushion_divisor = 1.0 + (scree_depth / 20.0)
    if grading == ScreeGradingClass.COARSE_ANGULAR_TALUS_RUBBLE.value:
        surface_hardness = 1.45
    elif grading == ScreeGradingClass.HARDPAN_EMBEDDED_SCREE_SHEET.value:
        surface_hardness = 1.35
    elif grading == ScreeGradingClass.UNCONSOLIDATED_MORAINE_SCREE.value:
        surface_hardness = 1.15
    elif grading == ScreeGradingClass.MEDIUM_SLATE_GRAVEL_SCREE.value:
        surface_hardness = 0.95
    else:
        surface_hardness = 0.82

    raw_impact_kn = (
        (runner_weight * 9.81 / 1000.0)
        * (2.1 + (slope_angle / 25.0))
        * surface_hardness
        / (cushion_divisor**0.45)
    )
    ankle_impact_force_kn = min(6.5, max(0.8, round(raw_impact_kn, 2)))

    # 3. Slide Arrest Distance (meters)
    angle_rad = math.radians(slope_angle)
    velocity_ms = descent_velocity_kmh / 3.6
    effective_friction = 0.65
    if grading == ScreeGradingClass.HARDPAN_EMBEDDED_SCREE_SHEET.value:
        effective_friction = 0.42
    elif grading == ScreeGradingClass.FINE_SHALE_PEA_SCREE.value:
        effective_friction = 0.58 + min(0.2, scree_depth / 120.0)
    elif grading == ScreeGradingClass.COARSE_ANGULAR_TALUS_RUBBLE.value:
        effective_friction = 0.52

    raw_arrest = (velocity_ms**2) / (
        2.0 * 9.81 * max(0.12, effective_friction - 0.35 * math.sin(angle_rad))
    )
    slide_arrest_distance_meters = min(18.0, max(0.8, round(raw_arrest, 1)))

    # 4. Scree Run Duration (minutes)
    slope_distance_m = vertical_meters / max(0.25, math.sin(angle_rad))
    duration_hours = (slope_distance_m / 1000.0) / descent_velocity_kmh
    scree_run_duration_minutes = min(240, max(3, int(round(duration_hours * 60.0))))

    # 5. Safety Status
    if (
        exposure
        in (
            RockfallExposureTier.SEVERE_OVERHEAD_COULOIR_FUNNEL.value,
            RockfallExposureTier.CRITICAL_SPONTANEOUS_SCARP_SHED.value,
        )
        and (slope_angle >= 38.0 or grading == ScreeGradingClass.COARSE_ANGULAR_TALUS_RUBBLE.value)
    ) or slope_angle >= 41.0:
        safety_status = ScreeSafetyStatus.SEVERE_ROCKFALL_WARNING.value
    elif (
        scree_depth < 8.0
        or grading
        in (
            ScreeGradingClass.COARSE_ANGULAR_TALUS_RUBBLE.value,
            ScreeGradingClass.HARDPAN_EMBEDDED_SCREE_SHEET.value,
        )
        or ankle_impact_force_kn >= 2.6
    ):
        safety_status = ScreeSafetyStatus.ELEVATED_ANKLE_HAZARD.value
    else:
        safety_status = ScreeSafetyStatus.OPTIMAL_GLIDING_CONDITIONS.value

    # 6. Braking Technique Advisory
    if gait == DescentGaitTechnique.HEEL_PLUNGE_SLIDING_GLIDE.value:
        braking_technique_advisory = (
            f"Drive heels firmly into the {scree_depth:.0f}cm gravel bed with knees flexed and weight centered over hips; "
            f"allow a controlled 1-2m ski-like slide per stride while keeping hands low with poles trailing for instant {slide_arrest_distance_meters}m arrest."
        )
    elif gait == DescentGaitTechnique.RAPID_CADENCE_HOP_BRAKING.value:
        braking_technique_advisory = (
            "Maintain ultra-short, high-cadence hop steps across shifting angular blocks; never commit full body weight to a single unstable talus slab, "
            f"and plant dual carbon poles ahead of hips to cap arrest distance within {slide_arrest_distance_meters}m."
        )
    elif gait == DescentGaitTechnique.SIDEWAYS_EDGING_SKATE.value:
        braking_technique_advisory = (
            "Angle boots 45 degrees across the fall line and carve lateral Z-turns into the hardpan-embedded scree sheet; "
            "avoid straight-line heel plunging over shallow ball-bearing gravel to prevent rear-out slips."
        )
    else:
        braking_technique_advisory = (
            "Engage quad-eccentric braking with wide outrigger pole plants in the unconsolidated moraine/cinder bed; "
            f"modulate stride length to keep ankle impact below {ankle_impact_force_kn} kN."
        )

    # 7. Gaiter and Protection Protocol
    if safety_status == ScreeSafetyStatus.SEVERE_ROCKFALL_WARNING.value:
        gaiter_and_protection_protocol = (
            "CRITICAL ROCKFALL PROTOCOL: Fasten EN12492 climbing helmet chinstrap, don goat-leather scramble gloves and ANSI Z87.1 ballistic eyewear, "
            "cinch 1000D Cordura high-cuff scree gaiters over reinforced rock-plate shoes, and descend strictly on diagonal offsets—never stacked in the fall line."
        )
    elif safety_status == ScreeSafetyStatus.ELEVATED_ANKLE_HAZARD.value:
        gaiter_and_protection_protocol = (
            "ANKLE & ABRASION PROTOCOL: Lock heel-retention laces on TPU toe-cap talus shoes, secure Hypalon under-arch gaiter straps against sharp slate/hardpan splinters, "
            "and wear leather-palm gloves plus EN12492 helmet for shallow-bed slide protection."
        )
    else:
        gaiter_and_protection_protocol = (
            "STANDARD SCREE GLIDE PROTOCOL: Seal high-cuff dust gaiters tightly over shoe collars to block pea-gravel ingress, "
            "deploy 50mm scree baskets on carbon Z-poles, and wear EN12492 helmet and wrap-around dust sunglasses throughout the chute."
        )

    return ScreeRunningResult(
        site_title=site.title,
        site_id=site.id,
        descent_velocity_kmh=descent_velocity_kmh,
        ankle_impact_force_kn=ankle_impact_force_kn,
        slide_arrest_distance_meters=slide_arrest_distance_meters,
        scree_run_duration_minutes=scree_run_duration_minutes,
        safety_status=safety_status,
        braking_technique_advisory=braking_technique_advisory,
        gaiter_and_protection_protocol=gaiter_and_protection_protocol,
    )


def detect_scree_running_intent(message: str) -> bool:
    if not message or not message.strip():
        return False

    q = message.lower().strip()

    ecommerce_exclusions = [
        "order #",
        "refund",
        "return label",
        "shipping tracking",
        "tracking number",
        "rentals",
        "rental",
        "canyon bouldering",
        "crash pad",
        "crashpad",
        "blubber pad",
        "pebble wrestling",
        "rock glacier",
        "rock-glacier",
        "periglacial",
        "blockfield",
        "felsenmeer",
        "interstitial ice",
        "active layer thaw",
        "glaciar de escombros",
        "val muragl",
        "dos lenguas",
        "tephra",
        "lapilli",
        "ash-fall",
        "ashfall",
        "volcanic ash",
        "scoria scree",
        "pumice scree",
        "cristobalite",
        "mount yasur",
        "acatenango",
        "tarawera",
        "chaiten",
        "chaitén",
        "cobble spit",
        "shingle spit",
        "kelp-wrack",
        "kelp wrack",
        "boulder reef",
        "dungeness spit",
        "chesil beach",
        "nelson boulder bank",
        "farewell spit",
        "intertidal cobble",
        "storm-berm cobble",
        "mucilage slip",
        "tsingy",
        "bemaraha",
        "ankarana",
        "rillenkarren",
        "razor limestone",
        "razor-limestone",
        "gunung api",
        "mulu pinnacles",
        "shilin",
        "naigu",
        "stone forest",
        "diaclase",
        "pinnacle karst",
        "yardang",
        "yardangs",
        "kalut",
        "kaluts",
        "dasht-e lut",
        "badain jaran",
        "lop nur",
        "dunhuang yadan",
        "barchanoid",
        "erg djourab",
        "borkou",
        "ennedi",
        "aeolian corridor",
        "talus cold trap",
        "talus-cold-trap",
        "algific",
        "balch",
        "mahoosuc",
        "king ravine",
        "indian pass",
        "anorthosite",
        "talus ice",
        "pseudokarst",
        "megatalus",
        "moss bridge",
        "cold-trap",
        "kamenec",
        "naděje",
        "phonolite",
        "driftless",
        "laterite",
        "duricrust",
        "ferricrete",
        "bauxite",
        "bowal",
        "bowé",
        "cuirasse",
        "canga",
        "serra dos carajas",
        "serra dos carajás",
        "fouta djallon",
        "mitchell plateau",
        "ngauwudu",
        "kaas plateau",
        "panchgani",
        "pisolite",
        "pisolitic",
        "buckshot gravel",
        "saprolite",
        "aluminocrete",
        "obsidian coulee",
        "obsidian-coulee",
        "obsidian flow",
        "obsidian-flow",
        "obsidian dome",
        "obsidian ridge",
        "big obsidian flow",
        "newberry caldera",
        "glass mountain",
        "medicine lake",
        "panum crater",
        "mono-inyo",
        "hrafntinnusker",
        "torfajokull",
        "torfajökull",
        "conchoidal fracture",
        "conchoidal flake",
        "volcanic glass",
        "vitrophyre",
        "rhyolite coulee",
        "quick clay",
        "quick-clay",
        "kvikkleire",
        "leda clay",
        "leda-clay",
        "champlain sea",
        "laflamme sea",
        "gauldalen",
        "gjerdrum",
        "romerike",
        "lemieux",
        "saint-jean-vianney",
        "retrogressive slump",
        "glaciomarine clay",
        "bentonite",
        "popcorn clay",
        "popcorn-clay",
        "piping tunnel",
        "piping-tunnel",
        "smectite",
        "montmorillonite",
        "gumbo clay",
        "gumbo mud",
        "sage creek",
        "chadron formation",
        "cainville",
        "factory butte",
        "mancos shale",
        "bearpaw shale",
        "red deer badlands",
        "bardenas reales",
        "pisquerra",
        "castildetierra",
    ]
    if any(ex in q for ex in ecommerce_exclusions):
        return False

    domain_keywords = [
        "scree running",
        "scree run",
        "scree descent",
        "scree slide",
        "scree sliding",
        "scree chute",
        "scree corridor",
        "talus run",
        "talus running",
        "pea scree",
        "shale scree",
        "slate scree",
        "cinder scree",
        "heel plunge",
        "heel-plunge",
        "mount sneffels",
        "wastwater screes",
        "mount stephen talus",
        "mount stephen fossil",
        "scree gaiters",
        "scree gaiter",
        "mount teide volcanic cinder",
        "mount nelson scree",
    ]

    site_matches = [
        "mount-sneffels-south-slopes",
        "mount-stephen-fossil-talus",
        "great-gable-wastwater-screes",
        "mount-teide-volcanic-cinder-scree",
        "mount-nelson-scree-corridor",
        "wastwater screes",
        "mount sneffels",
    ]

    is_explicit = any(k in q for k in domain_keywords) or any(sm in q for sm in site_matches)
    return is_explicit


def extract_scree_running_intent(message: str) -> ScreeRunningIntent:
    q = message.lower().strip()

    matched_site_id: Optional[str] = None
    if "sneffels" in q or "lavender col" in q:
        matched_site_id = "mount-sneffels-south-slopes"
    elif "stephen" in q or "trilobite" in q or "yoho" in q:
        matched_site_id = "mount-stephen-fossil-talus"
    elif "wastwater" in q or "great gable" in q or "illgill" in q or "wasdale" in q:
        matched_site_id = "great-gable-wastwater-screes"
    elif "teide" in q or "tenerife" in q or "montaña blanca" in q or "montana blanca" in q:
        matched_site_id = "mount-teide-volcanic-cinder-scree"
    elif "nelson" in q or "purcell" in q:
        matched_site_id = "mount-nelson-scree-corridor"
    else:
        for s_id in DEFAULT_SCREE_RUNNING_SITES:
            if s_id in q:
                matched_site_id = s_id
                break

    grading: Optional[str] = None
    if "fine_shale_pea_scree" in q or "pea scree" in q or "fine shale" in q:
        grading = ScreeGradingClass.FINE_SHALE_PEA_SCREE.value
    elif "medium_slate_gravel_scree" in q or "slate gravel" in q or "slate scree" in q:
        grading = ScreeGradingClass.MEDIUM_SLATE_GRAVEL_SCREE.value
    elif "coarse_angular_talus_rubble" in q or "angular talus" in q or "coarse talus" in q:
        grading = ScreeGradingClass.COARSE_ANGULAR_TALUS_RUBBLE.value
    elif "unconsolidated_moraine_scree" in q or "moraine scree" in q or "cinder scree" in q:
        grading = ScreeGradingClass.UNCONSOLIDATED_MORAINE_SCREE.value
    elif "hardpan_embedded_scree_sheet" in q or "hardpan" in q:
        grading = ScreeGradingClass.HARDPAN_EMBEDDED_SCREE_SHEET.value
    elif matched_site_id and matched_site_id in DEFAULT_SCREE_RUNNING_SITES:
        grading = DEFAULT_SCREE_RUNNING_SITES[matched_site_id].dominant_grading

    calc_keywords = [
        "calculate",
        "calculation",
        "velocity",
        "ankle impact",
        "impact force",
        "slide arrest",
        "arrest distance",
        "dynamics",
        "duration",
        "kn",
        "km/h",
    ]
    gear_keywords = [
        "gear",
        "checklist",
        "equipment",
        "kit",
        "gaiters",
        "gaiter",
        "helmet",
        "trekking poles",
        "z-pole",
        "scramble gloves",
        "ballistic sunglasses",
        "talus running shoes",
    ]

    if any(k in q for k in calc_keywords):
        action: Literal["catalog", "get_site", "calculate", "gear_checklist"] = "calculate"
    elif any(k in q for k in gear_keywords):
        action = "gear_checklist"
    elif matched_site_id and any(
        k in q
        for k in [
            "detail",
            "details",
            "about",
            "tell me",
            "describe",
            "highlights",
            "site",
            "elevation",
            "rockfall",
            "route",
        ]
    ):
        action = "get_site"
    elif matched_site_id and not any(
        k in q for k in ["sites", "catalog", "list", "options", "all"]
    ):
        action = "get_site"
    else:
        action = "catalog"

    return ScreeRunningIntent(
        action=action,
        site_id=matched_site_id,
        query=message,
        grading=grading,
    )


def format_scree_running_response(
    action: Union[ScreeRunningIntent, str],
    message: Any = None,
) -> FormattedScreeRunningResponse:
    if isinstance(message, dict) and "scree_running_info" in message:
        answer = str(
            message.get(
                "answer",
                "High-Altitude Alpine Scramble Ridge Crest Scree Running guidance",
            )
        )
        return FormattedScreeRunningResponse(answer, message)

    intent_obj: ScreeRunningIntent
    if isinstance(action, ScreeRunningIntent):
        intent_obj = action
    elif isinstance(action, str):
        if action in ("scree_running", "scree") and isinstance(message, str):
            intent_obj = extract_scree_running_intent(message)
        elif action in ("calculate", "calculate_dynamics"):
            intent_obj = ScreeRunningIntent(action="calculate")
        elif action in ("gear", "gear_checklist"):
            intent_obj = ScreeRunningIntent(action="gear_checklist")
        elif action in ("get_site", "site_detail", "detail"):
            site_id = (
                message
                if isinstance(message, str) and message in DEFAULT_SCREE_RUNNING_SITES
                else None
            )
            intent_obj = ScreeRunningIntent(action="get_site", site_id=site_id)
        else:
            intent_obj = ScreeRunningIntent(action="catalog")
    else:
        intent_obj = ScreeRunningIntent(action="catalog")

    resolved_action = intent_obj.action

    if resolved_action == "calculate":
        if isinstance(message, ScreeRunningResult):
            calc_res = message
        elif isinstance(message, ScreeRunningQuery):
            calc_res = calculate_scree_running_dynamics(message)
        else:
            calc_q = ScreeRunningQuery(site_id=intent_obj.site_id or "mount-sneffels-south-slopes")
            calc_res = calculate_scree_running_dynamics(calc_q)

        answer = (
            f"Alpine Scree Running Dynamics for {calc_res.site_title}: "
            f"Descent Velocity: {calc_res.descent_velocity_kmh} km/h. "
            f"Ankle Impact Force: {calc_res.ankle_impact_force_kn} kN. "
            f"Slide Arrest Distance: {calc_res.slide_arrest_distance_meters}m. "
            f"Run Duration: {calc_res.scree_run_duration_minutes} min. "
            f"Safety Status: {calc_res.safety_status.upper()}. "
            f"Braking Advisory: {calc_res.braking_technique_advisory} "
            f"Protection Protocol: {calc_res.gaiter_and_protection_protocol}"
        )
        calc_info: dict[str, Any] = {
            "scree_running_info": {
                "action": "calculate",
                "site_id": calc_res.site_id,
                "calculation": calc_res.model_dump(),
                "descent_velocity_kmh": calc_res.descent_velocity_kmh,
                "ankle_impact_force_kn": calc_res.ankle_impact_force_kn,
                "slide_arrest_distance_meters": calc_res.slide_arrest_distance_meters,
                "scree_run_duration_minutes": calc_res.scree_run_duration_minutes,
                "safety_status": calc_res.safety_status,
                "braking_technique_advisory": calc_res.braking_technique_advisory,
                "gaiter_and_protection_protocol": calc_res.gaiter_and_protection_protocol,
            },
            "answer": answer,
        }
        return FormattedScreeRunningResponse(answer, calc_info)

    if resolved_action == "gear_checklist":
        checklist = message if isinstance(message, list) else get_scree_running_gear()
        items_str = "; ".join(f"{g.name} ({g.description})" for g in checklist)
        answer = (
            f"Mandatory High-Altitude Alpine Scree Running Gear Checklist ({len(checklist)} items): "
            f"{items_str}. High-cuff Cordura scree gaiters, reinforced rock-plate shoes, EN12492 climbing helmets, "
            f"carbon Z-poles, leather-palm scramble gloves, and ballistic eyewear are mandatory."
        )
        gear_info: dict[str, Any] = {
            "scree_running_info": {
                "action": "gear_checklist",
                "gear": [g.model_dump() for g in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedScreeRunningResponse(answer, gear_info)

    if resolved_action == "get_site":
        site = None
        if intent_obj.site_id:
            site = get_scree_running_site(intent_obj.site_id)
        if not site and isinstance(message, ScreeRunningSite):
            site = message
        if not site and isinstance(message, str):
            site = get_scree_running_site(message)
        if not site:
            site = get_scree_running_site("mount-sneffels-south-slopes")

        if site:
            highlights_str = ", ".join(site.highlights)
            answer = (
                f"Scree Running Site: {site.title} ({site.range}, {site.region}). "
                f"Elevation: {site.elevation_meters}m | Dominant Grading: {site.dominant_grading} | "
                f"Default Gait: {site.default_gait} | Rockfall Exposure: {site.rockfall_exposure}. "
                f"{site.description} Key Highlights: {highlights_str}."
            )
            site_info: dict[str, Any] = {
                "scree_running_info": {
                    "action": "get_site",
                    "site_id": site.id,
                    "site": site.model_dump(),
                },
                "answer": answer,
            }
            return FormattedScreeRunningResponse(answer, site_info)

    sites = (
        message
        if isinstance(message, list)
        else get_scree_running_sites(grading=intent_obj.grading)
    )
    summary_str = "; ".join(
        f"{s.title} ({s.region}, {s.elevation_meters}m, grading: {s.dominant_grading})"
        for s in sites
    )
    answer = (
        f"Contoso High-Altitude Alpine Scree Running Catalog ({len(sites)} sites): {summary_str}. "
        "Inquire about specific scree chutes, heel-plunge descent dynamics, or mandatory scree gaiters and rockfall protection."
    )
    catalog_info: dict[str, Any] = {
        "scree_running_info": {
            "action": "catalog",
            "grading": intent_obj.grading,
            "sites": [s.model_dump() for s in sites],
        },
        "answer": answer,
    }
    return FormattedScreeRunningResponse(answer, catalog_info)


def build_scree_running_prompt(
    intent: Any = None,
    site: Optional[ScreeRunningSite] = None,
    result: Optional[ScreeRunningResult] = None,
    gear: Optional[list[ScreeRunningGearItem]] = None,
) -> str:
    lines = [
        "High-Altitude Alpine Scramble Ridge Crest Scree Running Guidance:",
        "- Scree Grading & Cushion Physics: Fine shale pea-scree and medium slate gravel (15-30cm depth) absorb kinetic impact and allow controlled heel-plunge gliding; coarse angular talus or shallow ball-bearing gravel over hardpan demands rapid hop-braking or sideways edging skate.",
        "- Descent Gait & Slide Arrest: Keep center of gravity low over flexed knees with carbon Z-poles trailing as outriggers; never over-stride on shallow hardpan sheets.",
        "- Rockfall & Couloir Spacing: In funnels and beneath scarps, descend on diagonal offsets or one-at-a-time to eliminate overhead rockfall trajectories.",
        "- Mandatory 6-Item Scree Running Kit: High-Cuff Cordura Scree Gaiters, Reinforced TPU Toe-Cap Rock-Plate Shoes, Ultra-Light EN12492 Climbing Helmet, Carbon Z-Pole Folding Trekking Poles, Goat-Leather Palm Scramble Gloves, and ANSI Z87.1 Ballistic Sunglasses.",
    ]

    site_id: Optional[str] = None
    if site is not None:
        site_id = site.id
    elif isinstance(intent, ScreeRunningIntent) and intent.site_id:
        site_id = intent.site_id
    elif isinstance(intent, str):
        if intent in DEFAULT_SCREE_RUNNING_SITES:
            site_id = intent
        elif detect_scree_running_intent(intent):
            extracted = extract_scree_running_intent(intent)
            if extracted and extracted.site_id:
                site_id = extracted.site_id

    resolved_site = site or (get_scree_running_site(site_id) if site_id else None)
    if resolved_site:
        lines.append(
            f"- Focused Scree Running Site: {resolved_site.title} ({resolved_site.region}, Range: {resolved_site.range}, "
            f"Elevation: {resolved_site.elevation_meters}m, Dominant Grading: {resolved_site.dominant_grading}, "
            f"Default Gait: {resolved_site.default_gait}, Rockfall Exposure: {resolved_site.rockfall_exposure})"
        )

    if result is not None:
        lines.append(
            f"- Calculated Descent Dynamics: Velocity {result.descent_velocity_kmh} km/h, "
            f"Ankle Impact {result.ankle_impact_force_kn} kN, Arrest Distance {result.slide_arrest_distance_meters}m, "
            f"Duration {result.scree_run_duration_minutes} min, Safety Status {result.safety_status}"
        )

    if gear is not None and len(gear) > 0:
        lines.append(f"- Gear Checklist ({len(gear)} items): {', '.join(g.name for g in gear)}")

    return "\n".join(lines)


def scree_running_tool(
    query: Optional[ScreeRunningQuery] = None,
    action: Optional[str] = None,
    site_id: Optional[str] = None,
    grading: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    if action in ("calculate", "calculate_dynamics") or query is not None:
        calc_q = query or ScreeRunningQuery(site_id=site_id or "mount-sneffels-south-slopes")
        res = calculate_scree_running_dynamics(calc_q)
        formatted = format_scree_running_response("calculate", res)
        return dict(formatted._data)

    if action in ("gear", "gear_checklist"):
        checklist = get_scree_running_gear()
        formatted = format_scree_running_response("gear_checklist", checklist)
        return dict(formatted._data)

    if action in ("get_site", "site_detail", "detail") and site_id:
        site = get_scree_running_site(site_id)
        if site:
            formatted = format_scree_running_response("get_site", site)
            return dict(formatted._data)

    sites = get_scree_running_sites(grading=grading)
    formatted = format_scree_running_response("catalog", sites)
    return dict(formatted._data)
