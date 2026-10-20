"""End-to-end 7-step API customer journey test for Subglacial Jökulhlaup Ice-Dammed Lake Outburst & Proglacial Canyon Escape."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestJokulhlaupEscapeCustomerJourney:
    """7-step customer journey verifying discovery, filtering, detail, calculation, chat, and SSE."""

    def test_full_7_step_jokulhlaup_escape_journey(self) -> None:
        with patch("main.REAL_CHAT_AVAILABLE", False):
            # Step 1: Discover all subglacial jökulhlaup & ice-dammed lake outburst sites
            step1 = client.get("/api/v1/jokulhlaup-escape/sites")
            assert step1.status_code == 200
            sites_data = step1.json()
            assert sites_data["total"] == 4
            site_ids = {s["id"] for s in sites_data["sites"]}
            assert "grimsvotn-skeidararsandur-vatnajokull-iceland" in site_ids
            assert "suicide-basin-mendenhall-juneau-alaska" in site_ids
            assert "cachet-dos-colonia-patagonia-chile" in site_ids
            assert "kyagar-shaksgam-karakoram-pakistan-china" in site_ids

            # Step 2: Filter sites by country and trigger_mechanism
            step2_country = client.get(
                "/api/v1/jokulhlaup-escape/sites", params={"country": "Iceland"}
            )
            assert step2_country.status_code == 200
            assert step2_country.json()["total"] == 1
            assert (
                step2_country.json()["sites"][0]["id"]
                == "grimsvotn-skeidararsandur-vatnajokull-iceland"
            )

            step2_trig = client.get(
                "/api/v1/jokulhlaup-escape/sites",
                params={"trigger_mechanism": "supraglacial-englacial-conduit"},
            )
            assert step2_trig.status_code == 200
            assert step2_trig.json()["total"] == 1
            assert step2_trig.json()["sites"][0]["id"] == "cachet-dos-colonia-patagonia-chile"

            # Step 3: Inspect a specific site by ID (Grímsvötn & Skeiðarárjökull)
            step3 = client.get(
                "/api/v1/jokulhlaup-escape/sites/grimsvotn-skeidararsandur-vatnajokull-iceland"
            )
            assert step3.status_code == 200
            detail = step3.json()
            assert "Grímsvötn" in detail["site"]["name"]
            assert detail["site"]["difficulty"] == "extreme"
            assert "baseline_calculation" in detail
            assert detail["baseline_calculation"]["risk_level"] in {"high", "critical"}

            # Step 4: Run custom calculator (POST and GET) for critical-risk vs low-risk conditions
            step4_post = client.post(
                "/api/v1/jokulhlaup-escape/calculate",
                json={
                    "ice_dam_drawdown_cm_per_hr": 165.0,
                    "proglacial_conductivity_us_cm": 920.0,
                    "subglacial_tremor_amplitude_um": 34.0,
                    "canyon_floor_distance_from_portal_km": 1.4,
                    "vertical_gain_to_safe_terrace_m": 120.0,
                    "site_id": "grimsvotn-skeidararsandur-vatnajokull-iceland",
                },
            )
            assert step4_post.status_code == 200
            calc_post = step4_post.json()["calculation"]
            assert calc_post["risk_level"] == "critical"
            assert calc_post["estimated_peak_discharge_m3s"] > 5000.0

            step4_get = client.get(
                "/api/v1/jokulhlaup-escape/calculate",
                params={
                    "ice_dam_drawdown_cm_per_hr": 2.0,
                    "proglacial_conductivity_us_cm": 45.0,
                    "subglacial_tremor_amplitude_um": 0.4,
                    "canyon_floor_distance_from_portal_km": 22.0,
                    "vertical_gain_to_safe_terrace_m": 15.0,
                },
            )
            assert step4_get.status_code == 200
            calc_get = step4_get.json()["calculation"]
            assert calc_get["risk_level"] == "low"
            assert (
                calc_get["estimated_peak_discharge_m3s"] < calc_post["estimated_peak_discharge_m3s"]
            )

            # Step 5: Retrieve gear checklist
            step5 = client.get("/api/v1/jokulhlaup-escape/checklist")
            assert step5.status_code == 200
            checklist_data = step5.json()
            assert checklist_data["total"] == 6
            assert all(item["priority"] == "essential" for item in checklist_data["gear_checklist"])

            # Step 6: Chat endpoint integration (/api/create_response)
            step6 = client.post(
                "/api/create_response",
                json={
                    "question": (
                        "How should we evacuate Lago Cachet II proglacial canyon during a jökulhlaup "
                        "with ice dam drawdown 95 cm/hr, proglacial conductivity 620 uS/cm, "
                        "and subglacial tremor amplitude 16 um?"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert step6.status_code == 200
            chat_data = step6.json()
            assert "jokulhlaup_escape_info" in chat_data
            je_info = chat_data["jokulhlaup_escape_info"]
            assert je_info["action"] == "jokulhlaup_escape_calculated"
            assert je_info["calculation"]["ice_dam_drawdown_cm_per_hr"] == 95.0
            assert je_info["calculation"]["proglacial_conductivity_us_cm"] == 620.0
            assert je_info["calculation"]["subglacial_tremor_amplitude_um"] == 16.0
            assert "Cachet" in chat_data["answer"] or "Colonia" in chat_data["answer"]

            # Step 7: SSE streaming endpoint integration (/api/create_response/stream)
            step7 = client.post(
                "/api/create_response/stream",
                json={
                    "question": (
                        "Evaluate subglacial jökulhlaup outburst hazards at Grímsvötn "
                        "with ice dam drawdown 130 cm/hr and proglacial conductivity 780 uS/cm."
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
            info_events = [e for e in events if "jokulhlaup_escape_info" in e]
            assert len(info_events) >= 1
            stream_je_info = info_events[0]["jokulhlaup_escape_info"]
            assert stream_je_info["action"] == "jokulhlaup_escape_calculated"
            assert stream_je_info["calculation"]["ice_dam_drawdown_cm_per_hr"] == 130.0
            assert stream_je_info["calculation"]["proglacial_conductivity_us_cm"] == 780.0


@pytest.mark.anyio
async def test_jokulhlaup_escape_journey_real_mode_execution() -> None:
    """Verifies jokulhlaup escape prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Katla",
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
                    "Monitor proglacial electrical conductivity and subglacial harmonic tremor "
                    "continuously, and ascend to bedrock trimline terraces above the 50 m flood stage."
                )
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": (
                    "How do I monitor Kyagar Tso and Upper Shaksgam Glacier ice-dammed lake outburst hazards?"
                ),
                "customer_id": "1",
                "chat_history": "[]",
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "jokulhlaup_escape_info" in data
        assert data["jokulhlaup_escape_info"]["action"] == "jokulhlaup_escape_lookup"
        assert mock_llm.called
        call_kwargs = mock_llm.call_args.kwargs
        assert "jokulhlaup_escape_prompt" in call_kwargs
        assert "JÖKULHLAUP" in call_kwargs["jokulhlaup_escape_prompt"].upper() or (
            "JOKULHLAUP" in call_kwargs["jokulhlaup_escape_prompt"].upper()
        )
