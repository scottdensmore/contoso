import pytest
from contoso_chat.cave_diving import detect_cave_diving_intent
from contoso_chat.cave_mineralogy import detect_cave_mineralogy_intent
from contoso_chat.caving import detect_caving_intent
from contoso_chat.chat import handle_lava_tube_biospeleology_intent
from contoso_chat.cryokarst_speleology import detect_cryokarst_speleology_intent
from contoso_chat.lava_tube_biospeleology import (
    BiospeleologyConservationStatus,
    FormattedLavaTubeBiospeleologyResponse,
    LavaTubeBiospeleologyGearItem,
    LavaTubeBiospeleologyIntent,
    LavaTubeBiospeleologyQuery,
    LavaTubeBiospeleologyResult,
    LavaTubeBiospeleologySite,
    LavaTubeEcologicalZone,
    TroglomorphicAdaptationClass,
    VolcanicSubstrateFeature,
    build_lava_tube_biospeleology_prompt,
    calculate_lava_tube_biospeleology_dynamics,
    detect_lava_tube_biospeleology_intent,
    extract_lava_tube_biospeleology_intent,
    format_lava_tube_biospeleology_response,
    get_lava_tube_biospeleology_gear,
    get_lava_tube_biospeleology_site,
    get_lava_tube_biospeleology_sites,
    lava_tube_biospeleology_tool,
)
from contoso_chat.stream import generate_lava_tube_biospeleology_stream_events


def test_lava_tube_biospeleology_enums():
    # LavaTubeEcologicalZone
    assert LavaTubeEcologicalZone.SKYLIGHT_ENTRANCE_ECOTONE == "skylight_entrance_ecotone"
    assert LavaTubeEcologicalZone.TWILIGHT_MOSS_THRESHOLD == "twilight_moss_threshold"
    assert LavaTubeEcologicalZone.TRANSITION_VARIABLE_MICROCLIMATE == "transition_variable_microclimate"
    assert LavaTubeEcologicalZone.DEEP_DARK_STAGNANT_SATURATION == "deep_dark_stagnant_saturation"
    assert LavaTubeEcologicalZone.SUBTERRANEAN_ROOT_CURTAIN_GALLERY == "subterranean_root_curtain_gallery"

    # VolcanicSubstrateFeature
    assert VolcanicSubstrateFeature.AA_CLINKER_RUBBLE_FLOOR == "aa_clinker_rubble_floor"
    assert VolcanicSubstrateFeature.PAHOEHOE_ROPY_BENCH_LEDGES == "pahoehoe_ropy_bench_ledges"
    assert VolcanicSubstrateFeature.LAVACICLE_CEILING_STALACTITES == "lavacicle_ceiling_stalactites"
    assert VolcanicSubstrateFeature.ACTINOBACTERIAL_GOLDEN_SLIME_WALL == "actinobacterial_golden_slime_wall"
    assert VolcanicSubstrateFeature.EPHEMERAL_PERCHED_WATER_DRIP_POOL == "ephemeral_perched_water_drip_pool"

    # TroglomorphicAdaptationClass
    assert TroglomorphicAdaptationClass.OBLIGATE_EYELESS_TROGLOBITE == "obligate_eyeless_troglobite"
    assert TroglomorphicAdaptationClass.FACULTATIVE_ROOT_FEEDING_TROGLOPHILE == "facultative_root_feeding_troglophile"
    assert TroglomorphicAdaptationClass.TROGLOXENE_ROOSTING_COMMENSAL == "trogloxene_roosting_commensal"
    assert TroglomorphicAdaptationClass.CHEMOLITHOAUTOTROPHIC_MICROBIAL_MAT == "chemolithoautotrophic_microbial_mat"

    # BiospeleologyConservationStatus
    assert BiospeleologyConservationStatus.PRISTINE_ENDEMIC_REFUGIUM == "pristine_endemic_refugium"
    assert BiospeleologyConservationStatus.VULNERABLE_MICROCLIMATE_DESICCATION == "vulnerable_microclimate_desiccation"
    assert (
        BiospeleologyConservationStatus.CRITICAL_ANTHROPOGENIC_BIOCONTAMINATION
        == "critical_anthropogenic_biocontamination"
    )


def test_lava_tube_biospeleology_site_model_and_aliases():
    site_data = {
        "siteId": "kazumura-cave-kilauea-root-galleries",
        "title": "Kazumura Cave Kilauea Root Curtain Galleries",
        "region": "Puna District, Hawaii Island",
        "range": "Kilauea East Rift Zone",
        "elevationMeters": 420,
        "dominantZone": "subterranean_root_curtain_gallery",
        "primarySubstrate": "pahoehoe_ropy_bench_ledges",
        "dominantAdaptation": "obligate_eyeless_troglobite",
        "description": "Master volcanic lava tube conduit with Metrosideros polymorpha root curtains.",
        "highlights": ["Eyeless Oliarus polyphemus planthopper habitat"],
    }
    site = LavaTubeBiospeleologySite.model_validate(site_data)
    assert site.id == "kazumura-cave-kilauea-root-galleries"
    assert site.site_id == "kazumura-cave-kilauea-root-galleries"
    assert site.siteId == "kazumura-cave-kilauea-root-galleries"
    assert site.name == "Kazumura Cave Kilauea Root Curtain Galleries"
    assert site.elevation_meters == 420
    assert site.elevationMeters == 420
    assert site.dominant_zone == "subterranean_root_curtain_gallery"
    assert site.dominantZone == "subterranean_root_curtain_gallery"
    assert site.primary_substrate == "pahoehoe_ropy_bench_ledges"
    assert site.primarySubstrate == "pahoehoe_ropy_bench_ledges"
    assert site.dominant_adaptation == "obligate_eyeless_troglobite"
    assert site.dominantAdaptation == "obligate_eyeless_troglobite"


def test_lava_tube_biospeleology_query_and_result_aliases():
    query_data = {
        "siteId": "kazumura-cave-kilauea-root-galleries",
        "ecologicalZone": "subterranean_root_curtain_gallery",
        "substrateFeature": "pahoehoe_ropy_bench_ledges",
        "relativeHumidityPercent": 98.5,
        "distanceFromSkylightMeters": 350.0,
        "ceilingRootDensityPerM2": 42.0,
        "ambientCo2Ppm": 650.0,
    }
    query = LavaTubeBiospeleologyQuery.model_validate(query_data)
    assert query.site_id == "kazumura-cave-kilauea-root-galleries"
    assert query.siteId == "kazumura-cave-kilauea-root-galleries"
    assert query.ecological_zone == "subterranean_root_curtain_gallery"
    assert query.ecologicalZone == "subterranean_root_curtain_gallery"
    assert query.substrate_feature == "pahoehoe_ropy_bench_ledges"
    assert query.substrateFeature == "pahoehoe_ropy_bench_ledges"
    assert query.relative_humidity_percent == 98.5
    assert query.relativeHumidityPercent == 98.5
    assert query.distance_from_skylight_meters == 350.0
    assert query.distanceFromSkylightMeters == 350.0
    assert query.ceiling_root_density_per_m2 == 42.0
    assert query.ceilingRootDensityPerM2 == 42.0
    assert query.ambient_co2_ppm == 650.0
    assert query.ambientCo2Ppm == 650.0

    result_data = {
        "siteTitle": "Kazumura Cave Kilauea Root Curtain Galleries",
        "siteId": "kazumura-cave-kilauea-root-galleries",
        "troglobiteEndemismIndex": 0.92,
        "rootExudateTrophicCapacityMgCM2Day": 148.5,
        "vaporPressureDeficitStressKpa": 0.03,
        "microbialMatIntegrityPercent": 96.4,
        "conservationStatus": "pristine_endemic_refugium",
        "nonContactTraversalProtocol": "Walk strictly on marked central pahoehoe thalweg.",
        "biocontaminationDeconAdvisory": "Apply quaternary ammonium boot wash prior to entry.",
    }
    res = LavaTubeBiospeleologyResult.model_validate(result_data)
    assert res.site_title == "Kazumura Cave Kilauea Root Curtain Galleries"
    assert res.siteTitle == "Kazumura Cave Kilauea Root Curtain Galleries"
    assert res.site_id == "kazumura-cave-kilauea-root-galleries"
    assert res.siteId == "kazumura-cave-kilauea-root-galleries"
    assert res.troglobite_endemism_index == 0.92
    assert res.troglobiteEndemismIndex == 0.92
    assert res.root_exudate_trophic_capacity_mg_c_m2_day == 148.5
    assert res.rootExudateTrophicCapacityMgCM2Day == 148.5
    assert res.vapor_pressure_deficit_stress_kpa == 0.03
    assert res.vaporPressureDeficitStressKpa == 0.03
    assert res.microbial_mat_integrity_percent == 96.4
    assert res.microbialMatIntegrityPercent == 96.4
    assert res.conservation_status == "pristine_endemic_refugium"
    assert res.conservationStatus == "pristine_endemic_refugium"
    assert res.non_contact_traversal_protocol == "Walk strictly on marked central pahoehoe thalweg."
    assert res.nonContactTraversalProtocol == "Walk strictly on marked central pahoehoe thalweg."
    assert res.biocontamination_decon_advisory == "Apply quaternary ammonium boot wash prior to entry."
    assert res.biocontaminationDeconAdvisory == "Apply quaternary ammonium boot wash prior to entry."


def test_lava_tube_biospeleology_gear_item_aliases():
    gear_data = {
        "itemId": "en12492-low-profile-basalt-caving-helmet",
        "name": "EN 12492 Low-Profile Basalt Caving Helmet",
        "category": "Cranial Protection",
        "mandatory": True,
        "description": "Low-clearance impact shell preventing lavacicle ceiling strikes.",
    }
    gear = LavaTubeBiospeleologyGearItem.model_validate(gear_data)
    assert gear.id == "en12492-low-profile-basalt-caving-helmet"
    assert gear.item_id == "en12492-low-profile-basalt-caving-helmet"
    assert gear.itemId == "en12492-low-profile-basalt-caving-helmet"
    assert gear.description == "Low-clearance impact shell preventing lavacicle ceiling strikes."
    assert gear.purpose == "Low-clearance impact shell preventing lavacicle ceiling strikes."


def test_lava_tube_biospeleology_intent_model():
    intent = LavaTubeBiospeleologyIntent(
        action="calculate",
        site_id="kazumura-cave-kilauea-root-galleries",
        query="Calculate troglobite endemism index",
        ecological_zone="subterranean_root_curtain_gallery",
    )
    assert intent.action == "calculate"
    assert intent.site_id == "kazumura-cave-kilauea-root-galleries"
    assert intent.query == "Calculate troglobite endemism index"
    assert intent.ecological_zone == "subterranean_root_curtain_gallery"


def test_formatted_response_wrapper():
    resp = FormattedLavaTubeBiospeleologyResponse(
        "Lava tube biospeleology answer",
        {"lava_tube_biospeleology_info": {"action": "catalog"}, "answer": "Lava tube biospeleology answer"},
    )
    assert str(resp) == "Lava tube biospeleology answer"
    assert resp.get("answer") == "Lava tube biospeleology answer"
    assert resp["lava_tube_biospeleology_info"]["action"] == "catalog"
    assert "lava_tube_biospeleology_info" in resp
    assert "answer" in list(resp.keys())
    assert len(list(resp.values())) == 2
    assert len(list(resp.items())) == 2


def test_lava_tube_biospeleology_catalog_and_filtering():
    all_sites = get_lava_tube_biospeleology_sites()
    assert len(all_sites) == 5
    site_ids = [s.id for s in all_sites]
    assert "kazumura-cave-kilauea-root-galleries" in site_ids
    assert "ape-cave-mount-st-helens-basalt" in site_ids
    assert "undara-volcanic-lava-tubes" in site_ids
    assert "manjanggul-jeju-volcanic-tube" in site_ids
    assert "cueva-de-los-verdes-lanzarote" in site_ids

    # Filter by subterranean_root_curtain_gallery
    root_sites = get_lava_tube_biospeleology_sites(zone="subterranean_root_curtain_gallery")
    assert len(root_sites) == 1
    assert root_sites[0].id == "kazumura-cave-kilauea-root-galleries"

    # Filter by deep_dark_stagnant_saturation
    deep_sites = get_lava_tube_biospeleology_sites(zone="deep_dark_stagnant_saturation")
    assert len(deep_sites) >= 1
    assert any(s.id == "cueva-de-los-verdes-lanzarote" or s.id == "manjanggul-jeju-volcanic-tube" for s in deep_sites)

    # Single site lookup
    kaz = get_lava_tube_biospeleology_site("kazumura-cave-kilauea-root-galleries")
    assert kaz is not None
    assert kaz.dominant_zone == "subterranean_root_curtain_gallery"
    assert len(kaz.highlights) >= 3

    # Unknown site
    assert get_lava_tube_biospeleology_site("unknown-lava-tube") is None


def test_lava_tube_biospeleology_gear_checklist():
    gear = get_lava_tube_biospeleology_gear()
    assert len(gear) == 6
    assert all(g.mandatory is True for g in gear)
    item_ids = [g.id for g in gear]
    assert "en12492-low-profile-basalt-caving-helmet" in item_ids
    assert "red-spectrum-low-lux-biosurvey-headlamp" in item_ids
    assert "neoprene-kevlar-aa-basalt-knee-elbow-pads" in item_ids
    assert "quaternary-ammonium-boot-decon-kit" in item_ids
    assert "macro-15x-illuminated-entomological-loupe" in item_ids
    assert "nondestructive-aspirator-pooter-vial-set" in item_ids


def test_lava_tube_biospeleology_calculation_pristine():
    query = LavaTubeBiospeleologyQuery(
        site_id="kazumura-cave-kilauea-root-galleries",
        ecological_zone="subterranean_root_curtain_gallery",
        substrate_feature="pahoehoe_ropy_bench_ledges",
        relative_humidity_percent=99.0,
        distance_from_skylight_meters=400.0,
        ceiling_root_density_per_m2=45.0,
        ambient_co2_ppm=550.0,
    )
    res = calculate_lava_tube_biospeleology_dynamics(query)
    assert res.conservation_status == "pristine_endemic_refugium"
    assert res.troglobite_endemism_index >= 0.75
    assert res.root_exudate_trophic_capacity_mg_c_m2_day > 50.0
    assert res.vapor_pressure_deficit_stress_kpa <= 0.15
    assert res.microbial_mat_integrity_percent >= 85.0
    assert len(res.non_contact_traversal_protocol) > 10
    assert len(res.biocontamination_decon_advisory) > 10


def test_lava_tube_biospeleology_calculation_vulnerable():
    query = LavaTubeBiospeleologyQuery(
        site_id="undara-volcanic-lava-tubes",
        ecological_zone="transition_variable_microclimate",
        substrate_feature="aa_clinker_rubble_floor",
        relative_humidity_percent=84.0,
        distance_from_skylight_meters=90.0,
        ceiling_root_density_per_m2=15.0,
        ambient_co2_ppm=950.0,
    )
    res = calculate_lava_tube_biospeleology_dynamics(query)
    assert res.conservation_status == "vulnerable_microclimate_desiccation"
    assert res.vapor_pressure_deficit_stress_kpa > 0.15


def test_lava_tube_biospeleology_calculation_critical():
    query = LavaTubeBiospeleologyQuery(
        site_id="ape-cave-mount-st-helens-basalt",
        ecological_zone="skylight_entrance_ecotone",
        substrate_feature="actinobacterial_golden_slime_wall",
        relative_humidity_percent=68.0,
        distance_from_skylight_meters=25.0,
        ceiling_root_density_per_m2=2.0,
        ambient_co2_ppm=2400.0,
    )
    res = calculate_lava_tube_biospeleology_dynamics(query)
    assert res.conservation_status == "critical_anthropogenic_biocontamination"
    assert res.microbial_mat_integrity_percent < 70.0


def test_lava_tube_biospeleology_calculation_unknown_site():
    query = LavaTubeBiospeleologyQuery(site_id="unknown-volcanic-tube")
    with pytest.raises(ValueError, match="not found"):
        calculate_lava_tube_biospeleology_dynamics(query)


def test_detect_lava_tube_biospeleology_intent():
    # Positive matches
    assert detect_lava_tube_biospeleology_intent("Tell me about Kazumura Cave root curtain galleries") is True
    assert detect_lava_tube_biospeleology_intent("Subterranean lava tube biospeleology survey") is True
    assert detect_lava_tube_biospeleology_intent("Eyeless troglomorphic fauna and troglobite endemism") is True
    assert detect_lava_tube_biospeleology_intent("Actinobacterial lava tube gold slime walls") is True
    assert detect_lava_tube_biospeleology_intent("Lavacicle ceiling stalactites and pahoehoe bench") is True
    assert detect_lava_tube_biospeleology_intent("Ape Cave Mount St Helens basalt lava tube") is True
    assert detect_lava_tube_biospeleology_intent("Undara volcanic lava tubes microclimate") is True
    assert detect_lava_tube_biospeleology_intent("Manjanggul Jeju volcanic tube biospeleology") is True
    assert detect_lava_tube_biospeleology_intent("Cueva de los Verdes Lanzarote troglobite") is True

    # Empty / whitespace
    assert detect_lava_tube_biospeleology_intent("") is False
    assert detect_lava_tube_biospeleology_intent("   ") is False

    # Negative matches / exclusions
    assert detect_lava_tube_biospeleology_intent("Can I get an order #12345 tracking?") is False
    assert detect_lava_tube_biospeleology_intent("I want a refund for my order") is False
    assert detect_lava_tube_biospeleology_intent("Where can I find cave pearls and calcite speleothems?") is False
    assert detect_lava_tube_biospeleology_intent("What is the turn pressure in Peacock Springs cave diving?") is False
    assert detect_lava_tube_biospeleology_intent("Tell me about Matanuska glacier moulin cryokarst") is False


def test_cross_domain_disambiguation_guards():
    # Caving, cave mineralogy, cave diving, and cryokarst speleology should NOT claim lava tube biospeleology queries
    q1 = "Tell me about lava tube biospeleology and troglomorphic fauna in Kazumura Cave"
    q2 = "Actinobacterial lava tube gold and pahoehoe bench ledges in Ape Cave"
    q3 = "Lavacicle ceiling and root curtain gallery troglobite survey in Undara"

    for q in (q1, q2, q3):
        assert detect_caving_intent(q) is None
        assert detect_cave_mineralogy_intent(q) is None
        assert detect_cave_diving_intent(q) is None
        assert detect_cryokarst_speleology_intent(q) is False


def test_extract_lava_tube_biospeleology_intent():
    # Catalog
    intent = extract_lava_tube_biospeleology_intent("List all lava tube biospeleology sites")
    assert intent.action == "catalog"

    # Site detail
    intent_site = extract_lava_tube_biospeleology_intent("Tell me details about Kazumura Cave root galleries")
    assert intent_site.action == "get_site"
    assert intent_site.site_id == "kazumura-cave-kilauea-root-galleries"

    # Calculate
    intent_calc = extract_lava_tube_biospeleology_intent(
        "Calculate troglobite endemism index and trophic capacity for Ape Cave"
    )
    assert intent_calc.action == "calculate"
    assert intent_calc.site_id == "ape-cave-mount-st-helens-basalt"

    # Gear
    intent_gear = extract_lava_tube_biospeleology_intent(
        "What mandatory gear, pooter, and red-spectrum headlamp do I need for lava tube biospeleology?"
    )
    assert intent_gear.action == "gear_checklist"


def test_format_lava_tube_biospeleology_response():
    # Catalog
    resp = format_lava_tube_biospeleology_response("catalog")
    assert "lava_tube_biospeleology_info" in resp
    assert resp["lava_tube_biospeleology_info"]["action"] == "catalog"
    assert len(resp["lava_tube_biospeleology_info"]["sites"]) == 5

    # Site detail
    resp_site = format_lava_tube_biospeleology_response("get_site", "kazumura-cave-kilauea-root-galleries")
    assert resp_site["lava_tube_biospeleology_info"]["action"] == "get_site"
    assert resp_site["lava_tube_biospeleology_info"]["site_id"] == "kazumura-cave-kilauea-root-galleries"

    # Gear checklist
    resp_gear = format_lava_tube_biospeleology_response("gear_checklist")
    assert resp_gear["lava_tube_biospeleology_info"]["action"] == "gear_checklist"
    assert resp_gear["lava_tube_biospeleology_info"]["mandatory_count"] == 6

    # Calculate
    resp_calc = format_lava_tube_biospeleology_response("calculate", "kazumura-cave-kilauea-root-galleries")
    assert resp_calc["lava_tube_biospeleology_info"]["action"] == "calculate"
    assert "troglobite_endemism_index" in resp_calc["lava_tube_biospeleology_info"]

    # Preformatted passthrough
    mock_dict = {
        "lava_tube_biospeleology_info": {"action": "preformatted"},
        "answer": "Preformatted lava tube answer",
    }
    resp_pass = format_lava_tube_biospeleology_response("anything", mock_dict)
    assert resp_pass.get("answer") == "Preformatted lava tube answer"


def test_build_lava_tube_biospeleology_prompt():
    prompt = build_lava_tube_biospeleology_prompt()
    assert "Lava Tube" in prompt
    assert "Troglomorphic" in prompt or "Troglobite" in prompt
    assert "Actinobacterial" in prompt or "Microbial Mat" in prompt

    prompt_site = build_lava_tube_biospeleology_prompt("Tell me about Kazumura Cave root curtains")
    assert "Kazumura Cave" in prompt_site


def test_lava_tube_biospeleology_tool():
    res_cat = lava_tube_biospeleology_tool(action="catalog")
    assert res_cat["lava_tube_biospeleology_info"]["action"] == "catalog"

    res_gear = lava_tube_biospeleology_tool(action="gear")
    assert res_gear["lava_tube_biospeleology_info"]["action"] == "gear_checklist"

    res_site = lava_tube_biospeleology_tool(
        action="get_site", site_id="manjanggul-jeju-volcanic-tube"
    )
    assert res_site["lava_tube_biospeleology_info"]["action"] == "get_site"

    res_calc = lava_tube_biospeleology_tool(
        query=LavaTubeBiospeleologyQuery(site_id="cueva-de-los-verdes-lanzarote")
    )
    assert res_calc["lava_tube_biospeleology_info"]["action"] == "calculate"


def test_chat_handler():
    handled = handle_lava_tube_biospeleology_intent(
        "Calculate troglobite endemism index for Kazumura Cave lava tube"
    )
    assert handled is not None
    assert "lava_tube_biospeleology_info" in handled
    assert handled["lava_tube_biospeleology_info"]["action"] == "calculate"

    assert handle_lava_tube_biospeleology_intent("Tell me about refund status") is None


@pytest.mark.anyio
async def test_stream_events_generator():
    events = []
    async for chunk in generate_lava_tube_biospeleology_stream_events(
        "Calculate troglobite endemism and root exudate capacity for Kazumura lava tube"
    ):
        events.append(chunk)

    assert len(events) > 0
    assert any("lava_tube_biospeleology_calculated" in e for e in events)
    assert any("lava_tube_biospeleology_info" in e for e in events)
    assert events[-1] == "data: [DONE]\n\n"
