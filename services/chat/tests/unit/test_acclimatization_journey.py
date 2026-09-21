import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_acclimatization_journey():
    """Multi-step API journey test for High-Altitude Acclimatization & Symptom Triage Tooling:

    Step 1: Query peaks with zone filter (GET /api/acclimatization/peaks).
    Step 2: Query specific peak detail (GET /api/acclimatization/peaks/washington-mount-rainier).
    Step 3: Post to acclimatization plan calculation endpoint (POST /api/acclimatization/plan).
    Step 4: Query mandatory high-altitude medical gear checklist (GET /api/acclimatization/gear-checklist).
    Step 5: Post chat query to create_response and verify acclimatization_info metadata.
    Step 6: Post chat query to create_response/stream and assert SSE event acclimatization_info.
    """
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Query peaks with zone filter (GET /api/acclimatization/peaks)
        # -------------------------------------------------------------------------
        res1 = client.get("/api/acclimatization/peaks")
        assert res1.status_code == 200
        peaks = res1.json()
        assert len(peaks) == 5
        peak_ids = [p["peak_id"] for p in peaks]
        assert "colorado-mount-elbert" in peak_ids
        assert "washington-mount-rainier" in peak_ids
        assert "alaska-denali" in peak_ids
        assert "california-mount-whitney" in peak_ids
        assert "mexico-pico-de-orizaba" in peak_ids

        # Filter by zone
        res1_zone = client.get("/api/acclimatization/peaks?zone=extreme_altitude")
        assert res1_zone.status_code == 200
        extreme_peaks = res1_zone.json()
        assert len(extreme_peaks) == 2
        extreme_ids = [p["peak_id"] for p in extreme_peaks]
        assert "alaska-denali" in extreme_ids
        assert "mexico-pico-de-orizaba" in extreme_ids

        # -------------------------------------------------------------------------
        # Step 2: Query specific peak detail (GET /api/acclimatization/peaks/{peak_id})
        # -------------------------------------------------------------------------
        res2 = client.get("/api/acclimatization/peaks/washington-mount-rainier")
        assert res2.status_code == 200
        rainier = res2.json()
        assert rainier["peak_id"] == "washington-mount-rainier"
        assert rainier["peak_name"] == "Mount Rainier"
        assert rainier["summit_elevation_ft"] == 14411
        assert rainier["base_elevation_ft"] == 5420
        assert rainier["zone"] == "very_high_altitude"
        assert rainier["recommended_days"] >= 3
        assert len(rainier["key_camps"]) >= 3

        # 404 for unknown peak
        res2_404 = client.get("/api/acclimatization/peaks/unknown-peak-xyz")
        assert res2_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 3: Post to acclimatization plan calculation endpoint (POST /api/acclimatization/plan)
        # -------------------------------------------------------------------------
        plan_req = {
            "peak_id": "washington-mount-rainier",
            "resting_heart_rate": 65,
            "current_altitude_ft": 5420,
            "target_altitude_ft": 14411,
            "days_allowed": 3,
            "prior_experience": "some_14er",
        }
        res3 = client.post("/api/acclimatization/plan", json=plan_req)
        assert res3.status_code == 200
        plan_data = res3.json()
        assert plan_data["peak_id"] == "washington-mount-rainier"
        assert "Rainier" in plan_data["peak_name"]
        assert 1000 <= plan_data["recommended_daily_ascent_ft"] <= 1500
        assert plan_data["rest_days_required"] >= 1
        assert plan_data["ams_risk"] in ("low", "moderate", "high", "critical")
        assert 4.0 <= plan_data["hydration_liters"] <= 5.0
        assert len(plan_data["medical_advisory"]) > 20

        # 404 for unknown peak in plan
        res3_404 = client.post("/api/acclimatization/plan", json={"peak_id": "unknown-peak-id"})
        assert res3_404.status_code == 404

        # -------------------------------------------------------------------------
        # Step 4: Query mandatory high-altitude medical gear checklist (GET /api/acclimatization/gear-checklist)
        # -------------------------------------------------------------------------
        res4 = client.get("/api/acclimatization/gear-checklist")
        assert res4.status_code == 200
        gear_list = res4.json()
        assert len(gear_list) == 6
        gear_ids = [g["item_id"] for g in gear_list]
        assert any("oximeter" in gid for gid in gear_ids)
        assert any("diamox" in gid or "acetazolamide" in gid for gid in gear_ids)
        assert any("gamow" in gid or "hyperbaric" in gid for gid in gear_ids)

        # -------------------------------------------------------------------------
        # Step 5: Post chat query to create_response and verify acclimatization_info
        # -------------------------------------------------------------------------
        chat_req = {
            "question": "What is the acclimatization plan, ascent pacing, and Diamox dosage for Mount Rainier?",
            "customer_id": "cust-altitude-101",
        }
        res5 = client.post("/api/create_response", json=chat_req)
        assert res5.status_code == 200
        data5 = res5.json()
        assert "acclimatization_info" in data5
        a_info = data5["acclimatization_info"]
        assert a_info is not None
        assert a_info["action"] == "acclimatization_plan"
        assert a_info["plan"]["peak_id"] == "washington-mount-rainier"
        assert "Rainier" in data5["answer"]

        # -------------------------------------------------------------------------
        # Step 6: Post chat query to create_response/stream and assert SSE event
        # -------------------------------------------------------------------------
        res6_stream = client.post(
            "/api/create_response/stream",
            json={
                "question": "What is the acclimatization plan, ascent pacing, and Diamox dosage for Mount Rainier?"
            },
        )
        assert res6_stream.status_code == 200
        raw_events = [line.strip() for line in res6_stream.text.split("\n\n") if line.strip()]
        assert "data: [DONE]" in raw_events

        parsed_events = []
        for line in raw_events:
            if line.startswith("data: ") and line != "data: [DONE]":
                parsed_events.append(json.loads(line.removeprefix("data: ")))

        alt_event = next(
            (e for e in parsed_events if e.get("event") == "acclimatization_info"), None
        )
        assert alt_event is not None
        assert "acclimatization_info" in alt_event
        stream_a_info = alt_event["acclimatization_info"]
        assert stream_a_info is not None
        assert stream_a_info["action"] == "acclimatization_plan"
        assert stream_a_info["plan"]["peak_id"] == "washington-mount-rainier"

        token_chunks = [e["chunk"] for e in parsed_events if "chunk" in e]
        assert len(token_chunks) > 0
        full_text = "".join(token_chunks)
        assert "Rainier" in full_text


@pytest.mark.anyio
async def test_acclimatization_journey_real_mode_execution():
    """Step 7: Verifies acclimatization prompt injection and payload parity in real LLM mode."""
    mock_search_service = MagicMock()
    mock_search_service.search.return_value = []

    with (
        patch(
            "contoso_chat.chat_request.get_customer_from_postgres",
            new=AsyncMock(return_value={"firstName": "Alex", "membership": "Gold", "orders": []}),
        ),
        patch(
            "contoso_chat.chat_request.get_search_service",
            return_value=mock_search_service,
        ),
        patch(
            "contoso_chat.chat_request.generate_llm_response",
            new=AsyncMock(
                return_value="Mount Rainier requires careful acclimatization pacing above 10,000 ft and Diamox prophylaxis if rapid ascent is unavoidable."
            ),
        ) as mock_llm,
        patch("main.REAL_CHAT_AVAILABLE", True),
    ):
        res = client.post(
            "/api/create_response",
            json={
                "question": "What is the acclimatization plan, ascent pacing, and Diamox dosage for Mount Rainier?"
            },
        )
        assert res.status_code == 200
        data = res.json()
        assert "acclimatization_info" in data
        mock_llm.assert_awaited_once()
        call_kwargs = mock_llm.await_args.kwargs
        assert "acclimatization_prompt" in call_kwargs
        assert "Mount Rainier" in call_kwargs["acclimatization_prompt"]
