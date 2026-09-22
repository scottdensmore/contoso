import math
from typing import Any, Optional

from pydantic import BaseModel


class DesertRouteModel(BaseModel):
    route_id: str
    title: str
    region: str
    distance_km: float
    elevation_gain_m: int
    aridity_zone: str
    water_sources_count: int
    typical_duration_days: int
    water_cache_required: bool
    flash_flood_risk: str
    description: str
    highlights: list[str]


class HydrationPlanRequest(BaseModel):
    route_id: str
    ambient_temperature_f: float = 95.0
    relative_humidity_pct: float = 15.0
    hiker_weight_kg: float = 75.0
    pack_weight_kg: float = 15.0
    trekking_pace_km_h: float = 3.5
    hours_in_direct_sun: float = 6.0
    shade_umbrella_used: bool = False


class HydrationPlanResponse(BaseModel):
    route_id: str
    route_title: str
    aridity_zone: str
    felt_heat_index_f: float
    hourly_sweat_rate_liters: float
    total_water_needed_liters: float
    safety_status: str
    electrolyte_dose_mg: int
    siesta_hours_advisory: str
    flash_flood_advisory: str
    caching_notice: str


class DesertGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class DesertTrekkingIntent(BaseModel):
    action: str  # "routes_list", "route_detail", "hydration_plan", "gear_checklist"
    route_id: Optional[str] = None
    zone: Optional[str] = None
    region: Optional[str] = None


DEFAULT_DESERT_ROUTES: dict[str, DesertRouteModel] = {
    "badwater-telescope-peak-traverse": DesertRouteModel(
        route_id="badwater-telescope-peak-traverse",
        title="Badwater Basin to Telescope Peak Low-to-High",
        region="Inyo County, CA",
        distance_km=48.0,
        elevation_gain_m=3450,
        aridity_zone="hyper_arid_salt_playa",
        water_sources_count=1,
        typical_duration_days=3,
        water_cache_required=True,
        flash_flood_risk="low",
        description="Extreme low-to-high desert ascent rising from Badwater Basin at -282 ft to Telescope Peak summit at 11,049 ft across exposed salt flats and alluvial fans.",
        highlights=[
            "Badwater salt playa floor",
            "Hanaupah Canyon springs",
            "Telescope Peak summit ridge",
        ],
    ),
    "hayduke-buckskin-gulch-paria": DesertRouteModel(
        route_id="hayduke-buckskin-gulch-paria",
        title="Buckskin Gulch to Paria Canyon Confluence",
        region="Kane County, UT",
        distance_km=34.0,
        elevation_gain_m=280,
        aridity_zone="canyon_wash_slickrock",
        water_sources_count=2,
        typical_duration_days=2,
        water_cache_required=False,
        flash_flood_risk="extreme",
        description="Continuous deep sandstone slot canyon gorge featuring cold mud pools, towering Navajo sandstone narrows, and acute flash flood entrapment risk.",
        highlights=[
            "Continuous 12-mile deep sandstone slot",
            "Wire Pass confluence",
            "Paria River gorge",
        ],
    ),
    "mazatzal-wilderness-divide-trail": DesertRouteModel(
        route_id="mazatzal-wilderness-divide-trail",
        title="Mazatzal Divide Trail & Red Creek Basin",
        region="Gila County, AZ",
        distance_km=42.0,
        elevation_gain_m=1720,
        aridity_zone="creosote_bajada_scrub",
        water_sources_count=2,
        typical_duration_days=3,
        water_cache_required=True,
        flash_flood_risk="moderate",
        description="Rugged Arizona desert crest trail across volcanic ridgelines, saguaro-lined bajadas, and dry creek basins requiring water staging.",
        highlights=[
            "Mazatzal Peak ridge",
            "Red Creek wash",
            "Sonoran desert bajadas",
        ],
    ),
    "black-rock-desert-playa-crossing": DesertRouteModel(
        route_id="black-rock-desert-playa-crossing",
        title="Black Rock Desert High Rock Canyon Emigrant Trail",
        region="Washoe County, NV",
        distance_km=56.0,
        elevation_gain_m=310,
        aridity_zone="hyper_arid_salt_playa",
        water_sources_count=0,
        typical_duration_days=3,
        water_cache_required=True,
        flash_flood_risk="low",
        description="Barren expanse across the dried prehistoric Lake Lahontan lakebed with zero natural water, intense solar reflection, and alkali dust flats.",
        highlights=[
            "Cracked silt playa expanse",
            "High Rock Canyon gorge",
            "Historic Applegate-Lassen trail",
        ],
    ),
    "chihuahuan-mariscal-canyon-rim": DesertRouteModel(
        route_id="chihuahuan-mariscal-canyon-rim",
        title="Mariscal Canyon Rim & Talley Desert Route",
        region="Brewster County, TX",
        distance_km=26.0,
        elevation_gain_m=640,
        aridity_zone="high_desert_sage_steppe",
        water_sources_count=0,
        typical_duration_days=2,
        water_cache_required=True,
        flash_flood_risk="moderate",
        description="Remote Big Bend limestone canyon rim route overlooking the Rio Grande with relentless heat exposure, thorn scrub, and no potable surface water.",
        highlights=[
            "1,800-foot vertical limestone canyon rim",
            "Talley Mountain pass",
            "Chihuahuan desert vistas",
        ],
    ),
}

DEFAULT_DESERT_GEAR: list[DesertGearRequirement] = [
    DesertGearRequirement(
        item_id="wide-brim-sun-sombrero-cape",
        name="UPF 50+ Wide-Brim Desert Sun Hat with Removable Neck/Face Sun Drape",
        category="sun_protection",
        mandatory=True,
        purpose="Prevents direct solar radiation exposure and sunburn on face, neck, and ears in exposed desert environments.",
    ),
    DesertGearRequirement(
        item_id="electrolytes-fluid-reservoir-system",
        name="Heavy-Duty 6-Liter Dual Dromedary Hydration Reservoir Bladders plus Sodium-Potassium Electrolytes",
        category="hydration",
        mandatory=True,
        purpose="Provides high-capacity puncture-resistant water storage bladders and essential electrolytes to prevent hyponatremia during sustained sweat loss.",
    ),
    DesertGearRequirement(
        item_id="uv-blocking-ultralight-sun-umbrella",
        name="Reflective Chrome UV-Block Trekking Sun Umbrella (Reduces Felt Temp by 15°F)",
        category="sun_protection",
        mandatory=True,
        purpose="Portable hands-free shade canopy that reflects thermal UV radiation and reduces direct thermal load by up to 15°F.",
    ),
    DesertGearRequirement(
        item_id="emergency-desert-bivvy-tarp",
        name="Reflective Thermal Bivvy Sack and Mylar Shade Fly with Guyline Stakes",
        category="emergency_shelter",
        mandatory=True,
        purpose="Provides emergency daytime shade fly pitch and nighttime hypothermia defense against sudden desert temperature drops.",
    ),
    DesertGearRequirement(
        item_id="satellite-sos-inreach-messenger",
        name="Two-Way Satellite Messenger & Offline GPS Topo Map Navigation",
        category="navigation_safety",
        mandatory=True,
        purpose="Enables emergency satellite SOS distress signaling and precision GPS breadcrumb tracking across featureless desert terrain without cellular service.",
    ),
    DesertGearRequirement(
        item_id="high-vis-desert-signal-mirror",
        name="Precision Aiming Glass Signal Mirror and Pealess Emergency Whistle",
        category="signaling",
        mandatory=True,
        purpose="Provides long-range optical flash signaling visible up to 20 miles to search-and-rescue aircraft and audible distress calls without moving parts.",
    ),
]


def get_desert_routes(zone: Optional[str] = None) -> list[DesertRouteModel]:
    routes = list(DEFAULT_DESERT_ROUTES.values())
    if zone:
        norm = zone.strip().lower().replace("-", "_").replace(" ", "_")
        return [r for r in routes if r.aridity_zone == norm or norm in r.aridity_zone]
    return routes


def get_desert_route_by_id(route_id: str) -> Optional[DesertRouteModel]:
    return DEFAULT_DESERT_ROUTES.get(route_id.strip().lower())


def get_desert_gear() -> list[DesertGearRequirement]:
    return list(DEFAULT_DESERT_GEAR)


def _compute_raw_heat_index(temp_f: float, rh_pct: float) -> float:
    hi_simple = 0.5 * (temp_f + 61.0 + ((temp_f - 68.0) * 1.2) + (rh_pct * 0.094))
    if (temp_f + hi_simple) / 2.0 < 80.0:
        return hi_simple

    hi = (
        -42.379
        + 2.04901523 * temp_f
        + 10.14333127 * rh_pct
        - 0.22475541 * temp_f * rh_pct
        - 0.00683783 * (temp_f**2)
        - 0.05481717 * (rh_pct**2)
        + 0.00122874 * (temp_f**2) * rh_pct
        + 0.00085282 * temp_f * (rh_pct**2)
        - 0.00000199 * (temp_f**2) * (rh_pct**2)
    )
    if rh_pct < 13.0 and 80.0 <= temp_f <= 112.0:
        adj = ((13.0 - rh_pct) / 4.0) * math.sqrt((17.0 - abs(temp_f - 95.0)) / 17.0)
        hi -= adj
    elif rh_pct > 85.0 and 80.0 <= temp_f <= 87.0:
        adj = ((rh_pct - 85.0) / 10.0) * ((87.0 - temp_f) / 5.0)
        hi += adj
    return hi


def calculate_hydration_plan(req: HydrationPlanRequest) -> HydrationPlanResponse:
    route = get_desert_route_by_id(req.route_id)
    if not route:
        raise ValueError(f"Desert route '{req.route_id}' not found")

    raw_hi = _compute_raw_heat_index(req.ambient_temperature_f, req.relative_humidity_pct)
    if req.shade_umbrella_used:
        felt_heat_index = raw_hi - 15.0
    else:
        felt_heat_index = raw_hi
    felt_heat_index_f = round(felt_heat_index, 1)

    # Hourly sweat rate calculation
    base_rate = 0.5
    weight_factor = (req.hiker_weight_kg + req.pack_weight_kg) / 90.0
    pace_factor = req.trekking_pace_km_h / 3.5
    temp_delta = max(0.0, felt_heat_index - 70.0)
    heat_addition = (temp_delta / 10.0) * 0.25
    hourly_sweat_rate = (base_rate * weight_factor * pace_factor) + heat_addition
    hourly_sweat_rate_liters = round(max(0.4, hourly_sweat_rate), 2)

    # Total water needed
    active_water = hourly_sweat_rate_liters * req.hours_in_direct_sun
    recovery_reserve = 1.5
    total_water_needed_liters = round(active_water + recovery_reserve, 2)

    # Electrolyte dose (mg)
    electrolyte_dose_mg = int(round(total_water_needed_liters * 700))

    # Safety status
    if (
        felt_heat_index_f >= 105.0
        or route.flash_flood_risk == "extreme"
        or req.ambient_temperature_f >= 110.0
        or hourly_sweat_rate_liters >= 1.8
    ):
        safety_status = "critical_hazard"
    elif (
        felt_heat_index_f >= 90.0
        or hourly_sweat_rate_liters >= 1.1
        or route.flash_flood_risk == "high"
    ):
        safety_status = "caution"
    else:
        safety_status = "safe"

    # Siesta hours advisory
    if felt_heat_index_f >= 95.0 or req.ambient_temperature_f >= 105.0:
        siesta_advisory = (
            "Mandatory midday siesta between 10:00 AM and 16:00 (4:00 PM). "
            "Seek deep canyon shade or pitch reflective tarp; resume trekking at twilight."
        )
    elif felt_heat_index_f >= 85.0:
        siesta_advisory = "Recommended midday siesta between 11:00 AM and 15:00 (3:00 PM) to avoid peak solar irradiance."
    else:
        siesta_advisory = "Standard desert pacing: Take 15-minute shade breaks hourly; midday siesta optional if temperatures remain below 85°F."

    # Flash flood advisory
    if route.flash_flood_risk == "extreme":
        flash_flood_advisory = (
            f"EXTREME FLASH FLOOD RISK: {route.title} traverses deeply incised slot narrows with zero lateral escape. "
            "Evacuate immediately if upstream storm cells form within 50 miles."
        )
    elif route.flash_flood_risk == "high":
        flash_flood_advisory = (
            "HIGH FLASH FLOOD RISK: Check NOAA slot canyon hydrology radar. "
            "Avoid canyon wash floors during rainfall and identify escape ledges."
        )
    elif route.flash_flood_risk == "moderate":
        flash_flood_advisory = (
            "MODERATE FLASH FLOOD RISK: Desert wash drainage corridors are prone to sudden flash floods during monsoon storms. "
            "Never camp in dry riverbeds or wash bottoms."
        )
    else:
        flash_flood_advisory = "LOW FLASH FLOOD RISK: Open terrain affords wide escape routes, but maintain vigilance around dry wash crossings."

    # Caching notice
    if route.water_cache_required:
        caching_notice = (
            f"MANDATORY WATER CACHE: Route requires pre-trip water caching. "
            f"Only {route.water_sources_count} natural water source(s) available across {route.distance_km} km. "
            "Place locked UV-resistant dromedary caches at designated access trailheads or junctions 24-48 hours before trekking, and pack out all empty containers."
        )
    else:
        caching_notice = (
            f"NATURAL WATER SOURCES AVAILABLE: {route.water_sources_count} reliable water sources documented along the route. "
            "Still carry at least 4-6L reserve capacity; filter all desert potholes and tinajas."
        )

    return HydrationPlanResponse(
        route_id=route.route_id,
        route_title=route.title,
        aridity_zone=route.aridity_zone,
        felt_heat_index_f=felt_heat_index_f,
        hourly_sweat_rate_liters=hourly_sweat_rate_liters,
        total_water_needed_liters=total_water_needed_liters,
        safety_status=safety_status,
        electrolyte_dose_mg=electrolyte_dose_mg,
        siesta_hours_advisory=siesta_advisory,
        flash_flood_advisory=flash_flood_advisory,
        caching_notice=caching_notice,
    )


def detect_desert_trekking_intent(message: str) -> Optional[DesertTrekkingIntent]:
    if not isinstance(message, str) or not message.strip():
        return None

    q = message.lower()

    # Guardrails against technical slot canyoneering
    canyoneering_exclusions = [
        "rappel",
        "rope",
        "rigging",
        "descender",
        "wetsuit",
        "anchor features",
        "pothole escape",
        "technical canyon",
        "class 3b",
        "class 4b",
        "class 3c",
        "class 4a",
        "class 4c",
        "fiddlestick",
        "fiddle stick",
        "pull cord",
        "harness seat",
        "canyoneering",
    ]
    if any(k in q for k in canyoneering_exclusions):
        return None

    # Guardrails against water filtration (handled by water.py)
    water_exclusions = [
        "water filter",
        "water filtration",
        "filter cartridge",
        "gravity filter",
        "sawyer",
        "aquamira",
        "purification tablets",
        "giardia",
        "cryptosporidium",
    ]
    if any(k in q for k in water_exclusions):
        return None

    # Guardrails against general trails and weather (handled by trails.py and weather.py)
    trail_weather_exclusions = [
        "snow level",
        "trailhead parking",
        "pass conditions",
        "trail status",
        "weather forecast",
        "wind chill",
        "freezing level",
        "lightning risk",
        "refund",
        "order #",
        "return label",
    ]
    if any(k in q for k in trail_weather_exclusions):
        return None

    # Desert trekking keywords
    desert_keywords = [
        "desert trek",
        "desert trekking",
        "desert hike",
        "desert hiking",
        "desert trail",
        "desert trails",
        "desert routes",
        "desert route",
        "desert gear",
        "desert kit",
        "desert survival",
        "desert hydration",
        "desert electrolytes",
        "desert flash flood",
        "desert sweat rate",
        "arid survival",
        "arid wilderness survival",
        "water cache",
        "water caching",
        "heat index",
        "sweat rate",
        "badwater",
        "telescope peak",
        "buckskin gulch",
        "paria canyon",
        "mazatzal",
        "black rock desert",
        "mariscal canyon",
        "sun umbrella",
        "tinaja",
        "hyponatremia",
        "dromedary",
        "midday siesta",
    ]

    is_desert_match = (
        any(k in q for k in desert_keywords)
        or ("arid" in q and "survival" in q)
        or (
            "desert" in q
            and any(
                w in q
                for w in [
                    "route",
                    "trail",
                    "hike",
                    "trek",
                    "survival",
                    "gear",
                    "pack",
                    "trip",
                    "walk",
                ]
            )
        )
    )
    if not is_desert_match:
        return None

    # Route identification
    route_id = None
    if "badwater" in q or "telescope peak" in q:
        route_id = "badwater-telescope-peak-traverse"
    elif "buckskin" in q or "buckskin gulch" in q:
        route_id = "hayduke-buckskin-gulch-paria"
    elif "mazatzal" in q:
        route_id = "mazatzal-wilderness-divide-trail"
    elif "black rock" in q or "playa" in q:
        route_id = "black-rock-desert-playa-crossing"
    elif "mariscal" in q or "talley" in q:
        route_id = "chihuahuan-mariscal-canyon-rim"

    # Aridity Zone identification
    zone = None
    if "hyper_arid" in q or "salt playa" in q:
        zone = "hyper_arid_salt_playa"
    elif "slickrock" in q or "canyon wash" in q:
        zone = "canyon_wash_slickrock"
    elif "creosote" in q or "bajada" in q:
        zone = "creosote_bajada_scrub"
    elif "sage steppe" in q or "high desert" in q:
        zone = "high_desert_sage_steppe"

    # Action determination
    if any(
        k in q
        for k in [
            "hydration plan",
            "calculate",
            "sweat rate",
            "how much water",
            "water requirement",
            "heat index",
            "water cache and sweat",
            "hydration requirement",
        ]
    ):
        action = "hydration_plan"
    elif any(
        k in q
        for k in [
            "gear",
            "checklist",
            "kit",
            "sombrero",
            "dromedary",
            "bivvy",
            "signal mirror",
            "umbrella",
            "electrolytes",
        ]
    ):
        action = "gear_checklist"
    elif route_id and any(
        k in q
        for k in [
            "tell me about",
            "detail",
            "about",
            "elevation gain",
            "route info",
            "dry for",
            "trail info",
        ]
    ):
        action = "route_detail"
    elif any(
        k in q for k in ["routes", "trails", "catalog", "options", "list", "show me", "recommend"]
    ):
        action = "routes_list"
    elif route_id:
        action = "route_detail"
    else:
        action = "routes_list"

    return DesertTrekkingIntent(
        action=action,
        route_id=route_id,
        zone=zone,
    )


def build_desert_trekking_prompt(intent: DesertTrekkingIntent) -> str:
    lines = ["Desert Trekking, Arid Wilderness Survival & Water Cache Tooling:"]

    if intent.route_id:
        route = get_desert_route_by_id(intent.route_id)
        if route:
            lines.append(
                f"- Route: {route.title} ({route.region})\n"
                f"  Zone: {route.aridity_zone} | Distance: {route.distance_km} km | Gain: {route.elevation_gain_m}m\n"
                f"  Water Sources: {route.water_sources_count} | Water Cache Required: {route.water_cache_required}\n"
                f"  Flash Flood Risk: {route.flash_flood_risk} | Duration: {route.typical_duration_days} days\n"
                f"  Description: {route.description}\n"
                f"  Key Highlights: {'; '.join(route.highlights)}"
            )
    elif intent.zone:
        routes = get_desert_routes(zone=intent.zone)
        lines.append(
            f"- Matching {intent.zone} Desert Routes: {', '.join(r.title for r in routes)}"
        )
    else:
        routes = get_desert_routes()
        formatted = [f"{r.title} ({r.distance_km}km, zone: {r.aridity_zone})" for r in routes]
        lines.append(f"- Available Desert Expeditions: {', '.join(formatted)}")

    lines.extend(
        [
            "- Mandatory Desert Trekking Kit Compliance:",
            "  1. UPF 50+ Wide-Brim Desert Sun Hat with Removable Neck/Face Sun Drape.",
            "  2. Heavy-Duty 6-Liter Dual Dromedary Hydration Reservoir Bladders plus Sodium-Potassium Electrolytes.",
            "  3. Reflective Chrome UV-Block Trekking Sun Umbrella (Reduces Felt Temp by 15°F).",
            "  4. Reflective Thermal Bivvy Sack and Mylar Shade Fly with Guyline Stakes.",
            "  5. Two-Way Satellite Messenger & Offline GPS Topo Map Navigation.",
            "  6. Precision Aiming Glass Signal Mirror and Pealess Emergency Whistle.",
            "- Desert Survival & Hydration Physics Principles:",
            "  * Calculate sweat rate scaling with ambient heat index and pack mass.",
            "  * Maintain ~700mg electrolytes per liter of water to prevent hyponatremia.",
            "  * Observe mandatory midday siestas (10:00-16:00) when heat index exceeds 95°F.",
            "  * Never enter slot washes during flash flood conditions; verify upstream rainfall.",
        ]
    )

    return "\n".join(lines)


def format_desert_trekking_response(intent: DesertTrekkingIntent) -> dict[str, Any]:
    if intent.action == "hydration_plan":
        target_route_id = intent.route_id or "badwater-telescope-peak-traverse"
        try:
            req = HydrationPlanRequest(route_id=target_route_id)
            plan = calculate_hydration_plan(req)
            answer = (
                f"Desert Trekking Hydration Plan for {plan.route_title}: "
                f"Safety status is {plan.safety_status.upper()}. "
                f"Felt Heat Index: {plan.felt_heat_index_f}°F. "
                f"Estimated hourly sweat rate: {plan.hourly_sweat_rate_liters} L/hr. "
                f"Total water needed: {plan.total_water_needed_liters} L with {plan.electrolyte_dose_mg} mg electrolytes. "
                f"{plan.siesta_hours_advisory} {plan.flash_flood_advisory} {plan.caching_notice}"
            )
            return {
                "answer": answer,
                "desert_trekking_info": {
                    "action": "hydration_plan",
                    "plan": plan.model_dump(),
                },
            }
        except ValueError:
            pass

    if intent.action == "route_detail" and intent.route_id:
        route = get_desert_route_by_id(intent.route_id)
        if route:
            cache_text = (
                "Water cache REQUIRED"
                if route.water_cache_required
                else "Natural water sources available"
            )
            answer = (
                f"Desert Trekking Route: {route.title} ({route.region}). "
                f"Distance: {route.distance_km} km, Elevation Gain: {route.elevation_gain_m}m. "
                f"Aridity Zone: {route.aridity_zone}. Flash Flood Risk: {route.flash_flood_risk.upper()}. "
                f"Duration: {route.typical_duration_days} days. {cache_text}. "
                f"{route.description} Highlights: {', '.join(route.highlights)}."
            )
            return {
                "answer": answer,
                "desert_trekking_info": {
                    "action": "route_detail",
                    "route": route.model_dump(),
                },
            }

    if intent.action == "gear_checklist":
        gear = get_desert_gear()
        gear_names = "; ".join(f"{g.name} ({g.purpose})" for g in gear[:3])
        answer = (
            f"Mandatory Desert Trekking Kit Checklist: {gear_names}; "
            f"plus {', '.join(g.name for g in gear[3:])}. "
            "Ensure UV reflective umbrella and high-capacity dromedary bladders are inspected before departure."
        )
        return {
            "answer": answer,
            "desert_trekking_info": {
                "action": "gear_checklist",
                "gear": [g.model_dump() for g in gear],
            },
        }

    # Default: routes_list
    routes = get_desert_routes(zone=intent.zone)
    routes_summary = "; ".join(
        f"{r.title} ({r.distance_km}km, zone: {r.aridity_zone}, flood risk: {r.flash_flood_risk})"
        for r in routes
    )
    answer = (
        f"Desert Trekking Routes Catalog: {routes_summary}. "
        "Each route includes aridity zone classification, water caching logistics, flash flood risk ratings, and custom hydration planning."
    )
    return {
        "answer": answer,
        "desert_trekking_info": {
            "action": "routes_list",
            "routes": [r.model_dump() for r in routes],
        },
    }
