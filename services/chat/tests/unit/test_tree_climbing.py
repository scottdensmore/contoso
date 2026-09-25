import pytest
from contoso_chat.tree_climbing import (
    CanopyGroveModel,
    FormattedTreeClimbingResponse,
    TreeClimbingIntent,
    TreeClimbingRequest,
    TreeClimbingResponse,
    TreeGearItemModel,
    calculate_tree_climbing,
    detect_tree_climbing_intent,
    format_tree_climbing_response,
    get_canopy_grove,
    get_canopy_groves,
    get_tree_gear,
)

# =============================================================================
# 1. Canopy Grove Catalog & Model Tests
# =============================================================================


def test_canopy_grove_model():
    grove = CanopyGroveModel(
        grove_id="redwood-canopy-prairie-creek",
        title="Prairie Creek Redwoods Canopy Expedition",
        tree_species="Coast Redwood (Sequoia sempervirens)",
        location="Prairie Creek Redwoods State Park, CA, USA",
        canopy_height_m=92,
        climbing_system="SRT",
        limb_diameter_min_cm=25,
        description="Ancient coastal redwood canopy offering high vertical ascents into fern mats.",
        highlights=[
            "90m+ vertical ascent corridors",
            "Suspended canopy research portaledge",
            "Fern mat arboreal micro-ecosystem",
        ],
    )
    assert grove.grove_id == "redwood-canopy-prairie-creek"
    assert grove.canopy_height_m == 92
    assert grove.climbing_system == "SRT"
    assert grove.limb_diameter_min_cm == 25
    assert len(grove.highlights) == 3


def test_get_canopy_groves_catalog():
    groves = get_canopy_groves()
    assert len(groves) == 5
    ids = [g.grove_id for g in groves]
    assert "redwood-canopy-prairie-creek" in ids
    assert "olympic-rainforest-sitka" in ids
    assert "sequoia-giant-forest" in ids
    assert "appalachian-white-oak" in ids
    assert "tasmanian-tarkine-eucalyptus" in ids


def test_get_canopy_groves_filter():
    srt_groves = get_canopy_groves(climbing_system="SRT")
    assert len(srt_groves) == 4
    for g in srt_groves:
        assert g.climbing_system == "SRT"

    mrt_groves = get_canopy_groves(climbing_system="MRT_DRT")
    assert len(mrt_groves) == 1
    assert mrt_groves[0].grove_id == "appalachian-white-oak"

    empty_groves = get_canopy_groves(climbing_system="NONEXISTENT")
    assert len(empty_groves) == 0


def test_get_canopy_grove_by_id():
    grove = get_canopy_grove("redwood-canopy-prairie-creek")
    assert grove is not None
    assert grove.grove_id == "redwood-canopy-prairie-creek"
    assert "Prairie Creek" in grove.title

    # Case-insensitive & whitespace trimmed
    grove_upper = get_canopy_grove("  SEQUOIA-GIANT-FOREST  ")
    assert grove_upper is not None
    assert grove_upper.grove_id == "sequoia-giant-forest"

    # Non-existent
    assert get_canopy_grove("non-existent-grove") is None


# =============================================================================
# 2. Calculation Math Tests
# =============================================================================


def test_calculate_tree_climbing_defaults():
    req = TreeClimbingRequest()
    assert req.grove_id == "redwood-canopy-prairie-creek"
    assert req.climbing_system == "SRT"
    assert req.anchor_style == "basal_anchor"
    assert req.climber_weight_lbs == 190.0
    assert req.branch_diameter_cm == 22.0

    res = calculate_tree_climbing(req)
    assert isinstance(res, TreeClimbingResponse)
    assert res.grove_id == "redwood-canopy-prairie-creek"
    assert res.grove_title == "Prairie Creek Redwoods Canopy Expedition"
    # Basal anchor: round(190.0 * 2.0 * 1.2) = round(456.0) = 456 lbs
    assert res.peak_fork_load_lbs == 456
    # kN: round(456 * 0.00444822, 2) = 2.03
    assert res.peak_fork_load_kn == 2.03
    # Limb ratio: round((22.0 / 15.0) ** 2, 2) = round(2.151111, 2) = 2.15
    assert res.limb_safety_ratio == 2.15
    assert res.safety_status == "approved_cambium_saver_required"
    assert (
        res.friction_hitch_recommendation
        == "Valdôtain Tresse (VT) or Rope Wrench with 8mm Heat-Resistant Cord"
    )
    assert "Basal anchor" in res.advisory or "456" in res.advisory


def test_calculate_tree_climbing_canopy_isolated_anchor():
    req = TreeClimbingRequest(
        grove_id="appalachian-white-oak",
        climbing_system="MRT_DRT",
        anchor_style="canopy_isolated_anchor",
        climber_weight_lbs=180.0,
        branch_diameter_cm=20.0,
    )
    res = calculate_tree_climbing(req)
    assert res.grove_id == "appalachian-white-oak"
    # Canopy isolated: round(180.0 * 1.0 * 1.2) = 216 lbs
    assert res.peak_fork_load_lbs == 216
    # kN: round(216 * 0.00444822, 2) = 0.96
    assert res.peak_fork_load_kn == 0.96
    # Limb ratio: round((20.0 / 15.0) ** 2, 2) = 1.78
    assert res.limb_safety_ratio == 1.78
    assert res.safety_status == "approved_cambium_saver_required"
    assert (
        res.friction_hitch_recommendation
        == "Distel or Michoacan friction hitch on dynamic split-tail"
    )


def test_calculate_tree_climbing_safety_status_prohibited():
    req = TreeClimbingRequest(
        grove_id="olympic-rainforest-sitka",
        branch_diameter_cm=11.5,
    )
    res = calculate_tree_climbing(req)
    assert res.safety_status == "prohibited_structural_failure_risk"
    assert res.limb_safety_ratio == round((11.5 / 15.0) ** 2, 2)
    assert "prohibited" in res.advisory.lower() or "risk" in res.advisory.lower()


def test_calculate_tree_climbing_safety_status_marginal():
    req = TreeClimbingRequest(
        grove_id="sequoia-giant-forest",
        branch_diameter_cm=14.0,
    )
    res = calculate_tree_climbing(req)
    assert res.safety_status == "marginal_undersized_limb_hazard"
    assert res.limb_safety_ratio == round((14.0 / 15.0) ** 2, 2)


def test_calculate_tree_climbing_nonexistent_grove():
    req = TreeClimbingRequest(grove_id="unknown-grove-id")
    with pytest.raises(ValueError, match="not found"):
        calculate_tree_climbing(req)


# =============================================================================
# 3. Gear Checklist Tests
# =============================================================================


def test_get_tree_gear():
    gear = get_tree_gear()
    assert len(gear) == 6
    assert all(isinstance(g, TreeGearItemModel) for g in gear)
    assert all(g.mandatory is True for g in gear)

    item_ids = [g.item_id for g in gear]
    expected_ids = [
        "cambium-saver-conduit",
        "arborist-throwline-kit",
        "high-tensile-static-rope",
        "tree-climbing-saddle",
        "mechanical-friction-ascender",
        "canopy-suspension-helmet",
    ]
    for expected_id in expected_ids:
        assert expected_id in item_ids


# =============================================================================
# 4. Intent Detection Tests
# =============================================================================


def test_detect_tree_climbing_intent_calculation():
    queries = [
        "What is the basal anchor load and fork load for climbing redwoods?",
        "Calculate limb safety ratio and peak fork load for a 200 lb climber",
        "Basal ground anchor peak fork load in Prairie Creek",
    ]
    for q in queries:
        intent = detect_tree_climbing_intent(q)
        assert intent is not None
        assert intent.action in ("calculate_tree_climbing", "calculate")


def test_detect_tree_climbing_intent_gear():
    queries = [
        "What gear is needed for backcountry tree climbing cambium friction saver?",
        "Arborist throwline and tree climbing saddle gear checklist",
        "Equipment checklist for canopy climbing expedition",
    ]
    for q in queries:
        intent = detect_tree_climbing_intent(q)
        assert intent is not None
        assert intent.action in ("gear_checklist", "gear")


def test_detect_tree_climbing_intent_grove_detail():
    intent = detect_tree_climbing_intent(
        "Tell me about Prairie Creek redwood canopy climbing expedition"
    )
    assert intent is not None
    assert intent.action in ("grove_detail", "detail")
    assert intent.grove_id == "redwood-canopy-prairie-creek"


def test_detect_tree_climbing_intent_groves_list():
    intent = detect_tree_climbing_intent("List all arboreal canopy research tree climbing groves")
    assert intent is not None
    assert intent.action in ("groves_list", "groves")


def test_detect_tree_climbing_intent_climbing_system():
    intent_srt = detect_tree_climbing_intent(
        "SRT single rope technique tree climbing canopy expedition"
    )
    assert intent_srt is not None
    assert intent_srt.climbing_system == "SRT"

    intent_mrt = detect_tree_climbing_intent(
        "Moving rope technique MRT DRT tree climbing crown exploration"
    )
    assert intent_mrt is not None
    assert intent_mrt.climbing_system == "MRT_DRT"


# =============================================================================
# 5. Disambiguation Tests
# =============================================================================


def test_disambiguate_from_other_domains():
    other_domain_queries = [
        "What rock climbing shoes should I buy for sport climbing?",
        "El Capitan big wall aid climbing haul bag and portaledge",
        "Alpine highline slackline rigging with weblocks at Taft Point",
        "Vertical cave SRT rigging at Fantastic Pit with croll ascender",
        "Where can I buy chalk bag for bouldering?",
        "Slot canyon canyoneering rappel fiddlestick",
    ]
    for q in other_domain_queries:
        intent = detect_tree_climbing_intent(q)
        assert intent is None, f"Query '{q}' should NOT detect tree climbing intent"


# =============================================================================
# 6. Formatted Response Tests
# =============================================================================


def test_formatted_tree_climbing_response():
    data = {
        "answer": "Tree climbing guidance for Prairie Creek redwoods.",
        "tree_climbing_info": {
            "grove_id": "redwood-canopy-prairie-creek",
            "peak_fork_load_lbs": 456,
        },
    }
    fmt = format_tree_climbing_response(data)
    assert isinstance(fmt, FormattedTreeClimbingResponse)
    assert isinstance(fmt, str)
    assert "Tree climbing" in str(fmt)
    assert fmt.get("tree_climbing_info")["grove_id"] == "redwood-canopy-prairie-creek"
    assert "tree_climbing_info" in fmt
    assert "answer" in fmt.keys()


def test_format_tree_climbing_response_from_intent():
    intent = TreeClimbingIntent(
        action="calculate_tree_climbing",
        grove_id="redwood-canopy-prairie-creek",
        climbing_system="SRT",
    )
    fmt = format_tree_climbing_response(intent)
    assert isinstance(fmt, FormattedTreeClimbingResponse)
    assert "Prairie Creek" in str(fmt) or "456" in str(fmt) or "fork load" in str(fmt).lower()
    info = fmt.get("tree_climbing_info")
    assert info is not None
    assert info["action"] in ("calculate_tree_climbing", "calculate")
