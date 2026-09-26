import math

import pytest
from contoso_chat.pack_burro import (
    BurroGearItemModel,
    FormattedPackBurroResponse,
    PackBurroCourseModel,
    PackBurroRequest,
    PackBurroResponse,
    build_pack_burro_prompt,
    calculate_pack_burro,
    detect_pack_burro_intent,
    format_pack_burro_response,
    get_burro_gear,
    get_pack_burro_course,
    get_pack_burro_courses,
)


def test_pack_burro_course_model():
    course = PackBurroCourseModel(
        course_id="leadville-boom-days-mosquito-pass",
        title="Leadville Boom Days World Championship (Mosquito Pass)",
        location="Lake County, Leadville, CO, USA",
        summit_elevation_m=4019,
        distance_km=33.8,
        default_burro_type="standard_burro",
        max_grade_percent=24,
        description="Iconic high-altitude Rocky Mountain pack-burro race.",
        highlights=[
            "Ascent to 13,185 ft Mosquito Pass summit",
            "Loose granite talus and scree switchbacks",
            "Historic 1880s mining claim trail",
        ],
    )
    assert course.course_id == "leadville-boom-days-mosquito-pass"
    assert course.summit_elevation_m == 4019
    assert course.max_grade_percent == 24
    assert len(course.highlights) == 3


def test_get_pack_burro_courses_catalog():
    courses = get_pack_burro_courses()
    assert len(courses) == 5
    course_ids = [c.course_id for c in courses]
    assert "leadville-boom-days-mosquito-pass" in course_ids
    assert "fairplay-burro-days-pass" in course_ids
    assert "buena-vista-gold-rush-days" in course_ids
    assert "georgetown-canyon-burro-run" in course_ids
    assert "idaho-springs-tombstone-dash" in course_ids


def test_get_pack_burro_courses_burro_type_filter():
    standard_courses = get_pack_burro_courses(burro_type="standard_burro")
    assert len(standard_courses) == 4
    assert all(c.default_burro_type == "standard_burro" for c in standard_courses)

    mammoth_courses = get_pack_burro_courses(burro_type="mammoth_donkey")
    assert len(mammoth_courses) == 1
    assert mammoth_courses[0].course_id == "georgetown-canyon-burro-run"
    assert mammoth_courses[0].default_burro_type == "mammoth_donkey"


def test_get_pack_burro_course_by_id():
    course = get_pack_burro_course("leadville-boom-days-mosquito-pass")
    assert course is not None
    assert course.title == "Leadville Boom Days World Championship (Mosquito Pass)"
    assert course.summit_elevation_m == 4019

    assert get_pack_burro_course("nonexistent-course") is None


def test_get_burro_gear():
    gear = get_burro_gear()
    assert len(gear) == 6
    assert all(isinstance(item, BurroGearItemModel) for item in gear)
    assert all(item.mandatory is True for item in gear)

    item_ids = [item.item_id for item in gear]
    expected_ids = [
        "regulation-pack-saddle",
        "prospector-mining-kit",
        "cotton-lead-rope",
        "equine-cooling-electrolyte",
        "hoof-pick-and-rasp",
        "high-visibility-runner-vest",
    ]
    for exp_id in expected_ids:
        assert exp_id in item_ids


def test_calculate_pack_burro_optimal():
    req = PackBurroRequest(
        course_id="leadville-boom-days-mosquito-pass",
        burro_type="standard_burro",
        pack_weight_lbs=35.0,
        slope_gradient_percent=18.0,
        runner_pace_min_per_mile=10.0,
    )
    res = calculate_pack_burro(req)
    assert isinstance(res, PackBurroResponse)
    assert res.course_id == "leadville-boom-days-mosquito-pass"
    assert "Mosquito Pass" in res.course_title
    assert res.weight_status == "regulation_compliant"
    # braking_force_lbs = round(35.0 * (18.0 / 100.0) * 2.5) = round(15.75) = 16
    assert res.braking_force_lbs == 16
    # oxygen_level_percent = round(100.0 * exp(-4019 / 8400.0)) = 62
    expected_oxygen = round(100.0 * math.exp(-4019 / 8400.0))
    assert res.oxygen_level_percent == expected_oxygen
    assert res.team_status == "optimal_race_cadence"
    assert "Optimal" in res.advisory or "compliant" in res.advisory.lower()


def test_calculate_pack_burro_underweight_disqualification():
    req = PackBurroRequest(
        course_id="fairplay-burro-days-pass",
        burro_type="standard_burro",
        pack_weight_lbs=30.0,  # Below 33 lb regulation minimum
        slope_gradient_percent=15.0,
    )
    res = calculate_pack_burro(req)
    assert res.weight_status == "underweight_disqualification"
    assert res.team_status == "disqualified_underweight_pack"
    assert "disqualification" in res.advisory.lower() or "underweight" in res.advisory.lower()


def test_calculate_pack_burro_caution_steep_scree():
    req = PackBurroRequest(
        course_id="leadville-boom-days-mosquito-pass",
        burro_type="standard_burro",
        pack_weight_lbs=36.0,
        slope_gradient_percent=24.0,  # > 20.0%
    )
    res = calculate_pack_burro(req)
    assert res.weight_status == "regulation_compliant"
    # braking_force_lbs = round(36.0 * (24.0 / 100.0) * 2.5) = round(21.6) = 22
    assert res.braking_force_lbs == 22
    assert res.team_status == "caution_steep_scree_braking"
    assert "caution" in res.advisory.lower() or "scree" in res.advisory.lower()


def test_calculate_pack_burro_invalid_course():
    req = PackBurroRequest(course_id="unknown-pass-race")
    with pytest.raises(ValueError, match="Pack burro course 'unknown-pass-race' not found"):
        calculate_pack_burro(req)


def test_detect_pack_burro_intent_courses():
    intent = detect_pack_burro_intent("Show me Colorado pack-burro racing courses and dates")
    assert intent is not None
    assert intent.action == "courses_list"

    intent_mammoth = detect_pack_burro_intent("Which burro races allow mammoth donkey packing?")
    assert intent_mammoth is not None
    assert intent_mammoth.burro_type == "mammoth_donkey"


def test_detect_pack_burro_intent_detail():
    intent = detect_pack_burro_intent("Tell me about the Leadville Boom Days Mosquito Pass burro race")
    assert intent is not None
    assert intent.action == "course_detail"
    assert intent.course_id == "leadville-boom-days-mosquito-pass"

    intent2 = detect_pack_burro_intent("What is the elevation of the Fairplay Burro Days race?")
    assert intent2 is not None
    assert intent2.course_id == "fairplay-burro-days-pass"


def test_detect_pack_burro_intent_calculate():
    intent = detect_pack_burro_intent("Calculate scree braking force and 33 lb pack saddle weight compliance for pack burro racing")
    assert intent is not None
    assert intent.action == "calculate_packing"


def test_detect_pack_burro_intent_gear():
    intent = detect_pack_burro_intent("What is the mandatory gear checklist and veterinary kit for Colorado burro racing?")
    assert intent is not None
    assert intent.action == "gear_checklist"


def test_detect_pack_burro_intent_disambiguation():
    # General trail running must NOT trigger pack burro
    assert detect_pack_burro_intent("What are the best trail running shoes for ultra running?") is None
    assert detect_pack_burro_intent("What is the recommended pace for a 50k mountain trail run?") is None
    assert detect_pack_burro_intent("Fastpacking hydration vest recommendations") is None

    # Equestrian horse/mule packing must NOT trigger pack burro
    assert detect_pack_burro_intent("Horse packing expedition in the Bob Marshall Wilderness with decker saddle") is None
    assert detect_pack_burro_intent("How do I balance panniers for my pack horse?") is None
    assert detect_pack_burro_intent("Mule string lead line tensioning and highline picket") is None

    # Dogsledding must NOT trigger pack burro
    assert detect_pack_burro_intent("What sled dog harness is used for mushing huskies?") is None
    assert detect_pack_burro_intent("Iditarod winter dog sledding race gear") is None


def test_format_pack_burro_response():
    raw_data = {
        "action": "calculate_packing",
        "course_id": "leadville-boom-days-mosquito-pass",
        "pack_weight_lbs": 35.0,
    }
    resp = format_pack_burro_response({"pack_burro_info": raw_data, "answer": "Test burro answer"})
    assert isinstance(resp, FormattedPackBurroResponse)
    assert isinstance(resp, str)
    assert "Test burro answer" in str(resp)
    assert resp["pack_burro_info"]["course_id"] == "leadville-boom-days-mosquito-pass"
    assert resp.get("nonexistent", "default") == "default"
    assert "pack_burro_info" in resp


def test_build_pack_burro_prompt():
    prompt = build_pack_burro_prompt()
    assert "33" in prompt
    assert "Mosquito Pass" in prompt or "burro" in prompt.lower()
