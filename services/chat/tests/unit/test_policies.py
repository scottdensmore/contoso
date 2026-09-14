import pytest
from contoso_chat.policies import (
    STORE_POLICIES,
    build_policy_prompt,
    detect_policy_intent,
    get_policy_by_id,
    get_store_policies,
)


class TestStorePoliciesCatalog:
    def test_catalog_keys_and_content(self) -> None:
        expected_ids = {"returns", "price_match", "shipping", "warranty", "privacy"}
        assert set(STORE_POLICIES.keys()) == expected_ids

        # returns policy check
        returns = STORE_POLICIES["returns"]
        assert returns["id"] == "returns"
        assert "30-day" in returns["summary"] or "30" in returns["summary"]
        assert "full refund" in returns["summary"].lower()
        assert "original packaging" in returns["summary"].lower()
        assert "free return shipping" in returns["summary"].lower()
        assert "members" in returns["summary"].lower()

        # price_match policy check
        price_match = STORE_POLICIES["price_match"]
        assert price_match["id"] == "price_match"
        assert "14-day" in price_match["summary"] or "14" in price_match["summary"]
        assert "price-match" in price_match["summary"].lower() or "price match" in price_match["summary"].lower()
        assert "authorized outdoor retailers" in price_match["summary"].lower()
        assert "identical in-stock items" in price_match["summary"].lower()

        # shipping policy check
        shipping = STORE_POLICIES["shipping"]
        assert shipping["id"] == "shipping"
        assert "0" in shipping["summary"]
        assert "" in shipping["summary"]
        assert "5" in shipping["summary"]
        assert "5" in shipping["summary"]

        # warranty policy check
        warranty = STORE_POLICIES["warranty"]
        assert warranty["id"] == "warranty"
        assert "lifetime" in warranty["summary"].lower()
        assert "contoso" in warranty["summary"].lower()
        assert "1-year" in warranty["summary"].lower() or "1 year" in warranty["summary"].lower()
        assert "partner" in warranty["summary"].lower()

        # privacy policy check
        privacy = STORE_POLICIES["privacy"]
        assert privacy["id"] == "privacy"
        assert "privacy pledge" in privacy["summary"].lower()
        assert "no data selling" in privacy["summary"].lower()
        assert "encrypted" in privacy["summary"].lower()

    def test_get_store_policies(self) -> None:
        policies = get_store_policies()
        assert isinstance(policies, list)
        assert len(policies) == 5
        policy_ids = {p["id"] for p in policies}
        assert policy_ids == {"returns", "price_match", "shipping", "warranty", "privacy"}

        for p in policies:
            assert "id" in p
            assert "title" in p
            assert "summary" in p
            assert "details" in p

    def test_get_store_policies_returns_copies(self) -> None:
        policies = get_store_policies()
        policies[0]["title"] = "MODIFIED"
        fresh = get_store_policies()
        assert fresh[0]["title"] != "MODIFIED"

    @pytest.mark.parametrize(
        ("policy_id", "expected_id"),
        [
            ("returns", "returns"),
            ("RETURNS", "returns"),
            ("Returns", "returns"),
            ("price_match", "price_match"),
            ("Price_Match", "price_match"),
            ("shipping", "shipping"),
            ("warranty", "warranty"),
            ("privacy", "privacy"),
            ("  returns  ", "returns"),
        ],
    )
    def test_get_policy_by_id_valid(self, policy_id: str, expected_id: str) -> None:
        policy = get_policy_by_id(policy_id)
        assert policy is not None
        assert policy["id"] == expected_id

    @pytest.mark.parametrize(
        "policy_id",
        [
            "unknown",
            "nonexistent",
            "",
            "   ",
            "return",  # exact ID is returns
        ],
    )
    def test_get_policy_by_id_invalid(self, policy_id: str) -> None:
        assert get_policy_by_id(policy_id) is None

    def test_get_policy_by_id_non_string(self) -> None:
        assert get_policy_by_id(None) is None  # type: ignore[arg-type]
        assert get_policy_by_id(123) is None  # type: ignore[arg-type]


class TestDetectPolicyIntent:
    @pytest.mark.parametrize(
        ("question", "expected_type"),
        [
            ("What is your return policy?", "returns"),
            ("How do I return my hiking boots?", "returns"),
            ("Can I get a refund for this backpack?", "returns"),
            ("Do you allow exchanges if the size is wrong?", "returns"),
            ("I want my money back for this purchase", "returns"),
            ("Can I return items within 30 days?", "returns"),
            ("Do you offer a 30 day return window?", "returns"),
        ],
    )
    def test_returns_intent_positive(self, question: str, expected_type: str) -> None:
        result = detect_policy_intent(question)
        assert result["is_policy_query"] is True
        assert result["policy_type"] == expected_type
        assert result["matched_policy"] is not None
        assert result["matched_policy"]["id"] == expected_type
        assert result["confidence"] > 0.0

    @pytest.mark.parametrize(
        ("question", "expected_type"),
        [
            ("Do you offer a price match?", "price_match"),
            ("Will you match competitor price?", "price_match"),
            ("I found this jacket cheaper somewhere else", "price_match"),
            ("Can you match price from other stores?", "price_match"),
            ("Can you match a lower price from REI?", "price_match"),
            ("What is your price-match policy?", "price_match"),
        ],
    )
    def test_price_match_intent_positive(self, question: str, expected_type: str) -> None:
        result = detect_policy_intent(question)
        assert result["is_policy_query"] is True
        assert result["policy_type"] == expected_type
        assert result["matched_policy"] is not None
        assert result["matched_policy"]["id"] == expected_type
        assert result["confidence"] > 0.0

    @pytest.mark.parametrize(
        ("question", "expected_type"),
        [
            ("What is the shipping cost?", "shipping"),
            ("What is your delivery time?", "shipping"),
            ("How fast is the shipping speed?", "shipping"),
            ("How much is shipping for orders under 0?", "shipping"),
            ("Do you offer overnight shipping?", "shipping"),
            ("How much is express delivery?", "shipping"),
            ("Tell me about shipping options", "shipping"),
        ],
    )
    def test_shipping_intent_positive(self, question: str, expected_type: str) -> None:
        result = detect_policy_intent(question)
        assert result["is_policy_query"] is True
        assert result["policy_type"] == expected_type
        assert result["matched_policy"] is not None
        assert result["matched_policy"]["id"] == expected_type
        assert result["confidence"] > 0.0

    @pytest.mark.parametrize(
        ("question", "expected_type"),
        [
            ("What warranty do you offer on Contoso gear?", "warranty"),
            ("Does this jacket have a guarantee?", "warranty"),
            ("Do you offer a lifetime warranty?", "warranty"),
            ("How does broken gear replacement work?", "warranty"),
            ("Is there a defect warranty on tents?", "warranty"),
        ],
    )
    def test_warranty_intent_positive(self, question: str, expected_type: str) -> None:
        result = detect_policy_intent(question)
        assert result["is_policy_query"] is True
        assert result["policy_type"] == expected_type
        assert result["matched_policy"] is not None
        assert result["matched_policy"]["id"] == expected_type
        assert result["confidence"] > 0.0

    @pytest.mark.parametrize(
        ("question", "expected_type"),
        [
            ("Where is your privacy policy?", "privacy"),
            ("How do you ensure data security?", "privacy"),
            ("Do you sell my data to anyone?", "privacy"),
            ("How is my personal information protected?", "privacy"),
            ("What is your privacy pledge?", "privacy"),
        ],
    )
    def test_privacy_intent_positive(self, question: str, expected_type: str) -> None:
        result = detect_policy_intent(question)
        assert result["is_policy_query"] is True
        assert result["policy_type"] == expected_type
        assert result["matched_policy"] is not None
        assert result["matched_policy"]["id"] == expected_type
        assert result["confidence"] > 0.0

    @pytest.mark.parametrize(
        "question",
        [
            "tell me about 2-person tents",
            "hiking boots for women",
            "what is the price of the Alpine tent?",
            "where is my order CTSO-123",
            "can I use discount code WELCOME20?",
            "",
            "   ",
        ],
    )
    def test_detect_policy_intent_negative(self, question: str) -> None:
        result = detect_policy_intent(question)
        assert result["is_policy_query"] is False
        assert result["policy_type"] is None
        assert result["matched_policy"] is None
        assert result["confidence"] == 0.0

    def test_detect_policy_intent_none_and_non_string(self) -> None:
        for val in [None, 123, [], {}]:
            result = detect_policy_intent(val)  # type: ignore[arg-type]
            assert result["is_policy_query"] is False
            assert result["policy_type"] is None
            assert result["matched_policy"] is None
            assert result["confidence"] == 0.0


class TestBuildPolicyPrompt:
    def test_build_policy_prompt_returns(self) -> None:
        policy = STORE_POLICIES["returns"]
        prompt = build_policy_prompt(policy)
        assert "Returns & Refunds Policy" in prompt
        assert "30-day" in prompt or "30" in prompt
        assert "Instructions for Assistant" in prompt

    def test_build_policy_prompt_price_match(self) -> None:
        policy = STORE_POLICIES["price_match"]
        prompt = build_policy_prompt(policy)
        assert "Price-Match" in prompt
        assert "14-day" in prompt or "14" in prompt
        assert "Instructions for Assistant" in prompt
