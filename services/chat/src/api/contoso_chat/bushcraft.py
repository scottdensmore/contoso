from typing import Any, Optional

from pydantic import BaseModel


class BushcraftProjectModel(BaseModel):
    project_id: str
    title: str
    region: str
    discipline: str
    difficulty: str
    estimated_hours: float
    thermal_rating_r_value: float
    materials_required: list[str]
    tool_required: str
    description: str
    highlights: list[str]


class ShelterThermalRequest(BaseModel):
    project_id: str
    ambient_temperature_f: float = 30.0
    wind_speed_mph: float = 15.0
    debris_thickness_inches: float = 18.0
    bedding_elevation_inches: float = 6.0
    fire_reflector_wall: bool = False


class ShelterThermalResponse(BaseModel):
    project_id: str
    project_title: str
    discipline: str
    effective_r_value: float
    estimated_interior_temp_f: float
    safety_status: str
    ground_conductive_loss_warning: bool
    thermal_advisory: str
    fieldcraft_tips: list[str]


class BushcraftGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class BushcraftIntent(BaseModel):
    action: str  # "projects_list", "project_detail", "thermal_calc", "gear_checklist"
    project_id: Optional[str] = None
    discipline: Optional[str] = None
    region: Optional[str] = None


DEFAULT_BUSHCRAFT_PROJECTS: dict[str, BushcraftProjectModel] = {
    "boreal-debris-hut-shelter": BushcraftProjectModel(
        project_id="boreal-debris-hut-shelter",
        title="Boreal Forest Debris Hut & Insulated Raised Bed",
        region="Ely, MN",
        discipline="shelter_craft",
        difficulty="intermediate_bushcraft",
        estimated_hours=4.5,
        thermal_rating_r_value=8.0,
        materials_required=[
            "Stout ridge pole (10-12 ft, forearm thickness)",
            "Rib poles and lattice branch framework",
            "Dry coniferous duff and dry leaf debris (2-3 feet deep)",
            "Raised bough bedding lattice and birch bark waterproofing shingles",
        ],
        tool_required="Bushcraft folding saw and full-tang carbon steel knife",
        description="Traditional A-frame debris hut engineered for sub-freezing thermal retention, featuring a 45-degree angled rib cage packed with dead leaf debris and an elevated spruce/balsam fir bough mattress to prevent conductive heat loss to frozen soil.",
        highlights=[
            "High thermal insulation without open fire (R-8.0 rating)",
            "Ground insulation critical against conductive chill",
            "Compact internal volume designed to trap metabolic body heat",
        ],
    ),
    "cedar-bow-drill-ember": BushcraftProjectModel(
        project_id="cedar-bow-drill-ember",
        title="Northern White Cedar Bow Drill Friction Fire",
        region="Adirondacks, NY",
        discipline="friction_fire",
        difficulty="intermediate_bushcraft",
        estimated_hours=2.0,
        thermal_rating_r_value=0.0,
        materials_required=[
            "Dry dead-standing northern white cedar hearth board",
            "Cedar spindle (thumb-thickness, 8 inches)",
            "Flexible curved hardwood branch bow (arm-length)",
            "Dense hardwood or stone hand bearing block with lubricating leaf",
            "Tarred bankline or paracord bow string",
            "Tinder bundle of dry shredded cedar bast fiber and yellow birch curls",
        ],
        tool_required="Carbon steel bushcraft knife with 90-degree spine",
        description="Primitive friction fire method utilizing northern white cedar for both spindle and hearth board to generate an 800°F coal. Requires a carved 45-degree V-notch to collect charred wood dust until an ember ignites, transferred into a shredded fibrous bird's nest tinder bundle.",
        highlights=[
            "Matching wood pairing (cedar on cedar) optimizes friction and ignition temperature",
            "Efficient mechanical leverage via bow string and smooth bearing block",
            "Generates glowing coal without matches or modern spark rods",
        ],
    ),
    "basswood-bast-fiber-cordage": BushcraftProjectModel(
        project_id="basswood-bast-fiber-cordage",
        title="Basswood Inner Bark Two-Ply Reverse Wrap Cordage",
        region="Great Smoky Mtns, TN",
        discipline="cordage_botany",
        difficulty="foundation_beginner",
        estimated_hours=3.0,
        thermal_rating_r_value=0.0,
        materials_required=[
            "Harvested green or retted American basswood sapling branches",
            "Water bath for fiber retting and pectin breakdown",
            "Natural plant sizing or beeswax protective coating",
        ],
        tool_required="Full-tang bushcraft knife with Scandi grind",
        description="Traditional bast fiber processing using the soft inner bark (phloem) of basswood (linden). Stripped fibers are peeled into uniform ribbons and twisted using the two-ply reverse wrap technique, yielding rot-resistant, high-tensile survival lashing and net cordage.",
        highlights=[
            "Two-ply counter-twist locks fibers under tension without unraveling",
            "Splicing staggered fibers produces continuous cordage of indefinite length",
            "Exceptional tensile strength for shelter lashing, bow strings, and snares",
        ],
    ),
    "mors-kochanski-super-shelter": BushcraftProjectModel(
        project_id="mors-kochanski-super-shelter",
        title="Mors Kochanski Polar Super Shelter",
        region="Allagash Wilderness, ME",
        discipline="shelter_craft",
        difficulty="advanced_wilderness",
        estimated_hours=6.0,
        thermal_rating_r_value=12.0,
        materials_required=[
            "Heavy-duty clear 6-mil polyethylene plastic sheeting",
            "Mylar reflective emergency space blanket",
            "Spruce/fir poles for lean-to frame and raised timber sleeping platform",
            "Long log fire reflector logs (8 ft, green hardwood)",
            "Tarred bankline for structural lashings and ridge supports",
        ],
        tool_required="Full-tang carbon steel knife, folding saw, and forest axe",
        description="The classic Mors Kochanski northern wilderness survival shelter. Combines a radiant long-fire, log reflector wall, transparent plastic greenhouse wall, and a reflective mylar ceiling lining to trap radiant infrared heat, maintaining 70°F+ interior comfort even in sub-zero winter conditions.",
        highlights=[
            "Greenhouse effect captures radiant heat from long-fire through clear plastic",
            "Mylar ceiling reflects infrared radiant energy directly back onto sleeper",
            "Capable of keeping sleeper warm without sleeping bag in sub-zero temps",
        ],
    ),
    "birch-bark-water-boiling-vessel": BushcraftProjectModel(
        project_id="birch-bark-water-boiling-vessel",
        title="Folded Birch Bark Cooking Pot & Stone Boiling",
        region="Superior National Forest, MN",
        discipline="water_foraging_craft",
        difficulty="advanced_wilderness",
        estimated_hours=3.5,
        thermal_rating_r_value=0.0,
        materials_required=[
            "Fallen paper birch bark sheet (winter or spring harvest)",
            "Spruce root split bindings or wooden pinch pegs",
            "Smooth non-porous granite river stones (fist-sized)",
            "Tongs or green wood split sticks for hot stone transport",
        ],
        tool_required="Bushcraft knife and awl",
        description="Traditional Ojibwe and northern woods water purification craft. A seamless folded birch bark basket or pot holds wild water, brought to a rapid rolling boil by transferring fire-heated granite stones into the vessel without burning through the wet bark.",
        highlights=[
            "Direct heat transfer via hot non-explosive granite stones",
            "Bark remains below ignition temperature while water is in contact",
            "Yields sterile drinking water and primitive hot stews without metal cookware",
        ],
    ),
}

DEFAULT_BUSHCRAFT_GEAR: list[BushcraftGearRequirement] = [
    BushcraftGearRequirement(
        item_id="carbon-steel-bushcraft-knife",
        name="High-Carbon Steel Full-Tang Bushcraft Knife with Scandi Grind & 90-Degree Spine",
        category="cutting_tools",
        mandatory=True,
        purpose="Precision wood carving, batoning firewood, feather sticks, and striking sparks from ferrocerium rods with the sharp 90-degree spine.",
    ),
    BushcraftGearRequirement(
        item_id="bushcraft-folding-saw",
        name="Aggressive Cross-Cut Folding Saw or Compact Buck Saw",
        category="cutting_tools",
        mandatory=True,
        purpose="Bucking ridgepoles, bedding timbers, and processing dead-standing firewood efficiently without wasting metabolic calories.",
    ),
    BushcraftGearRequirement(
        item_id="ferrocerium-spark-rod",
        name="Heavy-Duty 1/2-Inch Ferrocerium Rod with Hardened Steel Striker",
        category="fire_craft",
        mandatory=True,
        purpose="All-weather spark ignition showering 5,500°F sparks to ignite natural tinder, charred cloth, and pitchwood in gale winds or driving rain.",
    ),
    BushcraftGearRequirement(
        item_id="single-wall-stainless-canteen-cup",
        name="32oz Single-Wall Stainless Steel Bushcraft Canteen with Nesting Cup & Lid",
        category="water_purification",
        mandatory=True,
        purpose="Direct flame water boiling, chemical pathogen disinfection, hydration carry, and primitive backcountry stew cooking.",
    ),
    BushcraftGearRequirement(
        item_id="tarred-marline-bankline",
        name="Roll of #36 Braided Tarred Bankline (Cordage & Lashing)",
        category="cordage",
        mandatory=True,
        purpose="High-strength rot-resistant lashings for debris hut ridgepoles, tripod pot-hangers, ridge lines, and emergency tool handle repairs.",
    ),
    BushcraftGearRequirement(
        item_id="heavy-canvas-wool-blanket",
        name="Heavyweight 100% Virgin Wool Bushcraft Blanket or Oilskin Tarp",
        category="thermal_shelter",
        mandatory=True,
        purpose="Spark-resistant thermal insulation, radiant heat retention around open campfires, ground barrier, and improvised emergency pack wrap.",
    ),
]


def get_bushcraft_projects(discipline: Optional[str] = None) -> list[BushcraftProjectModel]:
    projects = list(DEFAULT_BUSHCRAFT_PROJECTS.values())
    if discipline:
        disc_norm = discipline.strip().lower()
        projects = [p for p in projects if p.discipline.lower() == disc_norm]
    return projects


def get_bushcraft_project_by_id(project_id: str) -> Optional[BushcraftProjectModel]:
    normalized = project_id.strip().lower()
    return DEFAULT_BUSHCRAFT_PROJECTS.get(normalized)


def get_bushcraft_gear() -> list[BushcraftGearRequirement]:
    return DEFAULT_BUSHCRAFT_GEAR


def calculate_shelter_thermal(request: ShelterThermalRequest) -> ShelterThermalResponse:
    project = get_bushcraft_project_by_id(request.project_id)
    if not project:
        raise ValueError(f"Bushcraft project '{request.project_id}' not found")

    # Debris insulation and effective R-value calculation
    if request.project_id == "boreal-debris-hut-shelter":
        base_r = (request.debris_thickness_inches / 18.0) * 8.0
        effective_r = base_r + (2.5 if request.fire_reflector_wall else 0.0)
    elif request.project_id == "mors-kochanski-super-shelter":
        base_r = 12.0 + max(0.0, (request.debris_thickness_inches - 12.0) * 0.2)
        effective_r = base_r + (4.0 if request.fire_reflector_wall else 0.0)
    else:
        effective_r = max(0.5, request.debris_thickness_inches * 0.35 + (2.0 if request.fire_reflector_wall else 0.0))

    effective_r_value = round(effective_r, 1)

    # Ground conductive loss assessment: minimum 6 inches of compressed bedding needed
    ground_conductive_loss_warning = request.bedding_elevation_inches < 6.0

    # Interior temperature modeling
    wind_penalty = max(0.0, (request.wind_speed_mph - 5.0) * 0.3)
    if request.fire_reflector_wall:
        reflector_boost = 25.0 if request.project_id == "mors-kochanski-super-shelter" else 15.0
    else:
        reflector_boost = 0.0
    ground_loss_penalty = 8.0 if ground_conductive_loss_warning else 0.0

    interior_temp = (
        request.ambient_temperature_f
        + (effective_r_value * 1.8)
        - wind_penalty
        + reflector_boost
        - ground_loss_penalty
    )
    estimated_interior_temp_f = round(interior_temp, 1)

    # Safety status determination
    if estimated_interior_temp_f >= 55.0:
        safety_status = "safe"
        thermal_advisory = (
            "Shelter thermal equilibrium is safe (>=55°F). Trapped metabolic body heat and radiant reflection provide "
            "sustainable thermal protection. Maintain a small apex vent to exhaust respiration humidity."
        )
    elif estimated_interior_temp_f >= 40.0:
        safety_status = "advisory"
        thermal_advisory = (
            "Marginal thermal retention (40°F-54°F). Wool blanket wrapping and dry insulative clothing layers required. "
            "Consider adding 6-12 inches more debris thickness and raising bedding elevation."
        )
    else:
        safety_status = "danger"
        thermal_advisory = (
            "CRITICAL HYPOTHERMIA RISK: Projected interior temperature is below 40°F. Immediate danger of cold injury "
            "without elevated bough bedding, thicker debris walls (24-36 inches), or a radiant fire reflector wall."
        )

    fieldcraft_tips = [
        "Ground Conduction Rule: The frozen earth steals body heat up to 32 times faster than cold air; maintain 6+ inches of compacted bough or leaf bedding.",
        "Mors Kochanski Debris Metric: Pile debris until it is armpit deep (2 to 3 feet minimum) over the entire framework to ensure winter survival R-value.",
        "Reflector Wall Geometry: Position a vertical log or stone reflector wall 6 to 8 feet opposite the shelter opening to bounce infrared heat directly onto your bed.",
        "Apex Ventilation: Keep a fist-sized ventilation port open at the top of the shelter to prevent condensation from freezing on the inner thatch.",
    ]

    return ShelterThermalResponse(
        project_id=project.project_id,
        project_title=project.title,
        discipline=project.discipline,
        effective_r_value=effective_r_value,
        estimated_interior_temp_f=estimated_interior_temp_f,
        safety_status=safety_status,
        ground_conductive_loss_warning=ground_conductive_loss_warning,
        thermal_advisory=thermal_advisory,
        fieldcraft_tips=fieldcraft_tips,
    )


def detect_bushcraft_intent(message: str) -> Optional[BushcraftIntent]:
    q = message.lower()

    # Disambiguation guardrails against other services
    # 1. Trip planning exclusions
    if any(k in q for k in ["trip plan", "itinerary", "packing list", "plan a 3-day", "plan a trip"]):
        return None

    # 2. First aid medical exclusions
    if any(k in q for k in ["tourniquet", "cpr", "arterial bleeding", "medical triage", "medical symptoms", "fracture", "first aid kit"]):
        return None

    # 3. Fire safety / burn bans exclusions
    if any(k in q for k in ["fire ban", "burn restriction", "burn ban", "stage 1 fire", "stage 2 fire", "campfire safety regulations", "campfire restrictions"]):
        return None

    # 4. Foraging exclusions
    if any(k in q for k in ["forag", "chanterelle", "morel", "wild edible", "huckleberr", "miner's lettuce", "stinging nettle", "mushroom identification", "poisonous plant"]):
        return None

    # 5. Customer support exclusions
    if any(k in q for k in ["refund", "order #", "return label", "tracking", "promo code", "shipping"]):
        return None

    # Core Bushcraft Keywords
    bushcraft_keywords = [
        "bushcraft",
        "debris hut",
        "bow drill",
        "hand drill",
        "friction fire",
        "super shelter",
        "mors kochanski",
        "bast cordage",
        "bast fiber",
        "scandi grind",
        "ferro rod",
        "ferrocerium",
        "batoning",
        "birch bark boiling",
        "traditional survival",
        "primitive fire",
        "try stick",
    ]

    if not any(k in q for k in bushcraft_keywords):
        return None

    # Project Identification
    project_id: Optional[str] = None
    if "debris hut" in q or "boreal" in q:
        project_id = "boreal-debris-hut-shelter"
    elif "bow drill" in q or "friction fire" in q:
        project_id = "cedar-bow-drill-ember"
    elif "bast" in q or "cordage" in q or "basswood" in q:
        project_id = "basswood-bast-fiber-cordage"
    elif "super shelter" in q or "mors kochanski" in q:
        project_id = "mors-kochanski-super-shelter"
    elif "birch bark" in q or "stone boiling" in q:
        project_id = "birch-bark-water-boiling-vessel"

    # Discipline Identification
    discipline: Optional[str] = None
    if any(k in q for k in ["shelter", "debris hut", "super shelter"]):
        discipline = "shelter_craft"
    elif any(k in q for k in ["friction fire", "bow drill", "hand drill", "primitive fire"]):
        discipline = "friction_fire"
    elif any(k in q for k in ["cordage", "bast"]):
        discipline = "cordage_botany"
    elif any(k in q for k in ["boiling", "vessel"]):
        discipline = "water_foraging_craft"

    # Action Determination
    if any(k in q for k in ["thermal", "r-value", "r value", "insulation", "conductive", "ground chill", "calc"]):
        action = "thermal_calc"
    elif any(k in q for k in ["gear", "checklist", "ferro rod", "scandi knife", "mandatory"]) and not project_id:
        action = "gear_checklist"
    elif project_id and any(k in q for k in ["detail", "about", "how do i build", "how to make", "how to construct", "explain", "how does", "build a"]):
        action = "project_detail"
    elif project_id:
        action = "project_detail"
    elif any(k in q for k in ["gear", "tools", "checklist"]):
        action = "gear_checklist"
    else:
        action = "projects_list"

    return BushcraftIntent(
        action=action,
        project_id=project_id,
        discipline=discipline,
    )


def build_bushcraft_prompt(intent: BushcraftIntent) -> str:
    lines = ["Wilderness Bushcraft & Traditional Fieldcraft Tooling:"]
    if intent.project_id:
        proj = get_bushcraft_project_by_id(intent.project_id)
        if proj:
            lines.append(
                f"- Selected Project: {proj.title} ({proj.region})\n"
                f"  Discipline: {proj.discipline} | Difficulty: {proj.difficulty} | Est Hours: {proj.estimated_hours}h\n"
                f"  Thermal Rating: R-{proj.thermal_rating_r_value:.1f} | Required Tool: {proj.tool_required}\n"
                f"  Materials: {', '.join(proj.materials_required)}\n"
                f"  Description: {proj.description}\n"
                f"  Key Highlights: {'; '.join(proj.highlights)}"
            )
    elif intent.action == "gear_checklist":
        gear = get_bushcraft_gear()
        lines.append("- Mandatory Wilderness Bushcraft Kit Checklist:")
        for g in gear:
            lines.append(f"  * {g.name} [{g.category}]: {g.purpose}")
    elif intent.action == "thermal_calc":
        lines.extend([
            "- Shelter Thermal Engineering & Physics:",
            "  * Ground conductive chill draws heat away 32x faster than air; minimum 6-8 inches bough elevation required.",
            "  * Debris thickness of 2-3 feet (24-36 inches) achieves R-8 to R-12 for sub-freezing survival.",
            "  * Mors Kochanski super shelters utilize radiant reflection and greenhouse dynamics for sub-zero comfort.",
        ])
    else:
        projects = get_bushcraft_projects(discipline=intent.discipline)
        lines.append(
            f"- Available Bushcraft Projects ({intent.discipline or 'All Disciplines'}): "
            + "; ".join(f"{p.title} [{p.discipline}, R-{p.thermal_rating_r_value:.1f}]" for p in projects)
        )

    lines.extend([
        "- Core Traditional Bushcraft Principles:",
        "  1. 90-Degree Spine Carbon Knife: Keep edge shaving-sharp with Scandi grind; use square spine for ferro rod striking.",
        "  2. Friction Fire Precision: Pair matched wood densities (cedar/cedar), carved 45-degree V-notch, and dense tinder.",
        "  3. Elevated Bedding: Never sleep directly on bare ground; insulate with minimum 6 inches dry coniferous boughs.",
        "  4. Reflector Walls: Build sturdy log walls to redirect radiant infrared heat into open shelters.",
    ])
    return "\n".join(lines)


def format_bushcraft_response(intent: BushcraftIntent) -> dict[str, Any]:
    if intent.action == "thermal_calc":
        proj_id = intent.project_id or "boreal-debris-hut-shelter"
        thermal_res = calculate_shelter_thermal(
            ShelterThermalRequest(
                project_id=proj_id,
                ambient_temperature_f=30.0,
                wind_speed_mph=15.0,
                debris_thickness_inches=18.0,
                bedding_elevation_inches=6.0,
                fire_reflector_wall=False,
            )
        )
        answer = (
            f"Shelter Thermal Analysis for {thermal_res.project_title}: "
            f"Effective R-value is R-{thermal_res.effective_r_value:.1f} with an estimated interior temperature of "
            f"{thermal_res.estimated_interior_temp_f:.1f}°F. Safety status: {thermal_res.safety_status.upper()}. "
            f"{thermal_res.thermal_advisory}"
        )
        return {
            "answer": answer,
            "bushcraft_info": {
                "action": "thermal_calc",
                "project_id": thermal_res.project_id,
                "project_title": thermal_res.project_title,
                "effective_r_value": thermal_res.effective_r_value,
                "estimated_interior_temp_f": thermal_res.estimated_interior_temp_f,
                "safety_status": thermal_res.safety_status,
                "ground_conductive_loss_warning": thermal_res.ground_conductive_loss_warning,
                "thermal_advisory": thermal_res.thermal_advisory,
                "fieldcraft_tips": thermal_res.fieldcraft_tips,
            },
        }

    if intent.action == "project_detail" and intent.project_id:
        proj = get_bushcraft_project_by_id(intent.project_id)
        if proj:
            answer = (
                f"Bushcraft Project: {proj.title} ({proj.region}). "
                f"Discipline: {proj.discipline} | Difficulty: {proj.difficulty} | Estimated time: {proj.estimated_hours}h. "
                f"Thermal Rating: R-{proj.thermal_rating_r_value:.1f}. Required Tool: {proj.tool_required}. "
                f"Description: {proj.description} Highlights: {'; '.join(proj.highlights)}."
            )
            return {
                "answer": answer,
                "bushcraft_info": {
                    "action": "project_detail",
                    "project_id": proj.project_id,
                    "project": proj.model_dump(),
                },
            }

    if intent.action == "gear_checklist":
        gear = get_bushcraft_gear()
        gear_names = ", ".join(g.name for g in gear)
        answer = (
            f"Mandatory Bushcraft Kit Checklist (6 items): {gear_names}. "
            "High-carbon steel knife with Scandi grind, folding saw, and 1/2-inch ferrocerium rod form the foundation of traditional fieldcraft."
        )
        return {
            "answer": answer,
            "bushcraft_info": {
                "action": "gear_checklist",
                "gear": [g.model_dump() for g in gear],
            },
        }

    # Default: "projects_list"
    projects = get_bushcraft_projects(discipline=intent.discipline)
    summary = "; ".join(f"{p.title} ({p.discipline}, {p.region})" for p in projects)
    answer = (
        f"Contoso Wilderness Bushcraft & Primitive Survival Crafts: {summary}. "
        "Mastering friction fire, bast cordage, debris shelters, and stone boiling builds self-reliance in remote backcountry terrain."
    )
    return {
        "answer": answer,
        "bushcraft_info": {
            "action": "projects_list",
            "projects": [p.model_dump() for p in projects],
        },
    }
