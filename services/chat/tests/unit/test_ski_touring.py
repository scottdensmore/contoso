import pytest
from contoso_chat.ski_touring import (
    SkinningPaceRequest,
    SkinningPaceResponse,
    SkiTourIntent,
    SkiTourRouteModel,
    build_ski_tour_prompt,
    calculate_skinning_pace,
    detect_ski_tour_intent,
    format_ski_tour_response,
    get_ski_tour_route_by_id,
    get_ski_tour_routes,
    get_skin_track_etiquette_and_policies,
)


class TestSkiTourRouteCatalog:
    def test_get_all_routes(self):
        routes = get_ski_tour_routes()
        assert len(routes) == 5
        route_ids = {r.route_id for r in routes}
        assert route_ids == {
            "muir-snowfield",
            "kendal-lakes",
            "artist-point-table",
            "silver-basin",
            "blewett-pass-diamond",
        }

    def test_get_routes_filter_difficulty(self):
        advanced = get_ski_tour_routes(difficulty="advanced")
        assert len(advanced) == 2
        adv_ids = {r.route_id for r in advanced}
        assert adv_ids == {"muir-snowfield", "silver-basin"}

        beginner = get_ski_tour_routes(difficulty="beginner_friendly")
        assert len(beginner) == 2
        beg_ids = {r.route_id for r in beginner}
        assert beg_ids == {"artist-point-table", "blewett-pass-diamond"}

    def test_get_routes_filter_zone(self):
        crest = get_ski_tour_routes(zone="cascade_crest")
        assert len(crest) == 2
        crest_ids = {r.route_id for r in crest}
        assert crest_ids == {"kendal-lakes", "silver-basin"}

        volcano = get_ski_tour_routes(zone="volcano_alpine")
        assert len(volcano) == 1
        assert volcano[0].route_id == "muir-snowfield"

    def test_get_route_by_id(self):
        route = get_ski_tour_route_by_id("muir-snowfield")
        assert route is not None
        assert isinstance(route, SkiTourRouteModel)
        assert route.name == "Camp Muir Snowfield"
        assert route.region == "Mount Rainier National Park"
        assert route.zone == "volcano_alpine"
        assert route.difficulty == "advanced"
        assert route.distance_miles == 9.0
        assert route.elevation_gain_ft == 4600
        assert route.max_elevation_ft == 10080
        assert route.avg_uphill_hours == 4.5
        assert route.avalanche_terrain_rating == "challenging"
        assert "Spring" in route.recommended_season
        assert "Pebble Creek" in route.skin_track_notes
        assert "Wilderness Permit" in route.parking_permit_required
        assert "Paradise" in route.uphill_travel_policy

    def test_get_route_case_insensitive_and_unknown(self):
        route = get_ski_tour_route_by_id("MUIR-SNOWFIELD")
        assert route is not None
        assert route.route_id == "muir-snowfield"

        assert get_ski_tour_route_by_id("unknown-tour-999") is None


class TestSkinningPaceCalculation:
    def test_calculate_pace_muir_moderate_firm(self):
        req = SkinningPaceRequest(
            route_id="muir-snowfield",
            fitness_level="moderate",
            snow_condition="firm_skin_track",
            party_size=2,
        )
        res = calculate_skinning_pace(req)
        assert isinstance(res, SkinningPaceResponse)
        assert res.route_id == "muir-snowfield"
        # base=1100, snow=1.05, party=max(0.75, 1 - 1*0.03)=0.97 -> 1100 * 1.05 * 0.97 = 1120.35 -> 1120
        assert res.vertical_feet_per_hour == 1120
        # uphill = round(4600 / 1120 * 60) = 246
        assert res.estimated_uphill_minutes == 246
        # descent = round(9.0 * 8) = 72
        assert res.estimated_descent_minutes == 72
        # total = 246 + 20 + 72 = 338
        assert res.total_tour_minutes == 338
        assert res.transition_count == 2
        # hydration = round((338 / 60) * 0.7, 1) = 3.9
        assert res.hydration_liters == 3.9
        # calories = round(246 * 9) = 2214
        assert res.calories_burned == 2214
        assert res.recommended_turnaround_time == "11:06"
        assert any("crampon" in g.lower() for g in res.gear_recommendations)

    def test_calculate_pace_breaking_trail_powder(self):
        req = SkinningPaceRequest(
            route_id="artist-point-table",
            fitness_level="recreational",
            snow_condition="breaking_trail_powder",
            party_size=1,
        )
        res = calculate_skinning_pace(req)
        # base=800, snow=0.75, party=1.0 -> 600
        assert res.vertical_feet_per_hour == 600
        # gain 1400 -> round(1400 / 600 * 60) = 140
        assert res.estimated_uphill_minutes == 140
        # descent 4.0 * 8 = 32
        assert res.estimated_descent_minutes == 32
        # total 140 + 20 + 32 = 192
        assert res.total_tour_minutes == 192
        assert res.calories_burned == 140 * 9

    def test_calculate_pace_athletic_skimo(self):
        req = SkinningPaceRequest(
            route_id="silver-basin",
            fitness_level="skimo_racer",
            snow_condition="firm_skin_track",
            party_size=4,
        )
        res = calculate_skinning_pace(req)
        # base=2000, snow=1.05, party=1 - 3*0.03 = 0.91 -> 2000 * 1.05 * 0.91 = 1911
        assert res.vertical_feet_per_hour == 1911
        # calories athletic/skimo rate = 12
        assert res.calories_burned == round(res.estimated_uphill_minutes * 12)

    def test_invalid_route_raises(self):
        req = SkinningPaceRequest(route_id="non-existent-tour")
        with pytest.raises(ValueError, match="not found"):
            calculate_skinning_pace(req)


class TestSkinTrackEtiquetteAndPolicies:
    def test_etiquette_and_policies_structure(self):
        data = get_skin_track_etiquette_and_policies()
        assert isinstance(data, dict)
        assert "title" in data
        assert "skin_track_etiquette" in data
        assert len(data["skin_track_etiquette"]) >= 4
        assert "resort_uphill_policies" in data
        assert "splitboard_transition_tips" in data
        text = str(data).lower()
        assert "bootpack" in text
        assert "crystal mountain" in text
        assert "yield" in text


class TestSkiTourIntentDetection:
    def test_detect_routes(self):
        intent = detect_ski_tour_intent("Show me backcountry ski touring routes in the Cascades")
        assert intent is not None
        assert intent.action == "routes"

    def test_detect_route_detail(self):
        intent = detect_ski_tour_intent("What are the route details and skin track for Camp Muir Snowfield?")
        assert intent is not None
        assert intent.action == "route_detail"
        assert intent.route_id == "muir-snowfield"

    def test_detect_pace_calc(self):
        intent = detect_ski_tour_intent("Calculate my skinning pace and uphill time for Camp Muir with moderate fitness on firm snow")
        assert intent is not None
        assert intent.action == "pace_calc"
        assert intent.route_id == "muir-snowfield"
        assert intent.fitness_level == "moderate"
        assert intent.snow_condition == "firm_skin_track"

    def test_detect_etiquette_and_resort_policy(self):
        intent = detect_ski_tour_intent("What is skin track etiquette and Crystal Mountain resort uphill travel policy?")
        assert intent is not None
        assert intent.action == "etiquette_policy"

    def test_unrelated_queries(self):
        assert detect_ski_tour_intent("Can I return climbing shoes?") is None
        assert detect_ski_tour_intent("Tell me about kayak rentals") is None
        assert detect_ski_tour_intent("What is the refund policy?") is None


class TestSkiTourResponseAndPrompt:
    def test_format_pace_response(self):
        intent = SkiTourIntent(
            action="pace_calc",
            route_id="muir-snowfield",
            fitness_level="moderate",
            snow_condition="firm_skin_track",
        )
        res = format_ski_tour_response(intent)
        assert "answer" in res
        assert "ski_tour_info" in res
        info = res["ski_tour_info"]
        assert info["action"] == "pace_calc"
        assert info["route_id"] == "muir-snowfield"
        assert info["estimated_uphill_minutes"] == 246
        assert "Camp Muir" in res["answer"]
        assert "246" in res["answer"] or "4.1" in res["answer"] or "4h" in res["answer"]

    def test_format_route_detail_response(self):
        intent = SkiTourIntent(
            action="route_detail",
            route_id="artist-point-table",
        )
        res = format_ski_tour_response(intent)
        assert "answer" in res
        assert "ski_tour_info" in res
        info = res["ski_tour_info"]
        assert info["action"] == "route_detail"
        assert info["route"]["route_id"] == "artist-point-table"
        assert "Artist Point" in res["answer"]

    def test_format_etiquette_response(self):
        intent = SkiTourIntent(action="etiquette_policy")
        res = format_ski_tour_response(intent)
        assert "answer" in res
        assert "ski_tour_info" in res
        info = res["ski_tour_info"]
        assert info["action"] == "etiquette_policy"
        assert "bootpack" in res["answer"].lower() or "skin track" in res["answer"].lower()

    def test_format_routes_response(self):
        intent = SkiTourIntent(action="routes")
        res = format_ski_tour_response(intent)
        assert "answer" in res
        assert "ski_tour_info" in res
        info = res["ski_tour_info"]
        assert info["action"] == "routes"
        assert len(info["routes"]) == 5

    def test_build_ski_tour_prompt(self):
        intent = SkiTourIntent(action="route_detail", route_id="silver-basin")
        prompt = build_ski_tour_prompt(intent)
        assert "Silver Basin" in prompt
        assert "skin track" in prompt.lower() or "avalanche" in prompt.lower()
