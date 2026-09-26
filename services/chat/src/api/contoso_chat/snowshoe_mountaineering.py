import re
from typing import Any, Optional, Union

from pydantic import BaseModel, Field


class SnowshoeRouteModel(BaseModel):
    route_id: str
    title: str
    mountain_range: str
    region: str
    summit_elevation_m: int
    route_length_km: float
    technical_grade: str
    max_slope_deg: int
    description: str
    highlights: list[str] = Field(default_factory=list)


class SnowshoeRequest(BaseModel):
    route_id: str = "mount-washington-tuckerman-ridge"
    snowpack: str = "windslab_crust"
    slope_angle_deg: float = 26.0
    payload_lbs: float = 200.0
    heel_lifter_engaged: bool = True


class SnowshoeResponse(BaseModel):
    route_id: str
    route_title: str
    tails_required: bool
    flotation_status: str
    calf_strain_reduction_percent: int
    traction_status: str
    advisory: str


class SnowshoeGearItemModel(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool = True
    purpose: str


class SnowshoeIntent(BaseModel):
    action: str
    route_id: Optional[str] = None
    technical_grade: Optional[str] = None


class FormattedSnowshoeResponse(str):
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


DEFAULT_SNOWSHOE_ROUTES: dict[str, SnowshoeRouteModel] = {
    "mount-washington-tuckerman-ridge": SnowshoeRouteModel(
        route_id="mount-washington-tuckerman-ridge",
        title="Mount Washington Lion Head Winter Ridge",
        mountain_range="White Mountains", region="NH, USA",
        summit_elevation_m=1917, route_length_km=13.5, technical_grade="steep_alpine",
        max_slope_deg=38,
        description="Lion Head winter ridge snowshoe ascent with 3D perimeter crampons on hard windslab.",
        highlights=["Lion Head winter crag switchbacks", "Extreme sub-zero windslab exposure", "Sub-alpine krummholz snowshoe traverses"],
    ),
    "mount-rainier-muir-snowfield": SnowshoeRouteModel(
        route_id="mount-rainier-muir-snowfield",
        title="Mount Rainier Camp Muir Winter Route",
        mountain_range="Cascade Range", region="WA, USA",
        summit_elevation_m=3072, route_length_km=14.5, technical_grade="glaciated_high_altitude",
        max_slope_deg=28,
        description="High-altitude glacial snowfield ascent to Camp Muir navigating complex terrain above Paradise.",
        highlights=["Muir Snowfield steady uphill grind", "Whiteout compass navigation wands", "High-angle crevasse perimeter bypass"],
    ),
    "rocky-mountain-bear-lake-flattop": SnowshoeRouteModel(
        route_id="rocky-mountain-bear-lake-flattop",
        title="Flattop Mountain & Hallett Peak Winter Traverse",
        mountain_range="Rocky Mountain National Park", region="CO, USA",
        summit_elevation_m=3875, route_length_km=15.0, technical_grade="alpine_ridge",
        max_slope_deg=32,
        description="Continental Divide rim traverse from Bear Lake relying on Televator heel lifters on windswept crust.",
        highlights=["Continental Divide rim windswept crust", "Tyndall Glacier overlook", "Televator heel-lifter steep timberline ascent"],
    ),
    "mount-shasta-avalanche-gulch": SnowshoeRouteModel(
        route_id="mount-shasta-avalanche-gulch",
        title="Mount Shasta Avalanche Gulch Winter Ascent",
        mountain_range="Cascade Range", region="CA, USA",
        summit_elevation_m=4322, route_length_km=18.0, technical_grade="extreme_volcanic",
        max_slope_deg=40,
        description="Demanding Cascade volcano winter snowshoe approach to Helen Lake with high-angle slope transitions.",
        highlights=["Red Banks technical snowshoe approach", "Helen Lake winter high camp", "Volcanic rime-ice perimeter edging"],
    ),
    "san-juan-red-mountain-pass": SnowshoeRouteModel(
        route_id="san-juan-red-mountain-pass",
        title="Red Mountain Pass & Commodore Basin",
        mountain_range="San Juan Mountains", region="CO, USA",
        summit_elevation_m=3680, route_length_km=11.2, technical_grade="steep_alpine",
        max_slope_deg=34,
        description="High-elevation powder basin tour featuring sidehill traversing and modular tail extension flotation.",
        highlights=["High San Juan powder basins", "Modular tail extension deep flotation", "Aggressive side-rail traverse traversing"],
    ),
}

DEFAULT_SNOWSHOE_GEAR: list[SnowshoeGearItemModel] = [
    SnowshoeGearItemModel(
        item_id="serrated-side-rail-snowshoes",
        name="Aggressive 3D Perimeter Serrated Steel Traction Snowshoes with Televator Heel Lifters",
        category="traction", mandatory=True,
        purpose="Delivers positive lateral bite across steep icy traverses and reduces calf strain",
    ),
    SnowshoeGearItemModel(
        item_id="modular-flotation-tails",
        name="5-Inch Modular Flotation Tail Extensions for Heavy Winter Packs",
        category="flotation", mandatory=True,
        purpose="Prevents deep postholing in unconsolidated backcountry powder under heavy multi-day loads",
    ),
    SnowshoeGearItemModel(
        item_id="technical-telescoping-poles",
        name="3-Section Carbon/Aluminum Trekking Poles with Dual-Density Grips and Snow Baskets",
        category="poles", mandatory=True,
        purpose="Provides essential 4-point stability, uphill purchase, and rhythmic downhill braking",
    ),
    SnowshoeGearItemModel(
        item_id="insulated-gaiters-crampon-shield",
        name="Cordura Waterproof Gore-Tex High Mountaineering Gaiters with Ballistic Crampon Shield",
        category="protection", mandatory=True,
        purpose="Prevents snow intrusion and guards lower legs against sharp snowshoe cleat strikes",
    ),
    SnowshoeGearItemModel(
        item_id="avalanche-safety-trio",
        name="Digital 3-Antenna Avalanche Transceiver, 300cm Probe, and Tempered Alloy Shovel",
        category="avalanche_safety", mandatory=True,
        purpose="Mandatory winter backcountry rescue kit for avalanche terrain travel",
    ),
    SnowshoeGearItemModel(
        item_id="emergency-ice-axe-hybrid",
        name="55cm Lightweight Alpine Ice Axe for Self-Arrest on Frozen Slopes",
        category="ice_axe", mandatory=True,
        purpose="Emergency arresting tool required when slopes exceed snowshoe traction limits",
    ),
]


def get_snowshoe_routes(technical_grade: Optional[str] = None) -> list[SnowshoeRouteModel]:
    routes = list(DEFAULT_SNOWSHOE_ROUTES.values())
    if not technical_grade:
        return routes
    norm = technical_grade.strip().lower()
    return [r for r in routes if r.technical_grade.lower() == norm]


def get_snowshoe_route(route_id: str) -> Optional[SnowshoeRouteModel]:
    key = route_id.strip().lower()
    if key in DEFAULT_SNOWSHOE_ROUTES:
        return DEFAULT_SNOWSHOE_ROUTES[key]
    for k, v in DEFAULT_SNOWSHOE_ROUTES.items():
        if k == key or v.title.lower() == key:
            return v
    return None


def calculate_snowshoe_ascent(request: SnowshoeRequest) -> SnowshoeResponse:
    route = get_snowshoe_route(request.route_id)
    if not route:
        raise ValueError(f"Snowshoe route '{request.route_id}' not found")

    tails_required = request.payload_lbs > 210.0 or (
        request.snowpack == "deep_powder" and request.payload_lbs > 175.0
    )
    flotation_status = (
        "Tails Required (5-Inch Modular Extensions Recommended)"
        if tails_required
        else "Standard Deck Surface Flotation Sufficient"
    )
    calf_strain_reduction_percent = (
        35 if (request.heel_lifter_engaged and request.slope_angle_deg >= 15.0) else 0
    )

    if request.slope_angle_deg > 38.0 or request.snowpack == "boilerplate_ice":
        traction_status = "hazardous_transition_to_crampons_axe"
        advisory = (
            "Hazardous conditions: slope angle exceeds 38° or surface is boilerplate ice. "
            "Snowshoe crampons cannot provide sufficient purchase. Transition immediately to "
            "rigid mountaineering crampons and an alpine ice axe for self-arrest security. "
            f"{flotation_status}. Calf strain reduction: {calf_strain_reduction_percent}%."
        )
    elif request.slope_angle_deg >= 33.0:
        traction_status = "caution_steep_edging_required"
        advisory = (
            "Caution: steep terrain (33°-38°) requires aggressive 3D perimeter serrated steel traction "
            "and active Televator heel lifters to maintain lateral edge bite and mitigate calf fatigue. "
            f"Deploy trekking poles with snow baskets for 4-point stability. {flotation_status}. "
            f"Calf strain reduction: {calf_strain_reduction_percent}%."
        )
    else:
        traction_status = "optimal_snowshoe_ascent"
        advisory = (
            "Optimal technical snowshoe ascent conditions (<33°). Engage Televator heel lifters on "
            f"sustained ascents to reduce calf strain by 35%. {flotation_status}. "
            f"Calf strain reduction: {calf_strain_reduction_percent}%."
        )

    return SnowshoeResponse(
        route_id=request.route_id, route_title=route.title,
        tails_required=tails_required, flotation_status=flotation_status,
        calf_strain_reduction_percent=calf_strain_reduction_percent,
        traction_status=traction_status, advisory=advisory,
    )


def get_snowshoe_gear() -> list[SnowshoeGearItemModel]:
    return list(DEFAULT_SNOWSHOE_GEAR)


def detect_snowshoe_intent(message: str) -> Optional[SnowshoeIntent]:
    if not message or not message.strip():
        return None
    q = message.lower().strip()
    snowshoe_keywords = [
        r"\bsnowshoe(?:s|ing|er|ers)?\b",
        r"\btelevator(?:s)?\b",
        r"\bflotation\s+tails?\b",
        r"\bmodular\s+flotation\b",
        r"\bserrated\s+(?:side\s*rail|snowshoe|3d|traction)\b",
        r"\bcrampon\s+toe\s+cleat(?:s)?\b",
        r"\bheel\s+lifter(?:s)?\b",
    ]
    if not any(re.search(pat, q) for pat in snowshoe_keywords):
        return None

    matched_route_id: Optional[str] = None
    if "washington" in q or "lion head" in q or "tuckerman" in q:
        matched_route_id = "mount-washington-tuckerman-ridge"
    elif "rainier" in q or "camp muir" in q or "muir snowfield" in q:
        matched_route_id = "mount-rainier-muir-snowfield"
    elif "flattop" in q or "hallett" in q or "bear lake" in q:
        matched_route_id = "rocky-mountain-bear-lake-flattop"
    elif "shasta" in q or "avalanche gulch" in q:
        matched_route_id = "mount-shasta-avalanche-gulch"
    elif "red mountain" in q or "commodore" in q or "san juan" in q:
        matched_route_id = "san-juan-red-mountain-pass"

    technical_grade: Optional[str] = None
    if "steep alpine" in q or "steep_alpine" in q:
        technical_grade = "steep_alpine"
    elif "glaciated" in q or "glaciated_high_altitude" in q:
        technical_grade = "glaciated_high_altitude"
    elif "alpine ridge" in q or "alpine_ridge" in q:
        technical_grade = "alpine_ridge"
    elif "extreme volcanic" in q or "extreme_volcanic" in q:
        technical_grade = "extreme_volcanic"

    calc_keywords = [
        "calculate", "calculation", "slope angle", "angle limit", "slope limit",
        "fatigue reduction", "strain reduction", "payload", "deep powder and", "transition to crampons",
    ]
    gear_keywords = [
        "checklist", "gear", "equipment", "mandatory", "poles", "gaiters",
        "shovel", "probe", "transceiver", "toe cleat",
    ]

    if any(k in q for k in calc_keywords):
        action = "calculate_snowshoe"
    elif any(k in q for k in gear_keywords):
        action = "gear_checklist"
    elif matched_route_id and any(k in q for k in ["tell me", "detail", "about", "describe", "ascent", "traverse", "climb", "guide", "elevation", "highlights", "trip"]):
        action = "route_detail"
    elif matched_route_id and not any(k in q for k in ["routes", "catalog", "list", "options"]):
        action = "route_detail"
    else:
        action = "routes_list"

    return SnowshoeIntent(action=action, route_id=matched_route_id, technical_grade=technical_grade)


def format_snowshoe_response(
    data: Union[dict[str, Any], SnowshoeIntent, SnowshoeResponse, Any],
    query: str = "",
) -> FormattedSnowshoeResponse:
    if isinstance(data, SnowshoeResponse):
        calc = data
        answer = (
            f"Alpine Snowshoe Ascent Analysis for {calc.route_title} ({calc.route_id}): "
            f"Flotation: {calc.flotation_status} | "
            f"Traction Status: {calc.traction_status.replace('_', ' ').upper()} | "
            f"Calf Strain Reduction: {calc.calf_strain_reduction_percent}%. "
            f"Advisory: {calc.advisory}"
        )
        info = {"action": "calculate_snowshoe", "route_id": calc.route_id, "calculation": calc.model_dump()}
        return FormattedSnowshoeResponse(answer, {"snowshoe_mountaineering_info": info, "answer": answer})

    if isinstance(data, dict):
        if "snowshoe_mountaineering_info" in data and "answer" in data:
            return FormattedSnowshoeResponse(data["answer"], data)
        if "action" in data and "route_id" in data and ("slope_angle_deg" in data or "payload_lbs" in data or "calculation" in data):
            if "calculation" in data:
                info = data
                answer = f"Alpine Snowshoe Ascent Analysis completed for {data.get('route_id')}."
                return FormattedSnowshoeResponse(answer, {"snowshoe_mountaineering_info": info, "answer": answer})
            req = SnowshoeRequest(
                route_id=data.get("route_id", "mount-washington-tuckerman-ridge"),
                snowpack=data.get("snowpack", "windslab_crust"),
                slope_angle_deg=float(data.get("slope_angle_deg", 26.0)),
                payload_lbs=float(data.get("payload_lbs", 200.0)),
                heel_lifter_engaged=bool(data.get("heel_lifter_engaged", True)),
            )
            return format_snowshoe_response(calculate_snowshoe_ascent(req))
        intent = SnowshoeIntent(**data) if "action" in data else (detect_snowshoe_intent(query or str(data)) or SnowshoeIntent(action="routes_list"))
    elif isinstance(data, SnowshoeIntent):
        intent = data
    else:
        intent = detect_snowshoe_intent(str(data)) or SnowshoeIntent(action="routes_list")

    if intent.action in ("calculate_snowshoe", "calculate"):
        target_route_id = intent.route_id or "mount-washington-tuckerman-ridge"
        req = SnowshoeRequest(route_id=target_route_id)
        calc = calculate_snowshoe_ascent(req)
        answer = (
            f"Alpine Snowshoe Ascent Analysis for {calc.route_title} ({calc.route_id}): "
            f"Flotation: {calc.flotation_status} | "
            f"Traction Status: {calc.traction_status.replace('_', ' ').upper()} | "
            f"Calf Strain Reduction: {calc.calf_strain_reduction_percent}%. "
            f"Advisory: {calc.advisory}"
        )
        info = {"action": "calculate_snowshoe", "route_id": calc.route_id, "calculation": calc.model_dump()}
        return FormattedSnowshoeResponse(answer, {"snowshoe_mountaineering_info": info, "answer": answer})

    if intent.action in ("gear_checklist", "gear"):
        gear = get_snowshoe_gear()
        items_str = "; ".join(f"{item.name} ({item.purpose})" for item in gear)
        answer = f"Mandatory Alpine Snowshoe Mountaineering Gear Checklist ({len(gear)} items): {items_str}. Technical winter gear is essential for steep ascents and icy traverses."
        info = {"action": "gear_checklist", "gear": [item.model_dump() for item in gear], "mandatory_count": sum(1 for item in gear if item.mandatory)}
        return FormattedSnowshoeResponse(answer, {"snowshoe_mountaineering_info": info, "answer": answer})

    if intent.action == "route_detail" and intent.route_id:
        route = get_snowshoe_route(intent.route_id)
        if route:
            highlights_str = ", ".join(route.highlights)
            answer = (
                f"Alpine Snowshoe Route: {route.title} ({route.mountain_range}, {route.region}). "
                f"Summit Elevation: {route.summit_elevation_m}m | Route Length: {route.route_length_km}km | "
                f"Technical Grade: {route.technical_grade} | Max Slope: {route.max_slope_deg}°. "
                f"{route.description} Highlights: {highlights_str}."
            )
            info = {"action": "route_detail", "route_id": route.route_id, "route": route.model_dump()}
            return FormattedSnowshoeResponse(answer, {"snowshoe_mountaineering_info": info, "answer": answer})

    routes = get_snowshoe_routes(technical_grade=intent.technical_grade)
    summary_str = "; ".join(f"{r.title} ({r.mountain_range}, {r.technical_grade}, {r.summit_elevation_m}m, max {r.max_slope_deg}°)" for r in routes)
    answer = f"Contoso Alpine Snowshoe Mountaineering Routes ({len(routes)} iconic routes): {summary_str}. Ask about specific route logistics, slope angle traction calculations, or mandatory winter mountaineering gear."
    info = {"action": "routes_list", "technical_grade": intent.technical_grade, "routes": [r.model_dump() for r in routes]}
    return FormattedSnowshoeResponse(answer, {"snowshoe_mountaineering_info": info, "answer": answer})


def build_snowshoe_prompt(intent: Optional[SnowshoeIntent] = None) -> str:
    lines = [
        "Alpine Snowshoe Mountaineering & Technical Winter Ascent Tooling:",
        "- 3D Perimeter Serrated Steel Traction: High-tensile steel frame teeth provide continuous bite on icy traverses.",
        "- Televator Heel Lifters: Wire bails under boot heels reduce calf muscle strain by 35% on sustained slopes >=15°.",
        "- Modular Flotation Tails: 5-inch deck extension tails prevent deep postholing in powder for heavy payloads (>210 lbs or >175 lbs in powder).",
        "- High-Angle Slope Transitions: Slopes >38° or boilerplate ice require transition to rigid crampons and an alpine ice axe.",
        "- Mandatory Avalanche & Protection Kit: Digital 3-antenna transceiver, 300cm probe, tempered shovel, high gaiters, poles.",
    ]
    if intent and intent.action == "route_detail" and intent.route_id:
        route = get_snowshoe_route(intent.route_id)
        if route:
            lines.append(f"- Focused Route: {route.title} ({route.mountain_range}, {route.summit_elevation_m}m, grade: {route.technical_grade})")
    elif intent and intent.action == "calculate_snowshoe":
        lines.append("- Action: Calculate flotation tail requirements, Televator calf fatigue reduction, and high-angle traction transitions.")
    elif intent and intent.action == "gear_checklist":
        lines.append("- Action: Present the mandatory 6-item Alpine Snowshoe Mountaineering Gear Checklist.")
    return chr(10).join(lines)
