from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.crevasse_pulk import (
    CrevassePulkRoute,
    PulkDynamicsQuery,
    PulkDynamicsResult,
    PulkGearItem,
    calculate_pulk_dynamics,
    get_crevasse_pulk_gear,
    get_crevasse_pulk_route,
    get_crevasse_pulk_routes,
)

router = APIRouter(tags=["crevasse-pulk"])


@router.get("/routes", response_model=list[CrevassePulkRoute])
async def get_crevasse_pulk_routes_endpoint(
    terrain: Optional[str] = None,
    risk: Optional[str] = None,
) -> list[CrevassePulkRoute]:
    return get_crevasse_pulk_routes(terrain=terrain, risk=risk)


@router.get("/routes/{route_id}", response_model=CrevassePulkRoute)
async def get_crevasse_pulk_route_endpoint(route_id: str) -> CrevassePulkRoute:
    route = get_crevasse_pulk_route(route_id)
    if not route:
        raise HTTPException(
            status_code=404,
            detail=f"Crevasse pulk route '{route_id}' not found",
        )
    return route


@router.post("/calculate", response_model=PulkDynamicsResult)
async def calculate_pulk_dynamics_endpoint(
    query: PulkDynamicsQuery,
) -> PulkDynamicsResult:
    try:
        return calculate_pulk_dynamics(query)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/gear", response_model=list[PulkGearItem])
async def get_crevasse_pulk_gear_endpoint() -> list[PulkGearItem]:
    return get_crevasse_pulk_gear()
