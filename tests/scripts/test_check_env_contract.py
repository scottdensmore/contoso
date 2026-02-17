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


check_env_contract = load_script_module(
    "check_env_contract",
    REPO_ROOT / "scripts/check_env_contract.py",
)


class CheckEnvContractTests(unittest.TestCase):
    def test_parse_env_template_keys(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            template = Path(temp_dir) / ".env.example"
            template.write_text(
                "\n".join(
                    [
                        "# comment",
                        "export DATABASE_URL=postgres://localhost:5432/test",
                        "NEXTAUTH_SECRET='secret'",
                        "EMPTY_VALUE=",
                        "NOT_A_VAR_LINE",
                    ],
                ),
                encoding="utf-8",
            )
            keys = check_env_contract.parse_env_template_keys(template)

        self.assertEqual(keys, {"DATABASE_URL", "NEXTAUTH_SECRET", "EMPTY_VALUE"})

    def test_validate_contract_shape_reports_duplicates_and_invalid_keys(self):
        contract = {
            "docs_path": "docs/ENV_CONTRACT.md",
            "environments": [
                {
                    "name": "root",
                    "template_path": ".env.example",
                    "docs_marker": "ROOT_REQUIRED_KEYS",
                    "required_keys": ["DATABASE_URL", "DATABASE_URL", "bad-key", 42],
                }
            ],
        }
        errors = check_env_contract.validate_contract_shape(contract)
        combined = "\n".join(errors)
        self.assertIn("contains duplicates", combined)
        self.assertIn("invalid key", combined)

    def test_check_drift_passes_when_docs_and_templates_match(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            (root / "docs").mkdir(parents=True, exist_ok=True)
            (root / ".env.example").write_text(
                "DATABASE_URL=postgres://localhost\nNEXTAUTH_SECRET=abc\n",
                encoding="utf-8",
            )
            (root / "docs/ENV_CONTRACT.md").write_text(
                "\n".join(
                    [
                        "# Env Contract",
                        "<!-- BEGIN:ROOT_REQUIRED_KEYS -->",
                        "- `DATABASE_URL`",
                        "- `NEXTAUTH_SECRET`",
                        "<!-- END:ROOT_REQUIRED_KEYS -->",
                    ],
                ),
                encoding="utf-8",
            )

            contract = {
                "docs_path": "docs/ENV_CONTRACT.md",
                "environments": [
                    {
                        "name": "root",
                        "template_path": ".env.example",
                        "docs_marker": "ROOT_REQUIRED_KEYS",
                        "required_keys": ["DATABASE_URL", "NEXTAUTH_SECRET"],
                    }
                ],
            }

            with patch.object(check_env_contract, "ROOT", root):
                errors = check_env_contract.check_drift(contract)

        self.assertEqual(errors, [])

    def test_check_drift_reports_out_of_order_doc_keys(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            (root / "docs").mkdir(parents=True, exist_ok=True)
            (root / ".env.example").write_text(
                "DATABASE_URL=postgres://localhost\nNEXTAUTH_SECRET=abc\n",
                encoding="utf-8",
            )
            (root / "docs/ENV_CONTRACT.md").write_text(
                "\n".join(
                    [
                        "# Env Contract",
                        "<!-- BEGIN:ROOT_REQUIRED_KEYS -->",
                        "- `NEXTAUTH_SECRET`",
                        "- `DATABASE_URL`",
                        "<!-- END:ROOT_REQUIRED_KEYS -->",
                    ],
                ),
                encoding="utf-8",
            )

            contract = {
                "docs_path": "docs/ENV_CONTRACT.md",
                "environments": [
                    {
                        "name": "root",
                        "template_path": ".env.example",
                        "docs_marker": "ROOT_REQUIRED_KEYS",
                        "required_keys": ["DATABASE_URL", "NEXTAUTH_SECRET"],
                    }
                ],
            }

            with patch.object(check_env_contract, "ROOT", root):
                errors = check_env_contract.check_drift(contract)

        self.assertTrue(any("out of order" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
