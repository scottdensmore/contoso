/**
 * Every journey Playwright runs is a file TypeScript checks, and vice versa.
 *
 * Both sets are asked of the tools that own them rather than derived from the
 * config files. Reading declarations was tried twice and defeated twice: an
 * `include` of `e2e/auth.spec.ts` still starts with `e2e/` while leaving seven
 * journeys unchecked, and adding a spec to `exclude` leaves any include-based
 * matcher green while `tsc` drops the file. On the Playwright side the same
 * applies to `testIgnore`, which no amount of reading `testMatch` can see.
 *
 * This lives here, and not in `tests/scripts/`, because it needs `node` and
 * this package's dependencies. The guardrail suite runs on a Python-only CI job,
 * so a check like this placed there would skip in CI — which is the failure it
 * exists to prevent, one level up.
 */
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'

const WEB = path.resolve(import.meta.dirname, '..')

const run = (command, args) =>
  execFileSync(command, args, { cwd: WEB, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })

/**
 * What Playwright would actually run, `testIgnore` and all.
 *
 * Its report gives each `file` relative to `config.rootDir`, which is the
 * resolved `testDir` and not this package — resolving them against the package
 * instead reports every journey as both unchecked and uncollected, which is
 * how this was first written.
 */
function collectedJourneys() {
  const listed = JSON.parse(run('npx', ['playwright', 'test', '--list', '--reporter=json']))
  const root = listed.config?.rootDir
  if (!root) throw new Error('playwright --list reported no config.rootDir')
  const files = new Set()
  const walk = (suite) => {
    if (suite.file) files.add(path.relative(WEB, path.resolve(root, suite.file)))
    for (const child of suite.suites ?? []) walk(child)
    for (const spec of suite.specs ?? []) {
      if (spec.file) files.add(path.relative(WEB, path.resolve(root, spec.file)))
    }
  }
  for (const suite of listed.suites ?? []) walk(suite)
  return files
}

/** What `tsc` resolves for the spec project, `exclude` and all. */
function typeCheckedFiles() {
  const shown = JSON.parse(
    run('./node_modules/.bin/tsc', ['-p', 'tsconfig.e2e.json', '--showConfig']),
  )
  return new Set(
    (shown.files ?? []).map((file) => path.relative(WEB, path.resolve(WEB, file))),
  )
}

/**
 * Anything shaped like a journey, so a file that runs nowhere is still seen.
 *
 * `git ls-files` run from this package already prints paths relative to it.
 */
function specShapedFiles() {
  return run('git', ['ls-files', 'e2e'])
    .split('\n')
    .filter(Boolean)
    .filter((file) => /\.(spec|test)\.[cm]?[jt]sx?$/.test(path.basename(file)))
}

const collected = collectedJourneys()
const checked = typeCheckedFiles()
const problems = []

if (collected.size === 0) {
  problems.push('Playwright collected no journeys at all, so nothing below was compared')
}

for (const journey of [...collected].sort()) {
  if (!checked.has(journey)) {
    problems.push(`${journey} runs as a journey but tsconfig.e2e.json does not check it`)
  }
}

for (const file of specShapedFiles().sort()) {
  if (!collected.has(file)) {
    problems.push(`${file} looks like a journey but Playwright does not collect it, so it never runs`)
  }
}

if (problems.length > 0) {
  console.error('journey coverage:')
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}
