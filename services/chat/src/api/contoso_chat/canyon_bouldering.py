from typing import Any, Optional

from pydantic import BaseModel


class CanyonBoulderingSectorModel(BaseModel):
    sector_id: str
    title: str
    canyon_location: str
    region: str
    max_boulder_height_m: float
    v_grade_range: str
    bouldering_style: str
    landing_hazard: str
    description: str
    highlights: list[str]


class BoulderingRequest(BaseModel):
    sector_id: str = "buttermilks-peabody-highballs"
    fall_height_m: float = 6.5
    climber_weight_kg: float = 72.0
    crash_pads_count: int = 3
    spotters_count: int = 2


class BoulderingResponse(BaseModel):
    sector_id: str
    sector_title: str
    bouldering_style: str
    landing_hazard: str
    impact_energy_joules: int
    pad_coverage_adequacy_percent: int
    fall_hazard_rating: str
    spotting_recommendation: str
    pad_layout_advisory: str


class BoulderingGearModel(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class BoulderingIntent(BaseModel):
    action: str
    sector_id: Optional[str] = None
    bouldering_style: Optional[str] = None


CANTON_BOULDERING_SECTORS: dict[str, CanyonBoulderingSectorModel] = {
    "buttermilks-peabody-highballs": CanyonBoulderingSectorModel(
        sector_id="buttermilks-peabody-highballs",
        title="Buttermilks Peabody Boulders",
        canyon_location="Buttermilk Country, Bishop",
        region="Eastern Sierra, California, USA",
        max_boulder_height_m=16.0,
        v_grade_range="V0 - V16",
        bouldering_style="highball_quartz_monzonite",
        landing_hazard="talus_uneven_groundfall",
        description="World-renowned mega-highballs including Grandpa Peabody and Grandma Peabody with towering quartz monzonite crimps and daunting topouts.",
        highlights=[
            "Grandpa Peabody 15m highballs",
            "Lucid Dreaming (V15)",
            "Mandatory multi-pad highball stacking arrays",
        ],
    ),
    "joes-valley-straight-canyon": CanyonBoulderingSectorModel(
        sector_id="joes-valley-straight-canyon",
        title="Joe's Valley Straight Canyon",
        canyon_location="Straight Canyon, Joe's Valley",
        region="Orangeville, Utah, USA",
        max_boulder_height_m=7.5,
        v_grade_range="V1 - V14",
        bouldering_style="sandstone_roofs_and_pockets",
        landing_hazard="creekbed_boulder_chokes",
        description="Classic sandstone canyon bouldering featuring skin-friendly donut jugs, ferocious compression roofs, and technical heel-hooks along scenic canyon creeks.",
        highlights=[
            "Straight Canyon roadside blocs",
            "Resident Evil (V10) roof",
            "Premier sandstone compression problems",
        ],
    ),
    "red-rock-kraft-boulders": CanyonBoulderingSectorModel(
        sector_id="red-rock-kraft-boulders",
        title="Red Rock Kraft Canyon Boulders",
        canyon_location="Kraft Mountain & Gateway Canyon",
        region="Red Rock Canyon, Nevada, USA",
        max_boulder_height_m=8.0,
        v_grade_range="V0 - V13",
        bouldering_style="sandstone_varnish_edges",
        landing_hazard="sloping_calico_sandstone",
        description="Historic Aztec sandstone blocs boasting rich dark desert varnish, pristine friction slopers, crimpy face cruxes, and sandy landings.",
        highlights=[
            "The Pearl (V5) highball arête",
            "Monkey Bar Boulder",
            "Classic Calico Basin desert varnish",
        ],
    ),
    "rocktown-pigeon-mountain": CanyonBoulderingSectorModel(
        sector_id="rocktown-pigeon-mountain",
        title="Rocktown Pigeon Mountain",
        canyon_location="Pigeon Mountain Wildlife Area",
        region="LaFayette, Georgia, USA",
        max_boulder_height_m=9.0,
        v_grade_range="V1 - V13",
        bouldering_style="sandstone_slopers_and_roofs",
        landing_hazard="scattered_talus_and_chasms",
        description="Sprawling sandstone paradise perched high on Pigeon Mountain featuring bullet sandstone slopers, massive huecos, and labyrinthine boulder corridors.",
        highlights=[
            "The Orb (V8) roof masterpiece",
            "Golden Harvest labyrinth",
            "Deep southern sandstone friction",
        ],
    ),
    "hueco-tanks-north-mountain": CanyonBoulderingSectorModel(
        sector_id="hueco-tanks-north-mountain",
        title="Hueco Tanks North Mountain",
        canyon_location="Hueco Tanks State Historic Site",
        region="El Paso County, Texas, USA",
        max_boulder_height_m=10.0,
        v_grade_range="V2 - V15",
        bouldering_style="syenite_porphyry_roof_tanks",
        landing_hazard="polished_rock_corridors",
        description="The historical birthplace of modern bouldering grades, featuring famous iron-hard syenite porphyry hollows, massive roof caves, and delicate technical topouts.",
        highlights=[
            "Nobody Here Gets Out Alive (V2)",
            "North Mountain self-guided zone",
            "Historic hollow pockets and roofs",
        ],
    ),
}

BOULDERING_GEAR_CHECKLIST: list[BoulderingGearModel] = [
    BoulderingGearModel(
        item_id="highball-triple-layer-crash-pad",
        name="Triple-Density Highball Landing Crash Pad (5-Inch Dual Foam)",
        category="impact_protection",
        mandatory=True,
        purpose="Absorbs high-energy drops from highball boulder problems using bonded closed-cell and open-cell foam layers.",
    ),
    BoulderingGearModel(
        item_id="blubber-hinge-cover-pad",
        name="Seamless Overlap Blubber Pad & Seam Shield",
        category="pad_accessories",
        mandatory=True,
        purpose="Covers dangerous gap seams and folds between adjacent crash pads to prevent severe ankle inversion entrapment.",
    ),
    BoulderingGearModel(
        item_id="slider-sit-start-pad",
        name="Tough Cordura Slider Pad for Sit Starts and Rock Spikes",
        category="pad_accessories",
        mandatory=False,
        purpose="Covers isolated low rock spikes and shields primary pads from sharp terrain or damp ground under sit starts.",
    ),
    BoulderingGearModel(
        item_id="heavy-duty-chalk-bucket-with-brushes",
        name="High-Capacity Bouldering Chalk Bucket with Boar's Hair Brushes",
        category="chalk_and_friction",
        mandatory=True,
        purpose="Ensures dry skin grip and permits cleaning accumulated chalk and trail dust from friction crimps and slopers.",
    ),
    BoulderingGearModel(
        item_id="athletic-bouldering-tape-and-skin-kit",
        name="Rigid Zinc Oxide Climbing Tape & Cuticle Skin Repair Kit",
        category="skin_care_safety",
        mandatory=True,
        purpose="Supports pulley tendons, secures flappers, and preserves epidermis during repetitive abrasive sandstone attempts.",
    ),
    BoulderingGearModel(
        item_id="telescoping-boulder-cleaning-pole",
        name="Telescopic Carbon Fiber Bouldering Brush Pole (Up to 4m)",
        category="route_maintenance",
        mandatory=False,
        purpose="Enables thorough scrubbing of highball topout holds, moss, and sandy lips before committing to crux topouts.",
    ),
]


def get_canyon_bouldering_sectors(
    style: Optional[str] = None,
) -> list[CanyonBoulderingSectorModel]:
    sectors = list(CANTON_BOULDERING_SECTORS.values())
    if not style:
        return sectors
    norm = style.strip().lower().replace("-", "_").replace(" ", "_")
    return [s for s in sectors if s.bouldering_style.lower() == norm]


def get_canyon_bouldering_sector(
    sector_id: str,
) -> Optional[CanyonBoulderingSectorModel]:
    return CANTON_BOULDERING_SECTORS.get(sector_id.strip().lower())


def get_canyon_bouldering_gear_checklist() -> list[BoulderingGearModel]:
    return list(BOULDERING_GEAR_CHECKLIST)


def calculate_bouldering_dynamics(req: BoulderingRequest) -> BoulderingResponse:
    sector = get_canyon_bouldering_sector(req.sector_id)
    if not sector:
        raise ValueError(f"Canyon bouldering sector '{req.sector_id}' not found")

    impact_energy_joules = int(round(req.climber_weight_kg * 9.81 * req.fall_height_m))
    required_pads = 5 if req.fall_height_m > 8.0 else 3
    pad_coverage_adequacy_percent = min(
        100, int(round((req.crash_pads_count / required_pads) * 100.0))
    )

    if req.fall_height_m > 9.0 and req.crash_pads_count < 4:
        fall_hazard_rating = "hazardous_highball_groundfall_risk"
        spotting_recommendation = (
            "CRITICAL HIGHBALL PROTOCOL: Minimum 3-4 attentive spotters required with hands positioned to direct fall trajectory away from rock protrusions onto central landing zone."
        )
        pad_layout_advisory = (
            "MANDATORY MULTI-PAD STACKING: Minimum 4-5 crash pads required. Multi-layer landing zone with overlapping base pads topped with continuous blubber pad to eliminate dangerous hinge seams."
        )
    elif req.fall_height_m > 5.0 and (
        req.crash_pads_count < 2 or req.spotters_count < 1
    ):
        fall_hazard_rating = "caution_multiple_pads_spotter_required"
        spotting_recommendation = (
            "CAUTION: Deploy at least 2 spotters actively shielding climber's head and spine from off-pad ejection or rotational falls."
        )
        pad_layout_advisory = (
            "EXTENDED COVERAGE ADVISORY: Minimum 3 pads required with staggered seams. Level sloped or talus landings with slider pads beneath main crash pads."
        )
    else:
        fall_hazard_rating = "safe_cushioned_drop"
        spotting_recommendation = (
            "Standard active spotting protocol: 1-2 spotters tracking climber center of gravity to ensure upright landing onto crash pads."
        )
        pad_layout_advisory = (
            "OPTIMAL PAD ARRAY: 2-3 overlapping crash pads centered directly below crux sequence, secured with blubber pad across landing zone."
        )

    return BoulderingResponse(
        sector_id=sector.sector_id,
        sector_title=sector.title,
        bouldering_style=sector.bouldering_style,
        landing_hazard=sector.landing_hazard,
        impact_energy_joules=impact_energy_joules,
        pad_coverage_adequacy_percent=pad_coverage_adequacy_percent,
        fall_hazard_rating=fall_hazard_rating,
        spotting_recommendation=spotting_recommendation,
        pad_layout_advisory=pad_layout_advisory,
    )


def detect_canyon_bouldering_intent(query: str) -> Optional[BoulderingIntent]:
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
        "turtle patrol",
        "sea turtle",
        "night via ferrata",
        "via ferrata",
        "big wall",
        "psicobloc",
        "tree climbing",
        "ice climbing",
        "rentals",
        "rental",
    ]
    if any(ex in q for ex in exclusions):
        return None

    cb_keywords = [
        "canyon bouldering",
        "highball bouldering",
        "sandstone boulder",
        "crash pad logistics",
        "bouldering problem",
        "highball crash pad",
        "bouldering landing zone",
        "crashpad array",
        "pebble wrestling",
        "buttermilks bouldering",
        "joe's valley bouldering",
    ]

    has_cb_keyword = any(k in q for k in cb_keywords)

    is_cb_context = (
        (
            "boulder" in q
            or "bouldering" in q
            or "highball" in q
            or "pebble wrestling" in q
            or "buttermilks" in q
            or "peabody" in q
            or "joe's valley" in q
            or "joes valley" in q
            or "straight canyon" in q
            or "kraft boulders" in q
            or "red rock kraft" in q
            or "rocktown" in q
            or "pigeon mountain" in q
            or "hueco tanks" in q
        )
        and (
            "canyon" in q
            or "highball" in q
            or "crash pad" in q
            or "crashpad" in q
            or "pad stacking" in q
            or "landing zone" in q
            or "blubber pad" in q
            or "slider pad" in q
            or "spotter" in q
            or "spotting" in q
            or "impact energy" in q
            or "fall dynamics" in q
            or "sandstone" in q
            or "quartz monzonite" in q
            or "syenite" in q
            or "porphyry" in q
            or "v-grade" in q
            or "v grade" in q
            or "sector" in q
            or "sectors" in q
            or "groundfall" in q
        )
    )

    is_cb_fall_calc = (
        ("kinetic impact" in q or "fall dynamics" in q or "impact energy" in q or "crash pad stacking" in q)
        and ("boulder" in q or "highball" in q or "pebble wrestling" in q or "drop" in q or "pad" in q)
    )

    if not (has_cb_keyword or is_cb_context or is_cb_fall_calc):
        return None

    sector_id = None
    if "buttermilks" in q or "peabody" in q:
        sector_id = "buttermilks-peabody-highballs"
    elif "joe" in q or "straight canyon" in q:
        sector_id = "joes-valley-straight-canyon"
    elif "kraft" in q or "red rock" in q:
        sector_id = "red-rock-kraft-boulders"
    elif "rocktown" in q or "pigeon mountain" in q:
        sector_id = "rocktown-pigeon-mountain"
    elif "hueco" in q:
        sector_id = "hueco-tanks-north-mountain"

    bouldering_style = None
    if "highball_quartz_monzonite" in q or "quartz monzonite" in q or "highball" in q and "monzonite" in q:
        bouldering_style = "highball_quartz_monzonite"
    elif "sandstone_roofs_and_pockets" in q or "sandstone roof" in q or "pockets" in q:
        bouldering_style = "sandstone_roofs_and_pockets"
    elif "sandstone_varnish_edges" in q or "varnish edges" in q or "desert varnish" in q:
        bouldering_style = "sandstone_varnish_edges"
    elif "sandstone_slopers_and_roofs" in q or "sandstone slopers" in q:
        bouldering_style = "sandstone_slopers_and_roofs"
    elif "syenite_porphyry_roof_tanks" in q or "syenite porphyry" in q or "roof tanks" in q:
        bouldering_style = "syenite_porphyry_roof_tanks"

    if any(
        k in q
        for k in [
            "gear",
            "checklist",
            "equipment",
            "blubber",
            "slider pad",
            "chalk bucket",
            "tape",
            "brush pole",
            "cleaning pole",
            "logistics",
        ]
    ):
        action = "gear"
    elif any(
        k in q
        for k in [
            "calculate",
            "impact",
            "dynamics",
            "joules",
            "adequacy",
            "energy",
            "hazard rating",
            "fall height",
            "physics",
        ]
    ):
        action = "calculate"
    elif sector_id and any(
        k in q
        for k in [
            "detail",
            "details",
            "about",
            "tell me about",
            "highlights",
            "hazard",
            "description",
            "height",
            "grade",
            "landing hazard",
        ]
    ):
        action = "sector_detail"
    elif any(
        k in q
        for k in [
            "sectors",
            "catalog",
            "options",
            "list",
            "styles",
            "areas",
        ]
    ) or " all " in f" {q} ":
        action = "sectors_list"
    elif sector_id:
        action = "sector_detail"
    else:
        action = "sectors_list"

    return BoulderingIntent(
        action=action,
        sector_id=sector_id,
        bouldering_style=bouldering_style,
    )


class FormattedBoulderingResponse(str):
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


def format_canyon_bouldering_response(
    data_or_intent: Any,
    query: str = "",
) -> FormattedBoulderingResponse:
    if isinstance(data_or_intent, dict):
        answer = data_or_intent.get("answer", "Wilderness canyon bouldering response")
        return FormattedBoulderingResponse(answer, data_or_intent)

    intent: BoulderingIntent
    if isinstance(data_or_intent, BoulderingIntent):
        intent = data_or_intent
    else:
        detected = detect_canyon_bouldering_intent(str(data_or_intent))
        intent = detected or BoulderingIntent(action="sectors_list")

    if intent.action in ("calculate", "calculate_dynamics"):
        target_sector_id = intent.sector_id or "buttermilks-peabody-highballs"
        calc_req = BoulderingRequest(sector_id=target_sector_id)
        calc_res = calculate_bouldering_dynamics(calc_req)
        answer = (
            f"Wilderness Canyon Bouldering Dynamics for {calc_res.sector_title} ({calc_res.bouldering_style}): "
            f"Fall hazard rating: {calc_res.fall_hazard_rating.upper()}. "
            f"Impact energy: {calc_res.impact_energy_joules} Joules. "
            f"Pad coverage adequacy: {calc_res.pad_coverage_adequacy_percent}%. "
            f"Landing hazard: {calc_res.landing_hazard}. "
            f"Spotting recommendation: {calc_res.spotting_recommendation} "
            f"Pad layout advisory: {calc_res.pad_layout_advisory}"
        )
        calc_info: dict[str, Any] = {
            "canyon_bouldering_info": {
                "action": "calculate",
                "sector_id": calc_res.sector_id,
                "calculation": calc_res.model_dump(),
                "impact_energy_joules": calc_res.impact_energy_joules,
                "pad_coverage_adequacy_percent": calc_res.pad_coverage_adequacy_percent,
                "fall_hazard_rating": calc_res.fall_hazard_rating,
                "spotting_recommendation": calc_res.spotting_recommendation,
                "pad_layout_advisory": calc_res.pad_layout_advisory,
            },
            "answer": answer,
        }
        return FormattedBoulderingResponse(answer, calc_info)

    if intent.action in ("gear", "gear_checklist"):
        checklist = get_canyon_bouldering_gear_checklist()
        items_str = "; ".join(f"{g.name} ({g.purpose})" for g in checklist[:3])
        answer = (
            f"Mandatory Wilderness Canyon Bouldering Gear Checklist ({len(checklist)} items): "
            f"{items_str}; plus {', '.join(g.name for g in checklist[3:])}. "
            "Highball triple-density crash pads, seam-shield blubber pads, and chalk buckets are essential."
        )
        gear_info: dict[str, Any] = {
            "canyon_bouldering_info": {
                "action": "gear",
                "gear": [g.model_dump() for g in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedBoulderingResponse(answer, gear_info)

    if intent.action in ("sector_detail", "detail") and intent.sector_id:
        sector = get_canyon_bouldering_sector(intent.sector_id)
        if sector:
            highlights_str = "; ".join(sector.highlights)
            answer = (
                f"Wilderness Canyon Bouldering Sector: {sector.title} ({sector.canyon_location}, {sector.region}). "
                f"Style: {sector.bouldering_style.replace('_', ' ').title()} | V-Grade: {sector.v_grade_range} | "
                f"Max Boulder Height: {sector.max_boulder_height_m}m | Landing Hazard: {sector.landing_hazard}. "
                f"{sector.description} Highlights: {highlights_str}."
            )
            detail_info: dict[str, Any] = {
                "canyon_bouldering_info": {
                    "action": "sector_detail",
                    "sector_id": sector.sector_id,
                    "sector": sector.model_dump(),
                },
                "answer": answer,
            }
            return FormattedBoulderingResponse(answer, detail_info)

    sectors = get_canyon_bouldering_sectors(style=intent.bouldering_style)
    sectors_summary = "; ".join(
        f"{s.title} ({s.bouldering_style}, {s.v_grade_range}, max {s.max_boulder_height_m}m)"
        for s in sectors
    )
    answer = (
        f"Contoso Wilderness Canyon Bouldering & Highball Sandstone Catalog ({len(sectors)} sectors): "
        f"{sectors_summary}. Ask about crash pad stacking logistics, fall kinetic impact calculations, "
        f"or mandatory bouldering gear."
    )
    list_info: dict[str, Any] = {
        "canyon_bouldering_info": {
            "action": "sectors_list",
            "bouldering_style": intent.bouldering_style,
            "sectors": [s.model_dump() for s in sectors],
        },
        "answer": answer,
    }
    return FormattedBoulderingResponse(answer, list_info)


def build_canyon_bouldering_prompt(
    intent: Optional[BoulderingIntent] = None,
) -> str:
    lines = [
        "Wilderness Canyon Bouldering & Highball Sandstone Crash Pad Logistics Guidance:",
        "- Highball Fall Dynamics: Groundfall risks scale exponentially above 5 meters. Kinetic impact energy (E = m * g * h) demands layered crash pad matrices and multi-spotter coordination.",
        "- Crash Pad Stacking Logistics: Primary 5-inch dual-density crash pads must form a leveled foundation over talus and roots. Continuous blubber pads must overlap hinge seams to prevent ankle traps.",
        "- Spotter Allocation & Landing Zone Management: Spotters do not catch falling climbers; they guide hips, protect the cervical spine/head, and redirect falls away from protruding hazards onto the pad array.",
        "- Mandatory 6-Item Bouldering Kit: Triple-Density Highball Landing Crash Pad, Seamless Blubber Pad, Slider Sit-Start Pad, Chalk Bucket with Boar's Hair Brushes, Rigid Zinc Oxide Tape/Skin Kit, Telescopic Cleaning Brush Pole.",
    ]
    if intent and intent.sector_id:
        s = get_canyon_bouldering_sector(intent.sector_id)
        if s:
            lines.append(
                f"- Selected Sector: {s.title} ({s.canyon_location}, {s.region})\n"
                f"  Max Height: {s.max_boulder_height_m}m | Grades: {s.v_grade_range} | Style: {s.bouldering_style}\n"
                f"  Landing Hazard: {s.landing_hazard}\n"
                f"  Description: {s.description}\n"
                f"  Highlights: {'; '.join(s.highlights)}"
            )
    return "\n".join(lines)


def canyon_bouldering_tool(
    request: Optional[BoulderingRequest] = None,
    action: Optional[str] = None,
    sector_id: Optional[str] = None,
    bouldering_style: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    if action == "calculate" or request is not None:
        calc_req = request or BoulderingRequest(
            sector_id=sector_id or "buttermilks-peabody-highballs"
        )
        res = calculate_bouldering_dynamics(calc_req)
        formatted = format_canyon_bouldering_response(
            BoulderingIntent(action="calculate", sector_id=res.sector_id)
        )
        return dict(formatted._data)

    intent = BoulderingIntent(
        action=action or "sectors_list",
        sector_id=sector_id,
        bouldering_style=bouldering_style,
    )
    formatted = format_canyon_bouldering_response(intent)
    return dict(formatted._data)
