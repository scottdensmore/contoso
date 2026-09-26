from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.pack_goat import (
    PackGoatGearItemModel,
    PackGoatRequest,
    PackGoatResponse,
    PackGoatRouteModel,
    calculate_pack_goat_payload,
    get_pack_goat_gear_checklist,
    get_pack_goat_route,
    get_pack_goat_routes,
)

router = APIRouter(prefix="", tags=["pack-goat"])


@router.get("/api/pack-goat/routes", response_model=list[PackGoatRouteModel])
@router.get("/pack-goat/routes", response_model=list[PackGoatRouteModel])
async def get_pack_goat_routes_endpoint(
    saddle_rigging: Optional[str] = None,
    rigging: Optional[str] = None,
) -> list[PackGoatRouteModel]:
    rig = saddle_rigging or rigging
    return get_pack_goat_routes(rigging=rig)


@router.get("/api/pack-goat/routes/{route_id}", response_model=PackGoatRouteModel)
@router.get("/pack-goat/routes/{route_id}", response_model=PackGoatRouteModel)
async def get_pack_goat_route_endpoint(route_id: str) -> PackGoatRouteModel:
    route = get_pack_goat_route(route_id)
    if not route:
        raise HTTPException(
            status_code=404,
            detail=f"Pack goat route '{route_id}' not found",
        )
    return route


@router.post("/api/pack-goat/calculate", response_model=PackGoatResponse)
@router.post("/pack-goat/calculate", response_model=PackGoatResponse)
async def calculate_pack_goat_endpoint(req: PackGoatRequest) -> PackGoatResponse:
    try:
        return calculate_pack_goat_payload(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/api/pack-goat/gear", response_model=list[PackGoatGearItemModel])
@router.get("/pack-goat/gear", response_model=list[PackGoatGearItemModel])
async def get_pack_goat_gear_endpoint() -> list[PackGoatGearItemModel]:
    return get_pack_goat_gear_checklist()
