from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.telemark_skiing import (
    TelemarkGearModel,
    TelemarkRequest,
    TelemarkResponse,
    TelemarkZoneModel,
    calculate_telemark_activity,
    get_telemark_gear_checklist,
    get_telemark_zone,
    get_telemark_zones,
)

router = APIRouter(prefix="", tags=["telemark-skiing"])


@router.get("/api/telemark-skiing/zones", response_model=list[TelemarkZoneModel])
@router.get("/telemark-skiing/zones", response_model=list[TelemarkZoneModel])
async def get_telemark_zones_endpoint(
    system: Optional[str] = None,
) -> list[TelemarkZoneModel]:
    return get_telemark_zones(system=system)


@router.get("/api/telemark-skiing/zones/{zone_id}", response_model=TelemarkZoneModel)
@router.get("/telemark-skiing/zones/{zone_id}", response_model=TelemarkZoneModel)
async def get_telemark_zone_endpoint(zone_id: str) -> TelemarkZoneModel:
    zone = get_telemark_zone(zone_id)
    if not zone:
        raise HTTPException(
            status_code=404,
            detail=f"Telemark zone '{zone_id}' not found",
        )
    return zone


@router.post("/api/telemark-skiing/calculate", response_model=TelemarkResponse)
@router.post("/telemark-skiing/calculate", response_model=TelemarkResponse)
async def calculate_telemark_endpoint(req: TelemarkRequest) -> TelemarkResponse:
    try:
        return calculate_telemark_activity(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/api/telemark-skiing/gear", response_model=list[TelemarkGearModel])
@router.get("/telemark-skiing/gear", response_model=list[TelemarkGearModel])
async def get_telemark_gear_endpoint() -> list[TelemarkGearModel]:
    return get_telemark_gear_checklist()
