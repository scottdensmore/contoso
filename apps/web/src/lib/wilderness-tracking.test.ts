import { describe, it, expect } from "vitest";
import {
  getAnimalTrackProfiles,
  getAnimalTrackProfileById,
  calculateTrackAging,
  getTrackingGear,
  type TrackAgingQuery,
} from "./wilderness-tracking";

describe("Wilderness Tracking Library Data & Calculations", () => {
  describe("getAnimalTrackProfiles & getAnimalTrackProfileById", () => {
    it("returns all 5 iconic wildlife species profiles when no family filter is specified", () => {
      const profiles = getAnimalTrackProfiles();
      expect(profiles).toHaveLength(5);

      const ids = profiles.map((p) => p.id);
      expect(ids).toContain("gray-wolf-pack");
      expect(ids).toContain("mountain-lion-cougar");
      expect(ids).toContain("grizzly-brown-bear");
      expect(ids).toContain("rocky-mountain-elk");
      expect(ids).toContain("north-american-moose");
    });

    it("filters profiles correctly by animal family", () => {
      const canids = getAnimalTrackProfiles("canid");
      expect(canids).toHaveLength(1);
      expect(canids[0].id).toBe("gray-wolf-pack");
      expect(canids[0].family).toBe("canid");

      const felids = getAnimalTrackProfiles("felid");
      expect(felids).toHaveLength(1);
      expect(felids[0].id).toBe("mountain-lion-cougar");
      expect(felids[0].family).toBe("felid");

      const ursids = getAnimalTrackProfiles("ursid");
      expect(ursids).toHaveLength(1);
      expect(ursids[0].id).toBe("grizzly-brown-bear");
      expect(ursids[0].family).toBe("ursid");

      const ungulates = getAnimalTrackProfiles("ungulate");
      expect(ungulates).toHaveLength(2);
      expect(ungulates.map((u) => u.id)).toEqual(["rocky-mountain-elk", "north-american-moose"]);
      expect(ungulates.every((u) => u.family === "ungulate")).toBe(true);
    });

    it("retrieves specific profile by ID with complete morphological details", () => {
      const wolf = getAnimalTrackProfileById("gray-wolf-pack");
      expect(wolf).toBeDefined();
      expect(wolf?.commonName).toBe("Northwestern Gray Wolf");
      expect(wolf?.scientificName).toBe("Canis lupus");
      expect(wolf?.trackLengthInches).toBe(4.5);
      expect(wolf?.trackWidthInches).toBe(4.0);
      expect(wolf?.clawMarksVisible).toBe(true);
      expect(wolf?.toeCount).toBe(4);
      expect(wolf?.typicalStrideInches).toBe(28);
      expect(wolf?.typicalGait).toBe("Direct Register Trot");
      expect(wolf?.habitat).toBe("Boreal Forests & Mountain Valleys");
      expect(wolf?.identifyingSigns).toContain("Parallel pack scent posts");

      const cougar = getAnimalTrackProfileById("mountain-lion-cougar");
      expect(cougar).toBeDefined();
      expect(cougar?.clawMarksVisible).toBe(false);
      expect(cougar?.toeCount).toBe(4);

      const grizzly = getAnimalTrackProfileById("grizzly-brown-bear");
      expect(grizzly).toBeDefined();
      expect(grizzly?.toeCount).toBe(5);
      expect(grizzly?.clawMarksVisible).toBe(true);
      expect(grizzly?.trackLengthInches).toBe(11.0);

      const nonExistent = getAnimalTrackProfileById("non-existent-animal");
      expect(nonExistent).toBeUndefined();
    });
  });

  describe("getTrackingGear", () => {
    it("returns the mandatory 6-item wilderness tracking safety kit checklist", () => {
      const gear = getTrackingGear();
      expect(gear).toHaveLength(6);
      expect(gear.every((item) => item.mandatory === true)).toBe(true);

      const stick = gear.find((g) => g.id === "calibrated-tracking-stick");
      expect(stick).toBeDefined();
      expect(stick?.category).toBe("measurement");

      const light = gear.find((g) => g.id === "high-intensity-raking-light");
      expect(light).toBeDefined();
      expect(light?.category).toBe("optics");

      const binos = gear.find((g) => g.id === "compact-8x42-binoculars");
      expect(binos).toBeDefined();
      expect(binos?.category).toBe("observation");

      const stone = gear.find((g) => g.id === "quick-hardening-dental-stone");
      expect(stone).toBeDefined();
      expect(stone?.category).toBe("documentation");

      const journal = gear.find((g) => g.id === "weatherproof-field-journal");
      expect(journal).toBeDefined();
      expect(journal?.category).toBe("recording");

      const spray = gear.find((g) => g.id === "inertial-holstered-bear-spray");
      expect(spray).toBeDefined();
      expect(spray?.category).toBe("safety");
    });
  });

  describe("calculateTrackAging", () => {
    const baseWolfQuery: TrackAgingQuery = {
      speciesId: "gray-wolf-pack",
      substrate: "compacted_mud",
      sunWindExposure: "sheltered_dense_canopy",
      trackWallSharpness: "razor_crisp_undisturbed",
      measuredStrideInches: 28,
      dewclawPresent: false,
    };

    it("calculates baseline tracking properties for wolf at typical stride", () => {
      const result = calculateTrackAging(baseWolfQuery);
      expect(result.speciesName).toBe("Northwestern Gray Wolf");
      expect(result.family).toBe("canid");
      expect(result.gaitClassification).toBe("Direct Register Trot");
      expect(result.estimatedSpeedMph).toBe(6);
      expect(result.freshnessRating).toBe("very_fresh_immediate");
      expect(result.estimatedAgeHours).toContain("< 2 hours");
      expect(result.predatorAlert).toBe("heightened_predator_alert");
      expect(result.trackerAdvisory).toContain("CRITICAL PREDATOR ALERT");
    });

    it("triggers heightened predator alert for fresh grizzly bear and cougar sign", () => {
      const bearResult = calculateTrackAging({
        ...baseWolfQuery,
        speciesId: "grizzly-brown-bear",
        trackWallSharpness: "razor_crisp_undisturbed",
        measuredStrideInches: 40,
      });
      expect(bearResult.predatorAlert).toBe("heightened_predator_alert");
      expect(bearResult.freshnessRating).toBe("very_fresh_immediate");
      expect(bearResult.trackerAdvisory).toContain("CRITICAL PREDATOR ALERT");

      const cougarResult = calculateTrackAging({
        ...baseWolfQuery,
        speciesId: "mountain-lion-cougar",
        trackWallSharpness: "razor_crisp_undisturbed",
        measuredStrideInches: 16,
      });
      expect(cougarResult.predatorAlert).toBe("heightened_predator_alert");
      expect(cougarResult.freshnessRating).toBe("very_fresh_immediate");
      expect(cougarResult.trackerAdvisory).toContain("CRITICAL PREDATOR ALERT");
    });

    it("triggers caution monitoring for recent predator tracks (today)", () => {
      const bearCaution = calculateTrackAging({
        ...baseWolfQuery,
        speciesId: "grizzly-brown-bear",
        trackWallSharpness: "softened_rounded_edges",
        measuredStrideInches: 40,
      });
      expect(bearCaution.predatorAlert).toBe("caution_monitoring");
      expect(bearCaution.freshnessRating).toBe("recent_today");
      expect(bearCaution.trackerAdvisory).toContain("CAUTION ADVISORY");
    });

    it("returns normal protocol for weathered predator tracks", () => {
      const weatheredWolf = calculateTrackAging({
        ...baseWolfQuery,
        trackWallSharpness: "collapsed_debris_filled",
      });
      expect(weatheredWolf.predatorAlert).toBe("normal_wilderness_protocol");
      expect(weatheredWolf.freshnessRating).toBe("aged_yesterday_or_older");
      expect(weatheredWolf.trackerAdvisory).toContain("NORMAL PROTOCOL");
    });

    it("returns normal wilderness protocol for ungulates regardless of freshness", () => {
      const freshElk = calculateTrackAging({
        ...baseWolfQuery,
        speciesId: "rocky-mountain-elk",
        trackWallSharpness: "razor_crisp_undisturbed",
        measuredStrideInches: 30,
      });
      expect(freshElk.family).toBe("ungulate");
      expect(freshElk.predatorAlert).toBe("normal_wilderness_protocol");
      expect(freshElk.freshnessRating).toBe("very_fresh_immediate");

      const freshMoose = calculateTrackAging({
        ...baseWolfQuery,
        speciesId: "north-american-moose",
        trackWallSharpness: "razor_crisp_undisturbed",
        measuredStrideInches: 48,
      });
      expect(freshMoose.family).toBe("ungulate");
      expect(freshMoose.predatorAlert).toBe("normal_wilderness_protocol");
    });

    it("adjusts gait classification and speed when measured stride deviates from typical", () => {
      // Short stride -> slow stalking walk
      const stalkWolf = calculateTrackAging({
        ...baseWolfQuery,
        measuredStrideInches: 14,
      });
      expect(stalkWolf.gaitClassification).toBe("Slow Stalking Walk");
      expect(stalkWolf.estimatedSpeedMph).toBeLessThan(5);

      // Long stride -> lope
      const lopeWolf = calculateTrackAging({
        ...baseWolfQuery,
        measuredStrideInches: 42,
      });
      expect(lopeWolf.gaitClassification).toBe("Bounding Lope");
      expect(lopeWolf.estimatedSpeedMph).toBeGreaterThan(8);

      // Very long stride -> gallop/sprint
      const gallopWolf = calculateTrackAging({
        ...baseWolfQuery,
        measuredStrideInches: 56,
      });
      expect(gallopWolf.gaitClassification).toBe("Full Gallop / High-Speed Pursuit");
      expect(gallopWolf.estimatedSpeedMph).toBeGreaterThan(15);
    });

    it("accounts for sun/wind exposure and substrate in degradation and preservation ratings", () => {
      const exposed = calculateTrackAging({
        ...baseWolfQuery,
        sunWindExposure: "direct_blistering_sun_wind",
        trackWallSharpness: "softened_rounded_edges",
      });
      expect(exposed.estimatedAgeHours).toContain("2 to 6 hours");

      const mud = calculateTrackAging({
        ...baseWolfQuery,
        substrate: "compacted_mud",
      });
      expect(mud.substratePreservationRating).toContain("High Cohesion");

      const powder = calculateTrackAging({
        ...baseWolfQuery,
        substrate: "fresh_powder_snow",
      });
      expect(powder.substratePreservationRating).toContain("Low Cohesion");
    });

    it("includes dewclaw advisory notice when dewclaw marks are present", () => {
      const withDewclaw = calculateTrackAging({
        ...baseWolfQuery,
        dewclawPresent: true,
      });
      expect(withDewclaw.trackerAdvisory).toContain("Dewclaw impressions indicate");

      const withoutDewclaw = calculateTrackAging({
        ...baseWolfQuery,
        dewclawPresent: false,
      });
      expect(withoutDewclaw.trackerAdvisory).not.toContain("Dewclaw impressions indicate");
    });

    it("gracefully handles unknown species ID fallback", () => {
      const fallback = calculateTrackAging({
        ...baseWolfQuery,
        speciesId: "unknown-animal-id",
      });
      expect(fallback.speciesName).toBe("Unidentified Wilderness Animal");
      expect(fallback.family).toBe("canid");
      expect(fallback.gaitClassification).toBeDefined();
    });
  });
});
