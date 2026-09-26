import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_gold_prospecting_journey():
    """Multi-step API journey test for Wilderness Gold Panning & Placer Mineral Prospecting:

    Diagnostics: Verify chat status (/api/chat/status).
    Step 1: Query catalog GET /gold-prospecting/sites and filter by deposit type.
    Step 2: Query specific site GET /gold-prospecting/sites/american-river-south-fork.
    Step 3: Post calculation request POST /gold-prospecting/calculate and verify recovery metrics.
    Step 4: Query gear GET /gold-prospecting/gear and verify all 6 items.
    Step 5: Post chat request to POST /api/create_response and assert gold_prospecting_info and answer.
    Step 6: Stream chat response via POST /api/create_response/stream and assert SSE events (gold_prospecting_*).
    """
    # -------------------------------------------------------------------------
    # Diagnostics check: /api/chat/status
    # -------------------------------------------------------------------------
    diag_res = client.get("/api/chat/status")
    assert diag_res.status_code == 200
    diag_data = diag_res.json()
    assert diag_data["status"] == "online"
    assert "model_provider" in diag_data

    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query catalog GET /gold-prospecting/sites and filter by deposit type
        # -------------------------------------------------------------------------
        res1 = client.get("/gold-prospecting/sites")
        if res1.status_code == 404:
            res1 = client.get("/api/gold-prospecting/sites")
        assert res1.status_code == 200
        sites = res1.json()
        assert len(sites) == 5
        site_ids = [s["site_id"] for s in sites]
        assert "american-river-south-fork" in site_ids
        assert "cache-creek-colorado" in site_ids
        assert "fairbanks-pedro-creek" in site_ids
        assert "rogue-river-galice" in site_ids
        assert "swift-river-new-hampshire" in site_ids

        # Filter by deposit_type=inside_bend_gravel_bar
        res1_bend = client.get("/gold-prospecting/sites?deposit_type=inside_bend_gravel_bar")
        if res1_bend.status_code == 404:
            res1_bend = client.get("/api/gold-prospecting/sites?deposit_type=inside_bend_gravel_bar")
        assert res1_bend.status_code == 200
        bend_sites = res1_bend.json()
        assert len(bend_sites) == 1
        assert bend_sites[0]["site_id"] == "american-river-south-fork"
        assert bend_sites[0]["deposit_type"] == "inside_bend_gravel_bar"

        # Filter by deposit_type=stream_gravel_riffle
        res1_riffle = client.get("/gold-prospecting/sites?deposit_type=stream_gravel_riffle")
        if res1_riffle.status_code == 404:
            res1_riffle = client.get("/api/gold-prospecting/sites?deposit_type=stream_gravel_riffle")
        assert res1_riffle.status_code == 200
        riffle_sites = res1_riffle.json()
        assert len(riffle_sites) == 2
        riffle_ids = [s["site_id"] for s in riffle_sites]
        assert "rogue-river-galice" in riffle_ids
        assert "swift-river-new-hampshire" in riffle_ids

        # Filter by deposit_type=bedrock_crevice
        res1_crevice = client.get("/gold-prospecting/sites?deposit_type=bedrock_crevice")
        if res1_crevice.status_code == 404:
            res1_crevice = client.get("/api/gold-prospecting/sites?deposit_type=bedrock_crevice")
        assert res1_crevice.status_code == 200
        crevice_sites = res1_crevice.json()
        assert len(crevice_sites) == 1
        assert crevice_sites[0]["site_id"] == "fairbanks-pedro-creek"

        # -------------------------------------------------------------------------
        # Step 2: Query specific site GET /gold-prospecting/sites/american-river-south-fork
        # -------------------------------------------------------------------------
        res2 = client.get("/gold-prospecting/sites/american-river-south-fork")
        if res2.status_code == 404:
            res2 = client.get("/api/gold-prospecting/sites/american-river-south-fork")
        assert res2.status_code == 200
        site_detail = res2.json()
        assert site_detail["site_id"] == "american-river-south-fork"
        assert "American River" in site_detail["title"]
        assert site_detail["deposit_type"] == "inside_bend_gravel_bar"
        assert site_detail["elevation_m"] == 230
        assert site_detail["max_historical_yield_g_per_ton"] == 4.8
        assert site_detail["access_difficulty"] == "easy_walk_in"
        assert len(site_detail["highlights"]) == 3

        # 404 check for unknown site
        res2_404 = client.get("/gold-prospecting/sites/nonexistent-claim-basin")
        if res2_404.status_code != 404:
            res2_404 = client.get("/api/gold-prospecting/sites/nonexistent-claim-basin")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Post calculation request POST /gold-prospecting/calculate
        # -------------------------------------------------------------------------
        calc_payload = {
            "site_id": "american-river-south-fork",
            "gravel_volume_buckets": 5.0,
            "sluice_slope_deg": 7.0,
            "stream_flow_velocity_fps": 3.5,
            "separation_method": "sluice_box",
        }
        res3 = client.post("/gold-prospecting/calculate", json=calc_payload)
        if res3.status_code == 404:
            res3 = client.post("/api/gold-prospecting/calculate", json=calc_payload)
        assert res3.status_code == 200
        calc_res = res3.json()
        assert calc_res["site_id"] == "american-river-south-fork"
        assert calc_res["expected_concentrate_grams"] == 2.16
        assert calc_res["recovery_efficiency_percent"] == 92
        assert calc_res["sluice_status"] == "optimal_riffle_recovery"
        assert calc_res["density_ratio"] == 7.28
        assert "recovery_advisory" in calc_res and len(calc_res["recovery_advisory"]) > 0
        assert "regulatory_advisory" in calc_res and len(calc_res["regulatory_advisory"]) > 0

        # Clogging calculation (low slope < 5)
        calc_clog = {
            "site_id": "cache-creek-colorado",
            "gravel_volume_buckets": 10.0,
            "sluice_slope_deg": 4.0,
            "stream_flow_velocity_fps": 3.5,
        }
        res3_clog = client.post("/gold-prospecting/calculate", json=calc_clog)
        if res3_clog.status_code == 404:
            res3_clog = client.post("/api/gold-prospecting/calculate", json=calc_clog)
        assert res3_clog.status_code == 200
        assert res3_clog.json()["sluice_status"] == "underflow_clogging_risk"
        assert res3_clog.json()["recovery_efficiency_percent"] == 64

        # Scour blowout calculation (high slope > 8)
        calc_blowout = {
            "site_id": "fairbanks-pedro-creek",
            "gravel_volume_buckets": 5.0,
            "sluice_slope_deg": 9.5,
            "stream_flow_velocity_fps": 3.5,
        }
        res3_blow = client.post("/gold-prospecting/calculate", json=calc_blowout)
        if res3_blow.status_code == 404:
            res3_blow = client.post("/api/gold-prospecting/calculate", json=calc_blowout)
        assert res3_blow.status_code == 200
        assert res3_blow.json()["sluice_status"] == "scour_blowout_velocity"
        assert res3_blow.json()["recovery_efficiency_percent"] == 48

        # -------------------------------------------------------------------------
        # Step 4: Query gear GET /gold-prospecting/gear
        # -------------------------------------------------------------------------
        res4 = client.get("/gold-prospecting/gear")
        if res4.status_code == 404:
            res4 = client.get("/api/gold-prospecting/gear")
        assert res4.status_code == 200
        gear_list = res4.json()
        assert len(gear_list) == 6
        assert all(g["mandatory"] is True for g in gear_list)
        gear_ids = [g["item_id"] for g in gear_list]
        assert "dual-riffle-gold-pan" in gear_ids
        assert "classifier-sieve-set" in gear_ids
        assert "compact-backpacking-sluice" in gear_ids
        assert "hardened-crevice-tool-set" in gear_ids
        assert "suction-snuffer-bottle-vials" in gear_ids
        assert "magnetic-black-sand-separator" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Post chat request to POST /api/create_response
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the expected placer gold concentrate for 10 buckets in a sluice box at American River Coloma?",
            "customer_id": "cust-prospector-01",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "gold_prospecting_info" in data5
        gold_info = data5["gold_prospecting_info"]
        assert gold_info is not None
        assert gold_info["action"] == "calculate_placer"
        assert "American River" in data5["answer"] or "Placer" in data5["answer"]

        # Gear checklist chat query
        gear_chat_req = {
            "question": "What mandatory prospecting gear do I need for gravity panning, snuffer bottles, and black sand?",
            "customer_id": "cust-prospector-02",
        }
        res5_gear = client.post("/api/create_response", json=gear_chat_req)
        assert res5_gear.status_code == 200
        data5_gear = res5_gear.json()
        assert "gold_prospecting_info" in data5_gear
        assert data5_gear["gold_prospecting_info"]["action"] == "gear_checklist"
        assert data5_gear["gold_prospecting_info"]["mandatory_count"] == 6

        # -------------------------------------------------------------------------
        # Step 6: Stream chat response via POST /api/create_response/stream
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Tell me about the Pedro Creek placer gold deposits in Tanana"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        gold_event = next(
            (
                e for e in parsed_events
                if e.get("event") in (
                    "gold_prospecting_info",
                    "gold_prospecting_site_detail",
                    "gold_prospecting_sites",
                    "gold_prospecting_calculation",
                    "gold_prospecting_gear",
                )
            ),
            None,
        )
        assert gold_event is not None
        assert "gold_prospecting_info" in gold_event
        stream_gold_info = gold_event["gold_prospecting_info"]
        assert stream_gold_info is not None

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Pedro Creek" in full_text or "Placer" in full_text or "pedro" in full_text.lower()


@pytest.mark.anyio
async def test_gold_prospecting_journey_real_mode_execution():
    """Step 7: Verifies gold prospecting prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Felix", "membership": "Platinum", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="At South Fork American River, 5 buckets yield approximately 2.16g with optimal 7-degree sluice pitch."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "How do I calculate expected placer concentrate from 5 buckets at South Fork American River sluice box?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "gold_prospecting_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "gold_prospecting_prompt" in call_kwargs
        assert "Wilderness Gold Panning" in call_kwargs["gold_prospecting_prompt"]
        assert "7.28" in call_kwargs["gold_prospecting_prompt"]
