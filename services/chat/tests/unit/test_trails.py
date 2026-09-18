from contoso_chat.trails import (
    TrailIntent,
    TrailOutfittingResponse,
    build_trail_prompt,
    detect_trail_intent,
    format_trail_response,
    generate_outfitting_plan,
    get_trail_by_name,
    get_trails,
)


class TestTrailCatalog:
    def test_get_all_trails(self):
        trails = get_trails()
        assert len(trails) == 4
        trail_ids = {t.id for t in trails}
        assert trail_ids == {
            "rattlesnake-ridge",
            "bear-peak",
            "multnomah-loop",
            "mount-olympus",
        }

    def test_filter_by_region(self):
        pnw_trails = get_trails(region="Pacific Northwest")
        assert len(pnw_trails) == 2
        ids = {t.id for t in pnw_trails}
        assert ids == {"rattlesnake-ridge", "multnomah-loop"}

        denver_trails = get_trails(region="Denver")
        assert len(denver_trails) == 1
        assert denver_trails[0].id == "bear-peak"

        none_trails = get_trails(region="Appalachia")
        assert len(none_trails) == 0

    def test_filter_by_difficulty(self):
        moderate_trails = get_trails(difficulty="moderate")
        assert len(moderate_trails) == 2
        assert {t.id for t in moderate_trails} == {"rattlesnake-ridge", "multnomah-loop"}

        hard_trails = get_trails(difficulty="hard")
        assert len(hard_trails) == 2
        assert {t.id for t in hard_trails} == {"bear-peak", "mount-olympus"}

    def test_filter_by_region_and_difficulty(self):
        filtered = get_trails(region="Wasatch Range", difficulty="hard")
        assert len(filtered) == 1
        assert filtered[0].id == "mount-olympus"

    def test_get_trail_by_name_exact_and_fuzzy(self):
        trail = get_trail_by_name("rattlesnake-ridge")
        assert trail is not None
        assert trail.name == "Rattlesnake Ridge Trail"
        assert trail.status == "open"
        assert trail.temperature_f == 58
        assert "Trekking poles" in trail.essential_gear

        trail2 = get_trail_by_name("Rattlesnake Ridge")
        assert trail2 is not None
        assert trail2.id == "rattlesnake-ridge"

        trail_bear = get_trail_by_name("bear peak")
        assert trail_bear is not None
        assert trail_bear.id == "bear-peak"
        assert trail_bear.elevation_gain_ft == 2900

        trail_multnomah = get_trail_by_name("Multnomah Falls")
        assert trail_multnomah is not None
        assert trail_multnomah.id == "multnomah-loop"
        assert trail_multnomah.status == "caution"
        assert trail_multnomah.advisory == "Slick rock surfaces near waterfalls spray"

        trail_olympus = get_trail_by_name("Mount Olympus")
        assert trail_olympus is not None
        assert trail_olympus.id == "mount-olympus"

    def test_get_trail_by_name_not_found(self):
        assert get_trail_by_name("Mount Everest") is None
        assert get_trail_by_name("") is None
        assert get_trail_by_name("   ") is None


class TestDetectTrailIntent:
    def test_detect_conditions_intent(self):
        intent = detect_trail_intent("What are the conditions on Rattlesnake Ridge?")
        assert intent is not None
        assert intent.action == "conditions"
        assert intent.trail_name == "rattlesnake-ridge"

        intent2 = detect_trail_intent("Is Multnomah loop open today?")
        assert intent2 is not None
        assert intent2.action == "conditions"
        assert intent2.trail_name == "multnomah-loop"

    def test_detect_outfitting_intent(self):
        intent = detect_trail_intent("What gear should I pack for a spring hike at Bear Peak?")
        assert intent is not None
        assert intent.action == "outfitting"
        assert intent.trail_name == "bear-peak"
        assert intent.season == "spring"
        assert intent.activity == "day-hiking"

        intent2 = detect_trail_intent("Packing checklist for a desert day hike")
        assert intent2 is not None
        assert intent2.action == "outfitting"
        assert intent2.activity == "desert"

    def test_detect_safety_intent(self):
        intent = detect_trail_intent("Safety precautions for wet/slick conditions on Multnomah Falls")
        assert intent is not None
        assert intent.action == "safety"
        assert intent.trail_name == "multnomah-loop"

    def test_detect_recommendation_intent(self):
        intent = detect_trail_intent("Can you recommend some popular hiking trails in Seattle?")
        assert intent is not None
        assert intent.action == "recommendation"
        assert intent.region is not None

        intent2 = detect_trail_intent("Tell me about popular hiking trails and conditions")
        assert intent2 is not None
        assert intent2.action == "recommendation"

    def test_non_trail_queries_return_none(self):
        assert detect_trail_intent("What is the status of my order CTSO-12345?") is None
        assert detect_trail_intent("What are your retail store hours?") is None
        assert detect_trail_intent("Can you help me return my boots?") is None
        assert detect_trail_intent("") is None
        assert detect_trail_intent("   ") is None


class TestGenerateOutfittingPlan:
    def test_generate_plan_for_known_trail(self):
        response = generate_outfitting_plan(
            trail_name="rattlesnake-ridge",
            activity="day-hiking",
            season="spring",
        )
        assert isinstance(response, TrailOutfittingResponse)
        assert response.trail is not None
        assert response.trail.id == "rattlesnake-ridge"
        assert response.activity == "day-hiking"
        assert response.season == "spring"

        # Check gear checklist contains 10 essentials + trail essential gear + weather layers
        checklist_str = " ".join(response.gear_checklist).lower()
        assert "trekking poles" in checklist_str
        assert "hydration" in checklist_str or "water" in checklist_str
        assert "rain" in checklist_str or "shell" in checklist_str
        assert "first aid" in checklist_str
        assert "navigation" in checklist_str or "map" in checklist_str

        # Safety tips
        assert len(response.safety_tips) >= 3

    def test_generate_plan_for_wet_caution_trail(self):
        response = generate_outfitting_plan(
            trail_name="multnomah-loop",
            activity="day-hiking",
            season="spring",
        )
        assert response.trail is not None
        assert response.weather_advisory is not None
        assert "slick" in response.weather_advisory.lower() or "spray" in response.weather_advisory.lower()

        safety_str = " ".join(response.safety_tips).lower()
        assert "slick" in safety_str or "traction" in safety_str or "caution" in safety_str

        checklist_str = " ".join(response.gear_checklist).lower()
        assert "traction" in checklist_str or "grip" in checklist_str or "waterproof" in checklist_str

    def test_generate_plan_without_specific_trail(self):
        response = generate_outfitting_plan(
            trail_name=None,
            activity="backpacking",
            season="summer",
        )
        assert response.trail is None
        assert response.activity == "backpacking"
        assert response.season == "summer"
        assert len(response.gear_checklist) >= 10
        assert len(response.safety_tips) >= 2


class TestPromptBuilderAndResponseFormat:
    def test_build_trail_prompt_includes_details(self):
        intent = TrailIntent(action="conditions", trail_name="rattlesnake-ridge")
        outfitting = generate_outfitting_plan(trail_name="rattlesnake-ridge", activity="day-hiking", season="spring")
        prompt = build_trail_prompt(intent, outfitting)
        assert "Rattlesnake Ridge Trail" in prompt
        assert "58°F" in prompt
        assert "Partly Cloudy" in prompt
        assert "Trekking poles" in prompt

    def test_format_trail_response_structure(self):
        intent = TrailIntent(action="conditions", trail_name="rattlesnake-ridge")
        outfitting = generate_outfitting_plan(trail_name="rattlesnake-ridge", activity="day-hiking", season="spring")
        res = format_trail_response(intent, outfitting)
        assert "answer" in res
        assert "trail_outfitting" in res
        trail_outfitting = res["trail_outfitting"]
        assert trail_outfitting["action"] == "conditions"
        assert trail_outfitting["trail"]["id"] == "rattlesnake-ridge"
        assert "58°F" in res["answer"] or "58" in res["answer"]
        assert "Open" in res["answer"] or "open" in res["answer"]
