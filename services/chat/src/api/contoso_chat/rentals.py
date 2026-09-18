import re
from typing import Any, Optional

from pydantic import BaseModel


class RentalPackage(BaseModel):
    id: str
    name: str
    category: str
    daily_rate: float
    deposit: float
    description: str
    specs: list[str]
    available_stores: list[str]


class RentalQuoteRequest(BaseModel):
    gear_type: str
    days: int = 1
    store_name: Optional[str] = None


class RentalQuoteResponse(BaseModel):
    package_id: str
    package_name: str
    category: str
    daily_rate: float
    days: int
    discount_percent: float
    discount_amount: float
    subtotal: float
    deposit: float
    total_due: float
    store: Optional[str] = None
    store_available: bool = True
    available_stores: list[str]


class RentalIntent(BaseModel):
    action: str  # "quote", "packages", "availability", "policy"
    gear_type: Optional[str] = None
    days: Optional[int] = None
    store: Optional[str] = None


RENTAL_PACKAGES: list[RentalPackage] = [
    RentalPackage(
        id="camp-bundle-4p",
        name="4-Person Deluxe Camping Package",
        category="camping",
        daily_rate=45.0,
        deposit=100.0,
        description="Complete camping package including 4-person weatherproof tent, sleeping pads, camp stove, and LED lantern.",
        specs=[
            "4-person weatherproof dome tent with rainfly",
            "4 self-inflating insulated sleeping pads",
            "2-burner propane camp stove with windscreen",
            "200-lumen rechargeable LED lantern",
        ],
        available_stores=["Seattle", "Denver", "Portland", "Salt Lake City"],
    ),
    RentalPackage(
        id="backpack-ultralight",
        name="Ultralight Backpacking Kit",
        category="backpacking",
        daily_rate=35.0,
        deposit=75.0,
        description="Lightweight backpacking setup including 55L pack, ultralight 1-person tent, down sleeping quilt, and compact canister stove.",
        specs=[
            "55L lightweight internal frame backpack (adjustable harness)",
            "1-person ultralight 3-season tent with footprint",
            "30°F down sleeping bag with compression sack",
            "Ultralight canister backpacking stove and pot kit",
        ],
        available_stores=["Seattle", "Denver", "Portland", "Salt Lake City"],
    ),
    RentalPackage(
        id="kayak-touring-set",
        name="Touring Kayak & Paddle Set",
        category="paddling",
        daily_rate=50.0,
        deposit=150.0,
        description="Single touring kayak with composite paddle, Type III PFD, spray skirt, and safety bilge pump.",
        specs=[
            "12-foot day-touring kayak with dry hatch storage",
            "Fiberglass 2-piece touring paddle",
            "USCG-approved Type III PFD (Life Jacket)",
            "Neoprene cockpit spray skirt and safety whistle",
        ],
        available_stores=["Seattle", "Portland"],
    ),
    RentalPackage(
        id="snowshoe-alpine-kit",
        name="Alpine Snowshoe & Pole Kit",
        category="winter",
        daily_rate=25.0,
        deposit=50.0,
        description="All-terrain snowshoes with telescoping trekking poles, snow baskets, and water-resistant gaiters.",
        specs=[
            "Lightweight aluminum snowshoes with aggressive crampons",
            "Adjustable telescoping trekking poles with snow baskets",
            "Waterproof breathable trail gaiters",
            "Heavy-duty zippered carrying bag",
        ],
        available_stores=["Denver", "Salt Lake City", "Seattle"],
    ),
]

CATEGORY_ALIASES: dict[str, str] = {
    "camping": "camping",
    "camp": "camping",
    "tent": "camping",
    "tents": "camping",
    "campsite": "camping",
    "camp-bundle-4p": "camping",
    "backpacking": "backpacking",
    "backpack": "backpacking",
    "backpacks": "backpacking",
    "pack": "backpacking",
    "packs": "backpacking",
    "hiking": "backpacking",
    "backpack-ultralight": "backpacking",
    "paddling": "paddling",
    "paddle": "paddling",
    "kayak": "paddling",
    "kayaks": "paddling",
    "kayaking": "paddling",
    "canoe": "paddling",
    "kayak-touring-set": "paddling",
    "winter": "winter",
    "snowshoe": "winter",
    "snowshoes": "winter",
    "snowshoeing": "winter",
    "alpine": "winter",
    "snowshoe-alpine-kit": "winter",
}

STORE_NORMALIZATION: dict[str, str] = {
    "seattle": "Seattle",
    "denver": "Denver",
    "portland": "Portland",
    "salt lake": "Salt Lake City",
    "salt lake city": "Salt Lake City",
    "slc": "Salt Lake City",
}

RENTAL_TRIGGERS: list[str] = [
    r"\brents?\b",
    r"\brentals?\b",
    r"\brenting\b",
    r"\bhire\s+gear\b",
    r"\bdaily\s+rate\b",
    r"\bequipment\s+rental\b",
    r"\breserve\s+gear\b",
    r"\bgear\s+rental\b",
    r"\bquotes?\b",
]


def normalize_store_name(store_name: Optional[str]) -> Optional[str]:
    """Normalizes store name to official catalog title."""
    if not store_name or not isinstance(store_name, str) or not store_name.strip():
        return None
    s = store_name.strip().lower()
    return STORE_NORMALIZATION.get(s, store_name.strip().title())


def get_rental_packages(category: Optional[str] = None) -> list[RentalPackage]:
    """Returns rental packages, optionally filtered by category or alias."""
    if not category or not isinstance(category, str) or not category.strip():
        return [pkg.model_copy() for pkg in RENTAL_PACKAGES]

    cat_clean = category.strip().lower()
    canonical = CATEGORY_ALIASES.get(cat_clean, cat_clean)
    return [
        pkg.model_copy()
        for pkg in RENTAL_PACKAGES
        if pkg.category.lower() == canonical or pkg.category.lower() == cat_clean
    ]


def get_rental_package_by_id_or_name(query: str) -> Optional[RentalPackage]:
    """Finds a rental package by id, full/partial name, category, or alias keyword."""
    if not query or not isinstance(query, str) or not query.strip():
        return None

    q = query.strip().lower()

    # Exact ID match
    for pkg in RENTAL_PACKAGES:
        if pkg.id.lower() == q:
            return pkg.model_copy()

    # Exact Name match
    for pkg in RENTAL_PACKAGES:
        if pkg.name.lower() == q:
            return pkg.model_copy()

    # Substring in package name
    for pkg in RENTAL_PACKAGES:
        if q in pkg.name.lower():
            return pkg.model_copy()

    # Direct category or alias match
    canonical = CATEGORY_ALIASES.get(q)
    if canonical:
        for pkg in RENTAL_PACKAGES:
            if pkg.category.lower() == canonical:
                return pkg.model_copy()

    # Check words in query for aliases
    for word in re.findall(r"\b\w+\b", q):
        word_canonical = CATEGORY_ALIASES.get(word)
        if word_canonical:
            for pkg in RENTAL_PACKAGES:
                if pkg.category.lower() == word_canonical:
                    return pkg.model_copy()

    return None


def calculate_rental_quote(
    gear_type: str,
    days: int = 1,
    store_name: Optional[str] = None,
) -> Optional[RentalQuoteResponse]:
    """Calculates a rental quote including multi-day discount and store pickup validation."""
    pkg = get_rental_package_by_id_or_name(gear_type)
    if not pkg:
        return None

    rental_days = max(1, days)
    daily_rate = pkg.daily_rate
    base_subtotal = round(daily_rate * rental_days, 2)

    # Multi-day discounts: 1-2 days: 0%, 3-6 days: 10%, 7+ days: 20%
    if rental_days >= 7:
        discount_percent = 20.0
    elif rental_days >= 3:
        discount_percent = 10.0
    else:
        discount_percent = 0.0

    discount_amount = round(base_subtotal * (discount_percent / 100.0), 2)
    subtotal = round(base_subtotal - discount_amount, 2)
    deposit = pkg.deposit
    total_due = round(subtotal + deposit, 2)

    norm_store = normalize_store_name(store_name)
    store_available = True
    if norm_store is not None:
        store_available = any(
            norm_store.lower() == s.lower() for s in pkg.available_stores
        )

    return RentalQuoteResponse(
        package_id=pkg.id,
        package_name=pkg.name,
        category=pkg.category,
        daily_rate=daily_rate,
        days=rental_days,
        discount_percent=discount_percent,
        discount_amount=discount_amount,
        subtotal=subtotal,
        deposit=deposit,
        total_due=total_due,
        store=norm_store,
        store_available=store_available,
        available_stores=pkg.available_stores,
    )


def detect_rental_intent(query: str) -> Optional[RentalIntent]:
    """Detects rental inquiries, identifying action (quote, packages, availability, policy), gear_type, days, and store."""
    if not query or not isinstance(query, str) or not query.strip():
        return None

    cleaned = query.strip()
    is_triggered = any(
        re.search(pat, cleaned, re.IGNORECASE) for pat in RENTAL_TRIGGERS
    )
    if not is_triggered:
        return None

    # 1. Extract days
    detected_days: Optional[int] = None
    days_match = re.search(r"\b(\d+)[\s-]*(?:days?|day|d)\b", cleaned, re.IGNORECASE)
    if days_match:
        detected_days = int(days_match.group(1))
    elif re.search(r"\b(?:a\s+|one\s+)?week\b", cleaned, re.IGNORECASE):
        detected_days = 7
    elif re.search(r"\b(\d+)[\s-]*weeks?\b", cleaned, re.IGNORECASE):
        w_match = re.search(r"\b(\d+)[\s-]*weeks?\b", cleaned, re.IGNORECASE)
        if w_match:
            detected_days = int(w_match.group(1)) * 7
    elif re.search(r"\bweekend\b", cleaned, re.IGNORECASE):
        detected_days = 2

    # 2. Extract store
    detected_store: Optional[str] = None
    if re.search(r"\bseattle\b", cleaned, re.IGNORECASE):
        detected_store = "Seattle"
    elif re.search(r"\bdenver\b", cleaned, re.IGNORECASE):
        detected_store = "Denver"
    elif re.search(r"\bportland\b", cleaned, re.IGNORECASE):
        detected_store = "Portland"
    elif re.search(r"\b(?:salt\s+lake(?:\s+city)?|slc)\b", cleaned, re.IGNORECASE):
        detected_store = "Salt Lake City"

    # 3. Extract gear_type
    detected_gear_type: Optional[str] = None
    if re.search(r"\b(?:tents?|camping|camp|camp\s+bundle)\b", cleaned, re.IGNORECASE):
        detected_gear_type = "camping"
    elif re.search(r"\b(?:backpack(?:s|ing)?|rucksack|packs?)\b", cleaned, re.IGNORECASE):
        detected_gear_type = "backpacking"
    elif re.search(r"\b(?:kayaks?|paddling|paddle|canoes?)\b", cleaned, re.IGNORECASE):
        detected_gear_type = "paddling"
    elif re.search(r"\b(?:snowshoes?|snowshoeing|winter)\b", cleaned, re.IGNORECASE):
        detected_gear_type = "winter"

    # 4. Recognize action:
    # - If contains number of days -> "quote"
    # - If contains "available", "store", "pickup in Seattle/Denver/etc." -> "availability"
    # - If contains "policy", "deposit", "cancel" -> "policy"
    # - Otherwise -> "packages"
    if detected_days is not None:
        action = "quote"
    elif re.search(
        r"\b(?:availab(?:le|ility)|in\s+stock|pickup|pick\s+up)\b",
        cleaned,
        re.IGNORECASE,
    ):
        action = "availability"
    elif re.search(
        r"\b(?:polic(?:y|ies)|deposits?|cancellations?|cancel)\b",
        cleaned,
        re.IGNORECASE,
    ):
        action = "policy"
    elif detected_store is not None and re.search(r"\b(?:store|locations?)\b", cleaned, re.IGNORECASE):
        action = "availability"
    else:
        action = "packages"

    return RentalIntent(
        action=action,
        gear_type=detected_gear_type,
        days=detected_days,
        store=detected_store,
    )


def build_rental_prompt(intent: RentalIntent) -> str:
    """Formats helpful system prompt context with rental rates, package specs, discount policies, and store pickup availability."""
    lines = [
        "Contoso Outdoors Official Gear Rental Guidance:",
        f"Detected Action: {intent.action}",
    ]
    if intent.gear_type:
        lines.append(f"Gear Category/Type: {intent.gear_type}")
    if intent.days:
        lines.append(f"Rental Duration: {intent.days} day{'s' if intent.days > 1 else ''}")
    if intent.store:
        lines.append(f"Requested Store Location: {intent.store}")

    lines.append("")
    lines.append("Rental Packages Available:")
    for pkg in RENTAL_PACKAGES:
        stores_str = ", ".join(pkg.available_stores)
        specs_str = "; ".join(pkg.specs)
        lines.append(
            f"- {pkg.name} (ID: {pkg.id}, Category: {pkg.category}): "
            f"${pkg.daily_rate:.2f}/day, refundable deposit: ${pkg.deposit:.2f}. "
            f"Available pickup stores: {stores_str}. Specs: {specs_str}."
        )

    lines.append("")
    lines.append("Discount Policy:")
    lines.append("- 1-2 days: Standard daily rate (0% discount)")
    lines.append("- 3-6 days: 10% multi-day discount")
    lines.append("- 7+ days: 20% extended rental discount")

    lines.append("")
    lines.append("Rental Policies & Terms:")
    lines.append("- Security deposit is fully refundable upon return of equipment in good condition.")
    lines.append("- Free cancellation with full refund up to 48 hours prior to the scheduled pickup date.")
    lines.append("- In-store pickup and return during normal retail store hours.")

    if intent.action == "quote" and intent.gear_type:
        quote = calculate_rental_quote(
            intent.gear_type, days=intent.days or 1, store_name=intent.store
        )
        if quote:
            lines.append("")
            lines.append(f"Calculated Quote for {quote.package_name}:")
            lines.append(f"- Duration: {quote.days} days @ ${quote.daily_rate:.2f}/day")
            lines.append(f"- Multi-day Discount: {quote.discount_percent:.0f}% (-${quote.discount_amount:.2f})")
            lines.append(f"- Rental Subtotal: ${quote.subtotal:.2f}")
            lines.append(f"- Refundable Security Deposit: ${quote.deposit:.2f}")
            lines.append(f"- Total Due at Pickup: ${quote.total_due:.2f}")
            if quote.store:
                avail_txt = "Available" if quote.store_available else "Not available at this store"
                lines.append(f"- Store Pickup ({quote.store}): {avail_txt}")

    lines.append("")
    lines.append("Instructions for Assistant:")
    lines.append("- Provide clear, structured, and helpful responses referencing official Contoso rental packages.")
    lines.append("- Clearly outline daily rates, multi-day discounts, refundable security deposits, and pickup availability.")
    lines.append("- If store pickup is unavailable at the customer's chosen location, clearly inform them and list the stores where pickup is available.")
    lines.append("- Maintain a welcoming, professional, and adventurous outdoor tone.")

    return "\n".join(lines)


def format_rental_response(intent: RentalIntent) -> dict[str, Any]:
    """Formats answer text and structured rental metadata."""
    if intent.action == "quote":
        days = intent.days or 1
        gear = intent.gear_type or "camping"
        quote = calculate_rental_quote(gear, days=days, store_name=intent.store)
        if quote:
            disc_text = (
                f" with a {quote.discount_percent:.0f}% multi-day discount (-${quote.discount_amount:.2f})"
                if quote.discount_percent > 0
                else ""
            )
            store_pickup_text = ""
            if quote.store:
                if quote.store_available:
                    store_pickup_text = f" Pickup is confirmed at our {quote.store} store."
                else:
                    stores_str = ", ".join(quote.available_stores)
                    store_pickup_text = (
                        f" Note: This package is not available for pickup in {quote.store}. "
                        f"It is available at our other stores: {stores_str}."
                    )
            answer = (
                f"Here is your rental quote for the {quote.package_name} for {quote.days} day{'s' if quote.days > 1 else ''}: "
                f"The rental subtotal is ${quote.subtotal:.2f}{disc_text}. "
                f"A refundable security deposit of ${quote.deposit:.2f} is required, for a total due of ${quote.total_due:.2f}."
                f"{store_pickup_text}"
            )
            return {
                "answer": answer,
                "rental_info": {
                    "action": "quote",
                    "quote": quote.model_dump(),
                },
            }
        else:
            answer = (
                f"We couldn't find a rental package matching '{gear}'. "
                "We currently offer: 4-Person Deluxe Camping Package, Ultralight Backpacking Kit, "
                "Touring Kayak & Paddle Set, and Alpine Snowshoe & Pole Kit."
            )
            return {
                "answer": answer,
                "rental_info": {
                    "action": "quote",
                    "error": "package_not_found",
                },
            }

    if intent.action == "availability":
        gear = intent.gear_type or "camping"
        pkg = get_rental_package_by_id_or_name(gear)
        store = intent.store
        if pkg:
            norm_store = normalize_store_name(store) if store else None
            is_avail = any(norm_store.lower() == s.lower() for s in pkg.available_stores) if norm_store else True
            if norm_store:
                if is_avail:
                    answer = (
                        f"Yes, the {pkg.name} is available for rental pickup at our {norm_store} store! "
                        f"The daily rate is ${pkg.daily_rate:.2f}/day with a ${pkg.deposit:.2f} refundable deposit."
                    )
                else:
                    stores_str = ", ".join(pkg.available_stores)
                    answer = (
                        f"The {pkg.name} is currently not available for pickup at our {norm_store} location. "
                        f"However, it is available at our other store locations: {stores_str}. "
                        "You can also check back later or consider other rental options."
                    )
            else:
                stores_str = ", ".join(pkg.available_stores)
                answer = (
                    f"The {pkg.name} is available for pickup at the following store locations: {stores_str}. "
                    f"Daily rate: ${pkg.daily_rate:.2f}/day (deposit: ${pkg.deposit:.2f})."
                )
            return {
                "answer": answer,
                "rental_info": {
                    "action": "availability",
                    "package": pkg.model_dump(),
                    "store": norm_store,
                    "store_available": is_avail if norm_store else True,
                    "available_stores": pkg.available_stores,
                },
            }
        else:
            answer = (
                "Rental gear availability varies by store location. "
                "Our packages include camping tents, backpacking gear, touring kayaks, and alpine snowshoes."
            )
            return {
                "answer": answer,
                "rental_info": {
                    "action": "availability",
                    "packages": [p.model_dump() for p in RENTAL_PACKAGES],
                },
            }

    if intent.action == "policy":
        answer = (
            "Contoso Gear Rental Policies:\n"
            "- Security Deposit: A refundable security deposit is required at pickup ($50-$150 depending on package) "
            "and is fully refunded upon return of gear in good condition.\n"
            "- Cancellation Policy: Free cancellation with a full refund up to 48 hours prior to your scheduled pickup.\n"
            "- Multi-day Discounts: 10% off for 3-6 day rentals, and 20% off for 7+ days.\n"
            "- Pickup & Return: Equipment must be picked up and returned during normal store hours at the designated location."
        )
        return {
            "answer": answer,
            "rental_info": {
                "action": "policy",
                "policies": {
                    "deposit": "Refundable deposit ($50-$150) returned upon gear return in undamaged condition.",
                    "cancellation": "Free cancellation with 100% refund up to 48 hours before reservation date.",
                    "discounts": "10% off 3-6 days, 20% off 7+ days.",
                    "pickup_return": "In-store pickup and return during normal business hours.",
                },
            },
        }

    # Default action: "packages"
    packages = get_rental_packages(intent.gear_type)
    pkg_summaries = [
        f"- {p.name} (${p.daily_rate:.2f}/day, ${p.deposit:.2f} deposit, pickup in {', '.join(p.available_stores)})"
        for p in packages
    ]
    answer = (
        "We offer top-quality outdoor gear rental packages:\n"
        + "\n".join(pkg_summaries)
        + "\n\nMulti-day discounts: 10% off for 3-6 days, 20% off for 7+ days. "
        "All rentals include a refundable security deposit."
    )
    return {
        "answer": answer,
        "rental_info": {
            "action": "packages",
            "packages": [p.model_dump() for p in packages],
            "discount_tiers": {
                "1-2_days": "0%",
                "3-6_days": "10%",
                "7+_days": "20%",
            },
        },
    }
