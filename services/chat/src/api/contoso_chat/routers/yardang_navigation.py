"""FastAPI router for Aeolian Yardang & Mega-Dune Slip-Face Star-Dune Desert Navigation Guide."""

from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from ..yardang_navigation import (
    calculate_yardang_navigation,
    filter_sites,
    get_gear_checklist,
    get_site_by_id,
)

router = APIRouter(tags=["yardang-navigation"])


class YardangNavigationCalculateRequest(BaseModel):
    slip_face_angle_deg: float = Field(
        default=32.0,
        ge=10.0,
        le=42.0,
        description="Inclination angle of mega-dune leeward slip-face or yardang sand apron in degrees (10 to 42)",
    )
    wind_speed_kmh: float = Field(
        default=45.0,
        ge=0.0,
        le=130.0,
        description="Ambient free-stream wind speed entering the yardang/dune field in km/h (0 to 130)",
    )
    corridor_width_m: float = Field(
        default=28.0,
        ge=2.0,
        le=250.0,
        description="Horizontal constriction width between adjacent yardang ridges or interdune gassi walls in meters (2 to 250)",
    )
    sand_surface_temp_c: float = Field(
        default=42.0,
        ge=10.0,
        le=72.0,
        description="Conductive sand/mudstone skin surface temperature in degrees Celsius (10 to 72)",
    )
    visibility_m: float = Field(
        default=400.0,
        ge=5.0,
        le=2000.0,
        description="Horizontal optical visibility through saltating sand and suspended dust in meters (5 to 2000)",
    )


class YardangNavigationCalculateResponse(BaseModel):
    slip_face_angle_deg: float
    wind_speed_kmh: float
    corridor_width_m: float
    sand_surface_temp_c: float
    visibility_m: float
    avalanche_slip_safety_factor: float
    venturi_wind_acceleration_ratio: float
    triboelectric_gnss_noise_index: float
    stride_sinkage_energy_multiplier: float
    risk_level: str
    safety_status: str
    routing_strategy: str
    progression_protocol: str
    warnings: list[str]
    recommendations: list[str]


@router.get("/sites")
async def list_yardang_navigation_sites(
    country: Optional[str] = Query(default=None, description="Filter by country"),
    morphology: Optional[str] = Query(
        default=None,
        description=(
            "Filter by yardang/mega-dune morphology (kalut-mega-yardang-corridor, "
            "star-dune-multi-arm-slipface, lacustrine-mudstone-yardang-fleet, "
            "barchanoid-interdune-gassi)"
        ),
    ),
    difficulty: Optional[str] = Query(
        default=None,
        description="Filter by difficulty (moderate, challenging, extreme)",
    ),
    search: Optional[str] = Query(default=None, description="Free-text search"),
) -> list[dict[str, Any]]:
    """Return aeolian yardang and mega-dune desert sites with optional filtering."""
    return filter_sites(
        country=country,
        morphology=morphology,
        difficulty=difficulty,
        search=search,
    )


@router.get("/sites/{site_id}")
async def get_yardang_navigation_site(site_id: str) -> dict[str, Any]:
    """Return a single aeolian yardang / mega-dune desert site by ID."""
    site = get_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Yardang navigation site '{site_id}' not found",
        )
    return site


@router.post("/calculate", response_model=YardangNavigationCalculateResponse)
async def calculate_yardang_navigation_endpoint(
    payload: YardangNavigationCalculateRequest,
) -> dict[str, Any]:
    """Calculate slip-face avalanche safety factor, Venturi wind acceleration ratio, triboelectric GNSS noise index, and stride sinkage energy multiplier."""
    try:
        return calculate_yardang_navigation(
            slip_face_angle_deg=payload.slip_face_angle_deg,
            wind_speed_kmh=payload.wind_speed_kmh,
            corridor_width_m=payload.corridor_width_m,
            sand_surface_temp_c=payload.sand_surface_temp_c,
            visibility_m=payload.visibility_m,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/checklist")
async def get_yardang_navigation_checklist() -> list[dict[str, Any]]:
    """Return the mandatory aeolian yardang & mega-dune navigation gear checklist."""
    return get_gear_checklist()


@router.get("/gear")
async def get_yardang_navigation_gear() -> list[dict[str, Any]]:
    """Return the mandatory aeolian yardang & mega-dune navigation gear checklist (alias)."""
    return get_gear_checklist()
