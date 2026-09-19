from contoso_chat.repair import (
    RepairDiagnosis,
    RepairIntent,
    build_repair_prompt,
    detect_repair_intent,
    diagnose_repair_issue,
    format_repair_response,
    get_repair_services,
)


class TestRepairCatalog:
    def test_get_repair_services_all(self):
        services = get_repair_services()
        assert len(services) == 12
        categories = {s.category for s in services}
        assert categories == {'tents', 'apparel', 'packs', 'winter'}

    def test_get_repair_services_by_category(self):
        tents = get_repair_services('tents')
        assert len(tents) == 4
        assert all(s.category == 'tents' for s in tents)

        apparel = get_repair_services('apparel')
        assert len(apparel) == 3
        assert all(s.category == 'apparel' for s in apparel)

        packs = get_repair_services('packs')
        assert len(packs) == 3
        assert all(s.category == 'packs' for s in packs)

        winter = get_repair_services('winter')
        assert len(winter) == 2
        assert all(s.category == 'winter' for s in winter)

    def test_get_repair_services_by_alias(self):
        tents = get_repair_services('tent')
        assert len(tents) == 4

        winter = get_repair_services('snowboard')
        assert len(winter) == 2

        packs = get_repair_services('backpack')
        assert len(packs) == 3

    def test_get_repair_services_unknown_category(self):
        unknown = get_repair_services('kayaks')
        assert unknown == []


class TestDiagnoseRepairIssue:
    def test_diagnose_tent_zipper(self):
        diagnosis = diagnose_repair_issue('broken zipper on tent', 'tent')
        assert isinstance(diagnosis, RepairDiagnosis)
        assert diagnosis.diagnosed_service is not None
        assert diagnosis.diagnosed_service.service_id == 'tent-zipper-slider'
        assert diagnosis.estimated_cost == 25.0
        assert diagnosis.turnaround_days == 3
        assert diagnosis.is_covered_by_warranty is False
        assert 'zipper' in diagnosis.recommendation.lower()
        assert diagnosis.self_care_tip is not None

    def test_diagnose_tent_seam_sealing(self):
        diagnosis = diagnose_repair_issue('water leaking through tent seams', 'tent')
        assert diagnosis.diagnosed_service is not None
        assert diagnosis.diagnosed_service.service_id == 'tent-seam-sealing'
        assert diagnosis.estimated_cost == 35.0
        assert diagnosis.turnaround_days == 4

    def test_diagnose_tent_fabric_patching(self):
        diagnosis = diagnose_repair_issue('rip in tent rainfly fabric', 'tents')
        assert diagnosis.diagnosed_service is not None
        assert diagnosis.diagnosed_service.service_id == 'tent-fabric-patch'
        assert diagnosis.estimated_cost == 30.0
        assert diagnosis.turnaround_days == 4

    def test_diagnose_tent_pole_restringing(self):
        diagnosis = diagnose_repair_issue('broken shock cord on tent pole', 'tent')
        assert diagnosis.diagnosed_service is not None
        assert diagnosis.diagnosed_service.service_id == 'tent-pole-restringing'
        assert diagnosis.estimated_cost == 20.0
        assert diagnosis.turnaround_days == 2

    def test_diagnose_apparel_dwr(self):
        diagnosis = diagnose_repair_issue(
            'My rain jacket is wetting out, can you reproof the DWR waterproofing?', 'apparel'
        )
        assert diagnosis.diagnosed_service is not None
        assert diagnosis.diagnosed_service.service_id == 'apparel-dwr-reproofing'
        assert diagnosis.estimated_cost == 30.0
        assert diagnosis.turnaround_days == 3
        assert 'dwr' in diagnosis.recommendation.lower()

    def test_diagnose_apparel_down_baffle(self):
        diagnosis = diagnose_repair_issue('down jacket leaking feathers from baffle', 'apparel')
        assert diagnosis.diagnosed_service is not None
        assert diagnosis.diagnosed_service.service_id == 'apparel-down-baffle'
        assert diagnosis.estimated_cost == 40.0
        assert diagnosis.turnaround_days == 5

    def test_diagnose_apparel_jacket_zipper(self):
        diagnosis = diagnose_repair_issue('jacket zipper is stuck and teeth separated', 'apparel')
        assert diagnosis.diagnosed_service is not None
        assert diagnosis.diagnosed_service.service_id == 'apparel-jacket-zipper'
        assert diagnosis.estimated_cost == 35.0
        assert diagnosis.turnaround_days == 4

    def test_diagnose_pack_zipper(self):
        diagnosis = diagnose_repair_issue('broken heavy-duty zipper on backpack', 'packs')
        assert diagnosis.diagnosed_service is not None
        assert diagnosis.diagnosed_service.service_id == 'pack-zipper-repair'
        assert diagnosis.estimated_cost == 25.0
        assert diagnosis.turnaround_days == 4

    def test_diagnose_pack_buckle(self):
        diagnosis = diagnose_repair_issue('cracked hipbelt buckle replacement', 'pack')
        assert diagnosis.diagnosed_service is not None
        assert diagnosis.diagnosed_service.service_id == 'pack-buckle-replacement'
        assert diagnosis.estimated_cost == 15.0
        assert diagnosis.turnaround_days == 2

    def test_diagnose_pack_frame(self):
        diagnosis = diagnose_repair_issue('bent aluminum frame stay on backpack', 'packs')
        assert diagnosis.diagnosed_service is not None
        assert diagnosis.diagnosed_service.service_id == 'pack-frame-repair'
        assert diagnosis.estimated_cost == 30.0
        assert diagnosis.turnaround_days == 3

    def test_diagnose_winter_edge_wax(self):
        diagnosis = diagnose_repair_issue('How much to sharpen and wax my snowboard?', 'winter')
        assert diagnosis.diagnosed_service is not None
        assert diagnosis.diagnosed_service.service_id == 'winter-edge-wax'
        assert diagnosis.estimated_cost == 45.0
        assert diagnosis.turnaround_days == 2

    def test_diagnose_winter_ptex(self):
        diagnosis = diagnose_repair_issue('deep rock gouge core shot p-tex base weld', 'winter')
        assert diagnosis.diagnosed_service is not None
        assert diagnosis.diagnosed_service.service_id == 'winter-ptex-weld'
        assert diagnosis.estimated_cost == 50.0
        assert diagnosis.turnaround_days == 4

    def test_diagnose_unrecognized_issue(self):
        diagnosis = diagnose_repair_issue('completely destroyed by aliens', None)
        assert diagnosis.diagnosed_service is None
        assert diagnosis.estimated_cost == 0.0
        assert diagnosis.turnaround_days == 0
        assert 'assessment' in diagnosis.recommendation.lower()


class TestDetectRepairIntent:
    def test_detect_services_intent(self):
        intent = detect_repair_intent('What gear repair services and rates do you offer?')
        assert intent is not None
        assert intent.action == 'services'

    def test_detect_diagnose_tent_zipper(self):
        intent = detect_repair_intent('I have a broken zipper on tent, can you fix it?')
        assert intent is not None
        assert intent.action == 'diagnose'
        assert intent.gear_type in ['tents', 'tent']

    def test_detect_diagnose_jacket_dwr(self):
        intent = detect_repair_intent('My rain jacket is wetting out, can you reproof the DWR waterproofing?')
        assert intent is not None
        assert intent.action == 'diagnose'
        assert intent.gear_type in ['apparel', 'jacket']

    def test_detect_diagnose_snowboard_wax(self):
        intent = detect_repair_intent('How much to sharpen and wax my snowboard?')
        assert intent is not None
        assert intent.action == 'diagnose'
        assert intent.gear_type in ['winter', 'snowboard']

    def test_detect_warranty_intent(self):
        intent = detect_repair_intent('Is gear repair covered under warranty?')
        assert intent is not None
        assert intent.action == 'warranty'

    def test_detect_care_tips_intent(self):
        intent = detect_repair_intent('What are care tips and maintenance for down jackets?')
        assert intent is not None
        assert intent.action == 'care_tips'

    def test_detect_non_repair_queries(self):
        assert detect_repair_intent('What is your return policy?') is None
        assert detect_repair_intent('Where is my order CTSO-12345?') is None
        assert detect_repair_intent('What tents do you recommend for backpacking?') is None
        assert detect_repair_intent('Hello!') is None
        assert detect_repair_intent('') is None


class TestPromptBuilderAndResponseFormat:
    def test_build_repair_prompt(self):
        intent = RepairIntent(action='diagnose', gear_type='tents', issue='broken zipper on tent')
        prompt = build_repair_prompt(intent)
        assert 'Contoso Outdoors Official Gear Repair' in prompt
        assert 'Tent Zipper Slider Replacement' in prompt
        assert '5.00' in prompt

    def test_format_repair_response_diagnose(self):
        intent = RepairIntent(
            action='diagnose',
            gear_type='tents',
            issue='broken zipper on tent',
        )
        formatted = format_repair_response(intent)
        assert 'answer' in formatted
        assert 'repair_info' in formatted
        assert formatted['repair_info']['action'] == 'diagnose'
        assert formatted['repair_info']['diagnosis']['diagnosed_service']['service_id'] == 'tent-zipper-slider'
        assert '5' in formatted['answer']

    def test_format_repair_response_services(self):
        intent = RepairIntent(action='services')
        formatted = format_repair_response(intent)
        assert 'answer' in formatted
        assert 'repair_info' in formatted
        assert formatted['repair_info']['action'] == 'services'
        assert len(formatted['repair_info']['services']) == 12

    def test_format_repair_response_warranty(self):
        intent = RepairIntent(action='warranty')
        formatted = format_repair_response(intent)
        assert 'answer' in formatted
        assert 'repair_info' in formatted
        assert formatted['repair_info']['action'] == 'warranty'
        assert 'warranty' in formatted['answer'].lower()

    def test_format_repair_response_care_tips(self):
        intent = RepairIntent(action='care_tips', gear_type='apparel')
        formatted = format_repair_response(intent)
        assert 'answer' in formatted
        assert 'repair_info' in formatted
        assert formatted['repair_info']['action'] == 'care_tips'
        assert 'care_tips' in formatted['repair_info']
