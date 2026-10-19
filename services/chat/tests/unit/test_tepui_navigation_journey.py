"""End-to-end API user journey tests for Table-Mountain Quartzite Tepui & High-Plateau Sandstone Fissure Navigation."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


class TestTepuiNavigationUserJourney:
    """Full 7-step API user journey: catalog -> filter -> detail -> calculate -> checklist -> chat -> stream."""

    def test_full_tepui_navigation_journey(self, client: TestClient) -> None:
        with patch("main.REAL_CHAT_AVAILABLE", False):
            # Step 1: Browse the full catalog of table-mountain quartzite tepui sites
            sites_resp = client.get("/api/tepui-navigation/sites")
            assert sites_resp.status_code == 200
            all_sites = sites_resp.json()
            assert len(all_sites) == 4
            site_ids = {s["id"] for s in all_sites}
            assert site_ids == {
                "mount-roraima-maverick-plateau",
                "auyan-tepui-churun-rim-venezuela",
                "kukenan-matawi-tepui-venezuela",
                "chiribiquete-tepui-mesas-colombia",
            }

            # Step 2: Filter catalog by morphology and difficulty
            filtered_resp = client.get(
                "/api/tepui-navigation/sites?morphology=pseudokarst-fissure-grid&difficulty=challenging"
            )
            assert filtered_resp.status_code == 200
            filtered_sites = filtered_resp.json()
            assert len(filtered_sites) == 1
            target_site_id = filtered_sites[0]["id"]
            assert target_site_id == "mount-roraima-maverick-plateau"

            # Step 3: Inspect detailed site metadata for the selected tepui site
            detail_resp = client.get(f"/api/tepui-navigation/sites/{target_site_id}")
            assert detail_resp.status_code == 200
            site_detail = detail_resp.json()
            assert (
                site_detail["name"]
                == "Mount Roraima Maverick Summit & Labyrinth Pseudokarst Plateau"
            )
            assert site_detail["country"] == "Venezuela"
            assert site_detail["default_cyanobacteria_biofilm_pct"] > 0
            assert "progression_protocol" in site_detail

            # Step 4: Run the Tepui Navigation Calculator with site parameters
            calc_resp = client.post(
                "/api/tepui-navigation/calculate",
                json={
                    "cyanobacteria_biofilm_pct": site_detail[
                        "default_cyanobacteria_biofilm_pct"
                    ],
                    "fissure_gap_width_m": site_detail["default_fissure_gap_width_m"],
                    "orographic_rain_mm_hr": site_detail[
                        "default_orographic_rain_mm_hr"
                    ],
                    "cloud_visibility_m": site_detail["default_cloud_visibility_m"],
                    "slab_slope_deg": site_detail["default_slab_slope_deg"],
                },
            )
            assert calc_resp.status_code == 200
            calc_data = calc_resp.json()
            assert calc_data["risk_level"] in ("low", "moderate", "high", "critical")
            assert calc_data["safety_status"] == calc_data["risk_level"]
            assert calc_data["progression_protocol"] in (
                "protocol-1-cairn-corridor-walk",
                "protocol-2-probed-fissure-belay",
                "protocol-3-rope-bridged-chasm-traverse",
                "protocol-4-emergency-overhang-bivouac-lockout",
            )
            assert calc_data["biofilm_traction_coefficient"] > 0
            assert calc_data["fissure_bridge_collapse_risk_pct"] >= 0
            assert calc_data["orographic_blackout_index"] > 0
            assert calc_data["blackwater_stream_surge_multiplier"] >= 1.0
            assert len(calc_data["recommendations"]) >= 1

            # Step 5: Retrieve the 6-item mandatory tepui navigation gear checklist
            checklist_resp = client.get("/api/tepui-navigation/checklist")
            assert checklist_resp.status_code == 200
            checklist = checklist_resp.json()
            assert len(checklist) == 6
            categories = {item["category"] for item in checklist}
            assert len(categories) >= 4

            # Step 6: Query the synchronous chat endpoint (/api/create_response) with a tepui navigation prompt
            chat_resp = client.post(
                "/api/create_response",
                json={
                    "question": (
                        "What is the biofilm traction coefficient and fissure bridge collapse risk for "
                        "Auyán-Tepui Churún orthoquartzite mesa with 82% cyanobacteria biofilm and 2.4 m fissure gap width?"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert chat_resp.status_code == 200
            chat_data = chat_resp.json()
            assert "answer" in chat_data
            assert "tepui_navigation_info" in chat_data
            assert chat_data["tepui_navigation_info"]["action"] in (
                "tepui_navigation_calculated",
                "tepui_navigation_lookup",
                "tepui_navigation_info",
            )

            # Step 7: Query the SSE streaming endpoint (/api/create_response/stream) with a tepui navigation prompt
            stream_resp = client.post(
                "/api/create_response/stream",
                json={
                    "question": (
                        "Calculate tepui navigation biofilm traction coefficient and blackwater stream surge for "
                        "Mount Roraima Maverick plateau with 68% cyanobacteria biofilm and 1.6 m fissure gap width"
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
                "tepui_navigation_info" in ev
                or ev.get("event", "").startswith("tepui_navigation")
                for ev in parsed_events
            )


@pytest.mark.anyio
async def test_tepui_navigation_journey_real_mode_execution(
    client: TestClient,
) -> None:
    """Verifies tepui navigation prompt injection and payload parity in real LLM mode."""
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
                    "Follow stacked quartzite cairn lines across Mount Roraima's pseudokarst fissure grid "
                    "and probe Brocchinia bog bridges before weighting."
                )
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": (
                    "How do I navigate pseudokarst fissures and cyanobacteria biofilm slabs on Mount Roraima plateau in Venezuela?"
                )
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "tepui_navigation_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "tepui_navigation_prompt" in call_kwargs
        prompt_content = call_kwargs["tepui_navigation_prompt"].lower()
        assert "tepui" in prompt_content or "roraima" in prompt_content
