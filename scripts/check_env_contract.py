#!/usr/bin/env python3
"""Validate environment contract drift against templates and docs."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
CONTRACT_PATH = ROOT / "config/env_contract.json"
KEY_PATTERN = re.compile(r"^[A-Z0-9_]+$")


def parse_env_template_keys(path: Path) -> set[str]:
    keys: set[str] = set()
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key = line.split("=", 1)[0].strip()
        if key.startswith("export "):
            key = key.replace("export ", "", 1).strip()
        if key:
            keys.add(key)
    return keys


def parse_doc_keys(block: str) -> list[str]:
    keys: list[str] = []
    for raw_line in block.splitlines():
        line = raw_line.strip()
        if not line:
            continue
        backtick_match = re.search(r"`([A-Z0-9_]+)`", line)
        if backtick_match:
            keys.append(backtick_match.group(1))
            continue
        if line.startswith(("-", "*")):
            maybe_key = line[1:].strip()
            if KEY_PATTERN.fullmatch(maybe_key):
                keys.append(maybe_key)
    return keys


def extract_doc_marker_block(content: str, marker: str) -> str:
    start_token = f"<!-- BEGIN:{marker} -->"
    end_token = f"<!-- END:{marker} -->"
    start = content.find(start_token)
    if start < 0:
        raise ValueError(f"Missing start marker {start_token}")
    end = content.find(end_token, start + len(start_token))
    if end < 0:
        raise ValueError(f"Missing end marker {end_token}")
    return content[start + len(start_token) : end].strip()


def load_contract() -> dict[str, Any]:
    try:
        payload = json.loads(CONTRACT_PATH.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise RuntimeError(f"Missing contract file: {CONTRACT_PATH.relative_to(ROOT)}") from exc
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Contract file is not valid JSON: {exc}") from exc

    if not isinstance(payload, dict):
        raise RuntimeError("Contract root must be a JSON object.")
    return payload


def validate_contract_shape(contract: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    docs_path = contract.get("docs_path")
    environments = contract.get("environments")

    if not isinstance(docs_path, str) or not docs_path.strip():
        errors.append("`docs_path` must be a non-empty string.")
    if not isinstance(environments, list) or not environments:
        errors.append("`environments` must be a non-empty list.")
        return errors

    seen_names: set[str] = set()
    seen_markers: set[str] = set()
    for index, entry in enumerate(environments):
        label = f"environments[{index}]"
        if not isinstance(entry, dict):
            errors.append(f"{label} must be an object.")
            continue

        name = entry.get("name")
        template_path = entry.get("template_path")
        docs_marker = entry.get("docs_marker")
        required_keys = entry.get("required_keys")

        if not isinstance(name, str) or not name:
            errors.append(f"{label}.name must be a non-empty string.")
        elif name in seen_names:
            errors.append(f"{label}.name duplicates '{name}'.")
        else:
            seen_names.add(name)

        if not isinstance(template_path, str) or not template_path:
            errors.append(f"{label}.template_path must be a non-empty string.")

        if not isinstance(docs_marker, str) or not docs_marker:
            errors.append(f"{label}.docs_marker must be a non-empty string.")
        elif docs_marker in seen_markers:
            errors.append(f"{label}.docs_marker duplicates '{docs_marker}'.")
        else:
            seen_markers.add(docs_marker)

        if not isinstance(required_keys, list) or not required_keys:
            errors.append(f"{label}.required_keys must be a non-empty list.")
            continue

        string_keys = [key for key in required_keys if isinstance(key, str)]
        dupes = {key for key in string_keys if string_keys.count(key) > 1}
        if dupes:
            errors.append(f"{label}.required_keys contains duplicates: {', '.join(sorted(dupes))}")
        for key in required_keys:
            if not isinstance(key, str) or not KEY_PATTERN.fullmatch(key):
                errors.append(f"{label}.required_keys has invalid key '{key}'.")

    return errors


def check_drift(contract: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    docs_path = ROOT / contract["docs_path"]
    try:
        docs_content = docs_path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return [f"Missing docs file: {contract['docs_path']}"]

    for entry in contract["environments"]:
        name = entry["name"]
        template_path = ROOT / entry["template_path"]
        required_keys = entry["required_keys"]
        docs_marker = entry["docs_marker"]

        if not template_path.exists():
            errors.append(f"[{name}] Missing template: {entry['template_path']}")
            continue

        template_keys = parse_env_template_keys(template_path)
        missing_template_keys = [key for key in required_keys if key not in template_keys]
        if missing_template_keys:
            errors.append(
                f"[{name}] Template {entry['template_path']} is missing required keys: "
                + ", ".join(missing_template_keys)
            )

        try:
            doc_block = extract_doc_marker_block(docs_content, docs_marker)
        except ValueError as exc:
            errors.append(f"[{name}] {exc}")
            continue

        doc_keys = parse_doc_keys(doc_block)
        if doc_keys != required_keys:
            missing_doc_keys = [key for key in required_keys if key not in doc_keys]
            extra_doc_keys = [key for key in doc_keys if key not in required_keys]
            if missing_doc_keys:
                errors.append(
                    f"[{name}] Docs marker {docs_marker} missing keys: "
                    + ", ".join(missing_doc_keys)
                )
            if extra_doc_keys:
                errors.append(
                    f"[{name}] Docs marker {docs_marker} has extra keys: "
                    + ", ".join(extra_doc_keys)
                )
            if not missing_doc_keys and not extra_doc_keys:
                errors.append(
                    f"[{name}] Docs marker {docs_marker} keys are out of order. "
                    "Match contract order exactly."
                )

    return errors


def main() -> int:
    try:
        contract = load_contract()
    except RuntimeError as exc:
        print(f"Env contract check failed: {exc}")
        return 1

    errors = validate_contract_shape(contract)
    if errors:
        print("Env contract check failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    drift_errors = check_drift(contract)
    if drift_errors:
        print("Env contract drift detected:")
        for error in drift_errors:
            print(f"- {error}")
        return 1

    print("Env contract check passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
