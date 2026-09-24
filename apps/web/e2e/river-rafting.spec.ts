import { test, expect } from '@playwright/test';

test.describe('Backcountry Whitewater Rafting & Oar-Frame River Rowing Journey', () => {
  test('navigates to /river-rafting, verifies headings, filters expeditions, calculates raft dynamics, and tracks safety gear', async ({
    page,
  }) => {
    // 1. Navigates to /river-rafting
    await page.goto('/river-rafting');

    // 2. Verifies page title and literal H1 "Backcountry Whitewater Rafting & Oar-Frame River Rowing"
    await expect(page).toHaveTitle(
      /Backcountry Whitewater Rafting & Oar-Frame River Rowing \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Backcountry Whitewater Rafting & Oar-Frame River Rowing',
    });
    await expect(h1).toBeVisible();

    // 3. Filters by difficulty and verifies expected cards
    const class5FilterBtn = page.getByRole('button', { name: /^Class V Expert$/i });
    await class5FilterBtn.click();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Colorado River — Grand Canyon Expedition/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Selway River National Wilderness/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Middle Fork of the Salmon River/i,
      })
    ).toBeHidden();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Rogue River Wilderness Wild & Scenic/i,
      })
    ).toBeHidden();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Green River — Gates of Lodore/i,
      })
    ).toBeHidden();

    // Filter by Class IV Advanced
    const class4FilterBtn = page.getByRole('button', { name: /^Class IV Advanced$/i });
    await class4FilterBtn.click();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Middle Fork of the Salmon River/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Rogue River Wilderness Wild & Scenic/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Green River — Gates of Lodore/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Colorado River — Grand Canyon Expedition/i,
      })
    ).toBeHidden();

    // Reset filter to All Expeditions
    const allFilterBtn = page.getByRole('button', { name: /^All Expeditions$/i });
    await allFilterBtn.click();

    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Colorado River — Grand Canyon Expedition/i,
      })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 3,
        name: /Green River — Gates of Lodore/i,
      })
    ).toBeVisible();

    // 4. Selects Grand Canyon in calculator, adjusts payload to 650kg, asserts live status reflects momentum, punch feasibility, and oar recommendation
    const expeditionSelect = page.getByLabel(/select river expedition/i);
    await expeditionSelect.selectOption('colorado-river-grand-canyon');

    const payloadInput = page.getByLabel(/rigged payload weight/i);
    await payloadInput.fill('650');

    const liveStatus = page.getByRole('status');
    await expect(liveStatus).toBeVisible();
    await expect(liveStatus).toContainText('Colorado River — Grand Canyon Expedition');
    await expect(liveStatus).toContainText('N·s');
    await expect(liveStatus).toContainText('Punch Clean');
    await expect(liveStatus).toContainText('Heavy expedition rigging');

    // 5. Interacts with the Multi-Day Rafting Checklist and verifies river-rafting-gear-counter updates
    const counter = page.getByTestId('river-rafting-gear-counter');
    await expect(counter).toHaveText('0 of 6 packed');

    const frameCheckbox = page.getByLabel(
      /Extruded Modular Aluminum Oar Frame with High-Back Padded Seat/i
    );
    await frameCheckbox.check();
    await expect(counter).toHaveText('1 of 6 packed');

    const oarsCheckbox = page.getByLabel(
      /10-Foot Counterbalanced Carbon Oars & Dynalite Blades/i
    );
    await oarsCheckbox.check();
    await expect(counter).toHaveText('2 of 6 packed');

    await frameCheckbox.uncheck();
    await expect(counter).toHaveText('1 of 6 packed');
  });
});
