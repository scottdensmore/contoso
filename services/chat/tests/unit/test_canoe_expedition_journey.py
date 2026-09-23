import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_canoe_expedition_journey():
    """Multi-step API journey test for Whitewater Pack-Canoeing & Open Canoe Expedition Tooling:

    Step 1: Query routes list (GET /api/canoe-expedition/routes) and filter by whitewater_class.
    Step 2: Query specific route detail (GET /api/canoe-expedition/routes/{route_id}) and test 404 for invalid route.
    Step 3: Run canoe ballast/trim calculation (POST /api/canoe-expedition/calculate-trim) with varying parameters.
    Step 4: Retrieve mandatory open canoe expedition gear (GET /api/canoe-expedition/gear) asserting 6 mandatory items.
    Step 5: Test non-streaming chat inquiry via create_response asserting canoe_info metadata and answer.
    Step 6: Test SSE streaming via create_response/stream asserting canoe SSE events.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query routes list (GET /api/canoe-expedition/routes)
        # -------------------------------------------------------------------------
        res1 = client.get("/api/canoe-expedition/routes")
        assert res1.status_code == 200
        routes = res1.json()
        assert len(routes) == 5
        r_ids = [r["route_id"] for r in routes]
        assert "allagash-wilderness-waterway" in r_ids
        assert "nahanni-river-canyon-run" in r_ids
        assert "boundary-waters-granite-river" in r_ids
        assert "missinaibi-river-james-bay" in r_ids
        assert "rio-grande-lower-canyons" in r_ids

        # Filter by whitewater class
        res1_filter = client.get("/api/canoe-expedition/routes?whitewater_class=class_ii")
        assert res1_filter.status_code == 200
        filtered_routes = res1_filter.json()
        assert len(filtered_routes) >= 1
        f_ids = [r["route_id"] for r in filtered_routes]
        assert "allagash-wilderness-waterway" in f_ids

        # -------------------------------------------------------------------------
        # Step 2: Query specific route detail (GET /api/canoe-expedition/routes/{route_id})
        # -------------------------------------------------------------------------
        res2 = client.get("/api/canoe-expedition/routes/allagash-wilderness-waterway")
        assert res2.status_code == 200
        allagash = res2.json()
        assert allagash["route_id"] == "allagash-wilderness-waterway"
        assert "Allagash" in allagash["title"]
        assert allagash["distance_km"] > 0
        assert allagash["typical_duration_days"] >= 1
        assert len(allagash["highlights"]) >= 2
        assert allagash["recommended_length_ft"] in (16, 17)

        # 404 for invalid route
        res2_404 = client.get("/api/canoe-expedition/routes/non-existent-canoe-route")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Run canoe ballast/trim calculation (POST /api/canoe-expedition/calculate-trim)
        # -------------------------------------------------------------------------
        trim_payload = {
            "route_id": "allagash-wilderness-waterway",
            "canoe_length_ft": 16,
            "bow_paddler_weight_kg": 75.0,
            "stern_paddler_weight_kg": 85.0,
            "gear_cargo_weight_kg": 70.0,
            "cargo_placement": "centered",
            "rapid_level": "class_ii",
        }
        res3 = client.post("/api/canoe-expedition/calculate-trim", json=trim_payload)
        assert res3.status_code == 200
        trim_data = res3.json()
        assert trim_data["route_id"] == "allagash-wilderness-waterway"
        assert trim_data["total_gross_weight_kg"] == 230.0
        assert 50 <= trim_data["capacity_percent"] <= 65
        assert trim_data["center_freeboard_cm"] > 15.0
        assert trim_data["center_freeboard_inches"] > 6.0
        assert trim_data["trim_status"] == "balanced"
        assert trim_data["swamping_risk"] in ("low", "moderate")
        assert trim_data["safety_status"] in ("OPTIMAL", "CAUTION")
        assert trim_data["tactical_advisory"]

        # Varying parameters: bow heavy with heavy gear on Class III
        bow_heavy_payload = {
            "route_id": "nahanni-river-canyon-run",
            "canoe_length_ft": 17,
            "bow_paddler_weight_kg": 105.0,
            "stern_paddler_weight_kg": 70.0,
            "gear_cargo_weight_kg": 95.0,
            "cargo_placement": "bow_heavy",
            "rapid_level": "class_iii",
        }
        res3_bow = client.post("/api/canoe-expedition/calculate-trim", json=bow_heavy_payload)
        assert res3_bow.status_code == 200
        bow_data = res3_bow.json()
        assert bow_data["trim_status"] == "bow_heavy"
        assert bow_data["swamping_risk"] in ("high", "critical")

        # 404 for invalid route in calculate-trim
        res3_404 = client.post(
            "/api/canoe-expedition/calculate-trim",
            json={"route_id": "invalid-canoe-route"},
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Retrieve mandatory open canoe expedition gear (GET /api/canoe-expedition/gear)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/canoe-expedition/gear")
        assert res4.status_code == 200
        gear_list = res4.json()
        assert len(gear_list) == 6
        assert all(g["mandatory"] is True for g in gear_list)
        gear_ids = [g["item_id"] for g in gear_list]
        assert "whitewater-canoe-spray-deck" in gear_ids
        assert "dual-end-air-flotation-bags" in gear_ids
        assert "rapid-lining-tracking-ropes" in gear_ids
        assert "deep-water-canoe-bailer-pump" in gear_ids
        assert "contoured-portage-yoke-pads" in gear_ids
        assert "whitewater-rescue-pfd-harness" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Test non-streaming chat inquiry via create_response
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "Can you provide details on the Nahanni river canyon run canoe expedition?",
            "customer_id": "cust-canoe-42",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "canoe_info" in data5
        c_info = data5["canoe_info"]
        assert c_info is not None
        assert "nahanni" in str(c_info).lower()
        assert "nahanni" in data5["answer"].lower() or "canoe" in data5["answer"].lower()

        # -------------------------------------------------------------------------
        # Step 6: Test SSE streaming via create_response/stream
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "What is the mandatory expedition gear checklist for open canoe whitewater expeditions?"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        canoe_event = next(
            (e for e in parsed_events if e.get("event") in ("canoe_gear", "canoe_info", "canoe_routes")),
            None,
        )
        assert canoe_event is not None
        assert "canoe_info" in canoe_event or "canoe_gear" in canoe_event
