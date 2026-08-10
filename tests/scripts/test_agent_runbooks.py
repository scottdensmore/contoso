"""Guard the review-rule contract shared by the repository runbooks."""

from __future__ import annotations

import re
import tempfile
import unittest
from pathlib import Path

from scripts.check_agent_docs import SKIP_DIRECTORIES, find_agent_directories


REPO_ROOT = Path(__file__).resolve().parents[2]


def agent_runbooks(root: Path = REPO_ROOT) -> list[Path]:
    """Return repository-owned AGENTS.md files, including untracked additions."""

    return sorted(
        directory / "AGENTS.md"
        for directory in find_agent_directories(root)
        if (directory / "AGENTS.md").exists()
    )


def code_review_rules(path: Path) -> list[str] | None:
    """Return bullets in the exact Codex review-rules section."""

    text = path.read_text(encoding="utf-8")
    match = re.search(
        r"(?ms)^## Code Review Rules\s*$\n(?P<body>.*?)(?=^##\s|\Z)", text
    )
    if match is None:
        return None
    return re.findall(r"(?m)^- .+$", match.group("body"))


def review_contract_error(path: Path) -> str | None:
    """Describe why one runbook does not provide a concise review contract."""

    rules = code_review_rules(path)
    relative = path.relative_to(REPO_ROOT) if path.is_relative_to(REPO_ROOT) else path
    if rules is None:
        return f"{relative} has no ## Code Review Rules section"
    if len(rules) < 2:
        return "review guidance should name at least two durable checks"
    if len(rules) > 3:
        return "keep review guidance concise; move narrower rules closer"
    return None


class AgentRunbookTests(unittest.TestCase):
    def test_every_runbook_has_two_or_three_code_review_rules(self):
        """Codex should receive a concise, explicitly scoped review contract."""

        runbooks = agent_runbooks()
        self.assertGreaterEqual(
            len(runbooks),
            4,
            "expected root, web, chat, and script-guardrail agent runbooks",
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
