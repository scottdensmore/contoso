import { describe, expect, it } from 'vitest'
import catalogueImages from '../../config/catalogue_images.json'

// The ladder is derived rather than written down, so that raising the encoding
// contract raises the srcset ceiling with it. That derivation is the only thing
// standing between a contract change and six byte-identical optimiser responses
// per image coming back, and until this file existed nothing but a full
// `next build` could tell you it had broken.
//
// Asserted against the config rather than against `[640, 750, 828, 1080]`: a
// literal would have to be edited in step with the contract, which is the
// duplication the derivation removes.
const nextConfig = require('./next.config.js')

const deviceSizes: number[] = nextConfig.images.deviceSizes
const sourceWidth: number = catalogueImages.maxDimension

describe('image deviceSizes', () => {
  it('is a valid ladder', () => {
    expect(deviceSizes.length).toBeGreaterThan(0)
    expect(deviceSizes.every(Number.isInteger)).toBe(true)
    expect(deviceSizes).toStrictEqual([...deviceSizes].sort((a, b) => a - b))
    expect(new Set(deviceSizes).size).toBe(deviceSizes.length)
  })

  it('reaches the full source width', () => {
    // Short of this and the largest box is served a downscale it need not have
    // had -- the failure the ceiling must not cause while removing duplicates.
    expect(Math.max(...deviceSizes)).toBeGreaterThanOrEqual(sourceWidth)
  })

  it('offers exactly one candidate at or above the source width', () => {
    // Every candidate past the source returns identical bytes, because the
    // optimiser does not upscale. More than one is the waste #150 removed.
    expect(deviceSizes.filter((width) => width >= sourceWidth)).toHaveLength(1)
  })

  it('keeps the steps that fit the boxes below the ceiling', () => {
    // The grid cards need 750 and 828 at 2x. Deriving the ceiling must not cost
    // the rungs underneath it.
    for (const width of [640, 750, 828]) {
      if (width < sourceWidth) {
        expect(deviceSizes).toContain(width)
      }
    }
  })
})
