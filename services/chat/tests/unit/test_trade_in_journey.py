import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_complete_trade_in_journey():
    """
    End-to-End API Journey Test for Used Gear Trade-In Valuation & Sustainability Tooling:
    - Step 1: Query GET /api/trade-in/brands and verify eligible brands and categories.
    - Step 2: Query POST /api/trade-in/estimate with category="tents", original_msrp=400.0, condition="excellent" and assert $200.00 payout.
    - Step 3: Call POST /api/create_response with "Can I trade in my used Patagonia jacket for store credit?" and assert trade_in_info and detailed response answer.
    - Step 4: Stream POST /api/create_response/stream with "What brands are eligible for the Contoso Re-Gear trade-in program?" and verify SSE event: 'trade_in_info' frame, token chunks, and data: [DONE].
    """

    # -------------------------------------------------------------------------
    # Step 1: Query GET /api/trade-in/brands and verify eligible brands and categories.
    # -------------------------------------------------------------------------
    brands_res = client.get("/api/trade-in/brands")
    assert brands_res.status_code == 200
    brands_data = brands_res.json()
    assert isinstance(brands_data, list)
    assert len(brands_data) == 8

    brand_names = {b["name"] for b in brands_data}
    assert "Contoso Outdoors" in brand_names
    assert "Patagonia" in brand_names
    assert "Arc'teryx" in brand_names
    assert "The North Face" in brand_names
    assert "Mountain Hardwear" in brand_names
    assert "Osprey" in brand_names
    assert "Big Agnes" in brand_names
    assert "Nemo Equipment" in brand_names

    patagonia = next(b for b in brands_data if b["name"] == "Patagonia")
    assert "jackets" in patagonia["accepted_categories"]
    assert patagonia["tier"] == "premium"

    # -------------------------------------------------------------------------
    # Step 2: Query POST /api/trade-in/estimate with category="tents", original_msrp=400.0, condition="excellent"
    # and assert $200.00 payout.
    # -------------------------------------------------------------------------
    estimate_res = client.post(
        "/api/trade-in/estimate",
        json={"category": "tents", "original_msrp": 400.0, "condition": "excellent"},
    )
    assert estimate_res.status_code == 200
    estimate_data = estimate_res.json()
    assert estimate_data["category"] == "tents"
    assert estimate_data["original_msrp"] == 400.0
    assert estimate_data["condition"] == "excellent"
    assert estimate_data["estimated_payout"] == 200.00
    assert estimate_data["co2_avoided_kg"] == 25.0
    assert "Like new" in estimate_data["condition_summary"]

    # -------------------------------------------------------------------------
    # Step 3: Call POST /api/create_response with "Can I trade in my used Patagonia jacket for store credit?"
    # and assert trade_in_info and detailed response answer.
    # -------------------------------------------------------------------------
    with patch("main.REAL_CHAT_AVAILABLE", False):
        response_res = client.post(
            "/api/create_response",
            json={"question": "Can I trade in my used Patagonia jacket for store credit?"},
        )
        assert response_res.status_code == 200
        chat_data = response_res.json()

        assert "trade_in_info" in chat_data
        trade_in_info = chat_data["trade_in_info"]
        assert trade_in_info["action"] == "estimate"
        assert trade_in_info["brand"] == "Patagonia"
        assert trade_in_info["category"] == "jackets"

        answer = chat_data["answer"]
        assert "Patagonia" in answer
        assert "store credit" in answer.lower()
        assert any(term in answer.lower() for term in ["trade-in", "re-gear", "trade in"])

    # -------------------------------------------------------------------------
    # Step 4: Stream POST /api/create_response/stream with "What brands are eligible for the Contoso Re-Gear trade-in program?"
    # and verify SSE event: 'trade_in_info' frame, token chunks, and data: [DONE].
    # -------------------------------------------------------------------------
    with patch("main.REAL_CHAT_AVAILABLE", False):
        stream_res = client.post(
            "/api/create_response/stream",
            json={"question": "What brands are eligible for the Contoso Re-Gear trade-in program?"},
        )
        assert stream_res.status_code == 200

        raw_events = [line.strip() for line in stream_res.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        trade_in_event = next((e for e in parsed_events if e.get("event") == "trade_in_info"), None)
        assert trade_in_event is not None
        assert "trade_in_info" in trade_in_event
        assert trade_in_event["trade_in_info"]["action"] == "brands"
        assert len(trade_in_event["trade_in_info"]["eligible_brands"]) == 8

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Contoso" in full_text
        assert "Patagonia" in full_text


@pytest.mark.anyio
async def test_trade_in_journey_real_mode_execution():
    """Verifies trade-in prompt injection and payload parity in real mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value={"firstName": "Alex", "membership": "Gold", "orders": []}),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search_service,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(
            return_value="Yes, you can trade in your Patagonia jacket for Contoso store credit!"
        ),
    ) as mock_llm, patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response",
            json={"question": "Can I trade in my used Patagonia jacket for store credit?"},
        )
        assert res.status_code == 200
        data = res.json()

        assert "trade_in_info" in data
        assert data["trade_in_info"]["action"] == "estimate"
        assert data["trade_in_info"]["brand"] == "Patagonia"
        assert data["trade_in_info"]["category"] == "jackets"

        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "trade_in_prompt" in call_kwargs
        assert "Re-Gear" in call_kwargs["trade_in_prompt"]
        assert "Patagonia" in call_kwargs["trade_in_prompt"]
        assert "jackets" in call_kwargs["trade_in_prompt"]
