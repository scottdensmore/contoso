from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.pothole_escape import (
    PotholeCanyonRoute,
    PotholeDynamicsQuery,
    PotholeDynamicsResult,
    PotholeGearItem,
    calculate_pothole_dynamics,
    get_pothole_gear,
    get_pothole_route,
    get_pothole_routes,
)

router = APIRouter(tags=["pothole-escape"])


@router.get("/routes", response_model=list[PotholeCanyonRoute])
async def get_pothole_routes_endpoint(
    technique: Optional[str] = None,
) -> list[PotholeCanyonRoute]:
    return get_pothole_routes(technique=technique)


@router.get("/routes/{route_id}", response_model=PotholeCanyonRoute)
async def get_pothole_route_endpoint(route_id: str) -> PotholeCanyonRoute:
    route = get_pothole_route(route_id)
    if not route:
        raise HTTPException(
            status_code=404,
            detail=f"Pothole canyon route '{route_id}' not found",
        )
    return route


@router.post("/calculate", response_model=PotholeDynamicsResult)
async def calculate_pothole_dynamics_endpoint(
    query: PotholeDynamicsQuery,
) -> PotholeDynamicsResult:
    try:
        return calculate_pothole_dynamics(query)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/gear", response_model=list[PotholeGearItem])
async def get_pothole_gear_endpoint() -> list[PotholeGearItem]:
    return get_pothole_gear()
