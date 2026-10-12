from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.glacier_ski_traverse import (
    GlacierSkiTraverseGearItem,
    GlacierSkiTraverseQuery,
    GlacierSkiTraverseResult,
    GlacierSkiTraverseSite,
    calculate_glacier_ski_traverse_dynamics,
    get_glacier_ski_traverse_gear,
    get_glacier_ski_traverse_site,
    get_glacier_ski_traverse_sites,
)

router = APIRouter(tags=["glacier-ski-traverse"])


@router.get("/sites", response_model=list[GlacierSkiTraverseSite])
async def get_glacier_ski_traverse_sites_endpoint(
    zone: Optional[str] = None,
) -> list[GlacierSkiTraverseSite]:
    return get_glacier_ski_traverse_sites(zone=zone)


@router.get("/sites/{site_id}", response_model=GlacierSkiTraverseSite)
async def get_glacier_ski_traverse_site_endpoint(site_id: str) -> GlacierSkiTraverseSite:
    site = get_glacier_ski_traverse_site(site_id)
    if not site:
        raise HTTPException(
            status_code=404,
            detail=f"Glacier ski traverse site '{site_id}' not found",
        )
    return site


@router.post("/calculate", response_model=GlacierSkiTraverseResult)
async def calculate_glacier_ski_traverse_dynamics_endpoint(
    query: GlacierSkiTraverseQuery,
) -> GlacierSkiTraverseResult:
    try:
        return calculate_glacier_ski_traverse_dynamics(query)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/gear", response_model=list[GlacierSkiTraverseGearItem])
async def get_glacier_ski_traverse_gear_endpoint() -> list[GlacierSkiTraverseGearItem]:
    return get_glacier_ski_traverse_gear()
