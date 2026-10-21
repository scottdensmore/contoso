"""End-to-end 7-step API customer journey test for Coastal Intertidal Sabellariid Worm-Reef & Barnacle-Encrusted Basalt Ledge Traversing."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestBarnacleLedgeCustomerJourney:
    """7-step customer journey verifying discovery, filtering, detail, calculation, chat, and SSE."""

    def test_full_7_step_barnacle_ledge_journey(self) -> None:
        with patch("main.REAL_CHAT_AVAILABLE", False):
            # Step 1: Discover all intertidal sabellariid worm-reef & barnacle ledge sites
            step1 = client.get("/api/v1/barnacle-ledge/sites")
            assert step1.status_code == 200
            sites_data = step1.json()
            assert sites_data["total"] == 4
            site_ids = {s["id"] for s in sites_data["sites"]}
            assert "cape-perpetua-yachats-basalt-bench-oregon" in site_ids
            assert "duckpool-bude-sabellaria-reef-cornwall-uk" in site_ids
            assert "west-coast-trail-owen-point-shelf-bc-canada" in site_ids
            assert "cabo-percebes-costa-da-morte-galicia-spain" in site_ids

            # Step 2: Filter sites by country and substrate_type
            step2_country = client.get(
                "/api/v1/barnacle-ledge/sites", params={"country": "USA"}
            )
            assert step2_country.status_code == 200
            assert step2_country.json()["total"] == 1
            assert (
                step2_country.json()["sites"][0]["id"]
                == "cape-perpetua-yachats-basalt-bench-oregon"
            )

            step2_sub = client.get(
                "/api/v1/barnacle-ledge/sites",
                params={"substrate_type": "sabellariid-honeycomb-worm-reef"},
            )
            assert step2_sub.status_code == 200
            assert step2_sub.json()["total"] == 1
            assert (
                step2_sub.json()["sites"][0]["id"]
                == "duckpool-bude-sabellaria-reef-cornwall-uk"
            )

            # Step 3: Inspect a specific site by ID (Cape Perpetua & Thor's Well)
            step3 = client.get(
                "/api/v1/barnacle-ledge/sites/cape-perpetua-yachats-basalt-bench-oregon"
            )
            assert step3.status_code == 200
            detail = step3.json()
            assert "Cape Perpetua" in detail["site"]["name"]
            assert detail["site"]["difficulty"] == "extreme"
            assert "baseline_calculation" in detail
            assert detail["baseline_calculation"]["risk_level"] in {"high", "critical"}

            # Step 4: Run custom calculator (POST and GET) for critical-risk vs low-risk conditions
            step4_post = client.post(
                "/api/v1/barnacle-ledge/calculate",
                json={
                    "swell_height_m": 4.6,
                    "swell_period_sec": 18.5,
                    "algal_biofilm_cover_pct": 85.0,
                    "sabellariid_colony_density_pct": 70.0,
                    "ledge_freeboard_m": 0.5,
                    "site_id": "cape-perpetua-yachats-basalt-bench-oregon",
                },
            )
            assert step4_post.status_code == 200
            calc_post = step4_post.json()["calculation"]
            assert calc_post["risk_level"] == "critical"
            assert calc_post["infragravity_overwash_probability_pct"] >= 75.0

            step4_get = client.get(
                "/api/v1/barnacle-ledge/calculate",
                params={
                    "swell_height_m": 0.5,
                    "swell_period_sec": 7.0,
                    "algal_biofilm_cover_pct": 10.0,
                    "sabellariid_colony_density_pct": 5.0,
                    "ledge_freeboard_m": 3.8,
                },
            )
            assert step4_get.status_code == 200
            calc_get = step4_get.json()["calculation"]
            assert calc_get["risk_level"] == "low"
            assert (
                calc_get["infragravity_overwash_probability_pct"]
                < calc_post["infragravity_overwash_probability_pct"]
            )

            # Step 5: Retrieve gear checklist
            step5 = client.get("/api/v1/barnacle-ledge/checklist")
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
                        "How should we traverse the Cape Perpetua barnacle ledge "
                        "with swell height 2.8 m, swell period 16 sec, "
                        "and algal biofilm cover 72%?"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert step6.status_code == 200
            chat_data = step6.json()
            assert "barnacle_ledge_info" in chat_data
            bl_info = chat_data["barnacle_ledge_info"]
            assert bl_info["action"] == "barnacle_ledge_calculated"
            assert bl_info["calculation"]["swell_height_m"] == 2.8
            assert bl_info["calculation"]["swell_period_sec"] == 16.0
            assert bl_info["calculation"]["algal_biofilm_cover_pct"] == 72.0
            assert "Perpetua" in chat_data["answer"] or "Thor" in chat_data["answer"]

            # Step 7: SSE streaming endpoint integration (/api/create_response/stream)
            step7 = client.post(
                "/api/create_response/stream",
                json={
                    "question": (
                        "Evaluate intertidal sabellariid honeycomb worm-reef and barnacle ledge hazards "
                        "at Duckpool with swell height 1.9 m and swell period 13 sec."
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
            info_events = [e for e in events if "barnacle_ledge_info" in e]
            assert len(info_events) >= 1
            stream_bl_info = info_events[0]["barnacle_ledge_info"]
            assert stream_bl_info["action"] == "barnacle_ledge_calculated"
            assert stream_bl_info["calculation"]["swell_height_m"] == 1.9
            assert stream_bl_info["calculation"]["swell_period_sec"] == 13.0


@pytest.mark.anyio
async def test_barnacle_ledge_journey_real_mode_execution() -> None:
    """Verifies barnacle ledge prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Morwenna",
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
                    "Step only on bare basalt or barnacle-encrusted micro-roughness between Sabellaria "
                    "alveolata honeycomb worm-reef hummocks, wear ANSI A5 Kevlar-lined gloves, and vacate "
                    "the bench before long-period infragravity sneaker wave sets."
                )
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": (
                    "How do I traverse Duckpool and Bude Sabellaria alveolata honeycomb worm-reef without crushing the reef?"
                ),
                "customer_id": "1",
                "chat_history": "[]",
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "barnacle_ledge_info" in data
        assert data["barnacle_ledge_info"]["action"] == "barnacle_ledge_lookup"
        assert mock_llm.called
        call_kwargs = mock_llm.call_args.kwargs
        assert "barnacle_ledge_prompt" in call_kwargs
        assert "BARNACLE" in call_kwargs["barnacle_ledge_prompt"].upper()
        assert "SABELLARIID" in call_kwargs["barnacle_ledge_prompt"].upper()
