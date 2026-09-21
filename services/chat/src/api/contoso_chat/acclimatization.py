from typing import Any, Optional

from pydantic import BaseModel


class AltitudePeakProfileModel(BaseModel):
    peak_id: str
    peak_name: str
    region: str
    summit_elevation_ft: int
    base_elevation_ft: int
    zone: str
    recommended_days: int
    max_daily_gain_ft: int
    oxygen_percentage_effective: float
    description: str
    key_camps: list[str]


class AcclimatizationPlanRequest(BaseModel):
    peak_id: str
    resting_heart_rate: int = 65
    current_altitude_ft: int = 5000
    target_altitude_ft: int = 14411
    days_allowed: int = 3
    prior_experience: str = "some_14er"


class AcclimatizationPlanResponse(BaseModel):
    peak_id: str
    peak_name: str
    recommended_daily_ascent_ft: int
    rest_days_required: int
    ams_risk: str
    climb_high_sleep_low_schedule: str
    hydration_liters: float
    emergency_oxygen_required: bool
    medical_advisory: str


class AltitudeMedicalGearRequirement(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class AcclimatizationIntent(BaseModel):
    action: str  # "peaks_list", "peak_detail", "acclimatization_plan", "gear_checklist"
    peak_id: Optional[str] = None
    zone: Optional[str] = None
    peak_name: Optional[str] = None


DEFAULT_ALTITUDE_PEAKS: dict[str, AltitudePeakProfileModel] = {
    "colorado-mount-elbert": AltitudePeakProfileModel(
        peak_id="colorado-mount-elbert",
        peak_name="Mount Elbert",
        region="Sawatch Range, Colorado",
        summit_elevation_ft=14440,
        base_elevation_ft=10040,
        zone="very_high_altitude",
        recommended_days=2,
        max_daily_gain_ft=1500,
        oxygen_percentage_effective=12.3,
        description="Highest summit in the Rocky Mountains and the highest peak in Colorado. Standard non-technical ascent routes still demand strict acclimatization pacing above 12,000 ft.",
        key_camps=[
            "South Elbert Trailhead (10,040 ft)",
            "Treeline Bivy Camp (11,800 ft)",
            "Summit Ridge (13,900 ft)",
        ],
    ),
    "washington-mount-rainier": AltitudePeakProfileModel(
        peak_id="washington-mount-rainier",
        peak_name="Mount Rainier",
        region="Cascade Range, Washington",
        summit_elevation_ft=14411,
        base_elevation_ft=5420,
        zone="very_high_altitude",
        recommended_days=3,
        max_daily_gain_ft=1500,
        oxygen_percentage_effective=12.3,
        description="Glaciated stratovolcano rising 9,000 ft above Paradise base. The rapid vertical relief demands an intermediate staging night at Camp Muir to mitigate severe acute mountain sickness.",
        key_camps=[
            "Paradise Base (5,420 ft)",
            "Camp Muir (10,080 ft)",
            "Ingraham Flats (11,100 ft)",
            "Columbia Crest Summit (14,411 ft)",
        ],
    ),
    "alaska-denali": AltitudePeakProfileModel(
        peak_id="alaska-denali",
        peak_name="Denali",
        region="Alaska Range, Alaska",
        summit_elevation_ft=20310,
        base_elevation_ft=7200,
        zone="extreme_altitude",
        recommended_days=18,
        max_daily_gain_ft=1000,
        oxygen_percentage_effective=9.5,
        description="Highest peak in North America and an extreme Arctic mountaineering expedition. Sub-arctic barometric pressure compresses effective oxygen to ~9.5%, requiring double-carry load ferries and multiple acclimatization rest days.",
        key_camps=[
            "Kahiltna Base Camp (7,200 ft)",
            "Camp 2 (11,200 ft)",
            "Camp 3 Basin (14,200 ft)",
            "High Camp (17,200 ft)",
            "Denali Summit (20,310 ft)",
        ],
    ),
    "california-mount-whitney": AltitudePeakProfileModel(
        peak_id="california-mount-whitney",
        peak_name="Mount Whitney",
        region="Sierra Nevada, California",
        summit_elevation_ft=14505,
        base_elevation_ft=8360,
        zone="very_high_altitude",
        recommended_days=2,
        max_daily_gain_ft=1500,
        oxygen_percentage_effective=12.2,
        description="Highest peak in the contiguous United States. Single-day ascents incur elevated AMS risk due to rapid 6,100 ft vertical gain; multi-day staging at Trail Camp is strongly advised.",
        key_camps=[
            "Whitney Portal (8,360 ft)",
            "Outpost Camp (10,360 ft)",
            "Trail Camp (12,040 ft)",
            "Trail Crest (13,600 ft)",
        ],
    ),
    "mexico-pico-de-orizaba": AltitudePeakProfileModel(
        peak_id="mexico-pico-de-orizaba",
        peak_name="Pico de Orizaba",
        region="Trans-Mexican Volcanic Belt, Mexico",
        summit_elevation_ft=18491,
        base_elevation_ft=10600,
        zone="extreme_altitude",
        recommended_days=4,
        max_daily_gain_ft=1200,
        oxygen_percentage_effective=10.5,
        description="Highest peak in Mexico and third-highest in North America. Rapid elevation gains from the Mexican plateau into extreme altitude require staging at Piedra Grande and vigilant pulse oximetry monitoring on the Jamapa Glacier.",
        key_camps=[
            "Tlachichuca Staging (8,500 ft)",
            "Piedra Grande Refugio (14,010 ft)",
            "The Labyrinth High Camp (15,800 ft)",
            "Jamapa Glacier Crater Rim (18,491 ft)",
        ],
    ),
}

DEFAULT_ALTITUDE_GEAR: list[AltitudeMedicalGearRequirement] = [
    AltitudeMedicalGearRequirement(
        item_id="pulse-oximeter",
        name="Medical-Grade Fingertip Pulse Oximeter & Cold-Resistant Pouch",
        category="monitoring",
        mandatory=True,
        purpose="Monitors blood oxygen saturation (SpO2) and resting pulse rate to detect subclinical hypoxia and track physiological acclimatization progression.",
    ),
    AltitudeMedicalGearRequirement(
        item_id="acetazolamide-diamox",
        name="Acetazolamide (Diamox) 125mg-250mg Tablets",
        category="medication",
        mandatory=True,
        purpose="Carbonic anhydrase inhibitor that acidifies blood, stimulating nocturnal ventilation and accelerating acclimatization above 10,000 ft.",
    ),
    AltitudeMedicalGearRequirement(
        item_id="gamow-hyperbaric-bag",
        name="Gamow Portable Inflatable Hyperbaric Chamber Bag",
        category="hyperbaric_rescue",
        mandatory=True,
        purpose="Inflatable pressurized fabric chamber providing emergency recompression (simulating a 4,000-7,000 ft descent) for acute HAPE or HACE stabilization.",
    ),
    AltitudeMedicalGearRequirement(
        item_id="insulated-hydration-flasks",
        name="Insulated Thermal Wide-Mouth Hydration Flasks (2x 1.5L)",
        category="hydration",
        mandatory=True,
        purpose="Maintains mandatory 4-5L/day fluid intake and prevents critical drinking water freezing in sub-zero alpine conditions.",
    ),
    AltitudeMedicalGearRequirement(
        item_id="dexamethasone-rescue",
        name="Dexamethasone 4mg Emergency Rescue Steroid",
        category="medication",
        mandatory=True,
        purpose="Potent anti-inflammatory corticosteroid for rapid emergency treatment of High Altitude Cerebral Edema (HACE) during emergency descent.",
    ),
    AltitudeMedicalGearRequirement(
        item_id="supplemental-emergency-o2",
        name="Portable Lightweight High-Altitude Oxygen Cylinder & Mask",
        category="respiratory_support",
        mandatory=True,
        purpose="Provides high-flow supplemental oxygen (2-4 L/min) for severe AMS, HAPE, or respiratory decompensation while descending.",
    ),
]


def get_altitude_profiles(zone: Optional[str] = None) -> list[AltitudePeakProfileModel]:
    peaks = list(DEFAULT_ALTITUDE_PEAKS.values())
    if zone:
        norm = zone.strip().lower().replace("-", "_").replace(" ", "_")
        if "extreme" in norm:
            target = "extreme_altitude"
        elif "very_high" in norm or "veryhigh" in norm:
            target = "very_high_altitude"
        elif "high" in norm:
            target = "high_altitude"
        else:
            target = norm
        return [p for p in peaks if p.zone == target or target in p.zone]
    return peaks


def get_altitude_profile_by_id(peak_id: str) -> Optional[AltitudePeakProfileModel]:
    return DEFAULT_ALTITUDE_PEAKS.get(peak_id.strip().lower())


def calculate_acclimatization_plan(req: AcclimatizationPlanRequest) -> AcclimatizationPlanResponse:
    peak = get_altitude_profile_by_id(req.peak_id)
    if not peak:
        raise ValueError(f"Altitude peak profile '{req.peak_id}' not found")

    target_alt = req.target_altitude_ft or peak.summit_elevation_ft
    current_alt = req.current_altitude_ft or peak.base_elevation_ft
    gain_ft = max(0, target_alt - current_alt)

    # Ascent pacing guidelines: max 1,000-1,500 ft/day above 10,000 ft
    if target_alt >= 18000:
        recommended_daily_ascent_ft = 1000
    elif target_alt >= 14000:
        recommended_daily_ascent_ft = 1200
    else:
        recommended_daily_ascent_ft = 1500

    # Rest day calculations: 1 rest day per 3,000 ft above 10,000 ft
    if target_alt >= 18000:
        rest_days_required = max(3, (target_alt - 10000) // 2500)
    elif target_alt > 10000:
        rest_days_required = max(1, (target_alt - 10000) // 3000)
    else:
        rest_days_required = 0

    # AMS Risk calculation
    daily_gain_projected = gain_ft / max(1, req.days_allowed)
    is_rapid = req.days_allowed < peak.recommended_days or daily_gain_projected > 2500
    is_tachycardic = req.resting_heart_rate > 85
    no_experience = req.prior_experience.strip().lower() in ("none", "novice", "beginner")

    if (
        daily_gain_projected > 3500
        or (target_alt >= 18000 and req.days_allowed < 7)
        or (is_rapid and is_tachycardic and no_experience)
    ):
        ams_risk = "critical"
    elif is_rapid or target_alt >= 18000 or daily_gain_projected > 2000 or is_tachycardic:
        ams_risk = "high"
    elif daily_gain_projected > 1200 or target_alt >= 12000 or req.days_allowed < 4:
        ams_risk = "moderate"
    else:
        ams_risk = "low"

    # Hydration requirements (4-5L/day)
    hydration_liters = 5.0 if target_alt >= 16000 else 4.5

    # Gamow bag / supplemental oxygen recommendations
    emergency_oxygen_required = target_alt >= 18000 or ams_risk == "critical"

    # Climb high sleep low schedule
    climb_high_sleep_low_schedule = (
        "Climb High, Sleep Low protocol: Ascend +2,000-2,500 ft during daytime acclimatization hikes, "
        "cache supplies at the higher point, and descend to sleep at lower camp (+1,000-1,500 ft net sleep gain). "
        f"Incorporate {rest_days_required} dedicated rest day(s) during ascent above 10,000 ft."
    )

    # Medical advisory incorporating Lake Louise score, Diamox, Gamow bag, and descent protocol
    advisories = [
        f"Acclimatization Plan for {peak.peak_name} ({target_alt} ft).",
        f"Elevation gain: {gain_ft} ft over {req.days_allowed} day(s). Projected daily rate: {int(daily_gain_projected)} ft/day.",
        f"AMS Risk Level: {ams_risk.upper()}.",
    ]

    if is_rapid:
        advisories.append(
            f"Warning: Rapid ascent schedule ({req.days_allowed} days vs recommended {peak.recommended_days} days) "
            "substantially increases risk of Acute Mountain Sickness (AMS), HAPE, and HACE."
        )

    if is_tachycardic:
        advisories.append(
            f"Resting heart rate of {req.resting_heart_rate} bpm indicates baseline physiological stress or early subclinical hypoxia."
        )

    advisories.append(
        "Lake Louise AMS Score Triage: Track headache score (0-3) plus gastrointestinal, fatigue, dizziness, and insomnia scores daily. "
        "A score >= 3 indicates AMS; halt ascent immediately."
    )
    advisories.append(
        "Medication Prophylaxis: Consider Acetazolamide (Diamox) 125mg BID starting 24 hours prior to ascent above 10,000 ft."
    )
    advisories.append(
        f"Hydration & Monitoring: Maintain {hydration_liters}L/day fluid intake; monitor resting SpO2 via pulse oximeter (target > 75-80% at high camp)."
    )

    if emergency_oxygen_required or target_alt >= 18000:
        advisories.append(
            "Emergency Rescue: Gamow hyperbaric bag and emergency supplemental oxygen cylinders must be accessible at high camp."
        )

    advisories.append(
        "Golden Rule of High Altitude Medicine: Never ascend with symptoms of AMS. "
        "Immediate descent of 2,000-3,000 ft is mandatory if symptoms worsen, ataxia occurs, or HAPE/HACE is suspected."
    )

    medical_advisory = " ".join(advisories)

    return AcclimatizationPlanResponse(
        peak_id=peak.peak_id,
        peak_name=peak.peak_name,
        recommended_daily_ascent_ft=recommended_daily_ascent_ft,
        rest_days_required=rest_days_required,
        ams_risk=ams_risk,
        climb_high_sleep_low_schedule=climb_high_sleep_low_schedule,
        hydration_liters=hydration_liters,
        emergency_oxygen_required=emergency_oxygen_required,
        medical_advisory=medical_advisory,
    )


def get_altitude_medical_gear() -> list[AltitudeMedicalGearRequirement]:
    return list(DEFAULT_ALTITUDE_GEAR)


def detect_acclimatization_intent(query: str) -> Optional[AcclimatizationIntent]:
    q = query.lower()

    # High-altitude & acclimatization specific keywords - at least one must be present
    acclimatization_keywords = [
        "acclimatization",
        "acclimatize",
        "acclimatizing",
        "acclimate",
        "acclimating",
        "altitude sickness",
        "acute mountain sickness",
        "ams score",
        "lake louise score",
        "lake louise",
        "diamox",
        "acetazolamide",
        "pulse oximeter altitude",
        "pulse oximeter for altitude",
        "pulse oximetry",
        "pulse oximeter",
        "gamow bag",
        "hyperbaric bag",
        "hyperbaric chamber",
        "denali acclimatization",
        "mount elbert altitude",
        "rainier acclimatization",
        "rainier altitude",
        "whitney acclimatization",
        "whitney altitude",
        "orizaba acclimatization",
        "orizaba altitude",
        "climb high sleep low",
        "climb high, sleep low",
        "high altitude cerebral edema",
        "high altitude pulmonary edema",
        "hape",
        "hace",
        "altitude profile",
        "ascent pacing",
        "altitude zone",
        "high altitude",
        "extreme altitude",
        "very high altitude",
    ]

    if not any(k in q for k in acclimatization_keywords):
        return None

    # Domain exclusions to guard against hijacking unrelated domains
    exclusions = [
        "refund",
        "order #",
        "return label",
        "crevasse",
        "rope team",
        "brake knots",
        "crampon",
        "ice axe",
        "z-pulley",
        "haul system",
        "skinning",
        "skin track",
        "splitboard",
        "ski tour",
        "whitewater",
        "packraft",
        "canyoneering",
        "slot canyon",
        "rappel station",
        "fly fishing",
        "foraging",
        "bikepacking",
        "shivering, fumbling hands",
        "heat exhaustion",
    ]
    if any(ex in q for ex in exclusions):
        return None

    # Peak identification
    peak_id = None
    peak_name = None
    if "elbert" in q:
        peak_id = "colorado-mount-elbert"
        peak_name = "Mount Elbert"
    elif "rainier" in q:
        peak_id = "washington-mount-rainier"
        peak_name = "Mount Rainier"
    elif "denali" in q:
        peak_id = "alaska-denali"
        peak_name = "Denali"
    elif "whitney" in q:
        peak_id = "california-mount-whitney"
        peak_name = "Mount Whitney"
    elif "orizaba" in q:
        peak_id = "mexico-pico-de-orizaba"
        peak_name = "Pico de Orizaba"

    # Zone identification
    zone = None
    if "extreme" in q:
        zone = "extreme_altitude"
    elif "very high" in q or "very_high" in q:
        zone = "very_high_altitude"

    # Action identification
    if any(
        k in q
        for k in [
            "gear",
            "checklist",
            "kit",
            "equipment",
            "oximeter",
            "pulse oximeter",
            "gamow bag",
            "gamow",
            "medical kit",
            "hyperbaric",
            "flasks",
        ]
    ):
        action = "gear_checklist"
    elif (
        any(k in q for k in ["peaks", "catalog", "zones", "list", "options", "support", "offer"])
        and not peak_id
        and not any(k in q for k in ["calculate", "plan for"])
    ):
        action = "peaks_list"
    elif any(
        k in q
        for k in [
            "plan",
            "ascent pacing",
            "pacing",
            "schedule",
            "calculate",
            "lake louise",
            "ams score",
            "acute mountain sickness",
            "diamox",
            "dosage",
            "rest day",
            "hape",
            "hace",
        ]
    ):
        action = "acclimatization_plan"
    elif peak_id and any(
        k in q
        for k in [
            "camps",
            "elevation",
            "detail",
            "about",
            "summit",
            "tell me about",
            "route details",
        ]
    ):
        action = "peak_detail"
    elif any(k in q for k in ["peaks", "catalog", "zones", "list", "options", "support", "offer"]):
        action = "peaks_list"
    elif peak_id:
        action = "peak_detail"
    else:
        action = "peaks_list"

    return AcclimatizationIntent(
        action=action,
        peak_id=peak_id,
        zone=zone,
        peak_name=peak_name,
    )


def build_acclimatization_prompt(intent: AcclimatizationIntent) -> str:
    lines = ["High-Altitude Acclimatization & Symptom Triage Tooling:"]

    if intent.peak_id:
        peak = get_altitude_profile_by_id(intent.peak_id)
        if peak:
            lines.append(
                f"- Peak Profile: {peak.peak_name} ({peak.region})\n"
                f"  Summit Elevation: {peak.summit_elevation_ft:,} ft | Base Elevation: {peak.base_elevation_ft:,} ft\n"
                f"  Altitude Zone: {peak.zone} | Recommended Duration: {peak.recommended_days} days\n"
                f"  Max Daily Gain: {peak.max_daily_gain_ft:,} ft/day | Effective O2: {peak.oxygen_percentage_effective}%\n"
                f"  Description: {peak.description}\n"
                f"  Key Acclimatization Camps: {'; '.join(peak.key_camps)}"
            )
    elif intent.zone:
        peaks = get_altitude_profiles(zone=intent.zone)
        lines.append(f"- Matching {intent.zone} Peaks: {', '.join(p.peak_name for p in peaks)}")
    else:
        peaks = get_altitude_profiles()
        formatted = [
            f"{p.peak_name} ({p.summit_elevation_ft:,} ft, {p.recommended_days} days)"
            for p in peaks
        ]
        lines.append(f"- Supported High-Altitude Peaks: {', '.join(formatted)}")

    lines.extend(
        [
            "- Altitude Ascent Pacing & Lake Louise AMS Protocol:",
            "  1. Above 10,000 ft, limit daily sleeping elevation gain to 1,000-1,500 ft.",
            "  2. Take 1 dedicated rest/acclimatization day every 3,000 ft of elevation gain.",
            "  3. Climb High, Sleep Low: Ascend 2,000-2,500 ft during day hikes, descend to sleep lower.",
            "  4. Lake Louise Score AMS triage: Evaluate headache + GI, fatigue, dizziness, and insomnia. Score >= 3 = AMS.",
            "  5. Hydration requirement: 4-5 L/day fluid intake to counter hyperventilation and dry air.",
            "- High-Altitude Medical Kit Compliance:",
            "  1. Medical-grade fingertip pulse oximeter (target SpO2 > 75-80% at camp).",
            "  2. Acetazolamide (Diamox) 125mg-250mg BID for AMS prevention.",
            "  3. Gamow portable hyperbaric chamber bag for acute emergency recompression.",
            "  4. Insulated hydration flasks (prevent freezing at sub-zero temperatures).",
            "  5. Dexamethasone 4mg for emergency treatment of HACE.",
            "  6. Portable supplemental oxygen cylinder for severe hypoxia / HAPE.",
            "- Golden Rule: Never ascend with symptoms of altitude sickness. Descent is the definitive cure.",
        ]
    )

    return "\n".join(lines)


def format_acclimatization_response(intent: AcclimatizationIntent) -> dict[str, Any]:
    if intent.action == "acclimatization_plan":
        target_peak_id = intent.peak_id or "washington-mount-rainier"
        try:
            req = AcclimatizationPlanRequest(peak_id=target_peak_id)
            plan = calculate_acclimatization_plan(req)
            answer = (
                f"High-Altitude Acclimatization Plan for {plan.peak_name}: "
                f"AMS Risk Level is {plan.ams_risk.upper()}. "
                f"Recommended ascent pacing: max {plan.recommended_daily_ascent_ft} ft/day above 10,000 ft with "
                f"{plan.rest_days_required} dedicated rest day(s). "
                f"Hydration requirement: {plan.hydration_liters} L/day. "
                f"{plan.climb_high_sleep_low_schedule} "
                f"{plan.medical_advisory}"
            )
            return {
                "answer": answer,
                "acclimatization_info": {
                    "action": "acclimatization_plan",
                    "plan": plan.model_dump(),
                },
            }
        except ValueError:
            pass

    if intent.action == "peak_detail" and intent.peak_id:
        peak = get_altitude_profile_by_id(intent.peak_id)
        if peak:
            answer = (
                f"Altitude Peak Profile: {peak.peak_name} ({peak.region}). "
                f"Summit Elevation: {peak.summit_elevation_ft:,} ft | Base: {peak.base_elevation_ft:,} ft | Zone: {peak.zone}. "
                f"Recommended Duration: {peak.recommended_days} days. Max Daily Gain: {peak.max_daily_gain_ft:,} ft/day. "
                f"Effective oxygen percentage at summit: {peak.oxygen_percentage_effective}%. "
                f"{peak.description} Key Camps: {', '.join(peak.key_camps)}."
            )
            return {
                "answer": answer,
                "acclimatization_info": {
                    "action": "peak_detail",
                    "peak": peak.model_dump(),
                },
            }

    if intent.action == "gear_checklist":
        gear = get_altitude_medical_gear()
        gear_summary = "; ".join(f"{g.name} ({g.purpose})" for g in gear[:3])
        answer = (
            f"Mandatory High-Altitude Medical Kit Checklist: {gear_summary}; "
            f"plus {', '.join(g.name for g in gear[3:])}. "
            "Ensure pulse oximeter batteries are protected against sub-zero temperatures and Gamow bag seal is inspected prior to departure."
        )
        return {
            "answer": answer,
            "acclimatization_info": {
                "action": "gear_checklist",
                "gear": [g.model_dump() for g in gear],
            },
        }

    # Default: peaks_list
    peaks = get_altitude_profiles(zone=intent.zone)
    peaks_summary = "; ".join(
        f"{p.peak_name} ({p.summit_elevation_ft:,} ft, {p.zone}, {p.recommended_days} days)"
        for p in peaks
    )
    answer = (
        f"High-Altitude Mountaineering Peaks Catalog: {peaks_summary}. "
        "Each peak profile provides summit elevation, recommended acclimatization days, maximum daily gain limits, and Lake Louise AMS triage advisories."
    )
    return {
        "answer": answer,
        "acclimatization_info": {
            "action": "peaks_list",
            "peaks": [p.model_dump() for p in peaks],
        },
    }
