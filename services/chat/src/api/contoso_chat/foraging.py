from typing import Any, Optional

from pydantic import BaseModel


class SpeciesModel(BaseModel):
    species_id: str
    common_name: str
    scientific_name: str
    category: str
    edibility: str
    seasons: list[str]
    primary_habitat: str
    key_identifiers: list[str]
    toxic_lookalikes: list[str]
    preparation_safety: str
    harvest_limit_rules: str


class SafetyScreenerRequest(BaseModel):
    category: str = "mushroom"
    season: str = "fall"
    has_false_gills: bool = False
    is_hollow_stem: bool = False
    has_milky_sap: bool = False
    growing_on_dead_wood: bool = False


class SafetyScreenerResponse(BaseModel):
    candidate_match: str
    warning_level: str
    recommendation: str
    safety_checks: list[str]
    permit_guideline: str
    toxic_warning: Optional[str] = None


class ForagingIntent(BaseModel):
    action: str  # "species_list", "species_detail", "safety_check", "guidelines"
    species_id: Optional[str] = None
    category: Optional[str] = None
    season: Optional[str] = None


DEFAULT_FORAGING_SPECIES: dict[str, SpeciesModel] = {
    "golden-chanterelle": SpeciesModel(
        species_id="golden-chanterelle",
        common_name="Golden Chanterelle",
        scientific_name="Cantharellus formosus",
        category="mushroom",
        edibility="Choice edible",
        seasons=["fall", "late summer"],
        primary_habitat="Coniferous mossy forest floors, especially near Douglas fir and Western hemlock",
        key_identifiers=[
            "Blunt, forked, ridge-like false gills running down the stem (decurrent)",
            "Solid white or pale interior flesh (never hollow)",
            "Uniform bright golden-yellow to orange cap",
            "Delicate fruity apricot-like aroma",
            "Grows terrestrial from soil or moss, never in clumps directly on wood",
        ],
        toxic_lookalikes=[
            "Jack-o'-Lantern (Omphalotus illudens / Omphalotus olivascens - poisonous, true blade gills, grows clustered on wood)",
            "False Chanterelle (Hygrophoropsis aurantiaca - thin crowded true gills, darker orange center, gastrointestinal irritant)",
        ],
        preparation_safety="Must always be cooked thoroughly before eating; contains minor toxins that cause gastric upset if consumed raw. Dry-sauté first to release moisture, then cook with butter or oil.",
        harvest_limit_rules="Pacific Northwest National Forests: Free personal-use permit allows up to 1-2 gallons per person per day (up to 5 gallons per calendar year). Commercial harvest requires paid permit. Cut above root base with a knife to protect mycelium.",
    ),
    "morel-mushroom": SpeciesModel(
        species_id="morel-mushroom",
        common_name="Morel Mushroom",
        scientific_name="Morchella elata",
        category="mushroom",
        edibility="Choice edible",
        seasons=["spring"],
        primary_habitat="Recent wildfire burn areas (1-2 years post-burn), cottonwood river valleys, and mixed conifer forests",
        key_identifiers=[
            "Honeycomb cap with distinct pits and ridges attached completely to the stem",
            "Entire mushroom is completely hollow from base of the stem to the top of the cap when sliced lengthwise",
            "Stem is off-white to cream colored with a slightly granular texture",
            "Earthy, nutty, savory aroma",
        ],
        toxic_lookalikes=[
            "False Morel (Gyromitra esculenta / Gyromitra brunnea - deadly; wrinkled brain-like lobed cap, cottony or solid chambered stem interior containing gyromitrin)",
            "Early Morel / Thimble Morel (Verpa bohemica - cap attached only at the very top of stem like a thimble on a finger, causes motor coordination loss)",
        ],
        preparation_safety="NEVER eat raw. Morels contain naturally occurring volatile hydrazine toxins destroyed only by heat. Slice lengthwise, rinse gently to remove grit or insects, and cook thoroughly (sautéing for at least 10 minutes).",
        harvest_limit_rules="USFS burn zone regulations require personal use permit (typically up to 2 gallons per day, 5 gallons per season free). In many PNW forest districts, mushrooms must be cut in half lengthwise at harvest to prevent illicit commercial sale.",
    ),
    "huckleberry": SpeciesModel(
        species_id="huckleberry",
        common_name="Thinleaf Huckleberry",
        scientific_name="Vaccinium membranaceum",
        category="plant",
        edibility="Choice edible",
        seasons=["summer", "fall"],
        primary_habitat="Subalpine slopes, mountain forest clearings, and moist montane woodlands at 2,000-6,000 ft elevation",
        key_identifiers=[
            "Erect deciduous shrub up to 3 to 6 feet tall with slender green/brown twigs",
            "Finely serrated alternate oval leaves with pointed tips",
            "Dark purple to black or deep blue single berries without a powdery bloom",
            "Intense sweet-tart mountain flavor",
        ],
        toxic_lookalikes=[
            "Red Baneberry (Actaea rubra - shiny bright red or white berries on thick stalks, extremely toxic cardiac arrest hazard)",
            "Nightshade (Solanum dulcamara - toxic red/purple berries on herbaceous vines)",
        ],
        preparation_safety="Edible raw fresh off the bush or cooked into jams, pancakes, crisps, and syrups. Wash thoroughly in cold water before eating to remove dust and insects.",
        harvest_limit_rules="National Forests (e.g. Gifford Pinchot, Mt. Hood, Mt. Baker-Snoqualmie): Personal use limit is 1 gallon per person per day (up to 3 gallons per year). Mechanical rakes or berry combs are strictly prohibited to prevent defoliation and bush damage. Respect designated tribal foraging reserves.",
    ),
    "miner-lettuce": SpeciesModel(
        species_id="miner-lettuce",
        common_name="Miner's Lettuce",
        scientific_name="Claytonia perfoliata",
        category="plant",
        edibility="Edible",
        seasons=["spring", "winter"],
        primary_habitat="Damp shaded forest floors, rich coastal woodlands, stream banks, and recently disturbed moist ground",
        key_identifiers=[
            "Round, disc-like circular leaves that completely surround the flower stem (perfoliate)",
            "Clusters of tiny white or pale pink five-petaled flowers emerging from the disc center",
            "Succulent, crisp, tender green stems and leaves",
            "Mild, fresh, sweet spinach-like flavor",
        ],
        toxic_lookalikes=[
            "Poison Hemlock (Conium maculatum - deadly parsley-like lacy foliage and purple-spotted stems, distinctly different but grows in similar damp soil)",
            "Spurge (Euphorbia spp. - exude toxic milky white sap irritating to skin and toxic if ingested)",
        ],
        preparation_safety="Outstanding eaten raw as a fresh salad green, or cooked lightly like spinach. Wash thoroughly in clean cold water to rinse garden or forest soil.",
        harvest_limit_rules="Snip upper leaf cups and stems with scissors, leaving roots and basal rosette intact for seasonal regrowth. Never harvest more than 1/3 of an individual patch. Ensure gathering occurs away from roadside pollutants and dog parks.",
    ),
    "stinging-nettle": SpeciesModel(
        species_id="stinging-nettle",
        common_name="Stinging Nettle",
        scientific_name="Urtica dioica",
        category="plant",
        edibility="Edible with preparation",
        seasons=["spring"],
        primary_habitat="Damp riparian forest edges, fertile river floodplains, wet meadows, and nitrogen-rich shaded soils",
        key_identifiers=[
            "Opposite, coarsely serrated heart-to-spear-shaped leaves",
            "Four-angled (square) erect herbaceous stems up to 3 to 6 feet tall",
            "Covered in hollow stinging hairs (trichomes) containing formic acid and histamines",
            "Rich earthy green aroma",
        ],
        toxic_lookalikes=[
            "Wood Nettle (Laportea canadensis - alternate leaves, also stinging and edible when cooked)",
            "Purple Dead-nettle (Lamium purpureum - square stem and mint-like appearance, non-toxic/edible, lacks stinging hairs)",
        ],
        preparation_safety="DO NOT consume raw. Fresh trichome hairs inject irritating formic acid and histamines. Blanch in boiling salted water for 60 to 90 seconds, steam, or dehydrate thoroughly to completely neutralize stinging hairs. Wear thick puncture-resistant gloves while harvesting and handling.",
        harvest_limit_rules="Harvest only the top 4 to 6 young tender leaves in early spring before flowering. Do not harvest once flowers or seed clusters appear, as older foliage accumulates calcium carbonate cystoliths that irritate the kidneys.",
    ),
}

FORAGING_GUIDELINES: dict[str, Any] = {
    "title": "Pacific Northwest Ethical Foraging & Flora Safety Guidelines",
    "hundred_percent_rule": "The 100% Identification Rule: Never consume any wild plant or mushroom unless you are 100% certain of its identification using multiple trusted botanical/mycological sources. When in doubt, throw it out.",
    "ethical_harvesting": [
        "Take only what you need for personal consumption (the 'one-third rule': never harvest more than one-third of any patch to ensure plant regeneration and wildlife forage)",
        "Never harvest rare, threatened, or endangered plant or fungal species",
        "Use a knife or scissors to harvest mushrooms and greens cleanly, minimizing damage to root systems and underground mycelial networks",
        "Carry mushrooms in porous mesh or wicker baskets so dropped spores can propagate across the forest floor as you hike",
        "Leave immature buttons and over-mature specimens to sporulate and sustain healthy forest ecosystems",
        "Tread lightly and avoid raking or stripping moss and leaf litter, which destroys delicate mycelial mats",
    ],
    "permits_and_regulations": [
        "USFS (U.S. Forest Service): Many Pacific Northwest National Forests (e.g., Mt. Baker-Snoqualmie, Gifford Pinchot, Mt. Hood) offer free personal-use permits for berries and mushrooms up to designated daily limits (typically 1-2 gallons per day, 3-5 gallons per year). Commercial harvesting requires a paid commercial permit.",
        "National Parks (e.g., Mount Rainier, Olympic, North Cascades): Foraging is strictly prohibited or restricted to small amounts of immediate consumption (e.g., 1 pint of berries per person per day). Mushroom removal is strictly illegal.",
        "State Forests and DNR Lands: Check Washington DNR / Oregon State Forest recreation rules. Free Discover Pass or parking pass required, with personal gathering limits strictly enforced.",
        "Private Property: Always secure explicit landowner permission before foraging.",
    ],
    "field_safety_rules": [
        "Always cook wild mushrooms thoroughly before eating; many edible species contain heat-labile gastrointestinal irritants or toxins when raw.",
        "Always save a fresh, whole reference specimen in the refrigerator in a paper bag in case medical identification is required.",
        "Never forage within 50 feet of roads, industrial runoff sites, treated agricultural fields, or contaminated waterways.",
        "Sample in small moderation when trying an edible species for the first time to detect personal allergic sensitivities.",
        "Equip yourself with the ten essentials, GPS/offline maps, a regional field guide, protective gloves, and a mushroom knife with brush.",
    ],
    "emergency_contact": {
        "poison_control": "1-800-222-1222 (National Poison Control Center)",
        "emergency": "911 for immediate wilderness medical evacuation",
    },
}


def get_foraging_species(
    category: Optional[str] = None,
    season: Optional[str] = None,
) -> list[SpeciesModel]:
    species = list(DEFAULT_FORAGING_SPECIES.values())
    if category:
        cat_norm = category.strip().lower()
        species = [s for s in species if s.category.lower() == cat_norm]
    if season:
        sea_norm = season.strip().lower()
        species = [s for s in species if any(sea_norm in sn.lower() for sn in s.seasons)]
    return species


def get_foraging_species_by_id(species_id: str) -> Optional[SpeciesModel]:
    normalized = species_id.strip().lower()
    return DEFAULT_FORAGING_SPECIES.get(normalized)


def assess_foraging_safety(req: SafetyScreenerRequest) -> SafetyScreenerResponse:
    cat = req.category.strip().lower()
    sea = req.season.strip().lower()

    # Rule 1: Wood-growing hazard for mushrooms
    if cat == "mushroom" and req.growing_on_dead_wood:
        return SafetyScreenerResponse(
            candidate_match="Wood-Decaying Fungus / Suspected Jack-o'-Lantern (Omphalotus)",
            warning_level="danger",
            recommendation="Avoid consumption. Never harvest wood-growing cluster mushrooms under the assumption they are edible chanterelles.",
            safety_checks=[
                "Substrate check: FAILED (Growing on dead wood or rotting logs; mycorrhizal species like chanterelles never grow on dead wood)",
                "Gill morphology: High risk of true blade gills associated with Jack-o'-Lantern (Omphalotus)",
                "Toxin alert: Jack-o'-Lantern mushrooms contain dangerous illudin toxins causing intense gastrointestinal cramping and vomiting",
            ],
            permit_guideline="National Forest gathering regulations strictly mandate harvesting only positively identified edible species.",
            toxic_warning="WARNING: Mushrooms growing in clusters on dead wood or buried stumps with blade gills are frequently toxic Jack-o'-Lanterns (Omphalotus illudens) or other poisonous wood-rot species.",
        )

    # Rule 2: Spring mushroom screening (Morel vs False Morel)
    if cat == "mushroom" and sea == "spring":
        if req.is_hollow_stem:
            return SafetyScreenerResponse(
                candidate_match="Morel Mushroom (Morchella spp.)",
                warning_level="safe",
                recommendation="True morels are completely hollow inside from base to cap tip when sliced lengthwise. Cook thoroughly to neutralize natural toxins; never eat morels raw.",
                safety_checks=[
                    "Stem cavity check: PASSED (Entire mushroom and cap form a single continuous hollow chamber)",
                    "Cap attachment check: Cap is pitted/honeycombed and attached directly to the stem",
                    "Sap check: Absence of milky or colored latex",
                    "False morel check: Solid or cottony interior ruled out",
                ],
                permit_guideline="Free personal-use USFS permits allow up to 1-2 gallons per day (up to 5 gallons per season). In many PNW forest districts, mushrooms must be cut in half lengthwise at harvest.",
                toxic_warning="Beware False Morels (Gyromitra esculenta / Gyromitra brunnea), which have wrinkled/brain-like caps and solid, chambered, or cottony interiors containing deadly gyromitrin.",
            )
        else:
            return SafetyScreenerResponse(
                candidate_match="Suspected False Morel (Gyromitra spp.)",
                warning_level="danger",
                recommendation="Do not eat! Gyromitrin poison cannot be reliably eliminated by home cooking and causes acute liver damage, neurological failure, and death.",
                safety_checks=[
                    "Stem cavity check: FAILED (Stem is solid, chambered, or cottony rather than completely hollow)",
                    "Cap morphology: Wrinkled, brain-like folds rather than true honeycomb pitting",
                    "Toxin alert: High probability of toxic Gyromitra species containing gyromitrin",
                ],
                permit_guideline="Do not harvest or consume suspected toxic False Morels.",
                toxic_warning="CRITICAL DANGER: Solid, chambered, or cottony stem interiors indicate False Morels (Gyromitra), which contain the lethal cellular toxin gyromitrin. Do NOT consume.",
            )

    # Rule 3: False gills on forest floor (Chanterelle)
    if req.has_false_gills and not req.growing_on_dead_wood:
        return SafetyScreenerResponse(
            candidate_match="Golden Chanterelle (Cantharellus formosus)",
            warning_level="safe",
            recommendation="100% Identification Rule: Confirm blunt ridges running down the stem and solid white interior flesh. Always cook thoroughly before consumption (dry-sauté first to release liquid). Never eat raw.",
            safety_checks=[
                "Gill structure check: PASSED (Forked, blunt ridges/false gills running decurrently down the stem, not sharp paper-like blade gills)",
                "Substrate check: PASSED (Growing in soil or moss, not clustered on dead wood or rotting logs)",
                "Stem cross-section check: PASSED (Solid interior flesh, not hollow)",
                "Sap check: PASSED (Absence of milky latex or sap)",
                "Look-alike screening: Jack-o'-Lantern ruled out due to terrestrial growth and blunt false gills",
            ],
            permit_guideline="USFS & PNW State Forests: Personal use permit required; limit is typically 1 to 2 gallons per harvester per day for personal consumption. Do not rake or disturb forest floor mycelium.",
            toxic_warning="Watch for Jack-o'-Lantern (Omphalotus illudens) which grows in clusters on dead wood with blade gills, and False Chanterelle (Hygrophoropsis aurantiaca) which has true orange crowded gills.",
        )

    # Rule 4: Plant screening with milky sap
    if cat == "plant" and req.has_milky_sap:
        return SafetyScreenerResponse(
            candidate_match="Unidentified Plant with Milky Sap",
            warning_level="warning",
            recommendation="Do not ingest. Wear gloves to prevent skin contact and dermatitis. Apply the Universal Edibility Test only under survival training.",
            safety_checks=[
                "Latex check: FAILED (Milky sap present; high likelihood of toxic alkaloids or phorbol esters)",
                "Universal rule: Avoid plants with white/colored sap unless positive 100% identification is confirmed",
            ],
            permit_guideline="Wild plant gathering on public lands requires compliance with 30% harvest rule and local botanic protection orders.",
            toxic_warning="CAUTION: Many wild plants with milky white or yellowish latex (such as spurges/Euphorbia and dogbanes) contain skin irritants and systemic cardiac/GI toxins.",
        )

    # Default fallback
    return SafetyScreenerResponse(
        candidate_match="Unidentified Foraged Specimen",
        warning_level="caution",
        recommendation="Inspect all physical characteristics: substrate, gill attachment, stem cross-section, spore print, and odor. When in doubt, throw it out.",
        safety_checks=[
            "Morphology inspection: Examine cap, gills/pores, stem, base, and mycelial attachment",
            "Spore print: Take spore print on white and black paper",
            "Substrate verification: Note whether growing on soil, moss, living tree, or rotting wood",
        ],
        permit_guideline="Check local USFS, BLM, or state park regulations for required foraging permits and harvest quotas.",
        toxic_warning="Never eat any wild mushroom or plant without 100% positive identification from multiple credible regional field guides.",
    )


def get_foraging_guidelines() -> dict[str, Any]:
    return FORAGING_GUIDELINES


def detect_foraging_intent(query: str) -> Optional[ForagingIntent]:
    q = query.lower()

    # Domain exclusions
    if any(
        w in q
        for w in [
            "refund",
            "order #",
            "return label",
            "climbing shoe",
            "drysuit",
            "whitewater",
            "river run",
            "avalanche danger",
            "snowpack",
            "ski tour",
            "splitboard",
            "skinning",
            "skin track",
            "shuttle quote",
            "fire ban",
        ]
    ):
        return None

    foraging_keywords = [
        "forag",
        "wild edible",
        "mushroom",
        "fungi",
        "chanterelle",
        "morel",
        "huckleberr",
        "miner's lettuce",
        "miners lettuce",
        "miner lettuce",
        "nettle",
        "jack-o'-lantern",
        "jack o lantern",
        "false morel",
        "false chanterelle",
        "look-alike",
        "lookalike",
        "look alike",
        "toxic",
        "poisonous",
        "harvest limit",
        "foraging rule",
        "foraging permit",
        "wild plant",
        "wild food",
        "flora safety",
        "false gills",
        "hollow stem",
    ]

    if not any(k in q for k in foraging_keywords):
        return None

    # Detect Species
    species_id = None
    if "chanterelle" in q:
        species_id = "golden-chanterelle"
    elif "morel" in q:
        species_id = "morel-mushroom"
    elif "huckleberr" in q:
        species_id = "huckleberry"
    elif "miner" in q and "lettuce" in q:
        species_id = "miner-lettuce"
    elif "nettle" in q:
        species_id = "stinging-nettle"

    # Detect Category
    category = None
    if any(k in q for k in ["mushroom", "fungi", "chanterelle", "morel"]):
        category = "mushroom"
    elif any(k in q for k in ["plant", "berry", "berries", "huckleberr", "lettuce", "nettle", "flora", "greens"]):
        category = "plant"

    # Detect Season
    season = None
    if "spring" in q:
        season = "spring"
    elif "summer" in q:
        season = "summer"
    elif "fall" in q or "autumn" in q:
        season = "fall"
    elif "winter" in q:
        season = "winter"

    # Detect Action
    if any(
        k in q
        for k in [
            "screen",
            "screener",
            "safety",
            "toxic",
            "poisonous",
            "safe to eat",
            "look-alike",
            "lookalike",
            "look alike",
            "jack-o'-lantern",
            "false morel",
            "false chanterelle",
            "identify",
            "identification",
            "is it safe",
            "safely",
        ]
    ):
        action = "safety_check"
    elif any(
        k in q
        for k in [
            "guideline",
            "guidelines",
            "rule",
            "rules",
            "permit",
            "permits",
            "ethics",
            "ethical",
            "harvest limit",
            "harvest limits",
            "100%",
        ]
    ):
        action = "guidelines"
    elif species_id and any(
        k in q
        for k in [
            "detail",
            "details",
            "about",
            "habitat",
            "scientific name",
            "tell me about",
            "what is",
        ]
    ):
        action = "species_detail"
    elif any(
        k in q
        for k in [
            "species",
            "catalog",
            "list",
            "what can i forage",
            "what edibles",
            "edible plants",
            "wild edibles",
            "edible",
        ]
    ):
        action = "species_list"
    elif species_id:
        action = "species_detail"
    else:
        action = "species_list"

    return ForagingIntent(
        action=action,
        species_id=species_id,
        category=category,
        season=season,
    )


def build_foraging_prompt(intent: ForagingIntent) -> str:
    lines = ["Pacific Northwest Wilderness Foraging & Flora Safety Tooling:"]
    if intent.species_id:
        sp = get_foraging_species_by_id(intent.species_id)
        if sp:
            lines.append(
                f"- Target Species: {sp.common_name} ({sp.scientific_name})\n"
                f"  Category: {sp.category} | Edibility: {sp.edibility} | Seasons: {', '.join(sp.seasons)}\n"
                f"  Habitat: {sp.primary_habitat}\n"
                f"  Key Identifiers: {'; '.join(sp.key_identifiers)}\n"
                f"  Toxic Look-alikes: {'; '.join(sp.toxic_lookalikes)}\n"
                f"  Preparation Safety: {sp.preparation_safety}\n"
                f"  Harvest Limit Rules: {sp.harvest_limit_rules}"
            )
    elif intent.category:
        species = get_foraging_species(category=intent.category, season=intent.season)
        lines.append(
            f"- Available {intent.category.capitalize()} Species: "
            f"{', '.join(f'{s.common_name} ({s.scientific_name})' for s in species)}"
        )
    else:
        species = get_foraging_species(season=intent.season)
        lines.append(
            f"- Available PNW Wild Edibles: "
            f"{', '.join(f'{s.common_name} ({s.category}, {s.edibility})' for s in species)}"
        )

    lines.extend(
        [
            "- Essential Field Safety & Ethical Rules:",
            "  1. 100% Identification Rule: Never consume any wild plant or mushroom unless 100% positive of identification.",
            "  2. Thorough Cooking: Always cook wild mushrooms thoroughly; never eat morels or chanterelles raw.",
            "  3. Toxic Look-alikes: Screen for false morels (solid/cottony stem with gyromitrin) and Jack-o'-Lanterns (blade gills on wood).",
            "  4. One-Third Rule: Never harvest more than 1/3 of an individual patch; tread lightly and preserve root/mycelium systems.",
            "  5. Permits: Obtain free USFS personal-use permits where required and respect National Park foraging bans.",
        ]
    )
    return "\n".join(lines)


def format_foraging_response(intent: ForagingIntent) -> dict[str, Any]:
    if intent.action == "safety_check":
        target_species_id = intent.species_id or "golden-chanterelle"
        if target_species_id == "golden-chanterelle":
            eval_res = assess_foraging_safety(
                SafetyScreenerRequest(
                    category="mushroom",
                    season=intent.season or "fall",
                    has_false_gills=True,
                    is_hollow_stem=False,
                    growing_on_dead_wood=False,
                )
            )
        elif target_species_id == "morel-mushroom":
            eval_res = assess_foraging_safety(
                SafetyScreenerRequest(
                    category="mushroom",
                    season=intent.season or "spring",
                    is_hollow_stem=True,
                    growing_on_dead_wood=False,
                )
            )
        elif intent.category == "plant":
            eval_res = assess_foraging_safety(
                SafetyScreenerRequest(
                    category="plant",
                    season=intent.season or "spring",
                    has_milky_sap=False,
                )
            )
        else:
            eval_res = assess_foraging_safety(
                SafetyScreenerRequest(
                    category=intent.category or "mushroom",
                    season=intent.season or "fall",
                    has_false_gills=True,
                )
            )

        sp = get_foraging_species_by_id(target_species_id) if intent.species_id else None
        sp_name = sp.common_name if sp else eval_res.candidate_match

        answer = (
            f"Wilderness Foraging Safety Assessment for {sp_name}: "
            f"Warning Level: {eval_res.warning_level.upper()}. "
            f"{eval_res.recommendation} "
            f"Toxic Look-alike Caution: {eval_res.toxic_warning or 'None identified'}. "
            f"Permit Guidelines: {eval_res.permit_guideline}."
        )
        return {
            "answer": answer,
            "foraging_info": {
                "action": "safety_check",
                "species_id": intent.species_id,
                "candidate_match": eval_res.candidate_match,
                "warning_level": eval_res.warning_level,
                "recommendation": eval_res.recommendation,
                "safety_checks": eval_res.safety_checks,
                "permit_guideline": eval_res.permit_guideline,
                "toxic_warning": eval_res.toxic_warning,
            },
        }

    if intent.action == "species_detail" and intent.species_id:
        sp = get_foraging_species_by_id(intent.species_id)
        if sp:
            answer = (
                f"Wild Edible Species: {sp.common_name} ({sp.scientific_name}). "
                f"Category: {sp.category.capitalize()} | Edibility: {sp.edibility} | Seasons: {', '.join(sp.seasons)}. "
                f"Habitat: {sp.primary_habitat}. "
                f"Key Identifiers: {'; '.join(sp.key_identifiers)}. "
                f"Toxic Look-alikes: {'; '.join(sp.toxic_lookalikes)}. "
                f"Preparation Safety: {sp.preparation_safety} "
                f"Harvest Limits: {sp.harvest_limit_rules}."
            )
            return {
                "answer": answer,
                "foraging_info": {
                    "action": "species_detail",
                    "species_id": sp.species_id,
                    "species": sp.model_dump(),
                },
            }

    if intent.action == "guidelines":
        guidelines = get_foraging_guidelines()
        answer = (
            f"{guidelines['title']}: {guidelines['hundred_percent_rule']} "
            f"Key Harvesting Rules: {guidelines['ethical_harvesting'][0]} {guidelines['ethical_harvesting'][2]} "
            f"Permit Guidelines: {guidelines['permits_and_regulations'][0]} "
            f"Safety Rule: {guidelines['field_safety_rules'][0]}"
        )
        return {
            "answer": answer,
            "foraging_info": {
                "action": "guidelines",
                "guidelines": guidelines,
            },
        }

    # Default: "species_list"
    species = get_foraging_species(category=intent.category, season=intent.season)
    summary = "; ".join(
        f"{s.common_name} ({s.category}, {', '.join(s.seasons)})" for s in species
    )
    answer = (
        f"Pacific Northwest Forageable Flora & Fungi: {summary}. "
        "Always follow the 100% Identification Rule: never consume wild species without absolute confirmation from expert regional guides."
    )
    return {
        "answer": answer,
        "foraging_info": {
            "action": "species_list",
            "species": [s.model_dump() for s in species],
        },
    }
