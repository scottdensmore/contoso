import pytest
from contoso_chat.stargazing import (
    MeteorShowerModel,
    ObservingSiteModel,
    StargazingIntent,
    ViewingWindowRequest,
    ViewingWindowResponse,
    build_stargazing_prompt,
    calculate_viewing_window,
    detect_stargazing_intent,
    format_stargazing_response,
    get_meteor_shower_calendar,
    get_stargazing_site_by_id,
    get_stargazing_sites,
)


class TestObservingSitesCatalog:
    def test_get_all_sites(self):
        sites = get_stargazing_sites()
        assert len(sites) == 5
        site_ids = {s.site_id for s in sites}
        assert site_ids == {
            "prineville-reservoir",
            "artist-point-baker",
            "john-day-fossil",
            "copper-ridge-cascades",
            "crater-lake-rim",
        }

    def test_get_sites_filter_bortle_max(self):
        bortle_1_sites = get_stargazing_sites(bortle_max=1)
        assert len(bortle_1_sites) >= 2
        for s in bortle_1_sites:
            assert s.bortle_class <= 1

        bortle_2_sites = get_stargazing_sites(bortle_max=2)
        assert len(bortle_2_sites) == 5
        for s in bortle_2_sites:
            assert s.bortle_class <= 2

    def test_get_site_by_id_valid(self):
        site = get_stargazing_site_by_id("prineville-reservoir")
        assert site is not None
        assert isinstance(site, ObservingSiteModel)
        assert site.site_id == "prineville-reservoir"
        assert "Prineville Reservoir" in site.name
        assert site.region != ""
        assert site.bortle_class in (1, 2)
        assert site.sqm_reading >= 21.0
        assert site.elevation_ft > 0
        assert len(site.best_seasons) > 0
        assert len(site.featured_targets) > 0
        assert site.access_notes != ""
        assert site.overnight_camping is True

    def test_get_site_by_id_case_insensitive_and_name(self):
        site_upper = get_stargazing_site_by_id("PRINEVILLE-RESERVOIR")
        assert site_upper is not None
        assert site_upper.site_id == "prineville-reservoir"

        site_name = get_stargazing_site_by_id("Mount Baker Artist Point")
        assert site_name is not None
        assert site_name.site_id == "artist-point-baker"

    def test_get_site_by_id_nonexistent(self):
        assert get_stargazing_site_by_id("non-existent-site-999") is None


class TestViewingWindowCalculation:
    def test_calculate_viewing_optimal_new_moon(self):
        req = ViewingWindowRequest(
            site_id="prineville-reservoir",
            moon_phase="new_moon",
            cloud_cover_percent=5,
            target_type="milky_way",
        )
        res = calculate_viewing_window(req)
        assert isinstance(res, ViewingWindowResponse)
        assert res.site_id == "prineville-reservoir"
        assert "Prineville" in res.site_name
        assert res.bortle_class in (1, 2)
        assert res.score >= 80
        assert res.viewing_quality in ("Optimal", "Excellent")
        assert len(res.reasons) >= 2
        assert any(term in res.recommended_optics.lower() for term in ["optics", "lens", "camera", "binocular"])
        assert any(term in res.dark_adaptation_advice.lower() for term in ["dark adaptation", "red", "scotopic", "rhodopsin"])

    def test_calculate_viewing_poor_full_moon_cloudy(self):
        req = ViewingWindowRequest(
            site_id="crater-lake-rim",
            moon_phase="full_moon",
            cloud_cover_percent=75,
            target_type="deep_sky",
        )
        res = calculate_viewing_window(req)
        assert res.score < 50
        assert res.viewing_quality == "Poor"
        reasons_text = " ".join(res.reasons).lower()
        assert "cloud" in reasons_text
        assert "moon" in reasons_text

    def test_calculate_viewing_meteor_shower_optics(self):
        req = ViewingWindowRequest(
            site_id="copper-ridge-cascades",
            moon_phase="waxing_crescent",
            cloud_cover_percent=10,
            target_type="meteor_shower",
        )
        res = calculate_viewing_window(req)
        assert res.score >= 65
        assert "naked eye" in res.recommended_optics.lower()

    def test_calculate_viewing_unknown_site_raises(self):
        req = ViewingWindowRequest(site_id="unknown-site-404")
        with pytest.raises(ValueError, match="not found"):
            calculate_viewing_window(req)


class TestMeteorShowerCalendar:
    def test_get_meteor_shower_calendar(self):
        showers = get_meteor_shower_calendar()
        assert len(showers) == 4
        shower_ids = {s.shower_id for s in showers}
        assert shower_ids == {"perseids", "geminids", "orionids", "lyrids"}

        perseids = next(s for s in showers if s.shower_id == "perseids")
        assert isinstance(perseids, MeteorShowerModel)
        assert "Perseid" in perseids.name
        assert "August" in perseids.peak_date
        assert perseids.zhr_rate >= 80
        assert "Swift-Tuttle" in perseids.parent_body

        geminids = next(s for s in showers if s.shower_id == "geminids")
        assert "December" in geminids.peak_date
        assert geminids.zhr_rate >= 100
        assert "Phaethon" in geminids.parent_body


class TestStargazingIntentDetection:
    def test_detect_sites_list(self):
        intent = detect_stargazing_intent("What are the best dark sky parks for stargazing in Oregon?")
        assert intent is not None
        assert intent.action == "sites_list"

    def test_detect_sites_list_bortle_filter(self):
        intent = detect_stargazing_intent("Show me dark sky sanctuaries with Bortle class 1")
        assert intent is not None
        assert intent.action == "sites_list"
        assert intent.bortle_max == 1

    def test_detect_site_detail(self):
        intent = detect_stargazing_intent("Tell me about stargazing at Prineville Reservoir")
        assert intent is not None
        assert intent.action == "site_detail"
        assert intent.site_id == "prineville-reservoir"

    def test_detect_calculate_viewing(self):
        intent = detect_stargazing_intent(
            "Calculate stargazing conditions and viewing quality for Crater Lake with new moon and 10% clouds for milky way"
        )
        assert intent is not None
        assert intent.action == "calculate_viewing"
        assert intent.site_id == "crater-lake-rim"
        assert intent.target_type == "milky_way"

    def test_detect_meteor_showers(self):
        intent = detect_stargazing_intent("When is the Perseid meteor shower peaking this year?")
        assert intent is not None
        assert intent.action == "meteor_showers"

    def test_detect_gear_guide(self):
        intent = detect_stargazing_intent("What telescope or binoculars do I need for astrophotography and dark sky observation?")
        assert intent is not None
        assert intent.action == "gear_guide"

    def test_unrelated_queries_return_none(self):
        assert detect_stargazing_intent("Can I return climbing shoes?") is None
        assert detect_stargazing_intent("Where is my order #12345?") is None
        assert detect_stargazing_intent("What is the refund policy?") is None
        assert detect_stargazing_intent("What are the campfire regulations in Central Oregon?") is None


class TestStargazingResponseAndPrompt:
    def test_format_calculate_viewing_response(self):
        intent = StargazingIntent(
            action="calculate_viewing",
            site_id="prineville-reservoir",
            target_type="milky_way",
        )
        res = format_stargazing_response(intent)
        assert "answer" in res
        assert "stargazing_info" in res
        info = res["stargazing_info"]
        assert info["action"] == "calculate_viewing"
        assert info["site_id"] == "prineville-reservoir"
        assert "Prineville" in res["answer"]
        assert "score" in info or "viewing_window" in info

    def test_format_site_detail_response(self):
        intent = StargazingIntent(action="site_detail", site_id="artist-point-baker")
        res = format_stargazing_response(intent)
        assert "answer" in res
        assert "stargazing_info" in res
        info = res["stargazing_info"]
        assert info["action"] == "site_detail"
        assert "Artist Point" in res["answer"]

    def test_format_meteor_showers_response(self):
        intent = StargazingIntent(action="meteor_showers")
        res = format_stargazing_response(intent)
        assert "answer" in res
        assert "stargazing_info" in res
        info = res["stargazing_info"]
        assert info["action"] == "meteor_showers"
        assert "Perseid" in res["answer"]

    def test_format_gear_guide_response(self):
        intent = StargazingIntent(action="gear_guide")
        res = format_stargazing_response(intent)
        assert "answer" in res
        assert "stargazing_info" in res
        assert any(term in res["answer"].lower() for term in ["optics", "telescope", "binocular"])

    def test_format_sites_list_response(self):
        intent = StargazingIntent(action="sites_list")
        res = format_stargazing_response(intent)
        assert "answer" in res
        assert "stargazing_info" in res
        info = res["stargazing_info"]
        assert info["action"] == "sites_list"
        assert len(info["sites"]) == 5

    def test_build_stargazing_prompt(self):
        intent = StargazingIntent(action="site_detail", site_id="crater-lake-rim")
        prompt = build_stargazing_prompt(intent)
        assert "Crater Lake" in prompt
        assert any(term in prompt.lower() for term in ["dark sky", "stargazing"])
