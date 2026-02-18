import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]


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
