import json
import logging
import os
import time
from pathlib import Path
from typing import Any, Optional

from contoso_chat.acclimatization import (
    AcclimatizationPlanRequest,
    AcclimatizationPlanResponse,
    AltitudeMedicalGearRequirement,
    AltitudePeakProfileModel,
    calculate_acclimatization_plan,
    detect_acclimatization_intent,
    format_acclimatization_response,
    get_altitude_medical_gear,
    get_altitude_profile_by_id,
    get_altitude_profiles,
)
from contoso_chat.adventures import (
    AdventureGuideInfo,
    AdventureTourInfo,
    detect_adventure_intent,
    format_adventure_response,
    get_adventure_guides,
    get_adventure_tours,
)
from contoso_chat.alpine_scuba import (
    AlpineScubaGearRequirement,
    AlpineScubaSiteModel,
    ScubaCalculationRequest,
    ScubaCalculationResponse,
    calculate_scuba_decompression,
    detect_alpine_scuba_intent,
    format_alpine_scuba_response,
    get_alpine_scuba_gear,
    get_alpine_scuba_site_by_id,
    get_alpine_scuba_sites,
)
from contoso_chat.avalanche import (
    AvalancheZoneModel,
    SlopeAssessmentRequest,
    SlopeAssessmentResponse,
    assess_slope_terrain,
    detect_avalanche_intent,
    format_avalanche_response,
    get_avalanche_zone_by_id,
    get_avalanche_zones,
    get_companion_rescue_protocol,
)
from contoso_chat.big_wall import (
    BigWallGearRequirement,
    BigWallRouteModel,
    HaulCalculationRequest,
    HaulCalculationResponse,
    calculate_haul_effort,
    detect_big_wall_intent,
    format_big_wall_response,
    get_big_wall_gear,
    get_big_wall_route_by_id,
    get_big_wall_routes,
)
from contoso_chat.bikepacking import (
    BikepackingGearRequirement,
    BikepackingRigRequest,
    BikepackingRigResponse,
    BikepackingRouteModel,
    calculate_bikepacking_rig,
    detect_bikepacking_intent,
    format_bikepacking_response,
    get_bikepacking_gear,
    get_bikepacking_route_by_id,
    get_bikepacking_routes,
)
from contoso_chat.bushcraft import (
    BushcraftGearRequirement,
    BushcraftProjectModel,
    ShelterThermalRequest,
    ShelterThermalResponse,
    calculate_shelter_thermal,
    detect_bushcraft_intent,
    format_bushcraft_response,
    get_bushcraft_gear,
    get_bushcraft_project_by_id,
    get_bushcraft_projects,
)
from contoso_chat.canoe_expedition import (
    CanoeGearRequirement,
    CanoeRouteModel,
    CanoeTrimRequest,
    CanoeTrimResponse,
    calculate_canoe_trim,
    extract_canoe_intent,
    format_canoe_response,
    get_canoe_gear,
    get_canoe_route_by_id,
    get_canoe_routes,
)
from contoso_chat.canyoneering import (
    CanyoneeringGearRequirement,
    RopeRiggingRequest,
    RopeRiggingResponse,
    SlotCanyonRouteModel,
    calculate_rope_rigging_plan,
    detect_canyoneering_intent,
    format_canyoneering_response,
    get_canyon_route_by_id,
    get_canyon_routes,
    get_canyoneering_gear,
)
from contoso_chat.carrier_tracking import (
    CarrierTrackingInfo,
    detect_carrier_tracking_intent,
    lookup_carrier_tracking,
)
from contoso_chat.caving import (
    CavingGearRequirement,
    CavingRouteModel,
    SrtRiggingRequest,
    SrtRiggingResponse,
    calculate_srt_rigging_plan,
    detect_caving_intent,
    format_caving_response,
    get_caving_gear,
    get_caving_route_by_id,
    get_caving_routes,
)
from contoso_chat.climbing import (
    CragModel,
    RackCalcRequest,
    RackCalcResponse,
    calculate_climbing_rack,
    detect_climbing_intent,
    format_climbing_response,
    get_climbing_crag_by_id,
    get_climbing_crags,
    get_rappel_safety_protocol,
)
from contoso_chat.coasteering import (
    CoasteeringGearRequirement,
    CoasteeringRouteModel,
    JumpSafetyRequest,
    JumpSafetyResponse,
    calculate_jump_safety,
    detect_coasteering_intent,
    format_coasteering_response,
    get_coasteering_gear,
    get_coasteering_route_by_id,
    get_coasteering_routes,
)
from contoso_chat.desert_trekking import (
    DesertGearRequirement,
    DesertRouteModel,
    HydrationPlanRequest,
    HydrationPlanResponse,
    calculate_hydration_plan,
    detect_desert_trekking_intent,
    format_desert_trekking_response,
    get_desert_gear,
    get_desert_route_by_id,
    get_desert_routes,
)
from contoso_chat.dogsledding import (
    DogsledRouteModel,
    MushingGearRequirement,
    MushingPacingRequest,
    MushingPacingResponse,
    calculate_mushing_pacing,
    extract_dogsled_intent,
    format_dogsled_response,
    get_dogsled_gear,
    get_dogsled_route_by_id,
    get_dogsled_routes,
)
from contoso_chat.faq import (
    FaqItem,
    detect_faq_intent,
    get_all_faqs,
    get_faq_by_id,
    search_faqs,
)
from contoso_chat.feedback import (
    FeedbackRequest,
    FeedbackResponse,
    get_feedback_summary,
    record_feedback,
)
from contoso_chat.field_reports import (
    FieldReportModel,
    HazardAlertModel,
    detect_field_reports_intent,
    format_field_reports_response,
    get_field_reports,
    get_hazard_alerts,
)
from contoso_chat.fire_safety import (
    FireReportRequest,
    FireReportResponse,
    FireZoneModel,
    StoveCheckRequest,
    StoveCheckResponse,
    check_stove_compliance,
    detect_fire_safety_intent,
    format_fire_safety_response,
    get_campfire_safety_protocol,
    get_fire_zone_by_id,
    get_fire_zones,
    submit_fire_report,
)
from contoso_chat.first_aid import (
    KitCalcRequest,
    KitCalcResponse,
    MedicalConditionModel,
    TriageRequest,
    TriageResponse,
    assess_wilderness_triage,
    calculate_first_aid_kit,
    detect_first_aid_intent,
    format_first_aid_response,
    get_evacuation_safety_protocol,
    get_medical_condition_by_id,
    get_medical_conditions,
)
from contoso_chat.fly_fishing import (
    FishingLocationModel,
    FlyFishingGearRegulationsResponse,
    FlyMatchRequest,
    FlyMatchResponse,
    calculate_fly_match,
    detect_fly_fishing_intent,
    format_fly_fishing_response,
    get_fishing_location_by_id,
    get_fishing_locations,
    get_fly_fishing_gear_and_regulations,
)
from contoso_chat.foraging import (
    SafetyScreenerRequest,
    SafetyScreenerResponse,
    SpeciesModel,
    assess_foraging_safety,
    detect_foraging_intent,
    format_foraging_response,
    get_foraging_guidelines,
    get_foraging_species,
    get_foraging_species_by_id,
)
from contoso_chat.glacier_navigation import (
    CrevasseNavigationRequest,
    CrevasseNavigationResponse,
    GlacierZoneModel,
    calculate_crevasse_navigation,
    detect_glacier_intent,
    format_glacier_response,
    get_glacier_zone_by_id,
    get_glacier_zones,
)
from contoso_chat.glacier_navigation import (
    GlacierGearRequirement as GlacierNavigationGearRequirement,
)
from contoso_chat.glacier_navigation import (
    get_glacier_gear as get_glacier_navigation_gear,
)
from contoso_chat.highline import (
    HighlineGearRequirement,
    HighlineSpanModel,
    RiggingCalculationRequest,
    RiggingCalculationResponse,
    calculate_rigging_physics,
    extract_highline_intent,
    format_highline_response,
    get_highline_gear,
    get_highline_span_by_id,
    get_highline_spans,
)
from contoso_chat.hot_springs import (
    HotSpringGearEthicsResponse,
    HotSpringModel,
    SoakingPlanRequest,
    SoakingPlanResponse,
    calculate_soaking_plan,
    detect_hot_spring_intent,
    format_hot_spring_response,
    get_hot_spring_by_id,
    get_hot_spring_gear_and_ethics,
    get_hot_springs,
)
from contoso_chat.huts import (
    AlpineHutModel,
    HutAvailabilityRequest,
    HutAvailabilityResponse,
    HutBookingRequest,
    HutBookingResponse,
    book_alpine_hut,
    calculate_hut_quote,
    detect_hut_intent,
    format_hut_response,
    get_alpine_hut_by_id,
    get_alpine_huts,
)
from contoso_chat.ice_climbing import (
    IceClimbingGearRequirement,
    IceClimbingRouteModel,
    IceRiggingRequest,
    IceRiggingResponse,
    calculate_ice_rigging_plan,
    detect_ice_climbing_intent,
    format_ice_climbing_response,
    get_ice_climbing_gear,
    get_ice_climbing_route_by_id,
    get_ice_climbing_routes,
)
from contoso_chat.leave_no_trace import (
    LntPrincipleModel,
    PackOutCalcRequest,
    PackOutCalcResponse,
    WasteComplianceRequest,
    WasteComplianceResponse,
    WildernessZoneModel,
    assess_waste_compliance,
    calculate_pack_out_waste,
    detect_lnt_intent,
    format_lnt_response,
    get_lnt_principles,
    get_wilderness_zones,
)
from contoso_chat.mountain_weather import (
    MountainWeatherRequest,
    MountainWeatherResponse,
    WeatherGearItemModel,
    WeatherSectorModel,
    calculate_mountain_weather,
    detect_mountain_weather_intent,
    format_mountain_weather_response,
    get_weather_gear,
    get_weather_sector,
    get_weather_sectors,
)
from contoso_chat.mountaineering import (
    GlacierGearRequirement,
    GlacierRouteModel,
    RopeTeamPlanRequest,
    RopeTeamPlanResponse,
    calculate_rope_team_plan,
    detect_mountaineering_intent,
    format_mountaineering_response,
    get_glacier_gear,
    get_glacier_route_by_id,
    get_glacier_routes,
)
from contoso_chat.nordic_skiing import (
    NordicGearRequirement,
    NordicTrailModel,
    WaxAdvisorRequest,
    WaxAdvisorResponse,
    calculate_wax_plan,
    detect_nordic_skiing_intent,
    format_nordic_skiing_response,
    get_nordic_gear,
    get_nordic_trail_by_id,
    get_nordic_trails,
)
from contoso_chat.order_tracking import detect_order_tracking_intent
from contoso_chat.orienteering import (
    NavigationLegRequest,
    NavigationLegResponse,
    OrienteeringCourseModel,
    OrienteeringGearRequirement,
    calculate_navigation_leg,
    extract_orienteering_intent,
    format_orienteering_response,
    get_orienteering_course_by_id,
    get_orienteering_courses,
    get_orienteering_gear,
)
from contoso_chat.packrafting import (
    PackraftGearRequirement,
    PackraftPlanRequest,
    PackraftPlanResponse,
    PackraftRouteModel,
    calculate_packraft_plan,
    detect_packrafting_intent,
    format_packrafting_response,
    get_packraft_gear,
    get_packraft_route_by_id,
    get_packraft_routes,
)
from contoso_chat.permits import (
    ParkPassInfo,
    PermitLotteryInfo,
    PermitRegulation,
    detect_permits_intent,
    format_permits_response,
    get_park_passes,
    get_permit_lotteries,
    get_permit_regulations,
)
from contoso_chat.policies import (
    detect_policy_intent,
    get_policy_by_id,
    get_store_policies,
)
from contoso_chat.primitive_trapping import (
    TrappingCalculationRequest,
    TrappingCalculationResponse,
    TrappingMechanismModel,
    TrappingSafetyItemModel,
    calculate_primitive_trapping,
    detect_primitive_trapping_intent,
    format_primitive_trapping_response,
    get_trapping_mechanism,
    get_trapping_mechanisms,
    get_trapping_safety_gear,
)
from contoso_chat.promotions import (
    detect_promo_intent,
    get_active_promotions,
    validate_promo_code,
)
from contoso_chat.psicobloc import (
    PsicoblocCalculationRequest,
    PsicoblocCalculationResponse,
    PsicoblocCragModel,
    PsicoblocGearRequirement,
    calculate_psicobloc,
    detect_psicobloc_intent,
    format_psicobloc_response,
    get_psicobloc_crag_by_id,
    get_psicobloc_crags,
    get_psicobloc_gear,
)
from contoso_chat.rentals import (
    RentalPackage,
    RentalQuoteRequest,
    RentalQuoteResponse,
    calculate_rental_quote,
    detect_rental_intent,
    format_rental_response,
    get_rental_packages,
)
from contoso_chat.repair import (
    RepairDiagnoseRequest,
    RepairDiagnosis,
    RepairServiceItem,
    detect_repair_intent,
    diagnose_repair_issue,
    format_repair_response,
    get_repair_services,
)
from contoso_chat.return_label import (
    ReturnLabelInfo,
    ReturnLabelRequest,
    detect_return_label_intent,
    format_return_label_response,
    generate_return_label,
)
from contoso_chat.review_summary import (
    ProductReviewSummary,
    detect_review_sentiment_intent,
    get_review_summary,
)
from contoso_chat.rewards import (
    CustomerLoyaltyInfo,
    LoyaltyRedemptionRequest,
    LoyaltyRedemptionResponse,
    MemberTierInfo,
    detect_rewards_intent,
    format_rewards_response,
    get_customer_loyalty,
    get_tier_perks,
    redeem_voucher,
)
from contoso_chat.river_rafting import (
    RaftCalculationRequest,
    RaftCalculationResponse,
    RaftingExpeditionModel,
    RaftingGearRequirement,
    calculate_river_rafting,
    detect_river_rafting_intent,
    format_river_rafting_response,
    get_river_rafting_expedition_by_id,
    get_river_rafting_expeditions,
    get_river_rafting_gear,
)
from contoso_chat.river_sup import (
    RiverSupCalculationRequest,
    RiverSupCalculationResponse,
    RiverSupGearRequirement,
    RiverSupRunModel,
    calculate_river_sup,
    detect_river_sup_intent,
    format_river_sup_response,
    get_river_sup_gear,
    get_river_sup_run_by_id,
    get_river_sup_runs,
)
from contoso_chat.routes import (
    RouteExportRequest,
    RouteExportResponse,
    TrailRouteModel,
    detect_route_intent,
    export_route_file,
    format_route_response,
    get_gps_navigation_safety_protocol,
    get_trail_route_by_id,
    get_trail_routes,
)
from contoso_chat.safety import (
    AvalancheAdvisory,
    BeaconCheckinRequest,
    BeaconCheckinResponse,
    BeaconRegistrationRequest,
    BeaconRegistrationResponse,
    EmergencyProtocol,
    detect_safety_intent,
    format_safety_response,
    get_avalanche_advisory,
    get_emergency_protocol,
    list_avalanche_advisories,
    list_emergency_protocols,
    record_beacon_checkin,
    register_safety_beacon,
)
from contoso_chat.sea_kayaking import (
    SeaKayakGearRequirement,
    SeaKayakRouteModel,
    TidePlanRequest,
    TidePlanResponse,
    calculate_tide_plan,
    detect_sea_kayaking_intent,
    format_sea_kayaking_response,
    get_sea_kayak_gear,
    get_sea_kayak_route_by_id,
    get_sea_kayak_routes,
)
from contoso_chat.session_store import (
    ChatSession,
    append_message,
    create_or_get_session,
    delete_session,
    get_history_for_llm,
    get_session,
    list_sessions,
)
from contoso_chat.shuttles import (
    CarpoolOfferRequest,
    CarpoolOfferResponse,
    ShuttleBookingRequest,
    ShuttleBookingResponse,
    ShuttleQuoteRequest,
    ShuttleQuoteResponse,
    ShuttleRouteModel,
    book_shuttle,
    calculate_shuttle_quote,
    create_carpool_offer,
    detect_shuttle_intent,
    format_shuttle_response,
    get_shuttle_routes,
    list_carpools,
)
from contoso_chat.sizing import (
    CategorySizeGuide,
    detect_sizing_intent,
    get_size_guide,
)
from contoso_chat.ski_touring import (
    SkinningPaceRequest,
    SkinningPaceResponse,
    SkiTourRouteModel,
    calculate_skinning_pace,
    detect_ski_tour_intent,
    format_ski_tour_response,
    get_ski_tour_route_by_id,
    get_ski_tour_routes,
    get_skin_track_etiquette_and_policies,
)
from contoso_chat.snowkiting import (
    SnowkitingCalculationRequest,
    SnowkitingCalculationResponse,
    SnowkitingGearRequirement,
    SnowkitingSpotModel,
    calculate_snowkiting,
    detect_snowkiting_intent,
    format_snowkiting_response,
    get_snowkiting_gear,
    get_snowkiting_spot_by_id,
    get_snowkiting_spots,
)
from contoso_chat.snowmobiling import (
    SledCalculationRequest,
    SledCalculationResponse,
    SnowmobileGearRequirement,
    SnowmobileZoneModel,
    calculate_sled_performance,
    detect_snowmobiling_intent,
    format_snowmobiling_response,
    get_snowmobile_gear,
    get_snowmobile_zone_by_id,
    get_snowmobile_zones,
)
from contoso_chat.stargazing import (
    MeteorShowerModel,
    ObservingSiteModel,
    ViewingWindowRequest,
    ViewingWindowResponse,
    calculate_viewing_window,
    detect_stargazing_intent,
    format_stargazing_response,
    get_meteor_shower_calendar,
    get_stargazing_site_by_id,
    get_stargazing_sites,
)
from contoso_chat.steep_skiing import (
    CouloirCalculationRequest,
    CouloirCalculationResponse,
    CouloirDescentModel,
    SteepSkiingGearRequirement,
    calculate_couloir_dynamics,
    detect_steep_skiing_intent,
    format_steep_skiing_response,
    get_couloir_descent_by_id,
    get_couloir_descents,
    get_steep_skiing_gear,
)
from contoso_chat.stores import (
    detect_store_intent,
    get_all_stores,
    get_store_by_id,
    search_stores,
)
from contoso_chat.trade_in import (
    EligibleBrandModel,
    TradeInEstimateModel,
    TradeInEstimateRequest,
    detect_trade_in_intent,
    estimate_trade_in_payout,
    format_trade_in_response,
    get_eligible_brands,
)
from contoso_chat.trail_packing import (
    PackRouteModel,
    TackChecklistItemModel,
    TrailPackingRequest,
    TrailPackingResponse,
    calculate_trail_packing,
    detect_trail_packing_intent,
    format_trail_packing_response,
    get_pack_route,
    get_pack_routes,
    get_tack_checklist,
)
from contoso_chat.trail_running import (
    MandatoryGearRequirement,
    PacingCalculationRequest,
    PacingCalculationResponse,
    TrailRunRouteModel,
    calculate_trail_run_pacing,
    detect_trail_running_intent,
    format_trail_running_response,
    get_mandatory_gear_requirements,
    get_trail_run_route_by_id,
    get_trail_run_routes,
)
from contoso_chat.trails import (
    TrailCondition,
    TrailOutfittingRequest,
    TrailOutfittingResponse,
    detect_trail_intent,
    format_trail_response,
    generate_outfitting_plan,
    get_trails,
)
from contoso_chat.transcript_export import export_transcript
from contoso_chat.tree_climbing import (
    CanopyGroveModel,
    TreeClimbingRequest,
    TreeClimbingResponse,
    TreeGearItemModel,
    calculate_tree_climbing,
    detect_tree_climbing_intent,
    format_tree_climbing_response,
    get_canopy_grove,
    get_canopy_groves,
    get_tree_gear,
)
from contoso_chat.trip_planner import (
    TripPlanParametersModel,
    TripPlanResultModel,
    detect_trip_planner_intent,
    format_trip_planner_response,
    generate_wilderness_trip_plan,
    get_trip_templates,
)
from contoso_chat.via_ferrata import (
    RiggingPlanRequest,
    RiggingPlanResponse,
    ViaFerrataGearRequirement,
    ViaFerrataRouteModel,
    calculate_rigging_plan,
    detect_via_ferrata_intent,
    format_via_ferrata_response,
    get_via_ferrata_gear,
    get_via_ferrata_route_by_id,
    get_via_ferrata_routes,
)
from contoso_chat.volunteer import (
    StewardshipImpactModel,
    VolunteerRegistrationRequest,
    VolunteerRegistrationResponse,
    VolunteerWorkpartyModel,
    detect_volunteer_intent,
    format_volunteer_response,
    get_stewardship_impact,
    get_volunteer_project_by_id,
    get_volunteer_projects,
    register_volunteer,
)
from contoso_chat.water import (
    HydrationEstimateRequest,
    HydrationEstimateResponse,
    WaterReportRequest,
    WaterReportResponse,
    WaterSourceModel,
    calculate_hydration_estimate,
    detect_water_intent,
    format_water_response,
    get_pathogen_protection_info,
    get_water_source_by_id,
    get_water_sources,
    submit_water_report,
)
from contoso_chat.weather import (
    MicroclimateRequest,
    MicroclimateResponse,
    MountainZoneModel,
    calculate_microclimate,
    detect_weather_intent,
    format_weather_response,
    get_lightning_safety_protocol,
    get_mountain_zone_by_id,
    get_mountain_zones,
)
from contoso_chat.whitewater import (
    RiverRunModel,
    RiverSafetyRequest,
    RiverSafetyResponse,
    assess_river_safety,
    detect_whitewater_intent,
    format_whitewater_response,
    get_whitewater_run_by_id,
    get_whitewater_runs,
    get_whitewater_safety_protocols,
)
from contoso_chat.wild_ice import (
    WildIceGearItemModel,
    WildIceRequest,
    WildIceResponse,
    WildIceVenueModel,
    calculate_wild_ice,
    detect_wild_ice_intent,
    format_wild_ice_response,
    get_wild_ice_gear,
    get_wild_ice_venue,
    get_wild_ice_venues,
)
from contoso_chat.wilderness_shelters import (
    ShelterGearRequirement,
    ShelterThermodynamicsRequest,
    ShelterThermodynamicsResponse,
    SurvivalShelterModel,
    calculate_shelter_thermodynamics,
    extract_shelter_intent,
    format_shelter_response,
    get_shelter_gear,
    get_survival_shelter_by_id,
    get_survival_shelters,
)
from contoso_chat.wilderness_tracking import (
    AnimalTrackProfileModel,
    TrackAgingCalculationRequest,
    TrackAgingCalculationResponse,
    TrackingGearRequirement,
    calculate_track_aging,
    detect_wilderness_tracking_intent,
    format_wilderness_tracking_response,
    get_animal_track_by_id,
    get_animal_tracks,
    get_tracking_gear,
)
from contoso_chat.wildlife import (
    EncounterAssessmentRequest,
    EncounterAssessmentResponse,
    FoodStorageGuidelineModel,
    WildlifeSpeciesModel,
    assess_wildlife_encounter,
    detect_wildlife_intent,
    format_wildlife_response,
    get_food_storage_guidelines,
    get_wildlife_species,
    get_wildlife_species_by_id,
)
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from local_provider_health import evaluate_local_provider_health
from pydantic import BaseModel, ConfigDict

# Import our real chat logic (simplified)
try:
    from contoso_chat.chat_request import (
        detect_handoff_intent,
        get_response,
        get_response_stream,
    )

    REAL_CHAT_AVAILABLE = True
except ImportError:
    REAL_CHAT_AVAILABLE = False
    print("Warning: Real chat logic not available, using mock response")

    def detect_handoff_intent(question: str, chat_history: Any = None) -> dict:
        return {
            "requested": False,
            "reason": None,
            "suggested_action": None,
            "support_contact": None,
        }


_DEFAULT_CARRIER_INFO = lookup_carrier_tracking("CTSO-TRK-DEMO123")
MOCK_CARRIER_TRACKING = _DEFAULT_CARRIER_INFO.model_dump() if _DEFAULT_CARRIER_INFO else {}

MOCK_ORDER_TRACKING = {
    "order_id": "ord_mock_123",
    "date": "2026-09-12T12:00:00Z",
    "status": "Shipped",
    "carrier": "FedEx Ground",
    "tracking_number": "CTSO-TRK-MOCK123",
    "estimated_delivery": "In 2 business days",
    "status_message": "In transit with carrier",
    "items_count": 1,
    "total": 350.0,
}

MOCK_CITATIONS = [
    {
        "name": "Alpine Explorer Tent",
        "slug": "alpine-explorer-tent",
        "price": 350.0,
        "image": "/images/8/3a9b1875-9114-4a53-adeb-4a79bf63c29f.webp",
        "category": "Tents",
    },
]


base = Path(__file__).resolve().parent
load_dotenv()

CHAT_SERVICE_PROVIDER = os.environ.get("LLM_PROVIDER", "gcp")
CHAT_SERVICE_MODEL = (
    os.environ.get("LOCAL_MODEL_NAME", "gemma3:12b")
    if CHAT_SERVICE_PROVIDER == "local"
    else os.environ.get("GEMINI_MODEL_NAME", "gemini-2.5-flash")
)

# Configure structured logging for Cloud Logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Contoso Chat", version="1.0.0")


# Middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    # Log request details (filter sensitive headers)
    _sensitive_headers = {"authorization", "cookie", "x-api-key", "x-auth-token"}
    filtered_headers = {
        k: v for k, v in request.headers.items() if k.lower() not in _sensitive_headers
    }
    logger.info(
        "Request started",
        extra={
            "method": request.method,
            "url": str(request.url),
            "headers": filtered_headers,
            "client_ip": request.client.host if request.client else None,
        },
    )

    response = await call_next(request)

    # Calculate response time
    process_time = time.time() - start_time

    # Log response details
    logger.info(
        "Request completed",
        extra={
            "method": request.method,
            "url": str(request.url),
            "status_code": response.status_code,
            "process_time": process_time,
            "client_ip": request.client.host if request.client else None,
        },
    )

    # Add response time header
    response.headers["X-Process-Time"] = str(process_time)

    return response


# CORS middleware - restrict to known origins
_allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3100").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)


# Request model
class StoreSearchRequest(BaseModel):
    query: str
    has_pickup: Optional[bool] = None


class PolicyInquiryRequest(BaseModel):
    query: str


class PromoValidateRequest(BaseModel):
    code: str


class ChatExportRequest(BaseModel):
    session_id: Optional[str] = None
    messages: Optional[list[dict[str, Any]]] = None
    format: str = "markdown"  # "markdown" | "text" | "json"
    title: Optional[str] = None
    include_citations: bool = True
    include_timestamps: bool = True


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    question: str
    customer_id: Optional[str] = None
    chat_history: Optional[Any] = "[]"
    session_id: Optional[str] = None


@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {
        "message": "Contoso Chat API",
        "version": "1.0.0",
        "status": "running",
        "real_chat": REAL_CHAT_AVAILABLE,
    }


@app.get("/health")
async def health():
    logger.info("Health check endpoint accessed")
    return {"status": "healthy", "real_chat": REAL_CHAT_AVAILABLE}


async def check_database_connection() -> tuple[bool, str | None]:
    try:
        from db import check_connection

        return await check_connection()
    except Exception as exc:  # noqa: BLE001
        return False, str(exc)


@app.get("/api/chat/status")
async def get_chat_status() -> dict[str, Any]:
    logger.info("Chat status diagnostics endpoint accessed")
    provider = CHAT_SERVICE_PROVIDER
    if "LLM_PROVIDER" in os.environ:
        provider = os.environ["LLM_PROVIDER"]

    if provider == "local":
        model = os.environ.get("LOCAL_MODEL_NAME", "gemma3:12b")
    else:
        model = os.environ.get("GEMINI_MODEL_NAME", "gemini-2.5-flash")
    if (
        "LOCAL_MODEL_NAME" not in os.environ
        and "GEMINI_MODEL_NAME" not in os.environ
        and CHAT_SERVICE_MODEL not in ("gemma3:12b", "gemini-2.5-flash")
    ):
        model = CHAT_SERVICE_MODEL

    return {
        "status": "online",
        "real_chat_available": REAL_CHAT_AVAILABLE,
        "model_provider": provider,
        "model_name": model,
        "supported_events": [
            "status",
            "citations",
            "profile",
            "handoff",
            "order_tracking",
            "promotions",
            "policy",
            "stores",
            "session",
        ],
    }


@app.get("/health/dependencies")
async def health_dependencies():
    logger.info("Dependency health endpoint accessed")
    db_connected, db_error = await check_database_connection()
    local_provider = evaluate_local_provider_health()
    local_provider_ready = bool(local_provider.get("ready", True))
    status = "healthy" if db_connected and local_provider_ready else "degraded"
    return {
        "status": status,
        "real_chat": REAL_CHAT_AVAILABLE,
        "database": {
            "connected": db_connected,
            "error": db_error,
        },
        "local_provider": local_provider,
    }


@app.post("/api/create_response")
@app.post("/api/chat/service/create_response")
async def create_response(request: ChatRequest):
    logger.info(
        "Chat request received",
        extra={
            "customer_id": request.customer_id,
            "session_id": request.session_id,
            "question_length": len(request.question),
            "has_chat_history": len(str(request.chat_history or "")) > 2,
            "real_chat_available": REAL_CHAT_AVAILABLE,
        },
    )

    chat_history = request.chat_history
    if request.session_id:
        create_or_get_session(request.session_id, customer_id=request.customer_id)
        if chat_history is None or chat_history == "" or chat_history == "[]" or chat_history == []:
            chat_history = get_history_for_llm(request.session_id)
        append_message(session_id=request.session_id, role="user", content=request.question)

    try:
        if REAL_CHAT_AVAILABLE:
            # Use real chat logic
            logger.info("Processing request with real chat logic")
            result = await get_response(request.customer_id, request.question, chat_history)

            logger.info(
                "Chat response generated",
                extra={
                    "customer_id": request.customer_id,
                    "response_length": len(result.get("answer", "")),
                    "context_items": len(result.get("context", [])),
                    "success": True,
                },
            )
            if request.session_id:
                result["session_id"] = request.session_id
                res_citations = result.get("citations")
                res_tracking = result.get("order_tracking")
                append_message(
                    session_id=request.session_id,
                    role="assistant",
                    content=str(result.get("answer", "")),
                    citations=res_citations if isinstance(res_citations, list) else None,
                    order_tracking=res_tracking if isinstance(res_tracking, dict) else None,
                )
            return result
        else:
            # Mock response for testing
            logger.warning("Using mock response - real chat logic not available")
            handoff = detect_handoff_intent(request.question, chat_history)
            tracking_intent = detect_order_tracking_intent(request.question)
            carrier_intent = detect_carrier_tracking_intent(request.question)
            promo_intent = detect_promo_intent(request.question)
            policy_intent = detect_policy_intent(request.question)
            store_intent = detect_store_intent(request.question)
            faq_result = detect_faq_intent(request.question)
            sizing_info = detect_sizing_intent(request.question)
            review_info = detect_review_sentiment_intent(request.question)
            rental_intent = detect_rental_intent(request.question)
            return_intent = detect_return_label_intent(request.question)
            trail_intent = detect_trail_intent(request.question)
            rewards_intent = detect_rewards_intent(request.question)
            permits_intent = detect_permits_intent(request.question)
            repair_intent = detect_repair_intent(request.question)
            adventure_intent = detect_adventure_intent(request.question)
            field_reports_intent = detect_field_reports_intent(request.question)
            trade_in_intent = detect_trade_in_intent(request.question)
            trip_planner_intent = detect_trip_planner_intent(request.question)
            shuttle_intent = detect_shuttle_intent(request.question)
            hut_intent = detect_hut_intent(request.question)
            volunteer_intent = detect_volunteer_intent(request.question)
            water_intent = detect_water_intent(request.question)
            route_intent = detect_route_intent(request.question)
            fire_safety_intent = detect_fire_safety_intent(request.question)
            first_aid_intent = detect_first_aid_intent(request.question)
            lnt_intent = detect_lnt_intent(request.question)
            avalanche_intent = detect_avalanche_intent(request.question)
            weather_intent = detect_weather_intent(request.question)
            ski_tour_intent = detect_ski_tour_intent(request.question)
            whitewater_intent = detect_whitewater_intent(request.question)
            climbing_intent = detect_climbing_intent(request.question)
            foraging_intent = detect_foraging_intent(request.question)
            stargazing_intent = detect_stargazing_intent(request.question)
            wildlife_intent = detect_wildlife_intent(request.question)
            trail_running_intent = detect_trail_running_intent(request.question)
            fly_fishing_intent = detect_fly_fishing_intent(request.question)
            hot_springs_intent = detect_hot_spring_intent(request.question)
            bikepacking_intent = detect_bikepacking_intent(request.question)
            mountaineering_intent = detect_mountaineering_intent(request.question)
            sea_kayaking_intent = detect_sea_kayaking_intent(request.question)
            packrafting_intent = detect_packrafting_intent(request.question)
            canyoneering_intent = detect_canyoneering_intent(request.question)
            acclimatization_intent = detect_acclimatization_intent(request.question)
            nordic_skiing_intent = detect_nordic_skiing_intent(request.question)
            via_ferrata_intent = detect_via_ferrata_intent(request.question)
            ice_climbing_intent = detect_ice_climbing_intent(request.question)
            bushcraft_intent = detect_bushcraft_intent(request.question)
            caving_intent = detect_caving_intent(request.question)
            desert_trekking_intent = detect_desert_trekking_intent(request.question)
            coasteering_intent = detect_coasteering_intent(request.question)
            orienteering_intent = extract_orienteering_intent(request.question)
            highline_intent = extract_highline_intent(request.question)
            dogsled_intent = extract_dogsled_intent(request.question)
            canoe_intent = extract_canoe_intent(request.question)
            shelter_intent = extract_shelter_intent(request.question)
            glacier_intent = detect_glacier_intent(request.question)
            river_sup_intent = detect_river_sup_intent(request.question)
            wilderness_tracking_intent = detect_wilderness_tracking_intent(request.question)
            snowkiting_intent = detect_snowkiting_intent(request.question)
            psicobloc_intent = detect_psicobloc_intent(request.question)
            big_wall_intent = detect_big_wall_intent(request.question)
            snowmobiling_intent = detect_snowmobiling_intent(request.question)
            alpine_scuba_intent = detect_alpine_scuba_intent(request.question)
            river_rafting_intent = detect_river_rafting_intent(request.question)
            steep_skiing_intent = detect_steep_skiing_intent(request.question)
            primitive_trapping_intent = detect_primitive_trapping_intent(request.question)
            trail_packing_intent = detect_trail_packing_intent(request.question)
            mountain_weather_intent = detect_mountain_weather_intent(request.question)
            wild_ice_intent = detect_wild_ice_intent(request.question)
            tree_climbing_intent = detect_tree_climbing_intent(request.question)
            mock_payload = {
                "answer": f"Mock response: You asked about '{request.question}'. This is a test response from Contoso Chat running on Google Cloud Platform!",
                "customer_id": request.customer_id,
                "chat_history": chat_history,
                "mock": True,
                "citations": MOCK_CITATIONS,
                "handoff": handoff,
                "customer_profile": {"membership": "Gold", "past_purchases_count": 2},
            }
            if carrier_intent.get("is_carrier_intent"):
                ext_id = carrier_intent.get("extracted_identifier")
                c_info = lookup_carrier_tracking(ext_id) if ext_id else None
                if c_info:
                    mock_payload["carrier_tracking"] = c_info.model_dump()
                    mock_payload["answer"] = (
                        f"Mock response: Your package ({c_info.tracking_number}) is currently "
                        f"{c_info.status} with {c_info.carrier}. "
                        f"Current location: {c_info.current_location}. "
                        f"Estimated delivery: {c_info.estimated_delivery}."
                    )
                elif ext_id:
                    mock_payload["answer"] = (
                        f"Mock response: Tracking information not found for identifier: {ext_id}. "
                        "Please verify your tracking number and try again."
                    )
                else:
                    mock_payload["carrier_tracking"] = MOCK_CARRIER_TRACKING
                    mock_payload["answer"] = (
                        f"Mock response: Your package ({MOCK_CARRIER_TRACKING['tracking_number']}) is currently "
                        f"{MOCK_CARRIER_TRACKING['status']} with {MOCK_CARRIER_TRACKING['carrier']}. "
                        f"Current location: {MOCK_CARRIER_TRACKING['current_location']}. "
                        f"Estimated delivery: {MOCK_CARRIER_TRACKING['estimated_delivery']}."
                    )
            elif tracking_intent.get("is_tracking_intent"):
                mock_payload["order_tracking"] = MOCK_ORDER_TRACKING
                mock_payload["answer"] = (
                    f"Mock response: Your order #{MOCK_ORDER_TRACKING['order_id']} is currently "
                    f"{MOCK_ORDER_TRACKING['status']} with {MOCK_ORDER_TRACKING['carrier']}. "
                    f"Tracking number: {MOCK_ORDER_TRACKING['tracking_number']}. "
                    f"Estimated delivery: {MOCK_ORDER_TRACKING['estimated_delivery']}."
                )
            if promo_intent.get("is_promo_intent"):
                mock_payload["promotions"] = get_active_promotions()
                mock_payload["answer"] = (
                    "Mock response: We have great promotions available! "
                    "Use code WELCOME20 for 20% off your order, OUTDOORS10 for 10% off site-wide, "
                    "or TRAIL15 for 15% off trail equipment. Apply them in your cart drawer at checkout!"
                )
            if (
                policy_intent.get("is_policy_query")
                and policy_intent.get("matched_policy")
                and not return_intent
            ):
                mock_payload["policy"] = policy_intent["matched_policy"]
                p_obj = policy_intent["matched_policy"]
                mock_payload["answer"] = (
                    f"Mock response: Regarding our {p_obj.get('title', 'policy')}: "
                    f"{p_obj.get('details', p_obj.get('summary', ''))}"
                )
            if faq_result and faq_result.matches:
                mock_payload["faq"] = [item.model_dump() for item in faq_result.matches]
                f_obj = faq_result.matches[0]
                mock_payload["answer"] = (
                    f"Mock response: Regarding {f_obj.question}: {f_obj.answer}"
                )
            if sizing_info.get("is_sizing_intent") and sizing_info.get("size_guide"):
                mock_payload["sizing"] = sizing_info["size_guide"].model_dump()
                guide = sizing_info["size_guide"]
                rec = sizing_info.get("recommendation")
                if rec:
                    mock_payload["answer"] = (
                        f"Mock response: For {guide.title}, we recommend size {rec.recommended_size}. {rec.advice}"
                    )
                else:
                    mock_payload["answer"] = (
                        f"Mock response: Here is our sizing guide for {guide.title}. {guide.measurement_instructions}"
                    )
            if review_info.get("is_review_intent") and review_info.get("summary"):
                mock_payload["review_summary"] = review_info["summary"].model_dump()
                summary = review_info["summary"]
                mock_payload["answer"] = (
                    f"Mock response: Customer review summary for {summary.product_name} "
                    f"({summary.average_rating}/5 stars from {summary.total_reviews} reviews, "
                    f"{summary.recommendation_percentage}% recommend). "
                    f"Pros: {', '.join(summary.pros)}. Cons: {', '.join(summary.cons)}."
                )
            if store_intent.get("is_store_query") and store_intent.get("matched_stores"):
                mock_payload["stores"] = store_intent["matched_stores"]
                matched = store_intent["matched_stores"]
                store_names = ", ".join(s.get("name", "Contoso Store") for s in matched)
                if store_intent.get("intent_type") == "hours":
                    hours_details = "; ".join(
                        f"{s.get('name')}: {s.get('hours', {}).get('summary', s.get('hours', {}).get('weekday', ''))}"
                        for s in matched
                    )
                    mock_payload["answer"] = (
                        f"Mock response: Here are the store hours for {store_names}: {hours_details}."
                    )
                elif store_intent.get("intent_type") == "pickup":
                    mock_payload["answer"] = (
                        f"Mock response: In-store pickup is available at {store_names}. "
                        f"Services include: {', '.join(matched[0].get('services', []))}."
                    )
                elif store_intent.get("intent_type") == "location":
                    locations = "; ".join(f"{s.get('name')} at {s.get('address')}" for s in matched)
                    mock_payload["answer"] = (
                        f"Mock response: We have store locations at: {locations}."
                    )
                else:
                    mock_payload["answer"] = (
                        f"Mock response: Information for {store_names}: located at {matched[0].get('address')}."
                    )
            if rental_intent:
                formatted_rental = format_rental_response(rental_intent)
                mock_payload["rental_info"] = formatted_rental.get("rental_info")
                mock_payload["answer"] = formatted_rental.get("answer", mock_payload["answer"])
            if return_intent:
                rl_info = (
                    generate_return_label(return_intent.order_id)
                    if return_intent.order_id
                    else None
                )
                formatted_return = format_return_label_response(return_intent, rl_info)
                mock_payload["return_label"] = formatted_return.get("return_label")
                mock_payload["answer"] = formatted_return.get("answer", mock_payload["answer"])
            if (
                trail_intent
                and not field_reports_intent
                and not trip_planner_intent
                and not route_intent
            ):
                formatted_trail = format_trail_response(trail_intent)
                mock_payload["trail_outfitting"] = formatted_trail.get("trail_outfitting")
                mock_payload["answer"] = formatted_trail.get("answer", mock_payload["answer"])
            if rewards_intent:
                rewards_loyalty = get_customer_loyalty(
                    rewards_intent.customer_id or request.customer_id
                )
                formatted_rewards = format_rewards_response(rewards_intent, rewards_loyalty)
                mock_payload["rewards_info"] = formatted_rewards.get("rewards_info")
                mock_payload["answer"] = formatted_rewards.get("answer", mock_payload["answer"])
            if (
                permits_intent
                and not adventure_intent
                and not field_reports_intent
                and not shuttle_intent
                and not hut_intent
                and not volunteer_intent
                and not water_intent
                and not route_intent
                and not fire_safety_intent
                and not first_aid_intent
                and not lnt_intent
                and not avalanche_intent
            ):
                formatted_permits = format_permits_response(permits_intent)
                mock_payload["permits_info"] = formatted_permits.get("permits_info")
                mock_payload["answer"] = formatted_permits.get("answer", mock_payload["answer"])
            if repair_intent:
                formatted_repair = format_repair_response(repair_intent)
                mock_payload["repair_info"] = formatted_repair.get("repair_info")
                mock_payload["answer"] = formatted_repair.get("answer", mock_payload["answer"])
            if adventure_intent:
                formatted_adventure = format_adventure_response(adventure_intent)
                mock_payload["adventures_info"] = formatted_adventure.get("adventures_info")
                mock_payload["answer"] = formatted_adventure.get("answer", mock_payload["answer"])
            if field_reports_intent and not avalanche_intent:
                formatted_field_reports = format_field_reports_response(field_reports_intent)
                mock_payload["field_reports_info"] = formatted_field_reports.get(
                    "field_reports_info"
                )
                mock_payload["answer"] = formatted_field_reports.get(
                    "answer", mock_payload["answer"]
                )
            if trade_in_intent:
                formatted_trade_in = format_trade_in_response(trade_in_intent)
                mock_payload["trade_in_info"] = formatted_trade_in.get("trade_in_info")
                mock_payload["answer"] = formatted_trade_in.get("answer", mock_payload["answer"])
            if trip_planner_intent:
                formatted_trip = format_trip_planner_response(trip_planner_intent)
                mock_payload["trip_planner_info"] = formatted_trip.get("trip_planner_info")
                mock_payload["answer"] = formatted_trip.get("answer", mock_payload["answer"])
            safety_intent = detect_safety_intent(request.question)
            if safety_intent and not avalanche_intent:
                formatted_safety = format_safety_response(safety_intent)
                mock_payload["safety_info"] = formatted_safety.get("safety_info")
                mock_payload["answer"] = formatted_safety.get("answer", mock_payload["answer"])
            if shuttle_intent:
                formatted_shuttle = format_shuttle_response(shuttle_intent)
                mock_payload["shuttle_info"] = formatted_shuttle.get("shuttle_info")
                mock_payload["answer"] = formatted_shuttle.get("answer", mock_payload["answer"])
            if hut_intent:
                formatted_hut = format_hut_response(hut_intent)
                mock_payload["hut_info"] = formatted_hut.get("hut_info")
                mock_payload["answer"] = formatted_hut.get("answer", mock_payload["answer"])
            if volunteer_intent:
                formatted_vol = format_volunteer_response(volunteer_intent)
                mock_payload["volunteer_info"] = formatted_vol.get("volunteer_info")
                mock_payload["answer"] = formatted_vol.get("answer", mock_payload["answer"])
            if water_intent:
                formatted_water = format_water_response(water_intent)
                mock_payload["water_info"] = formatted_water.get("water_info")
                mock_payload["answer"] = formatted_water.get("answer", mock_payload["answer"])
            if route_intent and not shuttle_intent:
                formatted_route = format_route_response(route_intent)
                mock_payload["route_info"] = formatted_route.get("route_info")
                mock_payload["answer"] = formatted_route.get("answer", mock_payload["answer"])
            if fire_safety_intent:
                formatted_fire = format_fire_safety_response(fire_safety_intent)
                mock_payload["fire_safety_info"] = formatted_fire.get("fire_safety_info")
                mock_payload["answer"] = formatted_fire.get("answer", mock_payload["answer"])
            if first_aid_intent:
                formatted_first_aid = format_first_aid_response(first_aid_intent)
                mock_payload["first_aid_info"] = formatted_first_aid.get("first_aid_info")
                mock_payload["answer"] = formatted_first_aid.get("answer", mock_payload["answer"])
            if lnt_intent:
                formatted_lnt = format_lnt_response(lnt_intent)
                mock_payload["lnt_info"] = formatted_lnt.get("lnt_info")
                mock_payload["answer"] = formatted_lnt.get("answer", mock_payload["answer"])
            if avalanche_intent:
                formatted_avy = format_avalanche_response(avalanche_intent)
                mock_payload["avalanche_info"] = formatted_avy.get("avalanche_info")
                mock_payload["answer"] = formatted_avy.get("answer", mock_payload["answer"])
            if weather_intent:
                formatted_weather = format_weather_response(weather_intent)
                mock_payload["weather_info"] = formatted_weather.get("weather_info")
                if not (
                    trail_intent
                    or adventure_intent
                    or shuttle_intent
                    or permits_intent
                    or safety_intent
                ):
                    mock_payload["answer"] = formatted_weather.get("answer", mock_payload["answer"])
            if ski_tour_intent:
                formatted_tour = format_ski_tour_response(ski_tour_intent)
                mock_payload["ski_tour_info"] = formatted_tour.get("ski_tour_info")
                mock_payload["answer"] = formatted_tour.get("answer", mock_payload["answer"])
            if whitewater_intent:
                formatted_ww = format_whitewater_response(whitewater_intent)
                mock_payload["whitewater_info"] = formatted_ww.get("whitewater_info")
                mock_payload["answer"] = formatted_ww.get("answer", mock_payload["answer"])
            if climbing_intent and not adventure_intent:
                formatted_climbing = format_climbing_response(climbing_intent)
                mock_payload["climbing_info"] = formatted_climbing.get("climbing_info")
                mock_payload["answer"] = formatted_climbing.get("answer", mock_payload["answer"])
            if foraging_intent:
                formatted_foraging = format_foraging_response(foraging_intent)
                mock_payload["foraging_info"] = formatted_foraging.get("foraging_info")
                mock_payload["answer"] = formatted_foraging.get("answer", mock_payload["answer"])
            if stargazing_intent:
                formatted_stargazing = format_stargazing_response(stargazing_intent)
                mock_payload["stargazing_info"] = formatted_stargazing.get("stargazing_info")
                mock_payload["answer"] = formatted_stargazing.get("answer", mock_payload["answer"])
            if wildlife_intent:
                formatted_wildlife = format_wildlife_response(wildlife_intent)
                mock_payload["wildlife_info"] = formatted_wildlife.get("wildlife_info")
                mock_payload["answer"] = formatted_wildlife.get("answer", mock_payload["answer"])
            if trail_running_intent:
                formatted_trail_running = format_trail_running_response(trail_running_intent)
                mock_payload["trail_running_info"] = formatted_trail_running.get(
                    "trail_running_info"
                )
                mock_payload["answer"] = formatted_trail_running.get(
                    "answer", mock_payload["answer"]
                )
            if fly_fishing_intent:
                formatted_fly_fishing = format_fly_fishing_response(fly_fishing_intent)
                mock_payload["fly_fishing_info"] = formatted_fly_fishing.get("fly_fishing_info")
                mock_payload["answer"] = formatted_fly_fishing.get("answer", mock_payload["answer"])
            if hot_springs_intent:
                formatted_hot_springs = format_hot_spring_response(hot_springs_intent)
                mock_payload["hot_springs_info"] = formatted_hot_springs.get("hot_springs_info")
                mock_payload["answer"] = formatted_hot_springs.get("answer", mock_payload["answer"])
            if bikepacking_intent:
                formatted_bikepacking = format_bikepacking_response(bikepacking_intent)
                mock_payload["bikepacking_info"] = formatted_bikepacking.get("bikepacking_info")
                mock_payload["answer"] = formatted_bikepacking.get("answer", mock_payload["answer"])
            if mountaineering_intent and not adventure_intent:
                formatted_mountaineering = format_mountaineering_response(mountaineering_intent)
                mock_payload["mountaineering_info"] = formatted_mountaineering.get(
                    "mountaineering_info"
                )
                mock_payload["answer"] = formatted_mountaineering.get(
                    "answer", mock_payload["answer"]
                )
            if sea_kayaking_intent:
                formatted_sea_kayaking = format_sea_kayaking_response(sea_kayaking_intent)
                mock_payload["sea_kayaking_info"] = formatted_sea_kayaking.get("sea_kayaking_info")
                mock_payload["answer"] = formatted_sea_kayaking.get(
                    "answer", mock_payload["answer"]
                )
            if packrafting_intent:
                formatted_packrafting = format_packrafting_response(packrafting_intent)
                mock_payload["packrafting_info"] = formatted_packrafting.get("packrafting_info")
                mock_payload["answer"] = formatted_packrafting.get("answer", mock_payload["answer"])
            if canyoneering_intent:
                formatted_canyoneering = format_canyoneering_response(canyoneering_intent)
                mock_payload["canyoneering_info"] = formatted_canyoneering.get("canyoneering_info")
                mock_payload["answer"] = formatted_canyoneering.get(
                    "answer", mock_payload["answer"]
                )
            if acclimatization_intent:
                formatted_acclimatization = format_acclimatization_response(acclimatization_intent)
                mock_payload["acclimatization_info"] = formatted_acclimatization.get(
                    "acclimatization_info"
                )
                mock_payload["answer"] = formatted_acclimatization.get(
                    "answer", mock_payload["answer"]
                )
            if nordic_skiing_intent:
                formatted_nordic = format_nordic_skiing_response(nordic_skiing_intent)
                mock_payload["nordic_skiing_info"] = formatted_nordic.get("nordic_skiing_info")
                mock_payload["answer"] = formatted_nordic.get("answer", mock_payload["answer"])
            if via_ferrata_intent:
                formatted_via_ferrata = format_via_ferrata_response(via_ferrata_intent)
                mock_payload["via_ferrata_info"] = formatted_via_ferrata.get("via_ferrata_info")
                mock_payload["answer"] = formatted_via_ferrata.get("answer", mock_payload["answer"])
            if ice_climbing_intent:
                formatted_ice_climbing = format_ice_climbing_response(ice_climbing_intent)
                mock_payload["ice_climbing_info"] = formatted_ice_climbing.get("ice_climbing_info")
                mock_payload["answer"] = formatted_ice_climbing.get(
                    "answer", mock_payload["answer"]
                )
            if bushcraft_intent:
                formatted_bushcraft = format_bushcraft_response(bushcraft_intent)
                mock_payload["bushcraft_info"] = formatted_bushcraft.get("bushcraft_info")
                mock_payload["answer"] = formatted_bushcraft.get("answer", mock_payload["answer"])
            if caving_intent:
                formatted_caving = format_caving_response(caving_intent)
                mock_payload["caving_info"] = formatted_caving.get("caving_info")
                mock_payload["answer"] = formatted_caving.get("answer", mock_payload["answer"])
            if desert_trekking_intent:
                formatted_desert = format_desert_trekking_response(desert_trekking_intent)
                mock_payload["desert_trekking_info"] = formatted_desert.get("desert_trekking_info")
                mock_payload["answer"] = formatted_desert.get("answer", mock_payload["answer"])
            if coasteering_intent:
                formatted_coasteering = format_coasteering_response(coasteering_intent)
                mock_payload["coasteering_info"] = formatted_coasteering.get("coasteering_info")
                mock_payload["answer"] = formatted_coasteering.get("answer", mock_payload["answer"])
            if orienteering_intent:
                formatted_orienteering = format_orienteering_response(orienteering_intent)
                mock_payload["orienteering_info"] = formatted_orienteering.get("orienteering_info")
                mock_payload["answer"] = formatted_orienteering.get(
                    "answer", mock_payload["answer"]
                )
            if highline_intent:
                formatted_highline = format_highline_response(highline_intent)
                mock_payload["highline_info"] = formatted_highline.get("highline_info")
                mock_payload["answer"] = formatted_highline.get("answer", mock_payload["answer"])
            if dogsled_intent:
                formatted_dogsled = format_dogsled_response(dogsled_intent)
                mock_payload["dogsled_info"] = formatted_dogsled.get("dogsled_info")
                mock_payload["answer"] = formatted_dogsled.get("answer", mock_payload["answer"])
            if canoe_intent:
                formatted_canoe = format_canoe_response(canoe_intent)
                mock_payload["canoe_info"] = formatted_canoe.get("canoe_info")
                mock_payload["answer"] = formatted_canoe.get("answer", mock_payload["answer"])
            if shelter_intent:
                formatted_shelter = format_shelter_response(shelter_intent)
                mock_payload["shelter_info"] = formatted_shelter.get("shelter_info")
                mock_payload["answer"] = formatted_shelter.get("answer", mock_payload["answer"])
            if glacier_intent:
                formatted_glacier = format_glacier_response(glacier_intent, request.question)
                mock_payload["glacier_info"] = formatted_glacier.get("glacier_info")
                mock_payload["answer"] = formatted_glacier.get("answer", mock_payload["answer"])
            if river_sup_intent:
                formatted_river_sup = format_river_sup_response(river_sup_intent, request.question)
                mock_payload["river_sup_info"] = formatted_river_sup.get("river_sup_info")
                mock_payload["answer"] = formatted_river_sup.get("answer", mock_payload["answer"])
            if wilderness_tracking_intent:
                formatted_tracking = format_wilderness_tracking_response(
                    wilderness_tracking_intent, request.question
                )
                mock_payload["tracking_info"] = formatted_tracking.get("tracking_info")
                mock_payload["answer"] = formatted_tracking.get("answer", mock_payload["answer"])
            if snowkiting_intent:
                formatted_snowkiting = format_snowkiting_response(
                    snowkiting_intent, request.question
                )
                mock_payload["snowkiting_info"] = formatted_snowkiting.get("snowkiting_info")
                mock_payload["answer"] = formatted_snowkiting.get("answer", mock_payload["answer"])
            if psicobloc_intent:
                formatted_psicobloc = format_psicobloc_response(psicobloc_intent, request.question)
                mock_payload["psicobloc_info"] = formatted_psicobloc.get("psicobloc_info")
                mock_payload["answer"] = formatted_psicobloc.get("answer", mock_payload["answer"])
            if big_wall_intent:
                formatted_big_wall = format_big_wall_response(big_wall_intent, request.question)
                mock_payload["big_wall_info"] = formatted_big_wall.get("big_wall_info")
                mock_payload["answer"] = formatted_big_wall.get("answer", mock_payload["answer"])
            if snowmobiling_intent:
                formatted_snowmobiling = format_snowmobiling_response(
                    snowmobiling_intent, request.question
                )
                mock_payload["snowmobiling_info"] = formatted_snowmobiling.get("snowmobiling_info")
                mock_payload["answer"] = formatted_snowmobiling.get(
                    "answer", mock_payload["answer"]
                )
            if alpine_scuba_intent:
                formatted_alpine_scuba = format_alpine_scuba_response(
                    alpine_scuba_intent, request.question
                )
                mock_payload["alpine_scuba_info"] = formatted_alpine_scuba.get("alpine_scuba_info")
                mock_payload["answer"] = formatted_alpine_scuba.get(
                    "answer", mock_payload["answer"]
                )
            if river_rafting_intent:
                formatted_river_rafting = format_river_rafting_response(
                    river_rafting_intent, request.question
                )
                mock_payload["river_rafting_info"] = formatted_river_rafting.get(
                    "river_rafting_info"
                )
                mock_payload["answer"] = formatted_river_rafting.get(
                    "answer", mock_payload["answer"]
                )
            if steep_skiing_intent:
                formatted_steep_skiing = format_steep_skiing_response(
                    steep_skiing_intent, request.question
                )
                mock_payload["steep_skiing_info"] = formatted_steep_skiing.get("steep_skiing_info")
                mock_payload["answer"] = formatted_steep_skiing.get(
                    "answer", mock_payload["answer"]
                )
            if primitive_trapping_intent:
                formatted_primitive_trapping = format_primitive_trapping_response(
                    primitive_trapping_intent, request.question
                )
                mock_payload["primitive_trapping_info"] = formatted_primitive_trapping.get("primitive_trapping_info")
                mock_payload["answer"] = formatted_primitive_trapping.get(
                    "answer", mock_payload["answer"]
                )
            if trail_packing_intent:
                formatted_trail_packing = format_trail_packing_response(
                    trail_packing_intent, request.question
                )
                mock_payload["trail_packing_info"] = formatted_trail_packing.get("trail_packing_info")
                mock_payload["answer"] = formatted_trail_packing.get(
                    "answer", mock_payload["answer"]
                )
            if mountain_weather_intent:
                formatted_mountain_weather = format_mountain_weather_response(
                    mountain_weather_intent, request.question
                )
                mock_payload["mountain_weather_info"] = formatted_mountain_weather.get("mountain_weather_info")
                mock_payload["answer"] = formatted_mountain_weather.get(
                    "answer", mock_payload["answer"]
                )
            if wild_ice_intent:
                formatted_wild_ice = format_wild_ice_response(
                    wild_ice_intent, request.question
                )
                mock_payload["wild_ice_info"] = formatted_wild_ice.get(
                    "wild_ice_info"
                )
                mock_payload["answer"] = formatted_wild_ice.get(
                    "answer", mock_payload["answer"]
                )
            if tree_climbing_intent:
                formatted_tree_climbing = format_tree_climbing_response(
                    tree_climbing_intent, request.question
                )
                mock_payload["tree_climbing_info"] = formatted_tree_climbing.get(
                    "tree_climbing_info"
                )
                mock_payload["answer"] = formatted_tree_climbing.get(
                    "answer", mock_payload["answer"]
                )

            if request.session_id:
                mock_payload["session_id"] = request.session_id
                mock_citations: list[dict[str, Any]] | None = MOCK_CITATIONS
                mock_tracking: dict[str, Any] | None = (
                    MOCK_ORDER_TRACKING if tracking_intent.get("is_tracking_intent") else None
                )
                append_message(
                    session_id=request.session_id,
                    role="assistant",
                    content=str(mock_payload.get("answer", "")),
                    citations=mock_citations,
                    order_tracking=mock_tracking,
                )
            return mock_payload
    except Exception as e:
        # Log the error for debugging
        logger.error(
            "Error processing chat request",
            extra={
                "customer_id": request.customer_id,
                "error": str(e),
                "error_type": type(e).__name__,
            },
            exc_info=True,
        )

        # Fallback response if real chat fails
        handoff = detect_handoff_intent(request.question, chat_history)
        fallback_payload = {
            "answer": f"I'm having trouble processing your request about '{request.question}' right now. Please try again later.",
            "customer_id": request.customer_id,
            "chat_history": chat_history,
            "error": str(e),
            "fallback": True,
            "handoff": handoff,
        }
        if request.session_id:
            fallback_payload["session_id"] = request.session_id
            append_message(
                session_id=request.session_id,
                role="assistant",
                content=str(fallback_payload["answer"]),
                citations=None,
                order_tracking=None,
            )
        return fallback_payload


@app.post("/api/create_response/stream")
@app.post("/api/chat/service/create_response/stream")
async def create_response_stream(request: ChatRequest):
    logger.info(
        "Chat streaming request received",
        extra={
            "customer_id": request.customer_id,
            "session_id": request.session_id,
            "question_length": len(request.question),
            "has_chat_history": len(str(request.chat_history or "")) > 2,
            "real_chat_available": REAL_CHAT_AVAILABLE,
        },
    )

    async def streamer():
        chat_history = request.chat_history
        if request.session_id:
            create_or_get_session(request.session_id, customer_id=request.customer_id)
            if (
                chat_history is None
                or chat_history == ""
                or chat_history == "[]"
                or chat_history == []
            ):
                chat_history = get_history_for_llm(request.session_id)
            append_message(session_id=request.session_id, role="user", content=request.question)
            yield f"data: {json.dumps({'event': 'session', 'session_id': request.session_id})}\n\n"

        accumulated_chunks: list[str] = []
        captured_citations: Optional[list[dict[str, Any]]] = None
        captured_order_tracking: Optional[dict[str, Any]] = None

        try:
            if REAL_CHAT_AVAILABLE:
                logger.info("Processing streaming request with real chat logic")
                async for chunk in get_response_stream(
                    request.customer_id, request.question, chat_history
                ):
                    if chunk.startswith("data: "):
                        payload_str = chunk.removeprefix("data: ").strip()
                        try:
                            event_data = json.loads(payload_str)
                            if isinstance(event_data, dict):
                                if "chunk" in event_data:
                                    accumulated_chunks.append(str(event_data["chunk"]))
                                if event_data.get("event") == "citations":
                                    captured_citations = event_data.get("citations")
                                if event_data.get("event") == "order_tracking":
                                    captured_order_tracking = event_data.get("order_tracking")
                        except (json.JSONDecodeError, TypeError) as exc:
                            logger.debug("Ignoring non-JSON SSE chunk: %s", exc)
                        yield chunk
                    else:
                        accumulated_chunks.append(chunk)
                        yield f"data: {json.dumps({'chunk': chunk})}\n\n"
            else:
                logger.warning("Using mock streaming response - real chat logic not available")
                yield f"data: {json.dumps({'event': 'status', 'status': 'analyzing_query', 'message': 'Analyzing question...'})}\n\n"
                yield f"data: {json.dumps({'event': 'status', 'status': 'searching_catalog', 'message': 'Searching catalog...'})}\n\n"
                yield f"data: {json.dumps({'event': 'status', 'status': 'generating_response', 'message': 'Generating response...'})}\n\n"
                handoff = detect_handoff_intent(request.question, chat_history)
                tracking_intent = detect_order_tracking_intent(request.question)
                carrier_intent = detect_carrier_tracking_intent(request.question)
                promo_intent = detect_promo_intent(request.question)
                policy_intent = detect_policy_intent(request.question)
                store_intent = detect_store_intent(request.question)
                faq_result = detect_faq_intent(request.question)
                sizing_info = detect_sizing_intent(request.question)
                review_info = detect_review_sentiment_intent(request.question)
                rental_intent = detect_rental_intent(request.question)
                return_intent = detect_return_label_intent(request.question)
                trail_intent = detect_trail_intent(request.question)
                rewards_intent = detect_rewards_intent(request.question)
                permits_intent = detect_permits_intent(request.question)
                repair_intent = detect_repair_intent(request.question)
                adventure_intent = detect_adventure_intent(request.question)
                field_reports_intent = detect_field_reports_intent(request.question)
                trade_in_intent = detect_trade_in_intent(request.question)
                trip_planner_intent = detect_trip_planner_intent(request.question)
                safety_intent = detect_safety_intent(request.question)
                shuttle_intent = detect_shuttle_intent(request.question)
                hut_intent = detect_hut_intent(request.question)
                volunteer_intent = detect_volunteer_intent(request.question)
                water_intent = detect_water_intent(request.question)
                route_intent = detect_route_intent(request.question)
                fire_safety_intent = detect_fire_safety_intent(request.question)
                first_aid_intent = detect_first_aid_intent(request.question)
                lnt_intent = detect_lnt_intent(request.question)
                avalanche_intent = detect_avalanche_intent(request.question)
                weather_intent = detect_weather_intent(request.question)
                ski_tour_intent = detect_ski_tour_intent(request.question)
                whitewater_intent = detect_whitewater_intent(request.question)
                climbing_intent = detect_climbing_intent(request.question)
                foraging_intent = detect_foraging_intent(request.question)
                stargazing_intent = detect_stargazing_intent(request.question)
                wildlife_intent = detect_wildlife_intent(request.question)
                trail_running_intent = detect_trail_running_intent(request.question)
                fly_fishing_intent = detect_fly_fishing_intent(request.question)
                hot_springs_intent = detect_hot_spring_intent(request.question)
                bikepacking_intent = detect_bikepacking_intent(request.question)
                mountaineering_intent = detect_mountaineering_intent(request.question)
                sea_kayaking_intent = detect_sea_kayaking_intent(request.question)
                packrafting_intent = detect_packrafting_intent(request.question)
                canyoneering_intent = detect_canyoneering_intent(request.question)
                acclimatization_intent = detect_acclimatization_intent(request.question)
                nordic_skiing_intent = detect_nordic_skiing_intent(request.question)
                via_ferrata_intent = detect_via_ferrata_intent(request.question)
                ice_climbing_intent = detect_ice_climbing_intent(request.question)
                bushcraft_intent = detect_bushcraft_intent(request.question)
                caving_intent = detect_caving_intent(request.question)
                desert_trekking_intent = detect_desert_trekking_intent(request.question)
                coasteering_intent = detect_coasteering_intent(request.question)
                orienteering_intent = extract_orienteering_intent(request.question)
                highline_intent = extract_highline_intent(request.question)
                dogsled_intent = extract_dogsled_intent(request.question)
                canoe_intent = extract_canoe_intent(request.question)
                shelter_intent = extract_shelter_intent(request.question)
                glacier_intent = detect_glacier_intent(request.question)
                river_sup_intent = detect_river_sup_intent(request.question)
                wilderness_tracking_intent = detect_wilderness_tracking_intent(request.question)
                snowkiting_intent = detect_snowkiting_intent(request.question)
                psicobloc_intent = detect_psicobloc_intent(request.question)
                big_wall_intent = detect_big_wall_intent(request.question)
                snowmobiling_intent = detect_snowmobiling_intent(request.question)
                alpine_scuba_intent = detect_alpine_scuba_intent(request.question)
                river_rafting_intent = detect_river_rafting_intent(request.question)
                steep_skiing_intent = detect_steep_skiing_intent(request.question)
                primitive_trapping_intent = detect_primitive_trapping_intent(request.question)
                trail_packing_intent = detect_trail_packing_intent(request.question)
                mountain_weather_intent = detect_mountain_weather_intent(request.question)
                wild_ice_intent = detect_wild_ice_intent(request.question)
                tree_climbing_intent = detect_tree_climbing_intent(request.question)
                captured_citations = MOCK_CITATIONS
                yield f"data: {json.dumps({'event': 'citations', 'citations': MOCK_CITATIONS})}\n\n"
                yield f"data: {json.dumps({'event': 'handoff', 'handoff': handoff})}\n\n"
                yield f"data: {json.dumps({'event': 'profile', 'profile': {'membership': 'Gold', 'past_purchases_count': 2}})}\n\n"
                captured_carrier_tracking: Optional[dict[str, Any]] = None
                if return_intent:
                    rl_info = (
                        generate_return_label(return_intent.order_id)
                        if return_intent.order_id
                        else None
                    )
                    formatted_return = format_return_label_response(return_intent, rl_info)
                    mock_chunks = [str(formatted_return.get("answer", ""))]
                elif carrier_intent.get("is_carrier_intent"):
                    ext_id = carrier_intent.get("extracted_identifier")
                    c_info = lookup_carrier_tracking(ext_id) if ext_id else None
                    if c_info:
                        captured_carrier_tracking = c_info.model_dump()
                    elif not ext_id:
                        captured_carrier_tracking = MOCK_CARRIER_TRACKING

                    if captured_carrier_tracking:
                        yield f"data: {json.dumps({'event': 'carrier_tracking', 'carrier_tracking': captured_carrier_tracking})}\n\n"
                if tracking_intent.get("is_tracking_intent"):
                    captured_order_tracking = MOCK_ORDER_TRACKING
                    yield f"data: {json.dumps({'event': 'order_tracking', 'order_tracking': MOCK_ORDER_TRACKING})}\n\n"
                if promo_intent.get("is_promo_intent"):
                    yield f"data: {json.dumps({'event': 'promotions', 'promotions': get_active_promotions()})}\n\n"
                if (
                    policy_intent.get("is_policy_query")
                    and policy_intent.get("matched_policy")
                    and not return_intent
                ):
                    yield f"data: {json.dumps({'event': 'policy', 'policy': policy_intent['matched_policy']})}\n\n"
                if store_intent.get("is_store_query") and store_intent.get("matched_stores"):
                    yield f"data: {json.dumps({'event': 'stores', 'stores': store_intent['matched_stores']})}\n\n"
                if faq_result and faq_result.matches:
                    yield f"data: {json.dumps({'event': 'faq', 'faq': [item.model_dump() for item in faq_result.matches]})}\n\n"
                if sizing_info.get("is_sizing_intent") and sizing_info.get("size_guide"):
                    yield f"data: {json.dumps({'event': 'sizing', 'sizing': sizing_info['size_guide'].model_dump()})}\n\n"
                if review_info.get("is_review_intent") and review_info.get("summary"):
                    yield f"data: {json.dumps({'event': 'review_summary', 'review_summary': review_info['summary'].model_dump()})}\n\n"
                if rental_intent:
                    formatted_rental = format_rental_response(rental_intent)
                    yield f"data: {json.dumps({'event': 'rental_info', 'rental_info': formatted_rental.get('rental_info')})}\n\n"
                if return_intent:
                    rl_info = (
                        generate_return_label(return_intent.order_id)
                        if return_intent.order_id
                        else None
                    )
                    formatted_return = format_return_label_response(return_intent, rl_info)
                    yield f"data: {json.dumps({'event': 'return_label', 'return_label': formatted_return.get('return_label')})}\n\n"
                if trail_intent and not field_reports_intent and not route_intent:
                    formatted_trail = format_trail_response(trail_intent)
                    yield f"data: {json.dumps({'event': 'trail_outfitting', 'trail_outfitting': formatted_trail.get('trail_outfitting')})}\n\n"
                if rewards_intent:
                    rewards_loyalty = get_customer_loyalty(
                        rewards_intent.customer_id or request.customer_id
                    )
                    formatted_rewards = format_rewards_response(rewards_intent, rewards_loyalty)
                    yield f"data: {json.dumps({'event': 'rewards_info', 'rewards_info': formatted_rewards.get('rewards_info')})}\n\n"
                if (
                    permits_intent
                    and not adventure_intent
                    and not field_reports_intent
                    and not shuttle_intent
                    and not hut_intent
                    and not volunteer_intent
                    and not water_intent
                    and not route_intent
                    and not fire_safety_intent
                    and not first_aid_intent
                    and not lnt_intent
                    and not avalanche_intent
                ):
                    formatted_permits = format_permits_response(permits_intent)
                    yield f"data: {json.dumps({'event': 'permits_info', 'permits_info': formatted_permits.get('permits_info')})}\n\n"
                if repair_intent:
                    formatted_repair = format_repair_response(repair_intent)
                    yield f"data: {json.dumps({'event': 'repair_info', 'repair_info': formatted_repair.get('repair_info')})}\n\n"
                if adventure_intent:
                    formatted_adventure = format_adventure_response(adventure_intent)
                    yield f"data: {json.dumps({'event': 'adventures_info', 'adventures_info': formatted_adventure.get('adventures_info')})}\n\n"
                if field_reports_intent and not avalanche_intent:
                    formatted_field_reports = format_field_reports_response(field_reports_intent)
                    yield f"data: {json.dumps({'event': 'field_reports_info', 'field_reports_info': formatted_field_reports.get('field_reports_info')})}\n\n"
                if trade_in_intent:
                    formatted_trade_in = format_trade_in_response(trade_in_intent)
                    yield f"data: {json.dumps({'event': 'trade_in_info', 'trade_in_info': formatted_trade_in.get('trade_in_info')})}\n\n"
                if trip_planner_intent:
                    formatted_trip = format_trip_planner_response(trip_planner_intent)
                    yield f"data: {json.dumps({'event': 'trip_planner_info', 'trip_planner_info': formatted_trip.get('trip_planner_info')})}\n\n"
                if safety_intent and not avalanche_intent:
                    formatted_safety = format_safety_response(safety_intent)
                    yield f"data: {json.dumps({'event': 'safety_info', 'safety_info': formatted_safety.get('safety_info')})}\n\n"
                if shuttle_intent:
                    formatted_shuttle = format_shuttle_response(shuttle_intent)
                    yield f"data: {json.dumps({'event': 'shuttle_info', 'shuttle_info': formatted_shuttle.get('shuttle_info')})}\n\n"
                if hut_intent:
                    formatted_hut = format_hut_response(hut_intent)
                    yield f"data: {json.dumps({'event': 'hut_info', 'hut_info': formatted_hut.get('hut_info')})}\n\n"
                if volunteer_intent:
                    formatted_vol = format_volunteer_response(volunteer_intent)
                    yield f"data: {json.dumps({'event': 'volunteer_info', 'volunteer_info': formatted_vol.get('volunteer_info')})}\n\n"
                if water_intent:
                    formatted_water = format_water_response(water_intent)
                    yield f"data: {json.dumps({'event': 'water_info', 'water_info': formatted_water.get('water_info')})}\n\n"
                if route_intent and not shuttle_intent:
                    formatted_route = format_route_response(route_intent)
                    yield f"data: {json.dumps({'event': 'route_info', 'route_info': formatted_route.get('route_info')})}\n\n"
                if fire_safety_intent:
                    formatted_fire = format_fire_safety_response(fire_safety_intent)
                    yield f"data: {json.dumps({'event': 'fire_safety_info', 'fire_safety_info': formatted_fire.get('fire_safety_info')})}\n\n"
                if first_aid_intent:
                    formatted_first_aid = format_first_aid_response(first_aid_intent)
                    yield f"data: {json.dumps({'event': 'first_aid_info', 'first_aid_info': formatted_first_aid.get('first_aid_info')})}\n\n"
                if lnt_intent:
                    formatted_lnt = format_lnt_response(lnt_intent)
                    yield f"data: {json.dumps({'event': 'lnt_info', 'lnt_info': formatted_lnt.get('lnt_info')})}\n\n"
                if avalanche_intent:
                    formatted_avy = format_avalanche_response(avalanche_intent)
                    yield f"data: {json.dumps({'event': 'avalanche_info', 'avalanche_info': formatted_avy.get('avalanche_info')})}\n\n"
                if weather_intent:
                    formatted_weather = format_weather_response(weather_intent)
                    yield f"data: {json.dumps({'event': 'weather_info', 'weather_info': formatted_weather.get('weather_info')})}\n\n"
                if ski_tour_intent:
                    formatted_tour = format_ski_tour_response(ski_tour_intent)
                    yield f"data: {json.dumps({'event': 'ski_tour_info', 'ski_tour_info': formatted_tour.get('ski_tour_info')})}\n\n"
                if whitewater_intent:
                    formatted_ww = format_whitewater_response(whitewater_intent)
                    yield f"data: {json.dumps({'event': 'whitewater_info', 'whitewater_info': formatted_ww.get('whitewater_info')})}\n\n"
                if climbing_intent and not adventure_intent:
                    formatted_climbing = format_climbing_response(climbing_intent)
                    yield f"data: {json.dumps({'event': 'climbing_info', 'climbing_info': formatted_climbing.get('climbing_info')})}\n\n"
                if foraging_intent:
                    formatted_foraging = format_foraging_response(foraging_intent)
                    yield f"data: {json.dumps({'event': 'foraging_info', 'foraging_info': formatted_foraging.get('foraging_info')})}\n\n"
                if stargazing_intent:
                    formatted_stargazing = format_stargazing_response(stargazing_intent)
                    yield f"data: {json.dumps({'event': 'stargazing_info', 'stargazing_info': formatted_stargazing.get('stargazing_info')})}\n\n"
                if wildlife_intent:
                    formatted_wildlife = format_wildlife_response(wildlife_intent)
                    yield f"data: {json.dumps({'event': 'wildlife_info', 'wildlife_info': formatted_wildlife.get('wildlife_info')})}\n\n"
                if trail_running_intent:
                    formatted_trail_running = format_trail_running_response(trail_running_intent)
                    yield f"data: {json.dumps({'event': 'trail_running_info', 'trail_running_info': formatted_trail_running.get('trail_running_info')})}\n\n"
                if fly_fishing_intent:
                    formatted_fly_fishing = format_fly_fishing_response(fly_fishing_intent)
                    yield f"data: {json.dumps({'event': 'fly_fishing_info', 'fly_fishing_info': formatted_fly_fishing.get('fly_fishing_info')})}\n\n"
                if hot_springs_intent:
                    formatted_hot_springs = format_hot_spring_response(hot_springs_intent)
                    yield f"data: {json.dumps({'event': 'hot_springs_info', 'hot_springs_info': formatted_hot_springs.get('hot_springs_info')})}\n\n"
                if bikepacking_intent:
                    formatted_bikepacking = format_bikepacking_response(bikepacking_intent)
                    yield f"data: {json.dumps({'event': 'bikepacking_info', 'bikepacking_info': formatted_bikepacking.get('bikepacking_info')})}\n\n"
                if mountaineering_intent and not adventure_intent:
                    formatted_mountaineering = format_mountaineering_response(mountaineering_intent)
                    yield f"data: {json.dumps({'event': 'mountaineering_info', 'mountaineering_info': formatted_mountaineering.get('mountaineering_info')})}\n\n"
                if sea_kayaking_intent:
                    formatted_sea_kayaking = format_sea_kayaking_response(sea_kayaking_intent)
                    yield f"data: {json.dumps({'event': 'sea_kayaking_info', 'sea_kayaking_info': formatted_sea_kayaking.get('sea_kayaking_info')})}\n\n"
                if packrafting_intent:
                    formatted_packrafting = format_packrafting_response(packrafting_intent)
                    yield f"data: {json.dumps({'event': 'packrafting_info', 'packrafting_info': formatted_packrafting.get('packrafting_info')})}\n\n"
                if canyoneering_intent:
                    formatted_canyoneering = format_canyoneering_response(canyoneering_intent)
                    yield f"data: {json.dumps({'event': 'canyoneering_info', 'canyoneering_info': formatted_canyoneering.get('canyoneering_info')})}\n\n"
                if acclimatization_intent:
                    formatted_acclimatization = format_acclimatization_response(
                        acclimatization_intent
                    )
                    yield f"data: {json.dumps({'event': 'acclimatization_info', 'acclimatization_info': formatted_acclimatization.get('acclimatization_info')})}\n\n"
                if nordic_skiing_intent:
                    formatted_nordic = format_nordic_skiing_response(nordic_skiing_intent)
                    yield f"data: {json.dumps({'event': 'nordic_skiing_info', 'nordic_skiing_info': formatted_nordic.get('nordic_skiing_info')})}\n\n"
                if via_ferrata_intent:
                    formatted_via_ferrata = format_via_ferrata_response(via_ferrata_intent)
                    yield f"data: {json.dumps({'event': 'via_ferrata_info', 'via_ferrata_info': formatted_via_ferrata.get('via_ferrata_info')})}\n\n"
                if ice_climbing_intent:
                    formatted_ice_climbing = format_ice_climbing_response(ice_climbing_intent)
                    yield f"data: {json.dumps({'event': 'ice_climbing_info', 'ice_climbing_info': formatted_ice_climbing.get('ice_climbing_info')})}\n\n"
                if bushcraft_intent:
                    formatted_bushcraft = format_bushcraft_response(bushcraft_intent)
                    yield f"data: {json.dumps({'event': 'bushcraft_info', 'bushcraft_info': formatted_bushcraft.get('bushcraft_info')})}\n\n"
                if caving_intent:
                    formatted_caving = format_caving_response(caving_intent)
                    yield f"data: {json.dumps({'event': 'caving_info', 'caving_info': formatted_caving.get('caving_info')})}\n\n"
                if desert_trekking_intent:
                    formatted_desert = format_desert_trekking_response(desert_trekking_intent)
                    yield f"data: {json.dumps({'event': 'desert_trekking_info', 'desert_trekking_info': formatted_desert.get('desert_trekking_info')})}\n\n"
                if coasteering_intent:
                    formatted_coasteering = format_coasteering_response(coasteering_intent)
                    yield f"data: {json.dumps({'event': 'coasteering_info', 'coasteering_info': formatted_coasteering.get('coasteering_info')})}\n\n"
                if orienteering_intent:
                    formatted_orienteering = format_orienteering_response(orienteering_intent)
                    o_payload = formatted_orienteering.get("orienteering_info")
                    action_to_event = {
                        "courses_list": "orienteering_courses",
                        "course_detail": "orienteering_detail",
                        "calculate_leg": "orienteering_leg",
                        "gear_checklist": "orienteering_gear",
                    }
                    event_name = action_to_event.get(
                        orienteering_intent.action, "orienteering_info"
                    )
                    yield f"data: {json.dumps({'event': event_name, 'orienteering_info': o_payload, event_name: o_payload})}\n\n"
                    if event_name != "orienteering_info":
                        yield f"data: {json.dumps({'event': 'orienteering_info', 'orienteering_info': o_payload})}\n\n"
                if highline_intent:
                    formatted_highline = format_highline_response(highline_intent)
                    h_payload = formatted_highline.get("highline_info")
                    action_to_event = {
                        "spans_list": "highline_spans",
                        "span_detail": "highline_detail",
                        "calculate_rigging": "highline_rigging",
                        "gear_checklist": "highline_gear",
                    }
                    event_name = action_to_event.get(highline_intent.action, "highline_info")
                    yield f"data: {json.dumps({'event': event_name, 'highline_info': h_payload, event_name: h_payload})}\n\n"
                    if event_name != "highline_info":
                        yield f"data: {json.dumps({'event': 'highline_info', 'highline_info': h_payload})}\n\n"
                if dogsled_intent:
                    formatted_dogsled = format_dogsled_response(dogsled_intent)
                    d_payload = formatted_dogsled.get("dogsled_info")
                    action_to_event = {
                        "routes_list": "dogsled_routes",
                        "route_detail": "dogsled_detail",
                        "calculate_pacing": "dogsled_pacing",
                        "gear_checklist": "dogsled_gear",
                    }
                    event_name = action_to_event.get(dogsled_intent.action, "dogsled_info")
                    yield f"data: {json.dumps({'event': event_name, 'dogsled_info': d_payload, event_name: d_payload})}\n\n"
                    if event_name != "dogsled_info":
                        yield f"data: {json.dumps({'event': 'dogsled_info', 'dogsled_info': d_payload})}\n\n"

                if canoe_intent:
                    formatted_canoe = format_canoe_response(canoe_intent)
                    c_payload = formatted_canoe.get("canoe_info")
                    action_to_event = {
                        "routes_list": "canoe_routes",
                        "route_detail": "canoe_detail",
                        "calculate_trim": "canoe_trim",
                        "gear_checklist": "canoe_gear",
                    }
                    event_name = action_to_event.get(canoe_intent.action, "canoe_info")
                    yield f"data: {json.dumps({'event': event_name, 'canoe_info': c_payload, event_name: c_payload})}\n\n"
                    if event_name != "canoe_info":
                        yield f"data: {json.dumps({'event': 'canoe_info', 'canoe_info': c_payload})}\n\n"

                if shelter_intent:
                    formatted_shelter = format_shelter_response(shelter_intent)
                    s_payload = formatted_shelter.get("shelter_info")
                    action_to_event = {
                        "shelters_list": "shelter_list",
                        "shelter_detail": "shelter_detail",
                        "calculate_thermodynamics": "shelter_thermo",
                        "gear_checklist": "shelter_gear",
                    }
                    event_name = action_to_event.get(shelter_intent.action, "shelter_info")
                    yield f"data: {json.dumps({'event': event_name, 'shelter_info': s_payload, event_name: s_payload})}\n\n"
                    if event_name != "shelter_info":
                        yield f"data: {json.dumps({'event': 'shelter_info', 'shelter_info': s_payload})}\n\n"

                if glacier_intent:
                    formatted_glacier = format_glacier_response(glacier_intent, request.question)
                    g_payload = formatted_glacier.get("glacier_info")
                    action_to_event = {
                        "zones_list": "glacier_zones",
                        "zone_detail": "glacier_zone_detail",
                        "calculate_navigation": "glacier_calculation",
                        "gear_checklist": "glacier_gear",
                    }
                    event_name = action_to_event.get(glacier_intent.action, "glacier_info")
                    yield f"data: {json.dumps({'event': event_name, 'glacier_info': g_payload, event_name: g_payload})}\n\n"
                    if event_name != "glacier_info":
                        yield f"data: {json.dumps({'event': 'glacier_info', 'glacier_info': g_payload})}\n\n"

                if river_sup_intent:
                    formatted_river_sup = format_river_sup_response(
                        river_sup_intent, request.question
                    )
                    r_payload = formatted_river_sup.get("river_sup_info")
                    action_to_event = {
                        "runs_list": "river_sup_runs",
                        "run_detail": "river_sup_run_detail",
                        "river_sup_calculation": "river_sup_calculation",
                        "gear_checklist": "river_sup_gear",
                    }
                    event_name = action_to_event.get(river_sup_intent.action, "river_sup_info")
                    yield f"data: {json.dumps({'event': event_name, 'river_sup_info': r_payload, event_name: r_payload})}\n\n"
                    if event_name != "river_sup_info":
                        yield f"data: {json.dumps({'event': 'river_sup_info', 'river_sup_info': r_payload})}\n\n"

                if wilderness_tracking_intent:
                    formatted_tracking = format_wilderness_tracking_response(
                        wilderness_tracking_intent, request.question
                    )
                    t_payload = formatted_tracking.get("tracking_info")
                    action_to_event = {
                        "species_list": "tracking_species",
                        "species_detail": "tracking_species_detail",
                        "calculate_track_aging": "tracking_calculation",
                        "gear_checklist": "tracking_gear",
                    }
                    event_name = action_to_event.get(
                        wilderness_tracking_intent.action, "tracking_info"
                    )
                    yield f"data: {json.dumps({'event': event_name, 'tracking_info': t_payload, event_name: t_payload})}\n\n"
                    if event_name != "tracking_info":
                        yield f"data: {json.dumps({'event': 'tracking_info', 'tracking_info': t_payload})}\n\n"
                if snowkiting_intent:
                    formatted_snowkiting = format_snowkiting_response(
                        snowkiting_intent, request.question
                    )
                    s_payload = formatted_snowkiting.get("snowkiting_info")
                    action_to_event = {
                        "spots_list": "snowkiting_spots",
                        "spot_detail": "snowkiting_spot_detail",
                        "calculate_snowkiting": "snowkiting_calculation",
                        "gear_checklist": "snowkiting_gear",
                    }
                    event_name = action_to_event.get(snowkiting_intent.action, "snowkiting_info")
                    yield f"data: {json.dumps({'event': event_name, 'snowkiting_info': s_payload, event_name: s_payload})}\n\n"
                    if event_name != "snowkiting_info":
                        yield f"data: {json.dumps({'event': 'snowkiting_info', 'snowkiting_info': s_payload})}\n\n"
                if psicobloc_intent:
                    formatted_psicobloc = format_psicobloc_response(
                        psicobloc_intent, request.question
                    )
                    p_payload = formatted_psicobloc.get("psicobloc_info")
                    action_to_event = {
                        "crags_list": "psicobloc_crags",
                        "crag_detail": "psicobloc_crag_detail",
                        "calculate_psicobloc": "psicobloc_calculation",
                        "gear_checklist": "psicobloc_gear",
                    }
                    event_name = action_to_event.get(psicobloc_intent.action, "psicobloc_info")
                    yield f"data: {json.dumps({'event': event_name, 'psicobloc_info': p_payload, event_name: p_payload})}\n\n"
                    if event_name != "psicobloc_info":
                        yield f"data: {json.dumps({'event': 'psicobloc_info', 'psicobloc_info': p_payload})}\n\n"
                if big_wall_intent:
                    formatted_big_wall = format_big_wall_response(big_wall_intent, request.question)
                    b_payload = formatted_big_wall.get("big_wall_info")
                    action_to_event = {
                        "routes_list": "big_wall_routes",
                        "route_detail": "big_wall_route_detail",
                        "calculate_haul": "big_wall_calculation",
                        "gear_checklist": "big_wall_gear",
                    }
                    event_name = action_to_event.get(big_wall_intent.action, "big_wall_info")
                    yield f"data: {json.dumps({'event': event_name, 'big_wall_info': b_payload, event_name: b_payload})}\n\n"
                    if event_name != "big_wall_info":
                        yield f"data: {json.dumps({'event': 'big_wall_info', 'big_wall_info': b_payload})}\n\n"

                if snowmobiling_intent:
                    formatted_snowmobiling = format_snowmobiling_response(
                        snowmobiling_intent, request.question
                    )
                    s_payload = formatted_snowmobiling.get("snowmobiling_info")
                    action_to_event = {
                        "zones_list": "snowmobiling_zones",
                        "zone_detail": "snowmobiling_zone_detail",
                        "calculate_sled": "snowmobiling_calculation",
                        "gear_checklist": "snowmobiling_gear",
                    }
                    event_name = action_to_event.get(
                        snowmobiling_intent.action, "snowmobiling_info"
                    )
                    yield f"data: {json.dumps({'event': event_name, 'snowmobiling_info': s_payload, event_name: s_payload})}\n\n"
                    if event_name != "snowmobiling_info":
                        yield f"data: {json.dumps({'event': 'snowmobiling_info', 'snowmobiling_info': s_payload})}\n\n"
                if alpine_scuba_intent:
                    formatted_alpine_scuba = format_alpine_scuba_response(
                        alpine_scuba_intent, request.question
                    )
                    a_payload = formatted_alpine_scuba.get("alpine_scuba_info")
                    action_to_event = {
                        "sites_list": "alpine_scuba_sites",
                        "site_detail": "alpine_scuba_site_detail",
                        "calculate_scuba": "alpine_scuba_calculation",
                        "gear_checklist": "alpine_scuba_gear",
                    }
                    event_name = action_to_event.get(
                        alpine_scuba_intent.action, "alpine_scuba_info"
                    )
                    yield f"data: {json.dumps({'event': event_name, 'alpine_scuba_info': a_payload, event_name: a_payload})}\n\n"
                    if event_name != "alpine_scuba_info":
                        yield f"data: {json.dumps({'event': 'alpine_scuba_info', 'alpine_scuba_info': a_payload})}\n\n"
                if river_rafting_intent:
                    formatted_river_rafting = format_river_rafting_response(
                        river_rafting_intent, request.question
                    )
                    r_payload = formatted_river_rafting.get("river_rafting_info")
                    action_to_event = {
                        "expeditions_list": "river_rafting_expeditions",
                        "expedition_detail": "river_rafting_expedition_detail",
                        "calculate_raft": "river_rafting_calculation",
                        "gear_checklist": "river_rafting_gear",
                    }
                    event_name = action_to_event.get(
                        river_rafting_intent.action, "river_rafting_info"
                    )
                    yield f"data: {json.dumps({'event': event_name, 'river_rafting_info': r_payload, event_name: r_payload})}\n\n"
                    if event_name != "river_rafting_info":
                        yield f"data: {json.dumps({'event': 'river_rafting_info', 'river_rafting_info': r_payload})}\n\n"
                if steep_skiing_intent:
                    formatted_steep_skiing = format_steep_skiing_response(
                        steep_skiing_intent, request.question
                    )
                    s_payload = formatted_steep_skiing.get("steep_skiing_info")
                    action_to_event = {
                        "couloirs_list": "steep_skiing_couloirs",
                        "couloir_detail": "steep_skiing_couloir_detail",
                        "calculate_couloir": "steep_skiing_calculation",
                        "gear_checklist": "steep_skiing_gear",
                    }
                    event_name = action_to_event.get(
                        steep_skiing_intent.action, "steep_skiing_info"
                    )
                    yield f"data: {json.dumps({'event': event_name, 'steep_skiing_info': s_payload, event_name: s_payload})}\n\n"
                    if event_name != "steep_skiing_info":
                        yield f"data: {json.dumps({'event': 'steep_skiing_info', 'steep_skiing_info': s_payload})}\n\n"
                if primitive_trapping_intent:
                    formatted_primitive_trapping = format_primitive_trapping_response(
                        primitive_trapping_intent, request.question
                    )
                    trap_payload = formatted_primitive_trapping.get("primitive_trapping_info")
                    action_to_event = {
                        "mechanisms_list": "primitive_trapping_mechanisms",
                        "mechanism_detail": "primitive_trapping_mechanism_detail",
                        "calculate_trapping": "primitive_trapping_calculation",
                        "calculate": "primitive_trapping_calculation",
                        "gear_checklist": "primitive_trapping_gear",
                        "safety_gear": "primitive_trapping_gear",
                    }
                    event_name = action_to_event.get(
                        primitive_trapping_intent.action, "primitive_trapping_info"
                    )
                    yield f"data: {json.dumps({'event': event_name, 'primitive_trapping_info': trap_payload, event_name: trap_payload})}\n\n"
                    if event_name != "primitive_trapping_info":
                        yield f"data: {json.dumps({'event': 'primitive_trapping_info', 'primitive_trapping_info': trap_payload})}\n\n"
                if trail_packing_intent:
                    formatted_trail_packing = format_trail_packing_response(
                        trail_packing_intent, request.question
                    )
                    tp_payload = formatted_trail_packing.get("trail_packing_info")
                    action_to_event = {
                        "routes_list": "trail_packing_routes",
                        "route_detail": "trail_packing_route_detail",
                        "calculate_packing": "trail_packing_calculation",
                        "calculate": "trail_packing_calculation",
                        "gear_checklist": "trail_packing_gear",
                        "tack_checklist": "trail_packing_gear",
                    }
                    event_name = action_to_event.get(
                        trail_packing_intent.action, "trail_packing_info"
                    )
                    yield f"data: {json.dumps({'event': event_name, 'trail_packing_info': tp_payload, event_name: tp_payload})}\n\n"
                    if event_name != "trail_packing_info":
                        yield f"data: {json.dumps({'event': 'trail_packing_info', 'trail_packing_info': tp_payload})}\n\n"
                if mountain_weather_intent:
                    formatted_mountain_weather = format_mountain_weather_response(
                        mountain_weather_intent, request.question
                    )
                    mw_payload = formatted_mountain_weather.get("mountain_weather_info")
                    action_to_event = {
                        "sectors_list": "mountain_weather_sectors",
                        "sectors": "mountain_weather_sectors",
                        "sector_detail": "mountain_weather_sector_detail",
                        "calculate_weather": "mountain_weather_calculation",
                        "calculate": "mountain_weather_calculation",
                        "gear_checklist": "mountain_weather_gear",
                        "gear": "mountain_weather_gear",
                    }
                    event_name = action_to_event.get(
                        mountain_weather_intent.action, "mountain_weather_info"
                    )
                    yield f"data: {json.dumps({'event': event_name, 'mountain_weather_info': mw_payload, event_name: mw_payload})}\n\n"
                    if event_name != "mountain_weather_info":
                        yield f"data: {json.dumps({'event': 'mountain_weather_info', 'mountain_weather_info': mw_payload})}\n\n"
                if wild_ice_intent:
                    formatted_wild_ice = format_wild_ice_response(
                        wild_ice_intent, request.question
                    )
                    wi_payload = formatted_wild_ice.get("wild_ice_info")
                    action_to_event = {
                        "venues_list": "wild_ice_venues",
                        "venues": "wild_ice_venues",
                        "venue_detail": "wild_ice_venue_detail",
                        "calculate_wild_ice": "wild_ice_calculation",
                        "calculate": "wild_ice_calculation",
                        "gear_checklist": "wild_ice_gear",
                        "gear": "wild_ice_gear",
                    }
                    event_name = action_to_event.get(
                        wild_ice_intent.action, "wild_ice_info"
                    )
                    wi_sse = json.dumps(
                        {
                            "event": event_name,
                            "wild_ice_info": wi_payload,
                            event_name: wi_payload,
                        }
                    )
                    yield f"data: {wi_sse}\n\n"
                    if event_name != "wild_ice_info":
                        wi_fallback = json.dumps(
                            {
                                "event": "wild_ice_info",
                                "wild_ice_info": wi_payload,
                            }
                        )
                        yield f"data: {wi_fallback}\n\n"
                if tree_climbing_intent:
                    formatted_tree_climbing = format_tree_climbing_response(
                        tree_climbing_intent, request.question
                    )
                    tc_payload = formatted_tree_climbing.get("tree_climbing_info")
                    action_to_event = {
                        "groves_list": "canopy_groves",
                        "groves": "canopy_groves",
                        "grove_detail": "canopy_grove_detail",
                        "calculate_tree_climbing": "tree_climbing_calculation",
                        "calculate": "tree_climbing_calculation",
                        "gear_checklist": "tree_climbing_gear",
                        "gear": "tree_climbing_gear",
                    }
                    event_name = action_to_event.get(
                        tree_climbing_intent.action, "tree_climbing_info"
                    )
                    tc_sse = json.dumps(
                        {
                            "event": event_name,
                            "tree_climbing_info": tc_payload,
                            event_name: tc_payload,
                        }
                    )
                    yield f"data: {tc_sse}\n\n"
                    if event_name != "tree_climbing_info":
                        tc_fallback = json.dumps(
                            {
                                "event": "tree_climbing_info",
                                "tree_climbing_info": tc_payload,
                            }
                        )
                        yield f"data: {tc_fallback}\n\n"
                if carrier_intent.get("is_carrier_intent"):
                    if captured_carrier_tracking:
                        mock_chunks = [
                            f"Mock response: Your package ({captured_carrier_tracking['tracking_number']}) ",
                            f"is currently {captured_carrier_tracking['status']} with {captured_carrier_tracking['carrier']}. ",
                            f"Current location: {captured_carrier_tracking['current_location']}. ",
                            f"Estimated delivery: {captured_carrier_tracking['estimated_delivery']}.",
                        ]
                    else:
                        mock_chunks = [
                            f"Mock response: Tracking information not found for identifier: {carrier_intent.get('extracted_identifier')}. ",
                            "Please check your tracking number and try again.",
                        ]
                elif tracking_intent.get("is_tracking_intent"):
                    mock_chunks = [
                        f"Mock response: Your order #{MOCK_ORDER_TRACKING['order_id']} ",
                        f"is currently {MOCK_ORDER_TRACKING['status']} with {MOCK_ORDER_TRACKING['carrier']}. ",
                        f"Tracking number: {MOCK_ORDER_TRACKING['tracking_number']}. ",
                        f"Estimated delivery: {MOCK_ORDER_TRACKING['estimated_delivery']}.",
                    ]
                elif rewards_intent:
                    rewards_loyalty = get_customer_loyalty(
                        rewards_intent.customer_id or request.customer_id
                    )
                    formatted_rewards = format_rewards_response(rewards_intent, rewards_loyalty)
                    mock_chunks = [str(formatted_rewards.get("answer", ""))]
                elif promo_intent.get("is_promo_intent"):
                    mock_chunks = [
                        "Mock response: We have great promotions available! ",
                        "Use code WELCOME20 for 20% off, OUTDOORS10 for 10% off, or TRAIL15 for 15% off. ",
                        "Apply them in your shopping cart drawer at checkout!",
                    ]
                elif policy_intent.get("is_policy_query") and policy_intent.get("matched_policy"):
                    p_obj = policy_intent["matched_policy"]
                    mock_chunks = [
                        f"Mock response: Regarding our {p_obj.get('title', 'policy')}: ",
                        f"{p_obj.get('details', p_obj.get('summary', ''))}",
                    ]
                elif store_intent.get("is_store_query") and store_intent.get("matched_stores"):
                    matched = store_intent["matched_stores"]
                    store_names = ", ".join(s.get("name", "Contoso Store") for s in matched)
                    if store_intent.get("intent_type") == "hours":
                        hours_details = "; ".join(
                            f"{s.get('name')}: {s.get('hours', {}).get('summary', s.get('hours', {}).get('weekday', ''))}"
                            for s in matched
                        )
                        mock_chunks = [
                            f"Mock response: Here are the store hours for {store_names}: ",
                            f"{hours_details}.",
                        ]
                    elif store_intent.get("intent_type") == "pickup":
                        mock_chunks = [
                            f"Mock response: Yes! In-store pickup is available at {store_names}. ",
                            f"Available services include: {', '.join(matched[0].get('services', []))}.",
                        ]
                    else:
                        mock_chunks = [
                            f"Mock response: Contoso Outdoors retail store: {store_names} ",
                            f"located at {matched[0].get('address')}.",
                        ]
                elif faq_result and faq_result.matches:
                    f_obj = faq_result.matches[0]
                    mock_chunks = [
                        f"Mock response: Regarding {f_obj.question}: ",
                        f"{f_obj.answer}",
                    ]
                elif sizing_info.get("is_sizing_intent") and sizing_info.get("size_guide"):
                    guide = sizing_info["size_guide"]
                    rec = sizing_info.get("recommendation")
                    if rec:
                        mock_chunks = [
                            f"Mock response: For {guide.title}, we recommend size {rec.recommended_size}. ",
                            f"{rec.advice}",
                        ]
                    else:
                        mock_chunks = [
                            f"Mock response: Here is our sizing guide for {guide.title}. ",
                            f"{guide.measurement_instructions}",
                        ]
                elif review_info.get("is_review_intent") and review_info.get("summary"):
                    summary = review_info["summary"]
                    mock_chunks = [
                        f"Mock response: Customer review summary for {summary.product_name}: ",
                        f"Rated {summary.average_rating}/5 stars across {summary.total_reviews} reviews ({summary.recommendation_percentage}% recommend). ",
                        f"Top pros include {', '.join(summary.pros)}. ",
                        f"Cons noted: {', '.join(summary.cons)}.",
                    ]
                elif rental_intent:
                    formatted_rental = format_rental_response(rental_intent)
                    mock_chunks = [str(formatted_rental.get("answer", ""))]
                elif ski_tour_intent:
                    formatted_tour = format_ski_tour_response(ski_tour_intent)
                    mock_chunks = [str(formatted_tour.get("answer", ""))]
                elif climbing_intent and not adventure_intent:
                    formatted_climbing = format_climbing_response(climbing_intent)
                    mock_chunks = [str(formatted_climbing.get("answer", ""))]
                elif foraging_intent:
                    formatted_foraging = format_foraging_response(foraging_intent)
                    mock_chunks = [str(formatted_foraging.get("answer", ""))]
                elif stargazing_intent:
                    formatted_stargazing = format_stargazing_response(stargazing_intent)
                    mock_chunks = [str(formatted_stargazing.get("answer", ""))]
                elif wildlife_intent:
                    formatted_wildlife = format_wildlife_response(wildlife_intent)
                    mock_chunks = [str(formatted_wildlife.get("answer", ""))]
                elif trail_running_intent:
                    formatted_trail_running = format_trail_running_response(trail_running_intent)
                    mock_chunks = [str(formatted_trail_running.get("answer", ""))]
                elif fly_fishing_intent:
                    formatted_fly_fishing = format_fly_fishing_response(fly_fishing_intent)
                    mock_chunks = [str(formatted_fly_fishing.get("answer", ""))]
                elif hot_springs_intent:
                    formatted_hot_springs = format_hot_spring_response(hot_springs_intent)
                    mock_chunks = [str(formatted_hot_springs.get("answer", ""))]
                elif bikepacking_intent:
                    formatted_bikepacking = format_bikepacking_response(bikepacking_intent)
                    mock_chunks = [str(formatted_bikepacking.get("answer", ""))]
                elif glacier_intent:
                    formatted_glacier = format_glacier_response(glacier_intent, request.question)
                    mock_chunks = [str(formatted_glacier.get("answer", ""))]
                elif river_sup_intent:
                    formatted_river_sup = format_river_sup_response(
                        river_sup_intent, request.question
                    )
                    mock_chunks = [str(formatted_river_sup.get("answer", ""))]
                elif wilderness_tracking_intent:
                    formatted_tracking = format_wilderness_tracking_response(
                        wilderness_tracking_intent, request.question
                    )
                    mock_chunks = [str(formatted_tracking.get("answer", ""))]
                elif snowkiting_intent:
                    formatted_snowkiting = format_snowkiting_response(
                        snowkiting_intent, request.question
                    )
                    mock_chunks = [str(formatted_snowkiting.get("answer", ""))]
                elif psicobloc_intent:
                    formatted_psicobloc = format_psicobloc_response(
                        psicobloc_intent, request.question
                    )
                    mock_chunks = [str(formatted_psicobloc.get("answer", ""))]
                elif big_wall_intent:
                    formatted_big_wall = format_big_wall_response(big_wall_intent, request.question)
                    mock_chunks = [str(formatted_big_wall.get("answer", ""))]
                elif snowmobiling_intent:
                    formatted_snowmobiling = format_snowmobiling_response(
                        snowmobiling_intent, request.question
                    )
                    mock_chunks = [str(formatted_snowmobiling.get("answer", ""))]
                elif alpine_scuba_intent:
                    formatted_alpine_scuba = format_alpine_scuba_response(
                        alpine_scuba_intent, request.question
                    )
                    mock_chunks = [str(formatted_alpine_scuba.get("answer", ""))]
                elif river_rafting_intent:
                    formatted_river_rafting = format_river_rafting_response(
                        river_rafting_intent, request.question
                    )
                    mock_chunks = [str(formatted_river_rafting.get("answer", ""))]
                elif steep_skiing_intent:
                    formatted_steep_skiing = format_steep_skiing_response(
                        steep_skiing_intent, request.question
                    )
                    mock_chunks = [str(formatted_steep_skiing.get("answer", ""))]
                elif primitive_trapping_intent:
                    formatted_primitive_trapping = format_primitive_trapping_response(
                        primitive_trapping_intent, request.question
                    )
                    mock_chunks = [str(formatted_primitive_trapping.get("answer", ""))]
                elif trail_packing_intent:
                    formatted_trail_packing = format_trail_packing_response(
                        trail_packing_intent, request.question
                    )
                    mock_chunks = [str(formatted_trail_packing.get("answer", ""))]
                elif mountain_weather_intent:
                    formatted_mountain_weather = format_mountain_weather_response(
                        mountain_weather_intent, request.question
                    )
                    mock_chunks = [str(formatted_mountain_weather.get("answer", ""))]
                elif wild_ice_intent:
                    formatted_wild_ice = format_wild_ice_response(
                        wild_ice_intent, request.question
                    )
                    mock_chunks = [str(formatted_wild_ice.get("answer", ""))]
                elif tree_climbing_intent:
                    formatted_tree_climbing = format_tree_climbing_response(
                        tree_climbing_intent, request.question
                    )
                    mock_chunks = [str(formatted_tree_climbing.get("answer", ""))]

                elif mountaineering_intent and not adventure_intent:
                    formatted_mountaineering = format_mountaineering_response(mountaineering_intent)
                    mock_chunks = [str(formatted_mountaineering.get("answer", ""))]
                elif sea_kayaking_intent:
                    formatted_sea_kayaking = format_sea_kayaking_response(sea_kayaking_intent)
                    mock_chunks = [str(formatted_sea_kayaking.get("answer", ""))]
                elif packrafting_intent:
                    formatted_packrafting = format_packrafting_response(packrafting_intent)
                    mock_chunks = [str(formatted_packrafting.get("answer", ""))]
                elif canyoneering_intent:
                    formatted_canyoneering = format_canyoneering_response(canyoneering_intent)
                    mock_chunks = [str(formatted_canyoneering.get("answer", ""))]
                elif acclimatization_intent:
                    formatted_acclimatization = format_acclimatization_response(
                        acclimatization_intent
                    )
                    mock_chunks = [str(formatted_acclimatization.get("answer", ""))]
                elif nordic_skiing_intent:
                    formatted_nordic = format_nordic_skiing_response(nordic_skiing_intent)
                    mock_chunks = [str(formatted_nordic.get("answer", ""))]
                elif via_ferrata_intent:
                    formatted_via_ferrata = format_via_ferrata_response(via_ferrata_intent)
                    mock_chunks = [str(formatted_via_ferrata.get("answer", ""))]
                elif ice_climbing_intent:
                    formatted_ice_climbing = format_ice_climbing_response(ice_climbing_intent)
                    mock_chunks = [str(formatted_ice_climbing.get("answer", ""))]
                elif bushcraft_intent:
                    formatted_bushcraft = format_bushcraft_response(bushcraft_intent)
                    mock_chunks = [str(formatted_bushcraft.get("answer", ""))]
                elif caving_intent:
                    formatted_caving = format_caving_response(caving_intent)
                    mock_chunks = [str(formatted_caving.get("answer", ""))]
                elif desert_trekking_intent:
                    formatted_desert = format_desert_trekking_response(desert_trekking_intent)
                    mock_chunks = [str(formatted_desert.get("answer", ""))]
                elif coasteering_intent:
                    formatted_coasteering = format_coasteering_response(coasteering_intent)
                    mock_chunks = [str(formatted_coasteering.get("answer", ""))]
                elif orienteering_intent:
                    formatted_orienteering = format_orienteering_response(orienteering_intent)
                    mock_chunks = [str(formatted_orienteering.get("answer", ""))]
                elif highline_intent:
                    formatted_highline = format_highline_response(highline_intent)
                    mock_chunks = [str(formatted_highline.get("answer", ""))]
                elif dogsled_intent:
                    formatted_dogsled = format_dogsled_response(dogsled_intent)
                    mock_chunks = [str(formatted_dogsled.get("answer", ""))]
                elif canoe_intent:
                    formatted_canoe = format_canoe_response(canoe_intent)
                    mock_chunks = [str(formatted_canoe.get("answer", ""))]
                elif shelter_intent:
                    formatted_shelter = format_shelter_response(shelter_intent)
                    mock_chunks = [str(formatted_shelter.get("answer", ""))]

                elif weather_intent and not (
                    trail_intent
                    or adventure_intent
                    or shuttle_intent
                    or permits_intent
                    or safety_intent
                ):
                    formatted_weather = format_weather_response(weather_intent)
                    mock_chunks = [str(formatted_weather.get("answer", ""))]
                elif avalanche_intent:
                    formatted_avy = format_avalanche_response(avalanche_intent)
                    mock_chunks = [str(formatted_avy.get("answer", ""))]
                elif field_reports_intent:
                    formatted_field_reports = format_field_reports_response(field_reports_intent)
                    mock_chunks = [str(formatted_field_reports.get("answer", ""))]
                elif route_intent and not shuttle_intent:
                    formatted_route = format_route_response(route_intent)
                    mock_chunks = [str(formatted_route.get("answer", ""))]
                elif fire_safety_intent:
                    formatted_fire = format_fire_safety_response(fire_safety_intent)
                    mock_chunks = [str(formatted_fire.get("answer", ""))]
                elif first_aid_intent:
                    formatted_first_aid = format_first_aid_response(first_aid_intent)
                    mock_chunks = [str(formatted_first_aid.get("answer", ""))]
                elif lnt_intent:
                    formatted_lnt = format_lnt_response(lnt_intent)
                    mock_chunks = [str(formatted_lnt.get("answer", ""))]
                elif trail_intent:
                    formatted_trail = format_trail_response(trail_intent)
                    mock_chunks = [str(formatted_trail.get("answer", ""))]
                elif adventure_intent:
                    formatted_adventure = format_adventure_response(adventure_intent)
                    mock_chunks = [str(formatted_adventure.get("answer", ""))]
                elif (
                    permits_intent
                    and not shuttle_intent
                    and not hut_intent
                    and not volunteer_intent
                    and not water_intent
                    and not route_intent
                    and not fire_safety_intent
                    and not first_aid_intent
                    and not lnt_intent
                    and not avalanche_intent
                ):
                    formatted_permits = format_permits_response(permits_intent)
                    mock_chunks = [str(formatted_permits.get("answer", ""))]
                elif repair_intent:
                    formatted_repair = format_repair_response(repair_intent)
                    mock_chunks = [str(formatted_repair.get("answer", ""))]
                elif trade_in_intent:
                    formatted_trade_in = format_trade_in_response(trade_in_intent)
                    mock_chunks = [str(formatted_trade_in.get("answer", ""))]
                elif trip_planner_intent:
                    formatted_trip = format_trip_planner_response(trip_planner_intent)
                    mock_chunks = [str(formatted_trip.get("answer", ""))]
                elif safety_intent:
                    formatted_safety = format_safety_response(safety_intent)
                    mock_chunks = [str(formatted_safety.get("answer", ""))]
                elif shuttle_intent:
                    formatted_shuttle = format_shuttle_response(shuttle_intent)
                    mock_chunks = [str(formatted_shuttle.get("answer", ""))]
                elif hut_intent:
                    formatted_hut = format_hut_response(hut_intent)
                    mock_chunks = [str(formatted_hut.get("answer", ""))]
                elif volunteer_intent:
                    formatted_vol = format_volunteer_response(volunteer_intent)
                    mock_chunks = [str(formatted_vol.get("answer", ""))]
                elif water_intent:
                    formatted_water = format_water_response(water_intent)
                    mock_chunks = [str(formatted_water.get("answer", ""))]
                else:
                    mock_chunks = [
                        f"Mock response: You asked about '{request.question}'. ",
                        "This is a test response from Contoso Chat ",
                        "running on Google Cloud Platform!",
                    ]
                for chunk in mock_chunks:
                    accumulated_chunks.append(chunk)
                    yield f"data: {json.dumps({'chunk': chunk})}\n\n"

            if request.session_id:
                final_content = "".join(accumulated_chunks)
                append_message(
                    session_id=request.session_id,
                    role="assistant",
                    content=final_content,
                    citations=captured_citations,
                    order_tracking=captured_order_tracking,
                )

            yield "data: [DONE]\n\n"
        except Exception as e:
            logger.error(
                "Error processing streaming chat request",
                extra={
                    "customer_id": request.customer_id,
                    "error": str(e),
                    "error_type": type(e).__name__,
                },
                exc_info=True,
            )
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(streamer(), media_type="text/event-stream")


@app.get("/api/sessions", response_model=list[ChatSession])
async def get_sessions(customer_id: Optional[str] = None) -> list[ChatSession]:
    return list_sessions(customer_id=customer_id)


@app.get("/api/sessions/{session_id}", response_model=ChatSession)
async def get_session_by_id(session_id: str) -> ChatSession:
    session = get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@app.delete("/api/sessions/{session_id}")
async def delete_session_by_id(session_id: str) -> dict[str, str]:
    deleted = delete_session(session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"status": "deleted", "session_id": session_id}


@app.get("/api/sessions/{session_id}/export")
async def export_session_by_id(
    session_id: str,
    format: str = "markdown",
    include_citations: bool = True,
    include_timestamps: bool = True,
) -> Response:
    try:
        result = export_transcript(
            session_id=session_id,
            format=format,
            include_citations=include_citations,
            include_timestamps=include_timestamps,
        )
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))

    return Response(
        content=result["content"],
        media_type=result["media_type"],
        headers={"Content-Disposition": f'attachment; filename="{result["filename"]}"'},
    )


@app.post("/api/chat/export")
async def export_chat(
    request: ChatExportRequest,
    download: bool = False,
) -> Any:
    try:
        result = export_transcript(
            session_id=request.session_id,
            messages=request.messages,
            format=request.format,
            title=request.title,
            include_citations=request.include_citations,
            include_timestamps=request.include_timestamps,
        )
    except ValueError as e:
        if "not found" in str(e).lower():
            raise HTTPException(status_code=404, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))

    if download:
        return Response(
            content=result["content"],
            media_type=result["media_type"],
            headers={"Content-Disposition": f'attachment; filename="{result["filename"]}"'},
        )
    return result


@app.post("/api/feedback", response_model=FeedbackResponse, status_code=201)
async def submit_feedback(request: FeedbackRequest) -> FeedbackResponse:
    return record_feedback(request)


@app.get("/api/feedback/summary")
async def feedback_summary() -> dict[str, Any]:
    return get_feedback_summary()


@app.get("/api/promotions")
async def get_promotions() -> list[dict[str, Any]]:
    logger.info("Promotions endpoint accessed")
    return get_active_promotions()


@app.post("/api/promotions/validate")
async def validate_promotion(request: PromoValidateRequest) -> dict[str, Any]:
    logger.info("Promo validation requested", extra={"code": request.code})
    return validate_promo_code(request.code)


@app.get(
    "/api/reviews/{product_slug}/summary",
    response_model=ProductReviewSummary,
    responses={
        200: {"description": "Product review summary retrieved"},
        404: {"description": "Review summary not found"},
    },
)
async def get_review_summary_endpoint(product_slug: str) -> ProductReviewSummary:
    logger.info("Review summary requested", extra={"product_slug": product_slug})
    summary = get_review_summary(product_slug)
    if not summary:
        raise HTTPException(
            status_code=404,
            detail=f"Review summary not found for product: {product_slug}",
        )
    return summary


@app.get(
    "/api/sizing/{category}",
    response_model=CategorySizeGuide,
    responses={
        200: {"description": "Category sizing guide retrieved"},
        404: {"description": "Sizing guide not found"},
    },
)
async def get_sizing_guide_endpoint(category: str) -> CategorySizeGuide:
    logger.info("Sizing guide requested", extra={"category": category})
    guide = get_size_guide(category)
    if not guide:
        raise HTTPException(
            status_code=404,
            detail=f"Sizing guide not found for category: {category}",
        )
    return guide


@app.get("/api/faq", response_model=list[FaqItem])
async def get_faq_catalog(
    query: Optional[str] = None,
    category: Optional[str] = None,
) -> list[FaqItem]:
    logger.info("FAQ catalog requested", extra={"query": query, "category": category})
    if query or category:
        return search_faqs(query=query or "", category=category)
    return get_all_faqs()


@app.get("/api/faq/{faq_id}", response_model=FaqItem)
async def get_faq_by_id_endpoint(faq_id: str) -> FaqItem:
    logger.info("FAQ detail requested", extra={"faq_id": faq_id})
    item = get_faq_by_id(faq_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"FAQ topic not found: {faq_id}")
    return item


@app.get("/api/policies")
async def get_policies() -> list[dict[str, Any]]:
    logger.info("Policies endpoint accessed")
    return get_store_policies()


@app.get("/api/policies/{policy_id}")
async def get_policy(policy_id: str) -> dict[str, Any]:
    logger.info("Policy detail requested", extra={"policy_id": policy_id})
    policy = get_policy_by_id(policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail=f"Policy '{policy_id}' not found")
    return policy


@app.post("/api/policies/inquire")
async def inquire_policy(request: PolicyInquiryRequest) -> dict[str, Any]:
    logger.info("Policy inquiry requested", extra={"query": request.query})
    match_result = detect_policy_intent(request.query)
    response = dict(match_result)
    if "policy" not in response and response.get("matched_policy"):
        response["policy"] = response["matched_policy"]
    return response


@app.get("/api/stores")
async def get_stores() -> list[dict[str, Any]]:
    logger.info("Stores catalog endpoint accessed")
    return get_all_stores()


@app.get("/api/stores/{store_id}")
async def get_store(store_id: str) -> dict[str, Any]:
    logger.info("Store detail requested", extra={"store_id": store_id})
    store = get_store_by_id(store_id)
    if not store:
        raise HTTPException(status_code=404, detail=f"Store '{store_id}' not found")
    return store


@app.post("/api/stores/search")
async def search_store_locations(request: StoreSearchRequest) -> list[dict[str, Any]]:
    logger.info(
        "Store search requested",
        extra={"query": request.query, "has_pickup": request.has_pickup},
    )
    return search_stores(request.query, has_pickup=request.has_pickup)


@app.get(
    "/api/tracking/{identifier}",
    response_model=CarrierTrackingInfo,
    responses={
        200: {"description": "Carrier tracking details retrieved"},
        404: {"description": "Tracking information not found"},
    },
)
async def get_tracking_info(identifier: str) -> CarrierTrackingInfo:
    logger.info("Carrier tracking detail requested", extra={"identifier": identifier})
    info = lookup_carrier_tracking(identifier)
    if not info:
        raise HTTPException(
            status_code=404,
            detail=f"Tracking information not found for identifier: {identifier}",
        )
    return info


@app.get("/api/rentals/packages", response_model=list[RentalPackage])
async def get_rental_packages_endpoint(
    category: Optional[str] = None,
) -> list[RentalPackage]:
    logger.info("Rental packages requested", extra={"category": category})
    return get_rental_packages(category=category)


@app.post(
    "/api/rentals/quote",
    response_model=RentalQuoteResponse,
    responses={
        200: {"description": "Rental quote calculated"},
        404: {"description": "Rental package not found"},
    },
)
async def post_rental_quote_endpoint(
    request: RentalQuoteRequest,
) -> RentalQuoteResponse:
    logger.info(
        "Rental quote requested",
        extra={
            "gear_type": request.gear_type,
            "days": request.days,
            "store_name": request.store_name,
        },
    )
    quote = calculate_rental_quote(
        gear_type=request.gear_type,
        days=request.days,
        store_name=request.store_name,
    )
    if not quote:
        raise HTTPException(
            status_code=404,
            detail=f"Rental package not found for gear type: {request.gear_type}",
        )
    return quote


@app.post(
    "/api/orders/{order_id}/return_label",
    response_model=ReturnLabelInfo,
    responses={
        200: {"description": "Return label generated"},
    },
)
async def create_order_return_label(
    order_id: str,
    request: Optional[ReturnLabelRequest] = None,
) -> ReturnLabelInfo:
    logger.info("Return label creation requested", extra={"order_id": order_id})
    reason = request.reason if request else None
    items = request.items if request else None
    return generate_return_label(order_id, reason=reason, items=items)


@app.get(
    "/api/orders/{order_id}/return_label",
    response_model=ReturnLabelInfo,
    responses={
        200: {"description": "Return label retrieved"},
    },
)
async def get_order_return_label(order_id: str) -> ReturnLabelInfo:
    logger.info("Return label retrieval requested", extra={"order_id": order_id})
    return generate_return_label(order_id)


@app.get("/api/trails", response_model=list[TrailCondition])
async def get_trails_endpoint(
    region: Optional[str] = None,
    difficulty: Optional[str] = None,
) -> list[TrailCondition]:
    logger.info("Trails catalog requested", extra={"region": region, "difficulty": difficulty})
    return get_trails(region=region, difficulty=difficulty)


@app.post(
    "/api/trails/outfitting",
    response_model=TrailOutfittingResponse,
    responses={
        200: {"description": "Trail outfitting plan and checklist generated"},
    },
)
async def post_trails_outfitting_endpoint(
    request: TrailOutfittingRequest,
) -> TrailOutfittingResponse:
    logger.info(
        "Trail outfitting requested",
        extra={
            "trail_name": request.trail_name,
            "activity": request.activity,
            "season": request.season,
        },
    )
    return generate_outfitting_plan(
        trail_name=request.trail_name,
        activity=request.activity,
        season=request.season,
    )


@app.get(
    "/api/loyalty/profile",
    response_model=CustomerLoyaltyInfo,
    responses={
        200: {"description": "Customer loyalty profile retrieved"},
    },
)
async def get_loyalty_profile_endpoint(
    customer_id: Optional[str] = None,
) -> CustomerLoyaltyInfo:
    logger.info("Loyalty profile requested", extra={"customer_id": customer_id})
    return get_customer_loyalty(customer_id=customer_id)


@app.get(
    "/api/loyalty/tiers",
    response_model=list[MemberTierInfo],
    responses={
        200: {"description": "Member tiers and perks retrieved"},
    },
)
async def get_loyalty_tiers_endpoint() -> list[MemberTierInfo]:
    logger.info("Loyalty tiers requested")
    return get_tier_perks()


@app.post(
    "/api/loyalty/redeem",
    response_model=LoyaltyRedemptionResponse,
    responses={
        200: {"description": "Loyalty voucher redemption processed"},
    },
)
async def post_loyalty_redeem_endpoint(
    request: LoyaltyRedemptionRequest,
) -> LoyaltyRedemptionResponse:
    logger.info(
        "Loyalty voucher redemption requested",
        extra={"voucher_id": request.voucher_id, "customer_id": request.customer_id},
    )
    return redeem_voucher(voucher_id=request.voucher_id, customer_id=request.customer_id)


@app.get(
    "/api/permits/passes",
    response_model=list[ParkPassInfo],
    responses={
        200: {"description": "National park and federal recreation pass catalog retrieved"},
    },
)
async def get_park_passes_endpoint(
    pass_type: Optional[str] = None,
) -> list[ParkPassInfo]:
    logger.info("Park passes catalog requested", extra={"pass_type": pass_type})
    return get_park_passes(pass_type=pass_type)


@app.get(
    "/api/permits/lotteries",
    response_model=list[PermitLotteryInfo],
    responses={
        200: {"description": "Backcountry permit lotteries and quotas retrieved"},
    },
)
async def get_permit_lotteries_endpoint(
    park_name: Optional[str] = None,
) -> list[PermitLotteryInfo]:
    logger.info("Permit lotteries requested", extra={"park_name": park_name})
    return get_permit_lotteries(park_name=park_name)


@app.get(
    "/api/permits/regulations",
    response_model=list[PermitRegulation],
    responses={
        200: {"description": "Wilderness backcountry regulations retrieved"},
    },
)
async def get_permit_regulations_endpoint(
    park_or_region: Optional[str] = None,
) -> list[PermitRegulation]:
    logger.info("Permit regulations requested", extra={"park_or_region": park_or_region})
    return get_permit_regulations(park_or_region=park_or_region)


@app.get(
    "/api/repair/services",
    response_model=list[RepairServiceItem],
    responses={
        200: {"description": "Gear repair and maintenance services retrieved"},
    },
)
async def get_repair_services_endpoint(
    category: Optional[str] = None,
) -> list[RepairServiceItem]:
    logger.info("Repair services requested", extra={"category": category})
    return get_repair_services(category=category)


@app.post(
    "/api/repair/diagnose",
    response_model=RepairDiagnosis,
    responses={
        200: {"description": "Gear repair diagnosis evaluated"},
    },
)
async def post_repair_diagnose_endpoint(
    request: RepairDiagnoseRequest,
) -> RepairDiagnosis:
    logger.info(
        "Repair diagnosis requested", extra={"issue": request.issue, "gear_type": request.gear_type}
    )
    return diagnose_repair_issue(issue=request.issue, gear_type=request.gear_type)


@app.get(
    "/api/adventures/tours",
    response_model=list[AdventureTourInfo],
    responses={
        200: {"description": "Adventure tours and clinics retrieved"},
    },
)
async def get_adventure_tours_endpoint(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
) -> list[AdventureTourInfo]:
    logger.info("Adventure tours requested", extra={"category": category, "difficulty": difficulty})
    return get_adventure_tours(category=category, difficulty=difficulty)


@app.get(
    "/api/adventures/guides",
    response_model=list[AdventureGuideInfo],
    responses={
        200: {"description": "Lead adventure guides retrieved"},
    },
)
async def get_adventure_guides_endpoint() -> list[AdventureGuideInfo]:
    logger.info("Adventure guides requested")
    return get_adventure_guides()


@app.get(
    "/api/reports/feed",
    response_model=list[FieldReportModel],
    responses={
        200: {"description": "Community trail field reports retrieved"},
    },
)
async def get_reports_feed_endpoint(
    trail_name: Optional[str] = None,
    condition: Optional[str] = None,
) -> list[FieldReportModel]:
    logger.info("Reports feed requested", extra={"trail_name": trail_name, "condition": condition})
    return get_field_reports(trail_name=trail_name, condition=condition)


@app.get(
    "/api/reports/alerts",
    response_model=list[HazardAlertModel],
    responses={
        200: {"description": "Active trail hazard alerts retrieved"},
    },
)
async def get_reports_alerts_endpoint(
    trail_name: Optional[str] = None,
) -> list[HazardAlertModel]:
    logger.info("Hazard alerts requested", extra={"trail_name": trail_name})
    return get_hazard_alerts(trail_name=trail_name)


@app.get(
    "/api/trade-in/brands",
    response_model=list[EligibleBrandModel],
    responses={
        200: {"description": "Eligible trade-in brands and accepted categories retrieved"},
    },
)
async def get_trade_in_brands_endpoint() -> list[EligibleBrandModel]:
    logger.info("Eligible trade-in brands requested")
    return get_eligible_brands()


@app.post(
    "/api/trade-in/estimate",
    response_model=TradeInEstimateModel,
    responses={
        200: {"description": "Trade-in estimate calculated"},
    },
)
async def post_trade_in_estimate_endpoint(
    request: TradeInEstimateRequest,
) -> TradeInEstimateModel:
    logger.info(
        "Trade-in estimate requested",
        extra={
            "category": request.category,
            "original_msrp": request.original_msrp,
            "condition": request.condition,
            "brand": request.brand,
        },
    )
    return estimate_trade_in_payout(
        category=request.category,
        original_msrp=request.original_msrp,
        condition=request.condition or "very_good",
        brand=request.brand,
    )


@app.get("/api/planner/templates", response_model=list[dict[str, Any]])
async def get_planner_templates_endpoint() -> list[dict[str, Any]]:
    logger.info("Trip planner templates requested")
    return get_trip_templates()


@app.post(
    "/api/planner/generate",
    response_model=TripPlanResultModel,
    responses={
        200: {"description": "Wilderness trip plan, nutrition, and packing checklist generated"},
    },
)
async def post_planner_generate_endpoint(
    params: TripPlanParametersModel,
) -> TripPlanResultModel:
    logger.info(
        "Wilderness trip plan generation requested",
        extra={
            "duration_days": params.duration_days,
            "group_size": params.group_size,
            "climate": params.climate,
        },
    )
    return generate_wilderness_trip_plan(params)


@app.post(
    "/api/safety/beacon/register",
    response_model=BeaconRegistrationResponse,
    responses={
        200: {"description": "Wilderness satellite safety beacon registered"},
    },
)
async def post_safety_beacon_register_endpoint(
    request: BeaconRegistrationRequest,
) -> BeaconRegistrationResponse:
    logger.info(
        "Safety beacon registration requested",
        extra={
            "device_type": request.device_type,
            "owner_name": request.owner_name,
            "trip_zone": request.trip_zone,
        },
    )
    return register_safety_beacon(request)


@app.post(
    "/api/safety/beacon/checkin",
    response_model=BeaconCheckinResponse,
    responses={
        200: {"description": "Safety beacon status check-in recorded"},
        404: {"description": "Beacon device not found in registry"},
    },
)
async def post_safety_beacon_checkin_endpoint(
    request: BeaconCheckinRequest,
) -> BeaconCheckinResponse:
    logger.info("Safety beacon check-in requested", extra={"device_id": request.device_id})
    try:
        return record_beacon_checkin(request)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.get(
    "/api/safety/protocols",
    response_model=list[EmergencyProtocol],
    responses={
        200: {"description": "Emergency backcountry first-response protocols retrieved"},
    },
)
async def get_safety_protocols_endpoint() -> list[EmergencyProtocol]:
    logger.info("Emergency protocols catalog requested")
    return list_emergency_protocols()


@app.get(
    "/api/safety/protocols/{incident_type}",
    response_model=EmergencyProtocol,
    responses={
        200: {"description": "Emergency protocol details retrieved"},
        404: {"description": "Emergency protocol not found"},
    },
)
async def get_safety_protocol_endpoint(
    incident_type: str,
) -> EmergencyProtocol:
    logger.info("Emergency protocol requested", extra={"incident_type": incident_type})
    protocol = get_emergency_protocol(incident_type)
    if not protocol:
        raise HTTPException(
            status_code=404,
            detail=f"Emergency protocol not found: {incident_type}",
        )
    return protocol


@app.get(
    "/api/safety/avalanche",
    response_model=list[AvalancheAdvisory],
    responses={
        200: {"description": "Regional avalanche advisories retrieved"},
    },
)
async def get_safety_avalanche_endpoint(
    zone: Optional[str] = None,
) -> list[AvalancheAdvisory]:
    logger.info("Regional avalanche advisory requested", extra={"zone": zone})
    if zone:
        advisory = get_avalanche_advisory(zone)
        return [advisory] if advisory else []
    return list_avalanche_advisories()


@app.get(
    "/api/shuttles/routes",
    response_model=list[ShuttleRouteModel],
    responses={
        200: {"description": "Trailhead shuttle routes retrieved"},
    },
)
async def get_shuttle_routes_endpoint(
    region: Optional[str] = None,
    connector_only: bool = False,
) -> list[ShuttleRouteModel]:
    logger.info(
        "Shuttle routes requested", extra={"region": region, "connector_only": connector_only}
    )
    return get_shuttle_routes(region=region, connector_only=connector_only)


@app.post(
    "/api/shuttles/quote",
    response_model=ShuttleQuoteResponse,
    responses={
        200: {"description": "Shuttle fare quote calculated"},
        404: {"description": "Shuttle route not found"},
    },
)
async def post_shuttle_quote_endpoint(
    request: ShuttleQuoteRequest,
) -> ShuttleQuoteResponse:
    logger.info(
        "Shuttle fare quote requested", extra={"route_id": request.route_id, "seats": request.seats}
    )
    target_route_id = request.route_id
    if not target_route_id and request.region:
        matching = get_shuttle_routes(region=request.region)
        if matching:
            target_route_id = matching[0].route_id
    if not target_route_id:
        raise HTTPException(status_code=404, detail="Route not specified or not found")
    quote = calculate_shuttle_quote(target_route_id, seats=request.seats)
    if not quote:
        raise HTTPException(status_code=404, detail=f"Route '{target_route_id}' not found")
    return quote


@app.post(
    "/api/shuttles/book",
    response_model=ShuttleBookingResponse,
    responses={
        200: {"description": "Shuttle seat reservation confirmed"},
        404: {"description": "Shuttle route not found"},
    },
)
async def post_shuttle_book_endpoint(
    request: ShuttleBookingRequest,
) -> ShuttleBookingResponse:
    logger.info(
        "Shuttle seat booking requested",
        extra={"route_id": request.route_id, "seats": request.seats},
    )
    try:
        return book_shuttle(request)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.get(
    "/api/shuttles/carpools",
    response_model=list[CarpoolOfferResponse],
    responses={
        200: {"description": "Community carpool offers retrieved"},
    },
)
async def get_shuttle_carpools_endpoint(
    destination: Optional[str] = None,
) -> list[CarpoolOfferResponse]:
    logger.info("Community carpool offers requested", extra={"destination": destination})
    return list_carpools(destination=destination)


@app.post(
    "/api/shuttles/carpools",
    response_model=CarpoolOfferResponse,
    responses={
        200: {"description": "Community carpool offer registered successfully"},
    },
)
async def post_shuttle_carpools_endpoint(
    request: CarpoolOfferRequest,
) -> CarpoolOfferResponse:
    logger.info(
        "New community carpool offer submitted",
        extra={"origin": request.origin_city, "dest": request.destination_trailhead},
    )
    return create_carpool_offer(request)


@app.get(
    "/api/huts",
    response_model=list[AlpineHutModel],
    tags=["Alpine Huts"],
    responses={
        200: {"description": "Alpine huts retrieved successfully"},
    },
)
async def get_alpine_huts_endpoint(
    range: Optional[str] = None,
    difficulty: Optional[str] = None,
) -> list[AlpineHutModel]:
    logger.info("Alpine huts requested", extra={"range": range, "difficulty": difficulty})
    return get_alpine_huts(range_name=range, difficulty=difficulty)


@app.get(
    "/api/huts/{hut_id}",
    response_model=AlpineHutModel,
    tags=["Alpine Huts"],
    responses={
        200: {"description": "Alpine hut details retrieved"},
        404: {"description": "Alpine hut not found"},
    },
)
async def get_alpine_hut_by_id_endpoint(hut_id: str) -> AlpineHutModel:
    logger.info("Alpine hut details requested", extra={"hut_id": hut_id})
    hut = get_alpine_hut_by_id(hut_id)
    if not hut:
        raise HTTPException(status_code=404, detail=f"Alpine hut '{hut_id}' not found")
    return hut


@app.post(
    "/api/huts/quote",
    response_model=HutAvailabilityResponse,
    tags=["Alpine Huts"],
    responses={
        200: {"description": "Alpine hut quote calculated"},
        404: {"description": "Alpine hut not found"},
    },
)
async def post_hut_quote_endpoint(
    request: HutAvailabilityRequest,
) -> HutAvailabilityResponse:
    logger.info(
        "Alpine hut quote requested",
        extra={"hut_id": request.hut_id, "range_name": request.range_name},
    )
    quote = calculate_hut_quote(request)
    if not quote:
        identifier = request.hut_id or request.range_name or "specified"
        raise HTTPException(status_code=404, detail=f"Alpine hut '{identifier}' not found")
    return quote


@app.post(
    "/api/huts/book",
    response_model=HutBookingResponse,
    tags=["Alpine Huts"],
    responses={
        200: {"description": "Alpine hut reservation confirmed"},
        404: {"description": "Alpine hut not found"},
    },
)
async def post_hut_book_endpoint(
    request: HutBookingRequest,
) -> HutBookingResponse:
    logger.info(
        "Alpine hut booking submitted",
        extra={"hut_id": request.hut_id, "guest_name": request.guest_name},
    )
    try:
        return book_alpine_hut(request)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/volunteer/projects",
    response_model=list[VolunteerWorkpartyModel],
    tags=["Trail Volunteer & Stewardship"],
    responses={
        200: {"description": "Volunteer workparties retrieved successfully"},
    },
)
async def get_volunteer_projects_endpoint(
    region: Optional[str] = None,
    difficulty: Optional[str] = None,
) -> list[VolunteerWorkpartyModel]:
    logger.info(
        "Volunteer workparties requested", extra={"region": region, "difficulty": difficulty}
    )
    return get_volunteer_projects(region=region, difficulty=difficulty)


@app.get(
    "/api/volunteer/projects/{project_id}",
    response_model=VolunteerWorkpartyModel,
    tags=["Trail Volunteer & Stewardship"],
    responses={
        200: {"description": "Volunteer workparty details retrieved"},
        404: {"description": "Volunteer workparty not found"},
    },
)
async def get_volunteer_project_by_id_endpoint(project_id: str) -> VolunteerWorkpartyModel:
    logger.info("Volunteer workparty details requested", extra={"project_id": project_id})
    proj = get_volunteer_project_by_id(project_id)
    if not proj:
        raise HTTPException(status_code=404, detail=f"Volunteer project '{project_id}' not found")
    return proj


@app.post(
    "/api/volunteer/register",
    response_model=VolunteerRegistrationResponse,
    tags=["Trail Volunteer & Stewardship"],
    responses={
        200: {"description": "Volunteer registration confirmed"},
        404: {"description": "Volunteer project not found or full"},
    },
)
async def post_volunteer_register_endpoint(
    request: VolunteerRegistrationRequest,
) -> VolunteerRegistrationResponse:
    logger.info(
        "Volunteer registration submitted",
        extra={"project_id": request.project_id, "volunteer": request.volunteer_name},
    )
    try:
        return register_volunteer(request)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.get(
    "/api/volunteer/impact",
    response_model=StewardshipImpactModel,
    tags=["Trail Volunteer & Stewardship"],
    responses={
        200: {"description": "Stewardship impact metrics retrieved"},
    },
)
async def get_volunteer_impact_endpoint() -> StewardshipImpactModel:
    logger.info("Stewardship impact metrics requested")
    return get_stewardship_impact()


@app.get(
    "/api/water/sources",
    response_model=list[WaterSourceModel],
    tags=["Backcountry Water & Filtration"],
    responses={
        200: {"description": "Backcountry water sources retrieved successfully"},
    },
)
async def get_water_sources_endpoint(
    region: Optional[str] = None,
    reliability: Optional[str] = None,
) -> list[WaterSourceModel]:
    logger.info("Water sources requested", extra={"region": region, "reliability": reliability})
    return get_water_sources(region=region, reliability=reliability)


@app.get(
    "/api/water/sources/{source_id}",
    response_model=WaterSourceModel,
    tags=["Backcountry Water & Filtration"],
    responses={
        200: {"description": "Water source details retrieved"},
        404: {"description": "Water source not found"},
    },
)
async def get_water_source_by_id_endpoint(source_id: str) -> WaterSourceModel:
    logger.info("Water source requested", extra={"source_id": source_id})
    source = get_water_source_by_id(source_id)
    if not source:
        raise HTTPException(status_code=404, detail=f"Water source '{source_id}' not found")
    return source


@app.post(
    "/api/water/hydration",
    response_model=HydrationEstimateResponse,
    tags=["Backcountry Water & Filtration"],
    responses={
        200: {"description": "Hydration carrying capacity estimate calculated"},
    },
)
async def post_water_hydration_endpoint(
    request: HydrationEstimateRequest,
) -> HydrationEstimateResponse:
    logger.info(
        "Hydration estimate requested",
        extra={"distance": request.distance_miles, "elevation": request.elevation_gain_feet},
    )
    return calculate_hydration_estimate(request)


@app.post(
    "/api/water/reports",
    response_model=WaterReportResponse,
    tags=["Backcountry Water & Filtration"],
    responses={
        200: {"description": "Field condition report submitted and verified"},
        404: {"description": "Water source not found"},
    },
)
async def post_water_reports_endpoint(
    request: WaterReportRequest,
) -> WaterReportResponse:
    logger.info(
        "Water report submitted",
        extra={"source_id": request.source_id, "reporter": request.reporter_name},
    )
    try:
        return submit_water_report(request)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.get(
    "/api/water/pathogens",
    response_model=dict[str, Any],
    tags=["Backcountry Water & Filtration"],
    responses={
        200: {"description": "Backcountry pathogen and filtration guide retrieved"},
    },
)
async def get_water_pathogens_endpoint() -> dict[str, Any]:
    logger.info("Water pathogen guide requested")
    return get_pathogen_protection_info()


@app.get(
    "/api/routes",
    response_model=list[TrailRouteModel],
    tags=["Wilderness GPS Navigation"],
    summary="List hiking and wilderness routes with optional filters",
)
async def get_routes_endpoint(
    region: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
) -> list[TrailRouteModel]:
    return get_trail_routes(region=region, difficulty=difficulty, search=search)


@app.get(
    "/api/routes/safety/protocol",
    response_model=dict[str, Any],
    tags=["Wilderness GPS Navigation"],
    summary="Get GPS navigation and offline safety guidelines",
)
async def get_route_safety_protocol_endpoint() -> dict[str, Any]:
    return get_gps_navigation_safety_protocol()


@app.get(
    "/api/routes/{route_id}",
    response_model=TrailRouteModel,
    tags=["Wilderness GPS Navigation"],
    summary="Get detailed trail route info by ID",
)
async def get_route_by_id_endpoint(route_id: str) -> TrailRouteModel:
    route = get_trail_route_by_id(route_id)
    if not route:
        raise HTTPException(status_code=404, detail=f"Route '{route_id}' not found")
    return route


@app.post(
    "/api/routes/export",
    response_model=RouteExportResponse,
    tags=["Wilderness GPS Navigation"],
    summary="Export route to GPX file format",
)
async def export_route_endpoint(request: RouteExportRequest) -> RouteExportResponse:
    try:
        return export_route_file(request)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.get(
    "/api/fire-safety/zones",
    response_model=list[FireZoneModel],
    tags=["Fire Safety & Campfire Regulations"],
    summary="List fire danger zones with optional region and danger level filters",
)
async def get_fire_zones_endpoint(
    region: Optional[str] = None,
    danger_level: Optional[str] = None,
) -> list[FireZoneModel]:
    return get_fire_zones(region=region, danger_level=danger_level)


@app.get(
    "/api/fire-safety/protocol",
    response_model=dict[str, Any],
    tags=["Fire Safety & Campfire Regulations"],
    summary="Get Leave No Trace campfire safety guidelines and suppression procedures",
)
async def get_fire_safety_protocol_endpoint() -> dict[str, Any]:
    return get_campfire_safety_protocol()


@app.get(
    "/api/fire-safety/zones/{zone_id}",
    response_model=FireZoneModel,
    tags=["Fire Safety & Campfire Regulations"],
    summary="Get detailed fire danger and campfire regulation info for a zone",
)
async def get_fire_zone_by_id_endpoint(zone_id: str) -> FireZoneModel:
    zone = get_fire_zone_by_id(zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail=f"Fire zone '{zone_id}' not found")
    return zone


@app.post(
    "/api/fire-safety/check-stove",
    response_model=StoveCheckResponse,
    tags=["Fire Safety & Campfire Regulations"],
    summary="Validate stove compliance for a specific fire zone",
)
async def check_stove_compliance_endpoint(
    request: StoveCheckRequest,
) -> StoveCheckResponse:
    try:
        return check_stove_compliance(request)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.post(
    "/api/fire-safety/reports",
    response_model=FireReportResponse,
    tags=["Fire Safety & Campfire Regulations"],
    summary="Submit a wildfire or smoke sighting report",
)
async def submit_fire_report_endpoint(
    request: FireReportRequest,
) -> FireReportResponse:
    try:
        return submit_fire_report(request)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.get(
    "/api/first-aid/conditions",
    response_model=list[MedicalConditionModel],
    tags=["Wilderness First Aid & Medical Protocol"],
    summary="List wilderness medical conditions with optional category and severity filters",
)
async def get_conditions_endpoint(
    category: Optional[str] = None,
    severity: Optional[str] = None,
) -> list[MedicalConditionModel]:
    return get_medical_conditions(category=category, severity=severity)


@app.get(
    "/api/first-aid/conditions/{condition_id}",
    response_model=MedicalConditionModel,
    tags=["Wilderness First Aid & Medical Protocol"],
    summary="Get medical condition details by condition ID",
)
async def get_condition_by_id_endpoint(condition_id: str) -> MedicalConditionModel:
    cond = get_medical_condition_by_id(condition_id)
    if not cond:
        raise HTTPException(status_code=404, detail=f"Medical condition '{condition_id}' not found")
    return cond


@app.post(
    "/api/first-aid/triage",
    response_model=TriageResponse,
    tags=["Wilderness First Aid & Medical Protocol"],
    summary="Assess wilderness injury symptoms and determine triage recommendation",
)
async def assess_triage_endpoint(request: TriageRequest) -> TriageResponse:
    return assess_wilderness_triage(request)


@app.post(
    "/api/first-aid/kit-calculator",
    response_model=KitCalcResponse,
    tags=["Wilderness First Aid & Medical Protocol"],
    summary="Calculate tailored first aid kit quantities based on party size and trip days",
)
async def calculate_kit_endpoint(request: KitCalcRequest) -> KitCalcResponse:
    return calculate_first_aid_kit(request)


@app.get(
    "/api/first-aid/evacuation-protocol",
    response_model=dict[str, Any],
    tags=["Wilderness First Aid & Medical Protocol"],
    summary="Get Search & Rescue (SAR) evacuation and helicopter LZ protocols",
)
async def get_evacuation_protocol_endpoint() -> dict[str, Any]:
    return get_evacuation_safety_protocol()


@app.get(
    "/api/lnt/principles",
    response_model=list[LntPrincipleModel],
    tags=["Leave No Trace & Waste Regulations"],
    summary="List Leave No Trace principles with optional principle_id filter",
)
async def get_lnt_principles_endpoint(
    principle_id: Optional[str] = None,
) -> list[LntPrincipleModel]:
    return get_lnt_principles(principle_id=principle_id)


@app.get(
    "/api/lnt/zones",
    response_model=list[WildernessZoneModel],
    tags=["Leave No Trace & Waste Regulations"],
    summary="List wilderness zones with optional zone_id filter",
)
async def get_wilderness_zones_endpoint(
    zone_id: Optional[str] = None,
) -> list[WildernessZoneModel]:
    return get_wilderness_zones(zone_id=zone_id)


@app.post(
    "/api/lnt/compliance",
    response_model=WasteComplianceResponse,
    tags=["Leave No Trace & Waste Regulations"],
    summary="Evaluate human waste and food storage rules for a wilderness zone",
)
async def assess_waste_compliance_endpoint(
    request: WasteComplianceRequest,
) -> WasteComplianceResponse:
    try:
        return assess_waste_compliance(request)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.post(
    "/api/lnt/pack-out-calc",
    response_model=PackOutCalcResponse,
    tags=["Leave No Trace & Waste Regulations"],
    summary="Calculate required WAG bags and waste supplies",
)
async def calculate_pack_out_waste_endpoint(
    request: PackOutCalcRequest,
) -> PackOutCalcResponse:
    return calculate_pack_out_waste(request)


@app.get(
    "/api/avalanche/zones",
    response_model=list[AvalancheZoneModel],
    tags=["Avalanche Safety & Snowpack Assessment"],
    summary="List avalanche forecast zones with optional zone_id filter",
)
async def get_avalanche_zones_endpoint(
    zone_id: Optional[str] = None,
) -> list[AvalancheZoneModel]:
    return get_avalanche_zones(zone_id=zone_id)


@app.get(
    "/api/avalanche/zones/{zone_id}",
    response_model=AvalancheZoneModel,
    tags=["Avalanche Safety & Snowpack Assessment"],
    summary="Get detailed avalanche forecast and problems for a specific zone",
)
async def get_avalanche_zone_by_id_endpoint(zone_id: str) -> AvalancheZoneModel:
    zone = get_avalanche_zone_by_id(zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail=f"Avalanche zone '{zone_id}' not found")
    return zone


@app.post(
    "/api/avalanche/slope-eval",
    response_model=SlopeAssessmentResponse,
    tags=["Avalanche Safety & Snowpack Assessment"],
    summary="Evaluate slope angle and avalanche terrain hazard",
)
async def assess_slope_terrain_endpoint(
    request: SlopeAssessmentRequest,
) -> SlopeAssessmentResponse:
    try:
        return assess_slope_terrain(request)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.get(
    "/api/avalanche/rescue-protocol",
    response_model=dict[str, Any],
    tags=["Avalanche Safety & Snowpack Assessment"],
    summary="Get companion avalanche rescue and beacon check guidelines",
)
async def get_avalanche_rescue_protocol_endpoint() -> dict[str, Any]:
    return get_companion_rescue_protocol()


@app.get(
    "/api/weather/zones",
    response_model=list[MountainZoneModel],
    tags=["Wilderness Weather & Alpine Microclimate"],
    summary="List mountain forecast zones with optional zone_id filter",
)
async def get_weather_zones_endpoint(
    zone_id: Optional[str] = None,
) -> list[MountainZoneModel]:
    return get_mountain_zones(zone_id=zone_id)


@app.get(
    "/api/weather/zones/{zone_id}",
    response_model=MountainZoneModel,
    tags=["Wilderness Weather & Alpine Microclimate"],
    summary="Get detailed mountain weather forecast for a specific zone",
)
async def get_weather_zone_by_id_endpoint(zone_id: str) -> MountainZoneModel:
    zone = get_mountain_zone_by_id(zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail=f"Mountain zone '{zone_id}' not found")
    return zone


@app.post(
    "/api/weather/microclimate",
    response_model=MicroclimateResponse,
    tags=["Wilderness Weather & Alpine Microclimate"],
    summary="Calculate lapse rate, wind chill, and hypothermia risk",
)
async def calculate_microclimate_endpoint(
    request: MicroclimateRequest,
) -> MicroclimateResponse:
    try:
        return calculate_microclimate(request)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.get(
    "/api/weather/protocols",
    response_model=dict[str, Any],
    tags=["Wilderness Weather & Alpine Microclimate"],
    summary="Get lightning safety and severe weather protocols",
)
async def get_weather_protocols_endpoint() -> dict[str, Any]:
    return get_lightning_safety_protocol()


@app.get(
    "/api/ski-touring/routes",
    response_model=list[SkiTourRouteModel],
    tags=["Backcountry Ski Touring & Splitboard Tooling"],
    summary="List backcountry ski touring and splitboard routes",
)
async def get_ski_tour_routes_endpoint(
    difficulty: Optional[str] = None,
    zone: Optional[str] = None,
) -> list[SkiTourRouteModel]:
    return get_ski_tour_routes(difficulty=difficulty, zone=zone)


@app.get(
    "/api/ski-touring/routes/{route_id}",
    response_model=SkiTourRouteModel,
    tags=["Backcountry Ski Touring & Splitboard Tooling"],
    summary="Get route details for a specific backcountry ski tour",
)
async def get_ski_tour_route_by_id_endpoint(route_id: str) -> SkiTourRouteModel:
    route = get_ski_tour_route_by_id(route_id)
    if not route:
        raise HTTPException(status_code=404, detail=f"Ski tour route '{route_id}' not found")
    return route


@app.post(
    "/api/ski-touring/pace-calc",
    response_model=SkinningPaceResponse,
    tags=["Backcountry Ski Touring & Splitboard Tooling"],
    summary="Calculate skinning ascent pace, total duration, and nutrition needs",
)
async def calculate_skinning_pace_endpoint(
    request: SkinningPaceRequest,
) -> SkinningPaceResponse:
    try:
        return calculate_skinning_pace(request)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.get(
    "/api/ski-touring/etiquette",
    response_model=dict[str, Any],
    tags=["Backcountry Ski Touring & Splitboard Tooling"],
    summary="Get skin track etiquette guidelines and resort uphill travel policies",
)
async def get_ski_tour_etiquette_endpoint() -> dict[str, Any]:
    return get_skin_track_etiquette_and_policies()


@app.get(
    "/api/whitewater/runs",
    response_model=list[RiverRunModel],
    tags=["Wilderness Waterway & Whitewater Tooling"],
    summary="List whitewater river runs",
)
async def get_whitewater_runs_endpoint(
    class_rating: Optional[str] = None,
    region: Optional[str] = None,
) -> list[RiverRunModel]:
    return get_whitewater_runs(class_rating=class_rating, region=region)


@app.get(
    "/api/whitewater/runs/{run_id}",
    response_model=RiverRunModel,
    tags=["Wilderness Waterway & Whitewater Tooling"],
    summary="Get run details for a specific whitewater river run",
)
async def get_whitewater_run_by_id_endpoint(run_id: str) -> RiverRunModel:
    run = get_whitewater_run_by_id(run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"River run '{run_id}' not found")
    return run


@app.post(
    "/api/whitewater/safety-eval",
    response_model=RiverSafetyResponse,
    tags=["Wilderness Waterway & Whitewater Tooling"],
    summary="Evaluate river flow status and paddler safety",
)
async def assess_river_safety_endpoint(
    request: RiverSafetyRequest,
) -> RiverSafetyResponse:
    try:
        return assess_river_safety(request)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.get(
    "/api/whitewater/protocols",
    response_model=dict[str, Any],
    tags=["Wilderness Waterway & Whitewater Tooling"],
    summary="Get whitewater safety protocols, river hazards, and cold water guidelines",
)
async def get_whitewater_protocols_endpoint() -> dict[str, Any]:
    return get_whitewater_safety_protocols()


@app.get(
    "/api/climbing/crags",
    response_model=list[CragModel],
    tags=["Backcountry Climbing & Alpine Crag Beta Tooling"],
    summary="List rock climbing crags",
)
async def get_climbing_crags_endpoint(
    discipline: Optional[str] = None,
    rock_type: Optional[str] = None,
) -> list[CragModel]:
    return get_climbing_crags(discipline=discipline, rock_type=rock_type)


@app.get(
    "/api/climbing/crags/{crag_id}",
    response_model=CragModel,
    tags=["Backcountry Climbing & Alpine Crag Beta Tooling"],
    summary="Get crag details for a specific rock climbing crag",
)
async def get_climbing_crag_by_id_endpoint(crag_id: str) -> CragModel:
    crag = get_climbing_crag_by_id(crag_id)
    if not crag:
        raise HTTPException(status_code=404, detail=f"Climbing crag '{crag_id}' not found")
    return crag


@app.post(
    "/api/climbing/rack-calc",
    response_model=RackCalcResponse,
    tags=["Backcountry Climbing & Alpine Crag Beta Tooling"],
    summary="Calculate climbing rack and rope requirements",
)
async def calculate_climbing_rack_endpoint(
    request: RackCalcRequest,
) -> RackCalcResponse:
    return calculate_climbing_rack(request)


@app.get(
    "/api/climbing/rappel-safety",
    response_model=dict[str, Any],
    tags=["Backcountry Climbing & Alpine Crag Beta Tooling"],
    summary="Get rock climbing rappel and anchor safety protocols",
)
async def get_climbing_rappel_safety_endpoint() -> dict[str, Any]:
    return get_rappel_safety_protocol()


@app.get(
    "/api/foraging/species",
    response_model=list[SpeciesModel],
    tags=["Wilderness Foraging & Flora Safety Tooling"],
    summary="List wild edible plants and mushrooms",
)
async def get_foraging_species_endpoint(
    category: Optional[str] = None,
    season: Optional[str] = None,
) -> list[SpeciesModel]:
    return get_foraging_species(category=category, season=season)


@app.get(
    "/api/foraging/species/{species_id}",
    response_model=SpeciesModel,
    tags=["Wilderness Foraging & Flora Safety Tooling"],
    summary="Get details for a specific wild edible plant or mushroom",
)
async def get_foraging_species_by_id_endpoint(species_id: str) -> SpeciesModel:
    sp = get_foraging_species_by_id(species_id)
    if not sp:
        raise HTTPException(status_code=404, detail=f"Species '{species_id}' not found")
    return sp


@app.post(
    "/api/foraging/safety-check",
    response_model=SafetyScreenerResponse,
    tags=["Wilderness Foraging & Flora Safety Tooling"],
    summary="Evaluate candidate traits and return safety screening assessment",
)
async def assess_foraging_safety_endpoint(
    request: SafetyScreenerRequest,
) -> SafetyScreenerResponse:
    return assess_foraging_safety(request)


@app.get(
    "/api/foraging/guidelines",
    response_model=dict[str, Any],
    tags=["Wilderness Foraging & Flora Safety Tooling"],
    summary="Get ethical foraging guidelines and harvest permits info",
)
async def get_foraging_guidelines_endpoint() -> dict[str, Any]:
    return get_foraging_guidelines()


@app.get(
    "/api/stargazing/sites",
    response_model=list[ObservingSiteModel],
    tags=["Celestial & Dark Sky Observation Tooling"],
    summary="List dark sky observation sites with optional Bortle class filter",
)
async def get_stargazing_sites_endpoint(
    bortle_max: Optional[int] = None,
) -> list[ObservingSiteModel]:
    return get_stargazing_sites(bortle_max=bortle_max)


@app.get(
    "/api/stargazing/sites/{site_id}",
    response_model=ObservingSiteModel,
    tags=["Celestial & Dark Sky Observation Tooling"],
    summary="Get details for a specific dark sky observing site",
)
async def get_stargazing_site_by_id_endpoint(site_id: str) -> ObservingSiteModel:
    site = get_stargazing_site_by_id(site_id)
    if not site:
        raise HTTPException(status_code=404, detail=f"Observing site '{site_id}' not found")
    return site


@app.post(
    "/api/stargazing/viewing-window",
    response_model=ViewingWindowResponse,
    tags=["Celestial & Dark Sky Observation Tooling"],
    summary="Calculate viewing window quality score, condition reasons, and optics advice",
)
async def calculate_viewing_window_endpoint(
    request: ViewingWindowRequest,
) -> ViewingWindowResponse:
    try:
        return calculate_viewing_window(request)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/stargazing/meteor-showers",
    response_model=list[MeteorShowerModel],
    tags=["Celestial & Dark Sky Observation Tooling"],
    summary="Get annual meteor shower calendar",
)
async def get_meteor_shower_calendar_endpoint() -> list[MeteorShowerModel]:
    return get_meteor_shower_calendar()


@app.get(
    "/api/wildlife/species",
    response_model=list[WildlifeSpeciesModel],
    tags=["Backcountry Wildlife & Bear Country Tooling"],
    summary="List wildlife species with optional category filter",
)
async def get_wildlife_species_endpoint(
    category: Optional[str] = None,
) -> list[WildlifeSpeciesModel]:
    return get_wildlife_species(category=category)


@app.get(
    "/api/wildlife/species/{species_id}",
    response_model=WildlifeSpeciesModel,
    tags=["Backcountry Wildlife & Bear Country Tooling"],
    summary="Get details for a specific wildlife species",
)
async def get_wildlife_species_by_id_endpoint(species_id: str) -> WildlifeSpeciesModel:
    sp = get_wildlife_species_by_id(species_id)
    if not sp:
        raise HTTPException(status_code=404, detail=f"Wildlife species '{species_id}' not found")
    return sp


@app.post(
    "/api/wildlife/encounter-assess",
    response_model=EncounterAssessmentResponse,
    tags=["Backcountry Wildlife & Bear Country Tooling"],
    summary="Evaluate wildlife encounter parameters and return safety protocols",
)
async def assess_wildlife_encounter_endpoint(
    request: EncounterAssessmentRequest,
) -> EncounterAssessmentResponse:
    return assess_wildlife_encounter(request)


@app.get(
    "/api/wildlife/food-storage",
    response_model=list[FoodStorageGuidelineModel],
    tags=["Backcountry Wildlife & Bear Country Tooling"],
    summary="Get food storage guidelines and mandatory bear canister zone regulations",
)
async def get_food_storage_guidelines_endpoint() -> list[FoodStorageGuidelineModel]:
    return get_food_storage_guidelines()


@app.get(
    "/api/trail-running/routes",
    response_model=list[TrailRunRouteModel],
    tags=["Mountain Ultra Outfitting & Pacing Tooling"],
    summary="List mountain ultra and trail running routes with optional difficulty filter",
)
async def get_trail_running_routes_endpoint(
    difficulty: Optional[str] = None,
) -> list[TrailRunRouteModel]:
    return get_trail_run_routes(difficulty=difficulty)


@app.get(
    "/api/trail-running/routes/{route_id}",
    response_model=TrailRunRouteModel,
    tags=["Mountain Ultra Outfitting & Pacing Tooling"],
    summary="Get details for a specific mountain ultra route",
)
async def get_trail_running_route_by_id_endpoint(route_id: str) -> TrailRunRouteModel:
    route = get_trail_run_route_by_id(route_id)
    if not route:
        raise HTTPException(status_code=404, detail=f"Trail running route '{route_id}' not found")
    return route


@app.post(
    "/api/trail-running/pacing-calc",
    response_model=PacingCalculationResponse,
    tags=["Mountain Ultra Outfitting & Pacing Tooling"],
    summary="Calculate pacing, calories, hydration, and splits for mountain ultra route",
)
async def calculate_trail_running_pacing_endpoint(
    request: PacingCalculationRequest,
) -> PacingCalculationResponse:
    try:
        return calculate_trail_run_pacing(request)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/trail-running/mandatory-gear",
    response_model=list[MandatoryGearRequirement],
    tags=["Mountain Ultra Outfitting & Pacing Tooling"],
    summary="Get mandatory mountain ultra gear compliance items",
)
async def get_mandatory_gear_requirements_endpoint() -> list[MandatoryGearRequirement]:
    return get_mandatory_gear_requirements()


@app.get(
    "/api/hot-springs/springs",
    response_model=list[HotSpringModel],
    tags=["Backcountry Hot Springs & Geothermal Soaking Tooling"],
    summary="List backcountry hot springs with optional access or state filters",
)
async def get_hot_springs_endpoint(
    access: Optional[str] = None,
    state: Optional[str] = None,
) -> list[HotSpringModel]:
    return get_hot_springs(access=access, state=state)


@app.get(
    "/api/hot-springs/springs/{spring_id}",
    response_model=HotSpringModel,
    tags=["Backcountry Hot Springs & Geothermal Soaking Tooling"],
    summary="Get details for a specific backcountry hot spring",
)
async def get_hot_spring_by_id_endpoint(spring_id: str) -> HotSpringModel:
    spring = get_hot_spring_by_id(spring_id)
    if not spring:
        raise HTTPException(status_code=404, detail=f"Hot spring '{spring_id}' not found")
    return spring


@app.post(
    "/api/hot-springs/soaking-plan",
    response_model=SoakingPlanResponse,
    tags=["Backcountry Hot Springs & Geothermal Soaking Tooling"],
    summary="Calculate hydration, safe session duration, and hazard warnings for geothermal soaking",
)
async def calculate_soaking_plan_endpoint(
    request: SoakingPlanRequest,
) -> SoakingPlanResponse:
    try:
        return calculate_soaking_plan(request)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/hot-springs/gear-ethics",
    response_model=HotSpringGearEthicsResponse,
    tags=["Backcountry Hot Springs & Geothermal Soaking Tooling"],
    summary="Get mandatory hot spring gear packing items and Leave No Trace soaking ethics rules",
)
async def get_hot_spring_gear_ethics_endpoint() -> HotSpringGearEthicsResponse:
    return get_hot_spring_gear_and_ethics()


@app.get(
    "/api/fly-fishing/locations",
    response_model=list[FishingLocationModel],
    tags=["Mountain Angling & Fly Fishing Tooling"],
    summary="List mountain and alpine fishing waters with optional water_type or state filters",
)
async def get_fly_fishing_locations_endpoint(
    water_type: Optional[str] = None,
    state: Optional[str] = None,
) -> list[FishingLocationModel]:
    return get_fishing_locations(water_type=water_type, state=state)


@app.get(
    "/api/fly-fishing/locations/{location_id}",
    response_model=FishingLocationModel,
    tags=["Mountain Angling & Fly Fishing Tooling"],
    summary="Get details for a specific fly fishing water",
)
async def get_fly_fishing_location_by_id_endpoint(location_id: str) -> FishingLocationModel:
    loc = get_fishing_location_by_id(location_id)
    if not loc:
        raise HTTPException(status_code=404, detail=f"Fishing location '{location_id}' not found")
    return loc


@app.post(
    "/api/fly-fishing/fly-match",
    response_model=FlyMatchResponse,
    tags=["Mountain Angling & Fly Fishing Tooling"],
    summary="Calculate suggested fly pattern, presentation, tippet size, and thermal water warning",
)
async def calculate_fly_match_endpoint(
    req: FlyMatchRequest,
) -> FlyMatchResponse:
    try:
        return calculate_fly_match(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/fly-fishing/gear-regulations",
    response_model=FlyFishingGearRegulationsResponse,
    tags=["Mountain Angling & Fly Fishing Tooling"],
    summary="List required conservation tackle and barbless/LNT rules",
)
async def get_fly_fishing_gear_regulations_endpoint() -> FlyFishingGearRegulationsResponse:
    return get_fly_fishing_gear_and_regulations()


@app.get(
    "/api/bikepacking/routes",
    response_model=list[BikepackingRouteModel],
    tags=["Wilderness Bikepacking & Route Outfitting Tooling"],
    summary="List bikepacking routes with optional terrain filter",
)
async def get_bikepacking_routes_endpoint(
    terrain: Optional[str] = None,
) -> list[BikepackingRouteModel]:
    return get_bikepacking_routes(terrain=terrain)


@app.get(
    "/api/bikepacking/routes/{route_id}",
    response_model=BikepackingRouteModel,
    tags=["Wilderness Bikepacking & Route Outfitting Tooling"],
    summary="Get details for a specific bikepacking route",
)
async def get_bikepacking_route_by_id_endpoint(route_id: str) -> BikepackingRouteModel:
    route = get_bikepacking_route_by_id(route_id)
    if not route:
        raise HTTPException(status_code=404, detail=f"Bikepacking route '{route_id}' not found")
    return route


@app.post(
    "/api/bikepacking/rig-calc",
    response_model=BikepackingRigResponse,
    tags=["Wilderness Bikepacking & Route Outfitting Tooling"],
    summary="Calculate tire pressure, bag volume, calorie demands, and trailside spares",
)
async def calculate_bikepacking_rig_endpoint(
    req: BikepackingRigRequest,
) -> BikepackingRigResponse:
    try:
        return calculate_bikepacking_rig(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/bikepacking/gear-checklist",
    response_model=list[BikepackingGearRequirement],
    tags=["Wilderness Bikepacking & Route Outfitting Tooling"],
    summary="List required bikepacking repair tools and gear checklist",
)
async def get_bikepacking_gear_checklist_endpoint() -> list[BikepackingGearRequirement]:
    return get_bikepacking_gear()


@app.get(
    "/api/mountaineering/routes",
    response_model=list[GlacierRouteModel],
    tags=["Glaciated Peak Technical Outfitting Tooling"],
    summary="List glaciated peak mountaineering routes with optional grade filter",
)
async def get_mountaineering_routes_endpoint(
    grade: Optional[str] = None,
) -> list[GlacierRouteModel]:
    return get_glacier_routes(grade=grade)


@app.get(
    "/api/mountaineering/routes/{route_id}",
    response_model=GlacierRouteModel,
    tags=["Glaciated Peak Technical Outfitting Tooling"],
    summary="Get details for a specific glaciated peak route",
)
async def get_mountaineering_route_by_id_endpoint(route_id: str) -> GlacierRouteModel:
    route = get_glacier_route_by_id(route_id)
    if not route:
        raise HTTPException(status_code=404, detail=f"Glacier route '{route_id}' not found")
    return route


@app.post(
    "/api/mountaineering/rope-team-plan",
    response_model=RopeTeamPlanResponse,
    tags=["Glaciated Peak Technical Outfitting Tooling"],
    summary="Calculate rope team spacing, brake knots, snow pickets, and turnaround time",
)
async def calculate_rope_team_plan_endpoint(
    req: RopeTeamPlanRequest,
) -> RopeTeamPlanResponse:
    try:
        return calculate_rope_team_plan(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/mountaineering/gear-checklist",
    response_model=list[GlacierGearRequirement],
    tags=["Glaciated Peak Technical Outfitting Tooling"],
    summary="List required technical glacier gear and rescue kit",
)
async def get_mountaineering_gear_checklist_endpoint() -> list[GlacierGearRequirement]:
    return get_glacier_gear()


@app.get(
    "/api/sea-kayaking/routes",
    response_model=list[SeaKayakRouteModel],
    tags=["Coastal Sea Kayaking & Marine Expedition Outfitting Tooling"],
    summary="List sea kayaking routes with optional water grade filter",
)
async def get_sea_kayak_routes_endpoint(
    water_grade: Optional[str] = None,
) -> list[SeaKayakRouteModel]:
    return get_sea_kayak_routes(water_grade=water_grade)


@app.get(
    "/api/sea-kayaking/routes/{route_id}",
    response_model=SeaKayakRouteModel,
    tags=["Coastal Sea Kayaking & Marine Expedition Outfitting Tooling"],
    summary="Get details for a specific sea kayaking route",
)
async def get_sea_kayak_route_by_id_endpoint(route_id: str) -> SeaKayakRouteModel:
    route = get_sea_kayak_route_by_id(route_id)
    if not route:
        raise HTTPException(status_code=404, detail=f"Sea kayak route '{route_id}' not found")
    return route


@app.post(
    "/api/sea-kayaking/tide-plan",
    response_model=TidePlanResponse,
    tags=["Coastal Sea Kayaking & Marine Expedition Outfitting Tooling"],
    summary="Calculate tidal window, crossing safety, and ferry angle",
)
async def calculate_tide_plan_endpoint(
    req: TidePlanRequest,
) -> TidePlanResponse:
    try:
        return calculate_tide_plan(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/sea-kayaking/gear-checklist",
    response_model=list[SeaKayakGearRequirement],
    tags=["Coastal Sea Kayaking & Marine Expedition Outfitting Tooling"],
    summary="List required coastal sea kayaking safety gear and immersion kit",
)
async def get_sea_kayak_gear_checklist_endpoint() -> list[SeaKayakGearRequirement]:
    return get_sea_kayak_gear()


@app.get(
    "/api/packrafting/routes",
    response_model=list[PackraftRouteModel],
    tags=["Backcountry Packrafting River Expedition Outfitting Tooling"],
    summary="List packraft routes with optional river grade filter",
)
async def get_packraft_routes_endpoint(
    river_grade: Optional[str] = None,
) -> list[PackraftRouteModel]:
    return get_packraft_routes(grade=river_grade)


@app.get(
    "/api/packrafting/routes/{route_id}",
    response_model=PackraftRouteModel,
    tags=["Backcountry Packrafting River Expedition Outfitting Tooling"],
    summary="Get details for a specific packrafting route",
)
async def get_packraft_route_by_id_endpoint(route_id: str) -> PackraftRouteModel:
    route = get_packraft_route_by_id(route_id)
    if not route:
        raise HTTPException(status_code=404, detail=f"Packraft route '{route_id}' not found")
    return route


@app.post(
    "/api/packrafting/plan",
    response_model=PackraftPlanResponse,
    tags=["Backcountry Packrafting River Expedition Outfitting Tooling"],
    summary="Calculate river flow feasibility, spraydeck, payload margin, and paddle length",
)
async def calculate_packraft_plan_endpoint(
    req: PackraftPlanRequest,
) -> PackraftPlanResponse:
    try:
        return calculate_packraft_plan(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/packrafting/gear-checklist",
    response_model=list[PackraftGearRequirement],
    tags=["Backcountry Packrafting River Expedition Outfitting Tooling"],
    summary="List mandatory packraft kit and ultralight gear checklist",
)
async def get_packraft_gear_checklist_endpoint() -> list[PackraftGearRequirement]:
    return get_packraft_gear()


@app.get(
    "/api/canyoneering/routes",
    response_model=list[SlotCanyonRouteModel],
    tags=["Alpine Canyoneering & Technical Slot Canyon Outfitting Tooling"],
    summary="List slot canyon routes with optional technical grade filter",
)
async def get_canyon_routes_endpoint(
    technical_grade: Optional[str] = None,
) -> list[SlotCanyonRouteModel]:
    return get_canyon_routes(grade=technical_grade)


@app.get(
    "/api/canyoneering/routes/{route_id}",
    response_model=SlotCanyonRouteModel,
    tags=["Alpine Canyoneering & Technical Slot Canyon Outfitting Tooling"],
    summary="Get details for a specific slot canyon route",
)
async def get_canyon_route_by_id_endpoint(route_id: str) -> SlotCanyonRouteModel:
    route = get_canyon_route_by_id(route_id)
    if not route:
        raise HTTPException(status_code=404, detail=f"Slot canyon route '{route_id}' not found")
    return route


@app.post(
    "/api/canyoneering/rigging-plan",
    response_model=RopeRiggingResponse,
    tags=["Alpine Canyoneering & Technical Slot Canyon Outfitting Tooling"],
    summary="Calculate rope lengths, pull cord, anchor system, and thermal spec",
)
async def calculate_rope_rigging_plan_endpoint(
    req: RopeRiggingRequest,
) -> RopeRiggingResponse:
    try:
        return calculate_rope_rigging_plan(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/canyoneering/gear-checklist",
    response_model=list[CanyoneeringGearRequirement],
    tags=["Alpine Canyoneering & Technical Slot Canyon Outfitting Tooling"],
    summary="List mandatory technical canyoneering kit and gear checklist",
)
async def get_canyoneering_gear_checklist_endpoint() -> list[CanyoneeringGearRequirement]:
    return get_canyoneering_gear()


@app.get(
    "/api/acclimatization/peaks",
    response_model=list[AltitudePeakProfileModel],
    tags=["High-Altitude Acclimatization & Symptom Triage Tooling"],
    summary="List high-altitude mountaineering peaks with optional altitude zone filter",
)
async def get_altitude_peaks_endpoint(
    zone: Optional[str] = None,
) -> list[AltitudePeakProfileModel]:
    return get_altitude_profiles(zone=zone)


@app.get(
    "/api/acclimatization/peaks/{peak_id}",
    response_model=AltitudePeakProfileModel,
    tags=["High-Altitude Acclimatization & Symptom Triage Tooling"],
    summary="Get details and acclimatization camps for a specific high-altitude peak",
)
async def get_altitude_peak_by_id_endpoint(peak_id: str) -> AltitudePeakProfileModel:
    peak = get_altitude_profile_by_id(peak_id)
    if not peak:
        raise HTTPException(status_code=404, detail=f"Altitude peak profile '{peak_id}' not found")
    return peak


@app.post(
    "/api/acclimatization/plan",
    response_model=AcclimatizationPlanResponse,
    tags=["High-Altitude Acclimatization & Symptom Triage Tooling"],
    summary="Calculate ascent pacing, rest days, AMS risk level, and hydration schedule",
)
async def calculate_acclimatization_plan_endpoint(
    req: AcclimatizationPlanRequest,
) -> AcclimatizationPlanResponse:
    try:
        return calculate_acclimatization_plan(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/acclimatization/gear-checklist",
    response_model=list[AltitudeMedicalGearRequirement],
    tags=["High-Altitude Acclimatization & Symptom Triage Tooling"],
    summary="List mandatory high-altitude medical kit compliance checklist",
)
async def get_altitude_gear_checklist_endpoint() -> list[AltitudeMedicalGearRequirement]:
    return get_altitude_medical_gear()


@app.get(
    "/api/nordic-skiing/trails",
    response_model=list[NordicTrailModel],
    tags=["Nordic & Cross-Country Ski Grooming & Kick Wax Advisor Tooling"],
    summary="List Nordic & cross-country ski trails with optional discipline filter",
)
async def get_nordic_trails_endpoint(
    discipline: Optional[str] = None,
) -> list[NordicTrailModel]:
    return get_nordic_trails(discipline=discipline)


@app.get(
    "/api/nordic-skiing/trails/{trail_id}",
    response_model=NordicTrailModel,
    tags=["Nordic & Cross-Country Ski Grooming & Kick Wax Advisor Tooling"],
    summary="Get details, daily grooming report, and track specifications for a specific Nordic trail",
)
async def get_nordic_trail_by_id_endpoint(trail_id: str) -> NordicTrailModel:
    trail = get_nordic_trail_by_id(trail_id)
    if not trail:
        raise HTTPException(status_code=404, detail=f"Nordic trail '{trail_id}' not found")
    return trail


@app.post(
    "/api/nordic-skiing/wax-plan",
    response_model=WaxAdvisorResponse,
    tags=["Nordic & Cross-Country Ski Grooming & Kick Wax Advisor Tooling"],
    summary="Calculate kick wax, glide wax, wax pocket pressure, and klister advisory",
)
async def calculate_wax_plan_endpoint(
    req: WaxAdvisorRequest,
) -> WaxAdvisorResponse:
    try:
        return calculate_wax_plan(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/nordic-skiing/gear-checklist",
    response_model=list[NordicGearRequirement],
    tags=["Nordic & Cross-Country Ski Grooming & Kick Wax Advisor Tooling"],
    summary="List mandatory Nordic equipment compliance checklist",
)
async def get_nordic_gear_checklist_endpoint() -> list[NordicGearRequirement]:
    return get_nordic_gear()


@app.get(
    "/api/via-ferrata/routes",
    response_model=list[ViaFerrataRouteModel],
    tags=["Alpine Via Ferrata & Fall-Arrest Rigging Tooling"],
    summary="List alpine via ferrata and iron way routes with optional Schall difficulty grade filter",
)
async def get_via_ferrata_routes_endpoint(
    grade: Optional[str] = None,
) -> list[ViaFerrataRouteModel]:
    return get_via_ferrata_routes(grade=grade)


@app.get(
    "/api/via-ferrata/routes/{route_id}",
    response_model=ViaFerrataRouteModel,
    tags=["Alpine Via Ferrata & Fall-Arrest Rigging Tooling"],
    summary="Get details, cable specs, and exposure ratings for a specific via ferrata route",
)
async def get_via_ferrata_route_endpoint(route_id: str) -> ViaFerrataRouteModel:
    route = get_via_ferrata_route_by_id(route_id)
    if not route:
        raise HTTPException(status_code=404, detail=f"Via ferrata route '{route_id}' not found")
    return route


@app.post(
    "/api/via-ferrata/rigging-plan",
    response_model=RiggingPlanResponse,
    tags=["Alpine Via Ferrata & Fall-Arrest Rigging Tooling"],
    summary="Calculate via ferrata rigging plan, fall factor impact force, and EN 958 compliance",
)
async def calculate_via_ferrata_rigging_plan_endpoint(
    req: RiggingPlanRequest,
) -> RiggingPlanResponse:
    try:
        return calculate_rigging_plan(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/via-ferrata/gear-checklist",
    response_model=list[ViaFerrataGearRequirement],
    tags=["Alpine Via Ferrata & Fall-Arrest Rigging Tooling"],
    summary="List mandatory via ferrata equipment compliance checklist",
)
async def get_via_ferrata_gear_checklist_endpoint() -> list[ViaFerrataGearRequirement]:
    return get_via_ferrata_gear()


@app.get(
    "/api/ice-climbing/routes",
    response_model=list[IceClimbingRouteModel],
    tags=["Waterfall Ice Climbing & Anchor Rigging Tooling"],
    summary="List iconic waterfall ice climbing routes with optional grade filtering",
)
async def get_ice_climbing_routes_endpoint(
    grade: Optional[str] = None,
) -> list[IceClimbingRouteModel]:
    return get_ice_climbing_routes(grade=grade)


@app.get(
    "/api/ice-climbing/routes/{route_id}",
    response_model=IceClimbingRouteModel,
    tags=["Waterfall Ice Climbing & Anchor Rigging Tooling"],
    summary="Get details, pitches, and ice structures for a specific waterfall ice climbing route",
)
async def get_ice_climbing_route_endpoint(route_id: str) -> IceClimbingRouteModel:
    route = get_ice_climbing_route_by_id(route_id)
    if not route:
        raise HTTPException(status_code=404, detail=f"Ice climbing route '{route_id}' not found")
    return route


@app.post(
    "/api/ice-climbing/rigging-plan",
    response_model=IceRiggingResponse,
    tags=["Waterfall Ice Climbing & Anchor Rigging Tooling"],
    summary="Calculate ice rigging plan, screw holding force, and V-thread anchor suitability",
)
async def calculate_ice_rigging_plan_endpoint(
    req: IceRiggingRequest,
) -> IceRiggingResponse:
    try:
        return calculate_ice_rigging_plan(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/ice-climbing/gear-checklist",
    response_model=list[IceClimbingGearRequirement],
    tags=["Waterfall Ice Climbing & Anchor Rigging Tooling"],
    summary="List mandatory waterfall ice climbing gear checklist",
)
async def get_ice_climbing_gear_checklist_endpoint() -> list[IceClimbingGearRequirement]:
    return get_ice_climbing_gear()


@app.get(
    "/api/bushcraft/projects",
    response_model=list[BushcraftProjectModel],
    tags=["Wilderness Bushcraft & Traditional Fieldcraft Tooling"],
    summary="List wilderness bushcraft and fieldcraft projects with optional discipline filter",
)
async def get_bushcraft_projects_endpoint(
    discipline: Optional[str] = None,
) -> list[BushcraftProjectModel]:
    return get_bushcraft_projects(discipline=discipline)


@app.get(
    "/api/bushcraft/projects/{project_id}",
    response_model=BushcraftProjectModel,
    tags=["Wilderness Bushcraft & Traditional Fieldcraft Tooling"],
    summary="Get details for a specific wilderness bushcraft project",
)
async def get_bushcraft_project_by_id_endpoint(project_id: str) -> BushcraftProjectModel:
    project = get_bushcraft_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail=f"Bushcraft project '{project_id}' not found")
    return project


@app.post(
    "/api/bushcraft/thermal-calc",
    response_model=ShelterThermalResponse,
    tags=["Wilderness Bushcraft & Traditional Fieldcraft Tooling"],
    summary="Calculate shelter effective R-value, interior temperature, and ground conductive loss",
)
async def calculate_shelter_thermal_endpoint(
    req: ShelterThermalRequest,
) -> ShelterThermalResponse:
    try:
        return calculate_shelter_thermal(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/bushcraft/gear-checklist",
    response_model=list[BushcraftGearRequirement],
    tags=["Wilderness Bushcraft & Traditional Fieldcraft Tooling"],
    summary="List mandatory wilderness bushcraft kit checklist",
)
async def get_bushcraft_gear_checklist_endpoint() -> list[BushcraftGearRequirement]:
    return get_bushcraft_gear()


@app.get(
    "/api/caving/caves",
    response_model=list[CavingRouteModel],
    tags=["Alpine Caving & Single Rope Technique (SRT) Tooling"],
    summary="List iconic caving systems and karst vertical shafts with optional cave grade filter",
)
async def get_caving_caves_endpoint(
    grade: Optional[str] = None,
) -> list[CavingRouteModel]:
    return get_caving_routes(grade=grade)


@app.get(
    "/api/caving/caves/{cave_id}",
    response_model=CavingRouteModel,
    tags=["Alpine Caving & Single Rope Technique (SRT) Tooling"],
    summary="Get details, vertical depth, pitch breakdown, and oversuit requirements for a specific cave",
)
async def get_caving_cave_by_id_endpoint(cave_id: str) -> CavingRouteModel:
    cave = get_caving_route_by_id(cave_id)
    if not cave:
        raise HTTPException(status_code=404, detail=f"Caving route '{cave_id}' not found")
    return cave


@app.post(
    "/api/caving/rigging-plan",
    response_model=SrtRiggingResponse,
    tags=["Alpine Caving & Single Rope Technique (SRT) Tooling"],
    summary="Calculate Single Rope Technique (SRT) rigging plan, rope stretch, descender, and safety status",
)
async def calculate_caving_rigging_plan_endpoint(
    req: SrtRiggingRequest,
) -> SrtRiggingResponse:
    try:
        return calculate_srt_rigging_plan(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/caving/gear-checklist",
    response_model=list[CavingGearRequirement],
    tags=["Alpine Caving & Single Rope Technique (SRT) Tooling"],
    summary="List mandatory caving and SRT equipment compliance checklist",
)
async def get_caving_gear_checklist_endpoint() -> list[CavingGearRequirement]:
    return get_caving_gear()


@app.get(
    "/api/desert-trekking/routes",
    response_model=list[DesertRouteModel],
    tags=["Desert Trekking & Water Cache Tooling"],
    summary="List iconic desert trekking routes with optional aridity zone filter",
)
async def get_desert_routes_endpoint(
    zone: Optional[str] = None,
) -> list[DesertRouteModel]:
    return get_desert_routes(zone=zone)


@app.get(
    "/api/desert-trekking/routes/{route_id}",
    response_model=DesertRouteModel,
    tags=["Desert Trekking & Water Cache Tooling"],
    summary="Get details, aridity zone, elevation gain, and water cache requirements for a specific desert route",
)
async def get_desert_route_by_id_endpoint(route_id: str) -> DesertRouteModel:
    route = get_desert_route_by_id(route_id)
    if not route:
        raise HTTPException(status_code=404, detail=f"Desert route '{route_id}' not found")
    return route


@app.post(
    "/api/desert-trekking/hydration-plan",
    response_model=HydrationPlanResponse,
    tags=["Desert Trekking & Water Cache Tooling"],
    summary="Calculate hydration plan, heat index, hourly sweat rate, water cache, and safety advisory",
)
async def calculate_desert_hydration_plan_endpoint(
    req: HydrationPlanRequest,
) -> HydrationPlanResponse:
    try:
        return calculate_hydration_plan(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/desert-trekking/gear-checklist",
    response_model=list[DesertGearRequirement],
    tags=["Desert Trekking & Water Cache Tooling"],
    summary="List mandatory desert trekking kit checklist",
)
async def get_desert_gear_checklist_endpoint() -> list[DesertGearRequirement]:
    return get_desert_gear()


@app.get(
    "/api/coasteering/routes",
    response_model=list[CoasteeringRouteModel],
    tags=["Coastal Sea Cliff Coasteering & Swell Safety Tooling"],
    summary="List iconic coastal sea cliff coasteering routes with optional grade filtering",
)
async def get_coasteering_routes_endpoint(
    grade: Optional[str] = None,
) -> list[CoasteeringRouteModel]:
    return get_coasteering_routes(grade=grade)


@app.get(
    "/api/coasteering/routes/{route_id}",
    response_model=CoasteeringRouteModel,
    tags=["Coastal Sea Cliff Coasteering & Swell Safety Tooling"],
    summary="Get details, jump heights, and sea caves for a specific coasteering route",
)
async def get_coasteering_route_endpoint(route_id: str) -> CoasteeringRouteModel:
    route = get_coasteering_route_by_id(route_id)
    if not route:
        raise HTTPException(status_code=404, detail=f"Coasteering route '{route_id}' not found")
    return route


@app.post(
    "/api/coasteering/jump-safety",
    response_model=JumpSafetyResponse,
    tags=["Coastal Sea Cliff Coasteering & Swell Safety Tooling"],
    summary="Calculate cliff jump safety, aerated foam depth requirements, and surge timing",
)
async def calculate_jump_safety_endpoint(
    req: JumpSafetyRequest,
) -> JumpSafetyResponse:
    try:
        return calculate_jump_safety(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/coasteering/gear-checklist",
    response_model=list[CoasteeringGearRequirement],
    tags=["Coastal Sea Cliff Coasteering & Swell Safety Tooling"],
    summary="List mandatory coastal sea cliff coasteering gear checklist",
)
async def get_coasteering_gear_checklist_endpoint() -> list[CoasteeringGearRequirement]:
    return get_coasteering_gear()


@app.get(
    "/api/orienteering/courses",
    response_model=list[OrienteeringCourseModel],
    tags=["Wilderness Orienteering & Off-Trail Land Navigation Tooling"],
    summary="List wilderness orienteering courses with optional difficulty filtering",
)
async def get_orienteering_courses_endpoint(
    difficulty: Optional[str] = None,
) -> list[OrienteeringCourseModel]:
    return get_orienteering_courses(difficulty=difficulty)


@app.get(
    "/api/orienteering/courses/{course_id}",
    response_model=OrienteeringCourseModel,
    tags=["Wilderness Orienteering & Off-Trail Land Navigation Tooling"],
    summary="Get details, declination, and control checkpoints for an orienteering course",
)
async def get_orienteering_course_endpoint(course_id: str) -> OrienteeringCourseModel:
    course = get_orienteering_course_by_id(course_id)
    if not course:
        raise HTTPException(status_code=404, detail=f"Orienteering course '{course_id}' not found")
    return course


@app.post(
    "/api/orienteering/calculate-leg",
    response_model=NavigationLegResponse,
    tags=["Wilderness Orienteering & Off-Trail Land Navigation Tooling"],
    summary="Calculate navigation leg bearing, back bearing, aim off, pace counts, and travel time",
)
async def calculate_navigation_leg_endpoint(
    req: NavigationLegRequest,
) -> NavigationLegResponse:
    try:
        return calculate_navigation_leg(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/orienteering/gear",
    response_model=list[OrienteeringGearRequirement],
    tags=["Wilderness Orienteering & Off-Trail Land Navigation Tooling"],
    summary="List mandatory wilderness orienteering and navigation gear requirements",
)
async def get_orienteering_gear_endpoint() -> list[OrienteeringGearRequirement]:
    return get_orienteering_gear()


@app.get(
    "/api/highline/spans",
    response_model=list[HighlineSpanModel],
    tags=["Alpine Highline & Slackline Rigging Tooling"],
    summary="List iconic alpine highline spans with optional difficulty filtering",
)
async def get_highline_spans_endpoint(
    difficulty: Optional[str] = None,
) -> list[HighlineSpanModel]:
    return get_highline_spans(difficulty=difficulty)


@app.get(
    "/api/highline/spans/{span_id}",
    response_model=HighlineSpanModel,
    tags=["Alpine Highline & Slackline Rigging Tooling"],
    summary="Get details, length, void exposure, and webbings for a specific highline span",
)
async def get_highline_span_endpoint(span_id: str) -> HighlineSpanModel:
    span = get_highline_span_by_id(span_id)
    if not span:
        raise HTTPException(status_code=404, detail=f"Highline span '{span_id}' not found")
    return span


@app.post(
    "/api/highline/calculate-rigging",
    response_model=RiggingCalculationResponse,
    tags=["Alpine Highline & Slackline Rigging Tooling"],
    summary="Calculate highline sag, line tension, anchor vector loads, and safety factors",
)
async def calculate_highline_rigging_endpoint(
    request: RiggingCalculationRequest,
) -> RiggingCalculationResponse:
    try:
        return calculate_rigging_physics(request)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@app.get(
    "/api/highline/gear",
    response_model=list[HighlineGearRequirement],
    tags=["Alpine Highline & Slackline Rigging Tooling"],
    summary="List mandatory alpine highline rigging kit compliance checklist",
)
async def get_highline_gear_endpoint() -> list[HighlineGearRequirement]:
    return get_highline_gear()


@app.get(
    "/api/dogsledding/routes",
    response_model=list[DogsledRouteModel],
    tags=["Winter Wilderness Dogsledding & Mushing Tooling"],
    summary="List winter wilderness dogsledding and mushing expedition routes",
)
async def get_dogsled_routes_endpoint(
    difficulty: Optional[str] = None,
) -> list[DogsledRouteModel]:
    return get_dogsled_routes(difficulty=difficulty)


@app.get(
    "/api/dogsledding/routes/{route_id}",
    response_model=DogsledRouteModel,
    tags=["Winter Wilderness Dogsledding & Mushing Tooling"],
    summary="Get details, distance, team size, and highlights for a dogsledding route",
)
async def get_dogsled_route_endpoint(route_id: str) -> DogsledRouteModel:
    route = get_dogsled_route_by_id(route_id)
    if not route:
        raise HTTPException(status_code=404, detail=f"Dogsled route '{route_id}' not found")
    return route


@app.post(
    "/api/dogsledding/calculate-pacing",
    response_model=MushingPacingResponse,
    tags=["Winter Wilderness Dogsledding & Mushing Tooling"],
    summary="Calculate mushing trail pacing, canine caloric burn, broth hydration, and booties",
)
async def calculate_mushing_pacing_endpoint(
    req: MushingPacingRequest,
) -> MushingPacingResponse:
    try:
        return calculate_mushing_pacing(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/dogsledding/gear",
    response_model=list[MushingGearRequirement],
    tags=["Winter Wilderness Dogsledding & Mushing Tooling"],
    summary="List mandatory winter wilderness dogsledding and expedition gear requirements",
)
async def get_dogsled_gear_endpoint() -> list[MushingGearRequirement]:
    return get_dogsled_gear()


@app.get(
    "/api/canoe-expedition/routes",
    response_model=list[CanoeRouteModel],
    tags=["Whitewater Pack-Canoeing & Open Canoe Expedition Tooling"],
    summary="List whitewater pack-canoeing and open canoe wilderness expedition routes",
)
async def get_canoe_routes_endpoint(
    whitewater_class: Optional[str] = None,
) -> list[CanoeRouteModel]:
    return get_canoe_routes(whitewater_class=whitewater_class)


@app.get(
    "/api/canoe-expedition/routes/{route_id}",
    response_model=CanoeRouteModel,
    tags=["Whitewater Pack-Canoeing & Open Canoe Expedition Tooling"],
    summary="Get details, distance, portages, and hull recommendations for a canoe route",
)
async def get_canoe_route_endpoint(route_id: str) -> CanoeRouteModel:
    route = get_canoe_route_by_id(route_id)
    if not route:
        raise HTTPException(status_code=404, detail=f"Canoe route '{route_id}' not found")
    return route


@app.post(
    "/api/canoe-expedition/calculate-trim",
    response_model=CanoeTrimResponse,
    tags=["Whitewater Pack-Canoeing & Open Canoe Expedition Tooling"],
    summary="Calculate canoe hull ballast, capacity %, gunwale freeboard, and trim balance",
)
async def calculate_canoe_trim_endpoint(
    req: CanoeTrimRequest,
) -> CanoeTrimResponse:
    try:
        return calculate_canoe_trim(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/canoe-expedition/gear",
    response_model=list[CanoeGearRequirement],
    tags=["Whitewater Pack-Canoeing & Open Canoe Expedition Tooling"],
    summary="List mandatory whitewater pack-canoeing and open boat wilderness expedition gear",
)
async def get_canoe_gear_endpoint() -> list[CanoeGearRequirement]:
    return get_canoe_gear()


@app.get(
    "/api/wilderness-shelters/shelters",
    response_model=list[SurvivalShelterModel],
    tags=["Wilderness Survival Shelters & Snow Bivouac Tooling"],
    summary="List wilderness survival shelters and snow bivouacs with optional difficulty filtering",
)
async def get_wilderness_shelters_endpoint(
    difficulty: Optional[str] = None,
) -> list[SurvivalShelterModel]:
    return get_survival_shelters(difficulty=difficulty)


@app.get(
    "/api/wilderness-shelters/shelters/{shelter_id}",
    response_model=SurvivalShelterModel,
    tags=["Wilderness Survival Shelters & Snow Bivouac Tooling"],
    summary="Get details, snow depth, R-value, and architecture for a survival shelter",
)
async def get_wilderness_shelter_endpoint(shelter_id: str) -> SurvivalShelterModel:
    shelter = get_survival_shelter_by_id(shelter_id)
    if not shelter:
        raise HTTPException(status_code=404, detail=f"Survival shelter '{shelter_id}' not found")
    return shelter


@app.post(
    "/api/wilderness-shelters/calculate-thermodynamics",
    response_model=ShelterThermodynamicsResponse,
    tags=["Wilderness Survival Shelters & Snow Bivouac Tooling"],
    summary="Calculate snow shelter interior temp, cold-air well drainage, and ventilation adequacy",
)
async def calculate_wilderness_shelter_thermodynamics_endpoint(
    req: ShelterThermodynamicsRequest,
) -> ShelterThermodynamicsResponse:
    try:
        return calculate_shelter_thermodynamics(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/wilderness-shelters/gear",
    response_model=list[ShelterGearRequirement],
    tags=["Wilderness Survival Shelters & Snow Bivouac Tooling"],
    summary="List mandatory wilderness survival shelter and snow bivouac compliance gear",
)
async def get_wilderness_shelters_gear_endpoint() -> list[ShelterGearRequirement]:
    return get_shelter_gear()


@app.get(
    "/api/glacier-navigation/zones",
    response_model=list[GlacierZoneModel],
    tags=["Glacier Crevasse Navigation & Icefall Routefinding Tooling"],
    summary="List glacier zones and icefalls with optional hazard level filtering",
)
async def get_glacier_zones_endpoint(
    hazard: Optional[str] = None,
) -> list[GlacierZoneModel]:
    return get_glacier_zones(hazard=hazard)


@app.get(
    "/api/glacier-navigation/zones/{zone_id}",
    response_model=GlacierZoneModel,
    tags=["Glacier Crevasse Navigation & Icefall Routefinding Tooling"],
    summary="Get details, crevasse pattern, ladders, and crossing duration for an icefall zone",
)
async def get_glacier_zone_endpoint(zone_id: str) -> GlacierZoneModel:
    zone = get_glacier_zone_by_id(zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail=f"Glacier zone '{zone_id}' not found")
    return zone


@app.post(
    "/api/glacier-navigation/calculate",
    response_model=CrevasseNavigationResponse,
    tags=["Glacier Crevasse Navigation & Icefall Routefinding Tooling"],
    summary="Calculate snow bridge span ratio, rope team interval, safety status, and rescue reserve",
)
async def calculate_glacier_navigation_endpoint(
    req: CrevasseNavigationRequest,
) -> CrevasseNavigationResponse:
    try:
        return calculate_crevasse_navigation(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/glacier-navigation/gear",
    response_model=list[GlacierNavigationGearRequirement],
    tags=["Glacier Crevasse Navigation & Icefall Routefinding Tooling"],
    summary="List mandatory glacier crevasse navigation and rescue kit safety requirements",
)
async def get_glacier_gear_endpoint() -> list[GlacierNavigationGearRequirement]:
    return get_glacier_navigation_gear()


@app.get(
    "/api/river-sup/runs",
    response_model=list[RiverSupRunModel],
    tags=["Whitewater Stand-Up Paddleboarding & River SUP Tooling"],
    summary="List whitewater stand-up paddleboarding runs with optional difficulty filtering",
)
async def get_river_sup_runs_endpoint(
    difficulty: Optional[str] = None,
) -> list[RiverSupRunModel]:
    return get_river_sup_runs(difficulty=difficulty)


@app.get(
    "/api/river-sup/runs/{run_id}",
    response_model=RiverSupRunModel,
    tags=["Whitewater Stand-Up Paddleboarding & River SUP Tooling"],
    summary="Get details, gradient, flow, and duration for a river SUP reach",
)
async def get_river_sup_run_endpoint(run_id: str) -> RiverSupRunModel:
    run = get_river_sup_run_by_id(run_id)
    if not run:
        raise HTTPException(status_code=404, detail=f"River SUP run '{run_id}' not found")
    return run


@app.post(
    "/api/river-sup/calculate",
    response_model=RiverSupCalculationResponse,
    tags=["Whitewater Stand-Up Paddleboarding & River SUP Tooling"],
    summary="Calculate river SUP volume ratio, buoyancy, fin clearance, and leash safety",
)
async def calculate_river_sup_endpoint(
    req: RiverSupCalculationRequest,
) -> RiverSupCalculationResponse:
    try:
        return calculate_river_sup(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/river-sup/gear",
    response_model=list[RiverSupGearRequirement],
    tags=["Whitewater Stand-Up Paddleboarding & River SUP Tooling"],
    summary="List mandatory whitewater stand-up paddleboarding safety kit items",
)
async def get_river_sup_gear_endpoint() -> list[RiverSupGearRequirement]:
    return get_river_sup_gear()


@app.get(
    "/api/wilderness-tracking/species",
    response_model=list[AnimalTrackProfileModel],
    tags=["Wilderness Tracking & Animal Sign Reading Tooling"],
    summary="List wildlife animal track profiles with optional family filtering",
)
async def get_wilderness_tracking_species_endpoint(
    family: Optional[str] = None,
) -> list[AnimalTrackProfileModel]:
    return get_animal_tracks(family=family)


@app.get(
    "/api/wilderness-tracking/species/{species_id}",
    response_model=AnimalTrackProfileModel,
    tags=["Wilderness Tracking & Animal Sign Reading Tooling"],
    summary="Get details, gait, stride, and identifying signs for an animal track species",
)
async def get_wilderness_tracking_species_detail_endpoint(
    species_id: str,
) -> AnimalTrackProfileModel:
    species = get_animal_track_by_id(species_id)
    if not species:
        raise HTTPException(
            status_code=404, detail=f"Wilderness tracking species '{species_id}' not found"
        )
    return species


@app.post(
    "/api/wilderness-tracking/calculate",
    response_model=TrackAgingCalculationResponse,
    tags=["Wilderness Tracking & Animal Sign Reading Tooling"],
    summary="Calculate track wall degradation, estimated age, gait speed, and predator alert",
)
async def calculate_track_aging_endpoint(
    req: TrackAgingCalculationRequest,
) -> TrackAgingCalculationResponse:
    try:
        return calculate_track_aging(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/wilderness-tracking/gear",
    response_model=list[TrackingGearRequirement],
    tags=["Wilderness Tracking & Animal Sign Reading Tooling"],
    summary="List mandatory wilderness tracking and spoor safety kit items",
)
async def get_wilderness_tracking_gear_endpoint() -> list[TrackingGearRequirement]:
    return get_tracking_gear()


@app.get(
    "/api/snowkiting/spots",
    response_model=list[SnowkitingSpotModel],
    tags=["Backcountry Snowkiting & Polar Kite Expeditions Tooling"],
    summary="List backcountry snowkiting spots with optional terrain filtering",
)
async def get_snowkiting_spots_endpoint(
    terrain: Optional[str] = None,
) -> list[SnowkitingSpotModel]:
    return get_snowkiting_spots(terrain=terrain)


@app.get(
    "/api/snowkiting/spots/{spot_id}",
    response_model=SnowkitingSpotModel,
    tags=["Backcountry Snowkiting & Polar Kite Expeditions Tooling"],
    summary="Get details, elevation, wind patterns, and pulk suitability for a snowkiting spot",
)
async def get_snowkiting_spot_detail_endpoint(
    spot_id: str,
) -> SnowkitingSpotModel:
    spot = get_snowkiting_spot_by_id(spot_id)
    if not spot:
        raise HTTPException(status_code=404, detail=f"Snowkiting spot '{spot_id}' not found")
    return spot


@app.post(
    "/api/snowkiting/calculate",
    response_model=SnowkitingCalculationResponse,
    tags=["Backcountry Snowkiting & Polar Kite Expeditions Tooling"],
    summary="Calculate depower foil kite sizing, power rating, glide efficiency, and storm force safety status",
)
async def calculate_snowkiting_endpoint(
    req: SnowkitingCalculationRequest,
) -> SnowkitingCalculationResponse:
    try:
        return calculate_snowkiting(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/snowkiting/gear",
    response_model=list[SnowkitingGearRequirement],
    tags=["Backcountry Snowkiting & Polar Kite Expeditions Tooling"],
    summary="List mandatory polar snowkiting and kite expedition safety kit items",
)
async def get_snowkiting_gear_endpoint() -> list[SnowkitingGearRequirement]:
    return get_snowkiting_gear()


@app.get(
    "/api/psicobloc/crags",
    response_model=list[PsicoblocCragModel],
    tags=["Deep Water Soloing & Psicobloc Tooling"],
    summary="List psicobloc crags with optional rock type filtering",
)
async def get_psicobloc_crags_endpoint(
    rock_type: Optional[str] = None,
) -> list[PsicoblocCragModel]:
    return get_psicobloc_crags(rock_type=rock_type)


@app.get(
    "/api/psicobloc/crags/{crag_id}",
    response_model=PsicoblocCragModel,
    tags=["Deep Water Soloing & Psicobloc Tooling"],
    summary="Get details, max height, rock type, water depth, and access for a psicobloc crag",
)
async def get_psicobloc_crag_detail_endpoint(
    crag_id: str,
) -> PsicoblocCragModel:
    crag = get_psicobloc_crag_by_id(crag_id)
    if not crag:
        raise HTTPException(status_code=404, detail=f"Psicobloc crag '{crag_id}' not found")
    return crag


@app.post(
    "/api/psicobloc/calculate",
    response_model=PsicoblocCalculationResponse,
    tags=["Deep Water Soloing & Psicobloc Tooling"],
    summary="Calculate impact velocity, minimum safe water depth clearance, and dive trauma safety status",
)
async def calculate_psicobloc_endpoint(
    req: PsicoblocCalculationRequest,
) -> PsicoblocCalculationResponse:
    try:
        return calculate_psicobloc(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/psicobloc/gear",
    response_model=list[PsicoblocGearRequirement],
    tags=["Deep Water Soloing & Psicobloc Tooling"],
    summary="List mandatory deep water soloing safety kit items",
)
async def get_psicobloc_gear_endpoint() -> list[PsicoblocGearRequirement]:
    return get_psicobloc_gear()


@app.get(
    "/api/big-wall/routes",
    response_model=list[BigWallRouteModel],
    tags=["Alpine Big Wall Aid Climbing & Portaledge Tooling"],
    summary="List big wall routes with optional aid rating filtering",
)
async def get_big_wall_routes_endpoint(
    aid_rating: Optional[str] = None,
) -> list[BigWallRouteModel]:
    return get_big_wall_routes(aid_rating=aid_rating)


@app.get(
    "/api/big-wall/routes/{route_id}",
    response_model=BigWallRouteModel,
    tags=["Alpine Big Wall Aid Climbing & Portaledge Tooling"],
    summary="Get details, pitches, height, aid rating, and pig weight for a big wall route",
)
async def get_big_wall_route_detail_endpoint(
    route_id: str,
) -> BigWallRouteModel:
    route = get_big_wall_route_by_id(route_id)
    if not route:
        raise HTTPException(status_code=404, detail=f"Big wall route '{route_id}' not found")
    return route


@app.post(
    "/api/big-wall/calculate",
    response_model=HaulCalculationResponse,
    tags=["Alpine Big Wall Aid Climbing & Portaledge Tooling"],
    summary="Calculate hauling mechanical advantage, effective pull force, and counterweight effort",
)
async def calculate_haul_endpoint(
    req: HaulCalculationRequest,
) -> HaulCalculationResponse:
    try:
        return calculate_haul_effort(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/big-wall/gear",
    response_model=list[BigWallGearRequirement],
    tags=["Alpine Big Wall Aid Climbing & Portaledge Tooling"],
    summary="List mandatory big wall aid climbing and portaledge safety kit items",
)
async def get_big_wall_gear_endpoint() -> list[BigWallGearRequirement]:
    return get_big_wall_gear()


@app.get(
    "/api/snowmobiling/zones",
    response_model=list[SnowmobileZoneModel],
    tags=["Backcountry Snowmobiling & Avalanche Mountain Riding Tooling"],
    summary="List mountain snowmobile zones with optional ATES rating filtering",
)
async def get_snowmobiling_zones_endpoint(
    ates_rating: Optional[str] = None,
) -> list[SnowmobileZoneModel]:
    return get_snowmobile_zones(ates_rating=ates_rating)


@app.get(
    "/api/snowmobiling/zones/{zone_id}",
    response_model=SnowmobileZoneModel,
    tags=["Backcountry Snowmobiling & Avalanche Mountain Riding Tooling"],
    summary="Get details, elevation, snowfall, ATES rating, and riding style for a snowmobile zone",
)
async def get_snowmobiling_zone_detail_endpoint(
    zone_id: str,
) -> SnowmobileZoneModel:
    zone = get_snowmobile_zone_by_id(zone_id)
    if not zone:
        raise HTTPException(status_code=404, detail=f"Snowmobile zone '{zone_id}' not found")
    return zone


@app.post(
    "/api/snowmobiling/calculate",
    response_model=SledCalculationResponse,
    tags=["Backcountry Snowmobiling & Avalanche Mountain Riding Tooling"],
    summary="Calculate mountain sled track flotation, trenching risk, elevation horsepower derating, and stability",
)
async def calculate_snowmobiling_endpoint(
    req: SledCalculationRequest,
) -> SledCalculationResponse:
    try:
        return calculate_sled_performance(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/snowmobiling/gear",
    response_model=list[SnowmobileGearRequirement],
    tags=["Backcountry Snowmobiling & Avalanche Mountain Riding Tooling"],
    summary="List mandatory avalanche and mountain sled recovery gear checklist items",
)
async def get_snowmobiling_gear_endpoint() -> list[SnowmobileGearRequirement]:
    return get_snowmobile_gear()


@app.get(
    "/api/alpine-scuba/sites",
    response_model=list[AlpineScubaSiteModel],
    tags=["Wilderness High-Altitude Scuba & Alpine Lake Ice Diving Assistant Tooling"],
    summary="List alpine scuba and ice diving lake sites with optional filtering",
)
async def get_alpine_scuba_sites_endpoint(
    overhead_condition: Optional[str] = None,
    water_type: Optional[str] = None,
) -> list[AlpineScubaSiteModel]:
    return get_alpine_scuba_sites(overhead_condition=overhead_condition, water_type=water_type)


@app.get(
    "/api/alpine-scuba/sites/{site_id}",
    response_model=AlpineScubaSiteModel,
    tags=["Wilderness High-Altitude Scuba & Alpine Lake Ice Diving Assistant Tooling"],
    summary="Get details for a high-altitude scuba or ice diving site",
)
async def get_alpine_scuba_site_detail_endpoint(
    site_id: str,
) -> AlpineScubaSiteModel:
    site = get_alpine_scuba_site_by_id(site_id)
    if not site:
        raise HTTPException(status_code=404, detail=f"Alpine scuba site '{site_id}' not found")
    return site


@app.post(
    "/api/alpine-scuba/calculate",
    response_model=ScubaCalculationResponse,
    tags=["Wilderness High-Altitude Scuba & Alpine Lake Ice Diving Assistant Tooling"],
    summary="Calculate Bühlmann Equivalent Sea Level Depth (ESLD), adjusted NDL, and regulator freeze risk",
)
async def calculate_alpine_scuba_endpoint(
    req: ScubaCalculationRequest,
) -> ScubaCalculationResponse:
    try:
        return calculate_scuba_decompression(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/alpine-scuba/gear",
    response_model=list[AlpineScubaGearRequirement],
    tags=["Wilderness High-Altitude Scuba & Alpine Lake Ice Diving Assistant Tooling"],
    summary="List mandatory cold-water and overhead ice diving safety gear checklist items",
)
async def get_alpine_scuba_gear_endpoint() -> list[AlpineScubaGearRequirement]:
    return get_alpine_scuba_gear()


@app.get(
    "/api/river-rafting/expeditions",
    response_model=list[RaftingExpeditionModel],
    tags=["Backcountry Whitewater Rafting & Oar-Frame Assistant Tooling"],
    summary="List river rafting expeditions with optional filtering",
)
async def get_river_rafting_expeditions_endpoint(
    difficulty: Optional[str] = None,
    river: Optional[str] = None,
) -> list[RaftingExpeditionModel]:
    return get_river_rafting_expeditions(difficulty=difficulty, river=river)


@app.get(
    "/api/river-rafting/expeditions/{expedition_id}",
    response_model=RaftingExpeditionModel,
    tags=["Backcountry Whitewater Rafting & Oar-Frame Assistant Tooling"],
    summary="Get details for a river rafting expedition",
)
async def get_river_rafting_expedition_detail_endpoint(
    expedition_id: str,
) -> RaftingExpeditionModel:
    expedition = get_river_rafting_expedition_by_id(expedition_id)
    if not expedition:
        raise HTTPException(
            status_code=404, detail=f"River rafting expedition '{expedition_id}' not found"
        )
    return expedition


@app.post(
    "/api/river-rafting/calculate",
    response_model=RaftCalculationResponse,
    tags=["Backcountry Whitewater Rafting & Oar-Frame Assistant Tooling"],
    summary="Calculate oar frame leverage ratio, hydraulic hole punch momentum, and back ferry efficiency",
)
async def calculate_river_rafting_endpoint(
    req: RaftCalculationRequest,
) -> RaftCalculationResponse:
    try:
        return calculate_river_rafting(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/river-rafting/gear",
    response_model=list[RaftingGearRequirement],
    tags=["Backcountry Whitewater Rafting & Oar-Frame Assistant Tooling"],
    summary="List mandatory multi-day river rafting and oar frame safety gear checklist items",
)
async def get_river_rafting_gear_endpoint() -> list[RaftingGearRequirement]:
    return get_river_rafting_gear()


@app.get(
    "/api/steep-skiing/couloirs",
    response_model=list[CouloirDescentModel],
    tags=["Alpine Ski Mountaineering & Steep Couloir Assistant Tooling"],
    summary="List steep couloir descents with optional grade filtering",
)
async def get_steep_skiing_couloirs_endpoint(
    grade: Optional[str] = None,
) -> list[CouloirDescentModel]:
    return get_couloir_descents(grade=grade)


@app.get(
    "/api/steep-skiing/couloirs/{couloir_id}",
    response_model=CouloirDescentModel,
    tags=["Alpine Ski Mountaineering & Steep Couloir Assistant Tooling"],
    summary="Get details for an iconic couloir descent",
)
async def get_steep_skiing_couloir_detail_endpoint(
    couloir_id: str,
) -> CouloirDescentModel:
    couloir = get_couloir_descent_by_id(couloir_id)
    if not couloir:
        raise HTTPException(status_code=404, detail=f"Couloir '{couloir_id}' not found")
    return couloir


@app.post(
    "/api/steep-skiing/calculate",
    response_model=CouloirCalculationResponse,
    tags=["Alpine Ski Mountaineering & Steep Couloir Assistant Tooling"],
    summary="Calculate couloir slope kinematics, sluff velocity, hop-turn edge loading, and descent style",
)
async def calculate_steep_skiing_endpoint(
    req: CouloirCalculationRequest,
) -> CouloirCalculationResponse:
    try:
        return calculate_couloir_dynamics(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/api/steep-skiing/gear",
    response_model=list[SteepSkiingGearRequirement],
    tags=["Alpine Ski Mountaineering & Steep Couloir Assistant Tooling"],
    summary="List mandatory steep skiing and alpine ski mountaineering gear items",
)
async def get_steep_skiing_gear_endpoint() -> list[SteepSkiingGearRequirement]:
    return get_steep_skiing_gear()


@app.get(
    "/trail-packing/routes",
    response_model=list[PackRouteModel],
    tags=["Wilderness Equestrian Trail Packing & Horse Packing Expeditions Tooling"],
    summary="List wilderness equestrian pack routes with optional saddle type filtering",
)
@app.get(
    "/api/trail-packing/routes",
    response_model=list[PackRouteModel],
    tags=["Wilderness Equestrian Trail Packing & Horse Packing Expeditions Tooling"],
    summary="List wilderness equestrian pack routes with optional saddle type filtering",
)
async def get_trail_packing_routes_endpoint(
    saddle_type: Optional[str] = None,
) -> list[PackRouteModel]:
    return get_pack_routes(saddle_type=saddle_type)


@app.get(
    "/trail-packing/routes/{route_id}",
    response_model=PackRouteModel,
    tags=["Wilderness Equestrian Trail Packing & Horse Packing Expeditions Tooling"],
    summary="Get details for an iconic wilderness equestrian pack route",
)
@app.get(
    "/api/trail-packing/routes/{route_id}",
    response_model=PackRouteModel,
    tags=["Wilderness Equestrian Trail Packing & Horse Packing Expeditions Tooling"],
    summary="Get details for an iconic wilderness equestrian pack route",
)
async def get_trail_packing_route_detail_endpoint(
    route_id: str,
) -> PackRouteModel:
    route = get_pack_route(route_id)
    if not route:
        raise HTTPException(status_code=404, detail=f"Pack route '{route_id}' not found")
    return route


@app.post(
    "/trail-packing/calculate",
    response_model=TrailPackingResponse,
    tags=["Wilderness Equestrian Trail Packing & Horse Packing Expeditions Tooling"],
    summary="Calculate pannier payload weight balancing, capacity status, and hitch adjustments",
)
@app.post(
    "/api/trail-packing/calculate",
    response_model=TrailPackingResponse,
    tags=["Wilderness Equestrian Trail Packing & Horse Packing Expeditions Tooling"],
    summary="Calculate pannier payload weight balancing, capacity status, and hitch adjustments",
)
async def calculate_trail_packing_endpoint(
    req: TrailPackingRequest,
) -> TrailPackingResponse:
    try:
        return calculate_trail_packing(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/trail-packing/gear",
    response_model=list[TackChecklistItemModel],
    tags=["Wilderness Equestrian Trail Packing & Horse Packing Expeditions Tooling"],
    summary="List mandatory tack and highline picket Leave No Trace gear checklist items",
)
@app.get(
    "/api/trail-packing/gear",
    response_model=list[TackChecklistItemModel],
    tags=["Wilderness Equestrian Trail Packing & Horse Packing Expeditions Tooling"],
    summary="List mandatory tack and highline picket Leave No Trace gear checklist items",
)
async def get_trail_packing_gear_endpoint() -> list[TackChecklistItemModel]:
    return get_tack_checklist()


@app.get(
    "/primitive-trapping/mechanisms",
    response_model=list[TrappingMechanismModel],
    tags=["Wilderness Bushcraft Primitive Trapping & Deadfall Tooling"],
    summary="List primitive trapping mechanisms with optional category filtering",
)
@app.get(
    "/api/primitive-trapping/mechanisms",
    response_model=list[TrappingMechanismModel],
    tags=["Wilderness Bushcraft Primitive Trapping & Deadfall Tooling"],
    summary="List primitive trapping mechanisms with optional category filtering",
)
async def get_primitive_trapping_mechanisms_endpoint(
    category: Optional[str] = None,
) -> list[TrappingMechanismModel]:
    return get_trapping_mechanisms(category=category)


@app.get(
    "/primitive-trapping/mechanisms/{mechanism_id}",
    response_model=TrappingMechanismModel,
    tags=["Wilderness Bushcraft Primitive Trapping & Deadfall Tooling"],
    summary="Get details for a primitive trapping mechanism",
)
@app.get(
    "/api/primitive-trapping/mechanisms/{mechanism_id}",
    response_model=TrappingMechanismModel,
    tags=["Wilderness Bushcraft Primitive Trapping & Deadfall Tooling"],
    summary="Get details for a primitive trapping mechanism",
)
async def get_primitive_trapping_mechanism_detail_endpoint(
    mechanism_id: str,
) -> TrappingMechanismModel:
    mech = get_trapping_mechanism(mechanism_id)
    if not mech:
        raise HTTPException(
            status_code=404, detail=f"Primitive trapping mechanism '{mechanism_id}' not found"
        )
    return mech


@app.post(
    "/primitive-trapping/calculate",
    response_model=TrappingCalculationResponse,
    tags=["Wilderness Bushcraft Primitive Trapping & Deadfall Tooling"],
    summary="Calculate deadfall weight-to-quarry ratio, lethality, sensitivity, and trip force",
)
@app.post(
    "/api/primitive-trapping/calculate",
    response_model=TrappingCalculationResponse,
    tags=["Wilderness Bushcraft Primitive Trapping & Deadfall Tooling"],
    summary="Calculate deadfall weight-to-quarry ratio, lethality, sensitivity, and trip force",
)
async def calculate_primitive_trapping_endpoint(
    req: TrappingCalculationRequest,
) -> TrappingCalculationResponse:
    try:
        return calculate_primitive_trapping(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/primitive-trapping/gear",
    response_model=list[TrappingSafetyItemModel],
    tags=["Wilderness Bushcraft Primitive Trapping & Deadfall Tooling"],
    summary="List mandatory wilderness trapping and practice safety kit items",
)
@app.get(
    "/api/primitive-trapping/gear",
    response_model=list[TrappingSafetyItemModel],
    tags=["Wilderness Bushcraft Primitive Trapping & Deadfall Tooling"],
    summary="List mandatory wilderness trapping and practice safety kit items",
)
async def get_primitive_trapping_gear_endpoint() -> list[TrappingSafetyItemModel]:
    return get_trapping_safety_gear()


@app.get(
    "/mountain-weather/sectors",
    response_model=list[WeatherSectorModel],
    tags=["High-Altitude Mountain Weather Routing & Synoptic Jet Stream Tooling"],
    summary="List high-altitude mountain weather sectors with optional synoptic level filtering",
)
@app.get(
    "/api/mountain-weather/sectors",
    response_model=list[WeatherSectorModel],
    tags=["High-Altitude Mountain Weather Routing & Synoptic Jet Stream Tooling"],
    summary="List high-altitude mountain weather sectors with optional synoptic level filtering",
)
async def get_mountain_weather_sectors_endpoint(
    synoptic_level: Optional[str] = None,
) -> list[WeatherSectorModel]:
    return get_weather_sectors(synoptic_level=synoptic_level)


@app.get(
    "/mountain-weather/sectors/{sector_id}",
    response_model=WeatherSectorModel,
    tags=["High-Altitude Mountain Weather Routing & Synoptic Jet Stream Tooling"],
    summary="Get details for an iconic high-altitude mountain weather sector",
)
@app.get(
    "/api/mountain-weather/sectors/{sector_id}",
    response_model=WeatherSectorModel,
    tags=["High-Altitude Mountain Weather Routing & Synoptic Jet Stream Tooling"],
    summary="Get details for an iconic high-altitude mountain weather sector",
)
async def get_mountain_weather_sector_detail_endpoint(
    sector_id: str,
) -> WeatherSectorModel:
    sector = get_weather_sector(sector_id)
    if not sector:
        raise HTTPException(status_code=404, detail=f"Mountain weather sector '{sector_id}' not found")
    return sector


@app.post(
    "/mountain-weather/calculate",
    response_model=MountainWeatherResponse,
    tags=["High-Altitude Mountain Weather Routing & Synoptic Jet Stream Tooling"],
    summary="Calculate summit venturi winds, wind chill, barometric trends, and summit window advisories",
)
@app.post(
    "/api/mountain-weather/calculate",
    response_model=MountainWeatherResponse,
    tags=["High-Altitude Mountain Weather Routing & Synoptic Jet Stream Tooling"],
    summary="Calculate summit venturi winds, wind chill, barometric trends, and summit window advisories",
)
async def calculate_mountain_weather_endpoint(
    req: MountainWeatherRequest,
) -> MountainWeatherResponse:
    try:
        return calculate_mountain_weather(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/mountain-weather/gear",
    response_model=list[WeatherGearItemModel],
    tags=["High-Altitude Mountain Weather Routing & Synoptic Jet Stream Tooling"],
    summary="List mandatory high-altitude mountain weather and synoptic forecasting gear checklist items",
)
@app.get(
    "/api/mountain-weather/gear",
    response_model=list[WeatherGearItemModel],
    tags=["High-Altitude Mountain Weather Routing & Synoptic Jet Stream Tooling"],
    summary="List mandatory high-altitude mountain weather and synoptic forecasting gear checklist items",
)
async def get_mountain_weather_gear_endpoint() -> list[WeatherGearItemModel]:
    return get_weather_gear()


@app.get(
    "/wild-ice/venues",
    response_model=list[WildIceVenueModel],
    tags=["Backcountry Nordic Speedskating & Wild Ice Tooling"],
    summary="List wild ice touring circuits with optional ice_type filtering",
)
@app.get(
    "/api/wild-ice/venues",
    response_model=list[WildIceVenueModel],
    tags=["Backcountry Nordic Speedskating & Wild Ice Tooling"],
    summary="List wild ice touring circuits with optional ice_type filtering",
)
async def get_wild_ice_venues_endpoint(
    ice_type: Optional[str] = None,
) -> list[WildIceVenueModel]:
    return get_wild_ice_venues(ice_type=ice_type)


@app.get(
    "/wild-ice/venues/{venue_id}",
    response_model=WildIceVenueModel,
    tags=["Backcountry Nordic Speedskating & Wild Ice Tooling"],
    summary="Get details for an iconic wild ice touring venue",
)
@app.get(
    "/api/wild-ice/venues/{venue_id}",
    response_model=WildIceVenueModel,
    tags=["Backcountry Nordic Speedskating & Wild Ice Tooling"],
    summary="Get details for an iconic wild ice touring venue",
)
async def get_wild_ice_venue_detail_endpoint(
    venue_id: str,
) -> WildIceVenueModel:
    venue = get_wild_ice_venue(venue_id)
    if not venue:
        raise HTTPException(
            status_code=404,
            detail=f"Wild ice venue '{venue_id}' not found",
        )
    return venue


@app.post(
    "/wild-ice/calculate",
    response_model=WildIceResponse,
    tags=["Backcountry Nordic Speedskating & Wild Ice Tooling"],
    summary=(
        "Calculate ice bearing capacity (Gold's formula), acoustic resonance,"
        " and safety status"
    ),
)
@app.post(
    "/api/wild-ice/calculate",
    response_model=WildIceResponse,
    tags=["Backcountry Nordic Speedskating & Wild Ice Tooling"],
    summary=(
        "Calculate ice bearing capacity (Gold's formula), acoustic resonance,"
        " and safety status"
    ),
)
async def calculate_wild_ice_endpoint(
    req: WildIceRequest,
) -> WildIceResponse:
    try:
        return calculate_wild_ice(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/wild-ice/gear",
    response_model=list[WildIceGearItemModel],
    tags=["Backcountry Nordic Speedskating & Wild Ice Tooling"],
    summary="List mandatory backcountry Nordic speedskating safety kit items",
)
@app.get(
    "/api/wild-ice/gear",
    response_model=list[WildIceGearItemModel],
    tags=["Backcountry Nordic Speedskating & Wild Ice Tooling"],
    summary="List mandatory backcountry Nordic speedskating safety kit items",
)
async def get_wild_ice_gear_endpoint() -> list[WildIceGearItemModel]:
    return get_wild_ice_gear()


@app.get(
    "/tree-climbing/groves",
    response_model=list[CanopyGroveModel],
    tags=["Backcountry Tree Climbing & Arboreal Canopy Tooling"],
    summary="List expedition canopy groves with optional climbing_system filtering",
)
@app.get(
    "/api/tree-climbing/groves",
    response_model=list[CanopyGroveModel],
    tags=["Backcountry Tree Climbing & Arboreal Canopy Tooling"],
    summary="List expedition canopy groves with optional climbing_system filtering",
)
async def get_canopy_groves_endpoint(
    climbing_system: Optional[str] = None,
) -> list[CanopyGroveModel]:
    return get_canopy_groves(climbing_system=climbing_system)


@app.get(
    "/tree-climbing/groves/{grove_id}",
    response_model=CanopyGroveModel,
    tags=["Backcountry Tree Climbing & Arboreal Canopy Tooling"],
    summary="Get details for an iconic canopy expedition grove",
)
@app.get(
    "/api/tree-climbing/groves/{grove_id}",
    response_model=CanopyGroveModel,
    tags=["Backcountry Tree Climbing & Arboreal Canopy Tooling"],
    summary="Get details for an iconic canopy expedition grove",
)
async def get_canopy_grove_detail_endpoint(
    grove_id: str,
) -> CanopyGroveModel:
    grove = get_canopy_grove(grove_id)
    if not grove:
        raise HTTPException(
            status_code=404,
            detail=f"Canopy grove '{grove_id}' not found",
        )
    return grove


@app.post(
    "/tree-climbing/calculate",
    response_model=TreeClimbingResponse,
    tags=["Backcountry Tree Climbing & Arboreal Canopy Tooling"],
    summary=(
        "Calculate tree climbing peak fork loads, limb safety ratios, and arborist advisory"
    ),
)
@app.post(
    "/api/tree-climbing/calculate",
    response_model=TreeClimbingResponse,
    tags=["Backcountry Tree Climbing & Arboreal Canopy Tooling"],
    summary=(
        "Calculate tree climbing peak fork loads, limb safety ratios, and arborist advisory"
    ),
)
async def calculate_tree_climbing_endpoint(
    req: TreeClimbingRequest,
) -> TreeClimbingResponse:
    try:
        return calculate_tree_climbing(req)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get(
    "/tree-climbing/gear",
    response_model=list[TreeGearItemModel],
    tags=["Backcountry Tree Climbing & Arboreal Canopy Tooling"],
    summary="List mandatory backcountry tree climbing and canopy safety kit items",
)
@app.get(
    "/api/tree-climbing/gear",
    response_model=list[TreeGearItemModel],
    tags=["Backcountry Tree Climbing & Arboreal Canopy Tooling"],
    summary="List mandatory backcountry tree climbing and canopy safety kit items",
)
async def get_tree_gear_endpoint() -> list[TreeGearItemModel]:
    return get_tree_gear()
