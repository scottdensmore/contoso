"""End-to-end 7-step API user journey test for Coastal Fjord Quick-Clay (Kvikkleire) Marine-Terrace & Retrogressive Slump Navigation."""

from __future__ import annotations

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def journey_client() -> TestClient:
    """Create a TestClient against the main FastAPI app in mock mode."""
    return TestClient(app)


class TestQuickClayTerraceSevenStepJourney:
    """Validate all 7 user journey steps across REST, chat, and SSE streaming endpoints."""

    def test_full_seven_step_quick_clay_terrace_journey(
        self, journey_client: TestClient
    ) -> None:
        # Step 1: Browse the full catalog of coastal fjord quick-clay marine-terrace sites
        step1 = journey_client.get("/api/quick-clay-terrace/sites")
        assert step1.status_code == 200
        catalog = step1.json()
        assert catalog["total"] == 4
        site_ids = {s["id"] for s in catalog["sites"]}
        assert "gauldalen-trondheimsfjord-kvikkleire-norway" in site_ids
        assert "romerike-gjerdrum-ravine-terrace-norway" in site_ids
        assert "south-nation-lemieux-leda-clay-ontario-canada" in site_ids
        assert "saguenay-saint-jean-vianney-terrace-quebec-canada" in site_ids

        # Step 2: Filter catalog by country and deposit_type across all three router mount prefixes
        step2_country = journey_client.get(
            "/api/v1/quick-clay-terrace/sites", params={"country": "Canada"}
        )
        assert step2_country.status_code == 200
        assert step2_country.json()["total"] == 2

        step2_dep = journey_client.get(
            "/quick-clay-terrace/sites",
            params={"deposit_type": "glaciomarine-kvikkleire-ravine"},
        )
        assert step2_dep.status_code == 200
        assert step2_dep.json()["total"] == 1
        assert (
            step2_dep.json()["sites"][0]["id"]
            == "gauldalen-trondheimsfjord-kvikkleire-norway"
        )

        # Step 3: Inspect a specific site by ID (Gauldalen & Rissa Trondheimsfjord Kvikkleire Marine-Terrace Ravines)
        step3 = journey_client.get(
            "/api/quick-clay-terrace/sites/gauldalen-trondheimsfjord-kvikkleire-norway"
        )
        assert step3.status_code == 200
        site_detail = step3.json()
        assert site_detail["country"] == "Norway"
        assert site_detail["deposit_type"] == "glaciomarine-kvikkleire-ravine"
        assert "calc_summary" in site_detail
        assert site_detail["calc_summary"]["risk_level"] in {
            "low",
            "moderate",
            "high",
            "critical",
        }

        # Step 4: Run deterministic calculator for a critical leached kvikkleire ravine slope
        step4 = journey_client.post(
            "/api/quick-clay-terrace/calculate",
            json={
                "sensitivity_ratio_st": 180.0,
                "pore_salinity_g_per_l": 0.35,
                "ravine_slope_angle_deg": 35.0,
                "stream_toe_erosion_rate_cm_yr": 105.0,
                "rainfall_saturation_pct": 90.0,
            },
        )
        assert step4.status_code == 200
        calc = step4.json()
        assert calc["risk_level"] == "critical"
        assert calc["retrogressive_liquefaction_risk_pct"] >= 70.0
        assert calc["remolded_shear_strength_kpa"] <= 0.4
        assert calc["retrogression_runout_distance_m"] >= 180.0
        assert calc["safe_crown_setback_distance_m"] >= 100.0
        assert len(calc["warnings"]) >= 3

        # Step 5: Retrieve specialized quick-clay marine-terrace gear checklist
        step5 = journey_client.get("/api/quick-clay-terrace/checklist")
        assert step5.status_code == 200
        checklist = step5.json()
        assert checklist["total"] == 6
        assert len(checklist["checklist"]) == 6

        with patch("main.REAL_CHAT_AVAILABLE", False):
            # Step 6: Synchronous chat endpoint `/api/create_response` with quick-clay terrace intent
            step6 = journey_client.post(
                "/api/create_response",
                json={
                    "question": (
                        "How do I safely navigate the Gauldalen and Rissa Trondheimsfjord kvikkleire "
                        "marine-terrace ravines in Norway with St 130 and 29 deg ravine slope?"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert step6.status_code == 200
            chat_body = step6.json()
            assert "answer" in chat_body
            assert "quick_clay_terrace_info" in chat_body
            qc_info = chat_body["quick_clay_terrace_info"]
            assert (
                qc_info["matched_site"]["id"]
                == "gauldalen-trondheimsfjord-kvikkleire-norway"
            )
            assert qc_info["calculation"]["sensitivity_ratio_st"] == 130.0
            assert qc_info["calculation"]["ravine_slope_angle_deg"] == 29.0

            # Step 7: Streaming SSE endpoint `/api/create_response/stream` with quick-clay terrace intent
            step7 = journey_client.post(
                "/api/create_response/stream",
                json={
                    "question": (
                        "Evaluate retrogressive slump liquefaction and crown setback "
                        "at South Nation River and Lemieux Champlain Sea Leda-clay bluffs with St 95"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert step7.status_code == 200
            raw_stream = step7.text
            assert "quick_clay_terrace_info" in raw_stream
            parsed_events = []
            for line in raw_stream.splitlines():
                if line.startswith("data: "):
                    payload_str = line[len("data: ") :].strip()
                    if payload_str and payload_str != "[DONE]":
                        try:
                            parsed_events.append(json.loads(payload_str))
                        except json.JSONDecodeError:
                            pass
            qc_events = [
                ev
                for ev in parsed_events
                if ev.get("event") == "quick_clay_terrace_info"
                or "quick_clay_terrace_info" in ev
            ]
            assert len(qc_events) >= 1


@pytest.mark.anyio
async def test_quick_clay_terrace_journey_real_mode_execution(
    journey_client: TestClient,
) -> None:
    """Verifies quick-clay terrace prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Astrid",
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
                    "Maintain at least a 15x scarp-height crown setback above leached kvikkleire "
                    "marine-terrace ravines in Gauldalen and never camp in bottleneck slump bowls."
                )
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = journey_client.post(
            "/api/create_response",
            json={
                "question": (
                    "How do I safely navigate quick-clay marine-terrace ravines in Gauldalen near Trondheimsfjord?"
                )
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "quick_clay_terrace_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "quick_clay_terrace_prompt" in call_kwargs
        prompt_content = call_kwargs["quick_clay_terrace_prompt"].lower()
        assert "quick-clay" in prompt_content or "kvikkleire" in prompt_content
