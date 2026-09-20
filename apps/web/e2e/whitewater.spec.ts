import { test, expect } from '@playwright/test';

test.describe('Wilderness Waterway & Whitewater River Log Journey', () => {
  test('navigates to /whitewater, filters by class rating, evaluates river safety compatibility, and interacts with safety gear checklist', async ({
    page,
  }) => {
    // 1. Navigate to /whitewater
    await page.goto('/whitewater');

    // 2. Verify page title and literal H1 "Wilderness Waterway & Whitewater River Log"
    await expect(page).toHaveTitle(
      /Wilderness Waterway & Whitewater River Log \| Contoso Outdoors/
    );
    const h1 = page.getByRole('heading', {
      level: 1,
      name: 'Wilderness Waterway & Whitewater River Log',
    });
    await expect(h1).toBeVisible();

    // 3. Filter runs by "Class IV" and verify Skykomish Boulder Drop run is displayed
    const classIVFilter = page.getByRole('button', { name: /class iv/i });
    await classIVFilter.click();

    const runsGrid = page.getByTestId('river-runs-grid');
    await expect(runsGrid).toContainText('Skykomish River — Sunset to Big Eddy');
    await expect(runsGrid).not.toContainText('Wenatchee River — Tumwater Canyon');

    // Reset filter to All to verify all runs return
    const allFilter = page.getByRole('button', { name: /filter by all/i });
    await allFilter.click();
    await expect(runsGrid).toContainText('Wenatchee River — Tumwater Canyon');

    // 4. Operates the River Flow & Paddler Safety Evaluator selecting Wenatchee Tumwater with Intermediate skill
    const riverSelect = page.getByLabel(/select whitewater river run/i);
    await riverSelect.selectOption('wenatchee-tumwater');

    const skillSelect = page.getByLabel(/paddler skill level/i);
    await skillSelect.selectOption('intermediate');

    const resultPanel = page.getByTestId('safety-assessment-result');
    await expect(resultPanel).toBeVisible();

    // Assert "NOT RECOMMENDED" or danger / caution badge and cold water warning banner
    await expect(
      resultPanel.getByText(/NOT RECOMMENDED|DANGER \/ PROHIBITED/i).first()
    ).toBeVisible();
    await expect(resultPanel.getByRole('alert')).toContainText(
      /cold water immersion warning/i
    );

    // 5. Selects Expert skill and asserts updated suitability badge
    await skillSelect.selectOption('expert');
    await expect(resultPanel.getByText('RECOMMENDED').first()).toBeVisible();

    // 6. Toggles items in the Whitewater Gear Checklist
    const counter = page.getByTestId('gear-checklist-counter');
    await expect(counter).toContainText('0 of');

    const pfdCheckbox = page.getByLabel(/type iii\/v whitewater pfd/i);
    await pfdCheckbox.check();
    await expect(counter).toContainText('1 of');

    const helmetCheckbox = page.getByLabel(/whitewater helmet/i);
    await helmetCheckbox.check();
    await expect(counter).toContainText('2 of');

    await pfdCheckbox.uncheck();
    await expect(counter).toContainText('1 of');
  });
});
