"""Guard the review-rule contract in the repository's one root runbook."""

from __future__ import annotations

import re
import tempfile
import unittest
from pathlib import Path

from scripts.check_agent_docs import SKIP_DIRECTORIES, find_agent_directories


REPO_ROOT = Path(__file__).resolve().parents[2]
REQUIRED_RUNBOOK = Path("AGENTS.md")


def agent_runbooks(root: Path = REPO_ROOT) -> list[Path]:
    """Return repository-owned AGENTS.md files, including untracked additions."""

    return sorted(
        directory / "AGENTS.md"
        for directory in find_agent_directories(root)
        if (directory / "AGENTS.md").exists()
    )


def workflow_step_numbers(text: str) -> set[int]:
    """The numbers of the workflow's own numbered steps."""

    return {int(match.group(1)) for match in re.finditer(r"(?m)^(\d+)\.\s+\*\*", text)}


def referenced_step_numbers(text: str) -> set[int]:
    """Every step or stage number the prose points at, ranges expanded.

    `stages 6 through 8` asserts the existence of 7 as much as of its endpoints,
    so a range contributes all of its members rather than only the two written down.
    """

    numbers: set[int] = set()
    pattern = r"(?i)\b(?:steps?|stages?)\s+(\d+)(?:\s+(?:to|through|and)\s+(\d+))?"
    for match in re.finditer(pattern, text):
        first = int(match.group(1))
        last = int(match.group(2)) if match.group(2) else first
        numbers.update(range(min(first, last), max(first, last) + 1))
    return numbers


def code_review_rule_sections(path: Path) -> list[list[str]]:
    """Return rule bullets from each exact review-rules section."""

    text = path.read_text(encoding="utf-8")
    matches = re.finditer(
        r"(?ms)^## Code Review Rules\s*$\n(?P<body>.*?)(?=^##\s|\Z)", text
    )
    return [re.findall(r"(?m)^- .+$", match.group("body")) for match in matches]


def review_contract_error(path: Path) -> str | None:
    """Describe why one runbook does not provide a concise review contract."""

    sections = code_review_rule_sections(path)
    relative = path.relative_to(REPO_ROOT) if path.is_relative_to(REPO_ROOT) else path
    if not sections:
        return f"{relative} has no ## Code Review Rules section"
    if len(sections) > 1:
        return "runbooks should contain exactly one ## Code Review Rules section"
    rules = sections[0]
    if len(rules) < 2:
        return "review guidance should name at least two durable checks"
    if len(rules) > 3:
        return "keep review guidance concise; move narrower rules closer"
    return None


class AgentRunbookTests(unittest.TestCase):
    def test_every_runbook_has_two_or_three_code_review_rules(self):
        """A reviewer should get a concise, explicitly scoped contract."""

        runbooks = agent_runbooks()
        self.assertEqual(
            [REPO_ROOT / REQUIRED_RUNBOOK],
            runbooks,
            "AGENTS.md must have one repository-root source of truth",
        )

        for path in runbooks:
            with self.subTest(runbook=path.relative_to(REPO_ROOT)):
                error = review_contract_error(path)
                self.assertIsNone(error, error)

    def test_every_referenced_workflow_step_exists(self):
        """A renumbered workflow must not leave a reference pointing at nothing.

        The steps are cross-referenced by number, from the runbook's own prose
        and from the `description:` of each agent in `.claude/agents/`. Removing
        a step renumbers every step after it, and nothing here read those
        references — so `step 12` survived deletion as a pointer to a step that
        no longer existed, in a file whose whole job is to be followed.

        `test_agent_definitions.py` covers the three agents' own step numbers.
        This is the rest: every other place a number is written down.
        """

        runbook = (REPO_ROOT / "AGENTS.md").read_text(encoding="utf-8")
        steps = workflow_step_numbers(runbook)

        # Without this the comparison below passes when the parse finds no
        # steps at all, which is also what a reformatted workflow produces.
        self.assertGreaterEqual(
            len(steps), 8, "found too few numbered workflow steps to be reading them"
        )
        self.assertEqual(
            steps,
            set(range(1, max(steps) + 1)),
            f"workflow step numbers are not consecutive from 1: {sorted(steps)}",
        )

        # A floor on the reference side too. `refs - steps` is empty whenever
        # `refs` is, so a helper that has stopped reading reports nothing wrong
        # and the whole test below passes while checking nothing.
        #
        # Deliberately just "not empty" rather than a literal set of the
        # numbers the runbook currently cites. `test_step_references_expand_ranges`
        # proves the parsing against a fixture it owns; pinning it here as well
        # would make a copyedit — "steps 6-8" for "steps 6 to 8" — fail a test
        # whose subject is the workflow's numbering, not its wording.
        self.assertTrue(
            referenced_step_numbers(runbook),
            "the runbook cites no step at all, so nothing below is being compared",
        )

        sources = {Path("AGENTS.md"): runbook}
        for path in sorted((REPO_ROOT / ".claude/agents").glob("*.md")):
            sources[path.relative_to(REPO_ROOT)] = path.read_text(encoding="utf-8")

        # Same floor for the glob: no matches means the loop body never runs.
        self.assertGreater(
            len(sources), 1, "no agent definitions were read, so only the runbook was checked"
        )

        for relative, text in sources.items():
            with self.subTest(source=relative):
                referenced = referenced_step_numbers(text)
                dangling = sorted(referenced - steps)
                self.assertEqual(
                    [],
                    dangling,
                    f"{relative} refers to workflow step(s) {dangling}, which the "
                    f"runbook does not define; it has steps 1 to {max(steps)}",
                )

    def test_step_references_expand_ranges(self):
        """The parsing behind the check above, against fixtures it owns.

        Kept off the live runbook on purpose. Anchoring this to real prose
        makes the demonstration hostage to a copyedit, and leaves the one
        behaviour worth demonstrating — expansion — provable only for as long
        as some sentence happens to be phrased as a range.
        """

        cases = {
            "steps 3 through 5": {3, 4, 5},
            "steps 3 to 5": {3, 4, 5},
            # "and" joins a list rather than a range, and is expanded anyway.
            # Over-expansion only adds members, and the check this feeds
            # subtracts the real steps from them, so it can never hide a
            # dangling reference -- it errs loudly rather than quietly. The
            # interpolated numbers are real steps besides, since that check
            # also asserts the steps run consecutively from 1. Prose whose
            # second number is not a step at all ("step 9 and 12 other
            # checks") would fail noisily; the runbook has none.
            "steps 3 and 5": {3, 4, 5},
            "step 9": {9},
            "Step 9 and the pull request body": {9},
            "steps 5 to 3": {3, 4, 5},
            "stepping over 9 rungs": set(),
            "no numbers here": set(),
        }

        for text, expected in cases.items():
            with self.subTest(text=text):
                self.assertEqual(expected, referenced_step_numbers(text))

    def test_each_invalid_contract_shape_is_rejected(self):
        """Demonstrate the missing, underspecified, and overlong branches."""

        cases = {
            "missing": ("# AGENTS\n", "has no ## Code Review Rules section"),
            "one-rule": (
                "# AGENTS\n\n## Code Review Rules\n\n- One rule.\n",
                "review guidance should name at least two durable checks",
            ),
            "four-rules": (
                "# AGENTS\n\n## Code Review Rules\n\n"
                "- One.\n- Two.\n- Three.\n- Four.\n",
                "keep review guidance concise",
            ),
            "duplicate-sections": (
                "# AGENTS\n\n## Code Review Rules\n\n- One.\n- Two.\n\n"
                "## Notes\n\nText.\n\n## Code Review Rules\n\n- Three.\n- Four.\n",
                "exactly one ## Code Review Rules section",
            ),
        }

        with tempfile.TemporaryDirectory() as temp_dir:
            fixture_root = Path(temp_dir)
            for name, (content, expected) in cases.items():
                with self.subTest(case=name):
                    path = fixture_root / f"{name}-AGENTS.md"
                    path.write_text(content, encoding="utf-8")
                    self.assertIn(expected, review_contract_error(path) or "")

    def test_runbook_discovery_uses_the_pointer_tools_exclusions(self):
        """Ignored generated trees must not become accidental review contracts."""

        with tempfile.TemporaryDirectory() as temp_dir:
            fixture_root = Path(temp_dir)
            expected = fixture_root / "AGENTS.md"
            expected.write_text("# AGENTS\n", encoding="utf-8")

            for directory in SKIP_DIRECTORIES:
                ignored = fixture_root / directory / "AGENTS.md"
                ignored.parent.mkdir(parents=True)
                ignored.write_text("# Generated copy\n", encoding="utf-8")

            self.assertEqual([expected], agent_runbooks(fixture_root))

    def test_extra_scopes_are_discovered_as_contract_violations(self):
        """Discovery must expose nested runbooks so the checker can reject them."""

        with tempfile.TemporaryDirectory() as temp_dir:
            fixture_root = Path(temp_dir)
            fixture_paths = {
                REQUIRED_RUNBOOK,
                Path("services/extra/AGENTS.md"),
                Path("tools/AGENTS.md"),
            }
            for relative in fixture_paths:
                path = fixture_root / relative
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text("# AGENTS\n", encoding="utf-8")

            self.assertEqual(
                [fixture_root / relative for relative in sorted(fixture_paths)],
                agent_runbooks(fixture_root),
            )

    def test_grouped_review_rules_are_counted(self):
        """H3 headings may group related review checks without hiding them."""

        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "grouped-AGENTS.md"
            path.write_text(
                "# AGENTS\n\n## Code Review Rules\n\n"
                "### Database\n\n- Keep schema and queries aligned.\n\n"
                "### API\n\n- Keep producers and consumers aligned.\n",
                encoding="utf-8",
            )
            self.assertIsNone(review_contract_error(path))


if __name__ == "__main__":
    unittest.main()
