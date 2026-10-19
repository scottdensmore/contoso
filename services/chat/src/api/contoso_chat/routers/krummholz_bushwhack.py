"""FastAPI router for Subalpine Krummholz & Wind-Sculpted Dwarf-Conifer Thicket Bushwhacking Guide."""

from typing import Any, Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from ..krummholz_bushwhack import (
    calculate_krummholz_bushwhack,
    filter_sites,
    get_gear_checklist,
    get_site_by_id,
)

router = APIRouter(tags=["krummholz-bushwhack"])


class KrummholzBushwhackCalculateRequest(BaseModel):
    stems_per_sq_meter: float = Field(
        default=12.0,
        ge=1.0,
        le=45.0,
        description="Prostrate and interlocking woody stem density in stems/m2 (1 to 45)",
    )
    canopy_mat_height_m: float = Field(
        default=1.4,
        ge=0.3,
        le=3.5,
        description="Vertical thickness/height of the dwarf-conifer krummholz canopy mat in meters (0.3 to 3.5)",
    )
    snow_moat_depth_cm: float = Field(
        default=40.0,
        ge=0.0,
        le=250.0,
        description="Sub-canopy hollow snow moat or spruce-trap void depth in cm (0 to 250)",
    )
    slope_angle_deg: float = Field(
        default=18.0,
        ge=0.0,
        le=50.0,
        description="Subalpine terrain slope angle in degrees (0 to 50)",
    )
    pack_width_cm: float = Field(
        default=45.0,
        ge=25.0,
        le=85.0,
        description="Effective horizontal backpack profile width in cm (25 to 85)",
    )


class KrummholzBushwhackCalculateResponse(BaseModel):
    stems_per_sq_meter: float
    canopy_mat_height_m: float
    snow_moat_depth_cm: float
    slope_angle_deg: float
    pack_width_cm: float
    effective_velocity_km_h: float
    tree_well_spruce_trap_risk_pct: float
    metabolic_kcal_per_hour: float
    branch_snag_resistance_index: float
    risk_level: str
    safety_status: str
    transit_strategy: str
    warnings: list[str]
    recommendations: list[str]


@router.get("/sites")
async def list_krummholz_bushwhack_sites(
    country: Optional[str] = Query(default=None, description="Filter by country"),
    ecotype: Optional[str] = Query(
        default=None,
        description=(
            "Filter by krummholz ecotype (balsam-fir-spruce-mat, "
            "mountain-pine-latschen-labyrinth, subalpine-larch-alder-thicket, "
            "wind-flagged-whitebark-cushion)"
        ),
    ),
    difficulty: Optional[str] = Query(
        default=None,
        description="Filter by difficulty (moderate, challenging, extreme)",
    ),
    search: Optional[str] = Query(default=None, description="Free-text search"),
) -> list[dict[str, Any]]:
    """Return subalpine krummholz & dwarf-conifer bushwhacking sites with optional filtering."""
    return filter_sites(
        country=country,
        ecotype=ecotype,
        difficulty=difficulty,
        search=search,
    )


@router.get("/sites/{site_id}")
async def get_krummholz_bushwhack_site(site_id: str) -> dict[str, Any]:
    """Return a single krummholz bushwhack site by ID."""
    site = get_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Krummholz bushwhack site '{site_id}' not found",
        )
    return site


@router.post("/calculate", response_model=KrummholzBushwhackCalculateResponse)
async def calculate_krummholz_bushwhack_endpoint(
    payload: KrummholzBushwhackCalculateRequest,
) -> dict[str, Any]:
    """Calculate effective bushwhacking velocity, spruce-trap risk, metabolic burn, and branch-snag index."""
    try:
        return calculate_krummholz_bushwhack(
            stems_per_sq_meter=payload.stems_per_sq_meter,
            canopy_mat_height_m=payload.canopy_mat_height_m,
            snow_moat_depth_cm=payload.snow_moat_depth_cm,
            slope_angle_deg=payload.slope_angle_deg,
            pack_width_cm=payload.pack_width_cm,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/checklist")
async def get_krummholz_bushwhack_checklist() -> list[dict[str, Any]]:
    """Return the mandatory krummholz & dwarf-conifer bushwhacking gear checklist."""
    return get_gear_checklist()


@router.get("/gear")
async def get_krummholz_bushwhack_gear() -> list[dict[str, Any]]:
    """Return the mandatory krummholz & dwarf-conifer bushwhacking gear checklist (alias)."""
    return get_gear_checklist()
