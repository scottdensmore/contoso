"""Coastal Blowhole, Surge Channel & Sea-Cave Pneumatic Wave-Hazard Navigation Domain Module.

Provides domain logic, curated coastal blowhole, surge channel, and sea-cave catalogs,
mandatory acoustic barotrauma and littoral extraction gear checklists, portal piston-seal
probability, pneumatic air-compression overpressure, clapotis rebound surge velocity,
and safe set-lull window calculations, intent detection, and response formatting for
sea-cave pneumatic wave-hazard navigation queries.
"""

import re
from typing import Any, Literal, Optional

LittoralConduitMorphology = Literal[
    "constricted_pneumatic_blowhole_shaft",
    "convergent_basalt_surge_slot",
    "submerged_siphon_overpressure_chamber",
    "dual_portal_littoral_through_arch",
    "boulder_choked_collapse_doline",
]

WavePeriodRegime = Literal[
    "short_period_wind_chop_8s",
    "moderate_groundswell_12s",
    "long_period_forerunner_swell_17s",
    "infragravity_sneaker_wave_group_22s",
]

LittoralTraversalMode = Literal[
    "sit_on_top_sea_kayak_sprint",
    "helmeted_coasteer_swim_and_scramble",
    "inflatable_rescue_sled_recon",
    "rope_belayed_rim_standoff_observation",
]

SeaCavePneumaticSafetyStatus = Literal[
    "nominal_vented_slack_swell_window",
    "caution_acoustic_overpressure_and_rebound_surge",
    "abort_pneumatic_piston_seal_and_blowhole_eruption",
]

VALID_MORPHOLOGIES: set[str] = {
    "constricted_pneumatic_blowhole_shaft",
    "convergent_basalt_surge_slot",
    "submerged_siphon_overpressure_chamber",
    "dual_portal_littoral_through_arch",
    "boulder_choked_collapse_doline",
}

VALID_WAVE_REGIMES: set[str] = {
    "short_period_wind_chop_8s",
    "moderate_groundswell_12s",
    "long_period_forerunner_swell_17s",
    "infragravity_sneaker_wave_group_22s",
}

VALID_TRAVERSAL_MODES: set[str] = {
    "sit_on_top_sea_kayak_sprint",
    "helmeted_coasteer_swim_and_scramble",
    "inflatable_rescue_sled_recon",
    "rope_belayed_rim_standoff_observation",
}


class _AttrDict(dict[str, Any]):
    """Dictionary supporting both key and attribute access plus model_dump()."""

    def __getattr__(self, key: str) -> Any:
        try:
            return self[key]
        except KeyError as exc:
            raise AttributeError(key) from exc

    def model_dump(self) -> dict[str, Any]:
        return dict(self)


SEA_CAVE_PNEUMATIC_SITES: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "mendocino-devils-punchbowl-russian-gulch-siphon",
            "name": "Russian Gulch Devil's Punchbowl & Mendocino Headland Surge Caverns",
            "region": "Mendocino Coast, California, USA",
            "elevation": 0,
            "elevation_m": 0,
            "morphology": "boulder_choked_collapse_doline",
            "wave_regime": "long_period_forerunner_swell_17s",
            "traversal_mode": "sit_on_top_sea_kayak_sprint",
            "portal_ceiling_clearance_m": 3.2,
            "typical_significant_wave_height_m": 1.8,
            "typical_swell_period_seconds": 15.0,
            "chamber_convergence_ratio": 2.4,
            "chamber_length_m": 62.0,
            "primary_hazard": (
                "Long-period North Pacific forerunner swells (15–17 s) converging from dual headland tunnels "
                "into the collapsed 60 m x 30 m Devil's Punchbowl doline, creating violent clapotis standing waves "
                "and sudden portal ceiling seals over submerged Franciscan greywacke chockstones."
            ),
            "swell_timing_and_escape_protocol": (
                "Count at least two full 15-minute swell set cycles from the outer kelp line before sprinting the "
                "seaward arch during a verified multi-minute lull; abort immediately if tide exceeds +1.2 m MLLW."
            ),
            "field_notes": (
                "Iconic Mendocino collapsed sea-cave sinkhole fed by twin littoral surge tunnels; refracted swell "
                "trains amplify 2.4x inside the throat, producing booming pneumatic air blasts at mid-to-high tide."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "staffa-fingals-cave-columnar-basalt-surge-vault",
            "name": "Fingal's Cave & Clamshell Basalt Surge Vault",
            "region": "Isle of Staffa, Inner Hebrides, Scotland, UK",
            "elevation": 0,
            "elevation_m": 0,
            "morphology": "convergent_basalt_surge_slot",
            "wave_regime": "moderate_groundswell_12s",
            "traversal_mode": "helmeted_coasteer_swim_and_scramble",
            "portal_ceiling_clearance_m": 6.5,
            "typical_significant_wave_height_m": 1.4,
            "typical_swell_period_seconds": 12.0,
            "chamber_convergence_ratio": 1.8,
            "chamber_length_m": 72.0,
            "primary_hazard": (
                "72 m Paleogene hexagonal columnar basalt vault that funnels North Atlantic groundswell into a "
                "tapering dead-end apex, generating powerful acoustic resonance, 3.5 m/s backwash drawdown, and "
                "slick algae-sheathed basalt column causeway ledges."
            ),
            "swell_timing_and_escape_protocol": (
                "Maintain high-flotation PFD and helmeted three-point contact along the elevated eastern hexagonal "
                "column ledge; never swim into the inner 20 m wedge when Atlantic groundswell exceeds 1.5 m."
            ),
            "field_notes": (
                "Gaelic name 'Uamh-Binn' (Cave of Melody) derives from the thunderous pneumatic compression and "
                "harmonic air-column oscillation produced as every swell crest compresses trapped vault air at the rear wall."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "pictured-rocks-lovers-leap-sandstone-sea-caves",
            "name": "Pictured Rocks Littoral Sandstone Surge Caves",
            "region": "Lake Superior, Michigan, USA",
            "elevation": 183,
            "elevation_m": 183,
            "morphology": "dual_portal_littoral_through_arch",
            "wave_regime": "short_period_wind_chop_8s",
            "traversal_mode": "sit_on_top_sea_kayak_sprint",
            "portal_ceiling_clearance_m": 4.8,
            "typical_significant_wave_height_m": 0.7,
            "typical_swell_period_seconds": 8.0,
            "chamber_convergence_ratio": 1.3,
            "chamber_length_m": 38.0,
            "primary_hazard": (
                "Steep, short-period (6–8 s) Lake Superior wind chop reflecting off vertical 60 m Munising sandstone "
                "cliffs to create chaotic cross-clapotis inside narrow keyholes and undercut arch pillars."
            ),
            "swell_timing_and_escape_protocol": (
                "Transit dual-portal sandstone arches in single-file kayak intervals with 4.8 m overhead clearance; "
                "exit seaward away from vertical cliff rebound zones if northwest wind chop builds above 1.0 m."
            ),
            "field_notes": (
                "Freshwater littoral sea caves carved into Cambrian Munising sandstone at 183 m lake elevation; "
                "dual-portal venting prevents total pneumatic sealing under calm summer conditions."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "kiama-bombo-headland-basalt-blowhole-slot",
            "name": "Kiama & Bombo Headland Columnar Basalt Blowhole Conduit",
            "region": "Illawarra Coast, New South Wales, Australia",
            "elevation": 0,
            "elevation_m": 0,
            "morphology": "constricted_pneumatic_blowhole_shaft",
            "wave_regime": "infragravity_sneaker_wave_group_22s",
            "traversal_mode": "rope_belayed_rim_standoff_observation",
            "portal_ceiling_clearance_m": 1.4,
            "typical_significant_wave_height_m": 2.8,
            "typical_swell_period_seconds": 18.0,
            "chamber_convergence_ratio": 4.1,
            "chamber_length_m": 54.0,
            "primary_hazard": (
                "Extreme 4.1:1 convergent Permian latite/basalt surge cavern terminating in a constricted 2.5 m "
                "vertical blowhole chimney; southeast Tasman swells completely seal the 1.4 m portal, compressing "
                "trapped air like a hydraulic piston and erupting 30–60 m spray plumes with >45 kPa overpressure."
            ),
            "swell_timing_and_escape_protocol": (
                "Strictly prohibited from water-level conduit entry; observe only from rope-belayed basalt rim "
                "standoff anchors outside the infragravity sneaker-wave wash zone."
            ),
            "field_notes": (
                "World-renowned pneumatic blowhole system; when long-period southeast groundswell aligns with "
                "the entrance slot at medium tide, the water plug seals the ceiling and violently decompresses upward."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "na-pali-honopu-open-ceiling-lava-sea-cave",
            "name": "Na Pali Open-Ceiling & Pirate's Lava Tube Sea Caves",
            "region": "Kauai, Hawaii, USA",
            "elevation": 0,
            "elevation_m": 0,
            "morphology": "submerged_siphon_overpressure_chamber",
            "wave_regime": "long_period_forerunner_swell_17s",
            "traversal_mode": "inflatable_rescue_sled_recon",
            "portal_ceiling_clearance_m": 2.6,
            "typical_significant_wave_height_m": 1.9,
            "typical_swell_period_seconds": 16.0,
            "chamber_convergence_ratio": 2.9,
            "chamber_length_m": 85.0,
            "primary_hazard": (
                "Long-period North Pacific forerunner swells arriving unannounced across deep Hawaiian bathymetry, "
                "sealing the 2.6 m shield-basalt lava tube portal and creating tympanic acoustic barotrauma and "
                "high-velocity siphon suction across razor-sharp coral/urchin shelves."
            ),
            "swell_timing_and_escape_protocol": (
                "Deploy an exterior watch craft outside the lava-tube portal with VHF/whistle signals; abort all "
                "interior chamber recon on the first indication of northwest forerunner period lengthening above 14 s."
            ),
            "field_notes": (
                "85 m littoral lava-tube chambers along the Na Pali cliffs (including Wai'akapua / Open-Ceiling Cave); "
                "rapid transition from flat summer trade-wind swell to long-period autumn groundswell can trap craft inside."
            ),
        }
    ),
]


SEA_CAVE_PNEUMATIC_GEAR_CHECKLIST: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "ce-en1385-whitewater-and-surf-impact-helmet",
            "name": "CE EN 1385 Multi-Impact Surf & Littoral Cavern Helmet with Ear-Cup Cutouts",
            "category": "impact_and_barotrauma_armor",
            "mandatory": True,
            "rationale": (
                "Shields the cranium against sudden upward portal ceiling slams when a swell crest lifts a kayak "
                "or swimmer toward low-clearance basalt/sandstone overhangs."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "vented-acoustic-barotrauma-surf-earplugs",
            "name": "Acoustic-Mesh Vented Barotrauma & Cold-Water Surge Earplugs",
            "category": "impact_and_barotrauma_armor",
            "mandatory": True,
            "rationale": (
                "Dampens transient pneumatic air-compression shockwaves (15–60 kPa) inside dead-end sea caves "
                "to prevent tympanic membrane rupture while preserving vocal/whistle situational awareness."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "high-flotation-quick-release-coasteering-pfd",
            "name": "High-Flotation (70N+) Low-Profile Coasteering & Sea-Cave PFD with Quick-Release Tow Belt",
            "category": "buoyancy_and_extraction",
            "mandatory": True,
            "rationale": (
                "Provides positive buoyancy in aerated whitewater foam inside surge slots where entrained air "
                "reduces water density by up to 35%, while allowing instant tether release if snagged."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "blunt-tip-titanium-line-cutter-and-kelp-knife",
            "name": "Chest-Mounted Blunt-Tip Titanium Line Cutter & Serrated Kelp/Monofilament Knife",
            "category": "buoyancy_and_extraction",
            "mandatory": True,
            "rationale": (
                "Cuts tangled tow tethers, derelict lobster/crab pot lines, and bull-kelp stipes that accumulate "
                "in turbulent eddy pockets at sea-cave thresholds."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "dual-beam-ipx8-submersible-headlamp-and-strobe",
            "name": "Helmet-Mounted IPX8 Submersible (100 m) 1200-Lumen Spot/Flood Headlamp & Strobe",
            "category": "littoral_telemetry",
            "mandatory": True,
            "rationale": (
                "Illuminates dark rear siphon chambers when an incoming wave plug blocks all portal daylight "
                "and provides high-visibility strobe signaling through blowhole mist."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "digital-swell-set-interval-chronograph-and-tide-table",
            "name": "Wrist-Mounted Digital Swell-Set Interval Chronograph & Local MLLW Tide-Window Slate",
            "category": "littoral_telemetry",
            "mandatory": True,
            "rationale": (
                "Tracks wave-group beat intervals (typically 12–18 minutes between dominant sets) and real-time "
                "tidal elevation relative to portal ceiling clearance."
            ),
        }
    ),
]


def get_all_sea_cave_pneumatic_sites() -> list[dict[str, Any]]:
    """Return all curated coastal blowhole, surge channel, and sea-cave pneumatic sites."""
    return list(SEA_CAVE_PNEUMATIC_SITES)


def get_sea_cave_pneumatic_site_by_id(site_id: str) -> Optional[dict[str, Any]]:
    """Return a single sea-cave pneumatic site by ID, or None if not found."""
    normalized = site_id.strip().lower()
    for site in SEA_CAVE_PNEUMATIC_SITES:
        if site["id"] == normalized:
            return site
    return None


def filter_sea_cave_pneumatic_sites(
    morphology: str | None = None,
    wave_regime: str | None = None,
    traversal_mode: str | None = None,
) -> list[dict[str, Any]]:
    """Filter curated sea-cave pneumatic sites by morphology, wave_regime, and/or traversal_mode.

    Raises ValueError if any supplied filter value is not in the valid domain literal set.
    """
    if morphology is not None and morphology not in VALID_MORPHOLOGIES:
        raise ValueError(
            f"Invalid morphology '{morphology}'. Must be one of {sorted(VALID_MORPHOLOGIES)}."
        )
    if wave_regime is not None and wave_regime not in VALID_WAVE_REGIMES:
        raise ValueError(
            f"Invalid wave_regime '{wave_regime}'. Must be one of {sorted(VALID_WAVE_REGIMES)}."
        )
    if traversal_mode is not None and traversal_mode not in VALID_TRAVERSAL_MODES:
        raise ValueError(
            f"Invalid traversal_mode '{traversal_mode}'. Must be one of {sorted(VALID_TRAVERSAL_MODES)}."
        )

    results = list(SEA_CAVE_PNEUMATIC_SITES)
    if morphology is not None:
        results = [s for s in results if s["morphology"] == morphology]
    if wave_regime is not None:
        results = [s for s in results if s["wave_regime"] == wave_regime]
    if traversal_mode is not None:
        results = [s for s in results if s["traversal_mode"] == traversal_mode]
    return results


def get_sea_cave_pneumatic_gear_checklist() -> list[dict[str, Any]]:
    """Return the mandatory 6-item coastal blowhole & sea-cave pneumatic gear checklist."""
    return list(SEA_CAVE_PNEUMATIC_GEAR_CHECKLIST)


def calculate_sea_cave_pneumatic_safety(
    morphology: str = "boulder_choked_collapse_doline",
    wave_regime: str = "long_period_forerunner_swell_17s",
    traversal_mode: str = "sit_on_top_sea_kayak_sprint",
    portal_ceiling_clearance_m: float = 3.2,
    significant_wave_height_m: float = 1.8,
    swell_period_seconds: float = 15.0,
    chamber_convergence_ratio: float = 2.4,
    tide_height_above_mllw_m: float = 0.8,
    chamber_length_m: float = 62.0,
) -> dict[str, Any]:
    """Calculate portal piston-seal probability, pneumatic overpressure (kPa),
    rebound surge velocity (m/s), and safe set-lull window (seconds) for sea caves and blowholes.
    """
    if morphology not in VALID_MORPHOLOGIES:
        raise ValueError(
            f"Invalid morphology '{morphology}'. Must be one of {sorted(VALID_MORPHOLOGIES)}."
        )
    if wave_regime not in VALID_WAVE_REGIMES:
        raise ValueError(
            f"Invalid wave_regime '{wave_regime}'. Must be one of {sorted(VALID_WAVE_REGIMES)}."
        )
    if traversal_mode not in VALID_TRAVERSAL_MODES:
        raise ValueError(
            f"Invalid traversal_mode '{traversal_mode}'. Must be one of {sorted(VALID_TRAVERSAL_MODES)}."
        )
    if not (0.3 <= portal_ceiling_clearance_m <= 25.0):
        raise ValueError(
            f"portal_ceiling_clearance_m ({portal_ceiling_clearance_m}) must be between 0.3 and 25.0 m."
        )
    if not (0.1 <= significant_wave_height_m <= 12.0):
        raise ValueError(
            f"significant_wave_height_m ({significant_wave_height_m}) must be between 0.1 and 12.0 m."
        )
    if not (4.0 <= swell_period_seconds <= 28.0):
        raise ValueError(
            f"swell_period_seconds ({swell_period_seconds}) must be between 4.0 and 28.0 s."
        )
    if not (1.0 <= chamber_convergence_ratio <= 6.0):
        raise ValueError(
            f"chamber_convergence_ratio ({chamber_convergence_ratio}) must be between 1.0 and 6.0."
        )
    if not (-1.5 <= tide_height_above_mllw_m <= 5.0):
        raise ValueError(
            f"tide_height_above_mllw_m ({tide_height_above_mllw_m}) must be between -1.5 and 5.0 m."
        )
    if not (5.0 <= chamber_length_m <= 250.0):
        raise ValueError(f"chamber_length_m ({chamber_length_m}) must be between 5.0 and 250.0 m.")

    morphology_seal_bonus: dict[str, float] = {
        "dual_portal_littoral_through_arch": -0.10,
        "convergent_basalt_surge_slot": 0.04,
        "boulder_choked_collapse_doline": 0.08,
        "submerged_siphon_overpressure_chamber": 0.16,
        "constricted_pneumatic_blowhole_shaft": 0.24,
    }
    wave_regime_multiplier: dict[str, float] = {
        "short_period_wind_chop_8s": 0.78,
        "moderate_groundswell_12s": 1.00,
        "long_period_forerunner_swell_17s": 1.24,
        "infragravity_sneaker_wave_group_22s": 1.48,
    }
    morphology_pressure_factor: dict[str, float] = {
        "dual_portal_littoral_through_arch": 0.42,
        "boulder_choked_collapse_doline": 0.78,
        "convergent_basalt_surge_slot": 1.05,
        "submerged_siphon_overpressure_chamber": 1.38,
        "constricted_pneumatic_blowhole_shaft": 1.65,
    }

    # Effective overhead clearance after accounting for tidal height and shoaling crest amplification
    effective_clearance_m = max(
        0.15, portal_ceiling_clearance_m - (tide_height_above_mllw_m * 0.45)
    )
    shoaled_crest_amplitude_m = (
        0.68
        * significant_wave_height_m
        * (chamber_convergence_ratio**0.52)
        * ((swell_period_seconds / 10.0) ** 0.35)
        * wave_regime_multiplier[wave_regime]
    )

    # 1. Portal piston-seal probability (0.01 to 0.99)
    fill_ratio = shoaled_crest_amplitude_m / effective_clearance_m
    raw_seal_prob = (fill_ratio / (1.0 + fill_ratio)) * 0.92 + morphology_seal_bonus[morphology]
    if (
        morphology == "dual_portal_littoral_through_arch"
        and significant_wave_height_m <= 1.0
        and portal_ceiling_clearance_m >= 3.5
    ):
        raw_seal_prob = min(raw_seal_prob, 0.18)
    portal_piston_seal_probability = round(max(0.01, min(0.99, raw_seal_prob)), 3)

    # 2. Pneumatic overpressure (kPa) inside chamber
    length_compression_factor = (chamber_length_m / 50.0) ** 0.38
    raw_overpressure_kpa = (
        8.5
        * (portal_piston_seal_probability**1.35)
        * (chamber_convergence_ratio**1.12)
        * (significant_wave_height_m**0.85)
        * ((swell_period_seconds / 10.0) ** 0.55)
        * length_compression_factor
        * morphology_pressure_factor[morphology]
    )
    pneumatic_overpressure_kpa = round(max(0.5, min(140.0, raw_overpressure_kpa)), 1)

    # 3. Clapotis & backwash rebound surge velocity (m/s)
    raw_surge_velocity_ms = (
        1.15
        * (significant_wave_height_m**0.62)
        * (chamber_convergence_ratio**0.55)
        * ((swell_period_seconds / 10.0) ** 0.42)
        * (0.85 + 0.45 * portal_piston_seal_probability)
    )
    rebound_surge_velocity_ms = round(max(0.3, min(14.5, raw_surge_velocity_ms)), 2)

    # 4. Safe inter-set lull window (seconds) available to enter and exit
    transit_penalty_s = chamber_length_m * 0.42
    raw_lull_window_s = (
        165.0
        * (1.05 - (portal_piston_seal_probability * 0.78))
        * (1.0 / (wave_regime_multiplier[wave_regime] ** 0.65))
        - (significant_wave_height_m * 14.0)
        - (transit_penalty_s * 0.35)
    )
    safe_set_lull_window_seconds = round(max(5.0, min(240.0, raw_lull_window_s)), 1)

    # 5. Classify SeaCavePneumaticSafetyStatus
    safety_status: SeaCavePneumaticSafetyStatus
    if (
        portal_piston_seal_probability >= 0.60
        or pneumatic_overpressure_kpa >= 32.0
        or rebound_surge_velocity_ms >= 4.2
        or safe_set_lull_window_seconds < 28.0
        or portal_ceiling_clearance_m <= 1.6
        or significant_wave_height_m >= 2.6
        or morphology == "constricted_pneumatic_blowhole_shaft"
        or wave_regime == "infragravity_sneaker_wave_group_22s"
    ):
        safety_status = "abort_pneumatic_piston_seal_and_blowhole_eruption"
    elif (
        portal_piston_seal_probability >= 0.25
        or pneumatic_overpressure_kpa >= 12.0
        or rebound_surge_velocity_ms >= 2.2
        or safe_set_lull_window_seconds < 65.0
        or significant_wave_height_m >= 1.3
        or swell_period_seconds >= 13.0
        or chamber_convergence_ratio >= 2.0
        or morphology
        in (
            "submerged_siphon_overpressure_chamber",
            "boulder_choked_collapse_doline",
            "convergent_basalt_surge_slot",
        )
        or wave_regime
        in (
            "long_period_forerunner_swell_17s",
            "moderate_groundswell_12s",
        )
    ):
        safety_status = "caution_acoustic_overpressure_and_rebound_surge"
    else:
        safety_status = "nominal_vented_slack_swell_window"

    if safety_status == "abort_pneumatic_piston_seal_and_blowhole_eruption":
        swell_set_timing_protocol = (
            "EMERGENCY ABORT — PNEUMATIC PISTON SEAL & BLOWHOLE ERUPTION HAZARD: Do not enter the sea-cave "
            f"portal or surge slot (piston-seal probability {portal_piston_seal_probability:.1%}, overpressure "
            f"{pneumatic_overpressure_kpa} kPa, rebound surge {rebound_surge_velocity_ms} m/s, safe lull "
            f"{safe_set_lull_window_seconds} s). Incoming wave crests completely plug the {portal_ceiling_clearance_m} m "
            "throat and turn the chamber into a compressed-air cannon; hold outside the outer break line or "
            "observe only from rope-belayed cliff-rim anchors."
        )
        barotrauma_and_clapotis_advisory = (
            f"CRITICAL BAROTRAUMA & CEILING SLAM RISK ({pneumatic_overpressure_kpa} kPa peak overpressure): "
            "Adiabatic air compression above 30 kPa inside a sealed siphon can rupture tympanic membranes and "
            "launch boats or swimmers into overhead basalt ceilings. Keep CE EN 1385 helmets, vented acoustic "
            "earplugs, and quick-release tow tethers rigged for immediate seaward bailout."
        )
    elif safety_status == "caution_acoustic_overpressure_and_rebound_surge":
        swell_set_timing_protocol = (
            "CAUTION — TIMED INTER-SET LULL SPRINT & OUTSIDE WATCH PROTOCOL: Moderate chamber convergence "
            f"({chamber_convergence_ratio}:1 over {chamber_length_m} m) and {significant_wave_height_m} m / "
            f"{swell_period_seconds} s swell yield a {portal_piston_seal_probability:.1%} piston-seal risk and "
            f"{safe_set_lull_window_seconds} s safe lull window ({traversal_mode}). Time at least two full wave-group "
            "cycles with a chronograph before entering, station a lookout craft outside the portal, and exit before "
            "the next set horizon builds."
        )
        barotrauma_and_clapotis_advisory = (
            f"MODERATE ACOUSTIC OVERPRESSURE & CLAPOTIS SURGE ({pneumatic_overpressure_kpa} kPa, "
            f"{rebound_surge_velocity_ms} m/s rebound): Reflected backwash meeting incoming swell creates steep "
            "standing clapotis waves near the portal throat. Wear vented barotrauma earplugs, a 70N+ coasteering "
            "PFD, and a helmet-mounted IPX8 headlamp."
        )
    else:
        swell_set_timing_protocol = (
            "NOMINAL VENTED SLACK-SWELL WINDOW: Generous overhead portal clearance "
            f"({portal_ceiling_clearance_m} m) and low {significant_wave_height_m} m / {swell_period_seconds} s swell "
            f"keep piston-seal probability low ({portal_piston_seal_probability:.1%}) with a "
            f"{safe_set_lull_window_seconds} s lull window. Transit cleanly in single-file intervals via "
            f"`{traversal_mode}` while monitoring tide elevation ({tide_height_above_mllw_m} m MLLW)."
        )
        barotrauma_and_clapotis_advisory = (
            f"LOW PNEUMATIC OVERPRESSURE ({pneumatic_overpressure_kpa} kPa, {rebound_surge_velocity_ms} m/s surge): "
            "Dual-portal or high-ceiling venting prevents destructive air compression, though helmet, PFD, "
            "and titanium line-cutter remain mandatory around submerged boulder walls and kelp eddies."
        )

    return _AttrDict(
        {
            "morphology": morphology,
            "wave_regime": wave_regime,
            "traversal_mode": traversal_mode,
            "portal_ceiling_clearance_m": round(portal_ceiling_clearance_m, 2),
            "significant_wave_height_m": round(significant_wave_height_m, 2),
            "swell_period_seconds": round(swell_period_seconds, 1),
            "chamber_convergence_ratio": round(chamber_convergence_ratio, 2),
            "tide_height_above_mllw_m": round(tide_height_above_mllw_m, 2),
            "chamber_length_m": round(chamber_length_m, 1),
            "portal_piston_seal_probability": portal_piston_seal_probability,
            "pneumatic_overpressure_kpa": pneumatic_overpressure_kpa,
            "rebound_surge_velocity_ms": rebound_surge_velocity_ms,
            "safe_set_lull_window_seconds": safe_set_lull_window_seconds,
            "safety_status": safety_status,
            "swell_set_timing_protocol": swell_set_timing_protocol,
            "barotrauma_and_clapotis_advisory": barotrauma_and_clapotis_advisory,
        }
    )


_SEA_CAVE_PNEUMATICS_KEYWORDS: tuple[str, ...] = (
    "blowhole",
    "blowholes",
    "sea cave",
    "sea caves",
    "sea-cave",
    "sea-caves",
    "surge channel",
    "surge channels",
    "surge slot",
    "pneumatic wave",
    "pneumatic overpressure",
    "piston seal",
    "piston-seal",
    "clapotis",
    "fingal",
    "fingal's cave",
    "fingals cave",
    "devils punchbowl",
    "devil's punchbowl",
    "russian gulch siphon",
    "kiama blowhole",
    "bombo headland",
    "pictured rocks",
    "lovers leap sea cave",
    "lover's leap",
    "na pali",
    "honopu",
    "air compression blast",
    "littoral cave",
    "littoral caves",
    "littoral conduit",
    "barotrauma earplug",
)


def is_sea_cave_pneumatics_query(query: str) -> bool:
    """Return True if the user query pertains to coastal blowholes, surge channels, or sea-cave pneumatic navigation."""
    if not query or not query.strip():
        return False
    q = query.lower()

    if any(
        ex in q
        for ex in (
            "cobble spit",
            "shingle spit",
            "kelp-wrack",
            "kelp wrack",
            "boulder reef",
            "dungeness spit",
            "chesil beach",
            "nelson boulder bank",
            "farewell spit",
            "intertidal cobble",
            "storm-berm cobble",
            "mucilage slip",
            "tiankeng",
            "giant sinkhole",
            "collapse sinkhole",
            "mega-doline",
            "xiaozhai",
            "dashiwei",
            "golondrinas",
            "sarisarinama",
            "sarisariñama",
            "sima humboldt",
            "cenote",
            "cenotes",
            "halocline",
            "anchialine",
            "schlieren",
            "ox bel ha",
            "ox-bel-ha",
            "angelita",
            "sac actun",
            "sac-actun",
            "pet cembalo",
            "dan's cave",
            "dans cave",
            "sawmill sink",
            "abaco",
            "meromictic",
            "tannic",
            "chemocline",
            "pycnocline",
            "blue hole",
        )
    ):
        return False

    if any(kw in q for kw in _SEA_CAVE_PNEUMATICS_KEYWORDS):
        return True

    has_littoral_context = any(
        term in q
        for term in (
            "littoral arch",
            "basalt vault",
            "coastal cavern",
            "surge cavern",
            "collapse doline",
            "siphon chamber",
        )
    )
    has_pneumatic_wave_mechanic = any(
        term in q
        for term in (
            "overpressure",
            "swell period",
            "rebound surge",
            "portal clearance",
            "ceiling clearance",
            "convergence ratio",
            "sneaker wave",
            "barotrauma",
        )
    )
    return has_littoral_context and has_pneumatic_wave_mechanic


detect_sea_cave_pneumatics_intent = is_sea_cave_pneumatics_query


def extract_sea_cave_pneumatics_params(query: str) -> dict[str, Any]:
    """Extract site_id, morphology, wave_regime, traversal_mode, and numerical parameters from query."""
    q = query.lower()
    params: dict[str, Any] = {
        "site_id": None,
        "morphology": "boulder_choked_collapse_doline",
        "wave_regime": "long_period_forerunner_swell_17s",
        "traversal_mode": "sit_on_top_sea_kayak_sprint",
        "portal_ceiling_clearance_m": 3.2,
        "significant_wave_height_m": 1.8,
        "swell_period_seconds": 15.0,
        "chamber_convergence_ratio": 2.4,
        "tide_height_above_mllw_m": 0.8,
        "chamber_length_m": 62.0,
        "has_explicit_numbers": False,
        "is_calculation": False,
    }

    site_patterns: list[tuple[tuple[str, ...], str]] = [
        (
            ("mendocino", "devils punchbowl", "devil's punchbowl", "russian gulch"),
            "mendocino-devils-punchbowl-russian-gulch-siphon",
        ),
        (
            ("staffa", "fingal", "fingals", "inner hebrides", "clamshell basalt"),
            "staffa-fingals-cave-columnar-basalt-surge-vault",
        ),
        (
            ("pictured rocks", "lovers leap", "lover's leap", "lake superior"),
            "pictured-rocks-lovers-leap-sandstone-sea-caves",
        ),
        (
            ("kiama", "bombo", "illawarra"),
            "kiama-bombo-headland-basalt-blowhole-slot",
        ),
        (
            ("na pali", "honopu", "kauai", "pirate's lava", "open-ceiling lava"),
            "na-pali-honopu-open-ceiling-lava-sea-cave",
        ),
    ]
    for aliases, site_id in site_patterns:
        if site_id in q or any(alias in q for alias in aliases):
            params["site_id"] = site_id
            site = get_sea_cave_pneumatic_site_by_id(site_id)
            if site is not None:
                params["morphology"] = site["morphology"]
                params["wave_regime"] = site["wave_regime"]
                params["traversal_mode"] = site["traversal_mode"]
                params["portal_ceiling_clearance_m"] = site["portal_ceiling_clearance_m"]
                params["significant_wave_height_m"] = site["typical_significant_wave_height_m"]
                params["swell_period_seconds"] = site["typical_swell_period_seconds"]
                params["chamber_convergence_ratio"] = site["chamber_convergence_ratio"]
                params["chamber_length_m"] = site["chamber_length_m"]
            break

    # Override morphology if explicitly mentioned
    if (
        "constricted_pneumatic_blowhole_shaft" in q
        or "blowhole shaft" in q
        or "constricted pneumatic" in q
    ):
        params["morphology"] = "constricted_pneumatic_blowhole_shaft"
    elif (
        "convergent_basalt_surge_slot" in q or "basalt surge slot" in q or "convergent basalt" in q
    ):
        params["morphology"] = "convergent_basalt_surge_slot"
    elif (
        "submerged_siphon_overpressure_chamber" in q
        or "submerged siphon" in q
        or "overpressure chamber" in q
    ):
        params["morphology"] = "submerged_siphon_overpressure_chamber"
    elif (
        "dual_portal_littoral_through_arch" in q
        or "dual portal" in q
        or "dual-portal" in q
        or "through arch" in q
    ):
        params["morphology"] = "dual_portal_littoral_through_arch"
    elif "boulder_choked_collapse_doline" in q or "collapse doline" in q or "boulder-choked" in q:
        params["morphology"] = "boulder_choked_collapse_doline"

    # Override wave_regime if explicitly mentioned
    if "infragravity_sneaker_wave_group_22s" in q or "infragravity" in q or "sneaker wave" in q:
        params["wave_regime"] = "infragravity_sneaker_wave_group_22s"
    elif (
        "long_period_forerunner_swell_17s" in q
        or "forerunner swell" in q
        or "long period" in q
        or "long-period" in q
    ):
        params["wave_regime"] = "long_period_forerunner_swell_17s"
    elif "moderate_groundswell_12s" in q or "moderate groundswell" in q:
        params["wave_regime"] = "moderate_groundswell_12s"
    elif (
        "short_period_wind_chop_8s" in q
        or "wind chop" in q
        or "short period" in q
        or "short-period" in q
    ):
        params["wave_regime"] = "short_period_wind_chop_8s"

    # Override traversal_mode if explicitly mentioned
    if "rope_belayed_rim_standoff_observation" in q or "rope belayed" in q or "rim standoff" in q:
        params["traversal_mode"] = "rope_belayed_rim_standoff_observation"
    elif "inflatable_rescue_sled_recon" in q or "rescue sled" in q or "inflatable sled" in q:
        params["traversal_mode"] = "inflatable_rescue_sled_recon"
    elif (
        "helmeted_coasteer_swim_and_scramble" in q
        or "coasteer swim" in q
        or "swim and scramble" in q
    ):
        params["traversal_mode"] = "helmeted_coasteer_swim_and_scramble"
    elif "sit_on_top_sea_kayak_sprint" in q or "kayak sprint" in q or "sit-on-top" in q:
        params["traversal_mode"] = "sit_on_top_sea_kayak_sprint"

    # Extract portal ceiling clearance (m)
    clearance_match = re.search(
        r"(?:(?:portal\s+|ceiling\s+)?clearance(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*m\b|(\d+(?:\.\d+)?)\s*m\s+(?:portal\s+|ceiling\s+)?clearance)",
        q,
    )
    if clearance_match:
        val = float(clearance_match.group(1) or clearance_match.group(2))
        params["portal_ceiling_clearance_m"] = max(0.3, min(25.0, val))
        params["has_explicit_numbers"] = True

    # Extract significant wave height (m)
    wave_match = re.search(
        r"(?:(?:significant\s+)?wave\s+height(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*m\b|(\d+(?:\.\d+)?)\s*m\s+(?:significant\s+)?wave\s+height)",
        q,
    )
    if wave_match:
        val = float(wave_match.group(1) or wave_match.group(2))
        params["significant_wave_height_m"] = max(0.1, min(12.0, val))
        params["has_explicit_numbers"] = True

    # Extract swell period (s)
    period_match = re.search(
        r"(?:(?:swell\s+|wave\s+)?period(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*s(?:ec(?:onds?)?)?\b|(\d+(?:\.\d+)?)\s*s(?:ec(?:onds?)?)?\s+(?:swell\s+|wave\s+)?period)",
        q,
    )
    if period_match:
        val = float(period_match.group(1) or period_match.group(2))
        params["swell_period_seconds"] = max(4.0, min(28.0, val))
        params["has_explicit_numbers"] = True

    # Extract chamber convergence ratio
    conv_match = re.search(
        r"(?:(?:chamber\s+)?convergence(?:\s+ratio)?(?:\s+of)?\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?::1\s+)?convergence\s+ratio)",
        q,
    )
    if conv_match:
        val = float(conv_match.group(1) or conv_match.group(2))
        params["chamber_convergence_ratio"] = max(1.0, min(6.0, val))
        params["has_explicit_numbers"] = True

    # Extract tide height above MLLW (m)
    tide_match = re.search(
        r"(?:tide(?:\s+height)?(?:\s+above\s+mllw)?(?:\s+of)?\s*(-?\d+(?:\.\d+)?)\s*m\b|(-?\d+(?:\.\d+)?)\s*m\s+tide)",
        q,
    )
    if tide_match:
        val = float(tide_match.group(1) or tide_match.group(2))
        params["tide_height_above_mllw_m"] = max(-1.5, min(5.0, val))
        params["has_explicit_numbers"] = True

    # Extract chamber length (m)
    length_match = re.search(
        r"(?:(?:chamber\s+|conduit\s+)?length(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*m\b|(\d+(?:\.\d+)?)\s*m\s+(?:chamber|conduit)\s+length)",
        q,
    )
    if length_match:
        val = float(length_match.group(1) or length_match.group(2))
        params["chamber_length_m"] = max(5.0, min(250.0, val))
        params["has_explicit_numbers"] = True

    calc_triggers = (
        "calculate",
        "evaluate",
        "assess",
        "piston seal",
        "piston-seal",
        "overpressure",
        "rebound surge",
        "lull window",
    )
    params["is_calculation"] = bool(params["has_explicit_numbers"]) or any(
        t in q for t in calc_triggers
    )

    return params


def format_sea_cave_pneumatics_response(
    query: str,
) -> tuple[str, dict[str, Any]]:
    """Format a structured markdown answer and info dictionary for sea-cave pneumatic queries."""
    params = extract_sea_cave_pneumatics_params(query)
    is_calc = bool(params["is_calculation"])

    if is_calc:
        calc_result = calculate_sea_cave_pneumatic_safety(
            morphology=params["morphology"],
            wave_regime=params["wave_regime"],
            traversal_mode=params["traversal_mode"],
            portal_ceiling_clearance_m=float(params["portal_ceiling_clearance_m"]),
            significant_wave_height_m=float(params["significant_wave_height_m"]),
            swell_period_seconds=float(params["swell_period_seconds"]),
            chamber_convergence_ratio=float(params["chamber_convergence_ratio"]),
            tide_height_above_mllw_m=float(params["tide_height_above_mllw_m"]),
            chamber_length_m=float(params["chamber_length_m"]),
        )
        gear_list = [dict(g) for g in get_sea_cave_pneumatic_gear_checklist()]
        calc_info: dict[str, Any] = {
            **dict(calc_result),
            "action": "sea_cave_pneumatics_calculated",
            "calculation": dict(calc_result),
            "gear_checklist": gear_list,
        }
        if params["site_id"]:
            matched_site = get_sea_cave_pneumatic_site_by_id(str(params["site_id"]))
            if matched_site is not None:
                calc_info["site"] = dict(matched_site)

        answer = (
            "### Coastal Blowhole, Surge Channel & Sea-Cave Pneumatic Safety Assessment\n\n"
            f"- **Safety Status:** `{calc_result['safety_status']}`\n"
            f"- **Portal Piston-Seal Probability:** `{calc_result['portal_piston_seal_probability']:.1%}` "
            f"(`{calc_result['morphology']}`, {calc_result['portal_ceiling_clearance_m']} m portal clearance, "
            f"{calc_result['tide_height_above_mllw_m']} m MLLW tide)\n"
            f"- **Pneumatic Overpressure:** `{calc_result['pneumatic_overpressure_kpa']} kPa` "
            f"(wave regime `{calc_result['wave_regime']}`, {calc_result['significant_wave_height_m']} m @ "
            f"{calc_result['swell_period_seconds']} s, convergence `{calc_result['chamber_convergence_ratio']}:1`)\n"
            f"- **Rebound Surge Velocity:** `{calc_result['rebound_surge_velocity_ms']} m/s` "
            f"(chamber length `{calc_result['chamber_length_m']} m`)\n"
            f"- **Safe Inter-Set Lull Window:** `{calc_result['safe_set_lull_window_seconds']} s` "
            f"(`{calc_result['traversal_mode']}`)\n\n"
            f"**Swell Set Timing Protocol:** {calc_result['swell_set_timing_protocol']}\n\n"
            f"**Barotrauma & Clapotis Advisory:** {calc_result['barotrauma_and_clapotis_advisory']}"
        )
        return answer, calc_info

    if params["site_id"]:
        site = get_sea_cave_pneumatic_site_by_id(str(params["site_id"]))
        if site is not None:
            site_calc = calculate_sea_cave_pneumatic_safety(
                morphology=site["morphology"],
                wave_regime=site["wave_regime"],
                traversal_mode=site["traversal_mode"],
                portal_ceiling_clearance_m=float(site["portal_ceiling_clearance_m"]),
                significant_wave_height_m=float(site["typical_significant_wave_height_m"]),
                swell_period_seconds=float(site["typical_swell_period_seconds"]),
                chamber_convergence_ratio=float(site["chamber_convergence_ratio"]),
                tide_height_above_mllw_m=0.6,
                chamber_length_m=float(site["chamber_length_m"]),
            )
            lookup_info: dict[str, Any] = {
                "action": "sea_cave_pneumatics_lookup",
                "site": dict(site),
                "baseline_calculation": dict(site_calc),
                "gear_checklist": [dict(g) for g in get_sea_cave_pneumatic_gear_checklist()],
            }
            answer = (
                f"### {site['name']} ({site['region']})\n\n"
                f"- **Site ID:** `{site['id']}` (Elevation: {site['elevation_m']} m)\n"
                f"- **Littoral Conduit Morphology:** `{site['morphology']}` "
                f"(Portal Clearance: {site['portal_ceiling_clearance_m']} m, Convergence: {site['chamber_convergence_ratio']}:1, "
                f"Length: {site['chamber_length_m']} m)\n"
                f"- **Wave Period Regime:** `{site['wave_regime']}` "
                f"(Typical Wave Height: {site['typical_significant_wave_height_m']} m @ {site['typical_swell_period_seconds']} s)\n"
                f"- **Recommended Traversal Mode:** `{site['traversal_mode']}`\n"
                f"- **Primary Hazard:** {site['primary_hazard']}\n"
                f"- **Swell Timing & Escape Protocol:** {site['swell_timing_and_escape_protocol']}\n"
                f"- **Field Notes:** {site['field_notes']}"
            )
            return answer, lookup_info

    sites_list = [dict(s) for s in get_all_sea_cave_pneumatic_sites()]
    gear_list = [dict(g) for g in get_sea_cave_pneumatic_gear_checklist()]
    general_info: dict[str, Any] = {
        "action": "sea_cave_pneumatics_info",
        "sites": sites_list,
        "gear_checklist": gear_list,
    }
    site_bullets = "\n".join(
        f"- **{s['name']}** (`{s['id']}`, {s['region']}): `{s['morphology']}` / `{s['wave_regime']}`"
        for s in sites_list
    )
    gear_bullets = "\n".join(
        f"- **{g['name']}** (`{g['category']}`): {g['rationale']}" for g in gear_list
    )
    answer = (
        "### Coastal Blowhole, Surge Channel & Sea-Cave Pneumatic Wave-Hazard Navigation Guide\n\n"
        "Navigating littoral sea caves, convergent columnar basalt surge slots, and coastal blowhole "
        "conduits requires tracking long-period forerunner swell sets, evaluating portal ceiling "
        "clearance against MLLW tide elevation to prevent pneumatic piston sealing, and wearing "
        "CE EN 1385 cranial and vented acoustic barotrauma protection.\n\n"
        "#### Curated Littoral Sea-Cave & Blowhole Reference Sites\n"
        f"{site_bullets}\n\n"
        "#### Mandatory 6-Item Sea-Cave Pneumatic Gear Checklist\n"
        f"{gear_bullets}"
    )
    return answer, general_info


def build_sea_cave_pneumatics_prompt(query: str = "") -> str:
    """Build system prompt context for LLM augmentation on sea-cave pneumatic wave-hazard topics."""
    answer, _ = format_sea_cave_pneumatics_response(query)
    return (
        "You are an expert coastal geomorphologist and Littoral Sea-Cave, Surge Channel & Blowhole Navigation specialist. "
        "Use the following pneumatic overpressure, portal piston-seal, and clapotis wave-rebound telemetry to answer the user's question:\n\n"
        f"{answer}"
    )
