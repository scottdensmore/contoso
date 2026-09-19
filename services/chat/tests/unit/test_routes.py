import xml.etree.ElementTree as ET

import pytest
from contoso_chat.routes import (
    RouteExportRequest,
    RouteExportResponse,
    RouteIntent,
    TrailRouteModel,
    WaypointModel,
    build_route_prompt,
    detect_route_intent,
    export_route_file,
    format_route_response,
    generate_gpx_track,
    get_gps_navigation_safety_protocol,
    get_trail_route_by_id,
    get_trail_routes,
)


def test_waypoint_model():
    wp = WaypointModel(
        name="Colchuck Lake",
        mile=4.2,
        elevation_feet=5570,
        coordinates=(47.4975, -120.8358),
        waypoint_type="lake",
        notes="Turquoise alpine lake below Dragontail Peak",
    )
    assert wp.name == "Colchuck Lake"
    assert wp.mile == 4.2
    assert wp.elevation_feet == 5570
    assert wp.coordinates == (47.4975, -120.8358)
    assert wp.waypoint_type == "lake"
    assert "Dragontail Peak" in wp.notes


def test_trail_route_model():
    wp = WaypointModel(
        name="Colchuck Lake",
        mile=4.2,
        elevation_feet=5570,
        coordinates=(47.4975, -120.8358),
        waypoint_type="lake",
        notes="Turquoise alpine lake",
    )
    route = TrailRouteModel(
        route_id="test-route",
        name="Test Route",
        region="Cascades",
        wilderness_area="Test Wilderness",
        distance_miles=10.0,
        elevation_gain_feet=2500,
        highest_point_feet=6000,
        difficulty="moderate",
        estimated_hours=5.0,
        waypoints=[wp],
        highlights=["Test Vista"],
        gpx_download_url="/api/routes/export?route_id=test-route",
    )
    assert route.route_id == "test-route"
    assert len(route.waypoints) == 1
    assert route.waypoints[0].name == "Colchuck Lake"
    assert route.gpx_download_url == "/api/routes/export?route_id=test-route"


def test_route_export_request_defaults_and_validation():
    req = RouteExportRequest(route_id="enchantments-thru-hike")
    assert req.route_id == "enchantments-thru-hike"
    assert req.format == "gpx"
    assert req.include_waypoints is True

    req_custom = RouteExportRequest(
        route_id="spray-park-loop", format="gpx", include_waypoints=False
    )
    assert req_custom.include_waypoints is False


def test_get_trail_routes_catalog_and_filtering():
    all_routes = get_trail_routes()
    assert len(all_routes) == 5
    route_ids = {r.route_id for r in all_routes}
    expected_ids = {
        "enchantments-thru-hike",
        "spray-park-loop",
        "hoh-river-blue-glacier",
        "goat-rocks-knife-edge",
        "rattlesnake-ledge",
    }
    assert route_ids == expected_ids

    # Check Enchantments data
    ench = get_trail_route_by_id("enchantments-thru-hike")
    assert ench is not None
    assert ench.name == "The Enchantments Thru-Hike"
    assert ench.region == "Cascades"
    assert ench.wilderness_area == "Alpine Lakes Wilderness"
    assert ench.distance_miles == 18.5
    assert ench.elevation_gain_feet == 4500
    assert ench.highest_point_feet == 7841
    assert ench.difficulty == "expert"
    assert ench.estimated_hours == 12.0
    wp_names = [w.name for w in ench.waypoints]
    assert any("Colchuck Lake" in name for name in wp_names)
    assert any("Aasgard Pass" in name for name in wp_names)

    # Check Spray Park Loop data
    spray = get_trail_route_by_id("spray-park-loop")
    assert spray is not None
    assert spray.name == "Spray Park & Mount Rainier Loop"
    assert spray.region == "Mount Rainier"
    assert spray.distance_miles == 16.0
    assert spray.elevation_gain_feet == 3600
    assert spray.highest_point_feet == 6400
    assert spray.difficulty == "strenuous"
    assert spray.estimated_hours == 8.5

    # Check Hoh River Blue Glacier
    hoh = get_trail_route_by_id("hoh-river-blue-glacier")
    assert hoh is not None
    assert hoh.name == "Hoh River Trail to Blue Glacier"
    assert hoh.region == "Olympic National Park"
    assert hoh.distance_miles == 34.8
    assert hoh.elevation_gain_feet == 3700
    assert hoh.highest_point_feet == 4300
    assert hoh.difficulty == "strenuous"
    assert hoh.estimated_hours == 20.0

    # Check Goat Rocks Knife Edge
    goat = get_trail_route_by_id("goat-rocks-knife-edge")
    assert goat is not None
    assert goat.name == "Goat Rocks Wilderness Knife's Edge"
    assert goat.region == "Cascades"
    assert goat.distance_miles == 12.4
    assert goat.elevation_gain_feet == 3200
    assert goat.highest_point_feet == 6900
    assert goat.difficulty == "strenuous"
    assert goat.estimated_hours == 7.5

    # Check Rattlesnake Ledge
    rat = get_trail_route_by_id("rattlesnake-ledge")
    assert rat is not None
    assert rat.name == "Rattlesnake Ledge Trail"
    assert rat.region == "North Bend / I-90 corridor"
    assert rat.distance_miles == 4.0
    assert rat.elevation_gain_feet == 1160
    assert rat.highest_point_feet == 2070
    assert rat.difficulty == "easy"
    assert rat.estimated_hours == 2.0

    # Filter by difficulty
    expert_routes = get_trail_routes(difficulty="expert")
    assert len(expert_routes) == 1
    assert expert_routes[0].route_id == "enchantments-thru-hike"

    # Filter by region
    rainier_routes = get_trail_routes(region="Mount Rainier")
    assert len(rainier_routes) == 1
    assert rainier_routes[0].route_id == "spray-park-loop"

    # Filter by search
    glacier_routes = get_trail_routes(search="Blue Glacier")
    assert len(glacier_routes) == 1
    assert glacier_routes[0].route_id == "hoh-river-blue-glacier"

    # Search with no match
    empty_routes = get_trail_routes(search="Nonexistent Mountain 9999")
    assert len(empty_routes) == 0


def test_get_trail_route_by_id_not_found():
    assert get_trail_route_by_id("non-existent-trail") is None


def test_generate_gpx_track():
    route = get_trail_route_by_id("enchantments-thru-hike")
    assert route is not None

    gpx_xml = generate_gpx_track(route, include_waypoints=True)
    assert gpx_xml.startswith("<?xml")
    assert "<gpx" in gpx_xml
    assert "<trk>" in gpx_xml
    assert f"<name>{route.name}</name>" in gpx_xml
    assert "<trkseg>" in gpx_xml
    assert "<trkpt" in gpx_xml
    assert "<wpt" in gpx_xml
    assert "Colchuck Lake" in gpx_xml
    assert "Aasgard Pass" in gpx_xml

    # Verify it is well-formed XML
    root = ET.fromstring(gpx_xml)
    assert root.tag.endswith("gpx")

    # Verify without waypoints
    gpx_no_wpt = generate_gpx_track(route, include_waypoints=False)
    assert "<wpt" not in gpx_no_wpt
    assert "<trkpt" in gpx_no_wpt


def test_export_route_file():
    req = RouteExportRequest(route_id="enchantments-thru-hike", format="gpx", include_waypoints=True)
    resp = export_route_file(req)
    assert isinstance(resp, RouteExportResponse)
    assert resp.route_id == "enchantments-thru-hike"
    assert resp.format == "gpx"
    assert resp.filename == "enchantments-thru-hike.gpx"
    assert resp.file_size_bytes == len(resp.content.encode("utf-8"))
    assert "<gpx" in resp.content

    # Error on unknown route
    invalid_req = RouteExportRequest(route_id="invalid-route")
    with pytest.raises(ValueError, match="not found"):
        export_route_file(invalid_req)


def test_get_gps_navigation_safety_protocol():
    proto = get_gps_navigation_safety_protocol()
    assert isinstance(proto, dict)
    assert "title" in proto
    assert "offline_navigation" in proto
    assert "satellite_communicator" in proto
    assert "power_management" in proto
    assert "redundancy_guidelines" in proto
    assert "emergency_protocol" in proto
    assert proto["map_datum"] == "WGS84"


def test_detect_route_intent():
    # Export intent
    intent_export = detect_route_intent("Can I download the GPX track file for The Enchantments thru-hike?")
    assert intent_export is not None
    assert intent_export.action == "export"
    assert intent_export.route_id == "enchantments-thru-hike"

    # Elevation intent
    intent_ele = detect_route_intent("What is the elevation gain and highest point for Spray Park loop?")
    assert intent_ele is not None
    assert intent_ele.action == "elevation"
    assert intent_ele.route_id == "spray-park-loop"

    # Waypoints intent
    intent_wp = detect_route_intent("What are the waypoints and landmarks along the Goat Rocks Knife's Edge trail?")
    assert intent_wp is not None
    assert intent_wp.action == "waypoints"
    assert intent_wp.route_id == "goat-rocks-knife-edge"

    # Route details intent
    intent_det = detect_route_intent("Tell me all details about the Hoh River Trail to Blue Glacier route")
    assert intent_det is not None
    assert intent_det.action == "details"
    assert intent_det.route_id == "hoh-river-blue-glacier"

    # List intent with filter
    intent_list = detect_route_intent("Show me expert hiking routes in the Cascades")
    assert intent_list is not None
    assert intent_list.action == "list"
    assert intent_list.difficulty == "expert" or intent_list.region == "Cascades"

    # Safety intent
    intent_safety = detect_route_intent("What is the offline GPS navigation safety protocol for backcountry hiking?")
    assert intent_safety is not None
    assert intent_safety.action == "safety"

    # Unrelated query
    intent_none = detect_route_intent("Can I get a discount code for wool socks?")
    assert intent_none is None


def test_build_route_prompt():
    intent_list = RouteIntent(action="list", difficulty="expert")
    prompt_list = build_route_prompt(intent_list)
    assert "Wilderness Route Navigation System" in prompt_list
    assert "expert" in prompt_list

    intent_details = RouteIntent(action="details", route_id="enchantments-thru-hike")
    prompt_details = build_route_prompt(intent_details)
    assert "The Enchantments Thru-Hike" in prompt_details
    assert "4,500 ft" in prompt_details or "4500" in prompt_details

    intent_export = RouteIntent(action="export", route_id="spray-park-loop")
    prompt_export = build_route_prompt(intent_export)
    assert "GPX" in prompt_export
    assert "Spray Park" in prompt_export

    intent_safety = RouteIntent(action="safety")
    prompt_safety = build_route_prompt(intent_safety)
    assert "GPS Navigation & Offline Safety Protocol" in prompt_safety


def test_format_route_response():
    # List format
    res_list = format_route_response(RouteIntent(action="list", difficulty="expert"))
    assert "answer" in res_list
    assert "route_info" in res_list
    assert res_list["route_info"]["action"] == "list"
    assert len(res_list["route_info"]["routes"]) == 1
    assert "The Enchantments Thru-Hike" in res_list["answer"]

    # Details format
    res_det = format_route_response(RouteIntent(action="details", route_id="spray-park-loop"))
    assert res_det["route_info"]["action"] == "details"
    assert res_det["route_info"]["route"]["route_id"] == "spray-park-loop"
    assert "Spray Park & Mount Rainier Loop" in res_det["answer"]
    assert "16.0 miles" in res_det["answer"] or "16" in res_det["answer"]

    # Export format
    res_exp = format_route_response(RouteIntent(action="export", route_id="enchantments-thru-hike"))
    assert res_exp["route_info"]["action"] == "export"
    assert res_exp["route_info"]["export"]["filename"] == "enchantments-thru-hike.gpx"
    assert "enchantments-thru-hike.gpx" in res_exp["answer"]

    # Waypoints format
    res_wp = format_route_response(RouteIntent(action="waypoints", route_id="enchantments-thru-hike"))
    assert res_wp["route_info"]["action"] == "waypoints"
    assert len(res_wp["route_info"]["waypoints"]) > 0
    assert "Aasgard Pass" in res_wp["answer"]
    assert "Colchuck Lake" in res_wp["answer"]

    # Elevation format
    res_ele = format_route_response(RouteIntent(action="elevation", route_id="goat-rocks-knife-edge"))
    assert res_ele["route_info"]["action"] == "elevation"
    assert res_ele["route_info"]["highest_point_feet"] == 6900
    assert "6,900 ft" in res_ele["answer"] or "6900" in res_ele["answer"]

    # Safety format
    res_safe = format_route_response(RouteIntent(action="safety"))
    assert res_safe["route_info"]["action"] == "safety"
    assert "GPS Navigation & Offline Safety Protocol" in res_safe["answer"]
