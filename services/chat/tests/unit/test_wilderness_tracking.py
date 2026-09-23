import pytest
from contoso_chat.wilderness_tracking import (
    DEFAULT_ANIMAL_TRACKS,
    AnimalTrackProfileModel,
    FormattedWildernessTrackingResponse,
    TrackAgingCalculationRequest,
    TrackAgingCalculationResponse,
    TrackingGearRequirement,
    WildernessTrackingIntent,
    build_wilderness_tracking_prompt,
    calculate_track_aging,
    detect_wilderness_tracking_intent,
    format_wilderness_tracking_response,
    get_animal_track_by_id,
    get_animal_tracks,
    get_tracking_gear,
)


class TestWildernessTrackingModels:
    def test_animal_track_profile_model(self):
        profile = AnimalTrackProfileModel(
            species_id="gray-wolf-pack",
            common_name="Northwestern Gray Wolf",
            scientific_name="Canis lupus",
            family="canid",
            track_length_inches=4.5,
            track_width_inches=4.0,
            claw_marks_visible=True,
            toe_count=4,
            typical_stride_inches=28.0,
            typical_gait="Direct Register Trot",
            habitat="Boreal Forests & Mountain Valleys",
            description="Large oval symmetrical tracks with prominent claws.",
            identifying_signs=["Parallel pack scent posts", "Urine scratch territorial marks"],
        )
        assert profile.species_id == "gray-wolf-pack"
        assert profile.common_name == "Northwestern Gray Wolf"
        assert profile.family == "canid"
        assert profile.claw_marks_visible is True
        assert profile.toe_count == 4
        assert len(profile.identifying_signs) == 2

    def test_calculation_request_defaults(self):
        req = TrackAgingCalculationRequest()
        assert req.species_id == "gray-wolf-pack"
        assert req.substrate == "compacted_mud"
        assert req.sun_wind_exposure == "sheltered_dense_canopy"
        assert req.track_wall_sharpness == "razor_crisp_undisturbed"
        assert req.measured_stride_inches == 28.0
        assert req.dewclaw_present is False

    def test_calculation_response_model(self):
        resp = TrackAgingCalculationResponse(
            species_id="gray-wolf-pack",
            species_name="Northwestern Gray Wolf",
            family="canid",
            gait_classification="Direct Register Trot",
            estimated_speed_mph=4.5,
            estimated_age_hours="< 2 hours (Fresh Spoor)",
            freshness_rating="fresh_under_2_hours",
            predator_alert="heightened_predator_alert",
            substrate_preservation_rating="Optimal - High Fidelity Wall Definition",
            tracker_advisory="Exercise immediate predator caution.",
        )
        assert resp.species_id == "gray-wolf-pack"
        assert resp.predator_alert == "heightened_predator_alert"
        assert resp.estimated_speed_mph == 4.5

    def test_gear_requirement_model(self):
        gear = TrackingGearRequirement(
            item_id="calibrated-tracking-stick",
            name="60-Inch Graduated Tracker's Measuring Stick with Sliding O-Rings",
            category="measurement",
            mandatory=True,
            purpose="Measures precise stride and straddle.",
        )
        assert gear.item_id == "calibrated-tracking-stick"
        assert gear.mandatory is True

    def test_intent_model(self):
        intent = WildernessTrackingIntent(
            action="species_list",
            species_id=None,
            family="canid",
        )
        assert intent.action == "species_list"
        assert intent.family == "canid"


class TestWildernessTrackingCatalog:
    def test_catalog_contains_5_iconic_species(self):
        assert len(DEFAULT_ANIMAL_TRACKS) == 5
        assert "gray-wolf-pack" in DEFAULT_ANIMAL_TRACKS
        assert "mountain-lion-cougar" in DEFAULT_ANIMAL_TRACKS
        assert "grizzly-brown-bear" in DEFAULT_ANIMAL_TRACKS
        assert "rocky-mountain-elk" in DEFAULT_ANIMAL_TRACKS
        assert "north-american-moose" in DEFAULT_ANIMAL_TRACKS

    def test_get_all_species(self):
        tracks = get_animal_tracks()
        assert len(tracks) == 5

    def test_filter_species_by_family(self):
        canids = get_animal_tracks(family="canid")
        assert len(canids) == 1
        assert canids[0].species_id == "gray-wolf-pack"

        felids = get_animal_tracks(family="felid")
        assert len(felids) == 1
        assert felids[0].species_id == "mountain-lion-cougar"

        ursids = get_animal_tracks(family="ursid")
        assert len(ursids) == 1
        assert ursids[0].species_id == "grizzly-brown-bear"

        ungulates = get_animal_tracks(family="ungulate")
        assert len(ungulates) == 2
        ungulate_ids = {u.species_id for u in ungulates}
        assert ungulate_ids == {"rocky-mountain-elk", "north-american-moose"}

    def test_get_species_by_id(self):
        grizzly = get_animal_track_by_id("grizzly-brown-bear")
        assert grizzly is not None
        assert grizzly.common_name == "Interior Grizzly Bear"
        assert grizzly.toe_count == 5
        assert grizzly.claw_marks_visible is True

        unknown = get_animal_track_by_id("unknown-animal")
        assert unknown is None

    def test_gear_checklist_contains_6_mandatory_items(self):
        gear = get_tracking_gear()
        assert len(gear) == 6
        assert all(item.mandatory is True for item in gear)
        gear_ids = [item.item_id for item in gear]
        assert "calibrated-tracking-stick" in gear_ids
        assert "high-intensity-raking-light" in gear_ids
        assert "compact-8x42-binoculars" in gear_ids
        assert "quick-hardening-dental-stone" in gear_ids
        assert "weatherproof-field-journal" in gear_ids
        assert "inertial-holstered-bear-spray" in gear_ids


class TestTrackAgingCalculations:
    def test_fresh_predator_alert_wolf(self):
        req = TrackAgingCalculationRequest(
            species_id="gray-wolf-pack",
            substrate="compacted_mud",
            sun_wind_exposure="sheltered_dense_canopy",
            track_wall_sharpness="razor_crisp_undisturbed",
            measured_stride_inches=28.0,
            dewclaw_present=False,
        )
        res = calculate_track_aging(req)
        assert res.species_id == "gray-wolf-pack"
        assert res.family == "canid"
        assert res.freshness_rating == "fresh_under_2_hours"
        assert res.predator_alert == "heightened_predator_alert"
        assert res.estimated_speed_mph > 0
        assert "Direct Register Trot" in res.gait_classification
        assert "Optimal" in res.substrate_preservation_rating
        assert (
            "bear spray" in res.tracker_advisory.lower()
            or "predator" in res.tracker_advisory.lower()
        )

    def test_fresh_predator_alert_grizzly(self):
        req = TrackAgingCalculationRequest(
            species_id="grizzly-brown-bear",
            substrate="wet_river_silt",
            sun_wind_exposure="sheltered_dense_canopy",
            track_wall_sharpness="razor_crisp_undisturbed",
            measured_stride_inches=40.0,
            dewclaw_present=False,
        )
        res = calculate_track_aging(req)
        assert res.species_id == "grizzly-brown-bear"
        assert res.family == "ursid"
        assert res.predator_alert == "heightened_predator_alert"
        assert res.freshness_rating == "fresh_under_2_hours"

    def test_weathered_ungulate_elk(self):
        req = TrackAgingCalculationRequest(
            species_id="rocky-mountain-elk",
            substrate="loose_gravel_scree",
            sun_wind_exposure="open_wind_scoured_ridge",
            track_wall_sharpness="eroded_walls_debris_filled",
            measured_stride_inches=30.0,
            dewclaw_present=False,
        )
        res = calculate_track_aging(req)
        assert res.species_id == "rocky-mountain-elk"
        assert res.family == "ungulate"
        assert res.predator_alert == "normal_wilderness_protocol"
        assert res.freshness_rating == "aged_12_to_48_hours"
        assert "12 - 48 hours" in res.estimated_age_hours

    def test_caution_monitoring_recent_cougar(self):
        req = TrackAgingCalculationRequest(
            species_id="mountain-lion-cougar",
            substrate="compacted_mud",
            sun_wind_exposure="sheltered_dense_canopy",
            track_wall_sharpness="rounded_edges_minor_crumbles",
            measured_stride_inches=16.0,
            dewclaw_present=False,
        )
        res = calculate_track_aging(req)
        assert res.species_id == "mountain-lion-cougar"
        assert res.family == "felid"
        assert res.predator_alert == "caution_monitoring"
        assert "2 - 12 hours" in res.estimated_age_hours

    def test_gallop_and_dewclaw_impact(self):
        req = TrackAgingCalculationRequest(
            species_id="north-american-moose",
            substrate="compacted_mud",
            sun_wind_exposure="sheltered_dense_canopy",
            track_wall_sharpness="razor_crisp_undisturbed",
            measured_stride_inches=85.0,
            dewclaw_present=True,
        )
        res = calculate_track_aging(req)
        assert "Gallop" in res.gait_classification or "Sprint" in res.gait_classification
        assert res.estimated_speed_mph > 6.0
        assert "dewclaw" in res.tracker_advisory.lower()

    def test_invalid_species_raises_value_error(self):
        req = TrackAgingCalculationRequest(
            species_id="mythical-chupacabra",
        )
        with pytest.raises(ValueError, match="not found"):
            calculate_track_aging(req)


class TestWildernessTrackingIntentDetection:
    def test_detect_species_list_intent(self):
        q1 = "What animal tracks and spoor can you identify in the catalog?"
        intent1 = detect_wilderness_tracking_intent(q1)
        assert intent1 is not None
        assert intent1.action == "species_list"

        q2 = "Show me the wildlife tracking list for North America"
        intent2 = detect_wilderness_tracking_intent(q2)
        assert intent2 is not None
        assert intent2.action == "species_list"

    def test_detect_family_filter_in_list(self):
        q = "List all canid animal tracks and sign"
        intent = detect_wilderness_tracking_intent(q)
        assert intent is not None
        assert intent.action == "species_list"
        assert intent.family == "canid"

    def test_detect_species_detail_wolf(self):
        q = "How do I identify wolf tracks and scent posts?"
        intent = detect_wilderness_tracking_intent(q)
        assert intent is not None
        assert intent.action == "species_detail"
        assert intent.species_id == "gray-wolf-pack"

    def test_detect_species_detail_grizzly(self):
        q = "Tell me about grizzly bear sign and claw tree markings"
        intent = detect_wilderness_tracking_intent(q)
        assert intent is not None
        assert intent.action == "species_detail"
        assert intent.species_id == "grizzly-brown-bear"

    def test_detect_species_detail_cougar(self):
        q = "What does a cougar mountain lion track look like?"
        intent = detect_wilderness_tracking_intent(q)
        assert intent is not None
        assert intent.action == "species_detail"
        assert intent.species_id == "mountain-lion-cougar"

    def test_detect_species_detail_elk_and_moose(self):
        q_elk = "How do I spot rocky mountain elk rubs and hoof prints?"
        intent_elk = detect_wilderness_tracking_intent(q_elk)
        assert intent_elk is not None
        assert intent_elk.action == "species_detail"
        assert intent_elk.species_id == "rocky-mountain-elk"

        q_moose = "Tell me about moose browse lines and splayed hooves"
        intent_moose = detect_wilderness_tracking_intent(q_moose)
        assert intent_moose is not None
        assert intent_moose.action == "species_detail"
        assert intent_moose.species_id == "north-american-moose"

    def test_detect_calculate_track_aging_intent(self):
        q1 = "Calculate track wall degradation and age estimation for wolf spoor"
        intent1 = detect_wilderness_tracking_intent(q1)
        assert intent1 is not None
        assert intent1.action == "calculate_track_aging"

        q2 = "Estimate track freshness and animal gait speed from stride measurement"
        intent2 = detect_wilderness_tracking_intent(q2)
        assert intent2 is not None
        assert intent2.action == "calculate_track_aging"

    def test_detect_gear_checklist_intent(self):
        q1 = "What is the mandatory tracking kit checklist?"
        intent1 = detect_wilderness_tracking_intent(q1)
        assert intent1 is not None
        assert intent1.action == "gear_checklist"

        q2 = "Do I need a tracking stick, dental stone plaster, and bear spray for tracking?"
        intent2 = detect_wilderness_tracking_intent(q2)
        assert intent2 is not None
        assert intent2.action == "gear_checklist"

    def test_disambiguation_guards_return_none(self):
        # Order / package tracking lookup
        assert detect_wilderness_tracking_intent("Where is my order #12345?") is None
        assert detect_wilderness_tracking_intent("Track my package shipment with FedEx") is None
        assert detect_wilderness_tracking_intent("Can I get tracking info for order 99281") is None

        # General bear attack / bear canister questions unrelated to animal track identification
        assert (
            detect_wilderness_tracking_intent("What should I do if a grizzly bear attacks my camp?")
            is None
        )
        assert detect_wilderness_tracking_intent("How do I store food in a bear canister?") is None

        # Hunting regulations
        assert (
            detect_wilderness_tracking_intent(
                "Where can I buy an elk hunting license and season tag?"
            )
            is None
        )
        assert (
            detect_wilderness_tracking_intent("What are the hunting regulations in Colorado?")
            is None
        )

        # GPS route navigation / GPX tracks
        assert (
            detect_wilderness_tracking_intent(
                "Can I download the GPX track and waypoints for the Enchantments Thru-Hike?"
            )
            is None
        )
        assert (
            detect_wilderness_tracking_intent("Export GPS route track with elevation profile")
            is None
        )

        # General unrelated question
        assert detect_wilderness_tracking_intent("What is the weather in Seattle?") is None


class TestPromptAndResponseFormatting:
    def test_build_prompt(self):
        prompt = build_wilderness_tracking_prompt()
        assert "Northwestern Gray Wolf" in prompt
        assert "Interior Grizzly Bear" in prompt
        assert "North American Cougar" in prompt
        assert "calibrated-tracking-stick" in prompt
        assert "inertial-holstered-bear-spray" in prompt

    def test_format_response_species_list(self):
        intent = WildernessTrackingIntent(action="species_list")
        resp = format_wilderness_tracking_response(intent, "List wildlife tracks")
        assert isinstance(resp, FormattedWildernessTrackingResponse)
        assert "tracking_info" in resp
        assert resp["tracking_info"]["action"] == "species_list"
        assert len(resp["tracking_info"]["species"]) == 5
        assert "Northwestern Gray Wolf" in str(resp)

    def test_format_response_species_detail(self):
        intent = WildernessTrackingIntent(action="species_detail", species_id="gray-wolf-pack")
        resp = format_wilderness_tracking_response(intent, "Tell me about wolf tracks")
        assert isinstance(resp, FormattedWildernessTrackingResponse)
        assert resp["tracking_info"]["action"] == "species_detail"
        assert resp["tracking_info"]["species"]["species_id"] == "gray-wolf-pack"
        assert "Canis lupus" in str(resp)

    def test_format_response_calculate(self):
        intent = WildernessTrackingIntent(
            action="calculate_track_aging", species_id="gray-wolf-pack"
        )
        resp = format_wilderness_tracking_response(
            intent, "Calculate track age for razor crisp wolf tracks"
        )
        assert isinstance(resp, FormattedWildernessTrackingResponse)
        assert resp["tracking_info"]["action"] == "calculate_track_aging"
        assert "calculation" in resp["tracking_info"]
        assert resp["tracking_info"]["calculation"]["species_id"] == "gray-wolf-pack"

    def test_format_response_gear(self):
        intent = WildernessTrackingIntent(action="gear_checklist")
        resp = format_wilderness_tracking_response(intent, "What tracking gear is needed?")
        assert isinstance(resp, FormattedWildernessTrackingResponse)
        assert resp["tracking_info"]["action"] == "gear_checklist"
        assert len(resp["tracking_info"]["gear"]) == 6
        assert "dental stone" in str(resp).lower()


class TestFormattedResponseAndEdgeCases:
    def test_formatted_response_dict_methods(self):
        resp = FormattedWildernessTrackingResponse("test answer", {"foo": "bar", "num": 42})
        assert resp["foo"] == "bar"
        assert resp.get("foo") == "bar"
        assert resp.get("nonexistent", "default") == "default"
        assert "foo" in resp
        assert "unknown" not in resp
        assert "foo" in list(resp.keys())
        assert "bar" in list(resp.values())
        assert ("foo", "bar") in list(resp.items())
        assert resp[0] == "t"

    def test_calculation_substrates_and_gaits(self):
        # Sand substrate, slow walk
        req_sand = TrackAgingCalculationRequest(
            species_id="mountain-lion-cougar",
            substrate="fine_sand",
            sun_wind_exposure="open_wind_scoured_ridge",
            track_wall_sharpness="rounded_edges_minor_crumbles",
            measured_stride_inches=10.0,  # ratio < 0.8 -> Stalking / Slow Walk
        )
        res_sand = calculate_track_aging(req_sand)
        assert res_sand.gait_classification == "Stalking / Slow Walk"
        assert (
            "Sand" in res_sand.substrate_preservation_rating
            or "Wind" in res_sand.substrate_preservation_rating
        )
        assert res_sand.freshness_rating == "recent_2_to_6_hours"

        # Powder snow substrate, trotting lope
        req_snow = TrackAgingCalculationRequest(
            species_id="gray-wolf-pack",
            substrate="deep_powder_snow",
            sun_wind_exposure="sheltered_dense_canopy",
            track_wall_sharpness="faint_pitted_depression",
            measured_stride_inches=38.0,  # 38 / 28 = 1.35 -> trotting
        )
        res_snow = calculate_track_aging(req_snow)
        assert "Trotting" in res_snow.gait_classification
        assert "Rapid Melting" in res_snow.substrate_preservation_rating
        assert res_snow.freshness_rating == "degraded_over_48_hours"
        assert res_snow.predator_alert == "normal_wilderness_protocol"

        # Crusty hardpack snow
        req_crust = TrackAgingCalculationRequest(
            species_id="rocky-mountain-elk",
            substrate="crusty_hardpack_snow",
            track_wall_sharpness="razor_crisp_undisturbed",
        )
        res_crust = calculate_track_aging(req_crust)
        assert "Brittle Crests" in res_crust.substrate_preservation_rating

        # Other substrate fallback
        req_other = TrackAgingCalculationRequest(
            species_id="north-american-moose",
            substrate="mossy_tundra_bog",
            track_wall_sharpness="razor_crisp_undisturbed",
        )
        res_other = calculate_track_aging(req_other)
        assert (
            "Variable Cohesion" in res_crust.substrate_preservation_rating
            or "Moderate" in res_other.substrate_preservation_rating
        )
        # Fresh moose triggers caution_monitoring
        assert res_other.predator_alert == "caution_monitoring"

    def test_intent_detection_extra_variations(self):
        # Family detection variations
        assert detect_wilderness_tracking_intent("Identify dog family tracks").family == "canid"
        assert detect_wilderness_tracking_intent("Identify cat family prints").family == "felid"
        assert detect_wilderness_tracking_intent("Identify bear family tracks").family == "ursid"
        assert detect_wilderness_tracking_intent("Identify cloven hoof prints").family == "ungulate"

        # Calculation species variations
        assert (
            detect_wilderness_tracking_intent("Calculate cougar track speed").species_id
            == "mountain-lion-cougar"
        )
        assert (
            detect_wilderness_tracking_intent("Calculate grizzly track age").species_id
            == "grizzly-brown-bear"
        )
        assert (
            detect_wilderness_tracking_intent("Calculate elk track stride").species_id
            == "rocky-mountain-elk"
        )
        assert (
            detect_wilderness_tracking_intent("Calculate moose track degradation").species_id
            == "north-american-moose"
        )

    def test_response_formatting_extra_branches(self):
        # Fallback unknown action
        fallback_intent = WildernessTrackingIntent(action="unknown_action")
        fallback_resp = format_wilderness_tracking_response(fallback_intent, "Random query")
        assert "Contoso Wilderness Tracking Tooling" in str(fallback_resp)

        # Species detail with unknown species fallback
        detail_unknown = WildernessTrackingIntent(action="species_detail", species_id="nonexistent")
        detail_resp = format_wilderness_tracking_response(detail_unknown, "details")
        assert "Northwestern Gray Wolf" in str(detail_resp)

        # Calculation format with weathered query
        calc_intent = WildernessTrackingIntent(
            action="calculate_track_aging", species_id="rocky-mountain-elk"
        )
        calc_weathered = format_wilderness_tracking_response(
            calc_intent, "estimate weathered and eroded elk tracks"
        )
        assert "Analysis: Rocky Mountain Elk" in str(calc_weathered)

        # Calculation format with rounded query
        calc_rounded = format_wilderness_tracking_response(
            calc_intent, "estimate rounded edges track"
        )
        assert "Analysis: Rocky Mountain Elk" in str(calc_rounded)
