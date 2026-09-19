from contoso_chat.field_reports import (
    FIELD_REPORTS_CATALOG,
    HAZARD_ALERTS_CATALOG,
    FieldReportModel,
    FieldReportsIntent,
    HazardAlertModel,
    build_field_reports_prompt,
    detect_field_reports_intent,
    format_field_reports_response,
    get_field_reports,
    get_hazard_alerts,
)


class TestFieldReportsModels:
    def test_field_report_model_validation(self):
        report = FieldReportModel(
            report_id="fr-test-1",
            trail_name="Mount Si",
            hike_date="2026-09-15",
            reporter_username="trail_runner",
            condition="Dry / Clear",
            snow_depth_inches=0,
            bug_rating="Low",
            parking_status="Ample parking",
            notes="Clear trail up to the haystack.",
            has_hazard=False,
        )
        assert report.report_id == "fr-test-1"
        assert report.trail_name == "Mount Si"
        assert report.snow_depth_inches == 0
        assert report.has_hazard is False

    def test_hazard_alert_model_validation(self):
        alert = HazardAlertModel(
            alert_id="alert-test-1",
            trail_name="Enchantments Core",
            severity="Warning",
            hazard_type="Collapsing Snow Bridges",
            reported_date="2026-09-16",
            summary="Weak snow bridges over creek crossings.",
            safety_advisory="Avoid stepping on hollow snowpack.",
        )
        assert alert.alert_id == "alert-test-1"
        assert alert.severity == "Warning"
        assert alert.hazard_type == "Collapsing Snow Bridges"

    def test_field_reports_intent_validation(self):
        intent = FieldReportsIntent(
            action="conditions",
            trail_name="Mount Si",
            hazard_only=False,
        )
        assert intent.action == "conditions"
        assert intent.trail_name == "Mount Si"
        assert intent.hazard_only is False


class TestCatalogData:
    def test_reports_catalog_contains_required_trails(self):
        assert len(FIELD_REPORTS_CATALOG) == 5
        trail_names = [r.trail_name for r in FIELD_REPORTS_CATALOG]
        assert "Mount Si" in trail_names
        assert "Skyline Trail" in trail_names
        assert "Enchantments Core" in trail_names
        assert "Lake 22" in trail_names
        assert "Angel's Landing" in trail_names

    def test_alerts_catalog_contains_required_hazards(self):
        assert len(HAZARD_ALERTS_CATALOG) == 3
        alert_ids = [a.alert_id for a in HAZARD_ALERTS_CATALOG]
        assert any("enchantment" in aid.lower() for aid in alert_ids)
        assert any("angel" in aid.lower() for aid in alert_ids)
        assert any("rainier" in aid.lower() for aid in alert_ids)


class TestGetFieldReports:
    def test_get_all_reports(self):
        reports = get_field_reports()
        assert len(reports) == 5

    def test_get_reports_by_trail_name(self):
        mount_si = get_field_reports(trail_name="Mount Si")
        assert len(mount_si) == 1
        assert mount_si[0].trail_name == "Mount Si"

        skyline = get_field_reports(trail_name="Skyline Trail")
        assert len(skyline) == 1
        assert skyline[0].trail_name == "Skyline Trail"
        assert skyline[0].snow_depth_inches == 24

    def test_get_reports_by_condition(self):
        muddy = get_field_reports(condition="Muddy")
        assert len(muddy) >= 1
        assert all("muddy" in r.condition.lower() for r in muddy)

    def test_get_reports_unknown_trail(self):
        unknown = get_field_reports(trail_name="Unknown Peak")
        assert len(unknown) == 0


class TestGetHazardAlerts:
    def test_get_all_alerts(self):
        alerts = get_hazard_alerts()
        assert len(alerts) == 3

    def test_get_alerts_by_trail_name(self):
        enchantments = get_hazard_alerts(trail_name="Enchantments Core")
        assert len(enchantments) == 1
        assert "Snow Bridges" in enchantments[0].hazard_type or "snow bridge" in enchantments[0].hazard_type.lower()
        assert enchantments[0].severity == "Warning"

        angels = get_hazard_alerts(trail_name="Angel's Landing")
        assert len(angels) == 1
        assert "Wind" in angels[0].hazard_type or "wind" in angels[0].hazard_type.lower()
        assert angels[0].severity == "Severe"

        rainier = get_hazard_alerts(trail_name="Mount Rainier")
        assert len(rainier) == 1
        assert "Avalanche" in rainier[0].hazard_type or "avalanche" in rainier[0].hazard_type.lower()
        assert rainier[0].severity == "Caution"

    def test_get_alerts_for_safe_trail(self):
        safe = get_hazard_alerts(trail_name="Mount Si")
        assert len(safe) == 0


class TestDetectFieldReportsIntent:
    def test_detect_conditions_intent(self):
        query = "What are the latest trail conditions for Mount Si and Skyline Trail?"
        intent = detect_field_reports_intent(query)
        assert intent is not None
        assert intent.action == "conditions"
        assert intent.hazard_only is False
        assert "Mount Si" in (intent.trail_name or "")
        assert "Skyline" in (intent.trail_name or "")

    def test_detect_alerts_intent(self):
        query = "Are there any hazards or trail warnings for The Enchantments?"
        intent = detect_field_reports_intent(query)
        assert intent is not None
        assert intent.action == "alerts"
        assert intent.hazard_only is True
        assert "Enchantment" in (intent.trail_name or "")

    def test_detect_parking_intent(self):
        query = "How is the parking availability at Lake 22 trailhead?"
        intent = detect_field_reports_intent(query)
        assert intent is not None
        assert intent.action == "parking"
        assert "Lake 22" in (intent.trail_name or "")

    def test_detect_snowpack_intent(self):
        query = "What is the current snowpack depth on Skyline Trail?"
        intent = detect_field_reports_intent(query)
        assert intent is not None
        assert intent.action == "snowpack"
        assert "Skyline" in (intent.trail_name or "")

    def test_detect_muddy_or_blowdowns_intent(self):
        query = "Are there muddy trails or blowdowns reported recently?"
        intent = detect_field_reports_intent(query)
        assert intent is not None
        assert intent.action in ["conditions", "alerts"]

    def test_non_field_report_queries(self):
        assert detect_field_reports_intent("What backpacking tents do you sell?") is None
        assert detect_field_reports_intent("Where is my package CTSO-TRK-12345?") is None
        assert detect_field_reports_intent("Can I return this sleeping bag?") is None
        assert detect_field_reports_intent("") is None
        assert detect_field_reports_intent("   ") is None


class TestBuildPromptAndResponseFormatting:
    def test_build_field_reports_prompt(self):
        intent = FieldReportsIntent(action="conditions", trail_name="Mount Si", hazard_only=False)
        prompt = build_field_reports_prompt(intent)
        assert "Community Trail Field Reports" in prompt
        assert "Mount Si" in prompt

    def test_format_field_reports_response_conditions(self):
        intent = FieldReportsIntent(action="conditions", trail_name="Mount Si & Skyline Trail", hazard_only=False)
        res = format_field_reports_response(intent)
        assert "answer" in res
        assert "field_reports_info" in res
        info = res["field_reports_info"]
        assert info["action"] == "conditions"
        assert len(info["reports"]) >= 2
        assert "Mount Si" in res["answer"]
        assert "Skyline Trail" in res["answer"]

    def test_format_field_reports_response_alerts(self):
        intent = FieldReportsIntent(action="alerts", trail_name="The Enchantments", hazard_only=True)
        res = format_field_reports_response(intent)
        assert "answer" in res
        assert "field_reports_info" in res
        info = res["field_reports_info"]
        assert info["action"] == "alerts"
        assert len(info["alerts"]) == 1
        assert "Snow Bridges" in res["answer"] or "snow bridge" in res["answer"].lower()
