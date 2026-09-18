import pytest
from contoso_chat.review_summary import (
    ProductReviewSummary,
    SentimentRating,
    build_review_summary_prompt,
    detect_review_sentiment_intent,
    get_review_summary,
)


class TestReviewSummaryCatalog:
    """Tests for the review summary catalog and lookup function."""

    @pytest.mark.parametrize(
        "slug,expected_name,expected_rating,expected_reviews,expected_rec",
        [
            ("trailmaster-x4-tent", "TrailMaster X4 Tent", 4.7, 48, 94),
            ("adventurer-pro-backpack", "Adventurer Pro Backpack", 4.8, 62, 96),
            ("summit-breeze-jacket", "Summit Breeze Jacket", 4.5, 35, 89),
            ("alpine-trekker-boots", "Alpine Trekker Boots", 4.6, 51, 91),
            ("ridge-rest-sleeping-pad", "Ridge Rest Sleeping Pad", 4.4, 29, 86),
        ],
    )
    def test_get_review_summary_known_products(
        self,
        slug: str,
        expected_name: str,
        expected_rating: float,
        expected_reviews: int,
        expected_rec: int,
    ):
        summary = get_review_summary(slug)
        assert summary is not None
        assert isinstance(summary, ProductReviewSummary)
        assert summary.product_slug == slug
        assert summary.product_name == expected_name
        assert summary.average_rating == expected_rating
        assert summary.total_reviews == expected_reviews
        assert summary.sentiment == SentimentRating.POSITIVE
        assert summary.recommendation_percentage == expected_rec
        assert len(summary.pros) > 0
        assert len(summary.cons) > 0
        assert isinstance(summary.key_quote, str) and len(summary.key_quote) > 0

    def test_get_review_summary_case_insensitive_and_whitespace(self):
        summary = get_review_summary("  TRAILMASTER-X4-TENT  ")
        assert summary is not None
        assert summary.product_slug == "trailmaster-x4-tent"

    def test_get_review_summary_unknown_product_returns_none(self):
        assert get_review_summary("unknown-gadget-123") is None
        assert get_review_summary("") is None
        assert get_review_summary(None) is None  # type: ignore[arg-type]

    def test_trailmaster_pros_and_cons(self):
        summary = get_review_summary("trailmaster-x4-tent")
        assert summary is not None
        assert "Waterproof double-wall construction" in summary.pros
        assert "Spacious 4-person capacity" in summary.pros
        assert "Simple 10-minute setup" in summary.pros
        assert "Packed weight is slightly heavy" in summary.cons
        assert "Stakes could be sturdier" in summary.cons


class TestDetectReviewSentimentIntent:
    """Tests for review sentiment intent detection across phrasings and slug extraction."""

    @pytest.mark.parametrize(
        "question,expected_intent,expected_slug",
        [
            (
                "what do customers think of the trailmaster-x4-tent?",
                True,
                "trailmaster-x4-tent",
            ),
            (
                "reviews for adventurer-pro-backpack",
                True,
                "adventurer-pro-backpack",
            ),
            (
                "pros and cons of the summit breeze jacket",
                True,
                "summit-breeze-jacket",
            ),
            (
                "customer feedback on alpine-trekker-boots",
                True,
                "alpine-trekker-boots",
            ),
            (
                "is it good quality",
                True,
                None,
            ),
            (
                "is the tent good",
                True,
                "trailmaster-x4-tent",
            ),
            (
                "complaints about ridge-rest-sleeping-pad",
                True,
                "ridge-rest-sleeping-pad",
            ),
            (
                "ratings for trailmaster-x4-tent",
                True,
                "trailmaster-x4-tent",
            ),
            (
                "would customers recommend the adventurer pro backpack?",
                True,
                "adventurer-pro-backpack",
            ),
            (
                "What are the pros and cons of the TrailMaster tent according to customers?",
                True,
                "trailmaster-x4-tent",
            ),
        ],
    )
    def test_detect_review_sentiment_intent_matching(
        self,
        question: str,
        expected_intent: bool,
        expected_slug: str | None,
    ):
        result = detect_review_sentiment_intent(question)
        assert result["is_review_intent"] is expected_intent
        assert result["product_slug"] == expected_slug
        if expected_slug:
            assert result["summary"] is not None
            assert result["summary"].product_slug == expected_slug
        else:
            assert result["summary"] is None

    @pytest.mark.parametrize(
        "question",
        [
            "What is your return policy?",
            "Track my order CTSO-12345",
            "What are your store hours in Denver?",
            "What size jacket should I get for a 40 inch chest?",
            "Where can I find shipping rates?",
            "",
            "   ",
        ],
    )
    def test_detect_review_sentiment_intent_non_matching(self, question: str):
        result = detect_review_sentiment_intent(question)
        assert result["is_review_intent"] is False
        assert result["product_slug"] is None
        assert result["summary"] is None

    def test_detect_review_intent_invalid_input(self):
        assert detect_review_sentiment_intent(None)["is_review_intent"] is False  # type: ignore[arg-type]


class TestBuildReviewSummaryPrompt:
    """Tests for LLM prompt builder formatting."""

    def test_build_review_summary_prompt_with_summary(self):
        summary = get_review_summary("trailmaster-x4-tent")
        prompt = build_review_summary_prompt(
            summary, "What do customers think of the TrailMaster tent?"
        )
        assert "TrailMaster X4 Tent" in prompt
        assert "trailmaster-x4-tent" in prompt
        assert "4.7" in prompt
        assert "48" in prompt
        assert "94%" in prompt
        assert "Waterproof double-wall construction" in prompt
        assert "Packed weight is slightly heavy" in prompt
        assert summary.key_quote in prompt
        assert "Instructions for Assistant" in prompt

    def test_build_review_summary_prompt_none_returns_empty(self):
        assert build_review_summary_prompt(None, "Any question") == ""
