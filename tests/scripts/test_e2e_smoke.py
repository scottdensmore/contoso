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


e2e_smoke = load_script_module(
    "e2e_smoke",
    REPO_ROOT / "scripts/e2e_smoke.py",
)


class E2ESmokeTests(unittest.TestCase):
    def test_response_has_answer(self):
        self.assertTrue(e2e_smoke.response_has_answer({"answer": "hello"}))
        self.assertTrue(e2e_smoke.response_has_answer({"response": "hello"}))
        self.assertFalse(e2e_smoke.response_has_answer({"answer": "   "}))

    def test_dependencies_db_connected(self):
        self.assertTrue(e2e_smoke.dependencies_db_connected({"database": {"connected": True}}))
        self.assertFalse(e2e_smoke.dependencies_db_connected({"database": {"connected": False}}))

    def test_check_web_chat_proxy_passes(self):
        with patch.object(
            e2e_smoke,
            "request_json",
            return_value=(200, {"answer": "ok"}, '{"answer":"ok"}'),
        ):
            e2e_smoke.check_web_chat_proxy("http://localhost:3000")

    def test_check_web_chat_proxy_fails_without_answer(self):
        with patch.object(
            e2e_smoke,
            "request_json",
            return_value=(200, {"message": "missing answer"}, '{"message":"missing answer"}'),
        ):
            with self.assertRaises(RuntimeError):
                e2e_smoke.check_web_chat_proxy("http://localhost:3000")


if __name__ == "__main__":
    unittest.main()
