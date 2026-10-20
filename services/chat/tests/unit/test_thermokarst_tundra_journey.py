"""End-to-end 7-step API customer journey test for Thermokarst Tundra Navigation."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestThermokarstTundraCustomerJourney:
    """7-step customer journey verifying discovery, filtering, detail, calculation, chat, and SSE."""

    def test_full_7_step_thermokarst_tundra_journey(self) -> None:
        with patch("main.REAL_CHAT_AVAILABLE", False):
            # Step 1: Discover all thermokarst tundra sites
            step1 = client.get("/api/v1/thermokarst-tundra/sites")
            assert step1.status_code == 200
            sites_data = step1.json()
            assert sites_data["total"] == 4
            site_ids = {s["id"] for s in sites_data["sites"]}
            assert "tuktoyaktuk-pingo-polygons-canada" in site_ids
            assert "batagaika-mega-slump-yakutia" in site_ids
            assert "noatak-foothills-tussock-alaska-usa" in site_ids
            assert "bykovsky-lena-alas-tundra-russia" in site_ids

            # Step 2: Filter sites by country and morphology
            step2_country = client.get(
                "/api/v1/thermokarst-tundra/sites", params={"country": "Russia"}
            )
            assert step2_country.status_code == 200
            assert step2_country.json()["total"] == 2

            step2_morph = client.get(
                "/api/v1/thermokarst-tundra/sites",
                params={"morphology": "low-center-ice-wedge-polygon"},
            )
            assert step2_morph.status_code == 200
            assert step2_morph.json()["total"] == 1
            assert (
                step2_morph.json()["sites"][0]["id"]
                == "tuktoyaktuk-pingo-polygons-canada"
            )

            # Step 3: Inspect a specific site by ID (Batagaika Mega-Slump)
            step3 = client.get(
                "/api/v1/thermokarst-tundra/sites/batagaika-mega-slump-yakutia"
            )
            assert step3.status_code == 200
            detail = step3.json()
            assert detail["site"]["name"].startswith("Batagaika")
            assert detail["site"]["difficulty"] == "extreme"
            assert "baseline_calculation" in detail
            assert detail["baseline_calculation"]["risk_level"] in {"high", "critical"}

            # Step 4: Run custom calculator (POST and GET) for low-risk vs critical-risk conditions
            step4_post = client.post(
                "/api/v1/thermokarst-tundra/calculate",
                json={
                    "active_layer_depth_cm": 115.0,
                    "trough_water_depth_cm": 85.0,
                    "soil_moisture_saturation_pct": 92.0,
                    "eriophorum_tussock_height_cm": 48.0,
                    "pack_load_kg": 28.0,
                    "site_id": "batagaika-mega-slump-yakutia",
                },
            )
            assert step4_post.status_code == 200
            calc_post = step4_post.json()["calculation"]
            assert calc_post["risk_level"] in {"high", "critical"}
            assert calc_post["suprapermafrost_liquefaction_index"] > 60.0

            step4_get = client.get(
                "/api/v1/thermokarst-tundra/calculate",
                params={
                    "active_layer_depth_cm": 25.0,
                    "trough_water_depth_cm": 10.0,
                    "soil_moisture_saturation_pct": 40.0,
                    "eriophorum_tussock_height_cm": 15.0,
                    "pack_load_kg": 10.0,
                },
            )
            assert step4_get.status_code == 200
            calc_get = step4_get.json()["calculation"]
            assert calc_get["risk_level"] == "low"
            assert (
                calc_get["effective_forward_speed_kmh"]
                > calc_post["effective_forward_speed_kmh"]
            )

            # Step 5: Retrieve gear checklist
            step5 = client.get("/api/v1/thermokarst-tundra/checklist")
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
                        "How should we navigate ice-wedge polygons on the Tuktoyaktuk Peninsula "
                        "with an active layer depth of 70 cm, trough water depth of 45 cm, "
                        "and a 20 kg pack load?"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert step6.status_code == 200
            chat_data = step6.json()
            assert "thermokarst_tundra_info" in chat_data
            tk_info = chat_data["thermokarst_tundra_info"]
            assert tk_info["action"] == "thermokarst_tundra_calculated"
            assert tk_info["calculation"]["active_layer_depth_cm"] == 70.0
            assert tk_info["calculation"]["trough_water_depth_cm"] == 45.0
            assert tk_info["calculation"]["pack_load_kg"] == 20.0
            assert "Tuktoyaktuk" in chat_data["answer"]

            # Step 7: SSE streaming endpoint integration (/api/create_response/stream)
            step7 = client.post(
                "/api/create_response/stream",
                json={
                    "question": (
                        "Evaluate retrogressive thaw-slump headwall mudflow risks at Batagaika "
                        "with 105 cm active layer depth and 90% soil moisture saturation."
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
            info_events = [e for e in events if "thermokarst_tundra_info" in e]
            assert len(info_events) >= 1
            stream_tk_info = info_events[0]["thermokarst_tundra_info"]
            assert stream_tk_info["action"] == "thermokarst_tundra_calculated"
            assert stream_tk_info["calculation"]["active_layer_depth_cm"] == 105.0
            assert stream_tk_info["calculation"]["soil_moisture_saturation_pct"] == 90.0


@pytest.mark.anyio
async def test_thermokarst_tundra_journey_real_mode_execution() -> None:
    """Verifies thermokarst tundra prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Inuk",
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
                    "Follow raised low-center polygon rims on the Tuktoyaktuk Peninsula "
                    "and probe trough junctions with a 150 cm steel permafrost rod."
                )
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": (
                    "How do I navigate low-center ice-wedge polygons on the Tuktoyaktuk Peninsula?"
                ),
                "customer_id": "1",
                "chat_history": "[]",
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "thermokarst_tundra_info" in data
        assert data["thermokarst_tundra_info"]["action"] == "thermokarst_tundra_lookup"
        assert mock_llm.called
        call_kwargs = mock_llm.call_args.kwargs
        assert "thermokarst_tundra_prompt" in call_kwargs
        assert "THERMOKARST" in call_kwargs["thermokarst_tundra_prompt"].upper()
