"""FastAPI Router for Coastal Blowhole, Surge Channel & Sea-Cave Pneumatic Wave-Hazard Navigation."""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from contoso_chat.sea_cave_pneumatics import (
    LittoralConduitMorphology,
    LittoralTraversalMode,
    SeaCavePneumaticSafetyStatus,
    WavePeriodRegime,
    calculate_sea_cave_pneumatic_safety,
    filter_sea_cave_pneumatic_sites,
    get_sea_cave_pneumatic_gear_checklist,
    get_sea_cave_pneumatic_site_by_id,
)

router = APIRouter()


class SeaCavePneumaticSiteResponse(BaseModel):
    id: str
    name: str
    region: str
    elevation: int
    elevation_m: int
    morphology: LittoralConduitMorphology
    wave_regime: WavePeriodRegime
    traversal_mode: LittoralTraversalMode
    portal_ceiling_clearance_m: float
    typical_significant_wave_height_m: float
    typical_swell_period_seconds: float
    chamber_convergence_ratio: float
    chamber_length_m: float
    primary_hazard: str
    swell_timing_and_escape_protocol: str
    field_notes: str


class SeaCavePneumaticGearItemResponse(BaseModel):
    id: str
    name: str
    category: str
    mandatory: bool
    rationale: str


class SeaCavePneumaticCalculateRequest(BaseModel):
    morphology: LittoralConduitMorphology = Field(
        default="boulder_choked_collapse_doline",
        description="Littoral sea-cave or blowhole conduit morphology",
    )
    wave_regime: WavePeriodRegime = Field(
        default="long_period_forerunner_swell_17s",
        description="Incident coastal wave period regime",
    )
    traversal_mode: LittoralTraversalMode = Field(
        default="sit_on_top_sea_kayak_sprint",
        description="Littoral sea-cave traversal or observation mode",
    )
    portal_ceiling_clearance_m: float = Field(
        default=3.2,
        ge=0.3,
        le=25.0,
        description="Overhead portal ceiling clearance in meters (0.3 to 25.0)",
    )
    significant_wave_height_m: float = Field(
        default=1.8,
        ge=0.1,
        le=12.0,
        description="Significant wave height in meters (0.1 to 12.0)",
    )
    swell_period_seconds: float = Field(
        default=15.0,
        ge=4.0,
        le=28.0,
        description="Dominant swell period in seconds (4.0 to 28.0)",
    )
    chamber_convergence_ratio: float = Field(
        default=2.4,
        ge=1.0,
        le=6.0,
        description="Entrance-to-rear chamber cross-sectional convergence ratio (1.0 to 6.0)",
    )
    tide_height_above_mllw_m: float = Field(
        default=0.8,
        ge=-1.5,
        le=5.0,
        description="Tide height relative to MLLW in meters (-1.5 to 5.0)",
    )
    chamber_length_m: float = Field(
        default=62.0,
        ge=5.0,
        le=250.0,
        description="Littoral chamber or conduit length in meters (5.0 to 250.0)",
    )


class SeaCavePneumaticCalculateResponse(BaseModel):
    morphology: LittoralConduitMorphology
    wave_regime: WavePeriodRegime
    traversal_mode: LittoralTraversalMode
    portal_ceiling_clearance_m: float
    significant_wave_height_m: float
    swell_period_seconds: float
    chamber_convergence_ratio: float
    tide_height_above_mllw_m: float
    chamber_length_m: float
    portal_piston_seal_probability: float
    pneumatic_overpressure_kpa: float
    rebound_surge_velocity_ms: float
    safe_set_lull_window_seconds: float
    safety_status: SeaCavePneumaticSafetyStatus
    swell_set_timing_protocol: str
    barotrauma_and_clapotis_advisory: str


@router.get("/sites", response_model=list[SeaCavePneumaticSiteResponse])
async def list_sea_cave_pneumatic_sites(
    morphology: Optional[LittoralConduitMorphology] = Query(
        default=None, description="Filter by littoral conduit morphology"
    ),
    wave_regime: Optional[WavePeriodRegime] = Query(
        default=None, description="Filter by wave period regime"
    ),
    traversal_mode: Optional[LittoralTraversalMode] = Query(
        default=None,
        description="Filter by recommended littoral traversal mode",
    ),
) -> list[SeaCavePneumaticSiteResponse]:
    """List curated coastal blowhole, surge channel & sea-cave pneumatic sites with optional filtering."""
    sites = filter_sea_cave_pneumatic_sites(
        morphology=morphology,
        wave_regime=wave_regime,
        traversal_mode=traversal_mode,
    )
    return [SeaCavePneumaticSiteResponse(**dict(s)) for s in sites]


@router.get("/sites/{site_id}", response_model=SeaCavePneumaticSiteResponse)
async def get_sea_cave_pneumatic_site(
    site_id: str,
) -> SeaCavePneumaticSiteResponse:
    """Retrieve a specific sea-cave pneumatic site by ID."""
    site = get_sea_cave_pneumatic_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Sea cave pneumatic site '{site_id}' not found.",
        )
    return SeaCavePneumaticSiteResponse(**dict(site))


@router.post("/calculate", response_model=SeaCavePneumaticCalculateResponse)
async def calculate_sea_cave_pneumatic_safety_endpoint(
    payload: SeaCavePneumaticCalculateRequest,
) -> SeaCavePneumaticCalculateResponse:
    """Calculate portal piston-seal probability, pneumatic overpressure, rebound surge velocity, and safe set-lull window."""
    try:
        result = calculate_sea_cave_pneumatic_safety(
            morphology=payload.morphology,
            wave_regime=payload.wave_regime,
            traversal_mode=payload.traversal_mode,
            portal_ceiling_clearance_m=payload.portal_ceiling_clearance_m,
            significant_wave_height_m=payload.significant_wave_height_m,
            swell_period_seconds=payload.swell_period_seconds,
            chamber_convergence_ratio=payload.chamber_convergence_ratio,
            tide_height_above_mllw_m=payload.tide_height_above_mllw_m,
            chamber_length_m=payload.chamber_length_m,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return SeaCavePneumaticCalculateResponse(**dict(result))


@router.get("/gear", response_model=list[SeaCavePneumaticGearItemResponse])
async def list_sea_cave_pneumatic_gear() -> list[SeaCavePneumaticGearItemResponse]:
    """Retrieve the mandatory 6-item sea-cave pneumatic gear checklist."""
    items = get_sea_cave_pneumatic_gear_checklist()
    return [SeaCavePneumaticGearItemResponse(**dict(i)) for i in items]
