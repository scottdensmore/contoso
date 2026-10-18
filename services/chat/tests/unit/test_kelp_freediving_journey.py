import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_kelp_freediving_journey():
    """Multi-step API journey test for Coastal Intertidal Kelp Forest Free-Diving & Holdfast Ecology:

    Step 1: Check health and status endpoints (/health, /healthz, /ready, /api/status).
    Step 2: Query /kelp-freediving/sites and /api/kelp-freediving/sites with stratum filter, single site, and 404.
    Step 3: Post /kelp-freediving/calculate and /api/kelp-freediving/calculate (nominal/optimal, critical/abort, and 404).
    Step 4: Query /kelp-freediving/gear and /api/kelp-freediving/gear verifying 6 mandatory gear items.
    Step 5: Chat create_response for kelp freediving inquiries (gear, calculation, site detail).
    Step 6: Chat create_response/stream verifying SSE tokens and custom events (kelp_freediving_calculated, kelp_freediving_lookup, kelp_freediving_info).
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
        # Step 2: Query kelp freediving catalog & single site lookup
        # -------------------------------------------------------------------------
        res_sites = client.get("/kelp-freediving/sites")
        assert res_sites.status_code == 200
        sites = res_sites.json()
        assert len(sites) == 5
        site_ids = [s["id"] for s in sites]
        assert "point-lobos-carmel-pinnacles" in site_ids
        assert "channel-islands-anacapa-cathedral-cove" in site_ids
        assert "false-bay-millers-point-great-african-seaforest" in site_ids
        assert "barkley-sound-broken-group-bull-kelp" in site_ids
        assert "fortescue-bay-tasman-peninsula-giant-kelp" in site_ids

        # Test prefixed route /api/kelp-freediving/sites
        res_api_sites = client.get("/api/kelp-freediving/sites")
        assert res_api_sites.status_code == 200
        assert len(res_api_sites.json()) == 5

        # Filter by stratum=floating_pneumatocyst_canopy
        res_canopy = client.get(
            "/kelp-freediving/sites?stratum=floating_pneumatocyst_canopy"
        )
        assert res_canopy.status_code == 200
        canopy_data = res_canopy.json()
        assert len(canopy_data) >= 1
        assert any(s["id"] == "point-lobos-carmel-pinnacles" for s in canopy_data)

        # Filter via /api/kelp-freediving/sites?stratum=floating_pneumatocyst_canopy
        res_api_canopy = client.get(
            "/api/kelp-freediving/sites?stratum=floating_pneumatocyst_canopy"
        )
        assert res_api_canopy.status_code == 200
        assert len(res_api_canopy.json()) >= 1

        # Query single site details
        res_lobos = client.get(
            "/kelp-freediving/sites/point-lobos-carmel-pinnacles"
        )
        assert res_lobos.status_code == 200
        lobos = res_lobos.json()
        assert lobos["id"] == "point-lobos-carmel-pinnacles"
        assert lobos["site_id"] == "point-lobos-carmel-pinnacles"
        assert "Point Lobos" in lobos["title"]
        assert lobos["dominant_stratum"] == "floating_pneumatocyst_canopy"
        assert len(lobos["highlights"]) >= 3

        # Prefixed single site lookup
        res_api_single = client.get(
            "/api/kelp-freediving/sites/point-lobos-carmel-pinnacles"
        )
        assert res_api_single.status_code == 200
        assert res_api_single.json()["id"] == "point-lobos-carmel-pinnacles"

        # 404 for unknown site
        res_404 = client.get("/kelp-freediving/sites/unknown-kelp-forest")
        assert res_404.status_code == 404

        res_api_404 = client.get("/api/kelp-freediving/sites/unknown-kelp-forest")
        assert res_api_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Kelp Freediving Calculation
        # -------------------------------------------------------------------------
        calc_payload_optimal = {
            "site_id": "point-lobos-carmel-pinnacles",
            "kelp_stratum": "floating_pneumatocyst_canopy",
            "dominant_taxa": "macrocystis_pyrifera_giant_kelp",
            "target_depth_meters": 12.0,
            "water_temp_celsius": 13.0,
            "surge_velocity_ms": 0.3,
            "visibility_meters": 16.0,
            "wetsuit_thickness_mm": 7.0,
        }
        res_calc_nom = client.post(
            "/kelp-freediving/calculate", json=calc_payload_optimal
        )
        assert res_calc_nom.status_code == 200
        nom_res = res_calc_nom.json()
        assert nom_res["site_id"] == "point-lobos-carmel-pinnacles"
        assert nom_res["safety_status"] == "optimal_calm_canopy_window"
        assert nom_res["holdfast_biodiversity_index"] >= 0.75
        assert nom_res["stipe_entanglement_risk_percent"] < 40.0

        # Prefixed route /api/kelp-freediving/calculate
        res_api_calc = client.post(
            "/api/kelp-freediving/calculate", json=calc_payload_optimal
        )
        assert res_api_calc.status_code == 200
        assert res_api_calc.json()["site_id"] == "point-lobos-carmel-pinnacles"

        # Critical / abort calculation
        calc_payload_crit = {
            "site_id": "fortescue-bay-tasman-peninsula-giant-kelp",
            "kelp_stratum": "intertidal_surge_channel_ecotone",
            "dominant_taxa": "macrocystis_pyrifera_giant_kelp",
            "target_depth_meters": 22.0,
            "water_temp_celsius": 8.5,
            "surge_velocity_ms": 1.8,
            "visibility_meters": 2.5,
            "wetsuit_thickness_mm": 7.0,
        }
        res_calc_crit = client.post(
            "/kelp-freediving/calculate", json=calc_payload_crit
        )
        assert res_calc_crit.status_code == 200
        crit_res = res_calc_crit.json()
        assert crit_res["safety_status"] == "abort_heavy_surge_low_visibility"

        # 404 for invalid site
        res_calc_404 = client.post(
            "/kelp-freediving/calculate",
            json={"site_id": "unknown-kelp-forest-site"},
        )
        assert res_calc_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Kelp Freediving Gear Checklist
        # -------------------------------------------------------------------------
        res_gear = client.get("/kelp-freediving/gear")
        assert res_gear.status_code == 200
        gear_items = res_gear.json()
        assert len(gear_items) == 6
        assert all(g["mandatory"] is True for g in gear_items)
        gear_ids = [g["id"] for g in gear_items]
        assert "open-cell-7mm-camo-freedive-wetsuit" in gear_ids
        assert "quick-release-silicone-rubber-weight-belt" in gear_ids
        assert "blunt-tip-titanium-kelp-line-cutter" in gear_ids
        assert "low-volume-frameless-freedive-mask-j-snorkel" in gear_ids
        assert "carbon-fiber-long-blade-bi-fins" in gear_ids
        assert "submersible-slate-benthic-quadrat-frame" in gear_ids

        # Prefixed gear endpoint
        res_api_gear = client.get("/api/kelp-freediving/gear")
        assert res_api_gear.status_code == 200
        assert len(res_api_gear.json()) == 6

        # -------------------------------------------------------------------------
        # Step 5: Chat create_response for kelp freediving inquiries
        # -------------------------------------------------------------------------
        chat_req_gear = {
            "question": "What mandatory equipment and blunt-tip titanium kelp line cutter do I need for kelp forest freediving?",
        }
        res5_gear = client.post("/api/create_response", json=chat_req_gear)
        assert res5_gear.status_code == 200
        gear_ans = res5_gear.json()
        assert "kelp_freediving_info" in gear_ans
        kf_gear_info = gear_ans["kelp_freediving_info"]
        assert kf_gear_info is not None
        assert kf_gear_info["action"] == "gear_checklist"
        assert kf_gear_info["mandatory_count"] == 6

        chat_req_calc = {
            "question": "Calculate neutral buoyancy depth and holdfast biodiversity index for Point Lobos kelp forest freediving",
        }
        res5_calc = client.post("/api/create_response", json=chat_req_calc)
        assert res5_calc.status_code == 200
        calc_ans = res5_calc.json()
        assert "kelp_freediving_info" in calc_ans
        kf_calc_info = calc_ans["kelp_freediving_info"]
        assert kf_calc_info is not None
        assert kf_calc_info["action"] == "calculate"
        assert "neutral_buoyancy_depth_meters" in kf_calc_info
        assert "recommended_lead_weight_kg" in kf_calc_info
        assert "safe_bottom_time_seconds" in kf_calc_info
        assert "stipe_entanglement_risk_percent" in kf_calc_info
        assert "holdfast_biodiversity_index" in kf_calc_info

        # Also test via /api/chat
        res5_chat = client.post("/api/chat", json=chat_req_gear)
        assert res5_chat.status_code == 200
        assert "kelp_freediving_info" in res5_chat.json()

        # -------------------------------------------------------------------------
        # Step 6: Chat create_response/stream SSE events
        # -------------------------------------------------------------------------
        stream_req_calc = {
            "question": "Calculate neutral buoyancy depth and stipe entanglement risk for Point Lobos kelp forest",
        }
        res6_calc = client.post("/chat/stream", json=stream_req_calc)
        assert res6_calc.status_code == 200
        raw_chunks = [c.strip() for c in res6_calc.text.split("\n\n") if c.strip()]
        assert "data: [DONE]" in raw_chunks

        parsed_events = []
        for line in raw_chunks:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        calc_event = next(
            (e for e in parsed_events if e.get("event") == "kelp_freediving_calculated"),
            None,
        )
        assert calc_event is not None
        assert "kelp_freediving_info" in calc_event
        assert calc_event["kelp_freediving_info"]["action"] == "calculate"

        info_event = next(
            (e for e in parsed_events if e.get("event") == "kelp_freediving_info"),
            None,
        )
        assert info_event is not None
        assert "kelp_freediving_info" in info_event

        token_events = [
            e
            for e in parsed_events
            if "chunk" in e or "token" in e or e.get("event") == "token"
        ]
        assert len(token_events) > 0

        # 6b. Test lookup custom event via /api/create_response/stream
        stream_req_lookup = {
            "question": "Tell me about False Bay Millers Point Great African Seaforest kelp freediving details",
        }
        res6_lookup = client.post(
            "/api/create_response/stream", json=stream_req_lookup
        )
        assert res6_lookup.status_code == 200
        raw_chunks_lookup = [
            c.strip() for c in res6_lookup.text.split("\n\n") if c.strip()
        ]
        assert "data: [DONE]" in raw_chunks_lookup

        parsed_lookup = []
        for line in raw_chunks_lookup:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_lookup.append(json.loads(line.removeprefix("data: ")))

        lookup_event = next(
            (e for e in parsed_lookup if e.get("event") == "kelp_freediving_lookup"),
            None,
        )
        assert lookup_event is not None
        assert "kelp_freediving_info" in lookup_event


@pytest.mark.anyio
async def test_kelp_freediving_journey_real_mode_execution():
    """Step 7: Verifies kelp freediving prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(
                return_value={
                    "firstName": "Sylvia",
                    "membership": "Summit",
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
                return_value="At Point Lobos, Macrocystis pyrifera pneumatocyst canopies require a calm kelp crawl and quick-release rubber belt."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the canopy entry protocol and holdfast survey advisory for Point Lobos kelp forest freediving?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "kelp_freediving_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "kelp_freediving_prompt" in call_kwargs
        prompt_content = call_kwargs["kelp_freediving_prompt"].lower()
        assert (
            "kelp" in prompt_content
            or "holdfast" in prompt_content
            or "macrocystis" in prompt_content
            or "point lobos" in prompt_content
        )
