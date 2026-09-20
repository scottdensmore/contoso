from contoso_chat.foraging import (
    ForagingIntent,
    SafetyScreenerRequest,
    SafetyScreenerResponse,
    SpeciesModel,
    assess_foraging_safety,
    build_foraging_prompt,
    detect_foraging_intent,
    format_foraging_response,
    get_foraging_guidelines,
    get_foraging_species,
    get_foraging_species_by_id,
)


def test_get_foraging_species_all():
    species = get_foraging_species()
    assert len(species) == 5
    ids = [s.species_id for s in species]
    assert "golden-chanterelle" in ids
    assert "morel-mushroom" in ids
    assert "huckleberry" in ids
    assert "miner-lettuce" in ids
    assert "stinging-nettle" in ids

    for s in species:
        assert isinstance(s, SpeciesModel)
        assert s.species_id
        assert s.common_name
        assert s.scientific_name
        assert s.category in ("mushroom", "plant")
        assert s.edibility
        assert len(s.seasons) > 0
        assert s.primary_habitat
        assert len(s.key_identifiers) > 0
        assert len(s.toxic_lookalikes) > 0
        assert s.preparation_safety
        assert s.harvest_limit_rules


def test_get_foraging_species_filtered():
    # Filter by category
    mushrooms = get_foraging_species(category="mushroom")
    assert len(mushrooms) == 2
    assert all(m.category == "mushroom" for m in mushrooms)
    m_ids = [m.species_id for m in mushrooms]
    assert "golden-chanterelle" in m_ids
    assert "morel-mushroom" in m_ids

    plants = get_foraging_species(category="plant")
    assert len(plants) == 3
    assert all(p.category == "plant" for p in plants)

    # Filter by season
    spring_species = get_foraging_species(season="spring")
    spring_ids = [s.species_id for s in spring_species]
    assert "morel-mushroom" in spring_ids
    assert "miner-lettuce" in spring_ids
    assert "stinging-nettle" in spring_ids

    fall_species = get_foraging_species(season="fall")
    fall_ids = [s.species_id for s in fall_species]
    assert "golden-chanterelle" in fall_ids
    assert "huckleberry" in fall_ids

    # Combined filter
    spring_mushrooms = get_foraging_species(category="mushroom", season="spring")
    assert len(spring_mushrooms) == 1
    assert spring_mushrooms[0].species_id == "morel-mushroom"


def test_get_foraging_species_by_id():
    chanterelle = get_foraging_species_by_id("golden-chanterelle")
    assert chanterelle is not None
    assert chanterelle.common_name == "Golden Chanterelle"
    assert "Cantharellus" in chanterelle.scientific_name
    assert any("Jack-o'-Lantern" in lookalike for lookalike in chanterelle.toxic_lookalikes)

    # Case insensitivity and whitespace
    chanterelle_case = get_foraging_species_by_id("  Golden-Chanterelle  ")
    assert chanterelle_case is not None
    assert chanterelle_case.species_id == "golden-chanterelle"

    unknown = get_foraging_species_by_id("unknown-fungus")
    assert unknown is None


def test_assess_foraging_safety_chanterelle():
    # Ideal Chanterelle: false gills, solid stem, not on dead wood, no milky sap
    req = SafetyScreenerRequest(
        category="mushroom",
        season="fall",
        has_false_gills=True,
        is_hollow_stem=False,
        has_milky_sap=False,
        growing_on_dead_wood=False,
    )
    resp = assess_foraging_safety(req)
    assert isinstance(resp, SafetyScreenerResponse)
    assert resp.warning_level == "safe"
    assert "Chanterelle" in resp.candidate_match
    assert "cook" in resp.recommendation.lower()
    assert len(resp.safety_checks) >= 3
    assert resp.toxic_warning is not None
    assert "Jack-o'-Lantern" in resp.toxic_warning
    assert "permit" in resp.permit_guideline.lower()


def test_assess_foraging_safety_dead_wood_hazard():
    req = SafetyScreenerRequest(
        category="mushroom",
        season="fall",
        has_false_gills=False,
        is_hollow_stem=False,
        growing_on_dead_wood=True,
    )
    resp = assess_foraging_safety(req)
    assert resp.warning_level == "danger"
    assert "wood" in resp.candidate_match.lower() or "jack-o'-lantern" in resp.candidate_match.lower()
    assert resp.toxic_warning is not None
    assert "dead wood" in resp.toxic_warning.lower() or "jack-o'-lantern" in resp.toxic_warning.lower()


def test_assess_foraging_safety_morel_hollow():
    req = SafetyScreenerRequest(
        category="mushroom",
        season="spring",
        is_hollow_stem=True,
        growing_on_dead_wood=False,
    )
    resp = assess_foraging_safety(req)
    assert resp.warning_level == "safe"
    assert "Morel" in resp.candidate_match
    assert resp.toxic_warning is not None
    assert "False Morel" in resp.toxic_warning or "Gyromitra" in resp.toxic_warning


def test_assess_foraging_safety_false_morel_solid_stem():
    req = SafetyScreenerRequest(
        category="mushroom",
        season="spring",
        is_hollow_stem=False,
        growing_on_dead_wood=False,
    )
    resp = assess_foraging_safety(req)
    assert resp.warning_level == "danger"
    assert "False Morel" in resp.candidate_match or "Gyromitra" in resp.candidate_match
    assert resp.toxic_warning is not None
    assert "gyromitrin" in resp.toxic_warning.lower() or "false morel" in resp.toxic_warning.lower()


def test_assess_foraging_safety_plant_milky_sap():
    req = SafetyScreenerRequest(
        category="plant",
        season="spring",
        has_milky_sap=True,
    )
    resp = assess_foraging_safety(req)
    assert resp.warning_level in ("warning", "caution", "danger")
    assert resp.toxic_warning is not None
    assert "milky" in resp.toxic_warning.lower() or "sap" in resp.toxic_warning.lower()


def test_get_foraging_guidelines():
    guidelines = get_foraging_guidelines()
    assert isinstance(guidelines, dict)
    assert "hundred_percent_rule" in guidelines
    assert "100%" in guidelines["hundred_percent_rule"]
    assert "ethical_harvesting" in guidelines
    assert len(guidelines["ethical_harvesting"]) >= 3
    assert "permits_and_regulations" in guidelines
    assert len(guidelines["permits_and_regulations"]) >= 2
    assert "field_safety_rules" in guidelines


def test_detect_foraging_intent():
    # Species detail intent
    intent1 = detect_foraging_intent("Can you tell me about the golden chanterelle mushroom?")
    assert intent1 is not None
    assert intent1.species_id == "golden-chanterelle"
    assert intent1.action in ("species_detail", "safety_check")

    # Safety check intent
    intent2 = detect_foraging_intent("How do I screen for toxic look-alikes like false morels?")
    assert intent2 is not None
    assert intent2.action == "safety_check"

    # Guidelines intent
    intent3 = detect_foraging_intent("What are the ethical foraging rules and harvest limits in the forest?")
    assert intent3 is not None
    assert intent3.action == "guidelines"

    # Species list intent
    intent4 = detect_foraging_intent("What wild edibles and mushrooms can I forage in the fall?")
    assert intent4 is not None
    assert intent4.action == "species_list"
    assert intent4.season == "fall"

    # Negative cases / non-foraging queries
    assert detect_foraging_intent("I need a return label for my hiking boots") is None
    assert detect_foraging_intent("Where can I rent a whitewater kayak?") is None
    assert detect_foraging_intent("What is the avalanche forecast for Stevens Pass?") is None


def test_build_foraging_prompt():
    intent = ForagingIntent(
        action="species_detail",
        species_id="golden-chanterelle",
        category="mushroom",
        season="fall",
    )
    prompt = build_foraging_prompt(intent)
    assert "Golden Chanterelle" in prompt
    assert "Cantharellus" in prompt
    assert "Jack-o'-Lantern" in prompt
    assert "100% Identification Rule" in prompt or "ethical" in prompt.lower()


def test_format_foraging_response():
    # Detail response
    intent_detail = ForagingIntent(action="species_detail", species_id="morel-mushroom")
    res_detail = format_foraging_response(intent_detail)
    assert "answer" in res_detail
    assert "foraging_info" in res_detail
    assert res_detail["foraging_info"]["action"] == "species_detail"
    assert "Morel" in res_detail["answer"]

    # Safety check response
    intent_safety = ForagingIntent(action="safety_check", species_id="golden-chanterelle")
    res_safety = format_foraging_response(intent_safety)
    assert "answer" in res_safety
    assert "foraging_info" in res_safety
    assert res_safety["foraging_info"]["action"] == "safety_check"

    # Guidelines response
    intent_guide = ForagingIntent(action="guidelines")
    res_guide = format_foraging_response(intent_guide)
    assert "answer" in res_guide
    assert "foraging_info" in res_guide
    assert res_guide["foraging_info"]["action"] == "guidelines"

    # Species list response
    intent_list = ForagingIntent(action="species_list", category="mushroom")
    res_list = format_foraging_response(intent_list)
    assert "answer" in res_list
    assert "foraging_info" in res_list
    assert res_list["foraging_info"]["action"] == "species_list"
