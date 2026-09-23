import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import WildernessTrackingHub from "./wilderness-tracking-hub";

describe("WildernessTrackingHub Component", () => {
  it("renders required h2 section headings and h3 animal track card headings without skipping levels", () => {
    render(<WildernessTrackingHub />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Wildlife Track & Field Sign Directory/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Track Aging & Gait Speed Calculator/i,
      })
    ).toBeDefined();

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Mandatory Wilderness Tracking Safety Kit Checklist/i,
      })
    ).toBeDefined();

    // Verify h3 card headings for all 5 species
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /Northwestern Gray Wolf/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /North American Cougar/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /Interior Grizzly Bear/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /Rocky Mountain Elk/i,
      })
    ).toBeDefined();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /Western Shiras Moose/i,
      })
    ).toBeDefined();
  });

  it("filters species cards by animal family button pills", () => {
    render(<WildernessTrackingHub />);

    // Initial state: All 5 species cards present
    expect(screen.getByRole("heading", { level: 3, name: /Northwestern Gray Wolf/i })).toBeDefined();
    expect(screen.getByRole("heading", { level: 3, name: /Interior Grizzly Bear/i })).toBeDefined();

    // Filter by Ursids
    const ursidBtn = screen.getByRole("button", { name: /^Ursids$/i });
    fireEvent.click(ursidBtn);

    expect(screen.getByRole("heading", { level: 3, name: /Interior Grizzly Bear/i })).toBeDefined();
    expect(screen.queryByRole("heading", { level: 3, name: /Northwestern Gray Wolf/i })).toBeNull();
    expect(screen.queryByRole("heading", { level: 3, name: /North American Cougar/i })).toBeNull();
    expect(screen.queryByRole("heading", { level: 3, name: /Rocky Mountain Elk/i })).toBeNull();
    expect(screen.queryByRole("heading", { level: 3, name: /Western Shiras Moose/i })).toBeNull();

    // Filter by Felids
    const felidBtn = screen.getByRole("button", { name: /^Felids$/i });
    fireEvent.click(felidBtn);

    expect(screen.getByRole("heading", { level: 3, name: /North American Cougar/i })).toBeDefined();
    expect(screen.queryByRole("heading", { level: 3, name: /Interior Grizzly Bear/i })).toBeNull();

    // Filter by Canids
    const canidBtn = screen.getByRole("button", { name: /^Canids$/i });
    fireEvent.click(canidBtn);

    expect(screen.getByRole("heading", { level: 3, name: /Northwestern Gray Wolf/i })).toBeDefined();
    expect(screen.queryByRole("heading", { level: 3, name: /North American Cougar/i })).toBeNull();

    // Filter by Ungulates
    const ungulateBtn = screen.getByRole("button", { name: /^Ungulates$/i });
    fireEvent.click(ungulateBtn);

    expect(screen.getByRole("heading", { level: 3, name: /Rocky Mountain Elk/i })).toBeDefined();
    expect(screen.getByRole("heading", { level: 3, name: /Western Shiras Moose/i })).toBeDefined();
    expect(screen.queryByRole("heading", { level: 3, name: /Northwestern Gray Wolf/i })).toBeNull();

    // Reset to All Species
    const allBtn = screen.getByRole("button", { name: /^All Species$/i });
    fireEvent.click(allBtn);

    expect(screen.getByRole("heading", { level: 3, name: /Northwestern Gray Wolf/i })).toBeDefined();
    expect(screen.getByRole("heading", { level: 3, name: /Interior Grizzly Bear/i })).toBeDefined();
  });

  it("displays track dimensions, toe count, claw visibility, stride, gait, and identifying signs", () => {
    render(<WildernessTrackingHub />);

    expect(screen.getByText(/Canis lupus/i)).toBeDefined();
    expect(screen.getByText(/4.5" x 4.0"/i)).toBeDefined();
    expect(screen.getAllByText(/Claws Visible/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Direct Register Trot/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Parallel pack scent posts/i)).toBeDefined();
  });

  it("updates live calculator results panel when inputs are modified", () => {
    render(<WildernessTrackingHub />);

    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toBeDefined();

    // Default selection is wolf with razor crisp wall
    expect(within(statusRegion).getByText(/Heightened Predator Alert!/i)).toBeDefined();
    expect(within(statusRegion).getByText(/Direct Register Trot/i)).toBeDefined();

    // Switch species to Grizzly Bear
    const speciesSelect = screen.getByLabelText(/Select Wildlife Species/i);
    fireEvent.change(speciesSelect, { target: { value: "grizzly-brown-bear" } });

    expect(within(statusRegion).getByText(/Interior Grizzly Bear/i)).toBeDefined();
    expect(within(statusRegion).getByText(/Heightened Predator Alert!/i)).toBeDefined();

    // Change wall condition to Collapsed / Weathered
    const wallSelect = screen.getByLabelText(/Track Wall Sharpness/i);
    fireEvent.change(wallSelect, { target: { value: "collapsed_debris_filled" } });

    expect(within(statusRegion).getAllByText(/Normal Protocol/i).length).toBeGreaterThan(0);
    expect(within(statusRegion).getByText(/Weathered Sign/i)).toBeDefined();
  });

  it("updates gear checklist counter with data-testid='tracking-gear-counter'", () => {
    render(<WildernessTrackingHub />);

    const counter = screen.getByTestId("tracking-gear-counter");
    expect(counter.textContent).toBe("0 of 6 packed");

    const stickCheckbox = screen.getByLabelText(/60-Inch Graduated Tracker's Measuring Stick/i);
    const lightCheckbox = screen.getByLabelText(/500-Lumen High-CRI LED Flashlight/i);
    const sprayCheckbox = screen.getByLabelText(/EPA-Certified 10.2oz 2.0% Major Capsaicinoid Bear Deterrent Spray/i);

    fireEvent.click(stickCheckbox);
    expect(counter.textContent).toBe("1 of 6 packed");

    fireEvent.click(lightCheckbox);
    expect(counter.textContent).toBe("2 of 6 packed");

    fireEvent.click(sprayCheckbox);
    expect(counter.textContent).toBe("3 of 6 packed");

    fireEvent.click(stickCheckbox);
    expect(counter.textContent).toBe("2 of 6 packed");
  });
});
