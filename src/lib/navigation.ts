import { Session } from 'next-auth'

export interface NavLink {
  title: string
  href: string
}

export interface NavSection {
  title: string
  links: NavLink[]
}

export function getSidebarLinks(session: Session | null, categories: any[]): NavSection[] {
  const sections: NavSection[] = []

  // General Section
  sections.push({
    title: 'General',
    links: [
      { title: 'Home', href: '/' },
    ],
  })

  // Shop Section
  sections.push({
    title: 'Shop',
    links: categories.map(cat => ({
      title: tabName(cat.name),
      href: `/products/category/${cat.slug || cat.name.toLowerCase()}`,
    })),
  })

  // Account Section
  const accountLinks: NavLink[] = []
  if (session) {
    accountLinks.push({ title: 'Profile', href: '/profile' })
    accountLinks.push({ title: 'Sign Out', href: '/api/auth/signout' })
  } else {
    accountLinks.push({ title: 'Sign In', href: '/login' })
    accountLinks.push({ title: 'Sign Up', href: '/signup' })
  }
  sections.push({
    title: 'Account',
    links: accountLinks,
  })

  // Support Section
  sections.push({
    title: 'Support',
    links: [
      { title: 'About Us', href: '/about' },
      { title: 'Contact', href: '/contact' },
      { title: 'FAQ', href: '/faq' },
    ],
  })

  return sections
}

function tabName(name: string) {
  return name.charAt(0).toUpperCase() + name.slice(1)
}
