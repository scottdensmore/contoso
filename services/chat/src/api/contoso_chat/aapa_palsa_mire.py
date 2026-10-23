"""Boreal String-Bog (Aapa Mire) Flark-Pool & Palsa Permafrost-Mound Crossing Guide.

Covers subarctic and boreal patterned fens (aapasuo), concentric sträng-and-flark (rimpi) mire labyrinths,
and discontinuous-permafrost ice-cored palsa mound plateaus with collapsing thermokarst lagg moats:
- Viiankiaapa & Sodankylä Concentric String-Bog (Aapasuo) Labyrinth (Lapland, Finland)
- Tavvavuoma & Vissátvuopmi Giant Palsa-Mound Plateau (Norrbotten, Sweden)
- Hudson Bay Lowlands & Polar Bear Provincial Park String-Fen & Palsa Complex (Ontario, Canada)
- Øvre Pasvik & Neiden-Munkefjord Palsa-Aapa Mire Corridor (Finnmark, Norway)

Deterministic calculator evaluates:
- Sträng peat-ridge shear & root-mat breakthrough risk (%)
- Palsa thermokarst lagg-moat submersion & boot-vacuum entrapment probability (%)
- Flark (rimpi) open-water trough detour distance multiplier (x)
- Boreal Simuliidae blackfly & Culicidae mosquito swarm physiological stress index (0-100)
"""

from __future__ import annotations

import re
from collections.abc import Iterator
from typing import Any


class AapaPalsaMireSite(dict[str, Any]):
    """Dictionary subclass supporting attribute access for boreal string-bog & palsa mire sites."""

    def __getattr__(self, name: str) -> Any:
        try:
            return self[name]
        except KeyError as exc:
            raise AttributeError(
                f"'AapaPalsaMireSite' object has no attribute '{name}'"
            ) from exc


AAPA_PALSA_MIRE_SITES: list[AapaPalsaMireSite] = [
    AapaPalsaMireSite(
        {
            "id": "voda-viiankiaapa-sodankyla-lapland-finland",
            "name": "Viiankiaapa & Sodankylä Concentric String-Bog (Aapasuo) Labyrinth",
            "country": "Finland",
            "region": "Central Lapland (Sodankylä / Natura 2000 Viiankiaapa Mire Reserve)",
            "elevation_range": "195 m - 235 m",
            "max_elevation_m": 235,
            "morphology": "concentric-strang-flark-aapa",
            "regime": "concentric-strang-flark-aapa",
            "substrate_type": "concentric-strang-flark-aapa",
            "difficulty": "challenging",
            "default_strang_width_m": 1.2,
            "default_flark_trough_span_m": 24.0,
            "default_active_thaw_depth_cm": 68.0,
            "default_palsa_rim_fissure_score": 45.0,
            "default_hiker_pack_weight_kg": 22.0,
            "primary_hazard": (
                "Alternating narrow Betula nana-anchored peat strings (jänteet/strängar) and 20-45 m wide "
                "bottomless rimpi flark troughs of unconsolidated Carex-Sphagnum gyttja ooze where a single "
                "dead-end ridge termination forces exhausting 2.5x backtracking under intense Culicidae/Simuliidae swarms."
            ),
            "crossing_strategy": (
                "Sight multi-hundred-meter sträng ridge continuity from slight moraine rises (metsäsaarekkeet) "
                "before committing to the mire; step strictly on woody dwarf-birch (Betula nana) and ledum root "
                "crowns along the sträng spine while probing dark Scheuchzeria/mud-bottom rimpi margins with a 2.0 m staff."
            ),
            "navigation_strategy": (
                "Sight multi-hundred-meter sträng ridge continuity from slight moraine rises (metsäsaarekkeet) "
                "before committing to the mire; step strictly on woody dwarf-birch (Betula nana) and ledum root "
                "crowns along the sträng spine while probing dark Scheuchzeria/mud-bottom rimpi margins with a 2.0 m staff."
            ),
            "navigation_protocol": (
                "Cross perpendicular to the downslope water-flow gradient by riding transverse sträng ridges "
                "from forest-island (umpipuu) to forest-island; never attempt to jump across black open-water "
                "rimpi flark pools where floating Sphagnum cuspidatum carpets have zero shear strength."
            ),
            "conservation_protocol": (
                "Remain on marked duckboard corridors (pitkospuut) where present inside Natura 2000 Viiankiaapa; "
                "avoid disturbing rare rich-fen orchids, Saxifraga hirculus colonies, and nesting waders/cranes during June-July."
            ),
            "progression_protocol": (
                "Cross perpendicular to the downslope water-flow gradient by riding transverse sträng ridges "
                "from forest-island (umpipuu) to forest-island; never attempt to jump across black open-water "
                "rimpi flark pools where floating Sphagnum cuspidatum carpets have zero shear strength."
            ),
            "field_notes": (
                "Viiankiaapa exemplifies classic Fennoscandian minerotrophic aapasuo hydrology where spring "
                "snowmelt floods vast open-water rimpi troughs separated by frost-heaved peat ridges."
            ),
        }
    ),
    AapaPalsaMireSite(
        {
            "id": "tavvavuoma-kummavuopio-palsa-norrbotten-sweden",
            "name": "Tavvavuoma & Vissátvuopmi Giant Palsa-Mound Plateau",
            "country": "Sweden",
            "region": "Kiruna / Karesuando Subarctic Permafrost Plateau, Norrbotten (Lapland)",
            "elevation_range": "530 m - 650 m",
            "max_elevation_m": 650,
            "morphology": "ice-cored-palsa-dome-plateau",
            "regime": "ice-cored-palsa-dome-plateau",
            "substrate_type": "ice-cored-palsa-dome-plateau",
            "difficulty": "extreme",
            "default_strang_width_m": 0.85,
            "default_flark_trough_span_m": 28.0,
            "default_active_thaw_depth_cm": 82.0,
            "default_palsa_rim_fissure_score": 78.0,
            "default_hiker_pack_weight_kg": 25.0,
            "primary_hazard": (
                "4-7 m high ice-cored permafrost peat domes (palsar) ringed by vertical block-slump tension "
                "fissures and waist-to-chest-deep thermokarst lagg moats (palsalagg) where thawing segregation-ice "
                "lenses create overhanging peat aprons that shear into near-freezing liquid peat."
            ),
            "crossing_strategy": (
                "Give decaying palsa dome perimeters a minimum 4-6 m standoff buffer to avoid undercut thermokarst "
                "lagg moats; thread dry gravel esker spines and consolidated Carex rostrata sedge ridges between "
                "collapsed palsa-lake craters while probing active-layer frost depth continuously."
            ),
            "navigation_strategy": (
                "Give decaying palsa dome perimeters a minimum 4-6 m standoff buffer to avoid undercut thermokarst "
                "lagg moats; thread dry gravel esker spines and consolidated Carex rostrata sedge ridges between "
                "collapsed palsa-lake craters while probing active-layer frost depth continuously."
            ),
            "navigation_protocol": (
                "Use high-grounds on intact wind-scoured palsa crests only for azimuth sighting—do not descend "
                "down steep cracked peat flanks where dark water-filled thermokarst moats ring the base."
            ),
            "conservation_protocol": (
                "Avoid trampling bare desiccated peat crowns on wind-eroded palsa domes where dark peat exposure "
                "lowers surface albedo and accelerates irreversible permafrost core melt."
            ),
            "progression_protocol": (
                "Use high-grounds on intact wind-scoured palsa crests only for azimuth sighting—do not descend "
                "down steep cracked peat flanks where dark water-filled thermokarst moats ring the base."
            ),
            "field_notes": (
                "Tavvavuoma forms Sweden's largest continuous palsa mire complex (~50 km²), where sporadic "
                "permafrost ice cores heave peat plateaus meters above surrounding subarctic fens."
            ),
        }
    ),
    AapaPalsaMireSite(
        {
            "id": "hudson-bay-lowlands-sutton-ridges-ontario-canada",
            "name": "Hudson Bay Lowlands & Polar Bear Provincial Park String-Fen & Palsa Complex",
            "country": "Canada",
            "region": "Hudson Bay Lowlands & Sutton Ridges, Far North Ontario",
            "elevation_range": "25 m - 145 m",
            "max_elevation_m": 145,
            "morphology": "thermokarst-lagg-moat-collapse",
            "regime": "thermokarst-lagg-moat-collapse",
            "substrate_type": "thermokarst-lagg-moat-collapse",
            "difficulty": "extreme",
            "default_strang_width_m": 0.75,
            "default_flark_trough_span_m": 38.0,
            "default_active_thaw_depth_cm": 94.0,
            "default_palsa_rim_fissure_score": 84.0,
            "default_hiker_pack_weight_kg": 26.0,
            "primary_hazard": (
                "Horizon-to-horizon parallel ribbed string fens, coalescing thermokarst palsa collapse moats, "
                "floating Menyanthes trifoliata (buckbean) quaking mats over 3 m deep marl-peat ooze, and "
                "relentless subarctic blackfly/deerfly clouds across roadless coastal-plain wetlands."
            ),
            "crossing_strategy": (
                "Link raised Paleo-beach gravel ridges (raised marine strandlines) and Precambrian Sutton Ridge "
                "diabase outcrops; when crossing ribbed inter-beach fens, follow Larix laricina (tamarack) "
                "and dwarf-birch sträng ribs with dual 110 mm mud-basket poles and a 15 m floating throw-bag."
            ),
            "navigation_strategy": (
                "Link raised Paleo-beach gravel ridges (raised marine strandlines) and Precambrian Sutton Ridge "
                "diabase outcrops; when crossing ribbed inter-beach fens, follow Larix laricina (tamarack) "
                "and dwarf-birch sträng ribs with dual 110 mm mud-basket poles and a 15 m floating throw-bag."
            ),
            "navigation_protocol": (
                "Pre-plot isostatic raised-beach corridors on optical/SAR satellite imagery; never cut straight "
                "across wide parallel flark ladders where crossing 40+ successive water troughs per kilometer "
                "exhausts hikers before reaching dry ground."
            ),
            "conservation_protocol": (
                "Practice strict Leave No Trace and polar-bear / caribou buffer protocols on ancient raised-beach "
                "strands; do not trench peat strings or disturb subarctic shorebird nesting hummocks."
            ),
            "progression_protocol": (
                "Pre-plot isostatic raised-beach corridors on optical/SAR satellite imagery; never cut straight "
                "across wide parallel flark ladders where crossing 40+ successive water troughs per kilometer "
                "exhausts hikers before reaching dry ground."
            ),
            "field_notes": (
                "The Hudson Bay Lowlands represent the largest continuous patterned peatland and southern-margin "
                "palsa-bog landscape in North America, shaped by post-glacial Tyrrell Sea isostatic rebound."
            ),
        }
    ),
    AapaPalsaMireSite(
        {
            "id": "pasvik-iettiselga-injarvi-palsa-finnmark-norway",
            "name": "Øvre Pasvik & Neiden-Munkefjord Palsa-Aapa Mire Corridor",
            "country": "Norway",
            "region": "Sør-Varanger / Øvre Pasvik & Munkefjord, Finnmark",
            "elevation_range": "45 m - 165 m",
            "max_elevation_m": 165,
            "morphology": "minerotrophic-sedge-carpet-fen",
            "regime": "minerotrophic-sedge-carpet-fen",
            "substrate_type": "minerotrophic-sedge-carpet-fen",
            "difficulty": "moderate",
            "default_strang_width_m": 1.85,
            "default_flark_trough_span_m": 12.0,
            "default_active_thaw_depth_cm": 48.0,
            "default_palsa_rim_fissure_score": 34.0,
            "default_hiker_pack_weight_kg": 19.0,
            "primary_hazard": (
                "Marginal coastal-continental palsa domes undergoing rapid late-summer active-layer thaw "
                "alongside bouncy minerotrophic Carex lasiocarpa / Eriophorum sedge carpets and hidden "
                "sub-peat drainage pipes feeding boreal pine-taiga streams."
            ),
            "crossing_strategy": (
                "Traverse along firm Scots-pine moraine tongues and consolidated Rubus chamaemorus (cloudberry) "
                "/ Betula nana hummock strings; wear knee-high Nordic rubber/neoprene mire boots and probe "
                "bright-green Sphagnum riparium spring-fen eyes before stepping."
            ),
            "navigation_strategy": (
                "Traverse along firm Scots-pine moraine tongues and consolidated Rubus chamaemorus (cloudberry) "
                "/ Betula nana hummock strings; wear knee-high Nordic rubber/neoprene mire boots and probe "
                "bright-green Sphagnum riparium spring-fen eyes before stepping."
            ),
            "navigation_protocol": (
                "Step on interlocking sedge rhizome mats (Carex rostrata / Carex lasiocarpa) rather than "
                "unconsolidated dark mud-bottom hollows, and contour around slumping palsa moat margins."
            ),
            "conservation_protocol": (
                "Protect Norway's endangered eastern-taiga palsa landforms in Øvre Pasvik and Munkefjord "
                "Nature Reserves by avoiding foot traffic across fissured palsa peat caps."
            ),
            "progression_protocol": (
                "Step on interlocking sedge rhizome mats (Carex rostrata / Carex lasiocarpa) rather than "
                "unconsolidated dark mud-bottom hollows, and contour around slumping palsa moat margins."
            ),
            "field_notes": (
                "Pasvik and Neiden-Munkefjord harbor some of northern Europe's most accessible yet climate-sensitive "
                "coastal-taiga palsa mounds interwoven with minerotrophic string-aapa fens."
            ),
        }
    ),
]

AAPA_SITES: list[AapaPalsaMireSite] = AAPA_PALSA_MIRE_SITES

AAPA_PALSA_MIRE_GEAR_CHECKLIST: list[dict[str, str]] = [
    {
        "item": "Graduated 2.0 m Carbon/Alloy Mire-Sounding Staff with 115 mmPerforated Bog-Mud Basket",
        "category": "Flark-Pool & Lagg-Moat Depth Probing",
        "priority": "essential",
        "rationale": (
            "Tests root-mat shear integrity along narrow Betula nana sträng ridges and sounds concealed "
            "thermokarst lagg-moat drop-offs around decaying palsa domes before committing body weight."
        ),
    },
    {
        "item": "Knee-High Steel-Shank Neoprene-Lined Boreal Mire Boots / Welded Pack-Waders",
        "category": "Acidic Peat-Water & Boot-Suction Defense",
        "priority": "essential",
        "rationale": (
            "Seals out 2-6 °C tannin-acidic flark water above the suprapermafrost frost table while "
            "ankle-lock lacing prevents vacuum mud suction from stripping footwear in gyttja troughs."
        ),
    },
    {
        "item": "Fine-Mesh (1200-Holes/in²) Simuliidae Blackfly & Culicidae Mosquito Headnet + Tight-Weave Anorak",
        "category": "Boreal Swarm Vector Protection",
        "priority": "essential",
        "rationale": (
            "Prevents vision-obscuring blackfly (mäkärä), biting midge (polttiainen), and mosquito swarms "
            "from inducing panic or rushed route-finding mistakes during slow sträng-labyrinth detours."
        ),
    },
    {
        "item": "15 m Floating Dyneema Throw-Line & Horizontal Mire-Extraction Webbing Sling",
        "category": "Quaking-Mat & Palsa-Moat Rescue",
        "priority": "essential",
        "rationale": (
            "Allows a partner on a firm dwarf-birch sträng ridge to haul a submerged hiker horizontally "
            "out of a collapsed palsa thermokarst lagg moat without approaching the undercut peat rim."
        ),
    },
    {
        "item": "Dual-Band GNSS Receiver Preloaded with 50 cm Orthophoto / Sentinel-2 Mire Water-Index Layers",
        "category": "Sträng-Ridge Continuity & Labyrinth Routing",
        "priority": "essential",
        "rationale": (
            "Resolves continuous transverse sträng bridges versus dead-end rimpi flark pools that are "
            "invisible from eye level on flat horizon-to-horizon boreal string bogs."
        ),
    },
    {
        "item": "Roll-Top 70D TPU Dry-Sack Pack Liner & Quick-Release Sternum/Hipbelt Buckles",
        "category": "Pack Buoyancy & Submersion Egress",
        "priority": "essential",
        "rationale": (
            "Turns a 20-30 kg expedition pack into positive torso flotation if a floating Sphagnum "
            "cuspidatum carpet shears over a deep flark trough, with instant buckle jettison if pinned."
        ),
    },
]


def get_all_sites() -> list[dict[str, Any]]:
    """Return all 4 boreal string-bog (aapa mire) flark-pool & palsa permafrost-mound sites."""
    return list(AAPA_PALSA_MIRE_SITES)


def get_all_aapa_palsa_mire_sites() -> list[dict[str, Any]]:
    """Alias for get_all_sites()."""
    return get_all_sites()


def get_gear_checklist() -> list[dict[str, Any]]:
    """Return the 6 essential gear checklist items for aapa mire & palsa mound crossing."""
    return [dict(item) for item in AAPA_PALSA_MIRE_GEAR_CHECKLIST]


def get_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Lookup an aapa-palsa mire site by exact ID or fuzzy substring match."""
    if not site_id or not site_id.strip():
        return None
    norm = site_id.strip().lower()
    for site in AAPA_PALSA_MIRE_SITES:
        if str(site["id"]).lower() == norm:
            return site

    alias_map = {
        "viiankiaapa": "voda-viiankiaapa-sodankyla-lapland-finland",
        "sodankyla": "voda-viiankiaapa-sodankyla-lapland-finland",
        "sodankylä": "voda-viiankiaapa-sodankyla-lapland-finland",
        "voda-viiankiaapa": "voda-viiankiaapa-sodankyla-lapland-finland",
        "aapasuo": "voda-viiankiaapa-sodankyla-lapland-finland",
        "finland": "voda-viiankiaapa-sodankyla-lapland-finland",
        "tavvavuoma": "tavvavuoma-kummavuopio-palsa-norrbotten-sweden",
        "kummavuopio": "tavvavuoma-kummavuopio-palsa-norrbotten-sweden",
        "vissatvuopmi": "tavvavuoma-kummavuopio-palsa-norrbotten-sweden",
        "vissátvuopmi": "tavvavuoma-kummavuopio-palsa-norrbotten-sweden",
        "norrbotten": "tavvavuoma-kummavuopio-palsa-norrbotten-sweden",
        "sweden": "tavvavuoma-kummavuopio-palsa-norrbotten-sweden",
        "hudson bay lowlands": "hudson-bay-lowlands-sutton-ridges-ontario-canada",
        "hudson-bay-lowlands": "hudson-bay-lowlands-sutton-ridges-ontario-canada",
        "sutton ridges": "hudson-bay-lowlands-sutton-ridges-ontario-canada",
        "sutton-ridges": "hudson-bay-lowlands-sutton-ridges-ontario-canada",
        "polar bear provincial park": "hudson-bay-lowlands-sutton-ridges-ontario-canada",
        "ontario": "hudson-bay-lowlands-sutton-ridges-ontario-canada",
        "pasvik": "pasvik-iettiselga-injarvi-palsa-finnmark-norway",
        "øvre pasvik": "pasvik-iettiselga-injarvi-palsa-finnmark-norway",
        "ovre pasvik": "pasvik-iettiselga-injarvi-palsa-finnmark-norway",
        "iettiselga": "pasvik-iettiselga-injarvi-palsa-finnmark-norway",
        "injarvi": "pasvik-iettiselga-injarvi-palsa-finnmark-norway",
        "neiden": "pasvik-iettiselga-injarvi-palsa-finnmark-norway",
        "munkefjord": "pasvik-iettiselga-injarvi-palsa-finnmark-norway",
        "finnmark": "pasvik-iettiselga-injarvi-palsa-finnmark-norway",
        "norway": "pasvik-iettiselga-injarvi-palsa-finnmark-norway",
    }
    for alias, target_id in alias_map.items():
        if alias in norm:
            for site in AAPA_PALSA_MIRE_SITES:
                if site["id"] == target_id:
                    return site

    for site in AAPA_PALSA_MIRE_SITES:
        if norm in str(site["id"]).lower() or norm in str(site["name"]).lower():
            return site
    return None


def get_aapa_palsa_mire_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Alias for get_site_by_id()."""
    return get_site_by_id(site_id)


def filter_sites(
    country: str | None = None,
    morphology: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
    regime: str | None = None,
    substrate_type: str | None = None,
) -> list[dict[str, Any]]:
    """Filter aapa-palsa mire sites by country, morphology, difficulty, and free-text search."""
    results: list[dict[str, Any]] = list(AAPA_PALSA_MIRE_SITES)
    if country and country.strip():
        c_norm = country.strip().lower()
        results = [
            s
            for s in results
            if c_norm == str(s["country"]).lower() or c_norm in str(s["country"]).lower()
        ]
    effective_morphology = (
        morphology
        if morphology and morphology.strip()
        else (regime if regime and regime.strip() else substrate_type)
    )
    if effective_morphology and effective_morphology.strip():
        m_norm = effective_morphology.strip().lower()
        results = [s for s in results if m_norm in str(s["morphology"]).lower()]
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
            or q_norm in str(s["morphology"]).lower()
            or q_norm in str(s["primary_hazard"]).lower()
            or q_norm in str(s["crossing_strategy"]).lower()
            or q_norm in str(s["field_notes"]).lower()
        ]
    return results


def calculate_aapa_palsa_mire(
    strang_width_m: float = 1.6,
    flark_trough_span_m: float = 14.0,
    active_thaw_depth_cm: float = 55.0,
    palsa_rim_fissure_score: float = 40.0,
    hiker_pack_weight_kg: float = 22.0,
) -> dict[str, Any]:
    """Calculate sträng shear breakthrough risk, palsa lagg-moat entrapment, flark detour multiplier, and swarm stress index.

    Raises ValueError if any input is outside validated physical bounds:
    - strang_width_m: 0.3 to 6.0 m
    - flark_trough_span_m: 1.0 to 65.0 m
    - active_thaw_depth_cm: 15.0 to 140.0 cm
    - palsa_rim_fissure_score: 0.0 to 100.0
    - hiker_pack_weight_kg: 5.0 to 55.0 kg
    """
    if not (0.3 <= strang_width_m <= 6.0):
        raise ValueError(
            f"strang_width_m must be between 0.3 and 6.0 m (got {strang_width_m})"
        )
    if not (1.0 <= flark_trough_span_m <= 65.0):
        raise ValueError(
            f"flark_trough_span_m must be between 1.0 and 65.0 m (got {flark_trough_span_m})"
        )
    if not (15.0 <= active_thaw_depth_cm <= 140.0):
        raise ValueError(
            f"active_thaw_depth_cm must be between 15 and 140 cm (got {active_thaw_depth_cm})"
        )
    if not (0.0 <= palsa_rim_fissure_score <= 100.0):
        raise ValueError(
            f"palsa_rim_fissure_score must be between 0 and 100 (got {palsa_rim_fissure_score})"
        )
    if not (5.0 <= hiker_pack_weight_kg <= 55.0):
        raise ValueError(
            f"hiker_pack_weight_kg must be between 5 and 55 kg (got {hiker_pack_weight_kg})"
        )

    narrow_ridge_factor = max(0.0, (6.0 - strang_width_m) / 5.7)
    thaw_norm = (active_thaw_depth_cm - 15.0) / 125.0
    flark_norm = (flark_trough_span_m - 1.0) / 64.0
    fissure_norm = palsa_rim_fissure_score / 100.0
    pack_norm = (hiker_pack_weight_kg - 5.0) / 50.0

    # 1. Sträng peat-ridge shear & root-mat breakthrough risk (%)
    raw_breakthrough = (
        4.0
        + (narrow_ridge_factor * 38.0)
        + (thaw_norm * 24.0)
        + (pack_norm * 18.0)
        + (flark_norm * 10.0)
        + (fissure_norm * 8.0)
    )
    strang_shear_breakthrough_risk_pct = round(
        min(99.0, max(1.0, raw_breakthrough)),
        1,
    )

    # 2. Palsa thermokarst lagg-moat submersion & boot-vacuum entrapment probability (%)
    raw_moat_entrapment = (
        3.5
        + (fissure_norm * 42.0)
        + (thaw_norm * 26.0)
        + (pack_norm * 15.0)
        + (flark_norm * 9.0)
        + (narrow_ridge_factor * 6.0)
    )
    palsa_lagg_moat_entrapment_pct = round(
        min(99.0, max(1.0, raw_moat_entrapment)),
        1,
    )

    # 3. Flark (rimpi) open-water trough detour distance multiplier (x)
    raw_detour_mult = (
        1.05
        + (flark_norm * 1.45)
        + (narrow_ridge_factor * 0.65)
        + (fissure_norm * 0.45)
        + (thaw_norm * 0.25)
    )
    flark_detour_distance_multiplier = round(
        min(4.5, max(1.05, raw_detour_mult)),
        2,
    )

    # 4. Boreal Simuliidae blackfly & Culicidae mosquito swarm physiological stress index (0 - 100)
    raw_swarm_stress = (
        8.0
        + (thaw_norm * 36.0)
        + (flark_norm * 28.0)
        + (fissure_norm * 14.0)
        + (pack_norm * 10.0)
        + (narrow_ridge_factor * 6.0)
    )
    blackfly_mosquito_swarm_stress_index = round(
        min(99.0, max(5.0, raw_swarm_stress)),
        1,
    )

    warnings: list[str] = []
    recommendations: list[str] = []

    if strang_shear_breakthrough_risk_pct >= 62.0 or strang_width_m <= 0.9:
        warnings.append(
            f"STRÄNG PEAT-RIDGE SHEAR BREAKTHROUGH HAZARD: Narrow {strang_width_m:.2f} m peat string "
            f"under a {hiker_pack_weight_kg:.1f} kg pack load and {active_thaw_depth_cm:.0f} cm thaw depth "
            f"carries a {strang_shear_breakthrough_risk_pct:.1f}% root-mat punch-through probability."
        )
        recommendations.append(
            "Step strictly on woody Betula nana (dwarf birch) and Larix/Salix root crowns along the sträng "
            "centerline; probe floating Sphagnum cuspidatum margins with a graduated 2.0 m staff."
        )
    elif strang_shear_breakthrough_risk_pct >= 32.0:
        warnings.append(
            f"MODERATE STRÄNG MARGIN SLUMP RISK: {strang_shear_breakthrough_risk_pct:.1f}% shear probability "
            "along waterlogged Carex-Sphagnum ridge edges."
        )
        recommendations.append(
            "Maintain 3-point balance with a 115 mm mud-basket sounding staff and avoid stepping on bright-green "
            "floating moss carpets bordering rimpi pools."
        )

    if palsa_lagg_moat_entrapment_pct >= 58.0 or palsa_rim_fissure_score >= 65.0:
        warnings.append(
            f"PALSA THERMOKARST LAGG-MOAT COLLAPSE ALERT: Fissure score {palsa_rim_fissure_score:.0f}/100 "
            f"and {active_thaw_depth_cm:.0f} cm active thaw yield a {palsa_lagg_moat_entrapment_pct:.1f}% "
            "probability of overhanging peat-apron shear into waist-deep liquid peat moats."
        )
        recommendations.append(
            "Enforce a 4-6 m standoff buffer around decaying palsa dome perimeters and keep a 15 m floating "
            "Dyneema throw-line accessible for horizontal extraction."
        )

    if flark_detour_distance_multiplier >= 2.0 or flark_trough_span_m >= 24.0:
        warnings.append(
            f"SEVERE RIMPI FLARK LABYRINTH DETOUR PENALTY: {flark_trough_span_m:.1f} m open-water flark "
            f"troughs impose a {flark_detour_distance_multiplier:.2f}x horizontal distance multiplier."
        )
        recommendations.append(
            "Consult high-resolution Sentinel-2 / aerial orthophoto layers and sight from forested moraine "
            "islands (metsäsaarekkeet) to verify continuous sträng bridges before entering the mire."
        )

    if blackfly_mosquito_swarm_stress_index >= 55.0:
        warnings.append(
            f"INTENSE BOREAL BLACKFLY & MOSQUITO SWARM STRESS: Index {blackfly_mosquito_swarm_stress_index:.1f}/100 "
            "across warm stagnant flark pools can trigger navigational rushing into dead-end rimpi traps."
        )
        recommendations.append(
            "Wear a 1200-mesh Simuliidae blackfly headnet, tight-weave hooded anorak, and Permethrin-treated "
            "cuffs before slowing down in patterned fen labyrinths."
        )

    if len(recommendations) < 2:
        recommendations.extend(
            [
                "Cross perpendicular to mire water flow by riding continuous transverse sträng ridges between moraine islands.",
                "Line packs with a 70D TPU dry-sack for positive buoyancy and keep quick-release hipbelt buckles unjammed.",
            ]
        )

    if (
        strang_shear_breakthrough_risk_pct >= 75.0
        or palsa_lagg_moat_entrapment_pct >= 75.0
        or flark_detour_distance_multiplier >= 3.0
        or active_thaw_depth_cm >= 115.0
    ):
        risk_level = "critical"
        crossing_strategy = (
            "ABORT DIRECT MIRE & PALSA-MOAT CROSSING: Extreme sträng root-mat shear and thermokarst "
            f"lagg-moat entrapment hazard ({strang_shear_breakthrough_risk_pct:.1f}% breakthrough risk, "
            f"{palsa_lagg_moat_entrapment_pct:.1f}% lagg-moat entrapment, "
            f"{flark_detour_distance_multiplier:.2f}x detour multiplier). Bypass the open rimpi basin "
            "along upland glacial esker spines, raised marine beach ridges, or dry mineral-soil forest margins."
        )
    elif (
        strang_shear_breakthrough_risk_pct >= 52.0
        or palsa_lagg_moat_entrapment_pct >= 52.0
        or flark_detour_distance_multiplier >= 2.1
        or blackfly_mosquito_swarm_stress_index >= 62.0
    ):
        risk_level = "high"
        crossing_strategy = (
            "TECHNICAL STRÄNG-SPINE WEAVE & PALSA STANDOFF ROUTING: Advance single-file along woody "
            "Betula nana sträng crests using a 2.0 m graduated sounding staff, maintain a 5 m buffer "
            "outside fissured palsa lagg moats, and stage a 15 m floating throw-line."
        )
    elif (
        strang_shear_breakthrough_risk_pct >= 26.0
        or palsa_lagg_moat_entrapment_pct >= 26.0
        or flark_detour_distance_multiplier >= 1.5
        or blackfly_mosquito_swarm_stress_index >= 38.0
    ):
        risk_level = "moderate"
        crossing_strategy = (
            "CAUTIOUS TRANSVERSE STRÄNG & SEDGE-CARPET TRANSIT: Link forested moraine islands along "
            "consolidated Carex/dwarf-birch strings, probe bright-green Sphagnum hollows before stepping, "
            "and wear knee-high boreal mire boots with blackfly headnet protection."
        )
    else:
        risk_level = "low"
        crossing_strategy = (
            "NOMINAL BROAD-STRÄNG & SHALLOW-FROST PASSAGE: Wide consolidated peat ridges and a shallow "
            "suprapermafrost frost table provide reliable bearing support; maintain standard sounding-staff "
            "checks across narrow flark channels and protect palsa peat caps from trampling."
        )

    return {
        "strang_width_m": round(float(strang_width_m), 2),
        "flark_trough_span_m": round(float(flark_trough_span_m), 1),
        "active_thaw_depth_cm": round(float(active_thaw_depth_cm), 1),
        "palsa_rim_fissure_score": round(float(palsa_rim_fissure_score), 1),
        "hiker_pack_weight_kg": round(float(hiker_pack_weight_kg), 1),
        "strang_shear_breakthrough_risk_pct": strang_shear_breakthrough_risk_pct,
        "palsa_lagg_moat_entrapment_pct": palsa_lagg_moat_entrapment_pct,
        "flark_detour_distance_multiplier": flark_detour_distance_multiplier,
        "blackfly_mosquito_swarm_stress_index": blackfly_mosquito_swarm_stress_index,
        "risk_level": risk_level,
        "safety_status": risk_level,
        "crossing_strategy": crossing_strategy,
        "navigation_strategy": crossing_strategy,
        "warnings": warnings,
        "recommendations": recommendations,
    }


_EXPLICIT_AAPA_PALSA_MIRE_TERMS: tuple[str, ...] = (
    "aapa mire",
    "aapa mires",
    "aapa-mire",
    "aapa_palsa_mire",
    "aapa-palsa-mire",
    "aapa palsa mire",
    "palsa-aapa",
    "palsa aapa",
    "aapasuo",
    "palsa mire",
    "palsa mires",
    "palsa-mire",
    "palsa mound",
    "palsa mounds",
    "palsa-mound",
    "palsa dome",
    "palsa domes",
    "palsa plateau",
    "palsar",
    "palsalagg",
    "string bog",
    "string bogs",
    "string-bog",
    "string-bogs",
    "string fen",
    "string fens",
    "string-fen",
    "flark-pool",
    "flark pool",
    "flark pools",
    "flark trough",
    "flark troughs",
    "flark-trough",
    "rimpi",
    "sträng",
    "strängar",
    "strang ridge",
    "strang ridges",
    "strang width",
    "strang_width",
    "jänteet",
    "lagg moat",
    "lagg moats",
    "lagg-moat",
    "viiankiaapa",
    "sodankyla",
    "sodankylä",
    "tavvavuoma",
    "kummavuopio",
    "vissatvuopmi",
    "vissátvuopmi",
    "hudson bay lowlands",
    "hudson-bay-lowlands",
    "sutton ridges",
    "polar bear provincial park",
    "øvre pasvik",
    "ovre pasvik",
    "neiden-munkefjord",
    "munkefjord",
    "iettiselga",
    "injarvi",
    "voda-viiankiaapa-sodankyla-lapland-finland",
    "tavvavuoma-kummavuopio-palsa-norrbotten-sweden",
    "hudson-bay-lowlands-sutton-ridges-ontario-canada",
    "pasvik-iettiselga-injarvi-palsa-finnmark-norway",
    "concentric-strang-flark-aapa",
    "ice-cored-palsa-dome-plateau",
    "thermokarst-lagg-moat-collapse",
    "minerotrophic-sedge-carpet-fen",
)

_OTHER_DOMAIN_EXCLUSIONS: tuple[str, ...] = (
    "order #",
    "order status",
    "refund",
    "return label",
    "shipping",
    "tracking number",
    # Bog shoeing specific sites & equipment exclusions
    "bog shoe",
    "bog-shoe",
    "bog shoeing",
    "bog-shoeing",
    "great dismal",
    "sphagnum quake",
    "boundary waters",
    "black spruce muskeg",
    "kenai peninsula",
    "patterned fen",
    "adirondack",
    "spring mire basin",
    "algonquin",
    "tussock fen",
    "sphagnum glider",
    "willow bearpaw",
    # Arctic polygon-tundra & retrogressive thaw-slump exclusions
    "ice-wedge",
    "ice wedge",
    "polygon tundra",
    "polygon-tundra",
    "low-center polygon",
    "high-center polygon",
    "thaw-slump",
    "thaw slump",
    "retrogressive thaw",
    "batagaika",
    "tuktoyaktuk",
    "ibyuk pingo",
    "pingo",
    "yedoma",
    "baydzherakh",
    "alas depression",
    "drunken forest",
    "noatak",
    "bykovsky",
    "lena delta",
    # Subantarctic tussock headland exclusions
    "poa flabellata",
    "poa foliosa",
    "chionochloa",
    "subantarctic",
    "sub-antarctic",
    "fortuna bay",
    "shackleton gap",
    "south georgia",
    "macquarie island",
    "featherbed",
    "enderby island",
    "auckland islands",
    "kerguelen",
    "azorella",
    "williwaw",
    "seal wallow",
    # Páramo & frailejón cushion-bog exclusions
    "paramo",
    "páramo",
    "frailejon",
    "frailejón",
    "espeletia",
    "turbera",
    "distichia",
    "sumapaz",
    "el angel",
    "cushion bog",
    # Tundra lichen & aufeis exclusions
    "cladonia",
    "reindeer lichen",
    "rhizocarpon",
    "lichenometry",
    "polychrome pass",
    "aufeis",
    "naled",
    "overflow ice",
    "frost blister",
    "ulakhan-taryn",
    "quick clay",
    "quick-clay",
    "kvikkleire",
    "leda clay",
    "leda-clay",
    "champlain sea",
    "laflamme sea",
    "gauldalen",
    "gjerdrum",
    "romerike",
    "lemieux",
    "saint-jean-vianney",
    "retrogressive slump",
    "glaciomarine clay",
)


def is_aapa_palsa_mire_query(query: str) -> bool:
    """Return True if the user query targets the Boreal String-Bog (Aapa Mire) Flark-Pool & Palsa Permafrost-Mound Crossing Guide."""
    if not query or not query.strip():
        return False
    q = query.strip().lower()

    if any(excl in q for excl in _OTHER_DOMAIN_EXCLUSIONS):
        return False

    if any(term in q for term in _EXPLICIT_AAPA_PALSA_MIRE_TERMS):
        return True

    if "flark" in q or "palsa" in q or "aapa" in q:
        return True

    has_mire_context = any(
        w in q
        for w in (
            "boreal mire",
            "permafrost mound",
            "permafrost-mound",
            "peat ridge",
            "peat string",
            "sedge carpet fen",
        )
    )
    has_crossing_mechanic = any(
        w in q
        for w in (
            "strang",
            "sträng",
            "lagg",
            "moat",
            "rimpi",
            "thaw depth",
            "fissure",
            "blackfly",
        )
    )
    return has_mire_context and has_crossing_mechanic


def detect_aapa_palsa_mire_intent(query: str) -> bool:
    """Alias for is_aapa_palsa_mire_query()."""
    return is_aapa_palsa_mire_query(query)


def extract_aapa_palsa_mire_params(query: str) -> dict[str, Any]:
    """Extract aapa-palsa mire site_id and calculator parameters from a natural-language query."""
    q = (query or "").lower()

    matched_site: dict[str, Any] | None = None
    for token in (
        "voda-viiankiaapa-sodankyla-lapland-finland",
        "tavvavuoma-kummavuopio-palsa-norrbotten-sweden",
        "hudson-bay-lowlands-sutton-ridges-ontario-canada",
        "pasvik-iettiselga-injarvi-palsa-finnmark-norway",
        "viiankiaapa",
        "sodankylä",
        "sodankyla",
        "aapasuo",
        "tavvavuoma",
        "kummavuopio",
        "vissátvuopmi",
        "vissatvuopmi",
        "norrbotten",
        "hudson bay lowlands",
        "hudson-bay-lowlands",
        "sutton ridges",
        "polar bear provincial park",
        "øvre pasvik",
        "ovre pasvik",
        "pasvik",
        "iettiselga",
        "injarvi",
        "neiden",
        "munkefjord",
        "finnmark",
    ):
        if token in q:
            matched_site = get_site_by_id(token)
            if matched_site is not None:
                break

    site_defaults: dict[str, Any] = matched_site or AAPA_PALSA_MIRE_SITES[0]
    strang_width_m = float(site_defaults["default_strang_width_m"])
    flark_trough_span_m = float(site_defaults["default_flark_trough_span_m"])
    active_thaw_depth_cm = float(site_defaults["default_active_thaw_depth_cm"])
    palsa_rim_fissure_score = float(site_defaults["default_palsa_rim_fissure_score"])
    hiker_pack_weight_kg = float(site_defaults["default_hiker_pack_weight_kg"])
    has_calc_params = False

    # 1. Sträng width (m)
    strang_patterns = [
        r"(?:str[aä]ng\s+)?(?:ridge\s+)?width\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*m\b",
        r"(\d+(?:\.\d+)?)\s*m\s+(?:str[aä]ng\s+)?(?:ridge\s+)?width",
        r"str[aä]ng\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*m\b",
    ]
    for pat in strang_patterns:
        m = re.search(pat, q)
        if m:
            strang_width_m = max(0.3, min(6.0, float(m.group(1))))
            has_calc_params = True
            break

    # 2. Flark trough span (m)
    flark_patterns = [
        r"(?:flark|rimpi|trough)(?:\s+trough)?(?:\s+span|\s+width)?\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*m\b",
        r"(\d+(?:\.\d+)?)\s*m\s+(?:flark|rimpi)(?:\s+trough)?(?:\s+span)?",
    ]
    for pat in flark_patterns:
        m = re.search(pat, q)
        if m:
            flark_trough_span_m = max(1.0, min(65.0, float(m.group(1))))
            has_calc_params = True
            break

    # 3. Active thaw depth (cm)
    thaw_patterns = [
        r"(?:active\s+)?(?:thaw\s+|frost\s+)?depth\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*cm\b",
        r"(\d+(?:\.\d+)?)\s*cm\s+(?:active\s+)?(?:thaw\s+|frost\s+)?depth",
    ]
    for pat in thaw_patterns:
        m = re.search(pat, q)
        if m:
            active_thaw_depth_cm = max(15.0, min(140.0, float(m.group(1))))
            has_calc_params = True
            break

    # 4. Palsa rim fissure score (0-100)
    fissure_patterns = [
        r"(?:palsa\s+)?(?:rim\s+)?fissure(?:\s+score|\s+index)?\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)",
        r"(\d+(?:\.\d+)?)\s*(?:/100|%\s*)?(?:palsa\s+)?(?:rim\s+)?fissure(?:\s+score)?",
    ]
    for pat in fissure_patterns:
        m = re.search(pat, q)
        if m:
            palsa_rim_fissure_score = max(0.0, min(100.0, float(m.group(1))))
            has_calc_params = True
            break

    # 5. Hiker pack weight (kg)
    pack_patterns = [
        r"(?:hiker\s+)?pack(?:\s+weight|\s+load)?\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*kg\b",
        r"(\d+(?:\.\d+)?)\s*kg\s+(?:hiker\s+)?pack(?:\s+weight|\s+load)?",
    ]
    for pat in pack_patterns:
        m = re.search(pat, q)
        if m:
            hiker_pack_weight_kg = max(5.0, min(55.0, float(m.group(1))))
            has_calc_params = True
            break

    if any(w in q for w in ("calculate", "calculator", "compute")) and not has_calc_params:
        has_calc_params = True

    return {
        "site_id": matched_site["id"] if matched_site else None,
        "site": matched_site,
        "strang_width_m": strang_width_m,
        "flark_trough_span_m": flark_trough_span_m,
        "active_thaw_depth_cm": active_thaw_depth_cm,
        "palsa_rim_fissure_score": palsa_rim_fissure_score,
        "hiker_pack_weight_kg": hiker_pack_weight_kg,
        "has_calc_params": has_calc_params,
    }


def format_aapa_palsa_mire_response(query: str) -> dict[str, Any]:
    """Build a structured aapa-palsa mire response payload for chat and SSE endpoints."""
    params: dict[str, Any] = extract_aapa_palsa_mire_params(query)
    matched_site: dict[str, Any] | None = params["site"]
    has_calc = bool(params["has_calc_params"])

    calc_result: dict[str, Any] = calculate_aapa_palsa_mire(
        strang_width_m=float(params["strang_width_m"]),
        flark_trough_span_m=float(params["flark_trough_span_m"]),
        active_thaw_depth_cm=float(params["active_thaw_depth_cm"]),
        palsa_rim_fissure_score=float(params["palsa_rim_fissure_score"]),
        hiker_pack_weight_kg=float(params["hiker_pack_weight_kg"]),
    )

    if has_calc:
        action = "aapa_palsa_mire_calculated"
        matched_sites: list[dict[str, Any]] = (
            [matched_site] if matched_site else list(AAPA_PALSA_MIRE_SITES)
        )
    elif matched_site is not None:
        action = "aapa_palsa_mire_lookup"
        matched_sites = [matched_site]
    else:
        action = "aapa_palsa_mire_info"
        matched_sites = list(AAPA_PALSA_MIRE_SITES)

    site_summary = (
        f"{matched_site['name']} ({matched_site['country']}, {matched_site['elevation_range']})"
        if matched_site
        else "Boreal String-Bog (Aapa Mire) Flark-Pool & Palsa Permafrost-Mound Corridors (Viiankiaapa, Tavvavuoma, Hudson Bay Lowlands, Øvre Pasvik)"
    )

    summary_lines: list[str] = [
        f"### Boreal String-Bog (Aapa Mire) Flark-Pool & Palsa Permafrost-Mound Assessment: {site_summary}",
        f"- **Safety / Risk Level:** `{calc_result['risk_level'].upper()}`",
        f"- **Sträng Shear Breakthrough Risk:** `{calc_result['strang_shear_breakthrough_risk_pct']:.1f}%` "
        f"(Sträng Width `{calc_result['strang_width_m']:.2f} m`, "
        f"Pack Weight `{calc_result['hiker_pack_weight_kg']:.1f} kg`)",
        f"- **Palsa Lagg-Moat Entrapment Risk:** `{calc_result['palsa_lagg_moat_entrapment_pct']:.1f}%` "
        f"(Palsa Rim Fissure Score `{calc_result['palsa_rim_fissure_score']:.0f}/100`, "
        f"Active Thaw Depth `{calc_result['active_thaw_depth_cm']:.0f} cm`)",
        f"- **Flark Detour Distance Multiplier:** `{calc_result['flark_detour_distance_multiplier']:.2f}x` "
        f"(Flark Trough Span `{calc_result['flark_trough_span_m']:.1f} m`)",
        f"- **Blackfly / Mosquito Swarm Stress Index:** `{calc_result['blackfly_mosquito_swarm_stress_index']:.1f} / 100`",
        f"- **Crossing Strategy:** {calc_result['crossing_strategy']}",
    ]
    if matched_site:
        summary_lines.append(
            f"- **Site Navigation Protocol:** {matched_site['navigation_protocol']}"
        )
        summary_lines.append(
            f"- **Mire & Permafrost Conservation Protocol:** {matched_site['conservation_protocol']}"
        )
    if calc_result["warnings"]:
        summary_lines.append("- **Active Warnings:** " + " | ".join(calc_result["warnings"]))
    summary_lines.append(
        "- **Essential Gear:** "
        + "; ".join(item["item"] for item in AAPA_PALSA_MIRE_GEAR_CHECKLIST[:4])
    )

    formatted_text = "\n".join(summary_lines)

    return {
        "action": action,
        "query": query,
        "site": dict(matched_site) if matched_site else None,
        "matched_sites": [dict(s) for s in matched_sites],
        "sites": [dict(s) for s in AAPA_PALSA_MIRE_SITES],
        "calculation": calc_result,
        "gear_checklist": get_gear_checklist(),
        "answer": formatted_text,
        "formatted_response": formatted_text,
    }


def build_aapa_palsa_mire_prompt(info_or_query: dict[str, Any] | str) -> str:
    """Build the system prompt grounding block for LLM generation on aapa-palsa mire queries."""
    info: dict[str, Any] = (
        format_aapa_palsa_mire_response(info_or_query)
        if isinstance(info_or_query, str)
        else info_or_query
    )
    calc: dict[str, Any] = info.get("calculation") or {}
    site: dict[str, Any] | None = info.get("site")
    site_header = (
        f"Target Site: {site['name']} ({site['country']}, {site['elevation_range']}, morphology={site['morphology']})"
        if site
        else "Target Domain: Boreal String-Bog (Aapa Mire) Flark-Pool & Palsa Permafrost-Mound Crossing"
    )
    warnings_str = "; ".join(calc.get("warnings", [])) or "None"
    recs_str = "; ".join(calc.get("recommendations", []))
    return (
        "\n\n[BOREAL STRING-BOG (AAPA MIRE) FLARK-POOL & PALSA PERMAFROST-MOUND CROSSING GUIDE]\n"
        f"{site_header}\n"
        f"Action: {info.get('action', 'aapa_palsa_mire_info')}\n"
        f"Risk Level: {calc.get('risk_level', 'moderate')}\n"
        f"Inputs: strang_width_m={calc.get('strang_width_m')}, "
        f"flark_trough_span_m={calc.get('flark_trough_span_m')}, "
        f"active_thaw_depth_cm={calc.get('active_thaw_depth_cm')}, "
        f"palsa_rim_fissure_score={calc.get('palsa_rim_fissure_score')}, "
        f"hiker_pack_weight_kg={calc.get('hiker_pack_weight_kg')}\n"
        f"Calculated Metrics: strang_shear_breakthrough_risk_pct={calc.get('strang_shear_breakthrough_risk_pct')}%, "
        f"palsa_lagg_moat_entrapment_pct={calc.get('palsa_lagg_moat_entrapment_pct')}%, "
        f"flark_detour_distance_multiplier={calc.get('flark_detour_distance_multiplier')}x, "
        f"blackfly_mosquito_swarm_stress_index={calc.get('blackfly_mosquito_swarm_stress_index')}/100\n"
        f"Crossing Strategy: {calc.get('crossing_strategy', '')}\n"
        f"Warnings: {warnings_str}\n"
        f"Recommendations: {recs_str}\n"
        "Provide concrete boreal string-bog (aapa mire) flark-pool and palsa permafrost-mound crossing "
        "guidance covering Betula nana sträng peat-ridge continuity sighting, 2.0 m graduated sounding-staff "
        "probing of bottomless rimpi flark troughs and collapsing palsa thermokarst lagg moats, 15 m floating "
        "Dyneema throw-line extraction, 1200-mesh Simuliidae blackfly defense, and zero-trampling conservation "
        "of ice-cored palsa peat domes.\n"
    )


def get_chat_response(query: str) -> dict[str, Any]:
    """Return a standalone fallback chat response dictionary with aapa_palsa_mire_info."""
    info: dict[str, Any] = format_aapa_palsa_mire_response(query)
    return {
        "answer": info["formatted_response"],
        "context": [s["name"] for s in info["matched_sites"]],
        "aapa_palsa_mire_info": info,
    }


def generate_stream_events(query: str) -> Iterator[dict[str, Any]]:
    """Yield SSE event dictionaries for standalone aapa-palsa mire streaming."""
    info: dict[str, Any] = format_aapa_palsa_mire_response(query)
    text = str(info["formatted_response"])
    midpoint = max(1, len(text) // 2)
    yield {
        "answer": text[:midpoint],
        "context": [s["name"] for s in info["matched_sites"]],
        "aapa_palsa_mire_info": info,
    }
    yield {
        "answer": text[midpoint:],
    }
    yield {
        "done": True,
        "aapa_palsa_mire_info": info,
    }
