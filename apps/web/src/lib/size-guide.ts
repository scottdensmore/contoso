export type SizeUnit = 'in' | 'cm';

export interface SizeTableRow {
  size: string;
  chest?: string;
  waist?: string;
  sleeve?: string;
  footLength?: string;
  usMen?: string;
  usWomen?: string;
  euSize?: string;
  capacity?: string;
  floorDimensions?: string;
  peakHeight?: string;
  torsoLength?: string;
}

export interface SizeChart {
  category: string;
  title: string;
  unit: SizeUnit;
  headers: string[];
  rows: SizeTableRow[];
  tips: string[];
}

export interface RecommendedFit {
  recommendedSize: string;
  advice: string;
}

export function convertMeasurement(value: number, from: SizeUnit, to: SizeUnit): number {
  if (from === to) return value;
  if (from === 'in' && to === 'cm') {
    return Math.round(value * 2.54 * 10) / 10;
  }
  if (from === 'cm' && to === 'in') {
    return Math.round((value / 2.54) * 10) / 10;
  }
  return value;
}

export type NormalizedCategory = 'apparel' | 'footwear' | 'tents' | 'backpacks';

export function normalizeCategory(categoryName?: string | null): NormalizedCategory {
  if (!categoryName) return 'apparel';
  const lower = categoryName.toLowerCase();
  if (lower.includes('tent')) return 'tents';
  if (lower.includes('footwear') || lower.includes('boot') || lower.includes('shoe')) return 'footwear';
  if (lower.includes('pack') || lower.includes('bag')) return 'backpacks';
  if (
    lower.includes('cloth') ||
    lower.includes('apparel') ||
    lower.includes('jacket') ||
    lower.includes('top') ||
    lower.includes('pant') ||
    lower.includes('shirt')
  ) {
    return 'apparel';
  }
  return 'apparel';
}

export function getSizeChart(categoryName?: string | null, unit: SizeUnit = 'in'): SizeChart {
  const norm = normalizeCategory(categoryName);

  switch (norm) {
    case 'footwear': {
      const isCm = unit === 'cm';
      return {
        category: 'Footwear',
        title: 'Footwear & Boots Size Guide',
        unit,
        headers: ['Size', 'US Men', 'US Women', 'EU Size', 'Foot Length'],
        rows: [
          { size: 'US 7', usMen: '7', usWomen: '8.5', euSize: '40', footLength: isCm ? '24.9 cm' : '9.8"' },
          { size: 'US 8', usMen: '8', usWomen: '9.5', euSize: '41', footLength: isCm ? '25.7 cm' : '10.1"' },
          { size: 'US 9', usMen: '9', usWomen: '10.5', euSize: '42', footLength: isCm ? '26.7 cm' : '10.5"' },
          { size: 'US 10', usMen: '10', usWomen: '11.5', euSize: '43', footLength: isCm ? '27.4 cm' : '10.8"' },
          { size: 'US 11', usMen: '11', usWomen: '12.5', euSize: '44', footLength: isCm ? '28.2 cm' : '11.1"' },
          { size: 'US 12', usMen: '12', usWomen: '13.5', euSize: '45', footLength: isCm ? '29.2 cm' : '11.5"' },
          { size: 'US 13', usMen: '13', usWomen: '14.5', euSize: '46-47', footLength: isCm ? '30.0 cm' : '11.8"' },
        ],
        tips: [
          'Measure your foot from the back of your heel to the tip of your longest toe while standing on a flat surface.',
          'Always wear the hiking socks you plan to hike in when checking your foot measurement.',
          'For technical hiking boots, leave about a half-inch of space in front of your toes to avoid toe bruising on descents.',
        ],
      };
    }

    case 'tents': {
      const isCm = unit === 'cm';
      return {
        category: 'Tents',
        title: 'Tents Size Guide',
        unit,
        headers: ['Size', 'Capacity', 'Floor Dimensions', 'Peak Height'],
        rows: [
          {
            size: '2-Person',
            capacity: isCm ? '2 Person (2.8 sq m)' : '2 Person (30 sq ft)',
            floorDimensions: isCm ? '127 x 216 cm' : '50" x 85"',
            peakHeight: isCm ? '102 cm' : '40"',
          },
          {
            size: '3-Person',
            capacity: isCm ? '3 Person (3.8 sq m)' : '3 Person (41 sq ft)',
            floorDimensions: isCm ? '165 x 229 cm' : '65" x 90"',
            peakHeight: isCm ? '112 cm' : '44"',
          },
          {
            size: '4-Person',
            capacity: isCm ? '4 Person (5.2 sq m)' : '4 Person (56 sq ft)',
            floorDimensions: isCm ? '216 x 241 cm' : '85" x 95"',
            peakHeight: isCm ? '127 cm' : '50"',
          },
          {
            size: '6-Person',
            capacity: isCm ? '6 Person (7.7 sq m)' : '6 Person (83 sq ft)',
            floorDimensions: isCm ? '254 x 305 cm' : '100" x 120"',
            peakHeight: isCm ? '183 cm' : '72"',
          },
        ],
        tips: [
          'For extra comfort or keeping backpacks inside the tent vestibule, consider sizing up by 1 person.',
          'Peak height indicates whether campers can comfortably sit upright or stand inside the tent.',
          'Verify your sleeping pad widths fit across the minimum floor dimension.',
        ],
      };
    }

    case 'backpacks': {
      const isCm = unit === 'cm';
      return {
        category: 'Backpacks',
        title: 'Backpacks Size Guide',
        unit,
        headers: ['Size', 'Torso Length', 'Capacity'],
        rows: [
          {
            size: 'S/M',
            torsoLength: isCm ? '41 - 48 cm' : '16" - 19"',
            capacity: '35L - 45L',
          },
          {
            size: 'M/L',
            torsoLength: isCm ? '46 - 53 cm' : '18" - 21"',
            capacity: '45L - 60L',
          },
          {
            size: 'L/XL',
            torsoLength: isCm ? '51 - 58 cm' : '20" - 23"',
            capacity: '60L - 75L',
          },
        ],
        tips: [
          'Torso length is measured along your spine from the C7 vertebra at the base of your neck to your iliac crest (top of hips).',
          'A properly fitted backpack carries 80% of its weight on your hips rather than your shoulders.',
          'If your torso measurement falls between two sizes, choose the smaller size for a tighter harness fit.',
        ],
      };
    }

    case 'apparel':
    default: {
      const isCm = unit === 'cm';
      return {
        category: 'Apparel',
        title: 'Jackets & Tops Size Guide',
        unit,
        headers: ['Size', 'Chest', 'Waist', 'Sleeve'],
        rows: [
          {
            size: 'XS',
            chest: isCm ? '86-91 cm' : '34-36"',
            waist: isCm ? '71-76 cm' : '28-30"',
            sleeve: isCm ? '81-84 cm' : '32-33"',
          },
          {
            size: 'S',
            chest: isCm ? '91-97 cm' : '36-38"',
            waist: isCm ? '76-81 cm' : '30-32"',
            sleeve: isCm ? '84-86 cm' : '33-34"',
          },
          {
            size: 'M',
            chest: isCm ? '99-104 cm' : '39-41"',
            waist: isCm ? '81-86 cm' : '32-34"',
            sleeve: isCm ? '86-89 cm' : '34-35"',
          },
          {
            size: 'L',
            chest: isCm ? '107-112 cm' : '42-44"',
            waist: isCm ? '89-94 cm' : '35-37"',
            sleeve: isCm ? '89-91 cm' : '35-36"',
          },
          {
            size: 'XL',
            chest: isCm ? '114-119 cm' : '45-47"',
            waist: isCm ? '97-102 cm' : '38-40"',
            sleeve: isCm ? '91-94 cm' : '36-37"',
          },
          {
            size: 'XXL',
            chest: isCm ? '122-127 cm' : '48-50"',
            waist: isCm ? '104-109 cm' : '41-43"',
            sleeve: isCm ? '94-97 cm' : '37-38"',
          },
        ],
        tips: [
          'Measure around the fullest part of your chest, keeping the tape measure level across your back.',
          'For waist measurements, wrap the tape around your natural waistline above your hip bones.',
          'If you prefer a relaxed fit or plan to layer heavy garments underneath, size up.',
        ],
      };
    }
  }
}

export function calculateRecommendedSize(
  categoryName: string | undefined,
  measurement: number,
  unit: SizeUnit = 'in'
): RecommendedFit {
  if (typeof measurement !== 'number' || Number.isNaN(measurement) || measurement <= 0) {
    return {
      recommendedSize: 'N/A',
      advice: 'Please enter a valid measurement greater than zero.',
    };
  }

  const norm = normalizeCategory(categoryName);

  switch (norm) {
    case 'footwear': {
      const inches = unit === 'cm' ? measurement / 2.54 : measurement;
      if (inches < 9.95) {
        return {
          recommendedSize: 'US 7',
          advice: 'Size US 7 (EU 40) — recommended for foot lengths around 9.8"',
        };
      }
      if (inches < 10.3) {
        return {
          recommendedSize: 'US 8',
          advice: 'Size US 8 (EU 41) — recommended for foot lengths around 10.1"',
        };
      }
      if (inches < 10.65) {
        return {
          recommendedSize: 'US 9',
          advice: 'Size US 9 (EU 42) — recommended for foot lengths around 10.5"',
        };
      }
      if (inches < 10.95) {
        return {
          recommendedSize: 'US 10',
          advice: 'Size US 10 (EU 43) — recommended with medium hiking socks',
        };
      }
      if (inches < 11.3) {
        return {
          recommendedSize: 'US 11',
          advice: 'Size US 11 (EU 44) — recommended with medium hiking socks',
        };
      }
      if (inches < 11.65) {
        return {
          recommendedSize: 'US 12',
          advice: 'Size US 12 (EU 45) — recommended with hiking socks',
        };
      }
      return {
        recommendedSize: 'US 13',
        advice: 'Size US 13 (EU 46-47) — recommended with hiking socks',
      };
    }

    case 'tents': {
      // For tents, measurement represents number of occupants / campers
      if (measurement <= 2) {
        return {
          recommendedSize: '2-Person',
          advice: '2-Person Tent — provides 30 sq ft, ideal for backpacking and weekend treks',
        };
      }
      if (measurement <= 3) {
        return {
          recommendedSize: '3-Person',
          advice: '3-Person Tent — provides 41 sq ft, great balance of space and pack weight',
        };
      }
      if (measurement <= 4) {
        return {
          recommendedSize: '4-Person',
          advice: '4-Person Tent — provides 56 sq ft with ample space for gear and comfort',
        };
      }
      return {
        recommendedSize: '6-Person',
        advice: '6-Person Tent — provides 83 sq ft, perfect for basecamp groups and families',
      };
    }

    case 'backpacks': {
      const inches = unit === 'cm' ? measurement / 2.54 : measurement;
      if (inches < 18) {
        return {
          recommendedSize: 'S/M',
          advice: 'Size S/M — ideal for torso lengths between 16 and 19 inches',
        };
      }
      if (inches < 21) {
        return {
          recommendedSize: 'M/L',
          advice: 'Size M/L — ideal for torso lengths between 18 and 21 inches',
        };
      }
      return {
        recommendedSize: 'L/XL',
        advice: 'Size L/XL — ideal for torso lengths between 20 and 23 inches',
      };
    }

    case 'apparel':
    default: {
      const inches = unit === 'cm' ? measurement / 2.54 : measurement;
      if (inches < 36) {
        return {
          recommendedSize: 'XS',
          advice: 'Size XS — recommended for chest measurements up to 36"',
        };
      }
      if (inches < 38.5) {
        return {
          recommendedSize: 'S',
          advice: 'Size Small — recommended for chest measurements 36-38"',
        };
      }
      if (inches < 41.5) {
        return {
          recommendedSize: 'M',
          advice: 'Size Medium — recommended for chest measurements 39-41"',
        };
      }
      if (inches < 44.5) {
        return {
          recommendedSize: 'L',
          advice: 'Size Large — recommended for comfortable layering',
        };
      }
      if (inches < 47.5) {
        return {
          recommendedSize: 'XL',
          advice: 'Size XL — recommended for chest measurements 45-47"',
        };
      }
      return {
        recommendedSize: 'XXL',
        advice: 'Size XXL — recommended for chest measurements 48" and up',
      };
    }
  }
}
