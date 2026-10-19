"""FastAPI router for Glacial Outwash Braided-River Sandur & Quicksand Silt-Bar Crossing Guide."""

from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from ..sandur_crossing import (
    calculate_sandur_crossing,
    filter_sites,
    get_gear_checklist,
    get_site_by_id,
)

router = APIRouter(tags=["sandur-crossing"])


class SandurCrossingCalculateRequest(BaseModel):
    water_depth_m: float = Field(
        default=0.45,
        ge=0.1,
        le=2.0,
        description="Thalweg water depth of the active braided channel in meters (0.1 to 2.0)",
    )
    flow_velocity_ms: float = Field(
        default=1.2,
        ge=0.1,
        le=5.0,
        description="Mean channel flow velocity in m/s (0.1 to 5.0)",
    )
    hour_of_day_24: int = Field(
        default=7,
        ge=0,
        le=23,
        description="Local solar hour of day on 24-hour clock (0 to 23)",
    )
    silt_flour_concentration_mg_l: float = Field(
        default=800.0,
        ge=50.0,
        le=5000.0,
        description="Suspended glacial rock-flour and fine silt concentration in mg/L (50 to 5000)",
    )
    hiker_mass_kg: float = Field(
        default=75.0,
        ge=40.0,
        le=150.0,
        description="Total hiker plus pack mass in kg (40 to 150)",
    )


class SandurCrossingCalculateResponse(BaseModel):
    water_depth_m: float
    flow_velocity_ms: float
    hour_of_day_24: int
    silt_flour_concentration_mg_l: float
    hiker_mass_kg: float
    hydrodynamic_momentum_product: float
    quicksand_liquefaction_index: float
    diurnal_discharge_multiplier: float
    bedload_boulder_roll_risk_pct: float
    risk_level: str
    safety_status: str
    crossing_technique: str
    warnings: list[str]
    recommendations: list[str]


@router.get("/sites")
async def list_sandur_crossing_sites(
    country: Optional[str] = Query(default=None, description="Filter by country"),
    morphology: Optional[str] = Query(
        default=None,
        description=(
            "Filter by sandur morphology (jokulhlaup-basalt-sandur, "
            "anastomosing-glacial-silt-braid, proglacial-boulder-outwash-fan, "
            "tidal-estuarine-glacial-delta)"
        ),
    ),
    difficulty: Optional[str] = Query(
        default=None,
        description="Filter by difficulty (moderate, challenging, extreme)",
    ),
    search: Optional[str] = Query(default=None, description="Free-text search"),
) -> list[dict[str, Any]]:
    """Return glacial outwash braided-river sandur crossing sites with optional filtering."""
    return filter_sites(
        country=country,
        morphology=morphology,
        difficulty=difficulty,
        search=search,
    )


@router.get("/sites/{site_id}")
async def get_sandur_crossing_site(site_id: str) -> dict[str, Any]:
    """Return a single sandur crossing site by ID."""
    site = get_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Sandur crossing site '{site_id}' not found",
        )
    return site


@router.post("/calculate", response_model=SandurCrossingCalculateResponse)
async def calculate_sandur_crossing_endpoint(
    payload: SandurCrossingCalculateRequest,
) -> dict[str, Any]:
    """Calculate hydrodynamic momentum product, quicksand liquefaction index, diurnal multiplier, and bedload risk."""
    try:
        return calculate_sandur_crossing(
            water_depth_m=payload.water_depth_m,
            flow_velocity_ms=payload.flow_velocity_ms,
            hour_of_day_24=payload.hour_of_day_24,
            silt_flour_concentration_mg_l=payload.silt_flour_concentration_mg_l,
            hiker_mass_kg=payload.hiker_mass_kg,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/checklist")
async def get_sandur_crossing_checklist() -> list[dict[str, Any]]:
    """Return the mandatory sandur & braided-river crossing gear checklist."""
    return get_gear_checklist()


@router.get("/gear")
async def get_sandur_crossing_gear() -> list[dict[str, Any]]:
    """Return the mandatory sandur & braided-river crossing gear checklist (alias)."""
    return get_gear_checklist()
