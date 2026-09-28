from typing import Any, Optional

from pydantic import BaseModel


class MudflatRouteModel(BaseModel):
    route_id: str
    title: str
    estuary_location: str
    region: str
    route_distance_km: float
    tidal_window_hours: float
    max_silt_depth_cm: int
    terrain_profile: str
    description: str
    highlights: list[str]


class MudflatRequest(BaseModel):
    route_id: str = "wadden-sea-neuwerk-traverse"
    silt_depth_cm: float = 25.0
    trekker_pace_kph: float = 3.2
    elapsed_time_minutes: float = 45.0
    tidal_phase: str = "slack_low_tide"


class MudflatResponse(BaseModel):
    route_id: str
    route_title: str
    terrain_profile: str
    remaining_tidal_window_minutes: int
    silt_suction_drag_index: int
    prielen_wading_depth_cm: int
    tidal_hazard_rating: str
    evacuation_advisory: str
    navigation_guidance: str


class MudflatGearModel(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class MudflatIntent(BaseModel):
    action: str
    route_id: Optional[str] = None
    terrain_profile: Optional[str] = None


MUDFLAT_ROUTES: dict[str, MudflatRouteModel] = {
    "wadden-sea-neuwerk-traverse": MudflatRouteModel(
        route_id="wadden-sea-neuwerk-traverse",
        title="Wadden Sea Neuwerk Traverse",
        estuary_location="Cuxhaven-Sahlenburg to Neuwerk Island",
        region="Lower Saxony Wadden Sea National Park, Germany",
        route_distance_km=12.5,
        tidal_window_hours=4.0,
        max_silt_depth_cm=35,
        terrain_profile="soft_estuary_silt",
        description="Historic Wattwandern tidal flat traverse across exposed North Sea seabed from Sahlenburg to Neuwerk Island following traditional prikken markers.",
        highlights=[
            "Prikken-marked tidal fairway",
            "Duhner Loch tidal creek crossing",
            "Emergency rescue beacon cages (Rettungsbaken)",
        ],
    ),
    "bay-of-fundy-miners-marsh": MudflatRouteModel(
        route_id="bay-of-fundy-miners-marsh",
        title="Bay of Fundy Minas Basin Silt Traverse",
        estuary_location="Minas Basin, Wolfville",
        region="Nova Scotia, Canada",
        route_distance_km=8.5,
        tidal_window_hours=3.0,
        max_silt_depth_cm=50,
        terrain_profile="deep_quicksilt_ooze",
        description="Intense estuary silt trek across the red mud plains of Minas Basin, featuring the world's most extreme tidal range and thick quicksilt.",
        highlights=[
            "Extreme 16-meter tidal fluctuation",
            "Deep red mud suction plains",
            "Tidal bore surge warnings",
        ],
    ),
    "mont-saint-michel-bay": MudflatRouteModel(
        route_id="mont-saint-michel-bay",
        title="Mont-Saint-Michel Bay Silt Crossing",
        estuary_location="Bec d'Andaine to Mont-Saint-Michel",
        region="Normandy/Brittany, France",
        route_distance_km=14.0,
        tidal_window_hours=4.5,
        max_silt_depth_cm=40,
        terrain_profile="soft_estuary_silt",
        description="Venerable pilgrimage crossing across shifting silt flats and river channels where incoming tides advance at the speed of a galloping horse.",
        highlights=[
            "River Sée and Sélune channel crossings",
            "Lises quicksand demonstrations",
            "Iconic abbey destination panorama",
        ],
    ),
    "morecambe-bay-sands": MudflatRouteModel(
        route_id="morecambe-bay-sands",
        title="Morecambe Bay Queen's Guide Sands",
        estuary_location="Arnside to Kents Bank",
        region="Cumbria / Lancashire, UK",
        route_distance_km=13.0,
        tidal_window_hours=3.5,
        max_silt_depth_cm=25,
        terrain_profile="firm_compact_sand",
        description="Vast tidal sand crossing led under the heritage of the Queen's Guide to the Sands, navigating shifting channels and treacherous mudflats.",
        highlights=[
            "Official Queen's Guide navigation path",
            "River Kent estuary crossing",
            "Expansive intertidal sands and salt marshes",
        ],
    ),
    "turnagain-arm-mudflats": MudflatRouteModel(
        route_id="turnagain-arm-mudflats",
        title="Turnagain Arm Glacial Silt Flats",
        estuary_location="Turnagain Arm, Cook Inlet",
        region="Girdwood, Alaska, USA",
        route_distance_km=6.0,
        tidal_window_hours=2.5,
        max_silt_depth_cm=55,
        terrain_profile="deep_quicksilt_ooze",
        description="Extremely treacherous glacial flour silt mudflats subjected to dynamic Cook Inlet bore tides and high-risk liquefying silt entrapment.",
        highlights=[
            "Glacial silt liquefaction hazards",
            "Cook Inlet bore tide front",
            "Extreme suction entrapment risk",
        ],
    ),
}

MUDFLAT_GEAR_CHECKLIST: list[MudflatGearModel] = [
    MudflatGearModel(
        item_id="neoprene-mudflat-suction-booties",
        name="Reinforced Neoprene Mudflat Booties (Lugged Suction Sole)",
        category="footwear",
        mandatory=True,
        purpose="Prevents footwear loss from high silt vacuum suction and shields feet against razor-sharp Pacific oyster and cockle shells.",
    ),
    MudflatGearModel(
        item_id="wattwandern-wading-staff",
        name="Graduated Wattwandern Mudflat Staff / Prielen Probe (1.8m)",
        category="navigation_safety",
        mandatory=True,
        purpose="Probes quicksilt depths, verifies concealed tidal creek (Prielen) channels, and provides bracing against rushing channel currents.",
    ),
    MudflatGearModel(
        item_id="waterproof-tide-table-and-sighting-compass",
        name="Laminated Marine Tide Table Card & Sighting Compass",
        category="navigation",
        mandatory=True,
        purpose="Enables dead reckoning through dense sea fogs (Seenebel) and tracks strict tidal flood return deadlines.",
    ),
    MudflatGearModel(
        item_id="high-decibel-marine-whistle-signal-mirror",
        name="SOLAS High-Decibel Estuary Whistle & Peep-Sight Signal Mirror",
        category="emergency_signaling",
        mandatory=True,
        purpose="Delivers long-range acoustic and optical distress signaling across vast tidal mud flats when trapped by floodwaters.",
    ),
    MudflatGearModel(
        item_id="submersible-floating-vhf-radio-plb",
        name="Floating IPX8 Marine VHF Radio & Personal Locator Beacon",
        category="communications",
        mandatory=False,
        purpose="Broadcasts emergency distress calls to Maritime Rescue Coordination Centers and inshore lifeboats beyond mobile phone coverage.",
    ),
    MudflatGearModel(
        item_id="ultralight-hypothermia-mudflat-bivy",
        name="Windproof Reflective Hypothermia Mudflat Bivy Sac",
        category="exposure_protection",
        mandatory=False,
        purpose="Guards against rapid convective wind-chill and hypothermia if stranded on open mudflats or in tidal rescue cages.",
    ),
]


def get_mudflat_routes(terrain: Optional[str] = None) -> list[MudflatRouteModel]:
    routes = list(MUDFLAT_ROUTES.values())
    if not terrain:
        return routes
    norm = terrain.strip().lower().replace("-", "_").replace(" ", "_")
    return [r for r in routes if r.terrain_profile.lower() == norm]


def get_mudflat_route(route_id: str) -> Optional[MudflatRouteModel]:
    return MUDFLAT_ROUTES.get(route_id.strip().lower())


def get_mudflat_gear_checklist() -> list[MudflatGearModel]:
    return list(MUDFLAT_GEAR_CHECKLIST)


def calculate_mudflat_dynamics(req: MudflatRequest) -> MudflatResponse:
    route = get_mudflat_route(req.route_id)
    if not route:
        raise ValueError(f"Mudflat route '{req.route_id}' not found")

    remaining_tidal_window_minutes = max(
        0, int(round(route.tidal_window_hours * 60.0 - req.elapsed_time_minutes))
    )

    terrain_factor = {
        "firm_compact_sand": 1,
        "shell_gravel_shallows": 2,
        "soft_estuary_silt": 3,
        "deep_quicksilt_ooze": 5,
    }.get(route.terrain_profile, 3)

    silt_suction_drag_index = min(
        10, max(1, int(round((req.silt_depth_cm / 8.0) + terrain_factor)))
    )

    phase_offset = (
        30
        if req.tidal_phase == "mid_flood_rising"
        else (65 if req.tidal_phase == "spring_bore_incoming" else 10)
    )
    prielen_wading_depth_cm = int(round(req.silt_depth_cm * 1.4 + phase_offset))

    if (
        remaining_tidal_window_minutes < 40
        or req.silt_depth_cm > 45.0
        or req.tidal_phase == "spring_bore_incoming"
    ):
        tidal_hazard_rating = "hazardous_quicksilt_tidal_entrapment"
        evacuation_advisory = (
            "CRITICAL EVACUATION PROTOCOL: Immediate withdrawal required. Move perpendicular to tidal creeks toward elevated beacon cages (Rettungsbaken) or nearest shoreline. Do not struggle in deep quicksilt; spread body weight horizontally."
        )
        navigation_guidance = (
            "EMERGENCY RETREAT: Abandon silt traverse immediately. Follow primary prikken fairway or GPS bearing to high ground. Sound whistle blasts (3 short) and prepare emergency VHF/PLB signaling."
        )
    elif (
        remaining_tidal_window_minutes < 75
        or req.silt_depth_cm >= 30.0
        or req.tidal_phase == "mid_flood_rising"
    ):
        tidal_hazard_rating = "caution_accelerated_flood_return"
        evacuation_advisory = (
            "CAUTIONARY TIDE ADVISORY: Flood waters advancing through prielen creeks faster than visual flat rise. Maintain accelerated trekking cadence and bypass deep silt gullies."
        )
        navigation_guidance = (
            "ACCELERATED TRANSIT: Probe forward silt depth with wading staff before each step. Keep close visual sight of prikken markers and avoid detours into low-lying mud swales."
        )
    else:
        tidal_hazard_rating = "safe_low_tide_window"
        evacuation_advisory = (
            "OPTIMAL LOW TIDE WINDOW: Tidal flats exposed and stable for transit. Maintain steady pace and monitor scheduled low water turn."
        )
        navigation_guidance = (
            "STANDARD TRAVERSE: Follow brushwood prikken lines. Step with flat-footed mud gait to distribute ground pressure over soft silt layers."
        )

    return MudflatResponse(
        route_id=route.route_id,
        route_title=route.title,
        terrain_profile=route.terrain_profile,
        remaining_tidal_window_minutes=remaining_tidal_window_minutes,
        silt_suction_drag_index=silt_suction_drag_index,
        prielen_wading_depth_cm=prielen_wading_depth_cm,
        tidal_hazard_rating=tidal_hazard_rating,
        evacuation_advisory=evacuation_advisory,
        navigation_guidance=navigation_guidance,
    )


def detect_mudflat_intent(query: str) -> Optional[MudflatIntent]:
    if not query or not query.strip():
        return None

    q = query.lower()

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
        "llama",
        "pack llama",
        "zipline",
        "zip line",
        "turtle patrol",
        "sea turtle",
        "night via ferrata",
        "via ferrata",
        "canyon bouldering",
        "bouldering",
        "rentals",
        "rental",
    ]
    if any(ex in q for ex in exclusions):
        return None

    keywords = [
        "mudflat trekking",
        "mudflat hiking",
        "wattwandern",
        "estuary silt",
        "tidal flat traverse",
        "quicksilt",
        "prikken marker",
        "prielen creek",
        "bore tide walking",
        "wadden sea crossing",
        "bay of fundy mud",
    ]

    has_keyword = any(k in q for k in keywords)

    is_mudflat_context = (
        (
            "mudflat" in q
            or "mud flat" in q
            or "tidal flat" in q
            or "wattwandern" in q
            or "estuary silt" in q
            or "quicksilt" in q
            or "prielen" in q
            or "prikken" in q
            or "wadden" in q
            or "neuwerk" in q
            or "minas basin" in q
            or "fundy" in q
            or "mont-saint-michel" in q
            or "mont saint michel" in q
            or "morecambe" in q
            or "queen's guide" in q
            or "queens guide" in q
            or "turnagain" in q
        )
        and (
            "trekking" in q
            or "hiking" in q
            or "walking" in q
            or "traverse" in q
            or "crossing" in q
            or "silt" in q
            or "mud" in q
            or "tide" in q
            or "tidal" in q
            or "creek" in q
            or "wading" in q
            or "suction" in q
            or "booties" in q
            or "staff" in q
            or "window" in q
            or "route" in q
            or "routes" in q
            or "gear" in q
            or "calculate" in q
            or "sand" in q
            or "sands" in q
            or "terrain" in q
            or "marsh" in q
        )
    )

    if not (has_keyword or is_mudflat_context):
        return None

    route_id = None
    if "wadden" in q or "neuwerk" in q or "sahlenburg" in q:
        route_id = "wadden-sea-neuwerk-traverse"
    elif "fundy" in q or "miners marsh" in q or "minas basin" in q:
        route_id = "bay-of-fundy-miners-marsh"
    elif "mont-saint-michel" in q or "mont saint michel" in q or "bec d'andaine" in q:
        route_id = "mont-saint-michel-bay"
    elif "morecambe" in q or "queen's guide" in q or "queens guide" in q or "arnside" in q:
        route_id = "morecambe-bay-sands"
    elif "turnagain" in q or "cook inlet" in q or "girdwood" in q:
        route_id = "turnagain-arm-mudflats"

    terrain_profile = None
    if "firm_compact_sand" in q or "compact sand" in q:
        terrain_profile = "firm_compact_sand"
    elif "shell_gravel_shallows" in q or "shell gravel" in q:
        terrain_profile = "shell_gravel_shallows"
    elif "deep_quicksilt_ooze" in q or "deep quicksilt" in q or "quicksilt ooze" in q:
        terrain_profile = "deep_quicksilt_ooze"
    elif "soft_estuary_silt" in q or "soft silt" in q or "estuary silt" in q:
        terrain_profile = "soft_estuary_silt"

    if any(
        k in q
        for k in [
            "gear",
            "checklist",
            "equipment",
            "booties",
            "wading staff",
            "probe",
            "whistle",
            "bivy",
            "vhf",
            "tide table",
        ]
    ):
        action = "gear"
    elif any(
        k in q
        for k in [
            "calculate",
            "dynamics",
            "suction",
            "drag",
            "prielen",
            "wading depth",
            "tidal window",
            "remaining window",
            "hazard rating",
            "pace",
            "minutes",
            "depth",
        ]
    ):
        action = "calculate"
    elif route_id and any(
        k in q
        for k in [
            "detail",
            "details",
            "about",
            "tell me about",
            "highlights",
            "description",
            "distance",
            "location",
            "tide window",
            "silt depth",
        ]
    ):
        action = "route_detail"
    elif any(
        k in q
        for k in [
            "routes",
            "catalog",
            "options",
            "list",
            "traverses",
            "trails",
            "crossings",
        ]
    ) or " all " in f" {q} ":
        action = "routes_list"
    elif route_id:
        action = "route_detail"
    else:
        action = "routes_list"

    return MudflatIntent(
        action=action,
        route_id=route_id,
        terrain_profile=terrain_profile,
    )


class FormattedMudflatResponse(str):
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


def format_mudflat_response(
    data_or_intent: Any,
    query: str = "",
) -> FormattedMudflatResponse:
    if isinstance(data_or_intent, dict):
        answer = data_or_intent.get("answer", "Wilderness mudflat trekking response")
        return FormattedMudflatResponse(answer, data_or_intent)

    intent: MudflatIntent
    if isinstance(data_or_intent, MudflatIntent):
        intent = data_or_intent
    else:
        detected = detect_mudflat_intent(str(data_or_intent))
        intent = detected or MudflatIntent(action="routes_list")

    if intent.action in ("calculate", "calculate_dynamics"):
        target_route_id = intent.route_id or "wadden-sea-neuwerk-traverse"
        calc_req = MudflatRequest(route_id=target_route_id)
        calc_res = calculate_mudflat_dynamics(calc_req)
        answer = (
            f"Wilderness Tidal Flat Mud-Trekking Dynamics for {calc_res.route_title} ({calc_res.terrain_profile}): "
            f"Tidal hazard rating: {calc_res.tidal_hazard_rating.upper()}. "
            f"Remaining tidal window: {calc_res.remaining_tidal_window_minutes} minutes. "
            f"Silt suction drag index: {calc_res.silt_suction_drag_index}/10. "
            f"Prielen wading depth: {calc_res.prielen_wading_depth_cm} cm. "
            f"Evacuation advisory: {calc_res.evacuation_advisory} "
            f"Navigation guidance: {calc_res.navigation_guidance}"
        )
        calc_info: dict[str, Any] = {
            "mudflat_trekking_info": {
                "action": "calculate",
                "route_id": calc_res.route_id,
                "calculation": calc_res.model_dump(),
                "remaining_tidal_window_minutes": calc_res.remaining_tidal_window_minutes,
                "silt_suction_drag_index": calc_res.silt_suction_drag_index,
                "prielen_wading_depth_cm": calc_res.prielen_wading_depth_cm,
                "tidal_hazard_rating": calc_res.tidal_hazard_rating,
                "evacuation_advisory": calc_res.evacuation_advisory,
                "navigation_guidance": calc_res.navigation_guidance,
            },
            "answer": answer,
        }
        return FormattedMudflatResponse(answer, calc_info)

    if intent.action in ("gear", "gear_checklist"):
        checklist = get_mudflat_gear_checklist()
        items_str = "; ".join(f"{g.name} ({g.purpose})" for g in checklist[:3])
        answer = (
            f"Mandatory Wilderness Tidal Flat Mud-Trekking Gear Checklist ({len(checklist)} items): "
            f"{items_str}; plus {', '.join(g.name for g in checklist[3:])}. "
            "Reinforced neoprene suction booties, graduated wading staffs, and SOLAS signaling kits are essential."
        )
        gear_info: dict[str, Any] = {
            "mudflat_trekking_info": {
                "action": "gear",
                "gear": [g.model_dump() for g in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedMudflatResponse(answer, gear_info)

    if intent.action in ("route_detail", "detail") and intent.route_id:
        route = get_mudflat_route(intent.route_id)
        if route:
            highlights_str = "; ".join(route.highlights)
            answer = (
                f"Wilderness Tidal Flat Route: {route.title} ({route.estuary_location}, {route.region}). "
                f"Distance: {route.route_distance_km}km | Tidal Window: {route.tidal_window_hours}h | "
                f"Max Silt Depth: {route.max_silt_depth_cm}cm | Terrain: {route.terrain_profile.replace('_', ' ').title()}. "
                f"{route.description} Highlights: {highlights_str}."
            )
            detail_info: dict[str, Any] = {
                "mudflat_trekking_info": {
                    "action": "route_detail",
                    "route_id": route.route_id,
                    "route": route.model_dump(),
                },
                "answer": answer,
            }
            return FormattedMudflatResponse(answer, detail_info)

    routes = get_mudflat_routes(terrain=intent.terrain_profile)
    routes_summary = "; ".join(
        f"{r.title} ({r.terrain_profile}, {r.route_distance_km}km, window {r.tidal_window_hours}h)"
        for r in routes
    )
    answer = (
        f"Contoso Wilderness Tidal Flat Mud-Trekking Catalog ({len(routes)} routes): "
        f"{routes_summary}. Inquire about tidal return window dynamics, prielen creek wading depths, "
        f"quicksilt suction drag calculations, or mandatory Wattwandern mud gear."
    )
    list_info: dict[str, Any] = {
        "mudflat_trekking_info": {
            "action": "routes_list",
            "terrain_profile": intent.terrain_profile,
            "routes": [r.model_dump() for r in routes],
        },
        "answer": answer,
    }
    return FormattedMudflatResponse(answer, list_info)


def build_mudflat_trekking_prompt(
    intent: Optional[MudflatIntent] = None,
) -> str:
    lines = [
        "Wilderness Tidal Flat Mud-Trekking & Estuary Silt Traversing Guidance:",
        "- Tidal Return Window Tracking: Never exceed scheduled low-tide windows. Tides in estuaries and bays can surge faster than a runner, creating catastrophic entrapment risk.",
        "- Prielen Creek Wading: Tidal gullies (Prielen) refill first with ferocious undertows. Probe creek depths with a graduated wading staff before attempting crossings.",
        "- Quicksilt Entrapment Avoidance: Liquefying mud and quicksilt create high vacuum drag suction. Never fight suction vertically; lean forward flat-footed, roll on your back if needed, and distribute body weight.",
        "- Wattwandern Prikken Markers: Maintain continuous line of sight with brushwood prikken fairways. Sea fogs (Seenebel) can obscure visibility in minutes.",
        "- Mandatory Mudflat Kit: Reinforced Neoprene Mudflat Booties, Graduated Wading Staff, Marine Tide Table & Compass, SOLAS Whistle/Signal Mirror, VHF Radio, and Emergency Hypothermia Bivy.",
    ]
    if intent and intent.route_id:
        r = get_mudflat_route(intent.route_id)
        if r:
            lines.append(
                f"- Selected Route: {r.title} ({r.estuary_location}, {r.region})\n"
                f"  Distance: {r.route_distance_km}km | Window: {r.tidal_window_hours}h | Terrain: {r.terrain_profile}\n"
                f"  Max Silt Depth: {r.max_silt_depth_cm}cm\n"
                f"  Description: {r.description}\n"
                f"  Highlights: {'; '.join(r.highlights)}"
            )
    return "\n".join(lines)


def mudflat_trekking_tool(
    request: Optional[MudflatRequest] = None,
    action: Optional[str] = None,
    route_id: Optional[str] = None,
    terrain_profile: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    if action == "calculate" or request is not None:
        calc_req = request or MudflatRequest(
            route_id=route_id or "wadden-sea-neuwerk-traverse"
        )
        res = calculate_mudflat_dynamics(calc_req)
        formatted = format_mudflat_response(
            MudflatIntent(action="calculate", route_id=res.route_id)
        )
        return dict(formatted._data)

    intent = MudflatIntent(
        action=action or "routes_list",
        route_id=route_id,
        terrain_profile=terrain_profile,
    )
    formatted = format_mudflat_response(intent)
    return dict(formatted._data)
