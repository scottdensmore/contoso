import pytest
from contoso_chat.hot_springs import (
    HotSpringGearRequirement,
    HotSpringIntent,
    HotSpringModel,
    SoakingPlanRequest,
    SoakingPlanResponse,
    build_hot_spring_prompt,
    calculate_soaking_plan,
    detect_hot_spring_intent,
    format_hot_spring_response,
    get_hot_spring_by_id,
    get_hot_spring_gear,
    get_hot_springs,
)


class TestHotSpringsCatalog:
    def test_get_all_springs(self):
        springs = get_hot_springs()
        assert len(springs) == 5
        spring_ids = {s.spring_id for s in springs}
        expected_ids = {
            "scenic-hot-springs",
            "goldmyer-hot-springs",
            "bagby-hot-springs",
            "travertine-hot-springs",
            "kirkham-hot-springs",
        }
        assert spring_ids == expected_ids

    def test_spring_model_fields(self):
        springs = get_hot_springs()
        for s in springs:
            assert isinstance(s, HotSpringModel)
            assert s.spring_id
            assert s.name
            assert s.region
            assert s.state in ("WA", "OR", "CA", "ID")
            assert 95 <= s.temperature_f <= 130
            assert s.pool_type
            assert s.mineral_profile
            assert s.access_difficulty in (
                "easy_walk",
                "moderate_hike",
                "rugged_backcountry",
                "river_fording",
                "snowshoe_winter",
            )
            assert s.hike_distance_miles >= 0
            assert s.elevation_gain_ft >= 0
            assert isinstance(s.clothing_optional, bool)
            assert isinstance(s.fee_required, bool)
            assert isinstance(s.winter_access, bool)
            assert s.description
            assert len(s.leave_no_trace_rules) >= 2

    def test_filter_by_access_and_state(self):
        # Access filter
        easy_springs = get_hot_springs(access="easy_walk")
        assert len(easy_springs) == 3
        assert all(s.access_difficulty == "easy_walk" for s in easy_springs)

        mod_springs = get_hot_springs(access="moderate_hike")
        assert len(mod_springs) == 1
        assert mod_springs[0].spring_id == "scenic-hot-springs"

        rugged_springs = get_hot_springs(access="rugged_backcountry")
        assert len(rugged_springs) == 1
        assert rugged_springs[0].spring_id == "goldmyer-hot-springs"

        # State filter
        wa_springs = get_hot_springs(state="WA")
        assert len(wa_springs) == 2
        wa_ids = {s.spring_id for s in wa_springs}
        assert wa_ids == {"scenic-hot-springs", "goldmyer-hot-springs"}

        or_springs = get_hot_springs(state="OR")
        assert len(or_springs) == 1
        assert or_springs[0].spring_id == "bagby-hot-springs"

        ca_springs = get_hot_springs(state="CA")
        assert len(ca_springs) == 1
        assert ca_springs[0].spring_id == "travertine-hot-springs"

        id_springs = get_hot_springs(state="ID")
        assert len(id_springs) == 1
        assert id_springs[0].spring_id == "kirkham-hot-springs"

        # Combined filter
        combined = get_hot_springs(access="easy_walk", state="OR")
        assert len(combined) == 1
        assert combined[0].spring_id == "bagby-hot-springs"

    def test_get_spring_by_id_valid(self):
        spring = get_hot_spring_by_id("scenic-hot-springs")
        assert spring is not None
        assert spring.name == "Scenic Hot Springs"
        assert spring.state == "WA"
        assert spring.temperature_f == 104
        assert spring.clothing_optional is True
        assert spring.winter_access is True

    def test_get_spring_by_id_case_insensitive_and_alias(self):
        s1 = get_hot_spring_by_id("SCENIC-HOT-SPRINGS")
        assert s1 is not None
        assert s1.spring_id == "scenic-hot-springs"

        s2 = get_hot_spring_by_id("Goldmyer Hot Springs")
        assert s2 is not None
        assert s2.spring_id == "goldmyer-hot-springs"

        s3 = get_hot_spring_by_id("Bagby")
        assert s3 is not None
        assert s3.spring_id == "bagby-hot-springs"

        s4 = get_hot_spring_by_id("travertine")
        assert s4 is not None
        assert s4.spring_id == "travertine-hot-springs"

        s5 = get_hot_spring_by_id("kirkham")
        assert s5 is not None
        assert s5.spring_id == "kirkham-hot-springs"

    def test_get_spring_by_id_not_found(self):
        assert get_hot_spring_by_id("non-existent-spring") is None


class TestHotSpringGear:
    def test_get_hot_spring_gear(self):
        gear = get_hot_spring_gear()
        assert len(gear) == 6
        item_ids = {g.item_id for g in gear}
        expected_ids = {
            "gear-booties",
            "gear-towel",
            "gear-hydration",
            "gear-dry-bag",
            "gear-headlamp",
            "gear-waste-bags",
        }
        assert item_ids == expected_ids
        for g in gear:
            assert isinstance(g, HotSpringGearRequirement)
            assert g.mandatory is True
            assert g.category in ("footwear", "thermal", "hydration", "pack_in", "hygiene")
            assert g.purpose


class TestSoakingPlanCalculation:
    def test_calculate_soaking_plan_standard(self):
        req = SoakingPlanRequest(
            spring_id="scenic-hot-springs",
            party_size=2,
            season="summer",
            soak_duration_minutes=30,
        )
        plan = calculate_soaking_plan(req)
        assert isinstance(plan, SoakingPlanResponse)
        assert plan.spring_id == "scenic-hot-springs"
        assert plan.spring_name == "Scenic Hot Springs"
        assert plan.temperature_f == 104
        assert plan.safe_max_session_minutes == 30
        assert plan.hydration_liters_required >= 2.0
        assert plan.electrolytes_recommended_mg > 0
        assert len(plan.ethics_rules) >= 3

    def test_calculate_soaking_plan_high_temp_goldmyer(self):
        # 111 deg F limits session to 20 mins
        req = SoakingPlanRequest(
            spring_id="goldmyer-hot-springs",
            party_size=2,
            season="summer",
            soak_duration_minutes=45,
        )
        plan = calculate_soaking_plan(req)
        assert plan.temperature_f == 111
        assert plan.safe_max_session_minutes == 20
        # Hazards should include extreme temp warning, duration exceeding safe limit, and rugged backcountry
        assert any("extreme water temperature" in h.lower() for h in plan.hazards)
        assert any("exceeds safe single session limit" in h.lower() for h in plan.hazards)
        assert any("remote backcountry wilderness" in h.lower() for h in plan.hazards)

    def test_calculate_soaking_plan_extreme_temp_bagby(self):
        # 120 deg F limits session to 15 mins
        req = SoakingPlanRequest(
            spring_id="bagby-hot-springs",
            party_size=1,
            season="summer",
            soak_duration_minutes=15,
        )
        plan = calculate_soaking_plan(req)
        assert plan.temperature_f == 120
        assert plan.safe_max_session_minutes == 15

    def test_calculate_soaking_plan_winter_hazards(self):
        req = SoakingPlanRequest(
            spring_id="scenic-hot-springs",
            party_size=3,
            season="winter",
            soak_duration_minutes=25,
        )
        plan = calculate_soaking_plan(req)
        assert any("hypothermia" in h.lower() for h in plan.hazards)
        assert plan.hydration_liters_required >= 3.0

    def test_calculate_soaking_plan_party_size_scaling(self):
        plan1 = calculate_soaking_plan(
            SoakingPlanRequest(spring_id="scenic-hot-springs", party_size=2, soak_duration_minutes=30)
        )
        plan2 = calculate_soaking_plan(
            SoakingPlanRequest(spring_id="scenic-hot-springs", party_size=4, soak_duration_minutes=30)
        )
        assert plan2.hydration_liters_required > plan1.hydration_liters_required
        assert plan2.electrolytes_recommended_mg > plan1.electrolytes_recommended_mg

    def test_calculate_soaking_plan_not_found(self):
        with pytest.raises(ValueError, match="not found"):
            calculate_soaking_plan(SoakingPlanRequest(spring_id="unknown-spring"))


class TestDetectHotSpringIntent:
    def test_detect_springs_list(self):
        intent = detect_hot_spring_intent("What backcountry hot springs are there in Washington?")
        assert intent is not None
        assert intent.action == "springs_list"
        assert intent.state == "WA"

        intent2 = detect_hot_spring_intent("Show me easy walk geothermal pools in Oregon")
        assert intent2 is not None
        assert intent2.action == "springs_list"
        assert intent2.state == "OR"
        assert intent2.access_difficulty == "easy_walk"

    def test_detect_spring_detail(self):
        intent = detect_hot_spring_intent("Tell me about Scenic Hot Springs and how to get there")
        assert intent is not None
        assert intent.action == "spring_detail"
        assert intent.spring_id == "scenic-hot-springs"

        intent2 = detect_hot_spring_intent("Is Goldmyer Hot Springs accessible in the winter?")
        assert intent2 is not None
        assert intent2.action in ("spring_detail", "soaking_plan")
        assert intent2.spring_id == "goldmyer-hot-springs"

        intent3 = detect_hot_spring_intent("What are the permits for Bagby Hot Springs?")
        assert intent3 is not None
        assert intent3.action in ("spring_detail", "gear_ethics")
        assert intent3.spring_id == "bagby-hot-springs"

        intent4 = detect_hot_spring_intent("Tell me about Kirkham Hot Springs")
        assert intent4 is not None
        assert intent4.action == "spring_detail"
        assert intent4.spring_id == "kirkham-hot-springs"

        intent5 = detect_hot_spring_intent("What is Travertine Hot Springs pool type?")
        assert intent5 is not None
        assert intent5.action == "spring_detail"
        assert intent5.spring_id == "travertine-hot-springs"

    def test_detect_soaking_plan(self):
        intent = detect_hot_spring_intent("Can you calculate a soaking plan for Goldmyer Hot Springs?")
        assert intent is not None
        assert intent.action == "soaking_plan"
        assert intent.spring_id == "goldmyer-hot-springs"

        intent2 = detect_hot_spring_intent("What is safe soaking session duration and hydration for hot springs?")
        assert intent2 is not None
        assert intent2.action == "soaking_plan"

        intent3 = detect_hot_spring_intent("Scenic Hot Springs temperature safety and soak duration")
        assert intent3 is not None
        assert intent3.action == "soaking_plan"
        assert intent3.spring_id == "scenic-hot-springs"

    def test_detect_gear_and_ethics(self):
        intent = detect_hot_spring_intent("What mandatory gear do I need for backcountry hot springs?")
        assert intent is not None
        assert intent.action == "gear_ethics"

        intent2 = detect_hot_spring_intent("What are the Leave No Trace soaking ethics and clothing optional etiquette?")
        assert intent2 is not None
        assert intent2.action == "gear_ethics"

    def test_disambiguation_generic_queries(self):
        # General water filtration / sources queries must NOT be hijacked
        assert detect_hot_spring_intent("Where can I get water on the Colchuck Lake trail?") is None
        assert detect_hot_spring_intent("Does a Sawyer Squeeze kill cryptosporidium or viruses?") is None
        assert detect_hot_spring_intent("How much water should I carry for a 10 mile hike with 3000 ft gain?") is None
        assert detect_hot_spring_intent("Tell me about water purification and giardia") is None

        # Fire safety must NOT be hijacked
        assert detect_hot_spring_intent("Can I have a campfire at Lake Wenatchee?") is None
        assert detect_hot_spring_intent("What are the campfire restrictions in Okanogan-Wenatchee?") is None

        # Weather / general trail queries must NOT be hijacked
        assert detect_hot_spring_intent("What is the weather forecast for Mount Rainier?") is None
        assert detect_hot_spring_intent("What are the best hiking trails near Seattle?") is None

        # Product / store inquiries must NOT be hijacked
        assert detect_hot_spring_intent("Do you sell waterproof hiking boots in size 11?") is None
        assert detect_hot_spring_intent("What is the return policy on tents?") is None

        # Empty and non-string inputs
        assert detect_hot_spring_intent("") is None
        assert detect_hot_spring_intent("   ") is None
        assert detect_hot_spring_intent(None) is None


class TestBuildPromptAndFormatResponse:
    def test_build_hot_spring_prompt_spring_detail(self):
        intent = HotSpringIntent(action="spring_detail", spring_id="scenic-hot-springs")
        prompt = build_hot_spring_prompt(intent)
        assert "Scenic Hot Springs" in prompt
        assert "104" in prompt
        assert "Leave No Trace" in prompt
        assert "Mandatory" in prompt

    def test_build_hot_spring_prompt_catalog(self):
        intent = HotSpringIntent(action="springs_list", state="WA")
        prompt = build_hot_spring_prompt(intent)
        assert "Scenic Hot Springs" in prompt
        assert "Goldmyer Hot Springs" in prompt

    def test_format_hot_spring_response_gear_ethics(self):
        intent = HotSpringIntent(action="gear_ethics")
        res = format_hot_spring_response(intent)
        assert "answer" in res
        assert "hot_springs_info" in res
        info = res["hot_springs_info"]
        assert info["action"] == "gear_ethics"
        assert len(info["mandatory_gear"]) == 6
        assert len(info["ethics_rules"]) >= 3

    def test_format_hot_spring_response_soaking_plan(self):
        intent = HotSpringIntent(action="soaking_plan", spring_id="scenic-hot-springs")
        res = format_hot_spring_response(intent)
        assert "answer" in res
        assert "hot_springs_info" in res
        info = res["hot_springs_info"]
        assert info["action"] == "soaking_plan"
        assert info["spring_id"] == "scenic-hot-springs"
        assert "soaking_plan" in info

    def test_format_hot_spring_response_spring_detail(self):
        intent = HotSpringIntent(action="spring_detail", spring_id="scenic-hot-springs")
        res = format_hot_spring_response(intent)
        assert "answer" in res
        assert "hot_springs_info" in res
        info = res["hot_springs_info"]
        assert info["action"] == "spring_detail"
        assert info["spring"]["name"] == "Scenic Hot Springs"

    def test_format_hot_spring_response_springs_list(self):
        intent = HotSpringIntent(action="springs_list")
        res = format_hot_spring_response(intent)
        assert "answer" in res
        assert "hot_springs_info" in res
        info = res["hot_springs_info"]
        assert info["action"] == "springs_list"
        assert len(info["springs"]) == 5
