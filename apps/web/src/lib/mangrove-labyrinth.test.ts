import { describe, it, expect } from 'vitest';
import {
  MANGROVE_LABYRINTH_SITES,
  MANGROVE_LABYRINTH_GEAR_CHECKLIST,
  getAllMangroveLabyrinthSites,
  getMangroveLabyrinthSiteById,
  filterMangroveLabyrinthSites,
  getMangroveLabyrinthGearChecklist,
  calculateMangroveLabyrinthNavigation,
} from './mangrove-labyrinth';

describe('mangrove-labyrinth domain library', () => {
  describe('curated sites catalog', () => {
    it('returns all 5 curated mangrove labyrinth sites with complete telemetry', () => {
      const sites = getAllMangroveLabyrinthSites();
      expect(sites).toHaveLength(5);
      expect(sites).toEqual(MANGROVE_LABYRINTH_SITES);

      const ids = sites.map((s) => s.id);
      expect(ids).toEqual([
        'everglades-hell-bay-labyrinth-waterway',
        'sundarbans-harbhanga-tidal-creek-nexus',
        'hinchinbrook-missionary-bay-mangrove-tunnels',
        'osa-sierpe-terraba-buttress-root-estuary',
        'iriomote-nakama-river-bruguiera-knee-root-creek',
      ]);

      for (const site of sites) {
        expect(site.name.length).toBeGreaterThan(10);
        expect(site.region.length).toBeGreaterThan(2);
        expect(site.country.length).toBeGreaterThan(2);
        expect(site.highlights.length).toBeGreaterThanOrEqual(2);
        expect(site.bestSeason.length).toBeGreaterThan(2);
      }
    });

    it('finds a site by id or returns undefined for unknown id', () => {
      const hellBay = getMangroveLabyrinthSiteById(
        'everglades-hell-bay-labyrinth-waterway'
      );
      expect(hellBay).toBeDefined();
      expect(hellBay?.name).toContain('Hell Bay');
      expect(hellBay?.rootMorphology).toBe('rhizophora_arching_prop_root_tangle');
      expect(hellBay?.typicalTidalRegime).toBe('high_slack_canopy_tunnel_float');
      expect(hellBay?.recommendedTraversalMode).toBe(
        'short_hull_sit_in_creek_kayak'
      );
      expect(hellBay?.propRootDensityStemsM2).toBe(14);
      expect(hellBay?.typicalCurrentVelocityKnots).toBe(0.6);
      expect(hellBay?.typicalWaterDepthOverMudCm).toBe(62);
      expect(hellBay?.anoxicSiltSinkDepthCm).toBe(35);
      expect(hellBay?.canopyClosurePercent).toBe(88);

      expect(getMangroveLabyrinthSiteById('non-existent-site')).toBeUndefined();
    });

    it('filters sites by rootMorphology, tidalRegime, and traversalMode', () => {
      expect(filterMangroveLabyrinthSites()).toHaveLength(5);

      const propRootSites = filterMangroveLabyrinthSites({
        rootMorphology: 'rhizophora_arching_prop_root_tangle',
      });
      expect(propRootSites).toHaveLength(1);
      expect(propRootSites[0].id).toBe('everglades-hell-bay-labyrinth-waterway');

      const highSlackSites = filterMangroveLabyrinthSites({
        tidalRegime: 'high_slack_canopy_tunnel_float',
      });
      expect(highSlackSites).toHaveLength(2);

      const kayakSites = filterMangroveLabyrinthSites({
        traversalMode: 'short_hull_sit_in_creek_kayak',
      });
      expect(kayakSites).toHaveLength(2);

      const combined = filterMangroveLabyrinthSites({
        tidalRegime: 'high_slack_canopy_tunnel_float',
        traversalMode: 'sup_finless_shallow_draft_poling',
      });
      expect(combined).toHaveLength(1);
      expect(combined[0].id).toBe(
        'hinchinbrook-missionary-bay-mangrove-tunnels'
      );
    });
  });

  describe('mandatory gear checklist', () => {
    it('returns all 6 mandatory mangrove labyrinth gear items', () => {
      const checklist = getMangroveLabyrinthGearChecklist();
      expect(checklist).toHaveLength(6);
      expect(checklist).toEqual(MANGROVE_LABYRINTH_GEAR_CHECKLIST);

      const ids = checklist.map((g) => g.id);
      expect(ids).toEqual([
        'kevlar-armored-cut-resistant-oyster-gloves-and-booties',
        'compact-115cm-double-blade-breakdown-tunnel-paddle',
        'sub-canopy-multi-gnss-breadcrumb-plotter-and-rheoscopic-compass',
        'biodegradable-reflective-reflective-clip-trail-markers'.replace(
          'reflective-reflective',
          'reflective-retro'
        ),
        'quick-release-tow-belt-and-floating-snag-pruning-saw',
        'sealed-permethrin-headnet-and-electrolyte-hydration-bladder',
      ]);

      for (const item of checklist) {
        expect(item.mandatory).toBe(true);
        expect(item.weightGrams).toBeGreaterThan(0);
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });

  describe('calculateMangroveLabyrinthNavigation', () => {
    it('validates input bounds and throws descriptive errors', () => {
      const valid = {
        propRootDensityStemsM2: 14,
        tidalCurrentVelocityKnots: 0.6,
        waterDepthOverMudCm: 65,
        anoxicSiltSinkDepthCm: 30,
        canopyClosurePercent: 75,
        tideStageHoursToLow: 4.0,
      };

      expect(() =>
        calculateMangroveLabyrinthNavigation({
          ...valid,
          propRootDensityStemsM2: 0.5,
        })
      ).toThrow(/propRootDensityStemsM2/i);

      expect(() =>
        calculateMangroveLabyrinthNavigation({
          ...valid,
          propRootDensityStemsM2: 121,
        })
      ).toThrow(/propRootDensityStemsM2/i);

      expect(() =>
        calculateMangroveLabyrinthNavigation({
          ...valid,
          tidalCurrentVelocityKnots: -0.1,
        })
      ).toThrow(/tidalCurrentVelocityKnots/i);

      expect(() =>
        calculateMangroveLabyrinthNavigation({
          ...valid,
          tidalCurrentVelocityKnots: 8.5,
        })
      ).toThrow(/tidalCurrentVelocityKnots/i);

      expect(() =>
        calculateMangroveLabyrinthNavigation({
          ...valid,
          waterDepthOverMudCm: -5,
        })
      ).toThrow(/waterDepthOverMudCm/i);

      expect(() =>
        calculateMangroveLabyrinthNavigation({
          ...valid,
          waterDepthOverMudCm: 360,
        })
      ).toThrow(/waterDepthOverMudCm/i);

      expect(() =>
        calculateMangroveLabyrinthNavigation({
          ...valid,
          anoxicSiltSinkDepthCm: 4,
        })
      ).toThrow(/anoxicSiltSinkDepthCm/i);

      expect(() =>
        calculateMangroveLabyrinthNavigation({
          ...valid,
          anoxicSiltSinkDepthCm: 185,
        })
      ).toThrow(/anoxicSiltSinkDepthCm/i);

      expect(() =>
        calculateMangroveLabyrinthNavigation({
          ...valid,
          canopyClosurePercent: -1,
        })
      ).toThrow(/canopyClosurePercent/i);

      expect(() =>
        calculateMangroveLabyrinthNavigation({
          ...valid,
          canopyClosurePercent: 101,
        })
      ).toThrow(/canopyClosurePercent/i);

      expect(() =>
        calculateMangroveLabyrinthNavigation({
          ...valid,
          tideStageHoursToLow: -0.2,
        })
      ).toThrow(/tideStageHoursToLow/i);

      expect(() =>
        calculateMangroveLabyrinthNavigation({
          ...valid,
          tideStageHoursToLow: 7.0,
        })
      ).toThrow(/tideStageHoursToLow/i);
    });

    it('computes nominal high-slack canopy corridor navigation metrics accurately', () => {
      const result = calculateMangroveLabyrinthNavigation({
        propRootDensityStemsM2: 12,
        tidalCurrentVelocityKnots: 0.5,
        waterDepthOverMudCm: 70,
        anoxicSiltSinkDepthCm: 25,
        canopyClosurePercent: 72,
        tideStageHoursToLow: 4.5,
        rootMorphology: 'bruguiera_buttress_knee_root_hummocks',
        tidalRegime: 'high_slack_canopy_tunnel_float',
      });

      expect(result.safetyStatus).toBe('nominal_high_slack_canopy_corridor');
      expect(result.effectiveChannelSpeedKmHr).toBeCloseTo(3.28, 2);
      expect(result.rootStrainerPinningRiskPercent).toBeCloseTo(26.6, 1);
      expect(result.anoxicMudEntrapmentProbability).toBeCloseTo(0.21, 2);
      expect(result.safeEbbExitWindowMinutes).toBe(220);
      expect(result.dendriticWayfindingProtocol).toMatch(/retro-reflective/i);
      expect(result.oysterArmorAndStrainerAdvisory).toMatch(/Crassostrea/i);
    });

    it('computes caution prop-root pinning and oyster laceration metrics accurately', () => {
      const result = calculateMangroveLabyrinthNavigation({
        propRootDensityStemsM2: 24,
        tidalCurrentVelocityKnots: 1.6,
        waterDepthOverMudCm: 48,
        anoxicSiltSinkDepthCm: 42,
        canopyClosurePercent: 86,
        tideStageHoursToLow: 3.0,
        rootMorphology: 'rhizophora_arching_prop_root_tangle',
        tidalRegime: 'ebb_tide_dendritic_channel_drain',
      });

      expect(result.safetyStatus).toBe(
        'caution_prop_root_pinning_and_oyster_laceration'
      );
      expect(result.rootStrainerPinningRiskPercent).toBeCloseTo(58.0, 1);
      expect(result.anoxicMudEntrapmentProbability).toBeCloseTo(0.27, 2);
      expect(result.safeEbbExitWindowMinutes).toBe(124);
      expect(result.dendriticWayfindingProtocol).toMatch(/tannin-floc/i);
      expect(result.oysterArmorAndStrainerAdvisory).toMatch(/Kevlar/i);
    });

    it('computes abort ebb stranding or anoxic silt entrapment metrics accurately', () => {
      const result = calculateMangroveLabyrinthNavigation({
        propRootDensityStemsM2: 38,
        tidalCurrentVelocityKnots: 2.8,
        waterDepthOverMudCm: 18,
        anoxicSiltSinkDepthCm: 85,
        canopyClosurePercent: 92,
        tideStageHoursToLow: 0.8,
        rootMorphology: 'submerged_oyster_encrusted_deadfall_snag',
        tidalRegime: 'spring_low_exposed_sulfidic_mud_plug',
      });

      expect(result.safetyStatus).toBe(
        'abort_ebb_stranding_or_anoxic_silt_entrapment'
      );
      expect(result.rootStrainerPinningRiskPercent).toBe(99);
      expect(result.anoxicMudEntrapmentProbability).toBeCloseTo(0.92, 2);
      expect(result.safeEbbExitWindowMinutes).toBe(10);
      expect(result.oysterArmorAndStrainerAdvisory).toMatch(
        /thixotropic sulfidic silt/i
      );
    });
  });
});
