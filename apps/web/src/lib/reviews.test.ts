import { describe, it, expect } from 'vitest'
import { parseManualReviews, calculateReviewStats, filterAndSortReviews, type Review, type ReviewSortOption, type ReviewFilterOptions } from './reviews'

describe('parseManualReviews', () => {
  const sampleMarkdown = `
# Information about product item_number: 1
TrailMaster X4 Tent, price $250

## Return Policy
- 30 days return policy.

## Reviews
1) **Rating:** 5
   **Review:** I am extremely happy with my TrailMaster X4 Tent! It is spacious, easy to set up, and kept me dry during a storm.

2) **Rating:** 3
   **Review:** Decent tent, but I wish it were easier to assemble.

3) **Rating:** 4
   **Review:** Good quality, nice materials.

## FAQ
1) Can the tent be used in winter?
`

  it('parses reviews from markdown and generates deterministic IDs with slug', () => {
    const reviews = parseManualReviews(sampleMarkdown, 'trailmaster-x4-tent')
    expect(reviews).toHaveLength(3)

    expect(reviews[0]).toEqual({
      id: 'trailmaster-x4-tent-manual-1',
      rating: 5,
      comment: 'I am extremely happy with my TrailMaster X4 Tent! It is spacious, easy to set up, and kept me dry during a storm.',
      author: 'Verified Buyer',
      date: expect.any(String),
    })

    expect(reviews[1]).toEqual({
      id: 'trailmaster-x4-tent-manual-2',
      rating: 3,
      comment: 'Decent tent, but I wish it were easier to assemble.',
      author: 'Verified Buyer',
      date: expect.any(String),
    })

    expect(reviews[2]).toEqual({
      id: 'trailmaster-x4-tent-manual-3',
      rating: 4,
      comment: 'Good quality, nice materials.',
      author: 'Verified Buyer',
      date: expect.any(String),
    })
  })

  it('uses fallback product slug "review" when slug is not provided', () => {
    const reviews = parseManualReviews(sampleMarkdown)
    expect(reviews[0].id).toBe('review-manual-1')
  })

  it('handles variations in rating formatting like bold inside/outside and decimal ratings', () => {
    const markdown = `
## Reviews
1) **Rating: 5**
   **Review:** Solid construction!

2) **Rating:** 4.5
   **Review:** Pretty good comfort and fit.
`
    const reviews = parseManualReviews(markdown, 'hiking-boots')
    expect(reviews).toHaveLength(2)
    expect(reviews[0].rating).toBe(5)
    expect(reviews[0].comment).toBe('Solid construction!')
    // 4.5 rounded to nearest integer rating between 1 and 5
    expect(reviews[1].rating).toBe(5)
    expect(reviews[1].comment).toBe('Pretty good comfort and fit.')
  })

  it('returns an empty array if there is no Reviews section', () => {
    const markdown = `
# Product without reviews
## Features
- Feature 1
`
    const reviews = parseManualReviews(markdown, 'no-reviews')
    expect(reviews).toEqual([])
  })

  it('handles reviews section at the end of the markdown string without subsequent headings', () => {
    const markdown = `
## Reviews
1) **Rating:** 5
   **Review:** Last section review.
`
    const reviews = parseManualReviews(markdown, 'end-section')
    expect(reviews).toHaveLength(1)
    expect(reviews[0].comment).toBe('Last section review.')
  })
})

describe('calculateReviewStats', () => {
  it('returns default zero stats for an empty reviews array', () => {
    const stats = calculateReviewStats([])
    expect(stats).toEqual({
      averageRating: 0,
      totalReviews: 0,
      ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      ratingPercentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    })
  })

  it('calculates average rating, counts, and percentages accurately', () => {
    const reviews: Review[] = [
      { id: '1', rating: 5, comment: 'Great', author: 'A', date: '2024-01-01' },
      { id: '2', rating: 5, comment: 'Super', author: 'B', date: '2024-01-02' },
      { id: '3', rating: 5, comment: 'Loved it', author: 'C', date: '2024-01-03' },
      { id: '4', rating: 4, comment: 'Good', author: 'D', date: '2024-01-04' },
      { id: '5', rating: 3, comment: 'Okay', author: 'E', date: '2024-01-05' },
    ]

    const stats = calculateReviewStats(reviews)
    expect(stats.totalReviews).toBe(5)
    // (5 + 5 + 5 + 4 + 3) / 5 = 22 / 5 = 4.4
    expect(stats.averageRating).toBe(4.4)
    expect(stats.ratingCounts).toEqual({
      1: 0,
      2: 0,
      3: 1,
      4: 1,
      5: 3,
    })
    expect(stats.ratingPercentages).toEqual({
      1: 0,
      2: 0,
      3: 20,
      4: 20,
      5: 60,
    })
  })

  it('rounds average rating to 1 decimal place', () => {
    const reviews: Review[] = [
      { id: '1', rating: 4, comment: 'Good', author: 'A', date: '2024-01-01' },
      { id: '2', rating: 5, comment: 'Great', author: 'B', date: '2024-01-02' },
      { id: '3', rating: 5, comment: 'Great', author: 'C', date: '2024-01-03' },
    ]
    // 14 / 3 = 4.66666... -> 4.7
    const stats = calculateReviewStats(reviews)
    expect(stats.averageRating).toBe(4.7)
  })
})

describe('filterAndSortReviews', () => {
  const testReviews: Review[] = [
    {
      id: 'rev-1',
      rating: 5,
      title: 'Amazing Tent',
      comment: 'Super easy setup and very spacious.',
      author: 'Alice (Verified Buyer)',
      date: '2024-03-01',
    },
    {
      id: 'rev-2',
      rating: 2,
      title: 'Disappointed',
      comment: 'Leaked during light rain in the mountains.',
      author: 'Bob Backpacker',
      date: '2024-03-15',
    },
    {
      id: 'rev-3',
      rating: 4,
      title: 'Solid product',
      comment: 'Great tent, withstood wind well.',
      author: 'Charlie Camper (verified)',
      date: '2024-02-10',
    },
    {
      id: 'rev-4',
      rating: 5,
      title: 'Best purchase',
      comment: 'High quality materials and quick delivery.',
      author: 'Dana Mountaineer',
      date: '2024-01-20',
    },
    {
      id: 'rev-5',
      rating: 1,
      comment: 'Zippers broke on day one.',
      author: 'Evan Verified Customer',
      date: '2024-04-01',
    },
  ]

  it('returns all reviews by default sorted by recent date descending', () => {
    const result = filterAndSortReviews(testReviews, {})
    expect(result.map((r) => r.id)).toEqual(['rev-5', 'rev-2', 'rev-1', 'rev-3', 'rev-4'])
  })

  it('filters by case-insensitive keyword search in comment', () => {
    const result = filterAndSortReviews(testReviews, { searchQuery: 'rain' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('rev-2')
  })

  it('filters by case-insensitive keyword search in title', () => {
    const result = filterAndSortReviews(testReviews, { searchQuery: 'amazing' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('rev-1')
  })

  it('filters by case-insensitive keyword search in author', () => {
    const result = filterAndSortReviews(testReviews, { searchQuery: 'mountaineer' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('rev-4')
  })

  it('handles search query with leading/trailing whitespace', () => {
    const result = filterAndSortReviews(testReviews, { searchQuery: '  zippers  ' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('rev-5')
  })

  it('returns empty array when search query matches nothing', () => {
    const result = filterAndSortReviews(testReviews, { searchQuery: 'nonexistent123' })
    expect(result).toHaveLength(0)
  })

  it('filters by exact star rating', () => {
    const result = filterAndSortReviews(testReviews, { starRating: 5 })
    expect(result).toHaveLength(2)
    expect(result.map((r) => r.id)).toEqual(['rev-1', 'rev-4'])
  })

  it('ignores null or undefined star rating', () => {
    const resultNull = filterAndSortReviews(testReviews, { starRating: null })
    expect(resultNull).toHaveLength(5)
    const resultUndefined = filterAndSortReviews(testReviews, { starRating: undefined })
    expect(resultUndefined).toHaveLength(5)
  })

  it('filters by verified buyers only', () => {
    const result = filterAndSortReviews(testReviews, { verifiedOnly: true })
    expect(result).toHaveLength(3)
    expect(result.map((r) => r.id)).toEqual(['rev-5', 'rev-1', 'rev-3'])
  })

  it('sorts by highest rating first, with ties broken by date descending', () => {
    const result = filterAndSortReviews(testReviews, { sortBy: 'highest' })
    expect(result.map((r) => r.id)).toEqual(['rev-1', 'rev-4', 'rev-3', 'rev-2', 'rev-5'])
  })

  it('sorts by lowest rating first, with ties broken by date descending', () => {
    const result = filterAndSortReviews(testReviews, { sortBy: 'lowest' })
    expect(result.map((r) => r.id)).toEqual(['rev-5', 'rev-2', 'rev-3', 'rev-1', 'rev-4'])
  })

  it('sorts by recent date descending', () => {
    const result = filterAndSortReviews(testReviews, { sortBy: 'recent' })
    expect(result.map((r) => r.id)).toEqual(['rev-5', 'rev-2', 'rev-1', 'rev-3', 'rev-4'])
  })

  it('combines search, star rating, verified filter, and sorting simultaneously', () => {
    const options: ReviewFilterOptions = {
      searchQuery: 'tent',
      starRating: 4,
      verifiedOnly: true,
      sortBy: 'highest' as ReviewSortOption,
    }
    const result = filterAndSortReviews(testReviews, options)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('rev-3')
  })

  it('does not mutate original reviews array', () => {
    const original = [...testReviews]
    filterAndSortReviews(testReviews, { sortBy: 'lowest', starRating: 1 })
    expect(testReviews).toEqual(original)
  })
})
