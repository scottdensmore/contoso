from contoso_chat.wildlife import (
    EncounterAssessmentRequest,
    EncounterAssessmentResponse,
    FoodStorageGuidelineModel,
    WildlifeIntent,
    WildlifeSpeciesModel,
    assess_wildlife_encounter,
    build_wildlife_prompt,
    detect_wildlife_intent,
    format_wildlife_response,
    get_food_storage_guidelines,
    get_wildlife_species,
    get_wildlife_species_by_id,
)


def test_get_wildlife_species_all():
    species = get_wildlife_species()
    assert len(species) == 5
    ids = [s.species_id for s in species]
    assert "grizzly-bear" in ids
    assert "black-bear" in ids
    assert "cougar" in ids
    assert "moose" in ids
    assert "western-rattlesnake" in ids

    for s in species:
        assert isinstance(s, WildlifeSpeciesModel)
        assert s.species_id
        assert s.common_name
        assert s.scientific_name
        assert s.category in ("carnivore", "ungulate", "reptile")
        assert s.risk_level
        assert len(s.habitats) > 0
        assert len(s.key_traits) > 0
        assert s.safe_distance_yards > 0
        assert s.encounter_protocol


def test_get_wildlife_species_bear_specific_traits():
    grizzly = get_wildlife_species_by_id("grizzly-bear")
    assert grizzly is not None
    assert grizzly.bear_specific_traits is not None
    assert grizzly.bear_specific_traits["shoulder_hump"] is True
    assert "dish" in grizzly.bear_specific_traits["facial_profile"].lower()
    assert "play dead" in grizzly.bear_specific_traits["defensive_attack_response"].lower()

    black_bear = get_wildlife_species_by_id("black-bear")
    assert black_bear is not None
    assert black_bear.bear_specific_traits is not None
    assert black_bear.bear_specific_traits["shoulder_hump"] is False
    assert "straight" in black_bear.bear_specific_traits["facial_profile"].lower()
    assert "fight back" in black_bear.bear_specific_traits["predatory_attack_response"].lower()


def test_get_wildlife_species_filtered():
    carnivores = get_wildlife_species(category="carnivore")
    assert len(carnivores) == 3
    c_ids = [c.species_id for c in carnivores]
    assert "grizzly-bear" in c_ids
    assert "black-bear" in c_ids
    assert "cougar" in c_ids

    ungulates = get_wildlife_species(category="ungulate")
    assert len(ungulates) == 1
    assert ungulates[0].species_id == "moose"

    reptiles = get_wildlife_species(category="reptile")
    assert len(reptiles) == 1
    assert reptiles[0].species_id == "western-rattlesnake"

    # Case insensitivity
    carnivores_case = get_wildlife_species(category=" Carnivore ")
    assert len(carnivores_case) == 3


def test_get_wildlife_species_by_id():
    cougar = get_wildlife_species_by_id("cougar")
    assert cougar is not None
    assert cougar.common_name == "Cougar"
    assert "Puma" in cougar.scientific_name
    assert cougar.safe_distance_yards >= 100

    # Trimming and case insensitivity
    grizzly = get_wildlife_species_by_id("  Grizzly-Bear  ")
    assert grizzly is not None
    assert grizzly.species_id == "grizzly-bear"

    # Unknown species
    unknown = get_wildlife_species_by_id("unknown-dinosaur")
    assert unknown is None


def test_assess_wildlife_encounter_grizzly_close():
    req = EncounterAssessmentRequest(
        species_id="grizzly-bear",
        distance_yards=30,
        has_cubs_or_food=True,
        is_approaching=True,
        has_bear_spray_ready=True,
    )
    resp = assess_wildlife_encounter(req)
    assert isinstance(resp, EncounterAssessmentResponse)
    assert resp.species_id == "grizzly-bear"
    assert "Grizzly" in resp.species_name
    assert resp.danger_level in ("critical", "extreme")
    assert "stand ground" in resp.immediate_action.lower() or "do not run" in resp.immediate_action.lower()
    assert any("play dead" in step.lower() for step in resp.defensive_steps)
    assert "30-40" in resp.bear_spray_protocol or "burst" in resp.bear_spray_protocol.lower()
    assert "canister" in resp.food_storage_rule.lower() or "igbc" in resp.food_storage_rule.lower()


def test_assess_wildlife_encounter_black_bear():
    req = EncounterAssessmentRequest(
        species_id="black-bear",
        distance_yards=40,
        has_cubs_or_food=False,
        is_approaching=True,
        has_bear_spray_ready=True,
    )
    resp = assess_wildlife_encounter(req)
    assert resp.species_id == "black-bear"
    assert any("fight back" in step.lower() for step in resp.defensive_steps)
    assert not any("play dead" in step.lower() and "never play dead" not in step.lower() for step in resp.defensive_steps)


def test_assess_wildlife_encounter_cougar():
    req = EncounterAssessmentRequest(
        species_id="cougar",
        distance_yards=25,
        has_cubs_or_food=False,
        is_approaching=True,
        has_bear_spray_ready=True,
    )
    resp = assess_wildlife_encounter(req)
    assert resp.species_id == "cougar"
    assert "eye contact" in resp.immediate_action.lower() or any("eye contact" in step.lower() for step in resp.defensive_steps)
    assert any("fight back" in step.lower() for step in resp.defensive_steps)


def test_assess_wildlife_encounter_moose():
    req = EncounterAssessmentRequest(
        species_id="moose",
        distance_yards=20,
        has_cubs_or_food=True,
        is_approaching=True,
        has_bear_spray_ready=False,
    )
    resp = assess_wildlife_encounter(req)
    assert resp.species_id == "moose"
    assert resp.danger_level in ("critical", "extreme", "high")
    assert "run" in resp.immediate_action.lower() or any("tree" in step.lower() or "boulder" in step.lower() for step in resp.defensive_steps)


def test_assess_wildlife_encounter_rattlesnake():
    req = EncounterAssessmentRequest(
        species_id="western-rattlesnake",
        distance_yards=5,
        has_cubs_or_food=False,
        is_approaching=False,
        has_bear_spray_ready=False,
    )
    resp = assess_wildlife_encounter(req)
    assert resp.species_id == "western-rattlesnake"
    assert "freeze" in resp.immediate_action.lower() or "back away" in resp.immediate_action.lower()


def test_get_food_storage_guidelines():
    guidelines = get_food_storage_guidelines()
    assert len(guidelines) == 4
    zone_ids = [g.zone_id for g in guidelines]
    assert "north-cascades" in zone_ids
    assert "olympic-np" in zone_ids
    assert "mount-rainier" in zone_ids
    assert "yellowstone-glacier" in zone_ids

    for g in guidelines:
        assert isinstance(g, FoodStorageGuidelineModel)
        assert g.zone_id
        assert g.zone_name
        assert isinstance(g.canister_required, bool)
        assert g.regulations
        assert g.hang_spec


def test_detect_wildlife_intent():
    # Species list
    intent_list = detect_wildlife_intent("What wildlife species are in the Pacific Northwest?")
    assert intent_list is not None
    assert intent_list.action == "species_list"

    # Category filter
    intent_carnivore = detect_wildlife_intent("Tell me about carnivores and apex predators")
    assert intent_carnivore is not None
    assert intent_carnivore.category == "carnivore"

    # Species detail
    intent_grizzly = detect_wildlife_intent("Tell me about grizzly bear morphology and traits")
    assert intent_grizzly is not None
    assert intent_grizzly.action == "species_detail"
    assert intent_grizzly.species_id == "grizzly-bear"

    # Encounter assessment
    intent_encounter = detect_wildlife_intent("I am 30 yards away from a grizzly bear that is approaching, what should I do?")
    assert intent_encounter is not None
    assert intent_encounter.action == "encounter_assess"
    assert intent_encounter.species_id == "grizzly-bear"
    assert intent_encounter.distance_yards == 30

    # Food storage
    intent_food = detect_wildlife_intent("Do I need an IGBC bear canister in Olympic National Park?")
    assert intent_food is not None
    assert intent_food.action == "food_storage"

    # Gear guide
    intent_gear = detect_wildlife_intent("How do I pack and use bear spray safely?")
    assert intent_gear is not None
    assert intent_gear.action == "gear_guide"

    # Unrelated queries
    assert detect_wildlife_intent("Can I return a tent after 30 days?") is None
    assert detect_wildlife_intent("What ski touring bindings do you sell?") is None


def test_build_wildlife_prompt():
    intent = WildlifeIntent(
        action="species_detail",
        species_id="grizzly-bear",
    )
    prompt = build_wildlife_prompt(intent)
    assert "Grizzly" in prompt
    assert "Ursus arctos horribilis" in prompt
    assert "shoulder hump" in prompt.lower()
    assert "bear spray" in prompt.lower()


def test_format_wildlife_response_encounter():
    intent = WildlifeIntent(
        action="encounter_assess",
        species_id="grizzly-bear",
        distance_yards=30,
    )
    res = format_wildlife_response(intent)
    assert "answer" in res
    assert "wildlife_info" in res
    assert res["wildlife_info"]["action"] == "encounter_assess"
    assert res["wildlife_info"]["species_id"] == "grizzly-bear"
    assert "assessment" in res["wildlife_info"]
    assert "Grizzly" in res["answer"]


def test_format_wildlife_response_food_storage():
    intent = WildlifeIntent(
        action="food_storage",
    )
    res = format_wildlife_response(intent)
    assert "answer" in res
    assert "wildlife_info" in res
    assert res["wildlife_info"]["action"] == "food_storage"
    assert len(res["wildlife_info"]["guidelines"]) == 4
