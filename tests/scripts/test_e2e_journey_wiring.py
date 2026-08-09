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
        """The specs are inside some tsconfig, and `make typecheck` opens it.

        `apps/web/tsconfig.json` includes `src`, `prisma` and the Next stubs and
        not `e2e`, so for a long time nothing in this repository type-checked a
        spec. #166 shipped a `deliveryOf(page, 'Our Mission')` call left behind
        when the helper lost its second parameter; `tsc` reports `TS2554` on it
        the moment anything points at the file, and nothing did. ESLint does not
        close the gap either -- `eslint-config-next` runs no type-aware rules.

        Two claims, because either alone leaves the hole open: a config that
        covers the specs, and a target that runs it.
        """
        config = json.loads(
            re.sub(r"^\s*//.*$", "", read("apps/web/tsconfig.e2e.json"), flags=re.MULTILINE)
        )
        includes = config.get("include", [])
        self.assertTrue(
            any(pattern.startswith("e2e/") for pattern in includes),
            f"tsconfig.e2e.json does not include the spec directory: {includes}",
        )

        makefile = read("apps/web/Makefile")
        target = re.search(
            r"^typecheck:.*?$(.*?)(?:^\S|\Z)", makefile, re.MULTILINE | re.DOTALL
        )
        self.assertIsNotNone(target, "no typecheck target in apps/web/Makefile")
        # A recipe line that actually invokes the compiler, not merely a
        # mention. The target carries a comment naming the config, and an
        # `assertIn` on the string was satisfied by that comment alone --
        # deleting the command while leaving the comment left this green.
        commands = [
            line
            for line in target.group(1).splitlines()
            if line.startswith("\t") and not line.lstrip("\t").startswith("#")
        ]
        self.assertTrue(
            any(re.search(r"tsc\b.*-p\s+\S*tsconfig\.e2e\.json", line) for line in commands),
            "no recipe line in make typecheck runs tsc against tsconfig.e2e.json, "
            f"so the specs are type-checked by nothing again: {commands}",
        )

    def test_the_pre_commit_hook_type_checks_the_journeys_too(self):
        """`tsc --noEmit` with no `-p` opens only the app config.

        `make typecheck` running both configs closes the gap in CI. It does not
        close it locally: lint-staged is what runs on commit, and a bare
        invocation there means a spec arity error passes the hook and is caught
        only after a push. That is most of the value of catching it at all.
        """
        config = json.loads(read("apps/web/package.json"))["lint-staged"]
        commands = [
            command
            for pattern, entries in config.items()
            if "ts" in pattern
            for command in entries
        ]
        self.assertTrue(
            any(re.search(r"tsc\b.*-p\s+\S*tsconfig\.e2e\.json", c) for c in commands),
            f"lint-staged never type-checks the specs on commit: {commands}",
        )

    def test_every_spec_is_covered_by_the_type_check(self):
        """A spec outside `e2e/` would be silently unchecked.

        The config covers `e2e/**`, so a journey added anywhere else -- beside
        the component it exercises, say -- is back in the blind spot with the
        suite green. This is the count that makes the check above mean
        something for the files that actually exist.
        """
        # Both extensions. Playwright's default `testMatch` accepts `.tsx` and
        # `playwright.config.ts` does not narrow it, so globbing only `.ts`
        # would report no strays for exactly the file that reopens the hole.
        strays = sorted(
            path.relative_to(WEB_DIR).as_posix()
            for pattern in ("*.spec.ts", "*.spec.tsx")
            for path in WEB_DIR.rglob(pattern)
            if "node_modules" not in path.parts
            and not path.relative_to(WEB_DIR).as_posix().startswith("e2e/")
        )
        self.assertEqual(
            strays,
            [],
            "Playwright specs outside apps/web/e2e are not covered by "
            "tsconfig.e2e.json",
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
