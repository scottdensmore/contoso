"""FastAPI router for Karst Tiankeng (Giant Collapse Sinkhole) & Vertical Cloud-Forest Rim Descent Guide."""

from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from ..tiankeng_descent import (
    calculate_tiankeng_descent,
    filter_sites,
    get_gear_checklist,
    get_site_by_id,
)

router = APIRouter(tags=["tiankeng-descent"])


class TiankengDescentCalculateRequest(BaseModel):
    vertical_drop_m: float = Field(
        default=250.0,
        ge=50.0,
        le=700.0,
        description="Total vertical pitch depth from cloud-forest rim to collapse floor in meters (50 to 700)",
    )
    rebelay_count: int = Field(
        default=4,
        ge=0,
        le=20,
        description="Number of intermediate rebelay / deviation anchors dividing the drop (0 to 20)",
    )
    fog_humidity_pct: float = Field(
        default=85.0,
        ge=30.0,
        le=100.0,
        description="Subterranean cloud-forest advection fog relative humidity in percent (30 to 100)",
    )
    overhang_angle_deg: float = Field(
        default=-5.0,
        ge=-25.0,
        le=30.0,
        description="Wall inclination angle in degrees (-25 overhung bell shaft to +30 slab/funnel)",
    )
    waterfall_spray_litres_min: float = Field(
        default=35.0,
        ge=0.0,
        le=500.0,
        description="Waterfall plume spray flux intersecting the rope line in litres/min (0 to 500)",
    )


class TiankengDescentCalculateResponse(BaseModel):
    vertical_drop_m: float
    rebelay_count: int
    fog_humidity_pct: float
    overhang_angle_deg: float
    waterfall_spray_litres_min: float
    wet_rope_friction_multiplier: float
    descender_thermal_c: float
    limestone_spall_trajectory_risk_pct: float
    free_hang_bounce_amplitude_m: float
    risk_level: str
    safety_status: str
    rigging_strategy: str
    warnings: list[str]
    recommendations: list[str]


@router.get("/sites")
async def list_tiankeng_descent_sites(
    country: Optional[str] = Query(default=None, description="Filter by country"),
    morphology: Optional[str] = Query(
        default=None,
        description=(
            "Filter by tiankeng morphology (collapse-mega-doline, "
            "twin-window-karst-chasm, overhung-bell-shaft-sinkhole, "
            "erosional-waterfall-tiankeng)"
        ),
    ),
    difficulty: Optional[str] = Query(
        default=None,
        description="Filter by difficulty (moderate, challenging, extreme)",
    ),
    search: Optional[str] = Query(default=None, description="Free-text search"),
) -> list[dict[str, Any]]:
    """Return karst tiankeng descent sites with optional filtering."""
    return filter_sites(
        country=country,
        morphology=morphology,
        difficulty=difficulty,
        search=search,
    )


@router.get("/sites/{site_id}")
async def get_tiankeng_descent_site(site_id: str) -> dict[str, Any]:
    """Return a single karst tiankeng descent site by ID."""
    site = get_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Tiankeng descent site '{site_id}' not found",
        )
    return site


@router.post("/calculate", response_model=TiankengDescentCalculateResponse)
async def calculate_tiankeng_descent_endpoint(
    payload: TiankengDescentCalculateRequest,
) -> dict[str, Any]:
    """Calculate wet-rope friction multiplier, descender thermal load, spall trajectory risk, and bounce amplitude."""
    try:
        return calculate_tiankeng_descent(
            vertical_drop_m=payload.vertical_drop_m,
            rebelay_count=payload.rebelay_count,
            fog_humidity_pct=payload.fog_humidity_pct,
            overhang_angle_deg=payload.overhang_angle_deg,
            waterfall_spray_litres_min=payload.waterfall_spray_litres_min,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/checklist")
async def get_tiankeng_descent_checklist() -> list[dict[str, Any]]:
    """Return the mandatory karst tiankeng & cloud-forest rim descent gear checklist."""
    return get_gear_checklist()


@router.get("/gear")
async def get_tiankeng_descent_gear() -> list[dict[str, Any]]:
    """Return the mandatory karst tiankeng & cloud-forest rim descent gear checklist (alias)."""
    return get_gear_checklist()
