import { test, expect } from '@playwright/test';

test.describe('Wilderness Gold Panning & Placer Mineral Prospecting Journey', () => {
  test('navigates to /gold-prospecting, filters deposit types, calculates placer concentrate recovery, and tracks gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /gold-prospecting
    await page.goto('/gold-prospecting');

    // 2. Verify page title and literal H1 "Wilderness Gold Panning & Placer Mineral Prospecting"
    await expect(page).toHaveTitle(
      /Wilderness Gold Panning & Placer Mineral Prospecting \| Contoso Outdoors/,
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Gold Panning & Placer Mineral Prospecting',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by deposit type and verify expected cards
    const grid = page.getByTestId('gold-prospecting-sites-grid');
    const insideBendBtn = page.getByRole('button', { name: /^Inside Bend Bar$/i });
    await insideBendBtn.click();

    await expect(grid).toContainText('South Fork American River & Coloma Shallows');
    await expect(grid).not.toContainText('Cache Creek Placer Basin');
    await expect(grid).not.toContainText('Pedro Creek & Tanana Valley Basin');

    const bedrockBtn = page.getByRole('button', { name: /^Bedrock Crevice$/i });
    await bedrockBtn.click();

    await expect(grid).toContainText('Pedro Creek & Tanana Valley Basin');
    await expect(grid).not.toContainText('South Fork American River & Coloma Shallows');

    const allSitesBtn = page.getByRole('button', { name: /^All Sites$/i });
    await allSitesBtn.click();
    await expect(grid).toContainText('South Fork American River & Coloma Shallows');
    await expect(grid).toContainText('Pedro Creek & Tanana Valley Basin');
    await expect(grid).toContainText('Cache Creek Placer Basin & Granite Gulch');

    // 4. Select South Fork American River in calculator, adjust volume, assert live status reflects optimal riffle recovery and expected concentrate
    const siteSelect = page.getByLabel(/Select Placer Prospecting Site/i);
    await siteSelect.selectOption('american-river-south-fork');

    const resultPanel = page.getByTestId('gold-prospecting-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('South Fork American River & Coloma Shallows');
    await expect(resultPanel).toContainText('Optimal Riffle Recovery');
    await expect(resultPanel).toContainText('2.16 g');
    await expect(resultPanel).toContainText('92%');

    const volumeInput = page.getByLabel(/Gravel Volume/i);
    await volumeInput.fill('10');
    // 10 buckets * 0.45 * (4.8 / 5.0) = 4.32 g
    await expect(resultPanel).toContainText('4.32 g');
    await expect(resultPanel).toContainText('Optimal Riffle Recovery');

    // 5. Interacts with the Prospecting Checklist and verifies gold-prospecting-gear-counter updates
    const counter = page.getByTestId('gold-prospecting-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const panCheckbox = page.getByLabel(/14-Inch Deep-Drop Dual Riffle Gravity Pan/i);
    const classifierCheckbox = page.getByLabel(/1\/2-Inch & 1\/4-Inch Stainless Classifier Sieve Set/i);
    const sluiceCheckbox = page.getByLabel(/50-Inch Aircraft Aluminum Backpacking Sluice Box/i);

    await expect(panCheckbox).not.toBeChecked();
    await panCheckbox.check();
    await expect(panCheckbox).toBeChecked();
    await expect(counter).toHaveText('1 of 6 packed');

    await classifierCheckbox.check();
    await sluiceCheckbox.check();
    await expect(counter).toHaveText('3 of 6 packed');

    await panCheckbox.uncheck();
    await expect(counter).toHaveText('2 of 6 packed');
  });
});
