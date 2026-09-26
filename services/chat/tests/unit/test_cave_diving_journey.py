import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_cave_diving_journey():
    """Multi-step API journey test for Wilderness Spelunking Siphon Cave Diving & Sump Penetration Tooling:

    Step 1: Check status /api/status.
    Step 2: Query /api/cave-diving/sites with optional rigging filter.
    Step 3: Query /api/cave-diving/sites/peacock-springs-karst and verify 404 for unknown site.
    Step 4: Post /api/cave-diving/calculate and verify 404 for invalid site.
    Step 5: Query /api/cave-diving/gear and verify mandatory gear checklist.
    Step 6: Chat create_response for cave diving inquiries.
    Step 7: Chat create_response/stream verifying SSE tokens and custom events (cave_diving_calculated and cave_diving_lookup).
    """
    # -------------------------------------------------------------------------
    # Step 1: Check status /api/status
    # -------------------------------------------------------------------------
    res1 = client.get("/api/status")
    assert res1.status_code == 200
    status_data = res1.json()
    assert status_data["status"] == "online"
    assert "model_provider" in status_data

    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 2: Query /api/cave-diving/sites
        # -------------------------------------------------------------------------
        res2 = client.get("/api/cave-diving/sites")
        assert res2.status_code == 200
        sites = res2.json()
        assert len(sites) == 5
        site_ids = [s["site_id"] for s in sites]
        assert "peacock-springs-karst" in site_ids
        assert "ginnie-springs-devil-system" in site_ids
        assert "cholla-sump-lost-creek" in site_ids
        assert "phantom-lake-spring" in site_ids
        assert "tuckaleechee-caverns-sump" in site_ids

        # Filter by rigging=sidemount_dual_cylinder
        res2_filt = client.get("/api/cave-diving/sites?rigging=sidemount_dual_cylinder")
        assert res2_filt.status_code == 200
        filt_sites = res2_filt.json()
        assert len(filt_sites) == 3
        for s in filt_sites:
            assert s["primary_rigging"] == "sidemount_dual_cylinder"

        # -------------------------------------------------------------------------
        # Step 3: Query /api/cave-diving/sites/peacock-springs-karst
        # -------------------------------------------------------------------------
        res3 = client.get("/api/cave-diving/sites/peacock-springs-karst")
        assert res3.status_code == 200
        peacock = res3.json()
        assert peacock["site_id"] == "peacock-springs-karst"
        assert "Peacock Springs" in peacock["title"]
        assert peacock["region"] == "Luraville, Florida, USA"
        assert peacock["max_depth_m"] == 20
        assert peacock["water_temp_c"] == 21
        assert peacock["flow_type"] == "static_slack_phreatic"
        assert peacock["sump_length_m"] == 850
        assert len(peacock["highlights"]) == 3

        # 404 for nonexistent site
        res3_404 = client.get("/api/cave-diving/sites/nonexistent-karst")
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Post /api/cave-diving/calculate
        # -------------------------------------------------------------------------
        calc_payload = {
            "site_id": "peacock-springs-karst",
            "rigging_setup": "sidemount_dual_cylinder",
            "starting_pressure_psi": 3000.0,
            "reserve_rule": "rule_of_thirds",
            "planned_penetration_m": 120.0,
            "flow_type": "static_slack_phreatic",
        }
        res4 = client.post("/api/cave-diving/calculate", json=calc_payload)
        assert res4.status_code == 200
        calc_data = res4.json()
        assert calc_data["site_id"] == "peacock-springs-karst"
        assert calc_data["turn_pressure_psi"] == 2000.0
        assert calc_data["usable_gas_psi"] == 1000.0
        assert calc_data["reserve_gas_psi"] == 2000.0
        assert calc_data["guideline_spool_required_m"] == 200.0
        assert calc_data["penetration_safety"] == "nominal_safe_turn"
        assert "gas_management_advisory" in calc_data
        assert "decompression_advisory" in calc_data

        # 404 for invalid site in calculate
        res4_404 = client.post("/api/cave-diving/calculate", json={"site_id": "invalid-site"})
        assert res4_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 5: Query /api/cave-diving/gear
        # -------------------------------------------------------------------------
        res5 = client.get("/api/cave-diving/gear")
        assert res5.status_code == 200
        gear_items = res5.json()
        assert len(gear_items) == 6
        gear_ids = [g["item_id"] for g in gear_items]
        assert "primary-safety-guideline-reels" in gear_ids
        assert "redundant-led-dive-lights" in gear_ids
        assert "sidemount-dual-regulator-kit" in gear_ids
        assert "dual-cutting-devices" in gear_ids
        assert "underwater-dive-slate-markers" in gear_ids
        assert "drysuit-crush-resistant-boots" in gear_ids

        # -------------------------------------------------------------------------
        # Step 6: Chat create_response for cave diving inquiries
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the Rule of Thirds turn pressure and guideline spool length for cave diving Peacock Springs?",
            "customer_id": "cust-cave-diver-101",
        }
        res6 = client.post("/api/create_response", json=chat_req)
        assert res6.status_code == 200
        data6 = res6.json()
        assert "cave_diving_info" in data6
        cave_info = data6["cave_diving_info"]
        assert cave_info is not None
        assert "answer" in data6
        assert len(data6["answer"]) > 0

        # Also test service path /api/chat/service/create_response
        res6_service = client.post("/api/chat/service/create_response", json=chat_req)
        assert res6_service.status_code == 200
        data6_service = res6_service.json()
        assert "cave_diving_info" in data6_service

        # -------------------------------------------------------------------------
        # Step 7: Chat create_response/stream verifying SSE tokens and custom events
        # -------------------------------------------------------------------------
        stream_req_calc = {
            "question": "Calculate rule of thirds turn pressure for cave diving at 3000 psi",
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
            (e for e in parsed_events if e.get("event") == "cave_diving_calculated"), None
        )
        assert calc_event is not None
        assert "cave_diving_info" in calc_event
        assert calc_event["cave_diving_info"]["action"] in ("calculate_gas", "calculate")

        # Verify token streaming events
        token_events = [
            e for e in parsed_events if "chunk" in e or "token" in e or e.get("event") == "token"
        ]
        assert len(token_events) > 0
        full_text = "".join(str(e.get("chunk") or e.get("token", "")) for e in token_events)
        assert len(full_text) > 0

        # Verify lookup custom event
        stream_req_lookup = {
            "question": "Tell me about Peacock Springs karst cave diving details",
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
            (e for e in parsed_lookup if e.get("event") == "cave_diving_lookup"), None
        )
        assert lookup_event is not None
        assert "cave_diving_info" in lookup_event
        assert lookup_event["cave_diving_info"]["site_id"] == "peacock-springs-karst"


@pytest.mark.anyio
async def test_cave_diving_journey_real_mode_execution():
    """Step 8: Verifies cave diving prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Sheck", "membership": "Explorer", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="At Peacock Springs Karst, the Rule of Thirds mandates turning at 2000 PSI with 1000 PSI usable gas."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the Rule of Thirds turn pressure for cave diving Peacock Springs?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "cave_diving_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "cave_diving_prompt" in call_kwargs
        assert (
            "cave diving" in call_kwargs["cave_diving_prompt"].lower()
            or "peacock" in call_kwargs["cave_diving_prompt"].lower()
        )
