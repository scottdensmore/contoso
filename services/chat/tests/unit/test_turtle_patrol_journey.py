import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_turtle_patrol_journey():
    """Multi-step API journey test for Wilderness Sea Turtle Hatchling Conservation & Barrier Beach Patrolling Tooling:

    Step 1: Health & readiness check (/healthz, /ready, /api/status).
    Step 2: List sectors (/api/turtle-patrol/sectors), filter by patrol_zone.
    Step 3: Fetch specific sector detail (/api/turtle-patrol/sectors/cape-hatteras-barrier-spit) and 404.
    Step 4: Post calculate dynamics (/api/turtle-patrol/calculate) and 404 for unknown sector.
    Step 5: Get gear checklist (/api/turtle-patrol/gear).
    Step 6: Test create_response endpoint with mock client, verifying turtle_patrol_info in response payload.
    Step 7: Test create_response/stream SSE endpoint verifying SSE data events (turtle_patrol_lookup / turtle_patrol_calculated and turtle_patrol_info).
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
        # Step 2: List sectors (/api/turtle-patrol/sectors), filter by patrol_zone
        # -------------------------------------------------------------------------
        res2 = client.get("/api/turtle-patrol/sectors")
        assert res2.status_code == 200
        sectors = res2.json()
        assert len(sectors) == 5
        sector_ids = [s["sector_id"] for s in sectors]
        assert "cape-hatteras-barrier-spit" in sector_ids
        assert "cumberland-island-wilderness-beach" in sector_ids
        assert "padre-island-national-seashore" in sector_ids
        assert "archie-carr-national-refuge" in sector_ids
        assert "culebra-resaca-beach-atoll" in sector_ids

        # Also test without /api prefix
        res2_no_prefix = client.get("/turtle-patrol/sectors")
        assert res2_no_prefix.status_code == 200
        assert len(res2_no_prefix.json()) == 5

        # Filter by patrol_zone=barrier_island_dunes
        res2_filt = client.get("/api/turtle-patrol/sectors?patrol_zone=barrier_island_dunes")
        assert res2_filt.status_code == 200
        filt_sectors = res2_filt.json()
        assert len(filt_sectors) == 2
        for s in filt_sectors:
            assert s["patrol_zone"] == "barrier_island_dunes"

        # -------------------------------------------------------------------------
        # Step 3: Fetch specific sector detail & 404 for unknown
        # -------------------------------------------------------------------------
        res3 = client.get("/api/turtle-patrol/sectors/cape-hatteras-barrier-spit")
        assert res3.status_code == 200
        detail = res3.json()
        assert detail["sector_id"] == "cape-hatteras-barrier-spit"
        assert detail["primary_species"] == "loggerhead"
        assert detail["avg_nests_per_km"] == 14
        assert len(detail["highlights"]) >= 2

        res3_no_prefix = client.get("/turtle-patrol/sectors/cape-hatteras-barrier-spit")
        assert res3_no_prefix.status_code == 200
        assert res3_no_prefix.json()["sector_id"] == "cape-hatteras-barrier-spit"

        # 404 for nonexistent sector
        res3_404 = client.get("/api/turtle-patrol/sectors/nonexistent-barrier-spit")
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Post calculate dynamics & 404 for unknown sector
        # -------------------------------------------------------------------------
        calc_payload = {
            "sector_id": "cape-hatteras-barrier-spit",
            "patrol_length_km": 18.0,
            "moon_phase_illumination_percent": 15.0,
            "ambient_temperature_c": 28.0,
            "predator_pressure": "moderate",
        }
        res4 = client.post("/api/turtle-patrol/calculate", json=calc_payload)
        assert res4.status_code == 200
        calc_data = res4.json()
        assert calc_data["sector_id"] == "cape-hatteras-barrier-spit"
        assert calc_data["estimated_emergence_count"] == 428
        assert calc_data["incubation_days_estimate"] == 55
        assert calc_data["predator_loss_risk_percent"] == 22
        assert calc_data["conservation_status"] == "elevated_predator_advisory"

        res4_no_prefix = client.post("/turtle-patrol/calculate", json=calc_payload)
        assert res4_no_prefix.status_code == 200
        assert res4_no_prefix.json()["sector_id"] == "cape-hatteras-barrier-spit"

        # 404 for invalid sector in calculate
        res4_404 = client.post("/api/turtle-patrol/calculate", json={"sector_id": "invalid-sector"})
        assert res4_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 5: Get gear checklist (/api/turtle-patrol/gear)
        # -------------------------------------------------------------------------
        res5 = client.get("/api/turtle-patrol/gear")
        assert res5.status_code == 200
        gear_items = res5.json()
        assert len(gear_items) == 6
        gear_ids = [g["item_id"] for g in gear_items]
        assert "red-led-headlamp-monochrome" in gear_ids
        assert "dune-predator-exclusion-cages" in gear_ids
        assert "night-patrol-gps-caliper-kit" in gear_ids
        assert "soft-touch-hatchling-carrier" in gear_ids
        assert "high-tide-bamboo-marker-poles" in gear_ids
        assert "coastal-high-intensity-uv-filter" in gear_ids

        res5_no_prefix = client.get("/turtle-patrol/gear")
        assert res5_no_prefix.status_code == 200
        assert len(res5_no_prefix.json()) == 6

        # -------------------------------------------------------------------------
        # Step 6: Test create_response endpoint with mock client
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the emergence count and incubation days for Cape Hatteras turtle patrol?",
            "customer_id": "cust-turtle-101",
        }
        res6 = client.post("/api/create_response", json=chat_req)
        assert res6.status_code == 200
        data6 = res6.json()
        assert "turtle_patrol_info" in data6
        turtle_info = data6["turtle_patrol_info"]
        assert turtle_info is not None
        assert "answer" in data6
        assert len(data6["answer"]) > 0

        # -------------------------------------------------------------------------
        # Step 7: Test create_response/stream SSE endpoint
        # -------------------------------------------------------------------------
        stream_req_calc = {
            "question": "Calculate emergence count and incubation days for sea turtle patrol at Cape Hatteras",
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
            (e for e in parsed_events if e.get("event") in ("turtle_patrol_calculated", "calculate_dynamics")),
            None,
        )
        assert calc_event is not None
        assert "turtle_patrol_info" in calc_event
        assert calc_event["turtle_patrol_info"]["action"] in ("calculate", "calculate_dynamics")

        # Verify turtle_patrol_info event
        info_event = next(
            (e for e in parsed_events if e.get("event") == "turtle_patrol_info"),
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
            "question": "Tell me about Culebra Resaca leatherback turtle nesting patrol details",
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
            (e for e in parsed_lookup if e.get("event") == "turtle_patrol_lookup"),
            None,
        )
        assert lookup_event is not None
        assert "turtle_patrol_info" in lookup_event
        assert lookup_event["turtle_patrol_info"]["sector_id"] == "culebra-resaca-beach-atoll"


@pytest.mark.anyio
async def test_turtle_patrol_journey_real_mode_execution():
    """Step 8: Verifies turtle patrol prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Morgan", "membership": "TurtlePatroller", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="On Cape Hatteras spit, maintain dark-sky red LED illumination and deploy predator cages."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the hatchling emergence count and predator cage protocol for Cape Hatteras turtle patrol?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "turtle_patrol_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "turtle_patrol_prompt" in call_kwargs
        assert (
            "turtle" in call_kwargs["turtle_patrol_prompt"].lower()
            or "hatchling" in call_kwargs["turtle_patrol_prompt"].lower()
            or "patrol" in call_kwargs["turtle_patrol_prompt"].lower()
        )
