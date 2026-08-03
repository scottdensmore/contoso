"""Guard the database startup ordering in docker-compose.yml.

Postgres reports "started" well before it accepts connections. With a bare
`depends_on`, dependents race the socket: web's entrypoint runs
`prisma migrate deploy` immediately and dies with P1001. That race caused two
false CI failures before it was diagnosed, on PRs whose changes had nothing to
do with it.

e2e-smoke cannot protect this. It passes whenever Postgres happens to win the
race, which is most of the time, so a regression here would show up as an
intermittent failure on somebody else's pull request rather than as a clear
signal on the change that caused it.
"""

import re
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
COMPOSE = REPO_ROOT / "docker-compose.yml"

# Services that talk to the database and therefore must wait for it.
DB_DEPENDENTS = ("web", "chat")


def compose_text() -> str:
    return COMPOSE.read_text(encoding="utf-8")


def service_names() -> list[str]:
    """Every top-level service, discovered rather than hardcoded.

    Hardcoding would make the "future service" guard below vacuous: a service
    added tomorrow would not be in the list, so it could not fail.
    """
    names = []
    in_services = False
    for line in compose_text().splitlines():
        if line.startswith("services:"):
            in_services = True
            continue
        # any other top-level key ends the block
        if line and not line[0].isspace():
            in_services = False
            continue
        if in_services and line.startswith("  ") and not line.startswith("   "):
            if line.rstrip().endswith(":"):
                names.append(line.strip().rstrip(":"))
    return names


def service_block(name: str) -> str:
    """The YAML block for one service, up to the next top-level service key."""
    text = compose_text()
    start = text.index(f"\n  {name}:")
    rest = text[start + 1 :]
    lines = rest.splitlines()
    body = [lines[0]]
    for line in lines[1:]:
        # a new service starts at exactly two spaces of indent
        if line.startswith("  ") and not line.startswith("   ") and line.rstrip().endswith(":"):
            break
        body.append(line)
    return "\n".join(body)


# start_period + retries * interval. Postgres init on a cold CI runner has
# been observed near 28s with a deliberately slowed initdb, so the budget
# needs real headroom above that.
MIN_HEALTH_BUDGET_SECONDS = 30


class ComposeStartupOrderingTests(unittest.TestCase):
    def test_db_declares_a_healthcheck(self):
        block = service_block("db")
        self.assertIn(
            "healthcheck:",
            block,
            "db needs a healthcheck; without one, dependents can only wait for "
            "'started', which Postgres reports before it accepts connections",
        )

    def test_healthcheck_probes_tcp_not_the_unix_socket(self):
        """The probe must target TCP, which is what dependents actually use.

        Asserted against the `test:` line rather than the service block: the
        comment above the healthcheck mentions pg_isready, so a block-level
        substring check passes on prose even if the command is gutted.

        Without -h, pg_isready checks the Unix socket. The postgres entrypoint
        serves that socket from a temporary server during first-boot init, so
        the probe reports healthy while port 5432 is still closed — measured at
        5s versus 28s with a slowed initdb, which is the whole race.
        """
        block = service_block("db")
        match = re.search(r"^\s*test:\s*(.+)$", block, re.M)
        self.assertIsNotNone(match, "db healthcheck must declare a test command")
        command = match.group(1)

        self.assertIn(
            "pg_isready",
            command,
            f"healthcheck should probe readiness with pg_isready; got: {command}",
        )
        self.assertIn(
            "-h ",
            command,
            "pg_isready must be given -h so it probes TCP; without it the check "
            "passes against the socket-only bootstrap server while 5432 is "
            f"still closed. Got: {command}",
        )

    def test_health_budget_leaves_room_for_a_slow_cold_start(self):
        """The budget is implicit in three YAML numbers, so tightening any one
        of them would shrink it silently. Exceeding it is not a hang — compose
        exits 1 with "dependency failed to start" — but that turns a slow
        runner into a hard failure, so the floor is worth pinning."""
        block = service_block("db")
        values = {}
        for key in ("start_period", "interval", "retries"):
            match = re.search(rf"^\s*{key}:\s*(\d+)s?\s*$", block, re.M)
            self.assertIsNotNone(match, f"db healthcheck should declare {key}")
            values[key] = int(match.group(1))

        budget = values["start_period"] + values["retries"] * values["interval"]
        self.assertGreaterEqual(
            budget,
            MIN_HEALTH_BUDGET_SECONDS,
            f"health budget is {budget}s (start_period {values['start_period']}s "
            f"+ {values['retries']} x {values['interval']}s); a cold Postgres init "
            "can approach 30s, and falling short turns that into a build failure",
        )

    def test_database_dependents_wait_for_healthy(self):
        for name in DB_DEPENDENTS:
            with self.subTest(service=name):
                block = service_block(name)
                self.assertIn(
                    "depends_on:",
                    block,
                    f"{name} uses DATABASE_URL, so it must declare depends_on",
                )
                self.assertIn(
                    "condition: service_healthy",
                    block,
                    f"{name} must wait for db to be healthy; a bare depends_on "
                    "resolves to service_started and races the socket",
                )

    def test_every_service_with_a_database_url_waits_for_the_database(self):
        """Catches a service added later with a DATABASE_URL and no dependency."""
        checked = []
        for name in service_names():
            if name == "db":
                continue
            block = service_block(name)
            if "DATABASE_URL" not in block:
                continue
            checked.append(name)
            self.assertIn(
                "condition: service_healthy",
                block,
                f"{name} references DATABASE_URL but does not wait for db",
            )
        # Guard the guard: if discovery breaks, this loop would silently
        # check nothing and still report success.
        self.assertEqual(
            sorted(checked),
            sorted(DB_DEPENDENTS),
            "service discovery found a different set of database consumers "
            "than expected; update DB_DEPENDENTS deliberately",
        )


if __name__ == "__main__":
    unittest.main()
