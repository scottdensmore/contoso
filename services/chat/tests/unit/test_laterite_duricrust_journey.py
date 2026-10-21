"""End-to-end 7-step API user journey test for Tropical Laterite Duricrust Mesa & Bauxite Ferricrete Scarp-Edge Bushwhacking."""

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


class TestLateriteDuricrustSevenStepJourney:
    """Validate all 7 user journey steps across REST, chat, and SSE streaming endpoints."""

    def test_full_seven_step_laterite_duricrust_journey(
        self, journey_client: TestClient
    ) -> None:
        # Step 1: Browse the full catalog of tropical laterite duricrust & bauxite ferricrete sites
        step1 = journey_client.get("/api/laterite-duricrust/sites")
        assert step1.status_code == 200
        catalog = step1.json()
        assert catalog["total"] == 4
        site_ids = {s["id"] for s in catalog["sites"]}
        assert "fouta-djallon-bowe-labe-guinea" in site_ids
        assert "serra-dos-carajas-canga-para-brazil" in site_ids
        assert "mitchell-plateau-ngauwudu-kimberley-australia" in site_ids
        assert "panchgani-kaas-ferricrete-tableland-maharashtra-india" in site_ids

        # Step 2: Filter catalog by country and duricrust_type
        step2_country = journey_client.get(
            "/api/v1/laterite-duricrust/sites", params={"country": "Brazil"}
        )
        assert step2_country.status_code == 200
        assert step2_country.json()["total"] == 1
        assert (
            step2_country.json()["sites"][0]["id"]
            == "serra-dos-carajas-canga-para-brazil"
        )

        step2_type = journey_client.get(
            "/laterite-duricrust/sites", params={"duricrust_type": "ferricrete-bowal"}
        )
        assert step2_type.status_code == 200
        assert step2_type.json()["total"] == 1
        assert (
            step2_type.json()["sites"][0]["id"]
            == "fouta-djallon-bowe-labe-guinea"
        )

        # Step 3: Inspect a specific site by ID (Fouta Djallon & Labé Ferricrete Bowé)
        step3 = journey_client.get(
            "/api/laterite-duricrust/sites/fouta-djallon-bowe-labe-guinea"
        )
        assert step3.status_code == 200
        site_detail = step3.json()
        assert site_detail["country"] == "Guinea"
        assert "calc_summary" in site_detail
        assert site_detail["calc_summary"]["risk_level"] in {
            "low",
            "moderate",
            "high",
            "critical",
        }

        # Step 4: Run deterministic calculator for an extreme cantilever scarp & pisolite slope
        step4 = journey_client.post(
            "/api/laterite-duricrust/calculate",
            json={
                "pisolite_gravel_depth_mm": 52.0,
                "scarp_slope_angle_deg": 39.0,
                "saprolite_undercut_span_m": 3.8,
                "surface_rock_temp_c": 61.0,
                "convective_storm_proximity_km": 4.5,
            },
        )
        assert step4.status_code == 200
        calc = step4.json()
        assert calc["risk_level"] == "critical"
        assert calc["pisolite_ball_bearing_slip_pct"] >= 65.0
        assert calc["cantilever_rim_collapse_probability_pct"] >= 65.0
        assert calc["ferruginous_compass_deviation_deg"] >= 5.0
        assert len(calc["warnings"]) >= 3

        # Step 5: Retrieve specialized laterite duricrust gear checklist
        step5 = journey_client.get("/api/laterite-duricrust/checklist")
        assert step5.status_code == 200
        checklist = step5.json()
        assert checklist["total"] == 6
        assert len(checklist["checklist"]) == 6

        with patch("main.REAL_CHAT_AVAILABLE", False):
            # Step 6: Synchronous chat endpoint `/api/create_response` with laterite duricrust intent
            step6 = journey_client.post(
                "/api/create_response",
                json={
                    "question": (
                        "How do I safely cross loose pisolite buckshot gravel and cantilevered "
                        "ferricrete bowal scarp rims on Fouta Djallon in Guinea with 35 mm gravel "
                        "and 2.8 m saprolite undercut?"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert step6.status_code == 200
            chat_body = step6.json()
            assert "answer" in chat_body
            assert "laterite_duricrust_info" in chat_body
            ld_info = chat_body["laterite_duricrust_info"]
            assert ld_info["matched_site"]["id"] == "fouta-djallon-bowe-labe-guinea"
            assert ld_info["calculation"]["pisolite_gravel_depth_mm"] == 35.0
            assert ld_info["calculation"]["saprolite_undercut_span_m"] == 2.8

            # Step 7: Streaming SSE endpoint `/api/create_response/stream` with laterite duricrust intent
            step7 = journey_client.post(
                "/api/create_response/stream",
                json={
                    "question": (
                        "Evaluate canga hematite mesa compass deviation and lightning hazard "
                        "at Serra dos Carajás in Brazil with 56 C rock temp and storm 5 km away"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert step7.status_code == 200
            raw_stream = step7.text
            assert "laterite_duricrust_info" in raw_stream
            parsed_events = []
            for line in raw_stream.splitlines():
                if line.startswith("data: "):
                    payload_str = line[len("data: ") :].strip()
                    if payload_str and payload_str != "[DONE]":
                        try:
                            parsed_events.append(json.loads(payload_str))
                        except json.JSONDecodeError:
                            pass
            ld_events = [
                ev
                for ev in parsed_events
                if ev.get("event") == "laterite_duricrust_info"
                or "laterite_duricrust_info" in ev
            ]
            assert len(ld_events) >= 1


@pytest.mark.anyio
async def test_laterite_duricrust_journey_real_mode_execution(
    journey_client: TestClient,
) -> None:
    """Verifies laterite duricrust prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Amadou",
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
                    "Stay at least 4 m back from cantilevered ferricrete bowal breakaway rims "
                    "on Fouta Djallon and use optical/GNSS sighting across magnetic canga pavements."
                )
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = journey_client.post(
            "/api/create_response",
            json={
                "question": (
                    "How do I cross pisolitic buckshot gravel and cantilevered ferricrete bowal rims on Fouta Djallon in Guinea?"
                )
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "laterite_duricrust_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "laterite_duricrust_prompt" in call_kwargs
        prompt_content = call_kwargs["laterite_duricrust_prompt"].lower()
        assert "laterite" in prompt_content or "fouta djallon" in prompt_content

