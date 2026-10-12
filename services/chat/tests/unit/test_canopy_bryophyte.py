"""Unit tests for Backcountry Temperate Rainforest Epiphytic Bryophyte & Canopy Tree-Fern Ecology Tooling."""

import pytest
from contoso_chat.canopy_bryophyte import (
    DEFAULT_CANOPY_BRYOPHYTE_SITES,
    CanopyBryophyteConservationStatus,
    CanopyBryophyteDynamicsQuery,
    CanopyBryophyteDynamicsResult,
    CanopyBryophyteGearItem,
    CanopyBryophyteSite,
    CanopyStratum,
    EpiphyteHydrationState,
    FormattedCanopyBryophyteResponse,
    HostSubstrate,
    RainforestMicroclimate,
    build_canopy_bryophyte_prompt,
    calculate_canopy_bryophyte_dynamics,
    canopy_bryophyte_tool,
    detect_canopy_bryophyte_intent,
    extract_canopy_bryophyte_intent,
    format_canopy_bryophyte_response,
    get_canopy_bryophyte_gear,
    get_canopy_bryophyte_site,
    get_canopy_bryophyte_sites,
)
from contoso_chat.chat import handle_canopy_bryophyte_intent
from contoso_chat.tree_climbing import detect_tree_climbing_intent
from contoso_chat.tundra_lichen import detect_tundra_lichen_intent
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


# -----------------------------------------------------------------------------
# 1. Enums Tests
# -----------------------------------------------------------------------------
def test_canopy_stratum_values():
    assert CanopyStratum.GROUND_FLOOR_BRYOSPHERE.value == "ground_floor_bryosphere"
    assert CanopyStratum.SUBCANOPY_TRUNK_EPIPHYTES.value == "subcanopy_trunk_epiphytes"
    assert CanopyStratum.TREE_FERN_CAUDEX_SKIRT.value == "tree_fern_caudex_skirt"
    assert CanopyStratum.MID_CANOPY_BRANCH_MATS.value == "mid_canopy_branch_mats"
    assert CanopyStratum.EMERGENT_OUTER_CANOPY.value == "emergent_outer_canopy"


def test_host_substrate_values():
    assert HostSubstrate.SITKA_SPRUCE_BARK.value == "sitka_spruce_bark"
    assert HostSubstrate.WESTERN_HEMLOCK_FLUTED_TRUNK.value == "western_hemlock_fluted_trunk"
    assert HostSubstrate.DICKSONIA_ANTARCTICA_FIBROUS_CAUDEX.value == "dicksonia_antarctica_fibrous_caudex"
    assert HostSubstrate.BIGLEAF_MAPLE_EPIPHYTE_LIMB.value == "bigleaf_maple_epiphyte_limb"
    assert HostSubstrate.TASMANIAN_MYRTLE_BEECH.value == "tasmanian_myrtle_beech"


def test_rainforest_microclimate_values():
    assert RainforestMicroclimate.HYPER_MARITIME_PERHUMID.value == "hyper_maritime_perhumid"
    assert RainforestMicroclimate.MONTANE_CLOUD_INVERSION.value == "montane_cloud_inversion"
    assert RainforestMicroclimate.SHELTERED_RIPARIAN_GORGE.value == "sheltered_riparian_gorge"
    assert RainforestMicroclimate.SEASONALLY_BUFFERED_TEMPERATE.value == "seasonally_buffered_temperate"


def test_epiphyte_hydration_state_values():
    assert EpiphyteHydrationState.POIKILOHYDRIC_DORMANT.value == "poikilohydric_dormant"
    assert EpiphyteHydrationState.ACTIVE_PHOTOSYNTHETIC_SATURATION.value == "active_photosynthetic_saturation"
    assert EpiphyteHydrationState.FOG_INTERCEPTION_PHASE.value == "fog_interception_phase"


def test_canopy_bryophyte_conservation_status_values():
    assert CanopyBryophyteConservationStatus.PRISTINE_CLIMAX_BRYOSPHERE.value == "pristine_climax_bryosphere"
    assert CanopyBryophyteConservationStatus.VULNERABLE_FRAGMENTATION_RISK.value == "vulnerable_fragmentation_risk"
    assert CanopyBryophyteConservationStatus.MICROCLIMATE_DESICCATION_WARNING.value == "microclimate_desiccation_warning"


# -----------------------------------------------------------------------------
# 2. Pydantic Models & Aliases Tests
# -----------------------------------------------------------------------------
def test_canopy_bryophyte_site_aliases():
    data = {
        "siteId": "test-site",
        "title": "Test Canopy Site",
        "elevationMeters": 250.0,
        "dominantStratum": "mid_canopy_branch_mats",
        "primarySubstrate": "bigleaf_maple_epiphyte_limb",
        "microclimate": "hyper_maritime_perhumid",
        "description": "Test site description",
        "highlights": ["Epiphyte carpets", "Old-growth firs"],
    }
    site = CanopyBryophyteSite(**data)
    assert site.id == "test-site"
    assert site.site_id == "test-site"
    assert site.siteId == "test-site"
    assert site.title == "Test Canopy Site"
    assert site.name == "Test Canopy Site"
    assert site.elevation_meters == 250.0
    assert site.elevationMeters == 250.0
    assert site.dominant_stratum == "mid_canopy_branch_mats"
    assert site.dominantStratum == "mid_canopy_branch_mats"
    assert site.primary_substrate == "bigleaf_maple_epiphyte_limb"
    assert site.primarySubstrate == "bigleaf_maple_epiphyte_limb"


def test_canopy_bryophyte_dynamics_query_aliases():
    data = {
        "siteId": "hoh-river-hall-of-mosses",
        "stratum": "mid_canopy_branch_mats",
        "substrate": "bigleaf_maple_epiphyte_limb",
        "ambientHumidityPercent": 92.0,
        "canopyHeightMeters": 42.0,
        "fogDripRateMmDay": 6.0,
        "matThicknessCm": 15.0,
    }
    query = CanopyBryophyteDynamicsQuery(**data)
    assert query.site_id == "hoh-river-hall-of-mosses"
    assert query.siteId == "hoh-river-hall-of-mosses"
    assert query.ambient_humidity_percent == 92.0
    assert query.ambientHumidityPercent == 92.0
    assert query.canopy_height_meters == 42.0
    assert query.canopyHeightMeters == 42.0
    assert query.fog_drip_rate_mm_day == 6.0
    assert query.fogDripRateMmDay == 6.0
    assert query.mat_thickness_cm == 15.0
    assert query.matThicknessCm == 15.0


def test_canopy_bryophyte_dynamics_result_aliases():
    res = CanopyBryophyteDynamicsResult(
        site_title="Hoh River Hall of Mosses",
        site_id="hoh-river-hall-of-mosses",
        water_storage_capacity_liters_m2=75.5,
        poikilohydric_recovery_time_minutes=12.0,
        canopy_epiphyte_biomass_kg_ha=3800.0,
        microclimate_buffer_index=0.88,
        conservation_status="pristine_climax_bryosphere",
        canopy_access_protocol="SRT friction saver protocol",
        microscope_identification_advisory="Examine alar cells at 20x",
    )
    assert res.siteTitle == "Hoh River Hall of Mosses"
    assert res.siteId == "hoh-river-hall-of-mosses"
    assert res.waterStorageCapacityLitersM2 == 75.5
    assert res.poikilohydricRecoveryTimeMinutes == 12.0
    assert res.canopyEpiphyteBiomassKgHa == 3800.0
    assert res.microclimateBufferIndex == 0.88
    assert res.conservationStatus == "pristine_climax_bryosphere"
    assert res.canopyAccessProtocol == "SRT friction saver protocol"
    assert res.microscopeIdentificationAdvisory == "Examine alar cells at 20x"


def test_canopy_bryophyte_gear_item_aliases():
    item = CanopyBryophyteGearItem(
        itemId="arborist-friction-cambium-saver",
        name="Arborist Friction Cambium Saver Sleeve",
        category="canopy_access",
        mandatory=True,
        purpose="Protect host tree cambium from rope burn",
    )
    assert item.item_id == "arborist-friction-cambium-saver"
    assert item.id == "arborist-friction-cambium-saver"
    assert item.itemId == "arborist-friction-cambium-saver"
    assert item.description == "Protect host tree cambium from rope burn"


# -----------------------------------------------------------------------------
# 3. Catalog & Gear Tests
# -----------------------------------------------------------------------------
def test_default_sites_catalog():
    assert len(DEFAULT_CANOPY_BRYOPHYTE_SITES) == 5
    site_ids = list(DEFAULT_CANOPY_BRYOPHYTE_SITES.keys())
    expected = [
        "hoh-river-hall-of-mosses",
        "tarkine-takayna-rainforest",
        "fiordland-milford-sound-canopy",
        "yakushima-ancient-cedar-moss",
        "great-bear-rainforest-fjords",
    ]
    for exp in expected:
        assert exp in site_ids

    # Query helper functions
    all_sites = get_canopy_bryophyte_sites()
    assert len(all_sites) == 5

    hoh = get_canopy_bryophyte_site("hoh-river-hall-of-mosses")
    assert hoh is not None
    assert hoh.dominant_stratum == CanopyStratum.MID_CANOPY_BRANCH_MATS.value
    assert len(hoh.highlights) >= 3

    assert get_canopy_bryophyte_site("non-existent-site") is None

    # Filter by stratum
    tree_fern_sites = get_canopy_bryophyte_sites(stratum=CanopyStratum.TREE_FERN_CAUDEX_SKIRT.value)
    assert len(tree_fern_sites) == 1
    assert tree_fern_sites[0].id == "tarkine-takayna-rainforest"


def test_gear_catalog():
    gear = get_canopy_bryophyte_gear()
    assert len(gear) == 6
    assert all(item.mandatory for item in gear)
    gear_ids = [item.item_id for item in gear]
    expected_gear = [
        "arborist-friction-cambium-saver",
        "lightweight-srt-canopy-ascent-kit",
        "handheld-20x-achromatic-loupe",
        "digital-ultrasonic-fog-canopy-hygrometer",
        "breathable-botanical-collection-pouches",
        "tree-fern-caudex-caliper-gauge",
    ]
    for g_id in expected_gear:
        assert g_id in gear_ids


# -----------------------------------------------------------------------------
# 4. Calculation Dynamics Tests
# -----------------------------------------------------------------------------
def test_calculate_canopy_bryophyte_dynamics_nominal():
    query = CanopyBryophyteDynamicsQuery(
        site_id="hoh-river-hall-of-mosses",
        stratum=CanopyStratum.MID_CANOPY_BRANCH_MATS.value,
        substrate=HostSubstrate.BIGLEAF_MAPLE_EPIPHYTE_LIMB.value,
        ambient_humidity_percent=88.0,
        canopy_height_meters=35.0,
        fog_drip_rate_mm_day=5.0,
        mat_thickness_cm=14.0,
    )
    result = calculate_canopy_bryophyte_dynamics(query)
    assert result.site_title == "Hoh River Hall of Mosses"
    assert result.site_id == "hoh-river-hall-of-mosses"
    assert 10.0 <= result.water_storage_capacity_liters_m2 <= 120.0
    assert 5.0 <= result.poikilohydric_recovery_time_minutes <= 90.0
    assert 500.0 <= result.canopy_epiphyte_biomass_kg_ha <= 5000.0
    assert 0.0 <= result.microclimate_buffer_index <= 1.00
    assert result.conservation_status == CanopyBryophyteConservationStatus.PRISTINE_CLIMAX_BRYOSPHERE.value
    assert len(result.canopy_access_protocol) > 0
    assert len(result.microscope_identification_advisory) > 0


def test_calculate_canopy_bryophyte_dynamics_critical():
    query = CanopyBryophyteDynamicsQuery(
        site_id="yakushima-ancient-cedar-moss",
        stratum=CanopyStratum.EMERGENT_OUTER_CANOPY.value,
        substrate=HostSubstrate.WESTERN_HEMLOCK_FLUTED_TRUNK.value,
        ambient_humidity_percent=45.0,
        canopy_height_meters=45.0,
        fog_drip_rate_mm_day=0.5,
        mat_thickness_cm=2.0,
    )
    result = calculate_canopy_bryophyte_dynamics(query)
    assert result.conservation_status == CanopyBryophyteConservationStatus.MICROCLIMATE_DESICCATION_WARNING.value
    assert result.poikilohydric_recovery_time_minutes > 40.0
    assert result.microclimate_buffer_index < 0.60


def test_calculate_canopy_bryophyte_dynamics_invalid_site():
    query = CanopyBryophyteDynamicsQuery(
        site_id="invalid-cloud-forest",
    )
    with pytest.raises(ValueError) as exc:
        calculate_canopy_bryophyte_dynamics(query)
    assert "not found" in str(exc.value)


# -----------------------------------------------------------------------------
# 5. Intent Detection & Disambiguation Tests
# -----------------------------------------------------------------------------
def test_detect_canopy_bryophyte_intent_positive():
    queries = [
        "Tell me about canopy bryophyte mats in the Hoh River valley",
        "What is the water capacity of epiphytic bryophyte cushions?",
        "Can you calculate tree-fern caudex skirt dynamics for Takayna?",
        "How do Dicksonia antarctica caudex skirts buffer humidity?",
        "Examine nurse log moss carpets in the Great Bear Rainforest",
        "What are the pendulous moss species hanging from bigleaf maples?",
        "Show me the canopy moss checklist",
        "Takayna rainforest epiphytes and ancient bryosphere",
    ]
    for q in queries:
        assert detect_canopy_bryophyte_intent(q) is True, f"Failed to detect: {q}"


def test_detect_canopy_bryophyte_intent_exclusions():
    queries = [
        "Where is my order #12345?",
        "Can I get a refund on my sleeping bag?",
        "Return label for pack boots",
        "Slickrock burro pack saddle rigging in Chute Canyon",
        "Tundra lichen bioindicator survey in Denali",
        "Rock climbing trad rack setup in Yosemite",
        "Cave diving sump navigation in Peacock Springs",
    ]
    for q in queries:
        assert detect_canopy_bryophyte_intent(q) is False, f"Should exclude: {q}"


def test_cross_domain_disambiguation_with_tree_climbing_and_lichen():
    # Tree climbing and tundra lichen should NOT match canopy bryophyte messages
    bryo_message = "What cambium saver and SRT kit do I need for canopy bryophyte and tree fern research in Takayna?"
    assert detect_canopy_bryophyte_intent(bryo_message) is True

    # Tree climbing intent detection should yield None because of canopy bryophyte exclusions
    assert detect_tree_climbing_intent(bryo_message) is None

    # Tundra lichen detection should be False
    assert detect_tundra_lichen_intent(bryo_message) is False


def test_extract_canopy_bryophyte_intent():
    # Catalog intent
    intent_cat = extract_canopy_bryophyte_intent("Show me the rainforest canopy bryophyte catalog")
    assert intent_cat.action == "catalog"
    assert intent_cat.site_id is None

    # Site detail intent
    intent_site = extract_canopy_bryophyte_intent("Tell me about the Hoh River Hall of Mosses canopy bryophytes")
    assert intent_site.action == "get_site"
    assert intent_site.site_id == "hoh-river-hall-of-mosses"

    # Calculation intent
    intent_calc = extract_canopy_bryophyte_intent("Calculate canopy epiphyte water storage and biomass for Takayna")
    assert intent_calc.action == "calculate"
    assert intent_calc.site_id == "tarkine-takayna-rainforest"

    # Gear checklist intent
    intent_gear = extract_canopy_bryophyte_intent("What gear and 20x loupe do I need for canopy bryophytes?")
    assert intent_gear.action == "gear_checklist"


# -----------------------------------------------------------------------------
# 6. Response Formatting & Prompt Generation Tests
# -----------------------------------------------------------------------------
def test_format_canopy_bryophyte_response():
    # Catalog
    resp_cat = format_canopy_bryophyte_response("catalog")
    assert isinstance(resp_cat, FormattedCanopyBryophyteResponse)
    assert "canopy_bryophyte_info" in resp_cat
    assert resp_cat["canopy_bryophyte_info"]["action"] == "catalog"
    assert len(resp_cat["canopy_bryophyte_info"]["sites"]) == 5

    # Gear
    resp_gear = format_canopy_bryophyte_response("gear_checklist")
    assert resp_gear["canopy_bryophyte_info"]["action"] == "gear_checklist"
    assert resp_gear["canopy_bryophyte_info"]["mandatory_count"] == 6

    # Get Site
    resp_site = format_canopy_bryophyte_response("get_site", "tarkine-takayna-rainforest")
    assert resp_site["canopy_bryophyte_info"]["action"] == "get_site"
    assert resp_site["canopy_bryophyte_info"]["site_id"] == "tarkine-takayna-rainforest"

    # Calculate
    resp_calc = format_canopy_bryophyte_response("calculate", "fiordland-milford-sound-canopy")
    assert resp_calc["canopy_bryophyte_info"]["action"] == "calculate"
    assert "water_storage_capacity_liters_m2" in resp_calc["canopy_bryophyte_info"]


def test_build_canopy_bryophyte_prompt():
    prompt = build_canopy_bryophyte_prompt("Explain the bryophyte water dynamics in Hoh River Hall of Mosses")
    assert "Temperate Rainforest Epiphytic Bryophyte & Canopy Tree-Fern" in prompt
    assert "Hoh River Hall of Mosses" in prompt
    assert "Cambium" in prompt or "cambium" in prompt


# -----------------------------------------------------------------------------
# 7. Assistant Tool & Chat Handlers Tests
# -----------------------------------------------------------------------------
def test_canopy_bryophyte_tool():
    # Catalog
    cat_res = canopy_bryophyte_tool(action="catalog")
    assert "canopy_bryophyte_info" in cat_res
    assert cat_res["canopy_bryophyte_info"]["action"] == "catalog"

    # Gear
    gear_res = canopy_bryophyte_tool(action="gear_checklist")
    assert gear_res["canopy_bryophyte_info"]["action"] == "gear_checklist"

    # Site detail
    site_res = canopy_bryophyte_tool(action="get_site", site_id="yakushima-ancient-cedar-moss")
    assert site_res["canopy_bryophyte_info"]["action"] == "get_site"
    assert site_res["canopy_bryophyte_info"]["site_id"] == "yakushima-ancient-cedar-moss"

    # Calculate
    calc_res = canopy_bryophyte_tool(action="calculate", site_id="great-bear-rainforest-fjords")
    assert calc_res["canopy_bryophyte_info"]["action"] == "calculate"


def test_handle_canopy_bryophyte_intent():
    res = handle_canopy_bryophyte_intent("What is the epiphyte biomass in Takayna tree-fern skirts?")
    assert res is not None
    assert "canopy_bryophyte_info" in res
    assert "answer" in res
    assert res["canopy_bryophyte_info"]["action"] == "calculate"

    # Non matching
    res_none = handle_canopy_bryophyte_intent("Where is my package shipment?")
    assert res_none is None
