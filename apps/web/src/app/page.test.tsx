import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { promises as fs } from 'fs'
import Home from './page'
import type { ProductGroup } from '@/lib/types'

vi.mock('@/components/header', () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}))

vi.mock('@/components/block', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('Home page', () => {
  // Against the real `public/categories.json`, which is what the page reads.
  // The category page's equivalent test mocks its data source, so the two
  // together cover the same property from both directions.
  it('names a product card once', async () => {
    const catalogue: ProductGroup[] = JSON.parse(
      await fs.readFile(`${process.cwd()}/public/categories.json`, 'utf8'),
    )
    const product = catalogue[0].products[0]

    render(await Home())

    // The card is one link, so its image, if it describes itself, is read out
    // as part of the link's name. `alt={product.name}` used to make that name
    // the product's name twice; `getByRole` computes the name the way a
    // screen reader does, which is the part `getByText` cannot see.
    expect(screen.getByRole('link', { name: product.name })).toBeDefined()
  })
})
