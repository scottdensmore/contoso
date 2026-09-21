import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_via_ferrata_journey():
    """Multi-step API journey test for Alpine Via Ferrata & Fall-Arrest Rigging Tooling:

    Step 1: Query via ferrata routes with Schall grade filter (GET /api/via-ferrata/routes).
    Step 2: Query specific route detail (GET /api/via-ferrata/routes/telluride-via-ferrata).
    Step 3: Post to rigging plan calculation endpoint (POST /api/via-ferrata/rigging-plan).
    Step 4: Query mandatory via ferrata gear checklist (GET /api/via-ferrata/gear-checklist).
    Step 5: Post chat query to create_response and verify via_ferrata_info metadata.
    Step 6: Post chat query to create_response/stream and assert SSE event via_ferrata_info.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query via ferrata routes with Schall grade filter
        # -------------------------------------------------------------------------
        res1 = client.get("/api/via-ferrata/routes")
        assert res1.status_code == 200
        routes = res1.json()
        assert len(routes) == 5
        route_ids = [r["route_id"] for r in routes]
        assert "telluride-via-ferrata" in route_ids
        assert "mount-olympus-iron-way" in route_ids
        assert "ouray-via-ferrata-gold-mountain" in route_ids
        assert "whistler-peak-via-ferrata" in route_ids
        assert "mammoth-mountain-iron-crest" in route_ids

        # Filter by grade
        res1_grade = client.get("/api/via-ferrata/routes?grade=grade_c_difficult")
        assert res1_grade.status_code == 200
        grade_c_routes = res1_grade.json()
        assert len(grade_c_routes) == 1
        assert grade_c_routes[0]["route_id"] == "telluride-via-ferrata"

        # -------------------------------------------------------------------------
        # Step 2: Query specific route detail (GET /api/via-ferrata/routes/{route_id})
        # -------------------------------------------------------------------------
        res2 = client.get("/api/via-ferrata/routes/telluride-via-ferrata")
        assert res2.status_code == 200
        route = res2.json()
        assert route["route_id"] == "telluride-via-ferrata"
        assert "Telluride" in route["title"]
        assert route["grade"] == "grade_c_difficult"
        assert route["exposure_level"] == "high"
        assert route["cable_length_m"] == 1200
        assert route["typical_duration_hours"] == 3.5
        assert route["rest_lanyard_recommended"] is True
        assert len(route["highlights"]) >= 3

        # 404 for unknown route
        res2_404 = client.get("/api/via-ferrata/routes/unknown-via-ferrata-route")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Post to rigging plan calculation endpoint (POST /api/via-ferrata/rigging-plan)
        # -------------------------------------------------------------------------
        rigging_req = {
            "route_id": "telluride-via-ferrata",
            "climber_weight_kg": 75.0,
            "has_heavy_backpack": False,
            "energy_absorber_type": "tearing_webbing_en958",
            "rest_lanyard_attached": True,
        }
        res3 = client.post("/api/via-ferrata/rigging-plan", json=rigging_req)
        assert res3.status_code == 200
        rigging_data = res3.json()
        assert rigging_data["route_id"] == "telluride-via-ferrata"
        assert "Telluride" in rigging_data["route_title"]
        assert rigging_data["effective_weight_kg"] == 75.0
        assert rigging_data["en958_compliant"] is True
        assert rigging_data["lanyard_safety_status"] == "certified_safe"
        assert 3.5 <= rigging_data["estimated_impact_force_kn"] <= 6.0
        assert len(rigging_data["safety_notice"]) > 20

        # 404 for non-existent route in rigging plan
        res3_404 = client.post(
            "/api/via-ferrata/rigging-plan", json={"route_id": "invalid-ferrata-route"}
        )
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Query mandatory via ferrata gear checklist (GET /api/via-ferrata/gear-checklist)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/via-ferrata/gear-checklist")
        assert res4.status_code == 200
        gear_list = res4.json()
        assert len(gear_list) == 6
        gear_ids = [g["item_id"] for g in gear_list]
        assert "en958-energy-absorber-lanyard" in gear_ids
        assert "locking-via-ferrata-carabiners" in gear_ids
        assert "climbing-harness-tested" in gear_ids
        assert "climbing-helmet-en12492" in gear_ids
        assert "rest-sling-carabiner" in gear_ids
        assert "sticky-approach-shoes-gloves" in gear_ids

        # -------------------------------------------------------------------------
        # Step 5: Post chat query to create_response and verify via_ferrata_info
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "Calculate via ferrata rigging plan and energy absorber impact force for telluride",
            "customer_id": "cust-ferrata-101",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "via_ferrata_info" in data5
        vf_info = data5["via_ferrata_info"]
        assert vf_info is not None
        assert vf_info["action"] == "rigging_plan"
        assert vf_info["plan"]["route_id"] == "telluride-via-ferrata"
        assert "Telluride" in data5["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Post chat query to create_response/stream and assert SSE event
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "Calculate via ferrata rigging plan and energy absorber impact force for telluride"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        vf_event = next((e for e in parsed_events if e.get("event") == "via_ferrata_info"), None)
        assert vf_event is not None
        assert "via_ferrata_info" in vf_event
        stream_vf_info = vf_event["via_ferrata_info"]
        assert stream_vf_info is not None
        assert stream_vf_info["action"] == "rigging_plan"
        assert stream_vf_info["plan"]["route_id"] == "telluride-via-ferrata"

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Telluride" in full_text


@pytest.mark.anyio
async def test_via_ferrata_journey_real_mode_execution():
    """Step 7: Verifies via ferrata prompt injection and payload parity in real LLM mode."""
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
                return_value="Telluride Via Ferrata is an iconic Grade C route along the sheer walls of Ajax Peak."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "Calculate via ferrata rigging plan and energy absorber impact force for telluride"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "via_ferrata_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "via_ferrata_prompt" in call_kwargs
        assert "Telluride" in call_kwargs["via_ferrata_prompt"]
