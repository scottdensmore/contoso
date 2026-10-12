from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.canopy_bryophyte import (
    CanopyBryophyteDynamicsQuery,
    CanopyBryophyteDynamicsResult,
    CanopyBryophyteGearItem,
    CanopyBryophyteSite,
    calculate_canopy_bryophyte_dynamics,
    get_canopy_bryophyte_gear,
    get_canopy_bryophyte_site,
    get_canopy_bryophyte_sites,
)

router = APIRouter(tags=["canopy-bryophyte"])


@router.get("/sites", response_model=list[CanopyBryophyteSite])
async def get_canopy_bryophyte_sites_endpoint(
    stratum: Optional[str] = None,
) -> list[CanopyBryophyteSite]:
    return get_canopy_bryophyte_sites(stratum=stratum)


@router.get("/sites/{site_id}", response_model=CanopyBryophyteSite)
async def get_canopy_bryophyte_site_endpoint(site_id: str) -> CanopyBryophyteSite:
    site = get_canopy_bryophyte_site(site_id)
    if not site:
        raise HTTPException(
            status_code=404,
            detail=f"Canopy bryophyte site '{site_id}' not found",
        )
    return site


@router.post("/calculate", response_model=CanopyBryophyteDynamicsResult)
async def calculate_canopy_bryophyte_dynamics_endpoint(
    query: CanopyBryophyteDynamicsQuery,
) -> CanopyBryophyteDynamicsResult:
    try:
        return calculate_canopy_bryophyte_dynamics(query)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/gear", response_model=list[CanopyBryophyteGearItem])
async def get_canopy_bryophyte_gear_endpoint() -> list[CanopyBryophyteGearItem]:
    return get_canopy_bryophyte_gear()
