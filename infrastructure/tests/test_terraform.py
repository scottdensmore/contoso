import subprocess
import os
import pytest

def test_terraform_validate():
    """Verify that terraform configuration is syntactically correct."""
    # Ensure initialized (backend=false is fine for validation)
    subprocess.run(
        ["terraform", "init", "-backend=false"],
        cwd="infrastructure/terraform",
        capture_output=True,
        text=True
    )
    result = subprocess.run(
        ["terraform", "validate"],
        cwd="infrastructure/terraform",
        capture_output=True,
        text=True
    )
    assert result.returncode == 0, f"Terraform validation failed: {result.stderr}"
