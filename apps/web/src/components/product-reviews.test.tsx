import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import ProductReviews from './product-reviews'
import type { Review } from '@/lib/reviews'

const sampleReviews: Review[] = [
  {
    id: 'rev-1',
    rating: 5,
    author: 'Alice Explorer',
    comment: 'Exceptional build quality and super easy setup.',
    date: '2024-01-15',
  },
  {
    id: 'rev-2',
    rating: 3,
    author: 'Bob Backpacker',
    comment: 'A bit heavy for long solo hikes, but durable.',
    date: '2024-02-10',
  },
  {
    id: 'rev-3',
    rating: 4,
    author: 'Charlie Camper',
    comment: 'Great tent, withstood heavy rain without leaking.',
    date: '2024-03-05',
  },
]

describe('ProductReviews Component', () => {
  const slug = 'trailmaster-x4-tent'
  const productName = 'TrailMaster X4 Tent'

  beforeEach(() => {
    localStorage.clear()
  })

  it('renders section heading with aria-labelledby and id="reviews-heading"', () => {
    const { container } = render(
      <ProductReviews slug={slug} productName={productName} initialReviews={sampleReviews} />
    )

    const heading = screen.getByRole('heading', { level: 2, name: /reviews/i })
    expect(heading.id).toBe('reviews-heading')

    const section = container.querySelector('section')
    expect(section?.getAttribute('aria-labelledby')).toBe('reviews-heading')
  })

  it('displays overall rating summary, review count, and star progress bars', () => {
    render(
      <ProductReviews slug={slug} productName={productName} initialReviews={sampleReviews} />
    )

    // Average rating: (5 + 3 + 4) / 3 = 4.0
    expect(screen.getByText('4.0')).toBeDefined()
    expect(screen.getByText(/based on 3 customer reviews/i)).toBeDefined()

    // 5 rating breakdown progress bars (5★ down to 1★)
    const progressBars = screen.getAllByRole('progressbar')
    expect(progressBars).toHaveLength(5)

    progressBars.forEach((bar) => {
      expect(bar.getAttribute('aria-valuemin')).toBe('0')
      expect(bar.getAttribute('aria-valuemax')).toBe('100')
      expect(bar.getAttribute('aria-valuenow')).toBeDefined()
    })
  })

  it('renders review cards with rating, author, date, and comment', () => {
    render(
      <ProductReviews slug={slug} productName={productName} initialReviews={sampleReviews} />
    )

    expect(screen.getByText('Alice Explorer')).toBeDefined()
    expect(screen.getByText('Exceptional build quality and super easy setup.')).toBeDefined()
    expect(screen.getByText('Bob Backpacker')).toBeDefined()
    expect(screen.getByText('Charlie Camper')).toBeDefined()
  })

  it('filters reviews by star rating when a star filter button is clicked and clears filter', () => {
    render(
      <ProductReviews slug={slug} productName={productName} initialReviews={sampleReviews} />
    )

    // Initially 3 review cards rendered
    expect(screen.getByText('Alice Explorer')).toBeDefined()
    expect(screen.getByText('Bob Backpacker')).toBeDefined()
    expect(screen.getByText('Charlie Camper')).toBeDefined()

    // Click 5 star filter button
    const star5Filter = screen.getByRole('button', { name: /5 star/i })
    fireEvent.click(star5Filter)

    // Only Alice Explorer (5 star) should be visible
    expect(screen.getByText('Alice Explorer')).toBeDefined()
    expect(screen.queryByText('Bob Backpacker')).toBeNull()
    expect(screen.queryByText('Charlie Camper')).toBeNull()

    // Clear filter
    const clearButton = screen.getByRole('button', { name: /all reviews|clear filter/i })
    fireEvent.click(clearButton)

    // All reviews visible again
    expect(screen.getByText('Alice Explorer')).toBeDefined()
    expect(screen.getByText('Bob Backpacker')).toBeDefined()
    expect(screen.getByText('Charlie Camper')).toBeDefined()
  })

  it('displays empty state when no reviews match the selected filter', () => {
    render(
      <ProductReviews slug={slug} productName={productName} initialReviews={sampleReviews} />
    )

    // Click 1 star filter (0 reviews have 1 star)
    const star1Filter = screen.getByRole('button', { name: /1 star/i })
    fireEvent.click(star1Filter)

    expect(screen.getByText(/no reviews/i)).toBeDefined()
    expect(screen.queryByText('Alice Explorer')).toBeNull()
  })

  it('hydrates user-submitted reviews from localStorage and merges them at the top', () => {
    const storedReview: Review = {
      id: 'user-stored-1',
      rating: 5,
      author: 'David Stored',
      comment: 'Loaded from localStorage successfully!',
      date: '2024-04-01',
    }
    localStorage.setItem(`contoso_reviews_${slug}`, JSON.stringify([storedReview]))

    render(
      <ProductReviews slug={slug} productName={productName} initialReviews={sampleReviews} />
    )

    // Stored review should appear along with initial reviews
    expect(screen.getByText('David Stored')).toBeDefined()
    expect(screen.getByText('Loaded from localStorage successfully!')).toBeDefined()
    expect(screen.getByText('Alice Explorer')).toBeDefined()

    // Verify it is merged at the top
    const reviewCards = screen.getAllByTestId('review-card')
    expect(within(reviewCards[0]).getByText('David Stored')).toBeDefined()
  })

  it('expands review form, validates inputs, submits review, persists to localStorage, and announces success', () => {
    render(
      <ProductReviews slug={slug} productName={productName} initialReviews={sampleReviews} />
    )

    // Toggle Write a Review form
    const writeReviewBtn = screen.getByRole('button', { name: /write a review/i })
    expect(writeReviewBtn.getAttribute('aria-expanded')).toBe('false')

    fireEvent.click(writeReviewBtn)
    expect(writeReviewBtn.getAttribute('aria-expanded')).toBe('true')

    // Find submit button
    const submitBtn = screen.getByRole('button', { name: /submit review/i })

    // Try submitting without rating or comment -> validation triggers
    fireEvent.click(submitBtn)
    expect(screen.getByText(/please select a rating/i)).toBeDefined()

    // Rate 5 stars
    const star5Button = screen.getByRole('button', { name: 'Rate 5 stars' })
    fireEvent.click(star5Button)

    // Author and comment fields
    const authorInput = screen.getByLabelText(/your name/i)
    const commentInput = screen.getByLabelText(/your review/i)

    fireEvent.change(authorInput, { target: { value: 'Jane Mountaineer' } })
    fireEvent.change(commentInput, { target: { value: 'Best outdoor gear purchase this season!' } })

    // Submit valid review
    fireEvent.click(submitBtn)

    // Review card should be prepended at the top
    expect(screen.getByText('Jane Mountaineer')).toBeDefined()
    expect(screen.getByText('Best outdoor gear purchase this season!')).toBeDefined()
    const reviewCards = screen.getAllByTestId('review-card')
    expect(within(reviewCards[0]).getByText('Jane Mountaineer')).toBeDefined()

    // Check localStorage persistence
    const saved = JSON.parse(localStorage.getItem(`contoso_reviews_${slug}`) || '[]')
    expect(saved).toHaveLength(1)
    expect(saved[0].author).toBe('Jane Mountaineer')
    expect(saved[0].comment).toBe('Best outdoor gear purchase this season!')
    expect(saved[0].rating).toBe(5)

    // Success announcement in aria-live region
    const liveRegion = screen.getByRole('status')
    expect(liveRegion.textContent).toMatch(/submitted|thank you/i)
  })
})
