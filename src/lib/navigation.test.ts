import { describe, it, expect } from 'vitest'
import { getSidebarLinks } from './navigation'

describe('Navigation Utility', () => {
  const mockCategories = [
    { id: '1', name: 'Hiking', slug: 'hiking' },
    { id: '2', name: 'Camping', slug: 'camping' },
  ]

  it('should return correct links for unauthenticated user', () => {
    const session = null
    const result = getSidebarLinks(session, mockCategories as any)

    expect(result).toHaveLength(3) // Shop, Account, Support

    const shop = result.find(s => s.title === 'Shop')
    expect(shop?.links).toHaveLength(2)
    expect(shop?.links[0].title).toBe('Hiking')
    expect(shop?.links[0].href).toBe('/products/category/hiking')

    const account = result.find(s => s.title === 'Account')
    expect(account?.links).toHaveLength(2)
    expect(account?.links.map(l => l.title)).toContain('Sign In')
    expect(account?.links.map(l => l.title)).toContain('Sign Up')

    const support = result.find(s => s.title === 'Support')
    expect(support?.links).toHaveLength(3)
  })

  it('should return correct links for authenticated user', () => {
    const session = { user: { name: 'Test User' } }
    const result = getSidebarLinks(session as any, mockCategories as any)

    const account = result.find(s => s.title === 'Account')
    expect(account?.links).toHaveLength(2)
    expect(account?.links.map(l => l.title)).toContain('Profile')
    expect(account?.links.map(l => l.title)).toContain('Sign Out')
  })
})