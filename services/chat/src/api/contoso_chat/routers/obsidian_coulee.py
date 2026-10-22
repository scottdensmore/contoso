"""FastAPI router for the High-Altitude Volcanic Obsidian-Flow & Glass-Block Coulee Scrambling Guide."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from contoso_chat.obsidian_coulee import (
    OBSIDIAN_COULEE_SITES,
    calculate_obsidian_coulee,
    filter_sites,
    get_gear_checklist,
)

router = APIRouter(tags=["obsidian-coulee"])


class ObsidianCouleeCalculateRequest(BaseModel):
    """Request schema for POST /calculate on volcanic obsidian-flow coulees."""

    conchoidal_flake_density_pct: float = Field(
        default=55.0,
        ge=5.0,
        le=100.0,
        description="Surface coverage of razor-sharp conchoidal volcanic glass flakes in percent (5–100%).",
    )
    block_instability_tilt_deg: float = Field(
        default=22.0,
        ge=2.0,
        le=48.0,
        description="Angular block teeter / talus repose tilt in degrees (2–48°).",
    )
    vesicular_pumice_crust_ratio_pct: float = Field(
        default=35.0,
        ge=5.0,
        le=95.0,
        description="Proportion of frothy vesicular pumice carapace crust spanning glass blocks in percent (5–95%).",
    )
    coulee_crest_relief_m: float = Field(
        default=45.0,
        ge=5.0,
        le=140.0,
        description="Local pressure-ridge or coulee lobe crest relief in meters (5–140 m).",
    )
    scrambler_pack_mass_kg: float = Field(
        default=16.0,
        ge=4.0,
        le=45.0,
        description="Scrambler pack mass in kilograms (4–45 kg).",
    )


def _enrich_site(site: dict[str, Any]) -> dict[str, Any]:
    enriched = dict(site)
    calc_info: dict[str, Any] = calculate_obsidian_coulee(
        conchoidal_flake_density_pct=float(site["default_conchoidal_flake_density_pct"]),
        block_instability_tilt_deg=float(site["default_block_instability_tilt_deg"]),
        vesicular_pumice_crust_ratio_pct=float(
            site["default_vesicular_pumice_crust_ratio_pct"]
        ),
        coulee_crest_relief_m=float(site["default_coulee_crest_relief_m"]),
        scrambler_pack_mass_kg=float(site["default_scrambler_pack_mass_kg"]),
    )
    enriched["calc_summary"] = calc_info
    return enriched


@router.get("/sites")
def list_obsidian_coulee_sites(
    country: str | None = Query(default=None, description="Filter by country name"),
    lithology: str | None = Query(
        default=None, description="Filter by obsidian coulee lithology"
    ),
    coulee_type: str | None = Query(
        default=None, description="Alias for lithology"
    ),
    morphology: str | None = Query(
        default=None, description="Alias for lithology"
    ),
    substrate_type: str | None = Query(
        default=None, description="Alias for lithology"
    ),
    difficulty: str | None = Query(
        default=None,
        description="Filter by difficulty (moderate, challenging, extreme)",
    ),
    search: str | None = Query(
        default=None, description="Free-text search across name, region, and hazards"
    ),
) -> dict[str, Any]:
    """List and filter high-altitude volcanic obsidian-flow & glass-block coulee sites."""
    matched = filter_sites(
        country=country,
        lithology=lithology,
        difficulty=difficulty,
        search=search,
        coulee_type=coulee_type,
        morphology=morphology,
        substrate_type=substrate_type,
    )
    sites = [_enrich_site(s) for s in matched]
    return {
        "sites": sites,
        "total": len(sites),
        "filters": {
            "country": country,
            "lithology": lithology or coulee_type or morphology or substrate_type,
            "difficulty": difficulty,
            "search": search,
        },
    }


@router.get("/sites/{site_id}")
def get_obsidian_coulee_site(site_id: str) -> dict[str, Any]:
    """Get a single high-altitude volcanic obsidian-flow coulee site by ID."""
    for site in OBSIDIAN_COULEE_SITES:
        if site["id"] == site_id:
            return _enrich_site(site)
    raise HTTPException(
        status_code=404,
        detail=f"Obsidian coulee site '{site_id}' not found",
    )


@router.post("/calculate")
def post_calculate_obsidian_coulee(
    payload: ObsidianCouleeCalculateRequest,
) -> dict[str, Any]:
    """Run the deterministic volcanic obsidian-flow coulee scrambling calculator via POST."""
    try:
        calc_info: dict[str, Any] = calculate_obsidian_coulee(
            conchoidal_flake_density_pct=payload.conchoidal_flake_density_pct,
            block_instability_tilt_deg=payload.block_instability_tilt_deg,
            vesicular_pumice_crust_ratio_pct=payload.vesicular_pumice_crust_ratio_pct,
            coulee_crest_relief_m=payload.coulee_crest_relief_m,
            scrambler_pack_mass_kg=payload.scrambler_pack_mass_kg,
        )
        return calc_info
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/calculate")
def get_calculate_obsidian_coulee(
    conchoidal_flake_density_pct: float = Query(default=55.0, ge=5.0, le=100.0),
    block_instability_tilt_deg: float = Query(default=22.0, ge=2.0, le=48.0),
    vesicular_pumice_crust_ratio_pct: float = Query(default=35.0, ge=5.0, le=95.0),
    coulee_crest_relief_m: float = Query(default=45.0, ge=5.0, le=140.0),
    scrambler_pack_mass_kg: float = Query(default=16.0, ge=4.0, le=45.0),
) -> dict[str, Any]:
    """Run the deterministic volcanic obsidian-flow coulee scrambling calculator via GET."""
    try:
        calc_info: dict[str, Any] = calculate_obsidian_coulee(
            conchoidal_flake_density_pct=conchoidal_flake_density_pct,
            block_instability_tilt_deg=block_instability_tilt_deg,
            vesicular_pumice_crust_ratio_pct=vesicular_pumice_crust_ratio_pct,
            coulee_crest_relief_m=coulee_crest_relief_m,
            scrambler_pack_mass_kg=scrambler_pack_mass_kg,
        )
        return calc_info
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/checklist")
def get_obsidian_coulee_checklist() -> dict[str, Any]:
    """Get the 6-item essential gear checklist for volcanic obsidian-flow coulee scrambling."""
    checklist = get_gear_checklist()
    return {
        "checklist": checklist,
        "gear": checklist,
        "total": len(checklist),
    }


@router.get("/gear")
def get_obsidian_coulee_gear() -> dict[str, Any]:
    """Alias endpoint returning the essential gear checklist."""
    checklist = get_gear_checklist()
    return {
        "checklist": checklist,
        "gear": checklist,
        "total": len(checklist),
    }
