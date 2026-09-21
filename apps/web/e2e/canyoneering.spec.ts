import { test, expect } from '@playwright/test';

test.describe('Alpine Canyoneering & Technical Slot Canyon Guide Journey', () => {
  test('navigates to /canyoneering, filters canyoneering grades, tests rope rigging & hydrology calculator, and tracks technical kit checklist', async ({
    page,
  }) => {
    // 1. Navigate to /canyoneering
    await page.goto('/canyoneering');

    // 2. Verify page title and literal H1 "Alpine Canyoneering & Technical Slot Canyon Guide"
    await expect(page).toHaveTitle(
      /Alpine Canyoneering & Technical Slot Canyon Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Alpine Canyoneering & Technical Slot Canyon Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Class 3B Swimming" or "Class 4 Technical" and verify expected cards
    const grid = page.getByTestId('canyon-routes-grid');

    const class3bBtn = page.getByRole('button', { name: /class 3b swimming/i });
    await class3bBtn.click();
    await expect(grid).toContainText('The Subway');
    await expect(grid).toContainText('Mystery Canyon');
    await expect(grid).not.toContainText('Choprock Canyon');
    await expect(grid).not.toContainText('Bluejohn Canyon');

    const class4Btn = page.getByRole('button', { name: /class 4 technical/i });
    await class4Btn.click();
    await expect(grid).toContainText('Choprock Canyon');
    await expect(grid).not.toContainText('The Subway');
    await expect(grid).not.toContainText('Mystery Canyon');

    const allBtn = page.getByRole('button', { name: /all routes/i });
    await allBtn.click();
    await expect(grid).toContainText('The Subway');
    await expect(grid).toContainText('Mystery Canyon');
    await expect(grid).toContainText('Choprock Canyon');
    await expect(grid).toContainText('The Black Hole');
    await expect(grid).toContainText('Bluejohn Canyon');

    // 4. Selects Mystery Canyon in calculator, adjusts team size and retrieval system, and asserts live status reflects rope length, pull cord, and safety advisory
    const routeSelect = page.getByLabel(/select.*slot canyon route/i);
    await routeSelect.selectOption('zion-mystery-canyon');

    const resultPanel = page.getByTestId('canyon-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Mystery Canyon');
    await expect(resultPanel.getByText(/140\s*ft/i).first()).toBeVisible();

    // Adjust team size and retrieval system
    const teamSizeInput = page.getByLabel(/team size/i);
    await teamSizeInput.fill('5');

    const pullCordSelect = page.getByLabel(/retrieval.*pull cord/i);
    await pullCordSelect.selectOption('dual_rope_system');

    await expect(resultPanel).toContainText('Dual-rope');
    await expect(resultPanel.getByText(/140\s*ft/i).first()).toBeVisible();
    await expect(resultPanel).toContainText('Team of 5 requires disciplined rappel transitions');

    // 5. Interacts with the Technical Canyoneering Kit checklist and verifies canyon-gear-counter
    const counter = page.getByTestId('canyon-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const harnessCheckbox = page.getByLabel(/ce certified canyoneering harness/i);
    await harnessCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const ropeCheckbox = page.getByLabel(/8\.3mm-to-9\.2mm static hydrophobic canyoneering rope/i);
    await ropeCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await harnessCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});
