import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_complete_store_hours_and_location_journey():
    """
    End-to-end API journey test for store hours & location intent assistant tooling:
    1. Check service diagnostics via GET /api/chat/status asserts 'stores' is supported.
    2. Retrieve catalog via GET /api/stores and individual lookup via GET /api/stores/{store_id}.
    3. Search via POST /api/stores/search for 'Seattle' and filtered by in-store pickup.
    4. Send standard chat query POST /api/create_response asking
       'What time does the Denver store close on Saturday?', asserting 'stores' in payload and response grounded.
    5. Send streaming query POST /api/create_response/stream asking
       'Do you have stores in Oregon with in-store pickup?', asserting event: 'stores' SSE frame precedes token chunks.
    """
    # -------------------------------------------------------------------------
    # Step 1: Check service diagnostics via GET /api/chat/status
    # -------------------------------------------------------------------------
    status_res = client.get("/api/chat/status")
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["status"] == "online"
    assert "supported_events" in status_data
    assert "stores" in status_data["supported_events"]

    # -------------------------------------------------------------------------
    # Step 2: Retrieve catalog via GET /api/stores & GET /api/stores/{store_id}
    # -------------------------------------------------------------------------
    catalog_res = client.get("/api/stores")
    assert catalog_res.status_code == 200
    catalog = catalog_res.json()
    assert isinstance(catalog, list)
    assert len(catalog) == 5

    store_map = {s["id"]: s for s in catalog}
    expected_ids = {"seattle", "denver", "portland", "salt-lake-city", "san-francisco"}
    assert set(store_map.keys()) == expected_ids

    for sid, s in store_map.items():
        assert s["id"] == sid
        assert isinstance(s["name"], str) and len(s["name"]) > 0
        assert isinstance(s["address"], str) and len(s["address"]) > 0
        assert isinstance(s["phone"], str) and len(s["phone"]) > 0
        assert isinstance(s["hours"], dict)
        assert "weekday" in s["hours"]
        assert "saturday" in s["hours"]
        assert "sunday" in s["hours"]
        assert isinstance(s["services"], list)
        assert "in-store pickup" in [srv.lower() for srv in s["services"]]

    # Test individual store lookup
    denver_res = client.get("/api/stores/denver")
    assert denver_res.status_code == 200
    assert denver_res.json()["name"] == "Denver Mountain Outpost"

    # Test 404 for unknown store
    not_found_res = client.get("/api/stores/nonexistent-location")
    assert not_found_res.status_code == 404

    # -------------------------------------------------------------------------
    # Step 3: Search via POST /api/stores/search for 'Seattle'
    # -------------------------------------------------------------------------
    search_res = client.post("/api/stores/search", json={"query": "Seattle"})
    assert search_res.status_code == 200
    search_data = search_res.json()
    assert isinstance(search_data, list)
    assert len(search_data) == 1
    assert search_data[0]["id"] == "seattle"
    assert search_data[0]["name"] == "Seattle Flagship"
    assert "WA" in search_data[0]["state"] or "Washington" in search_data[0]["address"]

    # Search with pickup filter
    pickup_search_res = client.post(
        "/api/stores/search",
        json={"query": "Oregon", "has_pickup": True},
    )
    assert pickup_search_res.status_code == 200
    pickup_data = pickup_search_res.json()
    assert len(pickup_data) == 1
    assert pickup_data[0]["id"] == "portland"
    assert pickup_data[0]["name"] == "Portland Trailhead"

    # -------------------------------------------------------------------------
    # Step 4: Send standard chat query POST /api/create_response asking
    #         'What time does the Denver store close on Saturday?',
    #         asserting 'stores' in payload and response grounded.
    # -------------------------------------------------------------------------
    with patch("main.REAL_CHAT_AVAILABLE", False):
        chat_res = client.post(
            "/api/create_response",
            json={"question": "What time does the Denver store close on Saturday?"},
        )
        assert chat_res.status_code == 200
        chat_data = chat_res.json()

        assert "stores" in chat_data
        stores_in_chat = chat_data["stores"]
        assert isinstance(stores_in_chat, list)
        assert len(stores_in_chat) >= 1
        denver_store = next((s for s in stores_in_chat if s["id"] == "denver"), None)
        assert denver_store is not None
        assert denver_store["name"] == "Denver Mountain Outpost"
        assert "7:00 PM" in denver_store["hours"]["saturday"]

        # Assert answer is grounded with Denver store details
        answer = chat_data["answer"]
        assert any(
            phrase in answer.lower()
            for phrase in ["denver", "mountain outpost", "7:00 pm", "hours", "saturday"]
        )

    # -------------------------------------------------------------------------
    # Step 5: Send streaming query POST /api/create_response/stream asking
    #         'Do you have stores in Oregon with in-store pickup?',
    #         asserting event: 'stores' SSE frame precedes token chunks.
    # -------------------------------------------------------------------------
    with patch("main.REAL_CHAT_AVAILABLE", False):
        stream_res = client.post(
            "/api/create_response/stream",
            json={"question": "Do you have stores in Oregon with in-store pickup?"},
        )
        assert stream_res.status_code == 200
        assert "text/event-stream" in stream_res.headers.get("content-type", "")

        raw_frames = [
            chunk.strip()
            for chunk in stream_res.text.split("\n\n")
            if chunk.strip() and chunk.strip() != "data: [DONE]"
        ]

        parsed_events = []
        for raw in raw_frames:
            assert raw.startswith("data: ")
            payload = json.loads(raw.removeprefix("data: "))
            parsed_events.append(payload)

        # Verify event: 'stores' is emitted
        stores_event = next((e for e in parsed_events if e.get("event") == "stores"), None)
        assert stores_event is not None
        assert "stores" in stores_event
        matched_stores = stores_event["stores"]
        assert any(s["id"] == "portland" for s in matched_stores)

        # Verify event: 'stores' appears before any 'chunk' (token) events
        stores_idx = next(i for i, e in enumerate(parsed_events) if e.get("event") == "stores")
        chunk_indices = [i for i, e in enumerate(parsed_events) if "chunk" in e]
        assert len(chunk_indices) > 0
        assert stores_idx < chunk_indices[0], "Stores SSE frame must be emitted before text chunk tokens"

        # Verify token chunks contain grounded answers regarding in-store pickup
        full_stream_text = "".join(e["chunk"] for e in parsed_events if "chunk" in e)
        assert any(
            phrase in full_stream_text.lower()
            for phrase in ["portland", "in-store pickup", "pickup", "trailhead"]
        )


@pytest.mark.anyio
async def test_store_journey_real_mode_execution():
    """Verifies end-to-end store grounding when real chat logic is invoked."""
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
        new=AsyncMock(return_value="The Seattle Flagship store is at 220 Pike Street and closes at 8:00 PM."),
    ) as mock_llm, patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response",
            json={"question": "Where is your Seattle store and what are the hours?"},
        )
        assert res.status_code == 200
        data = res.json()

        assert "stores" in data
        assert any(s["id"] == "seattle" for s in data["stores"])
        assert "Seattle Flagship" in data["answer"]

        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "store_prompt" in call_kwargs
        assert "Seattle Flagship" in call_kwargs["store_prompt"]
