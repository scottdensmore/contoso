import re
from typing import Any, Optional

from pydantic import BaseModel


class FieldReportModel(BaseModel):
    report_id: str
    trail_name: str
    hike_date: str
    reporter_username: str
    condition: str
    snow_depth_inches: int
    bug_rating: str
    parking_status: str
    notes: str
    has_hazard: bool


class HazardAlertModel(BaseModel):
    alert_id: str
    trail_name: str
    severity: str  # "Caution", "Warning", "Severe"
    hazard_type: str
    reported_date: str
    summary: str
    safety_advisory: str


class FieldReportsIntent(BaseModel):
    action: str  # "conditions", "alerts", "parking", "snowpack"
    trail_name: Optional[str] = None
    hazard_only: bool = False


# Catalog of 5 community trail field reports matching web catalog
FIELD_REPORTS_CATALOG: list[FieldReportModel] = [
    FieldReportModel(
        report_id="fr-mount-si",
        trail_name="Mount Si",
        hike_date="2026-09-15",
        reporter_username="cascade_hiker",
        condition="Dry / Clear",
        snow_depth_inches=0,
        bug_rating="Low",
        parking_status="Main lot full by 8:30 AM",
        notes="Trail in great shape until the haystack scramble. A few loose rocks, but no mud or blowdowns. Microspikes not needed.",
        has_hazard=False,
    ),
    FieldReportModel(
        report_id="fr-skyline-trail",
        trail_name="Skyline Trail",
        hike_date="2026-09-14",
        reporter_username="rainier_trekker",
        condition="Snowpack / Icy",
        snow_depth_inches=24,
        bug_rating="None",
        parking_status="Paradise lot fills by 9:00 AM on weekends",
        notes="Significant compacted snowpack above Panorama Point. Traction devices, gaiters, and trekking poles strongly recommended.",
        has_hazard=True,
    ),
    FieldReportModel(
        report_id="fr-enchantments-core",
        trail_name="Enchantments Core",
        hike_date="2026-09-16",
        reporter_username="alpine_wanderer",
        condition="Melting Snow / Wet",
        snow_depth_inches=12,
        bug_rating="Moderate",
        parking_status="Stuart Lake trailhead full overnight; Snow Lakes lot 70% full",
        notes="Core zone lakes thawing with melting snowpack. Beware unstable snow bridges across creek crossings between Colchuck and Core.",
        has_hazard=True,
    ),
    FieldReportModel(
        report_id="fr-lake-22",
        trail_name="Lake 22",
        hike_date="2026-09-17",
        reporter_username="pnw_paddler",
        condition="Muddy / Wet",
        snow_depth_inches=2,
        bug_rating="Low",
        parking_status="Lot 80% full by 10:00 AM",
        notes="Stream running high over the wooden boardwalks. Wet and muddy sections with slippery roots along the lower switchbacks.",
        has_hazard=False,
    ),
    FieldReportModel(
        report_id="fr-angels-landing",
        trail_name="Angel's Landing",
        hike_date="2026-09-16",
        reporter_username="desert_scrambler",
        condition="Dry / Windy",
        snow_depth_inches=0,
        bug_rating="None",
        parking_status="Shuttle required; Zion visitor center lot full by 7:30 AM",
        notes="Chains section completely dry. Gusty winds exceeding 40 mph on the exposed spine make balance challenging.",
        has_hazard=True,
    ),
]

# Catalog of 3 active hazard alerts
HAZARD_ALERTS_CATALOG: list[HazardAlertModel] = [
    HazardAlertModel(
        alert_id="alert-enchantments-snow-bridges",
        trail_name="Enchantments Core",
        severity="Warning",
        hazard_type="Collapsing Snow Bridges",
        reported_date="2026-09-16",
        summary="Rapid snowmelt has weakened snow bridges over streams between Lake Vivianne and Colchuck Pass.",
        safety_advisory="Avoid stepping on hollow-sounding snowpack near water drainages; use established rock bypasses.",
    ),
    HazardAlertModel(
        alert_id="alert-angels-landing-high-winds",
        trail_name="Angel's Landing",
        severity="Severe",
        hazard_type="High Winds",
        reported_date="2026-09-17",
        summary="Wind gusts exceeding 45 mph along exposed knife-edge chain section.",
        safety_advisory="Do not attempt the spine chain section during high wind advisories. Fall risk is extreme.",
    ),
    HazardAlertModel(
        alert_id="alert-mount-rainier-avalanche",
        trail_name="Mount Rainier",
        severity="Caution",
        hazard_type="Avalanche Risk",
        reported_date="2026-09-15",
        summary="Afternoon solar warming increasing loose wet avalanche danger on south-facing alpine slopes above Panorama Point.",
        safety_advisory="Check NWAC forecast before departure, carry beacon/shovel/probe, and start early to avoid afternoon heat.",
    ),
]

TRAIL_ALIASES: dict[str, list[str]] = {
    "Mount Si": ["mount si", "mt si", "mt. si", "si"],
    "Skyline Trail": ["skyline trail", "skyline", "panorama point", "mount rainier", "mt rainier", "mt. rainier", "rainier"],
    "Enchantments Core": ["enchantments core", "the enchantments", "enchantments", "colchuck", "lake vivianne", "stuart lake"],
    "Lake 22": ["lake 22", "lake twenty two", "lake twenty-two"],
    "Angel's Landing": ["angel's landing", "angels landing", "zion"],
    "Mount Rainier": ["mount rainier", "mt rainier", "mt. rainier", "rainier", "skyline", "skyline trail"],
}


def _matches_trail(canonical_name: str, query_name: str) -> bool:
    """Helper to check if a trail name matches a search query or its aliases."""
    if not query_name:
        return True
    
    # Split query into subterms (e.g. "Mount Si and Skyline Trail")
    subterms = [t.strip().lower() for t in re.split(r"&|,|\band\b|\bor\b", query_name) if t.strip()]
    if not subterms:
        subterms = [query_name.strip().lower()]

    norm_canonical = canonical_name.lower()
    aliases = TRAIL_ALIASES.get(canonical_name, [])

    for term in subterms:
        if term in norm_canonical or norm_canonical in term:
            return True
        for alias in aliases:
            if alias in term or term in alias:
                return True
    return False


def get_field_reports(
    trail_name: Optional[str] = None,
    condition: Optional[str] = None,
) -> list[FieldReportModel]:
    """Retrieves field reports with optional trail_name and condition filtering."""
    results: list[FieldReportModel] = []
    for report in FIELD_REPORTS_CATALOG:
        if trail_name and not _matches_trail(report.trail_name, trail_name):
            continue
        if condition and condition.strip().lower() not in report.condition.lower():
            continue
        results.append(report.model_copy(deep=True))
    return results


def get_hazard_alerts(
    trail_name: Optional[str] = None,
) -> list[HazardAlertModel]:
    """Retrieves active hazard alerts with optional trail_name filtering."""
    results: list[HazardAlertModel] = []
    for alert in HAZARD_ALERTS_CATALOG:
        if trail_name and not _matches_trail(alert.trail_name, trail_name):
            continue
        results.append(alert.model_copy(deep=True))
    return results


def detect_field_reports_intent(query: str) -> Optional[FieldReportsIntent]:
    """Detects inquiries regarding trail field conditions, mud, snowpack depth,
    parking availability, and active hazard alerts.
    """
    if not isinstance(query, str) or not query.strip():
        return None

    cleaned = query.strip()
    cleaned_lower = cleaned.lower()

    # Negative patterns: product questions, package tracking, returns
    negative_patterns = [
        r"\b(?:what\s+backpacking\s+tents|what\s+tents|which\s+tent|sleeping\s+bag|boots?\b.*sell|return\s+this)\b",
        r"\b(?:ctso-trk|ctso-\d+|fedex|ups|where\s+is\s+my\s+(?:order|package|shipment))\b",
    ]
    if any(re.search(pat, cleaned_lower) for pat in negative_patterns):
        return None

    # Trail names in catalog
    matched_trails: list[str] = []
    if re.search(r"\b(?:mount\s+si|mt\.?\s+si)\b", cleaned_lower):
        matched_trails.append("Mount Si")
    if re.search(r"\b(?:skyline\s+trail|skyline)\b", cleaned_lower):
        matched_trails.append("Skyline Trail")
    if re.search(r"\b(?:the\s+enchantments|enchantments(?:\s+core)?|colchuck)\b", cleaned_lower):
        matched_trails.append("The Enchantments")
    if re.search(r"\b(?:lake\s+22|lake\s+twenty[- ]two)\b", cleaned_lower):
        matched_trails.append("Lake 22")
    if re.search(r"\b(?:angel'?s\s+landing)\b", cleaned_lower):
        matched_trails.append("Angel's Landing")
    if re.search(r"\b(?:mount\s+rainier|mt\.?\s+rainier)\b", cleaned_lower) and "Skyline Trail" not in matched_trails:
        matched_trails.append("Mount Rainier")

    combined_trail_name = " & ".join(matched_trails) if matched_trails else None

    # Intent keyword groups
    alert_keywords = [
        r"\bhazards?\b",
        r"\btrail\s+warnings?\b",
        r"\bwarnings?\b",
        r"\bdanger(?:ous)?\b",
        r"\balerts?\b",
        r"\bactive\s+hazards?\b",
        r"\bsafety\s+advisories\b",
        r"\bsafety\s+advisory\b",
        r"\bavalanche(?:\s+risk)?\b",
        r"\bsnow\s+bridges?\b",
        r"\bhigh\s+winds?\b",
        r"\brockfall\b",
    ]
    snow_keywords = [
        r"\bsnowpack\b",
        r"\bsnow\s+depth\b",
        r"\bsnow\s+levels?\b",
        r"\bhow\s+much\s+snow\b",
        r"\bpostholing\b",
    ]
    parking_keywords = [
        r"\bparking\b",
        r"\bparking\s+status\b",
        r"\bparking\s+availability\b",
        r"\btrailhead\s+parking\b",
        r"\bparking\s+lot\b",
        r"\blot\s+full\b",
        r"\blot\s+fills?\b",
    ]
    condition_keywords = [
        r"\btrail\s+conditions?\b",
        r"\bfield\s+conditions?\b",
        r"\btrip\s+reports?\b",
        r"\btrail\s+reports?\b",
        r"\bfield\s+reports?\b",
        r"\bcommunity\s+(?:trail\s+)?reports?\b",
        r"\bmuddy\s+trails?\b",
        r"\bmuddy\b",
        r"\bblowdowns?\b",
        r"\bwashed\s+out\b",
        r"\blatest\s+conditions?\b",
        r"\bcurrent\s+conditions?\b",
    ]

    has_alert = any(re.search(pat, cleaned_lower) for pat in alert_keywords)
    has_snow = any(re.search(pat, cleaned_lower) for pat in snow_keywords)
    has_parking = any(re.search(pat, cleaned_lower) for pat in parking_keywords)
    has_condition = any(re.search(pat, cleaned_lower) for pat in condition_keywords)

    # General trail query with known catalog trail
    if not (has_alert or has_snow or has_parking or has_condition):
        if matched_trails and re.search(r"\b(?:conditions?|mud|snow|ice|icy|status)\b", cleaned_lower):
            has_condition = True
        else:
            return None

    # Determine action and hazard_only
    if has_alert:
        action = "alerts"
        hazard_only = True
    elif has_snow:
        action = "snowpack"
        hazard_only = False
    elif has_parking:
        action = "parking"
        hazard_only = False
    else:
        action = "conditions"
        hazard_only = False

    return FieldReportsIntent(
        action=action,
        trail_name=combined_trail_name,
        hazard_only=hazard_only,
    )


def build_field_reports_prompt(intent: FieldReportsIntent) -> str:
    """Builds grounding context for LLM prompt injection with field reports,
    snowpack conditions, parking status, and active hazard alerts.
    """
    lines = [
        "Contoso Outdoors Official Community Trail Field Reports & Hazard Advisories Grounding:",
        f"- Detected Intent Action: {intent.action.upper()}",
    ]
    if intent.trail_name:
        lines.append(f"- Destination / Trail Name: {intent.trail_name}")
    lines.append(f"- Hazard Only Filter: {intent.hazard_only}")

    lines.append("")
    lines.append("- Community Field Reports:")
    for report in FIELD_REPORTS_CATALOG:
        lines.append(
            f"  * {report.trail_name} (Report ID: {report.report_id}, Date: {report.hike_date}): "
            f"Condition: {report.condition} | Snow Depth: {report.snow_depth_inches}\" | "
            f"Bugs: {report.bug_rating} | Parking: {report.parking_status} | "
            f"Has Hazard: {report.has_hazard} | Notes: {report.notes}"
        )

    lines.append("")
    lines.append("- Active Hazard Alerts:")
    for alert in HAZARD_ALERTS_CATALOG:
        lines.append(
            f"  * [{alert.severity.upper()}] {alert.trail_name} - {alert.hazard_type} "
            f"(Alert ID: {alert.alert_id}, Reported: {alert.reported_date}): "
            f"Summary: {alert.summary} | Safety Advisory: {alert.safety_advisory}"
        )

    lines.extend([
        "",
        "Instructions for Assistant:",
        "- Ground responses strictly in the community trail field reports and hazard alerts above.",
        "- Always detail trail conditions (clear, snowpack, icy, muddy), snow depth in inches, and parking congestion times.",
        "- Highlight any active hazard alerts (Caution, Warning, Severe) prominently with the safety advisory.",
        "- Provide practical gear and preparation advice (traction devices, microspikes, trekking poles, wind layers, early arrival for parking).",
    ])

    return "\n".join(lines)


def format_field_reports_response(intent: FieldReportsIntent) -> dict[str, Any]:
    """Returns formatted human-readable answer and structured field_reports_info payload."""
    matched_reports = get_field_reports(trail_name=intent.trail_name)
    matched_alerts = get_hazard_alerts(trail_name=intent.trail_name)

    field_reports_info: dict[str, Any] = {
        "action": intent.action,
        "trail_name": intent.trail_name,
        "hazard_only": intent.hazard_only,
        "reports": [r.model_dump() for r in (matched_reports if intent.trail_name else FIELD_REPORTS_CATALOG)],
        "alerts": [a.model_dump() for a in (matched_alerts if intent.trail_name else HAZARD_ALERTS_CATALOG)],
        "has_active_hazards": any(r.has_hazard for r in matched_reports) or len(matched_alerts) > 0,
    }

    # Format answer based on intent action
    if intent.action == "alerts" or intent.hazard_only:
        if matched_alerts:
            alert_lines = []
            for alert in matched_alerts:
                alert_lines.append(
                    f"[{alert.severity.upper()}] {alert.trail_name} - {alert.hazard_type}: {alert.summary} "
                    f"Safety Advisory: {alert.safety_advisory}"
                )
            answer = (
                f"Active hazard alerts found for {intent.trail_name or 'the area'}:\n"
                + "\n".join(f"- {line}" for line in alert_lines)
            )
        else:
            answer = (
                f"No active hazard alerts are currently reported for {intent.trail_name or 'the selected trails'}. "
                "Trail conditions appear normal, but always stay alert and carry the Ten Essentials."
            )
    elif intent.action == "snowpack":
        reports_to_show = matched_reports if matched_reports else FIELD_REPORTS_CATALOG
        snow_lines = []
        for r in reports_to_show:
            snow_lines.append(
                f"{r.trail_name}: {r.snow_depth_inches}\" snow depth ({r.condition}). Parking: {r.parking_status}."
            )
        answer = (
            f"Current snowpack and depth information for {intent.trail_name or 'regional trails'}:\n"
            + "\n".join(f"- {line}" for line in snow_lines)
        )
    elif intent.action == "parking":
        reports_to_show = matched_reports if matched_reports else FIELD_REPORTS_CATALOG
        parking_lines = []
        for r in reports_to_show:
            parking_lines.append(
                f"{r.trail_name}: {r.parking_status} (Conditions: {r.condition}, Snow Depth: {r.snow_depth_inches}\")."
            )
        answer = (
            f"Trailhead parking status for {intent.trail_name or 'popular trails'}:\n"
            + "\n".join(f"- {line}" for line in parking_lines)
        )
    else:  # "conditions"
        reports_to_show = matched_reports if matched_reports else FIELD_REPORTS_CATALOG
        condition_lines = []
        for r in reports_to_show:
            cond_str = (
                f"{r.trail_name}: Condition is {r.condition} with {r.snow_depth_inches}\" of snow depth. "
                f"Parking: {r.parking_status}. Notes: {r.notes}"
            )
            condition_lines.append(cond_str)

        # Include any relevant hazard alerts
        alerts_summary = ""
        if matched_alerts:
            alert_descs = [
                f"[{a.severity}] {a.trail_name} - {a.hazard_type}: {a.summary}"
                for a in matched_alerts
            ]
            alerts_summary = "\n\nActive Hazard Alerts:\n" + "\n".join(f"- {d}" for d in alert_descs)

        answer = (
            f"Here are the latest community trail field reports and conditions for {intent.trail_name or 'local trails'}:\n"
            + "\n".join(f"- {line}" for line in condition_lines)
            + alerts_summary
        )

    return {
        "answer": answer,
        "field_reports_info": field_reports_info,
    }
