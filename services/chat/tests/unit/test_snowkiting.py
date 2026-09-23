import pytest
from contoso_chat.snowkiting import (
    FormattedSnowkitingResponse,
    SnowkitingCalculationRequest,
    SnowkitingCalculationResponse,
    SnowkitingGearRequirement,
    SnowkitingIntent,
    SnowkitingSpotModel,
    build_snowkiting_prompt,
    calculate_snowkiting,
    detect_snowkiting_intent,
    extract_snowkiting_intent,
    format_snowkiting_response,
    get_snowkiting_gear,
    get_snowkiting_spot_by_id,
    get_snowkiting_spots,
)

# -----------------------------------------------------------------------------
# Pydantic Model Tests
# -----------------------------------------------------------------------------


def test_snowkiting_spot_model():
    spot = SnowkitingSpotModel(
        spot_id="test-spot",
        title="Test Snowkite Spot",
        region="Test Region",
        country="Test Country",
        elevation_m=1200,
        terrain="polar_plateau",
        typical_wind_knots="12 - 25 knots",
        best_season="December - April",
        expedition_pulk_friendly=True,
        description="A great test polar plateau spot.",
        highlights=["Reliable arctic wind", "Wide open flat terrain"],
    )
    assert spot.spot_id == "test-spot"
    assert spot.title == "Test Snowkite Spot"
    assert spot.elevation_m == 1200
    assert spot.terrain == "polar_plateau"
    assert spot.expedition_pulk_friendly is True
    assert len(spot.highlights) == 2


def test_snowkiting_calculation_request_defaults():
    req = SnowkitingCalculationRequest()
    assert req.spot_id == "hardangervidda-plateau-norway"
    assert req.rider_weight_kg == 75.0
    assert req.pulk_weight_kg == 20.0
    assert req.wind_speed_knots == 16.0
    assert req.snow_surface == "groomed_packed"
    assert req.kite_type == "closed_cell_depower_foil"


def test_snowkiting_calculation_response_model():
    resp = SnowkitingCalculationResponse(
        spot_id="hardangervidda-plateau-norway",
        spot_title="Hardangervidda Polar Plateau",
        total_payload_kg=95.0,
        recommended_kite_area_m2=11.5,
        power_rating="OPTIMAL POWER: Balanced traction and controlled depower throw.",
        friction_coefficient=0.08,
        glide_efficiency_percent=73,
        safety_status="approved",
        tactical_advisory="Conditions optimal for snowkiting.",
    )
    assert resp.spot_id == "hardangervidda-plateau-norway"
    assert resp.total_payload_kg == 95.0
    assert resp.recommended_kite_area_m2 == 11.5
    assert resp.friction_coefficient == 0.08
    assert resp.glide_efficiency_percent == 73
    assert resp.safety_status == "approved"


def test_snowkiting_gear_model():
    gear = SnowkitingGearRequirement(
        item_id="test-gear",
        name="Test Harness",
        category="harness",
        mandatory=True,
        purpose="Support rider",
    )
    assert gear.item_id == "test-gear"
    assert gear.mandatory is True


# -----------------------------------------------------------------------------
# Catalog Tests (5 Iconic Snowkiting Spots)
# -----------------------------------------------------------------------------


def test_snowkiting_spots_catalog():
    spots = get_snowkiting_spots()
    assert len(spots) == 5
    spot_ids = [s.spot_id for s in spots]
    assert "hardangervidda-plateau-norway" in spot_ids
    assert "camas-prairie-idaho" in spot_ids
    assert "col-du-lautaret-alps" in spot_ids
    assert "lake-mille-lacs-minnesota" in spot_ids
    assert "greenland-icecap-traverse" in spot_ids


def test_get_snowkiting_spots_filtering():
    plateau_spots = get_snowkiting_spots(terrain="polar_plateau")
    assert len(plateau_spots) == 1
    assert plateau_spots[0].spot_id == "hardangervidda-plateau-norway"

    powder_spots = get_snowkiting_spots(terrain="powder_snowfield")
    assert len(powder_spots) == 1
    assert powder_spots[0].spot_id == "camas-prairie-idaho"

    alpine_spots = get_snowkiting_spots(terrain="alpine_basin")
    assert len(alpine_spots) == 1
    assert alpine_spots[0].spot_id == "col-du-lautaret-alps"

    lake_spots = get_snowkiting_spots(terrain="frozen_lake")
    assert len(lake_spots) == 1
    assert lake_spots[0].spot_id == "lake-mille-lacs-minnesota"

    ice_spots = get_snowkiting_spots(terrain="ice_sheet")
    assert len(ice_spots) == 1
    assert ice_spots[0].spot_id == "greenland-icecap-traverse"


def test_get_snowkiting_spot_by_id():
    hardanger = get_snowkiting_spot_by_id("hardangervidda-plateau-norway")
    assert hardanger is not None
    assert hardanger.title == "Hardangervidda Polar Plateau"
    assert hardanger.country == "Norway"
    assert hardanger.elevation_m == 1250
    assert hardanger.terrain == "polar_plateau"
    assert hardanger.expedition_pulk_friendly is True
    assert "Cradle of polar kite exploration" in hardanger.highlights

    # Case insensitivity
    assert get_snowkiting_spot_by_id("HARDANGERVIDDA-PLATEAU-NORWAY") is not None
    assert get_snowkiting_spot_by_id("non-existent-spot") is None


# -----------------------------------------------------------------------------
# Gear Checklist Tests (6 Items)
# -----------------------------------------------------------------------------


def test_snowkiting_gear_checklist():
    gear = get_snowkiting_gear()
    assert len(gear) == 6
    assert all(item.mandatory for item in gear)
    item_ids = [item.item_id for item in gear]
    assert "depower-foil-snowkite" in item_ids
    assert "climbing-rated-kite-harness" in item_ids
    assert "quick-release-chickenloop-leash" in item_ids
    assert "pulk-harness-tow-bridle" in item_ids
    assert "backcountry-gps-inreach" in item_ids
    assert "multi-impact-snow-helmet" in item_ids

    categories = {item.category for item in gear}
    assert {
        "kite_engine",
        "harness",
        "safety_release",
        "hauling",
        "navigation",
        "protection",
    }.issubset(categories)


# -----------------------------------------------------------------------------
# Calculation Logic Tests
# -----------------------------------------------------------------------------


def test_calculation_optimal_default():
    req = SnowkitingCalculationRequest(
        spot_id="hardangervidda-plateau-norway",
        rider_weight_kg=75.0,
        pulk_weight_kg=20.0,
        wind_speed_knots=16.0,
        snow_surface="groomed_packed",
        kite_type="closed_cell_depower_foil",
    )
    res = calculate_snowkiting(req)
    assert res.spot_id == "hardangervidda-plateau-norway"
    assert res.spot_title == "Hardangervidda Polar Plateau"
    assert res.total_payload_kg == 95.0
    assert res.friction_coefficient == 0.08
    assert res.recommended_kite_area_m2 == 11.5
    assert res.glide_efficiency_percent == 73
    assert res.safety_status == "approved"
    assert "OPTIMAL POWER" in res.power_rating
    assert len(res.tactical_advisory) > 10


def test_calculation_storm_force_hazard():
    req = SnowkitingCalculationRequest(
        spot_id="greenland-icecap-traverse",
        rider_weight_kg=80.0,
        pulk_weight_kg=50.0,
        wind_speed_knots=36.0,  # > 32 knots -> hazardous_storm_force
        snow_surface="hardpack_crust",
        kite_type="closed_cell_depower_foil",
    )
    res = calculate_snowkiting(req)
    assert res.safety_status == "hazardous_storm_force"
    assert "STORM FORCE" in res.tactical_advisory or "hazardous" in res.safety_status


def test_calculation_tubekite_limit():
    req = SnowkitingCalculationRequest(
        spot_id="lake-mille-lacs-minnesota",
        wind_speed_knots=26.0,  # tubekite > 25 knots -> hazardous_storm_force
        kite_type="inflatable_leading_edge_tubekite",
    )
    res = calculate_snowkiting(req)
    assert res.safety_status == "hazardous_storm_force"


def test_calculation_high_load_caution():
    # wind > 24 knots
    req_wind = SnowkitingCalculationRequest(
        wind_speed_knots=25.0,
        pulk_weight_kg=20.0,
        snow_surface="groomed_packed",
    )
    res_wind = calculate_snowkiting(req_wind)
    assert res_wind.safety_status == "caution_high_load"
    assert "HIGH POWER" in res_wind.power_rating

    # heavy pulk > 60kg
    req_pulk = SnowkitingCalculationRequest(
        wind_speed_knots=18.0,
        pulk_weight_kg=70.0,
        snow_surface="groomed_packed",
    )
    res_pulk = calculate_snowkiting(req_pulk)
    assert res_pulk.safety_status == "caution_high_load"

    # sastrugi surface
    req_sastrugi = SnowkitingCalculationRequest(
        wind_speed_knots=18.0,
        pulk_weight_kg=20.0,
        snow_surface="sastrugi_drift",
    )
    res_sastrugi = calculate_snowkiting(req_sastrugi)
    assert res_sastrugi.safety_status == "caution_high_load"
    assert res_sastrugi.friction_coefficient == 0.22


def test_calculation_underpowered():
    req = SnowkitingCalculationRequest(
        wind_speed_knots=7.0,
    )
    res = calculate_snowkiting(req)
    assert "UNDERPOWERED" in res.power_rating


def test_calculation_kite_clamping():
    # Very light rider in strong wind clamped to min 4.0
    req_min = SnowkitingCalculationRequest(
        rider_weight_kg=40.0,
        pulk_weight_kg=0.0,
        wind_speed_knots=30.0,
        snow_surface="frozen_lake_ice",
    )
    res_min = calculate_snowkiting(req_min)
    assert res_min.recommended_kite_area_m2 >= 4.0

    # Very heavy payload in light wind clamped to max 18.0
    req_max = SnowkitingCalculationRequest(
        rider_weight_kg=100.0,
        pulk_weight_kg=90.0,
        wind_speed_knots=10.0,
        snow_surface="sastrugi_drift",
    )
    res_max = calculate_snowkiting(req_max)
    assert res_max.recommended_kite_area_m2 <= 18.0


def test_calculation_invalid_spot():
    req = SnowkitingCalculationRequest(spot_id="unknown-spot")
    with pytest.raises(ValueError, match="not found"):
        calculate_snowkiting(req)


# -----------------------------------------------------------------------------
# Intent Detection Tests
# -----------------------------------------------------------------------------


def test_detect_snowkiting_intent():
    # Spots list
    i1 = detect_snowkiting_intent("Where can I go backcountry snowkiting?")
    assert i1 is not None
    assert i1.action in ("spots_list", "spots")

    # Terrain filter
    i2 = detect_snowkiting_intent("Show me snowkiting spots on a polar plateau")
    assert i2 is not None
    assert i2.terrain == "polar_plateau"

    # Specific spots
    i3 = detect_snowkiting_intent("Tell me about Hardangervidda polar snowkiting")
    assert i3 is not None
    assert i3.spot_id == "hardangervidda-plateau-norway"

    i4 = detect_snowkiting_intent("Can I use an expedition pulk at Camas Prairie kite basin?")
    assert i4 is not None
    assert i4.spot_id == "camas-prairie-idaho"

    i5 = detect_snowkiting_intent("Col du Lautaret snowkite ridge soaring")
    assert i5 is not None
    assert i5.spot_id == "col-du-lautaret-alps"

    i6 = detect_snowkiting_intent("Lake Mille Lacs frozen lake ice snowkiting")
    assert i6 is not None
    assert i6.spot_id == "lake-mille-lacs-minnesota"

    i7 = detect_snowkiting_intent("Greenland icecap kite expedition route")
    assert i7 is not None
    assert i7.spot_id == "greenland-icecap-traverse"

    # Calculation query
    i8 = detect_snowkiting_intent(
        "Calculate kite sizing in knots and pulk hauling friction for foil snowkite"
    )
    assert i8 is not None
    assert i8.action == "calculate_snowkiting"

    # Gear query
    i9 = detect_snowkiting_intent(
        "What is the safety checklist for chickenloop safety release and snowkite harness?"
    )
    assert i9 is not None
    assert i9.action == "gear_checklist"

    # Extract alias
    assert extract_snowkiting_intent("Hardangervidda snowkite") is not None

    # Disambiguation guards
    assert detect_snowkiting_intent("") is None
    assert detect_snowkiting_intent("Where is my order #54321?") is None
    assert detect_snowkiting_intent("I need a return label for my boots") is None
    assert detect_snowkiting_intent("Check shipping tracking status") is None
    assert (
        detect_snowkiting_intent("Can I kitesurf with a surfboard on the ocean beach with waves?")
        is None
    )
    assert detect_snowkiting_intent("Tropical kitesurfing on warm water") is None
    assert (
        detect_snowkiting_intent("Where can I buy a lift ticket or ski pass for the chairlift?")
        is None
    )


# -----------------------------------------------------------------------------
# Response Formatting & Prompt Tests
# -----------------------------------------------------------------------------


def test_format_snowkiting_response():
    # Spots list
    intent_list = SnowkitingIntent(action="spots_list")
    formatted_list = format_snowkiting_response(intent_list, "List snowkiting spots")
    assert isinstance(formatted_list, FormattedSnowkitingResponse)
    assert isinstance(formatted_list, str)
    assert "Hardangervidda" in formatted_list
    assert "snowkiting_info" in formatted_list
    assert formatted_list.get("snowkiting_info")["action"] == "spots_list"
    assert list(formatted_list.keys()) == ["answer", "snowkiting_info"]
    assert formatted_list[0] is not None
    assert 999 not in formatted_list
    assert len(list(formatted_list.values())) == 2
    assert len(list(formatted_list.items())) == 2

    # Spot detail
    intent_detail = SnowkitingIntent(action="spot_detail", spot_id="hardangervidda-plateau-norway")
    formatted_detail = format_snowkiting_response(intent_detail)
    assert "Hardangervidda" in formatted_detail
    assert formatted_detail.get("snowkiting_info")["action"] == "spot_detail"

    # Calculation
    intent_calc = SnowkitingIntent(
        action="calculate_snowkiting", spot_id="hardangervidda-plateau-norway"
    )
    formatted_calc = format_snowkiting_response(intent_calc)
    assert "recommended_kite_area_m2" in str(
        formatted_calc["snowkiting_info"]
    ) or "Hardangervidda" in str(formatted_calc)
    assert formatted_calc.get("snowkiting_info")["action"] == "calculate_snowkiting"

    # Gear checklist
    intent_gear = SnowkitingIntent(action="gear_checklist")
    formatted_gear = format_snowkiting_response(intent_gear)
    assert "depower-foil-snowkite" in str(formatted_gear) or "foil" in str(formatted_gear).lower()
    assert formatted_gear.get("snowkiting_info")["action"] == "gear_checklist"


def test_build_snowkiting_prompt():
    prompt_focused = build_snowkiting_prompt(
        SnowkitingIntent(action="spot_detail", spot_id="hardangervidda-plateau-norway")
    )
    assert "Hardangervidda" in prompt_focused
    assert "Snowkiting" in prompt_focused

    prompt_general = build_snowkiting_prompt(
        SnowkitingIntent(action="spots_list", terrain="polar_plateau")
    )
    assert "Snowkiting" in prompt_general


def test_calculation_dangerous_overpower():
    # wind >= 30 and recommended_kite_area_m2 > 10
    req = SnowkitingCalculationRequest(
        wind_speed_knots=30.0,
        rider_weight_kg=100.0,
        pulk_weight_kg=50.0,
        snow_surface="dry_powder",
    )
    res = calculate_snowkiting(req)
    assert "DANGEROUS OVERPOWER" in res.power_rating


def test_calculation_non_pulk_friendly_advisory():
    # col-du-lautaret-alps is not pulk friendly
    req = SnowkitingCalculationRequest(
        spot_id="col-du-lautaret-alps",
        pulk_weight_kg=25.0,
    )
    res = calculate_snowkiting(req)
    assert "not optimized for heavy expedition pulks" in res.tactical_advisory


def test_detect_snowkiting_more_terrains_and_fallbacks():
    # Powder snowfield terrain
    i_pow = detect_snowkiting_intent("Where can I find a snowkite powder snowfield?")
    assert i_pow is not None
    assert i_pow.terrain == "powder_snowfield"

    # Alpine basin terrain
    i_alp = detect_snowkiting_intent("Snowkiting in an alpine basin")
    assert i_alp is not None
    assert i_alp.terrain == "alpine_basin"

    # Ice sheet terrain
    i_ice = detect_snowkiting_intent("Polar kite on an ice sheet")
    assert i_ice is not None
    assert i_ice.terrain == "ice_sheet"

    # Fallback spot_detail when spot mentioned alone
    i_spot = detect_snowkiting_intent("Hardangervidda snowkite")
    assert i_spot is not None
    assert i_spot.spot_id == "hardangervidda-plateau-norway"
    assert i_spot.action == "spot_detail"

    # Ecommerce refund exclusion
    assert detect_snowkiting_intent("Can I get a refund for my snowkite?") is None


def test_detect_snowkiting_no_keywords():
    assert detect_snowkiting_intent("Hello world, what is the weather today?") is None
