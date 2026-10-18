import { describe, it, expect } from 'vitest';
import {
  SEA_CAVE_PNEUMATIC_SITES,
  SEA_CAVE_PNEUMATIC_GEAR_CHECKLIST,
  getAllSeaCavePneumaticSites,
  getSeaCavePneumaticSiteById,
  filterSeaCavePneumaticSites,
  getSeaCavePneumaticGearChecklist,
  calculateSeaCavePneumaticSafety,
} from './sea-cave-pneumatics';

describe('sea-cave-pneumatics domain library', () => {
  describe('curated sites catalog', () => {
    it('exports 5 curated sea-cave pneumatic sites with expected ids and metadata', () => {
      const sites = getAllSeaCavePneumaticSites();
      expect(sites).toHaveLength(5);
      expect(sites).toEqual(SEA_CAVE_PNEUMATIC_SITES);

      const ids = sites.map((s) => s.id);
      expect(ids).toEqual([
        'mendocino-devils-punchbowl-russian-gulch-siphon',
        'staffa-fingals-cave-columnar-basalt-surge-vault',
        'pictured-rocks-lovers-leap-sandstone-sea-caves',
        'kiama-bombo-headland-basalt-blowhole-slot',
        'na-pali-honopu-open-ceiling-lava-sea-cave',
      ]);

      for (const site of sites) {
        expect(site.name.length).toBeGreaterThan(5);
        expect(site.region.length).toBeGreaterThan(3);
        expect(site.country.length).toBeGreaterThan(1);
        expect(site.portalCeilingClearanceM).toBeGreaterThanOrEqual(0.3);
        expect(site.typicalSignificantWaveHeightM).toBeGreaterThanOrEqual(0.1);
        expect(site.typicalSwellPeriodSeconds).toBeGreaterThanOrEqual(4);
        expect(site.chamberConvergenceRatio).toBeGreaterThanOrEqual(1.0);
        expect(site.chamberLengthM).toBeGreaterThanOrEqual(5);
        expect(site.highlights.length).toBeGreaterThanOrEqual(2);
        expect(site.bestSeason.length).toBeGreaterThan(2);
      }
    });

    it('retrieves a site by id or returns undefined for unknown id', () => {
      const staffa = getSeaCavePneumaticSiteById(
        'staffa-fingals-cave-columnar-basalt-surge-vault'
      );
      expect(staffa).toBeDefined();
      expect(staffa?.country).toBe('UK');
      expect(staffa?.morphology).toBe('convergent_basalt_surge_slot');

      expect(getSeaCavePneumaticSiteById('non-existent-cave')).toBeUndefined();
    });

    it('filters sites by morphology, waveRegime, and traversalMode', () => {
      expect(filterSeaCavePneumaticSites()).toHaveLength(5);

      const blowholeSites = filterSeaCavePneumaticSites({
        morphology: 'constricted_pneumatic_blowhole_shaft',
      });
      expect(blowholeSites).toHaveLength(1);
      expect(blowholeSites[0].id).toBe(
        'kiama-bombo-headland-basalt-blowhole-slot'
      );

      const forerunnerSites = filterSeaCavePneumaticSites({
        waveRegime: 'long_period_forerunner_swell_17s',
      });
      expect(forerunnerSites).toHaveLength(2);

      const kayakSites = filterSeaCavePneumaticSites({
        traversalMode: 'sit_on_top_sea_kayak_sprint',
      });
      expect(kayakSites).toHaveLength(2);

      const combined = filterSeaCavePneumaticSites({
        waveRegime: 'long_period_forerunner_swell_17s',
        traversalMode: 'inflatable_rescue_sled_recon',
      });
      expect(combined).toHaveLength(1);
      expect(combined[0].id).toBe('na-pali-honopu-open-ceiling-lava-sea-cave');
    });
  });

  describe('mandatory gear checklist', () => {
    it('returns all 6 mandatory impact, barotrauma, buoyancy, and telemetry items', () => {
      const gear = getSeaCavePneumaticGearChecklist();
      expect(gear).toHaveLength(6);
      expect(gear).toEqual(SEA_CAVE_PNEUMATIC_GEAR_CHECKLIST);

      const expectedIds = [
        'ce-en1385-whitewater-and-surf-impact-helmet',
        'vented-acoustic-barotrauma-surf-earplugs',
        'high-flotation-quick-release-coasteering-pfd',
        'blunt-tip-titanium-line-cutter-and-kelp-knife',
        'dual-beam-ipx8-submersible-headlamp-and-strobe',
        'digital-swell-set-interval-chronograph-and-tide-table',
      ];
      expect(gear.map((item) => item.id)).toEqual(expectedIds);
      expect(gear.every((item) => item.mandatory)).toBe(true);
    });
  });

  describe('calculateSeaCavePneumaticSafety', () => {
    it('validates input boundaries and throws descriptive errors', () => {
      const validInput = {
        portalCeilingClearanceM: 4.8,
        significantWaveHeightM: 0.7,
        swellPeriodSeconds: 8,
        chamberConvergenceRatio: 1.3,
        tideHeightAboveMllwM: 0.2,
        chamberLengthM: 38,
      };

      expect(() =>
        calculateSeaCavePneumaticSafety({
          ...validInput,
          portalCeilingClearanceM: 0.1,
        })
      ).toThrow(/portalCeilingClearanceM/i);

      expect(() =>
        calculateSeaCavePneumaticSafety({
          ...validInput,
          significantWaveHeightM: 15,
        })
      ).toThrow(/significantWaveHeightM/i);

      expect(() =>
        calculateSeaCavePneumaticSafety({
          ...validInput,
          swellPeriodSeconds: 3,
        })
      ).toThrow(/swellPeriodSeconds/i);

      expect(() =>
        calculateSeaCavePneumaticSafety({
          ...validInput,
          chamberConvergenceRatio: 0.8,
        })
      ).toThrow(/chamberConvergenceRatio/i);

      expect(() =>
        calculateSeaCavePneumaticSafety({
          ...validInput,
          tideHeightAboveMllwM: 6.0,
        })
      ).toThrow(/tideHeightAboveMllwM/i);

      expect(() =>
        calculateSeaCavePneumaticSafety({
          ...validInput,
          chamberLengthM: 300,
        })
      ).toThrow(/chamberLengthM/i);
    });

    it('calculates nominal_vented_slack_swell_window for vented slack-tide arch conditions', () => {
      const result = calculateSeaCavePneumaticSafety({
        portalCeilingClearanceM: 4.8,
        significantWaveHeightM: 0.7,
        swellPeriodSeconds: 9,
        chamberConvergenceRatio: 1.3,
        tideHeightAboveMllwM: 0.2,
        chamberLengthM: 35,
        morphology: 'dual_portal_littoral_through_arch',
        waveRegime: 'short_period_wind_chop_8s',
      });

      expect(result.safetyStatus).toBe('nominal_vented_slack_swell_window');
      expect(result.portalPistonSealProbability).toBeLessThan(0.25);
      expect(result.pneumaticOverpressureKpa).toBeLessThan(18);
      expect(result.reboundSurgeVelocityMs).toBeLessThan(3.8);
      expect(result.safeSetLullWindowSeconds).toBeGreaterThanOrEqual(30);
      expect(result.swellSetTimingProtocol).toMatch(/15-minute/i);
      expect(result.barotraumaAndClapotisAdvisory).toMatch(/earplugs/i);
    });

    it('calculates caution_acoustic_overpressure_and_rebound_surge for moderate groundswell clapotis', () => {
      const result = calculateSeaCavePneumaticSafety({
        portalCeilingClearanceM: 6.5,
        significantWaveHeightM: 1.4,
        swellPeriodSeconds: 12,
        chamberConvergenceRatio: 1.8,
        tideHeightAboveMllwM: 0.5,
        chamberLengthM: 42,
        morphology: 'convergent_basalt_surge_slot',
        waveRegime: 'moderate_groundswell_12s',
      });

      expect(result.safetyStatus).toBe(
        'caution_acoustic_overpressure_and_rebound_surge'
      );
      expect(result.reboundSurgeVelocityMs).toBeGreaterThanOrEqual(3.8);
      expect(result.reboundSurgeVelocityMs).toBeLessThan(6.5);
      expect(result.safeSetLullWindowSeconds).toBeGreaterThanOrEqual(30);
    });

    it('calculates abort_pneumatic_piston_seal_and_blowhole_eruption for constricted blowhole / long-period swell', () => {
      const result = calculateSeaCavePneumaticSafety({
        portalCeilingClearanceM: 1.4,
        significantWaveHeightM: 2.8,
        swellPeriodSeconds: 18,
        chamberConvergenceRatio: 4.1,
        tideHeightAboveMllwM: 1.6,
        chamberLengthM: 54,
        morphology: 'constricted_pneumatic_blowhole_shaft',
        waveRegime: 'infragravity_sneaker_wave_group_22s',
      });

      expect(result.safetyStatus).toBe(
        'abort_pneumatic_piston_seal_and_blowhole_eruption'
      );
      expect(result.portalPistonSealProbability).toBeGreaterThanOrEqual(0.55);
      expect(result.pneumaticOverpressureKpa).toBeGreaterThanOrEqual(45);
      expect(result.reboundSurgeVelocityMs).toBeGreaterThanOrEqual(6.5);
      expect(result.swellSetTimingProtocol).toMatch(/60%/i);
      expect(result.barotraumaAndClapotisAdvisory).toMatch(/clapotis/i);
    });
  });
});
