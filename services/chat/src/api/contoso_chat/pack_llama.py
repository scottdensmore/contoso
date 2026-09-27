import re
from typing import Any, Optional

from pydantic import BaseModel, Field


class PackLlamaRouteModel(BaseModel):
    route_id: str
    title: str
    wilderness_area: str
    national_forest: str
    elevation_m: int
    saddle_rigging: str
    max_string_llamas: int
    typical_days: int
    description: str
    highlights: list[str] = Field(default_factory=list)


class PackLlamaRequest(BaseModel):
    route_id: str = "high-sierra-bishop-pass"
    saddle_rigging: str = "wood_crossbuck_pack"
    llama_body_weight_lbs: float = 360.0
    left_pannier_lbs: float = 32.0
    right_pannier_lbs: float = 32.0
    saddle_pad_weight_lbs: float = 12.0
    trail_elevation_m: float = 3200.0


class PackLlamaResponse(BaseModel):
    route_id: str
    route_title: str
    saddle_rigging: str
    total_payload_lbs: float
    payload_percentage: float
    weight_difference_lbs: float
    balance_status: str
    capacity_status: str
    highline_spacing_m: float
    daily_water_estimate_gal: float
    rigging_advisory: str
    trail_etiquette_guidance: str


class PackLlamaGearModel(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class PackLlamaIntent(BaseModel):
    action: str
    route_id: str | None = None
    saddle_rigging: str | None = None

    def __bool__(self) -> bool:
        return bool(self.action)


class FormattedPackLlamaResponse(str):
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


PACK_LLAMA_ROUTES: dict[str, PackLlamaRouteModel] = {
    "high-sierra-bishop-pass": PackLlamaRouteModel(
        route_id="high-sierra-bishop-pass",
        title="High Sierra Bishop Pass & Dusy Basin Llama Trek",
        wilderness_area="John Muir Wilderness",
        national_forest="Inyo National Forest, CA, USA",
        elevation_m=3650,
        saddle_rigging="wood_crossbuck_pack",
        max_string_llamas=4,
        typical_days=5,
        description="High-altitude High Sierra trek crossing 11,972 ft Bishop Pass into alpine Dusy Basin, featuring granite switchbacks and pristine tarns.",
        highlights=[
            "Granite switchback agility",
            "Two-toed soft pad low meadow impact",
            "Dusy Basin alpine camp string picket",
        ],
    ),
    "wind-river-cirque-towers": PackLlamaRouteModel(
        route_id="wind-river-cirque-towers",
        title="Wind River Cirque of the Towers Llama Expedition",
        wilderness_area="Bridger Wilderness",
        national_forest="Bridger-Teton National Forest, WY, USA",
        elevation_m=3250,
        saddle_rigging="articulated_fiberglass_tree",
        max_string_llamas=4,
        typical_days=6,
        description="Glacial alpine cirque expedition through rugged Wind River granite monoliths and grizzly habitat demanding certified canisters.",
        highlights=[
            "Cirque of the Towers granite monoliths",
            "Grizzly bear canister pannier stowage",
            "Highline tree-saver overnight picketing",
        ],
    ),
    "san-juan-weminuche-pass": PackLlamaRouteModel(
        route_id="san-juan-weminuche-pass",
        title="Weminuche Wilderness Continental Divide Llama Trek",
        wilderness_area="Weminuche Wilderness",
        national_forest="San Juan National Forest, CO, USA",
        elevation_m=3800,
        saddle_rigging="decker_cinch_pack",
        max_string_llamas=5,
        typical_days=7,
        description="Expansive high tundra trek traversing the Continental Divide above timberline with remote alpine shrub foraging.",
        highlights=[
            "High tundra Continental Divide ridges",
            "Browse grazing alpine shrub foraging",
            "Deep canyon switchback stability",
        ],
    ),
    "pasayten-boundary-trail": PackLlamaRouteModel(
        route_id="pasayten-boundary-trail",
        title="Pasayten Wilderness Northern Loop Llama Pack",
        wilderness_area="Pasayten Wilderness",
        national_forest="Okanogan-Wenatchee National Forest, WA, USA",
        elevation_m=2200,
        saddle_rigging="wood_crossbuck_pack",
        max_string_llamas=5,
        typical_days=6,
        description="Remote Pacific Northwest wilderness loop along the Boundary Trail featuring subalpine larch traverses and meadow rotations.",
        highlights=[
            "Subalpine larch golden autumn traverses",
            "Low-impact meadow grazing rotation",
            "Calm trail pack string disposition",
        ],
    ),
    "uinta-four-lakes-basin": PackLlamaRouteModel(
        route_id="uinta-four-lakes-basin",
        title="High Uintas Four Lakes Basin Llama Expedition",
        wilderness_area="High Uintas Wilderness",
        national_forest="Ashley National Forest, UT, USA",
        elevation_m=3350,
        saddle_rigging="articulated_fiberglass_tree",
        max_string_llamas=4,
        typical_days=4,
        description="Rugged high-elevation basin expedition exploring alpine glacial lakes over jagged quartzite boulder fields.",
        highlights=[
            "Quartzite boulder field sure-footedness",
            "High-altitude lake chain circumnavigation",
            "Rapid summer thunderstorm bivouac",
        ],
    ),
}

PACK_LLAMA_GEAR_CHECKLIST: list[PackLlamaGearModel] = [
    PackLlamaGearModel(
        item_id="padded-llama-pack-saddle",
        name="Contoured Wool-Felt Padded Llama Pack Saddle with Britchen & Breast Collar",
        category="rigging",
        mandatory=True,
        purpose="Distributes weight evenly along ribcage while preventing forward/aft slippage on steep grades",
    ),
    PackLlamaGearModel(
        item_id="highline-tree-savers-swivels",
        name="Low-Impact Highline System with 4-Inch Tree Savers & In-Line Swivels",
        category="containment",
        mandatory=True,
        purpose="Protects sensitive high-altitude bark from girdling while allowing 360-degree llama browse radius",
    ),
    PackLlamaGearModel(
        item_id="dual-side-balanced-panniers",
        name="Heavy-Duty Cordura Dual Pack Panniers with Compression Cinch Straps",
        category="storage",
        mandatory=True,
        purpose="Tear-resistant pack bags keeping gear tight against the pack frame over boulder passes",
    ),
    PackLlamaGearModel(
        item_id="breakaway-lead-and-halter",
        name="Fitted Llama Halter with Leather Breakaway Fuse & 10ft Cotton Lead",
        category="handling",
        mandatory=True,
        purpose="Safely releases under emergency snag loads while maintaining trail string connection",
    ),
    PackLlamaGearModel(
        item_id="llama-hoof-shears-styptic",
        name="Compound-Lever Toe Shears & Styptic Antiseptic Powder",
        category="hoofcare",
        mandatory=True,
        purpose="Maintains two-toed soft foot pads and prevents nail cracking over rough granite talus",
    ),
    PackLlamaGearModel(
        item_id="bear-resistant-food-canisters",
        name="IGBC-Approved Bear-Resistant Food Canisters for Pannier Stowage",
        category="safety",
        mandatory=True,
        purpose="Mandatory wilderness food storage canisters sized specifically for llama pack panniers",
    ),
]


def get_pack_llama_routes(rigging: Optional[str] = None) -> list[PackLlamaRouteModel]:
    routes = list(PACK_LLAMA_ROUTES.values())
    if rigging:
        rig_norm = rigging.strip().lower().replace("-", "_").replace(" ", "_")
        routes = [r for r in routes if r.saddle_rigging.lower() == rig_norm]
    return routes


def get_pack_llama_route(route_id: str) -> Optional[PackLlamaRouteModel]:
    return PACK_LLAMA_ROUTES.get(route_id)


def calculate_pack_llama_payload(req: PackLlamaRequest) -> PackLlamaResponse:
    route = get_pack_llama_route(req.route_id)
    if not route:
        raise ValueError(f"Pack llama route '{req.route_id}' not found")

    total_payload_lbs = round(
        req.left_pannier_lbs + req.right_pannier_lbs + req.saddle_pad_weight_lbs, 1
    )
    payload_percentage = round((total_payload_lbs / req.llama_body_weight_lbs) * 100.0, 1)
    weight_difference_lbs = round(abs(req.left_pannier_lbs - req.right_pannier_lbs), 1)

    if weight_difference_lbs <= 1.5:
        balance_status = "perfect_balance"
    elif weight_difference_lbs <= 3.5:
        balance_status = "acceptable_balance"
    else:
        balance_status = "unbalanced_girth_gall_risk"

    if payload_percentage <= 18.0:
        capacity_status = "light_cruising_load"
    elif payload_percentage <= 25.0:
        capacity_status = "optimal_working_capacity"
    else:
        capacity_status = "overloaded_spine_strain"

    highline_spacing_m = 3.5
    daily_water_estimate_gal = round(req.llama_body_weight_lbs * 0.0055, 1)

    if balance_status == "unbalanced_girth_gall_risk":
        rigging_advisory = (
            f"Caution: Panniers are unbalanced by {weight_difference_lbs} lbs (exceeds 3.5 lbs threshold). "
            f"Risk of girth gall, saddle roll, and spine abrasion. Rebalance panniers before navigating steep switchbacks."
        )
    elif capacity_status == "overloaded_spine_strain":
        rigging_advisory = (
            f"Warning: Total payload of {total_payload_lbs} lbs is {payload_percentage}% of body weight "
            f"(exceeds 25% max capacity). Reduce pack weight to prevent spinal strain and fatigue."
        )
    else:
        rigging_advisory = (
            f"Rigging confirmed for {req.saddle_rigging}: Total payload is {total_payload_lbs} lbs "
            f"({payload_percentage}% body weight). Balanced load ({weight_difference_lbs} lbs delta) "
            f"provides optimal stability across {route.wilderness_area} trails."
        )

    trail_etiquette_guidance = (
        f"Leave No Trace camelid protocol: Working gelding llamas have soft two-toed padded feet that "
        f"minimize meadow soil compaction. Maintain {highline_spacing_m}m highline spacing with tree-savers, "
        f"rotate browse grazing to prevent over-foraging, and yield trail right-of-way to uphill hikers and pack stock."
    )

    return PackLlamaResponse(
        route_id=route.route_id,
        route_title=route.title,
        saddle_rigging=req.saddle_rigging,
        total_payload_lbs=total_payload_lbs,
        payload_percentage=payload_percentage,
        weight_difference_lbs=weight_difference_lbs,
        balance_status=balance_status,
        capacity_status=capacity_status,
        highline_spacing_m=highline_spacing_m,
        daily_water_estimate_gal=daily_water_estimate_gal,
        rigging_advisory=rigging_advisory,
        trail_etiquette_guidance=trail_etiquette_guidance,
    )


def get_pack_llama_gear_checklist() -> list[PackLlamaGearModel]:
    return list(PACK_LLAMA_GEAR_CHECKLIST)


def detect_pack_llama_intent(text: str) -> Optional[PackLlamaIntent]:
    q = text.lower()

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
        "rentals",
        "rental",
    ]
    if any(k in q for k in exclusions):
        return None

    llama_keywords = [
        r"\bpack[\s-]llama\b",
        r"\bpack[\s-]llamas\b",
        r"\bllama\s+pack(?:ing)?\b",
        r"\bllama\s+trek(?:king)?\b",
        r"\bllama\s+expedition(?:s)?\b",
        r"\bllama(?:s)?\b",
        r"\bcamelid(?:s)?\b",
        r"\bbishop\s+pass\b",
        r"\bdusy\s+basin\b",
        r"\bcirque\s+of\s+the\s+towers\b",
        r"\bweminuche\b",
        r"\bfour\s+lakes\s+basin\b",
        r"\bboundary\s+trail\b",
        r"\bwood[\s-]crossbuck\b",
        r"\bdecker[\s-]cinch\b",
        r"\barticulated[\s-]fiberglass\b",
    ]
    if not any(re.search(pat, q) for pat in llama_keywords):
        return None

    matched_route_id: Optional[str] = None
    if "bishop" in q or "dusy" in q or "high-sierra" in q or "high sierra" in q:
        matched_route_id = "high-sierra-bishop-pass"
    elif "cirque" in q or "towers" in q:
        matched_route_id = "wind-river-cirque-towers"
    elif "weminuche" in q or "san juan" in q or "continental divide" in q:
        matched_route_id = "san-juan-weminuche-pass"
    elif "pasayten" in q or "boundary" in q:
        matched_route_id = "pasayten-boundary-trail"
    elif "four lakes" in q or "uinta" in q:
        matched_route_id = "uinta-four-lakes-basin"

    matched_rigging: Optional[str] = None
    if "crossbuck" in q or "sawbuck" in q:
        matched_rigging = "wood_crossbuck_pack"
    elif "fiberglass" in q or "articulated" in q:
        matched_rigging = "articulated_fiberglass_tree"
    elif "decker" in q or "cinch pack" in q:
        matched_rigging = "decker_cinch_pack"

    calc_keywords = [
        "calculate",
        "calc",
        "payload",
        "balance",
        "balancing",
        "capacity",
        "weight",
        "pannier",
        "water",
        "spacing",
        "girth gall",
        "lbs",
    ]
    gear_keywords = [
        "gear",
        "checklist",
        "equipment",
        "tack",
        "tree saver",
        "tree savers",
        "highline",
        "halter",
        "shears",
        "canister",
        "canisters",
        "lead line",
    ]

    if any(k in q for k in calc_keywords) and any(
        k in q for k in ["calculate", "calc", "payload", "balance", "balancing", "capacity", "weight", "water"]
    ):
        action = "calculate_packing"
    elif any(k in q for k in gear_keywords):
        action = "gear_checklist"
    elif matched_route_id and any(
        k in q for k in ["detail", "details", "about", "describe", "elevation", "route", "tell me", "pass"]
    ):
        action = "route_detail"
    else:
        action = (
            "route_detail"
            if (
                matched_route_id
                and not any(
                    k in q
                    for k in [
                        "routes",
                        "catalog",
                        "list",
                        "treks",
                        "expeditions",
                        "trips",
                        "offer",
                    ]
                )
            )
            else "routes_list"
        )

    return PackLlamaIntent(
        action=action,
        route_id=matched_route_id,
        saddle_rigging=matched_rigging,
    )


def format_pack_llama_response(
    intent: Any,
    req: Optional[Any] = None,
) -> FormattedPackLlamaResponse:
    if isinstance(intent, PackLlamaResponse):
        calc = intent
        answer = (
            f"Backcountry Pack-Llama Trekking Analysis for {calc.route_title}: "
            f"Payload capacity is {calc.capacity_status.replace('_', ' ').title()} "
            f"({calc.total_payload_lbs} lbs total, {calc.payload_percentage}% body weight). "
            f"Pannier balance: {calc.balance_status.replace('_', ' ').title()} "
            f"({calc.weight_difference_lbs} lbs delta). "
            f"Highline spacing: {calc.highline_spacing_m}m. "
            f"Daily water estimate: {calc.daily_water_estimate_gal} gal. "
            f"{calc.rigging_advisory} {calc.trail_etiquette_guidance}"
        )
        resp_calc_info: dict[str, Any] = {
            "pack_llama_info": {
                "action": "calculate_packing",
                "route_id": calc.route_id,
                "calculation": calc.model_dump(),
            },
            "answer": answer,
        }
        return FormattedPackLlamaResponse(answer, resp_calc_info)

    if isinstance(intent, dict):
        if "pack_llama_info" in intent and "answer" in intent:
            return FormattedPackLlamaResponse(str(intent["answer"]), intent)
        parsed_intent = (
            PackLlamaIntent(**intent)
            if "action" in intent
            else (
                detect_pack_llama_intent(str(req) or str(intent))
                or PackLlamaIntent(action="routes_list")
            )
        )
    elif isinstance(intent, PackLlamaIntent):
        parsed_intent = intent
    else:
        parsed_intent = detect_pack_llama_intent(str(intent)) or PackLlamaIntent(
            action="routes_list"
        )

    if parsed_intent.action in ("calculate_packing", "calculate"):
        calc_req = (
            req
            if isinstance(req, PackLlamaRequest)
            else PackLlamaRequest(
                route_id=parsed_intent.route_id or "high-sierra-bishop-pass",
                saddle_rigging=parsed_intent.saddle_rigging or "wood_crossbuck_pack",
            )
        )
        calc_res = calculate_pack_llama_payload(calc_req)
        answer = (
            f"Backcountry Pack-Llama Trekking Analysis for {calc_res.route_title}: "
            f"Payload capacity is {calc_res.capacity_status.replace('_', ' ').title()} "
            f"({calc_res.total_payload_lbs} lbs total, {calc_res.payload_percentage}% body weight). "
            f"Pannier balance: {calc_res.balance_status.replace('_', ' ').title()} "
            f"({calc_res.weight_difference_lbs} lbs delta). "
            f"Highline spacing: {calc_res.highline_spacing_m}m. "
            f"Daily water estimate: {calc_res.daily_water_estimate_gal} gal. "
            f"{calc_res.rigging_advisory} {calc_res.trail_etiquette_guidance}"
        )
        calc_info: dict[str, Any] = {
            "pack_llama_info": {
                "action": "calculate_packing",
                "route_id": calc_res.route_id,
                "calculation": calc_res.model_dump(),
            },
            "answer": answer,
        }
        return FormattedPackLlamaResponse(answer, calc_info)

    if parsed_intent.action in ("gear_checklist", "gear"):
        checklist = get_pack_llama_gear_checklist()
        items_str = "; ".join(f"{item.name} ({item.purpose})" for item in checklist)
        answer = (
            f"Mandatory Backcountry Pack-Llama Rigging & Safety Checklist ({len(checklist)} items): "
            f"{items_str}. Handlers must utilize padded saddles with britchen & breast collar, "
            f"tree savers, balanced panniers, breakaway halters, toe shears, and IGBC bear canisters."
        )
        gear_info: dict[str, Any] = {
            "pack_llama_info": {
                "action": "gear_checklist",
                "gear": [item.model_dump() for item in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedPackLlamaResponse(answer, gear_info)

    if parsed_intent.action == "route_detail" and parsed_intent.route_id:
        route = get_pack_llama_route(parsed_intent.route_id)
        if route:
            highlights_str = ", ".join(route.highlights)
            answer = (
                f"Pack-Llama Route: {route.title} ({route.wilderness_area}, {route.national_forest}). "
                f"Elevation: {route.elevation_m}m | Saddle Rigging: {route.saddle_rigging.replace('_', ' ').title()} | "
                f"Max String: {route.max_string_llamas} llamas | Typical Duration: {route.typical_days} days. "
                f"{route.description} Key Highlights: {highlights_str}."
            )
            detail_info: dict[str, Any] = {
                "pack_llama_info": {
                    "action": "route_detail",
                    "route_id": route.route_id,
                    "route": route.model_dump(),
                },
                "answer": answer,
            }
            return FormattedPackLlamaResponse(answer, detail_info)

    routes = get_pack_llama_routes(rigging=parsed_intent.saddle_rigging)
    summary_str = "; ".join(
        f"{r.title} ({r.elevation_m}m, {r.saddle_rigging}, {r.max_string_llamas} llamas max)"
        for r in routes
    )
    answer = (
        f"Contoso Backcountry Pack-Llama High-Altitude Trekking Catalog ({len(routes)} iconic routes): {summary_str}. "
        f"Ask about specific route details, pannier weight balancing & water calculations, "
        f"or mandatory highline tree savers and saddle rigging checklists."
    )
    list_info: dict[str, Any] = {
        "pack_llama_info": {
            "action": "routes_list",
            "saddle_rigging": parsed_intent.saddle_rigging,
            "routes": [r.model_dump() for r in routes],
        },
        "answer": answer,
    }
    return FormattedPackLlamaResponse(answer, list_info)


def build_pack_llama_prompt(intent: Optional[PackLlamaIntent] = None) -> str:
    lines = [
        "Backcountry Pack-Llama High-Altitude Trekking & High-Sierra Packing Guidance:",
        "- Working Gelding Camelids: Mature working geldings (350-450 lbs) possess unique high-altitude hemoglobin adaptations and low-stress dispositions on technical trails.",
        "- Saddle Rigging Systems: Wood crossbuck pack (versatile sawbuck for panniers), decker cinch pack (ring rigging for flexible loads), and articulated fiberglass trees (molded comfort on steep grades) distribute weight across ribs.",
        "- Payload Weight Balancing: Total payload should not exceed 25% of body weight (typically 70-90 lbs including 10-14 lb saddle and pad). Left and right panniers must balance within 1.5 lbs to prevent girth gall and spinal injury.",
        "- Low-Impact Leave No Trace Grazing: Camelids have split, two-toed soft padded feet that do not churn sensitive meadow turf. Rotate browse grazing (shrubs, bushes) rather than overgrazing alpine grasses.",
        "- Containment & String Management: Overnight highline picketing requires 4-inch tree-savers with 3.5m spacing between llamas. Use breakaway halters and leads for trail string safety.",
    ]
    if intent and intent.action == "route_detail" and intent.route_id:
        r = get_pack_llama_route(intent.route_id)
        if r:
            lines.append(
                f"- Focused Route: {r.title} ({r.wilderness_area}, {r.national_forest}, "
                f"Elevation: {r.elevation_m}m, Rigging: {r.saddle_rigging})"
            )
    return "\n".join(lines)


def pack_llama_tool(
    request: Optional[PackLlamaRequest] = None,
    action: Optional[str] = None,
    route_id: Optional[str] = None,
    saddle_rigging: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    """Tool for backcountry pack-llama high-altitude trekking and route lookup."""
    if isinstance(request, PackLlamaRequest):
        return calculate_pack_llama_payload(request)
    intent = kwargs.get("intent")
    if action in ("calculate_packing", "calculate") or "left_pannier_lbs" in kwargs:
        req = PackLlamaRequest(
            route_id=route_id
            or (intent.route_id if intent else None)
            or "high-sierra-bishop-pass",
            saddle_rigging=str(
                saddle_rigging
                or (intent.saddle_rigging if intent else None)
                or kwargs.get("saddle_rigging", "wood_crossbuck_pack")
            ),
            llama_body_weight_lbs=float(kwargs.get("llama_body_weight_lbs", 360.0)),
            left_pannier_lbs=float(kwargs.get("left_pannier_lbs", 32.0)),
            right_pannier_lbs=float(kwargs.get("right_pannier_lbs", 32.0)),
            saddle_pad_weight_lbs=float(kwargs.get("saddle_pad_weight_lbs", 12.0)),
            trail_elevation_m=float(kwargs.get("trail_elevation_m", 3200.0)),
        )
        return calculate_pack_llama_payload(req)
    if action in ("gear_checklist", "gear"):
        return get_pack_llama_gear_checklist()
    target_route_id = route_id or (intent.route_id if intent else None)
    if action == "route_detail" and target_route_id:
        return get_pack_llama_route(target_route_id)
    return get_pack_llama_routes(
        rigging=saddle_rigging or (intent.saddle_rigging if intent else None)
    )
