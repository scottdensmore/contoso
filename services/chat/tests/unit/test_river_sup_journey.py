import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_river_sup_journey():
    """Multi-step API journey test for Whitewater Stand-Up Paddleboarding & River SUP Tooling:

    Step 1: List runs (GET /api/river-sup/runs) and filter by difficulty.
    Step 2: Retrieve specific run (GET /api/river-sup/runs/{run_id}) and assert 404 for unknown run.
    Step 3: Run calculation (POST /api/river-sup/calculate) testing approved vs prohibited ankle leash/touring fin.
    Step 4: Retrieve gear checklist (GET /api/river-sup/gear) asserting 6 mandatory items.
    Step 5: Test multi-turn conversational chat through create_response asserting river_sup_info metadata and answer.
    Step 6: Test SSE streaming endpoint create_response/stream asserting river SUP SSE events.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: List runs & filter by difficulty
        # -------------------------------------------------------------------------
        res1 = client.get("/api/river-sup/runs")
        assert res1.status_code == 200
        runs = res1.json()
        assert len(runs) == 5
        run_ids = [r["run_id"] for r in runs]
        assert "arkansas-river-browns-canyon" in run_ids
        assert "white-salmon-husum" in run_ids
        assert "french-broad-section-9" in run_ids
        assert "deschutes-maupin-run" in run_ids
        assert "soca-kobarid-slalom" in run_ids

        # Filter by difficulty class_iii
        res1_iii = client.get("/api/river-sup/runs?difficulty=class_iii")
        assert res1_iii.status_code == 200
        iii_runs = res1_iii.json()
        assert len(iii_runs) == 3
        assert all(r["difficulty"] == "class_iii" for r in iii_runs)

        # Filter by difficulty class_iv
        res1_iv = client.get("/api/river-sup/runs?difficulty=class_iv")
        assert res1_iv.status_code == 200
        iv_runs = res1_iv.json()
        assert len(iv_runs) == 2
        assert all(r["difficulty"] == "class_iv" for r in iv_runs)

        # -------------------------------------------------------------------------
        # Step 2: Retrieve specific run (arkansas-river-browns-canyon)
        # -------------------------------------------------------------------------
        res2 = client.get("/api/river-sup/runs/arkansas-river-browns-canyon")
        assert res2.status_code == 200
        browns = res2.json()
        assert browns["run_id"] == "arkansas-river-browns-canyon"
        assert browns["title"] == "Browns Canyon National Monument"
        assert browns["river_system"] == "Arkansas River"
        assert browns["region"] == "Salida/Buena Vista, CO, USA"
        assert browns["difficulty"] == "class_iii"
        assert browns["length_miles"] == 14.0
        assert browns["gradient_ft_per_mile"] == 28.0
        assert browns["flow_range_cfs"] == "800 - 2,200 CFS"
        assert browns["typical_duration_hours"] == 4.5
        assert len(browns["highlights"]) == 3

        # 404 for invalid run
        res2_404 = client.get("/api/river-sup/runs/invalid-river-reach")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Run calculation via REST endpoint
        # -------------------------------------------------------------------------
        # Approved setup: 75kg paddler + 5kg gear, 310L board, flexible fins, torso leash
        approved_req = {
            "run_id": "arkansas-river-browns-canyon",
            "paddler_weight_kg": 75.0,
            "gear_weight_kg": 5.0,
            "board_volume_liters": 310.0,
            "river_flow_cfs": 1500.0,
            "fin_type": "short_flexible_river_fins",
            "leash_type": "torso_quick_release",
        }
        res3_approved = client.post("/api/river-sup/calculate", json=approved_req)
        assert res3_approved.status_code == 200
        app_data = res3_approved.json()
        assert app_data["run_id"] == "arkansas-river-browns-canyon"
        assert app_data["total_payload_kg"] == 80.0
        assert app_data["volume_to_weight_ratio"] == 3.88
        assert app_data["safety_status"] == "approved"
        assert "Approved" in app_data["fin_clearance_status"]
        assert "Approved" in app_data["leash_safety_status"]
        assert app_data["stability_index_percent"] == 82

        # Prohibited setup 1: Ankle leash
        ankle_req = {
            "run_id": "white-salmon-husum",
            "paddler_weight_kg": 75.0,
            "gear_weight_kg": 5.0,
            "board_volume_liters": 310.0,
            "river_flow_cfs": 1500.0,
            "fin_type": "short_flexible_river_fins",
            "leash_type": "ankle_fixed_coiled",
        }
        res3_ankle = client.post("/api/river-sup/calculate", json=ankle_req)
        assert res3_ankle.status_code == 200
        ankle_data = res3_ankle.json()
        assert ankle_data["safety_status"] == "hazardous_prohibited"
        assert "PROHIBITED HAZARD" in ankle_data["leash_safety_status"]

        # Prohibited setup 2: Long touring fin
        fin_req = {
            "run_id": "french-broad-section-9",
            "paddler_weight_kg": 75.0,
            "gear_weight_kg": 5.0,
            "board_volume_liters": 310.0,
            "river_flow_cfs": 1500.0,
            "fin_type": "standard_long_touring_fin",
            "leash_type": "torso_quick_release",
        }
        res3_fin = client.post("/api/river-sup/calculate", json=fin_req)
        assert res3_fin.status_code == 200
        fin_data = res3_fin.json()
        assert fin_data["safety_status"] == "hazardous_prohibited"
        assert "Severe hazard" in fin_data["fin_clearance_status"]

        # 404 for invalid run
        res3_404 = client.post(
            "/api/river-sup/calculate",
            json={"run_id": "non-existent-run"},
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Retrieve gear checklist (GET /api/river-sup/gear)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/river-sup/gear")
        assert res4.status_code == 200
        gear_list = res4.json()
        assert len(gear_list) == 6
        assert all(g["mandatory"] is True for g in gear_list)
        gear_ids = [g["item_id"] for g in gear_list]
        assert "quick-release-torso-leash" in gear_ids
        assert "whitewater-certified-pfd" in gear_ids
        assert "drainage-water-helmet" in gear_ids
        assert "flexible-river-fins" in gear_ids
        assert "carbon-reinforced-river-paddle" in gear_ids
        assert "padded-neoprene-booties" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Test multi-turn conversational chat through create_response
        # -------------------------------------------------------------------------
        # Turn 1: Inquire about runs
        chat_req1 = {
            "question": "What are the Class IV river stand up paddleboarding runs?",
            "customer_id": "cust-river-sup-1",
        }
        res5_1 = client.post("/api/create_response", json=chat_req1)
        assert res5_1.status_code == 200
        data5_1 = res5_1.json()
        assert "river_sup_info" in data5_1
        assert data5_1["river_sup_info"]["action"] == "runs_list"
        assert "White Salmon" in data5_1["answer"] or "Soča" in data5_1["answer"]

        # Turn 2: Inquire about Browns Canyon detail
        chat_req2 = {
            "question": "Tell me about Browns Canyon SUP on the Arkansas River",
            "customer_id": "cust-river-sup-1",
        }
        res5_2 = client.post("/api/create_response", json=chat_req2)
        assert res5_2.status_code == 200
        data5_2 = res5_2.json()
        assert "river_sup_info" in data5_2
        assert data5_2["river_sup_info"]["action"] == "run_detail"
        assert data5_2["river_sup_info"]["run"]["run_id"] == "arkansas-river-browns-canyon"
        assert "Browns Canyon" in data5_2["answer"]

        # Turn 3: Inquire about ankle leash safety & board volume calculation
        chat_req3 = {
            "question": "What are the ankle leash dangers and river paddleboard volume for 75kg?",
            "customer_id": "cust-river-sup-1",
        }
        res5_3 = client.post("/api/create_response", json=chat_req3)
        assert res5_3.status_code == 200
        data5_3 = res5_3.json()
        assert "river_sup_info" in data5_3
        assert data5_3["river_sup_info"]["action"] == "river_sup_calculation"

        # -------------------------------------------------------------------------
        # Step 6: Test SSE streaming endpoint create_response/stream
        # -------------------------------------------------------------------------
        stream_req1 = {
            "question": "What is the mandatory whitewater PFD and gear kit for river SUP?",
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
            (e for e in parsed_events1 if e.get("event") in ("river_sup_gear", "river_sup_info")),
            None,
        )
        assert gear_event is not None
        assert "river_sup_info" in gear_event or "river_sup_gear" in gear_event

        # Streaming calculation inquiry
        stream_req2 = {
            "question": "Calculate river SUP volume for Browns Canyon with flexible river fins",
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
                if e.get("event") in ("river_sup_calculation", "river_sup_info")
            ),
            None,
        )
        assert calc_event is not None
