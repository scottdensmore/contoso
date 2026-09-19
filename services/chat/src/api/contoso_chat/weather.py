import re
from datetime import datetime, timezone
from typing import Any, Optional

from pydantic import BaseModel


class MountainZoneModel(BaseModel):
    zone_id: str
    name: str
    mountain_range: str
    base_elevation_ft: int
    summit_elevation_ft: int
    base_temp_f: float
    summit_temp_f: float
    freezing_level_ft: int
    wind_speed_mph: float
    wind_gust_mph: float
    wind_direction: str
    condition: str
    pressure_trend: str
    lightning_risk: str
    storm_warning: bool
    synopsis: str
    last_updated: str


class MicroclimateRequest(BaseModel):
    zone_id: str
    target_elevation_ft: float
    exposure_level: str = "open_slope"


class MicroclimateResponse(BaseModel):
    zone_id: str
    target_elevation_ft: float
    estimated_temp_f: float
    wind_chill_f: float
    is_below_freezing: bool
    estimated_wind_speed_mph: float
    hypothermia_risk: str
    layering_advice: list[str]
    weather_advisory: str


class WeatherIntent(BaseModel):
    action: str  # "zones", "zone_detail", "microclimate", "lightning_protocol"
    zone_id: Optional[str] = None
    target_elevation_ft: Optional[float] = None
    exposure_level: Optional[str] = None


DEFAULT_MOUNTAIN_ZONES: dict[str, MountainZoneModel] = {
    "mount-rainier": MountainZoneModel(
        zone_id="mount-rainier",
        name="Mount Rainier / Paradise & Camp Muir",
        mountain_range="South Cascades",
        base_elevation_ft=5400,
        summit_elevation_ft=14411,
        base_temp_f=44.0,
        summit_temp_f=12.0,
        freezing_level_ft=7500,
        wind_speed_mph=25.0,
        wind_gust_mph=45.0,
        wind_direction="WSW",
        condition="snow_flurries",
        pressure_trend="rapidly_falling",
        lightning_risk="moderate",
        storm_warning=True,
        synopsis="Active Pacific front with heavy snowfall at upper elevations, deteriorating visibility, and gale gusts.",
        last_updated=datetime.now(timezone.utc).isoformat(),
    ),
    "mount-baker": MountainZoneModel(
        zone_id="mount-baker",
        name="Mount Baker / Heather Meadows",
        mountain_range="North Cascades",
        base_elevation_ft=4300,
        summit_elevation_ft=10781,
        base_temp_f=40.0,
        summit_temp_f=18.0,
        freezing_level_ft=6200,
        wind_speed_mph=20.0,
        wind_gust_mph=35.0,
        wind_direction="W",
        condition="heavy_snow",
        pressure_trend="falling",
        lightning_risk="low",
        storm_warning=False,
        synopsis="Heavy orographic snowfall with sustained westerly winds and building snowpack.",
        last_updated=datetime.now(timezone.utc).isoformat(),
    ),
    "snoqualmie-alpental": MountainZoneModel(
        zone_id="snoqualmie-alpental",
        name="Snoqualmie Pass / Alpental",
        mountain_range="Central Cascades",
        base_elevation_ft=3000,
        summit_elevation_ft=5400,
        base_temp_f=48.0,
        summit_temp_f=39.0,
        freezing_level_ft=5800,
        wind_speed_mph=10.0,
        wind_gust_mph=20.0,
        wind_direction="NW",
        condition="rain",
        pressure_trend="steady",
        lightning_risk="none",
        storm_warning=False,
        synopsis="Maritime airflow bringing steady light to moderate rain at pass level with snow restricted to highest ridges.",
        last_updated=datetime.now(timezone.utc).isoformat(),
    ),
    "stevens-crest": MountainZoneModel(
        zone_id="stevens-crest",
        name="Stevens Pass / Cascade Crest",
        mountain_range="Central Cascades",
        base_elevation_ft=4000,
        summit_elevation_ft=5800,
        base_temp_f=42.0,
        summit_temp_f=35.0,
        freezing_level_ft=5200,
        wind_speed_mph=15.0,
        wind_gust_mph=28.0,
        wind_direction="WNW",
        condition="partly_cloudy",
        pressure_trend="rising",
        lightning_risk="none",
        storm_warning=False,
        synopsis="Transitional ridge bringing breaks in cloud cover, rising barometric pressure, and moderate crest winds.",
        last_updated=datetime.now(timezone.utc).isoformat(),
    ),
    "olympic-hurricane": MountainZoneModel(
        zone_id="olympic-hurricane",
        name="Olympic Mountains / Hurricane Ridge",
        mountain_range="Olympic Mountains",
        base_elevation_ft=5200,
        summit_elevation_ft=7980,
        base_temp_f=46.0,
        summit_temp_f=36.0,
        freezing_level_ft=6800,
        wind_speed_mph=18.0,
        wind_gust_mph=32.0,
        wind_direction="SW",
        condition="overcast",
        pressure_trend="falling",
        lightning_risk="none",
        storm_warning=False,
        synopsis="Overcast skies with incoming moist southwesterly flow and gusty winds along high ridges.",
        last_updated=datetime.now(timezone.utc).isoformat(),
    ),
}

MOUNTAIN_ZONES_STORE: dict[str, MountainZoneModel] = {
    k: v.model_copy(deep=True) for k, v in DEFAULT_MOUNTAIN_ZONES.items()
}


def reset_mountain_zones_store() -> None:
    """Resets mountain zones store to default initial state."""
    global MOUNTAIN_ZONES_STORE
    MOUNTAIN_ZONES_STORE = {
        k: v.model_copy(deep=True) for k, v in DEFAULT_MOUNTAIN_ZONES.items()
    }


def get_mountain_zones(zone_id: Optional[str] = None) -> list[MountainZoneModel]:
    """Lists mountain forecast zones, optionally filtered by zone ID."""
    if zone_id:
        zone = get_mountain_zone_by_id(zone_id)
        return [zone] if zone else []
    return list(MOUNTAIN_ZONES_STORE.values())


def get_mountain_zone_by_id(zone_id: str) -> Optional[MountainZoneModel]:
    """Finds a mountain forecast zone by exact or normalized ID."""
    normalized = zone_id.strip().lower()
    for k, v in MOUNTAIN_ZONES_STORE.items():
        if k.lower() == normalized or v.zone_id.lower() == normalized:
            return v
    return None


def calculate_microclimate(req: MicroclimateRequest) -> MicroclimateResponse:
    """Calculates elevation temperature lapse rates, wind chill indexes, and hypothermia risk levels."""
    zone = get_mountain_zone_by_id(req.zone_id)
    if not zone:
        raise ValueError(f"Mountain zone '{req.zone_id}' not found")

    # Lapse rate: 3.5°F drop per 1,000 ft from base elevation
    elevation_diff = req.target_elevation_ft - zone.base_elevation_ft
    temp_drop = (elevation_diff / 1000.0) * 3.5
    estimated_temp_f = round(zone.base_temp_f - temp_drop, 1)

    # Exposure multiplier: valley 0.7, open_slope 1.1, exposed_ridge 1.6, summit 2.0
    exposure_multipliers = {
        "valley": 0.7,
        "open_slope": 1.1,
        "exposed_ridge": 1.6,
        "summit": 2.0,
    }
    multiplier = exposure_multipliers.get(req.exposure_level.lower(), 1.1)
    estimated_wind_speed_mph = round(zone.wind_speed_mph * multiplier, 1)

    # NWS wind chill formula when temp <= 50 and wind >= 3
    # Wind Chill = 35.74 + 0.6215*T - 35.75*(V^0.16) + 0.4275*T*(V^0.16)
    if estimated_temp_f <= 50.0 and estimated_wind_speed_mph >= 3.0:
        wind_exp = estimated_wind_speed_mph ** 0.16
        wind_chill_f = round(
            35.74 + (0.6215 * estimated_temp_f) - (35.75 * wind_exp) + (0.4275 * estimated_temp_f * wind_exp),
            1,
        )
    else:
        wind_chill_f = estimated_temp_f

    is_below_freezing = estimated_temp_f <= 32.0

    # Hypothermia risk: <= 15 critical, <= 32 high, <= 45 moderate, else low
    effective_temp = wind_chill_f
    if effective_temp <= 15.0:
        hypothermia_risk = "critical"
    elif effective_temp <= 32.0:
        hypothermia_risk = "high"
    elif effective_temp <= 45.0:
        hypothermia_risk = "moderate"
    else:
        hypothermia_risk = "low"

    # Layering advice: 3-layer system recommendations
    layering_advice = [
        "Base layer: Moisture-wicking synthetic or merino wool next to skin to manage sweat (avoid cotton).",
        "Mid layer: Insulating high-loft fleece or lightweight packable down/synthetic jacket to trap core heat.",
        "Outer shell: Waterproof, windproof, breathable hardshell (e.g., Gore-Tex) with storm hood and pit zips.",
    ]
    if is_below_freezing or hypothermia_risk in ("high", "critical"):
        layering_advice.extend([
            "Extremity insulation: Windproof insulated mittens/gloves, thermal balaclava or beanie, and neck gaiter.",
            "Emergency gear: Pack an emergency bivy sack or space blanket, thermos of hot liquids, and chemical hand warmers.",
        ])

    weather_advisory = (
        f"{zone.name} at {int(req.target_elevation_ft)} ft ({req.exposure_level.replace('_', ' ')}): "
        f"Estimated temperature is {estimated_temp_f:.1f}°F with wind chill of {wind_chill_f:.1f}°F "
        f"(wind {estimated_wind_speed_mph:.1f} mph). Hypothermia risk is {hypothermia_risk.upper()}."
    )
    if zone.storm_warning:
        weather_advisory += " ACTIVE STORM WARNING: Deteriorating weather and severe alpine conditions expected."

    return MicroclimateResponse(
        zone_id=zone.zone_id,
        target_elevation_ft=req.target_elevation_ft,
        estimated_temp_f=estimated_temp_f,
        wind_chill_f=wind_chill_f,
        is_below_freezing=is_below_freezing,
        estimated_wind_speed_mph=estimated_wind_speed_mph,
        hypothermia_risk=hypothermia_risk,
        layering_advice=layering_advice,
        weather_advisory=weather_advisory,
    )


def get_lightning_safety_protocol() -> dict[str, Any]:
    """Returns wilderness severe weather and alpine safety protocols."""
    return {
        "title": "Wilderness Severe Weather & Alpine Safety Protocols",
        "lightning_safety": {
            "rule_30_30": "Lightning 30/30 Rule: If time between lightning flash and thunder is under 30 seconds (6 miles away), seek immediate shelter. Wait at least 30 minutes after the last thunderclap before resuming travel.",
            "flash_to_bang_calc": "Sound travels approximately 1 mile every 5 seconds. Divide flash-to-bang seconds by 5 to find distance in miles.",
            "lightning_crouch": "Adopt the lightning crouch: squat low with feet together, hands over ears, sitting on an insulated foam pad or backpack to minimize ground contact.",
            "hazardous_locations": "Immediately evacuate summits, exposed ridgelines, lone trees, tall rock spires, shallow caves, water bodies, and metal gear.",
        },
        "whiteout_navigation": {
            "protocol": "Whiteout Navigation Protocol: Rely strictly on calibrated magnetic compass bearings, altimeter tracking, and GPS breadcrumb routes rather than visual cues.",
            "wanding": "Deploy high-visibility bamboo wands every 50 to 100 feet along descent corridors and glaciated terrain.",
            "roped_travel": "Rope up in standard alpine team spacing on glaciers and corniced ridges to prevent crevasse or dropoff accidents.",
            "emergency_shelter": "If disoriented in severe whiteout, halt immediately and dig an emergency snow cave or bivy trench on a safe lee slope out of avalanche paths.",
        },
        "hypothermia_management": {
            "symptoms": "Shivering, slurred speech, stumbling, apathy, and poor decision-making ('the umbles').",
            "treatment": "Hypothermia wrap (burrito): replace wet clothing, wrap in sleeping bags and vapor barrier, insulate from ground, supply warm sweet liquids, and activate satellite SOS.",
        },
    }


def detect_weather_intent(query: str) -> Optional[WeatherIntent]:
    """Detects customer inquiries regarding mountain weather, freezing levels, wind chills at elevation, storm warnings, lightning safety, and mountain layering systems."""
    q_lower = query.lower()

    # Exclusions: Other functional domains
    if any(k in q_lower for k in ["shuttle", "carpool", "transit", "bus"]):
        return None
    if any(k in q_lower for k in ["permit", "passes", "park pass", "recreation.gov", "lottery", "enchantment permit", "nw forest pass", "america the beautiful"]):
        return None
    if any(k in q_lower for k in ["clinic", "tour", "guided", "amga", "experience for glacier", "booking"]):
        return None
    if any(k in q_lower for k in ["rattlesnake", "multnomah", "bear peak", "hiking trails and their conditions", "popular hiking trails", "outfitting"]):
        return None
    if any(k in q_lower for k in ["satellite beacon", "beacon check-in", "beacon checkin", "register beacon", "beacon registration", "garmin inreach", "zoleo", "emergency protocol for", "sar signaling"]):
        return None
    if any(k in q_lower for k in ["avalanche", "snowpack", "nwac", "slope angle", "slope eval", "companion rescue"]):
        return None
    if any(k in q_lower for k in ["return policy", "order status", "track order", "rental", "shoe size", "tent size", "store hours"]):
        return None

    # Positive detection categories
    is_lightning = any(k in q_lower for k in ["lightning", "thunder", "30/30", "30-30", "whiteout"])
    is_microclimate = any(k in q_lower for k in ["microclimate", "lapse rate", "wind chill", "windchill", "hypothermia risk", "mountain layering", "layering advice", "3-layer"])
    
    # Check target elevation
    target_elevation_ft = None
    k_match = re.search(r"\b(\d+)\s*k\s*(?:ft|feet)?\b", q_lower)
    if k_match:
        try:
            target_elevation_ft = float(k_match.group(1)) * 1000.0
        except ValueError:
            pass
    if target_elevation_ft is None:
        elev_match = re.search(r"(\d{1,2}(?:,\d{3})|\d{4,5})\s*(?:ft|feet|foot|'|meters?)\b", q_lower)
        if elev_match:
            try:
                target_elevation_ft = float(elev_match.group(1).replace(",", ""))
            except ValueError:
                pass
    if target_elevation_ft is None:
        num_at_elev = re.search(r"(?:at|elevation|elev)\s*(\d{1,2}(?:,\d{3})|\d{4,5})\b", q_lower)
        if num_at_elev:
            try:
                target_elevation_ft = float(num_at_elev.group(1).replace(",", ""))
            except ValueError:
                pass

    # Extract exposure level
    exposure_level = None
    if "ridge" in q_lower or "exposed ridge" in q_lower:
        exposure_level = "exposed_ridge"
    elif "summit" in q_lower or "peak" in q_lower:
        exposure_level = "summit"
    elif "valley" in q_lower or "basin" in q_lower:
        exposure_level = "valley"
    elif "slope" in q_lower or "open slope" in q_lower:
        exposure_level = "open_slope"

    # Zone extraction
    zone_id = None
    if "rainier" in q_lower or "paradise" in q_lower or "camp muir" in q_lower:
        zone_id = "mount-rainier"
    elif "baker" in q_lower or "heather meadows" in q_lower:
        zone_id = "mount-baker"
    elif "alpental" in q_lower or "snoqualmie" in q_lower:
        zone_id = "snoqualmie-alpental"
    elif "stevens" in q_lower:
        zone_id = "stevens-crest"
    elif "hurricane ridge" in q_lower or "olympic" in q_lower:
        zone_id = "olympic-hurricane"

    has_weather_word = bool(
        re.search(r"\b(weather|forecast|freezing|temp|temperature|winds?|wind chill|windchill|chill|lapse|snow|storm|storm warning|conditions|flurries|gusts?|barometric)\b", q_lower)
    )

    is_general_weather = any(k in q_lower for k in [
        "mountain weather", "alpine weather", "mountain forecast", "mountain forecast zones",
        "mountain zones", "forecast zones", "summit weather", "weather across the cascades",
        "mountain weather forecasts", "weather zones",
    ])

    if not is_lightning and not is_microclimate and not is_general_weather:
        if not (zone_id and has_weather_word):
            return None

    # Determine action
    if is_lightning:
        action = "lightning_protocol"
    elif is_microclimate or (target_elevation_ft is not None and (has_weather_word or zone_id)):
        action = "microclimate"
    elif zone_id:
        action = "zone_detail"
    else:
        action = "zones"

    return WeatherIntent(
        action=action,
        zone_id=zone_id,
        target_elevation_ft=target_elevation_ft,
        exposure_level=exposure_level,
    )


def build_weather_prompt(intent: WeatherIntent) -> str:
    """Formats system prompt grounding lines for mountain weather forecasts and alpine microclimate calculations."""
    lines = [
        "Contoso Outdoors Wilderness Weather & Alpine Microclimate Grounding:",
        "- Mountain weather changes rapidly with elevation; alpine recreationists must plan for lapse rate temperature drops, wind chill, freezing levels, and storm fronts.",
        "- Standard environmental lapse rate: ~3.5°F drop per 1,000 feet of elevation gain above base level.",
        "- Exposure multipliers increase wind speed and wind chill severity on open slopes (1.1x), exposed ridges (1.6x), and summits (2.0x).",
        "- Lightning 30/30 Rule: If flash to thunder is under 30 seconds (6 miles away), seek immediate shelter. Wait 30 minutes after last thunder before moving.",
        "- Freezing Level: The altitude where air temperature reaches 32°F; liquid precipitation transitions to freezing rain or snow.",
        "- Three-layer system: Moisture-wicking base layer (merino/synthetic), insulating mid layer (fleece/down), and waterproof/windproof outer shell.",
    ]

    if intent.zone_id:
        zone = get_mountain_zone_by_id(intent.zone_id)
        if zone:
            lines.extend([
                f"Target Mountain Zone: {zone.name} ({zone.zone_id}) - Range: {zone.mountain_range}",
                f"- Base Elevation: {zone.base_elevation_ft} ft ({zone.base_temp_f}°F), Summit Elevation: {zone.summit_elevation_ft} ft ({zone.summit_temp_f}°F)",
                f"- Freezing Level: {zone.freezing_level_ft} ft, Conditions: {zone.condition}",
                f"- Winds: {zone.wind_speed_mph} mph (Gusts {zone.wind_gust_mph} mph) from {zone.wind_direction}",
                f"- Barometric Trend: {zone.pressure_trend}, Lightning Risk: {zone.lightning_risk.upper()}",
                f"- Storm Warning: {'YES - ACTIVE WARNING' if zone.storm_warning else 'None'}",
                f"- Synopsis: {zone.synopsis}",
            ])
    else:
        zones = get_mountain_zones()
        lines.append("Pacific Northwest Mountain Forecast Zones Overview:")
        for z in zones:
            warning_tag = " [ACTIVE STORM WARNING]" if z.storm_warning else ""
            lines.append(
                f"- {z.name} ({z.zone_id}): Freezing Level {z.freezing_level_ft} ft, Base {z.base_temp_f}°F, Summit {z.summit_temp_f}°F, Wind {z.wind_speed_mph} mph. Synopsis: {z.synopsis}{warning_tag}"
            )

    if intent.action == "microclimate" and intent.zone_id and intent.target_elevation_ft is not None:
        try:
            req = MicroclimateRequest(
                zone_id=intent.zone_id,
                target_elevation_ft=intent.target_elevation_ft,
                exposure_level=intent.exposure_level or "open_slope",
            )
            res = calculate_microclimate(req)
            lines.extend([
                f"Microclimate Calculation ({int(intent.target_elevation_ft)} ft in {intent.zone_id}):",
                f"- Estimated Temp: {res.estimated_temp_f}°F, Wind Chill: {res.wind_chill_f}°F, Wind: {res.estimated_wind_speed_mph} mph",
                f"- Below Freezing: {'YES' if res.is_below_freezing else 'NO'}, Hypothermia Risk: {res.hypothermia_risk.upper()}",
                f"- Advisory: {res.weather_advisory}",
            ])
        except ValueError:
            pass

    if intent.action == "lightning_protocol":
        proto = get_lightning_safety_protocol()
        lines.extend([
            f"{proto['title']}:",
            f"- Lightning Safety: {proto['lightning_safety']['rule_30_30']} {proto['lightning_safety']['lightning_crouch']}",
            f"- Whiteout Navigation: {proto['whiteout_navigation']['protocol']} {proto['whiteout_navigation']['wanding']}",
            f"- Hypothermia Response: {proto['hypothermia_management']['treatment']}",
        ])

    lines.extend([
        "",
        "Instructions for Assistant:",
        "- Prioritize traveler alpine safety, accurate temperature lapse rates, and wind chill warnings.",
        "- Clearly explain the 3-layer system and specific hypothermia risks at alpine elevations.",
        "- Highlight any active storm warnings or high lightning risks.",
    ])

    return "\n".join(lines)


def format_weather_response(intent: WeatherIntent) -> dict[str, Any]:
    """Formats assistant answer and structured weather_info metadata."""
    if intent.action == "microclimate":
        target_zone_id = intent.zone_id or "mount-rainier"
        target_elev = intent.target_elevation_ft if intent.target_elevation_ft is not None else 10000.0
        exposure = intent.exposure_level or "open_slope"

        try:
            req = MicroclimateRequest(
                zone_id=target_zone_id,
                target_elevation_ft=target_elev,
                exposure_level=exposure,
            )
            res = calculate_microclimate(req)
            zone = get_mountain_zone_by_id(target_zone_id)
            zone_name = zone.name if zone else target_zone_id

            answer = (
                f"Alpine Microclimate Forecast for {zone_name} at {int(target_elev)} ft ({exposure.replace('_', ' ')}): "
                f"Estimated temperature is {res.estimated_temp_f:.1f}°F with an effective wind chill of {res.wind_chill_f:.1f}°F "
                f"under {res.estimated_wind_speed_mph:.1f} mph winds. "
                f"Hypothermia risk is {res.hypothermia_risk.upper()} (freezing conditions: {'YES' if res.is_below_freezing else 'NO'}). "
                f"{res.weather_advisory} Layering: {res.layering_advice[0]} {res.layering_advice[1]} {res.layering_advice[2]}"
            )

            return {
                "answer": answer,
                "weather_info": {
                    "action": "microclimate",
                    "zone_id": res.zone_id,
                    "target_elevation_ft": res.target_elevation_ft,
                    "estimated_temp_f": res.estimated_temp_f,
                    "wind_chill_f": res.wind_chill_f,
                    "is_below_freezing": res.is_below_freezing,
                    "estimated_wind_speed_mph": res.estimated_wind_speed_mph,
                    "hypothermia_risk": res.hypothermia_risk,
                    "layering_advice": res.layering_advice,
                    "weather_advisory": res.weather_advisory,
                },
            }
        except ValueError:
            pass

    if intent.action in ("zone_detail", "zones") and intent.zone_id:
        zone = get_mountain_zone_by_id(intent.zone_id)
        if zone:
            warning_str = " ACTIVE STORM WARNING in effect!" if zone.storm_warning else ""
            answer = (
                f"Mountain Weather Forecast for {zone.name} ({zone.mountain_range}):{warning_str} "
                f"Conditions: {zone.condition.replace('_', ' ')}. Base ({zone.base_elevation_ft} ft): {zone.base_temp_f}°F, "
                f"Summit ({zone.summit_elevation_ft} ft): {zone.summit_temp_f}°F. Freezing level is at {zone.freezing_level_ft} ft. "
                f"Winds: {zone.wind_speed_mph} mph ({zone.wind_direction}) with gusts to {zone.wind_gust_mph} mph. "
                f"Barometric pressure is {zone.pressure_trend.replace('_', ' ')}. Lightning risk: {zone.lightning_risk.upper()}. "
                f"Synopsis: {zone.synopsis}"
            )
            return {
                "answer": answer,
                "weather_info": {
                    "action": "zone_detail",
                    "zone": zone.model_dump(),
                },
            }

    if intent.action == "lightning_protocol":
        proto = get_lightning_safety_protocol()
        ls = proto["lightning_safety"]
        wn = proto["whiteout_navigation"]
        answer = (
            f"Wilderness Severe Weather & Alpine Safety Protocols: "
            f"1. Lightning 30/30 Rule: {ls['rule_30_30']} {ls['lightning_crouch']} "
            f"2. Whiteout Navigation: {wn['protocol']} {wn['wanding']} "
            f"3. Emergency Protocol: Never remain on exposed summits or ridgelines during electrical storms."
        )
        return {
            "answer": answer,
            "weather_info": {
                "action": "lightning_protocol",
                "protocol": proto,
            },
        }

    # Default "zones"
    zones = get_mountain_zones()
    zone_summaries = "; ".join(
        f"{z.name}: Base {z.base_temp_f}°F / Summit {z.summit_temp_f}°F, Freezing Level {z.freezing_level_ft} ft, {z.condition.replace('_', ' ')}"
        for z in zones
    )
    answer = (
        f"Pacific Northwest Mountain Weather Zones: {zone_summaries}. "
        "Always calculate elevation lapse rates and pack proper 3-layer alpine clothing before heading into the backcountry."
    )
    return {
        "answer": answer,
        "weather_info": {
            "action": "zones",
            "zones": [z.model_dump() for z in zones],
        },
    }
