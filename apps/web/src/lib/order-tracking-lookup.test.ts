import { describe, it, expect } from 'vitest';
import {
  lookupOrderTracking,
  type TrackingMilestone,
} from './order-tracking-lookup';

describe('lookupOrderTracking', () => {
  it('returns null for empty order ID or postal code/email', () => {
    expect(lookupOrderTracking('', '98101')).toBeNull();
    expect(lookupOrderTracking('   ', '98101')).toBeNull();
    expect(lookupOrderTracking('CTSO-98765', '')).toBeNull();
    expect(lookupOrderTracking('CTSO-98765', '   ')).toBeNull();
  });

  it('returns null for unknown order ID', () => {
    expect(lookupOrderTracking('INVALID-99999', '98101')).toBeNull();
    expect(lookupOrderTracking('NO-SUCH-ORDER', 'user@example.com')).toBeNull();
  });

  it('returns null when zip code or email does not match order', () => {
    expect(lookupOrderTracking('CTSO-98765', '12345')).toBeNull();
    expect(lookupOrderTracking('CTSO-98765', 'wrong@example.com')).toBeNull();
  });

  it('successfully looks up demo order CTSO-98765 with zip code', () => {
    const result = lookupOrderTracking('CTSO-98765', '98101');
    expect(result).not.toBeNull();
    expect(result?.orderId).toBe('CTSO-98765');
    expect(result?.carrier).toContain('FedEx');
    expect(result?.status).toBe('Shipped');
    expect(result?.shippingAddress.zipCode).toBe('98101');
    expect(result?.items.length).toBeGreaterThan(0);
    expect(result?.total).toBeGreaterThan(0);
  });

  it('normalizes order ID by stripping "#" and ignoring case', () => {
    const withHash = lookupOrderTracking('#CTSO-98765', '98101');
    const lowerCase = lookupOrderTracking('ctso-98765', '98101');
    const padded = lookupOrderTracking('  #ctso-98765  ', ' 98101 ');

    expect(withHash).not.toBeNull();
    expect(lowerCase).not.toBeNull();
    expect(padded).not.toBeNull();
    expect(withHash?.orderId).toBe('CTSO-98765');
    expect(lowerCase?.orderId).toBe('CTSO-98765');
  });

  it('matches order by email address case-insensitively', () => {
    const result = lookupOrderTracking('CTSO-98765', 'sarah.connor@example.com');
    const upperResult = lookupOrderTracking('CTSO-98765', 'SARAH.CONNOR@EXAMPLE.COM');

    expect(result).not.toBeNull();
    expect(upperResult).not.toBeNull();
    expect(result?.orderId).toBe('CTSO-98765');
  });

  it('supports ord_123 demo order in Delivered status', () => {
    const result = lookupOrderTracking('ord_123', '97201');
    expect(result).not.toBeNull();
    expect(result?.status).toBe('Delivered');
    expect(result?.carrier).toContain('UPS');
    expect(result?.milestones.every((m: TrackingMilestone) => m.status === 'completed')).toBe(true);
  });

  it('supports CTSO-TRK-DEMO123 demo order in Out for Delivery status', () => {
    const result = lookupOrderTracking('CTSO-TRK-DEMO123', '80202');
    expect(result).not.toBeNull();
    expect(result?.status).toBe('Out for Delivery');

    const milestones = result?.milestones ?? [];
    expect(milestones).toHaveLength(5);
    expect(milestones[0].status).toBe('completed'); // Order Placed
    expect(milestones[1].status).toBe('completed'); // Processing
    expect(milestones[2].status).toBe('completed'); // Shipped
    expect(milestones[3].status).toBe('current'); // Out for Delivery
    expect(milestones[4].status).toBe('upcoming'); // Delivered
  });

  it('calculates deterministic milestones for Shipped status', () => {
    const result = lookupOrderTracking('CTSO-98765', '98101');
    const milestones = result?.milestones ?? [];
    expect(milestones).toHaveLength(5);
    expect(milestones[0].name).toBe('Order Placed');
    expect(milestones[0].status).toBe('completed');
    expect(milestones[1].name).toBe('Processing');
    expect(milestones[1].status).toBe('completed');
    expect(milestones[2].name).toBe('Shipped & In Transit');
    expect(milestones[2].status).toBe('current');
    expect(milestones[3].name).toBe('Out for Delivery');
    expect(milestones[3].status).toBe('upcoming');
    expect(milestones[4].name).toBe('Delivered');
    expect(milestones[4].status).toBe('upcoming');
  });

  it('calculates deterministic milestones for Processing status', () => {
    const result = lookupOrderTracking('CTSO-PROCESSING', '98101');
    expect(result).not.toBeNull();
    expect(result?.status).toBe('Processing');
    const milestones = result?.milestones ?? [];
    expect(milestones[0].status).toBe('completed');
    expect(milestones[1].status).toBe('current');
    expect(milestones[2].status).toBe('upcoming');
    expect(milestones[3].status).toBe('upcoming');
    expect(milestones[4].status).toBe('upcoming');
  });
});
