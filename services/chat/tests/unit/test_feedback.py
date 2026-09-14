import logging
import uuid

import pytest
from contoso_chat.feedback import (
    FeedbackRequest,
    FeedbackResponse,
    FeedbackType,
    clear_feedback_store,
    get_feedback_summary,
    record_feedback,
)
from pydantic import ValidationError


@pytest.fixture(autouse=True)
def clean_feedback_store():
    """Ensure every test starts with an empty feedback store."""
    clear_feedback_store()
    yield
    clear_feedback_store()


class TestFeedbackModelValidation:
    def test_feedback_type_enum(self):
        assert FeedbackType.THUMBS_UP.value == "thumbs_up"
        assert FeedbackType.THUMBS_DOWN.value == "thumbs_down"
        assert FeedbackType.STARS.value == "stars"

    def test_stars_valid_ratings(self):
        for rating in [1, 2, 3, 4, 5]:
            req = FeedbackRequest(feedback_type=FeedbackType.STARS, rating=rating)
            assert req.rating == rating
            assert req.feedback_type == FeedbackType.STARS

    @pytest.mark.parametrize("invalid_rating", [0, 6, -1, 10])
    def test_stars_invalid_rating_bounds(self, invalid_rating):
        with pytest.raises(ValidationError) as exc_info:
            FeedbackRequest(feedback_type=FeedbackType.STARS, rating=invalid_rating)
        assert "rating" in str(exc_info.value).lower()

    def test_stars_missing_rating(self):
        with pytest.raises(ValidationError) as exc_info:
            FeedbackRequest(feedback_type=FeedbackType.STARS)
        assert "rating" in str(exc_info.value).lower()

    @pytest.mark.parametrize("bool_val", [True, False])
    def test_stars_boolean_rating_rejected(self, bool_val):
        with pytest.raises(ValidationError) as exc_info:
            FeedbackRequest(feedback_type=FeedbackType.STARS, rating=bool_val)
        assert "rating" in str(exc_info.value).lower()

    def test_thumbs_up_boolean_rating_rejected(self):
        with pytest.raises(ValidationError) as exc_info:
            FeedbackRequest(feedback_type=FeedbackType.THUMBS_UP, rating=True)
        assert "rating" in str(exc_info.value).lower()

    def test_thumbs_down_boolean_rating_rejected(self):
        with pytest.raises(ValidationError) as exc_info:
            FeedbackRequest(feedback_type=FeedbackType.THUMBS_DOWN, rating=False)
        assert "rating" in str(exc_info.value).lower()

    def test_thumbs_up_defaults_to_1(self):
        req = FeedbackRequest(feedback_type=FeedbackType.THUMBS_UP)
        assert req.rating == 1

    def test_thumbs_up_explicit_1(self):
        req = FeedbackRequest(feedback_type=FeedbackType.THUMBS_UP, rating=1)
        assert req.rating == 1

    @pytest.mark.parametrize("invalid_rating", [-1, 0, 2, 5])
    def test_thumbs_up_invalid_rating(self, invalid_rating):
        with pytest.raises(ValidationError) as exc_info:
            FeedbackRequest(feedback_type=FeedbackType.THUMBS_UP, rating=invalid_rating)
        assert "rating" in str(exc_info.value).lower()

    def test_thumbs_down_defaults_to_minus_1(self):
        req = FeedbackRequest(feedback_type=FeedbackType.THUMBS_DOWN)
        assert req.rating == -1

    def test_thumbs_down_explicit_minus_1(self):
        req = FeedbackRequest(feedback_type=FeedbackType.THUMBS_DOWN, rating=-1)
        assert req.rating == -1

    @pytest.mark.parametrize("invalid_rating", [1, 0, -2, 5])
    def test_thumbs_down_invalid_rating(self, invalid_rating):
        with pytest.raises(ValidationError) as exc_info:
            FeedbackRequest(feedback_type=FeedbackType.THUMBS_DOWN, rating=invalid_rating)
        assert "rating" in str(exc_info.value).lower()

    def test_missing_feedback_type_raises_validation_error(self):
        with pytest.raises(ValidationError):
            FeedbackRequest.model_validate({})

    def test_extra_fields_allowed(self):
        req = FeedbackRequest(
            feedback_type=FeedbackType.THUMBS_UP,
            extra_field="arbitrary_value",
            meta={"client": "browser"},
        )
        assert req.extra_field == "arbitrary_value"  # type: ignore[attr-defined]

    def test_optional_fields(self):
        req = FeedbackRequest(
            turn_id="turn-123",
            customer_id="cust-456",
            question="What is the price?",
            answer="It is $20.",
            feedback_type=FeedbackType.STARS,
            rating=5,
            comment="Excellent",
            tags=["accurate", "fast"],
        )
        assert req.turn_id == "turn-123"
        assert req.customer_id == "cust-456"
        assert req.question == "What is the price?"
        assert req.answer == "It is $20."
        assert req.comment == "Excellent"
        assert req.tags == ["accurate", "fast"]


class TestRecordFeedback:
    def test_record_feedback_returns_response(self, caplog):
        req = FeedbackRequest(
            turn_id="turn-001",
            customer_id="cust-001",
            question="Where is my order?",
            answer="Your order shipped yesterday.",
            feedback_type=FeedbackType.THUMBS_UP,
            comment="Helpful",
            tags=["order-status"],
        )

        with caplog.at_level(logging.INFO):
            response = record_feedback(req)

        assert isinstance(response, FeedbackResponse)
        assert response.status == "success"
        # Validate UUID format
        uuid.UUID(response.feedback_id)
        assert response.created_at
        assert response.message

        # Verify structured logging
        found_log = False
        for record in caplog.records:
            if "Chat feedback received" in record.message:
                found_log = True
                assert record.feedback_id == response.feedback_id
                assert record.feedback_type == "thumbs_up"
                assert record.rating == 1
                assert record.turn_id == "turn-001"
                assert record.customer_id == "cust-001"
        assert found_log, "Expected log record 'Chat feedback received' not found"


class TestFeedbackSummary:
    def test_summary_empty_store(self):
        summary = get_feedback_summary()
        assert summary["total_count"] == 0
        assert summary["thumbs_up_count"] == 0
        assert summary["thumbs_down_count"] == 0
        assert summary["average_star_rating"] is None
        assert summary["tags_distribution"] == {}

    def test_summary_aggregation(self):
        record_feedback(
            FeedbackRequest(
                feedback_type=FeedbackType.THUMBS_UP,
                tags=["helpful", "fast"],
            )
        )
        record_feedback(
            FeedbackRequest(
                feedback_type=FeedbackType.THUMBS_UP,
                tags=["helpful"],
            )
        )
        record_feedback(
            FeedbackRequest(
                feedback_type=FeedbackType.THUMBS_DOWN,
                tags=["slow"],
            )
        )
        record_feedback(
            FeedbackRequest(
                feedback_type=FeedbackType.STARS,
                rating=5,
                tags=["fast"],
            )
        )
        record_feedback(
            FeedbackRequest(
                feedback_type=FeedbackType.STARS,
                rating=3,
            )
        )

        summary = get_feedback_summary()
        assert summary["total_count"] == 5
        assert summary["thumbs_up_count"] == 2
        assert summary["thumbs_down_count"] == 1
        assert summary["average_star_rating"] == 4.0  # (5 + 3) / 2
        assert summary["tags_distribution"] == {
            "helpful": 2,
            "fast": 2,
            "slow": 1,
        }

    def test_clear_feedback_store(self):
        record_feedback(FeedbackRequest(feedback_type=FeedbackType.THUMBS_UP))
        assert get_feedback_summary()["total_count"] == 1

        clear_feedback_store()
        assert get_feedback_summary()["total_count"] == 0
