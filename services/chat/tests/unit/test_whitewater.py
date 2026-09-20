import pytest
from contoso_chat.whitewater import (
    RapidModel,
    RiverRunModel,
    RiverSafetyRequest,
    RiverSafetyResponse,
    WhitewaterIntent,
    assess_river_safety,
    build_whitewater_prompt,
    detect_whitewater_intent,
    format_whitewater_response,
    get_whitewater_run_by_id,
    get_whitewater_runs,
    get_whitewater_safety_protocols,
)


class TestRiverRunCatalog:
    def test_get_all_runs(self):
        runs = get_whitewater_runs()
        assert len(runs) == 5
        run_ids = {r.run_id for r in runs}
        assert run_ids == {
            "wenatchee-tumwater",
            "skykomish-boulder-drop",
            "white-salmon-husum",
            "snoqualmie-middle-fork",
            "deschutes-maupin",
        }

    def test_get_runs_filter_class(self):
        class_iv = get_whitewater_runs(class_rating="Class IV")
        assert len(class_iv) >= 1
        iv_ids = {r.run_id for r in class_iv}
        assert "skykomish-boulder-drop" in iv_ids

        class_v = get_whitewater_runs(class_rating="Class V")
        assert len(class_v) == 1
        assert class_v[0].run_id == "wenatchee-tumwater"

    def test_get_runs_filter_region(self):
        columbia = get_whitewater_runs(region="Columbia")
        assert len(columbia) >= 1
        columbia_ids = {r.run_id for r in columbia}
        assert "white-salmon-husum" in columbia_ids

    def test_get_run_by_id(self):
        run = get_whitewater_run_by_id("skykomish-boulder-drop")
        assert run is not None
        assert isinstance(run, RiverRunModel)
        assert run.run_id == "skykomish-boulder-drop"
        assert run.river == "Skykomish River"
        assert run.class_rating == "Class IV"
        assert run.length_miles == 8.5
        assert run.current_flow_cfs == 3400
        assert run.min_runnable_cfs == 1500
        assert run.max_runnable_cfs == 9000
        assert run.water_temp_f == 46.0
        assert run.gauge_station_id == "USGS-12134500"
        assert len(run.key_rapids) >= 1
        assert isinstance(run.key_rapids[0], RapidModel)
        sample_rapid = RapidModel(
            name="Test Rapid",
            rating="Class IV",
            hazard_description="Holes and boulders",
            scout_recommended=True,
        )
        assert sample_rapid.name == "Test Rapid"
        assert any("Boulder Drop" in rap.name for rap in run.key_rapids)
        assert len(run.hazards) >= 1

    def test_get_run_case_insensitive_and_unknown(self):
        run = get_whitewater_run_by_id("SKYKOMISH-BOULDER-DROP")
        assert run is not None
        assert run.run_id == "skykomish-boulder-drop"

        assert get_whitewater_run_by_id("unknown-river-999") is None


class TestRiverSafetyAssessment:
    def test_assess_river_safety_intermediate_on_class_iv(self):
        req = RiverSafetyRequest(
            run_id="skykomish-boulder-drop",
            craft="kayak",
            paddler_skill="intermediate",
            flow_cfs=3400,
        )
        res = assess_river_safety(req)
        assert isinstance(res, RiverSafetyResponse)
        assert res.run_id == "skykomish-boulder-drop"
        assert res.flow_status == "Optimal Medium"
        assert res.is_runnable is True
        assert res.suitability == "not_recommended"
        assert "intermediate" in res.recommendation_text.lower()
        assert (
            "Class IV" in res.recommendation_text or "class iv" in res.recommendation_text.lower()
        )
        assert res.cold_water_immersion_warning is True
        assert len(res.required_gear) >= 4
        assert any("drysuit" in g.lower() or "wetsuit" in g.lower() for g in res.required_gear)
        assert len(res.safety_checklist) >= 3

    def test_assess_river_safety_expert_on_class_iv(self):
        req = RiverSafetyRequest(
            run_id="skykomish-boulder-drop",
            craft="kayak",
            paddler_skill="expert",
        )
        res = assess_river_safety(req)
        assert res.is_runnable is True
        assert res.suitability == "suitable"

    def test_assess_river_safety_too_low(self):
        req = RiverSafetyRequest(
            run_id="skykomish-boulder-drop",
            flow_cfs=1000,  # min is 1500
        )
        res = assess_river_safety(req)
        assert res.flow_status == "Too Low"
        assert res.is_runnable is False
        assert res.suitability == "unsuitable"

    def test_assess_river_safety_flood(self):
        req = RiverSafetyRequest(
            run_id="skykomish-boulder-drop",
            flow_cfs=11000,  # max is 9000
        )
        res = assess_river_safety(req)
        assert res.flow_status == "Flood"
        assert res.is_runnable is False
        assert res.suitability == "unsuitable"

    def test_assess_river_safety_high(self):
        req = RiverSafetyRequest(
            run_id="skykomish-boulder-drop",
            flow_cfs=7500,  # optimal_high is 5500, max is 9000
            paddler_skill="expert",
        )
        res = assess_river_safety(req)
        assert res.flow_status == "High"
        assert res.is_runnable is True

    def test_assess_river_safety_unknown_run_raises(self):
        req = RiverSafetyRequest(run_id="unknown-run")
        with pytest.raises(ValueError, match="not found"):
            assess_river_safety(req)


class TestWhitewaterSafetyProtocols:
    def test_get_safety_protocols(self):
        protocols = get_whitewater_safety_protocols()
        assert isinstance(protocols, dict)
        assert "defensive_swimming_position" in protocols
        assert "strainer_hazards" in protocols
        assert "river_rescue_protocols" in protocols
        assert "cold_water_immersion_rules" in protocols
        assert "essential_gear" in protocols
        assert len(protocols["defensive_swimming_position"]) >= 2
        assert len(protocols["strainer_hazards"]) >= 2


class TestWhitewaterIntentDetection:
    def test_detect_runs_intent(self):
        intent = detect_whitewater_intent(
            "What whitewater river runs do you recommend in Washington?"
        )
        assert intent is not None
        assert intent.action == "runs"

    def test_detect_run_detail_intent(self):
        intent = detect_whitewater_intent(
            "Tell me about the Tumwater Canyon run on the Wenatchee River"
        )
        assert intent is not None
        assert intent.action == "run_detail"
        assert intent.run_id == "wenatchee-tumwater"

    def test_detect_safety_eval_intent(self):
        intent = detect_whitewater_intent(
            "Is 3400 cfs safe for an intermediate kayaker on Skykomish Boulder Drop?"
        )
        assert intent is not None
        assert intent.action == "safety_eval"
        assert intent.run_id == "skykomish-boulder-drop"
        assert intent.paddler_skill == "intermediate"

    def test_detect_hazards_intent(self):
        intent = detect_whitewater_intent(
            "What are river strainer hazards and the defensive swimming position?"
        )
        assert intent is not None
        assert intent.action == "hazards_protocols"

    def test_unrelated_query_ignored(self):
        assert detect_whitewater_intent("Can I return my climbing shoes?") is None
        assert detect_whitewater_intent("What is the best water filter for backpacking?") is None
        assert detect_whitewater_intent("Tell me about Camp Muir ski tour") is None


class TestWhitewaterResponseFormatting:
    def test_format_safety_eval_response(self):
        intent = WhitewaterIntent(
            action="safety_eval",
            run_id="skykomish-boulder-drop",
            paddler_skill="intermediate",
        )
        res = format_whitewater_response(intent)
        assert "answer" in res
        assert "whitewater_info" in res
        info = res["whitewater_info"]
        assert info["action"] == "safety_eval"
        assert info["run_id"] == "skykomish-boulder-drop"
        assert info["flow_status"] == "Optimal Medium"
        assert "Skykomish" in res["answer"]

    def test_format_run_detail_response(self):
        intent = WhitewaterIntent(
            action="run_detail",
            run_id="white-salmon-husum",
        )
        res = format_whitewater_response(intent)
        assert (
            "white_salmon" in res["whitewater_info"]["run"]["run_id"]
            or "white-salmon" in res["whitewater_info"]["run"]["run_id"]
        )
        assert "Husum" in res["answer"]

    def test_format_protocols_response(self):
        intent = WhitewaterIntent(action="hazards_protocols")
        res = format_whitewater_response(intent)
        assert "protocols" in res["whitewater_info"]
        assert "defensive swimming" in res["answer"].lower() or "strainer" in res["answer"].lower()

    def test_format_runs_response(self):
        intent = WhitewaterIntent(action="runs")
        res = format_whitewater_response(intent)
        assert "runs" in res["whitewater_info"]
        assert len(res["whitewater_info"]["runs"]) == 5


class TestWhitewaterPromptBuilding:
    def test_build_prompt_with_run_id(self):
        intent = WhitewaterIntent(action="run_detail", run_id="skykomish-boulder-drop")
        prompt = build_whitewater_prompt(intent)
        assert "Skykomish" in prompt
        assert "Boulder Drop" in prompt
        assert "Defensive swimming" in prompt

    def test_build_prompt_with_class_rating(self):
        intent = WhitewaterIntent(action="runs", class_rating="Class V")
        prompt = build_whitewater_prompt(intent)
        assert "Tumwater Canyon" in prompt
        assert "Class V" in prompt

    def test_build_prompt_general(self):
        intent = WhitewaterIntent(action="runs")
        prompt = build_whitewater_prompt(intent)
        assert "Pacific Northwest Whitewater" in prompt
        assert "Defensive swimming position" in prompt
