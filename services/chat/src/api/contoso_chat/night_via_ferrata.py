from typing import Any, Optional

from pydantic import BaseModel


class NightViaFerrataRouteModel(BaseModel):
    route_id: str
    title: str
    mountain_range: str
    region: str
    route_elevation_m: int
    suspension_bridge_span_m: int
    vertical_drop_m: int
    nocturnal_style: str
    max_grade: str
    description: str
    highlights: list[str]


class NightViaFerrataRequest(BaseModel):
    route_id: str = "dolomites-kellner-night-traverse"
    moonlight_condition: str = "quarter_crescent"
    headlamp_lumens: float = 800.0
    wind_gusts_kph: float = 25.0
    temperature_c: float = 2.0


class NightViaFerrataResponse(BaseModel):
    route_id: str
    route_title: str
    nocturnal_style: str
    max_grade: str
    effective_visibility_meters: int
    bridge_sway_amplitude_cm: int
    hypothermia_risk_index: int
    safety_rating: str
    lighting_recommendation: str
    nocturnal_advisory: str


class NightViaFerrataGearModel(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class NightViaFerrataIntent(BaseModel):
    action: str
    route_id: Optional[str] = None
    nocturnal_style: Optional[str] = None


NIGHT_VIA_FERRATA_ROUTES: dict[str, NightViaFerrataRouteModel] = {
    "dolomites-kellner-night-traverse": NightViaFerrataRouteModel(
        route_id="dolomites-kellner-night-traverse",
        title="Dolomites Kellner Night Traverse",
        mountain_range="Dolomites (Brenta Group)",
        region="Trentino-Alto Adige, Italy",
        route_elevation_m=2580,
        suspension_bridge_span_m=45,
        vertical_drop_m=620,
        nocturnal_style="moonlight_ridge",
        max_grade="grade_d_very_difficult",
        description="Legendary nocturnal iron way traversing soaring limestone pinnacles and exposed suspension bridges under Brenta moonlight.",
        highlights=[
            "45m swaying suspension wire bridge",
            "Bocchette Centrali moonlit towers",
            "Sheer 600m nocturnal drop-offs",
        ],
    ),
    "ouray-canyon-night-ferrata": NightViaFerrataRouteModel(
        route_id="ouray-canyon-night-ferrata",
        title="Ouray Uncompahgre Gorge Night Ferrata",
        mountain_range="San Juan Mountains",
        region="Ouray, Colorado, USA",
        route_elevation_m=2370,
        suspension_bridge_span_m=35,
        vertical_drop_m=180,
        nocturnal_style="starlight_gorge",
        max_grade="grade_c_difficult",
        description="Dramatic nocturnal gorge crossing suspended over the roaring Uncompahgre River under dark canyon skies.",
        highlights=[
            "Roaring gorge night acoustics",
            "35m suspended river sky bridge",
            "Polished quartzite night rung climbing",
        ],
    ),
    "telluride-krogerata-moonlight": NightViaFerrataRouteModel(
        route_id="telluride-krogerata-moonlight",
        title="Telluride Krogerata Midnight Iron Way",
        mountain_range="San Juan Mountains",
        region="Telluride, Colorado, USA",
        route_elevation_m=3120,
        suspension_bridge_span_m=20,
        vertical_drop_m=320,
        nocturnal_style="midnight_amphitheater",
        max_grade="grade_c_difficult",
        description="High-alpine nocturnal ledge traverse across the sheer Ajax Peak amphitheater with midnight vistas of Bridal Veil Falls.",
        highlights=[
            "The Main Event sheer ledge in moonlight",
            "Bridal Veil Falls starlight mist",
            "High-altitude 3120m exposure",
        ],
    ),
    "mammoth-pass-starlight-traverse": NightViaFerrataRouteModel(
        route_id="mammoth-pass-starlight-traverse",
        title="Mammoth Pass Starlight Ridge Traverse",
        mountain_range="Sierra Nevada",
        region="Mammoth Lakes, California, USA",
        route_elevation_m=2980,
        suspension_bridge_span_m=30,
        vertical_drop_m=290,
        nocturnal_style="starlight_crest",
        max_grade="grade_e_extremely_difficult",
        description="Sustained nocturnal iron crest traverse across volcanic spires with a suspended 30m cable span beneath dark Sierra skies.",
        highlights=[
            "30m aerial wire bridge suspension",
            "Overhanging dark-sky face ladder",
            "High Sierra starlight panorama",
        ],
    ),
    "chamonix-aiguilles-rouges-darksky": NightViaFerrataRouteModel(
        route_id="chamonix-aiguilles-rouges-darksky",
        title="Chamonix Aiguilles Rouges Dark Sky Traverse",
        mountain_range="Mont Blanc Massif",
        region="Chamonix-Mont-Blanc, France",
        route_elevation_m=2525,
        suspension_bridge_span_m=40,
        vertical_drop_m=480,
        nocturnal_style="dark_sky_face",
        max_grade="grade_d_very_difficult",
        description="Alpine dark-sky nocturnal face traverse overlooking the gleaming Mont Blanc glacier chain under pure starlight.",
        highlights=[
            "Glacier reflection moonlight",
            "40m Himalayan suspension wire bridge",
            "Mont Blanc illuminated summit views",
        ],
    ),
}

NIGHT_VIA_FERRATA_GEAR: list[NightViaFerrataGearModel] = [
    NightViaFerrataGearModel(
        item_id="high-lumen-dual-beam-headlamp",
        name="1000+ Lumen Dual-Beam Rechargeable Alpine Headlamp with Cold-Weather Battery Pack",
        category="lighting",
        mandatory=True,
        purpose="Provides high-output spot and flood illumination (>800 lumens) to illuminate distant cable anchors and immediate footing.",
    ),
    NightViaFerrataGearModel(
        item_id="backup-helmet-mounted-light",
        name="Secondary Independent Helmet-Mounted Backup Light (400 Lumen, Red/White)",
        category="lighting",
        mandatory=True,
        purpose="Redundant failsafe light source mounted to helmet shell to prevent pitch-black immobilization during primary headlamp failure.",
    ),
    NightViaFerrataGearModel(
        item_id="en958-nocturnal-energy-absorber",
        name="EN 958:2017 Certified Y-Lanyard with High-Vis Reflective Arms & Tear Absorber",
        category="fall_arrest",
        mandatory=True,
        purpose="Absorbs extreme fall arrest forces on steel cables with reflective sleeve webbing for low-light tether tracking.",
    ),
    NightViaFerrataGearModel(
        item_id="type-k-glow-locking-carabiners",
        name="Type K Ergonomic Palm-Squeeze Auto-Lock Carabiners with Luminescent Gate Indicators",
        category="carabiners_hardware",
        mandatory=True,
        purpose="Wide-gate Klettersteig carabiners featuring photoluminescent gate collars for visual confirmation of locked status in darkness.",
    ),
    NightViaFerrataGearModel(
        item_id="insulated-windproof-via-ferrata-gloves",
        name="Thermal Windproof Full-Finger Via Ferrata Gloves with Kevlar Palm Reinforcement",
        category="apparel_footwear",
        mandatory=True,
        purpose="Protects against steel wire barbs, cold cable thermal conduction, and sub-zero alpine wind chill.",
    ),
    NightViaFerrataGearModel(
        item_id="reflective-alpine-harness-rest-sling",
        name="High-Visibility Reflective Climbing Harness with Certified Rest Lanyard",
        category="harness_rest",
        mandatory=True,
        purpose="CE/UIAA certified harness with 360-degree retro-reflective accents and short rest sling for hands-free anchor resting.",
    ),
]


def get_night_via_ferrata_routes(
    style: Optional[str] = None,
) -> list[NightViaFerrataRouteModel]:
    routes = list(NIGHT_VIA_FERRATA_ROUTES.values())
    if not style:
        return routes
    norm = style.strip().lower().replace("-", "_").replace(" ", "_")
    return [r for r in routes if r.nocturnal_style.lower() == norm]


def get_night_via_ferrata_route(route_id: str) -> Optional[NightViaFerrataRouteModel]:
    return NIGHT_VIA_FERRATA_ROUTES.get(route_id.strip().lower())


def get_night_via_ferrata_gear_checklist() -> list[NightViaFerrataGearModel]:
    return list(NIGHT_VIA_FERRATA_GEAR)


def calculate_night_via_ferrata_dynamics(
    req: NightViaFerrataRequest,
) -> NightViaFerrataResponse:
    route = get_night_via_ferrata_route(req.route_id)
    if not route:
        raise ValueError(f"Night via ferrata route '{req.route_id}' not found")

    moon_factors = {
        "full_moon_glare": 1.5,
        "quarter_crescent": 1.0,
        "starlight_overcast": 0.7,
        "new_moon_pitch_black": 0.5,
    }
    moon_factor = moon_factors.get(req.moonlight_condition, 1.0)

    effective_visibility_meters = int(
        min(120.0, round((req.headlamp_lumens / 15.0) * moon_factor))
    )
    bridge_sway_amplitude_cm = int(
        round((route.suspension_bridge_span_m * 0.4) * (req.wind_gusts_kph / 20.0))
    )
    hypothermia_risk_index = int(
        max(
            1,
            min(
                10,
                round(5.0 - (req.temperature_c * 0.3) + (req.wind_gusts_kph * 0.05)),
            ),
        )
    )

    if (
        (req.headlamp_lumens < 400.0 and req.moonlight_condition == "new_moon_pitch_black")
        or req.wind_gusts_kph > 55.0
        or req.temperature_c < -10.0
    ):
        safety_rating = "hazardous_zero_visibility_abort"
        lighting_recommendation = (
            "Abort ascent: Insufficient headlamp output under pitch-black celestial conditions "
            "or extreme gale/freezing wind chill prevents safe wire transitions."
        )
        nocturnal_advisory = (
            "CRITICAL HAZARD: Extreme wind gusts (>55 kph), severe freezing temperatures (<-10°C), "
            "or pitch darkness induce severe hypothermia risk and violent bridge oscillations. Postpone nocturnal traverse."
        )
    elif (
        req.headlamp_lumens < 700.0
        or req.wind_gusts_kph >= 35.0
        or req.temperature_c <= 0.0
    ):
        safety_rating = "caution_high_headlamp_beam_required"
        lighting_recommendation = (
            "Deploy dual-beam lighting system (>800 lumens) with secondary helmet backup "
            "and wide-angle peripheral diffusion for anchor acquisition."
        )
        nocturnal_advisory = (
            "CAUTION: Sub-freezing exposure, elevated wind gusts, or sub-700 lumen headlamps require "
            "vigilant two-point tether transitions and windproof thermal layers."
        )
    else:
        safety_rating = "optimal_moonlight_ascent"
        lighting_recommendation = (
            "Maintain regulated 800+ lumen spot beam complemented by natural moonlight illumination "
            "for optimal rock and rung contrast."
        )
        nocturnal_advisory = (
            "OPTIMAL MOONLIGHT CONDITIONS: Favorable alpine atmosphere and stable winds permit "
            "safe nocturnal iron way navigation with standard dual-clip safety protocols."
        )

    return NightViaFerrataResponse(
        route_id=route.route_id,
        route_title=route.title,
        nocturnal_style=route.nocturnal_style,
        max_grade=route.max_grade,
        effective_visibility_meters=effective_visibility_meters,
        bridge_sway_amplitude_cm=bridge_sway_amplitude_cm,
        hypothermia_risk_index=hypothermia_risk_index,
        safety_rating=safety_rating,
        lighting_recommendation=lighting_recommendation,
        nocturnal_advisory=nocturnal_advisory,
    )


def detect_night_via_ferrata_intent(query: str) -> Optional[NightViaFerrataIntent]:
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
        "rentals",
        "rental",
    ]
    if any(ex in q for ex in exclusions):
        return None

    night_keywords = [
        "night via ferrata",
        "moonlight via ferrata",
        "nocturnal ferrata",
        "night iron way",
        "moonlight traverse",
        "night suspension bridge",
        "kellner night traverse",
        "krogerata midnight",
        "ouray night ferrata",
        "dolomites night via ferrata",
        "night ferrata",
        "moonlight cliff",
        "moonlight iron way",
        "midnight iron way",
        "starlight traverse",
        "darksky traverse",
        "dark sky traverse",
        "night via-ferrata",
    ]

    has_night_keyword = any(k in q for k in night_keywords)

    # Also detect general night + ferrata combinations
    is_ferrata_context = (
        (
            "ferrata" in q
            or "iron way" in q
            or "klettersteig" in q
            or "traverse" in q
            or "ridge" in q
            or "face" in q
            or "gorge" in q
            or "kellner" in q
            or "krogerata" in q
            or "aiguilles rouges" in q
        )
        and (
            "night" in q
            or "moonlight" in q
            or "midnight" in q
            or "nocturnal" in q
            or "starlight" in q
            or "dark sky" in q
            or "darksky" in q
        )
    )

    is_night_climb_specific = (
        ("headlamp lumens" in q or "bridge sway" in q or "suspension bridge sway" in q)
        and ("climb" in q or "ferrata" in q or "traverse" in q or "kellner" in q or "krogerata" in q or "night" in q)
    )

    if not (has_night_keyword or is_ferrata_context or is_night_climb_specific):
        return None

    route_id = None
    if "kellner" in q or "brenta" in q or "dolomites" in q:
        route_id = "dolomites-kellner-night-traverse"
    elif "ouray" in q or "uncompahgre" in q:
        route_id = "ouray-canyon-night-ferrata"
    elif "krogerata" in q or "telluride" in q or "bridal veil" in q:
        route_id = "telluride-krogerata-moonlight"
    elif "mammoth" in q:
        route_id = "mammoth-pass-starlight-traverse"
    elif "chamonix" in q or "aiguilles rouges" in q or "mont blanc" in q:
        route_id = "chamonix-aiguilles-rouges-darksky"

    nocturnal_style = None
    if "moonlight_ridge" in q or "moonlight ridge" in q:
        nocturnal_style = "moonlight_ridge"
    elif "starlight_gorge" in q or "starlight gorge" in q:
        nocturnal_style = "starlight_gorge"
    elif "midnight_amphitheater" in q or "midnight amphitheater" in q:
        nocturnal_style = "midnight_amphitheater"
    elif "starlight_crest" in q or "starlight crest" in q:
        nocturnal_style = "starlight_crest"
    elif "dark_sky_face" in q or "dark sky face" in q:
        nocturnal_style = "dark_sky_face"

    if any(
        k in q
        for k in [
            "gear",
            "checklist",
            "equipment",
            "mandatory gear",
            "safety gear",
        ]
    ):
        action = "gear"
    elif any(
        k in q
        for k in [
            "calculate",
            "sway",
            "amplitude",
            "visibility",
            "lumens",
            "wind gusts",
            "hypothermia",
            "risk index",
            "dynamics",
            "physics",
        ]
    ):
        action = "calculate"
    elif any(
        k in q
        for k in [
            "harness",
            "carabiner",
            "lanyard",
            "gloves",
            "backup light",
            "luminescent",
            "kit",
            "mandatory",
        ]
    ):
        action = "gear"
    elif route_id and any(
        k in q
        for k in [
            "detail",
            "details",
            "about",
            "tell me about",
            "highlights",
            "elevation",
            "drop",
            "bridge span",
            "span",
            "description",
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
            "all",
            "traverses",
            "styles",
            "nocturnal style",
        ]
    ):
        action = "routes_list"
    elif route_id:
        action = "route_detail"
    else:
        action = "routes_list"

    return NightViaFerrataIntent(
        action=action,
        route_id=route_id,
        nocturnal_style=nocturnal_style,
    )


class FormattedNightViaFerrataResponse(str):
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


def format_night_via_ferrata_response(
    data_or_intent: Any,
    query: str = "",
) -> FormattedNightViaFerrataResponse:
    if isinstance(data_or_intent, dict):
        answer = data_or_intent.get("answer", "Alpine via ferrata night suspension response")
        return FormattedNightViaFerrataResponse(answer, data_or_intent)

    intent: NightViaFerrataIntent
    if isinstance(data_or_intent, NightViaFerrataIntent):
        intent = data_or_intent
    else:
        detected = detect_night_via_ferrata_intent(str(data_or_intent))
        intent = detected or NightViaFerrataIntent(action="routes_list")

    if intent.action in ("calculate", "calculate_dynamics"):
        target_route_id = intent.route_id or "dolomites-kellner-night-traverse"
        calc_req = NightViaFerrataRequest(route_id=target_route_id)
        calc_res = calculate_night_via_ferrata_dynamics(calc_req)
        answer = (
            f"Alpine Via Ferrata Night Suspension Analysis for {calc_res.route_title} ({calc_res.nocturnal_style}): "
            f"Safety rating: {calc_res.safety_rating.upper()}. "
            f"Effective visibility: {calc_res.effective_visibility_meters}m. "
            f"Suspension bridge sway amplitude: {calc_res.bridge_sway_amplitude_cm}cm. "
            f"Hypothermia risk index: {calc_res.hypothermia_risk_index}/10. "
            f"Lighting recommendation: {calc_res.lighting_recommendation} "
            f"Nocturnal advisory: {calc_res.nocturnal_advisory}"
        )
        calc_info: dict[str, Any] = {
            "night_via_ferrata_info": {
                "action": "calculate",
                "route_id": calc_res.route_id,
                "calculation": calc_res.model_dump(),
                "effective_visibility_meters": calc_res.effective_visibility_meters,
                "bridge_sway_amplitude_cm": calc_res.bridge_sway_amplitude_cm,
                "hypothermia_risk_index": calc_res.hypothermia_risk_index,
                "safety_rating": calc_res.safety_rating,
            },
            "answer": answer,
        }
        return FormattedNightViaFerrataResponse(answer, calc_info)

    if intent.action in ("gear", "gear_checklist"):
        checklist = get_night_via_ferrata_gear_checklist()
        items_str = "; ".join(f"{g.name} ({g.purpose})" for g in checklist[:3])
        answer = (
            f"Mandatory Alpine Via Ferrata Nocturnal Gear Checklist ({len(checklist)} items): "
            f"{items_str}; plus {', '.join(g.name for g in checklist[3:])}. "
            "Dual-beam 1000+ lumen headlamps and luminescent Type K carabiner gate confirmation are mandatory."
        )
        gear_info: dict[str, Any] = {
            "night_via_ferrata_info": {
                "action": "gear",
                "gear": [g.model_dump() for g in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedNightViaFerrataResponse(answer, gear_info)

    if intent.action in ("route_detail", "detail") and intent.route_id:
        route = get_night_via_ferrata_route(intent.route_id)
        if route:
            highlights_str = "; ".join(route.highlights)
            answer = (
                f"Alpine Night Via Ferrata: {route.title} ({route.mountain_range}, {route.region}). "
                f"Nocturnal Style: {route.nocturnal_style.replace('_', ' ').title()} | Grade: {route.max_grade} | "
                f"Elevation: {route.route_elevation_m}m | Vertical Drop: {route.vertical_drop_m}m | "
                f"Suspension Bridge Span: {route.suspension_bridge_span_m}m. "
                f"{route.description} Highlights: {highlights_str}."
            )
            detail_info: dict[str, Any] = {
                "night_via_ferrata_info": {
                    "action": "route_detail",
                    "route_id": route.route_id,
                    "route": route.model_dump(),
                },
                "answer": answer,
            }
            return FormattedNightViaFerrataResponse(answer, detail_info)

    routes = get_night_via_ferrata_routes(style=intent.nocturnal_style)
    routes_summary = "; ".join(
        f"{r.title} ({r.nocturnal_style}, {r.max_grade}, {r.suspension_bridge_span_m}m bridge)"
        for r in routes
    )
    answer = (
        f"Contoso Alpine Via Ferrata Night Suspension & Moonlight Traverse Catalog ({len(routes)} routes): "
        f"{routes_summary}. Ask about suspension bridge wind sway calculations, headlamp lumen requirements, "
        f"or mandatory nocturnal safety gear."
    )
    list_info: dict[str, Any] = {
        "night_via_ferrata_info": {
            "action": "routes_list",
            "nocturnal_style": intent.nocturnal_style,
            "routes": [r.model_dump() for r in routes],
        },
        "answer": answer,
    }
    return FormattedNightViaFerrataResponse(answer, list_info)


def build_night_via_ferrata_prompt(
    intent: Optional[NightViaFerrataIntent] = None,
) -> str:
    lines = [
        "Alpine Via Ferrata Night Suspension & Moonlight Traverse Guidance:",
        "- Nocturnal Iron Way Dynamics: Night cliff traversing introduces severe depth perception degradation and thermal loss. Climbers must utilize minimum 800+ lumen dual-beam headlamps (spot + flood) and wear insulated Kevlar-reinforced gloves to mitigate freezing steel cable conduction.",
        "- Suspension Bridge Wind Oscillations: Aerial wire suspension bridges sway with wind gusts (amplitude ~ (span * 0.4) * (wind / 20)). Climbers must maintain two independent points of attachment with Type K auto-locking carabiners featuring luminescent lock indicators.",
        "- Hypothermia & Exposure Risk: Sub-zero alpine temperatures combined with ridge wind chills generate high hypothermia risks on static iron rungs. Rest lanyards must be clipped to solid pigtail anchors, never resting on tearing energy absorbers.",
        "- Mandatory 6-Item Nocturnal Kit: 1000+ Lumen Dual-Beam Alpine Headlamp, Secondary Helmet-Mounted Backup Light, EN 958 Reflective Y-Lanyard, Luminescent Type K Auto-Lock Carabiners, Thermal Windproof Gloves, Reflective Sit Harness with Rest Lanyard.",
    ]
    if intent and intent.route_id:
        r = get_night_via_ferrata_route(intent.route_id)
        if r:
            lines.append(
                f"- Selected Night Route: {r.title} ({r.mountain_range}, {r.region})\n"
                f"  Elevation: {r.route_elevation_m}m | Drop: {r.vertical_drop_m}m | Bridge Span: {r.suspension_bridge_span_m}m\n"
                f"  Style: {r.nocturnal_style} | Max Grade: {r.max_grade}\n"
                f"  Description: {r.description}\n"
                f"  Highlights: {'; '.join(r.highlights)}"
            )
    return "\n".join(lines)


def night_via_ferrata_tool(
    request: Optional[NightViaFerrataRequest] = None,
    action: Optional[str] = None,
    route_id: Optional[str] = None,
    nocturnal_style: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    if action == "calculate" or request is not None:
        calc_req = request or NightViaFerrataRequest(
            route_id=route_id or "dolomites-kellner-night-traverse"
        )
        res = calculate_night_via_ferrata_dynamics(calc_req)
        formatted = format_night_via_ferrata_response(
            NightViaFerrataIntent(action="calculate", route_id=res.route_id)
        )
        return dict(formatted._data)

    intent = NightViaFerrataIntent(
        action=action or "routes_list",
        route_id=route_id,
        nocturnal_style=nocturnal_style,
    )
    formatted = format_night_via_ferrata_response(intent)
    return dict(formatted._data)
