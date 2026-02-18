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

RUNTIME_PATTERNS = (
    ".github/workflows/ci.yml",
    ".github/workflows/release.yml",
    ".github/CODEOWNERS",
    ".github/PULL_REQUEST_TEMPLATE.md",
    ".github/ISSUE_TEMPLATE/**",
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
    "tests/scripts/**",
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
    "docker-compose.yml",
    "Dockerfile.migrate",
)

DOC_PATTERNS = (
    "docs/**",
    "README.md",
    "AGENTS.md",
    "CONTRIBUTING.md",
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
        return path.startswith(pattern[:-3])
    return Path(path).match(pattern)


def matches_any(path: str, patterns: Iterable[str]) -> bool:
    return any(path_matches(pattern, path) for pattern in patterns)


def changed_files_from_range(base: str, head: str) -> list[str]:
    raw = run_git(["diff", "--name-only", "--diff-filter=ACMRT", f"{base}...{head}"])
    return sorted({line.strip() for line in raw.splitlines() if line.strip()})


def changed_files_from_worktree() -> list[str]:
    raw = run_git(["status", "--porcelain"])
    files: set[str] = set()
    for line in raw.splitlines():
        if len(line) < 4:
            continue
        payload = line[3:].strip()
        if " -> " in payload:
            payload = payload.split(" -> ", 1)[1].strip()
        if payload:
            files.add(payload)
    return sorted(files)


def classify(files: list[str]) -> dict[str, bool]:
    runtime = False
    web = False
    chat = False
    docs = False
    unknown = False

    for path in files:
        if matches_any(path, RUNTIME_PATTERNS):
            runtime = True
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
        "web": web,
        "chat": chat,
        "docs": docs,
        "unknown": unknown,
        "none": not files,
    }


def recommended_targets(flags: dict[str, bool]) -> list[str]:
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
