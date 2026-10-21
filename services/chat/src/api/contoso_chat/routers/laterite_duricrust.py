"""FastAPI router for the Tropical Laterite Duricrust Mesa & Bauxite Ferricrete Scarp-Edge Bushwhacking Guide."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from contoso_chat.laterite_duricrust import (
    LATERITE_DURICRUST_SITES,
    calculate_laterite_duricrust,
    filter_sites,
    get_gear_checklist,
)

router = APIRouter(tags=["laterite-duricrust"])


class LateriteDuricrustCalculateRequest(BaseModel):
    """Request schema for POST /calculate on laterite duricrust scarps."""

    pisolite_gravel_depth_mm: float = Field(
        default=18.0,
        ge=0.0,
        le=85.0,
        description="Loose pisolitic buckshot ironstone/bauxite gravel depth in millimeters (0–85 mm).",
    )
    scarp_slope_angle_deg: float = Field(
        default=24.0,
        ge=5.0,
        le=55.0,
        description="Beveled breakaway scarp shoulder slope angle in degrees (5–55°).",
    )
    saprolite_undercut_span_m: float = Field(
        default=1.4,
        ge=0.0,
        le=6.5,
        description="Pallid-zone / kaolinitic saprolite cavern undercut span beneath the caprock rim (0.0–6.5 m).",
    )
    surface_rock_temp_c: float = Field(
        default=48.0,
        ge=22.0,
        le=72.0,
        description="Dark ferricrete/canga surface rock temperature in °C (22–72 °C).",
    )
    convective_storm_proximity_km: float = Field(
        default=18.0,
        ge=1.0,
        le=60.0,
        description="Distance to nearest tropical convective thunderstorm cell in km (1.0–60.0 km).",
    )


def _enrich_site(site: dict[str, Any]) -> dict[str, Any]:
    enriched = dict(site)
    calc_info: dict[str, Any] = calculate_laterite_duricrust(
        pisolite_gravel_depth_mm=float(site["default_pisolite_gravel_depth_mm"]),
        scarp_slope_angle_deg=float(site["default_scarp_slope_angle_deg"]),
        saprolite_undercut_span_m=float(site["default_saprolite_undercut_span_m"]),
        surface_rock_temp_c=float(site["default_surface_rock_temp_c"]),
        convective_storm_proximity_km=float(site["default_convective_storm_proximity_km"]),
    )
    enriched["calc_summary"] = calc_info
    return enriched


@router.get("/sites")
def list_laterite_duricrust_sites(
    country: str | None = Query(default=None, description="Filter by country name"),
    duricrust_type: str | None = Query(
        default=None, description="Filter by duricrust morphology / type"
    ),
    morphology: str | None = Query(
        default=None, description="Alias for duricrust_type"
    ),
    substrate_type: str | None = Query(
        default=None, description="Alias for duricrust_type"
    ),
    difficulty: str | None = Query(
        default=None, description="Filter by difficulty (moderate, challenging, extreme)"
    ),
    search: str | None = Query(
        default=None, description="Free-text search across name, region, and hazards"
    ),
) -> dict[str, Any]:
    """List and filter tropical laterite duricrust & bauxite ferricrete sites."""
    matched = filter_sites(
        country=country,
        duricrust_type=duricrust_type,
        difficulty=difficulty,
        search=search,
        morphology=morphology,
        substrate_type=substrate_type,
    )
    sites = [_enrich_site(s) for s in matched]
    return {
        "sites": sites,
        "total": len(sites),
        "filters": {
            "country": country,
            "duricrust_type": duricrust_type or morphology or substrate_type,
            "difficulty": difficulty,
            "search": search,
        },
    }


@router.get("/sites/{site_id}")
def get_laterite_duricrust_site(site_id: str) -> dict[str, Any]:
    """Get a single tropical laterite duricrust site by ID."""
    for site in LATERITE_DURICRUST_SITES:
        if site["id"] == site_id:
            return _enrich_site(site)
    raise HTTPException(
        status_code=404,
        detail=f"Laterite duricrust site '{site_id}' not found",
    )


@router.post("/calculate")
def post_calculate_laterite_duricrust(
    payload: LateriteDuricrustCalculateRequest,
) -> dict[str, Any]:
    """Run the deterministic laterite duricrust scarp & pisolite calculator via POST."""
    try:
        calc_info: dict[str, Any] = calculate_laterite_duricrust(
            pisolite_gravel_depth_mm=payload.pisolite_gravel_depth_mm,
            scarp_slope_angle_deg=payload.scarp_slope_angle_deg,
            saprolite_undercut_span_m=payload.saprolite_undercut_span_m,
            surface_rock_temp_c=payload.surface_rock_temp_c,
            convective_storm_proximity_km=payload.convective_storm_proximity_km,
        )
        return calc_info
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/calculate")
def get_calculate_laterite_duricrust(
    pisolite_gravel_depth_mm: float = Query(default=18.0, ge=0.0, le=85.0),
    scarp_slope_angle_deg: float = Query(default=24.0, ge=5.0, le=55.0),
    saprolite_undercut_span_m: float = Query(default=1.4, ge=0.0, le=6.5),
    surface_rock_temp_c: float = Query(default=48.0, ge=22.0, le=72.0),
    convective_storm_proximity_km: float = Query(default=18.0, ge=1.0, le=60.0),
) -> dict[str, Any]:
    """Run the deterministic laterite duricrust scarp & pisolite calculator via GET."""
    try:
        calc_info: dict[str, Any] = calculate_laterite_duricrust(
            pisolite_gravel_depth_mm=pisolite_gravel_depth_mm,
            scarp_slope_angle_deg=scarp_slope_angle_deg,
            saprolite_undercut_span_m=saprolite_undercut_span_m,
            surface_rock_temp_c=surface_rock_temp_c,
            convective_storm_proximity_km=convective_storm_proximity_km,
        )
        return calc_info
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/checklist")
def get_laterite_duricrust_checklist() -> dict[str, Any]:
    """Get the 6-item essential gear checklist for laterite duricrust bushwhacking."""
    checklist = get_gear_checklist()
    return {
        "checklist": checklist,
        "gear": checklist,
        "total": len(checklist),
    }


@router.get("/gear")
def get_laterite_duricrust_gear() -> dict[str, Any]:
    """Alias endpoint returning the essential gear checklist."""
    checklist = get_gear_checklist()
    return {
        "checklist": checklist,
        "gear": checklist,
        "total": len(checklist),
    }
