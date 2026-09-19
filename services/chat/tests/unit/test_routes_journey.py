import json
import xml.etree.ElementTree as ET
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_wilderness_gps_navigation_and_routes_journey():
    """Multi-step API journey test for Wilderness GPS Navigation & GPX Waypoint Tooling:

    Step 1: GET /api/routes?difficulty=expert -> assert Enchantments Thru-Hike returned.
    Step 2: GET /api/routes/enchantments-thru-hike -> assert waypoints including Aasgard Pass and Colchuck Lake.
    Step 3: POST /api/routes/export with { "route_id": "enchantments-thru-hike", "format": "gpx" } ->
            verify valid GPX XML content and filename.
    Step 4: POST /api/create_response and SSE stream POST /api/create_response/stream ->
            verify event: route_info frame and data: [DONE].
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Filter routes by difficulty
        # -------------------------------------------------------------------------
        res1 = client.get("/api/routes?difficulty=expert")
        assert res1.status_code == 200
        expert_routes = res1.json()
        assert len(expert_routes) >= 1
        assert any(r["route_id"] == "enchantments-thru-hike" for r in expert_routes)
        ench = next(r for r in expert_routes if r["route_id"] == "enchantments-thru-hike")
        assert ench["name"] == "The Enchantments Thru-Hike"
        assert ench["difficulty"] == "expert"
        assert ench["distance_miles"] == 18.5
        assert ench["elevation_gain_feet"] == 4500

        # Also verify other filters like region
        res_rainier = client.get("/api/routes?region=Mount Rainier")
        assert res_rainier.status_code == 200
        assert any(r["route_id"] == "spray-park-loop" for r in res_rainier.json())

        # -------------------------------------------------------------------------
        # Step 2: Retrieve route details by ID
        # -------------------------------------------------------------------------
        res2 = client.get("/api/routes/enchantments-thru-hike")
        assert res2.status_code == 200
        route_detail = res2.json()
        assert route_detail["route_id"] == "enchantments-thru-hike"
        assert route_detail["name"] == "The Enchantments Thru-Hike"
        waypoints = route_detail.get("waypoints", [])
        assert len(waypoints) > 0
        wp_names = [w["name"] for w in waypoints]
        assert any("Aasgard Pass" in name for name in wp_names)
        assert any("Colchuck Lake" in name for name in wp_names)

        # Also test 404 for unknown route
        res2_404 = client.get("/api/routes/unknown-route-999")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Export route GPX file
        # -------------------------------------------------------------------------
        export_payload = {
            "route_id": "enchantments-thru-hike",
            "format": "gpx",
            "include_waypoints": True,
        }
        res3 = client.post("/api/routes/export", json=export_payload)
        assert res3.status_code == 200
        export_data = res3.json()
        assert export_data["route_id"] == "enchantments-thru-hike"
        assert export_data["format"] == "gpx"
        assert export_data["filename"] == "enchantments-thru-hike.gpx"
        assert export_data["file_size_bytes"] > 0

        # Verify valid GPX XML content
        gpx_content = export_data["content"]
        assert gpx_content.startswith("<?xml")
        xml_root = ET.fromstring(gpx_content)
        assert xml_root.tag.endswith("gpx")
        assert "Aasgard Pass" in gpx_content
        assert "Colchuck Lake" in gpx_content

        # Also verify 404 on export of invalid route
        res3_404 = client.post("/api/routes/export", json={"route_id": "nonexistent"})
        assert res3_404.status_code == 404

        # Verify GPS navigation safety protocol endpoint
        res_safety = client.get("/api/routes/safety/protocol")
        assert res_safety.status_code == 200
        safety_data = res_safety.json()
        assert "offline_navigation" in safety_data
        assert "satellite_communicator" in safety_data
        assert safety_data.get("map_datum") == "WGS84"

        # -------------------------------------------------------------------------
        # Step 4: Chat assistant interaction via POST /api/create_response
        # and SSE streaming via POST /api/create_response/stream
        # -------------------------------------------------------------------------
        # 4a. Synchronous /api/create_response
        chat_req = {
            "question": "Can I download the GPX track and waypoints for the Enchantments Thru-Hike?",
            "customer_id": "cust-gps-123",
        }
        res4_sync = client.post("/api/create_response", json=chat_req)
        assert res4_sync.status_code == 200
        data4_sync = res4_sync.json()
        assert "route_info" in data4_sync
        route_info = data4_sync["route_info"]
        assert route_info["action"] in ("export", "waypoints", "details")
        assert "enchantments-thru-hike" in str(route_info)
        assert "enchantments-thru-hike.gpx" in data4_sync["answer"] or "Enchantments" in data4_sync["answer"]

        # 4b. SSE streaming POST /api/create_response/stream
        stream_res = client.post(
            "/api/create_response/stream",
            json={"question": "Can I download the GPX track and waypoints for the Enchantments Thru-Hike?"},
        )
        assert stream_res.status_code == 200
        raw_events = [line.strip() for line in stream_res.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        route_event = next((e for e in parsed_events if e.get("event") == "route_info"), None)
        assert route_event is not None
        assert "route_info" in route_event
        stream_route_info = route_event["route_info"]
        assert stream_route_info is not None
        assert "action" in stream_route_info

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Enchantments" in full_text


@pytest.mark.anyio
async def test_routes_journey_real_mode_execution():
    """Verifies route prompt injection and payload parity in real mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with patch(
        "contoso_chat.chat_request.get_customer_from_postgres",
        new=AsyncMock(return_value={"firstName": "Taylor", "membership": "Gold", "orders": []}),
    ), patch(
        "contoso_chat.chat_request.get_search_service",
        return_value=mock_search_service,
    ), patch(
        "contoso_chat.chat_request.generate_llm_response",
        new=AsyncMock(
            return_value="Here is your Enchantments GPX route download with all key waypoints."
        ),
    ) as mock_llm, patch("main.REAL_CHAT_AVAILABLE", True):
        res = client.post(
            "/api/create_response",
            json={"question": "Where can I download the GPX route for the Enchantments thru-hike?"},
        )
        assert res.status_code == 200
        data = res.json()

        assert "route_info" in data
        assert data["route_info"]["action"] in ("export", "details", "waypoints")
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "route_prompt" in call_kwargs
        assert "Wilderness Route Navigation System" in call_kwargs["route_prompt"]
        assert "Enchantments" in call_kwargs["route_prompt"]
