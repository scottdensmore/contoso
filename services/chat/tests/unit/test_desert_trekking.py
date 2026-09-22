import pytest
from contoso_chat.desert_trekking import (
    DesertGearRequirement,
    DesertRouteModel,
    DesertTrekkingIntent,
    HydrationPlanRequest,
    HydrationPlanResponse,
    build_desert_trekking_prompt,
    calculate_hydration_plan,
    detect_desert_trekking_intent,
    format_desert_trekking_response,
    get_desert_gear,
    get_desert_route_by_id,
    get_desert_routes,
)


# =============================================================================
# 1. Route Catalog Tests
# =============================================================================
class TestDesertRouteCatalog:
    def test_get_all_routes(self):
        routes = get_desert_routes()
        assert len(routes) == 5
        route_ids = {r.route_id for r in routes}
        assert route_ids == {
            "badwater-telescope-peak-traverse",
            "hayduke-buckskin-gulch-paria",
            "mazatzal-wilderness-divide-trail",
            "black-rock-desert-playa-crossing",
            "chihuahuan-mariscal-canyon-rim",
        }

    def test_get_route_by_id_found(self):
        route = get_desert_route_by_id("badwater-telescope-peak-traverse")
        assert route is not None
        assert isinstance(route, DesertRouteModel)
        assert route.route_id == "badwater-telescope-peak-traverse"
        assert "Badwater" in route.title
        assert "Inyo County, CA" in route.region
        assert route.distance_km == 48.0
        assert route.elevation_gain_m == 3450
        assert route.aridity_zone == "hyper_arid_salt_playa"
        assert route.water_sources_count == 1
        assert route.typical_duration_days == 3
        assert route.water_cache_required is True
        assert route.flash_flood_risk == "low"
        assert len(route.description) > 20
        assert len(route.highlights) >= 3

    def test_get_route_by_id_not_found(self):
        route = get_desert_route_by_id("non-existent-desert-route")
        assert route is None

    def test_get_route_case_insensitive(self):
        route = get_desert_route_by_id("BADWATER-TELESCOPE-PEAK-TRAVERSE")
        assert route is not None
        assert route.route_id == "badwater-telescope-peak-traverse"

    def test_get_routes_filter_zone(self):
        playa_routes = get_desert_routes(zone="hyper_arid_salt_playa")
        assert len(playa_routes) == 2
        playa_ids = {r.route_id for r in playa_routes}
        assert playa_ids == {
            "badwater-telescope-peak-traverse",
            "black-rock-desert-playa-crossing",
        }

        canyon_routes = get_desert_routes(zone="canyon_wash_slickrock")
        assert len(canyon_routes) == 1
        assert canyon_routes[0].route_id == "hayduke-buckskin-gulch-paria"

        scrub_routes = get_desert_routes(zone="creosote_bajada_scrub")
        assert len(scrub_routes) == 1
        assert scrub_routes[0].route_id == "mazatzal-wilderness-divide-trail"

        steppe_routes = get_desert_routes(zone="high_desert_sage_steppe")
        assert len(steppe_routes) == 1
        assert steppe_routes[0].route_id == "chihuahuan-mariscal-canyon-rim"

    def test_get_routes_filter_zone_flexible_formatting(self):
        # Case insensitivity, dashes/underscores
        routes = get_desert_routes(zone="Canyon-Wash-Slickrock")
        assert len(routes) == 1
        assert routes[0].route_id == "hayduke-buckskin-gulch-paria"

    def test_get_routes_unknown_zone_returns_empty(self):
        routes = get_desert_routes(zone="subalpine_meadow")
        assert len(routes) == 0


# =============================================================================
# 2. Mandatory Gear Checklist Tests
# =============================================================================
class TestDesertGearChecklist:
    def test_get_desert_gear(self):
        gear = get_desert_gear()
        assert len(gear) == 6
        for item in gear:
            assert isinstance(item, DesertGearRequirement)
            assert item.item_id
            assert item.name
            assert item.category
            assert item.mandatory is True
            assert len(item.purpose) > 10

        item_ids = {g.item_id for g in gear}
        assert item_ids == {
            "wide-brim-sun-sombrero-cape",
            "electrolytes-fluid-reservoir-system",
            "uv-blocking-ultralight-sun-umbrella",
            "emergency-desert-bivvy-tarp",
            "satellite-sos-inreach-messenger",
            "high-vis-desert-signal-mirror",
        }


# =============================================================================
# 3. Hydration Plan Physics & Calculations Tests
# =============================================================================
class TestHydrationPlanCalculations:
    def test_calculate_hydration_plan_standard(self):
        req = HydrationPlanRequest(
            route_id="badwater-telescope-peak-traverse",
            ambient_temperature_f=95.0,
            relative_humidity_pct=15.0,
            hiker_weight_kg=75.0,
            pack_weight_kg=15.0,
            trekking_pace_km_h=3.5,
            hours_in_direct_sun=6.0,
            shade_umbrella_used=False,
        )
        plan = calculate_hydration_plan(req)
        assert isinstance(plan, HydrationPlanResponse)
        assert plan.route_id == "badwater-telescope-peak-traverse"
        assert "Badwater" in plan.route_title
        assert plan.aridity_zone == "hyper_arid_salt_playa"
        assert plan.felt_heat_index_f >= 90.0
        assert 0.8 <= plan.hourly_sweat_rate_liters <= 1.6
        assert plan.total_water_needed_liters >= 6.0
        assert plan.electrolyte_dose_mg >= 3500
        assert "siesta" in plan.siesta_hours_advisory.lower()
        assert "low" in plan.flash_flood_advisory.lower()
        assert "water cache" in plan.caching_notice.lower()

    def test_calculate_hydration_plan_shade_umbrella_reduction(self):
        req_no_umbrella = HydrationPlanRequest(
            route_id="black-rock-desert-playa-crossing",
            ambient_temperature_f=100.0,
            relative_humidity_pct=12.0,
            shade_umbrella_used=False,
        )
        plan_no_umbrella = calculate_hydration_plan(req_no_umbrella)

        req_with_umbrella = HydrationPlanRequest(
            route_id="black-rock-desert-playa-crossing",
            ambient_temperature_f=100.0,
            relative_humidity_pct=12.0,
            shade_umbrella_used=True,
        )
        plan_with_umbrella = calculate_hydration_plan(req_with_umbrella)

        # Felt heat index should be 15°F lower with umbrella
        assert (
            round(plan_no_umbrella.felt_heat_index_f - plan_with_umbrella.felt_heat_index_f, 1)
            == 15.0
        )
        # Sweat rate and total water should both be lower with umbrella
        assert (
            plan_with_umbrella.hourly_sweat_rate_liters < plan_no_umbrella.hourly_sweat_rate_liters
        )
        assert (
            plan_with_umbrella.total_water_needed_liters
            < plan_no_umbrella.total_water_needed_liters
        )

    def test_calculate_hydration_plan_extreme_heat_status(self):
        req = HydrationPlanRequest(
            route_id="black-rock-desert-playa-crossing",
            ambient_temperature_f=115.0,
            relative_humidity_pct=10.0,
            shade_umbrella_used=False,
        )
        plan = calculate_hydration_plan(req)
        assert plan.safety_status == "critical_hazard"
        assert (
            "10:00" in plan.siesta_hours_advisory
            or "mandatory" in plan.siesta_hours_advisory.lower()
        )

    def test_calculate_hydration_plan_extreme_flash_flood_risk(self):
        req = HydrationPlanRequest(
            route_id="hayduke-buckskin-gulch-paria",
            ambient_temperature_f=85.0,
            relative_humidity_pct=20.0,
        )
        plan = calculate_hydration_plan(req)
        # Even at 85°F, extreme flood risk sets safety_status to critical_hazard
        assert plan.safety_status == "critical_hazard"
        assert "extreme" in plan.flash_flood_advisory.lower()
        # Buckskin Gulch does not require pre-trip caching (water_sources_count = 2)
        assert (
            "caching" not in plan.caching_notice.lower()
            or "not required" in plan.caching_notice.lower()
            or "available" in plan.caching_notice.lower()
        )

    def test_calculate_hydration_plan_caching_trigger(self):
        req_cache = HydrationPlanRequest(
            route_id="chihuahuan-mariscal-canyon-rim",
            ambient_temperature_f=80.0,
            relative_humidity_pct=15.0,
        )
        plan_cache = calculate_hydration_plan(req_cache)
        assert "mandatory water cache" in plan_cache.caching_notice.lower()
        assert "0 natural water source" in plan_cache.caching_notice.lower()

    def test_calculate_hydration_plan_hiker_weight_and_pace_scaling(self):
        req_light = HydrationPlanRequest(
            route_id="mazatzal-wilderness-divide-trail",
            hiker_weight_kg=60.0,
            pack_weight_kg=10.0,
            trekking_pace_km_h=2.5,
        )
        plan_light = calculate_hydration_plan(req_light)

        req_heavy = HydrationPlanRequest(
            route_id="mazatzal-wilderness-divide-trail",
            hiker_weight_kg=95.0,
            pack_weight_kg=25.0,
            trekking_pace_km_h=4.5,
        )
        plan_heavy = calculate_hydration_plan(req_heavy)

        assert plan_heavy.hourly_sweat_rate_liters > plan_light.hourly_sweat_rate_liters
        assert plan_heavy.total_water_needed_liters > plan_light.total_water_needed_liters
        assert plan_heavy.electrolyte_dose_mg > plan_light.electrolyte_dose_mg

    def test_calculate_hydration_plan_invalid_route_raises(self):
        req = HydrationPlanRequest(route_id="unknown-route")
        with pytest.raises(ValueError, match="not found"):
            calculate_hydration_plan(req)


# =============================================================================
# 4. Intent Detection & Disambiguation Guardrails
# =============================================================================
class TestDesertTrekkingIntentDetection:
    def test_detect_routes_list(self):
        queries = [
            "Show me desert trekking routes",
            "What arid wilderness survival trails do you have?",
            "List all desert routes",
            "Recommend desert trek options",
        ]
        for q in queries:
            intent = detect_desert_trekking_intent(q)
            assert intent is not None, f"Failed for query: {q}"
            assert intent.action == "routes_list"

    def test_detect_route_detail_badwater(self):
        queries = [
            "Tell me about the badwater basin to telescope peak route",
            "Details on the badwater trek",
            "What is the elevation gain for badwater to telescope peak?",
        ]
        for q in queries:
            intent = detect_desert_trekking_intent(q)
            assert intent is not None, f"Failed for query: {q}"
            assert intent.action == "route_detail"
            assert intent.route_id == "badwater-telescope-peak-traverse"

    def test_detect_route_detail_buckskin(self):
        intent = detect_desert_trekking_intent("Is buckskin gulch dry for desert trekking?")
        assert intent is not None
        assert intent.route_id == "hayduke-buckskin-gulch-paria"

    def test_detect_route_detail_mazatzal(self):
        intent = detect_desert_trekking_intent("Tell me about the mazatzal divide desert trail")
        assert intent is not None
        assert intent.route_id == "mazatzal-wilderness-divide-trail"

    def test_detect_route_detail_black_rock(self):
        intent = detect_desert_trekking_intent("Black rock desert crossing trail info")
        assert intent is not None
        assert intent.route_id == "black-rock-desert-playa-crossing"

    def test_detect_route_detail_mariscal(self):
        intent = detect_desert_trekking_intent("Mariscal canyon rim desert route details")
        assert intent is not None
        assert intent.route_id == "chihuahuan-mariscal-canyon-rim"

    def test_detect_hydration_plan(self):
        queries = [
            "Calculate desert sweat rate and hydration plan for badwater",
            "How much water do I need to cache for black rock desert?",
            "What is the heat index and desert hydration requirement?",
            "Calculate water cache and sweat rate for mariscal canyon",
        ]
        for q in queries:
            intent = detect_desert_trekking_intent(q)
            assert intent is not None, f"Failed for query: {q}"
            assert intent.action == "hydration_plan"

    def test_detect_gear_checklist(self):
        queries = [
            "What is the mandatory desert trekking kit checklist?",
            "Do I need a sun umbrella and dromedary reservoir for desert hiking?",
            "Desert trekking gear checklist and hyponatremia electrolytes",
        ]
        for q in queries:
            intent = detect_desert_trekking_intent(q)
            assert intent is not None, f"Failed for query: {q}"
            assert intent.action == "gear_checklist"

    def test_guardrails_technical_slot_canyoneering(self):
        # Queries with rappel, rope, rigging, wetsuit, descender, or canyoneering should NOT trigger desert trekking
        canyoneering_queries = [
            "What slot canyon rappel rope length do I need for The Subway?",
            "Calculate canyoneering rope rigging and descender friction",
            "Do I need a 4mm wetsuit for cold water pothole escape?",
            "Canyoneering harness and fiddle stick retrieval",
        ]
        for q in canyoneering_queries:
            intent = detect_desert_trekking_intent(q)
            assert intent is None, f"Incorrectly matched canyoneering query: {q}"

    def test_guardrails_water_filtration(self):
        # Queries specific to water filtration (sawyer, aquamira, gravity filter) should NOT trigger desert trekking
        water_queries = [
            "How do I clean my Sawyer Squeeze water filter cartridge?",
            "What is the flow rate of a gravity water purification bag?",
            "Aquamira drops vs chlorine dioxide tablets for water filtration",
        ]
        for q in water_queries:
            intent = detect_desert_trekking_intent(q)
            assert intent is None, f"Incorrectly matched water filter query: {q}"

    def test_guardrails_general_trails_and_weather(self):
        # Queries about general trail conditions or weather microclimates without desert context
        trail_weather_queries = [
            "What are the trail conditions and snow level at Mount Rainier?",
            "Weather forecast and wind chill for mountain summit",
            "Where can I find trailhead parking for the PCT?",
        ]
        for q in trail_weather_queries:
            intent = detect_desert_trekking_intent(q)
            assert intent is None, f"Incorrectly matched trail/weather query: {q}"


# =============================================================================
# 5. Prompt Building & Response Formatting Tests
# =============================================================================
class TestPromptAndFormatting:
    def test_build_prompt_routes_list(self):
        intent = DesertTrekkingIntent(action="routes_list")
        prompt = build_desert_trekking_prompt(intent)
        assert "Desert Trekking" in prompt
        assert "Badwater Basin" in prompt
        assert "Buckskin Gulch" in prompt
        assert "Mandatory Desert Trekking Kit Compliance" in prompt

    def test_build_prompt_route_detail(self):
        intent = DesertTrekkingIntent(
            action="route_detail", route_id="hayduke-buckskin-gulch-paria"
        )
        prompt = build_desert_trekking_prompt(intent)
        assert "Buckskin Gulch" in prompt
        assert "canyon_wash_slickrock" in prompt
        assert "extreme" in prompt.lower()

    def test_format_response_routes_list(self):
        intent = DesertTrekkingIntent(action="routes_list")
        res = format_desert_trekking_response(intent)
        assert "desert_trekking_info" in res
        assert res["desert_trekking_info"]["action"] == "routes_list"
        assert len(res["desert_trekking_info"]["routes"]) == 5
        assert "Desert Trekking Routes" in res["answer"]

    def test_format_response_route_detail(self):
        intent = DesertTrekkingIntent(
            action="route_detail", route_id="badwater-telescope-peak-traverse"
        )
        res = format_desert_trekking_response(intent)
        assert "desert_trekking_info" in res
        assert res["desert_trekking_info"]["action"] == "route_detail"
        assert (
            res["desert_trekking_info"]["route"]["route_id"] == "badwater-telescope-peak-traverse"
        )
        assert "Badwater" in res["answer"]

    def test_format_response_hydration_plan(self):
        intent = DesertTrekkingIntent(
            action="hydration_plan", route_id="black-rock-desert-playa-crossing"
        )
        res = format_desert_trekking_response(intent)
        assert "desert_trekking_info" in res
        assert res["desert_trekking_info"]["action"] == "hydration_plan"
        assert "plan" in res["desert_trekking_info"]
        assert "Hydration Plan" in res["answer"]
        assert "hourly sweat rate" in res["answer"].lower()

    def test_format_response_gear_checklist(self):
        intent = DesertTrekkingIntent(action="gear_checklist")
        res = format_desert_trekking_response(intent)
        assert "desert_trekking_info" in res
        assert res["desert_trekking_info"]["action"] == "gear_checklist"
        assert len(res["desert_trekking_info"]["gear"]) == 6
        assert "Desert Trekking Kit Checklist" in res["answer"]

    def test_detect_intent_zones(self):
        assert (
            detect_desert_trekking_intent("desert routes in hyper_arid_salt_playa").zone
            == "hyper_arid_salt_playa"
        )
        assert (
            detect_desert_trekking_intent("canyon wash slickrock desert trek").zone
            == "canyon_wash_slickrock"
        )
        assert (
            detect_desert_trekking_intent("creosote bajada desert hiking").zone
            == "creosote_bajada_scrub"
        )
        assert (
            detect_desert_trekking_intent("high desert sage steppe routes").zone
            == "high_desert_sage_steppe"
        )

    def test_detect_intent_invalid_and_empty(self):
        assert detect_desert_trekking_intent("") is None
        assert detect_desert_trekking_intent("   ") is None
        assert detect_desert_trekking_intent(123) is None  # type: ignore

    def test_calculate_hydration_plan_extreme_humidity_branches(self):
        # Low humidity adjustment: rh < 13, 80 <= temp <= 112
        req_low_rh = HydrationPlanRequest(
            route_id="badwater-telescope-peak-traverse",
            ambient_temperature_f=102.0,
            relative_humidity_pct=8.0,
        )
        plan_low = calculate_hydration_plan(req_low_rh)
        assert plan_low.felt_heat_index_f > 90.0

        # High humidity adjustment: rh > 85, 80 <= temp <= 87
        req_high_rh = HydrationPlanRequest(
            route_id="badwater-telescope-peak-traverse",
            ambient_temperature_f=84.0,
            relative_humidity_pct=90.0,
        )
        plan_high = calculate_hydration_plan(req_high_rh)
        assert plan_high.felt_heat_index_f > 90.0

        # Cool temperature (temp + hi)/2 < 80
        req_cool = HydrationPlanRequest(
            route_id="badwater-telescope-peak-traverse",
            ambient_temperature_f=65.0,
            relative_humidity_pct=20.0,
        )
        plan_cool = calculate_hydration_plan(req_cool)
        assert plan_cool.safety_status == "safe"
        assert "optional" in plan_cool.siesta_hours_advisory.lower()

    def test_build_prompt_with_zone(self):
        intent = DesertTrekkingIntent(action="routes_list", zone="hyper_arid_salt_playa")
        prompt = build_desert_trekking_prompt(intent)
        assert "Matching hyper_arid_salt_playa Desert Routes" in prompt

    def test_format_response_hydration_plan_invalid_route_fallback(self):
        intent = DesertTrekkingIntent(action="hydration_plan", route_id="non-existent-route")
        res = format_desert_trekking_response(intent)
        assert res["desert_trekking_info"]["action"] == "routes_list"

    def test_calculate_hydration_plan_high_flood_risk_mock(self, monkeypatch):
        from contoso_chat import desert_trekking

        mock_route = desert_trekking.DesertRouteModel(
            route_id="test-high-flood",
            title="Test High Flood",
            region="Test Region",
            distance_km=20.0,
            elevation_gain_m=100,
            aridity_zone="canyon_wash_slickrock",
            water_sources_count=1,
            typical_duration_days=1,
            water_cache_required=False,
            flash_flood_risk="high",
            description="Test description with sufficient length for validation",
            highlights=["test1", "test2", "test3"],
        )
        monkeypatch.setattr(desert_trekking, "get_desert_route_by_id", lambda rid: mock_route)
        req = HydrationPlanRequest(route_id="test-high-flood", ambient_temperature_f=75.0)
        plan = calculate_hydration_plan(req)
        assert plan.safety_status == "caution"
        assert "high flash flood risk" in plan.flash_flood_advisory.lower()
