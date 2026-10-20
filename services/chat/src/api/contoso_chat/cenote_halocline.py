"""Subterranean Cenote Halocline & Anchialine Phreatic Cave-Passage Navigation Guide.

Provides deterministic halocline refractive Schlieren blur modeling, tannic and clay-silt
post-mix visibility decay, fresh-to-saltwater buoyancy trim shifts, Rule-of-Thirds gas
reserve calculations, meromictic hydrogen-sulfide (H2S) chemocline advisories, curated
anchialine cenote & blue-hole sites, and specialized cave-diving gear checklists for
Contoso Outdoor Company customers.
"""

from __future__ import annotations

import re
from collections.abc import Generator
from typing import Any


class _AttrDict(dict[str, Any]):
    """Dictionary supporting both key and attribute access."""

    def __getattr__(self, key: str) -> Any:
        try:
            return self[key]
        except KeyError as exc:
            raise AttributeError(key) from exc


CENOTE_HALOCLINE_SITES: list[_AttrDict] = [
    _AttrDict(
        {
            "id": "ox-bel-ha-halocline-tulum-mexico",
            "name": "Sistema Ox Bel Ha Anchialine Halocline Labyrinth",
            "country": "Mexico",
            "region": "Tulum Karst Plain, Quintana Roo (Yucatán Peninsula)",
            "depth_range": "6-35 m (20-115 ft)",
            "max_depth_m": 35,
            "morphology": "anchialine-halocline-conduit",
            "difficulty": "extreme",
            "default_salinity_delta_ppt": 32.0,
            "default_tannic_doc_mg_l": 18.0,
            "default_silt_clay_fraction_pct": 68.0,
            "default_penetration_distance_m": 650.0,
            "default_h2s_concentration_ppm": 6.0,
            "primary_hazard": (
                "Severe refractive Schlieren optical blur at the 12-15 m fresh-to-marine "
                "halocline interface, complex dendritic T-junctions, and ultra-fine authigenic "
                "calcite/montmorillonite clay silt-outs."
            ),
            "routing_strategy": (
                "Establish continuous tactile guideline contact before crossing the halocline "
                "interface; place directional line arrows and personal non-directional cookies "
                "at every T-junction and jump."
            ),
            "navigation_protocol": (
                "Hover 1.0 m above the halocline pycnocline or drop cleanly into the clear "
                "marine water wedge below; use anti-silting frog kicks and vent 1.5-2.5 kg of "
                "wing gas when descending from the meteoric freshwater lens into dense seawater."
            ),
            "progression_protocol": (
                "Tactile Guideline Contact & Pycnocline Stratum Hovering with Dual Jump Spools"
            ),
            "field_notes": (
                "One of the longest underwater cave systems on Earth (>430 km surveyed), where "
                "coastal mangrove tannins and sharp 32 ppt density gradients create disorienting "
                "vaseline-like optical distortion when fin wash mixes the boundary layer."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "angelita-h2s-cloud-tulum-mexico",
            "name": "Cenote Angelita Meromictic Hydrogen-Sulfide Cloud Shaft",
            "country": "Mexico",
            "region": "Southern Tulum Jungle Karst, Quintana Roo (Yucatán Peninsula)",
            "depth_range": "15-60 m (49-197 ft)",
            "max_depth_m": 60,
            "morphology": "meromictic-h2s-cloud-bell-sinkhole",
            "difficulty": "challenging",
            "default_salinity_delta_ppt": 29.0,
            "default_tannic_doc_mg_l": 26.0,
            "default_silt_clay_fraction_pct": 52.0,
            "default_penetration_distance_m": 120.0,
            "default_h2s_concentration_ppm": 38.0,
            "primary_hazard": (
                "Dense meromictic hydrogen-sulfide (H2S) chemocline cloud at 28-31 m with "
                "zero-visibility necrotic organic suspension, trans-dermal H2S absorption, "
                "and anoxic saltwater below the debris island."
            ),
            "routing_strategy": (
                "Descend along the vertical limestone shaft wall with reference to the central "
                "collapse mound; limit immersion time inside the 3 m thick H2S chemocline layer "
                "to under 3 minutes and switch to instrument/depth-gauge reference during transit."
            ),
            "navigation_protocol": (
                "Verify team visual alignment before penetrating the opaque sulfidic cloud; "
                "flush masks and stainless/brass regulator components with fresh water upon ascending "
                "back into the oxygenated meteoric lens."
            ),
            "progression_protocol": (
                "Rapid Chemocline Vertical Transit & Anoxic Sub-Cloud Depth Discipline"
            ),
            "field_notes": (
                "Decomposition of jungle leaf litter trapped atop the high-density saline wedge "
                "generates a surreal ghostly river of sulfate-reducing bacteria and dissolved H2S."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "sac-actun-pet-cembalo-mexico",
            "name": "Sistema Sac Actun & Dos Ojos Decorated Phreatic Conduit",
            "country": "Mexico",
            "region": "Akumal-Tulum Corridor, Quintana Roo (Yucatán Peninsula)",
            "depth_range": "4-24 m (13-79 ft)",
            "max_depth_m": 24,
            "morphology": "decorated-speleothem-phreatic-maze",
            "difficulty": "moderate",
            "default_salinity_delta_ppt": 18.0,
            "default_tannic_doc_mg_l": 8.0,
            "default_silt_clay_fraction_pct": 35.0,
            "default_penetration_distance_m": 320.0,
            "default_h2s_concentration_ppm": 1.5,
            "primary_hazard": (
                "Fragile submerged Pleistocene stalactite/stalagmite forests, low-ceiling "
                "bedding-plane restrictions, and percolation silt dislodged by exhaust bubbles."
            ),
            "routing_strategy": (
                "Dive in low-profile sidemount configuration to thread delicate speleothem "
                "columns without dorsal manifold strikes; maintain strict horizontal trim and "
                "follow the permanent gold cavern/cave guideline."
            ),
            "navigation_protocol": (
                "Use modified flutter and micro-frog kicks through low bedding planes; confirm "
                "Rule-of-Thirds turn pressure before passing any speleothem pinch point."
            ),
            "progression_protocol": (
                "Sidemount Low-Profile Trim & Speleothem Percolation Avoidance"
            ),
            "field_notes": (
                "Submerged during Holocene sea-level rise, Sac Actun preserves pristine subaerial "
                "draperies, soda straws, and Paleoindian/megafauna remains across shallow phreatic mazes."
            ),
        }
    ),
    _AttrDict(
        {
            "id": "dan-s-cave-abaco-anchialine-bahamas",
            "name": "Dan's Cave & Sawmill Sink Anchialine Blue Hole Conduit",
            "country": "Bahamas",
            "region": "Great Abaco Island Pine Rockland Karst, Bahamas",
            "depth_range": "9-48 m (30-157 ft)",
            "max_depth_m": 48,
            "morphology": "coastal-tidal-siphon-blue-hole",
            "difficulty": "extreme",
            "default_salinity_delta_ppt": 34.0,
            "default_tannic_doc_mg_l": 34.0,
            "default_silt_clay_fraction_pct": 76.0,
            "default_penetration_distance_m": 580.0,
            "default_h2s_concentration_ppm": 22.0,
            "primary_hazard": (
                "Dark tea-colored pine-forest tannic freshwater cap, multi-stepped halocline "
                "and bacterial chemocline sheets, phase-lagged semidiurnal tidal currents, "
                "and fragile remiped crustacean ecosystems."
            ),
            "routing_strategy": (
                "Time penetrations with inland blue-hole tidal slack; carry high-candela tight-beam "
                "primary canister lights to pierce the humic/tannic top layer and secure dual jump "
                "spools against tidal drag."
            ),
            "navigation_protocol": (
                "Track depth and guideline tension continuously across stacked density interfaces; "
                "avoid disturbing flocculent orange/purple bacterial mats along cave walls."
            ),
            "progression_protocol": (
                "Tidal-Slack Blue-Hole Penetration & Multi-Pycnocline Trim Compensation"
            ),
            "field_notes": (
                "Bahamian inland blue holes exhibit intense humic-acid light attenuation in the "
                "upper 10-18 m followed by crystal-clear anoxic marine passages below the chemocline."
            ),
        }
    ),
]

CENOTE_SITES = CENOTE_HALOCLINE_SITES

CENOTE_HALOCLINE_GEAR_CHECKLIST: list[_AttrDict] = [
    _AttrDict(
        {
            "item": "Independent Sidemount or Manifold Twinset Cylinders with DIN Viton/EPDM O-Rings",
            "category": "gas_redundancy",
            "priority": "essential",
            "rationale": (
                "Provides full gas-supply redundancy for Rule-of-Thirds cave penetration and "
                "resists hydrogen-sulfide (H2S) elastomer degradation in meromictic chemoclines."
            ),
        }
    ),
    _AttrDict(
        {
            "item": "1500+ Lumen Tight-Beam (6°-8°) Umbilical Canister Light & Two Backup Cave Torches",
            "category": "subterranean_lighting",
            "priority": "essential",
            "rationale": (
                "Focused narrow beam minimizes backscatter through tannic dissolved organic carbon (DOC) "
                "waters, turbulent halocline Schlieren zones, and flocculent clay-silt clouds."
            ),
        }
    ),
    _AttrDict(
        {
            "item": "Primary Cave Reel (120 m #24 Braided Nylon) & Two 35 m Safety/Jump Finger Spools",
            "category": "guideline_navigation",
            "priority": "essential",
            "rationale": (
                "Maintains an unbroken physical lifeline to the open cenote cavern zone across "
                "zero-visibility halocline blur or accidental clay-silt outs."
            ),
        }
    ),
    _AttrDict(
        {
            "item": "Directional Line Arrows, Non-Directional Personal Cookies & REM Line Markers",
            "category": "junction_marking",
            "priority": "essential",
            "rationale": (
                "Unambiguously marks the exit direction and team presence at complex anchialine "
                "T-junctions and jump intersections when optical visibility collapses."
            ),
        }
    ),
    _AttrDict(
        {
            "item": "Dual-Bladder Redundant Wing BCD or Drysuit with Fine-Trim Weight Pockets",
            "category": "buoyancy_trim",
            "priority": "essential",
            "rationale": (
                "Compensates for rapid 1.5-3.0 kg buoyancy shifts when transitioning between "
                "low-density meteoric freshwater lenses and high-density 35 ppt marine wedges."
            ),
        }
    ),
    _AttrDict(
        {
            "item": "Dual Z-Knife / Ceramic Line Cutters & Low-Volume Black-Skirted Backup Mask",
            "category": "entanglement_safety",
            "priority": "essential",
            "rationale": (
                "Enables one-handed blind disentanglement from slack guidelines in Schlieren "
                "distortion and eliminates peripheral glare in dark tannic shafts."
            ),
        }
    ),
]


def get_all_sites() -> list[_AttrDict]:
    """Return all curated cenote halocline & anchialine cave sites."""
    return list(CENOTE_HALOCLINE_SITES)


def get_all_cenote_halocline_sites() -> list[_AttrDict]:
    """Alias returning all curated cenote halocline sites."""
    return get_all_sites()


def get_site_by_id(site_id: str) -> _AttrDict | None:
    """Look up a cenote halocline site by exact ID or fuzzy substring."""
    if not site_id:
        return None
    norm = site_id.strip().lower()
    for site in CENOTE_HALOCLINE_SITES:
        if site["id"].lower() == norm:
            return site
    for site in CENOTE_HALOCLINE_SITES:
        if norm in site["id"].lower() or norm in site["name"].lower():
            return site
    return None


def get_cenote_halocline_site_by_id(site_id: str) -> _AttrDict | None:
    """Alias for get_site_by_id."""
    return get_site_by_id(site_id)


def filter_sites(
    country: str | None = None,
    morphology: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
) -> list[_AttrDict]:
    """Filter cenote halocline sites by country, morphology, difficulty, and/or search term."""
    results = list(CENOTE_HALOCLINE_SITES)
    if country:
        c_norm = country.strip().lower()
        results = [
            s for s in results if c_norm in s["country"].lower() or c_norm in s["region"].lower()
        ]
    if morphology:
        m_norm = morphology.strip().lower()
        results = [s for s in results if m_norm in s["morphology"].lower()]
    if difficulty:
        d_norm = difficulty.strip().lower()
        results = [s for s in results if d_norm == s["difficulty"].lower()]
    if search:
        s_norm = search.strip().lower()
        results = [
            s
            for s in results
            if s_norm in s["id"].lower()
            or s_norm in s["name"].lower()
            or s_norm in s["country"].lower()
            or s_norm in s["region"].lower()
            or s_norm in s["morphology"].lower()
            or s_norm in s["primary_hazard"].lower()
            or s_norm in s["field_notes"].lower()
        ]
    return results


def get_gear_checklist() -> list[_AttrDict]:
    """Return the 6-item essential cenote halocline cave-diving gear checklist."""
    return list(CENOTE_HALOCLINE_GEAR_CHECKLIST)


def calculate_cenote_halocline(
    salinity_delta_ppt: float = 28.0,
    tannic_doc_mg_l: float = 12.0,
    silt_clay_fraction_pct: float = 40.0,
    penetration_distance_m: float = 250.0,
    h2s_concentration_ppm: float = 2.0,
) -> _AttrDict:
    """Calculate Schlieren optical blur, post-mix visibility, buoyancy shift, and gas reserves.

    Validates all 5 physical parameters and returns deterministic cave-diving field metrics.
    """
    if not (2.0 <= salinity_delta_ppt <= 36.0):
        raise ValueError(
            f"salinity_delta_ppt must be between 2.0 and 36.0 ppt (received {salinity_delta_ppt})"
        )
    if not (0.0 <= tannic_doc_mg_l <= 60.0):
        raise ValueError(
            f"tannic_doc_mg_l must be between 0.0 and 60.0 mg/L (received {tannic_doc_mg_l})"
        )
    if not (0.0 <= silt_clay_fraction_pct <= 100.0):
        raise ValueError(
            "silt_clay_fraction_pct must be between 0.0 and 100.0 % "
            f"(received {silt_clay_fraction_pct})"
        )
    if not (10.0 <= penetration_distance_m <= 1200.0):
        raise ValueError(
            "penetration_distance_m must be between 10.0 and 1200.0 m "
            f"(received {penetration_distance_m})"
        )
    if not (0.0 <= h2s_concentration_ppm <= 80.0):
        raise ValueError(
            "h2s_concentration_ppm must be between 0.0 and 80.0 ppm "
            f"(received {h2s_concentration_ppm})"
        )

    # Normalized components (0.0 to 1.0)
    sal_norm = (salinity_delta_ppt - 2.0) / 34.0
    doc_norm = tannic_doc_mg_l / 60.0
    silt_norm = silt_clay_fraction_pct / 100.0
    pen_norm = (penetration_distance_m - 10.0) / 1190.0
    h2s_norm = h2s_concentration_ppm / 80.0

    # Schlieren optical blur index (0 - 100 scale)
    raw_blur = 8.0 + 52.0 * sal_norm + 18.0 * silt_norm + 12.0 * doc_norm + 10.0 * h2s_norm
    schlieren_optical_blur_index = round(max(4.0, min(99.5, raw_blur)), 1)

    # Post-mix visibility in meters (0.3 - 30.0 m)
    raw_vis = 26.0 - 10.5 * sal_norm - 7.5 * silt_norm - 5.0 * doc_norm - 3.5 * h2s_norm
    post_mix_visibility_meters = round(max(0.4, min(28.0, raw_vis)), 1)

    # Fresh-to-saltwater buoyancy trim shift (kg) for an ~85 L displaced diver/rig volume
    raw_buoyancy = 0.072 * salinity_delta_ppt + 0.15 * doc_norm
    buoyancy_trim_shift_kg = round(max(0.15, min(3.2, raw_buoyancy)), 2)

    # Rule-of-Thirds minimum turn/reserve pressure (bar, assuming 210 bar starting fill)
    raw_reserve_bar = 75.0 + 55.0 * pen_norm + 14.0 * sal_norm + 12.0 * silt_norm + 10.0 * h2s_norm
    rule_of_thirds_reserve_bar = round(max(70.0, min(175.0, raw_reserve_bar)), 1)

    # Risk classification
    if (
        schlieren_optical_blur_index >= 72.0
        or post_mix_visibility_meters <= 3.5
        or h2s_concentration_ppm >= 30.0
        or penetration_distance_m >= 750.0
    ):
        risk_level = "critical"
        navigation_protocol = (
            "CRITICAL HALOCLINE & CHEMOCLINE BLIND-OUT HAZARD: Enforce immediate zero-visibility "
            "touch-contact on the primary guideline, abort complex secondary jumps, and limit "
            "exposure in sulfidic H2S layers. Verify team turn pressure (>= "
            f"{rule_of_thirds_reserve_bar:.0f} bar) before crossing any pycnocline restriction."
        )
    elif (
        schlieren_optical_blur_index >= 52.0
        or post_mix_visibility_meters <= 8.0
        or h2s_concentration_ppm >= 12.0
        or penetration_distance_m >= 400.0
    ):
        risk_level = "high"
        navigation_protocol = (
            "HIGH SCHLIEREN DISTORTION & SILT-OUT RISK: Hover at least 1.0 m above or below the "
            "halocline shear plane to avoid fin-wash mixing; place double directional line arrows "
            "at all T-junctions and compensate for a "
            f"{buoyancy_trim_shift_kg:.2f} kg buoyancy shift across the density interface."
        )
    elif (
        schlieren_optical_blur_index >= 32.0
        or post_mix_visibility_meters <= 13.5
        or penetration_distance_m >= 180.0
    ):
        risk_level = "moderate"
        navigation_protocol = (
            "MODERATE PYCNOCLINE REFRACTION: Maintain visual and light-signal contact with the "
            "gold cave line, use anti-silting frog kicks over clay sediment banks, and adjust "
            "wing inflation smoothly when crossing the freshwater/saltwater boundary."
        )
    else:
        risk_level = "low"
        navigation_protocol = (
            "LOW HALOCLINE DISTORTION: High optical clarity in the meteoric freshwater lens; "
            "follow standard Rule-of-Thirds gas management and continuous guideline discipline."
        )

    warnings: list[str] = []
    if salinity_delta_ppt >= 25.0:
        warnings.append(
            f"Steep salinity gradient ({salinity_delta_ppt:.1f} ppt) induces severe refractive "
            f"Schlieren blur ({schlieren_optical_blur_index:.1f}/100) and a {buoyancy_trim_shift_kg:.2f} kg "
            "buoyancy shift between the freshwater cap and marine wedge."
        )
    if tannic_doc_mg_l >= 20.0:
        warnings.append(
            f"High tannic dissolved organic carbon ({tannic_doc_mg_l:.1f} mg/L) absorbs wide-angle "
            "blue/white light spectra in the upper meteoric water column."
        )
    if silt_clay_fraction_pct >= 55.0:
        warnings.append(
            f"High flocculent clay-silt fraction ({silt_clay_fraction_pct:.0f}%) remains suspended "
            "for hours if disturbed by downward flutter kicks or exhaust bubble percolation."
        )
    if penetration_distance_m >= 450.0:
        warnings.append(
            f"Deep phreatic penetration ({penetration_distance_m:.0f} m) requires strict "
            f"{rule_of_thirds_reserve_bar:.0f} bar turn/reserve pressure to survive a blind "
            "post-mix halocline exit."
        )
    if h2s_concentration_ppm >= 15.0:
        warnings.append(
            f"Elevated meromictic hydrogen sulfide ({h2s_concentration_ppm:.1f} ppm) poses "
            "trans-dermal toxicity, mask-seal irritation, and metallic gear corrosion hazards."
        )

    recommendations: list[str] = [
        "Maintain continuous visual or finger-circle tactile contact with the permanent guideline whenever crossing a turbulent halocline interface.",
        "Fly either 1 m above the pycnocline in the freshwater lens or drop cleanly into the lower saltwater stratum rather than swimming inside the mixing zone.",
        "Mark every jump and T-junction with directional line arrows pointing toward the nearest open-water cenote cavern exit and personal non-directional cookies.",
    ]
    if risk_level in {"high", "critical"}:
        recommendations.append(
            "Use tight-beam (6°-8°) canister primary lights and verify independent sidemount or twinset gas reserves prior to descending through tannic or sulfidic chemoclines."
        )

    return _AttrDict(
        {
            "salinity_delta_ppt": round(float(salinity_delta_ppt), 1),
            "tannic_doc_mg_l": round(float(tannic_doc_mg_l), 1),
            "silt_clay_fraction_pct": round(float(silt_clay_fraction_pct), 1),
            "penetration_distance_m": round(float(penetration_distance_m), 1),
            "h2s_concentration_ppm": round(float(h2s_concentration_ppm), 1),
            "schlieren_optical_blur_index": schlieren_optical_blur_index,
            "post_mix_visibility_meters": post_mix_visibility_meters,
            "buoyancy_trim_shift_kg": buoyancy_trim_shift_kg,
            "rule_of_thirds_reserve_bar": rule_of_thirds_reserve_bar,
            "risk_level": risk_level,
            "safety_status": risk_level,
            "navigation_protocol": navigation_protocol,
            "routing_strategy": navigation_protocol,
            "warnings": warnings,
            "recommendations": recommendations,
        }
    )


_STRONG_KEYWORDS: tuple[str, ...] = (
    "cenote",
    "cenotes",
    "halocline",
    "haloclines",
    "anchialine",
    "schlieren",
    "ox bel ha",
    "ox-bel-ha",
    "cenote angelita",
    "angelita",
    "sac actun",
    "sac-actun",
    "pet cembalo",
    "dos ojos",
    "sawmill sink",
    "dan's cave",
    "dans cave",
    "abaco blue hole",
    "meromictic",
    "tannic halocline",
    "chemocline",
    "pycnocline",
)

_CONTEXT_KEYWORDS: tuple[str, ...] = (
    "salinity delta",
    "tannic doc",
    "tulum",
    "quintana roo",
    "yucatan",
    "yucatán",
    "blue hole",
    "freshwater lens",
    "saltwater wedge",
    "sulfide cloud",
    "h2s cloud",
)

_EXCLUSION_PATTERNS: tuple[str, ...] = (
    "peacock springs",
    "ginnie springs",
    "devil's eye",
    "devils eye",
    "devil's ear",
    "devils ear",
    "cholla sump",
    "phantom lake",
    "balmorhea",
    "tuckaleechee",
    "lake tahoe",
    "rubicon wall",
    "crater lake",
    "wizard island",
    "emerald lake",
    "lake ouananiche",
    "homestake reservoir",
    "buhlmann",
    "bühlmann",
    "esld",
    "equivalent sea level depth",
    "kelp forest",
    "kelp freediving",
    "macrocystis",
    "nereocystis",
    "point lobos",
    "ellison's cave",
    "ellisons cave",
    "fantastic pit",
    "mammoth cave",
    "tumbling rock",
    "carlsbad",
    "lechuguilla",
    "cave pearl",
    "pisolith",
    "cryokarst",
    "moulin",
    "glaciere",
    "glacière",
    "eisriesenwelt",
    "scarisoara",
    "scărișoara",
    "tiankeng",
    "xiaozhai",
    "dashiwei",
    "golondrinas",
    "sarisarinama",
    "tsingy",
    "bemaraha",
    "ankarana",
    "blowhole",
    "fingal",
    "devil's punchbowl",
    "solfatara",
    "fumarole",
    "mudpot",
    "bumpass hell",
    "novarupta",
    "thermokarst",
    "tuktoyaktuk",
    "batagaika",
)


def is_cenote_halocline_query(query: str) -> bool:
    """Return True if the user query asks about cenote halocline or anchialine cave navigation."""
    if not query:
        return False
    q_lower = query.lower()

    if any(ex in q_lower for ex in _EXCLUSION_PATTERNS):
        return False

    if any(k in q_lower for k in _STRONG_KEYWORDS):
        return True

    context_hits = sum(1 for k in _CONTEXT_KEYWORDS if k in q_lower)
    if context_hits >= 2:
        return True
    if context_hits == 1 and any(
        w in q_lower
        for w in ("cave", "diving", "dive", "conduit", "silt", "salinity", "visibility")
    ):
        return True

    return False


def detect_cenote_halocline_intent(query: str) -> bool:
    """Alias for is_cenote_halocline_query used by chat_request and main."""
    return is_cenote_halocline_query(query)


def _clamp(val: float, low: float, high: float) -> float:
    return max(low, min(high, val))


def extract_cenote_halocline_params(query: str) -> dict[str, Any]:
    """Extract cenote halocline site ID and physical calculator parameters from natural language."""
    q_lower = query.lower()
    matched_site: _AttrDict | None = None

    site_aliases: list[tuple[tuple[str, ...], str]] = [
        (("ox bel ha", "ox-bel-ha"), "ox-bel-ha-halocline-tulum-mexico"),
        (
            ("angelita", "cenote angelita", "h2s cloud", "sulfide cloud"),
            "angelita-h2s-cloud-tulum-mexico",
        ),
        (
            ("sac actun", "sac-actun", "dos ojos", "pet cembalo", "akumal"),
            "sac-actun-pet-cembalo-mexico",
        ),
        (
            ("dan's cave", "dans cave", "sawmill sink", "abaco", "bahamas"),
            "dan-s-cave-abaco-anchialine-bahamas",
        ),
    ]
    for keywords, sid in site_aliases:
        if any(k in q_lower for k in keywords):
            matched_site = get_site_by_id(sid)
            break

    salinity_delta_ppt = float(matched_site["default_salinity_delta_ppt"]) if matched_site else 28.0
    tannic_doc_mg_l = float(matched_site["default_tannic_doc_mg_l"]) if matched_site else 12.0
    silt_clay_fraction_pct = (
        float(matched_site["default_silt_clay_fraction_pct"]) if matched_site else 40.0
    )
    penetration_distance_m = (
        float(matched_site["default_penetration_distance_m"]) if matched_site else 250.0
    )
    h2s_concentration_ppm = (
        float(matched_site["default_h2s_concentration_ppm"]) if matched_site else 2.0
    )

    has_calc_params = any(
        w in q_lower
        for w in ("calculate", "calculator", "compute", "schlieren", "evaluate", "assess")
    )

    # Salinity delta (ppt or PSU)
    m_sal = re.search(
        r"(?:salinity(?:\s+delta|\s+gradient)?\s*(?:of|at|is|=|:)?\s*(\d+(?:\.\d+)?)\s*(?:ppt|psu)?|"
        r"(\d+(?:\.\d+)?)\s*(?:ppt|psu)(?:\s+salinity(?:\s+delta)?)?)",
        q_lower,
    )
    if m_sal:
        val = float(m_sal.group(1) or m_sal.group(2))
        salinity_delta_ppt = _clamp(val, 2.0, 36.0)
        has_calc_params = True

    # Tannic DOC (mg/L)
    m_doc = re.search(
        r"(?:(?:tannic(?:\s+doc)?|doc)\s*(?:of|at|is|=|:)?\s*(\d+(?:\.\d+)?)\s*mg/?l?|"
        r"(\d+(?:\.\d+)?)\s*mg/?l\s*(?:tannic|doc))",
        q_lower,
    )
    if m_doc:
        val = float(m_doc.group(1) or m_doc.group(2))
        tannic_doc_mg_l = _clamp(val, 0.0, 60.0)
        has_calc_params = True

    # Silt / clay fraction (%)
    m_silt = re.search(
        r"(?:silt(?:\s*[-/]\s*clay|\s+clay)?(?:\s+fraction)?\s*(?:of|at|is|=|:)?\s*(\d+(?:\.\d+)?)\s*%?|"
        r"(\d+(?:\.\d+)?)\s*%\s*silt(?:\s*[-/]\s*clay|\s+clay)?)",
        q_lower,
    )
    if m_silt:
        val = float(m_silt.group(1) or m_silt.group(2))
        silt_clay_fraction_pct = _clamp(val, 0.0, 100.0)
        has_calc_params = True

    # Penetration distance (m)
    m_pen = re.search(
        r"(?:penetration(?:\s+distance)?\s*(?:of|at|is|=|:)?\s*(\d+(?:\.\d+)?)\s*m\b|"
        r"(\d+(?:\.\d+)?)\s*m\s+penetration)",
        q_lower,
    )
    if m_pen:
        val = float(m_pen.group(1) or m_pen.group(2))
        penetration_distance_m = _clamp(val, 10.0, 1200.0)
        has_calc_params = True

    # H2S concentration (ppm)
    m_h2s = re.search(
        r"(?:(?:h2s|hydrogen\s+sulfide)(?:\s+concentration)?\s*(?:of|at|is|=|:)?\s*(\d+(?:\.\d+)?)\s*ppm|"
        r"(\d+(?:\.\d+)?)\s*ppm\s*(?:h2s|hydrogen\s+sulfide))",
        q_lower,
    )
    if m_h2s:
        val = float(m_h2s.group(1) or m_h2s.group(2))
        h2s_concentration_ppm = _clamp(val, 0.0, 80.0)
        has_calc_params = True

    return {
        "site_id": matched_site["id"] if matched_site else None,
        "site": matched_site,
        "salinity_delta_ppt": salinity_delta_ppt,
        "tannic_doc_mg_l": tannic_doc_mg_l,
        "silt_clay_fraction_pct": silt_clay_fraction_pct,
        "penetration_distance_m": penetration_distance_m,
        "h2s_concentration_ppm": h2s_concentration_ppm,
        "has_calc_params": has_calc_params,
    }


def format_cenote_halocline_response(query: str) -> _AttrDict:
    """Format structured cenote halocline response payload for chat and SSE pipelines."""
    params = extract_cenote_halocline_params(query)
    matched_site: _AttrDict | None = params["site"]
    has_calc = bool(params["has_calc_params"])

    calc_result: _AttrDict = calculate_cenote_halocline(
        salinity_delta_ppt=float(params["salinity_delta_ppt"]),
        tannic_doc_mg_l=float(params["tannic_doc_mg_l"]),
        silt_clay_fraction_pct=float(params["silt_clay_fraction_pct"]),
        penetration_distance_m=float(params["penetration_distance_m"]),
        h2s_concentration_ppm=float(params["h2s_concentration_ppm"]),
    )

    if has_calc:
        action = "cenote_halocline_calculated"
    elif matched_site is not None:
        action = "cenote_halocline_lookup"
    else:
        action = "cenote_halocline_info"

    matched_sites = [matched_site] if matched_site is not None else list(CENOTE_HALOCLINE_SITES)

    summary_parts: list[str] = []
    if matched_site is not None:
        summary_parts.append(
            f"**{matched_site['name']}** ({matched_site['region']}, {matched_site['country']}) — "
            f"Morphology: `{matched_site['morphology']}`, Difficulty: `{matched_site['difficulty']}`."
        )
        summary_parts.append(f"Primary Hazard: {matched_site['primary_hazard']}")
        summary_parts.append(f"Site Navigation Protocol: {matched_site['navigation_protocol']}")
    else:
        summary_parts.append(
            "**Subterranean Cenote Halocline & Anchialine Phreatic Cave-Passage Navigation Guide** — "
            "Covers anchialine halocline labyrinths, meromictic hydrogen-sulfide (H2S) chemocline shafts, "
            "decorated speleothem phreatic mazes, and coastal tidal-siphon blue holes."
        )

    summary_parts.append(
        f"**Halocline Schlieren & Gas Reserve Assessment** "
        f"(Salinity Delta `{calc_result['salinity_delta_ppt']} ppt`, "
        f"Tannic DOC `{calc_result['tannic_doc_mg_l']} mg/L`, "
        f"Silt-Clay `{calc_result['silt_clay_fraction_pct']}%`, "
        f"Penetration `{calc_result['penetration_distance_m']} m`, "
        f"H2S `{calc_result['h2s_concentration_ppm']} ppm`): "
        f"Schlieren Blur Index `{calc_result['schlieren_optical_blur_index']}/100`, "
        f"Post-Mix Visibility `{calc_result['post_mix_visibility_meters']} m`, "
        f"Buoyancy Trim Shift `{calc_result['buoyancy_trim_shift_kg']} kg`, "
        f"Rule-of-Thirds Reserve `{calc_result['rule_of_thirds_reserve_bar']} bar`, "
        f"Risk Level `{calc_result['risk_level'].upper()}`."
    )
    summary_parts.append(f"Recommended Protocol: {calc_result['navigation_protocol']}")

    summary_text = "\n\n".join(summary_parts)
    payload: dict[str, Any] = {
        "action": action,
        "query": query,
        "matched_site": matched_site,
        "matched_sites": matched_sites,
        "sites": list(CENOTE_HALOCLINE_SITES),
        "calculation": calc_result,
        "gear_checklist": list(CENOTE_HALOCLINE_GEAR_CHECKLIST),
        "summary": summary_text,
        "answer": summary_text,
    }
    return _AttrDict(payload)


def build_cenote_halocline_prompt(query_or_info: dict[str, Any] | str) -> str:
    """Build system prompt injection block with cenote halocline data and gear checklist."""
    info: dict[str, Any] = (
        format_cenote_halocline_response(query_or_info)
        if isinstance(query_or_info, str)
        else query_or_info
    )
    calc: dict[str, Any] = info.get("calculation") or {}
    matched_site: dict[str, Any] | None = info.get("matched_site")
    lines: list[str] = [
        "=== SUBTERRANEAN CENOTE HALOCLINE & ANCHIALINE PHREATIC CAVE-PASSAGE NAVIGATION CONTEXT ===",
        f"Action: {info.get('action', 'cenote_halocline_info')}",
    ]
    if matched_site:
        lines.extend(
            [
                f"Matched Site: {matched_site['name']} ({matched_site['id']})",
                f"Location: {matched_site['region']}, {matched_site['country']} ({matched_site['depth_range']})",
                f"Morphology: {matched_site['morphology']} | Difficulty: {matched_site['difficulty']}",
                f"Primary Hazard: {matched_site['primary_hazard']}",
                f"Site Navigation Protocol: {matched_site['navigation_protocol']}",
            ]
        )
    else:
        lines.append("Cataloged Cenote Halocline & Anchialine Phreatic Cave Sites:")
        for s in CENOTE_HALOCLINE_SITES:
            lines.append(
                f"- {s['name']} ({s['country']}, {s['morphology']}, {s['difficulty']}): {s['navigation_protocol']}"
            )

    if calc:
        lines.extend(
            [
                "Deterministic Cenote Halocline & Phreatic Navigation Metrics:",
                f"- Salinity Delta: {calc.get('salinity_delta_ppt')} ppt",
                f"- Tannic DOC Concentration: {calc.get('tannic_doc_mg_l')} mg/L",
                f"- Silt-Clay Fraction: {calc.get('silt_clay_fraction_pct')}%",
                f"- Penetration Distance: {calc.get('penetration_distance_m')} m",
                f"- H2S Concentration: {calc.get('h2s_concentration_ppm')} ppm",
                f"- Schlieren Optical Blur Index: {calc.get('schlieren_optical_blur_index')}/100",
                f"- Post-Mix Visibility: {calc.get('post_mix_visibility_meters')} m",
                f"- Buoyancy Trim Shift: {calc.get('buoyancy_trim_shift_kg')} kg",
                f"- Rule-of-Thirds Reserve Pressure: {calc.get('rule_of_thirds_reserve_bar')} bar",
                f"- Risk Level: {calc.get('risk_level')}",
                f"- Navigation Protocol: {calc.get('navigation_protocol')}",
            ]
        )
        warnings = calc.get("warnings") or []
        if warnings:
            lines.append("Active Subterranean Diving Warnings:")
            for w in warnings:
                lines.append(f"  * {w}")

    lines.append("ESSENTIAL CENOTE HALOCLINE & ANCHIALINE CAVE GEAR CHECKLIST:")
    for item in CENOTE_HALOCLINE_GEAR_CHECKLIST:
        lines.append(f"- {item['item']} ({item['category']}): {item['rationale']}")
    lines.append("=== END CENOTE HALOCLINE NAVIGATION CONTEXT ===")
    return "\n".join(lines)


def get_chat_response(query: str) -> dict[str, Any]:
    """Return synchronous chat response dictionary for cenote halocline queries."""
    info: dict[str, Any] = format_cenote_halocline_response(query)
    return {
        "answer": info["summary"],
        "cenote_halocline_info": info,
        "context": [],
    }


def generate_stream_events(query: str) -> Generator[dict[str, Any], None, None]:
    """Yield SSE stream event dictionaries for cenote halocline queries."""
    info: dict[str, Any] = format_cenote_halocline_response(query)
    yield {"cenote_halocline_info": info, "context": []}
    for paragraph in str(info["summary"]).split("\n\n"):
        yield {"answer": paragraph + "\n\n"}
