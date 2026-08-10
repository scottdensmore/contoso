#!/usr/bin/env python3
"""Keep AGENTS.md the single source of truth for agent instructions.

Assistants each read their own context file: Claude Code reads `CLAUDE.md`,
Gemini CLI reads `GEMINI.md`, and GitHub Copilot reads
`.github/copilot-instructions.md`. Each of those must stay a pointer to
`AGENTS.md`. Claude Code appends memories to `CLAUDE.md` when `#` is pressed, so
any drift from the canonical pointer means instructions were written to the
wrong file and must be moved into `AGENTS.md`.
"""

from __future__ import annotations

import argparse
import difflib
import os
import posixpath
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

AGENTS_FILENAME = "AGENTS.md"

# Pointer files created beside every AGENTS.md. Both assistants support nested
# context files, so each scoped runbook gets its own pointers.
SIBLING_POINTER_FILENAMES = ("CLAUDE.md", "GEMINI.md")

# Pointers that live at a fixed path instead of beside an AGENTS.md, mapped to
# the AGENTS.md they point at (both repo-relative).
FIXED_POINTERS = {
    ".github/copilot-instructions.md": AGENTS_FILENAME,
}

SKIP_DIRECTORIES = {
    ".git",
    ".next",
    ".venv",
    ".entire",
    "__pycache__",
    "build",
    "coverage",
    "dist",
    "node_modules",
    "out",
    "venv",
}

POINTER_TEMPLATE = """# {title}

`{agents_label}` is the single source of truth for agent instructions in this scope.
This file is a pointer only; it intentionally carries no instructions of its own.

Read and follow [{agents_label}]({agents_link}).

<!--
Do not add content to this file. Agent instructions belong in AGENTS.md, including
memories captured by pressing `#` in Claude Code. `make agent-docs-check` fails
when this pointer drifts.
-->
"""


class PointerSpec:
    """One pointer file and the AGENTS.md it must point at."""

    def __init__(self, pointer: Path, agents: Path, root: Path) -> None:
        self.pointer = pointer
        self.agents = agents
        self.root = root

    @property
    def name(self) -> str:
        return display_path(self.pointer, self.root)

    @property
    def agents_name(self) -> str:
        return display_path(self.agents, self.root)

    @property
    def agents_link(self) -> str:
        relative = os.path.relpath(self.agents, self.pointer.parent)
        link = Path(relative).as_posix()
        return link if link.startswith(".") else posixpath.join(".", link)

    def render(self) -> str:
        return POINTER_TEMPLATE.format(
            title=self.pointer.name,
            agents_link=self.agents_link,
            agents_label=AGENTS_FILENAME,
        )


def display_path(path: Path, root: Path) -> str:
    try:
        return str(path.relative_to(root))
    except ValueError:
        return str(path)


def normalize(text: str) -> list[str]:
    lines = [line.rstrip() for line in text.replace("\r\n", "\n").split("\n")]
    while lines and not lines[0]:
        lines.pop(0)
    while lines and not lines[-1]:
        lines.pop()
    return lines


def find_agent_directories(root: Path) -> list[Path]:
    directories: set[Path] = set()
    tracked = {AGENTS_FILENAME, *SIBLING_POINTER_FILENAMES}

    try:
        result = subprocess.run(
            [
                "git",
                "-C",
                str(root),
                "ls-files",
                "--cached",
                "--others",
                "--exclude-standard",
                "-z",
            ],
            check=False,
            capture_output=True,
            text=True,
        )
    except OSError:
        result = None

    if result is not None and result.returncode == 0:
        for relative in result.stdout.split("\0"):
            if not relative:
                continue
            path = Path(relative)
            if SKIP_DIRECTORIES.intersection(path.parts):
                continue
            if path.name in tracked:
                directories.add(root / path.parent)
        return sorted(directories)

    for current_dir, dir_names, file_names in os.walk(root):
        dir_names[:] = [name for name in dir_names if name not in SKIP_DIRECTORIES]
        if tracked.intersection(file_names):
            directories.add(Path(current_dir))

    return sorted(directories)


def collect_pointer_specs(root: Path) -> tuple[list[PointerSpec], list[str]]:
    """Return every expected pointer, plus errors for pointers with no AGENTS.md."""
    specs: list[PointerSpec] = []
    errors: list[str] = []

    for directory in find_agent_directories(root):
        agents = directory / AGENTS_FILENAME
        if agents.exists():
            specs.extend(
                PointerSpec(directory / filename, agents, root)
                for filename in SIBLING_POINTER_FILENAMES
            )
            continue

        for filename in SIBLING_POINTER_FILENAMES:
            pointer = directory / filename
            if pointer.exists():
                errors.append(
                    f"{display_path(pointer, root)} has no sibling {AGENTS_FILENAME}. "
                    f"Agent instructions live in {AGENTS_FILENAME}; add it or remove the pointer."
                )

    for pointer_relative, agents_relative in sorted(FIXED_POINTERS.items()):
        agents = root / agents_relative
        if agents.exists():
            specs.append(PointerSpec(root / pointer_relative, agents, root))

    return specs, errors


def added_lines(expected: list[str], actual: list[str]) -> list[str]:
    matcher = difflib.SequenceMatcher(a=expected, b=actual, autojunk=False)
    extras: list[str] = []
    for tag, _, _, actual_start, actual_end in matcher.get_opcodes():
        if tag in {"insert", "replace"}:
            extras.extend(line for line in actual[actual_start:actual_end] if line.strip())
    return extras


def check_pointer(spec: PointerSpec) -> list[str]:
    expected = normalize(spec.render())
    actual = normalize(spec.pointer.read_text(encoding="utf-8"))
    if actual == expected:
        return []

    errors = [
        f"{spec.name} is not the canonical pointer to {spec.agents_name}. "
        f"Move its instructions into {spec.agents_name}, then restore the pointer "
        f"(`make agent-docs-check FIX=1`)."
    ]

    extras = added_lines(expected, actual)
    if extras:
        errors.append(f"{spec.name} contains content that belongs in {spec.agents_name}:")
        errors.extend(f"    {line}" for line in extras)

    return errors


def check_agent_docs(root: Path = ROOT) -> list[str]:
    specs, errors = collect_pointer_specs(root)

    if not (root / AGENTS_FILENAME).exists():
        errors.append(f"Missing {AGENTS_FILENAME} at the repository root.")

    for spec in specs:
        if not spec.pointer.exists():
            errors.append(
                f"Missing {spec.name} next to {spec.agents_name}. "
                f"Run `make agent-docs-check FIX=1` to create the pointer."
            )
            continue
        errors.extend(check_pointer(spec))

    return errors


def fix_agent_docs(root: Path = ROOT) -> tuple[list[str], list[str]]:
    """Restore canonical pointers, returning (changed paths, rescued content lines)."""
    changed: list[str] = []
    rescued: list[str] = []
    specs, _ = collect_pointer_specs(root)

    for spec in specs:
        canonical = spec.render()
        if spec.pointer.exists():
            expected = normalize(canonical)
            actual = normalize(spec.pointer.read_text(encoding="utf-8"))
            if actual == expected:
                continue
            extras = added_lines(expected, actual)
            if extras:
                rescued.append(f"# From {spec.name}:")
                rescued.extend(extras)

        spec.pointer.parent.mkdir(parents=True, exist_ok=True)
        spec.pointer.write_text(canonical, encoding="utf-8")
        changed.append(spec.name)

    return changed, rescued


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--fix",
        action="store_true",
        help="Rewrite drifted pointer files and print the content to move into AGENTS.md",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    if args.fix:
        changed, rescued = fix_agent_docs()
        if rescued:
            print("Move the following content into the matching AGENTS.md:\n")
            for line in rescued:
                print(f"  {line}")
            print()
        if changed:
            for name in changed:
                print(f"Restored canonical pointer: {name}")
            if rescued:
                print(
                    "\nAction required: the content above was removed from the pointer(s). "
                    "Add it to the matching AGENTS.md and re-run `make agent-docs-check`."
                )
                return 1
            return 0
        print("Agent doc pointers already canonical.")
        return 0

    errors = check_agent_docs()
    if errors:
        print("Agent doc validation failed:")
        for error in errors:
            print(f"  - {error}")
        print(
            "\nAGENTS.md is the source of truth. CLAUDE.md, GEMINI.md, and "
            ".github/copilot-instructions.md must stay pointers to it, so memories "
            "captured with `#` in Claude Code have to be moved into AGENTS.md."
        )
        return 1

    print("Agent doc validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
