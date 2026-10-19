"""Sub-Canopy Mangroves & Pneumatophore Prop-Root Tidal Labyrinth Navigation Domain Module.

Provides domain logic, curated estuarine mangrove labyrinth site catalogs, mandatory
oyster-laceration armor and sub-canopy wayfinding gear checklists, effective channel speed,
root-strainer pinning risk, anoxic sulfidic mud entrapment probability, and safe ebb-tide
exit window calculations, intent detection, and response formatting for sub-canopy mangrove
and pneumatophore prop-root tidal labyrinth navigation queries.
"""

import re
from typing import Any, Literal, Optional

MangroveRootMorphology = Literal[
    "rhizophora_arching_prop_root_tangle",
    "avicennia_dense_pencil_pneumatophore_mat",
    "bruguiera_buttress_knee_root_hummocks",
    "sonneratia_conical_spike_root_shoal",
    "submerged_oyster_encrusted_deadfall_snag",
]

TidalCreekRegime = Literal[
    "high_slack_canopy_tunnel_float",
    "ebb_tide_dendritic_channel_drain",
    "flood_tide_sheetflow_inundation",
    "spring_low_exposed_sulfidic_mud_plug",
]

EstuarineTraversalMode = Literal[
    "short_hull_sit_in_creek_kayak",
    "sup_finless_shallow_draft_poling",
    "root_stepping_and_mud_ski_wading",
    "packraft_amphibious_portage",
]

MangroveSafetyStatus = Literal[
    "nominal_high_slack_canopy_corridor",
    "caution_prop_root_pinning_and_oyster_laceration",
    "abort_ebb_stranding_or_anoxic_silt_entrapment",
]

VALID_ROOT_MORPHOLOGIES: set[str] = {
    "rhizophora_arching_prop_root_tangle",
    "avicennia_dense_pencil_pneumatophore_mat",
    "bruguiera_buttress_knee_root_hummocks",
    "sonneratia_conical_spike_root_shoal",
    "submerged_oyster_encrusted_deadfall_snag",
}

VALID_TIDAL_REGIMES: set[str] = {
    "high_slack_canopy_tunnel_float",
    "ebb_tide_dendritic_channel_drain",
    "flood_tide_sheetflow_inundation",
    "spring_low_exposed_sulfidic_mud_plug",
}

VALID_TRAVERSAL_MODES: set[str] = {
    "short_hull_sit_in_creek_kayak",
    "sup_finless_shallow_draft_poling",
    "root_stepping_and_mud_ski_wading",
    "packraft_amphibious_portage",
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


MANGROVE_LABYRINTH_SITES: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "everglades-hell-bay-labyrinth-waterway",
            "name": "Hell Bay & Whitewater Bay Rhizophora Prop-Root Wilderness",
            "region": "Everglades National Park, Florida, USA",
            "elevation": 0,
            "elevation_m": 0,
            "root_morphology": "rhizophora_arching_prop_root_tangle",
            "tidal_regime": "high_slack_canopy_tunnel_float",
            "traversal_mode": "short_hull_sit_in_creek_kayak",
            "prop_root_density_stems_m2": 14.0,
            "typical_current_velocity_knots": 0.6,
            "typical_water_depth_over_mud_cm": 62.0,
            "anoxic_silt_sink_depth_cm": 35.0,
            "canopy_closure_percent": 88.0,
            "primary_hazard": (
                "Interlocking red mangrove (Rhizophora mangle) aerial prop-root arches forming "
                "1.2 m wide overhead canopy tunnels where 88% canopy closure degrades single-constellation "
                "GPS lock and false dead-end bays mirror the numbered PVC marker channel."
            ),
            "dendritic_wayfinding_and_exit_protocol": (
                "Track numbered Hell Bay trail markers sequentially using a sub-canopy multi-GNSS "
                "breadcrumb plotter; use a compact 115 cm breakdown tunnel paddle to hand-walk past "
                "low prop-root arches during the high-slack float window."
            ),
            "field_notes": (
                "Classic Wilderness Waterway mangrove tunnel segment between Pearl Bay and Lard Can; "
                "tannic blackwater conceals submerged prop-root knees and mangrove oyster clusters."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "sundarbans-harbhanga-tidal-creek-nexus",
            "name": "Harbhanga & Matla Estuarine Pneumatophore Creek Labyrinth",
            "region": "Sundarbans Delta, West Bengal, India",
            "elevation": 1,
            "elevation_m": 1,
            "root_morphology": "avicennia_dense_pencil_pneumatophore_mat",
            "tidal_regime": "ebb_tide_dendritic_channel_drain",
            "traversal_mode": "short_hull_sit_in_creek_kayak",
            "prop_root_density_stems_m2": 42.0,
            "typical_current_velocity_knots": 2.4,
            "typical_water_depth_over_mud_cm": 48.0,
            "anoxic_silt_sink_depth_cm": 72.0,
            "canopy_closure_percent": 76.0,
            "primary_hazard": (
                "Fast-draining 2.4-knot ebb currents through dendritic khal creeks bordered by dense "
                "Avicennia marina pencil pneumatophore mats (42 stems/m²) and 72 cm deep thigh-sucking "
                "anoxic estuarine clay banks."
            ),
            "dendritic_wayfinding_and_exit_protocol": (
                "Depart interior dendritic feeder creeks at least 90 minutes before mid-ebb acceleration; "
                "read rheoscopic surface boil vectors at creek bifurcations to stay in the primary thalweg."
            ),
            "field_notes": (
                "Macro-tidal Ganges-Brahmaputra estuarine delta where lateral drainage channels empty "
                "into impassable sulfidic mud troughs punctuated by rigid vertical breathing roots."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "hinchinbrook-missionary-bay-mangrove-tunnels",
            "name": "Missionary Bay & Coral Creek Seven-Creek Mangrove Canopy Tunnels",
            "region": "Hinchinbrook Island, Queensland, Australia",
            "elevation": 0,
            "elevation_m": 0,
            "root_morphology": "bruguiera_buttress_knee_root_hummocks",
            "tidal_regime": "high_slack_canopy_tunnel_float",
            "traversal_mode": "sup_finless_shallow_draft_poling",
            "prop_root_density_stems_m2": 19.0,
            "typical_current_velocity_knots": 1.1,
            "typical_water_depth_over_mud_cm": 78.0,
            "anoxic_silt_sink_depth_cm": 40.0,
            "canopy_closure_percent": 82.0,
            "primary_hazard": (
                "Sinuous tropical Bruguiera gymnorhiza buttress and knee-root hummocks across seven "
                "interconnected tidal creeks where finned craft snag immediately and estuarine hazards "
                "demand strict deck-bound transit."
            ),
            "dendritic_wayfinding_and_exit_protocol": (
                "Remove all bottom skegs/fins for shallow-draft poling during the top two hours of high "
                "slack; clip biodegradable retro-reflective markers at blind three-way creek junctions."
            ),
            "field_notes": (
                "World-renowned high-biodiversity mangrove wilderness between Missionary Bay and the "
                "Hinchinbrook Channel; vaulted 12 m Bruguiera canopies create cathedral-like shaded waterways."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "osa-sierpe-terraba-buttress-root-estuary",
            "name": "Térraba-Sierpe Pelliciera & Rhizophora Tidal Swamp Labyrinth",
            "region": "Osa Peninsula, Puntarenas, Costa Rica",
            "elevation": 0,
            "elevation_m": 0,
            "root_morphology": "submerged_oyster_encrusted_deadfall_snag",
            "tidal_regime": "spring_low_exposed_sulfidic_mud_plug",
            "traversal_mode": "packraft_amphibious_portage",
            "prop_root_density_stems_m2": 28.0,
            "typical_current_velocity_knots": 2.9,
            "typical_water_depth_over_mud_cm": 22.0,
            "anoxic_silt_sink_depth_cm": 85.0,
            "canopy_closure_percent": 91.0,
            "primary_hazard": (
                "Spring-low tide exposure of 85 cm deep hydrogen-sulfide anoxic mud plugs and submerged "
                "deadfall snags encrusted with razor-sharp Crassostrea columbiensis mangrove oysters "
                "under a 2.9-knot estuarine outflow."
            ),
            "dendritic_wayfinding_and_exit_protocol": (
                "Abort interior shortcut esteros during spring-low drain; wear Kevlar cut-resistant "
                "gloves/booties and rig quick-release tow belts before portaging over fluted Pelliciera buttresses."
            ),
            "field_notes": (
                "Central America's largest Pacific mangrove estuary system featuring towering fluted "
                "tea-mangrove (Pelliciera rhizophorae) buttress roots and violent river-tide convergence zones."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "iriomote-nakama-river-bruguiera-knee-root-creek",
            "name": "Nakama & Urauchi River Subtropical Bruguiera Knee-Root Channels",
            "region": "Iriomote Island, Okinawa, Japan",
            "elevation": 0,
            "elevation_m": 0,
            "root_morphology": "sonneratia_conical_spike_root_shoal",
            "tidal_regime": "flood_tide_sheetflow_inundation",
            "traversal_mode": "root_stepping_and_mud_ski_wading",
            "prop_root_density_stems_m2": 22.0,
            "typical_current_velocity_knots": 1.4,
            "typical_water_depth_over_mud_cm": 54.0,
            "anoxic_silt_sink_depth_cm": 45.0,
            "canopy_closure_percent": 79.0,
            "primary_hazard": (
                "Rising flood-tide sheetflow over Sonneratia alba conical spike-root shoals and "
                "looping Bruguiera knee roots that obscure channel margins and create ankle-trapping "
                "root wickets beneath turbid brackish water."
            ),
            "dendritic_wayfinding_and_exit_protocol": (
                "Step only on consolidated root-collar arches or distribute weight across mud-ski wading "
                "boards; track flood-tide sheetflow vectors back toward the main Nakama river stem."
            ),
            "field_notes": (
                "Subtropical Yaeyama archipelago mangrove reserve harboring dense stands of Sonneratia "
                "alba, Bruguiera gymnorhiza, and giant Heritiera littoralis plank-buttress trees."
            ),
        }
    ),
]


MANGROVE_LABYRINTH_GEAR_CHECKLIST: list[dict[str, Any]] = [
    _AttrDict(
        {
            "id": "kevlar-armored-cut-resistant-oyster-gloves-and-booties",
            "name": "ANSI A5 Kevlar-Armored Cut-Resistant Mangrove Oyster Gloves & High-Top Booties",
            "category": "laceration_and_puncture_armor",
            "mandatory": True,
            "rationale": (
                "Prevents severe tendon and arterial lacerations when hand-walking craft off "
                "Crassostrea oyster-encrusted prop roots and stepping across conical Sonneratia spike roots."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "compact-115cm-double-blade-breakdown-tunnel-paddle",
            "name": "Compact 115 cm Carbon/Nylon Breakdown Sub-Canopy Tunnel Paddle",
            "category": "canopy_propulsion",
            "mandatory": True,
            "rationale": (
                "Allows high-cadence sculling and prop-root pushing inside 1.1–1.5 m wide Rhizophora "
                "arches where standard 215 cm paddles wedge hopelessly in overhead branches."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "sub-canopy-multi-gnss-breadcrumb-plotter-and-rheoscopic-compass",
            "name": "Dual-Band Multi-GNSS Sub-Canopy Breadcrumb Plotter & Deck-Mounted Sighting Compass",
            "category": "labyrinth_wayfinding",
            "mandatory": True,
            "rationale": (
                "Maintains continuous trackback breadcrumb telemetry under 80–95% mangrove canopy "
                "closure where multipath foliage attenuation blinds single-band GPS receivers."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "biodegradable-reflective-retro-clip-trail-markers",
            "name": "High-Visibility Biodegradable Retro-Reflective Branch-Clip Junction Markers (Set of 24)",
            "category": "labyrinth_wayfinding",
            "mandatory": True,
            "rationale": (
                "Provides physical line-of-sight confirmation at symmetrical dendritic creek "
                "bifurcations during retreating ebb-tide runs or low-light sub-canopy return legs."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "quick-release-tow-belt-and-floating-snag-pruning-saw",
            "name": "Waist-Mounted Quick-Release Extraction Tow Belt & Floating Folding Snag-Pruning Saw",
            "category": "canopy_propulsion",
            "mandatory": True,
            "rationale": (
                "Enables rapid boat-to-paddler unclipping if pinned against a tidal root strainer "
                "and clears storm-felled deadfall branches blocking narrow evacuation creeks."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "sealed-permethrin-headnet-and-electrolyte-hydration-bladder",
            "name": "Fine-Mesh No-See-Um Permethrin Canopy Headnet & 3 L Insulated Electrolyte Bladder",
            "category": "laceration_and_puncture_armor",
            "mandatory": True,
            "rationale": (
                "Protects eyes and airway from dense Culicoides mangrove midge swarms and golden "
                "orb-weaver webs while preventing heat exhaustion in stagnant 95% humidity tunnels."
            ),
        }
    ),
]


def get_all_mangrove_labyrinth_sites() -> list[dict[str, Any]]:
    """Return all curated sub-canopy mangrove & pneumatophore prop-root labyrinth sites."""
    return list(MANGROVE_LABYRINTH_SITES)


def get_mangrove_labyrinth_site_by_id(site_id: str) -> Optional[dict[str, Any]]:
    """Return a single mangrove labyrinth site by ID, or None if not found."""
    normalized = site_id.strip().lower()
    for site in MANGROVE_LABYRINTH_SITES:
        if site["id"] == normalized:
            return site
    return None


def filter_mangrove_labyrinth_sites(
    root_morphology: str | None = None,
    tidal_regime: str | None = None,
    traversal_mode: str | None = None,
) -> list[dict[str, Any]]:
    """Filter curated mangrove labyrinth sites by root_morphology, tidal_regime, and/or traversal_mode.

    Raises ValueError if any supplied filter value is not in the valid domain literal set.
    """
    if (
        root_morphology is not None
        and root_morphology not in VALID_ROOT_MORPHOLOGIES
    ):
        raise ValueError(
            f"Invalid root_morphology '{root_morphology}'. Must be one of {sorted(VALID_ROOT_MORPHOLOGIES)}."
        )
    if tidal_regime is not None and tidal_regime not in VALID_TIDAL_REGIMES:
        raise ValueError(
            f"Invalid tidal_regime '{tidal_regime}'. Must be one of {sorted(VALID_TIDAL_REGIMES)}."
        )
    if (
        traversal_mode is not None
        and traversal_mode not in VALID_TRAVERSAL_MODES
    ):
        raise ValueError(
            f"Invalid traversal_mode '{traversal_mode}'. Must be one of {sorted(VALID_TRAVERSAL_MODES)}."
        )

    results = list(MANGROVE_LABYRINTH_SITES)
    if root_morphology is not None:
        results = [
            s for s in results if s["root_morphology"] == root_morphology
        ]
    if tidal_regime is not None:
        results = [s for s in results if s["tidal_regime"] == tidal_regime]
    if traversal_mode is not None:
        results = [s for s in results if s["traversal_mode"] == traversal_mode]
    return results


def get_mangrove_labyrinth_gear_checklist() -> list[dict[str, Any]]:
    """Return the mandatory 6-item sub-canopy mangrove labyrinth gear checklist."""
    return list(MANGROVE_LABYRINTH_GEAR_CHECKLIST)


def calculate_mangrove_labyrinth_navigation(
    root_morphology: str = "rhizophora_arching_prop_root_tangle",
    tidal_regime: str = "high_slack_canopy_tunnel_float",
    traversal_mode: str = "short_hull_sit_in_creek_kayak",
    prop_root_density_stems_m2: float = 14.0,
    tidal_current_velocity_knots: float = 0.6,
    water_depth_over_mud_cm: float = 62.0,
    anoxic_silt_sink_depth_cm: float = 35.0,
    canopy_closure_percent: float = 88.0,
    tide_stage_hours_to_low: float = 3.5,
) -> dict[str, Any]:
    """Calculate effective channel speed (km/hr), root-strainer pinning risk (%),
    anoxic mud entrapment probability (0-1), and safe ebb exit window (minutes).
    """
    if root_morphology not in VALID_ROOT_MORPHOLOGIES:
        raise ValueError(
            f"Invalid root_morphology '{root_morphology}'. Must be one of {sorted(VALID_ROOT_MORPHOLOGIES)}."
        )
    if tidal_regime not in VALID_TIDAL_REGIMES:
        raise ValueError(
            f"Invalid tidal_regime '{tidal_regime}'. Must be one of {sorted(VALID_TIDAL_REGIMES)}."
        )
    if traversal_mode not in VALID_TRAVERSAL_MODES:
        raise ValueError(
            f"Invalid traversal_mode '{traversal_mode}'. Must be one of {sorted(VALID_TRAVERSAL_MODES)}."
        )
    if not (1.0 <= prop_root_density_stems_m2 <= 120.0):
        raise ValueError(
            f"prop_root_density_stems_m2 ({prop_root_density_stems_m2}) must be between 1.0 and 120.0 stems/m²."
        )
    if not (0.0 <= tidal_current_velocity_knots <= 8.0):
        raise ValueError(
            f"tidal_current_velocity_knots ({tidal_current_velocity_knots}) must be between 0.0 and 8.0 knots."
        )
    if not (0.0 <= water_depth_over_mud_cm <= 350.0):
        raise ValueError(
            f"water_depth_over_mud_cm ({water_depth_over_mud_cm}) must be between 0.0 and 350.0 cm."
        )
    if not (5.0 <= anoxic_silt_sink_depth_cm <= 180.0):
        raise ValueError(
            f"anoxic_silt_sink_depth_cm ({anoxic_silt_sink_depth_cm}) must be between 5.0 and 180.0 cm."
        )
    if not (0.0 <= canopy_closure_percent <= 100.0):
        raise ValueError(
            f"canopy_closure_percent ({canopy_closure_percent}) must be between 0.0 and 100.0%."
        )
    if not (0.0 <= tide_stage_hours_to_low <= 6.5):
        raise ValueError(
            f"tide_stage_hours_to_low ({tide_stage_hours_to_low}) must be between 0.0 and 6.5 hours."
        )

    base_mode_speed_kmh: dict[str, float] = {
        "short_hull_sit_in_creek_kayak": 4.2,
        "sup_finless_shallow_draft_poling": 3.5,
        "packraft_amphibious_portage": 2.9,
        "root_stepping_and_mud_ski_wading": 1.6,
    }
    morphology_pinning_factor: dict[str, float] = {
        "rhizophora_arching_prop_root_tangle": 1.05,
        "bruguiera_buttress_knee_root_hummocks": 1.12,
        "sonneratia_conical_spike_root_shoal": 1.18,
        "avicennia_dense_pencil_pneumatophore_mat": 1.28,
        "submerged_oyster_encrusted_deadfall_snag": 1.48,
    }
    regime_speed_factor: dict[str, float] = {
        "high_slack_canopy_tunnel_float": 1.05,
        "flood_tide_sheetflow_inundation": 0.92,
        "ebb_tide_dendritic_channel_drain": 0.78,
        "spring_low_exposed_sulfidic_mud_plug": 0.45,
    }
    regime_entrapment_bonus: dict[str, float] = {
        "high_slack_canopy_tunnel_float": -0.06,
        "flood_tide_sheetflow_inundation": 0.04,
        "ebb_tide_dendritic_channel_drain": 0.12,
        "spring_low_exposed_sulfidic_mud_plug": 0.28,
    }

    # 1. Effective channel speed (km/hr)
    depth_factor = min(1.0, max(0.22, water_depth_over_mud_cm / 55.0))
    density_drag = max(0.32, 1.0 - (prop_root_density_stems_m2 / 145.0))
    canopy_obstruction = max(0.75, 1.0 - max(0.0, canopy_closure_percent - 65.0) * 0.004)
    raw_speed_kmh = (
        base_mode_speed_kmh[traversal_mode]
        * regime_speed_factor[tidal_regime]
        * depth_factor
        * density_drag
        * canopy_obstruction
    )
    effective_channel_speed_km_hr = round(max(0.3, min(6.5, raw_speed_kmh)), 2)

    # 2. Root-strainer pinning risk (%)
    raw_pinning_risk = (
        (prop_root_density_stems_m2 * 0.42)
        + ((tidal_current_velocity_knots**1.20) * 9.5)
        + (max(0.0, canopy_closure_percent - 60.0) * 0.16)
    ) * morphology_pinning_factor[root_morphology]
    if tidal_regime == "high_slack_canopy_tunnel_float" and tidal_current_velocity_knots <= 1.0:
        raw_pinning_risk *= 0.78
    root_strainer_pinning_risk_percent = round(
        max(2.0, min(99.0, raw_pinning_risk)), 1
    )

    # 3. Anoxic mud entrapment probability (0.01 to 0.99)
    shallow_deficit = max(0.0, (60.0 - water_depth_over_mud_cm) / 60.0)
    silt_severity = (anoxic_silt_sink_depth_cm / 110.0) ** 0.85
    ebb_urgency = max(0.0, (2.5 - tide_stage_hours_to_low) / 2.5) * 0.22
    raw_entrapment_prob = (
        0.08
        + (silt_severity * 0.34)
        + (shallow_deficit * 0.32)
        + ebb_urgency
        + regime_entrapment_bonus[tidal_regime]
    )
    if traversal_mode == "root_stepping_and_mud_ski_wading":
        raw_entrapment_prob += 0.06
    anoxic_mud_entrapment_probability = round(
        max(0.01, min(0.99, raw_entrapment_prob)), 3
    )

    # 4. Safe ebb exit window (minutes)
    base_window_min = tide_stage_hours_to_low * 52.0
    depth_buffer_min = min(35.0, water_depth_over_mud_cm * 0.38)
    drain_penalty_min = (
        tidal_current_velocity_knots * 14.0
        + (prop_root_density_stems_m2 * 0.35)
        + (anoxic_silt_sink_depth_cm * 0.18)
    )
    if tidal_regime == "spring_low_exposed_sulfidic_mud_plug":
        drain_penalty_min += 35.0
    safe_ebb_exit_window_minutes = int(
        round(
            max(
                5.0,
                min(260.0, base_window_min + depth_buffer_min - drain_penalty_min),
            )
        )
    )

    # 5. Classify MangroveSafetyStatus
    safety_status: MangroveSafetyStatus
    if (
        root_strainer_pinning_risk_percent >= 72.0
        or anoxic_mud_entrapment_probability >= 0.55
        or safe_ebb_exit_window_minutes < 35
        or water_depth_over_mud_cm < 25.0
        or anoxic_silt_sink_depth_cm >= 80.0
        or tidal_current_velocity_knots >= 2.8
        or tidal_regime == "spring_low_exposed_sulfidic_mud_plug"
    ):
        safety_status = "abort_ebb_stranding_or_anoxic_silt_entrapment"
    elif (
        root_strainer_pinning_risk_percent >= 30.0
        or anoxic_mud_entrapment_probability >= 0.28
        or safe_ebb_exit_window_minutes < 90
        or water_depth_over_mud_cm < 52.0
        or anoxic_silt_sink_depth_cm >= 45.0
        or tidal_current_velocity_knots >= 1.3
        or prop_root_density_stems_m2 >= 22.0
        or tidal_regime
        in (
            "ebb_tide_dendritic_channel_drain",
            "flood_tide_sheetflow_inundation",
        )
        or root_morphology
        in (
            "avicennia_dense_pencil_pneumatophore_mat",
            "submerged_oyster_encrusted_deadfall_snag",
            "sonneratia_conical_spike_root_shoal",
        )
    ):
        safety_status = "caution_prop_root_pinning_and_oyster_laceration"
    else:
        safety_status = "nominal_high_slack_canopy_corridor"

    if safety_status == "abort_ebb_stranding_or_anoxic_silt_entrapment":
        dendritic_wayfinding_protocol = (
            "EMERGENCY ABORT — EBB STRANDING & ANOXIC SULFIDIC SILT ENTRAPMENT HAZARD: "
            f"Do not enter interior mangrove feeder creeks (pinning risk {root_strainer_pinning_risk_percent}%, "
            f"anoxic mud entrapment probability {anoxic_mud_entrapment_probability:.1%}, safe ebb exit window "
            f"{safe_ebb_exit_window_minutes} min, water depth {water_depth_over_mud_cm} cm over "
            f"{anoxic_silt_sink_depth_cm} cm sulfidic ooze). Follow multi-GNSS breadcrumb trackback "
            "immediately to the primary outer bay channel before ebb drainage grounds the hull on "
            "pencil pneumatophores and razor-sharp oyster beds."
        )
        oyster_armor_and_strainer_advisory = (
            f"CRITICAL OYSTER LACERATION & ROOT-STRAINER PINNING RISK ({tidal_current_velocity_knots} kt current, "
            f"{prop_root_density_stems_m2} stems/m²): Never step bare-booted into exposed sulfidic mud plugs; "
            "distribute body weight horizontally across craft or mud skis, wear ANSI A5 Kevlar oyster gloves "
            "and high-top booties, and keep the quick-release tow belt and floating pruning saw accessible."
        )
    elif safety_status == "caution_prop_root_pinning_and_oyster_laceration":
        dendritic_wayfinding_protocol = (
            "CAUTION — ACTIVE TIDAL DRAIN & DENDRITIC JUNCTION TAGGING PROTOCOL: "
            f"Effective channel speed is {effective_channel_speed_km_hr} km/hr with a {safe_ebb_exit_window_minutes} min "
            f"safe ebb exit window under {canopy_closure_percent}% canopy closure (`{tidal_regime}`). "
            "Clip biodegradable retro-reflective markers at every blind creek bifurcation, verify rheoscopic "
            "surface flow vectors with a sighting compass, and begin outbound transit before mid-ebb draw."
        )
        oyster_armor_and_strainer_advisory = (
            f"MODERATE PROP-ROOT PINNING & OYSTER ABRASION ({root_strainer_pinning_risk_percent}% strainer risk, "
            f"`{root_morphology}`): Switch to a compact 115 cm breakdown tunnel paddle for close-quarters "
            "sculling, remove protruding bottom skegs/fins, and wear Kevlar cut-resistant gloves when "
            "fending off barnacle- and oyster-encrusted root arches."
        )
    else:
        dendritic_wayfinding_protocol = (
            "NOMINAL HIGH-SLACK CANOPY CORRIDOR WINDOW: Ample water depth over mud "
            f"({water_depth_over_mud_cm} cm) and low tidal current ({tidal_current_velocity_knots} kt) "
            f"yield {effective_channel_speed_km_hr} km/hr effective channel speed and a "
            f"{safe_ebb_exit_window_minutes} min safe exit window. Maintain continuous multi-GNSS "
            f"breadcrumb logging beneath {canopy_closure_percent}% canopy closure while advancing via `{traversal_mode}`."
        )
        oyster_armor_and_strainer_advisory = (
            f"LOW ROOT-STRAINER PINNING RISK ({root_strainer_pinning_risk_percent}%, "
            f"entrapment probability {anoxic_mud_entrapment_probability:.1%}): Use a 115 cm breakdown "
            "tunnel paddle for tight Rhizophora or Bruguiera arches and keep Kevlar oyster gloves, "
            "permethrin headnet, and folding snag saw rigged on deck."
        )

    return _AttrDict(
        {
            "root_morphology": root_morphology,
            "tidal_regime": tidal_regime,
            "traversal_mode": traversal_mode,
            "prop_root_density_stems_m2": round(prop_root_density_stems_m2, 1),
            "tidal_current_velocity_knots": round(
                tidal_current_velocity_knots, 2
            ),
            "water_depth_over_mud_cm": round(water_depth_over_mud_cm, 1),
            "anoxic_silt_sink_depth_cm": round(anoxic_silt_sink_depth_cm, 1),
            "canopy_closure_percent": round(canopy_closure_percent, 1),
            "tide_stage_hours_to_low": round(tide_stage_hours_to_low, 2),
            "effective_channel_speed_km_hr": effective_channel_speed_km_hr,
            "root_strainer_pinning_risk_percent": root_strainer_pinning_risk_percent,
            "anoxic_mud_entrapment_probability": anoxic_mud_entrapment_probability,
            "safe_ebb_exit_window_minutes": safe_ebb_exit_window_minutes,
            "safety_status": safety_status,
            "dendritic_wayfinding_protocol": dendritic_wayfinding_protocol,
            "oyster_armor_and_strainer_advisory": oyster_armor_and_strainer_advisory,
        }
    )


_MANGROVE_LABYRINTH_KEYWORDS: tuple[str, ...] = (
    "mangrove",
    "mangroves",
    "pneumatophore",
    "pneumatophores",
    "prop root",
    "prop roots",
    "prop-root",
    "prop-roots",
    "rhizophora",
    "avicennia",
    "bruguiera",
    "sonneratia",
    "pelliciera",
    "hell bay",
    "sundarbans",
    "harbhanga",
    "hinchinbrook",
    "missionary bay",
    "osa sierpe",
    "terraba-sierpe",
    "térraba-sierpe",
    "terraba sierpe",
    "iriomote",
    "nakama river",
    "oyster encrusted",
    "oyster-encrusted",
    "oyster gloves",
    "canopy tunnel",
    "canopy tunnels",
    "knee root",
    "knee-root",
    "sulfidic mud plug",
    "anoxic mud entrapment",
)


def is_mangrove_labyrinth_query(query: str) -> bool:
    """Return True if the user query pertains to sub-canopy mangroves or pneumatophore prop-root tidal labyrinth navigation."""
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
        )
    ):
        return False

    if any(kw in q for kw in _MANGROVE_LABYRINTH_KEYWORDS):
        return True

    has_estuarine_canopy_context = any(
        term in q
        for term in (
            "tidal labyrinth",
            "sub-canopy",
            "estuarine creek",
            "dendritic channel",
            "buttress root",
            "spike root",
        )
    )
    has_mangrove_mechanic = any(
        term in q
        for term in (
            "root strainer",
            "anoxic silt",
            "sulfidic mud",
            "tunnel paddle",
            "breadcrumb plotter",
            "canopy closure",
            "oyster laceration",
        )
    )
    return has_estuarine_canopy_context and has_mangrove_mechanic


detect_mangrove_labyrinth_intent = is_mangrove_labyrinth_query


def extract_mangrove_labyrinth_params(query: str) -> dict[str, Any]:
    """Extract site_id, root_morphology, tidal_regime, traversal_mode, and numerical parameters from query."""
    q = query.lower()
    params: dict[str, Any] = {
        "site_id": None,
        "root_morphology": "rhizophora_arching_prop_root_tangle",
        "tidal_regime": "high_slack_canopy_tunnel_float",
        "traversal_mode": "short_hull_sit_in_creek_kayak",
        "prop_root_density_stems_m2": 14.0,
        "tidal_current_velocity_knots": 0.6,
        "water_depth_over_mud_cm": 62.0,
        "anoxic_silt_sink_depth_cm": 35.0,
        "canopy_closure_percent": 88.0,
        "tide_stage_hours_to_low": 3.5,
        "has_explicit_numbers": False,
        "is_calculation": False,
    }

    site_patterns: list[tuple[tuple[str, ...], str]] = [
        (
            ("everglades", "hell bay", "whitewater bay", "lard can", "pearl bay"),
            "everglades-hell-bay-labyrinth-waterway",
        ),
        (
            ("sundarbans", "harbhanga", "matla", "west bengal"),
            "sundarbans-harbhanga-tidal-creek-nexus",
        ),
        (
            ("hinchinbrook", "missionary bay", "coral creek", "seven-creek", "seven creek"),
            "hinchinbrook-missionary-bay-mangrove-tunnels",
        ),
        (
            ("osa", "sierpe", "terraba", "térraba", "puntarenas", "pelliciera"),
            "osa-sierpe-terraba-buttress-root-estuary",
        ),
        (
            ("iriomote", "nakama", "urauchi", "okinawa", "yaeyama"),
            "iriomote-nakama-river-bruguiera-knee-root-creek",
        ),
    ]
    for aliases, site_id in site_patterns:
        if site_id in q or any(alias in q for alias in aliases):
            params["site_id"] = site_id
            site = get_mangrove_labyrinth_site_by_id(site_id)
            if site is not None:
                params["root_morphology"] = site["root_morphology"]
                params["tidal_regime"] = site["tidal_regime"]
                params["traversal_mode"] = site["traversal_mode"]
                params["prop_root_density_stems_m2"] = site[
                    "prop_root_density_stems_m2"
                ]
                params["tidal_current_velocity_knots"] = site[
                    "typical_current_velocity_knots"
                ]
                params["water_depth_over_mud_cm"] = site[
                    "typical_water_depth_over_mud_cm"
                ]
                params["anoxic_silt_sink_depth_cm"] = site[
                    "anoxic_silt_sink_depth_cm"
                ]
                params["canopy_closure_percent"] = site[
                    "canopy_closure_percent"
                ]
            break

    # Override root_morphology if explicitly mentioned
    if (
        "submerged_oyster_encrusted_deadfall_snag" in q
        or "oyster encrusted" in q
        or "oyster-encrusted" in q
        or "deadfall snag" in q
    ):
        params["root_morphology"] = "submerged_oyster_encrusted_deadfall_snag"
    elif (
        "avicennia_dense_pencil_pneumatophore_mat" in q
        or "pencil pneumatophore" in q
        or "pneumatophore mat" in q
        or "avicennia" in q
    ):
        params["root_morphology"] = "avicennia_dense_pencil_pneumatophore_mat"
    elif (
        "sonneratia_conical_spike_root_shoal" in q
        or "spike root" in q
        or "spike-root" in q
        or "sonneratia" in q
    ):
        params["root_morphology"] = "sonneratia_conical_spike_root_shoal"
    elif (
        "bruguiera_buttress_knee_root_hummocks" in q
        or "knee root" in q
        or "knee-root" in q
        or "bruguiera" in q
    ):
        params["root_morphology"] = "bruguiera_buttress_knee_root_hummocks"
    elif (
        "rhizophora_arching_prop_root_tangle" in q
        or "arching prop" in q
        or "prop root tangle" in q
        or "prop-root tangle" in q
    ):
        params["root_morphology"] = "rhizophora_arching_prop_root_tangle"

    # Override tidal_regime if explicitly mentioned
    if (
        "spring_low_exposed_sulfidic_mud_plug" in q
        or "sulfidic mud plug" in q
        or "spring low" in q
        or "spring-low" in q
    ):
        params["tidal_regime"] = "spring_low_exposed_sulfidic_mud_plug"
    elif (
        "ebb_tide_dendritic_channel_drain" in q
        or "dendritic channel drain" in q
        or "ebb tide" in q
        or "ebb-tide" in q
    ):
        params["tidal_regime"] = "ebb_tide_dendritic_channel_drain"
    elif (
        "flood_tide_sheetflow_inundation" in q
        or "sheetflow inundation" in q
        or "flood tide" in q
        or "flood-tide" in q
    ):
        params["tidal_regime"] = "flood_tide_sheetflow_inundation"
    elif (
        "high_slack_canopy_tunnel_float" in q
        or "canopy tunnel float" in q
        or "high slack" in q
        or "high-slack" in q
    ):
        params["tidal_regime"] = "high_slack_canopy_tunnel_float"

    # Override traversal_mode if explicitly mentioned
    if (
        "packraft_amphibious_portage" in q
        or "amphibious portage" in q
        or "packraft" in q
    ):
        params["traversal_mode"] = "packraft_amphibious_portage"
    elif (
        "root_stepping_and_mud_ski_wading" in q
        or "mud ski" in q
        or "mud-ski" in q
        or "root stepping" in q
    ):
        params["traversal_mode"] = "root_stepping_and_mud_ski_wading"
    elif (
        "sup_finless_shallow_draft_poling" in q
        or "finless" in q
        or "shallow draft poling" in q
        or "shallow-draft poling" in q
    ):
        params["traversal_mode"] = "sup_finless_shallow_draft_poling"
    elif (
        "short_hull_sit_in_creek_kayak" in q
        or "creek kayak" in q
        or "short hull" in q
        or "short-hull" in q
    ):
        params["traversal_mode"] = "short_hull_sit_in_creek_kayak"

    # Extract prop_root_density_stems_m2
    density_match = re.search(
        r"(?:(?:prop[\s-]*root\s+|root\s+)?density(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*(?:stems?/m2|stems?/m²|stems?)?|(\d+(?:\.\d+)?)\s*(?:stems?/m2|stems?/m²))",
        q,
    )
    if density_match:
        val = float(density_match.group(1) or density_match.group(2))
        params["prop_root_density_stems_m2"] = max(1.0, min(120.0, val))
        params["has_explicit_numbers"] = True

    # Extract tidal_current_velocity_knots
    current_match = re.search(
        r"(?:(?:tidal\s+|current\s+)?velocity(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*(?:knots?|kt|kts)\b|(\d+(?:\.\d+)?)\s*(?:knots?|kt|kts)\b)",
        q,
    )
    if current_match:
        val = float(current_match.group(1) or current_match.group(2))
        params["tidal_current_velocity_knots"] = max(0.0, min(8.0, val))
        params["has_explicit_numbers"] = True

    # Extract water_depth_over_mud_cm
    depth_match = re.search(
        r"(?:water\s+depth(?:\s+over\s+mud)?(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*cm\b|(\d+(?:\.\d+)?)\s*cm\s+water\s+depth)",
        q,
    )
    if depth_match:
        val = float(depth_match.group(1) or depth_match.group(2))
        params["water_depth_over_mud_cm"] = max(0.0, min(350.0, val))
        params["has_explicit_numbers"] = True

    # Extract anoxic_silt_sink_depth_cm
    silt_match = re.search(
        r"(?:(?:anoxic\s+)?(?:silt|mud)\s+(?:sink\s+)?depth(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*cm\b|(\d+(?:\.\d+)?)\s*cm\s+(?:anoxic\s+)?(?:silt|mud)\s+(?:sink\s+)?depth)",
        q,
    )
    if silt_match:
        val = float(silt_match.group(1) or silt_match.group(2))
        params["anoxic_silt_sink_depth_cm"] = max(5.0, min(180.0, val))
        params["has_explicit_numbers"] = True

    # Extract canopy_closure_percent
    canopy_match = re.search(
        r"(?:canopy\s+closure(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*%?|(\d+(?:\.\d+)?)\s*%\s*canopy\s+closure)",
        q,
    )
    if canopy_match:
        val = float(canopy_match.group(1) or canopy_match.group(2))
        params["canopy_closure_percent"] = max(0.0, min(100.0, val))
        params["has_explicit_numbers"] = True

    # Extract tide_stage_hours_to_low
    tide_stage_match = re.search(
        r"(?:tide\s+stage(?:\s+of)?\s*(\d+(?:\.\d+)?)\s*h(?:ours?|rs?)?|(\d+(?:\.\d+)?)\s*h(?:ours?|rs?)?\s+to\s+low)",
        q,
    )
    if tide_stage_match:
        val = float(tide_stage_match.group(1) or tide_stage_match.group(2))
        params["tide_stage_hours_to_low"] = max(0.0, min(6.5, val))
        params["has_explicit_numbers"] = True

    calc_triggers = (
        "calculate",
        "evaluate",
        "assess",
        "pinning risk",
        "entrapment probability",
        "exit window",
        "channel speed",
    )
    params["is_calculation"] = bool(params["has_explicit_numbers"]) or any(
        t in q for t in calc_triggers
    )

    return params


def format_mangrove_labyrinth_response(
    query: str,
) -> tuple[str, dict[str, Any]]:
    """Format a structured markdown answer and info dictionary for mangrove labyrinth queries."""
    params = extract_mangrove_labyrinth_params(query)
    is_calc = bool(params["is_calculation"])

    if is_calc:
        calc_result = calculate_mangrove_labyrinth_navigation(
            root_morphology=params["root_morphology"],
            tidal_regime=params["tidal_regime"],
            traversal_mode=params["traversal_mode"],
            prop_root_density_stems_m2=float(
                params["prop_root_density_stems_m2"]
            ),
            tidal_current_velocity_knots=float(
                params["tidal_current_velocity_knots"]
            ),
            water_depth_over_mud_cm=float(params["water_depth_over_mud_cm"]),
            anoxic_silt_sink_depth_cm=float(
                params["anoxic_silt_sink_depth_cm"]
            ),
            canopy_closure_percent=float(params["canopy_closure_percent"]),
            tide_stage_hours_to_low=float(params["tide_stage_hours_to_low"]),
        )
        gear_list = [
            dict(g) for g in get_mangrove_labyrinth_gear_checklist()
        ]
        calc_info: dict[str, Any] = {
            **dict(calc_result),
            "action": "mangrove_labyrinth_calculated",
            "calculation": dict(calc_result),
            "gear_checklist": gear_list,
        }
        if params["site_id"]:
            matched_site = get_mangrove_labyrinth_site_by_id(
                str(params["site_id"])
            )
            if matched_site is not None:
                calc_info["site"] = dict(matched_site)

        answer = (
            "### Sub-Canopy Mangrove & Pneumatophore Prop-Root Labyrinth Navigation Assessment\n\n"
            f"- **Safety Status:** `{calc_result['safety_status']}`\n"
            f"- **Effective Channel Speed:** `{calc_result['effective_channel_speed_km_hr']} km/hr` "
            f"(`{calc_result['traversal_mode']}`, `{calc_result['tidal_regime']}`)\n"
            f"- **Root-Strainer Pinning Risk:** `{calc_result['root_strainer_pinning_risk_percent']}%` "
            f"(`{calc_result['root_morphology']}`, {calc_result['prop_root_density_stems_m2']} stems/m², "
            f"{calc_result['tidal_current_velocity_knots']} kt current)\n"
            f"- **Anoxic Mud Entrapment Probability:** `{calc_result['anoxic_mud_entrapment_probability']:.1%}` "
            f"({calc_result['water_depth_over_mud_cm']} cm water over {calc_result['anoxic_silt_sink_depth_cm']} cm silt)\n"
            f"- **Safe Ebb Exit Window:** `{calc_result['safe_ebb_exit_window_minutes']} min` "
            f"({calc_result['tide_stage_hours_to_low']} hr to low tide, {calc_result['canopy_closure_percent']}% canopy closure)\n\n"
            f"**Dendritic Wayfinding Protocol:** {calc_result['dendritic_wayfinding_protocol']}\n\n"
            f"**Oyster Armor & Strainer Advisory:** {calc_result['oyster_armor_and_strainer_advisory']}"
        )
        return answer, calc_info

    if params["site_id"]:
        site = get_mangrove_labyrinth_site_by_id(str(params["site_id"]))
        if site is not None:
            site_calc = calculate_mangrove_labyrinth_navigation(
                root_morphology=site["root_morphology"],
                tidal_regime=site["tidal_regime"],
                traversal_mode=site["traversal_mode"],
                prop_root_density_stems_m2=float(
                    site["prop_root_density_stems_m2"]
                ),
                tidal_current_velocity_knots=float(
                    site["typical_current_velocity_knots"]
                ),
                water_depth_over_mud_cm=float(
                    site["typical_water_depth_over_mud_cm"]
                ),
                anoxic_silt_sink_depth_cm=float(
                    site["anoxic_silt_sink_depth_cm"]
                ),
                canopy_closure_percent=float(site["canopy_closure_percent"]),
                tide_stage_hours_to_low=3.5,
            )
            lookup_info: dict[str, Any] = {
                "action": "mangrove_labyrinth_lookup",
                "site": dict(site),
                "baseline_calculation": dict(site_calc),
                "gear_checklist": [
                    dict(g) for g in get_mangrove_labyrinth_gear_checklist()
                ],
            }
            answer = (
                f"### {site['name']} ({site['region']})\n\n"
                f"- **Site ID:** `{site['id']}` (Elevation: {site['elevation_m']} m)\n"
                f"- **Root Morphology:** `{site['root_morphology']}` "
                f"(Density: {site['prop_root_density_stems_m2']} stems/m², Canopy Closure: {site['canopy_closure_percent']}%)\n"
                f"- **Tidal Creek Regime:** `{site['tidal_regime']}` "
                f"(Current: {site['typical_current_velocity_knots']} kt, Water Depth: {site['typical_water_depth_over_mud_cm']} cm, "
                f"Anoxic Silt Sink: {site['anoxic_silt_sink_depth_cm']} cm)\n"
                f"- **Recommended Traversal Mode:** `{site['traversal_mode']}`\n"
                f"- **Primary Hazard:** {site['primary_hazard']}\n"
                f"- **Dendritic Wayfinding & Exit Protocol:** {site['dendritic_wayfinding_and_exit_protocol']}\n"
                f"- **Field Notes:** {site['field_notes']}"
            )
            return answer, lookup_info

    sites_list = [dict(s) for s in get_all_mangrove_labyrinth_sites()]
    gear_list = [dict(g) for g in get_mangrove_labyrinth_gear_checklist()]
    general_info: dict[str, Any] = {
        "action": "mangrove_labyrinth_info",
        "sites": sites_list,
        "gear_checklist": gear_list,
    }
    site_bullets = "\n".join(
        f"- **{s['name']}** (`{s['id']}`, {s['region']}): `{s['root_morphology']}` / `{s['tidal_regime']}`"
        for s in sites_list
    )
    gear_bullets = "\n".join(
        f"- **{g['name']}** (`{g['category']}`): {g['rationale']}"
        for g in gear_list
    )
    answer = (
        "### Sub-Canopy Mangroves & Pneumatophore Prop-Root Tidal Labyrinth Navigation Guide\n\n"
        "Navigating estuarine mangrove canopy tunnels, Rhizophora prop-root arches, and Avicennia "
        "pneumatophore creek labyrinths requires timing high-slack water windows, logging multi-GNSS "
        "breadcrumbs beneath dense canopy closure, clipping retro-reflective junction markers at "
        "dendritic bifurcations, and wearing ANSI A5 Kevlar armor against oyster-encrusted roots.\n\n"
        "#### Curated Mangrove Labyrinth Reference Sites\n"
        f"{site_bullets}\n\n"
        "#### Mandatory 6-Item Mangrove Labyrinth Gear Checklist\n"
        f"{gear_bullets}"
    )
    return answer, general_info


def build_mangrove_labyrinth_prompt(query: str = "") -> str:
    """Build system prompt context for LLM augmentation on sub-canopy mangrove labyrinth topics."""
    answer, _ = format_mangrove_labyrinth_response(query)
    return (
        "You are an expert estuarine wetland geomorphologist and Sub-Canopy Mangrove & Pneumatophore Prop-Root Labyrinth Navigation specialist. "
        "Use the following prop-root strainer pinning, anoxic sulfidic mud entrapment, and dendritic ebb-window telemetry to answer the user's question:\n\n"
        f"{answer}"
    )
