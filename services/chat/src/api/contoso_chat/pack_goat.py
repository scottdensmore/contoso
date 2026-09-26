from typing import Any, Optional

from pydantic import BaseModel


class PackGoatRouteModel(BaseModel):
    route_id: str
    title: str
    wilderness_area: str
    national_forest: str
    elevation_m: int
    saddle_rigging: str
    terrain_agility: str
    max_string_goats: int
    typical_days: int
    bighorn_buffer_m: int
    description: str
    highlights: list[str]


class PackGoatRequest(BaseModel):
    route_id: str = "wind-river-titcomb-basin"
    goat_breed: str = "alpine_dairy"
    goat_body_weight_lbs: float = 180.0
    left_pannier_lbs: float = 18.0
    right_pannier_lbs: float = 18.0
    saddle_pad_weight_lbs: float = 6.0
    saddle_rigging: str = "crossbuck_sawbuck"


class PackGoatResponse(BaseModel):
    route_id: str
    route_title: str
    goat_breed: str
    total_payload_lbs: float
    payload_percentage: float
    weight_difference_lbs: float
    balance_status: str
    payload_status: str
    bighorn_buffer_m: int
    recommended_daily_forage_pellets_lbs: float
    rigging_advisory: str
    wildlife_mitigation_advisory: str


class PackGoatGearItemModel(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class PackGoatIntent(BaseModel):
    action: str
    route_id: str | None = None
    saddle_rigging: str | None = None

    def __bool__(self) -> bool:
        return bool(self.action)


class FormattedPackGoatResponse(str):
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


GOAT_BREED_STANDARDS: dict[str, dict[str, float]] = {
    "alpine_dairy": {"standard_weight_lbs": 180.0, "max_payload_pct": 25.0},
    "oberhasli_swiss": {"standard_weight_lbs": 170.0, "max_payload_pct": 25.0},
    "saanen_draft": {"standard_weight_lbs": 210.0, "max_payload_pct": 28.0},
    "boer_cross": {"standard_weight_lbs": 200.0, "max_payload_pct": 26.0},
}

DEFAULT_PACK_GOAT_ROUTES: dict[str, PackGoatRouteModel] = {
    "wind-river-titcomb-basin": PackGoatRouteModel(
        route_id="wind-river-titcomb-basin",
        title="Wind River High Basin & Titcomb Lakes Goat Trek",
        wilderness_area="Bridger Wilderness",
        national_forest="Bridger-Teton National Forest, WY, USA",
        elevation_m=3300,
        saddle_rigging="flexible_tree_harness",
        terrain_agility="granite_talus",
        max_string_goats=4,
        typical_days=6,
        bighorn_buffer_m=200,
        description="Iconic alpine pack goat expedition navigating granite talus and soaring cirques beneath Gannett Peak in Bridger-Teton National Forest.",
        highlights=[
            "Granite talus pass hopping",
            "Grizzly bear country food canisters",
            "Highline tree-saver tethering above treeline",
        ],
    ),
    "sawtooth-alice-toxaway": PackGoatRouteModel(
        route_id="sawtooth-alice-toxaway",
        title="Sawtooth Wilderness Alice-Toxaway Loop",
        wilderness_area="Sawtooth Wilderness",
        national_forest="Sawtooth National Forest, ID, USA",
        elevation_m=2850,
        saddle_rigging="crossbuck_sawbuck",
        terrain_agility="alpine_scree",
        max_string_goats=4,
        typical_days=4,
        bighorn_buffer_m=100,
        description="Classic Idaho alpine loop traversing decomposed granite scree switchbacks and sparkling twin alpine lakes.",
        highlights=[
            "Decomposed granite scree switchbacks",
            "Twin lakes alpine campsites",
            "Leave No Trace grazing containment",
        ],
    ),
    "eagle-cap-lakes-basin": PackGoatRouteModel(
        route_id="eagle-cap-lakes-basin",
        title="Eagle Cap Wilderness Lakes Basin Traverse",
        wilderness_area="Eagle Cap Wilderness",
        national_forest="Wallowa-Whitman National Forest, OR, USA",
        elevation_m=2600,
        saddle_rigging="decker_soft_pack",
        terrain_agility="subalpine_meadow",
        max_string_goats=5,
        typical_days=5,
        bighorn_buffer_m=150,
        description="Scenic Oregon subalpine larch corridor with strict bighorn sheep separation corridors and certified weed-free forage mandates.",
        highlights=[
            "Subalpine larch corridor trails",
            "Bighorn sheep permit separation corridor",
            "Certified weed-free forage mandate",
        ],
    ),
    "uinta-highline-kings-peak": PackGoatRouteModel(
        route_id="uinta-highline-kings-peak",
        title="High Uintas Kings Peak Timberline Expedition",
        wilderness_area="High Uintas Wilderness",
        national_forest="Ashley National Forest, UT, USA",
        elevation_m=3500,
        saddle_rigging="flexible_tree_harness",
        terrain_agility="timberline_plateau",
        max_string_goats=3,
        typical_days=7,
        bighorn_buffer_m=200,
        description="High altitude expedition across Arctic tundra plateaus to Utah's highest summit with rapid weather bivouac protocols.",
        highlights=[
            "Extreme altitude tundra plateau",
            "Boulder talus leaping agility",
            "Rapid summer thunderstorm bivouac",
        ],
    ),
    "maroon-bells-four-pass": PackGoatRouteModel(
        route_id="maroon-bells-four-pass",
        title="Maroon Bells Snowmass Four Pass Alpine Loop",
        wilderness_area="Maroon Bells-Snowmass Wilderness",
        national_forest="White River National Forest, CO, USA",
        elevation_m=3800,
        saddle_rigging="crossbuck_sawbuck",
        terrain_agility="four_pass_loop",
        max_string_goats=4,
        typical_days=5,
        bighorn_buffer_m=150,
        description="Epic Colorado loop crossing four passes above 12,400 feet, demanding blaze orange safety protocols during hunting seasons.",
        highlights=[
            "Four alpine passes over 12,400 feet",
            "Blaze orange safety collar requirement",
            "Crossbuck sawbuck cinching checks",
        ],
    ),
}

DEFAULT_PACK_GOAT_GEAR: list[PackGoatGearItemModel] = [
    PackGoatGearItemModel(
        item_id="weed-free-certified-forage",
        name="Weed-Free Certified Alfalfa/Timothy Pellets (Leave No Trace feed)",
        category="nutrition",
        mandatory=True,
        purpose="Prevent spreading noxious invasive weeds in fragile alpine tundra",
    ),
    PackGoatGearItemModel(
        item_id="high-vis-orange-safety-vest",
        name="Blaze Orange Goat Hunting-Season ID Vest & Brass Bells",
        category="safety",
        mandatory=True,
        purpose="Prevent accidental hunter mistaken identity during big game seasons",
    ),
    PackGoatGearItemModel(
        item_id="highline-swivel-tether-kit",
        name="Overnight Alpine Highline Kit with Swivels & Tree-Savers",
        category="containment",
        mandatory=True,
        purpose="Tether goats overnight to prevent wandering and predator contact",
    ),
    PackGoatGearItemModel(
        item_id="hoof-trimming-shears-styptic",
        name="Heavy-Duty Hoof Shears & Blood-Stop Styptic Powder",
        category="hoofcare",
        mandatory=True,
        purpose="Field maintenance of cloven goat hooves over sharp granite rock",
    ),
    PackGoatGearItemModel(
        item_id="crossbuck-saddle-breeching",
        name="Padded Crossbuck Goat Pack Saddle with Britchen & Breast Collar",
        category="rigging",
        mandatory=True,
        purpose="Keep load centered during steep ascents and scree descents",
    ),
    PackGoatGearItemModel(
        item_id="bear-resistant-pannier-liner",
        name="Bear-Resistant Heavy Cordura Dual-Compartment Pack Panniers",
        category="storage",
        mandatory=True,
        purpose="Evenly distribute payload with crush-resistant internal structure",
    ),
]


def get_pack_goat_routes(rigging: Optional[str] = None) -> list[PackGoatRouteModel]:
    routes = list(DEFAULT_PACK_GOAT_ROUTES.values())
    if rigging:
        rig_norm = rigging.strip().lower().replace("-", "_").replace(" ", "_")
        routes = [r for r in routes if r.saddle_rigging.lower() == rig_norm]
    return routes


def get_pack_goat_route(route_id: str) -> Optional[PackGoatRouteModel]:
    return DEFAULT_PACK_GOAT_ROUTES.get(route_id)


def calculate_pack_goat_payload(req: PackGoatRequest) -> PackGoatResponse:
    route = get_pack_goat_route(req.route_id)
    if not route:
        raise ValueError(f"Pack goat route '{req.route_id}' not found")

    weight_difference_lbs = round(abs(req.left_pannier_lbs - req.right_pannier_lbs), 1)
    if weight_difference_lbs <= 1.0:
        balance_status = "perfectly_balanced"
    elif weight_difference_lbs <= 2.5:
        balance_status = "acceptable_balance"
    else:
        balance_status = "unbalanced_roll_risk"

    total_payload_lbs = round(
        req.left_pannier_lbs + req.right_pannier_lbs + req.saddle_pad_weight_lbs, 1
    )
    payload_percentage = round((total_payload_lbs / req.goat_body_weight_lbs) * 100.0, 1)

    if payload_percentage <= 22.0:
        payload_status = "optimal_light_load"
    elif payload_percentage <= 28.0:
        payload_status = "full_working_capacity"
    else:
        payload_status = "overloaded_spinal_strain"

    recommended_daily_forage_pellets_lbs = round(req.goat_body_weight_lbs * 0.02, 1)

    # Rigging advisory
    if balance_status == "unbalanced_roll_risk":
        rigging_advisory = (
            f"Caution: Panniers are unbalanced by {weight_difference_lbs} lbs (exceeds 2.5 lbs threshold). "
            f"Risk of saddle roll and spinal sores. Rebalance panniers before traversing {route.terrain_agility}."
        )
    elif payload_status == "overloaded_spinal_strain":
        rigging_advisory = (
            f"Warning: Total payload of {total_payload_lbs} lbs is {payload_percentage}% of body weight "
            f"(exceeds 28% max capacity). Reduce pack weight to prevent spinal strain and fatigue."
        )
    else:
        rigging_advisory = (
            f"Rigging confirmed for {req.saddle_rigging}: Total payload is {total_payload_lbs} lbs "
            f"({payload_percentage}% body weight). Balanced load ({weight_difference_lbs} lbs delta) "
            f"minimizes saddle roll across {route.terrain_agility} terrain."
        )

    # Wildlife mitigation advisory
    wildlife_mitigation_advisory = (
        f"Bighorn sheep buffer mandate: Maintain a strict minimum {route.bighorn_buffer_m}m separation distance "
        "from wild bighorn sheep herds at all times to prevent Mycoplasma ovipneumoniae transmission. "
        "Goats must be tethered overnight on highline systems and fitted with blaze orange safety vests and bells."
    )

    return PackGoatResponse(
        route_id=route.route_id,
        route_title=route.title,
        goat_breed=req.goat_breed,
        total_payload_lbs=total_payload_lbs,
        payload_percentage=payload_percentage,
        weight_difference_lbs=weight_difference_lbs,
        balance_status=balance_status,
        payload_status=payload_status,
        bighorn_buffer_m=route.bighorn_buffer_m,
        recommended_daily_forage_pellets_lbs=recommended_daily_forage_pellets_lbs,
        rigging_advisory=rigging_advisory,
        wildlife_mitigation_advisory=wildlife_mitigation_advisory,
    )


def get_pack_goat_gear_checklist() -> list[PackGoatGearItemModel]:
    return list(DEFAULT_PACK_GOAT_GEAR)


def detect_pack_goat_intent(text: str) -> Optional[PackGoatIntent]:
    q = text.lower()

    exclusions = [
        "order #",
        "refund",
        "return label",
        "shipping tracking",
        "burro",
        "horse",
        "trail packing",
        "dogsled",
        "trapping",
        "gold pan",
        "beachcombing",
        "fire lookout",
        "snowshoe",
        "rentals",
        "rental",
    ]
    if any(ex in q for ex in exclusions):
        return None

    pack_goat_keywords = [
        "pack goat",
        "pack-goat",
        "packgoat",
        "pack wether",
        "pack wethers",
        "wether goat",
        "goat packing",
        "alpine dairy goat",
        "oberhasli pack goat",
        "oberhasli",
        "saanen wether",
        "saanen",
        "boer cross",
        "crossbuck goat saddle",
        "crossbuck sawbuck",
        "sawbuck saddle",
        "decker soft pack",
        "flexible tree harness",
        "pannier balance",
        "pannier payload",
        "bighorn sheep separation buffer",
        "bighorn sheep disease",
        "bighorn buffer",
        "mycoplasma ovipneumoniae",
        "m. ovi",
        "weed-free pellets",
        "weed-free certified",
        "forage pellets",
        "goat highline",
        "pack goat trekking",
        "pack goat route",
        "goat pack",
        "string of goats",
        "goat saddle",
        "goat hooves",
        "goat hoof",
    ]

    # Route keywords
    route_mappings = {
        "titcomb": "wind-river-titcomb-basin",
        "wind river": "wind-river-titcomb-basin",
        "wind-river": "wind-river-titcomb-basin",
        "alice-toxaway": "sawtooth-alice-toxaway",
        "alice toxaway": "sawtooth-alice-toxaway",
        "sawtooth": "sawtooth-alice-toxaway",
        "eagle cap": "eagle-cap-lakes-basin",
        "eagle-cap": "eagle-cap-lakes-basin",
        "lakes basin": "eagle-cap-lakes-basin",
        "kings peak": "uinta-highline-kings-peak",
        "uinta": "uinta-highline-kings-peak",
        "four pass": "maroon-bells-four-pass",
        "maroon bells": "maroon-bells-four-pass",
        "four-pass": "maroon-bells-four-pass",
    }

    matched_route_id: Optional[str] = None
    for kw, r_id in route_mappings.items():
        if kw in q:
            matched_route_id = r_id
            break

    is_pack_goat_query = any(k in q for k in pack_goat_keywords)
    if not is_pack_goat_query and not (matched_route_id and "goat" in q):
        return None

    # Detect rigging if mentioned
    saddle_rigging: Optional[str] = None
    if "crossbuck" in q or "sawbuck" in q:
        saddle_rigging = "crossbuck_sawbuck"
    elif "decker" in q:
        saddle_rigging = "decker_soft_pack"
    elif "flexible tree" in q or "flexible_tree" in q:
        saddle_rigging = "flexible_tree_harness"

    calc_keywords = [
        "calculate",
        "payload",
        "balance",
        "weight",
        "pannier",
        "capacity",
        "weigh",
        "pounds",
        "lbs",
        "forage calculation",
        "carry",
    ]
    gear_keywords = [
        "gear",
        "tack",
        "checklist",
        "equipment",
        "supplies",
        "highline kit",
        "safety vest",
        "bells",
        "shears",
        "mandate",
        "items",
    ]

    if any(k in q for k in calc_keywords) and not any(
        k in q for k in ["gear list", "gear checklist"]
    ):
        action = "calculate_packing"
    elif any(k in q for k in gear_keywords):
        action = "gear_checklist"
    elif matched_route_id and any(
        k in q
        for k in ["detail", "about", "tell me", "describe", "elevation", "buffer", "highlights"]
    ):
        action = "route_detail"
    elif matched_route_id and not any(
        k in q for k in ["routes", "catalog", "list", "options", "offer"]
    ):
        action = "route_detail"
    else:
        action = "routes_list"

    return PackGoatIntent(
        action=action,
        route_id=matched_route_id,
        saddle_rigging=saddle_rigging,
    )


def format_pack_goat_response(
    intent: Any,
    req: Optional[Any] = None,
) -> FormattedPackGoatResponse:
    if isinstance(intent, PackGoatResponse):
        calc = intent
        answer = (
            f"Pack-Goat Alpine Trekking Analysis for {calc.route_title}: "
            f"Payload status is {calc.payload_status.replace('_', ' ').title()} "
            f"({calc.total_payload_lbs} lbs, {calc.payload_percentage}% body weight). "
            f"Balance status: {calc.balance_status.replace('_', ' ').title()} "
            f"({calc.weight_difference_lbs} lbs delta). "
            f"Daily forage requirement: {calc.recommended_daily_forage_pellets_lbs} lbs weed-free pellets. "
            f"{calc.rigging_advisory} {calc.wildlife_mitigation_advisory}"
        )
        resp_calc_info: dict[str, Any] = {
            "pack_goat_info": {
                "action": "calculate_packing",
                "route_id": calc.route_id,
                "calculation": calc.model_dump(),
            },
            "answer": answer,
        }
        return FormattedPackGoatResponse(answer, resp_calc_info)

    if isinstance(intent, dict):
        if "pack_goat_info" in intent and "answer" in intent:
            return FormattedPackGoatResponse(str(intent["answer"]), intent)
        parsed_intent = (
            PackGoatIntent(**intent)
            if "action" in intent
            else (
                detect_pack_goat_intent(str(req) or str(intent))
                or PackGoatIntent(action="routes_list")
            )
        )
    elif isinstance(intent, PackGoatIntent):
        parsed_intent = intent
    else:
        parsed_intent = detect_pack_goat_intent(str(intent)) or PackGoatIntent(action="routes_list")

    if parsed_intent.action in ("calculate_packing", "calculate"):
        calc_req = (
            req
            if isinstance(req, PackGoatRequest)
            else PackGoatRequest(route_id=parsed_intent.route_id or "wind-river-titcomb-basin")
        )
        calc_res = calculate_pack_goat_payload(calc_req)
        answer = (
            f"Pack-Goat Alpine Trekking Analysis for {calc_res.route_title}: "
            f"Payload status is {calc_res.payload_status.replace('_', ' ').title()} "
            f"({calc_res.total_payload_lbs} lbs, {calc_res.payload_percentage}% body weight). "
            f"Balance status: {calc_res.balance_status.replace('_', ' ').title()} "
            f"({calc_res.weight_difference_lbs} lbs delta). "
            f"Daily forage requirement: {calc_res.recommended_daily_forage_pellets_lbs} lbs weed-free pellets. "
            f"{calc_res.rigging_advisory} {calc_res.wildlife_mitigation_advisory}"
        )
        calc_info: dict[str, Any] = {
            "pack_goat_info": {
                "action": "calculate_packing",
                "route_id": calc_res.route_id,
                "calculation": calc_res.model_dump(),
            },
            "answer": answer,
        }
        return FormattedPackGoatResponse(answer, calc_info)

    if parsed_intent.action in ("gear_checklist", "gear"):
        checklist = get_pack_goat_gear_checklist()
        items_str = "; ".join(f"{item.name} ({item.purpose})" for item in checklist)
        answer = (
            f"Mandatory Pack-Goat Alpine Tack & Safety Checklist ({len(checklist)} items): "
            f"{items_str}. Handlers must carry certified weed-free forage, blaze orange vests, "
            "and an alpine highline kit to comply with wilderness regulations."
        )
        gear_info: dict[str, Any] = {
            "pack_goat_info": {
                "action": "gear_checklist",
                "gear": [item.model_dump() for item in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedPackGoatResponse(answer, gear_info)

    if parsed_intent.action == "route_detail" and parsed_intent.route_id:
        route = get_pack_goat_route(parsed_intent.route_id)
        if route:
            highlights_str = ", ".join(route.highlights)
            answer = (
                f"Pack-Goat Alpine Route: {route.title} ({route.wilderness_area}, {route.national_forest}). "
                f"Elevation: {route.elevation_m}m | Recommended Rigging: {route.saddle_rigging.replace('_', ' ').title()} | "
                f"Terrain Agility: {route.terrain_agility.replace('_', ' ').title()} | "
                f"Max String: {route.max_string_goats} goats | Typical Duration: {route.typical_days} days | "
                f"Bighorn Buffer: {route.bighorn_buffer_m}m. "
                f"{route.description} Key Highlights: {highlights_str}."
            )
            detail_info: dict[str, Any] = {
                "pack_goat_info": {
                    "action": "route_detail",
                    "route_id": route.route_id,
                    "route": route.model_dump(),
                },
                "answer": answer,
            }
            return FormattedPackGoatResponse(answer, detail_info)

    routes = get_pack_goat_routes(rigging=parsed_intent.saddle_rigging)
    summary_str = "; ".join(
        f"{r.title} ({r.elevation_m}m, {r.saddle_rigging}, {r.max_string_goats} goats max)"
        for r in routes
    )
    answer = (
        f"Contoso Pack-Goat Alpine Trekking Catalog ({len(routes)} iconic routes): {summary_str}. "
        "Ask about specific route details, pannier weight balance & forage calculations, "
        "or mandatory bighorn sheep separation buffers and blaze orange gear checklists."
    )
    list_info: dict[str, Any] = {
        "pack_goat_info": {
            "action": "routes_list",
            "saddle_rigging": parsed_intent.saddle_rigging,
            "routes": [r.model_dump() for r in routes],
        },
        "answer": answer,
    }
    return FormattedPackGoatResponse(answer, list_info)


def build_pack_goat_prompt(intent: Optional[PackGoatIntent] = None) -> str:
    lines = [
        "Backcountry Pack-Goat Alpine Packing & High-Pass Trekking Guidance:",
        "- Cloven-Hoofed Alpine Agility: Working wether pack goats (Alpine, Oberhasli, Saanen, Boer cross) excel on Class 2-3 granite talus and steep scree.",
        "- Pannier Payload & Balancing: Working capacity is 25-28% of body weight. Left and right panniers MUST be balanced within 1.0 lb (acceptable up to 2.5 lbs). Uneven loads cause saddle roll and spinal sores.",
        "- Bighorn Sheep Disease Buffer: Strict separation (100-200m buffer) is mandatory in all national forests to prevent Mycoplasma ovipneumoniae (M. ovi) transmission to wild bighorn sheep.",
        "- Certified Weed-Free Forage: Leave No Trace regulations require certified weed-free alfalfa/timothy pellets (~2.0% body weight daily) to protect alpine meadows.",
        "- Hunter Safety & Containment: Goats must wear blaze orange vests with brass bells during hunting seasons and be tethered overnight using tree-saver highlines.",
    ]
    if intent and intent.action == "route_detail" and intent.route_id:
        r = get_pack_goat_route(intent.route_id)
        if r:
            lines.append(
                f"- Focused Route: {r.title} ({r.wilderness_area}, {r.national_forest}, "
                f"Elevation: {r.elevation_m}m, Rigging: {r.saddle_rigging}, Bighorn Buffer: {r.bighorn_buffer_m}m)"
            )
    return "\n".join(lines)


def pack_goat_tool(
    request: Optional[PackGoatRequest] = None,
    action: Optional[str] = None,
    route_id: Optional[str] = None,
    saddle_rigging: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    """Tool for backcountry pack-goat alpine packing and route lookup."""
    if isinstance(request, PackGoatRequest):
        return calculate_pack_goat_payload(request)
    intent = kwargs.get("intent")
    if action in ("calculate_packing", "calculate") or "left_pannier_lbs" in kwargs:
        req = PackGoatRequest(
            route_id=route_id
            or (intent.route_id if intent else None)
            or "wind-river-titcomb-basin",
            goat_breed=str(kwargs.get("goat_breed", "alpine_dairy")),
            goat_body_weight_lbs=float(kwargs.get("goat_body_weight_lbs", 180.0)),
            left_pannier_lbs=float(kwargs.get("left_pannier_lbs", 18.0)),
            right_pannier_lbs=float(kwargs.get("right_pannier_lbs", 18.0)),
            saddle_pad_weight_lbs=float(kwargs.get("saddle_pad_weight_lbs", 6.0)),
            saddle_rigging=str(kwargs.get("saddle_rigging", "crossbuck_sawbuck")),
        )
        return calculate_pack_goat_payload(req)
    if action in ("gear_checklist", "gear"):
        return get_pack_goat_gear_checklist()
    target_route_id = route_id or (intent.route_id if intent else None)
    if action == "route_detail" and target_route_id:
        return get_pack_goat_route(target_route_id)
    return get_pack_goat_routes(
        rigging=saddle_rigging or (intent.saddle_rigging if intent else None)
    )
