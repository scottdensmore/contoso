from typing import Any, Optional, Union

from pydantic import BaseModel, Field


class SnowmobileZoneModel(BaseModel):
    id: str
    name: str
    region: str
    elevation_meters: int
    average_annual_snow_cm: int
    primary_riding_style: str
    ates_rating: str
    description: str
    highlights: list[str] = Field(default_factory=list)


class SledCalculationRequest(BaseModel):
    zone_id: Optional[str] = "revelstoke-boulder-mountain"
    track_length_inches: float = 165.0
    lug_height_inches: float = 2.75
    engine_type: str = "factory_turbo"
    rider_and_gear_weight_kg: float = 95.0
    snowpack_condition: str = "deep_powder"


class SledCalculationResponse(BaseModel):
    zone_name: str
    flotation_index: float
    trenching_risk: str
    effective_horsepower: float
    power_loss_percent: float
    sidehill_stability_rating: str
    counter_steering_guidance: str
    avalanche_terrain_warning: Optional[str] = None


class SnowmobileGearRequirement(BaseModel):
    id: str
    name: str
    category: str
    mandatory: bool
    description: str


class SnowmobileIntent(BaseModel):
    intent_detected: bool = True
    zone_id: Optional[str] = None
    action: str = "zones_list"
    confidence: float = 1.0


class FormattedSnowmobileResponse(str):
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


DEFAULT_SNOWMOBILE_ZONES: dict[str, SnowmobileZoneModel] = {
    "revelstoke-boulder-mountain": SnowmobileZoneModel(
        id="revelstoke-boulder-mountain",
        name="Boulder Mountain & Frisby Ridge",
        region="Revelstoke, British Columbia, Canada",
        elevation_meters=2300,
        average_annual_snow_cm=1400,
        primary_riding_style="Deep Powder Boondocking & Technical Alpine Riding",
        ates_rating="Complex ATES",
        description="Legendary Monashee/Columbia mountain terrain famous for 14m of annual snowfall, steep alpine bowls, technical tree riding, and massive rollover climbs.",
        highlights=[
            "Frisby Ridge alpine cabin & open bowls",
            "Sugar Bowl technical tree riding & steep sidehills",
            "High-consequence Complex ATES avalanche paths",
        ],
    ),
    "cooke-city-daisy-pass": SnowmobileZoneModel(
        id="cooke-city-daisy-pass",
        name="Daisy Pass & Henderson Mountain",
        region="Cooke City, Montana, USA",
        elevation_meters=3050,
        average_annual_snow_cm=1100,
        primary_riding_style="High-Elevation Chutes & Steep Sidehilling",
        ates_rating="Complex ATES",
        description="Rugged Beartooth mountain playground at 10,000 feet known for steep avalanche chutes, technical sidehilling, and extreme high-elevation engine demands.",
        highlights=[
            "Henderson Mountain technical chutes",
            "Crown Butte and Lulu Pass powder staging",
            "Extreme 3,000m+ elevation turbo performance advantage",
        ],
    ),
    "togwotee-pass-brooks-lake": SnowmobileZoneModel(
        id="togwotee-pass-brooks-lake",
        name="Togwotee Pass & Continental Divide",
        region="Dubois / Moran, Wyoming, USA",
        elevation_meters=2940,
        average_annual_snow_cm=1300,
        primary_riding_style="Endless Powder Bowls & Meadow Boondocking",
        ates_rating="Challenging ATES",
        description="Continental Divide powder mecca offering vast untracked meadows, backcountry tree lines, and panoramic views of the Teton Range.",
        highlights=[
            "Brooks Lake and Sublette Peak backcountry basins",
            "Continuous deep powder cushion over 2,900m altitude",
            "Teton view ridge riding with wind-loaded cornice safety",
        ],
    ),
    "valee-de-bras-du-nord-gaspe": SnowmobileZoneModel(
        id="valee-de-bras-du-nord-gaspe",
        name="Monts Chic-Chocs & Haute-Gaspésie",
        region="Gaspésie, Quebec, Canada",
        elevation_meters=1150,
        average_annual_snow_cm=950,
        primary_riding_style="Dense Maritime Tree Boondocking & Alpine Ravines",
        ates_rating="Challenging ATES",
        description="Eastern North America's premier alpine mountain sledding destination, featuring dense hardwood glades, rugged ravines, and high-coastal snowpack.",
        highlights=[
            "Mont Vallières-de-Saint-Réal alpine ravines",
            "Tight technical glade riding requiring maximum agile maneuverability",
            "Heavy maritime snowpack requiring high-traction lug bite",
        ],
    ),
    "steamboat-rabbit-ears-pass": SnowmobileZoneModel(
        id="steamboat-rabbit-ears-pass",
        name="Rabbit Ears Pass & Buffalo Pass",
        region="Steamboat Springs, Colorado, USA",
        elevation_meters=3170,
        average_annual_snow_cm=1250,
        primary_riding_style="Champagne Powder Meadows & Rolling Glades",
        ates_rating="Simple ATES",
        description="World-renowned Colorado champagne powder haven spanning vast rolling meadows, sub-alpine aspen glades, and high Park Range plateau terrain.",
        highlights=[
            "Buffalo Pass ultra-light dry champagne powder",
            "Wide-open beginner-to-intermediate boondocking meadows",
            "High-altitude 3,170m summit requiring altitude jetting/turbo calibration",
        ],
    ),
}

DEFAULT_SNOWMOBILE_GEAR: list[SnowmobileGearRequirement] = [
    SnowmobileGearRequirement(
        id="electronic-avalanche-airbag-pack",
        name="Electronic Supercapacitor Avalanche Airbag Backpack (25L-35L)",
        category="avalanche_airbag",
        mandatory=True,
        description="Sub-zero cold-tolerant electronic fan/supercapacitor airbag system supporting multiple deployments and airline-friendly travel.",
    ),
    SnowmobileGearRequirement(
        id="digital-three-antenna-beacon",
        name="Digital Three-Antenna Avalanche Transceiver with Sled Harness",
        category="avalanche_beacon",
        mandatory=True,
        description="High-precision digital beacon featuring 70m search strip width, auto-revert to transmit mode, and sled-interference suppression.",
    ),
    SnowmobileGearRequirement(
        id="stealth-snow-probe-carbon-320",
        name="Stealth Quick-Deploy Carbon Avalanche Probe 320cm",
        category="avalanche_probe",
        mandatory=True,
        description="Extra-long 320cm carbon probe with rapid-pull tensioning cord designed for pinpointing burials in deep mountain snowmobiling snowpacks.",
    ),
    SnowmobileGearRequirement(
        id="d-grip-metal-snow-saw-shovel",
        name="All-Metal D-Grip Hoe/Saw Avalanche Shovel",
        category="avalanche_shovel",
        mandatory=True,
        description="Heat-treated aluminum shovel with clearing hoe configuration and integrated aggressive tree/snow saw within the shaft for rapid rescue extrication.",
    ),
    SnowmobileGearRequirement(
        id="magnetic-kill-switch-tether",
        name="Magnetic Engine Kill Switch Tether",
        category="sled_safety",
        mandatory=True,
        description="Magnetic quick-release ignition cutoff tether securely clipped to rider's outerwear D-ring to instantly shut off engine upon rider separation.",
    ),
    SnowmobileGearRequirement(
        id="tunnel-retractable-recovery-winch",
        name="Tunnel-Mounted Retractable Snowmobile Recovery Winch & Snatch Block",
        category="sled_recovery",
        mandatory=True,
        description="Compact high-capacity synthetic rope extraction winch with snatch block and tree strap for recovering trenched sleds from tree wells and ravines.",
    ),
]


def get_snowmobile_zones(ates_rating: Optional[str] = None) -> list[SnowmobileZoneModel]:
    zones = list(DEFAULT_SNOWMOBILE_ZONES.values())
    if not ates_rating:
        return zones
    norm = ates_rating.strip().lower()
    return [z for z in zones if norm in z.ates_rating.lower()]


def get_snowmobile_zone_by_id(zone_id: str) -> Optional[SnowmobileZoneModel]:
    return DEFAULT_SNOWMOBILE_ZONES.get(zone_id.strip().lower())


def get_snowmobile_gear() -> list[SnowmobileGearRequirement]:
    return list(DEFAULT_SNOWMOBILE_GEAR)


def calculate_sled_performance(request: SledCalculationRequest) -> SledCalculationResponse:
    target_id = request.zone_id or "revelstoke-boulder-mountain"
    zone = get_snowmobile_zone_by_id(target_id)
    if not zone:
        raise ValueError(f"Snowmobile zone '{target_id}' not found")

    elevation_ft = zone.elevation_meters * 3.28084
    base_hp = 165.0
    engine_type_norm = request.engine_type.strip().lower()

    if engine_type_norm in ("factory_turbo", "turbo"):
        if elevation_ft <= 10000.0:
            power_loss_percent = 0.0
            effective_horsepower = base_hp
        else:
            power_loss_percent = round(((elevation_ft - 10000.0) / 1000.0) * 3.5, 1)
            effective_horsepower = round(base_hp * (1.0 - power_loss_percent / 100.0), 1)
    else:
        # Naturally Aspirated 850 loses ~3.5% per 1,000 ft
        power_loss_percent = round((elevation_ft / 1000.0) * 3.5, 1)
        effective_horsepower = round(base_hp * (1.0 - power_loss_percent / 100.0), 1)

    snowpack_factors = {
        "spring_crust": 1.3,
        "firm": 1.25,
        "wind_buff": 1.1,
        "heavy_wet": 1.0,
        "deep_powder": 0.9,
        "sugar_snow": 0.75,
        "faceted": 0.75,
    }
    snow_mult = snowpack_factors.get(request.snowpack_condition.strip().lower(), 0.9)

    raw_flotation = (
        (
            request.track_length_inches
            * request.lug_height_inches
            / max(request.rider_and_gear_weight_kg, 40.0)
        )
        * snow_mult
        * 1.8
    )
    flotation_index = round(min(10.0, max(1.0, raw_flotation)), 1)

    if flotation_index >= 7.5:
        trenching_risk = "low"
    elif flotation_index >= 5.5:
        trenching_risk = "moderate"
    else:
        trenching_risk = "high"

    if request.track_length_inches >= 165.0:
        sidehill_stability_rating = "exceptional_traction_firm_hold"
    elif request.track_length_inches >= 154.0:
        sidehill_stability_rating = "balanced_agility_and_hold"
    else:
        sidehill_stability_rating = "high_agility_reduced_hold"

    counter_steering_guidance = (
        "Initiate counter-steering downhill to carve uphill edge, position both feet on the uphill running board, "
        "and modulate smooth throttle to sustain sidehill momentum."
    )

    if "complex" in zone.ates_rating.lower():
        avalanche_terrain_warning = (
            f"CRITICAL WARNING: {zone.name} is classified as Complex ATES terrain with high overhead avalanche hazards "
            "and complex runouts. Electronic avalanche airbag readiness and strict one-at-a-time slope protocols are mandatory."
        )
    elif "challenging" in zone.ates_rating.lower():
        avalanche_terrain_warning = (
            f"WARNING: {zone.name} is classified as Challenging ATES terrain. Navigate carefully around convex rolls "
            "and maintain continuous avalanche transceiver and group line-of-sight vigilance."
        )
    else:
        avalanche_terrain_warning = (
            f"ADVISORY: {zone.name} features Simple ATES rolling terrain, but caution is still required around "
            "steep cutbanks, wind lips, and creek drop-offs."
        )

    return SledCalculationResponse(
        zone_name=zone.name,
        flotation_index=flotation_index,
        trenching_risk=trenching_risk,
        effective_horsepower=effective_horsepower,
        power_loss_percent=power_loss_percent,
        sidehill_stability_rating=sidehill_stability_rating,
        counter_steering_guidance=counter_steering_guidance,
        avalanche_terrain_warning=avalanche_terrain_warning,
    )


def detect_snowmobiling_intent(message: str) -> Optional[SnowmobileIntent]:
    if not message or not message.strip():
        return None

    q = message.lower()

    # Disambiguation guards
    # 1. Ecommerce / order tracking
    ecommerce_terms = ["order #", "return label", "refund", "shipping tracking", "track my order"]
    if any(t in q for t in ecommerce_terms):
        return None

    # 2. Backcountry ski touring
    ski_touring_terms = [
        "skin track",
        "ski touring",
        "splitboard",
        "randonee",
        "telemark",
        "at bindings",
    ]
    if any(t in q for t in ski_touring_terms) and not any(
        s in q for s in ["snowmobile", "sled", "boondocking", "sidehilling"]
    ):
        return None

    # 3. Snowkiting
    snowkiting_terms = [
        "snowkite",
        "snowkiting",
        "kite expedition",
        "foil kite",
        "kite harness",
        "depower foil",
        "pulk",
    ]
    if any(t in q for t in snowkiting_terms) and not any(
        s in q for s in ["snowmobile", "sled", "boondocking", "sidehilling"]
    ):
        return None

    # 4. Dogsledding
    dogsledding_terms = ["dogsled", "dog sled", "mushing", "husky", "sled dog", "musher"]
    if any(t in q for t in dogsledding_terms) and not any(
        s in q for s in ["snowmobile", "mountain sled", "boondocking", "sidehilling"]
    ):
        return None

    # 5. Generic avalanche safety without sled terms
    generic_avalanche_terms = [
        "snow pit",
        "compression test",
        "extended column",
        "pit test",
        "avalanche course",
    ]
    if any(t in q for t in generic_avalanche_terms) and not any(
        s in q
        for s in ["snowmobile", "sled", "boondocking", "sidehilling", "airbag", "mountain sled"]
    ):
        return None

    snowmobiling_keywords = [
        "snowmobile",
        "snowmobiling",
        "mountain sled",
        "sledding",
        "boondocking",
        "sidehilling",
        "trenching",
        "powder track",
        "850 turbo",
        "tether cutoff",
        "sled avalanche",
        "revelstoke snowmobile",
        "cooke city sled",
        "togwotee pass sled",
        "rabbit ears pass sled",
        "chic-chocs sled",
        "sled",
        "sledder",
        "sledders",
        "skidoo",
        "ski-doo",
        "polaris patriot",
        "arctic cat alpha",
        "mountain riding",
        "mountain sledding",
        "flotation index",
        "elevation power derating",
        "kill switch tether",
        "recovery winch",
        # Zone names
        "revelstoke",
        "boulder mountain",
        "frisby ridge",
        "cooke city",
        "daisy pass",
        "henderson mountain",
        "togwotee pass",
        "togwotee",
        "brooks lake",
        "chic-chocs",
        "chic chocs",
        "gaspesie",
        "gaspésie",
        "rabbit ears",
        "buffalo pass",
    ]

    has_keyword = any(k in q for k in snowmobiling_keywords)
    if not has_keyword:
        return None

    # Zone ID detection
    zone_id: Optional[str] = None
    if "revelstoke" in q or "boulder mountain" in q or "frisby" in q:
        zone_id = "revelstoke-boulder-mountain"
    elif "cooke city" in q or "daisy pass" in q or "henderson" in q:
        zone_id = "cooke-city-daisy-pass"
    elif "togwotee" in q or "brooks lake" in q or "continental divide" in q:
        zone_id = "togwotee-pass-brooks-lake"
    elif (
        "chic-chocs" in q
        or "chic chocs" in q
        or "gaspésie" in q
        or "gaspesie" in q
        or "bras du nord" in q
        or "gaspe" in q
    ):
        zone_id = "valee-de-bras-du-nord-gaspe"
    elif "rabbit ears" in q or "buffalo pass" in q or "steamboat" in q:
        zone_id = "steamboat-rabbit-ears-pass"

    # Action detection
    calc_terms = [
        "calculate",
        "calculation",
        "flotation",
        "trenching",
        "horsepower",
        "power loss",
        "elevation loss",
        "sidehill stability",
        "counter-steering",
        "counter steering",
        "derating",
        "boost",
        "turbo vs",
    ]
    gear_terms = [
        "gear",
        "checklist",
        "equipment",
        "safety kit",
        "airbag",
        "beacon",
        "probe",
        "shovel",
        "tether",
        "winch",
        "recovery kit",
    ]

    if any(c in q for c in calc_terms):
        action = "calculate_sled"
    elif any(g in q for g in gear_terms):
        action = "gear_checklist"
    elif zone_id and not any(
        w in q for w in ["list", "catalog", "where", "all zones", "all locations"]
    ):
        action = "zone_detail"
    else:
        action = "zones_list"

    return SnowmobileIntent(
        intent_detected=True,
        zone_id=zone_id,
        action=action,
        confidence=0.95 if zone_id else 0.85,
    )


extract_snowmobiling_intent = detect_snowmobiling_intent


def build_snowmobiling_prompt(
    query_or_intent: Union[str, SnowmobileIntent],
    intent: Optional[SnowmobileIntent] = None,
) -> str:
    if isinstance(query_or_intent, SnowmobileIntent):
        act_intent = query_or_intent
    elif intent is not None:
        act_intent = intent
    else:
        act_intent = detect_snowmobiling_intent(str(query_or_intent)) or SnowmobileIntent()

    lines = [
        "Contoso Backcountry Mountain Snowmobiling & Avalanche Mountain Riding Expert Beta:",
        "- High-Elevation 2-Stroke Dynamics: Naturally Aspirated 850cc engines lose ~3.5% horsepower per 1,000 ft elevation gain. "
        "Factory Turbo packages maintain sea-level manifold boost (165+ HP) up to 10,000 ft, preventing bog and preserving track speed in deep alpine bowls.",
        '- Track Flotation & Boondocking Mechanics: Flotation is governed by track length (154"-175"), lug height (2.5"-3.0"), rider mass, and snow density. '
        "Insufficient track area leads to severe trenching in deep powder and faceted sugar snow.",
        "- Technical Sidehilling & Counter-Steering: Initiate roll by counter-steering downhill toward the valley to tip onto the uphill ski, "
        "shift both boots to the uphill running board, and modulate steady throttle to hold sidehill line across steep avalanche terrain.",
        "- Mandatory Safety & Extrication Gear: Electronic Supercapacitor Avalanche Airbag Packs (sub-zero reliable), digital 3-antenna transceivers, "
        "320cm carbon probes, heavy-duty D-grip saws/shovels, Magnetic Kill-Switch Tethers, and tunnel-mounted recovery winches.",
    ]

    if act_intent.action == "zone_detail" and act_intent.zone_id:
        zone = get_snowmobile_zone_by_id(act_intent.zone_id)
        if zone:
            lines.extend(
                [
                    f"- Focused Snowmobile Zone: {zone.name} ({zone.region})",
                    f"  Elevation: {zone.elevation_meters}m | Annual Snowfall: {zone.average_annual_snow_cm}cm | ATES Rating: {zone.ates_rating}",
                    f"  Primary Riding Style: {zone.primary_riding_style}",
                    f"  Highlights: {', '.join(zone.highlights)}",
                    f"  Description: {zone.description}",
                ]
            )
    elif act_intent.action == "calculate_sled":
        lines.append(
            "- Action: Calculate sled track flotation index, trenching risk, elevation horsepower derating (NA vs Factory Turbo), "
            "sidehill stability rating, counter-steering guidance, and ATES terrain exposure warnings."
        )
    elif act_intent.action == "gear_checklist":
        lines.append(
            "- Action: Present the mandatory 6-item Backcountry Avalanche & Mountain Sled Recovery Checklist."
        )
    else:
        zones = get_snowmobile_zones()
        lines.append(
            f"- Iconic Mountain Snowmobile Zones: {'; '.join(f'{z.name} ({z.elevation_meters}m, {z.ates_rating})' for z in zones)}"
        )

    return "\n".join(lines)


def format_snowmobiling_response(
    result_or_intent: Any,
    query: str = "",
) -> FormattedSnowmobileResponse:
    if isinstance(result_or_intent, SledCalculationResponse):
        calc = result_or_intent
        answer = (
            f"Mountain Sled Performance Analysis for {calc.zone_name}: "
            f"Flotation Index: {calc.flotation_index}/10.0 | Trenching Risk: {calc.trenching_risk.upper()} | "
            f"Effective Engine Power: {calc.effective_horsepower} HP ({calc.power_loss_percent}% elevation loss) | "
            f"Sidehill Stability: {calc.sidehill_stability_rating}. "
            f"Technique: {calc.counter_steering_guidance} Warning: {calc.avalanche_terrain_warning}"
        )
        calc_info: dict[str, Any] = {
            "action": "calculate_sled",
            "calculation": calc.model_dump(),
        }
        return FormattedSnowmobileResponse(
            answer, {"snowmobiling_info": calc_info, "answer": answer}
        )

    if isinstance(result_or_intent, SnowmobileIntent):
        intent = result_or_intent
    elif isinstance(result_or_intent, dict):
        intent = SnowmobileIntent(**result_or_intent)
    else:
        intent = detect_snowmobiling_intent(str(result_or_intent)) or SnowmobileIntent()

    if intent.action == "calculate_sled":
        target_zone_id = intent.zone_id or "revelstoke-boulder-mountain"
        req = SledCalculationRequest(zone_id=target_zone_id)
        calc_res = calculate_sled_performance(req)
        answer = (
            f"Mountain Sled Performance Analysis for {calc_res.zone_name}: "
            f"Flotation Index: {calc_res.flotation_index}/10.0 | Trenching Risk: {calc_res.trenching_risk.upper()} | "
            f"Effective Engine Power: {calc_res.effective_horsepower} HP ({calc_res.power_loss_percent}% elevation loss) | "
            f"Sidehill Stability: {calc_res.sidehill_stability_rating}. "
            f"Technique: {calc_res.counter_steering_guidance} Warning: {calc_res.avalanche_terrain_warning}"
        )
        calc_dict: dict[str, Any] = {
            "action": "calculate_sled",
            "calculation": calc_res.model_dump(),
        }
        return FormattedSnowmobileResponse(
            answer, {"snowmobiling_info": calc_dict, "answer": answer}
        )

    elif intent.action == "gear_checklist":
        gear = get_snowmobile_gear()
        answer = (
            f"Mandatory Avalanche & Mountain Sled Gear Checklist ({len(gear)} items): "
            + "; ".join(f"{g.name} ({g.description})" for g in gear)
            + ". Always perform daily transceiver function checks and confirm kill switch tether operation before riding."
        )
        gear_dict: dict[str, Any] = {
            "action": "gear_checklist",
            "gear": [g.model_dump() for g in gear],
            "mandatory_count": sum(1 for g in gear if g.mandatory),
        }
        return FormattedSnowmobileResponse(
            answer, {"snowmobiling_info": gear_dict, "answer": answer}
        )

    elif intent.action == "zone_detail" and intent.zone_id:
        zone = get_snowmobile_zone_by_id(intent.zone_id)
        if zone:
            answer = (
                f"Backcountry Mountain Riding Beta — {zone.name} ({zone.region}): "
                f"Elevation: {zone.elevation_meters}m | Annual Snowfall: {zone.average_annual_snow_cm}cm | "
                f"ATES Rating: {zone.ates_rating} | Style: {zone.primary_riding_style}. "
                f"Highlights: {', '.join(zone.highlights)}. {zone.description}"
            )
            detail_dict: dict[str, Any] = {
                "action": "zone_detail",
                "zone": zone.model_dump(),
            }
            return FormattedSnowmobileResponse(
                answer, {"snowmobiling_info": detail_dict, "answer": answer}
            )

    # Default: zones_list
    zones = get_snowmobile_zones()
    summary = "; ".join(
        f"{z.name} ({z.region}, {z.elevation_meters}m, {z.ates_rating})" for z in zones
    )
    answer = (
        f"Contoso Mountain Snowmobiling & Backcountry Riding Catalog ({len(zones)} iconic zones): {summary}. "
        "Inquire about specific zones, track flotation & elevation power calculation, or mandatory avalanche gear."
    )
    list_dict: dict[str, Any] = {
        "action": "zones_list",
        "zones": [z.model_dump() for z in zones],
    }
    return FormattedSnowmobileResponse(answer, {"snowmobiling_info": list_dict, "answer": answer})
