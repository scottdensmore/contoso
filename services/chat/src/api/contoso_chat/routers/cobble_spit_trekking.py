"""FastAPI router for Coastal Kelp-Wrack Boulder Reef & Intertidal Cobble Spit Trekking Guide."""

from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from ..cobble_spit_trekking import (
    calculate_cobble_spit_trekking,
    filter_sites,
    get_gear_checklist,
    get_site_by_id,
)

router = APIRouter(tags=["cobble-spit-trekking"])


class CobbleSpitCalculateRequest(BaseModel):
    median_cobble_diameter_mm: float = Field(
        default=110.0,
        ge=16.0,
        le=600.0,
        description="Median D50 clast diameter of shingle/cobble/boulder substrate in mm (16 to 600)",
    )
    kelp_wrack_depth_cm: float = Field(
        default=18.0,
        ge=0.0,
        le=150.0,
        description="Thickness of decaying intertidal kelp-wrack mat in cm (0 to 150)",
    )
    berm_slope_deg: float = Field(
        default=12.0,
        ge=0.0,
        le=40.0,
        description="Foreshore storm-berm or boulder reef slope angle in degrees (0 to 40)",
    )
    swell_height_m: float = Field(
        default=1.2,
        ge=0.0,
        le=8.0,
        description="Significant nearshore wave swell height in meters (0 to 8)",
    )
    pack_load_kg: float = Field(
        default=14.0,
        ge=0.0,
        le=45.0,
        description="Carried backpack load in kilograms (0 to 45)",
    )


class CobbleSpitCalculateResponse(BaseModel):
    median_cobble_diameter_mm: float
    kelp_wrack_depth_cm: float
    berm_slope_deg: float
    swell_height_m: float
    pack_load_kg: float
    mucilage_slip_coefficient: float
    ankle_roll_torque_index: float
    swash_runup_cutoff_minutes: float
    effective_pace_km_h: float
    risk_level: str
    safety_status: str
    footwear_class: str
    warnings: list[str]
    recommendations: list[str]


@router.get("/sites")
async def list_cobble_spit_trekking_sites(
    country: Optional[str] = Query(default=None, description="Filter by country"),
    morphology: Optional[str] = Query(
        default=None,
        description=(
            "Filter by cobble spit morphology (cuspate-shingle-spit, "
            "storm-berm-cobble-bar, intertidal-boulder-reef, glacio-fluvial-tombolo)"
        ),
    ),
    difficulty: Optional[str] = Query(
        default=None,
        description="Filter by difficulty (moderate, challenging, extreme)",
    ),
    search: Optional[str] = Query(default=None, description="Free-text search"),
) -> list[dict[str, Any]]:
    """Return coastal cobble spit & boulder reef sites with optional filtering."""
    return filter_sites(
        country=country,
        morphology=morphology,
        difficulty=difficulty,
        search=search,
    )


@router.get("/sites/{site_id}")
async def get_cobble_spit_trekking_site(site_id: str) -> dict[str, Any]:
    """Return a single coastal cobble spit or boulder reef site by ID."""
    site = get_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Cobble spit trekking site '{site_id}' not found",
        )
    return site


@router.post("/calculate", response_model=CobbleSpitCalculateResponse)
async def calculate_cobble_spit_trekking_endpoint(
    payload: CobbleSpitCalculateRequest,
) -> dict[str, Any]:
    """Calculate alginate mucilage slip friction, ankle-roll torque, swash runup cutoff, and effective pace."""
    try:
        return calculate_cobble_spit_trekking(
            median_cobble_diameter_mm=payload.median_cobble_diameter_mm,
            kelp_wrack_depth_cm=payload.kelp_wrack_depth_cm,
            berm_slope_deg=payload.berm_slope_deg,
            swell_height_m=payload.swell_height_m,
            pack_load_kg=payload.pack_load_kg,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/checklist")
async def get_cobble_spit_trekking_checklist() -> list[dict[str, Any]]:
    """Return the mandatory cobble spit & kelp-wrack trekking gear checklist."""
    return get_gear_checklist()


@router.get("/gear")
async def get_cobble_spit_trekking_gear() -> list[dict[str, Any]]:
    """Return the mandatory cobble spit & kelp-wrack trekking gear checklist (alias)."""
    return get_gear_checklist()
