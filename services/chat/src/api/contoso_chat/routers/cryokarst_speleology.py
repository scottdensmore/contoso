from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.cryokarst_speleology import (
    CryokarstDynamicsQuery,
    CryokarstDynamicsResult,
    CryokarstGearItem,
    CryokarstSite,
    calculate_cryokarst_dynamics,
    get_cryokarst_gear,
    get_cryokarst_site,
    get_cryokarst_sites,
)

router = APIRouter(tags=["cryokarst-speleology"])


@router.get("/sites", response_model=list[CryokarstSite])
async def get_cryokarst_sites_endpoint(
    conduit_type: Optional[str] = None,
) -> list[CryokarstSite]:
    return get_cryokarst_sites(conduit_type=conduit_type)


@router.get("/sites/{site_id}", response_model=CryokarstSite)
async def get_cryokarst_site_endpoint(site_id: str) -> CryokarstSite:
    site = get_cryokarst_site(site_id)
    if not site:
        raise HTTPException(
            status_code=404,
            detail=f"Cryokarst site '{site_id}' not found",
        )
    return site


@router.post("/calculate", response_model=CryokarstDynamicsResult)
async def calculate_cryokarst_dynamics_endpoint(
    query: CryokarstDynamicsQuery,
) -> CryokarstDynamicsResult:
    try:
        return calculate_cryokarst_dynamics(query)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/gear", response_model=list[CryokarstGearItem])
async def get_cryokarst_gear_endpoint() -> list[CryokarstGearItem]:
    return get_cryokarst_gear()
