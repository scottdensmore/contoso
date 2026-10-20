"""FastAPI router for the Subalpine Boulder-Talus Air-Draft Ice Cave & Cold-Trap Block-Field Navigation Guide."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from contoso_chat.talus_cold_trap import (
    calculate_talus_cold_trap,
    filter_sites,
    get_gear_checklist,
    get_site_by_id,
)

router = APIRouter(tags=["talus-cold-trap"])


class TalusColdTrapCalculateRequest(BaseModel):
    """Request schema for POST /talus-cold-trap/calculate."""

    ambient_air_temp_c: float = Field(
        default=20.0,
        ge=-10.0,
        le=38.0,
        description="External ambient summer/shoulder-season air temperature in °C (-10 to 38)",
    )
    crevice_void_depth_m: float = Field(
        default=10.0,
        ge=1.0,
        le=35.0,
        description="Vertical depth of the sub-talus boulder crevice or cold-trap void in meters (1.0 to 35.0)",
    )
    moss_humus_masking_pct: float = Field(
        default=65.0,
        ge=0.0,
        le=100.0,
        description="Percentage of boulder gaps masked by suspended Sphagnum/Hylocomium moss and organic humus carpets (0 to 100)",
    )
    boulder_block_span_m: float = Field(
        default=3.2,
        ge=0.4,
        le=12.0,
        description="Characteristic boulder block span across cold-trap voids in meters (0.4 to 12.0)",
    )
    cold_draft_velocity_ms: float = Field(
        default=2.4,
        ge=0.1,
        le=8.5,
        description="Katabatic / barometric cold-air draft efflux velocity in m/s (0.1 to 8.5)",
    )
    site_id: str | None = Field(
        default=None,
        description="Optional talus cold-trap site ID for contextual site metadata",
    )


@router.get("/sites")
def list_talus_cold_trap_sites(
    country: str | None = Query(
        default=None,
        description="Filter by country (USA, Czech Republic)",
    ),
    regime: str | None = Query(
        default=None,
        description="Filter by cold-trap thermodynamic regime (balch-chimney-megaboulder-gorge, anorthosite-pseudokarst-ice-chasm, algific-dolomite-cold-vent-slope, periglacial-block-stream-felsenmeer)",
    ),
    difficulty: str | None = Query(
        default=None,
        description="Filter by difficulty level (moderate, challenging, extreme)",
    ),
    search: str | None = Query(
        default=None,
        description="Free-text search query",
    ),
) -> dict[str, Any]:
    """List subalpine boulder-talus air-draft ice cave & cold-trap block-field sites with optional filtering."""
    sites = filter_sites(
        country=country,
        regime=regime,
        difficulty=difficulty,
        search=search,
    )
    return {
        "total": len(sites),
        "sites": [dict(s) for s in sites],
        "gear_checklist": get_gear_checklist(),
    }


@router.get("/sites/{site_id}")
def get_talus_cold_trap_site_detail(site_id: str) -> dict[str, Any]:
    """Retrieve a single talus cold-trap site by ID with its baseline hazard calculation."""
    site = get_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Talus cold-trap site '{site_id}' not found.",
        )
    baseline = calculate_talus_cold_trap(
        ambient_air_temp_c=float(site["default_ambient_air_temp_c"]),
        crevice_void_depth_m=float(site["default_crevice_void_depth_m"]),
        moss_humus_masking_pct=float(site["default_moss_humus_masking_pct"]),
        boulder_block_span_m=float(site["default_boulder_block_span_m"]),
        cold_draft_velocity_ms=float(site["default_cold_draft_velocity_ms"]),
    )
    return {
        "site": dict(site),
        "baseline_calculation": baseline,
        "gear_checklist": get_gear_checklist(),
    }


@router.post("/calculate")
def calculate_talus_cold_trap_post(
    payload: TalusColdTrapCalculateRequest,
) -> dict[str, Any]:
    """Run deterministic talus cold-trap hazard calculation via POST."""
    try:
        calc = calculate_talus_cold_trap(
            ambient_air_temp_c=payload.ambient_air_temp_c,
            crevice_void_depth_m=payload.crevice_void_depth_m,
            moss_humus_masking_pct=payload.moss_humus_masking_pct,
            boulder_block_span_m=payload.boulder_block_span_m,
            cold_draft_velocity_ms=payload.cold_draft_velocity_ms,
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
def calculate_talus_cold_trap_get(
    ambient_air_temp_c: float = Query(default=20.0, ge=-10.0, le=38.0),
    crevice_void_depth_m: float = Query(default=10.0, ge=1.0, le=35.0),
    moss_humus_masking_pct: float = Query(default=65.0, ge=0.0, le=100.0),
    boulder_block_span_m: float = Query(default=3.2, ge=0.4, le=12.0),
    cold_draft_velocity_ms: float = Query(default=2.4, ge=0.1, le=8.5),
    site_id: str | None = Query(default=None),
) -> dict[str, Any]:
    """Run deterministic talus cold-trap hazard calculation via GET query parameters."""
    try:
        calc = calculate_talus_cold_trap(
            ambient_air_temp_c=ambient_air_temp_c,
            crevice_void_depth_m=crevice_void_depth_m,
            moss_humus_masking_pct=moss_humus_masking_pct,
            boulder_block_span_m=boulder_block_span_m,
            cold_draft_velocity_ms=cold_draft_velocity_ms,
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
def get_talus_cold_trap_checklist() -> dict[str, Any]:
    """Return the essential 6-item gear checklist for talus cold-trap expeditions."""
    checklist = get_gear_checklist()
    return {
        "total": len(checklist),
        "gear_checklist": checklist,
    }
