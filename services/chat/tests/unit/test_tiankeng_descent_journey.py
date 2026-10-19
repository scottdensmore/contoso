"""End-to-end API user journey tests for Karst Tiankeng (Giant Collapse Sinkhole) & Vertical Cloud-Forest Rim Descent."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


class TestTiankengDescentUserJourney:
    """Full 7-step API user journey: catalog -> filter -> detail -> calculate -> checklist -> chat -> stream."""

    def test_full_tiankeng_descent_journey(self, client: TestClient) -> None:
        with patch("main.REAL_CHAT_AVAILABLE", False):
            # Step 1: Browse the full catalog of karst tiankeng descent sites
            sites_resp = client.get("/api/tiankeng-descent/sites")
            assert sites_resp.status_code == 200
            all_sites = sites_resp.json()
            assert len(all_sites) == 4
            site_ids = {s["id"] for s in all_sites}
            assert site_ids == {
                "xiaozhai-tiankeng-chongqing-china",
                "dashiwei-tiankeng-leye-china",
                "sotano-de-las-golondrinas-mexico",
                "sima-humboldt-sarisarinama-venezuela",
            }

            # Step 2: Filter catalog by morphology and difficulty
            filtered_resp = client.get(
                "/api/tiankeng-descent/sites?morphology=collapse-mega-doline&difficulty=extreme"
            )
            assert filtered_resp.status_code == 200
            filtered_sites = filtered_resp.json()
            assert len(filtered_sites) == 1
            target_site_id = filtered_sites[0]["id"]
            assert target_site_id == "xiaozhai-tiankeng-chongqing-china"

            # Step 3: Inspect detailed site metadata for the selected tiankeng descent site
            detail_resp = client.get(f"/api/tiankeng-descent/sites/{target_site_id}")
            assert detail_resp.status_code == 200
            site_detail = detail_resp.json()
            assert site_detail["name"] == "Xiaozhai Tiankeng Double-Nested Collapse Mega-Doline"
            assert site_detail["country"] == "China"
            assert site_detail["default_vertical_drop_m"] > 0
            assert "navigation_protocol" in site_detail

            # Step 4: Run the Tiankeng Descent Calculator with site parameters
            calc_resp = client.post(
                "/api/tiankeng-descent/calculate",
                json={
                    "vertical_drop_m": site_detail["default_vertical_drop_m"],
                    "rebelay_count": site_detail["default_rebelay_count"],
                    "fog_humidity_pct": site_detail["default_fog_humidity_pct"],
                    "overhang_angle_deg": site_detail["default_overhang_angle_deg"],
                    "waterfall_spray_litres_min": site_detail["default_waterfall_spray_litres_min"],
                },
            )
            assert calc_resp.status_code == 200
            calc_data = calc_resp.json()
            assert calc_data["risk_level"] in ("low", "moderate", "high", "critical")
            assert calc_data["safety_status"] == calc_data["risk_level"]
            assert calc_data["rigging_strategy"] in (
                "continuous-free-hang-6-bar-rack",
                "segmented-rebelay-lip-deviation",
                "offset-pendulum-spray-avoidance-rig",
                "abort-monsoon-waterfall-plume-lockout",
            )
            assert calc_data["wet_rope_friction_multiplier"] > 0
            assert calc_data["descender_thermal_c"] > 0
            assert calc_data["limestone_spall_trajectory_risk_pct"] >= 0
            assert calc_data["free_hang_bounce_amplitude_m"] >= 0
            assert len(calc_data["recommendations"]) >= 1

            # Step 5: Retrieve the 6-item mandatory tiankeng descent gear checklist
            checklist_resp = client.get("/api/tiankeng-descent/checklist")
            assert checklist_resp.status_code == 200
            checklist = checklist_resp.json()
            assert len(checklist) == 6
            categories = {item["category"] for item in checklist}
            assert len(categories) >= 4

            # Step 6: Query the synchronous chat endpoint (/api/create_response) with a tiankeng descent prompt
            chat_resp = client.post(
                "/api/create_response",
                json={
                    "question": (
                        "What is the descender thermal load and free-hang bounce amplitude for "
                        "Dashiwei Tiankeng collapse sinkhole with 420 m drop and 6 rebelays?"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert chat_resp.status_code == 200
            chat_data = chat_resp.json()
            assert "answer" in chat_data
            assert "tiankeng_descent_info" in chat_data
            assert chat_data["tiankeng_descent_info"]["action"] in (
                "tiankeng_descent_calculated",
                "tiankeng_descent_lookup",
                "tiankeng_descent_info",
            )

            # Step 7: Query the SSE streaming endpoint (/api/create_response/stream) with a tiankeng descent prompt
            stream_resp = client.post(
                "/api/create_response/stream",
                json={
                    "question": (
                        "Calculate tiankeng descent thermal load and spall trajectory risk for "
                        "Xiaozhai Tiankeng with 511 m vertical drop and 6 rebelays"
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
                "tiankeng_descent_info" in ev or ev.get("event", "").startswith("tiankeng_descent")
                for ev in parsed_events
            )


@pytest.mark.anyio
async def test_tiankeng_descent_journey_real_mode_execution(client: TestClient) -> None:
    """Verifies tiankeng descent prompt injection and payload parity in real LLM mode."""
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
                return_value="Rig segmented Y-hang rebelays below the cloud-forest rim overhang of Xiaozhai Tiankeng and use a 6-bar stainless steel rappel rack to dissipate thermal friction."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "How do I evaluate limestone spall risk while descending Xiaozhai Tiankeng giant sinkhole with 511 m drop?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "tiankeng_descent_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "tiankeng_descent_prompt" in call_kwargs
        prompt_content = call_kwargs["tiankeng_descent_prompt"].lower()
        assert "tiankeng" in prompt_content or "rebelay" in prompt_content
