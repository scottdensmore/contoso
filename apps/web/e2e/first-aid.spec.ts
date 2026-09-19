import { test, expect } from '@playwright/test';

test.describe('Wilderness First Aid & Medical Evacuation Advisor Journey', () => {
  test('navigates to /first-aid, checks title and h1, filters conditions, uses triage tool, adjusts kit calculator, and checks SOS/LZ protocols', async ({
    page,
  }) => {
    // 1. Navigates to /first-aid
    await page.goto('/first-aid');

    // 2. Verifies page title and literal H1 "Wilderness First Aid & Medical Evacuation Advisor"
    await expect(page).toHaveTitle(
      /Wilderness First Aid & Evacuation \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness First Aid & Medical Evacuation Advisor',
    });
    await expect(h1).toBeVisible();

    // 3. Filters conditions by 'environmental' category and verifies Hypothermia card is shown
    const conditionsList = page.getByTestId('medical-conditions-list');
    await expect(conditionsList).toBeVisible();
    await expect(conditionsList).toContainText('Hypothermia (Cold Exposure)');
    await expect(conditionsList).toContainText('Sprains, Strains & Extremity Fractures');

    const envFilterPill = page.getByRole('button', { name: /^Environmental/i });
    await envFilterPill.click();

    await expect(conditionsList).toContainText('Hypothermia (Cold Exposure)');
    await expect(conditionsList).toContainText('Heat Exhaustion & Heat Stroke');
    await expect(conditionsList).not.toContainText('Sprains, Strains & Extremity Fractures');

    // 4. Operates the Triage Assessment tool selecting symptoms and inability to walk, asserting the evacuation recommendation badge is displayed
    const triageSection = page.getByTestId('triage-assessment-section');
    await expect(triageSection).toBeVisible();

    const injurySelect = triageSection.getByLabel(/primary symptom or injury/i);
    await injurySelect.selectOption('musculoskeletal-fracture');

    const cannotWalkBtn = triageSection.getByRole('button', { name: /cannot walk/i });
    await cannotWalkBtn.click();

    const triageResult = page.getByTestId('triage-assessment-result');
    await expect(triageResult).toBeVisible();
    const evacBadge = triageResult.getByTestId('evacuation-badge');
    await expect(evacBadge).toBeVisible();
    await expect(evacBadge).toContainText('ASSISTED WALKOUT');

    // 5. Adjusts the First Aid Kit calculator for 4 people, 5 days, and verifies updated supplies count
    const kitSection = page.getByTestId('kit-calculator-section');
    await expect(kitSection).toBeVisible();

    const partyInput = kitSection.getByLabel(/party size/i);
    const daysInput = kitSection.getByLabel(/trip duration/i);
    const totalCountEl = kitSection.getByTestId('total-kit-items-count');

    const initialTotalText = await totalCountEl.textContent();
    const initialTotal = parseInt(initialTotalText || '0', 10);
    expect(initialTotal).toBeGreaterThan(0);

    await partyInput.fill('4');
    await daysInput.fill('5');

    await expect(totalCountEl).not.toHaveText(String(initialTotal));
    const updatedTotalText = await totalCountEl.textContent();
    const updatedTotal = parseInt(updatedTotalText || '0', 10);
    expect(updatedTotal).toBeGreaterThan(initialTotal);

    // Verify category supplies are visible
    await expect(kitSection.getByText('Wound Care')).toBeVisible();
    await expect(kitSection.getByText('Medications')).toBeVisible();
    await expect(kitSection.getByText('Splints & Ortho')).toBeVisible();
    await expect(kitSection.getByText('Emergency Tools')).toBeVisible();
    await expect(kitSection.getByText('Blister Care')).toBeVisible();

    // 6. Asserts Satellite SOS and Helicopter Evacuation section is visible
    const sosSectionHeading = page.getByRole('heading', {
      level: 2,
      name: /Satellite SOS & Helicopter Evacuation Protocols/i,
    });
    await expect(sosSectionHeading).toBeVisible();
    await expect(page.getByText(/100x100 ft flat obstacle-free zone/i)).toBeVisible();
    await expect(page.getByText(/Marking wind direction/i)).toBeVisible();
    await expect(page.getByText(/Securing loose tarps/i)).toBeVisible();
    await expect(page.getByText(/Shielding patient/i)).toBeVisible();
  });
});
