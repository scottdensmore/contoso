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


def recipe_commands(block: str, prefix: str = "\t") -> list[str]:
    """Executable lines only.

    Comments are the trap this exists for, twice over: a make recipe echoes its
    `#` lines, and `# npx lint-staged` in a hook still contains the word. A
    substring search over the raw block matches text that never runs.
    """
    return [
        line.strip()
        for line in block.splitlines()
        if line.startswith(prefix) and line.strip() and not line.strip().startswith("#")
    ]


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

    def test_make_typecheck_covers_the_journeys(self):
        """The recipe runs the spec compiler and the coverage check.

        `apps/web/tsconfig.json` covers `src`, `prisma` and the Next stubs and
        not `e2e`, so nothing here opened a spec until `tsconfig.e2e.json`
        existed. #166 shipped a `deliveryOf(page, 'Our Mission')` call left
        behind when the helper lost its second parameter; `tsc` reports `TS2554`
        the moment anything points at the file, and nothing did.

        Both lines, because they fail differently: the compiler catches type
        errors in the files it resolves, and `check-journey-coverage.mjs`
        catches the files it does not resolve. Deleting either leaves the other
        green.

        Asserted against recipe lines rather than the text of the target. An
        `assertIn` on the config name passed when the command was deleted and
        its explanatory comment left behind.
        """
        makefile = read("apps/web/Makefile")
        target = re.search(
            r"^typecheck:.*?$(.*?)(?:^\S|\Z)", makefile, re.MULTILINE | re.DOTALL
        )
        self.assertIsNotNone(target, "no typecheck target in apps/web/Makefile")
        commands = recipe_commands(target.group(1))
        self.assertTrue(
            any(re.search(r"tsc\b.*-p\s+\S*tsconfig\.e2e\.json", c) for c in commands),
            f"make typecheck does not compile the journeys: {commands}",
        )
        self.assertTrue(
            any("check-journey-coverage" in c for c in commands),
            f"make typecheck does not check which journeys are compiled: {commands}",
        )

    def test_the_pre_commit_hook_type_checks_the_journeys_too(self):
        """`tsc --noEmit` with no `-p` opens only the app config.

        `make typecheck` closes the gap in CI. It does not close it locally:
        lint-staged is what runs on commit, and a bare invocation there means a
        spec arity error passes the hook and waits for a push.

        Three things, each of which alone can be true while the check is dead:
        the hook actually executes lint-staged, a lint-staged glob actually
        matches a spec filename, and its commands include the spec compiler. A
        hook line commented out still contains the word, and a key narrowed to
        `*.mts` still contains the substring "ts".
        """
        hook_commands = recipe_commands(read(".husky/pre-commit"), prefix="")
        self.assertTrue(
            any(re.search(r"(^|\s)(npx\s+)?lint-staged\b", c) for c in hook_commands),
            f".husky/pre-commit does not execute lint-staged: {hook_commands}",
        )

        specs = sorted(
            path.name for path in (WEB_DIR / "e2e").rglob("*.spec.ts") if path.is_file()
        )
        self.assertTrue(specs, "no specs found, so the glob check below asserts nothing")

        config = json.loads(read("apps/web/package.json"))["lint-staged"]
        matching = [
            commands
            for pattern, commands in config.items()
            if any(
                fnmatch(name, expansion)
                for name in specs
                for expansion in expand_braces(pattern)
            )
        ]
        self.assertTrue(
            matching, f"no lint-staged pattern matches a spec: {sorted(config)}"
        )
        commands = [command for entry in matching for command in entry]
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
