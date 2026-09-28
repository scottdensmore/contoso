import math
from typing import Any, Optional

from pydantic import BaseModel, Field


class WeatherStationModel(BaseModel):
    station_id: str
    title: str
    mountain_range: str
    region: str
    elevation_m: int
    alpine_zone: str
    sensor_type: str
    battery_volts: float
    current_wind_kph: int
    description: str
    highlights: list[str] = Field(default_factory=list)


class WeatherStationRequest(BaseModel):
    station_id: str = "everest-south-col-station"
    ambient_temp_c: float = -18.0
    wind_speed_kph: float = 65.0
    solar_irradiance_wm2: float = 450.0
    rime_icing_probability_percent: float = 25.0


class WeatherStationResponse(BaseModel):
    station_id: str
    station_title: str
    alpine_zone: str
    wind_chill_c: int
    battery_discharge_rate_w: int
    wind_dynamic_pressure_nm2: int
    telemetry_status: str
    thermal_advisory: str
    station_health_guidance: str


class WeatherStationGearModel(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class WeatherStationIntent(BaseModel):
    action: str
    station_id: Optional[str] = None
    alpine_zone: Optional[str] = None


class FormattedWeatherStationResponse(str):
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


DEFAULT_WEATHER_STATIONS: dict[str, WeatherStationModel] = {
    "everest-south-col-station": WeatherStationModel(
        station_id="everest-south-col-station",
        title="Everest South Col Alpine Weather Station",
        mountain_range="Khumbu Himalayas",
        region="Nepal",
        elevation_m=7945,
        alpine_zone="high_altitude_col",
        sensor_type="heated_ultrasonic_anemometer",
        battery_volts=13.8,
        current_wind_kph=85,
        description="Perched at 7,945 m on the windswept South Col between Mount Everest and Lhotse, braving jet stream gales and extreme thin-air freeze cycles.",
        highlights=[
            "Highest weather station on Earth",
            "Dual sonic anemometers with rime heating",
            "Iridium satellite real-time burst telemetry",
        ],
    ),
    "denali-football-field-station": WeatherStationModel(
        station_id="denali-football-field-station",
        title="Denali Football Field High Camp Station",
        mountain_range="Alaska Range",
        region="AK, USA",
        elevation_m=5710,
        alpine_zone="glacier_basin_camp",
        sensor_type="heated_ultrasonic_anemometer",
        battery_volts=12.6,
        current_wind_kph=68,
        description="Anchored into deep firn ice on Denali’s high basin plateau at 5,710 m, enduring severe arctic blizzards and prolonged sub-zero whiteouts.",
        highlights=[
            "Sub-zero -50°C arctic wind survival",
            "Acoustic snow depth accumulation gauge",
            "Solar-supercapacitor hybrid power array",
        ],
    ),
    "mount-washington-observatory": WeatherStationModel(
        station_id="mount-washington-observatory",
        title="Mount Washington Summit Auto Station",
        mountain_range="White Mountains",
        region="NH, USA",
        elevation_m=1917,
        alpine_zone="extreme_summit_crest",
        sensor_type="cup_and_vane_mechanical",
        battery_volts=14.2,
        current_wind_kph=110,
        description="Located at the convergence of three major storm tracks, famed for historic 231 mph winds, relentless rime ice accretion, and cyclonic turbulence.",
        highlights=[
            "Historic 231 mph peak gust record site",
            "Heavy rime ice de-icing thermal heaters",
            "Triple redundant pitot-static pressure tubes",
        ],
    ),
    "matterhorn-solvay-station": WeatherStationModel(
        station_id="matterhorn-solvay-station",
        title="Matterhorn Solvay Hut Ridge Station",
        mountain_range="Pennine Alps",
        region="Switzerland",
        elevation_m=4003,
        alpine_zone="subalpine_ridgeline",
        sensor_type="laser_optical_disdrometer",
        battery_volts=13.1,
        current_wind_kph=45,
        description="Mounted onto sheer granite ledges along the Hörnli Ridge below the Matterhorn summit, monitoring localized storm cell development and cloud microphysics.",
        highlights=[
            "Exposed granite arete mast mounting",
            "Laser precipitation particle spectroscopy",
            "LoRaWAN mountain rescue telemetry relay",
        ],
    ),
    "aconcagua-colera-high-camp": WeatherStationModel(
        station_id="aconcagua-colera-high-camp",
        title="Aconcagua Camp Colera Weather Tower",
        mountain_range="Andes",
        region="Argentina",
        elevation_m=5970,
        alpine_zone="high_altitude_col",
        sensor_type="heated_ultrasonic_anemometer",
        battery_volts=12.9,
        current_wind_kph=72,
        description="Standing guard above 5,900 m in the Central Andes, measuring punishing Viento Blanco cyclonic winds and high ultraviolet solar radiation.",
        highlights=[
            "Viento Blanco gale force gust detection",
            "Extreme UV solar pyranometer telemetry",
            "Grounded lightning strike surge arrestors",
        ],
    ),
}

DEFAULT_WEATHER_STATION_GEAR: list[WeatherStationGearModel] = [
    WeatherStationGearModel(
        item_id="heated-sonic-anemometer-sensor",
        name="Heated Ultrasonic Solid-State Alpine Anemometer (No Moving Parts)",
        category="anemometer",
        mandatory=True,
        purpose="Rugged dual-axis acoustic resonance wind velocity sensor with internal rime heating elements to prevent ice lockup.",
    ),
    WeatherStationGearModel(
        item_id="arctic-lifepo4-battery-pack",
        name="Cold-Temperature Insulated LiFePO4 Station Battery with Internal Heater",
        category="power",
        mandatory=True,
        purpose="Specialized lithium iron phosphate battery enclosure engineered for discharge down to -40°C with automated self-heating mats.",
    ),
    WeatherStationGearModel(
        item_id="iridium-satellite-burst-transceiver",
        name="Iridium SBD Low-Earth Orbit Satellite Telemetry Transceiver",
        category="telemetry",
        mandatory=True,
        purpose="Short-burst data (SBD) modem providing pole-to-pole global packet delivery for meteorological feeds in off-grid terrain.",
    ),
    WeatherStationGearModel(
        item_id="titanium-guywire-mast-anchors",
        name="Aircraft-Grade Titanium Guy-Wire Mast Tower Rigging Kit (150mph rated)",
        category="rigging",
        mandatory=True,
        purpose="High-tensile corrosion-resistant titanium rigging cables and earth-permafrost screw anchors resisting cyclonic wind loading.",
    ),
    WeatherStationGearModel(
        item_id="anti-rime-hydrophobic-dome",
        name="Superhydrophobic Fluoropolymer Anti-Rime Coating & Heat Wrap",
        category="de_icing",
        mandatory=True,
        purpose="Nano-textured fluoropolymer surface barrier preventing supercooled water droplet accretion on sensor housings.",
    ),
    WeatherStationGearModel(
        item_id="lightning-dissipation-ground-rod",
        name="High-Altitude Copper-Clad Grounding Rod & Surge Arrestor Array",
        category="lightning_protection",
        mandatory=True,
        purpose="Multipath transient voltage surge suppression system designed for dry rocky ridgelines with minimal soil conductivity.",
    ),
]


def get_weather_stations(zone: Optional[str] = None) -> list[WeatherStationModel]:
    stations = list(DEFAULT_WEATHER_STATIONS.values())
    if zone:
        normalized_zone = zone.strip().lower().replace("-", "_").replace(" ", "_")
        stations = [
            s for s in stations
            if s.alpine_zone.lower().replace("-", "_").replace(" ", "_") == normalized_zone
        ]
    return stations


def get_weather_station(station_id: str) -> Optional[WeatherStationModel]:
    normalized = station_id.strip().lower()
    for k, v in DEFAULT_WEATHER_STATIONS.items():
        if k.lower() == normalized or v.station_id.lower() == normalized:
            return v
    return None


def get_weather_station_gear_checklist() -> list[WeatherStationGearModel]:
    return list(DEFAULT_WEATHER_STATION_GEAR)


def calculate_station_telemetry(req: WeatherStationRequest) -> WeatherStationResponse:
    station = get_weather_station(req.station_id)
    if not station:
        raise ValueError(f"Weather station '{req.station_id}' not found")

    ambient_temp_c = req.ambient_temp_c
    wind_speed_kph = req.wind_speed_kph
    rime_prob = req.rime_icing_probability_percent

    effective_wind = max(5.0, wind_speed_kph)
    wind_pow = effective_wind ** 0.16
    wind_chill_c = int(
        round(13.12 + 0.6215 * ambient_temp_c - 11.37 * wind_pow + 0.3965 * ambient_temp_c * wind_pow)
    )

    temp_draw = 25.0 if ambient_temp_c < -20.0 else (10.0 if ambient_temp_c < 0.0 else 2.0)
    rime_draw = 35.0 if rime_prob > 40.0 else 0.0
    battery_discharge_rate_w = int(round(15.0 + temp_draw + rime_draw))

    air_density = 1.225 * math.exp(-station.elevation_m / 8500.0)
    wind_speed_ms = wind_speed_kph * 0.277778
    wind_dynamic_pressure_nm2 = int(round(0.5 * air_density * (wind_speed_ms ** 2)))

    if battery_discharge_rate_w > 60 or ambient_temp_c < -40.0 or wind_speed_kph > 160.0:
        telemetry_status = "critical_sensor_freeze_power_loss"
        thermal_advisory = (
            "Severe freezing conditions: Heating circuit maximum threshold exceeded; potential power exhaustion or icing failure."
        )
        station_health_guidance = (
            "Station telemetry critical. Immediate remote power conservation protocol and sensor heater throttling recommended."
        )
    elif rime_prob >= 50.0 or wind_speed_kph >= 90.0 or ambient_temp_c <= -15.0:
        telemetry_status = "advisory_rime_icing_detected"
        thermal_advisory = "Sub-zero conditions with active icing threat: Rime heating elements engaged."
        station_health_guidance = (
            "Active de-icing advisory. Monitor solar panel charging and power reserves during prolonged low-sun periods."
        )
    else:
        telemetry_status = "nominal_transmission"
        thermal_advisory = "Operational parameters within stable thermal margins: Normal auxiliary heating load."
        station_health_guidance = "Optimal station telemetry health. Routine data packet bursts scheduled."

    return WeatherStationResponse(
        station_id=station.station_id,
        station_title=station.title,
        alpine_zone=station.alpine_zone,
        wind_chill_c=wind_chill_c,
        battery_discharge_rate_w=battery_discharge_rate_w,
        wind_dynamic_pressure_nm2=wind_dynamic_pressure_nm2,
        telemetry_status=telemetry_status,
        thermal_advisory=thermal_advisory,
        station_health_guidance=station_health_guidance,
    )


def detect_weather_station_intent(query: str) -> Optional[WeatherStationIntent]:
    q = query.lower()
    exclusions = [
        "order #", "refund", "return label", "shipping tracking", "burro", "horse",
        "pack goat", "dogsled", "trapping", "gold pan", "beachcombing", "fire lookout",
        "snowshoe", "sandboarding", "cave diving", "caving", "ski touring", "steep skiing",
        "nordic", "telemark", "falconry", "llama", "pack llama", "zipline", "zip line",
        "turtle patrol", "sea turtle", "night via ferrata", "via ferrata",
        "canyon bouldering", "bouldering", "mudflat trekking", "mudflat", "rentals", "rental"
    ]
    if any(k in q for k in exclusions):
        return None

    ws_keywords = [
        "weather station",
        "alpine weather station",
        "mountaineering weather station",
        "station telemetry",
        "alpine anemometry",
        "ultrasonic anemometer",
        "anemometry",
        "camp muir weather station",
        "south col weather station",
        "denali weather station",
        "mast rigging",
        "rime de-icing",
        "station battery telemetry",
        "pyranometer",
        "disdrometer",
        "guy-wire rigging",
        "battery discharge telemetry",
        "station battery",
        "acoustic snow depth",
        "weather tower",
    ]

    has_ws_keyword = any(k in q for k in ws_keywords)

    is_station_named = (
        ("everest" in q and ("col" in q or "station" in q or "weather" in q))
        or ("denali" in q and ("camp" in q or "field" in q or "station" in q or "telemetry" in q))
        or ("washington" in q and ("observatory" in q or "summit auto" in q or "station" in q))
        or ("matterhorn" in q and ("solvay" in q or "station" in q or "de-icing" in q))
        or ("aconcagua" in q and ("colera" in q or "camp" in q or "tower" in q or "station" in q))
    )

    if not (has_ws_keyword or is_station_named):
        return None

    station_id: Optional[str] = None
    if "everest" in q or "south col" in q:
        station_id = "everest-south-col-station"
    elif "denali" in q or "football field" in q:
        station_id = "denali-football-field-station"
    elif "washington" in q or "observatory" in q:
        station_id = "mount-washington-observatory"
    elif "matterhorn" in q or "solvay" in q:
        station_id = "matterhorn-solvay-station"
    elif "aconcagua" in q or "colera" in q:
        station_id = "aconcagua-colera-high-camp"

    alpine_zone: Optional[str] = None
    if "high_altitude_col" in q or "high altitude col" in q:
        alpine_zone = "high_altitude_col"
    elif "glacier_basin_camp" in q or "glacier basin" in q or "glacier camp" in q:
        alpine_zone = "glacier_basin_camp"
    elif "extreme_summit_crest" in q or "extreme summit" in q or "summit crest" in q:
        alpine_zone = "extreme_summit_crest"
    elif "subalpine_ridgeline" in q or "subalpine" in q or "ridgeline" in q:
        alpine_zone = "subalpine_ridgeline"

    is_gear = any(k in q for k in [
        "gear", "checklist", "rigging", "equipment", "guywire", "guy-wire",
        "hardware", "mast kit", "anchor",
    ])
    is_calc = any(k in q for k in [
        "calculate", "dynamics", "calculation", "formula", "discharge rate",
        "dynamic pressure", "pressure calculation", "wind chill", "battery discharge",
    ])

    if is_calc:
        action = "calculate"
    elif is_gear:
        action = "gear"
    elif station_id:
        action = "station_detail"
    else:
        action = "stations_list"

    return WeatherStationIntent(
        action=action,
        station_id=station_id,
        alpine_zone=alpine_zone,
    )


def format_weather_station_response(
    data_or_intent: Any,
    query: str = "",
) -> FormattedWeatherStationResponse:
    if isinstance(data_or_intent, dict):
        answer = data_or_intent.get("answer", "Alpine weather station telemetry response")
        return FormattedWeatherStationResponse(answer, data_or_intent)

    intent: WeatherStationIntent
    if isinstance(data_or_intent, WeatherStationIntent):
        intent = data_or_intent
    elif isinstance(data_or_intent, WeatherStationResponse):
        calc_res = data_or_intent
        answer = (
            f"Alpine Weather Station Telemetry for {calc_res.station_title} ({calc_res.alpine_zone}): "
            f"Status: {calc_res.telemetry_status.upper()}. "
            f"Wind Chill: {calc_res.wind_chill_c}°C. "
            f"Battery Discharge Rate: {calc_res.battery_discharge_rate_w} W. "
            f"Wind Dynamic Pressure: {calc_res.wind_dynamic_pressure_nm2} N/m². "
            f"Advisory: {calc_res.thermal_advisory} "
            f"Guidance: {calc_res.station_health_guidance}"
        )
        calc_info: dict[str, Any] = {
            "weather_station_info": {
                "action": "calculate",
                "station_id": calc_res.station_id,
                "calculation": calc_res.model_dump(),
                "wind_chill_c": calc_res.wind_chill_c,
                "battery_discharge_rate_w": calc_res.battery_discharge_rate_w,
                "wind_dynamic_pressure_nm2": calc_res.wind_dynamic_pressure_nm2,
                "telemetry_status": calc_res.telemetry_status,
                "thermal_advisory": calc_res.thermal_advisory,
                "station_health_guidance": calc_res.station_health_guidance,
            },
            "answer": answer,
        }
        return FormattedWeatherStationResponse(answer, calc_info)
    else:
        detected = detect_weather_station_intent(str(data_or_intent))
        intent = detected or WeatherStationIntent(action="stations_list")

    if intent.action in ("calculate", "calculate_dynamics"):
        target_station_id = intent.station_id or "everest-south-col-station"
        calc_req = WeatherStationRequest(station_id=target_station_id)
        calc_res = calculate_station_telemetry(calc_req)
        answer = (
            f"Alpine Weather Station Telemetry for {calc_res.station_title} ({calc_res.alpine_zone}): "
            f"Status: {calc_res.telemetry_status.upper()}. "
            f"Wind Chill: {calc_res.wind_chill_c}°C. "
            f"Battery Discharge Rate: {calc_res.battery_discharge_rate_w} W. "
            f"Wind Dynamic Pressure: {calc_res.wind_dynamic_pressure_nm2} N/m². "
            f"Advisory: {calc_res.thermal_advisory} "
            f"Guidance: {calc_res.station_health_guidance}"
        )
        calc_info = {
            "weather_station_info": {
                "action": "calculate",
                "station_id": calc_res.station_id,
                "calculation": calc_res.model_dump(),
                "wind_chill_c": calc_res.wind_chill_c,
                "battery_discharge_rate_w": calc_res.battery_discharge_rate_w,
                "wind_dynamic_pressure_nm2": calc_res.wind_dynamic_pressure_nm2,
                "telemetry_status": calc_res.telemetry_status,
                "thermal_advisory": calc_res.thermal_advisory,
                "station_health_guidance": calc_res.station_health_guidance,
            },
            "answer": answer,
        }
        return FormattedWeatherStationResponse(answer, calc_info)

    if intent.action in ("gear", "gear_checklist"):
        checklist = get_weather_station_gear_checklist()
        items_str = "; ".join(f"{g.name} ({g.purpose})" for g in checklist[:3])
        answer = (
            f"Mandatory High-Altitude Weather Station & Alpine Rigging Gear Checklist ({len(checklist)} items): "
            f"{items_str}; plus {', '.join(g.name for g in checklist[3:])}. "
            "Heated sonic anemometers, cold-temperature LiFePO4 packs, and titanium mast guy-wires are required."
        )
        gear_info: dict[str, Any] = {
            "weather_station_info": {
                "action": "gear",
                "gear": [g.model_dump() for g in checklist],
                "mandatory_count": len([g for g in checklist if g.mandatory]),
            },
            "answer": answer,
        }
        return FormattedWeatherStationResponse(answer, gear_info)

    if intent.action in ("station_detail", "detail") and intent.station_id:
        station = get_weather_station(intent.station_id)
        if station:
            highlights_str = "; ".join(station.highlights)
            answer = (
                f"Alpine Weather Station: {station.title} ({station.mountain_range}, {station.region} - {station.elevation_m}m). "
                f"Alpine Zone: {station.alpine_zone.replace('_', ' ').title()} | Sensor Package: {station.sensor_type} | "
                f"Battery: {station.battery_volts}V | Current Wind: {station.current_wind_kph} kph. "
                f"{station.description} Key Highlights: {highlights_str}."
            )
            detail_info: dict[str, Any] = {
                "weather_station_info": {
                    "action": "station_detail",
                    "station_id": station.station_id,
                    "station": station.model_dump(),
                },
                "answer": answer,
            }
            return FormattedWeatherStationResponse(answer, detail_info)

    stations = get_weather_stations(zone=intent.alpine_zone)
    filter_note = f" ({intent.alpine_zone})" if intent.alpine_zone else ""
    summary_str = "; ".join(
        f"{s.title} ({s.alpine_zone}, {s.elevation_m}m, {s.sensor_type})" for s in stations
    )
    answer = (
        f"Contoso High-Altitude Mountaineering Weather Stations{filter_note} ({len(stations)} active stations): "
        f"{summary_str}. Ask about station telemetry calculations, sensor de-icing, or mast rigging gear."
    )
    list_info: dict[str, Any] = {
        "weather_station_info": {
            "action": "stations_list",
            "alpine_zone": intent.alpine_zone,
            "stations": [s.model_dump() for s in stations],
        },
        "answer": answer,
    }
    return FormattedWeatherStationResponse(answer, list_info)


def build_weather_station_prompt(
    intent: Optional[WeatherStationIntent] = None,
) -> str:
    lines = [
        "High-Altitude Mountaineering Weather Station Telemetry & Alpine Anemometry Guidance:",
        "- Heated Ultrasonic Anemometry: Solid-state sonic resonance transducers eliminate moving cups susceptible to mechanical rime freeze and bearing seizure.",
        "- Battery Discharge & Thermal Conditioning: Sub-zero arctic conditions require internal heating mats for LiFePO4 chemistry to maintain telemetry transmissions.",
        "- High-Altitude Dynamic Pressure: Rarefied air density at extreme elevations reduces dynamic wind loading (q = 0.5 * rho * v^2) despite high storm velocities.",
        "- Mast Rigging & Lightning Grounding: Titanium guy-wire anchors and rock ground rod dissipation arrays protect towers from hurricane gales and high-altitude electrostatic discharge.",
        "- Mandatory Station Package: Heated Ultrasonic Anemometer, Insulated LiFePO4 Battery Pack, Iridium SBD Modem, Titanium Guy-Wire Kit, Anti-Rime Fluoropolymer Dome, Lightning Dissipation Rod.",
    ]
    if intent and intent.station_id:
        station = get_weather_station(intent.station_id)
        if station:
            lines.append(
                f"- Selected Station: {station.title} ({station.mountain_range}, {station.region})\n"
                f"  Elevation: {station.elevation_m}m | Alpine Zone: {station.alpine_zone} | Sensor: {station.sensor_type}\n"
                f"  Current Wind: {station.current_wind_kph} kph | Battery: {station.battery_volts}V\n"
                f"  Description: {station.description}\n"
                f"  Highlights: {'; '.join(station.highlights)}"
            )
    else:
        zone = intent.alpine_zone if intent else None
        stations = get_weather_stations(zone=zone)
        lines.append(f"Available Alpine Weather Stations ({len(stations)} active):")
        for s in stations:
            lines.append(
                f"- {s.title} ({s.station_id}): {s.elevation_m}m, {s.alpine_zone}, {s.sensor_type}"
            )
    return "\n".join(lines)


def weather_station_tool(
    request: Optional[WeatherStationRequest] = None,
    action: Optional[str] = None,
    station_id: Optional[str] = None,
    alpine_zone: Optional[str] = None,
    **kwargs: Any,
) -> Any:
    if action in ("calculate", "calculate_dynamics") or request is not None:
        calc_req = request or WeatherStationRequest(
            station_id=station_id or "everest-south-col-station"
        )
        res = calculate_station_telemetry(calc_req)
        formatted = format_weather_station_response(
            WeatherStationIntent(action="calculate", station_id=res.station_id)
        )
        return dict(formatted._data)

    intent = WeatherStationIntent(
        action=action or "stations_list",
        station_id=station_id,
        alpine_zone=alpine_zone,
    )
    formatted = format_weather_station_response(intent)
    return dict(formatted._data)
