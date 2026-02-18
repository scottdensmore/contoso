import importlib.util
import json
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
        self.assertIn("$(CHAT_MAKE) setup CHAT_SETUP_PROFILE=$(CHAT_SETUP_PROFILE)", content)
        self.assertIn("e2e-smoke-full:", content)

    def test_package_json_exposes_full_profile_scripts(self):
        package = json.loads((REPO_ROOT / "package.json").read_text(encoding="utf-8"))
        scripts = package["scripts"]
        self.assertEqual(scripts.get("setup:chat:full"), "make -C services/chat setup-full")
        self.assertEqual(scripts.get("e2e:smoke:full"), "make e2e-smoke-full")


if __name__ == "__main__":
    unittest.main()
