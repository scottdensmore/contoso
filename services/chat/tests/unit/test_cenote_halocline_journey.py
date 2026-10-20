"""End-to-end 7-step API customer journey test for Cenote Halocline Navigation."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestCenoteHaloclineCustomerJourney:
    """7-step customer journey verifying discovery, filtering, detail, calculation, chat, and SSE."""

    def test_full_7_step_cenote_halocline_journey(self) -> None:
        with patch("main.REAL_CHAT_AVAILABLE", False):
            # Step 1: Discover all cenote halocline sites
            step1 = client.get("/api/v1/cenote-halocline/sites")
            assert step1.status_code == 200
            sites_data = step1.json()
            assert sites_data["total"] == 4
            site_ids = {s["id"] for s in sites_data["sites"]}
            assert "ox-bel-ha-halocline-tulum-mexico" in site_ids
            assert "angelita-h2s-cloud-tulum-mexico" in site_ids
            assert "sac-actun-pet-cembalo-mexico" in site_ids
            assert "dan-s-cave-abaco-anchialine-bahamas" in site_ids

            # Step 2: Filter sites by country and morphology
            step2_country = client.get(
                "/api/v1/cenote-halocline/sites", params={"country": "Mexico"}
            )
            assert step2_country.status_code == 200
            assert step2_country.json()["total"] == 3

            step2_morph = client.get(
                "/api/v1/cenote-halocline/sites",
                params={"morphology": "coastal-tidal-siphon-blue-hole"},
            )
            assert step2_morph.status_code == 200
            assert step2_morph.json()["total"] == 1
            assert step2_morph.json()["sites"][0]["id"] == "dan-s-cave-abaco-anchialine-bahamas"

            # Step 3: Inspect a specific site by ID (Sistema Ox Bel Ha)
            step3 = client.get("/api/v1/cenote-halocline/sites/ox-bel-ha-halocline-tulum-mexico")
            assert step3.status_code == 200
            detail = step3.json()
            assert "Ox Bel Ha" in detail["site"]["name"]
            assert detail["site"]["difficulty"] == "extreme"
            assert "baseline_calculation" in detail
            assert detail["baseline_calculation"]["risk_level"] in {"high", "critical"}

            # Step 4: Run custom calculator (POST and GET) for critical-risk vs low-risk conditions
            step4_post = client.post(
                "/api/v1/cenote-halocline/calculate",
                json={
                    "salinity_delta_ppt": 33.0,
                    "tannic_doc_mg_l": 42.0,
                    "silt_clay_fraction_pct": 80.0,
                    "penetration_distance_m": 850.0,
                    "h2s_concentration_ppm": 35.0,
                    "site_id": "ox-bel-ha-halocline-tulum-mexico",
                },
            )
            assert step4_post.status_code == 200
            calc_post = step4_post.json()["calculation"]
            assert calc_post["risk_level"] in {"high", "critical"}
            assert calc_post["schlieren_optical_blur_index"] > 65.0

            step4_get = client.get(
                "/api/v1/cenote-halocline/calculate",
                params={
                    "salinity_delta_ppt": 5.0,
                    "tannic_doc_mg_l": 2.0,
                    "silt_clay_fraction_pct": 10.0,
                    "penetration_distance_m": 60.0,
                    "h2s_concentration_ppm": 0.0,
                },
            )
            assert step4_get.status_code == 200
            calc_get = step4_get.json()["calculation"]
            assert calc_get["risk_level"] == "low"
            assert calc_get["post_mix_visibility_meters"] > calc_post["post_mix_visibility_meters"]

            # Step 5: Retrieve gear checklist
            step5 = client.get("/api/v1/cenote-halocline/checklist")
            assert step5.status_code == 200
            checklist_data = step5.json()
            assert checklist_data["total"] == 6
            assert all(item["priority"] == "essential" for item in checklist_data["gear_checklist"])

            # Step 6: Chat endpoint integration (/api/create_response)
            step6 = client.post(
                "/api/create_response",
                json={
                    "question": (
                        "How should we navigate the halocline in Sistema Ox Bel Ha "
                        "with a salinity delta of 32 ppt, penetration distance of 500 m, "
                        "and silt clay fraction of 60%?"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert step6.status_code == 200
            chat_data = step6.json()
            assert "cenote_halocline_info" in chat_data
            ch_info = chat_data["cenote_halocline_info"]
            assert ch_info["action"] == "cenote_halocline_calculated"
            assert ch_info["calculation"]["salinity_delta_ppt"] == 32.0
            assert ch_info["calculation"]["penetration_distance_m"] == 500.0
            assert ch_info["calculation"]["silt_clay_fraction_pct"] == 60.0
            assert "Ox Bel Ha" in chat_data["answer"]

            # Step 7: SSE streaming endpoint integration (/api/create_response/stream)
            step7 = client.post(
                "/api/create_response/stream",
                json={
                    "question": (
                        "Evaluate meromictic chemocline hazards in Cenote Angelita "
                        "with 30 ppt salinity delta and 28 ppm H2S concentration."
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
            info_events = [e for e in events if "cenote_halocline_info" in e]
            assert len(info_events) >= 1
            stream_ch_info = info_events[0]["cenote_halocline_info"]
            assert stream_ch_info["action"] == "cenote_halocline_calculated"
            assert stream_ch_info["calculation"]["salinity_delta_ppt"] == 30.0
            assert stream_ch_info["calculation"]["h2s_concentration_ppm"] == 28.0


@pytest.mark.anyio
async def test_cenote_halocline_journey_real_mode_execution() -> None:
    """Verifies cenote halocline prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Ixchel",
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
                    "Maintain continuous tactile contact with the gold baseline in Sistema Ox Bel Ha "
                    "and adjust wing buoyancy when ascending or descending through the 32 ppt halocline."
                )
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": (
                    "How do I navigate the anchialine halocline in Sistema Ox Bel Ha near Tulum?"
                ),
                "customer_id": "1",
                "chat_history": "[]",
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "cenote_halocline_info" in data
        assert data["cenote_halocline_info"]["action"] == "cenote_halocline_lookup"
        assert mock_llm.called
        call_kwargs = mock_llm.call_args.kwargs
        assert "cenote_halocline_prompt" in call_kwargs
        assert "CENOTE HALOCLINE" in call_kwargs["cenote_halocline_prompt"].upper()
