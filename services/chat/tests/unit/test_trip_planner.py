from contoso_chat.trip_planner import (
    ChecklistItemModel,
    TripPlannerIntent,
    TripPlanParametersModel,
    TripPlanResultModel,
    build_trip_planner_prompt,
    detect_trip_planner_intent,
    format_trip_planner_response,
    generate_wilderness_trip_plan,
    get_trip_templates,
)


class TestTripPlannerModels:
    def test_parameters_model_defaults(self):
        params = TripPlanParametersModel(
            duration_days=3,
            group_size=2,
            climate="cold",
        )
        assert params.duration_days == 3
        assert params.group_size == 2
        assert params.climate == "cold"
        assert params.trip_type is not None

    def test_checklist_item_model(self):
        item = ChecklistItemModel(
            item_id="headlamp",
            name="LED Headlamp",
            category="Ten Essentials",
            essential=True,
            weight_grams=90,
            notes="Includes extra batteries",
        )
        assert item.item_id == "headlamp"
        assert item.weight_grams == 90
        assert item.essential is True

    def test_trip_plan_result_model(self):
        item = ChecklistItemModel(
            item_id="headlamp",
            name="LED Headlamp",
            category="Ten Essentials",
            essential=True,
            weight_grams=90,
        )
        result = TripPlanResultModel(
            trip_title="3-Day Cold Expedition",
            duration_days=3,
            group_size=2,
            total_calories_kcal=20400,
            daily_calories_per_person=3400,
            daily_water_liters_per_person=3.0,
            total_water_capacity_liters=6.0,
            estimated_base_weight_kg=7.5,
            checklist=[item],
        )
        assert result.total_calories_kcal == 20400
        assert len(result.checklist) == 1


class TestTripPlanCalculations:
    def test_calories_moderate_climate(self):
        params = TripPlanParametersModel(
            duration_days=2,
            group_size=1,
            climate="moderate",
        )
        plan = generate_wilderness_trip_plan(params)
        assert plan.daily_calories_per_person == 3000
        assert plan.total_calories_kcal == 6000

    def test_calories_cold_climate(self):
        params = TripPlanParametersModel(
            duration_days=3,
            group_size=2,
            climate="cold",
        )
        plan = generate_wilderness_trip_plan(params)
        assert plan.daily_calories_per_person == 3400
        assert plan.total_calories_kcal == 20400

    def test_calories_subzero_snow_climate(self):
        params = TripPlanParametersModel(
            duration_days=4,
            group_size=2,
            climate="subzero snow",
        )
        plan = generate_wilderness_trip_plan(params)
        assert plan.daily_calories_per_person == 3800
        assert plan.total_calories_kcal == 30400

    def test_water_moderate_forest(self):
        params = TripPlanParametersModel(
            duration_days=2,
            group_size=2,
            climate="moderate",
            terrain="forest",
        )
        plan = generate_wilderness_trip_plan(params)
        assert plan.daily_water_liters_per_person == 3.0
        assert plan.total_water_capacity_liters == 6.0

    def test_water_desert_and_alpine(self):
        desert_params = TripPlanParametersModel(
            duration_days=2,
            group_size=2,
            climate="desert",
        )
        desert_plan = generate_wilderness_trip_plan(desert_params)
        assert desert_plan.daily_water_liters_per_person == 4.5
        assert desert_plan.total_water_capacity_liters == 9.0

        alpine_params = TripPlanParametersModel(
            duration_days=1,
            group_size=1,
            climate="alpine",
        )
        alpine_plan = generate_wilderness_trip_plan(alpine_params)
        assert alpine_plan.daily_water_liters_per_person == 4.5
        assert alpine_plan.total_water_capacity_liters == 4.5

    def test_checklist_includes_ten_essentials(self):
        params = TripPlanParametersModel(
            duration_days=2,
            group_size=1,
            climate="moderate",
        )
        plan = generate_wilderness_trip_plan(params)
        names = [item.name.lower() for item in plan.checklist]
        all_text = " ".join(names)
        assert "navigation" in all_text or "map" in all_text
        assert "headlamp" in all_text
        assert "first aid" in all_text
        assert "knife" in all_text or "multi-tool" in all_text
        assert "fire starter" in all_text or "matches" in all_text
        assert "bivvy" in all_text or "tarp" in all_text
        assert "extra food" in all_text
        assert "extra layers" in all_text
        assert "sun protection" in all_text or "sunscreen" in all_text
        assert "filtration" in all_text or "filter" in all_text
        assert "stove" in all_text

    def test_checklist_cold_winter_gear(self):
        params = TripPlanParametersModel(
            duration_days=3,
            group_size=2,
            climate="cold",
        )
        plan = generate_wilderness_trip_plan(params)
        items_text = " ".join(item.name.lower() for item in plan.checklist)
        assert "4-season" in items_text
        assert "microspikes" in items_text or "crampons" in items_text
        assert "subzero" in items_text or "cold-weather" in items_text or "0°f" in items_text

    def test_checklist_desert_gear(self):
        params = TripPlanParametersModel(
            duration_days=2,
            group_size=1,
            climate="desert",
        )
        plan = generate_wilderness_trip_plan(params)
        items_text = " ".join(item.name.lower() for item in plan.checklist)
        assert "hydration" in items_text or "reservoir" in items_text
        assert "electrolyte" in items_text or "salts" in items_text
        assert "sun hat" in items_text or "cape" in items_text

    def test_base_weight_calculated(self):
        params = TripPlanParametersModel(
            duration_days=3,
            group_size=2,
            climate="cold",
        )
        plan = generate_wilderness_trip_plan(params)
        assert plan.estimated_base_weight_kg > 0
        expected_kg = round(sum(item.weight_grams for item in plan.checklist) / 1000.0, 1)
        assert plan.estimated_base_weight_kg == expected_kg


class TestTripTemplates:
    def test_get_trip_templates(self):
        templates = get_trip_templates()
        assert isinstance(templates, list)
        assert len(templates) >= 3
        template_ids = [t["id"] for t in templates]
        assert "weekend-backpacking" in template_ids
        for t in templates:
            assert "name" in t
            assert "duration_days" in t
            assert "group_size" in t
            assert "climate" in t
            assert "recommended_daily_calories" in t
            assert "recommended_daily_water_liters" in t


class TestDetectTripPlannerIntent:
    def test_detect_plan_intent(self):
        intent = detect_trip_planner_intent(
            "Plan a 3-day backpacking trip in the Cascades with packing list and calorie needs"
        )
        assert intent is not None
        assert intent.action == "plan"
        assert intent.duration_days == 3
        assert intent.trip_type == "backpacking"

    def test_detect_desert_water_gear_intent(self):
        intent = detect_trip_planner_intent("What water capacity and gear do I need for desert hiking?")
        assert intent is not None
        assert intent.climate == "desert"
        assert intent.action in ("nutrition", "checklist", "plan")

    def test_detect_ten_essentials_intent(self):
        intent = detect_trip_planner_intent("What are the Ten Essentials for wilderness hiking?")
        assert intent is not None
        assert intent.action == "essentials"

    def test_detect_calorie_needs_intent(self):
        intent = detect_trip_planner_intent("How many calories do I need for a 3-day cold weather trip for 2 people?")
        assert intent is not None
        assert intent.action in ("nutrition", "plan")
        assert intent.duration_days == 3
        assert intent.group_size == 2
        assert intent.climate == "cold"

    def test_detect_packing_checklist_intent(self):
        intent = detect_trip_planner_intent("Can you give me a packing checklist for a 4-day winter snow trip?")
        assert intent is not None
        assert intent.duration_days == 4
        assert intent.climate in ("subzero snow", "winter", "cold")

    def test_non_trip_planner_queries_return_none(self):
        assert detect_trip_planner_intent("What is the status of my order CTSO-12345?") is None
        assert detect_trip_planner_intent("What are your retail store hours?") is None
        assert detect_trip_planner_intent("Can you help me return my hiking boots?") is None
        assert detect_trip_planner_intent("") is None
        assert detect_trip_planner_intent("   ") is None


class TestPromptAndResponseFormatting:
    def test_build_trip_planner_prompt(self):
        intent = TripPlannerIntent(
            action="plan",
            duration_days=3,
            group_size=2,
            climate="cold",
            trip_type="backpacking",
        )
        prompt = build_trip_planner_prompt(intent)
        assert "Contoso Outdoors" in prompt
        assert "3400" in prompt or "20,400" in prompt or "20400" in prompt
        assert "Ten Essentials" in prompt

    def test_format_trip_planner_response(self):
        intent = TripPlannerIntent(
            action="plan",
            duration_days=3,
            group_size=2,
            climate="cold",
            trip_type="backpacking",
        )
        res = format_trip_planner_response(intent)
        assert "answer" in res
        assert "trip_planner_info" in res
        info = res["trip_planner_info"]
        assert info["total_calories_kcal"] == 20400
        assert info["daily_calories_per_person"] == 3400
        assert info["daily_water_liters_per_person"] == 3.0
        assert len(info["checklist"]) >= 10
        assert "3-day" in res["answer"].lower() or "3 day" in res["answer"].lower()
        assert "20,400" in res["answer"] or "20400" in res["answer"] or "3,400" in res["answer"]
