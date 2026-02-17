#!/usr/bin/env python3
"""Agent-focused local environment diagnostics."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent

TOOLCHAIN_CHECK = ROOT / "scripts/check_toolchain.py"
ENV_CONTRACT = ROOT / "config/env_contract.json"
ROOT_ENV = ROOT / ".env"
CHAT_ENV = ROOT / "services/chat/.env"

WEB_NODE_MODULES = ROOT / "apps/web/node_modules"
WEB_PRISMA_CLIENT = ROOT / "apps/web/node_modules/.prisma/client/index.js"
WEB_PRISMA_PACKAGE = ROOT / "apps/web/node_modules/@prisma/client/index.js"


def run(cmd: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, capture_output=True, text=True, cwd=ROOT, check=False)


def parse_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key:
            values[key] = value
    return values


def normalize_output(result: subprocess.CompletedProcess[str]) -> str:
    output = (result.stderr or result.stdout).strip()
    return output if output else f"exit code {result.returncode}"


def load_required_vars_from_contract() -> tuple[tuple[str, ...], tuple[str, ...]]:
    try:
        payload: Any = json.loads(ENV_CONTRACT.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise RuntimeError(f"Missing {ENV_CONTRACT.relative_to(ROOT)}.") from exc
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Invalid JSON in {ENV_CONTRACT.relative_to(ROOT)}: {exc}.") from exc

    environments = payload.get("environments")
    if not isinstance(environments, list):
        raise RuntimeError("`environments` must be a list in env contract.")

    required_by_name: dict[str, tuple[str, ...]] = {}
    for entry in environments:
        if not isinstance(entry, dict):
            continue
        name = entry.get("name")
        required_keys = entry.get("required_keys")
        if (
            isinstance(name, str)
            and isinstance(required_keys, list)
            and all(isinstance(key, str) for key in required_keys)
        ):
            required_by_name[name] = tuple(required_keys)

    missing_contract_entries = [name for name in ("root", "chat") if name not in required_by_name]
    if missing_contract_entries:
        joined = ", ".join(missing_contract_entries)
        raise RuntimeError(f"Missing env contract entries for: {joined}.")

    return required_by_name["root"], required_by_name["chat"]


def main() -> int:
    passes: list[str] = []
    warnings: list[str] = []
    failures: list[tuple[str, str]] = []

    # Runtime parity
    toolchain = run([sys.executable, str(TOOLCHAIN_CHECK)])
    if toolchain.returncode == 0:
        passes.append("Pinned runtime toolchain detected.")
    else:
        failures.append(
            ("Toolchain check failed.", "Run `mise install` and re-run `make toolchain-doctor`."),
        )

    root_required_vars: tuple[str, ...] = ()
    chat_required_vars: tuple[str, ...] = ()
    try:
        root_required_vars, chat_required_vars = load_required_vars_from_contract()
        passes.append("Env contract loaded from config/env_contract.json.")
    except RuntimeError as exc:
        failures.append(
            (
                f"Env contract load failed: {exc}",
                "Run `make env-contract-check` and fix config/env_contract.json.",
            ),
        )

    # Environment files and required keys
    if not ROOT_ENV.exists():
        failures.append(
            ("Missing root .env file.", "Run `cp .env.example .env` (or `make env-init`)."),
        )
        root_env = {}
    else:
        root_env = parse_env_file(ROOT_ENV)
        missing_root = [key for key in root_required_vars if not root_env.get(key)]
        if not root_required_vars:
            warnings.append("Skipped root required-key check because env contract failed to load.")
        elif missing_root:
            failures.append(
                (
                    f"Missing required keys in .env: {', '.join(missing_root)}",
                    "Populate .env using .env.example and docs/ENV_CONTRACT.md.",
                ),
            )
        else:
            passes.append("Root .env contains required web keys.")

        if root_env.get("NEXTAUTH_SECRET") in {"replace-with-random-secret", "your-secret"}:
            warnings.append("NEXTAUTH_SECRET appears to be a template value.")

    if not CHAT_ENV.exists():
        failures.append(
            (
                "Missing services/chat/.env file.",
                "Run `cp services/chat/.env.example services/chat/.env` (or `make env-init`).",
            ),
        )
        chat_env = {}
    else:
        chat_env = parse_env_file(CHAT_ENV)
        missing_chat = [key for key in chat_required_vars if not chat_env.get(key)]
        if not chat_required_vars:
            warnings.append("Skipped chat required-key check because env contract failed to load.")
        elif missing_chat:
            failures.append(
                (
                    f"Missing required keys in services/chat/.env: {', '.join(missing_chat)}",
                    "Populate services/chat/.env using services/chat/.env.example and docs/ENV_CONTRACT.md.",
                ),
            )
        else:
            passes.append("Chat .env contains required service keys.")

    # Web dependencies and generated Prisma client
    if WEB_NODE_MODULES.exists():
        passes.append("Web dependencies are installed.")
    else:
        failures.append(("apps/web/node_modules is missing.", "Run `make setup`."))

    if WEB_PRISMA_CLIENT.exists() and WEB_PRISMA_PACKAGE.exists():
        passes.append("Web Prisma client is generated.")
    else:
        failures.append(("Web Prisma client is missing.", "Run `make prisma-generate`."))

    # Chat Python dependencies and generated Prisma client
    deps_check = run([sys.executable, "-c", "import fastapi, pytest"])
    if deps_check.returncode == 0:
        passes.append("Chat Python dependencies are available.")
    else:
        failures.append(("Chat Python dependencies are incomplete.", "Run `make setup-chat`."))

    chat_prisma = run([sys.executable, "-c", "from prisma import Prisma; print(Prisma.__name__)"])
    if chat_prisma.returncode == 0:
        passes.append("Chat Prisma client is generated.")
    else:
        output = normalize_output(chat_prisma)
        if "No module named 'prisma'" in output:
            failures.append(("Python prisma package is missing.", "Run `make setup-chat`."))
        elif "Client hasn't been generated yet" in output:
            failures.append(
                ("Chat Prisma client has not been generated.", "Run `make prisma-generate-chat`."),
            )
        else:
            failures.append(
                (
                    f"Unable to validate chat Prisma client: {output}",
                    "Run `make prisma-generate-chat` and retry.",
                ),
            )

    for line in passes:
        print(f"[PASS] {line}")
    for line in warnings:
        print(f"[WARN] {line}")
    for message, _ in failures:
        print(f"[FAIL] {message}")

    if failures:
        print("\nSuggested fixes:")
        seen: set[str] = set()
        for _, fix in failures:
            if fix not in seen:
                seen.add(fix)
                print(f"- {fix}")
        return 1

    print("\nAgent doctor passed: local environment is ready.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
