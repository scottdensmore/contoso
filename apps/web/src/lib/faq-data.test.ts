import { describe, it, expect } from 'vitest';
import {
  getAllFaqs,
  getFaqCategories,
  filterFaqs,
  type FaqItem,
} from './faq-data';

describe('FAQ Data Module', () => {
  describe('getAllFaqs', () => {
    it('returns at least 8-10 high quality FAQs across expected categories', () => {
      const faqs = getAllFaqs();
      expect(faqs.length).toBeGreaterThanOrEqual(8);

      faqs.forEach((faq: FaqItem) => {
        expect(faq.id).toBeTruthy();
        expect(faq.question).toBeTruthy();
        expect(faq.answer).toBeTruthy();
        expect(faq.category).toBeTruthy();
        expect(Array.isArray(faq.keywords)).toBe(true);
        expect(faq.keywords.length).toBeGreaterThan(0);
      });

      const trackFaq = faqs.find((f) => f.question.toLowerCase().includes('track'));
      expect(trackFaq).toBeDefined();
      expect(trackFaq?.linkUrl).toBe('/track');
      expect(trackFaq?.linkLabel).toBe('Track your order online');
    });

    it('contains questions in all required categories', () => {
      const faqs = getAllFaqs();
      const categories = new Set(faqs.map((f) => f.category));

      expect(categories.has('Ordering & Shipping')).toBe(true);
      expect(categories.has('Returns & Refunds')).toBe(true);
      expect(categories.has('Product Care & Warranty')).toBe(true);
      expect(categories.has('Account & Membership')).toBe(true);
    });
  });

  describe('getFaqCategories', () => {
    it('returns a list of unique category names', () => {
      const categories = getFaqCategories();
      expect(categories).toContain('Ordering & Shipping');
      expect(categories).toContain('Returns & Refunds');
      expect(categories).toContain('Product Care & Warranty');
      expect(categories).toContain('Account & Membership');
      expect(new Set(categories).size).toBe(categories.length);
    });
  });

  describe('filterFaqs', () => {
    it('returns all items when query is empty and category is undefined or "all"', () => {
      const all = getAllFaqs();
      expect(filterFaqs('')).toEqual(all);
      expect(filterFaqs('   ')).toEqual(all);
      expect(filterFaqs('', 'all')).toEqual(all);
      expect(filterFaqs('', 'All')).toEqual(all);
    });

    it('filters strictly by category when query is empty', () => {
      const filtered = filterFaqs('', 'Returns & Refunds');
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every((f) => f.category === 'Returns & Refunds')).toBe(true);
    });

    it('matches questions case-insensitively', () => {
      const resultLower = filterFaqs('shipping');
      const resultUpper = filterFaqs('SHIPPING');
      expect(resultLower.length).toBeGreaterThan(0);
      expect(resultLower).toEqual(resultUpper);
      expect(resultLower.some((f) => f.question.toLowerCase().includes('shipping'))).toBe(true);
    });

    it('matches answers text', () => {
      const result = filterFaqs('business days');
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((f) => f.answer.toLowerCase().includes('business days'))).toBe(true);
    });

    it('matches keywords', () => {
      const result = filterFaqs('expedited');
      expect(result.length).toBeGreaterThan(0);
      expect(
        result.some(
          (f) =>
            f.keywords.some((k) => k.toLowerCase().includes('expedited')) ||
            f.question.toLowerCase().includes('expedited') ||
            f.answer.toLowerCase().includes('expedited')
        )
      ).toBe(true);
    });

    it('combines text query and category filtering', () => {
      const result = filterFaqs('order', 'Ordering & Shipping');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((f) => f.category === 'Ordering & Shipping')).toBe(true);

      const wrongCategory = filterFaqs('tent', 'Ordering & Shipping');
      expect(wrongCategory.length).toBe(0);
    });

    it('returns empty array when no FAQs match the query', () => {
      const result = filterFaqs('nonexistentterm12345xyz');
      expect(result).toEqual([]);
    });
  });
});
