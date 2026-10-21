from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.scree_running import (
    ScreeRunningGearItem,
    ScreeRunningQuery,
    ScreeRunningResult,
    ScreeRunningSite,
    calculate_scree_running_dynamics,
    get_scree_running_gear,
    get_scree_running_site,
    get_scree_running_sites,
)

router = APIRouter(tags=["scree-running"])


@router.get("/sites", response_model=list[ScreeRunningSite])
async def get_scree_running_sites_endpoint(
    grading: Optional[str] = None,
) -> list[ScreeRunningSite]:
    return get_scree_running_sites(grading=grading)


@router.get("/sites/{site_id}", response_model=ScreeRunningSite)
async def get_scree_running_site_endpoint(site_id: str) -> ScreeRunningSite:
    site = get_scree_running_site(site_id)
    if not site:
        raise HTTPException(
            status_code=404,
            detail=f"Scree running site '{site_id}' not found",
        )
    return site


@router.post("/calculate", response_model=ScreeRunningResult)
async def calculate_scree_running_dynamics_endpoint(
    query: ScreeRunningQuery,
) -> ScreeRunningResult:
    try:
        return calculate_scree_running_dynamics(query)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/gear", response_model=list[ScreeRunningGearItem])
async def get_scree_running_gear_endpoint() -> list[ScreeRunningGearItem]:
    return get_scree_running_gear()
