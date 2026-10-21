"""FastAPI router for the Boreal String-Bog (Aapa Mire) Flark-Pool & Palsa Permafrost-Mound Crossing Guide."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from contoso_chat.aapa_palsa_mire import (
    calculate_aapa_palsa_mire,
    filter_sites,
    get_gear_checklist,
    get_site_by_id,
)

router = APIRouter(tags=["aapa-palsa-mire"])


class AapaPalsaMireCalculateRequest(BaseModel):
    """Request schema for POST /aapa-palsa-mire/calculate."""

    strang_width_m: float = Field(
        default=1.6,
        ge=0.3,
        le=6.0,
        description="Width of elevated peat ridge (sträng / jänne) in meters (0.3 to 6.0)",
    )
    flark_trough_span_m: float = Field(
        default=14.0,
        ge=1.0,
        le=65.0,
        description="Span of open-water or mud-bottom flark (rimpi) trough in meters (1.0 to 65.0)",
    )
    active_thaw_depth_cm: float = Field(
        default=55.0,
        ge=15.0,
        le=140.0,
        description="Suprapermafrost active-layer or mire water-table thaw depth in cm (15 to 140)",
    )
    palsa_rim_fissure_score: float = Field(
        default=40.0,
        ge=0.0,
        le=100.0,
        description="Palsa dome perimeter block-slump fissure & thermokarst lagg-moat instability score (0 to 100)",
    )
    hiker_pack_weight_kg: float = Field(
        default=22.0,
        ge=5.0,
        le=55.0,
        description="Hiker expedition pack load in kg (5 to 55)",
    )
    site_id: str | None = Field(
        default=None,
        description="Optional aapa-palsa mire site ID for contextual site metadata",
    )


@router.get("/sites")
def list_aapa_palsa_mire_sites(
    country: str | None = Query(
        default=None,
        description="Filter by country (Finland, Sweden, Canada, Norway)",
    ),
    morphology: str | None = Query(
        default=None,
        description="Filter by mire morphology (concentric-strang-flark-aapa, ice-cored-palsa-dome-plateau, thermokarst-lagg-moat-collapse, minerotrophic-sedge-carpet-fen)",
    ),
    regime: str | None = Query(
        default=None,
        description="Alias filter for morphology / hydrological regime",
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
    """List boreal string-bog (aapa mire) flark-pool & palsa permafrost-mound sites with optional filtering."""
    sites = filter_sites(
        country=country,
        morphology=morphology,
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
def get_aapa_palsa_mire_site_detail(site_id: str) -> dict[str, Any]:
    """Retrieve a single aapa-palsa mire site by ID with its baseline hazard calculation."""
    site = get_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Aapa-palsa mire site '{site_id}' not found.",
        )
    baseline = calculate_aapa_palsa_mire(
        strang_width_m=float(site["default_strang_width_m"]),
        flark_trough_span_m=float(site["default_flark_trough_span_m"]),
        active_thaw_depth_cm=float(site["default_active_thaw_depth_cm"]),
        palsa_rim_fissure_score=float(site["default_palsa_rim_fissure_score"]),
        hiker_pack_weight_kg=float(site["default_hiker_pack_weight_kg"]),
    )
    return {
        "site": dict(site),
        "baseline_calculation": baseline,
        "gear_checklist": get_gear_checklist(),
    }


@router.post("/calculate")
def calculate_aapa_palsa_mire_post(
    payload: AapaPalsaMireCalculateRequest,
) -> dict[str, Any]:
    """Run deterministic aapa-palsa mire hazard calculation via POST."""
    try:
        calc = calculate_aapa_palsa_mire(
            strang_width_m=payload.strang_width_m,
            flark_trough_span_m=payload.flark_trough_span_m,
            active_thaw_depth_cm=payload.active_thaw_depth_cm,
            palsa_rim_fissure_score=payload.palsa_rim_fissure_score,
            hiker_pack_weight_kg=payload.hiker_pack_weight_kg,
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
def calculate_aapa_palsa_mire_get(
    strang_width_m: float = Query(default=1.6, ge=0.3, le=6.0),
    flark_trough_span_m: float = Query(default=14.0, ge=1.0, le=65.0),
    active_thaw_depth_cm: float = Query(default=55.0, ge=15.0, le=140.0),
    palsa_rim_fissure_score: float = Query(default=40.0, ge=0.0, le=100.0),
    hiker_pack_weight_kg: float = Query(default=22.0, ge=5.0, le=55.0),
    site_id: str | None = Query(default=None),
) -> dict[str, Any]:
    """Run deterministic aapa-palsa mire hazard calculation via GET query parameters."""
    try:
        calc = calculate_aapa_palsa_mire(
            strang_width_m=strang_width_m,
            flark_trough_span_m=flark_trough_span_m,
            active_thaw_depth_cm=active_thaw_depth_cm,
            palsa_rim_fissure_score=palsa_rim_fissure_score,
            hiker_pack_weight_kg=hiker_pack_weight_kg,
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
def get_aapa_palsa_mire_checklist() -> dict[str, Any]:
    """Return the essential 6-item gear checklist for aapa-palsa mire expeditions."""
    checklist = get_gear_checklist()
    return {
        "total": len(checklist),
        "gear_checklist": checklist,
    }
