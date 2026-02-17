#!/usr/bin/env python3
"""Agent-focused local environment diagnostics."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

TOOLCHAIN_CHECK = ROOT / "scripts/check_toolchain.py"
ROOT_ENV = ROOT / ".env"
CHAT_ENV = ROOT / "services/chat/.env"

WEB_NODE_MODULES = ROOT / "apps/web/node_modules"
WEB_PRISMA_CLIENT = ROOT / "apps/web/node_modules/.prisma/client/index.js"
WEB_PRISMA_PACKAGE = ROOT / "apps/web/node_modules/@prisma/client/index.js"

ROOT_REQUIRED_VARS = ("DATABASE_URL", "NEXTAUTH_SECRET", "CHAT_ENDPOINT")
CHAT_REQUIRED_VARS = ("DATABASE_URL", "LLM_PROVIDER", "ALLOWED_ORIGINS")


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

    # Environment files and required keys
    if not ROOT_ENV.exists():
        failures.append(
            ("Missing root .env file.", "Run `cp .env.example .env` (or `make env-init`)."),
        )
        root_env = {}
    else:
        root_env = parse_env_file(ROOT_ENV)
        missing_root = [key for key in ROOT_REQUIRED_VARS if not root_env.get(key)]
        if missing_root:
            failures.append(
                (
                    f"Missing required keys in .env: {', '.join(missing_root)}",
                    "Populate .env using .env.example.",
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
        missing_chat = [key for key in CHAT_REQUIRED_VARS if not chat_env.get(key)]
        if missing_chat:
            failures.append(
                (
                    f"Missing required keys in services/chat/.env: {', '.join(missing_chat)}",
                    "Populate services/chat/.env using services/chat/.env.example.",
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
