"""Behavioral coverage for the GCP deployment seeding path."""

import importlib
import importlib.util
import json
import os
import re
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest import mock


REPO_ROOT = Path(__file__).resolve().parents[2]


def load_seed_module():
    script_path = REPO_ROOT / "infrastructure/scripts/seed_gcp_all.py"
    spec = importlib.util.spec_from_file_location("seed_gcp_all", script_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load seed_gcp_all from {script_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


seed_gcp_all = load_seed_module()


def load_product_seed_module():
    script_path = REPO_ROOT / "infrastructure/scripts/seed_gcp_products.py"
    spec = importlib.util.spec_from_file_location("seed_gcp_products", script_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load seed_gcp_products from {script_path}")
    module = importlib.util.module_from_spec(spec)

    discoveryengine = mock.MagicMock()
    api_exceptions = mock.MagicMock()
    language_models = mock.MagicMock()
    google_cloud = mock.MagicMock(discoveryengine_v1=discoveryengine)
    google_api_core = mock.MagicMock(exceptions=api_exceptions)
    vertexai = mock.MagicMock(language_models=language_models)
    import_stubs = {
        "google": mock.MagicMock(cloud=google_cloud, api_core=google_api_core),
        "google.cloud": google_cloud,
        "google.cloud.discoveryengine_v1": discoveryengine,
        "google.api_core": google_api_core,
        "google.api_core.exceptions": api_exceptions,
        "vertexai": vertexai,
        "vertexai.language_models": language_models,
    }

    with mock.patch.dict("sys.modules", import_stubs):
        spec.loader.exec_module(module)
    return module


seed_gcp_products = load_product_seed_module()


def invokes_package_installer(command):
    tokens = [Path(str(token)).name for token in command]
    pip_token = re.compile(r"^pip(?:\d+(?:\.\d+)*)?$")
    return any(pip_token.fullmatch(token) for token in tokens) or any(
        tokens[index : index + 2] == ["uv", "pip"]
        for index in range(len(tokens) - 1)
    )


def run_setup_project(seed_exit_code=None):
    with tempfile.TemporaryDirectory() as temp_dir:
        fixture_root = Path(temp_dir)
        (fixture_root / "infrastructure/terraform").mkdir(parents=True)
        (fixture_root / "services/chat/src/api").mkdir(parents=True)
        (fixture_root / "apps/web/prisma").mkdir(parents=True)
        fake_bin = fixture_root / "fake-bin"
        fake_bin.mkdir()
        venv_bin = fixture_root / ".venv/bin"
        venv_bin.mkdir(parents=True)
        command_log = fixture_root / "commands.log"

        shim = """#!/bin/sh
tool_name=${0##*/}
printf '%s' "$tool_name" >> "$COMMAND_LOG"
printf ' %s' "$@" >> "$COMMAND_LOG"
printf '\\n' >> "$COMMAND_LOG"
if [ "$tool_name" = "curl" ]; then
  printf '404'
elif [ "$tool_name" = "terraform" ] && [ "${1:-}" = "output" ]; then
  printf 'https://example.invalid'
elif [ "$tool_name" = "python" ] && [ "${1:-}" = "infrastructure/scripts/seed_gcp_all.py" ] && [ -n "${SEED_EXIT_CODE:-}" ]; then
  printf 'seed failed: permission denied\\n' >&2
  exit "$SEED_EXIT_CODE"
fi
"""
        for tool in (
            "curl",
            "docker",
            "gcloud",
            "gsutil",
            "make",
            "pip",
            "prisma",
            "python3",
            "terraform",
        ):
            path = fake_bin / tool
            path.write_text(shim, encoding="utf-8")
            path.chmod(0o755)
        venv_python = venv_bin / "python"
        venv_python.write_text(shim, encoding="utf-8")
        venv_python.chmod(0o755)

        env = os.environ.copy()
        env.update(
            {
                "BILLING_ACCOUNT": "000000-000000-000000",
                "COMMAND_LOG": str(command_log),
                "CREATE_DATASTORE": "true",
                "NEXTAUTH_SECRET": "fixture-secret",
                "PATH": f"{fake_bin}:{os.defpath}",
                "PROJECT_ID": "fixture-project",
            }
        )
        if seed_exit_code is not None:
            env["SEED_EXIT_CODE"] = str(seed_exit_code)

        result = subprocess.run(
            ["/bin/bash", str(REPO_ROOT / "infrastructure/scripts/setup_project.sh")],
            cwd=fixture_root,
            env=env,
            capture_output=True,
            text=True,
            check=False,
        )
        commands = command_log.read_text(encoding="utf-8").splitlines()

    return result, commands


class SeedOrchestrationTests(unittest.TestCase):
    def test_main_runs_only_the_gcp_product_seeder(self):
        with (
            mock.patch.object(seed_gcp_all, "check_requirements", return_value=True),
            mock.patch.object(seed_gcp_all, "check_gcp_auth", return_value=True),
            mock.patch.object(seed_gcp_all, "verify_infrastructure", return_value=True),
            mock.patch.object(seed_gcp_all, "run_script", return_value=True) as run_script,
            self.assertRaises(SystemExit) as exit_status,
        ):
            seed_gcp_all.main()

        self.assertEqual(exit_status.exception.code, 0)
        run_script.assert_called_once_with(
            Path(seed_gcp_all.__file__).parent / "seed_gcp_products.py",
            "Product Data Seeding (GCP)",
        )

    def test_main_never_installs_packages_at_runtime(self):
        completed = subprocess.CompletedProcess(args=[], returncode=0, stdout="", stderr="")

        with (
            mock.patch.object(seed_gcp_all, "check_requirements", return_value=True),
            mock.patch.object(seed_gcp_all, "check_gcp_auth", return_value=True),
            mock.patch.object(seed_gcp_all, "verify_infrastructure", return_value=True),
            mock.patch.object(seed_gcp_all, "run_script", return_value=True) as run_script,
            mock.patch.object(importlib, "import_module", side_effect=ImportError),
            mock.patch.object(seed_gcp_all.subprocess, "run", return_value=completed) as run,
            self.assertRaises(SystemExit) as exit_status,
        ):
            seed_gcp_all.main()

        self.assertEqual(exit_status.exception.code, 0)
        self.assertEqual(
            [call.args[1] for call in run_script.call_args_list],
            ["Product Data Seeding (GCP)"],
        )
        commands = [call.args[0] for call in run.call_args_list]
        self.assertFalse(
            any(invokes_package_installer(command) for command in commands),
            f"the seeder launched a package installer: {commands}",
        )


class ProductSeedCatalogTests(unittest.TestCase):
    def test_main_passes_the_checked_in_web_catalog_to_the_seeder(self):
        product = {"id": "fixture-product", "name": "Fixture Product"}

        with tempfile.TemporaryDirectory() as temp_dir:
            fixture_root = Path(temp_dir)
            fixture_script = fixture_root / "infrastructure/scripts/seed_gcp_products.py"
            fixture_script.parent.mkdir(parents=True)
            fixture_script.write_text("# fixture script location\n", encoding="utf-8")
            fixture_catalog = fixture_root / "apps/web/public/products.json"
            fixture_catalog.parent.mkdir(parents=True)
            fixture_catalog.write_text(json.dumps([product]), encoding="utf-8")
            decoy_catalog = fixture_root / "public/products.json"
            decoy_catalog.parent.mkdir(parents=True)
            decoy_catalog.write_text(
                json.dumps([{"id": "decoy", "name": "Wrong catalog"}]),
                encoding="utf-8",
            )

            loaded_catalogs = []

            def seed_products(json_path):
                path = Path(json_path)
                loaded_catalogs.append(
                    (path, json.loads(path.read_text(encoding="utf-8")))
                )
                return True

            seeder = mock.Mock()
            seeder.seed_products.side_effect = seed_products

            with (
                mock.patch.object(seed_gcp_products, "__file__", str(fixture_script)),
                mock.patch.dict(
                    os.environ,
                    {
                        "PROJECT_ID": "fixture-project",
                        "REGION": "us-central1",
                        "DISCOVERY_ENGINE_DATASTORE_ID": "fixture-datastore",
                    },
                    clear=True,
                ),
                mock.patch.object(seed_gcp_products, "ProductSeeder", return_value=seeder),
                self.assertRaises(SystemExit) as exit_status,
            ):
                seed_gcp_products.main()

        self.assertEqual(exit_status.exception.code, 0)
        self.assertEqual(loaded_catalogs, [(fixture_catalog, [product])])


class SetupProjectSeedTests(unittest.TestCase):
    def test_setup_uses_the_project_venv_and_constraints(self):
        result, commands = run_setup_project()

        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("make venv", commands)
        stale_package_removal = "python -m pip uninstall --yes vertexai"
        constrained_install = (
            "python -m pip install -r services/chat/src/api/requirements-core.txt "
            "-c services/chat/constraints.txt"
        )
        self.assertEqual(commands.count(stale_package_removal), 1)
        self.assertEqual(commands.count(constrained_install), 1)
        self.assertLess(
            commands.index(stale_package_removal),
            commands.index(constrained_install),
        )
        self.assertEqual(
            commands.count("python infrastructure/scripts/seed_gcp_all.py"),
            1,
        )
        self.assertFalse(any(command.startswith("prisma ") for command in commands), commands)
        self.assertFalse(any(command.startswith("pip ") for command in commands), commands)
        self.assertFalse(any(command.startswith("python3 ") for command in commands), commands)

    def test_setup_propagates_the_seed_failure_without_guessing_its_cause(self):
        result, _commands = run_setup_project(seed_exit_code=23)
        output = result.stdout + result.stderr

        self.assertEqual(result.returncode, 23)
        self.assertIn("seed failed: permission denied", result.stderr)
        self.assertNotIn("likely because Discovery Engine DataStore", output)
        self.assertNotIn("Project setup and deployment complete", output)


if __name__ == "__main__":
    unittest.main()
