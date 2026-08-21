"""Guard the local development surface against defects that pass silently.

The three things asserted here had one property in common before they were
fixed: none of them could fail. `sync-env`'s whole body sat behind a path test
that was always false, so it exited 0 and printed nothing on every run for as
long as it has existed. A `docker-compose.override.yml` that is not ignored
looks exactly like one that is, until someone commits it. A `prisma migrate
dev` with no `--name` looks fine until the schema has actually changed, and
then it blocks on a prompt no non-TTY can answer and exits 130 — a
cancellation, not a missing argument.

So each assertion here measures the effect rather than the text:

- `sync-env` is **run**, in a fixture tree, and the copied file is compared to
  the original. Separately its source path is **resolved** from the directory
  the recipe runs in, because `../.env` and `../../.env` are both plausible
  strings and only one names a file that exists — that one gives the useful
  failure message, and the execution catches the mistakes a parse cannot see.
- `git check-ignore` is asked whether the override is ignored, rather than
  `.gitignore` being grepped for a line that could be anchored wrong, negated
  later, or shadowed;
- every `npx prisma migrate dev` in tracked documentation is checked, not the
  one file that happened to be wrong, and not only the ones inside fences.

Not covered: the unsupported `eslint` key removed from `next.config.js` at the
same time. Asserting a key is absent is a declaration check, and the thing that
actually reports it is `next build`, which CI already runs — the key never
enforced anything, since lint runs as its own step.
"""

import re
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
WEB_DIR = REPO_ROOT / "apps/web"
WEB_MAKEFILE = WEB_DIR / "Makefile"
OVERRIDE = "docker-compose.override.yml"


def sync_env_sources() -> list[str]:
    """Every path the `sync-env` recipe reads, as written in the Makefile."""
    lines = WEB_MAKEFILE.read_text(encoding="utf-8").splitlines()
    body: list[str] = []
    inside = False
    for line in lines:
        if line.startswith("sync-env:"):
            inside = True
            continue
        if inside:
            # A recipe line is tab-indented; anything else ends the target.
            if not line.startswith("\t"):
                break
            body.append(line)
    return re.findall(r"(\.\.[./]*\.env)", "\n".join(body))


def tracked_docs(root: Path = REPO_ROOT) -> list[Path]:
    listed = subprocess.run(
        [
            "git",
            "ls-files",
            "--cached",
            "--others",
            "--exclude-standard",
            "-z",
            "--",
            "*.md",
        ],
        cwd=root,
        capture_output=True,
        text=True,
        check=True,
    )
    return [
        root / name
        for name in listed.stdout.split("\0")
        if name and (root / name).is_file()
    ]


class SyncEnvTests(unittest.TestCase):
    def test_the_recipe_reads_a_path(self):
        """Vacuity guard: an empty parse satisfies the resolution check below."""
        self.assertTrue(
            sync_env_sources(),
            f"parsed no .env path out of sync-env in {WEB_MAKEFILE}",
        )

    def test_every_source_resolves_to_the_repo_root_env(self):
        """Resolved, not matched.

        The recipe runs with `apps/web` as its working directory, so the string
        is only correct relative to that. `../.env` resolves to `apps/.env`,
        which has never existed — and because the recipe guards on `-f`, that
        wrong path and an absent root `.env` produce identical output.
        """
        for source in sync_env_sources():
            resolved = (WEB_DIR / source).resolve()
            self.assertEqual(
                resolved,
                (REPO_ROOT / ".env").resolve(),
                f"sync-env reads {source!r}, which from {WEB_DIR.name} resolves "
                f"to {resolved} rather than the repo root .env. The `-f` guard "
                f"makes that silent (#212).",
            )


class SyncEnvExecutionTests(unittest.TestCase):
    """Run the real recipe, rather than reading it.

    The parse above catches the class of bug that was actually there — a path
    correct from the wrong directory. It cannot catch the next one: a quoting
    mistake, a `make` variable that expands to nothing, a `cp` whose argument
    order slipped. Those all leave a recipe that reads correctly and copies
    nothing, which is precisely the failure `sync-env` already had once.

    `apps/web/Makefile` has no `include` and no state outside itself, so it can
    be copied into a fixture tree and invoked there. Nothing here touches the
    checkout.
    """

    def run_sync_env(self, root: Path) -> subprocess.CompletedProcess[str]:
        web = root / "apps/web"
        web.mkdir(parents=True)
        shutil.copy(WEB_MAKEFILE, web / "Makefile")
        return subprocess.run(
            ["make", "sync-env"],
            cwd=web,
            capture_output=True,
            text=True,
            # Nothing in the recipe can block on input, so this should never
            # fire. It is here so that if it ever does — a shell rc doing
            # something unexpected under `SHELL := /bin/bash`, say — the test
            # fails with a timeout rather than consuming the job's budget.
            timeout=60,
        )

    def test_it_copies_the_repo_root_env(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / ".env").write_text("MARKER=from-repo-root\n", encoding="utf-8")

            result = self.run_sync_env(root)
            self.assertEqual(result.returncode, 0, result.stderr)

            copied = root / "apps/web/.env"
            self.assertTrue(
                copied.exists(),
                "sync-env exited 0 without copying anything — which is exactly "
                "how the `../.env` bug looked for as long as it existed (#212)",
            )
            self.assertEqual(copied.read_text(encoding="utf-8"), "MARKER=from-repo-root\n")

    def test_it_stays_quiet_when_there_is_no_root_env(self):
        """The `-f` guard's legitimate case, which is why it is there.

        CI creates no `.env`, so the target has to be a no-op rather than a
        failure. Asserted so that a future fix for the silence above cannot
        turn this into a hard error.
        """
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            result = self.run_sync_env(root)
            self.assertEqual(result.returncode, 0, result.stderr)
            self.assertFalse((root / "apps/web/.env").exists())


class ComposeOverrideTests(unittest.TestCase):
    def test_a_local_compose_override_is_ignored(self):
        """Asked of git, not of `.gitignore`.

        `docker compose` auto-loads this file, so a committed one applies to
        everyone and to CI without being asked for. Grepping `.gitignore` would
        pass on a pattern that is anchored wrong or negated further down; git
        is the tool that decides.

        This covers more than the pattern: `git check-ignore` reports a tracked
        path as *not* ignored even when a matching rule exists, so an override
        that was force-added fails here too, which is the case that actually
        hurts.
        """
        result = subprocess.run(
            ["git", "check-ignore", "-q", OVERRIDE],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
        )
        self.assertEqual(
            result.returncode,
            0,
            f"git does not ignore {OVERRIDE}, so a machine-local override can "
            f"be committed and will then apply to everyone and to CI (#247)",
        )


class MigrateCommandTests(unittest.TestCase):
    def test_deleted_tracked_document_is_not_opened(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            subprocess.run(["git", "init", "--quiet", str(root)], check=True)
            kept = root / "kept.md"
            deleted = root / "deleted.md"
            kept.write_text("kept\n", encoding="utf-8")
            deleted.write_text("deleted\n", encoding="utf-8")
            subprocess.run(
                ["git", "add", "kept.md", "deleted.md"], cwd=root, check=True
            )
            deleted.unlink()

            docs = tracked_docs(root)

        self.assertEqual(docs, [kept])

    def test_documented_migrate_dev_commands_name_the_migration(self):
        """Keyed on `npx`, which is what separates a command from a mention.

        Prose refers to the command by name too — `docs/DATABASE.md` explains
        that seeding runs "during `prisma migrate dev`" — and appending
        `--name` to a sentence would be nonsense. An earlier version of this
        excluded prose by only reading fenced blocks, which also excluded
        `CONTRIBUTING.md`'s invocation: it is runnable, carries `--name`, and
        lives in an inline code span. Keying on the invocation form admits all
        three real commands and still leaves the sentence out, because the
        sentence names the subcommand without ever invoking it.
        """
        offenders = []
        seen = 0
        for doc in tracked_docs():
            for line in doc.read_text(encoding="utf-8").splitlines():
                if "npx prisma migrate dev" not in line:
                    continue
                seen += 1
                if "--name" not in line:
                    offenders.append(f"{doc.relative_to(REPO_ROOT)}: {line.strip()}")
        # Vacuity: if no document mentions the command, the loop above proves
        # nothing and this test would pass on a docs tree that lost it.
        self.assertGreater(seen, 0, "no tracked document shows `prisma migrate dev`")
        self.assertEqual(
            offenders,
            [],
            "`prisma migrate dev` without --name stops at an interactive prompt "
            "once the schema has changed, which a non-TTY cannot answer: it "
            "exits 130 with no migration created, and reads as a cancellation "
            "rather than a missing argument (#246). Offenders: "
            + "; ".join(offenders),
        )


if __name__ == "__main__":
    unittest.main()
