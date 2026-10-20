"""End-to-end 7-step API customer journey test for High-Altitude Salar Brine-Pool & Polygonal Halite Pressure-Ridge Trekking."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestSalarPressureRidgeCustomerJourney:
    """7-step customer journey verifying discovery, filtering, detail, calculation, chat, and SSE."""

    def test_full_7_step_salar_pressure_ridge_journey(self) -> None:
        with patch("main.REAL_CHAT_AVAILABLE", False):
            # Step 1: Discover all high-altitude salar pressure-ridge sites
            step1 = client.get("/api/v1/salar-pressure-ridge/sites")
            assert step1.status_code == 200
            sites_data = step1.json()
            assert sites_data["total"] == 4
            site_ids = {s["id"] for s in sites_data["sites"]}
            assert "uyuni-incahuasi-ojos-bolivia" in site_ids
            assert "atacama-soncor-cordillera-sal-chile" in site_ids
            assert "arizaro-cono-arita-puna-argentina" in site_ids
            assert "chalviri-termas-polques-bolivia" in site_ids

            # Step 2: Filter sites by country and morphology
            step2_country = client.get(
                "/api/v1/salar-pressure-ridge/sites", params={"country": "Chile"}
            )
            assert step2_country.status_code == 200
            assert step2_country.json()["total"] == 1
            assert (
                step2_country.json()["sites"][0]["id"]
                == "atacama-soncor-cordillera-sal-chile"
            )

            step2_morph = client.get(
                "/api/v1/salar-pressure-ridge/sites",
                params={"morphology": "polygonal-halite-pressure-crust"},
            )
            assert step2_morph.status_code == 200
            assert step2_morph.json()["total"] == 1
            assert (
                step2_morph.json()["sites"][0]["id"]
                == "arizaro-cono-arita-puna-argentina"
            )

            # Step 3: Inspect a specific site by ID (Salar de Atacama Laguna Chaxa & Cordillera de la Sal)
            step3 = client.get(
                "/api/v1/salar-pressure-ridge/sites/atacama-soncor-cordillera-sal-chile"
            )
            assert step3.status_code == 200
            detail = step3.json()
            assert "Atacama" in detail["site"]["name"]
            assert detail["site"]["difficulty"] == "extreme"
            assert "baseline_calculation" in detail
            assert detail["baseline_calculation"]["risk_level"] in {"high", "critical"}

            # Step 4: Run custom calculator (POST and GET) for critical-risk vs low-risk conditions
            step4_post = client.post(
                "/api/v1/salar-pressure-ridge/calculate",
                json={
                    "crust_thickness_cm": 5.0,
                    "brine_eye_proximity_m": 2.5,
                    "ridge_relief_cm": 92.0,
                    "solar_uv_index": 20.0,
                    "packsled_load_kg": 130.0,
                    "site_id": "uyuni-incahuasi-ojos-bolivia",
                },
            )
            assert step4_post.status_code == 200
            calc_post = step4_post.json()["calculation"]
            assert calc_post["risk_level"] in {"high", "critical"}
            assert calc_post["crust_punch_through_probability_pct"] > 60.0

            step4_get = client.get(
                "/api/v1/salar-pressure-ridge/calculate",
                params={
                    "crust_thickness_cm": 115.0,
                    "brine_eye_proximity_m": 150.0,
                    "ridge_relief_cm": 8.0,
                    "solar_uv_index": 5.0,
                    "packsled_load_kg": 18.0,
                },
            )
            assert step4_get.status_code == 200
            calc_get = step4_get.json()["calculation"]
            assert calc_get["risk_level"] == "low"
            assert (
                calc_get["crust_punch_through_probability_pct"]
                < calc_post["crust_punch_through_probability_pct"]
            )

            # Step 5: Retrieve gear checklist
            step5 = client.get("/api/v1/salar-pressure-ridge/checklist")
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
                        "How should we cross the Salar de Atacama halite pressure ridge "
                        "with crust thickness 12 cm, brine eye proximity 6 m, "
                        "and ridge relief 75 cm?"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert step6.status_code == 200
            chat_data = step6.json()
            assert "salar_pressure_ridge_info" in chat_data
            spr_info = chat_data["salar_pressure_ridge_info"]
            assert spr_info["action"] == "salar_pressure_ridge_calculated"
            assert spr_info["calculation"]["crust_thickness_cm"] == 12.0
            assert spr_info["calculation"]["brine_eye_proximity_m"] == 6.0
            assert spr_info["calculation"]["ridge_relief_cm"] == 75.0
            assert "Atacama" in chat_data["answer"] or "Cordillera" in chat_data["answer"]

            # Step 7: SSE streaming endpoint integration (/api/create_response/stream)
            step7 = client.post(
                "/api/create_response/stream",
                json={
                    "question": (
                        "Evaluate Ojos del Salar brine eye hazards on Salar de Uyuni Isla Incahuasi "
                        "with 9 cm crust thickness and 4 m brine eye proximity."
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
            info_events = [e for e in events if "salar_pressure_ridge_info" in e]
            assert len(info_events) >= 1
            stream_spr_info = info_events[0]["salar_pressure_ridge_info"]
            assert stream_spr_info["action"] == "salar_pressure_ridge_calculated"
            assert stream_spr_info["calculation"]["crust_thickness_cm"] == 9.0
            assert stream_spr_info["calculation"]["brine_eye_proximity_m"] == 4.0


@pytest.mark.anyio
async def test_salar_pressure_ridge_journey_real_mode_execution() -> None:
    """Verifies salar pressure ridge prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Valeria",
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
                    "Probe every translucent halite crust transition around Colchani Ojos del Salar "
                    "and wear Category-4 glacier wrap shields against extreme 0.85+ UV albedo."
                )
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": (
                    "How do I navigate Salar de Arizaro and Cono de Arita black-halite pressure ridge?"
                ),
                "customer_id": "1",
                "chat_history": "[]",
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "salar_pressure_ridge_info" in data
        assert data["salar_pressure_ridge_info"]["action"] == "salar_pressure_ridge_lookup"
        assert mock_llm.called
        call_kwargs = mock_llm.call_args.kwargs
        assert "salar_pressure_ridge_prompt" in call_kwargs
        assert "SALAR" in call_kwargs["salar_pressure_ridge_prompt"].upper()
