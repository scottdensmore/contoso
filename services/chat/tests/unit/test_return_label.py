import pytest
from contoso_chat.return_label import (
    ReturnIntent,
    ReturnLabelInfo,
    ReturnLabelRequest,
    build_return_label_prompt,
    detect_return_label_intent,
    format_return_label_response,
    generate_return_label,
)


class TestReturnLabelModels:
    def test_return_label_info_model(self):
        info = ReturnLabelInfo(
            order_id="CTSO-12345",
            rma_number="RMA-CTSO-12345",
            tracking_number="1Z-CTSO-RET-00012345",
            carrier="Contoso Express Returns / UPS Ground Prepaid",
            return_center="Contoso Outdoors Returns Depot, 1201 3rd Ave, Seattle, WA 98101",
            instructions=["Securely pack items.", "Affix label."],
            valid_days=14,
            label_url="/profile/orders/CTSO-12345/label",
        )
        assert info.order_id == "CTSO-12345"
        assert info.rma_number == "RMA-CTSO-12345"
        assert info.tracking_number == "1Z-CTSO-RET-00012345"
        assert info.carrier == "Contoso Express Returns / UPS Ground Prepaid"
        assert info.return_center == "Contoso Outdoors Returns Depot, 1201 3rd Ave, Seattle, WA 98101"
        assert len(info.instructions) == 2
        assert info.valid_days == 14
        assert info.label_url == "/profile/orders/CTSO-12345/label"

    def test_return_label_request_model(self):
        req = ReturnLabelRequest(order_id="CTSO-12345")
        assert req.order_id == "CTSO-12345"
        assert req.reason is None
        assert req.items is None

        req_with_details = ReturnLabelRequest(
            order_id="CTSO-12345",
            reason="Wrong size",
            items=["Alpine Tent 4P"],
        )
        assert req_with_details.reason == "Wrong size"
        assert req_with_details.items == ["Alpine Tent 4P"]

    def test_return_intent_model(self):
        intent = ReturnIntent(action="generate_label", order_id="CTSO-98765")
        assert intent.action == "generate_label"
        assert intent.order_id == "CTSO-98765"


class TestGenerateReturnLabel:
    def test_generate_return_label_ctso_order(self):
        info = generate_return_label("CTSO-12345")
        assert isinstance(info, ReturnLabelInfo)
        assert info.order_id == "CTSO-12345"
        assert info.rma_number == "RMA-CTSO-12345"
        assert info.tracking_number == "1Z-CTSO-RET-00012345"
        assert info.carrier == "Contoso Express Returns / UPS Ground Prepaid"
        assert info.return_center == "Contoso Outdoors Returns Depot, 1201 3rd Ave, Seattle, WA 98101"
        assert info.valid_days == 14
        assert info.label_url == "/profile/orders/CTSO-12345/label"
        assert len(info.instructions) == 4
        assert "Securely pack items in the original box or equivalent packaging." in info.instructions
        assert "Print and affix the prepaid shipping label firmly to the exterior." in info.instructions
        assert "Cover or remove any prior carrier barcodes." in info.instructions
        assert "Drop off at any UPS Store or Contoso Retail location within 14 days." in info.instructions

    def test_generate_return_label_another_ctso_order(self):
        info = generate_return_label("CTSO-98765")
        assert info.order_id == "CTSO-98765"
        assert info.rma_number == "RMA-CTSO-98765"
        assert info.tracking_number == "1Z-CTSO-RET-00098765"
        assert info.label_url == "/profile/orders/CTSO-98765/label"

    def test_generate_return_label_numeric_order_id(self):
        info = generate_return_label("12345")
        assert info.order_id == "12345"
        assert info.rma_number == "RMA-12345"
        assert info.tracking_number == "1Z-CTSO-RET-00012345"
        assert info.label_url == "/profile/orders/12345/label"

    def test_generate_return_label_with_reason_and_items(self):
        info = generate_return_label(
            "CTSO-54321",
            reason="Item defective",
            items=["Hiking Boots - Size 10"],
        )
        assert info.order_id == "CTSO-54321"
        assert info.rma_number == "RMA-CTSO-54321"
        assert info.tracking_number == "1Z-CTSO-RET-00054321"


class TestDetectReturnLabelIntent:
    @pytest.mark.parametrize(
        "query,expected_action,expected_order_id",
        [
            ("I need a return label for CTSO-12345", "generate_label", "CTSO-12345"),
            ("Request return label for order CTSO-98765", "generate_label", "CTSO-98765"),
            ("Can you print return label for CTSO-44321?", "generate_label", "CTSO-44321"),
            ("I need a shipping label for return of 12345", "generate_label", "12345"),
            ("Can I get an rma for order CTSO-77889?", "generate_label", "CTSO-77889"),
            ("I need a return label", "generate_label", None),
            ("How do I package my return?", "packaging_guide", None),
            ("How do I pack my return for CTSO-12345?", "packaging_guide", "CTSO-12345"),
            ("What box and tape should I use for package return?", "packaging_guide", None),
            ("Where do I drop off my return?", "dropoff_locations", None),
            ("Where do I drop off the package?", "dropoff_locations", None),
            ("Where do I bring my return?", "dropoff_locations", None),
            ("Where do I take the return package?", "dropoff_locations", None),
            ("Nearest carrier location to drop off return", "dropoff_locations", None),
            ("Where is the dropoff for returns?", "dropoff_locations", None),
            ("Inquire about return label policy and process", "policy", None),
            ("What is the return label policy?", "policy", None),
            ("How many days do I have to return using the label?", "policy", None),
            ("What is the return label deadline?", "policy", None),
            ("how to return an item", "policy", None),
        ],
    )
    def test_detect_return_label_intent_positive(
        self, query: str, expected_action: str, expected_order_id: str | None
    ):
        intent = detect_return_label_intent(query)
        assert intent is not None, f"Expected intent detected for query: {query}"
        assert intent.action == expected_action
        assert intent.order_id == expected_order_id

    @pytest.mark.parametrize(
        "query",
        [
            "What tents do you recommend for backpacking?",
            "Where is my shipment CTSO-TRK-DEMO123?",
            "Do you sell waterproof hiking boots?",
            "Where are your store locations in Seattle?",
            "What is your price match policy?",
            "Tell me about camping gear rentals",
            "",
            "   ",
        ],
    )
    def test_detect_return_label_intent_negative(self, query: str):
        assert detect_return_label_intent(query) is None

    def test_detect_return_label_intent_none_input(self):
        assert detect_return_label_intent(None) is None  # type: ignore[arg-type]


class TestBuildReturnLabelPrompt:
    def test_build_prompt_with_label_info(self):
        info = generate_return_label("CTSO-98765")
        intent = ReturnIntent(action="generate_label", order_id="CTSO-98765")
        prompt = build_return_label_prompt(intent, info)

        assert "Return Label Information:" in prompt
        assert "CTSO-98765" in prompt
        assert "RMA-CTSO-98765" in prompt
        assert "1Z-CTSO-RET-00098765" in prompt
        assert "/profile/orders/CTSO-98765/label" in prompt
        assert "original box" in prompt
        assert "tape" in prompt
        assert "UPS Store" in prompt
        assert "Contoso Retail" in prompt
        assert "14" in prompt

    def test_build_prompt_without_label_info(self):
        intent = ReturnIntent(action="packaging_guide", order_id=None)
        prompt = build_return_label_prompt(intent, None)

        assert "Return Label and Packaging Guidance:" in prompt
        assert "packaging_guide" in prompt
        assert "original box" in prompt
        assert "tape" in prompt
        assert "UPS Store" in prompt


class TestFormatReturnLabelResponse:
    def test_format_generate_label_response(self):
        info = generate_return_label("CTSO-98765")
        intent = ReturnIntent(action="generate_label", order_id="CTSO-98765")
        res = format_return_label_response(intent, info)

        assert "answer" in res
        assert "return_label" in res
        answer = res["answer"]
        assert "RMA-CTSO-98765" in answer
        assert "1Z-CTSO-RET-00098765" in answer
        assert "/profile/orders/CTSO-98765/label" in answer
        assert res["return_label"] == info.model_dump()

    def test_format_packaging_guide_response(self):
        intent = ReturnIntent(action="packaging_guide", order_id=None)
        res = format_return_label_response(intent, None)

        assert "answer" in res
        assert "return_label" in res
        answer = res["answer"].lower()
        assert "original box" in answer
        assert "tape" in answer
        assert "barcode" in answer

    def test_format_dropoff_locations_response(self):
        intent = ReturnIntent(action="dropoff_locations", order_id=None)
        res = format_return_label_response(intent, None)

        assert "answer" in res
        assert "return_label" in res
        answer = res["answer"].lower()
        assert "ups store" in answer
        assert "contoso retail" in answer
        assert "14" in answer

    def test_format_policy_response(self):
        intent = ReturnIntent(action="policy", order_id=None)
        res = format_return_label_response(intent, None)

        assert "answer" in res
        assert "return_label" in res
        answer = res["answer"].lower()
        assert "14" in answer
