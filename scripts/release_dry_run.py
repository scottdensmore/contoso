#!/usr/bin/env python3
"""Validate release guardrails without publishing a release."""

from __future__ import annotations

import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TAG_PATTERN = re.compile(r"^v\d+\.\d+\.\d+(?:[-+][0-9A-Za-z][0-9A-Za-z.-]*)?$")

REQUIRED_FILES: tuple[tuple[str, str], ...] = (
    (".github/CODEOWNERS", "ownership rules"),
    (".github/PULL_REQUEST_TEMPLATE.md", "pull request verification template"),
    (".github/ISSUE_TEMPLATE/bug_report.yml", "bug issue template"),
    (".github/ISSUE_TEMPLATE/feature_request.yml", "feature issue template"),
    (".github/ISSUE_TEMPLATE/config.yml", "issue template config"),
    (".github/workflows/release.yml", "release workflow"),
    ("docs/RELEASE.md", "release runbook"),
)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--tag",
        default="",
        help="Release tag to validate (example: v1.2.3)",
    )
    return parser.parse_args()


def validate_tag(tag: str) -> list[str]:
    if not tag:
        return []
    if TAG_PATTERN.fullmatch(tag):
        return []
    return [f"Release tag '{tag}' is invalid. Expected format: vMAJOR.MINOR.PATCH (optional prerelease/build suffix)."]


def validate_required_files() -> list[str]:
    errors: list[str] = []
    for relative_path, label in REQUIRED_FILES:
        path = ROOT / relative_path
        if not path.exists():
            errors.append(f"Missing {label}: {relative_path}")
    return errors


def main() -> int:
    args = parse_args()
    errors = [*validate_tag(args.tag.strip()), *validate_required_files()]

    if errors:
        print("Release dry-run preflight failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    if args.tag:
        print(f"Release tag format is valid: {args.tag}")
    else:
        print("No release tag provided; skipped tag format validation.")
    print("Release dry-run preflight passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
