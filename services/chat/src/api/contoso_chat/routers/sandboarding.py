from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.sandboarding import (
    DuneLocationModel,
    SandboardingGearModel,
    SandboardingRequest,
    SandboardingResponse,
    calculate_sandboarding_glide,
    get_dune_location,
    get_dune_locations,
    get_sandboarding_gear_checklist,
)

router = APIRouter(prefix="", tags=["sandboarding"])


@router.get("/api/sandboarding/dunes", response_model=list[DuneLocationModel])
@router.get("/sandboarding/dunes", response_model=list[DuneLocationModel])
async def get_sandboarding_dunes_endpoint(
    style: Optional[str] = None,
) -> list[DuneLocationModel]:
    return get_dune_locations(style=style)


@router.get("/api/sandboarding/dunes/{dune_id}", response_model=DuneLocationModel)
@router.get("/sandboarding/dunes/{dune_id}", response_model=DuneLocationModel)
async def get_sandboarding_dune_endpoint(dune_id: str) -> DuneLocationModel:
    dune = get_dune_location(dune_id)
    if not dune:
        raise HTTPException(
            status_code=404,
            detail=f"Dune location '{dune_id}' not found",
        )
    return dune


@router.post("/api/sandboarding/calculate", response_model=SandboardingResponse)
@router.post("/sandboarding/calculate", response_model=SandboardingResponse)
async def calculate_sandboarding_endpoint(req: SandboardingRequest) -> SandboardingResponse:
    try:
        return calculate_sandboarding_glide(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/api/sandboarding/gear", response_model=list[SandboardingGearModel])
@router.get("/sandboarding/gear", response_model=list[SandboardingGearModel])
async def get_sandboarding_gear_endpoint() -> list[SandboardingGearModel]:
    return get_sandboarding_gear_checklist()
