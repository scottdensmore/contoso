"""FastAPI Router for Volcanic Tephra, Ash-Fall & Lapilli Scree Slope Descent & Respirator Guide."""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from contoso_chat.tephra_navigation import (
    TephraDifficulty,
    TephraLithology,
    TephraRespiratorClass,
    TephraRiskLevel,
    calculate_tephra_navigation,
    filter_sites,
    get_gear_checklist,
    get_site_by_id,
)

router = APIRouter()


class TephraSiteResponse(BaseModel):
    id: str
    name: str
    country: str
    region: str
    elevation: int
    elevation_m: int
    tephra_lithology: TephraLithology
    difficulty: TephraDifficulty
    default_slope_angle_deg: float
    default_ash_depth_cm: float
    default_wind_speed_kmh: float
    cristobalite_pct: float
    grain_size_mm: float
    respirator_recommendation: TephraRespiratorClass
    primary_hazard: str
    descent_protocol: str
    field_notes: str


class TephraGearItemResponse(BaseModel):
    id: str
    name: str
    category: str
    mandatory: bool
    rationale: str


class TephraCalculateRequest(BaseModel):
    slope_angle_deg: float = Field(
        default=28.0,
        ge=0.0,
        le=55.0,
        description="Slope angle in degrees (0 to 55)",
    )
    ash_depth_cm: float = Field(
        default=40.0,
        ge=0.0,
        le=300.0,
        description="Unconsolidated ash/lapilli depth in cm (0 to 300)",
    )
    wind_speed_kmh: float = Field(
        default=20.0,
        ge=0.0,
        le=150.0,
        description="Surface wind speed in km/h (0 to 150)",
    )
    cristobalite_pct: float = Field(
        default=8.0,
        ge=0.0,
        le=35.0,
        description="Crystalline cristobalite silica percentage (0 to 35)",
    )
    grain_size_mm: float = Field(
        default=2.0,
        ge=0.01,
        le=64.0,
        description="Mean tephra/lapilli grain diameter in mm (0.01 to 64)",
    )


class TephraCalculateResponse(BaseModel):
    slope_angle_deg: float
    ash_depth_cm: float
    wind_speed_kmh: float
    cristobalite_pct: float
    grain_size_mm: float
    resuspended_pm10_ug_m3: float
    grain_flow_factor_of_safety: float
    downslope_slide_ratio: float
    filter_clog_hours: float
    risk_level: TephraRiskLevel
    safety_status: TephraRiskLevel
    respirator_class: TephraRespiratorClass
    warnings: list[str]
    recommendations: list[str]


@router.get("/sites", response_model=list[TephraSiteResponse])
async def list_tephra_sites(
    country: Optional[str] = Query(default=None, description="Filter by country or region"),
    tephra_lithology: Optional[str] = Query(default=None, description="Filter by tephra lithology"),
    difficulty: Optional[str] = Query(default=None, description="Filter by descent difficulty"),
    search: Optional[str] = Query(
        default=None, description="Search by keyword across name, country, hazard"
    ),
) -> list[TephraSiteResponse]:
    """List curated volcanic tephra & lapilli scree sites with optional filtering."""
    sites = filter_sites(
        country=country,
        tephra_lithology=tephra_lithology,
        difficulty=difficulty,
        search=search,
    )
    return [TephraSiteResponse(**dict(s)) for s in sites]


@router.get("/sites/{site_id}", response_model=TephraSiteResponse)
async def get_tephra_site(site_id: str) -> TephraSiteResponse:
    """Retrieve a specific volcanic tephra slope site by ID."""
    site = get_site_by_id(site_id)
    if site is None:
        raise HTTPException(
            status_code=404,
            detail=f"Tephra navigation site '{site_id}' not found.",
        )
    return TephraSiteResponse(**dict(site))


@router.post("/calculate", response_model=TephraCalculateResponse)
async def calculate_tephra_navigation_endpoint(
    payload: TephraCalculateRequest,
) -> TephraCalculateResponse:
    """Calculate resuspended PM10, grain-flow factor of safety, downslope slide ratio, and respirator class."""
    try:
        result = calculate_tephra_navigation(
            slope_angle_deg=payload.slope_angle_deg,
            ash_depth_cm=payload.ash_depth_cm,
            wind_speed_kmh=payload.wind_speed_kmh,
            cristobalite_pct=payload.cristobalite_pct,
            grain_size_mm=payload.grain_size_mm,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return TephraCalculateResponse(**dict(result))


@router.get("/checklist", response_model=list[TephraGearItemResponse])
@router.get("/gear", response_model=list[TephraGearItemResponse])
async def list_tephra_checklist() -> list[TephraGearItemResponse]:
    """Retrieve the mandatory 6-item volcanic tephra & respirator gear checklist."""
    items = get_gear_checklist()
    return [TephraGearItemResponse(**dict(i)) for i in items]
