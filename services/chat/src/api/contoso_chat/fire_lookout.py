import re
from typing import Any, Optional

from pydantic import BaseModel


class FireLookoutTowerModel(BaseModel):
    tower_id: str
    title: str
    mountain_peak: str
    national_forest: str
    elevation_m: int
    tower_structure: str  # live_in_wood_cab_l4, steel_skeletal_tower, stone_cupola_ground_cab, historic_pole_frame
    tower_height_m: int
    viewshed_radius_km: int
    osborne_alidade_equipped: bool
    active_observer_status: str
    description: str
    highlights: list[str]


class LookoutRequest(BaseModel):
    tower_id: str = "winchester-mountain-lookout"
    azimuth_degrees: float = 45.0
    vertical_angle_degrees: float = -1.5
    estimated_distance_km: float = 15.0
    smoke_behavior: str = "dense_vertical_convection"
    wind_speed_mph: float = 12.0


class LookoutResponse(BaseModel):
    tower_id: str
    tower_name: str
    triangulated_bearing: str
    effective_viewshed_km: int
    plume_alert_level: str  # observation_watch, confirmed_wildfire_dispatch, extreme_blowup_evacuation
    convection_index_percent: int
    observation_status: str  # clear_line_of_sight, haze_thermal_inversion, active_lightning_storm_hazard
    triangulation_advisory: str
    holdover_fire_advisory: str
    tower_safety_advisory: str


class LookoutGearItemModel(BaseModel):
    item_id: str
    name: str
    category: str
    mandatory: bool
    purpose: str


class LookoutIntent(BaseModel):
    action: str  # towers_list, tower_detail, calculate_lookout, gear_checklist
    tower_id: Optional[str] = None
    tower_structure: Optional[str] = None


class FormattedLookoutResponse(dict[str, Any]):
    def __init__(self, answer: str, data: dict[str, Any]):
        super().__init__(data)
        self.answer = answer

    def __str__(self) -> str:
        return self.answer


DEFAULT_FIRE_LOOKOUT_TOWERS: dict[str, FireLookoutTowerModel] = {
    "winchester-mountain-lookout": FireLookoutTowerModel(
        tower_id="winchester-mountain-lookout",
        title="Winchester Mountain Lookout (L-4 Cab)",
        mountain_peak="Winchester Mountain",
        national_forest="Mt. Baker-Snoqualmie National Forest, WA",
        elevation_m=1988,
        tower_structure="live_in_wood_cab_l4",
        tower_height_m=4,
        viewshed_radius_km=65,
        osborne_alidade_equipped=True,
        active_observer_status="active_usfs_spotting",
        description="Historic 1935 USFS L-4 ground cab perched on Winchester Mountain summit overlooking the North Cascades, Mount Baker, and Mount Shuksan wilderness.",
        highlights=[
            "Original 1935 USFS L-4 cab architecture with 360-degree glass ribbon windows",
            "Direct line-of-sight views across Mount Baker and Tomyhoi Peak backcountry",
            "Operational Osborne Fire Finder alidade table for high-angle triangulation",
        ],
    ),
    "desolation-peak-lookout": FireLookoutTowerModel(
        tower_id="desolation-peak-lookout",
        title="Desolation Peak Fire Lookout",
        mountain_peak="Desolation Peak",
        national_forest="Ross Lake National Recreation Area, WA",
        elevation_m=1860,
        tower_structure="live_in_wood_cab_l4",
        tower_height_m=5,
        viewshed_radius_km=70,
        osborne_alidade_equipped=True,
        active_observer_status="volunteer_firewatch",
        description="Famous North Cascades lookout staffed by Jack Kerouac in 1956, monitoring steep glaciated drainages above Ross Lake.",
        highlights=[
            "Historic Beat-generation literary firewatch station above Ross Lake",
            "Strategic viewshed covering lightning holdovers across Hozomeen Range",
            "Maintained wood timber L-4 cab with heavy storm shutters and lightning arresters",
        ],
    ),
    "mount-cammerer-lookout": FireLookoutTowerModel(
        tower_id="mount-cammerer-lookout",
        title="Mount Cammerer Octagonal Stone Lookout",
        mountain_peak="Mount Cammerer",
        national_forest="Great Smoky Mountains National Park, TN/NC",
        elevation_m=1502,
        tower_structure="stone_cupola_ground_cab",
        tower_height_m=6,
        viewshed_radius_km=45,
        osborne_alidade_equipped=True,
        active_observer_status="historic_public_rental",
        description="Distinctive octagonal western-style stone and timber cupola cab built by the Civilian Conservation Corps (CCC) in 1937.",
        highlights=[
            "Hand-cut stone foundation and octagonal glass observation cupola",
            "Panoramic views over Pigeon River Gorge and Southern Appalachian ridgelines",
            "CCC architectural masterpiece surviving severe high-wind thermal ridgetops",
        ],
    ),
    "black-elk-peak-lookout": FireLookoutTowerModel(
        tower_id="black-elk-peak-lookout",
        title="Black Elk Peak Stone Tower",
        mountain_peak="Black Elk Peak (Harney Peak)",
        national_forest="Black Hills National Forest, SD",
        elevation_m=2207,
        tower_structure="stone_cupola_ground_cab",
        tower_height_m=13,
        viewshed_radius_km=80,
        osborne_alidade_equipped=True,
        active_observer_status="emergency_surge_only",
        description="Highest peak in South Dakota featuring a stone masonry fortress tower constructed from native granite boulders by the CCC in 1938.",
        highlights=[
            "Stone tower summit at 7,242 feet commanding Black Hills and Badlands viewshed",
            "Granite masonry engineered to withstand extreme mountain convective thunderstorms",
            "Surge spotting asset utilized during severe fire weather red flag warnings",
        ],
    ),
    "sundance-mountain-lookout": FireLookoutTowerModel(
        tower_id="sundance-mountain-lookout",
        title="Sundance Mountain Steel Tower",
        mountain_peak="Sundance Mountain",
        national_forest="Kaniksu National Forest, ID",
        elevation_m=1920,
        tower_structure="steel_skeletal_tower",
        tower_height_m=24,
        viewshed_radius_km=75,
        osborne_alidade_equipped=True,
        active_observer_status="active_usfs_spotting",
        description="Heavy-gauge steel skeletal tower rebuilt following the historic 1967 Sundance Mountain Fire to overlook Priest Lake basin.",
        highlights=[
            "24-meter steel skeletal superstructure providing canopy-clearing visibility",
            "Key early-warning spotting node for Northern Rockies timber fires",
            "Integrated high-gain VHF radio repeaters and solar lightning telemetry",
        ],
    ),
}

DEFAULT_FIRE_LOOKOUT_GEAR: list[LookoutGearItemModel] = [
    LookoutGearItemModel(
        item_id="osborne-alidade-sighting-peep",
        name="Brass Osborne Fire Finder Peep Sights & Graduated Ring",
        category="navigation",
        mandatory=True,
        purpose="Precision brass sighting alidade and rotating azimuth ring to triangulate horizontal degree bearings.",
    ),
    LookoutGearItemModel(
        item_id="high-magnification-roof-binocular",
        name="10x50 Waterproof ED High-Transmission Spotting Binoculars",
        category="optics",
        mandatory=True,
        purpose="ED glass optics with mil-dot reticle to discern thin incipient wisps of smoke through valley haze.",
    ),
    LookoutGearItemModel(
        item_id="usfs-topographic-panoramic-maps",
        name="360-Degree Panoramic Circular Fire Map Set & Mylar Overlay",
        category="navigation",
        mandatory=True,
        purpose="Oriented circular contour maps mounted beneath the Osborne table glass for line-of-sight plotting.",
    ),
    LookoutGearItemModel(
        item_id="handheld-vhf-forest-net-transceiver",
        name="VHF Multi-Channel Forest Service Band Radio & Whip Antenna",
        category="radio",
        mandatory=True,
        purpose="High-power transceiver tuned to forest dispatch repeaters with squelch controls to transmit coordinates.",
    ),
    LookoutGearItemModel(
        item_id="sling-psychrometer-hygrothermometer",
        name="Sling Psychrometer & Precision Wet-Bulb Relative Humidity Meter",
        category="weather",
        mandatory=True,
        purpose="Calculates dew point and fuel moisture depression to detect extreme afternoon ignition risks.",
    ),
    LookoutGearItemModel(
        item_id="faraday-lightning-ground-cable",
        name="Heavy-Duty Copper Lightning Ground Stretcher & Static Static Dissipator",
        category="safety",
        mandatory=True,
        purpose="Braided copper conductor straps bonded to steel tie-down footings to divert mountain lightning strikes.",
    ),
]


def get_fire_lookout_towers(tower_structure: Optional[str] = None) -> list[FireLookoutTowerModel]:
    towers = list(DEFAULT_FIRE_LOOKOUT_TOWERS.values())
    if tower_structure:
        struct_clean = tower_structure.strip().lower()
        towers = [t for t in towers if t.tower_structure.lower() == struct_clean]
    return towers


def get_fire_lookout_tower(tower_id: str) -> Optional[FireLookoutTowerModel]:
    return DEFAULT_FIRE_LOOKOUT_TOWERS.get(tower_id.strip().lower())


def get_fire_lookout_gear() -> list[LookoutGearItemModel]:
    return list(DEFAULT_FIRE_LOOKOUT_GEAR)


def _get_compass_direction(azimuth: float) -> str:
    az = azimuth % 360.0
    if az < 22.5 or az >= 337.5:
        return "N"
    elif az < 67.5:
        return "NE"
    elif az < 112.5:
        return "E"
    elif az < 157.5:
        return "SE"
    elif az < 202.5:
        return "S"
    elif az < 247.5:
        return "SW"
    elif az < 292.5:
        return "W"
    else:
        return "NW"


def calculate_fire_lookout(req: LookoutRequest) -> LookoutResponse:
    tower = get_fire_lookout_tower(req.tower_id)
    if tower is None:
        tower = DEFAULT_FIRE_LOOKOUT_TOWERS["winchester-mountain-lookout"]

    compass_dir = _get_compass_direction(req.azimuth_degrees)
    sign = "+" if req.vertical_angle_degrees >= 0 else "-"
    vert_str = f"{sign}{abs(req.vertical_angle_degrees):.1f}°"
    bearing_str = (
        f"{int(round(req.azimuth_degrees))}° ({compass_dir}) | "
        f"Dist: {req.estimated_distance_km} km | "
        f"Vert: {vert_str}"
    )

    base_convection_map = {
        "dense_vertical_convection": 85,
        "pyrocumulus_pulsing": 95,
        "flattened_shear_drift": 60,
        "wispy_incipient_white": 35,
    }
    base_convection = base_convection_map.get(req.smoke_behavior, 50)
    if req.wind_speed_mph > 20:
        base_convection += 10
    convection_index = max(15, min(100, base_convection))

    if req.smoke_behavior == "pyrocumulus_pulsing" or (
        req.smoke_behavior == "dense_vertical_convection" and req.wind_speed_mph >= 25
    ):
        plume_alert_level = "extreme_blowup_evacuation"
    elif req.smoke_behavior == "dense_vertical_convection" or req.estimated_distance_km <= 10:
        plume_alert_level = "confirmed_wildfire_dispatch"
    else:
        plume_alert_level = "observation_watch"

    if req.wind_speed_mph >= 40:
        observation_status = "active_lightning_storm_hazard"
        effective_viewshed_km = int(round(tower.viewshed_radius_km * 0.5))
    elif req.estimated_distance_km > tower.viewshed_radius_km * 0.75:
        observation_status = "haze_thermal_inversion"
        effective_viewshed_km = int(round(tower.viewshed_radius_km * 0.75))
    else:
        observation_status = "clear_line_of_sight"
        effective_viewshed_km = tower.viewshed_radius_km

    if plume_alert_level == "extreme_blowup_evacuation":
        triangulation_advisory = (
            f"CRITICAL DISPATCH: Immediate fire spread vector established along azimuth {int(round(req.azimuth_degrees))}° "
            f"at {req.estimated_distance_km} km. Cross-bearing triangulation with adjacent lookout stations initiated; "
            "alert regional forest dispatch for immediate smokejumper/aerial retardant deployment."
        )
    elif plume_alert_level == "confirmed_wildfire_dispatch":
        triangulation_advisory = (
            f"WILDFIRE DISPATCH: Osborne Fire Finder bearing confirmed at {int(round(req.azimuth_degrees))}° ({compass_dir}) "
            f"vertical angle {vert_str}. Cross-bearings plotted on USGS 360° panoramic topographic contour disc; dispatching initial attack crew."
        )
    else:
        triangulation_advisory = (
            f"OBSERVATION WATCH: Incipient smoke plume bearing logged at {int(round(req.azimuth_degrees))}° ({compass_dir}) "
            f"at {req.estimated_distance_km} km. Continue timed observation cycles every 15 minutes using 10x50 spotting optics to confirm column stability."
        )

    holdover_fire_advisory = (
        "Lightning Holdover Advisory: Subsurface smoldering fires in duff and dry snags following dry thunderstorm cells "
        "can smolder undetected for 7-14 days until low relative humidity and gusting afternoon winds trigger sudden convection blowup. "
        "Maintain active sweep across ridge lines and drainage bottoms."
    )

    if observation_status == "active_lightning_storm_hazard":
        tower_safety_advisory = (
            "CRITICAL LIGHTNING SAFETY HAZARD: High wind gusts (>= 40 mph) and convective cloud development present extreme "
            "cloud-to-ground lightning danger. Disconnect external radio antennas, isolate Osborne alidade table, stand on insulated "
            "glass-legged stool / rubber matting, avoid grounded steel framing, and deploy Faraday copper ground stretchers."
        )
    elif plume_alert_level == "extreme_blowup_evacuation":
        tower_safety_advisory = (
            "TOWER EVACUATION ADVISORY: Explosive pyrocumulus blowout creates extreme downburst and crowning wildfire hazard threatening tower egress. "
            "Secure logbook, lock storm shutters, transmit final coordinates to forest net, and execute pre-planned mountain trail descent immediately."
        )
    else:
        tower_safety_advisory = (
            "Standard Lookout Safety Protocol: Maintain tower cab ventilation, verify VHF forest repeater connectivity, "
            "monitor sling psychrometer fuel moisture depression, and confirm copper lightning tie-down grounding straps are secure."
        )

    return LookoutResponse(
        tower_id=tower.tower_id,
        tower_name=tower.title,
        triangulated_bearing=bearing_str,
        effective_viewshed_km=effective_viewshed_km,
        plume_alert_level=plume_alert_level,
        convection_index_percent=convection_index,
        observation_status=observation_status,
        triangulation_advisory=triangulation_advisory,
        holdover_fire_advisory=holdover_fire_advisory,
        tower_safety_advisory=tower_safety_advisory,
    )


def detect_fire_lookout_intent(message: str) -> Optional[LookoutIntent]:
    q = message.lower().strip()

    exclusions = [
        "order #",
        "refund",
        "return label",
        "shipping tracking",
        "dogsled",
        "snowshoe",
        "trapping",
        "gold pan",
        "beachcombing",
        "sea glass",
        "rentals",
        "rental",
    ]
    if any(ex in q for ex in exclusions):
        return None

    keywords = [
        r"\bfire\s+lookout\b",
        r"\bosborne\s+fire\s+finder\b",
        r"\balidade\b",
        r"\bsmoke\s+plume\b",
        r"\bholdover\s+fire\b",
        r"\bwildfire\s+spotting\b",
        r"\blookout\s+tower\b",
        r"\bl-?4\s+cab\b",
        r"\bpyrocumulus\b",
        r"\bconvection\s+column\b",
    ]
    if not any(re.search(pattern, q) for pattern in keywords):
        return None

    matched_tower_id: Optional[str] = None
    if "winchester" in q:
        matched_tower_id = "winchester-mountain-lookout"
    elif "desolation" in q:
        matched_tower_id = "desolation-peak-lookout"
    elif "cammerer" in q:
        matched_tower_id = "mount-cammerer-lookout"
    elif "black elk" in q or "harney" in q:
        matched_tower_id = "black-elk-peak-lookout"
    elif "sundance" in q:
        matched_tower_id = "sundance-mountain-lookout"

    detected_structure: Optional[str] = None
    if "wood cab" in q or "l-4" in q or "l4" in q or "live_in_wood_cab_l4" in q:
        detected_structure = "live_in_wood_cab_l4"
    elif "steel" in q or "skeletal" in q or "steel_skeletal_tower" in q:
        detected_structure = "steel_skeletal_tower"
    elif "stone" in q or "cupola" in q or "stone_cupola_ground_cab" in q:
        detected_structure = "stone_cupola_ground_cab"
    elif "pole" in q or "historic_pole_frame" in q:
        detected_structure = "historic_pole_frame"

    calc_keywords = [
        "calculate",
        "calculation",
        "azimuth",
        "bearing",
        "vertical angle",
        "triangulate",
        "triangulation",
        "convection index",
        "convection",
        "plume alert",
        "estimate",
    ]
    gear_keywords = [
        "gear",
        "checklist",
        "equipment",
        "kit",
        "peep sight",
        "binocular",
        "psychrometer",
        "vhf",
        "faraday",
        "lightning ground",
    ]

    if any(cw in q for cw in calc_keywords):
        return LookoutIntent(
            action="calculate_lookout",
            tower_id=matched_tower_id or "winchester-mountain-lookout",
            tower_structure=detected_structure,
        )

    if any(gw in q for gw in gear_keywords):
        return LookoutIntent(
            action="gear_checklist",
            tower_id=matched_tower_id,
            tower_structure=detected_structure,
        )

    if matched_tower_id:
        return LookoutIntent(
            action="tower_detail",
            tower_id=matched_tower_id,
            tower_structure=detected_structure,
        )

    return LookoutIntent(
        action="towers_list",
        tower_id=None,
        tower_structure=detected_structure,
    )


def format_fire_lookout_response(data: Any, query: str = "") -> FormattedLookoutResponse:
    if isinstance(data, LookoutResponse):
        calc = data
        answer = (
            f"Backcountry Fire Lookout Spotting & Triangulation for {calc.tower_name}: "
            f"Bearing: {calc.triangulated_bearing}. Plume Alert Level: {calc.plume_alert_level}. "
            f"Convection Index: {calc.convection_index_percent}% | Observation Status: {calc.observation_status}. "
            f"Effective Viewshed: {calc.effective_viewshed_km} km. "
            f"Triangulation Advisory: {calc.triangulation_advisory} "
            f"Holdover Advisory: {calc.holdover_fire_advisory} "
            f"Safety Advisory: {calc.tower_safety_advisory}"
        )
        calc_info: dict[str, Any] = {
            "action": "calculate_lookout",
            "tower_id": calc.tower_id,
            "calculation": calc.model_dump(),
        }
        return FormattedLookoutResponse(
            answer,
            {"fire_lookout_info": calc_info, "answer": answer},
        )

    if isinstance(data, dict):
        if "fire_lookout_info" in data and "answer" in data:
            return FormattedLookoutResponse(str(data["answer"]), data)
        if "action" in data and ("calculation" in data or "tower_id" in data):
            action_val = str(data.get("action", "calculate_lookout"))
            answer_str = f"Backcountry fire lookout action '{action_val}' processed."
            calc_dict_info: dict[str, Any] = data
            return FormattedLookoutResponse(
                answer_str,
                {"fire_lookout_info": calc_dict_info, "answer": answer_str},
            )
        intent = (
            LookoutIntent(**data)
            if "action" in data
            else (detect_fire_lookout_intent(query or str(data)) or LookoutIntent(action="towers_list"))
        )
    elif isinstance(data, LookoutIntent):
        intent = data
    else:
        intent = detect_fire_lookout_intent(str(data)) or LookoutIntent(action="towers_list")

    if intent.action in ("calculate_lookout", "calculate"):
        req = LookoutRequest(tower_id=intent.tower_id or "winchester-mountain-lookout")
        calc_res = calculate_fire_lookout(req)
        answer = (
            f"Backcountry Fire Lookout Spotting & Triangulation for {calc_res.tower_name}: "
            f"Bearing: {calc_res.triangulated_bearing}. Plume Alert Level: {calc_res.plume_alert_level}. "
            f"Convection Index: {calc_res.convection_index_percent}% | Observation Status: {calc_res.observation_status}. "
            f"Effective Viewshed: {calc_res.effective_viewshed_km} km. "
            f"Triangulation Advisory: {calc_res.triangulation_advisory} "
            f"Holdover Advisory: {calc_res.holdover_fire_advisory} "
            f"Safety Advisory: {calc_res.tower_safety_advisory}"
        )
        calc_info = {
            "action": "calculate_lookout",
            "tower_id": calc_res.tower_id,
            "calculation": calc_res.model_dump(),
        }
        return FormattedLookoutResponse(
            answer,
            {"fire_lookout_info": calc_info, "answer": answer},
        )

    if intent.action in ("gear_checklist", "gear"):
        gear = get_fire_lookout_gear()
        items_str = "; ".join(f"{g.name} ({g.purpose})" for g in gear)
        answer = (
            f"Mandatory Backcountry Fire Lookout Spotting & Triangulation Gear ({len(gear)} items): {items_str}. "
            "Ensure all alidade sighting peep holes, topographic disc overlays, and lightning ground stretchers are inspected before fire season."
        )
        gear_info: dict[str, Any] = {
            "action": "gear_checklist",
            "gear": [g.model_dump() for g in gear],
            "mandatory_count": len(gear),
        }
        return FormattedLookoutResponse(
            answer,
            {"fire_lookout_info": gear_info, "answer": answer},
        )

    if intent.action == "tower_detail" and intent.tower_id:
        tower = get_fire_lookout_tower(intent.tower_id)
        if tower:
            highlights_str = ", ".join(tower.highlights)
            answer = (
                f"Fire Lookout Tower Detail: {tower.title} ({tower.mountain_peak}, {tower.national_forest}). "
                f"Structure: {tower.tower_structure.replace('_', ' ').title()} | Elevation: {tower.elevation_m}m | "
                f"Tower Height: {tower.tower_height_m}m | Viewshed: {tower.viewshed_radius_km} km | "
                f"Osborne Alidade: {'Equipped' if tower.osborne_alidade_equipped else 'None'} | "
                f"Status: {tower.active_observer_status.replace('_', ' ').title()}. {tower.description} "
                f"Highlights: {highlights_str}."
            )
            detail_info: dict[str, Any] = {
                "action": "tower_detail",
                "tower_id": tower.tower_id,
                "tower": tower.model_dump(),
            }
            return FormattedLookoutResponse(
                answer,
                {"fire_lookout_info": detail_info, "answer": answer},
            )

    towers = get_fire_lookout_towers(tower_structure=intent.tower_structure)
    summary_str = "; ".join(
        f"{t.title} ({t.tower_structure.replace('_', ' ').title()}, {t.mountain_peak}, elevation: {t.elevation_m}m, viewshed: {t.viewshed_radius_km} km)"
        for t in towers
    )
    answer = (
        f"Contoso Backcountry Fire Lookout Tower Catalog ({len(towers)} towers): {summary_str}. "
        "Inquire about specific tower details, mandatory spotting gear, or Osborne alidade bearing and smoke convection calculations."
    )
    list_info: dict[str, Any] = {
        "action": "towers_list",
        "tower_structure": intent.tower_structure,
        "towers": [t.model_dump() for t in towers],
        "count": len(towers),
    }
    return FormattedLookoutResponse(
        answer,
        {"fire_lookout_info": list_info, "answer": answer},
    )


def build_fire_lookout_prompt(intent: Optional[LookoutIntent] = None) -> str:
    lines = [
        "Wilderness Fire Lookout Tower & Wildfire Spotting Guidance:",
        "- Osborne Fire Finder Alidade Triangulation: Rotate brass peep-sight alidade over 360-degree topographic disc to sight incipient smoke columns. Sighting wire aligns horizontal azimuth degrees while graduated scale measures vertical dip/rise angle for precise mountain contour intersection.",
        "- Smoke Plume Convection Dynamics: Monitor plume vertical convection index (dense vertical columns indicate high heat release; pulsating pyrocumulus indicates active wildfire blowout hazard). Wind shear flattening smoke indicates rapid perimeter spread.",
        "- Lightning Holdover Fires (Sleepers): Dry lightning strikes often smolder deep within rotten logs and duff for 7 to 14 days before rising afternoon temperatures and humidity drops trigger sudden crowning blowups.",
        "- Tower Cab Safety & Lightning Protocols: High-elevation lookout towers act as lightning attractors. Maintain copper braided ground cables connected to tie-down stretchers; during active thunderstorms, isolate alidade metalwork, step onto insulated stools, and disconnect long-wire antenna leads.",
    ]
    if intent and intent.tower_id:
        tower = get_fire_lookout_tower(intent.tower_id)
        if tower:
            lines.append(
                f"Target Lookout Tower: {tower.title} ({tower.mountain_peak}, {tower.national_forest}). "
                f"Structure: {tower.tower_structure}. Elevation: {tower.elevation_m}m. "
                f"Viewshed: {tower.viewshed_radius_km} km. Status: {tower.active_observer_status}. Description: {tower.description}"
            )
    return "\n".join(lines)


def fire_lookout_tool(data: dict[str, Any], query: str = "") -> dict[str, Any]:
    formatted = format_fire_lookout_response(data, query=query)
    return dict(formatted)
