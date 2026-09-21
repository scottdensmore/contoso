import { describe, it, expect } from 'vitest';
import {
  getCavingRoutes,
  getCavingRouteById,
  getCavingGear,
  calculateSrtRiggingPlan,
  type SrtRiggingQuery,
} from './caving';

describe('Alpine Caving & Speleology Domain Logic', () => {
  describe('Caving Routes Catalog', () => {
    it('returns all 5 iconic caving systems', () => {
      const routes = getCavingRoutes();
      expect(routes).toHaveLength(5);

      const ids = routes.map((r) => r.id);
      expect(ids).toContain('fantastic-pit-ellisons-cave');
      expect(ids).toContain('mammoth-cave-historic-dallons');
      expect(ids).toContain('leprechaun-cave-bighorns');
      expect(ids).toContain('carlsbad-caverns-slaughter-canyon');
      expect(ids).toContain('tumbling-rock-cave-passages');
    });

    it('filters caves by CaveClass', () => {
      const class4 = getCavingRoutes('class_4_vertical_srt');
      expect(class4).toHaveLength(1);
      expect(class4[0].id).toBe('fantastic-pit-ellisons-cave');
      expect(class4[0].deepestPitchM).toBe(179);

      const class1 = getCavingRoutes('class_1_horizontal_walk');
      expect(class1).toHaveLength(1);
      expect(class1[0].id).toBe('mammoth-cave-historic-dallons');
      expect(class1[0].totalLengthM).toBe(680000);

      const class5 = getCavingRoutes('class_5_complex_alpine');
      expect(class5).toHaveLength(1);
      expect(class5[0].id).toBe('leprechaun-cave-bighorns');
      expect(class5[0].depthM).toBe(410);

      const class2 = getCavingRoutes('class_2_scramble_crawl');
      expect(class2).toHaveLength(1);
      expect(class2[0].id).toBe('carlsbad-caverns-slaughter-canyon');

      const class3 = getCavingRoutes('class_3_tight_squeeze');
      expect(class3).toHaveLength(1);
      expect(class3[0].id).toBe('tumbling-rock-cave-passages');
    });

    it('finds a cave by id with correct specs', () => {
      const fantastic = getCavingRouteById('fantastic-pit-ellisons-cave');
      expect(fantastic).toBeDefined();
      expect(fantastic?.title).toBe("Fantastic Pit & Ellison's Cave System");
      expect(fantastic?.region).toBe('Pigeon Mountain, Walker County, GA');
      expect(fantastic?.depthM).toBe(325);
      expect(fantastic?.totalLengthM).toBe(19500);
      expect(fantastic?.deepestPitchM).toBe(179);
      expect(fantastic?.caveGrade).toBe('class_4_vertical_srt');
      expect(fantastic?.environmentalType).toBe('active_streamway');
      expect(fantastic?.typicalDurationHours).toBe(8.5);
      expect(fantastic?.rebelaysRequired).toBe(2);
      expect(fantastic?.waterproofOversuitRequired).toBe(true);
      expect(fantastic?.highlights).toContain(
        '586-foot unbroken vertical drop (deepest free drop in lower 48)'
      );

      const missing = getCavingRouteById('non-existent-cave');
      expect(missing).toBeUndefined();
    });
  });

  describe('Mandatory Caving Safety Kit Checklist', () => {
    it('returns 6 mandatory caving gear items', () => {
      const gear = getCavingGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const ids = gear.map((g) => g.id);
      expect(ids).toContain('en12492-caving-helmet-mount');
      expect(ids).toContain('secondary-backup-headlamp');
      expect(ids).toContain('caving-srt-frog-system');
      expect(ids).toContain('caving-bobbin-rack-descender');
      expect(ids).toContain('heavy-cordura-caving-oversuit');
      expect(ids).toContain('wns-biosecurity-decon-kit');

      const helmet = gear.find((g) => g.id === 'en12492-caving-helmet-mount');
      expect(helmet?.category).toBe('helmet_lighting');
      expect(helmet?.name).toContain('EN 12492 Certified Caving Helmet');

      const decon = gear.find((g) => g.id === 'wns-biosecurity-decon-kit');
      expect(decon?.category).toBe('conservation');
      expect(decon?.name).toContain('White-Nose Syndrome');
    });
  });

  describe('SRT Rigging & Rebelay Load Calculator', () => {
    it('calculates total suspended weight and rope stretch for standard hang', () => {
      const query: SrtRiggingQuery = {
        caveId: 'fantastic-pit-ellisons-cave',
        pitchDepthM: 100,
        caverWeightKg: 75,
        caverPackWeightKg: 15,
        ropeDiameterMm: 10.0,
        ropeAbrasionRisk: 'none_clean_drop',
        rebelayConfigured: false,
      };

      const result = calculateSrtRiggingPlan(query);

      expect(result.caveTitle).toBe("Fantastic Pit & Ellison's Cave System");
      expect(result.caveGrade).toBe('class_4_vertical_srt');
      expect(result.totalSuspendedWeightKg).toBe(90);
      expect(result.estimatedRopeStretchM).toBeGreaterThan(0);
      expect(result.safetyStatus).toBe('approved_safe_hang');
      expect(result.biosecurityNotice).toContain('White-Nose Syndrome');
    });

    it('recommends stainless steel rappel rack for deep pitches > 50m', () => {
      const deepQuery: SrtRiggingQuery = {
        caveId: 'fantastic-pit-ellisons-cave',
        pitchDepthM: 179,
        caverWeightKg: 80,
        caverPackWeightKg: 10,
        ropeDiameterMm: 10.5,
        ropeAbrasionRisk: 'none_clean_drop',
        rebelayConfigured: false,
      };

      const deepResult = calculateSrtRiggingPlan(deepQuery);
      expect(deepResult.descenderRecommendation).toMatch(/rack/i);
      expect(deepResult.descenderRecommendation).toContain('Rappel Rack');

      const shallowQuery: SrtRiggingQuery = {
        caveId: 'tumbling-rock-cave-passages',
        pitchDepthM: 18,
        caverWeightKg: 75,
        caverPackWeightKg: 5,
        ropeDiameterMm: 10.0,
        ropeAbrasionRisk: 'none_clean_drop',
        rebelayConfigured: false,
      };

      const shallowResult = calculateSrtRiggingPlan(shallowQuery);
      expect(shallowResult.descenderRecommendation).toMatch(/bobbin/i);
    });

    it('warns of critical rope shear risk on severe rub point without rebelay', () => {
      const severeQuery: SrtRiggingQuery = {
        caveId: 'fantastic-pit-ellisons-cave',
        pitchDepthM: 179,
        caverWeightKg: 75,
        caverPackWeightKg: 10,
        ropeDiameterMm: 10.0,
        ropeAbrasionRisk: 'severe_rub_point',
        rebelayConfigured: false,
      };

      const result = calculateSrtRiggingPlan(severeQuery);
      expect(result.safetyStatus).toBe('critical_rope_shear_risk');
      expect(result.rebelayAdvisory).toMatch(/critical|shear|rub/i);
    });

    it('mitigates severe rub point when rebelay is configured, moving to caution rope pad required', () => {
      const mitigatedQuery: SrtRiggingQuery = {
        caveId: 'fantastic-pit-ellisons-cave',
        pitchDepthM: 179,
        caverWeightKg: 75,
        caverPackWeightKg: 10,
        ropeDiameterMm: 10.0,
        ropeAbrasionRisk: 'severe_rub_point',
        rebelayConfigured: true,
      };

      const result = calculateSrtRiggingPlan(mitigatedQuery);
      expect(result.safetyStatus).toBe('caution_rope_pad_required');
      expect(result.rebelayAdvisory).toMatch(/rebelay configured/i);
    });

    it('sets caution status on minor lip contact', () => {
      const minorQuery: SrtRiggingQuery = {
        caveId: 'leprechaun-cave-bighorns',
        pitchDepthM: 60,
        caverWeightKg: 70,
        caverPackWeightKg: 10,
        ropeDiameterMm: 9.5,
        ropeAbrasionRisk: 'minor_lip_contact',
        rebelayConfigured: false,
      };

      const result = calculateSrtRiggingPlan(minorQuery);
      expect(result.safetyStatus).toBe('caution_rope_pad_required');
    });

    it('throws error for invalid caveId', () => {
      const badQuery: SrtRiggingQuery = {
        caveId: 'invalid-cave',
        pitchDepthM: 50,
        caverWeightKg: 75,
        caverPackWeightKg: 10,
        ropeDiameterMm: 10.0,
        ropeAbrasionRisk: 'none_clean_drop',
        rebelayConfigured: false,
      };

      expect(() => calculateSrtRiggingPlan(badQuery)).toThrow(/not found/i);
    });
  });
});
