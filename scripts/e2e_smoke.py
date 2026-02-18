#!/usr/bin/env python3
"""Run a lightweight web -> chat -> db end-to-end smoke check."""

from __future__ import annotations

import argparse
import json
import time
import urllib.error
import urllib.request
from typing import Any


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--web-url", default="http://127.0.0.1:3000", help="Base URL for web app.")
    parser.add_argument("--chat-url", default="http://127.0.0.1:8000", help="Base URL for chat service.")
    parser.add_argument("--timeout", type=int, default=240, help="Total timeout in seconds.")
    parser.add_argument("--interval", type=float, default=2.0, help="Polling interval in seconds.")
    return parser.parse_args()


def request_json(
    method: str,
    url: str,
    payload: dict[str, Any] | None = None,
    timeout: float = 10.0,
) -> tuple[int, dict[str, Any] | None, str]:
    body = None
    headers = {"Accept": "application/json"}
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url=url, method=method, data=body, headers=headers)

    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            status = resp.getcode()
            raw = resp.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        status = exc.code
        raw = exc.read().decode("utf-8", errors="replace")

    parsed: dict[str, Any] | None
    try:
        parsed = json.loads(raw) if raw else None
    except json.JSONDecodeError:
        parsed = None
    return status, parsed, raw


def response_has_answer(payload: dict[str, Any] | None) -> bool:
    if not isinstance(payload, dict):
        return False
    answer = payload.get("answer") or payload.get("response")
    return isinstance(answer, str) and bool(answer.strip())


def dependencies_db_connected(payload: dict[str, Any] | None) -> bool:
    if not isinstance(payload, dict):
        return False
    database = payload.get("database")
    if not isinstance(database, dict):
        return False
    return database.get("connected") is True


def wait_for(
    label: str,
    timeout_seconds: int,
    interval_seconds: float,
    check: callable[[], None],
) -> None:
    deadline = time.time() + timeout_seconds
    last_error: str | None = None

    while time.time() < deadline:
        try:
            check()
            print(f"[PASS] {label}")
            return
        except Exception as exc:  # noqa: BLE001
            last_error = str(exc)
            time.sleep(interval_seconds)

    raise RuntimeError(f"{label} failed before timeout. Last error: {last_error}")


def check_chat_health(chat_url: str) -> None:
    status, payload, raw = request_json("GET", f"{chat_url}/health")
    if status != 200:
        raise RuntimeError(f"Health endpoint returned {status}: {raw}")
    if not isinstance(payload, dict) or payload.get("status") != "healthy":
        raise RuntimeError(f"Unexpected health payload: {payload}")


def check_chat_dependencies(chat_url: str) -> None:
    status, payload, raw = request_json("GET", f"{chat_url}/health/dependencies")
    if status != 200:
        raise RuntimeError(f"Dependency endpoint returned {status}: {raw}")
    if not dependencies_db_connected(payload):
        raise RuntimeError(f"Chat DB dependency is not healthy: {payload}")


def check_web_chat_proxy(web_url: str) -> None:
    payload = {
        "question": "E2E smoke check: recommend a tent.",
        "customer_id": "1",
        "chat_history": "[]",
    }
    status, response_payload, raw = request_json(
        "POST",
        f"{web_url}/api/chat/service",
        payload=payload,
    )
    if status != 200:
        raise RuntimeError(f"Web chat proxy returned {status}: {raw}")
    if not response_has_answer(response_payload):
        raise RuntimeError(f"Web chat proxy response missing answer/response field: {response_payload}")


def main() -> int:
    args = parse_args()

    wait_for(
        label="chat health",
        timeout_seconds=args.timeout,
        interval_seconds=args.interval,
        check=lambda: check_chat_health(args.chat_url),
    )
    wait_for(
        label="chat dependency health (db)",
        timeout_seconds=args.timeout,
        interval_seconds=args.interval,
        check=lambda: check_chat_dependencies(args.chat_url),
    )
    wait_for(
        label="web -> chat proxy call",
        timeout_seconds=args.timeout,
        interval_seconds=args.interval,
        check=lambda: check_web_chat_proxy(args.web_url),
    )

    print("E2E smoke passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
