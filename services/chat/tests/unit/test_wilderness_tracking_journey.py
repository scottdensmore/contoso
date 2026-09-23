import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_wilderness_tracking_journey():
    """Multi-step API journey test for Wilderness Tracking & Animal Sign Reading Tooling:

    Step 1: List species (GET /api/wilderness-tracking/species) and filter by family.
    Step 2: Retrieve specific species (GET /api/wilderness-tracking/species/{species_id}) and assert 404 for unknown.
    Step 3: Run calculation via REST endpoint (POST /api/wilderness-tracking/calculate)
            testing fresh predator alert (wolf/grizzly) vs weathered ungulate (elk/moose).
    Step 4: Retrieve gear checklist (GET /api/wilderness-tracking/gear) asserting 6 mandatory items.
    Step 5: Test multi-turn conversational chat through create_response asserting tracking_info metadata and answer.
    Step 6: Test SSE streaming endpoint create_response/stream asserting wilderness tracking SSE events.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: List species & filter by family
        # -------------------------------------------------------------------------
        res1 = client.get("/api/wilderness-tracking/species")
        assert res1.status_code == 200
        species_list = res1.json()
        assert len(species_list) == 5
        sp_ids = [s["species_id"] for s in species_list]
        assert "gray-wolf-pack" in sp_ids
        assert "mountain-lion-cougar" in sp_ids
        assert "grizzly-brown-bear" in sp_ids
        assert "rocky-mountain-elk" in sp_ids
        assert "north-american-moose" in sp_ids

        # Filter by canid family
        res1_canid = client.get("/api/wilderness-tracking/species?family=canid")
        assert res1_canid.status_code == 200
        canids = res1_canid.json()
        assert len(canids) == 1
        assert canids[0]["species_id"] == "gray-wolf-pack"

        # Filter by ungulate family
        res1_ungulate = client.get("/api/wilderness-tracking/species?family=ungulate")
        assert res1_ungulate.status_code == 200
        ungulates = res1_ungulate.json()
        assert len(ungulates) == 2
        assert all(u["family"] == "ungulate" for u in ungulates)

        # -------------------------------------------------------------------------
        # Step 2: Retrieve specific species (gray-wolf-pack and grizzly-brown-bear)
        # -------------------------------------------------------------------------
        res2_wolf = client.get("/api/wilderness-tracking/species/gray-wolf-pack")
        assert res2_wolf.status_code == 200
        wolf = res2_wolf.json()
        assert wolf["species_id"] == "gray-wolf-pack"
        assert wolf["common_name"] == "Northwestern Gray Wolf"
        assert wolf["scientific_name"] == "Canis lupus"
        assert wolf["family"] == "canid"
        assert wolf["track_length_inches"] == 4.5
        assert wolf["track_width_inches"] == 4.0
        assert wolf["claw_marks_visible"] is True
        assert wolf["toe_count"] == 4
        assert wolf["typical_stride_inches"] == 28.0
        assert wolf["typical_gait"] == "Direct Register Trot"
        assert len(wolf["identifying_signs"]) == 3

        res2_grizzly = client.get("/api/wilderness-tracking/species/grizzly-brown-bear")
        assert res2_grizzly.status_code == 200
        grizzly = res2_grizzly.json()
        assert grizzly["species_id"] == "grizzly-brown-bear"
        assert grizzly["family"] == "ursid"
        assert grizzly["toe_count"] == 5

        # 404 for invalid species
        res2_404 = client.get("/api/wilderness-tracking/species/nonexistent-yeti")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Run calculation via REST endpoint (fresh predator vs weathered ungulate)
        # -------------------------------------------------------------------------
        # Fresh predator: gray-wolf-pack with razor crisp undisturbed track wall
        fresh_predator_req = {
            "species_id": "gray-wolf-pack",
            "substrate": "compacted_mud",
            "sun_wind_exposure": "sheltered_dense_canopy",
            "track_wall_sharpness": "razor_crisp_undisturbed",
            "measured_stride_inches": 28.0,
            "dewclaw_present": False,
        }
        res3_fresh = client.post("/api/wilderness-tracking/calculate", json=fresh_predator_req)
        assert res3_fresh.status_code == 200
        fresh_data = res3_fresh.json()
        assert fresh_data["species_id"] == "gray-wolf-pack"
        assert fresh_data["freshness_rating"] == "fresh_under_2_hours"
        assert fresh_data["predator_alert"] == "heightened_predator_alert"
        assert "Optimal" in fresh_data["substrate_preservation_rating"]
        assert fresh_data["estimated_speed_mph"] > 0
        assert (
            "bear spray" in fresh_data["tracker_advisory"].lower()
            or "alert" in fresh_data["tracker_advisory"].lower()
        )

        # Weathered ungulate: rocky-mountain-elk with eroded walls debris filled
        weathered_ungulate_req = {
            "species_id": "rocky-mountain-elk",
            "substrate": "loose_gravel_scree",
            "sun_wind_exposure": "open_wind_scoured_ridge",
            "track_wall_sharpness": "eroded_walls_debris_filled",
            "measured_stride_inches": 30.0,
            "dewclaw_present": False,
        }
        res3_weathered = client.post(
            "/api/wilderness-tracking/calculate", json=weathered_ungulate_req
        )
        assert res3_weathered.status_code == 200
        weathered_data = res3_weathered.json()
        assert weathered_data["species_id"] == "rocky-mountain-elk"
        assert weathered_data["family"] == "ungulate"
        assert weathered_data["predator_alert"] == "normal_wilderness_protocol"
        assert weathered_data["freshness_rating"] == "aged_12_to_48_hours"
        assert "12 - 48 hours" in weathered_data["estimated_age_hours"]

        # 404 for invalid species calculation
        res3_404 = client.post(
            "/api/wilderness-tracking/calculate",
            json={"species_id": "chupacabra-beast"},
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Retrieve gear checklist (GET /api/wilderness-tracking/gear)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/wilderness-tracking/gear")
        assert res4.status_code == 200
        gear_items = res4.json()
        assert len(gear_items) == 6
        assert all(g["mandatory"] is True for g in gear_items)
        gear_ids = [g["item_id"] for g in gear_items]
        assert "calibrated-tracking-stick" in gear_ids
        assert "high-intensity-raking-light" in gear_ids
        assert "compact-8x42-binoculars" in gear_ids
        assert "quick-hardening-dental-stone" in gear_ids
        assert "weatherproof-field-journal" in gear_ids
        assert "inertial-holstered-bear-spray" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Test multi-turn conversational chat through create_response
        # -------------------------------------------------------------------------
        # Turn 1: Inquire about wildlife tracking catalog
        chat_req1 = {
            "question": "What wildlife animal tracks and signs can you help me identify?",
            "customer_id": "cust-track-1",
        }
        res5_1 = client.post("/api/create_response", json=chat_req1)
        assert res5_1.status_code == 200
        data5_1 = res5_1.json()
        assert "tracking_info" in data5_1
        assert data5_1["tracking_info"]["action"] == "species_list"
        assert "Northwestern Gray Wolf" in data5_1["answer"] or "Grizzly" in data5_1["answer"]

        # Turn 2: Inquire about cougar mountain lion tracks
        chat_req2 = {
            "question": "How do I identify cougar mountain lion tracks and sign in canyons?",
            "customer_id": "cust-track-1",
        }
        res5_2 = client.post("/api/create_response", json=chat_req2)
        assert res5_2.status_code == 200
        data5_2 = res5_2.json()
        assert "tracking_info" in data5_2
        assert data5_2["tracking_info"]["action"] == "species_detail"
        assert data5_2["tracking_info"]["species"]["species_id"] == "mountain-lion-cougar"
        assert "Puma concolor" in data5_2["answer"]

        # Turn 3: Inquire about track aging calculation and wall degradation
        chat_req3 = {
            "question": "Calculate track wall degradation and age estimation for fresh wolf spoor",
            "customer_id": "cust-track-1",
        }
        res5_3 = client.post("/api/create_response", json=chat_req3)
        assert res5_3.status_code == 200
        data5_3 = res5_3.json()
        assert "tracking_info" in data5_3
        assert data5_3["tracking_info"]["action"] == "calculate_track_aging"
        assert "PREDATOR ALERT" in data5_3["answer"] or "calculation" in data5_3["tracking_info"]

        # Turn 4: Inquire about mandatory tracking gear
        chat_req4 = {
            "question": "What mandatory tracking gear and dental stone do I need for casting prints?",
            "customer_id": "cust-track-1",
        }
        res5_4 = client.post("/api/create_response", json=chat_req4)
        assert res5_4.status_code == 200
        data5_4 = res5_4.json()
        assert "tracking_info" in data5_4
        assert data5_4["tracking_info"]["action"] == "gear_checklist"
        assert "dental stone" in data5_4["answer"].lower()

        # -------------------------------------------------------------------------
        # Step 6: Test SSE streaming endpoint create_response/stream
        # -------------------------------------------------------------------------
        # Stream 1: Gear inquiry
        stream_req1 = {
            "question": "What is the mandatory tracking stick and bear spray gear checklist?",
        }
        res6_stream1 = client.post("/api/create_response/stream", json=stream_req1)
        assert res6_stream1.status_code == 200
        raw_events1 = [line.strip() for line in res6_stream1.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events1

        parsed_events1 = []
        for line in raw_events1:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events1.append(json.loads(line.removeprefix("data: ")))

        gear_event = next(
            (e for e in parsed_events1 if e.get("event") in ("tracking_gear", "tracking_info")),
            None,
        )
        assert gear_event is not None
        assert "tracking_info" in gear_event or "tracking_gear" in gear_event

        # Stream 2: Calculation inquiry
        stream_req2 = {
            "question": "Calculate track wall degradation and age estimation for grizzly bear sign",
        }
        res6_stream2 = client.post("/api/create_response/stream", json=stream_req2)
        assert res6_stream2.status_code == 200
        raw_events2 = [line.strip() for line in res6_stream2.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events2

        parsed_events2 = []
        for line in raw_events2:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events2.append(json.loads(line.removeprefix("data: ")))

        calc_event = next(
            (
                e
                for e in parsed_events2
                if e.get("event") in ("tracking_calculation", "tracking_info")
            ),
            None,
        )
        assert calc_event is not None
