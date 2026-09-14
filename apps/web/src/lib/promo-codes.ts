export interface PromoCode {
  code: string;
  discountPercent: number;
  description: string;
}

export const PROMO_CODES: Record<string, PromoCode> = {
  OUTDOORS10: {
    code: "OUTDOORS10",
    discountPercent: 10,
    description: "10% off site-wide",
  },
  WELCOME20: {
    code: "WELCOME20",
    discountPercent: 20,
    description: "20% off welcome discount",
  },
  TRAIL15: {
    code: "TRAIL15",
    discountPercent: 15,
    description: "15% off trail equipment",
  },
};

export function validatePromoCode(code: string): {
  valid: boolean;
  promo?: PromoCode;
  message: string;
} {
  if (!code || typeof code !== "string" || !code.trim()) {
    return {
      valid: false,
      message: "Please enter a promo code",
    };
  }

  const normalizedCode = code.trim().toUpperCase();
  const promo = PROMO_CODES[normalizedCode];

  if (!promo) {
    return {
      valid: false,
      message: "Invalid promo code",
    };
  }

  return {
    valid: true,
    promo,
    message: promo.description,
  };
}
