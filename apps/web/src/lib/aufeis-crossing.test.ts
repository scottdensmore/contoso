import { describe, it, expect } from 'vitest';
import {
  AUFEIS_SITES,
  AUFEIS_GEAR_CHECKLIST,
  getAllAufeisSites,
  getAufeisSiteById,
  filterAufeisSites,
  getAufeisGearChecklist,
  calculateAufeisCrossingSafety,
} from './aufeis-crossing';

describe('aufeis-crossing domain library', () => {
  describe('curated sites catalog', () => {
    it('exports 5 curated subarctic river aufeis sites with required fields', () => {
      const sites = getAllAufeisSites();
      expect(sites).toHaveLength(5);
      expect(sites).toEqual(AUFEIS_SITES);

      const ids = sites.map((s) => s.id);
      expect(ids).toEqual([
        'canning-river-shublik-springs-aufeis',
        'firth-river-joe-creek-naled-corridor',
        'delta-river-black-rapids-overflow-sheet',
        'moma-valley-ulakhan-taryn-giant-naled',
        'macmillan-pass-hess-river-frost-blister',
      ]);

      for (const site of sites) {
        expect(site.name.length).toBeGreaterThan(5);
        expect(site.region.length).toBeGreaterThan(2);
        expect(site.country.length).toBeGreaterThan(2);
        expect(site.elevationMeters).toBeGreaterThan(0);
        expect(site.meanUpperCrustThicknessCm).toBeGreaterThan(0);
        expect(site.slushWaterLensDepthCm).toBeGreaterThanOrEqual(0);
        expect(site.hydrostaticHeadKpa).toBeGreaterThanOrEqual(0);
        expect(site.typicalCavitySpanM).toBeGreaterThan(0);
        expect(site.highlights.length).toBeGreaterThanOrEqual(2);
        expect(site.bestSeason.length).toBeGreaterThan(2);
      }
    });

    it('retrieves a site by id or returns undefined for unknown id', () => {
      const canning = getAufeisSiteById('canning-river-shublik-springs-aufeis');
      expect(canning).toBeDefined();
      expect(canning?.name).toBe(
        'Canning River & Shublik Springs Perennial Aufeis Field'
      );
      expect(canning?.elevationMeters).toBe(420);
      expect(canning?.meanUpperCrustThicknessCm).toBe(26);

      expect(getAufeisSiteById('non-existent-aufeis')).toBeUndefined();
    });

    it('filters sites by morphology, overflowState, and traversalMode', () => {
      expect(filterAufeisSites()).toHaveLength(5);

      const perennialNaled = filterAufeisSites({
        morphology: 'perennial_tundra_spring_naled',
      });
      expect(perennialNaled.map((s) => s.id)).toEqual([
        'canning-river-shublik-springs-aufeis',
        'moma-valley-ulakhan-taryn-giant-naled',
      ]);

      const activeFilm = filterAufeisSites({
        overflowState: 'active_sheet_overflow_film',
      });
      expect(activeFilm.map((s) => s.id)).toEqual([
        'firth-river-joe-creek-naled-corridor',
      ]);

      const belayedTeam = filterAufeisSites({
        traversalMode: 'belayed_ice_screw_probe_team',
      });
      expect(belayedTeam.map((s) => s.id)).toEqual([
        'macmillan-pass-hess-river-frost-blister',
      ]);

      const combined = filterAufeisSites({
        morphology: 'canyon_confinement_stepped_overflow',
        overflowState: 'pressurized_sub_crust_slush_lens',
        traversalMode: 'boot_microspike_pulk_tow',
      });
      expect(combined.map((s) => s.id)).toEqual([
        'delta-river-black-rapids-overflow-sheet',
      ]);
    });
  });

  describe('mandatory gear checklist', () => {
    it('exports 6 mandatory ice sounding & slush accretion gear items', () => {
      const checklist = getAufeisGearChecklist();
      expect(checklist).toHaveLength(6);
      expect(checklist).toEqual(AUFEIS_GEAR_CHECKLIST);

      expect(checklist.map((item) => item.id)).toEqual([
        'graduated-chisel-tip-ice-sounding-bar',
        'vapor-barrier-neoprene-insulated-overboots',
        'ptfe-fluoropolymer-ski-base-anti-ice-scraper',
        'retractable-dual-ice-awls-and-throw-bag',
        'tubular-22cm-express-ice-screws-and-v-threader',
        'sealed-drybag-pulk-hull-and-floating-tow-tether',
      ]);

      for (const item of checklist) {
        expect(item.mandatory).toBe(true);
        expect(item.weightGrams).toBeGreaterThan(0);
        expect(item.rationale.length).toBeGreaterThan(10);
      }
    });
  });

  describe('calculateAufeisCrossingSafety', () => {
    it('validates input boundaries and throws descriptive errors', () => {
      const base = {
        upperCrustThicknessCm: 25,
        slushWaterLensDepthCm: 8,
        ambientAirTempC: -18,
        hydrostaticHeadKpa: 12,
        travelerPlusPulkLoadKg: 95,
        cavitySpanM: 0.6,
      };

      expect(() =>
        calculateAufeisCrossingSafety({ ...base, upperCrustThicknessCm: 0 })
      ).toThrow(/upperCrustThicknessCm/i);
      expect(() =>
        calculateAufeisCrossingSafety({ ...base, upperCrustThicknessCm: 151 })
      ).toThrow(/upperCrustThicknessCm/i);

      expect(() =>
        calculateAufeisCrossingSafety({ ...base, slushWaterLensDepthCm: -1 })
      ).toThrow(/slushWaterLensDepthCm/i);
      expect(() =>
        calculateAufeisCrossingSafety({ ...base, slushWaterLensDepthCm: 255 })
      ).toThrow(/slushWaterLensDepthCm/i);

      expect(() =>
        calculateAufeisCrossingSafety({ ...base, ambientAirTempC: -60 })
      ).toThrow(/ambientAirTempC/i);
      expect(() =>
        calculateAufeisCrossingSafety({ ...base, ambientAirTempC: 18 })
      ).toThrow(/ambientAirTempC/i);

      expect(() =>
        calculateAufeisCrossingSafety({ ...base, hydrostaticHeadKpa: -5 })
      ).toThrow(/hydrostaticHeadKpa/i);
      expect(() =>
        calculateAufeisCrossingSafety({ ...base, hydrostaticHeadKpa: 155 })
      ).toThrow(/hydrostaticHeadKpa/i);

      expect(() =>
        calculateAufeisCrossingSafety({ ...base, travelerPlusPulkLoadKg: 25 })
      ).toThrow(/travelerPlusPulkLoadKg/i);
      expect(() =>
        calculateAufeisCrossingSafety({ ...base, travelerPlusPulkLoadKg: 260 })
      ).toThrow(/travelerPlusPulkLoadKg/i);

      expect(() =>
        calculateAufeisCrossingSafety({ ...base, cavitySpanM: -0.5 })
      ).toThrow(/cavitySpanM/i);
      expect(() =>
        calculateAufeisCrossingSafety({ ...base, cavitySpanM: 16 })
      ).toThrow(/cavitySpanM/i);
    });

    it('computes nominal_cryolocked_laminar_sheet for thick perennial naled with dry cryolock', () => {
      const res = calculateAufeisCrossingSafety({
        upperCrustThicknessCm: 28,
        slushWaterLensDepthCm: 3,
        ambientAirTempC: -20,
        hydrostaticHeadKpa: 10,
        travelerPlusPulkLoadKg: 90,
        cavitySpanM: 0.5,
        morphology: 'perennial_tundra_spring_naled',
        overflowState: 'vitreous_dry_cryolock',
      });

      expect(res.safetyStatus).toBe('nominal_cryolocked_laminar_sheet');
      expect(res.effectiveCrustBearingMargin).toBeGreaterThanOrEqual(1.85);
      expect(res.slushBreakthroughProbability).toBeLessThan(0.26);
      expect(res.skiBootIceAccretionRateMmMin).toBeLessThan(4.0);
      expect(res.cavityVaultCollapseRiskPercent).toBeLessThan(32);
      expect(res.overflowRoutingProtocol).toMatch(/sounding-bar/i);
      expect(res.slushExtractionAndDeicingAdvisory).toMatch(/PTFE/i);
    });

    it('computes caution_overflow_slush_accretion_hazard for active sheet overflow film and moderate slush lens', () => {
      const res = calculateAufeisCrossingSafety({
        upperCrustThicknessCm: 16,
        slushWaterLensDepthCm: 24,
        ambientAirTempC: -16,
        hydrostaticHeadKpa: 22,
        travelerPlusPulkLoadKg: 95,
        cavitySpanM: 1.2,
        morphology: 'braided_gravel_bar_sheet_icing',
        overflowState: 'active_sheet_overflow_film',
      });

      expect(res.safetyStatus).toBe('caution_overflow_slush_accretion_hazard');
      expect(res.skiBootIceAccretionRateMmMin).toBeGreaterThanOrEqual(4.0);
      expect(res.overflowRoutingProtocol).toMatch(/frost blisters|yellowed overflow aprons/i);
      expect(res.slushExtractionAndDeicingAdvisory).toMatch(/dry-snow/i);
    });

    it('computes abort_pressurized_lens_or_cavity_collapse for pressurized frost blister or hollow cavity vault', () => {
      const res = calculateAufeisCrossingSafety({
        upperCrustThicknessCm: 7,
        slushWaterLensDepthCm: 68,
        ambientAirTempC: -24,
        hydrostaticHeadKpa: 68,
        travelerPlusPulkLoadKg: 110,
        cavitySpanM: 4.2,
        morphology: 'pressurized_groundwater_frost_blister',
        overflowState: 'hollow_drained_air_cavity_vault',
      });

      expect(res.safetyStatus).toBe(
        'abort_pressurized_lens_or_cavity_collapse'
      );
      expect(res.effectiveCrustBearingMargin).toBeLessThan(1.15);
      expect(res.cavityVaultCollapseRiskPercent).toBeGreaterThanOrEqual(62);
      expect(res.overflowRoutingProtocol).toMatch(/detour|abort/i);
      expect(res.slushExtractionAndDeicingAdvisory).toMatch(/floating pulk tether/i);
    });
  });
});
