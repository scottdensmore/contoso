from typing import Any, Optional

from pydantic import BaseModel


class CavingRouteModel(BaseModel):
    cave_id: str
    title: str
    region: str
    depth_m: int
    total_length_m: int
    cave_grade: str
    deepest_pitch_m: int
    environmental_type: str
    typical_duration_hours: float
    rebelays_required: int
    waterproof_oversuit_required: bool
    description: str
    highlights: list[str]


class SrtRiggingRequest(BaseModel):
    cave_id: str
    pitch_depth_m: float = 50.0
    caver_weight_kg: float = 75.0
    caver_pack_weight_kg: float = 10.0
    rope_diameter_mm: float = 10.0
    rope_abrasion_risk: str = "none_clean_drop"
    rebelay_configured: bool = True


class SrtRiggingResponse(BaseModel):
    cave_id: str
    cave_title: str
    cave_grade: str
    total_suspended_weight_kg: float
    estimated_rope_stretch_m: float
    safety_status: str
    descender_recommendation: str
    rebelay_advisory: str
    biosecurity_notice: str


class CavingGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class CavingIntent(BaseModel):
    action: str
    cave_id: Optional[str] = None
    grade: Optional[str] = None
    region: Optional[str] = None


DEFAULT_CAVING_ROUTES: dict[str, CavingRouteModel] = {
    "fantastic-pit-ellisons-cave": CavingRouteModel(
        cave_id="fantastic-pit-ellisons-cave",
        title="Fantastic Pit & Ellison's Cave System",
        region="Walker County, GA",
        depth_m=325,
        total_length_m=19500,
        cave_grade="class_4_vertical_srt",
        deepest_pitch_m=179,
        environmental_type="deep_vertical_pit",
        typical_duration_hours=10.0,
        rebelays_required=2,
        waterproof_oversuit_required=True,
        description="Legendary TAG (Tennessee-Alabama-Georgia) pit cave featuring Fantastic Pit, the deepest unbroken vertical drop in the contiguous United States (586 ft / 179 m).",
        highlights=[
            "Fantastic Pit 586ft unbroken freefall vertical shaft",
            "Incredible Pit 440ft second vertical drop",
            "Complex multi-drop TAG limestone labyrinth",
        ],
    ),
    "mammoth-cave-historic-dallons": CavingRouteModel(
        cave_id="mammoth-cave-historic-dallons",
        title="Mammoth Cave Historic Cleaveland Avenue Route",
        region="Edmonson County, KY",
        depth_m=115,
        total_length_m=680000,
        cave_grade="class_1_horizontal_walk",
        deepest_pitch_m=0,
        environmental_type="dry_limestone_trunk_passage",
        typical_duration_hours=4.5,
        rebelays_required=0,
        waterproof_oversuit_required=False,
        description="World's longest known cave system spanning over 420 miles of mapped limestone passageways, featuring historic gypsum crusting and grand walking trunks.",
        highlights=[
            "Snowball Dining Room gypsum crusting",
            "Grand walking passage canyon avenues",
            "Historic saltpeter mining artifacts and petroglyphs",
        ],
    ),
    "leprechaun-cave-bighorns": CavingRouteModel(
        cave_id="leprechaun-cave-bighorns",
        title="Great X Pit & Columbine Crevasse",
        region="Bighorn Mtns, WY",
        depth_m=410,
        total_length_m=12400,
        cave_grade="class_5_complex_alpine",
        deepest_pitch_m=95,
        environmental_type="freezing_alpine_karst",
        typical_duration_hours=14.0,
        rebelays_required=5,
        waterproof_oversuit_required=True,
        description="Extremely challenging high-altitude alpine karst cavern in Wyoming's Bighorn Mountains with near-freezing drip water, tight meanders, and deep cold vertical pitches.",
        highlights=[
            "Great X 95m freezing vertical pit",
            "Columbine Crevasse ice-rimmed entrance",
            "High-altitude alpine karst exploration",
        ],
    ),
    "carlsbad-caverns-slaughter-canyon": CavingRouteModel(
        cave_id="carlsbad-caverns-slaughter-canyon",
        title="Slaughter Canyon Cave (New Cave)",
        region="Eddy County, NM",
        depth_m=85,
        total_length_m=8200,
        cave_grade="class_2_scramble_crawl",
        deepest_pitch_m=0,
        environmental_type="arid_permian_reef_cavern",
        typical_duration_hours=3.5,
        rebelays_required=0,
        waterproof_oversuit_required=False,
        description="Pristine, non-electrified backcountry cavern in Carlsbad Caverns National Park preserving majestic ancient draperies, the 89-foot Monarch column, and Chinese Wall rimstone dams.",
        highlights=[
            "The 89ft Monarch speleothem column",
            "Chinese Wall delicate rimstone dams",
            "Wilderness lantern cave traversal",
        ],
    ),
    "tumbling-rock-cave-passages": CavingRouteModel(
        cave_id="tumbling-rock-cave-passages",
        title="Tumbling Rock Cave Streamway & Top of the World",
        region="Jackson County, AL",
        depth_m=70,
        total_length_m=11000,
        cave_grade="class_3_tight_squeeze",
        deepest_pitch_m=18,
        environmental_type="active_streamway_squeeze_cave",
        typical_duration_hours=6.0,
        rebelays_required=1,
        waterproof_oversuit_required=True,
        description="Classic TAG active stream cave famous for its active water crawls, the Mount Laurel breakdown pile, the Pillar of Fire, and the tight squeeze to Top of the World.",
        highlights=[
            "Pillar of Fire monumental stalagmite",
            "Active subterranean stream canyon crawls",
            "Top of the World high fissure overlook",
        ],
    ),
}

DEFAULT_CAVING_GEAR: list[CavingGearRequirement] = [
    CavingGearRequirement(
        item_id="en12492-caving-helmet-mount",
        name="EN 12492 Certified Caving Helmet with Integrated Dual-Beam Waterproof Headlamp (IP68)",
        category="headwear_lighting",
        mandatory=True,
        purpose="Provides impact and falling rock protection with non-vented or guarded shell and redundant high-lumen IP68 submersible hands-free lighting.",
    ),
    CavingGearRequirement(
        item_id="secondary-backup-headlamp",
        name="Independent 300+ Lumen Backup Headlamp plus Emergency Whistle and Spare Lithium Cells",
        category="backup_lighting",
        mandatory=True,
        purpose="Essential secondary light source ensuring total redundancy against primary lamp failure, darkness disorientation, and hypothermia.",
    ),
    CavingGearRequirement(
        item_id="caving-srt-frog-system",
        name="CE/UIAA Certified Low-Attachment Caving Harness with Chest Harness, Croll Ascender, and Handled Jammer",
        category="srt_vertical_gear",
        mandatory=True,
        purpose="Standard European Frog SRT ascending system providing maximum mechanical efficiency and low center of gravity on single rope ascents.",
    ),
    CavingGearRequirement(
        item_id="caving-bobbin-rack-descender",
        name="Industrial Stainless Steel Bobbin or Long-Bar Rappel Rack with Braking Carabiner",
        category="descender_hardware",
        mandatory=True,
        purpose="Dissipates thermal friction on long vertical drops without rope twisting; rappel rack for deep pits (>50m) and bobbins for short rebelay pitches.",
    ),
    CavingGearRequirement(
        item_id="heavy-cordura-caving-oversuit",
        name="Abrasion-Resistant Cordura Caving Oversuit with PVC Knee/Elbow Pads and Neoprene Undersuit",
        category="thermal_protection_apparel",
        mandatory=True,
        purpose="Shields caver against jagged limestone abrasion, cold muddy slurry, hypothermia, and cave water immersion.",
    ),
    CavingGearRequirement(
        item_id="wns-biosecurity-decon-kit",
        name="White-Nose Syndrome (WNS) Biosecurity Decontamination Kit (EPA-Registered Disinfectant & Wipes)",
        category="biosecurity_conservation",
        mandatory=True,
        purpose="Prevents the transmission of Pseudogymnoascus destructans fungal spores between bat hibernacula and karst ecosystems per USFWS protocol.",
    ),
]


def get_caving_routes(grade: Optional[str] = None) -> list[CavingRouteModel]:
    routes = list(DEFAULT_CAVING_ROUTES.values())
    if not grade:
        return routes

    norm = grade.strip().lower().replace(" ", "_").replace("-", "_")

    def canonical(g: str) -> str:
        if "class_5" in g or g == "class_5" or g == "5":
            return "class_5_complex_alpine"
        if "class_4" in g or g == "class_4" or g == "4":
            return "class_4_vertical_srt"
        if "class_3" in g or g == "class_3" or g == "3":
            return "class_3_tight_squeeze"
        if "class_2" in g or g == "class_2" or g == "2":
            return "class_2_scramble_crawl"
        if "class_1" in g or g == "class_1" or g == "1":
            return "class_1_horizontal_walk"
        return g

    target = canonical(norm)
    return [r for r in routes if r.cave_grade == target or target in r.cave_grade]


def get_caving_route_by_id(cave_id: str) -> Optional[CavingRouteModel]:
    return DEFAULT_CAVING_ROUTES.get(cave_id.strip().lower())


def calculate_srt_rigging_plan(request: SrtRiggingRequest) -> SrtRiggingResponse:
    cave = get_caving_route_by_id(request.cave_id)
    if not cave:
        raise ValueError(f"Caving route '{request.cave_id}' not found")

    total_weight = round(request.caver_weight_kg + request.caver_pack_weight_kg, 1)

    # Elongation estimate on semi-static EN 1891 Type A caving rope (~3% static elongation per 100kg load on 10mm rope)
    elongation_rate = 0.03 * (total_weight / 100.0) * (10.0 / max(request.rope_diameter_mm, 1.0))
    estimated_stretch = round(request.pitch_depth_m * elongation_rate, 2)

    # Descender recommendation
    if request.pitch_depth_m > 50.0:
        descender_rec = (
            "Industrial stainless steel or aluminum long-bar rappel rack (5-6 bars) recommended for deep vertical pitch (>50m) "
            "to dynamically adjust friction, distribute rope wear, and dissipate high thermal friction without rope glazing."
        )
    else:
        descender_rec = (
            "Closed-frame caving bobbin (e.g., Petzl Simple or Stop with steel braking carabiner) recommended for moderate pitch (<=50m) "
            "to facilitate swift rebelay transitions, single-handed rope feeding, and prevent dropped hardware."
        )

    # Rebelay advisory
    if request.rebelay_configured:
        rebelay_adv = (
            "Rebelay anchor configured: Successfully segments vertical pitch, isolates rope stretch/bounce, "
            "eliminates lip rub against sharp limestone edges, and enables tandem party ascension on separate rope segments."
        )
    else:
        rebelay_adv = (
            "WARNING: No rebelay configured. On deep pitches (>50m) or pitches with lip protrusions, lack of rebelays causes severe "
            "cyclic rope bounce/elasticity, sawing over lip rub hazards, and prevents tandem party descent/ascent. Rig rebelay anchors to maintain free hangs."
        )

    # Safety status
    abrasion = request.rope_abrasion_risk.strip().lower()
    if request.rope_diameter_mm < 8.5:
        safety_status = "critical_hazard"
    elif "sharp" in abrasion or "shear" in abrasion:
        safety_status = "critical_hazard" if not request.rebelay_configured else "caution"
    elif "rub" in abrasion:
        safety_status = (
            "critical_hazard"
            if not request.rebelay_configured and request.pitch_depth_m > 50.0
            else ("caution" if not request.rebelay_configured else "safe")
        )
    elif not request.rebelay_configured and (
        request.pitch_depth_m > 50.0 or cave.rebelays_required > 0
    ):
        safety_status = "caution"
    elif request.rope_diameter_mm < 9.0 or total_weight > 120.0:
        safety_status = "caution"
    else:
        safety_status = "safe"

    biosecurity_notice = (
        "White-Nose Syndrome (WNS) Biosecurity Protocol: Cavers must thoroughly clean and submerge non-porous gear "
        "in hot water (131°F / 55°C for 20 min) or EPA-registered disinfectant wipes before and after entering karst systems "
        "to prevent spreading Pseudogymnoascus destructans fungal spores between bat colonies and hibernacula."
    )

    return SrtRiggingResponse(
        cave_id=cave.cave_id,
        cave_title=cave.title,
        cave_grade=cave.cave_grade,
        total_suspended_weight_kg=total_weight,
        estimated_rope_stretch_m=estimated_stretch,
        safety_status=safety_status,
        descender_recommendation=descender_rec,
        rebelay_advisory=rebelay_adv,
        biosecurity_notice=biosecurity_notice,
    )


def get_caving_gear() -> list[CavingGearRequirement]:
    return list(DEFAULT_CAVING_GEAR)


def detect_caving_intent(message: str) -> Optional[CavingIntent]:
    if not message or not message.strip():
        return None

    q = message.lower()

    # CRITICAL DISAMBIGUATION: Strictly guard against general e-commerce
    ecommerce_exclusions = [
        "refund",
        "order #",
        "return label",
        "shipping tracking",
    ]
    if any(ex in q for ex in ecommerce_exclusions):
        return None

    # CRITICAL DISAMBIGUATION: Strictly guard against slot canyoneering in canyoneering.py!
    canyoneering_exclusions = [
        "slot canyon",
        "canyoneering",
        "canyon descender",
        "canyon rappel",
        "fiddlestick",
        "fiddle stick",
        "the subway left fork",
        "mystery canyon",
        "choprock canyon",
        "the black hole of white canyon",
        "bluejohn canyon",
        "keeper potholes",
        "keeper pothole",
    ]
    if any(cx in q for cx in canyoneering_exclusions):
        return None

    # CRITICAL DISAMBIGUATION: Strictly guard against rock climbing in climbing.py!
    climbing_exclusions = [
        "rock climbing",
        "trad climbing",
        "sport climbing",
        "bouldering",
        "camalot",
        "chalk bag",
        "belay partner",
        "quickdraw",
        "climbing crags",
        "climbing crag",
    ]
    if any(rx in q for rx in climbing_exclusions):
        return None

    # CRITICAL DISAMBIGUATION: Strictly guard against alpine mountaineering in mountaineering.py!
    mountaineering_exclusions = [
        "glacier mountaineering",
        "crevasse rescue",
        "glacier travel",
        "rope team",
        "snow picket",
        "z-pulley",
        "z pulley",
        "ice axe",
        "crampon",
        "crampons",
        "disappointment cleaver",
    ]
    if any(mx in q for mx in mountaineering_exclusions):
        return None

    # CRITICAL DISAMBIGUATION: Strictly guard against via ferrata in via_ferrata.py!
    via_ferrata_exclusions = [
        "via ferrata",
        "iron way",
        "klettersteig",
        "cable route",
        "cable routes",
        "en 958",
        "en958",
        "type k",
    ]
    if any(vx in q for vx in via_ferrata_exclusions):
        return None

    # Caving domain keywords
    caving_keywords = [
        "caving",
        "speleology",
        "karst",
        "spelunking",
        "pit cave",
        "pit caving",
        "single rope technique",
        "srt",
        "croll",
        "croll ascender",
        "frog system",
        "rebelay",
        "cave descender",
        "bobbin",
        "rappel rack caving",
        "ellisons cave",
        "ellison's cave",
        "fantastic pit",
        "mammoth cave",
        "tumbling rock cave",
        "tumbling rock",
        "white-nose syndrome",
        "white nose syndrome",
        "cave oversuit",
        "great x pit",
        "columbine crevasse",
        "slaughter canyon cave",
    ]
    if not any(k in q for k in caving_keywords):
        return None

    # Identify cave
    cave_id = None
    if "fantastic pit" in q or "ellison" in q:
        cave_id = "fantastic-pit-ellisons-cave"
    elif "mammoth cave" in q or "cleaveland" in q or "dallon" in q:
        cave_id = "mammoth-cave-historic-dallons"
    elif "great x" in q or "columbine" in q or "leprechaun" in q or "bighorn" in q:
        cave_id = "leprechaun-cave-bighorns"
    elif "slaughter canyon" in q or "new cave" in q or "carlsbad" in q:
        cave_id = "carlsbad-caverns-slaughter-canyon"
    elif "tumbling rock" in q or "top of the world" in q:
        cave_id = "tumbling-rock-cave-passages"

    # Identify grade
    grade = None
    if "class 5" in q or "class_5" in q or "complex alpine" in q:
        grade = "class_5_complex_alpine"
    elif "class 4" in q or "class_4" in q or "vertical srt" in q:
        grade = "class_4_vertical_srt"
    elif "class 3" in q or "class_3" in q or "tight squeeze" in q:
        grade = "class_3_tight_squeeze"
    elif "class 2" in q or "class_2" in q or "scramble crawl" in q:
        grade = "class_2_scramble_crawl"
    elif "class 1" in q or "class_1" in q or "horizontal walk" in q:
        grade = "class_1_horizontal_walk"

    # Identify action
    if any(
        k in q
        for k in [
            "rigging",
            "rigging plan",
            "rope stretch",
            "rub hazard",
            "rebelay",
            "descender",
            "bobbin",
            "rappel rack",
            "friction",
            "calculate",
            "stretch",
        ]
    ):
        action = "rigging_plan"
    elif any(
        k in q
        for k in [
            "gear",
            "checklist",
            "equipment",
            "helmet",
            "headlamp",
            "oversuit",
            "croll",
            "frog system",
            "biosecurity",
            "decontamination",
            "decontaminate",
            "kit",
            "mandatory",
        ]
    ):
        action = "gear_checklist"
    elif cave_id and any(
        k in q
        for k in [
            "detail",
            "details",
            "about",
            "tell me about",
            "highlights",
            "depth",
            "pitch",
            "length",
            "duration",
        ]
    ):
        action = "route_detail"
    elif any(
        k in q
        for k in [
            "caves",
            "routes",
            "catalog",
            "options",
            "list",
            "all",
            "recommend",
            "grade",
        ]
    ):
        action = "routes_list"
    elif cave_id:
        action = "route_detail"
    else:
        action = "routes_list"

    return CavingIntent(
        action=action,
        cave_id=cave_id,
        grade=grade,
        region=None,
    )


def build_caving_prompt(intent: CavingIntent) -> str:
    lines = ["Alpine Caving, Karst Speleology & SRT Rigging Tooling:"]

    if intent.cave_id:
        cave = get_caving_route_by_id(intent.cave_id)
        if cave:
            lines.append(
                f"- Cave Route: {cave.title} ({cave.region})\n"
                f"  Grade: {cave.cave_grade} | Depth: {cave.depth_m}m | Length: {cave.total_length_m}m\n"
                f"  Deepest Pitch: {cave.deepest_pitch_m}m | Environmental Type: {cave.environmental_type}\n"
                f"  Duration: ~{cave.typical_duration_hours} hrs | Rebelays Required: {cave.rebelays_required} | Waterproof Oversuit: {cave.waterproof_oversuit_required}\n"
                f"  Description: {cave.description}\n"
                f"  Highlights: {'; '.join(cave.highlights)}"
            )
    elif intent.grade:
        caves = get_caving_routes(grade=intent.grade)
        formatted = [f"{c.title} ({c.cave_grade}, depth {c.depth_m}m)" for c in caves]
        lines.append(f"- Matching {intent.grade} Caving Routes: {', '.join(formatted)}")
    else:
        caves = get_caving_routes()
        formatted = [f"{c.title} ({c.cave_grade}, {c.region})" for c in caves]
        lines.append(f"- Iconic Caving Systems Catalog: {', '.join(formatted)}")

    lines.extend(
        [
            "- Mandatory Caving Kit Checklist Compliance:",
            "  1. EN 12492 Certified Caving Helmet with Integrated Dual-Beam Waterproof Headlamp (IP68).",
            "  2. Independent 300+ Lumen Backup Headlamp plus Emergency Whistle and Spare Lithium Cells.",
            "  3. CE/UIAA Certified Low-Attachment Caving Harness with Chest Harness, Croll Ascender, and Handled Jammer.",
            "  4. Industrial Stainless Steel Bobbin or Long-Bar Rappel Rack with Braking Carabiner.",
            "  5. Abrasion-Resistant Cordura Caving Oversuit with PVC Knee/Elbow Pads and Neoprene Undersuit.",
            "  6. White-Nose Syndrome (WNS) Biosecurity Decontamination Kit (EPA-Registered Disinfectant & Wipes).",
            "- Single Rope Technique (SRT) & Speleology Principles: Semi-static EN 1891 Type A ropes are used exclusively. Rebelays isolate rope bounce and eliminate sharp rock lip abrasion. Long drops (>50m) require rappel racks to prevent friction heat buildup and rope sheath glazing. Strict WNS decontamination prevents spreading fungal pathogens to vulnerable bat populations.",
        ]
    )

    return "\n".join(lines)


def format_caving_response(intent: CavingIntent) -> dict[str, Any]:
    if intent.action == "rigging_plan":
        target_cave_id = intent.cave_id or "fantastic-pit-ellisons-cave"
        try:
            req = SrtRiggingRequest(cave_id=target_cave_id)
            plan_res = calculate_srt_rigging_plan(req)
            answer = (
                f"SRT Rigging Plan for {plan_res.cave_title} ({plan_res.cave_grade}): "
                f"Safety status is {plan_res.safety_status.upper()}. "
                f"Total suspended weight: {plan_res.total_suspended_weight_kg} kg. "
                f"Estimated rope stretch: {plan_res.estimated_rope_stretch_m} m. "
                f"Descender: {plan_res.descender_recommendation} "
                f"Rebelay: {plan_res.rebelay_advisory} "
                f"{plan_res.biosecurity_notice}"
            )
            return {
                "answer": answer,
                "caving_info": {
                    "action": "rigging_plan",
                    "plan": plan_res.model_dump(),
                },
            }
        except ValueError:
            pass

    if intent.action == "route_detail" and intent.cave_id:
        cave = get_caving_route_by_id(intent.cave_id)
        if cave:
            oversuit_str = (
                " Waterproof oversuit required."
                if cave.waterproof_oversuit_required
                else " Walking/dry exploration."
            )
            answer = (
                f"{cave.title} ({cave.region}): Grade: {cave.cave_grade}. Depth: {cave.depth_m}m, Length: {cave.total_length_m}m. "
                f"Deepest pitch: {cave.deepest_pitch_m}m. Duration: ~{cave.typical_duration_hours} hrs. "
                f"Rebelays: {cave.rebelays_required}.{oversuit_str} {cave.description} Highlights: {', '.join(cave.highlights)}."
            )
            return {
                "answer": answer,
                "caving_info": {
                    "action": "route_detail",
                    "route": cave.model_dump(),
                },
            }

    if intent.action == "gear_checklist":
        gear = get_caving_gear()
        gear_names = "; ".join(f"{g.name} ({g.purpose})" for g in gear[:3])
        answer = (
            f"Mandatory Alpine Caving & SRT Gear Checklist: {gear_names}; "
            f"plus {', '.join(g.name for g in gear[3:])}. "
            "Ensure full White-Nose Syndrome decontamination before and after cave entry."
        )
        return {
            "answer": answer,
            "caving_info": {
                "action": "gear_checklist",
                "gear": [g.model_dump() for g in gear],
            },
        }

    # Default: routes_list
    caves = get_caving_routes(grade=intent.grade)
    caves_summary = "; ".join(
        f"{c.title} ({c.cave_grade}, depth {c.depth_m}m, {c.region})" for c in caves
    )
    answer = (
        f"Alpine Caving & Karst Speleology Systems: {caves_summary}. "
        "All vertical pit routes require Single Rope Technique (SRT) proficiency, dual redundant lighting, and WNS biosecurity decontamination."
    )
    return {
        "answer": answer,
        "caving_info": {
            "action": "routes_list",
            "routes": [c.model_dump() for c in caves],
        },
    }
