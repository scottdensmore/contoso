import json
import logging
import os
import time
from pathlib import Path
from typing import Any, Optional

from contoso_chat.carrier_tracking import (
    CarrierTrackingInfo,
    detect_carrier_tracking_intent,
    lookup_carrier_tracking,
)
from contoso_chat.feedback import (
    FeedbackRequest,
    FeedbackResponse,
    get_feedback_summary,
    record_feedback,
)
from contoso_chat.order_tracking import detect_order_tracking_intent
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
from contoso_chat.session_store import (
    ChatSession,
    append_message,
    create_or_get_session,
    delete_session,
    get_history_for_llm,
    get_session,
    list_sessions,
)
from contoso_chat.stores import (
    detect_store_intent,
    get_all_stores,
    get_store_by_id,
    search_stores,
)
from contoso_chat.transcript_export import export_transcript
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
            if policy_intent.get("is_policy_query") and policy_intent.get("matched_policy"):
                mock_payload["policy"] = policy_intent["matched_policy"]
                p_obj = policy_intent["matched_policy"]
                mock_payload["answer"] = (
                    f"Mock response: Regarding our {p_obj.get('title', 'policy')}: "
                    f"{p_obj.get('details', p_obj.get('summary', ''))}"
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
                captured_citations = MOCK_CITATIONS
                yield f"data: {json.dumps({'event': 'citations', 'citations': MOCK_CITATIONS})}\n\n"
                yield f"data: {json.dumps({'event': 'handoff', 'handoff': handoff})}\n\n"
                yield f"data: {json.dumps({'event': 'profile', 'profile': {'membership': 'Gold', 'past_purchases_count': 2}})}\n\n"
                captured_carrier_tracking: Optional[dict[str, Any]] = None
                if carrier_intent.get("is_carrier_intent"):
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
                if policy_intent.get("is_policy_query") and policy_intent.get("matched_policy"):
                    yield f"data: {json.dumps({'event': 'policy', 'policy': policy_intent['matched_policy']})}\n\n"
                if store_intent.get("is_store_query") and store_intent.get("matched_stores"):
                    yield f"data: {json.dumps({'event': 'stores', 'stores': store_intent['matched_stores']})}\n\n"
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
