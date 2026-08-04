"""Every image path referenced by the web app must exist on disk.

`next/image` does not fail the build for a missing file under `public/` — it
404s at request time. Unit tests assert DOM text and the e2e smoke asserts page
status, so neither notices that a page it just rendered points at an asset that
is not there. That is how a fallback to `/images/placeholder.png` survived when
no such file had ever existed.

This also runs in the other direction: deleting an image that data still points
at fails here rather than in a browser.
"""

import re
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
PUBLIC_DIR = REPO_ROOT / "apps/web/public"

# Paths are written as site-absolute URLs, so they resolve against public/.
IMAGE_REF = re.compile(r"/images/[A-Za-z0-9_./-]+\.(?:jpg|jpeg|png|webp|svg|gif)", re.I)

SEARCH_ROOTS = ("apps/web/src", "apps/web/public", "apps/web/prisma")
SKIP_DIRS = {"node_modules", ".next", "__pycache__"}
BINARY_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".ico", ".woff", ".woff2"}


def referenced_images() -> dict[str, list[str]]:
    """Map each referenced /images/... path to the files that reference it."""
    found: dict[str, list[str]] = {}
    for root in SEARCH_ROOTS:
        for path in (REPO_ROOT / root).rglob("*"):
            if not path.is_file() or SKIP_DIRS & set(path.parts):
                continue
            if path.suffix.lower() in BINARY_SUFFIXES:
                continue
            try:
                text = path.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            for match in IMAGE_REF.finditer(text):
                found.setdefault(match.group(0), []).append(
                    str(path.relative_to(REPO_ROOT))
                )
    return found


class ImageReferenceTests(unittest.TestCase):
    def test_references_are_found(self):
        """Without this the check below passes vacuously on a broken regex.

        The catalogue carries hundreds of image paths; finding none would mean
        the scan is not reaching the data files rather than that all is well.
        """
        self.assertGreater(len(referenced_images()), 100)

    def test_every_referenced_image_exists(self):
        missing = {
            ref: sources
            for ref, sources in referenced_images().items()
            if not (PUBLIC_DIR / ref.lstrip("/")).is_file()
        }
        self.assertEqual(
            missing,
            {},
            "referenced image files do not exist under apps/web/public; "
            "next/image 404s at request time rather than failing the build",
        )


if __name__ == "__main__":
    unittest.main()
