import importlib.util
import unittest
from pathlib import Path
from unittest.mock import patch

REPO_ROOT = Path(__file__).resolve().parents[2]


def load_script_module(module_name: str, file_path: Path):
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load module {module_name} from {file_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


e2e_smoke = load_script_module(
    "e2e_smoke",
    REPO_ROOT / "scripts/e2e_smoke.py",
)


class E2ESmokeTests(unittest.TestCase):
    def test_response_has_answer(self):
        self.assertTrue(e2e_smoke.response_has_answer({"answer": "hello"}))
        self.assertTrue(e2e_smoke.response_has_answer({"response": "hello"}))
        self.assertFalse(e2e_smoke.response_has_answer({"answer": "   "}))

    def test_dependencies_db_connected(self):
        self.assertTrue(e2e_smoke.dependencies_db_connected({"database": {"connected": True}}))
        self.assertFalse(e2e_smoke.dependencies_db_connected({"database": {"connected": False}}))

    def test_local_provider_ready_defaults_to_true_without_local_provider_payload(self):
        self.assertEqual(e2e_smoke.local_provider_ready({"database": {"connected": True}}), (True, None))

    def test_local_provider_ready_returns_false_when_enabled_but_unready(self):
        payload = {
            "local_provider": {
                "enabled": True,
                "ready": False,
                "errors": ["Unable to reach Ollama"],
            }
        }
        self.assertEqual(
            e2e_smoke.local_provider_ready(payload),
            (False, "Unable to reach Ollama"),
        )

    def test_check_web_chat_proxy_passes(self):
        with patch.object(
            e2e_smoke,
            "request_json",
            return_value=(200, {"answer": "ok"}, '{"answer":"ok"}'),
        ):
            e2e_smoke.check_web_chat_proxy("http://localhost:3000")

    def test_check_web_chat_proxy_fails_without_answer(self):
        with patch.object(
            e2e_smoke,
            "request_json",
            return_value=(200, {"message": "missing answer"}, '{"message":"missing answer"}'),
        ):
            with self.assertRaises(RuntimeError):
                e2e_smoke.check_web_chat_proxy("http://localhost:3000")

    def test_check_chat_dependencies_fails_fast_for_unready_local_provider(self):
        payload = {
            "database": {"connected": True},
            "local_provider": {"enabled": True, "ready": False, "errors": ["Unable to reach Ollama"]},
        }
        with patch.object(
            e2e_smoke,
            "request_json",
            return_value=(200, payload, '{"status":"degraded"}'),
        ):
            with self.assertRaises(e2e_smoke.NonRetryableSmokeError):
                e2e_smoke.check_chat_dependencies("http://localhost:8000")

    def test_wait_for_aborts_immediately_on_non_retryable_error(self):
        calls = {"count": 0}

        def fail_once():
            calls["count"] += 1
            raise e2e_smoke.NonRetryableSmokeError("stop now")

        with patch.object(e2e_smoke.time, "sleep") as mock_sleep:
            with self.assertRaises(e2e_smoke.NonRetryableSmokeError):
                e2e_smoke.wait_for(
                    label="fail-fast-check",
                    timeout_seconds=30,
                    interval_seconds=1.0,
                    check=fail_once,
                )

        self.assertEqual(calls["count"], 1)
        mock_sleep.assert_not_called()


if __name__ == "__main__":
    unittest.main()
