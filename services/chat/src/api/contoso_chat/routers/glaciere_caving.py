"""FastAPI router for Subterranean Ice-Filled Lava Tube & Permafrost Glacière Cave Navigation."""

from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from ..glaciere_caving import (
    calculate_glaciere_caving,
    filter_sites,
    get_gear_checklist,
    get_site_by_id,
)

router = APIRouter(tags=["glaciere-caving"])


class GlaciereCalculateRequest(BaseModel):
    floor_ice_slope_deg: float = Field(
        default=18.0,
        ge=0.0,
        le=60.0,
        description="Subterranean congelation floor ice slope angle in degrees (0 to 60)",
    )
    cave_air_temp_c: float = Field(
        default=-2.5,
        ge=-20.0,
        le=10.0,
        description="Cold-trap cave air temperature in °C (-20 to 10)",
    )
    meltwater_film_mm: float = Field(
        default=1.0,
        ge=0.0,
        le=25.0,
        description="Liquid meltwater glaze film thickness on floor ice in mm (0 to 25)",
    )
    co2_ppm: float = Field(
        default=800.0,
        ge=350.0,
        le=50000.0,
        description="Cold-trap ambient carbon dioxide concentration in ppm (350 to 50000)",
    )
    hoarfrost_ceiling_thickness_cm: float = Field(
        default=15.0,
        ge=0.0,
        le=120.0,
        description="Ceiling hoarfrost crystal plate / stalactite thickness in cm (0 to 120)",
    )


class GlaciereCalculateResponse(BaseModel):
    floor_ice_slope_deg: float
    cave_air_temp_c: float
    meltwater_film_mm: float
    co2_ppm: float
    hoarfrost_ceiling_thickness_cm: float
    ice_friction_coefficient: float
    crampon_shear_safety_factor: float
    hoarfrost_detachment_risk_pct: float
    hypoxic_co2_index: float
    risk_level: str
    safety_status: str
    traction_class: str
    warnings: list[str]
    recommendations: list[str]


@router.get("/sites")
async def list_glaciere_caving_sites(
    country: Optional[str] = Query(default=None, description="Filter by country"),
    morphology: Optional[str] = Query(
        default=None,
        description=(
            "Filter by glacière morphology (dynamic-chimney-karst-ice, "
            "stratified-firn-plug-pit, static-cold-trap-lava-tube, permafrost-fissure-glaciere)"
        ),
    ),
    difficulty: Optional[str] = Query(
        default=None,
        description="Filter by difficulty (moderate, challenging, extreme)",
    ),
    search: Optional[str] = Query(default=None, description="Free-text search"),
) -> list[dict[str, Any]]:
    """Return subterranean glacière cave sites with optional filtering."""
    return filter_sites(
        country=country,
        morphology=morphology,
        difficulty=difficulty,
        search=search,
    )


@router.get("/sites/{site_id}")
async def get_glaciere_caving_site(site_id: str) -> dict[str, Any]:
    """Return a single subterranean glacière cave site by ID."""
    site = get_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Glacière caving site '{site_id}' not found",
        )
    return site


@router.post("/calculate", response_model=GlaciereCalculateResponse)
async def calculate_glaciere_caving_endpoint(
    payload: GlaciereCalculateRequest,
) -> dict[str, Any]:
    """Calculate subterranean floor-ice friction, crampon shear safety, hoarfrost detachment, and CO2 risk."""
    try:
        return calculate_glaciere_caving(
            floor_ice_slope_deg=payload.floor_ice_slope_deg,
            cave_air_temp_c=payload.cave_air_temp_c,
            meltwater_film_mm=payload.meltwater_film_mm,
            co2_ppm=payload.co2_ppm,
            hoarfrost_ceiling_thickness_cm=payload.hoarfrost_ceiling_thickness_cm,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/checklist")
async def get_glaciere_caving_checklist() -> list[dict[str, Any]]:
    """Return the mandatory glacière caving gear checklist."""
    return get_gear_checklist()


@router.get("/gear")
async def get_glaciere_caving_gear() -> list[dict[str, Any]]:
    """Return the mandatory glacière caving gear checklist (alias)."""
    return get_gear_checklist()
