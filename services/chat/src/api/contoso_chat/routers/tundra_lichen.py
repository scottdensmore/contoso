from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.tundra_lichen import (
    LichenDynamicsQuery,
    LichenDynamicsResult,
    LichenGearItem,
    TundraLichenSite,
    calculate_lichen_dynamics,
    get_tundra_gear,
    get_tundra_site,
    get_tundra_sites,
)

router = APIRouter(tags=["tundra-lichen"])


@router.get("/sites", response_model=list[TundraLichenSite])
async def get_tundra_sites_endpoint(
    morphology: Optional[str] = None,
) -> list[TundraLichenSite]:
    return get_tundra_sites(morphology=morphology)


@router.get("/sites/{site_id}", response_model=TundraLichenSite)
async def get_tundra_site_endpoint(site_id: str) -> TundraLichenSite:
    site = get_tundra_site(site_id)
    if not site:
        raise HTTPException(
            status_code=404,
            detail=f"Tundra lichen site '{site_id}' not found",
        )
    return site


@router.post("/calculate", response_model=LichenDynamicsResult)
async def calculate_lichen_dynamics_endpoint(
    query: LichenDynamicsQuery,
) -> LichenDynamicsResult:
    try:
        return calculate_lichen_dynamics(query)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/gear", response_model=list[LichenGearItem])
async def get_tundra_gear_endpoint() -> list[LichenGearItem]:
    return get_tundra_gear()
