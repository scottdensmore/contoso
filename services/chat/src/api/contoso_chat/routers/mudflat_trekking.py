from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.mudflat_trekking import (
    MudflatGearModel,
    MudflatRequest,
    MudflatResponse,
    MudflatRouteModel,
    calculate_mudflat_dynamics,
    get_mudflat_gear_checklist,
    get_mudflat_route,
    get_mudflat_routes,
)

router = APIRouter(prefix="", tags=["mudflat-trekking"])


@router.get(
    "/api/mudflat-trekking/routes",
    response_model=list[MudflatRouteModel],
)
@router.get(
    "/mudflat-trekking/routes",
    response_model=list[MudflatRouteModel],
)
async def get_mudflat_routes_endpoint(
    terrain: Optional[str] = None,
    terrain_profile: Optional[str] = None,
) -> list[MudflatRouteModel]:
    target_terrain = terrain or terrain_profile
    return get_mudflat_routes(terrain=target_terrain)


@router.get(
    "/api/mudflat-trekking/routes/{route_id}",
    response_model=MudflatRouteModel,
)
@router.get(
    "/mudflat-trekking/routes/{route_id}",
    response_model=MudflatRouteModel,
)
async def get_mudflat_route_endpoint(
    route_id: str,
) -> MudflatRouteModel:
    route = get_mudflat_route(route_id)
    if not route:
        raise HTTPException(
            status_code=404,
            detail=f"Mudflat route '{route_id}' not found",
        )
    return route


@router.post(
    "/api/mudflat-trekking/calculate",
    response_model=MudflatResponse,
)
@router.post(
    "/mudflat-trekking/calculate",
    response_model=MudflatResponse,
)
async def calculate_mudflat_endpoint(
    req: MudflatRequest,
) -> MudflatResponse:
    try:
        return calculate_mudflat_dynamics(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get(
    "/api/mudflat-trekking/gear",
    response_model=list[MudflatGearModel],
)
@router.get(
    "/mudflat-trekking/gear",
    response_model=list[MudflatGearModel],
)
async def get_mudflat_gear_endpoint() -> list[MudflatGearModel]:
    return get_mudflat_gear_checklist()
