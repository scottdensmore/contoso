import pytest
from contoso_chat.sandboarding import (
    DuneLocationModel,
    FormattedSandboardingResponse,
    SandboardingGearModel,
    SandboardingIntent,
    SandboardingRequest,
    SandboardingResponse,
    build_sandboarding_prompt,
    calculate_sandboarding_glide,
    detect_sandboarding_intent,
    format_sandboarding_response,
    get_dune_location,
    get_dune_locations,
    get_sandboarding_gear_checklist,
    sandboarding_tool,
)

# =============================================================================
# 1. Models & Catalog Tests
# =============================================================================


def test_dune_location_model():
    dune = DuneLocationModel(
        dune_id="test-dune",
        title="Test Sand Dune",
        region="Mojave Desert, CA, USA",
        park="Death Valley National Park",
        elevation_m=500,
        dune_height_m=120,
        primary_style="directional_carver",
        max_slope_deg=33,
        sand_type="Quartz Aeolian Sand",
        description="A challenging test sand dune.",
        highlights=["Stunning slipface", "Dry desert air"],
    )
    assert dune.dune_id == "test-dune"
    assert dune.elevation_m == 500
    assert dune.max_slope_deg == 33
    assert len(dune.highlights) == 2


def test_sandboarding_request_defaults():
    req = SandboardingRequest()
    assert req.dune_id == "great-sand-dunes-star-dune"
    assert req.board_style == "directional_carver"
    assert req.rider_weight_lbs == 165.0
    assert req.slope_degrees == 32.0
    assert req.sand_condition == "dry_temperate_loose"
    assert req.wax_type == "silicone_speed_wax"


def test_get_dune_locations_all():
    dunes = get_dune_locations()
    assert len(dunes) == 5
    dune_ids = [d.dune_id for d in dunes]
    assert "great-sand-dunes-star-dune" in dune_ids
    assert "oregon-dunes-florence-bowl" in dune_ids
    assert "coral-pink-sand-dunes" in dune_ids
    assert "bruneau-dunes-mega-ridge" in dune_ids
    assert "white-sands-alkali-flats" in dune_ids


def test_get_dune_locations_filter_style():
    twin_tips = get_dune_locations(style="twin_tip_freestyle")
    assert len(twin_tips) == 2
    for d in twin_tips:
        assert d.primary_style == "twin_tip_freestyle"

    carvers = get_dune_locations(style="directional_carver")
    assert len(carvers) == 2
    for d in carvers:
        assert d.primary_style == "directional_carver"

    sleds = get_dune_locations(style="tandem_seated_sled")
    assert len(sleds) == 1
    assert sleds[0].dune_id == "white-sands-alkali-flats"


def test_get_dune_location_by_id():
    star_dune = get_dune_location("great-sand-dunes-star-dune")
    assert star_dune is not None
    assert star_dune.title == "Great Sand Dunes Star Dune Slipface"
    assert star_dune.elevation_m == 2600
    assert star_dune.dune_height_m == 230
    assert star_dune.sand_type == "Alpine Quartz & Volcanic Sand"
    assert star_dune.max_slope_deg == 34
    assert len(star_dune.highlights) == 3

    white_sands = get_dune_location("white-sands-alkali-flats")
    assert white_sands is not None
    assert white_sands.primary_style == "tandem_seated_sled"
    assert white_sands.sand_type == "Hydrous Calcium Sulfate Gypsum Sand"

    unknown = get_dune_location("nonexistent-dune")
    assert unknown is None


# =============================================================================
# 2. Glide Physics and Friction Calculation Tests
# =============================================================================


def test_calculate_sandboarding_glide_standard():
    req = SandboardingRequest(
        dune_id="great-sand-dunes-star-dune",
        board_style="directional_carver",
        slope_degrees=32.0,
        sand_condition="dry_temperate_loose",
        wax_type="silicone_speed_wax",
    )
    res = calculate_sandboarding_glide(req)
    assert res.dune_id == "great-sand-dunes-star-dune"
    assert res.dune_title == "Great Sand Dunes Star Dune Slipface"
    assert res.board_style == "directional_carver"
    # base mu = 0.22, mod = 0.00 -> final mu = 0.22
    assert res.kinetic_friction_coefficient == 0.22
    # slope = 32 -> moderate_surface_sluff (29 <= slope < 34)
    assert res.slipface_risk == "moderate_surface_sluff"
    assert res.wax_reapplication_runs == 2
    assert res.estimated_top_speed_mph > 20.0
    assert res.glide_performance in ("smooth_gliding", "blistering_speed")


def test_calculate_sandboarding_friction_coefficients():
    # silicone_speed_wax (0.22) + baked_desert_hot (+0.05) = 0.27
    res_silicone_hot = calculate_sandboarding_glide(
        SandboardingRequest(
            wax_type="silicone_speed_wax",
            sand_condition="baked_desert_hot",
        )
    )
    assert res_silicone_hot.kinetic_friction_coefficient == 0.27
    assert res_silicone_hot.wax_reapplication_runs == 1

    # pure_carnauba_hard (0.26) + early_morning_damp (-0.04) = 0.22
    res_carnauba_damp = calculate_sandboarding_glide(
        SandboardingRequest(
            wax_type="pure_carnauba_hard",
            sand_condition="early_morning_damp",
        )
    )
    assert res_carnauba_damp.kinetic_friction_coefficient == 0.22
    assert res_carnauba_damp.wax_reapplication_runs == 3

    # graphite_friction_shield (0.29) + wind_compacted_crust (-0.02) = 0.27
    res_graphite_crust = calculate_sandboarding_glide(
        SandboardingRequest(
            wax_type="graphite_friction_shield",
            sand_condition="wind_compacted_crust",
        )
    )
    assert res_graphite_crust.kinetic_friction_coefficient == 0.27
    assert res_graphite_crust.wax_reapplication_runs == 3

    # unwaxed_raw_base (0.52) + dry_temperate_loose (0.00) = 0.52
    res_unwaxed = calculate_sandboarding_glide(
        SandboardingRequest(
            wax_type="unwaxed_raw_base",
            sand_condition="dry_temperate_loose",
        )
    )
    assert res_unwaxed.kinetic_friction_coefficient == 0.52
    assert res_unwaxed.wax_reapplication_runs == 0
    # Unwaxed must cap speed at 14.0 mph
    assert res_unwaxed.estimated_top_speed_mph <= 14.0


def test_calculate_sandboarding_slipface_risks():
    # Steep >= 34.0 deg -> high_sandfall_avalanche
    res_steep = calculate_sandboarding_glide(
        SandboardingRequest(
            dune_id="bruneau-dunes-mega-ridge",
            slope_degrees=35.0,
        )
    )
    assert res_steep.slipface_risk == "high_sandfall_avalanche"

    # Moderate 29.0 to 33.9 deg -> moderate_surface_sluff
    res_mod = calculate_sandboarding_glide(
        SandboardingRequest(
            slope_degrees=31.0,
        )
    )
    assert res_mod.slipface_risk == "moderate_surface_sluff"

    # Low < 29.0 deg -> low_firm_sand
    res_low = calculate_sandboarding_glide(
        SandboardingRequest(
            dune_id="white-sands-alkali-flats",
            slope_degrees=25.0,
        )
    )
    assert res_low.slipface_risk == "low_firm_sand"


def test_calculate_sandboarding_unknown_dune_raises():
    with pytest.raises(ValueError, match="Dune location 'nonexistent-dune' not found"):
        calculate_sandboarding_glide(SandboardingRequest(dune_id="nonexistent-dune"))


# =============================================================================
# 3. Gear Checklist Tests
# =============================================================================


def test_get_sandboarding_gear_checklist():
    gear = get_sandboarding_gear_checklist()
    assert len(gear) == 6
    item_ids = [g.item_id for g in gear]
    assert "sealed-sand-goggles" in item_ids
    assert "hard-sand-speed-wax" in item_ids
    assert "thermal-sand-socks" in item_ids
    assert "desert-hydration-pack" in item_ids
    assert "board-base-scraper" in item_ids
    assert "sun-sand-shield-buff" in item_ids

    for item in gear:
        assert isinstance(item, SandboardingGearModel)
        assert item.mandatory is True
        assert len(item.purpose) > 0


# =============================================================================
# 4. Intent Detection Tests
# =============================================================================


def test_detect_sandboarding_intent_positive():
    intent1 = detect_sandboarding_intent(
        "What is the top speed on Great Sand Dunes star dune slipface?"
    )
    assert intent1 is not None
    assert intent1.dune_id == "great-sand-dunes-star-dune"

    intent2 = detect_sandboarding_intent(
        "Calculate sandboard friction with silicone speed wax at 32 degrees"
    )
    assert intent2 is not None
    assert intent2.action in ("calculate_glide", "calculate")

    intent3 = detect_sandboarding_intent("What gear do I need for sandboarding at Oregon Dunes?")
    assert intent3 is not None
    assert intent3.action in ("gear_checklist", "gear")

    intent4 = detect_sandboarding_intent("Tell me about dune sledding at White Sands gypsum dunes")
    assert intent4 is not None
    assert intent4.dune_id == "white-sands-alkali-flats"

    intent5 = detect_sandboarding_intent("Show me North American sandboarding dunes catalog")
    assert intent5 is not None
    assert intent5.action in ("dunes_list", "list_dunes")


def test_detect_sandboarding_intent_exclusions():
    # Exclusions must return None
    assert detect_sandboarding_intent("Check status of order #12345 for sandboard") is None
    assert detect_sandboarding_intent("Request a refund on sand wax") is None
    assert detect_sandboarding_intent("I need a return label for sandboarding goggles") is None
    assert detect_sandboarding_intent("Where is my shipping tracking for sand sled?") is None
    assert detect_sandboarding_intent("Tell me about burro packing in the desert") is None
    assert detect_sandboarding_intent("Can I take my horse on the dunes?") is None
    assert detect_sandboarding_intent("Do pack goats do well on sand dunes?") is None
    assert detect_sandboarding_intent("Tell me about dogsled mushing on snow") is None
    assert detect_sandboarding_intent("Primitive trapping hares on dunes") is None
    assert detect_sandboarding_intent("Gold pan in Oregon dunes") is None
    assert detect_sandboarding_intent("Beachcombing for agate along Oregon coast") is None
    assert detect_sandboarding_intent("Fire lookout tower overnight") is None
    assert detect_sandboarding_intent("Snowshoe trails in Colorado") is None
    assert (
        detect_sandboarding_intent("Are sandboard rentals available at the visitor center?") is None
    )
    assert detect_sandboarding_intent("What is the rental fee for sand sleds?") is None


def test_detect_sandboarding_intent_empty():
    assert detect_sandboarding_intent("") is None
    assert detect_sandboarding_intent("   ") is None


# =============================================================================
# 5. Response Formatting & Prompt Building Tests
# =============================================================================


def test_format_sandboarding_response_calculation():
    req = SandboardingRequest(
        dune_id="great-sand-dunes-star-dune",
        board_style="directional_carver",
        slope_degrees=32.0,
        wax_type="silicone_speed_wax",
    )
    formatted = format_sandboarding_response(
        SandboardingIntent(action="calculate_glide", dune_id="great-sand-dunes-star-dune"),
        req,
    )
    assert isinstance(formatted, FormattedSandboardingResponse)
    assert "sandboarding_info" in formatted
    info = formatted["sandboarding_info"]
    assert info["action"] in ("calculate_glide", "calculate")
    assert "calculation" in info
    calc = info["calculation"]
    assert calc["dune_id"] == "great-sand-dunes-star-dune"
    assert "answer" in formatted
    assert "Great Sand Dunes" in str(formatted)


def test_format_sandboarding_response_gear():
    formatted = format_sandboarding_response(SandboardingIntent(action="gear_checklist"))
    assert "sandboarding_info" in formatted
    info = formatted["sandboarding_info"]
    assert info["action"] == "gear_checklist"
    assert len(info["gear"]) == 6
    assert "answer" in formatted


def test_format_sandboarding_response_dune_detail():
    formatted = format_sandboarding_response(
        SandboardingIntent(action="dune_detail", dune_id="oregon-dunes-florence-bowl")
    )
    assert "sandboarding_info" in formatted
    info = formatted["sandboarding_info"]
    assert info["action"] == "dune_detail"
    assert info["dune"]["dune_id"] == "oregon-dunes-florence-bowl"
    assert "Oregon Dunes" in str(formatted)


def test_format_sandboarding_response_dunes_list():
    formatted = format_sandboarding_response(SandboardingIntent(action="dunes_list"))
    assert "sandboarding_info" in formatted
    info = formatted["sandboarding_info"]
    assert info["action"] == "dunes_list"
    assert len(info["dunes"]) == 5


def test_build_sandboarding_prompt():
    prompt = build_sandboarding_prompt(
        SandboardingIntent(action="dune_detail", dune_id="great-sand-dunes-star-dune")
    )
    assert "Sandboarding" in prompt or "sandboarding" in prompt.lower()
    assert "friction" in prompt.lower()
    assert "Great Sand Dunes" in prompt


# =============================================================================
# 6. Tool Function Tests
# =============================================================================


def test_sandboarding_tool():
    res_req = sandboarding_tool(request=SandboardingRequest())
    assert isinstance(res_req, SandboardingResponse)

    res_gear = sandboarding_tool(action="gear_checklist")
    assert isinstance(res_gear, list)
    assert len(res_gear) == 6

    res_detail = sandboarding_tool(action="dune_detail", dune_id="coral-pink-sand-dunes")
    assert isinstance(res_detail, DuneLocationModel)
    assert res_detail.dune_id == "coral-pink-sand-dunes"

    res_list = sandboarding_tool(action="dunes_list")
    assert isinstance(res_list, list)
    assert len(res_list) == 5


# =============================================================================
# 7. Chat Intent Cascade & Stream Generator Tests
# =============================================================================


def test_handle_sandboarding_intent():
    from contoso_chat.chat import handle_sandboarding_intent

    res = handle_sandboarding_intent(
        "What is the top speed on Great Sand Dunes star dune slipface?"
    )
    assert res is not None
    assert "sandboarding_info" in res
    assert "answer" in res

    none_res = handle_sandboarding_intent("Where is my order #12345?")
    assert none_res is None


@pytest.mark.anyio
async def test_generate_sandboarding_stream_events():
    from contoso_chat.stream import generate_sandboarding_stream_events

    calc_events = []
    async for chunk in generate_sandboarding_stream_events(
        "Calculate sandboarding speed with silicone speed wax on 32 degree slope"
    ):
        calc_events.append(chunk)

    assert len(calc_events) > 0
    full_output = "".join(calc_events)
    assert "sandboarding_calculated" in full_output
    assert "data: [DONE]" in full_output

    lookup_events = []
    async for chunk in generate_sandboarding_stream_events(
        "Tell me about sandboarding dunes at Great Sand Dunes"
    ):
        lookup_events.append(chunk)

    assert len(lookup_events) > 0
    lookup_output = "".join(lookup_events)
    assert "sandboarding_lookup" in lookup_output

    none_events = []
    async for chunk in generate_sandboarding_stream_events("Where is my order #12345?"):
        none_events.append(chunk)

    assert len(none_events) == 0


def test_formatted_sandboarding_response_dict_methods():
    resp = FormattedSandboardingResponse("Answer text", {"foo": "bar", "answer": "Answer text"})
    assert resp.get("foo") == "bar"
    assert resp.get("missing", 42) == 42
    assert resp["foo"] == "bar"
    assert "foo" in resp
    assert "missing" not in resp
    assert list(resp.keys()) == ["foo", "answer"]
    assert "bar" in list(resp.values())
    assert ("foo", "bar") in list(resp.items())


def test_calculate_sandboarding_glide_low_speed_bogged():
    # Very low slope and high friction
    req = SandboardingRequest(
        dune_id="white-sands-alkali-flats",
        slope_degrees=10.0,
        wax_type="unwaxed_raw_base",
        sand_condition="baked_desert_hot",
    )
    res = calculate_sandboarding_glide(req)
    assert res.glide_performance in ("high_friction_drag", "severe_drag_bogged")


def test_calculate_sandboarding_glide_styles():
    res_freestyle = calculate_sandboarding_glide(
        SandboardingRequest(
            board_style="twin_tip_freestyle",
            sand_condition="baked_desert_hot",
        )
    )
    assert "center-weighted" in res_freestyle.rider_technique_advisory.lower()
    assert "extreme slipface surface heat" in res_freestyle.thermal_base_warning.lower()

    res_sled = calculate_sandboarding_glide(
        SandboardingRequest(
            board_style="tandem_seated_sled",
            sand_condition="dry_temperate_loose",
        )
    )
    assert "feet securely inside" in res_sled.rider_technique_advisory.lower()

    res_other = calculate_sandboarding_glide(
        SandboardingRequest(
            board_style="custom_board",
            sand_condition="early_morning_damp",
        )
    )
    assert "maintain constant momentum" in res_other.rider_technique_advisory.lower()


def test_format_sandboarding_response_with_calc_response_and_dict():
    req = SandboardingRequest()
    calc_res = calculate_sandboarding_glide(req)
    formatted = format_sandboarding_response(calc_res)
    assert isinstance(formatted, FormattedSandboardingResponse)
    assert "Sandboarding Glide" in str(formatted)

    # Pre-formatted dict
    pre_formatted = {
        "sandboarding_info": {"action": "dunes_list"},
        "answer": "Pre-formatted answer",
    }
    f_dict = format_sandboarding_response(pre_formatted)
    assert str(f_dict) == "Pre-formatted answer"

    # String input
    f_str = format_sandboarding_response("tell me about oregon dunes")
    assert "sandboarding_info" in f_str


def test_detect_sandboarding_intent_styles():
    intent1 = detect_sandboarding_intent("Looking for twin tip freestyle sandboard options")
    assert intent1 is not None
    assert intent1.board_style == "twin_tip_freestyle"

    intent2 = detect_sandboarding_intent("Looking for directional carver sandboard")
    assert intent2 is not None
    assert intent2.board_style == "directional_carver"

    intent3 = detect_sandboarding_intent("Looking for sand sled at White Sands")
    assert intent3 is not None
    assert intent3.board_style == "tandem_seated_sled"
