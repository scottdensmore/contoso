"""FastAPI router for Table-Mountain Quartzite Tepui & High-Plateau Sandstone Fissure Navigation Guide."""

from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from ..tepui_navigation import (
    calculate_tepui_navigation,
    filter_sites,
    get_gear_checklist,
    get_site_by_id,
)

router = APIRouter(tags=["tepui-navigation"])


class TepuiNavigationCalculateRequest(BaseModel):
    cyanobacteria_biofilm_pct: float = Field(
        default=65.0,
        ge=0.0,
        le=100.0,
        description="Surface coverage of dark Stigonema cyanobacteria biofilm on orthoquartzite slabs in percent (0 to 100)",
    )
    fissure_gap_width_m: float = Field(
        default=1.6,
        ge=0.2,
        le=6.0,
        description="Mean horizontal span across pseudokarst joint fissures or chasm bridges in meters (0.2 to 6.0)",
    )
    orographic_rain_mm_hr: float = Field(
        default=25.0,
        ge=0.0,
        le=90.0,
        description="Orographic rainfall intensity across the summit plateau in mm/hr (0 to 90)",
    )
    cloud_visibility_m: float = Field(
        default=45.0,
        ge=3.0,
        le=500.0,
        description="Horizontal visibility in orographic cloud/fog across the labyrinth in meters (3 to 500)",
    )
    slab_slope_deg: float = Field(
        default=14.0,
        ge=0.0,
        le=45.0,
        description="Inclination angle of orthoquartzite bedrock ramps/slabs in degrees (0 to 45)",
    )


class TepuiNavigationCalculateResponse(BaseModel):
    cyanobacteria_biofilm_pct: float
    fissure_gap_width_m: float
    orographic_rain_mm_hr: float
    cloud_visibility_m: float
    slab_slope_deg: float
    biofilm_traction_coefficient: float
    fissure_bridge_collapse_risk_pct: float
    orographic_blackout_index: float
    blackwater_stream_surge_multiplier: float
    risk_level: str
    safety_status: str
    progression_protocol: str
    warnings: list[str]
    recommendations: list[str]


@router.get("/sites")
async def list_tepui_navigation_sites(
    country: Optional[str] = Query(default=None, description="Filter by country"),
    morphology: Optional[str] = Query(
        default=None,
        description=(
            "Filter by tepui plateau morphology (pseudokarst-fissure-grid, "
            "brocchinia-bog-sinkhole-mesa, orthoquartzite-pinnacle-plateau, "
            "proterozoic-escarpment-ramp)"
        ),
    ),
    difficulty: Optional[str] = Query(
        default=None,
        description="Filter by difficulty (moderate, challenging, extreme)",
    ),
    search: Optional[str] = Query(default=None, description="Free-text search"),
) -> list[dict[str, Any]]:
    """Return table-mountain quartzite tepui plateau sites with optional filtering."""
    return filter_sites(
        country=country,
        morphology=morphology,
        difficulty=difficulty,
        search=search,
    )


@router.get("/sites/{site_id}")
async def get_tepui_navigation_site(site_id: str) -> dict[str, Any]:
    """Return a single table-mountain quartzite tepui plateau site by ID."""
    site = get_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Tepui navigation site '{site_id}' not found",
        )
    return site


@router.post("/calculate", response_model=TepuiNavigationCalculateResponse)
async def calculate_tepui_navigation_endpoint(
    payload: TepuiNavigationCalculateRequest,
) -> dict[str, Any]:
    """Calculate biofilm traction coefficient, fissure bridge collapse risk, orographic blackout index, and blackwater stream surge multiplier."""
    try:
        return calculate_tepui_navigation(
            cyanobacteria_biofilm_pct=payload.cyanobacteria_biofilm_pct,
            fissure_gap_width_m=payload.fissure_gap_width_m,
            orographic_rain_mm_hr=payload.orographic_rain_mm_hr,
            cloud_visibility_m=payload.cloud_visibility_m,
            slab_slope_deg=payload.slab_slope_deg,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/checklist")
async def get_tepui_navigation_checklist() -> list[dict[str, Any]]:
    """Return the mandatory table-mountain quartzite tepui navigation gear checklist."""
    return get_gear_checklist()


@router.get("/gear")
async def get_tepui_navigation_gear() -> list[dict[str, Any]]:
    """Return the mandatory table-mountain quartzite tepui navigation gear checklist (alias)."""
    return get_gear_checklist()
