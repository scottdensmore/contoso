import importlib.util
import subprocess
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]


def load_script_module(module_name: str, file_path: Path):
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load module {module_name} from {file_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


check_agent_docs = load_script_module(
    "check_agent_docs",
    REPO_ROOT / "scripts/check_agent_docs.py",
)


def canonical_pointer(root: Path, pointer_relative: str, agents_relative: str) -> str:
    spec = check_agent_docs.PointerSpec(root / pointer_relative, root / agents_relative, root)
    return spec.render()


def build_scope(root: Path, relative: str = ".") -> Path:
    """Create an AGENTS.md scope with every canonical sibling pointer."""
    scope = root / relative
    scope.mkdir(parents=True, exist_ok=True)
    (scope / "AGENTS.md").write_text("# AGENTS\n\nRun `make quick-ci-changed`.\n", encoding="utf-8")
    for filename in check_agent_docs.SIBLING_POINTER_FILENAMES:
        spec = check_agent_docs.PointerSpec(scope / filename, scope / "AGENTS.md", root)
        spec.pointer.write_text(spec.render(), encoding="utf-8")
    return scope


def build_fixed_pointers(root: Path) -> None:
    for pointer_relative, agents_relative in check_agent_docs.FIXED_POINTERS.items():
        pointer = root / pointer_relative
        pointer.parent.mkdir(parents=True, exist_ok=True)
        pointer.write_text(
            canonical_pointer(root, pointer_relative, agents_relative),
            encoding="utf-8",
        )


def build_repo(root: Path) -> Path:
    scope = build_scope(root)
    build_fixed_pointers(root)
    return scope


class CheckAgentDocsTests(unittest.TestCase):
    def test_canonical_pointers_pass(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            build_repo(root)
            build_scope(root, "apps/web")

            errors = check_agent_docs.check_agent_docs(root=root)

        self.assertEqual(errors, [])

    def test_covers_claude_gemini_and_copilot(self):
        self.assertEqual(
            check_agent_docs.SIBLING_POINTER_FILENAMES,
            ("CLAUDE.md", "GEMINI.md"),
        )
        self.assertIn(".github/copilot-instructions.md", check_agent_docs.FIXED_POINTERS)

    def test_fixed_pointer_links_up_to_root_agents_file(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            build_repo(root)

            spec = check_agent_docs.PointerSpec(
                root / ".github/copilot-instructions.md",
                root / "AGENTS.md",
                root,
            )

        self.assertEqual(spec.agents_link, "../AGENTS.md")
        self.assertIn("[AGENTS.md](../AGENTS.md)", spec.render())

    def test_claude_pointer_uses_the_import_form(self):
        """Claude Code loads AGENTS.md through `@AGENTS.md`; a link it may never open.

        The form has to match what agent-skills' adopt.sh writes. When the two
        disagree every adoption run silently re-breaks this guard, which is how
        the drift was found.
        """
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            rendered = canonical_pointer(root, "CLAUDE.md", "AGENTS.md")

        self.assertIn("@AGENTS.md", rendered)
        self.assertNotIn("[AGENTS.md](./AGENTS.md)", rendered)

    def test_non_claude_pointers_keep_the_link_form(self):
        """`@AGENTS.md` is Claude Code syntax. Gemini and Copilot do not parse it,
        so importing the template wholesale would hand them a broken pointer."""
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            gemini = canonical_pointer(root, "GEMINI.md", "AGENTS.md")
            copilot = canonical_pointer(root, ".github/copilot-instructions.md", "AGENTS.md")

        self.assertIn("[AGENTS.md](./AGENTS.md)", gemini)
        self.assertNotIn("@AGENTS.md", gemini)
        self.assertIn("[AGENTS.md](../AGENTS.md)", copilot)
        self.assertNotIn("@AGENTS.md", copilot)

    def test_claude_memory_append_is_flagged(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            scope = build_repo(root)
            pointer = scope / "CLAUDE.md"
            pointer.write_text(
                canonical_pointer(root, "CLAUDE.md", "AGENTS.md")
                + "\n## Memories\n\n- Always run `make e2e-smoke` before release.\n",
                encoding="utf-8",
            )

            errors = check_agent_docs.check_agent_docs(root=root)

        self.assertTrue(any("CLAUDE.md is not the canonical pointer" in error for error in errors))
        self.assertTrue(any("make e2e-smoke" in error for error in errors))

    def test_drift_in_each_pointer_type_is_flagged(self):
        for pointer_relative in ("CLAUDE.md", "GEMINI.md", ".github/copilot-instructions.md"):
            with self.subTest(pointer=pointer_relative):
                with tempfile.TemporaryDirectory() as temp_dir:
                    root = Path(temp_dir)
                    build_repo(root)
                    (root / pointer_relative).write_text(
                        "# Notes\n\n- Deploy with `make release-dry-run`.\n",
                        encoding="utf-8",
                    )

                    errors = check_agent_docs.check_agent_docs(root=root)

                self.assertTrue(
                    any("is not the canonical pointer" in error for error in errors),
                    msg=f"expected drift error for {pointer_relative}",
                )
                self.assertTrue(any("make release-dry-run" in error for error in errors))

    def test_missing_pointer_is_flagged(self):
        for pointer_relative in ("CLAUDE.md", "GEMINI.md", ".github/copilot-instructions.md"):
            with self.subTest(pointer=pointer_relative):
                with tempfile.TemporaryDirectory() as temp_dir:
                    root = Path(temp_dir)
                    build_repo(root)
                    (root / pointer_relative).unlink()

                    errors = check_agent_docs.check_agent_docs(root=root)

                self.assertTrue(
                    any(error.startswith(f"Missing {pointer_relative}") for error in errors),
                    msg=f"expected missing-pointer error for {pointer_relative}",
                )

    def test_pointer_without_sibling_agents_file_is_flagged(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            build_repo(root)
            orphan = root / "services/chat"
            orphan.mkdir(parents=True, exist_ok=True)
            (orphan / "GEMINI.md").write_text("# Orphan\n", encoding="utf-8")

            errors = check_agent_docs.check_agent_docs(root=root)

        self.assertTrue(any("has no sibling AGENTS.md" in error for error in errors))

    def test_missing_root_agents_file_is_flagged(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)

            errors = check_agent_docs.check_agent_docs(root=root)

        self.assertTrue(any("Missing AGENTS.md at the repository root" in error for error in errors))

    def test_skips_vendored_directories(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            build_repo(root)
            vendored = root / "node_modules/some-package"
            vendored.mkdir(parents=True, exist_ok=True)
            (vendored / "AGENTS.md").write_text("# Vendored\n", encoding="utf-8")

            errors = check_agent_docs.check_agent_docs(root=root)

        self.assertEqual(errors, [])

    def test_skips_untracked_files_ignored_by_git(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            subprocess.run(
                ["git", "init", "--quiet", str(root)],
                check=True,
                capture_output=True,
                text=True,
            )
            (root / ".gitignore").write_text("tmp/\n", encoding="utf-8")
            build_repo(root)
            ignored = root / "tmp/copied-source"
            ignored.mkdir(parents=True)
            (ignored / "AGENTS.md").write_text("# Ignored copy\n", encoding="utf-8")

            errors = check_agent_docs.check_agent_docs(root=root)

        self.assertEqual(errors, [])

    def test_fix_restores_pointer_and_reports_rescued_content(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            scope = build_repo(root)
            (scope / "GEMINI.md").write_text(
                canonical_pointer(root, "GEMINI.md", "AGENTS.md")
                + "\n- Prefer `gh` for git operations.\n",
                encoding="utf-8",
            )

            changed, rescued = check_agent_docs.fix_agent_docs(root=root)

            self.assertEqual(changed, ["GEMINI.md"])
            self.assertTrue(any("Prefer `gh` for git operations." in line for line in rescued))
            self.assertEqual(check_agent_docs.check_agent_docs(root=root), [])

    def test_fix_creates_missing_pointers(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            (root / "AGENTS.md").write_text("# AGENTS\n", encoding="utf-8")

            changed, rescued = check_agent_docs.fix_agent_docs(root=root)

            self.assertEqual(rescued, [])
            self.assertEqual(
                sorted(changed),
                sorted([".github/copilot-instructions.md", "CLAUDE.md", "GEMINI.md"]),
            )
            self.assertEqual(check_agent_docs.check_agent_docs(root=root), [])

    def test_repository_agent_docs_are_canonical(self):
        self.assertEqual(check_agent_docs.check_agent_docs(root=REPO_ROOT), [])


if __name__ == "__main__":
    unittest.main()
