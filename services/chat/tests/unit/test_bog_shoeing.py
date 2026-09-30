import pytest
from contoso_chat.bog_shoeing import (
    BogFlotationQuery,
    BogFlotationResult,
    BogGearItem,
    BogShoeingIntent,
    BogShoeingSite,
    FormattedBogShoeingResponse,
    bog_shoeing_tool,
    build_bog_shoeing_prompt,
    calculate_bog_flotation,
    detect_bog_shoeing_intent,
    extract_bog_shoeing_intent,
    format_bog_shoeing_response,
    get_bog_gear_checklist,
    get_bog_shoeing_site,
    get_bog_shoeing_sites,
)
from contoso_chat.chat import handle_bog_shoeing_intent
from contoso_chat.mudflat_trekking import detect_mudflat_intent
from contoso_chat.snowshoe_mountaineering import detect_snowshoe_intent
from contoso_chat.stream import generate_bog_shoeing_stream_events


def test_bog_shoeing_sites_catalog():
    """Verify catalog returns 5 iconic wilderness peatland routes."""
    sites = get_bog_shoeing_sites()
    assert len(sites) == 5
    site_ids = [s.id for s in sites]
    assert "great-dismal-swamp-quaking-mat" in site_ids
    assert "boundary-waters-spruce-muskeg" in site_ids
    assert "kenai-peninsula-patterned-fen" in site_ids
    assert "adirondack-spring-mire-basin" in site_ids
    assert "algonquin-highland-tussock-fen" in site_ids

    for s in sites:
        assert isinstance(s, BogShoeingSite)
        assert s.site_id == s.id
        assert s.name
        assert s.title == s.name
        assert s.region
        assert s.system
        assert s.peat_depth_m > 0
        assert s.peatDepthM == s.peat_depth_m
        assert s.water_saturation in (
            "drained_moss_crust",
            "seasonally_flooded",
            "fully_saturated_superficial_water",
        )
        assert s.terrain in (
            "quaking_sphagnum_mat",
            "boreal_black_spruce_muskeg",
            "patterned_fen_flark",
            "open_peat_mire",
            "floating_bog_tussock",
        )
        assert s.primary_shoe in (
            "wide_oval_sphagnum_glider",
            "asymmetric_willow_bearpaw",
            "composite_mud_flotation_deck",
        )
        assert len(s.highlights) >= 3


def test_bog_shoeing_sites_filtering():
    """Verify filtering by terrain and saturation."""
    mat_sites = get_bog_shoeing_sites(terrain="quaking_sphagnum_mat")
    assert len(mat_sites) == 1
    assert mat_sites[0].id == "great-dismal-swamp-quaking-mat"

    muskeg_sites = get_bog_shoeing_sites(terrain="boreal_black_spruce_muskeg")
    assert len(muskeg_sites) == 1
    assert muskeg_sites[0].id == "boundary-waters-spruce-muskeg"

    flark_sites = get_bog_shoeing_sites(terrain="patterned_fen_flark")
    assert len(flark_sites) == 1
    assert flark_sites[0].id == "kenai-peninsula-patterned-fen"

    mire_sites = get_bog_shoeing_sites(terrain="open_peat_mire")
    assert len(mire_sites) == 1
    assert mire_sites[0].id == "adirondack-spring-mire-basin"

    tussock_sites = get_bog_shoeing_sites(terrain="floating_bog_tussock")
    assert len(tussock_sites) == 1
    assert tussock_sites[0].id == "algonquin-highland-tussock-fen"

    seasonal_sites = get_bog_shoeing_sites(saturation="seasonally_flooded")
    assert len(seasonal_sites) == 2
    seasonal_ids = [s.id for s in seasonal_sites]
    assert "boundary-waters-spruce-muskeg" in seasonal_ids
    assert "adirondack-spring-mire-basin" in seasonal_ids

    saturated_sites = get_bog_shoeing_sites(
        saturation="fully_saturated_superficial_water"
    )
    assert len(saturated_sites) == 3


def test_get_bog_shoeing_site_lookup():
    """Verify single site lookup and 404/None behavior."""
    site = get_bog_shoeing_site("great-dismal-swamp-quaking-mat")
    assert site is not None
    assert site.id == "great-dismal-swamp-quaking-mat"
    assert "Great Dismal" in site.name
    assert site.peat_depth_m == 4.5
    assert site.water_table_cm == -5.0
    assert site.primary_shoe == "wide_oval_sphagnum_glider"
    assert site.siteId == site.id
    assert site.peatDepthM == 4.5
    assert site.waterTableCm == -5.0
    assert site.waterSaturation == "fully_saturated_superficial_water"
    assert site.primaryShoe == "wide_oval_sphagnum_glider"

    # Case insensitive
    assert get_bog_shoeing_site("GREAT-DISMAL-SWAMP-QUAKING-MAT") is not None
    assert get_bog_shoeing_site("nonexistent-bog-mire") is None


def test_calculate_bog_flotation_defaults():
    """Verify flotation calculations with defaults and aliases."""
    query = BogFlotationQuery(
        site_id="great-dismal-swamp-quaking-mat",
        user_weight_kg=75.0,
        payload_kg=85.0,
    )
    result = calculate_bog_flotation(query)
    assert isinstance(result, BogFlotationResult)
    assert result.site_id == "great-dismal-swamp-quaking-mat"
    assert "Great Dismal" in result.site_name
    assert result.siteTitle == result.site_name
    assert result.terrain == "quaking_sphagnum_mat"
    assert result.shoe_type == "wide_oval_sphagnum_glider"
    assert result.ground_pressure_kpa > 0.0
    assert result.groundPressureKpa == result.ground_pressure_kpa
    assert result.sinking_depth_cm > 0.0
    assert result.sinkingDepthCm == result.sinking_depth_cm
    assert result.flotation_index > 0.0
    assert result.flotationIndex == result.flotation_index
    assert result.sinking_hazard in (
        "firm_hummock_support",
        "moderate_saturated_slump",
        "critical_quaking_mire_submersion",
    )
    assert result.sinkingHazard == result.sinking_hazard
    assert result.water_saturation == "fully_saturated_superficial_water"
    assert result.waterSaturation == result.water_saturation
    assert len(result.recommended_pacing) > 0
    assert len(result.safety_advisory) > 0
    assert len(result.rescue_protocol) > 0


def test_calculate_bog_flotation_hazard_levels():
    """Verify critical hazard vs firm support calculations."""
    # High payload on quaking sphagnum mat -> critical submersion
    crit_query = BogFlotationQuery(
        site_id="great-dismal-swamp-quaking-mat",
        payload_kg=110.0,
        terrain="quaking_sphagnum_mat",
        water_saturation="fully_saturated_superficial_water",
    )
    crit_res = calculate_bog_flotation(crit_query)
    assert crit_res.sinking_hazard == "critical_quaking_mire_submersion"
    assert "CRITICAL MIRE SUBMERSION" in crit_res.safety_advisory

    # Light payload with drained crust on black spruce muskeg -> firm support
    firm_query = BogFlotationQuery(
        site_id="boundary-waters-spruce-muskeg",
        payload_kg=55.0,
        terrain="boreal_black_spruce_muskeg",
        water_saturation="drained_moss_crust",
    )
    firm_res = calculate_bog_flotation(firm_query)
    assert firm_res.sinking_hazard == "firm_hummock_support"
    assert "OPTIMAL MOSS FLOTATION" in firm_res.safety_advisory

    # Unknown site should raise ValueError
    with pytest.raises(ValueError, match="not found"):
        calculate_bog_flotation(BogFlotationQuery(site_id="unknown-abyss"))


def test_get_bog_gear_checklist():
    """Verify 6 mandatory gear items for peatland navigation."""
    gear = get_bog_gear_checklist()
    assert len(gear) == 6
    assert all(g.mandatory is True for g in gear)
    gear_ids = [g.id for g in gear]
    assert "sphagnum-glider-bog-shoes" in gear_ids
    assert "carbon-peat-sounding-pole" in gear_ids
    assert "breathable-bog-waders" in gear_ids
    assert "floating-peatland-gps-compass" in gear_ids
    assert "self-rescue-extraction-awls" in gear_ids
    assert "peatland-distress-whistle-strobe" in gear_ids

    for g in gear:
        assert isinstance(g, BogGearItem)
        assert g.item_id == g.id
        assert g.name
        assert g.category
        assert g.purpose == g.description


def test_detect_bog_shoeing_intent():
    """Verify intent detection on positive keywords and exclusions."""
    # Positives
    assert detect_bog_shoeing_intent("How do I choose bog shoeing gear?") is True
    assert detect_bog_shoeing_intent("What bog shoe flotation is needed?") is True
    assert detect_bog_shoeing_intent("Tell me about muskeg navigation in Minnesota") is True
    assert detect_bog_shoeing_intent("Crossing a boreal peatland") is True
    assert detect_bog_shoeing_intent("Traversing a quaking bog mat") is True
    assert detect_bog_shoeing_intent("Walking on a sphagnum mat") is True
    assert detect_bog_shoeing_intent("How deep is the peat mire?") is True
    assert detect_bog_shoeing_intent("Navigating a patterned fen flark") is True
    assert detect_bog_shoeing_intent("Do I need breathable bog waders?") is True
    assert detect_bog_shoeing_intent("Using a carbon peat sounding pole") is True
    assert detect_bog_shoeing_intent("Great Dismal Sphagnum Quake Corridor") is True

    # Empty
    assert detect_bog_shoeing_intent("") is False
    assert detect_bog_shoeing_intent("   ") is False

    # Exclusions
    assert detect_bog_shoeing_intent("Check my order #1234 bog shoe") is False
    assert detect_bog_shoeing_intent("Can I get a refund for my muskeg trip?") is False
    assert detect_bog_shoeing_intent("Where is my return label for peatland waders?") is False
    assert detect_bog_shoeing_intent("Track shipping tracking for bog shoes") is False
    assert detect_bog_shoeing_intent("Pack burro muskeg trekking") is False
    assert detect_bog_shoeing_intent("Pack goat peatland hiking") is False
    assert detect_bog_shoeing_intent("Dogsledding near muskeg") is False
    assert detect_bog_shoeing_intent("Primitive trapping in the bog") is False
    assert detect_bog_shoeing_intent("Gold panning in peatland stream") is False
    assert detect_bog_shoeing_intent("Beachcombing near coastal bog") is False
    assert detect_bog_shoeing_intent("Fire lookout overlooking peat mire") is False
    assert detect_bog_shoeing_intent("Sandboarding vs bog shoeing") is False
    assert detect_bog_shoeing_intent("Cave diving in peat sump") is False
    assert detect_bog_shoeing_intent("Caving speleothem cave pearl survey") is False
    assert detect_bog_shoeing_intent("Ski touring across frozen peatland") is False
    assert detect_bog_shoeing_intent("Falconry hunting over muskeg") is False
    assert detect_bog_shoeing_intent("Pack llama peatland trek") is False
    assert detect_bog_shoeing_intent("Zipline over quaking bog") is False
    assert detect_bog_shoeing_intent("Turtle patrol on bog shores") is False
    assert detect_bog_shoeing_intent("Night via ferrata over peat canyon") is False
    assert detect_bog_shoeing_intent("Canyon bouldering near muskeg") is False
    assert detect_bog_shoeing_intent("Mudflat trekking vs bog shoeing") is False
    assert detect_bog_shoeing_intent("Weather station in peatland") is False
    assert detect_bog_shoeing_intent("Smoke advisory in peatland fire") is False
    assert detect_bog_shoeing_intent("Bog shoe rentals near me") is False


def test_extract_bog_shoeing_intent():
    """Verify intent parsing and action classification."""
    calc_intent = extract_bog_shoeing_intent(
        "Calculate flotation and ground pressure for Great Dismal"
    )
    assert calc_intent.action == "calculate"
    assert calc_intent.site_id == "great-dismal-swamp-quaking-mat"

    gear_intent = extract_bog_shoeing_intent(
        "What is the mandatory gear checklist for bog shoeing?"
    )
    assert gear_intent.action == "gear"

    detail_intent = extract_bog_shoeing_intent(
        "Tell me details about Boundary Waters Black Spruce Muskeg Traverse"
    )
    assert detail_intent.action == "site_detail"
    assert detail_intent.site_id == "boundary-waters-spruce-muskeg"

    list_intent = extract_bog_shoeing_intent(
        "List all peatland bog shoeing catalog routes"
    )
    assert list_intent.action == "sites_list"


def test_format_bog_shoeing_response():
    """Verify typed response formatting and dict-like behaviors."""
    # Calculate response
    calc_res = format_bog_shoeing_response("calculate", "great-dismal-swamp-quaking-mat")
    assert isinstance(calc_res, FormattedBogShoeingResponse)
    assert "Telemetry" in str(calc_res)
    assert "bog_shoeing_info" in calc_res
    assert calc_res.get("bog_shoeing_info")["action"] == "calculate"
    assert "calculation" in calc_res["bog_shoeing_info"]
    assert "flotation_index" in calc_res["bog_shoeing_info"]

    # Gear response
    gear_res = format_bog_shoeing_response("gear")
    assert "Checklist" in str(gear_res)
    assert gear_res["bog_shoeing_info"]["action"] == "gear"
    assert len(gear_res["bog_shoeing_info"]["gear"]) == 6
    assert gear_res["bog_shoeing_info"]["mandatory_count"] == 6

    # Detail response
    detail_res = format_bog_shoeing_response(
        "site_detail", "kenai-peninsula-patterned-fen"
    )
    assert "Kenai Peninsula" in str(detail_res)
    assert detail_res["bog_shoeing_info"]["action"] == "site_detail"
    assert detail_res["bog_shoeing_info"]["site_id"] == "kenai-peninsula-patterned-fen"

    # Sites list response
    list_res = format_bog_shoeing_response("sites_list")
    assert "Catalog" in str(list_res)
    assert list_res["bog_shoeing_info"]["action"] == "sites_list"
    assert len(list_res["bog_shoeing_info"]["sites"]) == 5

    # Dict compatibility methods
    assert list(list_res.keys())
    assert list(list_res.values())
    assert list(list_res.items())
    assert "bog_shoeing_info" in list_res


def test_build_bog_shoeing_prompt():
    """Verify system prompt building."""
    prompt_gen = build_bog_shoeing_prompt()
    assert "Wilderness Boreal Peatland Bog-Shoeing" in prompt_gen
    assert "Wide-Deck Flotation Engineering" in prompt_gen

    prompt_site = build_bog_shoeing_prompt("Great Dismal Sphagnum Quake Corridor")
    assert "Great Dismal Sphagnum Quake Corridor" in prompt_site
    assert "quaking_sphagnum_mat" in prompt_site


def test_bog_shoeing_tool():
    """Verify bog shoeing tool execution across actions."""
    # Calculation
    calc_out = bog_shoeing_tool(action="calculate", site_id="great-dismal-swamp-quaking-mat")
    assert isinstance(calc_out, dict)
    assert "bog_shoeing_info" in calc_out
    assert calc_out["bog_shoeing_info"]["action"] == "calculate"

    # Gear
    gear_out = bog_shoeing_tool(action="gear")
    assert gear_out["bog_shoeing_info"]["action"] == "gear"
    assert len(gear_out["bog_shoeing_info"]["gear"]) == 6

    # Site detail
    detail_out = bog_shoeing_tool(
        action="site_detail", site_id="boundary-waters-spruce-muskeg"
    )
    assert detail_out["bog_shoeing_info"]["action"] == "site_detail"
    assert detail_out["bog_shoeing_info"]["site_id"] == "boundary-waters-spruce-muskeg"

    # Catalog
    list_out = bog_shoeing_tool(action="sites_list")
    assert list_out["bog_shoeing_info"]["action"] == "sites_list"
    assert len(list_out["bog_shoeing_info"]["sites"]) == 5


def test_handle_bog_shoeing_intent():
    """Verify cascade handler in contoso_chat.chat."""
    res = handle_bog_shoeing_intent(
        "Tell me about Great Dismal Sphagnum Quake Corridor bog shoeing"
    )
    assert res is not None
    assert "bog_shoeing_info" in res
    assert "answer" in res

    none_res = handle_bog_shoeing_intent("Where can I rent a snowshoe?")
    assert none_res is None


@pytest.mark.anyio
async def test_generate_bog_shoeing_stream_events():
    """Verify SSE event generator in contoso_chat.stream."""
    events = []
    async for chunk in generate_bog_shoeing_stream_events(
        "Calculate bog flotation on quaking sphagnum mat"
    ):
        events.append(chunk)

    assert len(events) > 0
    assert any("bog_shoeing_calculated" in e for e in events)
    assert any("data: [DONE]" in e for e in events)


def test_snowshoe_and_mudflat_bog_exclusions():
    """Verify that snowshoe and mudflat intent detectors ignore bog shoeing queries."""
    # Snowshoe intent should NOT trigger on bog shoeing
    assert detect_snowshoe_intent("What is the best bog shoe for quaking peat?") is None
    assert detect_snowshoe_intent("Crossing muskeg terrain on bog-shoes") is None
    assert detect_snowshoe_intent("Navigating peatland with wide deck shoes") is None
    assert detect_snowshoe_intent("Sphagnum mat traversal techniques") is None
    assert detect_snowshoe_intent("Walking on quaking bog moss") is None

    # Mudflat intent should NOT trigger on bog shoeing
    assert detect_mudflat_intent("What is the best bog shoe for quaking peat?") is None
    assert detect_mudflat_intent("Muskeg navigation equipment") is None
    assert detect_mudflat_intent("Peatland exploration and waders") is None
    assert detect_mudflat_intent("Sphagnum moss buoyancy calculation") is None
    assert detect_mudflat_intent("Quaking bog flotation and safety") is None


def test_bog_shoeing_aliases_and_formatting_edge_cases():
    """Verify camelCase alias parsing, edge cases, and direct model formatting."""
    # BogShoeingSite camelCase
    site_data = {
        "siteId": "custom-bog",
        "title": "Custom Bog Corridor",
        "peatDepthM": 4.0,
        "waterTableCm": -8.0,
        "waterSaturation": "seasonally_flooded",
        "primaryShoe": "wide_oval_sphagnum_glider",
    }
    site = BogShoeingSite.model_validate(site_data)
    assert site.id == "custom-bog"
    assert site.name == "Custom Bog Corridor"
    assert site.peat_depth_m == 4.0
    assert site.water_table_cm == -8.0
    assert site.primary_shoe == "wide_oval_sphagnum_glider"

    # BogGearItem alias
    gear = BogGearItem.model_validate({
        "itemId": "gear-1",
        "name": "Custom Awl",
        "category": "emergency_rescue",
        "description": "Custom purpose description",
    })
    assert gear.id == "gear-1"
    assert gear.purpose == "Custom purpose description"

    gear2 = BogGearItem.model_validate({
        "id": "gear-2",
        "purpose": "Purpose directly",
    })
    assert gear2.item_id == "gear-2"
    assert gear2.description == "Purpose directly"

    # BogFlotationQuery alias
    q = BogFlotationQuery.model_validate({
        "siteId": "great-dismal-swamp-quaking-mat",
        "userWeightKg": 82.0,
        "shoeType": "composite_mud_flotation_deck",
        "waterSaturation": "seasonally_flooded",
        "strideRateSpm": 65.0,
    })
    assert q.site_id == "great-dismal-swamp-quaking-mat"
    assert q.payload_kg == 92.0
    assert q.shoe_type == "composite_mud_flotation_deck"

    q2 = BogFlotationQuery.model_validate({
        "siteId": "great-dismal-swamp-quaking-mat",
        "payloadKg": 95.0,
    })
    assert q2.user_weight_kg == 85.0

    # BogFlotationResult alias
    res_data = {
        "siteId": "great-dismal-swamp-quaking-mat",
        "siteTitle": "Great Dismal Quake",
        "shoeType": "wide_oval_sphagnum_glider",
        "flotationIndex": 8.5,
        "groundPressureKpa": 1.6,
        "sinkingDepthCm": 5.5,
        "sinkingHazard": "firm_hummock_support",
        "waterSaturation": "seasonally_flooded",
        "recommendedPacing": "rhythmic glide",
        "safetyAdvisory": "optimal flotation",
        "rescueProtocol": "standard self-arrest",
    }
    r = BogFlotationResult.model_validate(res_data)
    assert r.site_id == "great-dismal-swamp-quaking-mat"
    assert r.site_name == "Great Dismal Quake"
    assert r.shoe_type == "wide_oval_sphagnum_glider"
    assert r.flotation_index == 8.5
    assert r.ground_pressure_kpa == 1.6
    assert r.sinking_depth_cm == 5.5
    assert r.sinking_hazard == "firm_hummock_support"

    # format_bog_shoeing_response with dict payload
    dict_payload = {
        "bog_shoeing_info": {"action": "custom"},
        "answer": "Custom formatted answer",
    }
    f_dict = format_bog_shoeing_response("bog_shoeing", dict_payload)
    assert str(f_dict) == "Custom formatted answer"

    # format_bog_shoeing_response with BogShoeingIntent
    intent = BogShoeingIntent(action="calculate", site_id="great-dismal-swamp-quaking-mat")
    f_intent = format_bog_shoeing_response(intent, q)
    assert "Telemetry" in str(f_intent)

    # format_bog_shoeing_response with site object
    f_site = format_bog_shoeing_response(
        BogShoeingIntent(action="site_detail", site_id="great-dismal-swamp-quaking-mat"),
        site,
    )
    assert "Route" in str(f_site)

    # format_bog_shoeing_response with gear list
    f_gear = format_bog_shoeing_response("gear", [gear])
    assert "Checklist" in str(f_gear)
    assert f_gear["bog_shoeing_info"]["mandatory_count"] == 1
