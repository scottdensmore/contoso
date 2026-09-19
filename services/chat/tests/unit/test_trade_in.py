from contoso_chat.trade_in import (
    EligibleBrandModel,
    TradeInEstimateModel,
    TradeInIntent,
    build_trade_in_prompt,
    detect_trade_in_intent,
    estimate_trade_in_payout,
    format_trade_in_response,
    get_eligible_brands,
)


def test_eligible_brands_catalog():
    brands = get_eligible_brands()
    assert len(brands) == 8
    brand_names = [b.name for b in brands]
    assert "Contoso Outdoors" in brand_names
    assert "Patagonia" in brand_names
    assert "Arc'teryx" in brand_names
    assert "The North Face" in brand_names
    assert "Mountain Hardwear" in brand_names
    assert "Osprey" in brand_names
    assert "Big Agnes" in brand_names
    assert "Nemo Equipment" in brand_names

    for b in brands:
        assert isinstance(b, EligibleBrandModel)
        assert b.brand_id
        assert b.tier in ["house", "premium", "standard"]
        assert len(b.accepted_categories) > 0


def test_estimate_trade_in_payout_conditions():
    # Excellent condition: 50%
    est_exc = estimate_trade_in_payout(
        category="tents",
        original_msrp=400.0,
        condition="excellent",
        brand="Big Agnes",
    )
    assert isinstance(est_exc, TradeInEstimateModel)
    assert est_exc.category == "tents"
    assert est_exc.brand == "Big Agnes"
    assert est_exc.original_msrp == 400.0
    assert est_exc.condition == "excellent"
    assert est_exc.estimated_payout == 200.0
    assert est_exc.co2_avoided_kg == 25.0
    assert "Like new" in est_exc.condition_summary

    # Very Good condition: 40% (default)
    est_vg = estimate_trade_in_payout(
        category="backpacks",
        original_msrp=300.0,
    )
    assert est_vg.condition == "very_good"
    assert est_vg.estimated_payout == 120.0
    assert est_vg.co2_avoided_kg == 18.0
    assert "Minor cosmetic wear" in est_vg.condition_summary

    # Fair condition: 25%
    est_fair = estimate_trade_in_payout(
        category="jackets",
        original_msrp=200.0,
        condition="fair",
        brand="Patagonia",
    )
    assert est_fair.condition == "fair"
    assert est_fair.estimated_payout == 50.0
    assert est_fair.co2_avoided_kg == 12.0
    assert "Visible wear" in est_fair.condition_summary


def test_estimate_trade_in_payout_categories_and_aliases():
    est1 = estimate_trade_in_payout("tent", 100.0)
    assert est1.category == "tents"

    est2 = estimate_trade_in_payout("sleeping bag", 200.0)
    assert est2.category == "sleeping_bags"
    assert est2.co2_avoided_kg == 15.0

    est3 = estimate_trade_in_payout("boots", 150.0)
    assert est3.category == "footwear"
    assert est3.co2_avoided_kg == 10.0


def test_detect_trade_in_intent_estimate():
    query = "Can I trade in my used Patagonia jacket for store credit?"
    intent = detect_trade_in_intent(query)
    assert intent is not None
    assert intent.action == "estimate"
    assert intent.brand == "Patagonia"
    assert intent.category == "jackets"

    query2 = "What is the trade-in estimate for my $400 Big Agnes tent in excellent condition?"
    intent2 = detect_trade_in_intent(query2)
    assert intent2 is not None
    assert intent2.action == "estimate"
    assert intent2.brand == "Big Agnes"
    assert intent2.category == "tents"
    assert intent2.msrp == 400.0
    assert intent2.condition == "excellent"


def test_detect_trade_in_intent_brands():
    query = "What brands are eligible for the Contoso Re-Gear trade-in program?"
    intent = detect_trade_in_intent(query)
    assert intent is not None
    assert intent.action == "brands"

    query2 = "Which brands do you accept for gear trade-in?"
    intent2 = detect_trade_in_intent(query2)
    assert intent2 is not None
    assert intent2.action == "brands"


def test_detect_trade_in_intent_condition_guide():
    query = "What are the condition requirements and tiers for trade-ins?"
    intent = detect_trade_in_intent(query)
    assert intent is not None
    assert intent.action == "condition_guide"


def test_detect_trade_in_intent_sustainability():
    query = "How does trading in used gear help the environment and reduce CO2?"
    intent = detect_trade_in_intent(query)
    assert intent is not None
    assert intent.action == "sustainability"


def test_detect_trade_in_intent_non_queries():
    assert detect_trade_in_intent("What tents do you recommend for backpacking?") is None
    assert detect_trade_in_intent("Can you help me return my order CTSO-12345?") is None
    assert detect_trade_in_intent("Do you sell waterproof hiking boots?") is None
    assert detect_trade_in_intent("") is None
    assert detect_trade_in_intent("   ") is None


def test_build_trade_in_prompt():
    intent = TradeInIntent(
        action="estimate",
        category="tents",
        brand="Big Agnes",
        condition="excellent",
        msrp=400.0,
    )
    prompt = build_trade_in_prompt(intent)
    assert "Re-Gear" in prompt
    assert "Big Agnes" in prompt
    assert "tents" in prompt
    assert "$200.00" in prompt
    assert "25.0 kg" in prompt


def test_format_trade_in_response():
    intent = TradeInIntent(
        action="estimate",
        category="jackets",
        brand="Patagonia",
        condition="very_good",
        msrp=200.0,
    )
    resp = format_trade_in_response(intent)
    assert "answer" in resp
    assert "trade_in_info" in resp
    assert resp["trade_in_info"]["action"] == "estimate"
    assert resp["trade_in_info"]["estimate"]["estimated_payout"] == 80.0
    assert "Patagonia" in resp["answer"]
    assert "store credit" in resp["answer"].lower()
