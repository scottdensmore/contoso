"""FastAPI router for the Coastal Intertidal Sabellariid Worm-Reef & Barnacle-Encrusted Basalt Ledge Traversing Guide."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from contoso_chat.barnacle_ledge import (
    calculate_barnacle_ledge,
    filter_sites,
    get_gear_checklist,
    get_site_by_id,
)

router = APIRouter(tags=["barnacle-ledge"])


class BarnacleLedgeCalculateRequest(BaseModel):
    """Request schema for POST /barnacle-ledge/calculate."""

    swell_height_m: float = Field(
        default=1.8,
        ge=0.2,
        le=6.5,
        description="Significant offshore/nearshore swell height in meters (0.2 to 6.5)",
    )
    swell_period_sec: float = Field(
        default=12.0,
        ge=4.0,
        le=22.0,
        description="Dominant ocean swell period in seconds (4 to 22)",
    )
    algal_biofilm_cover_pct: float = Field(
        default=40.0,
        ge=0.0,
        le=100.0,
        description="Wet Porphyra/Ulva/Fucus algal mucilage biofilm coverage percentage (0 to 100)",
    )
    sabellariid_colony_density_pct: float = Field(
        default=35.0,
        ge=0.0,
        le=100.0,
        description="Fragile Sabellaria / Phragmatopoma honeycomb worm-reef coverage density percentage (0 to 100)",
    )
    ledge_freeboard_m: float = Field(
        default=1.6,
        ge=0.1,
        le=5.0,
        description="Vertical clearance of the intertidal ledge above current tide stage in meters (0.1 to 5.0)",
    )
    site_id: str | None = Field(
        default=None,
        description="Optional barnacle ledge site ID for contextual site metadata",
    )


@router.get("/sites")
def list_barnacle_ledge_sites(
    country: str | None = Query(
        default=None,
        description="Filter by country (USA, UK, Canada, Spain)",
    ),
    substrate_type: str | None = Query(
        default=None,
        description="Filter by intertidal substrate type (balanus-mussel-basalt-bench, sabellariid-honeycomb-worm-reef, porphyra-ulva-glazed-shelf, pollicipes-gooseneck-surge-channel)",
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
    """List intertidal sabellariid worm-reef & barnacle ledge sites with optional filtering."""
    sites = filter_sites(
        country=country,
        substrate_type=substrate_type,
        difficulty=difficulty,
        search=search,
    )
    return {
        "total": len(sites),
        "sites": [dict(s) for s in sites],
        "gear_checklist": get_gear_checklist(),
    }


@router.get("/sites/{site_id}")
def get_barnacle_ledge_site_detail(site_id: str) -> dict[str, Any]:
    """Retrieve a single barnacle ledge site by ID with its baseline hazard calculation."""
    site = get_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Barnacle ledge site '{site_id}' not found.",
        )
    baseline = calculate_barnacle_ledge(
        swell_height_m=float(site["default_swell_height_m"]),
        swell_period_sec=float(site["default_swell_period_sec"]),
        algal_biofilm_cover_pct=float(site["default_algal_biofilm_cover_pct"]),
        sabellariid_colony_density_pct=float(site["default_sabellariid_colony_density_pct"]),
        ledge_freeboard_m=float(site["default_ledge_freeboard_m"]),
    )
    return {
        "site": dict(site),
        "baseline_calculation": baseline,
        "gear_checklist": get_gear_checklist(),
    }


@router.post("/calculate")
def calculate_barnacle_ledge_post(
    payload: BarnacleLedgeCalculateRequest,
) -> dict[str, Any]:
    """Run deterministic barnacle ledge hazard calculation via POST."""
    try:
        calc = calculate_barnacle_ledge(
            swell_height_m=payload.swell_height_m,
            swell_period_sec=payload.swell_period_sec,
            algal_biofilm_cover_pct=payload.algal_biofilm_cover_pct,
            sabellariid_colony_density_pct=payload.sabellariid_colony_density_pct,
            ledge_freeboard_m=payload.ledge_freeboard_m,
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
def calculate_barnacle_ledge_get(
    swell_height_m: float = Query(default=1.8, ge=0.2, le=6.5),
    swell_period_sec: float = Query(default=12.0, ge=4.0, le=22.0),
    algal_biofilm_cover_pct: float = Query(default=40.0, ge=0.0, le=100.0),
    sabellariid_colony_density_pct: float = Query(default=35.0, ge=0.0, le=100.0),
    ledge_freeboard_m: float = Query(default=1.6, ge=0.1, le=5.0),
    site_id: str | None = Query(default=None),
) -> dict[str, Any]:
    """Run deterministic barnacle ledge hazard calculation via GET query parameters."""
    try:
        calc = calculate_barnacle_ledge(
            swell_height_m=swell_height_m,
            swell_period_sec=swell_period_sec,
            algal_biofilm_cover_pct=algal_biofilm_cover_pct,
            sabellariid_colony_density_pct=sabellariid_colony_density_pct,
            ledge_freeboard_m=ledge_freeboard_m,
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
def get_barnacle_ledge_checklist() -> dict[str, Any]:
    """Return the essential 6-item gear checklist for barnacle ledge expeditions."""
    checklist = get_gear_checklist()
    return {
        "total": len(checklist),
        "gear_checklist": checklist,
    }
