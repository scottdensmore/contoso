"""End-to-end 7-step API user journey test for Arid Badlands Bentonite Popcorn-Clay & Piping-Tunnel Sinkhole Navigation."""

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


class TestBentoniteBadlandsSevenStepJourney:
    """Validate all 7 user journey steps across REST, chat, and SSE streaming endpoints."""

    def test_full_seven_step_bentonite_badlands_journey(
        self, journey_client: TestClient
    ) -> None:
        # Step 1: Browse the full catalog of arid badlands bentonite popcorn-clay & piping-tunnel sites
        step1 = journey_client.get("/api/bentonite-badlands/sites")
        assert step1.status_code == 200
        catalog = step1.json()
        assert catalog["total"] == 4
        site_ids = {s["id"] for s in catalog["sites"]}
        assert "badlands-sage-creek-chadron-south-dakota" in site_ids
        assert "cainville-factory-butte-mancos-shale-utah" in site_ids
        assert "dinosaur-red-deer-bearpaw-badlands-alberta-canada" in site_ids
        assert "bardenas-reales-pisquerra-piping-navarra-spain" in site_ids

        # Step 2: Filter catalog by country and morphology across all three router mount prefixes
        step2_country = journey_client.get(
            "/api/v1/bentonite-badlands/sites", params={"country": "USA"}
        )
        assert step2_country.status_code == 200
        assert step2_country.json()["total"] == 2

        step2_morph = journey_client.get(
            "/bentonite-badlands/sites",
            params={"morphology": "piping-tunnel-bridge"},
        )
        assert step2_morph.status_code == 200
        assert step2_morph.json()["total"] == 1
        assert (
            step2_morph.json()["sites"][0]["id"]
            == "dinosaur-red-deer-bearpaw-badlands-alberta-canada"
        )

        # Step 3: Inspect a specific site by ID (Badlands National Park Sage Creek & Chadron Formation)
        step3 = journey_client.get(
            "/api/bentonite-badlands/sites/badlands-sage-creek-chadron-south-dakota"
        )
        assert step3.status_code == 200
        site_detail = step3.json()
        assert site_detail["country"] == "USA"
        assert site_detail["morphology"] == "popcorn-crust-mound"
        assert "calc_summary" in site_detail
        assert site_detail["calc_summary"]["risk_level"] in {
            "low",
            "moderate",
            "high",
            "critical",
        }

        # Step 4: Run deterministic calculator for a critical rain-soaked sodium-bentonite slope
        step4 = journey_client.post(
            "/api/bentonite-badlands/calculate",
            json={
                "smectite_free_swell_index_pct": 420.0,
                "popcorn_crust_thickness_cm": 20.0,
                "piping_roof_thickness_cm": 15.0,
                "rainfall_intensity_mm_hr": 38.0,
                "slope_angle_deg": 42.0,
                "sodium_adsorption_ratio_sar": 35.0,
                "hiker_load_kg": 92.0,
            },
        )
        assert step4.status_code == 200
        calc = step4.json()
        assert calc["risk_level"] == "critical"
        assert calc["piping_roof_punch_through_risk_pct"] >= 70.0
        assert calc["wet_gumbo_traction_loss_pct"] >= 70.0
        assert calc["boot_mud_accretion_kg"] >= 2.5
        assert calc["safe_pipe_bridge_setback_m"] >= 14.0
        assert len(calc["warnings"]) >= 3

        # Step 5: Retrieve specialized bentonite badlands gear checklist via POST and GET
        step5_post = journey_client.post("/api/bentonite-badlands/gear-checklist")
        assert step5_post.status_code == 200
        checklist = step5_post.json()
        assert checklist["total"] == 6
        assert len(checklist["checklist"]) == 6

        step5_get = journey_client.get("/api/bentonite-badlands/checklist")
        assert step5_get.status_code == 200
        assert step5_get.json()["total"] == 6

        with patch("main.REAL_CHAT_AVAILABLE", False):
            # Step 6: Synchronous chat endpoint `/api/create_response` with bentonite badlands intent
            step6 = journey_client.post(
                "/api/create_response",
                json={
                    "question": (
                        "How do I safely navigate the Sage Creek Chadron bentonite popcorn-clay mounds "
                        "in South Dakota with 295% free-swell index and 34 deg badlands slope?"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert step6.status_code == 200
            chat_body = step6.json()
            assert "answer" in chat_body
            assert "bentonite_badlands_info" in chat_body
            bb_info = chat_body["bentonite_badlands_info"]
            assert (
                bb_info["matched_site"]["id"]
                == "badlands-sage-creek-chadron-south-dakota"
            )
            assert bb_info["calculation"]["smectite_free_swell_index_pct"] == 295.0
            assert bb_info["calculation"]["slope_angle_deg"] == 34.0

            # Step 7: Streaming SSE endpoint `/api/create_response/stream` with bentonite badlands intent
            step7 = journey_client.post(
                "/api/create_response/stream",
                json={
                    "question": (
                        "Evaluate subsurface piping-tunnel sinkhole punch-through and gumbo boot adhesion "
                        "at Dinosaur Provincial Park Bearpaw bentonite badlands with 18 cm piping roof thickness"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert step7.status_code == 200
            raw_stream = step7.text
            assert "bentonite_badlands_info" in raw_stream
            parsed_events = []
            for line in raw_stream.splitlines():
                if line.startswith("data: "):
                    payload_str = line[len("data: ") :].strip()
                    if payload_str and payload_str != "[DONE]":
                        try:
                            parsed_events.append(json.loads(payload_str))
                        except json.JSONDecodeError:
                            pass
            bb_events = [
                ev
                for ev in parsed_events
                if ev.get("event") == "bentonite_badlands_info"
                or "bentonite_badlands_info" in ev
            ]
            assert len(bb_events) >= 1


@pytest.mark.anyio
async def test_bentonite_badlands_journey_real_mode_execution(
    journey_client: TestClient,
) -> None:
    """Verifies bentonite badlands prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Sierra",
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
                    "Route along consolidated sandstone caprock benches or vegetated prairie tables "
                    "and probe all suspect flute-hole sinks with a 150 cm T-handle probe before stepping."
                )
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = journey_client.post(
            "/api/create_response",
            json={
                "question": (
                    "How do I safely navigate bentonite popcorn-clay mounds and piping tunnels in Sage Creek Badlands?"
                )
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "bentonite_badlands_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "bentonite_badlands_prompt" in call_kwargs
        prompt_content = call_kwargs["bentonite_badlands_prompt"].lower()
        assert "bentonite" in prompt_content or "popcorn-clay" in prompt_content
