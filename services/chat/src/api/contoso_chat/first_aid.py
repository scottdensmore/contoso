import re
from typing import Any, Optional

from pydantic import BaseModel


class MedicalConditionModel(BaseModel):
    condition_id: str
    title: str
    category: str
    severity: str
    symptoms: list[str]
    field_treatments: list[str]
    evacuation_urgency: str
    red_flag_signs: list[str]


class KitItemModel(BaseModel):
    name: str
    category: str
    quantity: int
    essential: bool
    notes: str


class KitCalcRequest(BaseModel):
    party_size: int = 2
    trip_days: int = 3


class KitCalcResponse(BaseModel):
    party_size: int
    trip_days: int
    total_items: int
    items: list[KitItemModel]


class TriageRequest(BaseModel):
    symptoms: list[str]
    injury_type: Optional[str] = None
    is_conscious: bool = True
    can_walk: bool = True


class TriageResponse(BaseModel):
    condition_match: str
    severity: str
    evacuation_urgency: str
    immediate_action: str
    treatment_steps: list[str]
    sar_recommended: bool


class FirstAidIntent(BaseModel):
    action: str  # "conditions", "triage", "kit_calc", "sar_evac", "protocol"
    condition_id: Optional[str] = None
    category: Optional[str] = None
    party_size: Optional[int] = None
    trip_days: Optional[int] = None


DEFAULT_CONDITIONS: dict[str, MedicalConditionModel] = {
    "hypothermia": MedicalConditionModel(
        condition_id="hypothermia",
        title="Hypothermia & Cold Exposure",
        category="environmental",
        severity="Critical",
        symptoms=[
            "uncontrollable shivering",
            "fumbling hands",
            "slurred speech",
            "apathy",
            "confusion",
            "cold pale skin",
            "loss of coordination",
            "exhaustion",
            "slow shallow breathing",
            "shivering",
        ],
        field_treatments=[
            "Shelter immediately from wind, snow, and moisture; isolate patient from cold ground using foam sleeping pads.",
            "Gently remove wet clothing and replace with warm, dry synthetic or merino wool layers.",
            "Wrap casualty in vapor barrier / emergency foil space blanket and full sleeping bag ('burrito' wrap).",
            "Apply chemical heat packs or warm water bottles wrapped in cloth to the torso, armpits, and groin.",
            "Provide warm, sweetened, non-caffeinated liquids only if casualty is fully conscious and able to swallow.",
        ],
        evacuation_urgency="Urgent",
        red_flag_signs=[
            "Cessation of shivering with cold pale skin",
            "Loss of consciousness, stupor, or coma",
            "Cardiac arrhythmias or imperceptible pulse",
            "Inability to walk or speak coherently",
        ],
    ),
    "heat-stroke": MedicalConditionModel(
        condition_id="heat-stroke",
        title="Heat Exhaustion & Heat Stroke",
        category="environmental",
        severity="Critical",
        symptoms=[
            "hot dry skin",
            "heavy sweating",
            "throbbing headache",
            "dizziness",
            "nausea",
            "confusion",
            "rapid heart rate",
            "elevated core temperature",
            "heat cramps",
            "fainting",
        ],
        field_treatments=[
            "Move casualty to shaded, cool terrain immediately; loosen or remove heavy outerwear and pack.",
            "Douse body with cool water and fan vigorously to promote rapid evaporative cooling.",
            "Apply ice packs or cold wet towels wrapped in cloth to neck, armpits, and groin.",
            "Provide small sips of cool water or electrolyte drink only if conscious, alert, and able to swallow.",
            "Monitor core temperature and elevate legs slightly if patient feels faint.",
        ],
        evacuation_urgency="Immediate",
        red_flag_signs=[
            "Altered mental status, delirium, or severe confusion",
            "Hot, dry skin with complete cessation of sweating",
            "Seizures, persistent vomiting, or syncope",
            "Loss of consciousness",
        ],
    ),
    "altitude-sickness": MedicalConditionModel(
        condition_id="altitude-sickness",
        title="Acute Mountain Sickness (AMS), HAPE & HACE",
        category="environmental",
        severity="Critical",
        symptoms=[
            "throbbing headache",
            "nausea",
            "dizziness",
            "insomnia",
            "fatigue",
            "shortness of breath at rest",
            "cough with pink frothy sputum",
            "ataxia",
            "confusion",
        ],
        field_treatments=[
            "Cease ascent immediately; rest and hydrate at current altitude without climbing higher.",
            "Descend 1,000 to 3,000 feet immediately if symptoms do not improve or red flags present.",
            "Administer supplemental oxygen or portable hyperbaric chamber (Gamow bag) if available.",
            "Maintain patient warmth, avoid exertion, and keep hydrated; avoid sedatives.",
            "Administer acetazolamide (Diamox) for AMS or dexamethasone for HACE per medical guidelines.",
        ],
        evacuation_urgency="Immediate",
        red_flag_signs=[
            "Ataxia (loss of physical coordination / inability to perform tandem heel-to-toe walk)",
            "Persistent cough with pink frothy sputum (High Altitude Pulmonary Edema - HAPE)",
            "Severe confusion, hallucinations, or lethargy (High Altitude Cerebral Edema - HACE)",
            "Shortness of breath while resting",
        ],
    ),
    "musculoskeletal-fractures": MedicalConditionModel(
        condition_id="musculoskeletal-fractures",
        title="Musculoskeletal Fractures & Dislocations",
        category="trauma",
        severity="Urgent",
        symptoms=[
            "severe localized pain",
            "inability to bear weight",
            "visible deformity",
            "rapid swelling and bruising",
            "crepitus or bone grating",
            "loss of joint function",
            "broken bone",
        ],
        field_treatments=[
            "Assess distal Circulation, Sensation, and Movement (CSM) before and after splinting.",
            "Immobilize the joints both above and below the suspected fracture site using a SAM splint or rigid improvised support.",
            "Pad all void spaces around the splint and secure snugly with elastic or cohesive bandage without constricting blood flow.",
            "Elevate the injured limb and apply cold compress wrapped in cloth to minimize swelling.",
            "Re-assess distal pulses, sensation, and capillary refill after immobilization.",
        ],
        evacuation_urgency="Urgent",
        red_flag_signs=[
            "Open / compound fracture with bone piercing skin",
            "Absent distal pulse or cold pulseless limb",
            "Loss of motor sensation in fingers or toes",
            "Uncontrolled arterial hemorrhage",
        ],
    ),
    "anaphylaxis": MedicalConditionModel(
        condition_id="anaphylaxis",
        title="Severe Allergic Reaction & Anaphylaxis",
        category="medical",
        severity="Critical",
        symptoms=[
            "hives and generalized itching",
            "facial swelling or angioedema",
            "stridor or wheezing",
            "throat tightness or difficulty swallowing",
            "dizziness or hypotension",
            "abdominal cramps or vomiting",
            "bee sting reaction",
        ],
        field_treatments=[
            "Administer Epinephrine auto-injector (0.3mg adult, 0.15mg child) immediately into anterolateral outer mid-thigh.",
            "Activate 2-way satellite SOS / call emergency Search and Rescue immediately.",
            "Position patient lying flat with legs elevated unless respiratory distress requires sitting upright.",
            "Prepare a second epinephrine injection if symptoms do not improve or rebound within 5 to 15 minutes.",
            "Administer oral antihistamines (diphenhydramine) and albuterol inhaler only as secondary adjuncts after epinephrine.",
        ],
        evacuation_urgency="Immediate",
        red_flag_signs=[
            "Airway compromise, severe stridor, or inability to breathe",
            "Rapidly dropping blood pressure, dizziness, or syncope",
            "Biphasic reaction recurrence",
            "Cyanosis around lips or nailbeds",
        ],
    ),
}

CONDITIONS_STORE: dict[str, MedicalConditionModel] = {
    k: v.model_copy(deep=True) for k, v in DEFAULT_CONDITIONS.items()
}


def get_medical_conditions(
    category: Optional[str] = None,
    severity: Optional[str] = None,
) -> list[MedicalConditionModel]:
    """Lists backcountry medical conditions with optional filtering by category and severity."""
    conds = list(CONDITIONS_STORE.values())
    if category:
        c_clean = category.strip().lower()
        conds = [c for c in conds if c.category.lower() == c_clean]
    if severity:
        s_clean = severity.strip().lower()
        conds = [c for c in conds if c.severity.lower() == s_clean]
    return conds


def get_medical_condition_by_id(condition_id: str) -> Optional[MedicalConditionModel]:
    """Finds a medical condition by exact ID or common aliases."""
    cid = condition_id.strip().lower()
    for k, v in CONDITIONS_STORE.items():
        if k.lower() == cid or v.condition_id.lower() == cid:
            return v
    # Common alias matching
    if "hypotherm" in cid:
        return CONDITIONS_STORE.get("hypothermia")
    if "heat" in cid or "stroke" in cid or "exhaustion" in cid:
        return CONDITIONS_STORE.get("heat-stroke")
    if "altitude" in cid or "mountain" in cid or "ams" in cid or "hape" in cid or "hace" in cid:
        return CONDITIONS_STORE.get("altitude-sickness")
    if "fracture" in cid or "broken" in cid or "bone" in cid or "sprain" in cid or "dislocat" in cid:
        return CONDITIONS_STORE.get("musculoskeletal-fractures")
    if "anaphylax" in cid or "allergic" in cid or "allergy" in cid:
        return CONDITIONS_STORE.get("anaphylaxis")
    return None


def assess_wilderness_triage(req: TriageRequest) -> TriageResponse:
    """Performs algorithmic backcountry triage assessment based on symptoms and ambulatory status."""
    symptoms_text = " ".join(req.symptoms).lower()
    if req.injury_type:
        symptoms_text = f"{symptoms_text} {req.injury_type.lower()}"

    # Score conditions based on symptom keyword overlap
    scores: dict[str, int] = {k: 0 for k in CONDITIONS_STORE}
    for cid, cond in CONDITIONS_STORE.items():
        for sym in cond.symptoms:
            if sym.lower() in symptoms_text:
                scores[cid] += 3
            else:
                words = [w for w in sym.lower().split() if len(w) > 3]
                if any(w in symptoms_text for w in words):
                    scores[cid] += 1

    # Keyword boosts
    if any(k in symptoms_text for k in ["shiver", "cold", "hypotherm", "fumble", "freez"]):
        scores["hypothermia"] += 5
    if any(k in symptoms_text for k in ["heat", "hot", "sun", "stroke", "hypertherm"]):
        scores["heat-stroke"] += 5
    if any(k in symptoms_text for k in ["altitude", "ams", "hape", "hace", "elevation", "headache", "ataxia"]):
        scores["altitude-sickness"] += 5
    if any(k in symptoms_text for k in ["fracture", "broken", "bone", "splint", "twist", "deform"]):
        scores["musculoskeletal-fractures"] += 5
    if any(k in symptoms_text for k in ["anaphylax", "allergic", "epipen", "epinephrine", "hives", "wheez", "sting"]):
        scores["anaphylaxis"] += 5

    best_cid = max(scores, key=lambda k: scores[k])
    matched = CONDITIONS_STORE[best_cid]

    # Evaluate severity, evacuation urgency, and SAR requirement
    sar_recommended = False
    treatment_steps = list(matched.field_treatments)

    if not req.is_conscious:
        severity = "Critical"
        evacuation_urgency = "Immediate"
        sar_recommended = True
        immediate_action = (
            "Patient is unconscious. Check airway, breathing, and circulation (ABC). "
            "Place patient in lateral recovery position and activate 2-way satellite SOS emergency beacon immediately."
        )
        treatment_steps.insert(0, "Maintain open airway in lateral recovery position; monitor breathing and pulse every 5 minutes.")
    elif not req.can_walk:
        severity = "Critical" if matched.severity == "Critical" else "Urgent"
        evacuation_urgency = "Immediate"
        sar_recommended = True
        immediate_action = (
            "Insulate and shelter patient immediately. Patient is non-ambulatory; "
            "prepare for assisted walkout or Search & Rescue (SAR) evacuation / litter carry."
        )
        treatment_steps.append("Do not attempt unassisted walking; establish shelter and signal Search & Rescue (SAR) for litter or helicopter evacuation.")
    elif matched.condition_id in ("anaphylaxis", "heat-stroke") or (
        matched.condition_id == "altitude-sickness" and any(rf in symptoms_text for rf in ["ataxia", "cough", "pink"])
    ):
        severity = "Critical"
        evacuation_urgency = "Immediate"
        sar_recommended = True
        immediate_action = (
            f"Life-threatening condition ({matched.title}). Administer immediate stabilization and trigger satellite SOS for urgent SAR evacuation."
        )
    else:
        severity = matched.severity
        evacuation_urgency = matched.evacuation_urgency
        sar_recommended = False
        immediate_action = f"Shelter patient from weather and proceed with field stabilization for {matched.title}."

    return TriageResponse(
        condition_match=matched.title,
        severity=severity,
        evacuation_urgency=evacuation_urgency,
        immediate_action=immediate_action,
        treatment_steps=treatment_steps,
        sar_recommended=sar_recommended,
    )


def calculate_first_aid_kit(req: KitCalcRequest) -> KitCalcResponse:
    """Calculates dynamically scaled first aid kit supply quantities based on party size and trip days."""
    p = max(1, req.party_size)
    d = max(1, req.trip_days)

    items: list[KitItemModel] = [
        KitItemModel(
            name="Sterile Gauze Pads (4x4 in)",
            category="Wound Care",
            quantity=max(8, p * d * 2),
            essential=True,
            notes="Sterile absorbent pads for direct wound pressure and bleeding control.",
        ),
        KitItemModel(
            name="Conforming Rolled Gauze (3 in)",
            category="Wound Care",
            quantity=max(2, p * 2),
            essential=True,
            notes="Secures sterile dressings to limbs and wraps irregular wounds.",
        ),
        KitItemModel(
            name="SAM Splint (36 in)",
            category="Immobilization",
            quantity=max(1, 1 if p <= 2 else 2),
            essential=True,
            notes="Malleable aluminum foam splint for immobilizing fractures and sprains.",
        ),
        KitItemModel(
            name="Hydrocolloid Blister Pads / Moleskin",
            category="Blister & Foot Care",
            quantity=max(8, p * d * 2),
            essential=True,
            notes="Friction protection and sterile hydrocolloid healing for hot spots and blisters.",
        ),
        KitItemModel(
            name="Ibuprofen (200mg)",
            category="Medications",
            quantity=max(16, p * d * 3),
            essential=True,
            notes="NSAID analgesic for musculoskeletal pain, sprains, and inflammatory reduction.",
        ),
        KitItemModel(
            name="Acetaminophen (500mg)",
            category="Medications",
            quantity=max(10, p * d * 2),
            essential=True,
            notes="Non-NSAID pain reliever and fever reducer.",
        ),
        KitItemModel(
            name="Antihistamine (Diphenhydramine 25mg)",
            category="Medications",
            quantity=max(6, p * 2 + d),
            essential=True,
            notes="Antihistamine for allergic reactions, hives, stings, and mild sedation.",
        ),
        KitItemModel(
            name="Oral Rehydration Salts (ORS packets)",
            category="Medications",
            quantity=max(4, p * d),
            essential=True,
            notes="WHO formula electrolyte packets for heat exhaustion, dehydration, and illness.",
        ),
        KitItemModel(
            name="Antiseptic Povidone-Iodine / BZK Wipes",
            category="Wound Care",
            quantity=max(10, p * d * 2),
            essential=True,
            notes="Topical antiseptic wipes for perimeter wound cleansing.",
        ),
        KitItemModel(
            name="Medical Adhesive Tape (1 in x 10 yd roll)",
            category="Wound Care",
            quantity=max(1, (p + d) // 4),
            essential=True,
            notes="Durable cloth adhesive tape for securing splints and bandages.",
        ),
        KitItemModel(
            name="Elastic Bandage / ACE Wrap (3 in)",
            category="Immobilization",
            quantity=max(1, p // 2),
            essential=True,
            notes="Compression wrap for joint sprains and holding splints firmly in place.",
        ),
        KitItemModel(
            name="Nitrile Examination Gloves (pairs)",
            category="Instruments & Tools",
            quantity=max(2, p * 2),
            essential=True,
            notes="Latex-free medical gloves for biohazard isolation and sterile procedures.",
        ),
        KitItemModel(
            name="Trauma Shears (7.25 in)",
            category="Instruments & Tools",
            quantity=1,
            essential=True,
            notes="Blunt-tip heavy duty scissors for cutting heavy fabric, webbing, and tape.",
        ),
        KitItemModel(
            name="Precision Tweezers / Tick Tool",
            category="Instruments & Tools",
            quantity=1,
            essential=True,
            notes="Fine-tip stainless tweezers for splinter extraction and tick removal.",
        ),
        KitItemModel(
            name="Wound Irrigation Syringe (10cc)",
            category="Instruments & Tools",
            quantity=1,
            essential=True,
            notes="Pressurized wound flusher for clearing debris before dressing.",
        ),
        KitItemModel(
            name="CPR Pocket Mask / Face Shield",
            category="Instruments & Tools",
            quantity=1,
            essential=True,
            notes="One-way valve protective barrier for rescue breathing.",
        ),
        KitItemModel(
            name="Emergency Mylar Space Blanket",
            category="Emergency Protection",
            quantity=p,
            essential=True,
            notes="Reflective thermal blanket to prevent hypothermia and provide weather shelter.",
        ),
        KitItemModel(
            name="Triangular Bandage (Cravat)",
            category="Immobilization",
            quantity=max(2, p),
            essential=True,
            notes="Versatile cloth for arm slings, splint ties, and head wound dressings.",
        ),
    ]

    total = sum(it.quantity for it in items)
    return KitCalcResponse(
        party_size=p,
        trip_days=d,
        total_items=total,
        items=items,
    )


def get_evacuation_safety_protocol() -> dict[str, Any]:
    """Returns official backcountry Search & Rescue (SAR), Satellite SOS, and helicopter LZ protocols."""
    return {
        "satellite_sos": {
            "trigger_criteria": [
                "Life-threatening traumatic injury or acute illness (e.g. anaphylaxis, severe chest pain, HAPE/HACE).",
                "Altered mental status, delirium, or persistent loss of consciousness.",
                "Suspected spinal trauma, skull fracture, or unmanageable open fracture.",
                "Non-ambulatory casualty with no feasible route for assisted group walkout.",
                "Severe hypothermia or heat stroke with cessation of vital regulatory functions.",
            ],
            "transmission_protocol": [
                "1. Power on 2-way satellite communicator (Garmin inReach, Apple Satellite SOS, ACR Bivy Stick).",
                "2. Confirm clear line of sight to open sky (move out of dense forest canopies or slot canyons).",
                "3. Transmit critical distress packet: Exact GPS coordinates, patient age/sex, nature of injury, vitals (conscious/breathing), ambulatory status (able to walk Y/N), and current terrain/weather.",
                "4. Keep device powered ON and stationary at designated position until Search & Rescue confirms dispatch.",
                "5. Maintain continuous communication with SAR coordination center.",
            ],
            "supported_devices": [
                "Garmin inReach (Mini 2, Explorer+, Messenger)",
                "Apple Emergency SOS via Satellite (iPhone 14+)",
                "ACR Bivy Stick 2-Way Communicator",
                "ZOLEO Satellite Communicator",
            ],
        },
        "helicopter_lz": {
            "site_selection": [
                "Minimum dimensions: 100 x 100 feet flat, level clear zone (ideally 150 x 150 feet in high-altitude alpine terrain).",
                "Ground slope: Less than 8 degrees maximum gradient.",
                "Obstacle clearance: Completely free of overhead hazards (wires, tree snags, powerlines, antenna towers, cliff faces).",
                "Approach & departure paths: Clear, unobstructed path into the prevailing wind.",
            ],
            "ground_preparation": [
                "Secure or pack away all loose gear, tarps, sleeping bags, pack covers, and tents (rotor wash produces hurricane-force 100+ mph winds).",
                "Wet down loose sand, powdery snow, or ash if feasible to reduce whiteout / brownout hazards for pilots.",
                "Designate a wind direction indicator (low-hung orange flag, bright bandana, or weighted smoke).",
            ],
            "signaling_and_approach": [
                "Signal incoming rescue aircraft using reflective signal mirror, high-visibility orange bivy panel, or strobe beacon.",
                "Stand with back to prevailing wind with arms extended upward in a 'Y' shape to confirm landing site and wind direction.",
                "NEVER approach the helicopter until explicitly instructed and signaled by pilot or flight paramedic with a thumbs-up.",
                "Always approach and depart from the DOWNSLOPE side in full view of the pilot (between 10 o'clock and 2 o'clock).",
                "NEVER walk behind or near the tail rotor under any circumstances.",
            ],
        },
        "ground_evacuation": {
            "assisted_walkout_criteria": [
                "Casualty is alert, cooperative, and oriented x 4.",
                "Able to bear weight and maintain balance with trekking poles or partner support.",
                "Stable vital signs and favorable terrain/weather conditions with ample daylight.",
            ],
            "litter_carry_guidelines": [
                "Requires a minimum of 6 to 8 rescuers for continuous carry over rough backcountry trail.",
                "Rotate carrying positions every 15 to 20 minutes to prevent team fatigue and dropped litter.",
                "Continuously monitor patient for hypothermia, orthostatic hypotension, and splint shifting.",
            ],
        },
    }


def detect_first_aid_intent(query: str) -> Optional[FirstAidIntent]:
    """Detects whether a user prompt relates to backcountry medical triage, first aid supplies, or SAR."""
    q_lower = query.lower()

    # Disregard wildlife, avalanche, and beacon queries handled by general safety module
    if any(kw in q_lower for kw in ["bear", "cougar", "predator", "wildlife", "avalanche", "beacon check-in", "sbr-"]):
        return None

    # Defer generic emergency protocol queries (without first aid context) to safety module
    if "emergency protocol" in q_lower and not any(kw in q_lower for kw in ["first aid", "medical", "triage", "kit"]):
        return None

    # Keywords for first aid domain
    fa_keywords = [
        "first aid", "medical", "triage", "symptom", "injur", "hurt", "fell",
        "bleeding", "broken", "fracture", "sprain", "shivering", "hypotherm",
        "heat stroke", "heat exhaustion", "hypertherm", "altitude", "ams",
        "hape", "hace", "allergic", "anaphylax", "epipen", "epinephrine",
        "bee sting", "snake bite", "unconscious", "cannot walk", "can't walk",
        "kit", "splint", "gauze", "moleskin", "blister", "sar", "search and rescue",
        "helicopter", "evac", "landing zone", "lz", "satellite sos",
    ]

    if not any(kw in q_lower for kw in fa_keywords):
        return None

    # Parse party size
    party_size = None
    p_match = (
        re.search(r"(?:party|group)\s*(?:of)?\s*(\d+)", q_lower)
        or re.search(r"(\d+)\s*(?:people|persons|hikers|backpackers|members)", q_lower)
        or re.search(r"for\s*(\d+)\s*(?:people|persons|hikers)?", q_lower)
    )
    if p_match:
        try:
            party_size = int(p_match.group(1))
        except (ValueError, IndexError):
            pass

    # Parse trip days
    trip_days = None
    d_match = re.search(r"(\d+)\s*(?:-|\s*)day", q_lower)
    if d_match:
        try:
            trip_days = int(d_match.group(1))
        except (ValueError, IndexError):
            pass

    # Parse condition ID
    condition_id = None
    if "hypotherm" in q_lower or "shiver" in q_lower or "cold exposure" in q_lower:
        condition_id = "hypothermia"
    elif "heat" in q_lower or "hypertherm" in q_lower or "sun stroke" in q_lower:
        condition_id = "heat-stroke"
    elif "altitude" in q_lower or "mountain sickness" in q_lower or "ams" in q_lower or "hape" in q_lower or "hace" in q_lower:
        condition_id = "altitude-sickness"
    elif "fracture" in q_lower or "broken" in q_lower or "bone" in q_lower or "sprain" in q_lower or "dislocat" in q_lower:
        condition_id = "musculoskeletal-fractures"
    elif "anaphylax" in q_lower or "allergic" in q_lower or "epipen" in q_lower or "epinephrine" in q_lower or "bee sting" in q_lower:
        condition_id = "anaphylaxis"

    # Parse category
    category = None
    if "environmental" in q_lower:
        category = "environmental"
    elif "trauma" in q_lower:
        category = "trauma"
    elif "medical" in q_lower:
        category = "medical"

    # Determine action
    if any(k in q_lower for k in ["kit", "supplies", "calculator", "packing list", "pack list", "how many gauze"]):
        action = "kit_calc"
    elif any(k in q_lower for k in ["sar", "search and rescue", "helicopter", "landing zone", "lz", "satellite sos", "sos"]):
        action = "sar_evac"
    elif any(k in q_lower for k in ["protocol", "wilderness medicine guidelines", "emergency protocol"]):
        action = "protocol"
    elif any(k in q_lower for k in ["triage", "symptom", "injur", "hurt", "fell", "bleeding", "broken", "shivering", "fumbling", "cannot walk", "can't walk", "unconscious"]):
        action = "triage"
    else:
        action = "conditions"

    return FirstAidIntent(
        action=action,
        condition_id=condition_id,
        category=category,
        party_size=party_size,
        trip_days=trip_days,
    )


def build_first_aid_prompt(intent: FirstAidIntent) -> str:
    """Formats system prompt grounding for wilderness medical triage, supply kits, and evacuation protocols."""
    lines = [
        "Contoso Outdoors Backcountry Wilderness First Aid & Medical Protocol Grounding:",
        "- Patient safety, scene safety, and rapid triage assessment are top priorities in all wilderness medical situations.",
        "- Follow Wilderness Medical ABCDE protocol: Airway, Breathing, Circulation, Disability (spine / neurological), Exposure / Environmental insulation.",
        "- Always insulate casualties from cold ground using foam pads, bivy sacks, or sleeping bags; conduction to frozen ground accelerates hypothermia.",
        "- Non-ambulatory casualties (cannot walk) or patients with altered mental status, airway compromise, severe hypothermia, heat stroke, or compound fractures require immediate Search & Rescue (SAR) evacuation.",
        "- Helicopter Landing Zones (LZ) require a 100x100 ft clear, flat site (slope < 8 deg), free of overhead snags, with all loose gear securely packed against 100+ mph rotor wash.",
    ]

    if intent.condition_id:
        cond = get_medical_condition_by_id(intent.condition_id)
        if cond:
            lines.extend([
                f"Target Condition Knowledge: {cond.title} ({cond.category.title()} - {cond.severity} Severity):",
                f"- Symptoms: {', '.join(cond.symptoms)}",
                f"- Field Treatments: {'; '.join(cond.field_treatments)}",
                f"- Evacuation Urgency: {cond.evacuation_urgency}",
                f"- Red Flag Signs: {', '.join(cond.red_flag_signs)}",
            ])
    else:
        conds = get_medical_conditions(category=intent.category)
        lines.append("Backcountry Medical Conditions Reference:")
        for c in conds:
            lines.append(
                f"- {c.title} ({c.condition_id}): Severity={c.severity}, Urgency={c.evacuation_urgency}, "
                f"Key Symptoms={', '.join(c.symptoms[:4])}"
            )

    if intent.action == "triage":
        lines.extend([
            "Wilderness Triage Assessment Directives:",
            "- Assess whether casualty is conscious and ambulatory (able to walk).",
            "- If unable to walk, immediately advise shelter, immobilization, and SAR signaling.",
            "- If suspected anaphylaxis, instruct immediate administration of Epinephrine auto-injector into outer thigh.",
        ])

    if intent.action == "kit_calc":
        p = intent.party_size or 2
        d = intent.trip_days or 3
        kit = calculate_first_aid_kit(KitCalcRequest(party_size=p, trip_days=d))
        lines.extend([
            f"Calculated First Aid Kit Supplies for {kit.party_size} people, {kit.trip_days} days ({kit.total_items} total items):",
            f"- Gauze & Wound Care: {', '.join(f'{it.name} (x{it.quantity})' for it in kit.items if it.category == 'Wound Care')}",
            f"- Immobilization & Splinting: {', '.join(f'{it.name} (x{it.quantity})' for it in kit.items if it.category == 'Immobilization')}",
            f"- Blister & Foot Care: {', '.join(f'{it.name} (x{it.quantity})' for it in kit.items if it.category == 'Blister & Foot Care')}",
            f"- Medications: {', '.join(f'{it.name} (x{it.quantity})' for it in kit.items if it.category == 'Medications')}",
        ])

    if intent.action in ("sar_evac", "protocol"):
        lines.extend([
            "Search & Rescue (SAR) & Evacuation Protocols:",
            "- 2-Way Satellite SOS: Transmit coordinates, casualty status, ambulatory state, and weather.",
            "- Helicopter LZ: 100x100 ft minimum, <8 deg slope, approach from downslope front only, avoid tail rotor.",
            "- Ground Evacuation: Assisted walkout only if alert and weight-bearing; litter carry requires 6-8 rescuers.",
        ])

    lines.extend([
        "",
        "Instructions for Assistant:",
        "- Prioritize casualty safety, rapid stabilization, and clear step-by-step instructions.",
        "- Emphasize that medical advice here supports wilderness stabilization and does not replace emergency hospital care.",
        "- In emergencies, explicitly urge customers to activate 2-way satellite SOS communicator (Garmin inReach / Apple Satellite SOS).",
    ])

    return "\n".join(lines)


def format_first_aid_response(intent: FirstAidIntent) -> dict[str, Any]:
    """Formats the assistant answer and structured first_aid_info payload."""
    if intent.action == "triage":
        # Build triage request from intent
        condition = get_medical_condition_by_id(intent.condition_id or "hypothermia")
        symptoms = list(condition.symptoms[:3]) if condition else ["uncontrollable shivering", "fumbling hands"]
        triage_res = assess_wilderness_triage(
            TriageRequest(
                symptoms=symptoms,
                injury_type=intent.condition_id,
                is_conscious=True,
                can_walk=False if intent.condition_id in ("musculoskeletal-fractures", "hypothermia") else True,
            )
        )
        sar_note = " Search & Rescue (SAR) evacuation is recommended." if triage_res.sar_recommended else ""
        answer = (
            f"Wilderness Medical Triage Assessment: Condition Match: {triage_res.condition_match} ({triage_res.severity} Severity). "
            f"Immediate Action: {triage_res.immediate_action} "
            f"Field Treatment: {'; '.join(triage_res.treatment_steps)}. "
            f"Evacuation Urgency: {triage_res.evacuation_urgency}.{sar_note}"
        )
        return {
            "answer": answer,
            "first_aid_info": {
                "action": "triage",
                "triage": triage_res.model_dump(),
            },
        }

    if intent.action == "kit_calc":
        p = intent.party_size or 2
        d = intent.trip_days or 3
        kit = calculate_first_aid_kit(KitCalcRequest(party_size=p, trip_days=d))
        key_items = ", ".join(f"{it.name} (x{it.quantity})" for it in kit.items[:5])
        answer = (
            f"Backcountry First Aid Kit Recommendation for a party of {kit.party_size} on a {kit.trip_days}-day trip: "
            f"Total {kit.total_items} items across wound care, immobilization, blister management, and medications. "
            f"Key supplies include: {key_items}."
        )
        return {
            "answer": answer,
            "first_aid_info": {
                "action": "kit_calc",
                "kit": kit.model_dump(),
            },
        }

    if intent.action in ("sar_evac", "protocol"):
        proto = get_evacuation_safety_protocol()
        answer = (
            "Backcountry Search & Rescue (SAR) & Evacuation Protocols: "
            "1. Activate 2-Way Satellite SOS (Garmin inReach, Apple Satellite SOS) for life-threatening conditions or non-ambulatory casualties. "
            "2. Helicopter Landing Zone (LZ): Select a flat 100x100 ft clear area (<8 degree slope) free of overhead hazards. "
            "3. Secure all loose gear against 100+ mph rotor wash and signal incoming aircraft with mirror, bright orange panel, or 'Y' body stance. "
            "4. Never approach helicopter until given explicit thumbs-up by flight crew, and always approach from downslope front."
        )
        return {
            "answer": answer,
            "first_aid_info": {
                "action": intent.action,
                "protocol": proto,
            },
        }

    # Default "conditions"
    if intent.condition_id:
        cond = get_medical_condition_by_id(intent.condition_id)
        if cond:
            answer = (
                f"{cond.title} ({cond.category.title()}, {cond.severity} Severity): "
                f"Symptoms include {', '.join(cond.symptoms)}. "
                f"Field Treatment: {'; '.join(cond.field_treatments)}. "
                f"Evacuation Urgency: {cond.evacuation_urgency}. "
                f"Red Flag Signs: {', '.join(cond.red_flag_signs)}."
            )
            return {
                "answer": answer,
                "first_aid_info": {
                    "action": "conditions",
                    "condition": cond.model_dump(),
                },
            }

    conds = get_medical_conditions(category=intent.category)
    details = "; ".join(f"{c.title} ({c.severity} Severity)" for c in conds)
    answer = f"Backcountry Medical Conditions Catalog: {details}."
    return {
        "answer": answer,
        "first_aid_info": {
            "action": "conditions",
            "conditions": [c.model_dump() for c in conds],
        },
    }
