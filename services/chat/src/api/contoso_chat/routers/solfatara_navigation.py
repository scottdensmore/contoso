"""FastAPI Router for Backcountry Geothermal Fumarole Field & Solfatara Gas Hazard Navigation."""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from contoso_chat.solfatara_navigation import (
    BoundaryLayerWindState,
    HydrothermalCrustType,
    SolfataraSafetyStatus,
    VolcanicGasRegime,
    calculate_solfatara_navigation_safety,
    filter_solfatara_sites,
    get_solfatara_gear_checklist,
    get_solfatara_site_by_id,
)

router = APIRouter()


class SolfataraSiteResponse(BaseModel):
    id: str
    name: str
    region: str
    elevation: int
    elevation_m: int
    crust_type: HydrothermalCrustType
    gas_regime: VolcanicGasRegime
    wind_state: BoundaryLayerWindState
    mean_crust_thickness_cm: float
    subsurface_temp_10cm_c: float
    basin_depression_depth_m: float
    baseline_so2_ppm: float
    baseline_h2s_ppm: float
    primary_hazard: str
    windward_escape_bearing: str
    field_notes: str


class SolfataraGearItemResponse(BaseModel):
    id: str
    name: str
    category: str
    mandatory: bool
    rationale: str


class SolfataraCalculateRequest(BaseModel):
    crust_type: HydrothermalCrustType = Field(
        default="siliceous_geyserite_sinter_shield",
        description="Hydrothermal surface crust morphology",
    )
    gas_regime: VolcanicGasRegime = Field(
        default="superheated_fumarolic_steam_jet",
        description="Dominant volcanic gas regime",
    )
    wind_state: BoundaryLayerWindState = Field(
        default="steady_upwind_ridge_ventilation",
        description="Boundary layer atmospheric ventilation state",
    )
    sinter_crust_thickness_cm: float = Field(
        default=24.0,
        ge=1.0,
        le=150.0,
        description="Hydrothermal crust thickness in cm (1.0 to 150.0)",
    )
    subsurface_temp_10cm_c: float = Field(
        default=65.0,
        ge=0.0,
        le=130.0,
        description="Subsurface ground temperature at 10 cm depth in °C (0.0 to 130.0)",
    )
    wind_speed_kmh: float = Field(
        default=22.0,
        ge=0.0,
        le=120.0,
        description="Ambient boundary-layer wind speed in km/h (0.0 to 120.0)",
    )
    basin_depression_depth_m: float = Field(
        default=2.5,
        ge=0.0,
        le=60.0,
        description="Topographic basin depression depth in meters (0.0 to 60.0)",
    )
    ambient_so2_ppm: float = Field(
        default=1.0,
        ge=0.0,
        le=100.0,
        description="Ambient sulfur dioxide (SO2) concentration in ppm (0.0 to 100.0)",
    )
    ambient_h2s_ppm: float = Field(
        default=0.8,
        ge=0.0,
        le=100.0,
        description="Ambient hydrogen sulfide (H2S) concentration in ppm (0.0 to 100.0)",
    )


class SolfataraCalculateResponse(BaseModel):
    crust_type: HydrothermalCrustType
    gas_regime: VolcanicGasRegime
    wind_state: BoundaryLayerWindState
    sinter_crust_thickness_cm: float
    subsurface_temp_10cm_c: float
    wind_speed_kmh: float
    basin_depression_depth_m: float
    ambient_so2_ppm: float
    ambient_h2s_ppm: float
    crust_bearing_safety_factor: float
    scald_breakthrough_probability: float
    dense_gas_accumulation_index: float
    recommended_standoff_distance_m: float
    safety_status: SolfataraSafetyStatus
    windward_routing_protocol: str
    crust_probing_and_respirator_advisory: str


@router.get("/sites", response_model=list[SolfataraSiteResponse])
async def list_solfatara_sites(
    crust_type: Optional[HydrothermalCrustType] = Query(
        default=None, description="Filter by hydrothermal crust type"
    ),
    gas_regime: Optional[VolcanicGasRegime] = Query(
        default=None, description="Filter by volcanic gas regime"
    ),
    wind_state: Optional[BoundaryLayerWindState] = Query(
        default=None, description="Filter by boundary layer wind state"
    ),
) -> list[SolfataraSiteResponse]:
    """List curated backcountry geothermal fumarole and solfatara sites with optional filtering."""
    sites = filter_solfatara_sites(
        crust_type=crust_type,
        gas_regime=gas_regime,
        wind_state=wind_state,
    )
    return [SolfataraSiteResponse(**dict(s)) for s in sites]


@router.get("/sites/{site_id}", response_model=SolfataraSiteResponse)
async def get_solfatara_site(site_id: str) -> SolfataraSiteResponse:
    """Retrieve a specific backcountry geothermal fumarole / solfatara site by ID."""
    site = get_solfatara_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Solfatara navigation site '{site_id}' not found.",
        )
    return SolfataraSiteResponse(**dict(site))


@router.post("/calculate", response_model=SolfataraCalculateResponse)
async def calculate_solfatara_safety_endpoint(
    payload: SolfataraCalculateRequest,
) -> SolfataraCalculateResponse:
    """Calculate hydrothermal crust bearing safety factor and dense gas accumulation hazard."""
    try:
        result = calculate_solfatara_navigation_safety(
            crust_type=payload.crust_type,
            gas_regime=payload.gas_regime,
            wind_state=payload.wind_state,
            sinter_crust_thickness_cm=payload.sinter_crust_thickness_cm,
            subsurface_temp_10cm_c=payload.subsurface_temp_10cm_c,
            wind_speed_kmh=payload.wind_speed_kmh,
            basin_depression_depth_m=payload.basin_depression_depth_m,
            ambient_so2_ppm=payload.ambient_so2_ppm,
            ambient_h2s_ppm=payload.ambient_h2s_ppm,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return SolfataraCalculateResponse(**dict(result))


@router.get("/gear", response_model=list[SolfataraGearItemResponse])
async def list_solfatara_gear() -> list[SolfataraGearItemResponse]:
    """Retrieve the mandatory 6-item geothermal fumarole & solfatara safety gear checklist."""
    items = get_solfatara_gear_checklist()
    return [SolfataraGearItemResponse(**dict(i)) for i in items]
