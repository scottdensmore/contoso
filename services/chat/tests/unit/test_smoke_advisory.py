import pytest
from contoso_chat.fire_safety import detect_fire_safety_intent
from contoso_chat.mountain_weather import detect_mountain_weather_intent
from contoso_chat.smoke_advisory import (
    FormattedSmokeAdvisoryResponse,
    SmokeAdvisoryIntent,
    SmokeAdvisoryQuery,
    SmokeStation,
    build_smoke_advisory_prompt,
    calculate_smoke_exposure,
    detect_smoke_advisory_intent,
    format_smoke_advisory_response,
    get_smoke_gear_checklist,
    get_smoke_station_by_id,
    get_smoke_stations,
    smoke_advisory_tool,
)
from contoso_chat.weather import detect_weather_intent
from contoso_chat.weather_station import detect_weather_station_intent


def test_smoke_station_model():
    station = SmokeStation(
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
    )
    assert station.id == "pasayten-boundary-fire"
    assert station.elevation_meters == 1450
    assert station.aqi == 185
    assert station.pm25_ug_m3 == 121.5
    assert station.inversion_trapped is True
    assert len(station.highlights) == 3


def test_get_smoke_stations_all():
    stations = get_smoke_stations()
    assert len(stations) == 5
    station_ids = [s.id for s in stations]
    assert "pasayten-boundary-fire" in station_ids
    assert "sawtooth-wilderness-basin" in station_ids
    assert "sierra-crest-granite-gap" in station_ids
    assert "san-juan-wetterhorn-basin" in station_ids
    assert "bob-marshall-wilderness-complex" in station_ids


def test_get_smoke_stations_filter_layer():
    valleys = get_smoke_stations(layer="valley_basin_trapping")
    assert len(valleys) == 2
    valley_ids = [s.id for s in valleys]
    assert "pasayten-boundary-fire" in valley_ids
    assert "bob-marshall-wilderness-complex" in valley_ids

    slopes = get_smoke_stations(layer="mid_slope_thermal_belt")
    assert len(slopes) == 1
    assert slopes[0].id == "sawtooth-wilderness-basin"

    ridges = get_smoke_stations(layer="alpine_ridge_free_air")
    assert len(ridges) == 2
    ridge_ids = [s.id for s in ridges]
    assert "sierra-crest-granite-gap" in ridge_ids
    assert "san-juan-wetterhorn-basin" in ridge_ids


def test_get_smoke_stations_filter_severity():
    unhealthy = get_smoke_stations(severity="unhealthy_wildfire_plume")
    assert len(unhealthy) == 2

    clean = get_smoke_stations(severity="clean_uncompromised")
    assert len(clean) == 1
    assert clean[0].id == "san-juan-wetterhorn-basin"

    haz = get_smoke_stations(severity="hazardous_dense_inversion")
    assert len(haz) == 1
    assert haz[0].id == "sierra-crest-granite-gap"


def test_get_smoke_station_by_id():
    st = get_smoke_station_by_id("pasayten-boundary-fire")
    assert st is not None
    assert st.name == "Pasayten Boundary Fire Telemetry"

    invalid = get_smoke_station_by_id("nonexistent-station")
    assert invalid is None


def test_calculate_smoke_exposure_pasayten():
    # Pasayten: pm25 = 121.5, layer = valley_basin_trapping, inversion_trapped = True -> factor = 1.35
    # effective_pm25 = round(121.5 * 1.35, 1) = 164.0
    # AQI for 164.0: range 150.4 to 250.4:
    # 201 + ((300 - 201) / (250.4 - 150.4)) * (164.0 - 150.4) = 201 + (99 / 100) * 13.6 = 201 + 13.464 = 214
    # activity = moderate_backpacking (1.8 m3/h), mask = none (0.0), hours = 6.0
    # dose = round(164.0 * 1.8 * 1.0 * 6.0, 1) = round(1771.2, 1) = 1771.2
    # effective_aqi 214 > 200 or dose > 500 -> critical_hazard_cease_exertion
    query = SmokeAdvisoryQuery(
        station_id="pasayten-boundary-fire",
        activity_intensity="moderate_backpacking",
        exposure_hours=6.0,
        respirator_type="none",
    )
    result = calculate_smoke_exposure(query)
    assert result.station_id == "pasayten-boundary-fire"
    assert result.effective_pm25_ug_m3 == 164.0
    assert result.effective_aqi == 214
    assert result.ventilation_rate_m3_hr == 1.8
    assert result.mask_efficiency == 0.0
    assert result.inhaled_particulate_dose_ug == 1771.2
    assert result.safety_status == "critical_hazard_cease_exertion"
    assert "CRITICAL SMOKE HAZARD" in result.advisory
    assert len(result.recommended_actions) >= 3


def test_calculate_smoke_exposure_respirator_reductions():
    # Test N95 (95% filtration)
    query_n95 = SmokeAdvisoryQuery(
        station_id="pasayten-boundary-fire",
        activity_intensity="moderate_backpacking",
        exposure_hours=6.0,
        respirator_type="n95_particulate_respirator",
    )
    result_n95 = calculate_smoke_exposure(query_n95)
    assert result_n95.mask_efficiency == 0.95
    # dose = round(164.0 * 1.8 * (1 - 0.95) * 6.0, 1) = round(88.56, 1) = 88.6
    assert result_n95.inhaled_particulate_dose_ug == 88.6
    # Note effective_aqi is still 214 > 200, so safety_status is critical_hazard_cease_exertion
    assert result_n95.safety_status == "critical_hazard_cease_exertion"

    # Test P100 (99.9% filtration)
    query_p100 = SmokeAdvisoryQuery(
        station_id="pasayten-boundary-fire",
        activity_intensity="moderate_backpacking",
        exposure_hours=6.0,
        respirator_type="p100_elastomeric_half_mask",
    )
    result_p100 = calculate_smoke_exposure(query_p100)
    assert result_p100.mask_efficiency == 0.999
    # dose = round(164.0 * 1.8 * (1 - 0.999) * 6.0, 1) = round(1.7712, 1) = 1.8
    assert result_p100.inhaled_particulate_dose_ug == 1.8


def test_calculate_smoke_exposure_clean_station():
    # San Juan Wetterhorn: pm25 = 8.4, layer = alpine_ridge_free_air -> factor = 0.70
    # effective_pm25 = round(8.4 * 0.70, 1) = 5.9
    # AQI for 5.9: <= 12.0 -> round((50 / 12.0) * 5.9) = round(24.58) = 25
    # activity = low_camp_rest (0.6), hours = 8.0, mask = none
    # dose = round(5.9 * 0.6 * 1.0 * 8.0, 1) = round(28.32, 1) = 28.3
    # safety status: nominal_safe_exertion
    query = SmokeAdvisoryQuery(
        station_id="san-juan-wetterhorn-basin",
        activity_intensity="low_camp_rest",
        exposure_hours=8.0,
        respirator_type="none",
    )
    res = calculate_smoke_exposure(query)
    assert res.effective_pm25_ug_m3 == 5.9
    assert res.effective_aqi == 25
    assert res.inhaled_particulate_dose_ug == 28.3
    assert res.safety_status == "nominal_safe_exertion"


def test_calculate_smoke_exposure_caution_status():
    # Sawtooth: pm25 = 25.2, layer = mid_slope_thermal_belt -> factor = 0.85
    # effective_pm25 = round(25.2 * 0.85, 1) = 21.4
    # AQI for 21.4 (between 12.0 and 35.4):
    # 50 + ((100 - 50) / (35.4 - 12.0)) * (21.4 - 12.0) = 50 + (50 / 23.4) * 9.4 = 50 + 20.08 = 70
    # activity = strenuous_alpine_ascent (3.2), hours = 3, mask = none
    # dose = round(21.4 * 3.2 * 3, 1) = 205.4
    # effective_aqi = 70 <= 100, but dose = 205.4 > 150 -> caution_moderate_respiration
    query = SmokeAdvisoryQuery(
        station_id="sawtooth-wilderness-basin",
        activity_intensity="strenuous_alpine_ascent",
        exposure_hours=3.0,
        respirator_type="none",
    )
    res = calculate_smoke_exposure(query)
    assert res.effective_pm25_ug_m3 == 21.4
    assert res.effective_aqi == 70
    assert res.inhaled_particulate_dose_ug == 205.4
    assert res.safety_status == "caution_moderate_respiration"


def test_calculate_unknown_station_raises():
    query = SmokeAdvisoryQuery(station_id="unknown-station-id")
    with pytest.raises(ValueError, match="not found"):
        calculate_smoke_exposure(query)


def test_get_smoke_gear_checklist():
    gear = get_smoke_gear_checklist()
    assert len(gear) == 6
    assert all(g.mandatory for g in gear)
    gear_ids = [g.id for g in gear]
    assert "n95-valved-particulate-respirator" in gear_ids
    assert "sealed-smoke-goggles" in gear_ids
    assert "portable-laser-pm25-monitor" in gear_ids
    assert "hepa-micro-tent-purifier" in gear_ids
    assert "electrolyte-saline-eye-rinse" in gear_ids
    assert "bronchodilator-emergency-inhaler-pouch" in gear_ids


def test_detect_smoke_advisory_intent():
    # Positive keywords
    assert detect_smoke_advisory_intent("What is the wildfire smoke advisory in Pasayten?") is True
    assert detect_smoke_advisory_intent("Check smoke drift in the valley") is True
    assert detect_smoke_advisory_intent("What is the pm2.5 reading?") is True
    assert detect_smoke_advisory_intent("Check the aqi for high sierra") is True
    assert detect_smoke_advisory_intent("How is the air quality today?") is True
    assert detect_smoke_advisory_intent("Is there inversion smoke trapped in the basin?") is True
    assert detect_smoke_advisory_intent("Should I wear a particulate mask?") is True
    assert detect_smoke_advisory_intent("Do I need an n95 smoke respirator?") is True
    assert detect_smoke_advisory_intent("Where is the active smoke plume moving?") is True
    assert detect_smoke_advisory_intent("What kind of respirator is required?") is True
    assert detect_smoke_advisory_intent("Check wildfire aqi levels") is True


def test_detect_smoke_advisory_intent_exclusions():
    # Preceding disciplines and general exclusions
    assert detect_smoke_advisory_intent("Where is my order #12345 with smoke goggles?") is False
    assert detect_smoke_advisory_intent("Can I get a refund on this particulate mask?") is False
    assert detect_smoke_advisory_intent("Print return label for respirator") is False
    assert detect_smoke_advisory_intent("Shipping tracking for pm2.5 monitor") is False
    assert detect_smoke_advisory_intent("Can my pack burro carry air quality gear?") is False
    assert detect_smoke_advisory_intent("Horse packing through smoke") is False
    assert detect_smoke_advisory_intent("Pack goat trail route aqi") is False
    assert detect_smoke_advisory_intent("Dogsledding in wildfire smoke") is False
    assert detect_smoke_advisory_intent("Primitive trapping near smoke drift") is False
    assert detect_smoke_advisory_intent("Beachcombing in coastal smoke") is False
    assert detect_smoke_advisory_intent("Fire lookout tower smoke report") is False
    assert detect_smoke_advisory_intent("Snowshoe trail air quality") is False
    assert detect_smoke_advisory_intent("Sandboarding dune smoke") is False
    assert detect_smoke_advisory_intent("Cave diving gear checklist") is False
    assert detect_smoke_advisory_intent("Caving speleothem air quality") is False
    assert detect_smoke_advisory_intent("Ski touring powder conditions") is False
    assert detect_smoke_advisory_intent("Steep skiing couloir forecast") is False
    assert detect_smoke_advisory_intent("Nordic ski waxing guide") is False
    assert detect_smoke_advisory_intent("Telemark skiing bindings") is False
    assert detect_smoke_advisory_intent("Falconry raptor hood and perch") is False
    assert detect_smoke_advisory_intent("Llama pack weights") is False
    assert detect_smoke_advisory_intent("Zipline canopy speed") is False
    assert detect_smoke_advisory_intent("Turtle patrol beach nesting") is False
    assert detect_smoke_advisory_intent("Night via ferrata headlamp lumens") is False
    assert detect_smoke_advisory_intent("Canyon bouldering highball crash pad") is False
    assert detect_smoke_advisory_intent("Mudflat trekking tidal suction") is False
    assert detect_smoke_advisory_intent("Weather station ultrasonic anemometer telemetry") is False
    assert detect_smoke_advisory_intent("Alpine anemometry wind chill") is False
    assert detect_smoke_advisory_intent("Gear rentals reservation") is False


def test_exclusions_in_other_intents():
    smoke_query = "What is the wildfire smoke advisory and pm2.5 air quality in the Cascades?"
    assert detect_weather_intent(smoke_query) is None
    assert detect_mountain_weather_intent(smoke_query) is None
    assert detect_weather_station_intent(smoke_query) is None
    assert detect_fire_safety_intent(smoke_query) is None


def test_format_smoke_advisory_response():
    # Stations list
    res_list = format_smoke_advisory_response("stations_list", None)
    assert isinstance(res_list, str)
    assert isinstance(res_list, FormattedSmokeAdvisoryResponse)
    assert "smoke_advisory_info" in res_list
    assert res_list["smoke_advisory_info"]["action"] == "stations_list"
    assert len(res_list["smoke_advisory_info"]["stations"]) == 5

    # Station detail
    st = get_smoke_station_by_id("pasayten-boundary-fire")
    res_detail = format_smoke_advisory_response("station_detail", st)
    assert "Pasayten Boundary Fire Telemetry" in str(res_detail)
    assert res_detail["smoke_advisory_info"]["action"] == "station_detail"
    assert res_detail["smoke_advisory_info"]["station_id"] == "pasayten-boundary-fire"

    # Calculate
    query = SmokeAdvisoryQuery(station_id="pasayten-boundary-fire")
    calc = calculate_smoke_exposure(query)
    res_calc = format_smoke_advisory_response("calculate", calc)
    assert "CRITICAL SMOKE HAZARD" in str(res_calc)
    assert res_calc["smoke_advisory_info"]["action"] == "calculate"
    assert res_calc["smoke_advisory_info"]["effective_aqi"] == 214

    # Gear
    gear = get_smoke_gear_checklist()
    res_gear = format_smoke_advisory_response("gear", gear)
    assert "Mandatory" in str(res_gear)
    assert res_gear["smoke_advisory_info"]["action"] == "gear"
    assert res_gear["smoke_advisory_info"]["mandatory_count"] == 6


def test_build_smoke_advisory_prompt():
    prompt = build_smoke_advisory_prompt("wildfire smoke pm2.5 advisory")
    assert "Wilderness Forest Fire Smoke Drift" in prompt
    assert "Pasayten Boundary Fire" in prompt
    assert "N95" in prompt


def test_smoke_station_and_gear_properties():
    station = get_smoke_station_by_id("pasayten-boundary-fire")
    assert station is not None
    assert station.station_id == "pasayten-boundary-fire"
    assert station.title == "Pasayten Boundary Fire Telemetry"
    assert station.station_name == "Pasayten Boundary Fire Telemetry"

    gear = get_smoke_gear_checklist()[0]
    assert gear.item_id == gear.id
    assert gear.purpose == gear.description


def test_formatted_response_dict_methods():
    res = format_smoke_advisory_response("stations_list")
    assert "smoke_advisory_info" in res
    assert res["smoke_advisory_info"] is not None
    assert "smoke_advisory_info" in res.keys()
    assert len(list(res.values())) > 0
    assert len(list(res.items())) > 0
    assert "nonexistent_key" not in res
    assert 42 not in res
    assert res.get("missing", "default") == "default"

    # Pre-existing dict wrapped
    dict_payload = {
        "smoke_advisory_info": {"action": "custom_action"},
        "answer": "Custom formatted answer",
    }
    wrapped = format_smoke_advisory_response("custom", dict_payload)
    assert wrapped.get("smoke_advisory_info")["action"] == "custom_action"


def test_calculate_smoke_exposure_aqi_breakpoints_and_layers():
    # Alpine ridge on hazardous station -> layer_factor = 1.0
    res_sierra = calculate_smoke_exposure(
        SmokeAdvisoryQuery(
            station_id="sierra-crest-granite-gap",
            layer="alpine_ridge_free_air",
            exposure_hours=2.0,
        )
    )
    assert res_sierra.layer_factor == 1.0
    assert res_sierra.effective_pm25_ug_m3 == 260.0
    # AQI > 250.4 -> 301 + ((500 - 301) / (500 - 250.4)) * (260 - 250.4)
    assert res_sierra.effective_aqi > 300

    # Valley basin without inversion trapped
    res_sawtooth_valley = calculate_smoke_exposure(
        SmokeAdvisoryQuery(
            station_id="sawtooth-wilderness-basin",
            layer="valley_basin_trapping",
        )
    )
    assert res_sawtooth_valley.layer_factor == 1.15

    # Fallback layer
    res_fallback = calculate_smoke_exposure(
        SmokeAdvisoryQuery(
            station_id="san-juan-wetterhorn-basin",
            layer="custom_unknown_layer",
        )
    )
    assert res_fallback.layer_factor == 1.0


def test_format_smoke_advisory_response_detail_and_intent():
    # station_detail with string station_id
    res_str = format_smoke_advisory_response("station_detail", "pasayten-boundary-fire")
    assert "Pasayten" in str(res_str)

    # SmokeAdvisoryIntent object
    intent = SmokeAdvisoryIntent(action="stations_list")
    res_intent = format_smoke_advisory_response(intent)
    assert res_intent.get("smoke_advisory_info")["action"] == "stations_list"


def test_smoke_advisory_tool_execution():
    calc_res = smoke_advisory_tool(action="calculate", station_id="pasayten-boundary-fire")
    assert "smoke_advisory_info" in calc_res
    assert calc_res["smoke_advisory_info"]["action"] == "calculate"

    gear_res = smoke_advisory_tool(action="gear")
    assert "smoke_advisory_info" in gear_res
    assert gear_res["smoke_advisory_info"]["action"] == "gear"

    detail_res = smoke_advisory_tool(action="station_detail", station_id="pasayten-boundary-fire")
    assert "smoke_advisory_info" in detail_res
    assert detail_res["smoke_advisory_info"]["action"] == "station_detail"

    list_res = smoke_advisory_tool(action="stations_list")
    assert "smoke_advisory_info" in list_res
    assert list_res["smoke_advisory_info"]["action"] == "stations_list"
