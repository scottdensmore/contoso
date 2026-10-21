"""FastAPI Router for High-Altitude Páramo & Frailejón Cushion-Bog Moorland Navigation."""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from contoso_chat.paramo_navigation import (
    AndeanCloudFogRegime,
    ParamoSafetyStatus,
    ParamoSubstrateMorphology,
    ParamoTraversalTechnique,
    calculate_paramo_navigation_safety,
    filter_paramo_sites,
    get_paramo_gear_checklist,
    get_paramo_site_by_id,
)

router = APIRouter()


class ParamoSiteResponse(BaseModel):
    id: str
    name: str
    region: str
    elevation: int
    elevation_m: int
    substrate_morphology: ParamoSubstrateMorphology
    fog_regime: AndeanCloudFogRegime
    technique: ParamoTraversalTechnique
    mean_cushion_mat_thickness_cm: float
    histosol_water_saturation_percent: float
    typical_visibility_meters: float
    typical_ambient_temp_c: float
    typical_wind_speed_kmh: float
    primary_hazard: str
    turbera_stepping_and_wayfinding_protocol: str
    field_notes: str


class ParamoGearItemResponse(BaseModel):
    id: str
    name: str
    category: str
    mandatory: bool
    rationale: str


class ParamoCalculateRequest(BaseModel):
    substrate_morphology: ParamoSubstrateMorphology = Field(
        default="plantago_distichia_cushion_bog_dome",
        description="Páramo cushion-bog or tussock substrate morphology",
    )
    fog_regime: AndeanCloudFogRegime = Field(
        default="morning_zenith_uv_window",
        description="Andean cloud-fog and precipitation regime",
    )
    technique: ParamoTraversalTechnique = Field(
        default="distichia_cushion_dome_stepping",
        description="Páramo moorland traversal and wayfinding technique",
    )
    cushion_mat_thickness_cm: float = Field(
        default=38.0,
        ge=2.0,
        le=100.0,
        description="Vascular cushion mat or tussock root-mat thickness in cm (2.0 to 100.0)",
    )
    histosol_water_saturation_percent: float = Field(
        default=68.0,
        ge=20.0,
        le=100.0,
        description="Histosol peat water saturation percentage (20.0 to 100.0)",
    )
    visibility_meters: float = Field(
        default=220.0,
        ge=2.0,
        le=2000.0,
        description="Optical visibility in meters through cloud-fog (2.0 to 2000.0)",
    )
    ambient_temp_c: float = Field(
        default=8.0,
        ge=-15.0,
        le=28.0,
        description="Ambient air temperature in °C (-15.0 to 28.0)",
    )
    wind_speed_kmh: float = Field(
        default=16.0,
        ge=0.0,
        le=120.0,
        description="Wind speed in km/h (0.0 to 120.0)",
    )
    pack_weight_kg: float = Field(
        default=14.0,
        ge=0.0,
        le=45.0,
        description="carried pack weight in kg (0.0 to 45.0)",
    )


class ParamoCalculateResponse(BaseModel):
    substrate_morphology: ParamoSubstrateMorphology
    fog_regime: AndeanCloudFogRegime
    technique: ParamoTraversalTechnique
    cushion_mat_thickness_cm: float
    histosol_water_saturation_percent: float
    visibility_meters: float
    ambient_temp_c: float
    wind_speed_kmh: float
    pack_weight_kg: float
    cushion_bearing_safety_factor: float
    turbera_breakthrough_probability: float
    effective_wind_chill_c: float
    azimuth_drift_meters_per_km: float
    safety_status: ParamoSafetyStatus
    turbera_stepping_protocol: str
    whiteout_and_hypothermia_advisory: str


@router.get("/sites", response_model=list[ParamoSiteResponse])
async def list_paramo_sites(
    substrate_morphology: Optional[ParamoSubstrateMorphology] = Query(
        default=None, description="Filter by páramo substrate morphology"
    ),
    fog_regime: Optional[AndeanCloudFogRegime] = Query(
        default=None, description="Filter by Andean cloud-fog regime"
    ),
    technique: Optional[ParamoTraversalTechnique] = Query(
        default=None,
        description="Filter by recommended páramo traversal technique",
    ),
) -> list[ParamoSiteResponse]:
    """List curated high-altitude páramo & frailejón cushion-bog sites with optional filtering."""
    sites = filter_paramo_sites(
        substrate_morphology=substrate_morphology,
        fog_regime=fog_regime,
        technique=technique,
    )
    return [ParamoSiteResponse(**dict(s)) for s in sites]


@router.get("/sites/{site_id}", response_model=ParamoSiteResponse)
async def get_paramo_site(
    site_id: str,
) -> ParamoSiteResponse:
    """Retrieve a specific páramo moorland site by ID."""
    site = get_paramo_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Páramo site '{site_id}' not found.",
        )
    return ParamoSiteResponse(**dict(site))


@router.post("/calculate", response_model=ParamoCalculateResponse)
async def calculate_paramo_navigation_endpoint(
    payload: ParamoCalculateRequest,
) -> ParamoCalculateResponse:
    """Calculate cushion bearing safety factor, turbera breakthrough probability, effective wind chill, and azimuth drift."""
    try:
        result = calculate_paramo_navigation_safety(
            substrate_morphology=payload.substrate_morphology,
            fog_regime=payload.fog_regime,
            technique=payload.technique,
            cushion_mat_thickness_cm=payload.cushion_mat_thickness_cm,
            histosol_water_saturation_percent=payload.histosol_water_saturation_percent,
            visibility_meters=payload.visibility_meters,
            ambient_temp_c=payload.ambient_temp_c,
            wind_speed_kmh=payload.wind_speed_kmh,
            pack_weight_kg=payload.pack_weight_kg,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return ParamoCalculateResponse(**dict(result))


@router.get("/gear", response_model=list[ParamoGearItemResponse])
async def list_paramo_gear() -> list[ParamoGearItemResponse]:
    """Retrieve the mandatory 6-item high-altitude páramo & cushion-bog gear checklist."""
    items = get_paramo_gear_checklist()
    return [ParamoGearItemResponse(**dict(i)) for i in items]
