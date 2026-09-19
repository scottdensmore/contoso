import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_trailhead_shuttles_and_carpooling_journey():
    """Multi-step API journey test for Trailhead Shuttle & Rideshare Coordination Tooling:

    Step 1: Customer asks about trailhead shuttles for through-hiking -> Assistant returns available shuttle routes.
    Step 2: Customer requests a quote for 2 seats on Enchantments Connector -> Assistant returns calculated quote ($60) and departure times.
    Step 3: Customer books the shuttle for upcoming weekend -> Assistant confirms reservation with booking ID SHT-XXXXX.
    Step 4: Customer asks about community carpooling to Mount Rainier -> Assistant returns active carpool ride shares and explains posting options.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Customer asks about trailhead shuttles for through-hiking
        # -> Assistant returns available shuttle routes.
        # -------------------------------------------------------------------------
        res_step1 = client.post(
            "/api/create_response",
            json={"question": "What trailhead transit or shuttles are available for through-hiking without leaving two cars?"},
        )
        assert res_step1.status_code == 200
        data1 = res_step1.json()
        assert "shuttle_info" in data1
        shuttle_info_1 = data1["shuttle_info"]
        assert shuttle_info_1["action"] == "routes"
        assert "routes" in shuttle_info_1
        assert len(shuttle_info_1["routes"]) >= 1
        route_names = [r["name"] for r in shuttle_info_1["routes"]]
        assert any("Enchantments" in name for name in route_names)
        assert "two cars" in data1["answer"].lower() or "shuttle" in data1["answer"].lower()

        # Check REST routes endpoint
        routes_res = client.get("/api/shuttles/routes?connector_only=true")
        assert routes_res.status_code == 200
        connector_routes = routes_res.json()
        assert len(connector_routes) >= 1
        assert any(r["route_id"] == "enchantments-connector" for r in connector_routes)

        # Also verify streaming response emits shuttle_info event
        stream_res1 = client.post(
            "/api/create_response/stream",
            json={"question": "Tell me about trailhead shuttles for the Enchantments"},
        )
        assert stream_res1.status_code == 200
        events1 = [
            json.loads(line.removeprefix("data: "))
            for line in stream_res1.text.split("\n\n")
            if line.strip() and line.startswith("data: ") and line != "data: [DONE]"
        ]
        shuttle_event1 = next((e for e in events1 if e.get("event") == "shuttle_info"), None)
        assert shuttle_event1 is not None
        assert shuttle_event1["shuttle_info"]["action"] == "routes"

        # -------------------------------------------------------------------------
        # Step 2: Customer requests a quote for 2 seats on Enchantments Connector
        # -> Assistant returns calculated quote ($60) and departure times.
        # -------------------------------------------------------------------------
        res_step2 = client.post(
            "/api/create_response",
            json={"question": "How much does a quote for 2 seats on the enchantments connector cost?"},
        )
        assert res_step2.status_code == 200
        data2 = res_step2.json()
        assert "shuttle_info" in data2
        shuttle_info_2 = data2["shuttle_info"]
        assert shuttle_info_2["action"] == "quote"
        assert "quote" in shuttle_info_2
        quote_data = shuttle_info_2["quote"]
        assert quote_data["route_id"] == "enchantments-connector"
        assert quote_data["seats"] == 2
        assert quote_data["price_per_seat"] == 30.0
        assert quote_data["total_price"] == 60.0
        assert len(quote_data["departure_times"]) >= 4
        assert "05:30" in quote_data["departure_times"]
        assert "$60" in data2["answer"]

        # Verify dedicated REST quote endpoint
        rest_quote_res = client.post(
            "/api/shuttles/quote",
            json={"route_id": "enchantments-connector", "seats": 2},
        )
        assert rest_quote_res.status_code == 200
        rest_quote = rest_quote_res.json()
        assert rest_quote["total_price"] == 60.0
        assert rest_quote["seats"] == 2

        # -------------------------------------------------------------------------
        # Step 3: Customer books the shuttle for upcoming weekend
        # -> Assistant confirms reservation with booking ID SHT-XXXXX.
        # -------------------------------------------------------------------------
        booking_payload = {
            "route_id": "enchantments-connector",
            "departure_date": "2026-10-03",
            "departure_time": "06:30",
            "seats": 2,
            "passenger_name": "Taylor Swift",
            "passenger_email": "taylor.swift@example.com",
        }
        res_step3 = client.post("/api/shuttles/book", json=booking_payload)
        assert res_step3.status_code == 200
        data3 = res_step3.json()
        booking_id = data3["booking_id"]
        assert booking_id.startswith("SHT-")
        assert len(booking_id) >= 7
        assert data3["route_id"] == "enchantments-connector"
        assert data3["route_name"] == "Enchantments Through-Hike Connector"
        assert data3["departure_date"] == "2026-10-03"
        assert data3["departure_time"] == "06:30"
        assert data3["seats"] == 2
        assert data3["total_price"] == 60.0
        assert data3["status"] == "confirmed"
        assert "instructions" in data3
        assert "Snow Lakes Trailhead" in data3["instructions"]

        # -------------------------------------------------------------------------
        # Step 4: Customer asks about community carpooling to Mount Rainier
        # -> Assistant returns active carpool ride shares and explains posting options.
        # -------------------------------------------------------------------------
        res_step4 = client.post(
            "/api/create_response",
            json={"question": "Can I find a carpool to Mount Rainier?"},
        )
        assert res_step4.status_code == 200
        data4 = res_step4.json()
        assert "shuttle_info" in data4
        shuttle_info_4 = data4["shuttle_info"]
        assert shuttle_info_4["action"] == "carpool"
        assert "carpools" in shuttle_info_4
        assert len(shuttle_info_4["carpools"]) >= 1
        assert any("Rainier" in c["destination_trailhead"] for c in shuttle_info_4["carpools"])
        assert "carpool" in data4["answer"].lower()
        assert "post" in data4["answer"].lower() or "register" in data4["answer"].lower()

        # Verify carpool REST query
        carpools_res = client.get("/api/shuttles/carpools?destination=Rainier")
        assert carpools_res.status_code == 200
        rainier_carpools = carpools_res.json()
        assert len(rainier_carpools) >= 1
        assert all("Rainier".lower() in c["destination_trailhead"].lower() for c in rainier_carpools)

        # Register a new carpool offer from the customer
        new_carpool = {
            "origin_city": "Tacoma",
            "destination_trailhead": "Mount Rainier - Paradise",
            "departure_date": "2026-10-18",
            "seats_available": 3,
            "driver_name": "Taylor Swift",
            "contact_info": "taylor.swift@example.com",
            "notes": "Spacious SUV with national park annual pass. Happy to drive!",
        }
        res_new_carpool = client.post("/api/shuttles/carpools", json=new_carpool)
        assert res_new_carpool.status_code == 200
        created_cpl = res_new_carpool.json()
        assert created_cpl["carpool_id"].startswith("CPL-")
        assert created_cpl["origin_city"] == "Tacoma"
        assert created_cpl["destination_trailhead"] == "Mount Rainier - Paradise"
        assert created_cpl["seats_available"] == 3
        assert "created_at" in created_cpl

        # Verify newly created carpool is now included in listings
        all_carpools_res = client.get("/api/shuttles/carpools?destination=Rainier")
        assert all_carpools_res.status_code == 200
        updated_carpools = all_carpools_res.json()
        assert any(c["carpool_id"] == created_cpl["carpool_id"] for c in updated_carpools)
