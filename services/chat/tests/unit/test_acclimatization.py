import pytest
from contoso_chat.acclimatization import (
    AcclimatizationIntent,
    AcclimatizationPlanRequest,
    AcclimatizationPlanResponse,
    AltitudeMedicalGearRequirement,
    AltitudePeakProfileModel,
    build_acclimatization_prompt,
    calculate_acclimatization_plan,
    detect_acclimatization_intent,
    format_acclimatization_response,
    get_altitude_medical_gear,
    get_altitude_profile_by_id,
    get_altitude_profiles,
)


class TestAltitudePeakCatalog:
    def test_get_all_peaks(self):
        peaks = get_altitude_profiles()
        assert len(peaks) == 5
        peak_ids = {p.peak_id for p in peaks}
        assert peak_ids == {
            "colorado-mount-elbert",
            "washington-mount-rainier",
            "alaska-denali",
            "california-mount-whitney",
            "mexico-pico-de-orizaba",
        }

    def test_get_peaks_filter_zone(self):
        extreme = get_altitude_profiles(zone="extreme_altitude")
        assert len(extreme) == 2
        extreme_ids = {p.peak_id for p in extreme}
        assert extreme_ids == {"alaska-denali", "mexico-pico-de-orizaba"}

        very_high = get_altitude_profiles(zone="very_high_altitude")
        assert len(very_high) == 3
        vh_ids = {p.peak_id for p in very_high}
        assert vh_ids == {
            "colorado-mount-elbert",
            "washington-mount-rainier",
            "california-mount-whitney",
        }

        # Case-insensitivity and partial string matching
        flex = get_altitude_profiles(zone="Extreme")
        assert len(flex) == 2

    def test_get_peak_by_id(self):
        peak = get_altitude_profile_by_id("washington-mount-rainier")
        assert peak is not None
        assert isinstance(peak, AltitudePeakProfileModel)
        assert peak.peak_id == "washington-mount-rainier"
        assert peak.peak_name == "Mount Rainier"
        assert "Cascade Range" in peak.region or "Washington" in peak.region
        assert peak.summit_elevation_ft == 14411
        assert peak.base_elevation_ft > 0
        assert peak.zone == "very_high_altitude"
        assert peak.recommended_days >= 3
        assert peak.max_daily_gain_ft <= 2000
        assert 10.0 <= peak.oxygen_percentage_effective <= 15.0
        assert len(peak.key_camps) >= 2
        assert len(peak.description) > 10

    def test_get_peak_case_insensitive_and_unknown(self):
        peak = get_altitude_profile_by_id("WASHINGTON-MOUNT-RAINIER")
        assert peak is not None
        assert peak.peak_id == "washington-mount-rainier"

        assert get_altitude_profile_by_id("unknown-peak-xyz") is None


class TestAltitudeMedicalGearChecklist:
    def test_get_altitude_medical_gear(self):
        gear = get_altitude_medical_gear()
        assert len(gear) == 6
        for item in gear:
            assert isinstance(item, AltitudeMedicalGearRequirement)
            assert item.item_id
            assert item.name
            assert item.category
            assert item.mandatory is True
            assert item.purpose

        item_ids = {g.item_id for g in gear}
        assert any("oximeter" in i for i in item_ids)
        assert any("diamox" in i or "acetazolamide" in i for i in item_ids)
        assert any("gamow" in i or "hyperbaric" in i for i in item_ids)
        assert any("bottle" in i or "hydration" in i for i in item_ids)


class TestAcclimatizationPlanCalculations:
    def test_calculate_standard_acclimatization_plan(self):
        req = AcclimatizationPlanRequest(
            peak_id="washington-mount-rainier",
            resting_heart_rate=65,
            current_altitude_ft=5400,
            target_altitude_ft=14411,
            days_allowed=3,
            prior_experience="some_14er",
        )
        res = calculate_acclimatization_plan(req)
        assert isinstance(res, AcclimatizationPlanResponse)
        assert res.peak_id == "washington-mount-rainier"
        assert "Mount Rainier" in res.peak_name
        assert 1000 <= res.recommended_daily_ascent_ft <= 1500
        assert res.rest_days_required >= 1
        assert res.ams_risk in ("low", "moderate", "high", "critical")
        assert "sleep low" in res.climb_high_sleep_low_schedule.lower()
        assert 4.0 <= res.hydration_liters <= 5.0
        assert isinstance(res.emergency_oxygen_required, bool)
        assert len(res.medical_advisory) > 20

    def test_calculate_extreme_altitude_denali_plan(self):
        req = AcclimatizationPlanRequest(
            peak_id="alaska-denali",
            resting_heart_rate=75,
            current_altitude_ft=7200,
            target_altitude_ft=20310,
            days_allowed=14,
            prior_experience="high_altitude_expedition",
        )
        res = calculate_acclimatization_plan(req)
        assert res.peak_id == "alaska-denali"
        assert res.recommended_daily_ascent_ft <= 1000
        assert res.rest_days_required >= 3
        assert res.emergency_oxygen_required is True
        assert (
            "Lake Louise" in res.medical_advisory
            or "Gamow" in res.medical_advisory
            or "Diamox" in res.medical_advisory
        )

    def test_calculate_high_risk_rapid_ascent(self):
        req = AcclimatizationPlanRequest(
            peak_id="mexico-pico-de-orizaba",
            resting_heart_rate=92,  # Tachycardic at rest
            current_altitude_ft=7000,
            target_altitude_ft=18491,
            days_allowed=1,  # Excessively rushed
            prior_experience="none",
        )
        res = calculate_acclimatization_plan(req)
        assert res.ams_risk in ("high", "critical")
        assert (
            "rapid ascent" in res.medical_advisory.lower()
            or "danger" in res.medical_advisory.lower()
            or "risk" in res.medical_advisory.lower()
        )

    def test_calculate_plan_invalid_peak(self):
        req = AcclimatizationPlanRequest(peak_id="unknown-volcano")
        with pytest.raises(ValueError, match="not found"):
            calculate_acclimatization_plan(req)


class TestAcclimatizationIntentDetection:
    def test_detect_peaks_list(self):
        intent = detect_acclimatization_intent(
            "What high altitude acclimatization peaks and zones do you support?"
        )
        assert intent is not None
        assert intent.action == "peaks_list"

    def test_detect_peaks_list_by_zone(self):
        intent = detect_acclimatization_intent(
            "Show me extreme altitude peaks acclimatization schedule"
        )
        assert intent is not None
        assert intent.action == "peaks_list"
        assert intent.zone == "extreme_altitude"

    def test_detect_peak_detail(self):
        intent = detect_acclimatization_intent(
            "Tell me about Denali acclimatization camps and summit elevation"
        )
        assert intent is not None
        assert intent.action == "peak_detail"
        assert intent.peak_id == "alaska-denali"

    def test_detect_acclimatization_plan(self):
        intent = detect_acclimatization_intent(
            "Calculate acclimatization plan and ascent pacing for Mount Rainier"
        )
        assert intent is not None
        assert intent.action == "acclimatization_plan"
        assert intent.peak_id == "washington-mount-rainier"

    def test_detect_gear_checklist(self):
        intent = detect_acclimatization_intent(
            "What altitude sickness medical kit and pulse oximeter for altitude do I need?"
        )
        assert intent is not None
        assert intent.action == "gear_checklist"

    def test_detect_lake_louise_score_triage(self):
        intent = detect_acclimatization_intent(
            "How do I evaluate Lake Louise score for acute mountain sickness ams?"
        )
        assert intent is not None
        assert (
            intent.action in ("acclimatization_plan", "gear_checklist", "peaks_list")
            or intent.action == "acclimatization_plan"
        )

    def test_detect_diamox_and_gamow_bag(self):
        intent = detect_acclimatization_intent(
            "What is the Diamox dosage and Gamow bag recommendation?"
        )
        assert intent is not None
        assert intent.action in ("acclimatization_plan", "gear_checklist")

    def test_disambiguation_guards_unrelated_domains(self):
        # General mountaineering without acclimatization keywords must NOT match
        assert (
            detect_acclimatization_intent(
                "What is the recommended rope team spacing and crevasse rescue?"
            )
            is None
        )
        assert (
            detect_acclimatization_intent(
                "What crampons and ice axe do I need for Disappointment Cleaver?"
            )
            is None
        )
        assert detect_acclimatization_intent("How do I rig a z-pulley haul system?") is None

        # General first aid without altitude context must NOT match
        assert (
            detect_acclimatization_intent(
                "A hiker fell, has uncontrollable shivering, fumbling hands, and cannot walk. What first aid should we do?"
            )
            is None
        )
        assert (
            detect_acclimatization_intent(
                "How do I treat heat exhaustion and dehydration on the trail?"
            )
            is None
        )

        # Ski touring without altitude context must NOT match
        assert (
            detect_acclimatization_intent(
                "What is the skinning pace and uphill time for Camp Muir Snowfield?"
            )
            is None
        )
        assert (
            detect_acclimatization_intent("What splitboard transition tips do you recommend?")
            is None
        )

        # Order / store operations
        assert detect_acclimatization_intent("Where is my order #12345 refund?") is None
        assert detect_acclimatization_intent("How do I get a return label for my boots?") is None


class TestAcclimatizationPromptAndFormatting:
    def test_build_acclimatization_prompt_peak_detail(self):
        intent = AcclimatizationIntent(action="peak_detail", peak_id="washington-mount-rainier")
        prompt = build_acclimatization_prompt(intent)
        assert "Mount Rainier" in prompt
        assert "14,411" in prompt or "14411" in prompt
        assert "Acclimatization" in prompt or "Altitude" in prompt
        assert "Medical Kit" in prompt or "Diamox" in prompt or "Gamow" in prompt

    def test_build_acclimatization_prompt_peaks_list(self):
        intent = AcclimatizationIntent(action="peaks_list")
        prompt = build_acclimatization_prompt(intent)
        assert "Denali" in prompt
        assert "Mount Elbert" in prompt

    def test_format_acclimatization_response_plan(self):
        intent = AcclimatizationIntent(
            action="acclimatization_plan", peak_id="washington-mount-rainier"
        )
        res = format_acclimatization_response(intent)
        assert "answer" in res
        assert "acclimatization_info" in res
        info = res["acclimatization_info"]
        assert info["action"] == "acclimatization_plan"
        assert "plan" in info
        assert info["plan"]["peak_id"] == "washington-mount-rainier"

    def test_format_acclimatization_response_gear(self):
        intent = AcclimatizationIntent(action="gear_checklist")
        res = format_acclimatization_response(intent)
        assert "acclimatization_info" in res
        info = res["acclimatization_info"]
        assert info["action"] == "gear_checklist"
        assert len(info["gear"]) == 6
