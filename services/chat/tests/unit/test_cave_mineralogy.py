import pytest
from contoso_chat.cave_mineralogy import (
    CaveMineralogyIntent,
    CaveMineralogySite,
    FormattedCaveMineralogyResponse,
    MineralAccretionQuery,
    MineralAccretionResult,
    SpeleothemGearItem,
    build_cave_mineralogy_prompt,
    calculate_mineral_accretion,
    cave_mineralogy_tool,
    detect_cave_mineralogy_intent,
    format_cave_mineralogy_response,
    get_cave_mineralogy_gear_checklist,
    get_cave_mineralogy_site,
    get_cave_mineralogy_sites,
    get_speleothem_gear_checklist,
)
from contoso_chat.chat import handle_cave_mineralogy_intent
from contoso_chat.stream import generate_cave_mineralogy_stream_events


def test_cave_mineralogy_sites_catalog():
    """Verify catalog returns 5 iconic karst sites."""
    sites = get_cave_mineralogy_sites()
    assert len(sites) == 5
    site_ids = [s.id for s in sites]
    assert "carlsbad-rookery-chamber" in site_ids
    assert "lechuguilla-chandelier-room" in site_ids
    assert "organ-cave-anthodite-gallery" in site_ids
    assert "mammoth-frozen-niagara" in site_ids
    assert "blanchard-springs-coral-grotto" in site_ids

    for s in sites:
        assert isinstance(s, CaveMineralogySite)
        assert s.site_id == s.id
        assert s.name
        assert s.title == s.name
        assert s.region
        assert s.system
        assert s.max_depth_m > 0
        assert s.max_depth_meters == s.max_depth_m
        assert s.ambient_temp_c > 0
        assert s.humidity_percent > 0
        assert s.speleothem_type
        assert s.host_rock
        assert s.conservation_status
        assert s.description
        assert len(s.highlights) >= 2


def test_cave_mineralogy_sites_filtering():
    """Verify filtering by speleothem_type and conservation."""
    pisolith_sites = get_cave_mineralogy_sites(speleothem_type="cave_pearl_pisolith")
    assert len(pisolith_sites) == 1
    assert pisolith_sites[0].id == "carlsbad-rookery-chamber"

    gypsum_sites = get_cave_mineralogy_sites(speleothem_type="gypsum_flower_needle")
    assert len(gypsum_sites) == 1
    assert gypsum_sites[0].id == "lechuguilla-chandelier-room"

    anthodite_sites = get_cave_mineralogy_sites(speleothem_type="aragonite_anthodite")
    assert len(anthodite_sites) == 1
    assert anthodite_sites[0].id == "organ-cave-anthodite-gallery"

    threatened = get_cave_mineralogy_sites(
        conservation="threatened_microclimate_desiccation"
    )
    assert len(threatened) == 1
    assert threatened[0].id == "lechuguilla-chandelier-room"

    vulnerable = get_cave_mineralogy_sites(conservation="vulnerable_low_drip")
    assert len(vulnerable) == 2
    vuln_ids = [s.id for s in vulnerable]
    assert "mammoth-frozen-niagara" in vuln_ids
    assert "organ-cave-anthodite-gallery" in vuln_ids

    pristine = get_cave_mineralogy_sites(conservation="pristine_active_growth")
    assert len(pristine) == 2


def test_get_cave_mineralogy_site_lookup():
    """Verify single site lookup and 404/None behavior."""
    site = get_cave_mineralogy_site("carlsbad-rookery-chamber")
    assert site is not None
    assert site.id == "carlsbad-rookery-chamber"
    assert "Rookery Nest" in site.name
    assert site.max_depth_m == 250
    assert site.ambient_temp_c == 13.5
    assert site.humidity_percent == 98
    assert site.speleothem_type == "cave_pearl_pisolith"
    assert site.host_rock == "permian_evaporite_gypsum"
    assert site.conservation_status == "pristine_active_growth"
    assert len(site.highlights) == 3

    assert get_cave_mineralogy_site("nonexistent-cavern") is None


def test_calculate_mineral_accretion_defaults():
    """Verify mineral accretion calculations with default parameters."""
    query = MineralAccretionQuery()
    res = calculate_mineral_accretion(query)

    assert isinstance(res, MineralAccretionResult)
    assert res.site_id == "carlsbad-rookery-chamber"
    assert "Rookery Nest" in res.site_title
    # pH 7.8, CaCO3 220: (7.8 - 7.0)*0.6 + (220 - 200)/400 = 0.48 + 0.05 = 0.53
    assert res.calcite_saturation_index == 0.53
    # 24 * 0.045 = 1.08 J/hr
    assert res.pool_agitation_joules_per_hour == 1.08
    assert res.rotation_state == "stable_laminar_accretion"
    assert res.estimated_accretion_microns_per_year == 16
    assert res.triage_status == "nominal_active_mineralization"
    assert "NOMINAL ACTIVE MINERAL ACCRETION" in res.conservation_advisory
    assert "laser photogrammetry" in res.monitoring_protocol


def test_calculate_mineral_accretion_scenarios():
    """Verify calculation states: active polishing rotation, low saturation, desiccation halt."""
    # Active polishing rotation: high drip rate (>= 40) and high saturation (> 0.4)
    q_active = MineralAccretionQuery(
        site_id="carlsbad-rookery-chamber",
        drip_rate_dpm=48.0,
        water_ph=8.0,
        calcium_carbonate_ppm=300.0,
    )
    res_active = calculate_mineral_accretion(q_active)
    assert res_active.rotation_state == "active_polishing_rotation"
    assert res_active.triage_status == "nominal_active_mineralization"
    assert res_active.calcite_saturation_index > 0.4

    # Low carbonate saturation caution: 0.0 <= SI < 0.2
    # pH 7.1, CaCO3 200 -> SI = (7.1-7.0)*0.6 + 0 = 0.06
    q_caution = MineralAccretionQuery(
        site_id="mammoth-frozen-niagara",
        water_ph=7.1,
        calcium_carbonate_ppm=200.0,
        drip_rate_dpm=16.0,
    )
    res_caution = calculate_mineral_accretion(q_caution)
    assert res_caution.triage_status == "caution_low_saturation"
    assert "LOW CARBONATE SATURATION CAUTION" in res_caution.conservation_advisory

    # Critical desiccation / undersaturation: SI < 0.0 or drip_rate < 5.0
    q_critical = MineralAccretionQuery(
        site_id="lechuguilla-chandelier-room",
        water_ph=6.5,
        calcium_carbonate_ppm=150.0,
        drip_rate_dpm=3.0,
    )
    res_critical = calculate_mineral_accretion(q_critical)
    assert res_critical.triage_status == "critical_desiccation_halt_traffic"
    assert res_critical.rotation_state == "cementation_stagnation_risk"
    assert "CRITICAL SPELEOTHEM DESICCATION RISK" in res_critical.conservation_advisory

    # Invalid site raises ValueError
    with pytest.raises(ValueError, match="not found"):
        calculate_mineral_accretion(MineralAccretionQuery(site_id="unknown-cave"))


def test_speleothem_gear_checklist():
    """Verify 6 mandatory gear items in checklist."""
    gear = get_speleothem_gear_checklist()
    assert len(gear) == 6
    assert all(g.mandatory is True for g in gear)

    gear_ids = [g.item_id for g in gear]
    assert "uv-365nm-forensic-lamp" in gear_ids
    assert "digital-micro-caliper-laser" in gear_ids
    assert "waterproof-hydro-ph-ec-meter" in gear_ids
    assert "lint-free-nitrile-caver-gloves" in gear_ids
    assert "subterranean-acoustic-drip-counter" in gear_ids
    assert "sealed-pelican-specimen-case" in gear_ids

    for g in gear:
        assert isinstance(g, SpeleothemGearItem)
        assert g.name
        assert g.category
        assert g.purpose

    # Verify alias function get_cave_mineralogy_gear_checklist
    assert len(get_cave_mineralogy_gear_checklist()) == 6


def test_detect_cave_mineralogy_intent_positive():
    """Verify positive intent detection for site details, calculations, gear checklist, and sites list."""
    i1 = detect_cave_mineralogy_intent("Tell me about Carlsbad Caverns Rookery Nest cave pearls")
    assert i1 is not None
    assert i1.site_id == "carlsbad-rookery-chamber"
    assert i1.action == "site_detail"
    assert i1.speleothem_type == "cave_pearl_pisolith"

    i2 = detect_cave_mineralogy_intent("Lechuguilla Chandelier Room gypsum flowers microclimate")
    assert i2 is not None
    assert i2.site_id == "lechuguilla-chandelier-room"
    assert i2.action == "site_detail"

    i3 = detect_cave_mineralogy_intent("Calculate calcite saturation index and pool agitation joules")
    assert i3 is not None
    assert i3.action in ("calculate_accretion", "calculate")

    i4 = detect_cave_mineralogy_intent("What UV lamps and nitrile gloves do I need for speleothem survey?")
    assert i4 is not None
    assert i4.action in ("gear_checklist", "gear")

    i5 = detect_cave_mineralogy_intent("Organ Cave anthodite gallery radiating crystals")
    assert i5 is not None
    assert i5.site_id == "organ-cave-anthodite-gallery"
    assert i5.speleothem_type == "radiating_anthodite"

    i6 = detect_cave_mineralogy_intent("List iconic karst speleothem survey and cave pearl sites")
    assert i6 is not None
    assert i6.action == "sites_list"


def test_detect_cave_mineralogy_intent_exclusions():
    """Verify exclusions immediately return None."""
    exclusion_queries = [
        "Where is my order #12345 for cave pearl calipers?",
        "Can I get a refund on my UV lamp?",
        "I need a return label for my nitrile gloves",
        "Shipping tracking for drip sensor",
        "Pack burro expedition to cave entrance",
        "Horse trail riding near Carlsbad",
        "Pack goat gear for speleothem survey",
        "Dogsledding in winter near Bighorn mountains",
        "Primitive trapping permits near karst sinkholes",
        "Gold pan creek prospecting near Organ Cave",
        "Beachcombing shells along Florida springs",
        "Fire lookout tower near Guadalupe Mountains",
        "Snowshoe trails near Blanchard Springs",
        "Sandboarding dunes near Carlsbad",
        "Cave diving siphon exploration at Peacock Springs",
        "Sump diving in Lost Creek",
        "Alpine caving single rope technique SRT Fantastic Pit",
        "Vertical caving harness rental",
        "Kayak rental near Mammoth Cave",
    ]
    for q in exclusion_queries:
        assert detect_cave_mineralogy_intent(q) is None, f"Expected None for: {q}"


def test_format_cave_mineralogy_response():
    """Verify response formatting for calculate, gear, detail, and list actions."""
    # Calculate
    calc_intent = CaveMineralogyIntent(
        action="calculate_accretion", site_id="carlsbad-rookery-chamber"
    )
    resp_calc = format_cave_mineralogy_response(calc_intent)
    assert isinstance(resp_calc, FormattedCaveMineralogyResponse)
    assert "cave_mineralogy_info" in resp_calc._data
    assert resp_calc._data["cave_mineralogy_info"]["action"] in (
        "calculate_accretion",
        "calculate",
    )
    assert "saturation index" in str(resp_calc).lower() or "accretion" in str(resp_calc).lower()

    # Gear
    gear_intent = CaveMineralogyIntent(action="gear_checklist")
    resp_gear = format_cave_mineralogy_response(gear_intent)
    assert isinstance(resp_gear, FormattedCaveMineralogyResponse)
    assert resp_gear._data["cave_mineralogy_info"]["action"] == "gear_checklist"
    assert len(resp_gear._data["cave_mineralogy_info"]["gear"]) == 6

    # Detail
    detail_intent = CaveMineralogyIntent(
        action="site_detail", site_id="organ-cave-anthodite-gallery"
    )
    resp_detail = format_cave_mineralogy_response(detail_intent)
    assert isinstance(resp_detail, FormattedCaveMineralogyResponse)
    assert resp_detail._data["cave_mineralogy_info"]["action"] == "site_detail"
    assert "Anthodite" in str(resp_detail) or "Organ Cave" in str(resp_detail)

    # List
    list_intent = CaveMineralogyIntent(action="sites_list")
    resp_list = format_cave_mineralogy_response(list_intent)
    assert isinstance(resp_list, FormattedCaveMineralogyResponse)
    assert resp_list._data["cave_mineralogy_info"]["action"] == "sites_list"
    assert len(resp_list._data["cave_mineralogy_info"]["sites"]) == 5


def test_formatted_cave_mineralogy_response_dict_methods():
    """Test get, keys, values, items, in operators on FormattedCaveMineralogyResponse."""
    resp = FormattedCaveMineralogyResponse(
        "Accretion rate ~16 um/yr", {"key1": "val1", "answer": "Accretion rate ~16 um/yr"}
    )
    assert resp.get("key1") == "val1"
    assert resp.get("missing", "default") == "default"
    assert resp["key1"] == "val1"
    assert "key1" in resp
    assert "nonexistent" not in resp
    assert list(resp.keys()) == ["key1", "answer"]
    assert "val1" in list(resp.values())
    assert ("key1", "val1") in list(resp.items())


def test_build_cave_mineralogy_prompt():
    """Test prompt building with and without site focus."""
    p_generic = build_cave_mineralogy_prompt()
    assert "Wilderness Caving Cave Pearl Karst Mineralogy" in p_generic
    assert "Calcite Saturation Index" in p_generic

    intent_site = CaveMineralogyIntent(
        action="site_detail", site_id="carlsbad-rookery-chamber"
    )
    p_site = build_cave_mineralogy_prompt(intent_site)
    assert "Rookery Nest" in p_site or "Carlsbad" in p_site


def test_handle_cave_mineralogy_intent():
    """Test chat cascade handler."""
    res = handle_cave_mineralogy_intent(
        "What is the calcite saturation index for cave pearls at Carlsbad Rookery Chamber?"
    )
    assert res is not None
    assert "cave_mineralogy_info" in res
    assert "answer" in res

    assert handle_cave_mineralogy_intent("Where is my order #5555?") is None


@pytest.mark.anyio
async def test_generate_cave_mineralogy_stream_events():
    """Test stream event generation for lookup, calculation, and non-intent queries."""
    # Calculation
    calc_events = []
    async for chunk in generate_cave_mineralogy_stream_events(
        "Calculate calcite saturation index and pool agitation for cave pearls"
    ):
        calc_events.append(chunk)

    assert len(calc_events) > 0
    full_calc = "".join(calc_events)
    assert "cave_mineralogy_calculated" in full_calc
    assert "data: [DONE]" in full_calc

    # Lookup
    lookup_events = []
    async for chunk in generate_cave_mineralogy_stream_events(
        "Tell me about Carlsbad Caverns Rookery Nest cave pearls details"
    ):
        lookup_events.append(chunk)

    assert len(lookup_events) > 0
    full_lookup = "".join(lookup_events)
    assert "cave_mineralogy_lookup" in full_lookup

    # Exclusion
    none_events = []
    async for chunk in generate_cave_mineralogy_stream_events("Where is my order #999?"):
        none_events.append(chunk)
    assert len(none_events) == 0


def test_cave_mineralogy_tool():
    """Test tool function for calculate, gear, site_detail, and sites_list."""
    t_calc = cave_mineralogy_tool(action="calculate")
    assert "cave_mineralogy_info" in t_calc
    assert t_calc["cave_mineralogy_info"]["action"] in ("calculate_accretion", "calculate")

    t_gear = cave_mineralogy_tool(action="gear")
    assert "cave_mineralogy_info" in t_gear
    assert t_gear["cave_mineralogy_info"]["action"] == "gear_checklist"

    t_detail = cave_mineralogy_tool(
        action="site_detail", site_id="blanchard-springs-coral-grotto"
    )
    assert "cave_mineralogy_info" in t_detail
    assert t_detail["cave_mineralogy_info"]["site_id"] == "blanchard-springs-coral-grotto"

    t_list = cave_mineralogy_tool()
    assert "cave_mineralogy_info" in t_list
    assert t_list["cave_mineralogy_info"]["action"] == "sites_list"


def test_cave_mineralogy_model_properties_and_aliases():
    """Verify camelCase property and alias handling across all models."""
    site = get_cave_mineralogy_site("carlsbad-rookery-chamber")
    assert site is not None
    assert site.maxDepthMeters == 250
    assert site.ambientTempC == 13.5
    assert site.humidityPercent == 98
    assert site.speleothemType == "cave_pearl_pisolith"
    assert site.hostRock == "permian_evaporite_gypsum"
    assert site.conservationStatus == "pristine_active_growth"

    # Test camelCase input aliases
    site_camel = CaveMineralogySite(
        id="test-cave",
        title="Test Cave",
        region="Test Region",
        system="Test Karst",
        maxDepthMeters=100,
        ambientTempC=10.0,
        humidityPercent=90,
        speleothemType="cave_pearl_pisolith",
        hostRock="mississippian_limestone",
        conservationStatus="pristine_active_growth",
        description="Test desc",
    )
    assert site_camel.name == "Test Cave"
    assert site_camel.max_depth_m == 100
    assert site_camel.ambient_temp_c == 10.0

    # Query camelCase
    q_camel = MineralAccretionQuery(
        siteId="carlsbad-rookery-chamber",
        speleothemType="cave_pearl_pisolith",
        dripRateDpm=30.0,
        waterPh=7.5,
        calciumCarbonatePpm=250.0,
        surveyHours=5.0,
    )
    assert q_camel.site_id == "carlsbad-rookery-chamber"
    assert q_camel.drip_rate_dpm == 30.0

    # Result properties
    res = calculate_mineral_accretion(q_camel)
    assert res.siteTitle == res.site_title
    assert res.calciteSaturationIndex == res.calcite_saturation_index
    assert res.poolAgitationJoulesPerHour == res.pool_agitation_joules_per_hour
    assert res.rotationState == res.rotation_state
    assert res.estimatedAccretionMicronsPerYear == res.estimated_accretion_microns_per_year
    assert res.triageStatus == res.triage_status
    assert res.conservationAdvisory == res.conservation_advisory
    assert res.monitoringProtocol == res.monitoring_protocol

    # Gear alias
    gear_alias = SpeleothemGearItem(
        itemId="test-item",
        name="Test Item",
        category="test",
        purpose="Testing purposes",
    )
    assert gear_alias.id == "test-item"
    assert gear_alias.description == "Testing purposes"

    # Formatted response with dict payload
    dict_payload = {"cave_mineralogy_info": {"test": True}, "answer": "Telemetry answer"}
    formatted_from_dict = format_cave_mineralogy_response("default", dict_payload)
    assert str(formatted_from_dict) == "Telemetry answer"

    # Formatted response with query string
    formatted_cm_str = format_cave_mineralogy_response(
        "cave_mineralogy", "Carlsbad Caverns Rookery Nest cave pearls details"
    )
    assert formatted_cm_str._data["cave_mineralogy_info"]["action"] == "site_detail"

    # Formatted response with calculate and query object
    formatted_calc_q = format_cave_mineralogy_response("calculate_accretion", q_camel)
    assert formatted_calc_q._data["cave_mineralogy_info"]["action"] == "calculate_accretion"

    # Prompt with string site
    prompt_str = build_cave_mineralogy_prompt("organ-cave-anthodite-gallery")
    assert "Organ Cave" in prompt_str
