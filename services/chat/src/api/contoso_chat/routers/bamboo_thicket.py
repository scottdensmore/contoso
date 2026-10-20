"""FastAPI router for the Montane Bamboo-Thicket (Chusquea / Sasa) & Cloud-Forest Ridge-Crest Bushwhacking Guide."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from ..bamboo_thicket import (
    calculate_bamboo_thicket,
    filter_sites,
    get_gear_checklist,
    get_site_by_id,
)

router = APIRouter(tags=["bamboo-thicket"])


class BambooThicketCalculateRequest(BaseModel):
    """Request schema for POST /bamboo-thicket/calculate."""

    culm_density_per_sq_m: float = Field(
        default=45.0,
        ge=5.0,
        le=120.0,
        description="Live and dead bamboo culm density per square meter (5-120 culms/m²).",
    )
    culm_diameter_mm: float = Field(
        default=22.0,
        ge=4.0,
        le=80.0,
        description="Mean basal/mid-stem bamboo culm diameter in millimeters (4-80 mm).",
    )
    ridge_slope_deg: float = Field(
        default=28.0,
        ge=0.0,
        le=55.0,
        description="Cloud-forest ridge-crest or flank slope angle in degrees (0-55 deg).",
    )
    wetness_film_pct: float = Field(
        default=70.0,
        ge=0.0,
        le=100.0,
        description="Orographic fog/rain water-film coverage on silica culm surfaces (0-100 %).",
    )
    follower_spacing_m: float = Field(
        default=3.5,
        ge=0.5,
        le=15.0,
        description="Inter-hiker follower spacing along the bushwhacking corridor in meters (0.5-15.0 m).",
    )
    site_id: str | None = Field(
        default=None,
        description="Optional montane bamboo-thicket site ID for contextual comparison.",
    )


@router.get("/sites")
def list_bamboo_thicket_sites(
    country: str | None = Query(default=None, description="Filter by country or region"),
    ecotype: str | None = Query(
        default=None,
        description="Filter by bamboo ecotype (e.g. chusquea-solid-culm-cloud-ridge)",
    ),
    morphology: str | None = Query(
        default=None,
        description="Optional alias for ecotype filter",
    ),
    difficulty: str | None = Query(
        default=None, description="Filter by difficulty (moderate, challenging, extreme)"
    ),
    search: str | None = Query(
        default=None, description="Free-text search across site name, region, hazard, or notes"
    ),
) -> dict[str, Any]:
    """List curated montane bamboo-thicket and cloud-forest ridge-crest bushwhacking sites."""
    effective_ecotype = ecotype or morphology
    sites = filter_sites(
        country=country,
        ecotype=effective_ecotype,
        difficulty=difficulty,
        search=search,
    )
    return {
        "total": len(sites),
        "count": len(sites),
        "filters": {
            "country": country,
            "ecotype": effective_ecotype,
            "difficulty": difficulty,
            "search": search,
        },
        "sites": sites,
        "gear_checklist": get_gear_checklist(),
    }


@router.get("/sites/{site_id}")
def get_bamboo_thicket_site_detail(site_id: str) -> dict[str, Any]:
    """Retrieve a specific montane bamboo-thicket site with its baseline bushwhacking calculation."""
    site = get_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Bamboo-thicket site '{site_id}' not found.",
        )
    baseline = calculate_bamboo_thicket(
        culm_density_per_sq_m=float(site["default_culm_density_per_sq_m"]),
        culm_diameter_mm=float(site["default_culm_diameter_mm"]),
        ridge_slope_deg=float(site["default_ridge_slope_deg"]),
        wetness_film_pct=float(site["default_wetness_film_pct"]),
        follower_spacing_m=float(site["default_follower_spacing_m"]),
    )
    return {
        "site": site,
        "baseline_calculation": baseline,
        "gear_checklist": get_gear_checklist(),
    }


@router.post("/calculate")
def calculate_bamboo_thicket_post(
    payload: BambooThicketCalculateRequest,
) -> dict[str, Any]:
    """Calculate culm rebound whip energy, slip probability, net advance rate, and punji risk."""
    try:
        calc = calculate_bamboo_thicket(
            culm_density_per_sq_m=payload.culm_density_per_sq_m,
            culm_diameter_mm=payload.culm_diameter_mm,
            ridge_slope_deg=payload.ridge_slope_deg,
            wetness_film_pct=payload.wetness_film_pct,
            follower_spacing_m=payload.follower_spacing_m,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    matched_site = get_site_by_id(payload.site_id) if payload.site_id else None
    return {
        "calculation": calc,
        "site": matched_site,
        "gear_checklist": get_gear_checklist(),
    }


@router.get("/calculate")
def calculate_bamboo_thicket_get(
    culm_density_per_sq_m: float = Query(default=45.0, ge=5.0, le=120.0),
    culm_diameter_mm: float = Query(default=22.0, ge=4.0, le=80.0),
    ridge_slope_deg: float = Query(default=28.0, ge=0.0, le=55.0),
    wetness_film_pct: float = Query(default=70.0, ge=0.0, le=100.0),
    follower_spacing_m: float = Query(default=3.5, ge=0.5, le=15.0),
    site_id: str | None = Query(default=None),
) -> dict[str, Any]:
    """GET endpoint for montane bamboo-thicket bushwhacking calculation."""
    try:
        calc = calculate_bamboo_thicket(
            culm_density_per_sq_m=culm_density_per_sq_m,
            culm_diameter_mm=culm_diameter_mm,
            ridge_slope_deg=ridge_slope_deg,
            wetness_film_pct=wetness_film_pct,
            follower_spacing_m=follower_spacing_m,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    matched_site = get_site_by_id(site_id) if site_id else None
    return {
        "calculation": calc,
        "site": matched_site,
        "gear_checklist": get_gear_checklist(),
    }


@router.get("/checklist")
@router.get("/gear")
def get_bamboo_thicket_checklist() -> dict[str, Any]:
    """Return the 6-item essential montane bamboo-thicket bushwhacking gear checklist."""
    checklist = get_gear_checklist()
    return {
        "total": len(checklist),
        "gear_checklist": checklist,
    }
