import logging
import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, field_validator, model_validator

logger = logging.getLogger(__name__)


class FeedbackType(str, Enum):
    THUMBS_UP = "thumbs_up"
    THUMBS_DOWN = "thumbs_down"
    STARS = "stars"


class FeedbackRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    turn_id: Optional[str] = None
    customer_id: Optional[str] = None
    question: Optional[str] = None
    answer: Optional[str] = None
    feedback_type: FeedbackType
    rating: Optional[int] = None  # 1 to 5 for stars, or 1 / -1
    comment: Optional[str] = None
    tags: Optional[list[str]] = None

    @field_validator("rating", mode="before")
    @classmethod
    def reject_boolean_rating(cls, v: Any) -> Any:
        if isinstance(v, bool):
            raise ValueError("Rating must be an integer, not a boolean")
        return v

    @model_validator(mode="after")
    def validate_rating(self) -> "FeedbackRequest":
        if self.feedback_type == FeedbackType.STARS:
            if self.rating is None:
                raise ValueError("Rating is required for stars feedback")
            if not (1 <= self.rating <= 5):
                raise ValueError("Rating for stars must be between 1 and 5")
        elif self.feedback_type == FeedbackType.THUMBS_UP:
            if self.rating is None:
                self.rating = 1
            elif self.rating != 1:
                raise ValueError("Rating for thumbs_up must be 1")
        elif self.feedback_type == FeedbackType.THUMBS_DOWN:
            if self.rating is None:
                self.rating = -1
            elif self.rating != -1:
                raise ValueError("Rating for thumbs_down must be -1")
        return self


class FeedbackResponse(BaseModel):
    status: str = "success"
    feedback_id: str
    created_at: str
    message: str = "Feedback recorded successfully"


_FEEDBACK_STORE: list[dict[str, Any]] = []


def record_feedback(feedback: FeedbackRequest) -> FeedbackResponse:
    """Record a feedback submission, log a structured event, and return a response."""
    feedback_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()

    entry = {
        "feedback_id": feedback_id,
        "created_at": created_at,
        "turn_id": feedback.turn_id,
        "customer_id": feedback.customer_id,
        "question": feedback.question,
        "answer": feedback.answer,
        "feedback_type": feedback.feedback_type.value,
        "rating": feedback.rating,
        "comment": feedback.comment,
        "tags": list(feedback.tags) if feedback.tags else [],
    }
    _FEEDBACK_STORE.append(entry)

    logger.info(
        "Chat feedback received",
        extra={
            "feedback_id": feedback_id,
            "turn_id": feedback.turn_id,
            "customer_id": feedback.customer_id,
            "feedback_type": feedback.feedback_type.value,
            "rating": feedback.rating,
            "has_comment": bool(feedback.comment),
            "tags": feedback.tags or [],
        },
    )

    return FeedbackResponse(
        status="success",
        feedback_id=feedback_id,
        created_at=created_at,
        message="Feedback recorded successfully",
    )


def get_feedback_summary() -> dict[str, Any]:
    """Calculate and return aggregated feedback metrics."""
    total_count = len(_FEEDBACK_STORE)
    thumbs_up_count = sum(
        1 for item in _FEEDBACK_STORE if item.get("feedback_type") == FeedbackType.THUMBS_UP.value
    )
    thumbs_down_count = sum(
        1 for item in _FEEDBACK_STORE if item.get("feedback_type") == FeedbackType.THUMBS_DOWN.value
    )
    star_ratings = [
        item["rating"]
        for item in _FEEDBACK_STORE
        if item.get("feedback_type") == FeedbackType.STARS.value and item.get("rating") is not None
    ]
    average_star_rating = (
        round(sum(star_ratings) / len(star_ratings), 2) if star_ratings else None
    )

    tags_distribution: dict[str, int] = {}
    for item in _FEEDBACK_STORE:
        tags = item.get("tags") or []
        for tag in tags:
            tags_distribution[tag] = tags_distribution.get(tag, 0) + 1

    return {
        "total_count": total_count,
        "thumbs_up_count": thumbs_up_count,
        "thumbs_down_count": thumbs_down_count,
        "average_star_rating": average_star_rating,
        "tags_distribution": tags_distribution,
    }


def clear_feedback_store() -> None:
    """Clear in-memory feedback store (primarily for test isolation)."""
    _FEEDBACK_STORE.clear()
