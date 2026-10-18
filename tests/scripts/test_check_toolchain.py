"""CI's explicit interpreter mode must never start a tool manager."""

import contextlib
import importlib.util
import io
import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch


def load_checker():
    spec = importlib.util.spec_from_file_location(
        "check_toolchain", Path(__file__).resolve().parents[2] / "scripts/check_toolchain.py"
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class ExplicitInterpreterTests(unittest.TestCase):
    def check(self, version, expected_status):
        checker = load_checker()
        commands = []

        def run(command):
            commands.append(command)
            if command == ["node", "--version"]:
                return "v22.23.2"
            if command == [sys.executable, "--version"]:
                return version
            self.fail(f"Unexpected command: {command}")

        with (
            patch.dict(os.environ, {"TOOLCHAIN_CHECK_ALLOW_NON_MISE": "1"}),
            patch.object(checker, "run", side_effect=run),
            patch.object(checker, "VENV_PYTHON", Path("/nonexistent/contoso-test-venv")),
            contextlib.redirect_stdout(io.StringIO()),
        ):
            self.assertEqual(checker.main(), expected_status)
        self.assertEqual(commands, [["node", "--version"], [sys.executable, "--version"]])

    def test_selected_python_311_passes_without_mise(self):
        self.check("Python 3.11.17", 0)

    def test_wrong_selected_python_is_rejected_without_mise(self):
        self.check("Python 3.14.8", 1)

    def test_unparseable_selected_python_is_rejected_without_mise(self):
        self.check("not a Python version", 1)


if __name__ == "__main__":
    unittest.main()
