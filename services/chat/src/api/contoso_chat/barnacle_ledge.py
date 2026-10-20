"""Coastal Intertidal Sabellariid Worm-Reef & Barnacle-Encrusted Basalt Ledge Traversing Guide.

Covers high-consequence intertidal biogenic worm-reefs and barnacle-encrusted wave-cut basalt/slate shelves:
- Cape Perpetua & Thor's Well Basalt Mussel-Barnacle Bench (Oregon Coast, USA)
- Duckpool & Bude Intertidal Sabellaria alveolata Honeycomb Worm-Reef (North Cornwall, UK)
- Owen Point & Thrasher Cove Wave-Cut Porphyra-Barnacle Shelf (West Coast Trail, BC, Canada)
- Roncudo & Cabo Vilán Gooseneck-Barnacle (Percebe) Surge Ledges (Costa da Morte, Galicia, Spain)

Deterministic calculator evaluates:
- Infragravity sneaker-wave & surge overwash probability (%)
- Barnacle & mussel shell laceration shear score (0-100)
- Biogenic Sabellariid honeycomb worm-reef crush damage risk (%)
- Safe low-tide traversal window before swash submergence (minutes)
"""

from __future__ import annotations

import re
from collections.abc import Iterator
from typing import Any


class BarnacleLedgeSite(dict[str, Any]):
    """Dictionary subclass supporting attribute access for barnacle ledge & worm-reef sites."""

    def __getattr__(self, name: str) -> Any:
        try:
            return self[name]
        except KeyError as exc:
            raise AttributeError(
                f"'BarnacleLedgeSite' object has no attribute '{name}'"
            ) from exc


BARNACLE_LEDGE_SITES: list[BarnacleLedgeSite] = [
    BarnacleLedgeSite(
        {
            "id": "cape-perpetua-yachats-basalt-bench-oregon",
            "name": "Cape Perpetua & Thor's Well Basalt Mussel-Barnacle Bench",
            "country": "USA",
            "region": "Siuslaw National Forest / Yachats Central Oregon Coast, Oregon",
            "elevation_range": "-0.5 m - 3.5 m MLLW",
            "max_elevation_m": 4,
            "substrate_type": "balanus-mussel-basalt-bench",
            "morphology": "balanus-mussel-basalt-bench",
            "difficulty": "extreme",
            "default_swell_height_m": 2.9,
            "default_swell_period_sec": 16.0,
            "default_algal_biofilm_cover_pct": 65.0,
            "default_sabellariid_colony_density_pct": 18.0,
            "default_ledge_freeboard_m": 0.9,
            "primary_hazard": (
                "Long-period North Pacific infragravity sneaker waves erupting out of Thor's Well "
                "sinkhole and Spouting Horn surge channels across razor-sharp Balanus glandula "
                "acorn-barnacle and Mytilus californianus mussel beds."
            ),
            "traversal_strategy": (
                "Maintain a 3-point low center-of-gravity stance in tungsten-carbide studded boots, "
                "station a dedicated horizon swell spotter watching for 14-20 s wave groups, and "
                "never approach within 6 m of the Thor's Well rim during flood tide or long-period groundswell."
            ),
            "navigation_protocol": (
                "Transit only during minus or low slack tides with >= 1.5 m bench freeboard; step onto "
                "dry or barnacle-roughened upper tholeiitic basalt tables and avoid dark Porphyra/Ulva "
                "mucilage aprons sloping into surge trenches."
            ),
            "conservation_protocol": (
                "Step on bare basalt vesicles or dense acorn-barnacle matrices rather than crushing "
                "aggregated Mytilus mussel beds, Pisaster ochre sea stars, or cryptic Phragmatopoma "
                "sand-tube worm colonies along the lower fringe."
            ),
            "progression_protocol": (
                "Step on bare basalt vesicles or dense acorn-barnacle matrices rather than crushing "
                "aggregated Mytilus mussel beds, Pisaster ochre sea stars, or cryptic Phragmatopoma "
                "sand-tube worm colonies along the lower fringe."
            ),
            "field_notes": (
                "Wave-group bound infragravity bores overtop the Cape Perpetua basalt bench without warning, "
                "dragging fallen hikers across calcified barnacle plates capable of severing tendons and drysuits."
            ),
        }
    ),
    BarnacleLedgeSite(
        {
            "id": "duckpool-bude-sabellaria-reef-cornwall-uk",
            "name": "Duckpool & Bude Intertidal Sabellaria alveolata Honeycomb Worm-Reef",
            "country": "UK",
            "region": "North Cornwall & Hartland Quay Foreshore, Southwest England",
            "elevation_range": "-1.0 m - 2.5 m CD",
            "max_elevation_m": 3,
            "substrate_type": "sabellariid-honeycomb-worm-reef",
            "morphology": "sabellariid-honeycomb-worm-reef",
            "difficulty": "moderate",
            "default_swell_height_m": 1.4,
            "default_swell_period_sec": 11.0,
            "default_algal_biofilm_cover_pct": 35.0,
            "default_sabellariid_colony_density_pct": 78.0,
            "default_ledge_freeboard_m": 1.9,
            "primary_hazard": (
                "Brittle cemented sand-tube hummocks of Sabellaria alveolata honeycomb worms that "
                "collapse under boot heel pressure, causing sudden ankle inversion onto steeply dipping "
                "Carboniferous Culm sandstone and Semibalanus barnacle ribs."
            ),
            "traversal_strategy": (
                "Thread narrow sand and bare-rock corridors between golden-brown Sabellaria alveolata "
                "pillow hummocks using a graduated intertidal probing staff; never step onto overhanging "
                "honeycomb reef rims or undercut biogenic bridges."
            ),
            "navigation_protocol": (
                "Plan foreshore return before the Bristol Channel / Celtic Sea flood tide pinches "
                "the sand-and-reef platform against vertical Culm shale cliffs between Duckpool and Sandymouth."
            ),
            "conservation_protocol": (
                "Strictly zero-footfall on UK BAP Priority Habitat Sabellaria alveolata honeycomb worm-reefs: "
                "a single boot print fractures hundreds of cemented sand tubes and triggers wave erosion of "
                "the entire colony."
            ),
            "progression_protocol": (
                "Strictly zero-footfall on UK BAP Priority Habitat Sabellaria alveolata honeycomb worm-reefs: "
                "a single boot print fractures hundreds of cemented sand tubes and triggers wave erosion of "
                "the entire colony."
            ),
            "field_notes": (
                "Sabellaria alveolata builds fragile honeycomb reefs up to 60 cm thick across Bude and "
                "Duckpool boulders; preserving tube-aperture integrity is essential for coastal biodiversity."
            ),
        }
    ),
    BarnacleLedgeSite(
        {
            "id": "west-coast-trail-owen-point-shelf-bc-canada",
            "name": "Owen Point & Thrasher Cove Wave-Cut Porphyra-Barnacle Shelf",
            "country": "Canada",
            "region": "Pacific Rim National Park Reserve, Vancouver Island, British Columbia",
            "elevation_range": "0.0 m - 3.2 m CD",
            "max_elevation_m": 3,
            "substrate_type": "porphyra-ulva-glazed-shelf",
            "morphology": "porphyra-ulva-glazed-shelf",
            "difficulty": "challenging",
            "default_swell_height_m": 2.1,
            "default_swell_period_sec": 13.5,
            "default_algal_biofilm_cover_pct": 74.0,
            "default_sabellariid_colony_density_pct": 32.0,
            "default_ledge_freeboard_m": 1.4,
            "primary_hazard": (
                "Slick Porphyra (nori), Ulva (sea lettuce), and Fucus rockweed mucilage glazing "
                "wave-cut sandstone-basalt shelves interspersed with razor-edged Balanus nubilus "
                "giant barnacles and surge-flooded slot gullies around Owen Point."
            ),
            "traversal_strategy": (
                "Unbuckle backpack hip belts before rounding Owen Point shelves, plant tungsten-studded "
                "soles onto pale barnacle-encrusted patches for mechanical bite, and time surge-slot "
                "crossings between Pacific groundswell sets."
            ),
            "navigation_protocol": (
                "Only round Owen Point at tide levels <= 1.8 m (6.0 ft) on a falling tide; if Pacific "
                "swell overwashes the shelf tables or fills the sea-cave slots, divert to the inland "
                "ladder-and-cable forest bypass."
            ),
            "conservation_protocol": (
                "Avoid scraping trekking-pole carbide tips across fragile Sabellaria cementarii and "
                "coralline algal turf pools lining the mid-littoral shelf depressions."
            ),
            "progression_protocol": (
                "Avoid scraping trekking-pole carbide tips across fragile Sabellaria cementarii and "
                "coralline algal turf pools lining the mid-littoral shelf depressions."
            ),
            "field_notes": (
                "Wet Porphyra and Ulva biofilms exhibit coefficients of friction below 0.08—comparable "
                "to wet glare ice—while adjacent barnacle tests act like coarse rasps on skin and rain gear."
            ),
        }
    ),
    BarnacleLedgeSite(
        {
            "id": "cabo-percebes-costa-da-morte-galicia-spain",
            "name": "Roncudo & Cabo Vilán Gooseneck-Barnacle (Percebe) Surge Ledges",
            "country": "Spain",
            "region": "Costa da Morte (Corme / Camariñas), A Coruña, Galicia",
            "elevation_range": "-0.5 m - 4.5 m Chart Datum",
            "max_elevation_m": 5,
            "substrate_type": "pollicipes-gooseneck-surge-channel",
            "morphology": "pollicipes-gooseneck-surge-channel",
            "difficulty": "extreme",
            "default_swell_height_m": 3.4,
            "default_swell_period_sec": 15.5,
            "default_algal_biofilm_cover_pct": 52.0,
            "default_sabellariid_colony_density_pct": 24.0,
            "default_ledge_freeboard_m": 0.8,
            "primary_hazard": (
                "Explosive North Atlantic breaking swell and vertical whitewater up-rush across "
                "steep granitic-basalt surge ledges densely colonized by Pollicipes pollicipes "
                "gooseneck barnacles (percebes) and sharp Chthamalus/Mytilus crusts."
            ),
            "traversal_strategy": (
                "Operate in a two-person tethered percebeiro team with an upland cliff-anchor belayer, "
                "wear 5 mm Kevlar-armored neoprene with ANSI A5 cut-resistant gloves, and retreat upslope "
                "before the third wave of an incoming Atlantic set strikes the lower shelf."
            ),
            "navigation_protocol": (
                "Maintain a taut dynamic safety line to a high bedrock eye-bolt above the whitewater "
                "splash zone; never turn your back to the open Atlantic horizon on Costa da Morte ledges."
            ),
            "conservation_protocol": (
                "Respect Galician Cofradía percebeiro marine reserve closures, avoid trampling juvenile "
                "Pollicipes recruitment patches, and step clear of lower-littoral Sabellaria alveolata "
                "sand-tube cushions."
            ),
            "progression_protocol": (
                "Respect Galician Cofradía percebeiro marine reserve closures, avoid trampling juvenile "
                "Pollicipes recruitment patches, and step clear of lower-littoral Sabellaria alveolata "
                "sand-tube cushions."
            ),
            "field_notes": (
                "Costa da Morte surge channels focus Atlantic wave energy onto vertical walls where "
                "receding backwash suction can pluck un-tethered climbers into aerated boulder gullies."
            ),
        }
    ),
]

BARNACLE_SITES: list[BarnacleLedgeSite] = BARNACLE_LEDGE_SITES

BARNACLE_LEDGE_GEAR_CHECKLIST: list[dict[str, str]] = [
    {
        "item": "Tungsten-Carbide Studded Intertidal Felt-and-Rubber Boots",
        "category": "Intertidal Traction & Biofilm Bite",
        "priority": "essential",
        "rationale": (
            "Penetrates slick Porphyra/Ulva algal mucilage films to bite directly into basalt "
            "and granite micro-asperities without skidding into barnacle-lined surge slots."
        ),
    },
    {
        "item": "ANSI Cut-Level A5 Kevlar-Palm Neoprene Intertidal Gloves",
        "category": "Barnacle & Mussel Laceration Armor",
        "priority": "essential",
        "rationale": (
            "Prevents deep palmar tendon and arterial lacerations when bracing against razor-sharp "
            "Balanus, Semibalanus, and Mytilus shell plates during wave overwash."
        ),
    },
    {
        "item": "CE EN 1385 Watersports Helmet & Cordura-Armored Shin/Knee Guards",
        "category": "Surge Impact & Abrasion Protection",
        "priority": "essential",
        "rationale": (
            "Shields cranium, patella, and tibia against violent wave-bore knockdowns onto "
            "calcified barnacle benches and volcanic rock edges."
        ),
    },
    {
        "item": "Graduated Intertidal Probing Staff with Rubberized Biogenic-Safe Foot",
        "category": "Submerged Slot Probing & Reef Preservation",
        "priority": "essential",
        "rationale": (
            "Tests hidden surge-gully drop-offs under turbid foam while avoiding point-load "
            "puncturing of fragile Sabellaria alveolata honeycomb worm-reef hummocks."
        ),
    },
    {
        "item": "Quick-Release 50N+ Low-Profile Coasteering PFD & 20 m Floating Throwline",
        "category": "Infragravity Overwash Extraction",
        "priority": "essential",
        "rationale": (
            "Provides immediate positive buoyancy in aerated whitewater backwash and enables "
            "rapid cliff-ledge recovery without swimming against breaking surge."
        ),
    },
    {
        "item": "Waterproof Digital Tide-and-Swell Period Chronograph + Wound Irrigation Kit",
        "category": "Tidal Window Timing & Marine Sepsis First Aid",
        "priority": "essential",
        "rationale": (
            "Tracks MLLW low-tide cutoff windows and 14-20 s sneaker-wave set intervals while "
            "providing high-pressure povidone-iodine irrigation for barnacle cuts (Vibrio prophylaxis)."
        ),
    },
]


def get_all_sites() -> list[dict[str, Any]]:
    """Return all 4 coastal intertidal sabellariid worm-reef & barnacle ledge sites."""
    return list(BARNACLE_LEDGE_SITES)


def get_all_barnacle_ledge_sites() -> list[dict[str, Any]]:
    """Alias for get_all_sites()."""
    return get_all_sites()


def get_gear_checklist() -> list[dict[str, Any]]:
    """Return the 6 essential gear checklist items for barnacle ledge & worm-reef traversing."""
    return [dict(item) for item in BARNACLE_LEDGE_GEAR_CHECKLIST]


def get_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Lookup a barnacle ledge site by exact ID or fuzzy substring match."""
    if not site_id or not site_id.strip():
        return None
    norm = site_id.strip().lower()
    for site in BARNACLE_LEDGE_SITES:
        if str(site["id"]).lower() == norm:
            return site

    alias_map = {
        "cape perpetua": "cape-perpetua-yachats-basalt-bench-oregon",
        "cape-perpetua": "cape-perpetua-yachats-basalt-bench-oregon",
        "thor's well": "cape-perpetua-yachats-basalt-bench-oregon",
        "thors well": "cape-perpetua-yachats-basalt-bench-oregon",
        "yachats": "cape-perpetua-yachats-basalt-bench-oregon",
        "duckpool": "duckpool-bude-sabellaria-reef-cornwall-uk",
        "bude": "duckpool-bude-sabellaria-reef-cornwall-uk",
        "sabellaria": "duckpool-bude-sabellaria-reef-cornwall-uk",
        "cornwall": "duckpool-bude-sabellaria-reef-cornwall-uk",
        "owen point": "west-coast-trail-owen-point-shelf-bc-canada",
        "owen-point": "west-coast-trail-owen-point-shelf-bc-canada",
        "thrasher cove": "west-coast-trail-owen-point-shelf-bc-canada",
        "porphyra": "west-coast-trail-owen-point-shelf-bc-canada",
        "roncudo": "cabo-percebes-costa-da-morte-galicia-spain",
        "cabo vilan": "cabo-percebes-costa-da-morte-galicia-spain",
        "cabo vilán": "cabo-percebes-costa-da-morte-galicia-spain",
        "cabo percebes": "cabo-percebes-costa-da-morte-galicia-spain",
        "costa da morte": "cabo-percebes-costa-da-morte-galicia-spain",
        "percebe": "cabo-percebes-costa-da-morte-galicia-spain",
        "galicia": "cabo-percebes-costa-da-morte-galicia-spain",
    }
    for alias, target_id in alias_map.items():
        if alias in norm:
            for site in BARNACLE_LEDGE_SITES:
                if site["id"] == target_id:
                    return site

    for site in BARNACLE_LEDGE_SITES:
        if norm in str(site["id"]).lower() or norm in str(site["name"]).lower():
            return site
    return None


def get_barnacle_ledge_site_by_id(site_id: str) -> dict[str, Any] | None:
    """Alias for get_site_by_id()."""
    return get_site_by_id(site_id)


def filter_sites(
    country: str | None = None,
    substrate_type: str | None = None,
    difficulty: str | None = None,
    search: str | None = None,
    morphology: str | None = None,
) -> list[dict[str, Any]]:
    """Filter barnacle ledge sites by country, substrate_type, difficulty, and free-text search."""
    results: list[dict[str, Any]] = list(BARNACLE_LEDGE_SITES)
    if country and country.strip():
        c_norm = country.strip().lower()
        results = [
            s
            for s in results
            if c_norm == str(s["country"]).lower() or c_norm in str(s["country"]).lower()
        ]
    effective_substrate = (
        substrate_type if substrate_type and substrate_type.strip() else morphology
    )
    if effective_substrate and effective_substrate.strip():
        sub_norm = effective_substrate.strip().lower()
        results = [s for s in results if sub_norm in str(s["substrate_type"]).lower()]
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
            or q_norm in str(s["substrate_type"]).lower()
            or q_norm in str(s["primary_hazard"]).lower()
            or q_norm in str(s["traversal_strategy"]).lower()
            or q_norm in str(s["field_notes"]).lower()
        ]
    return results


def calculate_barnacle_ledge(
    swell_height_m: float = 1.8,
    swell_period_sec: float = 12.0,
    algal_biofilm_cover_pct: float = 40.0,
    sabellariid_colony_density_pct: float = 35.0,
    ledge_freeboard_m: float = 1.6,
) -> dict[str, Any]:
    """Calculate infragravity overwash probability, barnacle laceration shear score, biogenic reef crush risk, and safe tide window.

    Raises ValueError if any input is outside validated physical bounds:
    - swell_height_m: 0.2 to 6.5 m
    - swell_period_sec: 4.0 to 22.0 sec
    - algal_biofilm_cover_pct: 0.0 to 100.0 %
    - sabellariid_colony_density_pct: 0.0 to 100.0 %
    - ledge_freeboard_m: 0.1 to 5.0 m
    """
    if not (0.2 <= swell_height_m <= 6.5):
        raise ValueError(
            f"swell_height_m must be between 0.2 and 6.5 m (got {swell_height_m})"
        )
    if not (4.0 <= swell_period_sec <= 22.0):
        raise ValueError(
            f"swell_period_sec must be between 4 and 22 sec (got {swell_period_sec})"
        )
    if not (0.0 <= algal_biofilm_cover_pct <= 100.0):
        raise ValueError(
            f"algal_biofilm_cover_pct must be between 0 and 100 % (got {algal_biofilm_cover_pct})"
        )
    if not (0.0 <= sabellariid_colony_density_pct <= 100.0):
        raise ValueError(
            "sabellariid_colony_density_pct must be between 0 and 100 % "
            f"(got {sabellariid_colony_density_pct})"
        )
    if not (0.1 <= ledge_freeboard_m <= 5.0):
        raise ValueError(
            f"ledge_freeboard_m must be between 0.1 and 5.0 m (got {ledge_freeboard_m})"
        )

    # 1. Infragravity sneaker-wave & surge overwash probability (%)
    # Wave runup R2% scales with swell height and period (Hunt / Stockdon relation) vs ledge freeboard
    wave_energy_factor = (swell_height_m * 11.5) + ((swell_period_sec - 4.0) * 2.15)
    freeboard_deficit_factor = max(0.0, (2.8 - ledge_freeboard_m) * 14.5)
    overwash_synergy = (swell_height_m * (swell_period_sec / 10.0)) / (ledge_freeboard_m + 0.45) * 6.2
    raw_overwash_prob = 2.0 + wave_energy_factor + freeboard_deficit_factor + overwash_synergy - (ledge_freeboard_m * 6.5)
    infragravity_overwash_probability_pct = round(
        min(99.0, max(1.0, raw_overwash_prob)),
        1,
    )

    # 2. Barnacle & mussel shell laceration shear score (0 - 100)
    # Driven by algal mucilage slip hazard + wave surge drag across razor-sharp Balanus/Mytilus/Pollicipes plates
    raw_laceration_score = (
        6.0
        + (algal_biofilm_cover_pct * 0.44)
        + (swell_height_m * 8.2)
        + ((swell_period_sec - 4.0) * 1.15)
        + (infragravity_overwash_probability_pct * 0.24)
    )
    barnacle_laceration_shear_score = round(
        min(99.0, max(2.0, raw_laceration_score)),
        1,
    )

    # 3. Biogenic Sabellariid honeycomb worm-reef crush damage risk (%)
    # Driven by colony coverage density, slippery biofilm forcing off-balance corrective steps, and narrow freeboard
    raw_crush_damage = (
        1.5
        + (sabellariid_colony_density_pct * 0.68)
        + (algal_biofilm_cover_pct * 0.19)
        + max(0.0, (2.2 - ledge_freeboard_m) * 6.0)
    )
    biogenic_reef_crush_damage_pct = round(
        min(99.0, max(1.0, raw_crush_damage)),
        1,
    )

    # 4. Safe low-tide traversal window before swash submergence (minutes)
    raw_window_min = (
        95.0
        + (ledge_freeboard_m * 28.0)
        - (swell_height_m * 16.5)
        - ((swell_period_sec - 4.0) * 2.6)
        - (algal_biofilm_cover_pct * 0.22)
    )
    safe_tide_window_minutes = int(round(min(240.0, max(5.0, raw_window_min))))

    warnings: list[str] = []
    recommendations: list[str] = []

    if infragravity_overwash_probability_pct >= 65.0 or ledge_freeboard_m <= 0.8:
        warnings.append(
            f"INFRAGRAVITY SNEAKER-WAVE OVERWASH HAZARD: {swell_height_m:.1f} m / {swell_period_sec:.1f} s swell "
            f"against {ledge_freeboard_m:.1f} m freeboard yields a {infragravity_overwash_probability_pct:.1f}% "
            "probability of violent surge-bore bench sweeps."
        )
        recommendations.append(
            "Abandon lower intertidal basalt benches immediately; retreat above the high-water spray "
            "trimline or use the inland forest/cliff-top bypass."
        )
    elif infragravity_overwash_probability_pct >= 35.0:
        warnings.append(
            f"ELEVATED SURGE RUNUP: {infragravity_overwash_probability_pct:.1f}% overwash probability "
            f"with {safe_tide_window_minutes} min remaining in the low-tide window."
        )
        recommendations.append(
            "Post a dedicated horizon swell spotter counting wave sets (14-20 s intervals) and unbuckle "
            "pack hip belts before crossing surge slots."
        )

    if barnacle_laceration_shear_score >= 60.0 or algal_biofilm_cover_pct >= 55.0:
        warnings.append(
            f"BARNACLE & MUSSEL LACERATION SHEAR RISK: {algal_biofilm_cover_pct:.0f}% Porphyra/Ulva mucilage "
            f"glaze produces a {barnacle_laceration_shear_score:.1f}/100 slip-and-cut shear score across "
            "calcified Balanus and Mytilus shell plates."
        )
        recommendations.append(
            "Equip tungsten-carbide studded intertidal boots, ANSI Cut-Level A5 Kevlar-palm neoprene "
            "gloves, and CE EN 1385 cranial/shin armor before stepping onto the shelf."
        )

    if biogenic_reef_crush_damage_pct >= 45.0 or sabellariid_colony_density_pct >= 50.0:
        warnings.append(
            f"BIOGENIC SABELLARIID REEF CRUSH HAZARD: {sabellariid_colony_density_pct:.0f}% Sabellaria "
            f"honeycomb worm-reef density carries a {biogenic_reef_crush_damage_pct:.1f}% risk of "
            "collapsing cemented sand-tube hummocks and twisting ankles."
        )
        recommendations.append(
            "Enforce strict zero-footfall conservation on Sabellaria alveolata / Phragmatopoma hummocks; "
            "step only in bare rock channels or sand pockets probed with a rubber-tipped staff."
        )

    if safe_tide_window_minutes <= 40:
        warnings.append(
            f"IMMINENT TIDAL CUTOFF: Only {safe_tide_window_minutes} minutes of safe low-tide freeboard "
            "remain before swash submergence pinches the foreshore shelf against the sea cliff."
        )
        recommendations.append(
            "Abort outward headland transit now and ascend the nearest pre-scouted gully or fixed cliff "
            "ladder before flood-tide clapotis seals the exit."
        )

    if len(recommendations) < 2:
        recommendations.extend(
            [
                "Step squarely on dry or barnacle-roughened bedrock micro-asperities and avoid dark green/purple algal mucilage films.",
                "Carry a high-pressure povidone-iodine irrigation syringe to flush any barnacle or mussel shell lacerations immediately.",
            ]
        )

    # Determine overall risk_level & traversal_strategy
    if (
        infragravity_overwash_probability_pct >= 72.0
        or barnacle_laceration_shear_score >= 75.0
        or safe_tide_window_minutes <= 25
        or ledge_freeboard_m <= 0.5
    ):
        risk_level = "critical"
        traversal_strategy = (
            "ABORT INTERTIDAL BENCH TRAVERSE: Extreme infragravity surge overwash and razor-barnacle "
            f"shear hazard ({infragravity_overwash_probability_pct:.1f}% overwash probability, "
            f"{safe_tide_window_minutes} min window). Do not step onto the wave-cut shelf; divert to "
            "the high inland cliff trail or wait for a calm spring low-tide window."
        )
    elif (
        infragravity_overwash_probability_pct >= 48.0
        or barnacle_laceration_shear_score >= 55.0
        or biogenic_reef_crush_damage_pct >= 58.0
        or safe_tide_window_minutes <= 50
    ):
        risk_level = "high"
        traversal_strategy = (
            "ARMORED LOW-STANCE SURGE SPRINT: Wear tungsten-studded boots, ANSI A5 Kevlar gloves, "
            "EN 1385 helmet, and 50N+ PFD. Move only during inter-set lulls under active horizon "
            "spotter watch while stepping clear of fragile Sabellariid worm-reef hummocks."
        )
    elif (
        infragravity_overwash_probability_pct >= 24.0
        or barnacle_laceration_shear_score >= 35.0
        or biogenic_reef_crush_damage_pct >= 30.0
        or safe_tide_window_minutes <= 95
    ):
        risk_level = "moderate"
        traversal_strategy = (
            "CAUTIOUS INTERTIDAL BENCH PICKING: Use carbide-studded footwear and a rubber-tipped "
            "probing staff to pick bare-rock corridors between algal biofilms and Sabellaria colonies "
            f"within the {safe_tide_window_minutes}-minute low-tide window."
        )
    else:
        risk_level = "low"
        traversal_strategy = (
            "NOMINAL LOW-TIDE SHELF TRANSIT: Generous ledge freeboard and low swell energy allow "
            "steady passage across barnacle-roughened bedrock tables; maintain 3-point footing and "
            "avoid stepping on biogenic worm-reef cushions."
        )

    return {
        "swell_height_m": round(float(swell_height_m), 2),
        "swell_period_sec": round(float(swell_period_sec), 1),
        "algal_biofilm_cover_pct": round(float(algal_biofilm_cover_pct), 1),
        "sabellariid_colony_density_pct": round(float(sabellariid_colony_density_pct), 1),
        "ledge_freeboard_m": round(float(ledge_freeboard_m), 2),
        "infragravity_overwash_probability_pct": infragravity_overwash_probability_pct,
        "barnacle_laceration_shear_score": barnacle_laceration_shear_score,
        "biogenic_reef_crush_damage_pct": biogenic_reef_crush_damage_pct,
        "safe_tide_window_minutes": safe_tide_window_minutes,
        "risk_level": risk_level,
        "safety_status": risk_level,
        "traversal_strategy": traversal_strategy,
        "warnings": warnings,
        "recommendations": recommendations,
    }


_EXPLICIT_BARNACLE_LEDGE_TERMS: tuple[str, ...] = (
    "barnacle ledge",
    "barnacle ledges",
    "barnacle-ledge",
    "barnacle_ledge",
    "barnacle bench",
    "barnacle shelf",
    "barnacle-encrusted",
    "barnacle encrusted",
    "barnacle laceration",
    "sabellariid",
    "sabellaria",
    "phragmatopoma",
    "honeycomb worm",
    "worm reef",
    "worm-reef",
    "sand-tube worm",
    "sand tube worm",
    "cape perpetua",
    "cape-perpetua",
    "thor's well",
    "thors well",
    "duckpool",
    "owen point",
    "owen-point",
    "thrasher cove",
    "gooseneck barnacle",
    "gooseneck-barnacle",
    "percebe",
    "percebes",
    "percebeiro",
    "roncudo",
    "cabo vilan",
    "cabo vilán",
    "cabo percebes",
    "costa da morte",
    "basalt ledge",
    "basalt bench",
    "porphyra-barnacle",
    "porphyra barnacle",
    "mussel-barnacle",
    "mussel barnacle",
    "cape-perpetua-yachats-basalt-bench-oregon",
    "duckpool-bude-sabellaria-reef-cornwall-uk",
    "west-coast-trail-owen-point-shelf-bc-canada",
    "cabo-percebes-costa-da-morte-galicia-spain",
)

_OTHER_DOMAIN_EXCLUSIONS: tuple[str, ...] = (
    "order #",
    "order status",
    "refund",
    "return label",
    "shipping",
    "tracking number",
    "dungeness spit",
    "chesil beach",
    "nelson boulder bank",
    "farewell spit",
    "cobble spit",
    "shingle spit",
    "pachena",
    "carmanah",
    "point lobos",
    "depoe bay",
    "acadia otter cliffs",
    "la jolla coves",
    "cape flattery",
    "fingal's cave",
    "fingals cave",
    "devils punchbowl",
    "devil's punchbowl",
    "kiama blowhole",
    "pictured rocks",
    "wadden sea",
    "wattwandern",
    "quicksilt",
    "prielen",
    "glass beach",
    "fort bragg",
    "vaseline glass",
    "uranium glass",
    "macrocystis",
)


def is_barnacle_ledge_query(query: str) -> bool:
    """Return True if the user query targets Coastal Intertidal Sabellariid Worm-Reef & Barnacle-Encrusted Basalt Ledge Traversing."""
    if not query or not query.strip():
        return False
    q = query.strip().lower()

    if any(excl in q for excl in _OTHER_DOMAIN_EXCLUSIONS):
        return False

    if any(term in q for term in _EXPLICIT_BARNACLE_LEDGE_TERMS):
        return True

    has_intertidal_ledge_context = any(
        w in q
        for w in (
            "barnacle",
            "barnacles",
            "mussel bed",
            "mussel bench",
            "wave-cut shelf",
            "wave cut shelf",
            "intertidal ledge",
            "intertidal bench",
            "biogenic reef",
        )
    )
    has_traversal_mechanic = any(
        w in q
        for w in (
            "algal biofilm",
            "biofilm",
            "porphyra",
            "ulva",
            "ledge freeboard",
            "freeboard",
            "laceration",
            "infragravity",
            "sneaker wave",
            "overwash",
            "swell period",
            "crush damage",
            "traverse",
            "traversing",
        )
    )
    return has_intertidal_ledge_context and has_traversal_mechanic


def detect_barnacle_ledge_intent(query: str) -> bool:
    """Alias for is_barnacle_ledge_query()."""
    return is_barnacle_ledge_query(query)


def extract_barnacle_ledge_params(query: str) -> dict[str, Any]:
    """Extract barnacle ledge site_id and calculator parameters from a natural-language query."""
    q = (query or "").lower()

    matched_site: dict[str, Any] | None = None
    for token in (
        "cape-perpetua-yachats-basalt-bench-oregon",
        "duckpool-bude-sabellaria-reef-cornwall-uk",
        "west-coast-trail-owen-point-shelf-bc-canada",
        "cabo-percebes-costa-da-morte-galicia-spain",
        "cape perpetua",
        "cape-perpetua",
        "thor's well",
        "thors well",
        "yachats",
        "duckpool",
        "bude",
        "sabellaria",
        "cornwall",
        "owen point",
        "owen-point",
        "thrasher cove",
        "roncudo",
        "cabo vilan",
        "cabo vilán",
        "cabo percebes",
        "costa da morte",
        "percebe",
        "galicia",
    ):
        if token in q:
            matched_site = get_site_by_id(token)
            if matched_site is not None:
                break

    site_defaults: dict[str, Any] = matched_site or BARNACLE_LEDGE_SITES[0]
    swell_height_m = float(site_defaults["default_swell_height_m"])
    swell_period_sec = float(site_defaults["default_swell_period_sec"])
    algal_biofilm_cover_pct = float(site_defaults["default_algal_biofilm_cover_pct"])
    sabellariid_colony_density_pct = float(
        site_defaults["default_sabellariid_colony_density_pct"]
    )
    ledge_freeboard_m = float(site_defaults["default_ledge_freeboard_m"])
    has_calc_params = False

    # 1. Swell height (m)
    swell_h_patterns = [
        r"swell(?:\s+height)?\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*m\b",
        r"(\d+(?:\.\d+)?)\s*m\s+swell(?:\s+height)?",
    ]
    for pat in swell_h_patterns:
        m = re.search(pat, q)
        if m:
            swell_height_m = max(0.2, min(6.5, float(m.group(1))))
            has_calc_params = True
            break

    # 2. Swell period (sec)
    swell_p_patterns = [
        r"(?:swell\s+)?period\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*(?:sec|seconds?|s)\b",
        r"(\d+(?:\.\d+)?)\s*(?:sec|seconds?|s)\s+(?:swell\s+)?period",
    ]
    for pat in swell_p_patterns:
        m = re.search(pat, q)
        if m:
            swell_period_sec = max(4.0, min(22.0, float(m.group(1))))
            has_calc_params = True
            break

    # 3. Algal biofilm cover (%)
    biofilm_patterns = [
        r"(?:algal\s+)?biofilm(?:\s+cover)?\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*%",
        r"(\d+(?:\.\d+)?)\s*%\s*(?:algal\s+)?biofilm(?:\s+cover)?",
    ]
    for pat in biofilm_patterns:
        m = re.search(pat, q)
        if m:
            algal_biofilm_cover_pct = max(0.0, min(100.0, float(m.group(1))))
            has_calc_params = True
            break

    # 4. Sabellariid colony density (%)
    sab_patterns = [
        r"(?:sabellariid|sabellaria|worm[\s-]+reef|colony)(?:\s+colony)?(?:\s+density)?\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*%",
        r"(\d+(?:\.\d+)?)\s*%\s*(?:sabellariid|sabellaria|worm[\s-]+reef|colony)(?:\s+density)?",
    ]
    for pat in sab_patterns:
        m = re.search(pat, q)
        if m:
            sabellariid_colony_density_pct = max(0.0, min(100.0, float(m.group(1))))
            has_calc_params = True
            break

    # 5. Ledge freeboard (m)
    freeboard_patterns = [
        r"(?:ledge\s+)?freeboard\s*(?:of|=|:)?\s*(\d+(?:\.\d+)?)\s*m\b",
        r"(\d+(?:\.\d+)?)\s*m\s+(?:ledge\s+)?freeboard",
    ]
    for pat in freeboard_patterns:
        m = re.search(pat, q)
        if m:
            ledge_freeboard_m = max(0.1, min(5.0, float(m.group(1))))
            has_calc_params = True
            break

    if any(w in q for w in ("calculate", "calculator", "compute")) and not has_calc_params:
        has_calc_params = True

    return {
        "site_id": matched_site["id"] if matched_site else None,
        "site": matched_site,
        "swell_height_m": swell_height_m,
        "swell_period_sec": swell_period_sec,
        "algal_biofilm_cover_pct": algal_biofilm_cover_pct,
        "sabellariid_colony_density_pct": sabellariid_colony_density_pct,
        "ledge_freeboard_m": ledge_freeboard_m,
        "has_calc_params": has_calc_params,
    }


def format_barnacle_ledge_response(query: str) -> dict[str, Any]:
    """Build a structured barnacle ledge response payload for chat and SSE endpoints."""
    params: dict[str, Any] = extract_barnacle_ledge_params(query)
    matched_site: dict[str, Any] | None = params["site"]
    has_calc = bool(params["has_calc_params"])

    calc_result: dict[str, Any] = calculate_barnacle_ledge(
        swell_height_m=float(params["swell_height_m"]),
        swell_period_sec=float(params["swell_period_sec"]),
        algal_biofilm_cover_pct=float(params["algal_biofilm_cover_pct"]),
        sabellariid_colony_density_pct=float(params["sabellariid_colony_density_pct"]),
        ledge_freeboard_m=float(params["ledge_freeboard_m"]),
    )

    if has_calc:
        action = "barnacle_ledge_calculated"
        matched_sites: list[dict[str, Any]] = (
            [matched_site] if matched_site else list(BARNACLE_LEDGE_SITES)
        )
    elif matched_site is not None:
        action = "barnacle_ledge_lookup"
        matched_sites = [matched_site]
    else:
        action = "barnacle_ledge_info"
        matched_sites = list(BARNACLE_LEDGE_SITES)

    site_summary = (
        f"{matched_site['name']} ({matched_site['country']}, {matched_site['elevation_range']})"
        if matched_site
        else "Global Intertidal Sabellariid Worm-Reef & Barnacle Ledge Corridors (Cape Perpetua, Duckpool/Bude, Owen Point, Roncudo/Cabo Vilán)"
    )

    summary_lines: list[str] = [
        f"### Coastal Intertidal Sabellariid Worm-Reef & Barnacle-Encrusted Basalt Ledge Assessment: {site_summary}",
        f"- **Safety / Risk Level:** `{calc_result['risk_level'].upper()}`",
        f"- **Infragravity Overwash Probability:** `{calc_result['infragravity_overwash_probability_pct']:.1f}%` "
        f"(Swell `{calc_result['swell_height_m']:.1f} m @ {calc_result['swell_period_sec']:.1f} s`, "
        f"Ledge Freeboard `{calc_result['ledge_freeboard_m']:.1f} m`)",
        f"- **Barnacle Laceration Shear Score:** `{calc_result['barnacle_laceration_shear_score']:.1f} / 100` "
        f"(Algal Biofilm Cover `{calc_result['algal_biofilm_cover_pct']:.0f}%`)",
        f"- **Biogenic Worm-Reef Crush Damage Risk:** `{calc_result['biogenic_reef_crush_damage_pct']:.1f}%` "
        f"(Sabellariid Colony Density `{calc_result['sabellariid_colony_density_pct']:.0f}%`)",
        f"- **Safe Low-Tide Traversal Window:** `{calc_result['safe_tide_window_minutes']} minutes`",
        f"- **Traversal Strategy:** {calc_result['traversal_strategy']}",
    ]
    if matched_site:
        summary_lines.append(
            f"- **Site Navigation Protocol:** {matched_site['navigation_protocol']}"
        )
        summary_lines.append(
            f"- **Biogenic Conservation Protocol:** {matched_site['conservation_protocol']}"
        )
    if calc_result["warnings"]:
        summary_lines.append("- **Active Warnings:** " + " | ".join(calc_result["warnings"]))
    summary_lines.append(
        "- **Essential Gear:** "
        + "; ".join(item["item"] for item in BARNACLE_LEDGE_GEAR_CHECKLIST[:4])
    )

    formatted_text = "\n".join(summary_lines)

    return {
        "action": action,
        "query": query,
        "site": dict(matched_site) if matched_site else None,
        "matched_sites": [dict(s) for s in matched_sites],
        "sites": [dict(s) for s in BARNACLE_LEDGE_SITES],
        "calculation": calc_result,
        "gear_checklist": get_gear_checklist(),
        "answer": formatted_text,
        "formatted_response": formatted_text,
    }


def build_barnacle_ledge_prompt(info_or_query: dict[str, Any] | str) -> str:
    """Build the system prompt grounding block for LLM generation on barnacle ledge queries."""
    info: dict[str, Any] = (
        format_barnacle_ledge_response(info_or_query)
        if isinstance(info_or_query, str)
        else info_or_query
    )
    calc: dict[str, Any] = info.get("calculation") or {}
    site: dict[str, Any] | None = info.get("site")
    site_header = (
        f"Target Site: {site['name']} ({site['country']}, {site['elevation_range']}, substrate_type={site['substrate_type']})"
        if site
        else "Target Domain: Coastal Intertidal Sabellariid Worm-Reef & Barnacle-Encrusted Basalt Ledge Traversing"
    )
    warnings_str = "; ".join(calc.get("warnings", [])) or "None"
    recs_str = "; ".join(calc.get("recommendations", []))
    return (
        "\n\n[COASTAL INTERTIDAL SABELLARIID WORM-REEF & BARNACLE-ENCRUSTED BASALT LEDGE TRAVERSING GUIDE]\n"
        f"{site_header}\n"
        f"Action: {info.get('action', 'barnacle_ledge_info')}\n"
        f"Risk Level: {calc.get('risk_level', 'moderate')}\n"
        f"Inputs: swell_height_m={calc.get('swell_height_m')}, "
        f"swell_period_sec={calc.get('swell_period_sec')}, "
        f"algal_biofilm_cover_pct={calc.get('algal_biofilm_cover_pct')}, "
        f"sabellariid_colony_density_pct={calc.get('sabellariid_colony_density_pct')}, "
        f"ledge_freeboard_m={calc.get('ledge_freeboard_m')}\n"
        f"Calculated Metrics: infragravity_overwash_probability_pct={calc.get('infragravity_overwash_probability_pct')}%, "
        f"barnacle_laceration_shear_score={calc.get('barnacle_laceration_shear_score')}/100, "
        f"biogenic_reef_crush_damage_pct={calc.get('biogenic_reef_crush_damage_pct')}%, "
        f"safe_tide_window_minutes={calc.get('safe_tide_window_minutes')} min\n"
        f"Traversal Strategy: {calc.get('traversal_strategy', '')}\n"
        f"Warnings: {warnings_str}\n"
        f"Recommendations: {recs_str}\n"
        "Provide concrete intertidal barnacle-ledge and Sabellariid honeycomb worm-reef traversal guidance "
        "covering tungsten-carbide studded footwear traction across Porphyra/Ulva biofilms, ANSI A5 Kevlar "
        "cut protection against Balanus/Mytilus/Pollicipes shells, infragravity sneaker-wave set timing, "
        "and strict zero-footfall conservation on fragile Sabellaria alveolata sand-tube hummocks.\n"
    )


def get_chat_response(query: str) -> dict[str, Any]:
    """Return a standalone fallback chat response dictionary with barnacle_ledge_info."""
    info: dict[str, Any] = format_barnacle_ledge_response(query)
    return {
        "answer": info["formatted_response"],
        "context": [s["name"] for s in info["matched_sites"]],
        "barnacle_ledge_info": info,
    }


def generate_stream_events(query: str) -> Iterator[dict[str, Any]]:
    """Yield SSE event dictionaries for standalone barnacle ledge streaming."""
    info: dict[str, Any] = format_barnacle_ledge_response(query)
    text = str(info["formatted_response"])
    midpoint = max(1, len(text) // 2)
    yield {
        "answer": text[:midpoint],
        "context": [s["name"] for s in info["matched_sites"]],
        "barnacle_ledge_info": info,
    }
    yield {
        "answer": text[midpoint:],
    }
    yield {
        "done": True,
        "barnacle_ledge_info": info,
    }
