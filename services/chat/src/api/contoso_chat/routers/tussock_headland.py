"""FastAPI router for Subantarctic Tussock-Grass Peat Bog & Katabatic Headland Navigation Guide."""

from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from ..tussock_headland import (
    calculate_tussock_headland,
    filter_sites,
    get_gear_checklist,
    get_site_by_id,
)

router = APIRouter(tags=["tussock-headland"])


class TussockHeadlandCalculateRequest(BaseModel):
    pedestal_height_m: float = Field(
        default=1.4,
        ge=0.2,
        le=3.0,
        description="Mean height of Poa flabellata / Chionochloa peat pedestals in meters (0.2 to 3.0)",
    )
    katabatic_wind_kmh: float = Field(
        default=65.0,
        ge=0.0,
        le=160.0,
        description="Katabatic / williwaw wind gust speed in km/h (0 to 160)",
    )
    wallow_trench_depth_cm: float = Field(
        default=55.0,
        ge=0.0,
        le=180.0,
        description="Depth of waterlogged inter-pedestal seal-wallow mud trenches in cm (0 to 180)",
    )
    ambient_temp_c: float = Field(
        default=3.0,
        ge=-15.0,
        le=18.0,
        description="Subantarctic ambient air temperature in degrees Celsius (-15 to 18)",
    )
    seal_density_per_ha: float = Field(
        default=18.0,
        ge=0.0,
        le=120.0,
        description="Coastal fur seal / elephant seal / sea lion density per hectare (0 to 120)",
    )


class TussockHeadlandCalculateResponse(BaseModel):
    pedestal_height_m: float
    katabatic_wind_kmh: float
    wallow_trench_depth_cm: float
    ambient_temp_c: float
    seal_density_per_ha: float
    katabatic_knockdown_index: float
    inter_pedestal_pit_entrapment_pct: float
    wind_chill_effective_c: float
    fauna_encounter_detour_multiplier: float
    risk_level: str
    safety_status: str
    routing_strategy: str
    warnings: list[str]
    recommendations: list[str]


@router.get("/sites")
async def list_tussock_headland_sites(
    country: Optional[str] = Query(default=None, description="Filter by country"),
    morphology: Optional[str] = Query(
        default=None,
        description=(
            "Filter by tussock headland morphology (poa-flabellata-pedestal-maze, "
            "seal-wallow-bog-trench-apron, chionochloa-megaherb-peat-terrace, "
            "azorella-feldmark-katabatic-ridge)"
        ),
    ),
    difficulty: Optional[str] = Query(
        default=None,
        description="Filter by difficulty (moderate, challenging, extreme)",
    ),
    search: Optional[str] = Query(default=None, description="Free-text search"),
) -> list[dict[str, Any]]:
    """Return subantarctic tussock headland sites with optional filtering."""
    return filter_sites(
        country=country,
        morphology=morphology,
        difficulty=difficulty,
        search=search,
    )


@router.get("/sites/{site_id}")
async def get_tussock_headland_site(site_id: str) -> dict[str, Any]:
    """Return a single subantarctic tussock headland site by ID."""
    site = get_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Tussock headland site '{site_id}' not found",
        )
    return site


@router.post("/calculate", response_model=TussockHeadlandCalculateResponse)
async def calculate_tussock_headland_endpoint(
    payload: TussockHeadlandCalculateRequest,
) -> dict[str, Any]:
    """Calculate katabatic knockdown index, inter-pedestal pit entrapment risk, effective wind chill, and fauna detour multiplier."""
    try:
        return calculate_tussock_headland(
            pedestal_height_m=payload.pedestal_height_m,
            katabatic_wind_kmh=payload.katabatic_wind_kmh,
            wallow_trench_depth_cm=payload.wallow_trench_depth_cm,
            ambient_temp_c=payload.ambient_temp_c,
            seal_density_per_ha=payload.seal_density_per_ha,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/checklist")
async def get_tussock_headland_checklist() -> list[dict[str, Any]]:
    """Return the mandatory subantarctic tussock & katabatic headland gear checklist."""
    return get_gear_checklist()


@router.get("/gear")
async def get_tussock_headland_gear() -> list[dict[str, Any]]:
    """Return the mandatory subantarctic tussock & katabatic headland gear checklist (alias)."""
    return get_gear_checklist()
