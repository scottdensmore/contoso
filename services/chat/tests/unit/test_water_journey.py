from unittest.mock import patch

from contoso_chat.water import reset_water_store
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_backcountry_water_logistics_and_filtration_journey():
    """Multi-step API journey test for Backcountry Water Sources & Pathogen Filtration Tooling:

    Step 1: Inquire about water sources on Colchuck Lake trail -> Assistant returns source locations,
            mile markers, and flow status.
    Step 2: Request hydration carrying capacity estimate for 10 miles, 3,000 ft gain, 80°F ->
            Assistant returns estimated 3.8 L needed and 2.5 - 3.0 L carrying advice.
    Step 3: Ask about filtration methods for glacial silt / cryptosporidium -> Assistant explains
            hollow fiber vs gravity filters vs chemical treatment.
    Step 4: Submit a field water condition update -> Receives verification with WTR- report ID
            and updated status.
    """
    reset_water_store()
    with patch("main.REAL_CHAT_AVAILABLE", False):
        # -------------------------------------------------------------------------
        # Step 1: Inquire about water sources on Colchuck Lake trail
        # -> Assistant returns source locations, mile markers, and flow status.
        # -------------------------------------------------------------------------
        res1 = client.post(
            "/api/create_response",
            json={"question": "Where can I get water on the Colchuck Lake trail?"},
        )
        assert res1.status_code == 200
        data1 = res1.json()
        assert "water_info" in data1
        water_info_1 = data1["water_info"]
        assert water_info_1["action"] == "sources"
        assert "sources" in water_info_1
        sources = water_info_1["sources"]
        assert any(s["source_id"] == "colchuck-creek" for s in sources)
        colchuck_src = next(s for s in sources if s["source_id"] == "colchuck-creek")
        assert colchuck_src["mile_marker"] == 2.2
        assert colchuck_src["flow_status"] == "Flowing Strong"
        assert "2.2" in data1["answer"]
        assert "Flowing Strong" in data1["answer"]

        # Also verify REST catalog filtering endpoint
        rest_sources = client.get("/api/water/sources?region=Cascades")
        assert rest_sources.status_code == 200
        cascades_list = rest_sources.json()
        assert len(cascades_list) >= 2
        assert any(s["source_id"] == "colchuck-creek" for s in cascades_list)

        # -------------------------------------------------------------------------
        # Step 2: Request hydration carrying capacity estimate for 10 miles, 3,000 ft gain, 80°F
        # -> Assistant returns estimated 3.8 L needed and 2.5 - 3.0 L carrying advice.
        # -------------------------------------------------------------------------
        res2 = client.post(
            "/api/create_response",
            json={"question": "How much water should I carry for a 10 mile hike with 3000 ft gain at 80 degrees?"},
        )
        assert res2.status_code == 200
        data2 = res2.json()
        assert "water_info" in data2
        water_info_2 = data2["water_info"]
        assert water_info_2["action"] == "hydration"
        assert "estimate" in water_info_2
        estimate = water_info_2["estimate"]
        assert estimate["total_liters_needed"] == 3.8
        assert estimate["recommended_carrying_capacity_liters"] in (2.5, 3.0)
        assert "3.8" in data2["answer"]
        assert "2.5 - 3.0 L" in data2["answer"] or "2.5" in data2["answer"]

        # Verify direct REST endpoint for hydration calculation
        hydration_rest = client.post(
            "/api/water/hydration",
            json={"distance_miles": 10.0, "elevation_gain_feet": 3000, "temp_fahrenheit": 80},
        )
        assert hydration_rest.status_code == 200
        h_data = hydration_rest.json()
        assert h_data["total_liters_needed"] == 3.8
        assert h_data["recommended_carrying_capacity_liters"] in (2.5, 3.0)
        assert "2.5 - 3.0 L" in h_data["hydration_advice"]

        # -------------------------------------------------------------------------
        # Step 3: Ask about filtration methods for glacial silt / cryptosporidium
        # -> Assistant explains hollow fiber vs gravity filters vs chemical treatment.
        # -------------------------------------------------------------------------
        res3 = client.post(
            "/api/create_response",
            json={"question": "What filtration methods work for glacial silt and cryptosporidium?"},
        )
        assert res3.status_code == 200
        data3 = res3.json()
        assert "water_info" in data3
        water_info_3 = data3["water_info"]
        assert water_info_3["action"] in ("filtration", "pathogens")
        assert "pathogen_guide" in water_info_3
        answer_3 = data3["answer"].lower()
        assert "hollow" in answer_3 or "microfilter" in answer_3
        assert "gravity" in answer_3
        assert "chemical" in answer_3
        assert "glacial silt" in answer_3 or "silt" in answer_3

        # Verify direct REST endpoint for pathogen guide
        pathogens_rest = client.get("/api/water/pathogens")
        assert pathogens_rest.status_code == 200
        p_guide = pathogens_rest.json()
        assert "protozoa" in p_guide["pathogens"]
        assert "hollow_fiber" in p_guide["technologies"]
        assert "gravity_filters" in p_guide["technologies"]
        assert "chemical_treatment" in p_guide["technologies"]

        # -------------------------------------------------------------------------
        # Step 4: Submit a field water condition update
        # -> Receives verification with WTR- report ID and updated status.
        # -------------------------------------------------------------------------
        report_payload = {
            "source_id": "colchuck-creek",
            "reporter_name": "Jordan Lee",
            "flow_status": "Moderate Trickle",
            "turbidity": "Clear",
            "notes": "Water flow dropped significantly due to late-summer dry spell.",
        }
        res4 = client.post("/api/water/reports", json=report_payload)
        assert res4.status_code == 200
        data4 = res4.json()
        assert data4["report_id"].startswith("WTR-")
        assert data4["source_name"] == "Colchuck Creek Footbridge Crossing"
        assert data4["flow_status"] == "Moderate Trickle"
        assert data4["turbidity"] == "Clear"
        assert data4["status"] == "verified"
        assert len(data4["instructions"]) > 0

        # Verify updated status via GET /api/water/sources/{source_id}
        updated_source = client.get("/api/water/sources/colchuck-creek")
        assert updated_source.status_code == 200
        source_data = updated_source.json()
        assert source_data["flow_status"] == "Moderate Trickle"
        assert "late-summer dry spell" in source_data["notes"]
