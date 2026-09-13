#!/usr/bin/env python3
"""Validate chat dependency policy for reproducible installs.

Policy:
- `constraints.txt` must pin packages with exact `==` versions.
- Every package referenced in requirement manifests must exist in `constraints.txt`.
- Every pin in `constraints.txt` must be required by some requirement manifest.
- Requirement manifests must use bare package names only.
- Every imported third-party package in the service source must be declared in
  a requirement manifest.

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

Transitive dependencies:
- Issue #312: `google-cloud-storage` is an unpinned transitive dependency that
  `google-cloud-aiplatform` announced it will drop in a future release.
  `google-cloud-aiplatform==2.1.0` in `constraints.txt` installs
  `google-cloud-storage` >= 3.0.0 (currently 3.1.0), satisfying 3.x
  compatibility. Future upgrades should verify this transitive dependency
  remains satisfied, or declare and pin it directly if direct storage access
  is introduced.
"""

from __future__ import annotations

import ast
import re
import sys
from pathlib import Path

REQUIREMENT_FILES = (
    Path("src/api/requirements-core.txt"),
    Path("src/api/requirements-local.txt"),
    Path("tests/requirements-test.txt"),
    Path("requirements-dev.txt"),
)
CONSTRAINTS_FILE = Path("constraints.txt")
SERVICE_SOURCE_DIR = Path("src/api")

REQ_LINE_RE = re.compile(r"^([A-Za-z0-9_.-]+)(?:\[[^\]]+\])?\s*([<>=!~]{1,2})?\s*(.*)$")

IMPORT_TO_DISTRIBUTION: dict[str, str] = {
    "asyncpg": "asyncpg",
    "chromadb": "chromadb",
    "dotenv": "python-dotenv",
    "fastapi": "fastapi",
    "google": "google-cloud-aiplatform",
    "jsonlines": "jsonlines",
    "litellm": "litellm",
    "opentelemetry": "opentelemetry-api",
    "pandas": "pandas",
    "prompty": "prompty",
    "pydantic": "pydantic",
    "pytest": "pytest",
    "requests": "requests",
    "sentence_transformers": "sentence-transformers",
    "starlette": "starlette",
    "tabulate": "tabulate",
    "torch": "torch",
    "uvicorn": "uvicorn",
    "vertexai": "google-cloud-aiplatform",
    "yaml": "pyyaml",
}

KNOWN_FIRST_PARTY: frozenset[str] = frozenset({
    "chat_request",
    "contoso_chat",
    "db",
    "evaluate",
    "evaluators",
    "local_provider_health",
    "main",
    "models",
    "search_service",
    "telemetry",
    "tracing",
})

STDLIB_MODULE_NAMES: frozenset[str] = getattr(
    sys,
    "stdlib_module_names",
    frozenset({
        "__future__", "_thread", "abc", "argparse", "array", "ast", "asyncio",
        "atexit", "base64", "builtins", "calendar", "collections", "contextlib",
        "copy", "csv", "dataclasses", "datetime", "decimal", "difflib", "dis",
        "email", "enum", "errno", "fnmatch", "functools", "gc", "hashlib",
        "http", "importlib", "inspect", "io", "itertools", "json", "logging",
        "math", "mimetypes", "multiprocessing", "operator", "os", "pathlib",
        "pickle", "platform", "pprint", "queue", "random", "re", "shutil",
        "signal", "socket", "sqlite3", "ssl", "stat", "string", "subprocess",
        "sys", "tempfile", "textwrap", "threading", "time", "traceback",
        "types", "typing", "unittest", "urllib", "uuid", "warnings", "weakref",
        "xml", "zipfile", "zoneinfo",
    }),
)


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


def _is_test_file(path: Path) -> bool:
    if path.name.startswith("test_") or path.name.endswith("_test.py"):
        return True
    parts = set(path.parts)
    return "tests" in parts or "test" in parts


def _find_first_party_modules(service_source_dir: Path) -> set[str]:
    first_party = set(KNOWN_FIRST_PARTY)
    if service_source_dir.is_dir():
        for item in service_source_dir.iterdir():
            if item.is_dir() and not item.name.startswith("."):
                first_party.add(item.name)
            elif item.suffix == ".py":
                first_party.add(item.stem)
        for py_path in service_source_dir.rglob("*.py"):
            first_party.add(py_path.stem)
            for parent in py_path.relative_to(service_source_dir).parents:
                if parent.name:
                    first_party.add(parent.name)
    elif service_source_dir.is_file() and service_source_dir.suffix == ".py":
        first_party.add(service_source_dir.stem)
    return first_party


def map_import_to_distribution(module: str) -> str:
    parts = module.split(".")
    for i in range(len(parts), 0, -1):
        prefix = ".".join(parts[:i])
        if prefix in IMPORT_TO_DISTRIBUTION:
            return IMPORT_TO_DISTRIBUTION[prefix]
    top_level = parts[0]
    return normalize_package_name(top_level)


def check_service_imports_are_declared(
    service_source_dir: Path | str,
    requirement_files: tuple[Path, ...] | list[Path],
    constraints: dict[str, str] | None = None,
) -> list[str]:
    """Flag third-party imports in service code that have no manifest entry.

    Every third-party module imported by service source files must map to a
    package explicitly declared in requirement manifests. Transitive-only
    dependencies that are imported directly will be caught here.
    """
    source_dir = Path(service_source_dir)
    if not source_dir.exists():
        return [f"{source_dir}: service source directory does not exist"]

    declared_packages: set[str] = set()
    for req_file in requirement_files:
        path = Path(req_file)
        if not path.is_file():
            continue
        for idx, raw in enumerate(path.read_text(encoding="utf-8").splitlines(), start=1):
            parsed = parse_line(raw, path, idx)
            if parsed is not None:
                declared_packages.add(parsed[0])

    first_party = _find_first_party_modules(source_dir)
    stdlib = STDLIB_MODULE_NAMES

    if source_dir.is_file():
        py_files = [source_dir]
    else:
        py_files = [p for p in sorted(source_dir.rglob("*.py")) if not _is_test_file(p)]

    errors: list[str] = []
    for py_file in py_files:
        try:
            content = py_file.read_text(encoding="utf-8")
        except Exception as exc:
            errors.append(f"{py_file}: cannot read file: {exc}")
            continue

        try:
            tree = ast.parse(content, filename=str(py_file))
        except SyntaxError as exc:
            errors.append(f"{py_file}:{exc.lineno}: syntax error: {exc}")
            continue

        try:
            display_path = py_file.relative_to(Path.cwd())
        except ValueError:
            display_path = py_file

        seen_in_file: set[tuple[int, str]] = set()

        for node in ast.walk(tree):
            imported: list[tuple[str, int]] = []
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imported.append((alias.name, node.lineno))
            elif isinstance(node, ast.ImportFrom):
                if node.level > 0 or not node.module:
                    continue
                imported.append((node.module, node.lineno))

            for module_name, lineno in imported:
                top_level = module_name.split(".")[0]
                if top_level in stdlib or top_level in first_party:
                    continue

                dist = map_import_to_distribution(module_name)
                if dist not in declared_packages:
                    if (lineno, dist) not in seen_in_file:
                        seen_in_file.add((lineno, dist))
                        errors.append(
                            f"{display_path}:{lineno}: undeclared dependency '{dist}' "
                            f"(imported as '{module_name}'); add it to a requirements manifest"
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
        errors.extend(
            check_service_imports_are_declared(
                SERVICE_SOURCE_DIR, REQUIREMENT_FILES, constraints
            )
        )

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
