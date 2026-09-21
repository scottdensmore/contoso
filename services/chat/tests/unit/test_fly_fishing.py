import pytest
from contoso_chat.fly_fishing import (
    FlyFishingIntent,
    FlyMatchRequest,
    build_fly_fishing_prompt,
    calculate_fly_match,
    detect_fly_fishing_intent,
    format_fly_fishing_response,
    get_fishing_location_by_id,
    get_fishing_locations,
    get_fly_fishing_gear,
)

# ---------------------------------------------------------------------------
# Catalog & Retrieval Tests
# ---------------------------------------------------------------------------


def test_get_fishing_locations_all():
    locations = get_fishing_locations()
    assert len(locations) == 5
    ids = [loc.location_id for loc in locations]
    assert "upper-yakima-canyon" in ids
    assert "enchantment-crystal-lakes" in ids
    assert "deschutes-warm-springs" in ids
    assert "metolius-headwaters" in ids
    assert "snake-river-grand-teton" in ids


def test_get_fishing_locations_filter_water_type():
    alpine_lakes = get_fishing_locations(water_type="alpine_lake")
    assert len(alpine_lakes) == 1
    assert alpine_lakes[0].location_id == "enchantment-crystal-lakes"

    freestone = get_fishing_locations(water_type="freestone_river")
    assert len(freestone) == 2
    freestone_ids = [loc.location_id for loc in freestone]
    assert "upper-yakima-canyon" in freestone_ids
    assert "snake-river-grand-teton" in freestone_ids


def test_get_fishing_locations_filter_state():
    or_waters = get_fishing_locations(state="OR")
    assert len(or_waters) == 2
    or_ids = [loc.location_id for loc in or_waters]
    assert "deschutes-warm-springs" in or_ids
    assert "metolius-headwaters" in or_ids

    wy_waters = get_fishing_locations(state="WY")
    assert len(wy_waters) == 1
    assert wy_waters[0].location_id == "snake-river-grand-teton"


def test_get_fishing_location_by_id():
    loc = get_fishing_location_by_id("upper-yakima-canyon")
    assert loc is not None
    assert loc.name == "Upper Yakima River Canyon"
    assert loc.state == "WA"
    assert loc.recommended_rod_wt == 5
    assert loc.recommended_tippet == "9ft 4X"
    assert loc.catch_and_release is True
    assert loc.barbless_required is True
    assert "Single barbless hooks required" in loc.regulations

    assert get_fishing_location_by_id("non-existent-id") is None


def test_get_fly_fishing_gear():
    gear = get_fly_fishing_gear()
    assert len(gear) == 6
    gear_ids = [g.item_id for g in gear]
    assert "barbless-fly-box" in gear_ids
    assert "rubber-mesh-net" in gear_ids
    assert "hemostats-forceps" in gear_ids
    assert "tippet-spools" in gear_ids
    assert "wading-safety" in gear_ids
    assert "polarized-eyewear" in gear_ids
    assert all(g.mandatory for g in gear)


# ---------------------------------------------------------------------------
# Fly Match & Thermal Warning Tests
# ---------------------------------------------------------------------------


def test_calculate_fly_match_normal_temp():
    req = FlyMatchRequest(
        location_id="upper-yakima-canyon",
        water_temp_f=54.0,
        time_of_day="midday",
        surface_activity="rising",
    )
    res = calculate_fly_match(req)
    assert res.location_id == "upper-yakima-canyon"
    assert res.location_name == "Upper Yakima River Canyon"
    assert "Chubby Chernobyl" in res.suggested_fly or "Salmonfly" in res.suggested_fly
    assert res.fish_activity == "high"
    assert res.thermal_warning is None
    assert "Single barbless hooks required" in res.regulations_summary


def test_calculate_fly_match_thermal_warning():
    req = FlyMatchRequest(
        location_id="deschutes-warm-springs",
        water_temp_f=66.5,
        time_of_day="afternoon",
        surface_activity="rising",
    )
    res = calculate_fly_match(req)
    assert res.fish_activity == "low"
    assert res.thermal_warning is not None
    assert (
        res.thermal_warning
        == "Hoot Owl Alert: Water temperature exceeds 65°F. Cease fishing during afternoon hours to protect native trout from thermal stress."
    )


def test_calculate_fly_match_subsurface_and_deep_pool():
    # Subsurface
    req_sub = FlyMatchRequest(
        location_id="metolius-headwaters",
        water_temp_f=48.0,
        surface_activity="subsurface_feeding",
    )
    res_sub = calculate_fly_match(req_sub)
    assert res_sub.fish_activity == "moderate"
    assert "nymph" in res_sub.presentation.lower() or "nymphing" in res_sub.presentation.lower()

    # Deep pool
    req_deep = FlyMatchRequest(
        location_id="snake-river-grand-teton",
        water_temp_f=56.0,
        surface_activity="deep_pool",
    )
    res_deep = calculate_fly_match(req_deep)
    assert "streamer" in res_deep.presentation.lower() or "swing" in res_deep.presentation.lower()


def test_calculate_fly_match_unknown_location():
    req = FlyMatchRequest(location_id="unknown-creek")
    with pytest.raises(ValueError, match="Unknown fishing location ID"):
        calculate_fly_match(req)


# ---------------------------------------------------------------------------
# Intent Detection & Disambiguation Tests
# ---------------------------------------------------------------------------


def test_detect_fly_fishing_intent_fly_match():
    intent = detect_fly_fishing_intent(
        "What fly should I use for trout fishing at Upper Yakima River with water temp at 56 degrees?"
    )
    assert intent is not None
    assert intent.action == "fly_match"
    assert intent.location_id == "upper-yakima-canyon"


def test_detect_fly_fishing_intent_gear_regulations():
    intent = detect_fly_fishing_intent(
        "What fly fishing gear and barbless hooks are required for catch and release trout?"
    )
    assert intent is not None
    assert intent.action == "gear_regulations"


def test_detect_fly_fishing_intent_location_detail():
    intent = detect_fly_fishing_intent(
        "Tell me about fly fishing in Enchantments crystal tarns for golden trout"
    )
    assert intent is not None
    assert intent.action == "location_detail"
    assert intent.location_id == "enchantment-crystal-lakes"
    assert intent.target_species == "golden_trout"


def test_detect_fly_fishing_intent_locations_list():
    intent = detect_fly_fishing_intent(
        "Where can I go alpine lake fly fishing in Washington?"
    )
    assert intent is not None
    assert intent.action == "locations_list"
    assert intent.water_type == "alpine_lake"


def test_detect_fly_fishing_intent_critical_disambiguation():
    # Negative queries: must return None
    assert detect_fly_fishing_intent("How do I filter water on the trail?") is None
    assert detect_fly_fishing_intent("Where can I go whitewater rafting on the Deschutes River?") is None
    assert detect_fly_fishing_intent("Can I have a campfire at the Enchantments?") is None
    assert detect_fly_fishing_intent("Are there hot springs near Leavenworth?") is None
    assert detect_fly_fishing_intent("What hiking boots should I pack for the alpine trail?") is None
    assert detect_fly_fishing_intent("Where is my return label for order #9872?") is None


# ---------------------------------------------------------------------------
# Prompt Construction & Formatting Tests
# ---------------------------------------------------------------------------


def test_build_fly_fishing_prompt():
    intent = FlyFishingIntent(
        action="location_detail",
        location_id="metolius-headwaters",
    )
    prompt = build_fly_fishing_prompt(intent)
    assert "Metolius River Springs" in prompt
    assert "Single barbless hooks required" in prompt
    assert "Hoot Owl" in prompt or "thermal" in prompt.lower()
    assert "Knotless rubber mesh" in prompt


def test_format_fly_fishing_response():
    # Gear regulations
    res_gear = format_fly_fishing_response(FlyFishingIntent(action="gear_regulations"))
    assert "answer" in res_gear
    assert "fly_fishing_info" in res_gear
    assert res_gear["fly_fishing_info"]["action"] == "gear_regulations"
    assert len(res_gear["fly_fishing_info"]["gear"]) == 6

    # Location detail
    res_loc = format_fly_fishing_response(
        FlyFishingIntent(action="location_detail", location_id="upper-yakima-canyon")
    )
    assert "Upper Yakima" in res_loc["answer"]
    assert res_loc["fly_fishing_info"]["location_id"] == "upper-yakima-canyon"

    # Fly match
    res_match = format_fly_fishing_response(
        FlyFishingIntent(action="fly_match", location_id="upper-yakima-canyon")
    )
    assert "fly_fishing_info" in res_match
    assert res_match["fly_fishing_info"]["action"] == "fly_match"
    assert res_match["fly_fishing_info"]["location_id"] == "upper-yakima-canyon"
