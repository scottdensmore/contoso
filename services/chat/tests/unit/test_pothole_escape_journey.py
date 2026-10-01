import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_pothole_escape_journey():
    """Multi-step API journey test for Backcountry Desert Slot Canyon Pot-Hole Escape & Ghost Structure Anchor Rigging:

    Step 1: Check health and status endpoints (/health, /healthz, /ready, /api/status).
    Step 2: Query /pothole-escape/routes and /api/pothole-escape/routes with filters & single route with 404.
    Step 3: Post /pothole-escape/calculate for nominal and critical hazards, and verify 404 for invalid route.
    Step 4: Query /pothole-escape/gear and /api/pothole-escape/gear, verifying 6 mandatory gear items.
    Step 5: Chat create_response for pothole escape inquiries via /chat, /api/create_response, and /api/chat.
    Step 6: Chat create_response/stream verifying SSE tokens and custom events (pothole_escape_calculated, pothole_escape_lookup, pothole_escape_info, [DONE]).
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
        # Step 2: Query pothole escape routes catalog & single route & 404
        # -------------------------------------------------------------------------
        res_routes = client.get("/pothole-escape/routes")
        assert res_routes.status_code == 200
        routes = res_routes.json()
        assert len(routes) == 5
        route_ids = [r["id"] for r in routes]
        assert "neon-canyon-golden-cathedral" in route_ids
        assert "choprock-canyon-keepers" in route_ids
        assert "black-hole-white-canyon" in route_ids
        assert "imlay-canyon-sneffels" in route_ids
        assert "heaps-canyon-emerald-pools" in route_ids

        # Test prefixed route /api/pothole-escape/routes
        res_api_routes = client.get("/api/pothole-escape/routes")
        assert res_api_routes.status_code == 200
        assert len(res_api_routes.json()) == 5

        # Filter by technique=sandtrap_ghost_anchor
        res_sandtrap = client.get("/pothole-escape/routes?technique=sandtrap_ghost_anchor")
        assert res_sandtrap.status_code == 200
        sandtrap_data = res_sandtrap.json()
        assert len(sandtrap_data) == 2
        sandtrap_ids = [r["id"] for r in sandtrap_data]
        assert "neon-canyon-golden-cathedral" in sandtrap_ids
        assert "heaps-canyon-emerald-pools" in sandtrap_ids

        # Filter by technique=pot_hole_escape_hook
        res_hook = client.get("/api/pothole-escape/routes?technique=pot_hole_escape_hook")
        assert res_hook.status_code == 200
        assert len(res_hook.json()) == 1
        assert res_hook.json()[0]["id"] == "choprock-canyon-keepers"

        # Query single route details
        res_neon = client.get("/pothole-escape/routes/neon-canyon-golden-cathedral")
        assert res_neon.status_code == 200
        neon = res_neon.json()
        assert neon["id"] == "neon-canyon-golden-cathedral"
        assert neon["title"] == "Neon Canyon Golden Cathedral Keeper Escapes"
        assert neon["region"] == "Escalante, Utah"
        assert neon["range"] == "Grand Staircase-Escalante National Monument"
        assert neon["depth_meters"] == 18.0
        assert neon["primary_technique"] == "sandtrap_ghost_anchor"
        assert neon["lip_friction_angle_degrees"] == 60.0
        assert len(neon["highlights"]) == 3

        # Prefixed single route lookup /api/pothole-escape/routes/neon-canyon-golden-cathedral
        res_api_single = client.get("/api/pothole-escape/routes/neon-canyon-golden-cathedral")
        assert res_api_single.status_code == 200
        assert res_api_single.json()["id"] == "neon-canyon-golden-cathedral"

        # 404 for unknown route
        res_404 = client.get("/pothole-escape/routes/unknown-slot-canyon")
        assert res_404.status_code == 404
        assert "not found" in res_404.json()["detail"].lower()

        res_api_404 = client.get("/api/pothole-escape/routes/unknown-slot-canyon")
        assert res_api_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Pothole Dynamics Calculation
        # -------------------------------------------------------------------------
        # Nominal calculation
        calc_payload_nominal = {
            "route_id": "neon-canyon-golden-cathedral",
            "technique": "sandtrap_ghost_anchor",
            "water_level": "bone_dry_scour",
            "wall_wetness": "dry_slickrock",
            "team_size": 3,
            "lead_climber_weight_kg": 70.0,
            "lip_height_meters": 1.5,
            "incline_angle_degrees": 35.0,
        }
        res_calc_nom = client.post("/pothole-escape/calculate", json=calc_payload_nominal)
        assert res_calc_nom.status_code == 200
        calc_res_nom = res_calc_nom.json()
        assert calc_res_nom["route_id"] == "neon-canyon-golden-cathedral"
        assert "Neon Canyon" in calc_res_nom["route_title"]
        assert calc_res_nom["effective_hoist_force_n"] > 0
        assert calc_res_nom["pack_counterweight_kg"] > 0
        assert calc_res_nom["escape_difficulty_index"] < 0.45
        assert calc_res_nom["safety_status"] == "nominal_partner_boost"
        assert "Sandtrap" in calc_res_nom["anchor_retrieval_advisory"]
        assert "NOMINAL BOOST" in calc_res_nom["tactical_escape_protocol"]

        # Critical hazard calculation (flooded flume / high lip)
        calc_payload_crit = {
            "route_id": "black-hole-white-canyon",
            "technique": "water_anchor_pack_toss",
            "water_level": "flooded_swimming_flume",
            "wall_wetness": "slippery_algae_scum",
            "team_size": 2,
            "lead_climber_weight_kg": 78.0,
            "lip_height_meters": 4.6,
            "incline_angle_degrees": 70.0,
        }
        res_calc_crit = client.post("/api/pothole-escape/calculate", json=calc_payload_crit)
        assert res_calc_crit.status_code == 200
        calc_res_crit = res_calc_crit.json()
        assert calc_res_crit["safety_status"] == "critical_keeper_trap_hazard"
        assert "CRITICAL HAZARD" in calc_res_crit["tactical_escape_protocol"]

        # 404 for invalid route in calculate
        res_calc_404 = client.post(
            "/pothole-escape/calculate", json={"route_id": "unknown-abyss-slot"}
        )
        assert res_calc_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Pothole Gear Checklist
        # -------------------------------------------------------------------------
        res_gear = client.get("/pothole-escape/gear")
        assert res_gear.status_code == 200
        gear_items = res_gear.json()
        assert len(gear_items) == 6
        assert all(g["mandatory"] is True for g in gear_items)
        gear_ids = [g["item_id"] for g in gear_items]
        assert "sandtrap-ghosting-anchor" in gear_ids
        assert "telescoping-cheater-stick" in gear_ids
        assert "talon-pothole-escape-hooks" in gear_ids
        assert "water-pack-toss-cord" in gear_ids
        assert "foot-stirrup-etrier" in gear_ids
        assert "full-neoprene-wetsuit" in gear_ids

        # Test prefixed route /api/pothole-escape/gear
        res_api_gear = client.get("/api/pothole-escape/gear")
        assert res_api_gear.status_code == 200
        assert len(res_api_gear.json()) == 6

        # -------------------------------------------------------------------------
        # Step 5: Chat create_response for gear and calculation
        # -------------------------------------------------------------------------
        # Gear inquiry via /chat
        chat_req_gear = {
            "question": "What is the mandatory gear checklist for keeper pothole escape and ghost rigging?",
            "customer_id": "cust-pothole-101",
        }
        res5_gear = client.post("/chat", json=chat_req_gear)
        assert res5_gear.status_code == 200
        chat_data_gear = res5_gear.json()
        assert "pothole_escape_info" in chat_data_gear
        pe_gear_info = chat_data_gear["pothole_escape_info"]
        assert pe_gear_info is not None
        assert pe_gear_info["action"] == "gear_checklist"
        assert len(pe_gear_info["gear"]) == 6
        assert "answer" in chat_data_gear
        assert "Mandatory Backcountry Slot Canyon Pothole Escape" in chat_data_gear["answer"]

        # Calculation inquiry via /api/create_response
        chat_req_calc = {
            "question": "Calculate effective hoist force and counterweight for Neon Canyon Golden Cathedral pothole escape",
            "customer_id": "cust-pothole-102",
        }
        res5_calc = client.post("/api/create_response", json=chat_req_calc)
        assert res5_calc.status_code == 200
        chat_data_calc = res5_calc.json()
        assert "pothole_escape_info" in chat_data_calc
        pe_calc_info = chat_data_calc["pothole_escape_info"]
        assert pe_calc_info is not None
        assert pe_calc_info["action"] == "calculate"
        assert "effective_hoist_force_n" in pe_calc_info
        assert "pack_counterweight_kg" in pe_calc_info

        # Also test via /api/chat
        res5_chat = client.post("/api/chat", json=chat_req_gear)
        assert res5_chat.status_code == 200
        assert "pothole_escape_info" in res5_chat.json()

        # -------------------------------------------------------------------------
        # Step 6: Chat create_response/stream SSE events
        # -------------------------------------------------------------------------
        # Test calculation custom event via /chat/stream
        stream_req_calc = {
            "question": "Calculate pothole hoist force and counterweight dynamics for Choprock Canyon",
        }
        res6_calc = client.post("/chat/stream", json=stream_req_calc)
        assert res6_calc.status_code == 200
        raw_chunks = [c.strip() for c in res6_calc.text.split("\n\n") if c.strip()]
        assert "data: [DONE]" in raw_chunks

        parsed_events = []
        for line in raw_chunks:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        calc_event = next(
            (e for e in parsed_events if e.get("event") == "pothole_escape_calculated"),
            None,
        )
        assert calc_event is not None
        assert "pothole_escape_info" in calc_event
        assert calc_event["pothole_escape_info"]["action"] == "calculate"

        info_event = next(
            (e for e in parsed_events if e.get("event") == "pothole_escape_info"),
            None,
        )
        assert info_event is not None
        assert "pothole_escape_info" in info_event

        token_events = [
            e
            for e in parsed_events
            if "chunk" in e or "token" in e or e.get("event") == "token"
        ]
        assert len(token_events) > 0

        # Test lookup custom event via /api/create_response/stream
        stream_req_lookup = {
            "question": "Tell me about White Canyon black hole pothole escape route details",
        }
        res6_lookup = client.post(
            "/api/create_response/stream", json=stream_req_lookup
        )
        assert res6_lookup.status_code == 200
        raw_chunks_lookup = [
            c.strip() for c in res6_lookup.text.split("\n\n") if c.strip()
        ]
        assert "data: [DONE]" in raw_chunks_lookup

        parsed_lookup = []
        for line in raw_chunks_lookup:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_lookup.append(json.loads(line.removeprefix("data: ")))

        lookup_event = next(
            (e for e in parsed_lookup if e.get("event") == "pothole_escape_lookup"),
            None,
        )
        assert lookup_event is not None
        assert "pothole_escape_info" in lookup_event


@pytest.mark.anyio
async def test_pothole_escape_journey_real_mode_execution():
    """Step 7: Verifies pothole escape prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Sierra",
                    "membership": "Summit",
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
                return_value="In Neon Canyon, deploy a Sandtrap ghost anchor setback from the lip."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the recommended ghost anchor rigging technique for Neon Canyon Golden Cathedral?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "pothole_escape_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "pothole_escape_prompt" in call_kwargs
        prompt_content = call_kwargs["pothole_escape_prompt"].lower()
        assert (
            "pothole" in prompt_content
            or "ghost anchor" in prompt_content
            or "sandtrap" in prompt_content
            or "canyon" in prompt_content
        )
