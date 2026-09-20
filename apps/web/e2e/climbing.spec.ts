import { test, expect } from '@playwright/test';

test.describe('Backcountry Climbing & Alpine Crag Beta Guide Journey', () => {
  test('navigates to /climbing, verifies headings, filters crags, calculates rack loadout, and uses safety checklist', async ({
    page,
  }) => {
    // 1. Navigate to /climbing
    await page.goto('/climbing');

    // 2. Verify page title and literal H1 "Backcountry Climbing & Alpine Crag Beta Guide"
    await expect(page).toHaveTitle(
      /Backcountry Climbing & Alpine Crag Beta \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Backcountry Climbing & Alpine Crag Beta Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Sport" discipline and verify The Feathers crag is visible
    const sportFilterBtn = page.getByRole('button', { name: /^Sport$/i });
    await sportFilterBtn.click();

    await expect(
      page.getByRole('heading', { level: 3, name: 'The Feathers' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Index Town Wall — Lower Wall' })
    ).toBeHidden();

    // Reset filter to All Disciplines
    const allFilterBtn = page.getByRole('button', { name: /^All Disciplines$/i });
    await allFilterBtn.click();
    await expect(
      page.getByRole('heading', { level: 3, name: 'Index Town Wall — Lower Wall' })
    ).toBeVisible();

    // 4. Run the Rack Calculator for 3-pitch Trad climbing and check recommended cams and draws
    const disciplineSelect = page.getByLabel('Climbing Style / Discipline');
    await disciplineSelect.selectOption('trad');

    const pitchesInput = page.getByLabel('Pitch Count');
    await pitchesInput.fill('3');

    const resultsPanel = page.getByRole('status');
    await expect(resultsPanel).toBeVisible();
    await expect(resultsPanel).toContainText('Double rack');
    await expect(resultsPanel).toContainText('12 draws');

    // 5. Interact with the Rappel Safety Checklist and verify counter
    await expect(page.getByText('0 of 5 checks completed')).toBeVisible();

    const stopperKnotsCheckbox = page.getByLabel(/Knots in both rope ends \/ stopper knots/i);
    await stopperKnotsCheckbox.check();
    await expect(page.getByText('1 of 5 checks completed')).toBeVisible();

    const autoblockCheckbox = page.getByLabel(/Backup friction hitch \/ autoblock on belay loop/i);
    await autoblockCheckbox.check();
    await expect(page.getByText('2 of 5 checks completed')).toBeVisible();

    await stopperKnotsCheckbox.uncheck();
    await expect(page.getByText('1 of 5 checks completed')).toBeVisible();
  });
});
