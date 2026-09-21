import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_fly_fishing_journey():
    """Multi-step API journey test for Mountain Angling & Hatch Tooling:

    Step 1: Query fishing locations with filter (GET /api/fly-fishing/locations).
    Step 2: Query specific location detail (GET /api/fly-fishing/locations/upper-yakima-canyon).
    Step 3: Calculate fly match with high temp & thermal warning (POST /api/fly-fishing/fly-match).
    Step 4: Query gear and conservation regulations (GET /api/fly-fishing/gear-regulations).
    Step 5: Post chat query to create_response and verify fly_fishing_info metadata.
    Step 6: Post chat query to create_response/stream and assert SSE event fly_fishing_info.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query fishing locations with filter (GET /api/fly-fishing/locations)
        # -------------------------------------------------------------------------
        res1 = client.get("/api/fly-fishing/locations")
        assert res1.status_code == 200
        locations = res1.json()
        assert len(locations) == 5
        loc_ids = [loc["location_id"] for loc in locations]
        assert "upper-yakima-canyon" in loc_ids
        assert "enchantment-crystal-lakes" in loc_ids
        assert "deschutes-warm-springs" in loc_ids
        assert "metolius-headwaters" in loc_ids
        assert "snake-river-grand-teton" in loc_ids

        # Filter by water_type
        res1_wt = client.get("/api/fly-fishing/locations?water_type=freestone_river")
        assert res1_wt.status_code == 200
        freestone_locs = res1_wt.json()
        assert len(freestone_locs) == 2
        freestone_ids = [loc["location_id"] for loc in freestone_locs]
        assert "upper-yakima-canyon" in freestone_ids
        assert "snake-river-grand-teton" in freestone_ids

        # Filter by state
        res1_st = client.get("/api/fly-fishing/locations?state=OR")
        assert res1_st.status_code == 200
        or_locs = res1_st.json()
        assert len(or_locs) == 2
        or_ids = [loc["location_id"] for loc in or_locs]
        assert "deschutes-warm-springs" in or_ids
        assert "metolius-headwaters" in or_ids

        # -------------------------------------------------------------------------
        # Step 2: Query specific location detail (GET /api/fly-fishing/locations/{id})
        # -------------------------------------------------------------------------
        res2 = client.get("/api/fly-fishing/locations/upper-yakima-canyon")
        assert res2.status_code == 200
        yakima = res2.json()
        assert yakima["location_id"] == "upper-yakima-canyon"
        assert yakima["name"] == "Upper Yakima River Canyon"
        assert yakima["state"] == "WA"
        assert yakima["recommended_rod_wt"] == 5
        assert yakima["recommended_tippet"] == "9ft 4X"
        assert yakima["catch_and_release"] is True
        assert yakima["barbless_required"] is True
        assert "Single barbless hooks required" in yakima["regulations"]

        # 404 for unknown location
        res2_404 = client.get("/api/fly-fishing/locations/unknown-stream")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Calculate fly match with high temp & thermal warning
        # -------------------------------------------------------------------------
        match_req = {
            "location_id": "upper-yakima-canyon",
            "water_temp_f": 67.5,
            "time_of_day": "afternoon",
            "surface_activity": "rising",
        }
        res3 = client.post("/api/fly-fishing/fly-match", json=match_req)
        assert res3.status_code == 200
        match_data = res3.json()
        assert match_data["location_id"] == "upper-yakima-canyon"
        assert match_data["location_name"] == "Upper Yakima River Canyon"
        assert match_data["fish_activity"] == "low"
        assert match_data["thermal_warning"] is not None
        assert (
            match_data["thermal_warning"]
            == "Hoot Owl Alert: Water temperature exceeds 65°F. Cease fishing during afternoon hours to protect native trout from thermal stress."
        )
        assert len(match_data["regulations_summary"]) >= 2

        # 404 for unknown location in fly-match
        res3_404 = client.post("/api/fly-fishing/fly-match", json={"location_id": "unknown-creek"})
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Query gear and conservation regulations
        # -------------------------------------------------------------------------
        res4 = client.get("/api/fly-fishing/gear-regulations")
        assert res4.status_code == 200
        gear_reg_data = res4.json()
        assert "gear" in gear_reg_data
        assert len(gear_reg_data["gear"]) == 6
        gear_ids = [g["item_id"] for g in gear_reg_data["gear"]]
        assert "barbless-fly-box" in gear_ids
        assert "rubber-mesh-net" in gear_ids
        assert "barbless_rules" in gear_reg_data or "regulations" in gear_reg_data

        # -------------------------------------------------------------------------
        # Step 5: Post chat query to create_response and verify fly_fishing_info
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What fly should I use for trout fishing at Upper Yakima River with water temp at 56 degrees?",
            "customer_id": "cust-fly-101",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "fly_fishing_info" in data5
        ff_info = data5["fly_fishing_info"]
        assert ff_info is not None
        assert ff_info["location_id"] == "upper-yakima-canyon"
        assert "Upper Yakima" in data5["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Post chat query to create_response/stream and assert SSE event
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "What fly should I use for trout fishing at Upper Yakima River with water temp at 56 degrees?"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        ff_event = next((e for e in parsed_events if e.get("event") == "fly_fishing_info"), None)
        assert ff_event is not None
        assert "fly_fishing_info" in ff_event
        stream_ff_info = ff_event["fly_fishing_info"]
        assert stream_ff_info is not None
        assert stream_ff_info["location_id"] == "upper-yakima-canyon"

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Upper Yakima" in full_text


@pytest.mark.anyio
async def test_fly_fishing_journey_real_mode_execution():
    """Step 7: Verifies fly fishing prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Alex", "membership": "Gold", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="On the Upper Yakima River, match the salmonfly hatch with a Chubby Chernobyl on 4X tippet."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What fly should I use for trout fishing at Upper Yakima River with water temp at 56 degrees?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "fly_fishing_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "fly_fishing_prompt" in call_kwargs
        assert "Upper Yakima" in call_kwargs["fly_fishing_prompt"]
