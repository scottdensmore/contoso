from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.cave_diving import (
    CaveDivingGearModel,
    CaveDivingRequest,
    CaveDivingResponse,
    CaveDivingSiteModel,
    calculate_cave_diving_gas,
    get_cave_diving_gear_checklist,
    get_cave_diving_site,
    get_cave_diving_sites,
)

router = APIRouter(prefix="", tags=["cave-diving"])


@router.get("/api/cave-diving/sites", response_model=list[CaveDivingSiteModel])
@router.get("/cave-diving/sites", response_model=list[CaveDivingSiteModel])
async def get_cave_diving_sites_endpoint(
    rigging: Optional[str] = None,
) -> list[CaveDivingSiteModel]:
    return get_cave_diving_sites(rigging=rigging)


@router.get("/api/cave-diving/sites/{site_id}", response_model=CaveDivingSiteModel)
@router.get("/cave-diving/sites/{site_id}", response_model=CaveDivingSiteModel)
async def get_cave_diving_site_endpoint(site_id: str) -> CaveDivingSiteModel:
    site = get_cave_diving_site(site_id)
    if not site:
        raise HTTPException(
            status_code=404,
            detail=f"Cave diving site '{site_id}' not found",
        )
    return site


@router.post("/api/cave-diving/calculate", response_model=CaveDivingResponse)
@router.post("/cave-diving/calculate", response_model=CaveDivingResponse)
async def calculate_cave_diving_endpoint(req: CaveDivingRequest) -> CaveDivingResponse:
    try:
        return calculate_cave_diving_gas(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/api/cave-diving/gear", response_model=list[CaveDivingGearModel])
@router.get("/cave-diving/gear", response_model=list[CaveDivingGearModel])
async def get_cave_diving_gear_endpoint() -> list[CaveDivingGearModel]:
    return get_cave_diving_gear_checklist()
