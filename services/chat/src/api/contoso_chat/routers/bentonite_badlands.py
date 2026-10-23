"""FastAPI router for the Arid Badlands Bentonite Popcorn-Clay & Piping-Tunnel Sinkhole Navigation Guide."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Body, HTTPException, Query
from pydantic import BaseModel, Field

from contoso_chat.bentonite_badlands import (
    BENTONITE_BADLANDS_SITES,
    BentoniteMorphology,
    SmectiteSwellingGrade,
    calculate_bentonite_badlands,
    filter_bentonite_badlands_sites,
    get_bentonite_badlands_gear_checklist,
    get_bentonite_badlands_site_by_id,
)

router = APIRouter(tags=["bentonite-badlands"])


class BentoniteBadlandsCalculateRequest(BaseModel):
    """Request schema for POST /bentonite-badlands/calculate."""

    smectite_free_swell_index_pct: float = Field(
        default=180.0,
        ge=20.0,
        le=800.0,
        description="Smectite/montmorillonite free-swell expansion index in percent (20–800%).",
    )
    popcorn_crust_thickness_cm: float = Field(
        default=12.0,
        ge=1.0,
        le=40.0,
        description="Desiccated polygonal popcorn-clay surface crust thickness in cm (1–40 cm).",
    )
    piping_roof_thickness_cm: float = Field(
        default=38.0,
        ge=5.0,
        le=150.0,
        description="Subterranean soil-piping tunnel roof / natural bridge thickness in cm (5–150 cm).",
    )
    rainfall_intensity_mm_hr: float = Field(
        default=14.0,
        ge=0.0,
        le=120.0,
        description="Convective rainfall intensity in mm/hr (0–120 mm/hr).",
    )
    slope_angle_deg: float = Field(
        default=28.0,
        ge=2.0,
        le=65.0,
        description="Badlands mound, coulee, or barranco wall slope angle in degrees (2–65°).",
    )
    sodium_adsorption_ratio_sar: float = Field(
        default=18.0,
        ge=1.0,
        le=60.0,
        description="Pore-water Sodium Adsorption Ratio (SAR) controlling clay dispersion (1–60).",
    )
    hiker_load_kg: float = Field(
        default=85.0,
        ge=35.0,
        le=160.0,
        description="Total hiker + pack mass in kilograms (35–160 kg).",
    )
    morphology: str = Field(
        default=BentoniteMorphology.POPCORN_CRUST_MOUND.value,
        description="Badlands morphology classification.",
    )
    swelling_grade: str = Field(
        default=SmectiteSwellingGrade.HIGH_SODIUM_BENTONITE.value,
        description="Smectite mineralogical swelling grade.",
    )
    site_id: str | None = Field(
        default=None,
        description="Optional reference site ID.",
    )


def _enrich_site(site: dict[str, Any]) -> dict[str, Any]:
    enriched: dict[str, Any] = dict(site)
    calc_info: dict[str, Any] = dict(
        calculate_bentonite_badlands(
            smectite_free_swell_index_pct=float(
                site["default_smectite_free_swell_index_pct"]
            ),
            popcorn_crust_thickness_cm=float(
                site["default_popcorn_crust_thickness_cm"]
            ),
            piping_roof_thickness_cm=float(site["default_piping_roof_thickness_cm"]),
            rainfall_intensity_mm_hr=float(site["default_rainfall_intensity_mm_hr"]),
            slope_angle_deg=float(site["default_slope_angle_deg"]),
            sodium_adsorption_ratio_sar=float(
                site["default_sodium_adsorption_ratio_sar"]
            ),
            hiker_load_kg=float(site["default_hiker_load_kg"]),
            morphology=str(site["morphology"]),
            swelling_grade=str(site["swelling_grade"]),
            site_id=str(site["id"]),
        )
    )
    enriched["calc_summary"] = calc_info
    return enriched


@router.get("/health")
@router.get("/bentonite-badlands/health")
def get_bentonite_badlands_health() -> dict[str, Any]:
    """Health check endpoint for the bentonite badlands navigation service."""
    return {
        "status": "ok",
        "service": "bentonite-badlands",
        "domain": "bentonite_badlands",
        "sites_count": len(BENTONITE_BADLANDS_SITES),
    }


@router.get("/sites")
@router.get("/bentonite-badlands/sites")
def list_bentonite_badlands_sites(
    country: str | None = Query(default=None, description="Filter by country name"),
    morphology: str | None = Query(
        default=None,
        description="Filter by bentonite badlands morphology (popcorn-crust-mound, caprock-hoodoo-pedestal, piping-tunnel-bridge, dispersive-ruth-gully)",
    ),
    swelling_grade: str | None = Query(
        default=None,
        description="Filter by smectite swelling grade (low-calcium-smectite, moderate-montmorillonite, high-sodium-bentonite, extreme-thixotropic-gumbo)",
    ),
    deposit_type: str | None = Query(
        default=None, description="Alias for morphology"
    ),
    substrate_type: str | None = Query(
        default=None, description="Alias for morphology"
    ),
    difficulty: str | None = Query(
        default=None,
        description="Filter by difficulty (moderate, challenging, extreme)",
    ),
    region: str | None = Query(
        default=None, description="Filter by region substring"
    ),
    search: str | None = Query(
        default=None, description="Free-text search across name, region, and hazards"
    ),
) -> dict[str, Any]:
    """List and filter arid badlands bentonite popcorn-clay & piping-tunnel sites."""
    matched = filter_bentonite_badlands_sites(
        country=country,
        morphology=morphology,
        swelling_grade=swelling_grade,
        difficulty=difficulty,
        search=search,
        region=region,
        deposit_type=deposit_type,
        substrate_type=substrate_type,
    )
    sites = [_enrich_site(s) for s in matched]
    return {
        "sites": sites,
        "total": len(sites),
        "count": len(sites),
        "filters": {
            "country": country,
            "morphology": morphology or deposit_type or substrate_type,
            "swelling_grade": swelling_grade,
            "difficulty": difficulty,
            "region": region,
            "search": search,
        },
    }


@router.get("/sites/{site_id}")
@router.get("/bentonite-badlands/sites/{site_id}")
def get_bentonite_badlands_site(site_id: str) -> dict[str, Any]:
    """Get a single arid badlands bentonite & piping-tunnel site by ID."""
    found = get_bentonite_badlands_site_by_id(site_id)
    if found is None:
        raise HTTPException(
            status_code=404,
            detail=f"Bentonite badlands site '{site_id}' not found",
        )
    return _enrich_site(found)


@router.post("/calculate")
@router.post("/bentonite-badlands/calculate")
def post_calculate_bentonite_badlands(
    payload: BentoniteBadlandsCalculateRequest,
) -> dict[str, Any]:
    """Run the deterministic bentonite badlands & piping-tunnel calculator via POST."""
    try:
        calc_info: dict[str, Any] = dict(
            calculate_bentonite_badlands(
                smectite_free_swell_index_pct=payload.smectite_free_swell_index_pct,
                popcorn_crust_thickness_cm=payload.popcorn_crust_thickness_cm,
                piping_roof_thickness_cm=payload.piping_roof_thickness_cm,
                rainfall_intensity_mm_hr=payload.rainfall_intensity_mm_hr,
                slope_angle_deg=payload.slope_angle_deg,
                sodium_adsorption_ratio_sar=payload.sodium_adsorption_ratio_sar,
                hiker_load_kg=payload.hiker_load_kg,
                morphology=payload.morphology,
                swelling_grade=payload.swelling_grade,
                site_id=payload.site_id,
            )
        )
        return calc_info
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/calculate")
@router.get("/bentonite-badlands/calculate")
def get_calculate_bentonite_badlands(
    smectite_free_swell_index_pct: float = Query(default=180.0, ge=20.0, le=800.0),
    popcorn_crust_thickness_cm: float = Query(default=12.0, ge=1.0, le=40.0),
    piping_roof_thickness_cm: float = Query(default=38.0, ge=5.0, le=150.0),
    rainfall_intensity_mm_hr: float = Query(default=14.0, ge=0.0, le=120.0),
    slope_angle_deg: float = Query(default=28.0, ge=2.0, le=65.0),
    sodium_adsorption_ratio_sar: float = Query(default=18.0, ge=1.0, le=60.0),
    hiker_load_kg: float = Query(default=85.0, ge=35.0, le=160.0),
    morphology: str = Query(default=BentoniteMorphology.POPCORN_CRUST_MOUND.value),
    swelling_grade: str = Query(
        default=SmectiteSwellingGrade.HIGH_SODIUM_BENTONITE.value
    ),
    site_id: str | None = Query(default=None),
) -> dict[str, Any]:
    """Run the deterministic bentonite badlands & piping-tunnel calculator via GET."""
    try:
        calc_info: dict[str, Any] = dict(
            calculate_bentonite_badlands(
                smectite_free_swell_index_pct=smectite_free_swell_index_pct,
                popcorn_crust_thickness_cm=popcorn_crust_thickness_cm,
                piping_roof_thickness_cm=piping_roof_thickness_cm,
                rainfall_intensity_mm_hr=rainfall_intensity_mm_hr,
                slope_angle_deg=slope_angle_deg,
                sodium_adsorption_ratio_sar=sodium_adsorption_ratio_sar,
                hiker_load_kg=hiker_load_kg,
                morphology=morphology,
                swelling_grade=swelling_grade,
                site_id=site_id,
            )
        )
        return calc_info
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/gear-checklist")
@router.post("/bentonite-badlands/gear-checklist")
@router.post("/checklist")
@router.post("/gear")
def post_bentonite_badlands_gear_checklist(
    payload: dict[str, Any] | None = Body(default=None),
) -> dict[str, Any]:
    """Retrieve the 6-item essential gear checklist for bentonite badlands navigation via POST."""
    checklist = [dict(item) for item in get_bentonite_badlands_gear_checklist(payload)]
    return {
        "checklist": checklist,
        "gear": checklist,
        "gear_checklist": checklist,
        "items": checklist,
        "total": len(checklist),
    }


@router.get("/gear-checklist")
@router.get("/bentonite-badlands/gear-checklist")
@router.get("/checklist")
@router.get("/bentonite-badlands/checklist")
@router.get("/gear")
@router.get("/bentonite-badlands/gear")
def get_bentonite_badlands_checklist() -> dict[str, Any]:
    """Get the 6-item essential gear checklist for bentonite badlands navigation via GET."""
    checklist = [dict(item) for item in get_bentonite_badlands_gear_checklist()]
    return {
        "checklist": checklist,
        "gear": checklist,
        "gear_checklist": checklist,
        "items": checklist,
        "total": len(checklist),
    }
