import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_complete_store_policy_and_price_match_journey():
    """
    End-to-end API journey test for store policy & price-match assistant tooling:
    1. Query policy catalog via GET /api/policies.
    2. Inquire about price-match via POST /api/policies/inquire.
    3. Send chat question 'Can you match a lower price from REI?' via POST /api/create_response,
       verifying policy grounding and 'policy' key in payload.
    4. Send streaming question 'What is your return policy?' via POST /api/create_response/stream,
       verifying event: 'policy' SSE frame is emitted before tokens.
    5. Test warranty and shipping inquiries.
    """
    # -------------------------------------------------------------------------
    # Step 1: Query policy catalog via GET /api/policies
    # -------------------------------------------------------------------------
    catalog_res = client.get("/api/policies")
    assert catalog_res.status_code == 200
    catalog = catalog_res.json()
    assert isinstance(catalog, list)
    assert len(catalog) == 5

    policy_map = {p["id"]: p for p in catalog}
    assert set(policy_map.keys()) == {"returns", "price_match", "shipping", "warranty", "privacy"}

    # Verify each policy has required structural fields
    for pid, p in policy_map.items():
        assert p["id"] == pid
        assert isinstance(p["title"], str) and len(p["title"]) > 0
        assert isinstance(p["summary"], str) and len(p["summary"]) > 0
        assert isinstance(p["details"], str) and len(p["details"]) > 0

    # Also verify direct lookup via GET /api/policies/{policy_id}
    pm_detail_res = client.get("/api/policies/price_match")
    assert pm_detail_res.status_code == 200
    assert pm_detail_res.json()["id"] == "price_match"

    # -------------------------------------------------------------------------
    # Step 2: Inquire about price-match via POST /api/policies/inquire
    # -------------------------------------------------------------------------
    inquire_pm_res = client.post(
        "/api/policies/inquire",
        json={"query": "Do you have a price match policy against other retailers?"},
    )
    assert inquire_pm_res.status_code == 200
    inquire_pm_data = inquire_pm_res.json()

    assert inquire_pm_data["is_policy_query"] is True
    assert inquire_pm_data["policy_type"] == "price_match"
    assert inquire_pm_data["confidence"] > 0.0
    matched_pm = inquire_pm_data["matched_policy"]
    assert matched_pm is not None
    assert matched_pm["id"] == "price_match"
    assert "14-day" in matched_pm["summary"] or "14" in matched_pm["summary"]
    assert "authorized outdoor retailers" in matched_pm["summary"].lower()
    assert "identical in-stock items" in matched_pm["summary"].lower()

    # -------------------------------------------------------------------------
    # Step 3: Send chat question "Can you match a lower price from REI?"
    #         via POST /api/create_response, verifying policy grounding and
    #         "policy" key in payload.
    # -------------------------------------------------------------------------
    with patch("main.REAL_CHAT_AVAILABLE", False):
        chat_res = client.post(
            "/api/create_response",
            json={"question": "Can you match a lower price from REI?"},
        )
        assert chat_res.status_code == 200
        chat_data = chat_res.json()

        assert "policy" in chat_data
        policy_in_chat = chat_data["policy"]
        assert isinstance(policy_in_chat, dict)
        assert policy_in_chat["id"] == "price_match"
        assert "14-day" in policy_in_chat["summary"] or "14" in policy_in_chat["summary"]

        # Verify policy grounding in the response answer
        answer = chat_data["answer"]
        assert any(
            phrase in answer.lower()
            for phrase in ["price-match", "price match", "guarantee", "authorized outdoor retailers"]
        )

    # -------------------------------------------------------------------------
    # Step 4: Send streaming question "What is your return policy?"
    #         via POST /api/create_response/stream, verifying event: 'policy'
    #         SSE frame is emitted before tokens.
    # -------------------------------------------------------------------------
    with patch("main.REAL_CHAT_AVAILABLE", False):
        stream_res = client.post(
            "/api/create_response/stream",
            json={"question": "What is your return policy?"},
        )
        assert stream_res.status_code == 200
        assert "text/event-stream" in stream_res.headers.get("content-type", "")

        raw_events = [
            chunk.strip()
            for chunk in stream_res.text.split("\n\n")
            if chunk.strip() and chunk.strip() != "data: [DONE]"
        ]

        parsed_events = []
        for raw in raw_events:
            assert raw.startswith("data: ")
            payload = json.loads(raw.removeprefix("data: "))
            parsed_events.append(payload)

        # Ensure event: 'policy' is emitted
        policy_event = next((e for e in parsed_events if e.get("event") == "policy"), None)
        assert policy_event is not None
        assert "policy" in policy_event
        assert policy_event["policy"]["id"] == "returns"
        assert "30-day" in policy_event["policy"]["summary"] or "30" in policy_event["policy"]["summary"]
        assert "free return shipping" in policy_event["policy"]["summary"].lower()

        # Verify event: 'policy' appears before any 'chunk' (token) events
        policy_idx = next(i for i, e in enumerate(parsed_events) if e.get("event") == "policy")
        chunk_indices = [i for i, e in enumerate(parsed_events) if "chunk" in e]
        assert len(chunk_indices) > 0
        assert policy_idx < chunk_indices[0], "Policy SSE frame must be emitted before text chunk tokens"

    # -------------------------------------------------------------------------
    # Step 5: Test warranty and shipping inquiries
    # -------------------------------------------------------------------------
    # 5a. Warranty inquiry via /api/policies/inquire
    warranty_inquire_res = client.post(
        "/api/policies/inquire",
        json={"query": "What kind of warranty or guarantee do you offer on broken gear?"},
    )
    assert warranty_inquire_res.status_code == 200
    warranty_inquire_data = warranty_inquire_res.json()
    assert warranty_inquire_data["is_policy_query"] is True
    assert warranty_inquire_data["policy_type"] == "warranty"
    assert warranty_inquire_data["matched_policy"]["id"] == "warranty"
    assert "lifetime" in warranty_inquire_data["matched_policy"]["summary"].lower()

    # 5b. Warranty inquiry via /api/create_response (chat endpoint)
    with patch("main.REAL_CHAT_AVAILABLE", False):
        warranty_chat_res = client.post(
            "/api/create_response",
            json={"question": "What warranty do you offer on Contoso gear?"},
        )
        assert warranty_chat_res.status_code == 200
        warranty_chat_data = warranty_chat_res.json()
        assert "policy" in warranty_chat_data
        assert warranty_chat_data["policy"]["id"] == "warranty"
        assert "warranty" in warranty_chat_data["answer"].lower()

    # 5c. Shipping inquiry via /api/policies/inquire
    shipping_inquire_res = client.post(
        "/api/policies/inquire",
        json={"query": "What is the shipping cost and delivery time?"},
    )
    assert shipping_inquire_res.status_code == 200
    shipping_inquire_data = shipping_inquire_res.json()
    assert shipping_inquire_data["is_policy_query"] is True
    assert shipping_inquire_data["policy_type"] == "shipping"
    assert shipping_inquire_data["matched_policy"]["id"] == "shipping"
    assert "$50" in shipping_inquire_data["matched_policy"]["summary"]

    # 5d. Shipping streaming inquiry via /api/create_response/stream
    with patch("main.REAL_CHAT_AVAILABLE", False):
        shipping_stream_res = client.post(
            "/api/create_response/stream",
            json={"question": "How much is shipping for my order?"},
        )
        assert shipping_stream_res.status_code == 200
        parsed_shipping_events = [
            json.loads(c.strip().removeprefix("data: "))
            for c in shipping_stream_res.text.split("\n\n")
            if c.strip() and c.strip() != "data: [DONE]"
        ]
        shipping_policy_event = next(
            (e for e in parsed_shipping_events if e.get("event") == "policy"), None
        )
        assert shipping_policy_event is not None
        assert shipping_policy_event["policy"]["id"] == "shipping"

    # 5e. Privacy inquiry via /api/policies/inquire
    privacy_inquire_res = client.post(
        "/api/policies/inquire",
        json={"query": "Do you sell my data or personal information?"},
    )
    assert privacy_inquire_res.status_code == 200
    privacy_inquire_data = privacy_inquire_res.json()
    assert privacy_inquire_data["is_policy_query"] is True
    assert privacy_inquire_data["policy_type"] == "privacy"
    assert privacy_inquire_data["matched_policy"]["id"] == "privacy"

    # 5f. Non-policy inquiry returns is_policy_query=False
    product_inquire_res = client.post(
        "/api/policies/inquire",
        json={"query": "Do you sell lightweight waterproof hiking boots?"},
    )
    assert product_inquire_res.status_code == 200
    product_inquire_data = product_inquire_res.json()
    assert product_inquire_data["is_policy_query"] is False
    assert product_inquire_data["policy_type"] is None
    assert product_inquire_data["matched_policy"] is None
