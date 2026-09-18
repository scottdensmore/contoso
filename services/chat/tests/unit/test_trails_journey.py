import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_complete_trails_conditions_and_outfitting_journey():
    """End-to-end API journey test for trail conditions & outfitting advisor tooling:

    Step 1: Inquire about popular hiking trails and conditions -> Assistant returns trail
            options with status and temps (plus REST catalog verification).
    Step 2: Inquire specifically about Rattlesnake Ridge status and weather -> Assistant
            reports Open status, 58°F, and essential gear.
    Step 3: Request an outfitting packing checklist for a spring day hike -> Assistant
            generates tailored 10-essentials checklist and weather layers.
    Step 4: Ask about safety precautions for wet/slick conditions (Multnomah Falls) -> Assistant
            provides safety advisory and grip footwear recommendation.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Inquire about popular hiking trails and conditions
        # -------------------------------------------------------------------------
        # 1a. REST endpoint GET /api/trails
        trails_res = client.get("/api/trails")
        assert trails_res.status_code == 200
        catalog = trails_res.json()
        assert len(catalog) == 4
        trail_names = [t["name"] for t in catalog]
        assert "Rattlesnake Ridge Trail" in trail_names
        assert "Bear Peak Summit" in trail_names
        assert "Multnomah-Wahkeena Loop" in trail_names
        assert "Mount Olympus Trail" in trail_names

        # 1b. Chat inquiry about popular hiking trails and conditions
        chat_res_1 = client.post(
            "/api/create_response",
            json={"question": "What are some popular hiking trails and their conditions?"},
        )
        assert chat_res_1.status_code == 200
        data_1 = chat_res_1.json()
        assert "trail_outfitting" in data_1
        assert "answer" in data_1

        trail_info_1 = data_1["trail_outfitting"]
        assert trail_info_1["trails"] is not None
        assert len(trail_info_1["trails"]) == 4

        # Verify trail options with status and temps are returned in answer
        answer_1 = data_1["answer"]
        assert "Rattlesnake Ridge" in answer_1
        assert "58°F" in answer_1
        assert "Bear Peak" in answer_1
        assert "45°F" in answer_1
        assert "Multnomah" in answer_1
        assert "54°F" in answer_1
        assert "Mount Olympus" in answer_1
        assert "62°F" in answer_1

        # 1c. Verify SSE stream emits trail_outfitting event for general trails query
        stream_res_1 = client.post(
            "/api/create_response/stream",
            json={"question": "What are some popular hiking trails and their conditions?"},
        )
        assert stream_res_1.status_code == 200
        events_1 = [
            json.loads(line.removeprefix("data: "))
            for line in stream_res_1.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        trail_event_1 = next((e for e in events_1 if e.get("event") == "trail_outfitting"), None)
        assert trail_event_1 is not None
        assert trail_event_1["trail_outfitting"]["trails"] is not None

        # -------------------------------------------------------------------------
        # Step 2: Inquire specifically about Rattlesnake Ridge status and weather
        # -------------------------------------------------------------------------
        chat_res_2 = client.post(
            "/api/create_response",
            json={"question": "What is the status and weather on Rattlesnake Ridge?"},
        )
        assert chat_res_2.status_code == 200
        data_2 = chat_res_2.json()
        assert "trail_outfitting" in data_2

        trail_info_2 = data_2["trail_outfitting"]
        assert trail_info_2["trail"] is not None
        assert trail_info_2["trail"]["id"] == "rattlesnake-ridge"
        assert trail_info_2["trail"]["status"] == "open"
        assert trail_info_2["trail"]["temperature_f"] == 58
        assert "Trekking poles" in trail_info_2["trail"]["essential_gear"]

        # Assistant reports Open status, 58°F, and essential gear
        answer_2 = data_2["answer"]
        assert "Rattlesnake Ridge" in answer_2
        assert "Open" in answer_2 or "OPEN" in answer_2
        assert "58°F" in answer_2
        assert "Trekking poles" in answer_2
        assert "Trail running shoes" in answer_2

        # Verify streaming for Step 2
        stream_res_2 = client.post(
            "/api/create_response/stream",
            json={"question": "What is the status and weather on Rattlesnake Ridge?"},
        )
        assert stream_res_2.status_code == 200
        events_2 = [
            json.loads(line.removeprefix("data: "))
            for line in stream_res_2.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        trail_event_2 = next((e for e in events_2 if e.get("event") == "trail_outfitting"), None)
        assert trail_event_2 is not None
        assert trail_event_2["trail_outfitting"]["trail"]["id"] == "rattlesnake-ridge"

        # -------------------------------------------------------------------------
        # Step 3: Request an outfitting packing checklist for a spring day hike
        # -------------------------------------------------------------------------
        # 3a. Direct REST endpoint POST /api/trails/outfitting
        rest_outfit_res = client.post(
            "/api/trails/outfitting",
            json={"activity": "day-hiking", "season": "spring"},
        )
        assert rest_outfit_res.status_code == 200
        rest_outfit_data = rest_outfit_res.json()
        assert rest_outfit_data["activity"] == "day-hiking"
        assert rest_outfit_data["season"] == "spring"
        assert len(rest_outfit_data["gear_checklist"]) >= 10
        checklist_text = " ".join(rest_outfit_data["gear_checklist"]).lower()
        assert "navigation" in checklist_text or "map" in checklist_text
        assert "first aid" in checklist_text
        assert "layer" in checklist_text or "shell" in checklist_text

        # 3b. Chat inquiry for packing checklist
        chat_res_3 = client.post(
            "/api/create_response",
            json={"question": "Request an outfitting packing checklist for a spring day hike"},
        )
        assert chat_res_3.status_code == 200
        data_3 = chat_res_3.json()
        assert "trail_outfitting" in data_3
        trail_info_3 = data_3["trail_outfitting"]
        assert trail_info_3["action"] == "outfitting"
        assert trail_info_3["season"] == "spring"
        assert trail_info_3["activity"] == "day-hiking"

        gear_items = " ".join(trail_info_3["gear_checklist"]).lower()
        assert "navigation" in gear_items or "map" in gear_items
        assert "first aid" in gear_items
        assert "headlamp" in gear_items or "flashlight" in gear_items
        assert "hydration" in gear_items or "water" in gear_items
        assert "base layer" in gear_items or "fleece" in gear_items or "shell" in gear_items

        answer_3 = data_3["answer"]
        assert "10 Essentials" in answer_3 or "Essentials" in answer_3 or "checklist" in answer_3.lower()
        assert "spring" in answer_3.lower()

        # -------------------------------------------------------------------------
        # Step 4: Ask about safety precautions for wet/slick conditions (Multnomah Falls)
        # -------------------------------------------------------------------------
        chat_res_4 = client.post(
            "/api/create_response",
            json={
                "question": "What safety precautions should I take for wet/slick conditions on Multnomah Falls trail?"
            },
        )
        assert chat_res_4.status_code == 200
        data_4 = chat_res_4.json()
        assert "trail_outfitting" in data_4

        trail_info_4 = data_4["trail_outfitting"]
        assert trail_info_4["action"] == "safety"
        assert trail_info_4["trail"]["id"] == "multnomah-loop"
        assert trail_info_4["trail"]["status"] == "caution"

        # Assistant provides safety advisory and grip footwear recommendation
        answer_4 = data_4["answer"]
        assert "Multnomah" in answer_4
        assert "Caution" in answer_4 or "CAUTION" in answer_4
        assert "Slick rock surfaces near waterfalls spray" in answer_4 or "slick" in answer_4.lower()
        assert "traction" in answer_4.lower() or "grip" in answer_4.lower()

        # Verify safety tips and checklist in structured payload
        tips_4 = " ".join(trail_info_4["safety_tips"]).lower()
        assert "slick" in tips_4 or "spray" in tips_4 or "traction" in tips_4
        assert any("traction" in g.lower() or "grip" in g.lower() for g in trail_info_4["gear_checklist"])

        # 4b. Verify streaming for Step 4
        stream_res_4 = client.post(
            "/api/create_response/stream",
            json={
                "question": "What safety precautions should I take for wet/slick conditions on Multnomah Falls trail?"
            },
        )
        assert stream_res_4.status_code == 200
        events_4 = [
            json.loads(line.removeprefix("data: "))
            for line in stream_res_4.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        trail_event_4 = next((e for e in events_4 if e.get("event") == "trail_outfitting"), None)
        assert trail_event_4 is not None
        assert trail_event_4["trail_outfitting"]["action"] == "safety"
        assert trail_event_4["trail_outfitting"]["trail"]["id"] == "multnomah-loop"
