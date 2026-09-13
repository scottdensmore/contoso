"""Guard the chat service dependency policy checker and transitive dependency rules.

Guards:
- Issue #118: check_service_imports_are_declared catches third-party imports
  that have no manifest entry, preventing unmanifested transitive imports from
  slipping into service source code.
- Issue #312: google-cloud-storage transitive dependency from google-cloud-aiplatform
  satisfies >= 3.0.0, and policy notes document this relationship.
"""

from __future__ import annotations

import importlib.metadata
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


dependency_policy = load_script_module(
    "check_dependency_policy",
    REPO_ROOT / "services/chat/scripts/check_dependency_policy.py",
)


class CheckDependencyPolicyTests(unittest.TestCase):
    def test_current_chat_service_imports_are_declared(self):
        """Current chat API source files must not contain any undeclared imports."""
        chat_dir = REPO_ROOT / "services/chat"
        req_files = tuple(chat_dir / p for p in dependency_policy.REQUIREMENT_FILES)
        constraints, constraint_errors = dependency_policy.load_constraints(
            chat_dir / dependency_policy.CONSTRAINTS_FILE
        )
        self.assertEqual(constraint_errors, [])

        errors = dependency_policy.check_service_imports_are_declared(
            chat_dir / dependency_policy.SERVICE_SOURCE_DIR,
            req_files,
            constraints,
        )
        self.assertEqual(errors, [])

    def test_flag_undeclared_direct_import(self):
        """Direct imports of undeclared third-party packages must be flagged."""
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            src_dir = tmp_path / "src"
            src_dir.mkdir()
            (src_dir / "service.py").write_text(
                "import httpx\n",
                encoding="utf-8",
            )
            req_file = tmp_path / "requirements.txt"
            req_file.write_text("fastapi\n", encoding="utf-8")

            errors = dependency_policy.check_service_imports_are_declared(
                src_dir,
                (req_file,),
            )
            self.assertEqual(len(errors), 1)
            self.assertIn("undeclared dependency 'httpx'", errors[0])
            self.assertIn("service.py:1", errors[0])

    def test_flag_undeclared_from_import_with_mapping(self):
        """From-imports mapping to a different distribution name must be flagged."""
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            src_dir = tmp_path / "src"
            src_dir.mkdir()
            (src_dir / "service.py").write_text(
                "from yaml import safe_load\n",
                encoding="utf-8",
            )
            req_file = tmp_path / "requirements.txt"
            req_file.write_text("fastapi\n", encoding="utf-8")

            errors = dependency_policy.check_service_imports_are_declared(
                src_dir,
                (req_file,),
            )
            self.assertEqual(len(errors), 1)
            self.assertIn("undeclared dependency 'pyyaml'", errors[0])
            self.assertIn("imported as 'yaml'", errors[0])

    def test_mapped_distribution_names_pass_when_declared(self):
        """Mapped distribution names (e.g. dotenv -> python-dotenv) pass when declared."""
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            src_dir = tmp_path / "src"
            src_dir.mkdir()
            (src_dir / "service.py").write_text(
                "import dotenv\nimport vertexai\nfrom opentelemetry import trace\n",
                encoding="utf-8",
            )
            req_file = tmp_path / "requirements.txt"
            req_file.write_text(
                "python-dotenv\ngoogle-cloud-aiplatform\nopentelemetry-api\n",
                encoding="utf-8",
            )

            errors = dependency_policy.check_service_imports_are_declared(
                src_dir,
                (req_file,),
            )
            self.assertEqual(errors, [])

    def test_stdlib_imports_ignored(self):
        """Standard library modules must not be treated as third-party packages."""
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            src_dir = tmp_path / "src"
            src_dir.mkdir()
            (src_dir / "service.py").write_text(
                (
                    "import asyncio\n"
                    "import json\n"
                    "import os\n"
                    "import sys\n"
                    "from pathlib import Path\n"
                    "from typing import Any\n"
                    "from contextlib import asynccontextmanager\n"
                ),
                encoding="utf-8",
            )
            req_file = tmp_path / "requirements.txt"
            req_file.write_text("", encoding="utf-8")

            errors = dependency_policy.check_service_imports_are_declared(
                src_dir,
                (req_file,),
            )
            self.assertEqual(errors, [])

    def test_first_party_imports_ignored(self):
        """Local files and subpackages in the service directory must be ignored."""
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            src_dir = tmp_path / "src"
            src_dir.mkdir()
            (src_dir / "db.py").write_text("def get_conn(): pass\n", encoding="utf-8")
            sub_dir = src_dir / "subpkg"
            sub_dir.mkdir()
            (sub_dir / "__init__.py").write_text("", encoding="utf-8")
            (sub_dir / "helper.py").write_text("def help(): pass\n", encoding="utf-8")

            (src_dir / "main.py").write_text(
                (
                    "import db\n"
                    "from subpkg import helper\n"
                    "from contoso_chat.chat_request import get_chat_response\n"
                    "from local_provider_health import check_local_provider\n"
                    "from tracing import init_tracing\n"
                ),
                encoding="utf-8",
            )
            req_file = tmp_path / "requirements.txt"
            req_file.write_text("", encoding="utf-8")

            errors = dependency_policy.check_service_imports_are_declared(
                src_dir,
                (req_file,),
            )
            self.assertEqual(errors, [])

    def test_relative_imports_ignored(self):
        """Relative imports (from . / from ..) must not be flagged."""
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            src_dir = tmp_path / "src"
            src_dir.mkdir()
            (src_dir / "service.py").write_text(
                "from . import db\nfrom ..utils import helper\n",
                encoding="utf-8",
            )
            req_file = tmp_path / "requirements.txt"
            req_file.write_text("", encoding="utf-8")

            errors = dependency_policy.check_service_imports_are_declared(
                src_dir,
                (req_file,),
            )
            self.assertEqual(errors, [])

    def test_test_files_in_source_dir_excluded(self):
        """Test files inside source directories must be excluded from inspection."""
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp_path = Path(tmp_dir)
            src_dir = tmp_path / "src"
            src_dir.mkdir()
            (src_dir / "test_api.py").write_text("import undeclared_dep\n", encoding="utf-8")
            (src_dir / "api_test.py").write_text("import undeclared_dep\n", encoding="utf-8")
            tests_sub = src_dir / "tests"
            tests_sub.mkdir()
            (tests_sub / "helper.py").write_text("import undeclared_dep\n", encoding="utf-8")

            req_file = tmp_path / "requirements.txt"
            req_file.write_text("", encoding="utf-8")

            errors = dependency_policy.check_service_imports_are_declared(
                src_dir,
                (req_file,),
            )
            self.assertEqual(errors, [])

    def test_google_cloud_storage_satisfied_by_aiplatform(self):
        """Issue #312: aiplatform 2.1.0 pins require google-cloud-storage >= 3.0.0."""
        constraints_path = REPO_ROOT / "services/chat/constraints.txt"
        constraints_text = constraints_path.read_text(encoding="utf-8")
        self.assertIn("google-cloud-aiplatform==2.1.0", constraints_text)

        # Verify policy documentation mentions Issue #312 and google-cloud-storage
        req_core_path = REPO_ROOT / "services/chat/src/api/requirements-core.txt"
        req_core_text = req_core_path.read_text(encoding="utf-8")
        self.assertIn("#312", req_core_text)
        self.assertIn("google-cloud-storage", req_core_text)

        policy_script_path = REPO_ROOT / "services/chat/scripts/check_dependency_policy.py"
        policy_script_text = policy_script_path.read_text(encoding="utf-8")
        self.assertIn("#312", policy_script_text)
        self.assertIn("google-cloud-storage", policy_script_text)

        # Verify installed google-cloud-storage is >= 3.0.0 if installed in env or .venv
        storage_version: str | None = None
        try:
            storage_version = importlib.metadata.version("google-cloud-storage")
        except importlib.metadata.PackageNotFoundError:
            venv_paths = [str(p) for p in REPO_ROOT.glob(".venv/lib/python*/site-packages")]
            if venv_paths:
                for dist in importlib.metadata.distributions(path=venv_paths):
                    if dist.metadata.get("Name") == "google-cloud-storage":
                        storage_version = dist.version
                        break

        if storage_version is not None:
            major_version = int(storage_version.split(".")[0])
            self.assertGreaterEqual(
                major_version,
                3,
                f"Expected google-cloud-storage >= 3.0.0, got {storage_version}",
            )
            self.assertEqual(storage_version, "3.1.0")

    def test_dependency_policy_script_main_passes(self):
        """The full check_dependency_policy script should exit with 0 on the repo."""
        self.assertEqual(dependency_policy.main(), 0)


if __name__ == "__main__":
    unittest.main()
