import pytest
from contoso_chat.psicobloc import (
    FormattedPsicoblocResponse,
    PsicoblocCalculationRequest,
    PsicoblocCalculationResponse,
    PsicoblocCragModel,
    PsicoblocGearRequirement,
    PsicoblocIntent,
    build_psicobloc_prompt,
    calculate_psicobloc,
    detect_psicobloc_intent,
    extract_psicobloc_intent,
    format_psicobloc_response,
    get_psicobloc_crag_by_id,
    get_psicobloc_crags,
    get_psicobloc_gear,
)

# -----------------------------------------------------------------------------
# Pydantic Model Tests
# -----------------------------------------------------------------------------


def test_psicobloc_crag_model():
    crag = PsicoblocCragModel(
        crag_id="test-crag",
        title="Test DWS Crag",
        location="Test Bay, Test Island",
        country="Spain",
        grade_range="6a - 7b",
        max_height_m=15,
        rock_type="pocketed_limestone",
        water_type="sea",
        typical_water_depth_m=8,
        boat_access_only=False,
        description="A great test psicobloc crag.",
        highlights=["Overhanging roof", "Clear landing pool"],
    )
    assert crag.crag_id == "test-crag"
    assert crag.title == "Test DWS Crag"
    assert crag.max_height_m == 15
    assert crag.rock_type == "pocketed_limestone"
    assert crag.typical_water_depth_m == 8
    assert crag.boat_access_only is False
    assert len(crag.highlights) == 2


def test_psicobloc_calculation_request_defaults():
    req = PsicoblocCalculationRequest()
    assert req.crag_id == "es-pontas-mallorca"
    assert req.climbing_height_m == 12.0
    assert req.water_depth_m == 7.0
    assert req.swell_height_m == 0.6
    assert req.tide_stage == "high_slack_tide"
    assert req.body_entry_position == "pencil_feet_first_pointed"


def test_psicobloc_calculation_response_model():
    resp = PsicoblocCalculationResponse(
        crag_id="es-pontas-mallorca",
        crag_title="Es Pontàs Natural Sea Arch",
        impact_velocity_ms=15.3,
        impact_velocity_kmh=55.1,
        min_safe_depth_m=6.1,
        depth_clearance_m=0.9,
        entry_orientation_safety="OPTIMAL ENTRY ORIENTATION: Vertical pencil entry minimizes drag.",
        tide_swell_safety="FAVORABLE SEA STATE: Calm to moderate swell.",
        safety_status="approved",
        dive_advisory="APPROVED PSICOBLOC PROFILE: Clear fall zone meets safety criteria.",
    )
    assert resp.crag_id == "es-pontas-mallorca"
    assert resp.impact_velocity_ms == 15.3
    assert resp.impact_velocity_kmh == 55.1
    assert resp.min_safe_depth_m == 6.1
    assert resp.depth_clearance_m == 0.9
    assert resp.safety_status == "approved"


def test_psicobloc_gear_model():
    gear = PsicoblocGearRequirement(
        item_id="test-gear",
        name="Test Liquid Chalk",
        category="friction",
        mandatory=True,
        purpose="Friction on humid sea cliffs",
    )
    assert gear.item_id == "test-gear"
    assert gear.mandatory is True
    assert gear.category == "friction"


# -----------------------------------------------------------------------------
# Catalog Tests (5 Iconic Psicobloc / DWS Crags)
# -----------------------------------------------------------------------------


def test_psicobloc_crags_catalog():
    crags = get_psicobloc_crags()
    assert len(crags) == 5
    crag_ids = [c.crag_id for c in crags]
    assert "es-pontas-mallorca" in crag_ids
    assert "cala-barques-cave" in crag_ids
    assert "railay-tonsai-krabi" in crag_ids
    assert "swanage-conner-cove" in crag_ids
    assert "summersville-lake-wv" in crag_ids


def test_psicobloc_crags_filter_by_rock_type():
    pocketed = get_psicobloc_crags(rock_type="pocketed_limestone")
    assert len(pocketed) == 2
    p_ids = [c.crag_id for c in pocketed]
    assert "es-pontas-mallorca" in p_ids
    assert "swanage-conner-cove" in p_ids

    tufa = get_psicobloc_crags(rock_type="tufa_limestone")
    assert len(tufa) == 1
    assert tufa[0].crag_id == "cala-barques-cave"

    karst = get_psicobloc_crags(rock_type="karst_limestone")
    assert len(karst) == 1
    assert karst[0].crag_id == "railay-tonsai-krabi"

    sandstone = get_psicobloc_crags(rock_type="marine_sandstone")
    assert len(sandstone) == 1
    assert sandstone[0].crag_id == "summersville-lake-wv"


def test_get_psicobloc_crag_by_id():
    crag = get_psicobloc_crag_by_id("es-pontas-mallorca")
    assert crag is not None
    assert crag.crag_id == "es-pontas-mallorca"
    assert "Es Pontàs" in crag.title
    assert crag.country == "Spain"
    assert crag.max_height_m == 20
    assert crag.typical_water_depth_m == 10
    assert crag.boat_access_only is False
    assert len(crag.highlights) == 3

    railay = get_psicobloc_crag_by_id("railay-tonsai-krabi")
    assert railay is not None
    assert railay.boat_access_only is True
    assert railay.country == "Thailand"

    assert get_psicobloc_crag_by_id("non-existent-crag") is None


# -----------------------------------------------------------------------------
# Gear Checklist Tests (6 Mandatory Safety Kit Items)
# -----------------------------------------------------------------------------


def test_get_psicobloc_gear():
    gear = get_psicobloc_gear()
    assert len(gear) == 6
    assert all(g.mandatory is True for g in gear)
    gear_ids = [g.item_id for g in gear]
    assert "liquid-chalk-water-resistant" in gear_ids
    assert "quick-drain-climbing-shoes" in gear_ids
    assert "floating-drybag-chalkbag" in gear_ids
    assert "weighted-cliff-exit-ladder" in gear_ids
    assert "high-visibility-swim-buoy" in gear_ids
    assert "microfiber-chamois-towels" in gear_ids


# -----------------------------------------------------------------------------
# Calculation Engine Tests
# -----------------------------------------------------------------------------


def test_calculate_psicobloc_safe():
    req = PsicoblocCalculationRequest(
        crag_id="es-pontas-mallorca",
        climbing_height_m=12.0,
        water_depth_m=7.0,
        swell_height_m=0.6,
        tide_stage="high_slack_tide",
        body_entry_position="pencil_feet_first_pointed",
    )
    res = calculate_psicobloc(req)
    assert res.crag_id == "es-pontas-mallorca"
    assert res.impact_velocity_ms == 15.3
    assert res.impact_velocity_kmh == 55.1
    assert res.min_safe_depth_m == 6.1
    assert res.depth_clearance_m == 0.9
    assert res.safety_status == "approved"
    assert "OPTIMAL" in res.entry_orientation_safety
    assert "FAVORABLE" in res.tide_swell_safety
    assert "APPROVED" in res.dive_advisory


def test_calculate_psicobloc_belly_flop_hazard():
    req = PsicoblocCalculationRequest(
        crag_id="es-pontas-mallorca",
        climbing_height_m=10.0,
        water_depth_m=8.0,
        swell_height_m=0.5,
        body_entry_position="flat_back_or_belly",
    )
    res = calculate_psicobloc(req)
    assert res.safety_status == "hazardous_prohibited"
    assert "CRITICAL IMPACT TRAUMA" in res.entry_orientation_safety
    assert "PROHIBITED" in res.dive_advisory


def test_calculate_psicobloc_feet_first_flailing():
    req = PsicoblocCalculationRequest(
        crag_id="es-pontas-mallorca",
        climbing_height_m=10.0,
        water_depth_m=8.0,
        body_entry_position="feet_first_arms_flailing",
    )
    res = calculate_psicobloc(req)
    assert "DISLOCATION" in res.entry_orientation_safety


def test_calculate_psicobloc_shallow_water_hazard():
    # min safe depth for 12m is 6.1m, with depth 5.0m clearance is negative
    req = PsicoblocCalculationRequest(
        crag_id="es-pontas-mallorca",
        climbing_height_m=12.0,
        water_depth_m=5.0,
    )
    res = calculate_psicobloc(req)
    assert res.depth_clearance_m == -1.1
    assert res.safety_status == "hazardous_prohibited"


def test_calculate_psicobloc_extreme_swell_hazard():
    req = PsicoblocCalculationRequest(
        crag_id="es-pontas-mallorca",
        climbing_height_m=10.0,
        water_depth_m=8.0,
        swell_height_m=2.5,
    )
    res = calculate_psicobloc(req)
    assert res.safety_status == "hazardous_prohibited"
    assert "DANGEROUS SEA SWELL" in res.tide_swell_safety


def test_calculate_psicobloc_high_fall_caution():
    req = PsicoblocCalculationRequest(
        crag_id="es-pontas-mallorca",
        climbing_height_m=18.0,
        water_depth_m=10.0,
        swell_height_m=0.5,
    )
    res = calculate_psicobloc(req)
    assert res.safety_status == "caution_high_risk"
    assert "HIGH RISK" in res.dive_advisory


def test_calculate_psicobloc_low_tide_caution():
    req = PsicoblocCalculationRequest(
        crag_id="swanage-conner-cove",
        climbing_height_m=10.0,
        water_depth_m=8.0,
        swell_height_m=0.6,
        tide_stage="low_dead_tide",
    )
    res = calculate_psicobloc(req)
    assert res.safety_status == "caution_high_risk"


def test_calculate_psicobloc_invalid_crag():
    req = PsicoblocCalculationRequest(crag_id="non-existent")
    with pytest.raises(ValueError, match="not found"):
        calculate_psicobloc(req)


# -----------------------------------------------------------------------------
# Intent Detection Tests
# -----------------------------------------------------------------------------


def test_detect_psicobloc_intent():
    # Crags list
    i1 = detect_psicobloc_intent("Where can I go deep water soloing?")
    assert i1 is not None
    assert i1.action in ("crags_list", "crags")

    # Rock type filter
    i2 = detect_psicobloc_intent("Show me psicobloc crags on pocketed limestone")
    assert i2 is not None
    assert i2.rock_type == "pocketed_limestone"

    # Specific crags
    i3 = detect_psicobloc_intent("Tell me about Es Pontas psicobloc in Mallorca")
    assert i3 is not None
    assert i3.crag_id == "es-pontas-mallorca"

    i4 = detect_psicobloc_intent("Cala Barques DWS sea cave overhangs")
    assert i4 is not None
    assert i4.crag_id == "cala-barques-cave"

    i5 = detect_psicobloc_intent("Railay deep water soloing longtail boat access")
    assert i5 is not None
    assert i5.crag_id == "railay-tonsai-krabi"

    i6 = detect_psicobloc_intent("Conner Cove Dorset Jurassic coast DWS")
    assert i6 is not None
    assert i6.crag_id == "swanage-conner-cove"

    i7 = detect_psicobloc_intent("Summersville lake DWS freshwater deep water soloing")
    assert i7 is not None
    assert i7.crag_id == "summersville-lake-wv"

    # Calculation query
    i8 = detect_psicobloc_intent(
        "Calculate impact velocity and minimum safe water depth clearance for pencil dive fall"
    )
    assert i8 is not None
    assert i8.action == "calculate_psicobloc"

    # Gear query
    i9 = detect_psicobloc_intent(
        "What is the safety gear checklist for liquid chalk and marine rope ladder exit?"
    )
    assert i9 is not None
    assert i9.action == "gear_checklist"

    # Extract alias
    assert extract_psicobloc_intent("Es Pontas psicobloc") is not None

    # Disambiguation guards
    assert detect_psicobloc_intent("") is None
    assert detect_psicobloc_intent("Where is my order #54321?") is None
    assert detect_psicobloc_intent("I need a return label for my shoes") is None
    assert detect_psicobloc_intent("Check shipping tracking status") is None
    assert (
        detect_psicobloc_intent("What are the day pass prices for the local bouldering gym?")
        is None
    )
    assert detect_psicobloc_intent("Indoor climbing gym membership") is None
    assert (
        detect_psicobloc_intent("Which quickdraws and harness do I need for sport lead climbing?")
        is None
    )
    assert detect_psicobloc_intent("Trad rack with camalots and belay device") is None
    assert detect_psicobloc_intent("Deep sea charter trolling for marlin with fishing rod") is None
    assert detect_psicobloc_intent("Deep sea fishing tackle box") is None


# -----------------------------------------------------------------------------
# Prompt Building & Response Formatting Tests
# -----------------------------------------------------------------------------


def test_build_psicobloc_prompt():
    intent = PsicoblocIntent(action="crags_list")
    prompt = build_psicobloc_prompt(intent)
    assert "Psicobloc" in prompt or "Deep Water Soloing" in prompt
    assert "Es Pontàs" in prompt


def test_format_psicobloc_response():
    intent = PsicoblocIntent(action="crags_list")
    res = format_psicobloc_response(intent, "Where can I go deep water soloing?")
    assert isinstance(res, FormattedPsicoblocResponse)
    assert "psicobloc_info" in res
    assert "answer" in res
    assert res.get("psicobloc_info")["action"] == "crags_list"
    assert "Es Pontàs" in res.get("answer")


def test_formatted_psicobloc_response_dict_methods():
    raw_data = {"psicobloc_info": {"test": 123}, "custom_field": "val"}
    resp = FormattedPsicoblocResponse("Hello Psicobloc", raw_data)
    assert resp["psicobloc_info"] == {"test": 123}
    assert resp["custom_field"] == "val"
    assert "psicobloc_info" in resp
    assert "unknown_key" not in resp
    assert "psicobloc_info" in list(resp.keys())
    assert {"test": 123} in list(resp.values())
    assert ("custom_field", "val") in list(resp.items())


def test_build_psicobloc_prompt_variants():
    # crag_detail
    i_detail = PsicoblocIntent(action="crag_detail", crag_id="es-pontas-mallorca")
    p_detail = build_psicobloc_prompt(i_detail)
    assert "Selected Crag: Es Pontàs" in p_detail

    # calculate
    i_calc = PsicoblocIntent(action="calculate_psicobloc")
    p_calc = build_psicobloc_prompt(i_calc)
    assert "Calculate impact velocity" in p_calc

    # gear
    i_gear = PsicoblocIntent(action="gear_checklist")
    p_gear = build_psicobloc_prompt(i_gear)
    assert "Present the mandatory 6-item" in p_gear


def test_format_psicobloc_response_variants():
    # crag_detail
    i_detail = PsicoblocIntent(action="crag_detail", crag_id="cala-barques-cave")
    res_detail = format_psicobloc_response(i_detail, "Tell me about Cala Barques")
    assert "Cala Barques" in res_detail.get("answer")
    assert res_detail.get("psicobloc_info")["action"] == "crag_detail"

    # calculate
    i_calc = PsicoblocIntent(action="calculate_psicobloc", crag_id="railay-tonsai-krabi")
    res_calc = format_psicobloc_response(i_calc, "Calculate fall for Railay")
    assert "Fall Velocity" in res_calc.get("answer")
    assert res_calc.get("psicobloc_info")["action"] == "calculate_psicobloc"

    # gear
    i_gear = PsicoblocIntent(action="gear_checklist")
    res_gear = format_psicobloc_response(i_gear, "What gear do I need?")
    assert "Mandatory" in res_gear.get("answer")
    assert res_gear.get("psicobloc_info")["action"] == "gear_checklist"

    # fallback
    i_other = PsicoblocIntent(action="unknown_action")
    res_other = format_psicobloc_response(i_other, "General question")
    assert "iconic psicobloc" in res_other.get("answer")


def test_detect_psicobloc_intent_all_rock_types():
    assert detect_psicobloc_intent("psicobloc on tufa limestone").rock_type == "tufa_limestone"
    assert detect_psicobloc_intent("psicobloc on karst limestone").rock_type == "karst_limestone"
    assert detect_psicobloc_intent("dws on marine sandstone").rock_type == "marine_sandstone"


def test_formatted_psicobloc_fallback_dunders():
    resp = FormattedPsicoblocResponse("Hello", {"key": "val"})
    # string indexing calls super().__getitem__
    assert resp[0] == "H"
    # non-str membership
    assert (123 in resp) is False


def test_detect_psicobloc_intent_unrelated_query():
    assert detect_psicobloc_intent("hiking in the mountains on sunny afternoon") is None
