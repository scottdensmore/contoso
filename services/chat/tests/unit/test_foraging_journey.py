import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_foraging_journey():
    """Multi-step API journey test for Wilderness Foraging & Flora Safety Tooling:

    Step 1: Query species list (GET /api/foraging/species).
    Step 2: Query specific species detail (GET /api/foraging/species/golden-chanterelle).
    Step 3: Run safety screener (POST /api/foraging/safety-check) for Chanterelle identification.
    Step 4: Retrieve ethical foraging guidelines (GET /api/foraging/guidelines).
    Step 5: Test chat query via create_response verifying foraging_info metadata.
    Step 6: Test SSE streaming via create_response_stream asserting foraging_info event.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query species list (GET /api/foraging/species)
        # -------------------------------------------------------------------------
        res1 = client.get("/api/foraging/species")
        assert res1.status_code == 200
        species = res1.json()
        assert len(species) == 5
        s_ids = [s["species_id"] for s in species]
        assert "golden-chanterelle" in s_ids
        assert "morel-mushroom" in s_ids
        assert "huckleberry" in s_ids
        assert "miner-lettuce" in s_ids
        assert "stinging-nettle" in s_ids

        # Filter by category
        res1_cat = client.get("/api/foraging/species?category=mushroom")
        assert res1_cat.status_code == 200
        mushrooms = res1_cat.json()
        assert len(mushrooms) == 2
        assert all(m["category"] == "mushroom" for m in mushrooms)

        # Filter by season
        res1_season = client.get("/api/foraging/species?season=fall")
        assert res1_season.status_code == 200
        fall_species = res1_season.json()
        assert any(s["species_id"] == "golden-chanterelle" for s in fall_species)

        # -------------------------------------------------------------------------
        # Step 2: Query specific species detail (GET /api/foraging/species/golden-chanterelle)
        # -------------------------------------------------------------------------
        res2 = client.get("/api/foraging/species/golden-chanterelle")
        assert res2.status_code == 200
        chanterelle = res2.json()
        assert chanterelle["species_id"] == "golden-chanterelle"
        assert chanterelle["common_name"] == "Golden Chanterelle"
        assert "Cantharellus" in chanterelle["scientific_name"]
        assert chanterelle["category"] == "mushroom"
        assert len(chanterelle["toxic_lookalikes"]) >= 1
        assert any("Jack-o'-Lantern" in lookalike for lookalike in chanterelle["toxic_lookalikes"])
        assert len(chanterelle["key_identifiers"]) >= 1
        assert chanterelle["preparation_safety"]
        assert chanterelle["harvest_limit_rules"]

        # 404 for unknown species
        res2_404 = client.get("/api/foraging/species/unknown-fungus-xyz")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Run safety screener (POST /api/foraging/safety-check) for Chanterelle
        # -------------------------------------------------------------------------
        safety_payload = {
            "category": "mushroom",
            "season": "fall",
            "has_false_gills": True,
            "is_hollow_stem": False,
            "has_milky_sap": False,
            "growing_on_dead_wood": False,
        }
        res3 = client.post("/api/foraging/safety-check", json=safety_payload)
        assert res3.status_code == 200
        safety_data = res3.json()
        assert "Chanterelle" in safety_data["candidate_match"]
        assert safety_data["warning_level"] == "safe"
        assert "cook" in safety_data["recommendation"].lower()
        assert len(safety_data["safety_checks"]) >= 3
        assert safety_data["permit_guideline"]
        assert "Jack-o'-Lantern" in safety_data["toxic_warning"]

        # Screener hazard check: dead wood
        hazard_payload = {
            "category": "mushroom",
            "season": "fall",
            "has_false_gills": False,
            "is_hollow_stem": False,
            "has_milky_sap": False,
            "growing_on_dead_wood": True,
        }
        res3_hazard = client.post("/api/foraging/safety-check", json=hazard_payload)
        assert res3_hazard.status_code == 200
        hazard_data = res3_hazard.json()
        assert hazard_data["warning_level"] == "danger"
        assert "dead wood" in hazard_data["toxic_warning"].lower() or "jack-o'-lantern" in hazard_data["toxic_warning"].lower()

        # -------------------------------------------------------------------------
        # Step 4: Retrieve ethical foraging guidelines (GET /api/foraging/guidelines)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/foraging/guidelines")
        assert res4.status_code == 200
        guidelines = res4.json()
        assert "hundred_percent_rule" in guidelines
        assert "100%" in guidelines["hundred_percent_rule"]
        assert "ethical_harvesting" in guidelines
        assert len(guidelines["ethical_harvesting"]) >= 3
        assert "permits_and_regulations" in guidelines
        assert len(guidelines["permits_and_regulations"]) >= 2
        assert "field_safety_rules" in guidelines

        # -------------------------------------------------------------------------
        # Step 5: Test chat query via create_response verifying foraging_info metadata
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "Can you tell me about golden chanterelle mushrooms and how to harvest them safely?",
            "customer_id": "cust-forage-101",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "foraging_info" in data5
        forage_info = data5["foraging_info"]
        assert forage_info is not None
        assert forage_info.get("species_id") == "golden-chanterelle" or "chanterelle" in str(forage_info).lower()
        assert "Chanterelle" in data5["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Test SSE streaming via create_response_stream asserting foraging_info event
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Can you tell me about golden chanterelle mushrooms and how to harvest them safely?"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        forage_event = next((e for e in parsed_events if e.get("event") == "foraging_info"), None)
        assert forage_event is not None
        assert "foraging_info" in forage_event
        stream_forage_info = forage_event["foraging_info"]
        assert stream_forage_info is not None
        assert "chanterelle" in str(stream_forage_info).lower()

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Chanterelle" in full_text


@pytest.mark.anyio
async def test_foraging_journey_real_mode_execution():
    """Step 7: Verifies foraging prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={"firstName": "Robin", "membership": "Gold", "orders": []}
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="Golden Chanterelles (Cantharellus formosus) are choice edible mushrooms found in late summer and fall."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Can you tell me about golden chanterelle mushrooms and how to harvest them safely?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "foraging_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "foraging_prompt" in call_kwargs
        assert "Chanterelle" in call_kwargs["foraging_prompt"]
