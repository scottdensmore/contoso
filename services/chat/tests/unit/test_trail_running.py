import pytest
from contoso_chat.trail_running import (
    MandatoryGearRequirement,
    PacingCalculationRequest,
    PacingCalculationResponse,
    TrailRunningIntent,
    TrailRunRouteModel,
    build_trail_running_prompt,
    calculate_trail_run_pacing,
    detect_trail_running_intent,
    format_trail_running_response,
    get_mandatory_gear_requirements,
    get_trail_run_route_by_id,
    get_trail_run_routes,
)


class TestTrailRunningCatalog:
    def test_get_all_routes(self):
        routes = get_trail_run_routes()
        assert len(routes) == 5
        route_ids = {r.route_id for r in routes}
        expected_ids = {
            "enchantments-thru-run",
            "timberline-trail-ultra",
            "wonderland-trail-fastpack",
            "si-mailbox-vertical-double",
            "olympic-coast-wilderness-run",
        }
        assert route_ids == expected_ids

    def test_routes_model_fields(self):
        routes = get_trail_run_routes()
        for r in routes:
            assert isinstance(r, TrailRunRouteModel)
            assert r.route_id
            assert r.name
            assert r.region
            assert r.distance_miles > 0
            assert r.elevation_gain_ft > 0
            assert r.elevation_loss_ft > 0
            assert r.technical_difficulty in ("moderate", "advanced", "expert")
            assert r.terrain
            assert r.refill_points >= 0
            assert r.estimated_fast_time_hrs > 0
            assert r.recommended_drop_mm
            assert r.lug_depth_mm
            assert r.description

    def test_filter_by_difficulty(self):
        expert_routes = get_trail_run_routes(difficulty="expert")
        assert len(expert_routes) >= 2
        assert all(r.technical_difficulty == "expert" for r in expert_routes)
        expert_ids = {r.route_id for r in expert_routes}
        assert "enchantments-thru-run" in expert_ids
        assert "wonderland-trail-fastpack" in expert_ids

        advanced_routes = get_trail_run_routes(difficulty="advanced")
        assert len(advanced_routes) >= 1
        assert all(r.technical_difficulty == "advanced" for r in advanced_routes)

        moderate_routes = get_trail_run_routes(difficulty="moderate")
        assert len(moderate_routes) >= 1
        assert all(r.technical_difficulty == "moderate" for r in moderate_routes)

    def test_get_route_by_id_valid(self):
        route = get_trail_run_route_by_id("timberline-trail-ultra")
        assert route is not None
        assert route.route_id == "timberline-trail-ultra"
        assert "Timberline" in route.name
        assert "Hood" in route.region or "Mount Hood" in route.region
        assert route.distance_miles == 41.5
        assert route.elevation_gain_ft == 9000

    def test_get_route_by_id_case_insensitive_and_alias(self):
        route = get_trail_run_route_by_id("TIMBERLINE-TRAIL-ULTRA")
        assert route is not None
        assert route.route_id == "timberline-trail-ultra"

        route_alias = get_trail_run_route_by_id("Enchantments Thru-Run")
        assert route_alias is not None
        assert route_alias.route_id == "enchantments-thru-run"

    def test_get_route_by_id_not_found(self):
        assert get_trail_run_route_by_id("non-existent-route") is None


class TestPacingCalculation:
    def test_calculate_pacing_standard(self):
        req = PacingCalculationRequest(
            route_id="timberline-trail-ultra",
            target_pace_min_mile=12.0,
            runner_weight_lbs=150.0,
            ambient_temp_f=65.0,
        )
        res = calculate_trail_run_pacing(req)
        assert isinstance(res, PacingCalculationResponse)
        assert res.route_id == "timberline-trail-ultra"
        assert "Timberline" in res.route_name
        assert res.estimated_time_hours > 0
        assert res.total_calories_kcal > 0
        assert 40 <= res.hourly_carbs_grams <= 100
        assert res.fluid_liters_total > 0
        assert res.electrolytes_mg_hourly >= 300
        assert res.hydration_vest_min_capacity_l >= 5.0
        assert len(res.pacing_splits) >= 3

    def test_calculate_pacing_temp_and_weight_sensitivity(self):
        cool_req = PacingCalculationRequest(
            route_id="enchantments-thru-run",
            target_pace_min_mile=11.0,
            runner_weight_lbs=140.0,
            ambient_temp_f=55.0,
        )
        hot_heavy_req = PacingCalculationRequest(
            route_id="enchantments-thru-run",
            target_pace_min_mile=11.0,
            runner_weight_lbs=180.0,
            ambient_temp_f=85.0,
        )
        cool_res = calculate_trail_run_pacing(cool_req)
        hot_heavy_res = calculate_trail_run_pacing(hot_heavy_req)

        assert hot_heavy_res.total_calories_kcal > cool_res.total_calories_kcal
        assert hot_heavy_res.fluid_liters_total > cool_res.fluid_liters_total
        assert hot_heavy_res.electrolytes_mg_hourly > cool_res.electrolytes_mg_hourly

    def test_calculate_pacing_route_not_found(self):
        req = PacingCalculationRequest(route_id="fake-ultra-trail")
        with pytest.raises(ValueError, match="Route .*fake-ultra-trail.* not found"):
            calculate_trail_run_pacing(req)


class TestMandatoryGearRequirements:
    def test_mandatory_gear_list(self):
        gear = get_mandatory_gear_requirements()
        assert len(gear) == 6
        item_ids = {g.item_id for g in gear}
        expected_items = {
            "hydration-vest",
            "emergency-bivy",
            "microspikes",
            "waterproof-shell",
            "headlamp",
            "filtration-flask",
        }
        assert item_ids == expected_items
        for g in gear:
            assert isinstance(g, MandatoryGearRequirement)
            assert g.item_id
            assert g.name
            assert g.mandatory is True
            assert g.category
            assert g.purpose


class TestIntentDetection:
    def test_detect_routes_list_intent(self):
        query = "What are the best mountain ultra routes for trail running?"
        intent = detect_trail_running_intent(query)
        assert intent is not None
        assert intent.action == "routes_list"

    def test_detect_route_detail_intent(self):
        query = "Give me details and shoe drop recommendations for the Timberline Trail ultra run"
        intent = detect_trail_running_intent(query)
        assert intent is not None
        assert intent.action == "route_detail"
        assert intent.route_id == "timberline-trail-ultra"

    def test_detect_fastpack_route_intent(self):
        query = "Can you show me route info for the Wonderland trail fastpack?"
        intent = detect_trail_running_intent(query)
        assert intent is not None
        assert intent.action == "route_detail"
        assert intent.route_id == "wonderland-trail-fastpack"

    def test_detect_pacing_calc_intent(self):
        query = "Calculate my ultra pacing and running calories for a mountain run"
        intent = detect_trail_running_intent(query)
        assert intent is not None
        assert intent.action == "pacing_calc"

    def test_detect_gear_compliance_intent(self):
        query = "What is the mandatory mountain ultra gear compliance kit for an ultra run?"
        intent = detect_trail_running_intent(query)
        assert intent is not None
        assert intent.action == "gear_compliance"

    def test_disambiguate_generic_hiking_trail_conditions(self):
        assert detect_trail_running_intent("What are the conditions on Rattlesnake Ridge?") is None
        assert detect_trail_running_intent("hiking trail recommendation") is None
        assert detect_trail_running_intent("Can you suggest a family day hike in Seattle?") is None
        assert detect_trail_running_intent("What should I wear for a hike on Mount Olympus?") is None
        assert detect_trail_running_intent("Backpacking permits for the Enchantments core zone") is None

    def test_disambiguate_trail_running_explicit_keywords(self):
        assert detect_trail_running_intent("What trail running shoes should I wear for an ultra?") is not None
        assert detect_trail_running_intent("What running hydration vest capacity do I need for a thru-run?") is not None
        assert detect_trail_running_intent("ultramarathon fueling and hydration guidelines") is not None


class TestPromptAndResponseFormatting:
    def test_build_prompt_routes_list(self):
        intent = TrailRunningIntent(action="routes_list")
        prompt = build_trail_running_prompt(intent)
        assert "Contoso Outdoors Mountain Ultra & Trail Running Advisory Grounding" in prompt
        assert "timberline-trail-ultra" in prompt
        assert "enchantments-thru-run" in prompt

    def test_build_prompt_route_detail(self):
        intent = TrailRunningIntent(action="route_detail", route_id="timberline-trail-ultra")
        prompt = build_trail_running_prompt(intent)
        assert "Timberline Trail Ultra" in prompt
        assert "41.5" in prompt
        assert "Lug Depth" in prompt or "lug_depth" in prompt.lower()

    def test_build_prompt_gear(self):
        intent = TrailRunningIntent(action="gear_compliance")
        prompt = build_trail_running_prompt(intent)
        assert "Mandatory Mountain Ultra Gear Compliance" in prompt
        assert "emergency-bivy" in prompt
        assert "filtration-flask" in prompt

    def test_format_response_routes_list(self):
        intent = TrailRunningIntent(action="routes_list")
        resp = format_trail_running_response(intent)
        assert "answer" in resp
        assert "trail_running_info" in resp
        info = resp["trail_running_info"]
        assert info["action"] == "routes_list"
        assert len(info["routes"]) == 5

    def test_format_response_route_detail(self):
        intent = TrailRunningIntent(action="route_detail", route_id="enchantments-thru-run")
        resp = format_trail_running_response(intent)
        assert "answer" in resp
        assert "Enchantments" in resp["answer"]
        info = resp["trail_running_info"]
        assert info["action"] == "route_detail"
        assert info["route"]["route_id"] == "enchantments-thru-run"

    def test_format_response_pacing_calc(self):
        intent = TrailRunningIntent(action="pacing_calc", route_id="timberline-trail-ultra")
        resp = format_trail_running_response(intent)
        assert "answer" in resp
        assert "calories" in resp["answer"].lower()
        info = resp["trail_running_info"]
        assert info["action"] == "pacing_calc"
        assert "pacing" in info
        assert info["pacing"]["route_id"] == "timberline-trail-ultra"

    def test_format_response_gear_compliance(self):
        intent = TrailRunningIntent(action="gear_compliance")
        resp = format_trail_running_response(intent)
        assert "answer" in resp
        assert "mandatory" in resp["answer"].lower()
        info = resp["trail_running_info"]
        assert info["action"] == "gear_compliance"
        assert len(info["mandatory_gear"]) == 6
