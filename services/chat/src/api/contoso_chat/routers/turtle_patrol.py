from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.turtle_patrol import (
    TurtlePatrolGearModel,
    TurtlePatrolRequest,
    TurtlePatrolResponse,
    TurtlePatrolSectorModel,
    calculate_turtle_patrol_dynamics,
    get_turtle_patrol_gear_checklist,
    get_turtle_patrol_sector,
    get_turtle_patrol_sectors,
)

router = APIRouter(prefix="", tags=["turtle-patrol"])


@router.get("/api/turtle-patrol/sectors", response_model=list[TurtlePatrolSectorModel])
@router.get("/turtle-patrol/sectors", response_model=list[TurtlePatrolSectorModel])
async def get_turtle_patrol_sectors_endpoint(
    patrol_zone: Optional[str] = None,
) -> list[TurtlePatrolSectorModel]:
    return get_turtle_patrol_sectors(patrol_zone=patrol_zone)


@router.get("/api/turtle-patrol/sectors/{sector_id}", response_model=TurtlePatrolSectorModel)
@router.get("/turtle-patrol/sectors/{sector_id}", response_model=TurtlePatrolSectorModel)
async def get_turtle_patrol_sector_endpoint(sector_id: str) -> TurtlePatrolSectorModel:
    sector = get_turtle_patrol_sector(sector_id)
    if not sector:
        raise HTTPException(
            status_code=404,
            detail=f"Turtle patrol sector '{sector_id}' not found",
        )
    return sector


@router.post("/api/turtle-patrol/calculate", response_model=TurtlePatrolResponse)
@router.post("/turtle-patrol/calculate", response_model=TurtlePatrolResponse)
async def calculate_turtle_patrol_endpoint(req: TurtlePatrolRequest) -> TurtlePatrolResponse:
    try:
        return calculate_turtle_patrol_dynamics(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/api/turtle-patrol/gear", response_model=list[TurtlePatrolGearModel])
@router.get("/turtle-patrol/gear", response_model=list[TurtlePatrolGearModel])
async def get_turtle_patrol_gear_endpoint() -> list[TurtlePatrolGearModel]:
    return get_turtle_patrol_gear_checklist()
