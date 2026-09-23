import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_glacier_navigation_journey():
    """Multi-step API journey test for Glacier Crevasse Navigation & Icefall Routefinding:

    Step 1: List zones & filter by hazard (GET /api/glacier-navigation/zones).
    Step 2: Retrieve specific zone detail (GET /api/glacier-navigation/zones/{zone_id}) and 404 on unknown.
    Step 3: Run calculation via REST endpoint for safe vs hazardous conditions (POST /api/glacier-navigation/calculate).
    Step 4: Retrieve mandatory glacier safety kit checklist (GET /api/glacier-navigation/gear).
    Step 5: Test multi-turn conversational chat through create_response verifying glacier_info metadata.
    Step 6: Test SSE streaming endpoint create_response/stream for glacier queries.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: List zones & filter by hazard
        # -------------------------------------------------------------------------
        res1 = client.get("/api/glacier-navigation/zones")
        assert res1.status_code == 200
        zones = res1.json()
        assert len(zones) == 5
        zone_ids = [z["zone_id"] for z in zones]
        assert "khumbu-icefall-everest" in zone_ids
        assert "ingraham-glacier-rainier" in zone_ids
        assert "mer-de-glace-geant" in zone_ids
        assert "root-glacier-st-elias" in zone_ids
        assert "tasman-glacier-icefall" in zone_ids

        # Filter by hazard
        res1_extreme = client.get("/api/glacier-navigation/zones?hazard=extreme")
        assert res1_extreme.status_code == 200
        extreme_zones = res1_extreme.json()
        assert len(extreme_zones) == 1
        assert extreme_zones[0]["zone_id"] == "khumbu-icefall-everest"

        res1_high = client.get("/api/glacier-navigation/zones?hazard=high")
        assert res1_high.status_code == 200
        high_zones = res1_high.json()
        assert len(high_zones) == 2
        high_ids = [z["zone_id"] for z in high_zones]
        assert "ingraham-glacier-rainier" in high_ids
        assert "tasman-glacier-icefall" in high_ids

        # -------------------------------------------------------------------------
        # Step 2: Retrieve specific zone (khumbu-icefall-everest) & 404 for unknown
        # -------------------------------------------------------------------------
        res2 = client.get("/api/glacier-navigation/zones/khumbu-icefall-everest")
        assert res2.status_code == 200
        khumbu = res2.json()
        assert khumbu["zone_id"] == "khumbu-icefall-everest"
        assert khumbu["title"] == "Khumbu Icefall Lower Maze"
        assert khumbu["elevation_m"] == 5350
        assert khumbu["hazard_level"] == "extreme"
        assert khumbu["crevasse_pattern"] == "icefall_chaos"
        assert khumbu["ladder_sections_required"] is True
        assert khumbu["typical_crossing_hours"] == 6.5
        assert len(khumbu["route_highlights"]) >= 3

        res2_404 = client.get("/api/glacier-navigation/zones/non-existent-zone")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Run calculation via REST endpoint (safe vs hazardous)
        # -------------------------------------------------------------------------
        safe_req = {
            "zone_id": "khumbu-icefall-everest",
            "team_size": 3,
            "snow_bridge_depth_m": 1.2,
            "crevasse_width_m": 2.0,
            "ambient_temp_f": 24.0,
            "rope_interval_m": 12.0,
        }
        res3_safe = client.post("/api/glacier-navigation/calculate", json=safe_req)
        assert res3_safe.status_code == 200
        safe_data = res3_safe.json()
        assert safe_data["zone_id"] == "khumbu-icefall-everest"
        assert safe_data["span_to_depth_ratio"] == 0.6
        assert safe_data["recommended_interval_m"] == 12
        assert safe_data["interval_status"] == "optimal"
        assert safe_data["safety_status"] == "safe_crossing"
        assert "Firm refrozen" in safe_data["thermal_stability"]
        assert safe_data["rescue_reserve_length_m"] == 36
        assert len(safe_data["route_recommendation"]) > 10

        hazard_req = {
            "zone_id": "khumbu-icefall-everest",
            "team_size": 2,
            "snow_bridge_depth_m": 0.5,
            "crevasse_width_m": 2.0,
            "ambient_temp_f": 38.0,
            "rope_interval_m": 10.0,
        }
        res3_hazard = client.post("/api/glacier-navigation/calculate", json=hazard_req)
        assert res3_hazard.status_code == 200
        hazard_data = res3_hazard.json()
        assert hazard_data["safety_status"] == "hazardous_bypass_required"
        assert hazard_data["interval_status"] == "unsafe"
        assert "Critical thermal warming" in hazard_data["thermal_stability"]

        # 404 for invalid zone in calculation
        res3_404 = client.post(
            "/api/glacier-navigation/calculate", json={"zone_id": "unknown-zone"}
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Retrieve mandatory gear checklist (GET /api/glacier-navigation/gear)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/glacier-navigation/gear")
        assert res4.status_code == 200
        gear = res4.json()
        assert len(gear) == 6
        assert all(g["mandatory"] is True for g in gear)
        gear_ids = [g["item_id"] for g in gear]
        assert "avalanche-crevasse-probe" in gear_ids
        assert "crevasse-rescue-pulley-kit" in gear_ids
        assert "dynamic-dry-glacier-rope" in gear_ids
        assert "forged-steel-crampons" in gear_ids
        assert "technical-ice-axe" in gear_ids
        assert "bivy-hypothermia-wrap" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Test conversational chat through create_response
        # -------------------------------------------------------------------------
        chat_req1 = {
            "question": "What is the mandatory crevasse rescue kit and glacier safety gear checklist?",
            "customer_id": "cust-glacier-101",
        }
        res5_1 = client.post("/api/create_response", json=chat_req1)
        assert res5_1.status_code == 200
        data5_1 = res5_1.json()
        assert "glacier_info" in data5_1
        assert data5_1["glacier_info"]["action"] == "gear_checklist"
        assert "probe" in data5_1["answer"].lower() or "rescue" in data5_1["answer"].lower()

        chat_req2 = {
            "question": "Calculate crevasse navigation rope team intervals and snow bridge depth probing for Khumbu icefall",
            "customer_id": "cust-glacier-101",
        }
        res5_2 = client.post("/api/create_response", json=chat_req2)
        assert res5_2.status_code == 200
        data5_2 = res5_2.json()
        assert "glacier_info" in data5_2
        assert data5_2["glacier_info"]["action"] == "calculate_navigation"
        assert "Khumbu" in data5_2["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Test SSE streaming endpoint create_response/stream
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Calculate crevasse navigation rope team intervals and snow bridge depth probing for Khumbu icefall"
            },
        )
        assert res6_stream.status_code == 200
        sep = chr(10) + chr(10)
        raw_events = [line.strip() for line in res6_stream.text.split(sep) if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        glacier_event = next(
            (e for e in parsed_events if e.get("event") in ("glacier_calculation", "glacier_info")),
            None,
        )
        assert glacier_event is not None
        assert "glacier_info" in glacier_event or "glacier_calculation" in glacier_event

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Khumbu" in full_text or "Crevasse Navigation" in full_text


@pytest.mark.anyio
async def test_glacier_navigation_journey_real_mode_execution():
    """Step 7: Verifies glacier prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(return_value={"firstName": "Alex", "membership": "Gold", "orders": []}),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="Khumbu Icefall requires aluminum ladders and tight crevasse rope intervals."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Calculate crevasse navigation rope team intervals and snow bridge depth probing for Khumbu icefall"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "glacier_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "glacier_prompt" in call_kwargs
        assert "Khumbu" in call_kwargs["glacier_prompt"]
