import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import DeferredImage from './deferred-image'

/**
 * The props the category grid needs and the home grid does not.
 *
 * `listing-image.test.tsx` covers the shared mechanism through the home grid's
 * composition of this component — deferral, the observer margin, the box
 * surviving the swap. What is here is the `priority` path, which only the
 * category grid uses and which is the one way this component can quietly make
 * a page slower: a preloaded image that gets deferred is not preloaded at all,
 * and every request count in `e2e/image-deferral.spec.ts` would improve while
 * largest-contentful-paint got worse.
 */

const PROPS = {
  src: '/images/1/example.webp',
  alt: '',
  sizes: '350px',
  className: 'h-full w-full object-cover',
}

let observed: Element[]

beforeEach(() => {
  observed = []
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe = (element: Element) => {
        observed.push(element)
      }
      unobserve = vi.fn()
      disconnect = vi.fn()
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

describe('DeferredImage', () => {
  it('renders a priority image immediately and registers no observer', () => {
    const { container } = render(<DeferredImage {...PROPS} priority />)

    expect(container.querySelectorAll('img')).toHaveLength(1)
    // The load-bearing half. `priority` without this is a contradiction: the
    // point of preloading is to start the request before layout says the
    // element is near, and an observer is layout saying exactly that.
    expect(observed).toHaveLength(0)
  })

  it('marks a priority image as not lazy, which is what react-dom preloads on', () => {
    const { container } = render(<DeferredImage {...PROPS} priority />)
    const image = container.querySelector('img')

    // Deliberately not `fetchpriority`: `next/image` sets none, as the
    // category page's own comment records. What makes the preload happen is
    // react-dom preloading any image that is not `loading="lazy"`, so that
    // attribute is the observable half. An ordinary card below is lazy, which
    // is what stops the whole grid preloading.
    expect(image?.getAttribute('loading')).not.toBe('lazy')

    const { container: ordinary } = render(<DeferredImage {...PROPS} eager />)
    expect(ordinary.querySelector('img')?.getAttribute('loading')).toBe('lazy')
  })

  it('defers an ordinary image', () => {
    const { container } = render(<DeferredImage {...PROPS} />)
    expect(container.querySelectorAll('img')).toHaveLength(0)
    expect(observed).toHaveLength(1)
  })

  it('keeps the caller-supplied classes on the image', () => {
    // A fresh render rather than a rerender: `eager` seeds initial state, so
    // flipping it on a mounted component does nothing. That is fine — it is a
    // per-card constant — but a test that used `rerender` would be asserting
    // against a component that never showed its image.
    const { container } = render(<DeferredImage {...PROPS} eager />)

    // The caller owns the box, so it also owns how the image sits in it. The
    // category grid needs `object-cover`; the home grid needs `h-auto`. A
    // component that imposed one would silently restyle the other.
    expect(container.querySelector('img')?.className).toBe(PROPS.className)
  })
})
