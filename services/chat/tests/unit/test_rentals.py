from contoso_chat.rentals import (
    RentalIntent,
    RentalPackage,
    RentalQuoteRequest,
    RentalQuoteResponse,
    build_rental_prompt,
    calculate_rental_quote,
    detect_rental_intent,
    format_rental_response,
    get_rental_package_by_id_or_name,
    get_rental_packages,
)


class TestRentalCatalog:
    def test_get_all_rental_packages(self):
        packages = get_rental_packages()
        assert isinstance(packages, list)
        assert len(packages) == 4
        ids = {p.id for p in packages}
        assert ids == {
            "camp-bundle-4p",
            "backpack-ultralight",
            "kayak-touring-set",
            "snowshoe-alpine-kit",
        }

    def test_rental_package_structure(self):
        camp = get_rental_package_by_id_or_name("camp-bundle-4p")
        assert camp is not None
        assert isinstance(camp, RentalPackage)
        assert camp.id == "camp-bundle-4p"
        assert camp.name == "4-Person Deluxe Camping Package"
        assert camp.category == "camping"
        assert camp.daily_rate == 45.0
        assert camp.deposit == 100.0
        assert len(camp.specs) > 0
        assert set(camp.available_stores) == {"Seattle", "Denver", "Portland", "Salt Lake City"}

    def test_get_rental_packages_by_category(self):
        camping_pkgs = get_rental_packages(category="camping")
        assert len(camping_pkgs) == 1
        assert camping_pkgs[0].id == "camp-bundle-4p"

        paddling_pkgs = get_rental_packages(category="paddling")
        assert len(paddling_pkgs) == 1
        assert paddling_pkgs[0].id == "kayak-touring-set"

        winter_pkgs = get_rental_packages(category="winter")
        assert len(winter_pkgs) == 1
        assert winter_pkgs[0].id == "snowshoe-alpine-kit"

        backpacking_pkgs = get_rental_packages(category="backpacking")
        assert len(backpacking_pkgs) == 1
        assert backpacking_pkgs[0].id == "backpack-ultralight"

        unknown_pkgs = get_rental_packages(category="surfing")
        assert unknown_pkgs == []

    def test_get_rental_package_by_id_or_name_search(self):
        # By ID
        assert get_rental_package_by_id_or_name("kayak-touring-set") is not None
        # By Name
        assert get_rental_package_by_id_or_name("Touring Kayak & Paddle Set") is not None
        # By partial / case-insensitive name
        assert get_rental_package_by_id_or_name("touring kayak") is not None
        # By alias / keyword
        assert get_rental_package_by_id_or_name("tent") is not None
        assert get_rental_package_by_id_or_name("kayak") is not None
        assert get_rental_package_by_id_or_name("backpack") is not None
        assert get_rental_package_by_id_or_name("snowshoe") is not None
        # Unknown
        assert get_rental_package_by_id_or_name("unknown-gear-type-xyz") is None


class TestRentalQuotes:
    def test_rental_quote_request_model(self):
        req = RentalQuoteRequest(gear_type="camping")
        assert req.gear_type == "camping"
        assert req.days == 1
        assert req.store_name is None

    def test_quote_1_day_no_discount(self):
        quote = calculate_rental_quote("camping", days=1)
        assert quote is not None
        assert isinstance(quote, RentalQuoteResponse)
        assert quote.package_id == "camp-bundle-4p"
        assert quote.daily_rate == 45.0
        assert quote.days == 1
        assert quote.discount_percent == 0.0
        assert quote.discount_amount == 0.0
        assert quote.subtotal == 45.0
        assert quote.deposit == 100.0
        assert quote.total_due == 145.0
        assert quote.store is None
        assert quote.store_available is True

    def test_quote_2_days_no_discount(self):
        quote = calculate_rental_quote("tent", days=2)
        assert quote is not None
        assert quote.days == 2
        assert quote.discount_percent == 0.0
        assert quote.discount_amount == 0.0
        assert quote.subtotal == 90.0
        assert quote.deposit == 100.0
        assert quote.total_due == 190.0

    def test_quote_3_days_10_percent_discount(self):
        quote = calculate_rental_quote("camp-bundle-4p", days=3)
        assert quote is not None
        assert quote.days == 3
        assert quote.discount_percent == 10.0
        # 45 * 3 = 135. 10% of 135 = 13.5
        assert quote.discount_amount == 13.5
        assert quote.subtotal == 121.5
        assert quote.deposit == 100.0
        assert quote.total_due == 221.5

    def test_quote_4_days_10_percent_discount_with_store(self):
        quote = calculate_rental_quote("camping", days=4, store_name="Seattle")
        assert quote is not None
        assert quote.days == 4
        assert quote.discount_percent == 10.0
        # 45 * 4 = 180. 10% of 180 = 18.0
        assert quote.discount_amount == 18.0
        assert quote.subtotal == 162.0
        assert quote.deposit == 100.0
        assert quote.total_due == 262.0
        assert quote.store == "Seattle"
        assert quote.store_available is True
        assert "Seattle" in quote.available_stores

    def test_quote_7_days_20_percent_discount(self):
        quote = calculate_rental_quote("kayak", days=7, store_name="Seattle")
        assert quote is not None
        assert quote.package_id == "kayak-touring-set"
        assert quote.daily_rate == 50.0
        assert quote.days == 7
        assert quote.discount_percent == 20.0
        # 50 * 7 = 350. 20% of 350 = 70.0
        assert quote.discount_amount == 70.0
        assert quote.subtotal == 280.0
        assert quote.deposit == 150.0
        assert quote.total_due == 430.0
        assert quote.store == "Seattle"
        assert quote.store_available is True

    def test_quote_store_availability_negative(self):
        # Kayak is only in Seattle and Portland
        quote = calculate_rental_quote("kayak", days=3, store_name="Denver")
        assert quote is not None
        assert quote.store == "Denver"
        assert quote.store_available is False
        assert set(quote.available_stores) == {"Seattle", "Portland"}

    def test_quote_snowshoe_stores(self):
        # Snowshoes in Denver, Salt Lake City, Seattle, NOT Portland
        quote_pdx = calculate_rental_quote("snowshoe", days=2, store_name="Portland")
        assert quote_pdx is not None
        assert quote_pdx.store == "Portland"
        assert quote_pdx.store_available is False
        assert set(quote_pdx.available_stores) == {"Denver", "Salt Lake City", "Seattle"}

        quote_den = calculate_rental_quote("snowshoe", days=2, store_name="Denver")
        assert quote_den is not None
        assert quote_den.store_available is True

    def test_quote_unknown_package_returns_none(self):
        assert calculate_rental_quote("hoverboard", days=3) is None


class TestDetectRentalIntent:
    def test_detect_packages_intent(self):
        intent = detect_rental_intent("Can I rent a tent?")
        assert intent is not None
        assert isinstance(intent, RentalIntent)
        assert intent.action == "packages"
        assert intent.gear_type in ("camping", "tent")

    def test_detect_quote_intent_with_days_and_store(self):
        intent = detect_rental_intent("How much to rent a kayak for 3 days in Seattle?")
        assert intent is not None
        assert intent.action == "quote"
        assert intent.gear_type in ("paddling", "kayak")
        assert intent.days == 3
        assert intent.store == "Seattle"

    def test_detect_quote_week_duration(self):
        intent = detect_rental_intent("I want to rent camping gear for a week in Denver")
        assert intent is not None
        assert intent.action == "quote"
        assert intent.days == 7
        assert intent.gear_type in ("camping", "tent")
        assert intent.store == "Denver"

    def test_detect_quote_weekend(self):
        intent = detect_rental_intent("What is the cost of renting a backpack for the weekend?")
        assert intent is not None
        assert intent.action == "quote"
        assert intent.days == 2
        assert intent.gear_type in ("backpacking", "backpack")

    def test_detect_availability_intent(self):
        intent = detect_rental_intent("Customer asks about winter snowshoe rental availability in Portland")
        assert intent is not None
        assert intent.action == "availability"
        assert intent.gear_type in ("winter", "snowshoe")
        assert intent.store == "Portland"

    def test_detect_policy_intent(self):
        intent = detect_rental_intent("What is your rental deposit policy?")
        assert intent is not None
        assert intent.action == "policy"

    def test_detect_cancellation_policy_intent(self):
        intent = detect_rental_intent("What is the cancellation policy for gear rentals?")
        assert intent is not None
        assert intent.action == "policy"

    def test_detect_general_renting_inquiry(self):
        intent = detect_rental_intent("I am interested in renting outdoor gear")
        assert intent is not None
        assert intent.action == "packages"

    def test_detect_non_rental_queries(self):
        assert detect_rental_intent("Do you sell waterproof boots?") is None
        assert detect_rental_intent("Where is your Denver store located?") is None
        assert detect_rental_intent("What is your return policy?") is None
        assert detect_rental_intent("") is None
        assert detect_rental_intent("   ") is None


class TestBuildRentalPromptAndResponse:
    def test_build_rental_prompt_contains_key_elements(self):
        intent = RentalIntent(action="quote", gear_type="camping", days=4, store="Seattle")
        prompt = build_rental_prompt(intent)
        assert "Contoso Outdoors Official Gear Rental Guidance" in prompt
        assert "4-Person Deluxe Camping Package" in prompt
        assert "Seattle" in prompt
        assert "Discount" in prompt or "discount" in prompt
        assert "deposit" in prompt.lower()

    def test_format_rental_response_packages(self):
        intent = RentalIntent(action="packages")
        res = format_rental_response(intent)
        assert "answer" in res
        assert "rental_info" in res
        assert res["rental_info"]["action"] == "packages"
        assert len(res["rental_info"]["packages"]) == 4

    def test_format_rental_response_quote(self):
        intent = RentalIntent(action="quote", gear_type="camping", days=4, store="Seattle")
        res = format_rental_response(intent)
        assert "answer" in res
        assert "rental_info" in res
        assert res["rental_info"]["action"] == "quote"
        quote_info = res["rental_info"]["quote"]
        assert quote_info["subtotal"] == 162.0
        assert quote_info["discount_percent"] == 10.0
        assert quote_info["store"] == "Seattle"
        assert quote_info["store_available"] is True
        assert "10%" in res["answer"]
        assert "Seattle" in res["answer"]

    def test_format_rental_response_availability_negative(self):
        intent = RentalIntent(action="availability", gear_type="winter", store="Portland")
        res = format_rental_response(intent)
        assert "answer" in res
        assert "rental_info" in res
        assert res["rental_info"]["action"] == "availability"
        assert res["rental_info"]["store_available"] is False
        assert "Portland" in res["answer"]
        assert any(s in res["answer"] for s in ["Seattle", "Denver", "Salt Lake City"])

    def test_format_rental_response_policy(self):
        intent = RentalIntent(action="policy")
        res = format_rental_response(intent)
        assert "answer" in res
        assert "rental_info" in res
        assert res["rental_info"]["action"] == "policy"
        assert "deposit" in res["answer"].lower()
        assert "cancellation" in res["answer"].lower() or "cancel" in res["answer"].lower()
