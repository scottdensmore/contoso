"""Every route must expose a heading structure.

Heading navigation is a primary way screen-reader users move through a page.
Three routes rendered their titles as styled `div`s, so a query for `h1`-`h6`
returned nothing at all and the page presented as an undifferentiated run of
links and text.

Nothing else notices: `next build` does not care, unit tests assert rendered
text rather than element types, and the smoke asserts HTTP status.

Routes whose heading lives in a component are listed below with the component
that supplies it, so this check does not force markup into the page file.
"""

import re
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
APP_DIR = REPO_ROOT / "apps/web/src/app"

H1 = re.compile(r"<h1[\s>]")
ANY_HEADING = re.compile(r"<h[1-6][\s>]")

# Routes that legitimately take their <h1> from a component they render.
HEADING_FROM_COMPONENT = {
    "contact/thanks/page.tsx": "src/components/contact-thanks.tsx",
}


def route_pages() -> list[Path]:
    return sorted(APP_DIR.rglob("page.tsx"))


def route_name(path: Path) -> str:
    return str(path.relative_to(APP_DIR))


class PageHeadingTests(unittest.TestCase):
    def test_routes_are_found(self):
        """Guards the two checks below against an empty glob."""
        self.assertGreaterEqual(len(route_pages()), 8)

    def test_every_route_has_a_heading(self):
        missing = [
            route_name(page)
            for page in route_pages()
            if not ANY_HEADING.search(page.read_text(encoding="utf-8"))
            and route_name(page) not in HEADING_FROM_COMPONENT
        ]
        self.assertEqual(
            missing, [], "routes render no heading element at all"
        )

    def test_every_route_declares_an_h1(self):
        """Source can only tell you an h1 exists somewhere in the file.

        It cannot tell you how many render at once: a page gated on session
        status declares one h1 per branch, and exactly one of them renders.
        `apps/web/e2e/headings.spec.ts` asserts the "exactly one" property
        against the rendered document, which is the only place it is knowable.
        """
        wrong = {}
        for page in route_pages():
            name = route_name(page)
            source = page.read_text(encoding="utf-8")
            if name in HEADING_FROM_COMPONENT:
                source = (REPO_ROOT / "apps/web" / HEADING_FROM_COMPONENT[name]).read_text(
                    encoding="utf-8"
                )
            if not H1.search(source):
                wrong[name] = 0
        self.assertEqual(wrong, {}, "each route must declare an h1")

    def test_component_supplied_headings_still_exist(self):
        """Stops the allowlist above from silently excusing a real gap.

        If the named component loses its h1, the route it covers has none and
        this check must fail rather than the allowlist absorbing it.
        """
        for route, component in HEADING_FROM_COMPONENT.items():
            with self.subTest(route=route):
                path = REPO_ROOT / "apps/web" / component
                self.assertTrue(path.is_file(), f"{component} does not exist")
                self.assertRegex(path.read_text(encoding="utf-8"), H1)


if __name__ == "__main__":
    unittest.main()
