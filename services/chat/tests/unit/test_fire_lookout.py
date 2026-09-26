from contoso_chat.fire_lookout import (
    DEFAULT_FIRE_LOOKOUT_GEAR,
    DEFAULT_FIRE_LOOKOUT_TOWERS,
    FireLookoutTowerModel,
    FormattedLookoutResponse,
    LookoutGearItemModel,
    LookoutIntent,
    LookoutRequest,
    LookoutResponse,
    build_fire_lookout_prompt,
    calculate_fire_lookout,
    detect_fire_lookout_intent,
    fire_lookout_tool,
    format_fire_lookout_response,
    get_fire_lookout_gear,
    get_fire_lookout_tower,
    get_fire_lookout_towers,
)


def test_fire_lookout_tower_model():
    tower = FireLookoutTowerModel(
        tower_id="winchester-mountain-lookout",
        title="Winchester Mountain Lookout (L-4 Cab)",
        mountain_peak="Winchester Mountain",
        national_forest="Mt. Baker-Snoqualmie National Forest, WA",
        elevation_m=1988,
        tower_structure="live_in_wood_cab_l4",
        tower_height_m=4,
        viewshed_radius_km=65,
        osborne_alidade_equipped=True,
        active_observer_status="active_usfs_spotting",
        description="Historic 1935 USFS L-4 ground cab perched on Winchester Mountain summit.",
        highlights=[
            "Original 1935 USFS L-4 cab architecture with 360-degree glass ribbon windows",
            "Direct line-of-sight views across Mount Baker and Tomyhoi Peak backcountry",
        ],
    )
    assert tower.tower_id == "winchester-mountain-lookout"
    assert tower.elevation_m == 1988
    assert tower.osborne_alidade_equipped is True
    assert len(tower.highlights) == 2


def test_lookout_request_defaults():
    req = LookoutRequest()
    assert req.tower_id == "winchester-mountain-lookout"
    assert req.azimuth_degrees == 45.0
    assert req.vertical_angle_degrees == -1.5
    assert req.estimated_distance_km == 15.0
    assert req.smoke_behavior == "dense_vertical_convection"
    assert req.wind_speed_mph == 12.0


def test_lookout_response_model():
    res = LookoutResponse(
        tower_id="winchester-mountain-lookout",
        tower_name="Winchester Mountain Lookout (L-4 Cab)",
        triangulated_bearing="45° (NE) | Dist: 15.0 km | Vert: -1.5°",
        effective_viewshed_km=65,
        plume_alert_level="confirmed_wildfire_dispatch",
        convection_index_percent=85,
        observation_status="clear_line_of_sight",
        triangulation_advisory="Advisory triangulation details",
        holdover_fire_advisory="Advisory holdover details",
        tower_safety_advisory="Advisory safety details",
    )
    assert res.tower_id == "winchester-mountain-lookout"
    assert res.plume_alert_level == "confirmed_wildfire_dispatch"
    assert res.convection_index_percent == 85
    assert res.observation_status == "clear_line_of_sight"


def test_lookout_gear_item_model():
    gear = LookoutGearItemModel(
        item_id="osborne-alidade-sighting-peep",
        name="Brass Osborne Fire Finder Peep Sights & Graduated Ring",
        category="navigation",
        mandatory=True,
        purpose="Precision brass sighting alidade and rotating azimuth ring to triangulate horizontal degree bearings.",
    )
    assert gear.item_id == "osborne-alidade-sighting-peep"
    assert gear.mandatory is True
    assert gear.category == "navigation"


def test_lookout_intent_model():
    intent = LookoutIntent(action="calculate_lookout", tower_id="winchester-mountain-lookout")
    assert intent.action == "calculate_lookout"
    assert intent.tower_id == "winchester-mountain-lookout"
    assert intent.tower_structure is None


def test_formatted_lookout_response():
    resp = FormattedLookoutResponse(
        "Lookout details summary",
        {"fire_lookout_info": {"status": "ok"}, "answer": "Lookout details summary"},
    )
    assert isinstance(resp, dict)
    assert resp.answer == "Lookout details summary"
    assert str(resp) == "Lookout details summary"
    assert resp["fire_lookout_info"]["status"] == "ok"
    assert resp.get("fire_lookout_info") == {"status": "ok"}


def test_towers_catalog():
    assert len(DEFAULT_FIRE_LOOKOUT_TOWERS) == 5
    towers = get_fire_lookout_towers()
    assert len(towers) == 5
    tower_ids = [t.tower_id for t in towers]
    assert "winchester-mountain-lookout" in tower_ids
    assert "desolation-peak-lookout" in tower_ids
    assert "mount-cammerer-lookout" in tower_ids
    assert "black-elk-peak-lookout" in tower_ids
    assert "sundance-mountain-lookout" in tower_ids
    assert all(t.osborne_alidade_equipped is True for t in towers)

    # Check Winchester
    winchester = get_fire_lookout_tower("winchester-mountain-lookout")
    assert winchester is not None
    assert winchester.mountain_peak == "Winchester Mountain"
    assert winchester.tower_structure == "live_in_wood_cab_l4"
    assert winchester.elevation_m == 1988
    assert winchester.viewshed_radius_km == 65

    # Check Desolation Peak
    desolation = get_fire_lookout_tower("desolation-peak-lookout")
    assert desolation is not None
    assert desolation.mountain_peak == "Desolation Peak"
    assert desolation.active_observer_status == "volunteer_firewatch"

    # Check Mount Cammerer
    cammerer = get_fire_lookout_tower("mount-cammerer-lookout")
    assert cammerer is not None
    assert cammerer.tower_structure == "stone_cupola_ground_cab"
    assert cammerer.elevation_m == 1502

    # Check Black Elk Peak
    black_elk = get_fire_lookout_tower("black-elk-peak-lookout")
    assert black_elk is not None
    assert black_elk.tower_structure == "stone_cupola_ground_cab"
    assert black_elk.elevation_m == 2207

    # Check Sundance Mountain
    sundance = get_fire_lookout_tower("sundance-mountain-lookout")
    assert sundance is not None
    assert sundance.tower_structure == "steel_skeletal_tower"
    assert sundance.tower_height_m == 24


def test_towers_filtering_by_structure():
    wood_towers = get_fire_lookout_towers(tower_structure="live_in_wood_cab_l4")
    assert len(wood_towers) == 2
    wood_ids = [t.tower_id for t in wood_towers]
    assert "winchester-mountain-lookout" in wood_ids
    assert "desolation-peak-lookout" in wood_ids

    stone_towers = get_fire_lookout_towers(tower_structure="stone_cupola_ground_cab")
    assert len(stone_towers) == 2
    stone_ids = [t.tower_id for t in stone_towers]
    assert "mount-cammerer-lookout" in stone_ids
    assert "black-elk-peak-lookout" in stone_ids

    steel_towers = get_fire_lookout_towers(tower_structure="steel_skeletal_tower")
    assert len(steel_towers) == 1
    assert steel_towers[0].tower_id == "sundance-mountain-lookout"

    empty_towers = get_fire_lookout_towers(tower_structure="nonexistent_structure")
    assert len(empty_towers) == 0


def test_get_tower_detail_not_found():
    assert get_fire_lookout_tower("unknown-tower") is None


def test_gear_checklist():
    assert len(DEFAULT_FIRE_LOOKOUT_GEAR) == 6
    gear = get_fire_lookout_gear()
    assert len(gear) == 6
    assert all(g.mandatory is True for g in gear)

    gear_ids = [g.item_id for g in gear]
    assert "osborne-alidade-sighting-peep" in gear_ids
    assert "high-magnification-roof-binocular" in gear_ids
    assert "usfs-topographic-panoramic-maps" in gear_ids
    assert "handheld-vhf-forest-net-transceiver" in gear_ids
    assert "sling-psychrometer-hygrothermometer" in gear_ids
    assert "faraday-lightning-ground-cable" in gear_ids


def test_calculate_default_lookout():
    req = LookoutRequest()
    res = calculate_fire_lookout(req)
    assert res.tower_id == "winchester-mountain-lookout"
    assert "Winchester" in res.tower_name
    assert "45° (NE)" in res.triangulated_bearing
    assert "Dist: 15.0 km" in res.triangulated_bearing
    assert "Vert: -1.5°" in res.triangulated_bearing
    assert res.convection_index_percent == 85
    assert res.plume_alert_level == "confirmed_wildfire_dispatch"
    assert res.observation_status == "clear_line_of_sight"
    assert res.effective_viewshed_km == 65
    assert "triangulation_advisory" in res.model_dump()
    assert "holdover_fire_advisory" in res.model_dump()
    assert "tower_safety_advisory" in res.model_dump()


def test_calculate_observation_watch():
    req = LookoutRequest(
        smoke_behavior="wispy_incipient_white",
        estimated_distance_km=25.0,
        wind_speed_mph=10.0,
    )
    res = calculate_fire_lookout(req)
    assert res.plume_alert_level == "observation_watch"
    assert res.convection_index_percent == 35


def test_calculate_wildfire_dispatch_by_distance():
    req = LookoutRequest(
        smoke_behavior="flattened_shear_drift",
        estimated_distance_km=8.0,
        wind_speed_mph=15.0,
    )
    res = calculate_fire_lookout(req)
    assert res.plume_alert_level == "confirmed_wildfire_dispatch"
    assert res.convection_index_percent == 60


def test_calculate_extreme_blowup_pyrocumulus():
    req = LookoutRequest(
        smoke_behavior="pyrocumulus_pulsing",
        wind_speed_mph=15.0,
    )
    res = calculate_fire_lookout(req)
    assert res.plume_alert_level == "extreme_blowup_evacuation"
    assert res.convection_index_percent == 95


def test_calculate_extreme_blowup_high_wind():
    req = LookoutRequest(
        smoke_behavior="dense_vertical_convection",
        wind_speed_mph=26.0,
    )
    res = calculate_fire_lookout(req)
    assert res.plume_alert_level == "extreme_blowup_evacuation"
    assert res.convection_index_percent == 95  # 85 + 10 = 95


def test_calculate_active_lightning_storm_hazard():
    req = LookoutRequest(
        wind_speed_mph=45.0,
    )
    res = calculate_fire_lookout(req)
    assert res.observation_status == "active_lightning_storm_hazard"
    assert "LIGHTNING" in res.tower_safety_advisory.upper()


def test_calculate_haze_thermal_inversion():
    req = LookoutRequest(
        tower_id="winchester-mountain-lookout",  # viewshed 65 km, 0.75 * 65 = 48.75 km
        estimated_distance_km=52.0,
        wind_speed_mph=10.0,
    )
    res = calculate_fire_lookout(req)
    assert res.observation_status == "haze_thermal_inversion"
    assert res.effective_viewshed_km == int(round(65 * 0.75))


def test_bearing_calculation_bearings_and_signs():
    req_north = LookoutRequest(azimuth_degrees=5.0, vertical_angle_degrees=2.5)
    res_north = calculate_fire_lookout(req_north)
    assert "5° (N)" in res_north.triangulated_bearing
    assert "Vert: +2.5°" in res_north.triangulated_bearing

    req_south = LookoutRequest(azimuth_degrees=180.0, vertical_angle_degrees=0.0)
    res_south = calculate_fire_lookout(req_south)
    assert "180° (S)" in res_south.triangulated_bearing
    assert "Vert: +0.0°" in res_south.triangulated_bearing


def test_detect_intent_exclusions():
    exclusions = [
        "order #",
        "refund",
        "return label",
        "shipping tracking",
        "dogsled",
        "snowshoe",
        "trapping",
        "gold pan",
        "beachcombing",
        "sea glass",
        "rentals",
        "rental",
    ]
    for ex in exclusions:
        query = f"Can you check fire lookout tower alidade sighting for {ex}?"
        assert detect_fire_lookout_intent(query) is None, f"Failed exclusion for: {ex}"


def test_detect_intent_keywords_and_actions():
    # calculate
    intent_calc = detect_fire_lookout_intent("Calculate azimuth bearing and smoke plume convection at Winchester lookout")
    assert intent_calc is not None
    assert intent_calc.action == "calculate_lookout"
    assert intent_calc.tower_id == "winchester-mountain-lookout"

    # gear
    intent_gear = detect_fire_lookout_intent("What is the mandatory lookout gear checklist for alidade sighting?")
    assert intent_gear is not None
    assert intent_gear.action == "gear_checklist"

    # detail
    intent_detail = detect_fire_lookout_intent("Tell me about Desolation Peak lookout tower and Kerouac")
    assert intent_detail is not None
    assert intent_detail.action == "tower_detail"
    assert intent_detail.tower_id == "desolation-peak-lookout"

    # detail with harney / black elk
    intent_harney = detect_fire_lookout_intent("Details on Harney Black Elk Peak fire lookout tower")
    assert intent_harney is not None
    assert intent_harney.action == "tower_detail"
    assert intent_harney.tower_id == "black-elk-peak-lookout"

    # detail with cammerer
    intent_cammerer = detect_fire_lookout_intent("Info on Mount Cammerer fire lookout")
    assert intent_cammerer is not None
    assert intent_cammerer.action == "tower_detail"
    assert intent_cammerer.tower_id == "mount-cammerer-lookout"

    # detail with sundance
    intent_sundance = detect_fire_lookout_intent("Info on Sundance Mountain lookout tower")
    assert intent_sundance is not None
    assert intent_sundance.action == "tower_detail"
    assert intent_sundance.tower_id == "sundance-mountain-lookout"

    # list
    intent_list = detect_fire_lookout_intent("List all fire lookout towers in the national forest")
    assert intent_list is not None
    assert intent_list.action == "towers_list"

    # list with structure
    intent_structure = detect_fire_lookout_intent("Show me stone cupola fire lookout towers")
    assert intent_structure is not None
    assert intent_structure.action == "towers_list"
    assert intent_structure.tower_structure == "stone_cupola_ground_cab"

    # non-matching query
    assert detect_fire_lookout_intent("Where can I buy a tent?") is None


def test_format_fire_lookout_response_types():
    # 1. LookoutResponse
    req = LookoutRequest()
    calc_res = calculate_fire_lookout(req)
    fmt1 = format_fire_lookout_response(calc_res)
    assert isinstance(fmt1, FormattedLookoutResponse)
    assert "fire_lookout_info" in fmt1
    assert fmt1["fire_lookout_info"]["action"] == "calculate_lookout"
    assert "Winchester Mountain" in fmt1.answer

    # 2. LookoutIntent calculation
    intent_calc = LookoutIntent(action="calculate_lookout", tower_id="winchester-mountain-lookout")
    fmt2 = format_fire_lookout_response(intent_calc)
    assert fmt2["fire_lookout_info"]["action"] == "calculate_lookout"

    # 3. LookoutIntent gear
    intent_gear = LookoutIntent(action="gear_checklist")
    fmt3 = format_fire_lookout_response(intent_gear)
    assert fmt3["fire_lookout_info"]["action"] == "gear_checklist"
    assert fmt3["fire_lookout_info"]["mandatory_count"] == 6

    # 4. LookoutIntent detail
    intent_detail = LookoutIntent(action="tower_detail", tower_id="desolation-peak-lookout")
    fmt4 = format_fire_lookout_response(intent_detail)
    assert fmt4["fire_lookout_info"]["action"] == "tower_detail"
    assert "Desolation Peak" in fmt4.answer

    # 5. Raw string query
    fmt5 = format_fire_lookout_response("Show me fire lookout towers")
    assert fmt5["fire_lookout_info"]["action"] == "towers_list"
    assert fmt5["fire_lookout_info"]["count"] == 5


def test_build_fire_lookout_prompt():
    prompt = build_fire_lookout_prompt()
    assert "Osborne Fire Finder" in prompt
    assert "alidade" in prompt.lower()
    assert "convection" in prompt.lower()
    assert "holdover" in prompt.lower()

    intent = LookoutIntent(action="tower_detail", tower_id="winchester-mountain-lookout")
    prompt_with_tower = build_fire_lookout_prompt(intent)
    assert "Winchester Mountain Lookout" in prompt_with_tower


def test_fire_lookout_tool():
    res = fire_lookout_tool({"action": "gear_checklist"})
    assert isinstance(res, dict)
    assert "fire_lookout_info" in res
    assert res["fire_lookout_info"]["action"] == "gear_checklist"
    assert "answer" in res
