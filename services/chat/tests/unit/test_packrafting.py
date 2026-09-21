import pytest
from contoso_chat.packrafting import (
    PackraftGearRequirement,
    PackraftingIntent,
    PackraftPlanRequest,
    PackraftPlanResponse,
    PackraftRouteModel,
    build_packrafting_prompt,
    calculate_packraft_plan,
    detect_packrafting_intent,
    format_packrafting_response,
    get_packraft_gear,
    get_packraft_route_by_id,
    get_packraft_routes,
)


class TestPackraftRouteCatalog:
    def test_get_all_routes(self):
        routes = get_packraft_routes()
        assert len(routes) == 5
        route_ids = {r.route_id for r in routes}
        assert route_ids == {
            "frank-church-middle-fork-salmon",
            "bob-marshall-south-fork-flathead",
            "alaska-talkeetna-river-wilderness",
            "escalante-river-desert-canyon",
            "green-river-desolation-canyon",
        }

    def test_get_routes_filter_grade(self):
        grade_iv = get_packraft_routes(grade="class_iv_technical")
        assert len(grade_iv) == 1
        assert grade_iv[0].route_id == "alaska-talkeetna-river-wilderness"

        grade_ii = get_packraft_routes(grade="class_ii_mild")
        assert len(grade_ii) == 2
        ii_ids = {r.route_id for r in grade_ii}
        assert ii_ids == {
            "bob-marshall-south-fork-flathead",
            "green-river-desolation-canyon",
        }

        # Also test flexible / human-friendly grade filter
        grade_i = get_packraft_routes(grade="Class I")
        assert len(grade_i) == 1
        assert grade_i[0].route_id == "escalante-river-desert-canyon"

    def test_get_route_by_id(self):
        route = get_packraft_route_by_id("frank-church-middle-fork-salmon")
        assert route is not None
        assert isinstance(route, PackraftRouteModel)
        assert route.route_id == "frank-church-middle-fork-salmon"
        assert "Middle Fork Salmon" in route.river_name
        assert route.river_miles == 96.0
        assert route.portage_miles == 4.5
        assert route.river_grade == "class_iii_moderate"
        assert route.flow_status == "optimal"
        assert route.min_flow_cfs == 1200
        assert route.max_flow_cfs == 3500
        assert route.current_flow_cfs == 2100
        assert route.spraydeck_required is True
        assert len(route.portage_features) >= 2
        assert len(route.description) > 10

    def test_get_route_case_insensitive_and_unknown(self):
        route = get_packraft_route_by_id("FRANK-CHURCH-MIDDLE-FORK-SALMON")
        assert route is not None
        assert route.route_id == "frank-church-middle-fork-salmon"

        assert get_packraft_route_by_id("unknown-packraft-river-999") is None


class TestPackraftGearChecklist:
    def test_get_packraft_gear(self):
        gear = get_packraft_gear()
        assert len(gear) == 6
        for item in gear:
            assert isinstance(item, PackraftGearRequirement)
            assert item.item_id
            assert item.name
            assert item.category
            assert item.mandatory is True
            assert item.purpose

        item_ids = {g.item_id for g in gear}
        assert any("tizip" in i for i in item_ids)
        assert any("paddle" in i for i in item_ids)
        assert any("pfd" in i for i in item_ids)
        assert any("inflation" in i for i in item_ids)
        assert any("helmet" in i for i in item_ids)
        assert any("repair" in i for i in item_ids)


class TestPackraftPlanCalculations:
    def test_calculate_packraft_plan_navigable(self):
        req = PackraftPlanRequest(
            route_id="frank-church-middle-fork-salmon",
            paddler_skill="intermediate",
            flow_rate_cfs=2100,
            boat_capacity_kg=135.0,
            total_payload_kg=95.0,
        )
        res = calculate_packraft_plan(req)
        assert isinstance(res, PackraftPlanResponse)
        assert res.route_id == "frank-church-middle-fork-salmon"
        assert "Middle Fork Salmon" in res.river_and_section
        assert res.flow_feasibility == "navigable"
        assert res.recommended_spraydeck == "whitewater_deck"
        assert res.payload_margin_kg == 40.0
        assert 200 <= res.paddle_length_cm <= 225
        assert len(res.safety_advisory) > 20

    def test_calculate_packraft_plan_scrape_risk(self):
        req = PackraftPlanRequest(
            route_id="frank-church-middle-fork-salmon",
            flow_rate_cfs=800,  # min is 1200
        )
        res = calculate_packraft_plan(req)
        assert res.flow_feasibility == "scrape_risk"
        assert "scrape" in res.safety_advisory.lower() or "low" in res.safety_advisory.lower()

    def test_calculate_packraft_plan_hazardous_high(self):
        req = PackraftPlanRequest(
            route_id="frank-church-middle-fork-salmon",
            flow_rate_cfs=4500,  # max is 3500
        )
        res = calculate_packraft_plan(req)
        assert res.flow_feasibility == "hazardous_high"
        assert "high" in res.safety_advisory.lower() or "hazard" in res.safety_advisory.lower()

    def test_calculate_packraft_plan_spraydeck_recommendations(self):
        # Class I flatwater -> open_bucket
        req_class_i = PackraftPlanRequest(
            route_id="escalante-river-desert-canyon",
        )
        res_i = calculate_packraft_plan(req_class_i)
        assert res_i.recommended_spraydeck == "open_bucket"

        # Class II mild -> self_bailer
        req_class_ii = PackraftPlanRequest(
            route_id="green-river-desolation-canyon",
        )
        res_ii = calculate_packraft_plan(req_class_ii)
        assert res_ii.recommended_spraydeck == "self_bailer"

        # Class IV technical -> whitewater_deck
        req_class_iv = PackraftPlanRequest(
            route_id="alaska-talkeetna-river-wilderness",
        )
        res_iv = calculate_packraft_plan(req_class_iv)
        assert res_iv.recommended_spraydeck == "whitewater_deck"

    def test_calculate_packraft_plan_default_flow(self):
        req = PackraftPlanRequest(
            route_id="escalante-river-desert-canyon",
        )
        res = calculate_packraft_plan(req)
        # default current_flow_cfs is 85, within 50-300
        assert res.flow_feasibility == "navigable"
        assert res.payload_margin_kg == 40.0

    def test_calculate_packraft_plan_overloaded_payload(self):
        req = PackraftPlanRequest(
            route_id="green-river-desolation-canyon",
            boat_capacity_kg=120.0,
            total_payload_kg=130.0,
        )
        res = calculate_packraft_plan(req)
        assert res.payload_margin_kg == -10.0
        assert "overload" in res.safety_advisory.lower() or "capacity" in res.safety_advisory.lower()

    def test_calculate_packraft_plan_unknown_route_raises(self):
        req = PackraftPlanRequest(route_id="unknown-river")
        with pytest.raises(ValueError, match="not found"):
            calculate_packraft_plan(req)


class TestPackraftingIntentDetection:
    def test_detect_routes_list_intent(self):
        intent = detect_packrafting_intent(
            "What wilderness packrafting river expeditions do you offer?"
        )
        assert intent is not None
        assert intent.action == "routes_list"

    def test_detect_route_detail_intent(self):
        intent = detect_packrafting_intent(
            "Tell me about the middle fork salmon packraft route details"
        )
        assert intent is not None
        assert intent.action == "route_detail"
        assert intent.route_id == "frank-church-middle-fork-salmon"

    def test_detect_plan_intent(self):
        intent = detect_packrafting_intent(
            "Calculate packraft flow CFS, spraydeck for packraft, and boat capacity payload margin for talkeetna river packraft"
        )
        assert intent is not None
        assert intent.action == "packraft_plan"
        assert intent.route_id == "alaska-talkeetna-river-wilderness"

    def test_detect_gear_checklist_intent(self):
        intent = detect_packrafting_intent(
            "What ultralight packraft gear compliance checklist do I need with TiZip cargo and packraft inflation bag?"
        )
        assert intent is not None
        assert intent.action == "gear_checklist"

    def test_detect_specific_packraft_keywords(self):
        assert detect_packrafting_intent("breakdown paddle sizing for pack raft") is not None
        assert detect_packrafting_intent("how does tizip cargo hull work on a packraft?") is not None
        assert detect_packrafting_intent("south fork flathead packraft trip") is not None
        assert detect_packrafting_intent("escalante packraft permits and flows") is not None
        assert detect_packrafting_intent("desolation canyon packraft route") is not None

    def test_critical_disambiguation_guards_other_domains(self):
        # Generic whitewater should NOT be hijacked
        assert (
            detect_packrafting_intent(
                "Can an intermediate paddler safely kayak Skykomish Boulder Drop right now?"
            )
            is None
        )
        assert detect_packrafting_intent("What whitewater river runs do you recommend?") is None

        # Sea kayaking should NOT be hijacked
        assert (
            detect_packrafting_intent(
                "Calculate tidal current ferry angle and slack water tide plan for San Juan Islands crossing"
            )
            is None
        )

        # Bikepacking should NOT be hijacked
        assert (
            detect_packrafting_intent(
                "What bikepacking bags do I need for the Great Divide Mountain Bike Route?"
            )
            is None
        )

        # Climbing / hiking / returns should NOT be hijacked
        assert detect_packrafting_intent("Can I return my climbing shoes?") is None
        assert (
            detect_packrafting_intent("What is the best water filter for backpacking?") is None
        )
        assert detect_packrafting_intent("Tell me about Camp Muir ski tour") is None


class TestPackraftingPromptBuilding:
    def test_build_prompt_with_route_id(self):
        intent = PackraftingIntent(
            action="route_detail",
            route_id="frank-church-middle-fork-salmon",
        )
        prompt = build_packrafting_prompt(intent)
        assert "Middle Fork Salmon" in prompt
        assert "Frank Church Wilderness" in prompt
        assert "TiZip" in prompt

    def test_build_prompt_with_river_grade(self):
        intent = PackraftingIntent(
            action="routes_list",
            river_grade="class_iv_technical",
        )
        prompt = build_packrafting_prompt(intent)
        assert "Talkeetna" in prompt

    def test_build_prompt_general(self):
        intent = PackraftingIntent(action="routes_list")
        prompt = build_packrafting_prompt(intent)
        assert "Packrafting" in prompt
        assert "Middle Fork Salmon" in prompt


class TestPackraftingResponseFormatting:
    def test_format_packraft_plan_response(self):
        intent = PackraftingIntent(
            action="packraft_plan",
            route_id="frank-church-middle-fork-salmon",
        )
        res = format_packrafting_response(intent)
        assert "answer" in res
        assert "packrafting_info" in res
        info = res["packrafting_info"]
        assert info["action"] == "packraft_plan"
        assert info["plan"]["route_id"] == "frank-church-middle-fork-salmon"
        assert "Middle Fork Salmon" in res["answer"]
        assert "navigable" in res["answer"].lower()

    def test_format_route_detail_response(self):
        intent = PackraftingIntent(
            action="route_detail",
            route_id="alaska-talkeetna-river-wilderness",
        )
        res = format_packrafting_response(intent)
        assert "answer" in res
        assert "packrafting_info" in res
        info = res["packrafting_info"]
        assert info["action"] == "route_detail"
        assert info["route"]["route_id"] == "alaska-talkeetna-river-wilderness"
        assert "Talkeetna" in res["answer"]

    def test_format_gear_checklist_response(self):
        intent = PackraftingIntent(action="gear_checklist")
        res = format_packrafting_response(intent)
        assert "answer" in res
        assert "packrafting_info" in res
        info = res["packrafting_info"]
        assert info["action"] == "gear_checklist"
        assert len(info["gear"]) == 6
        assert "TiZip" in res["answer"] or "tizip" in res["answer"].lower()

    def test_format_routes_list_response(self):
        intent = PackraftingIntent(action="routes_list")
        res = format_packrafting_response(intent)
        assert "answer" in res
        assert "packrafting_info" in res
        info = res["packrafting_info"]
        assert info["action"] == "routes_list"
        assert len(info["routes"]) == 5
        assert "Middle Fork Salmon" in res["answer"]
