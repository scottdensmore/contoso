import copy
import re
from typing import Any, Optional

STORE_CATALOG: dict[str, dict[str, Any]] = {
    "seattle": {
        "id": "seattle",
        "name": "Seattle Flagship",
        "address": "220 Pike Street, Seattle, WA 98101",
        "city": "Seattle",
        "state": "WA",
        "state_name": "Washington",
        "zip": "98101",
        "phone": "(206) 555-0142",
        "hours": {
            "weekday": "Mon-Fri 9:00 AM - 8:00 PM",
            "saturday": "Sat 9:00 AM - 8:00 PM",
            "sunday": "Sun 10:00 AM - 6:00 PM",
            "summary": "Mon-Sat 9:00 AM - 8:00 PM, Sun 10:00 AM - 6:00 PM",
        },
        "services": ["in-store pickup", "gear rental", "bike shop", "ski tuning"],
        "has_in_store_pickup": True,
        "has_gear_rental": True,
    },
    "denver": {
        "id": "denver",
        "name": "Denver Mountain Outpost",
        "address": "1450 16th Street, Denver, CO 80202",
        "city": "Denver",
        "state": "CO",
        "state_name": "Colorado",
        "zip": "80202",
        "phone": "(303) 555-0188",
        "hours": {
            "weekday": "Mon-Fri 9:00 AM - 8:00 PM",
            "saturday": "Sat 9:00 AM - 7:00 PM",
            "sunday": "Sun 10:00 AM - 6:00 PM",
            "summary": "Mon-Fri 9:00 AM - 8:00 PM, Sat 9:00 AM - 7:00 PM, Sun 10:00 AM - 6:00 PM",
        },
        "services": ["in-store pickup", "gear rental", "climbing wall"],
        "has_in_store_pickup": True,
        "has_gear_rental": True,
    },
    "portland": {
        "id": "portland",
        "name": "Portland Trailhead",
        "address": "888 SW 5th Ave, Portland, OR 97204",
        "city": "Portland",
        "state": "OR",
        "state_name": "Oregon",
        "zip": "97204",
        "phone": "(503) 555-0123",
        "hours": {
            "weekday": "Mon-Fri 10:00 AM - 7:00 PM",
            "saturday": "Sat 10:00 AM - 7:00 PM",
            "sunday": "Sun 11:00 AM - 5:00 PM",
            "summary": "Mon-Sat 10:00 AM - 7:00 PM, Sun 11:00 AM - 5:00 PM",
        },
        "services": ["in-store pickup", "gear rental", "trail concierge"],
        "has_in_store_pickup": True,
        "has_gear_rental": True,
    },
    "salt-lake-city": {
        "id": "salt-lake-city",
        "name": "Salt Lake City Basecamp",
        "address": "300 S Main St, Salt Lake City, UT 84101",
        "city": "Salt Lake City",
        "state": "UT",
        "state_name": "Utah",
        "zip": "84101",
        "phone": "(801) 555-0167",
        "hours": {
            "weekday": "Mon-Fri 9:00 AM - 8:00 PM",
            "saturday": "Sat 9:00 AM - 8:00 PM",
            "sunday": "Sun 11:00 AM - 5:00 PM",
            "summary": "Mon-Sat 9:00 AM - 8:00 PM, Sun 11:00 AM - 5:00 PM",
        },
        "services": ["in-store pickup", "gear rental", "boot fitting"],
        "has_in_store_pickup": True,
        "has_gear_rental": True,
    },
    "san-francisco": {
        "id": "san-francisco",
        "name": "San Francisco Bay",
        "address": "850 Market Street, San Francisco, CA 94102",
        "city": "San Francisco",
        "state": "CA",
        "state_name": "California",
        "zip": "94102",
        "phone": "(415) 555-0195",
        "hours": {
            "weekday": "Mon-Fri 10:00 AM - 7:00 PM",
            "saturday": "Sat 10:00 AM - 7:00 PM",
            "sunday": "Sun 11:00 AM - 6:00 PM",
            "summary": "Mon-Sat 10:00 AM - 7:00 PM, Sun 11:00 AM - 6:00 PM",
        },
        "services": ["in-store pickup", "gear rental", "kayak demo"],
        "has_in_store_pickup": True,
        "has_gear_rental": True,
    },
}

STORE_GEO_KEYWORDS: dict[str, list[str]] = {
    "seattle": [r"\bseattle\b", r"\bflagship\b", r"\bwashington\b", r"\bwa\b"],
    "denver": [r"\bdenver\b", r"\bcolorado\b", r"\bco\b"],
    "portland": [r"\bportland\b", r"\boregon\b", r"\bor\b"],
    "salt-lake-city": [
        r"\bsalt\s+lake(?:\s+city)?\b",
        r"\bslc\b",
        r"\butah\b",
        r"\but\b",
        r"\bbasecamp\b",
    ],
    "san-francisco": [
        r"\bsan\s+francisco\b",
        r"\bsf\b",
        r"\bbay\s+area\b",
        r"\bcalifornia\b",
        r"\bca\b",
    ],
}

HOURS_PATTERNS = [
    r"\bstore\s+hours\b",
    r"\bwhat\s+time\s+do\s+you\s+(?:open|close)\b",
    r"\bclosing\s+time\b",
    r"\bopening\s+time\b",
    r"\bhours\s+on\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekdays?|weekends?)\b",
    r"\bopen\s+today\b",
    r"\bwhen\s+do\s+you\s+(?:open|close)\b",
    r"\bclose\s+on\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekday|weekend)\b",
    r"\bopen\s+on\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekday|weekend)\b",
    r"\bwhat\s+time\s+does\b.*\b(?:close|open)\b",
    r"\bwhat\s+are\s+your\s+hours\b",
    r"\bwhat\s+time\s+do\s+you\b",
    r"\bwhen\s+are\s+you\s+open\b",
    r"\bwhat\s+hours\b",
    r"\bhours\b",
]

PICKUP_PATTERNS = [
    r"\bin[- ]?store\s+pickup\b",
    r"\bcurbside\s+pickup\b",
    r"\bpick\s*up\s+at\s+store\b",
    r"\bstore\s+pickup\b",
    r"\bcurbside\b",
    r"\bpick\s*up\b.*\bstore\b",
]

LOCATION_PATTERNS = [
    r"\bwhere\s+is\s+(?:your|the)\s+store\b",
    r"\bwhere\s+are\s+(?:your|the)\s+stores\b",
    r"\bnearest\s+store\b",
    r"\bretail\s+stores?\b",
    r"\blocations?\s+in\b",
    r"\bstores?\s+in\b",
    r"\bstore\s+locations?\b",
    r"\bfind\s+a\s+store\b",
    r"\bclosest\s+store\b",
    r"\bwhere\s+can\s+i\s+find\s+a\s+store\b",
    r"\bphysical\s+stores?\b",
    r"\bwhere\s+are\s+you\s+located\b",
    r"\bstore\s+address\b",
    r"\bwhere\s+is\s+your\b",
]


def get_all_stores() -> list[dict[str, Any]]:
    """Returns copies of all stores in the retail catalog."""
    return [copy.deepcopy(store) for store in STORE_CATALOG.values()]


def get_store_by_id(store_id: str) -> Optional[dict[str, Any]]:
    """Case-insensitive lookup by store id."""
    if not isinstance(store_id, str):
        return None
    normalized = store_id.strip().lower()
    if not normalized:
        return None
    store = STORE_CATALOG.get(normalized)
    return copy.deepcopy(store) if store else None


def search_stores(query: str, has_pickup: Optional[bool] = None) -> list[dict[str, Any]]:
    """Searches stores by query matching id, name, city, state, address, or services,
    optionally filtering by in-store pickup availability.
    """
    if not isinstance(query, str):
        query = ""

    normalized_query = query.strip().lower()
    results: list[dict[str, Any]] = []

    for store in STORE_CATALOG.values():
        if has_pickup is not None:
            store_pickup = bool(store.get("has_in_store_pickup"))
            if store_pickup != bool(has_pickup):
                continue

        if not normalized_query:
            results.append(copy.deepcopy(store))
            continue

        searchable_fields = [
            store.get("id", ""),
            store.get("name", ""),
            store.get("address", ""),
            store.get("city", ""),
            store.get("state", ""),
            store.get("state_name", ""),
            store.get("zip", ""),
            store.get("phone", ""),
            " ".join(store.get("services", [])),
        ]
        haystack = " ".join(searchable_fields).lower()

        # If search query matches state abbreviation or words
        terms = normalized_query.split()
        match = False
        for term in terms:
            # Word boundary matching for short terms (e.g. 2-letter state codes)
            if len(term) <= 2:
                if re.search(r"\b" + re.escape(term) + r"\b", haystack, re.IGNORECASE):
                    match = True
                    break
            else:
                if term in haystack:
                    match = True
                    break
        if match:
            results.append(copy.deepcopy(store))

    return results


def detect_store_intent(question: str) -> dict[str, Any]:
    """Analyzes query for store hours, location, in-store pickup, and retail store intent."""
    default_result: dict[str, Any] = {
        "is_store_query": False,
        "intent_type": "general",
        "matched_stores": [],
        "confidence": 0.0,
    }

    if not isinstance(question, str) or not question.strip():
        return default_result

    cleaned = question.strip()

    # 1. Match specific stores by city, state, or name keywords
    matched_store_ids: list[str] = []
    for store_id, patterns in STORE_GEO_KEYWORDS.items():
        for pattern_str in patterns:
            if re.search(pattern_str, cleaned, re.IGNORECASE):
                if store_id not in matched_store_ids:
                    matched_store_ids.append(store_id)
                break

    matched_stores = [
        copy.deepcopy(STORE_CATALOG[sid]) for sid in matched_store_ids if sid in STORE_CATALOG
    ]

    # 2. Check intent keywords: pickup > hours > location
    detected_type: Optional[str] = None

    for pattern_str in PICKUP_PATTERNS:
        if re.search(pattern_str, cleaned, re.IGNORECASE):
            detected_type = "pickup"
            break

    if not detected_type:
        for pattern_str in HOURS_PATTERNS:
            if re.search(pattern_str, cleaned, re.IGNORECASE):
                detected_type = "hours"
                break

    if not detected_type:
        for pattern_str in LOCATION_PATTERNS:
            if re.search(pattern_str, cleaned, re.IGNORECASE):
                detected_type = "location"
                break

    # 3. If no specific intent type yet, but store was explicitly matched with general store term
    if not detected_type and matched_stores:
        if re.search(r"\b(?:stores?|retail|shop|location)\b", cleaned, re.IGNORECASE):
            detected_type = "general"

    if detected_type is None:
        return default_result

    # If an intent was detected but no specific store mentioned, include all stores
    final_stores = matched_stores if matched_stores else get_all_stores()

    return {
        "is_store_query": True,
        "intent_type": detected_type,
        "matched_stores": final_stores,
        "confidence": 1.0,
    }


def build_store_prompt(matched_stores: list[dict[str, Any]], intent_type: str) -> str:
    """Formats grounding context for LLM prompt injection with store names, addresses,
    phone numbers, and schedules.
    """
    lines = [
        "Store Locations & Hours Grounding:",
        f"- Intent: {intent_type.upper() if intent_type else 'GENERAL'}",
        "- Contoso Outdoors Retail Stores:",
    ]

    if not matched_stores:
        lines.append("  (No specific store matched)")
    else:
        for store in matched_stores:
            name = store.get("name", "Contoso Store")
            address = store.get("address", "")
            phone = store.get("phone", "")
            hours = store.get("hours", {})
            weekday_hrs = hours.get("weekday", "Mon-Fri 9:00 AM - 8:00 PM")
            sat_hrs = hours.get("saturday", "Sat 9:00 AM - 8:00 PM")
            sun_hrs = hours.get("sunday", "Sun 10:00 AM - 6:00 PM")
            services = ", ".join(store.get("services", []))

            lines.append(f"  * {name}:")
            lines.append(f"    Address: {address}")
            lines.append(f"    Phone: {phone}")
            lines.append(f"    Hours: Weekdays: {weekday_hrs} | Saturday: {sat_hrs} | Sunday: {sun_hrs}")
            lines.append(f"    Available Services: {services}")

    lines.extend([
        "",
        "Instructions for Assistant:",
        "- Ground your response strictly in the official Contoso Outdoors store information provided above.",
        "- If the customer asks about store hours, accurately state opening and closing times for the requested day(s) (including weekday and weekend hours).",
        "- If the customer asks about store locations, provide the exact address, phone number, and city/state.",
        "- If the customer asks about in-store pickup, confirm whether the store supports it and mention any related services (e.g. gear rental).",
        "- Be professional, helpful, and concise.",
    ])

    return "\n".join(lines)
