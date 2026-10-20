"""FastAPI router for the Subterranean Cenote Halocline & Anchialine Phreatic Cave-Passage Guide."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from ..cenote_halocline import (
    calculate_cenote_halocline,
    filter_sites,
    get_gear_checklist,
    get_site_by_id,
)

router = APIRouter(tags=["cenote-halocline"])


class CenoteHaloclineCalculateRequest(BaseModel):
    """Request schema for POST /cenote-halocline/calculate."""

    salinity_delta_ppt: float = Field(
        default=28.0,
        ge=2.0,
        le=36.0,
        description="Salinity gradient across the freshwater/marine halocline interface (2-36 ppt).",
    )
    tannic_doc_mg_l: float = Field(
        default=12.0,
        ge=0.0,
        le=60.0,
        description="Tannic dissolved organic carbon concentration in the upper meteoric lens (0-60 mg/L).",
    )
    silt_clay_fraction_pct: float = Field(
        default=40.0,
        ge=0.0,
        le=100.0,
        description="Authigenic calcite & clay-silt fine sediment fraction on passage floors (0-100 %).",
    )
    penetration_distance_m: float = Field(
        default=250.0,
        ge=10.0,
        le=1200.0,
        description="Linear cave guideline penetration distance from nearest open cenote pool (10-1200 m).",
    )
    h2s_concentration_ppm: float = Field(
        default=2.0,
        ge=0.0,
        le=80.0,
        description="Dissolved hydrogen-sulfide (H2S) concentration in meromictic chemocline clouds (0-80 ppm).",
    )
    site_id: str | None = Field(
        default=None,
        description="Optional cenote halocline site ID for contextual comparison.",
    )


@router.get("/sites")
def list_cenote_halocline_sites(
    country: str | None = Query(default=None, description="Filter by country or region"),
    morphology: str | None = Query(
        default=None,
        description="Filter by cenote/anchialine morphology (e.g. anchialine-halocline-conduit)",
    ),
    difficulty: str | None = Query(
        default=None, description="Filter by difficulty (moderate, challenging, extreme)"
    ),
    search: str | None = Query(
        default=None, description="Free-text search across site name, region, hazard, or notes"
    ),
) -> dict[str, Any]:
    """List curated subterranean cenote halocline and anchialine phreatic cave sites."""
    sites = filter_sites(
        country=country,
        morphology=morphology,
        difficulty=difficulty,
        search=search,
    )
    return {
        "total": len(sites),
        "count": len(sites),
        "filters": {
            "country": country,
            "morphology": morphology,
            "difficulty": difficulty,
            "search": search,
        },
        "sites": sites,
        "gear_checklist": get_gear_checklist(),
    }


@router.get("/sites/{site_id}")
def get_cenote_halocline_site_detail(site_id: str) -> dict[str, Any]:
    """Retrieve a specific cenote halocline site with its baseline Schlieren calculation."""
    site = get_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Cenote halocline site '{site_id}' not found.",
        )
    baseline = calculate_cenote_halocline(
        salinity_delta_ppt=float(site["default_salinity_delta_ppt"]),
        tannic_doc_mg_l=float(site["default_tannic_doc_mg_l"]),
        silt_clay_fraction_pct=float(site["default_silt_clay_fraction_pct"]),
        penetration_distance_m=float(site["default_penetration_distance_m"]),
        h2s_concentration_ppm=float(site["default_h2s_concentration_ppm"]),
    )
    return {
        "site": site,
        "baseline_calculation": baseline,
        "gear_checklist": get_gear_checklist(),
    }


@router.post("/calculate")
def calculate_cenote_halocline_post(
    payload: CenoteHaloclineCalculateRequest,
) -> dict[str, Any]:
    """Calculate Schlieren optical blur, post-mix visibility, buoyancy trim shift, and gas reserve."""
    try:
        calc = calculate_cenote_halocline(
            salinity_delta_ppt=payload.salinity_delta_ppt,
            tannic_doc_mg_l=payload.tannic_doc_mg_l,
            silt_clay_fraction_pct=payload.silt_clay_fraction_pct,
            penetration_distance_m=payload.penetration_distance_m,
            h2s_concentration_ppm=payload.h2s_concentration_ppm,
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
def calculate_cenote_halocline_get(
    salinity_delta_ppt: float = Query(default=28.0, ge=2.0, le=36.0),
    tannic_doc_mg_l: float = Query(default=12.0, ge=0.0, le=60.0),
    silt_clay_fraction_pct: float = Query(default=40.0, ge=0.0, le=100.0),
    penetration_distance_m: float = Query(default=250.0, ge=10.0, le=1200.0),
    h2s_concentration_ppm: float = Query(default=2.0, ge=0.0, le=80.0),
    site_id: str | None = Query(default=None),
) -> dict[str, Any]:
    """GET endpoint for cenote halocline Schlieren blur & gas reserve calculation."""
    try:
        calc = calculate_cenote_halocline(
            salinity_delta_ppt=salinity_delta_ppt,
            tannic_doc_mg_l=tannic_doc_mg_l,
            silt_clay_fraction_pct=silt_clay_fraction_pct,
            penetration_distance_m=penetration_distance_m,
            h2s_concentration_ppm=h2s_concentration_ppm,
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
@router.get("/gear")
def get_cenote_halocline_checklist() -> dict[str, Any]:
    """Return the 6-item essential cenote halocline cave-diving gear checklist."""
    checklist = get_gear_checklist()
    return {
        "total": len(checklist),
        "gear_checklist": checklist,
    }
