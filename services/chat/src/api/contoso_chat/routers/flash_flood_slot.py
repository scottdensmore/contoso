"""FastAPI router for High-Desert Slot-Canyon Ephemeral Flash-Flood Hydrograph & Escape-Ledge Navigation Guide."""

from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from ..flash_flood_slot import (
    calculate_flash_flood_slot,
    filter_sites,
    get_gear_checklist,
    get_site_by_id,
)

router = APIRouter(tags=["flash-flood-slot"])


class FlashFloodSlotCalculateRequest(BaseModel):
    catchment_area_km2: float = Field(
        default=120.0,
        ge=1.0,
        le=1500.0,
        description="Upstream drainage basin area feeding the slot canyon in km2 (1 to 1500)",
    )
    upstream_rain_mm_hr: float = Field(
        default=25.0,
        ge=0.0,
        le=120.0,
        description="Convective rainfall intensity over the upstream catchment in mm/hr (0 to 120)",
    )
    slot_width_m: float = Field(
        default=2.5,
        ge=0.3,
        le=25.0,
        description="Effective bedrock constriction width at the canyon floor in meters (0.3 to 25)",
    )
    escape_ledge_height_m: float = Field(
        default=4.0,
        ge=0.5,
        le=30.0,
        description="Vertical height to the nearest flood-safe escape bench or alcove ledge in meters (0.5 to 30)",
    )
    distance_to_exit_km: float = Field(
        default=2.5,
        ge=0.1,
        le=20.0,
        description="Remaining canyon floor travel distance to the nearest open wash exit in km (0.1 to 20)",
    )


class FlashFloodSlotCalculateResponse(BaseModel):
    catchment_area_km2: float
    upstream_rain_mm_hr: float
    slot_width_m: float
    escape_ledge_height_m: float
    distance_to_exit_km: float
    flood_wave_lag_minutes: float
    wall_of_water_rise_rate_m_per_min: float
    peak_discharge_m3_s: float
    escape_margin_minutes: float
    risk_level: str
    safety_status: str
    escape_class: str
    warnings: list[str]
    recommendations: list[str]


@router.get("/sites")
async def list_flash_flood_slot_sites(
    country: Optional[str] = Query(default=None, description="Filter by country"),
    lithology: Optional[str] = Query(
        default=None,
        description=(
            "Filter by slot-canyon lithology (navajo-sandstone-narrows, "
            "wingate-vertical-fissure, kayenta-ledgy-gorge, limestone-karst-wadi)"
        ),
    ),
    difficulty: Optional[str] = Query(
        default=None,
        description="Filter by difficulty (moderate, challenging, extreme)",
    ),
    search: Optional[str] = Query(default=None, description="Free-text search"),
) -> list[dict[str, Any]]:
    """Return high-desert slot-canyon flash-flood sites with optional filtering."""
    return filter_sites(
        country=country,
        lithology=lithology,
        difficulty=difficulty,
        search=search,
    )


@router.get("/sites/{site_id}")
async def get_flash_flood_slot_site(site_id: str) -> dict[str, Any]:
    """Return a single slot-canyon flash-flood site by ID."""
    site = get_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Flash-flood slot site '{site_id}' not found",
        )
    return site


@router.post("/calculate", response_model=FlashFloodSlotCalculateResponse)
async def calculate_flash_flood_slot_endpoint(
    payload: FlashFloodSlotCalculateRequest,
) -> dict[str, Any]:
    """Calculate flash-flood wave lag, peak discharge, wall-of-water rise rate, and escape margin."""
    try:
        return calculate_flash_flood_slot(
            catchment_area_km2=payload.catchment_area_km2,
            upstream_rain_mm_hr=payload.upstream_rain_mm_hr,
            slot_width_m=payload.slot_width_m,
            escape_ledge_height_m=payload.escape_ledge_height_m,
            distance_to_exit_km=payload.distance_to_exit_km,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/checklist")
async def get_flash_flood_slot_checklist() -> list[dict[str, Any]]:
    """Return the mandatory slot-canyon flash-flood & escape-ledge gear checklist."""
    return get_gear_checklist()


@router.get("/gear")
async def get_flash_flood_slot_gear() -> list[dict[str, Any]]:
    """Return the mandatory slot-canyon flash-flood & escape-ledge gear checklist (alias)."""
    return get_gear_checklist()
