
import pytest
from contoso_chat.carrier_tracking import (
    CarrierTrackingInfo,
    MilestoneStatus,
    ShipmentMilestone,
    build_carrier_milestone_prompt,
    detect_carrier_tracking_intent,
    lookup_carrier_tracking,
)


class TestCarrierTrackingModels:
    """Test data models for carrier tracking and shipment milestones."""

    def test_milestone_status_enum_values(self):
        assert MilestoneStatus.COMPLETED.value == "completed"
        assert MilestoneStatus.IN_PROGRESS.value == "in_progress"
        assert MilestoneStatus.PENDING.value == "pending"

    def test_shipment_milestone_model(self):
        milestone = ShipmentMilestone(
            milestone_id="order_confirmed",
            name="Order Confirmed",
            description="Order Confirmed & Payment Processed",
            location="Distribution Center, Seattle WA",
            timestamp="2026-09-10T08:30:00Z",
            status=MilestoneStatus.COMPLETED,
        )
        assert milestone.milestone_id == "order_confirmed"
        assert milestone.name == "Order Confirmed"
        assert milestone.description == "Order Confirmed & Payment Processed"
        assert milestone.location == "Distribution Center, Seattle WA"
        assert milestone.timestamp == "2026-09-10T08:30:00Z"
        assert milestone.status == MilestoneStatus.COMPLETED

        dumped = milestone.model_dump()
        assert dumped["status"] == "completed"
        assert dumped["milestone_id"] == "order_confirmed"

    def test_shipment_milestone_optional_timestamp(self):
        milestone = ShipmentMilestone(
            milestone_id="carrier_pickup",
            name="Carrier Pickup",
            description="Package picked up by carrier",
            location="FedEx Facility, Kent WA",
            status=MilestoneStatus.PENDING,
        )
        assert milestone.timestamp is None
        assert milestone.status == MilestoneStatus.PENDING

    def test_carrier_tracking_info_model(self):
        milestones = [
            ShipmentMilestone(
                milestone_id="order_confirmed",
                name="Order Confirmed",
                description="Order Confirmed & Payment Processed",
                location="Distribution Center, Seattle WA",
                timestamp="2026-09-10T08:30:00Z",
                status=MilestoneStatus.COMPLETED,
            ),
            ShipmentMilestone(
                milestone_id="processing",
                name="Processing",
                description="Packed and labeled at warehouse",
                location="Distribution Center, Seattle WA",
                timestamp="2026-09-10T14:15:00Z",
                status=MilestoneStatus.IN_PROGRESS,
            ),
        ]
        info = CarrierTrackingInfo(
            order_id="CTSO-98765",
            carrier="FedEx Ground",
            tracking_number="CTSO-TRK-98765",
            status="Processing",
            estimated_delivery="In 3-5 business days",
            current_location="Distribution Center, Seattle WA",
            service_level="Standard Ground",
            milestones=milestones,
        )
        assert info.order_id == "CTSO-98765"
        assert info.carrier == "FedEx Ground"
        assert info.tracking_number == "CTSO-TRK-98765"
        assert info.status == "Processing"
        assert len(info.milestones) == 2

        dumped = info.model_dump()
        assert dumped["order_id"] == "CTSO-98765"
        assert len(dumped["milestones"]) == 2
        assert dumped["milestones"][0]["status"] == "completed"


class TestCarrierResolver:
    """Test lookup_carrier_tracking resolution behavior."""

    def test_lookup_demo_tracking_number(self):
        info = lookup_carrier_tracking("CTSO-TRK-DEMO123")
        assert info is not None
        assert isinstance(info, CarrierTrackingInfo)
        assert info.tracking_number == "CTSO-TRK-DEMO123"
        assert info.carrier in ["FedEx Ground", "UPS Ground"]
        assert info.service_level in ["Standard Ground", "2-Day Express"]
        assert info.status in ["Processing", "Shipped", "Out for Delivery", "Delivered"]
        assert len(info.milestones) in [4, 5]

        # Milestone 1: order_confirmed
        assert info.milestones[0].milestone_id == "order_confirmed"
        assert "Order Confirmed & Payment Processed" in info.milestones[0].description
        assert "Distribution Center, Seattle WA" in info.milestones[0].location
        assert info.milestones[0].status == MilestoneStatus.COMPLETED

        # Milestone 2: processing
        assert info.milestones[1].milestone_id == "processing"
        assert "Packed and labeled at warehouse" in info.milestones[1].description
        assert "Distribution Center, Seattle WA" in info.milestones[1].location

        # Milestone 3: carrier_pickup
        assert info.milestones[2].milestone_id == "carrier_pickup"
        assert "Package picked up by carrier" in info.milestones[2].description
        assert "Kent WA" in info.milestones[2].location or "Facility" in info.milestones[2].location

        # Milestone 4: in_transit
        assert info.milestones[3].milestone_id == "in_transit"
        assert "In transit between sort facilities" in info.milestones[3].description
        assert "Transit Hub" in info.milestones[3].location

    def test_special_test_identifier_delivered(self):
        info = lookup_carrier_tracking("CTSO-TRK-DELIVERED")
        assert info is not None
        assert info.status == "Delivered"
        assert info.estimated_delivery == "Delivered"
        assert all(m.status == MilestoneStatus.COMPLETED for m in info.milestones)
        assert info.milestones[-1].milestone_id == "delivered"

    def test_special_test_identifier_transit(self):
        info = lookup_carrier_tracking("CTSO-TRK-TRANSIT")
        assert info is not None
        assert info.status in ["Shipped", "In Transit"]
        # Milestones up to carrier_pickup completed
        assert info.milestones[0].status == MilestoneStatus.COMPLETED
        assert info.milestones[1].status == MilestoneStatus.COMPLETED
        assert info.milestones[2].status == MilestoneStatus.COMPLETED
        # in_transit milestone is in progress
        assert info.milestones[3].milestone_id == "in_transit"
        assert info.milestones[3].status == MilestoneStatus.IN_PROGRESS
        # Final milestone is pending
        assert info.milestones[4].status == MilestoneStatus.PENDING

    def test_special_test_identifier_processing(self):
        info = lookup_carrier_tracking("CTSO-TRK-PROCESSING")
        assert info is not None
        assert info.status == "Processing"
        assert info.milestones[0].status == MilestoneStatus.COMPLETED
        assert info.milestones[1].milestone_id == "processing"
        assert info.milestones[1].status == MilestoneStatus.IN_PROGRESS
        for m in info.milestones[2:]:
            assert m.status == MilestoneStatus.PENDING

    def test_lookup_order_id_identifier(self):
        info = lookup_carrier_tracking("CTSO-98765")
        assert info is not None
        assert info.order_id == "CTSO-98765"
        assert info.tracking_number.startswith("CTSO-TRK-")
        assert len(info.milestones) in [4, 5]

    def test_lookup_generic_order_id_identifier(self):
        info = lookup_carrier_tracking("ord_123")
        assert info is not None
        assert info.order_id == "ord_123"
        assert info.tracking_number.startswith("CTSO-TRK-")

    @pytest.mark.parametrize(
        "invalid_id",
        [
            "UNKNOWN-99999",
            "INVALID_ID",
            "",
            "   ",
            "CTSO-TRK-",
            "CTSO-",
            "12345",
            None,
        ],
    )
    def test_lookup_invalid_identifiers_return_none(self, invalid_id):
        assert lookup_carrier_tracking(invalid_id) is None  # type: ignore[arg-type]


class TestDetectCarrierTrackingIntent:
    """Test intent detection for carrier queries."""

    @pytest.mark.parametrize(
        "query,expected_intent,expected_id",
        [
            ("track carrier", True, None),
            ("carrier tracking", True, None),
            ("where is package CTSO-TRK-98765", True, "CTSO-TRK-98765"),
            ("fedex tracking", True, None),
            ("ups tracking", True, None),
            ("shipping milestone", True, None),
            ("shipping milestones", True, None),
            ("tracking number CTSO-TRK-98765", True, "CTSO-TRK-98765"),
            ("Where is my shipment CTSO-TRK-DEMO123?", True, "CTSO-TRK-DEMO123"),
            ("where is package CTSO-98765", True, "CTSO-98765"),
            ("carrier tracking for ord_123", True, "ord_123"),
            ("track carrier for order CTSO-12345", True, "CTSO-12345"),
            ("package tracking CTSO-TRK-TRANSIT", True, "CTSO-TRK-TRANSIT"),
            ("carrier status", True, None),
        ],
    )
    def test_positive_carrier_intent(self, query, expected_intent, expected_id):
        result = detect_carrier_tracking_intent(query)
        assert result["is_carrier_intent"] is expected_intent
        assert result["extracted_identifier"] == expected_id

    @pytest.mark.parametrize(
        "query",
        [
            "what tents do you recommend?",
            "tell me about your return policy",
            "do you sell hiking boots?",
            "what are your store hours?",
            "",
            "   ",
        ],
    )
    def test_negative_carrier_intent(self, query):
        result = detect_carrier_tracking_intent(query)
        assert result["is_carrier_intent"] is False
        assert result["extracted_identifier"] is None

    def test_carrier_intent_non_string(self):
        assert detect_carrier_tracking_intent(None) == {  # type: ignore[arg-type]
            "is_carrier_intent": False,
            "extracted_identifier": None,
        }
        assert detect_carrier_tracking_intent(12345) == {  # type: ignore[arg-type]
            "is_carrier_intent": False,
            "extracted_identifier": None,
        }


class TestBuildCarrierMilestonePrompt:
    """Test LLM prompt construction with carrier milestones."""

    def test_build_prompt_with_tracking_info(self):
        info = lookup_carrier_tracking("CTSO-TRK-DEMO123")
        assert info is not None
        prompt = build_carrier_milestone_prompt(info, "Where is my shipment?")

        assert "Carrier Tracking Information:" in prompt
        assert info.carrier in prompt
        assert info.tracking_number in prompt
        assert info.current_location in prompt
        assert info.estimated_delivery in prompt
        assert "Active Milestone:" in prompt
        assert "Instructions for Assistant:" in prompt

    def test_build_prompt_without_tracking_info(self):
        prompt = build_carrier_milestone_prompt(None, "Where is my shipment?")
        assert "Carrier Tracking Information:" in prompt
        assert "No live carrier tracking information was found" in prompt
        assert "Instructions for Assistant:" in prompt
