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


ci_smoke_metrics = load_script_module(
    "ci_smoke_metrics",
    REPO_ROOT / "scripts/ci_smoke_metrics.py",
)


class CiSmokeMetricsTests(unittest.TestCase):
    def test_parse_metrics_file_handles_key_values(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            metrics_path = Path(tmp_dir) / "metrics.txt"
            metrics_path.write_text(
                "duration_seconds=33\nchat_image_bytes=100\nweb_image_bytes=200\n",
                encoding="utf-8",
            )
            metrics = ci_smoke_metrics.parse_metrics_file(metrics_path)
            self.assertEqual(metrics["duration_seconds"], "33")
            self.assertEqual(metrics["chat_image_bytes"], "100")
            self.assertEqual(metrics["web_image_bytes"], "200")

    def test_detect_regressions_flags_large_duration_growth(self):
        current = {
            "duration_seconds": 200,
            "chat_image_bytes": 500_000_000,
            "web_image_bytes": 1_000_000_000,
        }
        previous = {
            "duration_seconds": 120,
            "chat_image_bytes": 450_000_000,
            "web_image_bytes": 990_000_000,
        }
        regressions = ci_smoke_metrics.detect_regressions(current, previous)
        self.assertTrue(any("duration increased" in message for message in regressions))

    def test_detect_regressions_ignores_small_changes(self):
        current = {
            "duration_seconds": 130,
            "chat_image_bytes": 520_000_000,
            "web_image_bytes": 1_050_000_000,
        }
        previous = {
            "duration_seconds": 120,
            "chat_image_bytes": 500_000_000,
            "web_image_bytes": 1_000_000_000,
        }
        regressions = ci_smoke_metrics.detect_regressions(current, previous)
        self.assertEqual(regressions, [])

    def test_main_writes_summary_history_and_outputs(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            tmp = Path(tmp_dir)
            metrics_path = tmp / "metrics.txt"
            history_path = tmp / "history.json"
            summary_path = tmp / "summary.md"
            output_path = tmp / "output.txt"

            metrics_path.write_text(
                "duration_seconds=300\nchat_image_bytes=800000000\nweb_image_bytes=1200000000\n",
                encoding="utf-8",
            )
            history_path.write_text(
                '[{"run_id":"prev","status":"success","duration_seconds":100,'
                '"chat_image_bytes":500000000,"web_image_bytes":1000000000}]',
                encoding="utf-8",
            )

            argv = [
                "--profile",
                "full",
                "--metrics-file",
                str(metrics_path),
                "--history-file",
                str(history_path),
                "--summary-file",
                str(summary_path),
                "--run-id",
                "123",
                "--sha",
                "abc123",
                "--status",
                "success",
                "--budget-failed",
                "0",
                "--github-output",
                str(output_path),
                "--timestamp",
                "2026-02-18T00:00:00+00:00",
            ]

            from unittest.mock import patch

            with patch("sys.argv", ["ci_smoke_metrics.py", *argv]):
                exit_code = ci_smoke_metrics.main()

            self.assertEqual(exit_code, 0)
            self.assertTrue(summary_path.exists())
            self.assertIn("Regression Signals", summary_path.read_text(encoding="utf-8"))
            history = ci_smoke_metrics.load_history(history_path)
            self.assertEqual(len(history), 2)
            output = output_path.read_text(encoding="utf-8")
            self.assertIn("regression_detected=true", output)


if __name__ == "__main__":
    unittest.main()
