import importlib.util
import json
import re
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]


def load_script_module(module_name: str, file_path: Path):
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load module {module_name} from {file_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


detect_changed = load_script_module(
    "detect_changed_surfaces",
    REPO_ROOT / "scripts/detect_changed_surfaces.py",
)
dependency_policy = load_script_module(
    "chat_dependency_policy",
    REPO_ROOT / "services/chat/scripts/check_dependency_policy.py",
)


class ChatProfileWiringTests(unittest.TestCase):
    def test_changed_surfaces_marks_split_chat_manifests_as_runtime(self):
        for path in (
            "services/chat/src/api/requirements-core.txt",
            "services/chat/src/api/requirements-local.txt",
        ):
            with self.subTest(path=path):
                flags = detect_changed.classify([path])
                self.assertTrue(flags["runtime"])

    def test_dependency_policy_targets_split_requirement_files(self):
        files = tuple(str(path) for path in dependency_policy.REQUIREMENT_FILES)
        self.assertIn("src/api/requirements-core.txt", files)
        self.assertIn("src/api/requirements-local.txt", files)
        self.assertNotIn("src/api/requirements.txt", files)

    def test_requirement_manifests_carry_no_inline_pins(self):
        """Versions live only in constraints.txt, so Dependabot has one place to edit."""
        chat_root = REPO_ROOT / "services/chat"
        for relative in dependency_policy.REQUIREMENT_FILES:
            manifest = chat_root / relative
            with self.subTest(manifest=str(relative)):
                for line_no, raw in enumerate(
                    manifest.read_text(encoding="utf-8").splitlines(), start=1
                ):
                    line = raw.split("#", 1)[0].strip()
                    if not line:
                        continue
                    self.assertNotIn(
                        "==",
                        line,
                        msg=(
                            f"{relative}:{line_no} pins a version inline; "
                            "pin it in constraints.txt instead"
                        ),
                    )

    def test_dependency_policy_rejects_inline_pins(self):
        constraints = {"python-dotenv": "1.0.1"}
        with tempfile.TemporaryDirectory() as temp_dir:
            manifest = Path(temp_dir) / "requirements-core.txt"

            manifest.write_text("python-dotenv\n", encoding="utf-8")
            self.assertEqual(
                dependency_policy.check_requirements((manifest,), constraints),
                [],
            )

            # This is the exact shape that broke PR #33: a manifest pin that
            # disagrees with constraints.txt, which pip cannot resolve.
            manifest.write_text("python-dotenv==1.2.2\n", encoding="utf-8")
            errors = dependency_policy.check_requirements((manifest,), constraints)

        self.assertTrue(any("bare package names" in error for error in errors))

    def test_dependabot_groups_keep_package_families_together(self):
        # Asserted as text rather than parsed YAML: this suite runs in a bare
        # venv without the chat dependencies, so PyYAML is not available.
        content = (REPO_ROOT / ".github/dependabot.yml").read_text(encoding="utf-8")

        ecosystems = re.findall(r"^\s*- package-ecosystem:", content, re.M)
        self.assertEqual(len(ecosystems), content.count("    groups:"))

        # opentelemetry-sdk moving without opentelemetry-api is what broke #6.
        self.assertEqual(content.count('- "opentelemetry-*"'), 3)
        for pattern in ('- "google-cloud-*"', '- "pytest-*"', '- "eslint-*"', '- "@prisma/*"'):
            with self.subTest(pattern=pattern):
                self.assertIn(pattern, content)

    def test_chat_makefile_exposes_profile_setup_targets(self):
        content = (REPO_ROOT / "services/chat/Makefile").read_text(encoding="utf-8")
        self.assertIn("CHAT_SETUP_PROFILE ?= core", content)
        self.assertIn("setup-core:", content)
        self.assertIn("setup-full:", content)
        self.assertIn("requirements-core.txt", content)
        self.assertIn("requirements-local.txt", content)
        self.assertNotIn("REQ_FILE := $(API_DIR)/requirements.txt", content)

    def test_root_makefile_wires_chat_setup_profile(self):
        content = (REPO_ROOT / "Makefile").read_text(encoding="utf-8")
        self.assertIn("CHAT_SETUP_PROFILE ?= core", content)
        self.assertIn("setup-chat-full:", content)
        self.assertIn("local-provider-check:", content)
        self.assertIn("diagnose-chat-local:", content)
        self.assertIn("$(CHAT_MAKE) diagnose-chat-local", content)
        self.assertIn("$(CHAT_MAKE) local-provider-check", content)
        self.assertIn("$(CHAT_MAKE) setup CHAT_SETUP_PROFILE=$(CHAT_SETUP_PROFILE)", content)
        self.assertIn("e2e-smoke-full:", content)

    def test_package_json_exposes_full_profile_scripts(self):
        package = json.loads((REPO_ROOT / "package.json").read_text(encoding="utf-8"))
        scripts = package["scripts"]
        self.assertEqual(scripts.get("setup:chat:full"), "make -C services/chat setup-full")
        self.assertEqual(scripts.get("e2e:smoke:full"), "make e2e-smoke-full")
        self.assertEqual(scripts.get("local-provider-check"), "make local-provider-check")
        self.assertEqual(scripts.get("diagnose:chat:local"), "make diagnose-chat-local")

    def test_chat_entrypoint_guards_local_indexing_dependencies(self):
        content = (REPO_ROOT / "services/chat/src/api/chat-entrypoint.sh").read_text(encoding="utf-8")
        self.assertIn('provider="${LLM_PROVIDER:-gcp}"', content)
        self.assertIn('if [[ "${provider}" == "local" ]]; then', content)
        self.assertIn("python3 local_provider_health.py", content)
        self.assertIn("Running local-provider preflight...", content)
        self.assertIn("ollama pull \\${LOCAL_MODEL_NAME:-gemma3:12b}", content)
        self.assertIn("Running local product indexing for vector search...", content)

    def test_chat_makefile_exposes_local_provider_check_target(self):
        content = (REPO_ROOT / "services/chat/Makefile").read_text(encoding="utf-8")
        self.assertIn("local-provider-check:", content)
        self.assertIn("diagnose-chat-local:", content)
        self.assertIn("local_provider_health.py --json", content)

    def test_chat_dockerfile_copies_local_provider_health_module(self):
        content = (REPO_ROOT / "services/chat/Dockerfile").read_text(encoding="utf-8")
        self.assertIn("local_provider_health.py local_provider_health.py", content)

    def test_env_templates_document_correct_ollama_base_urls(self):
        root_env = (REPO_ROOT / ".env.example").read_text(encoding="utf-8")
        chat_env = (REPO_ROOT / "services/chat/.env.example").read_text(encoding="utf-8")
        self.assertIn("OLLAMA_BASE_URL=http://host.docker.internal:11434", root_env)
        self.assertIn("OLLAMA_BASE_URL=http://localhost:11434", chat_env)


if __name__ == "__main__":
    unittest.main()
