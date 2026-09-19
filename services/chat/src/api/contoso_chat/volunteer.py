import copy
import re
import uuid
from typing import Any, Optional

from pydantic import BaseModel


class VolunteerWorkpartyModel(BaseModel):
    project_id: str
    title: str
    trail_name: str
    region: str
    date: str
    meeting_time: str
    duration_hours: int
    difficulty: str  # Introductory, Moderate, Strenuous, Backcountry BCR
    required_tools: list[str]
    provided_safety_gear: list[str]
    spots_remaining: int
    description: str


class VolunteerRegistrationRequest(BaseModel):
    project_id: str
    volunteer_name: str
    volunteer_email: str
    emergency_contact: str
    emergency_phone: str
    waiver_acknowledged: bool = True


class VolunteerRegistrationResponse(BaseModel):
    registration_id: str  # Format: VOL-XXXXX
    project_id: str
    project_title: str
    volunteer_name: str
    date: str
    meeting_time: str
    status: str = "confirmed"
    instructions: str


class StewardshipImpactModel(BaseModel):
    total_hours_logged: int
    active_volunteers: int
    trails_maintained_miles: float
    trees_cleared: int
    drainage_structures_built: int


class VolunteerIntent(BaseModel):
    action: str  # "projects", "register", "tools", "impact", "safety"
    project_id: Optional[str] = None
    region: Optional[str] = None
    difficulty: Optional[str] = None


INITIAL_PROJECTS: dict[str, VolunteerWorkpartyModel] = {
    "mailbox-drainage": VolunteerWorkpartyModel(
        project_id="mailbox-drainage",
        title="Mailbox Peak Drainage & Turnpike Restoration",
        trail_name="Mailbox Peak Trail",
        region="Cascades",
        date="2026-10-10",
        meeting_time="08:00 AM",
        duration_hours=7,
        difficulty="Strenuous",
        required_tools=["Pulaski", "McLeod", "Rock Bar"],
        provided_safety_gear=["Hardhat", "Work Gloves", "Safety Glasses"],
        spots_remaining=8,
        description=(
            "Rebuild drainage swales, install turnpike log waterbars, and restore erosion "
            "barriers along the steep Mailbox Peak upper approach."
        ),
    ),
    "tiger-tread": VolunteerWorkpartyModel(
        project_id="tiger-tread",
        title="Tiger Mountain Corridor Brushing & Tread Repair",
        trail_name="Tiger Mountain Trail",
        region="Issaquah Alps",
        date="2026-10-17",
        meeting_time="08:30 AM",
        duration_hours=5,
        difficulty="Moderate",
        required_tools=["Loppers", "Handsaw", "Hoe"],
        provided_safety_gear=["Hardhat", "Work Gloves", "Safety Glasses"],
        spots_remaining=12,
        description=(
            "Brush corridor vegetation, clear encroaching salmonberry, and reshape sloughed "
            "trail tread on Tiger Mountain."
        ),
    ),
    "colchuck-naturalize": VolunteerWorkpartyModel(
        project_id="colchuck-naturalize",
        title="Enchantments Alpine Campsite & LNT Naturalization",
        trail_name="Colchuck Lake & Enchantments Trail",
        region="Cascades",
        date="2026-10-24",
        meeting_time="07:00 AM",
        duration_hours=8,
        difficulty="Backcountry BCR",
        required_tools=["Crosscut Saw", "Pick Mattock"],
        provided_safety_gear=["Hardhat", "Work Gloves", "Safety Glasses", "Backcountry First Aid Kit"],
        spots_remaining=6,
        description=(
            "Backcountry trail crew restoration focusing on alpine campsite revegetation, "
            "backcountry toilet maintenance, and social trail decommissioning in the Stuart Range."
        ),
    ),
    "hoh-river-blowdown": VolunteerWorkpartyModel(
        project_id="hoh-river-blowdown",
        title="Olympic Hoh River Blowdown Clearing",
        trail_name="Hoh River Trail",
        region="Olympics",
        date="2026-11-07",
        meeting_time="08:00 AM",
        duration_hours=6,
        difficulty="Moderate",
        required_tools=["Crosscut Saw", "Peavey", "Axe"],
        provided_safety_gear=["Hardhat", "Work Gloves", "Safety Glasses", "High-Visibility Vest"],
        spots_remaining=10,
        description=(
            "Clear fallen winter blowdown timber and brush obstacles along the rainforest corridor "
            "using non-motorized traditional crosscut tools."
        ),
    ),
}

VOLUNTEER_PROJECTS: dict[str, VolunteerWorkpartyModel] = copy.deepcopy(INITIAL_PROJECTS)
VOLUNTEER_REGISTRATIONS: list[VolunteerRegistrationResponse] = []

STEWARDSHIP_IMPACT = StewardshipImpactModel(
    total_hours_logged=14250,
    active_volunteers=840,
    trails_maintained_miles=186.5,
    trees_cleared=412,
    drainage_structures_built=328,
)

VOLUNTEER_TRIGGERS = [
    r"\bsafety gear\b",
    r"\bsafety certification\b",
    r"\btool certification\b",
    r"\btrail projects?\b",
    r"\bstewardship projects?\b",
    r"\bstrenuous projects?\b",
    r"\bwork gloves\b",
    r"\bhardhats?\b",
    r"\bhard hats?\b",
    r"\bmailbox peak\b",
    r"\btiger mountain\b",
    r"\bcolchuck\b",
    r"\bhoh river\b",
    r"\bvolunteer\b",
    r"\bvolunteering\b",
    r"\btrail work\b",
    r"\bstewardship\b",
    r"\bworkparty\b",
    r"\bworkparties\b",
    r"\bwork party\b",
    r"\bwork parties\b",
    r"\btrail maintenance\b",
    r"\bpulaski\b",
    r"\bmcleod\b",
    r"\btrail crew\b",
    r"\btrail crews\b",
    r"\blog hours\b",
    r"\bvolunteer hours\b",
    r"\bhours logged\b",
    r"\bgive back to trails\b",
    r"\bgive back\b",
    r"\bdrainage restoration\b",
]


def reset_volunteer_state() -> None:
    """Resets volunteer projects and registrations to initial defaults (for test isolation)."""
    global VOLUNTEER_PROJECTS, VOLUNTEER_REGISTRATIONS
    VOLUNTEER_PROJECTS = copy.deepcopy(INITIAL_PROJECTS)
    VOLUNTEER_REGISTRATIONS = []


def get_volunteer_projects(
    region: Optional[str] = None,
    difficulty: Optional[str] = None,
) -> list[VolunteerWorkpartyModel]:
    """Returns volunteer workparties filtered by region and difficulty."""
    projects = list(VOLUNTEER_PROJECTS.values())
    if region:
        r_clean = region.strip().lower().rstrip("s")
        projects = [
            p for p in projects
            if p.region.lower().rstrip("s") == r_clean or r_clean in p.region.lower()
        ]
    if difficulty:
        d_clean = difficulty.strip().lower()
        projects = [
            p for p in projects
            if p.difficulty.lower() == d_clean or d_clean in p.difficulty.lower()
        ]
    return projects


def get_volunteer_project_by_id(project_id: str) -> Optional[VolunteerWorkpartyModel]:
    """Looks up a volunteer workparty by ID."""
    pid_clean = project_id.strip().lower()
    for pid, proj in VOLUNTEER_PROJECTS.items():
        if pid.lower() == pid_clean:
            return proj
    return None


def register_volunteer(req: VolunteerRegistrationRequest) -> VolunteerRegistrationResponse:
    """Registers a volunteer for a trail workparty with a VOL- booking ID and decrements spots."""
    proj = get_volunteer_project_by_id(req.project_id)
    if not proj:
        raise ValueError(f"Volunteer workparty '{req.project_id}' not found")
    if proj.spots_remaining <= 0:
        raise ValueError(f"No volunteer spots remaining for '{proj.title}'")

    proj.spots_remaining -= 1
    registration_id = f"VOL-{uuid.uuid4().hex[:5].upper()}"

    instructions = (
        f"Registration confirmed for {req.volunteer_name} on crew '{proj.title}'. "
        f"Date: {proj.date} at {proj.meeting_time}. Meeting location: {proj.trail_name} trailhead parking lot. "
        f"Contoso Outdoors provides mandatory safety gear: {', '.join(proj.provided_safety_gear)}. "
        f"Required crew tools used: {', '.join(proj.required_tools)}. "
        f"Please bring sturdy work boots (hiking boots or work boots with ankle support), long pants, work layers, "
        f"2-3 liters of water, and lunch/snacks. A mandatory 15-minute safety briefing will take place before departure."
    )

    resp = VolunteerRegistrationResponse(
        registration_id=registration_id,
        project_id=proj.project_id,
        project_title=proj.title,
        volunteer_name=req.volunteer_name,
        date=proj.date,
        meeting_time=proj.meeting_time,
        status="confirmed",
        instructions=instructions,
    )
    VOLUNTEER_REGISTRATIONS.append(resp)
    return resp


def get_stewardship_impact() -> StewardshipImpactModel:
    """Returns cumulative trail stewardship and volunteer impact metrics."""
    return STEWARDSHIP_IMPACT


def detect_volunteer_intent(query: str) -> Optional[VolunteerIntent]:
    """Detects volunteer inquiries, project matching, gear/tools guidance, and impact requests."""
    query_lower = query.lower()
    matched = any(re.search(pat, query_lower) for pat in VOLUNTEER_TRIGGERS)
    if not matched:
        return None

    # Determine action
    has_register = bool(re.search(r"\b(sign me up|sign up|register|join|rsvp|book)\b", query_lower))
    has_impact = bool(re.search(r"\b(how many hours|hours logged|log hours|volunteer hours|total hours|impact|miles maintained|trees cleared)\b", query_lower))
    has_safety = bool(re.search(r"\b(safety|gear|ppe|hardhat|hard hat|glove|gloves|glasses|eye protection|boots|briefing|certification)\b", query_lower))
    has_tools = bool(re.search(r"\b(tool|tools|pulaski|mcleod|rock bar|crosscut|lopper|loppers|peavey|mattock|hoe|handsaw)\b", query_lower))

    if has_register:
        action = "register"
    elif has_impact and not has_tools and not has_safety:
        action = "impact"
    elif has_safety:
        action = "safety"
    elif has_tools:
        action = "tools"
    elif has_impact:
        action = "impact"
    else:
        action = "projects"

    # Extract project_id
    project_id: Optional[str] = None
    if re.search(r"\bmailbox\b", query_lower):
        project_id = "mailbox-drainage"
    elif re.search(r"\btiger\b", query_lower):
        project_id = "tiger-tread"
    elif re.search(r"\b(colchuck|enchantments?)\b", query_lower):
        project_id = "colchuck-naturalize"
    elif re.search(r"\b(hoh|hoh river)\b", query_lower):
        project_id = "hoh-river-blowdown"

    # Extract region
    region: Optional[str] = None
    if re.search(r"\bcascades?\b", query_lower):
        region = "Cascades"
    elif re.search(r"\bissaquah\b", query_lower):
        region = "Issaquah Alps"
    elif re.search(r"\bolympics?\b", query_lower):
        region = "Olympics"

    # If project_id matched, can also infer region if not explicitly provided
    if project_id and not region:
        proj_obj = get_volunteer_project_by_id(project_id)
        if proj_obj:
            region = proj_obj.region

    # Extract difficulty
    difficulty: Optional[str] = None
    if re.search(r"\bintroductory\b", query_lower):
        difficulty = "Introductory"
    elif re.search(r"\bmoderate\b", query_lower):
        difficulty = "Moderate"
    elif re.search(r"\bstrenuous\b", query_lower):
        difficulty = "Strenuous"
    elif re.search(r"\b(backcountry|bcr)\b", query_lower):
        difficulty = "Backcountry BCR"

    return VolunteerIntent(
        action=action,
        project_id=project_id,
        region=region,
        difficulty=difficulty,
    )


def build_volunteer_prompt(intent: VolunteerIntent) -> str:
    """Builds grounding context for trail volunteer workparties, safety PPE rules, and impact stats."""
    lines = [
        "Contoso Outdoors Trail Volunteer & Stewardship Grounding:",
        "- Purpose: Connect adventurers with volunteer trail workparties, tool guidance, safety PPE protocols, and stewardship impact.",
        "",
        "Upcoming Volunteer Workparties Catalog:",
    ]

    projects = get_volunteer_projects(region=intent.region, difficulty=intent.difficulty)
    if intent.project_id:
        target = get_volunteer_project_by_id(intent.project_id)
        if target:
            projects = [target]

    for p in projects:
        lines.append(
            f"- {p.title} (ID: {p.project_id}, Region: {p.region}, Trail: {p.trail_name}, Difficulty: {p.difficulty}): "
            f"Date: {p.date} at {p.meeting_time} ({p.duration_hours} hours). "
            f"Required Tools: {', '.join(p.required_tools)}. Provided PPE: {', '.join(p.provided_safety_gear)}. "
            f"Spots Remaining: {p.spots_remaining}. Description: {p.description}"
        )

    lines.extend([
        "",
        "Safety PPE Rules & Volunteer Protocol:",
        "1. Provided Safety Gear: Contoso Outdoors provides hardhats (ANSI Z89.1 certified), heavy leather work gloves, and eye protection glasses for all crew participants.",
        "2. Required Personal Attire: All volunteers MUST wear sturdy lug-soled boots (hiking boots or work boots with ankle support; no open-toe shoes, sneakers, or running shoes permitted) and long pants.",
        "3. Tailgate Safety Briefing: Every workparty begins with a mandatory 15-minute tailgate safety talk, hazard assessment, and proper tool ergonomics demonstration by the certified crew leader.",
        "4. Tool Safety & Dime Line: Volunteers must maintain a 10-foot safety circle ('dime line') when swinging cutting or grubbing tools (Pulaskis, pick mattocks, axes, and loppers).",
        "",
        "Cumulative Stewardship Impact Stats:",
        f"- Total Volunteer Hours Logged: {STEWARDSHIP_IMPACT.total_hours_logged:,}",
        f"- Active Volunteers: {STEWARDSHIP_IMPACT.active_volunteers:,}",
        f"- Miles of Trail Maintained: {STEWARDSHIP_IMPACT.trails_maintained_miles:.1f}",
        f"- Blowdown Trees Cleared: {STEWARDSHIP_IMPACT.trees_cleared:,}",
        f"- Drainage Structures Built/Restored: {STEWARDSHIP_IMPACT.drainage_structures_built:,}",
    ])

    return "\n".join(lines)


def format_volunteer_response(intent: VolunteerIntent) -> dict[str, Any]:
    """Generates assistant reply text and structured volunteer_info metadata."""
    if intent.action == "impact":
        impact = get_stewardship_impact()
        answer = (
            f"Contoso Outdoors adventurers and trail volunteers have logged a cumulative {impact.total_hours_logged:,} hours "
            f"across {impact.active_volunteers:,} active stewards! Together we have maintained {impact.trails_maintained_miles:.1f} miles "
            f"of Pacific Northwest trails, cleared {impact.trees_cleared:,} blowdown trees, and constructed {impact.drainage_structures_built:,} "
            "drainage structures and rock turnpikes."
        )
        return {
            "answer": answer,
            "volunteer_info": {
                "action": "impact",
                "impact": impact.model_dump(),
            },
        }

    if intent.action == "safety":
        proj = get_volunteer_project_by_id(intent.project_id) if intent.project_id else None
        proj_note = f" for {proj.title}" if proj else ""
        diff_note = f" on {intent.difficulty or (proj.difficulty if proj else 'strenuous')} trail projects"
        answer = (
            f"Safety guidance and PPE requirements{proj_note}{diff_note}: "
            "Contoso Outdoors provides all volunteers with certified hardhats, leather work gloves, and eye protection glasses. "
            "Volunteers are required to wear sturdy work boots with ankle support (no sneakers or sandals) and durable long pants. "
            "Every crew attends a mandatory 15-minute safety briefing covering tool handling, rock-rolling safety, and the 10-foot tool safety circle ('dime line')."
        )
        return {
            "answer": answer,
            "volunteer_info": {
                "action": "safety",
                "project_id": proj.project_id if proj else None,
                "provided_safety_gear": ["Hardhat", "Work Gloves", "Safety Glasses"],
                "required_volunteer_gear": ["Sturdy Work Boots", "Long Pants", "Work Layers", "Water (2-3L)"],
                "safety_rules": [
                    "Mandatory hardhat and eye protection worn whenever tools are active",
                    "Sturdy work boots required; no tennis shoes or sandals",
                    "Mandatory 15-minute tailgate safety talk and tool demonstration",
                    "Maintain 10-foot safety circle ('dime line') between tool users",
                ],
            },
        }

    if intent.action == "tools":
        proj = get_volunteer_project_by_id(intent.project_id) if intent.project_id else None
        proj_note = f" on {proj.title}" if proj else " for trail drainage and restoration"
        tools_list = proj.required_tools if proj else ["Pulaski", "McLeod", "Rock Bar", "Loppers", "Crosscut Saw"]
        answer = (
            f"Tools used{proj_note} include: {', '.join(tools_list)}. "
            "A Pulaski combines an axe bit for cutting roots and an adze for trenching soil; "
            "a McLeod features a heavy rake for smoothing tread and a sharpened hoe for shaping berms; "
            "and a Rock Bar provides heavy leverage for maneuvering boulders and building rock turnpikes."
        )
        return {
            "answer": answer,
            "volunteer_info": {
                "action": "tools",
                "project_id": proj.project_id if proj else None,
                "required_tools": tools_list,
                "tool_descriptions": {
                    "Pulaski": "Dual-purpose axe and adze for cutting roots and trenching rocky soil.",
                    "McLeod": "Combination rake and hoe for grading trail tread and clearing debris.",
                    "Rock Bar": "Heavy steel lever bar for maneuvering large rocks and waterbar reinforcement.",
                    "Crosscut Saw": "Traditional two-person saw for clearing windfall logs in wilderness zones.",
                    "Loppers": "Heavy branch cutters for corridor brushing and overhead clearing.",
                },
            },
        }

    if intent.action == "register":
        proj = get_volunteer_project_by_id(intent.project_id) if intent.project_id else None
        if proj:
            answer = (
                f"To sign up for '{proj.title}' on {proj.date} at {proj.meeting_time} ({proj.spots_remaining} spots remaining), "
                "you can complete your volunteer registration with your name, email, and emergency contact. "
                f"Contoso Outdoors provides hardhats and work gloves. Required tools: {', '.join(proj.required_tools)}."
            )
        else:
            answer = (
                "To register for a trail volunteer crew, select your preferred project and confirm your contact details "
                "and emergency contact info. We will issue your VOL- confirmation ID and meeting instructions."
            )
        return {
            "answer": answer,
            "volunteer_info": {
                "action": "register",
                "project_id": proj.project_id if proj else None,
                "project_title": proj.title if proj else None,
                "date": proj.date if proj else None,
                "meeting_time": proj.meeting_time if proj else None,
                "spots_remaining": proj.spots_remaining if proj else None,
            },
        }

    # Default action: "projects"
    projects = get_volunteer_projects(region=intent.region, difficulty=intent.difficulty)
    if intent.project_id:
        target = get_volunteer_project_by_id(intent.project_id)
        if target:
            projects = [target]

    proj_summaries = [
        f"{p.title} ({p.region}, {p.difficulty}, {p.duration_hours}h, date: {p.date}, tools: {', '.join(p.required_tools)})"
        for p in projects
    ]
    answer = (
        f"Upcoming Contoso Outdoors trail volunteer workparties: {'; '.join(proj_summaries)}. "
        "Contoso supplies hardhats, work gloves, and eye protection for all volunteers. Sturdy boots and long pants required."
    )
    return {
        "answer": answer,
        "volunteer_info": {
            "action": "projects",
            "region": intent.region,
            "difficulty": intent.difficulty,
            "projects": [p.model_dump() for p in projects],
        },
    }
