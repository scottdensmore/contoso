from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.pack_llama import (
    PackLlamaGearModel,
    PackLlamaRequest,
    PackLlamaResponse,
    PackLlamaRouteModel,
    calculate_pack_llama_payload,
    get_pack_llama_gear_checklist,
    get_pack_llama_route,
    get_pack_llama_routes,
)

router = APIRouter(prefix="", tags=["pack-llama"])


@router.get("/api/pack-llama/routes", response_model=list[PackLlamaRouteModel])
@router.get("/pack-llama/routes", response_model=list[PackLlamaRouteModel])
async def get_pack_llama_routes_endpoint(
    saddle_rigging: Optional[str] = None,
    rigging: Optional[str] = None,
) -> list[PackLlamaRouteModel]:
    rig = saddle_rigging or rigging
    return get_pack_llama_routes(rigging=rig)


@router.get("/api/pack-llama/routes/{route_id}", response_model=PackLlamaRouteModel)
@router.get("/pack-llama/routes/{route_id}", response_model=PackLlamaRouteModel)
async def get_pack_llama_route_endpoint(route_id: str) -> PackLlamaRouteModel:
    route = get_pack_llama_route(route_id)
    if not route:
        raise HTTPException(
            status_code=404,
            detail=f"Pack llama route '{route_id}' not found",
        )
    return route


@router.post("/api/pack-llama/calculate", response_model=PackLlamaResponse)
@router.post("/pack-llama/calculate", response_model=PackLlamaResponse)
async def calculate_pack_llama_endpoint(req: PackLlamaRequest) -> PackLlamaResponse:
    try:
        return calculate_pack_llama_payload(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/api/pack-llama/gear", response_model=list[PackLlamaGearModel])
@router.get("/pack-llama/gear", response_model=list[PackLlamaGearModel])
async def get_pack_llama_gear_endpoint() -> list[PackLlamaGearModel]:
    return get_pack_llama_gear_checklist()
