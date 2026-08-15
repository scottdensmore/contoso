const catalogueImages = require('../../config/catalogue_images.json')

// next/image asks the optimiser for a width from this ladder, and the optimiser
// never upscales past the source. Every candidate at or above the source width
// therefore returns identical bytes: with the default ladder, w=1080 through
// w=3840 were six byte-identical responses per image, each its own cache entry.
//
// So the ladder stops at the first step past the largest source we ship, which
// is the encoding contract's max dimension -- derived rather than written down
// twice, so raising the contract raises this with it.
//
// The steps below the ceiling are Next's defaults. They fit the smaller boxes
// exactly -- the 350px grid card takes 750 at 2x, the 400px category card 828 --
// and the larger ones are short of 2x for want of source, not for want of a
// ladder step: the 550px detail image asks for 1100 and the about page's 604px
// band for 1208, and both get the same 1024 they got before this change.
const DEFAULT_DEVICE_SIZES = [640, 750, 828, 1080, 1200, 1920, 2048, 3840]
const sourceWidth = catalogueImages.maxDimension
const deviceSizes = [
  ...DEFAULT_DEVICE_SIZES.filter((width) => width < sourceWidth),
  DEFAULT_DEVICE_SIZES.find((width) => width >= sourceWidth) ?? sourceWidth,
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emit a traced, self-contained server bundle so the Docker runtime image
  // ships only the dependencies actually reached at runtime.
  output: 'standalone',
  images: {
    deviceSizes,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
