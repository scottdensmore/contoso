import pytest
from contoso_chat.canyon_bouldering import (
    BoulderingIntent,
    BoulderingRequest,
    CanyonBoulderingSectorModel,
    FormattedBoulderingResponse,
    build_canyon_bouldering_prompt,
    calculate_bouldering_dynamics,
    canyon_bouldering_tool,
    detect_canyon_bouldering_intent,
    format_canyon_bouldering_response,
    get_canyon_bouldering_gear_checklist,
    get_canyon_bouldering_sector,
    get_canyon_bouldering_sectors,
)


def test_canyon_bouldering_sector_model():
    sector = CanyonBoulderingSectorModel(
        sector_id="buttermilks-peabody-highballs",
        title="Buttermilks Peabody Boulders",
        canyon_location="Buttermilk Country, Bishop",
        region="Eastern Sierra, California, USA",
        max_boulder_height_m=16.0,
        v_grade_range="V0 - V16",
        bouldering_style="highball_quartz_monzonite",
        landing_hazard="talus_uneven_groundfall",
        description="World-renowned mega-highballs including Grandpa Peabody and Grandma Peabody.",
        highlights=[
            "Grandpa Peabody 15m highballs",
            "Lucid Dreaming (V15)",
            "Mandatory multi-pad highball stacking arrays",
        ],
    )
    assert sector.sector_id == "buttermilks-peabody-highballs"
    assert sector.max_boulder_height_m == 16.0
    assert len(sector.highlights) == 3


def test_get_canyon_bouldering_sectors_all():
    sectors = get_canyon_bouldering_sectors()
    assert len(sectors) == 5
    sector_ids = [s.sector_id for s in sectors]
    assert "buttermilks-peabody-highballs" in sector_ids
    assert "joes-valley-straight-canyon" in sector_ids
    assert "red-rock-kraft-boulders" in sector_ids
    assert "rocktown-pigeon-mountain" in sector_ids
    assert "hueco-tanks-north-mountain" in sector_ids


def test_get_canyon_bouldering_sectors_filtering():
    highball_sectors = get_canyon_bouldering_sectors(style="highball_quartz_monzonite")
    assert len(highball_sectors) == 1
    assert highball_sectors[0].sector_id == "buttermilks-peabody-highballs"

    sandstone_pockets = get_canyon_bouldering_sectors(style="sandstone_roofs_and_pockets")
    assert len(sandstone_pockets) == 1
    assert sandstone_pockets[0].sector_id == "joes-valley-straight-canyon"

    varnish_sectors = get_canyon_bouldering_sectors(style="sandstone_varnish_edges")
    assert len(varnish_sectors) == 1
    assert varnish_sectors[0].sector_id == "red-rock-kraft-boulders"


def test_get_canyon_bouldering_sector_lookup():
    sector = get_canyon_bouldering_sector("buttermilks-peabody-highballs")
    assert sector is not None
    assert sector.title == "Buttermilks Peabody Boulders"
    assert sector.max_boulder_height_m == 16.0

    invalid = get_canyon_bouldering_sector("nonexistent-sector")
    assert invalid is None


def test_calculate_bouldering_dynamics_default():
    req = BoulderingRequest()
    res = calculate_bouldering_dynamics(req)
    assert res.sector_id == "buttermilks-peabody-highballs"
    assert res.sector_title == "Buttermilks Peabody Boulders"
    assert res.bouldering_style == "highball_quartz_monzonite"
    assert res.landing_hazard == "talus_uneven_groundfall"
    # impact_energy_joules = round(72.0 * 9.81 * 6.5) = 4591
    assert res.impact_energy_joules == 4591
    # required_pads = 3 (fall_height 6.5 <= 8.0)
    # pad_coverage_adequacy_percent = min(100, round((3 / 3) * 100)) = 100
    assert res.pad_coverage_adequacy_percent == 100
    # fall_hazard_rating: fall_height 6.5 > 5.0, pads=3 (not <2) and spotters=2 (not <1) -> safe_cushioned_drop
    assert res.fall_hazard_rating == "safe_cushioned_drop"
    assert len(res.spotting_recommendation) > 10
    assert len(res.pad_layout_advisory) > 10


def test_calculate_bouldering_dynamics_hazardous_highball():
    # fall_height_m > 9.0 and crash_pads_count < 4
    req = BoulderingRequest(
        sector_id="buttermilks-peabody-highballs",
        fall_height_m=10.0,
        climber_weight_kg=75.0,
        crash_pads_count=2,
        spotters_count=2,
    )
    res = calculate_bouldering_dynamics(req)
    # 75.0 * 9.81 * 10.0 = 7357.5 -> 7358
    assert res.impact_energy_joules == 7358
    # required_pads = 5 (fall_height > 8.0)
    # pad_coverage_adequacy_percent = round((2 / 5) * 100) = 40
    assert res.pad_coverage_adequacy_percent == 40
    assert res.fall_hazard_rating == "hazardous_highball_groundfall_risk"
    assert "CRITICAL HIGHBALL" in res.spotting_recommendation.upper() or "HIGHBALL" in res.spotting_recommendation.upper()
    assert "MANDATORY" in res.pad_layout_advisory.upper() or "STACKING" in res.pad_layout_advisory.upper()


def test_calculate_bouldering_dynamics_caution():
    # fall_height_m > 5.0 and (crash_pads_count < 2 or spotters_count < 1)
    req = BoulderingRequest(
        sector_id="red-rock-kraft-boulders",
        fall_height_m=6.0,
        climber_weight_kg=68.0,
        crash_pads_count=1,
        spotters_count=1,
    )
    res = calculate_bouldering_dynamics(req)
    assert res.fall_hazard_rating == "caution_multiple_pads_spotter_required"
    # required_pads = 3
    # pad_coverage_adequacy_percent = round((1 / 3) * 100) = 33
    assert res.pad_coverage_adequacy_percent == 33
    assert "CAUTION" in res.spotting_recommendation.upper() or "SPOTTER" in res.spotting_recommendation.upper()


def test_calculate_bouldering_dynamics_unknown_sector():
    req = BoulderingRequest(sector_id="unknown-sector-id")
    with pytest.raises(ValueError, match="not found"):
        calculate_bouldering_dynamics(req)


def test_get_canyon_bouldering_gear_checklist():
    gear = get_canyon_bouldering_gear_checklist()
    assert len(gear) == 6
    item_ids = [g.item_id for g in gear]
    assert "highball-triple-layer-crash-pad" in item_ids
    assert "blubber-hinge-cover-pad" in item_ids
    assert "slider-sit-start-pad" in item_ids
    assert "heavy-duty-chalk-bucket-with-brushes" in item_ids
    assert "athletic-bouldering-tape-and-skin-kit" in item_ids
    assert "telescoping-boulder-cleaning-pole" in item_ids

    mandatory_items = [g for g in gear if g.mandatory]
    assert len(mandatory_items) >= 3


def test_detect_canyon_bouldering_intent_exclusions():
    exclusions = [
        "order # 12345 bouldering problem",
        "Can I get a refund for my crash pad",
        "return label for bouldering shoes",
        "shipping tracking for highball crash pad",
        "burro carrying crash pad",
        "horse bouldering trip",
        "pack goat in buttermilks canyon",
        "dogsled canyon bouldering",
        "trapping animals in sandstone canyon",
        "gold pan near sandstone boulder",
        "beachcombing highball rocks",
        "fire lookout over joe's valley",
        "snowshoe to buttermilks boulders",
        "sandboarding down kraft boulders",
        "cave diving bouldering cave",
        "caving in red rock kraft",
        "ski touring bishop buttermilks",
        "steep skiing near highballs",
        "nordic skiing in canyon bouldering area",
        "telemark skiing to sandstone boulders",
        "falconry and canyon bouldering",
        "llama carrying crashpad array",
        "pack llama bouldering expedition",
        "zipline over buttermilks highball boulders",
        "zip line near rocktown pigeon mountain",
        "turtle patrol on bouldering beach",
        "sea turtle landing zone",
        "night via ferrata in bishop",
        "via ferrata bouldering",
        "big wall climbing el cap",
        "psicobloc deep water bouldering",
        "tree climbing in joe's valley",
        "ice climbing canyon bouldering",
        "rentals for crash pads",
        "bouldering crash pad rental catalog",
    ]
    for q in exclusions:
        assert detect_canyon_bouldering_intent(q) is None, f"Expected exclusion for: {q}"


def test_detect_canyon_bouldering_intent_keywords_and_disambiguation():
    # Direct canyon bouldering queries
    queries = [
        ("Calculate highball impact energy and spotter requirements for Buttermilks Peabody boulders", "calculate", "buttermilks-peabody-highballs"),
        ("What crash pad logistics and landing zone advice do you have for Joe's Valley bouldering?", "gear", "joes-valley-straight-canyon"),
        ("Tell me about Red Rock Kraft canyon boulders and sandstone varnish edges", "sector_detail", "red-rock-kraft-boulders"),
        ("List all wilderness canyon bouldering sectors and sandstone boulder options", "sectors_list", None),
        ("Rocktown Pigeon Mountain bouldering problems landing zone management", "sector_detail", "rocktown-pigeon-mountain"),
        ("Hueco Tanks North Mountain syenite porphyry highball bouldering", "sector_detail", "hueco-tanks-north-mountain"),
        ("What is the crashpad array and blubber pad equipment checklist for highball crash pad landing?", "gear", None),
        ("Pebble wrestling fall dynamics and kinetic impact calculation", "calculate", None),
    ]

    for q, expected_action, expected_sector in queries:
        intent = detect_canyon_bouldering_intent(q)
        assert intent is not None, f"Failed to detect intent for: {q}"
        assert intent.action == expected_action, f"Action mismatch for '{q}': {intent.action} != {expected_action}"
        if expected_sector:
            assert intent.sector_id == expected_sector, f"Sector mismatch for '{q}': {intent.sector_id} != {expected_sector}"


def test_detect_canyon_bouldering_vs_generic_climbing():
    query = "Tell me about Buttermilks highball boulders Bishop and crash pad stacking logistics"
    cb_intent = detect_canyon_bouldering_intent(query)
    assert cb_intent is not None
    assert cb_intent.sector_id == "buttermilks-peabody-highballs"


def test_format_canyon_bouldering_response():
    # Calculate action
    calc_intent = BoulderingIntent(action="calculate", sector_id="buttermilks-peabody-highballs")
    formatted_calc = format_canyon_bouldering_response(calc_intent)
    assert isinstance(formatted_calc, FormattedBoulderingResponse)
    assert "canyon_bouldering_info" in formatted_calc
    calc_info = formatted_calc.get("canyon_bouldering_info")
    assert calc_info["action"] == "calculate"
    assert calc_info["sector_id"] == "buttermilks-peabody-highballs"
    assert "impact_energy_joules" in calc_info
    assert "pad_coverage_adequacy_percent" in calc_info

    # Gear action
    gear_intent = BoulderingIntent(action="gear")
    formatted_gear = format_canyon_bouldering_response(gear_intent)
    gear_info = formatted_gear.get("canyon_bouldering_info")
    assert gear_info["action"] == "gear"
    assert len(gear_info["gear"]) == 6

    # Detail action
    detail_intent = BoulderingIntent(action="sector_detail", sector_id="joes-valley-straight-canyon")
    formatted_detail = format_canyon_bouldering_response(detail_intent)
    detail_info = formatted_detail.get("canyon_bouldering_info")
    assert detail_info["action"] == "sector_detail"
    assert detail_info["sector"]["title"] == "Joe's Valley Straight Canyon"

    # List action
    list_intent = BoulderingIntent(action="sectors_list")
    formatted_list = format_canyon_bouldering_response(list_intent)
    list_info = formatted_list.get("canyon_bouldering_info")
    assert list_info["action"] == "sectors_list"
    assert len(list_info["sectors"]) == 5


def test_build_canyon_bouldering_prompt():
    prompt = build_canyon_bouldering_prompt(BoulderingIntent(action="calculate", sector_id="buttermilks-peabody-highballs"))
    assert "canyon bouldering" in prompt.lower() or "highball" in prompt.lower()
    assert "Grandpa Peabody" in prompt or "Peabody" in prompt
    assert "Crash Pad" in prompt or "crash pad" in prompt.lower()


def test_canyon_bouldering_tool():
    res_dict = canyon_bouldering_tool(action="sectors_list")
    assert "canyon_bouldering_info" in res_dict
    assert res_dict["canyon_bouldering_info"]["action"] == "sectors_list"

    res_calc = canyon_bouldering_tool(action="calculate", sector_id="red-rock-kraft-boulders")
    assert "canyon_bouldering_info" in res_calc
    assert res_calc["canyon_bouldering_info"]["action"] == "calculate"


def test_detect_canyon_bouldering_intent_edge_cases():
    assert detect_canyon_bouldering_intent("") is None
    assert detect_canyon_bouldering_intent("   ") is None
    assert detect_canyon_bouldering_intent("completely unrelated book query") is None

    # Style extractions
    intent_slopers = detect_canyon_bouldering_intent("sandstone slopers and roofs bouldering in rocktown")
    assert intent_slopers is not None
    assert intent_slopers.bouldering_style == "sandstone_slopers_and_roofs"

    intent_syenite = detect_canyon_bouldering_intent("syenite porphyry roof tanks bouldering at hueco tanks")
    assert intent_syenite is not None
    assert intent_syenite.bouldering_style == "syenite_porphyry_roof_tanks"


def test_formatted_bouldering_response_methods():
    raw_data = {"canyon_bouldering_info": {"action": "sectors_list"}, "answer": "Test answer"}
    formatted = FormattedBoulderingResponse("Test answer", raw_data)

    assert formatted["canyon_bouldering_info"]["action"] == "sectors_list"
    assert "canyon_bouldering_info" in formatted
    assert 123 not in formatted
    assert "nonexistent_key" not in formatted
    assert list(formatted.keys()) == ["canyon_bouldering_info", "answer"]
    assert len(list(formatted.values())) == 2
    assert len(list(formatted.items())) == 2

    # Test format_canyon_bouldering_response with dict
    formatted_from_dict = format_canyon_bouldering_response({"answer": "dict answer", "extra": 1})
    assert str(formatted_from_dict) == "dict answer"
    assert formatted_from_dict.get("extra") == 1

    # Test format_canyon_bouldering_response with string
    formatted_from_str = format_canyon_bouldering_response("crash pad logistics in Joe's Valley")
    assert "canyon_bouldering_info" in formatted_from_str
