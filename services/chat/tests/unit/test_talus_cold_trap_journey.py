"""End-to-end 7-step API customer journey test for Subalpine Boulder-Talus Air-Draft Ice Cave & Cold-Trap Block-Field Navigation."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestTalusColdTrapCustomerJourney:
    """7-step customer journey verifying discovery, filtering, detail, calculation, chat, and SSE."""

    def test_full_7_step_talus_cold_trap_journey(self) -> None:
        with patch("main.REAL_CHAT_AVAILABLE", False):
            # Step 1: Discover all subalpine boulder-talus air-draft ice cave & cold-trap sites
            step1 = client.get("/api/v1/talus-cold-trap/sites")
            assert step1.status_code == 200
            sites_data = step1.json()
            assert sites_data["total"] == 4
            site_ids = {s["id"] for s in sites_data["sites"]}
            assert "king-ravine-mahosuc-notch-white-mountains-nh" in site_ids
            assert "indian-pass-avalanche-pass-adirondacks-ny" in site_ids
            assert "driftless-algific-talus-slopes-iowa" in site_ids
            assert "kamenec-crevice-ice-talus-bohemia-czechia" in site_ids

            # Step 2: Filter sites by country and regime
            step2_country = client.get(
                "/api/v1/talus-cold-trap/sites",
                params={"country": "Czech Republic"},
            )
            assert step2_country.status_code == 200
            assert step2_country.json()["total"] == 1
            assert (
                step2_country.json()["sites"][0]["id"]
                == "kamenec-crevice-ice-talus-bohemia-czechia"
            )

            step2_regime = client.get(
                "/api/v1/talus-cold-trap/sites",
                params={"regime": "algific-dolomite-cold-vent-slope"},
            )
            assert step2_regime.status_code == 200
            assert step2_regime.json()["total"] == 1
            assert (
                step2_regime.json()["sites"][0]["id"]
                == "driftless-algific-talus-slopes-iowa"
            )

            # Step 3: Inspect a specific site by ID (King Ravine Subway & Mahoosuc Notch)
            step3 = client.get(
                "/api/v1/talus-cold-trap/sites/king-ravine-mahosuc-notch-white-mountains-nh"
            )
            assert step3.status_code == 200
            detail = step3.json()
            assert "King Ravine" in detail["site"]["name"]
            assert detail["site"]["difficulty"] == "extreme"
            assert "baseline_calculation" in detail
            assert detail["baseline_calculation"]["risk_level"] in {
                "high",
                "critical",
            }

            # Step 4: Run custom calculator (POST and GET) for critical-risk vs low-risk conditions
            step4_post = client.post(
                "/api/v1/talus-cold-trap/calculate",
                json={
                    "ambient_air_temp_c": 31.0,
                    "crevice_void_depth_m": 26.0,
                    "moss_humus_masking_pct": 90.0,
                    "boulder_block_span_m": 8.2,
                    "cold_draft_velocity_ms": 5.8,
                    "site_id": "king-ravine-mahosuc-notch-white-mountains-nh",
                },
            )
            assert step4_post.status_code == 200
            calc_post = step4_post.json()["calculation"]
            assert calc_post["risk_level"] == "critical"
            assert calc_post["verglas_glaze_slip_probability_pct"] >= 75.0
            assert calc_post["moss_bridge_collapse_risk_pct"] >= 75.0

            step4_get = client.get(
                "/api/v1/talus-cold-trap/calculate",
                params={
                    "ambient_air_temp_c": 4.0,
                    "crevice_void_depth_m": 2.0,
                    "moss_humus_masking_pct": 10.0,
                    "boulder_block_span_m": 1.0,
                    "cold_draft_velocity_ms": 0.8,
                },
            )
            assert step4_get.status_code == 200
            calc_get = step4_get.json()["calculation"]
            assert calc_get["risk_level"] == "low"
            assert (
                calc_get["verglas_glaze_slip_probability_pct"]
                < calc_post["verglas_glaze_slip_probability_pct"]
            )

            # Step 5: Retrieve gear checklist
            step5 = client.get("/api/v1/talus-cold-trap/checklist")
            assert step5.status_code == 200
            checklist_data = step5.json()
            assert checklist_data["total"] == 6
            assert all(
                item["priority"] == "essential"
                for item in checklist_data["gear_checklist"]
            )

            # Step 6: Chat endpoint integration (/api/create_response)
            step6 = client.post(
                "/api/create_response",
                json={
                    "question": (
                        "How should we navigate Mahoosuc Notch and King Ravine Subway talus cold trap "
                        "with ambient air temp 25 C, crevice void depth 16 m, "
                        "and moss humus masking 78%?"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert step6.status_code == 200
            chat_data = step6.json()
            assert "talus_cold_trap_info" in chat_data
            tct_info = chat_data["talus_cold_trap_info"]
            assert tct_info["action"] == "talus_cold_trap_calculated"
            assert tct_info["calculation"]["ambient_air_temp_c"] == 25.0
            assert tct_info["calculation"]["crevice_void_depth_m"] == 16.0
            assert tct_info["calculation"]["moss_humus_masking_pct"] == 78.0
            assert (
                "King Ravine" in chat_data["answer"]
                or "Mahoosuc" in chat_data["answer"]
            )

            # Step 7: SSE streaming endpoint integration (/api/create_response/stream)
            step7 = client.post(
                "/api/create_response/stream",
                json={
                    "question": (
                        "Evaluate algific talus cold-air vent slope hazards in the Driftless Area "
                        "with ambient air temp 27 C and crevice void depth 8.5 m."
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert step7.status_code == 200
            events = []
            for line in step7.text.splitlines():
                if line.startswith("data: "):
                    payload_str = line[len("data: ") :].strip()
                    if payload_str and payload_str != "[DONE]":
                        events.append(json.loads(payload_str))
            assert len(events) >= 2
            info_events = [e for e in events if "talus_cold_trap_info" in e]
            assert len(info_events) >= 1
            stream_tct_info = info_events[0]["talus_cold_trap_info"]
            assert stream_tct_info["action"] == "talus_cold_trap_calculated"
            assert stream_tct_info["calculation"]["ambient_air_temp_c"] == 27.0
            assert stream_tct_info["calculation"]["crevice_void_depth_m"] == 8.5


@pytest.mark.anyio
async def test_talus_cold_trap_journey_real_mode_execution() -> None:
    """Verifies talus cold trap prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Anselm",
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
                return_value=(
                    "Probe every Sphagnum and Hylocomium moss bridge with a graduated chromoly staff "
                    "before committing body weight, wear microspikes for subterranean Balch-ice verglas, "
                    "and carry a windproof thermal shell before descending into Mahoosuc Notch cold-trap voids."
                )
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": (
                    "How do I navigate Indian Pass and Avalanche Pass anorthosite talus ice chasms without breaking through moss bridges?"
                ),
                "customer_id": "1",
                "chat_history": "[]",
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "talus_cold_trap_info" in data
        assert data["talus_cold_trap_info"]["action"] == "talus_cold_trap_lookup"
        assert mock_llm.called
        call_kwargs = mock_llm.call_args.kwargs
        assert "talus_cold_trap_prompt" in call_kwargs
        assert "TALUS" in call_kwargs["talus_cold_trap_prompt"].upper()
        assert (
            "COLD-TRAP" in call_kwargs["talus_cold_trap_prompt"].upper()
            or "BALCH" in call_kwargs["talus_cold_trap_prompt"].upper()
        )
