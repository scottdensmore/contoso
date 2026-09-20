import re
from typing import Any, Optional

from pydantic import BaseModel


class ObservingSiteModel(BaseModel):
    site_id: str
    name: str
    region: str
    bortle_class: int
    sqm_reading: float
    elevation_ft: int
    best_seasons: list[str]
    featured_targets: list[str]
    access_notes: str
    overnight_camping: bool


class ViewingWindowRequest(BaseModel):
    site_id: str
    moon_phase: str = "new_moon"
    cloud_cover_percent: int = 10
    target_type: str = "milky_way"


class ViewingWindowResponse(BaseModel):
    site_id: str
    site_name: str
    bortle_class: int
    viewing_quality: str
    score: int
    reasons: list[str]
    recommended_optics: str
    dark_adaptation_advice: str


class MeteorShowerModel(BaseModel):
    shower_id: str
    name: str
    peak_date: str
    zhr_rate: int
    parent_body: str
    notes: str


class StargazingIntent(BaseModel):
    action: str  # "sites_list", "site_detail", "calculate_viewing", "meteor_showers", "gear_guide"
    site_id: Optional[str] = None
    bortle_max: Optional[int] = None
    target_type: Optional[str] = None


DEFAULT_OBSERVING_SITES: dict[str, ObservingSiteModel] = {
    "prineville-reservoir": ObservingSiteModel(
        site_id="prineville-reservoir",
        name="Prineville Reservoir State Park",
        region="Central Oregon",
        bortle_class=1,
        sqm_reading=21.85,
        elevation_ft=3230,
        best_seasons=["summer", "fall"],
        featured_targets=[
            "Milky Way core",
            "Sagittarius star clouds",
            "Andromeda Galaxy (M31)",
            "faint emission nebulae",
        ],
        access_notes="Oregon's first certified International Dark Sky Park. Paved state park access, year-round camping at Juniper and Prineville Reservoir campgrounds with shielded red-light fixtures.",
        overnight_camping=True,
    ),
    "artist-point-baker": ObservingSiteModel(
        site_id="artist-point-baker",
        name="Mount Baker Artist Point",
        region="North Cascades / Mount Baker Highway",
        bortle_class=2,
        sqm_reading=21.65,
        elevation_ft=5100,
        best_seasons=["summer", "early fall"],
        featured_targets=[
            "Milky Way over Mount Shuksan and Mount Baker",
            "Aurora Borealis",
            "deep sky star clusters",
            "astrophotography panoramas",
        ],
        access_notes="Seasonal road access via SR-542 (typically late July through October). High-altitude viewing with panoramic 360-degree horizon. Northwest Forest Pass required; backcountry overnight camping allowed.",
        overnight_camping=True,
    ),
    "john-day-fossil": ObservingSiteModel(
        site_id="john-day-fossil",
        name="John Day Fossil Beds & Painted Hills",
        region="Eastern Oregon",
        bortle_class=1,
        sqm_reading=21.95,
        elevation_ft=2850,
        best_seasons=["spring", "summer", "fall"],
        featured_targets=[
            "Zodiacal light",
            "galactic center",
            "airglow waves",
            "Messier open and globular clusters",
        ],
        access_notes="Certified International Dark Sky Sanctuary region. Pristine darkness with virtually zero light dome. Day-use only at Painted Hills; nearby camping at Priest Hole and BLM recreation areas.",
        overnight_camping=False,
    ),
    "copper-ridge-cascades": ObservingSiteModel(
        site_id="copper-ridge-cascades",
        name="Copper Ridge & North Cascades Wilderness",
        region="North Cascades National Park",
        bortle_class=2,
        sqm_reading=21.75,
        elevation_ft=5400,
        best_seasons=["summer", "early fall"],
        featured_targets=[
            "High-alpine Milky Way arch",
            "airglow waves",
            "Perseid meteors",
            "dark nebulae",
        ],
        access_notes="Backcountry wilderness permit required from Marblemount Ranger Station. Multi-day backpacking access via Hannegan Pass. Exceptional remote alpine darkness far from urban illumination.",
        overnight_camping=True,
    ),
    "crater-lake-rim": ObservingSiteModel(
        site_id="crater-lake-rim",
        name="Crater Lake Rim",
        region="Southern Oregon Cascades",
        bortle_class=1,
        sqm_reading=21.92,
        elevation_ft=7100,
        best_seasons=["summer", "fall"],
        featured_targets=[
            "Galactic core reflection over caldera lake",
            "Andromeda Galaxy (M31)",
            "Perseid meteor shower",
            "atmospheric airglow",
        ],
        access_notes="Rim Drive pullouts and Watchman Peak overlook. High altitude (7,100 ft) provides exceptional atmospheric transparency and minimal light pollution. National Park entry pass required; Mazama Campground nearby.",
        overnight_camping=True,
    ),
}

DEFAULT_METEOR_SHOWERS: dict[str, MeteorShowerModel] = {
    "perseids": MeteorShowerModel(
        shower_id="perseids",
        name="Perseid Meteor Shower",
        peak_date="August 12-13",
        zhr_rate=100,
        parent_body="Comet 109P/Swift-Tuttle",
        notes="Fast and bright meteors with persistent ionization trains and frequent fireballs. Best viewed after midnight facing northeast toward Perseus.",
    ),
    "geminids": MeteorShowerModel(
        shower_id="geminids",
        name="Geminid Meteor Shower",
        peak_date="December 13-14",
        zhr_rate=120,
        parent_body="Asteroid 3200 Phaethon",
        notes="Strongest annual meteor shower featuring slow, bright, colorful multi-hued tracks. Viewing is possible earlier in the evening around 9:00 PM.",
    ),
    "orionids": MeteorShowerModel(
        shower_id="orionids",
        name="Orionid Meteor Shower",
        peak_date="October 21-22",
        zhr_rate=20,
        parent_body="Comet 1P/Halley",
        notes="Fast-moving meteors known for leaving lingering ion trails and fine fireballs. Radiates from the constellation Orion.",
    ),
    "lyrids": MeteorShowerModel(
        shower_id="lyrids",
        name="Lyrid Meteor Shower",
        peak_date="April 21-22",
        zhr_rate=18,
        parent_body="Comet C/1861 G1 (Thatcher)",
        notes="One of the oldest recorded meteor showers. Produces fast meteors with occasional bright dust surges and fireball trails.",
    ),
}

DARK_ADAPTATION_ADVICE = (
    "Allow 30 to 45 minutes for full rhodopsin dark adaptation. Use only deep red LED headlamps "
    "(under 650nm) and keep smartphone and vehicle display screens completely dark to preserve scotopic night vision."
)


def get_stargazing_sites(bortle_max: Optional[int] = None) -> list[ObservingSiteModel]:
    sites = list(DEFAULT_OBSERVING_SITES.values())
    if bortle_max is not None:
        sites = [s for s in sites if s.bortle_class <= bortle_max]
    return sites


def get_stargazing_site_by_id(site_id: str) -> Optional[ObservingSiteModel]:
    norm = site_id.strip().lower()
    if norm in DEFAULT_OBSERVING_SITES:
        return DEFAULT_OBSERVING_SITES[norm]
    for k, v in DEFAULT_OBSERVING_SITES.items():
        if k.lower() == norm or v.name.lower() == norm:
            return v
    return None


def calculate_viewing_window(req: ViewingWindowRequest) -> ViewingWindowResponse:
    site = get_stargazing_site_by_id(req.site_id)
    if not site:
        raise ValueError(f"Observing site '{req.site_id}' not found")

    score = 100
    reasons: list[str] = []

    # Moon phase evaluation
    moon = req.moon_phase.strip().lower()
    if moon == "new_moon":
        reasons.append("New moon phase provides a pitch-black sky background with zero lunar glare.")
    elif moon in ("waxing_crescent", "waning_crescent"):
        score -= 10
        reasons.append("Crescent moon causes minor sky brightness; optimal viewing window occurs once the moon sets.")
    elif moon in ("first_quarter", "last_quarter"):
        score -= 25
        reasons.append("Quarter moon causes moderate sky illumination; schedule faint DSO observations around moonset/moonrise.")
    elif moon in ("waxing_gibbous", "waning_gibbous"):
        score -= 45
        reasons.append("Gibbous moon washes out faint diffuse nebulosity, Milky Way dust lanes, and fainter stars.")
    elif moon == "full_moon":
        score -= 65
        reasons.append("Full moon causes severe sky wash-out, significantly degrading contrast for Milky Way and deep sky targets.")
    else:
        score -= 15
        reasons.append(f"Moon phase '{req.moon_phase}' moderately affects celestial background contrast.")

    # Cloud cover evaluation
    cloud = max(0, min(100, req.cloud_cover_percent))
    if cloud <= 15:
        score -= round(cloud * 0.5)
        reasons.append(f"Clear skies with minimal cloud obstruction ({cloud}% cloud cover).")
    elif cloud <= 35:
        score -= round(cloud * 0.8)
        reasons.append(f"Partly cloudy conditions ({cloud}% cloud cover); intermittent seeing windows expected.")
    else:
        score -= min(50, round(cloud * 1.0))
        reasons.append(f"Heavy cloud cover ({cloud}%); cloud layers will substantially obstruct celestial observations.")

    # Bortle class impact
    bortle_penalty = (site.bortle_class - 1) * 8
    score -= bortle_penalty
    reasons.append(f"Bortle Class {site.bortle_class} darkness ({site.sqm_reading} mag/arcsec² SQM) at {site.elevation_ft} ft elevation.")

    # Final score clamping
    score = max(5, min(100, score))

    if score >= 80:
        viewing_quality = "Optimal"
    elif score >= 60:
        viewing_quality = "Good"
    elif score >= 40:
        viewing_quality = "Fair"
    else:
        viewing_quality = "Poor"

    # Target-specific optics recommendations
    target = req.target_type.strip().lower()
    if "meteor" in target:
        recommended_optics = (
            "Naked eye observation with a wide-angle reclining camp chair for maximum sky coverage; "
            "optional 7x50 wide-field binoculars for observing persistent ionization smoke trains."
        )
    elif "deep_sky" in target:
        recommended_optics = (
            "8-inch to 10-inch Dobsonian reflector telescope, or 80-100mm ED APO refractor on an equatorial tracking mount "
            "equipped with UHC/OIII narrowband nebula filters."
        )
    elif "planet" in target:
        recommended_optics = (
            "150mm+ Schmidt-Cassegrain or Maksutov-Cassegrain telescope with 2x-3x Barlow lens and high-magnification planetary eyepieces."
        )
    elif "milky_way" in target:
        recommended_optics = (
            "Fast wide-angle camera lens (14-24mm f/1.8 to f/2.8) on a sturdy tripod for astrophotography; "
            "7x50 or 10x50 wide-angle binoculars for sweeping galactic core star clouds."
        )
    else:
        recommended_optics = (
            "10x50 wide-angle astronomical binoculars on a monopod or tripod, or an 80mm compact travel refractor telescope."
        )

    return ViewingWindowResponse(
        site_id=site.site_id,
        site_name=site.name,
        bortle_class=site.bortle_class,
        viewing_quality=viewing_quality,
        score=score,
        reasons=reasons,
        recommended_optics=recommended_optics,
        dark_adaptation_advice=DARK_ADAPTATION_ADVICE,
    )


def get_meteor_shower_calendar() -> list[MeteorShowerModel]:
    return list(DEFAULT_METEOR_SHOWERS.values())


def detect_stargazing_intent(query: str) -> Optional[StargazingIntent]:
    q = query.lower()

    # Exclusion for unrelated domains
    if any(
        w in q
        for w in [
            "refund",
            "climbing shoe",
            "kayak rental",
            "order #",
            "return label",
            "shipping tracking",
            "water filter",
            "fire ban",
            "campfire",
            "foraging",
            "avalanche danger",
            "ski tour",
            "splitboard",
        ]
    ):
        return None

    stargazing_keywords = [
        "stargaz",
        "dark sky",
        "dark skies",
        "bortle",
        "milky way",
        "astronomy",
        "astrophotograph",
        "celestial",
        "meteor shower",
        "meteor",
        "perseid",
        "geminid",
        "orionid",
        "lyrid",
        "seeing condition",
        "viewing window",
        "viewing quality",
        "sqm",
        "telescope",
        "optics",
        "prineville reservoir",
        "artist point",
        "john day fossil",
        "painted hills",
        "copper ridge",
        "crater lake",
    ]

    if not any(k in q for k in stargazing_keywords):
        return None

    # Detect Site
    site_id: Optional[str] = None
    if "prineville" in q:
        site_id = "prineville-reservoir"
    elif "artist point" in q or "mount baker" in q or "baker" in q:
        site_id = "artist-point-baker"
    elif "john day" in q or "painted hills" in q or "fossil" in q:
        site_id = "john-day-fossil"
    elif "copper ridge" in q:
        site_id = "copper-ridge-cascades"
    elif "crater lake" in q:
        site_id = "crater-lake-rim"

    # Detect Bortle Max
    bortle_max: Optional[int] = None
    bortle_match = re.search(r"bortle\s*(?:class\s*)?(\d)", q)
    if bortle_match:
        bortle_max = int(bortle_match.group(1))

    # Detect Target Type
    target_type: Optional[str] = None
    if "meteor" in q or "perseid" in q or "geminid" in q or "orionid" in q or "lyrid" in q:
        target_type = "meteor_shower"
    elif "deep sky" in q or "nebula" in q or "galaxy" in q or "messier" in q:
        target_type = "deep_sky"
    elif "planet" in q or "jupiter" in q or "saturn" in q or "mars" in q:
        target_type = "planets"
    elif "milky way" in q or "galactic" in q:
        target_type = "milky_way"

    # Detect Action
    if any(
        k in q
        for k in [
            "calculate",
            "viewing window",
            "viewing quality",
            "seeing condition",
            "forecast",
            "how are the conditions",
            "conditions for",
            "score",
        ]
    ):
        action = "calculate_viewing"
    elif any(
        k in q
        for k in [
            "meteor shower",
            "meteor showers",
            "perseids",
            "geminids",
            "orionids",
            "lyrids",
            "zhr",
            "shooting star",
            "meteor calendar",
        ]
    ):
        action = "meteor_showers"
    elif any(
        k in q
        for k in [
            "gear",
            "telescope",
            "optics",
            "binocular",
            "camera",
            "astrophotography gear",
            "lens",
            "tripod",
            "red light",
            "red headlamp",
            "dark adaptation",
        ]
    ):
        action = "gear_guide"
    elif site_id and any(
        k in q
        for k in [
            "about",
            "detail",
            "details",
            "tell me about",
            "what is",
            "elevation",
            "camping at",
            "how dark is",
        ]
    ):
        action = "site_detail"
    elif any(
        k in q
        for k in [
            "sites",
            "parks",
            "sanctuaries",
            "places",
            "where to go",
            "where can i see",
            "catalog",
            "list",
            "locations",
        ]
    ):
        action = "sites_list"
    elif site_id:
        action = "site_detail"
    else:
        action = "sites_list"

    return StargazingIntent(
        action=action,
        site_id=site_id,
        bortle_max=bortle_max,
        target_type=target_type,
    )


def build_stargazing_prompt(intent: StargazingIntent) -> str:
    lines = ["Pacific Northwest Dark Sky & Celestial Observation Tooling:"]

    if intent.action == "calculate_viewing":
        target_site_id = intent.site_id or "prineville-reservoir"
        try:
            calc = calculate_viewing_window(
                ViewingWindowRequest(
                    site_id=target_site_id,
                    target_type=intent.target_type or "milky_way",
                )
            )
            lines.extend([
                f"- Viewing Window Calculation for {calc.site_name} (Bortle {calc.bortle_class}):",
                f"  Viewing Quality: {calc.viewing_quality} (Score: {calc.score}/100)",
                f"  Reasons: {'; '.join(calc.reasons)}",
                f"  Recommended Optics: {calc.recommended_optics}",
                f"  Dark Adaptation: {calc.dark_adaptation_advice}",
            ])
        except ValueError:
            pass

    elif intent.action == "site_detail" and intent.site_id:
        site = get_stargazing_site_by_id(intent.site_id)
        if site:
            lines.extend([
                f"- Observing Site: {site.name} ({site.region})",
                f"  Bortle Class: {site.bortle_class} | SQM: {site.sqm_reading} mag/arcsec² | Elevation: {site.elevation_ft} ft",
                f"  Best Seasons: {', '.join(site.best_seasons)}",
                f"  Featured Targets: {', '.join(site.featured_targets)}",
                f"  Access & Camping: {site.access_notes} (Overnight camping: {'Yes' if site.overnight_camping else 'No'})",
            ])

    elif intent.action == "meteor_showers":
        showers = get_meteor_shower_calendar()
        lines.append("- Major Annual Meteor Showers:")
        for shower_item in showers:
            lines.append(f"  * {shower_item.name} ({shower_item.peak_date}): ZHR {shower_item.zhr_rate} meteors/hr (Parent: {shower_item.parent_body}). {shower_item.notes}")

    elif intent.action == "gear_guide":
        lines.extend([
            "- Celestial Optics & Dark Sky Equipment Guidance:",
            "  * Wide-Field Milky Way: 14-24mm f/1.8 to f/2.8 fast prime or zoom lenses on sturdy carbon-fiber tripods.",
            "  * Astronomy Binoculars: 7x50 or 10x50 with BaK-4 prisms and fully multi-coated optics for handheld star scanning.",
            "  * Telescopes: 8-inch Dobsonian reflectors for maximum light gathering aperture on faint DSOs; 80mm ED APO refractors for astrophotography.",
            "  * Dark Adaptation: Deep red LED lights (650nm+) exclusively; allow 30-45 minutes for retinal rhodopsin adaptation.",
        ])

    else:
        sites = get_stargazing_sites(bortle_max=intent.bortle_max)
        lines.append("- Designated Dark Sky Observing Sites:")
        for site_item in sites:
            lines.append(f"  * {site_item.name} ({site_item.site_id}): Bortle {site_item.bortle_class}, SQM {site_item.sqm_reading}, Elevation {site_item.elevation_ft} ft, Camping: {site_item.overnight_camping}")

    lines.extend([
        "",
        "- Celestial Observation Principles:",
        "  1. Dark Adaptation: Never use white light flashlight beams; red LEDs protect night vision.",
        "  2. Moon Phase Priority: Schedule deep-sky and Milky Way sessions during the new moon window (+/- 4 days).",
        "  3. Leave No Trace: Respect dark sky sanctuaries, pack out all waste, and camp only in designated spots.",
        "  4. Thermal Preparation: High elevation sites experience steep nighttime temperature drops; layer down insulation and wind gear.",
    ])

    return "\n".join(lines)


def format_stargazing_response(intent: StargazingIntent) -> dict[str, Any]:
    if intent.action == "calculate_viewing":
        target_site_id = intent.site_id or "prineville-reservoir"
        try:
            req = ViewingWindowRequest(
                site_id=target_site_id,
                target_type=intent.target_type or "milky_way",
            )
            calc = calculate_viewing_window(req)
            answer = (
                f"Viewing Window Assessment for {calc.site_name}: "
                f"Overall viewing quality is rated {calc.viewing_quality} with a condition score of {calc.score}/100. "
                f"Key factors: {'; '.join(calc.reasons)}. "
                f"Recommended optics: {calc.recommended_optics} "
                f"Dark adaptation tip: {calc.dark_adaptation_advice}"
            )
            return {
                "answer": answer,
                "stargazing_info": {
                    "action": "calculate_viewing",
                    "site_id": calc.site_id,
                    "site_name": calc.site_name,
                    "bortle_class": calc.bortle_class,
                    "viewing_quality": calc.viewing_quality,
                    "score": calc.score,
                    "reasons": calc.reasons,
                    "recommended_optics": calc.recommended_optics,
                    "dark_adaptation_advice": calc.dark_adaptation_advice,
                    "viewing_window": calc.model_dump(),
                },
            }
        except ValueError:
            pass

    if intent.action == "site_detail" and intent.site_id:
        site = get_stargazing_site_by_id(intent.site_id)
        if site:
            camping_text = "Overnight camping available." if site.overnight_camping else "Day-use viewing only (nearby camping available)."
            answer = (
                f"Dark Sky Observing Site: {site.name} ({site.region}). "
                f"Bortle Class: {site.bortle_class} (SQM {site.sqm_reading} mag/arcsec²) at {site.elevation_ft} ft elevation. "
                f"Best seasons: {', '.join(site.best_seasons)}. "
                f"Featured celestial targets: {', '.join(site.featured_targets)}. "
                f"Access & Camping: {site.access_notes} {camping_text}"
            )
            return {
                "answer": answer,
                "stargazing_info": {
                    "action": "site_detail",
                    "site_id": site.site_id,
                    "site": site.model_dump(),
                },
            }

    if intent.action == "meteor_showers":
        showers = get_meteor_shower_calendar()
        shower_bullets = "; ".join(f"{s.name} (peaks {s.peak_date}, ~{s.zhr_rate} ZHR)" for s in showers)
        answer = (
            f"Annual Meteor Shower Calendar: {shower_bullets}. "
            "For optimal meteor watching, face northeast from an open dark-sky clearing after midnight using the naked eye."
        )
        return {
            "answer": answer,
            "stargazing_info": {
                "action": "meteor_showers",
                "meteor_showers": [s.model_dump() for s in showers],
            },
        }

    if intent.action == "gear_guide":
        answer = (
            "Celestial Optics & Dark Sky Gear Guide: "
            "1) Wide-angle fast camera lenses (14-24mm f/1.8 to f/2.8) on a sturdy tripod are ideal for sweeping Milky Way panoramas. "
            "2) 7x50 or 10x50 binoculars with BaK-4 prisms offer outstanding wide-field views of open clusters, Andromeda, and meteor trains. "
            "3) Telescopes: 8-inch Dobsonian reflectors provide maximum light gathering for faint nebulae, while 80mm ED APO refractors excel for astrophotography. "
            "4) Dark Adaptation: Use only deep red LED headlamps and allow 30 to 45 minutes for night vision adaptation."
        )
        return {
            "answer": answer,
            "stargazing_info": {
                "action": "gear_guide",
                "recommended_gear": [
                    "14-24mm f/1.8-f/2.8 wide-angle camera lens",
                    "Sturdy carbon fiber tripod with ball head",
                    "7x50 or 10x50 wide-field astronomy binoculars",
                    "8-inch Dobsonian reflector telescope",
                    "Deep red LED headlamp (650nm+)",
                    "Insulated thermal pad and sleeping bag for cold night viewing",
                ],
            },
        }

    # Default "sites_list"
    sites = get_stargazing_sites(bortle_max=intent.bortle_max)
    sites_summary = "; ".join(f"{s.name} (Bortle {s.bortle_class}, SQM {s.sqm_reading})" for s in sites)
    answer = (
        f"Pacific Northwest Dark Sky Observing Sites: {sites_summary}. "
        "Plan trips around the new moon phase and allow 30-45 minutes for eyes to adapt using red light."
    )
    return {
        "answer": answer,
        "stargazing_info": {
            "action": "sites_list",
            "sites": [s.model_dump() for s in sites],
        },
    }
