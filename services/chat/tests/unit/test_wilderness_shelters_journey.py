import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_wilderness_shelters_journey():
    """Multi-step API journey test for Wilderness Survival Shelters & Snow Bivouac Tooling:

    Step 1: Query shelters list (GET /api/wilderness-shelters/shelters) with optional difficulty filtering.
    Step 2: Query specific shelter detail (GET /api/wilderness-shelters/shelters/{shelter_id}) and 404 for unknown.
    Step 3: Run thermodynamics calculation (POST /api/wilderness-shelters/calculate-thermodynamics) with varying parameters and 404 on unknown.
    Step 4: Query mandatory gear checklist (GET /api/wilderness-shelters/gear) asserting 6 mandatory items.
    Step 5: Test create_response non-streaming with shelter inquiry verifying shelter_info metadata.
    Step 6: Test create_response/stream SSE streaming events for shelter actions.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query shelters list (GET /api/wilderness-shelters/shelters)
        # -------------------------------------------------------------------------
        res1 = client.get("/api/wilderness-shelters/shelters")
        assert res1.status_code == 200
        shelters = res1.json()
        assert len(shelters) == 5
        shelter_ids = [s["shelter_id"] for s in shelters]
        assert "alpine-snow-cave-bivouac" in shelter_ids
        assert "subarctic-quinzhee-snow-mound" in shelter_ids
        assert "emergency-snow-trench-tarp" in shelter_ids
        assert "boreal-debris-hut-lean-to" in shelter_ids
        assert "tree-well-snow-bivouac" in shelter_ids

        # Filter by difficulty
        res1_diff = client.get("/api/wilderness-shelters/shelters?difficulty=beginner")
        assert res1_diff.status_code == 200
        beginner_shelters = res1_diff.json()
        assert len(beginner_shelters) == 2
        beg_ids = [s["shelter_id"] for s in beginner_shelters]
        assert "emergency-snow-trench-tarp" in beg_ids
        assert "tree-well-snow-bivouac" in beg_ids

        res1_adv = client.get("/api/wilderness-shelters/shelters?difficulty=advanced")
        assert res1_adv.status_code == 200
        adv_shelters = res1_adv.json()
        assert len(adv_shelters) == 1
        assert adv_shelters[0]["shelter_id"] == "alpine-snow-cave-bivouac"

        # -------------------------------------------------------------------------
        # Step 2: Query specific shelter detail (GET /api/wilderness-shelters/shelters/{shelter_id})
        # -------------------------------------------------------------------------
        res2 = client.get("/api/wilderness-shelters/shelters/alpine-snow-cave-bivouac")
        assert res2.status_code == 200
        cave = res2.json()
        assert cave["shelter_id"] == "alpine-snow-cave-bivouac"
        assert "Alpine Snow Cave" in cave["title"]
        assert cave["difficulty"] == "advanced"
        assert cave["min_snow_depth_m"] == 2.0
        assert cave["min_roof_thickness_cm"] == 45
        assert cave["interior_thermal_gain_f"] == 32
        assert len(cave["highlights"]) >= 3

        # 404 for unknown shelter
        res2_404 = client.get("/api/wilderness-shelters/shelters/unknown-shelter-id")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Run thermodynamics calculation (POST /api/wilderness-shelters/calculate-thermodynamics)
        # -------------------------------------------------------------------------
        calc_payload = {
            "shelter_id": "alpine-snow-cave-bivouac",
            "ambient_temp_f": 0.0,
            "occupant_count": 2,
            "wall_thickness_cm": 45.0,
            "vent_hole_diameter_cm": 10.0,
            "platform_height_above_floor_cm": 35.0,
            "candle_lit": True,
        }
        res3 = client.post("/api/wilderness-shelters/calculate-thermodynamics", json=calc_payload)
        assert res3.status_code == 200
        calc_data = res3.json()
        assert calc_data["shelter_id"] == "alpine-snow-cave-bivouac"
        assert calc_data["wall_r_value"] >= 10.0
        assert calc_data["cold_trap_differential_f"] == 9
        assert calc_data["interior_temp_f"] >= 28
        assert (
            calc_data["floor_temp_f"]
            == calc_data["interior_temp_f"] - calc_data["cold_trap_differential_f"]
        )
        assert calc_data["ventilation_adequacy_percent"] >= 90
        assert calc_data["structural_safety_status"] == "SAFE"
        assert calc_data["thermal_advisory"]

        # Varying parameters: severe thin roof hazard
        calc_thin = {
            "shelter_id": "alpine-snow-cave-bivouac",
            "ambient_temp_f": -10.0,
            "wall_thickness_cm": 15.0,
            "vent_hole_diameter_cm": 10.0,
        }
        res3_thin = client.post("/api/wilderness-shelters/calculate-thermodynamics", json=calc_thin)
        assert res3_thin.status_code == 200
        thin_data = res3_thin.json()
        assert thin_data["structural_safety_status"] in (
            "CRITICAL_COLLAPSE_RISK",
            "COLLAPSE_WARNING",
        )

        # Varying parameters: inadequate ventilation asphyxiation hazard
        calc_asphyxia = {
            "shelter_id": "subarctic-quinzhee-snow-mound",
            "occupant_count": 3,
            "vent_hole_diameter_cm": 2.0,
        }
        res3_asphyxia = client.post(
            "/api/wilderness-shelters/calculate-thermodynamics", json=calc_asphyxia
        )
        assert res3_asphyxia.status_code == 200
        asphyxia_data = res3_asphyxia.json()
        assert asphyxia_data["structural_safety_status"] == "ASPHYXIATION_HAZARD"
        assert asphyxia_data["ventilation_adequacy_percent"] <= 30

        # 404 on unknown shelter
        res3_404 = client.post(
            "/api/wilderness-shelters/calculate-thermodynamics",
            json={"shelter_id": "non-existent-shelter"},
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Query mandatory shelter gear (GET /api/wilderness-shelters/gear)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/wilderness-shelters/gear")
        assert res4.status_code == 200
        gear = res4.json()
        assert len(gear) == 6
        assert all(g["mandatory"] is True for g in gear)
        gear_ids = [g["item_id"] for g in gear]
        assert "d-grip-avalanche-snow-shovel" in gear_ids
        assert "folding-snow-bone-saw" in gear_ids
        assert "thermal-bivy-survival-bag" in gear_ids
        assert "closed-cell-foam-sleeping-pad" in gear_ids
        assert "angled-ventilation-probe" in gear_ids
        assert "survival-candle-lantern" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Test create_response non-streaming with shelter inquiry
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the mandatory survival shelter gear checklist?",
            "customer_id": "cust-shelter-101",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "shelter_info" in data5
        s_info = data5["shelter_info"]
        assert s_info is not None
        assert s_info.get("action") == "gear_checklist"
        assert "gear" in data5["answer"].lower() or "shovel" in data5["answer"].lower()

        # -------------------------------------------------------------------------
        # Step 6: Test create_response/stream SSE events with shelter questions
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Calculate cold-air well thermal gain and R-value for snow cave bivouac"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        shelter_event = next(
            (e for e in parsed_events if e.get("event") in ("shelter_thermo", "shelter_info")),
            None,
        )
        assert shelter_event is not None
        assert "shelter_info" in shelter_event or "shelter_thermo" in shelter_event


@pytest.mark.anyio
async def test_wilderness_shelters_journey_real_mode_execution():
    """Step 7: Verifies shelter prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Jordan", "membership": "Platinum", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="Alpine Snow Cave Bivouacs require digging a cold-air well below the sleeping platform."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Calculate cold-air well thermal gain and R-value for snow cave bivouac"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "shelter_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "shelter_prompt" in call_kwargs
        assert "Alpine Snow Cave" in call_kwargs["shelter_prompt"]
