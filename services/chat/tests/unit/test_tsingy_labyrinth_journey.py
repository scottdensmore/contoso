"""End-to-end API user journey tests for Tropical Tsingy (Pinnacle Karst Labyrinth) & Razor-Limestone Arête Scrambling."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


class TestTsingyLabyrinthUserJourney:
    """Full 7-step API user journey: catalog -> filter -> detail -> calculate -> checklist -> chat -> stream."""

    def test_full_tsingy_labyrinth_journey(self, client: TestClient) -> None:
        with patch("main.REAL_CHAT_AVAILABLE", False):
            # Step 1: Browse the full catalog of tropical tsingy pinnacle karst sites
            sites_resp = client.get("/api/tsingy-labyrinth/sites")
            assert sites_resp.status_code == 200
            all_sites = sites_resp.json()
            assert len(all_sites) == 4
            site_ids = {s["id"] for s in all_sites}
            assert site_ids == {
                "bemaraha-grand-tsingy-madagascar",
                "ankarana-tsingy-canyon-madagascar",
                "mulu-api-pinnacles-borneo-malaysia",
                "shilin-naigu-stone-forest-china",
            }

            # Step 2: Filter catalog by morphology and difficulty
            filtered_resp = client.get(
                "/api/tsingy-labyrinth/sites?morphology=rillenkarren-razor-spires&difficulty=extreme"
            )
            assert filtered_resp.status_code == 200
            filtered_sites = filtered_resp.json()
            assert len(filtered_sites) == 1
            target_site_id = filtered_sites[0]["id"]
            assert target_site_id == "bemaraha-grand-tsingy-madagascar"

            # Step 3: Inspect detailed site metadata for the selected tsingy labyrinth site
            detail_resp = client.get(f"/api/tsingy-labyrinth/sites/{target_site_id}")
            assert detail_resp.status_code == 200
            site_detail = detail_resp.json()
            assert (
                site_detail["name"]
                == "Tsingy de Bemaraha Grand Tsingy & Andamozavaky Razor Labyrinth"
            )
            assert site_detail["country"] == "Madagascar"
            assert site_detail["default_blade_edge_radius_mm"] > 0
            assert "scrambling_protocol" in site_detail

            # Step 4: Run the Tsingy Labyrinth Calculator with site parameters
            calc_resp = client.post(
                "/api/tsingy-labyrinth/calculate",
                json={
                    "blade_edge_radius_mm": site_detail["default_blade_edge_radius_mm"],
                    "spire_height_m": site_detail["default_spire_height_m"],
                    "rock_surface_temp_c": site_detail["default_rock_surface_temp_c"],
                    "diaclase_gap_width_m": site_detail["default_diaclase_gap_width_m"],
                    "ambient_humidity_pct": site_detail["default_ambient_humidity_pct"],
                },
            )
            assert calc_resp.status_code == 200
            calc_data = calc_resp.json()
            assert calc_data["risk_level"] in ("low", "moderate", "high", "critical")
            assert calc_data["safety_status"] == calc_data["risk_level"]
            assert calc_data["scrambling_class"] in (
                "class-2-corridor-stone-forest-walk",
                "class-3-gloved-diaclase-stemming",
                "class-4-twin-lanyard-arete-via-ferrata",
                "class-5-abort-razor-spire-thermal-lockout",
            )
            assert calc_data["laceration_shear_index"] > 0
            assert calc_data["cord_cut_through_risk_pct"] >= 0
            assert calc_data["radiant_sweat_loss_litres_hr"] > 0
            assert calc_data["arete_exposure_factor"] >= 1.0
            assert len(calc_data["recommendations"]) >= 1

            # Step 5: Retrieve the 6-item mandatory tsingy labyrinth gear checklist
            checklist_resp = client.get("/api/tsingy-labyrinth/checklist")
            assert checklist_resp.status_code == 200
            checklist = checklist_resp.json()
            assert len(checklist) == 6
            categories = {item["category"] for item in checklist}
            assert len(categories) >= 4

            # Step 6: Query the synchronous chat endpoint (/api/create_response) with a tsingy labyrinth prompt
            chat_resp = client.post(
                "/api/create_response",
                json={
                    "question": (
                        "What is the laceration shear index and cord cut-through risk for "
                        "Gunung Api Mulu Pinnacles razor-limestone arête with 0.8 mm blade edge radius and 45 m spire height?"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert chat_resp.status_code == 200
            chat_data = chat_resp.json()
            assert "answer" in chat_data
            assert "tsingy_labyrinth_info" in chat_data
            assert chat_data["tsingy_labyrinth_info"]["action"] in (
                "tsingy_labyrinth_calculated",
                "tsingy_labyrinth_lookup",
                "tsingy_labyrinth_info",
            )

            # Step 7: Query the SSE streaming endpoint (/api/create_response/stream) with a tsingy labyrinth prompt
            stream_resp = client.post(
                "/api/create_response/stream",
                json={
                    "question": (
                        "Calculate tsingy labyrinth laceration shear index and radiant sweat loss for "
                        "Tsingy de Bemaraha Madagascar with 0.6 mm blade edge radius and 65 m spire height"
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
                "tsingy_labyrinth_info" in ev or ev.get("event", "").startswith("tsingy_labyrinth")
                for ev in parsed_events
            )


@pytest.mark.anyio
async def test_tsingy_labyrinth_journey_real_mode_execution(
    client: TestClient,
) -> None:
    """Verifies tsingy labyrinth prompt injection and payload parity in real LLM mode."""
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
                    "Clip both EN 958 progressive-tearing Y-lanyard arms across Tsingy de Bemaraha's "
                    "rillenkarren razor limestone spires and wear Kevlar-palm scrambling gloves."
                )
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": (
                    "How do I scramble rillenkarren razor limestone spires and diaclase chasms at Tsingy de Bemaraha Madagascar?"
                )
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "tsingy_labyrinth_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "tsingy_labyrinth_prompt" in call_kwargs
        prompt_content = call_kwargs["tsingy_labyrinth_prompt"].lower()
        assert "tsingy" in prompt_content or "rillenkarren" in prompt_content
