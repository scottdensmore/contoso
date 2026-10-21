"""FastAPI router for Tropical Tsingy (Pinnacle Karst Labyrinth) & Razor-Limestone Arête Scrambling Guide."""

from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from ..tsingy_labyrinth import (
    calculate_tsingy_labyrinth,
    filter_sites,
    get_gear_checklist,
    get_site_by_id,
)

router = APIRouter(tags=["tsingy-labyrinth"])


class TsingyLabyrinthCalculateRequest(BaseModel):
    blade_edge_radius_mm: float = Field(
        default=1.8,
        ge=0.2,
        le=15.0,
        description="Mean tip/edge radius of rillenkarren limestone blades in millimeters (0.2 to 15.0)",
    )
    spire_height_m: float = Field(
        default=42.0,
        ge=5.0,
        le=120.0,
        description="Vertical relief of limestone pinnacles / diaclase chasms in meters (5 to 120)",
    )
    rock_surface_temp_c: float = Field(
        default=44.0,
        ge=18.0,
        le=68.0,
        description="Solar-heated limestone surface temperature in degrees Celsius (18 to 68)",
    )
    diaclase_gap_width_m: float = Field(
        default=1.4,
        ge=0.3,
        le=8.0,
        description="Mean horizontal span across diaclase joint corridors/gaps in meters (0.3 to 8.0)",
    )
    ambient_humidity_pct: float = Field(
        default=65.0,
        ge=20.0,
        le=100.0,
        description="Ambient relative humidity in percent (20 to 100)",
    )


class TsingyLabyrinthCalculateResponse(BaseModel):
    blade_edge_radius_mm: float
    spire_height_m: float
    rock_surface_temp_c: float
    diaclase_gap_width_m: float
    ambient_humidity_pct: float
    laceration_shear_index: float
    cord_cut_through_risk_pct: float
    radiant_sweat_loss_litres_hr: float
    arete_exposure_factor: float
    risk_level: str
    safety_status: str
    scrambling_class: str
    warnings: list[str]
    recommendations: list[str]


@router.get("/sites")
async def list_tsingy_labyrinth_sites(
    country: Optional[str] = Query(default=None, description="Filter by country"),
    morphology: Optional[str] = Query(
        default=None,
        description=(
            "Filter by tsingy labyrinth morphology (rillenkarren-razor-spires, "
            "diaclase-slot-corridor-maze, canopy-suspension-bridge-arête, "
            "stone-forest-shilin-pinnacles)"
        ),
    ),
    difficulty: Optional[str] = Query(
        default=None,
        description="Filter by difficulty (moderate, challenging, extreme)",
    ),
    search: Optional[str] = Query(default=None, description="Free-text search"),
) -> list[dict[str, Any]]:
    """Return tropical tsingy pinnacle karst labyrinth sites with optional filtering."""
    return filter_sites(
        country=country,
        morphology=morphology,
        difficulty=difficulty,
        search=search,
    )


@router.get("/sites/{site_id}")
async def get_tsingy_labyrinth_site(site_id: str) -> dict[str, Any]:
    """Return a single tropical tsingy pinnacle karst labyrinth site by ID."""
    site = get_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Tsingy labyrinth site '{site_id}' not found",
        )
    return site


@router.post("/calculate", response_model=TsingyLabyrinthCalculateResponse)
async def calculate_tsingy_labyrinth_endpoint(
    payload: TsingyLabyrinthCalculateRequest,
) -> dict[str, Any]:
    """Calculate laceration shear index, cord cut-through risk, radiant sweat loss, and arête exposure factor."""
    try:
        return calculate_tsingy_labyrinth(
            blade_edge_radius_mm=payload.blade_edge_radius_mm,
            spire_height_m=payload.spire_height_m,
            rock_surface_temp_c=payload.rock_surface_temp_c,
            diaclase_gap_width_m=payload.diaclase_gap_width_m,
            ambient_humidity_pct=payload.ambient_humidity_pct,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/checklist")
async def get_tsingy_labyrinth_checklist() -> list[dict[str, Any]]:
    """Return the mandatory tropical tsingy & razor-limestone arête gear checklist."""
    return get_gear_checklist()


@router.get("/gear")
async def get_tsingy_labyrinth_gear() -> list[dict[str, Any]]:
    """Return the mandatory tropical tsingy & razor-limestone arête gear checklist (alias)."""
    return get_gear_checklist()
