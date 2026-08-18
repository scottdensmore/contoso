import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSession } from 'next-auth/react'
import ContactPage from './contact/page'
import ContactThanksPage from './contact/thanks/page'
import ProfilePage from './profile/page'

vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('@/components/header', () => ({
  default: () => <header />,
}))

function renderInsideApplicationMain(route: ReactNode) {
  render(<main>{route}</main>)
}

describe('route landmark semantics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('keeps the contact route inside the application main landmark', () => {
    renderInsideApplicationMain(<ContactPage />)

    expect(screen.getAllByRole('main')).toHaveLength(1)
  })

  it('keeps the contact thanks route inside the application main landmark', () => {
    renderInsideApplicationMain(<ContactThanksPage />)

    expect(screen.getAllByRole('main')).toHaveLength(1)
  })

  it('keeps the signed-out profile route inside the application main landmark', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: vi.fn(),
    })
    renderInsideApplicationMain(<ProfilePage />)

    expect(screen.getAllByRole('main')).toHaveLength(1)
  })
})
