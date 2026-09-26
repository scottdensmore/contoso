from contoso_chat.gold_prospecting import (
    FormattedProspectingResponse,
    PlacerRequest,
    PlacerResponse,
    ProspectingGearItemModel,
    ProspectingIntent,
    ProspectingSiteModel,
    build_gold_prospecting_prompt,
    calculate_placer_recovery,
    detect_gold_prospecting_intent,
    format_gold_prospecting_response,
    get_prospecting_gear,
    get_prospecting_site,
    get_prospecting_sites,
    gold_prospecting_tool,
)


def test_prospecting_site_model():
    site = ProspectingSiteModel(
        site_id="american-river-south-fork",
        title="South Fork American River & Coloma Shallows",
        region="El Dorado County, CA",
        river_system="American River Basin",
        elevation_m=230,
        typical_gravel_type="Cobble & Quartz Gravel Bar",
        deposit_type="inside_bend_gravel_bar",
        max_historical_yield_g_per_ton=4.8,
        access_difficulty="easy_walk_in",
        description="Historic California Gold Rush discovery epicenter at Sutter's Mill.",
        highlights=[
            "Historic Discovery Site at Sutter's Mill / Coloma Shallows",
            "Inside river bends with heavy quartz cobble paystreaks",
            "Public recreation panning corridors along BLM river parcels",
        ],
    )
    assert site.site_id == "american-river-south-fork"
    assert site.deposit_type == "inside_bend_gravel_bar"
    assert site.max_historical_yield_g_per_ton == 4.8
    assert len(site.highlights) == 3


def test_placer_request_and_response_models():
    req = PlacerRequest()
    assert req.site_id == "american-river-south-fork"
    assert req.gravel_volume_buckets == 5.0
    assert req.sluice_slope_deg == 7.0
    assert req.stream_flow_velocity_fps == 3.5
    assert req.separation_method == "sluice_box"

    res = PlacerResponse(
        site_id="american-river-south-fork",
        site_title="South Fork American River & Coloma Shallows",
        expected_concentrate_grams=2.16,
        recovery_efficiency_percent=92,
        sluice_status="optimal_riffle_recovery",
        density_ratio=7.28,
        recovery_advisory="Optimal riffle recovery active.",
        regulatory_advisory="Respect active claims and regulations.",
    )
    assert res.expected_concentrate_grams == 2.16
    assert res.recovery_efficiency_percent == 92
    assert res.density_ratio == 7.28


def test_prospecting_gear_model():
    item = ProspectingGearItemModel(
        item_id="dual-riffle-gold-pan",
        name="14-Inch Deep-Drop Dual Riffle Gravity Pan",
        category="pan",
        mandatory=True,
        purpose="90-degree deep riffles and micro-riffles for gravity stratification and flake retention.",
    )
    assert item.item_id == "dual-riffle-gold-pan"
    assert item.category == "pan"
    assert item.mandatory is True


def test_formatted_prospecting_response():
    resp = FormattedProspectingResponse(
        "Gold prospecting details summary",
        {"gold_prospecting_info": {"status": "ok"}, "answer": "Gold prospecting details summary"},
    )
    assert isinstance(resp, dict)
    assert resp.answer == "Gold prospecting details summary"
    assert str(resp) == "Gold prospecting details summary"
    assert resp["gold_prospecting_info"]["status"] == "ok"
    assert resp.get("gold_prospecting_info") == {"status": "ok"}


def test_get_prospecting_sites_catalog():
    sites = get_prospecting_sites()
    assert len(sites) == 5
    site_ids = [s.site_id for s in sites]
    assert "american-river-south-fork" in site_ids
    assert "cache-creek-colorado" in site_ids
    assert "fairbanks-pedro-creek" in site_ids
    assert "rogue-river-galice" in site_ids
    assert "swift-river-new-hampshire" in site_ids


def test_get_prospecting_sites_deposit_filtering():
    inside_bend = get_prospecting_sites(deposit_type="inside_bend_gravel_bar")
    assert len(inside_bend) == 1
    assert inside_bend[0].site_id == "american-river-south-fork"

    bench = get_prospecting_sites(deposit_type="bench_placer_terrace")
    assert len(bench) == 1
    assert bench[0].site_id == "cache-creek-colorado"

    bedrock = get_prospecting_sites(deposit_type="bedrock_crevice")
    assert len(bedrock) == 1
    assert bedrock[0].site_id == "fairbanks-pedro-creek"

    stream = get_prospecting_sites(deposit_type="stream_gravel_riffle")
    assert len(stream) == 2
    stream_ids = [s.site_id for s in stream]
    assert "rogue-river-galice" in stream_ids
    assert "swift-river-new-hampshire" in stream_ids


def test_get_prospecting_site_by_id():
    site = get_prospecting_site("american-river-south-fork")
    assert site is not None
    assert site.site_id == "american-river-south-fork"
    assert site.max_historical_yield_g_per_ton == 4.8

    site_pedro = get_prospecting_site("fairbanks-pedro-creek")
    assert site_pedro is not None
    assert site_pedro.elevation_m == 310

    assert get_prospecting_site("nonexistent-site") is None


def test_get_prospecting_gear():
    gear = get_prospecting_gear()
    assert len(gear) == 6
    assert all(isinstance(item, ProspectingGearItemModel) for item in gear)
    assert all(item.mandatory is True for item in gear)

    expected_ids = [
        "dual-riffle-gold-pan",
        "classifier-sieve-set",
        "compact-backpacking-sluice",
        "hardened-crevice-tool-set",
        "suction-snuffer-bottle-vials",
        "magnetic-black-sand-separator",
    ]
    actual_ids = [item.item_id for item in gear]
    for expected_id in expected_ids:
        assert expected_id in actual_ids


def test_calculate_placer_recovery_optimal():
    # buckets = 5.0, site = american-river-south-fork (4.8 g/ton)
    # expected_concentrate_grams = round((5.0 * 0.45 * (4.8 / 5.0)), 2) = 2.16
    # slope 7.0 deg, velocity 3.5 fps -> optimal_riffle_recovery, 92%
    req = PlacerRequest(
        site_id="american-river-south-fork",
        gravel_volume_buckets=5.0,
        sluice_slope_deg=7.0,
        stream_flow_velocity_fps=3.5,
    )
    res = calculate_placer_recovery(req)
    assert isinstance(res, PlacerResponse)
    assert res.site_id == "american-river-south-fork"
    assert res.expected_concentrate_grams == 2.16
    assert res.recovery_efficiency_percent == 92
    assert res.sluice_status == "optimal_riffle_recovery"
    assert res.density_ratio == 7.28
    assert len(res.recovery_advisory) > 0
    assert len(res.regulatory_advisory) > 0


def test_calculate_placer_recovery_underflow_clogging():
    # Slope < 5 deg or velocity < 2.5 fps -> underflow_clogging_risk, 64%
    req_shallow = PlacerRequest(
        site_id="cache-creek-colorado",
        gravel_volume_buckets=10.0,
        sluice_slope_deg=4.0,
        stream_flow_velocity_fps=3.5,
    )
    res_shallow = calculate_placer_recovery(req_shallow)
    assert res_shallow.sluice_status == "underflow_clogging_risk"
    assert res_shallow.recovery_efficiency_percent == 64
    # expected_concentrate_grams: 10 * 0.45 * (3.2 / 5.0) = 4.5 * 0.64 = 2.88
    assert res_shallow.expected_concentrate_grams == 2.88

    req_slow = PlacerRequest(
        site_id="cache-creek-colorado",
        gravel_volume_buckets=5.0,
        sluice_slope_deg=6.5,
        stream_flow_velocity_fps=2.0,
    )
    res_slow = calculate_placer_recovery(req_slow)
    assert res_slow.sluice_status == "underflow_clogging_risk"
    assert res_slow.recovery_efficiency_percent == 64


def test_calculate_placer_recovery_scour_blowout():
    # Slope > 8 deg or velocity > 4.5 fps -> scour_blowout_velocity, 48%
    req_steep = PlacerRequest(
        site_id="fairbanks-pedro-creek",
        gravel_volume_buckets=5.0,
        sluice_slope_deg=9.0,
        stream_flow_velocity_fps=3.5,
    )
    res_steep = calculate_placer_recovery(req_steep)
    assert res_steep.sluice_status == "scour_blowout_velocity"
    assert res_steep.recovery_efficiency_percent == 48

    req_fast = PlacerRequest(
        site_id="fairbanks-pedro-creek",
        gravel_volume_buckets=5.0,
        sluice_slope_deg=7.0,
        stream_flow_velocity_fps=5.0,
    )
    res_fast = calculate_placer_recovery(req_fast)
    assert res_fast.sluice_status == "scour_blowout_velocity"
    assert res_fast.recovery_efficiency_percent == 48


def test_detect_gold_prospecting_intent():
    # Sites list
    i1 = detect_gold_prospecting_intent("Where can I find placer gold deposits and stream gravel riffles?")
    assert i1 is not None
    assert i1.action == "sites_list"

    # Deposit type filter
    i2 = detect_gold_prospecting_intent("Show me bedrock crevice placer gold panning sites")
    assert i2 is not None
    assert i2.action == "sites_list"
    assert i2.deposit_type == "bedrock_crevice"

    # Site detail with keyword route matching
    i3 = detect_gold_prospecting_intent("What are the highlights of gold panning at Coloma and American River?")
    assert i3 is not None
    assert i3.action == "site_detail"
    assert i3.site_id == "american-river-south-fork"

    i4 = detect_gold_prospecting_intent("Tell me about Pedro Creek placer mining in Tanana")
    assert i4 is not None
    assert i4.action == "site_detail"
    assert i4.site_id == "fairbanks-pedro-creek"

    # Calculation intent
    i5 = detect_gold_prospecting_intent("Calculate expected placer recovery for 10 buckets in a sluice box at Cache Creek")
    assert i5 is not None
    assert i5.action == "calculate_placer"
    assert i5.site_id == "cache-creek-colorado"

    # Gear checklist intent
    i6 = detect_gold_prospecting_intent("What mandatory gear do I need including snuffer bottles, classifier sieves, and miner's moss?")
    assert i6 is not None
    assert i6.action == "gear_checklist"


def test_detect_gold_prospecting_intent_exclusions():
    # Must NOT trigger on exclusions:
    # ["order #", "refund", "return label", "shipping tracking", "dogsled", "metal detector", "rentals", "rental", "snowshoe", "trapping"]
    assert detect_gold_prospecting_intent("Where is my order # 12345 regarding the gold pan?") is None
    assert detect_gold_prospecting_intent("Can I get a refund on this sluice box?") is None
    assert detect_gold_prospecting_intent("Please print a return label for my snuffer bottle") is None
    assert detect_gold_prospecting_intent("Check shipping tracking for my placer classifier") is None
    assert detect_gold_prospecting_intent("Do you have dogsled tours near the gold panning river?") is None
    assert detect_gold_prospecting_intent("Can I use a metal detector for placer gold?") is None
    assert detect_gold_prospecting_intent("Are there gold pan rentals available?") is None
    assert detect_gold_prospecting_intent("What is your rental policy for camping near the creek?") is None
    assert detect_gold_prospecting_intent("Do I need snowshoe equipment for winter gold prospecting?") is None
    assert detect_gold_prospecting_intent("Can I do primitive trapping near the placer gravel bar?") is None


def test_format_gold_prospecting_response():
    # PlacerResponse formatting
    req = PlacerRequest(site_id="american-river-south-fork", gravel_volume_buckets=5.0)
    calc = calculate_placer_recovery(req)
    resp_calc = format_gold_prospecting_response(calc)
    assert isinstance(resp_calc, FormattedProspectingResponse)
    assert "2.16" in str(resp_calc)
    assert "gold_prospecting_info" in resp_calc
    assert resp_calc["gold_prospecting_info"]["action"] == "calculate_placer"

    # Gear intent formatting
    intent_gear = ProspectingIntent(action="gear_checklist")
    resp_gear = format_gold_prospecting_response(intent_gear)
    assert "gold_prospecting_info" in resp_gear
    assert resp_gear["gold_prospecting_info"]["action"] == "gear_checklist"
    assert resp_gear["gold_prospecting_info"]["mandatory_count"] == 6
    assert "dual-riffle-gold-pan" in str(resp_gear) or "Dual Riffle" in str(resp_gear)

    # Site detail intent formatting
    intent_site = ProspectingIntent(action="site_detail", site_id="american-river-south-fork")
    resp_site = format_gold_prospecting_response(intent_site)
    assert "gold_prospecting_info" in resp_site
    assert resp_site["gold_prospecting_info"]["action"] == "site_detail"
    assert "Coloma" in str(resp_site)

    # Sites list intent formatting
    intent_list = ProspectingIntent(action="sites_list")
    resp_list = format_gold_prospecting_response(intent_list)
    assert "gold_prospecting_info" in resp_list
    assert resp_list["gold_prospecting_info"]["action"] == "sites_list"
    assert resp_list["gold_prospecting_info"]["count"] == 5

    # Dict input formatting
    custom_dict = {
        "gold_prospecting_info": {"status": "ok", "site_id": "american-river-south-fork"},
        "answer": "Custom gold prospecting answer string",
    }
    resp_dict = format_gold_prospecting_response(custom_dict)
    assert isinstance(resp_dict, FormattedProspectingResponse)
    assert str(resp_dict) == "Custom gold prospecting answer string"
    assert resp_dict["gold_prospecting_info"]["status"] == "ok"


def test_build_gold_prospecting_prompt():
    prompt = build_gold_prospecting_prompt()
    assert "7.28" in prompt
    assert "miner's moss" in prompt.lower() or "miners moss" in prompt.lower()
    assert "5-8" in prompt or "5 to 8" in prompt or "5°" in prompt

    prompt_site = build_gold_prospecting_prompt(
        ProspectingIntent(action="site_detail", site_id="american-river-south-fork")
    )
    assert "American River" in prompt_site


def test_gold_prospecting_tool():
    tool_input = {"action": "gear_checklist"}
    tool_out = gold_prospecting_tool(tool_input)
    assert isinstance(tool_out, dict)
    assert "gold_prospecting_info" in tool_out
    assert "answer" in tool_out
    assert tool_out["gold_prospecting_info"]["action"] == "gear_checklist"
