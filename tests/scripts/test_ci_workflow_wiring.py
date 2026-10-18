import importlib.util
import re
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


def load_detector():
    spec = importlib.util.spec_from_file_location(
        "detect_changed_surfaces", REPO_ROOT / "scripts/detect_changed_surfaces.py"
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


CI_WORKFLOW = REPO_ROOT / ".github/workflows/ci.yml"


def job_block(job_id: str) -> str:
    """Read a top-level job without a third-party YAML dependency."""
    match = re.search(
        rf"^  {re.escape(job_id)}:$(.*?)(?:^  \S|\Z)",
        CI_WORKFLOW.read_text(encoding="utf-8"),
        re.MULTILINE | re.DOTALL,
    )
    if match is None:
        raise AssertionError(f"job '{job_id}' not found in ci.yml")
    return match.group(1)


def assert_unconditional_job(test, job_id):
    block = job_block(job_id)
    test.assertNotRegex(block, re.compile(r"^    (if|needs):", re.MULTILINE))
    test.assertRegex(block, r"runs-on: ubuntu-latest")
    test.assertRegex(block, r"timeout-minutes: [1-9][0-9]*")


@unittest.skipUnless(
    CI_WORKFLOW.exists(),
    "CI workflow is not present",
)
class ScriptGuardrailGatingTests(unittest.TestCase):
    """The guardrail suite must run for the changes it guards.

    It asserts on files across every surface — chat entrypoints and Dockerfiles,
    web config, agent docs. Gating it on `runtime` meant a chat-only change
    could edit a guarded file while the guard sat out, and a job skipped by an
    `if:` counts as *satisfying* a required status check, so branch protection
    did not compensate.
    """

    GUARDED_BY_CHAT_PROFILE_WIRING = (
        "services/chat/src/api/chat-entrypoint.sh",
        "services/chat/scripts/check_dependency_policy.py",
        "services/chat/Dockerfile",
    )

    def test_guarded_files_exist(self):
        """Without this the two tests below pass on typo'd paths."""
        for path in self.GUARDED_BY_CHAT_PROFILE_WIRING:
            with self.subTest(path=path):
                self.assertTrue((REPO_ROOT / path).exists())

    def test_guarded_files_classify_as_chat(self):
        detector = load_detector()
        for path in self.GUARDED_BY_CHAT_PROFILE_WIRING:
            with self.subTest(path=path):
                self.assertTrue(detector.classify([path])["chat"])

    def test_script_tests_run_without_event_or_changed_surface_gates(self):
        # Unlike the removed workflow, one job runs this suite on PRs AND push.
        # A skipped required check must never hide a guarded-file regression.
        assert_unconditional_job(self, "script-tests")
        self.assertIn("test-scripts", job_block("script-tests"))

    def test_job_reader_resolves_the_last_job_in_the_file(self):
        last_job = re.findall(
            r"^  ([\w-]+):$", CI_WORKFLOW.read_text(encoding="utf-8"), re.MULTILINE
        )[-1]
        assert_unconditional_job(self, last_job)


@unittest.skipUnless(
    CI_WORKFLOW.exists(),
    "CI workflow is not present",
)
class CiWorkflowWiringTests(unittest.TestCase):
    def test_every_required_suite_runs_unconditionally(self):
        for job in ("script-tests", "web-ci", "chat-ci", "integration-e2e"):
            with self.subTest(job=job):
                assert_unconditional_job(self, job)
        self.assertIn("setup ci", job_block("web-ci"))
        self.assertIn("check-scripts quick-ci-chat", job_block("chat-ci"))
        self.assertIn("CHAT_SETUP_PROFILE=core", job_block("chat-ci"))

    def test_ci_workflow_captures_dependency_health_artifacts(self):
        content = job_block("integration-e2e")
        self.assertIn("Capture dependency health snapshot", content)
        self.assertIn("e2e-dependencies-health.json", content)
        self.assertIn("ci-diagnostics/", content)
        self.assertIn("apps/web/test-results/", content)
        self.assertIn("retention-days: 3", content)

    def test_ci_keeps_the_stack_isolated_and_always_cleans_it_up(self):
        content = job_block("integration-e2e")
        self.assertIn("--project-name contoso-ci", content)
        self.assertIn("-f .github/ci-compose.yml", content)
        self.assertRegex(content, r"if: always\(\)\n        run: \$DOCKER_COMPOSE down --volumes --remove-orphans")
        override = (REPO_ROOT / ".github/ci-compose.yml").read_text(encoding="utf-8")
        for port in ("3100:3000", "8100:8000", "55432:5432"):
            self.assertIn(f"127.0.0.1:{port}", override)
        self.assertEqual(override.count("ports: !override"), 3)
        self.assertIn("GOOGLE_APPLICATION_CREDENTIALS: /nonexistent/", override)

    def test_ci_has_read_only_permissions_and_no_publishing_triggers(self):
        content = CI_WORKFLOW.read_text(encoding="utf-8")
        self.assertIn("permissions:\n  contents: read\n", content)
        self.assertIn("push:\n    branches: [main]", content)
        self.assertIn("pull_request:\n    branches: [main]", content)
        self.assertNotRegex(content, r"(?m)^ +(?:paths|paths-ignore|schedule|tags|tags-ignore):")
        self.assertNotIn("pull_request_target", content)
        self.assertNotIn("secrets.", content)
        self.assertNotIn(": write", content)
        self.assertNotIn("gh issue", content)
        self.assertNotIn("gh release", content)
        self.assertNotIn("docker push", content)
        self.assertEqual(content.count("persist-credentials: false"), 4)


if __name__ == "__main__":
    unittest.main()
