import logging
import os
import time
from pathlib import Path
from typing import Any, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict

# Import our real chat logic (simplified)
try:
    from contoso_chat.chat_request import get_response
    REAL_CHAT_AVAILABLE = True
except ImportError:
    REAL_CHAT_AVAILABLE = False
    print("Warning: Real chat logic not available, using mock response")

base = Path(__file__).resolve().parent
load_dotenv()

# Configure structured logging for Cloud Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
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
_allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)


# Request model
class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    question: str
    customer_id: Optional[str] = None
    chat_history: Optional[Any] = "[]"

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

@app.post("/api/create_response")
async def create_response(request: ChatRequest):
    logger.info(
        "Chat request received",
        extra={
            "customer_id": request.customer_id,
            "question_length": len(request.question),
            "has_chat_history": len(str(request.chat_history or "")) > 2,
            "real_chat_available": REAL_CHAT_AVAILABLE
        }
    )

    try:
        if REAL_CHAT_AVAILABLE:
            # Use real chat logic
            logger.info("Processing request with real chat logic")
            result = await get_response(request.customer_id, request.question, request.chat_history)

            logger.info(
                "Chat response generated",
                extra={
                    "customer_id": request.customer_id,
                    "response_length": len(result.get("answer", "")),
                    "context_items": len(result.get("context", [])),
                    "success": True
                }
            )
            return result
        else:
            # Mock response for testing
            logger.warning("Using mock response - real chat logic not available")
            return {
                "answer": f"Mock response: You asked about '{request.question}'. This is a test response from Contoso Chat running on Google Cloud Platform!",
                "customer_id": request.customer_id,
                "chat_history": request.chat_history,
                "mock": True
            }
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
        return {
            "answer": f"I'm having trouble processing your request about '{request.question}' right now. Please try again later.",
            "customer_id": request.customer_id,
            "chat_history": request.chat_history,
            "error": str(e),
            "fallback": True
        }
