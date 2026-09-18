import re
from typing import Any, Optional

from pydantic import BaseModel


class SizingRow(BaseModel):
    size: str
    measurements: dict[str, str]  # e.g. {"chest_in": "39-41", "chest_cm": "99-104"}
    fit_notes: Optional[str] = None


class CategorySizeGuide(BaseModel):
    category: str
    title: str
    description: str
    measurement_instructions: str
    rows: list[SizingRow]


class SizeRecommendation(BaseModel):
    category: str
    recommended_size: str
    advice: str
    measurement_input: float
    unit: str


SIZING_CATALOG: dict[str, CategorySizeGuide] = {
    "jackets": CategorySizeGuide(
        category="jackets",
        title="Jackets & Outerwear Sizing Guide",
        description="Official sizing specifications and body measurements for Contoso jackets, parkas, and outerwear.",
        measurement_instructions="Chest: Measure around the fullest part of your chest, keeping tape level under arms. Waist: Measure around your natural waistline, keeping tape comfortably loose.",
        rows=[
            SizingRow(
                size="XS",
                measurements={
                    "chest_in": "33-35",
                    "chest_cm": "84-89",
                    "waist_in": "27-29",
                    "waist_cm": "68-74",
                },
                fit_notes="Slim athletic fit; consider sizing up if wearing thick winter layers.",
            ),
            SizingRow(
                size="S",
                measurements={
                    "chest_in": "36-38",
                    "chest_cm": "91-97",
                    "waist_in": "30-32",
                    "waist_cm": "76-81",
                },
                fit_notes="Tailored fit designed for active movement.",
            ),
            SizingRow(
                size="M",
                measurements={
                    "chest_in": "39-41",
                    "chest_cm": "99-104",
                    "waist_in": "33-35",
                    "waist_cm": "84-89",
                },
                fit_notes="Standard regular fit with room for midlayers.",
            ),
            SizingRow(
                size="L",
                measurements={
                    "chest_in": "42-44",
                    "chest_cm": "107-112",
                    "waist_in": "36-38",
                    "waist_cm": "91-97",
                },
                fit_notes="Relaxed fit allowing unrestricted shoulder mobility.",
            ),
            SizingRow(
                size="XL",
                measurements={
                    "chest_in": "45-48",
                    "chest_cm": "114-122",
                    "waist_in": "39-42",
                    "waist_cm": "99-107",
                },
                fit_notes="Generous cut suitable for heavy expedition layering.",
            ),
            SizingRow(
                size="XXL",
                measurements={
                    "chest_in": "49-52",
                    "chest_cm": "124-132",
                    "waist_in": "43-46",
                    "waist_cm": "109-117",
                },
                fit_notes="Full comfort cut for maximum coverage and warmth.",
            ),
        ],
    ),
    "footwear": CategorySizeGuide(
        category="footwear",
        title="Footwear & Boots Sizing Guide",
        description="US and EU sizing conversions with foot length guidelines for Contoso hiking boots and trail shoes.",
        measurement_instructions="Stand on a flat surface with your heel against a wall. Measure from heel to longest toe in inches or cm. For hiking boots, measure while wearing hiking socks.",
        rows=[
            SizingRow(
                size="US 7",
                measurements={
                    "us": "7",
                    "eu": "40",
                    "foot_length_in": "9.8",
                    "foot_length_cm": "25.0",
                },
                fit_notes="Standard medium (D) width.",
            ),
            SizingRow(
                size="US 7.5",
                measurements={
                    "us": "7.5",
                    "eu": "40.5",
                    "foot_length_in": "10.0",
                    "foot_length_cm": "25.4",
                },
                fit_notes="True to size.",
            ),
            SizingRow(
                size="US 8",
                measurements={
                    "us": "8",
                    "eu": "41",
                    "foot_length_in": "10.2",
                    "foot_length_cm": "26.0",
                },
                fit_notes="True to size.",
            ),
            SizingRow(
                size="US 8.5",
                measurements={
                    "us": "8.5",
                    "eu": "42",
                    "foot_length_in": "10.4",
                    "foot_length_cm": "26.5",
                },
                fit_notes="True to size.",
            ),
            SizingRow(
                size="US 9",
                measurements={
                    "us": "9",
                    "eu": "42.5",
                    "foot_length_in": "10.6",
                    "foot_length_cm": "27.0",
                },
                fit_notes="True to size; ample toe room for downhill trekking.",
            ),
            SizingRow(
                size="US 9.5",
                measurements={
                    "us": "9.5",
                    "eu": "43",
                    "foot_length_in": "10.8",
                    "foot_length_cm": "27.5",
                },
                fit_notes="True to size.",
            ),
            SizingRow(
                size="US 10",
                measurements={
                    "us": "10",
                    "eu": "44",
                    "foot_length_in": "11.0",
                    "foot_length_cm": "28.0",
                },
                fit_notes="True to size.",
            ),
            SizingRow(
                size="US 10.5",
                measurements={
                    "us": "10.5",
                    "eu": "44.5",
                    "foot_length_in": "11.2",
                    "foot_length_cm": "28.5",
                },
                fit_notes="True to size.",
            ),
            SizingRow(
                size="US 11",
                measurements={
                    "us": "11",
                    "eu": "45",
                    "foot_length_in": "11.4",
                    "foot_length_cm": "29.0",
                },
                fit_notes="True to size.",
            ),
            SizingRow(
                size="US 11.5",
                measurements={
                    "us": "11.5",
                    "eu": "45.5",
                    "foot_length_in": "11.6",
                    "foot_length_cm": "29.5",
                },
                fit_notes="True to size.",
            ),
            SizingRow(
                size="US 12",
                measurements={
                    "us": "12",
                    "eu": "46",
                    "foot_length_in": "11.8",
                    "foot_length_cm": "30.0",
                },
                fit_notes="True to size.",
            ),
            SizingRow(
                size="US 13",
                measurements={
                    "us": "13",
                    "eu": "47",
                    "foot_length_in": "12.2",
                    "foot_length_cm": "31.0",
                },
                fit_notes="True to size.",
            ),
        ],
    ),
    "tents": CategorySizeGuide(
        category="tents",
        title="Tents Capacity & Floor Sizing Guide",
        description="Capacity, floor dimensions, and interior living area specifications for Contoso camping and backpacking tents.",
        measurement_instructions="Consider the number of campers plus interior gear storage. For longer trips or bulky gear, consider sizing up one person capacity.",
        rows=[
            SizingRow(
                size="2-Person",
                measurements={
                    "capacity": "2-Person",
                    "floor_dimensions": "88 x 52 in",
                    "floor_dimensions_cm": "224 x 132 cm",
                    "floor_area": "31.7 sq ft",
                    "floor_area_sqm": "2.9 sq m",
                    "peak_height": "42 in",
                },
                fit_notes="Compact backpacking profile; dual vestibules provide exterior gear storage.",
            ),
            SizingRow(
                size="3-Person",
                measurements={
                    "capacity": "3-Person",
                    "floor_dimensions": "90 x 70 in",
                    "floor_dimensions_cm": "229 x 178 cm",
                    "floor_area": "43.5 sq ft",
                    "floor_area_sqm": "4.0 sq m",
                    "peak_height": "46 in",
                },
                fit_notes="Spacious for 2 campers plus interior packs, or snug for 3 adults.",
            ),
            SizingRow(
                size="4-Person",
                measurements={
                    "capacity": "4-Person",
                    "floor_dimensions": "96 x 86 in",
                    "floor_dimensions_cm": "244 x 218 cm",
                    "floor_area": "57.3 sq ft",
                    "floor_area_sqm": "5.3 sq m",
                    "peak_height": "52 in",
                },
                fit_notes="Great for small families or weekend basecamps with generous headroom.",
            ),
            SizingRow(
                size="6-Person",
                measurements={
                    "capacity": "6-Person",
                    "floor_dimensions": "120 x 100 in",
                    "floor_dimensions_cm": "305 x 254 cm",
                    "floor_area": "83.3 sq ft",
                    "floor_area_sqm": "7.7 sq m",
                    "peak_height": "72 in",
                },
                fit_notes="Standing-height cabin tent ideal for extended family camping trips.",
            ),
        ],
    ),
    "backpacks": CategorySizeGuide(
        category="backpacks",
        title="Backpacks Torso & Fit Sizing Guide",
        description="Torso length and hip belt sizing guide for Contoso technical backpacking packs and daypacks.",
        measurement_instructions="Measure along spine from C7 vertebra (base of neck) to the imaginary line connecting the tops of your iliac crests (hip bones).",
        rows=[
            SizingRow(
                size="S/M",
                measurements={
                    "torso_range_in": "15-18",
                    "torso_range_cm": "38-46",
                    "waist_belt": "26-32 in",
                    "waist_belt_cm": "66-81 cm",
                },
                fit_notes="Engineered for shorter torso heights; shoulder straps curve ergonomically.",
            ),
            SizingRow(
                size="M/L",
                measurements={
                    "torso_range_in": "18-21",
                    "torso_range_cm": "46-53",
                    "waist_belt": "30-36 in",
                    "waist_belt_cm": "76-91 cm",
                },
                fit_notes="Most common adult fit; fully adjustable load lifters and lumbar support.",
            ),
            SizingRow(
                size="L/XL",
                measurements={
                    "torso_range_in": "21-24",
                    "torso_range_cm": "53-61",
                    "waist_belt": "34-42 in",
                    "waist_belt_cm": "86-107 cm",
                },
                fit_notes="Extended back panel frame designed for taller hikers and broader shoulders.",
            ),
        ],
    ),
}

CATEGORY_ALIASES: dict[str, str] = {
    "jackets": "jackets",
    "jacket": "jackets",
    "apparel": "jackets",
    "clothing": "jackets",
    "outerwear": "jackets",
    "coat": "jackets",
    "coats": "jackets",
    "parka": "jackets",
    "parkas": "jackets",
    "hoodie": "jackets",
    "hoodies": "jackets",
    "shirt": "jackets",
    "shirts": "jackets",
    "sweater": "jackets",
    "sweaters": "jackets",
    "fleece": "jackets",
    "vest": "jackets",
    "vests": "jackets",
    "footwear": "footwear",
    "boots": "footwear",
    "boot": "footwear",
    "shoes": "footwear",
    "shoe": "footwear",
    "sneakers": "footwear",
    "sneaker": "footwear",
    "tents": "tents",
    "tent": "tents",
    "shelter": "tents",
    "shelters": "tents",
    "backpacks": "backpacks",
    "backpack": "backpacks",
    "packs": "backpacks",
    "pack": "backpacks",
    "daypack": "backpacks",
    "daypacks": "backpacks",
    "rucksack": "backpacks",
    "rucksacks": "backpacks",
}


def get_size_guide(category: str) -> Optional[CategorySizeGuide]:
    """Retrieves the category sizing guide if available."""
    if not isinstance(category, str) or not category.strip():
        return None
    canonical = CATEGORY_ALIASES.get(category.strip().lower())
    if canonical and canonical in SIZING_CATALOG:
        return SIZING_CATALOG[canonical].model_copy()
    return None


def recommend_size(
    category: str,
    measurement: float,
    unit: str = "in",
) -> Optional[SizeRecommendation]:
    """Recommends a size based on category, measurement value, and unit."""
    if not isinstance(category, str) or not category.strip():
        return None
    if not isinstance(measurement, (int, float)) or measurement <= 0:
        return None

    canonical = CATEGORY_ALIASES.get(category.strip().lower())
    if not canonical:
        return None

    unit_clean = unit.strip().lower() if isinstance(unit, str) and unit.strip() else "in"

    if canonical == "jackets":
        is_cm = unit_clean in ("cm", "centimeter", "centimeters", "centimetres")
        if is_cm:
            val = float(measurement)
            if val < 90.0:
                recommended = "XS"
            elif val < 98.0:
                recommended = "S"
            elif val < 105.0:
                recommended = "M"
            elif val < 113.0:
                recommended = "L"
            elif val < 123.0:
                recommended = "XL"
            else:
                recommended = "XXL"
        else:
            val = float(measurement)
            if val < 35.5:
                recommended = "XS"
            elif val < 38.5:
                recommended = "S"
            elif val < 41.5:
                recommended = "M"
            elif val < 44.5:
                recommended = "L"
            elif val < 48.5:
                recommended = "XL"
            else:
                recommended = "XXL"

        advice = (
            f"Based on your {measurement:g} {unit_clean} chest measurement, size {recommended} provides the best fit. "
            "If you plan to layer thick fleece or down garments underneath, we suggest sizing up one size."
        )
        return SizeRecommendation(
            category=canonical,
            recommended_size=recommended,
            advice=advice,
            measurement_input=float(measurement),
            unit=unit_clean,
        )

    if canonical == "footwear":
        is_cm = unit_clean in ("cm", "centimeter", "centimeters", "centimetres") or measurement >= 20.0
        if is_cm:
            cm_val = float(measurement)
            cm_table = [
                (25.2, "US 7"),
                (25.7, "US 7.5"),
                (26.2, "US 8"),
                (26.7, "US 8.5"),
                (27.2, "US 9"),
                (27.7, "US 9.5"),
                (28.2, "US 10"),
                (28.7, "US 10.5"),
                (29.2, "US 11"),
                (29.7, "US 11.5"),
                (30.5, "US 12"),
                (999.0, "US 13"),
            ]
            recommended = next(s for thresh, s in cm_table if cm_val <= thresh)
        elif unit_clean in ("us", "size") and 7.0 <= measurement <= 15.0:
            recommended = f"US {measurement:g}"
        else:
            in_val = float(measurement)
            in_table = [
                (9.9, "US 7"),
                (10.1, "US 7.5"),
                (10.3, "US 8"),
                (10.5, "US 8.5"),
                (10.7, "US 9"),
                (10.9, "US 9.5"),
                (11.1, "US 10"),
                (11.3, "US 10.5"),
                (11.5, "US 11"),
                (11.7, "US 11.5"),
                (12.0, "US 12"),
                (999.0, "US 13"),
            ]
            recommended = next(s for thresh, s in in_table if in_val <= thresh)

        advice = (
            f"For a foot measurement of {measurement:g} {unit_clean}, we recommend {recommended}. "
            "For hiking boots, consider ordering half a size up if you wear heavy wool socks or expect foot swelling."
        )
        return SizeRecommendation(
            category=canonical,
            recommended_size=recommended,
            advice=advice,
            measurement_input=float(measurement),
            unit=unit_clean,
        )

    if canonical == "backpacks":
        is_cm = unit_clean in ("cm", "centimeter", "centimeters", "centimetres") or measurement > 30.0
        val = float(measurement)
        if is_cm:
            if val < 46.0:
                recommended = "S/M"
            elif val < 53.0:
                recommended = "M/L"
            else:
                recommended = "L/XL"
        else:
            if val < 18.0:
                recommended = "S/M"
            elif val < 21.0:
                recommended = "M/L"
            else:
                recommended = "L/XL"

        advice = (
            f"For a {measurement:g} {unit_clean} torso length, size {recommended} ensures the hip belt rests properly "
            "on your iliac crest to transfer weight efficiently."
        )
        return SizeRecommendation(
            category=canonical,
            recommended_size=recommended,
            advice=advice,
            measurement_input=float(measurement),
            unit=unit_clean,
        )

    if canonical == "tents":
        count = int(measurement)
        if count <= 2:
            recommended = "2-Person"
        elif count == 3:
            recommended = "3-Person"
        elif count <= 4:
            recommended = "4-Person"
        else:
            recommended = "6-Person"

        advice = (
            f"For {count} camper{'s' if count > 1 else ''}, a {recommended} tent provides comfortable sleeping capacity. "
            "If you plan to store bulky packs inside or bring pets, consider sizing up one capacity category."
        )
        return SizeRecommendation(
            category=canonical,
            recommended_size=recommended,
            advice=advice,
            measurement_input=float(measurement),
            unit=unit_clean,
        )

    return None


SIZING_TRIGGER_PATTERNS = [
    r"\bwhat\s+size\b",
    r"\bwhich\s+size\b",
    r"\bsizing\s+guide\b",
    r"\bsize\s+guide\b",
    r"\bhow\s+does\s+it\s+fit\b",
    r"\bhow\s+do\s+\w+\s+fit\b",
    r"\bsize\s+chart\b",
    r"\bsizing\s+chart\b",
    r"\bruns?\s+small\b",
    r"\bruns?\s+large\b",
    r"\btent\s+capacity\b",
    r"\bshoe\s+size\b",
    r"\bboot\s+size\b",
    r"\bchest\s+measurement\b",
    r"\btorso\s+length\b",
    r"\btorso\s+measurement\b",
    r"\bfits?\s+true\s+to\s+size\b",
    r"\btrue\s+to\s+size\b",
    r"\bsizing\b",
    r"\bfit\s+advice\b",
    r"\brecommend(?:ed)?\s+size\b",
]

CATEGORY_DETECTION_PATTERNS: dict[str, list[str]] = {
    "jackets": [
        r"\b(?:jackets?|coats?|parkas?|outerwear|apparel|clothing|hoodies?|shirts?|vests?|sweaters?|fleece)\b",
        r"\bchest\b",
        r"\bwaist\b",
    ],
    "footwear": [
        r"\b(?:footwear|boots?|shoes?|sneakers?|hiking\s+boots?|trail\s+runners?)\b",
        r"\bshoe\s+size\b",
        r"\bboot\s+size\b",
        r"\bfeet\b",
        r"\bfoot\b",
    ],
    "tents": [
        r"\b(?:tents?|shelters?|canop(?:y|ies))\b",
        r"\btent\s+capacity\b",
    ],
    "backpacks": [
        r"\b(?:backpacks?|packs?|daypacks?|rucksacks?)\b",
        r"\btorso\b",
    ],
}


def detect_sizing_intent(question: str) -> dict[str, Any]:
    """Detects sizing intent from user questions, extracting category and measurement if available."""
    default_res: dict[str, Any] = {
        "is_sizing_intent": False,
        "category": None,
        "size_guide": None,
        "recommendation": None,
    }
    if not isinstance(question, str) or not question.strip():
        return default_res

    cleaned = question.strip()
    is_triggered = any(re.search(pat, cleaned, re.IGNORECASE) for pat in SIZING_TRIGGER_PATTERNS)
    if not is_triggered:
        return default_res

    # Detect category
    detected_category: Optional[str] = None
    for cat, patterns in CATEGORY_DETECTION_PATTERNS.items():
        if any(re.search(p, cleaned, re.IGNORECASE) for p in patterns):
            detected_category = cat
            break

    # Extract measurement if present
    extracted_val: Optional[float] = None
    extracted_unit: str = "in"

    # Match tent campers/people: e.g. "4 people", "4 person", "4 campers"
    tent_match = re.search(r"\b(\d+)\s*(?:people|persons?|campers?|p)\b", cleaned, re.IGNORECASE)
    if tent_match:
        extracted_val = float(tent_match.group(1))
        extracted_unit = "person"
        if not detected_category:
            detected_category = "tents"

    # Match length/dimension: e.g. "40 inch chest", "40 inches", "10.6 inch foot", "27 cm", "42 in"
    dim_match = re.search(
        r"(\d+(?:\.\d+)?)\s*(inch(?:es)?|in|\"|cm|centimeters?|centimetres?)\b",
        cleaned,
        re.IGNORECASE,
    )
    if dim_match:
        extracted_val = float(dim_match.group(1))
        raw_unit = dim_match.group(2).lower()
        extracted_unit = "cm" if raw_unit.startswith("cm") or "cent" in raw_unit else "in"

    # Match queries like "chest measurement is 42", "torso length is 19"
    if extracted_val is None:
        explicit_match = re.search(
            r"\b(?:chest|torso|waist|foot|shoe\s+size)(?:\s+length|\s+measurement)?(?:\s+is|\s+of)?\s*(\d+(?:\.\d+)?)\b",
            cleaned,
            re.IGNORECASE,
        )
        if explicit_match:
            extracted_val = float(explicit_match.group(1))
            extracted_unit = "in"

    size_guide = get_size_guide(detected_category) if detected_category else None

    recommendation: Optional[SizeRecommendation] = None
    if detected_category and extracted_val is not None:
        recommendation = recommend_size(detected_category, extracted_val, extracted_unit)

    return {
        "is_sizing_intent": True,
        "category": detected_category,
        "size_guide": size_guide,
        "recommendation": recommendation,
    }


def build_sizing_prompt(
    size_guide: Optional[CategorySizeGuide],
    recommendation: Optional[SizeRecommendation],
    question: str,
) -> str:
    """Formats official sizing and fit guidance for LLM prompt injection."""
    if not size_guide and not recommendation:
        return ""

    lines = [
        "Contoso Outdoors Official Sizing & Fit Guidance:",
        f"Customer Question: {question}",
        "",
    ]

    if size_guide:
        lines.append(f"Size Guide: {size_guide.title} (Category: {size_guide.category})")
        lines.append(f"Description: {size_guide.description}")
        lines.append(f"Measurement Instructions: {size_guide.measurement_instructions}")
        lines.append("Size Chart:")
        for row in size_guide.rows:
            meas_str = ", ".join(f"{k}: {v}" for k, v in row.measurements.items())
            fit_note = f" (Fit note: {row.fit_notes})" if row.fit_notes else ""
            lines.append(f"- Size {row.size}: {meas_str}{fit_note}")
        lines.append("")

    if recommendation:
        lines.append("Size Recommendation:")
        lines.append(f"- Recommended Size: {recommendation.recommended_size}")
        lines.append(f"- Sizing Advice: {recommendation.advice}")
        lines.append(f"- Measurement Input: {recommendation.measurement_input:g} {recommendation.unit}")
        lines.append("")

    lines.extend([
        "Instructions for Assistant:",
        "- Provide clear, confident sizing advice grounded strictly in the official Contoso size guide above.",
        "- Explain how the product fits (e.g. true to size, athletic fit, room for layering).",
        "- If the customer provided specific measurements, highlight the recommended size and fit rationale.",
        "- Reassure the customer about Contoso's hassle-free 30-day return and exchange policy if the fit isn't perfect.",
        "- Be friendly, helpful, and professional.",
    ])

    return "\n".join(lines)
