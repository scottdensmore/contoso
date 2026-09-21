import pytest
from contoso_chat.sea_kayaking import (
    SeaKayakGearRequirement,
    SeaKayakingIntent,
    SeaKayakRouteModel,
    TidePlanRequest,
    TidePlanResponse,
    build_sea_kayaking_prompt,
    calculate_tide_plan,
    detect_sea_kayaking_intent,
    format_sea_kayaking_response,
    get_sea_kayak_gear,
    get_sea_kayak_route_by_id,
    get_sea_kayak_routes,
)


class TestSeaKayakCatalog:
    def test_get_all_routes(self):
        routes = get_sea_kayak_routes()
        assert len(routes) == 5
        route_ids = {r.route_id for r in routes}
        assert route_ids == {
            "san-juan-islands-crossing",
            "prince-william-sound-fjords",
            "maine-island-trail-passage",
            "apostle-islands-sea-caves",
            "haida-gwaii-gwaii-haanas",
        }

    def test_filter_routes_by_water_grade(self):
        grade_iii = get_sea_kayak_routes(water_grade="grade_iii")
        assert len(grade_iii) >= 1
        iii_ids = {r.route_id for r in grade_iii}
        assert "san-juan-islands-crossing" in iii_ids

        grade_iv = get_sea_kayak_routes(water_grade="grade_iv")
        assert len(grade_iv) == 2
        iv_ids = {r.route_id for r in grade_iv}
        assert "prince-william-sound-fjords" in iv_ids
        assert "haida-gwaii-gwaii-haanas" in iv_ids

        grade_ii = get_sea_kayak_routes(water_grade="grade_ii")
        assert len(grade_ii) == 2
        ii_ids = {r.route_id for r in grade_ii}
        assert "maine-island-trail-passage" in ii_ids
        assert "apostle-islands-sea-caves" in ii_ids

    def test_get_route_by_id(self):
        route = get_sea_kayak_route_by_id("san-juan-islands-crossing")
        assert route is not None
        assert isinstance(route, SeaKayakRouteModel)
        assert route.route_id == "san-juan-islands-crossing"
        assert "San Juan" in route.title
        assert route.distance_nm > 0
        assert route.typical_duration_days >= 1
        assert route.water_grade == "grade_iii"
        assert route.current_risk in ("moderate", "high", "extreme")
        assert route.max_current_knots > 0
        assert route.open_crossing_miles > 0
        assert route.recommended_kayak_length_ft in (16, 17)
        assert route.drysuit_mandatory is True
        assert len(route.highlights) >= 2
        assert len(route.description) > 20

    def test_get_route_case_insensitive_and_unknown(self):
        route = get_sea_kayak_route_by_id("SAN-JUAN-ISLANDS-CROSSING")
        assert route is not None
        assert route.route_id == "san-juan-islands-crossing"

        assert get_sea_kayak_route_by_id("unknown-ocean-route") is None

    def test_get_sea_kayak_gear(self):
        gear = get_sea_kayak_gear()
        assert len(gear) == 6
        assert all(isinstance(g, SeaKayakGearRequirement) for g in gear)
        assert all(g.mandatory is True for g in gear)
        item_ids = {g.item_id for g in gear}
        expected_ids = {
            "paddling-drysuit",
            "neoprene-spray-skirt",
            "paddle-float",
            "bilge-pump",
            "type-iii-v-pfd",
            "marine-vhf-radio",
        }
        assert item_ids == expected_ids


class TestTidePlanCalculation:
    def test_calculate_tide_plan_intermediate_normal(self):
        req = TidePlanRequest(
            route_id="san-juan-islands-crossing",
            paddler_skill_level="intermediate",
            current_speed_knots=2.5,
            wind_speed_knots=12.0,
            crossing_window_hours=2.0,
        )
        res = calculate_tide_plan(req)
        assert isinstance(res, TidePlanResponse)
        assert res.route_id == "san-juan-islands-crossing"
        assert "San Juan" in res.route_title
        assert res.ferry_angle_degrees > 0
        assert res.effective_speed_knots > 0
        assert res.drysuit_required is True
        assert res.vhf_channel == 16
        assert res.crossing_safety_status in ("safe", "caution", "optimal")
        assert "slack" in res.departure_timing.lower()
        assert len(res.safety_advisory) > 20

    def test_calculate_tide_plan_hazardous_conditions(self):
        req = TidePlanRequest(
            route_id="san-juan-islands-crossing",
            paddler_skill_level="beginner",
            current_speed_knots=4.5,
            wind_speed_knots=25.0,
            crossing_window_hours=1.5,
        )
        res = calculate_tide_plan(req)
        assert res.crossing_safety_status in ("hazardous", "unsafe")
        assert "hazardous" in res.safety_advisory.lower() or "caution" in res.safety_advisory.lower()

    def test_calculate_tide_plan_optimal_slack_conditions(self):
        req = TidePlanRequest(
            route_id="maine-island-trail-passage",
            paddler_skill_level="expert",
            current_speed_knots=0.8,
            wind_speed_knots=6.0,
            crossing_window_hours=3.0,
        )
        res = calculate_tide_plan(req)
        assert res.crossing_safety_status in ("safe", "optimal")
        assert res.ferry_angle_degrees < 20

    def test_calculate_tide_plan_unknown_route(self):
        req = TidePlanRequest(route_id="nonexistent-route")
        with pytest.raises(ValueError, match="not found"):
            calculate_tide_plan(req)


class TestSeaKayakingIntentDetection:
    def test_detect_routes_list_intent(self):
        intent = detect_sea_kayaking_intent(
            "What coastal sea kayaking routes and expeditions do you offer?"
        )
        assert intent is not None
        assert intent.action == "routes_list"

    def test_detect_route_detail_intent(self):
        intent = detect_sea_kayaking_intent(
            "Tell me about the San Juan Islands crossing sea kayak expedition"
        )
        assert intent is not None
        assert intent.action == "route_detail"
        assert intent.route_id == "san-juan-islands-crossing"

    def test_detect_tide_plan_intent(self):
        intent = detect_sea_kayaking_intent(
            "Calculate tidal current ferry angle and slack water tide plan for San Juan Islands crossing"
        )
        assert intent is not None
        assert intent.action == "tide_plan"
        assert intent.route_id == "san-juan-islands-crossing"

    def test_detect_gear_checklist_intent(self):
        intent = detect_sea_kayaking_intent(
            "What immersion gear, paddle float, and bilge pump do I need for sea kayaking?"
        )
        assert intent is not None
        assert intent.action == "gear_checklist"

    def test_detect_intent_other_routes(self):
        intent_pws = detect_sea_kayaking_intent("Tell me about Prince William Sound kayak fjords")
        assert intent_pws is not None
        assert intent_pws.route_id == "prince-william-sound-fjords"

        intent_maine = detect_sea_kayaking_intent("How long is the Maine Island Trail passage sea kayak trip?")
        assert intent_maine is not None
        assert intent_maine.route_id == "maine-island-trail-passage"

        intent_apostle = detect_sea_kayaking_intent("Can I paddle the Apostle Islands kayak sea caves?")
        assert intent_apostle is not None
        assert intent_apostle.route_id == "apostle-islands-sea-caves"

        intent_gwaii = detect_sea_kayaking_intent("What is the water grade for Gwaii Haanas kayak expedition?")
        assert intent_gwaii is not None
        assert intent_gwaii.route_id == "haida-gwaii-gwaii-haanas"

    def test_detect_intent_keywords(self):
        assert detect_sea_kayaking_intent("marine vhf Channel 16 protocol") is not None
        assert detect_sea_kayaking_intent("sea kayak bilge pump requirements") is not None
        assert detect_sea_kayaking_intent("dry suit paddling gear") is not None

    def test_disambiguation_whitewater_not_hijacked(self):
        assert (
            detect_sea_kayaking_intent(
                "Can an intermediate paddler safely kayak Skykomish Boulder Drop right now?"
            )
            is None
        )
        assert (
            detect_sea_kayaking_intent(
                "What whitewater river runs do you recommend in Washington?"
            )
            is None
        )
        assert (
            detect_sea_kayaking_intent(
                "Tell me about the Tumwater Canyon run on the Wenatchee River"
            )
            is None
        )

    def test_disambiguation_adventures_and_unrelated(self):
        assert detect_sea_kayaking_intent("What beginner rock climbing clinics do you offer?") is None
        assert (
            detect_sea_kayaking_intent(
                "Do I need previous experience for glacier travel on Mount Rainier?"
            )
            is None
        )
        assert detect_sea_kayaking_intent("Can I return my climbing shoes?") is None
        assert detect_sea_kayaking_intent("What is the best water filter for backpacking?") is None
        assert detect_sea_kayaking_intent("Where can I book an alpine hut in San Juan Mountains?") is None


class TestSeaKayakingPromptAndFormatting:
    def test_build_prompt_with_route(self):
        intent = SeaKayakingIntent(action="route_detail", route_id="san-juan-islands-crossing")
        prompt = build_sea_kayaking_prompt(intent)
        assert "San Juan Islands" in prompt
        assert "Marine Safety Protocols" in prompt
        assert "VHF Channel 16" in prompt or "Channel 16" in prompt

    def test_build_prompt_general(self):
        intent = SeaKayakingIntent(action="routes_list")
        prompt = build_sea_kayaking_prompt(intent)
        assert "Coastal Sea Kayaking" in prompt
        assert "Rosario Strait" in prompt or "San Juan" in prompt

    def test_format_tide_plan_response(self):
        intent = SeaKayakingIntent(action="tide_plan", route_id="san-juan-islands-crossing")
        res = format_sea_kayaking_response(intent)
        assert "answer" in res
        assert "sea_kayaking_info" in res
        info = res["sea_kayaking_info"]
        assert info["action"] == "tide_plan"
        assert "tide_plan" in info
        assert info["tide_plan"]["route_id"] == "san-juan-islands-crossing"
        assert info["tide_plan"]["vhf_channel"] == 16

    def test_format_gear_checklist_response(self):
        intent = SeaKayakingIntent(action="gear_checklist")
        res = format_sea_kayaking_response(intent)
        assert "sea_kayaking_info" in res
        info = res["sea_kayaking_info"]
        assert info["action"] == "gear_checklist"
        assert len(info["gear"]) == 6
        assert "drysuit" in res["answer"].lower()

    def test_format_route_detail_response(self):
        intent = SeaKayakingIntent(action="route_detail", route_id="prince-william-sound-fjords")
        res = format_sea_kayaking_response(intent)
        assert "sea_kayaking_info" in res
        info = res["sea_kayaking_info"]
        assert info["action"] == "route_detail"
        assert info["route"]["route_id"] == "prince-william-sound-fjords"
        assert "Prince William Sound" in res["answer"]

    def test_format_routes_list_response(self):
        intent = SeaKayakingIntent(action="routes_list")
        res = format_sea_kayaking_response(intent)
        assert "sea_kayaking_info" in res
        info = res["sea_kayaking_info"]
        assert info["action"] == "routes_list"
        assert len(info["routes"]) == 5
