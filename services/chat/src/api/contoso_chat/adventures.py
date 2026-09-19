import re
from typing import Any, Optional

from pydantic import BaseModel


class AdventureTourInfo(BaseModel):
    tour_id: str
    title: str
    category: str
    location: str
    duration: str
    difficulty: str
    price_per_person: float
    gear_rental_fee: float
    max_group_size: int
    lead_guide_name: str
    prerequisites: str
    included_gear: list[str]


class AdventureGuideInfo(BaseModel):
    guide_id: str
    name: str
    title: str
    certifications: list[str]
    years_experience: int
    specialties: list[str]


class AdventureIntent(BaseModel):
    action: str  # "tours", "guides", "prerequisites", "recommend"
    category: Optional[str] = None
    difficulty: Optional[str] = None
    tour_id: Optional[str] = None


ADVENTURE_TOURS: list[AdventureTourInfo] = [
    AdventureTourInfo(
        tour_id="alpine-mountaineering",
        title="Alpine Mountaineering & Glacier Travel",
        category="Mountaineering",
        location="Mount Rainier",
        duration="3 Days",
        difficulty="Expert",
        price_per_person=650.0,
        gear_rental_fee=75.0,
        max_group_size=4,
        lead_guide_name="Sarah Jenkins",
        prerequisites="Previous crampon and glacier travel experience required, or completion of Glacier Skills 101.",
        included_gear=["Crampons", "Ice Axe", "Climbing Harness", "Ropes & Crevasse Rescue Hardware"],
    ),
    AdventureTourInfo(
        tour_id="outdoor-rock-climbing",
        title="Introduction to Outdoor Rock Climbing",
        category="Rock Climbing",
        location="Smith Rock",
        duration="1 Day",
        difficulty="Beginner",
        price_per_person=175.0,
        gear_rental_fee=35.0,
        max_group_size=6,
        lead_guide_name="Marcus Vance",
        prerequisites="No prior climbing experience required. Good physical fitness recommended.",
        included_gear=["Climbing Shoes", "Harness", "Helmet", "Belay Device"],
    ),
    AdventureTourInfo(
        tour_id="backcountry-whitewater",
        title="Backcountry Whitewater Rafting Expedition",
        category="Water Sports",
        location="Rogue River",
        duration="2 Days",
        difficulty="Intermediate",
        price_per_person=420.0,
        gear_rental_fee=50.0,
        max_group_size=8,
        lead_guide_name="David Chen",
        prerequisites="Basic swimming ability required. Class III/IV whitewater safety briefing provided.",
        included_gear=["Type V PFD", "Whitewater Helmet", "Paddle", "Dry Bag"],
    ),
    AdventureTourInfo(
        tour_id="wilderness-navigation",
        title="Wilderness Navigation & Compass Clinic",
        category="Safety & Survival",
        location="North Cascades",
        duration="1 Day",
        difficulty="Beginner",
        price_per_person=120.0,
        gear_rental_fee=20.0,
        max_group_size=10,
        lead_guide_name="Elena Rostova",
        prerequisites="No prerequisites. Suitable for all skill and fitness levels.",
        included_gear=["Orienteering Compass", "Topographic Maps", "Clinometer", "Field Notebook"],
    ),
    AdventureTourInfo(
        tour_id="avalanche-safety",
        title="Avalanche Safety & Rescue Basics",
        category="Safety & Survival",
        location="Snoqualmie Pass",
        duration="1 Day",
        difficulty="Intermediate",
        price_per_person=150.0,
        gear_rental_fee=40.0,
        max_group_size=8,
        lead_guide_name="Sarah Jenkins",
        prerequisites="Comfortable traveling on snowshoes or backcountry skis in winter terrain.",
        included_gear=["Avalanche Transceiver / Beacon", "Probe", "Snow Shovel"],
    ),
]

ADVENTURE_GUIDES: list[AdventureGuideInfo] = [
    AdventureGuideInfo(
        guide_id="sarah-jenkins",
        name="Sarah Jenkins",
        title="Lead Alpine Guide",
        certifications=[
            "AMGA Certified Alpine Guide",
            "Wilderness First Responder (WFR)",
            "AIARE Avalanche Instructor",
        ],
        years_experience=12,
        specialties=["High-Altitude Mountaineering", "Glacier Travel", "Avalanche Safety"],
    ),
    AdventureGuideInfo(
        guide_id="marcus-vance",
        name="Marcus Vance",
        title="Senior Rock Climbing Instructor",
        certifications=[
            "AMGA Rock Guide",
            "Single Pitch Instructor",
            "Wilderness First Responder (WFR)",
        ],
        years_experience=9,
        specialties=["Trad Climbing", "Multi-pitch Climbing", "Anchor Systems"],
    ),
    AdventureGuideInfo(
        guide_id="david-chen",
        name="David Chen",
        title="Whitewater Expeditions Director",
        certifications=[
            "ACA Whitewater Kayak Instructor",
            "Swiftwater Rescue Technician",
            "Wilderness First Responder (WFR)",
        ],
        years_experience=14,
        specialties=["Class IV/V River Rafting", "Swiftwater Rescue", "Canyon Expeditions"],
    ),
    AdventureGuideInfo(
        guide_id="elena-rostova",
        name="Elena Rostova",
        title="Backcountry Navigation & Survival Specialist",
        certifications=[
            "Wilderness First Responder (WFR)",
            "Leave No Trace Master Educator",
            "USFS Wilderness Ranger Alum",
        ],
        years_experience=8,
        specialties=["Off-trail Navigation", "Wilderness Survival", "Alpine Route Planning"],
    ),
]

CATEGORY_ALIASES: dict[str, str] = {
    "mountaineering": "Mountaineering",
    "alpine": "Mountaineering",
    "glacier": "Mountaineering",
    "rock climbing": "Rock Climbing",
    "climbing": "Rock Climbing",
    "rock": "Rock Climbing",
    "water sports": "Water Sports",
    "water": "Water Sports",
    "whitewater": "Water Sports",
    "rafting": "Water Sports",
    "kayaking": "Water Sports",
    "paddling": "Water Sports",
    "safety & survival": "Safety & Survival",
    "safety": "Safety & Survival",
    "survival": "Safety & Survival",
    "navigation": "Safety & Survival",
    "avalanche": "Safety & Survival",
}


def get_adventure_tours(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
) -> list[AdventureTourInfo]:
    """Returns copies of adventure tours matching optional category and difficulty filters."""
    results = [t.model_copy(deep=True) for t in ADVENTURE_TOURS]

    if category:
        cat_clean = category.strip().lower()
        canonical_cat = CATEGORY_ALIASES.get(cat_clean, cat_clean)
        results = [
            t for t in results
            if t.category.lower() == canonical_cat.lower()
            or cat_clean in t.category.lower()
        ]

    if difficulty:
        diff_clean = difficulty.strip().lower()
        results = [
            t for t in results
            if t.difficulty.lower() == diff_clean
        ]

    return results


def get_adventure_guides() -> list[AdventureGuideInfo]:
    """Returns copies of all certified lead guides."""
    return [g.model_copy(deep=True) for g in ADVENTURE_GUIDES]


def detect_adventure_intent(query: str) -> Optional[AdventureIntent]:
    """Detects customer inquiries regarding guided mountaineering, rock climbing classes,
    whitewater rafting, avalanche safety clinics, or guide certifications.
    """
    if not isinstance(query, str) or not query.strip():
        return None

    cleaned = query.strip()
    cleaned_lower = cleaned.lower()

    # Trigger patterns
    triggers = [
        r"\badventures?\b",
        r"\btours?\b",
        r"\bexpeditions?\b",
        r"\bclinics?\b",
        r"\bguided\b",
        r"\bclasses\b",
        r"\bclass\b",
        r"\bmountaineering\b",
        r"\bglacier\s+travel\b",
        r"\bglacier\b",
        r"\brock\s+climbing\b",
        r"\bclimbing\s+clinics?\b",
        r"\bwhitewater\b",
        r"\brafting\b",
        r"\bavalanche\s+safety\b",
        r"\bavalanche\b",
        r"\bwilderness\s+navigation\b",
        r"\bnavigation\b",
        r"\bcompass\b",
        r"\borienteering\b",
        r"\bguides?\b",
        r"\binstructors?\b",
        r"\bcertifications?\b",
        r"\bamga\b",
        r"\bwfr\b",
        r"\baiare\b",
        r"\bsarah\s+jenkins\b",
        r"\bmarcus\s+vance\b",
        r"\bdavid\s+chen\b",
        r"\belena\s+rostova\b",
        r"\bsmith\s+rock\b",
        r"\brogue\s+river\b",
        r"\bsnoqualmie\s+pass\b",
        r"\bnorth\s+cascades\b",
        r"\bprerequisites?\b",
        r"\bprevious\s+experience\b",
        r"\bprior\s+experience\b",
    ]

    if not any(re.search(pat, cleaned_lower) for pat in triggers):
        return None

    # Detect category
    detected_category: Optional[str] = None
    if re.search(r"\b(?:rock\s+climbing|climbing|rock)\b", cleaned_lower):
        detected_category = "Rock Climbing"
    elif re.search(r"\b(?:mountaineering|glacier|alpine)\b", cleaned_lower):
        detected_category = "Mountaineering"
    elif re.search(r"\b(?:whitewater|rafting|kayak|river)\b", cleaned_lower):
        detected_category = "Water Sports"
    elif re.search(r"\b(?:avalanche|navigation|compass|survival|safety)\b", cleaned_lower):
        detected_category = "Safety & Survival"

    # Detect difficulty
    detected_difficulty: Optional[str] = None
    if re.search(r"\b(?:beginner|intro|introduction|novice)\b", cleaned_lower):
        detected_difficulty = "Beginner"
    elif re.search(r"\bintermediate\b", cleaned_lower):
        detected_difficulty = "Intermediate"
    elif re.search(r"\bstrenuous\b", cleaned_lower):
        detected_difficulty = "Strenuous"
    elif re.search(r"\b(?:expert|advanced)\b", cleaned_lower):
        detected_difficulty = "Expert"

    # Detect tour_id
    detected_tour_id: Optional[str] = None
    if re.search(r"\b(?:glacier|mountaineering|rainier)\b", cleaned_lower):
        detected_tour_id = "alpine-mountaineering"
    elif re.search(r"\b(?:smith\s+rock|rock\s+climbing|climbing\s+clinic)\b", cleaned_lower):
        detected_tour_id = "outdoor-rock-climbing"
    elif re.search(r"\b(?:whitewater|rafting|rogue\s+river)\b", cleaned_lower):
        detected_tour_id = "backcountry-whitewater"
    elif re.search(r"\b(?:compass|navigation|north\s+cascades)\b", cleaned_lower):
        detected_tour_id = "wilderness-navigation"
    elif re.search(r"\b(?:avalanche|snoqualmie)\b", cleaned_lower):
        detected_tour_id = "avalanche-safety"

    # Determine action
    # Priority: prerequisites -> guide names -> guides/certifications -> recommend -> tours
    prereq_match = bool(re.search(
        r"\b(?:prerequisites?|previous\s+experience|prior\s+experience|experience\s+required|need\s+previous\s+experience|do\s+i\s+need\s+experience|requirements?)\b",
        cleaned_lower,
    ))
    guide_names_match = bool(re.search(
        r"\b(?:sarah\s+jenkins|marcus\s+vance|david\s+chen|elena\s+rostova)\b",
        cleaned_lower,
    ))
    guides_match = bool(re.search(
        r"\b(?:guides?|instructors?|certifications?|certified|qualifications?|amga|wfr|aiare)\b",
        cleaned_lower,
    ))
    recommend_match = bool(re.search(
        r"\b(?:recommend|suggest|which\s+adventure|which\s+tour|best\s+adventure|best\s+tour)\b",
        cleaned_lower,
    ))

    if prereq_match:
        action = "prerequisites"
    elif guide_names_match and re.search(r"\b(?:tell\s+me\s+about|who\s+is|background|bio|certifications?)\b", cleaned_lower):
        action = "guides"
    elif guides_match and (re.search(r"\b(?:certifications?|certified|qualifications?|amga|wfr|aiare)\b", cleaned_lower) or not detected_category):
        action = "guides"
    elif guide_names_match and not detected_category:
        action = "guides"
    elif recommend_match:
        action = "recommend"
    else:
        action = "tours"

    return AdventureIntent(
        action=action,
        category=detected_category,
        difficulty=detected_difficulty,
        tour_id=detected_tour_id,
    )


def build_adventure_prompt(intent: AdventureIntent) -> str:
    """Builds grounding context for LLM prompt injection with adventure tour catalog,
    guide certifications, prerequisites, and booking guidelines.
    """
    lines = [
        "Contoso Outdoors Official Adventure Tours & Skills Clinics Grounding:",
        f"- Detected Intent Action: {intent.action.upper()}",
    ]
    if intent.category:
        lines.append(f"- Category: {intent.category}")
    if intent.difficulty:
        lines.append(f"- Difficulty: {intent.difficulty}")
    if intent.tour_id:
        lines.append(f"- Specific Tour ID: {intent.tour_id}")

    lines.append("")
    lines.append("- Guided Adventure Tours Catalog:")
    for tour in ADVENTURE_TOURS:
        lines.append(
            f"  * {tour.title} (ID: {tour.tour_id}, Category: {tour.category}): "
            f"Location: {tour.location} | Duration: {tour.duration} | Difficulty: {tour.difficulty} | "
            f"Price: ${tour.price_per_person:.2f}/person | Gear Rental: ${tour.gear_rental_fee:.2f}/person | "
            f"Max Group: {tour.max_group_size} | Lead Guide: {tour.lead_guide_name} | "
            f"Prerequisites: {tour.prerequisites} | Included Gear: {', '.join(tour.included_gear)}"
        )

    lines.append("")
    lines.append("- Certified Lead Guides Directory:")
    for guide in ADVENTURE_GUIDES:
        lines.append(
            f"  * {guide.name} ({guide.title}, {guide.years_experience} years experience): "
            f"Certifications: {', '.join(guide.certifications)} | Specialties: {', '.join(guide.specialties)}"
        )

    lines.extend([
        "",
        "Instructions for Assistant:",
        "- Ground responses strictly in the official Contoso Outdoors adventures and guides data above.",
        "- Always specify tour difficulty, duration, location, pricing per person, and required gear prerequisites.",
        "- For glacier travel on Mount Rainier, clearly communicate that previous crampon and glacier travel experience (or Glacier Skills 101) is strictly required.",
        "- For beginner inquiries, recommend Introduction to Outdoor Rock Climbing at Smith Rock ($175) or Wilderness Navigation & Compass Clinic in the North Cascades ($120).",
        "- Highlight lead guide qualifications including AMGA, ACA, and Wilderness First Responder (WFR) certifications.",
        "- Note that optional Contoso technical gear rental packages can be added to any booking.",
    ])

    return "\n".join(lines)


def format_adventure_response(intent: AdventureIntent) -> dict[str, Any]:
    """Returns formatted human-readable answer and structured adventures_info payload."""
    tours_list = get_adventure_tours(category=intent.category, difficulty=intent.difficulty)
    guides_list = get_adventure_guides()

    adventures_info: dict[str, Any] = {
        "action": intent.action,
        "category": intent.category,
        "difficulty": intent.difficulty,
        "tour_id": intent.tour_id,
        "tours": [t.model_dump() for t in (tours_list if tours_list else ADVENTURE_TOURS)],
        "guides": [g.model_dump() for g in guides_list],
    }

    if intent.action == "prerequisites":
        # Find the target tour
        target_tour: Optional[AdventureTourInfo] = None
        if intent.tour_id:
            target_tour = next((t for t in ADVENTURE_TOURS if t.tour_id == intent.tour_id), None)
        if not target_tour and tours_list:
            target_tour = tours_list[0]
        if not target_tour:
            target_tour = ADVENTURE_TOURS[0]

        adventures_info["selected_tour"] = target_tour.model_dump()
        adventures_info["prerequisites"] = target_tour.prerequisites

        answer = (
            f"For the {target_tour.title} at {target_tour.location}: "
            f"{target_tour.prerequisites} "
            f"This {target_tour.duration.lower()} {target_tour.difficulty.lower()}-level adventure is led by {target_tour.lead_guide_name}. "
            f"Included gear: {', '.join(target_tour.included_gear)}. "
            f"Technical gear rental package is available for ${target_tour.gear_rental_fee:.2f}/person."
        )

    elif intent.action == "guides":
        guide_summaries = [
            f"{g.name} ({g.title}, {g.years_experience} years exp) - Certifications: {', '.join(g.certifications)}"
            for g in guides_list
        ]
        answer = (
            "Our Contoso Outdoors adventure guides are industry-certified professionals: "
            + "; ".join(guide_summaries)
            + ". All lead guides maintain AMGA or ACA credentials and Wilderness First Responder (WFR) certification."
        )

    else:  # "tours" or "recommend"
        matching = tours_list if tours_list else ADVENTURE_TOURS
        if intent.tour_id:
            specific = [t for t in matching if t.tour_id == intent.tour_id]
            if specific:
                matching = specific

        if len(matching) == 1:
            t = matching[0]
            answer = (
                f"We offer {t.title} at {t.location}! "
                f"This {t.duration} {t.difficulty.lower()}-level clinic is led by {t.lead_guide_name} "
                f"for ${t.price_per_person:.2f} per person (plus optional ${t.gear_rental_fee:.2f} technical gear rental). "
                f"Included gear: {', '.join(t.included_gear)}. "
                f"Prerequisites: {t.prerequisites}"
            )
        else:
            tour_bullets = [
                f"{t.title} ({t.location}, {t.duration}, {t.difficulty}) - ${t.price_per_person:.2f}/person, led by {t.lead_guide_name}"
                for t in matching
            ]
            answer = (
                f"We offer {len(matching)} outdoor adventure tour{'s' if len(matching) > 1 else ''} & clinics: "
                + "; ".join(tour_bullets)
                + ". All tours feature certified lead guides and optional technical gear rental packages."
            )

    return {
        "answer": answer,
        "adventures_info": adventures_info,
    }
