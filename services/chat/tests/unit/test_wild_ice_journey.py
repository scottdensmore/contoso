import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def _step1_venues():
    res1 = client.get("/wild-ice/venues")
    if res1.status_code == 404:
        res1 = client.get("/api/wild-ice/venues")
    assert res1.status_code == 200
    venues = res1.json()
    assert len(venues) == 5
    venue_ids = [v["venue_id"] for v in venues]
    for expected in [
        "lake-malaren-archipelago",
        "lake-siljan-dalarna",
        "lake-baikal-olkhon",
        "lake-moraine-banff",
        "lake-superior-chequamegon",
    ]:
        assert expected in venue_ids

    res1_black = client.get("/wild-ice/venues?ice_type=black_ice")
    if res1_black.status_code == 404:
        res1_black = client.get("/api/wild-ice/venues?ice_type=black_ice")
    assert res1_black.status_code == 200
    assert len(res1_black.json()) == 4

    res1_white = client.get("/wild-ice/venues?ice_type=white_snow_ice")
    if res1_white.status_code == 404:
        res1_white = client.get("/api/wild-ice/venues?ice_type=white_snow_ice")
    assert res1_white.status_code == 200
    assert len(res1_white.json()) == 1


def _step2_venue_detail():
    res2 = client.get("/wild-ice/venues/lake-malaren-archipelago")
    if res2.status_code == 404:
        res2 = client.get("/api/wild-ice/venues/lake-malaren-archipelago")
    assert res2.status_code == 200
    malaren = res2.json()
    assert malaren["venue_id"] == "lake-malaren-archipelago"
    assert "Mälaren" in malaren["title"]

    res_404 = client.get("/wild-ice/venues/nonexistent-circuit")
    if res_404.status_code != 404:
        res_404 = client.get("/api/wild-ice/venues/nonexistent-circuit")
    assert res_404.status_code == 404


def _step3_calculation():
    payload = {
        "venue_id": "lake-malaren-archipelago",
        "ice_type": "black_ice",
        "thickness_cm": 8.0,
        "skater_weight_lbs": 180.0,
        "ambient_temp_f": 22.0,
    }
    res3 = client.post("/wild-ice/calculate", json=payload)
    if res3.status_code == 404:
        res3 = client.post("/api/wild-ice/calculate", json=payload)
    assert res3.status_code == 200
    calc_data = res3.json()
    assert calc_data["venue_id"] == "lake-malaren-archipelago"
    assert calc_data["effective_thickness_cm"] == 8.0
    assert calc_data["safe_load_capacity_lbs"] == 3200
    assert calc_data["acoustic_resonance_hz"] == 424
    assert calc_data["safety_status"] == "safe_touring_window"


def _step4_gear():
    res4 = client.get("/wild-ice/gear")
    if res4.status_code == 404:
        res4 = client.get("/api/wild-ice/gear")
    assert res4.status_code == 200
    gear_list = res4.json()
    assert len(gear_list) == 6
    gear_ids = [g["item_id"] for g in gear_list]
    for item in [
        "neck-worn-ice-claws",
        "nordic-ice-pike-staff",
        "buoyant-skate-backpack",
        "throw-rescue-lifeline",
        "heel-free-nordic-blades",
        "sealed-dry-change-kit",
    ]:
        assert item in gear_ids


def _step5_chat_response():
    req = {
        "question": "Bearing capacity and singing ice resonance Lake Siljan",
        "customer_id": "cust-skater-01",
    }
    res5 = client.post("/api/create_response", json=req)
    assert res5.status_code == 200
    data5 = res5.json()
    assert "wild_ice_info" in data5
    assert data5["wild_ice_info"] is not None
    assert "Siljan" in data5["answer"] or "Lake" in data5["answer"]


def _step6_chat_stream():
    res6 = client.post(
        "/api/create_response/stream",
        json={"question": "Tell me about wild ice touring Lake Malaren"},
    )
    assert res6.status_code == 200
    events = [
        json.loads(line.removeprefix("data: "))
        for line in res6.text.split("\n\n")
        if line.startswith("data: ") and line != "data: [DONE]"
    ]
    wi_event = next(
        (
            e for e in events
            if e.get("event") in (
                "wild_ice_info",
                "wild_ice_venue_detail",
                "wild_ice_venues",
            )
        ),
        None,
    )
    assert wi_event is not None


def test_wild_ice_journey():
    """Multi-step API journey test for Wild Ice Tooling."""
    with patch("main.REAL_CHAT_AVAILABLE", False):
        _step1_venues()
        _step2_venue_detail()
        _step3_calculation()
        _step4_gear()
        _step5_chat_response()
        _step6_chat_stream()
