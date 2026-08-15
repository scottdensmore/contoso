#!/usr/bin/env python3
"""Run a lightweight web -> chat -> db end-to-end smoke check."""

from __future__ import annotations

import argparse
import json
import os
import time
import urllib.error
import urllib.request
from collections.abc import Mapping
from html import escape
from typing import Any


class NonRetryableSmokeError(RuntimeError):
    """Error that should stop smoke polling immediately."""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--web-url", default="http://127.0.0.1:3100", help="Base URL for web app.")
    parser.add_argument("--chat-url", default="http://127.0.0.1:8100", help="Base URL for chat service.")
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


def report_notice(message: str) -> None:
    """Surface a caveat where a reader will actually see it.

    A bare print scrolls past in the raw step log, and this job only dumps
    compose logs when it fails — so on a green run the caveat is invisible,
    which is the state this check exists to end. The job already writes to
    $GITHUB_STEP_SUMMARY elsewhere.
    """
    print(f"NOTICE: {message}")
    summary_path = os.environ.get("GITHUB_STEP_SUMMARY")
    if not summary_path:
        return
    # A newline in `message` would end the blockquote and render the rest as
    # body text; the detail is an exception string, so it can contain one.
    single_line = " ".join(message.split())
    try:
        with open(summary_path, "a", encoding="utf-8") as handle:
            handle.write(f"> [!WARNING]\n> {single_line}\n\n")
    except OSError as error:  # pragma: no cover - summary is best-effort
        print(f"(could not write step summary: {error})")


def degraded_reason(payload: dict[str, Any] | None) -> tuple[str, str] | None:
    """Classify a reply that is not evidence chat works, or None if it is.

    Returns (kind, detail). Both of the chat service's failure paths return
    HTTP 200 with a populated `answer` — `mock` when the chat module could not
    be imported at all, `fallback` when any exception was raised — so checking
    for a non-empty answer passes identically whether chat works or is dead.
    The service labels both, so read the label.

    The two kinds need different treatment, which is the whole reason this
    returns a kind rather than a bare string. `mock` means an import failed and
    needs no credentials to detect; `fallback` can mean nothing worse than an
    unconfigured datastore.
    """
    if not isinstance(payload, dict):
        return None
    if payload.get("mock"):
        return ("mock", "chat module could not be imported; served the mock response")
    if payload.get("fallback"):
        detail = payload.get("error") or "unspecified error"
        return ("fallback", f"chat backend raised and served the fallback: {detail}")
    return None


def require_real_answer(env: Mapping[str, str] | None = None) -> bool:
    """Whether a credential-dependent degradation should fail the run.

    Explicit, because it cannot be inferred: the smoke process never holds
    chat's configuration. PROJECT_ID and DISCOVERY_ENGINE_DATASTORE_ID reach
    chat through compose substitution from .env, which the e2e-smoke target
    does not export — and under LLM_PROVIDER=local chat needs neither.
    """
    env = os.environ if env is None else env
    return env.get("E2E_REQUIRE_REAL_CHAT", "").strip().lower() in {"1", "true", "yes"}


def dependencies_db_connected(payload: dict[str, Any] | None) -> bool:
    if not isinstance(payload, dict):
        return False
    database = payload.get("database")
    if not isinstance(database, dict):
        return False
    return database.get("connected") is True


def local_provider_ready(payload: dict[str, Any] | None) -> tuple[bool, str | None]:
    if not isinstance(payload, dict):
        return True, None
    local_provider = payload.get("local_provider")
    if not isinstance(local_provider, dict):
        return True, None
    if local_provider.get("enabled") is not True:
        return True, None
    if local_provider.get("ready") is True:
        return True, None

    errors = local_provider.get("errors")
    if isinstance(errors, list) and errors:
        message = "; ".join(str(item) for item in errors)
    elif isinstance(errors, str) and errors.strip():
        message = errors.strip()
    else:
        message = "Local provider readiness failed without error details."
    return False, message


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
        except NonRetryableSmokeError:
            raise
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
    is_ready, message = local_provider_ready(payload)
    if not is_ready:
        raise NonRetryableSmokeError(
            "Chat local-provider dependency is not healthy: "
            f"{message}. Run `make diagnose-chat-local` for detailed diagnostics."
        )


def check_chat_root(chat_url: str) -> None:
    """The service identity endpoint.

    test_main.py asserts the payload more strictly, but against an in-process
    app. This asserts the route is reachable on the running image, which is a
    different failure — a bad COPY or entrypoint passes there and fails here.
    """
    status, payload, raw = request_json("GET", f"{chat_url}/")
    if status != 200:
        raise RuntimeError(f"Chat root returned {status}: {raw}")
    missing = [
        key for key in ("message", "version", "status") if key not in (payload or {})
    ]
    if missing:
        raise RuntimeError(f"Chat root response missing {missing}: {payload}")


def check_chat_rejects_invalid_payload(chat_url: str) -> None:
    """A request with no question must be rejected, not answered.

    test_main.py covers the same payload against an in-process app; this covers
    it through the deployed stack, where a proxy or middleware could answer
    before validation ever runs.
    """
    status, _, raw = request_json(
        "POST",
        f"{chat_url}/api/create_response",
        payload={"customer_id": "1", "chat_history": "[]"},
    )
    if status != 422:
        raise NonRetryableSmokeError(
            f"Chat accepted a request with no question: expected 422, got {status}: {raw}"
        )


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

    degraded = degraded_reason(response_payload)
    if degraded is None:
        return
    kind, detail = degraded

    if kind == "mock":
        # REAL_CHAT_AVAILABLE is decided by an import at module load, so this
        # cannot recover and needs no credentials to detect. It is exactly the
        # regression an undeclared dependency produces, and it is fatal
        # everywhere including CI.
        raise NonRetryableSmokeError(f"Chat served a mock response: {detail}")

    if require_real_answer():
        raise NonRetryableSmokeError(f"Chat failed to answer: {detail}")

    # Credential-dependent, and this environment has none. Not a failure — but
    # the run must not read as "chat works", which is what it did when the only
    # check was a non-empty answer string.
    report_notice(
        f"chat did not answer for real — {detail}. This run verified transport "
        "and status codes only. Set E2E_REQUIRE_REAL_CHAT=1 wherever chat is "
        "expected to answer to make this a failure."
    )


def check_web_dynamic_page(web_url: str) -> None:
    """Render a page with a dynamic [slug] segment.

    Every other check here targets a route handler, and route handlers receive
    no route params. That blind spot let a Next 16 upgrade ship pages that
    404'd on every product because `params` became a Promise and was not
    awaited, while the whole suite stayed green.

    The slug is read from the API rather than hard-coded so this does not need
    updating when seed data changes.
    """
    status, payload, raw = request_json("GET", f"{web_url}/api/products")
    if status != 200:
        raise RuntimeError(f"/api/products returned {status}: {raw[:200]}")
    if not isinstance(payload, list) or not payload:
        raise RuntimeError("No products returned; cannot exercise a dynamic page.")

    product = payload[0]
    slug = product.get("slug") if isinstance(product, dict) else None
    name = product.get("name") if isinstance(product, dict) else None
    if not slug:
        raise RuntimeError(f"First product has no slug to request: {product}")

    status, _payload, html = request_json("GET", f"{web_url}/products/{slug}", timeout=20.0)
    if status != 200:
        raise RuntimeError(
            f"/products/{slug} returned {status}. A dynamic segment failed to "
            "resolve (unawaited params render every slug as not-found)."
        )
    if name and name not in html and escape(name) not in html:
        raise RuntimeError(f"/products/{slug} rendered without product name {name!r}.")


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
        label="chat root endpoint",
        timeout_seconds=args.timeout,
        interval_seconds=args.interval,
        check=lambda: check_chat_root(args.chat_url),
    )
    wait_for(
        label="chat rejects a request with no question",
        timeout_seconds=args.timeout,
        interval_seconds=args.interval,
        check=lambda: check_chat_rejects_invalid_payload(args.chat_url),
    )
    wait_for(
        label="web -> chat proxy call",
        timeout_seconds=args.timeout,
        interval_seconds=args.interval,
        check=lambda: check_web_chat_proxy(args.web_url),
    )
    wait_for(
        label="web dynamic [slug] page",
        timeout_seconds=args.timeout,
        interval_seconds=args.interval,
        check=lambda: check_web_dynamic_page(args.web_url),
    )

    print("E2E smoke passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
