import pytest
from contoso_chat.stores import (
    STORE_CATALOG,
    build_store_prompt,
    detect_store_intent,
    get_all_stores,
    get_store_by_id,
    search_stores,
)


class TestStoreCatalog:
    """Tests for the store catalog data and retrieval functions."""

    def test_catalog_contains_expected_stores(self):
        """Catalog should contain exactly the 5 retail stores in Contoso Outdoors network."""
        expected_ids = {"seattle", "denver", "portland", "salt-lake-city", "san-francisco"}
        assert set(STORE_CATALOG.keys()) == expected_ids

    def test_get_all_stores_returns_all_stores(self):
        """get_all_stores returns list of 5 store dictionaries."""
        stores = get_all_stores()
        assert isinstance(stores, list)
        assert len(stores) == 5
        ids = {s["id"] for s in stores}
        assert ids == {"seattle", "denver", "portland", "salt-lake-city", "san-francisco"}

    def test_store_structure(self):
        """Every store has required fields: id, name, address, city, state, zip, phone, hours, services."""
        stores = get_all_stores()
        for store in stores:
            assert isinstance(store["id"], str) and store["id"]
            assert isinstance(store["name"], str) and store["name"]
            assert isinstance(store["address"], str) and store["address"]
            assert isinstance(store["city"], str) and store["city"]
            assert isinstance(store["state"], str) and store["state"]
            assert isinstance(store["zip"], str) and store["zip"]
            assert isinstance(store["phone"], str) and store["phone"]
            assert isinstance(store["hours"], dict)
            assert "weekday" in store["hours"]
            assert "saturday" in store["hours"]
            assert "sunday" in store["hours"]
            assert isinstance(store["services"], list)
            assert "in-store pickup" in [s.lower() for s in store["services"]]
            assert "gear rental" in [s.lower() for s in store["services"]]

    def test_get_all_stores_returns_copies(self):
        """Mutating returned stores does not mutate internal catalog."""
        stores1 = get_all_stores()
        stores1[0]["custom_field"] = "mutated"
        stores2 = get_all_stores()
        assert "custom_field" not in stores2[0]

    def test_get_store_by_id_found(self):
        """Lookup by store_id returns store dict (case-insensitive)."""
        denver = get_store_by_id("denver")
        assert denver is not None
        assert denver["name"] == "Denver Mountain Outpost"
        assert denver["city"] == "Denver"
        assert denver["state"] == "CO"

        # Case-insensitivity & whitespace trimming
        seattle = get_store_by_id("  SEATTLE  ")
        assert seattle is not None
        assert seattle["name"] == "Seattle Flagship"

    def test_get_store_by_id_not_found(self):
        """Lookup with unknown or invalid store_id returns None."""
        assert get_store_by_id("non-existent") is None
        assert get_store_by_id("") is None
        assert get_store_by_id(None) is None  # type: ignore[arg-type]


class TestSearchStores:
    """Tests for searching stores by text query and pickup filter."""

    def test_search_by_city(self):
        """Searching by city name matches relevant store."""
        results = search_stores("Seattle")
        assert len(results) == 1
        assert results[0]["id"] == "seattle"

    def test_search_by_state_code(self):
        """Searching by state abbreviation matches store."""
        results = search_stores("CO")
        assert len(results) == 1
        assert results[0]["id"] == "denver"

    def test_search_by_full_state_name(self):
        """Searching by state full name matches store."""
        results_or = search_stores("Oregon")
        assert len(results_or) == 1
        assert results_or[0]["id"] == "portland"

        results_wa = search_stores("Washington")
        assert len(results_wa) == 1
        assert results_wa[0]["id"] == "seattle"

    def test_search_by_store_name(self):
        """Searching by name matches store."""
        results = search_stores("Basecamp")
        assert len(results) == 1
        assert results[0]["id"] == "salt-lake-city"

    def test_search_filter_has_pickup(self):
        """Filtering with has_pickup=True returns stores with in-store pickup."""
        results = search_stores("portland", has_pickup=True)
        assert len(results) == 1
        assert results[0]["id"] == "portland"

    def test_search_no_match(self):
        """Searching for non-matching location returns empty list."""
        results = search_stores("Miami")
        assert results == []

    def test_search_empty_query_returns_all(self):
        """Empty query returns all stores."""
        results = search_stores("")
        assert len(results) == 5


class TestDetectStoreIntent:
    """Tests for detecting store hours, location, pickup, and city intent."""

    @pytest.mark.parametrize(
        "query,expected_type,expected_store_id",
        [
            ("What are your store hours?", "hours", None),
            ("what time do you open?", "hours", None),
            ("what is your closing time on sunday?", "hours", None),
            ("hours on sunday in seattle", "hours", "seattle"),
            ("What time does the Denver store close on Saturday?", "hours", "denver"),
            ("open today in Portland", "hours", "portland"),
            ("when do you open on weekdays in salt lake?", "hours", "salt-lake-city"),
        ],
    )
    def test_detect_hours_intent(self, query: str, expected_type: str, expected_store_id: str | None):
        res = detect_store_intent(query)
        assert res["is_store_query"] is True
        assert res["intent_type"] == expected_type
        assert res["confidence"] > 0.0
        if expected_store_id:
            store_ids = [s["id"] for s in res["matched_stores"]]
            assert expected_store_id in store_ids

    @pytest.mark.parametrize(
        "query,expected_type,expected_store_id",
        [
            ("where is your store?", "location", None),
            ("nearest store to me", "location", None),
            ("where are your retail stores?", "location", None),
            ("retail store in San Francisco", "location", "san-francisco"),
            ("locations in washington", "location", "seattle"),
            ("stores in colorado", "location", "denver"),
            ("find a store in Utah", "location", "salt-lake-city"),
        ],
    )
    def test_detect_location_intent(self, query: str, expected_type: str, expected_store_id: str | None):
        res = detect_store_intent(query)
        assert res["is_store_query"] is True
        assert res["intent_type"] == expected_type
        assert res["confidence"] > 0.0
        if expected_store_id:
            store_ids = [s["id"] for s in res["matched_stores"]]
            assert expected_store_id in store_ids

    @pytest.mark.parametrize(
        "query,expected_type,expected_store_id",
        [
            ("do you offer in-store pickup?", "pickup", None),
            ("can I do curbside pickup in Denver?", "pickup", "denver"),
            ("pick up at store in Seattle", "pickup", "seattle"),
            ("Do you have stores in Oregon with in-store pickup?", "pickup", "portland"),
        ],
    )
    def test_detect_pickup_intent(self, query: str, expected_type: str, expected_store_id: str | None):
        res = detect_store_intent(query)
        assert res["is_store_query"] is True
        assert res["intent_type"] == expected_type
        assert res["confidence"] > 0.0
        if expected_store_id:
            store_ids = [s["id"] for s in res["matched_stores"]]
            assert expected_store_id in store_ids

    def test_detect_city_mention_defaults_to_general_if_no_other_keyword(self):
        """Query mentioning store city should be recognized as store query."""
        res = detect_store_intent("Tell me about Seattle retail store")
        assert res["is_store_query"] is True
        assert len(res["matched_stores"]) >= 1
        assert res["matched_stores"][0]["id"] == "seattle"

    @pytest.mark.parametrize(
        "query",
        [
            "What tents do you recommend for backpacking?",
            "Can you help me return my order CTSO-12345?",
            "Do you sell waterproof hiking boots?",
            "What is your price match policy?",
            "",
            "   ",
        ],
    )
    def test_detect_non_store_queries(self, query: str):
        res = detect_store_intent(query)
        assert res["is_store_query"] is False
        assert res["confidence"] == 0.0
        assert res["matched_stores"] == []

    def test_detect_invalid_input(self):
        res = detect_store_intent(None)  # type: ignore[arg-type]
        assert res["is_store_query"] is False
        assert res["confidence"] == 0.0
        assert res["matched_stores"] == []


class TestBuildStorePrompt:
    """Tests for LLM store prompt formatting."""

    def test_build_store_prompt_contains_details(self):
        denver = get_store_by_id("denver")
        assert denver is not None
        prompt = build_store_prompt([denver], intent_type="hours")

        assert "Denver Mountain Outpost" in prompt
        assert denver["address"] in prompt
        assert denver["phone"] in prompt
        assert denver["hours"]["saturday"] in prompt
        assert "Instructions for Assistant:" in prompt

    def test_build_store_prompt_empty_stores(self):
        prompt = build_store_prompt([], intent_type="location")
        assert "Store Locations & Hours Grounding:" in prompt
