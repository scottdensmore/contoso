from typing import Any

import pytest
from contoso_chat.promotions import (
    ACTIVE_PROMOTIONS,
    build_promo_prompt,
    detect_promo_intent,
    get_active_promotions,
    validate_promo_code,
)


class TestActivePromotions:
    def test_active_promotions_catalog(self) -> None:
        assert "WELCOME20" in ACTIVE_PROMOTIONS
        assert "OUTDOORS10" in ACTIVE_PROMOTIONS
        assert "TRAIL15" in ACTIVE_PROMOTIONS

        assert ACTIVE_PROMOTIONS["WELCOME20"]["discount_percent"] == 20
        assert ACTIVE_PROMOTIONS["OUTDOORS10"]["discount_percent"] == 10
        assert ACTIVE_PROMOTIONS["TRAIL15"]["discount_percent"] == 15

    def test_get_active_promotions(self) -> None:
        promos = get_active_promotions()
        assert isinstance(promos, list)
        assert len(promos) == 3

        codes = {p["code"] for p in promos}
        assert codes == {"WELCOME20", "OUTDOORS10", "TRAIL15"}

        for p in promos:
            assert "code" in p
            assert "discount_percent" in p
            assert "description" in p
            assert isinstance(p["discount_percent"], int)
            assert isinstance(p["description"], str)

    def test_get_active_promotions_returns_copies(self) -> None:
        promos = get_active_promotions()
        promos[0]["discount_percent"] = 999
        fresh_promos = get_active_promotions()
        assert fresh_promos[0]["discount_percent"] != 999


class TestValidatePromoCode:
    @pytest.mark.parametrize(
        ("code", "expected_percent", "expected_code"),
        [
            ("WELCOME20", 20, "WELCOME20"),
            ("welcome20", 20, "WELCOME20"),
            ("OUTDOORS10", 10, "OUTDOORS10"),
            ("outdoors10", 10, "OUTDOORS10"),
            ("TRAIL15", 15, "TRAIL15"),
            ("trail15", 15, "TRAIL15"),
            ("  WELCOME20  ", 20, "WELCOME20"),
        ],
    )
    def test_validate_valid_codes(
        self, code: str, expected_percent: int, expected_code: str
    ) -> None:
        result = validate_promo_code(code)
        assert result["valid"] is True
        assert result["code"] == expected_code
        assert result["discount_percent"] == expected_percent
        assert "description" in result

    @pytest.mark.parametrize(
        "invalid_code",
        [
            "INVALID",
            "EXPIRED50",
            "WELCOME10",
            "NOPE",
            "",
            "   ",
        ],
    )
    def test_validate_invalid_codes(self, invalid_code: str) -> None:
        result = validate_promo_code(invalid_code)
        assert result["valid"] is False
        assert result["message"] == "Code not found or expired"

    def test_validate_non_string(self) -> None:
        assert validate_promo_code(None) == {  # type: ignore[arg-type]
            "valid": False,
            "message": "Code not found or expired",
        }
        assert validate_promo_code(123) == {  # type: ignore[arg-type]
            "valid": False,
            "message": "Code not found or expired",
        }


class TestDetectPromoIntent:
    @pytest.mark.parametrize(
        ("question", "expected_code"),
        [
            ("do you have any coupons", None),
            ("promo code", None),
            ("any discounts", None),
            ("is there a sale", None),
            ("are there any deals available?", None),
            ("can I get a voucher?", None),
            ("tell me about current promotions", None),
            ("do you have special offers?", None),
            ("WELCOME20", "WELCOME20"),
            ("can I use welcome20?", "WELCOME20"),
            ("is outdoors10 still active?", "OUTDOORS10"),
            ("what is TRAIL15 discount?", "TRAIL15"),
            ("I have a promo code SUMMER25", "SUMMER25"),
            ("my coupon code is SAVE10", "SAVE10"),
            ("discount code: ADVENTURE", "ADVENTURE"),
            ("voucher code CTSO-VIP", "CTSO-VIP"),
        ],
    )
    def test_promo_intent_positive(
        self, question: str, expected_code: str | None
    ) -> None:
        result = detect_promo_intent(question)
        assert result["is_promo_intent"] is True
        assert result["extracted_code"] == expected_code

    @pytest.mark.parametrize(
        "question",
        [
            "tell me about tents",
            "hiking boots for women",
            "what is the price of the Alpine tent?",
            "how do I return an item?",
            "where is my order CTSO-123",
            "",
            "   ",
        ],
    )
    def test_promo_intent_negative(self, question: str) -> None:
        result = detect_promo_intent(question)
        assert result["is_promo_intent"] is False
        assert result["extracted_code"] is None

    def test_promo_intent_none_and_non_string(self) -> None:
        assert detect_promo_intent(None) == {  # type: ignore[arg-type]
            "is_promo_intent": False,
            "extracted_code": None,
        }
        assert detect_promo_intent(123) == {  # type: ignore[arg-type]
            "is_promo_intent": False,
            "extracted_code": None,
        }


class TestBuildPromoPrompt:
    def test_build_promo_prompt_contains_active_codes(self) -> None:
        prompt = build_promo_prompt({}, "any coupons?")
        assert "WELCOME20" in prompt
        assert "OUTDOORS10" in prompt
        assert "TRAIL15" in prompt
        assert "shopping cart drawer" in prompt.lower() or "cart drawer" in prompt.lower()
        assert "saving" in prompt.lower()

    def test_build_promo_prompt_with_extracted_code(self) -> None:
        promo_info: dict[str, Any] = {
            "is_promo_intent": True,
            "extracted_code": "WELCOME20",
        }
        prompt = build_promo_prompt(promo_info, "Can I use WELCOME20?")
        assert "WELCOME20" in prompt
        assert "20%" in prompt or "welcome discount" in prompt.lower()
        assert "shopping cart drawer" in prompt.lower() or "cart drawer" in prompt.lower()

    def test_build_promo_prompt_with_unknown_extracted_code(self) -> None:
        promo_info: dict[str, Any] = {
            "is_promo_intent": True,
            "extracted_code": "BOGUS99",
        }
        prompt = build_promo_prompt(promo_info, "Is BOGUS99 valid?")
        assert "BOGUS99" in prompt
        assert "WELCOME20" in prompt
