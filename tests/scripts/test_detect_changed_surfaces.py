import contextlib
import importlib.util
import os
import subprocess
import tempfile
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

    def test_generated_workflow_assets_route_to_runtime_by_intent(self):
        for path in (
            ".agents/agent-skills.json",
            ".agents/agents/verifier.md",
            ".agents/skills/verifier/SKILL.md",
            ".claude/agents/verifier.md",
            ".claude/skills/verifier/SKILL.md",
            ".codex/agents/verifier.toml",
            ".cursor/agents/verifier.md",
            ".github/agents/verifier.md",
        ):
            with self.subTest(path=path):
                flags = detect_changed.classify([path])
                self.assertTrue(flags["runtime"])
                self.assertTrue(flags["workflow"])
                self.assertFalse(flags["unknown"])
                self.assertEqual(detect_changed.recommended_targets(flags), ["ci"])

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
        """Agent definitions select the complete gate by explicit policy.

        They would reach runtime anyway through the unknown fallback, but by
        accident. An explicit pattern means the routing survives a change to
        how unknown paths are handled, and the workflow flag adds build/docs.
        """
        flags = detect_changed.classify([".claude/agents/verifier.md"])
        self.assertTrue(flags["runtime"])
        self.assertTrue(flags["workflow"])
        self.assertFalse(flags["unknown"], "should match a pattern, not fall through")
        self.assertEqual(detect_changed.recommended_targets(flags), ["ci"])

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

    def test_every_committed_workflow_is_classified_by_intent(self):
        """Every file in .github/workflows must match a pattern, not fall through.

        The failure this guards against is adding a workflow and forgetting to
        classify it. `codeql.yml` was exactly that: CI's own three workflows were
        listed in RUNTIME_PATTERNS explicitly while it reached runtime through
        the unknown fallback, so its routing was right by accident and
        indistinguishable from an oversight.

        Read from disk rather than hardcoded, because a fixed list cannot see the
        workflow nobody remembered to add. Both suffixes, because GitHub accepts
        `.yaml` as well: a `.yml`-only glob would omit such a file from the loop
        entirely and pass, which is this test failing at the one job it has.

        Runtime rather than something narrower, for the same reason as
        `.github/dependabot.yml` above: it leaves the effective routing
        byte-identical to the fallback it replaces, so `unknown` narrows without
        changing what CI runs.
        """
        directory = REPO_ROOT / ".github/workflows"
        workflows = sorted(
            path
            for suffix in ("*.yml", "*.yaml")
            for path in directory.glob(suffix)
        )
        self.assertTrue(workflows, "no workflows found -- the glob is wrong")
        for path in workflows:
            rel = path.relative_to(REPO_ROOT).as_posix()
            with self.subTest(path=rel):
                flags = detect_changed.classify([rel])
                self.assertTrue(flags["runtime"])
                self.assertFalse(
                    flags["unknown"],
                    f"{rel} reaches runtime only through the unknown fallback; "
                    "add it to RUNTIME_PATTERNS so the routing is intentional",
                )

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


# Names git renders differently from how they sit on disk. `SPACED` is the one
# that matters most: `git status --porcelain` quotes it even under
# `core.quotePath=false`, while `git diff --name-only` never quotes it at all,
# so the two readers need different handling and only one of them is fixed by
# the config flag.
SPACED = "apps/web/src/a b.tsx"
NON_ASCII = "apps/web/src/na\u00efve.tsx"
PLAIN = "apps/web/src/plain.tsx"


def git(repo: Path, *args: str) -> str:
    completed = subprocess.run(
        ["git", *args],
        cwd=repo,
        text=True,
        capture_output=True,
        check=True,
    )
    return completed.stdout


class QuotedPathFixture:
    """A real repository containing names git C-quotes.

    Patching `run_git` cannot exercise this: the defect is in what git emits,
    so the fixture has to be a repository git actually reads. `tests/scripts/
    AGENTS.md` asks for the owning tool's own output where practical, and this
    is the case it is describing.
    """

    def __init__(self, stack):
        self.root = Path(stack.enter_context(tempfile.TemporaryDirectory()))
        git(self.root, "init", "--quiet", ".")
        git(self.root, "config", "user.email", "guard@example.test")
        git(self.root, "config", "user.name", "Guard")
        git(self.root, "config", "commit.gpgsign", "false")
        (self.root / "README.md").write_text("base\n", encoding="utf-8")
        git(self.root, "add", "-A")
        git(self.root, "commit", "--quiet", "-m", "base")

    def write(self, *relative: str) -> None:
        for name in relative:
            path = self.root / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("contents\n", encoding="utf-8")

    def commit(self, message: str) -> None:
        git(self.root, "add", "-A")
        git(self.root, "commit", "--quiet", "-m", message)

    def raw_status(self) -> str:
        return git(self.root, "status", "--porcelain")

    def raw_diff(self, base: str, head: str) -> str:
        return git(self.root, "diff", "--name-only", "--diff-filter=ACMRTD", f"{base}...{head}")


class QuotedPathTests(unittest.TestCase):
    """Paths git quotes must still classify as the surface they belong to.

    Routing fails safe today -- an unrecognised path sets `unknown`, which
    forces the full runtime recommendation -- so nothing is under-gated and the
    defect has never been visible in CI. The cost is to the flag: `unknown` is
    meant to mean "no pattern claims this path", and #253 narrowed it for
    exactly that reason. A renamed component with a space in its name reads, to
    that flag, as unclassified.
    """

    def setUp(self):
        stack = contextlib.ExitStack()
        self.addCleanup(stack.close)
        self.fixture = QuotedPathFixture(stack)
        # Every assertion below reaches git through this constant, so the
        # fixture is only isolated once it is rebound -- otherwise `run_git`
        # reads the checkout this guard is meant to protect.
        stack.enter_context(patch.object(detect_changed, "ROOT", self.fixture.root))

    def test_the_fixture_actually_produces_quoted_output(self):
        """Without this, the tests below could pass on a fixture git never quotes."""
        self.fixture.write(SPACED, NON_ASCII, PLAIN)
        self.fixture.commit("add awkward names")
        self.fixture.write(SPACED, NON_ASCII, PLAIN)
        for path in (self.fixture.root / SPACED, self.fixture.root / NON_ASCII):
            path.write_text("modified\n", encoding="utf-8")

        status = self.fixture.raw_status()
        self.assertIn('"apps/web/src/a b.tsx"', status)
        self.assertIn("\\303\\257", status)

    def test_worktree_reader_unquotes_the_names_git_quoted(self):
        self.fixture.write(SPACED, NON_ASCII, PLAIN)
        self.fixture.commit("add awkward names")
        for name in (SPACED, NON_ASCII, PLAIN):
            (self.fixture.root / name).write_text("modified\n", encoding="utf-8")

        files = detect_changed.changed_files_from_worktree()

        self.assertEqual(files, sorted([SPACED, NON_ASCII, PLAIN]))

    def test_worktree_quoted_names_classify_as_web(self):
        self.fixture.write(SPACED, NON_ASCII)
        self.fixture.commit("add awkward names")
        for name in (SPACED, NON_ASCII):
            (self.fixture.root / name).write_text("modified\n", encoding="utf-8")

        flags = detect_changed.classify(detect_changed.changed_files_from_worktree())

        self.assertTrue(flags["web"], "a web source file must classify as web")
        self.assertFalse(
            flags["unknown"],
            "a tracked source file must not shelter under the unknown fallback",
        )

    def test_range_reader_unquotes_the_names_git_quoted(self):
        self.fixture.write(SPACED, NON_ASCII, PLAIN)
        self.fixture.commit("add awkward names")

        files = detect_changed.changed_files_from_range(base="HEAD~1", head="HEAD")

        self.assertEqual(files, sorted([SPACED, NON_ASCII, PLAIN]))

    def test_range_quoted_names_classify_as_web(self):
        self.fixture.write(SPACED, NON_ASCII)
        self.fixture.commit("add awkward names")

        flags = detect_changed.classify(
            detect_changed.changed_files_from_range(base="HEAD~1", head="HEAD"),
        )

        self.assertTrue(flags["web"])
        self.assertFalse(flags["unknown"])

    def test_a_quoted_name_containing_the_rename_separator_is_not_split_on_it(self):
        """The separator git puts between a rename's two paths is also legal in a name.

        `status --porcelain` quotes any name with a space in it, so this one
        arrives as a single quoted token. Splitting the raw payload on " -> "
        cuts it in half and reports `b.tsx"` as the changed file.
        """
        awkward = "apps/web/src/a -> b.tsx"
        self.fixture.write(awkward)
        self.fixture.commit("add a name containing the separator")
        (self.fixture.root / awkward).write_text("modified\n", encoding="utf-8")

        files = detect_changed.changed_files_from_worktree()

        self.assertEqual(files, [awkward])

    def test_names_using_the_named_escapes_round_trip(self):
        """The escape table for quotes, backslashes and control characters.

        Nothing else in this class reaches it. A space produces quoting with no
        escape at all, and non-ASCII goes through the octal branch, so the
        named-escape table was free to be wrong: dropping it entirely leaves
        every other test here green while `\t` decodes to `t` and
        `apps/web/src/ta\tb.tsx` silently becomes `apps/web/src/tatb.tsx` -- a
        rewritten path in the file that routes every check CI runs.
        """
        awkward = 'apps/web/src/qu"o\tte\\back.tsx'
        self.fixture.write(awkward)
        self.fixture.commit("add a name needing named escapes")
        (self.fixture.root / awkward).write_text("modified\n", encoding="utf-8")

        # Vacuity: this is only a test of the escape table if git actually
        # emitted those escapes. A fixture git chose to quote some other way
        # would leave the assertion below passing for the wrong reason.
        status = self.fixture.raw_status()
        self.assertIn('\\"', status, "git did not escape the quote character")
        self.assertIn("\\t", status, "git did not escape the tab character")

        files = detect_changed.changed_files_from_worktree()

        self.assertEqual(files, [awkward])

    def test_a_filename_that_is_not_utf8_does_not_crash_the_reader(self):
        """This is why the fix does not use `core.quotePath=false`.

        With that flag git emits the raw bytes and `subprocess.run(text=True)`
        raises `UnicodeDecodeError`, so a single such file would take down
        `make quick-ci-changed` entirely rather than misclassify one path.
        Git's default quoting keeps the stream ASCII, which is what the
        unquoter is built to read.
        """
        directory = self.fixture.root / "apps/web/src"
        directory.mkdir(parents=True, exist_ok=True)
        raw_name = os.path.join(os.fsencode(directory), b"bad\xff.tsx")
        with open(raw_name, "wb") as handle:
            handle.write(b"contents\n")
        self.fixture.commit("add a name that is not utf-8")
        with open(raw_name, "wb") as handle:
            handle.write(b"modified\n")

        # Vacuity: if git had not quoted this, the reader would be getting an
        # ordinary ASCII path and the decode path under test never runs.
        self.assertIn("\\377", self.fixture.raw_status())

        files = detect_changed.changed_files_from_worktree()

        self.assertEqual(len(files), 1, f"expected one changed file, got {files!r}")
        flags = detect_changed.classify(files)
        self.assertTrue(flags["web"])
        self.assertFalse(flags["unknown"])

    def test_worktree_rename_into_a_quoted_name_reports_the_destination(self):
        self.fixture.write(PLAIN)
        self.fixture.commit("add plain")
        git(self.fixture.root, "mv", PLAIN, SPACED)

        files = detect_changed.changed_files_from_worktree()

        self.assertEqual(
            files,
            [SPACED],
            "a rename reports where the file now is, not where it was",
        )


if __name__ == "__main__":
    unittest.main()
