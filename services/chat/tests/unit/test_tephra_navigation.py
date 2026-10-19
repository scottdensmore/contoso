"""Unit tests for Volcanic Tephra, Ash-Fall & Lapilli Scree Slope Descent & Respirator domain."""

from typing import get_args

import pytest
from contoso_chat.chat import handle_tephra_navigation_intent
from contoso_chat.lava_tube_biospeleology import (
    detect_lava_tube_biospeleology_intent,
)
from contoso_chat.mountaineering import detect_mountaineering_intent
from contoso_chat.rock_glacier_navigation import is_rock_glacier_navigation_query
from contoso_chat.scree_running import detect_scree_running_intent
from contoso_chat.smoke_advisory import detect_smoke_advisory_intent
from contoso_chat.solfatara_navigation import is_solfatara_navigation_query
from contoso_chat.stream import generate_tephra_navigation_stream_events
from contoso_chat.tephra_navigation import (
    TEPHRA_GEAR_CHECKLIST,
    TEPHRA_SLOPE_SITES,
    TephraDifficulty,
    TephraLithology,
    TephraRespiratorClass,
    TephraRiskLevel,
    build_tephra_navigation_prompt,
    calculate_tephra_navigation,
    extract_tephra_navigation_params,
    filter_sites,
    format_tephra_navigation_response,
    get_all_sites,
    get_gear_checklist,
    get_site_by_id,
    is_tephra_navigation_query,
)


def test_tephra_navigation_literals():
    assert set(get_args(TephraLithology)) == {
        "scoria-lapilli",
        "lithic-cinder",
        "vesicular-pumice",
        "vitrophyric-ash",
    }
    assert set(get_args(TephraDifficulty)) == {
        "moderate",
        "challenging",
        "extreme",
    }
    assert set(get_args(TephraRiskLevel)) == {
        "low",
        "moderate",
        "high",
        "critical",
    }
    assert set(get_args(TephraRespiratorClass)) == {
        "N95-goggles",
        "P100-elastomeric-sealed-goggles",
        "P100-full-face-APR",
        "abort-silicosis-grainflow-hazard",
    }


def test_tephra_sites_catalog_and_lookup():
    assert len(TEPHRA_SLOPE_SITES) == 4
    all_sites = get_all_sites()
    assert len(all_sites) == 4

    expected_ids = {
        "yasur-ash-plain-vanuatu",
        "acatenango-fuego-tephra-guatemala",
        "tarawera-scoria-chute-nz",
        "chaiten-rhyolite-pumice-chile",
    }
    assert {s["id"] for s in all_sites} == expected_ids

    yasur = get_site_by_id("yasur-ash-plain-vanuatu")
    assert yasur is not None
    assert yasur["id"] == "yasur-ash-plain-vanuatu"
    assert yasur["name"] == "Mount Yasur Ash Plain & Scoria Cone Apron"
    assert yasur["country"] == "Vanuatu"
    assert yasur["tephra_lithology"] == "scoria-lapilli"
    assert yasur["difficulty"] == "moderate"

    acatenango = get_site_by_id("acatenango-fuego-tephra-guatemala")
    assert acatenango is not None
    assert acatenango["name"] == "Volcán Acatenango–Fuego Lapilli Saddle & Scree Chute"
    assert acatenango["country"] == "Guatemala"
    assert acatenango["tephra_lithology"] == "lithic-cinder"
    assert acatenango["difficulty"] == "challenging"

    tarawera = get_site_by_id("tarawera-scoria-chute-nz")
    assert tarawera is not None
    assert tarawera["name"] == "Mount Tarawera Chasm & Basaltic Scoria Scree"
    assert tarawera["country"] == "New Zealand"
    assert tarawera["tephra_lithology"] == "vesicular-pumice"
    assert tarawera["difficulty"] == "challenging"

    chaiten = get_site_by_id("chaiten-rhyolite-pumice-chile")
    assert chaiten is not None
    assert chaiten["name"] == "Volcán Chaitén Obsidian Dome & Cristobalite Ash Apron"
    assert chaiten["country"] == "Chile"
    assert chaiten["tephra_lithology"] == "vitrophyric-ash"
    assert chaiten["difficulty"] == "extreme"

    assert get_site_by_id("nonexistent-tephra-site") is None


def test_filter_sites():
    by_country = filter_sites(country="Vanuatu")
    assert len(by_country) == 1
    assert by_country[0]["id"] == "yasur-ash-plain-vanuatu"

    by_lithology = filter_sites(tephra_lithology="vitrophyric-ash")
    assert len(by_lithology) == 1
    assert by_lithology[0]["id"] == "chaiten-rhyolite-pumice-chile"

    by_difficulty = filter_sites(difficulty="challenging")
    assert len(by_difficulty) == 2
    assert {s["id"] for s in by_difficulty} == {
        "acatenango-fuego-tephra-guatemala",
        "tarawera-scoria-chute-nz",
    }

    by_search = filter_sites(search="Cristobalite")
    assert len(by_search) == 1
    assert by_search[0]["id"] == "chaiten-rhyolite-pumice-chile"

    combined = filter_sites(
        country="Guatemala",
        tephra_lithology="lithic-cinder",
        difficulty="challenging",
        search="Acatenango",
    )
    assert len(combined) == 1
    assert combined[0]["id"] == "acatenango-fuego-tephra-guatemala"

    empty = filter_sites(country="Iceland")
    assert empty == []


def test_get_gear_checklist():
    assert len(TEPHRA_GEAR_CHECKLIST) >= 6
    checklist = get_gear_checklist()
    assert len(checklist) == len(TEPHRA_GEAR_CHECKLIST)
    assert all(item["mandatory"] is True for item in checklist)
    assert all("id" in item and "name" in item and "category" in item for item in checklist)


def test_calculate_tephra_navigation_tiers():
    # 1. Low risk -> N95-goggles
    low = calculate_tephra_navigation(
        slope_angle_deg=14.0,
        ash_depth_cm=12.0,
        wind_speed_kmh=10.0,
        cristobalite_pct=2.0,
        grain_size_mm=8.0,
    )
    assert low["risk_level"] == "low"
    assert low["respirator_class"] == "N95-goggles"
    assert low["grain_flow_factor_of_safety"] >= 1.55
    assert low["resuspended_pm10_ug_m3"] < 250.0
    assert low["downslope_slide_ratio"] > 0.0
    assert low["filter_clog_hours"] > 0.0
    assert isinstance(low["warnings"], list)
    assert isinstance(low["recommendations"], list)
    assert len(low["recommendations"]) >= 1

    # 2. Moderate risk -> P100-elastomeric-sealed-goggles
    moderate = calculate_tephra_navigation(
        slope_angle_deg=26.0,
        ash_depth_cm=38.0,
        wind_speed_kmh=22.0,
        cristobalite_pct=6.0,
        grain_size_mm=4.0,
    )
    assert moderate["risk_level"] == "moderate"
    assert moderate["respirator_class"] == "P100-elastomeric-sealed-goggles"
    assert moderate["resuspended_pm10_ug_m3"] > low["resuspended_pm10_ug_m3"]
    assert moderate["grain_flow_factor_of_safety"] < low["grain_flow_factor_of_safety"]

    # 3. High risk -> P100-full-face-APR
    high = calculate_tephra_navigation(
        slope_angle_deg=36.0,
        ash_depth_cm=65.0,
        wind_speed_kmh=42.0,
        cristobalite_pct=12.5,
        grain_size_mm=1.8,
    )
    assert high["risk_level"] == "high"
    assert high["respirator_class"] == "P100-full-face-APR"
    assert high["resuspended_pm10_ug_m3"] > moderate["resuspended_pm10_ug_m3"]
    assert high["grain_flow_factor_of_safety"] < moderate["grain_flow_factor_of_safety"]
    assert high["downslope_slide_ratio"] > moderate["downslope_slide_ratio"]
    assert high["filter_clog_hours"] < moderate["filter_clog_hours"]

    # 4. Critical risk -> abort-silicosis-grainflow-hazard
    critical = calculate_tephra_navigation(
        slope_angle_deg=44.0,
        ash_depth_cm=140.0,
        wind_speed_kmh=68.0,
        cristobalite_pct=22.0,
        grain_size_mm=0.25,
    )
    assert critical["risk_level"] == "critical"
    assert critical["respirator_class"] == "abort-silicosis-grainflow-hazard"
    assert critical["resuspended_pm10_ug_m3"] > high["resuspended_pm10_ug_m3"]
    assert critical["grain_flow_factor_of_safety"] < high["grain_flow_factor_of_safety"]
    assert critical["downslope_slide_ratio"] > high["downslope_slide_ratio"]
    assert len(critical["warnings"]) >= 2


@pytest.mark.parametrize(
    "invalid_kwargs",
    [
        {"slope_angle_deg": -1.0},
        {"slope_angle_deg": 56.0},
        {"ash_depth_cm": -5.0},
        {"ash_depth_cm": 305.0},
        {"wind_speed_kmh": -2.0},
        {"wind_speed_kmh": 155.0},
        {"cristobalite_pct": -0.5},
        {"cristobalite_pct": 36.0},
        {"grain_size_mm": 0.005},
        {"grain_size_mm": 65.0},
    ],
)
def test_calculate_tephra_navigation_validation_errors(invalid_kwargs):
    base_kwargs = {
        "slope_angle_deg": 28.0,
        "ash_depth_cm": 40.0,
        "wind_speed_kmh": 20.0,
        "cristobalite_pct": 8.0,
        "grain_size_mm": 2.0,
    }
    base_kwargs.update(invalid_kwargs)
    with pytest.raises(ValueError):
        calculate_tephra_navigation(**base_kwargs)


def test_is_tephra_navigation_query_and_disambiguation():
    positive_queries = [
        "How do we descend the volcanic tephra and scoria scree apron on Mount Yasur?",
        "What respirator is needed for Volcán Acatenango lapilli chute and ash-fall?",
        "Calculate ashfall PM10 resuspension and cristobalite hazard at Volcán Chaitén",
        "Mount Tarawera basaltic scoria scree and vesicular pumice scree descent protocol",
        "Best goggles and P100 filter for volcanic ash and lapilli scree slope descent",
    ]
    for q in positive_queries:
        assert is_tephra_navigation_query(q) is True

    assert is_tephra_navigation_query("") is False
    assert is_tephra_navigation_query("   ") is False
    assert is_tephra_navigation_query("Track my order #98765") is False
    assert is_tephra_navigation_query("I want a refund for my sleeping bag") is False
    assert (
        is_tephra_navigation_query("What is the best mountain bike for desert singletrack?")
        is False
    )

    disambig_queries = [
        "Scree running vs volcanic tephra and lapilli scree chute descent on Acatenango",
        "Wildfire smoke respirator vs cristobalite volcanic ash and tephra P100 respirator on Chaiten",
        "Solfatara fumarole gas vs Mount Yasur scoria scree and ash-fall lapilli descent",
        "Lava tube biospeleology vs Mount Tarawera pumice scree and tephra slope descent",
    ]
    for q in disambig_queries:
        assert is_tephra_navigation_query(q) is True
        assert detect_scree_running_intent(q) is False
        assert detect_smoke_advisory_intent(q) is False
        assert is_solfatara_navigation_query(q) is False
        assert detect_lava_tube_biospeleology_intent(q) is False
        assert is_rock_glacier_navigation_query(q) is False
        assert detect_mountaineering_intent(q) is None


def test_extract_tephra_navigation_params():
    q = (
        "Calculate tephra navigation safety on Chaiten with slope angle 39 deg, "
        "ash depth 110 cm, wind speed 52 km/h, cristobalite 21%, grain size 0.25 mm"
    )
    params = extract_tephra_navigation_params(q)
    assert params["site_id"] == "chaiten-rhyolite-pumice-chile"
    assert params["slope_angle_deg"] == 39.0
    assert params["ash_depth_cm"] == 110.0
    assert params["wind_speed_kmh"] == 52.0
    assert params["cristobalite_pct"] == 21.0
    assert params["grain_size_mm"] == 0.25
    assert params["is_calculation"] is True


def test_format_tephra_navigation_response_actions():
    # 1. Calculated action
    info_calc = format_tephra_navigation_response(
        "Calculate tephra navigation for slope angle 36 deg, ash depth 65 cm, wind speed 40 km/h, cristobalite 12%, grain size 1.5 mm"
    )
    assert isinstance(info_calc, dict)
    assert info_calc["action"] == "tephra_navigation_calculated"
    assert isinstance(info_calc["answer"], str) and len(info_calc["answer"]) > 20
    assert "resuspended_pm10_ug_m3" in info_calc
    assert "grain_flow_factor_of_safety" in info_calc
    assert "downslope_slide_ratio" in info_calc
    assert "filter_clog_hours" in info_calc
    assert "risk_level" in info_calc
    assert "respirator_class" in info_calc

    # 2. Lookup action
    info_lookup = format_tephra_navigation_response(
        "Tell me about Mount Yasur Ash Plain & Scoria Cone Apron tephra site details"
    )
    assert isinstance(info_lookup, dict)
    assert info_lookup["action"] == "tephra_navigation_lookup"
    assert info_lookup["site"]["id"] == "yasur-ash-plain-vanuatu"
    assert "Yasur" in info_lookup["answer"]

    # 3. General info action
    info_general = format_tephra_navigation_response(
        "What mandatory respirator and gaiter gear is required for volcanic tephra and lapilli scree descent?"
    )
    assert isinstance(info_general, dict)
    assert info_general["action"] == "tephra_navigation_info"
    assert len(info_general["sites"]) == 4
    assert len(info_general["gear_checklist"]) >= 6


@pytest.mark.anyio
async def test_chat_and_stream_handlers_and_prompt():
    prompt = build_tephra_navigation_prompt(
        "How do we navigate Volcán Acatenango lapilli scree and ash-fall?"
    )
    assert "Acatenango" in prompt or "Tephra" in prompt

    chat_res = handle_tephra_navigation_intent(
        "Tell me about Mount Yasur Ash Plain & Scoria Cone Apron tephra site"
    )
    assert chat_res is not None
    assert "tephra_navigation_info" in chat_res
    assert chat_res["tephra_navigation_info"]["action"] == "tephra_navigation_lookup"

    assert handle_tephra_navigation_intent("Where is my order #12345?") is None

    events = []
    async for ev in generate_tephra_navigation_stream_events(
        "Calculate tephra navigation for slope angle 36 deg, ash depth 65 cm, wind speed 40 km/h, cristobalite 12%, grain size 1.5 mm"
    ):
        events.append(ev)
    joined = "".join(events)
    assert "event: metadata" in joined
    assert "tephra_navigation_calculated" in joined
    assert "event: done" in joined
