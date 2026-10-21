"""End-to-end 7-step API customer journey test for Boreal String-Bog (Aapa Mire) Flark-Pool & Palsa Permafrost-Mound Crossing."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestAapaPalsaMireCustomerJourney:
    """7-step customer journey verifying discovery, filtering, detail, calculation, chat, and SSE."""

    def test_full_7_step_aapa_palsa_mire_journey(self) -> None:
        with patch("main.REAL_CHAT_AVAILABLE", False):
            # Step 1: Discover all boreal string-bog (aapa mire) flark-pool & palsa permafrost-mound sites
            step1 = client.get("/api/v1/aapa-palsa-mire/sites")
            assert step1.status_code == 200
            sites_data = step1.json()
            assert sites_data["total"] == 4
            site_ids = {s["id"] for s in sites_data["sites"]}
            assert "voda-viiankiaapa-sodankyla-lapland-finland" in site_ids
            assert "tavvavuoma-kummavuopio-palsa-norrbotten-sweden" in site_ids
            assert "hudson-bay-lowlands-sutton-ridges-ontario-canada" in site_ids
            assert "pasvik-iettiselga-injarvi-palsa-finnmark-norway" in site_ids

            # Step 2: Filter sites by country and morphology
            step2_country = client.get(
                "/api/v1/aapa-palsa-mire/sites",
                params={"country": "Finland"},
            )
            assert step2_country.status_code == 200
            assert step2_country.json()["total"] == 1
            assert (
                step2_country.json()["sites"][0]["id"]
                == "voda-viiankiaapa-sodankyla-lapland-finland"
            )

            step2_morphology = client.get(
                "/api/v1/aapa-palsa-mire/sites",
                params={"morphology": "ice-cored-palsa-dome-plateau"},
            )
            assert step2_morphology.status_code == 200
            assert step2_morphology.json()["total"] == 1
            assert (
                step2_morphology.json()["sites"][0]["id"]
                == "tavvavuoma-kummavuopio-palsa-norrbotten-sweden"
            )

            # Step 3: Inspect a specific site by ID (Tavvavuoma & Vissátvuopmi Giant Palsa-Mound Plateau)
            step3 = client.get(
                "/api/v1/aapa-palsa-mire/sites/tavvavuoma-kummavuopio-palsa-norrbotten-sweden"
            )
            assert step3.status_code == 200
            detail = step3.json()
            assert "Tavvavuoma" in detail["site"]["name"]
            assert detail["site"]["difficulty"] == "extreme"
            assert "baseline_calculation" in detail
            assert detail["baseline_calculation"]["risk_level"] in {
                "high",
                "critical",
            }

            # Step 4: Run custom calculator (POST and GET) for critical-risk vs low-risk conditions
            step4_post = client.post(
                "/api/v1/aapa-palsa-mire/calculate",
                json={
                    "strang_width_m": 0.45,
                    "flark_trough_span_m": 52.0,
                    "active_thaw_depth_cm": 125.0,
                    "palsa_rim_fissure_score": 92.0,
                    "hiker_pack_weight_kg": 44.0,
                    "site_id": "tavvavuoma-kummavuopio-palsa-norrbotten-sweden",
                },
            )
            assert step4_post.status_code == 200
            calc_post = step4_post.json()["calculation"]
            assert calc_post["risk_level"] == "critical"
            assert calc_post["strang_shear_breakthrough_risk_pct"] >= 75.0
            assert calc_post["palsa_lagg_moat_entrapment_pct"] >= 75.0

            step4_get = client.get(
                "/api/v1/aapa-palsa-mire/calculate",
                params={
                    "strang_width_m": 5.0,
                    "flark_trough_span_m": 3.0,
                    "active_thaw_depth_cm": 22.0,
                    "palsa_rim_fissure_score": 8.0,
                    "hiker_pack_weight_kg": 9.0,
                },
            )
            assert step4_get.status_code == 200
            calc_get = step4_get.json()["calculation"]
            assert calc_get["risk_level"] == "low"
            assert (
                calc_get["strang_shear_breakthrough_risk_pct"]
                < calc_post["strang_shear_breakthrough_risk_pct"]
            )

            # Step 5: Retrieve gear checklist
            step5 = client.get("/api/v1/aapa-palsa-mire/checklist")
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
                        "How should we cross the Viiankiaapa concentric string-bog aapa mire in Sodankylä "
                        "with strang width 0.85 m, flark trough span 30 m, "
                        "and active thaw depth 92 cm?"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert step6.status_code == 200
            chat_data = step6.json()
            assert "aapa_palsa_mire_info" in chat_data
            apm_info = chat_data["aapa_palsa_mire_info"]
            assert apm_info["action"] == "aapa_palsa_mire_calculated"
            assert apm_info["calculation"]["strang_width_m"] == 0.85
            assert apm_info["calculation"]["flark_trough_span_m"] == 30.0
            assert apm_info["calculation"]["active_thaw_depth_cm"] == 92.0
            assert (
                "Viiankiaapa" in chat_data["answer"]
                or "Sodankylä" in chat_data["answer"]
            )

            # Step 7: SSE streaming endpoint integration (/api/create_response/stream)
            step7 = client.post(
                "/api/create_response/stream",
                json={
                    "question": (
                        "Evaluate palsa lagg moat entrapment hazards in Tavvavuoma "
                        "with strang width 0.75 m and active thaw depth 98 cm."
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
            info_events = [e for e in events if "aapa_palsa_mire_info" in e]
            assert len(info_events) >= 1
            stream_apm_info = info_events[0]["aapa_palsa_mire_info"]
            assert stream_apm_info["action"] == "aapa_palsa_mire_calculated"
            assert stream_apm_info["calculation"]["strang_width_m"] == 0.75
            assert stream_apm_info["calculation"]["active_thaw_depth_cm"] == 98.0


@pytest.mark.anyio
async def test_aapa_palsa_mire_journey_real_mode_execution() -> None:
    """Verifies aapa palsa mire prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Eino",
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
                    "Follow continuous Betula nana-anchored sträng peat ridges around dark open-water "
                    "rimpi flark pools, probe palsa thermokarst lagg moats with a graduated 2.0 m "
                    "sounding staff, and wear a 1200-mesh Simuliidae blackfly headnet."
                )
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": (
                    "How do I navigate the Hudson Bay Lowlands and Sutton Ridges string-fen and palsa complex without sinking into lagg moats?"
                ),
                "customer_id": "1",
                "chat_history": "[]",
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "aapa_palsa_mire_info" in data
        assert data["aapa_palsa_mire_info"]["action"] == "aapa_palsa_mire_lookup"
        assert mock_llm.called
        call_kwargs = mock_llm.call_args.kwargs
        assert "aapa_palsa_mire_prompt" in call_kwargs
        assert "AAPA" in call_kwargs["aapa_palsa_mire_prompt"].upper()
        assert (
            "PALSA" in call_kwargs["aapa_palsa_mire_prompt"].upper()
            or "FLARK" in call_kwargs["aapa_palsa_mire_prompt"].upper()
        )
