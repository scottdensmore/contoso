import { describe, it, expect } from 'vitest';
import {
  getNordicTrails,
  getNordicTrailById,
  calculateWaxPlan,
  getNordicGear,
  type WaxAdvisorQuery,
} from './nordic-skiing';

describe('nordic-skiing library', () => {
  describe('getNordicTrails', () => {
    it('returns all 5 iconic Nordic trail systems with valid fields', () => {
      const trails = getNordicTrails();
      expect(trails).toHaveLength(5);

      const ids = trails.map((t) => t.id);
      expect(ids).toEqual([
        'methow-valley-community-trail',
        'trapp-family-sugar-road',
        'devil-thumb-ranch-high-lonesome',
        'royal-gorge-rainbow-ridge',
        'boundary-waters-banadad-trail',
      ]);

      for (const trail of trails) {
        expect(trail.id).toBeTruthy();
        expect(trail.trailName).toBeTruthy();
        expect(trail.systemName).toBeTruthy();
        expect(trail.region).toBeTruthy();
        expect(trail.distanceKm).toBeGreaterThan(0);
        expect(trail.elevationGainM).toBeGreaterThanOrEqual(0);
        expect(['classic_track', 'skate_skiing', 'backcountry_touring', 'light_touring']).toContain(
          trail.discipline
        );
        expect(['easy_green', 'moderate_blue', 'difficult_black', 'expert_double_black']).toContain(
          trail.difficulty
        );
        expect(typeof trail.groomedDaily).toBe('boolean');
        expect(trail.skateLaneWidthM).toBeGreaterThanOrEqual(0);
        expect(trail.classicTracksCount).toBeGreaterThanOrEqual(0);
        expect(trail.description).toBeTruthy();
        expect(trail.trailHighlights.length).toBeGreaterThanOrEqual(3);
      }
    });

    it('returns detailed metadata for Methow Valley and Devil Thumb Ranch', () => {
      const methow = getNordicTrailById('methow-valley-community-trail');
      expect(methow).toBeDefined();
      expect(methow?.trailName).toBe('Methow Valley Community Trail');
      expect(methow?.systemName).toBe('Methow Trails');
      expect(methow?.region).toBe('Winthrop, WA');
      expect(methow?.distanceKm).toBe(30.0);
      expect(methow?.elevationGainM).toBe(180);
      expect(methow?.discipline).toBe('classic_track');
      expect(methow?.difficulty).toBe('easy_green');
      expect(methow?.groomedDaily).toBe(true);
      expect(methow?.skateLaneWidthM).toBe(4.5);
      expect(methow?.classicTracksCount).toBe(2);
      expect(methow?.trailHighlights).toContain('Suspension bridge river crossing');
      expect(methow?.trailHighlights).toContain('Heckendorn bakery ski-through');
      expect(methow?.trailHighlights).toContain('Wide continuous valley skate lane');

      const devil = getNordicTrailById('devil-thumb-ranch-high-lonesome');
      expect(devil).toBeDefined();
      expect(devil?.trailName).toBe("Devil's Thumb Ranch High Lonesome Loop");
      expect(devil?.systemName).toBe("Devil's Thumb Ranch");
      expect(devil?.region).toBe('Tabernash, CO');
      expect(devil?.distanceKm).toBe(22.5);
      expect(devil?.elevationGainM).toBe(410);
      expect(devil?.discipline).toBe('skate_skiing');
      expect(devil?.difficulty).toBe('difficult_black');
      expect(devil?.groomedDaily).toBe(true);
      expect(devil?.skateLaneWidthM).toBe(5.0);
      expect(devil?.classicTracksCount).toBe(2);
      expect(devil?.trailHighlights).toContain('Continental Divide vistas');
    });

    it('returns detailed metadata for Banadad Wilderness Backcountry Ski Trail', () => {
      const banadad = getNordicTrailById('boundary-waters-banadad-trail');
      expect(banadad).toBeDefined();
      expect(banadad?.trailName).toBe('Banadad Wilderness Backcountry Ski Trail');
      expect(banadad?.groomedDaily).toBe(false);
      expect(banadad?.discipline).toBe('backcountry_touring');
      expect(banadad?.difficulty).toBe('expert_double_black');
      expect(banadad?.skateLaneWidthM).toBe(0.0);
      expect(banadad?.classicTracksCount).toBe(1);
    });

    it('filters trails by discipline', () => {
      const classic = getNordicTrails('classic_track');
      expect(classic.map((t) => t.id)).toEqual([
        'methow-valley-community-trail',
        'trapp-family-sugar-road',
      ]);

      const skate = getNordicTrails('skate_skiing');
      expect(skate.map((t) => t.id)).toEqual([
        'devil-thumb-ranch-high-lonesome',
        'royal-gorge-rainbow-ridge',
      ]);

      const backcountry = getNordicTrails('backcountry_touring');
      expect(backcountry.map((t) => t.id)).toEqual(['boundary-waters-banadad-trail']);

      const lightTouring = getNordicTrails('light_touring');
      expect(lightTouring).toEqual([]);
    });
  });

  describe('getNordicTrailById', () => {
    it('returns undefined when trail id does not exist', () => {
      expect(getNordicTrailById('unknown-trail')).toBeUndefined();
    });
  });

  describe('calculateWaxPlan', () => {
    it('recommends Swix Green hardwax for cold temperatures below 18°F', () => {
      const query: WaxAdvisorQuery = {
        trailId: 'methow-valley-community-trail',
        airTemperatureF: 12,
        snowCondition: 'packed_powder',
        skiBaseType: 'waxable',
      };
      const result = calculateWaxPlan(query);

      expect(result.trailAndSystem).toContain('Methow Valley Community Trail');
      expect(result.recommendedKickWax).toMatch(/Swix Green/i);
      expect(result.klisterRequired).toBe(false);
      expect(result.recommendedGlideWax).toBeTruthy();
      expect(result.waxPocketPressure).toBeTruthy();
      expect(['fast', 'moderate', 'slow_sticky']).toContain(result.glideSpeedRating);
      expect(result.waxAdvisory).toBeTruthy();
    });

    it('recommends Swix Blue Extra for mid-cold temperatures between 18°F and 28°F', () => {
      const query: WaxAdvisorQuery = {
        trailId: 'methow-valley-community-trail',
        airTemperatureF: 24,
        snowCondition: 'hardpack_groomed',
        skiBaseType: 'waxable',
      };
      const result = calculateWaxPlan(query);

      expect(result.recommendedKickWax).toMatch(/Swix Blue Extra/i);
      expect(result.klisterRequired).toBe(false);
      expect(result.glideSpeedRating).toBe('fast');
    });

    it('recommends Swix Violet for transition temperatures between 28°F and 32°F', () => {
      const query: WaxAdvisorQuery = {
        trailId: 'trapp-family-sugar-road',
        airTemperatureF: 30,
        snowCondition: 'packed_powder',
        skiBaseType: 'waxable',
      };
      const result = calculateWaxPlan(query);

      expect(result.recommendedKickWax).toMatch(/Violet/i);
      expect(result.klisterRequired).toBe(false);
    });

    it('flags klisterRequired and recommends Klister / Red for wet slush or granular spring above 32°F', () => {
      const queryWet: WaxAdvisorQuery = {
        trailId: 'royal-gorge-rainbow-ridge',
        airTemperatureF: 38,
        snowCondition: 'wet_slush',
        skiBaseType: 'waxable',
      };
      const resultWet = calculateWaxPlan(queryWet);

      expect(resultWet.klisterRequired).toBe(true);
      expect(resultWet.recommendedKickWax).toMatch(/Klister|Red/i);
      expect(resultWet.glideSpeedRating).toBe('slow_sticky');

      const queryGranular: WaxAdvisorQuery = {
        trailId: 'devil-thumb-ranch-high-lonesome',
        airTemperatureF: 34,
        snowCondition: 'granular_spring',
        skiBaseType: 'waxable',
      };
      const resultGranular = calculateWaxPlan(queryGranular);
      expect(resultGranular.klisterRequired).toBe(true);
      expect(resultGranular.recommendedKickWax).toMatch(/Klister/i);
    });

    it('handles skin-integrated skis without requiring kick wax', () => {
      const query: WaxAdvisorQuery = {
        trailId: 'trapp-family-sugar-road',
        airTemperatureF: 25,
        snowCondition: 'hardpack_groomed',
        skiBaseType: 'skin_integrated',
      };
      const result = calculateWaxPlan(query);

      expect(result.recommendedKickWax).toMatch(/Skin|Mohair|No kick wax/i);
      expect(result.waxPocketPressure).toMatch(/skin|camber/i);
    });

    it('handles fishscale waxless skis without requiring kick wax', () => {
      const query: WaxAdvisorQuery = {
        trailId: 'boundary-waters-banadad-trail',
        airTemperatureF: 20,
        snowCondition: 'fresh_powder',
        skiBaseType: 'fishscale_waxless',
      };
      const result = calculateWaxPlan(query);

      expect(result.recommendedKickWax).toMatch(/waxless|pattern|crown/i);
      expect(result.waxPocketPressure).toMatch(/mechanical|pattern|waxless/i);
    });

    it('falls back gracefully when trailId is not found', () => {
      const query: WaxAdvisorQuery = {
        trailId: 'unknown-id',
        airTemperatureF: 22,
        snowCondition: 'packed_powder',
        skiBaseType: 'waxable',
      };
      const result = calculateWaxPlan(query);

      expect(result.trailAndSystem).toBe('Custom Nordic Trail');
      expect(result.recommendedKickWax).toMatch(/Swix Blue Extra/i);
    });
  });

  describe('getNordicGear', () => {
    it('returns all 6 mandatory Nordic Safety Kit items', () => {
      const gear = getNordicGear();
      expect(gear).toHaveLength(6);

      const mandatoryCount = gear.filter((g) => g.mandatory).length;
      expect(mandatoryCount).toBe(6);

      const names = gear.map((g) => g.name);
      expect(names).toContain(
        'NNN / Prolink / SNS Profil boot-binding compatible cross-country skis'
      );
      expect(names).toContain(
        'High-modulus carbon composite cross-country ski poles with race or touring baskets'
      );
      expect(names).toContain(
        'Breathable windproof cross-country softshell jacket and thermal tights'
      );
      expect(names).toContain(
        'Temperature-rated kick wax kit or mohair ski skin maintenance conditioner'
      );
      expect(names).toContain(
        'High-fluorocarbon-free eco glide wax with cork applicator and nylon brush'
      );
      expect(names).toContain(
        'Insulated hydration belt pack with warm electrolyte drink bottle'
      );

      for (const item of gear) {
        expect(item.id).toBeTruthy();
        expect(item.description).toBeTruthy();
        expect(['skis_bindings', 'boots_poles', 'wax_tuning', 'apparel', 'safety']).toContain(
          item.category
        );
      }
    });
  });
});
