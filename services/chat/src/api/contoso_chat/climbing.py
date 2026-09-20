import re
from typing import Any, Optional

from pydantic import BaseModel


class RouteModel(BaseModel):
    name: str
    grade: str
    pitches: int
    length_ft: int
    protection_type: str
    description: str
    descent_beta: str


class CragModel(BaseModel):
    crag_id: str
    name: str
    area: str
    region: str
    rock_type: str
    elevation_ft: int
    approach_minutes: int
    sun_exposure: str
    routes: list[RouteModel]
    standard_rack: str
    best_seasons: list[str]
    access_notes: str
    helmet_required: bool


class RackCalcRequest(BaseModel):
    route_type: str = "trad"
    pitches: int = 1
    crux_grade: str = "5.9"
    route_length_ft: int = 100


class RackCalcResponse(BaseModel):
    cams_description: str
    nuts_description: str
    slings_count: int
    quickdraws_count: int
    rope_length_m: int
    special_gear: list[str]
    weight_est_lbs: float


class ClimbingIntent(BaseModel):
    action: str  # "crags", "crag_detail", "rack_calc", "rappel_safety"
    crag_id: Optional[str] = None
    route_type: Optional[str] = None
    pitches: Optional[int] = None
    crux_grade: Optional[str] = None


DEFAULT_CLIMBING_CRAGS: dict[str, CragModel] = {
    "index-lower-town-wall": CragModel(
        crag_id="index-lower-town-wall",
        name="Index Lower Town Wall",
        area="Index / Skykomish Valley",
        region="Central Cascades / Washington",
        rock_type="Granite",
        elevation_ft=1200,
        approach_minutes=10,
        sun_exposure="South-facing (morning sun, afternoon shade near base)",
        routes=[
            RouteModel(
                name="Godzilla",
                grade="5.9+",
                pitches=1,
                length_ft=110,
                protection_type="trad",
                description="Classic steep corner crack to thrilling layback and hand jam crux.",
                descent_beta="Rappel with 70m rope from chain anchors.",
            ),
            RouteModel(
                name="City Park",
                grade="5.13d",
                pitches=1,
                length_ft=120,
                protection_type="trad",
                description="Legendary thin finger crack first free climbed by Todd Skinner.",
                descent_beta="Lower or rappel from two-bolt anchor.",
            ),
            RouteModel(
                name="Thin Fingers",
                grade="5.11a",
                pitches=2,
                length_ft=200,
                protection_type="trad",
                description="Superb sustained crack climbing on pristine sheer granite.",
                descent_beta="Two rappels with 60m rope.",
            ),
            RouteModel(
                name="The Great Northern Slab",
                grade="5.6",
                pitches=1,
                length_ft=90,
                protection_type="trad",
                description="Approachable slab climb with solid gear placements.",
                descent_beta="Rappel from bolted anchor.",
            ),
        ],
        standard_rack="Double rack #0.4-#3, single #4, set of stoppers, 10 alpine draws",
        best_seasons=["May", "June", "July", "August", "September", "October"],
        access_notes="Park at Lower Town Wall dirt pullout along Index-Galena Road. Cross railroad tracks carefully and follow climbers trail.",
        helmet_required=True,
    ),
    "leavenworth-castle-rock": CragModel(
        crag_id="leavenworth-castle-rock",
        name="Castle Rock — Leavenworth",
        area="Icicle Creek Canyon",
        region="Central Cascades / Leavenworth",
        rock_type="Granite",
        elevation_ft=1800,
        approach_minutes=15,
        sun_exposure="South / Southwest-facing (hot midday sun)",
        routes=[
            RouteModel(
                name="Midway",
                grade="5.6",
                pitches=3,
                length_ft=350,
                protection_type="trad",
                description="Historic multi-pitch slab and crack route up Castle Rock with great views of Icicle Canyon.",
                descent_beta="Walk off climber's trail to the west or rappel Logger's Ledge.",
            ),
            RouteModel(
                name="Saber",
                grade="5.8",
                pitches=3,
                length_ft=320,
                protection_type="trad",
                description="Stupendous flake and lieback crack climbing on the east face.",
                descent_beta="Rappel from bolted stations with single 60m rope.",
            ),
            RouteModel(
                name="Catapult",
                grade="5.8",
                pitches=2,
                length_ft=220,
                protection_type="trad",
                description="Exposed crack system with exciting exposure and solid jams.",
                descent_beta="Walk off west descent route.",
            ),
        ],
        standard_rack="Single rack to #3, selected micro-cams, 1 set of nuts, 8-10 alpine draws",
        best_seasons=["April", "May", "June", "September", "October"],
        access_notes="USFS Northwest Forest Pass required at Castle Rock parking pullout along Icicle Creek Road. Stay on switchbacking climber trail.",
        helmet_required=True,
    ),
    "vantage-feathers": CragModel(
        crag_id="vantage-feathers",
        name="The Feathers — Frenchman Coulee",
        area="Frenchman Coulee / Vantage",
        region="Columbia Basin / Central Washington",
        rock_type="Basalt",
        elevation_ft=1100,
        approach_minutes=5,
        sun_exposure="East and West sides (chase shade morning or afternoon)",
        routes=[
            RouteModel(
                name="Aggro Monkey",
                grade="5.10b",
                pitches=1,
                length_ft=60,
                protection_type="sport",
                description="Popular bolted columnar basalt line with powerful sequential moves on sharp edges.",
                descent_beta="Lower from two-bolt cold shut anchor.",
            ),
            RouteModel(
                name="Air Guitar",
                grade="5.10a",
                pitches=1,
                length_ft=65,
                protection_type="trad",
                description="Classic basalt corner crack requiring good jamming technique.",
                descent_beta="Lower or rappel from bolted anchor.",
            ),
            RouteModel(
                name="Ride 'Em Cowboy",
                grade="5.9",
                pitches=1,
                length_ft=55,
                protection_type="sport",
                description="Enjoyable steep face on volcanic basalt columns with solid edges.",
                descent_beta="Lower from chain anchor.",
            ),
        ],
        standard_rack="10-12 quickdraws for sport; single rack to #3 for trad cracks",
        best_seasons=["March", "April", "May", "October", "November"],
        access_notes="Discover Pass required for Frenchman Coulee parking. Beware of rattlesnakes in talus during warm months.",
        helmet_required=True,
    ),
    "washington-pass-liberty-bell": CragModel(
        crag_id="washington-pass-liberty-bell",
        name="Liberty Bell Mountain — Washington Pass",
        area="North Cascades / Washington Pass",
        region="North Cascades",
        rock_type="Granite",
        elevation_ft=7720,
        approach_minutes=75,
        sun_exposure="Southwest-facing (alpine weather and afternoon exposure)",
        routes=[
            RouteModel(
                name="Beckey Route",
                grade="5.6",
                pitches=4,
                length_ft=450,
                protection_type="alpine trad",
                description="Historic Fred Beckey classic up Liberty Bell with chimneys, cracks, and the famous friction pitch.",
                descent_beta="Three rappels down the southwest gully with single 60m rope.",
            ),
            RouteModel(
                name="Liberty Crack",
                grade="5.10d C1",
                pitches=12,
                length_ft=1200,
                protection_type="alpine trad",
                description="Magnificent alpine wall featuring aid roof and sustained free climbing on sheer granite.",
                descent_beta="Descend standard rappel route down Liberty Bell gully.",
            ),
            RouteModel(
                name="Barber Pole",
                grade="5.10a",
                pitches=4,
                length_ft=400,
                protection_type="alpine trad",
                description="Classic dihedral climbing with aesthetic exposure high above Washington Pass.",
                descent_beta="Rappel Beckey Route.",
            ),
        ],
        standard_rack="Single rack to #3, extra finger sizes, 1 set nuts, 10-12 alpine draws, cordellette",
        best_seasons=["July", "August", "September"],
        access_notes="Northwest Forest Pass at Washington Pass Overlook / Hairpin pullout on SR-20. Steep scree approach path; helmet essential due to rockfall.",
        helmet_required=True,
    ),
    "smith-rock-dihedrals": CragModel(
        crag_id="smith-rock-dihedrals",
        name="The Dihedrals — Smith Rock",
        area="Smith Rock State Park",
        region="Central Oregon",
        rock_type="Welded Tuff",
        elevation_ft=2900,
        approach_minutes=25,
        sun_exposure="East / Southeast-facing (morning sun, afternoon shade)",
        routes=[
            RouteModel(
                name="Chain Reaction",
                grade="5.12c",
                pitches=1,
                length_ft=80,
                protection_type="sport",
                description="Iconic Alan Watts arete testpiece over the Crooked River with relentless pocket pulling.",
                descent_beta="Lower from chain anchors with 60m rope.",
            ),
            RouteModel(
                name="The Dihedrals",
                grade="5.10d",
                pitches=1,
                length_ft=90,
                protection_type="sport",
                description="Technical vertical face with delicate crimps and technical footwork on welded tuff.",
                descent_beta="Lower from anchor chains.",
            ),
            RouteModel(
                name="Zion",
                grade="5.10a",
                pitches=1,
                length_ft=100,
                protection_type="trad",
                description="Classic stemming and liebacking corner crack in the Dihedrals area.",
                descent_beta="Lower or rappel from rings.",
            ),
        ],
        standard_rack="12-14 quickdraws; stick clip recommended; optional light rack to #2 for trad routes",
        best_seasons=["March", "April", "May", "September", "October", "November"],
        access_notes="Oregon State Parks pass required. Stay on established trails to prevent soil erosion. Watch for golden eagle nesting closures.",
        helmet_required=True,
    ),
}


def get_climbing_crags(
    discipline: Optional[str] = None, rock_type: Optional[str] = None
) -> list[CragModel]:
    crags = list(DEFAULT_CLIMBING_CRAGS.values())
    if rock_type:
        crags = [c for c in crags if rock_type.lower() in c.rock_type.lower()]
    if discipline:
        disc_lower = discipline.lower()
        crags = [
            c
            for c in crags
            if any(disc_lower in r.protection_type.lower() for r in c.routes)
        ]
    return crags


def get_climbing_crag_by_id(crag_id: str) -> Optional[CragModel]:
    return DEFAULT_CLIMBING_CRAGS.get(crag_id)


def calculate_climbing_rack(req: RackCalcRequest) -> RackCalcResponse:
    r_type = req.route_type.lower()
    pitches = max(1, req.pitches)
    length = max(30, req.route_length_ft)

    if pitches > 1:
        rope_m = 70 if length <= 130 else 80
    else:
        if length <= 95:
            rope_m = 60
        elif length <= 115:
            rope_m = 70
        else:
            rope_m = 80

    if "sport" in r_type:
        cams = "None required for bolted sport climbs"
        nuts = "None required"
        qd_count = max(6, int(length / 10) + 2)
        slings = 2 if pitches == 1 else pitches * 2
        special_gear = [
            "Personal anchor system (PAS)",
            "3x locking carabiners",
            "Assisted-braking belay device (e.g., Grigri)",
            "Stick clip for high first bolts",
            "Climbing helmet (CE/UIAA certified)",
        ]
        weight = round(qd_count * 0.25 + slings * 0.2 + 2.0, 1)

    elif "alpine" in r_type:
        cams = (
            "Double rack #0.4 to #2 Camalot, single #3; micro-cams (#0.1-#0.3) for cruxes"
            if pitches >= 4
            else "Single rack #0.3 to #3 Camalot, extra finger sizes"
        )
        nuts = "1 full set of wired stoppers (#4-#11) and nut tool"
        qd_count = 2
        slings = 10 if pitches <= 2 else 12
        special_gear = [
            "Nut tool",
            "2x Cordellettes (18 ft 7mm nylon/dyneema)",
            "Guide-mode belay device (e.g. Petzl Reverso or ATC-Guide)",
            "4x Locking carabiners",
            "Prusik loops / HollowBlock for rappel backup",
            "Headlamp with fresh batteries",
            "Emergency bivy sack and topo map",
            "Climbing helmet (mandatory for alpine rockfall)",
        ]
        weight = round(8.0 + (pitches * 0.8) + (slings * 0.15), 1)

    else:
        if pitches > 1:
            cams = "Double rack from #0.4 to #3 Camalot with single #4; micro-cams (#0.1-#0.3) recommended for crux placements"
            nuts = "1 full set of passive nuts/stoppers (#1-#11) and 1 set of micro-stoppers, plus nut tool"
            qd_count = 4
            slings = 12
            special_gear = [
                "Nut tool",
                "2x Cordellettes (18-20 ft 7mm nylon/Dyneema)",
                "Guide-mode belay device",
                "4x Auto-locking carabiners",
                "Crack gloves or athletic tape",
                "Headlamp with spare batteries",
                "Climbing helmet",
            ]
            weight = 13.5
        else:
            cams = "Single rack from #0.3 to #3 Camalot (0.4, 0.5, 0.75, 1, 2, 3), optional double in finger sizes (#0.5, #0.75)"
            nuts = "1 full set of stoppers/nuts (#4-#11) with nut tool"
            qd_count = 4
            slings = 8
            special_gear = [
                "Nut tool",
                "Bandage/athletic tape for hand jamming",
                "Alpine cordellette (6m 7mm cord)",
                "Belay device with guide mode (e.g. Black Diamond ATC-Guide)",
                "Climbing helmet",
            ]
            weight = 9.2

    return RackCalcResponse(
        cams_description=cams,
        nuts_description=nuts,
        slings_count=slings,
        quickdraws_count=qd_count,
        rope_length_m=rope_m,
        special_gear=special_gear,
        weight_est_lbs=weight,
    )


def get_rappel_safety_protocol() -> dict[str, Any]:
    return {
        "title": "Rock Climbing Rappel & Anchor Safety Protocols",
        "pre_rappel_checklist": [
            "Tie stopper knots in both rope ends (triple barrel knot or double overhand) before tossing ropes.",
            "Inspect anchor: test all bolts, chains, webbing, quick-links, and trees for wear, sun damage, or loose nuts.",
            "Ensure rope middle mark is seated exactly at the anchor master point/rings.",
            "Confirm ropes reach next anchor station or ground before uncoupling personal anchor system.",
        ],
        "backup_systems": [
            "Autoblock or prusik friction hitch on brake strand below belay device clipped to leg loop.",
            "Third hand backup attached to leg loop with locking carabiner.",
        ],
        "extension_and_rigging": [
            "Extend rappel device on 60cm runner with two locking carabiners to keep device above friction backup.",
            "Weight the system completely and lock off to verify brake before unhooking personal tether.",
        ],
        "anchor_evaluation_principles": [
            "SERENE / ERNEST: Solid, Equalized, Redundant, Efficient / Non-extending, Strong, Timely.",
            "Redundancy: Never rely on a single anchor point unless an exceptionally bombproof large tree or massive feature.",
        ],
        "communication_and_signals": [
            "Call 'Off Belay' only when securely anchored with 2 independent points.",
            "Shout 'Rope!' before throwing rappel strands down the face to alert climbers below.",
            "Call 'Off Rappel' once ropes are clear and safe at the lower anchor.",
        ],
        "essential_gear": [
            "Climbing helmet (UIAA/CE certified)",
            "Locking carabiners (at least 3-4 HMS/screw-gate)",
            "Friction hitch cord (6mm nylon prusik or VT prusik / Sterling HollowBlock)",
            "Personal Anchor System (PAS) or 120cm dynamic sling",
            "Belay/rappel device with teeth/high friction channels (ATC Guide or Reverso)",
            "Rappel gloves or leather belay gloves",
        ],
    }


def detect_climbing_intent(query: str) -> Optional[ClimbingIntent]:
    q = query.lower()

    exclude_words = [
        "clinic",
        "clinics",
        "tour",
        "tours",
        "guided",
        "lesson",
        "lessons",
        "trade-in",
        "trade in",
        "re-gear",
        "gpx",
        "waypoint",
        "waypoints",
    ]
    if any(re.search(rf"\b{re.escape(w)}\b", q) for w in exclude_words):
        return None

    climbing_patterns = [
        r"\bclimb",
        r"\bcrags?\b",
        r"\btrad\b",
        r"\bsport\s+climb",
        r"\bsport\s+route",
        r"\bbouldering\b",
        r"\bpitches?\b",
        r"\byds\b",
        r"\b5\.\d+[a-d\+\-]?",
        r"\bgodzilla\b",
        r"\bmidway\b",
        r"\bbeckey\b",
        r"\bchain\s+reaction\b",
        r"\bcity\s+park\b",
        r"\blower\s+town\s+wall\b",
        r"\bcastle\s+rock\b",
        r"\bthe\s+feathers\b",
        r"\bvantage\b",
        r"\bliberty\s+bell\b",
        r"\bsmith\s+rock\b",
        r"\bdihedrals\b",
        r"\brack\b",
        r"\brappel",
        r"\bcams?\b",
        r"\bcamalot\b",
        r"\bquickdraws?\b",
        r"\balpine\s+draw",
        r"\bbelay",
        r"\bautoblock\b",
        r"\bstopper\s+knot",
        r"\brock\s+route",
    ]

    if not any(re.search(pat, q) for pat in climbing_patterns):
        return None

    crag_id = None
    if any(re.search(rf"\b{re.escape(k)}\b", q) for k in ["index", "lower town wall", "godzilla", "city park"]):
        crag_id = "index-lower-town-wall"
    elif any(re.search(rf"\b{re.escape(k)}\b", q) for k in ["castle rock", "midway", "leavenworth", "icicle"]):
        crag_id = "leavenworth-castle-rock"
    elif any(re.search(rf"\b{re.escape(k)}\b", q) for k in ["vantage", "feathers", "frenchman"]):
        crag_id = "vantage-feathers"
    elif any(re.search(rf"\b{re.escape(k)}\b", q) for k in ["liberty bell", "beckey", "washington pass"]):
        crag_id = "washington-pass-liberty-bell"
    elif any(re.search(rf"\b{re.escape(k)}\b", q) for k in ["smith rock", "dihedrals", "chain reaction"]):
        crag_id = "smith-rock-dihedrals"

    route_type = None
    if re.search(r"\bsport\b", q):
        route_type = "sport"
    elif re.search(r"\balpine\b", q):
        route_type = "alpine"
    elif re.search(r"\btrad\b", q):
        route_type = "trad"

    pitches = None
    pitch_match = re.search(r"(\d+)\s*(?:pitch|pitches|-pitch)", q)
    if pitch_match:
        pitches = int(pitch_match.group(1))
    elif "multi-pitch" in q or "multipitch" in q:
        pitches = 3
    elif "single pitch" in q:
        pitches = 1

    crux_grade = None
    grade_match = re.search(r"\b(5\.\d+[a-d\+\-]?)\b", q)
    if grade_match:
        crux_grade = grade_match.group(1)

    if any(re.search(rf"\b{re.escape(k)}\b", q) for k in ["rappel", "rappelling", "abseil", "stopper knot", "autoblock", "anchor safety"]):
        action = "rappel_safety"
    elif any(
        re.search(rf"\b{re.escape(k)}\b", q)
        for k in [
            "rack",
            "calculate rack",
            "cam sizes",
            "nuts",
            "quickdraws",
            "gear needed",
            "protection recommendation",
            "rack-calc",
            "rack calc",
        ]
    ):
        action = "rack_calc"
    elif crag_id and any(
        re.search(rf"\b{re.escape(k)}\b", q)
        for k in [
            "route",
            "routes",
            "detail",
            "about",
            "beta",
            "grade",
            "godzilla",
            "city park",
            "midway",
            "beckey",
            "chain reaction",
        ]
    ):
        action = "crag_detail"
    elif any(
        re.search(rf"\b{re.escape(k)}\b", q)
        for k in [
            "crags",
            "catalog",
            "destinations",
            "where to climb",
            "list crags",
            "crag recommendations",
        ]
    ):
        action = "crags"
    elif crag_id:
        action = "crag_detail"
    else:
        action = "crags"

    return ClimbingIntent(
        action=action,
        crag_id=crag_id,
        route_type=route_type,
        pitches=pitches,
        crux_grade=crux_grade,
    )


def build_climbing_prompt(intent: ClimbingIntent) -> str:
    lines = ["Pacific Northwest Backcountry Climbing & Alpine Crag Beta Tooling:"]
    if intent.crag_id:
        crag = get_climbing_crag_by_id(intent.crag_id)
        if crag:
            routes_str = "; ".join(
                f"{r.name} ({r.grade}, {r.pitches}p, {r.length_ft}ft, {r.protection_type})"
                for r in crag.routes
            )
            lines.append(
                f"- Crag: {crag.name} ({crag.area}, {crag.region})\n"
                f"  Rock: {crag.rock_type} | Elevation: {crag.elevation_ft} ft | Approach: {crag.approach_minutes} min\n"
                f"  Sun Exposure: {crag.sun_exposure} | Helmet Required: {crag.helmet_required}\n"
                f"  Classic Routes: {routes_str}\n"
                f"  Standard Rack: {crag.standard_rack}\n"
                f"  Best Seasons: {', '.join(crag.best_seasons)}\n"
                f"  Access: {crag.access_notes}"
            )
    else:
        crags = get_climbing_crags()
        lines.append(
            f"- Available PNW Crags: {', '.join(f'{c.name} ({c.rock_type})' for c in crags)}"
        )

    lines.extend(
        [
            "- Climbing Protection & Rack Guidelines:",
            "  1. Trad: Single or double rack from micro-cams to #3/#4 Camalot, stoppers/nuts, extendable alpine draws to reduce rope drag.",
            "  2. Sport: Quickdraw count proportional to route length + 2 for anchors, stick clip recommended.",
            "  3. Rappel Safety: Always tie stopper knots in both rope ends, use autoblock friction backup, extend rappel device.",
            "  4. Anchor Principles: SERENE (Solid, Equalized, Redundant, Efficient, Non-extending).",
        ]
    )
    return "\n".join(lines)


def format_climbing_response(intent: ClimbingIntent) -> dict[str, Any]:
    if intent.action == "rack_calc":
        req = RackCalcRequest(
            route_type=intent.route_type or "trad",
            pitches=intent.pitches or 1,
            crux_grade=intent.crux_grade or "5.9",
        )
        rack = calculate_climbing_rack(req)
        answer = (
            f"Recommended Climbing Rack for {req.pitches}-pitch {req.route_type.capitalize()} (Crux: {req.crux_grade}): "
            f"Cams: {rack.cams_description}. "
            f"Nuts: {rack.nuts_description}. "
            f"Draws & Slings: {rack.quickdraws_count} quickdraws, {rack.slings_count} slings/alpine draws. "
            f"Rope: {rack.rope_length_m}m dynamic climbing rope. "
            f"Estimated Weight: {rack.weight_est_lbs} lbs. "
            f"Special Gear: {', '.join(rack.special_gear[:3])}."
        )
        return {
            "answer": answer,
            "climbing_info": {
                "action": "rack_calc",
                "request": req.model_dump(),
                "rack": rack.model_dump(),
            },
        }

    if intent.action == "rappel_safety":
        protocol = get_rappel_safety_protocol()
        pre_checklist = " ".join(protocol["pre_rappel_checklist"][:2])
        backup = protocol["backup_systems"][0]
        answer = (
            f"Rappel & Anchor Safety Protocols: {pre_checklist} "
            f"Backup: {backup} "
            f"Always inspect anchors, extend the rappel device, and communicate clearly before unhooking."
        )
        return {
            "answer": answer,
            "climbing_info": {
                "action": "rappel_safety",
                "protocols": protocol,
            },
        }

    if intent.action == "crag_detail" and intent.crag_id:
        crag = get_climbing_crag_by_id(intent.crag_id)
        if crag:
            routes_summary = "; ".join(f"{r.name} ({r.grade}, {r.protection_type})" for r in crag.routes)
            answer = (
                f"Climbing Crag Beta: {crag.name} ({crag.area}, {crag.region}). "
                f"Rock Type: {crag.rock_type} | Elevation: {crag.elevation_ft} ft | Approach: {crag.approach_minutes} min. "
                f"Sun Exposure: {crag.sun_exposure}. "
                f"Classic Routes: {routes_summary}. "
                f"Standard Rack: {crag.standard_rack}. "
                f"Access: {crag.access_notes}."
            )
            return {
                "answer": answer,
                "climbing_info": {
                    "action": "crag_detail",
                    "crag": crag.model_dump(),
                },
            }

    # Default: "crags"
    crags = get_climbing_crags()
    crags_summary = "; ".join(f"{c.name} ({c.rock_type}, {c.area})" for c in crags)
    answer = (
        f"Pacific Northwest Rock Climbing Crags: {crags_summary}. "
        "Select a crag for route beta, standard racks, access notes, or request a rack calculation."
    )
    return {
        "answer": answer,
        "climbing_info": {
            "action": "crags",
            "crags": [c.model_dump() for c in crags],
        },
    }
