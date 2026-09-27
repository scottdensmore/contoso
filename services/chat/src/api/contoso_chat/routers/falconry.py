from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.falconry import (
    FalconryGearModel,
    FalconryGroundModel,
    FalconryRequest,
    FalconryResponse,
    calculate_raptor_conditioning,
    get_falconry_gear_checklist,
    get_falconry_ground,
    get_falconry_grounds,
)

router = APIRouter(prefix="", tags=["falconry"])


@router.get("/api/falconry/grounds", response_model=list[FalconryGroundModel])
@router.get("/falconry/grounds", response_model=list[FalconryGroundModel])
async def get_falconry_grounds_endpoint(
    species: Optional[str] = None,
) -> list[FalconryGroundModel]:
    return get_falconry_grounds(species=species)


@router.get("/api/falconry/grounds/{ground_id}", response_model=FalconryGroundModel)
@router.get("/falconry/grounds/{ground_id}", response_model=FalconryGroundModel)
async def get_falconry_ground_endpoint(ground_id: str) -> FalconryGroundModel:
    ground = get_falconry_ground(ground_id)
    if not ground:
        raise HTTPException(
            status_code=404,
            detail=f"Falconry ground '{ground_id}' not found",
        )
    return ground


@router.post("/api/falconry/calculate", response_model=FalconryResponse)
@router.post("/falconry/calculate", response_model=FalconryResponse)
async def calculate_falconry_endpoint(req: FalconryRequest) -> FalconryResponse:
    try:
        return calculate_raptor_conditioning(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/api/falconry/gear", response_model=list[FalconryGearModel])
@router.get("/falconry/gear", response_model=list[FalconryGearModel])
async def get_falconry_gear_endpoint() -> list[FalconryGearModel]:
    return get_falconry_gear_checklist()
