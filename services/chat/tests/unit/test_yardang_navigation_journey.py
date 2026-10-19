"""End-to-end API user journey tests for Aeolian Yardang & Mega-Dune Slip-Face Star-Dune Desert Navigation."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


class TestYardangNavigationUserJourney:
    """Full 7-step API user journey: catalog -> filter -> detail -> calculate -> checklist -> chat -> stream."""

    def test_full_yardang_navigation_journey(self, client: TestClient) -> None:
        with patch("main.REAL_CHAT_AVAILABLE", False):
            # Step 1: Browse the full catalog of aeolian yardang & mega-dune desert sites
            sites_resp = client.get("/api/yardang-navigation/sites")
            assert sites_resp.status_code == 200
            all_sites = sites_resp.json()
            assert len(all_sites) == 4
            site_ids = {s["id"] for s in all_sites}
            assert site_ids == {
                "dasht-e-lut-kaluts-iran",
                "badain-jaran-star-dunes-china",
                "lop-nur-yardang-xinjiang-china",
                "borkou-ennedi-yardangs-chad",
            }

            # Step 2: Filter catalog by morphology and difficulty
            filtered_resp = client.get(
                "/api/yardang-navigation/sites?morphology=kalut-mega-yardang-corridor&difficulty=extreme"
            )
            assert filtered_resp.status_code == 200
            filtered_sites = filtered_resp.json()
            assert len(filtered_sites) == 1
            target_site_id = filtered_sites[0]["id"]
            assert target_site_id == "dasht-e-lut-kaluts-iran"

            # Step 3: Inspect detailed site metadata for the selected yardang site
            detail_resp = client.get(f"/api/yardang-navigation/sites/{target_site_id}")
            assert detail_resp.status_code == 200
            site_detail = detail_resp.json()
            assert (
                site_detail["name"]
                == "Dasht-e Lut Gandom Beryan & Shahr-e Lut Mega-Yardang Kalut Corridors"
            )
            assert site_detail["country"] == "Iran"
            assert site_detail["default_slip_face_angle_deg"] >= 10.0
            assert "routing_strategy" in site_detail

            # Step 4: Run the Yardang Navigation Calculator with site parameters
            calc_resp = client.post(
                "/api/yardang-navigation/calculate",
                json={
                    "slip_face_angle_deg": site_detail["default_slip_face_angle_deg"],
                    "wind_speed_kmh": site_detail["default_wind_speed_kmh"],
                    "corridor_width_m": site_detail["default_corridor_width_m"],
                    "sand_surface_temp_c": site_detail["default_sand_surface_temp_c"],
                    "visibility_m": site_detail["default_visibility_m"],
                },
            )
            assert calc_resp.status_code == 200
            calc_data = calc_resp.json()
            assert calc_data["risk_level"] in ("low", "moderate", "high", "critical")
            assert calc_data["safety_status"] == calc_data["risk_level"]
            assert "routing_strategy" in calc_data
            assert calc_data["avalanche_slip_safety_factor"] > 0
            assert calc_data["venturi_wind_acceleration_ratio"] >= 1.0
            assert calc_data["triboelectric_gnss_noise_index"] > 0
            assert calc_data["stride_sinkage_energy_multiplier"] >= 1.0
            assert len(calc_data["recommendations"]) >= 1

            # Step 5: Retrieve the 6-item mandatory yardang navigation gear checklist
            checklist_resp = client.get("/api/yardang-navigation/checklist")
            assert checklist_resp.status_code == 200
            checklist = checklist_resp.json()
            assert len(checklist) == 6
            categories = {item["category"] for item in checklist}
            assert len(categories) >= 4

            # Step 6: Query the synchronous chat endpoint (/api/create_response) with a yardang navigation prompt
            chat_resp = client.post(
                "/api/create_response",
                json={
                    "question": (
                        "What is the avalanche slip safety factor and venturi wind acceleration ratio for "
                        "Badain Jaran Bilutu Peak star-dune slip-face with 34 deg slip-face angle and 55 km/h wind?"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert chat_resp.status_code == 200
            chat_data = chat_resp.json()
            assert "answer" in chat_data
            assert "yardang_navigation_info" in chat_data
            assert chat_data["yardang_navigation_info"]["action"] in (
                "yardang_navigation_calculated",
                "yardang_navigation_lookup",
                "yardang_navigation_info",
            )

            # Step 7: Query the SSE streaming endpoint (/api/create_response/stream) with a yardang navigation prompt
            stream_resp = client.post(
                "/api/create_response/stream",
                json={
                    "question": (
                        "Calculate yardang navigation avalanche slip safety factor and triboelectric GNSS noise for "
                        "Dasht-e Lut kalut mega-yardang corridors with 35 deg slip-face angle and 78 km/h wind"
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
                "yardang_navigation_info" in ev
                or ev.get("event", "").startswith("yardang_navigation")
                for ev in parsed_events
            )


@pytest.mark.anyio
async def test_yardang_navigation_journey_real_mode_execution(
    client: TestClient,
) -> None:
    """Verifies yardang navigation prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Kaveh",
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
                    "Navigate windward inter-kalut gassi floors in Dasht-e Lut before midday thermal maxima "
                    "and avoid 34°+ leeward star-dune avalanche slip-faces."
                )
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": (
                    "How do I navigate mega-yardang kalut corridors and slip-faces in Dasht-e Lut, Iran?"
                )
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "yardang_navigation_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "yardang_navigation_prompt" in call_kwargs
        prompt_content = call_kwargs["yardang_navigation_prompt"].lower()
        assert "yardang" in prompt_content or "dasht-e lut" in prompt_content
