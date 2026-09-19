import re
from typing import Any, Optional

from pydantic import BaseModel


class ParkPassInfo(BaseModel):
    pass_id: str
    name: str
    price: float
    duration: str
    coverage: str
    features: list[str]
    purchase_url: Optional[str] = None


class PermitLotteryInfo(BaseModel):
    lottery_id: str
    park_name: str
    zone: str
    lottery_window: str
    results_date: str
    quota_season: str
    fee_per_person: float
    bear_canister_required: bool
    recreation_gov_url: Optional[str] = None


class PermitRegulation(BaseModel):
    regulation_id: str
    category: str
    park_or_region: str
    rule_summary: str
    details: str


class PermitsIntent(BaseModel):
    action: str  # "passes", "lotteries", "regulations", "recommend"
    destination: Optional[str] = None
    pass_type: Optional[str] = None


PARK_PASS_CATALOG: dict[str, ParkPassInfo] = {
    "america-the-beautiful": ParkPassInfo(
        pass_id="america-the-beautiful",
        name="America the Beautiful - National Parks & Federal Recreational Lands Pass",
        price=80.0,
        duration="Annual (valid for 12 full months from purchase month)",
        coverage="All National Parks and 2,000+ federal recreation sites across NPS, USFS, BLM, USFWS, and Reclamation",
        features=[
            "Admits pass owner and accompanying passengers in a private non-commercial vehicle",
            "Covers day-use entrance fees at Mount Rainier, Olympic, Yosemite, Grand Canyon, and 400+ national park units",
            "Honored at US Forest Service and BLM standard amenity day-use recreation sites",
        ],
        purchase_url="https://store.usgs.gov/pass",
    ),
    "senior-pass": ParkPassInfo(
        pass_id="senior-pass",
        name="America the Beautiful Senior Pass",
        price=80.0,
        duration="Lifetime ($80) or Annual ($20 option available)",
        coverage="All US National Parks and federal recreational lands for US citizens or permanent residents age 62+",
        features=[
            "Lifetime access for $80 or an annual pass for $20",
            "Provides a 50% discount on select expanded amenity fees such as camping, swimming, and boat launching",
            "Admits pass owner and passengers in a non-commercial vehicle",
        ],
        purchase_url="https://store.usgs.gov/senior-pass",
    ),
    "military-pass": ParkPassInfo(
        pass_id="military-pass",
        name="America the Beautiful Military Pass",
        price=0.0,
        duration="Annual for Active Duty & Dependents / Lifetime for Veterans & Gold Star Families",
        coverage="Free entrance to all US National Parks and federal recreation lands for US military members and veterans",
        features=[
            "Free annual pass for current US military members and their dependents",
            "Free lifetime pass for US military veterans and Gold Star families",
            "Covers standard amenity fees across all federal recreation agencies",
        ],
        purchase_url="https://www.nps.gov/planyourvisit/passes.htm#military",
    ),
    "fourth-grade-pass": ParkPassInfo(
        pass_id="fourth-grade-pass",
        name="Every Kid Outdoors 4th Grade Pass",
        price=0.0,
        duration="School year (September through the following August 31st)",
        coverage="Free access to all US National Parks and federal public lands for 4th graders and their families",
        features=[
            "Free entry for US 4th graders and their families in one non-commercial private vehicle",
            "Valid September 1 through August 31 of the 4th grade school year",
            "Paper voucher printed at everykidoutdoors.gov can be exchanged for a durable plastic card at park entrances",
        ],
        purchase_url="https://everykidoutdoors.gov",
    ),
    "northwest-forest-pass": ParkPassInfo(
        pass_id="northwest-forest-pass",
        name="Northwest Forest Pass",
        price=30.0,
        duration="Annual (valid for one year from end of purchase month)",
        coverage="USFS trailheads and day-use recreation fee sites in Washington and Oregon (Pacific Northwest)",
        features=[
            "Honored at all US Forest Service day-use sites in Washington and Oregon",
            "Required for trailhead parking at popular Cascade and Olympic National Forest trailheads",
            "Day passes also available for $5; America the Beautiful Interagency passes are also honored",
        ],
        purchase_url="https://www.fs.usda.gov/main/r6/passes-permits/recreation",
    ),
}

BACKCOUNTRY_LOTTERIES: dict[str, PermitLotteryInfo] = {
    "mount-whitney": PermitLotteryInfo(
        lottery_id="mount-whitney",
        park_name="Mount Whitney (Inyo National Forest)",
        zone="Mt. Whitney Zone (Day Use & Overnight)",
        lottery_window="February 1 - March 1",
        results_date="March 15",
        quota_season="May 1 - November 1",
        fee_per_person=15.0,
        bear_canister_required=True,
        recreation_gov_url="https://www.recreation.gov/permits/233260",
    ),
    "the-enchantments": PermitLotteryInfo(
        lottery_id="the-enchantments",
        park_name="The Enchantments (Okanogan-Wenatchee National Forest)",
        zone="Core Enchantment Zone & Outer Zones",
        lottery_window="February 15 - March 1",
        results_date="March 7",
        quota_season="May 15 - October 31",
        fee_per_person=6.0,
        bear_canister_required=True,
        recreation_gov_url="https://www.recreation.gov/permits/233273",
    ),
    "half-dome": PermitLotteryInfo(
        lottery_id="half-dome",
        park_name="Half Dome (Yosemite National Park)",
        zone="Half Dome Cables & Wilderness Trails",
        lottery_window="March 1 - March 31",
        results_date="April 11",
        quota_season="May 24 - October 14",
        fee_per_person=10.0,
        bear_canister_required=True,
        recreation_gov_url="https://www.recreation.gov/permits/234652",
    ),
    "wonderland-trail": PermitLotteryInfo(
        lottery_id="wonderland-trail",
        park_name="Wonderland Trail (Mount Rainier National Park)",
        zone="Mount Rainier Wilderness / Wonderland Trail",
        lottery_window="February 12 - March 4",
        results_date="March 14",
        quota_season="June 1 - October 15",
        fee_per_person=26.0,
        bear_canister_required=False,
        recreation_gov_url="https://www.recreation.gov/permits/4675317",
    ),
    "grand-canyon-backcountry": PermitLotteryInfo(
        lottery_id="grand-canyon-backcountry",
        park_name="Grand Canyon Backcountry (Grand Canyon National Park)",
        zone="Corridor & Remote Wilderness Zones",
        lottery_window="First day of each month (4 months in advance)",
        results_date="End of application month",
        quota_season="Year-round",
        fee_per_person=10.0,
        bear_canister_required=False,
        recreation_gov_url="https://www.recreation.gov/permits/4675314",
    ),
}

PERMIT_REGULATIONS: list[PermitRegulation] = [
    PermitRegulation(
        regulation_id="reg-bear-canisters-sierra-cascades",
        category="bear_canister",
        park_or_region="High Sierra & Cascades (Yosemite, Inyo, Rainier, Enchantments)",
        rule_summary="Hard-sided bear-resistant food canisters are mandatory for all backcountry overnight stays.",
        details=(
            "Approved hard-sided canisters (IGBC or SIBBG certified) must contain all food, trash, and scented toiletries overnight. "
            "Counterbalance food hanging is prohibited due to high bear habituation in the High Sierra (Yosemite, Inyo) and Cascades/Enchantments."
        ),
    ),
    PermitRegulation(
        regulation_id="reg-campfire-elevation-ban",
        category="campfire_restrictions",
        park_or_region="High Elevation Alpine (High Sierra / Cascades)",
        rule_summary="Campfires are strictly prohibited above 9,600ft elevation and during seasonal dry fire restrictions.",
        details=(
            "Wood fires are prohibited above 9,600 feet in the High Sierra and above designated timberlines in the Cascades to protect fragile alpine ecosystems and scarce dead wood. "
            "Only portable gas backpacking stoves with an emergency shut-off valve are permitted."
        ),
    ),
    PermitRegulation(
        regulation_id="reg-wag-bag-packout",
        category="waste_packout",
        park_or_region="Mount Whitney & Mount Rainier Alpine Zones",
        rule_summary="Human waste pack-out (WAG bags) is legally mandatory in high-use alpine and glacier zones.",
        details=(
            "Due to frozen rocky terrain where waste cannot decompose, hikers and climbers on Mount Whitney (entire Mt. Whitney Zone) and Mount Rainier high camps/glacier routes "
            "must carry and use target-issue double-bagged WAG sanitation bags and pack them out to trailhead collection receptacles."
        ),
    ),
    PermitRegulation(
        regulation_id="reg-wilderness-group-limits",
        category="group_limits",
        park_or_region="Wilderness Backcountry (National Parks & Forests)",
        rule_summary="Backcountry wilderness group sizes are strictly limited to a maximum of 8 to 12 persons.",
        details=(
            "To preserve trail conditions and solitude, backcountry travel groups are limited to a maximum of 8 persons traveling cross-country/off-trail "
            "and 12 persons on maintained trails across national park and forest wilderness zones. Splitting larger groups to circumvent quotas is strictly prohibited."
        ),
    ),
]


def get_park_passes(pass_type: Optional[str] = None) -> list[ParkPassInfo]:
    """Returns copies of park passes matching optional pass_type filter."""
    results: list[ParkPassInfo] = []
    for p in PARK_PASS_CATALOG.values():
        if pass_type:
            pt_norm = pass_type.strip().lower()
            if (
                pt_norm not in p.pass_id.lower()
                and pt_norm not in p.name.lower()
                and pt_norm not in p.coverage.lower()
            ):
                continue
        results.append(p.model_copy(deep=True))
    return results


def get_permit_lotteries(park_name: Optional[str] = None) -> list[PermitLotteryInfo]:
    """Returns copies of backcountry permit lotteries matching optional park_name filter."""
    results: list[PermitLotteryInfo] = []
    for lottery in BACKCOUNTRY_LOTTERIES.values():
        if park_name:
            pn_norm = park_name.strip().lower()
            if (
                pn_norm not in lottery.lottery_id.lower()
                and pn_norm not in lottery.park_name.lower()
                and pn_norm not in lottery.zone.lower()
            ):
                continue
        results.append(lottery.model_copy(deep=True))
    return results


def get_permit_regulations(park_or_region: Optional[str] = None) -> list[PermitRegulation]:
    """Returns copies of wilderness regulations matching optional park_or_region or category filter."""
    results: list[PermitRegulation] = []
    for r in PERMIT_REGULATIONS:
        if park_or_region:
            pr_norm = park_or_region.strip().lower()
            if (
                pr_norm not in r.regulation_id.lower()
                and pr_norm not in r.category.lower()
                and pr_norm not in r.park_or_region.lower()
                and pr_norm not in r.rule_summary.lower()
            ):
                continue
        results.append(r.model_copy(deep=True))
    return results


def detect_permits_intent(query: str) -> Optional[PermitsIntent]:
    """Analyzes customer query to detect inquiries regarding national park passes,
    backcountry permit lotteries, and wilderness regulations.
    """
    if not isinstance(query, str) or not query.strip():
        return None

    cleaned = query.strip()
    cleaned_lower = cleaned.lower()

    # Keywords for passes
    pass_keywords = [
        r"\bpark\s+pass(?:es)?\b",
        r"\bnational\s+parks?\s+pass(?:es)?\b",
        r"\bamerica\s+the\s+beautiful\b",
        r"\bsenior\s+pass(?:es)?\b",
        r"\bmilitary\s+pass(?:es)?\b",
        r"\bfourth\s+grade\s+pass(?:es)?\b",
        r"\b4th\s+grade\s+pass(?:es)?\b",
        r"\bevery\s+kid\s+outdoors\b",
        r"\bnorthwest\s+forest\s+pass(?:es)?\b",
        r"\binteragency\s+pass(?:es)?\b",
        r"\bentrance\s+fees?\b",
        r"\bannual\s+pass(?:es)?\b",
    ]

    # Keywords for lotteries & permits
    lottery_keywords = [
        r"\bpermits?\b",
        r"\blotter(?:y|ies)\b",
        r"\bbackcountry\s+permits?\b",
        r"\bquota\s+season\b",
        r"\bquota\b",
        r"\brecreation\.gov\b",
        r"\bhalf\s+dome\s+cables?\b",
        r"\bcore\s+enchantments?\b",
    ]

    # Keywords for regulations
    regulation_keywords = [
        r"\bbear\s+canisters?\b",
        r"\bhard-sided\s+canisters?\b",
        r"\bcampfires?\b",
        r"\bfire\s+bans?\b",
        r"\bfire\s+restrictions?\b",
        r"\b9,?600\s*(?:ft|feet)?\b",
        r"\bwag\s+bags?\b",
        r"\bhuman\s+waste\s+pack[- ]?out\b",
        r"\bwaste\s+pack[- ]?out\b",
        r"\bgroup\s+limits?\b",
        r"\bgroup\s+size\b",
        r"\bwilderness\s+regulations?\b",
        r"\bwilderness\s+rules?\b",
    ]

    has_pass = any(re.search(pat, cleaned_lower) for pat in pass_keywords)
    has_lottery = any(re.search(pat, cleaned_lower) for pat in lottery_keywords)
    has_reg = any(re.search(pat, cleaned_lower) for pat in regulation_keywords)

    # Check for known park / destination names
    destination: Optional[str] = None
    dest_matches: list[str] = []

    if re.search(r"\b(?:mount\s+whitney|mt\.?\s+whitney|whitney)\b", cleaned_lower):
        dest_matches.append("Mount Whitney")
    if re.search(r"\b(?:the\s+enchantments|enchantments|colchuck)\b", cleaned_lower):
        dest_matches.append("The Enchantments")
    if re.search(r"\b(?:half\s+dome|yosemite)\b", cleaned_lower):
        dest_matches.append("Half Dome (Yosemite)")
    if re.search(r"\b(?:wonderland(?:\s+trail)?|mount\s+rainier|mt\.?\s+rainier|rainier)\b", cleaned_lower):
        dest_matches.append("Mount Rainier / Wonderland Trail")
    if re.search(r"\b(?:olympic(?:\s+national\s+park)?)\b", cleaned_lower):
        dest_matches.append("Olympic National Park")
    if re.search(r"\b(?:grand\s+canyon)\b", cleaned_lower):
        dest_matches.append("Grand Canyon")
    if re.search(r"\b(?:high\s+sierra|sierra(?:\s+nevada)?)\b", cleaned_lower):
        dest_matches.append("High Sierra")
    if re.search(r"\b(?:cascades?|north\s+cascades)\b", cleaned_lower):
        dest_matches.append("Cascades")

    if dest_matches:
        destination = " & ".join(dest_matches)

    # Detect pass type
    pass_type: Optional[str] = None
    if re.search(r"\bsenior\b", cleaned_lower):
        pass_type = "senior"
    elif re.search(r"\bmilitary|veteran\b", cleaned_lower):
        pass_type = "military"
    elif re.search(r"\b4th\s+grade|fourth\s+grade|every\s+kid\b", cleaned_lower):
        pass_type = "fourth-grade"
    elif re.search(r"\bnorthwest\s+forest|nw\s+forest\b", cleaned_lower):
        pass_type = "northwest-forest"
    elif re.search(r"\bamerica\s+the\s+beautiful\b", cleaned_lower):
        pass_type = "america-the-beautiful"

    # If neither pass, lottery, reg keywords nor destination matched, it's not a permits query
    if not (has_pass or has_lottery or has_reg or destination or pass_type):
        return None

    # Determine action
    # Priority: regulations -> passes / recommend -> lotteries
    action: str = "passes"
    if has_reg:
        action = "regulations"
    elif re.search(r"\b(?:recommend|suggest|which\s+pass\s+should|best\s+pass)\b", cleaned_lower):
        action = "recommend"
    elif has_lottery or (destination and any(k in destination for k in ["Whitney", "Enchantments", "Half Dome", "Wonderland"]) and not has_pass):
        action = "lotteries"
    elif has_pass or pass_type:
        action = "passes"
    elif destination:
        action = "lotteries"

    return PermitsIntent(
        action=action,
        destination=destination,
        pass_type=pass_type,
    )


def build_permits_prompt(intent: PermitsIntent) -> str:
    """Builds grounding context for LLM prompt injection with pass catalog,
    lottery windows, and wilderness regulations.
    """
    lines = [
        "Contoso Outdoors Official Backcountry Permits & National Parks Pass Grounding:",
        f"- Detected Intent Action: {intent.action.upper()}",
    ]
    if intent.destination:
        lines.append(f"- Destination / Region: {intent.destination}")
    if intent.pass_type:
        lines.append(f"- Pass Type: {intent.pass_type}")

    lines.append("")
    lines.append("- National Parks & Federal Pass Catalog:")
    passes = get_park_passes(intent.pass_type)
    for p in passes:
        lines.append(f"  * {p.name}: ${p.price:.2f} ({p.duration})")
        lines.append(f"    Coverage: {p.coverage}")
        lines.append(f"    Features: {'; '.join(p.features)}")
        if p.purchase_url:
            lines.append(f"    Purchase / Info: {p.purchase_url}")

    lines.append("")
    lines.append("- Backcountry Quota Lotteries & Permits:")
    lotteries = get_permit_lotteries(intent.destination)
    for lottery in lotteries:
        lines.append(f"  * {lottery.park_name} - Zone: {lottery.zone}")
        lines.append(f"    Lottery Window: {lottery.lottery_window} | Results Date: {lottery.results_date} | Quota Season: {lottery.quota_season}")
        lines.append(f"    Fee: ${lottery.fee_per_person:.2f}/person | Bear Canister Required: {lottery.bear_canister_required}")
        if lottery.recreation_gov_url:
            lines.append(f"    Recreation.gov Portal: {lottery.recreation_gov_url}")

    lines.append("")
    lines.append("- Wilderness Regulations & Protection Policies:")
    regulations = get_permit_regulations(intent.destination)
    for r in regulations:
        lines.append(f"  * [{r.category.upper()}] {r.park_or_region}: {r.rule_summary}")
        lines.append(f"    Details: {r.details}")

    lines.extend([
        "",
        "Instructions for Assistant:",
        "- Ground responses strictly in the official Contoso Outdoors permit and pass guidelines above.",
        "- For backcountry permits, direct users to Recreation.gov for official lottery submission windows.",
        "- Always emphasize bear canister requirements (High Sierra & Cascades) and WAG bag waste pack-out mandates (Whitney & Rainier).",
        "- For park passes, highlight that America the Beautiful ($80) covers all National Parks (Rainier, Olympic, Yosemite, etc.), while Northwest Forest Pass ($30) covers USFS sites in WA/OR.",
        "- Note free passes ($0) for US Military/Veterans and 4th Graders, and senior discounts ($80 lifetime / $20 annual).",
    ])

    return "\n".join(lines)


def format_permits_response(intent: PermitsIntent) -> dict[str, Any]:
    """Returns formatted human-readable answer and structured permits_info payload."""
    passes_list = get_park_passes(intent.pass_type)
    lotteries_list = get_permit_lotteries(intent.destination)
    regulations_list = get_permit_regulations(intent.destination)

    # Filter lotteries by destination if specified
    matched_lotteries = lotteries_list
    if intent.destination:
        dest_lower = intent.destination.lower()
        matched = [
            lottery for lottery in BACKCOUNTRY_LOTTERIES.values()
            if any(part.strip() in lottery.park_name.lower() or part.strip() in lottery.lottery_id.lower()
                   for part in re.split(r"&|or|,|and", dest_lower))
        ]
        if matched:
            matched_lotteries = matched

    # Filter passes by destination or pass type
    matched_passes = passes_list
    if intent.destination:
        dest_lower = intent.destination.lower()
        if "rainier" in dest_lower or "olympic" in dest_lower:
            # America the beautiful covers national parks, NW forest covers USFS
            matched_passes = [
                PARK_PASS_CATALOG["america-the-beautiful"].model_copy(deep=True),
                PARK_PASS_CATALOG["northwest-forest-pass"].model_copy(deep=True),
            ]

    permits_info: dict[str, Any] = {
        "action": intent.action,
        "destination": intent.destination,
        "pass_type": intent.pass_type,
        "passes": [p.model_dump() for p in matched_passes],
        "lotteries": [lottery.model_dump() for lottery in matched_lotteries],
        "regulations": [r.model_dump() for r in regulations_list],
    }

    if intent.action == "lotteries":
        lottery_details = []
        for lottery in matched_lotteries:
            canister_txt = "Hard-sided bear canisters are mandatory." if lottery.bear_canister_required else "Bear canisters recommended/food lockers provided."
            url_txt = f"Apply on Recreation.gov ({lottery.recreation_gov_url})." if lottery.recreation_gov_url else "Apply on Recreation.gov."
            lottery_details.append(
                f"{lottery.park_name} ({lottery.zone}): Lottery application window is {lottery.lottery_window} (results announced {lottery.results_date}). "
                f"Quota season runs {lottery.quota_season} with a ${lottery.fee_per_person:.2f}/person fee. {canister_txt} {url_txt}"
            )
        answer = (
            "Yes, permits are required! Here are the backcountry permit and lottery details: "
            + " ".join(lottery_details)
            + " Make sure to check Recreation.gov for lottery dates and submit your reservation early."
        )

    elif intent.action == "regulations":
        reg_details = []
        for r in regulations_list:
            reg_details.append(f"{r.park_or_region} ({r.category}): {r.rule_summary} {r.details}")
        answer = (
            "Here are the wilderness backcountry regulations you should know: "
            + " ".join(reg_details)
        )

    elif intent.action in ["passes", "recommend"]:
        if intent.destination and ("rainier" in intent.destination.lower() or "olympic" in intent.destination.lower()):
            answer = (
                "The America the Beautiful - National Parks & Federal Recreational Lands Pass ($80 annual) covers entrance fees "
                "for both Mount Rainier National Park and Olympic National Park, as well as 2,000+ federal recreation sites nationwide! "
                "If you also hike on US Forest Service trailheads in Washington and Oregon, the Northwest Forest Pass is $30 annual (or covered by the America the Beautiful pass). "
                "Discounted passes are also available: Senior Pass ($80 lifetime or $20 annual for ages 62+), Military Pass (Free $0 for active duty, veterans, and Gold Star families), "
                "and Every Kid Outdoors Pass (Free $0 for 4th graders and families)."
            )
        else:
            pass_summaries = [
                f"{p.name}: ${p.price:.2f} ({p.duration}) - {p.coverage}"
                for p in matched_passes
            ]
            answer = (
                "Here are the available national park passes and federal recreation permits: "
                + "; ".join(pass_summaries)
                + ". The America the Beautiful pass ($80) is the best choice if you plan to visit two or more national parks within 12 months!"
            )
    else:
        answer = (
            "Contoso Outdoors Backcountry Permits & Passes: We can assist with national park pass options "
            "(America the Beautiful $80, Senior Pass, Military Pass, Northwest Forest Pass), backcountry permit lotteries "
            "(Mount Whitney, The Enchantments, Half Dome, Wonderland Trail), and wilderness regulations (bear canisters, WAG bags, fire bans)."
        )

    return {
        "answer": answer,
        "permits_info": permits_info,
    }
