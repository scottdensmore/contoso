"""FastAPI Router for Sub-Canopy Mangroves & Pneumatophore Prop-Root Tidal Labyrinth Navigation."""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from contoso_chat.mangrove_labyrinth import (
    EstuarineTraversalMode,
    MangroveRootMorphology,
    MangroveSafetyStatus,
    TidalCreekRegime,
    calculate_mangrove_labyrinth_navigation,
    filter_mangrove_labyrinth_sites,
    get_mangrove_labyrinth_gear_checklist,
    get_mangrove_labyrinth_site_by_id,
)

router = APIRouter()


class MangroveLabyrinthSiteResponse(BaseModel):
    id: str
    name: str
    region: str
    elevation: int
    elevation_m: int
    root_morphology: MangroveRootMorphology
    tidal_regime: TidalCreekRegime
    traversal_mode: EstuarineTraversalMode
    prop_root_density_stems_m2: float
    typical_current_velocity_knots: float
    typical_water_depth_over_mud_cm: float
    anoxic_silt_sink_depth_cm: float
    canopy_closure_percent: float
    primary_hazard: str
    dendritic_wayfinding_and_exit_protocol: str
    field_notes: str


class MangroveLabyrinthGearItemResponse(BaseModel):
    id: str
    name: str
    category: str
    mandatory: bool
    rationale: str


class MangroveLabyrinthCalculateRequest(BaseModel):
    root_morphology: MangroveRootMorphology = Field(
        default="rhizophora_arching_prop_root_tangle",
        description="Mangrove root or deadfall snag morphology",
    )
    tidal_regime: TidalCreekRegime = Field(
        default="high_slack_canopy_tunnel_float",
        description="Estuarine tidal creek hydrodynamic regime",
    )
    traversal_mode: EstuarineTraversalMode = Field(
        default="short_hull_sit_in_creek_kayak",
        description="Sub-canopy estuarine traversal mode",
    )
    prop_root_density_stems_m2: float = Field(
        default=14.0,
        ge=1.0,
        le=120.0,
        description="Prop-root or pneumatophore density in stems per square meter (1.0 to 120.0)",
    )
    tidal_current_velocity_knots: float = Field(
        default=0.6,
        ge=0.0,
        le=8.0,
        description="Tidal creek current velocity in knots (0.0 to 8.0)",
    )
    water_depth_over_mud_cm: float = Field(
        default=62.0,
        ge=0.0,
        le=350.0,
        description="Water depth over estuarine mud substrate in cm (0.0 to 350.0)",
    )
    anoxic_silt_sink_depth_cm: float = Field(
        default=35.0,
        ge=5.0,
        le=180.0,
        description="Unconsolidated anoxic sulfidic silt sink depth in cm (5.0 to 180.0)",
    )
    canopy_closure_percent: float = Field(
        default=88.0,
        ge=0.0,
        le=100.0,
        description="Overhead mangrove canopy closure percentage (0.0 to 100.0)",
    )
    tide_stage_hours_to_low: float = Field(
        default=3.5,
        ge=0.0,
        le=6.5,
        description="Remaining hours until low-tide slack turn (0.0 to 6.5)",
    )


class MangroveLabyrinthCalculateResponse(BaseModel):
    root_morphology: MangroveRootMorphology
    tidal_regime: TidalCreekRegime
    traversal_mode: EstuarineTraversalMode
    prop_root_density_stems_m2: float
    tidal_current_velocity_knots: float
    water_depth_over_mud_cm: float
    anoxic_silt_sink_depth_cm: float
    canopy_closure_percent: float
    tide_stage_hours_to_low: float
    effective_channel_speed_km_hr: float
    root_strainer_pinning_risk_percent: float
    anoxic_mud_entrapment_probability: float
    safe_ebb_exit_window_minutes: int
    safety_status: MangroveSafetyStatus
    dendritic_wayfinding_protocol: str
    oyster_armor_and_strainer_advisory: str


@router.get("/sites", response_model=list[MangroveLabyrinthSiteResponse])
async def list_mangrove_labyrinth_sites(
    root_morphology: Optional[MangroveRootMorphology] = Query(
        default=None, description="Filter by mangrove root morphology"
    ),
    tidal_regime: Optional[TidalCreekRegime] = Query(
        default=None, description="Filter by tidal creek regime"
    ),
    traversal_mode: Optional[EstuarineTraversalMode] = Query(
        default=None,
        description="Filter by recommended estuarine traversal mode",
    ),
) -> list[MangroveLabyrinthSiteResponse]:
    """List curated sub-canopy mangrove & pneumatophore prop-root labyrinth sites with optional filtering."""
    sites = filter_mangrove_labyrinth_sites(
        root_morphology=root_morphology,
        tidal_regime=tidal_regime,
        traversal_mode=traversal_mode,
    )
    return [MangroveLabyrinthSiteResponse(**dict(s)) for s in sites]


@router.get("/sites/{site_id}", response_model=MangroveLabyrinthSiteResponse)
async def get_mangrove_labyrinth_site(
    site_id: str,
) -> MangroveLabyrinthSiteResponse:
    """Retrieve a specific mangrove labyrinth site by ID."""
    site = get_mangrove_labyrinth_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Mangrove labyrinth site '{site_id}' not found.",
        )
    return MangroveLabyrinthSiteResponse(**dict(site))


@router.post("/calculate", response_model=MangroveLabyrinthCalculateResponse)
async def calculate_mangrove_labyrinth_navigation_endpoint(
    payload: MangroveLabyrinthCalculateRequest,
) -> MangroveLabyrinthCalculateResponse:
    """Calculate effective channel speed, root-strainer pinning risk, anoxic mud entrapment probability, and safe ebb exit window."""
    try:
        result = calculate_mangrove_labyrinth_navigation(
            root_morphology=payload.root_morphology,
            tidal_regime=payload.tidal_regime,
            traversal_mode=payload.traversal_mode,
            prop_root_density_stems_m2=payload.prop_root_density_stems_m2,
            tidal_current_velocity_knots=payload.tidal_current_velocity_knots,
            water_depth_over_mud_cm=payload.water_depth_over_mud_cm,
            anoxic_silt_sink_depth_cm=payload.anoxic_silt_sink_depth_cm,
            canopy_closure_percent=payload.canopy_closure_percent,
            tide_stage_hours_to_low=payload.tide_stage_hours_to_low,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return MangroveLabyrinthCalculateResponse(**dict(result))


@router.get("/gear", response_model=list[MangroveLabyrinthGearItemResponse])
async def list_mangrove_labyrinth_gear() -> list[MangroveLabyrinthGearItemResponse]:
    """Retrieve the mandatory 6-item sub-canopy mangrove labyrinth gear checklist."""
    items = get_mangrove_labyrinth_gear_checklist()
    return [MangroveLabyrinthGearItemResponse(**dict(i)) for i in items]
