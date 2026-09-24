import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_alpine_scuba_journey():
    """Multi-step API journey test for Wilderness High-Altitude Scuba & Alpine Lake Ice Diving Assistant Tooling:

    Step 1: Catalog lookup & filtering (GET /api/alpine-scuba/sites).
    Step 2: Detail lookup (GET /api/alpine-scuba/sites/lake-tahoe-rubicon-wall) & 404 on unknown site.
    Step 3: Scuba calculation for ESLD and Buhlmann altitude decompression (POST /api/alpine-scuba/calculate).
    Step 4: Mandatory cold-water & ice diving safety gear checklist (GET /api/alpine-scuba/gear).
    Step 5: Conversational chat query through create_response with alpine_scuba_info metadata.
    Step 6: SSE streaming endpoint create_response/stream asserting alpine_scuba_info / alpine_scuba_calculation events.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Catalog lookup & filtering
        # -------------------------------------------------------------------------
        res1 = client.get("/api/alpine-scuba/sites")
        assert res1.status_code == 200
        sites = res1.json()
        assert len(sites) == 5
        site_ids = [s["id"] for s in sites]
        assert "lake-tahoe-rubicon-wall" in site_ids
        assert "crater-lake-wizard-island" in site_ids
        assert "emerald-lake-rockies" in site_ids
        assert "lake-ouananiche-chic-chocs" in site_ids
        assert "homestake-reservoir-colorado" in site_ids

        # Filter by overhead condition
        res1_filtered = client.get(
            "/api/alpine-scuba/sites?overhead_condition=solid_ice_sheet_overhead"
        )
        assert res1_filtered.status_code == 200
        ice_sites = res1_filtered.json()
        assert len(ice_sites) == 1
        assert ice_sites[0]["id"] == "emerald-lake-rockies"

        # -------------------------------------------------------------------------
        # Step 2: Detail lookup & 404 on unknown
        # -------------------------------------------------------------------------
        res2 = client.get("/api/alpine-scuba/sites/lake-tahoe-rubicon-wall")
        assert res2.status_code == 200
        tahoe = res2.json()
        assert tahoe["id"] == "lake-tahoe-rubicon-wall"
        assert "Rubicon Wall" in tahoe["name"]
        assert tahoe["elevation_meters"] == 1897
        assert tahoe["max_depth_meters"] == 120
        assert len(tahoe["highlights"]) >= 2

        res2_404 = client.get("/api/alpine-scuba/sites/unknown-alpine-tarn")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Calculation via POST /api/alpine-scuba/calculate
        # -------------------------------------------------------------------------
        calc_req = {
            "site_id": "lake-tahoe-rubicon-wall",
            "target_depth_meters": 20.0,
            "bottom_time_minutes": 25.0,
            "thermal_exposure": "compressed_neoprene_drysuit",
            "water_temp_c": 4.5,
        }
        res3 = client.post("/api/alpine-scuba/calculate", json=calc_req)
        assert res3.status_code == 200
        calc_data = res3.json()
        assert calc_data["site_name"] == "Rubicon Wall & Emerald Bay"
        assert calc_data["atmospheric_pressure_bar"] == 0.80
        assert calc_data["equivalent_sea_level_depth_meters"] == 25.0
        assert calc_data["adjusted_ndl_minutes"] == 18
        assert calc_data["decompression_status"] == "mandatory_decompression_stops"
        assert calc_data["regulator_freeze_risk"] in ("high", "moderate", "low")
        assert calc_data["min_surface_interval_hours"] == 24.0

        # Invalid site returns 404
        res3_404 = client.post(
            "/api/alpine-scuba/calculate", json={"site_id": "unknown-glacier-pond"}
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Gear checklist via GET /api/alpine-scuba/gear
        # -------------------------------------------------------------------------
        res4 = client.get("/api/alpine-scuba/gear")
        assert res4.status_code == 200
        gear = res4.json()
        assert len(gear) == 6
        assert all(g["mandatory"] is True for g in gear)
        gear_ids = [g["id"] for g in gear]
        assert "environmentally-sealed-coldwater-regulator" in gear_ids
        assert "compressed-neoprene-drysuit" in gear_ids
        assert "harness-ice-tether-carabiner" in gear_ids
        assert "dual-independent-redundant-tanks" in gear_ids
        assert "altitude-decompression-dive-computer" in gear_ids
        assert "chainsaw-ice-trench-clearing-tools" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Conversational chat query with alpine_scuba_info metadata
        # -------------------------------------------------------------------------
        chat_req1 = {
            "question": "What mandatory drysuit and cold water regulator gear do I need for alpine scuba diving?",
            "customer_id": "cust-scuba-101",
        }
        res5_1 = client.post("/api/create_response", json=chat_req1)
        assert res5_1.status_code == 200
        data5_1 = res5_1.json()
        assert "alpine_scuba_info" in data5_1
        assert data5_1["alpine_scuba_info"]["action"] == "gear_checklist"
        assert len(data5_1["alpine_scuba_info"]["gear"]) == 6

        chat_req2 = {
            "question": "Calculate equivalent sea level depth ESLD and Buhlmann decompression for Lake Tahoe scuba",
            "customer_id": "cust-scuba-101",
        }
        res5_2 = client.post("/api/create_response", json=chat_req2)
        assert res5_2.status_code == 200
        data5_2 = res5_2.json()
        assert "alpine_scuba_info" in data5_2
        assert data5_2["alpine_scuba_info"]["action"] == "calculate_scuba"
        assert "calculation" in data5_2["alpine_scuba_info"]

        # Also test service path /api/chat/service/create_response
        res5_3 = client.post("/api/chat/service/create_response", json=chat_req2)
        assert res5_3.status_code == 200
        data5_3 = res5_3.json()
        assert "alpine_scuba_info" in data5_3

        # -------------------------------------------------------------------------
        # Step 6: SSE streaming query asserting event alpine_scuba_info
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Calculate ESLD and Buhlmann altitude decompression for Lake Tahoe scuba diving",
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

        scuba_event = next(
            (
                e
                for e in parsed_events
                if e.get("event") in ("alpine_scuba_calculation", "alpine_scuba_info")
            ),
            None,
        )
        assert scuba_event is not None
        assert "alpine_scuba_info" in scuba_event or "alpine_scuba_calculation" in scuba_event

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert (
            "Rubicon Wall" in full_text
            or "ESLD" in full_text
            or "Decompression" in full_text
            or "Lake Tahoe" in full_text
        )


@pytest.mark.anyio
async def test_alpine_scuba_journey_real_mode_execution():
    """Step 7: Verifies alpine scuba prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Jacques", "membership": "Platinum", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="Lake Tahoe Rubicon Wall is an iconic alpine dive at 1,897m elevation requiring ESLD decompression tables."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Tell me about high altitude scuba diving at Lake Tahoe Rubicon Wall and drysuit regulator freeze risks."
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "alpine_scuba_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "alpine_scuba_prompt" in call_kwargs
        assert (
            "Lake Tahoe" in call_kwargs["alpine_scuba_prompt"]
            or "Alpine Scuba" in call_kwargs["alpine_scuba_prompt"]
            or "Bühlmann" in call_kwargs["alpine_scuba_prompt"]
        )
