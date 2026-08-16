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
  // The rest of what a dev server rewrites is #260 (`next-env.d.ts`, on boot)
  // and #275 (`tsconfig.json`, once it has served a page), and is not fixed
  // here. This one is, because it lands in an instruction file rather than a
  // generated one.
  agentRules: false,

  // The dev-tools indicator is a focusable element sitting after the chat
  // widget in the document, and that makes dev disagree with production about
  // keyboard behaviour the widget was deliberately designed for. Measured at
  // 1440x900 with the panel open, tabbing forward from the message input:
  //
  //   indicator on                     indicator off
  //   1. Send message     dialog=1     1. Send message  dialog=1
  //   2. Close chat       dialog=1     2. Close chat    dialog=1
  //   3. NEXTJS-PORTAL    dialog=0     3. BODY          dialog=1
  //                                    4. #name         dialog=0
  //
  // `chat.tsx` argues at length that Tab forward off the launcher should leave
  // the page entirely, fire no `focusin`, and leave the panel up -- closing it
  // for the address bar would be closing it for something that is not a page
  // interaction. The indicator is a page interaction, so the panel closes a
  // keystroke early. The right-hand column is what production does.
  //
  // So a chat keyboard journey reviewed on a dev server answered a question
  // about the dev server. That mattered more after #282, which made the panel
  // reachable under `next dev` at the loopback address rather than at
  // `localhost` alone.
  //
  // It also covers the message input at 390x844, where the sheet is full width
  // -- which is what #277 was filed for, and is the smaller half.
  //
  // Three things go with it, all separately gated on the same flag: the Dev
  // Tools menu and its trigger (route info, bundler, preferences, segment
  // explorer), the cache badge, and the build-activity pill -- so there is no
  // "compiling" or "rendering" feedback in dev either. For the route's
  // static/dynamic verdict, which `apps/web/AGENTS.md` does care about, plain
  // `next build` prints `○` and `ƒ` per route and CI produces it on every run.
  //
  // Errors still surface with this off. That is Next's separate issues badge,
  // and it is also the boundary on everything above: the issues badge is the
  // same portal in the same place, is focusable in the same way, and appears on
  // the first logged error -- which this application produces itself, from the
  // `catch` in `sendChatMessage` (`src/lib/messaging.ts`), on any stack with no
  // chat service.
  //
  // With one edge worth knowing, because it is specific to turning the
  // indicator off: collapsing the issues badge sets a flag that nothing resets,
  // so one click on its X hides it for the rest of the page session, later
  // errors included. On the default path the same click is resynced by the
  // error count.
  //
  // Measured after one failed send, the left-hand column returns with two dev
  // stops rather than one, and at 390 the badge covers the input's left third.
  // So this narrows when dev disagrees with production; it does not end it. A
  // keyboard journey that has to match production belongs on a production
  // build -- #290. See #277.
  devIndicators: false,

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
