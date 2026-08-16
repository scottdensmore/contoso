import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ListingImage from './listing-image'

/**
 * What is left to test here is small, and that is the point of #273.
 *
 * The deferral used to be a component: an IntersectionObserver, a margin, a
 * placeholder that swapped for an image, a `<noscript>` fallback, and an
 * `eager` prop each call site had to get right. All of that had unit tests
 * because all of it was logic. It is now one CSS declaration, and the browser
 * owns the decision.
 *
 * So these assert the two properties that survive at this level:
 *
 * - **the image is always rendered.** That is the property that closes #261 --
 *   under the old mechanism an off-screen card had no `<img>` in the HTML, so
 *   a blocked script left it permanently empty. Here there is nothing to
 *   block.
 * - **the box carries the mechanism.** This is a declaration check, and it is
 *   the honest limit of a jsdom test: `content-visibility` has no observable
 *   effect without layout and a viewport. `e2e/image-deferral.spec.ts`
 *   measures the effect -- what the browser actually asks the server for --
 *   which is the assertion that matters and the one this cannot make.
 */

const PROPS = {
  src: '/images/1/example.webp',
  alt: '',
  sizes: '350px',
}

describe('ListingImage', () => {
  it('renders the image, off screen or not', () => {
    const { container } = render(<ListingImage {...PROPS} />)

    const images = container.querySelectorAll('img')
    expect(images).toHaveLength(1)
    // Through the optimiser, not the raw source: a component that fell back to
    // a plain `<img src>` would satisfy the count and still ship a 1024px file
    // to a 350px box.
    expect(images[0].getAttribute('src')).toContain('/_next/image')
  })

  it('marks the box skippable, which is the whole deferral', () => {
    const { container } = render(<ListingImage {...PROPS} />)
    const box = container.querySelector('div')

    expect(box?.className).toContain('[content-visibility:auto]')
    // The box sizes from CSS rather than from its contents, which is why no
    // `contain-intrinsic-size` is needed and why skipping it shifts nothing.
    expect(box?.className).toContain('aspect-square')
  })

  it('keeps the image decorative so the card is not announced twice', () => {
    render(<ListingImage {...PROPS} />)

    // `alt=""` is what makes the surrounding link's accessible name the product
    // name once rather than twice. See e2e/browse.spec.ts and #200.
    expect(screen.queryByRole('img')).toBeNull()
  })
})
