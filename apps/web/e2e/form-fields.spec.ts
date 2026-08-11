import { test, expect, type Page } from '@playwright/test'
import { expectVisibleControls, type Boundary } from './support/boundary'
import { openProfileTab } from './support/session'

/**
 * Every text field the app renders on a page is visible before you touch it.
 *
 * Twenty-one of them: two on `/login`, three on `/signup`, five on `/contact`,
 * and eleven behind `/profile`'s Security and Shipping tabs. The chat panel's
 * input is the twenty-second and is measured by `chat-controls.spec.ts`, which
 * opens the panel.
 *
 * `/profile`'s third tab is not walked. General holds one control, the avatar
 * `input[type=file]`, which is `sr-only` and carries no `id` — so the staleness
 * check below would fail on its own "renders a field with no id" assertion
 * rather than measure anything. It is 1.41:1 with a focus indicator of zero
 * pixels, and it is #231. A *text* field added to that tab would go unmeasured
 * and unflagged, which is the one hole in the claim above.
 *
 * WCAG 2.2 1.4.11 asks 3:1 of a control's visual boundary. These ten measured
 * 1.41:1 on the account pages and 1.21:1 to 1.28:1 on the contact form — a
 * declared boundary that is not one, which is worse than having none, because
 * the layout is built as though the outline were doing the work.
 *
 * The chat panel's input was fixed for the same reason in #184 and left the
 * app with two input treatments. That was the real cost of doing it piecemeal,
 * so the colour now lives in one place; see `src/lib/control-classes.ts`.
 *
 * Both surfaces are read per field rather than assumed. `/login` and `/signup`
 * sit on rgb(250,250,250), not white, and the contact card is `bg-white/90`
 * over a blurred photograph — measured, it runs rgb(233,233,234) to
 * rgb(240,239,238) between fields on the same form. Against pure white these
 * would all read a little better than they are.
 *
 * The card cannot hide a worse spot than it shows here: `bg-white/90` over
 * `backdrop-blur-xs` flattens the photograph to a 228-243 band, fifteen levels
 * of range across the whole card, so there is no busy region for a boundary to
 * disappear into. Swept over fifteen widths from 360 to 1920, the worst
 * perimeter pixel on any field is 3.80:1.
 *
 * ## What the contrast half of this does not catch
 *
 * Deleting the designed outline from `FIELD_BOUNDARY`. That measurement was
 * taken when the constant still carried the colour, and gave Chromium's own
 * `auto 1px rgb(16,16,16)` ring at 1662 qualifying pixels against 1659
 * required. Since the accent moved to the call sites the mutation is fainter
 * still: the fallback ring wears the author's colour, so the field focuses 1px
 * of indigo rather than 2px, and every pixel count in this file passes.
 *
 * That is those checks being right rather than weak — the criterion asks
 * whether focus is visible, not whose CSS made it so, and a browser default is
 * a real indicator. But it means a contrast run is not evidence that the
 * designed outline is doing anything. `a form and its submit agree on a focus
 * indicator`, below, is what closes it: it compares each field's computed
 * outline width and style against the submit's, so a field on the fallback
 * reads `1px auto` against a `2px solid` button and fails. That mutation ran
 * red before this paragraph was written. What no Chromium-only project can
 * test is the reason the designed outline exists at all, which is that the
 * fallback differs between engines — see the note in
 * `src/lib/control-classes.ts`.
 *
 * Both numbers sit near the threshold because a 2px outline and a 2px
 * perimeter are nearly the same area by construction. Expect small margins
 * here and do not read a narrow pass as a near-miss.
 */

const SURFACES = [
  {
    path: '/login',
    fields: [
      { name: 'the email field', selector: '#email' },
      { name: 'the password field', selector: '#password' },
    ],
  },
  {
    path: '/signup',
    fields: [
      { name: 'the name field', selector: '#name' },
      { name: 'the email field', selector: '#email' },
      { name: 'the password field', selector: '#password' },
    ],
  },
  {
    path: '/contact',
    fields: [
      { name: 'the name field', selector: '#name' },
      { name: 'the email field', selector: '#email' },
      { name: 'the subject field', selector: '#subject' },
      { name: 'the order number field', selector: '#orderNumber' },
      { name: 'the message field', selector: '#message' },
    ],
  },
  {
    path: '/profile',
    tab: 'Security',
    fields: [
      { name: 'the current password field', selector: '#current-password' },
      { name: 'the new password field', selector: '#new-password' },
      { name: 'the confirm password field', selector: '#confirm-password' },
    ],
  },
  {
    path: '/profile',
    tab: 'Shipping',
    fields: [
      { name: 'the full name field', selector: '#name' },
      { name: 'the address line 1 field', selector: '#addressLine1' },
      { name: 'the address line 2 field', selector: '#addressLine2' },
      { name: 'the city field', selector: '#city' },
      { name: 'the state field', selector: '#state' },
      { name: 'the postcode field', selector: '#zipCode' },
      { name: 'the country field', selector: '#country' },
      { name: 'the phone number field', selector: '#phoneNumber' },
    ],
  },
] satisfies { path: string; tab?: string; fields: Boundary[] }[]

/** Reach a surface, signing in first when it is behind one. */
async function reach(page: Page, surface: { path: string; tab?: string }) {
  if (surface.tab) {
    await openProfileTab(page, surface.tab)
  } else {
    await page.goto(surface.path)
  }
}

const label = (surface: { path: string; tab?: string }) =>
  surface.tab ? `${surface.path} (${surface.tab})` : surface.path

/**
 * Phone and desktop, because the contact card's background is a `bg-cover`
 * photograph: what sits behind a given field changes with the viewport, and a
 * single width samples one crop of it. The floor quoted above was found by
 * sweeping fifteen widths by hand, which is evidence and not a regression
 * test — this is the part of that sweep CI can keep.
 */
const WIDTHS = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
]

/**
 * The same fields, in Windows High Contrast and its equivalents.
 *
 * All ten measured 1.00:1 before `forced-colors:border` was added to the
 * shared constant — the boundary this file exists to protect was not weakened
 * there, it was absent. Why, and why the fix takes the shape it does, is in
 * `src/lib/control-classes.ts`.
 *
 * Both palettes, because they are not the same test. Chromium picks its system
 * colours from the colour scheme, so the border is black on white in light and
 * white on black in dark, and the focus Highlight goes from a dark violet to
 * cyan. A regression confined to one of them would pass the other.
 *
 * Not covered here: the chat panel input, which carries the same constant but
 * whose journeys need the composed stack, and every filled button on these
 * pages — the same defect on a different population, closed by #227 and
 * measured in `action-controls.spec.ts`.
 */
for (const scheme of ['light', 'dark'] as const) {
  test.describe(`form field boundaries in forced colors (${scheme})`, () => {
    test.use({ contextOptions: { forcedColors: 'active', colorScheme: scheme } })

    for (const surface of SURFACES) {
      test(`the fields on ${label(surface)} keep a boundary`, async ({ page }) => {
        if (surface.tab) test.slow()
        await page.setViewportSize({ width: 1440, height: 900 })
        await reach(page, surface)
        const fields = surface.fields
        await expect(page.locator(fields[0].selector)).toBeVisible()
        await page.keyboard.press('Tab')
        await page.mouse.move(2, 2)

        await expectVisibleControls(page, fields, { kind: 'sample' })
      })
    }
  })
}

test.describe('form field boundaries', () => {
  for (const surface of SURFACES) {
    for (const { width, height } of WIDTHS) {
      test(`the fields on ${label(surface)} are visible at rest at ${width}x${height}`, async ({
        page,
      }) => {
        // Signing in and crossing two navigations eats a real share of the 30s
        // default before any pixel is read — one of these timed out at 30.2s
        // under load and passed in 6.3s on retry. `test.slow()` triples it for
        // the surfaces that pay that cost and leaves the others alone.
        if (surface.tab) test.slow()
        await page.setViewportSize({ width, height })
        await reach(page, surface)
        const fields = surface.fields
        await expect(page.locator(fields[0].selector)).toBeVisible()

      // One real keypress before anything is measured. Chromium grants
      // `:focus-visible` to a programmatically focused text input regardless,
      // but the pages are reached by `goto` with no interaction at all, and a
      // control whose indicator is `focus-visible` only should be measured the
      // way a keyboard user meets it.
        await page.keyboard.press('Tab')

      // And the pointer parked somewhere harmless: a field measured under the
      // cursor reports its hover state, which is not a resting measurement.
        await page.mouse.move(2, 2)

        await expectVisibleControls(page, fields, { kind: 'sample' })
      })
    }
  }

  test('a form and its submit agree on a focus indicator', async ({ page }) => {
    test.slow()
    // Relational rather than a hardcoded hue: what matters is that a keyboard
    // user tabbing a form does not watch the indicator change colour partway
    // down it. `/login` did exactly that until the fields moved off sky-700 —
    // the two inputs focused sky, the button under them indigo, 45 degrees of
    // hue apart inside one form.
    //
    // Read from computed style rather than the class list, so a call site
    // naming an accent Tailwind never emitted fails here rather than passing on
    // a string. It is not a paint reading, and that is the point: the geometry
    // it compares is invisible to everything that measures pixels. Delete
    // `focus-visible:outline-2` from `FIELD_BOUNDARY` and Chromium falls back to
    // `outline-style: auto` while keeping the call site's colour, so the field
    // focuses a 1px ring instead of a 2px one in the right hue — which every
    // contrast check in this file passes, because they weigh colour and not
    // width. That is not hypothetical: this change dropped `outline-2` while
    // moving the accent out to the call sites, all 22 fields shipped on
    // Chromium's fallback ring, and five review rounds and two green batteries
    // went past it before the width was read.
    // `/profile`'s two forms are in here because this change touched them too:
    // eleven of the twenty-one fields it moved to indigo are behind those tabs,
    // and a loop over the anonymous routes alone would not have seen them.
    const FORMS = [
      { label: '/login', reach: (p: Page) => p.goto('/login').then(() => undefined) },
      { label: '/signup', reach: (p: Page) => p.goto('/signup').then(() => undefined) },
      { label: '/contact', reach: (p: Page) => p.goto('/contact').then(() => undefined) },
      { label: '/profile (Security)', reach: (p: Page) => openProfileTab(p, 'Security') },
      { label: '/profile (Shipping)', reach: (p: Page) => openProfileTab(p, 'Shipping') },
    ]

    for (const { label: path, reach } of FORMS) {
      await reach(page)

      // Pointer parked, then one real keypress, and the order matters here for
      // the same reason it does in `action-controls.spec.ts`: Chromium grants
      // `:focus-visible` to a programmatically focused *button* only when the
      // last interaction was a keyboard one. `openProfileTab` ends by clicking
      // a tab, so without this the submit reports `currentColor` — white on a
      // white-on-indigo button — and the form looks like it disagrees with
      // itself when it does not.
      await page.mouse.move(2, 2)
      await page.keyboard.press('Tab')

      // Transitions off before reading, for the reason `support/boundary.ts`
      // gives: Tailwind transitions `outline-color`, so a colour read the
      // instant after `focus()` is whatever the indicator is fading *from* —
      // `currentColor`, which on `/contact`'s white-on-indigo submit is white.
      // That is #235, and it made this check fail on a form that agrees.
      await page.addStyleTag({
        content: '*, *::before, *::after { transition: none !important; }',
      })

      // The submit sets the expectation for the outline; the ring expectation
      // comes from the first field, since a button has no ring to compare.
      //
      // Width and style come from the submit too, and they are what pins the
      // geometry. `ACTION_FOCUS` and `FIELD_BOUNDARY` both ask for `outline-2`,
      // so a form whose fields have it reads `2px solid` on both sides; a form
      // that has lost it reads `1px auto` on the fields against the button's
      // `2px solid` and fails here. Relational again, so raising the app to a
      // 3px indicator stays a one-line change.
      const submit = page.locator('button[type=submit]').first()
      await submit.evaluate((node) => (node as HTMLElement).focus())
      const { outline, width, style: outlineStyle } = await submit.evaluate((node) => {
        const computed = getComputedStyle(node)
        return {
          outline: computed.outlineColor,
          width: computed.outlineWidth,
          style: computed.outlineStyle,
        }
      })
      const ring = await page
        .locator('form input, form textarea')
        .first()
        .evaluate((node) => {
          ;(node as HTMLElement).focus()
          return getComputedStyle(node).boxShadow
        })
      const expected = { colour: outline, ring, width, style: outlineStyle }

      // Every field, not the first one. Before this change the accent came from
      // the shared constant and a field could not have the wrong one; now it is
      // a literal pair copied to each call site, so the invariant is only as
      // good as what reads it. A `.first()` here would have watched five of the
      // twenty-one, and `textarea` is in the selector because `/contact`'s
      // `#message` is one of them.
      const wrong = await page
        .locator('form input, form textarea')
        .evaluateAll((nodes, want) =>
          nodes
            .map((node) => {
              ;(node as HTMLElement).focus()
              const style = getComputedStyle(node)
              // The ring half of the pair as well as the outline. Each call
              // site copies `focus:ring-<accent> focus-visible:outline-<accent>`
              // and reading one of the two leaves the other free to drift —
              // the ring moves only 1.34:1, below what `expectVisibleControls`
              // counts, so nothing else would see it.
              return {
                id: node.id,
                colour: style.outlineColor,
                ring: style.boxShadow,
                width: style.outlineWidth,
                style: style.outlineStyle,
              }
            })
            .filter(
              (field) =>
                field.colour !== want.colour ||
                field.ring !== want.ring ||
                field.width !== want.width ||
                field.style !== want.style,
            )
            .map(
              (field) =>
                `${field.id || '(no id)'} focuses ${field.width} ${field.style} ` +
                `${field.colour} / ${field.ring}`,
            ),
          expected,
        )

      expect(
        wrong,
        `${path} focuses its submit ${width} ${outlineStyle} ${outline}; these ` +
          `disagree, so the indicator changes partway down the form`,
      ).toEqual([])
    }
  })

  test('every field on these pages is one of the ones checked', async ({ page }) => {
    // This one walks every surface, so it pays the sign-in cost twice.
    test.slow()
    // The lists above are written by hand, so they go stale silently: a sixth
    // field added to the contact form would be unmeasured and nothing here
    // would say so. This walks the rendered forms instead and compares.
    for (const surface of SURFACES) {
      const { fields } = surface
      const path = label(surface)
      await reach(page, surface)
      const rendered = await page
        .locator('input:not([type="hidden"]):not([type="submit"]), textarea, select')
        .evaluateAll((nodes) =>
          nodes.map((node) => ({ id: node.id, tag: node.tagName.toLowerCase() })),
        )

      expect(rendered.length, `no fields found on ${path}`).toBeGreaterThan(0)

      // Before the comparison, not filtered out of it. `.filter(Boolean)` on
      // the ids was the first version, and it dropped the one case this test
      // exists to catch: a field added without an `id` disappeared from the
      // list and the comparison below still matched. Every field here happens
      // to carry one because each is wired to a `<label for>`, but nothing
      // makes that true, and a field named by `aria-label` -- which is how the
      // chat input names itself -- would have slipped straight through.
      expect(
        rendered.filter((field) => !field.id).map((field) => field.tag),
        `${path} renders a field with no id, which this spec cannot address`,
      ).toEqual([])
      expect(
        rendered.map((field) => field.id).sort(),
        `${path} renders fields this spec does not measure`,
      ).toEqual(fields.map((field) => field.selector.replace('#', '')).sort())
    }
  })
})
