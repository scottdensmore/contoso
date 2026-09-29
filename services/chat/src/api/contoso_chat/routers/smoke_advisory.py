from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.smoke_advisory import (
    SmokeAdvisoryQuery,
    SmokeAdvisoryResult,
    SmokeGearItem,
    SmokeStation,
    calculate_smoke_exposure,
    get_smoke_gear_checklist,
    get_smoke_station_by_id,
    get_smoke_stations,
)

router = APIRouter(tags=["smoke-advisory"])


@router.get("/stations", response_model=list[SmokeStation])
async def get_smoke_stations_endpoint(
    layer: Optional[str] = None,
    severity: Optional[str] = None,
) -> list[SmokeStation]:
    return get_smoke_stations(layer=layer, severity=severity)


@router.get("/stations/{station_id}", response_model=SmokeStation)
async def get_smoke_station_endpoint(station_id: str) -> SmokeStation:
    station = get_smoke_station_by_id(station_id)
    if not station:
        raise HTTPException(
            status_code=404,
            detail=f"Smoke station '{station_id}' not found",
        )
    return station


@router.post("/calculate", response_model=SmokeAdvisoryResult)
async def calculate_smoke_exposure_endpoint(
    query: SmokeAdvisoryQuery,
) -> SmokeAdvisoryResult:
    try:
        return calculate_smoke_exposure(query)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/gear", response_model=list[SmokeGearItem])
async def get_smoke_gear_endpoint() -> list[SmokeGearItem]:
    return get_smoke_gear_checklist()
