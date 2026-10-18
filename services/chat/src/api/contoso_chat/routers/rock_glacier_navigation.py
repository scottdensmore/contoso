"""FastAPI Router for High-Alpine Talus & Boulder-Field Periglacial Rock-Glacier Navigation."""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from contoso_chat.rock_glacier_navigation import (
    CarapaceTraversalTechnique,
    InterstitialIceState,
    RockGlacierMorphologyType,
    RockGlacierSafetyStatus,
    calculate_rock_glacier_navigation_safety,
    filter_rock_glacier_sites,
    get_rock_glacier_gear_checklist,
    get_rock_glacier_site_by_id,
)

router = APIRouter()


class RockGlacierSiteResponse(BaseModel):
    id: str
    name: str
    region: str
    elevation: int
    elevation_m: int
    morphology: RockGlacierMorphologyType
    ice_state: InterstitialIceState
    technique: CarapaceTraversalTechnique
    mean_block_diameter_cm: float
    slope_angle_deg: float
    active_layer_thaw_depth_cm: float
    interstitial_void_ratio_percent: float
    primary_hazard: str
    carapace_escape_protocol: str
    field_notes: str


class RockGlacierGearItemResponse(BaseModel):
    id: str
    name: str
    category: str
    mandatory: bool
    rationale: str


class RockGlacierCalculateRequest(BaseModel):
    morphology: RockGlacierMorphologyType = Field(
        default="active_lobate_ice_cored_carapace",
        description="Periglacial rock-glacier morphology type",
    )
    ice_state: InterstitialIceState = Field(
        default="cryo_cemented_permafrost_lock",
        description="Interstitial permafrost / active-layer ice state",
    )
    technique: CarapaceTraversalTechnique = Field(
        default="compression_ridge_crest_hopping",
        description="Carapace boulder-field traversal technique",
    )
    mean_block_diameter_cm: float = Field(
        default=75.0,
        ge=15.0,
        le=300.0,
        description="Mean carapace boulder diameter in cm (15.0 to 300.0)",
    )
    slope_angle_deg: float = Field(
        default=21.0,
        ge=5.0,
        le=55.0,
        description="Surface or frontal scarp slope angle in degrees (5.0 to 55.0)",
    )
    active_layer_thaw_depth_cm: float = Field(
        default=65.0,
        ge=10.0,
        le=400.0,
        description="Seasonal active-layer thaw depth in cm (10.0 to 400.0)",
    )
    interstitial_void_ratio_percent: float = Field(
        default=22.0,
        ge=5.0,
        le=65.0,
        description="Sub-carapace open interstitial void ratio in percent (5.0 to 65.0)",
    )
    ambient_air_temp_c: float = Field(
        default=-2.0,
        ge=-35.0,
        le=35.0,
        description="Ambient air temperature in °C (-35.0 to 35.0)",
    )
    pack_weight_kg: float = Field(
        default=14.0,
        ge=0.0,
        le=50.0,
        description="Carried pack weight in kg (0.0 to 50.0)",
    )


class RockGlacierCalculateResponse(BaseModel):
    morphology: RockGlacierMorphologyType
    ice_state: InterstitialIceState
    technique: CarapaceTraversalTechnique
    mean_block_diameter_cm: float
    slope_angle_deg: float
    active_layer_thaw_depth_cm: float
    interstitial_void_ratio_percent: float
    ambient_air_temp_c: float
    pack_weight_kg: float
    block_rotational_stability_index: float
    perched_block_tip_probability: float
    sub_carapace_void_entrapment_risk_percent: float
    effective_horizontal_pace_mhr: float
    safety_status: RockGlacierSafetyStatus
    carapace_routing_protocol: str
    tibial_entrapment_and_rockfall_advisory: str


@router.get("/sites", response_model=list[RockGlacierSiteResponse])
async def list_rock_glacier_sites(
    morphology: Optional[RockGlacierMorphologyType] = Query(
        default=None, description="Filter by rock-glacier morphology type"
    ),
    ice_state: Optional[InterstitialIceState] = Query(
        default=None, description="Filter by interstitial ice state"
    ),
    technique: Optional[CarapaceTraversalTechnique] = Query(
        default=None,
        description="Filter by recommended carapace traversal technique",
    ),
) -> list[RockGlacierSiteResponse]:
    """List curated periglacial rock-glacier navigation sites with optional filtering."""
    sites = filter_rock_glacier_sites(
        morphology=morphology,
        ice_state=ice_state,
        technique=technique,
    )
    return [RockGlacierSiteResponse(**dict(s)) for s in sites]


@router.get("/sites/{site_id}", response_model=RockGlacierSiteResponse)
async def get_rock_glacier_site(site_id: str) -> RockGlacierSiteResponse:
    """Retrieve a specific periglacial rock-glacier site by ID."""
    site = get_rock_glacier_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Rock glacier navigation site '{site_id}' not found.",
        )
    return RockGlacierSiteResponse(**dict(site))


@router.post("/calculate", response_model=RockGlacierCalculateResponse)
async def calculate_rock_glacier_safety_endpoint(
    payload: RockGlacierCalculateRequest,
) -> RockGlacierCalculateResponse:
    """Calculate block rotational stability index, perched block tip probability, and sub-carapace void entrapment risk."""
    try:
        result = calculate_rock_glacier_navigation_safety(
            morphology=payload.morphology,
            ice_state=payload.ice_state,
            technique=payload.technique,
            mean_block_diameter_cm=payload.mean_block_diameter_cm,
            slope_angle_deg=payload.slope_angle_deg,
            active_layer_thaw_depth_cm=payload.active_layer_thaw_depth_cm,
            interstitial_void_ratio_percent=payload.interstitial_void_ratio_percent,
            ambient_air_temp_c=payload.ambient_air_temp_c,
            pack_weight_kg=payload.pack_weight_kg,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return RockGlacierCalculateResponse(**dict(result))


@router.get("/gear", response_model=list[RockGlacierGearItemResponse])
async def list_rock_glacier_gear() -> list[RockGlacierGearItemResponse]:
    """Retrieve the mandatory 6-item periglacial rock-glacier navigation gear checklist."""
    items = get_rock_glacier_gear_checklist()
    return [RockGlacierGearItemResponse(**dict(i)) for i in items]
