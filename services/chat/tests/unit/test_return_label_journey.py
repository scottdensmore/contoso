import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_return_label_multi_step_journey():
    """
    End-to-end API journey test for return label generation and packaging guidance:
    Step 1: Inquire about return label policy and process -> Assistant provides return steps and policy.
    Step 2: Request return label for order CTSO-98765 -> Assistant returns RMA, tracking number, and link to printable label /profile/orders/CTSO-98765/label.
    Step 3: Ask how to package the return -> Assistant provides packaging instructions (original box, seal with tape, cover old barcodes).
    Step 4: Ask where to drop off the package -> Assistant provides drop-off carrier locations (UPS Store, Contoso Retail) and 14-day window.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Inquire about return label policy and process
        # -------------------------------------------------------------------------
        res1 = client.post(
            "/api/create_response",
            json={"question": "What is the return label policy and process?"},
        )
        assert res1.status_code == 200
        data1 = res1.json()
        assert "answer" in data1
        assert "return_label" in data1
        ans1 = data1["answer"].lower()
        assert "14" in ans1 or "policy" in ans1 or "step" in ans1

        # -------------------------------------------------------------------------
        # Step 2: Request return label for order CTSO-98765
        # -------------------------------------------------------------------------
        res2 = client.post(
            "/api/create_response",
            json={"question": "Request return label for order CTSO-98765"},
        )
        assert res2.status_code == 200
        data2 = res2.json()
        assert "answer" in data2
        assert "return_label" in data2
        rl2 = data2["return_label"]
        assert rl2["order_id"] == "CTSO-98765"
        assert rl2["rma_number"] == "RMA-CTSO-98765"
        assert rl2["tracking_number"] == "1Z-CTSO-RET-00098765"
        assert rl2["label_url"] == "/profile/orders/CTSO-98765/label"
        ans2 = data2["answer"]
        assert "RMA-CTSO-98765" in ans2
        assert "1Z-CTSO-RET-00098765" in ans2
        assert "/profile/orders/CTSO-98765/label" in ans2

        # -------------------------------------------------------------------------
        # Step 3: Ask how to package the return
        # -------------------------------------------------------------------------
        res3 = client.post(
            "/api/create_response",
            json={"question": "How do I package the return?"},
        )
        assert res3.status_code == 200
        data3 = res3.json()
        assert "answer" in data3
        assert "return_label" in data3
        ans3 = data3["answer"].lower()
        assert "original box" in ans3
        assert "tape" in ans3
        assert "barcode" in ans3

        # -------------------------------------------------------------------------
        # Step 4: Ask where to drop off the package
        # -------------------------------------------------------------------------
        res4 = client.post(
            "/api/create_response",
            json={"question": "Where do I drop off the package?"},
        )
        assert res4.status_code == 200
        data4 = res4.json()
        assert "answer" in data4
        assert "return_label" in data4
        ans4 = data4["answer"].lower()
        assert "ups store" in ans4
        assert "contoso retail" in ans4
        assert "14" in ans4


def test_return_label_rest_endpoints():
    """Verify POST and GET /api/orders/{order_id}/return_label REST endpoints."""
    # POST
    post_res = client.post(
        "/api/orders/CTSO-98765/return_label",
        json={"order_id": "CTSO-98765", "reason": "Size too small"},
    )
    assert post_res.status_code == 200
    post_data = post_res.json()
    assert post_data["order_id"] == "CTSO-98765"
    assert post_data["rma_number"] == "RMA-CTSO-98765"
    assert post_data["tracking_number"] == "1Z-CTSO-RET-00098765"
    assert post_data["carrier"] == "Contoso Express Returns / UPS Ground Prepaid"
    assert post_data["label_url"] == "/profile/orders/CTSO-98765/label"
    assert post_data["valid_days"] == 14

    # GET
    get_res = client.get("/api/orders/CTSO-98765/return_label")
    assert get_res.status_code == 200
    get_data = get_res.json()
    assert get_data["order_id"] == "CTSO-98765"
    assert get_data["rma_number"] == "RMA-CTSO-98765"
    assert get_data["tracking_number"] == "1Z-CTSO-RET-00098765"
    assert get_data["carrier"] == "Contoso Express Returns / UPS Ground Prepaid"
    assert get_data["label_url"] == "/profile/orders/CTSO-98765/label"
    assert get_data["valid_days"] == 14


def test_return_label_stream_emits_event():
    """Verify return_label SSE event in streaming endpoint."""
    with patch("main.REAL_CHAT_AVAILABLE", False):
        res = client.post(
            "/api/create_response/stream",
            json={"question": "I need a return label for CTSO-98765"},
        )
        assert res.status_code == 200
        assert "text/event-stream" in res.headers.get("content-type", "")
        lines = res.text.strip().split("\n\n")
        events = []
        for line in lines:
            if line.startswith("data: ") and line != "data: [DONE]":
                try:
                    events.append(json.loads(line[6:]))
                except json.JSONDecodeError:
                    pass

        rl_events = [e for e in events if e.get("event") == "return_label"]
        assert len(rl_events) >= 1
        payload = rl_events[0]["return_label"]
        assert payload["order_id"] == "CTSO-98765"
        assert payload["rma_number"] == "RMA-CTSO-98765"
        assert payload["tracking_number"] == "1Z-CTSO-RET-00098765"


@pytest.mark.anyio
async def test_return_label_real_chat_pipeline():
    """Verify return label prompt injection in real chat pipeline."""
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
        new=AsyncMock(return_value="Here is your return label for CTSO-98765. RMA: RMA-CTSO-98765"),
    ) as mock_llm, patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response",
            json={"question": "I need a return label for CTSO-98765"},
        )
        assert res.status_code == 200
        data = res.json()
        assert "return_label" in data
        assert data["return_label"]["order_id"] == "CTSO-98765"
        assert data["return_label"]["rma_number"] == "RMA-CTSO-98765"

        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "return_label_prompt" in call_kwargs
        assert "RMA-CTSO-98765" in call_kwargs["return_label_prompt"]
        assert "/profile/orders/CTSO-98765/label" in call_kwargs["return_label_prompt"]
