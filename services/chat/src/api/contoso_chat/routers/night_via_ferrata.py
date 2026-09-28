from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.night_via_ferrata import (
    NightViaFerrataGearModel,
    NightViaFerrataRequest,
    NightViaFerrataResponse,
    NightViaFerrataRouteModel,
    calculate_night_via_ferrata_dynamics,
    get_night_via_ferrata_gear_checklist,
    get_night_via_ferrata_route,
    get_night_via_ferrata_routes,
)

router = APIRouter(prefix="", tags=["night-via-ferrata"])


@router.get(
    "/api/night-via-ferrata/routes",
    response_model=list[NightViaFerrataRouteModel],
)
@router.get(
    "/night-via-ferrata/routes",
    response_model=list[NightViaFerrataRouteModel],
)
async def get_night_via_ferrata_routes_endpoint(
    nocturnal_style: Optional[str] = None,
    style: Optional[str] = None,
) -> list[NightViaFerrataRouteModel]:
    target_style = nocturnal_style or style
    return get_night_via_ferrata_routes(style=target_style)


@router.get(
    "/api/night-via-ferrata/routes/{route_id}",
    response_model=NightViaFerrataRouteModel,
)
@router.get(
    "/night-via-ferrata/routes/{route_id}",
    response_model=NightViaFerrataRouteModel,
)
async def get_night_via_ferrata_route_endpoint(
    route_id: str,
) -> NightViaFerrataRouteModel:
    route = get_night_via_ferrata_route(route_id)
    if not route:
        raise HTTPException(
            status_code=404,
            detail=f"Night via ferrata route '{route_id}' not found",
        )
    return route


@router.post(
    "/api/night-via-ferrata/calculate",
    response_model=NightViaFerrataResponse,
)
@router.post(
    "/night-via-ferrata/calculate",
    response_model=NightViaFerrataResponse,
)
async def calculate_night_via_ferrata_endpoint(
    req: NightViaFerrataRequest,
) -> NightViaFerrataResponse:
    try:
        return calculate_night_via_ferrata_dynamics(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get(
    "/api/night-via-ferrata/gear",
    response_model=list[NightViaFerrataGearModel],
)
@router.get(
    "/night-via-ferrata/gear",
    response_model=list[NightViaFerrataGearModel],
)
async def get_night_via_ferrata_gear_endpoint() -> list[NightViaFerrataGearModel]:
    return get_night_via_ferrata_gear_checklist()
