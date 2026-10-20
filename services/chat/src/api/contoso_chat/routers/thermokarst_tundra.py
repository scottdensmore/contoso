"""FastAPI router for the Arctic Polygon-Tundra Ice-Wedge Trough & Thermokarst Thaw-Slump Guide."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from ..thermokarst_tundra import (
    calculate_thermokarst_tundra,
    filter_sites,
    get_gear_checklist,
    get_site_by_id,
)

router = APIRouter(tags=["thermokarst-tundra"])


class ThermokarstTundraCalculateRequest(BaseModel):
    """Request schema for POST /thermokarst-tundra/calculate."""

    active_layer_depth_cm: float = Field(
        default=55.0,
        ge=10.0,
        le=160.0,
        description="Thawed suprapermafrost active layer depth above the frost table (10-160 cm).",
    )
    trough_water_depth_cm: float = Field(
        default=35.0,
        ge=0.0,
        le=140.0,
        description="Standing water depth inside ice-wedge polygon troughs (0-140 cm).",
    )
    soil_moisture_saturation_pct: float = Field(
        default=75.0,
        ge=20.0,
        le=100.0,
        description="Volumetric soil moisture saturation of the active layer (20-100 %).",
    )
    eriophorum_tussock_height_cm: float = Field(
        default=30.0,
        ge=5.0,
        le=75.0,
        description="Height of Eriophorum vaginatum (cottongrass) tussock pedestals (5-75 cm).",
    )
    pack_load_kg: float = Field(
        default=18.0,
        ge=0.0,
        le=45.0,
        description="Carried expedition pack weight in kilograms (0-45 kg).",
    )
    site_id: str | None = Field(
        default=None,
        description="Optional thermokarst tundra site ID for contextual comparison.",
    )


@router.get("/sites")
def list_thermokarst_tundra_sites(
    country: str | None = Query(default=None, description="Filter by country or region"),
    morphology: str | None = Query(
        default=None,
        description="Filter by polygon/thermokarst morphology (e.g. low-center-ice-wedge-polygon)",
    ),
    difficulty: str | None = Query(
        default=None, description="Filter by difficulty (moderate, challenging, extreme)"
    ),
) -> dict[str, Any]:
    """List curated Arctic polygon-tundra and thermokarst thaw-slump sites."""
    sites = filter_sites(country=country, morphology=morphology, difficulty=difficulty)
    return {
        "total": len(sites),
        "count": len(sites),
        "filters": {
            "country": country,
            "morphology": morphology,
            "difficulty": difficulty,
        },
        "sites": sites,
        "gear_checklist": get_gear_checklist(),
    }


@router.get("/sites/{site_id}")
def get_thermokarst_tundra_site_detail(site_id: str) -> dict[str, Any]:
    """Retrieve a specific thermokarst tundra site with its baseline liquefaction calculation."""
    site = get_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Thermokarst tundra site '{site_id}' not found.",
        )
    baseline = calculate_thermokarst_tundra(
        active_layer_depth_cm=float(site["default_active_layer_depth_cm"]),
        trough_water_depth_cm=float(site["default_trough_water_depth_cm"]),
        soil_moisture_saturation_pct=float(site["default_soil_moisture_saturation_pct"]),
        eriophorum_tussock_height_cm=float(site["default_eriophorum_tussock_height_cm"]),
        pack_load_kg=float(site["default_pack_load_kg"]),
    )
    return {
        "site": site,
        "baseline_calculation": baseline,
        "gear_checklist": get_gear_checklist(),
    }


@router.post("/calculate")
def calculate_thermokarst_tundra_post(
    payload: ThermokarstTundraCalculateRequest,
) -> dict[str, Any]:
    """Calculate suprapermafrost liquefaction, boot suction, tussock fatigue, and forward speed."""
    try:
        calc = calculate_thermokarst_tundra(
            active_layer_depth_cm=payload.active_layer_depth_cm,
            trough_water_depth_cm=payload.trough_water_depth_cm,
            soil_moisture_saturation_pct=payload.soil_moisture_saturation_pct,
            eriophorum_tussock_height_cm=payload.eriophorum_tussock_height_cm,
            pack_load_kg=payload.pack_load_kg,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    matched_site = get_site_by_id(payload.site_id) if payload.site_id else None
    return {
        "calculation": calc,
        "site": matched_site,
        "gear_checklist": get_gear_checklist(),
    }


@router.get("/calculate")
def calculate_thermokarst_tundra_get(
    active_layer_depth_cm: float = Query(default=55.0, ge=10.0, le=160.0),
    trough_water_depth_cm: float = Query(default=35.0, ge=0.0, le=140.0),
    soil_moisture_saturation_pct: float = Query(default=75.0, ge=20.0, le=100.0),
    eriophorum_tussock_height_cm: float = Query(default=30.0, ge=5.0, le=75.0),
    pack_load_kg: float = Query(default=18.0, ge=0.0, le=45.0),
    site_id: str | None = Query(default=None),
) -> dict[str, Any]:
    """GET endpoint for thermokarst tundra suprapermafrost liquefaction calculation."""
    try:
        calc = calculate_thermokarst_tundra(
            active_layer_depth_cm=active_layer_depth_cm,
            trough_water_depth_cm=trough_water_depth_cm,
            soil_moisture_saturation_pct=soil_moisture_saturation_pct,
            eriophorum_tussock_height_cm=eriophorum_tussock_height_cm,
            pack_load_kg=pack_load_kg,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    matched_site = get_site_by_id(site_id) if site_id else None
    return {
        "calculation": calc,
        "site": matched_site,
        "gear_checklist": get_gear_checklist(),
    }


@router.get("/checklist")
def get_thermokarst_tundra_checklist() -> dict[str, Any]:
    """Return the 6-item essential thermokarst tundra navigation gear checklist."""
    checklist = get_gear_checklist()
    return {
        "total": len(checklist),
        "gear_checklist": checklist,
    }
