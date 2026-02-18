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


detect_changed = load_script_module(
    "detect_changed_surfaces",
    REPO_ROOT / "scripts/detect_changed_surfaces.py",
)


class DetectChangedSurfacesTests(unittest.TestCase):
    def test_path_matches_directory_glob(self):
        self.assertTrue(
            detect_changed.path_matches("apps/web/**", "apps/web/src/app/page.tsx"),
        )

    def test_unknown_paths_force_runtime(self):
        flags = detect_changed.classify(["some/new/area/file.txt"])
        self.assertTrue(flags["unknown"])
        self.assertTrue(flags["runtime"])

    def test_recommended_targets_runtime_includes_script_tests(self):
        flags = {
            "runtime": True,
            "web": False,
            "chat": False,
            "docs": False,
            "unknown": False,
            "none": False,
        }
        self.assertEqual(
            detect_changed.recommended_targets(flags),
            [
                "toolchain-doctor",
                "env-contract-check",
                "test-scripts",
                "quick-ci-web",
                "quick-ci-chat",
            ],
        )

    def test_recommended_targets_docs_only(self):
        flags = {
            "runtime": False,
            "web": False,
            "chat": False,
            "docs": True,
            "unknown": False,
            "none": False,
        }
        self.assertEqual(detect_changed.recommended_targets(flags), ["docs-check"])

    def test_split_chat_requirement_paths_are_runtime(self):
        for path in (
            "services/chat/src/api/requirements-core.txt",
            "services/chat/src/api/requirements-local.txt",
        ):
            with self.subTest(path=path):
                flags = detect_changed.classify([path])
                self.assertTrue(flags["runtime"])

    def test_changed_files_from_worktree_parses_porcelain(self):
        porcelain = "\n".join(
            [
                " M Makefile",
                "R  old/path.py -> scripts/new_path.py",
                "?? tests/scripts/test_new.py",
            ],
        )

        with patch.object(detect_changed, "run_git", return_value=porcelain):
            files = detect_changed.changed_files_from_worktree()

        self.assertEqual(
            files,
            [
                "Makefile",
                "scripts/new_path.py",
                "tests/scripts/test_new.py",
            ],
        )


if __name__ == "__main__":
    unittest.main()
