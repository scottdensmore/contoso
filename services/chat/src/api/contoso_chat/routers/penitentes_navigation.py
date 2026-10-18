from typing import Any, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from contoso_chat.penitentes_navigation import (
    AblationMorphologyType,
    CramponTraversalTechnique,
    DiurnalFreezeState,
    calculate_penitentes_navigation_dynamics,
    filter_penitentes_sites,
    get_penitentes_gear_checklist,
    get_penitentes_site_by_id,
)

router = APIRouter(tags=["penitentes-navigation"])


class PenitentesCalculateRequest(BaseModel):
    blade_height_cm: float = Field(default=120.0, ge=5.0, le=400.0)
    trough_spacing_cm: float = Field(default=65.0, ge=10.0, le=250.0)
    slope_angle_deg: float = Field(default=28.0, ge=0.0, le=65.0)
    snow_surface_temp_c: float = Field(default=-6.0, ge=-45.0, le=15.0)
    solar_irradiance_wm2: float = Field(default=350.0, ge=0.0, le=1600.0)
    pack_weight_kg: float = Field(default=16.0, ge=0.0, le=55.0)
    ablation_morphology: AblationMorphologyType = "mature_cathedral_nieves_penitentes"
    recommended_technique: CramponTraversalTechnique = "axe_belayed_blade_threading"
    diurnal_freeze_state: DiurnalFreezeState = "predawn_vitreous_lockup"
    site_id: Optional[str] = None


@router.get("/sites")
async def list_penitentes_sites(
    ablation_morphology: Optional[AblationMorphologyType] = None,
    recommended_technique: Optional[CramponTraversalTechnique] = None,
    diurnal_freeze_state: Optional[DiurnalFreezeState] = None,
) -> list[dict[str, Any]]:
    try:
        sites = filter_penitentes_sites(
            ablation_morphology=ablation_morphology,
            recommended_technique=recommended_technique,
            diurnal_freeze_state=diurnal_freeze_state,
        )
        return [dict(s) for s in sites]
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/sites/{site_id}")
async def get_penitentes_site_detail(site_id: str) -> dict[str, Any]:
    site = get_penitentes_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Penitentes navigation site '{site_id}' not found",
        )
    return dict(site)


@router.post("/calculate")
async def calculate_penitentes_navigation_endpoint(
    payload: PenitentesCalculateRequest,
) -> dict[str, Any]:
    try:
        result = calculate_penitentes_navigation_dynamics(
            blade_height_cm=payload.blade_height_cm,
            trough_spacing_cm=payload.trough_spacing_cm,
            slope_angle_deg=payload.slope_angle_deg,
            snow_surface_temp_c=payload.snow_surface_temp_c,
            solar_irradiance_wm2=payload.solar_irradiance_wm2,
            pack_weight_kg=payload.pack_weight_kg,
            ablation_morphology=payload.ablation_morphology,
            recommended_technique=payload.recommended_technique,
            diurnal_freeze_state=payload.diurnal_freeze_state,
            site_id=payload.site_id,
        )
        return dict(result)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/gear")
async def list_penitentes_gear() -> list[dict[str, Any]]:
    return [dict(item) for item in get_penitentes_gear_checklist()]
