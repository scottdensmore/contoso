"""Subglacial Jökulhlaup Ice-Dammed Lake Outburst & Proglacial Canyon Escape Guide.

Covers high-consequence subglacial & ice-dammed lake outburst flood (GLOF / jökulhlaup) corridors:
- Grímsvötn & Skeiðarárjökull Subglacial Caldera Outburst Corridor (Vatnajökull, Iceland)
- Suicide Basin (Klesteroa) & Mendenhall Glacier Ice-Dammed Margin (Juneau, Alaska, USA)
- Lago Cachet II & Glaciar Colonia Proglacial Canyon (Northern Patagonian Icefield, Chile)
- Kyagar Tso & Upper Shaksgam Glacier Ice-Dammed Gorge (Karakoram Range, Pakistan / China)

Deterministic calculator evaluates:
- Estimated peak subglacial outburst discharge (m³/s)
- Flood front arrival time at canyon floor position (minutes)
- Required vertical ascent rate to reach safe bedrock terrace (m/min)
- Calved ice-block & hyperconcentrated boulder-slurry ballistic impact risk (%)
"""

from __future__ import annotations

import re
from collections.abc import Iterator
from typing import Any


class JokulhlaupEscapeSite(dict[str, Any]):
    """Dictionary subclass supporting attribute access for jökulhlaup escape sites."""

    def __getattr__(self, name: str) -> Any:
        try:
            return self[name]
        except KeyError as exc:
            raise AttributeError(
                f"'JokulhlaupEscapeSite' object has no attribute '{name}'"
            ) from exc


JOKULHLAUP_ESCAPE_SITES: list[JokulhlaupEscapeSite] = [
    JokulhlaupEscapeSite(
        {
            "id": "grimsvotn-skeidararsandur-vatnajokull-iceland",
            "name": "Grímsvötn & Skeiðarárjökull Subglacial Caldera Outburst Corridor",
            "country": "Iceland",
            "region": "Vatnajökull National Park / Skeiðarársandur Outwash Margin",
            "elevation_range": "85 m - 1,725 m",
            "max_elevation_m": 1725,
            "trigger_mechanism": "subglacial-geothermal-caldera",
            "morphology": "subglacial-geothermal-caldera",
            "difficulty": "extreme",
            "default_ice_dam_drawdown_cm_per_hr": 115.0,
            "default_proglacial_conductivity_us_cm": 680.0,
            "default_subglacial_tremor_amplitude_um": 19.5,
            "default_canyon_floor_distance_from_portal_km": 3.8,
            "default_vertical_gain_to_safe_terrace_m": 75.0,
            "primary_hazard": (
                "Subglacial geothermal melt accumulation beneath the Grímsvötn ice shelf lifting "
                "the 250 m ice dam, unleashing 3,000-45,000 m³/s hyperconcentrated flood waves "
                "charged with H2S/SO2 gas plumes and house-sized ballistic icebergs at the Skeiðarárjökull portal."
            ),
            "evacuation_strategy": (
                "Upon detecting sulfur odor (H2S), proglacial conductivity spikes > 450 µS/cm, or "
                "1-5 Hz subglacial harmonic tremor, immediately abandon the Skeiðarárjökull terminus "
                "and ascend perpendicular to the thalweg onto consolidated basaltic palagonite ridges "
                "at least 60 m above the sandur braid plain."
            ),
            "traversal_strategy": (
                "Upon detecting sulfur odor (H2S), proglacial conductivity spikes > 450 µS/cm, or "
                "1-5 Hz subglacial harmonic tremor, immediately abandon the Skeiðarárjökull terminus "
                "and ascend perpendicular to the thalweg onto consolidated basaltic palagonite ridges "
                "at least 60 m above the sandur braid plain."
            ),
            "navigation_protocol": (
                "Pre-plot GPS escape bearings to Skaftafellheiði and Lomagnúpur bedrock spurs before "
                "descending onto the proglacial apron; never pitch camp inside the 50 km Skeiðarárjökull "
                "portal fracture fan during elevated Grímsvötn caldera ice-shelf uplift."
            ),
            "early_warning_protocol": (
                "Monitor IMO real-time GPS ice-cauldron subsidence, continuous 1-5 Hz subglacial "
                "Röthlisberger R-channel tremor, and proglacial electrical conductivity probes every 15 minutes."
            ),
            "progression_protocol": (
                "Monitor IMO real-time GPS ice-cauldron subsidence, continuous 1-5 Hz subglacial "
                "Röthlisberger R-channel tremor, and proglacial electrical conductivity probes every 15 minutes."
            ),
            "field_notes": (
                "Geothermal subglacial lakes can breach hydrostatically before reaching full flotation "
                "when subglacial water pressure fractures basal ice shelves along the Skeiðarárjökull snout."
            ),
        }
    ),
    JokulhlaupEscapeSite(
        {
            "id": "suicide-basin-mendenhall-juneau-alaska",
            "name": "Suicide Basin (Klesteroa) & Mendenhall Glacier Ice-Dammed Margin",
            "country": "USA",
            "region": "Tongass National Forest / Juneau Icefield, Southeast Alaska",
            "elevation_range": "20 m - 445 m",
            "max_elevation_m": 445,
            "trigger_mechanism": "marginal-ice-dam-flotation",
            "morphology": "marginal-ice-dam-flotation",
            "difficulty": "challenging",
            "default_ice_dam_drawdown_cm_per_hr": 52.0,
            "default_proglacial_conductivity_us_cm": 240.0,
            "default_subglacial_tremor_amplitude_um": 7.2,
            "default_canyon_floor_distance_from_portal_km": 4.2,
            "default_vertical_gain_to_safe_terrace_m": 45.0,
            "primary_hazard": (
                "Hydrostatic flotation of the Mendenhall Glacier main trunk dam at the Suicide Basin "
                "(Klesteroa) ice-marginal embayment, driving rapid englacial conduit expansion, "
                "marginal serac collapse, and severe bank undercutting along Mendenhall Lake and River."
            ),
            "evacuation_strategy": (
                "Vacate the Suicide Basin ice-dam margin and lower Mendenhall glacier-cave portals "
                "immediately when laser rangefinder/pressure-transducer drawdown exceeds 15 cm/hr; "
                "climb onto high granitic bedrock benches above the Little Ice Age trimline."
            ),
            "traversal_strategy": (
                "Vacate the Suicide Basin ice-dam margin and lower Mendenhall glacier-cave portals "
                "immediately when laser rangefinder/pressure-transducer drawdown exceeds 15 cm/hr; "
                "climb onto high granitic bedrock benches above the Little Ice Age trimline."
            ),
            "navigation_protocol": (
                "Stay upslope of fractured marginal ice-dam shear zones and saturated glaciolacustrine "
                "bluff terraces prone to rotational slumping during rapid lake stage recession."
            ),
            "early_warning_protocol": (
                "Track USGS/NWS Suicide Basin stage-gauge drawdown rates, audible basal ice-quake "
                "cracking along the western lateral moraine, and sudden upwelling of stranded icebergs."
            ),
            "progression_protocol": (
                "Track USGS/NWS Suicide Basin stage-gauge drawdown rates, audible basal ice-quake "
                "cracking along the western lateral moraine, and sudden upwelling of stranded icebergs."
            ),
            "field_notes": (
                "Once subglacial drainage initiates through the Mendenhall ice dam, frictional viscous "
                "heating enlarges the Röthlisberger tunnel exponentially over 24-48 hours until roof collapse."
            ),
        }
    ),
    JokulhlaupEscapeSite(
        {
            "id": "cachet-dos-colonia-patagonia-chile",
            "name": "Lago Cachet II & Glaciar Colonia Proglacial Canyon",
            "country": "Chile",
            "region": "Aysén Region / Northern Patagonian Icefield & Río Baker Valley",
            "elevation_range": "140 m - 520 m",
            "max_elevation_m": 520,
            "trigger_mechanism": "supraglacial-englacial-conduit",
            "morphology": "supraglacial-englacial-conduit",
            "difficulty": "extreme",
            "default_ice_dam_drawdown_cm_per_hr": 135.0,
            "default_proglacial_conductivity_us_cm": 590.0,
            "default_subglacial_tremor_amplitude_um": 22.0,
            "default_canyon_floor_distance_from_portal_km": 3.2,
            "default_vertical_gain_to_safe_terrace_m": 85.0,
            "primary_hazard": (
                "Catastrophic emptying of 200 million m³ of water from Lago Cachet II through an "
                "8 km englacial/subglacial tunnel beneath Glaciar Colonia into Lago Colonia and the "
                "confined Río Colonia / Río Baker canyon at > 3,500 m³/s."
            ),
            "evacuation_strategy": (
                "Abandon the Río Colonia floor and low Nothofagus alluvial terraces immediately upon "
                "receiving DGA satellite stage-drop telemetry or observing milky turbid bore waves; "
                "scramble up fixed-line granite valley walls to terraces >= 80 m above river grade."
            ),
            "traversal_strategy": (
                "Abandon the Río Colonia floor and low Nothofagus alluvial terraces immediately upon "
                "receiving DGA satellite stage-drop telemetry or observing milky turbid bore waves; "
                "scramble up fixed-line granite valley walls to terraces >= 80 m above river grade."
            ),
            "navigation_protocol": (
                "Identify high-angle granite ribs and pre-cached emergency bivouac ledges every 2 km "
                "along the Glaciar Colonia proglacial canyon before committing to valley-floor travel."
            ),
            "early_warning_protocol": (
                "Poll DGA Chile Lago Cachet II pressure-transducer satellite alerts via Iridium/inReach "
                "every 30 minutes and monitor barometric infrasound from collapsing ice-dam vaults."
            ),
            "progression_protocol": (
                "Poll DGA Chile Lago Cachet II pressure-transducer satellite alerts via Iridium/inReach "
                "every 30 minutes and monitor barometric infrasound from collapsing ice-dam vaults."
            ),
            "field_notes": (
                "Lago Cachet II can drain completely in under 36 hours, reversing tributary flow at "
                "the Río Baker confluence and stranding teams on low gravel bars for days."
            ),
        }
    ),
    JokulhlaupEscapeSite(
        {
            "id": "kyagar-shaksgam-karakoram-pakistan-china",
            "name": "Kyagar Tso & Upper Shaksgam Glacier Ice-Dammed Gorge",
            "country": "Pakistan / China",
            "region": "Karakoram Range / Trans-Karakoram Shaksgam Valley & Yarkand Headwaters",
            "elevation_range": "4,650 m - 4,920 m",
            "max_elevation_m": 4920,
            "trigger_mechanism": "moraine-ice-core-piping",
            "morphology": "moraine-ice-core-piping",
            "difficulty": "extreme",
            "default_ice_dam_drawdown_cm_per_hr": 145.0,
            "default_proglacial_conductivity_us_cm": 740.0,
            "default_subglacial_tremor_amplitude_um": 24.5,
            "default_canyon_floor_distance_from_portal_km": 2.9,
            "default_vertical_gain_to_safe_terrace_m": 95.0,
            "primary_hazard": (
                "Surge-type Kyagar Glacier ice-dam and ice-cored moraine piping breaches in the narrow "
                "4,700 m Upper Shaksgam gorge, generating high-velocity hyperconcentrated boulder-ice "
                "debris flows with < 15 minutes warning near the glacier terminus."
            ),
            "evacuation_strategy": (
                "Ascend immediately out of the confined Shaksgam River slot onto stable paleo-moraine "
                "benches or fractured dolomitic valley shoulders >= 90 m above the active thalweg; "
                "never attempt down-canyon outrunning of a Karakoram jökulhlaup front."
            ),
            "traversal_strategy": (
                "Ascend immediately out of the confined Shaksgam River slot onto stable paleo-moraine "
                "benches or fractured dolomitic valley shoulders >= 90 m above the active thalweg; "
                "never attempt down-canyon outrunning of a Karakoram jökulhlaup front."
            ),
            "navigation_protocol": (
                "Travel along high lateral moraine crests above the Kyagar Glacier snout whenever "
                "impounded lake levels approach the ice-dam crest or piping seepage appears at the toe."
            ),
            "early_warning_protocol": (
                "Inspect the Kyagar ice dam daily for dirty subglacial artesian upwellings, rising "
                "proglacial electrical conductivity, and high-frequency acoustic boulder-bedload roar."
            ),
            "progression_protocol": (
                "Inspect the Kyagar ice dam daily for dirty subglacial artesian upwellings, rising "
                "proglacial electrical conductivity, and high-frequency acoustic boulder-bedload roar."
            ),
            "field_notes": (
                "Karakoram surge-glacier dams repeatedly reform and breach across the Shaksgam gorge, "
                "combining high-altitude hypoxia (~4,800 m) with steep vertical escape climbs."
            ),
        }
    ),
]

JOKULHLAUP_SITES: list[JokulhlaupEscapeSite] = JOKULHLAUP_ESCAPE_SITES

JOKULHLAUP_ESCAPE_GEAR_CHECKLIST: list[dict[str, str]] = [
    {
        "item": "Handheld Proglacial Electrical Conductivity & Temperature Meter (0-2,000 µS/cm)",
        "category": "Hydro-Chemical Early Warning",
        "priority": "essential",
        "rationale": (
            "Detects sudden spikes in dissolved geothermal solutes and basal subglacial porewater "
            "flushing hours before the main Röthlisberger R-channel outburst wave breaches the portal."
        ),
    },
    {
        "item": "Portable 3-Axis Geophone / Subglacial Harmonic Tremor Logger (1-15 Hz)",
        "category": "Seismic & Acoustic Monitoring",
        "priority": "essential",
        "rationale": (
            "Captures subglacial hydraulic fracturing, ice-dam flotation micro-seismicity, and "
            "boulder-bedload saltation tremor before visual flood arrival."
        ),
    },
    {
        "item": "Dual-Mode Satellite SOS & Automated GLOF Telemetry Receiver (Iridium / inReach)",
        "category": "Remote Telemetry & Evacuation Alerting",
        "priority": "essential",
        "rationale": (
            "Receives automated ice-dam drawdown alerts from upstream pressure transducers (IMO, "
            "USGS, DGA) in zero-cellular proglacial gorges."
        ),
    },
    {
        "item": "Multi-Gas Personal Monitor (H2S / SO2 / CO2) & Escape Half-Mask Respirator",
        "category": "Subglacial Volcanic Gas Defense",
        "priority": "essential",
        "rationale": (
            "Subglacial geothermal jökulhlaups (e.g., Grímsvötn / Vatnajökull) release toxic "
            "hydrogen sulfide and sulfur dioxide gas pockets trapped beneath the ice roof at the portal."
        ),
    },
    {
        "item": "Lightweight Crag Ascent Kit (30 m 8 mm Rad Line, Micro-Traxion, Harness & Steel Crampons)",
        "category": "Rapid Canyon-Wall Vertical Escape",
        "priority": "essential",
        "rationale": (
            "Enables rapid 40-120 m vertical scrambling up slick glaciated canyon walls, lateral "
            "moraine scarps, or ice-contact trimlines to reach safe bedrock terraces."
        ),
    },
    {
        "item": "Laser Rangefinder & Barometric Altimeter Watch with High-Stage Terrace Alarms",
        "category": "Terrace Clearance & Drawdown Ranging",
        "priority": "essential",
        "rationale": (
            "Measures real-time ice-dam crest subsidence from a safe standoff and verifies vertical "
            "clearance above the projected 50-100 m jökulhlaup flood stage."
        ),
    },
]


def get_all_sites() -> list[dict[str, Any]]:
    """Return all 4 subglacial jökulhlaup & ice-dammed lake outburst sites."""
    return list(JOKULHLAUP_ESCAPE_SITES)


def get_all_jokulhlaup_escape_sites() -> list[dict[str, Any]]:
    """Alias for get_all_sites()."""
    return get_all_sites()


def get_gear_checklist() -> list[dict[str, Any]]:
    """Return the 6 essential gear checklist items for jökulhlaup & proglacial canyon escape."""
    return [dict(item) for item in JOKULHLAUP_ESCAPE_GEAR_CHECKLIST]


def get_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Lookup a jökulhlaup escape site by exact ID or fuzzy substring match."""
    if not site_id or not site_id.strip():
        return None
    norm = site_id.strip().lower()
    for site in JOKULHLAUP_ESCAPE_SITES:
        if str(site["id"]).lower() == norm:
            return site

    alias_map = {
        "grimsvotn": "grimsvotn-skeidararsandur-vatnajokull-iceland",
        "grímsvötn": "grimsvotn-skeidararsandur-vatnajokull-iceland",
        "skeidararjokull": "grimsvotn-skeidararsandur-vatnajokull-iceland",
        "skeiðarárjökull": "grimsvotn-skeidararsandur-vatnajokull-iceland",
        "vatnajokull": "grimsvotn-skeidararsandur-vatnajokull-iceland",
        "vatnajökull": "grimsvotn-skeidararsandur-vatnajokull-iceland",
        "suicide basin": "suicide-basin-mendenhall-juneau-alaska",
        "suicide-basin": "suicide-basin-mendenhall-juneau-alaska",
        "klesteroa": "suicide-basin-mendenhall-juneau-alaska",
        "mendenhall": "suicide-basin-mendenhall-juneau-alaska",
        "juneau": "suicide-basin-mendenhall-juneau-alaska",
        "cachet": "cachet-dos-colonia-patagonia-chile",
        "lago cachet": "cachet-dos-colonia-patagonia-chile",
        "colonia": "cachet-dos-colonia-patagonia-chile",
        "glaciar colonia": "cachet-dos-colonia-patagonia-chile",
        "kyagar": "kyagar-shaksgam-karakoram-pakistan-china",
        "kyagar tso": "kyagar-shaksgam-karakoram-pakistan-china",
        "shaksgam": "kyagar-shaksgam-karakoram-pakistan-china",
        "karakoram": "kyagar-shaksgam-karakoram-pakistan-china",
    }
    for alias, target_id in alias_map.items():
        if alias in norm:
            for site in JOKULHLAUP_ESCAPE_SITES:
                if site["id"] == target_id:
                    return site

    for site in JOKULHLAUP_ESCAPE_SITES:
        if norm in str(site["id"]).lower() or norm in str(site["name"]).lower():
            return site
    return None


def get_jokulhlaup_escape_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Alias for get_site_by_id()."""
    return get_site_by_id(site_id)


def filter_sites(
    country: str | None = None,
    trigger_mechanism: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
    morphology: str | None = None,
) -> list[dict[str, Any]]:
    """Filter jökulhlaup escape sites by country, trigger_mechanism, difficulty, and free-text search."""
    results: list[dict[str, Any]] = list(JOKULHLAUP_ESCAPE_SITES)
    if country and country.strip():
        c_norm = country.strip().lower()
        results = [
            s
            for s in results
            if c_norm == str(s["country"]).lower() or c_norm in str(s["country"]).lower()
        ]
    effective_trigger = (
        trigger_mechanism if trigger_mechanism and trigger_mechanism.strip() else morphology
    )
    if effective_trigger and effective_trigger.strip():
        t_norm = effective_trigger.strip().lower()
        results = [s for s in results if t_norm in str(s["trigger_mechanism"]).lower()]
    if difficulty and difficulty.strip():
        d_norm = difficulty.strip().lower()
        results = [s for s in results if str(s["difficulty"]).lower() == d_norm]
    if search and search.strip():
        q_norm = search.strip().lower()
        results = [
            s
            for s in results
            if q_norm in str(s["id"]).lower()
            or q_norm in str(s["name"]).lower()
            or q_norm in str(s["country"]).lower()
            or q_norm in str(s["region"]).lower()
            or q_norm in str(s["trigger_mechanism"]).lower()
            or q_norm in str(s["primary_hazard"]).lower()
            or q_norm in str(s["evacuation_strategy"]).lower()
            or q_norm in str(s["field_notes"]).lower()
        ]
    return results


def calculate_jokulhlaup_escape(
    ice_dam_drawdown_cm_per_hr: float = 45.0,
    proglacial_conductivity_us_cm: float = 280.0,
    subglacial_tremor_amplitude_um: float = 6.5,
    canyon_floor_distance_from_portal_km: float = 4.5,
    vertical_gain_to_safe_terrace_m: float = 55.0,
) -> dict[str, Any]:
    """Calculate subglacial outburst peak discharge, flood arrival time, ascent rate, and ballistic ice risk.

    Raises ValueError if any input is outside validated physical bounds:
    - ice_dam_drawdown_cm_per_hr: 0.0 to 250.0 cm/hr
    - proglacial_conductivity_us_cm: 20.0 to 1200.0 µS/cm
    - subglacial_tremor_amplitude_um: 0.1 to 50.0 µm
    - canyon_floor_distance_from_portal_km: 0.2 to 40.0 km
    - vertical_gain_to_safe_terrace_m: 5.0 to 220.0 m
    """
    if not (0.0 <= ice_dam_drawdown_cm_per_hr <= 250.0):
        raise ValueError(
            f"ice_dam_drawdown_cm_per_hr must be between 0 and 250 cm/hr (got {ice_dam_drawdown_cm_per_hr})"
        )
    if not (20.0 <= proglacial_conductivity_us_cm <= 1200.0):
        raise ValueError(
            f"proglacial_conductivity_us_cm must be between 20 and 1200 uS/cm (got {proglacial_conductivity_us_cm})"
        )
    if not (0.1 <= subglacial_tremor_amplitude_um <= 50.0):
        raise ValueError(
            f"subglacial_tremor_amplitude_um must be between 0.1 and 50.0 um (got {subglacial_tremor_amplitude_um})"
        )
    if not (0.2 <= canyon_floor_distance_from_portal_km <= 40.0):
        raise ValueError(
            "canyon_floor_distance_from_portal_km must be between 0.2 and 40.0 km "
            f"(got {canyon_floor_distance_from_portal_km})"
        )
    if not (5.0 <= vertical_gain_to_safe_terrace_m <= 220.0):
        raise ValueError(
            "vertical_gain_to_safe_terrace_m must be between 5 and 220 m "
            f"(got {vertical_gain_to_safe_terrace_m})"
        )

    # 1. Estimated peak subglacial outburst discharge (m³/s)
    # Combines hydrostatic drawdown rate, subglacial geothermal/solute conductivity spike, and R-channel harmonic tremor
    raw_discharge = (
        45.0
        + (ice_dam_drawdown_cm_per_hr * 26.0)
        + ((proglacial_conductivity_us_cm - 20.0) * 2.1)
        + (subglacial_tremor_amplitude_um * 155.0)
        + (ice_dam_drawdown_cm_per_hr * subglacial_tremor_amplitude_um * 1.9)
    )
    estimated_peak_discharge_m3s = round(
        min(45000.0, max(35.0, raw_discharge)),
        1,
    )

    # 2. Flood front arrival time at canyon floor position (minutes)
    # Outburst bore celerity scales with peak discharge, drawdown pressure head, and tremor-indicated conduit opening
    wave_celerity_ms = min(
        14.5,
        max(
            1.25,
            1.35
            + (estimated_peak_discharge_m3s / 1900.0)
            + (subglacial_tremor_amplitude_um * 0.11)
            + (ice_dam_drawdown_cm_per_hr * 0.018),
        ),
    )
    raw_arrival_min = (canyon_floor_distance_from_portal_km * 1000.0) / (wave_celerity_ms * 60.0)
    flood_front_arrival_minutes = round(
        min(600.0, max(1.2, raw_arrival_min)),
        1,
    )

    # 3. Required vertical ascent rate to reach safe bedrock terrace before flood wave impact (m/min)
    # Uses a 75% safety margin on arrival time to account for air-blast and precursor surge waves
    safe_escape_window_min = max(0.8, flood_front_arrival_minutes * 0.75)
    required_ascent_rate_m_per_min = round(
        min(150.0, max(0.12, vertical_gain_to_safe_terrace_m / safe_escape_window_min)),
        2,
    )

    # 4. Ice-block & hyperconcentrated boulder-slurry ballistic impact risk (%)
    portal_proximity_component = 95.0 / (canyon_floor_distance_from_portal_km + 1.1)
    hydraulic_drive_component = (
        (ice_dam_drawdown_cm_per_hr / 250.0) * 38.0
        + (subglacial_tremor_amplitude_um / 50.0) * 35.0
        + ((proglacial_conductivity_us_cm - 20.0) / 1180.0) * 16.0
    )
    ice_block_ballistic_impact_risk_pct = round(
        min(
            99.0,
            max(
                1.0,
                2.0 + (portal_proximity_component * 0.48) + hydraulic_drive_component,
            ),
        ),
        1,
    )

    warnings: list[str] = []
    recommendations: list[str] = []

    if ice_dam_drawdown_cm_per_hr >= 80.0 or estimated_peak_discharge_m3s >= 4500.0:
        warnings.append(
            f"EXPONENTIAL R-CHANNEL BREACH: {ice_dam_drawdown_cm_per_hr:.1f} cm/hr ice-dam drawdown "
            f"projects a {estimated_peak_discharge_m3s:.1f} m³/s subglacial jökulhlaup surge."
        )
        recommendations.append(
            "Abandon the proglacial canyon floor immediately; ascend perpendicular to the channel "
            "toward bedrock trimline terraces above the projected flood crest."
        )
    elif ice_dam_drawdown_cm_per_hr >= 30.0 or estimated_peak_discharge_m3s >= 1500.0:
        warnings.append(
            f"ACTIVE ICE-DAM SUBSIDENCE: {ice_dam_drawdown_cm_per_hr:.1f} cm/hr drawdown indicates "
            "accelerating englacial/subglacial conduit enlargement."
        )
        recommendations.append(
            "Stage all team members along upper lateral moraine or bedrock ribs and halt all "
            "canyon-floor or glacier-snout progression."
        )

    if flood_front_arrival_minutes <= 20.0 or required_ascent_rate_m_per_min >= 5.0:
        warnings.append(
            f"IMMINENT FLOOD BORE IMPACT: Estimated flood front arrival in {flood_front_arrival_minutes:.1f} min "
            f"requires an emergency vertical ascent rate of {required_ascent_rate_m_per_min:.2f} m/min "
            f"to gain the {vertical_gain_to_safe_terrace_m:.0f} m terrace."
        )
        recommendations.append(
            "Jettison non-essential heavy haulage loads and scramble directly up the nearest "
            "consolidated bedrock spur using crampons and fixed handlines."
        )

    if proglacial_conductivity_us_cm >= 450.0 or subglacial_tremor_amplitude_um >= 12.0:
        warnings.append(
            f"GEOTHERMAL SOLUTE & HARMONIC TREMOR SPIKE: Conductivity {proglacial_conductivity_us_cm:.0f} µS/cm "
            f"and tremor amplitude {subglacial_tremor_amplitude_um:.1f} µm signal pressurized subglacial "
            "vault rupture and potential H2S/SO2 outgassing."
        )
        recommendations.append(
            "Activate personal H2S/SO2 gas monitors, don escape half-mask respirators if sulfur "
            "odor is present, and avoid low-lying aerodynamic depressions near the glacier portal."
        )

    if canyon_floor_distance_from_portal_km <= 3.5 or ice_block_ballistic_impact_risk_pct >= 55.0:
        warnings.append(
            f"PORTAL ICE-BLOCK BALLISTIC HAZARD: {canyon_floor_distance_from_portal_km:.1f} km portal "
            f"standoff carries a {ice_block_ballistic_impact_risk_pct:.1f}% risk of calved iceberg "
            "projectiles and hyperconcentrated boulder-slurry avulsion."
        )
        recommendations.append(
            "Maintain at least 5 km radial clearance from the subglacial meltwater portal arch and "
            "never shelter behind unconsolidated ice-cored moraine embankments."
        )

    if len(recommendations) < 2:
        recommendations.extend(
            [
                "Poll upstream ice-dam pressure transducers via satellite messenger every 30 minutes and log proglacial conductivity trends.",
                "Pre-identify bedrock escape ribs rising above the Little Ice Age trimline every 1.5 km along the proglacial corridor.",
            ]
        )

    # Determine overall risk_level & evacuation_strategy
    if (
        estimated_peak_discharge_m3s >= 5000.0
        or flood_front_arrival_minutes <= 15.0
        or required_ascent_rate_m_per_min >= 6.0
        or ice_block_ballistic_impact_risk_pct >= 68.0
    ):
        risk_level = "critical"
        evacuation_strategy = (
            "IMMEDIATE VERTICAL WALL EVACUATION: Abandon all canyon-floor equipment caches, don "
            "escape respirators against portal H2S/SO2 plumes, and ascend directly to bedrock "
            f"terraces >= {vertical_gain_to_safe_terrace_m:.0f} m above the thalweg within "
            f"{flood_front_arrival_minutes:.1f} minutes."
        )
    elif (
        estimated_peak_discharge_m3s >= 2000.0
        or flood_front_arrival_minutes <= 35.0
        or required_ascent_rate_m_per_min >= 2.5
        or ice_block_ballistic_impact_risk_pct >= 42.0
    ):
        risk_level = "high"
        evacuation_strategy = (
            "RAPID TERRACE EGRESS PROTOCOL: Exit the proglacial gorge floor immediately along "
            "pre-scouted bedrock spurs, maintain continuous 3-axis tremor and conductivity watch, "
            "and establish high bivouac above the trimline."
        )
    elif (
        estimated_peak_discharge_m3s >= 600.0
        or flood_front_arrival_minutes <= 75.0
        or required_ascent_rate_m_per_min >= 1.0
        or ice_block_ballistic_impact_risk_pct >= 20.0
    ):
        risk_level = "moderate"
        evacuation_strategy = (
            "ELEVATED MARGIN TRANSIT: Restrict travel to upper lateral terraces and consolidated "
            "moraine crests, verify escape routes every 1.5 km, and sample proglacial conductivity "
            "every 30 minutes."
        )
    else:
        risk_level = "low"
        evacuation_strategy = (
            "BASELINE EARLY-WARNING MONITORING: Subglacial drainage conduit remains stable; maintain "
            "routine satellite stage telemetry checks, log baseline conductivity, and camp only on "
            "elevated bedrock benches."
        )

    return {
        "ice_dam_drawdown_cm_per_hr": round(float(ice_dam_drawdown_cm_per_hr), 1),
        "proglacial_conductivity_us_cm": round(float(proglacial_conductivity_us_cm), 1),
        "subglacial_tremor_amplitude_um": round(float(subglacial_tremor_amplitude_um), 2),
        "canyon_floor_distance_from_portal_km": round(
            float(canyon_floor_distance_from_portal_km), 2
        ),
        "vertical_gain_to_safe_terrace_m": round(float(vertical_gain_to_safe_terrace_m), 1),
        "estimated_peak_discharge_m3s": estimated_peak_discharge_m3s,
        "flood_front_arrival_minutes": flood_front_arrival_minutes,
        "required_ascent_rate_m_per_min": required_ascent_rate_m_per_min,
        "ice_block_ballistic_impact_risk_pct": ice_block_ballistic_impact_risk_pct,
        "risk_level": risk_level,
        "safety_status": risk_level,
        "evacuation_strategy": evacuation_strategy,
        "traversal_strategy": evacuation_strategy,
        "warnings": warnings,
        "recommendations": recommendations,
    }


_EXPLICIT_JOKULHLAUP_ESCAPE_TERMS: tuple[str, ...] = (
    "jokulhlaup escape",
    "jökulhlaup escape",
    "jokulhlaup-escape",
    "jokulhlaup_escape",
    "ice-dammed lake",
    "ice dammed lake",
    "ice-dammed gorge",
    "ice dammed gorge",
    "ice-dammed margin",
    "ice dammed margin",
    "glacial lake outburst",
    "glof",
    "grimsvotn",
    "grímsvötn",
    "skeidararjokull",
    "skeiðarárjökull",
    "suicide basin",
    "suicide-basin",
    "klesteroa",
    "lago cachet",
    "cachet ii",
    "cachet dos",
    "glaciar colonia",
    "kyagar tso",
    "kyagar glacier",
    "shaksgam",
    "subglacial outburst",
    "subglacial caldera outburst",
    "subglacial jökulhlaup",
    "subglacial jokulhlaup",
    "proglacial canyon escape",
    "proglacial canyon",
    "r-channel",
    "röthlisberger",
    "rothlisberger",
    "ice dam drawdown",
    "ice-dam drawdown",
    "proglacial conductivity",
    "subglacial tremor",
    "grimsvotn-skeidararsandur-vatnajokull-iceland",
    "suicide-basin-mendenhall-juneau-alaska",
    "cachet-dos-colonia-patagonia-chile",
    "kyagar-shaksgam-karakoram-pakistan-china",
)

_SANDUR_AND_CRYOKARST_LEGACY_EXCLUSIONS: tuple[str, ...] = (
    "quicksand silt",
    "silt-bar",
    "silt bar",
    "glacial flour quicksand",
    "rock-flour quicksand",
    "krossa",
    "krossá",
    "kaskawulsh",
    "slims river",
    "rakaia braids",
    "sheridan glacier",
    "copper river",
    "ford a braided-river",
    "ford a braided river",
    "braided-river jokulhlaup outwash plain",
    "jokulhlaup-basalt-sandur",
    "sandur crossing",
    "anchor creep",
    "anchor creep rate",
    "matanuska",
    "root glacier",
    "athabasca",
    "gorner",
    "palmer glacier",
    "moulin chamber",
)

_OTHER_DOMAIN_EXCLUSIONS: tuple[str, ...] = (
    "order #",
    "order status",
    "refund",
    "return label",
    "shipping",
    "tracking number",
    "khumbu icefall",
    "ingraham glacier",
    "mer de glace",
    "snow bridge depth",
    "buckskin gulch",
    "wire pass",
    "little wild horse",
    "wadi mujib",
    "wadi ghul",
    "garganta del cares",
    "el tatio",
    "bumpass hell",
    "novarupta",
    "salar de uyuni",
    "salar de atacama",
    "salar de arizaro",
    "salar de chalviri",
    "ojos del salar",
)


def is_jokulhlaup_escape_query(query: str) -> bool:
    """Return True if the user query targets Subglacial Jökulhlaup Ice-Dammed Lake Outburst & Proglacial Canyon Escape."""
    if not query or not query.strip():
        return False
    q = query.strip().lower()

    if any(excl in q for excl in _OTHER_DOMAIN_EXCLUSIONS):
        return False

    has_explicit = any(term in q for term in _EXPLICIT_JOKULHLAUP_ESCAPE_TERMS)
    if has_explicit:
        return True

    # Preserve legacy sandur_crossing and cryokarst_speleology queries that mention generic "jokulhlaup"
    if any(excl in q for excl in _SANDUR_AND_CRYOKARST_LEGACY_EXCLUSIONS):
        return False

    if "jokulhlaup" in q or "jökulhlaup" in q:
        return True

    has_outburst_context = any(
        w in q
        for w in (
            "ice dam",
            "ice-dam",
            "outburst flood",
            "subglacial lake",
            "mendenhall glacier",
            "vatnajokull",
            "vatnajökull",
        )
    )
    has_escape_mechanic = any(
        w in q
        for w in (
            "drawdown",
            "conductivity",
            "tremor",
            "safe terrace",
            "flood front",
            "peak discharge",
            "evacuate",
            "evacuation",
            "escape",
        )
    )
    return has_outburst_context and has_escape_mechanic


def detect_jokulhlaup_escape_intent(query: str) -> bool:
    """Alias for is_jokulhlaup_escape_query()."""
    return is_jokulhlaup_escape_query(query)


def extract_jokulhlaup_escape_params(query: str) -> dict[str, Any]:
    """Extract jökulhlaup escape site_id and calculator parameters from a natural-language query."""
    q = (query or "").lower()

    matched_site: dict[str, Any] | None = None
    for token in (
        "grimsvotn-skeidararsandur-vatnajokull-iceland",
        "suicide-basin-mendenhall-juneau-alaska",
        "cachet-dos-colonia-patagonia-chile",
        "kyagar-shaksgam-karakoram-pakistan-china",
        "grimsvotn",
        "grímsvötn",
        "skeidararjokull",
        "skeiðarárjökull",
        "vatnajokull",
        "vatnajökull",
        "suicide basin",
        "klesteroa",
        "mendenhall",
        "juneau",
        "lago cachet",
        "cachet ii",
        "cachet",
        "glaciar colonia",
        "colonia",
        "kyagar tso",
        "kyagar",
        "shaksgam",
        "karakoram",
    ):
        if token in q:
            matched_site = get_site_by_id(token)
            if matched_site is not None:
                break

    site_defaults: dict[str, Any] = matched_site or JOKULHLAUP_ESCAPE_SITES[0]
    ice_dam_drawdown_cm_per_hr = float(site_defaults["default_ice_dam_drawdown_cm_per_hr"])
    proglacial_conductivity_us_cm = float(site_defaults["default_proglacial_conductivity_us_cm"])
    subglacial_tremor_amplitude_um = float(site_defaults["default_subglacial_tremor_amplitude_um"])
    canyon_floor_distance_from_portal_km = float(
        site_defaults["default_canyon_floor_distance_from_portal_km"]
    )
    vertical_gain_to_safe_terrace_m = float(
        site_defaults["default_vertical_gain_to_safe_terrace_m"]
    )
    has_calc_params = False

    # 1. Ice dam drawdown (cm/hr)
    drawdown_patterns = [
        r"(?:ice[\s-]+dam\s+)?drawdown(?:\s+rate)?\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*(?:cm/hr|cm/h|cm\s*per\s*hr|cm)?",
        r"(\d+(?:\.\d+)?)\s*(?:cm/hr|cm/h|cm\s*per\s*hr)\s*(?:ice[\s-]+dam\s+)?(?:drawdown)?",
    ]
    for pat in drawdown_patterns:
        m = re.search(pat, q)
        if m:
            ice_dam_drawdown_cm_per_hr = max(0.0, min(250.0, float(m.group(1))))
            has_calc_params = True
            break

    # 2. Proglacial conductivity (uS/cm)
    cond_patterns = [
        r"(?:proglacial\s+)?conductivity\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*(?:us/cm|µs/cm|us|µs)?",
        r"(\d+(?:\.\d+)?)\s*(?:us/cm|µs/cm)\s*(?:proglacial\s+)?(?:conductivity)?",
    ]
    for pat in cond_patterns:
        m = re.search(pat, q)
        if m:
            proglacial_conductivity_us_cm = max(20.0, min(1200.0, float(m.group(1))))
            has_calc_params = True
            break

    # 3. Subglacial tremor amplitude (um)
    tremor_patterns = [
        r"(?:subglacial\s+)?tremor(?:\s+amplitude)?\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*(?:um|µm|micrometers?)?",
        r"(\d+(?:\.\d+)?)\s*(?:um|µm|micrometers?)\s*(?:subglacial\s+)?(?:tremor)?",
    ]
    for pat in tremor_patterns:
        m = re.search(pat, q)
        if m:
            subglacial_tremor_amplitude_um = max(0.1, min(50.0, float(m.group(1))))
            has_calc_params = True
            break

    # 4. Canyon floor distance from portal (km)
    dist_patterns = [
        r"(?:canyon(?:\s+floor)?\s+distance|distance(?:\s+from\s+portal)?|portal\s+distance)\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*km\b",
        r"(\d+(?:\.\d+)?)\s*km\s+(?:from\s+portal|canyon(?:\s+floor)?(?:\s+distance)?|portal\s+distance)",
    ]
    for pat in dist_patterns:
        m = re.search(pat, q)
        if m:
            canyon_floor_distance_from_portal_km = max(0.2, min(40.0, float(m.group(1))))
            has_calc_params = True
            break

    # 5. Vertical gain to safe terrace (m)
    gain_patterns = [
        r"(?:vertical\s+gain(?:\s+to\s+safe\s+terrace)?|terrace(?:\s+height|\s+gain)?)\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*m\b",
        r"(\d+(?:\.\d+)?)\s*m\s+(?:vertical\s+gain|safe\s+terrace)",
    ]
    for pat in gain_patterns:
        m = re.search(pat, q)
        if m:
            vertical_gain_to_safe_terrace_m = max(5.0, min(220.0, float(m.group(1))))
            has_calc_params = True
            break

    if any(w in q for w in ("calculate", "calculator", "compute")) and not has_calc_params:
        has_calc_params = True

    return {
        "site_id": matched_site["id"] if matched_site else None,
        "site": matched_site,
        "ice_dam_drawdown_cm_per_hr": ice_dam_drawdown_cm_per_hr,
        "proglacial_conductivity_us_cm": proglacial_conductivity_us_cm,
        "subglacial_tremor_amplitude_um": subglacial_tremor_amplitude_um,
        "canyon_floor_distance_from_portal_km": canyon_floor_distance_from_portal_km,
        "vertical_gain_to_safe_terrace_m": vertical_gain_to_safe_terrace_m,
        "has_calc_params": has_calc_params,
    }


def format_jokulhlaup_escape_response(query: str) -> dict[str, Any]:
    """Build a structured jökulhlaup escape response payload for chat and SSE endpoints."""
    params: dict[str, Any] = extract_jokulhlaup_escape_params(query)
    matched_site: dict[str, Any] | None = params["site"]
    has_calc = bool(params["has_calc_params"])

    calc_result: dict[str, Any] = calculate_jokulhlaup_escape(
        ice_dam_drawdown_cm_per_hr=float(params["ice_dam_drawdown_cm_per_hr"]),
        proglacial_conductivity_us_cm=float(params["proglacial_conductivity_us_cm"]),
        subglacial_tremor_amplitude_um=float(params["subglacial_tremor_amplitude_um"]),
        canyon_floor_distance_from_portal_km=float(params["canyon_floor_distance_from_portal_km"]),
        vertical_gain_to_safe_terrace_m=float(params["vertical_gain_to_safe_terrace_m"]),
    )

    if has_calc:
        action = "jokulhlaup_escape_calculated"
        matched_sites: list[dict[str, Any]] = (
            [matched_site] if matched_site else list(JOKULHLAUP_ESCAPE_SITES)
        )
    elif matched_site is not None:
        action = "jokulhlaup_escape_lookup"
        matched_sites = [matched_site]
    else:
        action = "jokulhlaup_escape_info"
        matched_sites = list(JOKULHLAUP_ESCAPE_SITES)

    site_summary = (
        f"{matched_site['name']} ({matched_site['country']}, {matched_site['elevation_range']})"
        if matched_site
        else "Global Ice-Dammed Lake & Subglacial Jökulhlaup Corridors (Grímsvötn, Suicide Basin, Lago Cachet II, Kyagar Tso)"
    )

    summary_lines: list[str] = [
        f"### Subglacial Jökulhlaup Ice-Dammed Lake Outburst & Proglacial Canyon Escape Assessment: {site_summary}",
        f"- **Safety / Risk Level:** `{calc_result['risk_level'].upper()}`",
        f"- **Estimated Peak Outburst Discharge:** `{calc_result['estimated_peak_discharge_m3s']:.1f} m³/s` "
        f"(Ice-Dam Drawdown `{calc_result['ice_dam_drawdown_cm_per_hr']:.1f} cm/hr`, "
        f"Conductivity `{calc_result['proglacial_conductivity_us_cm']:.0f} µS/cm`, "
        f"Tremor `{calc_result['subglacial_tremor_amplitude_um']:.1f} µm`)",
        f"- **Flood Front Arrival Window:** `{calc_result['flood_front_arrival_minutes']:.1f} minutes` "
        f"(at `{calc_result['canyon_floor_distance_from_portal_km']:.1f} km` downstream of portal)",
        f"- **Required Vertical Ascent Rate:** `{calc_result['required_ascent_rate_m_per_min']:.2f} m/min` "
        f"(to reach `{calc_result['vertical_gain_to_safe_terrace_m']:.0f} m` safe bedrock terrace)",
        f"- **Ice-Block Ballistic Impact Risk:** `{calc_result['ice_block_ballistic_impact_risk_pct']:.1f}%`",
        f"- **Evacuation Strategy:** {calc_result['evacuation_strategy']}",
    ]
    if matched_site:
        summary_lines.append(
            f"- **Site Navigation Protocol:** {matched_site['navigation_protocol']}"
        )
        summary_lines.append(
            f"- **Early Warning Protocol:** {matched_site['early_warning_protocol']}"
        )
    if calc_result["warnings"]:
        summary_lines.append("- **Active Warnings:** " + " | ".join(calc_result["warnings"]))
    summary_lines.append(
        "- **Essential Gear:** "
        + "; ".join(item["item"] for item in JOKULHLAUP_ESCAPE_GEAR_CHECKLIST[:4])
    )

    formatted_text = "\n".join(summary_lines)

    return {
        "action": action,
        "query": query,
        "site": dict(matched_site) if matched_site else None,
        "matched_sites": [dict(s) for s in matched_sites],
        "sites": [dict(s) for s in JOKULHLAUP_ESCAPE_SITES],
        "calculation": calc_result,
        "gear_checklist": get_gear_checklist(),
        "answer": formatted_text,
        "formatted_response": formatted_text,
    }


def build_jokulhlaup_escape_prompt(info_or_query: dict[str, Any] | str) -> str:
    """Build the system prompt grounding block for LLM generation on jökulhlaup escape queries."""
    info: dict[str, Any] = (
        format_jokulhlaup_escape_response(info_or_query)
        if isinstance(info_or_query, str)
        else info_or_query
    )
    calc: dict[str, Any] = info.get("calculation") or {}
    site: dict[str, Any] | None = info.get("site")
    site_header = (
        f"Target Site: {site['name']} ({site['country']}, {site['elevation_range']}, trigger_mechanism={site['trigger_mechanism']})"
        if site
        else "Target Domain: Subglacial Jökulhlaup Ice-Dammed Lake Outburst & Proglacial Canyon Escape"
    )
    warnings_str = "; ".join(calc.get("warnings", [])) or "None"
    recs_str = "; ".join(calc.get("recommendations", []))
    return (
        "\n\n[SUBGLACIAL JÖKULHLAUP ICE-DAMMED LAKE OUTBURST & PROGLACIAL CANYON ESCAPE FIELD GUIDE]\n"
        f"{site_header}\n"
        f"Action: {info.get('action', 'jokulhlaup_escape_info')}\n"
        f"Risk Level: {calc.get('risk_level', 'moderate')}\n"
        f"Inputs: ice_dam_drawdown_cm_per_hr={calc.get('ice_dam_drawdown_cm_per_hr')}, "
        f"proglacial_conductivity_us_cm={calc.get('proglacial_conductivity_us_cm')}, "
        f"subglacial_tremor_amplitude_um={calc.get('subglacial_tremor_amplitude_um')}, "
        f"canyon_floor_distance_from_portal_km={calc.get('canyon_floor_distance_from_portal_km')}, "
        f"vertical_gain_to_safe_terrace_m={calc.get('vertical_gain_to_safe_terrace_m')}\n"
        f"Calculated Metrics: estimated_peak_discharge_m3s={calc.get('estimated_peak_discharge_m3s')} m3/s, "
        f"flood_front_arrival_minutes={calc.get('flood_front_arrival_minutes')} min, "
        f"required_ascent_rate_m_per_min={calc.get('required_ascent_rate_m_per_min')} m/min, "
        f"ice_block_ballistic_impact_risk_pct={calc.get('ice_block_ballistic_impact_risk_pct')}%\n"
        f"Evacuation Strategy: {calc.get('evacuation_strategy', '')}\n"
        f"Warnings: {warnings_str}\n"
        f"Recommendations: {recs_str}\n"
        "Provide concrete subglacial jökulhlaup and ice-dammed lake outburst flood (GLOF) escape guidance "
        "covering Röthlisberger R-channel exponential enlargement, proglacial electrical conductivity and "
        "harmonic tremor early warning, H2S/SO2 gas defense at glacier portals, and rapid vertical ascent "
        "to bedrock trimline terraces.\n"
    )


def get_chat_response(query: str) -> dict[str, Any]:
    """Return a standalone fallback chat response dictionary with jokulhlaup_escape_info."""
    info: dict[str, Any] = format_jokulhlaup_escape_response(query)
    return {
        "answer": info["formatted_response"],
        "context": [s["name"] for s in info["matched_sites"]],
        "jokulhlaup_escape_info": info,
    }


def generate_stream_events(query: str) -> Iterator[dict[str, Any]]:
    """Yield SSE event dictionaries for standalone jökulhlaup escape streaming."""
    info: dict[str, Any] = format_jokulhlaup_escape_response(query)
    text = str(info["formatted_response"])
    midpoint = max(1, len(text) // 2)
    yield {
        "answer": text[:midpoint],
        "context": [s["name"] for s in info["matched_sites"]],
        "jokulhlaup_escape_info": info,
    }
    yield {
        "answer": text[midpoint:],
    }
    yield {
        "done": True,
        "jokulhlaup_escape_info": info,
    }
