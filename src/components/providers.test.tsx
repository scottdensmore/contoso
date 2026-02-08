import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import Providers from './providers'
import { SessionProvider } from 'next-auth/react'

vi.mock('next-auth/react', () => ({
  SessionProvider: vi.fn(({ children }) => <div>{children}</div>),
}))

describe('Providers', () => {
  it('renders SessionProvider', () => {
    render(<Providers><div>Test</div></Providers>)
    expect(SessionProvider).toHaveBeenCalled()
  })
})
