import json
from unittest.mock import patch

from contoso_chat.volunteer import reset_volunteer_state
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_trail_volunteer_and_stewardship_journey():
    """Multi-step API journey test for Trail Volunteer & Stewardship Tooling:

    Step 1: Inquire about trail volunteer workparties in the Cascades
            -> Assistant returns available projects, difficulties, and required tools.
    Step 2: Inquire about safety gear and tool certification for strenuous projects
            -> Assistant outlines PPE requirements (hardhat, boots, eye protection) and safety briefing.
    Step 3: Register for Mailbox Peak Drainage crew
            -> Confirmed registration with VOL- booking ID and meeting instructions.
    Step 4: Inquire about cumulative stewardship hours impact
            -> Assistant returns logged hours and miles maintained.
    """
    reset_volunteer_state()
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Inquire about trail volunteer workparties in the Cascades
        # -> Assistant returns available projects, difficulties, and required tools.
        # -------------------------------------------------------------------------
        res_step1 = client.post(
            "/api/create_response",
            json={"question": "How can I volunteer for trail work in the Cascades?"},
        )
        assert res_step1.status_code == 200
        data1 = res_step1.json()
        assert "volunteer_info" in data1
        vol_info_1 = data1["volunteer_info"]
        assert vol_info_1["action"] == "projects"
        assert "projects" in vol_info_1
        assert len(vol_info_1["projects"]) >= 2
        titles = [p["title"] for p in vol_info_1["projects"]]
        assert any("Mailbox Peak" in t for t in titles)
        assert any("Enchantments" in t or "Colchuck" in t for t in titles)

        # Verify difficulties and required tools are returned
        diffs = [p["difficulty"] for p in vol_info_1["projects"]]
        assert "Strenuous" in diffs
        mailbox_proj = next(p for p in vol_info_1["projects"] if p["project_id"] == "mailbox-drainage")
        assert "Pulaski" in mailbox_proj["required_tools"]
        assert "McLeod" in mailbox_proj["required_tools"]

        # Check REST projects endpoint with region filter
        rest_projects = client.get("/api/volunteer/projects?region=Cascades")
        assert rest_projects.status_code == 200
        cascades_projects = rest_projects.json()
        assert len(cascades_projects) >= 2
        assert all(p["region"] == "Cascades" for p in cascades_projects)

        # Check specific project REST endpoint
        rest_single = client.get("/api/volunteer/projects/mailbox-drainage")
        assert rest_single.status_code == 200
        assert rest_single.json()["project_id"] == "mailbox-drainage"
        assert "Rock Bar" in rest_single.json()["required_tools"]

        # Verify streaming response emits volunteer_info event
        stream_res1 = client.post(
            "/api/create_response/stream",
            json={"question": "Tell me about volunteer trail workparties in the Cascades"},
        )
        assert stream_res1.status_code == 200
        events1 = [
            json.loads(line.removeprefix("data: "))
            for line in stream_res1.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        vol_event1 = next((e for e in events1 if e.get("event") == "volunteer_info"), None)
        assert vol_event1 is not None
        assert vol_event1["volunteer_info"]["action"] == "projects"

        # -------------------------------------------------------------------------
        # Step 2: Inquire about safety gear and tool certification for strenuous projects
        # -> Assistant outlines PPE requirements (hardhat, boots, eye protection) and safety briefing.
        # -------------------------------------------------------------------------
        res_step2 = client.post(
            "/api/create_response",
            json={"question": "What safety gear and tool certification is required for strenuous projects?"},
        )
        assert res_step2.status_code == 200
        data2 = res_step2.json()
        assert "volunteer_info" in data2
        vol_info_2 = data2["volunteer_info"]
        assert vol_info_2["action"] == "safety"
        assert "Hardhat" in vol_info_2["provided_safety_gear"]
        assert "Safety Glasses" in vol_info_2["provided_safety_gear"]
        assert "Sturdy Work Boots" in vol_info_2["required_volunteer_gear"]

        answer2 = data2["answer"].lower()
        assert "hardhat" in answer2
        assert "boots" in answer2
        assert "eye protection" in answer2 or "glasses" in answer2
        assert "safety briefing" in answer2 or "briefing" in answer2

        # -------------------------------------------------------------------------
        # Step 3: Register for Mailbox Peak Drainage crew
        # -> Confirmed registration with VOL- booking ID and meeting instructions.
        # -------------------------------------------------------------------------
        reg_payload = {
            "project_id": "mailbox-drainage",
            "volunteer_name": "Jordan Romero",
            "volunteer_email": "jordan@example.com",
            "emergency_contact": "Paul Romero",
            "emergency_phone": "555-0177",
            "waiver_acknowledged": True,
        }
        res_step3 = client.post("/api/volunteer/register", json=reg_payload)
        assert res_step3.status_code == 200
        data3 = res_step3.json()
        assert data3["registration_id"].startswith("VOL-")
        assert data3["project_id"] == "mailbox-drainage"
        assert data3["project_title"] == "Mailbox Peak Drainage & Turnpike Restoration"
        assert data3["volunteer_name"] == "Jordan Romero"
        assert data3["status"] == "confirmed"
        assert "instructions" in data3
        inst = data3["instructions"].lower()
        assert "trailhead" in inst or "meeting" in inst or "date" in inst

        # Also verify via chat inquiry
        res_step3_chat = client.post(
            "/api/create_response",
            json={"question": "Sign me up for the Mailbox Peak trail crew"},
        )
        assert res_step3_chat.status_code == 200
        assert res_step3_chat.json()["volunteer_info"]["action"] == "register"

        # -------------------------------------------------------------------------
        # Step 4: Inquire about cumulative stewardship hours impact
        # -> Assistant returns logged hours and miles maintained.
        # -------------------------------------------------------------------------
        res_step4 = client.post(
            "/api/create_response",
            json={"question": "How many volunteer hours has Contoso logged for trail stewardship?"},
        )
        assert res_step4.status_code == 200
        data4 = res_step4.json()
        assert "volunteer_info" in data4
        vol_info_4 = data4["volunteer_info"]
        assert vol_info_4["action"] == "impact"
        impact_data = vol_info_4["impact"]
        assert impact_data["total_hours_logged"] >= 10000
        assert impact_data["trails_maintained_miles"] > 0
        assert impact_data["active_volunteers"] > 0

        answer4 = data4["answer"].lower()
        assert "14,250" in data4["answer"] or "14250" in data4["answer"]
        assert "miles" in answer4

        # Check REST impact endpoint
        rest_impact = client.get("/api/volunteer/impact")
        assert rest_impact.status_code == 200
        impact_rest = rest_impact.json()
        assert impact_rest["total_hours_logged"] == impact_data["total_hours_logged"]
        assert impact_rest["trails_maintained_miles"] == impact_data["trails_maintained_miles"]
