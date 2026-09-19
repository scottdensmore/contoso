import pytest
from contoso_chat.shuttles import (
    CarpoolOfferRequest,
    CarpoolOfferResponse,
    ShuttleBookingRequest,
    ShuttleBookingResponse,
    ShuttleIntent,
    ShuttleQuoteRequest,
    ShuttleQuoteResponse,
    ShuttleRouteModel,
    book_shuttle,
    build_shuttle_prompt,
    calculate_shuttle_quote,
    create_carpool_offer,
    detect_shuttle_intent,
    format_shuttle_response,
    get_shuttle_route_by_id,
    get_shuttle_routes,
    list_carpools,
)


def test_shuttle_route_model():
    route = ShuttleRouteModel(
        route_id="test-route",
        name="Test Route Shuttle",
        region="cascades",
        origin="Trailhead A",
        destination="Trailhead B",
        duration_minutes=40,
        price_per_seat=25.0,
        departure_times=["06:00", "08:00"],
        is_connector=True,
        parking_permit_required=True,
        parking_advice="Permit required at Trailhead A",
    )
    assert route.route_id == "test-route"
    assert route.is_connector is True
    assert route.price_per_seat == 25.0


def test_shuttle_quote_models():
    req = ShuttleQuoteRequest(route_id="enchantments-connector", seats=2)
    assert req.seats == 2
    res = ShuttleQuoteResponse(
        route_id="enchantments-connector",
        route_name="Enchantments Through-Hike Connector",
        origin="Snow Lakes Trailhead",
        destination="Stuart/Colchuck Trailhead",
        seats=2,
        price_per_seat=30.0,
        total_price=60.0,
        duration_minutes=35,
        departure_times=["05:30", "06:30", "07:30", "09:00"],
        parking_advice="Park at Snow Lakes Trailhead.",
    )
    assert res.total_price == 60.0


def test_shuttle_booking_models():
    req = ShuttleBookingRequest(
        route_id="enchantments-connector",
        departure_date="2026-10-03",
        departure_time="06:30",
        seats=2,
        passenger_name="Taylor Swift",
        passenger_email="taylor@example.com",
    )
    assert req.seats == 2
    res = ShuttleBookingResponse(
        booking_id="SHT-12345",
        route_id=req.route_id,
        route_name="Enchantments Through-Hike Connector",
        departure_date=req.departure_date,
        departure_time=req.departure_time,
        seats=2,
        total_price=60.0,
        status="confirmed",
        instructions="Arrive 15 minutes before departure.",
    )
    assert res.booking_id.startswith("SHT-")
    assert res.status == "confirmed"


def test_carpool_models():
    req = CarpoolOfferRequest(
        origin_city="Seattle",
        destination_trailhead="Mount Rainier - Paradise",
        departure_date="2026-10-03",
        seats_available=2,
        driver_name="Alex River",
        contact_info="alex@example.com",
        notes="Leaving early from Green Lake",
    )
    assert req.seats_available == 2
    res = CarpoolOfferResponse(
        carpool_id="CPL-99999",
        origin_city=req.origin_city,
        destination_trailhead=req.destination_trailhead,
        departure_date=req.departure_date,
        seats_available=req.seats_available,
        driver_name=req.driver_name,
        contact_info=req.contact_info,
        notes=req.notes,
        created_at="2026-09-19T08:00:00Z",
    )
    assert res.carpool_id.startswith("CPL-")


def test_shuttle_intent_model():
    intent = ShuttleIntent(action="routes", region="cascades")
    assert intent.action == "routes"
    assert intent.region == "cascades"


def test_get_shuttle_routes_all():
    routes = get_shuttle_routes()
    assert len(routes) >= 4
    route_ids = {r.route_id for r in routes}
    assert {
        "enchantments-connector",
        "rainier-express",
        "olympic-coast",
        "rockies-loop",
    }.issubset(route_ids)


def test_get_shuttle_routes_filtered_by_region():
    cascades_routes = get_shuttle_routes(region="cascades")
    assert len(cascades_routes) >= 1
    assert all(r.region == "cascades" for r in cascades_routes)

    rainier_routes = get_shuttle_routes(region="rainier")
    assert len(rainier_routes) >= 1
    assert all(r.region == "rainier" for r in rainier_routes)

    unknown_routes = get_shuttle_routes(region="nonexistent_region")
    assert len(unknown_routes) == 0


def test_get_shuttle_routes_filtered_connector_only():
    connector_routes = get_shuttle_routes(connector_only=True)
    assert len(connector_routes) >= 1
    assert all(r.is_connector for r in connector_routes)


def test_get_shuttle_route_by_id():
    route = get_shuttle_route_by_id("enchantments-connector")
    assert route is not None
    assert route.route_id == "enchantments-connector"
    assert route.duration_minutes == 35
    assert route.price_per_seat == 30.0
    assert route.departure_times == ["05:30", "06:30", "07:30", "09:00"]
    assert route.is_connector is True

    missing = get_shuttle_route_by_id("invalid-shuttle-id")
    assert missing is None


def test_calculate_shuttle_quote_single_and_multiple_seats():
    quote_1 = calculate_shuttle_quote("enchantments-connector", seats=1)
    assert quote_1 is not None
    assert quote_1.route_id == "enchantments-connector"
    assert quote_1.seats == 1
    assert quote_1.price_per_seat == 30.0
    assert quote_1.total_price == 30.0
    assert len(quote_1.departure_times) == 4

    quote_2 = calculate_shuttle_quote("enchantments-connector", seats=2)
    assert quote_2 is not None
    assert quote_2.seats == 2
    assert quote_2.price_per_seat == 30.0
    assert quote_2.total_price == 60.0

    quote_4 = calculate_shuttle_quote("rainier-express", seats=4)
    assert quote_4 is not None
    assert quote_4.seats == 4
    assert quote_4.price_per_seat == 25.0
    assert quote_4.total_price == 100.0

    missing_quote = calculate_shuttle_quote("nonexistent-route", seats=2)
    assert missing_quote is None


def test_book_shuttle_success():
    req = ShuttleBookingRequest(
        route_id="enchantments-connector",
        departure_date="2026-10-03",
        departure_time="06:30",
        seats=2,
        passenger_name="Taylor Swift",
        passenger_email="taylor@example.com",
    )
    booking = book_shuttle(req)
    assert booking.booking_id.startswith("SHT-")
    assert len(booking.booking_id) >= 7
    assert booking.route_id == "enchantments-connector"
    assert booking.route_name == "Enchantments Through-Hike Connector"
    assert booking.departure_date == "2026-10-03"
    assert booking.departure_time == "06:30"
    assert booking.seats == 2
    assert booking.total_price == 60.0
    assert booking.status == "confirmed"
    assert "instructions" in booking.instructions.lower() or "arrive" in booking.instructions.lower()


def test_book_shuttle_route_not_found():
    req = ShuttleBookingRequest(
        route_id="invalid-route",
        departure_date="2026-10-03",
        departure_time="06:30",
        seats=1,
        passenger_name="Taylor Swift",
        passenger_email="taylor@example.com",
    )
    with pytest.raises(ValueError, match="Route 'invalid-route' not found"):
        book_shuttle(req)


def test_carpool_listing_and_creation():
    initial_carpools = list_carpools()
    assert len(initial_carpools) >= 2
    assert any("Rainier" in c.destination_trailhead for c in initial_carpools)

    filtered = list_carpools(destination="Rainier")
    assert len(filtered) >= 1
    assert all("Rainier".lower() in c.destination_trailhead.lower() for c in filtered)

    new_offer = CarpoolOfferRequest(
        origin_city="Portland",
        destination_trailhead="Mount Hood Timberline Trailhead",
        departure_date="2026-10-12",
        seats_available=3,
        driver_name="Jordan Lee",
        contact_info="jordan.lee@example.com",
        notes="Room for backpacks and poles",
    )
    created = create_carpool_offer(new_offer)
    assert created.carpool_id.startswith("CPL-")
    assert created.origin_city == "Portland"
    assert created.seats_available == 3
    assert created.created_at is not None

    after_add = list_carpools(destination="Timberline")
    assert len(after_add) == 1
    assert after_add[0].carpool_id == created.carpool_id


@pytest.mark.parametrize(
    ("query", "expected_action", "expected_route", "expected_region"),
    [
        (
            "How do I get to Snow Lakes trailhead without leaving two cars?",
            "routes",
            "enchantments-connector",
            "cascades",
        ),
        (
            "Are there shuttles for the Enchantments?",
            "routes",
            "enchantments-connector",
            "cascades",
        ),
        (
            "What time does the Mount Rainier shuttle leave?",
            "schedule",
            "rainier-express",
            "rainier",
        ),
        (
            "Can I find a carpool to Mount Rainier?",
            "carpool",
            "rainier-express",
            "rainier",
        ),
        (
            "point-to-point hike transit options",
            "routes",
            None,
            None,
        ),
        (
            "trailhead transit routes in the cascades",
            "routes",
            None,
            "cascades",
        ),
        (
            "How much does a ride to trailhead cost for 2 seats on the enchantments connector?",
            "quote",
            "enchantments-connector",
            "cascades",
        ),
        (
            "Book 2 seats on the enchantments connector shuttle for 2026-10-05",
            "book",
            "enchantments-connector",
            "cascades",
        ),
        (
            "Are there community rideshares or carpools to Bear Lake in the rockies?",
            "carpool",
            "rockies-loop",
            "rockies",
        ),
    ],
)
def test_detect_shuttle_intent(query, expected_action, expected_route, expected_region):
    intent = detect_shuttle_intent(query)
    assert intent is not None
    assert intent.action == expected_action
    if expected_route:
        assert intent.route_id == expected_route
    if expected_region:
        assert intent.region == expected_region


def test_detect_shuttle_intent_extracts_seats_and_date():
    intent = detect_shuttle_intent("Quote for 3 seats on the enchantments shuttle on 2026-10-10")
    assert intent is not None
    assert intent.action == "quote"
    assert intent.seats == 3
    assert intent.departure_date == "2026-10-10"

    intent_word_seats = detect_shuttle_intent("I need two seats for the Mount Rainier shuttle")
    assert intent_word_seats is not None
    assert intent_word_seats.seats == 2


def test_detect_shuttle_intent_returns_none_for_unrelated_queries():
    assert detect_shuttle_intent("What is your return policy for boots?") is None
    assert detect_shuttle_intent("Do you have waterproof tents?") is None
    assert detect_shuttle_intent("Track my order #12345") is None


def test_build_shuttle_prompt():
    intent = ShuttleIntent(action="routes", region="cascades", route_id="enchantments-connector")
    prompt = build_shuttle_prompt(intent)
    assert "Trailhead Shuttle & Rideshare Grounding" in prompt
    assert "Enchantments Through-Hike Connector" in prompt
    assert "Snow Lakes Trailhead" in prompt
    assert "parking" in prompt.lower() or "permit" in prompt.lower()


def test_format_shuttle_response_routes():
    intent = ShuttleIntent(action="routes", route_id="enchantments-connector")
    res = format_shuttle_response(intent)
    assert "answer" in res
    assert "shuttle_info" in res
    info = res["shuttle_info"]
    assert info["action"] == "routes"
    assert len(info["routes"]) >= 1
    assert any(r["route_id"] == "enchantments-connector" for r in info["routes"])


def test_format_shuttle_response_quote():
    intent = ShuttleIntent(action="quote", route_id="enchantments-connector", seats=2)
    res = format_shuttle_response(intent)
    assert "answer" in res
    assert "$60.00" in res["answer"] or "60" in res["answer"]
    info = res["shuttle_info"]
    assert info["action"] == "quote"
    assert info["quote"]["total_price"] == 60.0
    assert info["quote"]["seats"] == 2


def test_format_shuttle_response_carpool():
    intent = ShuttleIntent(action="carpool", trailhead="Mount Rainier", region="rainier")
    res = format_shuttle_response(intent)
    assert "answer" in res
    assert "carpool" in res["answer"].lower()
    info = res["shuttle_info"]
    assert info["action"] == "carpool"
    assert "carpools" in info
    assert len(info["carpools"]) >= 1
