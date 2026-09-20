import json
import logging
import os
import time
from pathlib import Path
from typing import Any, Optional

from contoso_chat.adventures import (
    AdventureGuideInfo,
    AdventureTourInfo,
    detect_adventure_intent,
    format_adventure_response,
    get_adventure_guides,
    get_adventure_tours,
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
from contoso_chat.carrier_tracking import (
    CarrierTrackingInfo,
    detect_carrier_tracking_intent,
    lookup_carrier_tracking,
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
from contoso_chat.order_tracking import detect_order_tracking_intent
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
from contoso_chat.promotions import (
    detect_promo_intent,
    get_active_promotions,
    validate_promo_code,
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
from contoso_chat.trip_planner import (
    TripPlanParametersModel,
    TripPlanResultModel,
    detect_trip_planner_intent,
    format_trip_planner_response,
    generate_wilderness_trip_plan,
    get_trip_templates,
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
MOCK_CARRIER_TRACKING = (
    _DEFAULT_CARRIER_INFO.model_dump() if _DEFAULT_CARRIER_INFO else {}
)

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
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Contoso Chat", version="1.0.0")

# Middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()

    # Log request details (filter sensitive headers)
    _sensitive_headers = {"authorization", "cookie", "x-api-key", "x-auth-token"}
    filtered_headers = {k: v for k, v in request.headers.items()
                        if k.lower() not in _sensitive_headers}
    logger.info(
        "Request started",
        extra={
            "method": request.method,
            "url": str(request.url),
            "headers": filtered_headers,
            "client_ip": request.client.host if request.client else None
        }
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
            "client_ip": request.client.host if request.client else None
        }
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
        "real_chat": REAL_CHAT_AVAILABLE
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
async def create_response(request: ChatRequest):
    logger.info(
        "Chat request received",
        extra={
            "customer_id": request.customer_id,
            "session_id": request.session_id,
            "question_length": len(request.question),
            "has_chat_history": len(str(request.chat_history or "")) > 2,
            "real_chat_available": REAL_CHAT_AVAILABLE
        }
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
                    "success": True
                }
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
            if policy_intent.get("is_policy_query") and policy_intent.get("matched_policy") and not return_intent:
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
            if trail_intent and not field_reports_intent and not trip_planner_intent and not route_intent:
                formatted_trail = format_trail_response(trail_intent)
                mock_payload["trail_outfitting"] = formatted_trail.get("trail_outfitting")
                mock_payload["answer"] = formatted_trail.get("answer", mock_payload["answer"])
            if rewards_intent:
                rewards_loyalty = get_customer_loyalty(rewards_intent.customer_id or request.customer_id)
                formatted_rewards = format_rewards_response(rewards_intent, rewards_loyalty)
                mock_payload["rewards_info"] = formatted_rewards.get("rewards_info")
                mock_payload["answer"] = formatted_rewards.get("answer", mock_payload["answer"])
            if permits_intent and not adventure_intent and not field_reports_intent and not shuttle_intent and not hut_intent and not volunteer_intent and not water_intent and not route_intent and not fire_safety_intent and not first_aid_intent and not lnt_intent and not avalanche_intent:
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
                mock_payload["field_reports_info"] = formatted_field_reports.get("field_reports_info")
                mock_payload["answer"] = formatted_field_reports.get("answer", mock_payload["answer"])
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
                if not (trail_intent or adventure_intent or shuttle_intent or permits_intent or safety_intent):
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
                "error_type": type(e).__name__
            },
            exc_info=True
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
            if chat_history is None or chat_history == "" or chat_history == "[]" or chat_history == []:
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
                        except (json.JSONDecodeError, TypeError):
                            pass
                        yield chunk
                    else:
                        accumulated_chunks.append(chunk)
                        yield f"data: {json.dumps({'chunk': chunk})}\n\n"
            else:
                logger.warning(
                    "Using mock streaming response - real chat logic not available"
                )
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
                    mock_chunks = [
                        str(formatted_return.get("answer", ""))
                    ]
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
                if policy_intent.get("is_policy_query") and policy_intent.get("matched_policy") and not return_intent:
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
                    rewards_loyalty = get_customer_loyalty(rewards_intent.customer_id or request.customer_id)
                    formatted_rewards = format_rewards_response(rewards_intent, rewards_loyalty)
                    yield f"data: {json.dumps({'event': 'rewards_info', 'rewards_info': formatted_rewards.get('rewards_info')})}\n\n"
                if permits_intent and not adventure_intent and not field_reports_intent and not shuttle_intent and not hut_intent and not volunteer_intent and not water_intent and not route_intent and not fire_safety_intent and not first_aid_intent and not lnt_intent and not avalanche_intent:
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
                    rewards_loyalty = get_customer_loyalty(rewards_intent.customer_id or request.customer_id)
                    formatted_rewards = format_rewards_response(rewards_intent, rewards_loyalty)
                    mock_chunks = [
                        str(formatted_rewards.get("answer", ""))
                    ]
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
                    mock_chunks = [
                        str(formatted_rental.get("answer", ""))
                    ]
                elif ski_tour_intent:
                    formatted_tour = format_ski_tour_response(ski_tour_intent)
                    mock_chunks = [
                        str(formatted_tour.get("answer", ""))
                    ]
                elif climbing_intent and not adventure_intent:
                    formatted_climbing = format_climbing_response(climbing_intent)
                    mock_chunks = [
                        str(formatted_climbing.get("answer", ""))
                    ]
                elif foraging_intent:
                    formatted_foraging = format_foraging_response(foraging_intent)
                    mock_chunks = [
                        str(formatted_foraging.get("answer", ""))
                    ]
                elif weather_intent and not (trail_intent or adventure_intent or shuttle_intent or permits_intent or safety_intent):
                    formatted_weather = format_weather_response(weather_intent)
                    mock_chunks = [
                        str(formatted_weather.get("answer", ""))
                    ]
                elif avalanche_intent:
                    formatted_avy = format_avalanche_response(avalanche_intent)
                    mock_chunks = [
                        str(formatted_avy.get("answer", ""))
                    ]
                elif field_reports_intent:
                    formatted_field_reports = format_field_reports_response(field_reports_intent)
                    mock_chunks = [
                        str(formatted_field_reports.get("answer", ""))
                    ]
                elif route_intent and not shuttle_intent:
                    formatted_route = format_route_response(route_intent)
                    mock_chunks = [
                        str(formatted_route.get("answer", ""))
                    ]
                elif fire_safety_intent:
                    formatted_fire = format_fire_safety_response(fire_safety_intent)
                    mock_chunks = [
                        str(formatted_fire.get("answer", ""))
                    ]
                elif first_aid_intent:
                    formatted_first_aid = format_first_aid_response(first_aid_intent)
                    mock_chunks = [
                        str(formatted_first_aid.get("answer", ""))
                    ]
                elif lnt_intent:
                    formatted_lnt = format_lnt_response(lnt_intent)
                    mock_chunks = [
                        str(formatted_lnt.get("answer", ""))
                    ]
                elif trail_intent:
                    formatted_trail = format_trail_response(trail_intent)
                    mock_chunks = [
                        str(formatted_trail.get("answer", ""))
                    ]
                elif adventure_intent:
                    formatted_adventure = format_adventure_response(adventure_intent)
                    mock_chunks = [
                        str(formatted_adventure.get("answer", ""))
                    ]
                elif permits_intent and not shuttle_intent and not hut_intent and not volunteer_intent and not water_intent and not route_intent and not fire_safety_intent and not first_aid_intent and not lnt_intent and not avalanche_intent:
                    formatted_permits = format_permits_response(permits_intent)
                    mock_chunks = [
                        str(formatted_permits.get("answer", ""))
                    ]
                elif repair_intent:
                    formatted_repair = format_repair_response(repair_intent)
                    mock_chunks = [
                        str(formatted_repair.get("answer", ""))
                    ]
                elif trade_in_intent:
                    formatted_trade_in = format_trade_in_response(trade_in_intent)
                    mock_chunks = [
                        str(formatted_trade_in.get("answer", ""))
                    ]
                elif trip_planner_intent:
                    formatted_trip = format_trip_planner_response(trip_planner_intent)
                    mock_chunks = [
                        str(formatted_trip.get("answer", ""))
                    ]
                elif safety_intent:
                    formatted_safety = format_safety_response(safety_intent)
                    mock_chunks = [
                        str(formatted_safety.get("answer", ""))
                    ]
                elif shuttle_intent:
                    formatted_shuttle = format_shuttle_response(shuttle_intent)
                    mock_chunks = [
                        str(formatted_shuttle.get("answer", ""))
                    ]
                elif hut_intent:
                    formatted_hut = format_hut_response(hut_intent)
                    mock_chunks = [
                        str(formatted_hut.get("answer", ""))
                    ]
                elif volunteer_intent:
                    formatted_vol = format_volunteer_response(volunteer_intent)
                    mock_chunks = [
                        str(formatted_vol.get("answer", ""))
                    ]
                elif water_intent:
                    formatted_water = format_water_response(water_intent)
                    mock_chunks = [
                        str(formatted_water.get("answer", ""))
                    ]
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
    logger.info("Repair diagnosis requested", extra={"issue": request.issue, "gear_type": request.gear_type})
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
    logger.info("Shuttle routes requested", extra={"region": region, "connector_only": connector_only})
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
    logger.info("Shuttle fare quote requested", extra={"route_id": request.route_id, "seats": request.seats})
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
    logger.info("Shuttle seat booking requested", extra={"route_id": request.route_id, "seats": request.seats})
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
    logger.info("New community carpool offer submitted", extra={"origin": request.origin_city, "dest": request.destination_trailhead})
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
    logger.info("Alpine hut quote requested", extra={"hut_id": request.hut_id, "range_name": request.range_name})
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
    logger.info("Alpine hut booking submitted", extra={"hut_id": request.hut_id, "guest_name": request.guest_name})
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
    logger.info("Volunteer workparties requested", extra={"region": region, "difficulty": difficulty})
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
    logger.info("Volunteer registration submitted", extra={"project_id": request.project_id, "volunteer": request.volunteer_name})
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
    logger.info("Hydration estimate requested", extra={"distance": request.distance_miles, "elevation": request.elevation_gain_feet})
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
    logger.info("Water report submitted", extra={"source_id": request.source_id, "reporter": request.reporter_name})
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
