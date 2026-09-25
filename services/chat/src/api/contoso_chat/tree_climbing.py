import re
from typing import Any, Optional

from pydantic import BaseModel


class CanopyGroveModel(BaseModel):
    grove_id: str
    title: str
    tree_species: str
    location: str
    canopy_height_m: int
    climbing_system: str
    limb_diameter_min_cm: int
    description: str
    highlights: list[str]


class TreeClimbingRequest(BaseModel):
    grove_id: str = "redwood-canopy-prairie-creek"
    climbing_system: str = "SRT"
    anchor_style: str = "basal_anchor"
    climber_weight_lbs: float = 190.0
    branch_diameter_cm: float = 22.0


class TreeClimbingResponse(BaseModel):
    grove_id: str
    grove_title: str
    peak_fork_load_lbs: int
    peak_fork_load_kn: float
    limb_safety_ratio: float
    friction_hitch_recommendation: str
    safety_status: str
    advisory: str


class TreeGearItemModel(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class TreeClimbingIntent(BaseModel):
    action: str
    grove_id: Optional[str] = None
    climbing_system: Optional[str] = None


_GROVES = [
    (
        "redwood-canopy-prairie-creek",
        "Prairie Creek Redwoods Canopy Expedition",
        "Coast Redwood (Sequoia sempervirens)",
        "Prairie Creek Redwoods State Park, CA, USA",
        92,
        "SRT",
        25,
        "Primeval coastal redwood canopy offering vertical ascents into "
        "fern mats and ancient crown micro-ecosystems.",
        [
            "90m+ vertical ascent corridors",
            "Suspended canopy research portaledge",
            "Fern mat arboreal micro-ecosystem",
        ],
    ),
    (
        "olympic-rainforest-sitka",
        "Hoh River Valley Giant Sitka Spruce",
        "Sitka Spruce (Picea sitchensis)",
        "Olympic National Park, WA, USA",
        75,
        "SRT",
        22,
        "Temperate rainforest Sitka spruce canopy blanketed with moss "
        "drapery in high-moisture maritime conditions.",
        [
            "Massive hanging epiphyte moss drapery",
            "Wet-weather friction hitch calibration",
            "High-tensile throwline crotch isolation",
        ],
    ),
    (
        "sequoia-giant-forest",
        "Giant Forest Sierra Redwood Ascent",
        "Giant Sequoia (Sequoiadendron giganteum)",
        "Sequoia National Park, CA, USA",
        80,
        "SRT",
        30,
        "Colossal Sierra redwood canopy characterized by massive trunk "
        "circumference and heavy crown branches.",
        [
            "Massive trunk circumference traverse",
            "Sub-alpine fire-scarred bark protection",
            "Double-basal trunk anchor rigging",
        ],
    ),
    (
        "appalachian-white-oak",
        "Smoky Mountains Grand White Oak Canopy",
        "Eastern White Oak (Quercus alba)",
        "Great Smoky Mountains, NC/TN, USA",
        38,
        "MRT_DRT",
        18,
        "Sprawling hardwood crown in the Southern Appalachians ideal for "
        "moving rope technique crown exploration.",
        [
            "Broad hardwood lateral branch walking",
            "Moving rope technique crown exploration",
            "Friction hitch limb transfer maneuvers",
        ],
    ),
    (
        "tasmanian-tarkine-eucalyptus",
        "Tarkine Forest Swamp Gum Canopy",
        "Mountain Ash (Eucalyptus regnans)",
        "Tarkine Rainforest, Tasmania, Australia",
        85,
        "SRT",
        20,
        "Southern hemisphere temperate rainforest canopy featuring the "
        "tallest flowering hardwood trees on Earth.",
        [
            "Tallest flowering hardwood trees on Earth",
            "Wind-swayed high canopy rigging",
            "Cambium conduit isolation over wet bark",
        ],
    ),
]

CANOPY_GROVES: dict[str, CanopyGroveModel] = {
    s[0]: CanopyGroveModel(
        grove_id=s[0],
        title=s[1],
        tree_species=s[2],
        location=s[3],
        canopy_height_m=s[4],
        climbing_system=s[5],
        limb_diameter_min_cm=s[6],
        description=s[7],
        highlights=s[8],
    )
    for s in _GROVES
}

_GEAR = [
    (
        "cambium-saver-conduit",
        "Leather Cambium Friction Saver & Ring-and-Ring Tree Protection Strap",
        "tree_protection",
        True,
        "Eliminates rope burn friction gouging across sensitive tree cambium bark",
    ),
    (
        "arborist-throwline-kit",
        "55m Dyneema Throwline & 12oz Cordura Throw Weight with Storage Cube",
        "rigging",
        True,
        "Allows precise ground-based line installation over high branch unions up to 100ft",
    ),
    (
        "high-tensile-static-rope",
        "60m 11.5mm Semi-Static 24-Strand Low-Stretch Arborist Climbing Rope",
        "rope",
        True,
        "Minimal stretch static core engineered for mechanical ascender efficiency and limb friction",
    ),
    (
        "tree-climbing-saddle",
        "Wide Ergonomic Padded Arborist Harness with Multi-Bridge Attachment",
        "harness",
        True,
        "Specialized leg-loop articulation for long hanging suspensions without femoral cutoff",
    ),
    (
        "mechanical-friction-ascender",
        "Mechanical Rope Grab Ascender & Dual-Action Prusik Friction Hitch Cord",
        "ascender",
        True,
        "Provides positive grip on ascending lines with smooth, unassisted rope tending",
    ),
    (
        "canopy-suspension-helmet",
        "Ventilated Arborist Climbing Helmet with Integrated Eye Shield",
        "ppe",
        True,
        "Full crown and lateral impact protection against falling deadwood and whip branches",
    ),
]

MANDATORY_TREE_GEAR: list[TreeGearItemModel] = [
    TreeGearItemModel(
        item_id=g[0],
        name=g[1],
        category=g[2],
        mandatory=g[3],
        purpose=g[4],
    )
    for g in _GEAR
]


def get_canopy_groves(
    climbing_system: Optional[str] = None,
) -> list[CanopyGroveModel]:
    groves = list(CANOPY_GROVES.values())
    if climbing_system:
        cs = climbing_system.strip().upper()
        return [g for g in groves if g.climbing_system.upper() == cs]
    return groves


def get_canopy_grove(grove_id: str) -> Optional[CanopyGroveModel]:
    return CANOPY_GROVES.get(grove_id.strip().lower())


def get_tree_gear() -> list[TreeGearItemModel]:
    return list(MANDATORY_TREE_GEAR)


def calculate_tree_climbing(
    request: TreeClimbingRequest,
) -> TreeClimbingResponse:
    grove = get_canopy_grove(request.grove_id)
    if not grove:
        raise ValueError(f"Canopy grove '{request.grove_id}' not found")

    is_basal = request.anchor_style == "basal_anchor"
    multiplier = 2.0 if is_basal else 1.0
    peak_fork_load_lbs = round(request.climber_weight_lbs * multiplier * 1.2)
    peak_fork_load_kn = round(peak_fork_load_lbs * 0.00444822, 2)
    limb_safety_ratio = round((request.branch_diameter_cm / 15.0) ** 2, 2)

    if request.branch_diameter_cm < 12.0:
        safety_status = "prohibited_structural_failure_risk"
    elif request.branch_diameter_cm < 15.0:
        safety_status = "marginal_undersized_limb_hazard"
    else:
        safety_status = "approved_cambium_saver_required"

    if request.climbing_system == "SRT":
        friction_hitch_rec = "Valdôtain Tresse (VT) or Rope Wrench with 8mm Heat-Resistant Cord"
    else:
        friction_hitch_rec = "Distel or Michoacan friction hitch on dynamic split-tail"

    anchor_desc = (
        "Basal anchor configuration doubles limb fork forces (2:1 pulley effect) "
        "plus 1.2 dynamic factor"
        if is_basal
        else "Canopy isolated anchor maintains 1:1 fork loading with 1.2 dynamic factor"
    )

    if safety_status == "prohibited_structural_failure_risk":
        status_advisory = (
            f"CRITICAL PROHIBITED HAZARD: Branch diameter ({request.branch_diameter_cm} cm) "
            f"is below minimum 12 cm threshold; structural failure risk under peak load "
            f"of {peak_fork_load_lbs} lbs ({peak_fork_load_kn} kN). Ascent strictly prohibited."
        )
    elif safety_status == "marginal_undersized_limb_hazard":
        status_advisory = (
            f"WARNING MARGINAL LIMB: Branch diameter ({request.branch_diameter_cm} cm) "
            f"provides safety ratio {limb_safety_ratio}. Limb is undersized (<15 cm baseline); "
            "isolate backup tie-in point before ascending."
        )
    else:
        status_advisory = (
            f"APPROVED CANOPY ASCENT: Limb safety ratio is {limb_safety_ratio} on "
            f"{request.branch_diameter_cm} cm union. Ring-and-ring cambium friction saver "
            "is mandatory to safeguard cambium tissue from rope burn gouging."
        )

    advisory = (
        f"{status_advisory} {anchor_desc}, resulting in {peak_fork_load_lbs} lbs "
        f"({peak_fork_load_kn} kN) peak load. "
        f"Recommended hitch setup for {request.climbing_system}: {friction_hitch_rec}."
    )

    return TreeClimbingResponse(
        grove_id=grove.grove_id,
        grove_title=grove.title,
        peak_fork_load_lbs=peak_fork_load_lbs,
        peak_fork_load_kn=peak_fork_load_kn,
        limb_safety_ratio=limb_safety_ratio,
        friction_hitch_recommendation=friction_hitch_rec,
        safety_status=safety_status,
        advisory=advisory,
    )


_TREE_KEYWORD_REGEX = re.compile(
    r"\b("
    r"tree|trees|canopy|canopies|arborist|arborists|cambium|arboreal|"
    r"limb|limbs|branch|branches|basal\s+anchor|throwline|srt\s+vs\s+mrt|"
    r"mrt|drt|redwood|redwoods|sequoia|sequoias|sitka\s+spruce|white\s+oak|"
    r"swamp\s+gum|eucalyptus(\s+regnans)?"
    r")\b",
    re.IGNORECASE,
)


def detect_tree_climbing_intent(message: str) -> Optional[TreeClimbingIntent]:
    q = message.lower()

    tree_climbing_explicit = (
        "tree climbing",
        "climbing tree",
        "climbing trees",
        "tree climb",
        "tree climber",
        "arboreal canopy",
        "canopy expedition",
        "canopy research",
        "cambium saver",
        "cambium friction saver",
        "friction saver",
        "arborist throwline",
        "throwline",
        "tree saddle",
        "tree climbing saddle",
        "arborist saddle",
        "moving rope technique",
        "mrt drt",
        "prairie creek redwood",
        "prairie creek redwoods",
        "hoh river valley giant sitka",
        "giant forest sierra redwood",
        "smoky mountains grand white oak",
        "tarkine forest swamp gum",
        "swamp gum canopy",
        "sitka spruce canopy",
        "redwood canopy",
        "canopy portaledge",
        "basal anchor load",
        "basal ground anchor",
    )
    has_explicit = any(term in q for term in tree_climbing_explicit)

    other_exclusions = (
        "rock climbing",
        "rock climb",
        "rock climber",
        "rock climbers",
        "sport climbing",
        "trad climbing",
        "bouldering",
        "chalk bag",
        "climbing shoes",
        "climbing shoe",
        "big wall aid",
        "big wall aid climbing",
        "haul bag",
        "slackline",
        "highline",
        "weblock",
        "weblocks",
        "cave",
        "caving",
        "speleology",
        "croll",
        "oversuit",
        "canyoneering",
        "slot canyon",
        "fiddlestick",
        "via ferrata",
        "ice screws",
        "crampons",
        "packrafting",
        "nordic speedskating",
    )
    if any(ex in q for ex in other_exclusions) and not has_explicit:
        return None

    has_keyword = bool(_TREE_KEYWORD_REGEX.search(q))
    if not has_keyword and not has_explicit:
        return None

    grove_id = _resolve_grove_id(q)
    climbing_system = _resolve_climbing_system(q)
    action = _resolve_tree_action(q, grove_id)

    return TreeClimbingIntent(
        action=action,
        grove_id=grove_id,
        climbing_system=climbing_system,
    )


def _resolve_grove_id(q: str) -> Optional[str]:
    if "prairie creek" in q or "redwood" in q:
        return "redwood-canopy-prairie-creek"
    if "hoh river" in q or "sitka" in q:
        return "olympic-rainforest-sitka"
    if "giant forest" in q or "sequoia" in q:
        return "sequoia-giant-forest"
    if "white oak" in q or "smoky" in q:
        return "appalachian-white-oak"
    if "tarkine" in q or "swamp gum" in q or "eucalyptus" in q:
        return "tasmanian-tarkine-eucalyptus"
    return None


def _resolve_climbing_system(q: str) -> Optional[str]:
    if "srt" in q or "single rope" in q:
        return "SRT"
    if "mrt" in q or "drt" in q or "moving rope" in q:
        return "MRT_DRT"
    return None


def _resolve_tree_action(q: str, grove_id: Optional[str]) -> str:
    calc_triggers = (
        "calculate", "forkload", "fork load", "basal anchor",
        "anchor load", "safety ratio", "limb safety", "peak load",
        "branch diameter", "pulley effect",
    )
    if any(k in q for k in calc_triggers):
        return "calculate_tree_climbing"

    gear_triggers = (
        "gear", "checklist", "equipment", "kit", "throwline",
        "cambium saver", "saddle", "throw weight", "helmet",
    )
    detail_triggers = (
        "detail", "about", "tell me about", "explore",
        "highlights", "species", "height",
    )
    has_gear = any(k in q for k in gear_triggers)
    has_detail = any(d in q for d in detail_triggers)

    if has_gear and not (grove_id and has_detail):
        return "gear_checklist"
    if grove_id and has_detail:
        return "grove_detail"
    if grove_id and not any(k in q for k in ("list", "groves", "catalog")):
        return "grove_detail"
    return "groves_list"


class FormattedTreeClimbingResponse(str):
    _data: dict[str, Any]

    def __new__(cls, answer: str, data: dict[str, Any]):
        instance = super().__new__(cls, answer)
        instance._data = data
        return instance

    def get(self, key: str, default: Any = None) -> Any:
        return self._data.get(key, default)

    def __getitem__(self, key: Any) -> Any:
        if isinstance(key, str) and key in self._data:
            return self._data[key]
        return super().__getitem__(key)

    def __contains__(self, key: object) -> bool:
        return key in self._data if isinstance(key, str) else False

    def keys(self):
        return self._data.keys()

    def values(self):
        return self._data.values()

    def items(self):
        return self._data.items()


def format_tree_climbing_response(
    data_or_intent: Any,
    query: str = "",
) -> FormattedTreeClimbingResponse:
    if isinstance(data_or_intent, dict):
        answer = data_or_intent.get("answer", "Tree climbing response")
        return FormattedTreeClimbingResponse(answer, data_or_intent)

    intent: TreeClimbingIntent = data_or_intent

    if intent.action in ("calculate_tree_climbing", "calculate"):
        target_grove_id = intent.grove_id or "redwood-canopy-prairie-creek"
        req = TreeClimbingRequest(
            grove_id=target_grove_id,
            climbing_system=intent.climbing_system or "SRT",
        )
        res = calculate_tree_climbing(req)
        answer = (
            f"Backcountry Tree Climbing Rigging for {res.grove_title}: "
            f"Peak fork load is {res.peak_fork_load_lbs} lbs ({res.peak_fork_load_kn} kN). "
            f"Limb safety ratio: {res.limb_safety_ratio}. Safety status: {res.safety_status}. "
            f"Friction hitch recommendation: {res.friction_hitch_recommendation}. "
            f"Advisory: {res.advisory}"
        )
        info = {
            "action": intent.action,
            "grove_id": res.grove_id,
            "grove_title": res.grove_title,
            "peak_fork_load_lbs": res.peak_fork_load_lbs,
            "peak_fork_load_kn": res.peak_fork_load_kn,
            "limb_safety_ratio": res.limb_safety_ratio,
            "friction_hitch_recommendation": res.friction_hitch_recommendation,
            "safety_status": res.safety_status,
            "advisory": res.advisory,
            "calculation": res.model_dump(),
        }
        return FormattedTreeClimbingResponse(answer, {"answer": answer, "tree_climbing_info": info})

    if intent.action in ("grove_detail", "detail") and intent.grove_id:
        grove = get_canopy_grove(intent.grove_id)
        if grove:
            answer = (
                f"Canopy Expedition Grove: {grove.title} ({grove.location}). "
                f"Tree Species: {grove.tree_species} | Canopy Height: {grove.canopy_height_m}m | "
                f"Climbing System: {grove.climbing_system} | Min Limb Diameter: {grove.limb_diameter_min_cm}cm. "
                f"{grove.description} Highlights: {'; '.join(grove.highlights)}."
            )
            info = {
                "action": intent.action,
                "grove_id": grove.grove_id,
                "grove": grove.model_dump(),
            }
            return FormattedTreeClimbingResponse(
                answer, {"answer": answer, "tree_climbing_info": info}
            )

    if intent.action in ("gear_checklist", "gear"):
        gear = get_tree_gear()
        gear_summary = "; ".join(f"{g.name} ({g.purpose})" for g in gear)
        answer = (
            f"Mandatory Canopy Climbing Safety & Rigging Gear Checklist (6 items): {gear_summary}. "
            "Strict tree care ethics mandate leather cambium friction savers to eliminate bark friction burn."
        )
        info = {
            "action": intent.action,
            "gear_items": [g.model_dump() for g in gear],
        }
        return FormattedTreeClimbingResponse(answer, {"answer": answer, "tree_climbing_info": info})

    groves = get_canopy_groves(climbing_system=intent.climbing_system)
    groves_summary = "; ".join(
        f"{g.title} ({g.tree_species}, {g.canopy_height_m}m, {g.climbing_system})" for g in groves
    )
    answer = (
        f"Iconic Arboreal Canopy Expedition Groves ({len(groves)} locations): {groves_summary}. "
        "Select a grove for detailed rigging, limb safety ratios, and throwline crotch recommendations."
    )
    info = {
        "action": intent.action,
        "groves": [g.model_dump() for g in groves],
    }
    return FormattedTreeClimbingResponse(answer, {"answer": answer, "tree_climbing_info": info})


def build_tree_climbing_prompt(intent: TreeClimbingIntent) -> str:
    lines = ["Backcountry Tree Climbing, Canopy Research & Arborist Tooling:"]

    if intent.grove_id:
        grove = get_canopy_grove(intent.grove_id)
        if grove:
            lines.append(
                f"- Selected Canopy Grove: {grove.title} ({grove.location})\n"
                f"  Species: {grove.tree_species} | Canopy Height: {grove.canopy_height_m}m\n"
                f"  Climbing System: {grove.climbing_system} | Min Limb Diameter: {grove.limb_diameter_min_cm}cm\n"
                f"  Description: {grove.description}\n"
                f"  Highlights: {'; '.join(grove.highlights)}"
            )
    else:
        groves = get_canopy_groves(climbing_system=intent.climbing_system)
        formatted = [f"{g.title} ({g.climbing_system}, {g.canopy_height_m}m)" for g in groves]
        lines.append(f"- Available Expedition Canopy Groves: {', '.join(formatted)}")

    lines.extend(
        [
            "- Arborist Canopy Rigging & Safety Ethics:",
            "  1. Cambium Protection: Leather cambium friction savers or ring-and-ring straps are strictly mandatory to prevent bark stripping and girdling.",
            "  2. Anchor Forces: Basal ground anchors double (2:1 pulley effect) the peak fork load over the limb compared to canopy isolated anchors.",
            "  3. Minimum Limb Diameter: Structural threshold is 15cm (safety ratio >= 1.0). Limbs under 12cm represent structural failure risk and are prohibited.",
            "  4. Climbing Systems: SRT utilizes mechanical ascenders with Rope Wrench/VT hitch; MRT/DRT utilizes dynamic split-tail with Distel/Michoacan hitch.",
            "  5. Ground Installation: 55m Dyneema throwlines with 12oz throw weights isolate clean natural crotches from the forest floor.",
        ]
    )

    return "\n".join(lines)
