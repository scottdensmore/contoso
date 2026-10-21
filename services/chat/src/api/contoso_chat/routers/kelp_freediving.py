from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.kelp_freediving import (
    KelpFreedivingGearItem,
    KelpFreedivingQuery,
    KelpFreedivingResult,
    KelpFreedivingSite,
    calculate_kelp_freediving_dynamics,
    get_kelp_freediving_gear,
    get_kelp_freediving_site,
    get_kelp_freediving_sites,
)

router = APIRouter(tags=["kelp-freediving"])


@router.get("/sites", response_model=list[KelpFreedivingSite])
async def get_kelp_freediving_sites_endpoint(
    stratum: Optional[str] = None,
) -> list[KelpFreedivingSite]:
    return get_kelp_freediving_sites(stratum=stratum)


@router.get("/sites/{site_id}", response_model=KelpFreedivingSite)
async def get_kelp_freediving_site_endpoint(
    site_id: str,
) -> KelpFreedivingSite:
    site = get_kelp_freediving_site(site_id)
    if not site:
        raise HTTPException(
            status_code=404,
            detail=f"Kelp freediving site '{site_id}' not found",
        )
    return site


@router.post("/calculate", response_model=KelpFreedivingResult)
async def calculate_kelp_freediving_endpoint(
    query: KelpFreedivingQuery,
) -> KelpFreedivingResult:
    try:
        return calculate_kelp_freediving_dynamics(query)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/gear", response_model=list[KelpFreedivingGearItem])
async def get_kelp_freediving_gear_endpoint() -> list[KelpFreedivingGearItem]:
    return get_kelp_freediving_gear()
