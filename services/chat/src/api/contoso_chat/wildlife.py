import re
from typing import Any, Optional

from pydantic import BaseModel


class WildlifeSpeciesModel(BaseModel):
    species_id: str
    common_name: str
    scientific_name: str
    category: str
    risk_level: str
    habitats: list[str]
    key_traits: list[str]
    safe_distance_yards: int
    encounter_protocol: str
    bear_specific_traits: Optional[dict[str, Any]] = None


class EncounterAssessmentRequest(BaseModel):
    species_id: str
    distance_yards: int = 50
    has_cubs_or_food: bool = False
    is_approaching: bool = False
    has_bear_spray_ready: bool = True


class EncounterAssessmentResponse(BaseModel):
    species_id: str
    species_name: str
    danger_level: str
    immediate_action: str
    defensive_steps: list[str]
    bear_spray_protocol: str
    food_storage_rule: str


class FoodStorageGuidelineModel(BaseModel):
    zone_id: str
    zone_name: str
    canister_required: bool
    regulations: str
    hang_spec: str


class WildlifeIntent(BaseModel):
    action: str  # "species_list", "species_detail", "encounter_assess", "food_storage", "gear_guide"
    species_id: Optional[str] = None
    category: Optional[str] = None
    distance_yards: Optional[int] = None


DEFAULT_WILDLIFE_SPECIES: dict[str, WildlifeSpeciesModel] = {
    "grizzly-bear": WildlifeSpeciesModel(
        species_id="grizzly-bear",
        common_name="Grizzly Bear",
        scientific_name="Ursus arctos horribilis",
        category="carnivore",
        risk_level="extreme",
        habitats=[
            "Subalpine meadows and avalanche chutes",
            "Dense coniferous forests",
            "Riparian river corridors and salmon streams",
            "Alpine tundra and talus slopes",
        ],
        key_traits=[
            "Prominent muscular shoulder hump of muscle for digging",
            "Dished/concave facial profile between eyes and snout tip",
            "Long, gently curved front claws (2 to 4 inches) light in color",
            "Short, rounded ears positioned widely on broad skull",
            "Tracks display claws separated distinctly from toe pad impressions",
        ],
        safe_distance_yards=100,
        encounter_protocol=(
            "Stand ground calmly. Do NOT run or climb trees; running triggers predatory chase response. "
            "Speak in a calm, low, assertive voice and group together tightly. Unholster bear spray and remove "
            "safety clip. If the bear charges within 30-40 feet, deploy bear spray in a downward sweeping 2-3 second burst. "
            "If defensive contact occurs: drop face-down prone, clasp fingers behind neck, elbows protecting face, "
            "spread legs wide to resist being flipped, and play dead until the bear completely leaves the area."
        ),
        bear_specific_traits={
            "shoulder_hump": True,
            "facial_profile": "dished / concave",
            "claw_length_inches": "2 to 4 inches (long, gently curved for digging)",
            "ear_shape": "short, rounded",
            "tree_climbing": "poor adult climbers due to claw morphology",
            "defensive_attack_response": "play dead (drop prone, hands behind neck, legs spread wide)",
            "predatory_attack_response": "fight back aggressively with all available weapons",
        },
    ),
    "black-bear": WildlifeSpeciesModel(
        species_id="black-bear",
        common_name="Black Bear",
        scientific_name="Ursus americanus",
        category="carnivore",
        risk_level="moderate to high",
        habitats=[
            "Montane coniferous forests",
            "Subalpine berry thickets and shrublands",
            "Lowland river valleys, wetlands, and coastal rainforests",
        ],
        key_traits=[
            "No prominent shoulder hump (highest point of back is rump)",
            "Straight Roman facial profile from forehead to snout tip",
            "Shorter, sharply curved dark claws (1 to 2 inches) adapted for climbing trees",
            "Taller, prominent, erect pointed ears",
            "Tracks show claw marks close to toe pad impressions",
        ],
        safe_distance_yards=100,
        encounter_protocol=(
            "Do NOT run or climb trees. Stand tall, group together, and raise arms and packs overhead to maximize size profile. "
            "Speak loudly, firmly, and assertively. Unclip bear spray safety. If the bear approaches, yell assertively, "
            "bang trekking poles or pots, and throw rocks or sticks. If charged within 30-40 feet, deploy bear spray. "
            "If attacked, do NOT play dead: fight back aggressively focusing blows on the bear's muzzle and eyes."
        ),
        bear_specific_traits={
            "shoulder_hump": False,
            "facial_profile": "straight / Roman",
            "claw_length_inches": "1 to 2 inches (short, sharply curved for tree climbing)",
            "ear_shape": "tall, prominent, erect, pointed",
            "tree_climbing": "expert climbers at all life stages",
            "defensive_attack_response": "stand tall, shout loudly, make noise, ready bear spray",
            "predatory_attack_response": "fight back aggressively with all available force; never play dead",
        },
    ),
    "cougar": WildlifeSpeciesModel(
        species_id="cougar",
        common_name="Cougar",
        scientific_name="Puma concolor",
        category="carnivore",
        risk_level="high",
        habitats=[
            "Steep rocky canyons, rimrock, and cliff ledges",
            "Dense montane coniferous forests and timbered ridges",
            "Chaparral scrublands and riparian thickets",
        ],
        key_traits=[
            "Long, heavy cylindrical tail with distinct black tip (one-third of body length)",
            "Uniform tawny golden to reddish-brown coat with whitish belly and throat",
            "Muscular low-slung stalking build with retractable claws",
            "Solitary, stealthy ambush predator that stalks prey from behind or above",
        ],
        safe_distance_yards=100,
        encounter_protocol=(
            "NEVER run, crouch, or turn your back. Maintain unbroken, direct eye contact. Pick up small children "
            "immediately without bending over. Stand tall, open your jacket or raise trekking poles overhead to appear as "
            "large as possible. Speak loudly, firmly, and assertively. Ready bear spray. Back away slowly toward safety. "
            "If attacked, fight back fiercely and relentlessly—protect throat and strike eyes, nose, and head."
        ),
        bear_specific_traits=None,
    ),
    "moose": WildlifeSpeciesModel(
        species_id="moose",
        common_name="Moose",
        scientific_name="Alces alces",
        category="ungulate",
        risk_level="high",
        habitats=[
            "Riparian willow wetlands and marshy river flats",
            "Boreal bogs, shallow lake edges, and beaver ponds",
            "Subalpine brushy creek drainages with dense willow browse",
        ],
        key_traits=[
            "Massive elongated head with bulbous drooping muzzle and throat bell (dewlap)",
            "High muscular shoulder hump with long spindly legs for wading and snow travel",
            "Broad palmate flattened antlers on adult bulls in late summer and autumn",
            "Highly aggressive defense behaviors from mothers with spring calves and autumn rutting bulls",
        ],
        safe_distance_yards=50,
        encounter_protocol=(
            "Give wide berth (minimum 50 yards). Watch for agitation cues: ears pinned flat against neck, raised hackles "
            "on shoulder hump, lip smacking, and head tossing. Moose do not view humans as prey; charges are defensive. "
            "Unlike bears, if a moose charges: RUN immediately and put large solid obstacles (trees, boulders, vehicles) "
            "between you and the animal. If knocked down, curl into a tight ball protecting head and neck until it leaves."
        ),
        bear_specific_traits=None,
    ),
    "western-rattlesnake": WildlifeSpeciesModel(
        species_id="western-rattlesnake",
        common_name="Western Rattlesnake",
        scientific_name="Crotalus oreganus",
        category="reptile",
        risk_level="moderate",
        habitats=[
            "Arid sagebrush basins and dry canyon benches",
            "Rocky talus slopes, basalt outcrops, and sun-warmed south-facing ledges",
            "Ponderosa pine dry forest margins and grasslands",
        ],
        key_traits=[
            "Broad, distinctly triangular head wider than neck with heat-sensing pit organs",
            "Interlocking keratin segment rattle on tail tip that buzzes when agitated",
            "Dark blotches or crossbands along light brown, tan, or olive-green dorsal scales",
            "Vertical elliptical slit pupils",
        ],
        safe_distance_yards=10,
        encounter_protocol=(
            "Freeze immediately upon hearing a rattle or spotting a snake to locate its exact position. Slowly step backwards "
            "out of strike range (at least 6-10 feet or twice the snake's length). Never attempt to poke, harass, or move the snake. "
            "In case of envenomation: remain calm to slow venom circulation, keep the bite site immobilized below heart level, "
            "remove constrictive jewelry/boots, do NOT cut, suction, ice, or apply tourniquets, and call 911 or trigger satellite SOS immediately."
        ),
        bear_specific_traits=None,
    ),
}

DEFAULT_FOOD_STORAGE_GUIDELINES: list[FoodStorageGuidelineModel] = [
    FoodStorageGuidelineModel(
        zone_id="north-cascades",
        zone_name="North Cascades National Park & Complex",
        canister_required=True,
        regulations=(
            "Approved bear-resistant food canisters (IGBC certified) are mandatory in designated subalpine zones "
            "and cross-country zones above treeline from May 1 through November 15. All food, trash, scented toiletries, "
            "and sunscreen must be sealed inside. Hanging is prohibited where trees are stunted or absent."
        ),
        hang_spec=(
            "In non-canister forested zones where hanging is permitted: use counter-balance hang suspended at least 12 feet "
            "(3.6m) above ground and 4 feet (1.2m) horizontally from tree trunk and branches."
        ),
    ),
    FoodStorageGuidelineModel(
        zone_id="olympic-np",
        zone_name="Olympic National Park",
        canister_required=True,
        regulations=(
            "IGBC-certified hard-sided bear canisters are mandatory year-round for all overnight backcountry campers "
            "along the entire Pacific Wilderness Coast, Enchanted Valley, Seven Lakes Basin / High Divide, and Royal Basin. "
            "Ursacks and soft bags are not permitted in mandatory canister zones."
        ),
        hang_spec=(
            "In non-canister designated areas equipped with bear wires or food poles: suspend all scented rations directly. "
            "If using tree hang in permitted zones: suspend minimum 12 feet high and 10 feet out from trunk."
        ),
    ),
    FoodStorageGuidelineModel(
        zone_id="mount-rainier",
        zone_name="Mount Rainier National Park",
        canister_required=True,
        regulations=(
            "Food storage canisters (IGBC approved) or use of park-provided food storage cables/poles required at all "
            "backcountry wilderness campsites year-round. All odorous items including cookware, trash, and lip balm must be secured."
        ),
        hang_spec=(
            "Use established metal food poles/cables where present. In cross-country alpine zones lacking poles, hard-sided "
            "canisters are mandatory; hanging from subalpine firs is strictly prohibited due to fragile tree limbs."
        ),
    ),
    FoodStorageGuidelineModel(
        zone_id="yellowstone-glacier",
        zone_name="Yellowstone & Glacier National Parks Ecosystem",
        canister_required=True,
        regulations=(
            "Core apex grizzly and black bear recovery ecosystem. Storing all food, trash, lip balm, sunscreen, stoves, "
            "and scented gear inside IGBC-certified bear-resistant containers or suspended from backcountry campsite food hang "
            "cables is federally enforced under 36 CFR regulations. Violation carries heavy fines."
        ),
        hang_spec=(
            "Backcountry food poles: suspend minimum 10 feet (3m) above ground and 4 feet (1.2m) from vertical posts. "
            "Hard-sided bear canisters must be placed on flat ground at least 100 yards downwind from sleeping tents."
        ),
    ),
]


def get_wildlife_species(category: Optional[str] = None) -> list[WildlifeSpeciesModel]:
    species_list = list(DEFAULT_WILDLIFE_SPECIES.values())
    if category:
        cat_clean = category.strip().lower()
        species_list = [s for s in species_list if s.category.lower() == cat_clean]
    return species_list


def get_wildlife_species_by_id(species_id: str) -> Optional[WildlifeSpeciesModel]:
    clean_id = species_id.strip().lower()
    return DEFAULT_WILDLIFE_SPECIES.get(clean_id)


def get_food_storage_guidelines() -> list[FoodStorageGuidelineModel]:
    return DEFAULT_FOOD_STORAGE_GUIDELINES


def assess_wildlife_encounter(req: EncounterAssessmentRequest) -> EncounterAssessmentResponse:
    clean_id = req.species_id.strip().lower()
    species = DEFAULT_WILDLIFE_SPECIES.get(clean_id)

    species_name = species.common_name if species else clean_id.replace("-", " ").title()

    # Determine danger level
    if req.distance_yards <= 30 or (req.is_approaching and req.distance_yards <= 50) or (req.has_cubs_or_food and req.distance_yards <= 60):
        danger_level = "critical"
    elif req.distance_yards <= 60 or req.is_approaching or req.has_cubs_or_food:
        danger_level = "extreme" if clean_id in ("grizzly-bear", "cougar") else "high"
    elif req.distance_yards < (species.safe_distance_yards if species else 100):
        danger_level = "high"
    else:
        danger_level = "moderate"

    # Immediate actions and defensive steps
    if clean_id == "grizzly-bear":
        immediate_action = (
            "Stand your ground firmly. Do NOT run or climb trees; running triggers innate predatory chase reflexes. "
            "Speak in a calm, low, assertive voice. Immediately unholster bear spray and remove safety clip."
        )
        defensive_steps = [
            "Group together tightly with trail partners to present a large, formidable profile.",
            "Hold bear spray with two hands, safety clip disengaged, finger ready on actuator.",
            "Avoid direct aggressive eye contact, but keep bear in field of view.",
            "Do NOT make sudden movements or turn your back.",
            "If the grizzly charges within 30-40 feet, deploy bear spray in a downward sweeping 2-3 second burst aiming at face and ground.",
            "If defensive contact occurs: drop face-down prone, clasp fingers tightly behind neck, elbows protecting face, legs spread wide to prevent rollover, and play dead until the bear completely departs.",
            "If attack is clearly predatory (stalking, night attack, persistent after play-dead): fight back violently with all available weapons, trekking poles, and rocks.",
        ]
        bear_spray_protocol = (
            "Keep bear spray holstered on chest harness or hip belt (never inside backpack). Effective range is 30-40 feet. "
            "Disengage safety clip, aim low in front of charging animal to compensate for upward aerosol drift, "
            "and discharge in 2-3 second continuous sweeping bursts."
        )
        food_storage_rule = (
            "All rations, garbage, cookware, lip balm, and scented gear must be stored inside an IGBC-certified "
            "bear-resistant canister placed at least 100 yards downwind from your sleeping area. Cook and clean 100 yards away."
        )

    elif clean_id == "black-bear":
        immediate_action = (
            "Stand tall, group together, and make yourself look as large as possible. Do NOT run or climb trees. "
            "Speak loudly, firmly, and assertively. Unholster bear spray."
        )
        defensive_steps = [
            "Raise arms, trekking poles, and jackets overhead to maximize perceived silhouette.",
            "Unholster bear spray and remove safety clip.",
            "Make loud aggressive noises: shout assertively ('Get back bear!'), bang trekking poles or cookware together.",
            "If the bear continues approaching, throw rocks or stout sticks aggressively toward it.",
            "If charged within 30-40 feet, deploy bear spray in a sweeping burst into its charge lane.",
            "If attacked, NEVER play dead: fight back violently targeting the bear's muzzle, nose, and eyes with rocks, poles, or fists.",
        ]
        bear_spray_protocol = (
            "Deploy bear spray at 30-40 feet if the bear charges or approaches aggressively. Aim slightly downward "
            "into the animal's charge lane to create an impassable capsaicin barrier."
        )
        food_storage_rule = (
            "Use IGBC-certified hard-sided canisters or park bear poles. Black bears are agile climbers; counter-balance "
            "hangs must be 12 feet high and 10 feet out from tree trunks."
        )

    elif clean_id == "cougar":
        immediate_action = (
            "Stop immediately. Maintain unbroken, direct eye contact. Do NOT run, crouch, or turn your back. "
            "Pick up small children immediately without bending over. Stand tall and unholster bear spray."
        )
        defensive_steps = [
            "Maintain continuous direct eye contact; cougars rely on ambush and prey looking away.",
            "Stand tall, flare open jacket, raise trekking poles overhead to look as large and formidable as possible.",
            "Speak loudly, firmly, and assertively without screaming.",
            "Unholster bear spray; cougars have highly sensitive olfactory systems and are deterred by capsaicin spray.",
            "Slowly back away toward open ground without turning around.",
            "If cougar approaches or attacks, fight back fiercely and aggressively—protect throat and target eyes, nose, and head with poles, rocks, or knives.",
        ]
        bear_spray_protocol = (
            "Bear spray is extremely effective on cougars. Discharge a 2-3 second burst if cougar stalks within 30 feet."
        )
        food_storage_rule = (
            "Store all food, meat, and scented items inside bear canisters or bear hangs 100 yards downwind. Food scraps attract "
            "small rodents and deer, which in turn attract stalking cougars."
        )

    elif clean_id == "moose":
        immediate_action = (
            "Give the moose ample space (at least 50 yards). If the moose shows signs of agitation (ears pinned flat, "
            "hackles raised, lip smacking) or charges: RUN immediately and get behind large solid obstacles."
        )
        defensive_steps = [
            "Watch for warning cues: ears pinned back flat against neck, raised hump hackles, snout raised, snorting, foot stomping.",
            "Unlike bear encounters, running is recommended against charging moose; moose charges are blunt defensive maneuvers.",
            "Put large trees, boulders, or vehicles between yourself and the charging moose.",
            "If knocked down, curl into a tight ball protecting head and neck with arms and backpack until the moose moves off.",
        ]
        bear_spray_protocol = (
            "Bear spray can be deployed at 30-40 feet if a charging moose cannot be evaded behind cover. Spray into snout/eyes."
        )
        food_storage_rule = (
            "Secure food in bear canisters or poles. Moose are herbivores but are strongly attracted to salty gear, pack straps, "
            "sweaty clothing, and campsite vegetation."
        )

    elif clean_id == "western-rattlesnake":
        immediate_action = (
            "Freeze immediately to locate the snake. Do NOT take sudden blind steps. Once located, slowly step backwards "
            "at least 10 feet out of strike range."
        )
        defensive_steps = [
            "Locate snake position by sound of rattle and scanning rocky or sun-exposed trail edges.",
            "Slowly back away out of strike range (at least twice the snake's body length, minimum 6-10 feet).",
            "Give the snake a clear escape route; never poke, harass, or attempt to move it.",
            "If bitten: stay calm to minimize heart rate, keep bite site immobilized below heart level, remove rings/boots before swelling.",
            "NEVER cut wound, attempt suction, apply ice, or use a tourniquet. Call 911 or activate satellite SOS immediately.",
        ]
        bear_spray_protocol = (
            "Bear spray is not used for rattlesnakes. Rely on visual awareness, trekking poles to check brush, and maintaining safe distance."
        )
        food_storage_rule = (
            "Store food in bear canisters to prevent attracting rodents (mice, ground squirrels, chipmunks), which are "
            "the primary prey attracting rattlesnakes to backcountry campsites."
        )

    else:
        immediate_action = (
            "Stop, stand ground calmly, unholster bear spray, assess animal behavior, and maintain safe buffer distance."
        )
        defensive_steps = [
            "Maintain at least 100 yards distance from apex predators and 50 yards from large ungulates.",
            "Group together tightly with partners.",
            "Ready bear spray with safety clip disengaged.",
            "Back away slowly without running.",
        ]
        bear_spray_protocol = (
            "Bear spray is universally effective against charging mammalian wildlife at 30-40 feet range."
        )
        food_storage_rule = (
            "Store all food and scented attractants in IGBC-approved bear canisters 100 yards downwind from camp."
        )

    return EncounterAssessmentResponse(
        species_id=clean_id,
        species_name=species_name,
        danger_level=danger_level,
        immediate_action=immediate_action,
        defensive_steps=defensive_steps,
        bear_spray_protocol=bear_spray_protocol,
        food_storage_rule=food_storage_rule,
    )


def detect_wildlife_intent(query: str) -> Optional[WildlifeIntent]:
    q_lower = query.lower()

    # Trail disambiguation: "rattlesnake ridge" or "rattlesnake ledge" without snake context
    if ("rattlesnake ridge" in q_lower or "rattlesnake ledge" in q_lower) and not any(
        re.search(pattern, q_lower) for pattern in [r"\bsnakes?\b", r"\bbite\b", r"\bvenom\b", r"\bstrike\b", r"\bencounter\b", r"\bslither\b", r"\breptile\b"]
    ):
        return None

    # Camp stove disambiguation: "canister stove", "stove canister", "isobutane" without bear/food context
    if ("canister stove" in q_lower or "stove canister" in q_lower or "isobutane" in q_lower) and not any(
        b in q_lower for b in ["bear", "igbc", "food storage", "grizzly", "wildlife", "animal"]
    ):
        return None

    # LNT / human waste disambiguation: "human waste", "wag bag", "cathole" without apex predator / animal context
    if any(phrase in q_lower for phrase in ["human waste", "wag bag", "cathole", "cat hole", "leave no trace", "poop"]) and not any(
        w in q_lower for w in ["grizzly", "black bear", "cougar", "moose", "rattlesnake", "apex predator", "wildlife", "fauna"]
    ):
        return None

    # Wildlife keywords
    wildlife_keywords = [
        "wildlife",
        "fauna",
        "animal",
        "animals",
        "grizzly",
        "black bear",
        "brown bear",
        "bear",
        "bears",
        "cougar",
        "mountain lion",
        "puma",
        "moose",
        "rattlesnake",
        "snake",
        "snakes",
        "bear spray",
        "bear canister",
        "canister",
        "canisters",
        "igbc",
        "food storage",
        "apex predator",
        "apex predators",
        "carnivore",
        "carnivores",
        "ungulate",
        "ungulates",
        "reptile",
        "reptiles",
    ]

    if not any(k in q_lower for k in wildlife_keywords):
        return None

    # Detect species_id
    species_id = None
    if "grizzly" in q_lower or "brown bear" in q_lower:
        species_id = "grizzly-bear"
    elif "black bear" in q_lower:
        species_id = "black-bear"
    elif "cougar" in q_lower or "mountain lion" in q_lower or "puma" in q_lower:
        species_id = "cougar"
    elif "moose" in q_lower:
        species_id = "moose"
    elif "rattlesnake" in q_lower or "snake" in q_lower:
        species_id = "western-rattlesnake"
    elif "bear" in q_lower and "spray" not in q_lower and "canister" not in q_lower:
        # Default bear reference
        species_id = "grizzly-bear"

    # Detect category
    category = None
    if "carnivore" in q_lower or "predator" in q_lower:
        category = "carnivore"
    elif "ungulate" in q_lower or "herbivore" in q_lower:
        category = "ungulate"
    elif "reptile" in q_lower:
        category = "reptile"

    # Detect distance
    distance_yards = None
    dist_match = re.search(r"(\d+)\s*(?:yard|yd|feet|ft|m|meter)s?", q_lower)
    if dist_match:
        val = int(dist_match.group(1))
        # If specified in feet, convert roughly to yards
        if "foot" in q_lower or "feet" in q_lower or "ft" in q_lower:
            distance_yards = max(1, val // 3)
        else:
            distance_yards = val

    # Determine action
    if any(k in q_lower for k in ["canister", "food storage", "hang food", "store food", "igbc", "bear hang"]):
        action = "food_storage"
    elif any(k in q_lower for k in ["bear spray", "how to use spray", "packing for bear", "bear horn", "bear bell"]):
        action = "gear_guide"
    elif any(
        k in q_lower
        for k in [
            "encounter",
            "charge",
            "charging",
            "attack",
            "spotted",
            "approaching",
            "what should i do if",
            "safety assessment",
            "too close",
            "yards away",
        ]
    ):
        action = "encounter_assess"
    elif species_id and any(
        k in q_lower
        for k in [
            "tell me about",
            "morphology",
            "traits",
            "identify",
            "difference",
            "detail",
            "habitat",
            "how to know",
            "shoulder hump",
        ]
    ):
        action = "species_detail"
    elif any(k in q_lower for k in ["species", "catalog", "list", "what animals", "what wildlife", "fauna"]):
        action = "species_list"
    elif species_id:
        action = "species_detail"
    else:
        action = "species_list"

    return WildlifeIntent(
        action=action,
        species_id=species_id,
        category=category,
        distance_yards=distance_yards,
    )


def build_wildlife_prompt(intent: WildlifeIntent) -> str:
    lines = ["Pacific Northwest Backcountry Wildlife & Apex Carnivore Safety Tooling:"]

    if intent.species_id:
        sp = get_wildlife_species_by_id(intent.species_id)
        if sp:
            lines.append(
                f"- Target Species: {sp.common_name} ({sp.scientific_name})\n"
                f"  Category: {sp.category.capitalize()} | Risk Level: {sp.risk_level.upper()}\n"
                f"  Safe Distance Buffer: {sp.safe_distance_yards} yards\n"
                f"  Habitats: {', '.join(sp.habitats)}\n"
                f"  Key Identification Traits: {'; '.join(sp.key_traits)}\n"
                f"  Encounter Response Protocol: {sp.encounter_protocol}"
            )
            if sp.bear_specific_traits:
                lines.append(
                    f"  Bear Morphology & Attack Protocol: "
                    f"Shoulder hump: {'Yes' if sp.bear_specific_traits.get('shoulder_hump') else 'No'} | "
                    f"Profile: {sp.bear_specific_traits.get('facial_profile')} | "
                    f"Claws: {sp.bear_specific_traits.get('claw_length_inches')} | "
                    f"Defensive Attack: {sp.bear_specific_traits.get('defensive_attack_response')} | "
                    f"Predatory Attack: {sp.bear_specific_traits.get('predatory_attack_response')}"
                )
    elif intent.category:
        species = get_wildlife_species(category=intent.category)
        lines.append(
            f"- Backcountry {intent.category.capitalize()} Species: "
            f"{', '.join(f'{s.common_name} ({s.scientific_name})' for s in species)}"
        )
    else:
        species = get_wildlife_species()
        lines.append(
            f"- Backcountry Wildlife Catalog: "
            f"{', '.join(f'{s.common_name} ({s.category}, buffer: {s.safe_distance_yards}yd)' for s in species)}"
        )

    lines.extend(
        [
            "- Apex Predator Safety & Food Canister Mandates:",
            "  1. Safe Distance: 100 yards for bears, cougars, and wolves; 50 yards for moose and elk.",
            "  2. Bear Spray Readiness: Holstered on hip/chest, range 30-40 ft, discharge downward sweeping burst.",
            "  3. Bear Identification: Grizzly has shoulder hump + dished face + long straight claws -> play dead on defensive contact. Black bear has straight snout + curved claws -> fight back aggressively.",
            "  4. Moose Defense: Do NOT stand ground; run immediately and place large obstacles (trees/boulders) between you and the moose.",
            "  5. Food Storage: IGBC-approved canisters required in North Cascades, Olympic Coast, Mount Rainier, and Yellowstone/Glacier. Store canisters 100 yards downwind from tent.",
        ]
    )

    return "\n".join(lines)


def format_wildlife_response(intent: WildlifeIntent) -> dict[str, Any]:
    if intent.action == "encounter_assess":
        target_species_id = intent.species_id or "grizzly-bear"
        distance = intent.distance_yards or 30
        assessment = assess_wildlife_encounter(
            EncounterAssessmentRequest(
                species_id=target_species_id,
                distance_yards=distance,
                is_approaching=True,
                has_cubs_or_food=False,
                has_bear_spray_ready=True,
            )
        )
        answer = (
            f"Backcountry Encounter Assessment for {assessment.species_name} ({distance} yards): "
            f"Danger Level: {assessment.danger_level.upper()}. "
            f"Immediate Action: {assessment.immediate_action} "
            f"Bear Spray Protocol: {assessment.bear_spray_protocol} "
            f"Food Storage Mandate: {assessment.food_storage_rule}"
        )
        return {
            "answer": answer,
            "wildlife_info": {
                "action": "encounter_assess",
                "species_id": target_species_id,
                "assessment": assessment.model_dump(),
            },
        }

    if intent.action == "food_storage":
        guidelines = get_food_storage_guidelines()
        zones_summary = "; ".join(f"{g.zone_name}: {g.regulations}" for g in guidelines)
        answer = (
            f"Backcountry Food Storage & Bear Canister Guidelines: {zones_summary} "
            "Always position IGBC-certified canisters at least 100 yards downwind from sleeping tents."
        )
        return {
            "answer": answer,
            "wildlife_info": {
                "action": "food_storage",
                "guidelines": [g.model_dump() for g in guidelines],
            },
        }

    if intent.action == "gear_guide":
        answer = (
            "Backcountry Apex Predator Gear Guide: Always carry EPA-registered bear spray holstered externally on chest harness "
            "or hip belt (never inside pack). Ensure range is 30-40 feet. Pack an IGBC-certified hard-sided food canister, "
            "a loud safety whistle, and satellite communicator (Garmin inReach / SOS beacon). Inspect spray expiry dates each season."
        )
        return {
            "answer": answer,
            "wildlife_info": {
                "action": "gear_guide",
                "recommended_gear": [
                    {"item": "EPA Bear Spray", "details": "Range 30-40 feet, continuous burst 7-9 seconds"},
                    {"item": "IGBC Bear Canister", "details": "Hard-sided container mandatory across PNW national parks"},
                    {"item": "Pealess Safety Whistle", "details": "Audible 1 mile, 3 blasts signal emergency"},
                    {"item": "Satellite SOS Communicator", "details": "Emergency beacon for predator attack reporting"},
                ],
            },
        }

    if intent.action == "species_detail" and intent.species_id:
        sp = get_wildlife_species_by_id(intent.species_id)
        if sp:
            bear_detail = ""
            if sp.bear_specific_traits:
                hump = "Prominent hump" if sp.bear_specific_traits.get("shoulder_hump") else "No hump"
                bear_detail = f" Morphology: {hump}, {sp.bear_specific_traits.get('facial_profile')} profile, {sp.bear_specific_traits.get('claw_length_inches')} claws."

            answer = (
                f"Backcountry Wildlife: {sp.common_name} ({sp.scientific_name}). "
                f"Category: {sp.category.capitalize()} | Risk Level: {sp.risk_level.upper()} | Safe Distance: {sp.safe_distance_yards} yards. "
                f"Habitats: {', '.join(sp.habitats)}. "
                f"Identification Traits: {'; '.join(sp.key_traits)}.{bear_detail} "
                f"Protocol: {sp.encounter_protocol}"
            )
            return {
                "answer": answer,
                "wildlife_info": {
                    "action": "species_detail",
                    "species_id": sp.species_id,
                    "species": sp.model_dump(),
                },
            }

    # Default: "species_list"
    species = get_wildlife_species(category=intent.category)
    summary = "; ".join(f"{s.common_name} ({s.category}, buffer: {s.safe_distance_yards} yards)" for s in species)
    answer = (
        f"Backcountry Fauna & Wildlife Catalog: {summary}. "
        "Maintain safe buffer distances (100 yards for carnivores, 50 yards for moose), carry accessible bear spray, "
        "and enforce IGBC bear canister food storage regulations."
    )
    return {
        "answer": answer,
        "wildlife_info": {
            "action": "species_list",
            "species": [s.model_dump() for s in species],
        },
    }
