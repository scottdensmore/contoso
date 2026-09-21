import pytest
from contoso_chat.caving import (
    CavingGearRequirement,
    CavingIntent,
    CavingRouteModel,
    SrtRiggingRequest,
    SrtRiggingResponse,
    build_caving_prompt,
    calculate_srt_rigging_plan,
    detect_caving_intent,
    format_caving_response,
    get_caving_gear,
    get_caving_route_by_id,
    get_caving_routes,
)


def test_get_caving_routes_all():
    routes = get_caving_routes()
    assert len(routes) == 5
    ids = [r.cave_id for r in routes]
    assert "fantastic-pit-ellisons-cave" in ids
    assert "mammoth-cave-historic-dallons" in ids
    assert "leprechaun-cave-bighorns" in ids
    assert "carlsbad-caverns-slaughter-canyon" in ids
    assert "tumbling-rock-cave-passages" in ids


def test_get_caving_route_by_id_found():
    cave = get_caving_route_by_id("fantastic-pit-ellisons-cave")
    assert cave is not None
    assert isinstance(cave, CavingRouteModel)
    assert cave.cave_id == "fantastic-pit-ellisons-cave"
    assert "Fantastic Pit" in cave.title
    assert "Walker County, GA" in cave.region
    assert cave.depth_m == 325
    assert cave.total_length_m == 19500
    assert cave.cave_grade == "class_4_vertical_srt"
    assert cave.deepest_pitch_m == 179
    assert cave.rebelays_required == 2
    assert cave.waterproof_oversuit_required is True
    assert len(cave.highlights) >= 3


def test_get_caving_route_by_id_not_found():
    cave = get_caving_route_by_id("non-existent-cave-id")
    assert cave is None


def test_get_caving_routes_grade_filter():
    class_4 = get_caving_routes(grade="class_4_vertical_srt")
    assert len(class_4) == 1
    assert class_4[0].cave_id == "fantastic-pit-ellisons-cave"

    class_1 = get_caving_routes(grade="class_1")
    assert len(class_1) == 1
    assert class_1[0].cave_id == "mammoth-cave-historic-dallons"

    class_5 = get_caving_routes(grade="class_5")
    assert len(class_5) == 1
    assert class_5[0].cave_id == "leprechaun-cave-bighorns"

    class_2 = get_caving_routes(grade="class_2_scramble_crawl")
    assert len(class_2) == 1
    assert class_2[0].cave_id == "carlsbad-caverns-slaughter-canyon"

    class_3 = get_caving_routes(grade="class_3_tight_squeeze")
    assert len(class_3) == 1
    assert class_3[0].cave_id == "tumbling-rock-cave-passages"


def test_get_caving_routes_invalid_grade():
    routes = get_caving_routes(grade="non_existent_grade")
    assert len(routes) == 0


def test_calculate_srt_rigging_plan_standard():
    req = SrtRiggingRequest(
        cave_id="fantastic-pit-ellisons-cave",
        pitch_depth_m=179.0,
        caver_weight_kg=75.0,
        caver_pack_weight_kg=10.0,
        rope_diameter_mm=10.0,
        rope_abrasion_risk="none_clean_drop",
        rebelay_configured=True,
    )
    plan = calculate_srt_rigging_plan(req)
    assert isinstance(plan, SrtRiggingResponse)
    assert plan.cave_id == "fantastic-pit-ellisons-cave"
    assert "Fantastic Pit" in plan.cave_title
    assert plan.cave_grade == "class_4_vertical_srt"
    assert plan.total_suspended_weight_kg == 85.0
    assert plan.estimated_rope_stretch_m > 0
    assert plan.safety_status == "safe"
    assert "rappel rack" in plan.descender_recommendation.lower()
    assert "configured" in plan.rebelay_advisory.lower()
    assert "white-nose syndrome" in plan.biosecurity_notice.lower()


def test_calculate_srt_rigging_plan_moderate_pitch_bobbin():
    req = SrtRiggingRequest(
        cave_id="tumbling-rock-cave-passages",
        pitch_depth_m=18.0,
        caver_weight_kg=70.0,
        caver_pack_weight_kg=10.0,
        rope_diameter_mm=10.0,
        rope_abrasion_risk="none_clean_drop",
        rebelay_configured=True,
    )
    plan = calculate_srt_rigging_plan(req)
    assert plan.total_suspended_weight_kg == 80.0
    assert "bobbin" in plan.descender_recommendation.lower()
    assert plan.safety_status == "safe"


def test_calculate_srt_rigging_plan_sharp_edge_no_rebelay():
    req = SrtRiggingRequest(
        cave_id="fantastic-pit-ellisons-cave",
        pitch_depth_m=179.0,
        caver_weight_kg=75.0,
        caver_pack_weight_kg=10.0,
        rope_abrasion_risk="sharp_edge_shear",
        rebelay_configured=False,
    )
    plan = calculate_srt_rigging_plan(req)
    assert plan.safety_status == "critical_hazard"
    assert "warning" in plan.rebelay_advisory.lower()


def test_calculate_srt_rigging_plan_sharp_edge_with_rebelay():
    req = SrtRiggingRequest(
        cave_id="fantastic-pit-ellisons-cave",
        pitch_depth_m=179.0,
        caver_weight_kg=75.0,
        caver_pack_weight_kg=10.0,
        rope_abrasion_risk="sharp_edge_shear",
        rebelay_configured=True,
    )
    plan = calculate_srt_rigging_plan(req)
    assert plan.safety_status == "caution"


def test_calculate_srt_rigging_plan_thin_rope_hazard():
    req = SrtRiggingRequest(
        cave_id="fantastic-pit-ellisons-cave",
        pitch_depth_m=50.0,
        caver_weight_kg=75.0,
        rope_diameter_mm=8.0,
        rope_abrasion_risk="none_clean_drop",
        rebelay_configured=True,
    )
    plan = calculate_srt_rigging_plan(req)
    assert plan.safety_status == "critical_hazard"


def test_calculate_srt_rigging_plan_deep_pitch_no_rebelay():
    req = SrtRiggingRequest(
        cave_id="fantastic-pit-ellisons-cave",
        pitch_depth_m=100.0,
        caver_weight_kg=75.0,
        rope_diameter_mm=10.0,
        rope_abrasion_risk="none_clean_drop",
        rebelay_configured=False,
    )
    plan = calculate_srt_rigging_plan(req)
    assert plan.safety_status in ("caution", "critical_hazard")
    assert "warning" in plan.rebelay_advisory.lower()


def test_calculate_srt_rigging_plan_unknown_cave():
    req = SrtRiggingRequest(cave_id="invalid-cave-id")
    with pytest.raises(ValueError, match="not found"):
        calculate_srt_rigging_plan(req)


def test_get_caving_gear_list():
    gear = get_caving_gear()
    assert len(gear) == 6
    assert all(isinstance(g, CavingGearRequirement) for g in gear)
    assert all(g.mandatory for g in gear)
    gear_ids = [g.item_id for g in gear]
    assert "en12492-caving-helmet-mount" in gear_ids
    assert "secondary-backup-headlamp" in gear_ids
    assert "caving-srt-frog-system" in gear_ids
    assert "caving-bobbin-rack-descender" in gear_ids
    assert "heavy-cordura-caving-oversuit" in gear_ids
    assert "wns-biosecurity-decon-kit" in gear_ids


def test_detect_caving_intent_keywords():
    intent1 = detect_caving_intent("What is single rope technique srt for caving?")
    assert intent1 is not None
    assert intent1.action in ("routes_list", "route_detail", "rigging_plan", "gear_checklist")

    intent2 = detect_caving_intent("How do I decontaminate gear for white-nose syndrome?")
    assert intent2 is not None
    assert intent2.action == "gear_checklist"

    intent3 = detect_caving_intent("Tell me about karst speleology and cave oversuit requirements")
    assert intent3 is not None

    intent4 = detect_caving_intent("How does a croll ascender work in a frog system?")
    assert intent4 is not None

    intent5 = detect_caving_intent("Looking for pit cave expeditions and rebelay rigging")
    assert intent5 is not None


def test_detect_caving_intent_routes():
    intent_f = detect_caving_intent("Tell me about Fantastic Pit in Ellison's cave")
    assert intent_f is not None
    assert intent_f.cave_id == "fantastic-pit-ellisons-cave"

    intent_m = detect_caving_intent("Mammoth cave Cleaveland Avenue historic route")
    assert intent_m is not None
    assert intent_m.cave_id == "mammoth-cave-historic-dallons"

    intent_b = detect_caving_intent("Great X pit Bighorns alpine karst speleology")
    assert intent_b is not None
    assert intent_b.cave_id == "leprechaun-cave-bighorns"

    intent_s = detect_caving_intent("Slaughter Canyon Cave in Carlsbad Caverns")
    assert intent_s is not None
    assert intent_s.cave_id == "carlsbad-caverns-slaughter-canyon"

    intent_t = detect_caving_intent("Tumbling Rock cave passages and Top of the World")
    assert intent_t is not None
    assert intent_t.cave_id == "tumbling-rock-cave-passages"


def test_detect_caving_intent_actions():
    plan_intent = detect_caving_intent(
        "Calculate SRT rigging plan and rope stretch for Fantastic Pit"
    )
    assert plan_intent is not None
    assert plan_intent.action == "rigging_plan"
    assert plan_intent.cave_id == "fantastic-pit-ellisons-cave"

    gear_intent = detect_caving_intent("What mandatory gear and checklist do I need for caving?")
    assert gear_intent is not None
    assert gear_intent.action == "gear_checklist"

    detail_intent = detect_caving_intent("Tell me details and highlights about Mammoth cave")
    assert detail_intent is not None
    assert detail_intent.action == "route_detail"
    assert detail_intent.cave_id == "mammoth-cave-historic-dallons"

    list_intent = detect_caving_intent("Show me all caving routes catalog")
    assert list_intent is not None
    assert list_intent.action == "routes_list"


def test_detect_caving_intent_guardrails_canyoneering():
    assert (
        detect_caving_intent("Looking for slot canyon canyoneering rappel in Zion Subway") is None
    )
    assert (
        detect_caving_intent("Mystery canyon technical descent with fiddlestick pull line") is None
    )
    assert detect_caving_intent("Choprock canyon keeper potholes canyoneering") is None


def test_detect_caving_intent_guardrails_rock_climbing():
    assert detect_caving_intent("Looking for rock climbing crags and trad climbing routes") is None
    assert detect_caving_intent("Where can I find sport climbing and bouldering?") is None
    assert detect_caving_intent("Do I need a camalot and chalk bag for climbing?") is None


def test_detect_caving_intent_guardrails_mountaineering():
    assert detect_caving_intent("Glacier mountaineering crevasse rescue rope team") is None
    assert detect_caving_intent("Ice axe self arrest and crampon footwork") is None


def test_detect_caving_intent_guardrails_via_ferrata():
    assert (
        detect_caving_intent("Telluride via ferrata iron way cable route with EN 958 lanyard")
        is None
    )
    assert detect_caving_intent("Type K carabiner for klettersteig via ferrata") is None


def test_detect_caving_intent_guardrails_ecommerce():
    assert detect_caving_intent("What is the status of my order #54321?") is None
    assert detect_caving_intent("Can I get a return label for my refund?") is None


def test_detect_caving_intent_empty():
    assert detect_caving_intent("") is None
    assert detect_caving_intent("    ") is None


def test_detect_caving_intent_grades():
    assert detect_caving_intent("Show me class 1 caving routes").grade == "class_1_horizontal_walk"
    assert detect_caving_intent("Show me class 2 caving routes").grade == "class_2_scramble_crawl"
    assert detect_caving_intent("Show me class 3 caving routes").grade == "class_3_tight_squeeze"
    assert detect_caving_intent("Show me class 4 caving routes").grade == "class_4_vertical_srt"
    assert detect_caving_intent("Show me class 5 caving routes").grade == "class_5_complex_alpine"


def test_build_caving_prompt_with_cave():
    intent = CavingIntent(action="route_detail", cave_id="fantastic-pit-ellisons-cave")
    prompt = build_caving_prompt(intent)
    assert "Caving" in prompt
    assert "Fantastic Pit" in prompt
    assert "Single Rope Technique" in prompt or "SRT" in prompt
    assert "White-Nose Syndrome" in prompt or "WNS" in prompt


def test_build_caving_prompt_routes_list():
    intent = CavingIntent(action="routes_list")
    prompt = build_caving_prompt(intent)
    assert "Caving" in prompt
    assert "Fantastic Pit" in prompt
    assert "Mammoth Cave" in prompt


def test_build_caving_prompt_with_grade():
    intent = CavingIntent(action="routes_list", grade="class_4_vertical_srt")
    prompt = build_caving_prompt(intent)
    assert "Matching class_4_vertical_srt" in prompt or "class_4_vertical_srt" in prompt


def test_format_caving_response_rigging_plan():
    intent = CavingIntent(action="rigging_plan", cave_id="fantastic-pit-ellisons-cave")
    res = format_caving_response(intent)
    assert "answer" in res
    assert "caving_info" in res
    info = res["caving_info"]
    assert info["action"] == "rigging_plan"
    assert info["plan"]["cave_id"] == "fantastic-pit-ellisons-cave"


def test_format_caving_response_route_detail():
    intent = CavingIntent(action="route_detail", cave_id="mammoth-cave-historic-dallons")
    res = format_caving_response(intent)
    assert "answer" in res
    assert "caving_info" in res
    info = res["caving_info"]
    assert info["action"] == "route_detail"
    assert info["route"]["cave_id"] == "mammoth-cave-historic-dallons"


def test_format_caving_response_gear_checklist():
    intent = CavingIntent(action="gear_checklist")
    res = format_caving_response(intent)
    assert "answer" in res
    assert "caving_info" in res
    info = res["caving_info"]
    assert info["action"] == "gear_checklist"
    assert len(info["gear"]) == 6


def test_format_caving_response_routes_list():
    intent = CavingIntent(action="routes_list")
    res = format_caving_response(intent)
    assert "answer" in res
    assert "caving_info" in res
    info = res["caving_info"]
    assert info["action"] == "routes_list"
    assert len(info["routes"]) == 5


def test_format_caving_response_rigging_plan_invalid_cave_fallback():
    intent = CavingIntent(action="rigging_plan", cave_id="invalid-cave")
    res = format_caving_response(intent)
    assert res["caving_info"]["action"] == "routes_list"


def test_calculate_srt_rigging_plan_lip_rub_hazard():
    req = SrtRiggingRequest(
        cave_id="fantastic-pit-ellisons-cave",
        pitch_depth_m=100.0,
        rope_abrasion_risk="lip_rub_hazard",
        rebelay_configured=False,
    )
    plan = calculate_srt_rigging_plan(req)
    assert plan.safety_status == "critical_hazard"

    req_mitigated = SrtRiggingRequest(
        cave_id="tumbling-rock-cave-passages",
        pitch_depth_m=18.0,
        rope_abrasion_risk="lip_rub_hazard",
        rebelay_configured=True,
    )
    plan_mitigated = calculate_srt_rigging_plan(req_mitigated)
    assert plan_mitigated.safety_status == "safe"


def test_calculate_srt_rigging_plan_heavy_weight_or_thin_spec():
    req = SrtRiggingRequest(
        cave_id="fantastic-pit-ellisons-cave",
        pitch_depth_m=50.0,
        caver_weight_kg=100.0,
        caver_pack_weight_kg=25.0,
        rope_diameter_mm=10.0,
        rebelay_configured=True,
    )
    plan = calculate_srt_rigging_plan(req)
    assert plan.safety_status == "caution"


def test_detect_caving_intent_no_match():
    assert detect_caving_intent("Hello, what is the weather like in Seattle today?") is None
