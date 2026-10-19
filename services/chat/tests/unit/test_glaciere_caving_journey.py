"""End-to-end API user journey tests for Subterranean Glacière Cave Navigation."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


class TestGlaciereCavingUserJourney:
    """Full 7-step API user journey: catalog -> filter -> detail -> calculate -> checklist -> chat -> stream."""

    def test_full_glaciere_caving_journey(self, client: TestClient) -> None:
        with patch("main.REAL_CHAT_AVAILABLE", False):
            # Step 1: Browse the full catalog of subterranean glacière cave sites
            sites_resp = client.get("/api/glaciere-caving/sites")
            assert sites_resp.status_code == 200
            all_sites = sites_resp.json()
            assert len(all_sites) == 4
            site_ids = {s["id"] for s in all_sites}
            assert site_ids == {
                "eisriesenwelt-tennengebirge-austria",
                "scarisoara-glaciere-apuseni-romania",
                "bandera-ice-cave-el-malpais-usa",
                "lofthellir-lava-glaciere-iceland",
            }

            # Step 2: Filter catalog by morphology and difficulty
            filtered_resp = client.get(
                "/api/glaciere-caving/sites?morphology=permafrost-fissure-glaciere&difficulty=extreme"
            )
            assert filtered_resp.status_code == 200
            filtered_sites = filtered_resp.json()
            assert len(filtered_sites) == 1
            target_site_id = filtered_sites[0]["id"]
            assert target_site_id == "lofthellir-lava-glaciere-iceland"

            # Step 3: Inspect detailed site metadata for the selected glacière cave
            detail_resp = client.get(f"/api/glaciere-caving/sites/{target_site_id}")
            assert detail_resp.status_code == 200
            site_detail = detail_resp.json()
            assert site_detail["name"] == "Lofthellir Permafrost Basaltic Lava Tube Glacière"
            assert site_detail["country"] == "Iceland"
            assert site_detail["default_floor_ice_slope_deg"] > 0
            assert "navigation_protocol" in site_detail

            # Step 4: Run the Glacière Cave Safety & Traction Calculator with site parameters
            calc_resp = client.post(
                "/api/glaciere-caving/calculate",
                json={
                    "floor_ice_slope_deg": site_detail["default_floor_ice_slope_deg"],
                    "cave_air_temp_c": site_detail["default_cave_air_temp_c"],
                    "meltwater_film_mm": site_detail["default_meltwater_film_mm"],
                    "co2_ppm": site_detail["co2_ppm"],
                    "hoarfrost_ceiling_thickness_cm": site_detail["hoarfrost_ceiling_thickness_cm"],
                },
            )
            assert calc_resp.status_code == 200
            calc_data = calc_resp.json()
            assert calc_data["risk_level"] in ("low", "moderate", "high", "critical")
            assert calc_data["safety_status"] == calc_data["risk_level"]
            assert calc_data["traction_class"] in (
                "microspikes-10pt",
                "steel-12pt-crampons-ice-axe",
                "front-point-dual-tools-ice-screws",
                "abort-glaze-co2-collapse-hazard",
            )
            assert calc_data["ice_friction_coefficient"] > 0
            assert calc_data["crampon_shear_safety_factor"] > 0
            assert len(calc_data["recommendations"]) >= 1

            # Step 5: Retrieve the 6-item mandatory glacière gear checklist
            checklist_resp = client.get("/api/glaciere-caving/checklist")
            assert checklist_resp.status_code == 200
            checklist = checklist_resp.json()
            assert len(checklist) == 6
            categories = {item["category"] for item in checklist}
            assert len(categories) >= 4

            # Step 6: Query the synchronous chat endpoint (/api/create_response) with a glacière prompt
            chat_resp = client.post(
                "/api/create_response",
                json={
                    "question": (
                        "How do I navigate Lofthellir lava glaciere cave in Iceland with a 32 deg "
                        "floor ice slope and hoarfrost ceiling?"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert chat_resp.status_code == 200
            chat_data = chat_resp.json()
            assert "answer" in chat_data
            assert "glaciere_caving_info" in chat_data
            assert chat_data["glaciere_caving_info"]["action"] in (
                "glaciere_caving_calculated",
                "glaciere_caving_lookup",
                "glaciere_caving_info",
            )

            # Step 7: Query the SSE streaming endpoint (/api/create_response/stream) with a glacière prompt
            stream_resp = client.post(
                "/api/create_response/stream",
                json={
                    "question": (
                        "Calculate glacière cave traction and CO2 hazard for Eisriesenwelt "
                        "with 26 deg floor ice slope and 1400 ppm CO2"
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
                "glaciere_caving_info" in ev
                or ev.get("event", "").startswith("glaciere_caving")
                for ev in parsed_events
            )


@pytest.mark.anyio
async def test_glaciere_caving_journey_real_mode_execution(client: TestClient) -> None:
    """Verifies glacière caving prompt injection and payload parity in real LLM mode."""
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
                return_value="In Lofthellir lava glacière, 12-point steel crampons and CO2 monitoring are essential."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "How do I navigate Lofthellir lava glaciere cave in Iceland with a 28 deg floor ice slope?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "glaciere_caving_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "glaciere_caving_prompt" in call_kwargs
        prompt_content = call_kwargs["glaciere_caving_prompt"].lower()
        assert "glacière" in prompt_content or "glaciere" in prompt_content
