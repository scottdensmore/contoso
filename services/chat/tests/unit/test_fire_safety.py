import pytest
from contoso_chat.fire_safety import (
    FireReportRequest,
    FireReportResponse,
    FireSafetyIntent,
    FireZoneModel,
    StoveCheckRequest,
    StoveCheckResponse,
    build_fire_safety_prompt,
    check_stove_compliance,
    detect_fire_safety_intent,
    format_fire_safety_response,
    get_campfire_safety_protocol,
    get_fire_zone_by_id,
    get_fire_zones,
    reset_fire_store,
    submit_fire_report,
)


@pytest.fixture(autouse=True)
def setup_teardown():
    reset_fire_store()
    yield
    reset_fire_store()


def test_fire_zone_model():
    zone = FireZoneModel(
        zone_id="alpine-lakes",
        name="Alpine Lakes Wilderness",
        region="Central Cascades",
        agency="US Forest Service",
        danger_level="High",
        restriction_stage="Stage 1",
        campfires_allowed=False,
        elevation_limit_feet=4000,
        allowed_stoves=["canister stove", "liquid fuel stove"],
        advisory_note="Campfires prohibited above 4,000 ft year-round and under Stage 1 restrictions.",
    )
    assert zone.zone_id == "alpine-lakes"
    assert zone.campfires_allowed is False
    assert zone.elevation_limit_feet == 4000
    assert "canister stove" in zone.allowed_stoves


def test_stove_check_models():
    req = StoveCheckRequest(zone_id="alpine-lakes", stove_type="alcohol stove")
    assert req.zone_id == "alpine-lakes"
    assert req.stove_type == "alcohol stove"

    res = StoveCheckResponse(
        zone_id="alpine-lakes",
        stove_type="alcohol stove",
        is_allowed=False,
        restriction_stage="Stage 1",
        reason="Alcohol stoves lack shut-off valves",
        precautions=["Use an approved canister stove"],
    )
    assert res.is_allowed is False
    assert len(res.precautions) == 1


def test_fire_report_models():
    req = FireReportRequest(
        zone_id="north-cascades-stehekin",
        location_description="Mile 4 on Stehekin Valley Trail near High Bridge",
        report_type="smoke",
        contact_phone="555-0199",
    )
    assert req.zone_id == "north-cascades-stehekin"
    assert req.report_type == "smoke"
    assert req.contact_phone == "555-0199"

    res = FireReportResponse(
        report_id="FIR-12345",
        zone_id="north-cascades-stehekin",
        location_description="Mile 4 on Stehekin Valley Trail",
        reported_at="2026-09-19T14:00:00Z",
        status="confirmed",
        hotline_number="1-800-474-7020",
    )
    assert res.report_id == "FIR-12345"
    assert res.status == "confirmed"


def test_get_fire_zones_catalog_and_filtering():
    zones = get_fire_zones()
    assert len(zones) == 5
    zone_ids = {z.zone_id for z in zones}
    assert "alpine-lakes" in zone_ids
    assert "mount-rainier" in zone_ids
    assert "olympic-backcountry" in zone_ids
    assert "north-cascades-stehekin" in zone_ids
    assert "mount-baker-snoqualmie" in zone_ids

    # Filter by region
    olympic_zones = get_fire_zones(region="Olympic")
    assert len(olympic_zones) == 1
    assert olympic_zones[0].zone_id == "olympic-backcountry"

    # Filter by danger level
    extreme_zones = get_fire_zones(danger_level="extreme")
    assert len(extreme_zones) == 1
    assert extreme_zones[0].zone_id == "north-cascades-stehekin"

    # Filter by both
    cascades_high = get_fire_zones(region="Cascades", danger_level="high")
    assert len(cascades_high) == 1
    assert cascades_high[0].zone_id == "alpine-lakes"


def test_get_fire_zone_by_id():
    zone = get_fire_zone_by_id("alpine-lakes")
    assert zone is not None
    assert zone.name == "Alpine Lakes Wilderness"
    assert zone.agency == "US Forest Service"

    assert get_fire_zone_by_id("non-existent-zone") is None


def test_check_stove_compliance():
    # Alpine Lakes Wilderness (Stage 1 restriction): canister allowed, alcohol prohibited
    allowed_res = check_stove_compliance(
        StoveCheckRequest(zone_id="alpine-lakes", stove_type="canister stove")
    )
    assert allowed_res.is_allowed is True
    assert allowed_res.zone_id == "alpine-lakes"
    assert "Stage 1" in allowed_res.restriction_stage
    assert len(allowed_res.precautions) > 0

    prohibited_res = check_stove_compliance(
        StoveCheckRequest(zone_id="alpine-lakes", stove_type="alcohol stove")
    )
    assert prohibited_res.is_allowed is False
    assert "shut-off" in prohibited_res.reason.lower() or "valve" in prohibited_res.reason.lower()

    # Wood burning twig stove in North Cascades (Total Ban)
    twig_res = check_stove_compliance(
        StoveCheckRequest(zone_id="north-cascades-stehekin", stove_type="wood-burning stove")
    )
    assert twig_res.is_allowed is False

    # Unknown zone raises ValueError
    with pytest.raises(ValueError, match="not found"):
        check_stove_compliance(
            StoveCheckRequest(zone_id="unknown-zone", stove_type="canister")
        )


def test_submit_fire_report():
    req = FireReportRequest(
        zone_id="north-cascades-stehekin",
        location_description="Visible smoke column 2 miles north of High Bridge camp",
        report_type="smoke",
        contact_phone="555-0144",
    )
    resp = submit_fire_report(req)
    assert resp.report_id.startswith("FIR-")
    assert resp.zone_id == "north-cascades-stehekin"
    assert resp.location_description == req.location_description
    assert resp.status == "confirmed"
    assert len(resp.hotline_number) > 0
    assert len(resp.reported_at) > 0

    # Unknown zone raises ValueError
    with pytest.raises(ValueError, match="not found"):
        submit_fire_report(
            FireReportRequest(
                zone_id="unknown-zone",
                location_description="Somewhere",
                report_type="smoke",
            )
        )


def test_get_campfire_safety_protocol():
    proto = get_campfire_safety_protocol()
    assert "title" in proto
    assert "principles" in proto
    assert len(proto["principles"]) >= 4
    assert "drown_stir_technique" in proto
    assert "emergency_hotline" in proto
    assert "wildfire_reporting" in proto


def test_detect_fire_safety_intent():
    # Danger intent
    i1 = detect_fire_safety_intent("What is the current fire danger rating in North Cascades?")
    assert i1 is not None
    assert i1.action in ("danger", "zones")
    assert i1.zone_id == "north-cascades-stehekin" or i1.region == "North Cascades"

    # Regulations intent
    i2 = detect_fire_safety_intent("Are campfires allowed in Alpine Lakes Wilderness?")
    assert i2 is not None
    assert i2.action == "regulations"
    assert i2.zone_id == "alpine-lakes"

    # Stove check intent
    i3 = detect_fire_safety_intent("Can I use an alcohol stove in Mount Rainier National Park?")
    assert i3 is not None
    assert i3.action == "stove_check"
    assert i3.zone_id == "mount-rainier"
    assert "alcohol" in (i3.stove_type or "")

    # Report intent
    i4 = detect_fire_safety_intent("I see smoke near Stehekin, how do I report a wildfire?")
    assert i4 is not None
    assert i4.action == "report"
    assert i4.zone_id == "north-cascades-stehekin"

    # LNT intent
    i5 = detect_fire_safety_intent("What are the Leave No Trace campfire safety guidelines?")
    assert i5 is not None
    assert i5.action == "lnt"

    # Non fire queries
    assert detect_fire_safety_intent("Where can I buy hiking boots?") is None
    assert detect_fire_safety_intent("Track my order #12345") is None


def test_build_fire_safety_prompt():
    intent = FireSafetyIntent(
        action="regulations",
        zone_id="alpine-lakes",
    )
    prompt = build_fire_safety_prompt(intent)
    assert "Fire Safety" in prompt or "Campfire" in prompt
    assert "Alpine Lakes" in prompt

    stove_intent = FireSafetyIntent(
        action="stove_check",
        zone_id="alpine-lakes",
        stove_type="canister stove",
    )
    stove_prompt = build_fire_safety_prompt(stove_intent)
    assert "Stove" in stove_prompt or "stove" in stove_prompt


def test_format_fire_safety_response():
    # Regulations
    r_intent = FireSafetyIntent(action="regulations", zone_id="alpine-lakes")
    resp = format_fire_safety_response(r_intent)
    assert "answer" in resp
    assert "fire_safety_info" in resp
    assert resp["fire_safety_info"]["action"] == "regulations"
    assert "Alpine Lakes Wilderness" in resp["answer"]

    # Stove check
    s_intent = FireSafetyIntent(action="stove_check", zone_id="alpine-lakes", stove_type="alcohol stove")
    resp_s = format_fire_safety_response(s_intent)
    assert "fire_safety_info" in resp_s
    assert resp_s["fire_safety_info"]["action"] == "stove_check"
    assert "alcohol" in resp_s["answer"].lower()
    assert "prohibited" in resp_s["answer"].lower() or "not allowed" in resp_s["answer"].lower()


def test_stove_compliance_branches():
    # General pressurized gas branch
    res_gas = check_stove_compliance(
        StoveCheckRequest(zone_id="olympic-backcountry", stove_type="jetboil isobutane gas burner")
    )
    assert res_gas.is_allowed is True

    # Unrecognized / non-compliant stove type
    res_unrec = check_stove_compliance(
        StoveCheckRequest(zone_id="alpine-lakes", stove_type="unvented kerosene heater")
    )
    assert res_unrec.is_allowed is False
    assert "not verified as compliant" in res_unrec.reason


def test_detect_fire_safety_intent_thorough():
    # Specific regex matches
    assert detect_fire_safety_intent("can i use a stove on trail?") is not None
    assert detect_fire_safety_intent("is there a fire ban?") is not None
    assert detect_fire_safety_intent("we saw smoke on the horizon") is not None

    # Regions
    i_oly = detect_fire_safety_intent("Fire safety in olympic peninsula")
    assert i_oly.region == "Olympic Peninsula"
    i_rai = detect_fire_safety_intent("Campfire rules in rainier")
    assert i_rai.region == "Mount Rainier"
    i_cas = detect_fire_safety_intent("Campfire rules in cascades")
    assert i_cas.region == "Central Cascades"
    i_nc = detect_fire_safety_intent("Fire danger in north cascades")
    assert i_nc.region == "North Cascades"

    # Danger levels
    assert detect_fire_safety_intent("extreme fire danger").danger_level == "Extreme"
    assert detect_fire_safety_intent("very high fire danger").danger_level == "Very High"
    assert detect_fire_safety_intent("high fire danger").danger_level == "High"
    assert detect_fire_safety_intent("moderate fire danger").danger_level == "Moderate"
    assert detect_fire_safety_intent("low fire danger").danger_level == "Low"

    # Stove types
    assert "liquid fuel" in detect_fire_safety_intent("can I use a liquid fuel stove?").stove_type
    assert "liquid fuel" in detect_fire_safety_intent("is white gas stove allowed?").stove_type
    assert "wood" in detect_fire_safety_intent("can I use a wood twig stove?").stove_type
    assert "charcoal" in detect_fire_safety_intent("are charcoal grills allowed?").stove_type

    # Baker zone
    i_baker = detect_fire_safety_intent("Campfire rules in Mount Baker Snoqualmie")
    assert i_baker.zone_id == "mount-baker-snoqualmie"

    # Zones general
    i_zones = detect_fire_safety_intent("tell me about backcountry fire zones")
    assert i_zones.action == "zones"


def test_build_fire_safety_prompt_all_actions():
    # Prompt without zone_id
    p_all = build_fire_safety_prompt(FireSafetyIntent(action="zones"))
    assert "Current Backcountry Fire Zones Status:" in p_all

    # LNT prompt
    p_lnt = build_fire_safety_prompt(FireSafetyIntent(action="lnt"))
    assert "Leave No Trace Fire Etiquette" in p_lnt

    # Report prompt
    p_rep = build_fire_safety_prompt(FireSafetyIntent(action="report"))
    assert "Wildfire & Smoke Sighting" in p_rep

    # Stove check with unknown zone
    p_st_err = build_fire_safety_prompt(
        FireSafetyIntent(action="stove_check", zone_id="unknown", stove_type="canister")
    )
    assert p_st_err is not None


def test_format_fire_safety_response_all_actions():
    # Regulations without zone_id
    resp_reg_all = format_fire_safety_response(FireSafetyIntent(action="regulations"))
    assert resp_reg_all["fire_safety_info"]["action"] == "regulations"
    assert "zones" in resp_reg_all["fire_safety_info"]

    # Danger with zone_id
    resp_d_z = format_fire_safety_response(
        FireSafetyIntent(action="danger", zone_id="alpine-lakes", danger_level="High")
    )
    assert resp_d_z["fire_safety_info"]["action"] == "danger"
    assert "Alpine Lakes" in resp_d_z["answer"]

    # Danger without zone_id
    resp_d_all = format_fire_safety_response(FireSafetyIntent(action="danger"))
    assert resp_d_all["fire_safety_info"]["action"] == "danger"

    # LNT
    resp_lnt = format_fire_safety_response(FireSafetyIntent(action="lnt"))
    assert resp_lnt["fire_safety_info"]["action"] == "lnt"
    assert "protocol" in resp_lnt["fire_safety_info"]

    # Report
    resp_rep = format_fire_safety_response(FireSafetyIntent(action="report"))
    assert resp_rep["fire_safety_info"]["action"] == "report"
    assert "hotline_number" in resp_rep["fire_safety_info"]

    # Zones general
    resp_zones = format_fire_safety_response(FireSafetyIntent(action="zones"))
    assert resp_zones["fire_safety_info"]["action"] == "zones"
    assert len(resp_zones["fire_safety_info"]["zones"]) == 5

    # Stove check with unknown zone
    resp_st_err = format_fire_safety_response(
        FireSafetyIntent(action="stove_check", zone_id="unknown-zone", stove_type="canister")
    )
    assert resp_st_err["fire_safety_info"]["action"] == "zones"
