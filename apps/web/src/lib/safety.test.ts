import { describe, it, expect, beforeEach } from 'vitest';
import {
  getEmergencyProtocols,
  DEVICE_PRESETS,
  getBeaconRegistrations,
  saveBeaconRegistration,
  recordBeaconCheckin,
  deleteBeaconRegistration,
} from './safety';

describe('wilderness safety data utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getEmergencyProtocols', () => {
    it('returns standard emergency protocols including hypothermia, wildlife, lightning, and altitude', () => {
      const protocols = getEmergencyProtocols();
      expect(protocols.length).toBeGreaterThanOrEqual(4);

      const ids = protocols.map((p) => p.id);
      expect(ids).toContain('hypothermia');
      expect(ids).toContain('wildlife');
      expect(ids).toContain('lightning');
      expect(ids).toContain('altitude');

      const hypothermia = protocols.find((p) => p.id === 'hypothermia');
      expect(hypothermia?.title).toBe('Hypothermia & Cold Shock Protocol');
      expect(hypothermia?.severity).toBe('CRITICAL');
      expect(hypothermia?.primarySteps.length).toBeGreaterThan(0);
      expect(hypothermia?.sarSignaling.length).toBeGreaterThan(0);
      expect(hypothermia?.dosAndDonts.do.length).toBeGreaterThan(0);
      expect(hypothermia?.dosAndDonts.dont.length).toBeGreaterThan(0);

      const wildlife = protocols.find((p) => p.id === 'wildlife');
      expect(wildlife?.title).toBe('Grizzly / Black Bear & Cougar Protocol');
      expect(wildlife?.severity).toBe('URGENT');

      const lightning = protocols.find((p) => p.id === 'lightning');
      expect(lightning?.title).toBe('High-Ridge Lightning Storm Protocol');
      expect(lightning?.severity).toBe('CRITICAL');

      const altitude = protocols.find((p) => p.id === 'altitude');
      expect(altitude?.title).toBe('Acute Mountain Sickness (AMS) Protocol');
      expect(altitude?.severity).toBe('URGENT');
    });
  });

  describe('DEVICE_PRESETS', () => {
    it('provides standard device presets with default models', () => {
      expect(DEVICE_PRESETS.garmin_inreach.defaultModel).toContain('Garmin inReach Mini 2 / Messenger');
      expect(DEVICE_PRESETS.zoleo.defaultModel).toContain('ZOLEO Satellite Communicator');
      expect(DEVICE_PRESETS.spot.defaultModel).toContain('SPOT Gen4 / SPOT X Satellite Messenger');
      expect(DEVICE_PRESETS.bivy_stick.defaultModel).toContain('ACR Bivy Stick 2-Way Satellite Communicator');
      expect(DEVICE_PRESETS.apple_satellite.defaultModel).toContain('Apple Emergency SOS via Satellite');
    });
  });

  describe('beacon registration storage helpers', () => {
    const sampleInput = {
      deviceType: 'garmin_inreach' as const,
      deviceModel: 'Garmin inReach Mini 2',
      deviceImei: '300434061234560',
      ownerName: 'Alex Honnold',
      ownerPhone: '555-0199',
      emergencyContactName: 'Climbing Team',
      emergencyContactPhone: '555-0198',
      tripZone: 'Cascades - Mount Rainier',
      departureDate: '2026-10-01',
      returnDate: '2026-10-05',
      checkinFrequency: 'daily' as const,
      medicalNotes: 'No known allergies. Carrying EpiPen.',
    };

    it('returns empty array when no beacons are registered', () => {
      expect(getBeaconRegistrations()).toEqual([]);
    });

    it('saves a new beacon registration with SBR- prefix, ACTIVE_MONITORING status, and createdAt timestamp', () => {
      const saved = saveBeaconRegistration(sampleInput);

      expect(saved.id).toMatch(/^SBR-\d{5}$/);
      expect(saved.status).toBe('ACTIVE_MONITORING');
      expect(saved.createdAt).toBeTruthy();
      expect(saved.ownerName).toBe('Alex Honnold');
      expect(saved.deviceImei).toBe('300434061234560');

      const all = getBeaconRegistrations();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe(saved.id);
    });

    it('defaults deviceModel if not specified in input', () => {
      const withoutModel = {
        ...sampleInput,
        deviceModel: '',
      };
      const saved = saveBeaconRegistration(withoutModel);
      expect(saved.deviceModel).toBe(DEVICE_PRESETS.garmin_inreach.defaultModel);
    });

    it('records a safety check-in ping, updating status to CHECKED_IN and recording lastCheckinAt', () => {
      const saved = saveBeaconRegistration(sampleInput);
      expect(saved.lastCheckinAt).toBeUndefined();

      const updated = recordBeaconCheckin(saved.id);
      expect(updated).not.toBeNull();
      expect(updated?.status).toBe('CHECKED_IN');
      expect(updated?.lastCheckinAt).toBeTruthy();

      const retrieved = getBeaconRegistrations().find((b) => b.id === saved.id);
      expect(retrieved?.status).toBe('CHECKED_IN');
      expect(retrieved?.lastCheckinAt).toBe(updated?.lastCheckinAt);
    });

    it('returns null when recording check-in for unknown id', () => {
      const res = recordBeaconCheckin('SBR-99999');
      expect(res).toBeNull();
    });

    it('deletes a beacon registration by id', () => {
      const saved = saveBeaconRegistration(sampleInput);
      expect(getBeaconRegistrations()).toHaveLength(1);

      const deleted = deleteBeaconRegistration(saved.id);
      expect(deleted).toBe(true);
      expect(getBeaconRegistrations()).toHaveLength(0);

      const deletedAgain = deleteBeaconRegistration(saved.id);
      expect(deletedAgain).toBe(false);
    });
  });
});
