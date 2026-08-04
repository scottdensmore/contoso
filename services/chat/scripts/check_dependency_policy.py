#!/usr/bin/env python3
"""Validate chat dependency policy for reproducible installs.

Policy:
- `constraints.txt` must pin packages with exact `==` versions.
- Every package referenced in requirement manifests must exist in `constraints.txt`.
- Every pin in `constraints.txt` must be required by some requirement manifest.
- Requirement manifests must use bare package names only.

Versions live in exactly one place. A package pinned in both a requirement
manifest and `constraints.txt` gives Dependabot two places to edit; it updates
one, and `pip install -c` then fails with ResolutionImpossible before any
check in this repo gets a chance to run.

The pins and the manifests are kept in exact correspondence, in both
directions. A pin nothing requires is inert: it constrains a version that may
not be installed at all, while looking like the dependency is managed. That is
how `httpx` disappeared — it was pinned here but declared in no manifest,
arriving only as a transitive dependency of `prisma-client-py`. Removing that
package silently dropped `httpx`, and the failure surfaced later and elsewhere,
as `starlette` failing at test collection over `httpx2`.
"""

from __future__ import annotations

import re
from pathlib import Path

REQUIREMENT_FILES = (
    Path("src/api/requirements-core.txt"),
    Path("src/api/requirements-local.txt"),
    Path("tests/requirements-test.txt"),
    Path("requirements-dev.txt"),
)
CONSTRAINTS_FILE = Path("constraints.txt")

REQ_LINE_RE = re.compile(r"^([A-Za-z0-9_.-]+)(?:\[[^\]]+\])?\s*([<>=!~]{1,2})?\s*(.*)$")


def normalize_package_name(name: str) -> str:
    return name.strip().lower().replace("_", "-")


def parse_line(raw_line: str, path: Path, line_no: int) -> tuple[str, str | None, str | None] | None:
    line = raw_line.strip()
    if not line or line.startswith("#"):
        return None

    if line.startswith(("-", "--")):
        raise ValueError(f"{path}:{line_no}: unsupported requirements directive '{line}'")

    # Keep requirements files simple and explicit. Inline comments are allowed.
    line = line.split("#", 1)[0].strip()
    if not line:
        return None

    # Drop environment markers for the pinning checks.
    line = line.split(";", 1)[0].strip()
    if not line:
        return None

    match = REQ_LINE_RE.match(line)
    if not match:
        raise ValueError(f"{path}:{line_no}: cannot parse requirement '{raw_line.rstrip()}'")

    name, operator, version = match.groups()
    return normalize_package_name(name), operator, (version.strip() if version else None)


def load_constraints(path: Path) -> tuple[dict[str, str], list[str]]:
    pins: dict[str, str] = {}
    errors: list[str] = []

    for idx, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
        parsed = parse_line(raw, path, idx)
        if parsed is None:
            continue

        name, operator, version = parsed
        if operator != "==" or not version:
            errors.append(f"{path}:{idx}: constraints must use exact '==' pins (got '{raw.strip()}')")
            continue

        if name in pins:
            errors.append(f"{path}:{idx}: duplicate constraint for '{name}'")
            continue
        pins[name] = version

    return pins, errors


def check_unused_constraints(
    requirement_files: tuple[Path, ...], constraints: dict[str, str]
) -> list[str]:
    """Flag pins that no manifest requires.

    Every pin here corresponds to a directly declared package; there are no
    transitive-only pins to allow for. A pin without a manifest entry means
    either the manifest entry was dropped and the pin left behind, or the pin
    was added speculatively — both make the pin inert.
    """
    required: set[str] = set()
    for req_file in requirement_files:
        for idx, raw in enumerate(req_file.read_text(encoding="utf-8").splitlines(), start=1):
            parsed = parse_line(raw, req_file, idx)
            if parsed is not None:
                required.add(parsed[0])

    return [
        f"{CONSTRAINTS_FILE}: '{name}' is pinned but required by no manifest; "
        f"add it to a requirements file or drop the pin"
        for name in sorted(set(constraints) - required)
    ]


def check_requirements(requirement_files: tuple[Path, ...], constraints: dict[str, str]) -> list[str]:
    errors: list[str] = []

    for req_file in requirement_files:
        for idx, raw in enumerate(req_file.read_text(encoding="utf-8").splitlines(), start=1):
            parsed = parse_line(raw, req_file, idx)
            if parsed is None:
                continue

            name, operator, version = parsed
            if operator is not None:
                errors.append(
                    f"{req_file}:{idx}: requirement manifests must use bare package names; "
                    f"pin the version in {CONSTRAINTS_FILE} instead (got '{raw.strip()}')"
                )
                continue

            if name not in constraints:
                errors.append(
                    f"{req_file}:{idx}: package '{name}' must be pinned in {CONSTRAINTS_FILE}"
                )

    return errors


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    original_cwd = Path.cwd()
    try:
        # Make paths deterministic regardless of call site.
        if original_cwd != root:
            # script is invoked from service directory via Makefile, but keep this robust.
            import os

            os.chdir(root)

        constraints, errors = load_constraints(CONSTRAINTS_FILE)
        errors.extend(check_requirements(REQUIREMENT_FILES, constraints))
        errors.extend(check_unused_constraints(REQUIREMENT_FILES, constraints))

        if errors:
            print("Dependency policy check failed:")
            for err in errors:
                print(f"- {err}")
            return 1

        print(
            f"Dependency policy check passed: {len(constraints)} pinned packages validated "
            f"across {len(REQUIREMENT_FILES)} requirement files."
        )
        return 0
    finally:
        if Path.cwd() != original_cwd:
            import os

            os.chdir(original_cwd)


if __name__ == "__main__":
    raise SystemExit(main())
