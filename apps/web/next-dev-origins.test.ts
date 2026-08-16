import { describe, expect, it } from 'vitest'

/**
 * The dev server has to serve `/_next/*` to a browser that reached it over the
 * loopback address.
 *
 * Next's dev server blocks cross-origin requests to its own internal routes,
 * and the allowlist it compares against is `localhost`, `**.localhost` and the
 * hostname the server was bound with -- `127.0.0.1` is in none of those. So a
 * dev server opened at `http://127.0.0.1:<port>` answered 403 to three of its
 * client chunks, React never hydrated, and every client component on the page
 * was inert. Clicking the chat launcher did nothing, which is how #228 was
 * reported: the panel looked broken, and the component was fine.
 *
 * What is asserted here is Next's own decision function, fed this repository's
 * own `allowedDevOrigins`. Not a re-implementation of the rule -- the rule is
 * Next's and changes with Next, and a copy of it here would keep agreeing with
 * itself after the original moved.
 *
 * **What this does not cover, and how that was established instead.** It does
 * not prove the dev server calls this function, nor that the config key reaches
 * it. That was measured directly rather than asserted, against a real
 * `next dev` at both hostnames:
 *
 *     before  http://127.0.0.1:3177  403s=3  hydrated=false  dialogAfterClick=0
 *             http://localhost:3177  403s=0  hydrated=true   dialogAfterClick=1
 *     after   http://127.0.0.1:3178  403s=0  hydrated=true   dialog=1 focus=chat
 *
 * A guard that started its own server would have been the stronger check, and
 * it was written that way first. It does not survive contact with ordinary use:
 * Next 16 keeps one dev server per `distDir`, enforced through `.next/dev/lock`,
 * and a second one exits 1 with "Another next dev server is already running".
 * So `make test-web` failed for anyone who had `make dev` up -- green in CI,
 * where nothing else is running, and broken on exactly the machines doing the
 * development. It also had to snapshot and restore two tracked files a dev
 * server rewrites: `next-env.d.ts` on boot, which is #260, and `tsconfig.json`
 * once it has served a page, which is #275.
 */

// `require` rather than `import`, matching `next.config.test.ts` beside it:
// both of these are CommonJS, and the gate is reached by file path.
const nextConfig = require('./next.config.js')
// The gate itself. A Next upgrade that moves or retires it fails this file
// loudly, which is the correct outcome: the protection this repository is
// relying on would have moved with it.
const {
  blockCrossSiteDEV,
} = require('next/dist/server/lib/router-utils/block-cross-site-dev.js')

/**
 * Ask the gate about one origin, the way a browser asks for a client chunk.
 *
 * The path names no real chunk on purpose: the gate runs before routing and
 * looks only at the URL prefix, so nothing here depends on a content hash.
 *
 * `hostname` is `undefined` because `next dev` without `-H` binds every
 * interface and passes no hostname through to the gate -- which is why
 * `127.0.0.1` was not already allowed as the address the server answered on.
 */
function isBlocked(origin: string): boolean {
  const req = {
    url: '/_next/static/chunks/probe-no-such-chunk.js',
    headers: { origin },
  }
  const res = { statusCode: 200, end() {} }
  return blockCrossSiteDEV(req, res, nextConfig.allowedDevOrigins, undefined)
}

describe('next dev cross-origin gate', () => {
  it('serves an internal route to a browser on 127.0.0.1', () => {
    expect(isBlocked('http://127.0.0.1:3100')).toBe(false)
  })

  it('serves an internal route to a browser on [::1]', () => {
    // The other loopback address, and reachable: the dev server answers 200 on
    // `http://[::1]:<port>/contact`. Bracketed because that is the hostname
    // `parseUrl` produces; a bare `::1` in the allowlist matches nothing.
    expect(isBlocked('http://[::1]:3100')).toBe(false)
  })

  it('serves an internal route to a browser on localhost', () => {
    // Pinning Next's own hardcoded default, not anything this repository
    // configures: the gate builds its allowlist as `['**.localhost',
    // 'localhost', ...allowedDevOrigins ?? []]`, so no config value can
    // displace this one and it passes with the key absent entirely. What it
    // would catch is Next dropping `localhost` from those defaults, which
    // would send everyone here to the same 403 by a different route.
    expect(isBlocked('http://localhost:3100')).toBe(false)
  })

  it('still blocks a foreign origin', () => {
    // The control. Without it this file passes just as well against an
    // allowlist widened to everything, which is a different change from the one
    // that was made and a worse one -- and it is what proves the probe reaches
    // the gate at all rather than being waved through for some reason of its
    // own.
    expect(isBlocked('http://evil.example')).toBe(true)
  })
})
