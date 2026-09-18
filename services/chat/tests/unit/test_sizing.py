import pytest
from contoso_chat.sizing import (
    CategorySizeGuide,
    SizeRecommendation,
    SizingRow,
    build_sizing_prompt,
    detect_sizing_intent,
    get_size_guide,
    recommend_size,
)


class TestSizingModels:
    def test_sizing_row_model(self):
        row = SizingRow(
            size="M",
            measurements={"chest_in": "39-41", "chest_cm": "99-104"},
            fit_notes="Standard athletic fit",
        )
        assert row.size == "M"
        assert row.measurements["chest_in"] == "39-41"
        assert row.fit_notes == "Standard athletic fit"

    def test_category_size_guide_model(self):
        guide = CategorySizeGuide(
            category="jackets",
            title="Jackets Sizing Guide",
            description="Outerwear fit chart",
            measurement_instructions="Measure around fullest chest part.",
            rows=[
                SizingRow(size="S", measurements={"chest_in": "36-38"}),
                SizingRow(size="M", measurements={"chest_in": "39-41"}),
            ],
        )
        assert guide.category == "jackets"
        assert len(guide.rows) == 2
        assert guide.rows[0].size == "S"

    def test_size_recommendation_model(self):
        rec = SizeRecommendation(
            category="jackets",
            recommended_size="M",
            advice="Size M fits 39-41 chest.",
            measurement_input=40.0,
            unit="in",
        )
        assert rec.recommended_size == "M"
        assert rec.measurement_input == 40.0
        assert rec.unit == "in"


class TestCatalogLookup:
    def test_get_jackets_guide(self):
        guide = get_size_guide("jackets")
        assert guide is not None
        assert guide.category in ("jackets", "apparel")
        sizes = [r.size for r in guide.rows]
        assert "XS" in sizes
        assert "S" in sizes
        assert "M" in sizes
        assert "L" in sizes
        assert "XL" in sizes
        assert "XXL" in sizes

        # Check chest and waist in inches and cm
        m_row = next(r for r in guide.rows if r.size == "M")
        assert "chest_in" in m_row.measurements
        assert "chest_cm" in m_row.measurements
        assert "waist_in" in m_row.measurements
        assert "waist_cm" in m_row.measurements

    def test_get_apparel_alias(self):
        guide = get_size_guide("apparel")
        assert guide is not None
        sizes = [r.size for r in guide.rows]
        assert "M" in sizes

    def test_get_footwear_guide(self):
        guide = get_size_guide("footwear")
        assert guide is not None
        assert guide.category in ("footwear", "boots")
        # US sizes 7 to 13
        sizes = [r.size for r in guide.rows]
        assert any("7" in s for s in sizes)
        assert any("10" in s for s in sizes)
        assert any("13" in s for s in sizes)

        # Check US / EU conversions and foot lengths
        row = guide.rows[0]
        assert "us" in row.measurements or "size" in row.measurements or "eu" in row.measurements
        assert any("eu" in r.measurements for r in guide.rows)
        assert any("foot_length_in" in r.measurements or "foot_length_cm" in r.measurements for r in guide.rows)

    def test_get_boots_alias(self):
        guide = get_size_guide("boots")
        assert guide is not None
        assert guide.category in ("footwear", "boots")

    def test_get_tents_guide(self):
        guide = get_size_guide("tents")
        assert guide is not None
        assert guide.category in ("tents", "tent")
        sizes = [r.size for r in guide.rows]
        # 2, 3, 4, 6 person capacities
        assert any("2" in s for s in sizes)
        assert any("3" in s for s in sizes)
        assert any("4" in s for s in sizes)
        assert any("6" in s for s in sizes)
        for r in guide.rows:
            assert "floor_dimensions" in r.measurements
            assert "floor_area" in r.measurements

    def test_get_tent_alias(self):
        guide = get_size_guide("tent")
        assert guide is not None

    def test_get_backpacks_guide(self):
        guide = get_size_guide("backpacks")
        assert guide is not None
        assert guide.category in ("backpacks", "backpack")
        sizes = [r.size for r in guide.rows]
        assert "S/M" in sizes
        assert "M/L" in sizes
        assert "L/XL" in sizes
        for r in guide.rows:
            assert "torso_range_in" in r.measurements or "torso_in" in r.measurements

    def test_get_backpack_alias(self):
        guide = get_size_guide("backpack")
        assert guide is not None

    def test_get_unknown_category_returns_none(self):
        assert get_size_guide("snowboards") is None
        assert get_size_guide("") is None
        assert get_size_guide(None) is None  # type: ignore


class TestRecommendSize:
    def test_recommend_jacket_size_inches(self):
        rec = recommend_size("jackets", 40.0, "in")
        assert rec is not None
        assert rec.recommended_size == "M"
        assert rec.category in ("jackets", "apparel")
        assert "40" in rec.advice or "M" in rec.advice

    def test_recommend_jacket_size_cm(self):
        rec = recommend_size("jackets", 102.0, "cm")
        assert rec is not None
        assert rec.recommended_size == "M"

    def test_recommend_jacket_size_xs(self):
        rec = recommend_size("jackets", 34.0, "in")
        assert rec is not None
        assert rec.recommended_size == "XS"

    def test_recommend_jacket_size_xxl(self):
        rec = recommend_size("jackets", 51.0, "in")
        assert rec is not None
        assert rec.recommended_size == "XXL"

    def test_recommend_footwear_size(self):
        rec = recommend_size("footwear", 10.6, "in")
        assert rec is not None
        assert "9" in rec.recommended_size

    def test_recommend_footwear_cm(self):
        rec = recommend_size("footwear", 27.0, "cm")
        assert rec is not None
        assert "9" in rec.recommended_size

    def test_recommend_backpack_size(self):
        rec_sm = recommend_size("backpacks", 17.0, "in")
        assert rec_sm is not None
        assert rec_sm.recommended_size == "S/M"

        rec_ml = recommend_size("backpacks", 19.5, "in")
        assert rec_ml is not None
        assert rec_ml.recommended_size == "M/L"

        rec_lxl = recommend_size("backpacks", 22.5, "in")
        assert rec_lxl is not None
        assert rec_lxl.recommended_size == "L/XL"

    def test_recommend_tent_size(self):
        rec = recommend_size("tents", 4.0, "person")
        assert rec is not None
        assert "4" in rec.recommended_size

    def test_recommend_invalid_category(self):
        assert recommend_size("unknown_category", 40.0) is None

    def test_recommend_invalid_measurement(self):
        assert recommend_size("jackets", 0.0) is None
        assert recommend_size("jackets", -10.0) is None


class TestDetectSizingIntent:
    @pytest.mark.parametrize(
        "query, expected_category, expected_has_rec",
        [
            ("What size jacket should I get for a 40 inch chest?", "jackets", True),
            ("Sizing guide for outdoor jackets", "jackets", False),
            ("How does it fit?", None, False),
            ("Can I see your size chart for footwear?", "footwear", False),
            ("Do your boots run small or run large?", "footwear", False),
            ("What tent capacity should I look for with 4 people?", "tents", True),
            ("What is my shoe size for a 10.6 inch foot?", "footwear", True),
            ("My chest measurement is 42 inches, what size should I order?", "jackets", True),
            ("My torso length is 19 inches, which backpack size?", "backpacks", True),
            ("Does the hiking boot fit true to size?", "footwear", False),
        ],
    )
    def test_sizing_intent_queries(self, query, expected_category, expected_has_rec):
        result = detect_sizing_intent(query)
        assert result["is_sizing_intent"] is True
        if expected_category:
            assert result["category"] == expected_category
            assert result["size_guide"] is not None
        if expected_has_rec:
            assert result["recommendation"] is not None

    @pytest.mark.parametrize(
        "query",
        [
            "Where is my package CTSO-12345?",
            "What is your 30-day return policy?",
            "Do you have a store in Seattle?",
            "Tell me about camping sleeping bags",
            "",
            "   ",
        ],
    )
    def test_non_sizing_queries(self, query):
        result = detect_sizing_intent(query)
        assert result["is_sizing_intent"] is False
        assert result["category"] is None
        assert result["size_guide"] is None
        assert result["recommendation"] is None

    def test_invalid_types(self):
        assert detect_sizing_intent(None)["is_sizing_intent"] is False  # type: ignore
        assert detect_sizing_intent(12345)["is_sizing_intent"] is False  # type: ignore


class TestBuildSizingPrompt:
    def test_build_prompt_with_guide_and_recommendation(self):
        guide = get_size_guide("jackets")
        rec = recommend_size("jackets", 40.0, "in")
        prompt = build_sizing_prompt(guide, rec, "What size jacket for a 40 inch chest?")
        assert prompt != ""
        assert "Sizing" in prompt
        assert "Chest" in prompt or "chest" in prompt
        assert "Recommended Size: M" in prompt or "size M" in prompt.lower()
        assert "Instructions" in prompt or "Assistant" in prompt

    def test_build_prompt_with_only_guide(self):
        guide = get_size_guide("footwear")
        prompt = build_sizing_prompt(guide, None, "What shoe sizes do you carry?")
        assert prompt != ""
        assert "Footwear" in prompt or "Boots" in prompt

    def test_build_prompt_empty(self):
        assert build_sizing_prompt(None, None, "Hello") == ""


class TestSizingBranches:
    def test_jacket_cm_all_branches(self):
        assert recommend_size("jackets", 85.0, "cm").recommended_size == "XS"
        assert recommend_size("jackets", 95.0, "cm").recommended_size == "S"
        assert recommend_size("jackets", 102.0, "cm").recommended_size == "M"
        assert recommend_size("jackets", 110.0, "cm").recommended_size == "L"
        assert recommend_size("jackets", 118.0, "cm").recommended_size == "XL"
        assert recommend_size("jackets", 128.0, "cm").recommended_size == "XXL"

    def test_jacket_inches_branches(self):
        assert recommend_size("jackets", 37.0, "in").recommended_size == "S"
        assert recommend_size("jackets", 43.0, "in").recommended_size == "L"
        assert recommend_size("jackets", 46.0, "in").recommended_size == "XL"

    def test_footwear_us_unit(self):
        rec = recommend_size("footwear", 10.5, "us")
        assert rec is not None
        assert rec.recommended_size == "US 10.5"

    def test_backpack_cm_branches(self):
        assert recommend_size("backpacks", 42.0, "cm").recommended_size == "S/M"
        assert recommend_size("backpacks", 50.0, "cm").recommended_size == "M/L"
        assert recommend_size("backpacks", 58.0, "cm").recommended_size == "L/XL"

    def test_tent_capacity_branches(self):
        rec_1 = recommend_size("tents", 1.0, "person")
        assert rec_1.recommended_size == "2-Person"
        assert "1 camper" in rec_1.advice

        rec_3 = recommend_size("tents", 3.0, "person")
        assert rec_3.recommended_size == "3-Person"

        rec_6 = recommend_size("tents", 6.0, "person")
        assert rec_6.recommended_size == "6-Person"

    def test_detect_sizing_tent_campers_without_explicit_tent_keyword(self):
        res = detect_sizing_intent("What size for 4 campers?")
        assert res["is_sizing_intent"] is True
        assert res["category"] == "tents"
        assert res["recommendation"] is not None

    def test_detect_sizing_explicit_pattern(self):
        res = detect_sizing_intent("What size should I get if my chest measurement is 42?")
        assert res["is_sizing_intent"] is True
        assert res["category"] == "jackets"
        assert res["recommendation"] is not None
