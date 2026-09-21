import pytest
from contoso_chat.canyoneering import (
    CanyoneeringGearRequirement,
    CanyoneeringIntent,
    RopeRiggingRequest,
    RopeRiggingResponse,
    SlotCanyonRouteModel,
    build_canyoneering_prompt,
    calculate_rope_rigging_plan,
    detect_canyoneering_intent,
    format_canyoneering_response,
    get_canyon_route_by_id,
    get_canyon_routes,
    get_canyoneering_gear,
)


class TestCanyonRouteCatalog:
    def test_get_all_routes(self):
        routes = get_canyon_routes()
        assert len(routes) == 5
        route_ids = {r.route_id for r in routes}
        assert route_ids == {
            "zion-subway-left-fork",
            "zion-mystery-canyon",
            "escalante-choprock-canyon",
            "san-rafael-black-hole",
            "robbers-roost-bluejohn",
        }

    def test_get_routes_filter_grade(self):
        grade_3b = get_canyon_routes(grade="class_3b")
        assert len(grade_3b) == 2
        ids_3b = {r.route_id for r in grade_3b}
        assert ids_3b == {"zion-subway-left-fork", "zion-mystery-canyon"}

        grade_4b = get_canyon_routes(grade="class_4b")
        assert len(grade_4b) == 1
        assert grade_4b[0].route_id == "escalante-choprock-canyon"

        grade_3c = get_canyon_routes(grade="class_3c")
        assert len(grade_3c) == 1
        assert grade_3c[0].route_id == "san-rafael-black-hole"

        grade_3a = get_canyon_routes(grade="class_3a")
        assert len(grade_3a) == 1
        assert grade_3a[0].route_id == "robbers-roost-bluejohn"

        # Test case-insensitive and flexible formatting
        grade_flex = get_canyon_routes(grade="Class 3B")
        assert len(grade_flex) == 2

    def test_get_route_by_id(self):
        route = get_canyon_route_by_id("zion-subway-left-fork")
        assert route is not None
        assert isinstance(route, SlotCanyonRouteModel)
        assert route.route_id == "zion-subway-left-fork"
        assert "Subway" in route.canyon_name
        assert route.region == "Zion National Park, UT"
        assert route.technical_grade == "class_3b"
        assert route.flash_flood_risk == "moderate"
        assert route.max_rappel_ft == 30
        assert route.number_of_rappels == 3
        assert route.longest_rappel_ft == 30
        assert route.wetsuit_thickness_mm == 4
        assert route.typical_duration_hours == 7.0
        assert len(route.anchor_features) >= 3
        assert len(route.description) > 10

    def test_get_route_case_insensitive_and_unknown(self):
        route = get_canyon_route_by_id("ZION-SUBWAY-LEFT-FORK")
        assert route is not None
        assert route.route_id == "zion-subway-left-fork"

        assert get_canyon_route_by_id("unknown-canyon-route") is None


class TestCanyoneeringGearChecklist:
    def test_get_canyoneering_gear(self):
        gear = get_canyoneering_gear()
        assert len(gear) == 6
        for item in gear:
            assert isinstance(item, CanyoneeringGearRequirement)
            assert item.item_id
            assert item.name
            assert item.category
            assert item.mandatory is True
            assert item.purpose

        item_ids = {g.item_id for g in gear}
        assert any("harness" in i for i in item_ids)
        assert any("rope" in i for i in item_ids)
        assert any("descender" in i for i in item_ids)
        assert any("wetsuit" in i for i in item_ids)
        assert any("helmet" in i for i in item_ids)
        assert any("pothole" in i for i in item_ids)


class TestRopeRiggingCalculations:
    def test_calculate_rope_rigging_dedicated_pull_line(self):
        req = RopeRiggingRequest(
            route_id="zion-subway-left-fork",
            team_size=4,
            rope_diameter_mm=9.0,
            pull_cord_type="dedicated_pull_line",
            water_immersion_level="pothole_swimming",
        )
        res = calculate_rope_rigging_plan(req)
        assert isinstance(res, RopeRiggingResponse)
        assert res.route_id == "zion-subway-left-fork"
        assert "Subway" in res.canyon_and_route
        assert res.rope_length_ft == 45  # 30ft + 15ft buffer
        assert res.pull_cord_length_ft == 45
        assert "pull line" in res.rigging_anchor_system.lower()
        assert res.rigging_status in ("safe", "caution")
        assert "4mm" in res.neoprene_spec
        assert "30 ft" in res.safety_advisory or "30" in res.safety_advisory

    def test_calculate_rope_rigging_dual_rope_system_doubling(self):
        req = RopeRiggingRequest(
            route_id="zion-mystery-canyon",
            team_size=4,
            pull_cord_type="dual_rope_system",
        )
        res = calculate_rope_rigging_plan(req)
        assert res.route_id == "zion-mystery-canyon"
        # Mystery Canyon longest rappel is 120ft; doubled rope gives 240ft
        assert res.rope_length_ft == 240
        assert res.pull_cord_length_ft == 0
        assert "doubled" in res.rigging_anchor_system.lower() or "twin" in res.rigging_anchor_system.lower()

    def test_calculate_rope_rigging_fiddle_stick_system(self):
        req = RopeRiggingRequest(
            route_id="escalante-choprock-canyon",
            team_size=4,
            pull_cord_type="fiddle_stick_retrievable",
            water_immersion_level="pothole_swimming",
        )
        res = calculate_rope_rigging_plan(req)
        assert res.route_id == "escalante-choprock-canyon"
        # Choprock longest rappel is 80ft; single rope 80 + 15 = 95ft
        assert res.rope_length_ft == 95
        assert res.pull_cord_length_ft == 95
        assert "fiddlestick" in res.rigging_anchor_system.lower() or "toggle" in res.rigging_anchor_system.lower()
        assert "fiddlestick" in res.safety_advisory.lower() or "toggle" in res.safety_advisory.lower()

    def test_calculate_rope_rigging_critical_hazard(self):
        # High flood risk + flowing water = critical_hazard
        req = RopeRiggingRequest(
            route_id="san-rafael-black-hole",
            water_immersion_level="flowing_water",
        )
        res = calculate_rope_rigging_plan(req)
        assert res.rigging_status == "critical_hazard"
        assert "critical" in res.safety_advisory.lower() or "hazard" in res.safety_advisory.lower() or "flash flood" in res.safety_advisory.lower()

    def test_calculate_rope_rigging_dry_canyon_no_wetsuit(self):
        req = RopeRiggingRequest(
            route_id="robbers-roost-bluejohn",
            water_immersion_level="dry",
        )
        res = calculate_rope_rigging_plan(req)
        assert "no wetsuit" in res.neoprene_spec.lower() or "dry" in res.neoprene_spec.lower()

    def test_calculate_rope_rigging_unknown_route_raises(self):
        req = RopeRiggingRequest(route_id="unknown-canyon")
        with pytest.raises(ValueError, match="not found"):
            calculate_rope_rigging_plan(req)


class TestCanyoneeringIntentDetection:
    def test_detect_routes_list_intent(self):
        intent = detect_canyoneering_intent(
            "What technical slot canyon canyoneering routes do you offer in Zion?"
        )
        assert intent is not None
        assert intent.action == "routes_list"

    def test_detect_route_detail_intent(self):
        intent = detect_canyoneering_intent(
            "Tell me about the subway zion slot canyon rappel and route details"
        )
        assert intent is not None
        assert intent.action == "route_detail"
        assert intent.route_id == "zion-subway-left-fork"

    def test_detect_rigging_plan_intent(self):
        intent = detect_canyoneering_intent(
            "Calculate canyoneering rope length, pull cord, and fiddle stick retrieval for mystery canyon"
        )
        assert intent is not None
        assert intent.action == "rigging_plan"
        assert intent.route_id == "zion-mystery-canyon"

    def test_detect_gear_checklist_intent(self):
        intent = detect_canyoneering_intent(
            "What canyoneering harness, canyon descender, and pothole escape kit do I need for a slot canyon?"
        )
        assert intent is not None
        assert intent.action == "gear_checklist"

    def test_detect_specific_canyoneering_keywords(self):
        assert detect_canyoneering_intent("subway zion permit and rappel beta") is not None
        assert detect_canyoneering_intent("mystery canyon slot canyon drop") is not None
        assert detect_canyoneering_intent("choprock canyon keeper potholes") is not None
        assert detect_canyoneering_intent("black hole white canyon swim conditions") is not None
        assert detect_canyoneering_intent("bluejohn canyon slot rappel") is not None
        assert detect_canyoneering_intent("fiddle stick retrieval system setup") is not None
        assert detect_canyoneering_intent("pothole escape kit requirements") is not None
        assert detect_canyoneering_intent("canyon wetsuit thickness for cold slot canyon") is not None

    def test_critical_disambiguation_guards_other_domains(self):
        # Rock climbing crags should NOT be hijacked
        assert (
            detect_canyoneering_intent(
                "What route beta do you have for Godzilla at Index Lower Town Wall?"
            )
            is None
        )
        assert (
            detect_canyoneering_intent(
                "Tell me about climbing Godzilla at Index Lower Town Wall"
            )
            is None
        )
        assert (
            detect_canyoneering_intent("Can I return my climbing shoes?") is None
        )

        # Packrafting / Whitewater should NOT be hijacked
        assert (
            detect_canyoneering_intent(
                "Can an intermediate paddler safely kayak Skykomish Boulder Drop right now?"
            )
            is None
        )
        assert (
            detect_canyoneering_intent(
                "Calculate packraft flow CFS, spraydeck for packraft, and boat capacity payload margin for talkeetna river packraft"
            )
            is None
        )

        # Sea Kayaking should NOT be hijacked
        assert (
            detect_canyoneering_intent(
                "Calculate tidal current ferry angle and slack water tide plan for San Juan Islands crossing"
            )
            is None
        )

        # General backpacking / ski touring should NOT be hijacked
        assert (
            detect_canyoneering_intent("What is the best water filter for backpacking?")
            is None
        )
        assert detect_canyoneering_intent("Tell me about Camp Muir ski tour") is None


class TestCanyoneeringPromptBuilding:
    def test_build_prompt_with_route_id(self):
        intent = CanyoneeringIntent(
            action="route_detail",
            route_id="zion-subway-left-fork",
        )
        prompt = build_canyoneering_prompt(intent)
        assert "Subway" in prompt
        assert "Zion National Park" in prompt
        assert "30" in prompt
        assert "Harness" in prompt or "harness" in prompt

    def test_build_prompt_with_technical_grade(self):
        intent = CanyoneeringIntent(
            action="routes_list",
            technical_grade="class_4b",
        )
        prompt = build_canyoneering_prompt(intent)
        assert "Choprock" in prompt

    def test_build_prompt_general(self):
        intent = CanyoneeringIntent(action="routes_list")
        prompt = build_canyoneering_prompt(intent)
        assert "Canyoneering" in prompt
        assert "Subway" in prompt


class TestCanyoneeringResponseFormatting:
    def test_format_rigging_plan_response(self):
        intent = CanyoneeringIntent(
            action="rigging_plan",
            route_id="zion-mystery-canyon",
        )
        res = format_canyoneering_response(intent)
        assert "answer" in res
        assert "canyoneering_info" in res
        info = res["canyoneering_info"]
        assert info["action"] == "rigging_plan"
        assert info["plan"]["route_id"] == "zion-mystery-canyon"
        assert "Mystery Canyon" in res["answer"]

    def test_format_route_detail_response(self):
        intent = CanyoneeringIntent(
            action="route_detail",
            route_id="san-rafael-black-hole",
        )
        res = format_canyoneering_response(intent)
        assert "answer" in res
        assert "canyoneering_info" in res
        info = res["canyoneering_info"]
        assert info["action"] == "route_detail"
        assert info["route"]["route_id"] == "san-rafael-black-hole"
        assert "Black Hole" in res["answer"]

    def test_format_gear_checklist_response(self):
        intent = CanyoneeringIntent(action="gear_checklist")
        res = format_canyoneering_response(intent)
        assert "answer" in res
        assert "canyoneering_info" in res
        info = res["canyoneering_info"]
        assert info["action"] == "gear_checklist"
        assert len(info["gear"]) == 6
        assert "Harness" in res["answer"] or "harness" in res["answer"]

    def test_format_routes_list_response(self):
        intent = CanyoneeringIntent(action="routes_list")
        res = format_canyoneering_response(intent)
        assert "answer" in res
        assert "canyoneering_info" in res
        info = res["canyoneering_info"]
        assert info["action"] == "routes_list"
        assert len(info["routes"]) == 5
        assert "Subway" in res["answer"]
