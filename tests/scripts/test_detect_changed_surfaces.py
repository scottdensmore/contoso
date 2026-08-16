import importlib.util
import unittest
from pathlib import Path
from unittest.mock import patch

REPO_ROOT = Path(__file__).resolve().parents[2]


def load_script_module(module_name: str, file_path: Path):
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load module {module_name} from {file_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


detect_changed = load_script_module(
    "detect_changed_surfaces",
    REPO_ROOT / "scripts/detect_changed_surfaces.py",
)


class DetectChangedSurfacesTests(unittest.TestCase):
    def test_path_matches_directory_glob(self):
        self.assertTrue(
            detect_changed.path_matches("apps/web/**", "apps/web/src/app/page.tsx"),
        )

    def test_directory_glob_does_not_match_a_sibling_with_the_same_prefix(self):
        """`dir/**` must require a separator, not just a string prefix.

        Without one, any neighbour whose name starts with the pattern's
        directory matches it.
        """
        for pattern, sibling in (
            ("apps/web/**", "apps/web-e2e/spec.ts"),
            ("docs/**", "docs-archive/notes.md"),
            ("services/chat/**", "services/chat-legacy/old.py"),
            (".claude/agents/**", ".claude/agents-extra/foo.md"),
        ):
            with self.subTest(pattern=pattern, path=sibling):
                self.assertFalse(detect_changed.path_matches(pattern, sibling))

    def test_directory_glob_anchors_at_the_start_of_the_path(self):
        """`startswith`, not "contains".

        Every sibling case above puts the pattern's directory at position 0, so
        a substring check is indistinguishable from a prefix check under them —
        a mutation to `pattern[:-2] in path` passes all of them. These paths
        embed the directory deeper, where the two disagree.
        """
        for pattern, path in (
            ("docs/**", "vendor/docs/notes.md"),
            ("apps/web/**", "backup/apps/web/page.tsx"),
            ("services/chat/**", "archive/services/chat/main.py"),
        ):
            with self.subTest(pattern=pattern, path=path):
                self.assertFalse(detect_changed.path_matches(pattern, path))

    def test_prisma_config_stays_in_the_chat_surface(self):
        """It is a sibling of `apps/web/prisma/`, not a child.

        Before the separator fix it reached the chat surface only through the
        bug. `Dockerfile.migrate` COPYs this file, so losing that coverage would
        let a migration-image change ship without the chat suite ever running —
        and `apps/web/**` still matches it, so `unknown` stays False and the
        runtime fallback does not cover the loss.
        """
        flags = detect_changed.classify(["apps/web/prisma.config.ts"])
        self.assertTrue(flags["web"])
        self.assertTrue(flags["chat"])
        self.assertIn("quick-ci-chat", detect_changed.recommended_targets(flags))

    def test_directory_glob_still_matches_real_children(self):
        """The other half of the guard above.

        A fix that required the separator but broke genuine children would
        route everything to `unknown`, which passes the negative test alone.
        """
        for pattern, child in (
            ("apps/web/**", "apps/web/src/app/page.tsx"),
            ("docs/**", "docs/ENV_CONTRACT.md"),
            ("services/chat/**", "services/chat/src/api/main.py"),
            (".claude/agents/**", ".claude/agents/verifier.md"),
        ):
            with self.subTest(pattern=pattern, path=child):
                self.assertTrue(detect_changed.path_matches(pattern, child))

    def test_sibling_directory_does_not_narrow_ci_to_a_single_job(self):
        """The consequence the separator bug actually had.

        A spurious match keeps `unknown` False, and `unknown` is what forces
        the full runtime suite. So over-matching does not fail safe — it
        suppresses the fallback and silently narrows CI to one job. Asserting
        on `path_matches` alone would not have shown that.
        """
        for sibling in (
            "docs-archive/notes.md",
            "apps/web-e2e/spec.ts",
            "services/chat-legacy/old.py",
        ):
            with self.subTest(path=sibling):
                flags = detect_changed.classify([sibling])
                self.assertTrue(flags["unknown"])
                self.assertTrue(flags["runtime"])
                self.assertIn(
                    "test-scripts", detect_changed.recommended_targets(flags)
                )

    def test_unknown_paths_force_runtime(self):
        flags = detect_changed.classify(["some/new/area/file.txt"])
        self.assertTrue(flags["unknown"])
        self.assertTrue(flags["runtime"])

    def test_recommended_targets_runtime_includes_script_tests(self):
        flags = {
            "runtime": True,
            "web": False,
            "chat": False,
            "docs": False,
            "unknown": False,
            "none": False,
        }
        self.assertEqual(
            detect_changed.recommended_targets(flags),
            [
                "toolchain-doctor",
                "env-contract-check",
                "test-scripts",
                "quick-ci-web",
                "quick-ci-chat",
            ],
        )

    def test_recommended_targets_docs_only(self):
        flags = {
            "runtime": False,
            "web": False,
            "chat": False,
            "docs": True,
            "unknown": False,
            "none": False,
        }
        self.assertEqual(
            detect_changed.recommended_targets(flags), ["test-scripts", "docs-check"]
        )

    def test_recommended_targets_includes_script_tests_for_any_change(self):
        """The local mirror of the script-tests CI gate.

        The guardrail suite asserts on files across every surface, so a
        surface-scoped local run must still include it — otherwise the
        pre-push loop skips the guard that CI runs.
        """
        for surface in ("web", "chat", "docs"):
            with self.subTest(surface=surface):
                flags = {
                    "runtime": False,
                    "web": surface == "web",
                    "chat": surface == "chat",
                    "docs": surface == "docs",
                    "unknown": False,
                    "none": False,
                }
                self.assertIn(
                    "test-scripts", detect_changed.recommended_targets(flags)
                )

    def test_recommended_targets_is_empty_when_nothing_changed(self):
        """`none` must not pick up test-scripts from the clause above."""
        flags = {
            "runtime": False,
            "web": False,
            "chat": False,
            "docs": False,
            "unknown": False,
            "none": True,
        }
        self.assertEqual(detect_changed.recommended_targets(flags), [])

    def test_agent_doc_paths_route_to_docs_check(self):
        for path in (
            "CLAUDE.md",
            "GEMINI.md",
            "AGENTS.md",
            ".github/copilot-instructions.md",
            "apps/web/CLAUDE.md",
            "apps/web/GEMINI.md",
            "apps/web/AGENTS.md",
            "services/chat/CLAUDE.md",
            "services/chat/GEMINI.md",
            "services/chat/AGENTS.md",
        ):
            with self.subTest(path=path):
                flags = detect_changed.classify([path])
                self.assertTrue(flags["docs"])
                self.assertFalse(flags["unknown"])
                self.assertIn("docs-check", detect_changed.recommended_targets(flags))

    def test_split_chat_requirement_paths_are_runtime(self):
        for path in (
            "services/chat/src/api/requirements-core.txt",
            "services/chat/src/api/requirements-local.txt",
        ):
            with self.subTest(path=path):
                flags = detect_changed.classify([path])
                self.assertTrue(flags["runtime"])

    def test_compose_changes_are_runtime(self):
        """docker-compose.yml already matched web and chat, so it never reached
        the unknown fallback. Without an explicit runtime pattern, a
        compose-only change would skip test-scripts and the startup-ordering
        guard that protects it."""
        flags = detect_changed.classify(["docker-compose.yml"])
        self.assertTrue(flags["runtime"])
        self.assertIn("test-scripts", detect_changed.recommended_targets(flags))

    def test_agent_definitions_are_runtime(self):
        """Agent definitions are repo tooling, not an unclassified path.

        They would reach runtime anyway through the unknown fallback, but by
        accident. An explicit pattern means the routing survives a change to
        how unknown paths are handled.
        """
        flags = detect_changed.classify([".claude/agents/verifier.md"])
        self.assertTrue(flags["runtime"])
        self.assertFalse(flags["unknown"], "should match a pattern, not fall through")
        self.assertIn("test-scripts", detect_changed.recommended_targets(flags))

    def test_dependabot_config_is_runtime(self):
        """The Dependabot config is repo tooling, not an unclassified path.

        Same shape as the agent definitions above, and the same reason: it
        reaches runtime through the unknown fallback, so the routing has always
        been right by accident. `unknown` is the catch-all for paths nobody has
        classified, and every known file that leans on it makes the flag mean
        less -- it cannot then be tightened without silently reclassifying
        whatever else was sheltering there.

        Runtime rather than something narrower for two reasons, neither of
        which is about the guards that read the file: `test-scripts` runs for
        every non-empty change regardless of surface, so those run either way.
        It is the same class of repository metadata as `.github/CODEOWNERS` and
        the templates beside it, which are already runtime; and runtime is the
        one option that leaves the effective routing identical to the fallback
        it replaces, so `unknown` narrows with no change to what CI runs.
        """
        flags = detect_changed.classify([".github/dependabot.yml"])
        self.assertTrue(flags["runtime"])
        self.assertFalse(flags["unknown"], "should match a pattern, not fall through")
        self.assertIn("test-scripts", detect_changed.recommended_targets(flags))

    def test_changed_files_from_range_includes_deletions(self):
        """A deletion-only change must still classify its surface.

        The diff filter previously omitted D, so removing files produced an
        empty file list, classified as "none", and CI skipped every scoped
        check — a deleted referenced asset or source file would have gone
        green without the web or chat suites running.
        """
        with patch.object(detect_changed, "run_git", return_value="") as run_git:
            detect_changed.changed_files_from_range(base="main", head="HEAD")

        args = run_git.call_args.args[0]
        diff_filter = next(a for a in args if a.startswith("--diff-filter="))
        self.assertIn("D", diff_filter, "deletions must be reported as changes")

    def test_deleted_web_asset_routes_to_web_checks(self):
        flags = detect_changed.classify(
            ["apps/web/public/images/1/abc-alt-1.jpg"],
        )
        self.assertTrue(flags["web"])
        self.assertFalse(flags["none"])
        self.assertIn("quick-ci-web", detect_changed.recommended_targets(flags))

    def test_changed_files_from_worktree_parses_porcelain(self):
        porcelain = "\n".join(
            [
                " M Makefile",
                "R  old/path.py -> scripts/new_path.py",
                "?? tests/scripts/test_new.py",
            ],
        )

        with patch.object(detect_changed, "run_git", return_value=porcelain):
            files = detect_changed.changed_files_from_worktree()

        self.assertEqual(
            files,
            [
                "Makefile",
                "scripts/new_path.py",
                "tests/scripts/test_new.py",
            ],
        )


if __name__ == "__main__":
    unittest.main()
