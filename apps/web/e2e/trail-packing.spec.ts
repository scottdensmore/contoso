import { test, expect } from '@playwright/test';

test.describe('Wilderness Equestrian Trail Packing & Horse Packing Expeditions Journey', () => {
  test('navigates to /trail-packing, verifies title & H1, filters saddle rigging, calculates pannier balance & hitch adjustment, and toggles tack checklist', async ({
    page,
  }) => {
    // 1. Navigates to /trail-packing
    await page.goto('/trail-packing');

    // 2. Verifies page title and literal H1 "Wilderness Equestrian Trail Packing & Horse Packing Expeditions"
    await expect(page).toHaveTitle(
      /Wilderness Equestrian Trail Packing & Horse Packing Expeditions \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Equestrian Trail Packing & Horse Packing Expeditions',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Decker Rigging" and verifies expected cards are displayed while Sawbuck routes are hidden
    const deckerPill = page.getByRole('button', { name: /^Decker Rigging$/i });
    await deckerPill.click();

    const bobMarshallCard = page.getByTestId('route-card-bob-marshall-wilderness');
    const windRiverCard = page.getByTestId('route-card-wind-river-range');
    const frankChurchCard = page.getByTestId('route-card-frank-church-river-of-no-return');
    const pasaytenCard = page.getByTestId('route-card-pasayten-wilderness');
    const pecosCard = page.getByTestId('route-card-pecos-wilderness');

    await expect(bobMarshallCard).toBeVisible();
    await expect(windRiverCard).toBeVisible();
    await expect(frankChurchCard).toBeVisible();
    await expect(pasaytenCard).not.toBeVisible();
    await expect(pecosCard).not.toBeVisible();

    const sawbuckPill = page.getByRole('button', { name: /^Sawbuck Rigging$/i });
    await sawbuckPill.click();

    await expect(pasaytenCard).toBeVisible();
    await expect(pecosCard).toBeVisible();
    await expect(bobMarshallCard).not.toBeVisible();
    await expect(windRiverCard).not.toBeVisible();

    const allPill = page.getByRole('button', { name: /^All Saddles$/i });
    await allPill.click();
    await expect(bobMarshallCard).toBeVisible();
    await expect(pasaytenCard).toBeVisible();

    // 4. Selects Bob Marshall Wilderness in calculator, adjusts left pannier (e.g. 85 lbs) vs right pannier (50 lbs), asserts live status reflects unbalanced warning and recommended adjustment
    const routeSelect = page.getByLabel(/Select Pack Route/i);
    await routeSelect.selectOption('bob-marshall-wilderness');

    const leftPannierInput = page.getByLabel(/Left Pannier \(lbs\)/i);
    await leftPannierInput.fill('85');

    const rightPannierInput = page.getByLabel(/Right Pannier \(lbs\)/i);
    await rightPannierInput.fill('50');

    const status = page.getByTestId('trail-packing-calculator-result');
    await expect(status).toBeVisible();
    await expect(status).toContainText(/Bob Marshall Wilderness & Chinese Wall Pack String/i);
    await expect(status).toContainText(/155 lbs/i);
    await expect(status).toContainText(/35 lbs/i);
    await expect(status).toContainText(/Unbalanced - Risk of Galls/i);
    await expect(status).toContainText(/CRITICAL UNBALANCED WARNING/i);
    await expect(status).toContainText(/Shift approximately 18 lbs/i);

    // Return to balanced load
    await leftPannierInput.fill('65');
    await rightPannierInput.fill('65');
    await expect(status).toContainText(/Balanced/i);
    await expect(status).toContainText(/Within Capacity/i);
    await expect(status).toContainText(/Diamond hitch tensioning optimal/i);

    // 5. Interacts with the Tack Checklist and verifies tack-gear-counter updates
    const counter = page.getByTestId('tack-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const treeSaverCheckbox = page.getByLabel(/Wide Nylon Tree-Saver Straps/i);
    const leadRopesCheckbox = page.getByLabel(/Heavy-Duty Cotton Lead Ropes/i);
    const packPadsCheckbox = page.getByLabel(/1-Inch Pressed Wool Contoured Pack Saddle Blankets/i);

    await expect(treeSaverCheckbox).not.toBeChecked();
    await treeSaverCheckbox.check();
    await expect(treeSaverCheckbox).toBeChecked();
    await expect(counter).toHaveText('1 of 6 packed');

    await expect(leadRopesCheckbox).not.toBeChecked();
    await leadRopesCheckbox.check();
    await expect(leadRopesCheckbox).toBeChecked();
    await expect(counter).toHaveText('2 of 6 packed');

    await expect(packPadsCheckbox).not.toBeChecked();
    await packPadsCheckbox.check();
    await expect(packPadsCheckbox).toBeChecked();
    await expect(counter).toHaveText('3 of 6 packed');

    await treeSaverCheckbox.uncheck();
    await expect(treeSaverCheckbox).not.toBeChecked();
    await expect(counter).toHaveText('2 of 6 packed');
  });
});
