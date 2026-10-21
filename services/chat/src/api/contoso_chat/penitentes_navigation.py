"""High-Alpine Snowfield Sun-Cup & Penitentes Crampon Navigation domain module."""

from __future__ import annotations

import re
from typing import Any, Literal

AblationMorphologyType = Literal[
    "shallow_parabolic_suncup_matrix",
    "deep_suncup_crest_labyrinth",
    "juvenile_micropenitente_serrations",
    "mature_cathedral_nieves_penitentes",
    "rotten_basal_moat_undercut_field",
]

CramponTraversalTechnique = Literal[
    "solar_azimuth_trough_corridor_gliding",
    "crest_ridge_step_bridging",
    "hybrid_frontpoint_stemming",
    "axe_belayed_blade_threading",
]

DiurnalFreezeState = Literal[
    "predawn_vitreous_lockup",
    "midmorning_crust_softening",
    "solar_noon_slush_collapse",
    "late_afternoon_isothermal_rot",
]

PenitentesSafetyStatus = Literal[
    "optimal_predawn_frozen_corridor",
    "caution_crampon_balling_and_ankle_torque",
    "abort_isothermal_blade_collapse",
]

VALID_ABLATION_MORPHOLOGIES: set[str] = {
    "shallow_parabolic_suncup_matrix",
    "deep_suncup_crest_labyrinth",
    "juvenile_micropenitente_serrations",
    "mature_cathedral_nieves_penitentes",
    "rotten_basal_moat_undercut_field",
}

VALID_CRAMPON_TECHNIQUES: set[str] = {
    "solar_azimuth_trough_corridor_gliding",
    "crest_ridge_step_bridging",
    "hybrid_frontpoint_stemming",
    "axe_belayed_blade_threading",
}

VALID_DIURNAL_FREEZE_STATES: set[str] = {
    "predawn_vitreous_lockup",
    "midmorning_crust_softening",
    "solar_noon_slush_collapse",
    "late_afternoon_isothermal_rot",
}

VALID_SAFETY_STATUSES: set[str] = {
    "optimal_predawn_frozen_corridor",
    "caution_crampon_balling_and_ankle_torque",
    "abort_isothermal_blade_collapse",
}


class PenitentesDict(dict[str, Any]):
    """Dictionary with attribute access and Pydantic-like model_dump helper."""

    def __getattr__(self, name: str) -> Any:
        try:
            return self[name]
        except KeyError as exc:
            raise AttributeError(name) from exc

    def model_dump(self) -> dict[str, Any]:
        return dict(self)


PENITENTES_SITES: list[PenitentesDict] = [
    PenitentesDict(
        id="aconcagua-polish-glacier-penitentes",
        site_id="aconcagua-polish-glacier-penitentes",
        name="Aconcagua Polish Glacier & Upper Guanacos Penitentes Labyrinth",
        title="Aconcagua Polish Glacier & Upper Guanacos Penitentes Labyrinth",
        region="Central Andes, Mendoza, Argentina",
        range="Central Andes",
        location="Central Andes, Mendoza, Argentina",
        ablation_morphology="mature_cathedral_nieves_penitentes",
        recommended_technique="axe_belayed_blade_threading",
        diurnal_freeze_state="predawn_vitreous_lockup",
        elevation=6150,
        elevation_m=6150,
        elevation_meters=6150,
        mean_blade_height_cm=185.0,
        trough_corridor_azimuth_deg=82.0,
        slope_angle_deg=34.0,
        description=(
            "High-altitude subtropic arid snowfield on Cerro Aconcagua where intense shortwave insolation "
            "and hyper-arid Zonda winds sculpt 1.85m cathedral ice blades oriented along an 82° east-northeast "
            "solar azimuth corridor."
        ),
        highlights=[
            "Cathedral-scale 185cm nieves penitentes blades aligned along the 82° solar azimuth",
            "Predawn vitreous lockup window (-18°C to -8°C) prior to midday basal moat softening",
            "Technical axe-belayed blade threading between overhanging sublimated ice fins at 6,150m",
        ],
    ),
    PenitentesDict(
        id="mount-rainier-muir-snowfield-suncups",
        site_id="mount-rainier-muir-snowfield-suncups",
        name="Mount Rainier Late-Summer Muir Snowfield Sun-Cup Matrix",
        title="Mount Rainier Late-Summer Muir Snowfield Sun-Cup Matrix",
        region="Cascade Range, Washington, USA",
        range="Cascade Range",
        location="Cascade Range, Washington, USA",
        ablation_morphology="deep_suncup_crest_labyrinth",
        recommended_technique="crest_ridge_step_bridging",
        diurnal_freeze_state="midmorning_crust_softening",
        elevation=2950,
        elevation_m=2950,
        elevation_meters=2950,
        mean_blade_height_cm=55.0,
        trough_corridor_azimuth_deg=98.0,
        slope_angle_deg=24.0,
        description=(
            "Expansive late-summer maritime névé between Panorama Point and Camp Muir featuring 55cm "
            "parabolic sun-cup bowls and wind-polished ablation crests requiring rhythmic crampon "
            "crest-ridge step-bridging."
        ),
        highlights=[
            "Deep 55cm parabolic sun-cup ablation bowls concentrating radiative glare",
            "Rhythmic crest-ridge step-bridging with dual FlickLock poles to prevent lateral ankle roll",
            "Rapid midmorning crust softening requiring active convex anti-balling plates underfoot",
        ],
    ),
    PenitentesDict(
        id="tupungato-high-puna-ice-pinnacles",
        site_id="tupungato-high-puna-ice-pinnacles",
        name="Volcán Tupungato High-Puna Cathedral Penitente Forest",
        title="Volcán Tupungato High-Puna Cathedral Penitente Forest",
        region="Dry Central Andes, Chile/Argentina Border",
        range="Dry Central Andes",
        location="Dry Central Andes, Chile/Argentina Border",
        ablation_morphology="mature_cathedral_nieves_penitentes",
        recommended_technique="hybrid_frontpoint_stemming",
        diurnal_freeze_state="predawn_vitreous_lockup",
        elevation=5800,
        elevation_m=5800,
        elevation_meters=5800,
        mean_blade_height_cm=240.0,
        trough_corridor_azimuth_deg=78.0,
        slope_angle_deg=31.0,
        description=(
            "Monumental 2.4m nieves penitentes ice pinnacles formed by differential sublimation in the "
            "sub-zero dewpoint atmosphere of the High Puna, demanding hybrid frontpoint stemming across "
            "narrow vitreous troughs."
        ),
        highlights=[
            "Towering 240cm sublimated ice pinnacles casting deep labyrinthine shadow corridors",
            "Hybrid frontpoint stemming and opposing crampon chimney technique across constricted troughs",
            "Hardshell Kevlar-padded shin armor mandatory against razor-sharp micropenitente serrations",
        ],
    ),
    PenitentesDict(
        id="mount-shasta-avalanche-gulch-suncups",
        site_id="mount-shasta-avalanche-gulch-suncups",
        name="Mount Shasta Avalanche Gulch & Red Banks Sun-Cup Troughs",
        title="Mount Shasta Avalanche Gulch & Red Banks Sun-Cup Troughs",
        region="Southern Cascades, California, USA",
        range="Southern Cascades",
        location="Southern Cascades, California, USA",
        ablation_morphology="shallow_parabolic_suncup_matrix",
        recommended_technique="solar_azimuth_trough_corridor_gliding",
        diurnal_freeze_state="midmorning_crust_softening",
        elevation=3650,
        elevation_m=3650,
        elevation_meters=3650,
        mean_blade_height_cm=38.0,
        trough_corridor_azimuth_deg=105.0,
        slope_angle_deg=32.0,
        description=(
            "Steep 32° volcanic snowfield beneath the Red Banks headwall where diurnal melt-freeze cycles "
            "carve aligned 38cm sun-cup troughs suited to midmorning solar-azimuth trough corridor gliding."
        ),
        highlights=[
            "Aligned 105° east-southeast sun-cup trough corridors below Lake Helen and Red Banks",
            "Efficient diagonal switchback tacking along solar azimuth channels to conserve calf energy",
            "Mandatory alpine start prior to rockfall release from heated volcanic dacite cliffs",
        ],
    ),
    PenitentesDict(
        id="khumbu-lobuche-east-ablation-spires",
        site_id="khumbu-lobuche-east-ablation-spires",
        name="Khumbu Glacier & Lobuche East High-Camp Ablation Spires",
        title="Khumbu Glacier & Lobuche East High-Camp Ablation Spires",
        region="Mahalangur Himal, Nepal",
        range="Mahalangur Himal",
        location="Mahalangur Himal, Nepal",
        ablation_morphology="rotten_basal_moat_undercut_field",
        recommended_technique="axe_belayed_blade_threading",
        diurnal_freeze_state="solar_noon_slush_collapse",
        elevation=5450,
        elevation_m=5450,
        elevation_meters=5450,
        mean_blade_height_cm=130.0,
        trough_corridor_azimuth_deg=88.0,
        slope_angle_deg=29.0,
        description=(
            "High-altitude Himalayan ablation zone where intense pre-monsoon insolation and dark cryoconite "
            "dust undercut 1.3m ice spires over water-saturated basal moats prone to midday collapse."
        ),
        highlights=[
            "Cryoconite-undercut 130cm ablation spires above hollow meltwater basal moats",
            "Severe solar noon slush collapse hazard requiring strict predawn completion before 10:30 local",
            "Continuous ice-axe shaft probing of trough floors prior to committing full pack weight",
        ],
    ),
]

PENITENTES_GEAR_CHECKLIST: list[PenitentesDict] = [
    PenitentesDict(
        id="chromoly-12-point-mountaineering-crampons-antibot",
        item_id="chromoly-12-point-mountaineering-crampons-antibot",
        name="Chromoly 12-Point Mountaineering Crampons with Dual-Density Antibot Plates",
        category="crampon_traction",
        mandatory=True,
        description=(
            "Rigid chromoly steel 12-point crampons equipped with active convex polymer anti-balling plates "
            "to shed wet midday snow and maintain frontpoint bite on vitreous penitente walls."
        ),
        purpose=(
            "Prevents dangerous snow balling underfoot during midmorning crust softening and delivers "
            "secure horizontal frontpoint purchase when stemming across sublimated ice troughs."
        ),
    ),
    PenitentesDict(
        id="hardshell-kevlar-padded-shin-gaiters",
        item_id="hardshell-kevlar-padded-shin-gaiters",
        name="Hardshell Kevlar-Reinforced Padded Alpine Shin Gaiters",
        category="lower_limb_armor",
        mandatory=True,
        description=(
            "Abrasion-proof Kevlar outer gaiters with closed-cell EVA shin armor to shield tibias and "
            "calves from razor-sharp sublimated penitente serrations and crampon cross-tagging."
        ),
        purpose=(
            "Protects lower limbs from lacerations and bruising when threading narrow 35-60cm penitente "
            "corridors and prevents meltwater slush ingress during basal moat punch-through."
        ),
    ),
    PenitentesDict(
        id="curved-shaft-technical-alpine-ice-axe",
        item_id="curved-shaft-technical-alpine-ice-axe",
        name="Curved-Shaft Technical Alpine Ice Axe with Forged Steel Adze",
        category="ice_axe_arrest",
        mandatory=True,
        description=(
            "T-rated curved-shaft mountaineering axe with an aggressive steel adze for chopping brittle "
            "penitente blade tips, sounding hollow basal moats, and executing third-point cane belays."
        ),
        purpose=(
            "Clears overhanging ice pinnacles blocking chest-level passage, probes undercut trough floors, "
            "and provides immediate self-arrest security on 25-40° sun-cupped slopes."
        ),
    ),
    PenitentesDict(
        id="dual-flicklock-alpine-poles-snow-baskets",
        item_id="dual-flicklock-alpine-poles-snow-baskets",
        name="Dual FlickLock Carbon-Aluminum Alpine Poles with 85mm Powder Baskets",
        category="crampon_traction",
        mandatory=True,
        description=(
            "Heavy-duty telescoping poles with carbide tips and 85mm articulated snow baskets to counteract "
            "lateral ankle torque while crest-ridge step-bridging across deep sun-cup bowls."
        ),
        purpose=(
            "Stabilizes center of mass when stepping from sun-cup rim to rim and reduces eccentric quadriceps "
            "and ankle ligament strain under heavy expedition pack loads."
        ),
    ),
    PenitentesDict(
        id="category-4-glacier-goggles-nose-guard",
        item_id="category-4-glacier-goggles-nose-guard",
        name="Category 4 High-Altitude Glacier Goggles with Leather Side Shields & Nose Guard",
        category="solar_glare_protection",
        mandatory=True,
        description=(
            "5% VLT Category 4 polycarbonate optics with removable side shields and UV nose beak to prevent "
            "photokeratitis inside high-albedo parabolic sun-cup and penitente reflection traps."
        ),
        purpose=(
            "Blocks multi-directional shortwave UV reflections focused by concave sun-cup bowls and vertical "
            "nieves penitentes ice mirrors above 3,500m."
        ),
    ),
    PenitentesDict(
        id="high-ankle-stiff-shank-mountaineering-boots",
        item_id="high-ankle-stiff-shank-mountaineering-boots",
        name="High-Ankle Full-Shank Insulated Mountaineering Boots (B2/B3 Rated)",
        category="lower_limb_armor",
        mandatory=True,
        description=(
            "Carbon-composite full-shank insulated mountaineering boots providing torsional ankle rigidity "
            "when edging across uneven sun-cup rims and stemming between penitente spires."
        ),
        purpose=(
            "Prevents subtalar ankle inversion sprains on cambered ablation ridges and supports rigid "
            "step-in crampon bindings during prolonged frontpoint stemming."
        ),
    ),
]


def get_all_penitentes_sites() -> list[PenitentesDict]:
    """Return all 5 curated high-alpine sun-cup and penitentes navigation sites."""
    return [PenitentesDict(site) for site in PENITENTES_SITES]


def get_penitentes_site_by_id(site_id: str) -> PenitentesDict | None:
    """Return a single penitentes site by ID, or None if not found."""
    if not site_id:
        return None
    norm = site_id.strip().lower()
    for site in PENITENTES_SITES:
        if site["id"].lower() == norm:
            return PenitentesDict(site)
    return None


def filter_penitentes_sites(
    ablation_morphology: str | None = None,
    recommended_technique: str | None = None,
    diurnal_freeze_state: str | None = None,
) -> list[PenitentesDict]:
    """Filter penitentes sites by morphology, traversal technique, and/or diurnal freeze state."""
    if ablation_morphology is not None and ablation_morphology not in VALID_ABLATION_MORPHOLOGIES:
        raise ValueError(
            f"Invalid ablation_morphology '{ablation_morphology}'. Must be one of {sorted(VALID_ABLATION_MORPHOLOGIES)}"
        )
    if recommended_technique is not None and recommended_technique not in VALID_CRAMPON_TECHNIQUES:
        raise ValueError(
            f"Invalid recommended_technique '{recommended_technique}'. Must be one of {sorted(VALID_CRAMPON_TECHNIQUES)}"
        )
    if diurnal_freeze_state is not None and diurnal_freeze_state not in VALID_DIURNAL_FREEZE_STATES:
        raise ValueError(
            f"Invalid diurnal_freeze_state '{diurnal_freeze_state}'. Must be one of {sorted(VALID_DIURNAL_FREEZE_STATES)}"
        )

    results = get_all_penitentes_sites()
    if ablation_morphology is not None:
        results = [s for s in results if s["ablation_morphology"] == ablation_morphology]
    if recommended_technique is not None:
        results = [s for s in results if s["recommended_technique"] == recommended_technique]
    if diurnal_freeze_state is not None:
        results = [s for s in results if s["diurnal_freeze_state"] == diurnal_freeze_state]
    return results


def get_penitentes_gear_checklist() -> list[PenitentesDict]:
    """Return the 6 mandatory gear items for sun-cup and penitentes crampon navigation."""
    return [PenitentesDict(item) for item in PENITENTES_GEAR_CHECKLIST]


def calculate_penitentes_navigation_dynamics(
    blade_height_cm: float | Any = 120.0,
    trough_spacing_cm: float = 65.0,
    slope_angle_deg: float = 28.0,
    snow_surface_temp_c: float = -6.0,
    solar_irradiance_wm2: float = 350.0,
    pack_weight_kg: float = 16.0,
    ablation_morphology: str = "mature_cathedral_nieves_penitentes",
    recommended_technique: str = "axe_belayed_blade_threading",
    diurnal_freeze_state: str = "predawn_vitreous_lockup",
    site_id: str | None = None,
) -> PenitentesDict:
    """Calculate high-alpine sun-cup & penitentes crampon navigation telemetry and safety status."""
    if hasattr(blade_height_cm, "model_dump"):
        payload = blade_height_cm.model_dump()
        return calculate_penitentes_navigation_dynamics(**payload)
    if isinstance(blade_height_cm, dict):
        return calculate_penitentes_navigation_dynamics(**blade_height_cm)

    bh = float(blade_height_cm)
    ts = float(trough_spacing_cm)
    sa = float(slope_angle_deg)
    st = float(snow_surface_temp_c)
    si = float(solar_irradiance_wm2)
    pw = float(pack_weight_kg)

    if not (5.0 <= bh <= 400.0):
        raise ValueError(f"blade_height_cm must be between 5 and 400 (got {bh})")
    if not (10.0 <= ts <= 250.0):
        raise ValueError(f"trough_spacing_cm must be between 10 and 250 (got {ts})")
    if not (0.0 <= sa <= 65.0):
        raise ValueError(f"slope_angle_deg must be between 0 and 65 (got {sa})")
    if not (-45.0 <= st <= 15.0):
        raise ValueError(f"snow_surface_temp_c must be between -45 and 15 (got {st})")
    if not (0.0 <= si <= 1600.0):
        raise ValueError(f"solar_irradiance_wm2 must be between 0 and 1600 (got {si})")
    if not (0.0 <= pw <= 55.0):
        raise ValueError(f"pack_weight_kg must be between 0 and 55 (got {pw})")

    if ablation_morphology not in VALID_ABLATION_MORPHOLOGIES:
        raise ValueError(f"Invalid ablation_morphology '{ablation_morphology}'")
    if recommended_technique not in VALID_CRAMPON_TECHNIQUES:
        raise ValueError(f"Invalid recommended_technique '{recommended_technique}'")
    if diurnal_freeze_state not in VALID_DIURNAL_FREEZE_STATES:
        raise ValueError(f"Invalid diurnal_freeze_state '{diurnal_freeze_state}'")

    # 1. Effective Horizontal Pace (m/hr)
    base_pace = 490.0
    blade_penalty = bh * 0.68
    trough_constriction_penalty = max(0.0, (75.0 - ts) * 1.45)
    slope_penalty = sa * 3.1
    pack_penalty = pw * 2.2
    thermal_slush_penalty = max(0.0, (st + 3.0) * 13.5) + (si / 1600.0) * 48.0
    effective_horizontal_pace_mhr = round(
        max(
            45.0,
            min(
                650.0,
                base_pace
                - blade_penalty
                - trough_constriction_penalty
                - slope_penalty
                - pack_penalty
                - thermal_slush_penalty,
            ),
        ),
        1,
    )

    # 2. Caloric Energy Multiplier (relative to flat consolidated firn)
    raw_caloric = (
        1.18
        + (bh / 140.0) * 0.68
        + (sa / 35.0) * 0.56
        + (pw / 25.0) * 0.48
        + (0.52 if st > -1.5 else 0.0)
        + (0.34 if ts < 50.0 else 0.0)
        + (si / 1600.0) * 0.42
    )
    caloric_energy_multiplier = round(max(1.1, min(4.8, raw_caloric)), 2)

    # 3. Crampon Antibot Balling Risk (%)
    if st < -8.0:
        temp_balling = 6.0
    elif st < -3.0:
        temp_balling = 14.0 + (st + 8.0) * 3.2
    else:
        temp_balling = 32.0 + max(0.0, (st + 3.0) * 4.8)

    solar_balling = (si / 1600.0) * 36.0
    state_balling = (
        18.0
        if diurnal_freeze_state
        in ("solar_noon_slush_collapse", "late_afternoon_isothermal_rot")
        else (10.0 if diurnal_freeze_state == "midmorning_crust_softening" else 0.0)
    )
    crampon_antibot_balling_risk_percent = round(
        max(2.0, min(99.0, temp_balling + solar_balling + state_balling)), 1
    )

    # 4. Blade & Basal Moat Collapse Probability (0.01 to 0.99)
    temp_collapse = max(0.0, (st + 10.0) / 25.0) * 0.38
    solar_collapse = (si / 1600.0) * 0.28
    height_collapse = (bh / 400.0) * 0.22
    if ablation_morphology == "rotten_basal_moat_undercut_field":
        morph_collapse = 0.22
    elif ablation_morphology == "mature_cathedral_nieves_penitentes":
        morph_collapse = 0.10
    elif ablation_morphology == "deep_suncup_crest_labyrinth":
        morph_collapse = 0.06
    else:
        morph_collapse = 0.04

    if diurnal_freeze_state in (
        "solar_noon_slush_collapse",
        "late_afternoon_isothermal_rot",
    ):
        state_collapse = 0.20
    elif diurnal_freeze_state == "midmorning_crust_softening":
        state_collapse = 0.08
    else:
        state_collapse = 0.0

    blade_moat_collapse_probability = round(
        max(
            0.01,
            min(
                0.99,
                temp_collapse
                + solar_collapse
                + height_collapse
                + morph_collapse
                + state_collapse,
            ),
        ),
        3,
    )

    # 5. Safety Status & Protocols
    safety_status: PenitentesSafetyStatus
    if (
        blade_moat_collapse_probability >= 0.62
        or crampon_antibot_balling_risk_percent >= 74.0
        or (st >= 2.5 and si >= 950.0)
        or diurnal_freeze_state
        in ("solar_noon_slush_collapse", "late_afternoon_isothermal_rot")
    ):
        safety_status = "abort_isothermal_blade_collapse"
        solar_azimuth_routing_protocol = (
            "ABORT PENITENTES TRAVERSE: Isothermal melt and intense shortwave insolation have hollowed "
            "basal moats and destabilized ice spires. Retreat immediately along consolidated moraine ribs "
            "or establish a shaded bivouac until nocturnal radiative refreeze."
        )
        ankle_torque_and_shin_armor_advisory = (
            "CRITICAL LOWER-LIMB ENTRAPMENT & BALLING HAZARD: Wet isothermal slush causes severe crampon "
            "balling and sudden thigh-deep punch-through into undercut moats where toppling 100kg+ ice "
            "blades can shear ankles or pin tibias."
        )
    elif (
        blade_moat_collapse_probability >= 0.30
        or crampon_antibot_balling_risk_percent >= 35.0
        or st >= -2.0
        or si >= 600.0
        or diurnal_freeze_state == "midmorning_crust_softening"
    ):
        safety_status = "caution_crampon_balling_and_ankle_torque"
        solar_azimuth_routing_protocol = (
            "CAUTION SOLAR-AZIMUTH TACKING PROTOCOL: Align ascent lines parallel to east-west solar "
            "trough corridors (~80°–105° azimuth) and switchback across low saddle gaps rather than "
            "forcing perpendicular cross-grain step-overs across softening ablation walls."
        )
        ankle_torque_and_shin_armor_advisory = (
            "MODERATE ANKLE TORQUE & ANTIBOT ADVISORY: Tap crampon frames with ice axe shaft every "
            "15–20 paces to clear cohesive snow build-up from antibot plates, lock B2/B3 boot cuffs, "
            "and wear Kevlar-padded shin gaiters against serrated blade rims."
        )
    else:
        safety_status = "optimal_predawn_frozen_corridor"
        solar_azimuth_routing_protocol = (
            "OPTIMAL PREDAWN VITREOUS CORRIDOR PROTOCOL: Capitalize on sub-freezing nocturnal radiative "
            "lockup to glide through hard-frozen solar azimuth trough floors or execute secure frontpoint "
            "stemming and crest-ridge step-bridging with minimal postholing."
        )
        ankle_torque_and_shin_armor_advisory = (
            "NOMINAL RIGID-CRAMPON BIOMECHANICS: Maintain shoulder-width stance with dual FlickLock poles "
            "or third-point ice axe cane support; engage Kevlar shin armor when threading narrow "
            "cathedral penitente fins."
        )

    return PenitentesDict(
        effective_horizontal_pace_mhr=effective_horizontal_pace_mhr,
        caloric_energy_multiplier=caloric_energy_multiplier,
        crampon_antibot_balling_risk_percent=crampon_antibot_balling_risk_percent,
        blade_moat_collapse_probability=blade_moat_collapse_probability,
        safety_status=safety_status,
        solar_azimuth_routing_protocol=solar_azimuth_routing_protocol,
        ankle_torque_and_shin_armor_advisory=ankle_torque_and_shin_armor_advisory,
        blade_height_cm=bh,
        trough_spacing_cm=ts,
        slope_angle_deg=sa,
        snow_surface_temp_c=st,
        solar_irradiance_wm2=si,
        pack_weight_kg=pw,
        ablation_morphology=ablation_morphology,
        recommended_technique=recommended_technique,
        diurnal_freeze_state=diurnal_freeze_state,
        site_id=site_id,
    )


def is_penitentes_navigation_query(query: str) -> bool:
    """Detect whether a user query is about high-alpine sun-cup & penitentes crampon navigation."""
    if not query or not query.strip():
        return False

    q = query.lower().strip()

    ecommerce_exclusions = (
        "order #",
        "refund",
        "return label",
        "shipping tracking",
        "salar",
        "halite",
        "pressure ridge",
        "pressure-ridge",
        "brine eye",
        "brine pool",
        "mirabilite",
        "cono de arita",
        "arizaro",
        "atacama",
        "chalviri",
        "uyuni",
        "ojos del salar",
    )
    if any(ex in q for ex in ecommerce_exclusions):
        return False

    penitentes_keywords = (
        "penitentes",
        "penitente",
        "nieves penitentes",
        "micropenitente",
        "sun-cup",
        "suncup",
        "sun cup",
        "sun-cups",
        "suncups",
        "sun cups",
        "ablation blade",
        "ablation blades",
        "ablation spire",
        "ablation spires",
        "ablation morphology",
        "trough corridor",
        "crest-ridge step-bridging",
        "crest ridge step bridging",
        "blade threading",
        "basal moat",
        "aconcagua-polish-glacier-penitentes",
        "mount-rainier-muir-snowfield-suncups",
        "tupungato-high-puna-ice-pinnacles",
        "mount-shasta-avalanche-gulch-suncups",
        "khumbu-lobuche-east-ablation-spires",
        "polish glacier",
        "upper guanacos",
        "tupungato",
        "lobuche east",
        "aconcagua",
    )
    return any(kw in q for kw in penitentes_keywords)


detect_penitentes_navigation_intent = is_penitentes_navigation_query


def extract_penitentes_navigation_params(query: str) -> dict[str, Any]:
    """Extract site_id, environmental parameters, and intent flags from a natural-language query."""
    q = (query or "").lower().strip()

    matched_site: PenitentesDict | None = None
    if "aconcagua" in q or "polish glacier" in q or "guanacos" in q:
        matched_site = get_penitentes_site_by_id("aconcagua-polish-glacier-penitentes")
    elif "tupungato" in q or "high-puna" in q or "high puna" in q:
        matched_site = get_penitentes_site_by_id("tupungato-high-puna-ice-pinnacles")
    elif "lobuche" in q or ("khumbu" in q and ("spire" in q or "ablation" in q or "penitente" in q or "moat" in q)):
        matched_site = get_penitentes_site_by_id("khumbu-lobuche-east-ablation-spires")
    elif "rainier" in q or "muir" in q:
        matched_site = get_penitentes_site_by_id("mount-rainier-muir-snowfield-suncups")
    elif "shasta" in q or "avalanche gulch" in q or "red banks" in q:
        matched_site = get_penitentes_site_by_id("mount-shasta-avalanche-gulch-suncups")
    else:
        for site in PENITENTES_SITES:
            if site["id"] in q:
                matched_site = get_penitentes_site_by_id(site["id"])
                break

    blade_height_cm = matched_site["mean_blade_height_cm"] if matched_site else 120.0
    trough_spacing_cm = 60.0
    slope_angle_deg = matched_site["slope_angle_deg"] if matched_site else 28.0
    snow_surface_temp_c = -6.0
    solar_irradiance_wm2 = 300.0
    pack_weight_kg = 16.0
    ablation_morphology = (
        matched_site["ablation_morphology"]
        if matched_site
        else "mature_cathedral_nieves_penitentes"
    )
    recommended_technique = (
        matched_site["recommended_technique"]
        if matched_site
        else "axe_belayed_blade_threading"
    )
    diurnal_freeze_state = (
        matched_site["diurnal_freeze_state"]
        if matched_site
        else "predawn_vitreous_lockup"
    )

    m_blade = re.search(
        r"(?:blade\s*height|blade|height|spires?|suncups?)\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*cm",
        q,
    )
    if m_blade:
        blade_height_cm = max(5.0, min(400.0, float(m_blade.group(1))))

    m_trough = re.search(
        r"(?:trough\s*spacing|spacing|trough|corridor)\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*cm",
        q,
    )
    if m_trough:
        trough_spacing_cm = max(10.0, min(250.0, float(m_trough.group(1))))

    m_slope = re.search(
        r"(?:slope\s*angle|slope|angle|grade)\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*(?:deg|degrees|°)?",
        q,
    )
    if m_slope:
        slope_angle_deg = max(0.0, min(65.0, float(m_slope.group(1))))

    m_temp = re.search(
        r"(?:temp|temperature|surface\s*temp)\s*(?:of|=|:)?\s*(-?\d+(?:\.\d+)?)\s*°?\s*c\b",
        q,
    ) or re.search(r"(-?\d+(?:\.\d+)?)\s*°?\s*c\b", q)
    if m_temp:
        snow_surface_temp_c = max(-45.0, min(15.0, float(m_temp.group(1))))

    m_solar = re.search(
        r"(?:solar\s*irradiance|irradiance|solar)\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*(?:w/m2|wm2|w/m²)?",
        q,
    ) or re.search(r"(\d+(?:\.\d+)?)\s*(?:w/m2|wm2|w/m²)", q)
    if m_solar:
        solar_irradiance_wm2 = max(0.0, min(1600.0, float(m_solar.group(1))))

    m_pack = re.search(
        r"(?:pack\s*weight|pack|load)\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*kg",
        q,
    ) or re.search(r"(\d+(?:\.\d+)?)\s*kg", q)
    if m_pack:
        pack_weight_kg = max(0.0, min(55.0, float(m_pack.group(1))))

    for morph in VALID_ABLATION_MORPHOLOGIES:
        if morph in q:
            ablation_morphology = morph
            break

    for tech in VALID_CRAMPON_TECHNIQUES:
        if tech in q:
            recommended_technique = tech
            break

    for freeze in VALID_DIURNAL_FREEZE_STATES:
        if freeze in q:
            diurnal_freeze_state = freeze
            break

    calc_triggers = (
        "calculate",
        "calculation",
        "compute",
        "pace",
        "caloric",
        "balling risk",
        "collapse probability",
        "blade height",
        "trough spacing",
        "irradiance",
        "w/m2",
        "wm2",
        "dynamics",
    )
    has_numeric_input = any(
        m is not None for m in (m_blade, m_trough, m_slope, m_temp, m_solar, m_pack)
    )
    is_calculation = any(t in q for t in calc_triggers) or has_numeric_input

    params: dict[str, Any] = {
        "site_id": matched_site["id"] if matched_site else None,
        "blade_height_cm": blade_height_cm,
        "trough_spacing_cm": trough_spacing_cm,
        "slope_angle_deg": slope_angle_deg,
        "snow_surface_temp_c": snow_surface_temp_c,
        "solar_irradiance_wm2": solar_irradiance_wm2,
        "pack_weight_kg": pack_weight_kg,
        "ablation_morphology": ablation_morphology,
        "recommended_technique": recommended_technique,
        "diurnal_freeze_state": diurnal_freeze_state,
        "is_calculation": is_calculation,
    }
    return params


def format_penitentes_navigation_response(query: str) -> tuple[str, dict[str, Any]]:
    """Format a conversational response and structured metadata dictionary for penitentes queries."""
    params = extract_penitentes_navigation_params(query)
    matched_site = (
        get_penitentes_site_by_id(params["site_id"]) if params.get("site_id") else None
    )
    gear_checklist = get_penitentes_gear_checklist()

    if params.get("is_calculation"):
        calc_res = calculate_penitentes_navigation_dynamics(
            blade_height_cm=params["blade_height_cm"],
            trough_spacing_cm=params["trough_spacing_cm"],
            slope_angle_deg=params["slope_angle_deg"],
            snow_surface_temp_c=params["snow_surface_temp_c"],
            solar_irradiance_wm2=params["solar_irradiance_wm2"],
            pack_weight_kg=params["pack_weight_kg"],
            ablation_morphology=params["ablation_morphology"],
            recommended_technique=params["recommended_technique"],
            diurnal_freeze_state=params["diurnal_freeze_state"],
            site_id=params.get("site_id"),
        )
        site_label = (
            f" at {matched_site['name']}" if matched_site else " for High-Alpine Penitentes Field"
        )
        response_text = (
            f"Penitentes & Sun-Cup Crampon Navigation Analysis{site_label}: "
            f"Effective Horizontal Pace: {calc_res['effective_horizontal_pace_mhr']} m/hr | "
            f"Caloric Energy Multiplier: {calc_res['caloric_energy_multiplier']}x | "
            f"Crampon Antibot Balling Risk: {calc_res['crampon_antibot_balling_risk_percent']}% | "
            f"Blade/Moat Collapse Probability: {calc_res['blade_moat_collapse_probability']} | "
            f"Safety Status: {calc_res['safety_status']}. "
            f"{calc_res['solar_azimuth_routing_protocol']} "
            f"{calc_res['ankle_torque_and_shin_armor_advisory']}"
        )
        calc_info: dict[str, Any] = {
            "action": "penitentes_navigation_calculated",
            "site": dict(matched_site) if matched_site else None,
            "site_id": matched_site["id"] if matched_site else None,
            "params": params,
            "calculation": dict(calc_res),
            "effective_horizontal_pace_mhr": calc_res["effective_horizontal_pace_mhr"],
            "caloric_energy_multiplier": calc_res["caloric_energy_multiplier"],
            "crampon_antibot_balling_risk_percent": calc_res[
                "crampon_antibot_balling_risk_percent"
            ],
            "blade_moat_collapse_probability": calc_res["blade_moat_collapse_probability"],
            "safety_status": calc_res["safety_status"],
            "solar_azimuth_routing_protocol": calc_res["solar_azimuth_routing_protocol"],
            "ankle_torque_and_shin_armor_advisory": calc_res[
                "ankle_torque_and_shin_armor_advisory"
            ],
            "gear_checklist": [dict(g) for g in gear_checklist],
        }
        return response_text, calc_info

    if matched_site is not None:
        highlights_str = "; ".join(matched_site["highlights"])
        response_text = (
            f"{matched_site['name']} ({matched_site['region']}) — Elevation: {matched_site['elevation_m']}m | "
            f"Morphology: {matched_site['ablation_morphology']} | "
            f"Recommended Technique: {matched_site['recommended_technique']} | "
            f"Diurnal Freeze State: {matched_site['diurnal_freeze_state']} | "
            f"Mean Blade Height: {matched_site['mean_blade_height_cm']} cm | "
            f"Trough Azimuth: {matched_site['trough_corridor_azimuth_deg']}° | "
            f"Slope Angle: {matched_site['slope_angle_deg']}°. "
            f"{matched_site['description']} Key Highlights: {highlights_str}."
        )
        lookup_info: dict[str, Any] = {
            "action": "penitentes_navigation_lookup",
            "site": dict(matched_site),
            "site_id": matched_site["id"],
            "sites": [dict(matched_site)],
            "gear_checklist": [dict(g) for g in gear_checklist],
        }
        return response_text, lookup_info

    all_sites = get_all_penitentes_sites()
    sites_summary = "; ".join(
        f"{s['name']} ({s['region']}, {s['elevation_m']}m, {s['mean_blade_height_cm']}cm blades)"
        for s in all_sites
    )
    gear_summary = ", ".join(g["name"] for g in gear_checklist)
    response_text = (
        f"High-Alpine Snowfield Sun-Cup & Penitentes Crampon Navigation Guide ({len(all_sites)} curated sites): "
        f"{sites_summary}. Mandatory 6-item gear checklist: {gear_summary}. "
        "Route along east-west solar azimuth trough corridors during predawn vitreous lockup to avoid midday isothermal basal moat collapse."
    )
    general_info: dict[str, Any] = {
        "action": "penitentes_navigation_info",
        "sites": [dict(s) for s in all_sites],
        "gear_checklist": [dict(g) for g in gear_checklist],
        "mandatory_count": len(gear_checklist),
    }
    return response_text, general_info


def build_penitentes_navigation_prompt(query: str = "") -> str:
    """Build system prompt context for high-alpine sun-cup and penitentes crampon navigation."""
    _, info = format_penitentes_navigation_response(query)
    lines = [
        "High-Alpine Snowfield Sun-Cup & Penitentes Crampon Navigation Guidance:",
        "- Differential Sublimation & Solar Azimuth Corridors: Nieves penitentes and deep parabolic sun-cups form under high shortwave solar irradiance and low dewpoint humidity, aligning their trough corridors parallel to the solar arc (~78°–105° azimuth).",
        "- Crampon Traversal Techniques: Use solar_azimuth_trough_corridor_gliding in shallow aligned troughs, crest_ridge_step_bridging across deep sun-cup rims, hybrid_frontpoint_stemming in wide vitreous pinnacles, and axe_belayed_blade_threading through cathedral penitente labyrinths.",
        "- Diurnal Freeze Window: Traverse during predawn_vitreous_lockup; exercise caution during midmorning_crust_softening (antibot balling and ankle torque); abort during solar_noon_slush_collapse or late_afternoon_isothermal_rot when undercut basal moats and 1.5–2.4m ice blades collapse.",
        "- Mandatory 6-Item Gear Checklist: Chromoly 12-point crampons with antibot plates, Hardshell Kevlar-padded shin gaiters, Curved-shaft technical alpine ice axe, Dual FlickLock alpine poles with snow baskets, Category 4 glacier goggles with nose guard, and High-ankle stiff-shank mountaineering boots.",
    ]
    if info.get("site"):
        site = info["site"]
        lines.append(
            f"- Focused Site: {site['name']} ({site['region']}, {site['elevation_m']}m, morphology={site['ablation_morphology']}, technique={site['recommended_technique']}, freeze_state={site['diurnal_freeze_state']}, blade_height={site['mean_blade_height_cm']}cm)"
        )
    if info.get("calculation"):
        calc = info["calculation"]
        lines.append(
            f"- Calculated Telemetry: Pace={calc['effective_horizontal_pace_mhr']} m/hr, Caloric Multiplier={calc['caloric_energy_multiplier']}x, Balling Risk={calc['crampon_antibot_balling_risk_percent']}%, Collapse Probability={calc['blade_moat_collapse_probability']}, Status={calc['safety_status']}"
        )
    return "\n".join(lines)
