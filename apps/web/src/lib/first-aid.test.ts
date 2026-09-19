import { describe, it, expect } from 'vitest';
import {
  getMedicalConditions,
  getMedicalConditionById,
  calculateFirstAidKit,
  assessTriage,
  TriageAssessmentRequest,
} from './first-aid';

describe('Wilderness First Aid library (src/lib/first-aid.ts)', () => {
  describe('getMedicalConditions', () => {
    it('returns all conditions when no filter is specified', () => {
      const all = getMedicalConditions();
      expect(all.length).toBeGreaterThanOrEqual(5);
      const ids = all.map((c) => c.id);
      expect(ids).toContain('hypothermia');
      expect(ids).toContain('heat-exhaustion-stroke');
      expect(ids).toContain('acute-mountain-sickness');
      expect(ids).toContain('musculoskeletal-fracture');
      expect(ids).toContain('anaphylaxis');
    });

    it('filters conditions by medical category', () => {
      const envConditions = getMedicalConditions('environmental');
      expect(envConditions.length).toBeGreaterThanOrEqual(3);
      for (const cond of envConditions) {
        expect(cond.category).toBe('environmental');
      }

      const traumaConditions = getMedicalConditions('trauma');
      expect(traumaConditions.length).toBeGreaterThanOrEqual(1);
      expect(traumaConditions.some((c) => c.id === 'musculoskeletal-fracture')).toBe(true);

      const medicalConditions = getMedicalConditions('medical');
      expect(medicalConditions.some((c) => c.id === 'anaphylaxis')).toBe(true);
    });

    it('filters conditions by severity', () => {
      const lifeThreatening = getMedicalConditions(undefined, 'life_threatening');
      expect(lifeThreatening.length).toBeGreaterThanOrEqual(1);
      expect(lifeThreatening.some((c) => c.id === 'anaphylaxis')).toBe(true);

      const severe = getMedicalConditions(undefined, 'severe');
      expect(severe.some((c) => c.id === 'heat-exhaustion-stroke')).toBe(true);
    });

    it('filters conditions by both category and severity', () => {
      const envSevere = getMedicalConditions('environmental', 'severe');
      expect(envSevere.length).toBeGreaterThanOrEqual(2);
      expect(envSevere.map((c) => c.id)).toContain('heat-exhaustion-stroke');
      expect(envSevere.map((c) => c.id)).toContain('acute-mountain-sickness');
    });
  });

  describe('getMedicalConditionById', () => {
    it('finds existing condition by id with all required fields', () => {
      const hypothermia = getMedicalConditionById('hypothermia');
      expect(hypothermia).toBeDefined();
      expect(hypothermia?.title).toBe('Hypothermia (Cold Exposure)');
      expect(hypothermia?.category).toBe('environmental');
      expect(hypothermia?.severity).toBe('moderate');
      expect(hypothermia?.evacuationUrgency).toBe('assisted_walkout');
      expect(hypothermia?.symptoms).toContain('Uncontrollable shivering');
      expect(hypothermia?.fieldTreatments).toContain('Remove wet clothing immediately');
      expect(hypothermia?.redFlagSigns).toContain('Loss of shivering (severe)');
    });

    it('returns undefined for non-existent condition id', () => {
      expect(getMedicalConditionById('unknown-alien-virus')).toBeUndefined();
    });
  });

  describe('calculateFirstAidKit', () => {
    it('calculates kit quantities for solo day hike (1 person, 1 day)', () => {
      const solo = calculateFirstAidKit(1, 1);
      expect(solo.partySize).toBe(1);
      expect(solo.tripDays).toBe(1);
      expect(solo.items.length).toBeGreaterThanOrEqual(10);
      expect(solo.totalItems).toBeGreaterThan(0);

      const categories = new Set(solo.items.map((i) => i.category));
      expect(categories.has('wound_care')).toBe(true);
      expect(categories.has('medications')).toBe(true);
      expect(categories.has('splint_ortho')).toBe(true);
      expect(categories.has('emergency_tools')).toBe(true);
      expect(categories.has('blister_care')).toBe(true);

      const essentials = solo.items.filter((i) => i.essential);
      expect(essentials.length).toBeGreaterThan(5);
    });

    it('scales consumable quantities logically for a group expedition (4 people, 5 days)', () => {
      const solo = calculateFirstAidKit(1, 1);
      const groupExpedition = calculateFirstAidKit(4, 5);

      expect(groupExpedition.partySize).toBe(4);
      expect(groupExpedition.tripDays).toBe(5);

      expect(groupExpedition.totalItems).toBeGreaterThan(solo.totalItems);

      const soloGauze = solo.items.find((i) => i.name.toLowerCase().includes('gauze'));
      const groupGauze = groupExpedition.items.find((i) => i.name.toLowerCase().includes('gauze'));
      expect(soloGauze).toBeDefined();
      expect(groupGauze).toBeDefined();
      expect(groupGauze!.recommendedQty).toBeGreaterThan(soloGauze!.recommendedQty);

      const soloMeds = solo.items.find((i) => i.category === 'medications' && i.essential);
      const groupMeds = groupExpedition.items.find((i) => i.name === soloMeds?.name);
      expect(groupMeds!.recommendedQty).toBeGreaterThan(soloMeds!.recommendedQty);
    });

    it('clamps party size and trip days within sensible bounds', () => {
      const minKit = calculateFirstAidKit(0, 0);
      expect(minKit.partySize).toBe(1);
      expect(minKit.tripDays).toBe(1);

      const maxKit = calculateFirstAidKit(20, 30);
      expect(maxKit.partySize).toBe(12);
      expect(maxKit.tripDays).toBe(14);
    });
  });

  describe('assessTriage', () => {
    it('returns immediate_helo and life_threatening for unconscious patient', () => {
      const request: TriageAssessmentRequest = {
        symptoms: ['Fumbling hands', 'Slurred speech'],
        injuryType: 'hypothermia',
        isConscious: false,
        canWalk: false,
      };
      const result = assessTriage(request);
      expect(result.severity).toBe('life_threatening');
      expect(result.evacuationRecommendation).toBe('immediate_helo');
      expect(result.immediateAction.toLowerCase()).toContain('airway');
      expect(result.steps.length).toBeGreaterThan(0);
    });

    it('assesses severe allergic reaction / anaphylaxis as life_threatening and immediate_helo', () => {
      const request: TriageAssessmentRequest = {
        symptoms: ['Swelling of lips, tongue, or throat', 'Wheezing & shortness of breath'],
        injuryType: 'anaphylaxis',
        isConscious: true,
        canWalk: false,
      };
      const result = assessTriage(request);
      expect(result.severity).toBe('life_threatening');
      expect(result.evacuationRecommendation).toBe('immediate_helo');
      expect(result.immediateAction.toLowerCase()).toContain('epinephrine');
      expect(result.steps.some((s) => s.toLowerCase().includes('epinephrine'))).toBe(true);
    });

    it('assesses acute mountain sickness with inability to walk as urgent_sar', () => {
      const request: TriageAssessmentRequest = {
        symptoms: ['Throbbing headache', 'Ataxia (inability to walk heel-to-toe)'],
        injuryType: 'acute-mountain-sickness',
        isConscious: true,
        canWalk: false,
      };
      const result = assessTriage(request);
      expect(result.severity).toBe('severe');
      expect(result.evacuationRecommendation).toBe('urgent_sar');
      expect(result.immediateAction.toLowerCase()).toContain('descend');
    });

    it('assesses musculoskeletal fracture when patient cannot walk as assisted_walkout', () => {
      const request: TriageAssessmentRequest = {
        symptoms: ['Severe localized pain', 'Inability to bear weight'],
        injuryType: 'musculoskeletal-fracture',
        isConscious: true,
        canWalk: false,
      };
      const result = assessTriage(request);
      expect(result.severity).toBe('moderate');
      expect(result.evacuationRecommendation).toBe('assisted_walkout');
      expect(result.steps.some((s) => s.toLowerCase().includes('splint'))).toBe(true);
    });

    it('assesses mild sprain when patient can walk as self_rescue', () => {
      const request: TriageAssessmentRequest = {
        symptoms: ['Swelling & bruising'],
        injuryType: 'musculoskeletal-fracture',
        isConscious: true,
        canWalk: true,
      };
      const result = assessTriage(request);
      expect(result.severity).toBe('mild');
      expect(result.evacuationRecommendation).toBe('self_rescue');
    });
  });
});
