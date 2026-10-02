import { test, expect } from '@playwright/test';

test.describe('Alpine Glacial Crevasse Ice Cave & Cryokarst Speleology Journey', () => {
  test('navigates to /cryokarst-speleology, verifies headings, filters conduits, models dynamics, and tracks safety gear', async ({
    page,
  }) => {
    // 1. Navigate to /cryokarst-speleology
    await page.goto('/cryokarst-speleology');

    // 2. Verify page title and literal H1 "Alpine Glacial Crevasse Ice Cave & Cryokarst Speleology"
    await expect(page).toHaveTitle(
      /Alpine Glacial Crevasse Ice Cave & Cryokarst Speleology \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Alpine Glacial Crevasse Ice Cave & Cryokarst Speleology',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by conduit type and verify expected cards
    const fumaroleFilterBtn = page.getByRole('button', { name: /^Volcanic Fumarole Melt Cave$/i });
    await fumaroleFilterBtn.click();

    await expect(
      page.getByRole('heading', { level: 3, name: /Mount Hood Palmer Glacier Fumarole/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Matanuska Glacier Moulin Cathedral/i })
    ).toBeHidden();
    await expect(
      page.getByRole('heading', { level: 3, name: /Root Glacier Subglacial Fluvial/i })
    ).toBeHidden();

    // Filter by Horizontal Subglacial Tunnel
    const tunnelFilterBtn = page.getByRole('button', { name: /^Horizontal Subglacial Tunnel$/i });
    await tunnelFilterBtn.click();

    await expect(
      page.getByRole('heading', { level: 3, name: /Root Glacier Subglacial Fluvial/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Mount Hood Palmer Glacier Fumarole/i })
    ).toBeHidden();

    // Reset filter to All Conduits
    const allFilterBtn = page.getByRole('button', { name: /^All Conduits$/i });
    await allFilterBtn.click();

    await expect(
      page.getByRole('heading', { level: 3, name: /Matanuska Glacier Moulin Cathedral/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Root Glacier Subglacial Fluvial/i })
    ).toBeVisible();

    // 4. Calculator interaction: live status reflects creep rate, ablation, outburst risk, and triage
    const resultPanel = page.getByTestId('cryokarst-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel).toContainText('Matanuska Glacier Moulin Cathedral');
    await expect(resultPanel).toContainText('1.4 mm/hr');
    await expect(resultPanel).toContainText('19 mm/day');
    await expect(resultPanel).toContainText('0.32');
    await expect(resultPanel).toContainText('Nominal: Stable Cold Ice');

    // Change site to Palmer Glacier
    const siteSelect = page.getByLabel(/select glacial exploration site/i);
    await siteSelect.selectOption('palmer-glacier-fumarole-ice-caves');

    await expect(resultPanel).toContainText('Mount Hood Palmer Glacier Fumarole Thermal Ice Caves');
    await expect(resultPanel).toContainText('Critical: Collapse & Ablation Danger');

    // 5. Interact with the Cryokarst Gear Checklist and verify cryokarst-gear-counter updates
    const counter = page.getByTestId('cryokarst-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const oversuitCheckbox = page.getByLabel(
      /Waterproof Cordura Glacial Caving Oversuit/i
    );
    await oversuitCheckbox.check();
    await expect(counter).toHaveText('1 of 6 packed');

    const screwsCheckbox = page.getByLabel(
      /21cm Stainless Steel Reverse-Thread Ice Screws/i
    );
    await screwsCheckbox.check();
    await expect(counter).toHaveText('2 of 6 packed');

    await oversuitCheckbox.uncheck();
    await expect(counter).toHaveText('1 of 6 packed');
  });
});
