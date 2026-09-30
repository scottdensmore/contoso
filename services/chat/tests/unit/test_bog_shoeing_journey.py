import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_bog_shoeing_journey():
    """Multi-step API journey test for Wilderness Boreal Peatland Bog-Shoeing & Muskeg Navigation Tooling:

    Step 1: Check health and status endpoints (/health, /healthz, /ready, /api/status).
    Step 2: Query /bog-shoeing/sites and /api/bog-shoeing/sites with query filters.
    Step 3: Query /bog-shoeing/sites/great-dismal-swamp-quaking-mat and verify 404 for unknown site.
    Step 4: Post /bog-shoeing/calculate and verify 404 for invalid site.
    Step 5: Query /bog-shoeing/gear and verify 6 mandatory gear items.
    Step 6: Chat create_response for bog shoeing inquiries via /chat and /api/create_response.
    Step 7: Chat create_response/stream verifying SSE tokens and custom events (bog_shoeing_calculated and bog_shoeing_lookup).
    """
    # -------------------------------------------------------------------------
    # Step 1: Health & Status checks
    # -------------------------------------------------------------------------
    res_health = client.get("/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"

    res_healthz = client.get("/healthz")
    assert res_healthz.status_code == 200

    res_ready = client.get("/ready")
    assert res_ready.status_code == 200

    res_status = client.get("/api/status")
    assert res_status.status_code == 200
    status_data = res_status.json()
    assert status_data["status"] == "online"
    assert "model_provider" in status_data

    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 2: Query bog shoeing sites catalog
        # -------------------------------------------------------------------------
        res_sites = client.get("/bog-shoeing/sites")
        assert res_sites.status_code == 200
        sites = res_sites.json()
        assert len(sites) == 5
        site_ids = [s["id"] for s in sites]
        assert "great-dismal-swamp-quaking-mat" in site_ids
        assert "boundary-waters-spruce-muskeg" in site_ids
        assert "kenai-peninsula-patterned-fen" in site_ids
        assert "adirondack-spring-mire-basin" in site_ids
        assert "algonquin-highland-tussock-fen" in site_ids

        # Test prefixed route /api/bog-shoeing/sites
        res_api_sites = client.get("/api/bog-shoeing/sites")
        assert res_api_sites.status_code == 200
        assert len(res_api_sites.json()) == 5

        # Test alternative path /bog-shoeing/routes
        res_routes = client.get("/bog-shoeing/routes")
        assert res_routes.status_code == 200
        assert len(res_routes.json()) == 5

        # Filter by terrain=quaking_sphagnum_mat
        res_mat = client.get("/bog-shoeing/sites?terrain=quaking_sphagnum_mat")
        assert res_mat.status_code == 200
        mat_data = res_mat.json()
        assert len(mat_data) == 1
        assert mat_data[0]["id"] == "great-dismal-swamp-quaking-mat"

        # Filter by saturation=seasonally_flooded
        res_seasonal = client.get("/bog-shoeing/sites?saturation=seasonally_flooded")
        assert res_seasonal.status_code == 200
        seasonal_data = res_seasonal.json()
        assert len(seasonal_data) == 2

        # -------------------------------------------------------------------------
        # Step 3: Query single site details
        # -------------------------------------------------------------------------
        res_dismal = client.get(
            "/bog-shoeing/sites/great-dismal-swamp-quaking-mat"
        )
        assert res_dismal.status_code == 200
        dismal = res_dismal.json()
        assert dismal["id"] == "great-dismal-swamp-quaking-mat"
        assert dismal["site_id"] == "great-dismal-swamp-quaking-mat"
        assert "Great Dismal" in dismal["name"]
        assert dismal["region"] == "Virginia / North Carolina Border"
        assert dismal["system"] == "Coastal Peatland Reserve"
        assert dismal["peat_depth_m"] == 4.5
        assert dismal["water_table_cm"] == -5.0
        assert (
            dismal["water_saturation"]
            == "fully_saturated_superficial_water"
        )
        assert dismal["terrain"] == "quaking_sphagnum_mat"
        assert dismal["primary_shoe"] == "wide_oval_sphagnum_glider"
        assert len(dismal["highlights"]) >= 3

        # Prefixed single site lookup /api/bog-shoeing/sites/great-dismal-swamp-quaking-mat
        res_api_single = client.get(
            "/api/bog-shoeing/sites/great-dismal-swamp-quaking-mat"
        )
        assert res_api_single.status_code == 200
        assert res_api_single.json()["id"] == "great-dismal-swamp-quaking-mat"

        # 404 for unknown site
        res_404 = client.get("/bog-shoeing/sites/unknown-muskeg-swale")
        assert res_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Bog Flotation Calculation
        # -------------------------------------------------------------------------
        calc_payload = {
            "site_id": "great-dismal-swamp-quaking-mat",
            "user_weight_kg": 75.0,
            "payload_kg": 85.0,
            "shoe_type": "wide_oval_sphagnum_glider",
        }
        res_calc = client.post("/bog-shoeing/calculate", json=calc_payload)
        assert res_calc.status_code == 200
        calc_res = res_calc.json()
        assert calc_res["site_id"] == "great-dismal-swamp-quaking-mat"
        assert "Great Dismal" in calc_res["site_name"]
        assert calc_res["ground_pressure_kpa"] > 0
        assert calc_res["sinking_depth_cm"] > 0
        assert calc_res["flotation_index"] > 0
        assert calc_res["sinking_hazard"] in (
            "firm_hummock_support",
            "moderate_saturated_slump",
            "critical_quaking_mire_submersion",
        )
        assert "safety_advisory" in calc_res
        assert "rescue_protocol" in calc_res

        # Test prefixed route /api/bog-shoeing/calculate
        res_api_calc = client.post("/api/bog-shoeing/calculate", json=calc_payload)
        assert res_api_calc.status_code == 200
        assert res_api_calc.json()["site_id"] == "great-dismal-swamp-quaking-mat"

        # 404 for invalid site
        res_calc_404 = client.post(
            "/bog-shoeing/calculate", json={"site_id": "unknown-abyss"}
        )
        assert res_calc_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 5: Bog Gear Checklist
        # -------------------------------------------------------------------------
        res_gear = client.get("/bog-shoeing/gear")
        assert res_gear.status_code == 200
        gear_items = res_gear.json()
        assert len(gear_items) == 6
        assert all(g["mandatory"] is True for g in gear_items)
        gear_ids = [g["item_id"] for g in gear_items]
        assert "sphagnum-glider-bog-shoes" in gear_ids
        assert "carbon-peat-sounding-pole" in gear_ids
        assert "breathable-bog-waders" in gear_ids
        assert "floating-peatland-gps-compass" in gear_ids
        assert "self-rescue-extraction-awls" in gear_ids
        assert "peatland-distress-whistle-strobe" in gear_ids

        # Test prefixed route /api/bog-shoeing/gear
        res_api_gear = client.get("/api/bog-shoeing/gear")
        assert res_api_gear.status_code == 200
        assert len(res_api_gear.json()) == 6

        # -------------------------------------------------------------------------
        # Step 6: Chat create_response
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the flotation rating and sinking hazard at Great Dismal Sphagnum Quake Corridor?",
            "customer_id": "cust-peatland-202",
        }
        res6 = client.post("/chat", json=chat_req)
        assert res6.status_code == 200
        chat_data = res6.json()
        assert "bog_shoeing_info" in chat_data
        bs_info = chat_data["bog_shoeing_info"]
        assert bs_info is not None
        assert "answer" in chat_data
        assert len(chat_data["answer"]) > 0

        # Also test via /api/create_response and /api/chat
        res6_api = client.post("/api/create_response", json=chat_req)
        assert res6_api.status_code == 200
        assert "bog_shoeing_info" in res6_api.json()

        res6_chat = client.post("/api/chat", json=chat_req)
        assert res6_chat.status_code == 200
        assert "bog_shoeing_info" in res6_chat.json()

        # -------------------------------------------------------------------------
        # Step 7: Chat create_response/stream SSE tokens and custom events
        # -------------------------------------------------------------------------
        # Test calculation custom event via /chat/stream
        stream_req_calc = {
            "question": "Calculate flotation and ground pressure on quaking sphagnum mat at Great Dismal",
        }
        res7_calc = client.post("/chat/stream", json=stream_req_calc)
        assert res7_calc.status_code == 200
        raw_chunks = [c.strip() for c in res7_calc.text.split("\n\n") if c.strip()]
        assert "data: [DONE]" in raw_chunks

        parsed_events = []
        for line in raw_chunks:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        calc_event = next(
            (e for e in parsed_events if e.get("event") == "bog_shoeing_calculated"),
            None,
        )
        assert calc_event is not None
        assert "bog_shoeing_info" in calc_event
        assert calc_event["bog_shoeing_info"]["action"] == "calculate"

        token_events = [
            e
            for e in parsed_events
            if "chunk" in e or "token" in e or e.get("event") == "token"
        ]
        assert len(token_events) > 0
        full_text = "".join(
            str(e.get("chunk") or e.get("token", "")) for e in token_events
        )
        assert len(full_text) > 0

        # Test lookup custom event via /api/create_response/stream
        stream_req_lookup = {
            "question": "Tell me about Great Dismal Sphagnum Quake Corridor route details",
        }
        res7_lookup = client.post(
            "/api/create_response/stream", json=stream_req_lookup
        )
        assert res7_lookup.status_code == 200
        raw_chunks_lookup = [
            c.strip() for c in res7_lookup.text.split("\n\n") if c.strip()
        ]
        assert "data: [DONE]" in raw_chunks_lookup

        parsed_lookup = []
        for line in raw_chunks_lookup:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_lookup.append(json.loads(line.removeprefix("data: ")))

        lookup_event = next(
            (e for e in parsed_lookup if e.get("event") == "bog_shoeing_lookup"),
            None,
        )
        assert lookup_event is not None
        assert "bog_shoeing_info" in lookup_event
        assert (
            lookup_event["bog_shoeing_info"]["site_id"]
            == "great-dismal-swamp-quaking-mat"
        )


@pytest.mark.anyio
async def test_bog_shoeing_journey_real_mode_execution():
    """Step 8: Verifies bog shoeing prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Rowan",
                    "membership": "Explorer",
                    "orders": [],
                }
            ),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="At Great Dismal Sphagnum Quake Corridor, wide-oval gliders distribute ground pressure across floating peat mats."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the flotation rating for bog shoeing at Great Dismal Sphagnum Quake Corridor?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "bog_shoeing_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "bog_shoeing_prompt" in call_kwargs
        prompt_content = call_kwargs["bog_shoeing_prompt"].lower()
        assert (
            "bog-shoeing" in prompt_content
            or "sphagnum" in prompt_content
            or "peatland" in prompt_content
            or "flotation" in prompt_content
        )
