#!/usr/bin/env python3
"""Track and analyze CI smoke metrics over time."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def parse_metrics_file(path: Path) -> dict[str, str]:
    metrics: dict[str, str] = {}
    if not path.exists():
        return metrics

    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or "=" not in line:
            continue
        key, value = line.split("=", 1)
        metrics[key.strip()] = value.strip()
    return metrics


def to_int(value: str | None) -> int | None:
    if value is None or value == "" or value == "unknown":
        return None
    try:
        return int(value)
    except ValueError:
        return None


def load_history(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return []
    if not isinstance(data, list):
        return []
    return [entry for entry in data if isinstance(entry, dict)]


def save_history(path: Path, history: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(history, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def find_previous_successful(history: list[dict[str, Any]]) -> dict[str, Any] | None:
    for entry in reversed(history):
        if entry.get("status") == "success":
            return entry
    return None


def detect_regressions(current: dict[str, Any], previous: dict[str, Any] | None) -> list[str]:
    if previous is None:
        return []

    regressions: list[str] = []

    current_duration = current.get("duration_seconds")
    previous_duration = previous.get("duration_seconds")
    if (
        isinstance(current_duration, int)
        and isinstance(previous_duration, int)
        and current_duration > previous_duration * 1.25
        and current_duration - previous_duration > 30
    ):
        regressions.append(
            f"duration increased from {previous_duration}s to {current_duration}s "
            f"(+{current_duration - previous_duration}s)"
        )

    current_chat_size = current.get("chat_image_bytes")
    previous_chat_size = previous.get("chat_image_bytes")
    if (
        isinstance(current_chat_size, int)
        and isinstance(previous_chat_size, int)
        and current_chat_size > previous_chat_size * 1.20
        and current_chat_size - previous_chat_size > 100_000_000
    ):
        regressions.append(
            f"chat image increased by {current_chat_size - previous_chat_size} bytes "
            f"(from {previous_chat_size} to {current_chat_size})"
        )

    current_web_size = current.get("web_image_bytes")
    previous_web_size = previous.get("web_image_bytes")
    if (
        isinstance(current_web_size, int)
        and isinstance(previous_web_size, int)
        and current_web_size > previous_web_size * 1.10
        and current_web_size - previous_web_size > 100_000_000
    ):
        regressions.append(
            f"web image increased by {current_web_size - previous_web_size} bytes "
            f"(from {previous_web_size} to {current_web_size})"
        )

    return regressions


def metric_line(label: str, current: int | None, previous: int | None, suffix: str = "") -> str:
    current_text = "unknown" if current is None else f"{current}{suffix}"
    previous_text = "n/a" if previous is None else f"{previous}{suffix}"
    if current is None or previous is None:
        delta_text = "n/a"
    else:
        delta = current - previous
        delta_text = f"{delta:+d}{suffix}"
    return f"| {label} | {current_text} | {previous_text} | {delta_text} |"


def build_summary(
    *,
    profile: str,
    run_id: str,
    sha: str,
    status: str,
    budget_failed: bool,
    current: dict[str, Any],
    previous: dict[str, Any] | None,
    regressions: list[str],
) -> str:
    previous_run = previous.get("run_id") if previous else "n/a"
    previous_duration = previous.get("duration_seconds") if previous else None
    previous_chat_size = previous.get("chat_image_bytes") if previous else None
    previous_web_size = previous.get("web_image_bytes") if previous else None

    lines = [
        f"## E2E Metrics Summary ({profile})",
        "",
        f"- Run ID: `{run_id}`",
        f"- Commit: `{sha}`",
        f"- Status: `{status}`",
        f"- Budget Failed: `{'yes' if budget_failed else 'no'}`",
        f"- Previous Successful Run: `{previous_run}`",
        "",
        "| Metric | Current | Previous Successful | Delta |",
        "| --- | --- | --- | --- |",
        metric_line("Duration", current.get("duration_seconds"), previous_duration, "s"),
        metric_line("Chat Image", current.get("chat_image_bytes"), previous_chat_size),
        metric_line("Web Image", current.get("web_image_bytes"), previous_web_size),
        "",
    ]

    if regressions:
        lines.append("### Regression Signals")
        for regression in regressions:
            lines.append(f"- {regression}")
    else:
        lines.append("No regression signals detected against previous successful baseline.")

    lines.append("")
    return "\n".join(lines)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--profile", choices=("lite", "full"), required=True)
    parser.add_argument("--metrics-file", required=True)
    parser.add_argument("--history-file", required=True)
    parser.add_argument("--summary-file", required=True)
    parser.add_argument("--run-id", required=True)
    parser.add_argument("--sha", required=True)
    parser.add_argument("--status", required=True)
    parser.add_argument("--budget-failed", default="0")
    parser.add_argument("--timestamp")
    parser.add_argument("--max-history", type=int, default=40)
    parser.add_argument("--github-output")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    timestamp = args.timestamp or datetime.now(timezone.utc).replace(microsecond=0).isoformat()
    budget_failed = str(args.budget_failed).strip() == "1"

    metrics = parse_metrics_file(Path(args.metrics_file))
    current = {
        "profile": args.profile,
        "run_id": args.run_id,
        "sha": args.sha,
        "status": args.status,
        "budget_failed": budget_failed,
        "timestamp": timestamp,
        "duration_seconds": to_int(metrics.get("duration_seconds")),
        "chat_image_bytes": to_int(metrics.get("chat_image_bytes")),
        "web_image_bytes": to_int(metrics.get("web_image_bytes")),
    }

    history_path = Path(args.history_file)
    history = load_history(history_path)
    previous_successful = find_previous_successful(history)
    regressions = detect_regressions(current, previous_successful)
    current["regressions"] = regressions
    history.append(current)
    if args.max_history > 0:
        history = history[-args.max_history :]
    save_history(history_path, history)

    summary = build_summary(
        profile=args.profile,
        run_id=args.run_id,
        sha=args.sha,
        status=args.status,
        budget_failed=budget_failed,
        current=current,
        previous=previous_successful,
        regressions=regressions,
    )
    summary_path = Path(args.summary_file)
    summary_path.parent.mkdir(parents=True, exist_ok=True)
    summary_path.write_text(summary, encoding="utf-8")

    if args.github_output:
        output_lines = [
            f"regression_detected={'true' if bool(regressions) else 'false'}",
            f"history_entries={len(history)}",
            f"summary_file={summary_path}",
        ]
        with Path(args.github_output).open("a", encoding="utf-8") as handle:
            for line in output_lines:
                handle.write(f"{line}\n")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
