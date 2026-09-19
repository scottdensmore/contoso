import re
from datetime import datetime, timezone
from typing import Any, Optional

from pydantic import BaseModel


class AvalancheProblemModel(BaseModel):
    problem_type: str  # "wind_slab", "storm_slab", "persistent_slab", "wet_loose"
    name: str
    likelihood: str
    expected_size: str
    aspects: list[str]
    elevations: list[str]
    travel_advice: str


class AvalancheZoneModel(BaseModel):
    zone_id: str
    name: str
    region: str
    danger_ratings: dict[str, int]
    overall_danger: int
    summary: str
    problems: list[AvalancheProblemModel]
    last_updated: str


class SlopeAssessmentRequest(BaseModel):
    zone_id: str
    slope_angle_deg: float
    elevation_band: str = "near_treeline"
    aspect: str = "NE"


class SlopeAssessmentResponse(BaseModel):
    zone_id: str
    slope_risk_category: str
    is_in_avalanche_terrain: bool
    danger_level: int
    recommendation: str
    advisory: str
    safety_protocols: list[str]


class AvalancheIntent(BaseModel):
    action: str  # "zones", "zone_detail", "slope_eval", "companion_rescue"
    zone_id: Optional[str] = None
    slope_angle_deg: Optional[float] = None
    elevation_band: Optional[str] = None
    aspect: Optional[str] = None


DEFAULT_AVALANCHE_ZONES: dict[str, AvalancheZoneModel] = {
    "stevens-pass": AvalancheZoneModel(
        zone_id="stevens-pass",
        name="Stevens Pass / Cascade Crest",
        region="Central Cascades",
        danger_ratings={
            "above_treeline": 3,
            "near_treeline": 3,
            "below_treeline": 2,
        },
        overall_danger=3,
        summary="Considerable avalanche danger above and near treeline with reactive wind slabs and storm slabs on lee slopes.",
        problems=[
            AvalancheProblemModel(
                problem_type="wind_slab",
                name="Wind Slab",
                likelihood="Likely",
                expected_size="D2 (Large)",
                aspects=["N", "NE", "E", "NW"],
                elevations=["above_treeline", "near_treeline"],
                travel_advice="Watch for pillowed snow and shooting cracks on lee features. Avoid steep unsupported convexities.",
            ),
            AvalancheProblemModel(
                problem_type="storm_slab",
                name="Storm Slab",
                likelihood="Possible",
                expected_size="D1.5 (Small-Medium)",
                aspects=["N", "NE", "E", "SE", "S", "SW", "W", "NW"],
                elevations=["above_treeline", "near_treeline", "below_treeline"],
                travel_advice="Give recent storm snow time to bond before committing to steep terrain.",
            ),
        ],
        last_updated=datetime.now(timezone.utc).isoformat(),
    ),
    "snoqualmie-pass": AvalancheZoneModel(
        zone_id="snoqualmie-pass",
        name="Snoqualmie Pass",
        region="West Slopes South",
        danger_ratings={
            "above_treeline": 3,
            "near_treeline": 2,
            "below_treeline": 1,
        },
        overall_danger=3,
        summary="Considerable danger above treeline with moderate danger near treeline; watch for rising snow levels and rain crust transitions.",
        problems=[
            AvalancheProblemModel(
                problem_type="storm_slab",
                name="Storm Slab",
                likelihood="Possible",
                expected_size="D2 (Large)",
                aspects=["N", "NE", "E"],
                elevations=["above_treeline", "near_treeline"],
                travel_advice="Look for cracking and test snow cohesiveness before committing to open slopes.",
            ),
            AvalancheProblemModel(
                problem_type="wet_loose",
                name="Wet Loose",
                likelihood="Likely",
                expected_size="D1 (Small)",
                aspects=["S", "SE", "SW"],
                elevations=["near_treeline", "below_treeline"],
                travel_advice="Avoid solar aspects when warming occurs or during rain events.",
            ),
        ],
        last_updated=datetime.now(timezone.utc).isoformat(),
    ),
    "mount-baker": AvalancheZoneModel(
        zone_id="mount-baker",
        name="Mount Baker / West Slopes North",
        region="North Cascades",
        danger_ratings={
            "above_treeline": 4,
            "near_treeline": 3,
            "below_treeline": 2,
        },
        overall_danger=4,
        summary="High avalanche danger above treeline following heavy snow and strong westerly gale-force winds.",
        problems=[
            AvalancheProblemModel(
                problem_type="wind_slab",
                name="Wind Slab",
                likelihood="Very Likely",
                expected_size="D2.5 (Large to Very Large)",
                aspects=["N", "NE", "E", "SE"],
                elevations=["above_treeline", "near_treeline"],
                travel_advice="Very dangerous avalanche conditions. Travel in avalanche terrain is not recommended above treeline.",
            ),
            AvalancheProblemModel(
                problem_type="storm_slab",
                name="Storm Slab",
                likelihood="Likely",
                expected_size="D2 (Large)",
                aspects=["N", "NE", "E", "SE", "S", "SW", "W", "NW"],
                elevations=["near_treeline", "below_treeline"],
                travel_advice="Identify terrain traps such as creek beds and gullies.",
            ),
        ],
        last_updated=datetime.now(timezone.utc).isoformat(),
    ),
    "mount-rainier": AvalancheZoneModel(
        zone_id="mount-rainier",
        name="Mount Rainier / Paradise & Muir",
        region="South Cascades",
        danger_ratings={
            "above_treeline": 4,
            "near_treeline": 3,
            "below_treeline": 2,
        },
        overall_danger=4,
        summary="High avalanche danger in alpine terrain; widespread reactive wind slabs and persistent weak layers on upper mountain slopes.",
        problems=[
            AvalancheProblemModel(
                problem_type="wind_slab",
                name="Wind Slab",
                likelihood="Very Likely",
                expected_size="D2.5 (Large)",
                aspects=["N", "NE", "E", "NW"],
                elevations=["above_treeline", "near_treeline"],
                travel_advice="Avoid all wind-loaded convexities, ridgelines, and cross-loaded couloirs.",
            ),
            AvalancheProblemModel(
                problem_type="persistent_slab",
                name="Persistent Slab",
                likelihood="Possible",
                expected_size="D3 (Very Large)",
                aspects=["N", "NE", "NW"],
                elevations=["above_treeline", "near_treeline"],
                travel_advice="Persistent weak layers buried deep in the snowpack can be triggered remotely. Stay on low angle terrain.",
            ),
        ],
        last_updated=datetime.now(timezone.utc).isoformat(),
    ),
    "olympics": AvalancheZoneModel(
        zone_id="olympics",
        name="Olympic Mountains / Hurricane Ridge",
        region="Olympic Peninsula",
        danger_ratings={
            "above_treeline": 2,
            "near_treeline": 2,
            "below_treeline": 1,
        },
        overall_danger=2,
        summary="Moderate avalanche danger across open alpine bowls and ridgelines with localized wind drift accumulations.",
        problems=[
            AvalancheProblemModel(
                problem_type="wind_slab",
                name="Wind Slab",
                likelihood="Possible",
                expected_size="D1.5 (Small-Medium)",
                aspects=["N", "NE", "E"],
                elevations=["above_treeline", "near_treeline"],
                travel_advice="Assess local wind effects and isolated cross-loading on upper ridge lines.",
            ),
            AvalancheProblemModel(
                problem_type="wet_loose",
                name="Wet Loose",
                likelihood="Possible",
                expected_size="D1 (Small)",
                aspects=["S", "SW", "SE"],
                elevations=["below_treeline", "near_treeline"],
                travel_advice="Be mindful of rollerballs and surface wet snow during afternoon clearing.",
            ),
        ],
        last_updated=datetime.now(timezone.utc).isoformat(),
    ),
}

AVALANCHE_ZONES_STORE: dict[str, AvalancheZoneModel] = {
    k: v.model_copy(deep=True) for k, v in DEFAULT_AVALANCHE_ZONES.items()
}


def reset_avalanche_store() -> None:
    """Resets avalanche store to default initial state."""
    global AVALANCHE_ZONES_STORE
    AVALANCHE_ZONES_STORE = {
        k: v.model_copy(deep=True) for k, v in DEFAULT_AVALANCHE_ZONES.items()
    }


def get_avalanche_zones(zone_id: Optional[str] = None) -> list[AvalancheZoneModel]:
    """Lists forecast zones, optionally filtered by zone ID."""
    if zone_id:
        zone = get_avalanche_zone_by_id(zone_id)
        return [zone] if zone else []
    return list(AVALANCHE_ZONES_STORE.values())


def get_avalanche_zone_by_id(zone_id: str) -> Optional[AvalancheZoneModel]:
    """Finds an avalanche forecast zone by exact or normalized ID."""
    normalized = zone_id.strip().lower()
    for k, v in AVALANCHE_ZONES_STORE.items():
        if k.lower() == normalized or v.zone_id.lower() == normalized:
            return v
    return None


def assess_slope_terrain(req: SlopeAssessmentRequest) -> SlopeAssessmentResponse:
    """Evaluates slope angle, terrain consequence, and danger level for avalanche terrain."""
    zone = get_avalanche_zone_by_id(req.zone_id)
    if not zone:
        raise ValueError(f"Avalanche zone '{req.zone_id}' not found")

    danger_level = zone.danger_ratings.get(req.elevation_band, zone.overall_danger)
    angle = req.slope_angle_deg

    if angle < 30.0:
        slope_risk_category = "low_angle_safe"
        is_in_avalanche_terrain = False
        recommendation = (
            f"Slope angle of {angle:.1f}° is under 30°, which is outside prime slab avalanche release angles. "
            "Generally safe for travel provided you remain vigilant for steeper connected slopes overhead (avalanche runout zones)."
        )
        advisory = (
            f"{zone.name} ({req.elevation_band}): Danger rating is Level {danger_level}. "
            "Low-angle slopes (<30°) offer safer route-finding options during heightened danger periods."
        )
    elif 30.0 <= angle <= 45.0:
        slope_risk_category = "prime_avalanche_terrain"
        is_in_avalanche_terrain = True
        recommendation = (
            f"Slope angle of {angle:.1f}° falls directly in the critical 30°-45° prime avalanche terrain range, "
            "where the vast majority of slab avalanches release. Extreme caution and disciplined terrain management required."
        )
        matching_problems = [
            p.name for p in zone.problems
            if req.elevation_band in p.elevations and (req.aspect in p.aspects or not p.aspects)
        ]
        prob_note = f" Active hazards on this aspect/elevation: {', '.join(matching_problems)}." if matching_problems else ""
        advisory = (
            f"{zone.name} ({req.elevation_band}, aspect {req.aspect}): Danger rating is Level {danger_level}. "
            f"Prime avalanche terrain ({angle:.1f}°).{prob_note}"
        )
    else:  # angle > 45.0
        slope_risk_category = "extreme_steep_sluff"
        is_in_avalanche_terrain = True
        recommendation = (
            f"Slope angle of {angle:.1f}° exceeds 45°. While frequent sluffing often prevents massive slab consolidation, "
            "extreme steep terrain carries severe fall consequences, terrain traps, and high-energy sluffing hazards."
        )
        advisory = (
            f"{zone.name} ({req.elevation_band}): Danger rating is Level {danger_level}. "
            f"Extremely steep terrain ({angle:.1f}°). Severe fall and sluff consequences."
        )

    safety_protocols = [
        "Mandatory companion safety gear: wear 3-antenna beacon (SEND mode), carry metal shovel, and 240cm+ probe.",
        "Perform a mandatory trailhead beacon function check (battery %, transmit, and receive) before departing.",
        "Expose only one traveler at a time to avalanche terrain while others watch from verified islands of safety.",
        "Identify and avoid terrain traps including gullies, creek beds, cliff bands, and open tree wells.",
        "Continuously evaluate signs of instability: shooting cracks, whumpfing sounds, and fresh avalanche activity.",
    ]

    return SlopeAssessmentResponse(
        zone_id=zone.zone_id,
        slope_risk_category=slope_risk_category,
        is_in_avalanche_terrain=is_in_avalanche_terrain,
        danger_level=danger_level,
        recommendation=recommendation,
        advisory=advisory,
        safety_protocols=safety_protocols,
    )


def get_companion_rescue_protocol() -> dict[str, Any]:
    """Returns comprehensive companion avalanche rescue and beacon check guidelines."""
    return {
        "title": "Backcountry Companion Avalanche Rescue & Beacon Check Protocol",
        "required_gear": [
            "3-antenna digital avalanche transceiver (beacon)",
            "Collapsible avalanche probe (240cm - 300cm)",
            "Durable metal-blade avalanche shovel",
            "First aid kit, bivy sack, and satellite communicator",
        ],
        "beacon_check": {
            "battery_check": "Transceivers must have at least 60% battery (use manufacturer-recommended battery chemistry).",
            "transmit_check": "Group leader stands 2-3 meters away, verifies every member is transmitting on 457 kHz.",
            "receive_check": "Group switches to search mode, verifies every member can receive a signal.",
            "send_mode": "All members switch back to SEND/TRANSMIT mode and securely stow beacons in dedicated harness under outer layer.",
        },
        "steps": [
            {
                "phase": "1. Scene Safety & Stop",
                "action": "Ensure no secondary avalanche danger. Switch all rescuers transceivers to SEARCH mode. Designate a search leader.",
            },
            {
                "phase": "2. Signal Search",
                "action": "Scan visual clues (gloves, ski poles). Move rapidly in parallel search strips (40m width) until initial transceiver signal acquired.",
            },
            {
                "phase": "3. Coarse Search",
                "action": "Follow beacon flux lines and distance indicator numbers down to approximately 2-3 meters. Keep beacon oriented in direction of travel.",
            },
            {
                "phase": "4. Fine Search",
                "action": "Slow down at 3 meters. Hold beacon flat close to snow surface without rotating. Bracket in a cross pattern to locate lowest distance reading.",
            },
            {
                "phase": "5. Probe Pinpointing",
                "action": "Assemble probe. Starting from lowest beacon reading, spiral outward at 25cm intervals perpendicular to the slope until strike confirmed. Leave probe in place.",
            },
            {
                "phase": "6. Strategic Shoveling",
                "action": "Step downhill from probe 1.5x burial depth. Excavate a V-shaped conveyor trench toward the victim. Shovel snow to sides and rear; rotate shovelers every 1-2 minutes.",
            },
            {
                "phase": "7. Airway & First Aid",
                "action": "Clear airway immediately upon reaching victim face. Protect cervical spine, provide CPR/rescue breaths if needed, insulate against hypothermia, and trigger SOS.",
            },
        ],
        "emergency_hotline": "911 / Local Search & Rescue (SAR)",
    }


def detect_avalanche_intent(query: str) -> Optional[AvalancheIntent]:
    """Detects customer inquiries regarding avalanche conditions, NWAC danger ratings, slope angle safety, beacon checks, and rescue gear."""
    q_lower = query.lower()

    keywords = [
        "avalanche", "snowpack", "nwac", "beacon", "beacons",
        "transceiver", "transceivers", "probe", "probes", "shoveling",
        "slope angle", "slope safety", "slope eval", "slope assessment",
        "avalanche danger", "avalanche hazard", "avalanche problem",
        "wind slab", "storm slab", "persistent slab", "wet loose",
        "companion rescue", "avalanche rescue", "burial rescue",
        "avalanche terrain", "avalanche conditions", "avalanche forecast",
        "beacon check", "beacon search", "avalanche gear",
    ]

    has_keyword = any(kw in q_lower for kw in keywords)
    has_pattern = bool(
        re.search(r"\b(\d+(?:\.\d+)?)\s*(?:°|deg|degrees?)\b", q_lower)
        or re.search(r"\b(avalanche|snowpack|nwac|beacon|slope)\b", q_lower)
    )

    if not has_keyword and not has_pattern:
        return None

    # Secondary check: don't capture generic unrelated queries
    if not any(k in q_lower for k in ["avalanche", "nwac", "slope", "beacon", "transceiver", "snowpack", "slab", "rescue"]):
        return None

    # Exclusion for legacy regional safety advisories (Cascades, Rockies, Sierra, Wasatch, Tetons without specific PNW zone)
    if "avalanche advisory" in q_lower and any(r in q_lower for r in ["cascades", "rockies", "sierra", "wasatch", "tetons"]) and not any(z in q_lower for z in ["stevens", "snoqualmie", "baker", "rainier", "olympic", "hurricane ridge"]):
        return None

    # Exclusion for satellite emergency beacons (Garmin inReach, Zoleo, SPOT checkin/registration)
    if any(k in q_lower for k in ["satellite beacon", "beacon check-in", "beacon checkin", "register beacon", "beacon registration"]):
        return None

    # Extract zone_id
    zone_id = None
    if "stevens" in q_lower:
        zone_id = "stevens-pass"
    elif "snoqualmie" in q_lower:
        zone_id = "snoqualmie-pass"
    elif "baker" in q_lower:
        zone_id = "mount-baker"
    elif "rainier" in q_lower or "paradise" in q_lower or "muir" in q_lower:
        zone_id = "mount-rainier"
    elif "olympic" in q_lower or "hurricane ridge" in q_lower:
        zone_id = "olympics"

    # Extract slope angle
    slope_angle_deg = None
    angle_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:°|deg|degrees?)", q_lower)
    if angle_match:
        try:
            slope_angle_deg = float(angle_match.group(1))
        except ValueError:
            pass
    elif "slope" in q_lower:
        num_match = re.search(r"slope(?:\s+angle)?(?:\s+of)?\s*(\d+(?:\.\d+)?)", q_lower)
        if num_match:
            try:
                slope_angle_deg = float(num_match.group(1))
            except ValueError:
                pass

    # Extract elevation band
    elevation_band = None
    if "above treeline" in q_lower or "above tree line" in q_lower or "alpine" in q_lower:
        elevation_band = "above_treeline"
    elif "below treeline" in q_lower or "below tree line" in q_lower:
        elevation_band = "below_treeline"
    elif "near treeline" in q_lower or "near tree line" in q_lower or "treeline" in q_lower:
        elevation_band = "near_treeline"

    # Extract aspect
    aspect = None
    aspect_match = re.search(r"\b(ne|nw|se|sw|north|south|east|west|n|s|e|w)\b(?=\s+aspect|\s+slope|\s+facing)?", q_lower)
    if aspect_match:
        raw_aspect = aspect_match.group(1).upper()
        aspect_map = {
            "NORTH": "N", "SOUTH": "S", "EAST": "E", "WEST": "W",
            "N": "N", "S": "S", "E": "E", "W": "W",
            "NE": "NE", "NW": "NW", "SE": "SE", "SW": "SW",
        }
        aspect = aspect_map.get(raw_aspect, raw_aspect)

    # Determine action
    if any(k in q_lower for k in ["companion rescue", "beacon check", "transceiver", "beacon search", "rescue", "burial", "pinpointing", "strategic shoveling"]):
        action = "companion_rescue"
    elif any(k in q_lower for k in ["slope", "angle", "degree", "degrees", "slope eval", "slope assessment", "incline", "°"]) or slope_angle_deg is not None:
        action = "slope_eval"
    elif any(k in q_lower for k in ["forecast", "condition", "conditions", "danger", "rating", "problems", "today", "tomorrow"]) or zone_id:
        action = "zone_detail" if zone_id else "zones"
    else:
        action = "zones"

    return AvalancheIntent(
        action=action,
        zone_id=zone_id,
        slope_angle_deg=slope_angle_deg,
        elevation_band=elevation_band,
        aspect=aspect,
    )


def build_avalanche_prompt(intent: AvalancheIntent) -> str:
    """Formats system prompt grounding lines for backcountry avalanche safety & snowpack assessment."""
    lines = [
        "Contoso Outdoors Backcountry Avalanche Safety & Snowpack Assessment Grounding:",
        "- Avalanche safety is essential for all winter backcountry recreationists in the Pacific Northwest.",
        "- Avalanche Danger Scale: 1-Low (generally safe), 2-Moderate (heightened conditions on specific terrain), 3-Considerable (dangerous avalanche conditions, careful snowpack evaluation needed), 4-High (very dangerous, travel in avalanche terrain not recommended), 5-Extreme (avoid all avalanche terrain).",
        "- Prime Avalanche Terrain: Slopes between 30° and 45° represent the primary initiation zone where the vast majority of slab avalanches release.",
        "- Slopes under 30° generally do not produce slab avalanches unless exposed to overhead runout zones.",
        "- Mandatory Rescue Gear: Digital 3-antenna avalanche transceiver, collapsible probe (240cm+), and durable metal-blade shovel.",
    ]

    if intent.zone_id:
        zone = get_avalanche_zone_by_id(intent.zone_id)
        if zone:
            lines.extend([
                f"Target Forecast Zone: {zone.name} ({zone.zone_id}) - Region: {zone.region}",
                f"- Overall Danger: Level {zone.overall_danger}",
                f"- Danger by Elevation: Above Treeline={zone.danger_ratings.get('above_treeline')}, Near Treeline={zone.danger_ratings.get('near_treeline')}, Below Treeline={zone.danger_ratings.get('below_treeline')}",
                f"- Forecast Summary: {zone.summary}",
                "- Active Avalanche Problems:",
            ])
            for p in zone.problems:
                lines.append(
                    f"  * {p.name} ({p.problem_type}): Likelihood={p.likelihood}, Expected Size={p.expected_size}, "
                    f"Aspects={', '.join(p.aspects)}, Elevations={', '.join(p.elevations)}. Advice: {p.travel_advice}"
                )
    else:
        zones = get_avalanche_zones()
        lines.append("Pacific Northwest Forecast Zones Overview:")
        for z in zones:
            lines.append(
                f"- {z.name} ({z.zone_id}): Overall Danger={z.overall_danger}/5, "
                f"Above Treeline={z.danger_ratings.get('above_treeline')}, Near Treeline={z.danger_ratings.get('near_treeline')}. Summary: {z.summary}"
            )

    if intent.action == "slope_eval" and intent.zone_id and intent.slope_angle_deg is not None:
        try:
            req = SlopeAssessmentRequest(
                zone_id=intent.zone_id,
                slope_angle_deg=intent.slope_angle_deg,
                elevation_band=intent.elevation_band or "near_treeline",
                aspect=intent.aspect or "NE",
            )
            assessment = assess_slope_terrain(req)
            lines.extend([
                f"Slope Angle Terrain Assessment ({intent.slope_angle_deg}° in {intent.zone_id}):",
                f"- Category: {assessment.slope_risk_category}",
                f"- Avalanche Terrain: {'YES' if assessment.is_in_avalanche_terrain else 'NO'}",
                f"- Danger Level: {assessment.danger_level}",
                f"- Recommendation: {assessment.recommendation}",
                f"- Advisory: {assessment.advisory}",
            ])
        except ValueError:
            pass

    if intent.action == "companion_rescue":
        proto = get_companion_rescue_protocol()
        lines.extend([
            f"{proto['title']}:",
            "- Beacon Check: Perform trailhead battery check (>60%), transmit check (leader receives), receive check, and return to SEND mode.",
            "- Rescue Protocol Steps: 1. Scene Safety -> 2. Signal Search (40m strips) -> 3. Coarse Search (follow flux lines) -> 4. Fine Search (bracket at 3m) -> 5. Probe Pinpointing (spiral 25cm) -> 6. Strategic Shoveling (V-trench conveyor) -> 7. Airway & First Aid.",
            f"- Emergency Contact: Call {proto['emergency_hotline']} immediately when communication is available.",
        ])

    lines.extend([
        "",
        "Instructions for Assistant:",
        "- Prioritize traveler safety above all else.",
        "- Clearly explain danger ratings (1-5) and specific avalanche problems (wind slab, storm slab, persistent slab, wet loose).",
        "- Highlight that 30°-45° is prime avalanche terrain requiring disciplined terrain management and group protocols.",
        "- Emphasize carrying the avalanche safety triad (beacon, shovel, probe) and performing companion rescue practice.",
    ])

    return "\n".join(lines)


def format_avalanche_response(intent: AvalancheIntent) -> dict[str, Any]:
    """Formats assistant answer and structured avalanche_info metadata."""
    if intent.action == "slope_eval":
        target_zone_id = intent.zone_id or "stevens-pass"
        slope_angle = intent.slope_angle_deg if intent.slope_angle_deg is not None else 35.0
        elevation = intent.elevation_band or "near_treeline"
        aspect = intent.aspect or "NE"

        try:
            req = SlopeAssessmentRequest(
                zone_id=target_zone_id,
                slope_angle_deg=slope_angle,
                elevation_band=elevation,
                aspect=aspect,
            )
            eval_res = assess_slope_terrain(req)
            zone = get_avalanche_zone_by_id(target_zone_id)
            zone_name = zone.name if zone else target_zone_id

            if eval_res.is_in_avalanche_terrain:
                answer = (
                    f"Slope Angle Safety Assessment for {zone_name} ({elevation}, {aspect} aspect, {slope_angle:.1f}°): "
                    f"This slope is categorized as {eval_res.slope_risk_category.replace('_', ' ').upper()} (Danger Level {eval_res.danger_level}). "
                    f"{eval_res.recommendation} {eval_res.advisory} "
                    f"Protocols: {'; '.join(eval_res.safety_protocols[:3])}."
                )
            else:
                answer = (
                    f"Slope Angle Safety Assessment for {zone_name} ({elevation}, {aspect} aspect, {slope_angle:.1f}°): "
                    f"This slope is categorized as {eval_res.slope_risk_category.replace('_', ' ').upper()} (Danger Level {eval_res.danger_level}). "
                    f"{eval_res.recommendation} {eval_res.advisory}"
                )

            return {
                "answer": answer,
                "avalanche_info": {
                    "action": "slope_eval",
                    "zone_id": eval_res.zone_id,
                    "slope_risk_category": eval_res.slope_risk_category,
                    "is_in_avalanche_terrain": eval_res.is_in_avalanche_terrain,
                    "danger_level": eval_res.danger_level,
                    "slope_angle_deg": slope_angle,
                    "elevation_band": elevation,
                    "aspect": aspect,
                    "recommendation": eval_res.recommendation,
                    "advisory": eval_res.advisory,
                    "safety_protocols": eval_res.safety_protocols,
                },
            }
        except ValueError:
            pass

    if intent.action in ("zone_detail", "zones") and intent.zone_id:
        zone = get_avalanche_zone_by_id(intent.zone_id)
        if zone:
            problem_summary = "; ".join(
                f"{p.name} ({p.likelihood}, size {p.expected_size} on {', '.join(p.aspects)})"
                for p in zone.problems
            )
            answer = (
                f"Avalanche Forecast for {zone.name} ({zone.region}): Overall Danger is Level {zone.overall_danger} "
                f"(Above Treeline: Level {zone.danger_ratings.get('above_treeline')}, Near Treeline: Level {zone.danger_ratings.get('near_treeline')}, "
                f"Below Treeline: Level {zone.danger_ratings.get('below_treeline')}). {zone.summary} "
                f"Active Problems: {problem_summary}. Always carry a beacon, probe, and shovel."
            )
            return {
                "answer": answer,
                "avalanche_info": {
                    "action": "zone_detail",
                    "zone": zone.model_dump(),
                },
            }

    if intent.action == "companion_rescue":
        proto = get_companion_rescue_protocol()
        steps_summary = " -> ".join(s["phase"] for s in proto["steps"][:5])
        answer = (
            "Backcountry Companion Avalanche Rescue & Beacon Check Protocol: "
            "1. Before leaving trailhead, perform battery check (>60%), transmit check, and range receive check before switching to SEND mode. "
            f"2. In an avalanche incident, key rescue sequence: {steps_summary}. "
            "3. Remember: Wear a 3-antenna transceiver, 240cm+ probe, and metal-blade shovel. Immediate companion rescue within 15 minutes is critical for survival."
        )
        return {
            "answer": answer,
            "avalanche_info": {
                "action": "companion_rescue",
                "protocol": proto,
            },
        }

    # Default "zones"
    zones = get_avalanche_zones()
    details = "; ".join(
        f"{z.name}: Overall Level {z.overall_danger}/5 (Above: {z.danger_ratings.get('above_treeline')}, Near: {z.danger_ratings.get('near_treeline')})"
        for z in zones
    )
    answer = (
        f"Pacific Northwest Avalanche Danger Ratings (NWAC): {details}. "
        "Remember that 30°-45° slopes represent prime avalanche terrain. Check local forecasts and carry mandatory beacon, probe, and shovel."
    )
    return {
        "answer": answer,
        "avalanche_info": {
            "action": "zones",
            "zones": [z.model_dump() for z in zones],
        },
    }
