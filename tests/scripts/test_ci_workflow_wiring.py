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


def job_condition(job_id: str) -> str:
    """Read a job's `if:` from ci.yml as text.

    Deliberately not PyYAML. The job that runs this suite creates a bare venv
    and installs nothing, so a third-party import here is not a failing test —
    it is a collection error that reddens the whole suite. Every other script
    and script test in this repo is stdlib-only for the same reason.
    """
    content = (REPO_ROOT / ".github/workflows/ci.yml").read_text(encoding="utf-8")
    # `\Z` terminates the block for the last job in the file. Without it the
    # helper reports "not found" for a job that is present, which would turn
    # this guard into a misleading error the moment jobs are reordered.
    match = re.search(
        rf"^  {re.escape(job_id)}:$(.*?)(?:^  \S|\Z)",
        content,
        re.MULTILINE | re.DOTALL,
    )
    if match is None:
        raise AssertionError(f"job '{job_id}' not found in ci.yml")
    condition = re.search(r"^    if:\s*(.+)$", match.group(1), re.MULTILINE)
    if condition is None:
        raise AssertionError(f"job '{job_id}' has no `if:` condition")
    return " ".join(condition.group(1).split())


def evaluate_gate(condition: str, flags: dict, event_name: str) -> bool:
    """Evaluate the narrow subset of GitHub expression syntax used by CI gates.

    Only `&&` over `needs.changes.outputs.X <op> 'v'` and
    `github.event_name <op> 'v'` comparisons. Anything else raises rather than
    guessing, so an unsupported gate fails loudly instead of silently
    evaluating to True and making the caller's assertion vacuous.

    Outputs are strings in Actions, so the booleans are rendered as
    'true'/'false' before comparing.
    """
    body = condition.strip()
    if not (body.startswith("${{") and body.endswith("}}")):
        raise AssertionError(f"unsupported gate: {condition}")
    body = body[3:-2].strip()

    if "||" in body:
        raise AssertionError(f"gate evaluator does not handle `||`: {condition}")

    context = {f"needs.changes.outputs.{k}": str(v).lower() for k, v in flags.items()}
    context["github.event_name"] = event_name

    for clause in body.split("&&"):
        match = re.fullmatch(r"\s*([\w.]+)\s*(==|!=)\s*'([^']*)'\s*", clause)
        if match is None:
            raise AssertionError(f"unsupported clause {clause!r} in {condition}")
        left, operator, expected = match.groups()
        if left not in context:
            raise AssertionError(f"unknown context reference {left!r}")
        actual = context[left]
        if (operator == "==" and actual != expected) or (
            operator == "!=" and actual == expected
        ):
            return False
    return True


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

    # Whitespace-normalised. Asserting the whole expression rather than probing
    # for substrings is what rejects a gate that merely *contains* the right
    # clause: `none != 'true' && docs == 'true'` reintroduces the original bug
    # while satisfying any `assertIn` check.
    EXPECTED_CONDITION = (
        "${{ github.event_name != 'push' "
        "&& needs.changes.outputs.none != 'true' }}"
    )

    def test_guarded_files_classify_as_chat(self):
        """The premise of the bug, not proof of the fix.

        Deliberately does not assert `runtime` is False. Adding these paths to
        RUNTIME_PATTERNS is a strictly safer change that this suite must not
        forbid — the gate below is correct either way.
        """
        detector = load_detector()
        for path in self.GUARDED_BY_CHAT_PROFILE_WIRING:
            with self.subTest(path=path):
                self.assertTrue(detector.classify([path])["chat"])

    def test_job_condition_resolves_the_last_job_in_the_file(self):
        """Job order must not silently break this guard.

        The block regex needs an end-of-file terminator; without one the last
        job reports "not found", so reordering ci.yml would replace a real
        assertion with a misleading error.
        """
        last_job = re.findall(
            r"^  ([\w-]+):$",
            (REPO_ROOT / ".github/workflows/ci.yml").read_text(encoding="utf-8"),
            re.MULTILINE,
        )[-1]
        self.assertIn("${{", job_condition(last_job))

    def test_script_tests_gate_is_exactly_the_expected_expression(self):
        self.assertEqual(job_condition("script-tests"), self.EXPECTED_CONDITION)

    def test_script_tests_still_skips_on_push(self):
        """`full-ci-main` already runs the suite via `make ci` on push.

        Asserted separately because the equality test above would let this
        clause be dropped silently if someone rewrote the expected string.
        """
        self.assertIn("github.event_name != 'push'", job_condition("script-tests"))

    def test_guarded_files_reach_the_script_tests_job(self):
        """The end-to-end claim: detector output must satisfy the job's gate.

        Evaluates the gate against real classifier output rather than checking
        the two halves independently — a gate ANDed with an extra surface flag
        passes both halves separately while still skipping these files.
        """
        detector = load_detector()
        condition = job_condition("script-tests")
        for path in self.GUARDED_BY_CHAT_PROFILE_WIRING:
            with self.subTest(path=path):
                flags = detector.classify([path])
                self.assertTrue(
                    evaluate_gate(condition, flags, event_name="pull_request"),
                    f"{path} classifies as {flags} but the gate skips it",
                )

    def test_gate_evaluator_rejects_a_gate_that_skips_guarded_files(self):
        """Guards the evaluator itself.

        Without this, a helper that returned True unconditionally would make
        the test above pass against any gate at all.
        """
        detector = load_detector()
        flags = detector.classify(["services/chat/Dockerfile"])
        broken = (
            "${{ github.event_name != 'push' "
            "&& needs.changes.outputs.runtime == 'true' }}"
        )
        self.assertFalse(evaluate_gate(broken, flags, event_name="pull_request"))
        self.assertTrue(
            evaluate_gate(self.EXPECTED_CONDITION, flags, event_name="pull_request")
        )


class CiWorkflowWiringTests(unittest.TestCase):
    def test_ci_workflow_captures_dependency_health_artifacts(self):
        content = (REPO_ROOT / ".github/workflows/ci.yml").read_text(encoding="utf-8")
        self.assertIn("Capture dependency health snapshot", content)
        self.assertIn("Capture dependency health snapshot (full profile)", content)
        self.assertIn("e2e-dependencies-health.json", content)
        self.assertIn("e2e-full-dependencies-health.json", content)

    def test_ci_workflow_enforces_full_profile_local_provider_readiness(self):
        content = (REPO_ROOT / ".github/workflows/ci.yml").read_text(encoding="utf-8")
        self.assertIn("Enforce local-provider readiness (full profile)", content)
        self.assertIn("steps.dependencies_health_full.outputs.local_provider_ready", content)
        self.assertIn("Full-profile dependency health gate failed", content)


if __name__ == "__main__":
    unittest.main()
