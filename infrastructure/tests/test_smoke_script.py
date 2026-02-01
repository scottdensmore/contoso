import subprocess
import pytest
import os

def test_smoke_script_syntax():
    """Verify that the smoke test script is syntactically correct."""
    result = subprocess.run(
        ["python3", "-m", "py_compile", "infrastructure/scripts/test_deployment.py"],
        capture_output=True,
        text=True
    )
    assert result.returncode == 0, f"Syntax error in test_deployment.py: {result.stderr}"

def test_smoke_script_fails_without_env():
    """Verify that the script fails if required env vars are missing."""
    env = os.environ.copy()
    # Remove relevant env vars
    for var in ["PROJECT_ID", "WEB_APP_URL", "CHAT_SERVICE_URL"]:
        if var in env:
            del env[var]
            
    # The script should exit with 1 if it can't verify anything
    result = subprocess.run(
        ["python3", "infrastructure/scripts/test_deployment.py"],
        env=env,
        capture_output=True,
        text=True
    )
    assert result.returncode == 1
    assert "No environment variables provided for testing" in result.stderr
