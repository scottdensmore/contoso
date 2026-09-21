import pytest
from contoso_chat.nordic_skiing import (
    NordicGearRequirement,
    NordicSkiingIntent,
    NordicTrailModel,
    WaxAdvisorRequest,
    WaxAdvisorResponse,
    build_nordic_skiing_prompt,
    calculate_wax_plan,
    detect_nordic_skiing_intent,
    format_nordic_skiing_response,
    get_nordic_gear,
    get_nordic_trail_by_id,
    get_nordic_trails,
)


class TestNordicTrailCatalog:
    def test_get_all_trails(self):
        trails = get_nordic_trails()
        assert len(trails) == 5
        trail_ids = {t.trail_id for t in trails}
        assert trail_ids == {
            "methow-valley-community-trail",
            "trapp-family-sugar-road",
            "devil-thumb-ranch-high-lonesome",
            "royal-gorge-rainbow-ridge",
            "boundary-waters-banadad-trail",
        }

    def test_get_trails_filter_discipline(self):
        skate_trails = get_nordic_trails(discipline="skate")
        assert len(skate_trails) == 4
        skate_ids = {t.trail_id for t in skate_trails}
        assert "boundary-waters-banadad-trail" not in skate_ids
        assert "methow-valley-community-trail" in skate_ids

        classic_trails = get_nordic_trails(discipline="classic")
        assert len(classic_trails) == 5
        classic_ids = {t.trail_id for t in classic_trails}
        assert "boundary-waters-banadad-trail" in classic_ids

        # Case-insensitivity
        case_flex = get_nordic_trails(discipline="SKATE")
        assert len(case_flex) == 4

    def test_get_trail_by_id(self):
        trail = get_nordic_trail_by_id("methow-valley-community-trail")
        assert trail is not None
        assert isinstance(trail, NordicTrailModel)
        assert trail.trail_id == "methow-valley-community-trail"
        assert "Methow" in trail.trail_name
        assert "Winthrop" in trail.region or "Washington" in trail.region
        assert trail.distance_km > 0
        assert trail.elevation_gain_m >= 0
        assert trail.groomed_daily is True
        assert trail.skate_lane_width_m >= 8.0
        assert trail.classic_tracks_count >= 2
        assert len(trail.trail_highlights) >= 2
        assert len(trail.description) > 10

    def test_get_trail_case_insensitive_and_unknown(self):
        trail = get_nordic_trail_by_id("METHOW-VALLEY-COMMUNITY-TRAIL")
        assert trail is not None
        assert trail.trail_id == "methow-valley-community-trail"

        assert get_nordic_trail_by_id("unknown-trail-xyz") is None


class TestNordicGearChecklist:
    def test_get_nordic_gear(self):
        gear = get_nordic_gear()
        assert len(gear) == 6
        for item in gear:
            assert isinstance(item, NordicGearRequirement)
            assert item.item_id
            assert item.name
            assert item.category
            assert item.mandatory is True
            assert item.purpose

        item_ids = {g.item_id for g in gear}
        assert any("boot" in i or "nnn" in i or "prolink" in i for i in item_ids)
        assert any("pole" in i or "carbon" in i for i in item_ids)
        assert any("apparel" in i or "softshell" in i for i in item_ids)
        assert any("wax" in i for i in item_ids)
        assert any("hydration" in i for i in item_ids)
        assert any("cleaner" in i or "skin" in i for i in item_ids)


class TestWaxAdvisorCalculations:
    def test_calculate_standard_blue_extra(self):
        req = WaxAdvisorRequest(
            trail_id="methow-valley-community-trail",
            air_temperature_f=24.0,
            snow_condition="packed_powder",
            ski_base_type="waxable",
        )
        plan = calculate_wax_plan(req)
        assert isinstance(plan, WaxAdvisorResponse)
        assert plan.trail_id == "methow-valley-community-trail"
        assert "Blue Extra" in plan.recommended_kick_wax
        assert "CH6" in plan.recommended_glide_wax or "Blue" in plan.recommended_glide_wax
        assert plan.klister_required is False
        assert "fast" in plan.glide_speed_rating.lower() or "optimal" in plan.glide_speed_rating.lower()
        assert len(plan.wax_advisory) > 20
        assert "pocket" in plan.wax_pocket_pressure.lower() or "camber" in plan.wax_pocket_pressure.lower()

    def test_calculate_green_polar_subzero(self):
        req = WaxAdvisorRequest(
            trail_id="devil-thumb-ranch-high-lonesome",
            air_temperature_f=8.0,
            snow_condition="dry_powder",
            ski_base_type="waxable",
        )
        plan = calculate_wax_plan(req)
        assert "Green" in plan.recommended_kick_wax or "Polar" in plan.recommended_kick_wax
        assert plan.klister_required is False

    def test_calculate_violet_transition(self):
        req = WaxAdvisorRequest(
            trail_id="trapp-family-sugar-road",
            air_temperature_f=30.0,
            snow_condition="packed_powder",
            ski_base_type="waxable",
        )
        plan = calculate_wax_plan(req)
        assert "Violet" in plan.recommended_kick_wax
        assert plan.klister_required is False

    def test_calculate_red_warm_damp(self):
        req = WaxAdvisorRequest(
            trail_id="royal-gorge-rainbow-ridge",
            air_temperature_f=33.0,
            snow_condition="new_damp_snow",
            ski_base_type="waxable",
        )
        plan = calculate_wax_plan(req)
        assert "Red" in plan.recommended_kick_wax
        assert plan.klister_required is False

    def test_calculate_klister_wet_corn(self):
        req = WaxAdvisorRequest(
            trail_id="royal-gorge-rainbow-ridge",
            air_temperature_f=38.0,
            snow_condition="wet_corn",
            ski_base_type="waxable",
        )
        plan = calculate_wax_plan(req)
        assert plan.klister_required is True
        assert "Klister" in plan.recommended_kick_wax

    def test_calculate_klister_icy_crust(self):
        req = WaxAdvisorRequest(
            trail_id="trapp-family-sugar-road",
            air_temperature_f=26.0,
            snow_condition="icy_crust",
            ski_base_type="waxable",
        )
        plan = calculate_wax_plan(req)
        assert plan.klister_required is True
        assert "Klister" in plan.recommended_kick_wax

    def test_calculate_skin_ski_base(self):
        req = WaxAdvisorRequest(
            trail_id="methow-valley-community-trail",
            air_temperature_f=24.0,
            snow_condition="packed_powder",
            ski_base_type="skin",
        )
        plan = calculate_wax_plan(req)
        assert plan.klister_required is False
        assert "mohair" in plan.recommended_kick_wax.lower() or "skin" in plan.recommended_kick_wax.lower()

    def test_calculate_fishscale_waxless_base(self):
        req = WaxAdvisorRequest(
            trail_id="boundary-waters-banadad-trail",
            air_temperature_f=22.0,
            snow_condition="packed_powder",
            ski_base_type="fishscale",
        )
        plan = calculate_wax_plan(req)
        assert plan.klister_required is False
        assert "fishscale" in plan.recommended_kick_wax.lower() or "waxless" in plan.recommended_kick_wax.lower()

    def test_calculate_unknown_trail_raises_error(self):
        req = WaxAdvisorRequest(trail_id="invalid-trail-id")
        with pytest.raises(ValueError, match="not found"):
            calculate_wax_plan(req)


class TestNordicSkiingIntentDetection:
    def test_detect_nordic_trails_list(self):
        intent = detect_nordic_skiing_intent("Can you show me cross-country ski trails for skate skiing?")
        assert intent is not None
        assert intent.action == "trails_list"
        assert intent.discipline == "skate"

    def test_detect_nordic_trail_detail(self):
        intent = detect_nordic_skiing_intent("Tell me about Methow Valley Community Trail distance and elevation")
        assert intent is not None
        assert intent.action == "trail_detail"
        assert intent.trail_id == "methow-valley-community-trail"

    def test_detect_wax_plan(self):
        intent = detect_nordic_skiing_intent("What is the kick wax recommendation for 25 degrees at Devil's Thumb Ranch?")
        assert intent is not None
        assert intent.action == "wax_plan"
        assert intent.trail_id == "devil-thumb-ranch-high-lonesome"

    def test_detect_gear_checklist(self):
        intent = detect_nordic_skiing_intent("What mandatory Nordic equipment and NNN boots do I need?")
        assert intent is not None
        assert intent.action == "gear_checklist"

    def test_detect_klister_inquiry(self):
        intent = detect_nordic_skiing_intent("When are klister snow conditions present on Nordic trails?")
        assert intent is not None
        assert intent.action == "wax_plan"

    def test_detect_skin_ski_cleaning(self):
        intent = detect_nordic_skiing_intent("How do I do skin ski cleaning and mohair maintenance?")
        assert intent is not None
        assert intent.action in ("wax_plan", "gear_checklist")

    def test_critical_disambiguation_avoids_alpine_ski_touring(self):
        # Alpine backcountry ski touring queries handled by ski_touring.py MUST NOT be hijacked!
        assert detect_nordic_skiing_intent(
            "I want to go backcountry ski touring on Camp Muir with my splitboard and avalanche beacon"
        ) is None
        assert detect_nordic_skiing_intent(
            "What climbing skins should I get for backcountry ski touring?"
        ) is None
        assert detect_nordic_skiing_intent(
            "Can I rent an avalanche transceiver, shovel, probe and AT bindings?"
        ) is None
        assert detect_nordic_skiing_intent(
            "How do I skin up the ski tour at Kendall Lakes?"
        ) is None

    def test_detect_unrelated_query_returns_none(self):
        assert detect_nordic_skiing_intent("What is the status of my order #12345?") is None
        assert detect_nordic_skiing_intent("Can I get a refund for my tent?") is None
        assert detect_nordic_skiing_intent("Tell me about white water rafting on the Deschutes River") is None


class TestNordicSkiingPromptAndResponseFormatting:
    def test_build_prompt_with_trail(self):
        intent = NordicSkiingIntent(
            action="trail_detail",
            trail_id="methow-valley-community-trail",
        )
        prompt = build_nordic_skiing_prompt(intent)
        assert "Methow Community Trail" in prompt
        assert "Winthrop" in prompt or "Washington" in prompt
        assert "Swix" in prompt or "Kick Wax" in prompt
        assert "NNN" in prompt or "Prolink" in prompt

    def test_format_response_wax_plan(self):
        intent = NordicSkiingIntent(
            action="wax_plan",
            trail_id="methow-valley-community-trail",
        )
        res = format_nordic_skiing_response(intent)
        assert "answer" in res
        assert "nordic_skiing_info" in res
        info = res["nordic_skiing_info"]
        assert info["action"] == "wax_plan"
        assert "wax_plan" in info
        assert info["wax_plan"]["trail_id"] == "methow-valley-community-trail"

    def test_format_response_trail_detail(self):
        intent = NordicSkiingIntent(
            action="trail_detail",
            trail_id="trapp-family-sugar-road",
        )
        res = format_nordic_skiing_response(intent)
        assert "answer" in res
        assert "nordic_skiing_info" in res
        info = res["nordic_skiing_info"]
        assert info["action"] == "trail_detail"
        assert info["trail"]["trail_id"] == "trapp-family-sugar-road"

    def test_format_response_gear_checklist(self):
        intent = NordicSkiingIntent(action="gear_checklist")
        res = format_nordic_skiing_response(intent)
        assert "answer" in res
        assert "nordic_skiing_info" in res
        info = res["nordic_skiing_info"]
        assert info["action"] == "gear_checklist"
        assert len(info["gear"]) == 6

    def test_format_response_trails_list(self):
        intent = NordicSkiingIntent(action="trails_list")
        res = format_nordic_skiing_response(intent)
        assert "answer" in res
        assert "nordic_skiing_info" in res
        info = res["nordic_skiing_info"]
        assert info["action"] == "trails_list"
        assert len(info["trails"]) == 5
