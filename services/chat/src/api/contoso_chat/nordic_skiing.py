from typing import Any, Optional

from pydantic import BaseModel


class NordicTrailModel(BaseModel):
    trail_id: str
    trail_name: str
    system_name: str
    region: str
    distance_km: float
    elevation_gain_m: int
    discipline: str
    difficulty: str
    groomed_daily: bool
    skate_lane_width_m: float
    classic_tracks_count: int
    description: str
    trail_highlights: list[str]


class WaxAdvisorRequest(BaseModel):
    trail_id: str
    air_temperature_f: float = 24.0
    snow_condition: str = "packed_powder"
    ski_base_type: str = "waxable"


class WaxAdvisorResponse(BaseModel):
    trail_id: str
    trail_and_system: str
    recommended_kick_wax: str
    recommended_glide_wax: str
    wax_pocket_pressure: str
    klister_required: bool
    glide_speed_rating: str
    wax_advisory: str


class NordicGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class NordicSkiingIntent(BaseModel):
    action: str  # "trails_list", "trail_detail", "wax_plan", "gear_checklist"
    trail_id: Optional[str] = None
    discipline: Optional[str] = None
    region: Optional[str] = None


DEFAULT_NORDIC_TRAILS: dict[str, NordicTrailModel] = {
    "methow-valley-community-trail": NordicTrailModel(
        trail_id="methow-valley-community-trail",
        trail_name="Methow Community Trail",
        system_name="Methow Trails Nordic Network",
        region="Winthrop, Washington",
        distance_km=30.0,
        elevation_gain_m=120,
        discipline="classic_and_skate",
        difficulty="intermediate",
        groomed_daily=True,
        skate_lane_width_m=9.0,
        classic_tracks_count=2,
        description="The premier spine of North America's largest Nordic ski network, winding across the Tawlks-Foster suspension bridge, scenic river flats, and aspen groves between Winthrop and Mazama.",
        trail_highlights=[
            "Tawlks-Foster Suspension Bridge crossing",
            "Continuous 9.0m wide groomed skate corridor with parallel double classic tracks",
            "Mazama Country Store pastry & hot cider terminus",
        ],
    ),
    "trapp-family-sugar-road": NordicTrailModel(
        trail_id="trapp-family-sugar-road",
        trail_name="Sugar Road & Slayton Pasture Trail",
        system_name="Trapp Family Lodge Outdoor Center",
        region="Stowe, Vermont",
        distance_km=8.5,
        elevation_gain_m=210,
        discipline="classic_and_skate",
        difficulty="intermediate",
        groomed_daily=True,
        skate_lane_width_m=6.0,
        classic_tracks_count=1,
        description="Historic New England woodland Nordic trail climbing past heritage maple sugar bushes up to the roaring stone hearth at Slayton Pasture Cabin.",
        trail_highlights=[
            "Active spring maple sugar bush taps and evaporator shacks",
            "Rustic wood-stove warmth and soup at Slayton Pasture Cabin",
            "Fast, flowing hardwood descent back to the cross-country touring center",
        ],
    ),
    "devil-thumb-ranch-high-lonesome": NordicTrailModel(
        trail_id="devil-thumb-ranch-high-lonesome",
        trail_name="High Lonesome Ridge Trail",
        system_name="Devil's Thumb Ranch Nordic Center",
        region="Tabernash, Colorado",
        distance_km=12.0,
        elevation_gain_m=260,
        discipline="classic_and_skate",
        difficulty="advanced",
        groomed_daily=True,
        skate_lane_width_m=7.5,
        classic_tracks_count=2,
        description="High-altitude Colorado Nordic loop at 8,600 ft elevation with rolling climbs, pristine corduroy, and sweeping panoramas of Byers Peak and the Continental Divide.",
        trail_highlights=[
            "Dramatic vistas of the Continental Divide and Byers Peak",
            "High-elevation aerobic training loop with daily PistenBully power tilling",
            "Precision dual-track classic tracks set on rolling ridge descents",
        ],
    ),
    "royal-gorge-rainbow-ridge": NordicTrailModel(
        trail_id="royal-gorge-rainbow-ridge",
        trail_name="Rainbow Ridge Scenic Trail",
        system_name="Royal Gorge Cross Country Resort",
        region="Soda Springs, California",
        distance_km=14.5,
        elevation_gain_m=310,
        discipline="classic_and_skate",
        difficulty="advanced",
        groomed_daily=True,
        skate_lane_width_m=8.0,
        classic_tracks_count=2,
        description="Sweeping Sierra Nevada ridgeline tour perched high above the sheer granite abyss of the Royal Gorge of the American River, offering expansive high-plateau vistas.",
        trail_highlights=[
            "Breathtaking 4,000-foot sheer drop views into the Royal Gorge canyon rim",
            "Wide sunlit skate platform with expansive views of Donner Summit peaks",
            "Access to warming huts equipped with hot wood stoves and trail maps",
        ],
    ),
    "boundary-waters-banadad-trail": NordicTrailModel(
        trail_id="boundary-waters-banadad-trail",
        trail_name="Banadad Wilderness Ski Trail",
        system_name="Boundary Waters Nordic / Gunflint Trail",
        region="Grand Marais, Minnesota",
        distance_km=29.0,
        elevation_gain_m=115,
        discipline="classic_only",
        difficulty="intermediate",
        groomed_daily=False,
        skate_lane_width_m=0.0,
        classic_tracks_count=1,
        description="The longest continuously tracked classic cross-country wilderness trail in the Boundary Waters Canoe Area Wilderness, carving an intimate corridor through virgin boreal forest.",
        trail_highlights=[
            "Pristine Boundary Waters Canoe Area Wilderness old-growth white pines",
            "Poplar Creek yurt staging with authentic northern wilderness seclusion",
            "Pure, quiet single-track classic diagonal striding far from mechanical noise",
        ],
    ),
}

DEFAULT_NORDIC_GEAR: list[NordicGearRequirement] = [
    NordicGearRequirement(
        item_id="nnn-prolink-boots",
        name="NNN / Prolink Cross-Country Ski Touring Boots",
        category="boots_and_bindings",
        mandatory=True,
        purpose="Provides rigid torsional support, hinged cuff articulation for skate or classic glide, and sole bar compatibility with NNN, Prolink, and Turnamic bindings.",
    ),
    NordicGearRequirement(
        item_id="carbon-composite-poles",
        name="High-Modulus Carbon Nordic Ski Poles with Ergonomic Quick-Release Straps",
        category="poles",
        mandatory=True,
        purpose="Maximizes energy transfer during double-poling and V2 skate strides while minimizing swing weight; sized precisely to armpit for classic and chin/shoulder for skate.",
    ),
    NordicGearRequirement(
        item_id="windproof-softshell-apparel",
        name="Breathable Windproof Softshell Nordic Jacket & Tights",
        category="apparel",
        mandatory=True,
        purpose="Shields high-speed wind chill on open lake flats and descent glides while exhausting high-output moisture across stretch-woven back and underarm panels.",
    ),
    NordicGearRequirement(
        item_id="kick-and-glide-wax-kit",
        name="Complete Nordic Kick Wax & Glide Maintenance Kit with Synthetic Cork & Scraper",
        category="wax_and_tuning",
        mandatory=True,
        purpose="Equipped with essential Swix hardwaxes (Green Polar, Blue Extra, Violet, Red), universal klister, synthetic cork for smooth heat buffing, and groove scraper.",
    ),
    NordicGearRequirement(
        item_id="insulated-hydration-pack",
        name="Insulated Nordic Hydration Lumbar Hip Pack with 1.5L Thermal Tube",
        category="hydration",
        mandatory=True,
        purpose="Prevents drinking fluids and electrolyte mixes from freezing in sub-freezing trail air while maintaining low center of gravity without restricting pole swing.",
    ),
    NordicGearRequirement(
        item_id="skin-and-base-cleaner-care",
        name="Skin-Ski Mohair Cleaner & Anti-Icing Impregnation Spray",
        category="maintenance",
        mandatory=True,
        purpose="Cleans pine wax and dirt contamination from integrated skin-ski mohair strips and prevents snow balling on fishscale patterns without degrading adhesive glue.",
    ),
]


def get_nordic_trails(discipline: Optional[str] = None) -> list[NordicTrailModel]:
    trails = list(DEFAULT_NORDIC_TRAILS.values())
    if discipline:
        norm = discipline.strip().lower()
        if norm in ("skate", "skating"):
            return [t for t in trails if "skate" in t.discipline.lower()]
        if norm in ("classic", "traditional"):
            return [t for t in trails if "classic" in t.discipline.lower()]
        if norm in ("both", "classic_and_skate", "skate_and_classic"):
            return [t for t in trails if "classic" in t.discipline.lower() and "skate" in t.discipline.lower()]
        return [t for t in trails if norm in t.discipline.lower()]
    return trails


def get_nordic_trail_by_id(trail_id: str) -> Optional[NordicTrailModel]:
    key = trail_id.strip().lower()
    if key in DEFAULT_NORDIC_TRAILS:
        return DEFAULT_NORDIC_TRAILS[key]
    for k, v in DEFAULT_NORDIC_TRAILS.items():
        if k == key or v.trail_name.lower() == key:
            return v
    return None


def get_nordic_gear() -> list[NordicGearRequirement]:
    return list(DEFAULT_NORDIC_GEAR)


def calculate_wax_plan(req: WaxAdvisorRequest) -> WaxAdvisorResponse:
    trail = get_nordic_trail_by_id(req.trail_id)
    if not trail:
        raise ValueError(f"Nordic trail '{req.trail_id}' not found")

    trail_and_system = f"{trail.trail_name} ({trail.system_name})"
    base_type = req.ski_base_type.strip().lower()
    snow = req.snow_condition.strip().lower()
    temp = req.air_temperature_f

    # Determine base-type specifics
    is_skin = "skin" in base_type or "mohair" in base_type
    is_fishscale = "fishscale" in base_type or "waxless" in base_type or "crown" in base_type
    is_wet_or_icy = any(
        w in snow for w in ["icy", "ice", "crust", "wet", "corn", "slush", "refrozen", "granular"]
    )

    # Kick wax logic
    if is_skin:
        recommended_kick_wax = (
            "Integrated Mohair Skin Strips (No kick wax required; apply skin cleaner & anti-icing spray)"
        )
        wax_pocket_pressure = (
            "Medium-firm pocket tension so mohair clears snow during two-foot glide and grips upon full foot weight"
        )
        klister_required = False
    elif is_fishscale:
        recommended_kick_wax = (
            "Waxless Mechanical Fishscale / Crown Pattern (No kick wax required; apply liquid anti-ice glide emulsion)"
        )
        wax_pocket_pressure = (
            "Moderate camber stiffness allowing mechanical scales to bite during diagonal kick and release on glide"
        )
        klister_required = False
    else:  # waxable classic ski base
        if is_wet_or_icy or temp > 34.0:
            klister_required = True
            if temp < 32.0:
                recommended_kick_wax = (
                    "Swix Ice / Universal Klister (K22 / KX35 for refrozen coarse crust, 20°F to 32°F / -7°C to 0°C)"
                )
            else:
                recommended_kick_wax = (
                    "Swix Red / Wet Universal Klister (KX65 / KX75 for wet coarse snow, 32°F to 45°F / 0°C to +7°C)"
                )
            wax_pocket_pressure = (
                "Shortened klister pocket (~5-10cm shorter than hardwax zone) with high camber clearance to avoid dragging"
            )
        else:
            klister_required = False
            if temp < 14.0:
                recommended_kick_wax = (
                    "Swix Green Polar Hardwax (0°F to 12°F / -18°C to -11°C; dry, hard squeaky snow)"
                )
                wax_pocket_pressure = (
                    "Extended wax pocket (heel to 18 inches forward of binding); apply 4-5 very thin corked layers"
                )
            elif temp <= 28.0:
                recommended_kick_wax = (
                    "Swix Blue Extra V40 Hardwax (18°F to 28°F / -8°C to -2°C; standard dry packed powder)"
                )
                wax_pocket_pressure = (
                    "Standard wax pocket (heel to 14-16 inches forward of binding); apply 3-4 smooth, thin corked layers"
                )
            elif temp <= 32.0:
                recommended_kick_wax = (
                    "Swix Violet Special V50 Hardwax (28°F to 32°F / -2°C to 0°C; transition snow around freezing)"
                )
                wax_pocket_pressure = (
                    "Medium wax pocket; cork lightly with synthetic cork to avoid overheating the softer wax"
                )
            else:  # 32.0 < temp <= 34.0
                recommended_kick_wax = (
                    "Swix Red V60 Hardwax (32°F to 36°F / 0°C to +2°C; new damp or falling moist snow)"
                )
                wax_pocket_pressure = (
                    "Shortened pocket with pyramid buildup directly under the ball of foot for firm kick grip"
                )

    # Glide wax logic
    if temp < 14.0:
        recommended_glide_wax = "Cold Hydrocarbon Glide Wax CH4 / Polar (-4°F to 14°F / -20°C to -10°C)"
    elif temp <= 28.0:
        recommended_glide_wax = "Universal Blue Hydrocarbon Glide Wax CH6 (14°F to 28°F / -10°C to -2°C)"
    elif temp <= 34.0:
        recommended_glide_wax = "Violet Hydrocarbon Glide Wax CH7 (25°F to 34°F / -4°C to +1°C)"
    else:
        recommended_glide_wax = "Warm Yellow Hydrocarbon Glide Wax CH8 (32°F to 40°F / 0°C to +4°C)"

    # Glide speed rating
    if temp < 10.0:
        glide_speed_rating = "slow_cold_friction"
    elif 18.0 <= temp <= 28.0 and not is_wet_or_icy:
        glide_speed_rating = "fast_optimal"
    elif temp > 36.0 or "slush" in snow or "wet" in snow:
        glide_speed_rating = "moderate_wet_suction"
    elif "icy" in snow or "crust" in snow:
        glide_speed_rating = "fast_firm_track"
    else:
        glide_speed_rating = "moderate_glide"

    # Wax advisory narrative
    advisories = [
        f"Grooming & Wax Advisory for {trail_and_system}.",
        f"Conditions: {temp}°F air temperature, '{req.snow_condition.replace('_', ' ')}', Base: {req.ski_base_type}.",
        f"Kick Zone Recommendation: {recommended_kick_wax}.",
        f"Glide Zone Recommendation: {recommended_glide_wax}.",
        f"Wax Pocket Pressure: {wax_pocket_pressure}.",
        f"Grooming Setup: {'Groomed daily' if trail.groomed_daily else 'Periodic wilderness grooming'} with "
        f"{trail.skate_lane_width_m}m skate lane and {trail.classic_tracks_count} set classic track(s).",
        f"Expected Glide Speed: {glide_speed_rating.upper()}.",
    ]
    if klister_required:
        advisories.append("Warning: Coarse/wet or icy snow requires klister; ensure adequate camber clearance to prevent drag.")
    elif is_skin:
        advisories.append("Care Tip: Clean mohair with dedicated skin ski cleaner; avoid hydrocarbon solvents that dissolve skin adhesive.")
    elif is_fishscale:
        advisories.append("Tuning Tip: Apply liquid anti-icing emulsion to scale pattern to avoid heavy snow clumping in freezing slush.")
    else:
        advisories.append("Technique Tip: Keep hardwax layers thin and well-corked for smooth glide transition.")

    wax_advisory = " ".join(advisories)

    return WaxAdvisorResponse(
        trail_id=trail.trail_id,
        trail_and_system=trail_and_system,
        recommended_kick_wax=recommended_kick_wax,
        recommended_glide_wax=recommended_glide_wax,
        wax_pocket_pressure=wax_pocket_pressure,
        klister_required=klister_required,
        glide_speed_rating=glide_speed_rating,
        wax_advisory=wax_advisory,
    )


def detect_nordic_skiing_intent(query: str) -> Optional[NordicSkiingIntent]:
    q = query.lower()

    # Unrelated general e-commerce exclusions
    general_exclusions = [
        "refund",
        "order #",
        "return label",
        "shipping tracking",
        "water filter",
        "fire ban",
        "canyoneering",
        "packrafting",
        "fly fishing",
        "foraging",
        "bikepacking",
        "white water",
        "whitewater",
    ]
    if any(ex in q for ex in general_exclusions):
        return None

    # CRITICAL DISAMBIGUATION: Do NOT hijack alpine backcountry ski touring handled in ski_touring.py!
    alpine_backcountry_exclusions = [
        "backcountry ski",
        "ski touring",
        "splitboard",
        "avalanche beacon",
        "at binding",
        "climbing skin backcountry",
        "avalanche safety",
        "avalanche transceiver",
        "camp muir",
        "kendall lake",
        "table mountain",
        "silver basin",
        "diamond head",
        "blewett pass",
        "skin track",
        "skin up",
        "skinning",
    ]
    if any(ex in q for ex in alpine_backcountry_exclusions):
        return None

    # Specific Nordic / Cross-Country skiing keywords
    nordic_keywords = [
        "nordic ski",
        "cross-country ski",
        "cross country ski",
        "xc ski",
        "skate ski",
        "classic track",
        "kick wax",
        "klister",
        "skin ski",
        "fishscale ski",
        "groomer report",
        "methow valley ski",
        "trapp family lodge ski",
        "devils thumb ranch ski",
        "devil's thumb ranch ski",
        "royal gorge xc",
        "banadad trail",
        "methow valley",
        "methow community",
        "trapp family lodge",
        "trapp family",
        "devil's thumb ranch",
        "devils thumb ranch",
        "royal gorge",
        "banadad",
        "skate lane",
        "classic tracks",
        "skate skiing",
        "classic skiing",
        "nordic trails",
        "nordic trail",
        "nordic equipment",
        "nordic gear",
        "skin cleaner",
        "mohair maintenance",
        "skin ski cleaning",
        "nnn boot",
        "prolink boot",
        "swix green",
        "blue extra",
        "wax pocket",
    ]
    if not any(k in q for k in nordic_keywords):
        return None

    # Identify trail if present
    trail_id = None
    region = None
    if "methow" in q:
        trail_id = "methow-valley-community-trail"
        region = "Winthrop, Washington"
    elif "trapp" in q:
        trail_id = "trapp-family-sugar-road"
        region = "Stowe, Vermont"
    elif "devil" in q or "thumb" in q:
        trail_id = "devil-thumb-ranch-high-lonesome"
        region = "Tabernash, Colorado"
    elif "royal" in q or "gorge" in q:
        trail_id = "royal-gorge-rainbow-ridge"
        region = "Soda Springs, California"
    elif "banadad" in q or "boundary waters" in q:
        trail_id = "boundary-waters-banadad-trail"
        region = "Grand Marais, Minnesota"

    # Identify discipline
    discipline = None
    if "skate" in q and "classic" not in q:
        discipline = "skate"
    elif "classic" in q and "skate" not in q:
        discipline = "classic"
    elif "skate" in q and "classic" in q:
        discipline = "both"

    # Determine action
    if any(
        k in q
        for k in [
            "gear",
            "checklist",
            "equipment",
            "boot",
            "nnn",
            "prolink",
            "pole",
            "carbon pole",
            "softshell",
            "apparel",
            "hydration pack",
        ]
    ):
        action = "gear_checklist"
    elif any(
        k in q
        for k in [
            "wax",
            "klister",
            "grooming",
            "groomer",
            "temperature",
            "swix",
            "blue extra",
            "green polar",
            "degrees",
            "wax plan",
            "waxing",
            "skin cleaning",
            "mohair",
            "glide tuning",
            "fishscale",
        ]
    ):
        action = "wax_plan"
    elif trail_id and any(
        k in q
        for k in [
            "detail",
            "about",
            "distance",
            "elevation",
            "highlights",
            "tell me about",
            "info",
            "width",
            "tracks",
        ]
    ):
        action = "trail_detail"
    elif any(
        k in q
        for k in ["trails", "trail", "list", "catalog", "centers", "systems", "options", "groomed"]
    ) and not trail_id:
        action = "trails_list"
    elif trail_id:
        action = "trail_detail"
    else:
        action = "trails_list"

    return NordicSkiingIntent(
        action=action,
        trail_id=trail_id,
        discipline=discipline,
        region=region,
    )


def build_nordic_skiing_prompt(intent: NordicSkiingIntent) -> str:
    lines = ["Nordic & Cross-Country Ski Grooming & Kick Wax Advisor Tooling:"]

    if intent.trail_id:
        trail = get_nordic_trail_by_id(intent.trail_id)
        if trail:
            lines.append(
                f"- Selected Nordic Trail: {trail.trail_name} ({trail.system_name}, {trail.region})\n"
                f"  Distance: {trail.distance_km} km | Elevation Gain: {trail.elevation_gain_m} m | Discipline: {trail.discipline}\n"
                f"  Difficulty: {trail.difficulty} | Groomed Daily: {trail.groomed_daily}\n"
                f"  Skate Lane Width: {trail.skate_lane_width_m} m | Classic Tracks: {trail.classic_tracks_count}\n"
                f"  Description: {trail.description}\n"
                f"  Highlights: {'; '.join(trail.trail_highlights)}"
            )
    elif intent.discipline:
        trails = get_nordic_trails(discipline=intent.discipline)
        formatted = [f"{t.trail_name} ({t.distance_km} km, {t.system_name})" for t in trails]
        lines.append(f"- Matching {intent.discipline.title()} Nordic Trails: {', '.join(formatted)}")
    else:
        trails = get_nordic_trails()
        formatted = [f"{t.trail_name} ({t.distance_km} km, {t.discipline})" for t in trails]
        lines.append(f"- Supported Nordic Trail Centers: {', '.join(formatted)}")

    lines.extend(
        [
            "- Daily Grooming & Track Specifications:",
            "  1. Skate lanes groomed 6.0m-9.0m wide with freshly tilled PistenBully corduroy.",
            "  2. Dual or single set classic tracks on trail edge for diagonal stride and double poling.",
            "  3. Banadad Trail offers pure wilderness single-track classic skiing (no skate lane).",
            "- Kick Wax & Base Selection Guidelines:",
            "  1. Swix Green Polar (0°F to 12°F / -18°C to -11°C): Cold, hard, squeaky dry snow.",
            "  2. Swix Blue Extra V40 (18°F to 28°F / -8°C to -2°C): Baseline universal dry packed powder.",
            "  3. Swix Violet Special V50 (28°F to 32°F / -2°C to 0°C): Freezing point transition snow.",
            "  4. Swix Red V60 (32°F to 36°F / 0°C to +2°C): Damp, wet falling snow.",
            "  5. Klister (Universal/Red/Ice): Required for coarse, icy crust, refrozen granular, or warm slush > 34°F.",
            "  6. Skin Skis: Integrated mohair strips eliminate kick wax; clean with specialized skin cleaner and anti-ice spray.",
            "  7. Fishscale Waxless Skis: Mechanical traction; treat base with anti-ice emulsion spray to prevent clumping.",
            "- Mandatory Nordic Equipment Compliance:",
            "  1. NNN / Prolink compatible cross-country boots with appropriate ankle cuff stiffness.",
            "  2. High-modulus carbon poles sized to armpit (classic) or shoulder/chin (skate).",
            "  3. Breathable windproof softshell apparel (breathable backs, windproof fronts).",
            "  4. Complete kick wax kit with cork and acrylic scraper.",
            "  5. Low-profile insulated hydration hip pack to prevent hose freeze in sub-freezing air.",
            "  6. Dedicated skin ski mohair cleaner & anti-icing spray.",
        ]
    )

    return "\n".join(lines)


def format_nordic_skiing_response(intent: NordicSkiingIntent) -> dict[str, Any]:
    if intent.action == "wax_plan":
        target_trail_id = intent.trail_id or "methow-valley-community-trail"
        try:
            req = WaxAdvisorRequest(trail_id=target_trail_id)
            plan = calculate_wax_plan(req)
            answer = (
                f"Nordic Wax & Grooming Plan for {plan.trail_and_system}: "
                f"Recommended Kick Wax: {plan.recommended_kick_wax}. "
                f"Recommended Glide Wax: {plan.recommended_glide_wax}. "
                f"Wax Pocket Pressure: {plan.wax_pocket_pressure}. "
                f"Glide Speed Rating: {plan.glide_speed_rating.upper()}. "
                f"{'Klister is required for current snow conditions.' if plan.klister_required else 'No klister required; hardwax recommended.'} "
                f"{plan.wax_advisory}"
            )
            return {
                "answer": answer,
                "nordic_skiing_info": {
                    "action": "wax_plan",
                    "wax_plan": plan.model_dump(),
                },
            }
        except ValueError:
            pass

    if intent.action == "trail_detail" and intent.trail_id:
        trail = get_nordic_trail_by_id(intent.trail_id)
        if trail:
            answer = (
                f"Nordic Trail Profile: {trail.trail_name} ({trail.system_name}, {trail.region}). "
                f"Distance: {trail.distance_km} km | Elevation Gain: {trail.elevation_gain_m} m | Discipline: {trail.discipline} | Difficulty: {trail.difficulty}. "
                f"Grooming: {'Daily grooming' if trail.groomed_daily else 'Periodic wilderness grooming'} with "
                f"{trail.skate_lane_width_m}m skate lane and {trail.classic_tracks_count} set classic track(s). "
                f"{trail.description} Highlights: {', '.join(trail.trail_highlights)}."
            )
            return {
                "answer": answer,
                "nordic_skiing_info": {
                    "action": "trail_detail",
                    "trail": trail.model_dump(),
                },
            }

    if intent.action == "gear_checklist":
        gear = get_nordic_gear()
        gear_summary = "; ".join(f"{g.name} ({g.purpose})" for g in gear[:3])
        answer = (
            f"Mandatory Nordic Skiing Equipment Checklist: {gear_summary}; "
            f"plus {', '.join(g.name for g in gear[3:])}. "
            "Ensure boots match NNN/Prolink bindings, poles are sized correctly for your discipline (skate vs classic), and apparel is windproof yet breathable."
        )
        return {
            "answer": answer,
            "nordic_skiing_info": {
                "action": "gear_checklist",
                "gear": [g.model_dump() for g in gear],
            },
        }

    # Default: trails_list
    trails = get_nordic_trails(discipline=intent.discipline)
    trails_summary = "; ".join(
        f"{t.trail_name} ({t.system_name}, {t.distance_km} km, {t.discipline})"
        for t in trails
    )
    answer = (
        f"Iconic Nordic & Cross-Country Ski Trail Networks: {trails_summary}. "
        "Each trail features daily grooming specifications, skate lane widths, classic track setting, and kick wax recommendations."
    )
    return {
        "answer": answer,
        "nordic_skiing_info": {
            "action": "trails_list",
            "trails": [t.model_dump() for t in trails],
        },
    }
