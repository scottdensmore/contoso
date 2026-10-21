"""End-to-end API user journey tests for Coastal Kelp-Wrack Boulder Reef & Intertidal Cobble Spit Trekking."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


class TestCobbleSpitTrekkingUserJourney:
    """Full 7-step API user journey: catalog -> filter -> detail -> calculate -> checklist -> chat -> stream."""

    def test_full_cobble_spit_trekking_journey(self, client: TestClient) -> None:
        with patch("main.REAL_CHAT_AVAILABLE", False):
            # Step 1: Browse the full catalog of cobble spit & boulder reef sites
            sites_resp = client.get("/api/cobble-spit-trekking/sites")
            assert sites_resp.status_code == 200
            all_sites = sites_resp.json()
            assert len(all_sites) == 4
            site_ids = {s["id"] for s in all_sites}
            assert site_ids == {
                "dungeness-spit-olympic-usa",
                "chesil-beach-fleet-uk",
                "west-coast-trail-boulder-reef-canada",
                "farewell-spit-boulder-bank-nz",
            }

            # Step 2: Filter catalog by morphology and difficulty
            filtered_resp = client.get(
                "/api/cobble-spit-trekking/sites?morphology=intertidal-boulder-reef&difficulty=extreme"
            )
            assert filtered_resp.status_code == 200
            filtered_sites = filtered_resp.json()
            assert len(filtered_sites) == 1
            target_site_id = filtered_sites[0]["id"]
            assert target_site_id == "west-coast-trail-boulder-reef-canada"

            # Step 3: Inspect detailed site metadata for the selected boulder reef
            detail_resp = client.get(f"/api/cobble-spit-trekking/sites/{target_site_id}")
            assert detail_resp.status_code == 200
            site_detail = detail_resp.json()
            assert site_detail["name"] == "Pachena–Carmanah Intertidal Kelp-Wrack Boulder Reef"
            assert site_detail["country"] == "Canada"
            assert site_detail["default_median_cobble_diameter_mm"] > 0
            assert "navigation_protocol" in site_detail

            # Step 4: Run the Cobble Spit & Kelp-Wrack Calculator with site parameters
            calc_resp = client.post(
                "/api/cobble-spit-trekking/calculate",
                json={
                    "median_cobble_diameter_mm": site_detail["default_median_cobble_diameter_mm"],
                    "kelp_wrack_depth_cm": site_detail["default_kelp_wrack_depth_cm"],
                    "berm_slope_deg": site_detail["default_berm_slope_deg"],
                    "swell_height_m": site_detail["default_swell_height_m"],
                    "pack_load_kg": site_detail["default_pack_load_kg"],
                },
            )
            assert calc_resp.status_code == 200
            calc_data = calc_resp.json()
            assert calc_data["risk_level"] in ("low", "moderate", "high", "critical")
            assert calc_data["safety_status"] == calc_data["risk_level"]
            assert calc_data["footwear_class"] in (
                "trail-runner-trekking-poles",
                "high-cuff-scree-boot-dual-poles",
                "tungsten-studded-felt-boot-wading-staff",
                "abort-swash-overwash-entrapment",
            )
            assert calc_data["mucilage_slip_coefficient"] > 0
            assert calc_data["ankle_roll_torque_index"] > 0
            assert calc_data["swash_runup_cutoff_minutes"] >= 0
            assert calc_data["effective_pace_km_h"] > 0
            assert len(calc_data["recommendations"]) >= 1

            # Step 5: Retrieve the 6-item mandatory cobble spit trekking gear checklist
            checklist_resp = client.get("/api/cobble-spit-trekking/checklist")
            assert checklist_resp.status_code == 200
            checklist = checklist_resp.json()
            assert len(checklist) == 6
            categories = {item["category"] for item in checklist}
            assert len(categories) >= 4

            # Step 6: Query the synchronous chat endpoint (/api/create_response) with a cobble spit prompt
            chat_resp = client.post(
                "/api/create_response",
                json={
                    "question": (
                        "How do I trek across Dungeness Spit shingle spit with 85 mm cobble diameter "
                        "and 20 cm kelp-wrack depth?"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert chat_resp.status_code == 200
            chat_data = chat_resp.json()
            assert "answer" in chat_data
            assert "cobble_spit_trekking_info" in chat_data
            assert chat_data["cobble_spit_trekking_info"]["action"] in (
                "cobble_spit_trekking_calculated",
                "cobble_spit_trekking_lookup",
                "cobble_spit_trekking_info",
            )

            # Step 7: Query the SSE streaming endpoint (/api/create_response/stream) with a cobble spit prompt
            stream_resp = client.post(
                "/api/create_response/stream",
                json={
                    "question": (
                        "Calculate cobble spit mucilage slip and ankle roll torque for Chesil Beach "
                        "with 130 mm cobbles and 18 deg berm slope"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert stream_resp.status_code == 200
            raw_lines = [
                line.strip()
                for line in stream_resp.text.splitlines()
                if line.strip().startswith("data: ")
            ]
            assert len(raw_lines) >= 2
            assert raw_lines[-1] == "data: [DONE]"

            parsed_events = []
            for line in raw_lines[:-1]:
                payload_str = line[len("data: ") :]
                parsed_events.append(json.loads(payload_str))

            assert any(
                "cobble_spit_trekking_info" in ev
                or ev.get("event", "").startswith("cobble_spit_trekking")
                for ev in parsed_events
            )


@pytest.mark.anyio
async def test_cobble_spit_trekking_journey_real_mode_execution(client: TestClient) -> None:
    """Verifies cobble spit trekking prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Marin",
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
                return_value="On Chesil Beach storm-berm cobble spit, high-cuff boots and dual trekking poles are essential."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "How do I traverse Chesil Beach storm-berm cobble spit in the UK with a 16 deg berm slope?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "cobble_spit_trekking_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "cobble_spit_trekking_prompt" in call_kwargs
        prompt_content = call_kwargs["cobble_spit_trekking_prompt"].lower()
        assert "cobble spit" in prompt_content or "kelp-wrack" in prompt_content
