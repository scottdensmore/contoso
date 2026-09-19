import pytest
from contoso_chat.weather import (
    MicroclimateRequest,
    MicroclimateResponse,
    MountainZoneModel,
    WeatherIntent,
    build_weather_prompt,
    calculate_microclimate,
    detect_weather_intent,
    format_weather_response,
    get_lightning_safety_protocol,
    get_mountain_zone_by_id,
    get_mountain_zones,
)


class TestMountainZoneCatalog:
    def test_get_all_zones(self):
        zones = get_mountain_zones()
        assert len(zones) == 5
        zone_ids = {z.zone_id for z in zones}
        assert zone_ids == {
            "mount-rainier",
            "mount-baker",
            "snoqualmie-alpental",
            "stevens-crest",
            "olympic-hurricane",
        }

    def test_get_zones_with_filter(self):
        zones = get_mountain_zones(zone_id="mount-rainier")
        assert len(zones) == 1
        zone = zones[0]
        assert zone.zone_id == "mount-rainier"
        assert zone.base_elevation_ft == 5400
        assert zone.summit_elevation_ft == 14411
        assert zone.base_temp_f == 44.0
        assert zone.summit_temp_f == 12.0
        assert zone.freezing_level_ft == 7500
        assert zone.wind_speed_mph == 25.0
        assert zone.wind_gust_mph == 45.0
        assert zone.wind_direction == "WSW"
        assert zone.condition == "snow_flurries"
        assert zone.pressure_trend == "rapidly_falling"
        assert zone.lightning_risk == "moderate"
        assert zone.storm_warning is True

    def test_get_zone_by_id(self):
        zone = get_mountain_zone_by_id("mount-baker")
        assert zone is not None
        assert isinstance(zone, MountainZoneModel)
        assert zone.zone_id == "mount-baker"
        assert zone.base_elevation_ft == 4300
        assert zone.summit_elevation_ft == 10781
        assert zone.base_temp_f == 40.0
        assert zone.summit_temp_f == 18.0
        assert zone.freezing_level_ft == 6200
        assert zone.wind_speed_mph == 20.0
        assert zone.wind_gust_mph == 35.0
        assert zone.wind_direction == "W"
        assert zone.condition == "heavy_snow"
        assert zone.pressure_trend == "falling"
        assert zone.lightning_risk == "low"
        assert zone.storm_warning is False

    def test_get_zone_case_insensitive_and_unknown(self):
        zone = get_mountain_zone_by_id("SNOQUALMIE-ALPENTAL")
        assert zone is not None
        assert zone.zone_id == "snoqualmie-alpental"

        assert get_mountain_zone_by_id("unknown-peak-xyz") is None

    def test_other_zones_spec(self):
        stevens = get_mountain_zone_by_id("stevens-crest")
        assert stevens is not None
        assert stevens.base_elevation_ft == 4000
        assert stevens.summit_elevation_ft == 5800
        assert stevens.base_temp_f == 42.0
        assert stevens.summit_temp_f == 35.0
        assert stevens.freezing_level_ft == 5200
        assert stevens.wind_speed_mph == 15.0
        assert stevens.wind_gust_mph == 28.0
        assert stevens.wind_direction == "WNW"
        assert stevens.condition == "partly_cloudy"
        assert stevens.pressure_trend == "rising"
        assert stevens.lightning_risk == "none"
        assert stevens.storm_warning is False

        olympic = get_mountain_zone_by_id("olympic-hurricane")
        assert olympic is not None
        assert olympic.base_elevation_ft == 5200
        assert olympic.summit_elevation_ft == 7980
        assert olympic.base_temp_f == 46.0
        assert olympic.summit_temp_f == 36.0
        assert olympic.freezing_level_ft == 6800
        assert olympic.wind_speed_mph == 18.0
        assert olympic.wind_gust_mph == 32.0
        assert olympic.wind_direction == "SW"
        assert olympic.condition == "overcast"
        assert olympic.pressure_trend == "falling"
        assert olympic.lightning_risk == "none"
        assert olympic.storm_warning is False


class TestMicroclimateCalculation:
    def test_lapse_rate_and_wind_chill_exposed_ridge(self):
        req = MicroclimateRequest(
            zone_id="mount-rainier",
            target_elevation_ft=10000.0,
            exposure_level="exposed_ridge",
        )
        res = calculate_microclimate(req)
        assert isinstance(res, MicroclimateResponse)
        assert res.zone_id == "mount-rainier"
        assert res.target_elevation_ft == 10000.0
        assert res.estimated_temp_f == pytest.approx(27.9, rel=1e-2)
        assert res.estimated_wind_speed_mph == pytest.approx(40.0, rel=1e-2)
        assert res.is_below_freezing is True
        assert res.wind_chill_f < 20.0
        assert res.hypothermia_risk == "critical"
        assert len(res.layering_advice) >= 3
        assert len(res.weather_advisory) > 0

    def test_microclimate_valley_moderate_risk(self):
        req = MicroclimateRequest(
            zone_id="snoqualmie-alpental",
            target_elevation_ft=4000.0,
            exposure_level="valley",
        )
        res = calculate_microclimate(req)
        assert res.estimated_temp_f == pytest.approx(44.5, rel=1e-2)
        assert res.estimated_wind_speed_mph == pytest.approx(7.0, rel=1e-2)
        assert res.is_below_freezing is False
        assert res.hypothermia_risk == "moderate"

    def test_hypothermia_risk_brackets(self):
        req = MicroclimateRequest(
            zone_id="stevens-crest",
            target_elevation_ft=5000.0,
            exposure_level="open_slope",
        )
        res = calculate_microclimate(req)
        assert res.hypothermia_risk == "high"

    def test_invalid_zone_raises(self):
        req = MicroclimateRequest(
            zone_id="non-existent-zone",
            target_elevation_ft=6000.0,
        )
        with pytest.raises(ValueError, match="not found"):
            calculate_microclimate(req)


class TestLightningSafetyProtocol:
    def test_protocol_structure_and_content(self):
        proto = get_lightning_safety_protocol()
        assert isinstance(proto, dict)
        assert "title" in proto
        proto_text = str(proto).lower()
        assert "30/30" in proto_text or "30 seconds" in proto_text
        assert "whiteout" in proto_text
        assert "crouch" in proto_text or "lightning" in proto_text


class TestWeatherIntentDetection:
    def test_detect_zone_detail(self):
        intent = detect_weather_intent("What is the weather forecast and freezing level at Mount Rainier?")
        assert intent is not None
        assert intent.action in {"zone_detail", "zones"}
        assert intent.zone_id == "mount-rainier"

    def test_detect_microclimate(self):
        intent = detect_weather_intent("What is the lapse rate temperature and wind chill at 10000 ft on Mount Rainier?")
        assert intent is not None
        assert intent.action == "microclimate"
        assert intent.zone_id == "mount-rainier"
        assert intent.target_elevation_ft == 10000.0

    def test_detect_lightning_protocol(self):
        intent = detect_weather_intent("What is the 30/30 lightning safety rule and whiteout protocol?")
        assert intent is not None
        assert intent.action == "lightning_protocol"

    def test_detect_zones(self):
        intent = detect_weather_intent("Show me mountain weather forecasts across the Cascades")
        assert intent is not None
        assert intent.action == "zones"

    def test_unrelated_query(self):
        assert detect_weather_intent("Can I return climbing shoes?") is None
        assert detect_weather_intent("Tell me about kayak rentals") is None


class TestWeatherResponseAndPrompt:
    def test_format_microclimate_response(self):
        intent = WeatherIntent(
            action="microclimate",
            zone_id="mount-rainier",
            target_elevation_ft=10000.0,
            exposure_level="exposed_ridge",
        )
        res = format_weather_response(intent)
        assert "answer" in res
        assert "weather_info" in res
        winfo = res["weather_info"]
        assert winfo["action"] == "microclimate"
        assert winfo["target_elevation_ft"] == 10000.0
        assert "Mount Rainier" in res["answer"]
        assert "wind chill" in res["answer"].lower()

    def test_format_zone_detail_response(self):
        intent = WeatherIntent(
            action="zone_detail",
            zone_id="mount-baker",
        )
        res = format_weather_response(intent)
        assert "answer" in res
        assert "weather_info" in res
        winfo = res["weather_info"]
        assert winfo["action"] == "zone_detail"
        assert "Mount Baker" in res["answer"]
        assert "snow" in res["answer"].lower()

    def test_format_lightning_protocol_response(self):
        intent = WeatherIntent(action="lightning_protocol")
        res = format_weather_response(intent)
        assert "answer" in res
        assert "weather_info" in res
        winfo = res["weather_info"]
        assert winfo["action"] == "lightning_protocol"
        assert "30/30" in res["answer"]

    def test_format_zones_response(self):
        intent = WeatherIntent(action="zones")
        res = format_weather_response(intent)
        assert "answer" in res
        assert "weather_info" in res
        winfo = res["weather_info"]
        assert winfo["action"] == "zones"
        assert len(winfo["zones"]) == 5

    def test_build_weather_prompt(self):
        intent = WeatherIntent(action="zone_detail", zone_id="mount-rainier")
        prompt = build_weather_prompt(intent)
        assert "Mount Rainier" in prompt
        assert "freezing level" in prompt.lower() or "lapse rate" in prompt.lower()
