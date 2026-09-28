import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_canyon_bouldering_journey():
    """Multi-step API journey test for Wilderness Canyon Bouldering & Highball Sandstone Crash Pad Logistics Tooling:

    Step 1: Health & readiness check (/healthz, /ready, /api/status).
    Step 2: List sectors (/api/canyon-bouldering/sectors), filter by bouldering_style.
    Step 3: Fetch specific sector detail (/api/canyon-bouldering/sectors/buttermilks-peabody-highballs) and 404.
    Step 4: Post calculate dynamics (/api/canyon-bouldering/calculate) and 404 for unknown sector.
    Step 5: Get gear checklist (/api/canyon-bouldering/gear).
    Step 6: Test create_response endpoint with mock client, verifying canyon_bouldering_info in response payload.
    Step 7: Test create_response/stream SSE endpoint verifying SSE data events (canyon_bouldering_lookup / canyon_bouldering_calculated and canyon_bouldering_info).
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
        # Step 2: List sectors (/api/canyon-bouldering/sectors), filter by bouldering_style
        # -------------------------------------------------------------------------
        res2 = client.get("/api/canyon-bouldering/sectors")
        assert res2.status_code == 200
        sectors = res2.json()
        assert len(sectors) == 5
        sector_ids = [s["sector_id"] for s in sectors]
        assert "buttermilks-peabody-highballs" in sector_ids
        assert "joes-valley-straight-canyon" in sector_ids
        assert "red-rock-kraft-boulders" in sector_ids
        assert "rocktown-pigeon-mountain" in sector_ids
        assert "hueco-tanks-north-mountain" in sector_ids

        # Also test without /api prefix
        res2_no_prefix = client.get("/canyon-bouldering/sectors")
        assert res2_no_prefix.status_code == 200
        assert len(res2_no_prefix.json()) == 5

        # Filter by bouldering_style=highball_quartz_monzonite
        res2_filt = client.get("/api/canyon-bouldering/sectors?bouldering_style=highball_quartz_monzonite")
        assert res2_filt.status_code == 200
        filt_sectors = res2_filt.json()
        assert len(filt_sectors) == 1
        assert filt_sectors[0]["sector_id"] == "buttermilks-peabody-highballs"

        # -------------------------------------------------------------------------
        # Step 3: Fetch specific sector detail & 404 for unknown
        # -------------------------------------------------------------------------
        res3 = client.get("/api/canyon-bouldering/sectors/buttermilks-peabody-highballs")
        assert res3.status_code == 200
        detail = res3.json()
        assert detail["sector_id"] == "buttermilks-peabody-highballs"
        assert detail["title"] == "Buttermilks Peabody Boulders"
        assert detail["max_boulder_height_m"] == 16.0
        assert detail["bouldering_style"] == "highball_quartz_monzonite"
        assert len(detail["highlights"]) >= 3

        res3_no_prefix = client.get("/canyon-bouldering/sectors/buttermilks-peabody-highballs")
        assert res3_no_prefix.status_code == 200
        assert res3_no_prefix.json()["sector_id"] == "buttermilks-peabody-highballs"

        # 404 for nonexistent sector
        res3_404 = client.get("/api/canyon-bouldering/sectors/nonexistent-boulder-sector")
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Post calculate dynamics & 404 for unknown sector
        # -------------------------------------------------------------------------
        calc_payload = {
            "sector_id": "buttermilks-peabody-highballs",
            "fall_height_m": 6.5,
            "climber_weight_kg": 72.0,
            "crash_pads_count": 3,
            "spotters_count": 2,
        }
        res4 = client.post("/api/canyon-bouldering/calculate", json=calc_payload)
        assert res4.status_code == 200
        calc_data = res4.json()
        assert calc_data["sector_id"] == "buttermilks-peabody-highballs"
        assert calc_data["impact_energy_joules"] == 4591
        assert calc_data["pad_coverage_adequacy_percent"] == 100
        assert calc_data["fall_hazard_rating"] == "safe_cushioned_drop"

        res4_no_prefix = client.post("/canyon-bouldering/calculate", json=calc_payload)
        assert res4_no_prefix.status_code == 200
        assert res4_no_prefix.json()["sector_id"] == "buttermilks-peabody-highballs"

        # 404 for invalid sector in calculate
        res4_404 = client.post("/api/canyon-bouldering/calculate", json={"sector_id": "invalid-sector"})
        assert res4_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 5: Get gear checklist (/api/canyon-bouldering/gear)
        # -------------------------------------------------------------------------
        res5 = client.get("/api/canyon-bouldering/gear")
        assert res5.status_code == 200
        gear_items = res5.json()
        assert len(gear_items) == 6
        gear_ids = [g["item_id"] for g in gear_items]
        assert "highball-triple-layer-crash-pad" in gear_ids
        assert "blubber-hinge-cover-pad" in gear_ids
        assert "slider-sit-start-pad" in gear_ids
        assert "heavy-duty-chalk-bucket-with-brushes" in gear_ids
        assert "athletic-bouldering-tape-and-skin-kit" in gear_ids
        assert "telescoping-boulder-cleaning-pole" in gear_ids

        res5_no_prefix = client.get("/canyon-bouldering/gear")
        assert res5_no_prefix.status_code == 200
        assert len(res5_no_prefix.json()) == 6

        # -------------------------------------------------------------------------
        # Step 6: Test create_response endpoint with mock client
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "Calculate highball fall dynamics and crash pad stacking for Buttermilks Peabody boulders",
            "customer_id": "cust-canyon-bouldering-101",
        }
        res6 = client.post("/api/create_response", json=chat_req)
        assert res6.status_code == 200
        data6 = res6.json()
        assert "canyon_bouldering_info" in data6
        cb_info = data6["canyon_bouldering_info"]
        assert cb_info is not None
        assert "answer" in data6
        assert len(data6["answer"]) > 0

        # -------------------------------------------------------------------------
        # Step 7: Test create_response/stream SSE endpoint
        # -------------------------------------------------------------------------
        stream_req_calc = {
            "question": "Calculate highball impact energy and spotter requirements for Buttermilks Peabody boulders",
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
            (e for e in parsed_events if e.get("event") in ("canyon_bouldering_calculated", "calculate")),
            None,
        )
        assert calc_event is not None
        assert "canyon_bouldering_info" in calc_event

        # Verify canyon_bouldering_info event
        info_event = next(
            (e for e in parsed_events if e.get("event") == "canyon_bouldering_info"),
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
            "question": "Tell me about Joe's Valley bouldering and Straight Canyon sandstone boulders",
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
            (e for e in parsed_lookup if e.get("event") == "canyon_bouldering_lookup"),
            None,
        )
        assert lookup_event is not None
        assert "canyon_bouldering_info" in lookup_event


@pytest.mark.anyio
async def test_canyon_bouldering_journey_real_mode_execution():
    """Step 8: Verifies canyon bouldering prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Alex", "membership": "BoulderCrag", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="On Buttermilks highballs, ensure at least 4 stacked crash pads with overlapping blubber pad."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Calculate highball fall dynamics and crash pad stacking for Buttermilks Peabody boulders"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "canyon_bouldering_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "canyon_bouldering_prompt" in call_kwargs
        assert (
            "bouldering" in call_kwargs["canyon_bouldering_prompt"].lower()
            or "highball" in call_kwargs["canyon_bouldering_prompt"].lower()
        )
