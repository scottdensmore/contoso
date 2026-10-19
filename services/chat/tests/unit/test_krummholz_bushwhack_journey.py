"""End-to-end API user journey tests for Subalpine Krummholz & Wind-Sculpted Dwarf-Conifer Thicket Bushwhacking."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


class TestKrummholzBushwhackUserJourney:
    """Full 7-step API user journey: catalog -> filter -> detail -> calculate -> checklist -> chat -> stream."""

    def test_full_krummholz_bushwhack_journey(self, client: TestClient) -> None:
        with patch("main.REAL_CHAT_AVAILABLE", False):
            # Step 1: Browse the full catalog of krummholz bushwhack sites
            sites_resp = client.get("/api/krummholz-bushwhack/sites")
            assert sites_resp.status_code == 200
            all_sites = sites_resp.json()
            assert len(all_sites) == 4
            site_ids = {s["id"] for s in all_sites}
            assert site_ids == {
                "presidential-krummholz-whitemtns-usa",
                "karwendel-latschenkiefer-tyrol-austria",
                "garibaldi-slide-alder-subalpine-canada",
                "tateyama-hai-matsu-alps-japan",
            }

            # Step 2: Filter catalog by ecotype and difficulty
            filtered_resp = client.get(
                "/api/krummholz-bushwhack/sites?ecotype=balsam-fir-spruce-mat&difficulty=extreme"
            )
            assert filtered_resp.status_code == 200
            filtered_sites = filtered_resp.json()
            assert len(filtered_sites) == 1
            target_site_id = filtered_sites[0]["id"]
            assert target_site_id == "presidential-krummholz-whitemtns-usa"

            # Step 3: Inspect detailed site metadata for the selected krummholz zone
            detail_resp = client.get(f"/api/krummholz-bushwhack/sites/{target_site_id}")
            assert detail_resp.status_code == 200
            site_detail = detail_resp.json()
            assert site_detail["name"] == "Presidential Range Abies balsamea Krummholz Wave Zone"
            assert site_detail["country"] == "United States"
            assert site_detail["default_stems_per_sq_meter"] > 0
            assert "navigation_protocol" in site_detail

            # Step 4: Run the Krummholz Bushwhacking Calculator with site parameters
            calc_resp = client.post(
                "/api/krummholz-bushwhack/calculate",
                json={
                    "stems_per_sq_meter": site_detail["default_stems_per_sq_meter"],
                    "canopy_mat_height_m": site_detail["default_canopy_mat_height_m"],
                    "snow_moat_depth_cm": site_detail["default_snow_moat_depth_cm"],
                    "slope_angle_deg": site_detail["default_slope_angle_deg"],
                    "pack_width_cm": site_detail["default_pack_width_cm"],
                },
            )
            assert calc_resp.status_code == 200
            calc_data = calc_resp.json()
            assert calc_data["risk_level"] in ("low", "moderate", "high", "critical")
            assert calc_data["safety_status"] == calc_data["risk_level"]
            assert calc_data["transit_strategy"] in (
                "frost-ridge-rock-hopping-leads",
                "streamlined-pack-creek-bed-bypass",
                "probe-tested-canopy-crawling",
                "abort-impenetrable-spruce-trap-labyrinth",
            )
            assert calc_data["effective_velocity_km_h"] > 0
            assert calc_data["tree_well_spruce_trap_risk_pct"] >= 0
            assert calc_data["metabolic_kcal_per_hour"] > 0
            assert calc_data["branch_snag_resistance_index"] >= 0
            assert len(calc_data["recommendations"]) >= 1

            # Step 5: Retrieve the 6-item mandatory krummholz bushwhack gear checklist
            checklist_resp = client.get("/api/krummholz-bushwhack/checklist")
            assert checklist_resp.status_code == 200
            checklist = checklist_resp.json()
            assert len(checklist) == 6
            categories = {item["category"] for item in checklist}
            assert len(categories) >= 4

            # Step 6: Query the synchronous chat endpoint (/api/create_response) with a krummholz bushwhack prompt
            chat_resp = client.post(
                "/api/create_response",
                json={
                    "question": (
                        "What is the effective bushwhacking velocity and spruce trap risk for Karwendel "
                        "Latschenkiefer with 18 stems/m2 and 50 cm snow moat depth?"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert chat_resp.status_code == 200
            chat_data = chat_resp.json()
            assert "answer" in chat_data
            assert "krummholz_bushwhack_info" in chat_data
            assert chat_data["krummholz_bushwhack_info"]["action"] in (
                "krummholz_bushwhack_calculated",
                "krummholz_bushwhack_lookup",
                "krummholz_bushwhack_info",
            )

            # Step 7: Query the SSE streaming endpoint (/api/create_response/stream) with a krummholz bushwhack prompt
            stream_resp = client.post(
                "/api/create_response/stream",
                json={
                    "question": (
                        "Calculate krummholz bushwhack resistance and spruce trap risk for Presidential Range "
                        "with 28 stems/m2 and 120 cm snow moat"
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
                "krummholz_bushwhack_info" in ev
                or ev.get("event", "").startswith("krummholz_bushwhack")
                for ev in parsed_events
            )


@pytest.mark.anyio
async def test_krummholz_bushwhack_journey_real_mode_execution(client: TestClient) -> None:
    """Verifies krummholz bushwhack prompt injection and payload parity in real LLM mode."""
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
                return_value="In the Presidential Range krummholz wave zone, probe ahead for concealed spruce traps and keep pack profiles streamlined."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "How do I evaluate spruce trap risk while bushwhacking Presidential Range krummholz with 26 stems/m2?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "krummholz_bushwhack_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "krummholz_bushwhack_prompt" in call_kwargs
        prompt_content = call_kwargs["krummholz_bushwhack_prompt"].lower()
        assert "krummholz" in prompt_content or "spruce trap" in prompt_content
