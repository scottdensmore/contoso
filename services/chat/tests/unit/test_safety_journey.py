from unittest.mock import patch

from contoso_chat.safety import BEACON_STORE
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_wilderness_safety_and_emergency_protocols_journey():
    """Multi-step API journey test for Safety Beacon, Emergency Protocols & Avalanche Advisory:

    Step 1: Customer asks about satellite beacon check-in and emergency protocols -> Assistant returns available safety tooling and protocols.
    Step 2: Customer registers a Garmin inReach device for Cascade Range -> Assistant returns registration confirmation with registration ID.
    Step 3: Customer checks avalanche advisory for Cascades -> Returns danger rating, elevation band, and safety recommendations.
    Step 4: Customer asks for emergency protocol for hypothermia -> Assistant returns critical first-response steps and SAR signaling guidance.
    """
    BEACON_STORE.clear()
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Customer asks about satellite beacon check-in and emergency protocols
        # -> Assistant returns available safety tooling and protocols.
        # -------------------------------------------------------------------------
        res1 = client.post(
            "/api/create_response",
            json={"question": "Tell me about satellite beacon check-in and emergency protocols"},
        )
        assert res1.status_code == 200
        data1 = res1.json()
        assert "safety_info" in data1
        safety_info_1 = data1["safety_info"]
        assert safety_info_1["action"] in ["emergency_protocol", "checkin_beacon", "sar_procedure"]
        assert "available_protocols" in safety_info_1 or "protocol" in safety_info_1
        assert "safety" in data1["answer"].lower() or "protocol" in data1["answer"].lower()

        # -------------------------------------------------------------------------
        # Step 2: Customer registers a Garmin inReach device for Cascade Range
        # -> Assistant returns registration confirmation with registration ID.
        # -------------------------------------------------------------------------
        reg_payload = {
            "device_type": "garmin_inreach",
            "imei": "300434011223344",
            "owner_name": "Taylor Swift",
            "emergency_contact": "Andrea Swift",
            "emergency_phone": "555-019-4455",
            "trip_zone": "cascades",
            "return_date": "2026-10-15",
        }
        res2 = client.post("/api/safety/beacon/register", json=reg_payload)
        assert res2.status_code == 200
        data2 = res2.json()
        device_id = data2["device_id"]
        assert device_id.startswith("SBR-")
        assert data2["status"] == "ACTIVE_MONITORING"
        assert data2["trip_zone"] == "cascades"
        assert data2["owner_name"] == "Taylor Swift"
        assert "registered_at" in data2
        assert "instructions" in data2

        # Verify check-in ping with the registered device ID
        checkin_res = client.post(
            "/api/safety/beacon/checkin",
            json={
                "device_id": device_id,
                "status_message": "Stevens Pass trailhead departed, all systems OK",
                "coordinates": "47.7463,-121.0858",
            },
        )
        assert checkin_res.status_code == 200
        checkin_data = checkin_res.json()
        assert checkin_data["device_id"] == device_id
        assert checkin_data["status"] == "CHECKIN_CONFIRMED"

        # -------------------------------------------------------------------------
        # Step 3: Customer checks avalanche advisory for Cascades
        # -> Returns danger rating, elevation band, and safety recommendations.
        # -------------------------------------------------------------------------
        res3 = client.get("/api/safety/avalanche?zone=cascades")
        assert res3.status_code == 200
        data3 = res3.json()
        assert isinstance(data3, list)
        assert len(data3) == 1
        cascades_adv = data3[0]
        assert cascades_adv["zone"] == "cascades"
        assert cascades_adv["danger_rating"] == "Considerable"
        assert "5,000" in cascades_adv["elevation_band"]
        assert "Wind Slab" in cascades_adv["primary_hazard"]
        assert len(cascades_adv["recommended_actions"]) >= 3

        # Also verify via chat query in mock mode
        chat_res_3 = client.post(
            "/api/create_response",
            json={"question": "What is the avalanche advisory for Cascades?"},
        )
        assert chat_res_3.status_code == 200
        chat_data_3 = chat_res_3.json()
        assert "safety_info" in chat_data_3
        assert chat_data_3["safety_info"]["action"] == "avalanche_advisory"
        assert "Considerable" in chat_data_3["answer"]

        # -------------------------------------------------------------------------
        # Step 4: Customer asks for emergency protocol for hypothermia
        # -> Assistant returns critical first-response steps and SAR signaling guidance.
        # -------------------------------------------------------------------------
        res4 = client.get("/api/safety/protocols/hypothermia")
        assert res4.status_code == 200
        data4 = res4.json()
        assert data4["incident_type"] == "hypothermia"
        assert data4["severity"] == "CRITICAL"
        assert any("Dry clothing" in step for step in data4["first_response_steps"])
        assert any("sleeping bag" in step.lower() for step in data4["first_response_steps"])
        assert any("SOS" in sig for sig in data4["sar_signaling_instructions"])
        assert len(data4["precautions"]) >= 2

        # Also verify via chat query
        chat_res_4 = client.post(
            "/api/create_response",
            json={"question": "What is the emergency protocol for hypothermia?"},
        )
        assert chat_res_4.status_code == 200
        chat_data_4 = chat_res_4.json()
        assert "safety_info" in chat_data_4
        assert chat_data_4["safety_info"]["action"] == "emergency_protocol"
        assert "Dry clothing" in chat_data_4["answer"]
