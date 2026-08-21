#!/usr/bin/env python3
"""Detect changed repository surfaces and map to recommended checks."""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path
from typing import Iterable

ROOT = Path(__file__).resolve().parent.parent

WORKFLOW_PATTERNS = (
    ".agents/**",
    ".claude/agents/**",
    ".claude/skills/**",
    ".codex/agents/**",
    ".cursor/agents/**",
    ".github/agents/**",
)

RUNTIME_PATTERNS = (
    ".github/workflows/ci.yml",
    ".github/workflows/release.yml",
    ".github/workflows/release-main-build.yml",
    # Listed for the same reason as .github/dependabot.yml below: it reached
    # runtime through the unknown fallback, so its routing was right by accident
    # while its three siblings above were explicit. test_detect_changed_surfaces
    # now reads this directory from disk, so a new workflow that is not listed
    # here fails rather than quietly inheriting the fallback.
    ".github/workflows/codeql.yml",
    ".github/CODEOWNERS",
    ".github/PULL_REQUEST_TEMPLATE.md",
    ".github/ISSUE_TEMPLATE/**",
    # Reached runtime through the unknown fallback before this, so the routing
    # was right by accident and indistinguishable from an oversight -- which is
    # how #253 was found. Runtime for the same reason as the three entries above
    # it: repository metadata that changes no runtime code, gated as runtime
    # anyway. It also keeps the effective routing byte-identical to the fallback
    # it replaces, so this narrows `unknown` without changing what CI runs.
    ".github/dependabot.yml",
    "Makefile",
    "mise.toml",
    "package.json",
    "config/env_contract.json",
    ".env.example",
    "services/chat/.env.example",
    "docs/ENV_CONTRACT.md",
    "scripts/agent_doctor.py",
    "scripts/check_toolchain.py",
    "scripts/check_env_contract.py",
    "scripts/detect_changed_surfaces.py",
    "scripts/release_dry_run.py",
    "scripts/e2e_smoke.py",
    "scripts/ci_smoke_metrics.py",
    "scripts/verify_docs.py",
    "scripts/check_agent_docs.py",
    "tests/scripts/**",
    # Generated agent definitions and skills are repo tooling. Without these
    # they classify as "unknown", which forces runtime by accident rather than
    # by intent and hides omissions when a new host surface is installed.
    *WORKFLOW_PATTERNS,
    # Compose is web+chat, but the guard that protects its startup ordering
    # lives in tests/scripts. Without this, a change dropping the healthcheck
    # would never run that guard.
    "docker-compose.yml",
    "apps/web/package-lock.json",
    "apps/web/package.json",
    "services/chat/constraints.txt",
    "services/chat/src/api/requirements-core.txt",
    "services/chat/src/api/requirements-local.txt",
    "services/chat/tests/requirements-test.txt",
    "services/chat/requirements-dev.txt",
)

WEB_PATTERNS = (
    "apps/web/**",
    "Dockerfile",
    "docker-compose.yml",
)

CHAT_PATTERNS = (
    "services/chat/**",
    "apps/web/prisma/**",
    # A sibling of prisma/, not a child, so the pattern above never covered it
    # on purpose — it matched only through the missing separator in
    # path_matches. Dockerfile.migrate below COPYs this exact file, so editing
    # it changes the migration image and must run the chat suite.
    #
    # Any future prisma.* sibling needs its own entry for the same reason:
    # apps/web/** still matches it, so `unknown` stays False and the runtime
    # fallback will not cover the omission.
    "apps/web/prisma.config.ts",
    "docker-compose.yml",
    "Dockerfile.migrate",
)

DOC_PATTERNS = (
    "docs/**",
    "README.md",
    # Bare filenames match in any directory, covering nested agent runbooks
    # and their CLAUDE.md pointers.
    "AGENTS.md",
    "CLAUDE.md",
    "GEMINI.md",
    "CONTRIBUTING.md",
    ".github/copilot-instructions.md",
)

ALL_PATTERNS = RUNTIME_PATTERNS + WEB_PATTERNS + CHAT_PATTERNS + DOC_PATTERNS


def run_git(args: list[str]) -> str:
    completed = subprocess.run(
        ["git", *args],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if completed.returncode != 0:
        detail = completed.stderr.strip() or completed.stdout.strip() or f"exit {completed.returncode}"
        raise RuntimeError(f"git {' '.join(args)} failed: {detail}")
    return completed.stdout


def path_matches(pattern: str, path: str) -> bool:
    if pattern.endswith("/**"):
        # Keep the trailing separator. Dropping it matches any sibling whose
        # name merely starts with the directory's, so "docs-archive/x.md" hits
        # "docs/**". That is not the harmless direction: a spurious match keeps
        # `unknown` False, which suppresses the fallback that would otherwise
        # force the full runtime suite, and CI silently narrows to one job.
        return path.startswith(pattern[:-2])
    return Path(path).match(pattern)


def matches_any(path: str, patterns: Iterable[str]) -> bool:
    return any(path_matches(pattern, path) for pattern in patterns)


# git renders a path it considers unsafe as a C-quoted string: wrapped in
# double quotes, with backslash escapes and non-ASCII bytes as three-digit
# octal. `git status --porcelain` does that for any name containing a space,
# and both readers do it for non-ASCII. Taken literally, `"apps/web/a b.tsx"`
# matches no pattern and classifies as `unknown` (#297).
_C_ESCAPES = {
    "a": 0x07,
    "b": 0x08,
    "f": 0x0C,
    "n": 0x0A,
    "r": 0x0D,
    "t": 0x09,
    "v": 0x0B,
    '"': 0x22,
    "\\": 0x5C,
}


def unquote_git_path(path: str) -> str:
    """Undo git's C-quoting. Returns anything unquoted unchanged.

    Not `core.quotePath=false`, which is the obvious fix and is a worse one.
    That makes git emit the raw bytes, and a filename that is not valid UTF-8
    then raises `UnicodeDecodeError` out of `subprocess.run(text=True)` --
    measured, `git -c core.quotePath=false status --porcelain` on a name
    containing byte 0xff dies where the default emits an ASCII-safe
    `"apps/web/src/bad\\377.tsx"`. That would turn a misclassification into a
    hard failure of `make quick-ci-changed`. The flag would also not be enough
    on its own: `status --porcelain` quotes a name containing a space whether
    it is set or not.

    Decoding is via bytes rather than str because the escapes are bytes: a
    single non-ASCII character arrives as several octal escapes, and only the
    assembled sequence is decodable.
    """
    if len(path) < 2 or not path.startswith('"') or not path.endswith('"'):
        return path

    body = path[1:-1]
    out = bytearray()
    index = 0
    while index < len(body):
        char = body[index]
        if char != "\\":
            out.extend(char.encode("utf-8"))
            index += 1
            continue
        index += 1
        if index >= len(body):
            break
        escape = body[index]
        if escape in "01234567":
            out.append(int(body[index : index + 3], 8))
            index += 3
            continue
        out.append(_C_ESCAPES.get(escape, ord(escape)))
        index += 1
    # surrogateescape so a name that is not valid UTF-8 survives as a distinct
    # string rather than raising or collapsing into replacement characters.
    return out.decode("utf-8", errors="surrogateescape")


def _read_path_token(payload: str, index: int) -> tuple[str, int]:
    """Read one porcelain path starting at `index`, quoted or not."""
    if payload[index] == '"':
        cursor = index + 1
        while cursor < len(payload):
            if payload[cursor] == "\\":
                cursor += 2
                continue
            if payload[cursor] == '"':
                return payload[index : cursor + 1], cursor + 1
            cursor += 1
        return payload[index:], len(payload)
    separator = payload.find(" -> ", index)
    if separator == -1:
        return payload[index:], len(payload)
    return payload[index:separator], separator


def porcelain_destination(payload: str) -> str:
    """The path a porcelain entry is about -- for a rename, where it now is.

    Splitting the raw string on " -> " is not enough once quoting is in play,
    because a quoted name can contain that sequence. Reading the first token to
    its closing quote and looking for the separator after it cannot be fooled
    that way.
    """
    if not payload:
        return payload
    token, index = _read_path_token(payload, 0)
    if payload[index:].startswith(" -> "):
        token, _ = _read_path_token(payload, index + 4)
    return unquote_git_path(token)


def changed_files_from_range(base: str, head: str) -> list[str]:
    # D is included: a deletion changes a surface just as much as an edit.
    # Without it a deletion-only change classified as "none" and CI skipped
    # every scoped check, so removing a referenced asset or source file would
    # have gone green without the web or chat suites ever running.
    raw = run_git(["diff", "--name-only", "--diff-filter=ACMRTD", f"{base}...{head}"])
    return sorted(
        {unquote_git_path(line.strip()) for line in raw.splitlines() if line.strip()}
    )


def changed_files_from_worktree() -> list[str]:
    raw = run_git(["status", "--porcelain"])
    files: set[str] = set()
    for line in raw.splitlines():
        if len(line) < 4:
            continue
        payload = porcelain_destination(line[3:].strip())
        if payload:
            files.add(payload)
    return sorted(files)


def classify(files: list[str]) -> dict[str, bool]:
    runtime = False
    workflow = False
    web = False
    chat = False
    docs = False
    unknown = False

    for path in files:
        if matches_any(path, RUNTIME_PATTERNS):
            runtime = True
        if matches_any(path, WORKFLOW_PATTERNS):
            workflow = True
        if matches_any(path, WEB_PATTERNS):
            web = True
        if matches_any(path, CHAT_PATTERNS):
            chat = True
        if matches_any(path, DOC_PATTERNS):
            docs = True
        if not matches_any(path, ALL_PATTERNS):
            unknown = True

    # Unknown repo changes fall back to runtime checks for safety.
    if unknown:
        runtime = True

    return {
        "runtime": runtime,
        "workflow": workflow,
        "web": web,
        "chat": chat,
        "docs": docs,
        "unknown": unknown,
        "none": not files,
    }


def recommended_targets(flags: dict[str, bool]) -> list[str]:
    # Workflow assets define how every surface is verified and reviewed. Their
    # Verification Map row requires the complete gate, including the production
    # build and docs checks that the ordinary quick runtime loop omits.
    if flags.get("workflow", False):
        return ["ci"]

    ordered: list[str] = []

    if flags["runtime"]:
        ordered.extend(
            [
                "toolchain-doctor",
                "env-contract-check",
                "test-scripts",
                "quick-ci-web",
                "quick-ci-chat",
            ]
        )
    else:
        # Mirrors the script-tests gate in ci.yml. The guardrail suite asserts
        # on files across every surface, so it runs for any change rather than
        # for one surface. Without this the local pre-push loop skips the guard
        # for exactly the chat-only changes CI now runs it for.
        if not flags["none"]:
            ordered.append("test-scripts")
        if flags["web"]:
            ordered.append("quick-ci-web")
        if flags["chat"]:
            ordered.append("quick-ci-chat")

    if flags["docs"]:
        ordered.append("docs-check")

    deduped: list[str] = []
    seen: set[str] = set()
    for target in ordered:
        if target not in seen:
            seen.add(target)
            deduped.append(target)
    return deduped


def write_github_output(path: Path, flags: dict[str, bool], targets: list[str]) -> None:
    lines = [f"{key}={'true' if value else 'false'}" for key, value in flags.items()]
    lines.append(f"targets={' '.join(targets)}")
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as handle:
        for line in lines:
            handle.write(f"{line}\n")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base", help="Base Git ref for diff range")
    parser.add_argument("--head", help="Head Git ref for diff range")
    parser.add_argument("--print-targets", action="store_true", help="Print make targets to run")
    parser.add_argument(
        "--github-output",
        help="Write flags and targets to the provided GitHub output file path",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    base = args.base or os.getenv("CHANGED_BASE") or None
    head = args.head or os.getenv("CHANGED_HEAD") or "HEAD"

    try:
        if base:
            files = changed_files_from_range(base=base, head=head)
        else:
            files = changed_files_from_worktree()
    except RuntimeError as exc:
        print(exc, file=sys.stderr)
        return 1

    flags = classify(files)
    targets = recommended_targets(flags)

    if args.print_targets:
        print(" ".join(targets))

    if args.github_output:
        write_github_output(Path(args.github_output), flags, targets)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
