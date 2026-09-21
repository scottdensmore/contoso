import pytest
from contoso_chat.bushcraft import (
    BushcraftGearRequirement,
    BushcraftIntent,
    BushcraftProjectModel,
    ShelterThermalRequest,
    ShelterThermalResponse,
    build_bushcraft_prompt,
    calculate_shelter_thermal,
    detect_bushcraft_intent,
    format_bushcraft_response,
    get_bushcraft_gear,
    get_bushcraft_project_by_id,
    get_bushcraft_projects,
)

# =============================================================================
# 1. Project Catalog & Lookup Tests
# =============================================================================


def test_get_bushcraft_projects_all():
    projects = get_bushcraft_projects()
    assert len(projects) == 5
    ids = [p.project_id for p in projects]
    assert "boreal-debris-hut-shelter" in ids
    assert "cedar-bow-drill-ember" in ids
    assert "basswood-bast-fiber-cordage" in ids
    assert "mors-kochanski-super-shelter" in ids
    assert "birch-bark-water-boiling-vessel" in ids

    for p in projects:
        assert isinstance(p, BushcraftProjectModel)
        assert p.project_id
        assert p.title
        assert p.region
        assert p.discipline in (
            "shelter_craft",
            "friction_fire",
            "cordage_botany",
            "water_foraging_craft",
        )
        assert p.difficulty in (
            "intermediate_bushcraft",
            "foundation_beginner",
            "advanced_wilderness",
        )
        assert p.estimated_hours > 0
        assert p.thermal_rating_r_value >= 0.0
        assert len(p.materials_required) >= 2
        assert p.tool_required
        assert p.description
        assert len(p.highlights) >= 2


def test_get_bushcraft_projects_filter_discipline():
    shelters = get_bushcraft_projects(discipline="shelter_craft")
    assert len(shelters) == 2
    assert all(p.discipline == "shelter_craft" for p in shelters)
    shelter_ids = [p.project_id for p in shelters]
    assert "boreal-debris-hut-shelter" in shelter_ids
    assert "mors-kochanski-super-shelter" in shelter_ids

    fires = get_bushcraft_projects(discipline="friction_fire")
    assert len(fires) == 1
    assert fires[0].project_id == "cedar-bow-drill-ember"

    cordage = get_bushcraft_projects(discipline="cordage_botany")
    assert len(cordage) == 1
    assert cordage[0].project_id == "basswood-bast-fiber-cordage"

    water = get_bushcraft_projects(discipline="water_foraging_craft")
    assert len(water) == 1
    assert water[0].project_id == "birch-bark-water-boiling-vessel"


def test_get_bushcraft_project_by_id_found():
    debris_hut = get_bushcraft_project_by_id("boreal-debris-hut-shelter")
    assert debris_hut is not None
    assert debris_hut.project_id == "boreal-debris-hut-shelter"
    assert "Boreal Forest Debris Hut" in debris_hut.title
    assert debris_hut.region == "Ely, MN"
    assert debris_hut.thermal_rating_r_value == 8.0
    assert debris_hut.estimated_hours == 4.5
    assert "shelter_craft" == debris_hut.discipline


def test_get_bushcraft_project_by_id_case_insensitive_and_whitespace():
    proj = get_bushcraft_project_by_id("   MORS-KOCHANSKI-SUPER-SHELTER  ")
    assert proj is not None
    assert proj.project_id == "mors-kochanski-super-shelter"
    assert "Mors Kochanski Polar Super Shelter" in proj.title
    assert proj.thermal_rating_r_value == 12.0
    assert proj.estimated_hours == 6.0


def test_get_bushcraft_project_by_id_not_found():
    proj = get_bushcraft_project_by_id("non-existent-bushcraft-project")
    assert proj is None


# =============================================================================
# 2. Mandatory Bushcraft Gear Checklist Tests
# =============================================================================


def test_get_bushcraft_gear_all_items():
    gear = get_bushcraft_gear()
    assert len(gear) == 6
    ids = [g.item_id for g in gear]
    assert "carbon-steel-bushcraft-knife" in ids
    assert "bushcraft-folding-saw" in ids
    assert "ferrocerium-spark-rod" in ids
    assert "single-wall-stainless-canteen-cup" in ids
    assert "tarred-marline-bankline" in ids
    assert "heavy-canvas-wool-blanket" in ids

    for item in gear:
        assert isinstance(item, BushcraftGearRequirement)
        assert item.item_id
        assert item.name
        assert item.category
        assert item.mandatory is True
        assert item.purpose


def test_get_bushcraft_gear_knife_and_ferro_rod_details():
    gear_map = {g.item_id: g for g in get_bushcraft_gear()}
    knife = gear_map["carbon-steel-bushcraft-knife"]
    assert "Scandi Grind" in knife.name
    assert "90-Degree Spine" in knife.name
    assert knife.category == "cutting_tools"

    ferro = gear_map["ferrocerium-spark-rod"]
    assert "Ferrocerium" in ferro.name
    assert ferro.category == "fire_craft"


# =============================================================================
# 3. Shelter Thermal Calculator Tests
# =============================================================================


def test_calculate_shelter_thermal_debris_hut_default():
    req = ShelterThermalRequest(
        project_id="boreal-debris-hut-shelter",
        ambient_temperature_f=30.0,
        wind_speed_mph=15.0,
        debris_thickness_inches=18.0,
        bedding_elevation_inches=6.0,
        fire_reflector_wall=False,
    )
    resp = calculate_shelter_thermal(req)
    assert isinstance(resp, ShelterThermalResponse)
    assert resp.project_id == "boreal-debris-hut-shelter"
    assert "Boreal Forest Debris Hut" in resp.project_title
    assert resp.discipline == "shelter_craft"
    assert resp.effective_r_value == pytest.approx(8.0, abs=0.5)
    assert resp.ground_conductive_loss_warning is False
    assert resp.safety_status in ("safe", "advisory")
    assert resp.estimated_interior_temp_f > req.ambient_temperature_f
    assert resp.thermal_advisory
    assert len(resp.fieldcraft_tips) >= 3


def test_calculate_shelter_thermal_debris_thickness_scaling():
    # Thicker debris (36 inches) should increase effective R-value and interior temperature
    req_thick = ShelterThermalRequest(
        project_id="boreal-debris-hut-shelter",
        ambient_temperature_f=20.0,
        debris_thickness_inches=36.0,
        bedding_elevation_inches=8.0,
    )
    resp_thick = calculate_shelter_thermal(req_thick)

    # Thin debris (6 inches) should decrease R-value
    req_thin = ShelterThermalRequest(
        project_id="boreal-debris-hut-shelter",
        ambient_temperature_f=20.0,
        debris_thickness_inches=6.0,
        bedding_elevation_inches=8.0,
    )
    resp_thin = calculate_shelter_thermal(req_thin)

    assert resp_thick.effective_r_value > resp_thin.effective_r_value
    assert resp_thick.estimated_interior_temp_f > resp_thin.estimated_interior_temp_f


def test_calculate_shelter_thermal_ground_chill_warning_triggered():
    # Inadequate bedding (< 6.0 inches) must trigger ground conductive loss warning
    req = ShelterThermalRequest(
        project_id="boreal-debris-hut-shelter",
        ambient_temperature_f=25.0,
        bedding_elevation_inches=2.0,
    )
    resp = calculate_shelter_thermal(req)
    assert resp.ground_conductive_loss_warning is True
    assert any("ground" in tip.lower() or "conductive" in tip.lower() for tip in resp.fieldcraft_tips)


def test_calculate_shelter_thermal_ground_chill_warning_clear():
    # Sufficient bedding (>= 6.0 inches) should clear warning
    req = ShelterThermalRequest(
        project_id="boreal-debris-hut-shelter",
        ambient_temperature_f=25.0,
        bedding_elevation_inches=8.0,
    )
    resp = calculate_shelter_thermal(req)
    assert resp.ground_conductive_loss_warning is False


def test_calculate_shelter_thermal_reflector_wall_boost():
    req_no_wall = ShelterThermalRequest(
        project_id="boreal-debris-hut-shelter",
        ambient_temperature_f=20.0,
        fire_reflector_wall=False,
    )
    resp_no_wall = calculate_shelter_thermal(req_no_wall)

    req_with_wall = ShelterThermalRequest(
        project_id="boreal-debris-hut-shelter",
        ambient_temperature_f=20.0,
        fire_reflector_wall=True,
    )
    resp_with_wall = calculate_shelter_thermal(req_with_wall)

    assert resp_with_wall.effective_r_value > resp_no_wall.effective_r_value
    assert resp_with_wall.estimated_interior_temp_f > resp_no_wall.estimated_interior_temp_f


def test_calculate_shelter_thermal_super_shelter():
    req = ShelterThermalRequest(
        project_id="mors-kochanski-super-shelter",
        ambient_temperature_f=10.0,
        wind_speed_mph=10.0,
        debris_thickness_inches=12.0,
        bedding_elevation_inches=8.0,
        fire_reflector_wall=True,
    )
    resp = calculate_shelter_thermal(req)
    assert resp.project_id == "mors-kochanski-super-shelter"
    assert resp.effective_r_value >= 12.0
    # Super shelter with reflector wall should maintain warm interior (> 50°F)
    assert resp.estimated_interior_temp_f >= 50.0
    assert resp.safety_status in ("safe", "advisory")


def test_calculate_shelter_thermal_safety_status_danger():
    # Subzero ambient without reflector wall and thin debris
    req = ShelterThermalRequest(
        project_id="boreal-debris-hut-shelter",
        ambient_temperature_f=-10.0,
        wind_speed_mph=30.0,
        debris_thickness_inches=6.0,
        bedding_elevation_inches=2.0,
        fire_reflector_wall=False,
    )
    resp = calculate_shelter_thermal(req)
    assert resp.safety_status == "danger"
    assert resp.ground_conductive_loss_warning is True
    assert "hypothermia" in resp.thermal_advisory.lower() or "danger" in resp.thermal_advisory.lower()


def test_calculate_shelter_thermal_invalid_project_raises():
    req = ShelterThermalRequest(project_id="non-existent-shelter")
    with pytest.raises(ValueError, match="Bushcraft project 'non-existent-shelter' not found"):
        calculate_shelter_thermal(req)


# =============================================================================
# 4. Intent Detection Tests & Disambiguation Guardrails
# =============================================================================


def test_detect_bushcraft_intent_projects_list():
    intent = detect_bushcraft_intent("What bushcraft and wilderness survival crafts can I learn?")
    assert intent is not None
    assert intent.action == "projects_list"


def test_detect_bushcraft_intent_projects_by_discipline():
    intent = detect_bushcraft_intent("Tell me about friction fire bushcraft methods")
    assert intent is not None
    assert intent.discipline == "friction_fire"


def test_detect_bushcraft_intent_debris_hut_detail():
    intent = detect_bushcraft_intent("How do I build a boreal debris hut shelter in the woods?")
    assert intent is not None
    assert intent.project_id == "boreal-debris-hut-shelter"
    assert intent.action in ("project_detail", "thermal_calc")


def test_detect_bushcraft_intent_bow_drill_detail():
    intent = detect_bushcraft_intent("How to make a bow drill friction fire ember with cedar?")
    assert intent is not None
    assert intent.project_id == "cedar-bow-drill-ember"
    assert intent.action == "project_detail"


def test_detect_bushcraft_intent_bast_cordage_detail():
    intent = detect_bushcraft_intent("Can you explain how to make bast cordage from basswood inner bark?")
    assert intent is not None
    assert intent.project_id == "basswood-bast-fiber-cordage"
    assert intent.action == "project_detail"


def test_detect_bushcraft_intent_super_shelter_detail():
    intent = detect_bushcraft_intent("Tell me how to construct a Mors Kochanski super shelter")
    assert intent is not None
    assert intent.project_id == "mors-kochanski-super-shelter"
    assert intent.action == "project_detail"


def test_detect_bushcraft_intent_birch_bark_boiling_detail():
    intent = detect_bushcraft_intent("How does birch bark boiling work for water purification?")
    assert intent is not None
    assert intent.project_id == "birch-bark-water-boiling-vessel"
    assert intent.action == "project_detail"


def test_detect_bushcraft_intent_thermal_calc():
    intent = detect_bushcraft_intent("Calculate shelter thermal R-value and ground conductive chill for a debris hut")
    assert intent is not None
    assert intent.action == "thermal_calc"


def test_detect_bushcraft_intent_gear_checklist():
    intent = detect_bushcraft_intent("What is the mandatory bushcraft gear checklist with ferro rod and scandi knife?")
    assert intent is not None
    assert intent.action == "gear_checklist"


def test_detect_bushcraft_intent_keywords_variety():
    # batoning
    i1 = detect_bushcraft_intent("Can I use split wood batoning with a carbon steel knife?")
    assert i1 is not None

    # scandi grind
    i2 = detect_bushcraft_intent("Why is a Scandi grind blade best for bushcraft?")
    assert i2 is not None

    # try stick
    i3 = detect_bushcraft_intent("How do I carve a bushcraft try stick?")
    assert i3 is not None

    # primitive fire
    i4 = detect_bushcraft_intent("Tips for primitive fire and hand drill ember generation")
    assert i4 is not None


def test_detect_bushcraft_intent_disambiguation_guardrails():
    # Wilderness trip planning
    assert detect_bushcraft_intent("Help me plan a 3-day backpacking trip itinerary") is None
    assert detect_bushcraft_intent("What is the packing list for Mount Rainier?") is None

    # Wilderness first aid triage
    assert detect_bushcraft_intent("How do I apply a tourniquet for arterial bleeding in first aid?") is None
    assert detect_bushcraft_intent("What are the medical symptoms of hypothermia triage?") is None

    # Campfire regulations & fire bans
    assert detect_bushcraft_intent("Is there an active fire ban or burn restriction in Okanogan?") is None
    assert detect_bushcraft_intent("Campfire safety regulations and extinguishing rules") is None

    # Edible plant foraging
    assert detect_bushcraft_intent("How do I identify edible chanterelle mushrooms while foraging?") is None
    assert detect_bushcraft_intent("What are the rules for foraging wild morels and huckleberries?") is None

    # Unrelated e-commerce / customer support
    assert detect_bushcraft_intent("I need a return label for my boots") is None
    assert detect_bushcraft_intent("Track my order #12345") is None


# =============================================================================
# 5. Prompt Builder & Response Formatter Tests
# =============================================================================


def test_build_bushcraft_prompt_project_detail():
    intent = BushcraftIntent(action="project_detail", project_id="boreal-debris-hut-shelter")
    prompt = build_bushcraft_prompt(intent)
    assert "Wilderness Bushcraft & Traditional Fieldcraft" in prompt
    assert "Boreal Forest Debris Hut" in prompt
    assert "Ely, MN" in prompt
    assert "8.0" in prompt
    assert "Ridge pole" in prompt or "rib" in prompt.lower()


def test_build_bushcraft_prompt_projects_list():
    intent = BushcraftIntent(action="projects_list", discipline="shelter_craft")
    prompt = build_bushcraft_prompt(intent)
    assert "shelter_craft" in prompt.lower() or "debris hut" in prompt.lower()


def test_build_bushcraft_prompt_gear_checklist():
    intent = BushcraftIntent(action="gear_checklist")
    prompt = build_bushcraft_prompt(intent)
    assert "carbon-steel-bushcraft-knife" in prompt or "Scandi Grind" in prompt
    assert "ferrocerium" in prompt.lower()


def test_format_bushcraft_response_project_detail():
    intent = BushcraftIntent(action="project_detail", project_id="cedar-bow-drill-ember")
    resp = format_bushcraft_response(intent)
    assert "answer" in resp
    assert "bushcraft_info" in resp
    assert resp["bushcraft_info"]["action"] == "project_detail"
    assert resp["bushcraft_info"]["project_id"] == "cedar-bow-drill-ember"
    assert "Cedar" in resp["answer"]


def test_format_bushcraft_response_thermal_calc():
    intent = BushcraftIntent(action="thermal_calc", project_id="boreal-debris-hut-shelter")
    resp = format_bushcraft_response(intent)
    assert "answer" in resp
    assert "bushcraft_info" in resp
    info = resp["bushcraft_info"]
    assert info["action"] == "thermal_calc"
    assert "effective_r_value" in info
    assert "estimated_interior_temp_f" in info
    assert "R-value" in resp["answer"] or "effective" in resp["answer"].lower()


def test_format_bushcraft_response_gear_checklist():
    intent = BushcraftIntent(action="gear_checklist")
    resp = format_bushcraft_response(intent)
    assert "answer" in resp
    assert "bushcraft_info" in resp
    info = resp["bushcraft_info"]
    assert info["action"] == "gear_checklist"
    assert len(info["gear"]) == 6
    assert "knife" in resp["answer"].lower() or "gear" in resp["answer"].lower()


def test_format_bushcraft_response_projects_list():
    intent = BushcraftIntent(action="projects_list")
    resp = format_bushcraft_response(intent)
    assert "answer" in resp
    assert "bushcraft_info" in resp
    info = resp["bushcraft_info"]
    assert info["action"] == "projects_list"
    assert len(info["projects"]) == 5


def test_calculate_shelter_thermal_non_shelter_project():
    req = ShelterThermalRequest(project_id="cedar-bow-drill-ember", debris_thickness_inches=10.0)
    resp = calculate_shelter_thermal(req)
    assert resp.project_id == "cedar-bow-drill-ember"
    assert resp.effective_r_value > 0.0


def test_detect_bushcraft_intent_additional_syntax():
    # mandatory bushcraft keyword
    i1 = detect_bushcraft_intent("what is the mandatory bushcraft kit?")
    assert i1 is not None
    assert i1.action == "gear_checklist"

    # plain project without how to
    i2 = detect_bushcraft_intent("boreal debris hut")
    assert i2 is not None
    assert i2.action == "project_detail"
    assert i2.project_id == "boreal-debris-hut-shelter"

    # bushcraft tools
    i3 = detect_bushcraft_intent("tell me about bushcraft tools")
    assert i3 is not None
    assert i3.action == "gear_checklist"


def test_build_bushcraft_prompt_thermal_calc():
    intent = BushcraftIntent(action="thermal_calc")
    prompt = build_bushcraft_prompt(intent)
    assert "Shelter Thermal Engineering" in prompt
    assert "Mors Kochanski" in prompt
