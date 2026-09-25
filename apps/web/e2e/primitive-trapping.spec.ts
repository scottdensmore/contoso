import { test, expect } from '@playwright/test';

test.describe('Wilderness Bushcraft Primitive Trapping & Deadfall Mechanics Journey', () => {
  test('navigates to /primitive-trapping, verifies title & H1, filters mechanisms, tests calculator lethality thresholds, and toggles safety checklist', async ({
    page,
  }) => {
    // 1. Navigate to /primitive-trapping
    await page.goto('/primitive-trapping');

    // 2. Verify page title and literal H1
    await expect(page).toHaveTitle(
      /Wilderness Bushcraft Primitive Trapping & Deadfall Mechanics \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Bushcraft Primitive Trapping & Deadfall Mechanics',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Deadfall Traps" and verify expected cards are displayed while Snare systems are hidden
    const deadfallBtn = page.getByRole('button', { name: /^Deadfall Traps$/i });
    await deadfallBtn.click();

    const figure4Heading = page.getByRole('heading', {
      level: 3,
      name: /Classic All-Wood Figure-4 Deadfall/i,
    });
    await expect(figure4Heading).toBeVisible();

    const paiuteHeading = page.getByRole('heading', {
      level: 3,
      name: /Paiute Deadfall with Cordage & Hair-Trigger Toggle/i,
    });
    await expect(paiuteHeading).toBeVisible();

    const rollingLogHeading = page.getByRole('heading', {
      level: 3,
      name: /Heavy Timber Rolling Log & Lever Deadfall/i,
    });
    await expect(rollingLogHeading).toBeVisible();

    const promontoryHeading = page.getByRole('heading', {
      level: 3,
      name: /Promontory Peg Interlocking Cordage Snare/i,
    });
    await expect(promontoryHeading).not.toBeVisible();

    const springPoleHeading = page.getByRole('heading', {
      level: 3,
      name: /Tensioned Sapling Spring-Pole Toggle Snare/i,
    });
    await expect(springPoleHeading).not.toBeVisible();

    // 4. Selects Figure-4 Deadfall in calculator, sets lightweight deadfall (e.g. 5 lbs) with Snowshoe Hare (3.5 lbs),
    // asserts live status reflects underweight warning, then raises weight to 20 lbs and asserts status updates to humane instant dispatch
    const mechanismSelect = page.getByRole('combobox', { name: /Trigger Mechanism/i });
    await mechanismSelect.selectOption('figure-4-deadfall');

    const quarrySelect = page.getByRole('combobox', { name: /Quarry Species/i });
    await quarrySelect.selectOption('snowshoe_hare');

    const weightInput = page.getByLabel(/Deadfall Stone\/Log Weight/i);
    await weightInput.fill('5');

    const statusRegion = page.getByRole('status');
    await expect(statusRegion).toBeVisible();
    await expect(statusRegion).toContainText(/Underweight - Cruelty Risk/i);
    await expect(statusRegion).toContainText(/1.4x/i);

    // Raise weight to 20 lbs
    await weightInput.fill('20');
    await expect(statusRegion).toContainText(/Humane Instant Dispatch/i);
    await expect(statusRegion).toContainText(/5.7x/i);

    // 5. Interacts with the Safety Kit checklist and verifies trapping-gear-counter updates
    const counter = page.getByTestId('trapping-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const knifeCheckbox = page.getByLabel(/High-Carbon Fixed Blade Woodcarving Knife/i);
    const bankLineCheckbox = page.getByLabel(/#36 Tarred Braided Bank Line/i);
    const pegCheckbox = page.getByLabel(/Hardwood Split Inert Practice Pegs/i);

    await expect(knifeCheckbox).not.toBeChecked();
    await knifeCheckbox.check();
    await expect(knifeCheckbox).toBeChecked();
    await expect(counter).toHaveText('1 of 6 packed');

    await expect(bankLineCheckbox).not.toBeChecked();
    await bankLineCheckbox.check();
    await expect(bankLineCheckbox).toBeChecked();
    await expect(counter).toHaveText('2 of 6 packed');

    await expect(pegCheckbox).not.toBeChecked();
    await pegCheckbox.check();
    await expect(pegCheckbox).toBeChecked();
    await expect(counter).toHaveText('3 of 6 packed');

    await knifeCheckbox.uncheck();
    await expect(knifeCheckbox).not.toBeChecked();
    await expect(counter).toHaveText('2 of 6 packed');
  });
});
