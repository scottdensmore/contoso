import { describe, it, expect } from 'vitest';
import {
  getAllTradeInCategories,
  getEligibleBrands,
  calculateTradeInValue,
  submitTradeIn,
  type TradeInSubmission,
} from './trade-in-data';

describe('trade-in-data catalog and calculation utilities', () => {
  describe('getAllTradeInCategories', () => {
    it('returns all 5 trade-in categories with required properties and baseline MSRPs', () => {
      const categories = getAllTradeInCategories();
      expect(categories).toHaveLength(5);

      const names = categories.map((c) => c.name);
      expect(names).toContain('Tents & Shelters');
      expect(names).toContain('Technical Backpacks');
      expect(names).toContain('Outerwear & Jackets');
      expect(names).toContain('Sleeping Bags');
      expect(names).toContain('Footwear & Boots');

      const tents = categories.find((c) => c.name === 'Tents & Shelters');
      expect(tents).toBeDefined();
      expect(tents?.defaultMsrp).toBe(400);
      expect(tents?.acceptableItems.length).toBeGreaterThan(0);

      const backpacks = categories.find((c) => c.name === 'Technical Backpacks');
      expect(backpacks?.defaultMsrp).toBe(220);

      const outerwear = categories.find((c) => c.name === 'Outerwear & Jackets');
      expect(outerwear?.defaultMsrp).toBe(280);

      const sleepingBags = categories.find((c) => c.name === 'Sleeping Bags');
      expect(sleepingBags?.defaultMsrp).toBe(250);

      const footwear = categories.find((c) => c.name === 'Footwear & Boots');
      expect(footwear?.defaultMsrp).toBe(180);

      for (const cat of categories) {
        expect(cat.id).toBeTruthy();
        expect(cat.name).toBeTruthy();
        expect(cat.description).toBeTruthy();
        expect(cat.defaultMsrp).toBeGreaterThan(0);
        expect(Array.isArray(cat.acceptableItems)).toBe(true);
        expect(cat.acceptableItems.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getEligibleBrands', () => {
    it('returns eligible outdoor brands across tier classifications', () => {
      const brands = getEligibleBrands();
      expect(brands.length).toBeGreaterThanOrEqual(8);

      const brandNames = brands.map((b) => b.name);
      expect(brandNames).toContain('Contoso Outdoors');
      expect(brandNames).toContain('Patagonia');
      expect(brandNames).toContain("Arc'teryx");
      expect(brandNames).toContain('The North Face');
      expect(brandNames).toContain('Mountain Hardwear');
      expect(brandNames).toContain('Osprey');
      expect(brandNames).toContain('Big Agnes');
      expect(brandNames).toContain('Nemo Equipment');

      const contoso = brands.find((b) => b.name === 'Contoso Outdoors');
      expect(contoso?.tier).toBe('Contoso Outdoors');

      const arcteryx = brands.find((b) => b.name === "Arc'teryx");
      expect(arcteryx?.tier).toBe('Premium Technical');

      const patagonia = brands.find((b) => b.name === 'Patagonia');
      expect(['Partner Brand', 'Premium Technical']).toContain(patagonia?.tier);

      for (const b of brands) {
        expect(b.id).toBeTruthy();
        expect(b.name).toBeTruthy();
        expect(['Contoso Outdoors', 'Partner Brand', 'Premium Technical']).toContain(b.tier);
      }
    });
  });

  describe('calculateTradeInValue', () => {
    it('calculates 50% payout for Excellent condition on Tents & Shelters', () => {
      const estimate = calculateTradeInValue('Tents & Shelters', 'Contoso Outdoors', 400, 'Excellent');
      expect(estimate.category).toBe('Tents & Shelters');
      expect(estimate.brand).toBe('Contoso Outdoors');
      expect(estimate.originalMsrp).toBe(400);
      expect(estimate.condition).toBe('Excellent');
      expect(estimate.creditAmount).toBe(200);
      expect(estimate.co2AvoidedKg).toBe(15);
    });

    it('calculates 40% payout for Very Good condition on Tents & Shelters', () => {
      const estimate = calculateTradeInValue('Tents & Shelters', 'Patagonia', 400, 'Very Good');
      expect(estimate.condition).toBe('Very Good');
      expect(estimate.creditAmount).toBe(160);
      expect(estimate.co2AvoidedKg).toBe(15);
    });

    it('calculates 25% payout for Fair condition on Tents & Shelters', () => {
      const estimate = calculateTradeInValue('Tents & Shelters', "Arc'teryx", 400, 'Fair');
      expect(estimate.condition).toBe('Fair');
      expect(estimate.creditAmount).toBe(100);
      expect(estimate.co2AvoidedKg).toBe(15);
    });

    it('accurately associates CO2 metrics across gear categories', () => {
      const packEstimate = calculateTradeInValue('Technical Backpacks', 'Osprey', 220, 'Excellent');
      expect(packEstimate.creditAmount).toBe(110);
      expect(packEstimate.co2AvoidedKg).toBe(10);

      const outerwearEstimate = calculateTradeInValue('Outerwear & Jackets', "Arc'teryx", 280, 'Excellent');
      expect(outerwearEstimate.creditAmount).toBe(140);
      expect(outerwearEstimate.co2AvoidedKg).toBe(8);

      const sleepingBagEstimate = calculateTradeInValue('Sleeping Bags', 'Big Agnes', 250, 'Excellent');
      expect(sleepingBagEstimate.creditAmount).toBe(125);
      expect(sleepingBagEstimate.co2AvoidedKg).toBe(10);

      const footwearEstimate = calculateTradeInValue('Footwear & Boots', 'Contoso Outdoors', 180, 'Excellent');
      expect(footwearEstimate.creditAmount).toBe(90);
      expect(footwearEstimate.co2AvoidedKg).toBe(6);
    });

    it('handles custom MSRP and clamps negative values', () => {
      const customEstimate = calculateTradeInValue('Tents & Shelters', 'Nemo Equipment', 550, 'Excellent');
      expect(customEstimate.creditAmount).toBe(275);

      const negativeEstimate = calculateTradeInValue('Tents & Shelters', 'Nemo Equipment', -50, 'Excellent');
      expect(negativeEstimate.creditAmount).toBe(0);
    });

    it('resolves category by ID or name seamlessly', () => {
      const byId = calculateTradeInValue('tents-shelters', 'Contoso Outdoors', 400, 'Excellent');
      expect(byId.creditAmount).toBe(200);
      expect(byId.co2AvoidedKg).toBe(15);
    });
  });

  describe('submitTradeIn', () => {
    it('creates intake submission with valid reference number starting with #TIN-', () => {
      const submission: TradeInSubmission = {
        category: 'Tents & Shelters',
        brand: 'Contoso Outdoors',
        condition: 'Excellent',
        creditAmount: 200,
        fulfillmentMethod: 'shipping_kit',
        customerName: 'Alex Morgan',
        customerEmail: 'alex.morgan@example.com',
      };

      const result = submitTradeIn(submission);
      expect(result.success).toBe(true);
      expect(result.referenceNumber).toMatch(/^#TIN-[A-Z0-9]+$/);
      expect(result.message).toContain('Trade-in intake successfully received');
    });

    it('supports in_store fulfillment intake submissions', () => {
      const submission: TradeInSubmission = {
        category: 'Technical Backpacks',
        brand: 'Osprey',
        condition: 'Very Good',
        creditAmount: 88,
        fulfillmentMethod: 'in_store',
        customerName: 'Sam Rivers',
        customerEmail: 'sam.rivers@example.com',
      };

      const result = submitTradeIn(submission);
      expect(result.success).toBe(true);
      expect(result.referenceNumber).toMatch(/^#TIN-/);
    });
  });
});
