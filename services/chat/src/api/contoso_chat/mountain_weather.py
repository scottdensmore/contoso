import re
from typing import Any, Optional

from pydantic import BaseModel, Field


class WeatherSectorModel(BaseModel):
    sector_id: str
    title: str
    mountain_range: str
    region: str
    elevation_m: int
    synoptic_level: str
    venturi_multiplier: float
    default_jet_stream_offset_km: int
    description: str
    highlights: list[str] = Field(default_factory=list)


class MountainWeatherRequest(BaseModel):
    sector_id: str = "denali-south-buttress"
    baseline_wind_mph: float = 20.0
    barometric_drop_hpa: float = 1.2
    jet_stream_offset_km: int = 150
    air_temp_f: float = 10.0


class MountainWeatherResponse(BaseModel):
    sector_id: str
    sector_title: str
    elevation_m: int
    summit_wind_mph: int
    wind_chill_f: int
    barometric_trend: str
    summit_window_status: str
    route_advisory: str


class WeatherGearItemModel(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class MountainWeatherIntent(BaseModel):
    action: str
    sector_id: Optional[str] = None
    synoptic_level: Optional[str] = None


class FormattedMountainWeatherResponse(str):
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


DEFAULT_WEATHER_SECTORS: dict[str, WeatherSectorModel] = {
    "denali-south-buttress": WeatherSectorModel(
        sector_id="denali-south-buttress",
        title="Denali Upper Kahiltna & South Buttress",
        mountain_range="Alaska Range",
        region="AK, USA",
        elevation_m=6190,
        synoptic_level="500mb",
        venturi_multiplier=2.2,
        default_jet_stream_offset_km=80,
        description="High-latitude sub-arctic peak subjected to intense 500mb jet stream incursions and severe ridge acceleration over the South Buttress and Kahiltna Pass.",
        highlights=[
            "Sub-arctic polar jet stream intersection",
            "Extreme summit venturi acceleration",
            "Sudden Gulf of Alaska barometric drops",
        ],
    ),
    "mount-washington-ridge": WeatherSectorModel(
        sector_id="mount-washington-ridge",
        title="Mount Washington Presidential Range Summit",
        mountain_range="White Mountains",
        region="NH, USA",
        elevation_m=1917,
        synoptic_level="700mb",
        venturi_multiplier=2.6,
        default_jet_stream_offset_km=40,
        description="World-renowned extreme wind nexus where converging storm tracks force severe venturi compression across the Presidential Range ridge crest.",
        highlights=[
            "Convergence zone super-hurricane gusts",
            "Continuous supercooled rime icing",
            "Severe lee-wave rotor turbulence",
        ],
    ),
    "rainier-columbia-crest": WeatherSectorModel(
        sector_id="rainier-columbia-crest",
        title="Mount Rainier Columbia Crest & Crater Rim",
        mountain_range="Cascade Range",
        region="WA, USA",
        elevation_m=4392,
        synoptic_level="600mb",
        venturi_multiplier=1.8,
        default_jet_stream_offset_km=120,
        description="Isolated stratovolcano standing high above Pacific Northwest terrain, generating profound cap clouds, shear turbulence, and orographic moisture traps.",
        highlights=[
            "Pacific atmospheric river moisture plume",
            "Lenticular cloud cap cap-shear warning",
            "Freezing level inversion swings",
        ],
    ),
    "everest-south-col": WeatherSectorModel(
        sector_id="everest-south-col",
        title="Mount Everest South Col & Geneva Spur Sector",
        mountain_range="Mahalangur Himalaya",
        region="Nepal",
        elevation_m=7906,
        synoptic_level="300mb",
        venturi_multiplier=2.4,
        default_jet_stream_offset_km=25,
        description="Death zone high-altitude saddle directly intersecting the subtropical jet stream at 300mb geopotential heights, causing hurricane winds and severe plume clouds.",
        highlights=[
            "Direct subtropical jet stream plume",
            "Summit plume banner cloud dynamics",
            "Hypoxic extreme wind chill drop",
        ],
    ),
    "matterhorn-hornli-ridge": WeatherSectorModel(
        sector_id="matterhorn-hornli-ridge",
        title="Matterhorn Hörnli Ridge & Solvay Platform",
        mountain_range="Pennine Alps",
        region="Zermatt, Switzerland",
        elevation_m=4478,
        synoptic_level="600mb",
        venturi_multiplier=1.9,
        default_jet_stream_offset_km=150,
        description="Iconic pyramid peak exposed to northern and southern alpine airmass collisions, rapid Genoa low cyclogenesis, and severe Foehn wind events.",
        highlights=[
            "Foehn wind lee-side thermal surge",
            "Rapid cyclogenesis Genoa low tracking",
            "Isolated summit lightning discharge",
        ],
    ),
}

DEFAULT_WEATHER_GEAR: list[WeatherGearItemModel] = [
    WeatherGearItemModel(
        item_id="barometric-altimeter-watch",
        name="Triple-Sensor Barometric Pressure Altimeter Watch with Storm Alarm",
        category="barometry",
        mandatory=True,
        purpose="Monitors millibar pressure drops and sounds sudden storm alarms",
    ),
    WeatherGearItemModel(
        item_id="ultralight-anemometer",
        name="Calibrated Digital Vane Anemometer with Wind Chill Thermometer",
        category="wind",
        mandatory=True,
        purpose="Direct measurement of sustained gale and summit ridge gust velocities",
    ),
    WeatherGearItemModel(
        item_id="satellite-synoptic-inreach",
        name="Two-Way Satellite Messenger with High-Resolution Synoptic Weather Forecasts",
        category="communications",
        mandatory=True,
        purpose="Pulls updated ECMWF and GFS upper-air forecast runs in the field",
    ),
    WeatherGearItemModel(
        item_id="aviation-synoptic-chart",
        name="Waterproof Laminated 500mb Upper-Air Geopotential Chart & Cloud Key",
        category="navigation",
        mandatory=True,
        purpose="Decodes 500hPa vorticity, jet stream cores, and front trajectories",
    ),
    WeatherGearItemModel(
        item_id="thermal-face-mask-goggles",
        name="Double-Lens Antifog Glacier Goggles & Neoprene Wind-Rime Face Mask",
        category="protection",
        mandatory=True,
        purpose="Shields against frostbite and severe cornea freezing in hurricane rime winds",
    ),
    WeatherGearItemModel(
        item_id="emergency-hypothermia-bivy",
        name="4-Season Insulated Mylar Reflective Storm Shelter Bivouac",
        category="survival",
        mandatory=True,
        purpose="Provides immediate thermal refuge during unexpected summit whiteout halts",
    ),
]


def get_weather_sectors(synoptic_level: Optional[str] = None) -> list[WeatherSectorModel]:
    sectors = list(DEFAULT_WEATHER_SECTORS.values())
    if synoptic_level:
        target = synoptic_level.strip().lower()
        sectors = [s for s in sectors if s.synoptic_level.lower() == target]
    return sectors


def get_weather_sector(sector_id: str) -> Optional[WeatherSectorModel]:
    normalized = sector_id.strip().lower()
    for k, v in DEFAULT_WEATHER_SECTORS.items():
        if k.lower() == normalized or v.sector_id.lower() == normalized:
            return v
    return None


def get_weather_gear() -> list[WeatherGearItemModel]:
    return list(DEFAULT_WEATHER_GEAR)


def calculate_mountain_weather(request: MountainWeatherRequest) -> MountainWeatherResponse:
    sector = get_weather_sector(request.sector_id)
    if not sector:
        raise ValueError(f"Mountain weather sector '{request.sector_id}' not found")

    offset = request.jet_stream_offset_km
    jet_boost = (100 - offset) * 0.25 if offset < 100 else 0.0
    summit_wind_mph = round(request.baseline_wind_mph * sector.venturi_multiplier + jet_boost)

    temp = request.air_temp_f
    if summit_wind_mph > 3 and temp <= 50.0:
        wf = summit_wind_mph ** 0.16
        wind_chill_f = round(35.74 + (0.6215 * temp) - (35.75 * wf) + (0.4275 * temp * wf))
    else:
        wind_chill_f = round(temp)

    drop = request.barometric_drop_hpa
    if drop < 1.0:
        barometric_trend = "steady_fair"
    elif drop < 2.5:
        barometric_trend = "approaching_front"
    elif drop < 4.0:
        barometric_trend = "rapid_storm_warning"
    else:
        barometric_trend = "explosive_cyclogenesis_evacuation"

    if summit_wind_mph > 50 or drop >= 2.5 or offset < 40:
        summit_window_status = "abort_severe_winds_whiteout"
    elif summit_wind_mph >= 30 or drop >= 1.0 or offset < 100:
        summit_window_status = "marginal_caution_window"
    else:
        summit_window_status = "go_summit_window"

    trend_disp = barometric_trend.replace("_", " ")
    if summit_window_status == "abort_severe_winds_whiteout":
        route_advisory = (
            f"ABORT ADVISORY for {sector.title} ({sector.elevation_m}m): High-altitude storm conditions. "
            f"Summit wind {summit_wind_mph} mph with wind chill {wind_chill_f}°F and {trend_disp} "
            f"(drop {drop:.1f} hPa/3hr, jet offset {offset} km). Cease ascent."
        )
    elif summit_window_status == "marginal_caution_window":
        route_advisory = (
            f"CAUTION ADVISORY for {sector.title} ({sector.elevation_m}m): Marginal window. "
            f"Summit wind {summit_wind_mph} mph (wind chill {wind_chill_f}°F) and {trend_disp}. "
            f"Jet offset {offset} km; maintain strict turnaround times."
        )
    else:
        route_advisory = (
            f"FAVORABLE ADVISORY for {sector.title} ({sector.elevation_m}m): Summit window open. "
            f"Wind {summit_wind_mph} mph, chill {wind_chill_f}°F, {trend_disp} (drop {drop:.1f} hPa/3hr). "
            f"Proceed following alpine timelines."
        )

    return MountainWeatherResponse(
        sector_id=sector.sector_id,
        sector_title=sector.title,
        elevation_m=sector.elevation_m,
        summit_wind_mph=summit_wind_mph,
        wind_chill_f=wind_chill_f,
        barometric_trend=barometric_trend,
        summit_window_status=summit_window_status,
        route_advisory=route_advisory,
    )


def detect_mountain_weather_intent(message: str) -> Optional[MountainWeatherIntent]:
    q_lower = message.lower()
    if any(k in q_lower for k in [
        "track order", "order #", "order status", "return label", "refund",
        "rental", "store hours", "parking pass", "shuttle", "membership",
    ]):
        return None

    weather_keywords = [
        "mountain weather routing", "jet stream forecast", "jet stream",
        "500mb", "500 mb", "500hpa", "500 hpa",
        "300mb", "300 mb", "300hpa", "300 hpa",
        "600mb", "600 mb", "600hpa", "600 hpa",
        "700mb", "700 mb", "700hpa", "700 hpa",
        "geopotential height", "geopotential",
        "venturi wind multiplier", "venturi multiplier", "venturi wind",
        "venturi acceleration", "barometric drop storm", "barometric drop",
        "cyclogenesis", "storm alarm", "lee wave rotor", "lee-wave rotor",
        "lee wave", "rotor turbulence", "summit weather window",
        "summit window", "summit window advisory", "synoptic mountain forecast",
        "synoptic weather", "synoptic forecast", "synoptic level",
        "synoptic chart", "lenticular cloud cap", "lenticular cloud",
        "cap-shear", "polar jet stream", "subtropical jet stream",
        "supercooled rime icing", "rime icing", "banner cloud", "foehn wind",
        "genoa low", "mountain weather gear", "anemometer", "altimeter watch",
        "synoptic inreach",
    ]
    if not any(k in q_lower for k in weather_keywords):
        return None

    if any(k in q_lower for k in [
        "avalanche danger", "snowpack stability", "nwac", "slope eval",
        "companion rescue", "crevasse rescue", "glacier rope team", "prusik",
        "ice axe arrest", "camp muir", "temperature lapse rate", "30/30 rule",
        "lightning safety",
    ]):
        if not any(k in q_lower for k in [
            "500mb", "300mb", "venturi", "jet stream", "barometric drop",
            "lenticular", "rotor", "synoptic", "genoa", "geopotential",
        ]):
            return None

    synoptic_level = None
    if re.search(r"\b500\s*(?:mb|hpa)\b", q_lower):
        synoptic_level = "500mb"
    elif re.search(r"\b300\s*(?:mb|hpa)\b", q_lower):
        synoptic_level = "300mb"
    elif re.search(r"\b600\s*(?:mb|hpa)\b", q_lower):
        synoptic_level = "600mb"
    elif re.search(r"\b700\s*(?:mb|hpa)\b", q_lower):
        synoptic_level = "700mb"

    sector_id = None
    if "denali" in q_lower or "south buttress" in q_lower or "kahiltna" in q_lower:
        sector_id = "denali-south-buttress"
    elif "washington" in q_lower or "presidential range" in q_lower:
        sector_id = "mount-washington-ridge"
    elif "rainier" in q_lower or "columbia crest" in q_lower:
        sector_id = "rainier-columbia-crest"
    elif "everest" in q_lower or "south col" in q_lower or "geneva spur" in q_lower:
        sector_id = "everest-south-col"
    elif "matterhorn" in q_lower or "hornli" in q_lower or "solvay" in q_lower:
        sector_id = "matterhorn-hornli-ridge"

    is_gear = any(k in q_lower for k in [
        "gear", "checklist", "instruments", "anemometer", "altimeter watch", "synoptic chart",
    ])
    is_calc = any(k in q_lower for k in [
        "calculate", "multiplier calculation", "formula", "drop storm alarm", "baseline wind",
    ])

    if is_gear:
        action = "gear_checklist"
    elif is_calc:
        action = "calculate_weather"
    elif sector_id:
        action = "sector_detail"
    else:
        action = "sectors_list"

    return MountainWeatherIntent(
        action=action, sector_id=sector_id, synoptic_level=synoptic_level
    )


def format_mountain_weather_response(
    data: Any, query: str = "",
) -> FormattedMountainWeatherResponse:
    payload: dict[str, Any]
    if isinstance(data, MountainWeatherResponse):
        calc = data
        answer = (
            f"Mountain Weather Routing Analysis for {calc.sector_title} ({calc.elevation_m}m): "
            f"Summit Wind: {calc.summit_wind_mph} mph | Wind Chill: {calc.wind_chill_f}°F | "
            f"Barometric Trend: {calc.barometric_trend} | Summit Window: {calc.summit_window_status}. "
            f"Advisory: {calc.route_advisory}"
        )
        payload = {"action": "calculate_weather", "sector_id": calc.sector_id, "calculation": calc.model_dump()}
        return FormattedMountainWeatherResponse(answer, {"mountain_weather_info": payload, "answer": answer})

    if isinstance(data, dict):
        if "mountain_weather_info" in data and "answer" in data:
            return FormattedMountainWeatherResponse(data["answer"], data)
        if "action" in data and any(k in data for k in ("calculation", "sector", "sectors", "gear")):
            answer = data.get("answer", f"Mountain weather info retrieved for {data.get('action')}.")
            return FormattedMountainWeatherResponse(answer, {"mountain_weather_info": data, "answer": answer})
        intent = (
            MountainWeatherIntent(**data)
            if "action" in data
            else (detect_mountain_weather_intent(query or str(data)) or MountainWeatherIntent(action="sectors_list"))
        )
    elif isinstance(data, MountainWeatherIntent):
        intent = data
    else:
        intent = detect_mountain_weather_intent(str(data)) or MountainWeatherIntent(action="sectors_list")

    if intent.action in ("calculate_weather", "calculate"):
        req = MountainWeatherRequest(sector_id=intent.sector_id or "denali-south-buttress")
        calc = calculate_mountain_weather(req)
        answer = (
            f"Mountain Weather Routing Analysis for {calc.sector_title} ({calc.elevation_m}m): "
            f"Summit Wind: {calc.summit_wind_mph} mph | Wind Chill: {calc.wind_chill_f}°F | "
            f"Barometric Trend: {calc.barometric_trend} | Summit Window: {calc.summit_window_status}. "
            f"Advisory: {calc.route_advisory}"
        )
        payload = {"action": "calculate_weather", "sector_id": calc.sector_id, "calculation": calc.model_dump()}
        return FormattedMountainWeatherResponse(answer, {"mountain_weather_info": payload, "answer": answer})

    if intent.action in ("gear_checklist", "gear"):
        gear = get_weather_gear()
        gear_str = "; ".join(f"{g.name} ({g.purpose})" for g in gear)
        answer = (
            f"Mandatory High-Altitude Mountain Weather & Synoptic Forecasting Gear ({len(gear)} items): {gear_str}. "
            f"Calibrate altimeter watch storm alarms before exposed ridge departures."
        )
        payload = {"action": "gear_checklist", "gear": [g.model_dump() for g in gear], "mandatory_count": len(gear)}
        return FormattedMountainWeatherResponse(answer, {"mountain_weather_info": payload, "answer": answer})

    if intent.action == "sector_detail" and intent.sector_id:
        sector = get_weather_sector(intent.sector_id)
        if sector:
            highlights_str = ", ".join(sector.highlights)
            answer = (
                f"Mountain Weather Sector: {sector.title} ({sector.mountain_range}, {sector.region} - {sector.elevation_m}m). "
                f"Synoptic Level: {sector.synoptic_level} | Venturi Multiplier: {sector.venturi_multiplier:.1f}x | "
                f"Jet Stream Offset: {sector.default_jet_stream_offset_km} km. {sector.description} "
                f"Key hazards: {highlights_str}."
            )
            payload = {"action": "sector_detail", "sector_id": sector.sector_id, "sector": sector.model_dump()}
            return FormattedMountainWeatherResponse(answer, {"mountain_weather_info": payload, "answer": answer})

    sectors = get_weather_sectors(synoptic_level=intent.synoptic_level)
    filter_note = f" (synoptic level: {intent.synoptic_level})" if intent.synoptic_level else ""
    summary_str = "; ".join(
        f"{s.title} ({s.synoptic_level}, {s.elevation_m}m, {s.venturi_multiplier}x venturi)" for s in sectors
    )
    answer = (
        f"Contoso High-Altitude Mountain Weather Routing Sectors{filter_note} ({len(sectors)} sectors): {summary_str}. "
        f"Consult 500mb/300mb jet stream positions and venturi multipliers before departures."
    )
    payload = {"action": "sectors_list", "synoptic_level": intent.synoptic_level, "sectors": [s.model_dump() for s in sectors]}
    return FormattedMountainWeatherResponse(answer, {"mountain_weather_info": payload, "answer": answer})


def build_mountain_weather_prompt(intent: Optional[MountainWeatherIntent] = None) -> str:
    lines = [
        "High-Altitude Mountain Weather Routing & Synoptic Jet Stream Guidance:",
        "- 500mb / 300mb Synoptic Level Interpretation: Upper-air geopotential height contours and vorticity maximums govern severe alpine cyclogenesis.",
        "- Venturi Ridge Multipliers: Constricted cols, ridges, and saddles compress airflow, multiplying wind speeds by 1.8x to 2.6x.",
        "- Jet Stream Core Interaction: Proximity (< 100 km) imparts severe downward momentum transfer and lee-wave rotor turbulence.",
        "- Rapid Barometric Drop Storm Alarms: Drops >= 1.0 hPa/3hr signal fronts; >= 2.5 hPa/3hr require abort; >= 4.0 hPa/3hr indicate explosive cyclogenesis.",
        "- Wind Chill Safety: Sub-freezing temperatures with hurricane gusts produce immediate frostbite; wind-rime goggles and face masks are mandatory.",
    ]
    if intent and intent.sector_id:
        sector = get_weather_sector(intent.sector_id)
        if sector:
            lines.extend([
                f"Selected Mountain Weather Sector: {sector.title} ({sector.mountain_range})",
                f"- Elevation: {sector.elevation_m}m, Synoptic Level: {sector.synoptic_level}",
                f"- Venturi Multiplier: {sector.venturi_multiplier}x, Jet Offset: {sector.default_jet_stream_offset_km} km",
                f"- Characteristics: {sector.description}",
                f"- Key Hazards: {', '.join(sector.highlights)}",
            ])
    else:
        lvl = intent.synoptic_level if intent else None
        sectors = get_weather_sectors(synoptic_level=lvl)
        lines.append(f"Available Mountain Weather Sectors ({len(sectors)} active):")
        for s in sectors:
            lines.append(f"- {s.title} ({s.sector_id}): {s.elevation_m}m, {s.synoptic_level}, Venturi: {s.venturi_multiplier}x")

    lines.extend([
        "",
        "Instructions for Assistant:",
        "- Provide quantitative summit wind and wind chill estimates using venturi multiplier and jet stream proximity formulas.",
        "- Emphasize barometric trend thresholds and summit window advisories.",
        "- Recommend mandatory high-altitude weather monitoring gear.",
    ])
    return "\n".join(lines)
