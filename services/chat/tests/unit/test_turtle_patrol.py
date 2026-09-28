import pytest
from contoso_chat.turtle_patrol import (
    FormattedTurtlePatrolResponse,
    TurtlePatrolGearModel,
    TurtlePatrolIntent,
    TurtlePatrolRequest,
    TurtlePatrolSectorModel,
    calculate_turtle_patrol_dynamics,
    detect_turtle_patrol_intent,
    format_turtle_patrol_response,
    get_turtle_patrol_gear_checklist,
    get_turtle_patrol_sector,
    get_turtle_patrol_sectors,
    turtle_patrol_tool,
)


def test_turtle_patrol_sector_model():
    sector = TurtlePatrolSectorModel(
        sector_id="cape-hatteras-barrier-spit",
        title="Cape Hatteras North Spit Barrier Beach",
        beach_location="Outer Banks, NC",
        region="Outer Banks, NC",
        beach_length_km=18.5,
        primary_species="loggerhead",
        patrol_zone="barrier_island_dunes",
        avg_nests_per_km=14,
        description="Dynamic barrier spit subject to high-energy Atlantic surf.",
        highlights=["Dark sky dune barrier perimeter", "Ghost crab predator track surveying"],
    )
    assert sector.sector_id == "cape-hatteras-barrier-spit"
    assert sector.beach_length_km == 18.5
    assert len(sector.highlights) == 2


def test_get_turtle_patrol_sectors_all():
    sectors = get_turtle_patrol_sectors()
    assert len(sectors) == 5
    sector_ids = [s.sector_id for s in sectors]
    assert "cape-hatteras-barrier-spit" in sector_ids
    assert "cumberland-island-wilderness-beach" in sector_ids
    assert "padre-island-national-seashore" in sector_ids
    assert "archie-carr-national-refuge" in sector_ids
    assert "culebra-resaca-beach-atoll" in sector_ids


def test_get_turtle_patrol_sectors_filtering():
    barrier = get_turtle_patrol_sectors(patrol_zone="barrier_island_dunes")
    assert len(barrier) == 2
    for s in barrier:
        assert s.patrol_zone == "barrier_island_dunes"

    refuge = get_turtle_patrol_sectors(patrol_zone="coastal_wildlife_refuge")
    assert len(refuge) == 2
    for s in refuge:
        assert s.patrol_zone == "coastal_wildlife_refuge"

    atoll = get_turtle_patrol_sectors(patrol_zone="remote_cays_atoll")
    assert len(atoll) == 1
    assert atoll[0].sector_id == "culebra-resaca-beach-atoll"


def test_get_turtle_patrol_sector_lookup():
    sector = get_turtle_patrol_sector("cape-hatteras-barrier-spit")
    assert sector is not None
    assert sector.title == "Cape Hatteras North Spit Barrier Beach"
    assert sector.primary_species == "loggerhead"

    invalid = get_turtle_patrol_sector("nonexistent-beach-spit")
    assert invalid is None


def test_calculate_turtle_patrol_dynamics_default():
    req = TurtlePatrolRequest()
    res = calculate_turtle_patrol_dynamics(req)
    assert res.sector_id == "cape-hatteras-barrier-spit"
    assert res.sector_title == "Cape Hatteras North Spit Barrier Beach"
    assert res.primary_species == "loggerhead"
    assert res.patrol_length_km == 18.0
    # Emergence count: round(14 * (18 / 5) * 8.5) = 428
    assert res.estimated_emergence_count == 428
    # Incubation days: 55 - 0 * 2.2 = 55
    assert res.incubation_days_estimate == 55
    # Predator risk: round(0.20 * 100 + 15 * 0.15) = 22
    assert res.predator_loss_risk_percent == 22
    assert res.conservation_status == "elevated_predator_advisory"
    assert "High-frequency sweeps" in res.patrol_frequency_recommendation
    assert "ELEVATED ADVISORY" in res.conservation_advisory


def test_calculate_turtle_patrol_dynamics_temperatures():
    # Warm temperature (33 C) -> faster development, min clamped to 45
    req_warm = TurtlePatrolRequest(
        sector_id="archie-carr-national-refuge",
        ambient_temperature_c=33.0,
    )
    res_warm = calculate_turtle_patrol_dynamics(req_warm)
    # 55 - (33 - 28) * 2.2 = 55 - 11 = 44 -> clamped to 45
    assert res_warm.incubation_days_estimate == 45

    # Cold temperature (20 C) -> slower development, clamped to max 70
    req_cold = TurtlePatrolRequest(
        sector_id="archie-carr-national-refuge",
        ambient_temperature_c=20.0,
    )
    res_cold = calculate_turtle_patrol_dynamics(req_cold)
    # 55 - (20 - 28) * 2.2 = 55 - (-17.6) = 72.6 -> clamped to 70
    assert res_cold.incubation_days_estimate == 70


def test_calculate_turtle_patrol_dynamics_predator_pressure():
    # Critical predator pressure
    req_critical = TurtlePatrolRequest(
        sector_id="padre-island-national-seashore",
        predator_pressure="critical",
        moon_phase_illumination_percent=30.0,
    )
    res_critical = calculate_turtle_patrol_dynamics(req_critical)
    # pressure factor 0.42 * 100 + 30 * 0.15 = 42 + 4.5 = 46.5 -> 47
    assert res_critical.predator_loss_risk_percent == 46
    assert res_critical.conservation_status == "critical_tidal_washout_hazard"
    assert "Continuous nocturnal sweeps" in res_critical.patrol_frequency_recommendation
    assert "CRITICAL ALERT" in res_critical.conservation_advisory

    # Low predator pressure, no moon
    req_low = TurtlePatrolRequest(
        sector_id="cumberland-island-wilderness-beach",
        predator_pressure="low",
        moon_phase_illumination_percent=0.0,
    )
    res_low = calculate_turtle_patrol_dynamics(req_low)
    # pressure factor 0.08 * 100 + 0 = 8%
    assert res_low.predator_loss_risk_percent == 8
    assert res_low.conservation_status == "optimal_nesting_conditions"
    assert "Standard dusk and pre-dawn" in res_low.patrol_frequency_recommendation
    assert "OPTIMAL CONDITIONS" in res_low.conservation_advisory


def test_calculate_turtle_patrol_dynamics_unknown_sector():
    req = TurtlePatrolRequest(sector_id="unknown-sector")
    with pytest.raises(ValueError, match="Turtle patrol sector 'unknown-sector' not found"):
        calculate_turtle_patrol_dynamics(req)


def test_get_turtle_patrol_gear_checklist():
    gear = get_turtle_patrol_gear_checklist()
    assert len(gear) == 6
    gear_ids = [g.item_id for g in gear]
    assert "red-led-headlamp-monochrome" in gear_ids
    assert "dune-predator-exclusion-cages" in gear_ids
    assert "night-patrol-gps-caliper-kit" in gear_ids
    assert "soft-touch-hatchling-carrier" in gear_ids
    assert "high-tide-bamboo-marker-poles" in gear_ids
    assert "coastal-high-intensity-uv-filter" in gear_ids
    for g in gear:
        assert isinstance(g, TurtlePatrolGearModel)
        assert g.mandatory is True


def test_detect_turtle_patrol_intent_exclusions():
    assert detect_turtle_patrol_intent("") is None
    assert detect_turtle_patrol_intent("What is my order #12345 status?") is None
    assert detect_turtle_patrol_intent("Can I get a refund for my return label?") is None
    assert detect_turtle_patrol_intent("Do you offer pack goat gear or burro rentals?") is None
    assert detect_turtle_patrol_intent("I want to go cave diving in Florida springs") is None
    assert detect_turtle_patrol_intent("Falconry raptor telemetry check") is None
    assert detect_turtle_patrol_intent("Zipline cable tension calculation") is None


def test_detect_turtle_patrol_intent_calculate():
    intent = detect_turtle_patrol_intent(
        "Calculate emergence count and incubation days for Cape Hatteras turtle patrol"
    )
    assert intent is not None
    assert intent.action in ("calculate", "calculate_dynamics")
    assert intent.sector_id == "cape-hatteras-barrier-spit"

    intent2 = detect_turtle_patrol_intent(
        "Estimate predator loss risk and nest dynamics at Padre Island"
    )
    assert intent2 is not None
    assert intent2.action in ("calculate", "calculate_dynamics")
    assert intent2.sector_id == "padre-island-national-seashore"


def test_detect_turtle_patrol_intent_gear():
    intent = detect_turtle_patrol_intent(
        "What is the required gear checklist for sea turtle barrier beach patrolling?"
    )
    assert intent is not None
    assert intent.action in ("gear", "gear_checklist")

    intent2 = detect_turtle_patrol_intent(
        "Tell me about red headlamp 600nm and predator exclusion cages equipment"
    )
    assert intent2 is not None
    assert intent2.action in ("gear", "gear_checklist")


def test_detect_turtle_patrol_intent_sector_detail():
    intent = detect_turtle_patrol_intent(
        "Tell me details about Culebra Resaca leatherback turtle nesting patrol"
    )
    assert intent is not None
    assert intent.action == "sector_detail"
    assert intent.sector_id == "culebra-resaca-beach-atoll"

    intent2 = detect_turtle_patrol_intent(
        "About Archie Carr green turtle nesting rookery"
    )
    assert intent2 is not None
    assert intent2.action == "sector_detail"
    assert intent2.sector_id == "archie-carr-national-refuge"


def test_detect_turtle_patrol_intent_sectors_list():
    intent = detect_turtle_patrol_intent(
        "Show me all sea turtle patrol barrier beach sectors catalog"
    )
    assert intent is not None
    assert intent.action in ("sectors_list", "routes")


def test_format_turtle_patrol_response_calculate():
    intent = TurtlePatrolIntent(
        action="calculate",
        sector_id="cape-hatteras-barrier-spit",
    )
    formatted = format_turtle_patrol_response(intent)
    assert isinstance(formatted, FormattedTurtlePatrolResponse)
    info = formatted.get("turtle_patrol_info")
    assert info is not None
    assert info["action"] in ("calculate", "calculate_dynamics")
    assert info["calculation"]["sector_id"] == "cape-hatteras-barrier-spit"
    assert "Cape Hatteras" in str(formatted)


def test_format_turtle_patrol_response_gear():
    intent = TurtlePatrolIntent(action="gear")
    formatted = format_turtle_patrol_response(intent)
    assert isinstance(formatted, FormattedTurtlePatrolResponse)
    info = formatted.get("turtle_patrol_info")
    assert info is not None
    assert info["action"] in ("gear", "gear_checklist")
    assert len(info["gear"]) == 6
    assert "Red LED Headlamp" in str(formatted)


def test_format_turtle_patrol_response_detail():
    intent = TurtlePatrolIntent(
        action="sector_detail",
        sector_id="padre-island-national-seashore",
    )
    formatted = format_turtle_patrol_response(intent)
    assert isinstance(formatted, FormattedTurtlePatrolResponse)
    info = formatted.get("turtle_patrol_info")
    assert info is not None
    assert info["action"] == "sector_detail"
    assert info["sector"]["sector_id"] == "padre-island-national-seashore"
    assert "Padre Island" in str(formatted)


def test_format_turtle_patrol_response_list():
    intent = TurtlePatrolIntent(action="sectors_list")
    formatted = format_turtle_patrol_response(intent)
    assert isinstance(formatted, FormattedTurtlePatrolResponse)
    info = formatted.get("turtle_patrol_info")
    assert info is not None
    assert info["action"] in ("sectors_list", "routes")
    assert len(info["sectors"]) == 5
    assert "Catalog" in str(formatted)


def test_turtle_patrol_tool():
    res = turtle_patrol_tool(
        request=TurtlePatrolRequest(sector_id="cumberland-island-wilderness-beach"),
        action="calculate",
    )
    assert isinstance(res, dict)
    assert "turtle_patrol_info" in res
    assert res["turtle_patrol_info"]["sector_id"] == "cumberland-island-wilderness-beach"
