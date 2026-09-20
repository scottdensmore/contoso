import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_wildlife_journey():
    """Multi-step API journey test for Backcountry Wildlife & Bear Country Safety Tooling:

    Step 1: Query wildlife species list (GET /api/wildlife/species).
    Step 2: Query specific species detail (GET /api/wildlife/species/grizzly-bear).
    Step 3: Run encounter safety assessment (POST /api/wildlife/encounter-assess) for close proximity Grizzly encounter.
    Step 4: Retrieve food storage and bear canister guidelines (GET /api/wildlife/food-storage).
    Step 5: Test chat query via create_response verifying wildlife_info metadata.
    Step 6: Test SSE streaming via create_response_stream asserting wildlife_info event.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query wildlife species list (GET /api/wildlife/species)
        # -------------------------------------------------------------------------
        res1 = client.get("/api/wildlife/species")
        assert res1.status_code == 200
        species = res1.json()
        assert len(species) == 5
        s_ids = [s["species_id"] for s in species]
        assert "grizzly-bear" in s_ids
        assert "black-bear" in s_ids
        assert "cougar" in s_ids
        assert "moose" in s_ids
        assert "western-rattlesnake" in s_ids

        # Filter by category
        res1_cat = client.get("/api/wildlife/species?category=carnivore")
        assert res1_cat.status_code == 200
        carnivores = res1_cat.json()
        assert len(carnivores) == 3
        assert all(c["category"] == "carnivore" for c in carnivores)

        # -------------------------------------------------------------------------
        # Step 2: Query specific species detail (GET /api/wildlife/species/grizzly-bear)
        # -------------------------------------------------------------------------
        res2 = client.get("/api/wildlife/species/grizzly-bear")
        assert res2.status_code == 200
        grizzly = res2.json()
        assert grizzly["species_id"] == "grizzly-bear"
        assert grizzly["common_name"] == "Grizzly Bear"
        assert "Ursus arctos" in grizzly["scientific_name"]
        assert grizzly["category"] == "carnivore"
        assert grizzly["safe_distance_yards"] == 100
        assert grizzly["bear_specific_traits"] is not None
        assert grizzly["bear_specific_traits"]["shoulder_hump"] is True
        assert len(grizzly["key_traits"]) >= 3
        assert len(grizzly["habitats"]) >= 2
        assert grizzly["encounter_protocol"]

        # 404 for unknown species
        res2_404 = client.get("/api/wildlife/species/unknown-animal-xyz")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Run encounter safety assessment (POST /api/wildlife/encounter-assess)
        # -------------------------------------------------------------------------
        encounter_payload = {
            "species_id": "grizzly-bear",
            "distance_yards": 30,
            "has_cubs_or_food": True,
            "is_approaching": True,
            "has_bear_spray_ready": True,
        }
        res3 = client.post("/api/wildlife/encounter-assess", json=encounter_payload)
        assert res3.status_code == 200
        assessment = res3.json()
        assert assessment["species_id"] == "grizzly-bear"
        assert "Grizzly" in assessment["species_name"]
        assert assessment["danger_level"] in ("critical", "extreme")
        assert "stand" in assessment["immediate_action"].lower() or "do not run" in assessment["immediate_action"].lower()
        assert len(assessment["defensive_steps"]) >= 3
        assert any("play dead" in step.lower() for step in assessment["defensive_steps"])
        assert "bear spray" in assessment["bear_spray_protocol"].lower()
        assert "canister" in assessment["food_storage_rule"].lower() or "igbc" in assessment["food_storage_rule"].lower()

        # -------------------------------------------------------------------------
        # Step 4: Retrieve food storage and bear canister guidelines (GET /api/wildlife/food-storage)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/wildlife/food-storage")
        assert res4.status_code == 200
        storage_zones = res4.json()
        assert len(storage_zones) == 4
        zone_ids = [z["zone_id"] for z in storage_zones]
        assert "north-cascades" in zone_ids
        assert "olympic-np" in zone_ids
        assert "mount-rainier" in zone_ids
        assert "yellowstone-glacier" in zone_ids
        for zone in storage_zones:
            assert zone["zone_id"]
            assert zone["zone_name"]
            assert "canister_required" in zone
            assert zone["regulations"]
            assert zone["hang_spec"]

        # -------------------------------------------------------------------------
        # Step 5: Test chat query via create_response verifying wildlife_info metadata
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What should I do if I encounter a grizzly bear while backpacking?",
            "customer_id": "cust-wildlife-202",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "wildlife_info" in data5
        wildlife_info = data5["wildlife_info"]
        assert wildlife_info is not None
        assert wildlife_info.get("species_id") == "grizzly-bear" or "grizzly" in str(wildlife_info).lower()
        assert "Grizzly" in data5["answer"] or "bear" in data5["answer"].lower()

        # -------------------------------------------------------------------------
        # Step 6: Test SSE streaming via create_response_stream asserting wildlife_info event
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "What should I do if I encounter a grizzly bear while backpacking?"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        wildlife_event = next((e for e in parsed_events if e.get("event") == "wildlife_info"), None)
        assert wildlife_event is not None
        assert "wildlife_info" in wildlife_event
        stream_wildlife_info = wildlife_event["wildlife_info"]
        assert stream_wildlife_info is not None
        assert "grizzly" in str(stream_wildlife_info).lower()

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "bear" in full_text.lower() or "grizzly" in full_text.lower()


@pytest.mark.anyio
async def test_wildlife_journey_real_mode_execution():
    """Step 7: Verifies wildlife prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Alex", "membership": "Platinum", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="When encountering a Grizzly Bear, stand your ground, ready your bear spray, and never run."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the encounter safety protocol if I spot a grizzly bear?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "wildlife_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "wildlife_prompt" in call_kwargs
        assert "Grizzly" in call_kwargs["wildlife_prompt"]
