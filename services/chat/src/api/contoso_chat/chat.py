"""Chat intent cascade and request processing for Contoso Outdoors."""

from typing import Any, Optional

from contoso_chat.aufeis_crossing import (
    format_aufeis_crossing_response,
    is_aufeis_crossing_query,
)
from contoso_chat.bog_shoeing import (
    detect_bog_shoeing_intent,
    format_bog_shoeing_response,
)
from contoso_chat.canopy_bryophyte import (
    detect_canopy_bryophyte_intent,
    format_canopy_bryophyte_response,
)
from contoso_chat.canyon_bouldering import (
    detect_canyon_bouldering_intent,
    format_canyon_bouldering_response,
)
from contoso_chat.cave_diving import (
    detect_cave_diving_intent,
    format_cave_diving_response,
)
from contoso_chat.cave_mineralogy import (
    detect_cave_mineralogy_intent,
    format_cave_mineralogy_response,
)
from contoso_chat.cobble_spit_trekking import (
    format_cobble_spit_trekking_response,
    is_cobble_spit_trekking_query,
)
from contoso_chat.crevasse_pulk import (
    detect_crevasse_pulk_intent,
    format_crevasse_pulk_response,
)
from contoso_chat.cryokarst_speleology import (
    detect_cryokarst_speleology_intent,
    format_cryokarst_speleology_response,
)
from contoso_chat.falconry import (
    detect_falconry_intent,
    format_falconry_response,
)
from contoso_chat.flash_flood_slot import (
    format_flash_flood_slot_response,
    is_flash_flood_slot_query,
)
from contoso_chat.glacier_ski_traverse import (
    detect_glacier_ski_traverse_intent,
    format_glacier_ski_traverse_response,
)
from contoso_chat.glaciere_caving import (
    format_glaciere_caving_response,
    is_glaciere_caving_query,
)
from contoso_chat.kelp_freediving import (
    detect_kelp_freediving_intent,
    format_kelp_freediving_response,
)
from contoso_chat.lava_tube_biospeleology import (
    detect_lava_tube_biospeleology_intent,
    format_lava_tube_biospeleology_response,
)
from contoso_chat.mangrove_labyrinth import (
    format_mangrove_labyrinth_response,
    is_mangrove_labyrinth_query,
)
from contoso_chat.mudflat_trekking import (
    detect_mudflat_intent,
    format_mudflat_response,
)
from contoso_chat.night_via_ferrata import (
    detect_night_via_ferrata_intent,
    format_night_via_ferrata_response,
)
from contoso_chat.pack_goat import (
    detect_pack_goat_intent,
    format_pack_goat_response,
)
from contoso_chat.pack_llama import (
    detect_pack_llama_intent,
    format_pack_llama_response,
)
from contoso_chat.paramo_navigation import (
    format_paramo_navigation_response,
    is_paramo_navigation_query,
)
from contoso_chat.penitentes_navigation import (
    format_penitentes_navigation_response,
    is_penitentes_navigation_query,
)
from contoso_chat.pothole_escape import (
    detect_pothole_escape_intent,
    format_pothole_escape_response,
)
from contoso_chat.rock_glacier_navigation import (
    format_rock_glacier_navigation_response,
    is_rock_glacier_navigation_query,
)
from contoso_chat.salt_pan_navigation import (
    format_salt_pan_navigation_response,
    is_salt_pan_navigation_query,
)
from contoso_chat.sandboarding import (
    detect_sandboarding_intent,
    format_sandboarding_response,
)
from contoso_chat.scree_running import (
    detect_scree_running_intent,
    format_scree_running_response,
)
from contoso_chat.sea_cave_pneumatics import (
    format_sea_cave_pneumatics_response,
    is_sea_cave_pneumatics_query,
)
from contoso_chat.slickrock_burro import (
    detect_slickrock_burro_intent,
    format_slickrock_burro_response,
)
from contoso_chat.solfatara_navigation import (
    format_solfatara_navigation_response,
    is_solfatara_navigation_query,
)
from contoso_chat.telemark_skiing import (
    detect_telemark_intent,
    format_telemark_response,
)
from contoso_chat.tephra_navigation import (
    format_tephra_navigation_response,
    is_tephra_navigation_query,
)
from contoso_chat.tundra_lichen import (
    detect_tundra_lichen_intent,
    format_tundra_lichen_response,
)
from contoso_chat.turtle_patrol import (
    detect_turtle_patrol_intent,
    format_turtle_patrol_response,
)
from contoso_chat.zipline import (
    detect_zipline_intent,
    format_zipline_response,
)


def handle_cave_mineralogy_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format cave mineralogy intent in the cascade."""
    intent = detect_cave_mineralogy_intent(question)
    if not intent:
        return None
    formatted = format_cave_mineralogy_response(intent)
    return {
        "cave_mineralogy_info": formatted.get("cave_mineralogy_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_cave_diving_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format cave diving intent in the cascade."""
    intent = detect_cave_diving_intent(question)
    if not intent:
        return None
    formatted = format_cave_diving_response(intent)
    return {
        "cave_diving_info": formatted.get("cave_diving_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_pack_goat_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format pack goat intent in the cascade."""
    intent = detect_pack_goat_intent(question)
    if not intent:
        return None
    formatted = format_pack_goat_response(intent, question)
    return {
        "pack_goat_info": formatted.get("pack_goat_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_pack_llama_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format pack llama intent in the cascade."""
    intent = detect_pack_llama_intent(question)
    if not intent:
        return None
    formatted = format_pack_llama_response(intent)
    return {
        "pack_llama_info": formatted.get("pack_llama_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_zipline_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format zipline intent in the cascade."""
    intent = detect_zipline_intent(question)
    if not intent:
        return None
    formatted = format_zipline_response(intent, question)
    return {
        "zipline_info": formatted.get("zipline_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_sandboarding_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format sandboarding intent in the cascade."""
    intent = detect_sandboarding_intent(question)
    if not intent:
        return None
    formatted = format_sandboarding_response(intent, question)
    return {
        "sandboarding_info": formatted.get("sandboarding_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_telemark_skiing_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format telemark skiing intent in the cascade."""
    intent = detect_telemark_intent(question)
    if not intent:
        return None
    formatted = format_telemark_response(intent)
    return {
        "telemark_skiing_info": formatted.get("telemark_skiing_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_falconry_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format falconry intent in the cascade."""
    intent = detect_falconry_intent(question)
    if not intent:
        return None
    formatted = format_falconry_response(intent, question)
    return {
        "falconry_info": formatted.get("falconry_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_turtle_patrol_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format turtle patrol intent in the cascade."""
    intent = detect_turtle_patrol_intent(question)
    if not intent:
        return None
    formatted = format_turtle_patrol_response(intent, question)
    return {
        "turtle_patrol_info": formatted.get("turtle_patrol_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_night_via_ferrata_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format night via ferrata intent in the cascade."""
    intent = detect_night_via_ferrata_intent(question)
    if not intent:
        return None
    formatted = format_night_via_ferrata_response(intent, question)
    return {
        "night_via_ferrata_info": formatted.get("night_via_ferrata_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_canyon_bouldering_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format wilderness canyon bouldering intent in the cascade."""
    intent = detect_canyon_bouldering_intent(question)
    if not intent:
        return None
    formatted = format_canyon_bouldering_response(intent, question)
    return {
        "canyon_bouldering_info": formatted.get("canyon_bouldering_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_mudflat_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format wilderness tidal flat mud-trekking intent in the cascade."""
    intent = detect_mudflat_intent(question)
    if not intent:
        return None
    formatted = format_mudflat_response(intent, question)
    return {
        "mudflat_trekking_info": formatted.get("mudflat_trekking_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_bog_shoeing_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format bog shoeing intent in the cascade."""
    if not detect_bog_shoeing_intent(question):
        return None
    formatted = format_bog_shoeing_response("bog_shoeing", question)
    return {
        "bog_shoeing_info": formatted.get("bog_shoeing_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_crevasse_pulk_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format crevasse pulk intent in the cascade."""
    if not detect_crevasse_pulk_intent(question):
        return None
    formatted = format_crevasse_pulk_response("crevasse_pulk", question)
    return {
        "crevasse_pulk_info": formatted.get("crevasse_pulk_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_pothole_escape_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format pothole escape intent in the cascade."""
    if not detect_pothole_escape_intent(question):
        return None
    formatted = format_pothole_escape_response("pothole_escape", question)
    return {
        "pothole_escape_info": formatted.get("pothole_escape_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_tundra_lichen_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format tundra lichen intent in the cascade."""
    if not detect_tundra_lichen_intent(question):
        return None
    formatted = format_tundra_lichen_response("tundra_lichen", question)
    return {
        "tundra_lichen_info": formatted.get("tundra_lichen_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_cryokarst_speleology_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format cryokarst speleology intent in the cascade."""
    if not detect_cryokarst_speleology_intent(question):
        return None
    formatted = format_cryokarst_speleology_response("cryokarst_speleology", question)
    return {
        "cryokarst_speleology_info": formatted.get("cryokarst_speleology_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_slickrock_burro_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format slickrock burro intent in the cascade."""
    if not detect_slickrock_burro_intent(question):
        return None
    formatted = format_slickrock_burro_response("slickrock_burro", question)
    return {
        "slickrock_burro_info": formatted.get("slickrock_burro_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_canopy_bryophyte_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format canopy bryophyte intent in the cascade."""
    if not detect_canopy_bryophyte_intent(question):
        return None
    formatted = format_canopy_bryophyte_response("canopy_bryophyte", question)
    return {
        "canopy_bryophyte_info": formatted.get("canopy_bryophyte_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_glacier_ski_traverse_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format glacier ski traverse intent in the cascade."""
    if not detect_glacier_ski_traverse_intent(question):
        return None
    formatted = format_glacier_ski_traverse_response("glacier_ski_traverse", question)
    return {
        "glacier_ski_traverse_info": formatted.get("glacier_ski_traverse_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_scree_running_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format scree running intent in the cascade."""
    if not detect_scree_running_intent(question):
        return None
    formatted = format_scree_running_response("scree_running", question)
    return {
        "scree_running_info": formatted.get("scree_running_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_lava_tube_biospeleology_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format lava tube biospeleology intent in the cascade."""
    if not detect_lava_tube_biospeleology_intent(question):
        return None
    formatted = format_lava_tube_biospeleology_response("lava_tube_biospeleology", question)
    return {
        "lava_tube_biospeleology_info": formatted.get("lava_tube_biospeleology_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_kelp_freediving_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format kelp freediving intent in the cascade."""
    if not detect_kelp_freediving_intent(question):
        return None
    formatted = format_kelp_freediving_response("kelp_freediving", question)
    return {
        "kelp_freediving_info": formatted.get("kelp_freediving_info"),
        "answer": formatted.get("answer", str(formatted)),
    }


def handle_penitentes_navigation_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format penitentes navigation intent in the cascade."""
    if not is_penitentes_navigation_query(question):
        return None
    answer, info = format_penitentes_navigation_response(question)
    return {
        "penitentes_navigation_info": info,
        "action": info.get("action"),
        "answer": answer,
    }


def handle_solfatara_navigation_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format solfatara navigation intent in the cascade."""
    if not is_solfatara_navigation_query(question):
        return None
    answer, info = format_solfatara_navigation_response(question)
    return {
        "solfatara_navigation_info": info,
        "action": info.get("action"),
        "answer": answer,
    }


def handle_aufeis_crossing_intent(question: str) -> Optional[dict[str, Any]]:
    """Detect and format aufeis crossing intent in the cascade."""
    if not is_aufeis_crossing_query(question):
        return None
    answer, info = format_aufeis_crossing_response(question)
    return {
        "aufeis_crossing_info": info,
        "action": info.get("action"),
        "answer": answer,
    }


def handle_salt_pan_navigation_intent(
    question: str,
) -> Optional[dict[str, Any]]:
    """Detect and format salt pan navigation intent in the cascade."""
    if not is_salt_pan_navigation_query(question):
        return None
    answer, info = format_salt_pan_navigation_response(question)
    return {
        "salt_pan_navigation_info": info,
        "action": info.get("action"),
        "answer": answer,
    }


def handle_rock_glacier_navigation_intent(
    question: str,
) -> Optional[dict[str, Any]]:
    """Detect and format rock glacier navigation intent in the cascade."""
    if not is_rock_glacier_navigation_query(question):
        return None
    answer, info = format_rock_glacier_navigation_response(question)
    return {
        "rock_glacier_navigation_info": info,
        "action": info.get("action"),
        "answer": answer,
    }


def handle_sea_cave_pneumatics_intent(
    question: str,
) -> Optional[dict[str, Any]]:
    """Detect and format sea cave pneumatics intent in the cascade."""
    if not is_sea_cave_pneumatics_query(question):
        return None
    answer, info = format_sea_cave_pneumatics_response(question)
    return {
        "sea_cave_pneumatics_info": info,
        "action": info.get("action"),
        "answer": answer,
    }


def handle_mangrove_labyrinth_intent(
    question: str,
) -> Optional[dict[str, Any]]:
    """Detect and format mangrove labyrinth intent in the cascade."""
    if not is_mangrove_labyrinth_query(question):
        return None
    answer, info = format_mangrove_labyrinth_response(question)
    return {
        "mangrove_labyrinth_info": info,
        "action": info.get("action"),
        "answer": answer,
    }


def handle_paramo_navigation_intent(
    question: str,
) -> Optional[dict[str, Any]]:
    """Detect and format paramo navigation intent in the cascade."""
    if not is_paramo_navigation_query(question):
        return None
    answer, info = format_paramo_navigation_response(question)
    return {
        "paramo_navigation_info": info,
        "action": info.get("action"),
        "answer": answer,
    }


def handle_tephra_navigation_intent(
    question: str,
) -> Optional[dict[str, Any]]:
    """Detect and format tephra navigation intent in the cascade."""
    if not is_tephra_navigation_query(question):
        return None
    info = format_tephra_navigation_response(question)
    answer = str(info.get("answer", ""))
    return {
        "tephra_navigation_info": dict(info),
        "action": info.get("action"),
        "answer": answer,
    }


def handle_glaciere_caving_intent(
    question: str,
) -> Optional[dict[str, Any]]:
    """Detect and format glaciere caving intent in the cascade."""
    if not is_glaciere_caving_query(question):
        return None
    info = format_glaciere_caving_response(question)
    answer = str(info.get("answer", ""))
    return {
        "glaciere_caving_info": dict(info),
        "action": info.get("action"),
        "answer": answer,
    }


def handle_cobble_spit_trekking_intent(
    question: str,
) -> Optional[dict[str, Any]]:
    """Detect and format cobble spit trekking intent in the cascade."""
    if not is_cobble_spit_trekking_query(question):
        return None
    info = format_cobble_spit_trekking_response(question)
    answer = str(info.get("answer", ""))
    return {
        "cobble_spit_trekking_info": dict(info),
        "action": info.get("action"),
        "answer": answer,
    }


def handle_flash_flood_slot_intent(
    question: str,
) -> Optional[dict[str, Any]]:
    """Detect and format slot-canyon flash-flood intent in the cascade."""
    if not is_flash_flood_slot_query(question):
        return None
    info = format_flash_flood_slot_response(question)
    answer = str(info.get("answer", ""))
    return {
        "flash_flood_slot_info": dict(info),
        "action": info.get("action"),
        "answer": answer,
    }

