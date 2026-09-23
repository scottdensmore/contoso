import re
from typing import Any, Optional

from pydantic import BaseModel


class AnimalTrackProfileModel(BaseModel):
    species_id: str
    common_name: str
    scientific_name: str
    family: str
    track_length_inches: float
    track_width_inches: float
    claw_marks_visible: bool
    toe_count: int
    typical_stride_inches: float
    typical_gait: str
    habitat: str
    description: str
    identifying_signs: list[str]


class TrackAgingCalculationRequest(BaseModel):
    species_id: str = "gray-wolf-pack"
    substrate: str = "compacted_mud"
    sun_wind_exposure: str = "sheltered_dense_canopy"
    track_wall_sharpness: str = "razor_crisp_undisturbed"
    measured_stride_inches: float = 28.0
    dewclaw_present: bool = False


class TrackAgingCalculationResponse(BaseModel):
    species_id: str
    species_name: str
    family: str
    gait_classification: str
    estimated_speed_mph: float
    estimated_age_hours: str
    freshness_rating: str
    predator_alert: str
    substrate_preservation_rating: str
    tracker_advisory: str


class TrackingGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class WildernessTrackingIntent(BaseModel):
    action: str  # "species_list", "species_detail", "calculate_track_aging", "gear_checklist"
    species_id: Optional[str] = None
    family: Optional[str] = None


class FormattedWildernessTrackingResponse(str):
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


DEFAULT_ANIMAL_TRACKS: dict[str, AnimalTrackProfileModel] = {
    "gray-wolf-pack": AnimalTrackProfileModel(
        species_id="gray-wolf-pack",
        common_name="Northwestern Gray Wolf",
        scientific_name="Canis lupus",
        family="canid",
        track_length_inches=4.5,
        track_width_inches=4.0,
        claw_marks_visible=True,
        toe_count=4,
        typical_stride_inches=28.0,
        typical_gait="Direct Register Trot",
        habitat="Boreal Forests & Mountain Valleys",
        description="Large oval symmetrical tracks with prominent claws, tight front-pad chevron, and single-file direct-register pacing.",
        identifying_signs=[
            "Parallel pack scent posts",
            "Urine scratch territorial marks",
            "Cracked ungulate femur bones at kill sites",
        ],
    ),
    "mountain-lion-cougar": AnimalTrackProfileModel(
        species_id="mountain-lion-cougar",
        common_name="North American Cougar",
        scientific_name="Puma concolor",
        family="felid",
        track_length_inches=3.8,
        track_width_inches=4.2,
        claw_marks_visible=False,
        toe_count=4,
        typical_stride_inches=16.0,
        typical_gait="Stalking Walk",
        habitat="Rocky Canyons & Conifer Slopes",
        description="Asymmetrical teardrop toes with leading toe, absence of claw punctures, and M-shaped triple-lobed heel pad.",
        identifying_signs=[
            "Leaf and needle scraped territorial mounds",
            "Ungulate kills cached under brush",
            "Horizontal claw scratches on low trunks",
        ],
    ),
    "grizzly-brown-bear": AnimalTrackProfileModel(
        species_id="grizzly-brown-bear",
        common_name="Interior Grizzly Bear",
        scientific_name="Ursus arctos horribilis",
        family="ursid",
        track_length_inches=11.0,
        track_width_inches=7.0,
        claw_marks_visible=True,
        toe_count=5,
        typical_stride_inches=40.0,
        typical_gait="Overstep Shuffling Walk",
        habitat="Subalpine Meadows & Riparian Corridors",
        description="Massive plantigrade foot impressions with straight-line toe alignment and long claw marks 2-3 inches ahead of pads.",
        identifying_signs=[
            "Bite and claw tree markings 7-9 feet high",
            "Extensively excavated marmot burrows",
            "High-volume berry or fish scat",
        ],
    ),
    "rocky-mountain-elk": AnimalTrackProfileModel(
        species_id="rocky-mountain-elk",
        common_name="Rocky Mountain Elk",
        scientific_name="Cervus canadensis",
        family="ungulate",
        track_length_inches=4.5,
        track_width_inches=3.5,
        claw_marks_visible=False,
        toe_count=2,
        typical_stride_inches=30.0,
        typical_gait="Diagonal Walk",
        habitat="Montane Forests & Alpine Parks",
        description="Rounded heart-shaped cloven hoof prints with blunt tips; dewclaws appear in soft mud and deep snow.",
        identifying_signs=[
            "Velvet rub bark striations on saplings",
            "Wallow depressions in muddy creek bends",
            "Cylindrical pellet clusters",
        ],
    ),
    "north-american-moose": AnimalTrackProfileModel(
        species_id="north-american-moose",
        common_name="Western Shiras Moose",
        scientific_name="Alces alces shirasi",
        family="ungulate",
        track_length_inches=5.5,
        track_width_inches=4.5,
        claw_marks_visible=False,
        toe_count=2,
        typical_stride_inches=48.0,
        typical_gait="High-Stepping Paced Walk",
        habitat="Riparian Willow Basins & Marshlands",
        description="Pointed teardrop cloven hooves that splay dramatically in marshy mud; heavy stride with distinct dewclaw pits.",
        identifying_signs=[
            "Willow and aspen browse lines at 6-8 feet",
            "Massive fibrous dung piles",
            "Wide snow trench bedding hollows",
        ],
    ),
}

DEFAULT_TRACKING_GEAR: list[TrackingGearRequirement] = [
    TrackingGearRequirement(
        item_id="calibrated-tracking-stick",
        name="60-Inch Graduated Tracker's Measuring Stick with Sliding O-Rings",
        category="measurement",
        mandatory=True,
        purpose="Measures precise heel-to-toe stride, straddle width, and pitch angles using movable rubber rings.",
    ),
    TrackingGearRequirement(
        item_id="high-intensity-raking-light",
        name="500-Lumen High-CRI LED Flashlight for Low-Angle Shadow Cast",
        category="optics",
        mandatory=True,
        purpose="Cast ultra-low angle light across tracks to reveal subtle micro-ridges, wall collapse, and compression crests.",
    ),
    TrackingGearRequirement(
        item_id="compact-8x42-binoculars",
        name="Roof Prism 8x42 Waterproof ED Binoculars for Long-Distance Observation",
        category="observation",
        mandatory=True,
        purpose="Scans ahead for apex predators, verifying animal movement from safe distances without disturbing spoor.",
    ),
    TrackingGearRequirement(
        item_id="quick-hardening-dental-stone",
        name="Pre-Measured High-Strength Dental Stone Plaster & Casting Frame",
        category="documentation",
        mandatory=True,
        purpose="Produces ultra-high detail negative casts of fragile footprint walls with zero thermal contraction.",
    ),
    TrackingGearRequirement(
        item_id="weatherproof-field-journal",
        name="All-Weather Grid Rite-in-the-Rain Notebook with Animal Sign Reference",
        category="recording",
        mandatory=True,
        purpose="Records substrate conditions, stride metrics, environmental timestamps, and animal gait diagrams in precipitation.",
    ),
    TrackingGearRequirement(
        item_id="inertial-holstered-bear-spray",
        name="EPA-Certified 10.2oz 2.0% Major Capsaicinoid Bear Deterrent Spray with Holster",
        category="safety",
        mandatory=True,
        purpose="Immediate non-lethal defense against predatory close encounters during ground track investigations.",
    ),
]


def get_animal_tracks(family: Optional[str] = None) -> list[AnimalTrackProfileModel]:
    tracks = list(DEFAULT_ANIMAL_TRACKS.values())
    if family:
        clean_family = family.strip().lower()
        tracks = [t for t in tracks if t.family.lower() == clean_family]
    return tracks


def get_animal_track_by_id(species_id: str) -> Optional[AnimalTrackProfileModel]:
    return DEFAULT_ANIMAL_TRACKS.get(species_id.strip().lower())


def get_tracking_gear() -> list[TrackingGearRequirement]:
    return list(DEFAULT_TRACKING_GEAR)


def calculate_track_aging(
    request: TrackAgingCalculationRequest,
) -> TrackAgingCalculationResponse:
    species = get_animal_track_by_id(request.species_id)
    if not species:
        raise ValueError(f"Wildlife species '{request.species_id}' not found")

    # 1. Stride ratio, gait classification, and speed calculation
    stride_ratio = max(
        0.2, request.measured_stride_inches / max(1.0, species.typical_stride_inches)
    )

    if stride_ratio < 0.8:
        gait_classification = "Stalking / Slow Walk"
    elif stride_ratio <= 1.2:
        gait_classification = species.typical_gait
    elif stride_ratio <= 1.6:
        gait_classification = "Trotting / Accelerated Lope"
    else:
        gait_classification = "Full Gallop / High-Speed Bound"

    # Base walking speeds by family (mph)
    base_family_speeds = {
        "canid": 4.5,
        "felid": 3.2,
        "ursid": 3.5,
        "ungulate": 3.8,
    }
    base_speed = base_family_speeds.get(species.family.lower(), 3.5)
    estimated_speed_mph = round(base_speed * (stride_ratio**1.15), 1)

    # 2. Substrate preservation rating
    substrate_lower = request.substrate.lower()
    if "mud" in substrate_lower or "silt" in substrate_lower:
        substrate_preservation_rating = "Optimal - High Fidelity Wall Definition"
    elif "sand" in substrate_lower:
        substrate_preservation_rating = "Moderate - Prone to Wind Sloughing"
    elif "powder" in substrate_lower:
        substrate_preservation_rating = "Low - Rapid Melting and Sublimation"
    elif "snow" in substrate_lower:
        substrate_preservation_rating = "Moderate - Preserves Outline but Brittle Crests"
    elif "gravel" in substrate_lower or "scree" in substrate_lower:
        substrate_preservation_rating = "Poor - Fragmented Impression"
    else:
        substrate_preservation_rating = "Moderate - Variable Cohesion"

    # 3. Track wall degradation aging estimation & freshness rating
    sharpness = request.track_wall_sharpness.lower()
    exposure = request.sun_wind_exposure.lower()

    if "razor_crisp" in sharpness or "undisturbed" in sharpness:
        freshness_rating = "fresh_under_2_hours"
        estimated_age_hours = "< 2 hours (Fresh Spoor)"
    elif "rounded_edges" in sharpness or "minor_crumbles" in sharpness:
        if "ridge" in exposure or "wind" in exposure or "sun" in exposure:
            freshness_rating = "recent_2_to_6_hours"
            estimated_age_hours = "2 - 6 hours"
        else:
            freshness_rating = "recent_2_to_12_hours"
            estimated_age_hours = "2 - 12 hours"
    elif "eroded" in sharpness or "debris" in sharpness:
        freshness_rating = "aged_12_to_48_hours"
        estimated_age_hours = "12 - 48 hours"
    else:
        freshness_rating = "degraded_over_48_hours"
        estimated_age_hours = "> 48 hours (Degraded Spoor)"

    # 4. Predator encounter alert levels
    is_predator = species.family.lower() in ("canid", "felid", "ursid")
    if is_predator:
        if freshness_rating == "fresh_under_2_hours":
            predator_alert = "heightened_predator_alert"
        elif "recent" in freshness_rating:
            predator_alert = "caution_monitoring"
        else:
            predator_alert = "normal_wilderness_protocol"
    else:
        # Ungulates (elk, moose)
        if (
            freshness_rating == "fresh_under_2_hours"
            and species.species_id == "north-american-moose"
        ):
            predator_alert = "caution_monitoring"
        else:
            predator_alert = "normal_wilderness_protocol"

    # 5. Tracker advisory
    advisories = []
    if predator_alert == "heightened_predator_alert":
        advisories.append(
            f"CRITICAL PREDATOR ALERT: Razor-sharp {species.common_name} spoor aged at {estimated_age_hours}. "
            f"The animal was traveling at {estimated_speed_mph} mph in a {gait_classification} gait. "
            f"Immediate apex predator proximity danger! Unholster certified bear spray, scan 360-degree surroundings with 8x42 binoculars, "
            f"keep group bunched tightly, do not run or crouch, and avoid following downwind spoor into dense cover."
        )
    elif predator_alert == "caution_monitoring":
        advisories.append(
            f"CAUTION: Recent {species.common_name} sign ({estimated_age_hours}) moving at {estimated_speed_mph} mph ({gait_classification}). "
            f"Maintain heightened wilderness vigilance, secure food attractants, and keep bear spray readily accessible on your hip."
        )
    else:
        advisories.append(
            f"Standard wilderness observation: {species.common_name} tracks aged at {estimated_age_hours} in {request.substrate}. "
            f"Spoor wall degradation shows significant weathering; animal has vacated the immediate corridor. Continue monitoring ambient sign."
        )

    if request.dewclaw_present:
        advisories.append(
            "Distinct dewclaw impressions register behind main pads/hooves, indicating heavy downward compression, soft substrate displacement, or rapid high-impact gait."
        )

    tracker_advisory = " ".join(advisories)

    return TrackAgingCalculationResponse(
        species_id=species.species_id,
        species_name=species.common_name,
        family=species.family,
        gait_classification=gait_classification,
        estimated_speed_mph=estimated_speed_mph,
        estimated_age_hours=estimated_age_hours,
        freshness_rating=freshness_rating,
        predator_alert=predator_alert,
        substrate_preservation_rating=substrate_preservation_rating,
        tracker_advisory=tracker_advisory,
    )


def detect_wilderness_tracking_intent(query: str) -> Optional[WildernessTrackingIntent]:
    q = query.lower()

    # Disambiguation guard 1: Order / carrier / package tracking lookup
    order_words = [
        "order #",
        "order number",
        "my order",
        "package tracking",
        "track package",
        "track my package",
        "track my shipment",
        "shipment status",
        "fedex",
        "ups",
        "usps",
        "delivery status",
        "tracking info for order",
    ]
    if any(ow in q for ow in order_words):
        return None

    # Disambiguation guard 2: Hunting regulations / licensing
    hunting_words = [
        "hunting license",
        "hunting season regulations",
        "hunting regulations",
        "deer tag",
        "elk tag",
        "bag limit",
        "hunting tag",
    ]
    if any(hw in q for hw in hunting_words):
        return None

    # Disambiguation guard 3: General bear attacks / food storage without tracking keywords
    tracking_keywords = [
        "track",
        "tracks",
        "tracking",
        "spoor",
        "print",
        "prints",
        "footprint",
        "hoof",
        "hooves",
        "gait",
        "stride",
        "straddle",
        "wall degradation",
        "aging",
        "sign reading",
        "animal sign",
        "dental stone",
        "casting",
        "rub",
        "rubs",
        "browse",
        "claw marks",
        "scat",
        "measuring stick",
        "raking light",
    ]
    has_tracking_context = any(tk in q for tk in tracking_keywords)

    bear_general_words = [
        "bear attack",
        "bear attacks",
        "bear canister",
        "bear bag",
        "hang food",
        "store food from bears",
    ]
    if any(bg in q for bg in bear_general_words) and not has_tracking_context:
        return None

    if not has_tracking_context and not any(
        sp in q
        for sp in [
            "wolf pack",
            "gray wolf",
            "cougar",
            "mountain lion",
            "grizzly bear",
            "brown bear",
            "rocky mountain elk",
            "shiras moose",
            "ungulate",
            "canid",
            "felid",
            "ursid",
        ]
    ):
        return None

    # Intent 1: Gear checklist
    gear_phrases = [
        "gear checklist",
        "tracking gear",
        "tracking kit",
        "tracking stick",
        "dental stone",
        "raking light",
        "equipment for tracking",
        "kit checklist",
    ]
    if any(gp in q for gp in gear_phrases) and (
        "gear" in q or "kit" in q or "plaster" in q or "stick" in q or "spray" in q
    ):
        return WildernessTrackingIntent(action="gear_checklist")

    # Intent 2: Calculation (aging / gait / speed / degradation)
    calc_phrases = [
        "calculate",
        "calculation",
        "estimate track age",
        "wall degradation",
        "aging estimation",
        "gait speed",
        "stride measurement",
        "freshness rating",
        "speed calculation",
    ]
    if any(cp in q for cp in calc_phrases):
        # Detect species if mentioned
        detected_species: Optional[str] = None
        if "wolf" in q:
            detected_species = "gray-wolf-pack"
        elif "cougar" in q or "mountain lion" in q:
            detected_species = "mountain-lion-cougar"
        elif "grizzly" in q or "brown bear" in q or "bear" in q:
            detected_species = "grizzly-brown-bear"
        elif "elk" in q:
            detected_species = "rocky-mountain-elk"
        elif "moose" in q:
            detected_species = "north-american-moose"

        return WildernessTrackingIntent(
            action="calculate_track_aging",
            species_id=detected_species or "gray-wolf-pack",
        )

    # Intent 3: Species detail
    species_mappings = [
        ("gray-wolf-pack", ["wolf", "wolves", "canis lupus"]),
        ("mountain-lion-cougar", ["cougar", "mountain lion", "puma", "puma concolor"]),
        ("grizzly-brown-bear", ["grizzly", "brown bear", "ursus arctos"]),
        ("rocky-mountain-elk", ["elk", "cervus canadensis"]),
        ("north-american-moose", ["moose", "alces alces"]),
    ]
    for sp_id, syns in species_mappings:
        if any(re.search(rf"\b{re.escape(syn)}\b", q) for syn in syns):
            return WildernessTrackingIntent(
                action="species_detail",
                species_id=sp_id,
            )

    # Intent 4: Species list (with optional family filter)
    family_match = None
    if "canid" in q or "dog" in q:
        family_match = "canid"
    elif "felid" in q or "cat" in q:
        family_match = "felid"
    elif "ursid" in q or "bear" in q:
        family_match = "ursid"
    elif "ungulate" in q or "hoof" in q or "cloven" in q:
        family_match = "ungulate"

    list_triggers = [
        "list",
        "species",
        "catalog",
        "animals",
        "what animals",
        "identify",
        "identify animal tracks",
        "tracking",
        "wildlife",
        "track",
        "tracks",
        "prints",
        "spoor",
    ]
    if family_match or any(lt in q for lt in list_triggers):
        return WildernessTrackingIntent(
            action="species_list",
            family=family_match,
        )

    return None


def build_wilderness_tracking_prompt(intent: Optional[WildernessTrackingIntent] = None) -> str:
    species_list = list(DEFAULT_ANIMAL_TRACKS.values())
    gear_list = DEFAULT_TRACKING_GEAR

    lines = [
        "Wilderness Tracking & Animal Sign Reading Grounding Knowledge:",
        "Available Wildlife Species Profiles:",
    ]
    for sp in species_list:
        lines.append(
            f"- {sp.common_name} ({sp.scientific_name}, Family: {sp.family}): "
            f'Track {sp.track_length_inches}"L x {sp.track_width_inches}"W, {sp.toe_count} toes, '
            f"Claws: {'Visible' if sp.claw_marks_visible else 'Retracted/Absent'}, "
            f'Typical Stride: {sp.typical_stride_inches}" ({sp.typical_gait}). '
            f"Key signs: {', '.join(sp.identifying_signs)}."
        )

    lines.append("\nMandatory Tracker Safety Kit Checklist:")
    for g in gear_list:
        lines.append(f"- [{g.item_id}] {g.name} ({g.category}): {g.purpose}")

    lines.append(
        "\nTracking Rules & Protocols:"
        "\n1. Substrate wall crispness reflects track freshness (<2 hours: razor-crisp micro-ridges; 2-12 hours: rounding crests; 12-48 hours: eroded/debris-filled; >48 hours: degraded)."
        "\n2. Apex predator tracks (wolves, cougars, grizzlies) under 2 hours trigger heightened predator encounter alert."
        "\n3. In heightened predator encounters, unholster bear spray immediately, bunch group, do not run or crouch, and use 8x42 binoculars to scan terrain before proceeding."
    )

    return "\n".join(lines)


def format_wilderness_tracking_response(
    intent: WildernessTrackingIntent,
    query: str,
) -> FormattedWildernessTrackingResponse:
    data: dict[str, Any]
    if intent.action == "species_list":
        species = get_animal_tracks(family=intent.family)
        header = f"Found {len(species)} wildlife species profiles"
        if intent.family:
            header += f" in the {intent.family} family"
        header += ":\n"

        items = []
        for s in species:
            items.append(
                f"- **{s.common_name}** (*{s.scientific_name}* - {s.family.capitalize()}): "
                f'Track size: {s.track_length_inches}" x {s.track_width_inches}", {s.toe_count} toes, '
                f'typical stride: {s.typical_stride_inches}" ({s.typical_gait}). {s.description}'
            )
        answer = header + "\n".join(items)
        data = {
            "action": "species_list",
            "family": intent.family,
            "species": [s.model_dump() for s in species],
        }
        return FormattedWildernessTrackingResponse(
            answer, {"tracking_info": data, "answer": answer}
        )

    elif intent.action == "species_detail":
        species_obj = get_animal_track_by_id(intent.species_id or "gray-wolf-pack")
        if not species_obj:
            species_obj = DEFAULT_ANIMAL_TRACKS["gray-wolf-pack"]

        answer = (
            f"### {species_obj.common_name} (*{species_obj.scientific_name}*)\n"
            f"**Family:** {species_obj.family.capitalize()} | **Habitat:** {species_obj.habitat}\n"
            f'**Track Dimensions:** {species_obj.track_length_inches}" Long x {species_obj.track_width_inches}" Wide | '
            f"**Toes:** {species_obj.toe_count} ({'Claws Visible' if species_obj.claw_marks_visible else 'No Claws Visible'})\n"
            f'**Typical Stride & Gait:** {species_obj.typical_stride_inches}" ({species_obj.typical_gait})\n\n'
            f"**Description:** {species_obj.description}\n\n"
            f"**Identifying Signs & Spoor:**\n"
            + "\n".join(f"- {sign}" for sign in species_obj.identifying_signs)
        )
        data = {
            "action": "species_detail",
            "species_id": species_obj.species_id,
            "species": species_obj.model_dump(),
        }
        return FormattedWildernessTrackingResponse(
            answer, {"tracking_info": data, "answer": answer}
        )

    elif intent.action == "calculate_track_aging":
        sp_id = intent.species_id or "gray-wolf-pack"
        # Determine defaults based on query
        req = TrackAgingCalculationRequest(species_id=sp_id)
        if "weathered" in query.lower() or "eroded" in query.lower() or "old" in query.lower():
            req.track_wall_sharpness = "eroded_walls_debris_filled"
            req.sun_wind_exposure = "open_wind_scoured_ridge"
        elif "rounded" in query.lower() or "minor crumble" in query.lower():
            req.track_wall_sharpness = "rounded_edges_minor_crumbles"

        calc = calculate_track_aging(req)
        answer = (
            f"### Track Aging & Spoor Degradation Analysis: {calc.species_name}\n"
            f"- **Estimated Spoor Age:** {calc.estimated_age_hours} ({calc.freshness_rating})\n"
            f"- **Gait Classification:** {calc.gait_classification} (~{calc.estimated_speed_mph} mph)\n"
            f"- **Predator Encounter Alert:** {calc.predator_alert.upper()}\n"
            f"- **Substrate Preservation:** {calc.substrate_preservation_rating}\n\n"
            f"**Tracker Field Advisory:** {calc.tracker_advisory}"
        )
        data = {
            "action": "calculate_track_aging",
            "calculation": calc.model_dump(),
        }
        return FormattedWildernessTrackingResponse(
            answer, {"tracking_info": data, "answer": answer}
        )

    elif intent.action == "gear_checklist":
        gear = get_tracking_gear()
        answer = (
            f"### Mandatory Wilderness Tracking & Spoor Safety Kit ({len(gear)} Items):\n\n"
            + "\n".join(
                f"- **{g.name}** [{g.category} - {'MANDATORY' if g.mandatory else 'Optional'}]: {g.purpose}"
                for g in gear
            )
        )
        data = {
            "action": "gear_checklist",
            "gear": [g.model_dump() for g in gear],
        }
        return FormattedWildernessTrackingResponse(
            answer, {"tracking_info": data, "answer": answer}
        )

    # Default fallback
    species_all = get_animal_tracks()
    answer = f"Contoso Wilderness Tracking Tooling: {len(species_all)} species profiles available."
    data = {"action": "species_list", "species": [s.model_dump() for s in species_all]}
    return FormattedWildernessTrackingResponse(answer, {"tracking_info": data, "answer": answer})
