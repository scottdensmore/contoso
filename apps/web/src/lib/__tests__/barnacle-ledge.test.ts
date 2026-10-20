import { describe, it, expect } from 'vitest';
import {
  BARNACLE_LEDGE_SITES,
  filterBarnacleLedgeSites,
  calculateBarnacleLedge,
  getBarnacleLedgeGearChecklist,
  type BarnacleLedgeInput,
} from '../barnacle-ledge';

describe('barnacle-ledge domain library', () => {
  describe('BARNACLE_LEDGE_SITES catalog', () => {
    it('exports all 4 real-world intertidal barnacle-encrusted basalt ledge & sabellariid worm-reef zones with complete metadata', () => {
      expect(BARNACLE_LEDGE_SITES).toHaveLength(4);

      const ids = BARNACLE_LEDGE_SITES.map((s) => s.id);
      expect(ids).toEqual([
        'cape-perpetua-yachats-basalt-bench-oregon',
        'duckpool-bude-sabellaria-reef-cornwall-uk',
        'west-coast-trail-owen-point-shelf-bc-canada',
        'cabo-percebes-costa-da-morte-galicia-spain',
      ]);

      const capePerpetua = BARNACLE_LEDGE_SITES.find(
        (s) => s.id === 'cape-perpetua-yachats-basalt-bench-oregon'
      );
      expect(capePerpetua).toBeDefined();
      expect(capePerpetua?.name).toBe(
        "Cape Perpetua & Thor's Well Basalt Mussel-Barnacle Bench"
      );
      expect(capePerpetua?.coastlineSector).toBe(
        'Siuslaw National Forest Coast'
      );
      expect(capePerpetua?.country).toBe('USA');
      expect(capePerpetua?.region).toBe('Oregon');
      expect(capePerpetua?.elevationMeters).toBe(2);
      expect(capePerpetua?.substrateType).toBe('balanus-mussel-basalt-bench');

      const duckpool = BARNACLE_LEDGE_SITES.find(
        (s) => s.id === 'duckpool-bude-sabellaria-reef-cornwall-uk'
      );
      expect(duckpool).toBeDefined();
      expect(duckpool?.name).toBe(
        'Duckpool & Bude Intertidal Sabellaria alveolata Honeycomb Worm-Reef'
      );
      expect(duckpool?.coastlineSector).toBe('North Cornwall Atlantic Coast');
      expect(duckpool?.country).toBe('UK');
      expect(duckpool?.region).toBe('England');
      expect(duckpool?.elevationMeters).toBe(1);
      expect(duckpool?.substrateType).toBe('sabellariid-honeycomb-worm-reef');

      const owenPoint = BARNACLE_LEDGE_SITES.find(
        (s) => s.id === 'west-coast-trail-owen-point-shelf-bc-canada'
      );
      expect(owenPoint).toBeDefined();
      expect(owenPoint?.name).toBe(
        'Owen Point & Thrasher Cove Wave-Cut Porphyra-Barnacle Shelf'
      );
      expect(owenPoint?.coastlineSector).toBe(
        'Pacific Rim National Park Reserve'
      );
      expect(owenPoint?.country).toBe('Canada');
      expect(owenPoint?.region).toBe('Vancouver Island, BC');
      expect(owenPoint?.elevationMeters).toBe(3);
      expect(owenPoint?.substrateType).toBe('porphyra-ulva-glazed-shelf');

      const caboPercebes = BARNACLE_LEDGE_SITES.find(
        (s) => s.id === 'cabo-percebes-costa-da-morte-galicia-spain'
      );
      expect(caboPercebes).toBeDefined();
      expect(caboPercebes?.name).toBe(
        'Roncudo & Cabo Vilán Gooseneck-Barnacle (Percebe) Surge Ledges'
      );
      expect(caboPercebes?.coastlineSector).toBe('Costa da Morte, A Coruña');
      expect(caboPercebes?.country).toBe('Spain');
      expect(caboPercebes?.region).toBe('Galicia');
      expect(caboPercebes?.elevationMeters).toBe(4);
      expect(caboPercebes?.substrateType).toBe(
        'pollicipes-gooseneck-surge-channel'
      );

      for (const site of BARNACLE_LEDGE_SITES) {
        expect(site.coastlineSector.length).toBeGreaterThan(2);
        expect(site.region.length).toBeGreaterThan(2);
        expect(Number.isFinite(site.latitude)).toBe(true);
        expect(Number.isFinite(site.longitude)).toBe(true);
        expect(site.barnacleCoverPct).toBeGreaterThanOrEqual(0);
        expect(site.barnacleCoverPct).toBeLessThanOrEqual(100);
        expect(site.sabellariidFragilityScore).toBeGreaterThanOrEqual(0);
        expect(site.sabellariidFragilityScore).toBeLessThanOrEqual(100);
        expect(site.maxInfragravityRunupM).toBeGreaterThanOrEqual(0.5);
        expect(site.maxInfragravityRunupM).toBeLessThanOrEqual(10);
        expect(['moderate', 'challenging', 'extreme']).toContain(
          site.difficulty
        );
        expect(site.bestSeason.length).toBeGreaterThan(2);
        expect(site.hazards.length).toBeGreaterThanOrEqual(2);
        expect(site.traversalProtocol.length).toBeGreaterThan(5);
        expect(site.description.length).toBeGreaterThan(15);
      }
    });
  });

  describe('filterBarnacleLedgeSites', () => {
    it('filters sites by country, substrateType, difficulty, and search query', () => {
      expect(filterBarnacleLedgeSites(BARNACLE_LEDGE_SITES, {})).toHaveLength(
        4
      );

      const byCountry = filterBarnacleLedgeSites(BARNACLE_LEDGE_SITES, {
        country: 'UK',
      });
      expect(byCountry).toHaveLength(1);
      expect(byCountry[0].id).toBe('duckpool-bude-sabellaria-reef-cornwall-uk');

      const bySubstrate = filterBarnacleLedgeSites(BARNACLE_LEDGE_SITES, {
        substrateType: 'porphyra-ulva-glazed-shelf',
      });
      expect(bySubstrate).toHaveLength(1);
      expect(bySubstrate[0].id).toBe(
        'west-coast-trail-owen-point-shelf-bc-canada'
      );

      const byDifficulty = filterBarnacleLedgeSites(BARNACLE_LEDGE_SITES, {
        difficulty: 'extreme',
      });
      expect(byDifficulty.length).toBeGreaterThanOrEqual(1);
      expect(byDifficulty.every((s) => s.difficulty === 'extreme')).toBe(true);

      const bySearch = filterBarnacleLedgeSites(BARNACLE_LEDGE_SITES, {
        search: 'Perpetua',
      });
      expect(bySearch).toHaveLength(1);
      expect(bySearch[0].id).toBe('cape-perpetua-yachats-basalt-bench-oregon');
    });
  });

  describe('calculateBarnacleLedge', () => {
    const validBase: BarnacleLedgeInput = {
      swellHeightM: 0.6,
      swellPeriodSec: 6,
      algalBiofilmCoverPct: 8,
      sabellariidColonyDensityPct: 5,
      ledgeFreeboardM: 4.2,
    };

    it('validates input bounds and throws descriptive errors for out-of-range or non-finite values', () => {
      expect(() =>
        calculateBarnacleLedge({ ...validBase, swellHeightM: 0.1 })
      ).toThrow(/swellHeightM/i);
      expect(() =>
        calculateBarnacleLedge({ ...validBase, swellHeightM: 6.6 })
      ).toThrow(/swellHeightM/i);
      expect(() =>
        calculateBarnacleLedge({ ...validBase, swellHeightM: NaN })
      ).toThrow(/swellHeightM/i);

      expect(() =>
        calculateBarnacleLedge({ ...validBase, swellPeriodSec: 3.5 })
      ).toThrow(/swellPeriodSec/i);
      expect(() =>
        calculateBarnacleLedge({ ...validBase, swellPeriodSec: 22.5 })
      ).toThrow(/swellPeriodSec/i);

      expect(() =>
        calculateBarnacleLedge({ ...validBase, algalBiofilmCoverPct: -1 })
      ).toThrow(/algalBiofilmCoverPct/i);
      expect(() =>
        calculateBarnacleLedge({ ...validBase, algalBiofilmCoverPct: 101 })
      ).toThrow(/algalBiofilmCoverPct/i);

      expect(() =>
        calculateBarnacleLedge({
          ...validBase,
          sabellariidColonyDensityPct: -1,
        })
      ).toThrow(/sabellariidColonyDensityPct/i);
      expect(() =>
        calculateBarnacleLedge({
          ...validBase,
          sabellariidColonyDensityPct: 101,
        })
      ).toThrow(/sabellariidColonyDensityPct/i);

      expect(() =>
        calculateBarnacleLedge({ ...validBase, ledgeFreeboardM: 0.05 })
      ).toThrow(/ledgeFreeboardM/i);
      expect(() =>
        calculateBarnacleLedge({ ...validBase, ledgeFreeboardM: 5.1 })
      ).toThrow(/ledgeFreeboardM/i);
    });

    it('computes low risk level and step-bare-basalt-avoid-worm-tubes strategy under calm swell, high freeboard, and minimal algal/worm cover', () => {
      const analysis = calculateBarnacleLedge(validBase);

      expect(analysis.riskLevel).toBe('low');
      expect(analysis.traversalStrategy).toBe(
        'step-bare-basalt-avoid-worm-tubes'
      );
      expect(analysis.infragravityOverwashProbabilityPct).toBeGreaterThanOrEqual(
        1
      );
      expect(analysis.infragravityOverwashProbabilityPct).toBeLessThan(28);
      expect(analysis.barnacleLacerationShearScore).toBeGreaterThanOrEqual(5);
      expect(analysis.barnacleLacerationShearScore).toBeLessThan(38);
      expect(analysis.biogenicReefCrushDamagePct).toBeGreaterThanOrEqual(0);
      expect(analysis.biogenicReefCrushDamagePct).toBeLessThan(30);
      expect(analysis.safeTideWindowMinutes).toBeGreaterThan(85);
      expect(analysis.safeTideWindowMinutes).toBeLessThanOrEqual(180);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('increases infragravityOverwashProbabilityPct, barnacleLacerationShearScore, and biogenicReefCrushDamagePct and decreases safeTideWindowMinutes under heavy swell, dense algae/worm colonies, and low freeboard', () => {
      const mild = calculateBarnacleLedge(validBase);
      const severe = calculateBarnacleLedge({
        swellHeightM: 5.4,
        swellPeriodSec: 19,
        algalBiofilmCoverPct: 88,
        sabellariidColonyDensityPct: 82,
        ledgeFreeboardM: 0.5,
      });

      expect(severe.infragravityOverwashProbabilityPct).toBeGreaterThan(
        mild.infragravityOverwashProbabilityPct
      );
      expect(severe.barnacleLacerationShearScore).toBeGreaterThan(
        mild.barnacleLacerationShearScore
      );
      expect(severe.biogenicReefCrushDamagePct).toBeGreaterThan(
        mild.biogenicReefCrushDamagePct
      );
      expect(severe.safeTideWindowMinutes).toBeLessThan(
        mild.safeTideWindowMinutes
      );
    });

    it('computes moderate risk level and carbide-stud-felt-bootie-low-stance strategy when moderate thresholds are met', () => {
      const analysis = calculateBarnacleLedge({
        swellHeightM: 1.8,
        swellPeriodSec: 11,
        algalBiofilmCoverPct: 35,
        sabellariidColonyDensityPct: 28,
        ledgeFreeboardM: 2.8,
      });

      expect(analysis.riskLevel).toBe('moderate');
      expect(analysis.traversalStrategy).toBe(
        'carbide-stud-felt-bootie-low-stance'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes high risk level and wait-ebb-slack-belay-surge-gulley strategy when high thresholds are met', () => {
      const analysis = calculateBarnacleLedge({
        swellHeightM: 3.4,
        swellPeriodSec: 15,
        algalBiofilmCoverPct: 62,
        sabellariidColonyDensityPct: 55,
        ledgeFreeboardM: 1.6,
      });

      expect(analysis.riskLevel).toBe('high');
      expect(analysis.traversalStrategy).toBe(
        'wait-ebb-slack-belay-surge-gulley'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it('computes critical risk level and abort-infragravity-set-sweep-hazard strategy under extreme infragravity overwash or reef crush/laceration hazard', () => {
      const analysis = calculateBarnacleLedge({
        swellHeightM: 5.4,
        swellPeriodSec: 19,
        algalBiofilmCoverPct: 88,
        sabellariidColonyDensityPct: 82,
        ledgeFreeboardM: 0.5,
      });

      expect(analysis.riskLevel).toBe('critical');
      expect(analysis.traversalStrategy).toBe(
        'abort-infragravity-set-sweep-hazard'
      );
      expect(analysis.warnings.length).toBeGreaterThan(0);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('getBarnacleLedgeGearChecklist', () => {
    it('returns at least 6 gear items spanning kevlar-cut-protection, intertidal-traction, surge-flotation, and marine-wound-care', () => {
      const gear = getBarnacleLedgeGearChecklist();
      expect(gear.length).toBeGreaterThanOrEqual(6);

      const categories = new Set(gear.map((item) => item.category));
      expect(categories.has('kevlar-cut-protection')).toBe(true);
      expect(categories.has('intertidal-traction')).toBe(true);
      expect(categories.has('surge-flotation')).toBe(true);
      expect(categories.has('marine-wound-care')).toBe(true);

      for (const item of gear) {
        expect(item.id.length).toBeGreaterThan(2);
        expect(item.name.length).toBeGreaterThan(5);
        expect(typeof item.essential).toBe('boolean');
        expect(item.rationale.length).toBeGreaterThan(15);
      }
    });
  });
});
