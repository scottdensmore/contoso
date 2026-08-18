"""Behavioral coverage for local product indexing and the entrypoint retry loop.

`chat-entrypoint.sh` retries `index_products_local.py` while it exits nonzero, so
the retry policy is only as good as the indexer's exit status. The indexer used
to catch every indexing exception and return normally, which made a failed
attempt indistinguishable from a successful one: the loop broke on the first
try and the service came up with no vector index (#323).

The existing entrypoint coverage in `test_chat_profile_wiring.py` is `assertIn`
over the script text, which cannot see an exit status. These tests run the real
script and the real loop instead.
"""

import json
import os
import re
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
INDEXER = REPO_ROOT / "infrastructure/scripts/index_products_local.py"
ENTRYPOINT = REPO_ROOT / "services/chat/src/api/chat-entrypoint.sh"
CHAT_DOCKERFILE = REPO_ROOT / "services/chat/Dockerfile"

# The indexer imports these at module scope. `chromadb` is only installed by the
# full local profile (`make setup-chat-full`), so the stubs keep this guard
# runnable under the core profile as well as pinning the failure point.
PRISMA_STUB = '''
import os

FAIL_AT = os.environ["STUB_FAIL_AT"]


class _Product:
    def __init__(self, index):
        self.id = f"p{index}"
        self.name = f"Product {index}"
        self.slug = f"product-{index}"
        self.price = 10 + index
        self.description = "A description."
        self.category = type("C", (), {"name": "Tents"})()
        self.brand = type("B", (), {"name": "Contoso"})()


class _Products:
    async def find_many(self, **kwargs):
        if FAIL_AT == "find_many":
            raise RuntimeError("stub: database read failed")
        if FAIL_AT == "empty":
            return []
        return [_Product(1), _Product(2)]


class Prisma:
    def __init__(self):
        self.product = _Products()

    async def connect(self):
        if FAIL_AT == "connect":
            raise RuntimeError("stub: database is still starting up")

    async def disconnect(self):
        pass
'''

CHROMADB_STUB = '''
import json
import os

FAIL_AT = os.environ["STUB_FAIL_AT"]
RECORD = os.environ["STUB_RECORD"]


class _Collection:
    def upsert(self, documents, metadatas, ids):
        if FAIL_AT == "upsert":
            raise RuntimeError("stub: chroma rejected the upsert")
        with open(RECORD, "w", encoding="utf-8") as handle:
            json.dump({"ids": list(ids)}, handle)


class _Client:
    def get_or_create_collection(self, name, embedding_function):
        return _Collection()


def PersistentClient(path):
    if FAIL_AT == "chroma_client":
        raise RuntimeError("stub: chroma persistence directory is unusable")
    return _Client()
'''

CHROMADB_UTILS_STUB = '''
class _EmbeddingFunction:
    pass


class embedding_functions:
    DefaultEmbeddingFunction = _EmbeddingFunction
'''


def run_indexer(fail_at):
    """Run the real indexer against stubbed boundaries. Returns the process."""
    with tempfile.TemporaryDirectory() as temp_dir:
        fixture = Path(temp_dir)
        stub_root = fixture / "stubs"
        (stub_root / "chromadb").mkdir(parents=True)
        (stub_root / "prisma.py").write_text(PRISMA_STUB, encoding="utf-8")
        (stub_root / "chromadb/__init__.py").write_text(CHROMADB_STUB, encoding="utf-8")
        (stub_root / "chromadb/utils.py").write_text(CHROMADB_UTILS_STUB, encoding="utf-8")

        record = fixture / "upserted.json"
        env = dict(os.environ)
        env["PYTHONPATH"] = str(stub_root)
        env["STUB_FAIL_AT"] = fail_at
        env["STUB_RECORD"] = str(record)
        env["CHROMA_DB_PATH"] = str(fixture / "chroma_db")

        completed = subprocess.run(
            [sys.executable, str(INDEXER)],
            capture_output=True,
            text=True,
            env=env,
            timeout=120,
        )
        upserted = json.loads(record.read_text(encoding="utf-8")) if record.exists() else None
        return completed, upserted


def run_entrypoint(failures_before_success):
    """Run the real entrypoint with a stub indexer that fails a set number of times.

    Returns (process, attempts) where `attempts` is how many times the entrypoint
    actually invoked the indexer.
    """
    with tempfile.TemporaryDirectory() as temp_dir:
        fixture = Path(temp_dir)
        fake_bin = fixture / "fake-bin"
        fake_bin.mkdir()
        (fixture / "infrastructure/scripts").mkdir(parents=True)
        (fixture / "local_provider_health.py").write_text("", encoding="utf-8")
        (fixture / "infrastructure/scripts/index_products_local.py").write_text("", encoding="utf-8")

        attempts_file = fixture / "attempts"
        attempts_file.write_text("0", encoding="utf-8")

        # Stands in for the indexer and the preflight, so the loop under test is
        # driven by an exit status we choose rather than by a real database.
        (fake_bin / "python3").write_text(
            "#!/bin/bash\n"
            # The path the entrypoint asks for has to exist. services/chat/Dockerfile
            # is what puts it there, and nothing else asserts the two agree.
            '[ -f "$1" ] || { echo "no such script: $1" >&2; exit 127; }\n'
            'case "$1" in\n'
            "  *local_provider_health.py) exit 0 ;;\n"
            "  *index_products_local.py)\n"
            f'    count=$(cat "{attempts_file}")\n'
            "    count=$((count + 1))\n"
            f'    echo "$count" > "{attempts_file}"\n'
            f"    if [ \"$count\" -le {failures_before_success} ]; then\n"
            '      echo "stub indexer failed" >&2\n'
            "      exit 1\n"
            "    fi\n"
            "    exit 0 ;;\n"
            "esac\n"
            "exit 0\n",
            encoding="utf-8",
        )
        # The entrypoint's last act is `exec uvicorn`; this keeps that a no-op.
        (fake_bin / "uvicorn").write_text('#!/bin/bash\necho "uvicorn started"\nexit 0\n', encoding="utf-8")
        # The loop sleeps 5s between attempts. Nothing here asserts on timing.
        (fake_bin / "sleep").write_text("#!/bin/bash\nexit 0\n", encoding="utf-8")
        for stub in ("python3", "uvicorn", "sleep"):
            (fake_bin / stub).chmod(0o755)

        env = dict(os.environ)
        env["PATH"] = f"{fake_bin}:{env['PATH']}"
        env["LLM_PROVIDER"] = "local"

        completed = subprocess.run(
            ["bash", str(ENTRYPOINT)],
            capture_output=True,
            text=True,
            cwd=fixture,
            env=env,
            timeout=120,
        )
        attempts = int(attempts_file.read_text(encoding="utf-8").strip())
        return completed, attempts


class IndexerExitStatusTests(unittest.TestCase):
    """The indexer's exit status has to distinguish failure from success."""

    def test_successful_indexing_exits_zero(self):
        completed, upserted = run_indexer("none")
        self.assertEqual(
            completed.returncode,
            0,
            f"successful indexing should exit 0\nstdout:\n{completed.stdout}\nstderr:\n{completed.stderr}",
        )
        # Vacuity guard: the stubs were reached and the real indexing path ran,
        # so a zero here is a success rather than an import that never got going.
        self.assertEqual(upserted, {"ids": ["p1", "p2"]})

    def test_database_failure_exits_nonzero(self):
        completed, _ = run_indexer("connect")
        output = completed.stdout + completed.stderr
        # Named message first: every way this fixture can break also exits
        # nonzero -- a mistyped STUB_FAIL_AT, a syntax error in a stub, a wrong
        # INDEXER path -- so the exit status alone would pass while proving
        # nothing about the path this test is named for.
        self.assertIn("stub: database is still starting up", output)
        self.assertEqual(
            completed.returncode,
            1,
            f"a database failure must not report success\nstdout:\n{completed.stdout}\nstderr:\n{completed.stderr}",
        )

    def test_chroma_failure_exits_nonzero(self):
        completed, _ = run_indexer("upsert")
        output = completed.stdout + completed.stderr
        self.assertIn("stub: chroma rejected the upsert", output)
        self.assertEqual(
            completed.returncode,
            1,
            f"a chroma failure must not report success\nstdout:\n{completed.stdout}\nstderr:\n{completed.stderr}",
        )

    def test_failure_is_still_reported(self):
        completed, _ = run_indexer("find_many")
        output = completed.stdout + completed.stderr
        self.assertIn("stub: database read failed", output)


class IndexerDeliveryTests(unittest.TestCase):
    """The entrypoint's relative path and the Dockerfile's COPY have to agree.

    The entrypoint invokes the indexer as `infrastructure/scripts/...` relative
    to the image's WORKDIR, which resolves only because the Dockerfile copies it
    to that exact destination. Two files, one contract, and nothing compared
    them -- so either side could be renamed and every unit test would stay green
    while the container failed at startup.

    This compares the two declarations. It does not prove the COPY landed in the
    built image; only inspecting the image does that.
    """

    def invoked_path(self):
        entrypoint = ENTRYPOINT.read_text(encoding="utf-8")
        invocations = re.findall(r"python3\s+(\S*index_products_local\.py)", entrypoint)
        self.assertEqual(
            len(invocations),
            1,
            f"expected exactly one indexer invocation in {ENTRYPOINT.name}, found {invocations}",
        )
        return invocations[0]

    def copy_destinations(self):
        dockerfile = CHAT_DOCKERFILE.read_text(encoding="utf-8")
        return re.findall(
            r"^COPY\s+(?:--\S+\s+)*\S*index_products_local\.py\s+(\S+)\s*$",
            dockerfile,
            re.MULTILINE,
        )

    def test_the_image_copies_the_indexer_where_the_entrypoint_looks_for_it(self):
        destinations = self.copy_destinations()
        self.assertEqual(
            len(destinations),
            1,
            f"expected exactly one indexer COPY in {CHAT_DOCKERFILE.name}, found {destinations}",
        )
        self.assertEqual(
            destinations[0],
            self.invoked_path(),
            "the Dockerfile copies the indexer somewhere the entrypoint does not run it",
        )

    def test_the_copied_indexer_exists_in_the_repository(self):
        source = re.search(
            r"^COPY\s+(?:--\S+\s+)*(\S*index_products_local\.py)\s+\S+\s*$",
            CHAT_DOCKERFILE.read_text(encoding="utf-8"),
            re.MULTILINE,
        )
        self.assertIsNotNone(source, "no indexer COPY found to check")
        self.assertTrue(
            (REPO_ROOT / source.group(1)).is_file(),
            f"the Dockerfile copies {source.group(1)}, which is not in the repository",
        )


class EntrypointRetryTests(unittest.TestCase):
    """The retry loop has to react to that exit status."""

    def test_a_failing_attempt_is_retried_until_it_succeeds(self):
        completed, attempts = run_entrypoint(failures_before_success=2)
        self.assertEqual(
            attempts,
            3,
            f"expected two failures then a success\nstdout:\n{completed.stdout}\nstderr:\n{completed.stderr}",
        )
        self.assertIn("uvicorn started", completed.stdout)

    def test_retrying_stops_at_the_first_success(self):
        completed, attempts = run_entrypoint(failures_before_success=0)
        self.assertEqual(attempts, 1, f"stdout:\n{completed.stdout}\nstderr:\n{completed.stderr}")
        self.assertIn("uvicorn started", completed.stdout)

    def test_a_permanently_failing_indexer_gives_up_and_still_serves(self):
        completed, attempts = run_entrypoint(failures_before_success=99)
        self.assertEqual(attempts, 5, f"stdout:\n{completed.stdout}\nstderr:\n{completed.stderr}")
        self.assertIn("uvicorn started", completed.stdout)


if __name__ == "__main__":
    unittest.main()
