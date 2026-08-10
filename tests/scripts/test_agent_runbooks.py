"""Guard the review-rule contract shared by the repository runbooks."""

from __future__ import annotations

import re
import tempfile
import unittest
from pathlib import Path

from scripts.check_agent_docs import SKIP_DIRECTORIES, find_agent_directories


REPO_ROOT = Path(__file__).resolve().parents[2]
REQUIRED_RUNBOOKS = {
    Path("AGENTS.md"),
    Path("apps/web/AGENTS.md"),
    Path("services/chat/AGENTS.md"),
    Path("tests/scripts/AGENTS.md"),
}


def agent_runbooks(root: Path = REPO_ROOT) -> list[Path]:
    """Return repository-owned AGENTS.md files, including untracked additions."""

    return sorted(
        directory / "AGENTS.md"
        for directory in find_agent_directories(root)
        if (directory / "AGENTS.md").exists()
    )


def missing_required_runbooks(
    runbooks: list[Path], root: Path = REPO_ROOT
) -> list[Path]:
    """Return canonical runbook paths absent from the discovered repository set."""

    discovered = {path.relative_to(root) for path in runbooks}
    return sorted(REQUIRED_RUNBOOKS - discovered)


def code_review_rule_sections(path: Path) -> list[list[str]]:
    """Return rule bullets from each exact Codex review-rules section."""

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
        """Codex should receive a concise, explicitly scoped review contract."""

        runbooks = agent_runbooks()
        self.assertEqual(
            [],
            missing_required_runbooks(runbooks),
            "missing a canonical root, web, chat, or script-guardrail runbook",
        )

        for path in runbooks:
            with self.subTest(runbook=path.relative_to(REPO_ROOT)):
                error = review_contract_error(path)
                self.assertIsNone(error, error)

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

    def test_extra_scopes_cannot_replace_a_required_runbook(self):
        """Each canonical scope must exist regardless of the discovered count."""

        with tempfile.TemporaryDirectory() as temp_dir:
            fixture_root = Path(temp_dir)
            missing = Path("apps/web/AGENTS.md")
            fixture_paths = (REQUIRED_RUNBOOKS - {missing}) | {
                Path("services/extra/AGENTS.md"),
                Path("tools/AGENTS.md"),
            }
            for relative in fixture_paths:
                path = fixture_root / relative
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text("# AGENTS\n", encoding="utf-8")

            self.assertEqual(
                [missing],
                missing_required_runbooks(agent_runbooks(fixture_root), fixture_root),
            )

    def test_grouped_review_rules_are_counted(self):
        """Codex supports H3 headings that group related review checks."""

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
