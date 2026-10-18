"""FastAPI Router for Arid Playas & Salt Pan Crust Bearing-Capacity & Mirage Compass Navigation."""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from contoso_chat.salt_pan_navigation import (
    AtmosphericRefractionState,
    EvaporiteCrustType,
    PlayaTraversalMode,
    SaltPanSafetyStatus,
    calculate_salt_pan_navigation_safety,
    filter_salt_pan_sites,
    get_salt_pan_gear_checklist,
    get_salt_pan_site_by_id,
)

router = APIRouter()


class SaltPanSiteResponse(BaseModel):
    id: str
    name: str
    region: str
    elevation: int
    elevation_m: int
    crust_type: EvaporiteCrustType
    refraction_state: AtmosphericRefractionState
    traversal_mode: PlayaTraversalMode
    mean_halite_crust_thickness_cm: float
    water_table_depth_cm: float
    typical_surface_air_temp_c: float
    typical_ground_skin_temp_c: float
    primary_hazard: str
    shoreline_escape_bearing_protocol: str
    field_notes: str


class SaltPanGearItemResponse(BaseModel):
    id: str
    name: str
    category: str
    mandatory: bool
    rationale: str


class SaltPanCalculateRequest(BaseModel):
    crust_type: EvaporiteCrustType = Field(
        default="polygonal_halite_pressure_ridge",
        description="Evaporite playa crust type",
    )
    refraction_state: AtmosphericRefractionState = Field(
        default="predawn_isothermal_clarity",
        description="Atmospheric boundary-layer refraction state",
    )
    traversal_mode: PlayaTraversalMode = Field(
        default="wide_tire_desert_expedition_cart",
        description="Playa traversal mode",
    )
    halite_crust_thickness_cm: float = Field(
        default=38.0,
        ge=1.0,
        le=150.0,
        description="Halite evaporite crust thickness in cm (1.0 to 150.0)",
    )
    water_table_depth_cm: float = Field(
        default=45.0,
        ge=0.0,
        le=250.0,
        description="Sub-crust capillary brine water table depth in cm (0.0 to 250.0)",
    )
    surface_air_temp_c: float = Field(
        default=14.0,
        ge=-15.0,
        le=60.0,
        description="Surface air temperature at 1.5 m in °C (-15.0 to 60.0)",
    )
    ground_skin_temp_c: float = Field(
        default=22.0,
        ge=-15.0,
        le=85.0,
        description="Ground skin temperature in °C (-15.0 to 85.0)",
    )
    total_traveler_load_kg: float = Field(
        default=95.0,
        ge=30.0,
        le=300.0,
        description="Total traveler plus cart/pack load in kg (30.0 to 300.0)",
    )
    target_sighting_distance_km: float = Field(
        default=12.0,
        ge=0.5,
        le=50.0,
        description="Target optical landmark sighting distance in km (0.5 to 50.0)",
    )


class SaltPanCalculateResponse(BaseModel):
    crust_type: EvaporiteCrustType
    refraction_state: AtmosphericRefractionState
    traversal_mode: PlayaTraversalMode
    halite_crust_thickness_cm: float
    water_table_depth_cm: float
    surface_air_temp_c: float
    ground_skin_temp_c: float
    total_traveler_load_kg: float
    target_sighting_distance_km: float
    crust_bearing_safety_factor: float
    brine_mud_breakthrough_probability: float
    mirage_horizon_dip_error_deg: float
    effective_visual_range_km: float
    safety_status: SaltPanSafetyStatus
    dead_reckoning_routing_protocol: str
    crust_sounding_and_extraction_advisory: str


@router.get("/sites", response_model=list[SaltPanSiteResponse])
async def list_salt_pan_sites(
    crust_type: Optional[EvaporiteCrustType] = Query(
        default=None, description="Filter by evaporite crust type"
    ),
    refraction_state: Optional[AtmosphericRefractionState] = Query(
        default=None, description="Filter by atmospheric refraction state"
    ),
    traversal_mode: Optional[PlayaTraversalMode] = Query(
        default=None, description="Filter by recommended playa traversal mode"
    ),
) -> list[SaltPanSiteResponse]:
    """List curated arid playa and salt pan navigation sites with optional filtering."""
    sites = filter_salt_pan_sites(
        crust_type=crust_type,
        refraction_state=refraction_state,
        traversal_mode=traversal_mode,
    )
    return [SaltPanSiteResponse(**dict(s)) for s in sites]


@router.get("/sites/{site_id}", response_model=SaltPanSiteResponse)
async def get_salt_pan_site(site_id: str) -> SaltPanSiteResponse:
    """Retrieve a specific arid playa / salt pan site by ID."""
    site = get_salt_pan_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Salt pan navigation site '{site_id}' not found.",
        )
    return SaltPanSiteResponse(**dict(site))


@router.post("/calculate", response_model=SaltPanCalculateResponse)
async def calculate_salt_pan_safety_endpoint(
    payload: SaltPanCalculateRequest,
) -> SaltPanCalculateResponse:
    """Calculate evaporite crust bearing safety factor, brine-mud breakthrough probability, and mirage refraction error."""
    try:
        result = calculate_salt_pan_navigation_safety(
            crust_type=payload.crust_type,
            refraction_state=payload.refraction_state,
            traversal_mode=payload.traversal_mode,
            halite_crust_thickness_cm=payload.halite_crust_thickness_cm,
            water_table_depth_cm=payload.water_table_depth_cm,
            surface_air_temp_c=payload.surface_air_temp_c,
            ground_skin_temp_c=payload.ground_skin_temp_c,
            total_traveler_load_kg=payload.total_traveler_load_kg,
            target_sighting_distance_km=payload.target_sighting_distance_km,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return SaltPanCalculateResponse(**dict(result))


@router.get("/gear", response_model=list[SaltPanGearItemResponse])
async def list_salt_pan_gear() -> list[SaltPanGearItemResponse]:
    """Retrieve the mandatory 6-item arid playas & salt pan navigation gear checklist."""
    items = get_salt_pan_gear_checklist()
    return [SaltPanGearItemResponse(**dict(i)) for i in items]
