import pytest
from contoso_chat.avalanche import (
    AvalancheIntent,
    AvalancheProblemModel,
    AvalancheZoneModel,
    SlopeAssessmentRequest,
    SlopeAssessmentResponse,
    assess_slope_terrain,
    build_avalanche_prompt,
    detect_avalanche_intent,
    format_avalanche_response,
    get_avalanche_zone_by_id,
    get_avalanche_zones,
    get_companion_rescue_protocol,
)


class TestAvalancheModelsAndCatalog:
    def test_get_all_zones(self):
        zones = get_avalanche_zones()
        assert len(zones) == 5
        zone_ids = {z.zone_id for z in zones}
        assert zone_ids == {
            "stevens-pass",
            "snoqualmie-pass",
            "mount-baker",
            "mount-rainier",
            "olympics",
        }

    def test_get_zones_with_filter(self):
        zones = get_avalanche_zones(zone_id="stevens-pass")
        assert len(zones) == 1
        assert zones[0].zone_id == "stevens-pass"
        assert zones[0].name == "Stevens Pass / Cascade Crest"
        assert zones[0].region == "Central Cascades"
        assert zones[0].overall_danger == 3
        assert zones[0].danger_ratings == {
            "above_treeline": 3,
            "near_treeline": 3,
            "below_treeline": 2,
        }

    def test_get_zone_by_id(self):
        zone = get_avalanche_zone_by_id("snoqualmie-pass")
        assert zone is not None
        assert isinstance(zone, AvalancheZoneModel)
        assert zone.zone_id == "snoqualmie-pass"
        assert zone.region == "West Slopes South"
        assert zone.overall_danger == 3
        assert zone.danger_ratings["above_treeline"] == 3
        assert zone.danger_ratings["near_treeline"] == 2
        assert zone.danger_ratings["below_treeline"] == 1
        assert len(zone.problems) > 0

    def test_get_zone_by_id_case_insensitive_and_unknown(self):
        zone = get_avalanche_zone_by_id("Mount-Baker")
        assert zone is not None
        assert zone.zone_id == "mount-baker"
        assert zone.overall_danger == 4

        assert get_avalanche_zone_by_id("unknown-zone-xyz") is None

    def test_zone_problems_structure(self):
        rainier = get_avalanche_zone_by_id("mount-rainier")
        assert rainier is not None
        assert rainier.overall_danger == 4
        assert len(rainier.problems) >= 1
        prob = rainier.problems[0]
        assert isinstance(prob, AvalancheProblemModel)
        assert prob.problem_type in {"wind_slab", "storm_slab", "persistent_slab", "wet_loose"}
        assert len(prob.aspects) > 0
        assert len(prob.elevations) > 0
        assert len(prob.travel_advice) > 0


class TestSlopeAssessment:
    def test_low_angle_safe(self):
        req = SlopeAssessmentRequest(
            zone_id="stevens-pass",
            slope_angle_deg=26.5,
            elevation_band="near_treeline",
            aspect="NE",
        )
        res = assess_slope_terrain(req)
        assert isinstance(res, SlopeAssessmentResponse)
        assert res.zone_id == "stevens-pass"
        assert res.slope_risk_category == "low_angle_safe"
        assert res.is_in_avalanche_terrain is False
        assert res.danger_level == 3
        assert "30" in res.recommendation or "under 30" in res.recommendation.lower()
        assert len(res.safety_protocols) > 0

    def test_prime_avalanche_terrain(self):
        req = SlopeAssessmentRequest(
            zone_id="snoqualmie-pass",
            slope_angle_deg=37.0,
            elevation_band="above_treeline",
            aspect="N",
        )
        res = assess_slope_terrain(req)
        assert res.zone_id == "snoqualmie-pass"
        assert res.slope_risk_category == "prime_avalanche_terrain"
        assert res.is_in_avalanche_terrain is True
        assert res.danger_level == 3
        assert "30" in res.recommendation and "45" in res.recommendation
        assert len(res.advisory) > 0
        assert len(res.safety_protocols) > 0

    def test_extreme_steep_sluff(self):
        req = SlopeAssessmentRequest(
            zone_id="mount-baker",
            slope_angle_deg=48.0,
            elevation_band="above_treeline",
            aspect="NW",
        )
        res = assess_slope_terrain(req)
        assert res.zone_id == "mount-baker"
        assert res.slope_risk_category == "extreme_steep_sluff"
        assert res.is_in_avalanche_terrain is True
        assert res.danger_level == 4
        assert "sluff" in res.recommendation.lower() or "extreme" in res.recommendation.lower()

    def test_invalid_zone_raises_value_error(self):
        req = SlopeAssessmentRequest(
            zone_id="non-existent-zone",
            slope_angle_deg=35.0,
        )
        with pytest.raises(ValueError, match="not found"):
            assess_slope_terrain(req)


class TestCompanionRescueProtocol:
    def test_rescue_protocol_content(self):
        proto = get_companion_rescue_protocol()
        assert isinstance(proto, dict)
        assert "title" in proto
        assert "steps" in proto
        assert "required_gear" in proto
        assert "beacon" in str(proto["required_gear"]).lower()
        assert "probe" in str(proto["required_gear"]).lower()
        assert "shovel" in str(proto["required_gear"]).lower()
        step_text = str(proto["steps"]).lower()
        assert "transceiver" in step_text or "beacon" in step_text
        assert "probe" in step_text
        assert "shovel" in step_text or "conveyor" in step_text


class TestAvalancheIntentDetection:
    def test_detect_zone_detail(self):
        intent = detect_avalanche_intent("What is the avalanche danger at Stevens Pass today?")
        assert intent is not None
        assert intent.action in {"zone_detail", "zones"}
        assert intent.zone_id == "stevens-pass"

    def test_detect_slope_eval(self):
        intent = detect_avalanche_intent("Assess a 37 degree slope hazard near treeline at Snoqualmie Pass")
        assert intent is not None
        assert intent.action == "slope_eval"
        assert intent.zone_id == "snoqualmie-pass"
        assert intent.slope_angle_deg == 37.0
        assert intent.elevation_band == "near_treeline"

    def test_detect_companion_rescue(self):
        intent = detect_avalanche_intent("How do we conduct a companion avalanche rescue and beacon search?")
        assert intent is not None
        assert intent.action == "companion_rescue"

    def test_detect_general_zones(self):
        intent = detect_avalanche_intent("Show me current NWAC avalanche danger ratings across Washington zones")
        assert intent is not None
        assert intent.action == "zones"

    def test_non_avalanche_query(self):
        assert detect_avalanche_intent("What is the return policy for wool socks?") is None
        assert detect_avalanche_intent("Do you have camping tents in stock?") is None


class TestAvalancheResponseAndPrompt:
    def test_format_slope_eval_response(self):
        intent = AvalancheIntent(
            action="slope_eval",
            zone_id="stevens-pass",
            slope_angle_deg=35.0,
            elevation_band="above_treeline",
            aspect="NE",
        )
        formatted = format_avalanche_response(intent)
        assert "answer" in formatted
        assert "avalanche_info" in formatted
        assert formatted["avalanche_info"]["action"] == "slope_eval"
        assert formatted["avalanche_info"]["is_in_avalanche_terrain"] is True
        assert "Stevens Pass" in formatted["answer"]
        assert "prime" in formatted["answer"].lower() or "avalanche terrain" in formatted["answer"].lower()

    def test_format_zone_detail_response(self):
        intent = AvalancheIntent(
            action="zone_detail",
            zone_id="mount-rainier",
        )
        formatted = format_avalanche_response(intent)
        assert "answer" in formatted
        assert "avalanche_info" in formatted
        assert formatted["avalanche_info"]["action"] == "zone_detail"
        assert "Mount Rainier" in formatted["answer"]

    def test_format_companion_rescue_response(self):
        intent = AvalancheIntent(action="companion_rescue")
        formatted = format_avalanche_response(intent)
        assert "answer" in formatted
        assert "avalanche_info" in formatted
        assert formatted["avalanche_info"]["action"] == "companion_rescue"
        assert "transceiver" in formatted["answer"].lower() or "beacon" in formatted["answer"].lower()

    def test_format_zones_response(self):
        intent = AvalancheIntent(action="zones")
        formatted = format_avalanche_response(intent)
        assert "answer" in formatted
        assert "avalanche_info" in formatted
        assert formatted["avalanche_info"]["action"] == "zones"
        assert len(formatted["avalanche_info"]["zones"]) == 5

    def test_build_avalanche_prompt(self):
        intent = AvalancheIntent(action="zone_detail", zone_id="mount-baker")
        prompt = build_avalanche_prompt(intent)
        assert "Mount Baker" in prompt
        assert "Backcountry Avalanche" in prompt
