import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductFilter, { type CategoryProductCard } from './product-filter'

const mockProducts: CategoryProductCard[] = [
  {
    id: 'prod-1',
    name: 'Alpine Trail Tent',
    slug: 'alpine-trail-tent',
    price: 299.99,
    image: '/images/tent.webp',
  },
  {
    id: 'prod-2',
    name: 'Summit Hiking Boots',
    slug: 'summit-hiking-boots',
    price: 159.50,
    image: '/images/boots.webp',
  },
  {
    id: 'prod-3',
    name: 'Backpack 50L',
    slug: 'backpack-50l',
    price: 89.00,
    image: null,
  },
]

describe('ProductFilter Component', () => {
  it('renders all products initially and displays correct count announcement', () => {
    render(<ProductFilter products={mockProducts} categoryName="Hiking" />)

    expect(screen.getByText('Alpine Trail Tent')).toBeInTheDocument()
    expect(screen.getByText('Summit Hiking Boots')).toBeInTheDocument()
    expect(screen.getByText('Backpack 50L')).toBeInTheDocument()

    const counter = screen.getByText('Showing 3 of 3 products')
    expect(counter).toBeInTheDocument()
    expect(counter).toHaveAttribute('aria-live', 'polite')
  })

  it('filters products by query matching product name', () => {
    render(<ProductFilter products={mockProducts} categoryName="Hiking" />)

    const searchInput = screen.getByRole('textbox', { name: /search hiking/i })
    fireEvent.change(searchInput, { target: { value: 'Boots' } })

    expect(screen.getByText('Summit Hiking Boots')).toBeInTheDocument()
    expect(screen.queryByText('Alpine Trail Tent')).not.toBeInTheDocument()
    expect(screen.queryByText('Backpack 50L')).not.toBeInTheDocument()
    expect(screen.getByText('Showing 1 of 3 products')).toBeInTheDocument()
  })

  it('performs case-insensitive search', () => {
    render(<ProductFilter products={mockProducts} categoryName="Hiking" />)

    const searchInput = screen.getByRole('textbox', { name: /search hiking/i })
    fireEvent.change(searchInput, { target: { value: 'alpine' } })

    expect(screen.getByText('Alpine Trail Tent')).toBeInTheDocument()
    expect(screen.queryByText('Summit Hiking Boots')).not.toBeInTheDocument()
  })

  it('shows clear search button when text is present and clears search on click', () => {
    render(<ProductFilter products={mockProducts} categoryName="Hiking" />)

    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument()

    const searchInput = screen.getByRole('textbox', { name: /search hiking/i })
    fireEvent.change(searchInput, { target: { value: 'tent' } })

    const clearButton = screen.getByRole('button', { name: /clear search/i })
    expect(clearButton).toBeInTheDocument()

    fireEvent.click(clearButton)

    expect(searchInput).toHaveValue('')
    expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument()
    expect(screen.getByText('Alpine Trail Tent')).toBeInTheDocument()
    expect(screen.getByText('Summit Hiking Boots')).toBeInTheDocument()
    expect(screen.getByText('Backpack 50L')).toBeInTheDocument()
    expect(screen.getByText('Showing 3 of 3 products')).toBeInTheDocument()
  })

  it('sorts products by price low to high and high to low', () => {
    render(<ProductFilter products={mockProducts} categoryName="Hiking" />)

    const sortSelect = screen.getByRole('combobox', { name: /sort/i })

    // Price: Low to High ($89, $159.50, $299.99)
    fireEvent.change(sortSelect, { target: { value: 'price-asc' } })
    let headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(headings).toEqual(['Backpack 50L', 'Summit Hiking Boots', 'Alpine Trail Tent'])

    // Price: High to Low ($299.99, $159.50, $89)
    fireEvent.change(sortSelect, { target: { value: 'price-desc' } })
    headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(headings).toEqual(['Alpine Trail Tent', 'Summit Hiking Boots', 'Backpack 50L'])
  })

  it('sorts products by name A to Z and Z to A', () => {
    render(<ProductFilter products={mockProducts} categoryName="Hiking" />)

    const sortSelect = screen.getByRole('combobox', { name: /sort/i })

    // Name: A to Z
    fireEvent.change(sortSelect, { target: { value: 'name-asc' } })
    let headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(headings).toEqual(['Alpine Trail Tent', 'Backpack 50L', 'Summit Hiking Boots'])

    // Name: Z to A
    fireEvent.change(sortSelect, { target: { value: 'name-desc' } })
    headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(headings).toEqual(['Summit Hiking Boots', 'Backpack 50L', 'Alpine Trail Tent'])
  })

  it('restores initial order when featured is selected', () => {
    render(<ProductFilter products={mockProducts} categoryName="Hiking" />)

    const sortSelect = screen.getByRole('combobox', { name: /sort/i })

    fireEvent.change(sortSelect, { target: { value: 'price-asc' } })
    fireEvent.change(sortSelect, { target: { value: 'featured' } })

    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(headings).toEqual(['Alpine Trail Tent', 'Summit Hiking Boots', 'Backpack 50L'])
  })

  it('shows empty state when no products match and resets when clicked', () => {
    render(<ProductFilter products={mockProducts} categoryName="Hiking" />)

    const searchInput = screen.getByRole('textbox', { name: /search hiking/i })
    const sortSelect = screen.getByRole('combobox', { name: /sort/i })

    fireEvent.change(sortSelect, { target: { value: 'price-desc' } })
    fireEvent.change(searchInput, { target: { value: 'nonexistent product' } })

    expect(screen.getByText('No products match your search.')).toBeInTheDocument()
    expect(screen.getByText('Showing 0 of 3 products')).toBeInTheDocument()

    const resetButton = screen.getByRole('button', { name: /reset filters/i })
    expect(resetButton).toBeInTheDocument()

    fireEvent.click(resetButton)

    expect(screen.queryByText('No products match your search.')).not.toBeInTheDocument()
    expect(screen.getByText('Showing 3 of 3 products')).toBeInTheDocument()
    expect(screen.getByText('Alpine Trail Tent')).toBeInTheDocument()
    expect(searchInput).toHaveValue('')
    expect(sortSelect).toHaveValue('featured')
  })

  it('combines keyword search and sorting simultaneously', () => {
    render(<ProductFilter products={mockProducts} categoryName="Hiking" />)

    const searchInput = screen.getByRole('textbox', { name: /search hiking/i })
    const sortSelect = screen.getByRole('combobox', { name: /sort/i })

    // "a" matches "Alpine Trail Tent" ($299.99) and "Backpack 50L" ($89.00)
    fireEvent.change(searchInput, { target: { value: 'a' } })
    fireEvent.change(sortSelect, { target: { value: 'price-asc' } })

    let headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(headings).toEqual(['Backpack 50L', 'Alpine Trail Tent'])
    expect(screen.getByText('Showing 2 of 3 products')).toBeInTheDocument()

    fireEvent.change(sortSelect, { target: { value: 'price-desc' } })
    headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(headings).toEqual(['Alpine Trail Tent', 'Backpack 50L'])
  })

  it('provides accessible labelling and aria-live announcements', () => {
    render(<ProductFilter products={mockProducts} categoryName="Hiking" />)

    // Accessible label on search textbox
    const searchInput = screen.getByRole('textbox', { name: /search hiking/i })
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('placeholder', 'Search products in Hiking...')

    // Accessible label on sort combobox
    const sortSelect = screen.getByRole('combobox', { name: /sort/i })
    expect(sortSelect).toBeInTheDocument()

    // Live result counter announcement
    const liveRegion = screen.getByText(/showing 3 of 3 products/i)
    expect(liveRegion).toHaveAttribute('aria-live', 'polite')

    // Clear button accessible name when active
    fireEvent.change(searchInput, { target: { value: 'hiking' } })
    const clearButton = screen.getByRole('button', { name: 'Clear search' })
    expect(clearButton).toBeInTheDocument()
  })

  it('preserves accessible product card markup, image sizing, and skippable container', () => {
    const { container } = render(<ProductFilter products={mockProducts} categoryName="Hiking" />)

    const tentCard = container.querySelector('a[href="/products/alpine-trail-tent"]')
    expect(tentCard).toBeInTheDocument()
    expect(tentCard).toHaveRole('link')
    expect(tentCard).toHaveAccessibleName('Alpine Trail Tent $299.99')

    const tentBox = tentCard?.querySelector('div.aspect-square')
    expect(tentBox?.className).toContain('[content-visibility:auto]')

    const backpackCard = container.querySelector('a[href="/products/backpack-50l"]')
    expect(backpackCard).toBeInTheDocument()
    expect(backpackCard).toHaveRole('link')
    expect(backpackCard).toHaveAccessibleName('Backpack 50L $89.00')

    const backpackBox = backpackCard?.querySelector('div.aspect-square')
    expect(backpackBox?.className).not.toContain('[content-visibility:auto]')
    expect(screen.getByText('No image available')).toBeInTheDocument()
  })
})
