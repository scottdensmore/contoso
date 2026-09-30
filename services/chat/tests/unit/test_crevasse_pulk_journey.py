import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_crevasse_pulk_journey():
    """Multi-step API journey test for Alpine Glacial Sledging & Crevasse Pulk Expedition Logistics Tooling:

    Step 1: Check health and status endpoints (/health, /healthz, /ready, /api/status).
    Step 2: Query /crevasse-pulk/routes and /api/crevasse-pulk/routes with query filters.
    Step 3: Query /crevasse-pulk/routes/denali-kahiltna-glacier-highway and verify 404 for unknown route.
    Step 4: Post /crevasse-pulk/calculate and verify 404 for invalid route.
    Step 5: Query /crevasse-pulk/gear and verify 6 mandatory gear items.
    Step 6: Chat create_response for crevasse pulk inquiries via /chat and /api/create_response.
    Step 7: Chat create_response/stream verifying SSE tokens and custom events (crevasse_pulk_calculated and crevasse_pulk_lookup).
    """
    # -------------------------------------------------------------------------
    # Step 1: Health & Status checks
    # -------------------------------------------------------------------------
    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"

    res_healthz = client.get("/healthz")
    assert res_healthz.status_code == 200

    res_ready = client.get("/ready")
    assert res_ready.status_code == 200

    res_status = client.get("/api/status")
    assert res_status.status_code == 200
    status_data = res_status.json()
    assert status_data["status"] == "online"
    assert "model_provider" in status_data

    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 2: Query crevasse pulk routes catalog
        # -------------------------------------------------------------------------
        res_routes = client.get("/crevasse-pulk/routes")
        assert res_routes.status_code == 200
        routes = res_routes.json()
        assert len(routes) == 5
        route_ids = [r["id"] for r in routes]
        assert "denali-kahiltna-glacier-highway" in route_ids
        assert "bagley-icefield-traverse" in route_ids
        assert "ruth-gorge-great-gorge-freight" in route_ids
        assert "columbia-icefield-athabasca" in route_ids
        assert "mount-rainier-ingraham-glacier" in route_ids

        # Test prefixed route /api/crevasse-pulk/routes
        res_api_routes = client.get("/api/crevasse-pulk/routes")
        assert res_api_routes.status_code == 200
        assert len(res_api_routes.json()) == 5

        # Filter by terrain=crevassed_icefall_labyrinth
        res_labyrinth = client.get("/crevasse-pulk/routes?terrain=crevassed_icefall_labyrinth")
        assert res_labyrinth.status_code == 200
        labyrinth_data = res_labyrinth.json()
        assert len(labyrinth_data) == 1
        assert labyrinth_data[0]["id"] == "denali-kahiltna-glacier-highway"

        # Filter by risk=moderate
        res_moderate = client.get("/crevasse-pulk/routes?risk=moderate")
        assert res_moderate.status_code == 200
        assert len(res_moderate.json()) == 2

        # -------------------------------------------------------------------------
        # Step 3: Query single route details
        # -------------------------------------------------------------------------
        res_denali = client.get("/crevasse-pulk/routes/denali-kahiltna-glacier-highway")
        assert res_denali.status_code == 200
        denali = res_denali.json()
        assert denali["id"] == "denali-kahiltna-glacier-highway"
        assert denali["title"] == "Denali Kahiltna Glacier Pulk Ascent"
        assert denali["region"] == "Alaska Range, Alaska, USA"
        assert denali["system"] == "Kahiltna Glacier Basin"
        assert denali["elevation_m"] == 2200
        assert denali["average_slope_deg"] == 8.5
        assert denali["crevasse_risk"] == "high"
        assert denali["primary_rigging"] == "rigid_fiberglass_shaft_harness"
        assert denali["terrain"] == "crevassed_icefall_labyrinth"
        assert len(denali["highlights"]) == 3

        # Prefixed single route lookup /api/crevasse-pulk/routes/denali-kahiltna-glacier-highway
        res_api_single = client.get("/api/crevasse-pulk/routes/denali-kahiltna-glacier-highway")
        assert res_api_single.status_code == 200
        assert res_api_single.json()["id"] == "denali-kahiltna-glacier-highway"

        # 404 for unknown route
        res_404 = client.get("/crevasse-pulk/routes/unknown-icefield-route")
        assert res_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Pulk Dynamics Calculation
        # -------------------------------------------------------------------------
        calc_payload = {
            "route_id": "denali-kahiltna-glacier-highway",
            "rigging_system": "rigid_fiberglass_shaft_harness",
            "payload_kg": 50.0,
            "hauler_weight_kg": 78.0,
            "incline_degrees": 8.5,
            "snow_condition": "wind_packed_firn",
            "crevasse_hazard": "high",
        }
        res_calc = client.post("/crevasse-pulk/calculate", json=calc_payload)
        assert res_calc.status_code == 200
        calc_res = res_calc.json()
        assert calc_res["route_id"] == "denali-kahiltna-glacier-highway"
        assert "Denali" in calc_res["route_title"]
        assert calc_res["tow_force_newtons"] > 0
        assert calc_res["gravity_force_newtons"] > 0
        assert calc_res["friction_force_newtons"] > 0
        assert calc_res["downhill_overrun_joules"] > 0
        assert calc_res["crevasse_arrest_force_kilonewtons"] > 0
        assert calc_res["arrest_safety"] == "nominal_dynamic_hold"
        assert "rigging_advisory" in calc_res
        assert "crevasse_extraction_protocol" in calc_res

        # Test prefixed route /api/crevasse-pulk/calculate
        res_api_calc = client.post("/api/crevasse-pulk/calculate", json=calc_payload)
        assert res_api_calc.status_code == 200
        assert res_api_calc.json()["route_id"] == "denali-kahiltna-glacier-highway"

        # 404 for invalid route in calculate
        res_calc_404 = client.post(
            "/crevasse-pulk/calculate", json={"route_id": "unknown-abyss-glacier"}
        )
        assert res_calc_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 5: Pulk Gear Checklist
        # -------------------------------------------------------------------------
        res_gear = client.get("/crevasse-pulk/gear")
        assert res_gear.status_code == 200
        gear_items = res_gear.json()
        assert len(gear_items) == 6
        assert all(g["mandatory"] is True for g in gear_items)
        gear_ids = [g["id"] for g in gear_items]
        assert "reinforced-uhmwpe-expedition-pulk" in gear_ids
        assert "rigid-fiberglass-crossover-shafts" in gear_ids
        assert "downhill-trailing-rope-brake" in gear_ids
        assert "crevasse-arrest-prussik-haul-rig" in gear_ids
        assert "dual-directional-crevasse-fluke" in gear_ids
        assert "sub-zero-sled-lashing-cover" in gear_ids

        # Test prefixed route /api/crevasse-pulk/gear
        res_api_gear = client.get("/api/crevasse-pulk/gear")
        assert res_api_gear.status_code == 200
        assert len(res_api_gear.json()) == 6

        # -------------------------------------------------------------------------
        # Step 6: Chat create_response
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the recommended pulk rigging system for Denali Kahiltna Glacier Pulk Ascent?",
            "customer_id": "cust-pulk-101",
        }
        res6 = client.post("/chat", json=chat_req)
        assert res6.status_code == 200
        chat_data = res6.json()
        assert "crevasse_pulk_info" in chat_data
        cp_info = chat_data["crevasse_pulk_info"]
        assert cp_info is not None
        assert "answer" in chat_data
        assert len(chat_data["answer"]) > 0

        # Also test via /api/create_response and /api/chat
        res6_api = client.post("/api/create_response", json=chat_req)
        assert res6_api.status_code == 200
        assert "crevasse_pulk_info" in res6_api.json()

        res6_chat = client.post("/api/chat", json=chat_req)
        assert res6_chat.status_code == 200
        assert "crevasse_pulk_info" in res6_chat.json()

        # -------------------------------------------------------------------------
        # Step 7: Chat create_response/stream SSE tokens and custom events
        # -------------------------------------------------------------------------
        # Test calculation custom event via /chat/stream
        stream_req_calc = {
            "question": "Calculate pulk tow force and overrun dynamics on Denali Kahiltna Glacier",
        }
        res7_calc = client.post("/chat/stream", json=stream_req_calc)
        assert res7_calc.status_code == 200
        raw_chunks = [c.strip() for c in res7_calc.text.split("\n\n") if c.strip()]
        assert "data: [DONE]" in raw_chunks

        parsed_events = []
        for line in raw_chunks:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        calc_event = next(
            (e for e in parsed_events if e.get("event") == "crevasse_pulk_calculated"),
            None,
        )
        assert calc_event is not None
        assert "crevasse_pulk_info" in calc_event
        assert calc_event["crevasse_pulk_info"]["action"] == "calculate"

        token_events = [
            e
            for e in parsed_events
            if "chunk" in e or "token" in e or e.get("event") == "token"
        ]
        assert len(token_events) > 0
        full_text = "".join(
            str(e.get("chunk") or e.get("token", "")) for e in token_events
        )
        assert len(full_text) > 0

        # Test lookup custom event via /api/create_response/stream
        stream_req_lookup = {
            "question": "Tell me about Bagley Icefield Polar Traverse sled haul details",
        }
        res7_lookup = client.post(
            "/api/create_response/stream", json=stream_req_lookup
        )
        assert res7_lookup.status_code == 200
        raw_chunks_lookup = [
            c.strip() for c in res7_lookup.text.split("\n\n") if c.strip()
        ]
        assert "data: [DONE]" in raw_chunks_lookup

        parsed_lookup = []
        for line in raw_chunks_lookup:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_lookup.append(json.loads(line.removeprefix("data: ")))

        lookup_event = next(
            (e for e in parsed_lookup if e.get("event") == "crevasse_pulk_lookup"),
            None,
        )
        assert lookup_event is not None
        assert "crevasse_pulk_info" in lookup_event


@pytest.mark.anyio
async def test_crevasse_pulk_journey_real_mode_execution():
    """Step 8: Verifies crevasse pulk prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Rowan",
                    "membership": "Explorer",
                    "orders": [],
                }
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="On Denali Kahiltna Glacier, rigid fiberglass shafts prevent sled overrun during steep descents."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the recommended pulk rigging system for Denali Kahiltna Glacier Pulk Ascent?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "crevasse_pulk_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "crevasse_pulk_prompt" in call_kwargs
        prompt_content = call_kwargs["crevasse_pulk_prompt"].lower()
        assert (
            "pulk" in prompt_content
            or "crevasse" in prompt_content
            or "glacial" in prompt_content
            or "shaft" in prompt_content
        )
