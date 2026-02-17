#!/usr/bin/env python3
"""Verify required local runtime toolchain versions."""

from __future__ import annotations

import os
import re
import subprocess
import sys

EXPECTED_NODE_MAJOR = 22
EXPECTED_PYTHON_MAJOR_MINOR = (3, 11)


def run(cmd: list[str]) -> str:
    completed = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if completed.returncode != 0:
        stderr = completed.stderr.strip()
        stdout = completed.stdout.strip()
        detail = stderr or stdout or f"exit code {completed.returncode}"
        raise RuntimeError(f"{' '.join(cmd)} failed: {detail}")
    return completed.stdout.strip() or completed.stderr.strip()


def parse_node_major(version_text: str) -> int:
    match = re.match(r"^v?(\d+)\.", version_text.strip())
    if not match:
        raise ValueError(f"Unable to parse Node version from '{version_text}'")
    return int(match.group(1))


def parse_python_major_minor(version_text: str) -> tuple[int, int]:
    match = re.match(r"^Python (\d+)\.(\d+)\.", version_text.strip())
    if not match:
        raise ValueError(f"Unable to parse Python version from '{version_text}'")
    return int(match.group(1)), int(match.group(2))


def main() -> int:
    errors: list[str] = []
    allow_non_mise = os.getenv("TOOLCHAIN_CHECK_ALLOW_NON_MISE") == "1"

    try:
        node_version = run(["node", "--version"])
        node_major = parse_node_major(node_version)
        if node_major != EXPECTED_NODE_MAJOR:
            errors.append(f"Expected Node {EXPECTED_NODE_MAJOR}.x, got {node_version}")
    except Exception as exc:  # noqa: BLE001
        errors.append(str(exc))
        node_version = "unknown"

    python_source = "mise python@3.11"
    try:
        python_version = run(["mise", "exec", "python@3.11", "--", "python", "--version"])
    except Exception as exc:  # noqa: BLE001
        if not allow_non_mise:
            errors.append(str(exc))
            python_version = "unknown"
        else:
            try:
                python_version = run([sys.executable, "--version"])
                python_source = f"interpreter ({sys.executable})"
            except Exception as fallback_exc:  # noqa: BLE001
                errors.append(str(fallback_exc))
                python_version = "unknown"

    if python_version != "unknown":
        try:
            python_major_minor = parse_python_major_minor(python_version)
            if python_major_minor != EXPECTED_PYTHON_MAJOR_MINOR:
                errors.append(
                    "Expected Python "
                    f"{EXPECTED_PYTHON_MAJOR_MINOR[0]}.{EXPECTED_PYTHON_MAJOR_MINOR[1]}.x, "
                    f"got {python_version}"
                )
        except Exception as exc:  # noqa: BLE001
            errors.append(str(exc))

    if errors:
        print("Toolchain check failed:")
        for err in errors:
            print(f"- {err}")
        print("Run `mise install` to install the pinned toolchain from mise.toml.")
        return 1

    print(
        "Toolchain check passed: "
        f"Node {node_version}, Python {python_version} (via {python_source})."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
