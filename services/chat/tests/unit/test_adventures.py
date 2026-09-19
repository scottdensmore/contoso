from contoso_chat.adventures import (
    AdventureGuideInfo,
    AdventureIntent,
    AdventureTourInfo,
    build_adventure_prompt,
    detect_adventure_intent,
    format_adventure_response,
    get_adventure_guides,
    get_adventure_tours,
)


class TestAdventureCatalog:
    def test_get_adventure_tours_all(self):
        tours = get_adventure_tours()
        assert len(tours) == 5
        assert all(isinstance(t, AdventureTourInfo) for t in tours)
        tour_ids = {t.tour_id for t in tours}
        assert tour_ids == {
            "alpine-mountaineering",
            "outdoor-rock-climbing",
            "backcountry-whitewater",
            "wilderness-navigation",
            "avalanche-safety",
        }

    def test_get_adventure_tours_by_category(self):
        climbing = get_adventure_tours(category="Rock Climbing")
        assert len(climbing) == 1
        assert climbing[0].tour_id == "outdoor-rock-climbing"

        mountaineering = get_adventure_tours(category="Mountaineering")
        assert len(mountaineering) == 1
        assert mountaineering[0].tour_id == "alpine-mountaineering"

        water = get_adventure_tours(category="Water Sports")
        assert len(water) == 1
        assert water[0].tour_id == "backcountry-whitewater"

        survival = get_adventure_tours(category="Safety & Survival")
        assert len(survival) == 2
        assert {t.tour_id for t in survival} == {
            "wilderness-navigation",
            "avalanche-safety",
        }

    def test_get_adventure_tours_by_category_alias(self):
        climb = get_adventure_tours(category="climbing")
        assert len(climb) == 1
        assert climb[0].tour_id == "outdoor-rock-climbing"

        rafting = get_adventure_tours(category="rafting")
        assert len(rafting) == 1
        assert rafting[0].tour_id == "backcountry-whitewater"

        safety = get_adventure_tours(category="safety")
        assert len(safety) == 2

    def test_get_adventure_tours_by_difficulty(self):
        beginner = get_adventure_tours(difficulty="Beginner")
        assert len(beginner) == 2
        assert {t.tour_id for t in beginner} == {
            "outdoor-rock-climbing",
            "wilderness-navigation",
        }

        expert = get_adventure_tours(difficulty="Expert")
        assert len(expert) == 1
        assert expert[0].tour_id == "alpine-mountaineering"

    def test_get_adventure_tours_by_category_and_difficulty(self):
        filtered = get_adventure_tours(category="Safety & Survival", difficulty="Beginner")
        assert len(filtered) == 1
        assert filtered[0].tour_id == "wilderness-navigation"

    def test_get_adventure_guides_all(self):
        guides = get_adventure_guides()
        assert len(guides) == 4
        assert all(isinstance(g, AdventureGuideInfo) for g in guides)
        guide_ids = {g.guide_id for g in guides}
        assert guide_ids == {
            "sarah-jenkins",
            "marcus-vance",
            "david-chen",
            "elena-rostova",
        }

        sarah = next(g for g in guides if g.guide_id == "sarah-jenkins")
        assert "AMGA Certified Alpine Guide" in sarah.certifications
        assert any("WFR" in cert or "Wilderness First Responder" in cert for cert in sarah.certifications)
        assert sarah.years_experience == 12

        marcus = next(g for g in guides if g.guide_id == "marcus-vance")
        assert any("AMGA" in cert for cert in marcus.certifications)
        assert marcus.years_experience == 9

        david = next(g for g in guides if g.guide_id == "david-chen")
        assert any("ACA" in cert or "Kayak" in cert for cert in david.certifications)
        assert any("Swiftwater" in cert for cert in david.certifications)
        assert david.years_experience == 14

        elena = next(g for g in guides if g.guide_id == "elena-rostova")
        assert any("Wilderness First Responder" in cert for cert in elena.certifications)
        assert elena.years_experience == 8


class TestDetectAdventureIntent:
    def test_detect_rock_climbing_clinic(self):
        intent = detect_adventure_intent("What beginner rock climbing clinics do you offer?")
        assert intent is not None
        assert isinstance(intent, AdventureIntent)
        assert intent.action in ["tours", "recommend"]
        assert intent.category == "Rock Climbing"
        assert intent.difficulty == "Beginner"

    def test_detect_glacier_prerequisites(self):
        intent = detect_adventure_intent("Do I need previous experience for glacier travel on Mount Rainier?")
        assert intent is not None
        assert isinstance(intent, AdventureIntent)
        assert intent.action == "prerequisites"
        assert intent.tour_id == "alpine-mountaineering"

    def test_detect_whitewater_rafting(self):
        intent = detect_adventure_intent("Tell me about the Rogue River backcountry whitewater rafting trip.")
        assert intent is not None
        assert intent.tour_id == "backcountry-whitewater"
        assert intent.category == "Water Sports"

    def test_detect_avalanche_clinic(self):
        intent = detect_adventure_intent("Do you offer avalanche safety rescue clinics at Snoqualmie Pass?")
        assert intent is not None
        assert intent.tour_id == "avalanche-safety"
        assert intent.category == "Safety & Survival"

    def test_detect_wilderness_navigation(self):
        intent = detect_adventure_intent("I want to learn map and compass navigation in the North Cascades")
        assert intent is not None
        assert intent.tour_id == "wilderness-navigation"

    def test_detect_guide_certifications(self):
        intent = detect_adventure_intent("What certifications do your lead mountain guides hold? Are they AMGA or WFR certified?")
        assert intent is not None
        assert intent.action == "guides"

    def test_detect_specific_guide_lookup(self):
        intent = detect_adventure_intent("Tell me about Sarah Jenkins and her mountaineering background.")
        assert intent is not None
        assert intent.action == "guides"

    def test_detect_recommendation(self):
        intent = detect_adventure_intent("Can you recommend an outdoor adventure for a beginner?")
        assert intent is not None
        assert intent.action in ["recommend", "tours"]
        assert intent.difficulty == "Beginner"

    def test_non_adventure_queries(self):
        assert detect_adventure_intent("Where is my order CTSO-9821?") is None
        assert detect_adventure_intent("What is your return policy?") is None
        assert detect_adventure_intent("Do you carry waterproof hiking boots?") is None
        assert detect_adventure_intent("") is None
        assert detect_adventure_intent("   ") is None


class TestBuildAdventurePrompt:
    def test_build_adventure_prompt_contains_catalog_and_guides(self):
        intent = AdventureIntent(action="tours", category="Rock Climbing", difficulty="Beginner")
        prompt = build_adventure_prompt(intent)
        assert "Contoso Outdoors Official Adventure Tours" in prompt
        assert "Alpine Mountaineering & Glacier Travel" in prompt
        assert "Introduction to Outdoor Rock Climbing" in prompt
        assert "Sarah Jenkins" in prompt
        assert "Marcus Vance" in prompt
        assert "AMGA" in prompt
        assert "Beginner" in prompt


class TestFormatAdventureResponse:
    def test_format_rock_climbing_tour_response(self):
        intent = AdventureIntent(
            action="tours",
            category="Rock Climbing",
            difficulty="Beginner",
            tour_id="outdoor-rock-climbing",
        )
        res = format_adventure_response(intent)
        assert "answer" in res
        assert "adventures_info" in res

        info = res["adventures_info"]
        assert info["action"] == "tours"
        assert info["category"] == "Rock Climbing"
        assert len(info["tours"]) >= 1
        tour = info["tours"][0]
        assert tour["title"] == "Introduction to Outdoor Rock Climbing"
        assert tour["price_per_person"] == 175.0
        assert tour["lead_guide_name"] == "Marcus Vance"

        answer = res["answer"]
        assert "Introduction to Outdoor Rock Climbing" in answer
        assert "Smith Rock" in answer
        assert "175" in answer
        assert "Marcus Vance" in answer

    def test_format_glacier_prerequisites_response(self):
        intent = AdventureIntent(
            action="prerequisites",
            tour_id="alpine-mountaineering",
        )
        res = format_adventure_response(intent)
        info = res["adventures_info"]
        assert info["action"] == "prerequisites"
        assert info["tour_id"] == "alpine-mountaineering"
        assert "selected_tour" in info
        assert "crampon" in info["selected_tour"]["prerequisites"].lower()

        answer = res["answer"]
        assert "Mount Rainier" in answer or "Alpine Mountaineering" in answer
        assert "prerequisite" in answer.lower() or "experience" in answer.lower()
        assert "Sarah Jenkins" in answer

    def test_format_guides_response(self):
        intent = AdventureIntent(action="guides")
        res = format_adventure_response(intent)
        info = res["adventures_info"]
        assert info["action"] == "guides"
        assert len(info["guides"]) == 4

        answer = res["answer"]
        assert "Sarah Jenkins" in answer
        assert "Marcus Vance" in answer
        assert "AMGA" in answer
