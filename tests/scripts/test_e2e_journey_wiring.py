"""The end-to-end journeys must actually run somewhere.

A suite wired into make targets and a package script but invoked by no
workflow looks maintained and produces no signal — that is what
`services/chat/tests/integration` was, and why it was removed rather than
kept. These checks exist so the Playwright journeys cannot drift into the
same state.

They assert wiring, not behaviour. Whether a journey passes is the journeys'
own job; whether anything runs them is this file's.
"""

import json
import re
import unittest
from fnmatch import fnmatch
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
WEB_DIR = REPO_ROOT / "apps/web"


def read(relative: str) -> str:
    return (REPO_ROOT / relative).read_text(encoding="utf-8")


def integration_job() -> str:
    """The `integration-e2e` job block from ci.yml."""
    content = read(".github/workflows/ci.yml")
    match = re.search(
        r"^  integration-e2e:$(.*?)(?:^  \S|\Z)", content, re.MULTILINE | re.DOTALL
    )
    if match is None:
        raise AssertionError("integration-e2e job not found in ci.yml")
    return match.group(1)


def expand_braces(pattern: str) -> list[str]:
    """`*.{ts,tsx}` into `*.ts` and `*.tsx`, which `fnmatch` does not do."""
    match = re.search(r"\{([^}]*)\}", pattern)
    if not match:
        return [pattern]
    return [
        expanded
        for option in match.group(1).split(",")
        for expanded in expand_braces(
            pattern[: match.start()] + option + pattern[match.end() :]
        )
    ]


def glob_to_regex(pattern: str) -> "re.Pattern[str]":
    """A glob as a regex over POSIX paths, with `**/` spanning directories."""
    out = []
    i = 0
    while i < len(pattern):
        if pattern.startswith("**/", i):
            out.append("(?:[^/]+/)*")
            i += 3
        elif pattern[i] == "*":
            out.append("[^/]*")
            i += 1
        else:
            out.append(re.escape(pattern[i]))
            i += 1
    return re.compile("^" + "".join(out) + "$")


def playwright_specs() -> list[str]:
    """The journeys Playwright collects, relative to `apps/web`.

    Read from `testDir` and `testMatch` rather than assumed, so narrowing
    either is visible to every check that depends on the set.
    """
    config = read("apps/web/playwright.config.ts")
    test_dir = re.search(r"testDir:\s*['\"]([^'\"]+)['\"]", config)
    test_match = re.search(r"testMatch:\s*['\"]([^'\"]+)['\"]", config)
    if test_dir is None or test_match is None:
        raise AssertionError(
            "playwright.config.ts must state testDir and testMatch; the wiring "
            "checks derive the set of journeys from them"
        )
    root = (WEB_DIR / test_dir.group(1)).resolve()
    matcher = glob_to_regex(test_match.group(1))
    return sorted(
        path.relative_to(WEB_DIR).as_posix()
        for path in root.rglob("*")
        if path.is_file() and matcher.match(path.relative_to(root).as_posix())
    )


class JourneyWiringTests(unittest.TestCase):
    def test_journey_specs_exist(self):
        """Guards the checks below from passing against an empty directory."""
        specs = sorted((WEB_DIR / "e2e").glob("*.spec.ts"))
        self.assertGreaterEqual(len(specs), 2, "expected journey specs under apps/web/e2e")
        for spec in specs:
            with self.subTest(spec=spec.name):
                self.assertIn("test(", spec.read_text(encoding="utf-8"))

    def test_ci_runs_the_journeys(self):
        """The whole point. Without this step the suite is an orphan."""
        job = integration_job()
        self.assertIn("make test-e2e", job)
        self.assertIn("playwright install", job)

    def test_journeys_run_against_the_stack_the_smoke_leaves_up(self):
        """They must target the composed stack, not a server they start.

        A journey pointed at `next dev` would exercise a web app talking to no
        chat service and no seeded database, which is most of what these
        journeys are for.
        """
        job = integration_job()
        self.assertIn("E2E_BASE_URL", job)
        self.assertIn("KEEP_STACK", job)
        # Match the key, not the word: the config explains in prose why it has
        # no webServer, and a substring check fails on its own comment.
        self.assertNotRegex(
            read("apps/web/playwright.config.ts"),
            re.compile(r"^\s*webServer\s*:", re.MULTILINE),
        )

    def test_the_journeys_are_type_checked(self):
        """Every file Playwright collects is inside the type-check config.

        `apps/web/tsconfig.json` covers `src`, `prisma` and the Next stubs and
        not `e2e`, so for a long time nothing here opened a spec. #166 shipped a
        `deliveryOf(page, 'Our Mission')` call left behind when the helper lost
        its second parameter; `tsc` reports `TS2554` the moment anything points
        at the file, and nothing did.

        Asserted against the resolved set rather than the declarations, because
        each declaration can look right while the coverage is wrong. An
        `include` narrowed to `e2e/auth.spec.ts` still starts with `e2e/`, still
        compiles clean, and leaves seven journeys unchecked.
        """
        collected = playwright_specs()
        self.assertGreaterEqual(
            len(collected), 2, "no journeys found; the check below asserts nothing"
        )

        config = json.loads(
            re.sub(r"^\s*//.*$", "", read("apps/web/tsconfig.e2e.json"), flags=re.MULTILINE)
        )
        patterns = [glob_to_regex(pattern) for pattern in config.get("include", [])]
        uncovered = sorted(
            spec for spec in collected if not any(p.match(spec) for p in patterns)
        )
        self.assertEqual(
            uncovered,
            [],
            "journeys Playwright runs that tsconfig.e2e.json does not type-check",
        )

    def test_nothing_in_the_test_directory_is_silently_uncollected(self):
        """A spec-shaped file the narrowed `testMatch` skips.

        `playwright.config.ts` pins `testMatch` to `**/*.spec.ts`, which is what
        lets the type-check config be a single `.ts` glob. The cost is that a
        file named `foo.spec.tsx` or `foo.spec.mts` would sit in the directory
        and never run, where Playwright's own default would have collected it.
        Silent either way, so it fails here rather than waiting to be noticed.
        """
        collected = set(playwright_specs())
        spec_shaped = sorted(
            path.relative_to(WEB_DIR).as_posix()
            for path in (WEB_DIR / "e2e").rglob("*")
            if path.is_file() and re.search(r"\.(spec|test)\.[cm]?[jt]sx?$", path.name)
        )
        self.assertEqual(
            [path for path in spec_shaped if path not in collected],
            [],
            "files in e2e/ shaped like journeys that the pinned testMatch does "
            "not collect, so they never run",
        )

    def test_the_pre_commit_hook_type_checks_the_journeys_too(self):
        """`tsc --noEmit` with no `-p` opens only the app config.

        `make typecheck` running both configs closes the gap in CI. It does not
        close it locally: lint-staged is what runs on commit, and a bare
        invocation there means a spec arity error passes the hook and waits for
        a push.

        Both halves are checked -- that the hook still reaches lint-staged, and
        that its glob actually matches a journey. A key narrowed to `*.mts`
        still contains the substring "ts" while matching no journey this
        repository has.
        """
        self.assertIn(
            "lint-staged",
            read(".husky/pre-commit"),
            ".husky/pre-commit no longer runs lint-staged, so none of the "
            "commit-time checks below run at all",
        )

        collected = playwright_specs()
        config = json.loads(read("apps/web/package.json"))["lint-staged"]
        matching = [
            (pattern, commands)
            for pattern, commands in config.items()
            if any(
                fnmatch(Path(spec).name, expansion)
                for spec in collected
                for expansion in expand_braces(pattern)
            )
        ]
        self.assertTrue(
            matching, f"no lint-staged pattern matches a journey: {sorted(config)}"
        )
        commands = [command for _, commands in matching for command in commands]
        self.assertTrue(
            any(re.search(r"tsc\b.*-p\s+\S*tsconfig\.e2e\.json", c) for c in commands),
            f"lint-staged never type-checks the journeys on commit: {commands}",
        )

    def test_make_target_exists(self):
        self.assertRegex(read("Makefile"), re.compile(r"^test-e2e:", re.MULTILINE))
        self.assertRegex(read("apps/web/Makefile"), re.compile(r"^test-e2e:", re.MULTILINE))

    def test_vitest_does_not_also_collect_the_journeys(self):
        """Playwright specs match vitest's default glob.

        Collected by vitest they fail on `@playwright/test` imports it cannot
        run, which reads as a broken unit suite rather than a config problem.
        """
        self.assertIn("e2e/**", read("apps/web/vitest.config.ts"))

    def test_retries_are_not_enabled(self):
        """A retried failure is a failure that gets ignored.

        If a journey is flaky that is a finding. Turning on retries here would
        hide exactly the intermittent breakage these journeys exist to surface.
        """
        config = read("apps/web/playwright.config.ts")
        self.assertRegex(config, re.compile(r"retries:\s*0"))


if __name__ == "__main__":
    unittest.main()
