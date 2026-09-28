from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.canyon_bouldering import (
    BoulderingGearModel,
    BoulderingRequest,
    BoulderingResponse,
    CanyonBoulderingSectorModel,
    calculate_bouldering_dynamics,
    get_canyon_bouldering_gear_checklist,
    get_canyon_bouldering_sector,
    get_canyon_bouldering_sectors,
)

router = APIRouter(prefix="", tags=["canyon-bouldering"])


@router.get(
    "/api/canyon-bouldering/sectors",
    response_model=list[CanyonBoulderingSectorModel],
)
@router.get(
    "/canyon-bouldering/sectors",
    response_model=list[CanyonBoulderingSectorModel],
)
async def get_canyon_bouldering_sectors_endpoint(
    bouldering_style: Optional[str] = None,
    style: Optional[str] = None,
) -> list[CanyonBoulderingSectorModel]:
    target_style = bouldering_style or style
    return get_canyon_bouldering_sectors(style=target_style)


@router.get(
    "/api/canyon-bouldering/sectors/{sector_id}",
    response_model=CanyonBoulderingSectorModel,
)
@router.get(
    "/canyon-bouldering/sectors/{sector_id}",
    response_model=CanyonBoulderingSectorModel,
)
async def get_canyon_bouldering_sector_endpoint(
    sector_id: str,
) -> CanyonBoulderingSectorModel:
    sector = get_canyon_bouldering_sector(sector_id)
    if not sector:
        raise HTTPException(
            status_code=404,
            detail=f"Canyon bouldering sector '{sector_id}' not found",
        )
    return sector


@router.post(
    "/api/canyon-bouldering/calculate",
    response_model=BoulderingResponse,
)
@router.post(
    "/canyon-bouldering/calculate",
    response_model=BoulderingResponse,
)
async def calculate_bouldering_endpoint(
    req: BoulderingRequest,
) -> BoulderingResponse:
    try:
        return calculate_bouldering_dynamics(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get(
    "/api/canyon-bouldering/gear",
    response_model=list[BoulderingGearModel],
)
@router.get(
    "/canyon-bouldering/gear",
    response_model=list[BoulderingGearModel],
)
async def get_canyon_bouldering_gear_endpoint() -> list[BoulderingGearModel]:
    return get_canyon_bouldering_gear_checklist()
