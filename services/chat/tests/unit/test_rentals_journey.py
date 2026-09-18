from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_complete_gear_rentals_journey():
    """
    End-to-end API journey test for gear rental rates & equipment availability tooling:
    - Step 1: Customer asks about renting outdoor gear -> Assistant lists available rental packages.
    - Step 2: Customer asks for a 4-day quote for a camping tent package in Seattle -> Assistant returns calculated quote with 10% discount and confirms Seattle store pickup.
    - Step 3: Customer asks about winter snowshoe rental availability in Portland -> Assistant explains availability in Denver/Salt Lake/Seattle and options.
    - Step 4: Customer asks about security deposit and cancellation policy -> Assistant explains deposit terms and policies.
    """
    # -------------------------------------------------------------------------
    # Diagnostics & REST Endpoints verification
    # -------------------------------------------------------------------------
    status_res = client.get("/api/chat/status")
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["status"] == "online"
    assert status_data["real_chat_available"] is not None

    # Test GET /api/rentals/packages
    packages_res = client.get("/api/rentals/packages")
    assert packages_res.status_code == 200
    packages = packages_res.json()
    assert isinstance(packages, list)
    assert len(packages) == 4
    pkg_ids = {p["id"] for p in packages}
    assert pkg_ids == {
        "camp-bundle-4p",
        "backpack-ultralight",
        "kayak-touring-set",
        "snowshoe-alpine-kit",
    }

    # Test GET /api/rentals/packages?category=paddling
    paddling_res = client.get("/api/rentals/packages?category=paddling")
    assert paddling_res.status_code == 200
    paddling_pkgs = paddling_res.json()
    assert len(paddling_pkgs) == 1
    assert paddling_pkgs[0]["id"] == "kayak-touring-set"

    # Test POST /api/rentals/quote
    quote_res = client.post(
        "/api/rentals/quote",
        json={"gear_type": "kayak", "days": 3, "store_name": "Seattle"},
    )
    assert quote_res.status_code == 200
    quote_data = quote_res.json()
    assert quote_data["package_id"] == "kayak-touring-set"
    assert quote_data["daily_rate"] == 50.0
    assert quote_data["days"] == 3
    assert quote_data["discount_percent"] == 10.0
    assert quote_data["subtotal"] == 135.0
    assert quote_data["deposit"] == 150.0
    assert quote_data["total_due"] == 285.0
    assert quote_data["store"] == "Seattle"
    assert quote_data["store_available"] is True

    # Test POST /api/rentals/quote 404 for invalid package
    quote_404 = client.post(
        "/api/rentals/quote",
        json={"gear_type": "space-shuttle", "days": 1},
    )
    assert quote_404.status_code == 404

    # -------------------------------------------------------------------------
    # Step 1: Customer asks about renting outdoor gear -> Assistant lists available rental packages
    # -------------------------------------------------------------------------
    with patch("main.REAL_CHAT_AVAILABLE", False):
        step1_res = client.post(
            "/api/create_response",
            json={"question": "I am interested in renting outdoor gear. What rental packages do you have?"},
        )
        assert step1_res.status_code == 200
        step1_data = step1_res.json()

        assert "rental_info" in step1_data
        assert step1_data["rental_info"]["action"] == "packages"
        assert len(step1_data["rental_info"]["packages"]) == 4

        answer1 = step1_data["answer"].lower()
        assert "camping" in answer1 or "deluxe camping" in answer1
        assert "backpacking" in answer1
        assert "kayak" in answer1
        assert "snowshoe" in answer1

    # -------------------------------------------------------------------------
    # Step 2: Customer asks for a 4-day quote for a camping tent package in Seattle ->
    # Assistant returns calculated quote with 10% discount and confirms Seattle store pickup
    # -------------------------------------------------------------------------
    with patch("main.REAL_CHAT_AVAILABLE", False):
        step2_res = client.post(
            "/api/create_response",
            json={"question": "How much for a 4-day quote for a camping tent package in Seattle?"},
        )
        assert step2_res.status_code == 200
        step2_data = step2_res.json()

        assert "rental_info" in step2_data
        rental_info2 = step2_data["rental_info"]
        assert rental_info2["action"] == "quote"
        quote2 = rental_info2["quote"]
        assert quote2["package_id"] == "camp-bundle-4p"
        assert quote2["days"] == 4
        assert quote2["daily_rate"] == 45.0
        assert quote2["discount_percent"] == 10.0
        assert quote2["discount_amount"] == 18.0
        assert quote2["subtotal"] == 162.0
        assert quote2["deposit"] == 100.0
        assert quote2["total_due"] == 262.0
        assert quote2["store"] == "Seattle"
        assert quote2["store_available"] is True

        answer2 = step2_data["answer"]
        assert "10%" in answer2 or "10 percent" in answer2.lower()
        assert "162" in answer2
        assert "262" in answer2
        assert "Seattle" in answer2

    # -------------------------------------------------------------------------
    # Step 3: Customer asks about winter snowshoe rental availability in Portland ->
    # Assistant explains availability in Denver/Salt Lake/Seattle and options
    # -------------------------------------------------------------------------
    with patch("main.REAL_CHAT_AVAILABLE", False):
        step3_res = client.post(
            "/api/create_response",
            json={"question": "Can I check winter snowshoe rental availability in Portland?"},
        )
        assert step3_res.status_code == 200
        step3_data = step3_res.json()

        assert "rental_info" in step3_data
        rental_info3 = step3_data["rental_info"]
        assert rental_info3["action"] == "availability"
        assert rental_info3["store_available"] is False
        assert rental_info3["store"] == "Portland"
        assert set(rental_info3["available_stores"]) == {"Denver", "Salt Lake City", "Seattle"}

        answer3 = step3_data["answer"]
        assert "Portland" in answer3
        assert any(store in answer3 for store in ["Seattle", "Denver", "Salt Lake City"])

    # -------------------------------------------------------------------------
    # Step 4: Customer asks about security deposit and cancellation policy ->
    # Assistant explains deposit terms and policies
    # -------------------------------------------------------------------------
    with patch("main.REAL_CHAT_AVAILABLE", False):
        step4_res = client.post(
            "/api/create_response",
            json={"question": "What is your security deposit and cancellation policy for gear rentals?"},
        )
        assert step4_res.status_code == 200
        step4_data = step4_res.json()

        assert "rental_info" in step4_data
        rental_info4 = step4_data["rental_info"]
        assert rental_info4["action"] == "policy"
        assert "deposit" in rental_info4["policies"]
        assert "cancellation" in rental_info4["policies"]

        answer4 = step4_data["answer"].lower()
        assert "deposit" in answer4
        assert "cancellation" in answer4 or "cancel" in answer4
        assert "48 hours" in answer4 or "refund" in answer4


@pytest.mark.anyio
async def test_gear_rentals_journey_real_mode_execution():
    """Verifies end-to-end rental prompt injection and response structure when real chat logic is invoked."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value={"firstName": "Jordan", "membership": "Platinum", "orders": []}),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search_service,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(
            return_value="The 4-Person Deluxe Camping Package for 4 days in Seattle is $162 after a 10% discount, plus a $100 deposit."
        ),
    ) as mock_llm, patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response",
            json={"question": "How much for a 4-day quote for a camping tent package in Seattle?"},
        )
        assert res.status_code == 200
        data = res.json()

        assert "rental_info" in data
        assert data["rental_info"]["action"] == "quote"
        assert data["rental_info"]["quote"]["package_id"] == "camp-bundle-4p"
        assert data["rental_info"]["quote"]["discount_percent"] == 10.0
        assert data["rental_info"]["quote"]["subtotal"] == 162.0

        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "rental_prompt" in call_kwargs
        assert "Contoso Outdoors Official Gear Rental Guidance" in call_kwargs["rental_prompt"]
        assert "4-Person Deluxe Camping Package" in call_kwargs["rental_prompt"]
        assert "Seattle" in call_kwargs["rental_prompt"]
