"""FastAPI router for the Subglacial Jökulhlaup Ice-Dammed Lake Outburst & Proglacial Canyon Escape Guide."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from contoso_chat.jokulhlaup_escape import (
    calculate_jokulhlaup_escape,
    filter_sites,
    get_gear_checklist,
    get_site_by_id,
)

router = APIRouter(tags=["jokulhlaup-escape"])


class JokulhlaupEscapeCalculateRequest(BaseModel):
    """Request schema for POST /jokulhlaup-escape/calculate."""

    ice_dam_drawdown_cm_per_hr: float = Field(
        default=45.0,
        ge=0.0,
        le=250.0,
        description="Ice-dammed lake or cauldron surface drawdown rate in cm/hr (0 to 250)",
    )
    proglacial_conductivity_us_cm: float = Field(
        default=280.0,
        ge=20.0,
        le=1200.0,
        description="Proglacial outlet electrical conductivity in µS/cm (20 to 1200)",
    )
    subglacial_tremor_amplitude_um: float = Field(
        default=6.5,
        ge=0.1,
        le=50.0,
        description="1-15 Hz subglacial harmonic tremor amplitude in µm (0.1 to 50.0)",
    )
    canyon_floor_distance_from_portal_km: float = Field(
        default=4.5,
        ge=0.2,
        le=40.0,
        description="Downstream distance along proglacial canyon floor from glacier portal in km (0.2 to 40.0)",
    )
    vertical_gain_to_safe_terrace_m: float = Field(
        default=55.0,
        ge=5.0,
        le=220.0,
        description="Vertical climb required to reach safe bedrock terrace above flood stage in meters (5 to 220)",
    )
    site_id: str | None = Field(
        default=None,
        description="Optional jökulhlaup escape site ID for contextual site metadata",
    )


@router.get("/sites")
def list_jokulhlaup_escape_sites(
    country: str | None = Query(
        default=None,
        description="Filter by country (Iceland, USA, Chile, Pakistan / China)",
    ),
    trigger_mechanism: str | None = Query(
        default=None,
        description="Filter by outburst trigger mechanism (subglacial-geothermal-caldera, marginal-ice-dam-flotation, supraglacial-englacial-conduit, moraine-ice-core-piping)",
    ),
    difficulty: str | None = Query(
        default=None,
        description="Filter by difficulty level (challenging, extreme)",
    ),
    search: str | None = Query(
        default=None,
        description="Free-text search query",
    ),
) -> dict[str, Any]:
    """List subglacial jökulhlaup & ice-dammed lake outburst sites with optional filtering."""
    sites = filter_sites(
        country=country,
        trigger_mechanism=trigger_mechanism,
        difficulty=difficulty,
        search=search,
    )
    return {
        "total": len(sites),
        "sites": [dict(s) for s in sites],
        "gear_checklist": get_gear_checklist(),
    }


@router.get("/sites/{site_id}")
def get_jokulhlaup_escape_site_detail(site_id: str) -> dict[str, Any]:
    """Retrieve a single jökulhlaup escape site by ID with its baseline hazard calculation."""
    site = get_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Jökulhlaup escape site '{site_id}' not found.",
        )
    baseline = calculate_jokulhlaup_escape(
        ice_dam_drawdown_cm_per_hr=float(site["default_ice_dam_drawdown_cm_per_hr"]),
        proglacial_conductivity_us_cm=float(site["default_proglacial_conductivity_us_cm"]),
        subglacial_tremor_amplitude_um=float(site["default_subglacial_tremor_amplitude_um"]),
        canyon_floor_distance_from_portal_km=float(
            site["default_canyon_floor_distance_from_portal_km"]
        ),
        vertical_gain_to_safe_terrace_m=float(site["default_vertical_gain_to_safe_terrace_m"]),
    )
    return {
        "site": dict(site),
        "baseline_calculation": baseline,
        "gear_checklist": get_gear_checklist(),
    }


@router.post("/calculate")
def calculate_jokulhlaup_escape_post(
    payload: JokulhlaupEscapeCalculateRequest,
) -> dict[str, Any]:
    """Run deterministic jökulhlaup escape hazard calculation via POST."""
    try:
        calc = calculate_jokulhlaup_escape(
            ice_dam_drawdown_cm_per_hr=payload.ice_dam_drawdown_cm_per_hr,
            proglacial_conductivity_us_cm=payload.proglacial_conductivity_us_cm,
            subglacial_tremor_amplitude_um=payload.subglacial_tremor_amplitude_um,
            canyon_floor_distance_from_portal_km=payload.canyon_floor_distance_from_portal_km,
            vertical_gain_to_safe_terrace_m=payload.vertical_gain_to_safe_terrace_m,
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
def calculate_jokulhlaup_escape_get(
    ice_dam_drawdown_cm_per_hr: float = Query(default=45.0, ge=0.0, le=250.0),
    proglacial_conductivity_us_cm: float = Query(default=280.0, ge=20.0, le=1200.0),
    subglacial_tremor_amplitude_um: float = Query(default=6.5, ge=0.1, le=50.0),
    canyon_floor_distance_from_portal_km: float = Query(default=4.5, ge=0.2, le=40.0),
    vertical_gain_to_safe_terrace_m: float = Query(default=55.0, ge=5.0, le=220.0),
    site_id: str | None = Query(default=None),
) -> dict[str, Any]:
    """Run deterministic jökulhlaup escape hazard calculation via GET query parameters."""
    try:
        calc = calculate_jokulhlaup_escape(
            ice_dam_drawdown_cm_per_hr=ice_dam_drawdown_cm_per_hr,
            proglacial_conductivity_us_cm=proglacial_conductivity_us_cm,
            subglacial_tremor_amplitude_um=subglacial_tremor_amplitude_um,
            canyon_floor_distance_from_portal_km=canyon_floor_distance_from_portal_km,
            vertical_gain_to_safe_terrace_m=vertical_gain_to_safe_terrace_m,
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
def get_jokulhlaup_escape_checklist() -> dict[str, Any]:
    """Return the essential 6-item gear checklist for jökulhlaup escape expeditions."""
    checklist = get_gear_checklist()
    return {
        "total": len(checklist),
        "gear_checklist": checklist,
    }
