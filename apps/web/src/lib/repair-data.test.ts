import { describe, it, expect } from 'vitest';
import {
  getAllRepairServices,
  getRepairServicesByCategory,
  calculateRepairEstimate,
  filterRepairServices,
  getAllRepairCareTips,
} from './repair-data';

describe('repair-data catalog and helper functions', () => {
  describe('getAllRepairServices', () => {
    it('returns all 12 defined repair services across four categories', () => {
      const services = getAllRepairServices();
      expect(services).toHaveLength(12);

      // Verify categories representation
      const categories = new Set(services.map((s) => s.category));
      expect(categories).toContain('Tents & Shelters');
      expect(categories).toContain('Apparel & Outerwear');
      expect(categories).toContain('Packs & Bags');
      expect(categories).toContain('Winter Gear');

      // Tents & Shelters (4)
      const seamSealing = services.find((s) => s.name === 'Seam Sealing & Waterproofing');
      expect(seamSealing).toBeDefined();
      expect(seamSealing?.category).toBe('Tents & Shelters');
      expect(seamSealing?.basePrice).toBe(35);
      expect(seamSealing?.turnaroundDays).toBe(4);

      const tentZipper = services.find((s) => s.name === 'Zipper Slider & Coil Replacement');
      expect(tentZipper).toBeDefined();
      expect(tentZipper?.category).toBe('Tents & Shelters');
      expect(tentZipper?.basePrice).toBe(25);
      expect(tentZipper?.turnaroundDays).toBe(3);

      const meshPatching = services.find((s) => s.name === 'Mesh & Canopy Patching');
      expect(meshPatching).toBeDefined();
      expect(meshPatching?.basePrice).toBe(30);
      expect(meshPatching?.turnaroundDays).toBe(4);

      const poleSplint = services.find((s) => s.name === 'Pole Splint & Shock Cord Re-stringing');
      expect(poleSplint).toBeDefined();
      expect(poleSplint?.basePrice).toBe(20);
      expect(poleSplint?.turnaroundDays).toBe(2);

      // Apparel & Outerwear (3)
      const dwr = services.find((s) => s.name === 'DWR Technical Reproofing');
      expect(dwr).toBeDefined();
      expect(dwr?.category).toBe('Apparel & Outerwear');
      expect(dwr?.basePrice).toBe(30);
      expect(dwr?.turnaroundDays).toBe(3);

      const downRepair = services.find((s) => s.name === 'Down Baffle & Shell Tear Repair');
      expect(downRepair).toBeDefined();
      expect(downRepair?.basePrice).toBe(40);
      expect(downRepair?.turnaroundDays).toBe(5);

      const waterproofZipper = services.find((s) => s.name === 'Waterproof Zipper Replacement');
      expect(waterproofZipper).toBeDefined();
      expect(waterproofZipper?.basePrice).toBe(35);
      expect(waterproofZipper?.turnaroundDays).toBe(4);

      // Packs & Bags (3)
      const packZipper = services.find((s) => s.name === 'Heavy-Duty Zipper Re-stitching');
      expect(packZipper).toBeDefined();
      expect(packZipper?.category).toBe('Packs & Bags');
      expect(packZipper?.basePrice).toBe(25);
      expect(packZipper?.turnaroundDays).toBe(4);

      const buckle = services.find((s) => s.name === 'Buckle & Webbing Strap Replacement');
      expect(buckle).toBeDefined();
      expect(buckle?.basePrice).toBe(15);
      expect(buckle?.turnaroundDays).toBe(2);

      const frame = services.find((s) => s.name === 'Internal Frame Re-alignment');
      expect(frame).toBeDefined();
      expect(frame?.basePrice).toBe(30);
      expect(frame?.turnaroundDays).toBe(3);

      // Winter Gear (2)
      const waxEdge = services.find((s) => s.name === 'Ski & Snowboard Hot Wax & Edge Sharpening');
      expect(waxEdge).toBeDefined();
      expect(waxEdge?.category).toBe('Winter Gear');
      expect(waxEdge?.basePrice).toBe(45);
      expect(waxEdge?.turnaroundDays).toBe(2);

      const ptex = services.find((s) => s.name === 'P-Tex Base Gouge Repair');
      expect(ptex).toBeDefined();
      expect(ptex?.basePrice).toBe(50);
      expect(ptex?.turnaroundDays).toBe(4);
    });

    it('ensures each repair service has required schema fields populated', () => {
      const services = getAllRepairServices();
      for (const service of services) {
        expect(service.id).toBeTruthy();
        expect(service.name).toBeTruthy();
        expect(service.category).toBeTruthy();
        expect(service.basePrice).toBeGreaterThan(0);
        expect(service.turnaroundDays).toBeGreaterThan(0);
        expect(service.description).toBeTruthy();
        expect(Array.isArray(service.includedWork)).toBe(true);
        expect(service.includedWork.length).toBeGreaterThan(0);
        expect(Array.isArray(service.commonIssues)).toBe(true);
        expect(service.commonIssues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getRepairServicesByCategory', () => {
    it('filters services by specific category', () => {
      const tents = getRepairServicesByCategory('Tents & Shelters');
      expect(tents).toHaveLength(4);
      expect(tents.every((s) => s.category === 'Tents & Shelters')).toBe(true);

      const apparel = getRepairServicesByCategory('Apparel & Outerwear');
      expect(apparel).toHaveLength(3);
      expect(apparel.every((s) => s.category === 'Apparel & Outerwear')).toBe(true);

      const packs = getRepairServicesByCategory('Packs & Bags');
      expect(packs).toHaveLength(3);
      expect(packs.every((s) => s.category === 'Packs & Bags')).toBe(true);

      const winter = getRepairServicesByCategory('Winter Gear');
      expect(winter).toHaveLength(2);
      expect(winter.every((s) => s.category === 'Winter Gear')).toBe(true);
    });

    it('returns all services when category is All or empty', () => {
      expect(getRepairServicesByCategory('All')).toHaveLength(12);
      expect(getRepairServicesByCategory('')).toHaveLength(12);
    });
  });

  describe('calculateRepairEstimate', () => {
    it('calculates in-store fulfillment estimate with free shipping', () => {
      const fixedDate = new Date('2026-10-01T12:00:00Z');
      const estimate = calculateRepairEstimate('tent-zipper-replacement', 'in_store', fixedDate);

      expect(estimate.serviceId).toBe('tent-zipper-replacement');
      expect(estimate.serviceName).toBe('Zipper Slider & Coil Replacement');
      expect(estimate.fulfillmentMethod).toBe('in_store');
      expect(estimate.basePrice).toBe(25);
      expect(estimate.shippingFee).toBe(0);
      expect(estimate.totalPrice).toBe(25);
      expect(estimate.turnaroundDays).toBe(3);
      expect(estimate.estimatedCompletionDate).toBeTruthy();
    });

    it('calculates mail-in fulfillment estimate with $10 shipping fee', () => {
      const fixedDate = new Date('2026-10-01T12:00:00Z');
      const estimate = calculateRepairEstimate('tent-zipper-replacement', 'mail_in', fixedDate);

      expect(estimate.serviceId).toBe('tent-zipper-replacement');
      expect(estimate.serviceName).toBe('Zipper Slider & Coil Replacement');
      expect(estimate.fulfillmentMethod).toBe('mail_in');
      expect(estimate.basePrice).toBe(25);
      expect(estimate.shippingFee).toBe(10);
      expect(estimate.totalPrice).toBe(35);
      expect(estimate.turnaroundDays).toBe(3);
      expect(estimate.estimatedCompletionDate).toBeTruthy();
    });

    it('throws error when serviceId is not recognized', () => {
      expect(() => calculateRepairEstimate('invalid-id', 'in_store')).toThrow(
        /Repair service not found/
      );
    });
  });

  describe('filterRepairServices', () => {
    it('returns all services for empty query and all categories', () => {
      expect(filterRepairServices('')).toHaveLength(12);
      expect(filterRepairServices('   ', 'All')).toHaveLength(12);
    });

    it('filters services by name case-insensitively', () => {
      const results = filterRepairServices('zipper');
      // Tent zipper, apparel zipper, pack zipper
      expect(results.length).toBeGreaterThanOrEqual(3);
      for (const service of results) {
        const matchesName = service.name.toLowerCase().includes('zipper');
        const matchesIssue = service.commonIssues.some((issue) =>
          issue.toLowerCase().includes('zipper')
        );
        expect(matchesName || matchesIssue).toBe(true);
      }
    });

    it('filters services by common issues', () => {
      expect(filterRepairServices('leaks').length).toBeGreaterThanOrEqual(1);
    });

    it('filters by both category and query', () => {
      const results = filterRepairServices('zipper', 'Tents & Shelters');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Zipper Slider & Coil Replacement');
    });

    it('returns empty array when no services match', () => {
      expect(filterRepairServices('UnobtainiumSubmarine')).toHaveLength(0);
    });
  });

  describe('getAllRepairCareTips', () => {
    it('returns all 4 preventative care tips', () => {
      const tips = getAllRepairCareTips();
      expect(tips).toHaveLength(4);

      const titles = tips.map((t) => t.title.toLowerCase());
      expect(titles.some((t) => t.includes('dwr'))).toBe(true);
      expect(titles.some((t) => t.includes('tent drying') || t.includes('mildew'))).toBe(true);
      expect(titles.some((t) => t.includes('zipper'))).toBe(true);
      expect(titles.some((t) => t.includes('down') || t.includes('sleeping bag'))).toBe(true);

      for (const tip of tips) {
        expect(tip.id).toBeTruthy();
        expect(tip.title).toBeTruthy();
        expect(tip.category).toBeTruthy();
        expect(tip.summary).toBeTruthy();
        expect(tip.recommendation).toBeTruthy();
      }
    });
  });
});
