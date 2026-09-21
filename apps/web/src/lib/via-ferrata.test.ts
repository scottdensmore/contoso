import { describe, it, expect } from 'vitest';
import {
  getViaFerrataRoutes,
  getViaFerrataRouteById,
  calculateRiggingPlan,
  getViaFerrataGear,
} from './via-ferrata';

describe('via-ferrata library', () => {
  describe('getViaFerrataRoutes & filtering', () => {
    it('returns all 5 iconic via ferrata routes by default', () => {
      const routes = getViaFerrataRoutes();
      expect(routes).toHaveLength(5);
      const ids = routes.map((r) => r.id);
      expect(ids).toEqual([
        'telluride-via-ferrata',
        'mount-olympus-iron-way',
        'ouray-via-ferrata-gold-mountain',
        'whistler-peak-via-ferrata',
        'mammoth-mountain-iron-crest',
      ]);
    });

    it('has accurate specs for Telluride Via Ferrata', () => {
      const telluride = getViaFerrataRouteById('telluride-via-ferrata');
      expect(telluride).toBeDefined();
      expect(telluride?.title).toBe('Telluride Via Ferrata');
      expect(telluride?.region).toBe('San Juan Mountains, Telluride, CO');
      expect(telluride?.distanceKm).toBe(3.2);
      expect(telluride?.verticalGainM).toBe(185);
      expect(telluride?.grade).toBe('grade_c_difficult');
      expect(telluride?.cableLengthM).toBe(1200);
      expect(telluride?.exposureLevel).toBe('high');
      expect(telluride?.typicalDurationHours).toBe(3.5);
      expect(telluride?.suspensionBridgeSpanM).toBe(0);
      expect(telluride?.restLanyardRecommended).toBe(true);
      expect(telluride?.highlights).toEqual([
        'The Main Event sheer ledge traverse',
        'Direct views of Bridal Veil Falls',
        'Airy canyon rim stepping irons',
      ]);
    });

    it('has accurate specs for Mount Olympus Iron Way Ridge', () => {
      const olympus = getViaFerrataRouteById('mount-olympus-iron-way');
      expect(olympus).toBeDefined();
      expect(olympus?.title).toBe('Mount Olympus Iron Way Ridge');
      expect(olympus?.region).toBe('Wasatch Range, Salt Lake City, UT');
      expect(olympus?.distanceKm).toBe(4.8);
      expect(olympus?.verticalGainM).toBe(420);
      expect(olympus?.grade).toBe('grade_b_moderately_difficult');
      expect(olympus?.cableLengthM).toBe(950);
      expect(olympus?.exposureLevel).toBe('moderate');
      expect(olympus?.typicalDurationHours).toBe(4.0);
      expect(olympus?.suspensionBridgeSpanM).toBe(15);
      expect(olympus?.restLanyardRecommended).toBe(false);
      expect(olympus?.highlights).toEqual([
        '15-meter wire suspension monkey bridge',
        'Granite friction slab traverses',
        'Panoramic Salt Lake Valley vistas',
      ]);
    });

    it('has accurate specs for Ouray Via Ferrata Gold Mountain', () => {
      const ouray = getViaFerrataRouteById('ouray-via-ferrata-gold-mountain');
      expect(ouray).toBeDefined();
      expect(ouray?.title).toBe('Ouray Via Ferrata Gold Mountain');
      expect(ouray?.region).toBe('Uncompahgre Gorge, Ouray, CO');
      expect(ouray?.distanceKm).toBe(2.1);
      expect(ouray?.verticalGainM).toBe(260);
      expect(ouray?.grade).toBe('grade_d_very_difficult');
      expect(ouray?.cableLengthM).toBe(1400);
      expect(ouray?.exposureLevel).toBe('extreme');
      expect(ouray?.typicalDurationHours).toBe(3.0);
      expect(ouray?.suspensionBridgeSpanM).toBe(35);
      expect(ouray?.restLanyardRecommended).toBe(true);
      expect(ouray?.highlights).toEqual([
        'Sky Bridge gorge crossing',
        'Vertical iron ladder staircase',
        'Overhanging headwall cable bypass',
      ]);
    });

    it('has accurate specs for Whistler Peak West Ridge Via Ferrata', () => {
      const whistler = getViaFerrataRouteById('whistler-peak-via-ferrata');
      expect(whistler).toBeDefined();
      expect(whistler?.title).toBe('Whistler Peak West Ridge Via Ferrata');
      expect(whistler?.region).toBe('Coast Mountains, Whistler, BC');
      expect(whistler?.distanceKm).toBe(3.6);
      expect(whistler?.verticalGainM).toBe(310);
      expect(whistler?.grade).toBe('grade_b_moderately_difficult');
      expect(whistler?.cableLengthM).toBe(800);
      expect(whistler?.exposureLevel).toBe('moderate');
      expect(whistler?.typicalDurationHours).toBe(3.5);
      expect(whistler?.suspensionBridgeSpanM).toBe(0);
      expect(whistler?.restLanyardRecommended).toBe(false);
      expect(whistler?.highlights).toEqual([
        'Glaciated summit approach',
        'Coast Mountain volcanic horn panorama',
        'Alpine marmot meadows',
      ]);
    });

    it('has accurate specs for Mammoth Mountain Iron Crest Wall', () => {
      const mammoth = getViaFerrataRouteById('mammoth-mountain-iron-crest');
      expect(mammoth).toBeDefined();
      expect(mammoth?.title).toBe('Mammoth Mountain Iron Crest Wall');
      expect(mammoth?.region).toBe('Sierra Nevada, Mammoth Lakes, CA');
      expect(mammoth?.distanceKm).toBe(1.8);
      expect(mammoth?.verticalGainM).toBe(380);
      expect(mammoth?.grade).toBe('grade_e_extremely_difficult');
      expect(mammoth?.cableLengthM).toBe(1100);
      expect(mammoth?.exposureLevel).toBe('extreme');
      expect(mammoth?.typicalDurationHours).toBe(4.5);
      expect(mammoth?.suspensionBridgeSpanM).toBe(25);
      expect(mammoth?.restLanyardRecommended).toBe(true);
      expect(mammoth?.highlights).toEqual([
        'Sustained 40-meter overhanging ladder rung face',
        'High Sierra crest panorama',
        'Suspended 25-meter wire beam crossing',
      ]);
    });

    it('filters routes correctly by grade', () => {
      const gradeB = getViaFerrataRoutes('grade_b_moderately_difficult');
      expect(gradeB).toHaveLength(2);
      expect(gradeB.map((r) => r.id)).toEqual([
        'mount-olympus-iron-way',
        'whistler-peak-via-ferrata',
      ]);

      const gradeC = getViaFerrataRoutes('grade_c_difficult');
      expect(gradeC).toHaveLength(1);
      expect(gradeC[0].id).toBe('telluride-via-ferrata');

      const gradeD = getViaFerrataRoutes('grade_d_very_difficult');
      expect(gradeD).toHaveLength(1);
      expect(gradeD[0].id).toBe('ouray-via-ferrata-gold-mountain');

      const gradeE = getViaFerrataRoutes('grade_e_extremely_difficult');
      expect(gradeE).toHaveLength(1);
      expect(gradeE[0].id).toBe('mammoth-mountain-iron-crest');

      const gradeA = getViaFerrataRoutes('grade_a_easy');
      expect(gradeA).toHaveLength(0);
    });

    it('returns undefined for non-existent route id', () => {
      expect(getViaFerrataRouteById('non-existent-route')).toBeUndefined();
    });
  });

  describe('getViaFerrataGear checklist', () => {
    it('returns the mandatory 6-item via ferrata kit', () => {
      const gear = getViaFerrataGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory)).toBe(true);

      const ids = gear.map((g) => g.id);
      expect(ids).toEqual([
        'en958-energy-absorber-lanyard',
        'locking-via-ferrata-carabiners',
        'climbing-harness-tested',
        'climbing-helmet-en12492',
        'rest-sling-carabiner',
        'sticky-approach-shoes-gloves',
      ]);
    });
  });

  describe('calculateRiggingPlan', () => {
    it('calculates certified compliant status and 4.2 kN impact force for standard 75kg climber', () => {
      const result = calculateRiggingPlan({
        routeId: 'telluride-via-ferrata',
        climberWeightKg: 75,
        hasHeavyBackpack: false,
        energyAbsorberType: 'tearing_webbing_en958',
        restLanyardAttached: true,
      });

      expect(result.routeTitle).toBe('Telluride Via Ferrata');
      expect(result.routeGrade).toBe('grade_c_difficult');
      expect(result.effectiveWeightKg).toBe(75);
      expect(result.weightStatus).toBe('certified_compliant');
      expect(result.lanyardSafetyStatus).toBe('approved');
      expect(result.estimatedImpactForceKn).toBe(4.2);
      expect(result.en958Compliant).toBe(true);
      expect(result.restLanyardAdvisory).toContain('Rest lanyard attached');
      expect(result.safetyNotice).toContain('certified compliant');
    });

    it('adds 10kg for heavy backpack and calculates adjusted impact force', () => {
      const result = calculateRiggingPlan({
        routeId: 'telluride-via-ferrata',
        climberWeightKg: 75,
        hasHeavyBackpack: true,
        energyAbsorberType: 'tearing_webbing_en958',
        restLanyardAttached: true,
      });

      expect(result.effectiveWeightKg).toBe(85);
      expect(result.weightStatus).toBe('certified_compliant');
      expect(result.estimatedImpactForceKn).toBe(4.4);
    });

    it('flags underweight risk for effective weight under 40kg', () => {
      const result = calculateRiggingPlan({
        routeId: 'telluride-via-ferrata',
        climberWeightKg: 35,
        hasHeavyBackpack: false,
        energyAbsorberType: 'tearing_webbing_en958',
        restLanyardAttached: false,
      });

      expect(result.effectiveWeightKg).toBe(35);
      expect(result.weightStatus).toBe('underweight_risk');
      expect(result.lanyardSafetyStatus).toBe('warning_backup_required');
      expect(result.safetyNotice).toContain('Effective climber weight is under 40 kg');
      expect(result.safetyNotice).toContain('top-rope belay backup');
    });

    it('flags overweight risk for effective weight over 120kg', () => {
      const result = calculateRiggingPlan({
        routeId: 'telluride-via-ferrata',
        climberWeightKg: 115,
        hasHeavyBackpack: true, // 115 + 10 = 125kg
        energyAbsorberType: 'tearing_webbing_en958',
        restLanyardAttached: true,
      });

      expect(result.effectiveWeightKg).toBe(125);
      expect(result.weightStatus).toBe('overweight_risk');
      expect(result.lanyardSafetyStatus).toBe('warning_backup_required');
      expect(result.safetyNotice).toContain('Effective climber weight exceeds 120 kg');
    });

    it('rejects legacy friction brake as outdated and unsafe with elevated impact force', () => {
      const result = calculateRiggingPlan({
        routeId: 'telluride-via-ferrata',
        climberWeightKg: 75,
        hasHeavyBackpack: false,
        energyAbsorberType: 'friction_brake_legacy',
        restLanyardAttached: true,
      });

      expect(result.en958Compliant).toBe(false);
      expect(result.lanyardSafetyStatus).toBe('outdated_unsafe');
      expect(result.estimatedImpactForceKn).toBeGreaterThanOrEqual(8.5);
      expect(result.safetyNotice).toContain('CRITICAL SAFETY HAZARD');
      expect(result.safetyNotice).toContain('Legacy rope-friction brake');
    });

    it('provides rest lanyard advisory when recommended but missing on Grade C/D/E routes', () => {
      const result = calculateRiggingPlan({
        routeId: 'telluride-via-ferrata',
        climberWeightKg: 75,
        hasHeavyBackpack: false,
        energyAbsorberType: 'tearing_webbing_en958',
        restLanyardAttached: false,
      });

      expect(result.restLanyardAdvisory).toContain('Rest lanyard strongly recommended');
    });

    it('provides rest lanyard advisory when route does not require rest lanyard', () => {
      const resultNoLanyard = calculateRiggingPlan({
        routeId: 'mount-olympus-iron-way',
        climberWeightKg: 75,
        hasHeavyBackpack: false,
        energyAbsorberType: 'tearing_webbing_en958',
        restLanyardAttached: false,
      });
      expect(resultNoLanyard.restLanyardAdvisory).toContain('Standard Y-lanyard is sufficient');

      const resultWithLanyard = calculateRiggingPlan({
        routeId: 'mount-olympus-iron-way',
        climberWeightKg: 75,
        hasHeavyBackpack: false,
        energyAbsorberType: 'tearing_webbing_en958',
        restLanyardAttached: true,
      });
      expect(resultWithLanyard.restLanyardAdvisory).toContain('Rest lanyard attached');
    });
  });
});
