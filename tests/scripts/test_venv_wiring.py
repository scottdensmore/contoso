"""Guard the rule that every Python command runs from the project virtualenv."""

import re
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
WORKFLOW_DIR = REPO_ROOT / ".github/workflows"


def read(relative: str) -> str:
    return (REPO_ROOT / relative).read_text(encoding="utf-8")


def workflow_files() -> list[Path]:
    return sorted(WORKFLOW_DIR.glob("*.yml"))


class VenvWiringTests(unittest.TestCase):
    def test_root_makefile_defaults_python_to_venv(self):
        content = read("Makefile")
        self.assertIn("VENV_DIR ?= .venv", content)
        self.assertIn("VENV_PYTHON := $(VENV_DIR)/bin/python", content)
        self.assertIn("PYTHON ?= $(VENV_PYTHON)", content)
        self.assertIn("PIP ?= $(PYTHON) -m pip", content)

    def test_chat_makefile_uses_shared_root_venv(self):
        content = read("services/chat/Makefile")
        self.assertIn("REPO_ROOT := $(abspath $(CURDIR)/../..)", content)
        self.assertIn("VENV_DIR ?= $(REPO_ROOT)/.venv", content)
        self.assertIn("PYTHON ?= $(VENV_PYTHON)", content)

    def test_bootstrap_creates_venv_first(self):
        content = read("Makefile")
        bootstrap = content.split("bootstrap:", 1)[1].split("\n\n", 1)[0]
        self.assertIn("$(MAKE) venv", bootstrap)

    def test_python_targets_depend_on_venv(self):
        content = read("Makefile")
        for target in (
            "toolchain-doctor",
            "env-contract-check",
            "agent-doctor",
            "test-scripts",
            "docs-check",
            "agent-docs-check",
            "release-dry-run",
        ):
            with self.subTest(target=target):
                pattern = rf"^{re.escape(target)}: \| \$\(VENV_PYTHON\)"
                self.assertRegex(content, re.compile(pattern, re.M))

    def test_workflows_never_override_python_directly(self):
        """`PYTHON=...` (or a PYTHON env var) bypasses the venv; CI must set PYTHON_BASE."""
        for workflow in workflow_files():
            content = workflow.read_text(encoding="utf-8")
            with self.subTest(workflow=workflow.name):
                self.assertNotRegex(content, re.compile(r"(?<!_)\bPYTHON=", re.M))
                self.assertNotRegex(content, re.compile(r"^\s*PYTHON:\s", re.M))

    def test_workflows_do_not_call_venv_external_console_scripts(self):
        """Console scripts installed into .venv are not on PATH in CI."""
        for workflow in workflow_files():
            content = workflow.read_text(encoding="utf-8")
            with self.subTest(workflow=workflow.name):
                self.assertNotIn("prisma-client-py generate", content)

    def test_chat_test_runner_uses_venv_interpreter(self):
        content = read("services/chat/run_tests.sh")
        self.assertIn('PY="${REPO_ROOT}/.venv/bin/python"', content)
        self.assertNotRegex(content, re.compile(r"^\s*pip install ", re.M))
        self.assertNotRegex(content, re.compile(r"^\s*pytest ", re.M))
        self.assertNotRegex(content, re.compile(r"^\s*python -m ", re.M))

    def test_venv_is_git_ignored(self):
        self.assertIn(".venv/", read(".gitignore"))


class DocsCheckWiringTests(unittest.TestCase):
    def test_docs_check_runs_the_agent_definition_guard(self):
        """AGENTS.md classifies as docs, so docs-check is the only path that
        runs for an AGENTS.md-only change. The guard reads AGENTS.md, so it has
        to be invoked here or that drift goes unchecked."""
        makefile = read("Makefile")
        recipe = makefile.split("docs-check:", 1)[1].split("\n\n", 1)[0]
        self.assertIn(
            "test_agent_definitions.py",
            recipe,
            "docs-check must run the agent-definition guard; without it, "
            "renumbering the workflow in AGENTS.md would not be caught",
        )


class ChatLintScopeTests(unittest.TestCase):
    """Every Python directory in the chat service must be linted and typed.

    `scripts/` sat outside both targets, so `check_dependency_policy.py` — the
    guard for the service's whole dependency policy — was held to a lower
    standard than the code it guards, and an unused import survived on main.
    """

    SKIP = {".venv", "__pycache__", ".mypy_cache", ".pytest_cache", ".ruff_cache"}

    def python_dirs(self) -> set[str]:
        """Derived from disk, so a new directory is covered without editing this."""
        chat = REPO_ROOT / "services/chat"
        return {
            path.relative_to(chat).parts[0]
            for path in chat.rglob("*.py")
            if not self.SKIP & set(path.parts)
        }

    def recipe(self, target: str) -> str:
        makefile = read("services/chat/Makefile")
        return makefile.split(f"\n{target}:", 1)[1].split("\n\n", 1)[0]

    def test_every_python_directory_is_discovered(self):
        """Without this the two tests below pass vacuously on an empty set."""
        found = self.python_dirs()
        self.assertIn("scripts", found)
        self.assertIn("src", found)
        self.assertGreaterEqual(len(found), 3)

    def test_lint_covers_every_python_directory(self):
        recipe = self.recipe("lint")
        for directory in sorted(self.python_dirs()):
            with self.subTest(directory=directory):
                self.assertIn(directory, recipe)

    def test_typecheck_covers_scripts(self):
        """`tests/` is deliberately excluded — mypy runs on shipped code only."""
        self.assertIn("scripts", self.recipe("typecheck"))


if __name__ == "__main__":
    unittest.main()
