import { test, expect, Page } from '@playwright/test'

/**
 * `/contact`'s controls have to clear the chat launcher's column.
 *
 * The launcher is `fixed bottom-0 right-0` with `mr-4 mb-4` below `sm`, so it
 * owns the bottom-right 56x56 of the viewport — 40px of control plus a 16px
 * margin — on every route, at every scroll position. #286 measured the
 * `/contact` submit button at 48..342 against a launcher at 334..374: an 8x32
 * overlap in which `document.elementFromPoint` returns the launcher, so the
 * last 8px of the page's primary action opens the chat instead of submitting.
 *
 * ## Why this asserts a column and not a gap below the content
 *
 * The obvious fix is a bottom gutter, and it does not work. The launcher is
 * `fixed`, so the page scrolls under it and every row passes through its band;
 * a gutter only separates them at the very end of the document. `/contact` at
 * 390x844 scrolls just 116px, and the button clears the launcher on its own by
 * the end of that scroll — so the end of the document is the one position
 * where the defect cannot be observed. A sweep that measured only there
 * reported every route clean.
 *
 * `padding-bottom` cannot help at `scrollY=0` either: it makes the document
 * taller and moves nothing that is already rendered. Horizontal separation is
 * the only geometry that holds for a full-width control on a scrolling page,
 * which is what `LAUNCHER_SAFE_COLUMN` reserves.
 *
 * ## What this does not claim
 *
 * Only `/contact` opts into the column. The catalogue grid is full-bleed and
 * every product card sits under the launcher at every viewport — measured, and
 * filed as #334 — which is a standing decision rather than an oversight:
 * `chat-launcher.spec.ts` says in its own header that "covering content is
 * tolerable". What makes `/contact` different is that the covered control is
 * the page's only primary action and a mis-tap opens a modal over a
 * part-composed message, which is the same reasoning `chat.tsx` already
 * applies to its own close button.
 */

const PHONES = [
  // 390x844 is where #286 and #327 both measured, independently, to the pixel.
  { name: '390x844', width: 390, height: 844 },
  // 360x740 is where the message textarea is hit as well as the button, and by
  // 8x40 rather than 8x32 — the narrowest common phone, and the worst case.
  { name: '360x740', width: 360, height: 740 },
  // 414x896 is where the overlap shrinks to 8x8 and the launcher wins no
  // sampled point. Included so a fix that only works on narrow screens is not
  // reported as a fix.
  { name: '414x896', width: 414, height: 896 },
]

type Intrusion = {
  label: string
  rect: number[]
  overlap: string
  stolen: number
  sampled: number
}

type Reading = {
  launcher: number[] | null
  controls: number
  intrusions: Intrusion[]
}

async function readAt(page: Page, scrollY: number): Promise<Reading> {
  await page.evaluate((y) => window.scrollTo(0, y), scrollY)
  await page.waitForTimeout(120)
  return page.evaluate(() => {
    const launcher = document.querySelector('button[aria-label="Open chat"]')
    if (!launcher) return { launcher: null, controls: 0, intrusions: [] }
    const L = launcher.getBoundingClientRect()
    const intrusions = []
    let controls = 0
    for (const el of document.querySelectorAll('a[href], button, input, select, textarea')) {
      if (el === launcher || launcher.contains(el)) continue
      const b = el.getBoundingClientRect()
      if (b.width === 0 || b.height === 0) continue
      if (b.bottom < 0 || b.top > window.innerHeight) continue
      controls += 1
      const ox = Math.min(b.right, L.right) - Math.max(b.left, L.left)
      const oy = Math.min(b.bottom, L.bottom) - Math.max(b.top, L.top)
      if (ox <= 0 || oy <= 0) continue
      // Geometry is the assertion; the hit test is reported alongside it so a
      // failure says whether the launcher merely overlaps the control or
      // actually takes taps from it.
      let stolen = 0
      let sampled = 0
      for (let fx = 0.02; fx <= 0.99; fx += 0.02) {
        for (let fy = 0.1; fy <= 0.95; fy += 0.2) {
          const x = b.left + b.width * fx
          const y = b.top + b.height * fy
          if (x < 0 || y < 0 || x > window.innerWidth || y > window.innerHeight) continue
          sampled += 1
          const top = document.elementFromPoint(x, y)
          if (top === launcher || launcher.contains(top)) stolen += 1
        }
      }
      intrusions.push({
        label: (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 40),
        rect: [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)],
        overlap: `${Math.round(ox)}x${Math.round(oy)}`,
        stolen,
        sampled,
      })
    }
    return {
      launcher: [Math.round(L.left), Math.round(L.top), Math.round(L.right), Math.round(L.bottom)],
      controls,
      intrusions,
    }
  })
}

test.describe('the chat launcher does not take taps from /contact', () => {
  for (const phone of PHONES) {
    test(`no control on /contact enters the launcher column at ${phone.name}`, async ({ page }) => {
      await page.setViewportSize({ width: phone.width, height: phone.height })
      await page.goto('/contact', { waitUntil: 'networkidle' })

      const max = await page.evaluate(
        () => document.documentElement.scrollHeight - window.innerHeight,
      )
      // Sampling only the document end is how this defect hides: the launcher
      // is fixed, so the button clears it there on its own.
      const stops = [...new Set([0, Math.round(max * 0.25), Math.round(max * 0.5), Math.round(max * 0.75), max].filter((n) => n >= 0))]

      const found: string[] = []
      let controlsSeen = 0
      let sawLauncher = false

      for (const y of stops) {
        const reading = await readAt(page, y)
        if (reading.launcher) sawLauncher = true
        controlsSeen = Math.max(controlsSeen, reading.controls)
        for (const i of reading.intrusions) {
          found.push(
            `scrollY=${y} "${i.label}" rect=[${i.rect}] overlap=${i.overlap} launcherWinsHitTest=${i.stolen}/${i.sampled}`,
          )
        }
      }

      // Two vacuity guards. Without them "nothing intruded" is satisfied by a
      // page that rendered no launcher, or by a selector that matched no
      // control — both of which look exactly like a pass.
      expect(sawLauncher, 'the launcher never rendered, so this measured nothing').toBe(true)
      expect(
        controlsSeen,
        'no page controls were in view, so the launcher had nothing to overlap',
      ).toBeGreaterThan(4)

      expect(found, 'controls overlapping the chat launcher').toEqual([])
    })
  }

  test('the reserve is scoped to below the sm breakpoint', async ({ page }) => {
    // This pins where the reserve is *declared*, and that is all it pins --
    // worth being explicit about, because the 640 assertion has no rendered
    // consequence behind it. The card is `max-w-lg`, and at 640 the wrapper's
    // content box is already 592px -- wider still above that -- so a 512px
    // card never feels the inset: dropping the `max-sm:` prefix changes no
    // pixel at any width. Measured at 640, 768, 1024 and 1440, the card is
    // 512px with the prefix and 512px without it.
    //
    // So this is a scope check, not a geometry check. It is here because 640
    // is where the launcher's own `sm:mr-12` moves it clear unaided, and a
    // reserve left switched on above that point is paying for something
    // already true -- cheap to state, and invisible to every other test.
    //
    // The gap assertions below are the geometry, and they are what stop this
    // passing by pinning a breakpoint while the controls stop clearing.
    const readings: Record<number, { padding: string; gap: number }> = {}
    for (const width of [639, 640]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/contact', { waitUntil: 'networkidle' })
      const reading = await page.evaluate(() => {
        const submit = [...document.querySelectorAll('button')].find(
          (b) => (b.textContent ?? '').trim() === 'Send Message',
        )
        const wrapper = submit?.closest('form')?.parentElement
        const launcher = document.querySelector('button[aria-label="Open chat"]')
        if (!submit || !wrapper || !launcher) return null
        return {
          padding: getComputedStyle(wrapper).paddingRight,
          gap: Math.round(
            launcher.getBoundingClientRect().left - submit.getBoundingClientRect().right,
          ),
        }
      })
      expect(reading, `the form, its wrapper or the launcher was not found at ${width}`).not.toBeNull()
      readings[width] = reading!
    }

    expect(readings[639].padding, 'the reserve is not applied just below the sm breakpoint').not.toBe('0px')
    expect(readings[640].padding, 'the reserve is still applied at sm, where the launcher already clears').toBe('0px')
    // The property itself, on both sides, so this cannot pass by pinning the
    // breakpoint while the controls stop clearing.
    expect(readings[639].gap, 'controls run into the launcher just below sm').toBeGreaterThanOrEqual(0)
    expect(readings[640].gap, 'controls run into the launcher at sm').toBeGreaterThanOrEqual(0)
  })

  test('the reserved column costs no vertical space', async ({ page }) => {
    // This pins the reserve's *placement*, not its size. On the card wrapper
    // the inset narrows the card and nothing else, so document height does not
    // move at any value from 16 to 56 -- this test passes at all of them and
    // cannot choose between them. What chose 32 is the width floor two tests
    // down, and the focus ring one test below that.
    //
    // What it does catch is the reserve moving back to the page column, where
    // it narrows the centred subtitle to a third line and adds 28px of
    // document. The vacuity check below is the mechanism: it reads this
    // wrapper's padding and finds none once the reserve has been lifted off it.
    //
    // Differential rather than absolute, so it stays true when the form gains
    // a field -- it measures the reserve rather than the content.
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/contact', { waitUntil: 'networkidle' })

    const measured = await page.evaluate(() => {
      const submit = [...document.querySelectorAll('button')].find(
        (b) => (b.textContent ?? '').trim() === 'Send Message',
      )
      if (!submit) return null
      // The wrapper around the card is what carries the reserve. Reading the
      // page container instead measures an element with no reserve on it,
      // which the vacuity check below then rejects.
      const container = submit.closest('form')?.parentElement as HTMLElement | null
      if (!container) return null

      const withReserve = {
        doc: document.documentElement.scrollHeight,
        submitBottom: Math.round(submit.getBoundingClientRect().bottom),
      }
      // The baseline is the wrapper with no reserve at all, which is what the
      // page had before it existed. Collapsing one side against the other
      // would compare nothing now that the insets are symmetric.
      const reserved = getComputedStyle(container).paddingRight
      container.style.paddingLeft = '0px'
      container.style.paddingRight = '0px'
      void container.offsetHeight
      const withoutReserve = {
        doc: document.documentElement.scrollHeight,
        submitBottom: Math.round(submit.getBoundingClientRect().bottom),
      }
      container.style.paddingLeft = ''
      container.style.paddingRight = ''
      return { withReserve, withoutReserve, reserved }
    })

    expect(measured, 'the submit button or its page container was not found').not.toBeNull()
    // Vacuity: if the reserve were not applied at this width, both readings
    // would be the same page and the comparison would assert nothing.
    expect(
      measured!.reserved,
      'no reserve is applied at this width, so this compares two identical layouts',
    ).not.toBe('0px')
    expect(
      measured!.withReserve.doc,
      'the reserved column made the document taller',
    ).toBe(measured!.withoutReserve.doc)
    expect(
      measured!.withReserve.submitBottom,
      'the reserved column pushed the primary action further down the page',
    ).toBe(measured!.withoutReserve.submitBottom)
  })

  test('the reserved column is only as wide as the launcher needs', async ({ page }) => {
    // A fix that reserved the whole right half of the page would satisfy the
    // test above and be a worse page. This bounds it from the other side: the
    // form still has to use most of the width it is given.
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/contact', { waitUntil: 'networkidle' })

    const measured = await page.evaluate(() => {
      const submit = [...document.querySelectorAll('button')].find(
        (b) => (b.textContent ?? '').trim() === 'Send Message',
      )
      const launcher = document.querySelector('button[aria-label="Open chat"]')
      if (!submit || !launcher) return null
      return {
        submit: Math.round(submit.getBoundingClientRect().width),
        gap: Math.round(
          launcher.getBoundingClientRect().left - submit.getBoundingClientRect().right,
        ),
        viewport: window.innerWidth,
      }
    })

    expect(measured, 'the submit button or the launcher was not found').not.toBeNull()
    expect(
      measured!.submit,
      'the submit button gave up more width than clearing the launcher needs',
    ).toBeGreaterThan(measured!.viewport * 0.6)
    expect(measured!.gap, 'the submit button still runs into the launcher column').toBeGreaterThanOrEqual(0)
  })

  test("the submit button's focus ring clears the launcher too", async ({ page }) => {
    // The hit target clearing the launcher is not enough. `ACTION_FOCUS` is
    // `outline-2 outline-offset-2`, so the ring reaches 4px past the button's
    // edge -- at a 24px card inset the button is clear and its focus ring
    // still renders under the launcher, which is a keyboard-only defect that
    // every geometry assertion above would pass.
    //
    // Reached by Tab rather than `.focus()`: Chromium's `:focus-visible`
    // heuristic does not fire for programmatic focus, so a script-focused
    // button reports no ring at all and this would measure nothing.
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/contact', { waitUntil: 'networkidle' })

    await page.locator('textarea').focus()
    await page.keyboard.press('Tab')

    // The button carries `transition-all`, so reading straight after the Tab
    // returns the transition's starting values -- `medium`/`currentcolor`,
    // which compute to 3px width at 0px offset and reach 1px LESS than the
    // settled ring. That is looser than the real geometry in exactly the
    // direction that lets a defect through, and it also satisfies the two
    // vacuity checks below with the "ring that means nothing" state they exist
    // to reject.
    //
    // Settled by agreement rather than by a timeout or a hardcoded `2px`: the
    // values belong to ACTION_FOCUS, and pinning them here would make this
    // test fail for a change to the ring rather than for a change to the
    // clearance it is measuring.
    await page.waitForFunction(() => {
      const el = document.activeElement
      if (!el) return false
      const style = getComputedStyle(el)
      const sample = `${style.outlineWidth}|${style.outlineOffset}|${style.outlineColor}`
      const store = window as unknown as { __ringSample?: string }
      const settled = store.__ringSample === sample
      store.__ringSample = sample
      return settled
    })

    const measured = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null
      if (!active || active.tagName !== 'BUTTON') return null
      const style = getComputedStyle(active)
      const reach = parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset)
      const b = active.getBoundingClientRect()
      const L = document.querySelector('button[aria-label="Open chat"]')!.getBoundingClientRect()
      return {
        label: (active.textContent ?? '').trim(),
        outlineWidth: parseFloat(style.outlineWidth),
        outlineStyle: style.outlineStyle,
        reach,
        ringGap: Math.round(L.left - (b.right + reach)),
      }
    })

    expect(measured, 'Tab did not land on a button').not.toBeNull()
    expect(measured!.label, 'Tab landed on the wrong control').toBe('Send Message')
    // Vacuity: a ring of zero width, or one whose style is `none`, would make
    // `reach` meaningless and the clearance trivially true. `outlineWidth`
    // reports the user-agent default even when the style is `none`, so both
    // have to be checked.
    expect(measured!.outlineStyle, 'no focus ring is drawn, so its clearance means nothing').not.toBe('none')
    expect(measured!.outlineWidth, 'the focus ring has no width').toBeGreaterThan(0)
    expect(
      measured!.ringGap,
      'the submit button clears the launcher but its focus ring does not',
    ).toBeGreaterThanOrEqual(0)
  })
})
