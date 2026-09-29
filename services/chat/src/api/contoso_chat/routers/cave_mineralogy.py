from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.cave_mineralogy import (
    CaveMineralogySite,
    MineralAccretionQuery,
    MineralAccretionResult,
    SpeleothemGearItem,
    calculate_mineral_accretion,
    get_cave_mineralogy_site,
    get_cave_mineralogy_sites,
    get_speleothem_gear_checklist,
)

router = APIRouter(tags=["cave-mineralogy"])


@router.get("/caves", response_model=list[CaveMineralogySite])
@router.get("/sites", response_model=list[CaveMineralogySite])
async def get_cave_mineralogy_sites_endpoint(
    speleothem_type: Optional[str] = None,
    conservation: Optional[str] = None,
) -> list[CaveMineralogySite]:
    return get_cave_mineralogy_sites(
        speleothem_type=speleothem_type,
        conservation=conservation,
    )


@router.get("/caves/{site_id}", response_model=CaveMineralogySite)
@router.get("/sites/{site_id}", response_model=CaveMineralogySite)
async def get_cave_mineralogy_site_endpoint(site_id: str) -> CaveMineralogySite:
    site = get_cave_mineralogy_site(site_id)
    if not site:
        raise HTTPException(
            status_code=404,
            detail=f"Cave mineralogy site '{site_id}' not found",
        )
    return site


@router.post("/calculate", response_model=MineralAccretionResult)
async def calculate_mineral_accretion_endpoint(
    query: MineralAccretionQuery,
) -> MineralAccretionResult:
    try:
        return calculate_mineral_accretion(query)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/gear", response_model=list[SpeleothemGearItem])
async def get_speleothem_gear_endpoint() -> list[SpeleothemGearItem]:
    return get_speleothem_gear_checklist()
