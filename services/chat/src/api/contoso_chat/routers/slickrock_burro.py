from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.slickrock_burro import (
    BurroDynamicsQuery,
    BurroDynamicsResult,
    BurroGearItem,
    SlickrockBurroRoute,
    calculate_burro_dynamics,
    get_burro_gear,
    get_burro_route,
    get_burro_routes,
)

router = APIRouter(tags=["slickrock-burro"])


@router.get("/routes", response_model=list[SlickrockBurroRoute])
async def get_burro_routes_endpoint(
    terrain: Optional[str] = None,
) -> list[SlickrockBurroRoute]:
    return get_burro_routes(terrain=terrain)


@router.get("/routes/{route_id}", response_model=SlickrockBurroRoute)
async def get_burro_route_endpoint(route_id: str) -> SlickrockBurroRoute:
    route = get_burro_route(route_id)
    if not route:
        raise HTTPException(
            status_code=404,
            detail=f"Slickrock burro route '{route_id}' not found",
        )
    return route


@router.post("/calculate", response_model=BurroDynamicsResult)
async def calculate_burro_dynamics_endpoint(
    query: BurroDynamicsQuery,
) -> BurroDynamicsResult:
    try:
        return calculate_burro_dynamics(query)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/gear", response_model=list[BurroGearItem])
async def get_burro_gear_endpoint() -> list[BurroGearItem]:
    return get_burro_gear()
