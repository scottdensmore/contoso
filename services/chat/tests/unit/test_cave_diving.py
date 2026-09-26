import pytest
from contoso_chat.cave_diving import (
    CaveDivingGearModel,
    CaveDivingIntent,
    CaveDivingRequest,
    CaveDivingResponse,
    CaveDivingSiteModel,
    FormattedCaveDivingResponse,
    build_cave_diving_prompt,
    calculate_cave_diving_gas,
    detect_cave_diving_intent,
    format_cave_diving_response,
    get_cave_diving_gear_checklist,
    get_cave_diving_site,
    get_cave_diving_sites,
)
from contoso_chat.chat import handle_cave_diving_intent
from contoso_chat.stream import generate_cave_diving_stream_events


def test_cave_diving_sites_catalog():
    """Verify catalog returns 5 iconic wilderness sites."""
    sites = get_cave_diving_sites()
    assert len(sites) == 5
    site_ids = [s.site_id for s in sites]
    assert "peacock-springs-karst" in site_ids
    assert "ginnie-springs-devil-system" in site_ids
    assert "cholla-sump-lost-creek" in site_ids
    assert "phantom-lake-spring" in site_ids
    assert "tuckaleechee-caverns-sump" in site_ids
    for s in sites:
        assert isinstance(s, CaveDivingSiteModel)


def test_cave_diving_sites_filtering():
    """Verify filtering by rigging setup."""
    sidemount_sites = get_cave_diving_sites(rigging="sidemount_dual_cylinder")
    assert len(sidemount_sites) == 3
    for s in sidemount_sites:
        assert s.primary_rigging == "sidemount_dual_cylinder"

    backmount_sites = get_cave_diving_sites(rigging="backmount_manifold_doubles")
    assert len(backmount_sites) == 1
    assert backmount_sites[0].site_id == "ginnie-springs-devil-system"

    ccr_sites = get_cave_diving_sites(rigging="closed_circuit_rebreather_ccr")
    assert len(ccr_sites) == 1
    assert ccr_sites[0].site_id == "phantom-lake-spring"


def test_get_cave_diving_site_lookup():
    """Verify single site lookup and 404/None behavior."""
    site = get_cave_diving_site("peacock-springs-karst")
    assert site is not None
    assert site.site_id == "peacock-springs-karst"
    assert "Peacock Springs" in site.title
    assert site.max_depth_m == 20
    assert site.water_temp_c == 21
    assert site.flow_type == "static_slack_phreatic"
    assert site.primary_rigging == "sidemount_dual_cylinder"
    assert site.sump_length_m == 850
    assert site.silt_risk == "moderate_sand_drift"
    assert len(site.highlights) == 3

    assert get_cave_diving_site("unknown-sinkhole") is None


def test_calculate_cave_diving_gas_defaults():
    """Verify gas calculations with default parameters (Rule of Thirds, 3000 PSI, 120m)."""
    req = CaveDivingRequest()
    res = calculate_cave_diving_gas(req)

    assert isinstance(res, CaveDivingResponse)
    assert res.site_id == "peacock-springs-karst"
    assert res.site_title == "Peacock Springs Karst Siphon & Grand Traverse"
    assert res.rigging_setup == "sidemount_dual_cylinder"
    # 3000 * 1/3 = 1000.0 usable gas
    assert res.usable_gas_psi == 1000.0
    # turn pressure = 3000 - 1000 = 2000.0
    assert res.turn_pressure_psi == 2000.0
    # reserve gas = 3000 - 1000 = 2000.0
    assert res.reserve_gas_psi == 2000.0
    # 120 * 1.25 + 50 = 200.0m spool
    assert res.guideline_spool_required_m == 200.0
    assert res.penetration_safety == "nominal_safe_turn"
    assert res.silt_risk == "moderate_sand_drift"
    assert len(res.gas_management_advisory) > 0
    assert len(res.decompression_advisory) > 0


def test_calculate_cave_diving_gas_rules():
    """Verify Rule of Sixths and Rule of Quarters calculations."""
    # Rule of Sixths: 3000 * 1/6 = 500.0 usable, turn = 2500.0
    req_sixths = CaveDivingRequest(
        starting_pressure_psi=3000.0,
        reserve_rule="rule_of_sixths",
    )
    res_sixths = calculate_cave_diving_gas(req_sixths)
    assert res_sixths.usable_gas_psi == 500.0
    assert res_sixths.turn_pressure_psi == 2500.0
    assert res_sixths.reserve_gas_psi == 2500.0

    # Rule of Quarters: 3600 * 1/4 = 900.0 usable, turn = 2700.0
    req_quarters = CaveDivingRequest(
        starting_pressure_psi=3600.0,
        reserve_rule="rule_of_quarters",
    )
    res_quarters = calculate_cave_diving_gas(req_quarters)
    assert res_quarters.usable_gas_psi == 900.0
    assert res_quarters.turn_pressure_psi == 2700.0
    assert res_quarters.reserve_gas_psi == 2700.0


def test_calculate_cave_diving_gas_safety_status():
    """Verify safety status for different flow types and penetration depths."""
    # Inflowing siphon suction: must alert if reserve_rule != rule_of_sixths
    req_siphon_thirds = CaveDivingRequest(
        site_id="cholla-sump-lost-creek",
        flow_type="inflowing_siphon_suction",
        reserve_rule="rule_of_thirds",
    )
    res_siphon_thirds = calculate_cave_diving_gas(req_siphon_thirds)
    assert res_siphon_thirds.penetration_safety == "critical_gas_reserve_alert"

    req_siphon_sixths = CaveDivingRequest(
        site_id="cholla-sump-lost-creek",
        flow_type="inflowing_siphon_suction",
        reserve_rule="rule_of_sixths",
    )
    res_siphon_sixths = calculate_cave_diving_gas(req_siphon_sixths)
    assert res_siphon_sixths.penetration_safety == "nominal_safe_turn"

    # Outflowing spring resurgence: nominal_safe_turn
    req_outflow = CaveDivingRequest(
        site_id="ginnie-springs-devil-system",
        flow_type="outflowing_spring_resurgence",
        reserve_rule="rule_of_thirds",
    )
    res_outflow = calculate_cave_diving_gas(req_outflow)
    assert res_outflow.penetration_safety == "nominal_safe_turn"

    # Static slack phreatic: penetration > 200m triggers caution_flow_resistance
    req_phreatic_deep = CaveDivingRequest(
        site_id="peacock-springs-karst",
        flow_type="static_slack_phreatic",
        planned_penetration_m=250.0,
    )
    res_phreatic_deep = calculate_cave_diving_gas(req_phreatic_deep)
    assert res_phreatic_deep.penetration_safety == "caution_flow_resistance"

    req_phreatic_shallow = CaveDivingRequest(
        site_id="peacock-springs-karst",
        flow_type="static_slack_phreatic",
        planned_penetration_m=150.0,
    )
    res_phreatic_shallow = calculate_cave_diving_gas(req_phreatic_shallow)
    assert res_phreatic_shallow.penetration_safety == "nominal_safe_turn"


def test_calculate_cave_diving_gas_invalid_site():
    """Verify calculate raises ValueError for unknown site."""
    with pytest.raises(ValueError, match="not found"):
        calculate_cave_diving_gas(CaveDivingRequest(site_id="nonexistent-sump"))


def test_calculate_cave_diving_gas_deep_site_decompression():
    """Verify deep site decompression advisory (>35m max depth)."""
    req_deep = CaveDivingRequest(
        site_id="phantom-lake-spring",
        flow_type="static_slack_phreatic",
        rigging_setup="closed_circuit_rebreather_ccr",
        reserve_rule="rule_of_quarters",
    )
    res_deep = calculate_cave_diving_gas(req_deep)
    assert "Deep phreatic conduit (45m)" in res_deep.decompression_advisory
    assert "trimix" in res_deep.decompression_advisory.lower()
    assert "Rule of Quarters applied" in res_deep.gas_management_advisory


def test_cave_diving_gear_checklist():
    """Verify 6 mandatory gear items in checklist."""
    gear = get_cave_diving_gear_checklist()
    assert len(gear) == 6
    assert all(g.mandatory is True for g in gear)

    gear_ids = [g.item_id for g in gear]
    assert "primary-safety-guideline-reels" in gear_ids
    assert "redundant-led-dive-lights" in gear_ids
    assert "sidemount-dual-regulator-kit" in gear_ids
    assert "dual-cutting-devices" in gear_ids
    assert "underwater-dive-slate-markers" in gear_ids
    assert "drysuit-crush-resistant-boots" in gear_ids

    for g in gear:
        assert isinstance(g, CaveDivingGearModel)

    # Verify categories
    categories = {g.category for g in gear}
    assert "guideline" in categories
    assert "lighting" in categories
    assert "gas_management" in categories
    assert "safety" in categories
    assert "navigation" in categories
    assert "exposure" in categories


def test_detect_cave_diving_intent_positive():
    """Verify positive intent detection for site, gas calculation, guideline, and gear queries."""
    i1 = detect_cave_diving_intent("Tell me about Peacock Springs karst cave diving")
    assert i1 is not None
    assert i1.site_id == "peacock-springs-karst"
    assert i1.action == "site_detail"

    i2 = detect_cave_diving_intent("Devil's Eye siphon trunk exploration with manifold doubles")
    assert i2 is not None
    assert i2.site_id == "ginnie-springs-devil-system"
    assert i2.rigging_setup == "backmount_manifold_doubles"

    i3 = detect_cave_diving_intent("Calculate rule of thirds turn pressure for cave diving")
    assert i3 is not None
    assert i3.action in ("calculate_gas", "calculate")

    i4 = detect_cave_diving_intent(
        "What reels, spools, and primary dive lights do I need for zero-visibility silt out hazard?"
    )
    assert i4 is not None
    assert i4.action == "gear_checklist"

    i5 = detect_cave_diving_intent("Lost Creek siphon sump penetration dual cylinders")
    assert i5 is not None
    assert i5.site_id == "cholla-sump-lost-creek"
    assert i5.rigging_setup == "sidemount_dual_cylinder"

    i6 = detect_cave_diving_intent("Phantom Lake spring CCR rebreather deep conduit")
    assert i6 is not None
    assert i6.site_id == "phantom-lake-spring"
    assert i6.rigging_setup == "closed_circuit_rebreather_ccr"

    i7 = detect_cave_diving_intent("List iconic wilderness cave diving sites and sump conduits")
    assert i7 is not None
    assert i7.action == "sites_list"


def test_detect_cave_diving_intent_exclusions():
    """Verify exclusions immediately return None."""
    exclusions_queries = [
        "Where is my order #12345 for cave diving fins?",
        "Can I get a refund on my cave diving light?",
        "I need a return label for my drysuit",
        "Shipping tracking for sidemount regulators",
        "Pack burro expedition to cave entrance",
        "Horse trail riding near Peacock Springs",
        "Pack goat gear for sump diving",
        "Dogsledding in winter near Bighorn mountains",
        "Primitive trapping permits near karst sinkholes",
        "Gold pan creek prospecting near tuckaleechee",
        "Beachcombing shells along Florida springs",
        "Fire lookout tower near Devil's Eye",
        "Snowshoe trails near Lost Creek",
        "Sandboarding dunes near Balmorhea",
        "Alpine caving single rope technique SRT Fantastic Pit",
        "Dry cave exploration without diving",
        "Kayak rentals near Ginnie Springs",
        "Cylinder rental for cave dive",
    ]
    for q in exclusions_queries:
        assert detect_cave_diving_intent(q) is None, f"Expected None for: {q}"


def test_format_cave_diving_response():
    """Verify response formatting for calculate, gear, detail, and list actions."""
    # Calculate
    calc_intent = CaveDivingIntent(action="calculate_gas", site_id="peacock-springs-karst")
    resp_calc = format_cave_diving_response(calc_intent)
    assert isinstance(resp_calc, FormattedCaveDivingResponse)
    assert "cave_diving_info" in resp_calc._data
    assert resp_calc._data["cave_diving_info"]["action"] in ("calculate_gas", "calculate")
    assert "turn pressure" in str(resp_calc).lower() or "turn" in str(resp_calc).lower()

    # Gear
    gear_intent = CaveDivingIntent(action="gear_checklist")
    resp_gear = format_cave_diving_response(gear_intent)
    assert isinstance(resp_gear, FormattedCaveDivingResponse)
    assert resp_gear._data["cave_diving_info"]["action"] == "gear_checklist"
    assert len(resp_gear._data["cave_diving_info"]["gear"]) == 6

    # Detail
    detail_intent = CaveDivingIntent(action="site_detail", site_id="ginnie-springs-devil-system")
    resp_detail = format_cave_diving_response(detail_intent)
    assert isinstance(resp_detail, FormattedCaveDivingResponse)
    assert resp_detail._data["cave_diving_info"]["action"] == "site_detail"
    assert "Devil's Eye" in str(resp_detail) or "Ginnie" in str(resp_detail)

    # List
    list_intent = CaveDivingIntent(action="sites_list")
    resp_list = format_cave_diving_response(list_intent)
    assert isinstance(resp_list, FormattedCaveDivingResponse)
    assert resp_list._data["cave_diving_info"]["action"] == "sites_list"
    assert len(resp_list._data["cave_diving_info"]["sites"]) == 5


def test_formatted_cave_diving_response_dict_methods():
    """Test get, keys, values, items, in operators on FormattedCaveDivingResponse."""
    resp = FormattedCaveDivingResponse("Test answer", {"key1": "val1", "answer": "Test answer"})
    assert resp.get("key1") == "val1"
    assert resp.get("missing", "default") == "default"
    assert resp["key1"] == "val1"
    assert "key1" in resp
    assert "nonexistent" not in resp
    assert list(resp.keys()) == ["key1", "answer"]
    assert "val1" in list(resp.values())
    assert ("key1", "val1") in list(resp.items())


def test_build_cave_diving_prompt():
    """Test prompt building with and without site focus."""
    p_generic = build_cave_diving_prompt()
    assert "Wilderness Karst Cave Diving" in p_generic
    assert "Rule of Thirds" in p_generic

    intent_site = CaveDivingIntent(action="site_detail", site_id="peacock-springs-karst")
    p_site = build_cave_diving_prompt(intent_site)
    assert "Peacock Springs" in p_site


def test_handle_cave_diving_intent():
    """Test chat cascade handler."""
    res = handle_cave_diving_intent("What is the turn pressure for cave diving at Peacock Springs?")
    assert res is not None
    assert "cave_diving_info" in res
    assert "answer" in res

    assert handle_cave_diving_intent("Where is my order #5555?") is None


@pytest.mark.anyio
async def test_generate_cave_diving_stream_events():
    """Test stream event generation for lookup, calculation, and non-intent queries."""
    # Calculation
    calc_events = []
    async for chunk in generate_cave_diving_stream_events(
        "Calculate rule of thirds turn pressure for cave diving at 3000 psi"
    ):
        calc_events.append(chunk)

    assert len(calc_events) > 0
    full_calc = "".join(calc_events)
    assert "cave_diving_calculated" in full_calc
    assert "data: [DONE]" in full_calc

    # Lookup
    lookup_events = []
    async for chunk in generate_cave_diving_stream_events(
        "Tell me about Peacock Springs karst cave diving details"
    ):
        lookup_events.append(chunk)

    assert len(lookup_events) > 0
    full_lookup = "".join(lookup_events)
    assert "cave_diving_lookup" in full_lookup

    # Exclusion
    none_events = []
    async for chunk in generate_cave_diving_stream_events("Where is my order #999?"):
        none_events.append(chunk)
    assert len(none_events) == 0
