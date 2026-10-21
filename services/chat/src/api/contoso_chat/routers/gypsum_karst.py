"""FastAPI router for the Subterranean Gypsum-Karst Dissolution Maze & Evaporite Breakdown-Hall Speleology Guide."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from contoso_chat.gypsum_karst import (
    calculate_gypsum_karst,
    filter_sites,
    get_gear_checklist,
    get_site_by_id,
)

router = APIRouter(tags=["gypsum-karst"])


class GypsumKarstCalculateRequest(BaseModel):
    """Request schema for POST /gypsum-karst/calculate."""

    junction_count_per_100m: float = Field(
        default=18.0,
        ge=2.0,
        le=45.0,
        description="Number of 3D rectilinear joint intersections per 100 m of passage (2 to 45)",
    )
    ceiling_bed_thickness_cm: float = Field(
        default=24.0,
        ge=2.0,
        le=120.0,
        description="Thickness of the immediate overhead gypsum/selenite ceiling bed in cm (2 to 120)",
    )
    surface_rain_inflow_mm_hr: float = Field(
        default=12.0,
        ge=0.0,
        le=80.0,
        description="Surface rainfall / sinkhole catchment inflow rate in mm/hr (0 to 80)",
    )
    anhydrite_swelling_pct: float = Field(
        default=28.0,
        ge=0.0,
        le=65.0,
        description="Anhydrite-to-gypsum hydration volumetric expansion & buckling strain percentage (0 to 65)",
    )
    party_acoustic_decibels: float = Field(
        default=68.0,
        ge=35.0,
        le=110.0,
        description="Caver party acoustic / hammer vibration level in decibels (35 to 110)",
    )
    site_id: str | None = Field(
        default=None,
        description="Optional gypsum-karst site ID for contextual site metadata",
    )


@router.get("/sites")
def list_gypsum_karst_sites(
    country: str | None = Query(
        default=None,
        description="Filter by country (Ukraine, Italy, Spain, USA)",
    ),
    morphology: str | None = Query(
        default=None,
        description="Filter by evaporite karst morphology (artesian-rectilinear-joint-labyrinth, messinian-selenite-epigenetic-gorge, arid-ephemeral-evaporite-sink, permian-anhydrite-hydration-dome)",
    ),
    regime: str | None = Query(
        default=None,
        description="Alias filter for morphology",
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
    """List subterranean gypsum-karst dissolution maze & evaporite breakdown-hall sites with optional filtering."""
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
def get_gypsum_karst_site_detail(site_id: str) -> dict[str, Any]:
    """Retrieve a single gypsum-karst site by ID with its baseline hazard calculation."""
    site = get_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Gypsum-karst site '{site_id}' not found.",
        )
    baseline = calculate_gypsum_karst(
        junction_count_per_100m=float(site["default_junction_count_per_100m"]),
        ceiling_bed_thickness_cm=float(site["default_ceiling_bed_thickness_cm"]),
        surface_rain_inflow_mm_hr=float(site["default_surface_rain_inflow_mm_hr"]),
        anhydrite_swelling_pct=float(site["default_anhydrite_swelling_pct"]),
        party_acoustic_decibels=float(site["default_party_acoustic_decibels"]),
    )
    return {
        "site": dict(site),
        "baseline_calculation": baseline,
        "gear_checklist": get_gear_checklist(),
    }


@router.post("/calculate")
def calculate_gypsum_karst_post(
    payload: GypsumKarstCalculateRequest,
) -> dict[str, Any]:
    """Run deterministic gypsum-karst hazard calculation via POST."""
    try:
        calc = calculate_gypsum_karst(
            junction_count_per_100m=payload.junction_count_per_100m,
            ceiling_bed_thickness_cm=payload.ceiling_bed_thickness_cm,
            surface_rain_inflow_mm_hr=payload.surface_rain_inflow_mm_hr,
            anhydrite_swelling_pct=payload.anhydrite_swelling_pct,
            party_acoustic_decibels=payload.party_acoustic_decibels,
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
def calculate_gypsum_karst_get(
    junction_count_per_100m: float = Query(default=18.0, ge=2.0, le=45.0),
    ceiling_bed_thickness_cm: float = Query(default=24.0, ge=2.0, le=120.0),
    surface_rain_inflow_mm_hr: float = Query(default=12.0, ge=0.0, le=80.0),
    anhydrite_swelling_pct: float = Query(default=28.0, ge=0.0, le=65.0),
    party_acoustic_decibels: float = Query(default=68.0, ge=35.0, le=110.0),
    site_id: str | None = Query(default=None),
) -> dict[str, Any]:
    """Run deterministic gypsum-karst hazard calculation via GET query parameters."""
    try:
        calc = calculate_gypsum_karst(
            junction_count_per_100m=junction_count_per_100m,
            ceiling_bed_thickness_cm=ceiling_bed_thickness_cm,
            surface_rain_inflow_mm_hr=surface_rain_inflow_mm_hr,
            anhydrite_swelling_pct=anhydrite_swelling_pct,
            party_acoustic_decibels=party_acoustic_decibels,
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
def get_gypsum_karst_checklist() -> dict[str, Any]:
    """Return the essential 6-item gear checklist for gypsum-karst expeditions."""
    checklist = get_gear_checklist()
    return {
        "total": len(checklist),
        "gear_checklist": checklist,
    }
