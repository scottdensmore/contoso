import importlib.util
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


verify_docs = load_script_module(
    "verify_docs",
    REPO_ROOT / "scripts/verify_docs.py",
)


class VerifyDocsTests(unittest.TestCase):
    def test_check_markdown_files_validates_docs_and_runbooks(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            docs_dir = root / "docs"
            docs_dir.mkdir(parents=True, exist_ok=True)
            (docs_dir / "DATABASE.md").write_text("[Infra](./INFRASTRUCTURE.md)\n", encoding="utf-8")
            (docs_dir / "INFRASTRUCTURE.md").write_text("# Infra\n", encoding="utf-8")

            readme = root / "README.md"
            agents = root / "AGENTS.md"
            contributing = root / "CONTRIBUTING.md"
            readme.write_text("[Docs](./docs/DATABASE.md)\n", encoding="utf-8")
            agents.write_text("[Guide](./README.md)\n", encoding="utf-8")
            contributing.write_text("[Agent](./AGENTS.md)\n", encoding="utf-8")

            errors = verify_docs.check_markdown_files(
                docs_dir=docs_dir,
                root_runbooks=(readme, agents, contributing),
            )

        self.assertEqual(errors, [])

    def test_check_markdown_files_reports_broken_runbook_links(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            docs_dir = root / "docs"
            docs_dir.mkdir(parents=True, exist_ok=True)
            (docs_dir / "DATABASE.md").write_text("# Database\n", encoding="utf-8")

            readme = root / "README.md"
            agents = root / "AGENTS.md"
            contributing = root / "CONTRIBUTING.md"
            readme.write_text("[Missing](./docs/MISSING.md)\n", encoding="utf-8")
            agents.write_text("# Agents\n", encoding="utf-8")
            contributing.write_text("# Contributing\n", encoding="utf-8")

            errors = verify_docs.check_markdown_files(
                docs_dir=docs_dir,
                root_runbooks=(readme, agents, contributing),
            )

        self.assertTrue(any("Broken link in" in error and "README.md" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
