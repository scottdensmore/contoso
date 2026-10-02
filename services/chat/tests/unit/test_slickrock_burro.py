import pytest
from contoso_chat.chat import handle_slickrock_burro_intent
from contoso_chat.pack_burro import detect_pack_burro_intent
from contoso_chat.slickrock_burro import (
    BurroDynamicsQuery,
    BurroDynamicsResult,
    BurroGearItem,
    BurroTriageStatus,
    CanyonTerrain,
    FormattedSlickrockBurroResponse,
    HoofProtection,
    SlickrockBurroIntent,
    SlickrockBurroRoute,
    WaterAvailability,
    build_slickrock_burro_prompt,
    calculate_burro_dynamics,
    detect_slickrock_burro_intent,
    extract_slickrock_burro_intent,
    format_slickrock_burro_response,
    get_burro_gear,
    get_burro_route,
    get_burro_routes,
    slickrock_burro_tool,
)
from contoso_chat.stream import generate_slickrock_burro_stream_events


def test_slickrock_burro_enums():
    assert CanyonTerrain.SLICKROCK_DRY_WASH.value == "slickrock_dry_wash"
    assert CanyonTerrain.DEEP_ALLUVIAL_SAND.value == "deep_alluvial_sand"
    assert CanyonTerrain.RUGGED_COBBLE_WASH.value == "rugged_cobble_wash"
    assert CanyonTerrain.LIMESTONE_SCREE_BENCH.value == "limestone_scree_bench"

    assert WaterAvailability.SPARSE_ALKALI_SEEPS.value == "sparse_alkali_seeps"
    assert WaterAvailability.INTERMITTENT_TINAJA_POCKETS.value == "intermittent_tinaja_pockets"
    assert WaterAvailability.SPRING_FED_POTHOLES.value == "spring_fed_potholes"
    assert WaterAvailability.SEASONAL_DESERT_TINAJAS.value == "seasonal_desert_tinajas"
    assert WaterAvailability.PERENNIAL_RIVER_CORRIDOR.value == "perennial_river_corridor"

    assert HoofProtection.BAREFOOT_CONDITIONED.value == "barefoot_conditioned"
    assert HoofProtection.NEOPRENE_TRAIL_BOOTS.value == "neoprene_trail_boots"
    assert HoofProtection.STEEL_SHOD_CLEATS.value == "steel_shod_cleats"

    assert BurroTriageStatus.OPTIMAL_CONDITIONED_TREK.value == "optimal_conditioned_trek"
    assert BurroTriageStatus.CAUTION_HEAT_HYDRATION_STRAIN.value == "caution_heat_hydration_strain"
    assert BurroTriageStatus.CRITICAL_OVERLOAD_DEHYDRATION_HAZARD.value == "critical_overload_dehydration_hazard"


def test_slickrock_burro_route_model_and_aliases():
    route_data = {
        "routeId": "san-rafael-swell-chute-canyon",
        "title": "San Rafael Swell Chute Canyon Slickrock Wash",
        "region": "Emery County, Utah",
        "range": "San Rafael Swell",
        "trailDistanceKm": 24.5,
        "canyonTerrain": "slickrock_dry_wash",
        "waterAvailability": "intermittent_tinaja_pockets",
        "maxAmbientTempC": 38.0,
        "description": "Deep sandstone dry wash.",
        "highlights": ["Navajo sandstone slot narrows"],
    }
    route = SlickrockBurroRoute(**route_data)
    assert route.id == "san-rafael-swell-chute-canyon"
    assert route.routeId == "san-rafael-swell-chute-canyon"
    assert route.trail_distance_km == 24.5
    assert route.trailDistanceKm == 24.5
    assert route.canyon_terrain == "slickrock_dry_wash"
    assert route.canyonTerrain == "slickrock_dry_wash"
    assert route.water_availability == "intermittent_tinaja_pockets"
    assert route.waterAvailability == "intermittent_tinaja_pockets"
    assert route.max_ambient_temp_c == 38.0
    assert route.maxAmbientTempC == 38.0
    assert route.name == route.title


def test_burro_dynamics_query_model_and_aliases():
    query_data = {
        "routeId": "grand-gulch-cedar-mesa-canyon",
        "canyonTerrain": "rugged_cobble_wash",
        "waterSource": "spring_fed_potholes",
        "hoofProtection": "neoprene_trail_boots",
        "burroCount": 3,
        "ambientPeakTempC": 34.0,
        "dailyTrekKm": 18.0,
        "cargoWeightKgPerBurro": 42.0,
        "pannierWeightDeltaKg": 1.2,
    }
    query = BurroDynamicsQuery(**query_data)
    assert query.route_id == "grand-gulch-cedar-mesa-canyon"
    assert query.routeId == "grand-gulch-cedar-mesa-canyon"
    assert query.terrain == "rugged_cobble_wash"
    assert query.water_source == "spring_fed_potholes"
    assert query.waterSource == "spring_fed_potholes"
    assert query.hoof_protection == "neoprene_trail_boots"
    assert query.hoofProtection == "neoprene_trail_boots"
    assert query.burro_count == 3
    assert query.burroCount == 3
    assert query.ambient_peak_temp_c == 34.0
    assert query.ambientPeakTempC == 34.0
    assert query.daily_trek_km == 18.0
    assert query.dailyTrekKm == 18.0
    assert query.cargo_weight_kg_per_burro == 42.0
    assert query.cargoWeightKgPerBurro == 42.0
    assert query.pannier_weight_delta_kg == 1.2
    assert query.pannierWeightDeltaKg == 1.2


def test_burro_dynamics_result_model_and_aliases():
    result_data = {
        "routeTitle": "San Rafael Swell Chute Canyon Slickrock Wash",
        "routeId": "san-rafael-swell-chute-canyon",
        "dailyWaterRequirementLiters": 28.5,
        "hoofSlickrockSlipRiskIndex": 0.38,
        "pannierBalanceScore": 85.0,
        "triageStatus": "caution_heat_hydration_strain",
        "packBalanceAdvisory": "Caution advised.",
        "desertTrekWaterProtocol": "Water stock regularly.",
    }
    res = BurroDynamicsResult(**result_data)
    assert res.route_title == "San Rafael Swell Chute Canyon Slickrock Wash"
    assert res.routeTitle == "San Rafael Swell Chute Canyon Slickrock Wash"
    assert res.route_id == "san-rafael-swell-chute-canyon"
    assert res.routeId == "san-rafael-swell-chute-canyon"
    assert res.daily_water_requirement_liters == 28.5
    assert res.dailyWaterRequirementLiters == 28.5
    assert res.hoof_slickrock_slip_risk_index == 0.38
    assert res.hoofSlickrockSlipRiskIndex == 0.38
    assert res.pannier_balance_score == 85.0
    assert res.pannierBalanceScore == 85.0
    assert res.triage_status == "caution_heat_hydration_strain"
    assert res.triageStatus == "caution_heat_hydration_strain"
    assert res.pack_balance_advisory == "Caution advised."
    assert res.packBalanceAdvisory == "Caution advised."
    assert res.desert_trek_water_protocol == "Water stock regularly."
    assert res.desertTrekWaterProtocol == "Water stock regularly."


def test_burro_gear_item_model_and_aliases():
    item_data = {
        "itemId": "sawbuck-pack-saddle-rig",
        "name": "Solid Ash Wood Sawbuck Pack Saddle & Double Cinch Rig",
        "category": "Pack Rigging",
        "mandatory": True,
        "purpose": "Even load distribution.",
    }
    gear = BurroGearItem(**item_data)
    assert gear.item_id == "sawbuck-pack-saddle-rig"
    assert gear.itemId == "sawbuck-pack-saddle-rig"
    assert gear.id == "sawbuck-pack-saddle-rig"
    assert gear.description == "Even load distribution."
    assert gear.purpose == "Even load distribution."
    assert gear.mandatory is True


def test_slickrock_burro_intent_model():
    intent = SlickrockBurroIntent(
        action="calculate",
        route_id="san-rafael-swell-chute-canyon",
        query="Calculate dynamics",
        terrain="slickrock_dry_wash",
    )
    assert intent.action == "calculate"
    assert intent.route_id == "san-rafael-swell-chute-canyon"
    assert intent.query == "Calculate dynamics"
    assert intent.terrain == "slickrock_dry_wash"


def test_formatted_response_wrapper():
    resp = FormattedSlickrockBurroResponse(
        "Burro answer",
        {"slickrock_burro_info": {"action": "catalog"}, "answer": "Burro answer"},
    )
    assert str(resp) == "Burro answer"
    assert resp.get("answer") == "Burro answer"
    assert resp["slickrock_burro_info"]["action"] == "catalog"
    assert "slickrock_burro_info" in resp
    assert "answer" in list(resp.keys())
    assert len(list(resp.values())) == 2
    assert len(list(resp.items())) == 2


def test_slickrock_burro_catalog_and_filtering():
    all_routes = get_burro_routes()
    assert len(all_routes) == 5
    route_ids = [r.id for r in all_routes]
    assert "san-rafael-swell-chute-canyon" in route_ids
    assert "grand-gulch-cedar-mesa-canyon" in route_ids
    assert "death-valley-cottonwood-marble" in route_ids
    assert "escalante-river-baker-canyon" in route_ids
    assert "big-bend-mesa-de-anguila" in route_ids

    # Filter slickrock_dry_wash (2 routes: san rafael and big bend)
    slickrock_routes = get_burro_routes(terrain="slickrock_dry_wash")
    assert len(slickrock_routes) == 2
    slickrock_ids = [r.id for r in slickrock_routes]
    assert "san-rafael-swell-chute-canyon" in slickrock_ids
    assert "big-bend-mesa-de-anguila" in slickrock_ids

    # Filter deep_alluvial_sand
    sand_routes = get_burro_routes(terrain="deep_alluvial_sand")
    assert len(sand_routes) == 1
    assert sand_routes[0].id == "escalante-river-baker-canyon"

    # Filter limestone_scree_bench
    scree_routes = get_burro_routes(terrain="limestone_scree_bench")
    assert len(scree_routes) == 1
    assert scree_routes[0].id == "death-valley-cottonwood-marble"

    # Filter rugged_cobble_wash
    cobble_routes = get_burro_routes(terrain="rugged_cobble_wash")
    assert len(cobble_routes) == 1
    assert cobble_routes[0].id == "grand-gulch-cedar-mesa-canyon"

    # Lookup single route
    sr = get_burro_route("san-rafael-swell-chute-canyon")
    assert sr is not None
    assert sr.trail_distance_km == 24.5
    assert len(sr.highlights) == 3

    # Unknown route
    assert get_burro_route("non-existent-wash") is None


def test_slickrock_burro_gear_checklist():
    gear = get_burro_gear()
    assert len(gear) == 6
    assert all(g.mandatory is True for g in gear)
    item_ids = [g.item_id for g in gear]
    assert "sawbuck-pack-saddle-rig" in item_ids
    assert "heavy-duty-canvas-panniers" in item_ids
    assert "collapsible-desert-water-bladder" in item_ids
    assert "protective-equine-trail-boots" in item_ids
    assert "hoof-pick-and-rasp-kit" in item_ids
    assert "desert-night-hobble-tether" in item_ids


def test_burro_dynamics_calculation_nominal():
    # Ambient 20.0, trek 8.0, cargo 25.0, delta 0.5, boots
    query = BurroDynamicsQuery(
        route_id="san-rafael-swell-chute-canyon",
        terrain="slickrock_dry_wash",
        water_source="intermittent_tinaja_pockets",
        hoof_protection="neoprene_trail_boots",
        burro_count=2,
        ambient_peak_temp_c=20.0,
        daily_trek_km=8.0,
        cargo_weight_kg_per_burro=25.0,
        pannier_weight_delta_kg=0.5,
    )
    res = calculate_burro_dynamics(query)
    # base_water = 15.0 + 0 + 8.0*0.45 + 25.0*0.15 = 15.0 + 3.6 + 3.75 = 22.35 -> round(22.35, 1) = 22.4
    assert res.daily_water_requirement_liters == 22.4
    # slip risk: 0.35 * 0.65 + (25/65)*0.25 = 0.2275 + 0.09615 = 0.32365 -> round = 0.32
    assert res.hoof_slickrock_slip_risk_index == 0.32
    # pannier balance: 100 - 0.5*10 = 95.0
    assert res.pannier_balance_score == 95.0
    assert res.triage_status == "optimal_conditioned_trek"
    assert "OPTIMAL TREK RIGGING" in res.pack_balance_advisory
    assert "STANDARD WATER PROTOCOL" in res.desert_trek_water_protocol


def test_burro_dynamics_calculation_caution():
    # Ambient 25.0, trek 12.0, cargo 32.0, delta 1.8, boots
    query = BurroDynamicsQuery(
        route_id="grand-gulch-cedar-mesa-canyon",
        terrain="rugged_cobble_wash",
        water_source="spring_fed_potholes",
        hoof_protection="neoprene_trail_boots",
        burro_count=2,
        ambient_peak_temp_c=25.0,
        daily_trek_km=12.0,
        cargo_weight_kg_per_burro=32.0,
        pannier_weight_delta_kg=1.8,
    )
    res = calculate_burro_dynamics(query)
    # base_water = 15.0 + (25-20)*0.9 + 12*0.45 + 32*0.15 = 15.0 + 4.5 + 5.4 + 4.8 = 29.7
    assert res.daily_water_requirement_liters == 29.7
    assert res.triage_status == "caution_heat_hydration_strain"
    assert "CAUTION" in res.pack_balance_advisory
    assert "ELEVATED HYDRATION ADVISORY" in res.desert_trek_water_protocol


def test_burro_dynamics_calculation_critical():
    # Ambient 42.0 (> 40 triggers critical)
    query = BurroDynamicsQuery(
        route_id="death-valley-cottonwood-marble",
        terrain="limestone_scree_bench",
        water_source="sparse_alkali_seeps",
        hoof_protection="barefoot_conditioned",
        burro_count=2,
        ambient_peak_temp_c=42.0,
        daily_trek_km=25.0,
        cargo_weight_kg_per_burro=48.0,
        pannier_weight_delta_kg=4.5,
    )
    res = calculate_burro_dynamics(query)
    assert res.triage_status == "critical_overload_dehydration_hazard"
    assert res.daily_water_requirement_liters >= 35.0
    assert "CRITICAL OVERLOAD HAZARD" in res.pack_balance_advisory
    assert "EMERGENCY DESERT WATER PROTOCOL" in res.desert_trek_water_protocol


def test_burro_dynamics_calculation_unknown_route():
    query = BurroDynamicsQuery(route_id="non-existent-route")
    with pytest.raises(ValueError, match="not found"):
        calculate_burro_dynamics(query)


def test_detect_slickrock_burro_intent():
    # Positive matches
    assert detect_slickrock_burro_intent("Tell me about San Rafael Swell chute canyon") is True
    assert detect_slickrock_burro_intent("Slickrock burro packing expedition logistics") is True
    assert detect_slickrock_burro_intent("What gear do I need for sawbuck pack saddle?") is True
    assert detect_slickrock_burro_intent("Burro hydration requirement in dry wash") is True
    assert detect_slickrock_burro_intent("Grand gulch cedar mesa canyon details") is True
    assert detect_slickrock_burro_intent("Death valley cottonwood marble burro trek") is True
    assert detect_slickrock_burro_intent("Escalante river baker canyon meander traverse") is True
    assert detect_slickrock_burro_intent("Big bend mesa de anguila burro packing") is True
    assert detect_slickrock_burro_intent("Equip neoprene trail boots for slickrock burros") is True

    # Empty / whitespace
    assert detect_slickrock_burro_intent("") is False
    assert detect_slickrock_burro_intent("   ") is False

    # Negative matches / exclusions
    assert detect_slickrock_burro_intent("Can I get an order #12345 tracking?") is False
    assert detect_slickrock_burro_intent("I want a refund for my order") is False
    assert detect_slickrock_burro_intent("Pack burro race at Leadville boom days") is False
    assert detect_slickrock_burro_intent("Burro racing over Mosquito pass") is False
    assert detect_slickrock_burro_intent("How do I pack a pulk for dogsledding?") is False
    assert detect_slickrock_burro_intent("Tell me about bog shoeing in muskeg peatland") is False
    assert detect_slickrock_burro_intent("Cryokarst moulin shaft exploration techniques") is False


def test_disambiguation_guards_in_pack_burro_racing():
    # Slickrock burro queries should NOT trigger racing pack burro intent
    assert detect_pack_burro_intent("Slickrock burro packing expedition logistics") is None
    assert detect_pack_burro_intent("How much water does a burro need in dry wash?") is None
    assert detect_pack_burro_intent("Sawbuck pack saddle rig and canvas panniers") is None
    assert detect_pack_burro_intent("Watering pack burros at desert tinajas") is None


def test_extract_slickrock_burro_intent():
    # Catalog
    intent = extract_slickrock_burro_intent("List all slickrock burro routes")
    assert intent.action == "catalog"

    # Route detail
    intent = extract_slickrock_burro_intent("Tell me details about San Rafael Swell chute canyon")
    assert intent.action == "get_route"
    assert intent.route_id == "san-rafael-swell-chute-canyon"

    # Calculate
    intent = extract_slickrock_burro_intent("Calculate burro hydration and slip risk for Chute Canyon")
    assert intent.action == "calculate"
    assert intent.route_id == "san-rafael-swell-chute-canyon"

    # Gear
    intent = extract_slickrock_burro_intent("What mandatory sawbuck saddle and pannier gear do I need?")
    assert intent.action == "gear_checklist"


def test_format_slickrock_burro_response():
    # Catalog action
    resp = format_slickrock_burro_response("catalog")
    assert "slickrock_burro_info" in resp
    assert resp["slickrock_burro_info"]["action"] == "catalog"
    assert len(resp["slickrock_burro_info"]["routes"]) == 5

    # Route detail action
    resp_route = format_slickrock_burro_response("get_route", "escalante-river-baker-canyon")
    assert resp_route["slickrock_burro_info"]["action"] == "get_route"
    assert resp_route["slickrock_burro_info"]["route_id"] == "escalante-river-baker-canyon"

    # Gear checklist action
    resp_gear = format_slickrock_burro_response("gear_checklist")
    assert resp_gear["slickrock_burro_info"]["action"] == "gear_checklist"
    assert resp_gear["slickrock_burro_info"]["mandatory_count"] == 6

    # Calculate action
    resp_calc = format_slickrock_burro_response("calculate", "san-rafael-swell-chute-canyon")
    assert resp_calc["slickrock_burro_info"]["action"] == "calculate"
    assert "daily_water_requirement_liters" in resp_calc["slickrock_burro_info"]

    # Preformatted dict passthrough
    mock_dict = {
        "slickrock_burro_info": {"action": "preformatted"},
        "answer": "Preformatted answer",
    }
    resp_pass = format_slickrock_burro_response("anything", mock_dict)
    assert resp_pass.get("answer") == "Preformatted answer"


def test_build_slickrock_burro_prompt():
    prompt = build_slickrock_burro_prompt()
    assert "Equine Desert Hydration & Metabolic Demand" in prompt
    assert "Slickrock Sandstone Friction & Hoof Protection" in prompt
    assert "Sawbuck Pack Saddle Rigging & Pannier Balance" in prompt
    assert "Mandatory Expedition Gear" in prompt

    prompt_route = build_slickrock_burro_prompt("Tell me about Chute Canyon burro trek")
    assert "Focused Expedition Route: San Rafael Swell Chute Canyon Slickrock Wash" in prompt_route


def test_slickrock_burro_tool():
    # Catalog
    res = slickrock_burro_tool(action="catalog")
    assert res["slickrock_burro_info"]["action"] == "catalog"

    # Gear
    res_gear = slickrock_burro_tool(action="gear")
    assert res_gear["slickrock_burro_info"]["action"] == "gear_checklist"

    # Route detail
    res_route = slickrock_burro_tool(action="get_route", route_id="big-bend-mesa-de-anguila")
    assert res_route["slickrock_burro_info"]["action"] == "get_route"

    # Calculate
    res_calc = slickrock_burro_tool(
        query=BurroDynamicsQuery(route_id="death-valley-cottonwood-marble")
    )
    assert res_calc["slickrock_burro_info"]["action"] == "calculate"


def test_chat_handler_and_stream_events():
    # Chat handler
    handled = handle_slickrock_burro_intent("What is the burro hydration calculation for Chute Canyon?")
    assert handled is not None
    assert "slickrock_burro_info" in handled
    assert handled["slickrock_burro_info"]["action"] == "calculate"

    # Non-matching returns None
    assert handle_slickrock_burro_intent("Tell me about refund status") is None


@pytest.mark.anyio
async def test_stream_events_generator():
    events = []
    async for chunk in generate_slickrock_burro_stream_events(
        "Calculate burro dynamics for Chute Canyon"
    ):
        events.append(chunk)

    assert len(events) > 0
    assert any("slickrock_burro_calculated" in e for e in events)
    assert any("slickrock_burro_info" in e for e in events)
    assert events[-1] == "data: [DONE]\n\n"
