import pytest
from contoso_chat.faq import (
    FaqItem,
    FaqSearchResult,
    build_faq_prompt,
    detect_faq_intent,
    get_all_faqs,
    get_faq_by_id,
    search_faqs,
)


class TestFaqCatalog:
    def test_get_all_faqs_returns_all_expected_categories(self):
        faqs = get_all_faqs()
        assert isinstance(faqs, list)
        assert len(faqs) >= 7

        faq_ids = {faq.faq_id for faq in faqs}
        expected_ids = {
            "returns",
            "shipping",
            "warranty",
            "price_match",
            "gear_care",
            "rewards",
            "rentals",
        }
        assert expected_ids.issubset(faq_ids)

        for faq in faqs:
            assert isinstance(faq, FaqItem)
            assert faq.faq_id
            assert faq.question
            assert faq.answer
            assert faq.category
            assert isinstance(faq.keywords, list)
            assert len(faq.keywords) > 0

    def test_get_faq_by_id_found(self):
        warranty = get_faq_by_id("warranty")
        assert warranty is not None
        assert isinstance(warranty, FaqItem)
        assert warranty.faq_id == "warranty"
        assert warranty.category == "warranty"
        assert "1-year" in warranty.answer or "warranty" in warranty.answer.lower()
        assert warranty.url is not None

    def test_get_faq_by_id_case_insensitive_and_whitespace(self):
        returns_faq = get_faq_by_id("  ReTuRns  ")
        assert returns_faq is not None
        assert returns_faq.faq_id == "returns"

    def test_get_faq_by_id_not_found(self):
        missing = get_faq_by_id("non-existent-id-999")
        assert missing is None

    def test_get_faq_by_id_invalid_types(self):
        assert get_faq_by_id("") is None
        assert get_faq_by_id(None) is None  # type: ignore[arg-type]


class TestSearchFaqs:
    def test_search_by_exact_keyword(self):
        results = search_faqs("refund")
        assert len(results) > 0
        assert any(item.faq_id == "returns" for item in results)

    def test_search_by_category_filter(self):
        results = search_faqs(query="", category="shipping")
        assert len(results) >= 1
        assert all(item.category == "shipping" for item in results)

    def test_search_by_query_and_category(self):
        results = search_faqs(query="30-day", category="returns")
        assert len(results) == 1
        assert results[0].faq_id == "returns"

    def test_search_category_mismatch(self):
        results = search_faqs(query="warranty", category="shipping")
        assert len(results) == 0

    def test_search_respects_limit(self):
        results = search_faqs(query="outdoor", limit=2)
        assert len(results) <= 2

    def test_search_empty_query_returns_all_faqs_up_to_limit(self):
        results = search_faqs(query="", limit=5)
        assert len(results) == 5

    def test_search_no_match(self):
        results = search_faqs("xyzabcdef12345nonexistent")
        assert results == []


class TestDetectFaqIntent:
    @pytest.mark.parametrize(
        "phrase,expected_faq_id",
        [
            ("What is your return policy?", "returns"),
            ("How to return an item I ordered?", "returns"),
            ("Can I get a refund?", "returns"),
            ("What is your warranty coverage?", "warranty"),
            ("Do you offer a lifetime warranty?", "warranty"),
            ("What guarantee do you provide on tents?", "warranty"),
            ("How much is the shipping cost?", "shipping"),
            ("Do you offer free shipping?", "shipping"),
            ("How long to ship my backpack?", "shipping"),
            ("Do you support international shipping?", "shipping"),
            ("Can I get a price match from REI?", "price_match"),
            ("How do I clean tent fabric?", "gear_care"),
            ("How do I care for boots?", "gear_care"),
            ("Tell me about your rewards program", "rewards"),
            ("How do I earn loyalty points?", "rewards"),
            ("Can I rent gear for camping?", "rentals"),
            ("Do you offer equipment rental?", "rentals"),
        ],
    )
    def test_detect_faq_intent_positive_matches(self, phrase: str, expected_faq_id: str):
        result = detect_faq_intent(phrase)
        assert result is not None
        assert isinstance(result, FaqSearchResult)
        assert result.query == phrase
        assert len(result.matches) > 0
        assert any(item.faq_id == expected_faq_id for item in result.matches)

    @pytest.mark.parametrize(
        "phrase",
        [
            "Do you sell waterproof hiking boots in size 11?",
            "What sleeping bags are best for winter camping?",
            "Hello, how are you today?",
            "",
            "   ",
        ],
    )
    def test_detect_faq_intent_negative_non_faq(self, phrase: str):
        result = detect_faq_intent(phrase)
        assert result is None

    def test_detect_faq_intent_invalid_input(self):
        assert detect_faq_intent(None) is None  # type: ignore[arg-type]
        assert detect_faq_intent(12345) is None  # type: ignore[arg-type]


class TestBuildFaqPrompt:
    def test_build_faq_prompt_with_items(self):
        item = FaqItem(
            faq_id="warranty",
            question="What warranty coverage is provided?",
            answer="1-year manufacturer warranty on all Contoso brand gear.",
            category="warranty",
            keywords=["warranty", "guarantee"],
            url="/help/warranty",
        )
        prompt = build_faq_prompt([item], "What is your warranty policy?")
        assert "What is your warranty policy?" in prompt
        assert "1-year manufacturer warranty" in prompt
        assert "/help/warranty" in prompt
        assert "warranty" in prompt.lower()

    def test_build_faq_prompt_empty_items(self):
        assert build_faq_prompt([], "Some question") == ""
