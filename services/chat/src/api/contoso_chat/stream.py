"""SSE stream event generation for Contoso Outdoors."""

import json
from typing import AsyncGenerator

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


async def generate_cave_mineralogy_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events cave_mineralogy_lookup and cave_mineralogy_calculated when cave mineralogy intent is handled."""
    intent = detect_cave_mineralogy_intent(question)
    if not intent:
        return

    formatted = format_cave_mineralogy_response(intent)
    cave_payload = formatted.get("cave_mineralogy_info")

    event_name = (
        "cave_mineralogy_calculated"
        if intent.action in ("calculate_accretion", "calculate")
        else "cave_mineralogy_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'cave_mineralogy_info': cave_payload, event_name: cave_payload})}\n\n"
    if event_name != "cave_mineralogy_info":
        yield f"data: {json.dumps({'event': 'cave_mineralogy_info', 'cave_mineralogy_info': cave_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' ' if token else ''})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_cave_diving_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events cave_diving_lookup and cave_diving_calculated when cave diving intent is handled."""
    intent = detect_cave_diving_intent(question)
    if not intent:
        return

    formatted = format_cave_diving_response(intent)
    cave_payload = formatted.get("cave_diving_info")

    event_name = (
        "cave_diving_calculated"
        if intent.action in ("calculate_gas", "calculate")
        else "cave_diving_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'cave_diving_info': cave_payload, event_name: cave_payload})}\n\n"
    if event_name != "cave_diving_info":
        yield f"data: {json.dumps({'event': 'cave_diving_info', 'cave_diving_info': cave_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' '})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_pack_goat_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events pack_goat_lookup and pack_goat_calculated when pack goat intent is handled."""
    intent = detect_pack_goat_intent(question)
    if not intent:
        return

    formatted = format_pack_goat_response(intent, question)
    goat_payload = formatted.get("pack_goat_info")

    event_name = (
        "pack_goat_calculated"
        if intent.action in ("calculate_packing", "calculate")
        else "pack_goat_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'pack_goat_info': goat_payload, event_name: goat_payload})}\n\n"
    if event_name != "pack_goat_info":
        yield f"data: {json.dumps({'event': 'pack_goat_info', 'pack_goat_info': goat_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' '})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_pack_llama_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events pack_llama_lookup and pack_llama_calculated when pack llama intent is handled."""
    intent = detect_pack_llama_intent(question)
    if not intent:
        return

    formatted = format_pack_llama_response(intent, question)
    llama_payload = formatted.get("pack_llama_info")

    event_name = (
        "pack_llama_calculated"
        if intent.action in ("calculate_packing", "calculate")
        else "pack_llama_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'pack_llama_info': llama_payload, event_name: llama_payload})}\n\n"
    if event_name != "pack_llama_info":
        yield f"data: {json.dumps({'event': 'pack_llama_info', 'pack_llama_info': llama_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' '})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_zipline_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events zipline_lookup and zipline_calculated when zipline intent is handled."""
    intent = detect_zipline_intent(question)
    if not intent:
        return

    formatted = format_zipline_response(intent, question)
    zip_payload = formatted.get("zipline_info")

    event_name = (
        "zipline_calculated"
        if intent.action in ("calculate_dynamics", "calculate")
        else "zipline_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'zipline_info': zip_payload, event_name: zip_payload})}\n\n"
    if event_name != "zipline_info":
        yield f"data: {json.dumps({'event': 'zipline_info', 'zipline_info': zip_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' '})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_sandboarding_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events sandboarding_lookup and sandboarding_calculated when sandboarding intent is handled."""
    intent = detect_sandboarding_intent(question)
    if not intent:
        return

    formatted = format_sandboarding_response(intent, question)
    sand_payload = formatted.get("sandboarding_info")

    event_name = (
        "sandboarding_calculated"
        if intent.action in ("calculate_glide", "calculate")
        else "sandboarding_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'sandboarding_info': sand_payload, event_name: sand_payload})}\n\n"
    if event_name != "sandboarding_info":
        yield f"data: {json.dumps({'event': 'sandboarding_info', 'sandboarding_info': sand_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' '})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_telemark_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events telemark_lookup and telemark_calculated when telemark skiing intent is handled."""
    intent = detect_telemark_intent(question)
    if not intent:
        return

    formatted = format_telemark_response(intent)
    tele_payload = formatted.get("telemark_skiing_info")

    event_name = (
        "telemark_calculated"
        if intent.action in ("calculate_activity", "calculate")
        else "telemark_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'telemark_skiing_info': tele_payload, event_name: tele_payload})}\n\n"
    if event_name != "telemark_skiing_info":
        yield f"data: {json.dumps({'event': 'telemark_skiing_info', 'telemark_skiing_info': tele_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' '})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_falconry_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events falconry_lookup and falconry_calculated when falconry intent is handled."""
    intent = detect_falconry_intent(question)
    if not intent:
        return

    formatted = format_falconry_response(intent, question)
    falconry_payload = formatted.get("falconry_info")

    event_name = (
        "falconry_calculated"
        if intent.action in ("calculate_conditioning", "calculate")
        else "falconry_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'falconry_info': falconry_payload, event_name: falconry_payload})}\n\n"
    if event_name != "falconry_info":
        yield f"data: {json.dumps({'event': 'falconry_info', 'falconry_info': falconry_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' '})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_turtle_patrol_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events turtle_patrol_lookup and turtle_patrol_calculated when turtle patrol intent is handled."""
    intent = detect_turtle_patrol_intent(question)
    if not intent:
        return

    formatted = format_turtle_patrol_response(intent, question)
    turtle_payload = formatted.get("turtle_patrol_info")

    event_name = (
        "turtle_patrol_calculated"
        if intent.action in ("calculate_dynamics", "calculate")
        else "turtle_patrol_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'turtle_patrol_info': turtle_payload, event_name: turtle_payload})}\n\n"
    if event_name != "turtle_patrol_info":
        yield f"data: {json.dumps({'event': 'turtle_patrol_info', 'turtle_patrol_info': turtle_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' '})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_night_via_ferrata_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events night_via_ferrata_lookup and night_via_ferrata_calculated when night via ferrata intent is handled."""
    intent = detect_night_via_ferrata_intent(question)
    if not intent:
        return

    formatted = format_night_via_ferrata_response(intent, question)
    nvf_payload = formatted.get("night_via_ferrata_info")

    event_name = (
        "night_via_ferrata_calculated"
        if intent.action in ("calculate_dynamics", "calculate")
        else "night_via_ferrata_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'night_via_ferrata_info': nvf_payload, event_name: nvf_payload})}\n\n"
    if event_name != "night_via_ferrata_info":
        yield f"data: {json.dumps({'event': 'night_via_ferrata_info', 'night_via_ferrata_info': nvf_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' '})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_canyon_bouldering_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events canyon_bouldering_lookup and canyon_bouldering_calculated when canyon bouldering intent is handled."""
    intent = detect_canyon_bouldering_intent(question)
    if not intent:
        return

    formatted = format_canyon_bouldering_response(intent, question)
    cb_payload = formatted.get("canyon_bouldering_info")

    event_name = (
        "canyon_bouldering_calculated"
        if intent.action in ("calculate_dynamics", "calculate")
        else "canyon_bouldering_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'canyon_bouldering_info': cb_payload, event_name: cb_payload})}\n\n"
    if event_name != "canyon_bouldering_info":
        yield f"data: {json.dumps({'event': 'canyon_bouldering_info', 'canyon_bouldering_info': cb_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' '})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_mudflat_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events mudflat_trekking_lookup and mudflat_trekking_calculated when mudflat trekking intent is handled."""
    intent = detect_mudflat_intent(question)
    if not intent:
        return

    formatted = format_mudflat_response(intent, question)
    mf_payload = formatted.get("mudflat_trekking_info")

    event_name = (
        "mudflat_trekking_calculated"
        if intent.action in ("calculate_dynamics", "calculate")
        else "mudflat_trekking_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'mudflat_trekking_info': mf_payload, event_name: mf_payload})}\n\n"
    if event_name != "mudflat_trekking_info":
        yield f"data: {json.dumps({'event': 'mudflat_trekking_info', 'mudflat_trekking_info': mf_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' '})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_bog_shoeing_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events bog_shoeing_lookup and bog_shoeing_calculated when bog shoeing intent is handled."""
    if not detect_bog_shoeing_intent(question):
        return

    formatted = format_bog_shoeing_response("bog_shoeing", question)
    bog_payload = formatted.get("bog_shoeing_info")

    event_name = (
        "bog_shoeing_calculated"
        if isinstance(bog_payload, dict)
        and bog_payload.get("action") in ("calculate", "calculate_flotation")
        else "bog_shoeing_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'bog_shoeing_info': bog_payload, event_name: bog_payload})}\n\n"
    if event_name != "bog_shoeing_info":
        yield f"data: {json.dumps({'event': 'bog_shoeing_info', 'bog_shoeing_info': bog_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' ' if token else ''})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_crevasse_pulk_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events crevasse_pulk_lookup and crevasse_pulk_calculated when crevasse pulk intent is handled."""
    if not detect_crevasse_pulk_intent(question):
        return

    formatted = format_crevasse_pulk_response("crevasse_pulk", question)
    pulk_payload = formatted.get("crevasse_pulk_info")

    event_name = (
        "crevasse_pulk_calculated"
        if isinstance(pulk_payload, dict)
        and pulk_payload.get("action") in ("calculate", "calculate_dynamics")
        else "crevasse_pulk_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'crevasse_pulk_info': pulk_payload, event_name: pulk_payload})}\n\n"
    if event_name != "crevasse_pulk_info":
        yield f"data: {json.dumps({'event': 'crevasse_pulk_info', 'crevasse_pulk_info': pulk_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' ' if token else ''})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_pothole_escape_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events pothole_escape_lookup, pothole_escape_calculated, and pothole_escape_info when pothole escape intent is handled."""
    if not detect_pothole_escape_intent(question):
        return

    formatted = format_pothole_escape_response("pothole_escape", question)
    pe_payload = formatted.get("pothole_escape_info")

    event_name = (
        "pothole_escape_calculated"
        if isinstance(pe_payload, dict)
        and pe_payload.get("action") in ("calculate", "calculate_dynamics")
        else "pothole_escape_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'pothole_escape_info': pe_payload, event_name: pe_payload})}\n\n"
    if event_name != "pothole_escape_info":
        yield f"data: {json.dumps({'event': 'pothole_escape_info', 'pothole_escape_info': pe_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' ' if token else ''})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_tundra_lichen_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events tundra_lichen_lookup, tundra_lichen_calculated, and tundra_lichen_info when tundra lichen intent is handled."""
    if not detect_tundra_lichen_intent(question):
        return

    formatted = format_tundra_lichen_response("tundra_lichen", question)
    tl_payload = formatted.get("tundra_lichen_info")

    event_name = (
        "tundra_lichen_calculated"
        if isinstance(tl_payload, dict)
        and tl_payload.get("action") in ("calculate", "calculate_dynamics")
        else "tundra_lichen_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'tundra_lichen_info': tl_payload, event_name: tl_payload})}\n\n"
    if event_name != "tundra_lichen_info":
        yield f"data: {json.dumps({'event': 'tundra_lichen_info', 'tundra_lichen_info': tl_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' ' if token else ''})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_cryokarst_speleology_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events cryokarst_speleology_calculated, cryokarst_speleology_lookup, and cryokarst_speleology_info when cryokarst speleology intent is handled."""
    if not detect_cryokarst_speleology_intent(question):
        return

    formatted = format_cryokarst_speleology_response("cryokarst_speleology", question)
    cs_payload = formatted.get("cryokarst_speleology_info")

    event_name = (
        "cryokarst_speleology_calculated"
        if isinstance(cs_payload, dict)
        and cs_payload.get("action") in ("calculate", "calculate_dynamics")
        else "cryokarst_speleology_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'cryokarst_speleology_info': cs_payload, event_name: cs_payload})}\n\n"
    if event_name != "cryokarst_speleology_info":
        yield f"data: {json.dumps({'event': 'cryokarst_speleology_info', 'cryokarst_speleology_info': cs_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' ' if token else ''})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_slickrock_burro_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events slickrock_burro_calculated, slickrock_burro_lookup, and slickrock_burro_info when slickrock burro intent is handled."""
    if not detect_slickrock_burro_intent(question):
        return

    formatted = format_slickrock_burro_response("slickrock_burro", question)
    sb_payload = formatted.get("slickrock_burro_info")

    event_name = (
        "slickrock_burro_calculated"
        if isinstance(sb_payload, dict)
        and sb_payload.get("action") in ("calculate", "calculate_dynamics")
        else "slickrock_burro_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'slickrock_burro_info': sb_payload, event_name: sb_payload})}\n\n"
    if event_name != "slickrock_burro_info":
        yield f"data: {json.dumps({'event': 'slickrock_burro_info', 'slickrock_burro_info': sb_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' ' if token else ''})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_canopy_bryophyte_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events canopy_bryophyte_calculated, canopy_bryophyte_lookup, and canopy_bryophyte_info when canopy bryophyte intent is handled."""
    if not detect_canopy_bryophyte_intent(question):
        return

    formatted = format_canopy_bryophyte_response("canopy_bryophyte", question)
    cb_payload = formatted.get("canopy_bryophyte_info")

    event_name = (
        "canopy_bryophyte_calculated"
        if isinstance(cb_payload, dict)
        and cb_payload.get("action") in ("calculate", "calculate_dynamics")
        else "canopy_bryophyte_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'canopy_bryophyte_info': cb_payload, event_name: cb_payload})}\n\n"
    if event_name != "canopy_bryophyte_info":
        yield f"data: {json.dumps({'event': 'canopy_bryophyte_info', 'canopy_bryophyte_info': cb_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' ' if token else ''})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_glacier_ski_traverse_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events glacier_ski_traverse_calculated, glacier_ski_traverse_lookup, and glacier_ski_traverse_info when glacier ski traverse intent is handled."""
    if not detect_glacier_ski_traverse_intent(question):
        return

    formatted = format_glacier_ski_traverse_response("glacier_ski_traverse", question)
    gst_payload = formatted.get("glacier_ski_traverse_info")

    event_name = (
        "glacier_ski_traverse_calculated"
        if isinstance(gst_payload, dict)
        and gst_payload.get("action") in ("calculate", "calculate_dynamics")
        else "glacier_ski_traverse_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'glacier_ski_traverse_info': gst_payload, event_name: gst_payload})}\n\n"
    if event_name != "glacier_ski_traverse_info":
        yield f"data: {json.dumps({'event': 'glacier_ski_traverse_info', 'glacier_ski_traverse_info': gst_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' ' if token else ''})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_scree_running_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events scree_running_calculated, scree_running_lookup, and scree_running_info when scree running intent is handled."""
    if not detect_scree_running_intent(question):
        return

    formatted = format_scree_running_response("scree_running", question)
    sr_payload = formatted.get("scree_running_info")

    event_name = (
        "scree_running_calculated"
        if isinstance(sr_payload, dict)
        and sr_payload.get("action") in ("calculate", "calculate_dynamics")
        else "scree_running_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'scree_running_info': sr_payload, event_name: sr_payload})}\n\n"
    if event_name != "scree_running_info":
        yield f"data: {json.dumps({'event': 'scree_running_info', 'scree_running_info': sr_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' ' if token else ''})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_lava_tube_biospeleology_stream_events(
    question: str,
) -> AsyncGenerator[str, None]:
    """Yield SSE events lava_tube_biospeleology_calculated, lava_tube_biospeleology_lookup, and lava_tube_biospeleology_info when lava tube biospeleology intent is handled."""
    if not detect_lava_tube_biospeleology_intent(question):
        return

    formatted = format_lava_tube_biospeleology_response("lava_tube_biospeleology", question)
    ltb_payload = formatted.get("lava_tube_biospeleology_info")

    event_name = (
        "lava_tube_biospeleology_calculated"
        if isinstance(ltb_payload, dict)
        and ltb_payload.get("action") in ("calculate", "calculate_dynamics")
        else "lava_tube_biospeleology_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'lava_tube_biospeleology_info': ltb_payload, event_name: ltb_payload})}\n\n"
    if event_name != "lava_tube_biospeleology_info":
        yield f"data: {json.dumps({'event': 'lava_tube_biospeleology_info', 'lava_tube_biospeleology_info': ltb_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' ' if token else ''})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_kelp_freediving_stream_events(question: str) -> AsyncGenerator[str, None]:
    """Yield SSE events kelp_freediving_calculated, kelp_freediving_lookup, and kelp_freediving_info when kelp freediving intent is handled."""
    if not detect_kelp_freediving_intent(question):
        return

    formatted = format_kelp_freediving_response("kelp_freediving", question)
    kf_payload = formatted.get("kelp_freediving_info")

    event_name = (
        "kelp_freediving_calculated"
        if isinstance(kf_payload, dict)
        and kf_payload.get("action") in ("calculate", "calculate_dynamics")
        else "kelp_freediving_lookup"
    )

    yield f"data: {json.dumps({'event': event_name, 'kelp_freediving_info': kf_payload, event_name: kf_payload})}\n\n"
    if event_name != "kelp_freediving_info":
        yield f"data: {json.dumps({'event': 'kelp_freediving_info', 'kelp_freediving_info': kf_payload})}\n\n"

    answer = str(formatted.get("answer", ""))
    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' ' if token else ''})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_penitentes_navigation_stream_events(
    question: str,
) -> AsyncGenerator[str, None]:
    """Yield SSE events for penitentes navigation queries."""
    if not is_penitentes_navigation_query(question):
        return

    answer, pn_payload = format_penitentes_navigation_response(question)
    event_name = str(pn_payload.get("action", "penitentes_navigation_info"))

    yield f"event: metadata\ndata: {json.dumps(pn_payload)}\n\n"
    yield f"data: {json.dumps({'event': event_name, 'penitentes_navigation_info': pn_payload, event_name: pn_payload})}\n\n"
    if event_name != "penitentes_navigation_info":
        yield f"data: {json.dumps({'event': 'penitentes_navigation_info', 'penitentes_navigation_info': pn_payload})}\n\n"

    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' ' if token else ''})}\n\n"
    yield f"event: done\ndata: {json.dumps({'status': 'complete', 'action': event_name})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_solfatara_navigation_stream_events(
    question: str,
) -> AsyncGenerator[str, None]:
    """Yield SSE events for solfatara navigation queries."""
    if not is_solfatara_navigation_query(question):
        return

    answer, sn_payload = format_solfatara_navigation_response(question)
    event_name = str(sn_payload.get("action", "solfatara_navigation_info"))

    yield f"event: metadata\ndata: {json.dumps(sn_payload)}\n\n"
    yield f"data: {json.dumps({'event': event_name, 'solfatara_navigation_info': sn_payload, event_name: sn_payload})}\n\n"
    if event_name != "solfatara_navigation_info":
        yield f"data: {json.dumps({'event': 'solfatara_navigation_info', 'solfatara_navigation_info': sn_payload})}\n\n"

    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' ' if token else ''})}\n\n"
    yield f"event: done\ndata: {json.dumps({'status': 'complete', 'action': event_name})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_aufeis_crossing_stream_events(
    question: str,
) -> AsyncGenerator[str, None]:
    """Yield SSE events for aufeis crossing queries."""
    if not is_aufeis_crossing_query(question):
        return

    answer, ac_payload = format_aufeis_crossing_response(question)
    event_name = str(ac_payload.get("action", "aufeis_crossing_info"))

    yield f"event: metadata\ndata: {json.dumps(ac_payload)}\n\n"
    yield f"data: {json.dumps({'event': event_name, 'aufeis_crossing_info': ac_payload, event_name: ac_payload})}\n\n"
    if event_name != "aufeis_crossing_info":
        yield f"data: {json.dumps({'event': 'aufeis_crossing_info', 'aufeis_crossing_info': ac_payload})}\n\n"

    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' ' if token else ''})}\n\n"
    yield f"event: done\ndata: {json.dumps({'status': 'complete', 'action': event_name})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_salt_pan_navigation_stream_events(
    question: str,
) -> AsyncGenerator[str, None]:
    """Yield SSE events for salt pan navigation queries."""
    if not is_salt_pan_navigation_query(question):
        return

    answer, sp_payload = format_salt_pan_navigation_response(question)
    event_name = str(sp_payload.get("action", "salt_pan_navigation_info"))

    yield f"event: metadata\ndata: {json.dumps(sp_payload)}\n\n"
    yield f"data: {json.dumps({'event': event_name, 'salt_pan_navigation_info': sp_payload, event_name: sp_payload})}\n\n"
    if event_name != "salt_pan_navigation_info":
        yield f"data: {json.dumps({'event': 'salt_pan_navigation_info', 'salt_pan_navigation_info': sp_payload})}\n\n"

    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' ' if token else ''})}\n\n"
    yield f"event: done\ndata: {json.dumps({'status': 'complete', 'action': event_name})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_rock_glacier_navigation_stream_events(
    question: str,
) -> AsyncGenerator[str, None]:
    """Yield SSE events for rock glacier navigation queries."""
    if not is_rock_glacier_navigation_query(question):
        return

    answer, rg_payload = format_rock_glacier_navigation_response(question)
    event_name = str(rg_payload.get("action", "rock_glacier_navigation_info"))

    yield f"event: metadata\ndata: {json.dumps(rg_payload)}\n\n"
    yield f"data: {json.dumps({'event': event_name, 'rock_glacier_navigation_info': rg_payload, event_name: rg_payload})}\n\n"
    if event_name != "rock_glacier_navigation_info":
        yield f"data: {json.dumps({'event': 'rock_glacier_navigation_info', 'rock_glacier_navigation_info': rg_payload})}\n\n"

    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' ' if token else ''})}\n\n"
    yield f"event: done\ndata: {json.dumps({'status': 'complete', 'action': event_name})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_sea_cave_pneumatics_stream_events(
    question: str,
) -> AsyncGenerator[str, None]:
    """Yield SSE events for sea cave pneumatics queries."""
    if not is_sea_cave_pneumatics_query(question):
        return

    answer, scp_payload = format_sea_cave_pneumatics_response(question)
    event_name = str(scp_payload.get("action", "sea_cave_pneumatics_info"))

    yield f"event: metadata\ndata: {json.dumps(scp_payload)}\n\n"
    yield f"data: {json.dumps({'event': event_name, 'sea_cave_pneumatics_info': scp_payload, event_name: scp_payload})}\n\n"
    if event_name != "sea_cave_pneumatics_info":
        yield f"data: {json.dumps({'event': 'sea_cave_pneumatics_info', 'sea_cave_pneumatics_info': scp_payload})}\n\n"

    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' ' if token else ''})}\n\n"
    yield f"event: done\ndata: {json.dumps({'status': 'complete', 'action': event_name})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_mangrove_labyrinth_stream_events(
    question: str,
) -> AsyncGenerator[str, None]:
    """Yield SSE events for mangrove labyrinth queries."""
    if not is_mangrove_labyrinth_query(question):
        return

    answer, ml_payload = format_mangrove_labyrinth_response(question)
    event_name = str(ml_payload.get("action", "mangrove_labyrinth_info"))

    yield f"event: metadata\ndata: {json.dumps(ml_payload)}\n\n"
    yield f"data: {json.dumps({'event': event_name, 'mangrove_labyrinth_info': ml_payload, event_name: ml_payload})}\n\n"
    if event_name != "mangrove_labyrinth_info":
        yield f"data: {json.dumps({'event': 'mangrove_labyrinth_info', 'mangrove_labyrinth_info': ml_payload})}\n\n"

    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' ' if token else ''})}\n\n"
    yield f"event: done\ndata: {json.dumps({'status': 'complete', 'action': event_name})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_paramo_navigation_stream_events(
    question: str,
) -> AsyncGenerator[str, None]:
    """Yield SSE events for paramo navigation queries."""
    if not is_paramo_navigation_query(question):
        return

    answer, pn_payload = format_paramo_navigation_response(question)
    event_name = str(pn_payload.get("action", "paramo_navigation_info"))

    yield f"event: metadata\ndata: {json.dumps(pn_payload)}\n\n"
    yield f"data: {json.dumps({'event': event_name, 'paramo_navigation_info': pn_payload, event_name: pn_payload})}\n\n"
    if event_name != "paramo_navigation_info":
        yield f"data: {json.dumps({'event': 'paramo_navigation_info', 'paramo_navigation_info': pn_payload})}\n\n"

    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' ' if token else ''})}\n\n"
    yield f"event: done\ndata: {json.dumps({'status': 'complete', 'action': event_name})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_tephra_navigation_stream_events(
    question: str,
) -> AsyncGenerator[str, None]:
    """Yield SSE events for tephra navigation queries."""
    if not is_tephra_navigation_query(question):
        return

    tn_payload = dict(format_tephra_navigation_response(question))
    answer = str(tn_payload.get("answer", ""))
    event_name = str(tn_payload.get("action", "tephra_navigation_info"))

    yield f"event: metadata\ndata: {json.dumps(tn_payload)}\n\n"
    yield f"data: {json.dumps({'event': event_name, 'tephra_navigation_info': tn_payload, event_name: tn_payload})}\n\n"
    if event_name != "tephra_navigation_info":
        yield f"data: {json.dumps({'event': 'tephra_navigation_info', 'tephra_navigation_info': tn_payload})}\n\n"

    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' ' if token else ''})}\n\n"
    yield f"event: done\ndata: {json.dumps({'status': 'complete', 'action': event_name})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_glaciere_caving_stream_events(
    question: str,
) -> AsyncGenerator[str, None]:
    """Yield SSE events for glacière caving queries."""
    if not is_glaciere_caving_query(question):
        return

    gc_payload = dict(format_glaciere_caving_response(question))
    answer = str(gc_payload.get("answer", ""))
    event_name = str(gc_payload.get("action", "glaciere_caving_info"))

    yield f"event: metadata\ndata: {json.dumps(gc_payload)}\n\n"
    yield f"data: {json.dumps({'event': event_name, 'glaciere_caving_info': gc_payload, event_name: gc_payload})}\n\n"
    if event_name != "glaciere_caving_info":
        yield f"data: {json.dumps({'event': 'glaciere_caving_info', 'glaciere_caving_info': gc_payload})}\n\n"

    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' ' if token else ''})}\n\n"
    yield f"event: done\ndata: {json.dumps({'status': 'complete', 'action': event_name})}\n\n"
    yield "data: [DONE]\n\n"


async def generate_cobble_spit_trekking_stream_events(
    question: str,
) -> AsyncGenerator[str, None]:
    """Yield SSE events for cobble spit trekking queries."""
    if not is_cobble_spit_trekking_query(question):
        return

    cs_payload = dict(format_cobble_spit_trekking_response(question))
    answer = str(cs_payload.get("answer", ""))
    event_name = str(cs_payload.get("action", "cobble_spit_trekking_info"))

    yield f"event: metadata\ndata: {json.dumps(cs_payload)}\n\n"
    yield f"data: {json.dumps({'event': event_name, 'cobble_spit_trekking_info': cs_payload, event_name: cs_payload})}\n\n"
    if event_name != "cobble_spit_trekking_info":
        yield f"data: {json.dumps({'event': 'cobble_spit_trekking_info', 'cobble_spit_trekking_info': cs_payload})}\n\n"

    tokens = answer.split(" ")
    for token in tokens:
        yield f"data: {json.dumps({'event': 'token', 'token': token + ' ' if token else ''})}\n\n"
    yield f"event: done\ndata: {json.dumps({'status': 'complete', 'action': event_name})}\n\n"
    yield "data: [DONE]\n\n"
