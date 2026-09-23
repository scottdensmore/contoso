import pytest
from contoso_chat.wilderness_shelters import (
    ShelterGearRequirement,
    ShelterIntent,
    ShelterThermodynamicsRequest,
    ShelterThermodynamicsResponse,
    SurvivalShelterModel,
    build_shelter_prompt,
    calculate_shelter_thermodynamics,
    detect_shelter_intent,
    extract_shelter_intent,
    format_shelter_response,
    get_shelter_gear,
    get_survival_shelter_by_id,
    get_survival_shelters,
)


def test_survival_shelter_model():
    shelter = SurvivalShelterModel(
        shelter_id="test-shelter",
        title="Test Snow Shelter",
        environment="alpine_tundra",
        min_snow_depth_m=1.8,
        difficulty="advanced",
        construction_hours=3.5,
        capacity_persons=2,
        interior_thermal_gain_f=30,
        min_roof_thickness_cm=40,
        description="A test survival shelter in alpine snowpack.",
        highlights=["Raised sleeping bench", "Chimney ventilation vent"],
    )
    assert shelter.shelter_id == "test-shelter"
    assert shelter.min_snow_depth_m == 1.8
    assert shelter.capacity_persons == 2
    assert shelter.interior_thermal_gain_f == 30
    assert len(shelter.highlights) == 2


def test_thermodynamics_request_defaults():
    req = ShelterThermodynamicsRequest(shelter_id="alpine-snow-cave-bivouac")
    assert req.shelter_id == "alpine-snow-cave-bivouac"
    assert req.ambient_temp_f == 0.0
    assert req.occupant_count == 2
    assert req.wall_thickness_cm == 30.0
    assert req.vent_hole_diameter_cm == 10.0
    assert req.platform_height_above_floor_cm == 35.0
    assert req.candle_lit is False


def test_thermodynamics_response_model():
    resp = ShelterThermodynamicsResponse(
        shelter_id="alpine-snow-cave-bivouac",
        shelter_title="Alpine Snow Cave Bivouac",
        interior_temp_f=32,
        floor_temp_f=23,
        wall_r_value=7.5,
        cold_trap_differential_f=9,
        ventilation_adequacy_percent=100,
        structural_safety_status="SAFE",
        thermal_advisory="Optimal thermal equilibrium.",
    )
    assert resp.shelter_id == "alpine-snow-cave-bivouac"
    assert resp.interior_temp_f == 32
    assert resp.cold_trap_differential_f == 9
    assert resp.structural_safety_status == "SAFE"


def test_shelter_gear_model():
    gear = ShelterGearRequirement(
        item_id="d-grip-avalanche-snow-shovel",
        name="High-Strength D-Grip Aluminum Avalanche Snow Shovel",
        category="excavation_tools",
        mandatory=True,
        purpose="High-volume snow moving and carving dome roofs.",
    )
    assert gear.item_id == "d-grip-avalanche-snow-shovel"
    assert gear.mandatory is True


def test_get_survival_shelters_catalog():
    shelters = get_survival_shelters()
    assert len(shelters) == 5
    ids = [s.shelter_id for s in shelters]
    assert "alpine-snow-cave-bivouac" in ids
    assert "subarctic-quinzhee-snow-mound" in ids
    assert "emergency-snow-trench-tarp" in ids
    assert "boreal-debris-hut-lean-to" in ids
    assert "tree-well-snow-bivouac" in ids


def test_get_survival_shelters_difficulty_filter():
    beginner = get_survival_shelters(difficulty="beginner")
    assert len(beginner) == 2
    assert all(s.difficulty == "beginner" for s in beginner)

    intermediate = get_survival_shelters(difficulty="intermediate")
    assert len(intermediate) == 2
    assert all(s.difficulty == "intermediate" for s in intermediate)

    advanced = get_survival_shelters(difficulty="advanced")
    assert len(advanced) == 1
    assert advanced[0].shelter_id == "alpine-snow-cave-bivouac"


def test_get_survival_shelter_by_id():
    cave = get_survival_shelter_by_id("alpine-snow-cave-bivouac")
    assert cave is not None
    assert cave.shelter_id == "alpine-snow-cave-bivouac"
    assert cave.min_snow_depth_m >= 1.5

    quinzhee = get_survival_shelter_by_id("subarctic-quinzhee-snow-mound")
    assert quinzhee is not None
    assert "quinzhee" in quinzhee.title.lower()

    unknown = get_survival_shelter_by_id("non-existent-shelter")
    assert unknown is None


def test_get_shelter_gear():
    gear = get_shelter_gear()
    assert len(gear) == 6
    assert all(g.mandatory is True for g in gear)
    gear_ids = [g.item_id for g in gear]
    assert "d-grip-avalanche-snow-shovel" in gear_ids
    assert "folding-snow-bone-saw" in gear_ids
    assert "thermal-bivy-survival-bag" in gear_ids
    assert "closed-cell-foam-sleeping-pad" in gear_ids
    assert "angled-ventilation-probe" in gear_ids
    assert "survival-candle-lantern" in gear_ids


def test_calculate_shelter_thermodynamics_nominal():
    req = ShelterThermodynamicsRequest(
        shelter_id="alpine-snow-cave-bivouac",
        ambient_temp_f=0.0,
        occupant_count=2,
        wall_thickness_cm=45.0,
        vent_hole_diameter_cm=10.0,
        platform_height_above_floor_cm=35.0,
        candle_lit=True,
    )
    res = calculate_shelter_thermodynamics(req)
    assert res.shelter_id == "alpine-snow-cave-bivouac"
    assert res.wall_r_value >= 10.0
    assert res.cold_trap_differential_f == 9
    assert res.floor_temp_f < res.interior_temp_f
    assert res.floor_temp_f == res.interior_temp_f - res.cold_trap_differential_f
    assert 28 <= res.interior_temp_f <= 34
    assert res.ventilation_adequacy_percent >= 90
    assert res.structural_safety_status == "SAFE"
    assert (
        "thermal inversion" in res.thermal_advisory.lower()
        or "sleeping" in res.thermal_advisory.lower()
    )


def test_calculate_shelter_thermodynamics_thin_roof_collapse_risk():
    # Alpine snow cave requires min_roof_thickness_cm of 45cm; 15cm should flag COLLAPSE warning/risk
    req = ShelterThermodynamicsRequest(
        shelter_id="alpine-snow-cave-bivouac",
        wall_thickness_cm=15.0,
        vent_hole_diameter_cm=10.0,
    )
    res = calculate_shelter_thermodynamics(req)
    assert res.structural_safety_status in ("CRITICAL_COLLAPSE_RISK", "COLLAPSE_WARNING")
    assert (
        "collapse" in res.thermal_advisory.lower()
        or "wall thickness" in res.thermal_advisory.lower()
    )


def test_calculate_shelter_thermodynamics_asphyxiation_hazard():
    # 2 occupants with 2cm vent hole is severely inadequate
    req = ShelterThermodynamicsRequest(
        shelter_id="subarctic-quinzhee-snow-mound",
        occupant_count=2,
        wall_thickness_cm=35.0,
        vent_hole_diameter_cm=2.0,
    )
    res = calculate_shelter_thermodynamics(req)
    assert res.ventilation_adequacy_percent <= 30
    assert res.structural_safety_status == "ASPHYXIATION_HAZARD"
    assert (
        "ventilation" in res.thermal_advisory.lower() or "chimney" in res.thermal_advisory.lower()
    )


def test_calculate_shelter_thermodynamics_unknown_shelter():
    req = ShelterThermodynamicsRequest(shelter_id="non-existent-cave")
    with pytest.raises(ValueError, match="not found"):
        calculate_shelter_thermodynamics(req)


def test_extract_shelter_intent_shelters_list():
    assert detect_shelter_intent == extract_shelter_intent
    intent = extract_shelter_intent("What winter survival shelters and snow bivouacs can I build?")
    assert intent is not None
    assert intent.action == "shelters_list"

    intent_beginner = extract_shelter_intent("List beginner winter survival shelters")
    assert intent_beginner is not None
    assert intent_beginner.action == "shelters_list"
    assert intent_beginner.difficulty == "beginner"


def test_extract_shelter_intent_shelter_detail():
    intent = extract_shelter_intent("Tell me how to build an alpine snow cave bivouac")
    assert intent is not None
    assert intent.action == "shelter_detail"
    assert intent.shelter_id == "alpine-snow-cave-bivouac"

    intent_quinzhee = extract_shelter_intent(
        "How do you construct a subarctic quinzhee snow mound?"
    )
    assert intent_quinzhee is not None
    assert intent_quinzhee.action == "shelter_detail"
    assert intent_quinzhee.shelter_id == "subarctic-quinzhee-snow-mound"


def test_extract_shelter_intent_thermodynamics():
    intent = extract_shelter_intent(
        "Calculate cold-air well thermal gain and R-value for snow cave"
    )
    assert intent is not None
    assert intent.action == "calculate_thermodynamics"
    assert intent.shelter_id == "alpine-snow-cave-bivouac"


def test_extract_shelter_intent_gear():
    intent = extract_shelter_intent(
        "What snow saw, avalanche shovel, and gear do I need for shelter building?"
    )
    assert intent is not None
    assert intent.action == "gear_checklist"


def test_extract_shelter_intent_guardrails():
    # Alpine huts (huts.py) should NOT be hijacked
    assert extract_shelter_intent("Can I book a mountain alpine hut bunk for next weekend?") is None
    assert extract_shelter_intent("Check hut reservation availability at Mount Tahoma") is None

    # Primitive bushcraft (bushcraft.py) should NOT be hijacked
    assert extract_shelter_intent("How to make a bow drill friction fire ember") is None
    assert extract_shelter_intent("Harvesting basswood inner bark bast cordage") is None

    # Avalanche safety (safety.py / avalanche.py) should NOT be hijacked
    assert (
        extract_shelter_intent(
            "What is the avalanche danger forecast and transceiver beacon check?"
        )
        is None
    )
    assert (
        extract_shelter_intent("Perform a snowpack pit compression test for avalanche safety")
        is None
    )

    # Customer support should NOT be hijacked
    assert extract_shelter_intent("I want a refund on order #12345") is None
    assert extract_shelter_intent("Where is my return label for shipping?") is None


def test_format_shelter_response():
    # shelters_list
    intent_list = ShelterIntent(action="shelters_list")
    res_list = format_shelter_response(intent_list)
    assert isinstance(res_list, str)
    assert "Contoso Wilderness Survival Shelters & Snow Bivouac Catalog" in res_list
    assert res_list.get("shelter_info") is not None
    assert res_list["shelter_info"]["action"] == "shelters_list"

    # shelter_detail
    intent_detail = ShelterIntent(action="shelter_detail", shelter_id="alpine-snow-cave-bivouac")
    res_detail = format_shelter_response(intent_detail)
    assert "Alpine Snow Cave Bivouac" in res_detail
    assert res_detail["shelter_info"]["action"] == "shelter_detail"

    # calculate_thermodynamics
    intent_thermo = ShelterIntent(
        action="calculate_thermodynamics", shelter_id="alpine-snow-cave-bivouac"
    )
    res_thermo = format_shelter_response(intent_thermo)
    assert "Thermodynamic Analysis" in res_thermo or "Thermal Analysis" in res_thermo
    assert res_thermo["shelter_info"]["action"] == "calculate_thermodynamics"

    # gear_checklist
    intent_gear = ShelterIntent(action="gear_checklist")
    res_gear = format_shelter_response(intent_gear)
    assert "Mandatory Wilderness Survival Shelter & Snow Bivouac Gear" in res_gear
    assert res_gear["shelter_info"]["action"] == "gear_checklist"


def test_build_shelter_prompt():
    prompt_list = build_shelter_prompt(ShelterIntent(action="shelters_list"))
    assert "Available Wilderness Survival Shelters" in prompt_list
    assert "Alpine Snow Cave" in prompt_list

    prompt_detail = build_shelter_prompt(
        ShelterIntent(action="shelter_detail", shelter_id="subarctic-quinzhee-snow-mound")
    )
    assert "Subarctic Quinzhee Snow Mound" in prompt_detail

    prompt_thermo = build_shelter_prompt(
        ShelterIntent(action="calculate_thermodynamics", shelter_id="alpine-snow-cave-bivouac")
    )
    assert "Thermodynamics" in prompt_thermo
    assert "Cold Trap" in prompt_thermo or "Cold-Air" in prompt_thermo

    prompt_gear = build_shelter_prompt(ShelterIntent(action="gear_checklist"))
    assert "Mandatory Survival Shelter Gear Compliance" in prompt_gear
    assert "avalanche" in prompt_gear.lower()


def test_formatted_shelter_response_dunder_methods():
    intent = ShelterIntent(action="shelters_list")
    res = format_shelter_response(intent)
    assert "shelter_info" in res
    assert 123 not in res
    assert "answer" in res.keys()
    assert res["shelter_info"] is not None
    assert res[0] == "C"  # string indexing fallback


def test_thermodynamics_boreal_and_advisories():
    # Boreal debris hut with low platform height (cold trap < 5) and moderate wall thickness
    req_boreal = ShelterThermodynamicsRequest(
        shelter_id="boreal-debris-hut-lean-to",
        platform_height_above_floor_cm=10.0,
        wall_thickness_cm=22.0,
        vent_hole_diameter_cm=10.0,
    )
    res_boreal = calculate_shelter_thermodynamics(req_boreal)
    assert res_boreal.cold_trap_differential_f < 5
    assert "sleeping platform is too close" in res_boreal.thermal_advisory.lower()
    assert res_boreal.structural_safety_status in ("COLLAPSE_WARNING", "CAUTION")

    # Caution status due to marginal ventilation or platform
    req_caution = ShelterThermodynamicsRequest(
        shelter_id="emergency-snow-trench-tarp",
        platform_height_above_floor_cm=15.0,
        wall_thickness_cm=20.0,
        vent_hole_diameter_cm=6.5,
    )
    res_caution = calculate_shelter_thermodynamics(req_caution)
    assert res_caution.structural_safety_status == "CAUTION"


def test_extract_shelter_intent_additional_coverage():
    t_well = extract_shelter_intent("Can I survive in a tree well bivouac?")
    assert t_well is not None
    assert t_well.shelter_id == "tree-well-snow-bivouac"

    trench = extract_shelter_intent("Build an emergency snow trench with tarp")
    assert trench is not None
    assert trench.shelter_id == "emergency-snow-trench-tarp"

    taiga = extract_shelter_intent("Winter bivouac shelter in the subarctic taiga")
    assert taiga is not None
    assert taiga.environment == "subarctic"

    montane = extract_shelter_intent("Montane conifer snow bivouac building")
    assert montane is not None
    assert montane.environment == "montane"

    moderate = extract_shelter_intent("Moderate difficulty winter shelter building")
    assert moderate is not None
    assert moderate.difficulty == "intermediate"

    expert = extract_shelter_intent("Expert alpine snow cave bivouac")
    assert expert is not None
    assert expert.difficulty == "advanced"
