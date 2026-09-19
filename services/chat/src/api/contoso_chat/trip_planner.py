import re
from typing import Any, Optional

from pydantic import BaseModel


class TripPlanParametersModel(BaseModel):
    trip_type: Optional[str] = "backpacking"
    duration_days: int = 1
    group_size: int = 1
    climate: str = "moderate"
    terrain: Optional[str] = None


class ChecklistItemModel(BaseModel):
    item_id: str
    name: str
    category: str
    essential: bool
    weight_grams: int
    notes: Optional[str] = None


class TripPlanResultModel(BaseModel):
    trip_title: str
    duration_days: int
    group_size: int
    total_calories_kcal: int
    daily_calories_per_person: int
    daily_water_liters_per_person: float
    total_water_capacity_liters: float
    estimated_base_weight_kg: float
    checklist: list[ChecklistItemModel]


class TripPlannerIntent(BaseModel):
    action: str  # "plan", "checklist", "nutrition", "essentials"
    duration_days: Optional[int] = None
    climate: Optional[str] = None
    group_size: Optional[int] = None
    trip_type: Optional[str] = None
    terrain: Optional[str] = None


TRIP_TEMPLATES: list[dict[str, Any]] = [
    {
        "id": "weekend-backpacking",
        "name": "Weekend Backpacking Adventure",
        "trip_type": "backpacking",
        "duration_days": 2,
        "group_size": 2,
        "climate": "moderate",
        "terrain": "forest",
        "description": "2-day moderate backpacking route suitable for forested trails and temperate climates.",
        "recommended_daily_calories": 3000,
        "recommended_daily_water_liters": 3.0,
    },
    {
        "id": "alpine-expedition",
        "name": "Alpine Summit Expedition",
        "trip_type": "alpine",
        "duration_days": 3,
        "group_size": 2,
        "climate": "cold",
        "terrain": "alpine",
        "description": "3-day technical alpine expedition demanding 4-season shelter, crampons, and cold-weather nutrition.",
        "recommended_daily_calories": 3400,
        "recommended_daily_water_liters": 4.5,
    },
    {
        "id": "desert-trek",
        "name": "Desert Canyon Traverse",
        "trip_type": "desert-trek",
        "duration_days": 3,
        "group_size": 2,
        "climate": "desert",
        "terrain": "canyon",
        "description": "Arid canyon trekking with high water carrying capacity, electrolyte balancing, and sun coverage.",
        "recommended_daily_calories": 3000,
        "recommended_daily_water_liters": 4.5,
    },
    {
        "id": "winter-wilderness",
        "name": "Winter Snowshoe & Camp",
        "trip_type": "winter-camp",
        "duration_days": 2,
        "group_size": 2,
        "climate": "subzero snow",
        "terrain": "snow",
        "description": "Subzero winter camping with maximum caloric density (3,800 kcal/day), 4-season tent, and subzero sleeping system.",
        "recommended_daily_calories": 3800,
        "recommended_daily_water_liters": 3.0,
    },
]


def get_trip_templates() -> list[dict[str, Any]]:
    """Returns available wilderness trip templates and baseline configurations."""
    return [dict(t) for t in TRIP_TEMPLATES]


def generate_wilderness_trip_plan(params: TripPlanParametersModel) -> TripPlanResultModel:
    """Calculates nutritional requirements, water capacity, and tailored equipment checklists."""
    duration_days = max(1, params.duration_days)
    group_size = max(1, params.group_size)
    climate_norm = (params.climate or "moderate").strip().lower()
    terrain_norm = (params.terrain or "").strip().lower()
    combined_env = f"{climate_norm} {terrain_norm}"

    # Calorie calculations:
    # 3000 kcal/day/person moderate, 3400 cold, 3800 subzero snow
    is_subzero = any(k in combined_env for k in ["subzero", "snow", "extreme cold", "arctic"])
    is_cold = not is_subzero and any(k in combined_env for k in ["cold", "winter", "freezing"])

    if is_subzero:
        daily_calories = 3800
    elif is_cold:
        daily_calories = 3400
    else:
        daily_calories = 3000

    total_calories = daily_calories * duration_days * group_size

    # Water calculations:
    # 3.0 L/day/person forest/moderate, 4.5 L/day/person desert/alpine
    is_desert_or_alpine = any(k in combined_env for k in ["desert", "alpine", "arid", "canyon"])
    daily_water = 4.5 if is_desert_or_alpine else 3.0
    total_water_capacity = round(daily_water * group_size, 1)

    # Checklist generation
    checklist: list[ChecklistItemModel] = [
        ChecklistItemModel(
            item_id="nav-map-compass",
            name="Navigation: Topographic Map & Compass / GPS",
            category="Ten Essentials",
            essential=True,
            weight_grams=150,
            notes="Essential for route-finding, waypoint tracking, and orientation.",
        ),
        ChecklistItemModel(
            item_id="headlamp-led",
            name="Headlamp: LED Headlamp & Extra Batteries",
            category="Ten Essentials",
            essential=True,
            weight_grams=90,
            notes="Hands-free trail lighting with spare lithium batteries.",
        ),
        ChecklistItemModel(
            item_id="first-aid-kit",
            name="First Aid Kit: Wilderness Medical & Blister Kit",
            category="Ten Essentials",
            essential=True,
            weight_grams=280,
            notes="Bandages, antiseptic wipes, blister moleskin, and emergency medications.",
        ),
        ChecklistItemModel(
            item_id="knife-multitool",
            name="Knife / Multi-tool & Field Repair Tape",
            category="Ten Essentials",
            essential=True,
            weight_grams=140,
            notes="Locking blade knife, pliers, and heavy-duty duct tape wrap.",
        ),
        ChecklistItemModel(
            item_id="fire-starter",
            name="Fire Starter: Stormproof Matches & Spark Striker",
            category="Ten Essentials",
            essential=True,
            weight_grams=70,
            notes="Waterproof stormproof matches, ferrocerium rod, and tinder tabs.",
        ),
        ChecklistItemModel(
            item_id="emergency-bivvy",
            name="Emergency Shelter: Heat-Reflective Bivvy / Tarp",
            category="Ten Essentials",
            essential=True,
            weight_grams=120,
            notes="Ultralight emergency bivvy sack reflecting 90% radiated body heat.",
        ),
        ChecklistItemModel(
            item_id="extra-food-water",
            name="Extra Food & Water: High-Calorie Trail Rations (+1 Reserve Day)",
            category="Ten Essentials",
            essential=True,
            weight_grams=450,
            notes="Calorie-dense trail nuts, dehydrated meals, and backup hydration.",
        ),
        ChecklistItemModel(
            item_id="extra-layers",
            name="Extra Layers: Thermal Insulation Fleece & Hardshell",
            category="Ten Essentials",
            essential=True,
            weight_grams=420,
            notes="Breathable thermal mid-layer and windproof waterproof outer shell.",
        ),
        ChecklistItemModel(
            item_id="sun-protection",
            name="Sun Protection: Polarized Sunglasses & SPF 50+ Sunscreen",
            category="Ten Essentials",
            essential=True,
            weight_grams=110,
            notes="UV protection sunglasses, SPF 50 broad-spectrum sunscreen, and sun lip balm.",
        ),
    ]

    # Shelter & sleep
    if is_subzero or is_cold:
        checklist.append(
            ChecklistItemModel(
                item_id="shelter-4season",
                name="4-Season Mountaineering Geodesic Tent",
                category="Shelter & Sleep",
                essential=True,
                weight_grams=2900,
                notes="Heavy-duty reinforced 4-season tent designed to withstand gale winds and snow loads.",
            )
        )
    else:
        checklist.append(
            ChecklistItemModel(
                item_id="shelter-tent",
                name="Ultralight 3-Season Backpacking Tent",
                category="Shelter & Sleep",
                essential=True,
                weight_grams=1650,
                notes="Double-wall freestanding tent with seam-taped rainfly and vestibule storage.",
            )
        )

    if is_subzero:
        checklist.append(
            ChecklistItemModel(
                item_id="sleep-subzero-bag",
                name="Subzero Sleeping Bag (-20°F) & Thermal Insulated Pad",
                category="Shelter & Sleep",
                essential=True,
                weight_grams=1850,
                notes="800-fill down sleeping bag rated to -20°F paired with an R-value 5.5+ insulated pad.",
            )
        )
    elif is_cold:
        checklist.append(
            ChecklistItemModel(
                item_id="sleep-cold-bag",
                name="Cold-Weather Sleeping Bag (0°F) & Insulated Thermal Pad",
                category="Shelter & Sleep",
                essential=True,
                weight_grams=1450,
                notes="High-loft mummy bag rated to 0°F with an R-value 4.0+ sleeping pad.",
            )
        )
    else:
        checklist.append(
            ChecklistItemModel(
                item_id="sleep-3season-bag",
                name="3-Season Sleeping Bag (20°F) & Compact Inflatable Pad",
                category="Shelter & Sleep",
                essential=True,
                weight_grams=1150,
                notes="Compact down sleeping bag rated to 20°F with lightweight inflatable pad.",
            )
        )

    # Kitchen & hydration
    checklist.append(
        ChecklistItemModel(
            item_id="water-filtration",
            name="Backcountry Water Filtration System",
            category="Kitchen & Hydration",
            essential=True,
            weight_grams=260,
            notes="Hollow-fiber 0.1-micron filtration system for removing protozoa and bacteria.",
        )
    )

    if is_subzero or is_cold:
        checklist.append(
            ChecklistItemModel(
                item_id="stove-liquid-fuel",
                name="Liquid Fuel Expedition Stove & White Gas Bottle",
                category="Kitchen & Hydration",
                essential=True,
                weight_grams=580,
                notes="Liquid fuel stove delivering reliable high-output flame for snow melting in subfreezing weather.",
            )
        )
    else:
        checklist.append(
            ChecklistItemModel(
                item_id="stove-canister",
                name="Backpacking Canister Stove & Titanium Cook Pot",
                category="Kitchen & Hydration",
                essential=True,
                weight_grams=350,
                notes="Fast-boil isobutane canister stove with nested lightweight cook pot.",
            )
        )

    # Climate/Terrain specifics
    if is_subzero or is_cold:
        checklist.append(
            ChecklistItemModel(
                item_id="winter-traction-crampons",
                name="Microspikes / Crampons & Traction System",
                category="Winter & Alpine",
                essential=True,
                weight_grams=450,
                notes="Hardened stainless steel spikes for icy trail inclines and hardpack snow.",
            )
        )
        checklist.append(
            ChecklistItemModel(
                item_id="winter-thermal-mitts",
                name="Insulated Waterproof Winter Mittens & Thermal Balaclava",
                category="Winter & Alpine",
                essential=True,
                weight_grams=280,
                notes="Heavyweight insulated mittens with gauntlets and fleece balaclava for frostbite prevention.",
            )
        )

    if any(k in combined_env for k in ["desert", "arid", "canyon"]):
        checklist.append(
            ChecklistItemModel(
                item_id="desert-hydration-reservoir",
                name="High-Capacity Hydration Reservoir Bladder (4.5L+)",
                category="Desert & Hydration",
                essential=True,
                weight_grams=230,
                notes="High-volume hydration reservoir with insulated drink tube to meet 4.5L/day desert demands.",
            )
        )
        checklist.append(
            ChecklistItemModel(
                item_id="desert-electrolyte-replenishment",
                name="Electrolyte Replenishment Drink Tablets / Salts",
                category="Desert & Hydration",
                essential=True,
                weight_grams=120,
                notes="Balanced electrolytes with sodium and potassium to prevent heat cramps and hyponatremia.",
            )
        )
        checklist.append(
            ChecklistItemModel(
                item_id="desert-sun-hat-cape",
                name="Wide-Brim Sun Hat with Protective Neck Cape",
                category="Desert & Sun",
                essential=True,
                weight_grams=95,
                notes="Broad-brim ventilated hat with UV flap shielding the neck from direct desert sun.",
            )
        )

    if any(k in combined_env for k in ["alpine", "summit", "mountaineering"]):
        checklist.append(
            ChecklistItemModel(
                item_id="alpine-climbing-helmet",
                name="Alpine Mountaineering Helmet",
                category="Alpine & Climbing",
                essential=True,
                weight_grams=310,
                notes="Certified protective helmet against rockfall and steep mountain terrain hazards.",
            )
        )

    base_weight_kg = round(sum(i.weight_grams for i in checklist) / 1000.0, 1)
    trip_type_title = (params.trip_type or "Backpacking").replace("-", " ").title()
    climate_title = params.climate.capitalize()
    trip_title = f"{duration_days}-Day {trip_type_title} Plan ({climate_title} Climate)"

    return TripPlanResultModel(
        trip_title=trip_title,
        duration_days=duration_days,
        group_size=group_size,
        total_calories_kcal=total_calories,
        daily_calories_per_person=daily_calories,
        daily_water_liters_per_person=daily_water,
        total_water_capacity_liters=total_water_capacity,
        estimated_base_weight_kg=base_weight_kg,
        checklist=checklist,
    )


def detect_trip_planner_intent(query: str) -> Optional[TripPlannerIntent]:
    """Analyzes a customer query to detect trip planning, packing lists, calorie/water calculations,
    and Ten Essentials inquiries.
    """
    if not isinstance(query, str) or not query.strip():
        return None

    cleaned = query.strip()
    cleaned_lower = cleaned.lower()

    # Exclude non-planner inquiries (order tracking, store hours, returns)
    if re.search(r"\b(?:ctso-[\w\d]+|order(?:\s+status|\s+number|\s+#)?)\b", cleaned_lower):
        if not re.search(r"\b(?:plan|packing|calorie|essentials|water\s+capacity)\b", cleaned_lower):
            return None

    if re.search(r"\b(?:store\s+hours?|retail\s+store\s+hours?|when\s+do\s+you\s+open)\b", cleaned_lower):
        return None

    if re.search(r"\b(?:return\s+my|return\s+label|refund|exchange)\b", cleaned_lower):
        return None

    # Keywords that suggest trip planning, packing, nutrition, or essentials
    planner_patterns = [
        r"\bplan\s+(?:a\s+)?(?:\d+[- ]day\s+)?(?:\w+\s+)*(?:trip|backpacking|hike|trek|camp|expedition)\b",
        r"\btrip\s+plan(?:ning)?\b",
        r"\bwilderness\s+trip\b",
        r"\bplan(?:ning)?\s+(?:a\s+|our\s+|my\s+)?(?:trip|backpacking|trek)\b",
        r"\b(?:ten|10)\s+essentials\b",
        r"\bcalories?\b",
        r"\bkcal\b",
        r"\bcalorie\s+needs?\b",
        r"\bcalorie\s+calculation\b",
        r"\bwater\s+(?:carrying\s+)?capacity\b",
        r"\bpacking\s+(?:list|checklist)\b",
        r"\bgear\s+checklist\b",
        r"\bequipment\s+packing\b",
        r"\bwinter\s+(?:vs|and)\s+desert\s+gear\b",
        r"\bcold\s+weather\s+gear\b",
        r"\bdesert\s+hiking\b",
    ]

    has_planner_signal = any(re.search(pat, cleaned_lower) for pat in planner_patterns)
    if not has_planner_signal:
        return None

    # If the query is specifically a trail conditions lookup on a known trail (e.g., Bear Peak or Rattlesnake),
    # let trails module handle it unless calories or trip plan or water capacity is requested
    known_trails = ["rattlesnake", "bear peak", "multnomah", "mount olympus"]
    is_known_trail_query = any(t in cleaned_lower for t in known_trails)
    has_deep_planner_signal = any(
        re.search(p, cleaned_lower)
        for p in [
            r"\bcalories?\b",
            r"\bkcal\b",
            r"\bwater\s+capacity\b",
            r"\btrip\s+plan(?:ning)?\b",
            r"\bplan\s+a\s+\d+[- ]day\b",
            r"\b(?:ten|10)\s+essentials\b",
        ]
    )
    if is_known_trail_query and not has_deep_planner_signal:
        return None

    # If it's "outfitting packing checklist" without planner/calorie/water/essentials keywords,
    # let trail outfitting handle it
    if "outfitting" in cleaned_lower and not has_deep_planner_signal:
        return None

    # Determine action
    action = "plan"
    if re.search(r"\b(?:ten|10)\s+essentials\b", cleaned_lower):
        action = "essentials"
    elif re.search(r"\b(?:calories?|kcal|calorie\s+needs?|water\s+capacity|daily\s+water)\b", cleaned_lower):
        if re.search(r"\b(?:plan\s+a|trip\s+plan)\b", cleaned_lower):
            action = "plan"
        else:
            action = "nutrition"
    elif re.search(r"\b(?:packing\s+list|packing\s+checklist|gear\s+checklist|what\s+gear)\b", cleaned_lower):
        if re.search(r"\b(?:plan\s+a|trip\s+plan)\b", cleaned_lower):
            action = "plan"
        else:
            action = "checklist"
    else:
        action = "plan"

    # Extract duration_days
    duration_days: Optional[int] = None
    day_match = re.search(r"(\d+)[- ]day", cleaned_lower) or re.search(r"(\d+)\s+days", cleaned_lower)
    if day_match:
        duration_days = int(day_match.group(1))
    elif "weekend" in cleaned_lower:
        duration_days = 2

    # Extract group_size
    group_size: Optional[int] = None
    group_match = (
        re.search(r"(\d+)\s+people", cleaned_lower)
        or re.search(r"(\d+)[- ]person", cleaned_lower)
        or re.search(r"party of (\d+)", cleaned_lower)
        or re.search(r"group of (\d+)", cleaned_lower)
    )
    if group_match:
        group_size = int(group_match.group(1))
    elif "solo" in cleaned_lower:
        group_size = 1
    elif "couple" in cleaned_lower or "pair" in cleaned_lower:
        group_size = 2

    # Extract climate & terrain
    climate: Optional[str] = None
    terrain: Optional[str] = None

    if re.search(r"\b(?:subzero|snow|arctic|blizzard)\b", cleaned_lower):
        climate = "subzero snow"
        terrain = "snow"
    elif re.search(r"\b(?:cold|winter|freezing)\b", cleaned_lower):
        climate = "cold"
    elif re.search(r"\b(?:desert|arid|canyon)\b", cleaned_lower):
        climate = "desert"
        terrain = "canyon"
    elif re.search(r"\b(?:alpine|summit|mountaineering)\b", cleaned_lower):
        climate = "alpine"
        terrain = "alpine"
    elif re.search(r"\b(?:cascades?|pacific\s+northwest|forest|woods|temperate|moderate)\b", cleaned_lower):
        climate = "moderate"
        terrain = "forest"

    # Extract trip_type
    trip_type: Optional[str] = None
    if "backpacking" in cleaned_lower or "backpack" in cleaned_lower:
        trip_type = "backpacking"
    elif "alpine" in cleaned_lower or "mountaineering" in cleaned_lower:
        trip_type = "alpine"
    elif "desert" in cleaned_lower:
        trip_type = "desert-trek"
    elif "winter" in cleaned_lower:
        trip_type = "winter-camp"
    elif "hiking" in cleaned_lower or "hike" in cleaned_lower:
        trip_type = "hiking"

    return TripPlannerIntent(
        action=action,
        duration_days=duration_days,
        climate=climate,
        group_size=group_size,
        trip_type=trip_type,
        terrain=terrain,
    )


def build_trip_planner_prompt(intent: TripPlannerIntent) -> str:
    """Builds LLM grounding context for wilderness trip planning, packing lists, and nutrition rules."""
    params = TripPlanParametersModel(
        duration_days=intent.duration_days or 3,
        group_size=intent.group_size or 1,
        climate=intent.climate or "moderate",
        trip_type=intent.trip_type or "backpacking",
        terrain=intent.terrain,
    )
    plan = generate_wilderness_trip_plan(params)

    lines = [
        "Contoso Outdoors Wilderness Trip Planning & Equipment Advisor Grounding:",
        f"- Trip Plan: {plan.trip_title}",
        f"- Action Intent: {intent.action.upper()}",
        f"- Duration: {plan.duration_days} day(s) | Group Size: {plan.group_size} person(s) | Climate: {params.climate.capitalize()}",
        f"- Caloric Target: {plan.daily_calories_per_person:,} kcal/day/person ({plan.total_calories_kcal:,} kcal total for trip)",
        f"- Hydration Capacity: {plan.daily_water_liters_per_person} L/day/person (Recommended group carrying capacity: {plan.total_water_capacity_liters} L)",
        f"- Estimated Gear Base Weight: {plan.estimated_base_weight_kg} kg",
        "",
        "- Ten Essentials & Tailored Equipment Checklist:",
    ]
    for item in plan.checklist:
        ess_str = "[ESSENTIAL]" if item.essential else "[RECOMMENDED]"
        lines.append(f"  * {ess_str} {item.name} ({item.category}, ~{item.weight_grams}g): {item.notes}")

    lines.extend([
        "",
        "Instructions for Assistant:",
        "- Ground your answer strictly in Contoso Outdoors trip planning guidelines above.",
        "- Emphasize proper nutrition: 3,000 kcal/day for moderate, 3,400 kcal/day for cold, 3,800 kcal/day for subzero snow.",
        "- Emphasize hydration carrying capacity: 3.0 L/day for moderate/forest, 4.5 L/day for desert/alpine.",
        "- Always reference the Ten Essentials and climate-specific equipment (e.g. 4-season shelter & crampons for cold, high-capacity reservoir & electrolytes for desert).",
        "- Maintain an authoritative, safety-focused, and encouraging backcountry expert tone.",
    ])

    return "\n".join(lines)


def format_trip_planner_response(intent: TripPlannerIntent) -> dict[str, Any]:
    """Generates structured trip_planner_info payload and comprehensive human-readable answer."""
    # Determine defaults based on query context
    duration = intent.duration_days or (3 if intent.action == "plan" else 1)
    group = intent.group_size or 1
    climate = intent.climate or "moderate"
    trip_type = intent.trip_type or "backpacking"

    params = TripPlanParametersModel(
        duration_days=duration,
        group_size=group,
        climate=climate,
        trip_type=trip_type,
        terrain=intent.terrain,
    )
    plan = generate_wilderness_trip_plan(params)

    # Format human-readable response based on intent action
    if intent.action == "nutrition":
        answer = (
            f"For your {plan.trip_title}, each person requires approximately {plan.daily_calories_per_person:,} kcal/day "
            f"(totaling {plan.total_calories_kcal:,} kcal for your party of {plan.group_size} over {plan.duration_days} days). "
            f"Your daily water carrying capacity should be at least {plan.daily_water_liters_per_person} liters per person "
            f"({plan.total_water_capacity_liters} L total group capacity), supplemented by electrolyte replacement and backcountry water filtration."
        )
    elif intent.action == "essentials":
        essentials_list = [item.name for item in plan.checklist if item.category == "Ten Essentials"]
        answer = (
            f"Here are the Ten Essentials every outdoor adventurer must carry for backcountry safety: "
            f"{'; '.join(essentials_list)}. "
            f"In addition, for {params.climate} conditions, ensure you carry {plan.daily_water_liters_per_person}L of water capacity "
            f"and target {plan.daily_calories_per_person:,} kcal/day/person."
        )
    elif intent.action == "checklist":
        key_gear = [item.name for item in plan.checklist[:8]]
        answer = (
            f"Here is your customized gear checklist for a {plan.trip_title} (Estimated base weight: {plan.estimated_base_weight_kg} kg): "
            f"Key equipment includes: {'; '.join(key_gear)}. "
            f"Ensure you pack {plan.daily_water_liters_per_person} L/day/person water capacity and {plan.daily_calories_per_person:,} kcal/day/person of high-energy trail food."
        )
    else:  # plan
        answer = (
            f"Here is your comprehensive wilderness trip plan for a {plan.trip_title}: "
            f"Nutrition: Target {plan.daily_calories_per_person:,} kcal/day/person (total {plan.total_calories_kcal:,} kcal for {plan.group_size} person(s)). "
            f"Hydration: Maintain a minimum water capacity of {plan.daily_water_liters_per_person} L/day/person ({plan.total_water_capacity_liters} L total capacity). "
            f"Equipment: Estimated base weight is {plan.estimated_base_weight_kg} kg across {len(plan.checklist)} checklist items, "
            f"including all Ten Essentials, shelter, sleep system, and climate-specific protection."
        )

    trip_planner_info: dict[str, Any] = {
        "action": intent.action,
        "trip_title": plan.trip_title,
        "duration_days": plan.duration_days,
        "group_size": plan.group_size,
        "climate": params.climate,
        "total_calories_kcal": plan.total_calories_kcal,
        "daily_calories_per_person": plan.daily_calories_per_person,
        "daily_water_liters_per_person": plan.daily_water_liters_per_person,
        "total_water_capacity_liters": plan.total_water_capacity_liters,
        "estimated_base_weight_kg": plan.estimated_base_weight_kg,
        "checklist": [item.model_dump() for item in plan.checklist],
        "trip_plan": plan.model_dump(),
        "parameters": params.model_dump(),
    }

    return {
        "answer": answer,
        "trip_planner_info": trip_planner_info,
    }
