import { describe, it, expect, beforeEach } from 'vitest';
import {
  getWorkparties,
  getWorkpartyById,
  getVolunteerRegistrations,
  saveVolunteerRegistration,
  cancelVolunteerRegistration,
  getStewardshipImpact,
  STORAGE_KEY,
} from './volunteer';

describe('volunteer data models and utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getWorkparties catalog', () => {
    it('returns at least 4 standard trail volunteer workparty projects', () => {
      const workparties = getWorkparties();
      expect(workparties.length).toBeGreaterThanOrEqual(4);

      const ids = workparties.map((w) => w.id);
      expect(ids).toContain('mailbox-drainage');
      expect(ids).toContain('tiger-tread');
      expect(ids).toContain('colchuck-naturalize');
      expect(ids).toContain('hoh-river-blowdown');
    });

    it('contains full metadata for Mailbox Peak Drainage project', () => {
      const project = getWorkpartyById('mailbox-drainage');
      expect(project).toBeDefined();
      expect(project?.title).toBe('Mailbox Peak Drainage & Turnpike Restoration');
      expect(project?.trailName).toBe('Mailbox Peak Trail');
      expect(project?.region).toBe('Cascades');
      expect(project?.date).toBe('2026-10-10');
      expect(project?.meetingTime).toBe('08:30 AM');
      expect(project?.durationHours).toBe(7);
      expect(project?.difficulty).toBe('Strenuous');
      expect(project?.requiredTools).toEqual(['Pulaski', 'McLeod', 'Rock Bar']);
      expect(project?.providedSafetyGear).toEqual(['Hardhat', 'Work Gloves', 'Safety Glasses']);
      expect(project?.spotsRemaining).toBe(6);
    });

    it('contains full metadata for Tiger Mountain Tread Repair project', () => {
      const project = getWorkpartyById('tiger-tread');
      expect(project).toBeDefined();
      expect(project?.title).toBe('Tiger Mountain Corridor Brushing & Tread Repair');
      expect(project?.trailName).toBe('Tiger Mountain Trail');
      expect(project?.region).toBe('Issaquah Alps');
      expect(project?.difficulty).toBe('Moderate');
      expect(project?.requiredTools).toEqual(['Loppers', 'Handsaw', 'Hoe']);
      expect(project?.providedSafetyGear).toEqual(['Hardhat', 'Work Gloves', 'Eye Protection']);
      expect(project?.spotsRemaining).toBe(10);
    });

    it('contains full metadata for Colchuck Naturalization project', () => {
      const project = getWorkpartyById('colchuck-naturalize');
      expect(project).toBeDefined();
      expect(project?.title).toBe('Enchantments Alpine Campsite & LNT Naturalization');
      expect(project?.difficulty).toBe('Backcountry BCR');
      expect(project?.requiredTools).toEqual(['Crosscut Saw', 'Pick Mattock']);
      expect(project?.providedSafetyGear).toEqual(['Hardhat', 'Gloves', 'Satellite Radio']);
      expect(project?.spotsRemaining).toBe(4);
    });

    it('contains full metadata for Hoh River Blowdown Clearing project', () => {
      const project = getWorkpartyById('hoh-river-blowdown');
      expect(project).toBeDefined();
      expect(project?.title).toBe('Olympic Hoh River Blowdown Clearing');
      expect(project?.region).toBe('Olympics');
      expect(project?.difficulty).toBe('Moderate');
      expect(project?.requiredTools).toEqual(['Crosscut Saw', 'Peavey', 'Axe']);
      expect(project?.providedSafetyGear).toEqual(['Hardhat', 'Work Gloves']);
      expect(project?.spotsRemaining).toBe(8);
    });

    it('returns null when querying an unknown workparty id', () => {
      expect(getWorkpartyById('non-existent-id')).toBeNull();
    });
  });

  describe('getStewardshipImpact', () => {
    it('returns valid initial stewardship impact dashboard metrics', () => {
      const impact = getStewardshipImpact();
      expect(impact.totalHours).toBeGreaterThan(0);
      expect(impact.activeVolunteers).toBeGreaterThan(0);
      expect(impact.trailsMaintainedMiles).toBeGreaterThan(0);
      expect(impact.treesCleared).toBeGreaterThan(0);
      expect(impact.drainageStructuresBuilt).toBeGreaterThan(0);
    });
  });

  describe('registration helpers & localStorage persistence', () => {
    const sampleInput = {
      workpartyId: 'mailbox-drainage',
      workpartyTitle: 'Mailbox Peak Drainage & Turnpike Restoration',
      volunteerName: 'Alex Honnold',
      volunteerEmail: 'alex@example.com',
      volunteerPhone: '555-0199',
      emergencyContactName: 'Climbing Team',
      emergencyContactPhone: '555-0198',
      dietaryPreferences: 'Vegetarian',
      safetyWaiverSigned: true,
    };

    it('returns empty array when no volunteer registrations exist in storage', () => {
      expect(getVolunteerRegistrations()).toEqual([]);
    });

    it('saves a volunteer registration with VOL-XXXXX id, confirmed status, and timestamp', () => {
      const saved = saveVolunteerRegistration(sampleInput);

      expect(saved.id).toMatch(/^VOL-\d{5}$/);
      expect(saved.status).toBe('confirmed');
      expect(saved.createdAt).toBeTruthy();
      expect(saved.volunteerName).toBe('Alex Honnold');
      expect(saved.workpartyId).toBe('mailbox-drainage');

      const all = getVolunteerRegistrations();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe(saved.id);
      expect(all[0].status).toBe('confirmed');
    });

    it('cancels an existing registration by updating status to cancelled', () => {
      const saved = saveVolunteerRegistration(sampleInput);
      expect(saved.status).toBe('confirmed');

      const success = cancelVolunteerRegistration(saved.id);
      expect(success).toBe(true);

      const all = getVolunteerRegistrations();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe(saved.id);
      expect(all[0].status).toBe('cancelled');
    });

    it('returns false when attempting to cancel an unknown registration id', () => {
      expect(cancelVolunteerRegistration('VOL-99999')).toBe(false);
    });

    it('uses the contoso_volunteer_registrations localStorage key', () => {
      expect(STORAGE_KEY).toBe('contoso_volunteer_registrations');
      saveVolunteerRegistration(sampleInput);
      const raw = localStorage.getItem(STORAGE_KEY);
      expect(raw).toBeTruthy();
      expect(JSON.parse(raw!)).toHaveLength(1);
    });
  });
});
