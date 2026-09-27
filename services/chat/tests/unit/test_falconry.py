import math

import pytest
from contoso_chat.falconry import (
    FalconryGearModel,
    FalconryGroundModel,
    FalconryIntent,
    FalconryRequest,
    FalconryResponse,
    FormattedFalconryResponse,
    build_falconry_prompt,
    calculate_raptor_conditioning,
    detect_falconry_intent,
    falconry_tool,
    format_falconry_response,
    get_falconry_gear_checklist,
    get_falconry_ground,
    get_falconry_grounds,
)

# =============================================================================
# 1. Models & Catalog Tests
# =============================================================================


def test_falconry_ground_model():
    ground = FalconryGroundModel(
        ground_id="test-ground",
        title="Test Hunting Grounds",
        region="Wyoming High Desert, USA",
        territory="Red Desert Steppe",
        elevation_m=2000,
        primary_species="peregrine_falcon",
        flight_style="high_pitch_stoop",
        description="A premier high-altitude test falconry territory.",
        highlights=["Open horizon", "Strong thermal lift"],
    )
    assert ground.ground_id == "test-ground"
    assert ground.elevation_m == 2000
    assert ground.primary_species == "peregrine_falcon"
    assert len(ground.highlights) == 2


def test_falconry_request_defaults():
    req = FalconryRequest()
    assert req.ground_id == "sagebrush-sea-wyoming"
    assert req.raptor_species == "peregrine_falcon"
    assert req.base_molt_weight_grams == 900.0
    assert req.target_weight_grams == 790.0
    assert req.pitch_altitude_m == 250.0
    assert req.ambient_temp_c == 10.0


def test_get_falconry_grounds_all():
    grounds = get_falconry_grounds()
    assert len(grounds) == 5
    ground_ids = [g.ground_id for g in grounds]
    assert "sagebrush-sea-wyoming" in ground_ids
    assert "snake-river-birds-of-prey" in ground_ids
    assert "san-luis-valley-alpine-plateau" in ground_ids
    assert "sonoran-desert-bajada" in ground_ids
    assert "bighorn-basin-badlands" in ground_ids


def test_get_falconry_grounds_filter_species():
    peregrines = get_falconry_grounds(species="peregrine_falcon")
    assert len(peregrines) == 2
    for g in peregrines:
        assert g.primary_species == "peregrine_falcon"

    gyrfalcons = get_falconry_grounds(species="gyrfalcon")
    assert len(gyrfalcons) == 1
    assert gyrfalcons[0].ground_id == "sagebrush-sea-wyoming"

    harris = get_falconry_grounds(species="harriss_hawk")
    assert len(harris) == 1
    assert harris[0].ground_id == "sonoran-desert-bajada"

    eagles = get_falconry_grounds(species="golden_eagle")
    assert len(eagles) == 1
    assert eagles[0].ground_id == "bighorn-basin-badlands"


def test_get_falconry_ground_by_id():
    ground = get_falconry_ground("snake-river-birds-of-prey")
    assert ground is not None
    assert ground.title == "Morley Nelson Snake River Birds of Prey NCA"
    assert ground.region == "Owyhee Canyonlands, Idaho, USA"
    assert ground.elevation_m == 950
    assert ground.primary_species == "peregrine_falcon"
    assert ground.flight_style == "high_pitch_stoop"
    assert len(ground.highlights) == 3

    unknown = get_falconry_ground("nonexistent-ground")
    assert unknown is None


# =============================================================================
# 2. Conditioning & Flight Calculation Tests
# =============================================================================


def test_calculate_raptor_conditioning_standard():
    req = FalconryRequest(
        ground_id="sagebrush-sea-wyoming",
        raptor_species="peregrine_falcon",
        base_molt_weight_grams=900.0,
        target_weight_grams=790.0,
        pitch_altitude_m=250.0,
        ambient_temp_c=10.0,
    )
    res = calculate_raptor_conditioning(req)
    assert res.ground_id == "sagebrush-sea-wyoming"
    assert res.ground_title == "Red Desert High Steppe & Sagebrush Sea"
    assert res.raptor_species == "peregrine_falcon"
    # ((790 - 900) / 900) * 100 = -12.2%
    assert res.weight_deviation_percent == -12.2
    assert res.conditioning_status == "prime_hunting_condition"
    # stoop speed peregrine: min(240.0, round(sqrt(2 * 9.81 * 250 * 0.82) * 2.23694, 1))
    expected_speed = min(240.0, round(math.sqrt(2 * 9.81 * 250.0 * 0.82) * 2.23694, 1))
    assert res.estimated_stoop_speed_mph == expected_speed
    # telemetry range: round(sqrt(250) * 1.8 + 12.0, 1) = 40.5
    expected_range = round(math.sqrt(250.0) * 1.8 + 12.0, 1)
    assert res.telemetry_range_km == expected_range
    assert len(res.weight_conditioning_advisory) > 0
    assert len(res.flight_recovery_guidance) > 0


def test_calculate_conditioning_statuses():
    # > -5.0: lethargic_overfed
    res_overfed = calculate_raptor_conditioning(
        FalconryRequest(base_molt_weight_grams=1000.0, target_weight_grams=960.0)
    )
    assert res_overfed.weight_deviation_percent == -4.0
    assert res_overfed.conditioning_status == "lethargic_overfed"

    # Boundary -5.0: prime_hunting_condition
    res_bound_5 = calculate_raptor_conditioning(
        FalconryRequest(base_molt_weight_grams=1000.0, target_weight_grams=950.0)
    )
    assert res_bound_5.weight_deviation_percent == -5.0
    assert res_bound_5.conditioning_status == "prime_hunting_condition"

    # >= -14.0: prime_hunting_condition
    res_prime = calculate_raptor_conditioning(
        FalconryRequest(base_molt_weight_grams=1000.0, target_weight_grams=870.0)
    )
    assert res_prime.weight_deviation_percent == -13.0
    assert res_prime.conditioning_status == "prime_hunting_condition"

    # Boundary -14.0: prime_hunting_condition
    res_bound_14 = calculate_raptor_conditioning(
        FalconryRequest(base_molt_weight_grams=1000.0, target_weight_grams=860.0)
    )
    assert res_bound_14.weight_deviation_percent == -14.0
    assert res_bound_14.conditioning_status == "prime_hunting_condition"

    # >= -18.0: keen_hyper_responsive
    res_keen = calculate_raptor_conditioning(
        FalconryRequest(base_molt_weight_grams=1000.0, target_weight_grams=840.0)
    )
    assert res_keen.weight_deviation_percent == -16.0
    assert res_keen.conditioning_status == "keen_hyper_responsive"

    # Boundary -18.0: keen_hyper_responsive
    res_bound_18 = calculate_raptor_conditioning(
        FalconryRequest(base_molt_weight_grams=1000.0, target_weight_grams=820.0)
    )
    assert res_bound_18.weight_deviation_percent == -18.0
    assert res_bound_18.conditioning_status == "keen_hyper_responsive"

    # < -18.0: starvation_danger_lethal
    res_starve = calculate_raptor_conditioning(
        FalconryRequest(base_molt_weight_grams=1000.0, target_weight_grams=800.0)
    )
    assert res_starve.weight_deviation_percent == -20.0
    assert res_starve.conditioning_status == "starvation_danger_lethal"


def test_calculate_stoop_speeds_all_species():
    alt = 300.0
    # peregrine falcon: 0.82 drag factor, cap 240.0
    res_peregrine = calculate_raptor_conditioning(
        FalconryRequest(raptor_species="peregrine_falcon", pitch_altitude_m=alt)
    )
    assert res_peregrine.estimated_stoop_speed_mph == min(
        240.0, round(math.sqrt(2 * 9.81 * alt * 0.82) * 2.23694, 1)
    )

    # gyrfalcon: 0.70 drag factor, cap 190.0
    res_gyr = calculate_raptor_conditioning(
        FalconryRequest(raptor_species="gyrfalcon", pitch_altitude_m=alt)
    )
    assert res_gyr.estimated_stoop_speed_mph == min(
        190.0, round(math.sqrt(2 * 9.81 * alt * 0.70) * 2.23694, 1)
    )

    # harriss_hawk: 0.35 drag factor, cap 75.0
    res_harris = calculate_raptor_conditioning(
        FalconryRequest(raptor_species="harriss_hawk", pitch_altitude_m=alt)
    )
    assert res_harris.estimated_stoop_speed_mph == min(
        75.0, round(math.sqrt(2 * 9.81 * alt * 0.35) * 2.23694, 1)
    )

    # red_tailed_hawk: 0.40 drag factor, cap 85.0
    res_redtail = calculate_raptor_conditioning(
        FalconryRequest(raptor_species="red_tailed_hawk", pitch_altitude_m=alt)
    )
    assert res_redtail.estimated_stoop_speed_mph == min(
        85.0, round(math.sqrt(2 * 9.81 * alt * 0.40) * 2.23694, 1)
    )

    # golden_eagle: 0.65 drag factor, cap 160.0
    res_eagle = calculate_raptor_conditioning(
        FalconryRequest(raptor_species="golden_eagle", pitch_altitude_m=alt)
    )
    assert res_eagle.estimated_stoop_speed_mph == min(
        160.0, round(math.sqrt(2 * 9.81 * alt * 0.65) * 2.23694, 1)
    )


def test_calculate_unknown_ground_raises():
    with pytest.raises(ValueError, match="Falconry ground 'unknown-ground' not found"):
        calculate_raptor_conditioning(FalconryRequest(ground_id="unknown-ground"))


# =============================================================================
# 3. Gear Checklist Tests
# =============================================================================


def test_get_falconry_gear_checklist():
    gear = get_falconry_gear_checklist()
    assert len(gear) == 6
    item_ids = [g.item_id for g in gear]
    assert "vhf-gps-telemetry-transmitter" in item_ids
    assert "elk-hide-falconry-gauntlet" in item_ids
    assert "handcrafted-aylmeri-jesses" in item_ids
    assert "dutch-blocked-raptor-hood" in item_ids
    assert "digital-gram-field-scale" in item_ids
    assert "feathered-leather-training-lure" in item_ids

    for item in gear:
        assert isinstance(item, FalconryGearModel)
        assert item.mandatory is True
        assert len(item.purpose) > 0


# =============================================================================
# 4. Intent Detection Tests
# =============================================================================


def test_detect_falconry_intent_positive():
    intent1 = detect_falconry_intent("Tell me about falconry Snake River birds of prey canyon")
    assert intent1 is not None
    assert intent1.ground_id == "snake-river-birds-of-prey"

    intent2 = detect_falconry_intent(
        "Calculate falconry weight calibration for 900g molt weight and 790g target"
    )
    assert intent2 is not None
    assert intent2.action in ("calculate_conditioning", "calculate")

    intent3 = detect_falconry_intent("What is the peregrine stoop speed from 250 meters pitch?")
    assert intent3 is not None
    assert intent3.action in ("calculate_conditioning", "calculate")
    assert intent3.raptor_species == "peregrine_falcon"

    intent4 = detect_falconry_intent(
        "Tell me about handcrafted Aylmeri jesses and Dutch falconry hood"
    )
    assert intent4 is not None
    assert intent4.action in ("gear_checklist", "gear")

    intent5 = detect_falconry_intent("Raptor telemetry tracking 216MHz transmitter checklist")
    assert intent5 is not None
    assert intent5.action in ("gear_checklist", "gear")

    intent6 = detect_falconry_intent("Show me wilderness falconry grounds catalog for gyrfalcon")
    assert intent6 is not None
    assert intent6.action in ("grounds_list", "list_grounds")
    assert intent6.raptor_species == "gyrfalcon"

    intent7 = detect_falconry_intent("Harris hawk cast hunting in the desert")
    assert intent7 is not None
    assert intent7.raptor_species == "harriss_hawk"


def test_detect_falconry_intent_exclusions():
    assert detect_falconry_intent("Check status of order #12345 for falconry hood") is None
    assert detect_falconry_intent("I want a refund on my falconry gauntlet") is None
    assert detect_falconry_intent("Send return label for Aylmeri jesses") is None
    assert detect_falconry_intent("Where is my shipping tracking for telemetry?") is None
    assert detect_falconry_intent("Tell me about burro pack trips") is None
    assert detect_falconry_intent("Horse riding near Snake River") is None
    assert detect_falconry_intent("Pack goat hiking trails") is None
    assert detect_falconry_intent("Dogsled adventures in Wyoming") is None
    assert detect_falconry_intent("Primitive trapping hares") is None
    assert detect_falconry_intent("Gold pan in Wyoming rivers") is None
    assert detect_falconry_intent("Beachcombing along the coast") is None
    assert detect_falconry_intent("Fire lookout tower rental") is None
    assert detect_falconry_intent("Snowshoe trails in the Rockies") is None
    assert detect_falconry_intent("Sandboarding Great Sand Dunes") is None
    assert detect_falconry_intent("Cave diving blue holes") is None
    assert detect_falconry_intent("Caving explorations") is None
    assert detect_falconry_intent("Ski touring backcountry") is None
    assert detect_falconry_intent("Steep skiing couloirs") is None
    assert detect_falconry_intent("Nordic skiing trails") is None
    assert detect_falconry_intent("Telemark skiing turns") is None
    assert detect_falconry_intent("Are falconry gear rentals available?") is None
    assert detect_falconry_intent("What is the rental price?") is None


def test_detect_falconry_intent_empty():
    assert detect_falconry_intent("") is None
    assert detect_falconry_intent("   ") is None


# =============================================================================
# 5. Response Formatting & Prompt Building Tests
# =============================================================================


def test_format_falconry_response_calculation():
    req = FalconryRequest(
        ground_id="snake-river-birds-of-prey",
        raptor_species="peregrine_falcon",
        base_molt_weight_grams=900.0,
        target_weight_grams=790.0,
        pitch_altitude_m=250.0,
    )
    formatted = format_falconry_response(
        FalconryIntent(action="calculate_conditioning", ground_id="snake-river-birds-of-prey"),
        req,
    )
    assert isinstance(formatted, FormattedFalconryResponse)
    assert "falconry_info" in formatted
    info = formatted["falconry_info"]
    assert info["action"] in ("calculate_conditioning", "calculate")
    assert "calculation" in info
    calc = info["calculation"]
    assert calc["ground_id"] == "snake-river-birds-of-prey"
    assert "answer" in formatted
    assert "Snake River" in str(formatted)


def test_format_falconry_response_gear():
    formatted = format_falconry_response(FalconryIntent(action="gear_checklist"))
    assert "falconry_info" in formatted
    info = formatted["falconry_info"]
    assert info["action"] == "gear_checklist"
    assert len(info["gear"]) == 6
    assert "answer" in formatted
    assert "Aylmeri" in str(formatted)


def test_format_falconry_response_ground_detail():
    formatted = format_falconry_response(
        FalconryIntent(action="ground_detail", ground_id="sagebrush-sea-wyoming")
    )
    assert "falconry_info" in formatted
    info = formatted["falconry_info"]
    assert info["action"] == "ground_detail"
    assert info["ground"]["ground_id"] == "sagebrush-sea-wyoming"
    assert "Sagebrush Sea" in str(formatted)


def test_format_falconry_response_grounds_list():
    formatted = format_falconry_response(FalconryIntent(action="grounds_list"))
    assert "falconry_info" in formatted
    info = formatted["falconry_info"]
    assert info["action"] == "grounds_list"
    assert len(info["grounds"]) == 5


def test_build_falconry_prompt():
    prompt = build_falconry_prompt(
        FalconryIntent(action="ground_detail", ground_id="sagebrush-sea-wyoming")
    )
    assert "Falconry" in prompt or "falconry" in prompt.lower()
    assert "telemetry" in prompt.lower()
    assert "Sagebrush Sea" in prompt


# =============================================================================
# 6. Tool Function Tests
# =============================================================================


def test_falconry_tool():
    res_req = falconry_tool(request=FalconryRequest())
    assert isinstance(res_req, FalconryResponse)

    res_gear = falconry_tool(action="gear_checklist")
    assert isinstance(res_gear, list)
    assert len(res_gear) == 6

    res_detail = falconry_tool(action="ground_detail", ground_id="sonoran-desert-bajada")
    assert isinstance(res_detail, FalconryGroundModel)
    assert res_detail.ground_id == "sonoran-desert-bajada"

    res_list = falconry_tool(action="grounds_list")
    assert isinstance(res_list, list)
    assert len(res_list) == 5


# =============================================================================
# 7. Chat Intent Cascade & Stream Generator Tests
# =============================================================================


def test_handle_falconry_intent():
    from contoso_chat.chat import handle_falconry_intent

    res = handle_falconry_intent("Tell me about falconry Snake River birds of prey canyon")
    assert res is not None
    assert "falconry_info" in res
    assert "answer" in res

    none_res = handle_falconry_intent("Where is my order #12345?")
    assert none_res is None


@pytest.mark.anyio
async def test_generate_falconry_stream_events():
    from contoso_chat.stream import generate_falconry_stream_events

    calc_events = []
    async for chunk in generate_falconry_stream_events(
        "Calculate peregrine stoop speed from 250 meters pitch"
    ):
        calc_events.append(chunk)

    assert len(calc_events) > 0
    full_output = "".join(calc_events)
    assert "falconry_calculated" in full_output
    assert "data: [DONE]" in full_output

    lookup_events = []
    async for chunk in generate_falconry_stream_events("Tell me about falconry Snake River canyon"):
        lookup_events.append(chunk)

    assert len(lookup_events) > 0
    lookup_output = "".join(lookup_events)
    assert "falconry_lookup" in lookup_output

    none_events = []
    async for chunk in generate_falconry_stream_events("Where is my order #12345?"):
        none_events.append(chunk)

    assert len(none_events) == 0


def test_formatted_falconry_response_dict_methods():
    resp = FormattedFalconryResponse("Answer text", {"foo": "bar", "answer": "Answer text"})
    assert resp.get("foo") == "bar"
    assert resp.get("missing", 42) == 42
    assert resp["foo"] == "bar"
    assert "foo" in resp
    assert "missing" not in resp
    assert list(resp.keys()) == ["foo", "answer"]
    assert "bar" in list(resp.values())
    assert ("foo", "bar") in list(resp.items())
