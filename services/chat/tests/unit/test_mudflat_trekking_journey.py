import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_mudflat_trekking_journey():
    """Multi-step API journey test for Wilderness Tidal Flat Mud-Trekking Tooling:

    Step 1: Health & readiness check (/healthz, /ready, /api/status).
    Step 2: List routes (/api/mudflat-trekking/routes), filter by terrain.
    Step 3: Fetch specific route detail (/api/mudflat-trekking/routes/wadden-sea-neuwerk-traverse) and 404.
    Step 4: Post calculate dynamics (/api/mudflat-trekking/calculate) and 404 for unknown route.
    Step 5: Get gear checklist (/api/mudflat-trekking/gear).
    Step 6: Test create_response endpoint with mock client, verifying mudflat_trekking_info in response payload.
    Step 7: Test create_response/stream SSE endpoint verifying SSE data events (mudflat_trekking_lookup / mudflat_trekking_calculated and mudflat_trekking_info).
    """
    # -------------------------------------------------------------------------
    # Step 1: Health & readiness check
    # -------------------------------------------------------------------------
    res_healthz = client.get("/healthz")
    assert res_healthz.status_code == 200
    assert res_healthz.json()["status"] == "healthy"

    res_ready = client.get("/ready")
    assert res_ready.status_code == 200
    assert res_ready.json()["status"] == "healthy"

    res_status = client.get("/api/status")
    assert res_status.status_code == 200
    assert res_status.json()["status"] == "online"

    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 2: List routes (/api/mudflat-trekking/routes), filter by terrain
        # -------------------------------------------------------------------------
        res2 = client.get("/api/mudflat-trekking/routes")
        assert res2.status_code == 200
        routes = res2.json()
        assert len(routes) == 5
        route_ids = [r["route_id"] for r in routes]
        assert "wadden-sea-neuwerk-traverse" in route_ids
        assert "bay-of-fundy-miners-marsh" in route_ids
        assert "mont-saint-michel-bay" in route_ids
        assert "morecambe-bay-sands" in route_ids
        assert "turnagain-arm-mudflats" in route_ids

        # Without /api prefix
        res2_no_prefix = client.get("/mudflat-trekking/routes")
        assert res2_no_prefix.status_code == 200
        assert len(res2_no_prefix.json()) == 5

        # Filter by terrain=firm_compact_sand
        res2_filt = client.get("/api/mudflat-trekking/routes?terrain=firm_compact_sand")
        assert res2_filt.status_code == 200
        filt_routes = res2_filt.json()
        assert len(filt_routes) == 1
        assert filt_routes[0]["route_id"] == "morecambe-bay-sands"

        # -------------------------------------------------------------------------
        # Step 3: Fetch specific route detail & 404 for unknown
        # -------------------------------------------------------------------------
        res3 = client.get("/api/mudflat-trekking/routes/wadden-sea-neuwerk-traverse")
        assert res3.status_code == 200
        detail = res3.json()
        assert detail["route_id"] == "wadden-sea-neuwerk-traverse"
        assert detail["title"] == "Wadden Sea Neuwerk Traverse"
        assert detail["route_distance_km"] == 12.5
        assert detail["tidal_window_hours"] == 4.0
        assert detail["terrain_profile"] == "soft_estuary_silt"
        assert len(detail["highlights"]) >= 3

        res3_no_prefix = client.get("/mudflat-trekking/routes/wadden-sea-neuwerk-traverse")
        assert res3_no_prefix.status_code == 200
        assert res3_no_prefix.json()["route_id"] == "wadden-sea-neuwerk-traverse"

        # 404 for nonexistent route
        res3_404 = client.get("/api/mudflat-trekking/routes/nonexistent-route")
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Post calculate dynamics & 404 for unknown route
        # -------------------------------------------------------------------------
        calc_payload = {
            "route_id": "wadden-sea-neuwerk-traverse",
            "silt_depth_cm": 25.0,
            "trekker_pace_kph": 3.2,
            "elapsed_time_minutes": 45.0,
            "tidal_phase": "slack_low_tide",
        }
        res4 = client.post("/api/mudflat-trekking/calculate", json=calc_payload)
        assert res4.status_code == 200
        calc_data = res4.json()
        assert calc_data["route_id"] == "wadden-sea-neuwerk-traverse"
        assert calc_data["remaining_tidal_window_minutes"] == 195
        assert calc_data["silt_suction_drag_index"] == 6
        assert calc_data["prielen_wading_depth_cm"] == 45
        assert calc_data["tidal_hazard_rating"] == "safe_low_tide_window"

        res4_no_prefix = client.post("/mudflat-trekking/calculate", json=calc_payload)
        assert res4_no_prefix.status_code == 200
        assert res4_no_prefix.json()["route_id"] == "wadden-sea-neuwerk-traverse"

        # 404 for invalid route in calculate
        res4_404 = client.post("/api/mudflat-trekking/calculate", json={"route_id": "invalid-route"})
        assert res4_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 5: Get gear checklist (/api/mudflat-trekking/gear)
        # -------------------------------------------------------------------------
        res5 = client.get("/api/mudflat-trekking/gear")
        assert res5.status_code == 200
        gear_items = res5.json()
        assert len(gear_items) == 6
        gear_ids = [g["item_id"] for g in gear_items]
        assert "neoprene-mudflat-suction-booties" in gear_ids
        assert "wattwandern-wading-staff" in gear_ids
        assert "waterproof-tide-table-and-sighting-compass" in gear_ids
        assert "high-decibel-marine-whistle-signal-mirror" in gear_ids
        assert "submersible-floating-vhf-radio-plb" in gear_ids
        assert "ultralight-hypothermia-mudflat-bivy" in gear_ids

        res5_no_prefix = client.get("/mudflat-trekking/gear")
        assert res5_no_prefix.status_code == 200
        assert len(res5_no_prefix.json()) == 6

        # -------------------------------------------------------------------------
        # Step 6: Test create_response endpoint with mock client
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "Calculate mudflat trekking dynamics and prielen creek depth for Wadden Sea Neuwerk traverse",
            "customer_id": "cust-mudflat-101",
        }
        res6 = client.post("/api/create_response", json=chat_req)
        assert res6.status_code == 200
        data6 = res6.json()
        assert "mudflat_trekking_info" in data6
        mf_info = data6["mudflat_trekking_info"]
        assert mf_info is not None
        assert "answer" in data6
        assert len(data6["answer"]) > 0

        # -------------------------------------------------------------------------
        # Step 7: Test create_response/stream SSE endpoint
        # -------------------------------------------------------------------------
        stream_req_calc = {
            "question": "Calculate mudflat dynamics and quicksilt suction drag for Wadden Sea Neuwerk",
        }
        res7_calc = client.post("/api/create_response/stream", json=stream_req_calc)
        assert res7_calc.status_code == 200
        raw_chunks = [c.strip() for c in res7_calc.text.split("\n\n") if c.strip()]
        assert "data: [DONE]" in raw_chunks

        parsed_events = []
        for line in raw_chunks:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        # Verify custom calculation event
        calc_event = next(
            (e for e in parsed_events if e.get("event") in ("mudflat_trekking_calculated", "calculate")),
            None,
        )
        assert calc_event is not None
        assert "mudflat_trekking_info" in calc_event

        # Verify mudflat_trekking_info event
        info_event = next(
            (e for e in parsed_events if e.get("event") == "mudflat_trekking_info"),
            None,
        )
        assert info_event is not None

        # Verify token streaming events
        token_events = [
            e for e in parsed_events if "chunk" in e or "token" in e or e.get("event") == "token"
        ]
        assert len(token_events) > 0
        full_text = "".join(str(e.get("chunk") or e.get("token", "")) for e in token_events)
        assert len(full_text) > 0

        # Verify lookup custom event
        stream_req_lookup = {
            "question": "Tell me about Mont-Saint-Michel bay silt crossing and quicksand routes",
        }
        res7_lookup = client.post("/api/create_response/stream", json=stream_req_lookup)
        assert res7_lookup.status_code == 200
        raw_chunks_lookup = [c.strip() for c in res7_lookup.text.split("\n\n") if c.strip()]
        assert "data: [DONE]" in raw_chunks_lookup

        parsed_lookup = []
        for line in raw_chunks_lookup:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_lookup.append(json.loads(line.removeprefix("data: ")))

        lookup_event = next(
            (e for e in parsed_lookup if e.get("event") == "mudflat_trekking_lookup"),
            None,
        )
        assert lookup_event is not None
        assert "mudflat_trekking_info" in lookup_event


@pytest.mark.anyio
async def test_mudflat_trekking_journey_real_mode_execution():
    """Step 8: Verifies mudflat trekking prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Alex", "membership": "MudflatExplorer", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="On the Wadden Sea traverse, monitor the remaining tidal window and prielen creek depth."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Calculate mudflat trekking dynamics and prielen creek depth for Wadden Sea Neuwerk"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "mudflat_trekking_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "mudflat_trekking_prompt" in call_kwargs
        assert (
            "mudflat" in call_kwargs["mudflat_trekking_prompt"].lower()
            or "wattwandern" in call_kwargs["mudflat_trekking_prompt"].lower()
        )
