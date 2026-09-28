import pytest
from contoso_chat.weather_station import (
    FormattedWeatherStationResponse,
    WeatherStationIntent,
    WeatherStationModel,
    WeatherStationRequest,
    build_weather_station_prompt,
    calculate_station_telemetry,
    detect_weather_station_intent,
    format_weather_station_response,
    get_weather_station,
    get_weather_station_gear_checklist,
    get_weather_stations,
    weather_station_tool,
)


def test_weather_station_model():
    station = WeatherStationModel(
        station_id="everest-south-col-station",
        title="Everest South Col Alpine Weather Station",
        mountain_range="Khumbu Himalayas",
        region="Nepal",
        elevation_m=7945,
        alpine_zone="high_altitude_col",
        sensor_type="heated_ultrasonic_anemometer",
        battery_volts=13.8,
        current_wind_kph=85,
        description="Perched at 7,945 m on the windswept South Col between Mount Everest and Lhotse.",
        highlights=[
            "Highest weather station on Earth",
            "Dual sonic anemometers with rime heating",
            "Iridium satellite real-time burst telemetry",
        ],
    )
    assert station.station_id == "everest-south-col-station"
    assert station.elevation_m == 7945
    assert len(station.highlights) == 3


def test_get_weather_stations_all():
    stations = get_weather_stations()
    assert len(stations) == 5
    station_ids = [s.station_id for s in stations]
    assert "everest-south-col-station" in station_ids
    assert "denali-football-field-station" in station_ids
    assert "mount-washington-observatory" in station_ids
    assert "matterhorn-solvay-station" in station_ids
    assert "aconcagua-colera-high-camp" in station_ids


def test_get_weather_stations_filtering():
    col_stations = get_weather_stations(zone="high_altitude_col")
    assert len(col_stations) == 2
    col_ids = [s.station_id for s in col_stations]
    assert "everest-south-col-station" in col_ids
    assert "aconcagua-colera-high-camp" in col_ids

    camp_stations = get_weather_stations(zone="glacier_basin_camp")
    assert len(camp_stations) == 1
    assert camp_stations[0].station_id == "denali-football-field-station"

    summit_stations = get_weather_stations(zone="extreme_summit_crest")
    assert len(summit_stations) == 1
    assert summit_stations[0].station_id == "mount-washington-observatory"

    ridgeline_stations = get_weather_stations(zone="subalpine_ridgeline")
    assert len(ridgeline_stations) == 1
    assert ridgeline_stations[0].station_id == "matterhorn-solvay-station"


def test_get_weather_station_lookup():
    station = get_weather_station("everest-south-col-station")
    assert station is not None
    assert station.title == "Everest South Col Alpine Weather Station"
    assert station.elevation_m == 7945

    denali = get_weather_station("denali-football-field-station")
    assert denali is not None
    assert denali.mountain_range == "Alaska Range"

    invalid = get_weather_station("nonexistent-station")
    assert invalid is None


def test_calculate_station_telemetry_default():
    req = WeatherStationRequest()
    res = calculate_station_telemetry(req)
    assert res.station_id == "everest-south-col-station"
    assert res.station_title == "Everest South Col Alpine Weather Station"
    assert res.alpine_zone == "high_altitude_col"

    # Default parameters:
    # ambient_temp_c = -18.0, wind_speed_kph = 65.0, solar_irradiance_wm2 = 450.0, rime_icing_probability_percent = 25.0
    # battery_discharge_rate_w: temp -18 is between -20 and 0 -> temp_draw = 10, rime <= 40 -> 0 -> 15 + 10 = 25
    assert res.battery_discharge_rate_w == 25
    # wind_dynamic_pressure_nm2:
    # elevation = 7945m -> rho = 1.225 * exp(-7945 / 8500) = ~0.4808 kg/m^3
    # v = 65 * 0.277778 = 18.0556 m/s
    # dynamic_pressure = round(0.5 * 0.4808 * 18.0556^2) = ~78 N/m^2
    assert res.wind_dynamic_pressure_nm2 == 78
    # Status: rime < 50, wind < 90, but ambient_temp_c <= -15.0 (-18 <= -15) -> advisory_rime_icing_detected
    assert res.telemetry_status == "advisory_rime_icing_detected"
    assert "Sub-zero conditions with active icing threat" in res.thermal_advisory
    assert "Active de-icing advisory" in res.station_health_guidance


def test_calculate_station_telemetry_nominal():
    req = WeatherStationRequest(
        station_id="matterhorn-solvay-station",
        ambient_temp_c=5.0,
        wind_speed_kph=25.0,
        solar_irradiance_wm2=700.0,
        rime_icing_probability_percent=10.0,
    )
    res = calculate_station_telemetry(req)
    assert res.station_id == "matterhorn-solvay-station"
    # ambient_temp_c >= 0 -> temp_draw = 2, rime <= 40 -> 0 -> discharge = 15 + 2 = 17
    assert res.battery_discharge_rate_w == 17
    assert res.telemetry_status == "nominal_transmission"
    assert "Operational parameters within stable thermal margins" in res.thermal_advisory
    assert "Optimal station telemetry health" in res.station_health_guidance


def test_calculate_station_telemetry_critical_freeze():
    # ambient_temp_c < -40
    req = WeatherStationRequest(
        station_id="denali-football-field-station",
        ambient_temp_c=-45.0,
        wind_speed_kph=100.0,
        solar_irradiance_wm2=100.0,
        rime_icing_probability_percent=60.0,
    )
    res = calculate_station_telemetry(req)
    # temp < -20 -> 25, rime > 40 -> 35 -> discharge = 15 + 25 + 35 = 75 (> 60)
    assert res.battery_discharge_rate_w == 75
    assert res.telemetry_status == "critical_sensor_freeze_power_loss"
    assert "Severe freezing conditions" in res.thermal_advisory
    assert "Station telemetry critical" in res.station_health_guidance


def test_calculate_station_telemetry_critical_high_wind():
    # wind_speed_kph > 160
    req = WeatherStationRequest(
        station_id="mount-washington-observatory",
        ambient_temp_c=-5.0,
        wind_speed_kph=180.0,
        solar_irradiance_wm2=300.0,
        rime_icing_probability_percent=20.0,
    )
    res = calculate_station_telemetry(req)
    assert res.telemetry_status == "critical_sensor_freeze_power_loss"


def test_calculate_station_telemetry_unknown_station():
    req = WeatherStationRequest(station_id="unknown-station-id")
    with pytest.raises(ValueError, match="not found"):
        calculate_station_telemetry(req)


def test_get_weather_station_gear_checklist():
    gear = get_weather_station_gear_checklist()
    assert len(gear) == 6
    item_ids = [g.item_id for g in gear]
    assert "heated-sonic-anemometer-sensor" in item_ids
    assert "arctic-lifepo4-battery-pack" in item_ids
    assert "iridium-satellite-burst-transceiver" in item_ids
    assert "titanium-guywire-mast-anchors" in item_ids
    assert "anti-rime-hydrophobic-dome" in item_ids
    assert "lightning-dissipation-ground-rod" in item_ids

    assert all(g.mandatory for g in gear)


def test_detect_weather_station_intent_exclusions():
    assert detect_weather_station_intent("where is my order #12345?") is None
    assert detect_weather_station_intent("need a refund for weather gear") is None
    assert detect_weather_station_intent("return label for ultrasonic anemometer") is None
    assert detect_weather_station_intent("burro packing weather station") is None
    assert detect_weather_station_intent("pack goat weather station") is None
    assert detect_weather_station_intent("cave diving weather station") is None
    assert detect_weather_station_intent("sandboarding wind speed") is None
    assert detect_weather_station_intent("falconry weather check") is None
    assert detect_weather_station_intent("canyon bouldering weather") is None
    assert detect_weather_station_intent("mudflat trekking station") is None
    assert detect_weather_station_intent("rental equipment for weather station") is None


def test_detect_weather_station_intent_queries():
    # Stations list
    intent_list = detect_weather_station_intent("Show me the high-altitude mountaineering weather stations")
    assert intent_list is not None
    assert intent_list.action == "stations_list"

    # Filtered by zone
    intent_zone = detect_weather_station_intent("List weather stations in the high altitude col alpine zone")
    assert intent_zone is not None
    assert intent_zone.alpine_zone == "high_altitude_col"

    # Detail queries
    intent_everest = detect_weather_station_intent("Tell me about the Everest South Col weather station")
    assert intent_everest is not None
    assert intent_everest.action == "station_detail"
    assert intent_everest.station_id == "everest-south-col-station"

    intent_denali = detect_weather_station_intent("How is the Denali high camp weather station telemetry?")
    assert intent_denali is not None
    assert intent_denali.action == "station_detail"
    assert intent_denali.station_id == "denali-football-field-station"

    intent_wash = detect_weather_station_intent("Mount Washington observatory station telemetry")
    assert intent_wash is not None
    assert intent_wash.action == "station_detail"
    assert intent_wash.station_id == "mount-washington-observatory"

    intent_matterhorn = detect_weather_station_intent("Matterhorn Solvay station rime de-icing status")
    assert intent_matterhorn is not None
    assert intent_matterhorn.action == "station_detail"
    assert intent_matterhorn.station_id == "matterhorn-solvay-station"

    intent_aconcagua = detect_weather_station_intent("Aconcagua Camp Colera weather tower pyranometer")
    assert intent_aconcagua is not None
    assert intent_aconcagua.action == "station_detail"
    assert intent_aconcagua.station_id == "aconcagua-colera-high-camp"

    # Calculate queries
    intent_calc = detect_weather_station_intent("Calculate weather station telemetry dynamics for Everest South Col")
    assert intent_calc is not None
    assert intent_calc.action in ("calculate", "calculate_dynamics")
    assert intent_calc.station_id == "everest-south-col-station"

    # Gear queries
    intent_gear = detect_weather_station_intent("What is the gear checklist for alpine weather station mast rigging?")
    assert intent_gear is not None
    assert intent_gear.action in ("gear", "gear_checklist")


def test_format_weather_station_response():
    # Stations list
    intent_list = WeatherStationIntent(action="stations_list")
    formatted_list = format_weather_station_response(intent_list)
    assert isinstance(formatted_list, FormattedWeatherStationResponse)
    assert "weather_station_info" in formatted_list
    assert formatted_list["weather_station_info"]["action"] == "stations_list"
    assert len(formatted_list["weather_station_info"]["stations"]) == 5
    assert len(formatted_list.get("answer", "")) > 0

    # Station detail
    intent_detail = WeatherStationIntent(action="station_detail", station_id="everest-south-col-station")
    formatted_detail = format_weather_station_response(intent_detail)
    assert formatted_detail["weather_station_info"]["action"] == "station_detail"
    assert formatted_detail["weather_station_info"]["station_id"] == "everest-south-col-station"
    assert "Everest South Col" in formatted_detail["answer"]

    # Calculate
    intent_calc = WeatherStationIntent(action="calculate", station_id="everest-south-col-station")
    formatted_calc = format_weather_station_response(intent_calc)
    assert formatted_calc["weather_station_info"]["action"] == "calculate"
    assert "wind_chill_c" in formatted_calc["weather_station_info"]

    # Gear
    intent_gear = WeatherStationIntent(action="gear")
    formatted_gear = format_weather_station_response(intent_gear)
    assert formatted_gear["weather_station_info"]["action"] == "gear"
    assert len(formatted_gear["weather_station_info"]["gear"]) == 6


def test_build_weather_station_prompt():
    prompt = build_weather_station_prompt()
    assert "Weather Station" in prompt or "weather station" in prompt.lower()
    assert "anemometer" in prompt.lower()

    station_prompt = build_weather_station_prompt(WeatherStationIntent(action="station_detail", station_id="everest-south-col-station"))
    assert "Everest South Col" in station_prompt


def test_weather_station_tool():
    res_list = weather_station_tool(action="stations_list")
    assert "weather_station_info" in res_list
    assert res_list["weather_station_info"]["action"] == "stations_list"

    res_calc = weather_station_tool(
        request=WeatherStationRequest(station_id="everest-south-col-station")
    )
    assert "weather_station_info" in res_calc
    assert res_calc["weather_station_info"]["action"] == "calculate"


def test_formatted_weather_station_response_methods():
    resp = FormattedWeatherStationResponse(
        "Alpine weather answer",
        {"weather_station_info": {"action": "stations_list"}, "answer": "Alpine weather answer"},
    )
    assert resp["weather_station_info"]["action"] == "stations_list"
    assert "weather_station_info" in resp
    assert "invalid_key" not in resp
    assert 123 not in resp
    assert "weather_station_info" in list(resp.keys())
    assert len(list(resp.values())) == 2
    assert len(list(resp.items())) == 2


def test_format_weather_station_response_variants():
    # Direct dict
    dict_resp = format_weather_station_response({"answer": "Direct dict answer", "weather_station_info": {}})
    assert dict_resp.get("answer") == "Direct dict answer"

    # From WeatherStationResponse object
    req = WeatherStationRequest(station_id="everest-south-col-station")
    calc_res = calculate_station_telemetry(req)
    calc_formatted = format_weather_station_response(calc_res)
    assert calc_formatted["weather_station_info"]["action"] == "calculate"
    assert "Everest South Col" in str(calc_formatted)

    # From string query
    str_formatted = format_weather_station_response("weather station gear checklist")
    assert str_formatted["weather_station_info"]["action"] == "gear"


def test_detect_weather_station_intent_all_zones():
    z1 = detect_weather_station_intent("weather stations in glacier basin camp")
    assert z1 is not None
    assert z1.alpine_zone == "glacier_basin_camp"

    z2 = detect_weather_station_intent("weather stations in extreme summit crest")
    assert z2 is not None
    assert z2.alpine_zone == "extreme_summit_crest"

    z3 = detect_weather_station_intent("weather stations in subalpine ridgeline")
    assert z3 is not None
    assert z3.alpine_zone == "subalpine_ridgeline"
