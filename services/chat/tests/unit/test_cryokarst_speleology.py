import pytest
from contoso_chat.caving import detect_caving_intent
from contoso_chat.chat import handle_cryokarst_speleology_intent
from contoso_chat.cryokarst_speleology import (
    CryokarstAnchorSystem,
    CryokarstConduitType,
    CryokarstDynamicsQuery,
    CryokarstDynamicsResult,
    CryokarstGearItem,
    CryokarstSafetyTriage,
    CryokarstSite,
    CryokarstSpeleologyIntent,
    FormattedCryokarstSpeleologyResponse,
    IceStabilityClass,
    MeltwaterFlowState,
    build_cryokarst_speleology_prompt,
    calculate_cryokarst_dynamics,
    cryokarst_speleology_tool,
    detect_cryokarst_speleology_intent,
    extract_cryokarst_speleology_intent,
    format_cryokarst_speleology_response,
    get_cryokarst_gear,
    get_cryokarst_site,
    get_cryokarst_sites,
)
from contoso_chat.glacier_navigation import detect_glacier_intent
from contoso_chat.stream import generate_cryokarst_speleology_stream_events


def test_cryokarst_speleology_enums():
    # CryokarstConduitType
    assert CryokarstConduitType.VERTICAL_MOULIN_SHAFT == "vertical_moulin_shaft"
    assert CryokarstConduitType.HORIZONTAL_SUBGLACIAL_TUNNEL == "horizontal_subglacial_tunnel"
    assert CryokarstConduitType.BERGSCHRUND_FRACTURE_CLEFT == "bergschrund_fracture_cleft"
    assert CryokarstConduitType.ICE_SIPHON_SUMP_CAVE == "ice_siphon_sump_cave"
    assert CryokarstConduitType.VOLCANIC_FUMAROLE_MELT_CAVE == "volcanic_fumarole_melt_cave"

    # IceStabilityClass
    assert IceStabilityClass.COLD_POLAR_STABLE == "cold_polar_stable"
    assert IceStabilityClass.TEMPERATE_FIRN_DYNAMIC == "temperate_firn_dynamic"
    assert IceStabilityClass.THERMAL_ABLATION_UNSTABLE == "thermal_ablation_unstable"

    # MeltwaterFlowState
    assert MeltwaterFlowState.BONE_DRY_WINTER_DORMANT == "bone_dry_winter_dormant"
    assert MeltwaterFlowState.LOW_TRICKLE_FROZEN == "low_trickle_frozen"
    assert MeltwaterFlowState.MODERATE_SUBGLACIAL_STREAM == "moderate_subglacial_stream"
    assert MeltwaterFlowState.HIGH_RISK_DIURNAL_SURGE == "high_risk_diurnal_surge"
    assert MeltwaterFlowState.CONTINUOUS_THERMAL_DRIP == "continuous_thermal_drip"

    # CryokarstAnchorSystem
    assert CryokarstAnchorSystem.STANDARD_17CM == "standard_17cm"
    assert CryokarstAnchorSystem.LONG_21CM == "long_21cm"
    assert CryokarstAnchorSystem.V_THREAD_ABALAKOV == "v_thread_abalakov"

    # CryokarstSafetyTriage
    assert CryokarstSafetyTriage.NOMINAL_STABLE_COLD_ICE == "nominal_stable_cold_ice"
    assert CryokarstSafetyTriage.CAUTION_DIURNAL_MELT_MONITORING == "caution_diurnal_melt_monitoring"
    assert CryokarstSafetyTriage.CRITICAL_ABLATION_COLLAPSE_DANGER == "critical_ablation_collapse_danger"


def test_cryokarst_site_model_and_aliases():
    site_data = {
        "siteId": "matanuska-glacier-moulin-chamber",
        "title": "Matanuska Glacier Deep Moulin Chamber",
        "region": "Palmer, Alaska",
        "range": "Chugach Mountains",
        "depthMeters": 65,
        "conduitType": "vertical_moulin_shaft",
        "iceStabilityClass": "cold_polar_stable",
        "meltwaterFlowState": "low_trickle_frozen",
        "description": "Sheer cylindrical vertical shaft.",
        "highlights": ["65m vertical rappel"],
    }
    site = CryokarstSite.model_validate(site_data)
    assert site.id == "matanuska-glacier-moulin-chamber"
    assert site.siteId == "matanuska-glacier-moulin-chamber"
    assert site.name == "Matanuska Glacier Deep Moulin Chamber"
    assert site.depth_meters == 65
    assert site.depthMeters == 65
    assert site.conduit_type == "vertical_moulin_shaft"
    assert site.conduitType == "vertical_moulin_shaft"
    assert site.ice_stability_class == "cold_polar_stable"
    assert site.iceStabilityClass == "cold_polar_stable"
    assert site.meltwater_flow_state == "low_trickle_frozen"
    assert site.meltwaterFlowState == "low_trickle_frozen"


def test_cryokarst_dynamics_query_and_result_aliases():
    query_data = {
        "siteId": "matanuska-glacier-moulin-chamber",
        "conduitType": "vertical_moulin_shaft",
        "iceStability": "cold_polar_stable",
        "anchorSystem": "long_21cm",
        "ambientIceTempC": -6.0,
        "descentDepthMeters": 45.0,
        "diurnalSolarExposureHours": 4.0,
        "teamSize": 3,
    }
    query = CryokarstDynamicsQuery.model_validate(query_data)
    assert query.site_id == "matanuska-glacier-moulin-chamber"
    assert query.siteId == "matanuska-glacier-moulin-chamber"
    assert query.ambient_ice_temp_c == -6.0
    assert query.ambientIceTempC == -6.0
    assert query.descent_depth_meters == 45.0
    assert query.descentDepthMeters == 45.0
    assert query.diurnal_solar_exposure_hours == 4.0
    assert query.diurnalSolarExposureHours == 4.0
    assert query.team_size == 3
    assert query.teamSize == 3

    result_data = {
        "siteTitle": "Matanuska Glacier Deep Moulin Chamber",
        "siteId": "matanuska-glacier-moulin-chamber",
        "anchorCreepRateMmHr": 1.5,
        "thermalAblationVelocityMmDay": 19.0,
        "jokulhlaupOutburstRiskIndex": 0.32,
        "safetyTriage": "nominal_stable_cold_ice",
        "anchorRiggingAdvisory": "Standard screws",
        "subglacialEscapeProtocol": "Egress corridor",
    }
    res = CryokarstDynamicsResult.model_validate(result_data)
    assert res.site_title == "Matanuska Glacier Deep Moulin Chamber"
    assert res.siteTitle == "Matanuska Glacier Deep Moulin Chamber"
    assert res.anchor_creep_rate_mm_hr == 1.5
    assert res.anchorCreepRateMmHr == 1.5
    assert res.thermal_ablation_velocity_mm_day == 19.0
    assert res.thermalAblationVelocityMmDay == 19.0
    assert res.jokulhlaup_outburst_risk_index == 0.32
    assert res.jokulhlaupOutburstRiskIndex == 0.32
    assert res.safety_triage == "nominal_stable_cold_ice"
    assert res.safetyTriage == "nominal_stable_cold_ice"


def test_cryokarst_gear_item_aliases():
    gear_data = {
        "itemId": "sub-zero-dry-caving-suit",
        "name": "Sub-Zero Thermal Suit",
        "category": "Thermal",
        "mandatory": True,
        "description": "Sealed waterproof suit.",
    }
    gear = CryokarstGearItem.model_validate(gear_data)
    assert gear.item_id == "sub-zero-dry-caving-suit"
    assert gear.itemId == "sub-zero-dry-caving-suit"
    assert gear.id == "sub-zero-dry-caving-suit"
    assert gear.description == "Sealed waterproof suit."
    assert gear.purpose == "Sealed waterproof suit."


def test_cryokarst_speleology_intent_model():
    intent = CryokarstSpeleologyIntent(
        action="calculate",
        site_id="matanuska-glacier-moulin-chamber",
        query="Calculate dynamics",
        conduit_type="vertical_moulin_shaft",
    )
    assert intent.action == "calculate"
    assert intent.site_id == "matanuska-glacier-moulin-chamber"
    assert intent.query == "Calculate dynamics"
    assert intent.conduit_type == "vertical_moulin_shaft"


def test_formatted_response_wrapper():
    resp = FormattedCryokarstSpeleologyResponse(
        "Ice cave answer",
        {"cryokarst_speleology_info": {"action": "catalog"}, "answer": "Ice cave answer"},
    )
    assert str(resp) == "Ice cave answer"
    assert resp.get("answer") == "Ice cave answer"
    assert resp["cryokarst_speleology_info"]["action"] == "catalog"
    assert "cryokarst_speleology_info" in resp
    assert "answer" in list(resp.keys())
    assert len(list(resp.values())) == 2
    assert len(list(resp.items())) == 2


def test_cryokarst_catalog_and_filtering():
    all_sites = get_cryokarst_sites()
    assert len(all_sites) == 5
    site_ids = [s.id for s in all_sites]
    assert "matanuska-glacier-moulin-chamber" in site_ids
    assert "root-glacier-cryokarst-conduit" in site_ids
    assert "athabasca-glacier-crevasse-chasm" in site_ids
    assert "gorner-glacier-zermatt-cryokarst" in site_ids
    assert "palmer-glacier-fumarole-ice-caves" in site_ids

    # Filter vertical moulin shaft
    moulins = get_cryokarst_sites(conduit_type="vertical_moulin_shaft")
    assert len(moulins) == 1
    assert moulins[0].id == "matanuska-glacier-moulin-chamber"

    # Filter horizontal subglacial tunnel
    tunnels = get_cryokarst_sites(conduit_type="horizontal_subglacial_tunnel")
    assert len(tunnels) == 1
    assert tunnels[0].id == "root-glacier-cryokarst-conduit"

    # Filter volcanic fumarole melt cave
    fumaroles = get_cryokarst_sites(conduit_type="volcanic_fumarole_melt_cave")
    assert len(fumaroles) == 1
    assert fumaroles[0].id == "palmer-glacier-fumarole-ice-caves"

    # Lookup single site
    mat = get_cryokarst_site("matanuska-glacier-moulin-chamber")
    assert mat is not None
    assert mat.depth_meters == 65
    assert len(mat.highlights) == 3

    # Unknown site
    assert get_cryokarst_site("non-existent-crevasse") is None


def test_cryokarst_gear_checklist():
    gear = get_cryokarst_gear()
    assert len(gear) == 6
    assert all(g.mandatory is True for g in gear)
    item_ids = [g.item_id for g in gear]
    assert "sub-zero-dry-caving-suit" in item_ids
    assert "dual-tube-stainless-ice-screws" in item_ids
    assert "abalakov-v-thread-hooker" in item_ids
    assert "subglacial-multi-gas-detector" in item_ids
    assert "watertight-submersible-headlamp" in item_ids
    assert "cryo-traction-ice-crampons" in item_ids


def test_cryokarst_dynamics_calculation_nominal():
    # Cold ice, short depth, low solar exposure -> nominal
    query = CryokarstDynamicsQuery(
        site_id="matanuska-glacier-moulin-chamber",
        conduit_type="vertical_moulin_shaft",
        ice_stability="cold_polar_stable",
        anchor_system="v_thread_abalakov",
        ambient_ice_temp_c=-14.0,  # temp_factor = max(0.2, (-14 + 16)/10) = 0.2
        descent_depth_meters=20.0,
        diurnal_solar_exposure_hours=1.0,
        team_size=3,
    )
    result = calculate_cryokarst_dynamics(query)
    # anchor_creep_rate_mm_hr = round(1.5 * 0.2 * 0.65 * 1.0, 1) = 0.2
    assert result.anchor_creep_rate_mm_hr == 0.2
    # thermal_ablation_velocity_mm_day = 5.0 + 1.0 * 3.5 = 8.5
    assert result.thermal_ablation_velocity_mm_day == 8.5
    # base_risk = (20/120)*0.4 + (1/12)*0.35 + 0.05 = 0.0667 + 0.0292 + 0.05 = 0.1459 -> 0.15
    assert result.jokulhlaup_outburst_risk_index < 0.40
    assert result.safety_triage == "nominal_stable_cold_ice"
    assert "NOMINAL" in result.anchor_rigging_advisory
    assert "STANDARD SPELEOLOGY" in result.subglacial_escape_protocol


def test_cryokarst_dynamics_calculation_caution():
    # Warm temperature or moderate risk
    query = CryokarstDynamicsQuery(
        site_id="root-glacier-cryokarst-conduit",
        conduit_type="horizontal_subglacial_tunnel",
        ice_stability="temperate_firn_dynamic",
        anchor_system="long_21cm",
        ambient_ice_temp_c=-0.5,  # > -1.0 triggers caution
        descent_depth_meters=30.0,
        diurnal_solar_exposure_hours=3.0,
        team_size=3,
    )
    result = calculate_cryokarst_dynamics(query)
    assert result.safety_triage == "caution_diurnal_melt_monitoring"
    assert "CAUTION" in result.anchor_rigging_advisory
    assert "DIURNAL MONITORING" in result.subglacial_escape_protocol


def test_cryokarst_dynamics_calculation_critical():
    # Unstable thermal ablation
    query = CryokarstDynamicsQuery(
        site_id="athabasca-glacier-crevasse-chasm",
        conduit_type="bergschrund_fracture_cleft",
        ice_stability="thermal_ablation_unstable",
        anchor_system="standard_17cm",
        ambient_ice_temp_c=-2.0,
        descent_depth_meters=85.0,
        diurnal_solar_exposure_hours=8.0,
        team_size=4,
    )
    result = calculate_cryokarst_dynamics(query)
    assert result.safety_triage == "critical_ablation_collapse_danger"
    assert result.thermal_ablation_velocity_mm_day > 30.0
    assert "CRITICAL HAZARD" in result.anchor_rigging_advisory
    assert "EMERGENCY RETREAT" in result.subglacial_escape_protocol


def test_cryokarst_dynamics_calculation_unknown_site():
    query = CryokarstDynamicsQuery(
        site_id="non-existent-glacier",
    )
    with pytest.raises(ValueError, match="not found"):
        calculate_cryokarst_dynamics(query)


def test_detect_cryokarst_speleology_intent():
    # Positive matches
    assert detect_cryokarst_speleology_intent("Tell me about Matanuska glacier moulin chamber") is True
    assert detect_cryokarst_speleology_intent("Cryokarst speleology dynamics calculation") is True
    assert detect_cryokarst_speleology_intent("What gear do I need for ice cave exploration?") is True
    assert detect_cryokarst_speleology_intent("Subglacial conduit tunnel exploration") is True
    assert detect_cryokarst_speleology_intent("Gorner glacier ice siphon sump cave details") is True
    assert detect_cryokarst_speleology_intent("Palmer glacier fumarole ice caves") is True
    assert detect_cryokarst_speleology_intent("Athabasca bergschrund crevasse chasm") is True
    assert detect_cryokarst_speleology_intent("Subglacial multi-gas detector for cryoconite moulin") is True

    # Empty / whitespace
    assert detect_cryokarst_speleology_intent("") is False
    assert detect_cryokarst_speleology_intent("   ") is False

    # Negative matches / exclusions
    assert detect_cryokarst_speleology_intent("Can I get an order #12345 tracking?") is False
    assert detect_cryokarst_speleology_intent("I want a refund for my order") is False
    assert detect_cryokarst_speleology_intent("Where can I find cave pearls and speleothems?") is False
    assert detect_cryokarst_speleology_intent("What is the flow rate in the siphon at Peacock Springs?") is False
    assert detect_cryokarst_speleology_intent("How do I pack a pulk for dogsledding?") is False
    assert detect_cryokarst_speleology_intent("Tell me about bog shoeing in muskeg peatland") is False
    assert detect_cryokarst_speleology_intent("Sandboarding down coastal dunes") is False
    assert detect_cryokarst_speleology_intent("Tundra lichen morphology and Rhizocarpon growth") is False


def test_disambiguation_guards_in_caving_and_glacier():
    # Cryokarst queries should NOT be claimed by generic caving
    assert detect_caving_intent("Cryokarst moulin shaft exploration techniques") is None
    assert detect_caving_intent("What ice cave gear do I need?") is None
    assert detect_caving_intent("Subglacial conduit tunnel navigation") is None

    # Cryokarst queries should NOT be claimed by glacier navigation
    assert detect_glacier_intent("Cryokarst moulin shaft exploration techniques") is None
    assert detect_glacier_intent("Ice cave subglacial cavern descent") is None


def test_extract_cryokarst_speleology_intent():
    # Catalog
    intent = extract_cryokarst_speleology_intent("List all cryokarst sites")
    assert intent.action == "catalog"

    # Site detail
    intent = extract_cryokarst_speleology_intent("Tell me details about Matanuska glacier moulin chamber")
    assert intent.action == "get_site"
    assert intent.site_id == "matanuska-glacier-moulin-chamber"
    assert intent.conduit_type == "vertical_moulin_shaft"

    # Calculate
    intent = extract_cryokarst_speleology_intent("Calculate anchor creep rate and jokulhlaup risk for Root Glacier")
    assert intent.action == "calculate"
    assert intent.site_id == "root-glacier-cryokarst-conduit"

    # Gear
    intent = extract_cryokarst_speleology_intent("What mandatory gear and drysuit do I need for cryokarst speleology?")
    assert intent.action == "gear_checklist"


def test_format_cryokarst_speleology_response():
    # Catalog action
    resp = format_cryokarst_speleology_response("catalog")
    assert "cryokarst_speleology_info" in resp
    assert resp["cryokarst_speleology_info"]["action"] == "catalog"
    assert len(resp["cryokarst_speleology_info"]["sites"]) == 5

    # Site detail action
    resp_site = format_cryokarst_speleology_response("get_site", "gorner-glacier-zermatt-cryokarst")
    assert resp_site["cryokarst_speleology_info"]["action"] == "get_site"
    assert resp_site["cryokarst_speleology_info"]["site_id"] == "gorner-glacier-zermatt-cryokarst"

    # Gear checklist action
    resp_gear = format_cryokarst_speleology_response("gear_checklist")
    assert resp_gear["cryokarst_speleology_info"]["action"] == "gear_checklist"
    assert resp_gear["cryokarst_speleology_info"]["mandatory_count"] == 6

    # Calculate action
    resp_calc = format_cryokarst_speleology_response("calculate", "matanuska-glacier-moulin-chamber")
    assert resp_calc["cryokarst_speleology_info"]["action"] == "calculate"
    assert "anchor_creep_rate_mm_hr" in resp_calc["cryokarst_speleology_info"]

    # Preformatted dict passthrough
    mock_dict = {
        "cryokarst_speleology_info": {"action": "preformatted"},
        "answer": "Preformatted answer",
    }
    resp_pass = format_cryokarst_speleology_response("anything", mock_dict)
    assert resp_pass.get("answer") == "Preformatted answer"


def test_build_cryokarst_speleology_prompt():
    prompt = build_cryokarst_speleology_prompt()
    assert "Glacier Ice Dynamics & Creep Rates" in prompt
    assert "Thermal Ablation & Jökulhlaup Hazard" in prompt
    assert "Multi-Gas Subglacial Hazards" in prompt
    assert "Mandatory Subglacial Equipment" in prompt

    prompt_site = build_cryokarst_speleology_prompt("Tell me about Matanuska moulin chamber")
    assert "Focused Cryokarst Site: Matanuska Glacier Deep Moulin Chamber" in prompt_site


def test_cryokarst_speleology_tool():
    # Catalog
    res = cryokarst_speleology_tool(action="catalog")
    assert res["cryokarst_speleology_info"]["action"] == "catalog"

    # Gear
    res_gear = cryokarst_speleology_tool(action="gear")
    assert res_gear["cryokarst_speleology_info"]["action"] == "gear_checklist"

    # Site detail
    res_site = cryokarst_speleology_tool(action="get_site", site_id="athabasca-glacier-crevasse-chasm")
    assert res_site["cryokarst_speleology_info"]["action"] == "get_site"

    # Calculate
    res_calc = cryokarst_speleology_tool(
        query=CryokarstDynamicsQuery(site_id="palmer-glacier-fumarole-ice-caves")
    )
    assert res_calc["cryokarst_speleology_info"]["action"] == "calculate"


def test_chat_handler_and_stream_events():
    # Chat handler
    handled = handle_cryokarst_speleology_intent("What is the anchor creep rate for Root Glacier cryokarst?")
    assert handled is not None
    assert "cryokarst_speleology_info" in handled
    assert handled["cryokarst_speleology_info"]["action"] == "calculate"

    # Non-matching returns None
    assert handle_cryokarst_speleology_intent("Tell me about refund status") is None


@pytest.mark.anyio
async def test_stream_events_generator():
    events = []
    async for chunk in generate_cryokarst_speleology_stream_events(
        "Calculate cryokarst dynamics for Matanuska moulin"
    ):
        events.append(chunk)

    assert len(events) > 0
    assert any("cryokarst_speleology_calculated" in e for e in events)
    assert any("cryokarst_speleology_info" in e for e in events)
    assert events[-1] == "data: [DONE]\n\n"
