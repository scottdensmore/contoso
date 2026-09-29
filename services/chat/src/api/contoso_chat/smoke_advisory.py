from typing import Any, Literal, Optional

from pydantic import BaseModel, Field

SmokeSeverity = Literal[
    "clean_uncompromised",
    "moderate_drift_haze",
    "unhealthy_wildfire_plume",
    "hazardous_dense_inversion",
]

ElevationLayer = Literal[
    "valley_basin_trapping",
    "mid_slope_thermal_belt",
    "alpine_ridge_free_air",
]

ActivityIntensity = Literal[
    "low_camp_rest",
    "moderate_backpacking",
    "strenuous_alpine_ascent",
]

RespiratorType = Literal[
    "none",
    "n95_particulate_respirator",
    "p100_elastomeric_half_mask",
]

ExertionSafetyStatus = Literal[
    "nominal_safe_exertion",
    "caution_moderate_respiration",
    "critical_hazard_cease_exertion",
]


class SmokeStation(BaseModel):
    id: str
    name: str
    region: str
    range: str
    elevation_meters: int
    aqi: int
    pm25_ug_m3: float
    severity: str
    layer: str
    inversion_trapped: bool
    active_fire_distance_km: float
    description: str
    highlights: list[str] = Field(default_factory=list)

    @property
    def station_id(self) -> str:
        return self.id

    @property
    def title(self) -> str:
        return self.name

    @property
    def station_name(self) -> str:
        return self.name


class SmokeAdvisoryQuery(BaseModel):
    station_id: str = "pasayten-boundary-fire"
    layer: Optional[str] = None
    activity_intensity: str = "moderate_backpacking"
    exposure_hours: float = 6.0
    respirator_type: str = "none"


class SmokeAdvisoryResult(BaseModel):
    station_id: str
    station_name: str
    layer: str
    layer_factor: float
    effective_pm25_ug_m3: float
    effective_aqi: int
    activity_intensity: str
    ventilation_rate_m3_hr: float
    respirator_type: str
    mask_efficiency: float
    exposure_hours: float
    inhaled_particulate_dose_ug: float
    safety_status: str
    advisory: str
    recommended_actions: list[str] = Field(default_factory=list)


class SmokeGearItem(BaseModel):
    id: str
    name: str
    category: str
    mandatory: bool
    description: str

    @property
    def item_id(self) -> str:
        return self.id

    @property
    def purpose(self) -> str:
        return self.description


class SmokeAdvisoryIntent(BaseModel):
    action: str
    station_id: Optional[str] = None
    layer: Optional[str] = None
    severity: Optional[str] = None


class FormattedSmokeAdvisoryResponse(str):
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


DEFAULT_SMOKE_STATIONS: dict[str, SmokeStation] = {
    "pasayten-boundary-fire": SmokeStation(
        id="pasayten-boundary-fire",
        name="Pasayten Boundary Fire Telemetry",
        region="North Cascades, Washington",
        range="Cascade Crest",
        elevation_meters=1450,
        aqi=185,
        pm25_ug_m3=121.5,
        severity="unhealthy_wildfire_plume",
        layer="valley_basin_trapping",
        inversion_trapped=True,
        active_fire_distance_km=18.0,
        description="Dense smoke trapped in glaciated river valleys beneath an overnight subsidence thermal inversion.",
        highlights=[
            "Morning temperature inversion layer",
            "Valley drainage particulate accumulation",
            "High particulate spike before afternoon thermal mixing",
        ],
    ),
    "sawtooth-wilderness-basin": SmokeStation(
        id="sawtooth-wilderness-basin",
        name="Sawtooth Valley Inversion & Ridge Station",
        region="Sawtooth Range, Idaho",
        range="Central Idaho Rocky Mountains",
        elevation_meters=2350,
        aqi=78,
        pm25_ug_m3=25.2,
        severity="moderate_drift_haze",
        layer="mid_slope_thermal_belt",
        inversion_trapped=False,
        active_fire_distance_km=42.0,
        description="Moderate regional drift aloft with noticeably cleaner air above the 7,500-foot valley smoke ceiling.",
        highlights=[
            "Mid-slope thermal belt refuge",
            "Moderate diurnal wind ventilation",
            "Valley floor smoke haze visibility line",
        ],
    ),
    "sierra-crest-granite-gap": SmokeStation(
        id="sierra-crest-granite-gap",
        name="Sierra Crest Granite Gap Smoke Corridor",
        region="High Sierra, California",
        range="Sierra Nevada",
        elevation_meters=3120,
        aqi=310,
        pm25_ug_m3=260.0,
        severity="hazardous_dense_inversion",
        layer="alpine_ridge_free_air",
        inversion_trapped=False,
        active_fire_distance_km=12.0,
        description="Direct downwind plume funneled across high granite passes by strong afternoon convective pressure gradients.",
        highlights=[
            "Dangerous active wildfire plume crossing",
            "Extreme hazardous PM2.5 concentrations",
            "Urgent egress and respiratory shelter requirement",
        ],
    ),
    "san-juan-wetterhorn-basin": SmokeStation(
        id="san-juan-wetterhorn-basin",
        name="San Juan Wetterhorn Alpine Air Basin",
        region="San Juan Mountains, Colorado",
        range="San Juan Volcanic Uplift",
        elevation_meters=3450,
        aqi=35,
        pm25_ug_m3=8.4,
        severity="clean_uncompromised",
        layer="alpine_ridge_free_air",
        inversion_trapped=False,
        active_fire_distance_km=95.0,
        description="Pristine high-altitude airflow with persistent mountain winds dispersing distant regional haze.",
        highlights=[
            "Clean uncompromised alpine air",
            "Low particulate concentration",
            "Full unrestricted athletic exertion safe",
        ],
    ),
    "bob-marshall-wilderness-complex": SmokeStation(
        id="bob-marshall-wilderness-complex",
        name="Bob Marshall Complex River Basin Drift",
        region="Northern Rockies, Montana",
        range="Flathead National Forest",
        elevation_meters=1620,
        aqi=162,
        pm25_ug_m3=76.8,
        severity="unhealthy_wildfire_plume",
        layer="valley_basin_trapping",
        inversion_trapped=True,
        active_fire_distance_km=25.0,
        description="Wildfire smoke pooling deeply along major wilderness river corridors during calm stagnant evening high-pressure.",
        highlights=[
            "River canyon smoke drainage",
            "Stable stagnant air boundary layer",
            "Significant night-time air stagnation",
        ],
    ),
}

DEFAULT_SMOKE_GEAR: list[SmokeGearItem] = [
    SmokeGearItem(
        id="n95-valved-particulate-respirator",
        name="Dual-Strap Valved N95 Particulate Respirator (NIOSH Certified)",
        category="respirator",
        mandatory=True,
        description="Filters 95% of fine airborne PM2.5 particles while exhalation valve prevents moisture buildup during trail ascents",
    ),
    SmokeGearItem(
        id="sealed-smoke-goggles",
        name="Vented Foam-Sealed Smoke & Particulate Safety Goggles",
        category="eye_protection",
        mandatory=True,
        description="Shields eyes and conjunctival membranes from stinging wood smoke resin acids and flying ash particulate",
    ),
    SmokeGearItem(
        id="portable-laser-pm25-monitor",
        name="Field-Deployable Laser PM2.5 / PM10 Air Quality Sensor",
        category="sensor",
        mandatory=True,
        description="Measures real-time microclimate particulate density in micrograms per cubic meter directly at camp",
    ),
    SmokeGearItem(
        id="hepa-micro-tent-purifier",
        name="USB-Rechargeable In-Tent Positive-Pressure HEPA Air Scrubber",
        category="shelter",
        mandatory=True,
        description="Creates a clean-air microclimate inside enclosed backpacking tents to allow lungs to recover overnight",
    ),
    SmokeGearItem(
        id="electrolyte-saline-eye-rinse",
        name="Sterile Ophthalmic Saline Flush & Eye Relief Solution (250ml)",
        category="medical",
        mandatory=True,
        description="Removes particulate grit, soot residue, and corrosive wood ash from eyes after windward ridgeline crossings",
    ),
    SmokeGearItem(
        id="bronchodilator-emergency-inhaler-pouch",
        name="Weatherproof Emergency Inhaler & Respiration First Aid Pouch",
        category="respirator",
        mandatory=True,
        description="Keeps rapid-relief bronchodilators, antihistamines, and pulmonary triage instructions dry and instantly accessible",
    ),
]


def get_smoke_stations(
    layer: Optional[str] = None,
    severity: Optional[str] = None,
) -> list[SmokeStation]:
    stations = list(DEFAULT_SMOKE_STATIONS.values())
    if layer:
        norm_layer = layer.strip().lower().replace("-", "_").replace(" ", "_")
        stations = [
            s for s in stations if s.layer.lower().replace("-", "_").replace(" ", "_") == norm_layer
        ]
    if severity:
        norm_sev = severity.strip().lower().replace("-", "_").replace(" ", "_")
        stations = [
            s
            for s in stations
            if s.severity.lower().replace("-", "_").replace(" ", "_") == norm_sev
        ]
    return stations


def get_smoke_station_by_id(station_id: str) -> Optional[SmokeStation]:
    norm_id = station_id.strip().lower()
    for k, s in DEFAULT_SMOKE_STATIONS.items():
        if k.lower() == norm_id or s.id.lower() == norm_id:
            return s
    return None


def get_smoke_gear_checklist() -> list[SmokeGearItem]:
    return list(DEFAULT_SMOKE_GEAR)


def calculate_smoke_exposure(query: SmokeAdvisoryQuery) -> SmokeAdvisoryResult:
    station = get_smoke_station_by_id(query.station_id)
    if not station:
        raise ValueError(f"Smoke station '{query.station_id}' not found")

    layer = query.layer or station.layer

    # Elevation layer factor
    if layer == "valley_basin_trapping":
        layer_factor = 1.35 if station.inversion_trapped else 1.15
    elif layer == "mid_slope_thermal_belt":
        layer_factor = 0.85
    elif layer == "alpine_ridge_free_air":
        layer_factor = 1.0 if station.severity == "hazardous_dense_inversion" else 0.70
    else:
        layer_factor = 1.0

    effective_pm25_ug_m3 = round(station.pm25_ug_m3 * layer_factor, 1)

    # AQI calculation formula
    if effective_pm25_ug_m3 <= 12.0:
        effective_aqi = round((50 / 12.0) * effective_pm25_ug_m3)
    elif effective_pm25_ug_m3 <= 35.4:
        effective_aqi = round(50 + ((100 - 50) / (35.4 - 12.0)) * (effective_pm25_ug_m3 - 12.0))
    elif effective_pm25_ug_m3 <= 55.4:
        effective_aqi = round(101 + ((150 - 101) / (55.4 - 35.4)) * (effective_pm25_ug_m3 - 35.4))
    elif effective_pm25_ug_m3 <= 150.4:
        effective_aqi = round(151 + ((200 - 151) / (150.4 - 55.4)) * (effective_pm25_ug_m3 - 55.4))
    elif effective_pm25_ug_m3 <= 250.4:
        effective_aqi = round(
            201 + ((300 - 201) / (250.4 - 150.4)) * (effective_pm25_ug_m3 - 150.4)
        )
    else:
        effective_aqi = min(
            500, round(301 + ((500 - 301) / (500.0 - 250.4)) * (effective_pm25_ug_m3 - 250.4))
        )

    # Ventilation rate by activity intensity (m^3/hr)
    if query.activity_intensity == "low_camp_rest":
        ventilation_rate = 0.6
    elif query.activity_intensity == "strenuous_alpine_ascent":
        ventilation_rate = 3.2
    else:  # default moderate_backpacking
        ventilation_rate = 1.8

    # Mask filtration efficiency
    if query.respirator_type == "p100_elastomeric_half_mask":
        mask_efficiency = 0.999
    elif query.respirator_type == "n95_particulate_respirator":
        mask_efficiency = 0.95
    else:
        mask_efficiency = 0.0

    inhaled_particulate_dose_ug = round(
        effective_pm25_ug_m3 * ventilation_rate * (1.0 - mask_efficiency) * query.exposure_hours,
        1,
    )

    if effective_aqi > 200 or inhaled_particulate_dose_ug > 500:
        safety_status = "critical_hazard_cease_exertion"
        advisory = (
            f"CRITICAL SMOKE HAZARD: AQI {effective_aqi} ({effective_pm25_ug_m3} µg/m³). "
            f"Inhaled dose projected at {inhaled_particulate_dose_ug} µg. Cease strenuous exertion and seek shelter or egress."
        )
        recommended_actions = [
            "Immediately don certified N95 or P100 respirator",
            "Descend from ridgeline or climb out of inversion smoke trap to mid-slope refuge",
            "Cease high-ventilation athletic exertion immediately",
            "Seal tent with positive-pressure HEPA micro-purifier for overnight recovery",
        ]
    elif effective_aqi > 100 or inhaled_particulate_dose_ug > 150:
        safety_status = "caution_moderate_respiration"
        advisory = (
            f"MODERATE AIR QUALITY ADVISORY: AQI {effective_aqi} ({effective_pm25_ug_m3} µg/m³). "
            f"Inhaled dose projected at {inhaled_particulate_dose_ug} µg. Reduce pace and monitor respiratory symptoms."
        )
        recommended_actions = [
            "Wear valved N95 respirator during ascents",
            "Pace exertion to maintain nasal breathing and lower minute ventilation",
            "Monitor valley smoke drainage pooling during evening inversions",
            "Flush eyes with sterile ophthalmic saline solution to prevent corneal irritation",
        ]
    else:
        safety_status = "nominal_safe_exertion"
        advisory = (
            f"CLEAN AIR CONDITIONS: AQI {effective_aqi} ({effective_pm25_ug_m3} µg/m³). "
            f"Inhaled dose projected at {inhaled_particulate_dose_ug} µg. Air quality within safe thresholds for unrestricted outdoor exertion."
        )
        recommended_actions = [
            "Maintain standard wilderness vigilance for shifting wind and distant fire plumes",
            "Carry backup particulate respirator in emergency medical kit",
            "Enjoy unrestricted athletic and climbing activity",
        ]

    return SmokeAdvisoryResult(
        station_id=station.id,
        station_name=station.name,
        layer=layer,
        layer_factor=layer_factor,
        effective_pm25_ug_m3=effective_pm25_ug_m3,
        effective_aqi=effective_aqi,
        activity_intensity=query.activity_intensity,
        ventilation_rate_m3_hr=ventilation_rate,
        respirator_type=query.respirator_type,
        mask_efficiency=mask_efficiency,
        exposure_hours=query.exposure_hours,
        inhaled_particulate_dose_ug=inhaled_particulate_dose_ug,
        safety_status=safety_status,
        advisory=advisory,
        recommended_actions=recommended_actions,
    )


def detect_smoke_advisory_intent(message: str) -> bool:
    q = message.lower()
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
        "lookout",
        "alidade",
        "osborne",
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
        "mudflat trekking",
        "mudflat",
        "weather station",
        "anemometry",
        "rentals",
        "rental",
    ]
    if any(k in q for k in exclusions):
        return False

    keywords = [
        "smoke advisory",
        "wildfire smoke",
        "smoke drift",
        "pm2.5",
        "aqi",
        "air quality",
        "inversion smoke",
        "particulate mask",
        "n95 smoke",
        "smoke plume",
        "respirator",
        "wildfire aqi",
    ]
    if any(k in q for k in keywords):
        return True

    station_names = [
        "pasayten",
        "boundary fire",
        "sawtooth wilderness",
        "sawtooth valley",
        "sierra crest",
        "granite gap",
        "san juan wetterhorn",
        "wetterhorn",
        "bob marshall",
    ]
    if any(k in q for k in station_names) and (
        "smoke" in q or "air" in q or "aqi" in q or "pm" in q
    ):
        return True

    return False


def format_smoke_advisory_response(intent: str, data: Any = None) -> FormattedSmokeAdvisoryResponse:
    if isinstance(data, dict) and "smoke_advisory_info" in data:
        answer = str(data.get("answer", "Wilderness smoke advisory telemetry"))
        return FormattedSmokeAdvisoryResponse(answer, data)

    action = intent
    if isinstance(intent, SmokeAdvisoryIntent):
        action = intent.action
    elif isinstance(data, SmokeAdvisoryResult) or action == "calculate":
        calc_res = (
            data
            if isinstance(data, SmokeAdvisoryResult)
            else calculate_smoke_exposure(SmokeAdvisoryQuery())
        )
        answer = (
            f"Wilderness Smoke Advisory for {calc_res.station_name} ({calc_res.layer}): "
            f"Status: {calc_res.safety_status.upper()}. "
            f"Effective PM2.5: {calc_res.effective_pm25_ug_m3} µg/m³. "
            f"Effective AQI: {calc_res.effective_aqi}. "
            f"Inhaled Particulate Dose: {calc_res.inhaled_particulate_dose_ug} µg ({calc_res.activity_intensity}, {calc_res.exposure_hours}h, respirator: {calc_res.respirator_type}). "
            f"{calc_res.advisory}"
        )
        calc_info: dict[str, Any] = {
            "smoke_advisory_info": {
                "action": "calculate",
                "station_id": calc_res.station_id,
                "calculation": calc_res.model_dump(),
                "effective_pm25_ug_m3": calc_res.effective_pm25_ug_m3,
                "effective_aqi": calc_res.effective_aqi,
                "inhaled_particulate_dose_ug": calc_res.inhaled_particulate_dose_ug,
                "safety_status": calc_res.safety_status,
                "advisory": calc_res.advisory,
                "recommended_actions": calc_res.recommended_actions,
            },
            "answer": answer,
        }
        return FormattedSmokeAdvisoryResponse(answer, calc_info)

    if action in ("gear", "gear_checklist"):
        checklist = data if isinstance(data, list) else get_smoke_gear_checklist()
        items_str = "; ".join(f"{g.name} ({g.description})" for g in checklist[:3])
        answer = (
            f"Mandatory Wilderness Smoke Protection & Particulate Safety Gear ({len(checklist)} items): "
            f"{items_str}; plus {', '.join(g.name for g in checklist[3:])}. "
            "Certified N95/P100 respirators, sealed foam goggles, and tent HEPA scrubbers are mandatory in active smoke plumes."
        )
        gear_info: dict[str, Any] = {
            "smoke_advisory_info": {
                "action": "gear",
                "gear": [g.model_dump() for g in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedSmokeAdvisoryResponse(answer, gear_info)

    if action in ("station_detail", "detail"):
        station = (
            data
            if isinstance(data, SmokeStation)
            else get_smoke_station_by_id(str(data or "pasayten-boundary-fire"))
        )
        if station:
            highlights_str = "; ".join(station.highlights)
            answer = (
                f"Wilderness Smoke Monitoring Station: {station.name} ({station.range}, {station.region} - {station.elevation_meters}m). "
                f"AQI: {station.aqi} | PM2.5: {station.pm25_ug_m3} µg/m³ | Severity: {station.severity} | Elevation Layer: {station.layer}. "
                f"Inversion Trapped: {'Yes' if station.inversion_trapped else 'No'} | Distance to Fire Perimeter: {station.active_fire_distance_km} km. "
                f"{station.description} Highlights: {highlights_str}."
            )
            station_info: dict[str, Any] = {
                "smoke_advisory_info": {
                    "action": "station_detail",
                    "station_id": station.id,
                    "station": station.model_dump(),
                },
                "answer": answer,
            }
            return FormattedSmokeAdvisoryResponse(answer, station_info)

    # Default stations list
    stations = data if isinstance(data, list) else get_smoke_stations()
    summary_str = "; ".join(
        f"{s.name} ({s.layer}, AQI {s.aqi}, PM2.5 {s.pm25_ug_m3} µg/m³)" for s in stations
    )
    answer = (
        f"Contoso Wilderness Forest Fire Smoke Drift & Alpine Air Quality Stations ({len(stations)} active stations): "
        f"{summary_str}. Ask about smoke exposure calculations, valley inversion trapping, or particulate respirators."
    )
    list_info: dict[str, Any] = {
        "smoke_advisory_info": {
            "action": "stations_list",
            "stations": [s.model_dump() for s in stations],
        },
        "answer": answer,
    }
    return FormattedSmokeAdvisoryResponse(answer, list_info)


def build_smoke_advisory_prompt(query_or_intent: Any = "") -> str:
    stations = get_smoke_stations()
    lines = [
        "Wilderness Forest Fire Smoke Drift & Alpine Air Quality Guidance:",
        "- Valley Basin Inversion Trapping: Overnight radiation inversions pool dense particulate smoke into low river basins; climbing to mid-slope thermal belts often provides cleaner air refuge.",
        "- Elevation Layer Drift: Alpine ridge free air experiences higher wind dispersion but direct convective plumes funnel across high granite cols creating extreme localized spikes.",
        "- Exertion Minute Ventilation: Strenuous alpine climbing increases lung ventilation from 0.6 m³/h (camp rest) to 3.2 m³/h, dramatically multiplying inhaled PM2.5 particulate mass.",
        "- Particulate PPE: NIOSH-certified N95 respirators filter 95% of fine combustion particles; elastomeric P100 half-masks offer 99.9% filtration for intense exposure.",
        "- Mandatory Gear Checklist: Valved N95 Respirator, Foam-Sealed Smoke Goggles, Field Laser PM2.5 Sensor, In-Tent Positive-Pressure HEPA Scrubber, Ophthalmic Saline Rinse, Emergency Inhaler Pouch.",
        f"Active Wilderness Telemetry Stations ({len(stations)} reporting):",
    ]
    for s in stations:
        lines.append(
            f"- {s.name} ({s.id}): {s.elevation_meters}m, AQI {s.aqi}, PM2.5 {s.pm25_ug_m3} µg/m³, {s.layer}, inversion trapped: {s.inversion_trapped}"
        )
    return "\n".join(lines)


def smoke_advisory_tool(
    query: Optional[SmokeAdvisoryQuery] = None,
    action: Optional[str] = None,
    station_id: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    if action == "calculate" or query is not None:
        calc_q = query or SmokeAdvisoryQuery(station_id=station_id or "pasayten-boundary-fire")
        res = calculate_smoke_exposure(calc_q)
        formatted = format_smoke_advisory_response("calculate", res)
        return dict(formatted._data)

    if action in ("gear", "gear_checklist"):
        checklist = get_smoke_gear_checklist()
        formatted = format_smoke_advisory_response("gear", checklist)
        return dict(formatted._data)

    if action in ("station_detail", "detail") and station_id:
        station = get_smoke_station_by_id(station_id)
        if station:
            formatted = format_smoke_advisory_response("station_detail", station)
            return dict(formatted._data)

    stations = get_smoke_stations()
    formatted = format_smoke_advisory_response("stations_list", stations)
    return dict(formatted._data)
