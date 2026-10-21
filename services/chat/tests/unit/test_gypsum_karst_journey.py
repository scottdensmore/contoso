"""End-to-end 7-step API customer journey test for Subterranean Gypsum-Karst Dissolution Maze & Evaporite Breakdown-Hall Speleology Guide."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestGypsumKarstCustomerJourney:
    """7-step customer journey verifying discovery, filtering, detail, calculation, chat, and SSE."""

    def test_full_7_step_gypsum_karst_journey(self) -> None:
        with patch("main.REAL_CHAT_AVAILABLE", False):
            # Step 1: Discover all subterranean gypsum-karst dissolution maze & evaporite breakdown-hall sites
            step1 = client.get("/api/v1/gypsum-karst/sites")
            assert step1.status_code == 200
            sites_data = step1.json()
            assert sites_data["total"] == 4
            site_ids = {s["id"] for s in sites_data["sites"]}
            assert "optimisticeskaja-ozerna-podolia-ukraine" in site_ids
            assert "spipola-acquafredda-vena-del-gesso-italy" in site_ids
            assert "sorbas-covadura-yesos-almeria-spain" in site_ids
            assert "parks-ranch-chandelier-gypsum-new-mexico" in site_ids

            # Step 2: Filter sites by country and morphology
            step2_country = client.get(
                "/api/v1/gypsum-karst/sites",
                params={"country": "Italy"},
            )
            assert step2_country.status_code == 200
            assert step2_country.json()["total"] == 1
            assert (
                step2_country.json()["sites"][0]["id"]
                == "spipola-acquafredda-vena-del-gesso-italy"
            )

            step2_morph = client.get(
                "/api/v1/gypsum-karst/sites",
                params={"morphology": "arid-ephemeral-evaporite-sink"},
            )
            assert step2_morph.status_code == 200
            assert step2_morph.json()["total"] == 1
            assert (
                step2_morph.json()["sites"][0]["id"]
                == "sorbas-covadura-yesos-almeria-spain"
            )

            # Step 3: Inspect a specific site by ID (Optimisticeskaja & Ozerna)
            step3 = client.get(
                "/api/v1/gypsum-karst/sites/optimisticeskaja-ozerna-podolia-ukraine"
            )
            assert step3.status_code == 200
            detail = step3.json()
            assert "Optimisticeskaja" in detail["site"]["name"]
            assert detail["site"]["difficulty"] == "extreme"
            assert "baseline_calculation" in detail
            assert detail["baseline_calculation"]["risk_level"] in {
                "high",
                "critical",
            }

            # Step 4: Run custom calculator (POST and GET) for critical-risk vs low-risk conditions
            step4_post = client.post(
                "/api/v1/gypsum-karst/calculate",
                json={
                    "junction_count_per_100m": 38.0,
                    "ceiling_bed_thickness_cm": 5.0,
                    "surface_rain_inflow_mm_hr": 62.0,
                    "anhydrite_swelling_pct": 56.0,
                    "party_acoustic_decibels": 96.0,
                    "site_id": "optimisticeskaja-ozerna-podolia-ukraine",
                },
            )
            assert step4_post.status_code == 200
            calc_post = step4_post.json()["calculation"]
            assert calc_post["risk_level"] == "critical"
            assert calc_post["ceiling_slab_peel_probability_pct"] >= 75.0
            assert calc_post["maze_disorientation_entropy_score"] >= 75.0

            step4_get = client.get(
                "/api/v1/gypsum-karst/calculate",
                params={
                    "junction_count_per_100m": 4.0,
                    "ceiling_bed_thickness_cm": 95.0,
                    "surface_rain_inflow_mm_hr": 0.0,
                    "anhydrite_swelling_pct": 5.0,
                    "party_acoustic_decibels": 42.0,
                },
            )
            assert step4_get.status_code == 200
            calc_get = step4_get.json()["calculation"]
            assert calc_get["risk_level"] == "low"
            assert (
                calc_get["ceiling_slab_peel_probability_pct"]
                < calc_post["ceiling_slab_peel_probability_pct"]
            )

            # Step 5: Retrieve gear checklist
            step5 = client.get("/api/v1/gypsum-karst/checklist")
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
                        "How should we navigate Optimisticeskaja and Ozerna gypsum karst labyrinth "
                        "with junction count 34 per 100m, ceiling bed thickness 8 cm, "
                        "and surface rain inflow 18 mm/hr?"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert step6.status_code == 200
            chat_data = step6.json()
            assert "gypsum_karst_info" in chat_data
            gk_info = chat_data["gypsum_karst_info"]
            assert gk_info["action"] == "gypsum_karst_calculated"
            assert gk_info["calculation"]["junction_count_per_100m"] == 34.0
            assert gk_info["calculation"]["ceiling_bed_thickness_cm"] == 8.0
            assert gk_info["calculation"]["surface_rain_inflow_mm_hr"] == 18.0
            assert (
                "Optimisticeskaja" in chat_data["answer"]
                or "Ozerna" in chat_data["answer"]
            )

            # Step 7: SSE streaming endpoint integration (/api/create_response/stream)
            step7 = client.post(
                "/api/create_response/stream",
                json={
                    "question": (
                        "Evaluate flash-flood siphon and ceiling slab peel hazards in Yesos de Sorbas "
                        "and Cueva de Covadura evaporite karst with ceiling bed thickness 11 cm and surface rain inflow 32 mm/hr."
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
            info_events = [e for e in events if "gypsum_karst_info" in e]
            assert len(info_events) >= 1
            stream_gk_info = info_events[0]["gypsum_karst_info"]
            assert stream_gk_info["action"] == "gypsum_karst_calculated"
            assert stream_gk_info["calculation"]["ceiling_bed_thickness_cm"] == 11.0
            assert stream_gk_info["calculation"]["surface_rain_inflow_mm_hr"] == 32.0


@pytest.mark.anyio
async def test_gypsum_karst_journey_real_mode_execution() -> None:
    """Verifies gypsum karst prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Oksana",
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
                    "Deploy an EN 12542 survey line reel with numbered reflective directional station tags "
                    "at every rectilinear joint intersection in Optimisticeskaja, inspect delaminating "
                    "anhydrite-hydration ceiling beds before entering breakdown halls, and wear ANSI A5 "
                    "cut-resistant gloves around swallowtail selenite crystal blades."
                )
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": (
                    "How do I navigate Sistema Spipola-Acquafredda and Vena del Gesso Messinian selenite karst in Italy without getting lost in breakdown halls?"
                ),
                "customer_id": "1",
                "chat_history": "[]",
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "gypsum_karst_info" in data
        assert data["gypsum_karst_info"]["action"] == "gypsum_karst_lookup"
        assert mock_llm.called
        call_kwargs = mock_llm.call_args.kwargs
        assert "gypsum_karst_prompt" in call_kwargs
        assert "GYPSUM" in call_kwargs["gypsum_karst_prompt"].upper()
        assert (
            "EVAPORITE" in call_kwargs["gypsum_karst_prompt"].upper()
            or "KARST" in call_kwargs["gypsum_karst_prompt"].upper()
        )
