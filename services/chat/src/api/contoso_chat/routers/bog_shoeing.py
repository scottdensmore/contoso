from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.bog_shoeing import (
    BogFlotationQuery,
    BogFlotationResult,
    BogGearItem,
    BogShoeingSite,
    calculate_bog_flotation,
    get_bog_gear_checklist,
    get_bog_shoeing_site,
    get_bog_shoeing_sites,
)

router = APIRouter(tags=["bog-shoeing"])


@router.get("/sites", response_model=list[BogShoeingSite])
@router.get("/routes", response_model=list[BogShoeingSite])
async def get_bog_shoeing_sites_endpoint(
    terrain: Optional[str] = None,
    saturation: Optional[str] = None,
) -> list[BogShoeingSite]:
    return get_bog_shoeing_sites(terrain=terrain, saturation=saturation)


@router.get("/sites/{site_id}", response_model=BogShoeingSite)
@router.get("/routes/{site_id}", response_model=BogShoeingSite)
async def get_bog_shoeing_site_endpoint(site_id: str) -> BogShoeingSite:
    site = get_bog_shoeing_site(site_id)
    if not site:
        raise HTTPException(
            status_code=404,
            detail=f"Bog shoeing site '{site_id}' not found",
        )
    return site


@router.post("/calculate", response_model=BogFlotationResult)
async def calculate_bog_flotation_endpoint(
    query: BogFlotationQuery,
) -> BogFlotationResult:
    try:
        return calculate_bog_flotation(query)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/gear", response_model=list[BogGearItem])
async def get_bog_gear_endpoint() -> list[BogGearItem]:
    return get_bog_gear_checklist()
