"""End-to-end 7-step API customer journey test for Montane Bamboo-Thicket Bushwhacking."""

import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


class TestBambooThicketCustomerJourney:
    """7-step customer journey verifying discovery, filtering, detail, calculation, chat, and SSE."""

    def test_full_7_step_bamboo_thicket_journey(self) -> None:
        with patch("main.REAL_CHAT_AVAILABLE", False):
            # Step 1: Discover all montane bamboo-thicket sites
            step1 = client.get("/api/v1/bamboo-thicket/sites")
            assert step1.status_code == 200
            sites_data = step1.json()
            assert sites_data["total"] == 4
            site_ids = {s["id"] for s in sites_data["sites"]}
            assert "chirripo-talamanca-chusquea-costa-rica" in site_ids
            assert "hidaka-sasa-kurilensis-hokkaido-japan" in site_ids
            assert "rwenzori-virunga-yushania-uganda" in site_ids
            assert "vilcabamba-colani-chusquea-peru" in site_ids

            # Step 2: Filter sites by country and ecotype
            step2_country = client.get(
                "/api/v1/bamboo-thicket/sites", params={"country": "Costa Rica"}
            )
            assert step2_country.status_code == 200
            assert step2_country.json()["total"] == 1
            assert (
                step2_country.json()["sites"][0]["id"]
                == "chirripo-talamanca-chusquea-costa-rica"
            )

            step2_eco = client.get(
                "/api/v1/bamboo-thicket/sites",
                params={"ecotype": "sasa-kurilensis-dwarf-snow-bamboo"},
            )
            assert step2_eco.status_code == 200
            assert step2_eco.json()["total"] == 1
            assert (
                step2_eco.json()["sites"][0]["id"]
                == "hidaka-sasa-kurilensis-hokkaido-japan"
            )

            # Step 3: Inspect a specific site by ID (Cordillera de Talamanca & Cerro Kamuk)
            step3 = client.get(
                "/api/v1/bamboo-thicket/sites/chirripo-talamanca-chusquea-costa-rica"
            )
            assert step3.status_code == 200
            detail = step3.json()
            assert "Talamanca" in detail["site"]["name"]
            assert detail["site"]["difficulty"] == "extreme"
            assert "baseline_calculation" in detail
            assert detail["baseline_calculation"]["risk_level"] in {"high", "critical"}

            # Step 4: Run custom calculator (POST and GET) for critical-risk vs low-risk conditions
            step4_post = client.post(
                "/api/v1/bamboo-thicket/calculate",
                json={
                    "culm_density_per_sq_m": 96.0,
                    "culm_diameter_mm": 48.0,
                    "ridge_slope_deg": 44.0,
                    "wetness_film_pct": 92.0,
                    "follower_spacing_m": 1.5,
                    "site_id": "chirripo-talamanca-chusquea-costa-rica",
                },
            )
            assert step4_post.status_code == 200
            calc_post = step4_post.json()["calculation"]
            assert calc_post["risk_level"] in {"high", "critical"}
            assert calc_post["rebound_whip_kinetic_j"] > 35.0

            step4_get = client.get(
                "/api/v1/bamboo-thicket/calculate",
                params={
                    "culm_density_per_sq_m": 12.0,
                    "culm_diameter_mm": 8.0,
                    "ridge_slope_deg": 6.0,
                    "wetness_film_pct": 15.0,
                    "follower_spacing_m": 8.0,
                },
            )
            assert step4_get.status_code == 200
            calc_get = step4_get.json()["calculation"]
            assert calc_get["risk_level"] == "low"
            assert (
                calc_get["net_advance_meters_per_hour"]
                > calc_post["net_advance_meters_per_hour"]
            )

            # Step 5: Retrieve gear checklist
            step5 = client.get("/api/v1/bamboo-thicket/checklist")
            assert step5.status_code == 200
            checklist_data = step5.json()
            assert checklist_data["total"] == 6
            assert all(
                item["priority"] == "essential"
                for item in checklist_data["gear_checklist"]
            )

            # Step 6: Chat endpoint integration (/api/create_response)
            step6 = client.post(
                "/api/create_response",
                json={
                    "question": (
                        "How should we bushwhack the Chusquea bamboo thicket on Cerro Kamuk "
                        "with a culm density of 72 culms/m2, culm diameter of 30 mm, "
                        "and ridge slope of 35 deg?"
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert step6.status_code == 200
            chat_data = step6.json()
            assert "bamboo_thicket_info" in chat_data
            bt_info = chat_data["bamboo_thicket_info"]
            assert bt_info["action"] == "bamboo_thicket_calculated"
            assert bt_info["calculation"]["culm_density_per_sq_m"] == 72.0
            assert bt_info["calculation"]["culm_diameter_mm"] == 30.0
            assert bt_info["calculation"]["ridge_slope_deg"] == 35.0
            assert "Kamuk" in chat_data["answer"] or "Talamanca" in chat_data["answer"]

            # Step 7: SSE streaming endpoint integration (/api/create_response/stream)
            step7 = client.post(
                "/api/create_response/stream",
                json={
                    "question": (
                        "Evaluate Sasa kurilensis Chishima-zasa bamboo thicket hazards on Poroshiri-dake "
                        "with 85 culms/m2 culm density and 88% wetness film."
                    ),
                    "customer_id": "1",
                    "chat_history": "[]",
                },
            )
            assert step7.status_code == 200
            events = []
            for line in step7.text.splitlines():
                if line.startswith("data: "):
                    payload_str = line[len("data: ") :].strip()
                    if payload_str and payload_str != "[DONE]":
                        events.append(json.loads(payload_str))
            assert len(events) >= 2
            info_events = [e for e in events if "bamboo_thicket_info" in e]
            assert len(info_events) >= 1
            stream_bt_info = info_events[0]["bamboo_thicket_info"]
            assert stream_bt_info["action"] == "bamboo_thicket_calculated"
            assert stream_bt_info["calculation"]["culm_density_per_sq_m"] == 85.0
            assert stream_bt_info["calculation"]["wetness_film_pct"] == 88.0


@pytest.mark.anyio
async def test_bamboo_thicket_journey_real_mode_execution() -> None:
    """Verifies bamboo thicket prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Kaito",
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
                    "Thread horizontally beneath solid-stemmed Chusquea culm arches on Cerro Kamuk "
                    "and maintain at least 4 m follower spacing to avoid rebound whip-back strikes."
                )
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": (
                    "How do I bushwhack through the Chusquea bamboo thicket on Cerro Kamuk in Cordillera de Talamanca?"
                ),
                "customer_id": "1",
                "chat_history": "[]",
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "bamboo_thicket_info" in data
        assert data["bamboo_thicket_info"]["action"] == "bamboo_thicket_lookup"
        assert mock_llm.called
        call_kwargs = mock_llm.call_args.kwargs
        assert "bamboo_thicket_prompt" in call_kwargs
        assert "BAMBOO-THICKET" in call_kwargs["bamboo_thicket_prompt"].upper()
