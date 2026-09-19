import pytest
from contoso_chat.huts import (
    AlpineHutModel,
    HutAvailabilityRequest,
    HutAvailabilityResponse,
    HutBookingRequest,
    HutBookingResponse,
    HutIntent,
    book_alpine_hut,
    build_hut_prompt,
    calculate_hut_quote,
    detect_hut_intent,
    format_hut_response,
    get_alpine_hut_by_id,
    get_alpine_huts,
)


def test_alpine_hut_model():
    hut = AlpineHutModel(
        hut_id="test-hut",
        name="Test Ridge Cabin",
        range_name="cascades",
        elevation_feet=6200,
        capacity_bunks=10,
        price_per_night=40.0,
        difficulty="Moderate",
        amenities=["Wood Stove", "Solar Lighting"],
        mandatory_gear=["Sleeping Bag Liner", "Headlamp"],
        description="A peaceful cabin in the mountains.",
    )
    assert hut.hut_id == "test-hut"
    assert hut.elevation_feet == 6200
    assert hut.difficulty == "Moderate"
    assert "Wood Stove" in hut.amenities
    assert "Sleeping Bag Liner" in hut.mandatory_gear


def test_hut_availability_models():
    req = HutAvailabilityRequest(hut_id="asgard-refuge", nights=2, guests=2)
    assert req.hut_id == "asgard-refuge"
    assert req.nights == 2
    assert req.guests == 2

    res = HutAvailabilityResponse(
        hut_id="asgard-refuge",
        name="Asgard Pass High Alpine Refuge",
        range_name="cascades",
        elevation_feet=7850,
        price_per_night=45.0,
        nights=2,
        guests=2,
        total_price=180.0,
        available=True,
        difficulty="Strenuous",
        amenities=["Wood Stove", "Solar Lighting", "Composting Toilet", "Snow Melt Cistern"],
        mandatory_gear=["Sleeping Bag Liner", "Headlamp", "Microspikes"],
    )
    assert res.total_price == 180.0
    assert res.available is True


def test_hut_booking_models():
    req = HutBookingRequest(
        hut_id="asgard-refuge",
        checkin_date="2026-10-05",
        nights=2,
        guests=2,
        guest_name="Alex Honnold",
        guest_email="alex@example.com",
    )
    assert req.nights == 2
    assert req.guest_name == "Alex Honnold"

    res = HutBookingResponse(
        booking_id="HUT-12345",
        hut_id="asgard-refuge",
        hut_name="Asgard Pass High Alpine Refuge",
        checkin_date="2026-10-05",
        nights=2,
        guests=2,
        total_price=180.0,
        status="confirmed",
        instructions="Carry a sleeping bag liner and follow leave-no-trace principles.",
    )
    assert res.booking_id.startswith("HUT-")
    assert res.status == "confirmed"


def test_hut_intent_model():
    intent = HutIntent(action="huts", range_name="cascades")
    assert intent.action == "huts"
    assert intent.range_name == "cascades"


def test_get_alpine_huts_all():
    huts = get_alpine_huts()
    assert len(huts) >= 4
    hut_ids = {h.hut_id for h in huts}
    assert {
        "asgard-refuge",
        "mueller-ridge",
        "cirque-towers",
        "red-mountain-yurt",
    }.issubset(hut_ids)


def test_get_alpine_huts_filtered_by_range():
    cascades_huts = get_alpine_huts(range_name="cascades")
    assert len(cascades_huts) >= 1
    assert all(h.range_name == "cascades" for h in cascades_huts)

    olympic_huts = get_alpine_huts(range_name="olympic")
    assert len(olympic_huts) >= 1
    assert all(h.range_name == "olympic" for h in olympic_huts)

    wind_river_huts = get_alpine_huts(range_name="wind_river")
    assert len(wind_river_huts) >= 1
    assert all(h.range_name == "wind_river" for h in wind_river_huts)

    san_juan_huts = get_alpine_huts(range_name="san_juan")
    assert len(san_juan_huts) >= 1
    assert all(h.range_name == "san_juan" for h in san_juan_huts)

    empty_huts = get_alpine_huts(range_name="alps")
    assert len(empty_huts) == 0


def test_get_alpine_huts_filtered_by_difficulty():
    moderate_huts = get_alpine_huts(difficulty="Moderate")
    assert len(moderate_huts) >= 1
    assert all(h.difficulty.lower() == "moderate" for h in moderate_huts)

    strenuous_huts = get_alpine_huts(difficulty="Strenuous")
    assert len(strenuous_huts) >= 1
    assert all(h.difficulty.lower() == "strenuous" for h in strenuous_huts)

    technical_huts = get_alpine_huts(difficulty="Technical")
    assert len(technical_huts) >= 1
    assert all(h.difficulty.lower() == "technical" for h in technical_huts)


def test_get_alpine_hut_by_id():
    hut = get_alpine_hut_by_id("asgard-refuge")
    assert hut is not None
    assert hut.name == "Asgard Pass High Alpine Refuge"
    assert hut.elevation_feet == 7850
    assert hut.price_per_night == 45.0

    hut_upper = get_alpine_hut_by_id("ASGARD-REFUGE")
    assert hut_upper is not None
    assert hut_upper.hut_id == "asgard-refuge"

    assert get_alpine_hut_by_id("nonexistent-hut") is None


def test_calculate_hut_quote():
    # Single night, single guest at Asgard Pass ($45)
    req1 = HutAvailabilityRequest(hut_id="asgard-refuge", nights=1, guests=1)
    quote1 = calculate_hut_quote(req1)
    assert quote1 is not None
    assert quote1.total_price == 45.0
    assert quote1.available is True

    # 2 nights, 2 guests at Asgard Pass: 2 * 2 * 45 = 180.0
    req2 = HutAvailabilityRequest(hut_id="asgard-refuge", nights=2, guests=2)
    quote2 = calculate_hut_quote(req2)
    assert quote2 is not None
    assert quote2.total_price == 180.0
    assert quote2.nights == 2
    assert quote2.guests == 2

    # Quote by range name
    req3 = HutAvailabilityRequest(range_name="olympic", nights=3, guests=1)
    quote3 = calculate_hut_quote(req3)
    assert quote3 is not None
    assert quote3.hut_id == "mueller-ridge"
    assert quote3.total_price == 105.0  # 3 * 35.0

    # Nonexistent hut
    req_bad = HutAvailabilityRequest(hut_id="unknown-hut")
    assert calculate_hut_quote(req_bad) is None


def test_book_alpine_hut():
    req = HutBookingRequest(
        hut_id="asgard-refuge",
        checkin_date="2026-10-12",
        nights=2,
        guests=2,
        guest_name="Jordan Romero",
        guest_email="jordan@example.com",
    )
    booking = book_alpine_hut(req)
    assert booking.booking_id.startswith("HUT-")
    assert booking.hut_id == "asgard-refuge"
    assert booking.hut_name == "Asgard Pass High Alpine Refuge"
    assert booking.checkin_date == "2026-10-12"
    assert booking.nights == 2
    assert booking.guests == 2
    assert booking.total_price == 180.0
    assert booking.status == "confirmed"
    assert "instructions" in booking.model_dump()
    assert len(booking.instructions) > 10

    # Booking invalid hut raises ValueError
    bad_req = HutBookingRequest(
        hut_id="nonexistent-hut",
        checkin_date="2026-10-12",
        nights=1,
        guests=1,
        guest_name="Test",
        guest_email="test@example.com",
    )
    with pytest.raises(ValueError, match="not found"):
        book_alpine_hut(bad_req)


def test_detect_hut_intent_keywords_and_actions():
    # Catalog inquiry
    intent_huts = detect_hut_intent("Can I stay at the Asgard Pass alpine refuge?")
    assert intent_huts is not None
    assert intent_huts.action == "huts"
    assert intent_huts.hut_id == "asgard-refuge"
    assert intent_huts.range_name == "cascades"

    # Quote inquiry
    intent_quote = detect_hut_intent("How much does a bunk at Mueller Ridge cabin cost for 2 nights?")
    assert intent_quote is not None
    assert intent_quote.action == "quote"
    assert intent_quote.hut_id == "mueller-ridge"
    assert intent_quote.nights == 2

    # Quote with multiple bunks / guests
    intent_quote_bunks = detect_hut_intent("Price quote for 2 bunks for 2 nights at Asgard Pass refuge")
    assert intent_quote_bunks is not None
    assert intent_quote_bunks.action == "quote"
    assert intent_quote_bunks.hut_id == "asgard-refuge"
    assert intent_quote_bunks.guests == 2
    assert intent_quote_bunks.nights == 2

    # Gear inquiry
    intent_gear = detect_hut_intent("What gear is required for the Cirque of the Towers shelter?")
    assert intent_gear is not None
    assert intent_gear.action == "gear"
    assert intent_gear.hut_id == "cirque-towers"
    assert intent_gear.range_name == "wind_river"

    # Booking inquiry
    intent_book = detect_hut_intent("Book 2 bunks at Red Mountain Yurt")
    assert intent_book is not None
    assert intent_book.action == "book"
    assert intent_book.hut_id == "red-mountain-yurt"
    assert intent_book.guests == 2

    # Rules / etiquette inquiry
    intent_rules = detect_hut_intent("What are the hut rules and etiquette for alpine refuges?")
    assert intent_rules is not None
    assert intent_rules.action == "rules"

    # Generic mountain shelter inquiry
    intent_general = detect_hut_intent("Tell me about backcountry alpine huts in the cascades")
    assert intent_general is not None
    assert intent_general.action == "huts"
    assert intent_general.range_name == "cascades"

    # Non-hut query returns None
    assert detect_hut_intent("Where can I rent a kayak?") is None


def test_build_hut_prompt():
    intent = HutIntent(action="gear", hut_id="asgard-refuge")
    prompt = build_hut_prompt(intent)
    assert "Alpine Hut" in prompt
    assert "Asgard Pass High Alpine Refuge" in prompt
    assert "Sleeping Bag Liner" in prompt
    assert "Microspikes" in prompt
    assert "Leave No Trace" in prompt or "leave-no-trace" in prompt.lower()


def test_format_hut_response_quote():
    intent = HutIntent(action="quote", hut_id="asgard-refuge", nights=2, guests=2)
    resp = format_hut_response(intent)
    assert "answer" in resp
    assert "$180" in resp["answer"]
    assert "hut_info" in resp
    assert resp["hut_info"]["action"] == "quote"
    assert resp["hut_info"]["quote"]["total_price"] == 180.0


def test_format_hut_response_gear():
    intent = HutIntent(action="gear", hut_id="cirque-towers")
    resp = format_hut_response(intent)
    assert "answer" in resp
    assert "mandatory gear" in resp["answer"].lower() or "gear" in resp["answer"].lower()
    assert "Sleeping Bag Liner" in resp["answer"]
    assert "Helmet" in resp["answer"]
    assert "Satellite Communicator" in resp["answer"]
    assert resp["hut_info"]["action"] == "gear"
    assert "mandatory_gear" in resp["hut_info"]


def test_format_hut_response_rules():
    intent = HutIntent(action="rules")
    resp = format_hut_response(intent)
    assert "answer" in resp
    assert "pack" in resp["answer"].lower()
    assert "liner" in resp["answer"].lower()
    assert resp["hut_info"]["action"] == "rules"
    assert "rules" in resp["hut_info"]


def test_format_hut_response_huts():
    intent = HutIntent(action="huts", range_name="cascades")
    resp = format_hut_response(intent)
    assert "answer" in resp
    assert "Asgard Pass" in resp["answer"]
    assert resp["hut_info"]["action"] == "huts"
    assert len(resp["hut_info"]["huts"]) >= 1
