import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_snowmobiling_journey():
    """Multi-step API journey test for Backcountry Snowmobiling & Avalanche Mountain Riding Tooling:

    Step 1: List zones & filter by ATES rating (GET /api/snowmobiling/zones).
    Step 2: Retrieve specific zone detail (GET /api/snowmobiling/zones/{zone_id}) and 404 on unknown.
    Step 3: Run sled calculation via REST endpoint for Turbo vs NA and trenching (POST /api/snowmobiling/calculate).
    Step 4: Retrieve mandatory mountain sled safety & recovery checklist (GET /api/snowmobiling/gear).
    Step 5: Test multi-turn conversational chat through create_response verifying snowmobiling_info metadata.
    Step 6: Test SSE streaming endpoint create_response/stream for snowmobiling queries.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: List zones & filter by ATES rating
        # -------------------------------------------------------------------------
        res1 = client.get("/api/snowmobiling/zones")
        assert res1.status_code == 200
        zones = res1.json()
        assert len(zones) == 5
        zone_ids = [z["id"] for z in zones]
        assert "revelstoke-boulder-mountain" in zone_ids
        assert "cooke-city-daisy-pass" in zone_ids
        assert "togwotee-pass-brooks-lake" in zone_ids
        assert "valee-de-bras-du-nord-gaspe" in zone_ids
        assert "steamboat-rabbit-ears-pass" in zone_ids

        # Filter by ATES rating Complex
        res1_complex = client.get("/api/snowmobiling/zones?ates_rating=Complex")
        assert res1_complex.status_code == 200
        complex_zones = res1_complex.json()
        assert len(complex_zones) == 2
        complex_ids = [z["id"] for z in complex_zones]
        assert "revelstoke-boulder-mountain" in complex_ids
        assert "cooke-city-daisy-pass" in complex_ids

        # Filter by ATES rating Simple
        res1_simple = client.get("/api/snowmobiling/zones?ates_rating=Simple")
        assert res1_simple.status_code == 200
        simple_zones = res1_simple.json()
        assert len(simple_zones) == 1
        assert simple_zones[0]["id"] == "steamboat-rabbit-ears-pass"

        # -------------------------------------------------------------------------
        # Step 2: Retrieve specific zone detail & 404 on unknown
        # -------------------------------------------------------------------------
        res2 = client.get("/api/snowmobiling/zones/revelstoke-boulder-mountain")
        assert res2.status_code == 200
        rev = res2.json()
        assert rev["id"] == "revelstoke-boulder-mountain"
        assert "Boulder Mountain" in rev["name"]
        assert rev["elevation_meters"] == 2300
        assert rev["average_annual_snow_cm"] == 1400
        assert rev["ates_rating"] == "Complex ATES"
        assert len(rev["highlights"]) >= 2

        res2_404 = client.get("/api/snowmobiling/zones/unknown-glacier-zone")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Run sled calculation via REST endpoint
        # -------------------------------------------------------------------------
        # Factory Turbo at Revelstoke (7,546 ft <= 10,000 ft -> 0% loss)
        turbo_req = {
            "zone_id": "revelstoke-boulder-mountain",
            "track_length_inches": 165.0,
            "lug_height_inches": 2.75,
            "engine_type": "factory_turbo",
            "rider_and_gear_weight_kg": 95.0,
            "snowpack_condition": "deep_powder",
        }
        res3_turbo = client.post("/api/snowmobiling/calculate", json=turbo_req)
        assert res3_turbo.status_code == 200
        turbo_data = res3_turbo.json()
        assert turbo_data["zone_name"] == "Boulder Mountain & Frisby Ridge"
        assert turbo_data["effective_horsepower"] == 165.0
        assert turbo_data["power_loss_percent"] == 0.0
        assert turbo_data["trenching_risk"] in ("low", "moderate")
        assert "counter-steering" in turbo_data["counter_steering_guidance"].lower()
        assert "Complex ATES" in (turbo_data["avalanche_terrain_warning"] or "")

        # Naturally Aspirated at high elevation (Cooke City, 3050m = ~10,000 ft -> ~35% loss)
        na_req = {
            "zone_id": "cooke-city-daisy-pass",
            "track_length_inches": 146.0,
            "lug_height_inches": 2.0,
            "engine_type": "naturally_aspirated",
            "rider_and_gear_weight_kg": 110.0,
            "snowpack_condition": "sugar_snow",
        }
        res3_na = client.post("/api/snowmobiling/calculate", json=na_req)
        assert res3_na.status_code == 200
        na_data = res3_na.json()
        assert na_data["power_loss_percent"] > 30.0
        assert na_data["effective_horsepower"] < 120.0
        assert na_data["trenching_risk"] == "high"

        # 404 for invalid zone in calculate
        res3_404 = client.post(
            "/api/snowmobiling/calculate",
            json={"zone_id": "non-existent-peak", "track_length_inches": 165.0},
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Retrieve mandatory gear checklist (GET /api/snowmobiling/gear)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/snowmobiling/gear")
        assert res4.status_code == 200
        gear = res4.json()
        assert len(gear) == 6
        assert all(g["mandatory"] is True for g in gear)
        gear_ids = [g["id"] for g in gear]
        assert "electronic-avalanche-airbag-pack" in gear_ids
        assert "digital-three-antenna-beacon" in gear_ids
        assert "stealth-snow-probe-carbon-320" in gear_ids
        assert "d-grip-metal-snow-saw-shovel" in gear_ids
        assert "magnetic-kill-switch-tether" in gear_ids
        assert "tunnel-retractable-recovery-winch" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Test conversational chat through create_response
        # -------------------------------------------------------------------------
        chat_req1 = {
            "question": "What mandatory avalanche airbag and mountain sled gear do I need for backcountry riding?",
            "customer_id": "cust-snow-101",
        }
        res5_1 = client.post("/api/create_response", json=chat_req1)
        assert res5_1.status_code == 200
        data5_1 = res5_1.json()
        assert "snowmobiling_info" in data5_1
        assert data5_1["snowmobiling_info"]["action"] == "gear_checklist"
        assert len(data5_1["snowmobiling_info"]["gear"]) == 6
        assert "airbag" in data5_1["answer"].lower() or "tether" in data5_1["answer"].lower()

        chat_req2 = {
            "question": "Calculate flotation index, trenching risk, and elevation power derating for 850 turbo in Revelstoke",
            "customer_id": "cust-snow-101",
        }
        res5_2 = client.post("/api/create_response", json=chat_req2)
        assert res5_2.status_code == 200
        data5_2 = res5_2.json()
        assert "snowmobiling_info" in data5_2
        assert data5_2["snowmobiling_info"]["action"] == "calculate_sled"
        assert "calculation" in data5_2["snowmobiling_info"]

        # Also test with /api/chat/service/create_response
        res5_3 = client.post("/api/chat/service/create_response", json=chat_req2)
        assert res5_3.status_code == 200
        data5_3 = res5_3.json()
        assert "snowmobiling_info" in data5_3

        # -------------------------------------------------------------------------
        # Step 6: Test SSE streaming endpoint create_response/stream
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Calculate flotation index and power loss for snowmobile in Cooke City",
            },
        )
        assert res6_stream.status_code == 200
        sep = chr(10) + chr(10)
        raw_events = [line.strip() for line in res6_stream.text.split(sep) if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        snowmobile_event = next(
            (
                e
                for e in parsed_events
                if e.get("event") in ("snowmobiling_calculation", "snowmobiling_info")
            ),
            None,
        )
        assert snowmobile_event is not None
        assert (
            "snowmobiling_info" in snowmobile_event
            or "snowmobiling_calculation" in snowmobile_event
        )

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Performance" in full_text or "Daisy Pass" in full_text or "Power" in full_text


@pytest.mark.anyio
async def test_snowmobiling_journey_real_mode_execution():
    """Step 7: Verifies snowmobiling prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(return_value={"firstName": "Morgan", "membership": "Gold", "orders": []}),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="Revelstoke Boulder Mountain is world-class backcountry terrain requiring electronic airbag packs."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Tell me about backcountry snowmobiling in Revelstoke Boulder Mountain and 850 turbo power."
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "snowmobiling_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "snowmobiling_prompt" in call_kwargs
        assert (
            "Boulder Mountain" in call_kwargs["snowmobiling_prompt"]
            or "Snowmobiling" in call_kwargs["snowmobiling_prompt"]
        )
