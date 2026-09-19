import re
import secrets
from datetime import datetime, timezone
from typing import Any, Optional

from pydantic import BaseModel


class WaterSourceModel(BaseModel):
    source_id: str
    name: str
    trail_zone: str
    region: str
    mile_marker: float
    elevation_feet: int
    source_type: str  # stream, glacial_melt, alpine_lake, spring
    flow_status: str  # Flowing Strong, Moderate Trickle, Stagnant, Dry
    reliability: str  # Year-round, Seasonal, Unreliable / Dry
    turbidity: str
    recommended_treatment: list[str]
    notes: str


class HydrationEstimateRequest(BaseModel):
    distance_miles: float
    elevation_gain_feet: int
    temp_fahrenheit: int = 70


class HydrationEstimateResponse(BaseModel):
    distance_miles: float
    elevation_gain_feet: int
    temp_fahrenheit: int
    estimated_hours: float
    total_liters_needed: float
    recommended_carrying_capacity_liters: float
    hydration_advice: str


class WaterReportRequest(BaseModel):
    source_id: str
    reporter_name: str
    flow_status: str
    turbidity: str
    notes: Optional[str] = None


class WaterReportResponse(BaseModel):
    report_id: str  # Format: WTR-XXXXX
    source_name: str
    flow_status: str
    turbidity: str
    reported_at: str
    status: str = "verified"
    instructions: str


class WaterIntent(BaseModel):
    action: str  # "sources", "hydration", "filtration", "report", "pathogens"
    trail_zone: Optional[str] = None
    region: Optional[str] = None
    distance_miles: Optional[float] = None
    source_id: Optional[str] = None
    elevation_gain_feet: Optional[int] = None
    temp_fahrenheit: Optional[int] = None


DEFAULT_WATER_SOURCES: dict[str, WaterSourceModel] = {
    "colchuck-creek": WaterSourceModel(
        source_id="colchuck-creek",
        name="Colchuck Creek Footbridge Crossing",
        trail_zone="Colchuck Lake Trail",
        region="Cascades",
        mile_marker=2.2,
        elevation_feet=4100,
        source_type="stream",
        flow_status="Flowing Strong",
        reliability="Year-round",
        turbidity="Clear",
        recommended_treatment=[
            "Hollow-fiber microfilter (0.1 micron)",
            "UV purifier",
        ],
        notes="High-volume cascading mountain stream with a sturdy timber footbridge crossing at mile 2.2 (4,100 ft). Flowing strong and clear year-round.",
    ),
    "asgard-snowmelt": WaterSourceModel(
        source_id="asgard-snowmelt",
        name="Asgard Pass Mid-Slope Melt Cascades",
        trail_zone="Aasgard Pass",
        region="Cascades",
        mile_marker=5.1,
        elevation_feet=6800,
        source_type="glacial_melt",
        flow_status="Moderate Trickle",
        reliability="Seasonal",
        turbidity="High (Glacial Silt / Flour)",
        recommended_treatment=[
            "Pre-filter settling / coffee filter",
            "Gravity hollow-fiber membrane",
            "Chemical purification",
        ],
        notes="Seasonal snowmelt runoff cascades descending steep talus below Asgard Pass. High glacial silt rapidly clogs microfilters; pre-filter or settle before filtering.",
    ),
    "panhandle-gap": WaterSourceModel(
        source_id="panhandle-gap",
        name="Panhandle Gap Tarn",
        trail_zone="Wonderland Trail",
        region="Rainier",
        mile_marker=14.8,
        elevation_feet=6800,
        source_type="alpine_lake",
        flow_status="Stagnant",
        reliability="Seasonal",
        turbidity="Moderate (Algae / Tannins)",
        recommended_treatment=[
            "Hollow-fiber microfilter",
            "Chlorine dioxide drops",
            "Boiling",
        ],
        notes="High alpine tarn below Panhandle Gap on Mount Rainier's Wonderland Trail. Stagnant by late summer; requires microfiltration and chlorine dioxide chemical disinfection.",
    ),
    "enchanted-valley-spring": WaterSourceModel(
        source_id="enchanted-valley-spring",
        name="Pyrites Creek Spring",
        trail_zone="Enchanted Valley",
        region="Olympics",
        mile_marker=9.5,
        elevation_feet=1400,
        source_type="spring",
        flow_status="Flowing Strong",
        reliability="Year-round",
        turbidity="Clear",
        recommended_treatment=[
            "Hollow-fiber microfilter (0.1 - 0.2 micron)",
            "Boiling",
        ],
        notes="Cold moss-lined natural spring surfacing on the Olympic rainforest floor near Pyrites Creek. Pristine and consistent year-round flow.",
    ),
}

WATER_SOURCES_STORE: dict[str, WaterSourceModel] = {
    k: v.model_copy(deep=True) for k, v in DEFAULT_WATER_SOURCES.items()
}
WATER_REPORTS_STORE: dict[str, WaterReportResponse] = {}


def reset_water_store() -> None:
    """Resets the water source store and reports for clean test state."""
    global WATER_SOURCES_STORE, WATER_REPORTS_STORE
    WATER_SOURCES_STORE = {
        k: v.model_copy(deep=True) for k, v in DEFAULT_WATER_SOURCES.items()
    }
    WATER_REPORTS_STORE = {}


def get_water_sources(
    region: Optional[str] = None,
    reliability: Optional[str] = None,
) -> list[WaterSourceModel]:
    """Returns a list of water sources, optionally filtered by region and reliability."""
    results = list(WATER_SOURCES_STORE.values())
    if region:
        results = [s for s in results if s.region.lower() == region.lower()]
    if reliability:
        results = [s for s in results if s.reliability.lower() == reliability.lower()]
    return results


def get_water_source_by_id(source_id: str) -> Optional[WaterSourceModel]:
    """Retrieves a single water source by ID, or None if not found."""
    return WATER_SOURCES_STORE.get(source_id)


def calculate_hydration_estimate(req: HydrationEstimateRequest) -> HydrationEstimateResponse:
    """Calculates backcountry hydration requirement based on distance, elevation, and temperature."""
    # Estimated duration using Naismith's Rule: 2.5 mph hiking pace + 1 hr per 2000 ft ascent
    estimated_hours = round((req.distance_miles / 2.5) + (req.elevation_gain_feet / 2000.0), 1)

    # Water requirement:
    # 0.25 L per mile base + 0.3 L per 1,000 ft ascent + 0.04 L per degree over 70°F
    base_liters = req.distance_miles * 0.25
    elevation_liters = (req.elevation_gain_feet / 1000.0) * 0.3
    temp_excess = max(0, req.temp_fahrenheit - 70)
    temp_liters = temp_excess * 0.04
    total_liters_needed = round(base_liters + elevation_liters + temp_liters, 1)

    # Recommended carrying capacity:
    # Backpackers typically carry 2.5 - 3.0 L max to minimize pack weight, refilling along trail.
    if total_liters_needed <= 1.5:
        recommended_capacity = round(total_liters_needed, 1)
    elif total_liters_needed <= 2.5:
        recommended_capacity = 2.0
    else:
        recommended_capacity = 2.5

    advice = (
        f"For a {req.distance_miles:.1f} mile hike with {req.elevation_gain_feet:,} ft elevation gain "
        f"at {req.temp_fahrenheit}°F, your estimated total water requirement is {total_liters_needed:.1f} L "
        f"over ~{estimated_hours:.1f} hours. Recommended carrying capacity is 2.5 - 3.0 L "
        f"(e.g., a 2.5L reservoir or two 1L bottles plus a collapsible flask), planning on-trail refills "
        f"at backcountry water sources with a filtration device."
    )

    return HydrationEstimateResponse(
        distance_miles=req.distance_miles,
        elevation_gain_feet=req.elevation_gain_feet,
        temp_fahrenheit=req.temp_fahrenheit,
        estimated_hours=estimated_hours,
        total_liters_needed=total_liters_needed,
        recommended_carrying_capacity_liters=recommended_capacity,
        hydration_advice=advice,
    )


def submit_water_report(req: WaterReportRequest) -> WaterReportResponse:
    """Submits a field water condition report and updates telemetry in the store."""
    source = get_water_source_by_id(req.source_id)
    if not source:
        raise ValueError(f"Water source '{req.source_id}' not found")

    # Update stored water source status
    source.flow_status = req.flow_status
    source.turbidity = req.turbidity
    if req.notes:
        source.notes = f"{source.notes} [Field Report: {req.notes}]"

    report_id = f"WTR-{secrets.randbelow(90000) + 10000}"
    reported_at = datetime.now(timezone.utc).isoformat()
    instructions = (
        f"Field condition report {report_id} confirmed and verified. "
        f"Live telemetry for '{source.name}' updated: flow status is '{req.flow_status}' "
        f"and turbidity is '{req.turbidity}'."
    )

    report = WaterReportResponse(
        report_id=report_id,
        source_name=source.name,
        flow_status=req.flow_status,
        turbidity=req.turbidity,
        reported_at=reported_at,
        status="verified",
        instructions=instructions,
    )
    WATER_REPORTS_STORE[report_id] = report
    return report


def get_pathogen_protection_info() -> dict[str, Any]:
    """Returns backcountry pathogen guide, filter comparisons, and glacial silt management advice."""
    return {
        "pathogens": {
            "protozoa": {
                "examples": ["Cryptosporidium parvum", "Giardia lamblia"],
                "size_microns": "Cryptosporidium: 4-6 microns; Giardia: 8-12 microns",
                "removal_methods": [
                    "Hollow-fiber microfiltration (0.1 - 0.2 micron)",
                    "Chlorine dioxide (Aquamira) - requires 4-hour dwell time for Cryptosporidium",
                    "Rolling boil for 1 minute (3 minutes above 6,500 ft)",
                ],
                "notes": (
                    "Cryptosporidium oocysts possess a tough outer shell resistant to standard iodine and chlorine tablets. "
                    "Hollow-fiber microfilters (0.1 micron) physically capture Cryptosporidium and Giardia reliably."
                ),
            },
            "bacteria": {
                "examples": ["Escherichia coli (E. coli)", "Salmonella", "Campylobacter"],
                "size_microns": "0.2 to 2.0 microns",
                "removal_methods": [
                    "Hollow-fiber microfiltration (0.1 micron)",
                    "UV light purifiers",
                    "Chemical treatment (chlorine dioxide, iodine)",
                    "Boiling",
                ],
                "notes": "Standard 0.1-micron hollow-fiber membranes eliminate 99.9999% of backcountry bacteria.",
            },
            "viruses": {
                "examples": ["Norovirus", "Hepatitis A", "Rotavirus"],
                "size_microns": "0.02 to 0.08 microns (extremely small)",
                "removal_methods": [
                    "Chemical purification (Chlorine Dioxide drops)",
                    "UV light purifiers (SteriPEN) in clear water",
                    "Boiling (1 minute rolling boil)",
                    "Electropositive purifiers or hollow-fiber purifiers with 0.02 micron pore size",
                ],
                "notes": (
                    "Standard hollow-fiber filters (e.g. Sawyer Squeeze, Katadyn BeFree) have pore sizes of 0.1 - 0.2 microns "
                    "and DO NOT remove viruses. If viral contamination is suspected (high-traffic zones or international travel), "
                    "combine microfiltration with chemical purification (chlorine dioxide) or UV treatment."
                ),
            },
        },
        "technologies": {
            "hollow_fiber": {
                "name": "Hollow-Fiber Microfilter (e.g., Sawyer Squeeze, Katadyn BeFree, Platypus QuickDraw)",
                "pore_size_microns": 0.1,
                "removes": [
                    "Protozoan cysts (Giardia, Cryptosporidium)",
                    "Bacteria (E. coli, Salmonella)",
                    "Microplastics and suspended particulate",
                ],
                "does_not_remove": [
                    "Viruses (0.02 - 0.08 microns)",
                    "Heavy metals, pesticides, chemical contaminants",
                ],
                "pros": [
                    "Instant on-demand filtration with high flow rate",
                    "Ultralight and compact (under 3 oz)",
                    "Long lifespan and field-cleanable by backflushing",
                ],
                "cons": [
                    "Freezing damages fragile microporous fibers irreparably",
                    "Rapidly clogs in turbid or silty glacial runoff",
                ],
            },
            "gravity_filters": {
                "name": "Gravity Filtration System (e.g., Platypus GravityWorks, Katadyn Base Camp)",
                "pore_size_microns": 0.2,
                "removes": [
                    "Protozoan cysts (Giardia, Cryptosporidium)",
                    "Bacteria",
                    "Sediment and debris",
                ],
                "does_not_remove": [
                    "Viruses",
                    "Chemical pollutants",
                ],
                "pros": [
                    "Hands-free passive filtration",
                    "Ideal for groups and basecamp water processing (4L - 6L capacity)",
                ],
                "cons": [
                    "Higher weight and bulk",
                    "Requires hang point (branch or trekking pole)",
                ],
            },
            "chemical_treatment": {
                "name": "Chemical Purification (Chlorine Dioxide / Aquamira drops / tablets)",
                "pore_size_microns": None,
                "removes": [
                    "Viruses",
                    "Bacteria",
                    "Giardia (30-minute dwell time)",
                    "Cryptosporidium (4-hour dwell time required)",
                ],
                "does_not_remove": [
                    "Suspended glacial silt and particulates",
                    "Heavy metals",
                ],
                "pros": [
                    "Ultralight (bottles weigh ~1 oz)",
                    "Cannot be broken by freezing",
                    "Comprehensive viral and pathogen destruction",
                ],
                "cons": [
                    "Requires wait time before drinking (15-30 min for bacteria/giardia, 4 hours for crypto)",
                    "Does not clarify muddy or silty water",
                ],
            },
            "uv_purifiers": {
                "name": "Ultraviolet (UV) Purifiers (e.g., Katadyn SteriPEN)",
                "pore_size_microns": None,
                "removes": [
                    "Viruses",
                    "Bacteria",
                    "Protozoan cysts (Giardia, Cryptosporidium)",
                ],
                "does_not_remove": [
                    "Suspended particles or silt",
                ],
                "pros": [
                    "Fast sterilization (90 seconds per liter)",
                    "Destroys viruses without chemical aftertaste",
                ],
                "cons": [
                    "Requires clear water; ineffective in turbid or tannin-heavy water",
                    "Relies on batteries and electronics",
                ],
            },
        },
        "glacial_silt_advice": (
            "Glacial melt streams (such as Asgard Pass snowmelt cascades) contain fine rock flour "
            "and colloidal silt that instantly blinds and clogs hollow-fiber filter pores. "
            "Best practice: Collect water in a collapsible pot or dirty bag and allow sediment to settle "
            "for 30-60 minutes, or pre-filter through a tightly woven bandanna or paper coffee filter "
            "before passing water through your hollow-fiber microfilter."
        ),
    }


def detect_water_intent(query: str) -> Optional[WaterIntent]:
    """Detects backcountry water logistics, hydration calculation, filtration, or reporting intents."""
    q_lower = query.lower()

    # Keywords indicative of water domain
    water_keywords = [
        "water source",
        "water sources",
        "water filter",
        "water filtration",
        "filtration",
        "giardia",
        "cryptosporidium",
        "purification",
        "purifier",
        "hydration",
        "hydration estimate",
        "how much water",
        "water to carry",
        "carrying capacity",
        "colchuck creek water",
        "colchuck water",
        "asgard pass snowmelt",
        "water flow",
        "flow status",
        "sawyer squeeze",
        "kill viruses",
        "report water",
        "submit water",
        "snowmelt drinkable",
    ]

    if not any(kw in q_lower for kw in water_keywords):
        # Quick secondary check for specific phrases
        if not re.search(r"\b(where\s+can\s+i\s+get\s+water|water\s+on\s+the)\b", q_lower):
            return None

    # Determine action
    if any(k in q_lower for k in ["report water", "submit water", "report condition", "report flow"]):
        action = "report"
    elif any(k in q_lower for k in ["hydration", "how much water", "water to carry", "carrying capacity", "liters needed"]):
        action = "hydration"
    elif any(k in q_lower for k in ["cryptosporidium", "giardia", "pathogen", "virus", "bacteria"]):
        action = "pathogens"
    elif any(k in q_lower for k in ["filter", "filtration", "purification", "purifier", "sawyer", "glacial silt"]):
        action = "filtration"
    else:
        action = "sources"

    # Extract trail_zone / region / source_id
    trail_zone = None
    region = None
    source_id = None

    if "colchuck" in q_lower:
        trail_zone = "Colchuck Lake Trail"
        region = "Cascades"
        source_id = "colchuck-creek"
    elif "asgard" in q_lower or "aasgard" in q_lower:
        trail_zone = "Aasgard Pass"
        region = "Cascades"
        source_id = "asgard-snowmelt"
    elif "panhandle" in q_lower or "wonderland" in q_lower or "rainier" in q_lower:
        trail_zone = "Wonderland Trail"
        region = "Rainier"
        source_id = "panhandle-gap"
    elif "pyrites" in q_lower or "enchanted" in q_lower or "olympic" in q_lower:
        trail_zone = "Enchanted Valley"
        region = "Olympics"
        source_id = "enchanted-valley-spring"
    elif "cascades" in q_lower:
        region = "Cascades"

    # Extract distance
    distance_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:miles?|mi)\b", q_lower)
    distance_miles = float(distance_match.group(1)) if distance_match else None

    # Extract elevation
    elev_match = re.search(r"(\d+(?:,\d+)?)\s*(?:ft|feet|foot)\b", q_lower)
    elev_gain = int(elev_match.group(1).replace(",", "")) if elev_match else None

    # Extract temperature
    temp_match = re.search(
        r"(\d+)\s*(?:°\s*[Ff]?|degrees?(?:\s*[Ff](?:ahrenheit)?)?|deg(?:rees)?\s*[Ff]?|[Ff]\b)",
        query,
        re.IGNORECASE,
    )
    temp_f = int(temp_match.group(1)) if temp_match else None

    return WaterIntent(
        action=action,
        trail_zone=trail_zone,
        region=region,
        distance_miles=distance_miles,
        source_id=source_id,
        elevation_gain_feet=elev_gain,
        temp_fahrenheit=temp_f,
    )


def build_water_prompt(intent: WaterIntent) -> str:
    """Formats system context with water sources, flow conditions, filtration technologies, and hydration math."""
    lines = [
        "Contoso Outdoors Backcountry Water Sources & Pathogen Filtration Grounding:",
        "- All backcountry surface water in alpine and subalpine environments should be treated before consumption to prevent waterborne illness (Giardia and Cryptosporidium).",
    ]

    if intent.action == "sources":
        sources = get_water_sources(region=intent.region)
        lines.append("Active Backcountry Water Sources & Flow Conditions:")
        for s in sources:
            lines.extend([
                f"- {s.name} ({s.source_id}):",
                f"  * Trail Zone: {s.trail_zone} ({s.region}), Mile: {s.mile_marker}, Elevation: {s.elevation_feet:,} ft",
                f"  * Source Type: {s.source_type}, Flow Status: {s.flow_status}, Reliability: {s.reliability}",
                f"  * Turbidity: {s.turbidity}",
                f"  * Recommended Treatment: {', '.join(s.recommended_treatment)}",
                f"  * Notes: {s.notes}",
            ])

    elif intent.action == "hydration":
        dist = intent.distance_miles or 10.0
        gain = intent.elevation_gain_feet or 3000
        temp = intent.temp_fahrenheit or 70
        est = calculate_hydration_estimate(
            HydrationEstimateRequest(
                distance_miles=dist,
                elevation_gain_feet=gain,
                temp_fahrenheit=temp,
            )
        )
        lines.extend([
            "Hydration Carrying Capacity & Demand Calculation:",
            f"- Distance: {est.distance_miles} miles, Elevation Gain: {est.elevation_gain_feet:,} ft, Temp: {est.temp_fahrenheit}°F",
            f"- Estimated Moving Time: {est.estimated_hours} hours",
            f"- Total Water Requirement: {est.total_liters_needed} L",
            f"- Recommended On-Body Carrying Capacity: {est.recommended_carrying_capacity_liters} L (refilling at backcountry water sources)",
            f"- Hydration Advice: {est.hydration_advice}",
        ])

    elif intent.action in ("filtration", "pathogens"):
        info = get_pathogen_protection_info()
        lines.extend([
            "Backcountry Pathogen Protection & Filtration Technology Guide:",
            "- Microfiltration (0.1 micron, e.g. Sawyer Squeeze, Katadyn BeFree):",
            "  * Removes: Bacteria (E. coli, Salmonella) and Protozoa (Cryptosporidium, Giardia).",
            "  * DOES NOT REMOVE: Viruses (0.02 - 0.08 microns). Hollow-fiber pore size is too large to trap viruses.",
            "- Chemical Purification (Chlorine Dioxide / Aquamira):",
            "  * Destroys viruses and bacteria within 15-30 minutes.",
            "  * Destroys Cryptosporidium cysts, but requires a full 4-hour dwell time.",
            "- Gravity Filtration Systems (e.g. Platypus GravityWorks):",
            "  * Ideal for large volume (4-6L) hands-free camp filtering.",
            "- Glacial Silt / Turbidity Management:",
            f"  * {info['glacial_silt_advice']}",
        ])

    elif intent.action == "report":
        lines.extend([
            "Field Water Condition Reporting:",
            "- Hikers can submit field reports with flow_status and turbidity.",
            "- Reports generate a verified WTR-XXXXX tracking ID and update real-time telemetry.",
        ])

    lines.extend([
        "",
        "Instructions for Assistant:",
        "- Prioritize hiker health, safety, and hydration preparedness.",
        "- Always explain the difference between microfilters (which remove Giardia and Cryptosporidium) and chemical/UV purifiers (which neutralize viruses).",
        "- For glacial runoff, explicitly advise settling or pre-filtering to prevent clogging hollow-fiber filters.",
        "- Quote exact mile markers, flow status, and carrying capacity recommendations.",
    ])

    return "\n".join(lines)


def format_water_response(intent: WaterIntent) -> dict[str, Any]:
    """Formats assistant reply text and structured water_info metadata."""
    if intent.action == "sources":
        sources = get_water_sources(region=intent.region)
        if intent.source_id:
            specific = get_water_source_by_id(intent.source_id)
            if specific:
                sources = [specific]

        sources_details = "; ".join(
            f"{s.name} at mile {s.mile_marker} ({s.elevation_feet:,} ft) is {s.flow_status} ({s.reliability}, turbidity: {s.turbidity})"
            for s in sources
        )
        zone_str = f" on the {intent.trail_zone}" if intent.trail_zone else ""
        answer = (
            f"Backcountry water sources{zone_str}: {sources_details}. "
            "Always filter or purify surface water before consumption using a hollow-fiber microfilter or chemical purifier."
        )
        return {
            "answer": answer,
            "water_info": {
                "action": "sources",
                "trail_zone": intent.trail_zone,
                "region": intent.region,
                "sources": [s.model_dump() for s in sources],
            },
        }

    if intent.action == "hydration":
        dist = intent.distance_miles or 10.0
        gain = intent.elevation_gain_feet or 3000
        temp = intent.temp_fahrenheit or 70
        estimate = calculate_hydration_estimate(
            HydrationEstimateRequest(
                distance_miles=dist,
                elevation_gain_feet=gain,
                temp_fahrenheit=temp,
            )
        )
        answer = (
            f"Hydration estimate for {estimate.distance_miles:.1f} miles with {estimate.elevation_gain_feet:,} ft elevation gain "
            f"at {estimate.temp_fahrenheit}°F: Estimated duration is {estimate.estimated_hours} hours with total water needed "
            f"of {estimate.total_liters_needed} L. Recommended carrying capacity is 2.5 - 3.0 L in hydration reservoirs "
            f"or bottles, with planned refills using a backcountry filter at trail water sources."
        )
        return {
            "answer": answer,
            "water_info": {
                "action": "hydration",
                "estimate": estimate.model_dump(),
            },
        }

    if intent.action in ("filtration", "pathogens"):
        guide = get_pathogen_protection_info()
        answer = (
            "Backcountry Water Filtration & Pathogen Protection Guide: "
            "Hollow-fiber microfilters (such as the Sawyer Squeeze or Katadyn BeFree with 0.1-micron pores) "
            "effectively remove protozoan parasites (Cryptosporidium and Giardia) and bacteria (E. coli, Salmonella). "
            "However, hollow-fiber microfilters DO NOT remove viruses due to their minute size (0.02-0.08 microns). "
            "For viral disinfection, use chemical treatment (chlorine dioxide / Aquamira) or UV purifiers. "
            "Gravity filters provide efficient hands-free basecamp processing for groups. "
            "When sourcing from glacial silt or snowmelt (like Asgard Pass melt), settle water or pre-filter "
            "through a bandana or coffee filter to prevent premature membrane clogging."
        )
        return {
            "answer": answer,
            "water_info": {
                "action": intent.action,
                "pathogen_guide": guide,
            },
        }

    # Default report intent or general info
    answer = (
        "Contoso Outdoors Backcountry Water Telemetry: "
        "Hikers can check seasonal flow status, calculate hydration requirements, explore pathogen filtration guides, "
        "or submit field condition reports with verified WTR-XXXXX tracking IDs."
    )
    return {
        "answer": answer,
        "water_info": {
            "action": "report",
            "instructions": "Submit field reports via POST /api/water/reports with source_id, flow_status, and turbidity.",
        },
    }
