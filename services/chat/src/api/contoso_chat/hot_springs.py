import re
from typing import Any, Optional

from pydantic import BaseModel, Field


class HotSpringModel(BaseModel):
    spring_id: str
    name: str
    region: str
    state: str
    temperature_f: int
    pool_type: str
    mineral_profile: str
    access_difficulty: str
    hike_distance_miles: float
    elevation_gain_ft: int
    clothing_optional: bool
    fee_required: bool
    winter_access: bool
    description: str
    leave_no_trace_rules: list[str]
    recommended_gear: list[str] = Field(default_factory=list)


class SoakingPlanRequest(BaseModel):
    spring_id: str
    party_size: int = 2
    season: str = "summer"
    soak_duration_minutes: int = 45


class SoakingPlanResponse(BaseModel):
    spring_id: str
    spring_name: str
    temperature_f: int
    safe_max_session_minutes: int
    hydration_liters_required: float
    electrolytes_recommended_mg: int
    hazards: list[str]
    ethics_rules: list[str]


class HotSpringGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool = True
    purpose: str


class HotSpringIntent(BaseModel):
    action: str  # "springs_list", "spring_detail", "soaking_plan", "gear_ethics"
    spring_id: Optional[str] = None
    access_difficulty: Optional[str] = None
    state: Optional[str] = None


class HotSpringGearEthicsResponse(BaseModel):
    mandatory_gear: list[HotSpringGearRequirement]
    gear: list[HotSpringGearRequirement]
    leave_no_trace_rules: list[str]
    ethics_rules: list[str]


DEFAULT_HOT_SPRINGS: dict[str, HotSpringModel] = {
    "scenic-hot-springs": HotSpringModel(
        spring_id="scenic-hot-springs",
        name="Scenic Hot Springs",
        region="Cascade Mountains",
        state="WA",
        temperature_f=104,
        pool_type="cedar_tub",
        mineral_profile="lithium_silica",
        access_difficulty="moderate_hike",
        hike_distance_miles=4.4,
        elevation_gain_ft=1100,
        clothing_optional=True,
        fee_required=True,
        winter_access=True,
        description=(
            "Perched on a steep pine-forested slope in the Central Cascades, Scenic Hot Springs "
            "features three elevated cedar tubs fed by mineral-rich geothermal waters with sweeping "
            "mountain basin views."
        ),
        leave_no_trace_rules=[
            "Advance reservation and permit code required for private property access",
            "Strictly pack out all beverage containers, food wrappers, and micro-trash",
            "Zero soaps, oils, or personal care products allowed in or near tubs",
        ],
        recommended_gear=[
            "Microspikes or snowshoes for steep winter snowpack",
            "Insulated parka and warm fleece beanie for post-soak transition",
            "High-traction boots for steep, muddy uphill trail",
        ],
    ),
    "goldmyer-hot-springs": HotSpringModel(
        spring_id="goldmyer-hot-springs",
        name="Goldmyer Hot Springs",
        region="Middle Fork Snoqualmie",
        state="WA",
        temperature_f=111,
        pool_type="primitive_rock",
        mineral_profile="sulfur_rich",
        access_difficulty="rugged_backcountry",
        hike_distance_miles=9.0,
        elevation_gain_ft=800,
        clothing_optional=True,
        fee_required=True,
        winter_access=True,
        description=(
            "Hidden in wilderness old-growth forest along the Middle Fork Snoqualmie River, "
            "Goldmyer features an ancient geothermal horizontal cave pool and tiered hand-carved "
            "stone soaking baths."
        ),
        leave_no_trace_rules=[
            "Wilderness permit lottery reservation required prior to departure",
            "No domestic animals, alcohol, or smoking on wilderness grounds",
            "Zero soaps, shampoos, or cleansers in natural cave or rock pools",
        ],
        recommended_gear=[
            "High-clearance all-wheel drive vehicle for rough forest road access",
            "Submersible waterproof headlamp for dark cave soaking",
            "Heavy-duty dry bag and full wilderness backpacking kit",
        ],
    ),
    "bagby-hot-springs": HotSpringModel(
        spring_id="bagby-hot-springs",
        name="Bagby Hot Springs",
        region="Mount Hood National Forest",
        state="OR",
        temperature_f=120,
        pool_type="cedar_tub",
        mineral_profile="calcium_bicarbonate",
        access_difficulty="easy_walk",
        hike_distance_miles=3.0,
        elevation_gain_ft=200,
        clothing_optional=False,
        fee_required=True,
        winter_access=False,
        description=(
            "Nestled among towering old-growth firs in Mount Hood National Forest, Bagby offers "
            "historic hand-hollowed cedar log tubs fed by 120°F geothermal spring water."
        ),
        leave_no_trace_rules=[
            "Clothing / swimwear mandatory on main community bathhouse decks",
            "USFS Forest Recreation Day Pass and soaking wristband required",
            "Alcohol and glass containers strictly prohibited in soaking area",
        ],
        recommended_gear=[
            "Cold water tempering bucket to cool 120°F source water",
            "Non-slip wading sandals for slippery cedar deck planks",
            "Quick-drying microfiber camp towel",
        ],
    ),
    "travertine-hot-springs": HotSpringModel(
        spring_id="travertine-hot-springs",
        name="Travertine Hot Springs",
        region="Eastern Sierra / Great Basin",
        state="CA",
        temperature_f=103,
        pool_type="travertine_terrace",
        mineral_profile="calcium_bicarbonate",
        access_difficulty="easy_walk",
        hike_distance_miles=0.2,
        elevation_gain_ft=10,
        clothing_optional=True,
        fee_required=False,
        winter_access=True,
        description=(
            "Colorful geothermal mineral terraces with warm pools overlooking Bridgeport Valley "
            "and the snowcapped granite peaks of the Eastern Sierra crest."
        ),
        leave_no_trace_rules=[
            "Stay on established pathways to protect fragile mineral crust formations",
            "Pack out 100% of trash, baby wipes, and human waste",
            "No camping within 100 yards of hot spring pools",
        ],
        recommended_gear=[
            "Slip-on sandals for mineral mud and travertine edges",
            "Polarized UV sunglasses and wide-brim desert sun hat",
            "Windbreaker for brisk alpine desert evening temperatures",
        ],
    ),
    "kirkham-hot-springs": HotSpringModel(
        spring_id="kirkham-hot-springs",
        name="Kirkham Hot Springs",
        region="Payette River Canyon",
        state="ID",
        temperature_f=102,
        pool_type="riverside_gravel",
        mineral_profile="magnesium_sulfate",
        access_difficulty="easy_walk",
        hike_distance_miles=0.4,
        elevation_gain_ft=50,
        clothing_optional=False,
        fee_required=True,
        winter_access=True,
        description=(
            "A geothermal wonderland along the South Fork Payette River featuring steamy hot "
            "waterfalls cascading into terraced riverside gravel pools."
        ),
        leave_no_trace_rules=[
            "Day-use only between 7:00 AM and 10:00 PM; no night soaking",
            "Swimwear mandatory; respect family-friendly canyon setting",
            "Use designated wooden stairways to prevent steep riverbank erosion",
        ],
        recommended_gear=[
            "Neoprene river booties to protect against sharp canyon gravel",
            "Dry storage compression sack for riverside towels and dry clothes",
            "Fleece hoodie for river breeze upon exiting hot pools",
        ],
    ),
}

HOT_SPRING_GEAR_CATALOG: list[HotSpringGearRequirement] = [
    HotSpringGearRequirement(
        item_id="gear-booties",
        name="Neoprene water booties or high-traction wading sandals",
        category="footwear",
        mandatory=True,
        purpose="Thermal rubber traction soles protect against jagged river gravel, slick moss, and scalding bedrock.",
    ),
    HotSpringGearRequirement(
        item_id="gear-towel",
        name="Fast-drying ultralight microfiber towel",
        category="thermal",
        mandatory=True,
        purpose="Ultra-absorbent, compact towel to quickly dry off before freezing backcountry air causes rapid hypothermia.",
    ),
    HotSpringGearRequirement(
        item_id="gear-hydration",
        name="Insulated hydration bottle (minimum 1.0L cold water per person)",
        category="hydration",
        mandatory=True,
        purpose="Double-wall vacuum bottle with cold electrolyte water to counter heavy mineral pool dehydration.",
    ),
    HotSpringGearRequirement(
        item_id="gear-dry-bag",
        name="Pack-it-out leakproof dry bag for wet clothing and micro-trash",
        category="pack_in",
        mandatory=True,
        purpose="Roll-top waterproof bag isolates damp swimwear and contains all used wrappers and micro-debris.",
    ),
    HotSpringGearRequirement(
        item_id="gear-headlamp",
        name="High-output headlamp with red-light night soaking mode",
        category="pack_in",
        mandatory=True,
        purpose="Hands-free trail navigation with night-vision-preserving red LED mode for dark backcountry tub access.",
    ),
    HotSpringGearRequirement(
        item_id="gear-waste-bags",
        name="Biodegradable sealable pack-out waste bags (strict Leave No Trace)",
        category="hygiene",
        mandatory=True,
        purpose="Puncture-resistant odor-proof waste disposal bags ensuring zero trace left in sensitive riparian zones.",
    ),
]

LEAVE_NO_TRACE_ETHICS_RULES: list[str] = [
    "Pack out 100% of trash, micro-waste, bottles, and food scraps (strict Leave No Trace).",
    "Never introduce soaps, shampoos, bath salts, or oils into delicate geothermal mineral pools.",
    "Adhere to posted etiquette: clothing optional with mutual respect or swimwear strictly mandatory where posted.",
    "Keep noise and music silenced to preserve quiet solitude of backcountry nature.",
    "Never camp within 100 yards of hot spring pools to protect fragile riparian zones and wildlife access.",
    "Stay on established trails and rocks to protect fragile mineral crusts and thermal runoff ecology.",
]


def get_hot_springs(
    access: Optional[str] = None,
    state: Optional[str] = None,
) -> list[HotSpringModel]:
    springs = list(DEFAULT_HOT_SPRINGS.values())
    if access:
        acc_clean = access.lower().strip().replace("-", "_")
        springs = [s for s in springs if s.access_difficulty.lower() == acc_clean]
    if state:
        st_clean = state.upper().strip()
        springs = [s for s in springs if s.state.upper() == st_clean]
    return springs


def get_hot_spring_by_id(spring_id: str) -> Optional[HotSpringModel]:
    if not spring_id or not isinstance(spring_id, str):
        return None
    clean_id = spring_id.lower().strip()
    if clean_id in DEFAULT_HOT_SPRINGS:
        return DEFAULT_HOT_SPRINGS[clean_id]

    # Alias / name search
    for s in DEFAULT_HOT_SPRINGS.values():
        if (
            clean_id == s.name.lower()
            or clean_id in s.name.lower()
            or s.spring_id.replace("-", " ") in clean_id
            or clean_id in s.spring_id
            or clean_id in s.spring_id.split("-")[0]
        ):
            return s

    return None


def calculate_soaking_plan(req: SoakingPlanRequest) -> SoakingPlanResponse:
    spring = get_hot_spring_by_id(req.spring_id)
    if not spring:
        raise ValueError(f"Hot spring '{req.spring_id}' not found")

    water_temp_f = spring.temperature_f

    # Safe max session calculation based on temperature
    if water_temp_f >= 115:
        safe_max_session_minutes = 15
    elif water_temp_f >= 108:
        safe_max_session_minutes = 20
    elif water_temp_f >= 104:
        safe_max_session_minutes = 30
    else:
        safe_max_session_minutes = 45

    season_lower = (req.season or "summer").lower().strip()
    season_multiplier = 1.3 if season_lower == "summer" else (1.1 if season_lower == "winter" else 1.0)
    raw_hydration = req.party_size * (req.soak_duration_minutes / 30.0) * 0.5 * season_multiplier
    hydration_liters_required = max(float(req.party_size * 1.0), round(raw_hydration, 1))

    electrolyte_multiplier = 1.2 if season_lower == "summer" else 1.0
    electrolytes_recommended_mg = int(
        round(req.party_size * (req.soak_duration_minutes / 30.0) * 300 * electrolyte_multiplier)
    )

    hazards: list[str] = []
    if water_temp_f >= 108:
        hazards.append(
            "Extreme water temperature danger: soak in short increments (max 15-20 mins) "
            "and exit immediately if feeling lightheaded or dizzy."
        )
    if req.soak_duration_minutes > safe_max_session_minutes:
        hazards.append(
            f"Planned soak duration ({req.soak_duration_minutes} min) exceeds safe single session limit "
            f"({safe_max_session_minutes} min). Schedule 15-minute cool-down intervals."
        )
    if spring.access_difficulty == "rugged_backcountry":
        hazards.append(
            "Remote backcountry wilderness: cell coverage unavailable and SAR evacuation takes several hours. "
            "Carry satellite emergency beacon."
        )
    if spring.winter_access and season_lower == "winter":
        hazards.append(
            "Severe hypothermia danger: sub-freezing ambient air creates rapid body cooling upon exit. "
            "Dry off and layer up within 60 seconds."
        )
    if season_lower == "summer":
        hazards.append(
            "Elevated dehydration risk: hot summer sun amplifies perspiration in geothermal pools. "
            "Consume cold water before and during soak."
        )

    ethics_rules: list[str] = [
        "Pack out 100% of trash, micro-waste, bottles, and food scraps (strict Leave No Trace).",
        "Never introduce soaps, shampoos, bath salts, or oils into delicate geothermal mineral pools.",
        f"Adhere to posted etiquette: {'clothing optional with mutual respect' if spring.clothing_optional else 'swimwear strictly mandatory at all times'}.",
        "Keep noise and music silenced to preserve quiet solitude of backcountry nature.",
    ]

    return SoakingPlanResponse(
        spring_id=spring.spring_id,
        spring_name=spring.name,
        temperature_f=water_temp_f,
        safe_max_session_minutes=safe_max_session_minutes,
        hydration_liters_required=hydration_liters_required,
        electrolytes_recommended_mg=electrolytes_recommended_mg,
        hazards=hazards,
        ethics_rules=ethics_rules,
    )


def get_hot_spring_gear() -> list[HotSpringGearRequirement]:
    return list(HOT_SPRING_GEAR_CATALOG)


def get_hot_spring_gear_and_ethics() -> HotSpringGearEthicsResponse:
    gear = get_hot_spring_gear()
    return HotSpringGearEthicsResponse(
        mandatory_gear=gear,
        gear=gear,
        leave_no_trace_rules=list(LEAVE_NO_TRACE_ETHICS_RULES),
        ethics_rules=list(LEAVE_NO_TRACE_ETHICS_RULES),
    )


def detect_hot_spring_intent(query: str) -> Optional[HotSpringIntent]:
    if not query or not isinstance(query, str) or not query.strip():
        return None

    q_lower = query.lower()

    # Primary hot spring identifiers
    hot_spring_patterns = [
        r"\bhot\s+spring(?:s)?\b",
        r"\bgeothermal\b",
        r"\bsoaking\s+pool(?:s)?\b",
        r"\bsoak(?:ing)?\b",
        r"\bmineral\s+(?:pool|pools|spring|springs|tubs?|profile)\b",
        r"\bcedar\s+tub(?:s)?\b",
        r"\bthermal\s+(?:spring|springs|soak|pool|pools)\b",
    ]

    has_hot_spring_keyword = any(re.search(pat, q_lower) for pat in hot_spring_patterns)

    # Named spring matching
    matched_spring_id: Optional[str] = None
    if "scenic" in q_lower:
        if (
            "scenic hot springs" in q_lower
            or "scenic-hot-springs" in q_lower
            or any(w in q_lower for w in ["spring", "soak", "tub", "pool", "water", "temperature", "permit"])
        ):
            matched_spring_id = "scenic-hot-springs"
            has_hot_spring_keyword = True
    if "goldmyer" in q_lower:
        matched_spring_id = "goldmyer-hot-springs"
        has_hot_spring_keyword = True
    elif "bagby" in q_lower:
        matched_spring_id = "bagby-hot-springs"
        has_hot_spring_keyword = True
    elif "travertine" in q_lower:
        matched_spring_id = "travertine-hot-springs"
        has_hot_spring_keyword = True
    elif "kirkham" in q_lower:
        matched_spring_id = "kirkham-hot-springs"
        has_hot_spring_keyword = True

    # Explicit ID check
    for sid in DEFAULT_HOT_SPRINGS:
        if sid in q_lower:
            matched_spring_id = sid
            has_hot_spring_keyword = True
            break

    # If no hot spring keywords or names detected, return None
    if not has_hot_spring_keyword:
        return None

    # CRITICAL DISAMBIGUATION:
    # Protect water filtration, campfire, weather, generic hiking trails
    # If the user did NOT mention a specific spring or explicit "hot spring" / "geothermal" / "soaking pool"
    # and only used the word "soak" as part of soaking wet or rain, return None.
    if not matched_spring_id and not any(
        re.search(pat, q_lower)
        for pat in [
            r"\bhot\s+spring(?:s)?\b",
            r"\bgeothermal\b",
            r"\bsoaking\s+pool(?:s)?\b",
            r"\bmineral\s+(?:pool|spring|tub)s?\b",
            r"\bsoaking\s+(?:plan|session|duration|rules|ethics|permit|etiquette)\b",
            r"\bcedar\s+tub(?:s)?\b",
        ]
    ):
        return None

    # Detect action
    if any(
        w in q_lower
        for w in [
            "gear",
            "packing",
            "pack",
            "booties",
            "towel",
            "dry bag",
            "waste bag",
            "ethics",
            "lnt",
            "leave no trace",
            "rules",
            "etiquette",
            "clothing optional etiquette",
        ]
    ):
        action = "gear_ethics"
    elif any(
        w in q_lower
        for w in [
            "soaking plan",
            "soak plan",
            "duration",
            "how long",
            "safe session",
            "session time",
            "temperature safety",
            "soak duration",
            "hydration",
            "electrolytes",
            "calculate",
            "hazard",
            "hazards",
            "heat exhaustion",
        ]
    ):
        action = "soaking_plan"
    elif matched_spring_id or any(
        w in q_lower
        for w in [
            "detail",
            "details",
            "tell me about",
            "permit",
            "access",
            "clothing optional",
            "swimwear",
            "fee",
            "cost",
            "winter access",
            "directions",
            "road access",
        ]
    ):
        action = "spring_detail"
    else:
        action = "springs_list"

    # Detect state
    state: Optional[str] = None
    if re.search(r"\b(?:wa|washington)\b", q_lower):
        state = "WA"
    elif re.search(r"\b(?:or|oregon)\b", q_lower):
        state = "OR"
    elif re.search(r"\b(?:ca|california)\b", q_lower):
        state = "CA"
    elif re.search(r"\b(?:id|idaho)\b", q_lower):
        state = "ID"

    # Detect access difficulty
    access_difficulty: Optional[str] = None
    if re.search(r"\b(?:easy[-_ ]walk|easy|walk[-_ ]in)\b", q_lower):
        access_difficulty = "easy_walk"
    elif re.search(r"\b(?:moderate[-_ ]hike|moderate)\b", q_lower):
        access_difficulty = "moderate_hike"
    elif re.search(r"\b(?:rugged[-_ ]backcountry|rugged|backcountry)\b", q_lower) and not re.search(
        r"\bbackcountry hot spring", q_lower
    ):
        access_difficulty = "rugged_backcountry"
    elif re.search(r"\b(?:river[-_ ]fording|ford)\b", q_lower):
        access_difficulty = "river_fording"
    elif re.search(r"\b(?:snowshoe[-_ ]winter|snowshoe)\b", q_lower):
        access_difficulty = "snowshoe_winter"

    return HotSpringIntent(
        action=action,
        spring_id=matched_spring_id,
        access_difficulty=access_difficulty,
        state=state,
    )


def build_hot_spring_prompt(intent: HotSpringIntent) -> str:
    lines = [
        "Contoso Outdoors Backcountry Hot Springs & Geothermal Soaking Advisory Grounding:",
        f"- Detected Intent Action: {intent.action.upper()}",
    ]

    if intent.spring_id:
        spring = get_hot_spring_by_id(intent.spring_id)
        if spring:
            lines.extend(
                [
                    f"- Featured Hot Spring: {spring.name} ({spring.region}, {spring.state}) [ID: {spring.spring_id}]",
                    f"  * Water Temperature: {spring.temperature_f}°F | Pool Type: {spring.pool_type} | Mineral Profile: {spring.mineral_profile}",
                    f"  * Trail Access: {spring.access_difficulty} ({spring.hike_distance_miles} miles, +{spring.elevation_gain_ft} ft elevation gain)",
                    f"  * Etiquette: {'Clothing Optional (respectful soaking)' if spring.clothing_optional else 'Swimwear Strictly Mandatory'}",
                    f"  * Access Requirements: {'Permit / fee required' if spring.fee_required else 'Free public access'}",
                    f"  * Winter Access: {'Available with proper winter gear' if spring.winter_access else 'Seasonal winter road closure'}",
                    f"  * Description: {spring.description}",
                    "  * Specific Rules:",
                    *[f"    - {r}" for r in spring.leave_no_trace_rules],
                ]
            )
    else:
        lines.append("- Backcountry Hot Springs Catalog:")
        for s in get_hot_springs(access=intent.access_difficulty, state=intent.state):
            lines.append(
                f"  * {s.name} [{s.spring_id}]: {s.state}, {s.temperature_f}°F, {s.pool_type}, {s.access_difficulty}, "
                f"{'clothing-optional' if s.clothing_optional else 'swimwear mandatory'}, "
                f"fee: {s.fee_required}, winter: {s.winter_access}"
            )

    lines.extend(
        [
            "",
            "- Mandatory Hot Springs Gear Requirements:",
            *[f"  * {g.name} [{g.category}]: {g.purpose}" for g in get_hot_spring_gear()],
            "",
            "- Geothermal Soaking Safety & Hydration Standards:",
            "  * Max safe session at >=115°F: 15 minutes; >=108°F: 20 minutes; >=104°F: 30 minutes; <104°F: 45 minutes.",
            "  * Hydration baseline: 1.0L cold water per person minimum, scaling 0.5L per 30 mins soaking (1.3x summer, 1.1x winter).",
            "  * Electrolytes: 300mg sodium/potassium per 30 mins soak to counter mineral bath sweat loss.",
            "  * Winter thermal transition: sub-freezing air causes rapid hypothermia; dry off and layer up within 60 seconds.",
            "",
            "- Leave No Trace Geothermal Ethics:",
            *[f"  - {rule}" for rule in LEAVE_NO_TRACE_ETHICS_RULES],
            "",
            "Assistant Guidance:",
            "- Ground answers directly in the spring specifications, temperature thresholds, and Leave No Trace ethics above.",
            "- Always emphasize water temperature safety, hydration, avoiding alcohol/glass, and clothing etiquette.",
        ]
    )

    return "\n".join(lines)


def format_hot_spring_response(intent: HotSpringIntent) -> dict[str, Any]:
    if intent.action == "gear_ethics":
        gear = get_hot_spring_gear()
        gear_summary = "; ".join(f"{g.name} ({g.purpose})" for g in gear)
        answer = (
            f"Mandatory Backcountry Hot Springs Gear & Leave No Trace Soaking Ethics: "
            f"All geothermal pool visitors should carry essential gear: {gear_summary}. "
            f"Always follow Leave No Trace: zero soaps or oils in natural pools, pack out 100% of trash, "
            f"and respect posted clothing etiquette."
        )
        return {
            "answer": answer,
            "hot_springs_info": {
                "action": "gear_ethics",
                "mandatory_gear": [g.model_dump() for g in gear],
                "gear": [g.model_dump() for g in gear],
                "leave_no_trace_rules": list(LEAVE_NO_TRACE_ETHICS_RULES),
                "ethics_rules": list(LEAVE_NO_TRACE_ETHICS_RULES),
            },
        }

    if intent.action == "soaking_plan":
        target_spring_id = intent.spring_id or "scenic-hot-springs"
        try:
            plan = calculate_soaking_plan(
                SoakingPlanRequest(
                    spring_id=target_spring_id,
                    party_size=2,
                    season="summer",
                    soak_duration_minutes=45,
                )
            )
            hazards_text = " ".join(plan.hazards) if plan.hazards else "No severe hazards detected."
            answer = (
                f"Geothermal Soaking Plan for {plan.spring_name}: Water temperature is {plan.temperature_f}°F. "
                f"Safe single session limit is {plan.safe_max_session_minutes} minutes. "
                f"Hydration requirement: {plan.hydration_liters_required}L cold water and "
                f"{plan.electrolytes_recommended_mg}mg electrolytes. Hazard warnings: {hazards_text}"
            )
            return {
                "answer": answer,
                "hot_springs_info": {
                    "action": "soaking_plan",
                    "spring_id": target_spring_id,
                    "soaking_plan": plan.model_dump(),
                },
            }
        except ValueError:
            pass

    if intent.action == "spring_detail" and intent.spring_id:
        spring = get_hot_spring_by_id(intent.spring_id)
        if spring:
            etiquette = "Clothing optional" if spring.clothing_optional else "Swimwear mandatory"
            winter = "Open in winter with snow gear" if spring.winter_access else "Closed in winter (no road access)"
            answer = (
                f"{spring.name} ({spring.region}, {spring.state}): Geothermal temperature {spring.temperature_f}°F. "
                f"Pool type: {spring.pool_type}. Mineral profile: {spring.mineral_profile}. "
                f"Access difficulty: {spring.access_difficulty} ({spring.hike_distance_miles} miles, +{spring.elevation_gain_ft} ft gain). "
                f"Etiquette: {etiquette}. Winter access: {winter}. {spring.description}"
            )
            return {
                "answer": answer,
                "hot_springs_info": {
                    "action": "spring_detail",
                    "spring_id": spring.spring_id,
                    "spring": spring.model_dump(),
                },
            }

    # Default to springs_list
    springs = get_hot_springs(access=intent.access_difficulty, state=intent.state)
    springs_summary = "; ".join(
        f"{s.name} ({s.state}, {s.temperature_f}°F, {s.access_difficulty}, {'clothing-optional' if s.clothing_optional else 'swimwear mandatory'})"
        for s in springs
    )
    answer = (
        f"Here are featured backcountry hot springs: {springs_summary}. "
        f"Select a spring for water temperature safety, soaking plans, required gear, or access regulations."
    )
    return {
        "answer": answer,
        "hot_springs_info": {
            "action": "springs_list",
            "access_difficulty": intent.access_difficulty,
            "state": intent.state,
            "springs": [s.model_dump() for s in springs],
        },
    }
