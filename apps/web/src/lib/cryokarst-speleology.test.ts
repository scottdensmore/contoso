import { describe, it, expect } from 'vitest';
import {
  getCryokarstSites,
  getCryokarstSiteById,
  getCryokarstGearChecklist,
  calculateCryokarstDynamics,
  type CryokarstDynamicsQuery,
} from './cryokarst-speleology';

describe('cryokarst-speleology library', () => {
  describe('site catalog and lookup', () => {
    it('returns all 5 iconic cryokarst exploration sites', () => {
      const sites = getCryokarstSites();
      expect(sites).toHaveLength(5);
      expect(sites.map((s) => s.id)).toEqual([
        'matanuska-glacier-moulin-chamber',
        'root-glacier-cryokarst-conduit',
        'athabasca-glacier-crevasse-chasm',
        'gorner-glacier-zermatt-cryokarst',
        'palmer-glacier-fumarole-ice-caves',
      ]);
    });

    it('filters sites correctly by conduitType', () => {
      const moulinSites = getCryokarstSites('vertical_moulin_shaft');
      expect(moulinSites).toHaveLength(1);
      expect(moulinSites[0].id).toBe('matanuska-glacier-moulin-chamber');

      const fumaroleSites = getCryokarstSites('volcanic_fumarole_melt_cave');
      expect(fumaroleSites).toHaveLength(1);
      expect(fumaroleSites[0].id).toBe('palmer-glacier-fumarole-ice-caves');
    });

    it('finds a site by id', () => {
      const site = getCryokarstSiteById('root-glacier-cryokarst-conduit');
      expect(site).toBeDefined();
      expect(site?.title).toBe('Root Glacier Subglacial Fluvial Drainage Cave');
      expect(site?.range).toBe('Wrangell Mountains');
      expect(site?.depthMeters).toBe(45);
    });

    it('returns undefined for an unknown site id', () => {
      const site = getCryokarstSiteById('non-existent-site');
      expect(site).toBeUndefined();
    });
  });

  describe('mandatory cryokarst gear checklist', () => {
    it('returns all 6 mandatory items', () => {
      const checklist = getCryokarstGearChecklist();
      expect(checklist).toHaveLength(6);
      expect(checklist.every((item) => item.mandatory)).toBe(true);

      const ids = checklist.map((i) => i.id);
      expect(ids).toContain('sub-zero-dry-caving-suit');
      expect(ids).toContain('dual-tube-stainless-ice-screws');
      expect(ids).toContain('abalakov-v-thread-hooker');
      expect(ids).toContain('subglacial-multi-gas-detector');
      expect(ids).toContain('watertight-submersible-headlamp');
      expect(ids).toContain('cryo-traction-ice-crampons');
    });
  });

  describe('calculateCryokarstDynamics', () => {
    it('calculates dynamics correctly for default parameters on Matanuska Glacier', () => {
      const query: CryokarstDynamicsQuery = {
        siteId: 'matanuska-glacier-moulin-chamber',
        conduitType: 'vertical_moulin_shaft',
        iceStability: 'temperate_firn_dynamic',
        anchorSystem: 'v_thread_abalakov',
        ambientIceTempC: -2.0,
        descentDepthMeters: 45,
        diurnalSolarExposureHours: 4,
        teamSize: 3,
      };

      const result = calculateCryokarstDynamics(query);
      expect(result.siteTitle).toBe('Matanuska Glacier Moulin Cathedral & Blue Ice Cavern');
      expect(result.anchorCreepRateMmHr).toBe(1.4);
      expect(result.thermalAblationVelocityMmDay).toBe(19.0);
      expect(result.jokulhlaupOutburstRiskIndex).toBe(0.32);
      expect(result.safetyTriage).toBe('nominal_stable_cold_ice');
      expect(result.anchorRiggingAdvisory).toContain('V-Thread Abalakov');
      expect(result.subglacialEscapeProtocol).toContain('STANDARD CAVING PROTOCOL');
    });

    it('calculates critical safety triage when iceStability is thermal_ablation_unstable (Palmer Glacier)', () => {
      const query: CryokarstDynamicsQuery = {
        siteId: 'palmer-glacier-fumarole-ice-caves',
        conduitType: 'volcanic_fumarole_melt_cave',
        iceStability: 'thermal_ablation_unstable',
        anchorSystem: 'standard_17cm',
        ambientIceTempC: 0.5,
        descentDepthMeters: 35,
        diurnalSolarExposureHours: 6,
        teamSize: 4,
      };

      const result = calculateCryokarstDynamics(query);
      expect(result.siteTitle).toBe('Mount Hood Palmer Glacier Fumarole Thermal Ice Caves');
      expect(result.safetyTriage).toBe('critical_ablation_collapse_danger');
      expect(result.thermalAblationVelocityMmDay).toBe(51.0);
      expect(result.subglacialEscapeProtocol).toContain('EMERGENCY EGRESS');
    });

    it('calculates caution triage when ambient ice temp is above -1.0C or risk index >= 0.40', () => {
      const query: CryokarstDynamicsQuery = {
        siteId: 'root-glacier-cryokarst-conduit',
        conduitType: 'horizontal_subglacial_tunnel',
        iceStability: 'temperate_firn_dynamic',
        anchorSystem: 'long_21cm',
        ambientIceTempC: -0.5,
        descentDepthMeters: 45,
        diurnalSolarExposureHours: 2,
        teamSize: 3,
      };

      const result = calculateCryokarstDynamics(query);
      expect(result.safetyTriage).toBe('caution_diurnal_melt_monitoring');
      expect(result.subglacialEscapeProtocol).toContain('ELEVATED SURGE CAUTION');
    });

    it('triggers critical triage and high creep warning when creep >= 3.5 mm/hr', () => {
      const query: CryokarstDynamicsQuery = {
        siteId: 'gorner-glacier-zermatt-cryokarst',
        conduitType: 'ice_siphon_sump_cave',
        iceStability: 'temperate_firn_dynamic',
        anchorSystem: 'standard_17cm',
        ambientIceTempC: 1.0,
        descentDepthMeters: 80,
        diurnalSolarExposureHours: 2,
        teamSize: 6,
      };

      const result = calculateCryokarstDynamics(query);
      expect(result.anchorCreepRateMmHr).toBeGreaterThanOrEqual(3.5);
      expect(result.safetyTriage).toBe('critical_ablation_collapse_danger');
      expect(result.anchorRiggingAdvisory).toContain('WARNING: High anchor creep rate');
    });
  });
});
