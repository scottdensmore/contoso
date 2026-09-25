import pytest
from contoso_chat.mountain_weather import (
    FormattedMountainWeatherResponse,
    MountainWeatherIntent,
    MountainWeatherRequest,
    MountainWeatherResponse,
    WeatherGearItemModel,
    WeatherSectorModel,
    calculate_mountain_weather,
    detect_mountain_weather_intent,
    format_mountain_weather_response,
    get_weather_gear,
    get_weather_sector,
    get_weather_sectors,
)

# =============================================================================
# 1. Catalog & Synoptic Level Filtering Tests
# =============================================================================


def test_get_weather_sectors_all():
    sectors = get_weather_sectors()
    assert len(sectors) == 5
    sector_ids = [s.sector_id for s in sectors]
    assert "denali-south-buttress" in sector_ids
    assert "mount-washington-ridge" in sector_ids
    assert "rainier-columbia-crest" in sector_ids
    assert "everest-south-col" in sector_ids
    assert "matterhorn-hornli-ridge" in sector_ids

    for sector in sectors:
        assert isinstance(sector, WeatherSectorModel)
        assert sector.elevation_m > 0
        assert sector.venturi_multiplier > 1.0
        assert sector.default_jet_stream_offset_km > 0
        assert len(sector.highlights) == 3
        assert sector.description


def test_get_weather_sectors_filtered():
    s_500 = get_weather_sectors(synoptic_level="500mb")
    assert len(s_500) == 1
    assert s_500[0].sector_id == "denali-south-buttress"

    s_600 = get_weather_sectors(synoptic_level="600mb")
    assert len(s_600) == 2
    s_600_ids = [s.sector_id for s in s_600]
    assert "rainier-columbia-crest" in s_600_ids
    assert "matterhorn-hornli-ridge" in s_600_ids

    s_700 = get_weather_sectors(synoptic_level="700mb")
    assert len(s_700) == 1
    assert s_700[0].sector_id == "mount-washington-ridge"

    s_300 = get_weather_sectors(synoptic_level="300mb")
    assert len(s_300) == 1
    assert s_300[0].sector_id == "everest-south-col"

    s_unknown = get_weather_sectors(synoptic_level="200mb")
    assert len(s_unknown) == 0


def test_get_weather_sector_by_id():
    denali = get_weather_sector("denali-south-buttress")
    assert denali is not None
    assert denali.title == "Denali Upper Kahiltna & South Buttress"
    assert denali.mountain_range == "Alaska Range"
    assert denali.region == "AK, USA"
    assert denali.elevation_m == 6190
    assert denali.synoptic_level == "500mb"
    assert denali.venturi_multiplier == 2.2
    assert denali.default_jet_stream_offset_km == 80

    # Normalized / case-insensitive
    wash = get_weather_sector("  MOUNT-WASHINGTON-RIDGE  ")
    assert wash is not None
    assert wash.elevation_m == 1917
    assert wash.venturi_multiplier == 2.6

    # Non-existent
    assert get_weather_sector("k2-abruzzi-spur") is None


# =============================================================================
# 2. Calculation Math Tests
# =============================================================================

def test_calculate_mountain_weather_defaults():
    req = MountainWeatherRequest()
    assert req.sector_id == "denali-south-buttress"
    assert req.baseline_wind_mph == 20.0
    assert req.barometric_drop_hpa == 1.2
    assert req.jet_stream_offset_km == 150
    assert req.air_temp_f == 10.0

    res = calculate_mountain_weather(req)
    assert isinstance(res, MountainWeatherResponse)
    assert res.sector_id == "denali-south-buttress"
    assert res.sector_title == "Denali Upper Kahiltna & South Buttress"
    assert res.elevation_m == 6190
    # summit_wind_mph = round(20.0 * 2.2 + 0) = 44
    assert res.summit_wind_mph == 44
    # wind_chill_f: T=10, V=44 -> -16
    assert res.wind_chill_f == -16
    # barometric_trend: 1.2 is < 2.5 and >= 1.0 -> approaching_front
    assert res.barometric_trend == "approaching_front"
    # summit_window_status: summit_wind 44 >= 30 -> marginal_caution_window
    assert res.summit_window_status == "marginal_caution_window"
    assert "Denali" in res.route_advisory


def test_calculate_mountain_weather_jet_stream_boost():
    # Jet stream offset < 100km adds ((100 - offset) * 0.25)
    req = MountainWeatherRequest(
        sector_id="denali-south-buttress",
        baseline_wind_mph=20.0,
        jet_stream_offset_km=80,  # bonus = 20 * 0.25 = 5.0
        air_temp_f=10.0,
        barometric_drop_hpa=0.5,
    )
    res = calculate_mountain_weather(req)
    # round(20 * 2.2 + 5.0) = round(44.0 + 5.0) = 49
    assert res.summit_wind_mph == 49


def test_calculate_mountain_weather_wind_chill():
    # Temp > 50 or wind <= 3: no wind chill calculation, round(air_temp_f)
    req_warm = MountainWeatherRequest(
        sector_id="rainier-columbia-crest",
        baseline_wind_mph=1.0,
        jet_stream_offset_km=150,
        air_temp_f=55.0,
        barometric_drop_hpa=0.5,
    )
    res_warm = calculate_mountain_weather(req_warm)
    assert res_warm.wind_chill_f == 55

    # Extreme cold wind chill
    # Everest South Col: baseline 25mph, venturi 2.4, jet stream offset 20km
    # bonus = (100 - 20) * 0.25 = 20.0
    # summit_wind = round(25 * 2.4 + 20) = round(60 + 20) = 80 mph
    # air_temp_f = -20.0
    req_everest = MountainWeatherRequest(
        sector_id="everest-south-col",
        baseline_wind_mph=25.0,
        jet_stream_offset_km=20,
        air_temp_f=-20.0,
        barometric_drop_hpa=3.0,
    )
    res_everest = calculate_mountain_weather(req_everest)
    assert res_everest.summit_wind_mph == 80
    assert res_everest.wind_chill_f < -60


def test_calculate_mountain_weather_barometric_trends():
    sector = "matterhorn-hornli-ridge"
    # < 1.0 -> steady_fair
    r1 = calculate_mountain_weather(MountainWeatherRequest(sector_id=sector, barometric_drop_hpa=0.8))
    assert r1.barometric_trend == "steady_fair"

    # < 2.5 -> approaching_front
    r2 = calculate_mountain_weather(MountainWeatherRequest(sector_id=sector, barometric_drop_hpa=2.4))
    assert r2.barometric_trend == "approaching_front"

    # < 4.0 -> rapid_storm_warning
    r3 = calculate_mountain_weather(MountainWeatherRequest(sector_id=sector, barometric_drop_hpa=2.5))
    assert r3.barometric_trend == "rapid_storm_warning"

    r3b = calculate_mountain_weather(MountainWeatherRequest(sector_id=sector, barometric_drop_hpa=3.9))
    assert r3b.barometric_trend == "rapid_storm_warning"

    # >= 4.0 -> explosive_cyclogenesis_evacuation
    r4 = calculate_mountain_weather(MountainWeatherRequest(sector_id=sector, barometric_drop_hpa=4.0))
    assert r4.barometric_trend == "explosive_cyclogenesis_evacuation"


def test_calculate_mountain_weather_summit_window_statuses():
    sector = "denali-south-buttress"

    # go_summit_window: summit_wind <= 50 and not >= 30, baro_drop < 1.0, jet_stream_offset >= 100
    # baseline=10, venturi=2.2 -> summit_wind=22 (< 30)
    # jet_stream_offset=120 (>= 100)
    # barometric_drop=0.6 (< 1.0)
    res_go = calculate_mountain_weather(MountainWeatherRequest(
        sector_id=sector,
        baseline_wind_mph=10.0,
        jet_stream_offset_km=120,
        barometric_drop_hpa=0.6,
    ))
    assert res_go.summit_window_status == "go_summit_window"

    # marginal_caution_window:
    # case a: summit_wind >= 30 but <= 50
    res_marg_wind = calculate_mountain_weather(MountainWeatherRequest(
        sector_id=sector,
        baseline_wind_mph=15.0,  # 15 * 2.2 = 33 mph
        jet_stream_offset_km=120,
        barometric_drop_hpa=0.6,
    ))
    assert res_marg_wind.summit_window_status == "marginal_caution_window"

    # case b: barometric_drop >= 1.0 but < 2.5
    res_marg_baro = calculate_mountain_weather(MountainWeatherRequest(
        sector_id=sector,
        baseline_wind_mph=10.0,
        jet_stream_offset_km=120,
        barometric_drop_hpa=1.5,
    ))
    assert res_marg_baro.summit_window_status == "marginal_caution_window"

    # case c: jet_stream_offset < 100 but >= 40
    res_marg_jet = calculate_mountain_weather(MountainWeatherRequest(
        sector_id=sector,
        baseline_wind_mph=10.0,  # 10 * 2.2 + (100 - 80)*0.25 = 22 + 5 = 27 mph (< 30)
        jet_stream_offset_km=80,
        barometric_drop_hpa=0.6,
    ))
    assert res_marg_jet.summit_window_status == "marginal_caution_window"

    # abort_severe_winds_whiteout:
    # case a: summit_wind > 50
    res_abort_wind = calculate_mountain_weather(MountainWeatherRequest(
        sector_id=sector,
        baseline_wind_mph=30.0,  # 30 * 2.2 = 66 mph
        jet_stream_offset_km=120,
        barometric_drop_hpa=0.6,
    ))
    assert res_abort_wind.summit_window_status == "abort_severe_winds_whiteout"

    # case b: barometric_drop >= 2.5
    res_abort_baro = calculate_mountain_weather(MountainWeatherRequest(
        sector_id=sector,
        baseline_wind_mph=10.0,
        jet_stream_offset_km=120,
        barometric_drop_hpa=2.5,
    ))
    assert res_abort_baro.summit_window_status == "abort_severe_winds_whiteout"

    # case c: jet_stream_offset < 40
    res_abort_jet = calculate_mountain_weather(MountainWeatherRequest(
        sector_id=sector,
        baseline_wind_mph=10.0,
        jet_stream_offset_km=35,
        barometric_drop_hpa=0.6,
    ))
    assert res_abort_jet.summit_window_status == "abort_severe_winds_whiteout"


def test_calculate_mountain_weather_unknown_sector():
    with pytest.raises(ValueError, match="Mountain weather sector 'unknown-peak' not found"):
        calculate_mountain_weather(MountainWeatherRequest(sector_id="unknown-peak"))


# =============================================================================
# 3. Gear Checklist Tests
# =============================================================================

def test_get_weather_gear():
    gear = get_weather_gear()
    assert len(gear) == 6
    for item in gear:
        assert isinstance(item, WeatherGearItemModel)
        assert item.mandatory is True
        assert item.purpose

    gear_ids = [g.item_id for g in gear]
    assert "barometric-altimeter-watch" in gear_ids
    assert "ultralight-anemometer" in gear_ids
    assert "satellite-synoptic-inreach" in gear_ids
    assert "aviation-synoptic-chart" in gear_ids
    assert "thermal-face-mask-goggles" in gear_ids
    assert "emergency-hypothermia-bivy" in gear_ids

    watch = next(g for g in gear if g.item_id == "barometric-altimeter-watch")
    assert watch.category == "barometry"
    assert "Triple-Sensor" in watch.name


# =============================================================================
# 4. Intent Detection & Disambiguation Tests
# =============================================================================

def test_detect_mountain_weather_intent_sectors():
    # Specific sectors
    intent_denali = detect_mountain_weather_intent("What is the 500mb weather forecast for Denali South Buttress?")
    assert intent_denali is not None
    assert intent_denali.action == "sector_detail"
    assert intent_denali.sector_id == "denali-south-buttress"
    assert intent_denali.synoptic_level == "500mb"

    intent_wash = detect_mountain_weather_intent("Tell me about Mount Washington summit winds and lee wave rotor turbulence")
    assert intent_wash is not None
    assert intent_wash.action == "sector_detail"
    assert intent_wash.sector_id == "mount-washington-ridge"

    intent_rainier = detect_mountain_weather_intent("Check Rainier Columbia Crest lenticular cloud cap and 600mb forecast")
    assert intent_rainier is not None
    assert intent_rainier.action == "sector_detail"
    assert intent_rainier.sector_id == "rainier-columbia-crest"

    intent_everest = detect_mountain_weather_intent("What is the Everest South Col 300mb jet stream window?")
    assert intent_everest is not None
    assert intent_everest.action == "sector_detail"
    assert intent_everest.sector_id == "everest-south-col"

    intent_matterhorn = detect_mountain_weather_intent("Matterhorn Hornli ridge Genoa low and synoptic weather forecast")
    assert intent_matterhorn is not None
    assert intent_matterhorn.action == "sector_detail"
    assert intent_matterhorn.sector_id == "matterhorn-hornli-ridge"


def test_detect_mountain_weather_intent_calculation():
    q = "Calculate venturi wind multiplier and barometric drop storm alarm for high altitude mountain weather"
    intent = detect_mountain_weather_intent(q)
    assert intent is not None
    assert intent.action in ("calculate_weather", "calculate")


def test_detect_mountain_weather_intent_gear():
    q = "What mandatory mountain weather gear and 500mb aviation synoptic chart instruments are needed?"
    intent = detect_mountain_weather_intent(q)
    assert intent is not None
    assert intent.action in ("gear_checklist", "gear")


def test_detect_mountain_weather_intent_sectors_list():
    q = "List high-altitude mountain weather routing sectors at 600mb synoptic level"
    intent = detect_mountain_weather_intent(q)
    assert intent is not None
    assert intent.action in ("sectors_list", "sectors")
    assert intent.synoptic_level == "600mb"


def test_detect_mountain_weather_intent_disambiguation():
    # General alpine weather (handled by weather.py)
    assert detect_mountain_weather_intent("What is the weather at Camp Muir on Mount Rainier?") is None
    assert detect_mountain_weather_intent("What is the temperature lapse rate at 10000 ft in the Cascades?") is None
    assert detect_mountain_weather_intent("Lightning safety 30/30 rule in the mountains") is None

    # Avalanche safety (handled by avalanche.py)
    assert detect_mountain_weather_intent("What is the avalanche danger on Snoqualmie Pass today?") is None
    assert detect_mountain_weather_intent("Snowpack stability assessment and pit evaluation") is None

    # General mountaineering (handled by mountaineering.py)
    assert detect_mountain_weather_intent("What mountaineering gear do I need for crevasse rescue?") is None
    assert detect_mountain_weather_intent("Glacier rope team spacing and prusik self-rescue") is None

    # Other domains
    assert detect_mountain_weather_intent("Track my order #12345") is None
    assert detect_mountain_weather_intent("Do you have rental sleeping pads?") is None


# =============================================================================
# 5. Formatted Response Tests
# =============================================================================

def test_format_mountain_weather_response_sector_detail():
    intent = MountainWeatherIntent(action="sector_detail", sector_id="denali-south-buttress")
    formatted = format_mountain_weather_response(intent)
    assert isinstance(formatted, FormattedMountainWeatherResponse)
    assert "Denali" in str(formatted)
    assert "500mb" in str(formatted)
    info = formatted.get("mountain_weather_info")
    assert info is not None
    assert info["action"] == "sector_detail"
    assert info["sector"]["sector_id"] == "denali-south-buttress"


def test_format_mountain_weather_response_calculation():
    req = MountainWeatherRequest(
        sector_id="everest-south-col",
        baseline_wind_mph=30.0,
        jet_stream_offset_km=30,
        air_temp_f=-15.0,
        barometric_drop_hpa=3.5,
    )
    res = calculate_mountain_weather(req)
    formatted = format_mountain_weather_response(res)
    assert isinstance(formatted, FormattedMountainWeatherResponse)
    assert "Everest" in str(formatted)
    assert "abort_severe_winds_whiteout" in str(formatted)
    info = formatted.get("mountain_weather_info")
    assert info["action"] == "calculate_weather"
    assert info["calculation"]["summit_window_status"] == "abort_severe_winds_whiteout"


def test_format_mountain_weather_response_gear():
    intent = MountainWeatherIntent(action="gear_checklist")
    formatted = format_mountain_weather_response(intent)
    assert isinstance(formatted, FormattedMountainWeatherResponse)
    assert "barometric-altimeter-watch" in str(formatted) or "Altimeter" in str(formatted)
    info = formatted.get("mountain_weather_info")
    assert info["action"] == "gear_checklist"
    assert len(info["gear"]) == 6


def test_format_mountain_weather_response_sectors_list():
    intent = MountainWeatherIntent(action="sectors_list", synoptic_level="600mb")
    formatted = format_mountain_weather_response(intent)
    assert isinstance(formatted, FormattedMountainWeatherResponse)
    assert "Rainier" in str(formatted)
    assert "Matterhorn" in str(formatted)
    info = formatted.get("mountain_weather_info")
    assert info["action"] == "sectors_list"
    assert len(info["sectors"]) == 2
