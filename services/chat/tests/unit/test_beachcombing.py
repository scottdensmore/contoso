import pytest
from contoso_chat.beachcombing import (
    BeachcombingGearItemModel,
    BeachcombingIntent,
    BeachcombingRequest,
    BeachcombingResponse,
    BeachcombingSiteModel,
    FormattedBeachcombingResponse,
    beachcombing_tool,
    build_beachcombing_prompt,
    calculate_beachcombing,
    detect_beachcombing_intent,
    format_beachcombing_response,
    get_beachcombing_gear,
    get_beachcombing_site,
    get_beachcombing_sites,
)


def test_beachcombing_site_model():
    site = BeachcombingSiteModel(
        site_id="glass-beach-fort-bragg",
        title="Glass Beach & MacKerricher Coves",
        region="Mendocino County, CA",
        coastline="Pacific Northern California",
        elevation_m=4,
        shoreline_type="gravel_pebble_cove",
        primary_glass_colors=["Cobalt Blue", "Seafoam Green", "Amber", "Ruby Red"],
        typical_tidal_range_m=2.1,
        storm_deposit_index=8.4,
        access_difficulty="easy_beach_stroll",
        description="Historic coastal glass beach formed by decades of ocean wave tumbling in sheltered shingle coves.",
        highlights=[
            "Dense pebble beds with tumbled sea glass gems",
            "Pacific northern swell and gravel sorting",
            "Mendocino coastal park boundaries and tide pools",
        ],
    )
    assert site.site_id == "glass-beach-fort-bragg"
    assert site.elevation_m == 4
    assert site.shoreline_type == "gravel_pebble_cove"
    assert "Cobalt Blue" in site.primary_glass_colors
    assert site.typical_tidal_range_m == 2.1
    assert site.storm_deposit_index == 8.4
    assert len(site.highlights) == 3


def test_beachcombing_request_defaults():
    req = BeachcombingRequest()
    assert req.site_id == "glass-beach-fort-bragg"
    assert req.search_hours == 3.0
    assert req.tidal_drop_m == 2.5
    assert req.storm_surge_days_ago == 3
    assert req.tumble_energy == "extreme_ocean_surf"


def test_beachcombing_response_model():
    resp = BeachcombingResponse(
        site_id="glass-beach-fort-bragg",
        site_title="Glass Beach & MacKerricher Coves",
        expected_yield_pieces=44,
        patina_quality_grade="ancient_c_fractured_frost",
        patina_rating_percent=95,
        optimal_foraging_status="prime_low_tide_wrack_window",
        rarity_odds="1:100 for Ruby Red, 1:50 for Cobalt Blue, 1:10 for Seafoam Green",
        tide_safety_advisory="Ebb tide window optimal; forage at wet swash line.",
        conservation_advisory="Observe local reserve regulations; leave historical specimens in place.",
    )
    assert resp.site_id == "glass-beach-fort-bragg"
    assert resp.expected_yield_pieces == 44
    assert resp.patina_quality_grade == "ancient_c_fractured_frost"
    assert resp.patina_rating_percent == 95
    assert resp.optimal_foraging_status == "prime_low_tide_wrack_window"


def test_beachcombing_gear_item_model():
    gear = BeachcombingGearItemModel(
        item_id="uv-blacklight-365nm",
        name="365nm Longwave UV Blacklight Torch",
        category="illumination",
        mandatory=True,
        purpose="Fluoresces uranium vaseline glass and manganese sun-purple patina on night low tides.",
    )
    assert gear.item_id == "uv-blacklight-365nm"
    assert gear.mandatory is True
    assert gear.category == "illumination"


def test_beachcombing_intent_model():
    intent = BeachcombingIntent(
        action="sites_list",
        site_id=None,
        shoreline_type="gravel_pebble_cove",
    )
    assert intent.action == "sites_list"
    assert intent.shoreline_type == "gravel_pebble_cove"


def test_formatted_beachcombing_response():
    resp = FormattedBeachcombingResponse(
        "Sea glass foraging response text",
        {"beachcombing_info": {"status": "ok"}, "answer": "Sea glass foraging response text"},
    )
    assert isinstance(resp, dict)
    assert resp.answer == "Sea glass foraging response text"
    assert str(resp) == "Sea glass foraging response text"
    assert resp["beachcombing_info"]["status"] == "ok"
    assert resp.get("beachcombing_info") == {"status": "ok"}


def test_get_beachcombing_sites_catalog():
    sites = get_beachcombing_sites()
    assert len(sites) == 5
    site_ids = [s.site_id for s in sites]
    assert "glass-beach-fort-bragg" in site_ids
    assert "kodiak-island-monashka" in site_ids
    assert "cape-may-point-flotsam" in site_ids
    assert "olympic-ruby-beach" in site_ids
    assert "monhegan-island-lobsterman" in site_ids


def test_get_beachcombing_sites_filtering():
    cove_sites = get_beachcombing_sites(shoreline_type="gravel_pebble_cove")
    assert len(cove_sites) == 2
    cove_ids = [s.site_id for s in cove_sites]
    assert "glass-beach-fort-bragg" in cove_ids
    assert "monhegan-island-lobsterman" in cove_ids

    boulder_sites = get_beachcombing_sites(shoreline_type="high_energy_boulder_strand")
    assert len(boulder_sites) == 1
    assert boulder_sites[0].site_id == "kodiak-island-monashka"

    spit_sites = get_beachcombing_sites(shoreline_type="barrier_island_sandspit")
    assert len(spit_sites) == 1
    assert spit_sites[0].site_id == "cape-may-point-flotsam"

    shelf_sites = get_beachcombing_sites(shoreline_type="rocky_intertidal_shelf")
    assert len(shelf_sites) == 1
    assert shelf_sites[0].site_id == "olympic-ruby-beach"


def test_get_beachcombing_site_by_id():
    site = get_beachcombing_site("glass-beach-fort-bragg")
    assert site is not None
    assert site.site_id == "glass-beach-fort-bragg"
    assert site.typical_tidal_range_m == 2.1
    assert site.storm_deposit_index == 8.4

    kodiak = get_beachcombing_site("kodiak-island-monashka")
    assert kodiak is not None
    assert kodiak.elevation_m == 2
    assert "Japanese Glass Floats" in kodiak.primary_glass_colors

    assert get_beachcombing_site("unknown-beach") is None


def test_get_beachcombing_gear():
    gear = get_beachcombing_gear()
    assert len(gear) == 6
    assert all(isinstance(g, BeachcombingGearItemModel) for g in gear)
    assert all(g.mandatory is True for g in gear)

    expected_ids = [
        "uv-blacklight-365nm",
        "sand-mesh-sifting-scoop",
        "neoprene-high-traction-tide-booties",
        "jewelers-loupe-caliper-set",
        "padded-compartment-finds-case",
        "intertidal-tide-clock-tide-table",
    ]
    actual_ids = [g.item_id for g in gear]
    for gid in expected_ids:
        assert gid in actual_ids


def test_calculate_beachcombing_prime_window():
    req = BeachcombingRequest(
        site_id="glass-beach-fort-bragg",
        search_hours=3.0,
        tidal_drop_m=2.5,
        storm_surge_days_ago=3,
        tumble_energy="extreme_ocean_surf",
    )
    res = calculate_beachcombing(req)
    assert res.site_id == "glass-beach-fort-bragg"
    assert res.expected_yield_pieces == 22
    assert res.patina_quality_grade == "ancient_c_fractured_frost"
    assert res.patina_rating_percent == 95
    assert res.optimal_foraging_status == "prime_low_tide_wrack_window"
    assert "tide_safety_advisory" in res.model_dump()
    assert "conservation_advisory" in res.model_dump()


def test_calculate_beachcombing_suboptimal_and_moderate():
    req = BeachcombingRequest(
        site_id="cape-may-point-flotsam",
        search_hours=2.0,
        tidal_drop_m=1.5,
        storm_surge_days_ago=10,
        tumble_energy="moderate_bay",
    )
    res = calculate_beachcombing(req)
    assert res.site_id == "cape-may-point-flotsam"
    assert res.optimal_foraging_status == "suboptimal_slack_scour"
    assert res.patina_quality_grade == "smooth_frosted_gem"
    assert res.patina_rating_percent == 80


def test_calculate_beachcombing_hazard_pinch_and_early_frosting():
    req = BeachcombingRequest(
        site_id="olympic-ruby-beach",
        search_hours=1.0,
        tidal_drop_m=1.0,
        storm_surge_days_ago=1,
        tumble_energy="gentle_estuary",
    )
    res = calculate_beachcombing(req)
    assert res.site_id == "olympic-ruby-beach"
    assert res.optimal_foraging_status == "hazard_rising_tide_pinch"
    assert res.patina_quality_grade == "early_frosting"
    assert res.patina_rating_percent == 55


def test_calculate_beachcombing_unknown_site_raises():
    req = BeachcombingRequest(site_id="nonexistent-beach-spot")
    with pytest.raises(ValueError, match="not found"):
        calculate_beachcombing(req)


def test_detect_beachcombing_intent_exclusions():
    exclusions = [
        "Where is my order # 12345 for sea glass?",
        "I need a refund on beachcombing gear",
        "Print a return label for flotsam collection bag",
        "Check shipping tracking for sea glass UV torch",
        "Can I bring a dogsled to the beach wrack line?",
        "Snowshoe equipment rental for beachcombing",
        "Primitive trapping along the intertidal zone",
        "Gold pan techniques for sea glass gravels",
        "Gold panning equipment in coastal coves",
        "Kayak rentals for beachcombing coves",
        "Wader rental for sea glass hunt",
    ]
    for query in exclusions:
        intent = detect_beachcombing_intent(query)
        assert intent is None, f"Query '{query}' should be excluded but returned {intent}"


def test_detect_beachcombing_intent_keywords_and_routes():
    intent = detect_beachcombing_intent("Tell me about Glass Beach in Fort Bragg")
    assert intent is not None
    assert intent.action == "site_detail"
    assert intent.site_id == "glass-beach-fort-bragg"

    intent2 = detect_beachcombing_intent("Where can I find Japanese glass floats on Monashka Bay in Kodiak?")
    assert intent2 is not None
    assert intent2.action == "site_detail"
    assert intent2.site_id == "kodiak-island-monashka"

    intent3 = detect_beachcombing_intent("What is the Cape May Point flotsam situation?")
    assert intent3 is not None
    assert intent3.action == "site_detail"
    assert intent3.site_id == "cape-may-point-flotsam"

    intent4 = detect_beachcombing_intent("Tell me about Ruby Beach Olympic intertidal foraging")
    assert intent4 is not None
    assert intent4.action == "site_detail"
    assert intent4.site_id == "olympic-ruby-beach"

    intent5 = detect_beachcombing_intent("Exploring Monhegan Island coastal sea glass")
    assert intent5 is not None
    assert intent5.action == "site_detail"
    assert intent5.site_id == "monhegan-island-lobsterman"


def test_detect_beachcombing_intent_actions():
    calc_intent = detect_beachcombing_intent("Calculate expected sea glass yield and hydration patina frosting scale")
    assert calc_intent is not None
    assert calc_intent.action == "calculate_beachcombing"

    gear_intent = detect_beachcombing_intent("What mandatory beachcombing gear and 365nm UV blacklight is required?")
    assert gear_intent is not None
    assert gear_intent.action == "gear_checklist"

    list_intent = detect_beachcombing_intent("Show me all sea glass and beachcombing sites with gravel pebble coves")
    assert list_intent is not None
    assert list_intent.action == "sites_list"
    assert list_intent.shoreline_type == "gravel_pebble_cove"


def test_format_beachcombing_response():
    calc_req = BeachcombingRequest(site_id="glass-beach-fort-bragg")
    calc_res = calculate_beachcombing(calc_req)
    fmt_calc = format_beachcombing_response(calc_res)
    assert isinstance(fmt_calc, FormattedBeachcombingResponse)
    assert "beachcombing_info" in fmt_calc
    assert fmt_calc["beachcombing_info"]["action"] == "calculate_beachcombing"
    assert fmt_calc["beachcombing_info"]["calculation"]["site_id"] == "glass-beach-fort-bragg"
    assert "Glass Beach & MacKerricher Coves" in fmt_calc.answer

    gear_intent = BeachcombingIntent(action="gear_checklist")
    fmt_gear = format_beachcombing_response(gear_intent)
    assert fmt_gear["beachcombing_info"]["action"] == "gear_checklist"
    assert len(fmt_gear["beachcombing_info"]["gear"]) == 6
    assert "365nm Longwave UV Blacklight Torch" in fmt_gear.answer

    detail_intent = BeachcombingIntent(action="site_detail", site_id="kodiak-island-monashka")
    fmt_detail = format_beachcombing_response(detail_intent)
    assert fmt_detail["beachcombing_info"]["action"] == "site_detail"
    assert fmt_detail["beachcombing_info"]["site"]["site_id"] == "kodiak-island-monashka"
    assert "Monashka Bay" in fmt_detail.answer

    list_intent = BeachcombingIntent(action="sites_list", shoreline_type="barrier_island_sandspit")
    fmt_list = format_beachcombing_response(list_intent)
    assert fmt_list["beachcombing_info"]["action"] == "sites_list"
    assert len(fmt_list["beachcombing_info"]["sites"]) == 1
    assert "Cape May Point & Sunset Beach" in fmt_list.answer


def test_build_beachcombing_prompt():
    prompt = build_beachcombing_prompt()
    assert "Wilderness Sea Glass & Coastal Beachcombing" in prompt
    assert "patina" in prompt.lower()
    assert "wrack line" in prompt.lower()
    assert "uranium" in prompt.lower()

    detail_prompt = build_beachcombing_prompt(
        BeachcombingIntent(action="site_detail", site_id="glass-beach-fort-bragg")
    )
    assert "Glass Beach" in detail_prompt


def test_beachcombing_tool():
    intent = BeachcombingIntent(action="gear_checklist")
    res = beachcombing_tool(intent.model_dump())
    assert isinstance(res, dict)
    assert "beachcombing_info" in res
    assert res["beachcombing_info"]["action"] == "gear_checklist"
    assert "answer" in res
