import pytest
from contoso_chat.water import (
    HydrationEstimateRequest,
    HydrationEstimateResponse,
    WaterIntent,
    WaterReportRequest,
    WaterReportResponse,
    WaterSourceModel,
    build_water_prompt,
    calculate_hydration_estimate,
    detect_water_intent,
    format_water_response,
    get_pathogen_protection_info,
    get_water_source_by_id,
    get_water_sources,
    reset_water_store,
    submit_water_report,
)


@pytest.fixture(autouse=True)
def clean_water_store():
    reset_water_store()
    yield
    reset_water_store()


def test_water_source_model():
    src = WaterSourceModel(
        source_id="test-creek",
        name="Test Creek Crossing",
        trail_zone="Test Trail",
        region="Cascades",
        mile_marker=3.5,
        elevation_feet=3200,
        source_type="stream",
        flow_status="Flowing Strong",
        reliability="Year-round",
        turbidity="Clear",
        recommended_treatment=["Hollow-fiber microfilter"],
        notes="Reliable stream.",
    )
    assert src.source_id == "test-creek"
    assert src.elevation_feet == 3200
    assert src.flow_status == "Flowing Strong"


def test_get_water_sources_catalog_and_filtering():
    sources = get_water_sources()
    assert len(sources) >= 4
    source_ids = {s.source_id for s in sources}
    assert "colchuck-creek" in source_ids
    assert "asgard-snowmelt" in source_ids
    assert "panhandle-gap" in source_ids
    assert "enchanted-valley-spring" in source_ids

    # Filter by region
    cascades_sources = get_water_sources(region="Cascades")
    assert len(cascades_sources) >= 2
    assert all(s.region.lower() == "cascades" for s in cascades_sources)

    olympic_sources = get_water_sources(region="Olympics")
    assert len(olympic_sources) == 1
    assert olympic_sources[0].source_id == "enchanted-valley-spring"

    # Filter by reliability
    year_round = get_water_sources(reliability="Year-round")
    assert len(year_round) >= 2
    assert all(s.reliability.lower() == "year-round" for s in year_round)

    seasonal = get_water_sources(reliability="Seasonal")
    assert len(seasonal) >= 2
    assert all(s.reliability.lower() == "seasonal" for s in seasonal)

    # Filter no match
    none_found = get_water_sources(region="Desert")
    assert none_found == []


def test_get_water_source_by_id():
    colchuck = get_water_source_by_id("colchuck-creek")
    assert colchuck is not None
    assert colchuck.name == "Colchuck Creek Footbridge Crossing"
    assert colchuck.mile_marker == 2.2
    assert colchuck.elevation_feet == 4100
    assert colchuck.flow_status == "Flowing Strong"

    asgard = get_water_source_by_id("asgard-snowmelt")
    assert asgard is not None
    assert asgard.source_type == "glacial_melt"
    assert "Glacial Silt" in asgard.turbidity

    unknown = get_water_source_by_id("unknown-source")
    assert unknown is None


def test_calculate_hydration_estimate_10_miles_3000ft_80deg():
    req = HydrationEstimateRequest(
        distance_miles=10.0,
        elevation_gain_feet=3000,
        temp_fahrenheit=80,
    )
    res = calculate_hydration_estimate(req)
    assert isinstance(res, HydrationEstimateResponse)
    assert res.distance_miles == 10.0
    assert res.elevation_gain_feet == 3000
    assert res.temp_fahrenheit == 80
    assert res.total_liters_needed == 3.8
    assert res.recommended_carrying_capacity_liters in (2.5, 3.0)
    assert "2.5 - 3.0 L" in res.hydration_advice or "2.5" in res.hydration_advice
    assert res.estimated_hours > 0


def test_calculate_hydration_estimate_varying_parameters():
    # Mild short hike
    req_short = HydrationEstimateRequest(
        distance_miles=4.0,
        elevation_gain_feet=500,
        temp_fahrenheit=65,
    )
    res_short = calculate_hydration_estimate(req_short)
    assert res_short.total_liters_needed < 2.0
    assert res_short.estimated_hours < 3.0

    # Hot strenuous hike
    req_hot = HydrationEstimateRequest(
        distance_miles=16.0,
        elevation_gain_feet=4500,
        temp_fahrenheit=90,
    )
    res_hot = calculate_hydration_estimate(req_hot)
    assert res_hot.total_liters_needed > 5.0
    assert res_hot.recommended_carrying_capacity_liters in (2.5, 3.0)


def test_submit_water_report_success():
    req = WaterReportRequest(
        source_id="colchuck-creek",
        reporter_name="Alex Honnold",
        flow_status="Moderate Trickle",
        turbidity="Clear",
        notes="Water level dropped after dry week; footbridge clear.",
    )
    res = submit_water_report(req)
    assert isinstance(res, WaterReportResponse)
    assert res.report_id.startswith("WTR-")
    assert res.source_name == "Colchuck Creek Footbridge Crossing"
    assert res.flow_status == "Moderate Trickle"
    assert res.turbidity == "Clear"
    assert res.status == "verified"
    assert len(res.instructions) > 0

    # Verify source was updated in store
    updated = get_water_source_by_id("colchuck-creek")
    assert updated is not None
    assert updated.flow_status == "Moderate Trickle"
    assert "Water level dropped" in updated.notes


def test_submit_water_report_unknown_source():
    req = WaterReportRequest(
        source_id="nonexistent-spring",
        reporter_name="Jane Doe",
        flow_status="Dry",
        turbidity="High",
    )
    with pytest.raises(ValueError, match="not found"):
        submit_water_report(req)


def test_get_pathogen_protection_info():
    guide = get_pathogen_protection_info()
    assert "pathogens" in guide
    assert "technologies" in guide
    assert "glacial_silt_advice" in guide

    pathogens = guide["pathogens"]
    assert "protozoa" in pathogens
    assert "bacteria" in pathogens
    assert "viruses" in pathogens

    crypto_notes = pathogens["protozoa"]["notes"]
    assert "Cryptosporidium" in crypto_notes

    tech = guide["technologies"]
    assert "hollow_fiber" in tech
    assert "gravity_filters" in tech
    assert "chemical_treatment" in tech

    # Check pore size and viral limitation
    hollow_fiber = tech["hollow_fiber"]
    assert hollow_fiber["pore_size_microns"] == 0.1
    assert any("Virus" in item for item in hollow_fiber["does_not_remove"])


def test_detect_water_intent():
    # Sources queries
    intent1 = detect_water_intent("Where can I get water on the Colchuck Lake trail?")
    assert intent1 is not None
    assert intent1.action == "sources"
    assert intent1.trail_zone is not None and "colchuck" in intent1.trail_zone.lower()

    intent2 = detect_water_intent("Is Asgard Pass snowmelt drinkable?")
    assert intent2 is not None
    assert intent2.action == "sources"

    intent3 = detect_water_intent("Colchuck Creek water flow status")
    assert intent3 is not None
    assert intent3.action == "sources"
    assert intent3.source_id == "colchuck-creek"

    # Hydration queries
    intent4 = detect_water_intent("How much water should I carry for a 10 mile hike with 3000 ft gain?")
    assert intent4 is not None
    assert intent4.action == "hydration"
    assert intent4.distance_miles == 10.0

    intent5 = detect_water_intent("Need hydration estimate for 12 miles and 4000 feet gain at 85 degrees")
    assert intent5 is not None
    assert intent5.action == "hydration"
    assert intent5.distance_miles == 12.0

    # Filtration / pathogen queries
    intent6 = detect_water_intent("Does a Sawyer Squeeze kill cryptosporidium or viruses?")
    assert intent6 is not None
    assert intent6.action in ("filtration", "pathogens")

    intent7 = detect_water_intent("What filtration methods work for glacial silt?")
    assert intent7 is not None
    assert intent7.action in ("filtration", "pathogens")

    intent8 = detect_water_intent("Tell me about water purification and giardia")
    assert intent8 is not None
    assert intent8.action in ("filtration", "pathogens")

    # Report queries
    intent9 = detect_water_intent("Report water condition at Colchuck Creek")
    assert intent9 is not None
    assert intent9.action == "report"

    # Non-water queries
    assert detect_water_intent("What is the return policy on boots?") is None
    assert detect_water_intent("Do you have alpine tents in stock?") is None


def test_build_water_prompt():
    intent_sources = WaterIntent(action="sources", trail_zone="Colchuck Lake Trail")
    prompt_sources = build_water_prompt(intent_sources)
    assert "Backcountry Water Sources" in prompt_sources
    assert "Colchuck" in prompt_sources

    intent_hydration = WaterIntent(action="hydration", distance_miles=10.0)
    prompt_hydration = build_water_prompt(intent_hydration)
    assert "Hydration" in prompt_hydration
    assert "carrying capacity" in prompt_hydration.lower()

    intent_filt = WaterIntent(action="filtration")
    prompt_filt = build_water_prompt(intent_filt)
    assert "Hollow-fiber" in prompt_filt or "microfilter" in prompt_filt
    assert "Cryptosporidium" in prompt_filt


def test_format_water_response():
    # Sources response
    intent_src = WaterIntent(action="sources", trail_zone="Colchuck Lake Trail")
    res_src = format_water_response(intent_src)
    assert "answer" in res_src
    assert "water_info" in res_src
    assert res_src["water_info"]["action"] == "sources"
    assert len(res_src["water_info"]["sources"]) > 0

    # Hydration response
    intent_hyd = WaterIntent(action="hydration", distance_miles=10.0)
    res_hyd = format_water_response(intent_hyd)
    assert "water_info" in res_hyd
    assert res_hyd["water_info"]["action"] == "hydration"
    assert "estimate" in res_hyd["water_info"]
    assert "3.8" in res_hyd["answer"] or "carrying" in res_hyd["answer"].lower()

    # Filtration response
    intent_filt = WaterIntent(action="filtration")
    res_filt = format_water_response(intent_filt)
    assert "water_info" in res_filt
    assert "pathogen_guide" in res_filt["water_info"]
    assert "Sawyer Squeeze" in res_filt["answer"] or "hollow fiber" in res_filt["answer"].lower()
