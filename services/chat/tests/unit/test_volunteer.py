import pytest
from contoso_chat.volunteer import (
    StewardshipImpactModel,
    VolunteerIntent,
    VolunteerRegistrationRequest,
    VolunteerRegistrationResponse,
    VolunteerWorkpartyModel,
    build_volunteer_prompt,
    detect_volunteer_intent,
    format_volunteer_response,
    get_stewardship_impact,
    get_volunteer_project_by_id,
    get_volunteer_projects,
    register_volunteer,
    reset_volunteer_state,
)


@pytest.fixture(autouse=True)
def clean_volunteer_state():
    reset_volunteer_state()
    yield
    reset_volunteer_state()


def test_volunteer_workparty_model():
    wp = VolunteerWorkpartyModel(
        project_id="test-proj",
        title="Test Trail Crew",
        trail_name="Test Trail",
        region="Cascades",
        date="2026-10-10",
        meeting_time="08:00 AM",
        duration_hours=6,
        difficulty="Moderate",
        required_tools=["Pulaski", "McLeod"],
        provided_safety_gear=["Hardhat", "Work Gloves"],
        spots_remaining=10,
        description="Trail work on test trail.",
    )
    assert wp.project_id == "test-proj"
    assert wp.duration_hours == 6
    assert wp.difficulty == "Moderate"
    assert "Pulaski" in wp.required_tools
    assert "Hardhat" in wp.provided_safety_gear
    assert wp.spots_remaining == 10


def test_volunteer_registration_models():
    req = VolunteerRegistrationRequest(
        project_id="mailbox-drainage",
        volunteer_name="Alex Honnold",
        volunteer_email="alex@example.com",
        emergency_contact="Clair Honnold",
        emergency_phone="555-0199",
        waiver_acknowledged=True,
    )
    assert req.project_id == "mailbox-drainage"
    assert req.waiver_acknowledged is True

    res = VolunteerRegistrationResponse(
        registration_id="VOL-12345",
        project_id="mailbox-drainage",
        project_title="Mailbox Peak Drainage & Turnpike Restoration",
        volunteer_name="Alex Honnold",
        date="2026-10-10",
        meeting_time="08:00 AM",
        status="confirmed",
        instructions="Meet at trailhead parking lot with work boots.",
    )
    assert res.registration_id.startswith("VOL-")
    assert res.status == "confirmed"


def test_stewardship_impact_model():
    impact = StewardshipImpactModel(
        total_hours_logged=14250,
        active_volunteers=840,
        trails_maintained_miles=186.5,
        trees_cleared=412,
        drainage_structures_built=328,
    )
    assert impact.total_hours_logged == 14250
    assert impact.trails_maintained_miles == 186.5


def test_volunteer_intent_model():
    intent = VolunteerIntent(action="projects", region="Cascades", difficulty="Strenuous")
    assert intent.action == "projects"
    assert intent.region == "Cascades"
    assert intent.difficulty == "Strenuous"


def test_get_volunteer_projects_catalog():
    projects = get_volunteer_projects()
    assert len(projects) >= 4
    project_ids = {p.project_id for p in projects}
    assert {
        "mailbox-drainage",
        "tiger-tread",
        "colchuck-naturalize",
        "hoh-river-blowdown",
    }.issubset(project_ids)


def test_get_volunteer_projects_filtering():
    # Filter by region
    cascades = get_volunteer_projects(region="Cascades")
    assert len(cascades) >= 2
    assert all(p.region.lower() == "cascades" for p in cascades)

    # Filter by difficulty
    moderate = get_volunteer_projects(difficulty="Moderate")
    assert len(moderate) >= 2
    assert all(p.difficulty.lower() == "moderate" for p in moderate)

    # Filter by both
    cascades_strenuous = get_volunteer_projects(region="Cascades", difficulty="Strenuous")
    assert len(cascades_strenuous) == 1
    assert cascades_strenuous[0].project_id == "mailbox-drainage"

    # Filter non-existent
    empty = get_volunteer_projects(region="Sahara")
    assert len(empty) == 0


def test_get_volunteer_project_by_id():
    proj = get_volunteer_project_by_id("mailbox-drainage")
    assert proj is not None
    assert proj.title == "Mailbox Peak Drainage & Turnpike Restoration"
    assert "Pulaski" in proj.required_tools

    missing = get_volunteer_project_by_id("non-existent-proj")
    assert missing is None


def test_register_volunteer_success_and_decrement():
    proj_before = get_volunteer_project_by_id("mailbox-drainage")
    assert proj_before is not None
    initial_spots = proj_before.spots_remaining

    req = VolunteerRegistrationRequest(
        project_id="mailbox-drainage",
        volunteer_name="Jamie Rivera",
        volunteer_email="jamie@example.com",
        emergency_contact="Pat Rivera",
        emergency_phone="555-0144",
        waiver_acknowledged=True,
    )
    resp = register_volunteer(req)

    assert resp.registration_id.startswith("VOL-")
    assert resp.project_id == "mailbox-drainage"
    assert resp.status == "confirmed"
    assert "instructions" in resp.instructions.lower() or "meet" in resp.instructions.lower()

    proj_after = get_volunteer_project_by_id("mailbox-drainage")
    assert proj_after is not None
    assert proj_after.spots_remaining == initial_spots - 1


def test_register_volunteer_invalid_project():
    req = VolunteerRegistrationRequest(
        project_id="invalid-id",
        volunteer_name="Jamie Rivera",
        volunteer_email="jamie@example.com",
        emergency_contact="Pat Rivera",
        emergency_phone="555-0144",
    )
    with pytest.raises(ValueError, match="not found"):
        register_volunteer(req)


def test_register_volunteer_no_spots():
    proj = get_volunteer_project_by_id("colchuck-naturalize")
    assert proj is not None
    # Simulate full capacity
    proj.spots_remaining = 0

    req = VolunteerRegistrationRequest(
        project_id="colchuck-naturalize",
        volunteer_name="Jamie Rivera",
        volunteer_email="jamie@example.com",
        emergency_contact="Pat Rivera",
        emergency_phone="555-0144",
    )
    with pytest.raises(ValueError, match="No volunteer spots remaining"):
        register_volunteer(req)


def test_get_stewardship_impact():
    impact = get_stewardship_impact()
    assert impact.total_hours_logged > 10000
    assert impact.active_volunteers > 500
    assert impact.trails_maintained_miles > 100.0
    assert impact.trees_cleared > 100
    assert impact.drainage_structures_built > 100


def test_detect_volunteer_intent_queries():
    # Projects query
    q1 = "How can I volunteer for trail work in the Cascades?"
    i1 = detect_volunteer_intent(q1)
    assert i1 is not None
    assert i1.action == "projects"
    assert i1.region == "Cascades"

    # Tools query
    q2 = "What tools are used for drainage restoration?"
    i2 = detect_volunteer_intent(q2)
    assert i2 is not None
    assert i2.action == "tools"

    # Safety query
    q3 = "Are work gloves and hardhats provided?"
    i3 = detect_volunteer_intent(q3)
    assert i3 is not None
    assert i3.action == "safety"

    # Safety query with difficulty
    q3b = "What safety gear is required for strenuous projects?"
    i3b = detect_volunteer_intent(q3b)
    assert i3b is not None
    assert i3b.action == "safety"
    assert i3b.difficulty == "Strenuous"

    # Register query
    q4 = "Sign me up for the Mailbox Peak trail crew"
    i4 = detect_volunteer_intent(q4)
    assert i4 is not None
    assert i4.action == "register"
    assert i4.project_id == "mailbox-drainage"

    # Impact query
    q5 = "How many volunteer hours has Contoso logged?"
    i5 = detect_volunteer_intent(q5)
    assert i5 is not None
    assert i5.action == "impact"

    # Give back to trails query
    q6 = "I want to give back to trails in the Issaquah Alps"
    i6 = detect_volunteer_intent(q6)
    assert i6 is not None
    assert i6.action == "projects"
    assert i6.region == "Issaquah Alps"

    # Pulaski query
    q7 = "How do we use a pulaski during trail maintenance?"
    i7 = detect_volunteer_intent(q7)
    assert i7 is not None
    assert i7.action == "tools"

    # Non-volunteer query
    q8 = "What is the return policy on sleeping pads?"
    i8 = detect_volunteer_intent(q8)
    assert i8 is None


def test_build_volunteer_prompt():
    intent = VolunteerIntent(action="projects", region="Cascades")
    prompt = build_volunteer_prompt(intent)
    assert "Trail Volunteer & Stewardship Grounding" in prompt
    assert "Mailbox Peak" in prompt
    assert "Safety PPE Rules" in prompt
    assert "Stewardship Impact Stats" in prompt


def test_format_volunteer_response_projects():
    intent = VolunteerIntent(action="projects", region="Cascades")
    res = format_volunteer_response(intent)
    assert "answer" in res
    assert "volunteer_info" in res
    info = res["volunteer_info"]
    assert info["action"] == "projects"
    assert "projects" in info
    assert len(info["projects"]) >= 2
    assert "Mailbox Peak" in res["answer"]


def test_format_volunteer_response_safety():
    intent = VolunteerIntent(action="safety", project_id="mailbox-drainage")
    res = format_volunteer_response(intent)
    assert "answer" in res
    assert "Hardhat" in res["answer"] or "hardhat" in res["answer"]
    info = res["volunteer_info"]
    assert info["action"] == "safety"
    assert "Hardhat" in info["provided_safety_gear"]
    assert "Sturdy Work Boots" in info["required_volunteer_gear"]


def test_format_volunteer_response_tools():
    intent = VolunteerIntent(action="tools", project_id="mailbox-drainage")
    res = format_volunteer_response(intent)
    assert "answer" in res
    assert "Pulaski" in res["answer"]
    info = res["volunteer_info"]
    assert info["action"] == "tools"
    assert "Pulaski" in info["required_tools"]
    assert "Pulaski" in info["tool_descriptions"]


def test_format_volunteer_response_register():
    intent = VolunteerIntent(action="register", project_id="mailbox-drainage")
    res = format_volunteer_response(intent)
    assert "answer" in res
    assert "Mailbox Peak" in res["answer"]
    info = res["volunteer_info"]
    assert info["action"] == "register"
    assert info["project_id"] == "mailbox-drainage"


def test_format_volunteer_response_impact():
    intent = VolunteerIntent(action="impact")
    res = format_volunteer_response(intent)
    assert "answer" in res
    assert "14,250" in res["answer"] or "14250" in res["answer"]
    info = res["volunteer_info"]
    assert info["action"] == "impact"
    assert info["impact"]["total_hours_logged"] == 14250
