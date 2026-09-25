from contoso_chat.wild_ice import (
    FormattedWildIceResponse,
    WildIceGearItemModel,
    WildIceIntent,
    WildIceRequest,
    WildIceVenueModel,
    calculate_wild_ice,
    detect_wild_ice_intent,
    format_wild_ice_response,
    get_wild_ice_gear,
    get_wild_ice_venue,
    get_wild_ice_venues,
)


def test_wild_ice_venue_model():
    venue = WildIceVenueModel(
        venue_id="lake-malaren-archipelago",
        title="Lake Mälaren & Stockholm Archipelago",
        water_body="Lake Mälaren & Baltic Sea Archipelago",
        region="Stockholm County, Sweden",
        surface_elevation_m=1,
        ice_type="black_ice",
        default_thickness_cm=9.0,
        typical_tour_km=35.0,
        description=(
            "Iconic Scandinavian Nordic tour skating haven offering "
            "expansive black congelation ice between thousands of islands."
        ),
        highlights=[
            "Black mirror congelation ice",
            "Archipelago island hopping corridors",
            "Hydroacoustic singing ice resonance",
        ],
    )
    assert venue.venue_id == "lake-malaren-archipelago"
    assert venue.surface_elevation_m == 1
    assert venue.ice_type == "black_ice"
    assert venue.default_thickness_cm == 9.0
    assert venue.typical_tour_km == 35.0
    assert len(venue.highlights) == 3


def test_get_wild_ice_venues_catalog():
    venues = get_wild_ice_venues()
    assert len(venues) == 5
    ids = [v.venue_id for v in venues]
    assert "lake-malaren-archipelago" in ids
    assert "lake-siljan-dalarna" in ids
    assert "lake-baikal-olkhon" in ids
    assert "lake-moraine-banff" in ids
    assert "lake-superior-chequamegon" in ids


def test_get_wild_ice_venues_filter():
    black_ice_venues = get_wild_ice_venues(ice_type="black_ice")
    assert len(black_ice_venues) == 4
    assert all(v.ice_type == "black_ice" for v in black_ice_venues)

    white_ice_venues = get_wild_ice_venues(ice_type="white_snow_ice")
    assert len(white_ice_venues) == 1
    assert white_ice_venues[0].venue_id == "lake-moraine-banff"


def test_get_wild_ice_venue_by_id():
    v = get_wild_ice_venue("lake-siljan-dalarna")
    assert v is not None
    assert v.venue_id == "lake-siljan-dalarna"
    assert "Lake Siljan" in v.title
    assert v.surface_elevation_m == 161

    v_case = get_wild_ice_venue("LAKE-BAIKAL-OLKHON")
    assert v_case is not None
    assert v_case.venue_id == "lake-baikal-olkhon"

    assert get_wild_ice_venue("nonexistent-venue") is None


def test_calculate_wild_ice_black_ice_safe():
    req = WildIceRequest(
        venue_id="lake-malaren-archipelago",
        ice_type="black_ice",
        thickness_cm=8.0,
        skater_weight_lbs=180.0,
        ambient_temp_f=22.0,
    )
    res = calculate_wild_ice(req)
    assert res.venue_id == "lake-malaren-archipelago"
    assert res.effective_thickness_cm == 8.0
    assert res.safe_load_capacity_lbs == 3200
    assert res.acoustic_resonance_hz == 424
    assert (
        res.resonance_description
        == "Mid-Frequency Singing (Moderate Congelation Ice)"
    )
    assert res.safety_status == "safe_touring_window"
    assert "SAFE" in res.advisory or "Safe" in res.advisory


def test_calculate_wild_ice_thin_resonance_high():
    req = WildIceRequest(
        venue_id="lake-malaren-archipelago",
        ice_type="black_ice",
        thickness_cm=4.0,
        skater_weight_lbs=180.0,
        ambient_temp_f=24.0,
    )
    res = calculate_wild_ice(req)
    assert res.effective_thickness_cm == 4.0
    assert res.safe_load_capacity_lbs == 800
    assert res.acoustic_resonance_hz == 600
    assert (
        res.resonance_description
        == "High Singing Resonance (Thin Resonant Membrane)"
    )
    assert res.safety_status == "unsafe_icefall_submersion_hazard"


def test_calculate_wild_ice_thick_ice_booming():
    req = WildIceRequest(
        venue_id="lake-baikal-olkhon",
        ice_type="black_ice",
        thickness_cm=16.0,
        skater_weight_lbs=200.0,
        ambient_temp_f=10.0,
    )
    res = calculate_wild_ice(req)
    assert res.effective_thickness_cm == 16.0
    assert res.safe_load_capacity_lbs == 12800
    assert res.acoustic_resonance_hz == 300
    assert (
        res.resonance_description
        == "Deep Low-Frequency Booming (Thick Structural Sheet)"
    )
    assert res.safety_status == "safe_touring_window"


def test_calculate_wild_ice_white_snow_ice_derating():
    req = WildIceRequest(
        venue_id="lake-moraine-banff",
        ice_type="white_snow_ice",
        thickness_cm=10.0,
        skater_weight_lbs=180.0,
        ambient_temp_f=20.0,
    )
    res = calculate_wild_ice(req)
    assert res.effective_thickness_cm == 5.0
    assert res.safe_load_capacity_lbs == 1250
    assert res.acoustic_resonance_hz == round(1200 / (5.0 ** 0.5))
    assert res.safety_status == "marginal_caution_scouting_only"


def test_calculate_wild_ice_candled_ice_nil():
    req = WildIceRequest(
        venue_id="lake-siljan-dalarna",
        ice_type="candled_ice",
        thickness_cm=15.0,
        skater_weight_lbs=180.0,
        ambient_temp_f=34.0,
    )
    res = calculate_wild_ice(req)
    assert res.effective_thickness_cm == 0.0
    assert res.safe_load_capacity_lbs == 0
    assert res.acoustic_resonance_hz == 0
    assert (
        res.resonance_description
        == "Muffled Decay (Structural Integrity Nil)"
    )
    assert res.safety_status == "unsafe_icefall_submersion_hazard"


def test_calculate_wild_ice_warm_temp_marginal_and_unsafe():
    req1 = WildIceRequest(
        venue_id="lake-malaren-archipelago",
        ice_type="black_ice",
        thickness_cm=8.0,
        skater_weight_lbs=170.0,
        ambient_temp_f=34.0,
    )
    res1 = calculate_wild_ice(req1)
    assert res1.safety_status == "marginal_caution_scouting_only"

    req2 = WildIceRequest(
        venue_id="lake-malaren-archipelago",
        ice_type="black_ice",
        thickness_cm=8.0,
        skater_weight_lbs=170.0,
        ambient_temp_f=38.0,
    )
    res2 = calculate_wild_ice(req2)
    assert res2.safety_status == "unsafe_icefall_submersion_hazard"


def test_calculate_wild_ice_weight_exceeds_load():
    req = WildIceRequest(
        venue_id="lake-malaren-archipelago",
        ice_type="black_ice",
        thickness_cm=2.0,
        skater_weight_lbs=250.0,
        ambient_temp_f=20.0,
    )
    res = calculate_wild_ice(req)
    assert res.safety_status == "unsafe_icefall_submersion_hazard"


def test_get_wild_ice_gear():
    gear = get_wild_ice_gear()
    assert len(gear) == 6
    assert all(isinstance(item, WildIceGearItemModel) for item in gear)
    assert all(item.mandatory is True for item in gear)

    expected_ids = [
        "neck-worn-ice-claws",
        "nordic-ice-pike-staff",
        "buoyant-skate-backpack",
        "throw-rescue-lifeline",
        "heel-free-nordic-blades",
        "sealed-dry-change-kit",
    ]
    actual_ids = [g.item_id for g in gear]
    for eid in expected_ids:
        assert eid in actual_ids


def test_detect_wild_ice_intent():
    i1 = detect_wild_ice_intent(
        "Where can I go wild ice touring on natural lake black ice?"
    )
    assert i1 is not None
    assert i1.action == "venues_list"

    i2 = detect_wild_ice_intent(
        "Tell me about wild ice tour skating on Lake Mälaren archipelago"
    )
    assert i2 is not None
    assert i2.action == "venue_detail"
    assert i2.venue_id == "lake-malaren-archipelago"

    i3 = detect_wild_ice_intent(
        "Calculate ice thickness bearing capacity and singing ice resonance "
        "for Lake Siljan"
    )
    assert i3 is not None
    assert i3.action in ("calculate_ice", "calculate")
    assert i3.venue_id == "lake-siljan-dalarna"

    i4 = detect_wild_ice_intent(
        "What is the mandatory safety kit for långfärdsskridskor "
        "like ispiggar and ice claws?"
    )
    assert i4 is not None
    assert i4.action == "gear_checklist"


def test_detect_wild_ice_intent_disambiguation():
    assert detect_wild_ice_intent(
        "What kick wax and klister should I use for cross-country "
        "classic skiing on corduroy?"
    ) is None
    assert detect_wild_ice_intent(
        "Tell me about Methow Valley skate ski trails and grooming"
    ) is None

    assert detect_wild_ice_intent(
        "Calculate high altitude scuba diving decompression and regulator "
        "freeze risk in Lake Tahoe"
    ) is None

    assert detect_wild_ice_intent(
        "What crampons, ice screws, and ice axes do I need for "
        "frozen waterfall ice climbing?"
    ) is None

    assert detect_wild_ice_intent(
        "Can I rent a fishing boat on the lake this summer?"
    ) is None


def test_format_wild_ice_response():
    calc_req = WildIceRequest(
        venue_id="lake-malaren-archipelago",
        ice_type="black_ice",
        thickness_cm=8.0,
        skater_weight_lbs=180.0,
        ambient_temp_f=22.0,
    )
    calc_res = calculate_wild_ice(calc_req)
    formatted = format_wild_ice_response(calc_res)
    assert isinstance(formatted, FormattedWildIceResponse)
    assert "wild_ice_info" in formatted
    assert "Lake Mälaren" in str(formatted)
    assert formatted.get("wild_ice_info")["safe_load_capacity_lbs"] == 3200

    intent_list = WildIceIntent(action="venues_list")
    formatted_list = format_wild_ice_response(intent_list)
    assert isinstance(formatted_list, FormattedWildIceResponse)
    assert "venues" in formatted_list.get("wild_ice_info")
    assert len(formatted_list.get("wild_ice_info")["venues"]) == 5

    intent_detail = WildIceIntent(
        action="venue_detail", venue_id="lake-baikal-olkhon"
    )
    formatted_detail = format_wild_ice_response(intent_detail)
    assert isinstance(formatted_detail, FormattedWildIceResponse)
    assert "Baikal" in str(formatted_detail)
    assert (
        formatted_detail.get("wild_ice_info")["venue"]["venue_id"]
        == "lake-baikal-olkhon"
    )

    intent_gear = WildIceIntent(action="gear_checklist")
    formatted_gear = format_wild_ice_response(intent_gear)
    assert isinstance(formatted_gear, FormattedWildIceResponse)
    assert "gear" in formatted_gear.get("wild_ice_info")
    assert len(formatted_gear.get("wild_ice_info")["gear"]) == 6
