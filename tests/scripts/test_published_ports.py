"""Guard the published host ports and everything that has to agree with them.

A published port is not one number in one file. `docker-compose.yml` decides
what the host can reach, and at least six other places have to name the same
number or the stack is subtly wrong rather than obviously broken:

- `NEXTAUTH_URL` is what NextAuth builds absolute redirect URLs from. Leave it
  behind and *sign-out* sends the browser to a port nothing serves, because
  `signOut()` assigns `window.location.href` from a server-derived URL that
  falls back to this value's origin. Sign-in is unaffected -- the login page
  passes `redirect: false` and navigates itself -- and it is not a cookie
  problem either, since cookies are not isolated by port (RFC 6265 s8.5).
- `make e2e-smoke` and `scripts/e2e_smoke.py` probe literal addresses and
  cannot be aimed elsewhere, so a stale one reports a healthy stack that is
  not the stack, or a dead one that is running.
- CI's `E2E_BASE_URL` and Playwright's default aim the journeys.

None of those fails loudly on drift, which is why they are asserted together
here rather than left to whoever moves a port next.

The ports themselves are read out of `docker-compose.yml` rather than written
down here, so this measures *agreement* — the property that matters — instead
of restating one number in an eighth place. What is pinned is the separate
claim the move was made for: that none of them is the contended default.

`yaml` is deliberately not imported: CI's script-test job builds a bare
virtualenv, so a third-party import passes locally and fails there.
"""

import re
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
COMPOSE = REPO_ROOT / "docker-compose.yml"

# The ports every other project on a developer machine wants. Moving off these
# is the whole point of the arrangement this guards; see #245 for the incident.
CONTENDED = {"web": 3000, "chat": 8000, "db": 5432}


def read(relative: str) -> str:
    return (REPO_ROOT / relative).read_text(encoding="utf-8")


def published_ports() -> dict[str, tuple[int, int]]:
    """`{service: (host_port, container_port)}` from the compose file.

    Slices on the top-level service keys rather than matching `"N:M"` anywhere,
    so a port that appears in a comment or an environment value cannot be
    mistaken for a published mapping.
    """
    lines = COMPOSE.read_text(encoding="utf-8").splitlines()
    starts = [
        index
        for index, line in enumerate(lines)
        if re.fullmatch(r"  (\w[\w-]*):\s*", line)
    ]
    ports: dict[str, tuple[int, int]] = {}
    for position, start in enumerate(starts):
        name = lines[start].strip().rstrip(":")
        end = starts[position + 1] if position + 1 < len(starts) else len(lines)
        for line in lines[start:end]:
            match = re.fullmatch(r'\s*-\s*"(\d+):(\d+)"\s*', line)
            if match:
                ports[name] = (int(match.group(1)), int(match.group(2)))
                break
    return ports


class PublishedPortTests(unittest.TestCase):
    def setUp(self):
        self.ports = published_ports()

    def test_every_service_publishes_a_port(self):
        """Vacuity guard: a parse that finds nothing satisfies every claim below."""
        self.assertEqual(
            set(self.ports),
            {"web", "chat", "db"},
            f"parsed published ports {self.ports} out of {COMPOSE}",
        )

    def test_published_ports_are_off_the_contended_defaults(self):
        for service, default in CONTENDED.items():
            host, _ = self.ports[service]
            self.assertNotEqual(
                host,
                default,
                f"{service} publishes the contended default {default}. Another "
                f"project on the same machine takes it and this stack either "
                f"fails to bind or, for db, silently resolves to their server "
                f"(#245).",
            )

    def test_container_ports_stay_on_the_defaults(self):
        """The move is host-side only.

        Container ports are what `CHAT_ENDPOINT=http://chat:8000` and the
        `db:5432` URLs inside the compose network resolve to. Moving one of
        those breaks service-to-service traffic while every host-side check
        here keeps passing, so it is asserted rather than assumed.
        """
        for service, default in CONTENDED.items():
            _, container = self.ports[service]
            self.assertEqual(
                container,
                default,
                f"{service}'s container port moved to {container}; the compose "
                f"network addresses it by the default {default}",
            )

    def test_nextauth_url_names_the_published_web_port(self):
        host, _ = self.ports["web"]
        for source in ("docker-compose.yml", ".env.example"):
            content = read(source)
            match = re.search(r"NEXTAUTH_URL=http://localhost:(\d+)", content)
            self.assertIsNotNone(match, f"no NEXTAUTH_URL found in {source}")
            self.assertEqual(
                int(match.group(1)),
                host,
                f"{source} names a port the stack does not answer on, so a "
                f"NextAuth-driven redirect — sign-out is the reachable one — "
                f"sends the browser somewhere nothing is served",
            )

    def test_smoke_probes_the_published_ports(self):
        web, _ = self.ports["web"]
        chat, _ = self.ports["chat"]
        makefile = read("Makefile")
        self.assertIn(f'--web-url "http://127.0.0.1:{web}"', makefile)
        self.assertIn(f'--chat-url "http://127.0.0.1:{chat}"', makefile)

        smoke = read("scripts/e2e_smoke.py")
        self.assertIn(f'default="http://127.0.0.1:{web}"', smoke)
        self.assertIn(f'default="http://127.0.0.1:{chat}"', smoke)

    def test_journeys_are_aimed_at_the_published_web_port(self):
        host, _ = self.ports["web"]
        self.assertIn(f"E2E_BASE_URL: http://localhost:{host}", read(".github/workflows/ci.yml"))
        self.assertIn(
            f"'http://localhost:{host}'",
            read("apps/web/playwright.config.ts"),
        )

    def test_the_dev_server_uses_the_same_port_as_the_composed_web_service(self):
        """The hybrid flow reads the same `.env`, so it needs the same port.

        `.env.example` has one `NEXTAUTH_URL`, and both options in the README
        use it: Option 1 runs `web` in Docker, Option 2 runs `next dev` against
        a Dockerised `db` and `chat`. Before the ports moved, one number served
        both because `next dev` and compose happened to share 3000. Moving only
        compose splits them, and the half that breaks is the quiet one --
        `next dev` serves 3000 and NextAuth's redirects point at a 3100 that
        nothing is serving, which surfaces on sign-out rather than sign-in.

        It would also have left the dev server holding the contended port this
        whole change exists to give up.
        """
        host, _ = self.ports["web"]
        dev = re.search(r'"dev":\s*"next dev([^"]*)"', read("apps/web/package.json"))
        self.assertIsNotNone(dev, "no `dev` script found in apps/web/package.json")
        port = re.search(r"-p\s+(\d+)", dev.group(1))
        self.assertIsNotNone(
            port,
            f"`next dev` names no port, so it serves Next's default 3000 while "
            f"compose publishes {host}",
        )
        self.assertEqual(int(port.group(1)), host)

    def test_host_side_chat_endpoint_names_the_published_chat_port(self):
        """The third host-side coupling, and the one that carries a credential.

        `apps/web/src/app/api/chat/service/route.ts` reads `CHAT_ENDPOINT` with
        no fallback and posts to it with `CHAT_API_KEY` attached. In the hybrid
        flow that value comes from `.env`, so a stale port sends the request and
        the key to whatever else owns the old one — which on the machine that
        prompted this change is another project's service. It fails by
        succeeding against the wrong server, so nothing else here would notice.
        """
        host, _ = self.ports["chat"]
        match = re.search(r"CHAT_ENDPOINT=http://localhost:(\d+)", read(".env.example"))
        self.assertIsNotNone(match, "no host-side CHAT_ENDPOINT in .env.example")
        self.assertEqual(int(match.group(1)), host)

    def test_host_side_database_url_names_the_published_db_port(self):
        host, _ = self.ports["db"]
        for source in (".env.example", "services/chat/.env.example"):
            content = read(source)
            match = re.search(r"DATABASE_URL=postgresql://[^@]+@localhost:(\d+)/", content)
            self.assertIsNotNone(match, f"no host-side DATABASE_URL in {source}")
            self.assertEqual(
                int(match.group(1)),
                host,
                f"{source} points host-side Prisma at a port this stack does "
                f"not publish. On a machine where something else holds it, that "
                f"is another project's database (#245)",
            )


if __name__ == "__main__":
    unittest.main()
