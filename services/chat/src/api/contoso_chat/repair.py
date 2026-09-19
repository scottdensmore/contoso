import re
from typing import Any, Optional

from pydantic import BaseModel


class RepairServiceItem(BaseModel):
    service_id: str
    name: str
    category: str
    price: float
    turnaround_days: int
    description: str
    common_issues: list[str]


class RepairDiagnosis(BaseModel):
    issue_description: str
    diagnosed_service: Optional[RepairServiceItem] = None
    estimated_cost: float
    turnaround_days: int
    is_covered_by_warranty: bool
    recommendation: str
    self_care_tip: Optional[str] = None


class RepairIntent(BaseModel):
    action: str  # "services", "diagnose", "warranty", "care_tips"
    gear_type: Optional[str] = None
    issue: Optional[str] = None


class RepairDiagnoseRequest(BaseModel):
    issue: str
    gear_type: Optional[str] = None


REPAIR_SERVICES: list[RepairServiceItem] = [
    # Tents
    RepairServiceItem(
        service_id="tent-seam-sealing",
        name="Tent Seam Sealing",
        category="tents",
        price=35.0,
        turnaround_days=4,
        description="Precision seam sealing and polyurethane waterproof recoating to stop water leaks through tent seams and rainfly stitch lines.",
        common_issues=[
            "seam leak",
            "leaking seams",
            "water leaking through tent seams",
            "water leaking through seams",
            "dripping seams",
            "seam tape peeling",
            "seam sealing",
        ],
    ),
    RepairServiceItem(
        service_id="tent-zipper-slider",
        name="Tent Zipper Slider Replacement",
        category="tents",
        price=25.0,
        turnaround_days=3,
        description="Replacement of worn or split zipper sliders, tooth realignment, and end-stop reinforcement for tent doors and vestibules.",
        common_issues=[
            "broken zipper",
            "broken zipper on tent",
            "stuck zipper",
            "zipper split",
            "zipper separated",
            "tent door zipper",
            "zipper slider",
            "zipper off track",
        ],
    ),
    RepairServiceItem(
        service_id="tent-fabric-patch",
        name="Tent Fabric Patching",
        category="tents",
        price=30.0,
        turnaround_days=4,
        description="Waterproof bonded ripstop adhesive patching and structural reinforcement for tears, cuts, or punctures in tent canopy, floor, or rainfly.",
        common_issues=[
            "rip in tent",
            "rip in tent rainfly fabric",
            "torn fabric",
            "torn tent",
            "hole in rainfly",
            "punctured tent floor",
            "mesh tear",
            "fabric patching",
        ],
    ),
    RepairServiceItem(
        service_id="tent-pole-restringing",
        name="Tent Pole Shock-Cord Re-stringing",
        category="tents",
        price=20.0,
        turnaround_days=2,
        description="Replacement of slack, frayed, or snapped elastic shock cords within aluminum and fiberglass tent pole sections.",
        common_issues=[
            "broken shock cord",
            "broken shock cord on tent pole",
            "loose pole cord",
            "stretched cord",
            "snapped shock cord",
            "tent pole restring",
            "pole re-stringing",
        ],
    ),
    # Apparel
    RepairServiceItem(
        service_id="apparel-dwr-reproofing",
        name="DWR Technical Reproofing",
        category="apparel",
        price=30.0,
        turnaround_days=3,
        description="Technical wash-in waterproofing and heat-activated fluorochemical-free DWR reproofing to stop rain jackets from wetting out.",
        common_issues=[
            "wetting out",
            "jacket is wetting out",
            "rain jacket is wetting out",
            "dwr waterproofing",
            "dwr reproofing",
            "reproof the dwr",
            "lost water repellency",
            "water soaking into jacket",
        ],
    ),
    RepairServiceItem(
        service_id="apparel-down-baffle",
        name="Down Baffle Repair",
        category="apparel",
        price=40.0,
        turnaround_days=5,
        description="Precision stitch reconstruction of ruptured internal down baffles, including feather fill replenishment and loft restoration.",
        common_issues=[
            "down baffle repair",
            "down jacket leaking feathers",
            "leaking feathers from baffle",
            "torn down jacket",
            "feathers leaking",
            "ruptured baffle",
            "loss of down loft",
        ],
    ),
    RepairServiceItem(
        service_id="apparel-jacket-zipper",
        name="Jacket Zipper Fix",
        category="apparel",
        price=35.0,
        turnaround_days=4,
        description="Complete zipper replacement or slider fix for waterproof shell, insulated, and fleece jackets.",
        common_issues=[
            "broken jacket zipper",
            "jacket zipper is stuck",
            "jacket zipper fix",
            "teeth separated",
            "jacket zipper teeth missing",
            "coat zipper broken",
        ],
    ),
    # Packs
    RepairServiceItem(
        service_id="pack-zipper-repair",
        name="Heavy-Duty Pack Zipper Repair",
        category="packs",
        price=25.0,
        turnaround_days=4,
        description="Heavy-duty #10 YKK coil zipper track restitching and dual-slider replacement for backpacks and duffels.",
        common_issues=[
            "broken heavy-duty zipper on backpack",
            "broken backpack zipper",
            "pack zipper split",
            "heavy-duty zipper repair",
            "rucksack zipper stuck",
        ],
    ),
    RepairServiceItem(
        service_id="pack-buckle-replacement",
        name="Pack Buckle Replacement",
        category="packs",
        price=15.0,
        turnaround_days=2,
        description="Replacement and webbing installation of side-squeeze hipbelt, sternum, and load-lifter buckles.",
        common_issues=[
            "cracked hipbelt buckle replacement",
            "cracked hipbelt buckle",
            "broken buckle",
            "buckle replacement",
            "snapped sternum clip",
            "broken pack buckle",
        ],
    ),
    RepairServiceItem(
        service_id="pack-frame-repair",
        name="Pack Frame Repair",
        category="packs",
        price=30.0,
        turnaround_days=3,
        description="Straightening, realignment, or replacement of internal aluminum stays, composite framesheets, and lumbar supports.",
        common_issues=[
            "bent aluminum frame stay on backpack",
            "bent frame",
            "broken stay",
            "frame repair",
            "pack frame broken",
            "cracked framesheet",
        ],
    ),
    # Winter
    RepairServiceItem(
        service_id="winter-edge-wax",
        name="Ski & Snowboard Edge & Wax",
        category="winter",
        price=45.0,
        turnaround_days=2,
        description="Precision ceramic edge sharpening, side/base beveling, deburring, and high-performance temperature-tuned hot wax treatment.",
        common_issues=[
            "sharpen and wax my snowboard",
            "sharpen and wax",
            "edge & wax",
            "ski edge tune",
            "snowboard wax",
            "ski waxing",
            "dull edges",
        ],
    ),
    RepairServiceItem(
        service_id="winter-ptex-weld",
        name="P-Tex Base Weld",
        category="winter",
        price=50.0,
        turnaround_days=4,
        description="High-density molten P-Tex base welding to fill deep scratches, rock gouges, and core shots on skis and snowboards.",
        common_issues=[
            "deep rock gouge core shot p-tex base weld",
            "p-tex base weld",
            "p-tex",
            "ptex",
            "core shot",
            "rock gouge",
            "deep gouge in ski base",
        ],
    ),
]

CATEGORY_ALIASES: dict[str, str] = {
    "tents": "tents",
    "tent": "tents",
    "shelter": "tents",
    "shelters": "tents",
    "canopy": "tents",
    "apparel": "apparel",
    "clothing": "apparel",
    "jacket": "apparel",
    "jackets": "apparel",
    "coat": "apparel",
    "outerwear": "apparel",
    "rainwear": "apparel",
    "packs": "packs",
    "pack": "packs",
    "backpack": "packs",
    "backpacks": "packs",
    "bag": "packs",
    "bags": "packs",
    "rucksack": "packs",
    "winter": "winter",
    "ski": "winter",
    "skis": "winter",
    "snowboard": "winter",
    "snowboards": "winter",
    "snowboarding": "winter",
    "snow": "winter",
}

REPAIR_RECOMMENDATIONS: dict[str, str] = {
    "tent-seam-sealing": "Bring your tent to any Contoso Outdoors store for professional seam sealing ($35.00, 4-day turnaround). Our technicians clean old flaking sealant and apply industrial-grade polyurethane seam sealer for watertight performance.",
    "tent-zipper-slider": "Bring your tent to any Contoso Outdoors store for zipper slider replacement ($25.00, 3-day turnaround). Our technicians replace the worn slider and align zipper tracks to prevent splitting.",
    "tent-fabric-patch": "We recommend our Tent Fabric Patching service ($30.00, 4-day turnaround). Technicians apply bonded waterproof ripstop patches to both sides of the tear to ensure structural durability.",
    "tent-pole-restringing": "Our technicians can restring your tent poles ($20.00, 2-day turnaround) with durable shock cord, restoring proper tension and easy assembly.",
    "apparel-dwr-reproofing": "We recommend our DWR Technical Reproofing service ($30.00, 3-day turnaround). We deep clean technical membranes with specialized wash-in reproofers and apply controlled heat curing to eliminate wetting out and restore breathability.",
    "apparel-down-baffle": "Bring your jacket in for our Down Baffle Repair service ($40.00, 5-day turnaround). Our specialists restitch internal baffles, eliminate cold spots, and replenish lost down clusters.",
    "apparel-jacket-zipper": "We recommend our Jacket Zipper Fix service ($35.00, 4-day turnaround) for slider replacement or full waterproof zipper reconstruction.",
    "pack-zipper-repair": "Our Heavy-Duty Pack Zipper Repair service ($25.00, 4-day turnaround) fixes heavy-duty coil zippers, installs reinforced sliders, and restitches stressed seams.",
    "pack-buckle-replacement": "We offer Pack Buckle Replacement ($15.00, 2-day turnaround) to replace cracked hipbelt, sternum, or compression buckles with heavy-duty ITW Nexus hardware.",
    "pack-frame-repair": "Bring your backpack in for Pack Frame Repair ($30.00, 3-day turnaround). Our technicians straighten bent aluminum stays or replace broken suspension framesheets.",
    "winter-edge-wax": "Our Ski & Snowboard Edge & Wax service costs $45.00 with a 2-day turnaround. It includes ceramic edge sharpening, beveling, deburring, and high-performance temperature-specific hot waxing.",
    "winter-ptex-weld": "We recommend our P-Tex Base Weld service ($50.00, 4-day turnaround) to fill deep gouges, bond core shots, and restore a smooth glide surface.",
}

REPAIR_CARE_TIPS: dict[str, str] = {
    "tent-seam-sealing": "Allow tent seams to cure completely dry before packing away. Never store a damp tent in a compression sack.",
    "tent-zipper-slider": "Keep zipper coils free of dirt and grit using a soft toothbrush, and lubricate tracks periodically with silicone zipper wax.",
    "tent-fabric-patch": "For quick backcountry field repairs, apply Tenacious Tape over the puncture on both sides immediately.",
    "tent-pole-restringing": "Avoid letting pole sections snap violently together during setup; guide them together to prevent hairline fractures.",
    "apparel-dwr-reproofing": "Wash your technical rain jacket with specialized tech wash (never conventional detergent) and tumble dry on low heat for 20 minutes to reactivate the factory DWR.",
    "apparel-down-baffle": "Never pull feathers that poke through fabric; pinch them from the back and pull them back inside to avoid enlarging the needle hole.",
    "apparel-jacket-zipper": "Fasten zippers fully before laundering jackets to avoid snagging teeth on mesh or other fabrics.",
    "pack-zipper-repair": "Avoid overfilling pack compartments beyond zipper capacity; excess tension damages coil teeth over time.",
    "pack-buckle-replacement": "Carry a spare universal side-squeeze repair buckle in your first-aid or repair kit on backcountry trips.",
    "pack-frame-repair": "Load heaviest equipment close to your spine and centered in the pack body to maintain balanced frame stress.",
    "winter-edge-wax": "Always wipe metal edges dry with a cloth after a day on the slopes to avoid rust formation during storage.",
    "winter-ptex-weld": "Inspect ski and board bases after each outing; repair core shots promptly to keep moisture from reaching the wood core.",
}


def get_repair_services(category: Optional[str] = None) -> list[RepairServiceItem]:
    """Returns repair service catalog items, optionally filtered by category or alias."""
    if not category or not isinstance(category, str) or not category.strip():
        return [svc.model_copy() for svc in REPAIR_SERVICES]

    cat_clean = category.strip().lower()
    canonical = CATEGORY_ALIASES.get(cat_clean, cat_clean)
    return [
        svc.model_copy()
        for svc in REPAIR_SERVICES
        if svc.category.lower() == canonical or svc.category.lower() == cat_clean
    ]


def diagnose_repair_issue(issue: str, gear_type: Optional[str] = None) -> RepairDiagnosis:
    """Diagnoses a reported gear repair issue and returns service recommendation, cost estimate, and care tip."""
    clean_issue = (issue or "").strip()
    issue_lower = clean_issue.lower()

    # Determine canonical category
    canonical_cat: Optional[str] = None
    if gear_type and isinstance(gear_type, str) and gear_type.strip():
        canonical_cat = CATEGORY_ALIASES.get(gear_type.strip().lower())

    if not canonical_cat:
        if re.search(r"\b(?:tents?|shelter|canopy|rainfly)\b", issue_lower):
            canonical_cat = "tents"
        elif re.search(r"\b(?:jackets?|apparel|clothing|rainwear|coat|down\s+jacket|rain\s+jacket|shell)\b", issue_lower):
            canonical_cat = "apparel"
        elif re.search(r"\b(?:packs?|backpacks?|bags?|rucksack)\b", issue_lower):
            canonical_cat = "packs"
        elif re.search(r"\b(?:skis?|snowboards?|winter|snow)\b", issue_lower):
            canonical_cat = "winter"

    # Match best service
    best_service: Optional[RepairServiceItem] = None
    best_score = 0

    for svc in REPAIR_SERVICES:
        score = 0
        cat_match = (canonical_cat is not None and svc.category == canonical_cat)
        if cat_match:
            score += 20

        # Check exact phrase matches in common issues
        for ci in svc.common_issues:
            if ci in issue_lower:
                score += 50 + len(ci)
            elif any(word in issue_lower for word in ci.split() if len(word) > 3):
                score += 10

        # Check service name overlap
        for word in svc.name.lower().split():
            if len(word) > 3 and word in issue_lower:
                score += 15

        if score > best_score:
            best_score = score
            best_service = svc

    # Check warranty coverage
    is_warranty = bool(
        re.search(
            r"\b(?:manufacturing\s+defect|defect\s+in\s+materials?|factory\s+flaw|delaminat(?:ion|ing))\b",
            issue_lower,
            re.IGNORECASE,
        )
    )

    if best_service and best_score >= 25:
        cost = 0.0 if is_warranty else best_service.price
        days = best_service.turnaround_days
        rec = REPAIR_RECOMMENDATIONS.get(
            best_service.service_id,
            f"We recommend our {best_service.name} service (${best_service.price:.2f}, {best_service.turnaround_days} business days turnaround).",
        )
        if is_warranty:
            rec = (
                f"This issue appears to be covered by Contoso's 1-Year Limited Craftsmanship Warranty! "
                f"{rec} Bring your proof of purchase for complimentary service."
            )
        tip = REPAIR_CARE_TIPS.get(best_service.service_id)
        return RepairDiagnosis(
            issue_description=clean_issue,
            diagnosed_service=best_service.model_copy(),
            estimated_cost=cost,
            turnaround_days=days,
            is_covered_by_warranty=is_warranty,
            recommendation=rec,
            self_care_tip=tip,
        )

    # Fallback for unrecognized issue
    return RepairDiagnosis(
        issue_description=clean_issue,
        diagnosed_service=None,
        estimated_cost=0.0,
        turnaround_days=0,
        is_covered_by_warranty=is_warranty,
        recommendation="Please bring your gear into any Contoso Outdoors store for an in-person assessment by our repair experts. Our technicians will inspect the damage and provide an exact estimate.",
        self_care_tip="Store all outdoor gear clean and completely dry in a cool, dark environment to prevent mildew and material breakdown.",
    )


REPAIR_TRIGGERS: list[str] = [
    r"\brepairs?\b",
    r"\brepairing\b",
    r"\bfix(?:es|ed|ing)?\b",
    r"\bmend(?:s|ed|ing)?\b",
    r"\bbroken\b",
    r"\bdamaged?\b",
    r"\bzippers?\b",
    r"\bseams?\b",
    r"\bleaks?\b",
    r"\bleaking\b",
    r"\bwetting\s+out\b",
    r"\breproof(?:ing)?\b",
    r"\bdwr\b",
    r"\bsharpen(?:ing)?\b",
    r"\bwax(?:ing)?\b",
    r"\bedge\s+tune\b",
    r"\bp-?tex\b",
    r"\bbase\s+weld\b",
    r"\bshock\s*cord\b",
    r"\bbaffles?\b",
    r"\bbuckles?\b",
    r"\btune-?ups?\b",
    r"\bmaintenance\b",
    r"\bcare\s+tips?\b",
    r"\btear\b",
    r"\btorn\b",
    r"\brip(?:ped|s)?\b",
    r"\bpatch(?:ing)?\b",
    r"\brestring(?:ing)?\b",
]


def detect_repair_intent(query: str) -> Optional[RepairIntent]:
    """Detects gear repair and maintenance inquiries, categorizing action into services, diagnose, warranty, or care_tips."""
    if not query or not isinstance(query, str) or not query.strip():
        return None

    cleaned = query.strip()
    is_triggered = any(re.search(pat, cleaned, re.IGNORECASE) for pat in REPAIR_TRIGGERS)
    if not is_triggered:
        return None

    # Avoid false positives for general shopping or order queries
    if re.search(r"\b(?:return\s+policy|order\s+status|track\s+order|where\s+is\s+my\s+order|recommend\s+tents?)\b", cleaned, re.IGNORECASE):
        if not any(re.search(pat, cleaned, re.IGNORECASE) for pat in [r"\brepair\b", r"\bfix\b", r"\bbroken\b", r"\bzipper\b", r"\bwax\b"]):
            return None

    # Detect gear_type
    detected_gear_type: Optional[str] = None
    if re.search(r"\b(?:tents?|shelter|canopy|rainfly)\b", cleaned, re.IGNORECASE):
        detected_gear_type = "tents"
    elif re.search(r"\b(?:jackets?|apparel|clothing|rainwear|coat|down\s+jacket|rain\s+jacket|shell)\b", cleaned, re.IGNORECASE):
        detected_gear_type = "apparel"
    elif re.search(r"\b(?:packs?|backpacks?|bags?|rucksack)\b", cleaned, re.IGNORECASE):
        detected_gear_type = "packs"
    elif re.search(r"\b(?:skis?|snowboards?|winter|snow)\b", cleaned, re.IGNORECASE):
        detected_gear_type = "winter"

    # Detect action
    if re.search(r"\b(?:warrant(?:y|ies)|guarantee|covered\s+under)\b", cleaned, re.IGNORECASE):
        action = "warranty"
    elif re.search(r"\b(?:care\s+tips?|maintenance\s+tips?|how\s+to\s+care|how\s+(?:do\s+i|to)\s+(?:clean|wash|maintain))\b", cleaned, re.IGNORECASE):
        action = "care_tips"
    elif re.search(r"\b(?:what\s+(?:gear\s+)?repair\s+services?|repair\s+services?|repair\s+options?|repair\s+rates?|service\s+rates?|repair\s+catalog|tune-?up\s+pricing)\b", cleaned, re.IGNORECASE) and not re.search(r"\b(?:broken|stuck|leak|wetting|rip|tear|sharpen|wax\s+my|fix\s+my)\b", cleaned, re.IGNORECASE):
        action = "services"
    else:
        action = "diagnose"

    return RepairIntent(
        action=action,
        gear_type=detected_gear_type,
        issue=cleaned if action == "diagnose" else None,
    )


def build_repair_prompt(intent: RepairIntent) -> str:
    """Formats helpful system prompt context with repair service rates, turnaround times, warranty coverage, and care tips."""
    lines = [
        "Contoso Outdoors Official Gear Repair & Maintenance Guidance:",
        f"Detected Action: {intent.action}",
    ]
    if intent.gear_type:
        lines.append(f"Gear Category/Type: {intent.gear_type}")
    if intent.issue:
        lines.append(f"Reported Issue/Inquiry: {intent.issue}")

    lines.append("")
    lines.append("Repair & Maintenance Services Catalog:")
    for svc in REPAIR_SERVICES:
        issues_str = ", ".join(svc.common_issues[:3])
        lines.append(
            f"- {svc.name} (ID: {svc.service_id}, Category: {svc.category}): "
            f"${svc.price:.2f}, estimated {svc.turnaround_days} business days turnaround. "
            f"Description: {svc.description} (Common issues: {issues_str})."
        )

    lines.append("")
    lines.append("Warranty & Coverage Terms:")
    lines.append("- Contoso 1-Year Limited Craftsmanship Warranty covers manufacturing defects, seam delamination, and factory hardware failures at no charge.")
    lines.append("- Normal wear and tear, accidental punctures, zipper abrasion, and seasonal tune-ups (e.g. edge waxing) are performed at flat-rate repair prices.")
    lines.append("- All Contoso store locations accept repair drop-offs during normal business hours.")

    if intent.action == "diagnose" and intent.issue:
        diag = diagnose_repair_issue(intent.issue, intent.gear_type)
        lines.append("")
        lines.append("Diagnostic Assessment:")
        if diag.diagnosed_service:
            lines.append(f"- Diagnosed Service: {diag.diagnosed_service.name}")
            lines.append(f"- Estimated Cost: ${diag.estimated_cost:.2f}")
            lines.append(f"- Estimated Turnaround: {diag.turnaround_days} business days")
        lines.append(f"- Warranty Covered: {'Yes' if diag.is_covered_by_warranty else 'No'}")
        lines.append(f"- Recommendation: {diag.recommendation}")
        if diag.self_care_tip:
            lines.append(f"- Care Tip: {diag.self_care_tip}")

    lines.append("")
    lines.append("Instructions for Assistant:")
    lines.append("- Provide clear, structured, and empathetic responses addressing the customer's gear issue.")
    lines.append("- Always quote official service pricing and turnaround times.")
    lines.append("- Include actionable self-care or preventive maintenance tips where relevant.")
    lines.append("- Invite the customer to visit any Contoso store for drop-off and expert consultation.")

    return "\n".join(lines)


def format_repair_response(intent: RepairIntent) -> dict[str, Any]:
    """Formats answer text and structured repair metadata for API responses."""
    if intent.action == "diagnose":
        diag = diagnose_repair_issue(intent.issue or "", intent.gear_type)
        if diag.diagnosed_service:
            svc = diag.diagnosed_service
            tip_str = f" Pro care tip: {diag.self_care_tip}" if diag.self_care_tip else ""
            answer = (
                f"Based on your description, we recommend our {svc.name} service. "
                f"The estimated repair cost is ${diag.estimated_cost:.2f} with an estimated turnaround of "
                f"{diag.turnaround_days} business days. {diag.recommendation}{tip_str}"
            )
        else:
            answer = diag.recommendation

        return {
            "answer": answer,
            "repair_info": {
                "action": "diagnose",
                "diagnosis": diag.model_dump(),
                "gear_type": intent.gear_type,
                "issue": intent.issue,
            },
        }

    if intent.action == "services":
        services = get_repair_services(intent.gear_type)
        svc_summaries = [
            f"- {s.name} (${s.price:.2f}, {s.turnaround_days} days): {s.description}"
            for s in services
        ]
        cat_note = f" in {intent.gear_type}" if intent.gear_type else ""
        answer = (
            f"Contoso Outdoors offers comprehensive gear repair and tune-up services{cat_note}:\n"
            + "\n".join(svc_summaries)
            + "\n\nAll repairs are performed by certified gear technicians at our retail store shops."
        )
        return {
            "answer": answer,
            "repair_info": {
                "action": "services",
                "category": intent.gear_type,
                "services": [s.model_dump() for s in services],
            },
        }

    if intent.action == "warranty":
        answer = (
            "Contoso Outdoors Gear Repair Warranty Policy:\n"
            "- 1-Year Limited Craftsmanship Warranty: Covers manufacturing defects, delamination, and seam failure at no charge.\n"
            "- Non-Warranty Repairs: Normal wear-and-tear, broken zipper sliders, accidental punctures, and seasonal maintenance "
            "(such as ski/snowboard waxing) are serviced at affordable flat-rate prices.\n"
            "- Drop-Off: Bring your gear and original receipt to any Contoso store location for inspection."
        )
        return {
            "answer": answer,
            "repair_info": {
                "action": "warranty",
                "warranty": {
                    "craftsmanship_warranty_period": "1 year",
                    "covered": ["Manufacturing defects", "Seam tape delamination", "Factory stitch failure"],
                    "not_covered": ["Normal wear and tear", "Accidental punctures/tears", "Zipper jams from dirt/grit"],
                    "turnaround_average": "2-5 business days",
                },
            },
        }

    # action == "care_tips"
    tips = [
        "Clean technical waterproof shells with Nikwax Tech Wash and tumble dry on low heat for 20 minutes to reactivate DWR.",
        "Wipe ski and snowboard metal edges dry after every outing to prevent rust.",
        "Keep tent zipper coils clean from grit using an old soft toothbrush and lubricate with silicone zipper wax.",
        "Never compress damp tents or down sleeping bags; always air dry completely before long-term storage.",
    ]
    answer = (
        "Contoso Gear Maintenance & Care Tips:\n"
        + "\n".join(f"- {t}" for t in tips)
        + "\n\nProper maintenance extends the life of your equipment and keeps you safe outdoors!"
    )
    return {
        "answer": answer,
        "repair_info": {
            "action": "care_tips",
            "gear_type": intent.gear_type,
            "care_tips": tips,
        },
    }
