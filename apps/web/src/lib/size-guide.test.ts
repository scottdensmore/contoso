import { describe, it, expect } from 'vitest';
import {
  getSizeChart,
  convertMeasurement,
  calculateRecommendedSize,
} from './size-guide';

describe('size-guide utilities', () => {
  describe('convertMeasurement', () => {
    it('converts inches to centimeters with one decimal precision', () => {
      expect(convertMeasurement(10, 'in', 'cm')).toBe(25.4);
      expect(convertMeasurement(1, 'in', 'cm')).toBe(2.5);
      expect(convertMeasurement(40, 'in', 'cm')).toBe(101.6);
    });

    it('converts centimeters to inches with one decimal precision', () => {
      expect(convertMeasurement(25.4, 'cm', 'in')).toBe(10);
      expect(convertMeasurement(101.6, 'cm', 'in')).toBe(40);
    });

    it('returns the same measurement when units match', () => {
      expect(convertMeasurement(42, 'in', 'in')).toBe(42);
      expect(convertMeasurement(105, 'cm', 'cm')).toBe(105);
    });
  });

  describe('getSizeChart', () => {
    it('returns apparel size chart for Jackets & Tops / Hiking Clothing in inches', () => {
      const chart = getSizeChart('Hiking Clothing', 'in');
      expect(chart.category).toBe('Apparel');
      expect(chart.unit).toBe('in');
      expect(chart.headers).toContain('Size');
      expect(chart.headers).toContain('Chest');
      expect(chart.rows.length).toBe(6);
      expect(chart.rows.map((r) => r.size)).toEqual(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
      expect(chart.rows[0].chest).toContain('34-36"');
      expect(chart.rows[3].chest).toContain('42-44"');
      expect(chart.tips.length).toBeGreaterThan(0);
    });

    it('returns apparel size chart converted to centimeters', () => {
      const chart = getSizeChart('Hiking Clothing', 'cm');
      expect(chart.unit).toBe('cm');
      expect(chart.rows[0].chest).toContain('cm');
      expect(chart.rows[0].chest).toContain('86-91');
    });

    it('returns footwear size chart for Hiking Footwear / Boots', () => {
      const chart = getSizeChart('Hiking Footwear', 'in');
      expect(chart.category).toBe('Footwear');
      expect(chart.headers).toContain('US Men');
      expect(chart.headers).toContain('EU Size');
      expect(chart.headers).toContain('Foot Length');
      expect(chart.rows.length).toBeGreaterThanOrEqual(7);
      expect(chart.rows[0].usMen).toBe('7');
      expect(chart.rows[0].euSize).toBe('40');
      expect(chart.rows[0].footLength).toContain('9.8"');
      expect(chart.tips.length).toBeGreaterThan(0);
    });

    it('returns footwear size chart in centimeters', () => {
      const chart = getSizeChart('Hiking Footwear', 'cm');
      expect(chart.unit).toBe('cm');
      expect(chart.rows[0].footLength).toContain('cm');
    });

    it('returns tents size chart for Tents', () => {
      const chart = getSizeChart('Tents', 'in');
      expect(chart.category).toBe('Tents');
      expect(chart.headers).toContain('Size');
      expect(chart.headers).toContain('Capacity');
      expect(chart.headers).toContain('Floor Dimensions');
      expect(chart.rows.length).toBe(4);
      expect(chart.rows.map((r) => r.size)).toEqual(['2-Person', '3-Person', '4-Person', '6-Person']);
      expect(chart.rows[0].capacity).toContain('30 sq ft');
      expect(chart.rows[0].floorDimensions).toContain('50" x 85"');
      expect(chart.rows[2].capacity).toContain('56 sq ft');
      expect(chart.rows[2].floorDimensions).toContain('85" x 95"');
      expect(chart.tips.length).toBeGreaterThan(0);
    });

    it('returns tents size chart in metric units', () => {
      const chart = getSizeChart('Tents', 'cm');
      expect(chart.unit).toBe('cm');
      expect(chart.rows[0].floorDimensions).toContain('cm');
      expect(chart.rows[0].capacity).toContain('sq m');
    });

    it('returns backpacks size chart for Backpacks', () => {
      const chart = getSizeChart('Backpacks', 'in');
      expect(chart.category).toBe('Backpacks');
      expect(chart.headers).toContain('Size');
      expect(chart.headers).toContain('Torso Length');
      expect(chart.rows.length).toBe(3);
      expect(chart.rows.map((r) => r.size)).toEqual(['S/M', 'M/L', 'L/XL']);
      expect(chart.rows[0].torsoLength).toContain('16" - 19"');
      expect(chart.rows[1].torsoLength).toContain('18" - 21"');
      expect(chart.rows[2].torsoLength).toContain('20" - 23"');
      expect(chart.tips.length).toBeGreaterThan(0);
    });

    it('returns backpacks size chart in centimeters', () => {
      const chart = getSizeChart('Backpacks', 'cm');
      expect(chart.unit).toBe('cm');
      expect(chart.rows[0].torsoLength).toContain('cm');
    });

    it('falls back to apparel when category is undefined, null, or unrecognized', () => {
      const chartDefault = getSizeChart();
      expect(chartDefault.category).toBe('Apparel');

      const chartNull = getSizeChart(null);
      expect(chartNull.category).toBe('Apparel');

      const chartUnknown = getSizeChart('Accessories');
      expect(chartUnknown.category).toBe('Apparel');
    });
  });

  describe('calculateRecommendedSize', () => {
    it('calculates apparel size based on chest measurement in inches', () => {
      expect(calculateRecommendedSize('Hiking Clothing', 35, 'in').recommendedSize).toBe('XS');
      expect(calculateRecommendedSize('Hiking Clothing', 37, 'in').recommendedSize).toBe('S');
      expect(calculateRecommendedSize('Hiking Clothing', 40, 'in').recommendedSize).toBe('M');
      
      const recL = calculateRecommendedSize('Hiking Clothing', 43, 'in');
      expect(recL.recommendedSize).toBe('L');
      expect(recL.advice).toContain('Size Large — recommended for comfortable layering');

      expect(calculateRecommendedSize('Hiking Clothing', 46, 'in').recommendedSize).toBe('XL');
      expect(calculateRecommendedSize('Hiking Clothing', 49, 'in').recommendedSize).toBe('XXL');
    });

    it('calculates apparel size based on chest measurement in centimeters', () => {
      // 109 cm is ~42.9 inches -> L
      const rec = calculateRecommendedSize('Hiking Clothing', 109, 'cm');
      expect(rec.recommendedSize).toBe('L');
      expect(rec.advice).toContain('Large');
    });

    it('calculates footwear size based on foot length in inches and centimeters', () => {
      const recIn = calculateRecommendedSize('Hiking Footwear', 10.8, 'in');
      expect(recIn.recommendedSize).toBe('US 10');
      expect(recIn.advice).toContain('US 10');
      expect(recIn.advice).toContain('EU 43');

      // 26.7 cm is ~10.5 inches -> US 9
      const recCm = calculateRecommendedSize('Hiking Footwear', 26.7, 'cm');
      expect(recCm.recommendedSize).toBe('US 9');
      expect(recCm.advice).toContain('US 9');
      expect(recCm.advice).toContain('EU 42');
    });

    it('calculates tent size based on number of occupants', () => {
      expect(calculateRecommendedSize('Tents', 2, 'in').recommendedSize).toBe('2-Person');
      expect(calculateRecommendedSize('Tents', 3, 'in').recommendedSize).toBe('3-Person');
      
      const rec4 = calculateRecommendedSize('Tents', 4, 'in');
      expect(rec4.recommendedSize).toBe('4-Person');
      expect(rec4.advice).toContain('56 sq ft');

      expect(calculateRecommendedSize('Tents', 6, 'in').recommendedSize).toBe('6-Person');
    });

    it('calculates backpack size based on torso length in inches and centimeters', () => {
      expect(calculateRecommendedSize('Backpacks', 17, 'in').recommendedSize).toBe('S/M');
      expect(calculateRecommendedSize('Backpacks', 19.5, 'in').recommendedSize).toBe('M/L');
      expect(calculateRecommendedSize('Backpacks', 22, 'in').recommendedSize).toBe('L/XL');

      // 47 cm is ~18.5 in -> M/L
      expect(calculateRecommendedSize('Backpacks', 47, 'cm').recommendedSize).toBe('M/L');
    });

    it('handles zero or invalid measurements gracefully', () => {
      const recZero = calculateRecommendedSize('Hiking Clothing', 0, 'in');
      expect(recZero.recommendedSize).toBe('N/A');
      expect(recZero.advice).toContain('valid measurement');

      const recNaN = calculateRecommendedSize('Hiking Clothing', Number.NaN, 'in');
      expect(recNaN.recommendedSize).toBe('N/A');
    });
  });
});
