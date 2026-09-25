from .wild_ice_models import WildIceGearItemModel, WildIceVenueModel

DEFAULT_WILD_ICE_VENUES: dict[str, WildIceVenueModel] = {
    "lake-malaren-archipelago": WildIceVenueModel(
        venue_id="lake-malaren-archipelago",
        title="Lake Mälaren & Stockholm Archipelago",
        water_body="Lake Mälaren & Baltic Sea Archipelago",
        region="Stockholm County, Sweden",
        surface_elevation_m=1,
        ice_type="black_ice",
        default_thickness_cm=9.0,
        typical_tour_km=35.0,
        description=(
            "Iconic Scandinavian Nordic tour skating haven offering "
            "expansive black congelation ice between thousands of islands."
        ),
        highlights=[
            "Black mirror congelation ice",
            "Archipelago island hopping corridors",
            "Hydroacoustic singing ice resonance",
        ],
    ),
    "lake-siljan-dalarna": WildIceVenueModel(
        venue_id="lake-siljan-dalarna",
        title="Lake Siljan & Orsa Wild Ice Circuit",
        water_body="Lake Siljan",
        region="Dalarna, Sweden",
        surface_elevation_m=161,
        ice_type="black_ice",
        default_thickness_cm=12.0,
        typical_tour_km=45.0,
        description=(
            "Historic meteorite impact crater lake in Dalarna featuring "
            "black ice expanses and long-distance Nordic tour tracks."
        ),
        highlights=[
            "Crater lake vast ice expanses",
            "Nordic skate heel-free touring tracks",
            "Midwinter thermal expansion booming",
        ],
    ),
    "lake-baikal-olkhon": WildIceVenueModel(
        venue_id="lake-baikal-olkhon",
        title="Lake Baikal & Olkhon Island Strait",
        water_body="Lake Baikal",
        region="Siberian Taiga, Russia",
        surface_elevation_m=456,
        ice_type="black_ice",
        default_thickness_cm=18.0,
        typical_tour_km=60.0,
        description=(
            "The deepest clear freshwater lake on Earth, featuring "
            "crystal-clear black wild ice and monumental pressure ridges."
        ),
        highlights=[
            "Deepest clear wild ice in the world",
            "Meter-high pressure ridges and hummocks",
            "Translucent blue ice chasms",
        ],
    ),
    "lake-moraine-banff": WildIceVenueModel(
        venue_id="lake-moraine-banff",
        title="Lake Moraine & Bow Valley Alpine Tarns",
        water_body="Moraine Lake",
        region="Banff National Park, AB, Canada",
        surface_elevation_m=1884,
        ice_type="white_snow_ice",
        default_thickness_cm=8.0,
        typical_tour_km=15.0,
        description=(
            "Glacially fed alpine tarn under the Valley of the Ten Peaks, "
            "presenting a fleeting early-season wild ice window."
        ),
        highlights=[
            "Sub-zero early-season window",
            "Valley of the Ten Peaks reflection",
            "Wind-scoured glacial tarn wild ice",
        ],
    ),
    "lake-superior-chequamegon": WildIceVenueModel(
        venue_id="lake-superior-chequamegon",
        title="Chequamegon Bay & Apostle Islands Wild Ice",
        water_body="Lake Superior",
        region="Lake Superior, WI, USA",
        surface_elevation_m=183,
        ice_type="black_ice",
        default_thickness_cm=10.0,
        typical_tour_km=25.0,
        description=(
            "Dynamic Great Lakes wild ice arena with sandstone cliffs, "
            "frozen sea cave stalactites, and dramatic open leads."
        ),
        highlights=[
            "Sea cave ice stalactite corridors",
            "Great Lakes offshore wind rift hazard",
            "Open pressure lead jumping channels",
        ],
    ),
}

DEFAULT_WILD_ICE_GEAR: list[WildIceGearItemModel] = [
    WildIceGearItemModel(
        item_id="neck-worn-ice-claws",
        name="Dual Hand Ice Claws (Ispiggar) with Emergency Neck Lanyard",
        category="self_rescue",
        mandatory=True,
        purpose=(
            "Provides urgent purchase on slick surface ice during "
            "self-rescue extraction"
        ),
    ),
    WildIceGearItemModel(
        item_id="nordic-ice-pike-staff",
        name=(
            "Hardened Chisel-Tip Ice Probing Pole (Pik) for Sound & "
            "Depth Testing"
        ),
        category="probing",
        mandatory=True,
        purpose=(
            "Tests ice strength and resonant acoustics on the fly with "
            "single-stroke thrusts"
        ),
    ),
    WildIceGearItemModel(
        item_id="buoyant-skate-backpack",
        name=(
            "Waterproof Drybag Backpack with Crotch Strap & Waist Belt "
            "for Flotation"
        ),
        category="buoyancy",
        mandatory=True,
        purpose=(
            "Serves as an essential personal flotation device and keeps "
            "dry change insulated"
        ),
    ),
    WildIceGearItemModel(
        item_id="throw-rescue-lifeline",
        name=(
            "25-Meter Floating Rescue Throw Line (Räddningslina) "
            "with Carabiner"
        ),
        category="rescue",
        mandatory=True,
        purpose=(
            "Enables companions to pull submerged skaters onto stable "
            "ice from a safe standoff"
        ),
    ),
    WildIceGearItemModel(
        item_id="heel-free-nordic-blades",
        name=(
            "45cm Tool-Steel Nordic Tour Skates with NNN/BC "
            "Cross-Country Bindings"
        ),
        category="traction",
        mandatory=True,
        purpose=(
            "High-glide touring blades designed for uneven natural lake "
            "and fjord black ice"
        ),
    ),
    WildIceGearItemModel(
        item_id="sealed-dry-change-kit",
        name=(
            "Full Thermal Base Layer and Fleece Change Set in "
            "Submersible Dry Sack"
        ),
        category="hypothermia",
        mandatory=True,
        purpose=(
            "Mandatory emergency clothing to prevent lethal hypothermia "
            "after icefall wetting"
        ),
    ),
]
