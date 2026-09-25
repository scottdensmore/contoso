import re
from typing import Any, Optional

from pydantic import BaseModel, Field


class PackRouteModel(BaseModel):
    route_id: str
    title: str
    wilderness_area: str
    national_forest: str
    elevation_m: int
    saddle_type: str
    terrain: str
    max_string_mules: int
    typical_days: int
    description: str
    route_highlights: list[str] = Field(default_factory=list)


class TrailPackingRequest(BaseModel):
    route_id: str = "bob-marshall-wilderness"
    stock_animal: str = "mule"
    left_pannier_lbs: float = 65.0
    right_pannier_lbs: float = 65.0
    top_pack_lbs: float = 20.0
    hitch_type: str = "diamond_hitch"


class TrailPackingResponse(BaseModel):
    route_id: str
    route_title: str
    stock_animal: str
    total_payload_lbs: float
    weight_difference_lbs: float
    balance_ratio: float
    balance_status: str
    payload_capacity_status: str
    recommended_hitch_adjustment: str
    highline_spacing_m: float


class TackChecklistItemModel(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class TrailPackingIntent(BaseModel):
    action: str
    route_id: Optional[str] = None
    saddle_type: Optional[str] = None

    def __bool__(self) -> bool:
        return bool(self.action)


class FormattedTrailPackingResponse(str):
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


PACK_ROUTES: dict[str, PackRouteModel] = {
    "bob-marshall-wilderness": PackRouteModel(
        route_id="bob-marshall-wilderness",
        title="Bob Marshall Wilderness & Chinese Wall Pack String",
        wilderness_area="Bob Marshall Wilderness",
        national_forest="Flathead National Forest, MT, USA",
        elevation_m=2300,
        saddle_type="decker",
        terrain="mountain_pass",
        max_string_mules=6,
        typical_days=7,
        description="A rugged northern Rockies pack expedition along the iconic Chinese Wall limestone cliff, crossing Continental Divide river fords and wilderness passes with decker rigging.",
        route_highlights=["Chinese Wall limestone escarpment", "Highline tree saver overnight picketing", "Continental Divide river fords"],
    ),
    "pasayten-wilderness": PackRouteModel(
        route_id="pasayten-wilderness",
        title="Pasayten Wilderness Border Trail Expedition",
        wilderness_area="Pasayten Wilderness",
        national_forest="Okanogan-Wenatchee National Forest, WA, USA",
        elevation_m=2150,
        saddle_type="sawbuck",
        terrain="alpine_meadow",
        max_string_mules=5,
        typical_days=6,
        description="High-country North Cascades sawbuck trail pack route along subalpine larch basins and border trails requiring careful grazing rotation and timberline diamond hitches.",
        route_highlights=["Subalpine larch corridor traverses", "Diamond hitch timberline lashing", "Designated wilderness meadow rotation"],
    ),
    "wind-river-range": PackRouteModel(
        route_id="wind-river-range",
        title="Wind River High Route & Cirque Pack Expedition",
        wilderness_area="Bridger Wilderness",
        national_forest="Bridger-Teton National Forest, WY, USA",
        elevation_m=3200,
        saddle_type="decker",
        terrain="boulder_pass",
        max_string_mules=4,
        typical_days=8,
        description="Strenuous high-altitude pack journey traversing granite boulder passes and alpine cirques above 10,000 feet with Decker pack saddles and bear-resistant panniers.",
        route_highlights=["Granite talus pass switchbacks", "Pannier balance calibration over 10,000ft", "Bear-resistant hard-sided mantmy panniers"],
    ),
    "pecos-wilderness": PackRouteModel(
        route_id="pecos-wilderness",
        title="Pecos Wilderness Truchas Peaks Circuit",
        wilderness_area="Pecos Wilderness",
        national_forest="Santa Fe National Forest, NM, USA",
        elevation_m=2800,
        saddle_type="sawbuck",
        terrain="plateau_forest",
        max_string_mules=4,
        typical_days=5,
        description="Southwestern high mesa trail pack loop winding through aspen forests and Truchas peaks with sawbuck rigging, box hitches, and strict grazing containment.",
        route_highlights=["High mesa aspen grove trails", "Box hitch duffel packing", "Leave No Trace horse grazing containment"],
    ),
    "frank-church-river-of-no-return": PackRouteModel(
        route_id="frank-church-river-of-no-return",
        title="Frank Church Salmon River Breaks Trail",
        wilderness_area="Frank Church-River of No Return Wilderness",
        national_forest="Payette National Forest, ID, USA",
        elevation_m=1900,
        saddle_type="decker",
        terrain="canyon_breaks",
        max_string_mules=6,
        typical_days=9,
        description="Deep wilderness canyon expedition following steep Salmon River breaks, negotiating narrow switchbacks with lead-line tensioning and sandbar picket camps.",
        route_highlights=["Steep canyon switchback pack strings", "Mule string lead line tensioning", "River bar night picket camp"],
    ),
}

TACK_CHECKLIST: list[TackChecklistItemModel] = [
    TackChecklistItemModel(
        item_id="tree-saver-highline-straps",
        name="Wide Nylon Tree-Saver Straps & 100ft Static Kernmantle Highline",
        category="containment",
        mandatory=True,
        purpose="Protects cambium tree bark and anchors stock safely overnight",
    ),
    TackChecklistItemModel(
        item_id="breakaway-lead-ropes",
        name="Heavy-Duty Cotton Lead Ropes with Leather Breakaway Fuses",
        category="rigging",
        mandatory=True,
        purpose="Prevents string pileups and animal panic injuries on narrow ledges",
    ),
    TackChecklistItemModel(
        item_id="contoured-pack-pads",
        name="1-Inch Pressed Wool Contoured Pack Saddle Blankets",
        category="tack",
        mandatory=True,
        purpose="Distributes weight evenly and wicks moisture under decker/sawbuck trees",
    ),
    TackChecklistItemModel(
        item_id="bear-resistant-panniers",
        name="IGBC-Approved Certified Bear-Resistant Hard-Sided Pack Panniers",
        category="storage",
        mandatory=True,
        purpose="Meets wilderness food storage regulations against grizzly and black bears",
    ),
    TackChecklistItemModel(
        item_id="easyboot-trail-spares",
        name="Emergency Equine Trail Hoof Boots & Rasp Set",
        category="hoofcare",
        mandatory=True,
        purpose="Secures thrown shoes on rocky talus passes without needing full farrier kit",
    ),
    TackChecklistItemModel(
        item_id="leather-punch-mending-kit",
        name="Rotary Leather Hole Punch, Copper Rivets, & Waxed Awl Mending Kit",
        category="repair",
        mandatory=True,
        purpose="Field repair for broken breeching, quarter straps, or latigo cinches",
    ),
]

STOCK_ANIMAL_LIMITS = {
    "mule": {"weight_lbs": 950.0, "max_payload_lbs": 190.0},
    "pack_horse": {"weight_lbs": 1100.0, "max_payload_lbs": 220.0},
    "quarter_horse": {"weight_lbs": 1000.0, "max_payload_lbs": 200.0},
}


def get_pack_routes(saddle_type: Optional[str] = None) -> list[PackRouteModel]:
    routes = list(PACK_ROUTES.values())
    if saddle_type:
        s_norm = saddle_type.strip().lower()
        routes = [r for r in routes if r.saddle_type.lower() == s_norm]
    return routes


def get_pack_route(route_id: str) -> Optional[PackRouteModel]:
    return PACK_ROUTES.get(route_id)


def calculate_trail_packing(request: TrailPackingRequest) -> TrailPackingResponse:
    route = get_pack_route(request.route_id)
    if not route:
        raise ValueError(f"Pack route '{request.route_id}' not found")

    animal_key = request.stock_animal.strip().lower().replace(" ", "_").replace("-", "_")
    limits = STOCK_ANIMAL_LIMITS.get(animal_key, STOCK_ANIMAL_LIMITS["mule"])
    max_payload = limits["max_payload_lbs"]

    total_payload = round(request.left_pannier_lbs + request.right_pannier_lbs + request.top_pack_lbs, 2)
    diff = round(abs(request.left_pannier_lbs - request.right_pannier_lbs), 2)
    max_side = max(request.left_pannier_lbs, request.right_pannier_lbs)
    min_side = min(request.left_pannier_lbs, request.right_pannier_lbs)
    balance_ratio = round(min_side / max_side, 2) if max_side > 0 else 1.0

    if diff <= 2.0:
        balance_status = "balanced"
    elif diff <= 5.0:
        balance_status = "acceptable"
    else:
        balance_status = "unbalanced_risk_galls"

    if total_payload <= max_payload * 0.85:
        payload_capacity_status = "within_capacity"
    elif total_payload <= max_payload:
        payload_capacity_status = "near_capacity"
    else:
        payload_capacity_status = "overloaded_injury_risk"

    hitch_label = request.hitch_type.replace("_", " ")
    if balance_status == "unbalanced_risk_galls":
        heavy = "left (near-side)" if request.left_pannier_lbs > request.right_pannier_lbs else "right (off-side)"
        light = "right (off-side)" if request.left_pannier_lbs > request.right_pannier_lbs else "left (near-side)"
        hitch_adj = f"Shift {diff:.1f} lbs from {heavy} to {light} pannier before securing {hitch_label}; unlevel loads cause sweeny and cinch galls."
    elif payload_capacity_status == "overloaded_injury_risk":
        overload = total_payload - max_payload
        hitch_adj = f"Overload condition: Reduce payload by {overload:.1f} lbs to respect the 20% stock limit; lighten top pack before cinching {hitch_label}."
    elif "diamond" in request.hitch_type.lower():
        hitch_adj = "Diamond hitch running lash rope properly tensioned: center the diamond over the top pack, pull slack through the cinch hook, and secure with a half-hitch."
    else:
        hitch_adj = f"{hitch_label.capitalize()} lashing secured: square pack mantmy corners, maintain even squaw tension, and double-check cinch ring knot."

    return TrailPackingResponse(
        route_id=route.route_id,
        route_title=route.title,
        stock_animal=animal_key,
        total_payload_lbs=total_payload,
        weight_difference_lbs=diff,
        balance_ratio=balance_ratio,
        balance_status=balance_status,
        payload_capacity_status=payload_capacity_status,
        recommended_hitch_adjustment=hitch_adj,
        highline_spacing_m=3.5,
    )


def get_tack_checklist() -> list[TackChecklistItemModel]:
    return list(TACK_CHECKLIST)


def detect_trail_packing_intent(message: str) -> Optional[TrailPackingIntent]:
    q = message.lower()

    # Disambiguation guards
    trail_running_pats = [r"\btrail\s+run(?:ning)?\b", r"\bultramarathon(?:s)?\b", r"\bultra\s+run(?:ning)?\b", r"\bfastpack(?:ing)?\b", r"\brunning\s+shoes?\b", r"\brunning\s+pace\b", r"\b50k\b", r"\b100k\b", r"\b100\s+miler\b"]
    if any(re.search(pat, q) for pat in trail_running_pats):
        return None

    bikepacking_pats = [r"\bbikepack(?:ing)?\b", r"\bgravel\s+bike\b", r"\bmountain\s+bike\b", r"\btire\s+pressure\b", r"\bframe\s+bag\b", r"\bseat\s+pack\b", r"\bhandlebar\s+roll\b"]
    if any(re.search(pat, q) for pat in bikepacking_pats):
        return None

    wildlife_pats = [r"\banimal\s+track(?:ing)?\b", r"\bwildlife\s+track(?:s|ing)?\b", r"\bbear\s+tracks?\b", r"\blion\s+tracks?\b", r"\bfootprint\b", r"\bspoor\b", r"\btrack\s+gait\b", r"\btrack\s+identification\b"]
    if any(re.search(pat, q) for pat in wildlife_pats):
        return None

    hiking_pats = [r"\bday\s+hike\b", r"\bhiking\s+boots?\b", r"\beasy\s+hiking\b", r"\bhiking\s+trails?\b"]
    has_hiking_without_equestrian = any(re.search(pat, q) for pat in hiking_pats)

    pack_keywords = [
        r"\bhorse\s+pack(?:ing)?\b", r"\btrail\s+pack(?:ing)?\b", r"\bpack\s+horse(?:s)?\b", r"\bpack\s+mule(?:s)?\b",
        r"\bmule\s+train\b", r"\bmule\s+string\b", r"\bpack\s+string\b", r"\bpack\s+stock\b", r"\bequestrian\b",
        r"\bpack\s+saddle(?:s)?\b", r"\bsawbuck\b", r"\bdecker\b", r"\bpannier(?:s)?\b", r"\bdiamond\s+hitch\b",
        r"\bbox\s+hitch\b", r"\bhighline\s+picket\b", r"\bhighline\s+tree\s+saver\b", r"\btack\s+checklist\b",
    ]
    has_pack_keyword = any(re.search(pat, q) for pat in pack_keywords)

    matched_route_id: Optional[str] = None
    if "bob marshall" in q or "bob-marshall-wilderness" in q or "chinese wall" in q:
        matched_route_id = "bob-marshall-wilderness"
    elif "pasayten" in q or "pasayten-wilderness" in q:
        matched_route_id = "pasayten-wilderness"
    elif "wind river" in q or "wind-river-range" in q:
        matched_route_id = "wind-river-range"
    elif "pecos" in q or "pecos-wilderness" in q or "truchas" in q:
        matched_route_id = "pecos-wilderness"
    elif "frank church" in q or "frank-church-river-of-no-return" in q or "salmon river breaks" in q:
        matched_route_id = "frank-church-river-of-no-return"

    if (has_hiking_without_equestrian and not has_pack_keyword and not matched_route_id) or (not has_pack_keyword and not matched_route_id):
        return None

    saddle_type: Optional[str] = "decker" if "decker" in q else ("sawbuck" if "sawbuck" in q else None)

    if any(k in q for k in ["balance", "balancing", "calculate", "payload", "weight difference", "lbs", "overload"]):
        action = "calculate_packing"
    elif any(k in q for k in ["tack", "checklist", "gear", "tree saver", "lead rope", "blanket", "hoof boot", "picket"]):
        action = "gear_checklist"
    elif matched_route_id and any(k in q for k in ["tell me", "detail", "about", "describe", "elevation", "days", "highlights"]):
        action = "route_detail"
    else:
        action = "route_detail" if (matched_route_id and not any(k in q for k in ["routes", "trips", "expeditions", "catalog", "list"])) else "routes_list"

    return TrailPackingIntent(action=action, route_id=matched_route_id, saddle_type=saddle_type)


def format_trail_packing_response(data: Any, query: str = "") -> FormattedTrailPackingResponse:
    if isinstance(data, TrailPackingResponse):
        calc = data
        answer = (
            f"Wilderness Trail Packing Calculation for {calc.route_title}: Stock animal: {calc.stock_animal.replace('_', ' ').title()}. "
            f"Total payload: {calc.total_payload_lbs:.1f} lbs ({calc.payload_capacity_status}). "
            f"Pannier weight difference: {calc.weight_difference_lbs:.1f} lbs (Balance status: {calc.balance_status}, Ratio: {calc.balance_ratio:.2f}). "
            f"Hitch adjustment: {calc.recommended_hitch_adjustment} Highline picket spacing: minimum {calc.highline_spacing_m:.1f}m between animals."
        )
        return FormattedTrailPackingResponse(answer, {"trail_packing_info": {"action": "calculate_packing", "route_id": calc.route_id, "calculation": calc.model_dump()}, "answer": answer})

    if isinstance(data, dict):
        if "trail_packing_info" in data and "answer" in data:
            return FormattedTrailPackingResponse(data["answer"], data)
        if "action" in data and "route_id" in data and "total_payload_lbs" in data:
            answer = f"Trail packing calculation completed for {data.get('route_id')}."
            return FormattedTrailPackingResponse(answer, {"trail_packing_info": data, "answer": answer})
        intent = TrailPackingIntent(**data) if "action" in data else (detect_trail_packing_intent(query or str(data)) or TrailPackingIntent(action="routes_list"))
    elif isinstance(data, TrailPackingIntent):
        intent = data
    else:
        intent = detect_trail_packing_intent(str(data)) or TrailPackingIntent(action="routes_list")

    if intent.action in ("calculate_packing", "calculate"):
        req = TrailPackingRequest(route_id=intent.route_id or "bob-marshall-wilderness")
        calc = calculate_trail_packing(req)
        answer = (
            f"Wilderness Trail Packing Calculation for {calc.route_title}: Stock animal: {calc.stock_animal.replace('_', ' ').title()}. "
            f"Total payload: {calc.total_payload_lbs:.1f} lbs ({calc.payload_capacity_status}). "
            f"Pannier weight difference: {calc.weight_difference_lbs:.1f} lbs (Balance status: {calc.balance_status}, Ratio: {calc.balance_ratio:.2f}). "
            f"Hitch adjustment: {calc.recommended_hitch_adjustment} Highline picket spacing: minimum {calc.highline_spacing_m:.1f}m between animals."
        )
        return FormattedTrailPackingResponse(answer, {"trail_packing_info": {"action": "calculate_packing", "route_id": calc.route_id, "calculation": calc.model_dump()}, "answer": answer})

    if intent.action in ("gear_checklist", "tack_checklist"):
        checklist = get_tack_checklist()
        items_str = "; ".join(f"{item.name} ({item.purpose})" for item in checklist)
        answer = f"Mandatory Tack & Highline Leave No Trace Checklist ({len(checklist)} items): {items_str}. Proper tree-saver straps and certified bear-resistant panniers are strictly required."
        return FormattedTrailPackingResponse(answer, {"trail_packing_info": {"action": "gear_checklist", "gear": [item.model_dump() for item in checklist], "mandatory_count": len(checklist)}, "answer": answer})

    if intent.action == "route_detail" and intent.route_id:
        route = get_pack_route(intent.route_id)
        if route:
            highlights_str = ", ".join(route.route_highlights)
            answer = (
                f"Wilderness Pack Route: {route.title} ({route.national_forest}). "
                f"Saddle rigging: {route.saddle_type.title()} | Terrain: {route.terrain} | Elevation: {route.elevation_m}m. "
                f"Typical duration: {route.typical_days} days (max {route.max_string_mules} mules in string). "
                f"{route.description} Highlights: {highlights_str}."
            )
            return FormattedTrailPackingResponse(answer, {"trail_packing_info": {"action": "route_detail", "route_id": route.route_id, "route": route.model_dump()}, "answer": answer})

    routes = get_pack_routes(saddle_type=intent.saddle_type)
    summary_str = "; ".join(f"{r.title} ({r.saddle_type.title()} saddle, {r.elevation_m}m, {r.typical_days} days)" for r in routes)
    answer = f"Contoso Wilderness Equestrian Pack Routes ({len(routes)} expeditions): {summary_str}. Ask about route details, pannier payload balancing calculations, or mandatory tack checklists."
    return FormattedTrailPackingResponse(answer, {"trail_packing_info": {"action": "routes_list", "saddle_type": intent.saddle_type, "routes": [r.model_dump() for r in routes]}, "answer": answer})


def build_trail_packing_prompt(intent: Optional[TrailPackingIntent] = None) -> str:
    lines = [
        "Wilderness Equestrian Trail Packing & Horse Expeditions Guidance:",
        "- 20% Payload Rule: Pack animal load (panniers + top pack + saddle) must not exceed 20% of animal body weight (Mule 950 lbs -> max 190 lbs; Pack Horse 1100 lbs -> max 220 lbs; Quarter Horse 1000 lbs -> max 200 lbs).",
        "- Pannier Balancing: Left and right panniers must balance within 2 lbs (<=2 lbs optimal, <=5 lbs acceptable). Differences >5 lbs cause sweeny, spine strain, and girth galls.",
        "- Saddles & Rigging: Decker pack saddles (iron rings with mantmy covers) for rugged rock passes; Sawbuck pack saddles (crossbucks) for duffel boxes and forest trails.",
        "- Lash Hitches: Diamond hitch locks top packs securely across timberline routes; Box hitch for square loads.",
        "- Leave No Trace Highline Ethics: Always anchor a highline picket between mature trees using 2-inch nylon tree-saver straps at least 7 feet off ground. Space animals minimum 3.5 meters apart to prevent kicking.",
    ]
    if intent and intent.action == "route_detail" and intent.route_id:
        r = get_pack_route(intent.route_id)
        if r:
            lines.append(f"- Focused Route: {r.title} ({r.national_forest}, {r.elevation_m}m, {r.saddle_type} saddle)")
    return "\n".join(lines)
