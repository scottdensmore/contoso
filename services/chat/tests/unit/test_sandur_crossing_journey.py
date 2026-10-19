"""End-to-end API user journey tests for Glacial Outwash Braided-River Sandur & Quicksand Silt-Bar Crossing."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


class TestSandurCrossingUserJourney:
    """Full 7-step API user journey: catalog -> filter -> detail -> calculate -> checklist -> chat -> stream."""

    def test_full_sandur_crossing_journey(self, client: TestClient) -> None:
        with patch("main.REAL_CHAT_AVAILABLE", False):
            # Step 1: Browse the full catalog of sandur crossing sites
            sites_resp = client.get("/api/sandur-crossing/sites")
            assert sites_resp.status_code == 200
            all_sites = sites_resp.json()
            assert len(all_sites) == 4
            site_ids = {s["id"] for s in all_sites}
            assert site_ids == {
                "skeidararsandur-krossa-iceland",
                "slim-river-kaskawulsh-canada",
                "rakaia-gorge-braids-nz",
                "copper-river-sheridan-alaska-usa",
            }

            # Step 2: Filter catalog by morphology and difficulty
            filtered_resp = client.get(
                "/api/sandur-crossing/sites?morphology=jokulhlaup-basalt-sandur&difficulty=extreme"
            )
            assert filtered_resp.status_code == 200
            filtered_sites = filtered_resp.json()
            assert len(filtered_sites) == 1
            target_site_id = filtered_sites[0]["id"]
            assert target_site_id == "skeidararsandur-krossa-iceland"

            # Step 3: Inspect detailed site metadata for the selected sandur crossing zone
            detail_resp = client.get(f"/api/sandur-crossing/sites/{target_site_id}")
            assert detail_resp.status_code == 200
            site_detail = detail_resp.json()
            assert site_detail["name"] == "Skeiðarársandur & Þórsmörk Krossá Braided Outwash Plain"
            assert site_detail["country"] == "Iceland"
            assert site_detail["default_water_depth_m"] > 0
            assert "navigation_protocol" in site_detail

            # Step 4: Run the Sandur Crossing Calculator with site parameters
            calc_resp = client.post(
                "/api/sandur-crossing/calculate",
                json={
                    "water_depth_m": site_detail["default_water_depth_m"],
                    "flow_velocity_ms": site_detail["default_flow_velocity_ms"],
                    "hour_of_day_24": site_detail["default_hour_of_day_24"],
                    "silt_flour_concentration_mg_l": site_detail["default_silt_flour_concentration_mg_l"],
                    "hiker_mass_kg": site_detail["default_hiker_mass_kg"],
                },
            )
            assert calc_resp.status_code == 200
            calc_data = calc_resp.json()
            assert calc_data["risk_level"] in ("low", "moderate", "high", "critical")
            assert calc_data["safety_status"] == calc_data["risk_level"]
            assert calc_data["crossing_technique"] in (
                "solo-diagonal-pole-riffle-stride",
                "tripod-pole-eddy-line-ferry",
                "mutual-support-linked-wedge-formation",
                "abort-bivouac-until-dawn-minimum",
            )
            assert calc_data["hydrodynamic_momentum_product"] > 0
            assert calc_data["quicksand_liquefaction_index"] >= 0
            assert calc_data["diurnal_discharge_multiplier"] > 0
            assert calc_data["bedload_boulder_roll_risk_pct"] >= 0
            assert len(calc_data["recommendations"]) >= 1

            # Step 5: Retrieve the 6-item mandatory sandur crossing gear checklist
            checklist_resp = client.get("/api/sandur-crossing/checklist")
            assert checklist_resp.status_code == 200
            checklist = checklist_resp.json()
            assert len(checklist) == 6
            categories = {item["category"] for item in checklist}
            assert len(categories) >= 4

            # Step 6: Query the synchronous chat endpoint (/api/create_response) with a sandur crossing prompt
            chat_resp = client.post(
                "/api/create_response",
                json={
                    "question": (
                        "What is the hydrodynamic momentum product and quicksand silt-bar risk for "
                        "Kaskawulsh Slims River braided outwash with 0.6 m depth and 1.7 m/s velocity?"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert chat_resp.status_code == 200
            chat_data = chat_resp.json()
            assert "answer" in chat_data
            assert "sandur_crossing_info" in chat_data
            assert chat_data["sandur_crossing_info"]["action"] in (
                "sandur_crossing_calculated",
                "sandur_crossing_lookup",
                "sandur_crossing_info",
            )

            # Step 7: Query the SSE streaming endpoint (/api/create_response/stream) with a sandur crossing prompt
            stream_resp = client.post(
                "/api/create_response/stream",
                json={
                    "question": (
                        "Calculate sandur crossing hydrodynamic momentum and quicksand liquefaction risk for "
                        "Skeiðarársandur with 0.8 m water depth and 2.1 m/s velocity"
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
                "sandur_crossing_info" in ev
                or ev.get("event", "").startswith("sandur_crossing")
                for ev in parsed_events
            )


@pytest.mark.anyio
async def test_sandur_crossing_journey_real_mode_execution(client: TestClient) -> None:
    """Verifies sandur crossing prompt injection and payload parity in real LLM mode."""
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
                return_value="Cross Skeiðarársandur and Krossá braided channels at dawn before peak glacial ablation, sounding silt bars for thixotropic quicksand."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "How do I evaluate quicksand silt-bar risk while crossing Skeiðarársandur braided river with 0.7 m depth?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "sandur_crossing_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "sandur_crossing_prompt" in call_kwargs
        prompt_content = call_kwargs["sandur_crossing_prompt"].lower()
        assert "sandur" in prompt_content or "quicksand" in prompt_content
