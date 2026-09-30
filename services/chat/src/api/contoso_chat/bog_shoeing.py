from typing import Any, Literal, Optional, Union

from pydantic import BaseModel, Field, model_validator

PeatlandTerrain = Literal[
    "quaking_sphagnum_mat",
    "boreal_black_spruce_muskeg",
    "patterned_fen_flark",
    "open_peat_mire",
    "floating_bog_tussock",
]

BogShoeType = Literal[
    "wide_oval_sphagnum_glider",
    "asymmetric_willow_bearpaw",
    "composite_mud_flotation_deck",
]

SinkingHazard = Literal[
    "firm_hummock_support",
    "moderate_saturated_slump",
    "critical_quaking_mire_submersion",
]

WaterSaturation = Literal[
    "drained_moss_crust",
    "seasonally_flooded",
    "fully_saturated_superficial_water",
]


class BogShoeingSite(BaseModel):
    id: str
    site_id: str = ""
    name: str = ""
    title: str = ""
    region: str = ""
    system: str = ""
    peat_depth_m: float = 0.0
    water_table_cm: float = 0.0
    water_saturation: str = "seasonally_flooded"
    terrain: str = "open_peat_mire"
    primary_shoe: str = "wide_oval_sphagnum_glider"
    description: str = ""
    highlights: list[str] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "siteId": "site_id",
                "peatDepthM": "peat_depth_m",
                "waterTableCm": "water_table_cm",
                "waterSaturation": "water_saturation",
                "primaryShoe": "primary_shoe",
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
            elif "site_id" in data and not data.get("id"):
                data["id"] = data["site_id"]
        return data

    @property
    def siteId(self) -> str:
        return self.id

    @property
    def peatDepthM(self) -> float:
        return self.peat_depth_m

    @property
    def waterTableCm(self) -> float:
        return self.water_table_cm

    @property
    def waterSaturation(self) -> str:
        return self.water_saturation

    @property
    def primaryShoe(self) -> str:
        return self.primary_shoe


class BogGearItem(BaseModel):
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


class BogFlotationQuery(BaseModel):
    site_id: str = "great-dismal-swamp-quaking-mat"
    user_weight_kg: float = 75.0
    payload_kg: float = 85.0
    shoe_type: Optional[str] = None
    terrain: Optional[str] = None
    water_saturation: Optional[str] = None
    stride_rate_spm: float = 60.0

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "siteId": "site_id",
                "userWeightKg": "user_weight_kg",
                "payloadKg": "payload_kg",
                "shoeType": "shoe_type",
                "waterSaturation": "water_saturation",
                "strideRateSpm": "stride_rate_spm",
            }
            for k, v in mapping.items():
                if k in data and v not in data:
                    data[v] = data[k]
            if "payload_kg" not in data and "user_weight_kg" in data:
                data["payload_kg"] = data["user_weight_kg"] + 10.0
            elif "user_weight_kg" not in data and "payload_kg" in data:
                data["user_weight_kg"] = max(40.0, data["payload_kg"] - 10.0)
        return data


class BogFlotationResult(BaseModel):
    site_id: str = "great-dismal-swamp-quaking-mat"
    site_name: str = ""
    site_title: str = ""
    terrain: str = ""
    shoe_type: str = ""
    flotation_index: float = 0.0
    ground_pressure_kpa: float = 0.0
    sinking_depth_cm: float = 0.0
    sinking_hazard: str = ""
    water_saturation: str = ""
    recommended_pacing: str = ""
    safety_advisory: str = ""
    rescue_protocol: str = ""

    @model_validator(mode="before")
    @classmethod
    def handle_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            mapping = {
                "siteId": "site_id",
                "siteName": "site_name",
                "siteTitle": "site_title",
                "shoeType": "shoe_type",
                "flotationIndex": "flotation_index",
                "groundPressureKpa": "ground_pressure_kpa",
                "sinkingDepthCm": "sinking_depth_cm",
                "sinkingHazard": "sinking_hazard",
                "waterSaturation": "water_saturation",
                "recommendedPacing": "recommended_pacing",
                "safetyAdvisory": "safety_advisory",
                "rescueProtocol": "rescue_protocol",
            }
            for k, v in mapping.items():
                if k in data and v not in data:
                    data[v] = data[k]
            if "site_title" in data and not data.get("site_name"):
                data["site_name"] = data["site_title"]
            elif "site_name" in data and not data.get("site_title"):
                data["site_title"] = data["site_name"]
        return data

    @property
    def siteName(self) -> str:
        return self.site_name

    @property
    def siteTitle(self) -> str:
        return self.site_title

    @property
    def shoeType(self) -> str:
        return self.shoe_type

    @property
    def flotationIndex(self) -> float:
        return self.flotation_index

    @property
    def groundPressureKpa(self) -> float:
        return self.ground_pressure_kpa

    @property
    def sinkingDepthCm(self) -> float:
        return self.sinking_depth_cm

    @property
    def sinkingHazard(self) -> str:
        return self.sinking_hazard

    @property
    def waterSaturation(self) -> str:
        return self.water_saturation

    @property
    def recommendedPacing(self) -> str:
        return self.recommended_pacing

    @property
    def safetyAdvisory(self) -> str:
        return self.safety_advisory

    @property
    def rescueProtocol(self) -> str:
        return self.rescue_protocol


class BogShoeingIntent(BaseModel):
    action: str
    site_id: Optional[str] = None
    terrain: Optional[str] = None
    water_saturation: Optional[str] = None


class FormattedBogShoeingResponse(str):
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


DEFAULT_BOG_SHOEING_SITES: dict[str, BogShoeingSite] = {
    "great-dismal-swamp-quaking-mat": BogShoeingSite(
        id="great-dismal-swamp-quaking-mat",
        name="Great Dismal Sphagnum Quake Corridor",
        title="Great Dismal Sphagnum Quake Corridor",
        region="Virginia / North Carolina Border",
        system="Coastal Peatland Reserve",
        peat_depth_m=4.5,
        water_table_cm=-5.0,
        water_saturation="fully_saturated_superficial_water",
        terrain="quaking_sphagnum_mat",
        primary_shoe="wide_oval_sphagnum_glider",
        description="Unconsolidated floating peat mats over deep subterranean organic sludge demanding wide-deck flotation and rhythmic stride pacing.",
        highlights=[
            "Floating peat mat elastic oscillations",
            "Deep sub-surface organic muck layers",
            "Restricted Atlantic white cedar groves",
        ],
    ),
    "boundary-waters-spruce-muskeg": BogShoeingSite(
        id="boundary-waters-spruce-muskeg",
        name="Boundary Waters Black Spruce Muskeg Traverse",
        title="Boundary Waters Black Spruce Muskeg Traverse",
        region="Superior National Forest, Minnesota",
        system="Laurentian Mixed Forest Karst-Peat",
        peat_depth_m=6.2,
        water_table_cm=-15.0,
        water_saturation="seasonally_flooded",
        terrain="boreal_black_spruce_muskeg",
        primary_shoe="asymmetric_willow_bearpaw",
        description="Densely forested boreal tamarack and stunted black spruce muskeg with deep waterlogged moss hollows between woody hummocks.",
        highlights=[
            "Stunted boreal spruce obstacle navigation",
            "Spongy hummock-and-hollow topography",
            "Sub-surface root tangle hazards",
        ],
    ),
    "kenai-peninsula-patterned-fen": BogShoeingSite(
        id="kenai-peninsula-patterned-fen",
        name="Kenai Peninsula Patterned Fen & Flark System",
        title="Kenai Peninsula Patterned Fen & Flark System",
        region="Kenai National Wildlife Refuge, Alaska",
        system="Subarctic Maritime Peatland",
        peat_depth_m=8.0,
        water_table_cm=5.0,
        water_saturation="fully_saturated_superficial_water",
        terrain="patterned_fen_flark",
        primary_shoe="wide_oval_sphagnum_glider",
        description="Vast subarctic ribbed fens with alternating linear moss strings and deep standing water flarks requiring constant water-crossing leaps.",
        highlights=[
            "Alternating flark water channel crossings",
            "High-latitude permafrost peat margins",
            "Subarctic migratory bird breeding grounds",
        ],
    ),
    "adirondack-spring-mire-basin": BogShoeingSite(
        id="adirondack-spring-mire-basin",
        name="Adirondack High Peaks Spring Mire Basin",
        title="Adirondack High Peaks Spring Mire Basin",
        region="Adirondack Park, New York",
        system="Northern Boreal Bog Preserve",
        peat_depth_m=3.8,
        water_table_cm=-10.0,
        water_saturation="seasonally_flooded",
        terrain="open_peat_mire",
        primary_shoe="composite_mud_flotation_deck",
        description="Glacial kettle-hole bog featuring carnivorous pitcher plants, delicate sundews, and deep semi-fluid peat pools.",
        highlights=[
            "Glacial kettle-hole geological formations",
            "Vulnerable carnivorous bog botanical zones",
            "Acidic low-decomposition peat deposits",
        ],
    ),
    "algonquin-highland-tussock-fen": BogShoeingSite(
        id="algonquin-highland-tussock-fen",
        name="Algonquin Highland Floating Tussock Fen",
        title="Algonquin Highland Floating Tussock Fen",
        region="Ontario, Canada",
        system="Canadian Shield Boreal Bog System",
        peat_depth_m=5.5,
        water_table_cm=0.0,
        water_saturation="fully_saturated_superficial_water",
        terrain="floating_bog_tussock",
        primary_shoe="asymmetric_willow_bearpaw",
        description="Challenging tussock mounds surrounded by quaking muck trenches requiring precise step placement to prevent breakthrough.",
        highlights=[
            "Sedge tussock stepping stone navigation",
            "Cold tannin-stained peat water channels",
            "High-buoyancy hollow moss cushions",
        ],
    ),
}

DEFAULT_BOG_GEAR: list[BogGearItem] = [
    BogGearItem(
        id="sphagnum-glider-bog-shoes",
        name="Wide-Oval Sphagnum Glider Bog-Shoes (High Surface Area Flotation)",
        category="flotation",
        mandatory=True,
        description="Distributes body weight over delicate quaking moss mats and unconsolidated peat sludge to prevent breakthrough.",
    ),
    BogGearItem(
        id="carbon-peat-sounding-pole",
        name="Graduated Carbon Fiber Peat Sounding Pole (3.0m)",
        category="navigation_safety",
        mandatory=True,
        description="Probes concealed mire depths, tests underlying substrata firmness, and provides 3-point balance across quaking moss.",
    ),
    BogGearItem(
        id="breathable-bog-waders",
        name="Reinforced Breathable Bog Waders with Welded Neoprene Booties",
        category="exposure_protection",
        mandatory=True,
        description="Prevents hypothermia in acidic, tannin-saturated peat water and shields against submerged sharp root snags.",
    ),
    BogGearItem(
        id="floating-peatland-gps-compass",
        name="Submersible Floating Peatland GPS & Sighting Compass Unit",
        category="navigation",
        mandatory=True,
        description="Enables dead reckoning and navigation through disorienting boreal muskeg and patterned fen flark corridors.",
    ),
    BogGearItem(
        id="self-rescue-extraction-awls",
        name="Tethered Ergonomic Self-Rescue Mud & Peat Extraction Awls",
        category="emergency_rescue",
        mandatory=True,
        description="Provides grip purchase and immediate mechanical leverage to haul oneself out of critical quaking mire breakthroughs.",
    ),
    BogGearItem(
        id="peatland-distress-whistle-strobe",
        name="High-Decibel Peatland Distress Whistle & Rescue Strobe Beacon",
        category="emergency_signaling",
        mandatory=True,
        description="Audible and visual distress signaling across expansive, featureless peat mires and dense black spruce thickets.",
    ),
]


def get_bog_shoeing_sites(
    terrain: Optional[str] = None,
    saturation: Optional[str] = None,
) -> list[BogShoeingSite]:
    sites = list(DEFAULT_BOG_SHOEING_SITES.values())
    if terrain:
        norm_terrain = terrain.strip().lower().replace("-", "_").replace(" ", "_")
        sites = [
            s
            for s in sites
            if s.terrain.lower().replace("-", "_").replace(" ", "_") == norm_terrain
        ]
    if saturation:
        norm_sat = saturation.strip().lower().replace("-", "_").replace(" ", "_")
        sites = [
            s
            for s in sites
            if s.water_saturation.lower().replace("-", "_").replace(" ", "_") == norm_sat
        ]
    return sites


def get_bog_shoeing_site(site_id: str) -> Optional[BogShoeingSite]:
    norm_id = site_id.strip().lower()
    for k, s in DEFAULT_BOG_SHOEING_SITES.items():
        if (
            k.lower() == norm_id
            or s.id.lower() == norm_id
            or s.name.lower() == norm_id
            or s.title.lower() == norm_id
        ):
            return s
    return None


def get_bog_gear_checklist() -> list[BogGearItem]:
    return list(DEFAULT_BOG_GEAR)


def calculate_bog_flotation(query: BogFlotationQuery) -> BogFlotationResult:
    site = get_bog_shoeing_site(query.site_id)
    if not site:
        raise ValueError(f"Bog shoeing site '{query.site_id}' not found")

    terrain = query.terrain or site.terrain
    shoe_type = query.shoe_type or site.primary_shoe
    saturation = query.water_saturation or site.water_saturation
    payload = query.payload_kg or (query.user_weight_kg + 10.0)

    # Deck area in square meters for a pair of bog shoes
    deck_area_map = {
        "wide_oval_sphagnum_glider": 0.48,
        "composite_mud_flotation_deck": 0.42,
        "asymmetric_willow_bearpaw": 0.36,
    }
    deck_area = deck_area_map.get(shoe_type, 0.42)

    # Ground pressure in kPa: Force (N) / Area (m2) / 1000
    ground_pressure_kpa = round((payload * 9.80665) / deck_area / 1000.0, 2)

    # Bearing capacity factor by terrain profile
    bearing_factor = {
        "quaking_sphagnum_mat": 0.55,
        "patterned_fen_flark": 0.65,
        "floating_bog_tussock": 0.80,
        "open_peat_mire": 0.75,
        "boreal_black_spruce_muskeg": 0.90,
    }.get(terrain, 0.70)

    # Saturation multiplier
    saturation_mult = {
        "drained_moss_crust": 0.7,
        "seasonally_flooded": 1.1,
        "fully_saturated_superficial_water": 1.45,
    }.get(saturation, 1.0)

    # Water table impact (positive water table cm indicates surface water)
    water_table_impact = max(0.0, site.water_table_cm * 0.4)

    # Estimated sinking depth in cm
    sinking_depth_cm = round(
        max(
            1.0,
            (ground_pressure_kpa / bearing_factor) * 2.8 * saturation_mult
            + water_table_impact,
        ),
        1,
    )

    # Flotation index (0-10): Higher is better flotation
    raw_flotation = 10.0 - (sinking_depth_cm / 3.5)
    flotation_index = round(max(1.0, min(9.9, raw_flotation)), 1)

    # Sinking hazard classification
    if (
        sinking_depth_cm > 18.0
        or (
            terrain == "quaking_sphagnum_mat"
            and saturation == "fully_saturated_superficial_water"
            and ground_pressure_kpa > 1.7
        )
    ):
        sinking_hazard = "critical_quaking_mire_submersion"
        safety_advisory = (
            "CRITICAL MIRE SUBMERSION HAZARD: Severe risk of breakthrough into unconsolidated organic sludge. "
            "Maintain wide deck flotation, avoid stopping or concentrating weight on single points, and tether with partner."
        )
        rescue_protocol = (
            "Deploy carbon sounding poles horizontally to bridge peat fissure; use self-rescue extraction awls "
            "to crawl horizontally onto consolidated sphagnum mat; avoid downward vertical thrashing."
        )
        recommended_pacing = "Continuous rhythmic glide pacing (65-75 spm); zero stationary pauses on quaking mat."
    elif (
        sinking_depth_cm >= 9.0
        or saturation in ("seasonally_flooded", "fully_saturated_superficial_water")
    ):
        sinking_hazard = "moderate_saturated_slump"
        safety_advisory = (
            "MODERATE SATURATED SLUMP CAUTION: Significant depression and moss water expelling observed. "
            "Stay aligned with firmer woody hummocks and avoid flark drainage depressions."
        )
        rescue_protocol = (
            "Shift center of gravity to rear deck of shoes; probe adjacent hummocks with sounding pole before stepping."
        )
        recommended_pacing = "Cautious metered stride pacing (50-60 spm) favoring elevated moss hummock crests."
    else:
        sinking_hazard = "firm_hummock_support"
        safety_advisory = (
            "OPTIMAL MOSS FLOTATION: Peat crust provides stable support. Maintain vigilance for concealed muskeg hollows."
        )
        rescue_protocol = (
            "Standard self-arrest with sounding pole; maintain course along surveyed boreal ridge line."
        )
        recommended_pacing = "Standard touring cadence (50-65 spm) across open peat plateaus."

    return BogFlotationResult(
        site_id=site.id,
        site_name=site.name,
        site_title=site.name,
        terrain=terrain,
        shoe_type=shoe_type,
        flotation_index=flotation_index,
        ground_pressure_kpa=ground_pressure_kpa,
        sinking_depth_cm=sinking_depth_cm,
        sinking_hazard=sinking_hazard,
        water_saturation=saturation,
        recommended_pacing=recommended_pacing,
        safety_advisory=safety_advisory,
        rescue_protocol=rescue_protocol,
    )


def detect_bog_shoeing_intent(message: str) -> bool:
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
        "sandboarding",
        "cave diving",
        "siphon",
        "sump",
        "caving",
        "speleothem",
        "cave pearl",
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
        "bog shoeing",
        "bog shoe",
        "bog-shoeing",
        "bog-shoe",
        "muskeg",
        "peatland",
        "quaking bog",
        "sphagnum mat",
        "peat mire",
        "fen flark",
        "bog waders",
        "peat sounding",
    ]
    if any(k in q for k in keywords):
        return True

    site_matches = [
        "great dismal",
        "sphagnum quake",
        "boundary waters",
        "black spruce muskeg",
        "kenai peninsula",
        "patterned fen",
        "adirondack",
        "spring mire",
        "algonquin",
        "tussock fen",
    ]
    if any(sm in q for sm in site_matches):
        return True

    if any(k in q for k in DEFAULT_BOG_SHOEING_SITES):
        return True

    return False


def extract_bog_shoeing_intent(message: str) -> BogShoeingIntent:
    q = message.lower().strip()

    matched_site_id: Optional[str] = None
    if "great dismal" in q or "sphagnum quake" in q or "dismal swamp" in q:
        matched_site_id = "great-dismal-swamp-quaking-mat"
    elif "boundary waters" in q or "spruce muskeg" in q or "black spruce" in q:
        matched_site_id = "boundary-waters-spruce-muskeg"
    elif "kenai" in q or "patterned fen" in q or "flark" in q:
        matched_site_id = "kenai-peninsula-patterned-fen"
    elif "adirondack" in q or "spring mire" in q or "kettle-hole" in q:
        matched_site_id = "adirondack-spring-mire-basin"
    elif "algonquin" in q or "tussock fen" in q or "floating tussock" in q:
        matched_site_id = "algonquin-highland-tussock-fen"
    else:
        for s_id in DEFAULT_BOG_SHOEING_SITES:
            if s_id in q:
                matched_site_id = s_id
                break

    terrain: Optional[str] = None
    if "quaking_sphagnum_mat" in q or "quaking sphagnum" in q:
        terrain = "quaking_sphagnum_mat"
    elif "boreal_black_spruce_muskeg" in q or "black spruce muskeg" in q:
        terrain = "boreal_black_spruce_muskeg"
    elif "patterned_fen_flark" in q or "patterned fen" in q:
        terrain = "patterned_fen_flark"
    elif "open_peat_mire" in q or "open peat" in q:
        terrain = "open_peat_mire"
    elif "floating_bog_tussock" in q or "floating tussock" in q:
        terrain = "floating_bog_tussock"

    calc_keywords = [
        "calculate",
        "flotation",
        "ground pressure",
        "sinking depth",
        "sinking hazard",
        "pressure",
        "hazard",
        "stride",
        "pacing",
        "kpa",
        "bearing",
    ]
    gear_keywords = [
        "gear",
        "checklist",
        "equipment",
        "waders",
        "sounding pole",
        "awls",
        "shoes",
        "strobe",
    ]

    if any(k in q for k in calc_keywords):
        action = "calculate"
    elif any(k in q for k in gear_keywords):
        action = "gear"
    elif matched_site_id and any(
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
            "water table",
        ]
    ):
        action = "site_detail"
    elif matched_site_id and not any(
        k in q for k in ["sites", "catalog", "list", "options", "all"]
    ):
        action = "site_detail"
    else:
        action = "sites_list"

    return BogShoeingIntent(
        action=action,
        site_id=matched_site_id,
        terrain=terrain,
    )


def format_bog_shoeing_response(
    intent: Union[BogShoeingIntent, str],
    data: Any = None,
) -> FormattedBogShoeingResponse:
    if isinstance(data, dict) and "bog_shoeing_info" in data:
        answer = str(data.get("answer", "Wilderness peatland bog-shoeing guidance"))
        return FormattedBogShoeingResponse(answer, data)

    intent_obj: BogShoeingIntent
    if isinstance(intent, BogShoeingIntent):
        intent_obj = intent
    elif isinstance(intent, str):
        if intent == "bog_shoeing" and isinstance(data, str):
            intent_obj = extract_bog_shoeing_intent(data)
        elif intent in ("calculate", "calculate_flotation"):
            intent_obj = BogShoeingIntent(action="calculate")
        elif intent in ("gear", "gear_checklist"):
            intent_obj = BogShoeingIntent(action="gear")
        elif intent in ("site_detail", "detail"):
            site_id = (
                data
                if isinstance(data, str) and data in DEFAULT_BOG_SHOEING_SITES
                else None
            )
            intent_obj = BogShoeingIntent(action="site_detail", site_id=site_id)
        else:
            intent_obj = BogShoeingIntent(action=intent)
    else:
        intent_obj = BogShoeingIntent(action="sites_list")

    action = intent_obj.action

    if action in ("calculate", "calculate_flotation"):
        if isinstance(data, BogFlotationResult):
            calc_res = data
        elif isinstance(data, BogFlotationQuery):
            calc_res = calculate_bog_flotation(data)
        else:
            calc_q = BogFlotationQuery(
                site_id=intent_obj.site_id or "great-dismal-swamp-quaking-mat",
                terrain=intent_obj.terrain,
            )
            calc_res = calculate_bog_flotation(calc_q)

        answer = (
            f"Wilderness Boreal Peatland Flotation Telemetry for {calc_res.site_name} ({calc_res.terrain}): "
            f"Hazard: {calc_res.sinking_hazard.upper()}. "
            f"Flotation Index: {calc_res.flotation_index}/10. "
            f"Ground Pressure: {calc_res.ground_pressure_kpa} kPa. "
            f"Sinking Depth: {calc_res.sinking_depth_cm} cm. "
            f"Pacing: {calc_res.recommended_pacing} "
            f"{calc_res.safety_advisory} Rescue: {calc_res.rescue_protocol}"
        )
        calc_info: dict[str, Any] = {
            "bog_shoeing_info": {
                "action": "calculate",
                "site_id": calc_res.site_id,
                "calculation": calc_res.model_dump(),
                "flotation_index": calc_res.flotation_index,
                "ground_pressure_kpa": calc_res.ground_pressure_kpa,
                "sinking_depth_cm": calc_res.sinking_depth_cm,
                "sinking_hazard": calc_res.sinking_hazard,
                "water_saturation": calc_res.water_saturation,
                "recommended_pacing": calc_res.recommended_pacing,
                "safety_advisory": calc_res.safety_advisory,
                "rescue_protocol": calc_res.rescue_protocol,
            },
            "answer": answer,
        }
        return FormattedBogShoeingResponse(answer, calc_info)

    if action in ("gear", "gear_checklist"):
        checklist = data if isinstance(data, list) else get_bog_gear_checklist()
        items_str = "; ".join(f"{g.name} ({g.purpose})" for g in checklist)
        answer = (
            f"Mandatory Wilderness Peatland Bog-Shoeing Gear Checklist ({len(checklist)} items): "
            f"{items_str}. Wide-oval gliders, graduated sounding poles, and self-rescue extraction awls are required "
            f"for all quaking mire and muskeg traverses."
        )
        gear_info: dict[str, Any] = {
            "bog_shoeing_info": {
                "action": "gear",
                "gear": [g.model_dump() for g in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedBogShoeingResponse(answer, gear_info)

    if action in ("site_detail", "detail"):
        site = None
        if intent_obj.site_id:
            site = get_bog_shoeing_site(intent_obj.site_id)
        if not site and isinstance(data, BogShoeingSite):
            site = data
        if not site:
            site = get_bog_shoeing_site("great-dismal-swamp-quaking-mat")

        if site:
            highlights_str = ", ".join(site.highlights)
            answer = (
                f"Wilderness Peatland Route: {site.name} ({site.system}, {site.region}). "
                f"Peat Depth: {site.peat_depth_m}m | Water Table: {site.water_table_cm}cm | "
                f"Terrain: {site.terrain} | Water Saturation: {site.water_saturation} | "
                f"Primary Shoe: {site.primary_shoe}. "
                f"{site.description} Key Highlights: {highlights_str}."
            )
            site_info: dict[str, Any] = {
                "bog_shoeing_info": {
                    "action": "site_detail",
                    "site_id": site.id,
                    "site": site.model_dump(),
                },
                "answer": answer,
            }
            return FormattedBogShoeingResponse(answer, site_info)

    sites = (
        data
        if isinstance(data, list)
        else get_bog_shoeing_sites(
            terrain=intent_obj.terrain,
            saturation=intent_obj.water_saturation,
        )
    )
    summary_str = "; ".join(
        f"{s.name} ({s.region}, {s.terrain}, primary shoe: {s.primary_shoe})"
        for s in sites
    )
    answer = (
        f"Contoso Wilderness Boreal Peatland Bog-Shoeing Catalog ({len(sites)} routes): {summary_str}. "
        "Inquire about specific peatland routes, ground pressure and flotation calculations, "
        "or mandatory muskeg and quaking mire gear checklists."
    )
    list_info: dict[str, Any] = {
        "bog_shoeing_info": {
            "action": "sites_list",
            "terrain": intent_obj.terrain,
            "saturation": intent_obj.water_saturation,
            "sites": [s.model_dump() for s in sites],
        },
        "answer": answer,
    }
    return FormattedBogShoeingResponse(answer, list_info)


def build_bog_shoeing_prompt(intent_or_question: Any = None) -> str:
    lines = [
        "Wilderness Boreal Peatland Bog-Shoeing & Muskeg Navigation Guidance:",
        "- Peatland Terrain Dynamics: Boreal peat mires feature unconsolidated quaking sphagnum mats, patterned fen flarks with water troughs, floating tussock mounds, and deep black spruce muskeg hollows.",
        "- Wide-Deck Flotation Engineering: Wide oval sphagnum gliders (0.48 m²) and asymmetric willow bearpaws provide essential flotation by distributing ground pressure (<2.0 kPa) over delicate living moss crusts to prevent catastrophic mire breakthrough.",
        "- Sinking Hazard Triage: Submersion risk elevates rapidly when water saturation reaches superficial standing water. Probe forward bearing surfaces with a graduated carbon sounding pole before weight transfer.",
        "- Self-Rescue Protocols: In the event of a quaking mire breakthrough, avoid vertical kicking or thrashing; deploy sounding poles horizontally to bridge the peat fissure and use handheld extraction awls to crawl horizontally onto firm moss.",
        "- Mandatory Peatland Gear Kit: Wide-Oval Sphagnum Glider Bog-Shoes, Graduated Carbon Sounding Pole (3m), Reinforced Breathable Bog Waders, Submersible Floating GPS & Compass, Tethered Self-Rescue Extraction Awls, and SOLAS Peatland Distress Whistle/Strobe.",
    ]
    site_id = None
    if isinstance(intent_or_question, BogShoeingIntent) and intent_or_question.site_id:
        site_id = intent_or_question.site_id
    elif isinstance(intent_or_question, str):
        detected = detect_bog_shoeing_intent(intent_or_question)
        if detected:
            intent_obj = extract_bog_shoeing_intent(intent_or_question)
            if intent_obj and intent_obj.site_id:
                site_id = intent_obj.site_id

    if site_id:
        s = get_bog_shoeing_site(site_id)
        if s:
            lines.append(
                f"- Focused Peatland Route: {s.name} ({s.region}, System: {s.system}, Peat Depth: {s.peat_depth_m}m, Terrain: {s.terrain}, Primary Shoe: {s.primary_shoe})"
            )
    return "\n".join(lines)


def bog_shoeing_tool(
    query: Optional[BogFlotationQuery] = None,
    action: Optional[str] = None,
    site_id: Optional[str] = None,
    terrain: Optional[str] = None,
    saturation: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    if action in ("calculate", "calculate_flotation") or query is not None:
        calc_q = query or BogFlotationQuery(
            site_id=site_id or "great-dismal-swamp-quaking-mat"
        )
        res = calculate_bog_flotation(calc_q)
        formatted = format_bog_shoeing_response("calculate", res)
        return dict(formatted._data)

    if action in ("gear", "gear_checklist"):
        checklist = get_bog_gear_checklist()
        formatted = format_bog_shoeing_response("gear", checklist)
        return dict(formatted._data)

    if action in ("site_detail", "detail") and site_id:
        site = get_bog_shoeing_site(site_id)
        if site:
            formatted = format_bog_shoeing_response("site_detail", site)
            return dict(formatted._data)

    sites = get_bog_shoeing_sites(terrain=terrain, saturation=saturation)
    formatted = format_bog_shoeing_response("sites_list", sites)
    return dict(formatted._data)
