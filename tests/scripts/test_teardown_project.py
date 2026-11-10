"""Run teardown against isolated command doubles, never real cloud resources."""

import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SCRIPT = REPO_ROOT / "infrastructure/scripts/teardown_project.sh"
STATE_DELETE = "gsutil -m rm -r gs://fixture-project-tf-state"
DEPLOYER_DELETE = (
    "gcloud iam service-accounts delete "
    "terraform-deployer@fixture-project.iam.gserviceaccount.com --quiet"
)

SHIM = r'''#!/bin/bash
tool=${0##*/}
printf '%s' "$tool" >> "$COMMAND_LOG"
printf ' %s' "$@" >> "$COMMAND_LOG"
printf '\n' >> "$COMMAND_LOG"
case "$tool $*" in
  "gcloud projects describe "*|"gcloud config set project "*) exit 0 ;;
  "gcloud auth print-access-token") printf 'fixture-token'; exit 0 ;;
  "gcloud "*" list "*)
    if [ -n "${LOOKUP_FAILURE:-}" ] && [[ "$*" == "${LOOKUP_FAILURE}"* ]]; then
      echo 'fixture: permission denied' >&2
      exit 1
    fi
    case "$*" in
      "services vpc-peerings list "*)
        [ "${PEERING_FAILURE:-0}" != 1 ] || echo 'services/servicenetworking.googleapis.com' ;;
      "run services list "*)
        [ "${MANUAL_FAILURE:-0}" != 1 ] || echo 'contoso-web' ;;
      "iam service-accounts list "*)
        echo 'terraform-deployer@fixture-project.iam.gserviceaccount.com' ;;
      "sql instances list "*|"secrets list "*|"artifacts repositories list "*|"compute networks vpc-access connectors list "*|"compute addresses list "*) ;;
      *) echo "Unexpected list command: $*" >&2; exit 97 ;;
    esac
    exit 0 ;;
  "gcloud services vpc-peerings delete "*) exit 1 ;;
  "gcloud iam service-accounts delete terraform-deployer@"*) exit 0 ;;
  "gcloud run services update "*) exit 0 ;;
  "gcloud run services delete "*) exit 1 ;;
  "gcloud "*) echo "Unexpected gcloud command: $*" >&2; exit 97 ;;
  "gsutil ls -r gs://"*)
    printf '%s\n' "${STATE_OBJECTS:-gs://fixture-project-tf-state/terraform/state/default.tfstate}"
    exit "${STATE_OBJECTS_EXIT:-0}" ;;
  "gsutil ls gs://"*|"gsutil ls -b gs://"*) exit "${BUCKET_LOOKUP_EXIT:-0}" ;;
  "gsutil ls")
    printf '%s' "${BUCKET_LIST:-}"
    exit "${BUCKET_LIST_EXIT:-0}" ;;
  "gsutil -m rm -r "*) exit "${BUCKET_DELETE_EXIT:-0}" ;;
  "terraform init "*) exit "${INIT_EXIT:-0}" ;;
  "terraform destroy "*)
    attempt=0
    [ ! -f "$ATTEMPTS" ] || read -r attempt < "$ATTEMPTS"
    attempt=$((attempt + 1))
    echo "$attempt" > "$ATTEMPTS"
    if [ "$attempt" -le "${DESTROY_FAILURES:-0}" ]; then exit 1; fi
    exit 0 ;;
  "terraform state rm "*) exit 0 ;;
  "terraform -chdir="*" workspace list -no-color")
    printf '%s\n' "${WORKSPACES:-* default}"
    exit "${WORKSPACES_EXIT:-0}" ;;
  "terraform state list"|"terraform -chdir="*" state list")
    printf '%s' "${STATE_LIST:-}"
    exit "${STATE_LIST_EXIT:-0}" ;;
  "curl "*)
    case " $* " in
      *" -X GET "*) printf '%s' "${DATASTORE_STATUS:-404}" ;;
      *" -X DELETE "*) printf '{"name":"operations/fixture-delete"}' ;;
      *) exit 97 ;;
    esac
    exit 0 ;;
  *) echo "Unexpected command: $tool $*" >&2; exit 97 ;;
esac
'''


def run_teardown(*, missing_tool=None, terraform_directory=True, **overrides):
    with tempfile.TemporaryDirectory() as temp_dir:
        root = Path(temp_dir)
        script = root / "infrastructure/scripts/teardown_project.sh"
        script.parent.mkdir(parents=True)
        shutil.copyfile(SCRIPT, script)
        if terraform_directory:
            (root / "infrastructure/terraform").mkdir()
        fake_bin = root / "bin"
        fake_bin.mkdir()
        for tool in ("gcloud", "gsutil", "terraform", "curl"):
            if tool == missing_tool:
                continue
            executable = fake_bin / tool
            executable.write_text(SHIM, encoding="utf-8")
            executable.chmod(0o755)
        # Only allow the script's harmless local utilities. A system PATH could
        # find real cloud CLIs when testing a missing tool on another machine.
        for utility in ("dirname", "tr"):
            source = shutil.which(utility)
            if source is None:
                raise RuntimeError(f"Required test utility is missing: {utility}")
            (fake_bin / utility).symlink_to(source)
        # Do not inherit the user's PATH, credentials, project, or cloud config.
        env = {
            "PATH": str(fake_bin),
            "HOME": str(root),
            "CLOUDSDK_CONFIG": str(root / "gcloud"),
            "PROJECT_ID": "fixture-project",
            "ENVIRONMENT": "dev",
            "REGION": "us-central1",
            "COMMAND_LOG": str(root / "commands.log"),
            "ATTEMPTS": str(root / "attempts"),
            **{key: str(value) for key, value in overrides.items()},
        }
        completed = subprocess.run(
            ["/bin/bash", str(script), "--force"],
            cwd=root,
            env=env,
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )
        log = root / "commands.log"
        commands = log.read_text(encoding="utf-8").splitlines() if log.exists() else []
    return completed, commands


class TeardownStateSafetyTests(unittest.TestCase):
    def assert_preserved(self, result, commands):
        self.assertNotIn("Unexpected", result.stderr)
        self.assertNotEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertNotIn(STATE_DELETE, commands)
        self.assertNotIn(DEPLOYER_DELETE, commands)
        self.assertFalse(any("state rm" in command for command in commands), commands)

    def test_destroy_failure_keeps_state_and_deployer_for_recovery(self):
        result, commands = run_teardown(DESTROY_FAILURES=2)
        self.assert_preserved(result, commands)
        self.assertEqual(sum(c.startswith("terraform destroy ") for c in commands), 2)
        self.assertIn("preserved", result.stdout)

    def test_retry_does_not_forget_resources_and_can_complete(self):
        result, commands = run_teardown(DESTROY_FAILURES=1)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertFalse(any("state rm" in command for command in commands), commands)
        self.assertIn(STATE_DELETE, commands)

    def test_success_checks_empty_state_before_deleting_bucket_and_deployer(self):
        result, commands = run_teardown()
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        state_check = next(i for i, c in enumerate(commands) if c.endswith(" state list"))
        self.assertLess(state_check, commands.index(STATE_DELETE))
        self.assertLess(commands.index(STATE_DELETE), commands.index(DEPLOYER_DELETE))

    def test_init_failure_preserves_state(self):
        self.assert_preserved(*run_teardown(INIT_EXIT=1))

    def test_inaccessible_bucket_is_not_reported_as_success(self):
        self.assert_preserved(*run_teardown(BUCKET_LOOKUP_EXIT=1))

    def test_missing_terraform_directory_preserves_state(self):
        self.assert_preserved(*run_teardown(terraform_directory=False))

    def test_missing_tool_fails_before_cloud_changes(self):
        for tool in ("gsutil", "terraform", "gcloud"):
            with self.subTest(tool=tool):
                result, commands = run_teardown(missing_tool=tool)
                self.assert_preserved(result, commands)
                self.assertEqual(commands, [])
                self.assertIn(tool, result.stdout + result.stderr)

    def test_nonempty_state_is_preserved_even_after_successful_destroy(self):
        self.assert_preserved(*run_teardown(STATE_LIST="google_sql_database_instance.postgres\n"))

    def test_unreadable_state_is_preserved(self):
        self.assert_preserved(*run_teardown(STATE_LIST_EXIT=1))

    def test_other_workspaces_preserve_the_project_wide_bucket(self):
        self.assert_preserved(*run_teardown(WORKSPACES="* default\n  production\n"))

    def test_unreadable_workspaces_preserve_state(self):
        self.assert_preserved(*run_teardown(WORKSPACES_EXIT=1))

    def test_unreadable_bucket_contents_preserve_state(self):
        self.assert_preserved(*run_teardown(STATE_OBJECTS_EXIT=1))

    def test_other_prefixes_and_state_locks_preserve_state(self):
        for object_name in ("other/default.tfstate", "terraform/state/default.tflock"):
            with self.subTest(object_name=object_name):
                self.assert_preserved(*run_teardown(STATE_OBJECTS=(
                    "gs://fixture-project-tf-state/terraform/state/default.tfstate\n"
                    f"gs://fixture-project-tf-state/{object_name}\n"
                )))

    def test_manual_cleanup_failure_preserves_state(self):
        self.assert_preserved(*run_teardown(MANUAL_FAILURE=1))

    def test_peering_cleanup_warning_preserves_state(self):
        self.assert_preserved(*run_teardown(PEERING_FAILURE=1))

    def test_pending_datastore_deletion_preserves_state(self):
        self.assert_preserved(*run_teardown(DATASTORE_STATUS=200))

    def test_unknown_datastore_status_preserves_state(self):
        self.assert_preserved(*run_teardown(DATASTORE_STATUS=403))

    def test_resource_lookup_errors_never_count_as_confirmed_absence(self):
        for lookup in (
            "sql instances list", "run services list", "secrets list",
            "artifacts repositories list", "compute networks vpc-access connectors list",
            "services vpc-peerings list", "compute addresses list", "iam service-accounts list",
        ):
            with self.subTest(lookup=lookup):
                self.assert_preserved(*run_teardown(LOOKUP_FAILURE=lookup))

    def test_app_bucket_listing_failure_preserves_state(self):
        self.assert_preserved(*run_teardown(BUCKET_LIST_EXIT=1))

    def test_app_bucket_matching_does_not_delete_other_buckets(self):
        result, commands = run_teardown(BUCKET_LIST=(
            "gs://dev-fixture-storage/\n"
            "gs://dev-fixture-storage-tf-state/\n"
            "gs://other-dev-fixture-storage/\n"
        ))
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertIn("gsutil -m rm -r gs://dev-fixture-storage/", commands)
        self.assertNotIn("gsutil -m rm -r gs://dev-fixture-storage-tf-state/", commands)
        self.assertNotIn("gsutil -m rm -r gs://other-dev-fixture-storage/", commands)

    def test_bucket_deletion_failure_preserves_deployer(self):
        result, commands = run_teardown(BUCKET_DELETE_EXIT=1)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn(STATE_DELETE, commands)
        self.assertNotIn(DEPLOYER_DELETE, commands)


if __name__ == "__main__":
    unittest.main()
