import subprocess
import pytest

def test_simulate_ci_syntax():
    """Verify that the CI simulation script is syntactically correct."""
    result = subprocess.run(
        ["bash", "-n", "infrastructure/scripts/simulate_ci.sh"],
        capture_output=True,
        text=True
    )
    assert result.returncode == 0, f"Syntax error in simulate_ci.sh: {result.stderr}"
