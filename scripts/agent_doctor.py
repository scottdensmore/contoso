#!/usr/bin/env python3
"""Agent-focused local environment diagnostics."""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent

COMPOSE_FILE = ROOT / "docker-compose.yml"
TOOLCHAIN_CHECK = ROOT / "scripts/check_toolchain.py"
VENV_DIR = ROOT / ".venv"
VENV_PYTHON = VENV_DIR / "bin/python"
ENV_CONTRACT = ROOT / "config/env_contract.json"
ROOT_ENV = ROOT / ".env"
CHAT_ENV = ROOT / "services/chat/.env"

WEB_NODE_MODULES = ROOT / "apps/web/node_modules"
WEB_PRISMA_CLIENT = ROOT / "apps/web/node_modules/.prisma/client/index.js"
WEB_PRISMA_PACKAGE = ROOT / "apps/web/node_modules/@prisma/client/index.js"


def run(cmd: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, capture_output=True, text=True, cwd=ROOT, check=False)


def published_ports() -> dict[str, int]:
    """`{service: host_port}` from docker-compose.yml, or `{}` if unreadable."""
    if not COMPOSE_FILE.exists():
        return {}
    lines = COMPOSE_FILE.read_text(encoding="utf-8").splitlines()
    starts = [i for i, line in enumerate(lines) if re.fullmatch(r"  (\w[\w-]*):\s*", line)]
    ports: dict[str, int] = {}
    for position, start in enumerate(starts):
        name = lines[start].strip().rstrip(":")
        end = starts[position + 1] if position + 1 < len(starts) else len(lines)
        for line in lines[start:end]:
            match = re.fullmatch(r'\s*-\s*"(\d+):(\d+)"\s*', line)
            if match:
                ports[name] = int(match.group(1))
                break
    return ports


# The env keys that name a host port, and the compose service each has to agree
# with. `.env` is not tracked, so moving a published port in the repository
# leaves every existing one behind — and each of these fails quietly rather
# than loudly when it is stale: CHAT_ENDPOINT posts the request and its API key
# to whatever now owns the old port, and NEXTAUTH_URL sends the browser off the
# served port on sign-out. `docker-compose.yml` carries the detail. See #245.
PORT_BEARING_KEYS = {
    "NEXTAUTH_URL": "web",
    "CHAT_ENDPOINT": "chat",
    # chat's key, but it names the origin the browser is on, so it follows web.
    "ALLOWED_ORIGINS": "web",
    "DATABASE_URL": "db",
}


def ports_in(value: str) -> list[int]:
    """Every host port a value names, across a comma-separated list.

    `urlsplit` rather than a regex for the port: a DSN's password may start
    with digits (`postgres:5up3r@localhost:55432`), and a non-greedy pattern
    stops at those and reports a port that appears nowhere.
    """
    found = []
    for element in value.split(","):
        element = element.strip()
        if not element:
            continue
        try:
            port = urlsplit(element).port
        except ValueError:
            continue
        if port is not None:
            found.append(port)
    return found


def stale_port_keys(env: dict[str, str], ports: dict[str, int]) -> list[str]:
    """Keys in `env` whose host port disagrees with what compose publishes.

    A value naming several origins is stale only when *none* of them is the
    published port, so adding a second origin does not start warning on the
    order it was written in.
    """
    stale = []
    for key, service in PORT_BEARING_KEYS.items():
        value = env.get(key)
        if not value:
            continue
        expected = ports.get(service)
        if expected is None:
            continue
        found = ports_in(value)
        if found and expected not in found:
            named = ", ".join(f":{port}" for port in found)
            stale.append(f"{key} names {named}, compose publishes :{expected}")
    return stale


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

    # Project virtualenv: every Python command must run from .venv
    if not VENV_PYTHON.exists():
        failures.append(
            (
                "Project virtualenv is missing (.venv).",
                "Run `make venv` (or `make bootstrap`).",
            ),
        )
    elif Path(sys.executable).resolve() != VENV_PYTHON.resolve():
        failures.append(
            (
                f"Running outside the project virtualenv: {sys.executable}",
                "Run agent-doctor via `make agent-doctor` so it uses .venv/bin/python.",
            ),
        )
    elif sys.prefix == sys.base_prefix:
        failures.append(
            (
                ".venv/bin/python is not an isolated virtualenv.",
                "Delete .venv and run `make venv`.",
            ),
        )
    else:
        passes.append("Running inside the project virtualenv (.venv).")

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

        stale = stale_port_keys(root_env, published_ports())
        if stale:
            warnings.append(
                ".env host ports disagree with docker-compose.yml — "
                + "; ".join(stale)
                + ". Update .env against .env.example; a stale port reaches "
                "whatever else owns it rather than failing.",
            )

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

        # Checked here too, not only for the root file. `services/chat/.env` is
        # what `load_dotenv()` finds when the service runs from its own
        # directory, and its `DATABASE_URL` reaches Postgres through
        # hand-written asyncpg queries rather than Prisma — so a stale port
        # runs raw SQL against whatever else owns it.
        stale_chat = stale_port_keys(chat_env, published_ports())
        if stale_chat:
            warnings.append(
                "services/chat/.env host ports disagree with docker-compose.yml — "
                + "; ".join(stale_chat)
                + ". Update it against services/chat/.env.example.",
            )

    # Web dependencies and generated Prisma client
    if WEB_NODE_MODULES.exists():
        passes.append("Web dependencies are installed.")
    else:
        failures.append(("apps/web/node_modules is missing.", "Run `make setup`."))

    if WEB_PRISMA_CLIENT.exists() and WEB_PRISMA_PACKAGE.exists():
        passes.append("Web Prisma client is generated.")
    else:
        failures.append(("Web Prisma client is missing.", "Run `make prisma-generate`."))

    # Chat Python dependencies. The chat service talks to Postgres through
    # asyncpg; there is no generated Python client to check for.
    deps_check = run([sys.executable, "-c", "import asyncpg, fastapi, pytest"])
    if deps_check.returncode == 0:
        passes.append("Chat Python dependencies are available.")
    else:
        failures.append(("Chat Python dependencies are incomplete.", "Run `make setup-chat`."))

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
