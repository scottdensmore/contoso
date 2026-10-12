from enum import Enum
from typing import Any, Literal, Optional, Union

from pydantic import BaseModel, Field, model_validator


class GlacierTerrainZone(str, Enum):
    UPPER_FIRN_ACCUMULATION_BASIN = "upper_firn_accumulation_basin"
    COMPRESSED_ICEFALL_SERAC_CORRIDOR = "compressed_icefall_serac_corridor"
    CREVASSE_LATTICE_TRANSITION_ZONE = "crevasse_lattice_transition_zone"
    BERGSCHRUND_HEADWALL_CHUTE = "bergschrund_headwall_chute"
    SUBGLACIAL_MORAINE_TERMINAL_TONGUE = "subglacial_moraine_terminal_tongue"


class SnowpackBridgeStability(str, Enum):
    DENSE_WIND_SLAB_BRIDGE = "dense_wind_slab_bridge"
    SETTLED_SPRING_FIRN_BRIDGE = "settled_spring_firn_bridge"
    UNCONSOLIDATED_POWDER_WEAK_BRIDGE = "unconsolidated_powder_weak_bridge"
    HONEYCOMBED_THERMAL_ABLATION_BRIDGE = "honeycombed_thermal_ablation_bridge"


class RopeTravelProtocol(str, Enum):
    ROPED_SKI_TANDEM_GLACIER_TRAVERSE = "roped_ski_tandem_glacier_traverse"
    SKI_CREVASSE_BRAKE_KNOT_SPREAD = "ski_crevasse_brake_knot_spread"
    UNROPED_RAPID_SERAC_HAZARD_SPRINT = "unroped_rapid_serac_hazard_sprint"
    GUIDE_BELAYED_COULOIR_SKI_DROP = "guide_belayed_couloir_ski_drop"


class TraverseHazardLevel(str, Enum):
    LOW_COLD_STABLE_ACCUMULATION = "low_cold_stable_accumulation"
    MODERATE_SEASONAL_BRIDGE_SOFTENING = "moderate_seasonal_bridge_softening"
    SEVERE_SERAC_TOPPLING_EXPOSURE = "severe_serac_toppling_exposure"
    EXTREME_DYNAMIC_ICEFALL_COLLAPSE = "extreme_dynamic_icefall_collapse"


class GlacierSkiTraverseSite(BaseModel):
    id: str
    title: str = ""
    name: str = ""
    site_id: str = ""
    region: str = ""
    range: str = ""
    elevation_meters: float = 0.0
    dominant_zone: str = GlacierTerrainZone.CREVASSE_LATTICE_TRANSITION_ZONE.value
    bridge_stability: str = SnowpackBridgeStability.SETTLED_SPRING_FIRN_BRIDGE.value
    default_protocol: str = RopeTravelProtocol.ROPED_SKI_TANDEM_GLACIER_TRAVERSE.value
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
                "dominantZone": "dominant_zone",
                "bridgeStability": "bridge_stability",
                "defaultProtocol": "default_protocol",
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
    def dominantZone(self) -> str:
        return self.dominant_zone

    @property
    def bridgeStability(self) -> str:
        return self.bridge_stability

    @property
    def defaultProtocol(self) -> str:
        return self.default_protocol


class GlacierSkiTraverseQuery(BaseModel):
    site_id: str = "haute-route-chamonix-zermatt"
    terrain_zone: Optional[str] = None
    bridge_stability: Optional[str] = None
    travelers_count: int = 2
    pack_weight_kg: float = 14.0
    ski_width_waist_mm: float = 95.0
    slope_angle_degrees: float = 28.0
    ambient_temperature_c: float = -4.0

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "siteId": "site_id",
                "terrainZone": "terrain_zone",
                "dominantZone": "terrain_zone",
                "dominant_zone": "terrain_zone",
                "bridgeStability": "bridge_stability",
                "travelersCount": "travelers_count",
                "teamSize": "travelers_count",
                "team_size": "travelers_count",
                "packWeightKg": "pack_weight_kg",
                "skiWidthWaistMm": "ski_width_waist_mm",
                "slopeAngleDegrees": "slope_angle_degrees",
                "ambientTemperatureC": "ambient_temperature_c",
                "ambientTempC": "ambient_temperature_c",
            }
            for k, v in mapping.items():
                if k in data and v not in data:
                    data[v] = data[k]
        return data

    @property
    def siteId(self) -> str:
        return self.site_id

    @property
    def terrainZone(self) -> Optional[str]:
        return self.terrain_zone

    @property
    def bridgeStability(self) -> Optional[str]:
        return self.bridge_stability

    @property
    def travelersCount(self) -> int:
        return self.travelers_count

    @property
    def packWeightKg(self) -> float:
        return self.pack_weight_kg

    @property
    def skiWidthWaistMm(self) -> float:
        return self.ski_width_waist_mm

    @property
    def slopeAngleDegrees(self) -> float:
        return self.slope_angle_degrees

    @property
    def ambientTemperatureC(self) -> float:
        return self.ambient_temperature_c


class GlacierSkiTraverseResult(BaseModel):
    site_title: str
    site_id: Optional[str] = None
    bridge_ground_pressure_kpa: float
    crevasse_bridge_failure_risk: float
    serac_corridor_exposure_time_minutes: int
    recommended_rope_spacing_meters: int
    hazard_level: str
    rope_travel_advisory: str
    emergency_ski_rescue_protocol: str

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "siteTitle": "site_title",
                "siteId": "site_id",
                "bridgeGroundPressureKpa": "bridge_ground_pressure_kpa",
                "crevasseBridgeFailureRisk": "crevasse_bridge_failure_risk",
                "seracCorridorExposureTimeMinutes": "serac_corridor_exposure_time_minutes",
                "recommendedRopeSpacingMeters": "recommended_rope_spacing_meters",
                "hazardLevel": "hazard_level",
                "ropeTravelAdvisory": "rope_travel_advisory",
                "emergencySkiRescueProtocol": "emergency_ski_rescue_protocol",
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
    def bridgeGroundPressureKpa(self) -> float:
        return self.bridge_ground_pressure_kpa

    @property
    def crevasseBridgeFailureRisk(self) -> float:
        return self.crevasse_bridge_failure_risk

    @property
    def seracCorridorExposureTimeMinutes(self) -> int:
        return self.serac_corridor_exposure_time_minutes

    @property
    def recommendedRopeSpacingMeters(self) -> int:
        return self.recommended_rope_spacing_meters

    @property
    def hazardLevel(self) -> str:
        return self.hazard_level

    @property
    def ropeTravelAdvisory(self) -> str:
        return self.rope_travel_advisory

    @property
    def emergencySkiRescueProtocol(self) -> str:
        return self.emergency_ski_rescue_protocol


class GlacierSkiTraverseGearItem(BaseModel):
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


class GlacierSkiTraverseIntent(BaseModel):
    action: Literal["catalog", "get_site", "calculate", "gear_checklist"] = "catalog"
    site_id: Optional[str] = None
    query: Optional[str] = None
    zone: Optional[str] = None


class FormattedGlacierSkiTraverseResponse(str):
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


DEFAULT_GLACIER_SKI_TRAVERSE_SITES: dict[str, GlacierSkiTraverseSite] = {
    "haute-route-chamonix-zermatt": GlacierSkiTraverseSite(
        id="haute-route-chamonix-zermatt",
        title="Classic Haute Route Glacier Ski-Traverse (Chamonix to Zermatt)",
        name="Classic Haute Route Glacier Ski-Traverse (Chamonix to Zermatt)",
        site_id="haute-route-chamonix-zermatt",
        region="Haute-Savoie / Valais, France & Switzerland",
        range="Mont Blanc & Pennine Alps",
        elevation_meters=3790.0,
        dominant_zone=GlacierTerrainZone.CREVASSE_LATTICE_TRANSITION_ZONE.value,
        bridge_stability=SnowpackBridgeStability.SETTLED_SPRING_FIRN_BRIDGE.value,
        default_protocol=RopeTravelProtocol.ROPED_SKI_TANDEM_GLACIER_TRAVERSE.value,
        description=(
            "The quintessential high-alpine ski-traverse weaving between massive sérac fields and crevassed névé basins from Argentière to Zermatt under the Matterhorn."
        ),
        highlights=[
            "Traverse of the Plateau du Couloir and Mont Vélan glacier passes",
            "Critical navigation across the fractured Glacier de Saleina crevasse labyrinth",
            "High-speed descent down the Stockji Glacier serac bench to Zmutt",
        ],
    ),
    "spearhead-traverse-whistler": GlacierSkiTraverseSite(
        id="spearhead-traverse-whistler",
        title="Spearhead Horseshoe Glacier Ski-Traverse",
        name="Spearhead Horseshoe Glacier Ski-Traverse",
        site_id="spearhead-traverse-whistler",
        region="Garibaldi Provincial Park, British Columbia, Canada",
        range="Coast Mountains",
        elevation_meters=2640.0,
        dominant_zone=GlacierTerrainZone.BERGSCHRUND_HEADWALL_CHUTE.value,
        bridge_stability=SnowpackBridgeStability.DENSE_WIND_SLAB_BRIDGE.value,
        default_protocol=RopeTravelProtocol.GUIDE_BELAYED_COULOIR_SKI_DROP.value,
        description=(
            "Rugged horseshoe circumnavigation crossing 13 glaciers and technical alpine cols between Whistler and Blackcomb mountains."
        ),
        highlights=[
            "Steep bootpack and ski descents of Overlord and Tremor Col bergschrund headwalls",
            "Wind-scoured crevasse bridges across the expansive MacBeth Glacier",
            "Dynamic coastal snowpack transitions with maritime wind-slab bridging",
        ],
    ),
    "wapta-traverse-canadian-rockies": GlacierSkiTraverseSite(
        id="wapta-traverse-canadian-rockies",
        title="Wapta Icefield Continental Divide Ski-Traverse",
        name="Wapta Icefield Continental Divide Ski-Traverse",
        site_id="wapta-traverse-canadian-rockies",
        region="Banff & Yoho National Parks, Alberta & British Columbia, Canada",
        range="Canadian Rockies (Continental Divide)",
        elevation_meters=2850.0,
        dominant_zone=GlacierTerrainZone.UPPER_FIRN_ACCUMULATION_BASIN.value,
        bridge_stability=SnowpackBridgeStability.UNCONSOLIDATED_POWDER_WEAK_BRIDGE.value,
        default_protocol=RopeTravelProtocol.SKI_CREVASSE_BRAKE_KNOT_SPREAD.value,
        description=(
            "Expansive continental icefield traverse over high-elevation firn plateaus, requiring roped glacier travel due to cold, faceted winter snowbridges."
        ),
        highlights=[
            "Vast low-angle firn basins crossing Peyto, Bow, and Balfour Glaciers",
            "High-exposure Balfour High Col icefall navigation between sheer seracs",
            "Cold continental snowpack with persistent depth hoar and weak bridge spans",
        ],
    ),
    "berner-oberland-ski-traverse": GlacierSkiTraverseSite(
        id="berner-oberland-ski-traverse",
        title="Bernese Oberland Jungfrau-Aletsch Glacier Ski-Traverse",
        name="Bernese Oberland Jungfrau-Aletsch Glacier Ski-Traverse",
        site_id="berner-oberland-ski-traverse",
        region="Canton of Bern / Valais, Switzerland",
        range="Bernese Alps",
        elevation_meters=3460.0,
        dominant_zone=GlacierTerrainZone.COMPRESSED_ICEFALL_SERAC_CORRIDOR.value,
        bridge_stability=SnowpackBridgeStability.SETTLED_SPRING_FIRN_BRIDGE.value,
        default_protocol=RopeTravelProtocol.UNROPED_RAPID_SERAC_HAZARD_SPRINT.value,
        description=(
            "Massive glaciated alpine traverse traversing the Great Aletsch Glacier—the longest glacier in the Alps—through towering serac bands and icefalls."
        ),
        highlights=[
            "Fast-paced descent through the fractured Konkordiaplatz ice confluence",
            "Overhanging sérac hazard exposure along the Lötschenlücke descent chute",
            "Deep firn reservoirs feeding the 23-kilometer Great Aletsch ice highway",
        ],
    ),
    "wrangell-st-elias-bagley-icefield": GlacierSkiTraverseSite(
        id="wrangell-st-elias-bagley-icefield",
        title="Bagley Icefield & St. Elias Wilderness Glacier Ski Expedition",
        name="Bagley Icefield & St. Elias Wilderness Glacier Ski Expedition",
        site_id="wrangell-st-elias-bagley-icefield",
        region="Wrangell-St. Elias National Park and Preserve, Alaska, USA",
        range="Saint Elias Mountains",
        elevation_meters=3100.0,
        dominant_zone=GlacierTerrainZone.SUBGLACIAL_MORAINE_TERMINAL_TONGUE.value,
        bridge_stability=SnowpackBridgeStability.HONEYCOMBED_THERMAL_ABLATION_BRIDGE.value,
        default_protocol=RopeTravelProtocol.ROPED_SKI_TANDEM_GLACIER_TRAVERSE.value,
        description=(
            "Subarctic wilderness ski-traverse across North America’s largest non-polar icefield, navigating gargantuan crevasses, surging ice, and terminal moraine debris."
        ),
        highlights=[
            "Expansive 200-kilometer glacial system with crevasses wide enough to engulf aircraft",
            "Summer thermal ablation creating honeycombed rotten bridges and supraglacial rivers",
            "Extreme isolation requiring multi-week self-sufficiency and full crevasse hauling kits",
        ],
    ),
}

DEFAULT_GLACIER_SKI_TRAVERSE_GEAR: list[GlacierSkiTraverseGearItem] = [
    GlacierSkiTraverseGearItem(
        id="glacier-skimo-harness-with-ski-slots",
        item_id="glacier-skimo-harness-with-ski-slots",
        name="Ultralight Glacier Skimo Harness with Clip-In Ski Slots",
        category="harness_rigging",
        mandatory=True,
        description=(
            "Specialized mountaineering harness designed to don without removing skis or crampons, equipped with reinforced crevasse tie-in loops and ice screw clips."
        ),
        purpose=(
            "Specialized mountaineering harness designed to don without removing skis or crampons, equipped with reinforced crevasse tie-in loops and ice screw clips."
        ),
    ),
    GlacierSkiTraverseGearItem(
        id="lightweight-hyperstatic-crevasse-rescue-cord",
        item_id="lightweight-hyperstatic-crevasse-rescue-cord",
        name="Lightweight Hyperstatic Crevasse Rescue Cord (6mm x 30m Rad Line)",
        category="rescue_rope",
        mandatory=True,
        description=(
            "Aramid-core hyperstatic rope with <2% elongation under skier load, preventing rope cutting into crevasse snow lips during arrest and haul operations."
        ),
        purpose=(
            "Aramid-core hyperstatic rope with <2% elongation under skier load, preventing rope cutting into crevasse snow lips during arrest and haul operations."
        ),
    ),
    GlacierSkiTraverseGearItem(
        id="ultra-compact-ski-crevasse-pulley-progress-capture",
        item_id="ultra-compact-ski-crevasse-pulley-progress-capture",
        name="Ultra-Compact Ski Crevasse Pulley & Progress Capture Device",
        category="pulley_capture",
        mandatory=True,
        description=(
            "High-efficiency micro-pulley with integrated toothed cam for 3:1 Z-drag and 6:1 complex mechanical advantage hauling systems."
        ),
        purpose=(
            "High-efficiency micro-pulley with integrated toothed cam for 3:1 Z-drag and 6:1 complex mechanical advantage hauling systems."
        ),
    ),
    GlacierSkiTraverseGearItem(
        id="titanium-tech-ski-crampons-ski-mountaineering",
        item_id="titanium-tech-ski-crampons-ski-mountaineering",
        name="Titanium Tech Ski Crampons for Dynafit/Pin Ski Mountaineering Bindings",
        category="traction",
        mandatory=True,
        description=(
            "Serrated aluminum-titanium ski crampons (couteaux) providing lateral bite on bulletproof wind crust and steep serac icy ramps."
        ),
        purpose=(
            "Serrated aluminum-titanium ski crampons (couteaux) providing lateral bite on bulletproof wind crust and steep serac icy ramps."
        ),
    ),
    GlacierSkiTraverseGearItem(
        id="ski-tail-anchor-snow-picket-system",
        item_id="ski-tail-anchor-snow-picket-system",
        name="Ski-Tail Anchor Snow Picket & Deadman Rescue System",
        category="snow_anchor",
        mandatory=True,
        description=(
            "Dual-purpose cable swaged aluminum picket and ski-tail t-slot connector for creating bombproof snow anchors in unconsolidated firn."
        ),
        purpose=(
            "Dual-purpose cable swaged aluminum picket and ski-tail t-slot connector for creating bombproof snow anchors in unconsolidated firn."
        ),
    ),
    GlacierSkiTraverseGearItem(
        id="collapsible-avalanche-crevasse-probe-320cm",
        item_id="collapsible-avalanche-crevasse-probe-320cm",
        name="Collapsible Avalanche & Crevasse Sounding Probe (320cm Depth)",
        category="probe",
        mandatory=True,
        description=(
            "Extra-long depth-graduated probe designed to sound for hidden crevasse voids, assess snowbridge thickness, and verify subsurface ice integrity."
        ),
        purpose=(
            "Extra-long depth-graduated probe designed to sound for hidden crevasse voids, assess snowbridge thickness, and verify subsurface ice integrity."
        ),
    ),
]


def get_glacier_ski_traverse_sites(
    zone: Optional[str] = None,
) -> list[GlacierSkiTraverseSite]:
    all_sites = list(DEFAULT_GLACIER_SKI_TRAVERSE_SITES.values())
    if not zone:
        return all_sites
    norm = zone.strip().lower()
    return [s for s in all_sites if s.dominant_zone.lower() == norm]


def get_glacier_ski_traverse_site(site_id: str) -> Optional[GlacierSkiTraverseSite]:
    return DEFAULT_GLACIER_SKI_TRAVERSE_SITES.get(site_id.strip().lower())


def get_glacier_ski_traverse_gear() -> list[GlacierSkiTraverseGearItem]:
    return list(DEFAULT_GLACIER_SKI_TRAVERSE_GEAR)


def calculate_glacier_ski_traverse_dynamics(
    query: GlacierSkiTraverseQuery,
) -> GlacierSkiTraverseResult:
    site = get_glacier_ski_traverse_site(query.site_id)
    if not site:
        raise ValueError(f"Glacier ski traverse site '{query.site_id}' not found")

    terrain_zone = query.terrain_zone or site.dominant_zone
    bridge_stability = query.bridge_stability or site.bridge_stability
    protocol = site.default_protocol

    # Clamping inputs to physical operational limits
    travelers_count = min(8, max(1, round(query.travelers_count or 2)))
    pack_weight_kg = min(45.0, max(0.0, float(query.pack_weight_kg)))
    ski_width_waist_mm = min(130.0, max(65.0, float(query.ski_width_waist_mm)))
    slope_angle_degrees = min(60.0, max(0.0, float(query.slope_angle_degrees)))
    ambient_temperature_c = min(15.0, max(-35.0, float(query.ambient_temperature_c)))

    # 1. Bridge Ground Pressure (3.5 to 18.0 kPa)
    skier_mass_kg = 75.0
    total_mass_kg = skier_mass_kg + pack_weight_kg
    effective_area_m2 = 2.0 * 1.65 * (ski_width_waist_mm / 1000.0) * 0.72
    raw_pressure_kpa = ((total_mass_kg * 9.80665) / effective_area_m2 / 1000.0) * 2.2
    bridge_ground_pressure_kpa = min(
        18.0, max(3.5, round(raw_pressure_kpa, 1))
    )

    # 2. Crevasse Bridge Failure Risk (0.00 to 1.00)
    base_risk = 0.28
    if bridge_stability == SnowpackBridgeStability.DENSE_WIND_SLAB_BRIDGE.value:
        base_risk = 0.16
    elif bridge_stability == SnowpackBridgeStability.SETTLED_SPRING_FIRN_BRIDGE.value:
        base_risk = 0.26
    elif bridge_stability == SnowpackBridgeStability.UNCONSOLIDATED_POWDER_WEAK_BRIDGE.value:
        base_risk = 0.56
    elif bridge_stability == SnowpackBridgeStability.HONEYCOMBED_THERMAL_ABLATION_BRIDGE.value:
        base_risk = 0.72

    # Temperature effect
    temp_delta = 0.0
    if ambient_temperature_c > 0:
        temp_delta = ambient_temperature_c * 0.045
    elif ambient_temperature_c < -15.0:
        temp_delta = (-15.0 - ambient_temperature_c) * 0.012

    # Ground pressure impact
    pressure_factor = ((bridge_ground_pressure_kpa - 7.0) / 10.0) * 0.18

    # Zone multiplier
    zone_factor = 0.0
    if terrain_zone == GlacierTerrainZone.BERGSCHRUND_HEADWALL_CHUTE.value:
        zone_factor = 0.08
    elif terrain_zone == GlacierTerrainZone.CREVASSE_LATTICE_TRANSITION_ZONE.value:
        zone_factor = 0.06
    elif terrain_zone == GlacierTerrainZone.COMPRESSED_ICEFALL_SERAC_CORRIDOR.value:
        zone_factor = 0.05

    raw_risk = base_risk + temp_delta + pressure_factor + zone_factor
    crevasse_bridge_failure_risk = min(
        1.0, max(0.0, round(raw_risk, 2))
    )

    # 3. Serac Corridor Exposure Time (5 to 120 minutes)
    base_exposure_minutes = 20
    if terrain_zone == GlacierTerrainZone.COMPRESSED_ICEFALL_SERAC_CORRIDOR.value:
        base_exposure_minutes = 65
    elif terrain_zone == GlacierTerrainZone.CREVASSE_LATTICE_TRANSITION_ZONE.value:
        base_exposure_minutes = 45
    elif terrain_zone == GlacierTerrainZone.BERGSCHRUND_HEADWALL_CHUTE.value:
        base_exposure_minutes = 35
    elif terrain_zone == GlacierTerrainZone.SUBGLACIAL_MORAINE_TERMINAL_TONGUE.value:
        base_exposure_minutes = 25
    elif terrain_zone == GlacierTerrainZone.UPPER_FIRN_ACCUMULATION_BASIN.value:
        base_exposure_minutes = 15

    slope_factor = (slope_angle_degrees - 20.0) * 0.85
    travelers_factor = (travelers_count - 2) * 4
    raw_exposure = base_exposure_minutes + slope_factor + travelers_factor
    serac_corridor_exposure_time_minutes = min(
        120, max(5, int(round(raw_exposure)))
    )

    # 4. Recommended Rope Spacing (10 to 25 meters)
    base_spacing = 15
    if protocol == RopeTravelProtocol.SKI_CREVASSE_BRAKE_KNOT_SPREAD.value:
        base_spacing = 18
    elif protocol == RopeTravelProtocol.GUIDE_BELAYED_COULOIR_SKI_DROP.value:
        base_spacing = 22
    elif protocol == RopeTravelProtocol.UNROPED_RAPID_SERAC_HAZARD_SPRINT.value:
        base_spacing = 11
    elif protocol == RopeTravelProtocol.ROPED_SKI_TANDEM_GLACIER_TRAVERSE.value:
        base_spacing = 15

    risk_adjustment = 3 if crevasse_bridge_failure_risk > 0.45 else 0
    team_adjustment = 2 if travelers_count <= 2 else -1
    raw_spacing = base_spacing + risk_adjustment + team_adjustment
    recommended_rope_spacing_meters = min(
        25, max(10, int(round(raw_spacing)))
    )

    # 5. Traverse Hazard Level
    if (
        (terrain_zone == GlacierTerrainZone.COMPRESSED_ICEFALL_SERAC_CORRIDOR.value and serac_corridor_exposure_time_minutes >= 40)
        or crevasse_bridge_failure_risk >= 0.75
    ):
        hazard_level = TraverseHazardLevel.EXTREME_DYNAMIC_ICEFALL_COLLAPSE.value
    elif serac_corridor_exposure_time_minutes >= 35 or crevasse_bridge_failure_risk >= 0.6:
        hazard_level = TraverseHazardLevel.SEVERE_SERAC_TOPPLING_EXPOSURE.value
    elif (
        ambient_temperature_c >= 1.0
        or bridge_stability == SnowpackBridgeStability.HONEYCOMBED_THERMAL_ABLATION_BRIDGE.value
        or crevasse_bridge_failure_risk >= 0.35
    ):
        hazard_level = TraverseHazardLevel.MODERATE_SEASONAL_BRIDGE_SOFTENING.value
    else:
        hazard_level = TraverseHazardLevel.LOW_COLD_STABLE_ACCUMULATION.value

    # 6. Rope Travel Advisory
    if protocol == RopeTravelProtocol.UNROPED_RAPID_SERAC_HAZARD_SPRINT.value:
        rope_travel_advisory = (
            "Sprint through serac collapse fall line without roping up to eliminate collective drag risk; "
            "maintain 50m visual intervals and rendezvous only on reinforced moraine benches."
        )
    elif protocol == RopeTravelProtocol.GUIDE_BELAYED_COULOIR_SKI_DROP.value:
        rope_travel_advisory = (
            "Anchor lead skier with T-slot deadman picket before skiing bergschrund drop; "
            "maintain tight guide belay and ski one-at-a-time to prevent avalanche triggering on crevasse lips."
        )
    elif protocol == RopeTravelProtocol.SKI_CREVASSE_BRAKE_KNOT_SPREAD.value:
        rope_travel_advisory = (
            f"Tie 3 butterfly brake knots along the {recommended_rope_spacing_meters}m traveler interval "
            "to jam into crevasse lips upon breakthrough; keep rope taut and avoid s-turns crossing hidden transverse fractures."
        )
    else:
        rope_travel_advisory = (
            f"Maintain constant tension on {recommended_rope_spacing_meters}m glacier traverse rope; "
            "keep ski tips angled perpendicular to suspected crevasse azimuths and ski in tracks of the probe scout."
        )

    # 7. Emergency Ski Rescue Protocol
    if hazard_level == TraverseHazardLevel.EXTREME_DYNAMIC_ICEFALL_COLLAPSE.value:
        emergency_ski_rescue_protocol = (
            "Emergency Drop-Loop 6:1 Pulley System: Establish twin-ski deadman anchor outside serac fall line. "
            "Immediately lower rescue line with micro-traxion progress capture; clear lip friction with ski poles."
        )
    elif crevasse_bridge_failure_risk >= 0.5:
        emergency_ski_rescue_protocol = (
            "Standard 3:1 Z-Drag with Hyperstatic Cord: Skier immediately drop into self-arrest with ice axe/ski tails. "
            "Build backed-up picket anchor, send 320cm probe sounding line, and execute controlled haul."
        )
    else:
        emergency_ski_rescue_protocol = (
            "Rapid Skier Assisted Prusik Ascent: Fallen skier deploys foot stirrups and chest harness prusiks to self-ascend "
            "hyperstatic cord while surface team constructs lip protector using ski tips."
        )

    return GlacierSkiTraverseResult(
        site_title=site.title,
        site_id=site.id,
        bridge_ground_pressure_kpa=bridge_ground_pressure_kpa,
        crevasse_bridge_failure_risk=crevasse_bridge_failure_risk,
        serac_corridor_exposure_time_minutes=serac_corridor_exposure_time_minutes,
        recommended_rope_spacing_meters=recommended_rope_spacing_meters,
        hazard_level=hazard_level,
        rope_travel_advisory=rope_travel_advisory,
        emergency_ski_rescue_protocol=emergency_ski_rescue_protocol,
    )


def detect_glacier_ski_traverse_intent(message: str) -> bool:
    if not message or not message.strip():
        return False

    q = message.lower().strip()

    # Prioritized domain keywords that override generic ski/glacier overlap
    domain_keywords = [
        "glacier ski",
        "ski-traverse",
        "ski traverse",
        "serac zone",
        "icefall descent",
        "crevasse bridge",
        "haute route",
        "wapta",
        "spearhead traverse",
        "bagley icefield",
        "berner oberland",
    ]

    site_matches = [
        "haute route",
        "chamonix to zermatt",
        "spearhead",
        "wapta",
        "berner oberland",
        "bagley icefield",
        "haute-route-chamonix-zermatt",
        "spearhead-traverse-whistler",
        "wapta-traverse-canadian-rockies",
        "berner-oberland-ski-traverse",
        "wrangell-st-elias-bagley-icefield",
    ]

    is_explicit = any(k in q for k in domain_keywords) or any(sm in q for sm in site_matches)

    ecommerce_exclusions = [
        "order #",
        "refund",
        "return label",
        "shipping tracking",
        "rentals",
        "rental",
        "pulk",
        "sled haul",
        "sled hauling",
        "pulk sled",
        "pulk harness",
        "glacial sledging",
        "haul shaft",
    ]
    if any(ex in q for ex in ecommerce_exclusions):
        return False

    if not is_explicit:
        return False

    return True


def extract_glacier_ski_traverse_intent(message: str) -> GlacierSkiTraverseIntent:
    q = message.lower().strip()

    matched_site_id: Optional[str] = None
    if "haute route" in q or "chamonix" in q or "zermatt" in q:
        matched_site_id = "haute-route-chamonix-zermatt"
    elif "spearhead" in q or "whistler" in q or "blackcomb" in q:
        matched_site_id = "spearhead-traverse-whistler"
    elif "wapta" in q or "canadian rockies" in q or "peyto" in q:
        matched_site_id = "wapta-traverse-canadian-rockies"
    elif "berner oberland" in q or "bernese" in q or "aletsch" in q or "jungfrau" in q:
        matched_site_id = "berner-oberland-ski-traverse"
    elif "bagley" in q or "wrangell" in q or "st. elias" in q or "saint elias" in q:
        matched_site_id = "wrangell-st-elias-bagley-icefield"
    else:
        for s_id in DEFAULT_GLACIER_SKI_TRAVERSE_SITES:
            if s_id in q:
                matched_site_id = s_id
                break

    zone: Optional[str] = None
    if "firn" in q or "accumulation" in q:
        zone = GlacierTerrainZone.UPPER_FIRN_ACCUMULATION_BASIN.value
    elif "icefall" in q or "serac" in q:
        zone = GlacierTerrainZone.COMPRESSED_ICEFALL_SERAC_CORRIDOR.value
    elif "lattice" in q or "transition" in q or "crevasse" in q:
        zone = GlacierTerrainZone.CREVASSE_LATTICE_TRANSITION_ZONE.value
    elif "bergschrund" in q or "chute" in q or "headwall" in q:
        zone = GlacierTerrainZone.BERGSCHRUND_HEADWALL_CHUTE.value
    elif "moraine" in q or "terminal" in q or "tongue" in q:
        zone = GlacierTerrainZone.SUBGLACIAL_MORAINE_TERMINAL_TONGUE.value
    elif matched_site_id and matched_site_id in DEFAULT_GLACIER_SKI_TRAVERSE_SITES:
        zone = DEFAULT_GLACIER_SKI_TRAVERSE_SITES[matched_site_id].dominant_zone

    calc_keywords = [
        "calculate",
        "calculation",
        "pressure",
        "kpa",
        "failure risk",
        "ground pressure",
        "exposure",
        "dynamics",
        "rope spacing",
        "hazard level",
    ]
    gear_keywords = [
        "gear",
        "checklist",
        "equipment",
        "kit",
        "harness",
        "rescue cord",
        "pulley",
        "crampon",
        "crampons",
        "couteaux",
        "picket",
        "probe",
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
            "protocol",
            "stability",
        ]
    ):
        action = "get_site"
    elif matched_site_id and not any(
        k in q for k in ["sites", "catalog", "list", "options", "all"]
    ):
        action = "get_site"
    else:
        action = "catalog"

    return GlacierSkiTraverseIntent(
        action=action,
        site_id=matched_site_id,
        query=message,
        zone=zone,
    )


def format_glacier_ski_traverse_response(
    action: Union[GlacierSkiTraverseIntent, str],
    message: Any = None,
) -> FormattedGlacierSkiTraverseResponse:
    if isinstance(message, dict) and "glacier_ski_traverse_info" in message:
        answer = str(
            message.get(
                "answer",
                "Alpine Crevasse Glacier Ski-Traverse & Serac Zone Descent Logistics guidance",
            )
        )
        return FormattedGlacierSkiTraverseResponse(answer, message)

    intent_obj: GlacierSkiTraverseIntent
    if isinstance(action, GlacierSkiTraverseIntent):
        intent_obj = action
    elif isinstance(action, str):
        if action in ("glacier_ski_traverse", "glacier_ski") and isinstance(message, str):
            intent_obj = extract_glacier_ski_traverse_intent(message)
        elif action in ("calculate", "calculate_dynamics"):
            intent_obj = GlacierSkiTraverseIntent(action="calculate")
        elif action in ("gear", "gear_checklist"):
            intent_obj = GlacierSkiTraverseIntent(action="gear_checklist")
        elif action in ("get_site", "site_detail", "detail"):
            site_id = (
                message
                if isinstance(message, str) and message in DEFAULT_GLACIER_SKI_TRAVERSE_SITES
                else None
            )
            intent_obj = GlacierSkiTraverseIntent(action="get_site", site_id=site_id)
        else:
            intent_obj = GlacierSkiTraverseIntent(action="catalog")
    else:
        intent_obj = GlacierSkiTraverseIntent(action="catalog")

    resolved_action = intent_obj.action

    if resolved_action == "calculate":
        if isinstance(message, GlacierSkiTraverseResult):
            calc_res = message
        elif isinstance(message, GlacierSkiTraverseQuery):
            calc_res = calculate_glacier_ski_traverse_dynamics(message)
        else:
            calc_q = GlacierSkiTraverseQuery(
                site_id=intent_obj.site_id or "haute-route-chamonix-zermatt"
            )
            calc_res = calculate_glacier_ski_traverse_dynamics(calc_q)

        answer = (
            f"Glacier Ski-Traverse Dynamics for {calc_res.site_title}: "
            f"Ground Pressure: {calc_res.bridge_ground_pressure_kpa} kPa. "
            f"Crevasse Bridge Failure Risk: {calc_res.crevasse_bridge_failure_risk}. "
            f"Serac Corridor Exposure: {calc_res.serac_corridor_exposure_time_minutes} min. "
            f"Recommended Rope Spacing: {calc_res.recommended_rope_spacing_meters}m. "
            f"Hazard Level: {calc_res.hazard_level.upper()}. "
            f"Rope Travel Advisory: {calc_res.rope_travel_advisory} "
            f"Rescue Protocol: {calc_res.emergency_ski_rescue_protocol}"
        )
        calc_info: dict[str, Any] = {
            "glacier_ski_traverse_info": {
                "action": "calculate",
                "site_id": calc_res.site_id,
                "calculation": calc_res.model_dump(),
                "bridge_ground_pressure_kpa": calc_res.bridge_ground_pressure_kpa,
                "crevasse_bridge_failure_risk": calc_res.crevasse_bridge_failure_risk,
                "serac_corridor_exposure_time_minutes": calc_res.serac_corridor_exposure_time_minutes,
                "recommended_rope_spacing_meters": calc_res.recommended_rope_spacing_meters,
                "hazard_level": calc_res.hazard_level,
                "rope_travel_advisory": calc_res.rope_travel_advisory,
                "emergency_ski_rescue_protocol": calc_res.emergency_ski_rescue_protocol,
            },
            "answer": answer,
        }
        return FormattedGlacierSkiTraverseResponse(answer, calc_info)

    if resolved_action == "gear_checklist":
        checklist = message if isinstance(message, list) else get_glacier_ski_traverse_gear()
        items_str = "; ".join(f"{g.name} ({g.description})" for g in checklist)
        answer = (
            f"Mandatory Alpine Crevasse Glacier Ski-Traverse Gear Checklist ({len(checklist)} items): "
            f"{items_str}. Skimo harnesses, hyperstatic rescue cords, progress capture pulleys, "
            f"ski crampons, snow picket systems, and 320cm crevasse sounding probes are mandatory for safe travel."
        )
        gear_info: dict[str, Any] = {
            "glacier_ski_traverse_info": {
                "action": "gear_checklist",
                "gear": [g.model_dump() for g in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedGlacierSkiTraverseResponse(answer, gear_info)

    if resolved_action == "get_site":
        site = None
        if intent_obj.site_id:
            site = get_glacier_ski_traverse_site(intent_obj.site_id)
        if not site and isinstance(message, GlacierSkiTraverseSite):
            site = message
        if not site and isinstance(message, str):
            site = get_glacier_ski_traverse_site(message)
        if not site:
            site = get_glacier_ski_traverse_site("haute-route-chamonix-zermatt")

        if site:
            highlights_str = ", ".join(site.highlights)
            answer = (
                f"Glacier Ski-Traverse Site: {site.title} ({site.range}, {site.region}). "
                f"Elevation: {site.elevation_meters}m | Dominant Zone: {site.dominant_zone} | "
                f"Bridge Stability: {site.bridge_stability} | Default Protocol: {site.default_protocol}. "
                f"{site.description} Key Highlights: {highlights_str}."
            )
            site_info: dict[str, Any] = {
                "glacier_ski_traverse_info": {
                    "action": "get_site",
                    "site_id": site.id,
                    "site": site.model_dump(),
                },
                "answer": answer,
            }
            return FormattedGlacierSkiTraverseResponse(answer, site_info)

    sites = (
        message
        if isinstance(message, list)
        else get_glacier_ski_traverse_sites(zone=intent_obj.zone)
    )
    summary_str = "; ".join(
        f"{s.title} ({s.region}, {s.elevation_meters}m, zone: {s.dominant_zone})"
        for s in sites
    )
    answer = (
        f"Contoso Alpine Crevasse Glacier Ski-Traverse Catalog ({len(sites)} sites): {summary_str}. "
        "Inquire about specific ski traverse routes, crevasse bridge stability dynamics, or mandatory glacier skimo gear."
    )
    catalog_info: dict[str, Any] = {
        "glacier_ski_traverse_info": {
            "action": "catalog",
            "zone": intent_obj.zone,
            "sites": [s.model_dump() for s in sites],
        },
        "answer": answer,
    }
    return FormattedGlacierSkiTraverseResponse(answer, catalog_info)


def build_glacier_ski_traverse_prompt(message: Any = None) -> str:
    lines = [
        "Alpine Crevasse Glacier Ski-Traverse & Serac Zone Descent Logistics Guidance:",
        "- Crevasse Bridge Ground Pressure & Failure Risk: Skiers exert distributed ground pressure (typically 4-12 kPa). Warm spring temperatures (>0°C) or extreme sub-zero cold (<-15°C) degrade snowbridge tensile cohesion, demanding probe sounding.",
        "- Serac Collapse Exposure: Active serac fall lines present catastrophic overhead hazard. Where terrain permits, unroped rapid sprints eliminate collective team entrapment; roping up in serac zones must be weighed against catastrophic toppling.",
        "- Rope Spacing & Brake Knots: On snowbridges, travelers maintain 10-25m intervals with butterfly brake knots tied along the rope to catch on crevasse snow lips during sudden breakthrough.",
        "- Mandatory Crevasse Ski Rescue Gear: Step-in skimo harness, 6mm hyperstatic aramid rescue cord, micro progress-capture pulley (Z-drag 3:1 / 6:1), ski crampons (couteaux), cable deadman snow picket, and 320cm depth probe.",
    ]
    site_id = None
    if isinstance(message, GlacierSkiTraverseIntent) and message.site_id:
        site_id = message.site_id
    elif isinstance(message, str):
        detected = detect_glacier_ski_traverse_intent(message)
        if detected:
            intent_obj = extract_glacier_ski_traverse_intent(message)
            if intent_obj and intent_obj.site_id:
                site_id = intent_obj.site_id

    if site_id:
        s = get_glacier_ski_traverse_site(site_id)
        if s:
            lines.append(
                f"- Focused Glacier Ski-Traverse Site: {s.title} ({s.region}, Range: {s.range}, "
                f"Elevation: {s.elevation_meters}m, Dominant Zone: {s.dominant_zone}, "
                f"Bridge Stability: {s.bridge_stability}, Protocol: {s.default_protocol})"
            )
    return "\n".join(lines)


def glacier_ski_traverse_tool(
    query: Optional[GlacierSkiTraverseQuery] = None,
    action: Optional[str] = None,
    site_id: Optional[str] = None,
    zone: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    if action in ("calculate", "calculate_dynamics") or query is not None:
        calc_q = query or GlacierSkiTraverseQuery(
            site_id=site_id or "haute-route-chamonix-zermatt"
        )
        res = calculate_glacier_ski_traverse_dynamics(calc_q)
        formatted = format_glacier_ski_traverse_response("calculate", res)
        return dict(formatted._data)

    if action in ("gear", "gear_checklist"):
        checklist = get_glacier_ski_traverse_gear()
        formatted = format_glacier_ski_traverse_response("gear_checklist", checklist)
        return dict(formatted._data)

    if action in ("get_site", "site_detail", "detail") and site_id:
        site = get_glacier_ski_traverse_site(site_id)
        if site:
            formatted = format_glacier_ski_traverse_response("get_site", site)
            return dict(formatted._data)

    sites = get_glacier_ski_traverse_sites(zone=zone)
    formatted = format_glacier_ski_traverse_response("catalog", sites)
    return dict(formatted._data)
