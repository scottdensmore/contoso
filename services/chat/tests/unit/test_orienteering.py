import pytest
from contoso_chat.orienteering import (
    NavigationLegRequest,
    NavigationLegResponse,
    OrienteeringCourseModel,
    OrienteeringGearRequirement,
    OrienteeringIntent,
    build_orienteering_prompt,
    calculate_navigation_leg,
    extract_orienteering_intent,
    format_orienteering_response,
    get_orienteering_course_by_id,
    get_orienteering_courses,
    get_orienteering_gear,
)


def test_orienteering_course_model():
    course = OrienteeringCourseModel(
        course_id="test-course",
        title="Test Wilderness Course",
        region="Adirondacks, NY",
        difficulty="intermediate",
        terrain_type="open_forest",
        distance_km=7.5,
        checkpoint_controls=15,
        magnetic_declination_deg=-13.0,
        base_pace_count_per_100m=65,
        off_trail_percentage=50,
        description="A challenging off-trail navigation course.",
        highlights=["Boulder clusters", "Ridge spines"],
    )
    assert course.course_id == "test-course"
    assert course.title == "Test Wilderness Course"
    assert course.checkpoint_controls == 15
    assert course.magnetic_declination_deg == -13.0
    assert len(course.highlights) == 2


def test_navigation_leg_models_defaults():
    req = NavigationLegRequest(course_id="harriman-silvermine-classic")
    assert req.course_id == "harriman-silvermine-classic"
    assert req.leg_distance_meters == 350.0
    assert req.map_bearing_degrees == 45.0
    assert req.terrain_type == "open_forest"
    assert req.visibility == "clear"

    resp = NavigationLegResponse(
        course_id="harriman-silvermine-classic",
        course_title="Harriman Silvermine Classic Orienteering Course",
        magnetic_bearing_degrees=57.5,
        back_bearing_degrees=225.0,
        aim_off_bearing_degrees=49.0,
        effective_pace_count_per_100m=70,
        total_double_paces=245,
        estimated_time_minutes=7,
        technique_recommendation="Thumbing the map",
        safety_advisory="Nominal off-trail conditions",
    )
    assert resp.magnetic_bearing_degrees == 57.5
    assert resp.back_bearing_degrees == 225.0
    assert resp.aim_off_bearing_degrees == 49.0


def test_gear_requirement_model():
    gear = OrienteeringGearRequirement(
        item_id="mirrored-sighting-compass",
        name="Adjustable Declination Mirrored Sighting Compass",
        category="compass",
        mandatory=True,
        purpose="Precision sighting and declination adjustment.",
    )
    assert gear.item_id == "mirrored-sighting-compass"
    assert gear.mandatory is True


def test_get_orienteering_courses_all():
    courses = get_orienteering_courses()
    assert len(courses) == 5
    ids = [c.course_id for c in courses]
    assert "harriman-silvermine-classic" in ids
    assert "devils-lake-bluff-rogaine" in ids
    assert "rainier-paradise-glacier-traverse" in ids
    assert "blue-ridge-linville-gorge-challenge" in ids
    assert "boulder-chautauqua-sprint-course" in ids


def test_get_orienteering_courses_difficulty_filter():
    beginner = get_orienteering_courses(difficulty="beginner")
    assert len(beginner) == 1
    assert beginner[0].course_id == "boulder-chautauqua-sprint-course"

    intermediate = get_orienteering_courses(difficulty="intermediate")
    assert len(intermediate) == 1
    assert intermediate[0].course_id == "harriman-silvermine-classic"

    advanced = get_orienteering_courses(difficulty="advanced")
    assert len(advanced) == 1
    assert advanced[0].course_id == "devils-lake-bluff-rogaine"

    expert = get_orienteering_courses(difficulty="expert")
    assert len(expert) == 2
    expert_ids = [c.course_id for c in expert]
    assert "rainier-paradise-glacier-traverse" in expert_ids
    assert "blue-ridge-linville-gorge-challenge" in expert_ids


def test_get_orienteering_course_by_id_found():
    course = get_orienteering_course_by_id("rainier-paradise-glacier-traverse")
    assert course is not None
    assert course.course_id == "rainier-paradise-glacier-traverse"
    assert course.magnetic_declination_deg == 14.8
    assert course.base_pace_count_per_100m == 66
    assert course.checkpoint_controls == 8


def test_get_orienteering_course_by_id_not_found():
    assert get_orienteering_course_by_id("non-existent-course") is None


def test_get_orienteering_gear():
    gear = get_orienteering_gear()
    assert len(gear) == 6
    assert all(g.mandatory is True for g in gear)
    gear_ids = [g.item_id for g in gear]
    assert "mirrored-sighting-compass" in gear_ids
    assert "waterproof-topo-map" in gear_ids
    assert "utm-mgrs-grid-reader" in gear_ids
    assert "ranger-pace-tally-beads" in gear_ids
    assert "barometric-altimeter-watch" in gear_ids
    assert "high-visibility-marking-ribbon" in gear_ids


def test_calculate_navigation_leg_declination_arithmetic():
    # Harriman Silvermine declination is -12.5 (West declination)
    # Magnetic = map_bearing - declination = 45 - (-12.5) = 57.5
    req = NavigationLegRequest(
        course_id="harriman-silvermine-classic",
        leg_distance_meters=300.0,
        map_bearing_degrees=45.0,
        terrain_type="open_forest",
        visibility="clear",
    )
    res = calculate_navigation_leg(req)
    assert res.course_id == "harriman-silvermine-classic"
    assert res.magnetic_bearing_degrees == 57.5
    assert res.back_bearing_degrees == 225.0
    assert res.aim_off_bearing_degrees == 49.0

    # Rainier declination is +14.8 (East declination)
    # Magnetic = map_bearing - declination = 10.0 - 14.8 = -4.8 -> 355.2
    req_rainier = NavigationLegRequest(
        course_id="rainier-paradise-glacier-traverse",
        leg_distance_meters=500.0,
        map_bearing_degrees=10.0,
        terrain_type="snowfield",
        visibility="night_whiteout",
    )
    res_rainier = calculate_navigation_leg(req_rainier)
    assert res_rainier.magnetic_bearing_degrees == 355.2
    assert res_rainier.back_bearing_degrees == 190.0
    assert res_rainier.aim_off_bearing_degrees == 14.0


def test_calculate_navigation_leg_back_bearing_wrap():
    # Bearing >= 180 subtracts 180
    req = NavigationLegRequest(
        course_id="boulder-chautauqua-sprint-course",
        leg_distance_meters=200.0,
        map_bearing_degrees=270.0,
        terrain_type="flat_trail",
    )
    res = calculate_navigation_leg(req)
    assert res.back_bearing_degrees == 90.0


def test_calculate_navigation_leg_terrain_multipliers_and_pacing():
    # Harriman base pace count is 64 per 100m
    # open_forest multiplier = 1.10 -> round(64 * 1.10) = round(70.4) = 70
    # leg distance 350m -> round((350 / 100) * 70) = round(3.5 * 70) = 245
    req = NavigationLegRequest(
        course_id="harriman-silvermine-classic",
        leg_distance_meters=350.0,
        terrain_type="open_forest",
    )
    res = calculate_navigation_leg(req)
    assert res.effective_pace_count_per_100m == 70
    assert res.total_double_paces == 245

    # dense_brush multiplier = 1.50 -> round(64 * 1.50) = 96
    # leg distance 200m -> round(2.0 * 96) = 192
    req_brush = NavigationLegRequest(
        course_id="harriman-silvermine-classic",
        leg_distance_meters=200.0,
        terrain_type="dense_brush",
    )
    res_brush = calculate_navigation_leg(req_brush)
    assert res_brush.effective_pace_count_per_100m == 96
    assert res_brush.total_double_paces == 192


def test_calculate_navigation_leg_speed_and_visibility():
    # flat_trail base speed = 4.0 km/h, clear = 1.0 -> 4.0 km/h
    # 1000m (1.0 km) -> (1.0 / 4.0) * 60 = 15 minutes
    req = NavigationLegRequest(
        course_id="boulder-chautauqua-sprint-course",
        leg_distance_meters=1000.0,
        terrain_type="flat_trail",
        visibility="clear",
    )
    res = calculate_navigation_leg(req)
    assert res.estimated_time_minutes == 15

    # snowfield base speed = 1.5 km/h, night_whiteout = 0.6 -> 0.9 km/h
    # 450m (0.45 km) -> (0.45 / 0.9) * 60 = 30 minutes
    req_snow = NavigationLegRequest(
        course_id="rainier-paradise-glacier-traverse",
        leg_distance_meters=450.0,
        terrain_type="snowfield",
        visibility="night_whiteout",
    )
    res_snow = calculate_navigation_leg(req_snow)
    assert res_snow.estimated_time_minutes == 30
    assert "Leap-frog pacing" in res_snow.technique_recommendation
    assert "Extreme disorientation hazard" in res_snow.safety_advisory


def test_calculate_navigation_leg_invalid_course():
    req = NavigationLegRequest(course_id="unknown-course-id")
    with pytest.raises(ValueError, match="not found"):
        calculate_navigation_leg(req)


def test_extract_orienteering_intent_keywords():
    intent = extract_orienteering_intent("Tell me about wilderness orienteering courses")
    assert intent is not None
    assert intent.action == "courses_list"

    intent_comp = extract_orienteering_intent("How do I take a compass bearing and adjust magnetic declination?")
    assert intent_comp is not None
    assert intent_comp.action in ("calculate_leg", "courses_list")

    intent_gear = extract_orienteering_intent("What is the mandatory orienteering gear checklist?")
    assert intent_gear is not None
    assert intent_gear.action == "gear_checklist"


def test_extract_orienteering_intent_courses():
    intent = extract_orienteering_intent("Tell me about the Harriman Silvermine classic course")
    assert intent is not None
    assert intent.course_id == "harriman-silvermine-classic"
    assert intent.action == "course_detail"

    intent_linville = extract_orienteering_intent("How do I navigate Linville Gorge with dead reckoning and aiming off?")
    assert intent_linville is not None
    assert intent_linville.course_id == "blue-ridge-linville-gorge-challenge"
    assert intent_linville.action in ("calculate_leg", "course_detail")

    intent_chaut = extract_orienteering_intent("Details on Chautauqua orienteering sprint in Boulder")
    assert intent_chaut is not None
    assert intent_chaut.course_id == "boulder-chautauqua-sprint-course"
    assert intent_chaut.action == "course_detail"


def test_extract_orienteering_intent_exclusions():
    # Must not hijack GPS navigation
    assert extract_orienteering_intent("How do I import a GPX track into my GPS unit?") is None
    # Must not hijack marked hiking trails
    assert extract_orienteering_intent("Tell me about the best marked family hiking trails") is None
    # Must not hijack general trip planner
    assert extract_orienteering_intent("Can you help me plan a 3-day backpacking trip itinerary?") is None
    # Must not hijack caving survey
    assert extract_orienteering_intent("What rope rigging is required for Fantastic Pit caving?") is None
    # Customer support exclusions
    assert extract_orienteering_intent("Where is my order #12345 tracking?") is None


def test_format_orienteering_response_course_detail():
    intent = OrienteeringIntent(action="course_detail", course_id="harriman-silvermine-classic")
    resp = format_orienteering_response(intent)
    assert isinstance(resp, str)
    assert "Harriman Silvermine Classic" in str(resp)
    # Also verify dictionary-like access if supported
    assert resp.get("orienteering_info") is not None
    assert resp["orienteering_info"]["action"] == "course_detail"
    assert resp["orienteering_info"]["course_id"] == "harriman-silvermine-classic"


def test_format_orienteering_response_calculate_leg():
    intent = OrienteeringIntent(
        action="calculate_leg",
        course_id="harriman-silvermine-classic",
        terrain_type="open_forest",
    )
    resp = format_orienteering_response(intent)
    assert isinstance(resp, str)
    assert "bearing" in str(resp).lower() or "pace" in str(resp).lower() or "magnetic" in str(resp).lower()
    info = resp.get("orienteering_info")
    assert info is not None
    assert info["action"] == "calculate_leg"
    assert "magnetic_bearing_degrees" in info


def test_format_orienteering_response_gear_checklist():
    intent = OrienteeringIntent(action="gear_checklist")
    resp = format_orienteering_response(intent)
    assert isinstance(resp, str)
    assert "compass" in str(resp).lower() or "gear" in str(resp).lower()
    info = resp.get("orienteering_info")
    assert info is not None
    assert info["action"] == "gear_checklist"
    assert len(info["gear"]) == 6


def test_format_orienteering_response_courses_list():
    intent = OrienteeringIntent(action="courses_list")
    resp = format_orienteering_response(intent)
    assert isinstance(resp, str)
    assert "Harriman" in str(resp) or "Orienteering" in str(resp)
    info = resp.get("orienteering_info")
    assert info is not None
    assert info["action"] == "courses_list"
    assert len(info["courses"]) == 5


def test_build_orienteering_prompt():
    intent = OrienteeringIntent(action="course_detail", course_id="boulder-chautauqua-sprint-course")
    prompt = build_orienteering_prompt(intent)
    assert "Orienteering" in prompt
    assert "Chautauqua" in prompt
    assert "Declination" in prompt or "Magnetic" in prompt or "bearing" in prompt.lower()


def test_calculate_navigation_leg_all_terrain_and_visibility():
    # Test rocky_talus terrain and fog_overcast visibility
    req_talus = NavigationLegRequest(
        course_id="devils-lake-bluff-rogaine",
        leg_distance_meters=400.0,
        map_bearing_degrees=120.0,
        terrain_type="rocky_talus",
        visibility="fog_overcast",
    )
    res_talus = calculate_navigation_leg(req_talus)
    assert res_talus.course_id == "devils-lake-bluff-rogaine"
    assert "Handrail & Attack Point" in res_talus.technique_recommendation
    assert "Reduced optical range" in res_talus.safety_advisory

    # Test open_forest with clear visibility
    req_forest = NavigationLegRequest(
        course_id="harriman-silvermine-classic",
        leg_distance_meters=250.0,
        map_bearing_degrees=45.0,
        terrain_type="open_forest",
        visibility="clear",
    )
    res_forest = calculate_navigation_leg(req_forest)
    assert "Thumbing the map" in res_forest.technique_recommendation
    assert "Nominal off-trail conditions" in res_forest.safety_advisory

    # Test flat_trail default technique
    req_flat = NavigationLegRequest(
        course_id="boulder-chautauqua-sprint-course",
        leg_distance_meters=200.0,
        terrain_type="flat_trail",
        visibility="clear",
    )
    res_flat = calculate_navigation_leg(req_flat)
    assert "Direct azimuth navigation" in res_flat.technique_recommendation


def test_extract_orienteering_intent_all_variations():
    # Devils Lake + advanced + talus
    intent1 = extract_orienteering_intent("Advanced orienteering on Devil's lake rocky talus")
    assert intent1 is not None
    assert intent1.course_id == "devils-lake-bluff-rogaine"
    assert intent1.difficulty == "advanced"
    assert intent1.terrain_type == "rocky_talus"

    # Rainier + expert + snow
    intent2 = extract_orienteering_intent("Expert navigation on Rainier glacier snowfield")
    assert intent2 is not None
    assert intent2.course_id == "rainier-paradise-glacier-traverse"
    assert intent2.difficulty == "expert"
    assert intent2.terrain_type == "snowfield"

    # Intermediate + trail + forest
    intent3 = extract_orienteering_intent("Intermediate orienteering through forest woods")
    assert intent3 is not None
    assert intent3.difficulty == "intermediate"
    assert intent3.terrain_type == "open_forest"

    # Brush terrain
    intent4 = extract_orienteering_intent("Orienteering through dense brush and rhododendron")
    assert intent4 is not None
    assert intent4.terrain_type == "dense_brush"

    # Flat trail
    intent5 = extract_orienteering_intent("Beginner orienteering flat trail sprint")
    assert intent5 is not None
    assert intent5.difficulty == "beginner"
    assert intent5.terrain_type == "flat_trail"


def test_build_orienteering_prompt_all_actions():
    prompt_gear = build_orienteering_prompt(OrienteeringIntent(action="gear_checklist"))
    assert "Mandatory Orienteering Navigation Kit Checklist" in prompt_gear

    prompt_leg = build_orienteering_prompt(OrienteeringIntent(action="calculate_leg"))
    assert "Land Navigation & Bearing Arithmetic" in prompt_leg

    prompt_list = build_orienteering_prompt(OrienteeringIntent(action="courses_list", difficulty="expert"))
    assert "Available Orienteering Courses" in prompt_list
    assert "expert" in prompt_list


def test_formatted_orienteering_response_methods():
    resp = format_orienteering_response(OrienteeringIntent(action="courses_list"))
    assert "answer" in resp
    assert "orienteering_info" in resp
    assert "nonexistent_key" not in resp
    assert resp.get("nonexistent_key") is None
    assert list(resp.keys()) == ["answer", "orienteering_info"]
    assert len(list(resp.values())) == 2
    assert len(list(resp.items())) == 2
    assert resp["answer"]
    # Test indexing string characters
    assert resp[0] == str(resp)[0]
