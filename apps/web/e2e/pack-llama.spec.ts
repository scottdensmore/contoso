import { test, expect } from '@playwright/test';

test.describe('Backcountry Pack-Llama High-Altitude Trekking & High-Sierra Packing Journey', () => {
  test('navigates to /pack-llama, verifies headings, filters routes, calculates payload balance, and tracks safety tack', async ({
    page,
  }) => {
    // 1. Navigates to /pack-llama
    await page.goto('/pack-llama');

    // 2. Verifies page title and literal H1 "Backcountry Pack-Llama High-Altitude Trekking & High-Sierra Packing"
    await expect(page).toHaveTitle(
      /Backcountry Pack-Llama High-Altitude Trekking & High-Sierra Packing \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Backcountry Pack-Llama High-Altitude Trekking & High-Sierra Packing',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by "Wood Crossbuck Pack" and verifies expected cards are displayed while other routes are hidden
    const crossbuckFilterBtn = page.getByRole('button', { name: /^Wood Crossbuck Pack$/i });
    await crossbuckFilterBtn.click();

    await expect(
      page.getByRole('heading', { level: 3, name: /High Sierra Bishop Pass & Dusy Basin Llama Trek/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Pasayten Wilderness Northern Loop Llama Pack/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /Wind River Cirque of the Towers Llama Expedition/i })
    ).toBeHidden();
    await expect(
      page.getByRole('heading', { level: 3, name: /Weminuche Wilderness Continental Divide Llama Trek/i })
    ).toBeHidden();
    await expect(
      page.getByRole('heading', { level: 3, name: /High Uintas Four Lakes Basin Llama Expedition/i })
    ).toBeHidden();

    // Reset filter to All Rigging
    const allFilterBtn = page.getByRole('button', { name: /^All Rigging$/i });
    await allFilterBtn.click();

    await expect(
      page.getByRole('heading', { level: 3, name: /Wind River Cirque of the Towers Llama Expedition/i })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { level: 3, name: /High Sierra Bishop Pass & Dusy Basin Llama Trek/i })
    ).toBeVisible();

    // 4. Selects High Sierra Bishop Pass in calculator, sets unbalanced left/right pannier weights, asserts live status reflects unbalanced warning and guidance
    const routeSelect = page.getByLabel(/select wilderness route/i);
    await routeSelect.selectOption('high-sierra-bishop-pass');

    const leftPannierInput = page.getByLabel(/left pannier weight/i);
    await leftPannierInput.fill('44');

    const rightPannierInput = page.getByLabel(/right pannier weight/i);
    await rightPannierInput.fill('20');

    const liveStatus = page.getByRole('status');
    await expect(liveStatus).toBeVisible();
    await expect(liveStatus).toContainText('High Sierra Bishop Pass & Dusy Basin Llama Trek');
    await expect(liveStatus).toContainText('Unbalanced - Girth Gall Risk');
    await expect(liveStatus).toContainText('24 lbs');
    await expect(liveStatus).toContainText('Warning: Side pannier weight difference of 24 lbs');
    await expect(liveStatus).toContainText('Trail Etiquette Guidance');

    // 5. Interacts with the Gear Checklist and verifies pack-llama-gear-counter updates
    const counter = page.getByTestId('pack-llama-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const saddleCheckbox = page.getByLabel(/Contoured Wool-Felt Padded Llama Pack Saddle/i);
    await saddleCheckbox.check();
    await expect(counter).toHaveText('1 of 6 packed');

    const canisterCheckbox = page.getByLabel(/Bear-Resistant Food Canisters/i);
    await canisterCheckbox.check();
    await expect(counter).toHaveText('2 of 6 packed');

    await saddleCheckbox.uncheck();
    await expect(counter).toHaveText('1 of 6 packed');
  });
});
