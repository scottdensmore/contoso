import { test, expect } from '@playwright/test';

test.describe('Backcountry Packrafting & River Expedition Guide Journey', () => {
  test('navigates to /packrafting, filters river grades, tests flow & boat payload calculator, and tracks ultralight gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /packrafting
    await page.goto('/packrafting');

    // 2. Verify page title and literal H1 "Backcountry Packrafting & River Expedition Guide"
    await expect(page).toHaveTitle(
      /Backcountry Packrafting & River Expedition Guide \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Backcountry Packrafting & River Expedition Guide',
    });
    await expect(h1).toBeVisible();

    // 3. Filter by "Class III Moderate" or "Class IV Technical" and verify expected cards
    const grid = page.getByTestId('packraft-routes-grid');

    const classIIIBtn = page.getByRole('button', { name: /class iii moderate/i });
    await classIIIBtn.click();
    await expect(grid).toContainText('Middle Fork Salmon River');
    await expect(grid).not.toContainText('Talkeetna River');
    await expect(grid).not.toContainText('Escalante River');

    const classIVBtn = page.getByRole('button', { name: /class iv technical/i });
    await classIVBtn.click();
    await expect(grid).toContainText('Talkeetna River');
    await expect(grid).not.toContainText('Middle Fork Salmon River');

    const allBtn = page.getByRole('button', { name: /all routes/i });
    await allBtn.click();
    await expect(grid).toContainText('Middle Fork Salmon River');
    await expect(grid).toContainText('Talkeetna River');
    await expect(grid).toContainText('Escalante River');

    // 4. Selects Middle Fork Salmon River in calculator, adjusts flow and payload, and asserts live status
    const routeSelect = page.getByLabel(/select expedition route/i);
    await routeSelect.selectOption('frank-church-middle-fork-salmon');

    const resultPanel = page.getByTestId('packraft-calculator-result');
    await expect(resultPanel).toBeVisible();
    await expect(resultPanel.getByText(/navigable/i).first()).toBeVisible();
    await expect(resultPanel.getByText(/whitewater deck/i).first()).toBeVisible();
    await expect(resultPanel.getByText(/45\s*kg/i).first()).toBeVisible();

    // Adjust flow below runnable minimum (900 CFS < 1200 CFS)
    const flowInput = page.getByLabel(/flow rate/i);
    await flowInput.fill('900');
    await expect(resultPanel.getByText(/scrape/i).first()).toBeVisible();

    // Adjust boat capacity and paddler weight to simulate overloaded boat
    const boatCapacity = page.getByLabel(/boat weight capacity/i);
    await boatCapacity.fill('100');
    const paddlerWeight = page.getByLabel(/paddler.*weight/i);
    await paddlerWeight.fill('110');
    await expect(resultPanel.getByText(/-10\s*kg/i).first()).toBeVisible();
    await expect(resultPanel.getByText(/warning|overload|swamp/i).first()).toBeVisible();

    // 5. Interacts with the Ultra-Light Packrafting Kit checklist and verifies packraft-gear-counter
    const counter = page.getByTestId('packraft-gear-counter');
    await expect(counter).toContainText('0 of 6 packed');

    const pfdCheckbox = page.getByLabel(/uscg type iii\/v whitewater pfd/i);
    await pfdCheckbox.check();
    await expect(counter).toContainText('1 of 6 packed');

    const paddleCheckbox = page.getByLabel(/4-piece breakdown packrafting paddle/i);
    await paddleCheckbox.check();
    await expect(counter).toContainText('2 of 6 packed');

    await pfdCheckbox.uncheck();
    await expect(counter).toContainText('1 of 6 packed');
  });
});
