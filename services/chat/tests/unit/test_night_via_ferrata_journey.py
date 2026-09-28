import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_night_via_ferrata_journey():
    """Multi-step API journey test for Alpine Via Ferrata Night Suspension & Moonlight Traverse Tooling:

    Step 1: Health & readiness check (/healthz, /ready, /api/status).
    Step 2: List routes (/api/night-via-ferrata/routes), filter by nocturnal_style.
    Step 3: Fetch specific route detail (/api/night-via-ferrata/routes/dolomites-kellner-night-traverse) and 404.
    Step 4: Post calculate dynamics (/api/night-via-ferrata/calculate) and 404 for unknown route.
    Step 5: Get gear checklist (/api/night-via-ferrata/gear).
    Step 6: Test create_response endpoint with mock client, verifying night_via_ferrata_info in response payload.
    Step 7: Test create_response/stream SSE endpoint verifying SSE data events (night_via_ferrata_lookup / night_via_ferrata_calculated and night_via_ferrata_info).
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
        # Step 2: List routes (/api/night-via-ferrata/routes), filter by nocturnal_style
        # -------------------------------------------------------------------------
        res2 = client.get("/api/night-via-ferrata/routes")
        assert res2.status_code == 200
        routes = res2.json()
        assert len(routes) == 5
        route_ids = [r["route_id"] for r in routes]
        assert "dolomites-kellner-night-traverse" in route_ids
        assert "ouray-canyon-night-ferrata" in route_ids
        assert "telluride-krogerata-moonlight" in route_ids
        assert "mammoth-pass-starlight-traverse" in route_ids
        assert "chamonix-aiguilles-rouges-darksky" in route_ids

        # Also test without /api prefix
        res2_no_prefix = client.get("/night-via-ferrata/routes")
        assert res2_no_prefix.status_code == 200
        assert len(res2_no_prefix.json()) == 5

        # Filter by nocturnal_style=moonlight_ridge
        res2_filt = client.get("/api/night-via-ferrata/routes?nocturnal_style=moonlight_ridge")
        assert res2_filt.status_code == 200
        filt_routes = res2_filt.json()
        assert len(filt_routes) == 1
        assert filt_routes[0]["route_id"] == "dolomites-kellner-night-traverse"

        # -------------------------------------------------------------------------
        # Step 3: Fetch specific route detail & 404 for unknown
        # -------------------------------------------------------------------------
        res3 = client.get("/api/night-via-ferrata/routes/dolomites-kellner-night-traverse")
        assert res3.status_code == 200
        detail = res3.json()
        assert detail["route_id"] == "dolomites-kellner-night-traverse"
        assert detail["title"] == "Dolomites Kellner Night Traverse"
        assert detail["suspension_bridge_span_m"] == 45
        assert detail["vertical_drop_m"] == 620
        assert len(detail["highlights"]) >= 3

        res3_no_prefix = client.get("/night-via-ferrata/routes/dolomites-kellner-night-traverse")
        assert res3_no_prefix.status_code == 200
        assert res3_no_prefix.json()["route_id"] == "dolomites-kellner-night-traverse"

        # 404 for nonexistent route
        res3_404 = client.get("/api/night-via-ferrata/routes/nonexistent-night-route")
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Post calculate dynamics & 404 for unknown route
        # -------------------------------------------------------------------------
        calc_payload = {
            "route_id": "dolomites-kellner-night-traverse",
            "moonlight_condition": "quarter_crescent",
            "headlamp_lumens": 800.0,
            "wind_gusts_kph": 25.0,
            "temperature_c": 2.0,
        }
        res4 = client.post("/api/night-via-ferrata/calculate", json=calc_payload)
        assert res4.status_code == 200
        calc_data = res4.json()
        assert calc_data["route_id"] == "dolomites-kellner-night-traverse"
        assert calc_data["effective_visibility_meters"] == 53
        assert calc_data["bridge_sway_amplitude_cm"] == 22
        assert calc_data["hypothermia_risk_index"] == 6
        assert calc_data["safety_rating"] == "optimal_moonlight_ascent"

        res4_no_prefix = client.post("/night-via-ferrata/calculate", json=calc_payload)
        assert res4_no_prefix.status_code == 200
        assert res4_no_prefix.json()["route_id"] == "dolomites-kellner-night-traverse"

        # 404 for invalid route in calculate
        res4_404 = client.post("/api/night-via-ferrata/calculate", json={"route_id": "invalid-route"})
        assert res4_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 5: Get gear checklist (/api/night-via-ferrata/gear)
        # -------------------------------------------------------------------------
        res5 = client.get("/api/night-via-ferrata/gear")
        assert res5.status_code == 200
        gear_items = res5.json()
        assert len(gear_items) == 6
        gear_ids = [g["item_id"] for g in gear_items]
        assert "high-lumen-dual-beam-headlamp" in gear_ids
        assert "backup-helmet-mounted-light" in gear_ids
        assert "en958-nocturnal-energy-absorber" in gear_ids
        assert "type-k-glow-locking-carabiners" in gear_ids
        assert "insulated-windproof-via-ferrata-gloves" in gear_ids
        assert "reflective-alpine-harness-rest-sling" in gear_ids

        res5_no_prefix = client.get("/night-via-ferrata/gear")
        assert res5_no_prefix.status_code == 200
        assert len(res5_no_prefix.json()) == 6

        # -------------------------------------------------------------------------
        # Step 6: Test create_response endpoint with mock client
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "Calculate suspension bridge sway and effective visibility for Dolomites Kellner night traverse",
            "customer_id": "cust-night-ferrata-101",
        }
        res6 = client.post("/api/create_response", json=chat_req)
        assert res6.status_code == 200
        data6 = res6.json()
        assert "night_via_ferrata_info" in data6
        nvf_info = data6["night_via_ferrata_info"]
        assert nvf_info is not None
        assert "answer" in data6
        assert len(data6["answer"]) > 0

        # -------------------------------------------------------------------------
        # Step 7: Test create_response/stream SSE endpoint
        # -------------------------------------------------------------------------
        stream_req_calc = {
            "question": "Calculate headlamp lumens and bridge sway for night via ferrata on Dolomites Kellner",
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
            (e for e in parsed_events if e.get("event") in ("night_via_ferrata_calculated", "calculate")),
            None,
        )
        assert calc_event is not None
        assert "night_via_ferrata_info" in calc_event

        # Verify night_via_ferrata_info event
        info_event = next(
            (e for e in parsed_events if e.get("event") == "night_via_ferrata_info"),
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
            "question": "Tell me about Telluride Krogerata midnight iron way moonlight traverse",
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
            (e for e in parsed_lookup if e.get("event") == "night_via_ferrata_lookup"),
            None,
        )
        assert lookup_event is not None
        assert "night_via_ferrata_info" in lookup_event


@pytest.mark.anyio
async def test_night_via_ferrata_journey_real_mode_execution():
    """Step 8: Verifies night via ferrata prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Alex", "membership": "AlpineClimber", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="On the Dolomites Kellner night traverse, maintain 800+ lumens and clip both tethers on the suspension bridge."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Calculate suspension bridge sway and visibility for Dolomites Kellner night traverse"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "night_via_ferrata_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "night_via_ferrata_prompt" in call_kwargs
        assert (
            "ferrata" in call_kwargs["night_via_ferrata_prompt"].lower()
            or "night" in call_kwargs["night_via_ferrata_prompt"].lower()
        )
