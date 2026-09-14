from datetime import datetime, timedelta, timezone

import pytest
from contoso_chat.order_tracking import (
    build_order_tracking_prompt,
    detect_order_tracking_intent,
    lookup_order_tracking,
)


class TestDetectOrderTrackingIntent:
    @pytest.mark.parametrize(
        "query,expected_intent,expected_order_id",
        [
            ("where is my order", True, None),
            ("track order", True, None),
            ("track my order", True, None),
            ("order status", True, None),
            ("what is my order status", True, None),
            ("when will my order arrive", True, None),
            ("has my order shipped", True, None),
            ("order #123", True, "123"),
            ("order CTSO-98765", True, "CTSO-98765"),
            ("where is order #CTSO-456", True, "CTSO-456"),
            ("track order CTSO-12345", True, "CTSO-12345"),
            ("when will order 789 arrive", True, "789"),
            ("order #abc-xyz", True, "abc-xyz"),
        ],
    )
    def test_tracking_intent_positive(self, query, expected_intent, expected_order_id):
        result = detect_order_tracking_intent(query)
        assert result["is_tracking_intent"] is expected_intent
        assert result["extracted_order_id"] == expected_order_id

    @pytest.mark.parametrize(
        "query",
        [
            "tell me about tents",
            "hiking boots for women",
            "what is the price of the Alpine tent?",
            "how do I return an item?",
            "order a backpack",
            "",
            "   ",
        ],
    )
    def test_tracking_intent_negative(self, query):
        result = detect_order_tracking_intent(query)
        assert result["is_tracking_intent"] is False
        assert result["extracted_order_id"] is None

    def test_tracking_intent_none_and_non_string(self):
        assert detect_order_tracking_intent(None) == {  # type: ignore[arg-type]
            "is_tracking_intent": False,
            "extracted_order_id": None,
        }
        assert detect_order_tracking_intent(12345) == {  # type: ignore[arg-type]
            "is_tracking_intent": False,
            "extracted_order_id": None,
        }


class TestLookupOrderTracking:
    def test_not_logged_in_returns_none(self):
        orders = [{"id": "ord-1", "date": "2026-09-12T10:00:00Z"}]
        assert lookup_order_tracking(None, customer_orders=orders) is None
        assert lookup_order_tracking("", customer_orders=orders) is None

    def test_no_orders_returns_none(self):
        assert lookup_order_tracking("cust-1", customer_orders=None) is None
        assert lookup_order_tracking("cust-1", customer_orders=[]) is None

    def test_order_id_not_found_returns_none(self):
        orders = [{"id": "ord-1", "date": "2026-09-12T10:00:00Z"}]
        assert lookup_order_tracking("cust-1", order_id="ord-999", customer_orders=orders) is None

    def test_order_id_matching_case_insensitive(self):
        now = datetime(2026, 9, 13, 12, 0, 0, tzinfo=timezone.utc)
        orders = [
            {
                "id": "CTSO-ABC-123",
                "date": (now - timedelta(hours=30)).isoformat(),
                "total": 199.99,
                "items": [{"id": 1}],
            },
            {
                "id": "CTSO-XYZ-789",
                "date": (now - timedelta(hours=5)).isoformat(),
                "total": 49.99,
                "items": [{"id": 2}],
            },
        ]
        result = lookup_order_tracking(
            "cust-1",
            order_id="ctso-abc-123",
            customer_orders=orders,
            current_time=now,
        )
        assert result is not None
        assert result["order_id"] == "CTSO-ABC-123"
        assert result["status"] == "Shipped"
        assert result["total"] == 199.99
        assert result["items_count"] == 1

    def test_fallback_to_most_recent_order(self):
        now = datetime(2026, 9, 13, 12, 0, 0, tzinfo=timezone.utc)
        orders = [
            {
                "id": "ord-old",
                "date": (now - timedelta(hours=100)).isoformat(),
                "total": 89.0,
                "items": [{"id": 1}],
            },
            {
                "id": "ord-recent",
                "date": (now - timedelta(hours=10)).isoformat(),
                "total": 150.0,
                "items": [{"id": 2}, {"id": 3}],
            },
        ]
        result = lookup_order_tracking(
            "cust-1",
            order_id=None,
            customer_orders=orders,
            current_time=now,
        )
        assert result is not None
        assert result["order_id"] == "ord-recent"
        assert result["status"] == "Processing"
        assert result["items_count"] == 2

    def test_status_under_24_hours_is_processing(self):
        now = datetime(2026, 9, 13, 12, 0, 0, tzinfo=timezone.utc)
        orders = [
            {
                "id": "CTSO-11112222",
                "date": (now - timedelta(hours=12)).isoformat(),
                "total": 99.0,
                "items": [{"id": 1}],
            }
        ]
        result = lookup_order_tracking("cust-1", customer_orders=orders, current_time=now)
        assert result is not None
        assert result["status"] == "Processing"
        assert result["carrier"] is None
        assert result["tracking_number"] is None
        assert result["estimated_delivery"] == "In 3-5 business days"
        assert result["status_message"] == "Preparing for shipment at fulfillment center"
        assert result["items_count"] == 1
        assert result["total"] == 99.0

    def test_status_24_to_72_hours_is_shipped(self):
        now = datetime(2026, 9, 13, 12, 0, 0, tzinfo=timezone.utc)
        orders = [
            {
                "id": "CTSO-11112222",
                "date": (now - timedelta(hours=48)).isoformat(),
                "total": 120.0,
                "items": [{"id": 1}, {"id": 2}],
            }
        ]
        result = lookup_order_tracking("cust-1", customer_orders=orders, current_time=now)
        assert result is not None
        assert result["status"] == "Shipped"
        assert result["carrier"] == "FedEx Ground"
        assert result["tracking_number"] == "CTSO-TRK-CTSO-111"
        assert result["estimated_delivery"] == "In 2 business days"
        assert result["status_message"] == "In transit with carrier"

    def test_status_over_72_hours_is_delivered(self):
        now = datetime(2026, 9, 13, 12, 0, 0, tzinfo=timezone.utc)
        orders = [
            {
                "id": "CTSO-11112222",
                "date": (now - timedelta(hours=80)).isoformat(),
                "total": 55.0,
                "items": [],
            }
        ]
        result = lookup_order_tracking("cust-1", customer_orders=orders, current_time=now)
        assert result is not None
        assert result["status"] == "Delivered"
        assert result["carrier"] == "FedEx Ground"
        assert result["tracking_number"] == "CTSO-TRK-CTSO-111"
        assert result["estimated_delivery"] == "Delivered"
        assert result["status_message"] == "Delivered to front door / porch"
        assert result["items_count"] == 0


class TestBuildOrderTrackingPrompt:
    def test_prompt_with_tracking_info(self):
        tracking_info = {
            "order_id": "CTSO-123",
            "date": "2026-09-12T12:00:00Z",
            "status": "Shipped",
            "carrier": "FedEx Ground",
            "tracking_number": "CTSO-TRK-CTSO-123",
            "estimated_delivery": "In 2 business days",
            "status_message": "In transit with carrier",
            "items_count": 2,
            "total": 149.99,
        }
        prompt = build_order_tracking_prompt(tracking_info, "where is my order")
        assert "CTSO-123" in prompt
        assert "Shipped" in prompt
        assert "FedEx Ground" in prompt
        assert "CTSO-TRK-CTSO-123" in prompt
        assert "In 2 business days" in prompt

    def test_prompt_without_tracking_info(self):
        prompt = build_order_tracking_prompt(None, "where is my order")
        prompt_lower = prompt.lower()
        assert "no active orders" in prompt_lower or "no order" in prompt_lower
        assert "profile" in prompt_lower or "support" in prompt_lower


class TestLookupOrderTrackingEdgeCases:
    def test_unparseable_date_defaults_to_processing(self):
        orders = [{"id": "ord-unparseable", "date": "not-a-date"}]
        result = lookup_order_tracking("cust-1", customer_orders=orders)
        assert result is not None
        assert result["status"] == "Processing"

    def test_naive_datetime_handling(self):
        now_naive = datetime(2026, 9, 13, 12, 0, 0)
        orders = [
            {
                "id": "ord-naive",
                "date": datetime(2026, 9, 10, 10, 0, 0),  # > 72h
            }
        ]
        result = lookup_order_tracking("cust-1", customer_orders=orders, current_time=now_naive)
        assert result is not None
        assert result["status"] == "Delivered"

    def test_order_with_none_items(self):
        orders = [{"id": "ord-none-items", "items": None}]
        result = lookup_order_tracking("cust-1", customer_orders=orders)
        assert result is not None
        assert result["items_count"] == 0

    def test_order_id_with_hash_matching(self):
        orders = [{"id": "12345", "date": "2026-09-13T10:00:00Z"}]
        result = lookup_order_tracking("cust-1", order_id="#12345", customer_orders=orders)
        assert result is not None
        assert result["order_id"] == "12345"

    def test_order_id_in_list_has_hash(self):
        orders = [{"id": "#12345", "date": "2026-09-13T10:00:00Z"}]
        result = lookup_order_tracking("cust-1", order_id="12345", customer_orders=orders)
        assert result is not None
        assert result["order_id"] == "#12345"
