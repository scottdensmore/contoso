"""FastAPI router for the High-Altitude Salar Brine-Pool & Polygonal Halite Pressure-Ridge Trekking Guide."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from contoso_chat.salar_pressure_ridge import (
    calculate_salar_pressure_ridge,
    filter_sites,
    get_gear_checklist,
    get_site_by_id,
)

router = APIRouter(tags=["salar-pressure-ridge"])


class SalarPressureRidgeCalculateRequest(BaseModel):
    """Request schema for POST /salar-pressure-ridge/calculate."""

    crust_thickness_cm: float = Field(
        default=24.0,
        ge=0.5,
        le=150.0,
        description="Halite salt crust thickness in cm (0.5 to 150.0)",
    )
    brine_eye_proximity_m: float = Field(
        default=18.0,
        ge=0.5,
        le=200.0,
        description="Radial distance to nearest Ojos del Salar brine upwelling or pool in meters (0.5 to 200.0)",
    )
    ridge_relief_cm: float = Field(
        default=35.0,
        ge=2.0,
        le=120.0,
        description="Buckled polygonal halite/gypsum pressure-ridge vertical relief in cm (2.0 to 120.0)",
    )
    solar_uv_index: float = Field(
        default=15.0,
        ge=1.0,
        le=22.0,
        description="Incident high-altitude solar UV index (1.0 to 22.0)",
    )
    packsled_load_kg: float = Field(
        default=45.0,
        ge=8.0,
        le=150.0,
        description="Total expedition pack or UHMWPE packsled load in kg (8.0 to 150.0)",
    )
    site_id: str | None = Field(
        default=None,
        description="Optional high-altitude salar site ID for contextual site metadata",
    )


@router.get("/sites")
def list_salar_pressure_ridge_sites(
    country: str | None = Query(default=None, description="Filter by country (Bolivia, Chile, Argentina)"),
    morphology: str | None = Query(default=None, description="Filter by evaporite crust morphology"),
    difficulty: str | None = Query(default=None, description="Filter by difficulty level"),
    search: str | None = Query(default=None, description="Free-text search query"),
) -> dict[str, Any]:
    """List high-altitude salar pressure-ridge sites with optional filtering."""
    sites = filter_sites(
        country=country,
        morphology=morphology,
        difficulty=difficulty,
        search=search,
    )
    return {
        "total": len(sites),
        "sites": [dict(s) for s in sites],
        "gear_checklist": get_gear_checklist(),
    }


@router.get("/sites/{site_id}")
def get_salar_pressure_ridge_site_detail(site_id: str) -> dict[str, Any]:
    """Retrieve a single salar pressure-ridge site by ID with its baseline hazard calculation."""
    site = get_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Salar pressure-ridge site '{site_id}' not found.",
        )
    baseline = calculate_salar_pressure_ridge(
        crust_thickness_cm=float(site["default_crust_thickness_cm"]),
        brine_eye_proximity_m=float(site["default_brine_eye_proximity_m"]),
        ridge_relief_cm=float(site["default_ridge_relief_cm"]),
        solar_uv_index=float(site["default_solar_uv_index"]),
        packsled_load_kg=float(site["default_packsled_load_kg"]),
    )
    return {
        "site": dict(site),
        "baseline_calculation": baseline,
        "gear_checklist": get_gear_checklist(),
    }


@router.post("/calculate")
def calculate_salar_pressure_ridge_post(
    payload: SalarPressureRidgeCalculateRequest,
) -> dict[str, Any]:
    """Run deterministic salar pressure-ridge hazard calculation via POST."""
    try:
        calc = calculate_salar_pressure_ridge(
            crust_thickness_cm=payload.crust_thickness_cm,
            brine_eye_proximity_m=payload.brine_eye_proximity_m,
            ridge_relief_cm=payload.ridge_relief_cm,
            solar_uv_index=payload.solar_uv_index,
            packsled_load_kg=payload.packsled_load_kg,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    matched_site = get_site_by_id(payload.site_id) if payload.site_id else None
    return {
        "calculation": calc,
        "site": dict(matched_site) if matched_site else None,
        "gear_checklist": get_gear_checklist(),
    }


@router.get("/calculate")
def calculate_salar_pressure_ridge_get(
    crust_thickness_cm: float = Query(default=24.0, ge=0.5, le=150.0),
    brine_eye_proximity_m: float = Query(default=18.0, ge=0.5, le=200.0),
    ridge_relief_cm: float = Query(default=35.0, ge=2.0, le=120.0),
    solar_uv_index: float = Query(default=15.0, ge=1.0, le=22.0),
    packsled_load_kg: float = Query(default=45.0, ge=8.0, le=150.0),
    site_id: str | None = Query(default=None),
) -> dict[str, Any]:
    """Run deterministic salar pressure-ridge hazard calculation via GET query parameters."""
    try:
        calc = calculate_salar_pressure_ridge(
            crust_thickness_cm=crust_thickness_cm,
            brine_eye_proximity_m=brine_eye_proximity_m,
            ridge_relief_cm=ridge_relief_cm,
            solar_uv_index=solar_uv_index,
            packsled_load_kg=packsled_load_kg,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    matched_site = get_site_by_id(site_id) if site_id else None
    return {
        "calculation": calc,
        "site": dict(matched_site) if matched_site else None,
        "gear_checklist": get_gear_checklist(),
    }


@router.get("/checklist")
@router.get("/gear")
def get_salar_pressure_ridge_checklist() -> dict[str, Any]:
    """Return the essential 6-item gear checklist for salar pressure-ridge expeditions."""
    checklist = get_gear_checklist()
    return {
        "total": len(checklist),
        "gear_checklist": checklist,
    }
