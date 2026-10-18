import pytest
from contoso_chat.alpine_scuba import detect_alpine_scuba_intent
from contoso_chat.beachcombing import detect_beachcombing_intent
from contoso_chat.cave_diving import detect_cave_diving_intent
from contoso_chat.chat import handle_kelp_freediving_intent
from contoso_chat.coasteering import detect_coasteering_intent
from contoso_chat.kelp_freediving import (
    DominantKelpTaxa,
    FormattedKelpFreedivingResponse,
    FreediveSafetyStatus,
    KelpForestStratum,
    KelpFreedivingGearItem,
    KelpFreedivingIntent,
    KelpFreedivingQuery,
    KelpFreedivingResult,
    KelpFreedivingSite,
    TrophicCascadeState,
    build_kelp_freediving_prompt,
    calculate_kelp_freediving_dynamics,
    detect_kelp_freediving_intent,
    extract_kelp_freediving_intent,
    format_kelp_freediving_response,
    get_kelp_freediving_gear,
    get_kelp_freediving_site,
    get_kelp_freediving_sites,
    kelp_freediving_tool,
)
from contoso_chat.sea_kayaking import detect_sea_kayaking_intent
from contoso_chat.stream import generate_kelp_freediving_stream_events


def test_kelp_freediving_enums():
    # KelpForestStratum
    assert KelpForestStratum.FLOATING_PNEUMATOCYST_CANOPY == "floating_pneumatocyst_canopy"
    assert KelpForestStratum.MIDWATER_STIPE_COLUMNS == "midwater_stipe_columns"
    assert KelpForestStratum.SUBCANOPY_PTERYGOPHORA_UNDERSTORY == "subcanopy_pterygophora_understory"
    assert KelpForestStratum.BENTHIC_HAPTERA_HOLDFAST_REEF == "benthic_haptera_holdfast_reef"
    assert KelpForestStratum.INTERTIDAL_SURGE_CHANNEL_ECOTONE == "intertidal_surge_channel_ecotone"

    # DominantKelpTaxa
    assert DominantKelpTaxa.MACROCYSTIS_PYRIFERA_GIANT_KELP == "macrocystis_pyrifera_giant_kelp"
    assert DominantKelpTaxa.NEREOCYSTIS_LUETKEANA_BULL_KELP == "nereocystis_luetkeana_bull_kelp"
    assert DominantKelpTaxa.ECKLONIA_RADIATA_GOLDEN_KELP == "ecklonia_radiata_golden_kelp"
    assert DominantKelpTaxa.LAMINARIA_HYPERBOREA_CUVIE_FOREST == "laminaria_hyperborea_cuvie_forest"
    assert DominantKelpTaxa.POSTELSIA_PALMAEFORMIS_SEA_PALM == "postelsia_palmaeformis_sea_palm"

    # TrophicCascadeState
    assert TrophicCascadeState.OTTER_KEYSTONE_CLIMAX_FOREST == "otter_keystone_climax_forest"
    assert TrophicCascadeState.TRANSITIONAL_PATCH_MOSAIC == "transitional_patch_mosaic"
    assert TrophicCascadeState.PURPLE_URCHIN_BARREN_DEGRADED == "purple_urchin_barren_degraded"
    assert TrophicCascadeState.UPWELLING_NUTRIENT_RECOVERY_BLOOM == "upwelling_nutrient_recovery_bloom"

    # FreediveSafetyStatus
    assert FreediveSafetyStatus.OPTIMAL_CALM_CANOPY_WINDOW == "optimal_calm_canopy_window"
    assert FreediveSafetyStatus.CAUTION_STIPE_ENTANGLEMENT_SWELL == "caution_stipe_entanglement_swell"
    assert FreediveSafetyStatus.ABORT_HEAVY_SURGE_LOW_VISIBILITY == "abort_heavy_surge_low_visibility"


def test_kelp_freediving_site_model_and_aliases():
    site_data = {
        "siteId": "point-lobos-carmel-pinnacles",
        "title": "Point Lobos Whalers Cove & Carmel Pinnacles",
        "region": "Monterey Bay National Marine Sanctuary, California",
        "range": "Central California Granitic Headlands",
        "maxDepthMeters": 24,
        "dominantStratum": "floating_pneumatocyst_canopy",
        "primaryTaxa": "macrocystis_pyrifera_giant_kelp",
        "trophicState": "otter_keystone_climax_forest",
        "description": "Cathedral-like Macrocystis pyrifera giant kelp forest anchored to submerged granitic pinnacles.",
        "highlights": ["Dense sea otter keystone predator foraging canopy"],
    }
    site = KelpFreedivingSite.model_validate(site_data)
    assert site.id == "point-lobos-carmel-pinnacles"
    assert site.site_id == "point-lobos-carmel-pinnacles"
    assert site.siteId == "point-lobos-carmel-pinnacles"
    assert site.name == "Point Lobos Whalers Cove & Carmel Pinnacles"
    assert site.max_depth_meters == 24
    assert site.maxDepthMeters == 24
    assert site.dominant_stratum == "floating_pneumatocyst_canopy"
    assert site.dominantStratum == "floating_pneumatocyst_canopy"
    assert site.primary_taxa == "macrocystis_pyrifera_giant_kelp"
    assert site.primaryTaxa == "macrocystis_pyrifera_giant_kelp"
    assert site.trophic_state == "otter_keystone_climax_forest"
    assert site.trophicState == "otter_keystone_climax_forest"


def test_kelp_freediving_query_and_result_aliases():
    query_data = {
        "siteId": "point-lobos-carmel-pinnacles",
        "kelpStratum": "floating_pneumatocyst_canopy",
        "dominantTaxa": "macrocystis_pyrifera_giant_kelp",
        "targetDepthMeters": 12.0,
        "waterTempCelsius": 11.5,
        "surgeVelocityMs": 0.35,
        "visibilityMeters": 14.0,
        "wetsuitThicknessMm": 7.0,
    }
    query = KelpFreedivingQuery.model_validate(query_data)
    assert query.site_id == "point-lobos-carmel-pinnacles"
    assert query.siteId == "point-lobos-carmel-pinnacles"
    assert query.kelp_stratum == "floating_pneumatocyst_canopy"
    assert query.kelpStratum == "floating_pneumatocyst_canopy"
    assert query.dominant_taxa == "macrocystis_pyrifera_giant_kelp"
    assert query.dominantTaxa == "macrocystis_pyrifera_giant_kelp"
    assert query.target_depth_meters == 12.0
    assert query.targetDepthMeters == 12.0
    assert query.water_temp_celsius == 11.5
    assert query.waterTempCelsius == 11.5
    assert query.surge_velocity_ms == 0.35
    assert query.surgeVelocityMs == 0.35
    assert query.visibility_meters == 14.0
    assert query.visibilityMeters == 14.0
    assert query.wetsuit_thickness_mm == 7.0
    assert query.wetsuitThicknessMm == 7.0

    result_data = {
        "siteTitle": "Point Lobos Whalers Cove & Carmel Pinnacles",
        "siteId": "point-lobos-carmel-pinnacles",
        "neutralBuoyancyDepthMeters": 10.0,
        "recommendedLeadWeightKg": 6.5,
        "safeBottomTimeSeconds": 75,
        "stipeEntanglementRiskPercent": 18.5,
        "holdfastBiodiversityIndex": 0.91,
        "safetyStatus": "optimal_calm_canopy_window",
        "canopyEntryProtocol": "Execute slow kelp crawl over pneumatocyst mats; part fronds vertically before duck dive.",
        "holdfastSurveyAdvisory": "Inspect benthic haptera lattice at 10-12m without prying brittle stars or abalone.",
    }
    res = KelpFreedivingResult.model_validate(result_data)
    assert res.site_title == "Point Lobos Whalers Cove & Carmel Pinnacles"
    assert res.siteTitle == "Point Lobos Whalers Cove & Carmel Pinnacles"
    assert res.site_id == "point-lobos-carmel-pinnacles"
    assert res.siteId == "point-lobos-carmel-pinnacles"
    assert res.neutral_buoyancy_depth_meters == 10.0
    assert res.neutralBuoyancyDepthMeters == 10.0
    assert res.recommended_lead_weight_kg == 6.5
    assert res.recommendedLeadWeightKg == 6.5
    assert res.safe_bottom_time_seconds == 75
    assert res.safeBottomTimeSeconds == 75
    assert res.stipe_entanglement_risk_percent == 18.5
    assert res.stipeEntanglementRiskPercent == 18.5
    assert res.holdfast_biodiversity_index == 0.91
    assert res.holdfastBiodiversityIndex == 0.91
    assert res.safety_status == "optimal_calm_canopy_window"
    assert res.safetyStatus == "optimal_calm_canopy_window"
    assert "kelp crawl" in res.canopy_entry_protocol
    assert "kelp crawl" in res.canopyEntryProtocol
    assert "haptera" in res.holdfast_survey_advisory
    assert "haptera" in res.holdfastSurveyAdvisory


def test_kelp_freediving_gear_item_aliases():
    gear_data = {
        "itemId": "open-cell-7mm-camo-freedive-wetsuit",
        "name": "7mm Two-Piece Open-Cell Camo Freediving Wetsuit",
        "category": "Thermal Protection",
        "mandatory": True,
        "description": "High-stretch Yamato open-cell neoprene with integrated hood for 8-14°C upwelling waters.",
    }
    gear = KelpFreedivingGearItem.model_validate(gear_data)
    assert gear.id == "open-cell-7mm-camo-freedive-wetsuit"
    assert gear.item_id == "open-cell-7mm-camo-freedive-wetsuit"
    assert gear.itemId == "open-cell-7mm-camo-freedive-wetsuit"
    assert gear.description == "High-stretch Yamato open-cell neoprene with integrated hood for 8-14°C upwelling waters."
    assert gear.purpose == "High-stretch Yamato open-cell neoprene with integrated hood for 8-14°C upwelling waters."


def test_kelp_freediving_intent_model():
    intent = KelpFreedivingIntent(
        action="calculate",
        site_id="point-lobos-carmel-pinnacles",
        query="Calculate neutral buoyancy and holdfast biodiversity for Point Lobos",
        kelp_stratum="floating_pneumatocyst_canopy",
    )
    assert intent.action == "calculate"
    assert intent.site_id == "point-lobos-carmel-pinnacles"
    assert intent.query == "Calculate neutral buoyancy and holdfast biodiversity for Point Lobos"
    assert intent.kelp_stratum == "floating_pneumatocyst_canopy"


def test_formatted_response_wrapper():
    resp = FormattedKelpFreedivingResponse(
        "Kelp freediving answer",
        {"kelp_freediving_info": {"action": "catalog"}, "answer": "Kelp freediving answer"},
    )
    assert str(resp) == "Kelp freediving answer"
    assert resp.get("answer") == "Kelp freediving answer"
    assert resp["kelp_freediving_info"]["action"] == "catalog"
    assert "kelp_freediving_info" in resp
    assert "answer" in list(resp.keys())
    assert len(list(resp.values())) == 2
    assert len(list(resp.items())) == 2


def test_kelp_freediving_catalog_and_filtering():
    all_sites = get_kelp_freediving_sites()
    assert len(all_sites) == 5
    site_ids = [s.id for s in all_sites]
    assert "point-lobos-carmel-pinnacles" in site_ids
    assert "channel-islands-anacapa-cathedral-cove" in site_ids
    assert "false-bay-millers-point-great-african-seaforest" in site_ids
    assert "barkley-sound-broken-group-bull-kelp" in site_ids
    assert "fortescue-bay-tasman-peninsula-giant-kelp" in site_ids

    # Filter by floating_pneumatocyst_canopy
    canopy_sites = get_kelp_freediving_sites(stratum="floating_pneumatocyst_canopy")
    assert len(canopy_sites) >= 1
    assert any(s.id == "point-lobos-carmel-pinnacles" for s in canopy_sites)

    # Filter by benthic_haptera_holdfast_reef
    benthic_sites = get_kelp_freediving_sites(stratum="benthic_haptera_holdfast_reef")
    assert len(benthic_sites) >= 1

    # Single site lookup
    lobos = get_kelp_freediving_site("point-lobos-carmel-pinnacles")
    assert lobos is not None
    assert lobos.dominant_stratum == "floating_pneumatocyst_canopy"
    assert len(lobos.highlights) >= 3

    # Unknown site
    assert get_kelp_freediving_site("unknown-kelp-forest") is None


def test_kelp_freediving_gear_checklist():
    gear = get_kelp_freediving_gear()
    assert len(gear) == 6
    assert all(g.mandatory is True for g in gear)
    item_ids = [g.id for g in gear]
    assert "open-cell-7mm-camo-freedive-wetsuit" in item_ids
    assert "quick-release-silicone-rubber-weight-belt" in item_ids
    assert "blunt-tip-titanium-kelp-line-cutter" in item_ids
    assert "low-volume-frameless-freedive-mask-j-snorkel" in item_ids
    assert "carbon-fiber-long-blade-bi-fins" in item_ids
    assert "submersible-slate-benthic-quadrat-frame" in item_ids


def test_kelp_freediving_calculation_optimal():
    query = KelpFreedivingQuery(
        site_id="point-lobos-carmel-pinnacles",
        kelp_stratum="floating_pneumatocyst_canopy",
        dominant_taxa="macrocystis_pyrifera_giant_kelp",
        target_depth_meters=12.0,
        water_temp_celsius=13.0,
        surge_velocity_ms=0.3,
        visibility_meters=16.0,
        wetsuit_thickness_mm=7.0,
    )
    res = calculate_kelp_freediving_dynamics(query)
    assert res.safety_status == "optimal_calm_canopy_window"
    assert res.neutral_buoyancy_depth_meters >= 8.0
    assert res.recommended_lead_weight_kg > 3.0
    assert res.safe_bottom_time_seconds >= 50
    assert res.stipe_entanglement_risk_percent < 40.0
    assert res.holdfast_biodiversity_index >= 0.75
    assert len(res.canopy_entry_protocol) > 10
    assert len(res.holdfast_survey_advisory) > 10


def test_kelp_freediving_calculation_caution():
    query = KelpFreedivingQuery(
        site_id="barkley-sound-broken-group-bull-kelp",
        kelp_stratum="midwater_stipe_columns",
        dominant_taxa="nereocystis_luetkeana_bull_kelp",
        target_depth_meters=15.0,
        water_temp_celsius=10.0,
        surge_velocity_ms=0.95,
        visibility_meters=7.0,
        wetsuit_thickness_mm=7.0,
    )
    res = calculate_kelp_freediving_dynamics(query)
    assert res.safety_status == "caution_stipe_entanglement_swell"
    assert res.stipe_entanglement_risk_percent >= 40.0


def test_kelp_freediving_calculation_abort():
    query = KelpFreedivingQuery(
        site_id="fortescue-bay-tasman-peninsula-giant-kelp",
        kelp_stratum="intertidal_surge_channel_ecotone",
        dominant_taxa="macrocystis_pyrifera_giant_kelp",
        target_depth_meters=22.0,
        water_temp_celsius=8.5,
        surge_velocity_ms=1.8,
        visibility_meters=2.5,
        wetsuit_thickness_mm=7.0,
    )
    res = calculate_kelp_freediving_dynamics(query)
    assert res.safety_status == "abort_heavy_surge_low_visibility"
    assert res.stipe_entanglement_risk_percent >= 70.0


def test_kelp_freediving_calculation_unknown_site():
    query = KelpFreedivingQuery(site_id="unknown-kelp-reef")
    with pytest.raises(ValueError, match="not found"):
        calculate_kelp_freediving_dynamics(query)


def test_detect_kelp_freediving_intent():
    # Positive matches
    assert detect_kelp_freediving_intent("Tell me about kelp forest freediving at Point Lobos") is True
    assert detect_kelp_freediving_intent("Kelp free-diving canopy entry protocol and kelp crawl") is True
    assert detect_kelp_freediving_intent("Benthic holdfast and haptera biodiversity survey") is True
    assert detect_kelp_freediving_intent("Macrocystis pyrifera giant kelp pneumatocyst canopy") is True
    assert detect_kelp_freediving_intent("Nereocystis bull kelp stipe columns in Barkley Sound") is True
    assert detect_kelp_freediving_intent("Purple urchin barren trophic cascade in Channel Islands Anacapa") is True
    assert detect_kelp_freediving_intent("False Bay Millers Point Great African Seaforest Ecklonia") is True
    assert detect_kelp_freediving_intent("Fortescue Bay Tasman Peninsula giant kelp freediving") is True

    # Empty / whitespace
    assert detect_kelp_freediving_intent("") is False
    assert detect_kelp_freediving_intent("   ") is False

    # Negative matches / exclusions
    assert detect_kelp_freediving_intent("Can I get an order #12345 tracking?") is False
    assert detect_kelp_freediving_intent("I want a refund for my order") is False
    assert detect_kelp_freediving_intent("What is the ESLD for Lake Tahoe alpine scuba diving?") is False
    assert detect_kelp_freediving_intent("What is the turn pressure in Peacock Springs cave diving?") is False
    assert detect_kelp_freediving_intent("Where can I find uranium sea glass beachcombing at Fort Bragg?") is False


def test_cross_domain_disambiguation_guards():
    # Alpine scuba, cave diving, coasteering, sea kayaking, and beachcombing should NOT claim kelp freediving queries
    q1 = "Tell me about kelp forest freediving and benthic haptera holdfast ecology at Point Lobos"
    q2 = "Macrocystis giant kelp pneumatocyst canopy kelp crawl and stipe entanglement risk"
    q3 = "Nereocystis bull kelp and purple urchin barren survey in intertidal surge channel"

    for q in (q1, q2, q3):
        assert bool(detect_alpine_scuba_intent(q)) is False
        assert detect_cave_diving_intent(q) is None
        assert detect_coasteering_intent(q) is None
        assert detect_sea_kayaking_intent(q) is None
        assert detect_beachcombing_intent(q) is None


def test_extract_kelp_freediving_intent():
    # Catalog
    intent = extract_kelp_freediving_intent("List all kelp forest freediving sites")
    assert intent.action == "catalog"

    # Site detail
    intent_site = extract_kelp_freediving_intent("Tell me details about Point Lobos kelp forest freediving")
    assert intent_site.action == "get_site"
    assert intent_site.site_id == "point-lobos-carmel-pinnacles"

    # Calculate
    intent_calc = extract_kelp_freediving_intent(
        "Calculate neutral buoyancy depth and stipe entanglement risk for Channel Islands Anacapa kelp forest"
    )
    assert intent_calc.action == "calculate"
    assert intent_calc.site_id == "channel-islands-anacapa-cathedral-cove"

    # Gear
    intent_gear = extract_kelp_freediving_intent(
        "What mandatory gear, J-snorkel, and kelp line cutter do I need for kelp freediving?"
    )
    assert intent_gear.action == "gear_checklist"


def test_format_kelp_freediving_response():
    # Catalog
    resp = format_kelp_freediving_response("catalog")
    assert "kelp_freediving_info" in resp
    assert resp["kelp_freediving_info"]["action"] == "catalog"
    assert len(resp["kelp_freediving_info"]["sites"]) == 5

    # Site detail
    resp_site = format_kelp_freediving_response("get_site", "point-lobos-carmel-pinnacles")
    assert resp_site["kelp_freediving_info"]["action"] == "get_site"
    assert resp_site["kelp_freediving_info"]["site_id"] == "point-lobos-carmel-pinnacles"

    # Gear checklist
    resp_gear = format_kelp_freediving_response("gear_checklist")
    assert resp_gear["kelp_freediving_info"]["action"] == "gear_checklist"
    assert resp_gear["kelp_freediving_info"]["mandatory_count"] == 6

    # Calculate
    resp_calc = format_kelp_freediving_response("calculate", "point-lobos-carmel-pinnacles")
    assert resp_calc["kelp_freediving_info"]["action"] == "calculate"
    assert "neutral_buoyancy_depth_meters" in resp_calc["kelp_freediving_info"]

    # Preformatted passthrough
    mock_dict = {
        "kelp_freediving_info": {"action": "preformatted"},
        "answer": "Preformatted kelp freediving answer",
    }
    resp_pass = format_kelp_freediving_response("anything", mock_dict)
    assert resp_pass.get("answer") == "Preformatted kelp freediving answer"


def test_build_kelp_freediving_prompt():
    prompt = build_kelp_freediving_prompt()
    assert "Kelp" in prompt
    assert "Holdfast" in prompt or "Haptera" in prompt
    assert "Pneumatocyst" in prompt or "Macrocystis" in prompt

    prompt_site = build_kelp_freediving_prompt("Tell me about Point Lobos kelp forest freediving")
    assert "Point Lobos" in prompt_site


def test_kelp_freediving_tool():
    res_cat = kelp_freediving_tool(action="catalog")
    assert res_cat["kelp_freediving_info"]["action"] == "catalog"

    res_gear = kelp_freediving_tool(action="gear")
    assert res_gear["kelp_freediving_info"]["action"] == "gear_checklist"

    res_site = kelp_freediving_tool(
        action="get_site", site_id="false-bay-millers-point-great-african-seaforest"
    )
    assert res_site["kelp_freediving_info"]["action"] == "get_site"

    res_calc = kelp_freediving_tool(
        query=KelpFreedivingQuery(site_id="barkley-sound-broken-group-bull-kelp")
    )
    assert res_calc["kelp_freediving_info"]["action"] == "calculate"


def test_chat_handler():
    handled = handle_kelp_freediving_intent(
        "Calculate neutral buoyancy depth and holdfast biodiversity for Point Lobos kelp forest"
    )
    assert handled is not None
    assert "kelp_freediving_info" in handled
    assert handled["kelp_freediving_info"]["action"] == "calculate"

    assert handle_kelp_freediving_intent("Tell me about refund status") is None


@pytest.mark.anyio
async def test_stream_events_generator():
    events = []
    async for chunk in generate_kelp_freediving_stream_events(
        "Calculate neutral buoyancy depth and stipe entanglement risk for Point Lobos kelp forest"
    ):
        events.append(chunk)

    assert len(events) > 0
    assert any("kelp_freediving_calculated" in e for e in events)
    assert any("kelp_freediving_info" in e for e in events)
    assert events[-1] == "data: [DONE]\n\n"
