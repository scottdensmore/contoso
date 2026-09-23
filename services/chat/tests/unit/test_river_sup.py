import pytest
from contoso_chat.river_sup import (
    FormattedRiverSupResponse,
    RiverSupCalculationRequest,
    RiverSupCalculationResponse,
    RiverSupGearRequirement,
    RiverSupIntent,
    RiverSupRunModel,
    build_river_sup_prompt,
    calculate_river_sup,
    detect_river_sup_intent,
    format_river_sup_response,
    get_river_sup_gear,
    get_river_sup_run_by_id,
    get_river_sup_runs,
)


class TestRiverSupModels:
    def test_run_model(self):
        run = RiverSupRunModel(
            run_id="arkansas-river-browns-canyon",
            title="Browns Canyon National Monument",
            river_system="Arkansas River",
            region="Salida/Buena Vista, CO, USA",
            difficulty="class_iii",
            length_miles=14.0,
            gradient_ft_per_mile=28.0,
            flow_range_cfs="800 - 2,200 CFS",
            typical_duration_hours=4.5,
            description="Iconic Colorado whitewater SUP section through granite canyons.",
            highlights=[
                "Canyon punchy wavetrains",
                "Continuous granite boulder gardens",
                "Zoeller & Seidel eddy lines",
            ],
        )
        assert run.run_id == "arkansas-river-browns-canyon"
        assert run.title == "Browns Canyon National Monument"
        assert run.river_system == "Arkansas River"
        assert run.region == "Salida/Buena Vista, CO, USA"
        assert run.difficulty == "class_iii"
        assert run.length_miles == 14.0
        assert run.gradient_ft_per_mile == 28.0
        assert run.flow_range_cfs == "800 - 2,200 CFS"
        assert run.typical_duration_hours == 4.5
        assert len(run.highlights) == 3

    def test_calculation_request_defaults(self):
        req = RiverSupCalculationRequest()
        assert req.run_id == "arkansas-river-browns-canyon"
        assert req.paddler_weight_kg == 75.0
        assert req.gear_weight_kg == 5.0
        assert req.board_volume_liters == 310.0
        assert req.river_flow_cfs == 1500.0
        assert req.fin_type == "short_flexible_river_fins"
        assert req.leash_type == "torso_quick_release"

    def test_calculation_response_model(self):
        resp = RiverSupCalculationResponse(
            run_id="arkansas-river-browns-canyon",
            run_title="Browns Canyon National Monument",
            total_payload_kg=80.0,
            volume_to_weight_ratio=3.88,
            buoyancy_rating="Optimal whitewater buoyancy; stable flotation across aerated wavetrains.",
            stability_index_percent=82,
            fin_clearance_status="Approved: shallow-draft flexible fin setup clears riverbed obstructions.",
            leash_safety_status="Approved: quick-release torso harness allows instant detachment under dynamic current load.",
            safety_status="approved",
            paddling_advisory="Favorable conditions for Class III river SUP.",
        )
        assert resp.run_id == "arkansas-river-browns-canyon"
        assert resp.total_payload_kg == 80.0
        assert resp.volume_to_weight_ratio == 3.88
        assert resp.stability_index_percent == 82
        assert resp.safety_status == "approved"

    def test_gear_requirement_model(self):
        gear = RiverSupGearRequirement(
            item_id="quick-release-torso-leash",
            name="Chest-Harness Quick-Release River Leash Belt with High-Visibility Toggle",
            category="leash_safety",
            mandatory=True,
            purpose="Enables immediate one-handed detachment under moving water load.",
        )
        assert gear.item_id == "quick-release-torso-leash"
        assert gear.category == "leash_safety"
        assert gear.mandatory is True

    def test_intent_model(self):
        intent = RiverSupIntent(
            action="runs_list",
            run_id=None,
            difficulty="class_iii",
        )
        assert intent.action == "runs_list"
        assert intent.difficulty == "class_iii"


class TestRiverSupCatalog:
    def test_get_river_sup_runs_all(self):
        runs = get_river_sup_runs()
        assert len(runs) == 5
        run_ids = {r.run_id for r in runs}
        expected_ids = {
            "arkansas-river-browns-canyon",
            "white-salmon-husum",
            "french-broad-section-9",
            "deschutes-maupin-run",
            "soca-kobarid-slalom",
        }
        assert run_ids == expected_ids

    def test_get_river_sup_runs_filter_difficulty(self):
        class_iii_runs = get_river_sup_runs(difficulty="class_iii")
        assert len(class_iii_runs) == 3
        iii_ids = {r.run_id for r in class_iii_runs}
        assert iii_ids == {
            "arkansas-river-browns-canyon",
            "french-broad-section-9",
            "deschutes-maupin-run",
        }

        class_iv_runs = get_river_sup_runs(difficulty="class_iv")
        assert len(class_iv_runs) == 2
        iv_ids = {r.run_id for r in class_iv_runs}
        assert iv_ids == {
            "white-salmon-husum",
            "soca-kobarid-slalom",
        }

        norm_runs = get_river_sup_runs(difficulty="Class IV")
        assert len(norm_runs) == 2

    def test_get_river_sup_run_by_id(self):
        run = get_river_sup_run_by_id("arkansas-river-browns-canyon")
        assert run is not None
        assert run.title == "Browns Canyon National Monument"
        assert run.river_system == "Arkansas River"
        assert run.region == "Salida/Buena Vista, CO, USA"
        assert run.difficulty == "class_iii"
        assert run.length_miles == 14.0
        assert run.gradient_ft_per_mile == 28.0
        assert run.flow_range_cfs == "800 - 2,200 CFS"
        assert run.typical_duration_hours == 4.5
        assert len(run.highlights) == 3

        run_case = get_river_sup_run_by_id("ARKANSAS-RIVER-BROWNS-CANYON")
        assert run_case is not None
        assert run_case.run_id == "arkansas-river-browns-canyon"

        assert get_river_sup_run_by_id("non-existent-reach") is None

    def test_get_river_sup_gear(self):
        gear = get_river_sup_gear()
        assert len(gear) == 6
        assert all(g.mandatory is True for g in gear)
        gear_dict = {g.item_id: g for g in gear}
        assert "quick-release-torso-leash" in gear_dict
        assert gear_dict["quick-release-torso-leash"].category == "leash_safety"
        assert "whitewater-certified-pfd" in gear_dict
        assert gear_dict["whitewater-certified-pfd"].category == "buoyancy"
        assert "drainage-water-helmet" in gear_dict
        assert gear_dict["drainage-water-helmet"].category == "head_protection"
        assert "flexible-river-fins" in gear_dict
        assert gear_dict["flexible-river-fins"].category == "fins"
        assert "carbon-reinforced-river-paddle" in gear_dict
        assert gear_dict["carbon-reinforced-river-paddle"].category == "propulsion"
        assert "padded-neoprene-booties" in gear_dict
        assert gear_dict["padded-neoprene-booties"].category == "footwear"


class TestRiverSupCalculations:
    def test_calculate_approved_optimal(self):
        req = RiverSupCalculationRequest(
            run_id="arkansas-river-browns-canyon",
            paddler_weight_kg=75.0,
            gear_weight_kg=5.0,
            board_volume_liters=310.0,
            river_flow_cfs=1500.0,
            fin_type="short_flexible_river_fins",
            leash_type="torso_quick_release",
        )
        res = calculate_river_sup(req)
        assert res.run_id == "arkansas-river-browns-canyon"
        assert res.run_title == "Browns Canyon National Monument"
        assert res.total_payload_kg == 80.0
        assert res.volume_to_weight_ratio == 3.88
        assert (
            res.buoyancy_rating
            == "Optimal whitewater buoyancy; stable flotation across aerated wavetrains."
        )
        assert (
            res.fin_clearance_status
            == "Approved: shallow-draft flexible fin setup clears riverbed obstructions."
        )
        assert (
            res.leash_safety_status
            == "Approved: quick-release torso harness allows instant detachment under dynamic current load."
        )
        assert res.safety_status == "approved"
        assert res.stability_index_percent == 82
        assert "Browns Canyon" in res.paddling_advisory

    def test_calculate_hazardous_ankle_leash(self):
        req = RiverSupCalculationRequest(
            run_id="white-salmon-husum",
            paddler_weight_kg=75.0,
            gear_weight_kg=5.0,
            board_volume_liters=320.0,
            river_flow_cfs=1200.0,
            fin_type="short_flexible_river_fins",
            leash_type="ankle_fixed_coiled",
        )
        res = calculate_river_sup(req)
        assert (
            res.leash_safety_status
            == "PROHIBITED HAZARD: Fixed ankle leashes cause fatal riverbed snag entrapment in moving water."
        )
        assert res.safety_status == "hazardous_prohibited"

    def test_calculate_hazardous_touring_fin(self):
        req = RiverSupCalculationRequest(
            run_id="french-broad-section-9",
            paddler_weight_kg=75.0,
            gear_weight_kg=5.0,
            board_volume_liters=320.0,
            river_flow_cfs=2000.0,
            fin_type="standard_long_touring_fin",
            leash_type="torso_quick_release",
        )
        res = calculate_river_sup(req)
        assert (
            res.fin_clearance_status
            == "Severe hazard: 8-9 inch touring fin will strike shallow river boulders and trigger violent falls."
        )
        assert res.safety_status == "hazardous_prohibited"

    def test_calculate_hazardous_under_buoyant(self):
        req = RiverSupCalculationRequest(
            run_id="french-broad-section-9",
            paddler_weight_kg=75.0,
            gear_weight_kg=5.0,
            board_volume_liters=200.0,
            river_flow_cfs=2000.0,
            fin_type="short_flexible_river_fins",
            leash_type="torso_quick_release",
        )
        res = calculate_river_sup(req)
        assert (
            res.buoyancy_rating
            == "Critically under-buoyant for aerated whitewater; severe sinking and instability risk."
        )
        assert res.safety_status == "hazardous_prohibited"

    def test_calculate_caution_moderate_buoyancy(self):
        req = RiverSupCalculationRequest(
            run_id="deschutes-maupin-run",
            paddler_weight_kg=75.0,
            gear_weight_kg=5.0,
            board_volume_liters=260.0,
            river_flow_cfs=3000.0,
            fin_type="short_flexible_river_fins",
            leash_type="torso_quick_release",
        )
        res = calculate_river_sup(req)
        assert (
            res.buoyancy_rating
            == "Moderate buoyancy; lively handling for expert paddlers, low margin in foam."
        )
        assert res.safety_status == "caution_expert_only"

    def test_calculate_caution_no_leash(self):
        req = RiverSupCalculationRequest(
            run_id="deschutes-maupin-run",
            paddler_weight_kg=75.0,
            gear_weight_kg=5.0,
            board_volume_liters=320.0,
            river_flow_cfs=2500.0,
            fin_type="short_flexible_river_fins",
            leash_type="none",
        )
        res = calculate_river_sup(req)
        assert (
            res.leash_safety_status
            == "Caution: unattached board loss in rapids; emergency swim to eddy required."
        )
        assert res.safety_status == "caution_expert_only"

    def test_calculate_caution_high_flow(self):
        req = RiverSupCalculationRequest(
            run_id="deschutes-maupin-run",
            paddler_weight_kg=75.0,
            gear_weight_kg=5.0,
            board_volume_liters=320.0,
            river_flow_cfs=4200.0,
            fin_type="short_flexible_river_fins",
            leash_type="torso_quick_release",
        )
        res = calculate_river_sup(req)
        assert res.safety_status == "caution_expert_only"
        assert res.stability_index_percent == 70

    def test_calculate_high_volume_buoyancy(self):
        req = RiverSupCalculationRequest(
            run_id="soca-kobarid-slalom",
            paddler_weight_kg=70.0,
            gear_weight_kg=5.0,
            board_volume_liters=360.0,
            river_flow_cfs=1500.0,
            fin_type="short_flexible_river_fins",
            leash_type="torso_quick_release",
        )
        res = calculate_river_sup(req)
        assert res.volume_to_weight_ratio == 4.8
        assert (
            res.buoyancy_rating
            == "High volume buoyancy; maximum stability, increased wind resistance."
        )

    def test_calculate_invalid_run_raises(self):
        req = RiverSupCalculationRequest(run_id="unknown-river-reach")
        with pytest.raises(ValueError, match="not found"):
            calculate_river_sup(req)


class TestRiverSupIntentDetection:
    def test_detect_runs_list(self):
        intent = detect_river_sup_intent("What whitewater SUP runs are available?")
        assert intent is not None
        assert intent.action == "runs_list"

    def test_detect_runs_filter_class_iv(self):
        intent = detect_river_sup_intent("Show Class IV river stand up paddleboard reaches")
        assert intent is not None
        assert intent.action == "runs_list"
        assert intent.difficulty == "class_iv"

    def test_detect_runs_filter_class_iii(self):
        intent = detect_river_sup_intent("What are the Class III whitewater SUP options?")
        assert intent is not None
        assert intent.action == "runs_list"
        assert intent.difficulty == "class_iii"

    def test_detect_browns_canyon_run_detail(self):
        intent = detect_river_sup_intent("Tell me about Browns Canyon SUP on the Arkansas River")
        assert intent is not None
        assert intent.action == "run_detail"
        assert intent.run_id == "arkansas-river-browns-canyon"

    def test_detect_white_salmon_run_detail(self):
        intent = detect_river_sup_intent("Can I do White Salmon SUP near Husum?")
        assert intent is not None
        assert intent.action == "run_detail"
        assert intent.run_id == "white-salmon-husum"

    def test_detect_french_broad_run_detail(self):
        intent = detect_river_sup_intent("Tell me about French Broad SUP Section 9")
        assert intent is not None
        assert intent.action == "run_detail"
        assert intent.run_id == "french-broad-section-9"

    def test_detect_deschutes_run_detail(self):
        intent = detect_river_sup_intent("Information on Deschutes river SUP Maupin run")
        assert intent is not None
        assert intent.action == "run_detail"
        assert intent.run_id == "deschutes-maupin-run"

    def test_detect_soca_run_detail(self):
        intent = detect_river_sup_intent("Tell me about Soca river SUP in Slovenia")
        assert intent is not None
        assert intent.action == "run_detail"
        assert intent.run_id == "soca-kobarid-slalom"

    def test_detect_calculation_intent(self):
        intent = detect_river_sup_intent("Calculate river paddleboard volume for 80kg paddler")
        assert intent is not None
        assert intent.action == "river_sup_calculation"

    def test_detect_fin_clearance_intent(self):
        intent = detect_river_sup_intent("Are flexible river fins safe for shallow rapids?")
        assert intent is not None
        assert intent.action == "river_sup_calculation"

    def test_detect_leash_safety_intent(self):
        intent = detect_river_sup_intent(
            "What are the ankle leash dangers on whitewater paddleboards?"
        )
        assert intent is not None
        assert intent.action == "river_sup_calculation"

    def test_detect_quick_release_torso_leash_intent(self):
        intent = detect_river_sup_intent(
            "Tell me about quick release torso leash safety for river SUP"
        )
        assert intent is not None
        assert intent.action == "river_sup_calculation"

    def test_detect_gear_checklist_intent(self):
        intent = detect_river_sup_intent(
            "What whitewater PFD and gear kit do I need for river SUP?"
        )
        assert intent is not None
        assert intent.action == "gear_checklist"

    def test_disambiguation_guards(self):
        assert detect_river_sup_intent("Rent a flatwater paddleboard on the calm lake") is None
        assert detect_river_sup_intent("Looking for kayak rentals on the bay") is None
        assert detect_river_sup_intent("Canoe expeditions in the boundary waters") is None
        assert detect_river_sup_intent("Where is my order #54321?") is None
        assert detect_river_sup_intent("Can I get a refund for my tent?") is None
        assert detect_river_sup_intent("") is None
        assert detect_river_sup_intent("Hello how are you today?") is None


class TestRiverSupFormattingAndPrompt:
    def test_build_river_sup_prompt_catalog(self):
        intent = RiverSupIntent(action="runs_list")
        prompt = build_river_sup_prompt(intent)
        assert "Whitewater Stand-Up Paddleboarding" in prompt
        assert "Browns Canyon" in prompt
        assert "Chest-Harness Quick-Release River Leash" in prompt

    def test_build_river_sup_prompt_specific_run(self):
        intent = RiverSupIntent(action="run_detail", run_id="white-salmon-husum")
        prompt = build_river_sup_prompt(intent)
        assert "Middle White Salmon River" in prompt
        assert "class_iv" in prompt

    def test_format_river_sup_response_runs_list(self):
        intent = RiverSupIntent(action="runs_list")
        resp = format_river_sup_response(intent, "show whitewater sup runs")
        assert isinstance(resp, FormattedRiverSupResponse)
        assert "Whitewater Stand-Up Paddleboard Reaches" in str(resp)
        assert "river_sup_info" in resp
        info = resp.get("river_sup_info")
        assert info["action"] == "runs_list"
        assert len(info["runs"]) == 5

    def test_format_river_sup_response_run_detail(self):
        intent = RiverSupIntent(action="run_detail", run_id="french-broad-section-9")
        resp = format_river_sup_response(intent, "tell me about french broad sup")
        assert "French Broad River (Section 9)" in str(resp)
        info = resp.get("river_sup_info")
        assert info["action"] == "run_detail"
        assert info["run"]["run_id"] == "french-broad-section-9"

    def test_format_river_sup_response_calculation(self):
        intent = RiverSupIntent(
            action="river_sup_calculation", run_id="arkansas-river-browns-canyon"
        )
        resp = format_river_sup_response(intent, "calculate river sup volume")
        assert "River SUP Volume & Safety Analysis" in str(resp)
        info = resp.get("river_sup_info")
        assert info["action"] == "river_sup_calculation"
        assert "calculation" in info

    def test_format_river_sup_response_gear_checklist(self):
        intent = RiverSupIntent(action="gear_checklist")
        resp = format_river_sup_response(intent, "gear checklist for river sup")
        assert "River SUP Safety Kit Checklist" in str(resp)
        info = resp.get("river_sup_info")
        assert info["action"] == "gear_checklist"
        assert len(info["gear"]) == 6

    def test_formatted_response_dict_methods(self):
        resp = FormattedRiverSupResponse(
            "sample answer", {"river_sup_info": {"key": "val"}, "answer": "sample answer"}
        )
        assert resp["answer"] == "sample answer"
        assert "river_sup_info" in resp
        assert "nonexistent" not in resp
        assert 123 not in resp
        assert "answer" in list(resp.keys())
        assert "sample answer" in list(resp.values())
        assert ("answer", "sample answer") in list(resp.items())
        assert resp[0] == "s"

    def test_filter_routes_class_ii(self):
        class_ii_runs = get_river_sup_runs(difficulty="class_ii")
        assert class_ii_runs == []

    def test_detect_class_ii_intent(self):
        intent = detect_river_sup_intent("Class II river paddleboard reaches")
        assert intent is not None
        assert intent.difficulty == "class_ii"

    def test_format_calculation_with_invalid_run_fallback(self):
        intent = RiverSupIntent(action="river_sup_calculation", run_id="non-existent-run")
        resp = format_river_sup_response(intent, "calculate")
        assert isinstance(resp, FormattedRiverSupResponse)
        assert "river_sup_info" in resp
