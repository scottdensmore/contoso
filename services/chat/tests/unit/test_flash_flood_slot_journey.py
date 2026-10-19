"""End-to-end API user journey tests for High-Desert Slot-Canyon Ephemeral Flash-Flood Hydrograph & Escape-Ledge Navigation."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


class TestFlashFloodSlotUserJourney:
    """Full 7-step API user journey: catalog -> filter -> detail -> calculate -> checklist -> chat -> stream."""

    def test_full_flash_flood_slot_journey(self, client: TestClient) -> None:
        with patch("main.REAL_CHAT_AVAILABLE", False):
            # Step 1: Browse the full catalog of slot-canyon flash-flood sites
            sites_resp = client.get("/api/flash-flood-slot/sites")
            assert sites_resp.status_code == 200
            all_sites = sites_resp.json()
            assert len(all_sites) == 4
            site_ids = {s["id"] for s in all_sites}
            assert site_ids == {
                "buckskin-gulch-paria-usa",
                "little-wild-horse-bell-usa",
                "wadi-mujib-siq-jordan",
                "garganta-del-cares-wadi-oman",
            }

            # Step 2: Filter catalog by lithology and difficulty
            filtered_resp = client.get(
                "/api/flash-flood-slot/sites?lithology=navajo-sandstone-narrows&difficulty=extreme"
            )
            assert filtered_resp.status_code == 200
            filtered_sites = filtered_resp.json()
            assert len(filtered_sites) == 1
            target_site_id = filtered_sites[0]["id"]
            assert target_site_id == "buckskin-gulch-paria-usa"

            # Step 3: Inspect detailed site metadata for the selected slot canyon
            detail_resp = client.get(f"/api/flash-flood-slot/sites/{target_site_id}")
            assert detail_resp.status_code == 200
            site_detail = detail_resp.json()
            assert site_detail["name"] == "Buckskin Gulch & Wire Pass Navajo Sandstone Constriction"
            assert site_detail["country"] == "United States"
            assert site_detail["default_catchment_area_km2"] > 0
            assert "navigation_protocol" in site_detail

            # Step 4: Run the Flash-Flood Hydrograph & Escape-Ledge Calculator with site parameters
            calc_resp = client.post(
                "/api/flash-flood-slot/calculate",
                json={
                    "catchment_area_km2": site_detail["default_catchment_area_km2"],
                    "upstream_rain_mm_hr": site_detail["default_upstream_rain_mm_hr"],
                    "slot_width_m": site_detail["default_slot_width_m"],
                    "escape_ledge_height_m": site_detail["default_escape_ledge_height_m"],
                    "distance_to_exit_km": site_detail["default_distance_to_exit_km"],
                },
            )
            assert calc_resp.status_code == 200
            calc_data = calc_resp.json()
            assert calc_data["risk_level"] in ("low", "moderate", "high", "critical")
            assert calc_data["safety_status"] == calc_data["risk_level"]
            assert calc_data["escape_class"] in (
                "dry-wash-standard-transit",
                "monitor-high-bench-ledges",
                "immediate-climb-escape-ledge",
                "abort-imminent-flood-bore-entrapment",
            )
            assert calc_data["flood_wave_lag_minutes"] > 0
            assert calc_data["wall_of_water_rise_rate_m_per_min"] >= 0
            assert calc_data["peak_discharge_m3_s"] >= 0
            assert isinstance(calc_data["escape_margin_minutes"], (int, float))
            assert len(calc_data["recommendations"]) >= 1

            # Step 5: Retrieve the 6-item mandatory flash-flood slot gear checklist
            checklist_resp = client.get("/api/flash-flood-slot/checklist")
            assert checklist_resp.status_code == 200
            checklist = checklist_resp.json()
            assert len(checklist) == 6
            categories = {item["category"] for item in checklist}
            assert len(categories) >= 4

            # Step 6: Query the synchronous chat endpoint (/api/create_response) with a flash-flood slot prompt
            chat_resp = client.post(
                "/api/create_response",
                json={
                    "question": (
                        "What is the flash-flood hydrograph and escape ledge margin for Little Wild Horse "
                        "with 65 km2 catchment area and 18 mm/hr rain?"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert chat_resp.status_code == 200
            chat_data = chat_resp.json()
            assert "answer" in chat_data
            assert "flash_flood_slot_info" in chat_data
            assert chat_data["flash_flood_slot_info"]["action"] in (
                "flash_flood_slot_calculated",
                "flash_flood_slot_lookup",
                "flash_flood_slot_info",
            )

            # Step 7: Query the SSE streaming endpoint (/api/create_response/stream) with a flash-flood slot prompt
            stream_resp = client.post(
                "/api/create_response/stream",
                json={
                    "question": (
                        "Calculate flash flood bore rise rate and escape ledge margin for Wadi Mujib "
                        "with 250 km2 catchment and 32 mm/hr rain"
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
                "flash_flood_slot_info" in ev
                or ev.get("event", "").startswith("flash_flood_slot")
                for ev in parsed_events
            )


@pytest.mark.anyio
async def test_flash_flood_slot_journey_real_mode_execution(client: TestClient) -> None:
    """Verifies flash-flood slot prompt injection and payload parity in real LLM mode."""
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
                return_value="In Wadi Mujib sandstone siq, monitor upstream rain gauges and identify escape ledges before entering the narrows."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "How do I evaluate the flash-flood hydrograph and escape ledges in Wadi Mujib siq with 25 mm/hr rain?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "flash_flood_slot_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "flash_flood_slot_prompt" in call_kwargs
        prompt_content = call_kwargs["flash_flood_slot_prompt"].lower()
        assert "flash-flood" in prompt_content or "hydrograph" in prompt_content
