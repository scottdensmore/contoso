"""FastAPI router for the Coastal Fjord Quick-Clay (Kvikkleire) Marine-Terrace & Retrogressive Slump Navigation Guide."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from contoso_chat.quick_clay_terrace import (
    QUICK_CLAY_TERRACE_SITES,
    calculate_quick_clay_terrace,
    filter_sites,
    get_gear_checklist,
)

router = APIRouter(tags=["quick-clay-terrace"])


class QuickClayTerraceCalculateRequest(BaseModel):
    """Request schema for POST /calculate on coastal fjord quick-clay marine terraces."""

    sensitivity_ratio_st: float = Field(
        default=65.0,
        ge=10.0,
        le=300.0,
        description="Clay sensitivity ratio St = undisturbed / remolded shear strength (10–300).",
    )
    pore_salinity_g_per_l: float = Field(
        default=0.8,
        ge=0.1,
        le=15.0,
        description="Pore-water NaCl salinity in g/L (0.1–15.0 g/L; leached quick clay typically < 1.0 g/L).",
    )
    ravine_slope_angle_deg: float = Field(
        default=24.0,
        ge=5.0,
        le=45.0,
        description="Ravine or marine-terrace bluff slope angle in degrees (5–45°).",
    )
    stream_toe_erosion_rate_cm_yr: float = Field(
        default=45.0,
        ge=0.0,
        le=150.0,
        description="Active stream-toe undercutting / bank erosion rate in cm/year (0–150 cm/yr).",
    )
    rainfall_saturation_pct: float = Field(
        default=65.0,
        ge=0.0,
        le=100.0,
        description="Pore-water / rainfall saturation percentage (0–100%).",
    )


def _enrich_site(site: dict[str, Any]) -> dict[str, Any]:
    enriched = dict(site)
    calc_info: dict[str, Any] = calculate_quick_clay_terrace(
        sensitivity_ratio_st=float(site["default_sensitivity_ratio_st"]),
        pore_salinity_g_per_l=float(site["default_pore_salinity_g_per_l"]),
        ravine_slope_angle_deg=float(site["default_ravine_slope_angle_deg"]),
        stream_toe_erosion_rate_cm_yr=float(
            site["default_stream_toe_erosion_rate_cm_yr"]
        ),
        rainfall_saturation_pct=float(site["default_rainfall_saturation_pct"]),
    )
    enriched["calc_summary"] = calc_info
    return enriched


@router.get("/sites")
def list_quick_clay_terrace_sites(
    country: str | None = Query(default=None, description="Filter by country name"),
    deposit_type: str | None = Query(
        default=None, description="Filter by glaciomarine deposit type"
    ),
    terrace_type: str | None = Query(
        default=None, description="Alias for deposit_type"
    ),
    morphology: str | None = Query(
        default=None, description="Alias for deposit_type"
    ),
    substrate_type: str | None = Query(
        default=None, description="Alias for deposit_type"
    ),
    lithology: str | None = Query(
        default=None, description="Alias for deposit_type"
    ),
    difficulty: str | None = Query(
        default=None,
        description="Filter by difficulty (moderate, challenging, extreme)",
    ),
    search: str | None = Query(
        default=None, description="Free-text search across name, region, and hazards"
    ),
) -> dict[str, Any]:
    """List and filter coastal fjord quick-clay (kvikkleire) marine-terrace sites."""
    matched = filter_sites(
        country=country,
        deposit_type=deposit_type,
        difficulty=difficulty,
        search=search,
        terrace_type=terrace_type,
        morphology=morphology,
        substrate_type=substrate_type,
        lithology=lithology,
    )
    sites = [_enrich_site(s) for s in matched]
    return {
        "sites": sites,
        "total": len(sites),
        "filters": {
            "country": country,
            "deposit_type": (
                deposit_type
                or terrace_type
                or morphology
                or substrate_type
                or lithology
            ),
            "difficulty": difficulty,
            "search": search,
        },
    }


@router.get("/sites/{site_id}")
def get_quick_clay_terrace_site(site_id: str) -> dict[str, Any]:
    """Get a single coastal fjord quick-clay marine-terrace site by ID."""
    for site in QUICK_CLAY_TERRACE_SITES:
        if site["id"] == site_id:
            return _enrich_site(site)
    raise HTTPException(
        status_code=404,
        detail=f"Quick-clay terrace site '{site_id}' not found",
    )


@router.post("/calculate")
def post_calculate_quick_clay_terrace(
    payload: QuickClayTerraceCalculateRequest,
) -> dict[str, Any]:
    """Run the deterministic coastal fjord quick-clay marine-terrace calculator via POST."""
    try:
        calc_info: dict[str, Any] = calculate_quick_clay_terrace(
            sensitivity_ratio_st=payload.sensitivity_ratio_st,
            pore_salinity_g_per_l=payload.pore_salinity_g_per_l,
            ravine_slope_angle_deg=payload.ravine_slope_angle_deg,
            stream_toe_erosion_rate_cm_yr=payload.stream_toe_erosion_rate_cm_yr,
            rainfall_saturation_pct=payload.rainfall_saturation_pct,
        )
        return calc_info
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/calculate")
def get_calculate_quick_clay_terrace(
    sensitivity_ratio_st: float = Query(default=65.0, ge=10.0, le=300.0),
    pore_salinity_g_per_l: float = Query(default=0.8, ge=0.1, le=15.0),
    ravine_slope_angle_deg: float = Query(default=24.0, ge=5.0, le=45.0),
    stream_toe_erosion_rate_cm_yr: float = Query(default=45.0, ge=0.0, le=150.0),
    rainfall_saturation_pct: float = Query(default=65.0, ge=0.0, le=100.0),
) -> dict[str, Any]:
    """Run the deterministic coastal fjord quick-clay marine-terrace calculator via GET."""
    try:
        calc_info: dict[str, Any] = calculate_quick_clay_terrace(
            sensitivity_ratio_st=sensitivity_ratio_st,
            pore_salinity_g_per_l=pore_salinity_g_per_l,
            ravine_slope_angle_deg=ravine_slope_angle_deg,
            stream_toe_erosion_rate_cm_yr=stream_toe_erosion_rate_cm_yr,
            rainfall_saturation_pct=rainfall_saturation_pct,
        )
        return calc_info
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/checklist")
def get_quick_clay_terrace_checklist() -> dict[str, Any]:
    """Get the 6-item essential gear checklist for quick-clay marine-terrace navigation."""
    checklist = get_gear_checklist()
    return {
        "checklist": checklist,
        "gear": checklist,
        "total": len(checklist),
    }


@router.get("/gear")
def get_quick_clay_terrace_gear() -> dict[str, Any]:
    """Alias endpoint returning the essential gear checklist."""
    checklist = get_gear_checklist()
    return {
        "checklist": checklist,
        "gear": checklist,
        "total": len(checklist),
    }
