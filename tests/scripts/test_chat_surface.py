"""Guard the chat surface against the Azure-era modes returning.

The visual, video, and grounded modes were leftovers from before the app moved
to GCP: the grounded route called Azure OpenAI's "Add Your Data" preview API,
their endpoints were empty in .env.example and absent from the env contract,
nothing linked to them, and the product definition describes a single chat
assistant. They were removed rather than wired up.

Nothing else would notice them coming back. They were unreachable, so no test
exercised them, and the suite stayed green the entire time they were broken —
`image_contents` was built and discarded from the initial commit onward.
"""

import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
CHAT_API_DIR = REPO_ROOT / "apps/web/src/app/api/chat"
ENV_EXAMPLE = REPO_ROOT / ".env.example"
WEB_SRC = REPO_ROOT / "apps/web/src"

REMOVED_ENV_VARS = (
    "VISUAL_ENDPOINT",
    "VISUAL_KEY",
    "CONTOSO_SEARCH_ENDPOINT",
    "CONTOSO_SEARCH_KEY",
    "CONTOSO_AISERVICES_ENDPOINT",
    "CONTOSO_AISERVICES_KEY",
)

REMOVED_SYMBOLS = (
    "ChatType",
    "sendVisualMessage",
    "sendGroundedMessage",
    "GroundedMessage",
)


def web_sources() -> list[Path]:
    return [
        path
        for suffix in ("*.ts", "*.tsx")
        for path in WEB_SRC.rglob(suffix)
    ]


class ChatSurfaceTests(unittest.TestCase):
    def test_only_the_service_route_exists(self):
        routes = sorted(p.name for p in CHAT_API_DIR.iterdir() if p.is_dir())
        self.assertEqual(
            routes,
            ["service"],
            "the web app proxies to one chat endpoint; visual and grounded were "
            "Azure-era routes pointing at services this repo never had",
        )

    def test_removed_env_vars_stay_removed(self):
        text = ENV_EXAMPLE.read_text(encoding="utf-8")
        for name in REMOVED_ENV_VARS:
            with self.subTest(var=name):
                self.assertNotIn(
                    name,
                    text,
                    f"{name} configured a removed chat mode; it was empty by "
                    "default and absent from the env contract",
                )

    def test_removed_symbols_stay_removed(self):
        offenders: list[str] = []
        for path in web_sources():
            content = path.read_text(encoding="utf-8")
            for symbol in REMOVED_SYMBOLS:
                if symbol in content:
                    offenders.append(f"{path.relative_to(REPO_ROOT)}: {symbol}")
        self.assertEqual(offenders, [], "removed chat-mode symbols reappeared")

    def test_the_guard_can_see_the_files_it_checks(self):
        """Without this, a moved directory would make the checks above vacuous."""
        self.assertTrue(CHAT_API_DIR.is_dir(), f"missing {CHAT_API_DIR}")
        self.assertTrue(ENV_EXAMPLE.is_file(), f"missing {ENV_EXAMPLE}")
        self.assertGreater(len(web_sources()), 20, "web source scan found too few files")


if __name__ == "__main__":
    unittest.main()
