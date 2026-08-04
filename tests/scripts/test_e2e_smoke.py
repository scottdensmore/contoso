import importlib.util
import os
import tempfile
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


class DegradedChatDetectionTests(unittest.TestCase):
    """The smoke must not report success for a chat backend that is dead.

    Both failure paths in services/chat/src/api/main.py return HTTP 200 with a
    populated `answer`, so the previous non-empty-string check passed
    identically whether chat worked or had failed entirely.
    """

    MOCK_REPLY = {
        "answer": "Mock response: You asked about 'x'. ...",
        "customer_id": "1",
        "mock": True,
    }
    FALLBACK_REPLY = {
        "answer": "I'm having trouble processing your request about 'x' right now.",
        "customer_id": "1",
        "error": "PROJECT_ID, REGION, and DISCOVERY_ENGINE_DATASTORE_ID must be set",
        "fallback": True,
    }
    REAL_REPLY = {"answer": "A four-season tent suits that trip.", "context": []}

    def test_degraded_replies_still_satisfy_the_old_check(self):
        """Establishes the bug the rest of this class exists to fix.

        If these failed `response_has_answer`, the old check would already have
        caught a dead backend and nothing here would be needed.
        """
        for label, reply in (("mock", self.MOCK_REPLY), ("fallback", self.FALLBACK_REPLY)):
            with self.subTest(reply=label):
                self.assertTrue(e2e_smoke.response_has_answer(reply))

    def test_degraded_replies_are_classified_by_kind(self):
        """Kind, not prose. The two need different treatment."""
        self.assertEqual(e2e_smoke.degraded_reason(self.MOCK_REPLY)[0], "mock")
        self.assertEqual(e2e_smoke.degraded_reason(self.FALLBACK_REPLY)[0], "fallback")

    def test_degraded_reason_names_the_underlying_error(self):
        """A bare "degraded" verdict sends the reader back to the logs."""
        self.assertIn(
            "DISCOVERY_ENGINE_DATASTORE_ID",
            e2e_smoke.degraded_reason(self.FALLBACK_REPLY)[1],
        )

    def test_a_real_reply_is_not_flagged(self):
        self.assertIsNone(e2e_smoke.degraded_reason(self.REAL_REPLY))

    def test_require_real_answer_is_explicit_only(self):
        """No inference from the environment.

        The smoke process never holds chat's configuration — PROJECT_ID and the
        datastore id reach chat through compose substitution from .env, which
        the e2e-smoke target does not export. Inferring from them here would
        read False no matter how chat is actually configured.
        """
        self.assertFalse(e2e_smoke.require_real_answer({}))
        self.assertFalse(
            e2e_smoke.require_real_answer(
                {
                    "PROJECT_ID": "contoso-prod-1234",
                    "DISCOVERY_ENGINE_DATASTORE_ID": "contoso-datastore",
                }
            )
        )
        self.assertTrue(e2e_smoke.require_real_answer({"E2E_REQUIRE_REAL_CHAT": "1"}))


class DegradedChatProxyBehaviourTests(unittest.TestCase):
    """Covers `check_web_chat_proxy` itself, not just its helpers.

    The branch below is the entire point of the change, and asserting only on
    the pure helpers would leave it untested.
    """

    def _run(self, payload, env):
        with patch.object(e2e_smoke, "request_json", return_value=(200, payload, "")), \
             patch.dict(os.environ, env, clear=True):
            e2e_smoke.check_web_chat_proxy("http://web")

    def test_mock_reply_fails_even_without_credentials(self):
        """An import failure needs no credentials to detect.

        This is what gives CI real regression detection: `mock` means
        contoso_chat failed to import, which is exactly what an undeclared
        dependency produces.
        """
        with self.assertRaises(e2e_smoke.NonRetryableSmokeError) as caught:
            self._run(DegradedChatDetectionTests.MOCK_REPLY, {})
        self.assertIn("mock", str(caught.exception))

    def test_mock_failure_is_not_retried(self):
        """Drives the real retry loop rather than asserting a class hierarchy.

        REAL_CHAT_AVAILABLE is fixed at module import, so a mock reply cannot
        change between polls. Retrying it would re-POST every interval for the
        whole timeout (300s in CI) before reporting a verdict that was knowable
        on the first attempt, with the reason buried in the last-error text.
        """
        attempts = 0

        def check():
            nonlocal attempts
            attempts += 1
            self._run(DegradedChatDetectionTests.MOCK_REPLY, {})

        with self.assertRaises(e2e_smoke.NonRetryableSmokeError):
            e2e_smoke.wait_for("chat proxy", 60, 0.01, check)
        self.assertEqual(attempts, 1)

    def test_fallback_reply_passes_without_credentials(self):
        """CI has no secrets; failing here would make the smoke permanently
        red rather than more honest."""
        self._run(DegradedChatDetectionTests.FALLBACK_REPLY, {})

    def test_fallback_reply_fails_when_a_real_answer_is_required(self):
        with self.assertRaises(e2e_smoke.NonRetryableSmokeError):
            self._run(
                DegradedChatDetectionTests.FALLBACK_REPLY,
                {"E2E_REQUIRE_REAL_CHAT": "1"},
            )

    def test_a_real_reply_passes_in_both_modes(self):
        for env in ({}, {"E2E_REQUIRE_REAL_CHAT": "1"}):
            with self.subTest(env=env):
                self._run(DegradedChatDetectionTests.REAL_REPLY, env)

    def test_notice_reaches_the_step_summary(self):
        """A bare print is invisible on a green run — this job only dumps
        logs when it fails."""
        with tempfile.TemporaryDirectory() as tmp:
            summary = Path(tmp) / "summary.md"
            summary.touch()
            self._run(
                DegradedChatDetectionTests.FALLBACK_REPLY,
                {"GITHUB_STEP_SUMMARY": str(summary)},
            )
            written = summary.read_text(encoding="utf-8")
        self.assertIn("DISCOVERY_ENGINE_DATASTORE_ID", written)


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
