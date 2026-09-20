from typing import Any, Optional

from pydantic import BaseModel


class RapidModel(BaseModel):
    name: str
    rating: str
    hazard_description: str
    scout_recommended: bool


class RiverRunModel(BaseModel):
    run_id: str
    name: str
    section: str
    river: str
    region: str
    class_rating: str
    length_miles: float
    put_in_location: str
    take_out_location: str
    current_flow_cfs: int
    min_runnable_cfs: int
    optimal_low_cfs: int
    optimal_high_cfs: int
    max_runnable_cfs: int
    flow_status: str
    water_temp_f: float
    gauge_station_name: str
    gauge_station_id: str
    key_rapids: list[RapidModel]
    hazards: list[str]
    permit_required: str


class RiverSafetyRequest(BaseModel):
    run_id: str
    craft: str = "kayak"
    paddler_skill: str = "intermediate"
    flow_cfs: Optional[int] = None


class RiverSafetyResponse(BaseModel):
    run_id: str
    flow_status: str
    is_runnable: bool
    suitability: str
    recommendation_text: str
    required_gear: list[str]
    cold_water_immersion_warning: bool
    safety_checklist: list[str]


class WhitewaterIntent(BaseModel):
    action: str  # "runs", "run_detail", "safety_eval", "hazards_protocols"
    run_id: Optional[str] = None
    class_rating: Optional[str] = None
    paddler_skill: Optional[str] = None
    craft: Optional[str] = None


DEFAULT_WHITEWATER_RUNS: dict[str, RiverRunModel] = {
    "wenatchee-tumwater": RiverRunModel(
        run_id="wenatchee-tumwater",
        name="Wenatchee River — Tumwater Canyon",
        section="Tumwater Canyon",
        river="Wenatchee River",
        region="Central Cascades / Leavenworth",
        class_rating="Class V",
        length_miles=7.0,
        put_in_location="Tumwater Campground / US-2 MP 91",
        take_out_location="Leavenworth Waterfront Park",
        current_flow_cfs=2800,
        min_runnable_cfs=1200,
        optimal_low_cfs=2000,
        optimal_high_cfs=4500,
        max_runnable_cfs=7000,
        flow_status="Optimal Medium",
        water_temp_f=44.0,
        gauge_station_name="Wenatchee River at Plain, WA",
        gauge_station_id="USGS-12457000",
        key_rapids=[
            RapidModel(
                name="Chaos",
                rating="Class V",
                hazard_description="Violent crashing holes and turbulent constriction hydraulics.",
                scout_recommended=True,
            ),
            RapidModel(
                name="Drury Falls",
                rating="Class V",
                hazard_description="Extended continuous boulder garden with massive terminal pourovers.",
                scout_recommended=True,
            ),
            RapidModel(
                name="The Graveyard",
                rating="Class V-",
                hazard_description="Technical slalom between undercut granite rocks with crushing eddy lines.",
                scout_recommended=True,
            ),
        ],
        hazards=[
            "Undercut granite canyon boulders",
            "Terminal recirculating hydraulics",
            "Severe cold-water shock risk (<45°F)",
            "River strainers and seasonal logjams",
        ],
        permit_required="None for day boating; Northwest Forest Pass required at parking turnouts",
    ),
    "skykomish-boulder-drop": RiverRunModel(
        run_id="skykomish-boulder-drop",
        name="Skykomish River — Sunset to Big Eddy",
        section="Sunset to Big Eddy",
        river="Skykomish River",
        region="Central Cascades / Highway 2",
        class_rating="Class IV",
        length_miles=8.5,
        put_in_location="Sunset Falls / Cable Drop Put-in",
        take_out_location="Big Eddy Public Access",
        current_flow_cfs=3400,
        min_runnable_cfs=1500,
        optimal_low_cfs=2500,
        optimal_high_cfs=5500,
        max_runnable_cfs=9000,
        flow_status="Optimal Medium",
        water_temp_f=46.0,
        gauge_station_name="Skykomish River near Gold Bar, WA",
        gauge_station_id="USGS-12134500",
        key_rapids=[
            RapidModel(
                name="Boulder Drop",
                rating="Class IV+",
                hazard_description="Continuous steep maze of house-sized boulders with deadly sieves and pinning slots.",
                scout_recommended=True,
            ),
            RapidModel(
                name="Split Rock",
                rating="Class IV",
                hazard_description="Deceptive center river boulder dividing high-speed chutes.",
                scout_recommended=False,
            ),
            RapidModel(
                name="Railroad Rapid",
                rating="Class III+",
                hazard_description="Standing wave train along the railroad embankment.",
                scout_recommended=False,
            ),
        ],
        hazards=[
            "Deadly river sieves and pinning rocks in Boulder Drop",
            "Snowmelt cold-water shock (<50°F)",
            "Powerful pushy hydraulics at high flows (>5000 cfs)",
        ],
        permit_required="Washington State Discover Pass required at Big Eddy take-out",
    ),
    "white-salmon-husum": RiverRunModel(
        run_id="white-salmon-husum",
        name="White Salmon River — BZ Corner to Husum",
        section="BZ Corner to Husum",
        river="White Salmon River",
        region="Columbia River Gorge / Mount Adams",
        class_rating="Class III-IV",
        length_miles=6.0,
        put_in_location="BZ Corner Launch Site",
        take_out_location="Husum Falls Take-Out",
        current_flow_cfs=1400,
        min_runnable_cfs=700,
        optimal_low_cfs=1000,
        optimal_high_cfs=2200,
        max_runnable_cfs=3500,
        flow_status="Optimal Medium",
        water_temp_f=48.0,
        gauge_station_name="White Salmon River near Underwood, WA",
        gauge_station_id="USGS-14123500",
        key_rapids=[
            RapidModel(
                name="Husum Falls",
                rating="Class V (Optional Drop)",
                hazard_description="Vertical 10-12 foot waterfall drop into aerated foam pool; mandatory scout or river-left portage.",
                scout_recommended=True,
            ),
            RapidModel(
                name="Top Drop",
                rating="Class III+",
                hazard_description="Steep ledge entry with powerful curling lateral wave.",
                scout_recommended=False,
            ),
            RapidModel(
                name="Corkscrew",
                rating="Class IV-",
                hazard_description="Twisting narrow gorge sequence between vertical basalt walls.",
                scout_recommended=False,
            ),
        ],
        hazards=[
            "Husum Falls vertical drop and boil line",
            "Narrow canyon walls restricting riverbank egress",
            "Cold spring-fed snowmelt",
        ],
        permit_required="Free self-issued boater registration at BZ Corner put-in",
    ),
    "snoqualmie-middle-fork": RiverRunModel(
        run_id="snoqualmie-middle-fork",
        name="Middle Fork Snoqualmie — Mine Creek to Middlefield",
        section="Mine Creek to Middlefield",
        river="Middle Fork Snoqualmie River",
        region="Central Cascades / North Bend",
        class_rating="Class III",
        length_miles=5.5,
        put_in_location="Mine Creek Day Use Site",
        take_out_location="Middlefield Bridge / Tanner",
        current_flow_cfs=1800,
        min_runnable_cfs=900,
        optimal_low_cfs=1400,
        optimal_high_cfs=2800,
        max_runnable_cfs=4500,
        flow_status="Optimal Medium",
        water_temp_f=45.0,
        gauge_station_name="Middle Fork Snoqualmie River near Tanner, WA",
        gauge_station_id="USGS-12141300",
        key_rapids=[
            RapidModel(
                name="Mine Creek Rapid",
                rating="Class III",
                hazard_description="Continuous wave train navigating gravel bars and river bends.",
                scout_recommended=False,
            ),
            RapidModel(
                name="House Rock",
                rating="Class III+",
                hazard_description="Large mid-river boulder creating an eddy line and pillow wave.",
                scout_recommended=False,
            ),
            RapidModel(
                name="Island Rapid",
                rating="Class III-",
                hazard_description="Channel split around forested island; check for log strainers.",
                scout_recommended=False,
            ),
        ],
        hazards=[
            "Fallen log strainers and root wads",
            "Cold Cascade snowmelt runoff",
            "Shallow gravel shoals at low flows",
        ],
        permit_required="Discover Pass required at Mine Creek launch",
    ),
    "deschutes-maupin": RiverRunModel(
        run_id="deschutes-maupin",
        name="Lower Deschutes River — Warm Springs to Maupin",
        section="Warm Springs to Maupin",
        river="Lower Deschutes River",
        region="Central Oregon / Maupin",
        class_rating="Class III",
        length_miles=12.0,
        put_in_location="Warm Springs Boat Launch",
        take_out_location="Maupin City Park Access",
        current_flow_cfs=4200,
        min_runnable_cfs=2800,
        optimal_low_cfs=3500,
        optimal_high_cfs=6000,
        max_runnable_cfs=8000,
        flow_status="Optimal Medium",
        water_temp_f=52.0,
        gauge_station_name="Deschutes River at Moody near Biggs, OR",
        gauge_station_id="USGS-14103000",
        key_rapids=[
            RapidModel(
                name="Sherars Falls",
                rating="Class VI (Mandatory Portage)",
                hazard_description="Unrunnable river-wide waterfall; mandatory takeout and portage path.",
                scout_recommended=True,
            ),
            RapidModel(
                name="Oak Springs Rapid",
                rating="Class III+",
                hazard_description="Large standing wave train and lateral wave crashing against basalt eddy wall.",
                scout_recommended=False,
            ),
            RapidModel(
                name="Boxcar Rapid",
                rating="Class III",
                hazard_description="Punchy hole on river right followed by wave train.",
                scout_recommended=False,
            ),
        ],
        hazards=[
            "Class VI unrunnable waterfall (Sherars Falls)",
            "High desert sun exposure combined with cold tailwater",
            "Rattlesnakes on scout trails",
        ],
        permit_required="BLM Lower Deschutes River Boater Pass required",
    ),
}

WHITEWATER_SAFETY_PROTOCOLS: dict[str, Any] = {
    "title": "Wilderness Whitewater Safety & River Rescue Protocols",
    "defensive_swimming_position": [
        "Keep feet up and toes pointing downstream to eliminate the deadly risk of foot entrapment in underwater rocks.",
        "Float on back with head and shoulders elevated, looking downstream to spot obstacles and oncoming waves.",
        "Use backstroke and defensive ferry angles with arms to navigate toward calm shoreline eddies.",
        "Never attempt to stand in fast-moving water higher than mid-calf or knee depth.",
    ],
    "strainer_hazards": [
        "River strainers (fallen trees, sweepers, root wads) let river water flow through while pinning boats and swimmers underwater.",
        "Maintain vigilant downstream scanning; ferry across current away from brush and riverbank debris early.",
        "If flushed toward an inescapable strainer, swim aggressively toward the log and throw chest up and over to vault top-side rather than submerging underneath.",
    ],
    "river_rescue_protocols": [
        "Self-rescue priority: Keep hold of paddle and boat if in safe current, or execute immediate defensive swim to the nearest eddy.",
        "Throw bag rescue: Rescuer anchors firmly on riverbank, throws line slightly downstream across swimmer's chest; swimmer grabs rope over shoulder facing away.",
        "River whistle communication: 1 blast = Stop / Look here; 2 blasts = Upstream / Attention; 3 blasts = Emergency / Swimmer in water.",
    ],
    "cold_water_immersion_rules": [
        "Water temperatures below 55°F cause involuntary cold shock gasping, hyperventilation, and rapid loss of motor dexterity.",
        "The 1-10-1 Rule: 1 minute to control gasp reflex, 10 minutes of functional movement for self-rescue, 1 hour before hypothermia unconsciousness.",
        "Immersion protection (drysuit with thermal undergarments or heavy neoprene wetsuit) is mandatory on PNW alpine rivers.",
    ],
    "essential_gear": [
        "CE-certified whitewater helmet (EN 1385)",
        "Type III or Type V whitewater PFD with quick-release rescue tether",
        "Drysuit with waterproof gaskets or heavy cold-water wetsuit (<55°F immersion rating)",
        "River rescue throw rope (50-75 ft high-tensile floating polypropylene line)",
        "River rescue knife mounted on PFD lash tab",
        "Pealess emergency whistle (Fox 40)",
        "Breakdown spare paddle",
        "Neoprene spray skirt for kayak cockpit seal",
        "Flotation bags (air bladders) installed in kayak bow and stern",
    ],
}


def get_whitewater_runs(
    class_rating: Optional[str] = None,
    region: Optional[str] = None,
) -> list[RiverRunModel]:
    runs = list(DEFAULT_WHITEWATER_RUNS.values())
    if class_rating:
        cr_norm = class_rating.strip().lower()
        runs = [r for r in runs if cr_norm in r.class_rating.lower()]
    if region:
        reg_norm = region.strip().lower()
        runs = [r for r in runs if reg_norm in r.region.lower()]
    return runs


def get_whitewater_run_by_id(run_id: str) -> Optional[RiverRunModel]:
    normalized = run_id.strip().lower()
    return DEFAULT_WHITEWATER_RUNS.get(normalized)


def assess_river_safety(req: RiverSafetyRequest) -> RiverSafetyResponse:
    run = get_whitewater_run_by_id(req.run_id)
    if not run:
        raise ValueError(f"River run '{req.run_id}' not found")

    flow = req.flow_cfs if req.flow_cfs is not None else run.current_flow_cfs

    # Determine flow status
    if flow < run.min_runnable_cfs:
        flow_status = "Too Low"
        is_runnable = False
    elif flow > run.max_runnable_cfs:
        flow_status = "Flood"
        is_runnable = False
    elif flow > run.optimal_high_cfs:
        flow_status = "High"
        is_runnable = True
    else:
        flow_status = "Optimal Medium"
        is_runnable = True

    # Cold water immersion risk (<55°F)
    cold_water_warning = run.water_temp_f < 55.0

    # Skill evaluation against class rating
    skill_weights = {
        "beginner": 1.0,
        "novice": 2.0,
        "intermediate": 3.0,
        "advanced": 4.0,
        "expert": 5.0,
    }
    class_weights = {
        "class i": 1.0,
        "class ii": 2.0,
        "class iii": 3.0,
        "class iii-iv": 3.5,
        "class iv": 4.0,
        "class iv+": 4.5,
        "class v": 5.0,
        "class v+": 5.5,
        "class vi": 6.0,
    }

    paddler_skill = req.paddler_skill.strip().lower()
    p_score = skill_weights.get(paddler_skill, 3.0)
    r_score = class_weights.get(run.class_rating.strip().lower(), 4.0)

    if not is_runnable:
        suitability = "unsuitable"
        if flow_status == "Too Low":
            recommendation_text = (
                f"River flow is Too Low at {flow} cfs (min runnable: {run.min_runnable_cfs} cfs). "
                f"Severe boat scraping, exposed rocks, and pinning hazards. River run is not runnable."
            )
        else:
            recommendation_text = (
                f"River flow is at Flood stage at {flow} cfs (max runnable: {run.max_runnable_cfs} cfs). "
                f"Dangerous washed-out hydraulics, massive floating debris, and deadly river strainers. Do not run."
            )
    elif p_score < r_score:
        if r_score - p_score >= 1.0:
            suitability = "not_recommended"
            recommendation_text = (
                f"{req.paddler_skill.capitalize()} paddlers are strongly advised against running {run.name} ({run.class_rating}). "
                f"This section features severe hydraulic recirculations, rapid entrapment hazards, and requires advanced/expert "
                f"rescue skills, reliable combat rolls, and high-velocity river maneuvering."
            )
        else:
            suitability = "caution"
            recommendation_text = (
                f"Caution: {run.name} ({run.class_rating}) is demanding for a {req.paddler_skill} paddler. "
                f"Ensure a reliable combat roll, scout all key rapids, and paddle with an experienced group."
            )
    else:
        suitability = "suitable"
        recommendation_text = (
            f"{run.name} ({run.class_rating}) is suitable for {req.paddler_skill} paddlers at current flow of "
            f"{flow} cfs ({flow_status}). Follow river safety protocols and scout horizon lines."
        )

    # Required gear
    gear = [
        "CE EN 1385 certified whitewater helmet",
        "Type III or Type V whitewater PFD with rescue harness",
        "River rescue throw bag (50-75 ft floating line)",
        "River rescue blunt-tip knife on PFD lash tab",
        "Pealess emergency whistle (Fox 40)",
    ]
    if cold_water_warning:
        gear.append(
            "Drysuit with latex/neoprene gaskets and thermal base layers (water temp < 55°F)"
        )
    else:
        gear.append("Wetsuit or splash gear appropriate for water temperature")

    craft_type = req.craft.strip().lower()
    if craft_type == "kayak":
        gear.extend(
            [
                "Neoprene whitewater spray skirt",
                "Kayak bow and stern flotation bags (air bladders)",
            ]
        )
    elif craft_type in ("raft", "packraft"):
        gear.extend(
            [
                "Perimeter safety line and bow/stern painters",
                "Spare breakdown paddle / oar",
                "High-volume river inflation pump",
            ]
        )

    checklist = [
        f"Verify gauge {run.gauge_station_id} ({run.gauge_station_name}): flow {flow} cfs within {run.min_runnable_cfs}-{run.max_runnable_cfs} cfs window.",
        "Review defensive swimming position: float on back, feet up and pointed downstream, head raised, never stand in moving current.",
        "Identify and designate throw-bag safety positions at major rapids prior to boater descent.",
        "Inspect river corridor for newly formed logjams, sweepers, or river strainers.",
        "Verify cold-water thermal protection: drysuit and thermal insulation fitted before launch.",
    ]

    return RiverSafetyResponse(
        run_id=run.run_id,
        flow_status=flow_status,
        is_runnable=is_runnable,
        suitability=suitability,
        recommendation_text=recommendation_text,
        required_gear=gear,
        cold_water_immersion_warning=cold_water_warning,
        safety_checklist=checklist,
    )


def get_whitewater_safety_protocols() -> dict[str, Any]:
    return WHITEWATER_SAFETY_PROTOCOLS


def detect_whitewater_intent(query: str) -> Optional[WhitewaterIntent]:
    q = query.lower()

    # Exclusions for other domains
    if any(
        w in q
        for w in [
            "refund",
            "order #",
            "return label",
            "climbing shoe",
            "water filter",
            "water purification",
            "filtration",
            "filter bottle",
            "hydration pack",
            "ski tour",
            "splitboard",
            "skin track",
            "skinning",
            "avalanche danger",
            "snowpack",
            "fire ban",
        ]
    ):
        return None

    ww_keywords = [
        "whitewater",
        "river run",
        "river runs",
        "rapid",
        "rapids",
        "cfs",
        "flow level",
        "river flow",
        "river gauge",
        "river safety",
        "river rescue",
        "drysuit",
        "pfd",
        "strainer",
        "foot entrapment",
        "defensive swimming",
        "boater",
        "boating",
        "paddler",
        "paddling",
        "tumwater",
        "wenatchee",
        "skykomish",
        "boulder drop",
        "white salmon",
        "husum",
        "snoqualmie",
        "middle fork",
        "deschutes",
        "maupin",
        "class iii",
        "class iv",
        "class v",
    ]

    if not any(k in q for k in ww_keywords):
        return None

    # Detect Run
    run_id = None
    if any(k in q for k in ["tumwater", "wenatchee"]):
        run_id = "wenatchee-tumwater"
    elif any(k in q for k in ["skykomish", "boulder drop", "sunset to big eddy"]):
        run_id = "skykomish-boulder-drop"
    elif any(k in q for k in ["white salmon", "husum"]):
        run_id = "white-salmon-husum"
    elif any(k in q for k in ["snoqualmie", "middle fork"]):
        run_id = "snoqualmie-middle-fork"
    elif any(k in q for k in ["deschutes", "maupin"]):
        run_id = "deschutes-maupin"

    # Detect Skill
    paddler_skill = None
    if "beginner" in q or "novice" in q:
        paddler_skill = "beginner"
    elif "intermediate" in q:
        paddler_skill = "intermediate"
    elif "advanced" in q:
        paddler_skill = "advanced"
    elif "expert" in q:
        paddler_skill = "expert"

    # Detect Craft
    craft = None
    if "kayak" in q or "kayaker" in q:
        craft = "kayak"
    elif "packraft" in q:
        craft = "packraft"
    elif "raft" in q or "rafter" in q or "rafting" in q:
        craft = "raft"
    elif "canoe" in q:
        craft = "canoe"

    # Detect Class Rating
    class_rating = None
    if "class v+" in q:
        class_rating = "Class V+"
    elif "class v" in q:
        class_rating = "Class V"
    elif "class iv" in q:
        class_rating = "Class IV"
    elif "class iii-iv" in q:
        class_rating = "Class III-IV"
    elif "class iii" in q:
        class_rating = "Class III"
    elif "class ii" in q:
        class_rating = "Class II"

    # Determine Action
    if any(
        k in q
        for k in [
            "safe",
            "safety",
            "can i",
            "is it safe",
            "eval",
            "evaluate",
            "suitability",
            "intermediate paddler",
            "cfs safe",
        ]
    ):
        action = "safety_eval"
    elif any(
        k in q
        for k in [
            "strainer",
            "defensive swimming",
            "rescue protocol",
            "foot entrapment",
            "whistle signal",
            "cold shock",
            "cold water",
        ]
    ):
        action = "hazards_protocols"
    elif run_id and any(
        k in q
        for k in [
            "detail",
            "about",
            "what rapid",
            "rapids in",
            "length",
            "put in",
            "take out",
            "tell me about",
        ]
    ):
        action = "run_detail"
    elif any(k in q for k in ["runs", "catalog", "rivers", "recommend"]):
        action = "runs"
    elif run_id:
        action = "run_detail"
    else:
        action = "runs"

    return WhitewaterIntent(
        action=action,
        run_id=run_id,
        class_rating=class_rating,
        paddler_skill=paddler_skill,
        craft=craft,
    )


def build_whitewater_prompt(intent: WhitewaterIntent) -> str:
    lines = ["Pacific Northwest Whitewater & River Safety Tooling:"]
    if intent.run_id:
        run = get_whitewater_run_by_id(intent.run_id)
        if run:
            lines.append(
                f"- River Run: {run.name} ({run.river}, {run.region})\n"
                f"  Difficulty: {run.class_rating} | Distance: {run.length_miles} mi\n"
                f"  Flow: {run.current_flow_cfs} cfs (Status: {run.flow_status}, Runnable: {run.min_runnable_cfs}-{run.max_runnable_cfs} cfs)\n"
                f"  Water Temp: {run.water_temp_f}°F (USGS Gauge: {run.gauge_station_id} - {run.gauge_station_name})\n"
                f"  Put-in: {run.put_in_location} | Take-out: {run.take_out_location}\n"
                f"  Key Rapids: {', '.join(f'{rap.name} ({rap.rating})' for rap in run.key_rapids)}\n"
                f"  Hazards: {'; '.join(run.hazards)}\n"
                f"  Permit: {run.permit_required}"
            )
    elif intent.class_rating:
        runs = get_whitewater_runs(class_rating=intent.class_rating)
        lines.append(f"- Matching {intent.class_rating} Runs: {', '.join(r.name for r in runs)}")
    else:
        runs = get_whitewater_runs()
        lines.append(
            f"- Available PNW Runs: {', '.join(f'{r.name} ({r.class_rating}, {r.current_flow_cfs} cfs)' for r in runs)}"
        )

    lines.extend(
        [
            "- Core River Safety Rules:",
            "  1. Defensive swimming position: Float on back, feet up and pointing downstream, head raised. Never stand in swift water.",
            "  2. River strainers: Keep clear of fallen trees and logjams; swim aggressively away early or vault over top if trapped.",
            "  3. Cold water shock (<55°F): Drysuits/PFDs mandatory; 1-10-1 rule applies for thermal survival.",
            "  4. River whistle signals: 1 blast = Stop/Attention; 2 blasts = Upstream/Help; 3 blasts = Emergency/Swimmer in water.",
        ]
    )
    return "\n".join(lines)


def format_whitewater_response(intent: WhitewaterIntent) -> dict[str, Any]:
    if intent.action == "safety_eval":
        target_run_id = intent.run_id or "skykomish-boulder-drop"
        try:
            req = RiverSafetyRequest(
                run_id=target_run_id,
                craft=intent.craft or "kayak",
                paddler_skill=intent.paddler_skill or "intermediate",
            )
            eval_res = assess_river_safety(req)
            run = get_whitewater_run_by_id(target_run_id)
            run_name = run.name if run else target_run_id

            answer = (
                f"River Safety Assessment for {run_name}: "
                f"Current flow is {run.current_flow_cfs if run else 'N/A'} cfs ({eval_res.flow_status}). "
                f"Suitability for a {req.paddler_skill} paddler: {eval_res.suitability.upper()}. "
                f"{eval_res.recommendation_text} "
                f"Cold water immersion warning: {'Active (<55°F) - drysuit mandatory' if eval_res.cold_water_immersion_warning else 'Normal'}. "
                f"Key gear: {'; '.join(eval_res.required_gear[:4])}."
            )
            return {
                "answer": answer,
                "whitewater_info": {
                    "action": "safety_eval",
                    "run_id": eval_res.run_id,
                    "run_name": run_name,
                    "flow_status": eval_res.flow_status,
                    "is_runnable": eval_res.is_runnable,
                    "suitability": eval_res.suitability,
                    "recommendation_text": eval_res.recommendation_text,
                    "required_gear": eval_res.required_gear,
                    "cold_water_immersion_warning": eval_res.cold_water_immersion_warning,
                    "safety_checklist": eval_res.safety_checklist,
                },
            }
        except ValueError:
            pass

    if intent.action == "run_detail" and intent.run_id:
        run = get_whitewater_run_by_id(intent.run_id)
        if run:
            rapids_summary = "; ".join(f"{r.name} ({r.rating})" for r in run.key_rapids)
            answer = (
                f"Whitewater River Run: {run.name} ({run.river}, {run.region}). "
                f"Rating: {run.class_rating} | Distance: {run.length_miles} miles. "
                f"Current Flow: {run.current_flow_cfs} cfs ({run.flow_status}, runnable range {run.min_runnable_cfs}-{run.max_runnable_cfs} cfs). "
                f"Water Temp: {run.water_temp_f}°F (Gauge: {run.gauge_station_id}). "
                f"Put-in: {run.put_in_location} | Take-out: {run.take_out_location}. "
                f"Key Rapids: {rapids_summary}. Hazards: {', '.join(run.hazards)}. "
                f"Permit: {run.permit_required}."
            )
            return {
                "answer": answer,
                "whitewater_info": {
                    "action": "run_detail",
                    "run": run.model_dump(),
                },
            }

    if intent.action == "hazards_protocols":
        protocols = get_whitewater_safety_protocols()
        defensive_str = " ".join(protocols["defensive_swimming_position"][:2])
        strainer_str = protocols["strainer_hazards"][0]
        answer = (
            f"Wilderness Whitewater Safety & Rescue Protocols: {defensive_str} "
            f"Strainer Hazards: {strainer_str} "
            f"Always wear an approved Type III/V PFD, CE-certified whitewater helmet, and appropriate thermal immersion gear (<55°F)."
        )
        return {
            "answer": answer,
            "whitewater_info": {
                "action": "hazards_protocols",
                "protocols": protocols,
            },
        }

    # Default: "runs"
    runs = get_whitewater_runs(class_rating=intent.class_rating)
    runs_summary = "; ".join(
        f"{r.name} ({r.class_rating}, {r.current_flow_cfs} cfs, {r.flow_status})" for r in runs
    )
    answer = (
        f"Pacific Northwest Whitewater River Runs: {runs_summary}. "
        "Always monitor real-time USGS river gauges, respect rapid classifications, and carry essential rescue equipment."
    )
    return {
        "answer": answer,
        "whitewater_info": {
            "action": "runs",
            "runs": [r.model_dump() for r in runs],
        },
    }
