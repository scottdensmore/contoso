import json
from unittest.mock import patch

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def _step1_groves():
    res1 = client.get("/tree-climbing/groves")
    if res1.status_code == 404:
        res1 = client.get("/api/tree-climbing/groves")
    assert res1.status_code == 200
    groves = res1.json()
    assert len(groves) == 5
    grove_ids = [g["grove_id"] for g in groves]
    for expected in [
        "redwood-canopy-prairie-creek",
        "olympic-rainforest-sitka",
        "sequoia-giant-forest",
        "appalachian-white-oak",
        "tasmanian-tarkine-eucalyptus",
    ]:
        assert expected in grove_ids

    res1_srt = client.get("/tree-climbing/groves?climbing_system=SRT")
    if res1_srt.status_code == 404:
        res1_srt = client.get("/api/tree-climbing/groves?climbing_system=SRT")
    assert res1_srt.status_code == 200
    assert len(res1_srt.json()) == 4

    res1_mrt = client.get("/tree-climbing/groves?climbing_system=MRT_DRT")
    if res1_mrt.status_code == 404:
        res1_mrt = client.get("/api/tree-climbing/groves?climbing_system=MRT_DRT")
    assert res1_mrt.status_code == 200
    assert len(res1_mrt.json()) == 1


def _step2_grove_detail():
    res2 = client.get("/tree-climbing/groves/redwood-canopy-prairie-creek")
    if res2.status_code == 404:
        res2 = client.get("/api/tree-climbing/groves/redwood-canopy-prairie-creek")
    assert res2.status_code == 200
    redwood = res2.json()
    assert redwood["grove_id"] == "redwood-canopy-prairie-creek"
    assert "Prairie Creek" in redwood["title"]
    assert redwood["canopy_height_m"] == 92

    res_404 = client.get("/tree-climbing/groves/nonexistent-grove")
    if res_404.status_code != 404:
        res_404 = client.get("/api/tree-climbing/groves/nonexistent-grove")
    assert res_404.status_code == 404


def _step3_calculation():
    payload = {
        "grove_id": "redwood-canopy-prairie-creek",
        "climbing_system": "SRT",
        "anchor_style": "basal_anchor",
        "climber_weight_lbs": 190.0,
        "branch_diameter_cm": 22.0,
    }
    res3 = client.post("/tree-climbing/calculate", json=payload)
    if res3.status_code == 404:
        res3 = client.post("/api/tree-climbing/calculate", json=payload)
    assert res3.status_code == 200
    calc_data = res3.json()
    assert calc_data["grove_id"] == "redwood-canopy-prairie-creek"
    assert calc_data["peak_fork_load_lbs"] == 456
    assert calc_data["peak_fork_load_kn"] == 2.03
    assert calc_data["limb_safety_ratio"] == 2.15
    assert calc_data["safety_status"] == "approved_cambium_saver_required"


def _step4_gear():
    res4 = client.get("/tree-climbing/gear")
    if res4.status_code == 404:
        res4 = client.get("/api/tree-climbing/gear")
    assert res4.status_code == 200
    gear_list = res4.json()
    assert len(gear_list) == 6
    gear_ids = [g["item_id"] for g in gear_list]
    for item in [
        "cambium-saver-conduit",
        "arborist-throwline-kit",
        "high-tensile-static-rope",
        "tree-climbing-saddle",
        "mechanical-friction-ascender",
        "canopy-suspension-helmet",
    ]:
        assert item in gear_ids


def _step5_chat_response():
    req = {
        "question": "What is the basal anchor load and limb safety ratio for Prairie Creek redwoods climbing?",
        "customer_id": "cust-arborist-01",
    }
    res5 = client.post("/api/create_response", json=req)
    assert res5.status_code == 200
    data5 = res5.json()
    assert "tree_climbing_info" in data5
    assert data5["tree_climbing_info"] is not None
    assert (
        "Prairie Creek" in data5["answer"]
        or "fork load" in data5["answer"].lower()
        or "456" in data5["answer"]
    )


def _step6_chat_stream():
    res6 = client.post(
        "/api/create_response/stream",
        json={"question": "Tell me about Prairie Creek redwood canopy climbing expedition"},
    )
    assert res6.status_code == 200
    events = [
        json.loads(line.removeprefix("data: "))
        for line in res6.text.split("\n\n")
        if line.startswith("data: ") and line != "data: [DONE]"
    ]
    tc_event = next(
        (
            e
            for e in events
            if e.get("event")
            in (
                "tree_climbing_info",
                "canopy_grove_detail",
                "canopy_groves",
                "tree_climbing_calculation",
            )
        ),
        None,
    )
    assert tc_event is not None


def test_tree_climbing_journey():
    """Multi-step API journey test for Backcountry Tree Climbing Tooling."""
    with patch("main.REAL_CHAT_AVAILABLE", False):
        _step1_groves()
        _step2_grove_detail()
        _step3_calculation()
        _step4_gear()
        _step5_chat_response()
        _step6_chat_stream()
