from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.lava_tube_biospeleology import (
    LavaTubeBiospeleologyGearItem,
    LavaTubeBiospeleologyQuery,
    LavaTubeBiospeleologyResult,
    LavaTubeBiospeleologySite,
    calculate_lava_tube_biospeleology_dynamics,
    get_lava_tube_biospeleology_gear,
    get_lava_tube_biospeleology_site,
    get_lava_tube_biospeleology_sites,
)

router = APIRouter(tags=["lava-tube-biospeleology"])


@router.get("/sites", response_model=list[LavaTubeBiospeleologySite])
async def get_lava_tube_biospeleology_sites_endpoint(
    zone: Optional[str] = None,
) -> list[LavaTubeBiospeleologySite]:
    return get_lava_tube_biospeleology_sites(zone=zone)


@router.get("/sites/{site_id}", response_model=LavaTubeBiospeleologySite)
async def get_lava_tube_biospeleology_site_endpoint(
    site_id: str,
) -> LavaTubeBiospeleologySite:
    site = get_lava_tube_biospeleology_site(site_id)
    if not site:
        raise HTTPException(
            status_code=404,
            detail=f"Lava tube biospeleology site '{site_id}' not found",
        )
    return site


@router.post("/calculate", response_model=LavaTubeBiospeleologyResult)
async def calculate_lava_tube_biospeleology_endpoint(
    query: LavaTubeBiospeleologyQuery,
) -> LavaTubeBiospeleologyResult:
    try:
        return calculate_lava_tube_biospeleology_dynamics(query)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/gear", response_model=list[LavaTubeBiospeleologyGearItem])
async def get_lava_tube_biospeleology_gear_endpoint() -> list[LavaTubeBiospeleologyGearItem]:
    return get_lava_tube_biospeleology_gear()
