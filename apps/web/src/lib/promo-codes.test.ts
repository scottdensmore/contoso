import { describe, it, expect } from "vitest";
import { validatePromoCode, PROMO_CODES } from "./promo-codes";

describe("promo-codes", () => {
  describe("PROMO_CODES dictionary", () => {
    it("contains the expected standard active promo codes", () => {
      expect(PROMO_CODES.OUTDOORS10).toEqual({
        code: "OUTDOORS10",
        discountPercent: 10,
        description: "10% off site-wide",
      });
      expect(PROMO_CODES.WELCOME20).toEqual({
        code: "WELCOME20",
        discountPercent: 20,
        description: "20% off welcome discount",
      });
      expect(PROMO_CODES.TRAIL15).toEqual({
        code: "TRAIL15",
        discountPercent: 15,
        description: "15% off trail equipment",
      });
    });
  });

  describe("validatePromoCode", () => {
    it("validates OUTDOORS10 successfully", () => {
      const result = validatePromoCode("OUTDOORS10");
      expect(result.valid).toBe(true);
      expect(result.promo).toEqual({
        code: "OUTDOORS10",
        discountPercent: 10,
        description: "10% off site-wide",
      });
      expect(result.message).toBe("10% off site-wide");
    });

    it("validates WELCOME20 successfully", () => {
      const result = validatePromoCode("WELCOME20");
      expect(result.valid).toBe(true);
      expect(result.promo).toEqual({
        code: "WELCOME20",
        discountPercent: 20,
        description: "20% off welcome discount",
      });
      expect(result.message).toBe("20% off welcome discount");
    });

    it("validates TRAIL15 successfully", () => {
      const result = validatePromoCode("TRAIL15");
      expect(result.valid).toBe(true);
      expect(result.promo).toEqual({
        code: "TRAIL15",
        discountPercent: 15,
        description: "15% off trail equipment",
      });
      expect(result.message).toBe("15% off trail equipment");
    });

    it("normalizes lowercase input", () => {
      const result = validatePromoCode("welcome20");
      expect(result.valid).toBe(true);
      expect(result.promo?.code).toBe("WELCOME20");
    });

    it("normalizes mixed case input", () => {
      const result = validatePromoCode("OutDoOrs10");
      expect(result.valid).toBe(true);
      expect(result.promo?.code).toBe("OUTDOORS10");
    });

    it("trims surrounding whitespace", () => {
      const result = validatePromoCode("   TRAIL15   ");
      expect(result.valid).toBe(true);
      expect(result.promo?.code).toBe("TRAIL15");
    });

    it("rejects empty string with descriptive error", () => {
      const result = validatePromoCode("");
      expect(result.valid).toBe(false);
      expect(result.promo).toBeUndefined();
      expect(result.message).toBe("Please enter a promo code");
    });

    it("rejects whitespace-only string with descriptive error", () => {
      const result = validatePromoCode("    ");
      expect(result.valid).toBe(false);
      expect(result.promo).toBeUndefined();
      expect(result.message).toBe("Please enter a promo code");
    });

    it("rejects unknown or invalid promo code", () => {
      const result = validatePromoCode("SUMMER50");
      expect(result.valid).toBe(false);
      expect(result.promo).toBeUndefined();
      expect(result.message).toBe("Invalid promo code");
    });
  });
});
