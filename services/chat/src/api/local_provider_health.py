import argparse
import importlib.util
import json
import os
import sys
import urllib.error
import urllib.request
from typing import Any


def _missing_python_packages(packages: list[str]) -> list[str]:
    missing: list[str] = []
    for package in packages:
        if importlib.util.find_spec(package) is None:
            missing.append(package)
    return missing


def _fetch_ollama_models(ollama_base_url: str) -> list[str]:
    tags_url = f"{ollama_base_url.rstrip('/')}/api/tags"
    with urllib.request.urlopen(tags_url, timeout=8) as response:
        payload = json.loads(response.read().decode("utf-8"))

    models: list[str] = []
    for entry in payload.get("models", []):
        if isinstance(entry, dict) and isinstance(entry.get("name"), str):
            models.append(entry["name"])
    return sorted(models)


def evaluate_local_provider_health() -> dict[str, Any]:
    provider = os.getenv("LLM_PROVIDER", "gcp")
    local_model = os.getenv("LOCAL_MODEL_NAME", "gemma3:12b")
    ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://host.docker.internal:11434")

    health: dict[str, Any] = {
        "provider": provider,
        "enabled": provider == "local",
        "ready": True,
        "local_model_name": local_model,
        "ollama_base_url": ollama_base_url,
        "effective_ollama_base_url": ollama_base_url,
        "missing_python_packages": [],
        "ollama_reachable": None,
        "model_available": None,
        "available_models": [],
        "warnings": [],
        "errors": [],
    }

    if provider != "local":
        return health

    missing = _missing_python_packages(["chromadb", "litellm"])
    health["missing_python_packages"] = missing
    if missing:
        health["errors"].append(
            "Missing local-provider Python packages: "
            + ", ".join(missing)
            + ". Rebuild with CHAT_INSTALL_LOCAL_STACK=1 or install requirements-local.txt."
        )

    ollama_urls_to_try = [ollama_base_url]
    if "host.docker.internal" in ollama_base_url:
        ollama_urls_to_try.append(ollama_base_url.replace("host.docker.internal", "localhost"))

    last_error: Exception | None = None
    available_models: list[str] = []
    for candidate_url in ollama_urls_to_try:
        try:
            available_models = _fetch_ollama_models(candidate_url)
            health["ollama_reachable"] = True
            health["available_models"] = available_models
            health["effective_ollama_base_url"] = candidate_url
            if candidate_url != ollama_base_url:
                health["warnings"].append(
                    "Ollama not reachable via configured OLLAMA_BASE_URL; fell back to "
                    f"{candidate_url} for host-side preflight."
                )
            break
        except (urllib.error.URLError, TimeoutError, ValueError, json.JSONDecodeError) as exc:
            last_error = exc

    if health["ollama_reachable"] is not True:
        health["ollama_reachable"] = False
        health["errors"].append(
            f"Unable to reach Ollama at {ollama_base_url}: {last_error}"
        )
        health["ready"] = False
        return health

    health["model_available"] = local_model in health["available_models"]
    if not health["model_available"]:
        if health["available_models"]:
            health["errors"].append(
                "LOCAL_MODEL_NAME "
                f"'{local_model}' not found in Ollama models: "
                + ", ".join(health["available_models"])
            )
        else:
            health["errors"].append("Ollama returned no installed models.")

    health["ready"] = len(health["errors"]) == 0
    return health


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Validate local-provider runtime prerequisites for chat service."
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Print health report as JSON.",
    )
    args = parser.parse_args()

    health = evaluate_local_provider_health()

    if args.json:
        print(json.dumps(health, indent=2, sort_keys=True))
    else:
        print(f"provider={health['provider']}")
        print(f"enabled={health['enabled']}")
        print(f"ready={health['ready']}")
        if health["enabled"]:
            print(f"ollama_base_url={health['ollama_base_url']}")
            print(f"effective_ollama_base_url={health['effective_ollama_base_url']}")
            print(f"local_model_name={health['local_model_name']}")
            print(f"ollama_reachable={health['ollama_reachable']}")
            print(f"model_available={health['model_available']}")
            if health["available_models"]:
                print("available_models=" + ",".join(health["available_models"]))
            if health["warnings"]:
                for warning in health["warnings"]:
                    print(f"warning={warning}")
            if health["errors"]:
                for error in health["errors"]:
                    print(f"error={error}")

    if health["enabled"] and not health["ready"]:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
