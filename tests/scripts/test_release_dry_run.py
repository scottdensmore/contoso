import importlib.util
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


release_dry_run = load_script_module(
    "release_dry_run",
    REPO_ROOT / "scripts/release_dry_run.py",
)


class ReleaseDryRunTests(unittest.TestCase):
    def test_validate_tag_accepts_semver_tag(self):
        self.assertEqual(release_dry_run.validate_tag("v1.2.3"), [])
        self.assertEqual(release_dry_run.validate_tag("v1.2.3-rc.1"), [])

    def test_validate_tag_rejects_invalid_tag(self):
        errors = release_dry_run.validate_tag("1.2.3")
        self.assertTrue(any("invalid" in error for error in errors))

    def test_validate_required_files_reports_missing(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            with patch.object(release_dry_run, "ROOT", root):
                errors = release_dry_run.validate_required_files()
        self.assertGreater(len(errors), 0)
        self.assertTrue(any("Missing" in error for error in errors))

    def test_validate_required_files_passes_with_all_expected_files(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            for relative_path, _ in release_dry_run.REQUIRED_FILES:
                path = root / relative_path
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text("# placeholder\n", encoding="utf-8")

            with patch.object(release_dry_run, "ROOT", root):
                errors = release_dry_run.validate_required_files()

        self.assertEqual(errors, [])


if __name__ == "__main__":
    unittest.main()
