import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_alpine_huts_and_gear_booking_journey():
    """Multi-step API journey test for Backcountry Alpine Hut Availability & Gear Tooling:

    Step 1: Inquire about alpine huts in Cascades -> Assistant returns refuge options, elevations, and mandatory gear.
    Step 2: Request quote for 2 guests, 2 nights at Asgard Pass Refuge -> Assistant returns $180 total quote and amenities.
    Step 3: Book the refuge for upcoming expedition -> Confirmed reservation with HUT- booking ID and access directions.
    Step 4: Inquire about mandatory gear requirements and hut rules -> Assistant explains sleeping bag liner, microspikes, and pack-it-out rules.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Inquire about alpine huts in Cascades
        # -> Assistant returns refuge options, elevations, and mandatory gear.
        # -------------------------------------------------------------------------
        res_step1 = client.post(
            "/api/create_response",
            json={"question": "What backcountry alpine huts and shelters are available in the Cascades?"},
        )
        assert res_step1.status_code == 200
        data1 = res_step1.json()
        assert "hut_info" in data1
        hut_info_1 = data1["hut_info"]
        assert hut_info_1["action"] == "huts"
        assert "huts" in hut_info_1
        assert len(hut_info_1["huts"]) >= 1
        hut_names = [h["name"] for h in hut_info_1["huts"]]
        assert any("Asgard Pass" in name for name in hut_names)
        assert "7,850" in data1["answer"] or "7850" in data1["answer"]
        assert "microspikes" in data1["answer"].lower() or "sleeping bag liner" in data1["answer"].lower()

        # Check REST huts endpoint with range filter
        rest_huts = client.get("/api/huts?range=cascades")
        assert rest_huts.status_code == 200
        cascades_huts = rest_huts.json()
        assert len(cascades_huts) >= 1
        assert any(h["hut_id"] == "asgard-refuge" for h in cascades_huts)

        # Check specific hut REST endpoint
        rest_single_hut = client.get("/api/huts/asgard-refuge")
        assert rest_single_hut.status_code == 200
        assert rest_single_hut.json()["elevation_feet"] == 7850

        # Also verify streaming response emits hut_info event
        stream_res1 = client.post(
            "/api/create_response/stream",
            json={"question": "Tell me about alpine huts in the Cascades"},
        )
        assert stream_res1.status_code == 200
        events1 = [
            json.loads(line.removeprefix("data: "))
            for line in stream_res1.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        hut_event1 = next((e for e in events1 if e.get("event") == "hut_info"), None)
        assert hut_event1 is not None
        assert hut_event1["hut_info"]["action"] == "huts"

        # -------------------------------------------------------------------------
        # Step 2: Request quote for 2 guests, 2 nights at Asgard Pass Refuge
        # -> Assistant returns $180 total quote and amenities.
        # -------------------------------------------------------------------------
        res_step2 = client.post(
            "/api/create_response",
            json={"question": "Price quote for 2 bunks for 2 nights at Asgard Pass refuge"},
        )
        assert res_step2.status_code == 200
        data2 = res_step2.json()
        assert "hut_info" in data2
        hut_info_2 = data2["hut_info"]
        assert hut_info_2["action"] == "quote"
        assert "quote" in hut_info_2
        quote_data = hut_info_2["quote"]
        assert quote_data["hut_id"] == "asgard-refuge"
        assert quote_data["nights"] == 2
        assert quote_data["guests"] == 2
        assert quote_data["price_per_night"] == 45.0
        assert quote_data["total_price"] == 180.0
        assert "Wood Stove" in quote_data["amenities"]
        assert "$180" in data2["answer"]

        # Check REST quote endpoint
        rest_quote = client.post(
            "/api/huts/quote",
            json={"hut_id": "asgard-refuge", "nights": 2, "guests": 2},
        )
        assert rest_quote.status_code == 200
        quote_json = rest_quote.json()
        assert quote_json["total_price"] == 180.0
        assert quote_json["nights"] == 2
        assert quote_json["guests"] == 2
        assert "Wood Stove" in quote_json["amenities"]

        # -------------------------------------------------------------------------
        # Step 3: Book the refuge for upcoming expedition
        # -> Confirmed reservation with HUT- booking ID and access directions.
        # -------------------------------------------------------------------------
        booking_payload = {
            "hut_id": "asgard-refuge",
            "checkin_date": "2026-10-15",
            "nights": 2,
            "guests": 2,
            "guest_name": "Jordan Romero",
            "guest_email": "jordan@example.com",
        }
        res_step3 = client.post("/api/huts/book", json=booking_payload)
        assert res_step3.status_code == 200
        data3 = res_step3.json()
        assert data3["booking_id"].startswith("HUT-")
        assert data3["hut_id"] == "asgard-refuge"
        assert data3["hut_name"] == "Asgard Pass High Alpine Refuge"
        assert data3["checkin_date"] == "2026-10-15"
        assert data3["nights"] == 2
        assert data3["guests"] == 2
        assert data3["total_price"] == 180.0
        assert data3["status"] == "confirmed"
        assert "instructions" in data3
        assert "trailhead" in data3["instructions"].lower() or "trail" in data3["instructions"].lower()

        # -------------------------------------------------------------------------
        # Step 4: Inquire about mandatory gear requirements and hut rules
        # -> Assistant explains sleeping bag liner, microspikes, and pack-it-out rules.
        # -------------------------------------------------------------------------
        res_step4 = client.post(
            "/api/create_response",
            json={"question": "What mandatory gear and hut rules apply to Asgard Pass refuge?"},
        )
        assert res_step4.status_code == 200
        data4 = res_step4.json()
        assert "hut_info" in data4
        hut_info_4 = data4["hut_info"]
        assert hut_info_4["action"] in ["gear", "rules"]
        answer4 = data4["answer"].lower()
        assert "sleeping bag liner" in answer4
        assert "microspikes" in answer4
        assert "pack-it-out" in answer4 or "pack it out" in answer4 or "leave-no-trace" in answer4 or "leave no trace" in answer4
