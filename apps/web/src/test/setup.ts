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
