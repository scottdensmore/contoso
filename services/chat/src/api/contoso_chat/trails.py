import re
from typing import Any, Optional

from pydantic import BaseModel


class TrailCondition(BaseModel):
    id: str
    name: str
    region: str
    difficulty: str
    distance_miles: float
    elevation_gain_ft: int
    status: str  # "open", "caution", "closed"
    condition: str
    temperature_f: int
    advisory: Optional[str] = None
    essential_gear: list[str]


class TrailOutfittingRequest(BaseModel):
    trail_name: Optional[str] = None
    activity: str = "day-hiking"
    season: Optional[str] = "spring"


class TrailOutfittingResponse(BaseModel):
    trail: Optional[TrailCondition] = None
    activity: str
    season: str
    gear_checklist: list[str]
    safety_tips: list[str]
    weather_advisory: Optional[str] = None


class TrailIntent(BaseModel):
    action: str  # "conditions", "outfitting", "recommendation", "safety"
    trail_name: Optional[str] = None
    activity: Optional[str] = None
    season: Optional[str] = None
    region: Optional[str] = None


TRAIL_DATABASE: dict[str, TrailCondition] = {
    "rattlesnake-ridge": TrailCondition(
        id="rattlesnake-ridge",
        name="Rattlesnake Ridge Trail",
        region="Pacific Northwest (Seattle)",
        difficulty="moderate",
        distance_miles=4.0,
        elevation_gain_ft=1160,
        status="open",
        condition="Partly Cloudy",
        temperature_f=58,
        advisory=None,
        essential_gear=[
            "Trekking poles",
            "Trail running shoes",
            "Hydration pack",
            "Light rain shell",
        ],
    ),
    "bear-peak": TrailCondition(
        id="bear-peak",
        name="Bear Peak Summit",
        region="Rocky Mountains (Denver)",
        difficulty="hard",
        distance_miles=5.7,
        elevation_gain_ft=2900,
        status="open",
        condition="Breezy",
        temperature_f=45,
        advisory=None,
        essential_gear=[
            "Insulated windbreaker",
            "Sturdy hiking boots",
            "Electrolyte drink",
            "Topographic map",
        ],
    ),
    "multnomah-loop": TrailCondition(
        id="multnomah-loop",
        name="Multnomah-Wahkeena Loop",
        region="Pacific Northwest (Portland)",
        difficulty="moderate",
        distance_miles=4.9,
        elevation_gain_ft=1600,
        status="caution",
        condition="Light Rain",
        temperature_f=54,
        advisory="Slick rock surfaces near waterfalls spray",
        essential_gear=[
            "Waterproof rain jacket",
            "Grip traction footwear",
            "Dry bag",
        ],
    ),
    "mount-olympus": TrailCondition(
        id="mount-olympus",
        name="Mount Olympus Trail",
        region="Wasatch Range (Salt Lake City)",
        difficulty="hard",
        distance_miles=7.5,
        elevation_gain_ft=4100,
        status="open",
        condition="Sunny",
        temperature_f=62,
        advisory=None,
        essential_gear=[
            "UV protection sun hoodie",
            "3L water bladder",
            "Sunscreen SPF 50",
            "High-calorie energy chews",
        ],
    ),
}

TRAIL_NAME_ALIASES: dict[str, list[str]] = {
    "rattlesnake-ridge": [
        "rattlesnake ridge",
        "rattlesnake-ridge",
        "rattlesnake",
    ],
    "bear-peak": [
        "bear peak summit",
        "bear peak",
        "bear-peak",
    ],
    "multnomah-loop": [
        "multnomah-wahkeena loop",
        "multnomah-wahkeena",
        "multnomah loop",
        "multnomah falls",
        "multnomah",
        "wahkeena",
    ],
    "mount-olympus": [
        "mount olympus trail",
        "mount olympus",
        "mt olympus",
        "mt. olympus",
        "mount-olympus",
        "olympus",
    ],
}

TEN_ESSENTIALS: list[str] = [
    "Navigation: Topographic map, compass, or GPS device",
    "Headlamp / Flashlight with extra batteries",
    "Sun protection: Sunglasses, broad-spectrum sunscreen (SPF 30+), and sun hat",
    "First aid kit: Bandages, antiseptic wipes, blister moleskin, and medications",
    "Multi-tool / Pocket knife and duct tape gear repair kit",
    "Fire starter: Waterproof matches or compact windproof lighter",
    "Emergency shelter: Ultralight space blanket or emergency bivvy",
    "Extra nutrition: High-calorie trail snacks and energy bars",
    "Extra hydration: Hydration bladder or water bottles (minimum 2L)",
    "Weather-appropriate extra clothing layers",
]

SEASONAL_LAYERS: dict[str, list[str]] = {
    "spring": [
        "Moisture-wicking synthetic or merino base layer",
        "Insulating mid-layer fleece jacket",
        "Lightweight waterproof and windproof rain shell",
    ],
    "summer": [
        "Breathable lightweight moisture-wicking sun hoodie",
        "UV protection trail hat and polarized eyewear",
        "Compact wind shell for summit winds",
    ],
    "fall": [
        "Thermal merino wool base layer",
        "Insulated fleece or packable down mid-layer",
        "Durable windproof and water-resistant outer jacket",
    ],
    "winter": [
        "Heavyweight thermal wool base layer top and bottoms",
        "Packable 800-fill down insulating jacket",
        "Waterproof breathable hardshell jacket and pants",
        "Insulated winter gloves, neck gaiter, and thermal beanie",
    ],
}

ACTIVITY_GEAR: dict[str, list[str]] = {
    "day-hiking": [
        "Comfortable 20-30L daypack",
        "Trekking poles",
        "Supportive trail running shoes or hiking boots",
    ],
    "backpacking": [
        "Multi-day internal frame backpack (50-65L)",
        "Ultralight 3-season tent with ground footprint",
        "Down sleeping bag and insulated sleeping pad",
        "Backpacking canister stove, cook pot, and fuel",
        "Backcountry water filtration system",
    ],
    "alpine": [
        "Stiff-soled mountaineering boots",
        "Climbing helmet",
        "Trekking poles with snow baskets",
        "Traction microspikes or crampons",
    ],
    "desert": [
        "Wide-brim sun hat with neck cape",
        "Electrolyte replacement drink mix",
        "High-capacity hydration reservoir (3-4L)",
        "Lightweight loose long-sleeve sun coverage",
    ],
}


def get_trails(
    region: Optional[str] = None,
    difficulty: Optional[str] = None,
) -> list[TrailCondition]:
    """Returns copies of trails matching optional region and difficulty filters."""
    results: list[TrailCondition] = []
    for trail in TRAIL_DATABASE.values():
        if region:
            reg_norm = region.strip().lower()
            if reg_norm not in trail.region.lower():
                continue
        if difficulty:
            diff_norm = difficulty.strip().lower()
            if diff_norm != trail.difficulty.lower() and diff_norm not in trail.difficulty.lower():
                continue
        results.append(trail.model_copy(deep=True))
    return results


def get_trail_by_name(query: str) -> Optional[TrailCondition]:
    """Looks up a trail by exact id, name, or alias."""
    if not isinstance(query, str) or not query.strip():
        return None
    normalized = query.strip().lower()

    if normalized in TRAIL_DATABASE:
        return TRAIL_DATABASE[normalized].model_copy(deep=True)

    for trail_id, aliases in TRAIL_NAME_ALIASES.items():
        for alias in aliases:
            if alias in normalized or normalized in alias:
                return TRAIL_DATABASE[trail_id].model_copy(deep=True)

    for trail_id, trail in TRAIL_DATABASE.items():
        if normalized in trail.name.lower() or trail.name.lower() in normalized:
            return trail.model_copy(deep=True)

    return None


def generate_outfitting_plan(
    trail_name: Optional[str] = None,
    activity: str = "day-hiking",
    season: Optional[str] = "spring",
) -> TrailOutfittingResponse:
    """Generates an outfitting packing checklist, safety tips, and weather advisories."""
    trail = get_trail_by_name(trail_name) if trail_name else None

    norm_activity = activity.strip().lower() if activity else "day-hiking"
    if "backpack" in norm_activity:
        norm_activity = "backpacking"
    elif "alpine" in norm_activity or "summit" in norm_activity:
        norm_activity = "alpine"
    elif "desert" in norm_activity:
        norm_activity = "desert"
    else:
        norm_activity = "day-hiking"

    norm_season = season.strip().lower() if season else "spring"
    if "summer" in norm_season:
        norm_season = "summer"
    elif "fall" in norm_season or "autumn" in norm_season:
        norm_season = "fall"
    elif "winter" in norm_season or "snow" in norm_season:
        norm_season = "winter"
    else:
        norm_season = "spring"

    checklist: list[str] = list(TEN_ESSENTIALS)

    layers = SEASONAL_LAYERS.get(norm_season, SEASONAL_LAYERS["spring"])
    for layer in layers:
        if layer not in checklist:
            checklist.append(layer)

    act_gear = ACTIVITY_GEAR.get(norm_activity, ACTIVITY_GEAR["day-hiking"])
    for gear in act_gear:
        if gear not in checklist:
            checklist.append(gear)

    if trail:
        for tg in trail.essential_gear:
            if not any(tg.lower() in item.lower() for item in checklist):
                checklist.append(tg)

    safety_tips: list[str] = [
        "Share your hiking itinerary, route, and expected return time with a trusted emergency contact.",
        "Stay strictly on marked trails to protect native flora and prevent hazardous falls.",
    ]

    if norm_activity == "day-hiking":
        safety_tips.append("Pace your ascent steadily and allocate plenty of daylight for the descent.")
    elif norm_activity == "backpacking":
        safety_tips.append("Store all food and scented toiletries securely in bear canisters where mandated.")
    elif norm_activity == "alpine":
        safety_tips.append("Monitor high-altitude weather changes closely; turn around if storms or whiteouts threaten.")
    elif norm_activity == "desert":
        safety_tips.append("Hike during early morning hours and drink fluids with electrolytes before feeling thirsty.")

    if norm_season == "spring":
        safety_tips.append("Expect muddy trail sections, runoff crossings, and lingering cold wind at higher elevations.")
    elif norm_season == "summer":
        safety_tips.append("Protect against heat exhaustion and high UV exposure with frequent shade breaks and hydration.")
    elif norm_season == "fall":
        safety_tips.append("Be aware of shorter daylight hours and slippery damp leaves on rocky slopes.")
    elif norm_season == "winter":
        safety_tips.append("Watch for hidden ice patches, hypothermia symptoms, and avalanche risks on steep slopes.")

    weather_advisory: Optional[str] = None
    if trail:
        if trail.advisory:
            weather_advisory = f"{trail.condition}, {trail.temperature_f}°F — Advisory: {trail.advisory}"
            safety_tips.append(f"Trail Advisory: {trail.advisory}")
        else:
            weather_advisory = f"{trail.condition}, {trail.temperature_f}°F"

        if trail.status == "caution" or (trail.advisory and "slick" in trail.advisory.lower()):
            safety_tips.append(
                "Exercise heightened caution near wet rock surfaces and waterfall spray; "
                "wear footwear with high-traction rubber grip."
            )
    else:
        weather_advisory = (
            f"Seasonal {norm_season.capitalize()} weather advisory: "
            "Be prepared for changing temperatures and sudden precipitation."
        )

    return TrailOutfittingResponse(
        trail=trail,
        activity=norm_activity,
        season=norm_season,
        gear_checklist=checklist,
        safety_tips=safety_tips,
        weather_advisory=weather_advisory,
    )


def detect_trail_intent(query: str) -> Optional[TrailIntent]:
    """Analyzes a customer query to detect trail inquiries, outfitting requests, and safety concerns."""
    if not isinstance(query, str) or not query.strip():
        return None

    cleaned = query.strip()
    cleaned_lower = cleaned.lower()

    # Exclude product-only queries like "What tents do you recommend for backpacking?"
    product_keywords = [
        r"\btents?\b",
        r"\bsleeping\s+bags?\b",
        r"\bboots?\b",
        r"\bshoes?\b",
        r"\bjackets?\b",
        r"\bpants?\b",
        r"\bstoves?\b",
        r"\bbackpacks?\b",
    ]
    has_trail_explicit = any(
        re.search(pat, cleaned_lower)
        for pat in [
            r"\btrails?\b",
            r"\bhikes?\b",
            r"\bhiking\b",
            r"\bsummit\b",
            r"\btrail\s+conditions?\b",
            r"\bpacking\s+checklist\b",
            r"\boutfitting\b",
            r"\btrail\s+status\b",
            r"\btrailhead\b",
        ]
    )

    matched_trail_id: Optional[str] = None
    for trail_id, aliases in TRAIL_NAME_ALIASES.items():
        for alias in aliases:
            if re.search(r"\b" + re.escape(alias) + r"\b", cleaned_lower):
                matched_trail_id = trail_id
                break
        if matched_trail_id:
            break

    is_product_query = any(re.search(pat, cleaned_lower) for pat in product_keywords)
    if is_product_query and not has_trail_explicit and not matched_trail_id:
        return None

    trail_keywords = [
        r"\btrails?\b",
        r"\bhikes?\b",
        r"\bhiking\b",
        r"\bbackpacking\b",
        r"\bsummit\b",
        r"\btrail\s+conditions?\b",
        r"\bpacking\s+checklist\b",
        r"\boutfitting(?:\s+guide)?\b",
        r"\btrail\s+status\b",
        r"\btrailhead\b",
        r"\boutfitting\b",
    ]

    has_keyword = any(re.search(pat, cleaned_lower) for pat in trail_keywords)

    if not has_keyword and not matched_trail_id:
        return None

    action: str = "recommendation"
    if re.search(r"\b(?:safety|precautions?|advisories|advisory|hazards?|slick|danger|dangerous)\b", cleaned_lower):
        action = "safety"
    elif re.search(r"\b(?:pack|packing|gear|checklist|outfitting|equipment|wear|bring)\b", cleaned_lower):
        action = "outfitting"
    elif re.search(r"\b(?:recommend|recommendations?|popular|suggest|suggestions?|best|top|favorite)\b", cleaned_lower):
        action = "recommendation"
    elif re.search(r"\b(?:conditions?|status|weather|temp|temperature|open|closed|caution)\b", cleaned_lower):
        action = "conditions"
    else:
        action = "recommendation"

    matched_activity: Optional[str] = None
    if re.search(r"\bbackpacking\b", cleaned_lower):
        matched_activity = "backpacking"
    elif re.search(r"\b(?:alpine|summit|mountaineering)\b", cleaned_lower):
        matched_activity = "alpine"
    elif re.search(r"\b(?:desert|canyon)\b", cleaned_lower):
        matched_activity = "desert"
    elif re.search(r"\b(?:day[- ]hiking|day[- ]hike|hiking|hike)\b", cleaned_lower):
        matched_activity = "day-hiking"

    matched_season: Optional[str] = None
    if re.search(r"\bspring\b", cleaned_lower):
        matched_season = "spring"
    elif re.search(r"\bsummer\b", cleaned_lower):
        matched_season = "summer"
    elif re.search(r"\b(?:fall|autumn)\b", cleaned_lower):
        matched_season = "fall"
    elif re.search(r"\b(?:winter|snow)\b", cleaned_lower):
        matched_season = "winter"

    matched_region: Optional[str] = None
    if re.search(r"\b(?:seattle|washington|pnw|pacific\s+northwest)\b", cleaned_lower):
        matched_region = "Pacific Northwest (Seattle)"
    elif re.search(r"\b(?:denver|colorado|rocky\s+mountains?|rockies)\b", cleaned_lower):
        matched_region = "Rocky Mountains (Denver)"
    elif re.search(r"\b(?:portland|oregon)\b", cleaned_lower):
        matched_region = "Pacific Northwest (Portland)"
    elif re.search(r"\b(?:salt\s+lake(?:\s+city)?|utah|wasatch)\b", cleaned_lower):
        matched_region = "Wasatch Range (Salt Lake City)"

    return TrailIntent(
        action=action,
        trail_name=matched_trail_id,
        activity=matched_activity,
        season=matched_season,
        region=matched_region,
    )


def build_trail_prompt(
    intent: TrailIntent,
    outfitting: Optional[TrailOutfittingResponse] = None,
) -> str:
    """Builds helpful grounding context for LLM prompt injection with trail conditions,
    weather advisories, and gear recommendations.
    """
    lines = [
        "Contoso Outdoors Official Trail Conditions & Outfitting Advisory Grounding:",
        f"- Detected Intent Action: {intent.action.upper()}",
    ]

    trail = outfitting.trail if (outfitting and outfitting.trail) else (
        get_trail_by_name(intent.trail_name) if intent.trail_name else None
    )

    if trail:
        lines.append(f"- Matched Trail: {trail.name} ({trail.region})")
        lines.append(f"  * Status: {trail.status.capitalize()}")
        lines.append(f"  * Difficulty: {trail.difficulty.capitalize()} | Distance: {trail.distance_miles} miles | Elevation Gain: {trail.elevation_gain_ft} ft")
        lines.append(f"  * Live Condition: {trail.condition} | Temperature: {trail.temperature_f}°F")
        if trail.advisory:
            lines.append(f"  * Active Trail Advisory: {trail.advisory}")
        lines.append(f"  * Required / Essential Gear: {', '.join(trail.essential_gear)}")
    else:
        lines.append("- Regional Trails Database:")
        matched_trails = get_trails(region=intent.region)
        for t in matched_trails:
            adv_str = f" | Advisory: {t.advisory}" if t.advisory else ""
            lines.append(
                f"  * {t.name} [{t.region}] - Status: {t.status.capitalize()} ({t.condition}, {t.temperature_f}°F, "
                f"{t.difficulty}, {t.distance_miles} mi, +{t.elevation_gain_ft} ft){adv_str}. "
                f"Essential Gear: {', '.join(t.essential_gear)}"
            )

    if outfitting:
        lines.append("")
        lines.append(f"- Outfitting Plan ({outfitting.activity.capitalize()}, {outfitting.season.capitalize()}):")
        if outfitting.weather_advisory:
            lines.append(f"  * Weather Advisory: {outfitting.weather_advisory}")
        lines.append("  * Top Gear Recommendations:")
        for item in outfitting.gear_checklist[:10]:
            lines.append(f"    - {item}")
        lines.append("  * Safety Tips:")
        for tip in outfitting.safety_tips:
            lines.append(f"    - {tip}")

    lines.extend([
        "",
        "Instructions for Assistant:",
        "- Ground responses strictly in the official Contoso Outdoors trail conditions and outfitting guide above.",
        "- If the customer asks about trail conditions or status, accurately state the trail status, current temperature, and essential gear.",
        "- If the customer asks about packing or gear, provide the tailored 10-essentials checklist, weather layers, and trail-specific equipment.",
        "- If a trail is marked CAUTION (such as Multnomah-Wahkeena Loop with slick rock spray), explicitly warn the customer and recommend high-traction grip footwear.",
        "- Maintain an encouraging, safety-conscious, and expert outdoor guidance tone.",
    ])

    return "\n".join(lines)


def format_trail_response(
    intent: TrailIntent,
    outfitting: Optional[TrailOutfittingResponse] = None,
) -> dict[str, Any]:
    """Returns formatted human-readable answer and structured trail_outfitting payload."""
    if outfitting is None:
        outfitting = generate_outfitting_plan(
            trail_name=intent.trail_name,
            activity=intent.activity or "day-hiking",
            season=intent.season or "spring",
        )

    trail = outfitting.trail

    if trail:
        trail_payload = trail.model_dump()
        trails_payload = None

        if intent.action == "conditions":
            adv_txt = f" Active advisory: {trail.advisory}." if trail.advisory else ""
            answer = (
                f"{trail.name} ({trail.region}) is currently {trail.status.capitalize()}. "
                f"Current conditions are {trail.condition} with a temperature of {trail.temperature_f}°F. "
                f"The trail is {trail.difficulty} ({trail.distance_miles} miles, {trail.elevation_gain_ft} ft elevation gain).{adv_txt} "
                f"Essential gear to bring: {', '.join(trail.essential_gear)}."
            )
        elif intent.action == "safety":
            adv_txt = f" Active safety advisory: {trail.advisory}." if trail.advisory else ""
            tips_txt = " ".join(outfitting.safety_tips)
            answer = (
                f"Safety advisory and precautions for {trail.name}: Current status is {trail.status.capitalize()} "
                f"({trail.condition}, {trail.temperature_f}°F).{adv_txt} "
                f"{tips_txt} Recommended safety gear includes: {', '.join(trail.essential_gear)}."
            )
        elif intent.action == "outfitting":
            answer = (
                f"Here is your tailored outfitting packing checklist for {outfitting.activity} at {trail.name} "
                f"during {outfitting.season}: Current weather is {trail.condition} ({trail.temperature_f}°F). "
                f"Essential gear: {', '.join(trail.essential_gear)}. "
                f"Ten Essentials & Layers: {'; '.join(outfitting.gear_checklist[:6])}. "
                f"Safety tips: {' '.join(outfitting.safety_tips[:2])}"
            )
        else:  # recommendation
            adv_txt = f" Note: {trail.advisory}." if trail.advisory else ""
            answer = (
                f"We recommend {trail.name} in {trail.region}! It is a {trail.difficulty} {trail.distance_miles}-mile "
                f"trail with {trail.elevation_gain_ft} ft elevation gain. Status: {trail.status.capitalize()} "
                f"({trail.condition}, {trail.temperature_f}°F).{adv_txt} Essential gear: {', '.join(trail.essential_gear)}."
            )
    else:
        all_trails = get_trails(region=intent.region)
        trail_payload = None
        trails_payload = [t.model_dump() for t in all_trails]

        if intent.action == "outfitting":
            answer = (
                f"Here is your comprehensive outfitting packing checklist for a {outfitting.season} {outfitting.activity} trip: "
                f"The 10 Essentials include: {'; '.join(outfitting.gear_checklist[:5])}. "
                f"Recommended weather layers: {'; '.join(SEASONAL_LAYERS.get(outfitting.season, SEASONAL_LAYERS['spring']))}. "
                f"Safety tips: {' '.join(outfitting.safety_tips[:2])}"
            )
        else:
            trail_summaries = []
            for t in all_trails:
                adv = f" [Advisory: {t.advisory}]" if t.advisory else ""
                trail_summaries.append(
                    f"{t.name} ({t.region}): Status {t.status.capitalize()}, {t.condition}, {t.temperature_f}°F, "
                    f"{t.difficulty}, {t.distance_miles} mi{adv}"
                )
            answer = (
                "Here are popular hiking trails and current conditions: "
                + "; ".join(trail_summaries)
                + ". Let me know if you would like an outfitting packing checklist or safety advice for any of these trails!"
            )

    trail_outfitting_data: dict[str, Any] = {
        "action": intent.action,
        "trail": trail_payload,
        "trails": trails_payload,
        "activity": outfitting.activity,
        "season": outfitting.season,
        "gear_checklist": outfitting.gear_checklist,
        "safety_tips": outfitting.safety_tips,
        "weather_advisory": outfitting.weather_advisory,
    }

    return {
        "answer": answer,
        "trail_outfitting": trail_outfitting_data,
    }
