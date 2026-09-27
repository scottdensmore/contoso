import pytest
from contoso_chat.chat import handle_telemark_skiing_intent
from contoso_chat.stream import generate_telemark_stream_events
from contoso_chat.telemark_skiing import (
    FormattedTelemarkResponse,
    TelemarkGearModel,
    TelemarkIntent,
    TelemarkRequest,
    TelemarkResponse,
    TelemarkZoneModel,
    build_telemark_prompt,
    calculate_telemark_activity,
    detect_telemark_intent,
    format_telemark_response,
    get_telemark_gear_checklist,
    get_telemark_zone,
    get_telemark_zones,
)


def test_telemark_zones_catalog():
    """Verify catalog returns 5 iconic alpine telemark zones."""
    zones = get_telemark_zones()
    assert len(zones) == 5
    zone_ids = [z.zone_id for z in zones]
    assert "silverton-mountain-powder" in zone_ids
    assert "mad-river-glen-trees" in zone_ids
    assert "alta-catherine-pass" in zone_ids
    assert "rogers-pass-asulkan" in zone_ids
    assert "tuckerman-ravine-bowl" in zone_ids
    for z in zones:
        assert isinstance(z, TelemarkZoneModel)


def test_telemark_zones_filtering():
    """Verify filtering by binding system."""
    ntn_zones = get_telemark_zones(system="ntn_modern")
    assert len(ntn_zones) == 3
    for z in ntn_zones:
        assert z.primary_binding == "ntn_modern"

    duckbill_zones = get_telemark_zones(system="duckbill_75mm_cable")
    assert len(duckbill_zones) == 1
    assert duckbill_zones[0].zone_id == "mad-river-glen-trees"

    tele_tech_zones = get_telemark_zones(system="tele_tech_hybrid")
    assert len(tele_tech_zones) == 1
    assert tele_tech_zones[0].zone_id == "rogers-pass-asulkan"


def test_get_telemark_zone_lookup():
    """Verify single zone lookup and None behavior on missing zone."""
    zone = get_telemark_zone("silverton-mountain-powder")
    assert zone is not None
    assert zone.zone_id == "silverton-mountain-powder"
    assert "Silverton Mountain" in zone.title
    assert zone.elevation_m == 4100
    assert zone.primary_binding == "ntn_modern"
    assert zone.steepness_deg == 45
    assert "San Juan" in zone.snow_type
    assert len(zone.highlights) == 3

    assert get_telemark_zone("nonexistent-peak") is None


def test_calculate_telemark_activity_defaults():
    """Verify default calculations: 170 lbs, ntn_modern, tension 3."""
    req = TelemarkRequest()
    res = calculate_telemark_activity(req)

    assert isinstance(res, TelemarkResponse)
    assert res.zone_id == "silverton-mountain-powder"
    assert "Silverton Mountain" in res.zone_title
    assert res.binding_system == "ntn_modern"
    # Base: 45.0, tension mod: (3 - 3) * 6 = 0, weight: 170/170 = 1.0 => 45.0 Nm
    assert res.effective_resistance_nm == 45.0
    # Tip drive: min(0.98, round(45.0 / 80.0, 2)) = 0.56
    assert res.tip_drive_edge_pressure_index == 0.56
    assert res.resistance_rating == "balanced_all_mountain"
    assert len(res.bellows_strain_warning) > 0
    assert len(res.lead_change_advisory) > 0
    assert len(res.edge_transition_guidance) > 0


def test_calculate_telemark_activity_binding_systems():
    """Verify resistance calculations for duckbill and tele-tech."""
    # Duckbill: base 35.0, tension 3 => 35.0 Nm, rating balanced_all_mountain (35.0 <= res < 52.0)
    req_duckbill = TelemarkRequest(
        zone_id="mad-river-glen-trees",
        binding_system="duckbill_75mm_cable",
        skier_weight_lbs=170.0,
        tension_level=3,
    )
    res_duckbill = calculate_telemark_activity(req_duckbill)
    assert res_duckbill.effective_resistance_nm == 35.0
    assert res_duckbill.tip_drive_edge_pressure_index == round(35.0 / 80.0, 2)
    assert res_duckbill.resistance_rating == "balanced_all_mountain"

    # Tele-tech hybrid: base 40.0, tension 3 => 40.0 Nm
    req_teletech = TelemarkRequest(
        zone_id="rogers-pass-asulkan",
        binding_system="tele_tech_hybrid",
        skier_weight_lbs=170.0,
        tension_level=3,
    )
    res_teletech = calculate_telemark_activity(req_teletech)
    assert res_teletech.effective_resistance_nm == 40.0
    assert res_teletech.tip_drive_edge_pressure_index == round(40.0 / 80.0, 2)
    assert res_teletech.resistance_rating == "balanced_all_mountain"


def test_calculate_telemark_activity_tension_and_weight_variations():
    """Verify tension modifiers, weight scaling, and rating thresholds."""
    # Supple surf flex: duckbill, tension 1 => mod (1-3)*6 = -12. Base 35-12 = 23. Weight 170 => 23.0 < 35.0
    req_supple = TelemarkRequest(
        binding_system="duckbill_75mm_cable",
        skier_weight_lbs=170.0,
        tension_level=1,
    )
    res_supple = calculate_telemark_activity(req_supple)
    assert res_supple.effective_resistance_nm == 23.0
    assert res_supple.resistance_rating == "supple_surf_flex"

    # Active carving power: ntn_modern (45), tension 5 => mod (5-3)*6 = +12 => 57.0 Nm
    req_active = TelemarkRequest(
        binding_system="ntn_modern",
        skier_weight_lbs=170.0,
        tension_level=5,
    )
    res_active = calculate_telemark_activity(req_active)
    assert res_active.effective_resistance_nm == 57.0
    assert res_active.resistance_rating == "active_carving_power"

    # Stiff race lockout: ntn_modern (45), tension 6 => mod 18 => 63. Weight 210 lbs => 63 * 210/170 = 77.8 Nm >= 70.0
    req_lockout = TelemarkRequest(
        binding_system="ntn_modern",
        skier_weight_lbs=210.0,
        tension_level=6,
    )
    res_lockout = calculate_telemark_activity(req_lockout)
    assert res_lockout.effective_resistance_nm == round(63.0 * (210.0 / 170.0), 1)
    assert res_lockout.effective_resistance_nm >= 70.0
    assert res_lockout.resistance_rating == "stiff_race_lockout"
    assert res_lockout.tip_drive_edge_pressure_index == min(0.98, round(res_lockout.effective_resistance_nm / 80.0, 2))


def test_calculate_telemark_activity_missing_zone():
    """Verify ValueError is raised if zone is invalid."""
    with pytest.raises(ValueError, match="Telemark zone 'invalid-zone' not found"):
        calculate_telemark_activity(TelemarkRequest(zone_id="invalid-zone"))


def test_telemark_gear_checklist():
    """Verify all 6 mandatory telemark gear items."""
    gear = get_telemark_gear_checklist()
    assert len(gear) == 6
    item_ids = [g.item_id for g in gear]
    assert "telemark-bellows-boots" in item_ids
    assert "touring-climbing-skins" in item_ids
    assert "safety-leash-release-cables" in item_ids
    assert "adjustable-whippet-poles" in item_ids
    assert "binding-spare-cartridge-kit" in item_ids
    assert "avalanche-airbag-rescue-pack" in item_ids
    for g in gear:
        assert isinstance(g, TelemarkGearModel)
        assert g.mandatory is True
        assert len(g.purpose) > 0


def test_detect_telemark_intent_positive():
    """Verify positive intent detection for zones, bindings, spring tension, and gear."""
    # Zone query
    intent_zone = detect_telemark_intent("Tell me about telemark skiing Silverton Mountain")
    assert intent_zone is not None
    assert intent_zone.zone_id == "silverton-mountain-powder"
    assert intent_zone.action == "zone_detail"

    # Calculation / spring tension query
    intent_calc = detect_telemark_intent("Calculate telemark spring tension and knee resistance for NTN bindings")
    assert intent_calc is not None
    assert intent_calc.binding_system == "ntn_modern"
    assert intent_calc.action in ("calculate_activity", "calculate")

    # Gear query
    intent_gear = detect_telemark_intent("What is the mandatory telemark skiing equipment checklist and bellows boots?")
    assert intent_gear is not None
    assert intent_gear.action == "gear_checklist"

    # General list query
    intent_list = detect_telemark_intent("List telemark skiing alpine bowls and zones")
    assert intent_list is not None
    assert intent_list.action == "zones_list"


def test_detect_telemark_intent_exclusions():
    """Verify exclusion keywords return None immediately."""
    assert detect_telemark_intent("Track order #12345 telemark ski") is None
    assert detect_telemark_intent("I want a refund on telemark bindings") is None
    assert detect_telemark_intent("Where is my return label for telemark boots") is None
    assert detect_telemark_intent("shipping tracking for telemark skis") is None
    assert detect_telemark_intent("cave diving and telemark") is None
    assert detect_telemark_intent("nordic cross country skiing") is None
    assert detect_telemark_intent("steep skiing couloirs Corbet's") is None
    assert detect_telemark_intent("rentals for telemark skis") is None
    assert detect_telemark_intent("burro packing with telemark") is None


def test_format_telemark_response():
    """Verify FormattedTelemarkResponse formatting for all actions."""
    # Calculation
    intent_calc = TelemarkIntent(action="calculate_activity", zone_id="silverton-mountain-powder")
    formatted_calc = format_telemark_response(intent_calc)
    assert isinstance(formatted_calc, FormattedTelemarkResponse)
    assert "telemark_skiing_info" in formatted_calc
    tele_info = formatted_calc["telemark_skiing_info"]
    assert tele_info["action"] in ("calculate_activity", "calculate")
    assert "calculation" in tele_info
    assert "Silverton Mountain" in str(formatted_calc)

    # Gear
    intent_gear = TelemarkIntent(action="gear_checklist")
    formatted_gear = format_telemark_response(intent_gear)
    assert "telemark_skiing_info" in formatted_gear
    assert formatted_gear["telemark_skiing_info"]["action"] == "gear_checklist"
    assert len(formatted_gear["telemark_skiing_info"]["gear"]) == 6

    # Detail
    intent_detail = TelemarkIntent(action="zone_detail", zone_id="alta-catherine-pass")
    formatted_detail = format_telemark_response(intent_detail)
    assert "telemark_skiing_info" in formatted_detail
    assert formatted_detail["telemark_skiing_info"]["action"] == "zone_detail"
    assert "Catherine's Pass" in str(formatted_detail)

    # List
    intent_list = TelemarkIntent(action="zones_list")
    formatted_list = format_telemark_response(intent_list)
    assert "telemark_skiing_info" in formatted_list
    assert formatted_list["telemark_skiing_info"]["action"] == "zones_list"
    assert len(formatted_list["telemark_skiing_info"]["zones"]) == 5


def test_handle_telemark_skiing_intent_in_chat():
    """Verify chat cascade handler."""
    res = handle_telemark_skiing_intent("Tell me about telemark skiing Silverton")
    assert res is not None
    assert "telemark_skiing_info" in res
    assert "answer" in res

    assert handle_telemark_skiing_intent("How much for bicycle rentals?") is None


@pytest.mark.anyio
async def test_generate_telemark_stream_events():
    """Verify SSE streaming event generator."""
    events = []
    async for event_chunk in generate_telemark_stream_events("Calculate telemark spring tension for NTN"):
        events.append(event_chunk)

    assert len(events) > 0
    full_stream = "".join(events)
    assert "telemark_calculated" in full_stream
    assert "data: [DONE]" in full_stream

def test_build_telemark_prompt():
    """Verify system prompt generation for telemark skiing."""
    prompt = build_telemark_prompt()
    assert "Alpine Telemark Skiing" in prompt
    assert "NTN Modern" in prompt

    intent = TelemarkIntent(action="zone_detail", zone_id="silverton-mountain-powder")
    prompt_with_zone = build_telemark_prompt(intent)
    assert "Silverton Mountain" in prompt_with_zone
