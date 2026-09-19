import pytest
from contoso_chat.safety import (
    BEACON_STORE,
    EMERGENCY_PROTOCOLS,
    BeaconCheckinRequest,
    BeaconCheckinResponse,
    BeaconDevice,
    BeaconRegistrationRequest,
    BeaconRegistrationResponse,
    EmergencyProtocol,
    SafetyIntent,
    build_safety_prompt,
    detect_safety_intent,
    format_safety_response,
    get_avalanche_advisory,
    get_beacon,
    get_emergency_protocol,
    list_avalanche_advisories,
    list_emergency_protocols,
    record_beacon_checkin,
    register_safety_beacon,
)


@pytest.fixture(autouse=True)
def clear_beacon_store():
    """Ensure in-memory beacon store is clean before and after each test."""
    BEACON_STORE.clear()
    yield
    BEACON_STORE.clear()


class TestSafetyBeacon:
    def test_register_safety_beacon(self):
        req = BeaconRegistrationRequest(
            device_type="garmin_inreach",
            imei="300434012345670",
            owner_name="Alex Chen",
            emergency_contact="Taylor Chen",
            emergency_phone="555-019-2831",
            trip_zone="cascades",
            return_date="2026-10-01",
        )
        resp = register_safety_beacon(req)

        assert isinstance(resp, BeaconRegistrationResponse)
        assert resp.device_id.startswith("SBR-")
        assert len(resp.device_id) >= 7
        assert resp.device_type == "garmin_inreach"
        assert resp.imei == "300434012345670"
        assert resp.owner_name == "Alex Chen"
        assert resp.trip_zone == "cascades"
        assert resp.status == "ACTIVE_MONITORING"
        assert resp.registered_at is not None
        assert "SOS" in resp.instructions or "beacon" in resp.instructions.lower()

        # Check store
        stored = get_beacon(resp.device_id)
        assert stored is not None
        assert isinstance(stored, BeaconDevice)
        assert stored.device_id == resp.device_id
        assert stored.last_checkin is None
        assert stored.status == "ACTIVE_MONITORING"

    def test_get_unregistered_beacon_returns_none(self):
        assert get_beacon("SBR-UNKNOWN") is None

    def test_record_beacon_checkin_success(self):
        reg_req = BeaconRegistrationRequest(
            device_type="zoleo",
            imei="300123456789012",
            owner_name="Morgan Reed",
            emergency_contact="Sam Reed",
            emergency_phone="555-019-8877",
            trip_zone="rockies",
        )
        reg_resp = register_safety_beacon(reg_req)

        checkin_req = BeaconCheckinRequest(
            device_id=reg_resp.device_id,
            status_message="Camp 2 reached safely, weather clear",
            coordinates="40.0150,-105.2705",
        )
        checkin_resp = record_beacon_checkin(checkin_req)

        assert isinstance(checkin_resp, BeaconCheckinResponse)
        assert checkin_resp.device_id == reg_resp.device_id
        assert checkin_resp.status in ["CHECKIN_CONFIRMED", "ACTIVE", "OK"]
        assert checkin_resp.timestamp is not None
        assert "Camp 2" in checkin_resp.message or reg_resp.device_id in checkin_resp.message

        # Verify device state updated
        stored = get_beacon(reg_resp.device_id)
        assert stored is not None
        assert stored.last_checkin == checkin_resp.timestamp

    def test_record_beacon_checkin_unregistered_raises_key_error(self):
        req = BeaconCheckinRequest(
            device_id="SBR-99999",
            status_message="OK",
        )
        with pytest.raises(KeyError):
            record_beacon_checkin(req)


class TestEmergencyProtocols:
    def test_list_emergency_protocols(self):
        protocols = list_emergency_protocols()
        assert len(protocols) >= 5
        types = {p.incident_type for p in protocols}
        assert {"hypothermia", "wildlife", "lightning", "altitude", "injury"}.issubset(types)

    def test_get_emergency_protocol_exact_and_alias(self):
        hypo = get_emergency_protocol("hypothermia")
        assert hypo is not None
        assert hypo.incident_type == "hypothermia"
        assert hypo.severity == "CRITICAL"
        assert "Hypothermia" in hypo.title
        assert len(hypo.first_response_steps) >= 4
        assert any("Dry clothing" in s for s in hypo.first_response_steps)
        assert any("Wrap in sleeping bag" in s for s in hypo.first_response_steps)

        wildlife = get_emergency_protocol("wildlife")
        assert wildlife is not None
        assert wildlife.severity == "URGENT"
        assert any("bear spray" in s.lower() for s in wildlife.first_response_steps)

        # Alias lookup
        bear = get_emergency_protocol("bear")
        assert bear is not None
        assert bear.incident_type == "wildlife"

        lightning = get_emergency_protocol("lightning")
        assert lightning is not None
        assert lightning.severity == "CRITICAL"
        assert any("crouch" in s.lower() for s in lightning.first_response_steps)

        altitude = get_emergency_protocol("altitude")
        assert altitude is not None
        assert altitude.severity == "URGENT"
        assert any("Descend" in s for s in altitude.first_response_steps)

        ams = get_emergency_protocol("ams")
        assert ams is not None
        assert ams.incident_type == "altitude"

        injury = get_emergency_protocol("injury")
        assert injury is not None
        assert injury.severity == "CRITICAL"
        assert any("splint" in s.lower() for s in injury.first_response_steps)

        fracture = get_emergency_protocol("fracture")
        assert fracture is not None
        assert fracture.incident_type == "injury"

    def test_get_emergency_protocol_not_found(self):
        assert get_emergency_protocol("alien_encounter") is None

    def test_protocol_content_validation(self):
        for p in list_emergency_protocols():
            assert isinstance(p, EmergencyProtocol)
            assert p.incident_type in EMERGENCY_PROTOCOLS
            assert p.severity in ["CRITICAL", "URGENT", "MONITOR"]
            assert len(p.first_response_steps) > 0
            assert len(p.sar_signaling_instructions) > 0
            assert len(p.precautions) > 0


class TestAvalancheAdvisories:
    def test_list_avalanche_advisories(self):
        advisories = list_avalanche_advisories()
        assert len(advisories) == 5
        zones = {a.zone for a in advisories}
        assert zones == {"cascades", "rockies", "sierra", "wasatch", "tetons"}

    def test_get_avalanche_advisory_zones(self):
        cascades = get_avalanche_advisory("cascades")
        assert cascades is not None
        assert cascades.zone == "cascades"
        assert "Washington Cascades" in cascades.zone_name
        assert cascades.danger_rating == "Considerable"
        assert cascades.elevation_band == "Above Treeline (5,000+ ft)"
        assert cascades.primary_hazard == "Wind Slab & Persistent Weak Layer"
        assert len(cascades.recommended_actions) >= 3

        rockies = get_avalanche_advisory("rockies")
        assert rockies is not None
        assert rockies.danger_rating == "High"
        assert rockies.elevation_band == "All Elevations"
        assert rockies.primary_hazard == "Deep Persistent Slab"

        sierra = get_avalanche_advisory("sierra")
        assert sierra is not None
        assert sierra.danger_rating == "Moderate"
        assert sierra.elevation_band == "Near & Above Treeline"
        assert sierra.primary_hazard == "Wet Loose & Cornice Fall"

        wasatch = get_avalanche_advisory("wasatch")
        assert wasatch is not None
        assert wasatch.danger_rating == "Considerable"
        wasatch_elevation = wasatch.elevation_band
        assert "8,000" in wasatch_elevation
        assert wasatch.primary_hazard == "Wind Drifted Snow"

        tetons = get_avalanche_advisory("tetons")
        assert tetons is not None
        assert tetons.danger_rating == "Moderate"
        assert tetons.elevation_band == "Mid & High Elevation"
        assert tetons.primary_hazard == "Wind Slab"

    def test_get_avalanche_advisory_case_and_aliases(self):
        res1 = get_avalanche_advisory("Cascades")
        assert res1 is not None and res1.zone == "cascades"

        res2 = get_avalanche_advisory("colorado rockies")
        assert res2 is not None and res2.zone == "rockies"

        res3 = get_avalanche_advisory("tahoe")
        assert res3 is not None and res3.zone == "sierra"

        res4 = get_avalanche_advisory("utah wasatch")
        assert res4 is not None and res4.zone == "wasatch"

        res5 = get_avalanche_advisory("jackson hole")
        assert res5 is not None and res5.zone == "tetons"

    def test_get_avalanche_advisory_unknown(self):
        assert get_avalanche_advisory("everest") is None


class TestSafetyIntentDetection:
    def test_detect_register_beacon_intent(self):
        intent = detect_safety_intent("How do I register my Garmin inReach for Cascades trip?")
        assert intent is not None
        assert isinstance(intent, SafetyIntent)
        assert intent.action == "register_beacon"
        assert intent.device_type == "garmin_inreach"
        assert intent.zone == "cascades"

    def test_detect_checkin_beacon_intent(self):
        intent = detect_safety_intent("I want to do a beacon check-in for SBR-A9B8C status OK")
        assert intent is not None
        assert intent.action == "checkin_beacon"
        assert intent.device_id == "SBR-A9B8C"

    def test_detect_emergency_protocol_hypothermia(self):
        intent = detect_safety_intent("Emergency protocol for severe hypothermia in backcountry")
        assert intent is not None
        assert intent.action == "emergency_protocol"
        assert intent.incident_type == "hypothermia"

    def test_detect_emergency_protocol_wildlife(self):
        intent = detect_safety_intent("What is the emergency protocol for a bear encounter?")
        assert intent is not None
        assert intent.action == "emergency_protocol"
        assert intent.incident_type == "wildlife"

    def test_detect_emergency_protocol_lightning(self):
        intent = detect_safety_intent("What emergency protocol should we follow for lightning storm on ridge?")
        assert intent is not None
        assert intent.action == "emergency_protocol"
        assert intent.incident_type == "lightning"

    def test_detect_avalanche_intent(self):
        intent = detect_safety_intent("What is the regional avalanche advisory and forecast for Cascades?")
        assert intent is not None
        assert intent.action == "avalanche_advisory"
        assert intent.zone == "cascades"

    def test_detect_sar_procedure_intent(self):
        intent = detect_safety_intent("How do I trigger satellite SOS and initiate SAR emergency evacuation?")
        assert intent is not None
        assert intent.action in ["sar_procedure", "emergency_protocol"]

    def test_detect_general_safety_and_beacon_checkin(self):
        intent = detect_safety_intent("Tell me about satellite beacon check-in and emergency protocols")
        assert intent is not None
        assert intent.action in ["emergency_protocol", "checkin_beacon", "sar_procedure"]

    def test_detect_unrelated_query_returns_none(self):
        assert detect_safety_intent("What size trail running shoes should I buy?") is None
        assert detect_safety_intent("Track order #12345") is None


class TestSafetyPromptAndResponseFormat:
    def test_build_safety_prompt_emergency_protocol(self):
        intent = SafetyIntent(action="emergency_protocol", incident_type="hypothermia")
        prompt = build_safety_prompt(intent)
        assert "Hypothermia" in prompt
        assert "CRITICAL" in prompt
        assert "Dry clothing immediately" in prompt
        assert "SAR Signaling" in prompt or "Search and Rescue" in prompt

    def test_build_safety_prompt_avalanche(self):
        intent = SafetyIntent(action="avalanche_advisory", zone="cascades")
        prompt = build_safety_prompt(intent)
        assert "Washington Cascades" in prompt
        assert "Considerable" in prompt
        assert "Wind Slab" in prompt

    def test_format_safety_response_emergency_protocol(self):
        intent = SafetyIntent(action="emergency_protocol", incident_type="hypothermia")
        resp = format_safety_response(intent)
        assert "answer" in resp
        assert "safety_info" in resp
        s_info = resp["safety_info"]
        assert s_info["action"] == "emergency_protocol"
        assert s_info["protocol"] is not None
        assert s_info["protocol"]["incident_type"] == "hypothermia"
        assert "Dry clothing" in resp["answer"]

    def test_format_safety_response_avalanche(self):
        intent = SafetyIntent(action="avalanche_advisory", zone="cascades")
        resp = format_safety_response(intent)
        assert "answer" in resp
        assert "safety_info" in resp
        s_info = resp["safety_info"]
        assert s_info["action"] == "avalanche_advisory"
        assert s_info["advisory"] is not None
        assert s_info["advisory"]["danger_rating"] == "Considerable"
        assert "Considerable" in resp["answer"]
        assert "Washington Cascades" in resp["answer"]

    def test_format_safety_response_register_beacon(self):
        intent = SafetyIntent(action="register_beacon", device_type="garmin_inreach", zone="cascades")
        resp = format_safety_response(intent)
        assert "answer" in resp
        assert "safety_info" in resp
        s_info = resp["safety_info"]
        assert s_info["action"] == "register_beacon"
        assert "inreach" in resp["answer"].lower() or "register" in resp["answer"].lower()
