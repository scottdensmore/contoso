"""FastAPI Router for Subarctic River Aufeis (Icings) & Overflow Ice Sheet Crossing."""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from contoso_chat.aufeis_crossing import (
    AufeisMorphologyType,
    AufeisSafetyStatus,
    OverflowHydrologyState,
    TraversalModeType,
    calculate_aufeis_crossing_safety,
    filter_aufeis_sites,
    get_aufeis_gear_checklist,
    get_aufeis_site_by_id,
)

router = APIRouter()


class AufeisSiteResponse(BaseModel):
    id: str
    name: str
    region: str
    elevation: int
    elevation_m: int
    morphology: AufeisMorphologyType
    overflow_state: OverflowHydrologyState
    traversal_mode: TraversalModeType
    mean_upper_crust_thickness_cm: float
    slush_water_lens_depth_cm: float
    hydrostatic_head_kpa: float
    typical_cavity_span_m: float
    primary_hazard: str
    high_bench_bypass_route: str
    field_notes: str


class AufeisGearItemResponse(BaseModel):
    id: str
    name: str
    category: str
    mandatory: bool
    rationale: str


class AufeisCalculateRequest(BaseModel):
    morphology: AufeisMorphologyType = Field(
        default="perennial_tundra_spring_naled",
        description="Subarctic river aufeis / naled morphology type",
    )
    overflow_state: OverflowHydrologyState = Field(
        default="vitreous_dry_cryolock",
        description="Overflow hydrology state",
    )
    traversal_mode: TraversalModeType = Field(
        default="nordic_backcountry_ski_glide",
        description="Expedition traversal mode",
    )
    upper_crust_thickness_cm: float = Field(
        default=26.0,
        ge=1.0,
        le=150.0,
        description="Upper ice crust thickness in cm (1.0 to 150.0)",
    )
    slush_water_lens_depth_cm: float = Field(
        default=8.0,
        ge=0.0,
        le=250.0,
        description="Sub-crust slush or water lens depth in cm (0.0 to 250.0)",
    )
    ambient_air_temp_c: float = Field(
        default=-22.0,
        ge=-55.0,
        le=15.0,
        description="Ambient air temperature in °C (-55.0 to 15.0)",
    )
    hydrostatic_head_kpa: float = Field(
        default=12.0,
        ge=0.0,
        le=150.0,
        description="Sub-crust groundwater / overflow hydrostatic head in kPa (0.0 to 150.0)",
    )
    traveler_plus_pulk_load_kg: float = Field(
        default=95.0,
        ge=30.0,
        le=250.0,
        description="Total traveler plus pulk load in kg (30.0 to 250.0)",
    )
    cavity_span_m: float = Field(
        default=0.6,
        ge=0.0,
        le=15.0,
        description="Drained air cavity or frost-blister span in meters (0.0 to 15.0)",
    )


class AufeisCalculateResponse(BaseModel):
    morphology: AufeisMorphologyType
    overflow_state: OverflowHydrologyState
    traversal_mode: TraversalModeType
    upper_crust_thickness_cm: float
    slush_water_lens_depth_cm: float
    ambient_air_temp_c: float
    hydrostatic_head_kpa: float
    traveler_plus_pulk_load_kg: float
    cavity_span_m: float
    effective_crust_bearing_margin: float
    slush_breakthrough_probability: float
    ski_boot_ice_accretion_rate_mm_min: float
    cavity_vault_collapse_risk_percent: float
    safety_status: AufeisSafetyStatus
    overflow_routing_protocol: str
    slush_extraction_and_deicing_advisory: str


@router.get("/sites", response_model=list[AufeisSiteResponse])
async def list_aufeis_sites(
    morphology: Optional[AufeisMorphologyType] = Query(
        default=None, description="Filter by aufeis morphology type"
    ),
    overflow_state: Optional[OverflowHydrologyState] = Query(
        default=None, description="Filter by overflow hydrology state"
    ),
    traversal_mode: Optional[TraversalModeType] = Query(
        default=None, description="Filter by recommended traversal mode"
    ),
) -> list[AufeisSiteResponse]:
    """List curated subarctic river aufeis and overflow crossing sites with optional filtering."""
    sites = filter_aufeis_sites(
        morphology=morphology,
        overflow_state=overflow_state,
        traversal_mode=traversal_mode,
    )
    return [AufeisSiteResponse(**dict(s)) for s in sites]


@router.get("/sites/{site_id}", response_model=AufeisSiteResponse)
async def get_aufeis_site(site_id: str) -> AufeisSiteResponse:
    """Retrieve a specific subarctic river aufeis / naled crossing site by ID."""
    site = get_aufeis_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Aufeis crossing site '{site_id}' not found.",
        )
    return AufeisSiteResponse(**dict(site))


@router.post("/calculate", response_model=AufeisCalculateResponse)
async def calculate_aufeis_safety_endpoint(
    payload: AufeisCalculateRequest,
) -> AufeisCalculateResponse:
    """Calculate subarctic aufeis crust bearing margin, slush breakthrough, ice accretion, and cavity collapse risk."""
    try:
        result = calculate_aufeis_crossing_safety(
            morphology=payload.morphology,
            overflow_state=payload.overflow_state,
            traversal_mode=payload.traversal_mode,
            upper_crust_thickness_cm=payload.upper_crust_thickness_cm,
            slush_water_lens_depth_cm=payload.slush_water_lens_depth_cm,
            ambient_air_temp_c=payload.ambient_air_temp_c,
            hydrostatic_head_kpa=payload.hydrostatic_head_kpa,
            traveler_plus_pulk_load_kg=payload.traveler_plus_pulk_load_kg,
            cavity_span_m=payload.cavity_span_m,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return AufeisCalculateResponse(**dict(result))


@router.get("/gear", response_model=list[AufeisGearItemResponse])
async def list_aufeis_gear() -> list[AufeisGearItemResponse]:
    """Retrieve the mandatory 6-item subarctic aufeis & overflow crossing safety gear checklist."""
    items = get_aufeis_gear_checklist()
    return [AufeisGearItemResponse(**dict(i)) for i in items]
