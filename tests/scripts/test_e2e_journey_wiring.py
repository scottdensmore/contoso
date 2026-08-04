"""The end-to-end journeys must actually run somewhere.

A suite wired into make targets and a package script but invoked by no
workflow looks maintained and produces no signal — that is what
`services/chat/tests/integration` was, and why it was removed rather than
kept. These checks exist so the Playwright journeys cannot drift into the
same state.

They assert wiring, not behaviour. Whether a journey passes is the journeys'
own job; whether anything runs them is this file's.
"""

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
