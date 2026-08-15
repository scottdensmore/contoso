import '@testing-library/jest-dom'
import { vi } from 'vitest'

// jsdom implements no media queries at all, so `window.matchMedia` is simply
// absent and any component that asks about the viewport throws on mount rather
// than failing an assertion.
//
// Reports "does not match" for everything, which for a `min-width` query means
// the narrowest case. A test that cares which side of a breakpoint it is on
// replaces this per-test — `chat.test.tsx` does — rather than relying on the
// default meaning anything.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

// jsdom implements no intersection logic either, so `IntersectionObserver` is
// absent and any component that defers work until an element is near the
// viewport throws on mount rather than failing an assertion.
//
// This one observes and never fires, which for a deferred image means the
// not-yet-visible case — the same choice as `matchMedia` above, where the
// default is the state a component starts in rather than the one it reaches. A
// test that cares about what happens when the element does arrive drives the
// callback itself; `listing-image.test.tsx` does, and that is the only way the
// visible case should ever be reached, since a default that fired immediately
// would make every deferral test pass without deferring anything.
if (!window.IntersectionObserver) {
  window.IntersectionObserver = class {
    readonly root = null
    readonly rootMargin = ''
    readonly thresholds: readonly number[] = []
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = vi.fn()
    takeRecords = () => []
    constructor(
      _callback: IntersectionObserverCallback,
      _options?: IntersectionObserverInit,
    ) {}
  } as unknown as typeof window.IntersectionObserver
}

// Mock next/router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
