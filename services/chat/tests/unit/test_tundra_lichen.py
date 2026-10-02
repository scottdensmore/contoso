import pytest
from contoso_chat.chat import handle_tundra_lichen_intent
from contoso_chat.foraging import detect_foraging_intent
from contoso_chat.stream import generate_tundra_lichen_stream_events
from contoso_chat.tundra_lichen import (
    AirQualityDeposition,
    FormattedTundraLichenResponse,
    LichenConservationStatus,
    LichenDynamicsQuery,
    LichenDynamicsResult,
    LichenGearItem,
    LichenMorphology,
    PermafrostStatus,
    SubstrateType,
    TundraLichenSite,
    build_tundra_lichen_prompt,
    calculate_lichen_dynamics,
    detect_tundra_lichen_intent,
    extract_tundra_lichen_intent,
    format_tundra_lichen_response,
    get_tundra_gear,
    get_tundra_site,
    get_tundra_sites,
    tundra_lichen_tool,
)


def test_tundra_lichen_enums():
    assert LichenMorphology.CRUSTOSE_SAXICOLOUS == "crustose_saxicolous"
    assert LichenMorphology.FOLIOSE_MACROLICHEN == "foliose_macrolichen"
    assert LichenMorphology.FRUTICOSE_MACROLICHEN == "fruticose_macrolichen"
    assert LichenMorphology.SQUAMULOSE_SOIL_CRUST == "squamulose_soil_crust"

    assert SubstrateType.VOLCANIC_BASALT_OUTCROP == "volcanic_basalt_outcrop"
    assert SubstrateType.GRANITIC_GNEISS_BOULDER == "granitic_gneiss_boulder"
    assert SubstrateType.GLACIAL_TILL_GRAVEL == "glacial_till_gravel"
    assert SubstrateType.CALCAREOUS_LIMESTONE_SHALE == "calcareous_limestone_shale"
    assert SubstrateType.ACIDIC_PEAT_TUSSOCK == "acidic_peat_tussock"

    assert PermafrostStatus.CONTINUOUS_PERMAFROST == "continuous_permafrost"
    assert PermafrostStatus.DISCONTINUOUS_PERMAFROST == "discontinuous_permafrost"
    assert PermafrostStatus.ALPINE_PERMAFROST_ISLANDS == "alpine_permafrost_islands"
    assert PermafrostStatus.SPORADIC_PERMAFROST == "sporadic_permafrost"

    assert AirQualityDeposition.PRISTINE_BASELINE == "pristine_baseline"
    assert AirQualityDeposition.MODERATE_DRIFT == "moderate_drift"
    assert AirQualityDeposition.ELEVATED_ANTHROPOGENIC == "elevated_anthropogenic"

    assert LichenConservationStatus.OPTIMAL_PRISTINE_CLIMAX == "optimal_pristine_climax"
    assert LichenConservationStatus.VULNERABLE_MICROCLIMATE_SHIFT == "vulnerable_microclimate_shift"
    assert LichenConservationStatus.CRITICAL_CRYOTURBATION_DISTURBANCE == "critical_cryoturbation_disturbance"


def test_tundra_lichen_models_and_aliases():
    site_data = {
        "siteId": "denali-polychrome-pass",
        "title": "Denali Polychrome Pass Saxicolous Tundra",
        "region": "Denali National Park, Alaska",
        "range": "Alaska Range",
        "elevationMeters": 1150,
        "dominantMorphology": "crustose_saxicolous",
        "substrateType": "volcanic_basalt_outcrop",
        "permafrostStatus": "discontinuous_permafrost",
        "description": "Subarctic volcanic scree.",
        "highlights": ["Centuries-old map lichen"],
    }
    site = TundraLichenSite.model_validate(site_data)
    assert site.id == "denali-polychrome-pass"
    assert site.siteId == "denali-polychrome-pass"
    assert site.title == "Denali Polychrome Pass Saxicolous Tundra"
    assert site.name == "Denali Polychrome Pass Saxicolous Tundra"
    assert site.elevation_meters == 1150
    assert site.elevationMeters == 1150
    assert site.dominant_morphology == "crustose_saxicolous"
    assert site.dominantMorphology == "crustose_saxicolous"
    assert site.substrate_type == "volcanic_basalt_outcrop"
    assert site.substrateType == "volcanic_basalt_outcrop"
    assert site.permafrost_status == "discontinuous_permafrost"
    assert site.permafrostStatus == "discontinuous_permafrost"

    query_data = {
        "siteId": "denali-polychrome-pass",
        "morphology": "crustose_saxicolous",
        "substrate": "volcanic_basalt_outcrop",
        "colonyDiameterMm": 50.0,
        "annualGrowthRateMmYr": 0.25,
        "uvExposureIndex": 6.5,
        "snowCoverDurationMonths": 7.0,
        "airDeposition": "pristine_baseline",
    }
    query = LichenDynamicsQuery.model_validate(query_data)
    assert query.site_id == "denali-polychrome-pass"
    assert query.siteId == "denali-polychrome-pass"
    assert query.colony_diameter_mm == 50.0
    assert query.colonyDiameterMm == 50.0
    assert query.annual_growth_rate_mm_yr == 0.25
    assert query.annualGrowthRateMmYr == 0.25
    assert query.uv_exposure_index == 6.5
    assert query.uvExposureIndex == 6.5
    assert query.snow_cover_duration_months == 7.0
    assert query.snowCoverDurationMonths == 7.0
    assert query.air_deposition == "pristine_baseline"
    assert query.airDeposition == "pristine_baseline"

    result_data = {
        "siteTitle": "Denali Polychrome Pass Saxicolous Tundra",
        "siteId": "denali-polychrome-pass",
        "estimatedColonyAgeYears": 200,
        "bioindicatorHealthIndex": 0.94,
        "desiccationResilienceScore": 85.3,
        "conservationStatus": "optimal_pristine_climax",
        "lichenometryAdvisory": "Pristine growth baseline.",
        "chemicalSpotTestProtocol": "Apply 10% KOH.",
    }
    result = LichenDynamicsResult.model_validate(result_data)
    assert result.site_title == "Denali Polychrome Pass Saxicolous Tundra"
    assert result.siteTitle == "Denali Polychrome Pass Saxicolous Tundra"
    assert result.site_id == "denali-polychrome-pass"
    assert result.siteId == "denali-polychrome-pass"
    assert result.estimated_colony_age_years == 200
    assert result.estimatedColonyAgeYears == 200
    assert result.bioindicator_health_index == 0.94
    assert result.bioindicatorHealthIndex == 0.94
    assert result.desiccation_resilience_score == 85.3
    assert result.desiccationResilienceScore == 85.3
    assert result.conservation_status == "optimal_pristine_climax"
    assert result.conservationStatus == "optimal_pristine_climax"
    assert result.lichenometry_advisory == "Pristine growth baseline."
    assert result.lichenometryAdvisory == "Pristine growth baseline."
    assert result.chemical_spot_test_protocol == "Apply 10% KOH."
    assert result.chemicalSpotTestProtocol == "Apply 10% KOH."

    gear_data = {
        "itemId": "custom-loupe",
        "name": "Custom Loupe",
        "category": "Optics",
        "mandatory": True,
        "description": "High magnification loupe.",
    }
    gear = LichenGearItem.model_validate(gear_data)
    assert gear.item_id == "custom-loupe"
    assert gear.id == "custom-loupe"
    assert gear.itemId == "custom-loupe"
    assert gear.description == "High magnification loupe."
    assert gear.purpose == "High magnification loupe."


def test_formatted_tundra_lichen_response_wrapper():
    data = {"tundra_lichen_info": {"action": "catalog", "sites": []}, "answer": "Lichen catalog"}
    resp = FormattedTundraLichenResponse("Lichen catalog", data)
    assert str(resp) == "Lichen catalog"
    assert resp.get("tundra_lichen_info") == data["tundra_lichen_info"]
    assert resp["answer"] == "Lichen catalog"
    assert "tundra_lichen_info" in resp
    assert "missing" not in resp
    assert list(resp.keys()) == ["tundra_lichen_info", "answer"]
    assert len(list(resp.values())) == 2
    assert len(list(resp.items())) == 2


def test_catalog_sites_and_filtering():
    sites = get_tundra_sites()
    assert len(sites) == 5
    site_ids = [s.id for s in sites]
    assert "denali-polychrome-pass" in site_ids
    assert "torngat-mountains-fjords" in site_ids
    assert "wrangell-st-elias-root-glacier" in site_ids
    assert "beartooth-plateau-alpine-tundra" in site_ids
    assert "brooks-range-anaktuvuk-pass" in site_ids

    # Crustose morphology filter (Denali and Beartooth)
    crustose_sites = get_tundra_sites(morphology="crustose_saxicolous")
    assert len(crustose_sites) == 2
    crustose_ids = [s.id for s in crustose_sites]
    assert "denali-polychrome-pass" in crustose_ids
    assert "beartooth-plateau-alpine-tundra" in crustose_ids

    # Fruticose morphology filter (Torngat)
    fruticose_sites = get_tundra_sites(morphology="fruticose_macrolichen")
    assert len(fruticose_sites) == 1
    assert fruticose_sites[0].id == "torngat-mountains-fjords"

    # Foliose morphology filter (Wrangell)
    foliose_sites = get_tundra_sites(morphology="foliose_macrolichen")
    assert len(foliose_sites) == 1
    assert foliose_sites[0].id == "wrangell-st-elias-root-glacier"

    # Squamulose morphology filter (Brooks Range)
    squamulose_sites = get_tundra_sites(morphology="squamulose_soil_crust")
    assert len(squamulose_sites) == 1
    assert squamulose_sites[0].id == "brooks-range-anaktuvuk-pass"


def test_single_site_lookup():
    denali = get_tundra_site("denali-polychrome-pass")
    assert denali is not None
    assert denali.id == "denali-polychrome-pass"
    assert "Polychrome Pass" in denali.title
    assert denali.region == "Denali National Park, Alaska"
    assert denali.range == "Alaska Range"
    assert denali.elevation_meters == 1150
    assert len(denali.highlights) == 3

    unknown = get_tundra_site("nonexistent-tundra-ridge")
    assert unknown is None


def test_gear_checklist():
    gear = get_tundra_gear()
    assert len(gear) == 6
    assert all(g.mandatory is True for g in gear)
    item_ids = [g.item_id for g in gear]
    assert "achromatic-field-loupe-20x" in item_ids
    assert "chemical-spot-test-reagent-kit" in item_ids
    assert "subarctic-specimen-chisels" in item_ids
    assert "digital-lichenometry-caliper" in item_ids
    assert "breathable-specimen-herbarium-packets" in item_ids
    assert "field-uv-fluorescence-torch" in item_ids


def test_calculate_lichen_dynamics_nominal():
    # Pristine air, 7 months snow, moderate UV -> optimal pristine climax
    query = LichenDynamicsQuery(
        site_id="denali-polychrome-pass",
        morphology="crustose_saxicolous",
        substrate="volcanic_basalt_outcrop",
        colony_diameter_mm=70.0,
        annual_growth_rate_mm_yr=0.35,
        uv_exposure_index=5.0,
        snow_cover_duration_months=7.0,
        air_deposition="pristine_baseline",
    )
    result = calculate_lichen_dynamics(query)
    assert result.site_id == "denali-polychrome-pass"
    assert "Denali" in result.site_title
    assert result.estimated_colony_age_years == 200
    assert result.bioindicator_health_index >= 0.75
    assert result.conservation_status == LichenConservationStatus.OPTIMAL_PRISTINE_CLIMAX.value
    assert "OPTIMAL CLIMAX" in result.lichenometry_advisory
    assert "KOH" in result.chemical_spot_test_protocol


def test_calculate_lichen_dynamics_vulnerable_microclimate_shift():
    # Elevated UV (>= 8) or health index < 0.75 but >= 0.5 with pristine/moderate air
    query = LichenDynamicsQuery(
        site_id="beartooth-plateau-alpine-tundra",
        morphology="crustose_saxicolous",
        substrate="granitic_gneiss_boulder",
        colony_diameter_mm=40.0,
        annual_growth_rate_mm_yr=0.20,
        uv_exposure_index=8.5,
        snow_cover_duration_months=7.0,
        air_deposition="pristine_baseline",
    )
    result = calculate_lichen_dynamics(query)
    assert result.conservation_status == LichenConservationStatus.VULNERABLE_MICROCLIMATE_SHIFT.value
    assert "VULNERABLE MICROCLIMATE ADVISORY" in result.lichenometry_advisory


def test_calculate_lichen_dynamics_critical_cryoturbation_disturbance():
    # Elevated anthropogenic deposition OR health index < 0.5
    query_elevated_air = LichenDynamicsQuery(
        site_id="torngat-mountains-fjords",
        morphology="fruticose_macrolichen",
        substrate="granitic_gneiss_boulder",
        colony_diameter_mm=120.0,
        annual_growth_rate_mm_yr=0.60,
        uv_exposure_index=5.0,
        snow_cover_duration_months=7.0,
        air_deposition="elevated_anthropogenic",
    )
    result_air = calculate_lichen_dynamics(query_elevated_air)
    assert result_air.conservation_status == LichenConservationStatus.CRITICAL_CRYOTURBATION_DISTURBANCE.value
    assert "CRITICAL CONSERVATION ALERT" in result_air.lichenometry_advisory

    # Low health index (< 0.5) triggered by severe snow deviation and high UV penalty
    query_stressed = LichenDynamicsQuery(
        site_id="wrangell-st-elias-root-glacier",
        morphology="foliose_macrolichen",
        substrate="glacial_till_gravel",
        colony_diameter_mm=30.0,
        annual_growth_rate_mm_yr=0.30,
        uv_exposure_index=9.5,
        snow_cover_duration_months=1.0,  # abs(1 - 7) * 0.05 = 0.30 -> snow_factor = 0.70
        air_deposition="moderate_drift",  # air_factor = 0.75 -> 0.75 * 0.70 - (4.5 * 0.04 = 0.18) = 0.345 < 0.5
    )
    result_stressed = calculate_lichen_dynamics(query_stressed)
    assert result_stressed.conservation_status == LichenConservationStatus.CRITICAL_CRYOTURBATION_DISTURBANCE.value
    assert result_stressed.bioindicator_health_index < 0.5


def test_calculate_lichen_dynamics_invalid_site():
    query = LichenDynamicsQuery(site_id="unknown-polar-peak")
    with pytest.raises(ValueError, match="Tundra lichen site 'unknown-polar-peak' not found"):
        calculate_lichen_dynamics(query)


def test_chemical_spot_test_protocols():
    for morph, keyword in [
        ("crustose_saxicolous", "KOH"),
        ("foliose_macrolichen", "paraphenylenediamine"),
        ("fruticose_macrolichen", "UV-A 365nm"),
        ("squamulose_soil_crust", "iodine"),
        ("unknown_morphology", "secondary metabolite"),
    ]:
        q = LichenDynamicsQuery(site_id="denali-polychrome-pass", morphology=morph)
        res = calculate_lichen_dynamics(q)
        assert keyword in res.chemical_spot_test_protocol


def test_detect_tundra_lichen_intent():
    # Empty string or whitespace
    assert detect_tundra_lichen_intent("") is False
    assert detect_tundra_lichen_intent("   ") is False

    # Positive keywords
    assert detect_tundra_lichen_intent("What is the growth rate of yellow map lichen in Alaska?") is True
    assert detect_tundra_lichen_intent("Tell me about subarctic lichenology and bryophyte ecology") is True
    assert detect_tundra_lichen_intent("How does Rhizocarpon geographicum lichenometry dating work?") is True
    assert detect_tundra_lichen_intent("Cladonia rangiferina caribou moss survey in Torngat") is True
    assert detect_tundra_lichen_intent("Saxicolous crustose thallus morphology") is True
    assert detect_tundra_lichen_intent("Where can I find rock tripe umbilicaria colonies?") is True
    assert detect_tundra_lichen_intent("Tell me about Denali polychrome pass") is True
    assert detect_tundra_lichen_intent("Research expeditions to Torngat mountains") is True
    assert detect_tundra_lichen_intent("Beartooth plateau alpine fellfield sites") is True
    assert detect_tundra_lichen_intent("Brooks Range Anaktuvuk pass tundra basin") is True

    # Negative exclusions
    assert detect_tundra_lichen_intent("Can I get a refund on order #12345?") is False
    assert detect_tundra_lichen_intent("Where is my return label?") is False
    assert detect_tundra_lichen_intent("Tell me about pack goat trekking") is False
    assert detect_tundra_lichen_intent("Dogsled and mushing expedition") is False
    assert detect_tundra_lichen_intent("Snowkiting and kite harness gear") is False
    assert detect_tundra_lichen_intent("Crevasse pulk sled rigging on glacier") is False
    assert detect_tundra_lichen_intent("Wilderness bog-shoeing across muskeg peatland") is False
    assert detect_tundra_lichen_intent("Pothole escape sandtrap ghost anchor") is False
    assert detect_tundra_lichen_intent("Cave diving sump exploration") is False


def test_disambiguation_guard_foraging():
    # Lichen / bryophyte queries in foraging should be blocked by exclusions
    lichen_msg = "Where can I find reindeer lichen or rock tripe in the alpine tundra?"
    assert detect_tundra_lichen_intent(lichen_msg) is True
    assert detect_foraging_intent(lichen_msg) is None


def test_extract_tundra_lichen_intent():
    # Catalog intent
    intent_cat = extract_tundra_lichen_intent("List all alpine tundra lichen research sites")
    assert intent_cat.action == "catalog"

    # Site detail intent
    intent_site = extract_tundra_lichen_intent("Tell me about Denali Polychrome Pass site details and elevation")
    assert intent_site.action == "get_site"
    assert intent_site.site_id == "denali-polychrome-pass"

    # Calculate intent
    intent_calc = extract_tundra_lichen_intent("Calculate lichenometry colony age and growth rate in Beartooth")
    assert intent_calc.action == "calculate"
    assert intent_calc.site_id == "beartooth-plateau-alpine-tundra"

    # Gear checklist intent
    intent_gear = extract_tundra_lichen_intent("What is the mandatory gear checklist for lichenology fieldwork?")
    assert intent_gear.action == "gear_checklist"


def test_format_tundra_lichen_response():
    # Catalog
    resp_cat = format_tundra_lichen_response("catalog")
    assert "Contoso Wilderness Subarctic Tundra Lichenology Catalog" in str(resp_cat)
    assert resp_cat.get("tundra_lichen_info")["action"] == "catalog"
    assert len(resp_cat.get("tundra_lichen_info")["sites"]) == 5

    # Site detail
    resp_site = format_tundra_lichen_response("get_site", "denali-polychrome-pass")
    assert "Denali Polychrome Pass" in str(resp_site)
    assert resp_site.get("tundra_lichen_info")["action"] == "get_site"
    assert resp_site.get("tundra_lichen_info")["site"]["id"] == "denali-polychrome-pass"

    # Gear checklist
    resp_gear = format_tundra_lichen_response("gear_checklist")
    assert "Mandatory Wilderness Subarctic Tundra Lichenology Gear Checklist" in str(resp_gear)
    assert resp_gear.get("tundra_lichen_info")["action"] == "gear_checklist"
    assert resp_gear.get("tundra_lichen_info")["mandatory_count"] == 6

    # Calculate
    calc_q = LichenDynamicsQuery(site_id="torngat-mountains-fjords")
    resp_calc = format_tundra_lichen_response("calculate", calc_q)
    assert "Tundra Lichen Dynamics for Torngat Mountains" in str(resp_calc)
    assert resp_calc.get("tundra_lichen_info")["action"] == "calculate"
    assert "estimated_colony_age_years" in resp_calc.get("tundra_lichen_info")

    # Already formatted pass-through
    passthrough = format_tundra_lichen_response(
        "any", {"tundra_lichen_info": {"custom": True}, "answer": "Custom Answer"}
    )
    assert str(passthrough) == "Custom Answer"
    assert passthrough.get("tundra_lichen_info")["custom"] is True


def test_build_tundra_lichen_prompt():
    prompt_generic = build_tundra_lichen_prompt()
    assert "Wilderness Subarctic Tundra Lichenology" in prompt_generic
    assert "Lichenometry" in prompt_generic
    assert "Rhizocarpon geographicum" in prompt_generic

    prompt_denali = build_tundra_lichen_prompt("Tell me about Denali Polychrome Pass lichens")
    assert "Focused Tundra Site: Denali Polychrome Pass" in prompt_denali


def test_tundra_lichen_tool():
    # Test catalog action
    res_cat = tundra_lichen_tool(action="catalog")
    assert "tundra_lichen_info" in res_cat
    assert res_cat["tundra_lichen_info"]["action"] == "catalog"

    # Test gear action
    res_gear = tundra_lichen_tool(action="gear")
    assert "tundra_lichen_info" in res_gear
    assert res_gear["tundra_lichen_info"]["action"] == "gear_checklist"

    # Test site detail action
    res_site = tundra_lichen_tool(action="get_site", site_id="wrangell-st-elias-root-glacier")
    assert "tundra_lichen_info" in res_site
    assert res_site["tundra_lichen_info"]["site_id"] == "wrangell-st-elias-root-glacier"

    # Test calculate action
    calc_q = LichenDynamicsQuery(site_id="brooks-range-anaktuvuk-pass")
    res_calc = tundra_lichen_tool(action="calculate", query=calc_q)
    assert "tundra_lichen_info" in res_calc
    assert res_calc["tundra_lichen_info"]["action"] == "calculate"


def test_chat_handle_tundra_lichen_intent():
    assert handle_tundra_lichen_intent("What is my shipping status for order #999?") is None
    res = handle_tundra_lichen_intent("What gear do I need for subarctic lichenology research?")
    assert res is not None
    assert "tundra_lichen_info" in res
    assert "answer" in res
    assert len(res["answer"]) > 0


@pytest.mark.anyio
async def test_stream_generate_tundra_lichen_stream_events():
    # Non-matching query returns nothing
    events_unrelated = [
        chunk async for chunk in generate_tundra_lichen_stream_events("Where is my order #1234?")
    ]
    assert len(events_unrelated) == 0

    # Matching query yields lookup and info events
    events_gear = [
        chunk async for chunk in generate_tundra_lichen_stream_events("List tundra lichenology gear checklist")
    ]
    assert len(events_gear) > 0
    raw_str = "".join(events_gear)
    assert "tundra_lichen_lookup" in raw_str
    assert "tundra_lichen_info" in raw_str
    assert "[DONE]" in raw_str


def test_tundra_lichen_extra_coverage():
    # Model alias coverage: "name" without "title", "id" without "item_id", "purpose" without "description"
    s = TundraLichenSite.model_validate({"name": "Only Name", "id": "test-id"})
    assert s.title == "Only Name"

    g = LichenGearItem.model_validate({"id": "only-id", "purpose": "Only Purpose"})
    assert g.item_id == "only-id"
    assert g.description == "Only Purpose"

    # Formatted response contains/getitem with non-string and missing
    data = {"tundra_lichen_info": {"action": "catalog"}, "answer": "text"}
    resp = FormattedTundraLichenResponse("text", data)
    assert 123 not in resp
    assert resp[0] == "t"  # string indexing fallback

    # Zero/negative growth rate calculation
    q_zero = LichenDynamicsQuery(
        site_id="denali-polychrome-pass",
        annual_growth_rate_mm_yr=0.0,
    )
    res_zero = calculate_lichen_dynamics(q_zero)
    assert res_zero.estimated_colony_age_years == 0

    # Fallback air deposition
    q_fallback = LichenDynamicsQuery(
        site_id="denali-polychrome-pass",
        air_deposition="unrecognized_drift",
    )
    res_fallback = calculate_lichen_dynamics(q_fallback)
    assert res_fallback.bioindicator_health_index > 0

    # Intent extraction branch coverage
    i1 = extract_tundra_lichen_intent("Torngat mountains caribou moss survey")
    assert i1.site_id == "torngat-mountains-fjords"
    assert i1.morphology == LichenMorphology.FRUTICOSE_MACROLICHEN.value

    i2 = extract_tundra_lichen_intent("Wrangell rock tripe foliose cluster")
    assert i2.site_id == "wrangell-st-elias-root-glacier"
    assert i2.morphology == LichenMorphology.FOLIOSE_MACROLICHEN.value

    i3 = extract_tundra_lichen_intent("Brooks range squamulose biological soil crust")
    assert i3.site_id == "brooks-range-anaktuvuk-pass"
    assert i3.morphology == LichenMorphology.SQUAMULOSE_SOIL_CRUST.value

    i4 = extract_tundra_lichen_intent("brooks-range-anaktuvuk-pass overview")
    assert i4.site_id == "brooks-range-anaktuvuk-pass"

    # Format response action aliases and object passing
    resp_calc_dyn = format_tundra_lichen_response("calculate_dynamics")
    assert resp_calc_dyn.get("tundra_lichen_info")["action"] == "calculate"

    resp_calc_res = format_tundra_lichen_response("calculate", res_zero)
    assert resp_calc_res.get("tundra_lichen_info")["action"] == "calculate"

    resp_gear_action = format_tundra_lichen_response("gear")
    assert resp_gear_action.get("tundra_lichen_info")["action"] == "gear_checklist"

    resp_site_detail = format_tundra_lichen_response("site_detail", "denali-polychrome-pass")
    assert resp_site_detail.get("tundra_lichen_info")["action"] == "get_site"

    site_obj = get_tundra_site("torngat-mountains-fjords")
    resp_site_obj = format_tundra_lichen_response("get_site", site_obj)
    assert resp_site_obj.get("tundra_lichen_info")["site"]["id"] == "torngat-mountains-fjords"

    resp_site_str = format_tundra_lichen_response("get_site", "torngat-mountains-fjords")
    assert resp_site_str.get("tundra_lichen_info")["site"]["id"] == "torngat-mountains-fjords"

    resp_other = format_tundra_lichen_response("unknown_action")
    assert resp_other.get("tundra_lichen_info")["action"] == "catalog"

    # Prompt builder with Intent object
    prompt_intent = build_tundra_lichen_prompt(i1)
    assert "Torngat Mountains" in prompt_intent
