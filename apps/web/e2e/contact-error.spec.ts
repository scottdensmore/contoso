import { test, expect, Page } from '@playwright/test'

/**
 * A failed contact submission has to reach the person who made it.
 *
 * Measured on the build before this guard, at 390x844 with `/api/contact`
 * forced to 500: the error rendered as a plain `<p>`, the page contained
 * **zero** elements with `role="alert"`, and `document.activeElement` was
 * `BODY`. So the failure was neither announced nor reachable — a screen reader
 * was told nothing, and a keyboard user was returned to the top of the document
 * at the moment the form reported a problem (#326).
 *
 * Every query for the region is scoped to the `<form>`, because there are two
 * alerts on this page and only one of them is visible to an in-page audit.
 * Next renders `<next-route-announcer>` with a **shadow root** containing
 * `<div role="alert" aria-live="assertive" id="__next-route-announcer__">`.
 * `document.querySelectorAll('[role="alert"]')` reports 1 — it does not pierce
 * shadow DOM — while Playwright's role engine does, reports 2, and fails an
 * unscoped `getByRole('alert')` on strict mode. Both counts are correct; they
 * are answers to different questions, which is worth knowing before concluding
 * from a console one-liner that the scoping is unnecessary.
 *
 * That is the ambiguity `chat.tsx` avoids by not adding a second
 * `role="status"`. Here the second element is Next's rather than ours, so
 * scoping is the answer rather than dropping the role.
 *
 * The focus half of that is guarded here rather than in `contact-form.test.tsx`
 * for a concrete reason: a jsdom version of it passed with the fix removed
 * entirely, because disabling the focused button does not blur it under jsdom.
 * The defect cannot occur there, so the assertion measured nothing. A real
 * browser blurs, which is the only place this can be checked.
 */

const PHONE = { width: 390, height: 844 }
const SERVER_ERROR = 'Measured server error'

async function fillAndFail(page: Page) {
  await page.route('**/api/contact', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: SERVER_ERROR }),
    }),
  )
  await page.setViewportSize(PHONE)
  await page.goto('/contact', { waitUntil: 'networkidle' })
  await page.getByLabel('Name').fill('Ada')
  await page.getByLabel('Email').fill('ada@example.test')
  await page.getByLabel('Subject').fill('Support')
  await page.getByLabel(/message/i).fill('The order never arrived.')
}

test.describe('a failed contact submission', () => {
  test('is announced through a region that was already there', async ({ page }) => {
    await fillAndFail(page)

    // The region has to exist before the content arrives. A live region that
    // appears at the same moment as its text is not reliably announced, so an
    // alert that only renders on failure is a fix that does not work.
    const alert = page.locator('form').getByRole('alert')
    await expect(alert).toBeAttached()
    expect(
      (await alert.textContent())?.trim(),
      'the region should be empty before a submission fails',
    ).toBe('')

    await page.getByRole('button', { name: /send message/i }).click()

    await expect(alert).toHaveText(SERVER_ERROR)

    // The announced node and the visible node are the same element, so they
    // cannot drift apart the way an sr-only copy beside a visible one can.
    const sameNode = await page.evaluate((message) => {
      const region = document.querySelector('form [role="alert"]')
      const visible = [...document.querySelectorAll('p')].find(
        (p) => p.textContent?.trim() === message,
      )
      return region !== null && region === visible
    }, SERVER_ERROR)
    expect(sameNode, 'the visible error is a different node from the announced one').toBe(true)
  })

  test('leaves focus on the control that was pressed', async ({ page }) => {
    await fillAndFail(page)

    const submit = page.getByRole('button', { name: /send message/i })
    await submit.focus()
    await submit.click()
    await expect(page.locator('form').getByRole('alert')).toHaveText(SERVER_ERROR)

    const landed = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null
      return {
        tag: active?.tagName ?? 'none',
        label: (active?.textContent ?? '').trim().slice(0, 20),
        isBody: active === document.body,
      }
    })

    expect(
      landed.isBody,
      'focus was dumped to the document body when the submission failed',
    ).toBe(false)
    expect(landed.tag).toBe('BUTTON')
    expect(landed.label).toContain('Send Message')
  })

  test('leaves focus alone when submitting from a field, where it was never lost', async ({ page }) => {
    // Only the submit button is disabled while a request is in flight, so an
    // implicit submit -- Enter from a text field -- never loses focus. Moving
    // it to the button anyway would take someone out of the field they were
    // typing in, and would put a focus change in the same tick as an assertive
    // announcement for no gain. This is the path the click test cannot see.
    await fillAndFail(page)

    await page.getByLabel('Subject').focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('form').getByRole('alert')).toHaveText(SERVER_ERROR)

    const landed = await page.evaluate(() => {
      const active = document.activeElement as HTMLElement | null
      return { tag: active?.tagName ?? 'none', id: active?.id ?? '' }
    })

    expect(landed.tag, 'the failure moved focus off the field being typed in').toBe('INPUT')
    expect(landed.id).toBe('subject')
  })

  test('announces a second identical failure as well as the first', async ({ page }) => {
    // A live region announces a *change*. Submitting twice and failing the same
    // way both times produces the same string, so without the `setError("")`
    // reset at the top of the handler the second failure writes an identical
    // value, mutates nothing, and is never spoken. That reset reads like
    // redundant tidying; this is what makes removing it fail.
    await fillAndFail(page)
    const alert = page.locator('form').getByRole('alert')
    const submit = page.getByRole('button', { name: /send message/i })

    await page.evaluate(() => {
      const region = document.querySelector('form [role="alert"]')!
      const seen: string[] = []
      ;(window as unknown as { __alertLog: string[] }).__alertLog = seen
      new MutationObserver(() => seen.push((region.textContent ?? '').trim())).observe(region, {
        childList: true,
        characterData: true,
        subtree: true,
      })
    })

    await submit.click()
    await expect(alert).toHaveText(SERVER_ERROR)
    await submit.click()
    await expect(alert).toHaveText(SERVER_ERROR)

    const log = await page.evaluate(
      () => (window as unknown as { __alertLog: string[] }).__alertLog,
    )
    // The empty string between the two identical messages is the whole point:
    // it is the transition the second announcement depends on.
    expect(log.filter((entry) => entry === SERVER_ERROR).length).toBeGreaterThanOrEqual(2)
    expect(log, 'no empty state between the two failures, so the second is silent').toContain('')
  })

  test('the error text meets AA against the card it is printed on', async ({ page }) => {
    // The card is `bg-white/90` over a photograph, so its computed
    // `backgroundColor` is not what is on screen -- the effective surface is
    // about rgb(234,234,233). `text-red-600` measures 4.77:1 on white and
    // 3.96-4.02:1 there, failing AA for 14px text. Nothing else in this file
    // would notice that token changing back.
    //
    // Pixels rather than the class, following `e2e/support/boundary.ts`: this
    // repository has a written history of colour assertions that credited what
    // CSS was asked for rather than what was painted.
    await fillAndFail(page)
    await page.getByRole('button', { name: /send message/i }).click()
    const alert = page.locator('form').getByRole('alert')
    await expect(alert).toHaveText(SERVER_ERROR)

    const shot = (await alert.screenshot()).toString('base64')
    const measured = await page.evaluate(async (encoded) => {
      const image = new Image()
      image.src = `data:image/png;base64,${encoded}`
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const context = canvas.getContext('2d')!
      context.drawImage(image, 0, 0)
      const data = context.getImageData(0, 0, canvas.width, canvas.height).data

      const counts = new Map<string, number>()
      for (let i = 0; i < data.length; i += 4) {
        const key = `${data[i]},${data[i + 1]},${data[i + 2]}`
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
      const luminance = ([r, g, b]: number[]) => {
        const channel = (value: number) => {
          const v = value / 255
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
        }
        return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
      }
      // Frequency alone picks the wrong pixel: where the message wraps to three
      // lines the glyph colour is the most common one in the crop. Take the
      // darkest and lightest colours that appear often enough to be real.
      const frequent = [...counts.entries()]
        .map(([key, n]) => [key.split(',').map(Number), n] as [number[], number])
        .filter(([, n]) => n > 20)
        .sort((a, b) => luminance(a[0]) - luminance(b[0]))
      if (frequent.length < 2) return null
      const glyph = frequent[0][0]
      const background = frequent[frequent.length - 1][0]
      const [high, low] = [luminance(glyph), luminance(background)].sort((a, b) => b - a)
      return {
        glyph,
        background,
        ratio: (high + 0.05) / (low + 0.05),
        distinctColours: frequent.length,
      }
    }, shot)

    expect(measured, 'the rendered error produced too few distinct colours to sample').not.toBeNull()
    // Vacuity: an empty or single-colour crop would give a ratio of 1 and no
    // glyph to measure, which is a broken sample rather than a failing colour.
    expect(measured!.distinctColours).toBeGreaterThan(2)
    expect(
      measured!.ratio,
      `error text ${measured!.glyph} on ${measured!.background} is below WCAG AA for 14px text`,
    ).toBeGreaterThanOrEqual(4.5)
  })

  test('the always-present region costs no layout while it is empty', async ({ page }) => {
    // The region is rendered even when idle, which is what makes the
    // announcement work, and that has to cost nothing -- anything growing here
    // pushes the page's primary action further below the fold (#286, #339).
    //
    // What this pins is the invariance, not a mechanism. The invariance comes
    // from margin collapsing through a zero-height block; an earlier version of
    // the component carried an `empty:mt-0` to force it, and this test passed
    // identically with that class present and absent, because the class was
    // inert -- Tailwind v4's `space-y-6` sets `margin-bottom`, not
    // `margin-top`. The mutation is what established that; the assertion below
    // cannot tell the two apart and is not meant to.
    //
    // Differential rather than absolute: it removes the region and re-measures,
    // so it stays true when the form gains a field.
    await page.setViewportSize(PHONE)
    await page.goto('/contact', { waitUntil: 'networkidle' })

    const measured = await page.evaluate(() => {
      const submit = [...document.querySelectorAll('button')].find(
        (b) => (b.textContent ?? '').trim() === 'Send Message',
      )
      const region = document.querySelector('form [role="alert"]') as HTMLElement | null
      if (!submit || !region) return null

      // Read before detaching. A computed style read from a removed element
      // returns empty strings, which would pass a `toBe("0px")` check for the
      // wrong reason if the assertion were written the other way round.
      const marginTop = getComputedStyle(region).marginTop
      const height = Math.round(region.getBoundingClientRect().height)
      const text = (region.textContent ?? '').trim()

      const withRegion = {
        submitTop: Math.round(submit.getBoundingClientRect().top),
        doc: document.documentElement.scrollHeight,
      }
      region.remove()
      void document.body.offsetHeight
      const withoutRegion = {
        submitTop: Math.round(submit.getBoundingClientRect().top),
        doc: document.documentElement.scrollHeight,
      }
      return { withRegion, withoutRegion, height, marginTop, text }
    })

    expect(measured, 'the submit button or the alert region was not found').not.toBeNull()
    // Vacuity: with text in it the region is supposed to take space, so this
    // only means anything while it is empty.
    expect(measured!.text, 'the region already had content, so this measured a filled one').toBe('')
    // Height, not margin. Tailwind v4's `space-y-6` sets `margin-block-end`,
    // so `margin-top` reads 0px for every non-last child of this form whatever
    // the region contains -- an assertion on it passes identically on a filled
    // region taking 20px of content, which is the state it claims to reject.
    // Zero height is what makes the margins collapse, and it fails the moment
    // someone adds a `min-h-5` like `avatar-upload.tsx` carries.
    expect(measured!.height, 'the empty region occupies vertical space').toBe(0)
    expect(
      measured!.withRegion.submitTop,
      'the empty region pushed the submit button down',
    ).toBe(measured!.withoutRegion.submitTop)
    expect(measured!.withRegion.doc, 'the empty region made the document taller').toBe(
      measured!.withoutRegion.doc,
    )
  })
})
