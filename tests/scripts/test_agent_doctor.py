"""Guard `agent_doctor`'s port-drift detection.

`.env` is not tracked, so moving a published port in the repository leaves
every existing one behind. The keys that carry a port fail by *reaching
something else* rather than by erroring — `CHAT_ENDPOINT` posts the request and
its API key to whatever now owns the old port, and `services/chat/.env`'s
`DATABASE_URL` runs hand-written asyncpg queries against whatever owns 5432.
That is what this detection exists for, and it is worth testing because it is
the only thing standing between a stale file and a silent wrong target.

Two shapes of assertion here:

- Table tests over `stale_port_keys`, which is a pure function of two dicts.
  These are what catch parsing mistakes; the first version of it read a DSN's
  digit-leading password as the port.
- One vacuity assertion that `published_ports()` parses the real compose file
  non-empty. That is the important one: this parser **fails open**. If the
  compose format drifts, it returns `{}`, every key is skipped, and the warning
  silently stops existing rather than going red. `test_published_ports.py`
  carries a second copy of the same parser whose failure is loud, so without
  this assertion the two could diverge with only the quiet one left standing.
"""

import importlib.util
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]


def load_agent_doctor():
    spec = importlib.util.spec_from_file_location(
        "agent_doctor", REPO_ROOT / "scripts/agent_doctor.py"
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


doctor = load_agent_doctor()

PORTS = {"web": 3100, "chat": 8100, "db": 55432}


class PortsInTests(unittest.TestCase):
    def test_reads_the_port_not_a_digit_leading_password(self):
        """The mistake the first implementation made.

        A non-greedy `://.*?:(\\d+)` stops at the password and reports `:5`,
        which appears nowhere in the value.
        """
        dsn = "postgresql://postgres:5up3rs3cret@localhost:55432/contoso-db"
        self.assertEqual(doctor.ports_in(dsn), [55432])

    def test_reads_every_element_of_a_comma_separated_list(self):
        origins = "http://localhost:5173,http://localhost:3100"
        self.assertEqual(doctor.ports_in(origins), [5173, 3100])

    def test_a_value_naming_no_port_yields_none(self):
        self.assertEqual(doctor.ports_in("postgresql://user:pass@localhost/db"), [])
        self.assertEqual(doctor.ports_in("https://example.com"), [])

    def test_an_unparseable_value_is_skipped_rather_than_raising(self):
        self.assertEqual(doctor.ports_in("http://localhost:not-a-port"), [])
        self.assertEqual(doctor.ports_in(""), [])


class StalePortKeyTests(unittest.TestCase):
    def test_a_stale_file_names_every_drifted_key(self):
        env = {
            "NEXTAUTH_URL": "http://localhost:3000",
            "CHAT_ENDPOINT": "http://localhost:8000/api/create_response",
            "ALLOWED_ORIGINS": "http://localhost:3000",
            "DATABASE_URL": "postgresql://postgres:postgres@localhost:55432/contoso-db",
        }
        stale = doctor.stale_port_keys(env, PORTS)
        self.assertEqual(len(stale), 3)
        self.assertTrue(any("NEXTAUTH_URL names :3000" in item for item in stale))
        self.assertTrue(any("CHAT_ENDPOINT names :8000" in item for item in stale))
        # Already migrated, so it must not be reported.
        self.assertFalse(any("DATABASE_URL" in item for item in stale))

    def test_a_current_file_reports_nothing(self):
        env = {
            "NEXTAUTH_URL": "http://localhost:3100",
            "CHAT_ENDPOINT": "http://localhost:8100/api/create_response",
            "ALLOWED_ORIGINS": "http://localhost:3100",
            "DATABASE_URL": "postgresql://postgres:postgres@localhost:55432/contoso-db",
        }
        self.assertEqual(doctor.stale_port_keys(env, PORTS), [])

    def test_a_list_containing_the_published_port_is_not_stale(self):
        """Order must not decide the verdict.

        Warning on the first element alone makes the check sensitive to where
        someone happened to add a second origin.
        """
        env = {"ALLOWED_ORIGINS": "http://localhost:5173,http://localhost:3100"}
        self.assertEqual(doctor.stale_port_keys(env, PORTS), [])

    def test_a_list_containing_none_of_them_is_stale(self):
        env = {"ALLOWED_ORIGINS": "http://localhost:5173,http://localhost:3000"}
        self.assertEqual(len(doctor.stale_port_keys(env, PORTS)), 1)

    def test_absent_keys_and_absent_ports_are_skipped(self):
        self.assertEqual(doctor.stale_port_keys({}, PORTS), [])
        self.assertEqual(doctor.stale_port_keys({"FOO": "bar"}, PORTS), [])
        # No compose ports parsed: nothing to compare against, so nothing said.
        self.assertEqual(
            doctor.stale_port_keys({"NEXTAUTH_URL": "http://localhost:3000"}, {}),
            [],
        )

    def test_a_portless_value_is_not_reported(self):
        env = {"DATABASE_URL": "postgresql://postgres:postgres@localhost/contoso-db"}
        self.assertEqual(doctor.stale_port_keys(env, PORTS), [])


class PublishedPortParseTests(unittest.TestCase):
    def test_the_real_compose_file_parses_non_empty(self):
        """The fail-open guard.

        Every assertion above is about a function that is only reached when
        this parser returns something. If compose's formatting drifts past the
        parser, it returns `{}` and the whole check quietly becomes a no-op —
        so this is asserted against the real file rather than a fixture.
        """
        ports = doctor.published_ports()
        self.assertEqual(
            set(ports),
            {"web", "chat", "db"},
            f"parsed {ports} from the real docker-compose.yml; the drift "
            f"warning is a no-op whenever this is empty",
        )
        for service, port in ports.items():
            self.assertIsInstance(port, int, f"{service} port is not an int")


if __name__ == "__main__":
    unittest.main()
