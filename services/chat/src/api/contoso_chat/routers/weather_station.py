from typing import Optional

from fastapi import APIRouter, HTTPException

from contoso_chat.weather_station import (
    WeatherStationGearModel,
    WeatherStationModel,
    WeatherStationRequest,
    WeatherStationResponse,
    calculate_station_telemetry,
    get_weather_station,
    get_weather_station_gear_checklist,
    get_weather_stations,
)

router = APIRouter(prefix="", tags=["weather-station"])


@router.get(
    "/api/weather-station/stations",
    response_model=list[WeatherStationModel],
)
@router.get(
    "/weather-station/stations",
    response_model=list[WeatherStationModel],
)
async def get_weather_stations_endpoint(
    alpine_zone: Optional[str] = None,
    zone: Optional[str] = None,
) -> list[WeatherStationModel]:
    target_zone = alpine_zone or zone
    return get_weather_stations(zone=target_zone)


@router.get(
    "/api/weather-station/stations/{station_id}",
    response_model=WeatherStationModel,
)
@router.get(
    "/weather-station/stations/{station_id}",
    response_model=WeatherStationModel,
)
async def get_weather_station_endpoint(
    station_id: str,
) -> WeatherStationModel:
    station = get_weather_station(station_id)
    if not station:
        raise HTTPException(
            status_code=404,
            detail=f"Weather station '{station_id}' not found",
        )
    return station


@router.post(
    "/api/weather-station/calculate",
    response_model=WeatherStationResponse,
)
@router.post(
    "/weather-station/calculate",
    response_model=WeatherStationResponse,
)
async def calculate_station_endpoint(
    req: WeatherStationRequest,
) -> WeatherStationResponse:
    try:
        return calculate_station_telemetry(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get(
    "/api/weather-station/gear",
    response_model=list[WeatherStationGearModel],
)
@router.get(
    "/weather-station/gear",
    response_model=list[WeatherStationGearModel],
)
async def get_weather_station_gear_endpoint() -> list[WeatherStationGearModel]:
    return get_weather_station_gear_checklist()
