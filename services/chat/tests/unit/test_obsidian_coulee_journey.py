"""End-to-end 7-step API user journey test for High-Altitude Volcanic Obsidian-Flow & Glass-Block Coulee Scrambling."""

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


class TestObsidianCouleeSevenStepJourney:
    """Validate all 7 user journey steps across REST, chat, and SSE streaming endpoints."""

    def test_full_seven_step_obsidian_coulee_journey(
        self, journey_client: TestClient
    ) -> None:
        # Step 1: Browse the full catalog of volcanic obsidian-flow & glass-block coulee sites
        step1 = journey_client.get("/api/obsidian-coulee/sites")
        assert step1.status_code == 200
        catalog = step1.json()
        assert catalog["total"] == 4
        site_ids = {s["id"] for s in catalog["sites"]}
        assert "big-obsidian-flow-newberry-caldera-oregon" in site_ids
        assert "glass-mountain-medicine-lake-volcano-california" in site_ids
        assert "panum-crater-mono-inyo-obsidian-domes-california" in site_ids
        assert "hrafntinnusker-torfajokull-obsidian-plateau-iceland" in site_ids

        # Step 2: Filter catalog by country and lithology across all three router mount prefixes
        step2_country = journey_client.get(
            "/api/v1/obsidian-coulee/sites", params={"country": "Iceland"}
        )
        assert step2_country.status_code == 200
        assert step2_country.json()["total"] == 1
        assert (
            step2_country.json()["sites"][0]["id"]
            == "hrafntinnusker-torfajokull-obsidian-plateau-iceland"
        )

        step2_lith = journey_client.get(
            "/obsidian-coulee/sites",
            params={"lithology": "banded-rhyolite-obsidian-coulee"},
        )
        assert step2_lith.status_code == 200
        assert step2_lith.json()["total"] == 1
        assert (
            step2_lith.json()["sites"][0]["id"]
            == "big-obsidian-flow-newberry-caldera-oregon"
        )

        # Step 3: Inspect a specific site by ID (Big Obsidian Flow & Paulina Peak Rhyolite Coulee)
        step3 = journey_client.get(
            "/api/obsidian-coulee/sites/big-obsidian-flow-newberry-caldera-oregon"
        )
        assert step3.status_code == 200
        site_detail = step3.json()
        assert site_detail["country"] == "USA"
        assert site_detail["lithology"] == "banded-rhyolite-obsidian-coulee"
        assert "calc_summary" in site_detail
        assert site_detail["calc_summary"]["risk_level"] in {
            "low",
            "moderate",
            "high",
            "critical",
        }

        # Step 4: Run deterministic calculator for an extreme glass-block pressure-spine coulee
        step4 = journey_client.post(
            "/api/obsidian-coulee/calculate",
            json={
                "conchoidal_flake_density_pct": 88.0,
                "block_instability_tilt_deg": 39.0,
                "vesicular_pumice_crust_ratio_pct": 78.0,
                "coulee_crest_relief_m": 105.0,
                "scrambler_pack_mass_kg": 28.0,
            },
        )
        assert step4.status_code == 200
        calc = step4.json()
        assert calc["risk_level"] == "critical"
        assert calc["surgical_laceration_severity_score"] >= 70.0
        assert calc["vesicular_crust_collapse_probability_pct"] >= 65.0
        assert calc["block_teeter_pinch_hazard_pct"] >= 65.0
        assert calc["boot_lug_shred_rate_mm_per_km"] >= 2.0
        assert len(calc["warnings"]) >= 3

        # Step 5: Retrieve specialized obsidian coulee gear checklist
        step5 = journey_client.get("/api/obsidian-coulee/checklist")
        assert step5.status_code == 200
        checklist = step5.json()
        assert checklist["total"] == 6
        assert len(checklist["checklist"]) == 6

        with patch("main.REAL_CHAT_AVAILABLE", False):
            # Step 6: Synchronous chat endpoint `/api/create_response` with obsidian coulee intent
            step6 = journey_client.post(
                "/api/create_response",
                json={
                    "question": (
                        "How do I safely scramble the Big Obsidian Flow coulee at Newberry Caldera "
                        "in Oregon with 62% conchoidal flake density and 26 deg block tilt?"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert step6.status_code == 200
            chat_body = step6.json()
            assert "answer" in chat_body
            assert "obsidian_coulee_info" in chat_body
            oc_info = chat_body["obsidian_coulee_info"]
            assert oc_info["matched_site"]["id"] == "big-obsidian-flow-newberry-caldera-oregon"
            assert oc_info["calculation"]["conchoidal_flake_density_pct"] == 62.0
            assert oc_info["calculation"]["block_instability_tilt_deg"] == 26.0

            # Step 7: Streaming SSE endpoint `/api/create_response/stream` with obsidian coulee intent
            step7 = journey_client.post(
                "/api/create_response/stream",
                json={
                    "question": (
                        "Evaluate surgical glass laceration and pumice crust collapse "
                        "at Glass Mountain Medicine Lake obsidian flow with 85% conchoidal flake density"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert step7.status_code == 200
            raw_stream = step7.text
            assert "obsidian_coulee_info" in raw_stream
            parsed_events = []
            for line in raw_stream.splitlines():
                if line.startswith("data: "):
                    payload_str = line[len("data: ") :].strip()
                    if payload_str and payload_str != "[DONE]":
                        try:
                            parsed_events.append(json.loads(payload_str))
                        except json.JSONDecodeError:
                            pass
            oc_events = [
                ev
                for ev in parsed_events
                if ev.get("event") == "obsidian_coulee_info"
                or "obsidian_coulee_info" in ev
            ]
            assert len(oc_events) >= 1


@pytest.mark.anyio
async def test_obsidian_coulee_journey_real_mode_execution(
    journey_client: TestClient,
) -> None:
    """Verifies obsidian coulee prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Klara",
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
                    "Wear ANSI A7/A9 Kevlar-lined leather gloves and high-durometer Vibram Mont boots "
                    "when scrambling across conchoidal volcanic glass blocks on Big Obsidian Flow."
                )
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = journey_client.post(
            "/api/create_response",
            json={
                "question": (
                    "How do I scramble across the Big Obsidian Flow coulee at Newberry Caldera in Oregon?"
                )
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "obsidian_coulee_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "obsidian_coulee_prompt" in call_kwargs
        prompt_content = call_kwargs["obsidian_coulee_prompt"].lower()
        assert "obsidian" in prompt_content or "newberry" in prompt_content
