import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_orienteering_journey():
    """Multi-step API journey test for Wilderness Orienteering & Off-Trail Land Navigation Tooling:

    Step 1: Query courses list (GET /api/orienteering/courses) and filter by difficulty.
    Step 2: Query specific course detail (GET /api/orienteering/courses/{course_id}) and test 404 for invalid course ID.
    Step 3: Run navigation leg calculation (POST /api/orienteering/calculate-leg) with varying terrain and visibility parameters.
    Step 4: Retrieve mandatory navigation kit gear (GET /api/orienteering/gear) asserting 6 items.
    Step 5: Test chat inquiry via create_response verifying orienteering_info metadata.
    Step 6: Test SSE streaming via create_response/stream asserting orienteering SSE events.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query courses list (GET /api/orienteering/courses)
        # -------------------------------------------------------------------------
        res1 = client.get("/api/orienteering/courses")
        assert res1.status_code == 200
        courses = res1.json()
        assert len(courses) == 5
        c_ids = [c["course_id"] for c in courses]
        assert "harriman-silvermine-classic" in c_ids
        assert "devils-lake-bluff-rogaine" in c_ids
        assert "rainier-paradise-glacier-traverse" in c_ids
        assert "blue-ridge-linville-gorge-challenge" in c_ids
        assert "boulder-chautauqua-sprint-course" in c_ids

        # Filter by difficulty
        res1_diff = client.get("/api/orienteering/courses?difficulty=beginner")
        assert res1_diff.status_code == 200
        beginner_courses = res1_diff.json()
        assert len(beginner_courses) == 1
        assert beginner_courses[0]["course_id"] == "boulder-chautauqua-sprint-course"

        res1_expert = client.get("/api/orienteering/courses?difficulty=expert")
        assert res1_expert.status_code == 200
        expert_courses = res1_expert.json()
        assert len(expert_courses) == 2

        # -------------------------------------------------------------------------
        # Step 2: Query specific course detail (GET /api/orienteering/courses/{course_id})
        # -------------------------------------------------------------------------
        res2 = client.get("/api/orienteering/courses/harriman-silvermine-classic")
        assert res2.status_code == 200
        harriman = res2.json()
        assert harriman["course_id"] == "harriman-silvermine-classic"
        assert "Harriman Silvermine" in harriman["title"]
        assert harriman["region"] == "Harriman State Park, NY"
        assert harriman["difficulty"] == "intermediate"
        assert harriman["distance_km"] == 6.8
        assert harriman["checkpoint_controls"] == 12
        assert harriman["magnetic_declination_deg"] == -12.5
        assert harriman["base_pace_count_per_100m"] == 64
        assert len(harriman["highlights"]) >= 3

        # 404 for invalid course
        res2_404 = client.get("/api/orienteering/courses/invalid-course-xyz")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Run navigation leg calculation (POST /api/orienteering/calculate-leg)
        # -------------------------------------------------------------------------
        leg_payload = {
            "course_id": "harriman-silvermine-classic",
            "leg_distance_meters": 350.0,
            "map_bearing_degrees": 45.0,
            "terrain_type": "open_forest",
            "visibility": "clear",
        }
        res3 = client.post("/api/orienteering/calculate-leg", json=leg_payload)
        assert res3.status_code == 200
        leg_data = res3.json()
        assert leg_data["course_id"] == "harriman-silvermine-classic"
        assert leg_data["magnetic_bearing_degrees"] == 57.5
        assert leg_data["back_bearing_degrees"] == 225.0
        assert leg_data["aim_off_bearing_degrees"] == 49.0
        assert leg_data["effective_pace_count_per_100m"] == 70
        assert leg_data["total_double_paces"] == 245
        assert leg_data["estimated_time_minutes"] > 0
        assert leg_data["technique_recommendation"]
        assert leg_data["safety_advisory"]

        # Varying terrain and visibility: dense_brush and fog_overcast
        brush_payload = {
            "course_id": "blue-ridge-linville-gorge-challenge",
            "leg_distance_meters": 200.0,
            "map_bearing_degrees": 210.0,
            "terrain_type": "dense_brush",
            "visibility": "fog_overcast",
        }
        res3_brush = client.post("/api/orienteering/calculate-leg", json=brush_payload)
        assert res3_brush.status_code == 200
        brush_data = res3_brush.json()
        assert brush_data["course_id"] == "blue-ridge-linville-gorge-challenge"
        # 210 - (-7.5) = 217.5
        assert brush_data["magnetic_bearing_degrees"] == 217.5
        # 210 - 180 = 30.0
        assert brush_data["back_bearing_degrees"] == 30.0
        assert "Aiming off" in brush_data["technique_recommendation"]

        # 404 for invalid course in calculate-leg
        res3_404 = client.post(
            "/api/orienteering/calculate-leg",
            json={"course_id": "non-existent-course-id"},
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Retrieve mandatory navigation kit gear (GET /api/orienteering/gear)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/orienteering/gear")
        assert res4.status_code == 200
        gear = res4.json()
        assert len(gear) == 6
        assert all(g["mandatory"] is True for g in gear)
        gear_ids = [g["item_id"] for g in gear]
        assert "mirrored-sighting-compass" in gear_ids
        assert "waterproof-topo-map" in gear_ids
        assert "utm-mgrs-grid-reader" in gear_ids
        assert "ranger-pace-tally-beads" in gear_ids
        assert "barometric-altimeter-watch" in gear_ids
        assert "high-visibility-marking-ribbon" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Test chat inquiry via create_response verifying orienteering_info metadata
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "How do I navigate the Harriman Silvermine classic orienteering course with compass bearings?",
            "customer_id": "cust-orienteer-101",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "orienteering_info" in data5
        o_info = data5["orienteering_info"]
        assert o_info is not None
        assert o_info.get("course_id") == "harriman-silvermine-classic" or "harriman" in str(o_info).lower()
        assert "harriman" in data5["answer"].lower() or "orienteering" in data5["answer"].lower()

        # -------------------------------------------------------------------------
        # Step 6: Test SSE streaming via create_response/stream asserting orienteering events
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "What is the mandatory orienteering navigation gear checklist?"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        orienteering_event = next(
            (e for e in parsed_events if e.get("event") in ("orienteering_gear", "orienteering_info")),
            None,
        )
        assert orienteering_event is not None
        assert "orienteering_info" in orienteering_event or "orienteering_gear" in orienteering_event
