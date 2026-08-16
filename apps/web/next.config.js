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

  // Dev only, and it is the loopback address rather than a host: the dev
  // server's allowlist for its own `/_next/*` routes is `localhost`,
  // `**.localhost` and whatever hostname it was bound with, and `127.0.0.1` is
  // in none of those. Reaching it by IP therefore got 403 on the client chunks,
  // React never hydrated, and every client component on the page was inert --
  // #228, reported as the chat panel refusing to open, which it was not.
  //
  // Worth adding rather than telling people to type `localhost`. `make dev`
  // and `make dev-web` serve on 3100, and a developer or a browser driver
  // reaching that by IP is the ordinary case rather than an unusual one.
  //
  // Not `make e2e-smoke`, which does probe `127.0.0.1:3100` literally but
  // against the compose stack -- that runs `next start` on a production build,
  // where this key is never consulted.
  //
  // Both loopback forms, because both are reachable and both were blocked --
  // the dev server answers 200 on `http://[::1]:<port>/contact` while 403ing
  // that page's chunks, so covering only IPv4 leaves the identical bug one
  // address over. Bracketed is the spelling that matches: `parseUrl` yields
  // `[::1]` as the hostname, and a bare `::1` entry does not match it.
  //
  // This widens nothing outside development. The gate exists so that a page on
  // another site cannot read this server's dev resources; loopback is this
  // machine, and `next build` never consults the key at all.
  allowedDevOrigins: ['127.0.0.1', '[::1]'],

  // `next dev` otherwise appends a block of its own to `apps/web/AGENTS.md`,
  // on every boot under a coding agent -- which is every `make dev` in this
  // repository's workflow, though not one run from a plain shell: the write is
  // gated on agent detection, so it fires on `CLAUDECODE`, `GEMINI_CLI`,
  // `CURSOR_AGENT`, a `COPILOT_*` variable and their equivalents, and not
  // otherwise. That file is this repository's authoritative runbook for coding
  // agents and is written by hand: `AGENTS.md` says generated content does not
  // belong in it, and the appended block closes by asking to be committed
  // along with whatever change was in flight.
  //
  // Only `AGENTS.md`. The sibling `CLAUDE.md` is left alone, because it exists
  // and carries no marker block -- measured, and the branch that decides it is
  // in `generate-agent-files.js`.
  //
  // The rest of what `next dev` rewrites on boot is #275 and is not fixed here.
  // This one is, because it lands in an instruction file rather than a
  // generated one.
  agentRules: false,

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
