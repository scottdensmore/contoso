"""End-to-end API user journey tests for Subantarctic Tussock-Grass Peat Bog & Katabatic Headland Navigation."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


class TestTussockHeadlandUserJourney:
    """Full 7-step API user journey: catalog -> filter -> detail -> calculate -> checklist -> chat -> stream."""

    def test_full_tussock_headland_journey(self, client: TestClient) -> None:
        with patch("main.REAL_CHAT_AVAILABLE", False):
            # Step 1: Browse the full catalog of subantarctic tussock headland sites
            sites_resp = client.get("/api/tussock-headland/sites")
            assert sites_resp.status_code == 200
            all_sites = sites_resp.json()
            assert len(all_sites) == 4
            site_ids = {s["id"] for s in all_sites}
            assert site_ids == {
                "fortuna-bay-stromness-south-georgia",
                "macquarie-island-featherbed-australia",
                "enderby-island-megaherb-auckland-nz",
                "kerguelen-courbet-azorella-france",
            }

            # Step 2: Filter catalog by morphology and difficulty
            filtered_resp = client.get(
                "/api/tussock-headland/sites?morphology=poa-flabellata-pedestal-maze&difficulty=extreme"
            )
            assert filtered_resp.status_code == 200
            filtered_sites = filtered_resp.json()
            assert len(filtered_sites) == 1
            target_site_id = filtered_sites[0]["id"]
            assert target_site_id == "fortuna-bay-stromness-south-georgia"

            # Step 3: Inspect detailed site metadata for the selected tussock headland site
            detail_resp = client.get(f"/api/tussock-headland/sites/{target_site_id}")
            assert detail_resp.status_code == 200
            site_detail = detail_resp.json()
            assert (
                site_detail["name"]
                == "Fortuna Bay & Shackleton Gap Poa flabellata Tussock Headland"
            )
            assert site_detail["country"] == "United Kingdom"
            assert site_detail["default_pedestal_height_m"] > 0
            assert "navigation_protocol" in site_detail

            # Step 4: Run the Tussock Headland Calculator with site parameters
            calc_resp = client.post(
                "/api/tussock-headland/calculate",
                json={
                    "pedestal_height_m": site_detail["default_pedestal_height_m"],
                    "katabatic_wind_kmh": site_detail["default_katabatic_wind_kmh"],
                    "wallow_trench_depth_cm": site_detail["default_wallow_trench_depth_cm"],
                    "ambient_temp_c": site_detail["default_ambient_temp_c"],
                    "seal_density_per_ha": site_detail["default_seal_density_per_ha"],
                },
            )
            assert calc_resp.status_code == 200
            calc_data = calc_resp.json()
            assert calc_data["risk_level"] in ("low", "moderate", "high", "critical")
            assert calc_data["safety_status"] == calc_data["risk_level"]
            assert calc_data["routing_strategy"] in (
                "open-feldmark-compass-ridge-transit",
                "inter-pedestal-sounding-pole-channel-weave",
                "leeward-terrace-contour-fauna-detour",
                "abort-williwaw-bivy-and-wallow-lockout",
            )
            assert calc_data["katabatic_knockdown_index"] > 0
            assert calc_data["inter_pedestal_pit_entrapment_pct"] >= 0
            assert isinstance(calc_data["wind_chill_effective_c"], float)
            assert calc_data["fauna_encounter_detour_multiplier"] >= 1.0
            assert len(calc_data["recommendations"]) >= 1

            # Step 5: Retrieve the 6-item mandatory tussock headland gear checklist
            checklist_resp = client.get("/api/tussock-headland/checklist")
            assert checklist_resp.status_code == 200
            checklist = checklist_resp.json()
            assert len(checklist) == 6
            categories = {item["category"] for item in checklist}
            assert len(categories) >= 4

            # Step 6: Query the synchronous chat endpoint (/api/create_response) with a tussock headland prompt
            chat_resp = client.post(
                "/api/create_response",
                json={
                    "question": (
                        "What is the katabatic knockdown index and pit entrapment risk for "
                        "Macquarie Island Featherbed peat terrace with 1.8 m pedestals and 85 km/h katabatic wind?"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert chat_resp.status_code == 200
            chat_data = chat_resp.json()
            assert "answer" in chat_data
            assert "tussock_headland_info" in chat_data
            assert chat_data["tussock_headland_info"]["action"] in (
                "tussock_headland_calculated",
                "tussock_headland_lookup",
                "tussock_headland_info",
            )

            # Step 7: Query the SSE streaming endpoint (/api/create_response/stream) with a tussock headland prompt
            stream_resp = client.post(
                "/api/create_response/stream",
                json={
                    "question": (
                        "Calculate tussock headland katabatic knockdown and seal wallow detour multiplier for "
                        "Fortuna Bay South Georgia with 2.1 m pedestals and 95 km/h katabatic wind"
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
                "tussock_headland_info" in ev or ev.get("event", "").startswith("tussock_headland")
                for ev in parsed_events
            )


@pytest.mark.anyio
async def test_tussock_headland_journey_real_mode_execution(
    client: TestClient,
) -> None:
    """Verifies tussock headland prompt injection and payload parity in real LLM mode."""
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
                return_value=(
                    "Probe inter-pedestal mud channels with 100 mm basket poles across Fortuna Bay's "
                    "Poa flabellata labyrinth and maintain a 25 m detour around Antarctic fur seal bulls."
                )
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": (
                    "How do I navigate Poa flabellata tussock pedestals and katabatic williwaw gusts at Fortuna Bay South Georgia?"
                )
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "tussock_headland_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "tussock_headland_prompt" in call_kwargs
        prompt_content = call_kwargs["tussock_headland_prompt"].lower()
        assert "tussock" in prompt_content or "katabatic" in prompt_content
