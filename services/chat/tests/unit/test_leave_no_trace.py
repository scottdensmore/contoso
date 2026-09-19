import pytest
from contoso_chat.leave_no_trace import (
    LntIntent,
    LntPrincipleModel,
    PackOutCalcRequest,
    PackOutCalcResponse,
    WasteComplianceRequest,
    WasteComplianceResponse,
    WildernessZoneModel,
    assess_waste_compliance,
    build_lnt_prompt,
    calculate_pack_out_waste,
    detect_lnt_intent,
    format_lnt_response,
    get_lnt_principles,
    get_wilderness_zone_by_id,
    get_wilderness_zones,
)


def test_lnt_models():
    principle = LntPrincipleModel(
        principle_id="plan-ahead",
        number=1,
        title="Plan Ahead and Prepare",
        subtitle="Know the regulations and special concerns for the area you'll visit.",
        guidelines=["Prepare for extreme weather"],
        backcountry_practices=["Check permit quotas"],
    )
    assert principle.principle_id == "plan-ahead"
    assert principle.number == 1
    assert len(principle.guidelines) == 1

    zone = WildernessZoneModel(
        zone_id="enchantments-core",
        name="The Enchantments - Core Enchantment Zone",
        region="Alpine Lakes Wilderness / Central Cascades",
        elevation_zone="Alpine (>6,500 ft)",
        human_waste_protocol="Mandatory WAG bag pack-out",
        food_storage_requirement="Mandatory hard-sided bear canister",
        campfire_policy="Prohibited year-round",
        elevation_threshold_ft=6500,
        special_rules=["No campfires allowed"],
    )
    assert zone.zone_id == "enchantments-core"
    assert zone.elevation_threshold_ft == 6500


def test_get_lnt_principles_all():
    principles = get_lnt_principles()
    assert len(principles) == 7
    ids = [p.principle_id for p in principles]
    assert ids == [
        "plan-ahead",
        "durable-surfaces",
        "dispose-waste",
        "leave-what-you-find",
        "minimize-campfire",
        "respect-wildlife",
        "be-considerate",
    ]
    numbers = [p.number for p in principles]
    assert numbers == [1, 2, 3, 4, 5, 6, 7]


def test_get_lnt_principles_by_id():
    match = get_lnt_principles("dispose-waste")
    assert len(match) == 1
    assert match[0].principle_id == "dispose-waste"
    assert match[0].number == 3
    assert "cathole" in match[0].subtitle.lower() or "catholes" in match[0].subtitle.lower()

    # Case insensitivity
    match_upper = get_lnt_principles("PLAN-AHEAD")
    assert len(match_upper) == 1
    assert match_upper[0].number == 1

    # Non-existent
    assert get_lnt_principles("non-existent") == []


def test_get_wilderness_zones_all():
    zones = get_wilderness_zones()
    assert len(zones) == 5
    z_ids = {z.zone_id for z in zones}
    assert z_ids == {
        "enchantments-core",
        "mount-rainier-muir",
        "olympic-coast",
        "north-cascades-boston",
        "alpine-lakes-lowland",
    }


def test_get_wilderness_zones_by_id():
    zones = get_wilderness_zones("enchantments-core")
    assert len(zones) == 1
    assert zones[0].zone_id == "enchantments-core"
    assert "WAG" in zones[0].human_waste_protocol
    assert "bear canister" in zones[0].food_storage_requirement.lower()

    zone_helper = get_wilderness_zone_by_id("mount-rainier-muir")
    assert zone_helper is not None
    assert zone_helper.zone_id == "mount-rainier-muir"
    assert "Muir" in zone_helper.name

    assert get_wilderness_zone_by_id("unknown-zone") is None


def test_assess_waste_compliance_enchantments_core():
    req = WasteComplianceRequest(
        zone_id="enchantments-core",
        elevation_ft=7200,
        distance_from_water_ft=250,
        group_size=3,
        stay_days=2,
    )
    res = assess_waste_compliance(req)
    assert isinstance(res, WasteComplianceResponse)
    assert res.zone_id == "enchantments-core"
    assert res.compliance_status == "compliant"
    assert "wag bag" in res.human_waste_method.lower()
    assert "bear canister" in res.food_storage_method.lower()
    assert res.estimated_wag_bags_needed == 6  # 3 people * 2 days
    assert any("wag bag" in g.lower() for g in res.required_gear)
    assert any("bear canister" in g.lower() for g in res.required_gear)


def test_assess_waste_compliance_water_distance_violation():
    req = WasteComplianceRequest(
        zone_id="alpine-lakes-lowland",
        elevation_ft=2500,
        distance_from_water_ft=50,  # Violation: less than 200 ft
        group_size=2,
        stay_days=2,
    )
    res = assess_waste_compliance(req)
    assert res.compliance_status == "violation"
    assert any("water distance violation" in note.lower() or "200 feet" in note.lower() for note in res.guidance_notes)


def test_assess_waste_compliance_lowland_cathole():
    req = WasteComplianceRequest(
        zone_id="alpine-lakes-lowland",
        elevation_ft=2200,
        distance_from_water_ft=200,
        group_size=2,
        stay_days=3,
    )
    res = assess_waste_compliance(req)
    assert res.compliance_status == "compliant"
    assert "cathole" in res.human_waste_method.lower()
    assert res.estimated_wag_bags_needed == 0
    assert any("trowel" in g.lower() for g in res.required_gear)


def test_assess_waste_compliance_unknown_zone():
    req = WasteComplianceRequest(zone_id="fantasy-mountain")
    with pytest.raises(ValueError, match="Wilderness zone 'fantasy-mountain' not found"):
        assess_waste_compliance(req)


def test_calculate_pack_out_waste_wag_bags():
    req = PackOutCalcRequest(group_size=4, stay_days=3, requires_wag_bags=True)
    res = calculate_pack_out_waste(req)
    assert isinstance(res, PackOutCalcResponse)
    assert res.group_size == 4
    assert res.stay_days == 3
    assert res.wag_bags == 12  # 4 * 3
    assert res.trash_bags == 2
    assert res.odor_proof_bags == 2
    assert res.trowel_needed is False
    assert res.sanitizer_oz == 6.0  # 4 * 3 * 0.5


def test_calculate_pack_out_waste_cathole():
    req = PackOutCalcRequest(group_size=2, stay_days=2, requires_wag_bags=False)
    res = calculate_pack_out_waste(req)
    assert res.wag_bags == 0
    assert res.trowel_needed is True
    assert res.trash_bags >= 1
    assert res.odor_proof_bags >= 1
    assert res.sanitizer_oz == 2.0


def test_detect_lnt_intent_principles():
    intent = detect_lnt_intent("What are the 7 Leave No Trace principles?")
    assert intent is not None
    assert intent.action == "principles"

    intent2 = detect_lnt_intent("Tell me about LNT principle 3 and cathole depth")
    assert intent2 is not None
    assert intent2.action == "principles"
    assert intent2.principle_id == "dispose-waste"


def test_detect_lnt_intent_zones():
    intent = detect_lnt_intent("What are the human waste regulations in the Enchantments Core?")
    assert intent is not None
    assert intent.action in ("zone_regulations", "compliance_check")
    assert intent.zone_id == "enchantments-core"


def test_detect_lnt_intent_compliance_check():
    intent = detect_lnt_intent("Can I dig a cathole 100 feet from water in Alpine Lakes?")
    assert intent is not None
    assert intent.action == "compliance_check"
    assert intent.zone_id == "alpine-lakes-lowland"


def test_detect_lnt_intent_pack_out_calc():
    intent = detect_lnt_intent("How many wag bags and waste supplies do 4 people need for 3 days?")
    assert intent is not None
    assert intent.action == "pack_out_calc"
    assert intent.group_size == 4
    assert intent.stay_days == 3


def test_detect_lnt_intent_none():
    assert detect_lnt_intent("Where is my package tracking order #1234?") is None
    assert detect_lnt_intent("What is the price of the alpine tent?") is None


def test_build_lnt_prompt():
    intent = LntIntent(action="zone_regulations", zone_id="enchantments-core")
    prompt = build_lnt_prompt(intent)
    assert "Leave No Trace" in prompt
    assert "Enchantments" in prompt
    assert "WAG bag" in prompt or "human waste" in prompt.lower()


def test_format_lnt_response():
    intent = LntIntent(action="pack_out_calc", group_size=4, stay_days=3)
    formatted = format_lnt_response(intent)
    assert "answer" in formatted
    assert "lnt_info" in formatted
    assert "12" in formatted["answer"]
    assert formatted["lnt_info"]["action"] == "pack_out_calc"
    assert formatted["lnt_info"]["pack_out_calc"]["wag_bags"] == 12
