import { describe, it, expect } from 'vitest';
import {
  JOKULHLAUP_ESCAPE_SITES,
  filterJokulhlaupSites,
  calculateJokulhlaupEscape,
  getJokulhlaupGearChecklist,
  type JokulhlaupEscapeInput,
} from '../jokulhlaup-escape';

describe('jokulhlaup-escape domain library', () => {
  describe('JOKULHLAUP_ESCAPE_SITES catalog', () => {
    it('exports all 4 real-world subglacial jökulhlaup & ice-dammed lake outburst corridors with complete metadata', () => {
      expect(JOKULHLAUP_ESCAPE_SITES).toHaveLength(4);

      const ids = JOKULHLAUP_ESCAPE_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'grimsvotn-skeidararsandur-vatnajokull-iceland',
        'suicide-basin-mendenhall-juneau-alaska',
        'cachet-dos-colonia-patagonia-chile',
        'kyagar-shaksgam-karakoram-pakistan-china',
      ]);

      const grimsvotn = JOKULHLAUP_ESCAPE_SITES.find(
        (s) => s.id === 'grimsvotn-skeidararsandur-vatnajokull-iceland'
      );
      expect(grimsvotn).toBeDefined();
      expect(grimsvotn?.name).toBe(
        'Grímsvötn & Skeiðarárjökull Subglacial Caldera Outburst Corridor'
      );
      expect(grimsvotn?.glacierSystem).toBe('Vatnajökull National Park');
      expect(grimsvotn?.country).toBe('Iceland');
      expect(grimsvotn?.region).toBe('Suðurland');
      expect(grimsvotn?.elevationMeters).toBe(1450);
      expect(grimsvotn?.triggerMechanism).toBe('subglacial-geothermal-caldera');

      const suicideBasin = JOKULHLAUP_ESCAPE_SITES.find(
        (s) => s.id === 'suicide-basin-mendenhall-juneau-alaska'
      );
      expect(suicideBasin).toBeDefined();
      expect(suicideBasin?.name).toBe(
        'Suicide Basin (Klesteroa) & Mendenhall Glacier Ice-Dammed Margin'
      );
      expect(suicideBasin?.glacierSystem).toBe(
        'Juneau Icefield / Tongass National Forest'
      );
      expect(suicideBasin?.country).toBe('USA');
      expect(suicideBasin?.region).toBe('Alaska');
      expect(suicideBasin?.elevationMeters).toBe(420);
      expect(suicideBasin?.triggerMechanism).toBe('marginal-ice-dam-flotation');

      const cachet = JOKULHLAUP_ESCAPE_SITES.find(
        (s) => s.id === 'cachet-dos-colonia-patagonia-chile'
      );
      expect(cachet).toBeDefined();
      expect(cachet?.name).toBe(
        'Lago Cachet II & Glaciar Colonia Proglacial Canyon'
      );
      expect(cachet?.glacierSystem).toBe('Northern Patagonian Icefield');
      expect(cachet?.country).toBe('Chile');
      expect(cachet?.region).toBe('Aysén');
      expect(cachet?.elevationMeters).toBe(470);
      expect(cachet?.triggerMechanism).toBe('supraglacial-englacial-conduit');

      const kyagar = JOKULHLAUP_ESCAPE_SITES.find(
        (s) => s.id === 'kyagar-shaksgam-karakoram-pakistan-china'
      );
      expect(kyagar).toBeDefined();
      expect(kyagar?.name).toBe(
        'Kyagar Tso & Upper Shaksgam Glacier Ice-Dammed Gorge'
      );
      expect(kyagar?.glacierSystem).toBe('North Karakoram / Aghil Range');
      expect(kyagar?.country).toBe('Pakistan / China');
      expect(kyagar?.region).toBe('Xinjiang / Gilgit-Baltistan Border');
      expect(kyagar?.elevationMeters).toBe(4750);
      expect(kyagar?.triggerMechanism).toBe('moraine-ice-core-piping');

      for (const site of JOKULHLAUP_ESCAPE_SITES) {
        expect(site.glacierSystem.length).toBeGreaterThan(2);
        expect(site.region.length).toBeGreaterThan(2);
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.historicalPeakDischargeM3s).toBeGreaterThanOrEqual(50);
        expect(site.historicalPeakDischargeM3s).toBeLessThanOrEqual(50000);
        expect(site.safeTerraceGainM).toBeGreaterThanOrEqual(5);
        expect(site.safeTerraceGainM).toBeLessThanOrEqual(220);
        expect(site.floodWaveLeadMinutes).toBeGreaterThanOrEqual(2);
        expect(site.floodWaveLeadMinutes).toBeLessThanOrEqual(240);
        expect(['moderate', 'challenging', 'extreme']).toContain(
          site.difficulty
        );
        expect(site.bestSeason.length).toBeGreaterThan(2);
        expect(site.hazards.length).toBeGreaterThanOrEqual(2);
        expect(site.evacuationProtocol.length).toBeGreaterThan(5);
        expect(site.description.length).toBeGreaterThan(15);
      }
    });
  });

  describe('filterJokulhlaupSites', () => {
    it('filters sites by country, triggerMechanism, difficulty, and search query', () => {
      expect(filterJokulhlaupSites(JOKULHLAUP_ESCAPE_SITES, {})).toHaveLength(
        4
      );

      const byCountry = filterJokulhlaupSites(JOKULHLAUP_ESCAPE_SITES, {
        country: 'Iceland',
      });
      expect(byCountry).toHaveLength(1);
      expect(byCountry[0].id).toBe(
        'grimsvotn-skeidararsandur-vatnajokull-iceland'
      );

      const byTrigger = filterJokulhlaupSites(JOKULHLAUP_ESCAPE_SITES, {
        triggerMechanism: 'supraglacial-englacial-conduit',
      });
      expect(byTrigger).toHaveLength(1);
      expect(byTrigger[0].id).toBe('cachet-dos-colonia-patagonia-chile');

      const byDifficulty = filterJokulhlaupSites(JOKULHLAUP_ESCAPE_SITES, {
        difficulty: 'extreme',
      });
      expect(byDifficulty.length).toBeGreaterThanOrEqual(1);
      expect(byDifficulty.every((s) => s.difficulty === 'extreme')).toBe(true);

      const bySearch = filterJokulhlaupSites(JOKULHLAUP_ESCAPE_SITES, {
        search: 'Mendenhall',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe('suicide-basin-mendenhall-juneau-alaska');
    });
  });

  describe('calculateJokulhlaupEscape', () => {
    const validBase: JokulhlaupEscapeInput = {
      iceDamDrawdownCmPerHr: 4,
      proglacialConductivityUsCm: 65,
      subglacialTremorAmplitudeUm: 0.4,
      canyonFloorDistanceFromPortalKm: 24.0,
      verticalGainToSafeTerraceM: 18,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateJokulhlaupEscape({ ...validBase, iceDamDrawdownCmPerHr: -1 })
      ).toThrow(/iceDamDrawdownCmPerHr/i);
      expect(() =>
        calculateJokulhlaupEscape({ ...validBase, iceDamDrawdownCmPerHr: 251 })
      ).toThrow(/iceDamDrawdownCmPerHr/i);
      expect(() =>
        calculateJokulhlaupEscape({ ...validBase, iceDamDrawdownCmPerHr: NaN })
      ).toThrow(/iceDamDrawdownCmPerHr/i);

      expect(() =>
        calculateJokulhlaupEscape({
          ...validBase,
          proglacialConductivityUsCm: 19,
        })
      ).toThrow(/proglacialConductivityUsCm/i);
      expect(() =>
        calculateJokulhlaupEscape({
          ...validBase,
          proglacialConductivityUsCm: 1201,
        })
      ).toThrow(/proglacialConductivityUsCm/i);

      expect(() =>
        calculateJokulhlaupEscape({
          ...validBase,
          subglacialTremorAmplitudeUm: 0.05,
        })
      ).toThrow(/subglacialTremorAmplitudeUm/i);
      expect(() =>
        calculateJokulhlaupEscape({
          ...validBase,
          subglacialTremorAmplitudeUm: 50.1,
        })
      ).toThrow(/subglacialTremorAmplitudeUm/i);

      expect(() =>
        calculateJokulhlaupEscape({
          ...validBase,
          canyonFloorDistanceFromPortalKm: 0.1,
        })
      ).toThrow(/canyonFloorDistanceFromPortalKm/i);
      expect(() =>
        calculateJokulhlaupEscape({
          ...validBase,
          canyonFloorDistanceFromPortalKm: 40.5,
        })
      ).toThrow(/canyonFloorDistanceFromPortalKm/i);

      expect(() =>
        calculateJokulhlaupEscape({
          ...validBase,
          verticalGainToSafeTerraceM: 4,
        })
      ).toThrow(/verticalGainToSafeTerraceM/i);
      expect(() =>
        calculateJokulhlaupEscape({
          ...validBase,
          verticalGainToSafeTerraceM: 221,
        })
      ).toThrow(/verticalGainToSafeTerraceM/i);
    });

    it('computes low risk level and routine-proglacial-terrace-watch strategy under stable ice-dam and distal canyon conditions', () => {
      const analysis = calculateJokulhlaupEscape(validBase);

      expect(analysis.riskLevel).toBe('low');
      expect(analysis.evacuationStrategy).toBe(
        'routine-proglacial-terrace-watch'
      );
      expect(analysis.estimatedPeakDischargeM3s).toBeGreaterThanOrEqual(50);
      expect(analysis.estimatedPeakDischargeM3s).toBeLessThan(800);
      expect(analysis.floodFrontArrivalMinutes).toBeGreaterThan(85);
      expect(analysis.floodFrontArrivalMinutes).toBeLessThanOrEqual(240);
      expect(analysis.requiredAscentRateMPerMin).toBeGreaterThanOrEqual(0.2);
      expect(analysis.requiredAscentRateMPerMin).toBeLessThan(1.5);
      expect(analysis.iceBlockBallisticImpactRiskPct).toBeGreaterThanOrEqual(0);
      expect(analysis.iceBlockBallisticImpactRiskPct).toBeLessThan(25);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('increases estimatedPeakDischargeM3s, requiredAscentRateMPerMin, and iceBlockBallisticImpactRiskPct and decreases floodFrontArrivalMinutes under rapid drawdown, high tremor/conductivity, and close portal distance', () => {
      const mild = calculateJokulhlaupEscape(validBase);
      const severe = calculateJokulhlaupEscape({
        iceDamDrawdownCmPerHr: 195,
        proglacialConductivityUsCm: 980,
        subglacialTremorAmplitudeUm: 38.0,
        canyonFloorDistanceFromPortalKm: 1.8,
        verticalGainToSafeTerraceM: 120,
      });

      expect(severe.estimatedPeakDischargeM3s).toBeGreaterThan(
        mild.estimatedPeakDischargeM3s
      );
      expect(severe.floodFrontArrivalMinutes).toBeLessThan(
        mild.floodFrontArrivalMinutes
      );
      expect(severe.requiredAscentRateMPerMin).toBeGreaterThan(
        mild.requiredAscentRateMPerMin
      );
      expect(severe.iceBlockBallisticImpactRiskPct).toBeGreaterThan(
        mild.iceBlockBallisticImpactRiskPct
      );
    });

    it('computes moderate risk level and halt-canyon-entry-monitor-h2s-plume strategy when moderate thresholds are met', () => {
      const analysis = calculateJokulhlaupEscape({
        iceDamDrawdownCmPerHr: 32,
        proglacialConductivityUsCm: 280,
        subglacialTremorAmplitudeUm: 4.5,
        canyonFloorDistanceFromPortalKm: 12.0,
        verticalGainToSafeTerraceM: 42,
      });

      expect(analysis.riskLevel).toBe('moderate');
      expect(analysis.evacuationStrategy).toBe(
        'halt-canyon-entry-monitor-h2s-plume'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes high risk level and immediate-lateral-moraine-sprint strategy when high thresholds are met', () => {
      const analysis = calculateJokulhlaupEscape({
        iceDamDrawdownCmPerHr: 72,
        proglacialConductivityUsCm: 540,
        subglacialTremorAmplitudeUm: 11.5,
        canyonFloorDistanceFromPortalKm: 6.5,
        verticalGainToSafeTerraceM: 75,
      });

      expect(analysis.riskLevel).toBe('high');
      expect(analysis.evacuationStrategy).toBe(
        'immediate-lateral-moraine-sprint'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes critical risk level and emergency-vertical-scree-scramble-abandon-loads strategy under extreme outburst discharge or imminent flood wave arrival', () => {
      const analysis = calculateJokulhlaupEscape({
        iceDamDrawdownCmPerHr: 195,
        proglacialConductivityUsCm: 980,
        subglacialTremorAmplitudeUm: 38.0,
        canyonFloorDistanceFromPortalKm: 1.8,
        verticalGainToSafeTerraceM: 120,
      });

      expect(analysis.riskLevel).toBe('critical');
      expect(analysis.evacuationStrategy).toBe(
        'emergency-vertical-scree-scramble-abandon-loads'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getJokulhlaupGearChecklist', () => {
    it('returns at least 6 gear items spanning gas-hydro-detection, vertical-escape-traction, emergency-signaling, and hypothermia-bivouac', () => {
      const gear = getJokulhlaupGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('gas-hydro-detection')).toBe(true);
      expect(categories.has('vertical-escape-traction')).toBe(true);
      expect(categories.has('emergency-signaling')).toBe(true);
      expect(categories.has('hypothermia-bivouac')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });
});
