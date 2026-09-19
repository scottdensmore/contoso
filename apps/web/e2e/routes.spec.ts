import { test, expect } from '@playwright/test';

test.describe('Wilderness GPS Navigation & Route Track Exporter Journey', () => {
  test('navigates to /routes, filters by difficulty or search, views route details, downloads GPX, and reviews offline navigation protocols', async ({
    page,
  }) => {
    // 1. Navigates to /routes
    await page.goto('/routes');

    // 2. Verifies page title and literal H1 "Wilderness GPS Navigation & Route Track Exporter"
    await expect(page).toHaveTitle(
      /Wilderness GPS Navigation & Route Tracks \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness GPS Navigation & Route Track Exporter',
    });
    await expect(h1).toBeVisible();

    // 3. Filters routes by difficulty 'expert' or searches for "Enchantments"
    const expertFilterBtn = page.getByRole('button', { name: /^Expert$/i });
    await expertFilterBtn.click();
    await expect(page.getByText('The Enchantments Thru-Hike')).toBeVisible();
    await expect(page.getByText('Rattlesnake Ledge Trail')).not.toBeVisible();

    // Also verify search input works
    const searchInput = page.getByLabel(/search wilderness routes/i);
    await searchInput.fill('Enchantments');
    await expect(page.getByText('The Enchantments Thru-Hike')).toBeVisible();

    // 4. Selects "The Enchantments Thru-Hike" and opens detail view
    const viewBtn = page.getByRole('button', { name: /view route & gps track/i });
    await viewBtn.click();

    // 5. Asserts waypoints are displayed (Aasgard Pass, Colchuck Lake)
    await expect(page.getByText('Aasgard Pass')).toBeVisible();
    await expect(page.getByText('Colchuck Lake')).toBeVisible();

    // 6. Clicks GPX export button and verifies download confirmation is displayed
    const downloadBtn = page.getByRole('button', { name: /download \.gpx track/i });
    await downloadBtn.click();

    await expect(
      page.getByText(/GPX Track Downloaded: enchantments-thru-hike\.gpx/i)
    ).toBeVisible();

    // 7. Asserts the Offline Navigation & Safety Protocols section is visible
    const safetyHeading = page.getByRole('heading', {
      level: 2,
      name: 'Offline Navigation & Safety Protocols',
    });
    await expect(safetyHeading).toBeVisible();
    await expect(page.getByText(/Ten Essentials for Wilderness Travel/i)).toBeVisible();
    await expect(page.getByText(/GPX Navigation App Import Guide/i)).toBeVisible();
  });
});
