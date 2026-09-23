from typing import Any, Optional

from pydantic import BaseModel


class SurvivalShelterModel(BaseModel):
    shelter_id: str
    title: str
    environment: str
    min_snow_depth_m: float
    difficulty: str
    construction_hours: float
    capacity_persons: int
    interior_thermal_gain_f: int
    min_roof_thickness_cm: int
    description: str
    highlights: list[str]


class ShelterThermodynamicsRequest(BaseModel):
    shelter_id: str
    ambient_temp_f: float = 0.0
    occupant_count: int = 2
    wall_thickness_cm: float = 30.0
    vent_hole_diameter_cm: float = 10.0
    platform_height_above_floor_cm: float = 35.0
    candle_lit: bool = False


class ShelterThermodynamicsResponse(BaseModel):
    shelter_id: str
    shelter_title: str
    interior_temp_f: int
    floor_temp_f: int
    wall_r_value: float
    cold_trap_differential_f: int
    ventilation_adequacy_percent: int
    structural_safety_status: str
    thermal_advisory: str


class ShelterGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class ShelterIntent(BaseModel):
    action: str  # "shelters_list", "shelter_detail", "calculate_thermodynamics", "gear_checklist"
    shelter_id: Optional[str] = None
    difficulty: Optional[str] = None
    environment: Optional[str] = None


class FormattedShelterResponse(str):
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


DEFAULT_SURVIVAL_SHELTERS: dict[str, SurvivalShelterModel] = {
    "alpine-snow-cave-bivouac": SurvivalShelterModel(
        shelter_id="alpine-snow-cave-bivouac",
        title="Alpine Snow Cave Bivouac",
        environment="high_alpine_tundra",
        min_snow_depth_m=2.0,
        difficulty="advanced",
        construction_hours=4.0,
        capacity_persons=2,
        interior_thermal_gain_f=32,
        min_roof_thickness_cm=45,
        description="High-altitude mountaineering snow cave excavated into wind-drifted leeward slopes with a curved dome ceiling, sunken cold-air trap, and elevated sleeping shelf.",
        highlights=[
            "Sunken cold-air drainage well prevents freezing draft at sleeping level",
            "Smooth parabolic ceiling prevents meltwater dripping onto occupants",
            "Maintains 32°F interior baseline even during -20°F alpine blizzards",
        ],
    ),
    "subarctic-quinzhee-snow-mound": SurvivalShelterModel(
        shelter_id="subarctic-quinzhee-snow-mound",
        title="Subarctic Quinzhee Snow Mound",
        environment="subarctic_taiga",
        min_snow_depth_m=0.8,
        difficulty="intermediate",
        construction_hours=5.0,
        capacity_persons=3,
        interior_thermal_gain_f=28,
        min_roof_thickness_cm=30,
        description="Sintered dome shelter built by piling unconsolidated snow into a dome mound, allowing 2-3 hours for recrystallization sintering, and excavating interior cavity.",
        highlights=[
            "Constructible in powdery snow without requiring dense consolidated wind slab",
            "Guide sticks inserted 30cm deep prevent dangerous roof over-excavation",
            "Optimal dome thermodynamics trap ascending body heat on elevated snow platform",
        ],
    ),
    "emergency-snow-trench-tarp": SurvivalShelterModel(
        shelter_id="emergency-snow-trench-tarp",
        title="Emergency Snow Trench & Tarp Bivouac",
        environment="alpine_montane",
        min_snow_depth_m=1.2,
        difficulty="beginner",
        construction_hours=1.5,
        capacity_persons=2,
        interior_thermal_gain_f=18,
        min_roof_thickness_cm=20,
        description="Rapidly excavated emergency slit trench spanned with ski poles, probes, sealed with a reflective survival tarp, and weighted with perimeter snow blocks.",
        highlights=[
            "Rapid emergency deployment achievable within 90 minutes in unexpected storms",
            "Narrow profile dramatically minimizes wind shear and blizzard exposure",
            "Ski pole and avalanche probe ridge supports with snow block anchoring",
        ],
    ),
    "boreal-debris-hut-lean-to": SurvivalShelterModel(
        shelter_id="boreal-debris-hut-lean-to",
        title="Boreal Forest Debris Hut & Snow Lean-To",
        environment="boreal_forest",
        min_snow_depth_m=0.3,
        difficulty="intermediate",
        construction_hours=3.5,
        capacity_persons=1,
        interior_thermal_gain_f=22,
        min_roof_thickness_cm=25,
        description="Sub-treeline winter shelter utilizing a sturdy ridgepole, lattice ribs, deep spruce bough insulation, and external snow banking to prevent wind infiltration.",
        highlights=[
            "Viable in early winter conditions with insufficient snow depth for full caves",
            "Compressed evergreen bough thatch provides R-value insulation without snow slab",
            "Elevated pole and bough sleeping bed halts conductive ground heat loss",
        ],
    ),
    "tree-well-snow-bivouac": SurvivalShelterModel(
        shelter_id="tree-well-snow-bivouac",
        title="Tree Well Emergency Snow Bivouac",
        environment="montane_conifer_forest",
        min_snow_depth_m=1.5,
        difficulty="beginner",
        construction_hours=1.0,
        capacity_persons=1,
        interior_thermal_gain_f=15,
        min_roof_thickness_cm=20,
        description="Opportunistic storm refuge excavated into the natural snow void beneath low-hanging evergreen canopy branches, fortified with snow walls and bough roof.",
        highlights=[
            "Exploits natural canopy depression requiring 60% less excavation effort",
            "Overhanging conifer branches deflect heavy snowfall and freezing precipitation",
            "Requires vigilant safety checks to prevent snow immersion suffocation (SIS)",
        ],
    ),
}

DEFAULT_SHELTER_GEAR: list[ShelterGearRequirement] = [
    ShelterGearRequirement(
        item_id="d-grip-avalanche-snow-shovel",
        name="High-Strength D-Grip Aluminum Avalanche Snow Shovel",
        category="excavation_tools",
        mandatory=True,
        purpose="High-volume snow moving, shaping arched cave ceilings, and digging cold-air drainage wells.",
    ),
    ShelterGearRequirement(
        item_id="folding-snow-bone-saw",
        name="Stainless Steel Folding Snow & Bone Saw (35cm Blade)",
        category="cutting_tools",
        mandatory=True,
        purpose="Cutting dense wind-slab snow blocks for doorway seals, entry windbreaks, and bough branches.",
    ),
    ShelterGearRequirement(
        item_id="thermal-bivy-survival-bag",
        name="Reflective Thermal Bivy Survival Bag & Vapor Barrier",
        category="thermal_protection",
        mandatory=True,
        purpose="Reflects 90% radiant metabolic body heat and shields sleeping bag from contact snow melt.",
    ),
    ShelterGearRequirement(
        item_id="closed-cell-foam-sleeping-pad",
        name="Closed-Cell Foam Thermal Sleeping Pad (R-Value 2.5+)",
        category="ground_insulation",
        mandatory=True,
        purpose="Essential conductive barrier preventing ground freeze from conducting heat away from sleeping occupants.",
    ),
    ShelterGearRequirement(
        item_id="angled-ventilation-probe",
        name="Angled Ski Pole / Avalanche Probe Chimney Ventilation Cleaner",
        category="ventilation_safety",
        mandatory=True,
        purpose="Boring and maintaining 45-degree angled roof chimney vents to exhaust toxic CO2 and cooking moisture.",
    ),
    ShelterGearRequirement(
        item_id="survival-candle-lantern",
        name="Windproof Survival Candle Lantern & Match Kit",
        category="illumination_thermal",
        mandatory=True,
        purpose="Provides interior illumination, raises temperature +2-4°F, and serves as an early warning carbon dioxide indicator.",
    ),
]


def get_survival_shelters(difficulty: Optional[str] = None) -> list[SurvivalShelterModel]:
    shelters = list(DEFAULT_SURVIVAL_SHELTERS.values())
    if difficulty:
        diff_clean = difficulty.strip().lower()
        shelters = [s for s in shelters if s.difficulty.lower() == diff_clean]
    return shelters


def get_survival_shelter_by_id(shelter_id: str) -> Optional[SurvivalShelterModel]:
    return DEFAULT_SURVIVAL_SHELTERS.get(shelter_id.strip().lower())


def get_shelter_gear() -> list[ShelterGearRequirement]:
    return list(DEFAULT_SHELTER_GEAR)


def calculate_shelter_thermodynamics(
    request: ShelterThermodynamicsRequest,
) -> ShelterThermodynamicsResponse:
    shelter = get_survival_shelter_by_id(request.shelter_id)
    if not shelter:
        raise ValueError(f"Survival shelter '{request.shelter_id}' not found")

    # Snow wall R-value: ~0.25 R-value per cm thickness
    wall_r_value = round(max(0.5, request.wall_thickness_cm * 0.25), 1)

    # Cold trap differential: platform height above floor well
    # ~0.25°F per cm of elevation, capped at 20°F
    cold_trap_differential_f = int(
        min(20, max(0, round(request.platform_height_above_floor_cm * 0.25)))
    )

    # Metabolic and candle thermal contributions
    occupant_heat = request.occupant_count * 5.0
    candle_heat = 4.0 if request.candle_lit else 0.0

    # Intrinsic shelter thermal efficiency scaled by wall thickness
    thickness_ratio = min(
        1.5,
        max(
            0.4,
            request.wall_thickness_cm / max(1.0, float(shelter.min_roof_thickness_cm)),
        ),
    )
    insulation_gain = shelter.interior_thermal_gain_f * 0.5 * thickness_ratio

    raw_interior = (
        request.ambient_temp_f
        + insulation_gain
        + occupant_heat
        + candle_heat
        + (cold_trap_differential_f * 0.5)
    )

    if "snow" in shelter.shelter_id or "quinzhee" in shelter.shelter_id:
        # Snow cave thermodynamics naturally plateau near 32°F to 34°F due to phase change
        interior_temp_f = int(round(min(34.0, max(request.ambient_temp_f + 5.0, raw_interior))))
    else:
        interior_temp_f = int(round(max(request.ambient_temp_f + 3.0, raw_interior)))

    # Floor temperature settles into cold-air well
    floor_temp_f = interior_temp_f - cold_trap_differential_f

    # Chimney ventilation adequacy
    # Each person requires ~4.5 cm diameter vent hole; candle consumes additional oxygen (~1.0 cm diameter equivalent)
    required_vent_dia = request.occupant_count * 4.5 + (1.0 if request.candle_lit else 0.0)
    ventilation_adequacy_percent = int(
        min(
            100,
            max(
                0,
                round((request.vent_hole_diameter_cm / max(1.0, required_vent_dia)) * 100),
            ),
        )
    )

    # Structural and ventilation safety status
    if request.wall_thickness_cm < shelter.min_roof_thickness_cm * 0.7:
        structural_safety_status = "CRITICAL_COLLAPSE_RISK"
    elif request.wall_thickness_cm < shelter.min_roof_thickness_cm:
        structural_safety_status = "COLLAPSE_WARNING"
    elif ventilation_adequacy_percent < 50:
        structural_safety_status = "ASPHYXIATION_HAZARD"
    elif ventilation_adequacy_percent < 80 or request.platform_height_above_floor_cm < 20.0:
        structural_safety_status = "CAUTION"
    else:
        structural_safety_status = "SAFE"

    # Thermal & safety advisory
    advisories = []
    advisories.append(
        f"Interior sleeping shelf temperature modeled at {interior_temp_f}°F with sunken cold-air well floor at {floor_temp_f}°F."
    )
    if cold_trap_differential_f >= 5:
        advisories.append(
            f"Cold-air trap provides a +{cold_trap_differential_f}°F thermal inversion benefiting sleeping occupants."
        )
    else:
        advisories.append(
            "Sleeping platform is too close to floor level; raise platform 30-40cm above entrance well to exploit cold-air drainage."
        )

    if structural_safety_status == "CRITICAL_COLLAPSE_RISK":
        advisories.append(
            f"CRITICAL DANGER: Wall thickness ({request.wall_thickness_cm:.0f}cm) is severely below minimum {shelter.min_roof_thickness_cm}cm. Catastrophic roof collapse danger."
        )
    elif structural_safety_status == "COLLAPSE_WARNING":
        advisories.append(
            f"WARNING: Wall thickness ({request.wall_thickness_cm:.0f}cm) is below recommended {shelter.min_roof_thickness_cm}cm. Shovel more snow onto dome before occupancy."
        )
    elif structural_safety_status == "ASPHYXIATION_HAZARD":
        advisories.append(
            f"LETHAL HAZARD: Ventilation adequacy is only {ventilation_adequacy_percent}%. Punch a 45-degree chimney vent hole immediately with ski pole to prevent carbon dioxide suffocation."
        )
    elif structural_safety_status == "CAUTION":
        advisories.append(
            f"ADVISORY: Ventilation adequacy ({ventilation_adequacy_percent}%) or platform elevation should be improved. Clear frost hoar from chimney vent regularly."
        )
    else:
        advisories.append(
            "Structural dome integrity and chimney airflow adequacy are optimal for sub-zero bivouac survival."
        )

    thermal_advisory = " ".join(advisories)

    return ShelterThermodynamicsResponse(
        shelter_id=shelter.shelter_id,
        shelter_title=shelter.title,
        interior_temp_f=interior_temp_f,
        floor_temp_f=floor_temp_f,
        wall_r_value=wall_r_value,
        cold_trap_differential_f=cold_trap_differential_f,
        ventilation_adequacy_percent=ventilation_adequacy_percent,
        structural_safety_status=structural_safety_status,
        thermal_advisory=thermal_advisory,
    )


def extract_shelter_intent(message: str) -> Optional[ShelterIntent]:
    q = message.lower().strip()

    # Guardrails: exclude unrelated domains
    # 1. Customer support / orders
    if any(
        k in q
        for k in ["refund", "order #", "return label", "order tracking", "promo code", "shipping"]
    ):
        return None

    # 2. Alpine huts (huts.py)
    if any(
        k in q
        for k in [
            "hut reservation",
            "mountain hut",
            "alpine hut",
            "backcountry hut",
            "refugio",
            "book a hut",
            "hut bunk",
            "huts",
        ]
    ):
        if not any(k in q for k in ["snow cave", "quinzhee", "bivouac", "bivy", "snow trench"]):
            return None

    # 3. Primitive bushcraft (bushcraft.py)
    if any(
        k in q
        for k in [
            "friction fire",
            "bow drill",
            "hand drill",
            "bast cordage",
            "bast fiber",
            "stone boiling",
            "birch bark vessel",
            "super shelter",
            "mors kochanski",
            "try stick",
            "primitive fire",
            "scandi grind",
            "ferrocerium",
        ]
    ):
        return None

    # 4. Avalanche safety (safety.py / avalanche.py)
    if any(
        k in q
        for k in [
            "avalanche beacon",
            "avalanche forecast",
            "beacon check",
            "transceiver",
            "pit test",
            "compression test",
            "avalanche danger",
            "avalanche safety",
            "snowpack pit",
        ]
    ):
        return None

    # Keywords triggering wilderness survival shelters & snow bivouacs
    shelter_keywords = [
        "snow cave",
        "quinzhee",
        "quinzee",
        "survival shelter",
        "debris hut",
        "bivouac",
        "bivy",
        "tree well",
        "cold-air well",
        "cold air well",
        "snow trench",
        "snow bivy",
        "shelter building",
        "ventilation chimney",
        "snow saw",
        "thermal gain",
        "avalanche shovel",
        "ventilation hole",
        "snow bivouac",
        "winter shelter",
    ]

    if not any(k in q for k in shelter_keywords):
        return None

    # Identify specific shelter ID
    shelter_id: Optional[str] = None
    if "alpine-snow-cave" in q or "snow cave" in q:
        shelter_id = "alpine-snow-cave-bivouac"
    elif "quinzhee" in q or "quinzee" in q or "snow mound" in q:
        shelter_id = "subarctic-quinzhee-snow-mound"
    elif "snow trench" in q or "trench tarp" in q or "emergency trench" in q:
        shelter_id = "emergency-snow-trench-tarp"
    elif "debris hut" in q or "boreal" in q or "lean-to" in q:
        shelter_id = "boreal-debris-hut-lean-to"
    elif "tree well" in q:
        shelter_id = "tree-well-snow-bivouac"

    # Identify difficulty
    difficulty: Optional[str] = None
    if "beginner" in q or "easy" in q or "novice" in q:
        difficulty = "beginner"
    elif "intermediate" in q or "moderate" in q:
        difficulty = "intermediate"
    elif "advanced" in q or "expert" in q:
        difficulty = "advanced"

    # Identify environment
    environment: Optional[str] = None
    if "alpine" in q or "tundra" in q:
        environment = "alpine"
    elif "subarctic" in q or "taiga" in q:
        environment = "subarctic"
    elif "boreal" in q or "forest" in q:
        environment = "boreal"
    elif "montane" in q:
        environment = "montane"

    # Determine action
    if any(
        k in q
        for k in [
            "calculate",
            "thermodynamic",
            "thermal gain",
            "r-value",
            "temperature",
            "cold-air well",
            "cold trap",
            "chimney ventilation",
        ]
    ):
        action = "calculate_thermodynamics"
    elif any(
        k in q
        for k in ["gear", "equipment", "kit", "checklist", "shovel", "saw", "probe", "candle"]
    ):
        action = "gear_checklist"
    elif shelter_id and any(
        k in q
        for k in [
            "how to build",
            "how do you construct",
            "detail",
            "tell me about",
            "guide",
            "specs",
            "construct",
        ]
    ):
        action = "shelter_detail"
    else:
        action = "shelters_list"

    return ShelterIntent(
        action=action,
        shelter_id=shelter_id,
        difficulty=difficulty,
        environment=environment,
    )


detect_shelter_intent = extract_shelter_intent


def format_shelter_response(intent: ShelterIntent) -> FormattedShelterResponse:
    info: dict[str, Any] = {}
    if intent.action == "calculate_thermodynamics":
        s_id = intent.shelter_id or "alpine-snow-cave-bivouac"
        req = ShelterThermodynamicsRequest(shelter_id=s_id)
        calc = calculate_shelter_thermodynamics(req)
        answer = (
            f"Thermodynamic Analysis for {calc.shelter_title}: "
            f"Interior sleeping shelf temp is {calc.interior_temp_f}°F, sunken floor well is {calc.floor_temp_f}°F "
            f"(+{calc.cold_trap_differential_f}°F cold-trap inversion). Wall insulation R-{calc.wall_r_value:.1f}, "
            f"chimney ventilation adequacy {calc.ventilation_adequacy_percent}%. "
            f"Safety status: {calc.structural_safety_status}. {calc.thermal_advisory}"
        )
        info = {
            "action": "calculate_thermodynamics",
            "shelter_id": calc.shelter_id,
            "thermodynamics": calc.model_dump(),
        }
        return FormattedShelterResponse(answer, {"answer": answer, "shelter_info": info})

    if intent.action == "shelter_detail" and intent.shelter_id:
        shelter = get_survival_shelter_by_id(intent.shelter_id)
        if shelter:
            answer = (
                f"Survival Shelter: {shelter.title} ({shelter.environment}). "
                f"Difficulty: {shelter.difficulty.capitalize()} | Construction: {shelter.construction_hours}h | Capacity: {shelter.capacity_persons}p. "
                f"Min Snow Depth: {shelter.min_snow_depth_m}m | Min Roof: {shelter.min_roof_thickness_cm}cm | Thermal Gain: +{shelter.interior_thermal_gain_f}°F. "
                f"Description: {shelter.description} Highlights: {'; '.join(shelter.highlights)}."
            )
            info = {
                "action": "shelter_detail",
                "shelter_id": shelter.shelter_id,
                "shelter": shelter.model_dump(),
            }
            return FormattedShelterResponse(answer, {"answer": answer, "shelter_info": info})

    if intent.action == "gear_checklist":
        gear = get_shelter_gear()
        items_summary = "; ".join(f"{g.name} ({g.purpose})" for g in gear)
        answer = (
            f"Mandatory Wilderness Survival Shelter & Snow Bivouac Gear: "
            f"All {len(gear)} items are mandatory for safe cold-weather bivouacs. {items_summary}."
        )
        info = {
            "action": "gear_checklist",
            "gear": [g.model_dump() for g in gear],
        }
        return FormattedShelterResponse(answer, {"answer": answer, "shelter_info": info})

    # Default to shelters_list
    shelters = get_survival_shelters(difficulty=intent.difficulty)
    summaries = "; ".join(
        f"{s.title} ({s.difficulty}, {s.construction_hours}h, +{s.interior_thermal_gain_f}°F gain)"
        for s in shelters
    )
    diff_label = f" [{intent.difficulty.capitalize()}]" if intent.difficulty else ""
    answer = (
        f"Contoso Wilderness Survival Shelters & Snow Bivouac Catalog{diff_label}: "
        f"{len(shelters)} shelters available. {summaries}. "
        "Engineered cold-air drainage wells, domed roofs, and angled chimney vents protect against blizzard exposure."
    )
    info = {
        "action": "shelters_list",
        "shelters": [s.model_dump() for s in shelters],
    }
    return FormattedShelterResponse(answer, {"answer": answer, "shelter_info": info})


def build_shelter_prompt(intent: ShelterIntent) -> str:
    if intent.action == "calculate_thermodynamics":
        s_id = intent.shelter_id or "alpine-snow-cave-bivouac"
        req = ShelterThermodynamicsRequest(shelter_id=s_id)
        calc = calculate_shelter_thermodynamics(req)
        return (
            "### Wilderness Shelter Thermodynamics & Cold-Air Trap Analysis\n"
            f"- Shelter: {calc.shelter_title} ({calc.shelter_id})\n"
            f"- Interior Platform Temp: {calc.interior_temp_f}°F\n"
            f"- Sunken Floor Temp: {calc.floor_temp_f}°F\n"
            f"- Cold Trap Inversion Differential: +{calc.cold_trap_differential_f}°F\n"
            f"- Wall Insulation: R-{calc.wall_r_value:.1f}\n"
            f"- Ventilation Adequacy: {calc.ventilation_adequacy_percent}%\n"
            f"- Safety Status: {calc.structural_safety_status}\n"
            f"- Thermal Advisory: {calc.thermal_advisory}\n"
            "Emphasize the critical physics of cold-air settling, maintaining a 45-degree chimney vent hole, and dome smoothing."
        )

    if intent.action == "shelter_detail" and intent.shelter_id:
        shelter = get_survival_shelter_by_id(intent.shelter_id)
        if shelter:
            return (
                f"### Wilderness Survival Shelter Profile: {shelter.title}\n"
                f"- Shelter ID: {shelter.shelter_id}\n"
                f"- Environment: {shelter.environment}\n"
                f"- Difficulty: {shelter.difficulty.upper()}\n"
                f"- Construction Time: {shelter.construction_hours} hours\n"
                f"- Capacity: {shelter.capacity_persons} person(s)\n"
                f"- Min Snowpack Depth: {shelter.min_snow_depth_m} meters\n"
                f"- Min Dome Roof Thickness: {shelter.min_roof_thickness_cm} cm\n"
                f"- Expected Thermal Gain: +{shelter.interior_thermal_gain_f}°F\n"
                f"- Description: {shelter.description}\n"
                f"- Key Highlights: {', '.join(shelter.highlights)}\n"
                "Advise on site selection away from avalanche hazard paths and windward wind scours."
            )

    if intent.action == "gear_checklist":
        gear = get_shelter_gear()
        gear_lines = "\n".join(f"- {g.name} [{g.category.upper()}]: {g.purpose}" for g in gear)
        return (
            "### Mandatory Survival Shelter Gear Compliance Checklist\n"
            f"{gear_lines}\n\n"
            "Emphasize the essential need for an aluminum avalanche shovel, snow bone saw, and angled ventilation cleaner."
        )

    # Default: shelters_list
    shelters = get_survival_shelters(difficulty=intent.difficulty)
    shelter_lines = "\n".join(
        f"- {s.title} ({s.shelter_id}): {s.difficulty} difficulty, {s.construction_hours}h build, +{s.interior_thermal_gain_f}°F thermal gain"
        for s in shelters
    )
    return (
        "### Available Wilderness Survival Shelters & Snow Bivouacs\n"
        f"{shelter_lines}\n\n"
        "Recommend suitable emergency shelters based on current snowpack depth, alpine terrain, and blizzard severity."
    )
