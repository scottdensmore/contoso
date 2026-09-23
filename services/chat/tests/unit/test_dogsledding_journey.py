import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_dogsledding_journey():
    """Multi-step API journey test for Winter Wilderness Dogsledding & Mushing Tooling:

    Step 1: Query routes list (GET /api/dogsledding/routes) and filter by difficulty.
    Step 2: Query specific route detail (GET /api/dogsledding/routes/{route_id}) and test 404 for invalid route ID.
    Step 3: Run mushing pacing calculation (POST /api/dogsledding/calculate-pacing) with varying parameters.
    Step 4: Retrieve mandatory mushing kit gear (GET /api/dogsledding/gear) asserting 6 items.
    Step 5: Test chat inquiry via create_response verifying dogsled_info metadata.
    Step 6: Test SSE streaming via create_response/stream asserting dogsledding SSE events.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query routes list (GET /api/dogsledding/routes)
        # -------------------------------------------------------------------------
        res1 = client.get("/api/dogsledding/routes")
        assert res1.status_code == 200
        routes = res1.json()
        assert len(routes) == 5
        r_ids = [r["route_id"] for r in routes]
        assert "iditarod-historic-trail-traverse" in r_ids
        assert "boundary-waters-quetico-run" in r_ids
        assert "yukon-quest-eagle-summit" in r_ids
        assert "denali-sanctuary-river-patrol" in r_ids
        assert "maine-north-woods-allagash" in r_ids

        # Filter by difficulty
        res1_diff = client.get("/api/dogsledding/routes?difficulty=intermediate")
        assert res1_diff.status_code == 200
        intermediate_routes = res1_diff.json()
        assert len(intermediate_routes) == 2
        int_ids = [r["route_id"] for r in intermediate_routes]
        assert "boundary-waters-quetico-run" in int_ids
        assert "maine-north-woods-allagash" in int_ids

        res1_expert = client.get("/api/dogsledding/routes?difficulty=expert")
        assert res1_expert.status_code == 200
        expert_routes = res1_expert.json()
        assert len(expert_routes) == 2

        # -------------------------------------------------------------------------
        # Step 2: Query specific route detail (GET /api/dogsledding/routes/{route_id})
        # -------------------------------------------------------------------------
        res2 = client.get("/api/dogsledding/routes/iditarod-historic-trail-traverse")
        assert res2.status_code == 200
        iditarod = res2.json()
        assert iditarod["route_id"] == "iditarod-historic-trail-traverse"
        assert "Iditarod" in iditarod["title"]
        assert iditarod["region"] == "Seward to Nome, Alaska"
        assert iditarod["difficulty"] == "expert"
        assert iditarod["distance_km"] == 1569.0
        assert iditarod["typical_duration_days"] == 12
        assert iditarod["recommended_team_size"] == 14
        assert iditarod["low_temp_record_f"] == -60
        assert len(iditarod["highlights"]) >= 3

        # 404 for invalid route
        res2_404 = client.get("/api/dogsledding/routes/invalid-route-xyz")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Run mushing pacing calculation (POST /api/dogsledding/calculate-pacing)
        # -------------------------------------------------------------------------
        pacing_payload = {
            "route_id": "boundary-waters-quetico-run",
            "team_dog_count": 8,
            "ambient_temp_f": -10.0,
            "cargo_weight_kg": 65.0,
            "daily_run_hours": 6.0,
            "trail_surface": "groomed_hardpack",
        }
        res3 = client.post("/api/dogsledding/calculate-pacing", json=pacing_payload)
        assert res3.status_code == 200
        pacing_data = res3.json()
        assert pacing_data["route_id"] == "boundary-waters-quetico-run"
        assert pacing_data["effective_speed_kmh"] > 0
        assert pacing_data["daily_distance_km"] > 0
        assert pacing_data["dog_calories_per_day"] >= 7000
        assert pacing_data["team_total_calories_per_day"] == pacing_data["dog_calories_per_day"] * 8
        assert pacing_data["total_melt_water_liters"] >= 25.0
        assert pacing_data["recommended_rest_hours"] >= 6.0
        assert pacing_data["required_bootie_count"] >= 32
        assert pacing_data["safety_status"] in ("OPTIMAL", "CAUTION")
        assert pacing_data["trail_advisory"]

        # Varying parameters: extreme cold and alpine tundra
        cold_payload = {
            "route_id": "yukon-quest-eagle-summit",
            "team_dog_count": 12,
            "ambient_temp_f": -40.0,
            "cargo_weight_kg": 80.0,
            "daily_run_hours": 7.0,
            "trail_surface": "windblown_tundra",
        }
        res3_cold = client.post("/api/dogsledding/calculate-pacing", json=cold_payload)
        assert res3_cold.status_code == 200
        cold_data = res3_cold.json()
        assert cold_data["route_id"] == "yukon-quest-eagle-summit"
        assert cold_data["dog_calories_per_day"] > 8500
        assert cold_data["safety_status"] in ("CAUTION", "WARNING", "DANGER")

        # 404 for invalid route in calculate-pacing
        res3_404 = client.post(
            "/api/dogsledding/calculate-pacing",
            json={"route_id": "non-existent-route-id"},
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Retrieve mandatory mushing kit gear (GET /api/dogsledding/gear)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/dogsledding/gear")
        assert res4.status_code == 200
        gear = res4.json()
        assert len(gear) == 6
        assert all(g["mandatory"] is True for g in gear)
        gear_ids = [g["item_id"] for g in gear]
        assert "dog-protective-booties" in gear_ids
        assert "dual-claw-snow-hook" in gear_ids
        assert "aircraft-cable-gangline" in gear_ids
        assert "arctic-cooker-melt-pot" in gear_ids
        assert "high-fat-canine-rations" in gear_ids
        assert "musher-subzero-bivy-parka" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Test chat inquiry via create_response verifying dogsled_info metadata
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "Can you provide details on the Iditarod historic trail traverse dogsledding expedition?",
            "customer_id": "cust-mushing-101",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "dogsled_info" in data5
        d_info = data5["dogsled_info"]
        assert d_info is not None
        assert d_info.get("route_id") == "iditarod-historic-trail-traverse" or "iditarod" in str(d_info).lower()
        assert "iditarod" in data5["answer"].lower() or "dogsled" in data5["answer"].lower()

        # -------------------------------------------------------------------------
        # Step 6: Test SSE streaming via create_response/stream asserting dogsledding SSE events
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "What is the mandatory expedition mushing gear checklist for dogsledding?"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split(chr(10) + chr(10)) if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        dogsled_event = next(
            (e for e in parsed_events if e.get("event") in ("dogsled_gear", "dogsled_info")),
            None,
        )
        assert dogsled_event is not None
        assert "dogsled_info" in dogsled_event or "dogsled_gear" in dogsled_event
