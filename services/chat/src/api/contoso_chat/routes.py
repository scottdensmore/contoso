import re
from typing import Any, Optional

from pydantic import BaseModel, Field


class WaypointModel(BaseModel):
    name: str
    mile: float
    elevation_feet: int
    coordinates: tuple[float, float]
    waypoint_type: str
    notes: str


class TrailRouteModel(BaseModel):
    route_id: str
    name: str
    region: str
    wilderness_area: str
    distance_miles: float
    elevation_gain_feet: int
    highest_point_feet: int
    difficulty: str
    estimated_hours: float
    waypoints: list[WaypointModel] = Field(default_factory=list)
    highlights: list[str] = Field(default_factory=list)
    gpx_download_url: str


class RouteExportRequest(BaseModel):
    route_id: str
    format: str = "gpx"
    include_waypoints: bool = True


class RouteExportResponse(BaseModel):
    route_id: str
    format: str
    content: str
    filename: str
    file_size_bytes: int


class RouteIntent(BaseModel):
    action: str  # "list", "details", "export", "waypoints", "elevation", "safety"
    route_id: Optional[str] = None
    region: Optional[str] = None
    difficulty: Optional[str] = None
    search_query: Optional[str] = None


ROUTE_CATALOG: dict[str, TrailRouteModel] = {
    "enchantments-thru-hike": TrailRouteModel(
        route_id="enchantments-thru-hike",
        name="The Enchantments Thru-Hike",
        region="Cascades",
        wilderness_area="Alpine Lakes Wilderness",
        distance_miles=18.5,
        elevation_gain_feet=4500,
        highest_point_feet=7841,
        difficulty="expert",
        estimated_hours=12.0,
        waypoints=[
            WaypointModel(
                name="Stuart / Colchuck Lake Trailhead",
                mile=0.0,
                elevation_feet=3400,
                coordinates=(47.5278, -120.8206),
                waypoint_type="trailhead",
                notes="Starting trailhead at Bridge Creek campground access; NW Forest Pass required.",
            ),
            WaypointModel(
                name="Colchuck Lake",
                mile=4.2,
                elevation_feet=5570,
                coordinates=(47.4975, -120.8358),
                waypoint_type="lake",
                notes="Spectacular turquoise alpine lake sitting beneath Dragontail and Colchuck Peaks.",
            ),
            WaypointModel(
                name="Aasgard Pass",
                mile=6.5,
                elevation_feet=7841,
                coordinates=(47.4883, -120.8278),
                waypoint_type="pass",
                notes="Grueling 2,200 ft scramble in 0.8 miles; stay left of the tree island; high alpine summit.",
            ),
            WaypointModel(
                name="Upper Enchantment Basin",
                mile=7.2,
                elevation_feet=7600,
                coordinates=(47.4851, -120.8165),
                waypoint_type="basin",
                notes="Glaciated granite terrain, persistent snowpack, Isolation Lake vistas.",
            ),
            WaypointModel(
                name="Perfection Lake",
                mile=8.3,
                elevation_feet=7150,
                coordinates=(47.4812, -120.7984),
                waypoint_type="lake",
                notes="Heart of the Core Enchantments, golden larches, Mountain goat habitat.",
            ),
            WaypointModel(
                name="Snow Lakes",
                mile=12.0,
                elevation_feet=5400,
                coordinates=(47.4695, -120.7512),
                waypoint_type="lake",
                notes="Lower basin lake complex; start of long, rocky switchback descent.",
            ),
            WaypointModel(
                name="Snow Lakes Trailhead",
                mile=18.5,
                elevation_feet=1350,
                coordinates=(47.5432, -120.6975),
                waypoint_type="trailhead",
                notes="Icicle Creek terminus; designated shuttle pickup point.",
            ),
        ],
        highlights=[
            "Colchuck Lake",
            "Aasgard Pass Scramble",
            "Upper & Lower Enchantment Basins",
            "Perfection Lake & Prusik Peak",
            "Golden Larches & Alpine Tarns",
            "Snow Lakes Descent",
        ],
        gpx_download_url="/api/routes/export?route_id=enchantments-thru-hike",
    ),
    "spray-park-loop": TrailRouteModel(
        route_id="spray-park-loop",
        name="Spray Park & Mount Rainier Loop",
        region="Mount Rainier",
        wilderness_area="Mount Rainier Wilderness",
        distance_miles=16.0,
        elevation_gain_feet=3600,
        highest_point_feet=6400,
        difficulty="strenuous",
        estimated_hours=8.5,
        waypoints=[
            WaypointModel(
                name="Mowich Lake Trailhead",
                mile=0.0,
                elevation_feet=4929,
                coordinates=(46.9333, -121.8631),
                waypoint_type="trailhead",
                notes="Northwest entrance trailhead at Mowich Lake patrol cabin.",
            ),
            WaypointModel(
                name="Spray Falls Spur",
                mile=2.1,
                elevation_feet=4600,
                coordinates=(46.9242, -121.8411),
                waypoint_type="waterfall",
                notes="Vigorous 354-foot cascading waterfall fed by Spray Glacier.",
            ),
            WaypointModel(
                name="Spray Park Meadows",
                mile=3.5,
                elevation_feet=5800,
                coordinates=(46.9208, -121.8214),
                waypoint_type="meadow",
                notes="Expansive subalpine wildflower meadows with dramatic views of Mount Rainier.",
            ),
            WaypointModel(
                name="Seattle Park High Point",
                mile=5.8,
                elevation_feet=6400,
                coordinates=(46.9312, -121.8021),
                waypoint_type="pass",
                notes="Highest point on the loop with sweeping northern Rainier glacier panoramas.",
            ),
            WaypointModel(
                name="Carbon River Suspension Bridge",
                mile=10.2,
                elevation_feet=3100,
                coordinates=(46.9856, -121.7822),
                waypoint_type="bridge",
                notes="High suspension footbridge over glacial Carbon River; Wonderland Trail junction.",
            ),
            WaypointModel(
                name="Ipsut Pass Junction",
                mile=13.5,
                elevation_feet=5100,
                coordinates=(46.9532, -121.8412),
                waypoint_type="pass",
                notes="Steep wooded switchbacks regaining ridge elevation toward Mowich.",
            ),
            WaypointModel(
                name="Mowich Lake Campground Finish",
                mile=16.0,
                elevation_feet=4929,
                coordinates=(46.9333, -121.8631),
                waypoint_type="trailhead",
                notes="Completed loop returning to Mowich Lake parking area.",
            ),
        ],
        highlights=[
            "Spray Falls",
            "Spray Park Wildflower Meadows",
            "Seattle Park Panoramic Overlook",
            "Carbon River Suspension Bridge",
            "Mowich Lake Basin",
        ],
        gpx_download_url="/api/routes/export?route_id=spray-park-loop",
    ),
    "hoh-river-blue-glacier": TrailRouteModel(
        route_id="hoh-river-blue-glacier",
        name="Hoh River Trail to Blue Glacier",
        region="Olympic National Park",
        wilderness_area="Olympic Wilderness",
        distance_miles=34.8,
        elevation_gain_feet=3700,
        highest_point_feet=4300,
        difficulty="strenuous",
        estimated_hours=20.0,
        waypoints=[
            WaypointModel(
                name="Hoh Rain Forest Visitor Center",
                mile=0.0,
                elevation_feet=580,
                coordinates=(47.8601, -123.9351),
                waypoint_type="trailhead",
                notes="Trailhead in temperate rain forest; giant sitka spruce and moss canopies.",
            ),
            WaypointModel(
                name="Olympus Guard Station",
                mile=9.1,
                elevation_feet=960,
                coordinates=(47.8012, -123.8123),
                waypoint_type="campsite",
                notes="Historic ranger station and gravel bar camping along Hoh River.",
            ),
            WaypointModel(
                name="Elk Lake Camp",
                mile=15.1,
                elevation_feet=2500,
                coordinates=(47.8095, -123.7225),
                waypoint_type="lake",
                notes="Subalpine lake shelter marking the transition to steep mountain grades.",
            ),
            WaypointModel(
                name="Glacier Meadows Basecamp",
                mile=17.1,
                elevation_feet=4200,
                coordinates=(47.8105, -123.6821),
                waypoint_type="campsite",
                notes="High camp for Mount Olympus climbers; avalanche washout ladder section nearby.",
            ),
            WaypointModel(
                name="Blue Glacier Lateral Moraine",
                mile=17.4,
                elevation_feet=4300,
                coordinates=(47.8055, -123.6705),
                waypoint_type="viewpoint",
                notes="Breathtaking amphitheater overlook of Blue Glacier ice fall and Mt Olympus massif.",
            ),
        ],
        highlights=[
            "Old Growth Temperate Rainforest",
            "Olympic Roosevelt Elk Meadows",
            "High Olympus Camp & Washout Ladder",
            "Lateral Moraine Overlook",
            "Blue Glacier Icefall & Crevasses",
        ],
        gpx_download_url="/api/routes/export?route_id=hoh-river-blue-glacier",
    ),
    "goat-rocks-knife-edge": TrailRouteModel(
        route_id="goat-rocks-knife-edge",
        name="Goat Rocks Wilderness Knife's Edge",
        region="Cascades",
        wilderness_area="Goat Rocks Wilderness",
        distance_miles=12.4,
        elevation_gain_feet=3200,
        highest_point_feet=6900,
        difficulty="strenuous",
        estimated_hours=7.5,
        waypoints=[
            WaypointModel(
                name="Snowgrass Trailhead",
                mile=0.0,
                elevation_feet=4620,
                coordinates=(46.4678, -121.5175),
                waypoint_type="trailhead",
                notes="Chambers Lake access to Trail #96 into high subalpine zones.",
            ),
            WaypointModel(
                name="Snowgrass Flats Junction",
                mile=4.1,
                elevation_feet=6000,
                coordinates=(46.4952, -121.4921),
                waypoint_type="junction",
                notes="Vibrant wildflower meadows junction connecting with Pacific Crest Trail Section H.",
            ),
            WaypointModel(
                name="Packwood Glacier Overlook",
                mile=5.5,
                elevation_feet=6500,
                coordinates=(46.5055, -121.4812),
                waypoint_type="viewpoint",
                notes="Panoramic vista of remaining Packwood Glacier icefield and Mount Adams.",
            ),
            WaypointModel(
                name="Knife's Edge Ridge Crest",
                mile=6.2,
                elevation_feet=6900,
                coordinates=(46.5123, -121.4721),
                waypoint_type="ridge",
                notes="Iconic narrow, rocky knife-edge ridgeline with steep vertical drops on both flanks.",
            ),
            WaypointModel(
                name="Goat Lake Outlet",
                mile=9.0,
                elevation_feet=6400,
                coordinates=(46.4988, -121.4688),
                waypoint_type="lake",
                notes="Glacier-fed alpine tarn under Gilbert Peak surrounded by snow banks.",
            ),
        ],
        highlights=[
            "Snowgrass Flats Wildflowers",
            "Cispus Basin Alpine Cascades",
            "PCT Knife's Edge Exposed Ridge",
            "Old Snowy Mountain & Mount Adams Views",
            "Goat Lake Ice-Melt Basin",
        ],
        gpx_download_url="/api/routes/export?route_id=goat-rocks-knife-edge",
    ),
    "rattlesnake-ledge": TrailRouteModel(
        route_id="rattlesnake-ledge",
        name="Rattlesnake Ledge Trail",
        region="North Bend / I-90 corridor",
        wilderness_area="Rattlesnake Mountain Scenic Area",
        distance_miles=4.0,
        elevation_gain_feet=1160,
        highest_point_feet=2070,
        difficulty="easy",
        estimated_hours=2.0,
        waypoints=[
            WaypointModel(
                name="Rattlesnake Lake Trailhead",
                mile=0.0,
                elevation_feet=910,
                coordinates=(47.4347, -121.7684),
                waypoint_type="trailhead",
                notes="Cedar River Watershed education center trailhead with paved parking and restrooms.",
            ),
            WaypointModel(
                name="Mid-Mountain Switchback Bench",
                mile=1.0,
                elevation_feet=1450,
                coordinates=(47.4392, -121.7712),
                waypoint_type="rest_area",
                notes="Wooden resting bench halfway through dense Douglas fir switchbacks.",
            ),
            WaypointModel(
                name="Lower Rattlesnake Ledge",
                mile=2.0,
                elevation_feet=2070,
                coordinates=(47.4421, -121.7745),
                waypoint_type="viewpoint",
                notes="Massive exposed granite rock shelf overlooking Rattlesnake Lake and Mount Si.",
            ),
        ],
        highlights=[
            "Rattlesnake Lake Shoreline",
            "Well-Graded Switchbacks",
            "Panoramic Ledge Vistas",
            "Chester Morse Lake Basin Outlook",
        ],
        gpx_download_url="/api/routes/export?route_id=rattlesnake-ledge",
    ),
}


def get_trail_routes(
    region: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
) -> list[TrailRouteModel]:
    """Filter and return trail routes from catalog."""
    results = list(ROUTE_CATALOG.values())

    if region and region.strip():
        reg_clean = region.strip().lower()
        results = [r for r in results if reg_clean in r.region.lower()]

    if difficulty and difficulty.strip():
        diff_clean = difficulty.strip().lower()
        results = [r for r in results if diff_clean in r.difficulty.lower()]

    if search and search.strip():
        term = search.strip().lower()
        matched = []
        for r in results:
            if (
                term in r.name.lower()
                or term in r.region.lower()
                or term in r.wilderness_area.lower()
                or any(term in h.lower() for h in r.highlights)
                or any(term in w.name.lower() for w in r.waypoints)
            ):
                matched.append(r)
        results = matched

    return results


def get_trail_route_by_id(route_id: str) -> Optional[TrailRouteModel]:
    """Retrieve single trail route by identifier."""
    if not route_id:
        return None
    key = route_id.strip().lower()
    return ROUTE_CATALOG.get(key)


def generate_gpx_track(route: TrailRouteModel, include_waypoints: bool = True) -> str:
    """Generates a valid GPX 1.1 XML string for the specified route."""
    lines: list[str] = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        (
            '<gpx version="1.1" creator="Contoso Outdoors GPS Navigation" '
            'xmlns="http://www.topografix.com/GPX/1/1" '
            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
            'xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">'
        ),
        '  <metadata>',
        f'    <name>{route.name}</name>',
        f'    <desc>Route in {route.region} ({route.wilderness_area}) - {route.distance_miles} miles, {route.elevation_gain_feet} ft gain, Difficulty: {route.difficulty}</desc>',
        '    <author><name>Contoso Outdoors</name></author>',
        '  </metadata>',
    ]

    if include_waypoints:
        for wp in route.waypoints:
            lat, lon = wp.coordinates
            ele_meters = round(wp.elevation_feet * 0.3048, 1)
            lines.append(f'  <wpt lat="{lat}" lon="{lon}">')
            lines.append(f'    <ele>{ele_meters}</ele>')
            lines.append(f'    <name>{wp.name}</name>')
            lines.append(f'    <desc>Mile {wp.mile}: {wp.notes}</desc>')
            lines.append(f'    <type>{wp.waypoint_type}</type>')
            lines.append('  </wpt>')

    lines.append('  <trk>')
    lines.append(f'    <name>{route.name}</name>')
    lines.append('    <trkseg>')
    for wp in route.waypoints:
        lat, lon = wp.coordinates
        ele_meters = round(wp.elevation_feet * 0.3048, 1)
        lines.append(f'      <trkpt lat="{lat}" lon="{lon}">')
        lines.append(f'        <ele>{ele_meters}</ele>')
        lines.append(f'        <name>{wp.name}</name>')
        lines.append('      </trkpt>')
    lines.append('    </trkseg>')
    lines.append('  </trk>')
    lines.append('</gpx>')

    return "\n".join(lines)


def export_route_file(req: RouteExportRequest) -> RouteExportResponse:
    """Builds and exports a GPX route file response."""
    route = get_trail_route_by_id(req.route_id)
    if not route:
        raise ValueError(f"Route '{req.route_id}' not found in catalog")

    content = generate_gpx_track(route, include_waypoints=req.include_waypoints)
    filename = f"{route.route_id}.{req.format}"
    file_size_bytes = len(content.encode("utf-8"))

    return RouteExportResponse(
        route_id=route.route_id,
        format=req.format,
        content=content,
        filename=filename,
        file_size_bytes=file_size_bytes,
    )


def get_gps_navigation_safety_protocol() -> dict[str, Any]:
    """Returns comprehensive GPS navigation and offline backcountry safety protocol."""
    return {
        "title": "Contoso Outdoors GPS Navigation & Offline Safety Protocol",
        "map_datum": "WGS84",
        "coordinate_formats": ["Decimal Degrees (DD)", "UTM / UPS", "Degrees, Minutes, Seconds (DMS)"],
        "offline_navigation": {
            "pre_trip": [
                "Download high-resolution 1:24,000 USGS topographic base maps before leaving cellular coverage.",
                "Cache vector trail layers, satellite imagery, and slope angle shading profiles.",
                "Export and preload GPX tracks and emergency waypoints to secondary GPS units and smartphones.",
            ],
            "in_field": [
                "Cross-reference GPS coordinates with physical landmarks at every trail junction.",
                "Set route tracking interval to 5-10 minutes to balance track accuracy and battery life.",
                "Mark campsite, key water crossings, and bailout route waypoints upon arrival.",
            ],
        },
        "satellite_communicator": {
            "recommended_devices": ["Garmin inReach Mini 2 / Messenger", "ZOLEO Satellite Communicator", "Dedicated 406 MHz PLB"],
            "protocols": [
                "Ensure active Iridium satellite subscription before departing.",
                "Send daily check-in message with coordinates at camp setup and morning departure.",
                "Keep emergency SOS button covered with protective latch to prevent accidental triggers.",
            ],
        },
        "power_management": {
            "guidelines": [
                "Maintain phone in Airplane Mode with Location Services (GPS) active.",
                "Carry a cold-rated 10,000mAh - 20,000mAh external battery power bank.",
                "In sub-freezing temperatures, store electronics inside your sleeping bag or inner jacket pocket.",
                "Carry dedicated charging cables matching each device port.",
            ],
        },
        "redundancy_guidelines": {
            "primary": "GPS receiver or dedicated mapping app (Gaia GPS, OnX Backcountry, CalTopo).",
            "secondary": "Waterproof paper topographic map (1:24,000 scale) and sighting compass.",
            "tertiary": "Pre-configured compass declination (Pacific Northwest varies 14°-16° East).",
        },
        "emergency_protocol": {
            "lost_or_disoriented": "STOP protocol: Stop, Think, Observe, Plan. Do not continue downhill into drainages without established trails.",
            "sar_activation": "If incapacitated or facing life-threatening conditions, trigger satellite SOS and remain stationary under shelter.",
            "overdue_trip_plan": "Leave detailed route plan and strict turnaround cutoff times with designated home emergency contact.",
        },
    }


def detect_route_intent(query: str) -> Optional[RouteIntent]:
    """Detects customer intents regarding wilderness routes, GPS navigation, waypoints, elevations, and safety."""
    if not query:
        return None

    q_lower = query.lower()

    # Disqualify queries that are explicitly shuttle, permit, or weather/conditions unless GPX/GPS is explicitly asked
    has_shuttle = bool(re.search(r"\b(shuttle|connector|carpool|seats?)\b", q_lower))
    has_permits = bool(re.search(r"\b(permit|permits|lottery)\b", q_lower))
    has_trail_conditions = bool(re.search(r"\b(weather|condition|conditions|status|temperature|packing\s+checklist)\b", q_lower))
    has_explicit_gps_gpx = bool(re.search(r"\b(gpx|gps|waypoint|waypoints|elevation\s+profile|gpx\s+download|download\s+gpx|export)\b", q_lower))

    if (has_shuttle or has_permits or has_trail_conditions) and not has_explicit_gps_gpx:
        return None

    # Route identification
    matched_route_id: Optional[str] = None
    if "enchantment" in q_lower:
        matched_route_id = "enchantments-thru-hike"
    elif "spray park" in q_lower or "mowich" in q_lower:
        matched_route_id = "spray-park-loop"
    elif "hoh river" in q_lower or "blue glacier" in q_lower:
        matched_route_id = "hoh-river-blue-glacier"
    elif "goat rock" in q_lower or "knife" in q_lower or "knife's edge" in q_lower or "knifes edge" in q_lower:
        matched_route_id = "goat-rocks-knife-edge"
    elif "rattlesnake ledge" in q_lower or ("rattlesnake" in q_lower and "ledge" in q_lower):
        matched_route_id = "rattlesnake-ledge"

    # Region identification
    matched_region: Optional[str] = None
    if "rainier" in q_lower:
        matched_region = "Mount Rainier"
    elif "olympic" in q_lower:
        matched_region = "Olympic National Park"
    elif "cascade" in q_lower:
        matched_region = "Cascades"
    elif "north bend" in q_lower or "i-90" in q_lower or "i90" in q_lower:
        matched_region = "North Bend / I-90 corridor"

    # Difficulty identification
    matched_difficulty: Optional[str] = None
    if "expert" in q_lower:
        matched_difficulty = "expert"
    elif "strenuous" in q_lower or "hard" in q_lower:
        matched_difficulty = "strenuous"
    elif "moderate" in q_lower:
        matched_difficulty = "moderate"
    elif "easy" in q_lower:
        matched_difficulty = "easy"

    # Keywords detection
    has_gpx = bool(re.search(r"\b(gpx|download\s+gpx|export|gps\s+track|track\s+file)\b", q_lower))
    has_elevation = bool(re.search(r"\b(elevation|elevation\s+gain|highest\s+point|elevation\s+profile|vertical|steep|climb)\b", q_lower))
    has_waypoints = bool(re.search(r"\b(waypoint|waypoints|landmark|landmarks|coordinates|mile\s+marker)\b", q_lower))
    has_safety = bool(re.search(r"\b(safety\s+protocol|gps\s+safety|offline\s+navigation|offline\s+maps?|offline\s+gps|satellite\s+beacon|navigation\s+safety)\b", q_lower))
    has_list = bool(re.search(r"\b(list|show\s+me|find|recommend|routes|hiking\s+routes|trail\s+routes)\b", q_lower))
    has_details = bool(re.search(r"\b(detail|details|info|tell\s+me\s+about|guide|trail\s+info)\b", q_lower))
    has_route_term = bool(re.search(r"\b(route|routes|thru-hike|loop)\b", q_lower))

    is_route_topic = (
        has_safety
        or has_gpx
        or has_elevation
        or has_waypoints
        or (matched_route_id is not None and (has_details or has_route_term or has_list))
        or (has_route_term and (has_list or matched_difficulty is not None or matched_region is not None))
    )

    if not is_route_topic:
        return None

    # Determine action
    if has_safety:
        return RouteIntent(action="safety", route_id=matched_route_id, region=matched_region, difficulty=matched_difficulty)
    elif has_gpx:
        return RouteIntent(action="export", route_id=matched_route_id, region=matched_region, difficulty=matched_difficulty)
    elif has_elevation:
        return RouteIntent(action="elevation", route_id=matched_route_id, region=matched_region, difficulty=matched_difficulty)
    elif has_waypoints:
        return RouteIntent(action="waypoints", route_id=matched_route_id, region=matched_region, difficulty=matched_difficulty)
    elif matched_route_id and (has_details or not has_list):
        return RouteIntent(action="details", route_id=matched_route_id, region=matched_region, difficulty=matched_difficulty)
    elif has_list or matched_difficulty or matched_region:
        return RouteIntent(action="list", route_id=matched_route_id, region=matched_region, difficulty=matched_difficulty)
    elif matched_route_id:
        return RouteIntent(action="details", route_id=matched_route_id, region=matched_region, difficulty=matched_difficulty)

    return RouteIntent(action="list", route_id=matched_route_id, region=matched_region, difficulty=matched_difficulty)


def build_route_prompt(intent: RouteIntent) -> str:
    """Builds instructions and context for LLM prompt generation based on RouteIntent."""
    lines: list[str] = [
        "### Wilderness Route Navigation System",
        f"Action Requested: {intent.action.upper()}",
    ]

    if intent.action == "safety":
        proto = get_gps_navigation_safety_protocol()
        lines.append("Safety Protocol:")
        lines.append(f"- Title: {proto['title']}")
        lines.append(f"- Map Datum: {proto['map_datum']}")
        lines.append(f"- Offline Navigation: {'; '.join(proto['offline_navigation']['pre_trip'])}")
        lines.append(f"- Satellite Communicators: {'; '.join(proto['satellite_communicator']['protocols'])}")
        lines.append(f"- Battery & Power: {'; '.join(proto['power_management']['guidelines'])}")
        lines.append(f"- Navigation Redundancy: Primary ({proto['redundancy_guidelines']['primary']}), Secondary ({proto['redundancy_guidelines']['secondary']})")
        lines.append(f"- Emergency Protocol: {proto['emergency_protocol']['lost_or_disoriented']}")
    elif intent.action == "list":
        routes = get_trail_routes(region=intent.region, difficulty=intent.difficulty, search=intent.search_query)
        lines.append(f"Filtered Routes ({len(routes)} found):")
        if intent.difficulty:
            lines.append(f"- Difficulty Filter: {intent.difficulty}")
        if intent.region:
            lines.append(f"- Region Filter: {intent.region}")
        for r in routes:
            lines.append(
                f"- {r.name} ({r.route_id}): {r.distance_miles} mi, {r.elevation_gain_feet} ft gain, "
                f"highest point {r.highest_point_feet} ft, difficulty {r.difficulty}, est. {r.estimated_hours} hrs, "
                f"region: {r.region}"
            )
    else:
        route = get_trail_route_by_id(intent.route_id or "enchantments-thru-hike")
        if route:
            lines.append(f"Route Selected: {route.name} ({route.route_id})")
            lines.append(f"- Region: {route.region} ({route.wilderness_area})")
            lines.append(f"- Distance: {route.distance_miles} miles, Gain: {route.elevation_gain_feet} ft, Peak: {route.highest_point_feet} ft")
            lines.append(f"- Difficulty: {route.difficulty}, Estimated Duration: {route.estimated_hours} hours")
            lines.append(f"- GPX URL: {route.gpx_download_url}")
            lines.append("- Highlights: " + ", ".join(route.highlights))
            if intent.action in ("waypoints", "elevation", "export"):
                lines.append("- Waypoints:")
                for w in route.waypoints:
                    lines.append(f"  * {w.name} (Mile {w.mile}, {w.elevation_feet} ft, Type: {w.waypoint_type}) - {w.notes}")

    lines.append(
        "Instructions: Provide accurate navigation insights, highlight technical challenges, "
        "mention critical waypoints and elevations, remind users of offline GPX downloads, and advise on navigation safety."
    )
    return "\n".join(lines)


def format_route_response(intent: RouteIntent) -> dict[str, Any]:
    """Formats a structured response dictionary for the given RouteIntent."""
    if intent.action == "safety":
        protocol = get_gps_navigation_safety_protocol()
        answer = (
            f"{protocol['title']}:\n\n"
            f"1. Offline Navigation: Pre-download 1:24k topo maps and cache vector trail layers before departure.\n"
            f"2. Satellite Communicator: Carry a registered 2-way communicator (Garmin inReach / ZOLEO) or 406MHz PLB.\n"
            f"3. Power Management: Store phone in Airplane Mode with GPS on; carry a cold-rated power bank (10k-20k mAh).\n"
            f"4. Redundancy: Never rely solely on a smartphone; always pack a waterproof topographic paper map and sighting compass (WGS84 datum).\n"
            f"5. Emergency: In the event of becoming lost, follow the STOP rule (Stop, Think, Observe, Plan) and stay on ridge trails rather than descending into untracked gullies."
        )
        return {
            "answer": answer,
            "route_info": {
                "action": "safety",
                "protocol": protocol,
            },
        }

    if intent.action == "list":
        routes = get_trail_routes(region=intent.region, difficulty=intent.difficulty, search=intent.search_query)
        route_summaries = []
        for r in routes:
            route_summaries.append(
                f"• **{r.name}** ({r.region}) - {r.distance_miles} mi | +{r.elevation_gain_feet} ft gain | Peak: {r.highest_point_feet} ft | Difficulty: {r.difficulty.title()} | Est: {r.estimated_hours} hrs"
            )
        routes_text = "\n".join(route_summaries) if route_summaries else "No routes matched your criteria."
        answer = f"Here are the wilderness hiking routes matching your criteria:\n\n{routes_text}"
        return {
            "answer": answer,
            "route_info": {
                "action": "list",
                "total_found": len(routes),
                "routes": [r.model_dump() for r in routes],
            },
        }

    # For details, export, waypoints, elevation: lookup route
    route = get_trail_route_by_id(intent.route_id or "enchantments-thru-hike")
    if not route:
        # Fallback to first catalog route if ID not found
        route = ROUTE_CATALOG["enchantments-thru-hike"]

    if intent.action == "export":
        export_req = RouteExportRequest(route_id=route.route_id, format="gpx", include_waypoints=True)
        export_res = export_route_file(export_req)
        answer = (
            f"Here is your GPX track export for **{route.name}** ({route.distance_miles} miles, +{route.elevation_gain_feet} ft gain).\n\n"
            f"• File: `{export_res.filename}` ({export_res.file_size_bytes} bytes)\n"
            f"• Waypoints included: {len(route.waypoints)} landmarks\n"
            f"• Download Link: `{route.gpx_download_url}`\n\n"
            "You can import this GPX file directly into Garmin GPS devices, Apple Watch Ultra, Gaia GPS, or OnX Backcountry for offline navigation."
        )
        return {
            "answer": answer,
            "route_info": {
                "action": "export",
                "export": export_res.model_dump(),
                "route": route.model_dump(),
            },
        }

    if intent.action == "waypoints":
        wp_lines = [
            f"• **{w.name}** (Mile {w.mile}, {w.elevation_feet} ft) - [{w.waypoint_type.title()}]: {w.notes}"
            for w in route.waypoints
        ]
        answer = (
            f"Key GPS waypoints for **{route.name}** ({route.distance_miles} miles):\n\n"
            + "\n".join(wp_lines)
            + "\n\nRemember to download these waypoints to your offline GPS device before entering the wilderness."
        )
        return {
            "answer": answer,
            "route_info": {
                "action": "waypoints",
                "route_id": route.route_id,
                "name": route.name,
                "waypoints": [w.model_dump() for w in route.waypoints],
            },
        }

    if intent.action == "elevation":
        elev_profile = [
            {"waypoint": w.name, "mile": w.mile, "elevation_feet": w.elevation_feet}
            for w in route.waypoints
        ]
        profile_lines = [
            f"• Mile {w['mile']:.1f}: {w['waypoint']} at {w['elevation_feet']:,} ft"
            for w in elev_profile
        ]
        answer = (
            f"Elevation Profile for **{route.name}**:\n\n"
            f"• Total Distance: {route.distance_miles} miles\n"
            f"• Elevation Gain: {route.elevation_gain_feet:,} ft\n"
            f"• Highest Point: {route.highest_point_feet:,} ft\n\n"
            "Elevation breakdown along the route:\n"
            + "\n".join(profile_lines)
        )
        return {
            "answer": answer,
            "route_info": {
                "action": "elevation",
                "route_id": route.route_id,
                "name": route.name,
                "distance_miles": route.distance_miles,
                "elevation_gain_feet": route.elevation_gain_feet,
                "highest_point_feet": route.highest_point_feet,
                "elevation_profile": elev_profile,
            },
        }

    # Default: details
    hl_str = ", ".join(route.highlights)
    answer = (
        f"**{route.name}** ({route.region} - {route.wilderness_area})\n\n"
        f"• Distance: {route.distance_miles} miles\n"
        f"• Elevation Gain: {route.elevation_gain_feet:,} ft (Summit: {route.highest_point_feet:,} ft)\n"
        f"• Difficulty: {route.difficulty.title()}\n"
        f"• Estimated Time: {route.estimated_hours} hours\n"
        f"• Highlights: {hl_str}\n"
        f"• GPX Track: `{route.gpx_download_url}`\n\n"
        f"This route features {len(route.waypoints)} mapped waypoints including key landmarks, passes, and water sources."
    )
    return {
        "answer": answer,
        "route_info": {
            "action": "details",
            "route": route.model_dump(),
        },
    }
