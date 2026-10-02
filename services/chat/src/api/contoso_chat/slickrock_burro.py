from enum import Enum
from typing import Any, Literal, Optional, Union

from pydantic import BaseModel, Field, model_validator


class CanyonTerrain(str, Enum):
    SLICKROCK_DRY_WASH = "slickrock_dry_wash"
    DEEP_ALLUVIAL_SAND = "deep_alluvial_sand"
    RUGGED_COBBLE_WASH = "rugged_cobble_wash"
    LIMESTONE_SCREE_BENCH = "limestone_scree_bench"


class WaterAvailability(str, Enum):
    SPARSE_ALKALI_SEEPS = "sparse_alkali_seeps"
    INTERMITTENT_TINAJA_POCKETS = "intermittent_tinaja_pockets"
    SPRING_FED_POTHOLES = "spring_fed_potholes"
    SEASONAL_DESERT_TINAJAS = "seasonal_desert_tinajas"
    PERENNIAL_RIVER_CORRIDOR = "perennial_river_corridor"


class HoofProtection(str, Enum):
    BAREFOOT_CONDITIONED = "barefoot_conditioned"
    NEOPRENE_TRAIL_BOOTS = "neoprene_trail_boots"
    STEEL_SHOD_CLEATS = "steel_shod_cleats"


class BurroTriageStatus(str, Enum):
    OPTIMAL_CONDITIONED_TREK = "optimal_conditioned_trek"
    CAUTION_HEAT_HYDRATION_STRAIN = "caution_heat_hydration_strain"
    CRITICAL_OVERLOAD_DEHYDRATION_HAZARD = "critical_overload_dehydration_hazard"


class SlickrockBurroRoute(BaseModel):
    id: str
    title: str = ""
    name: str = ""
    route_id: str = ""
    region: str = ""
    range: str = ""
    trail_distance_km: float = 0.0
    canyon_terrain: str = CanyonTerrain.SLICKROCK_DRY_WASH.value
    water_availability: str = WaterAvailability.INTERMITTENT_TINAJA_POCKETS.value
    max_ambient_temp_c: float = 35.0
    description: str = ""
    highlights: list[str] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "routeId": "id",
                "route_id": "id",
                "trailDistanceKm": "trail_distance_km",
                "canyonTerrain": "canyon_terrain",
                "waterAvailability": "water_availability",
                "maxAmbientTempC": "max_ambient_temp_c",
            }
            for k, v in mapping.items():
                if k in data and v not in data:
                    data[v] = data[k]
            if "title" in data and "name" not in data:
                data["name"] = data["title"]
            elif "name" in data and "title" not in data:
                data["title"] = data["name"]
            if "id" in data and not data.get("route_id"):
                data["route_id"] = data["id"]
        return data

    @property
    def routeId(self) -> str:
        return self.id

    @property
    def trailDistanceKm(self) -> float:
        return self.trail_distance_km

    @property
    def canyonTerrain(self) -> str:
        return self.canyon_terrain

    @property
    def waterAvailability(self) -> str:
        return self.water_availability

    @property
    def maxAmbientTempC(self) -> float:
        return self.max_ambient_temp_c


class BurroDynamicsQuery(BaseModel):
    route_id: str = "san-rafael-swell-chute-canyon"
    terrain: str = CanyonTerrain.SLICKROCK_DRY_WASH.value
    water_source: str = WaterAvailability.INTERMITTENT_TINAJA_POCKETS.value
    hoof_protection: str = HoofProtection.NEOPRENE_TRAIL_BOOTS.value
    burro_count: int = 2
    ambient_peak_temp_c: float = 32.0
    daily_trek_km: float = 16.0
    cargo_weight_kg_per_burro: float = 38.0
    pannier_weight_delta_kg: float = 1.5

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "routeId": "route_id",
                "waterSource": "water_source",
                "hoofProtection": "hoof_protection",
                "burroCount": "burro_count",
                "ambientPeakTempC": "ambient_peak_temp_c",
                "dailyTrekKm": "daily_trek_km",
                "cargoWeightKgPerBurro": "cargo_weight_kg_per_burro",
                "pannierWeightDeltaKg": "pannier_weight_delta_kg",
                "canyonTerrain": "terrain",
                "canyon_terrain": "terrain",
            }
            for k, v in mapping.items():
                if k in data and v not in data:
                    data[v] = data[k]
        return data

    @property
    def routeId(self) -> str:
        return self.route_id

    @property
    def waterSource(self) -> str:
        return self.water_source

    @property
    def hoofProtection(self) -> str:
        return self.hoof_protection

    @property
    def burroCount(self) -> int:
        return self.burro_count

    @property
    def ambientPeakTempC(self) -> float:
        return self.ambient_peak_temp_c

    @property
    def dailyTrekKm(self) -> float:
        return self.daily_trek_km

    @property
    def cargoWeightKgPerBurro(self) -> float:
        return self.cargo_weight_kg_per_burro

    @property
    def pannierWeightDeltaKg(self) -> float:
        return self.pannier_weight_delta_kg


class BurroDynamicsResult(BaseModel):
    route_title: str
    route_id: Optional[str] = None
    daily_water_requirement_liters: float
    hoof_slickrock_slip_risk_index: float
    pannier_balance_score: float
    triage_status: str
    pack_balance_advisory: str
    desert_trek_water_protocol: str

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "routeTitle": "route_title",
                "routeId": "route_id",
                "dailyWaterRequirementLiters": "daily_water_requirement_liters",
                "hoofSlickrockSlipRiskIndex": "hoof_slickrock_slip_risk_index",
                "pannierBalanceScore": "pannier_balance_score",
                "triageStatus": "triage_status",
                "packBalanceAdvisory": "pack_balance_advisory",
                "desertTrekWaterProtocol": "desert_trek_water_protocol",
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
    def dailyWaterRequirementLiters(self) -> float:
        return self.daily_water_requirement_liters

    @property
    def hoofSlickrockSlipRiskIndex(self) -> float:
        return self.hoof_slickrock_slip_risk_index

    @property
    def pannierBalanceScore(self) -> float:
        return self.pannier_balance_score

    @property
    def triageStatus(self) -> str:
        return self.triage_status

    @property
    def packBalanceAdvisory(self) -> str:
        return self.pack_balance_advisory

    @property
    def desertTrekWaterProtocol(self) -> str:
        return self.desert_trek_water_protocol


class BurroGearItem(BaseModel):
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


class SlickrockBurroIntent(BaseModel):
    action: Literal["catalog", "get_route", "calculate", "gear_checklist"] = "catalog"
    route_id: Optional[str] = None
    query: Optional[str] = None
    terrain: Optional[str] = None


class FormattedSlickrockBurroResponse(str):
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


DEFAULT_SLICKROCK_BURRO_ROUTES: dict[str, SlickrockBurroRoute] = {
    "san-rafael-swell-chute-canyon": SlickrockBurroRoute(
        id="san-rafael-swell-chute-canyon",
        title="San Rafael Swell Chute Canyon Slickrock Wash",
        name="San Rafael Swell Chute Canyon Slickrock Wash",
        route_id="san-rafael-swell-chute-canyon",
        region="Emery County, Utah",
        range="San Rafael Swell",
        trail_distance_km=24.5,
        canyon_terrain=CanyonTerrain.SLICKROCK_DRY_WASH.value,
        water_availability=WaterAvailability.INTERMITTENT_TINAJA_POCKETS.value,
        max_ambient_temp_c=38.0,
        description="Deep sandstone dry wash cutting through Navajo and Wingate formations with narrow pour-offs, scouring sand channels, and shaded slickrock alcoves.",
        highlights=[
            "Navajo sandstone slot narrows",
            "Intermittent scoured tinaja potholes",
            "Technical pour-off bypass ledges",
        ],
    ),
    "grand-gulch-cedar-mesa-canyon": SlickrockBurroRoute(
        id="grand-gulch-cedar-mesa-canyon",
        title="Grand Gulch Cedar Mesa Ancestral Wash Corridor",
        name="Grand Gulch Cedar Mesa Ancestral Wash Corridor",
        route_id="grand-gulch-cedar-mesa-canyon",
        region="San Juan County, Utah",
        range="Cedar Mesa",
        trail_distance_km=32.0,
        canyon_terrain=CanyonTerrain.RUGGED_COBBLE_WASH.value,
        water_availability=WaterAvailability.SPRING_FED_POTHOLES.value,
        max_ambient_temp_c=36.0,
        description="Sinuous Cedar Mesa sandstone canyon floor characterized by boulder chokes, cobble beds, ancestral ruins, and seasonal plunge pools.",
        highlights=[
            "Ancestral Puebloan cliff dwellings",
            "Spring-fed plunge pools in alcoves",
            "Cobblestone wash trekking with pack stock",
        ],
    ),
    "death-valley-cottonwood-marble": SlickrockBurroRoute(
        id="death-valley-cottonwood-marble",
        title="Death Valley Cottonwood-Marble Canyon Loop",
        name="Death Valley Cottonwood-Marble Canyon Loop",
        route_id="death-valley-cottonwood-marble",
        region="Inyo County, California",
        range="Cottonwood Mountains",
        trail_distance_km=42.0,
        canyon_terrain=CanyonTerrain.LIMESTONE_SCREE_BENCH.value,
        water_availability=WaterAvailability.SPARSE_ALKALI_SEEPS.value,
        max_ambient_temp_c=44.0,
        description="Extreme desert wilderness traverse combining polished marble narrows, high limestone scree benches, and arid alluvial fans.",
        highlights=[
            "Polished marble slot canyon narrows",
            "High-gradient limestone scree passes",
            "Severe arid alkali seep monitoring",
        ],
    ),
    "escalante-river-baker-canyon": SlickrockBurroRoute(
        id="escalante-river-baker-canyon",
        title="Escalante River Baker Canyon Meander Traverse",
        name="Escalante River Baker Canyon Meander Traverse",
        route_id="escalante-river-baker-canyon",
        region="Garfield County, Utah",
        range="Grand Staircase-Escalante",
        trail_distance_km=28.5,
        canyon_terrain=CanyonTerrain.DEEP_ALLUVIAL_SAND.value,
        water_availability=WaterAvailability.PERENNIAL_RIVER_CORRIDOR.value,
        max_ambient_temp_c=37.0,
        description="Fluvial canyon system featuring frequent river wades, deep quicksand benches, and towering Wingate sandstone amphitheaters.",
        highlights=[
            "Fluvial river wade crossings with pack animals",
            "Towering alcoves and hanging gardens",
            "Deep alluvial sand bench navigation",
        ],
    ),
    "big-bend-mesa-de-anguila": SlickrockBurroRoute(
        id="big-bend-mesa-de-anguila",
        title="Big Bend Mesa de Anguila Rio Grande Canyon Rim",
        name="Big Bend Mesa de Anguila Rio Grande Canyon Rim",
        route_id="big-bend-mesa-de-anguila",
        region="Brewster County, Texas",
        range="Chihuahuan Desert",
        trail_distance_km=35.0,
        canyon_terrain=CanyonTerrain.SLICKROCK_DRY_WASH.value,
        water_availability=WaterAvailability.SEASONAL_DESERT_TINAJAS.value,
        max_ambient_temp_c=41.0,
        description="Rugged Chihuahuan limestone and slickrock rim route overlooking Santa Elena Canyon with steep arid arroyos and remote tinaja caches.",
        highlights=[
            "1,500 ft vertical drop into Santa Elena Canyon",
            "Limestone tinaja rock pools in arroyos",
            "Exposed desert bench pack trekking",
        ],
    ),
}

DEFAULT_BURRO_GEAR: list[BurroGearItem] = [
    BurroGearItem(
        item_id="sawbuck-pack-saddle-rig",
        id="sawbuck-pack-saddle-rig",
        name="Solid Ash Wood Sawbuck Pack Saddle & Double Cinch Rig",
        category="Pack Rigging",
        mandatory=True,
        description="Dual-crossbuck hardwood tree saddle with wool fleece pad, breast collar, and breeching for secure pannier load distribution on steep slickrock.",
        purpose="Even load distribution and saddle stabilization across slickrock terrain.",
    ),
    BurroGearItem(
        item_id="heavy-duty-canvas-panniers",
        id="heavy-duty-canvas-panniers",
        name="Heavy-Duty Iron-Cloth Canvas Trail Panniers (Pair)",
        category="Cargo Storage",
        mandatory=True,
        description="Reinforced 32oz desert canvas side-packs with leather corners, heavy-duty buckle straps, and balanced tie-down lashings.",
        purpose="Balanced side-pack gear storage resistant to desert brush and rock abrasion.",
    ),
    BurroGearItem(
        item_id="collapsible-desert-water-bladder",
        id="collapsible-desert-water-bladder",
        name="High-Volume Collapsible Equine Desert Water Bladder (20L x 2)",
        category="Hydration Storage",
        mandatory=True,
        description="Food-grade TPU dual side-pannier bladders designed to carry essential trek hydration across dry washes without sloshing imbalance.",
        purpose="Secure bulk water transport for stock and humans across dry canyon stretches.",
    ),
    BurroGearItem(
        item_id="protective-equine-trail-boots",
        id="protective-equine-trail-boots",
        name="Rugged Neoprene Equine Slickrock Trail Boots (Set of 4)",
        category="Hoof Protection",
        mandatory=True,
        description="Reinforced molded tread boots that prevent hoof chipping and enhance friction grip across smooth slickrock sandstone and sharp cobble.",
        purpose="Maximum friction traction on smooth sandstone slicks and hoof wall defense.",
    ),
    BurroGearItem(
        item_id="hoof-pick-and-rasp-kit",
        id="hoof-pick-and-rasp-kit",
        name="Ergonomic Steel Hoof Pick and Sandstone Finishing Rasp Kit",
        category="Hoof Maintenance",
        mandatory=True,
        description="Essential daily care kit to clear packed sand, gravel, and caliche stones from burro sulci and maintain smooth hoof balance.",
        purpose="Daily hoof hygiene to prevent gravel impaction, stone bruising, and thrush.",
    ),
    BurroGearItem(
        item_id="desert-night-hobble-tether",
        id="desert-night-hobble-tether",
        name="Padded Leather Desert Night Hobble and Picket Tether System",
        category="Stock Containment",
        mandatory=True,
        description="Soft sheepskin-lined leather hobbles and low-impact swivel picket pin for night containment without damaging delicate desert cryptobiotic soil.",
        purpose="Safe overnight camp containment preventing stock wandering while protecting cryptobiotic crusts.",
    ),
]


def get_burro_routes(
    terrain: Optional[str] = None,
) -> list[SlickrockBurroRoute]:
    all_routes = list(DEFAULT_SLICKROCK_BURRO_ROUTES.values())
    if not terrain:
        return all_routes
    norm = terrain.strip().lower()
    return [
        r
        for r in all_routes
        if r.canyon_terrain.lower() == norm
    ]


def get_burro_route(route_id: str) -> Optional[SlickrockBurroRoute]:
    return DEFAULT_SLICKROCK_BURRO_ROUTES.get(route_id)


def get_burro_gear() -> list[BurroGearItem]:
    return list(DEFAULT_BURRO_GEAR)


def calculate_burro_dynamics(query: BurroDynamicsQuery) -> BurroDynamicsResult:
    route = get_burro_route(query.route_id)
    if not route:
        raise ValueError(f"Slickrock burro route '{query.route_id}' not found")

    route_title = route.title

    # Water requirement calculation:
    # base_water = 15.0 + max(0.0, (query.ambient_peak_temp_c - 20.0) * 0.9) + (query.daily_trek_km * 0.45) + (query.cargo_weight_kg_per_burro * 0.15)
    base_water = (
        15.0
        + max(0.0, (query.ambient_peak_temp_c - 20.0) * 0.9)
        + (query.daily_trek_km * 0.45)
        + (query.cargo_weight_kg_per_burro * 0.15)
    )
    daily_water_requirement_liters = round(base_water, 1)

    # Terrain slip factor: slickrock 0.35, sand 0.15, cobble 0.28, limestone 0.40
    terrain_str = str(query.terrain).lower()
    if CanyonTerrain.SLICKROCK_DRY_WASH.value in terrain_str or "slickrock" in terrain_str:
        terrain_factor = 0.35
    elif CanyonTerrain.DEEP_ALLUVIAL_SAND.value in terrain_str or "sand" in terrain_str:
        terrain_factor = 0.15
    elif CanyonTerrain.RUGGED_COBBLE_WASH.value in terrain_str or "cobble" in terrain_str:
        terrain_factor = 0.28
    elif CanyonTerrain.LIMESTONE_SCREE_BENCH.value in terrain_str or "limestone" in terrain_str or "scree" in terrain_str:
        terrain_factor = 0.40
    else:
        terrain_factor = 0.30

    # Hoof mod: barefoot 1.0, boots 0.65, steel 1.45
    hoof_str = str(query.hoof_protection).lower()
    if HoofProtection.NEOPRENE_TRAIL_BOOTS.value in hoof_str or "boot" in hoof_str or "neoprene" in hoof_str:
        hoof_mod = 0.65
    elif HoofProtection.STEEL_SHOD_CLEATS.value in hoof_str or "steel" in hoof_str or "cleat" in hoof_str or "shod" in hoof_str:
        hoof_mod = 1.45
    else:
        hoof_mod = 1.0

    # Slip risk index
    raw_slip = terrain_factor * hoof_mod + (query.cargo_weight_kg_per_burro / 65.0) * 0.25
    hoof_slickrock_slip_risk_index = min(0.99, max(0.08, round(raw_slip, 2)))

    # Pannier balance score
    pannier_balance_score = max(0.0, round(100.0 - (query.pannier_weight_delta_kg * 10.0), 1))

    # Triage classification
    if (
        daily_water_requirement_liters >= 35.0
        or query.ambient_peak_temp_c >= 40.0
        or query.cargo_weight_kg_per_burro >= 55.0
        or pannier_balance_score < 60.0
    ):
        triage_status = BurroTriageStatus.CRITICAL_OVERLOAD_DEHYDRATION_HAZARD.value
        pack_balance_advisory = (
            "CRITICAL OVERLOAD HAZARD: Excessive pack weight or severe pannier imbalance detected. "
            "High risk of equine spine strain, saddle gall necrosis, and catastrophic slip fall on slickrock. "
            "Immediately reduce cargo below 50 kg per burro and equalize panniers within 1.0 kg delta."
        )
        desert_trek_water_protocol = (
            "EMERGENCY DESERT WATER PROTOCOL: Extreme burro dehydration danger. Restrict travel to night "
            "and dawn hours. Cache supplemental water bladders or abort expedition immediately to prevent fatal impaction colic."
        )
    elif (
        daily_water_requirement_liters >= 25.0
        or hoof_slickrock_slip_risk_index >= 0.50
        or pannier_balance_score < 85.0
    ):
        triage_status = BurroTriageStatus.CAUTION_HEAT_HYDRATION_STRAIN.value
        pack_balance_advisory = (
            "CAUTION: Moderate pannier imbalance or elevated slickrock slip risk. "
            "Equip neoprene trail boots for sandstone friction and re-cinch sawbuck saddle before ascending steep dry wash pour-offs."
        )
        desert_trek_water_protocol = (
            "ELEVATED HYDRATION ADVISORY: Significant water turnover required. Water stock every 3 to 4 hours "
            "at tinajas or alkaline seeps. Carry collapsible 20L bladders to bridge dry wash expanses."
        )
    else:
        triage_status = BurroTriageStatus.OPTIMAL_CONDITIONED_TREK.value
        pack_balance_advisory = (
            "OPTIMAL TREK RIGGING: Pack ballast and pannier balance are within ideal standards. "
            "Sawbuck saddle double-cinch tension and breast collar breeching properly equalized."
        )
        desert_trek_water_protocol = (
            "STANDARD WATER PROTOCOL: Normal metabolic water requirement. Maintain morning and evening "
            "tinaja watering schedule along desert wash corridor."
        )

    return BurroDynamicsResult(
        route_title=route_title,
        route_id=route.id,
        daily_water_requirement_liters=daily_water_requirement_liters,
        hoof_slickrock_slip_risk_index=hoof_slickrock_slip_risk_index,
        pannier_balance_score=pannier_balance_score,
        triage_status=triage_status,
        pack_balance_advisory=pack_balance_advisory,
        desert_trek_water_protocol=desert_trek_water_protocol,
    )


def detect_slickrock_burro_intent(message: str) -> bool:
    if not message or not message.strip():
        return False

    q = message.lower().strip()

    exclusions = [
        "order #",
        "refund",
        "return label",
        "shipping tracking",
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
        "cave pearl",
        "speleothem",
        "cave mineralogy",
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
        "pothole",
        "pot-hole",
        "sandtrap",
        "cheater stick",
        "tundra lichen",
        "lichen",
        "bryophyte",
        "cryokarst",
        "ice cave",
        "glacier cave",
        "moulin",
        "burro race",
        "pack burro race",
        "burro racing",
    ]

    # Explicit exclusions check
    if any(ex in q for ex in exclusions):
        return False

    burro_keywords = [
        "slickrock burro",
        "dry wash burro",
        "burro packing",
        "burro expedition",
        "sawbuck",
        "burro pannier",
        "burro hydration",
        "burro hoof",
        "pack burro",
        "pack-burro",
        "slickrock packing",
        "burro dynamics",
        "burro trek",
        "burro",
        "burros",
        "pack donkey",
        "tinaja",
    ]

    route_keywords = [
        "san rafael",
        "chute canyon",
        "grand gulch",
        "cedar mesa",
        "cottonwood marble",
        "death valley",
        "baker canyon",
        "mesa de anguila",
        "san-rafael-swell-chute-canyon",
        "grand-gulch-cedar-mesa-canyon",
        "death-valley-cottonwood-marble",
        "escalante-river-baker-canyon",
        "big-bend-mesa-de-anguila",
    ]

    is_explicit = any(k in q for k in burro_keywords) or any(rk in q for rk in route_keywords)
    if not is_explicit:
        return False

    return True


def extract_slickrock_burro_intent(message: str) -> SlickrockBurroIntent:
    q = message.lower().strip()

    matched_route_id: Optional[str] = None
    if "san rafael" in q or "chute canyon" in q:
        matched_route_id = "san-rafael-swell-chute-canyon"
    elif "grand gulch" in q or "cedar mesa" in q:
        matched_route_id = "grand-gulch-cedar-mesa-canyon"
    elif "cottonwood" in q or "cottonwood marble" in q:
        matched_route_id = "death-valley-cottonwood-marble"
    elif "death valley" in q:
        matched_route_id = "death-valley-cottonwood-marble"
    elif "escalante" in q or "baker canyon" in q:
        matched_route_id = "escalante-river-baker-canyon"
    elif "big bend" in q or "mesa de anguila" in q:
        matched_route_id = "big-bend-mesa-de-anguila"
    else:
        for r_id in DEFAULT_SLICKROCK_BURRO_ROUTES:
            if r_id in q:
                matched_route_id = r_id
                break

    terrain: Optional[str] = None
    if "slickrock" in q or "wash" in q:
        terrain = CanyonTerrain.SLICKROCK_DRY_WASH.value
    elif "sand" in q or "alluvial" in q:
        terrain = CanyonTerrain.DEEP_ALLUVIAL_SAND.value
    elif "cobble" in q:
        terrain = CanyonTerrain.RUGGED_COBBLE_WASH.value
    elif "limestone" in q or "scree" in q:
        terrain = CanyonTerrain.LIMESTONE_SCREE_BENCH.value
    elif matched_route_id and matched_route_id in DEFAULT_SLICKROCK_BURRO_ROUTES:
        terrain = DEFAULT_SLICKROCK_BURRO_ROUTES[matched_route_id].canyon_terrain

    calc_keywords = [
        "calculate",
        "calculation",
        "hydration",
        "slip",
        "slip risk",
        "water requirement",
        "dynamics",
        "triage",
        "balance score",
        "pannier balance",
    ]
    gear_keywords = [
        "gear",
        "checklist",
        "equipment",
        "sawbuck",
        "saddle",
        "pannier",
        "panniers",
        "hobble",
        "hoof pick",
        "trail boot",
        "trail boots",
        "water bladder",
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
            "distance",
            "terrain",
            "water",
            "temp",
        ]
    ):
        action = "get_route"
    elif matched_route_id and not any(
        k in q for k in ["routes", "catalog", "list", "options", "all"]
    ):
        action = "get_route"
    else:
        action = "catalog"

    return SlickrockBurroIntent(
        action=action,
        route_id=matched_route_id,
        query=message,
        terrain=terrain,
    )


def format_slickrock_burro_response(
    action: Union[SlickrockBurroIntent, str],
    message: Any = None,
) -> FormattedSlickrockBurroResponse:
    if isinstance(message, dict) and "slickrock_burro_info" in message:
        answer = str(
            message.get(
                "answer",
                "Wilderness High-Desert Dry Wash Pack-Burro & Slickrock Packing Expedition Logistics guidance",
            )
        )
        return FormattedSlickrockBurroResponse(answer, message)

    intent_obj: SlickrockBurroIntent
    if isinstance(action, SlickrockBurroIntent):
        intent_obj = action
    elif isinstance(action, str):
        if action in ("slickrock_burro", "burro_expedition", "burro") and isinstance(message, str):
            intent_obj = extract_slickrock_burro_intent(message)
        elif action in ("calculate", "calculate_dynamics"):
            intent_obj = SlickrockBurroIntent(action="calculate")
        elif action in ("gear", "gear_checklist"):
            intent_obj = SlickrockBurroIntent(action="gear_checklist")
        elif action in ("get_route", "route_detail", "detail"):
            route_id = (
                message
                if isinstance(message, str) and message in DEFAULT_SLICKROCK_BURRO_ROUTES
                else None
            )
            intent_obj = SlickrockBurroIntent(action="get_route", route_id=route_id)
        else:
            intent_obj = SlickrockBurroIntent(action="catalog")
    else:
        intent_obj = SlickrockBurroIntent(action="catalog")

    resolved_action = intent_obj.action

    if resolved_action == "calculate":
        if isinstance(message, BurroDynamicsResult):
            calc_res = message
        elif isinstance(message, BurroDynamicsQuery):
            calc_res = calculate_burro_dynamics(message)
        else:
            calc_q = BurroDynamicsQuery(
                route_id=intent_obj.route_id or "san-rafael-swell-chute-canyon"
            )
            calc_res = calculate_burro_dynamics(calc_q)

        answer = (
            f"Slickrock Burro Expedition Dynamics for {calc_res.route_title}: "
            f"Daily Water Requirement: {calc_res.daily_water_requirement_liters} L/day. "
            f"Hoof Slickrock Slip Risk Index: {calc_res.hoof_slickrock_slip_risk_index}. "
            f"Pannier Balance Score: {calc_res.pannier_balance_score}/100. "
            f"Triage Status: {calc_res.triage_status.upper()}. "
            f"{calc_res.pack_balance_advisory} Water Protocol: {calc_res.desert_trek_water_protocol}"
        )
        calc_info: dict[str, Any] = {
            "slickrock_burro_info": {
                "action": "calculate",
                "route_id": calc_res.route_id,
                "calculation": calc_res.model_dump(),
                "daily_water_requirement_liters": calc_res.daily_water_requirement_liters,
                "hoof_slickrock_slip_risk_index": calc_res.hoof_slickrock_slip_risk_index,
                "pannier_balance_score": calc_res.pannier_balance_score,
                "triage_status": calc_res.triage_status,
                "pack_balance_advisory": calc_res.pack_balance_advisory,
                "desert_trek_water_protocol": calc_res.desert_trek_water_protocol,
            },
            "answer": answer,
        }
        return FormattedSlickrockBurroResponse(answer, calc_info)

    if resolved_action == "gear_checklist":
        checklist = message if isinstance(message, list) else get_burro_gear()
        items_str = "; ".join(f"{g.name} ({g.description})" for g in checklist)
        answer = (
            f"Mandatory Wilderness High-Desert Dry Wash Pack-Burro Gear Checklist ({len(checklist)} items): "
            f"{items_str}. Sawbuck pack saddle rig, canvas panniers, collapsible water bladders, "
            f"protective trail boots, hoof pick and rasp kit, and desert hobbles are essential for desert packing expeditions."
        )
        gear_info: dict[str, Any] = {
            "slickrock_burro_info": {
                "action": "gear_checklist",
                "gear": [g.model_dump() for g in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedSlickrockBurroResponse(answer, gear_info)

    if resolved_action == "get_route":
        route = None
        if intent_obj.route_id:
            route = get_burro_route(intent_obj.route_id)
        if not route and isinstance(message, SlickrockBurroRoute):
            route = message
        if not route and isinstance(message, str):
            route = get_burro_route(message)
        if not route:
            route = get_burro_route("san-rafael-swell-chute-canyon")

        if route:
            highlights_str = ", ".join(route.highlights)
            answer = (
                f"Slickrock Burro Expedition Route: {route.title} ({route.range}, {route.region}). "
                f"Trail Distance: {route.trail_distance_km} km | Canyon Terrain: {route.canyon_terrain} | "
                f"Water Availability: {route.water_availability} | Max Peak Temp: {route.max_ambient_temp_c}°C. "
                f"{route.description} Key Highlights: {highlights_str}."
            )
            route_info: dict[str, Any] = {
                "slickrock_burro_info": {
                    "action": "get_route",
                    "route_id": route.id,
                    "route": route.model_dump(),
                },
                "answer": answer,
            }
            return FormattedSlickrockBurroResponse(answer, route_info)

    routes = (
        message
        if isinstance(message, list)
        else get_burro_routes(terrain=intent_obj.terrain)
    )
    summary_str = "; ".join(
        f"{r.title} ({r.region}, {r.trail_distance_km} km, terrain: {r.canyon_terrain})"
        for r in routes
    )
    answer = (
        f"Contoso Wilderness High-Desert Dry Wash Pack-Burro & Slickrock Expedition Catalog ({len(routes)} routes): {summary_str}. "
        "Inquire about specific desert routes, burro hydration and slip calculations, or mandatory sawbuck packing gear."
    )
    catalog_info: dict[str, Any] = {
        "slickrock_burro_info": {
            "action": "catalog",
            "terrain": intent_obj.terrain,
            "routes": [r.model_dump() for r in routes],
        },
        "answer": answer,
    }
    return FormattedSlickrockBurroResponse(answer, catalog_info)


def build_slickrock_burro_prompt(message: Any = None) -> str:
    lines = [
        "Wilderness High-Desert Dry Wash Pack-Burro & Slickrock Packing Expedition Logistics Guidance:",
        "- Equine Desert Hydration & Metabolic Demand: Desert burros require significant water volume under high ambient thermal stress (~15-35+ L/day). Hydration plans must account for high peak temperatures (>35°C), trek mileage, and pannier cargo ballast. Never allow working stock to deplete hydration between remote tinajas.",
        "- Slickrock Sandstone Friction & Hoof Protection: Smooth Navajo and Wingate sandstone slicks offer low friction to bare or shod equines when carrying load. Neoprene trail boots mitigate slipping and prevent hoof wall fracturing across abrasive dry wash cobbles and pour-offs.",
        "- Sawbuck Pack Saddle Rigging & Pannier Balance: Pannier weight differential must remain under 1.0-2.0 kg to prevent saddle roll, spine bruising, and girth galling. Ensure double cinches and breast collars are properly tensioned before negotiating steep slickrock benches.",
        "- Desert Environmental Ethics: Hobble or picket pack animals strictly in durable gravel wash beds, avoiding fragile cryptobiotic soil crusts. Protect isolated tinajas and natural seeps from stock contamination.",
        "- Mandatory Expedition Gear: Hardwood sawbuck saddle tree, heavy-duty 32oz canvas panniers, dual 20L collapsible water bladders, neoprene protective trail boots, steel hoof pick and rasp kit, and padded leather night hobbles.",
    ]
    route_id = None
    if isinstance(message, SlickrockBurroIntent) and message.route_id:
        route_id = message.route_id
    elif isinstance(message, str):
        detected = detect_slickrock_burro_intent(message)
        if detected:
            intent_obj = extract_slickrock_burro_intent(message)
            if intent_obj and intent_obj.route_id:
                route_id = intent_obj.route_id

    if route_id:
        r = get_burro_route(route_id)
        if r:
            lines.append(
                f"- Focused Expedition Route: {r.title} ({r.region}, Range: {r.range}, Distance: {r.trail_distance_km} km, Terrain: {r.canyon_terrain}, Water: {r.water_availability}, Max Temp: {r.max_ambient_temp_c}°C)"
            )
    return "\n".join(lines)


def slickrock_burro_tool(
    query: Optional[BurroDynamicsQuery] = None,
    action: Optional[str] = None,
    route_id: Optional[str] = None,
    terrain: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    if action in ("calculate", "calculate_dynamics") or query is not None:
        calc_q = query or BurroDynamicsQuery(
            route_id=route_id or "san-rafael-swell-chute-canyon"
        )
        res = calculate_burro_dynamics(calc_q)
        formatted = format_slickrock_burro_response("calculate", res)
        return dict(formatted._data)

    if action in ("gear", "gear_checklist"):
        checklist = get_burro_gear()
        formatted = format_slickrock_burro_response("gear_checklist", checklist)
        return dict(formatted._data)

    if action in ("get_route", "route_detail", "detail") and route_id:
        route = get_burro_route(route_id)
        if route:
            formatted = format_slickrock_burro_response("get_route", route)
            return dict(formatted._data)

    routes = get_burro_routes(terrain=terrain)
    formatted = format_slickrock_burro_response("catalog", routes)
    return dict(formatted._data)
