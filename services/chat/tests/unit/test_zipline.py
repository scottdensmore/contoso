import pytest
from contoso_chat.zipline import (
    FormattedZiplineResponse,
    ZiplineCourseModel,
    ZiplineIntent,
    ZiplineRequest,
    ZiplineResponse,
    calculate_zipline_dynamics,
    detect_zipline_intent,
    format_zipline_response,
    get_zipline_course,
    get_zipline_courses,
    get_zipline_gear_checklist,
    zipline_tool,
)


def test_zipline_course_model():
    course = ZiplineCourseModel(
        course_id="royal-gorge-canyon-extreme",
        title="Royal Gorge Canyon Extreme Highline Traverse",
        canyon_location="Royal Gorge Canyon, Cañon City",
        state_or_region="Colorado, USA",
        span_length_ft=2400,
        vertical_drop_ft=450,
        max_speed_mph=65,
        course_type="extreme_gravity",
        braking_system="ZipStop Heavy-Duty Magnetic Braking System with Dual Spring Buffer",
        description="Extreme gravity zipline soaring 1,000 feet above the Arkansas River.",
        highlights=["1,000-ft gorge canyon clearance", "ZipStop magnetic arrest terminal"],
    )
    assert course.course_id == "royal-gorge-canyon-extreme"
    assert course.span_length_ft == 2400
    assert len(course.highlights) == 2


def test_get_zipline_courses_all():
    courses = get_zipline_courses()
    assert len(courses) == 5
    course_ids = [c.course_id for c in courses]
    assert "royal-gorge-canyon-extreme" in course_ids
    assert "snake-river-canyon-highline" in course_ids
    assert "haleakala-canopy-rainforest" in course_ids
    assert "red-river-gorge-cliffside" in course_ids
    assert "new-river-gorge-span-express" in course_ids


def test_get_zipline_courses_filtering():
    extreme = get_zipline_courses(course_type="extreme_gravity")
    assert len(extreme) == 2
    for c in extreme:
        assert c.course_type == "extreme_gravity"

    canopy = get_zipline_courses(course_type="canopy_tour")
    assert len(canopy) >= 1
    for c in canopy:
        assert c.course_type == "canopy_tour"


def test_get_zipline_course_lookup():
    course = get_zipline_course("royal-gorge-canyon-extreme")
    assert course is not None
    assert course.title == "Royal Gorge Canyon Extreme Highline Traverse"
    assert course.course_id == "royal-gorge-canyon-extreme"

    invalid = get_zipline_course("nonexistent-canyon-zip")
    assert invalid is None


def test_calculate_zipline_dynamics_default():
    req = ZiplineRequest()
    res = calculate_zipline_dynamics(req)
    assert res.course_id == "royal-gorge-canyon-extreme"
    assert res.rider_payload_lbs == 175.0
    # Expected speed around 40.2 mph
    assert 39.0 <= res.calculated_speed_mph <= 42.0
    # Braking distance: int(round((speed**2)/25.0))
    expected_brake = int(round((res.calculated_speed_mph**2) / 25.0))
    assert res.braking_distance_ft == expected_brake
    # Cable tension: round((175 * 0.00444822 * 2400) / 80.0, 1) = 23.4 kN
    assert res.cable_tension_kn == 23.4
    assert res.safety_rating == "optimal_descent_dynamics"
    assert "ZipStop" in res.braking_advisory
    assert "kN" in res.engineering_advisory


def test_calculate_zipline_dynamics_bearing_multipliers():
    # Ceramic hybrid multiplier 1.05
    req_ceramic = ZiplineRequest(
        course_id="royal-gorge-canyon-extreme",
        trolley_bearing="ceramic_hybrid",
    )
    res_ceramic = calculate_zipline_dynamics(req_ceramic)

    # Tandem pulley multiplier 0.92
    req_tandem = ZiplineRequest(
        course_id="royal-gorge-canyon-extreme",
        trolley_bearing="tandem_pulley",
    )
    res_tandem = calculate_zipline_dynamics(req_tandem)

    assert res_ceramic.calculated_speed_mph > res_tandem.calculated_speed_mph


def test_calculate_zipline_dynamics_safety_ratings():
    # High speed >= 50.0 mph
    req_high = ZiplineRequest(
        course_id="royal-gorge-canyon-extreme",
        line_length_ft=3500,
        slope_grade_percent=20.0,
        rider_payload_lbs=220.0,
        trolley_bearing="ceramic_hybrid",
    )
    res_high = calculate_zipline_dynamics(req_high)
    assert res_high.calculated_speed_mph >= 50.0

    # Excessive velocity hazard > 65.0 mph or slope > 22.0%
    req_excessive = ZiplineRequest(
        course_id="royal-gorge-canyon-extreme",
        line_length_ft=4000,
        slope_grade_percent=25.0,
        rider_payload_lbs=250.0,
        trolley_bearing="ceramic_hybrid",
    )
    res_excessive = calculate_zipline_dynamics(req_excessive)
    assert res_excessive.safety_rating == "excessive_velocity_hazard_regrade"
    assert "CRITICAL" in res_excessive.braking_advisory


def test_calculate_zipline_dynamics_unknown_course():
    req = ZiplineRequest(course_id="nonexistent-course")
    with pytest.raises(ValueError, match="Zipline course 'nonexistent-course' not found"):
        calculate_zipline_dynamics(req)


def test_get_zipline_gear_checklist():
    gear = get_zipline_gear_checklist()
    assert len(gear) == 6
    item_ids = [g.item_id for g in gear]
    assert "high-speed-zipline-trolley" in item_ids
    assert "full-body-zipline-harness" in item_ids
    assert "climbing-helmet-cert" in item_ids
    assert "heavy-duty-leather-braking-gloves" in item_ids
    assert "dynamic-backup-lanyard" in item_ids
    assert "impact-arrest-zipstop-carriage" in item_ids

    for g in gear:
        assert g.mandatory is True
        assert len(g.purpose) > 0


def test_detect_zipline_intent_exclusions():
    # Queries with exclusion keywords should return None
    assert detect_zipline_intent("I need a refund for my zipline ticket order #12345") is None
    assert detect_zipline_intent("Do you have pack goat rentals for canyon crossing?") is None
    assert detect_zipline_intent("Where can I find pack llama gear near Royal Gorge?") is None
    assert detect_zipline_intent("Tell me about falconry and raptor handling on ziplines") is None
    assert detect_zipline_intent("What is the return label for the zipline harness?") is None
    assert detect_zipline_intent("Looking for telemark skiing and zipline tours") is None


def test_detect_zipline_intent_queries():
    # Courses list
    intent_list = detect_zipline_intent("What zipline canopy tours do you offer across canyons?")
    assert intent_list is not None
    assert intent_list.action == "courses_list"

    # Course detail
    intent_detail = detect_zipline_intent("Tell me details about the Royal Gorge extreme zipline course")
    assert intent_detail is not None
    assert intent_detail.action == "course_detail"
    assert intent_detail.course_id == "royal-gorge-canyon-extreme"

    # Calculate
    intent_calc = detect_zipline_intent(
        "Calculate zipline speed and braking distance for 180 lbs rider on Royal Gorge"
    )
    assert intent_calc is not None
    assert intent_calc.action in ("calculate", "calculate_dynamics")
    assert intent_calc.course_id == "royal-gorge-canyon-extreme"

    # Gear
    intent_gear = detect_zipline_intent(
        "What safety gear checklist and harness is required for zipline canopy touring?"
    )
    assert intent_gear is not None
    assert intent_gear.action in ("gear", "gear_checklist")

    # Snake River
    intent_snake = detect_zipline_intent("What is the span length of Snake River canyon highline?")
    assert intent_snake is not None
    assert intent_snake.course_id == "snake-river-canyon-highline"

    # Non-zipline query
    assert detect_zipline_intent("How do I pitch a 4-person tent in high winds?") is None


def test_format_zipline_response_courses_list():
    intent = ZiplineIntent(action="courses_list")
    resp = format_zipline_response(intent)
    assert isinstance(resp, FormattedZiplineResponse)
    assert "zipline_info" in resp
    info = resp.get("zipline_info")
    assert info["action"] == "courses_list"
    assert len(info["courses"]) == 5
    assert "Contoso" in str(resp)


def test_format_zipline_response_course_detail():
    intent = ZiplineIntent(action="course_detail", course_id="royal-gorge-canyon-extreme")
    resp = format_zipline_response(intent)
    assert isinstance(resp, FormattedZiplineResponse)
    info = resp.get("zipline_info")
    assert info["action"] == "course_detail"
    assert info["course_id"] == "royal-gorge-canyon-extreme"
    assert "Royal Gorge" in str(resp)


def test_format_zipline_response_calculate():
    intent = ZiplineIntent(action="calculate", course_id="royal-gorge-canyon-extreme")
    resp = format_zipline_response(intent)
    assert isinstance(resp, FormattedZiplineResponse)
    info = resp.get("zipline_info")
    assert info["action"] == "calculate"
    assert "calculation" in info
    assert info["calculation"]["course_id"] == "royal-gorge-canyon-extreme"
    assert "Braking" in str(resp) or "Speed" in str(resp) or "Dynamics" in str(resp)


def test_format_zipline_response_gear():
    intent = ZiplineIntent(action="gear")
    resp = format_zipline_response(intent)
    assert isinstance(resp, FormattedZiplineResponse)
    info = resp.get("zipline_info")
    assert info["action"] == "gear"
    assert len(info["gear"]) == 6
    assert "Checklist" in str(resp) or "Gear" in str(resp)


def test_format_zipline_response_from_model():
    req = ZiplineRequest()
    calc = calculate_zipline_dynamics(req)
    resp = format_zipline_response(calc)
    assert isinstance(resp, FormattedZiplineResponse)
    info = resp.get("zipline_info")
    assert info["action"] == "calculate"
    assert info["calculation"]["course_id"] == "royal-gorge-canyon-extreme"


def test_zipline_tool():
    # Direct calculate request
    req = ZiplineRequest(course_id="royal-gorge-canyon-extreme")
    res = zipline_tool(request=req)
    assert isinstance(res, ZiplineResponse)

    # Gear action
    res_gear = zipline_tool(action="gear")
    assert isinstance(res_gear, list)
    assert len(res_gear) == 6

    # Course detail
    res_detail = zipline_tool(action="course_detail", course_id="royal-gorge-canyon-extreme")
    assert isinstance(res_detail, ZiplineCourseModel)

    # Courses list
    res_list = zipline_tool(action="courses_list")
    assert isinstance(res_list, list)
    assert len(res_list) == 5


def test_formatted_zipline_response_methods():
    resp = FormattedZiplineResponse("sample text", {"zipline_info": {"foo": "bar"}, "answer": "sample text"})
    assert resp["zipline_info"] == {"foo": "bar"}
    assert "zipline_info" in resp
    assert "nonexistent" not in resp
    assert "zipline_info" in list(resp.keys())
    assert {"foo": "bar"} in list(resp.values())
    assert ("zipline_info", {"foo": "bar"}) in list(resp.items())


def test_calculate_zipline_dynamics_all_speed_categories():
    # Clamped low speed / scenic speed
    req_low = ZiplineRequest(
        line_length_ft=500,
        slope_grade_percent=2.0,
        rider_payload_lbs=100.0,
        trolley_bearing="tandem_pulley",
    )
    res_low = calculate_zipline_dynamics(req_low)
    assert res_low.calculated_speed_mph == 20.0
    assert res_low.speed_category == "scenic_speed"

    # Extreme speed
    req_ext = ZiplineRequest(
        line_length_ft=4500,
        slope_grade_percent=21.0,
        rider_payload_lbs=240.0,
        trolley_bearing="ceramic_hybrid",
    )
    res_ext = calculate_zipline_dynamics(req_ext)
    assert res_ext.calculated_speed_mph >= 65.0
    assert res_ext.speed_category == "extreme_speed"


def test_detect_zipline_intent_all_courses():
    intent_maui = detect_zipline_intent("How fast can I go on the Haleakala Maui canopy zipline tour?")
    assert intent_maui is not None
    assert intent_maui.course_id == "haleakala-canopy-rainforest"

    intent_red = detect_zipline_intent("What is the slope of Red River Gorge cliffside zipline?")
    assert intent_red is not None
    assert intent_red.course_id == "red-river-gorge-cliffside"

    intent_new = detect_zipline_intent("Tell me about the New River Gorge span express highline")
    assert intent_new is not None
    assert intent_new.course_id == "new-river-gorge-span-express"


def test_format_zipline_response_dict_and_string_input():
    # Dict with existing formatting
    d_input = {"zipline_info": {"action": "custom"}, "answer": "Pre-formatted answer"}
    resp_d = format_zipline_response(d_input)
    assert str(resp_d) == "Pre-formatted answer"

    # Dict without existing formatting
    resp_dict_action = format_zipline_response({"action": "gear"})
    assert resp_dict_action.get("zipline_info")["action"] == "gear"

    # String input
    resp_str = format_zipline_response("What zipline gear is mandatory?")
    assert resp_str.get("zipline_info")["action"] == "gear"


def test_build_zipline_prompt():
    from contoso_chat.zipline import build_zipline_prompt
    prompt_generic = build_zipline_prompt()
    assert "ZipStop" in prompt_generic

    prompt_focused = build_zipline_prompt(
        ZiplineIntent(action="course_detail", course_id="royal-gorge-canyon-extreme")
    )
    assert "Royal Gorge" in prompt_focused


def test_zipline_tool_kwargs_and_filters():
    # Tool call with kwargs for calculate
    res_kw = zipline_tool(
        action="calculate",
        rider_payload_lbs=180.0,
        line_length_ft=2500,
        slope_grade_percent=14.0,
        trolley_bearing="ceramic_hybrid",
    )
    assert isinstance(res_kw, ZiplineResponse)

    # Tool call with course_type filter
    res_canopy = zipline_tool(action="courses_list", course_type="canopy_tour")
    assert isinstance(res_canopy, list)
    for c in res_canopy:
        assert c.course_type == "canopy_tour"
