import pytest
from contoso_chat.canoe_expedition import (
    CanoeGearRequirement,
    CanoeIntent,
    CanoeRouteModel,
    CanoeTrimRequest,
    CanoeTrimResponse,
    build_canoe_prompt,
    calculate_canoe_trim,
    detect_canoe_intent,
    extract_canoe_intent,
    format_canoe_response,
    get_canoe_gear,
    get_canoe_route_by_id,
    get_canoe_routes,
)


class TestCanoeModels:
    def test_canoe_route_model(self):
        route = CanoeRouteModel(
            route_id="test-river",
            title="Test River Run",
            region="Boreal Wilderness",
            distance_km=100.0,
            typical_duration_days=5,
            whitewater_class="Class II",
            total_portages=4,
            longest_portage_m=650,
            recommended_hull_material="T-Formex",
            recommended_length_ft=16,
            description="A scenic canoe expedition with rocky portages.",
            highlights=["Rapids", "Old growth pine"],
        )
        assert route.route_id == "test-river"
        assert route.title == "Test River Run"
        assert route.distance_km == 100.0
        assert route.typical_duration_days == 5
        assert route.whitewater_class == "Class II"
        assert route.total_portages == 4
        assert route.longest_portage_m == 650
        assert route.recommended_hull_material == "T-Formex"
        assert route.recommended_length_ft == 16
        assert len(route.highlights) == 2

    def test_canoe_trim_request_defaults(self):
        req = CanoeTrimRequest(route_id="allagash-wilderness-waterway")
        assert req.route_id == "allagash-wilderness-waterway"
        assert req.canoe_length_ft == 16
        assert req.bow_paddler_weight_kg == 75.0
        assert req.stern_paddler_weight_kg == 85.0
        assert req.gear_cargo_weight_kg == 70.0
        assert req.cargo_placement == "centered"
        assert req.rapid_level == "class_ii"

    def test_canoe_trim_response_model(self):
        res = CanoeTrimResponse(
            route_id="allagash-wilderness-waterway",
            route_title="Allagash Wilderness Waterway Expedition",
            total_gross_weight_kg=230.0,
            capacity_percent=58,
            center_freeboard_cm=26.5,
            center_freeboard_inches=10.4,
            trim_status="balanced",
            swamping_risk="low",
            safety_status="OPTIMAL",
            tactical_advisory="Trim is well-balanced for Class II rapids.",
        )
        assert res.total_gross_weight_kg == 230.0
        assert res.capacity_percent == 58
        assert res.center_freeboard_cm == 26.5
        assert res.center_freeboard_inches == 10.4
        assert res.trim_status == "balanced"
        assert res.swamping_risk == "low"
        assert res.safety_status == "OPTIMAL"

    def test_canoe_gear_requirement_model(self):
        gear = CanoeGearRequirement(
            item_id="whitewater-canoe-spray-deck",
            name="Whitewater Canoe Spray Deck",
            category="hull_protection",
            mandatory=True,
            purpose="Prevents water ingress during heavy wave trains.",
        )
        assert gear.item_id == "whitewater-canoe-spray-deck"
        assert gear.mandatory is True

    def test_canoe_intent_model(self):
        intent = CanoeIntent(
            action="calculate_trim",
            route_id="nahanni-river-canyon-run",
            whitewater_class="class_iii",
            cargo_placement="centered",
        )
        assert intent.action == "calculate_trim"
        assert intent.route_id == "nahanni-river-canyon-run"
        assert intent.whitewater_class == "class_iii"
        assert intent.cargo_placement == "centered"


class TestCanoeCatalog:
    def test_get_all_routes(self):
        routes = get_canoe_routes()
        assert len(routes) == 5
        route_ids = {r.route_id for r in routes}
        expected_ids = {
            "allagash-wilderness-waterway",
            "nahanni-river-canyon-run",
            "boundary-waters-granite-river",
            "missinaibi-river-james-bay",
            "rio-grande-lower-canyons",
        }
        assert route_ids == expected_ids

    def test_filter_routes_by_whitewater_class(self):
        class_ii = get_canoe_routes(whitewater_class="class_ii")
        assert len(class_ii) >= 1
        ii_ids = {r.route_id for r in class_ii}
        assert "allagash-wilderness-waterway" in ii_ids

        class_iii = get_canoe_routes(whitewater_class="class_iii")
        assert len(class_iii) >= 2
        iii_ids = {r.route_id for r in class_iii}
        assert "nahanni-river-canyon-run" in iii_ids
        assert "missinaibi-river-james-bay" in iii_ids

    def test_get_route_by_id_valid_and_unknown(self):
        route = get_canoe_route_by_id("nahanni-river-canyon-run")
        assert route is not None
        assert route.route_id == "nahanni-river-canyon-run"
        assert "Nahanni" in route.title
        assert route.distance_km > 0
        assert route.longest_portage_m > 0
        assert len(route.highlights) >= 2

        # Case insensitive
        route_upper = get_canoe_route_by_id("ALLAGASH-WILDERNESS-WATERWAY")
        assert route_upper is not None
        assert route_upper.route_id == "allagash-wilderness-waterway"

        # Unknown
        assert get_canoe_route_by_id("unknown-canoe-route") is None

    def test_get_canoe_gear(self):
        gear = get_canoe_gear()
        assert len(gear) == 6
        assert all(isinstance(g, CanoeGearRequirement) for g in gear)
        assert all(g.mandatory is True for g in gear)
        expected_gear_ids = {
            "whitewater-canoe-spray-deck",
            "dual-end-air-flotation-bags",
            "rapid-lining-tracking-ropes",
            "deep-water-canoe-bailer-pump",
            "contoured-portage-yoke-pads",
            "whitewater-rescue-pfd-harness",
        }
        assert {g.item_id for g in gear} == expected_gear_ids


class TestCanoeTrimCalculation:
    def test_calculate_canoe_trim_standard(self):
        req = CanoeTrimRequest(
            route_id="allagash-wilderness-waterway",
            canoe_length_ft=16,
            bow_paddler_weight_kg=75.0,
            stern_paddler_weight_kg=85.0,
            gear_cargo_weight_kg=70.0,
            cargo_placement="centered",
            rapid_level="class_ii",
        )
        res = calculate_canoe_trim(req)
        assert isinstance(res, CanoeTrimResponse)
        assert res.route_id == "allagash-wilderness-waterway"
        assert res.total_gross_weight_kg == 230.0
        assert 50 <= res.capacity_percent <= 65
        assert res.center_freeboard_cm > 15.0
        assert res.center_freeboard_inches > 6.0
        assert round(res.center_freeboard_inches, 1) == round(res.center_freeboard_cm / 2.54, 1)
        assert res.trim_status == "balanced"
        assert res.swamping_risk in ("low", "moderate")
        assert res.safety_status in ("OPTIMAL", "CAUTION")
        assert len(res.tactical_advisory) > 20

    def test_calculate_canoe_trim_bow_heavy(self):
        req = CanoeTrimRequest(
            route_id="nahanni-river-canyon-run",
            canoe_length_ft=17,
            bow_paddler_weight_kg=100.0,
            stern_paddler_weight_kg=65.0,
            gear_cargo_weight_kg=80.0,
            cargo_placement="bow_heavy",
            rapid_level="class_iii",
        )
        res = calculate_canoe_trim(req)
        assert res.trim_status == "bow_heavy"
        assert res.swamping_risk in ("high", "critical")
        assert res.safety_status in ("CAUTION", "WARNING")
        assert "bow" in res.tactical_advisory.lower() or "trim" in res.tactical_advisory.lower()

    def test_calculate_canoe_trim_stern_heavy(self):
        req = CanoeTrimRequest(
            route_id="missinaibi-river-james-bay",
            canoe_length_ft=16,
            bow_paddler_weight_kg=60.0,
            stern_paddler_weight_kg=105.0,
            gear_cargo_weight_kg=90.0,
            cargo_placement="stern_heavy",
            rapid_level="class_iii",
        )
        res = calculate_canoe_trim(req)
        assert res.trim_status == "stern_heavy"
        assert "stern" in res.tactical_advisory.lower() or "trim" in res.tactical_advisory.lower()

    def test_calculate_canoe_trim_overloaded(self):
        req = CanoeTrimRequest(
            route_id="boundary-waters-granite-river",
            canoe_length_ft=16,
            bow_paddler_weight_kg=120.0,
            stern_paddler_weight_kg=130.0,
            gear_cargo_weight_kg=160.0,
            cargo_placement="centered",
            rapid_level="class_ii",
        )
        res = calculate_canoe_trim(req)
        assert res.total_gross_weight_kg == 410.0
        assert res.capacity_percent >= 90
        assert res.safety_status in ("WARNING", "HAZARDOUS")
        assert res.center_freeboard_cm < 18.0

    def test_calculate_canoe_trim_invalid_route(self):
        req = CanoeTrimRequest(route_id="invalid-route-xyz")
        with pytest.raises(ValueError, match="not found"):
            calculate_canoe_trim(req)


class TestCanoeIntentExtraction:
    def test_extract_intent_none_for_empty_or_unrelated(self):
        assert extract_canoe_intent("") is None
        assert extract_canoe_intent("   ") is None
        assert extract_canoe_intent("Where is my order #12345?") is None
        assert extract_canoe_intent("I need a refund for my climbing shoes") is None
        assert extract_canoe_intent("What is the avalanche forecast for Mount Rainier?") is None

    def test_extract_intent_disambiguation_guards(self):
        # Sea kayaking should NOT be hijacked
        assert extract_canoe_intent("Tell me about sea kayaking in San Juan Islands with a paddle float") is None
        # Packrafting should NOT be hijacked
        assert extract_canoe_intent("What is the packrafting route on Middle Fork Salmon?") is None
        # General whitewater kayaking should NOT be hijacked
        assert extract_canoe_intent("What are the river flows in cfs for whitewater kayaking on White Salmon?") is None

    def test_extract_intent_triggers(self):
        assert extract_canoe_intent("What open canoe expeditions do you recommend?") is not None
        assert extract_canoe_intent("How do I do rapid lining on an open canoe?") is not None
        assert extract_canoe_intent("Tell me about the Allagash wilderness waterway route") is not None
        assert extract_canoe_intent("What is the Nahanni river canyon run like?") is not None
        assert extract_canoe_intent("Can you calculate canoe trim and gunwale freeboard?") is not None
        assert extract_canoe_intent("What yoke pad and end bags do I need for portaging?") is not None
        assert extract_canoe_intent("Missinaibi river canoe expedition details") is not None
        assert extract_canoe_intent("Boundary Waters granite river portage distance") is not None

    def test_extract_intent_actions(self):
        trim_intent = extract_canoe_intent("Calculate canoe trim and gunwale freeboard for 16ft canoe")
        assert trim_intent is not None
        assert trim_intent.action == "calculate_trim"

        gear_intent = extract_canoe_intent("What is the mandatory expedition gear checklist for canoeing with a spray deck?")
        assert gear_intent is not None
        assert gear_intent.action == "gear_checklist"

        detail_intent = extract_canoe_intent("Tell me details about the Allagash wilderness waterway expedition")
        assert detail_intent is not None
        assert detail_intent.action == "route_detail"
        assert detail_intent.route_id == "allagash-wilderness-waterway"

        routes_intent = extract_canoe_intent("List all whitewater canoeing routes")
        assert routes_intent is not None
        assert routes_intent.action == "routes_list"

    def test_extract_intent_parameters(self):
        intent = extract_canoe_intent("Calculate canoe trim on nahanni with forward cargo placement for Class III")
        assert intent is not None
        assert intent.action == "calculate_trim"
        assert intent.route_id == "nahanni-river-canyon-run"
        assert intent.whitewater_class == "class_iii"
        assert intent.cargo_placement in ("bow_heavy", "forward")

    def test_detect_canoe_intent_alias(self):
        assert detect_canoe_intent("Canoeing gear checklist") is not None


class TestCanoeFormattingAndPrompt:
    def test_format_canoe_response_routes_list(self):
        intent = CanoeIntent(action="routes_list")
        res = format_canoe_response(intent)
        assert isinstance(res, str)
        assert "Allagash" in str(res)
        assert res.get("canoe_info") is not None
        assert res["canoe_info"]["action"] == "routes_list"
        assert len(res["canoe_info"]["routes"]) == 5

    def test_format_canoe_response_route_detail(self):
        intent = CanoeIntent(action="route_detail", route_id="allagash-wilderness-waterway")
        res = format_canoe_response(intent)
        assert isinstance(res, str)
        assert "Allagash" in str(res)
        assert res.get("canoe_info") is not None
        assert res["canoe_info"]["action"] == "route_detail"
        assert res["canoe_info"]["route"]["route_id"] == "allagash-wilderness-waterway"

    def test_format_canoe_response_gear_checklist(self):
        intent = CanoeIntent(action="gear_checklist")
        res = format_canoe_response(intent)
        assert isinstance(res, str)
        assert "spray deck" in str(res).lower()
        assert res.get("canoe_info") is not None
        assert res["canoe_info"]["action"] == "gear_checklist"
        assert len(res["canoe_info"]["gear"]) == 6

    def test_format_canoe_response_calculate_trim(self):
        intent = CanoeIntent(action="calculate_trim", route_id="nahanni-river-canyon-run")
        res = format_canoe_response(intent)
        assert isinstance(res, str)
        assert "Trim" in str(res) or "freeboard" in str(res).lower()
        assert res.get("canoe_info") is not None
        assert res["canoe_info"]["action"] == "calculate_trim"
        assert "trim" in res["canoe_info"]

    def test_build_canoe_prompt(self):
        intent = CanoeIntent(action="route_detail", route_id="allagash-wilderness-waterway")
        prompt = build_canoe_prompt(intent)
        assert isinstance(prompt, str)
        assert "Allagash" in prompt
        assert "freeboard" in prompt.lower() or "lining" in prompt.lower() or "spray deck" in prompt.lower()


class TestCanoeAdditionalCoverage:
    def test_get_canoe_route_by_id_empty(self):
        assert get_canoe_route_by_id("") is None

    def test_calculate_canoe_trim_class_i(self):
        req = CanoeTrimRequest(
            route_id="boundary-waters-granite-river",
            canoe_length_ft=16,
            bow_paddler_weight_kg=60.0,
            stern_paddler_weight_kg=65.0,
            gear_cargo_weight_kg=40.0,
            cargo_placement="centered",
            rapid_level="class_i",
        )
        res = calculate_canoe_trim(req)
        assert res.swamping_risk == "low"
        assert res.safety_status == "OPTIMAL"

    def test_calculate_canoe_trim_class_i_low_freeboard(self):
        req = CanoeTrimRequest(
            route_id="boundary-waters-granite-river",
            canoe_length_ft=16,
            bow_paddler_weight_kg=130.0,
            stern_paddler_weight_kg=140.0,
            gear_cargo_weight_kg=180.0,
            cargo_placement="centered",
            rapid_level="class_i",
        )
        res = calculate_canoe_trim(req)
        assert res.swamping_risk == "moderate"

    def test_extract_intent_additional_patterns(self):
        # Class IV, Class I, Rio Grande, stern heavy
        intent1 = extract_canoe_intent("Calculate canoe trim on rio grande with stern heavy cargo for class 4")
        assert intent1 is not None
        assert intent1.route_id == "rio-grande-lower-canyons"
        assert intent1.whitewater_class == "class_iv"
        assert intent1.cargo_placement == "stern_heavy"

        intent2 = extract_canoe_intent("Tell me about canoeing missinaibi for class 1 with centered cargo")
        assert intent2 is not None
        assert intent2.route_id == "missinaibi-river-james-bay"
        assert intent2.whitewater_class == "class_i"
        assert intent2.cargo_placement == "centered"

    def test_formatted_canoe_response_dict_methods(self):
        intent = CanoeIntent(action="routes_list")
        res = format_canoe_response(intent)
        assert "canoe_info" in res
        assert "answer" in res
        assert "nonexistent_key" not in res
        assert 123 not in res
        assert list(res.keys())
        assert list(res.values())
        assert list(res.items())
        assert res["answer"] is not None
        # String slice access
        assert res[0] == res.replace("", "")[0]

    def test_format_canoe_response_invalid_route_fallback(self):
        intent = CanoeIntent(action="calculate_trim", route_id="invalid-route-xyz")
        res = format_canoe_response(intent)
        assert isinstance(res, str)
        assert res.get("canoe_info") is not None

    def test_build_canoe_prompt_modes(self):
        # Gear checklist prompt
        gear_intent = CanoeIntent(action="gear_checklist")
        prompt_gear = build_canoe_prompt(gear_intent)
        assert "Mandatory Open Canoe Wilderness Expedition Safety Gear" in prompt_gear

        # Calculate trim prompt
        trim_intent = CanoeIntent(action="calculate_trim")
        prompt_trim = build_canoe_prompt(trim_intent)
        assert "Canoe Ballast & Gunwale Freeboard Trim Principles" in prompt_trim

        # Routes list prompt with whitewater class
        routes_intent = CanoeIntent(action="routes_list", whitewater_class="class_ii")
        prompt_routes = build_canoe_prompt(routes_intent)
        assert "Available Canoe Routes" in prompt_routes
