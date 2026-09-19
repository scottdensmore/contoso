from contoso_chat.permits import (
    ParkPassInfo,
    PermitLotteryInfo,
    PermitRegulation,
    PermitsIntent,
    build_permits_prompt,
    detect_permits_intent,
    format_permits_response,
    get_park_passes,
    get_permit_lotteries,
    get_permit_regulations,
)


class TestPermitModels:
    def test_park_pass_info_model(self):
        pass_info = ParkPassInfo(
            pass_id="test-pass",
            name="Test Pass",
            price=50.0,
            duration="Annual",
            coverage="All Parks",
            features=["Feature 1", "Feature 2"],
            purchase_url="https://example.com/pass",
        )
        assert pass_info.pass_id == "test-pass"
        assert pass_info.price == 50.0
        assert len(pass_info.features) == 2
        assert pass_info.purchase_url == "https://example.com/pass"

    def test_permit_lottery_info_model(self):
        lottery = PermitLotteryInfo(
            lottery_id="test-lottery",
            park_name="Test Park",
            zone="Core Zone",
            lottery_window="Jan 1 - Feb 1",
            results_date="Feb 15",
            quota_season="May - Oct",
            fee_per_person=10.0,
            bear_canister_required=True,
            recreation_gov_url="https://recreation.gov/permits/123",
        )
        assert lottery.lottery_id == "test-lottery"
        assert lottery.bear_canister_required is True
        assert lottery.fee_per_person == 10.0

    def test_permit_regulation_model(self):
        reg = PermitRegulation(
            regulation_id="test-reg",
            category="bear_canister",
            park_or_region="High Sierra",
            rule_summary="Canisters required",
            details="Must carry approved bear canister",
        )
        assert reg.regulation_id == "test-reg"
        assert reg.category == "bear_canister"

    def test_permits_intent_model(self):
        intent = PermitsIntent(
            action="lotteries",
            destination="Mount Whitney",
            pass_type=None,
        )
        assert intent.action == "lotteries"
        assert intent.destination == "Mount Whitney"
        assert intent.pass_type is None


class TestPassCatalog:
    def test_get_all_passes(self):
        passes = get_park_passes()
        assert len(passes) >= 5
        pass_ids = {p.pass_id for p in passes}
        assert "america-the-beautiful" in pass_ids
        assert "senior-pass" in pass_ids
        assert "military-pass" in pass_ids
        assert "fourth-grade-pass" in pass_ids
        assert "northwest-forest-pass" in pass_ids

    def test_standard_pass_prices(self):
        passes = {p.pass_id: p for p in get_park_passes()}
        assert passes["america-the-beautiful"].price == 80.0
        assert passes["senior-pass"].price == 80.0
        assert passes["military-pass"].price == 0.0
        assert passes["fourth-grade-pass"].price == 0.0
        assert passes["northwest-forest-pass"].price == 30.0

    def test_filter_by_pass_type(self):
        senior = get_park_passes(pass_type="senior")
        assert len(senior) == 1
        assert senior[0].pass_id == "senior-pass"

        military = get_park_passes(pass_type="military")
        assert len(military) == 1
        assert military[0].pass_id == "military-pass"

        nw = get_park_passes(pass_type="northwest")
        assert len(nw) == 1
        assert nw[0].pass_id == "northwest-forest-pass"

    def test_passes_deep_copy(self):
        passes1 = get_park_passes()
        passes1[0].name = "Modified Name"
        passes2 = get_park_passes()
        assert passes2[0].name != "Modified Name"


class TestBackcountryLotteries:
    def test_get_all_lotteries(self):
        lotteries = get_permit_lotteries()
        assert len(lotteries) >= 5
        lottery_ids = {lottery.lottery_id for lottery in lotteries}
        assert "mount-whitney" in lottery_ids
        assert "the-enchantments" in lottery_ids
        assert "half-dome" in lottery_ids
        assert "wonderland-trail" in lottery_ids
        assert "grand-canyon-backcountry" in lottery_ids

    def test_whitney_and_enchantments_lottery_details(self):
        lotteries = {lottery.lottery_id: lottery for lottery in get_permit_lotteries()}
        whitney = lotteries["mount-whitney"]
        assert "Inyo" in whitney.park_name
        assert whitney.bear_canister_required is True
        assert whitney.fee_per_person > 0
        assert "February" in whitney.lottery_window
        assert whitney.recreation_gov_url is not None

        enchantments = lotteries["the-enchantments"]
        assert "Enchantment" in enchantments.park_name or "Okanogan" in enchantments.park_name
        assert enchantments.bear_canister_required is True
        assert "February" in enchantments.lottery_window
        assert enchantments.recreation_gov_url is not None

    def test_filter_by_park_name(self):
        whitney = get_permit_lotteries(park_name="Whitney")
        assert len(whitney) == 1
        assert whitney[0].lottery_id == "mount-whitney"

        half_dome = get_permit_lotteries(park_name="Half Dome")
        assert len(half_dome) == 1
        assert half_dome[0].lottery_id == "half-dome"

        rainier = get_permit_lotteries(park_name="Rainier")
        assert len(rainier) == 1
        assert rainier[0].lottery_id == "wonderland-trail"


class TestPermitRegulations:
    def test_get_all_regulations(self):
        regulations = get_permit_regulations()
        assert len(regulations) >= 4
        categories = {r.category for r in regulations}
        assert "bear_canister" in categories
        assert any("campfire" in c for c in categories)
        assert any("waste" in c or "wag" in c for c in categories)
        assert any("group" in c for c in categories)

    def test_bear_canister_regulation(self):
        regs = get_permit_regulations(park_or_region="Sierra")
        assert any(r.category == "bear_canister" for r in regs)

    def test_wag_bag_packout_regulation(self):
        regs = get_permit_regulations(park_or_region="Whitney")
        assert any("wag" in r.rule_summary.lower() or "waste" in r.rule_summary.lower() for r in regs)

    def test_campfire_ban_elevation_regulation(self):
        regs = get_permit_regulations()
        campfire_reg = next(r for r in regs if "campfire" in r.category.lower())
        assert "9,600" in campfire_reg.rule_summary or "9,600" in campfire_reg.details

    def test_group_limit_regulation(self):
        regs = get_permit_regulations()
        group_reg = next(r for r in regs if "group" in r.category.lower())
        assert "8" in group_reg.rule_summary or "12" in group_reg.rule_summary


class TestDetectPermitsIntent:
    def test_detect_passes_intent(self):
        intent = detect_permits_intent("Which park pass covers Rainier and Olympic National Parks?")
        assert intent is not None
        assert intent.action in ["passes", "recommend"]
        assert intent.destination is not None
        assert "Rainier" in intent.destination or "Olympic" in intent.destination

        intent2 = detect_permits_intent("How much does America the Beautiful pass cost?")
        assert intent2 is not None
        assert intent2.action == "passes"

        intent3 = detect_permits_intent("Do you have senior passes or military pass?")
        assert intent3 is not None
        assert intent3.action == "passes"

    def test_detect_lotteries_intent(self):
        intent = detect_permits_intent("Do I need a permit for Mount Whitney or Enchantments?")
        assert intent is not None
        assert intent.action == "lotteries"
        assert "Whitney" in (intent.destination or "") or "Enchantments" in (intent.destination or "")

        intent2 = detect_permits_intent("When is the Half Dome permit lottery deadline?")
        assert intent2 is not None
        assert intent2.action == "lotteries"

        intent3 = detect_permits_intent("Wonderland Trail backcountry permit application")
        assert intent3 is not None
        assert intent3.action == "lotteries"

    def test_detect_regulations_intent(self):
        intent = detect_permits_intent("What are the bear canister rules in High Sierra?")
        assert intent is not None
        assert intent.action == "regulations"

        intent2 = detect_permits_intent("Can I have a campfire above 10,000 feet?")
        assert intent2 is not None
        assert intent2.action == "regulations"

        intent3 = detect_permits_intent("Are WAG bags required on Mount Whitney?")
        assert intent3 is not None
        assert intent3.action == "regulations"

        intent4 = detect_permits_intent("What is the maximum group size for backpacking permits?")
        assert intent4 is not None
        assert intent4.action == "regulations"

    def test_detect_recommend_intent(self):
        intent = detect_permits_intent("Which park pass do you recommend for visiting several national parks?")
        assert intent is not None
        assert intent.action in ["recommend", "passes"]

    def test_ignore_unrelated_queries(self):
        assert detect_permits_intent("Where is my order #12345?") is None
        assert detect_permits_intent("What are your store hours in Seattle?") is None
        assert detect_permits_intent("How do I return my waterproof jacket?") is None
        assert detect_permits_intent("") is None
        assert detect_permits_intent("   ") is None


class TestBuildPermitsPromptAndFormatting:
    def test_build_permits_prompt(self):
        intent = PermitsIntent(action="lotteries", destination="Mount Whitney")
        prompt = build_permits_prompt(intent)
        assert "Mount Whitney" in prompt
        assert "Recreation.gov" in prompt or "recreation.gov" in prompt.lower()
        assert "bear canister" in prompt.lower()

    def test_format_permits_response_lotteries(self):
        intent = PermitsIntent(action="lotteries", destination="Mount Whitney or Enchantments")
        resp = format_permits_response(intent)
        assert "answer" in resp
        assert "permits_info" in resp
        info = resp["permits_info"]
        assert info["action"] == "lotteries"
        assert len(info["lotteries"]) >= 2
        answer = resp["answer"]
        assert "Whitney" in answer
        assert "Enchantment" in answer
        assert "permit" in answer.lower() or "lottery" in answer.lower()
        assert "bear canister" in answer.lower()

    def test_format_permits_response_passes(self):
        intent = PermitsIntent(action="passes", destination="Rainier and Olympic")
        resp = format_permits_response(intent)
        assert "answer" in resp
        assert "permits_info" in resp
        info = resp["permits_info"]
        assert info["action"] == "passes"
        assert len(info["passes"]) >= 1
        answer = resp["answer"]
        assert "America the Beautiful" in answer
        assert "$80" in answer

    def test_format_permits_response_regulations(self):
        intent = PermitsIntent(action="regulations", destination="High Sierra")
        resp = format_permits_response(intent)
        assert "answer" in resp
        assert "permits_info" in resp
        info = resp["permits_info"]
        assert info["action"] == "regulations"
        assert len(info["regulations"]) >= 1
        answer = resp["answer"]
        assert "bear canister" in answer.lower() or "campfire" in answer.lower()
