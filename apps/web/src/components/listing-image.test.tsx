import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import ListingImage from './listing-image'

/**
 * The deferral itself, at the level the journeys cannot reach cheaply.
 *
 * `e2e/image-deferral.spec.ts` measures what the browser asks the server for,
 * which is the property that matters and the one that regressed in #230. What
 * it cannot do is drive the observer directly, so these cover the two states
 * and the transition between them without waiting on a real viewport.
 */

const PROPS = {
  src: '/images/1/example.webp',
  alt: '',
  sizes: '350px',
}

/** Callbacks registered by the component, newest last. */
let callbacks: IntersectionObserverCallback[]
let options: (IntersectionObserverInit | undefined)[]
let observed: Element[]
let disconnects: number

beforeEach(() => {
  callbacks = []
  options = []
  observed = []
  disconnects = 0
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(
        callback: IntersectionObserverCallback,
        init?: IntersectionObserverInit,
      ) {
        callbacks.push(callback)
        options.push(init)
      }
      observe = (element: Element) => {
        observed.push(element)
      }
      unobserve = vi.fn()
      disconnect = () => {
        disconnects += 1
      }
      takeRecords = () => []
      root = null
      rootMargin = ''
      thresholds = []
    },
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

/** Fire the most recently registered observer as if the box had arrived. */
function arrive() {
  const callback = callbacks[callbacks.length - 1]
  act(() => {
    callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
  })
}

describe('ListingImage', () => {
  it('renders no image until the box is nearly on screen', () => {
    const { container } = render(<ListingImage {...PROPS} />)

    // Only the `<noscript>` source, which is inert markup here: jsdom parses
    // noscript content as text, so it contributes no element to query.
    expect(container.querySelectorAll('img')).toHaveLength(0)
    expect(observed).toHaveLength(1)

    // The margin is the whole tuning decision, and it is the one direction no
    // other check can see: drop the options argument entirely and every count
    // in `e2e/image-deferral.spec.ts` gets *better* while the page gets worse,
    // because fewer requests is exactly what a too-small margin looks like.
    // What it costs is the lead time measured at the constant's definition —
    // at 1000ms optimiser latency, 14 of 20 cards grey as they enter.
    expect(options[0]?.rootMargin).toBe('1200px')
  })

  it('renders the image once the box arrives, and stops observing', () => {
    const { container } = render(<ListingImage {...PROPS} />)
    expect(container.querySelectorAll('img')).toHaveLength(0)

    arrive()

    const images = container.querySelectorAll('img')
    expect(images).toHaveLength(1)
    // What this catches beyond "an img appeared": `next/image` rewrites the
    // src through the optimiser, so a component that fell back to a plain
    // `<img src={src}>` would satisfy the count and still ship the 1024px
    // source to a 350px box.
    expect(images[0].getAttribute('src')).toContain('/_next/image')
    expect(disconnects).toBeGreaterThan(0)
  })

  it('renders the image immediately when eager, and registers no observer', () => {
    const { container } = render(<ListingImage {...PROPS} eager />)

    expect(container.querySelectorAll('img')).toHaveLength(1)
    // The eager path is what the first screen depends on. An observer here
    // would mean those cards still wait for hydration, which is the hole that
    // `eager={i <= 1}` on the home grid exists to close.
    expect(observed).toHaveLength(0)
  })

  it('reserves the same box in both states', () => {
    const { container: deferred } = render(<ListingImage {...PROPS} />)
    const { container: immediate } = render(<ListingImage {...PROPS} eager />)

    const box = (root: HTMLElement) => root.querySelector('div')?.className

    // The reserved box and the loaded box are one element, so this is really
    // asserting that the tone and the aspect ratio do not live on something
    // that unmounts -- the defect where a scrolling visitor sees a fully
    // transparent gap rather than a placeholder.
    expect(box(deferred)).toBe(box(immediate))
    expect(box(deferred)).toContain('aspect-square')
    expect(box(deferred)).toContain('bg-zinc-200')
  })

  it('keeps the image decorative so the card is not announced twice', () => {
    render(<ListingImage {...PROPS} eager />)

    // `alt=""` is what makes the surrounding link's accessible name the
    // product name once rather than twice. See e2e/browse.spec.ts and #200.
    expect(screen.queryByRole('img')).toBeNull()
  })
})
