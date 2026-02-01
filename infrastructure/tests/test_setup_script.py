import subprocess
import os
import pytest

def test_setup_script_syntax():
    """Check syntax of the setup script."""
    result = subprocess.run(
        ["bash", "-n", "infrastructure/scripts/setup_project.sh"],
        capture_output=True,
        text=True
    )
    assert result.returncode == 0, f"Syntax error in setup_project.sh: {result.stderr}"

def test_setup_script_preflight_fails_without_secret():
    """Verify that the script fails if NEXTAUTH_SECRET is not set."""
    env = os.environ.copy()
    if "NEXTAUTH_SECRET" in env:
        del env["NEXTAUTH_SECRET"]
    
    # We expect this to fail during pre-flight check
    result = subprocess.run(
        ["bash", "infrastructure/scripts/setup_project.sh"],
        env=env,
        capture_output=True,
        text=True
    )
    assert result.returncode != 0
    assert "Error: Please set the NEXTAUTH_SECRET environment variable." in result.stdout or "Error: Please set the NEXTAUTH_SECRET environment variable." in result.stderr
