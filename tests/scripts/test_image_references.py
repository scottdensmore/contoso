"""Every image path referenced by the web app must exist on disk.

`next/image` does not fail the build for a missing file under `public/` — it
404s at request time. Unit tests assert DOM text and the e2e smoke asserts page
status, so neither notices that a page it just rendered points at an asset that
is not there. That is how a fallback to `/images/placeholder.png` survived when
no such file had ever existed.

This also runs in the other direction: deleting an image that data still points
at fails here rather than in a browser.

The orphan check is the mirror image. A file under `public/` that nothing
points at costs a clone, a Docker build context and an image layer while
serving no request, and nothing else in the repo can see it: a page renders
identically whether the file is there or not.

A reference means a path that can reach a browser, so the scan reads the app's
source, data and config but not its tests. A path named in a spec or a comment
would otherwise cut both ways: it makes a missing file look referenced, and it
keeps a dead file looking alive.
"""

import os
import re
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
PUBLIC_DIR = REPO_ROOT / "apps/web/public"

# One list drives both directions. Split them and the disk side inherits a
# universe the regex cannot match: an .ico nothing could ever recognise as a
# reference is reported as an orphan however many pages point at it.
IMAGE_SUFFIXES = ("jpg", "jpeg", "png", "webp", "svg", "gif", "ico", "avif")

# Paths are written as site-absolute URLs, so they resolve against public/.
IMAGE_REF = re.compile(
    r"/images/[A-Za-z0-9_./-]+\.(?:" + "|".join(IMAGE_SUFFIXES) + ")", re.I
)

IMAGES_DIR = PUBLIC_DIR / "images"

# The whole app, not a list of the directories that happened to hold refs when
# this was written. The orphan check below turns an incomplete scan into a
# demand to delete a live asset: `hero.png` is reached only from
# tailwind.config.ts, which a src/public/prisma scan never opens.
SEARCH_ROOT = "apps/web"
SKIP_DIRS = {
    "node_modules",
    ".next",
    "__pycache__",
    "e2e",
    "out",
    "dist",
    "coverage",
    "test-results",
    "playwright-report",
}
TEST_FILE = re.compile(r"\.(?:test|spec)\.[jt]sx?$")
BINARY_SUFFIXES = {"." + s for s in IMAGE_SUFFIXES} | {".woff", ".woff2"}


def images_on_disk() -> set[str]:
    """Every file under public/images, as the site-absolute path serving it."""
    return {
        "/" + str(path.relative_to(PUBLIC_DIR).as_posix())
        for path in IMAGES_DIR.rglob("*")
        if path.is_file() and path.suffix.lower().lstrip(".") in IMAGE_SUFFIXES
    }


def referenced_images() -> dict[str, list[str]]:
    """Map each referenced /images/... path to the files that reference it."""
    found: dict[str, list[str]] = {}
    # os.walk rather than rglob so node_modules is pruned before it is walked.
    for dirpath, dirnames, filenames in os.walk(REPO_ROOT / SEARCH_ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            path = Path(dirpath) / name
            if path.suffix.lower() in BINARY_SUFFIXES or TEST_FILE.search(name):
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

    def test_images_on_disk_are_found(self):
        """The mirror of the vacuity guard above, for the disk side."""
        self.assertGreater(len(images_on_disk()), 100)

    def test_every_image_on_disk_is_referenced(self):
        orphans = sorted(images_on_disk() - set(referenced_images()))
        self.assertEqual(
            orphans,
            [],
            "image files under apps/web/public/images that nothing references; "
            "delete them, or add the reference that makes them reachable",
        )


if __name__ == "__main__":
    unittest.main()
