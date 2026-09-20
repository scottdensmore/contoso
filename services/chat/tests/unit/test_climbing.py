from contoso_chat.climbing import (
    ClimbingIntent,
    CragModel,
    RackCalcRequest,
    RouteModel,
    build_climbing_prompt,
    calculate_climbing_rack,
    detect_climbing_intent,
    format_climbing_response,
    get_climbing_crag_by_id,
    get_climbing_crags,
    get_rappel_safety_protocol,
)


def test_route_and_crag_models():
    route = RouteModel(
        name="Test Route",
        grade="5.10a",
        pitches=2,
        length_ft=180,
        protection_type="trad",
        description="A great test crack.",
        descent_beta="Rappel two pitches.",
    )
    assert route.name == "Test Route"
    assert route.grade == "5.10a"
    assert route.pitches == 2
    assert route.length_ft == 180
    assert route.protection_type == "trad"

    crag = CragModel(
        crag_id="test-crag",
        name="Test Crag",
        area="Test Area",
        region="Test Region",
        rock_type="Granite",
        elevation_ft=2000,
        approach_minutes=20,
        sun_exposure="South",
        routes=[route],
        standard_rack="Double rack",
        best_seasons=["Summer", "Fall"],
        access_notes="Open trail.",
        helmet_required=True,
    )
    assert crag.crag_id == "test-crag"
    assert len(crag.routes) == 1
    assert crag.helmet_required is True


def test_get_climbing_crags_all():
    crags = get_climbing_crags()
    assert len(crags) == 5
    ids = [c.crag_id for c in crags]
    assert "index-lower-town-wall" in ids
    assert "leavenworth-castle-rock" in ids
    assert "vantage-feathers" in ids
    assert "washington-pass-liberty-bell" in ids
    assert "smith-rock-dihedrals" in ids


def test_get_climbing_crags_filter_rock_type():
    granite_crags = get_climbing_crags(rock_type="Granite")
    assert len(granite_crags) >= 2
    assert all("granite" in c.rock_type.lower() for c in granite_crags)

    basalt_crags = get_climbing_crags(rock_type="Basalt")
    assert len(basalt_crags) == 1
    assert basalt_crags[0].crag_id == "vantage-feathers"


def test_get_climbing_crags_filter_discipline():
    sport_crags = get_climbing_crags(discipline="sport")
    assert len(sport_crags) >= 2
    sport_ids = [c.crag_id for c in sport_crags]
    assert "smith-rock-dihedrals" in sport_ids
    assert "vantage-feathers" in sport_ids

    alpine_crags = get_climbing_crags(discipline="alpine")
    assert len(alpine_crags) >= 1
    assert any(c.crag_id == "washington-pass-liberty-bell" for c in alpine_crags)


def test_get_climbing_crag_by_id_found():
    crag = get_climbing_crag_by_id("index-lower-town-wall")
    assert crag is not None
    assert crag.name == "Index Lower Town Wall"
    assert crag.rock_type == "Granite"
    route_names = [r.name for r in crag.routes]
    assert "Godzilla" in route_names
    assert "City Park" in route_names


def test_get_climbing_crag_by_id_not_found():
    crag = get_climbing_crag_by_id("non-existent-crag")
    assert crag is None


def test_calculate_climbing_rack_trad_single_pitch():
    req = RackCalcRequest(route_type="trad", pitches=1, crux_grade="5.9", route_length_ft=100)
    rack = calculate_climbing_rack(req)
    assert "Camalot" in rack.cams_description
    assert "stoppers" in rack.nuts_description.lower() or "nuts" in rack.nuts_description.lower()
    assert rack.slings_count >= 6
    assert rack.quickdraws_count >= 2
    assert rack.rope_length_m in (60, 70)
    assert rack.weight_est_lbs > 0
    assert any("helmet" in g.lower() for g in rack.special_gear)


def test_calculate_climbing_rack_trad_multipitch():
    req = RackCalcRequest(route_type="trad", pitches=4, crux_grade="5.10a", route_length_ft=450)
    rack = calculate_climbing_rack(req)
    assert "double" in rack.cams_description.lower()
    assert rack.slings_count >= 10
    assert rack.rope_length_m >= 70
    assert rack.weight_est_lbs > 10.0
    assert any("cordellette" in g.lower() for g in rack.special_gear)


def test_calculate_climbing_rack_sport():
    req = RackCalcRequest(route_type="sport", pitches=1, crux_grade="5.12a", route_length_ft=80)
    rack = calculate_climbing_rack(req)
    assert "none" in rack.cams_description.lower()
    assert "none" in rack.nuts_description.lower()
    assert rack.quickdraws_count >= 8
    assert rack.rope_length_m in (60, 70)
    assert any("belay device" in g.lower() or "grigri" in g.lower() for g in rack.special_gear)


def test_calculate_climbing_rack_alpine():
    req = RackCalcRequest(route_type="alpine", pitches=5, crux_grade="5.7", route_length_ft=600)
    rack = calculate_climbing_rack(req)
    assert "rack" in rack.cams_description.lower()
    assert rack.slings_count >= 10
    assert rack.rope_length_m >= 70
    assert any("bivy" in g.lower() or "headlamp" in g.lower() for g in rack.special_gear)


def test_get_rappel_safety_protocol():
    proto = get_rappel_safety_protocol()
    assert "title" in proto
    assert "pre_rappel_checklist" in proto
    assert len(proto["pre_rappel_checklist"]) >= 3
    assert "backup_systems" in proto
    assert "extension_and_rigging" in proto
    assert "anchor_evaluation_principles" in proto
    assert "communication_and_signals" in proto
    assert "essential_gear" in proto
    assert any("stopper knot" in item.lower() for item in proto["pre_rappel_checklist"])


def test_detect_climbing_intent_crags():
    intent = detect_climbing_intent("Where can I go rock climbing in the Pacific Northwest?")
    assert intent is not None
    assert intent.action == "crags"


def test_detect_climbing_intent_crag_detail():
    intent1 = detect_climbing_intent("Tell me route beta for Godzilla at Index Lower Town Wall")
    assert intent1 is not None
    assert intent1.action == "crag_detail"
    assert intent1.crag_id == "index-lower-town-wall"

    intent2 = detect_climbing_intent("What is the grade of Midway at Castle Rock Leavenworth?")
    assert intent2 is not None
    assert intent2.action == "crag_detail"
    assert intent2.crag_id == "leavenworth-castle-rock"

    intent3 = detect_climbing_intent("How do I climb Beckey Route on Liberty Bell?")
    assert intent3 is not None
    assert intent3.action == "crag_detail"
    assert intent3.crag_id == "washington-pass-liberty-bell"

    intent4 = detect_climbing_intent("Tell me about Chain Reaction at Smith Rock")
    assert intent4 is not None
    assert intent4.action == "crag_detail"
    assert intent4.crag_id == "smith-rock-dihedrals"


def test_detect_climbing_intent_rack_calc():
    intent = detect_climbing_intent("Calculate a trad rack for a 3-pitch 5.9 climbing route")
    assert intent is not None
    assert intent.action == "rack_calc"
    assert intent.route_type == "trad"
    assert intent.pitches == 3
    assert intent.crux_grade == "5.9"


def test_detect_climbing_intent_rappel_safety():
    intent = detect_climbing_intent("What are the rappel safety protocols and stopper knot guidelines?")
    assert intent is not None
    assert intent.action == "rappel_safety"


def test_detect_climbing_intent_unrelated():
    assert detect_climbing_intent("What is the weather forecast in Seattle?") is None
    assert detect_climbing_intent("Can I return this backpack to the store?") is None


def test_build_climbing_prompt():
    intent_crag = ClimbingIntent(action="crag_detail", crag_id="index-lower-town-wall")
    prompt_crag = build_climbing_prompt(intent_crag)
    assert "Index Lower Town Wall" in prompt_crag
    assert "Godzilla" in prompt_crag

    intent_gen = ClimbingIntent(action="crags")
    prompt_gen = build_climbing_prompt(intent_gen)
    assert "Pacific Northwest" in prompt_gen
    assert "Index Lower Town Wall" in prompt_gen


def test_format_climbing_response():
    # Crags
    res_crags = format_climbing_response(ClimbingIntent(action="crags"))
    assert "answer" in res_crags
    assert "climbing_info" in res_crags
    assert res_crags["climbing_info"]["action"] == "crags"
    assert len(res_crags["climbing_info"]["crags"]) == 5

    # Crag detail
    res_detail = format_climbing_response(
        ClimbingIntent(action="crag_detail", crag_id="index-lower-town-wall")
    )
    assert "Godzilla" in res_detail["answer"]
    assert res_detail["climbing_info"]["crag"]["crag_id"] == "index-lower-town-wall"

    # Rack calc
    res_rack = format_climbing_response(
        ClimbingIntent(action="rack_calc", route_type="trad", pitches=2, crux_grade="5.10a")
    )
    assert "Rack" in res_rack["answer"]
    assert res_rack["climbing_info"]["action"] == "rack_calc"
    assert "rack" in res_rack["climbing_info"]

    # Rappel safety
    res_rap = format_climbing_response(ClimbingIntent(action="rappel_safety"))
    assert "Rappel" in res_rap["answer"]
    assert res_rap["climbing_info"]["action"] == "rappel_safety"
    assert "protocols" in res_rap["climbing_info"]
