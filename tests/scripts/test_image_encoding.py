"""Catalogue images stay WebP at display resolution.

The catalogue arrived as 1024x1024 originals, 102 of them lossless PNG
encodings of photographs at ~3 MB each, for pages that render at 350px and
550px. Nothing could see that: the app renders identically from a 3 MB source
and a 60 KB one, so every check in this repository passed while the web image
carried half a gigabyte it could not use.

That is the failure this file exists to prevent recurring. It reads what is on
disk rather than trusting that whoever added an image ran the converter --
`scripts/reencode-catalogue-images.mjs` -- and it asserts the three properties
that made the originals expensive: the encoding, the resolution, and the weight.

Dimensions come from the RIFF header directly. Pillow is not a dependency of
this repository and a guard that has to be installed to run is a guard that
stops running.
"""

import json
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
IMAGES_DIR = REPO_ROOT / "apps/web/public/images"

# The same file the converter reads its defaults from. Two copies of one
# encoding decision is how a guard ends up describing what the tool used to do:
# someone re-encodes at a new setting, the converter is told, and this file is
# not.
CONFIG = json.loads((REPO_ROOT / "config/catalogue_images.json").read_text())

# The images that are not part of the catalogue contract. `about/mission.png`
# is the only one left, and what exempts it is the generation count at
# delivery: it is a lossless source the optimiser re-encodes on every request,
# so converting it would make what a visitor receives a third generation. The
# two backgrounds #158 converted are terminal -- nothing re-encodes them again
# -- so contact-bg went from one lossy generation to two rather than to three,
# measured at about 45 dB PSNR against the original render. See #165.
#
# The name says full-bleed and the reason is not: mission.png renders at most
# 604 CSS px, half its container. What exempts it is that 604 at 2x already
# wants more source than the 1024 it has.
#
# Listed rather than pattern-matched, so a new exemption has to say so.
FULL_BLEED = set(CONFIG["fullBleed"])

MAX_DIMENSION = CONFIG["maxDimension"]

# Two ceilings, catching two different mistakes.
#
# MAX_BYTES fails if any single image exceeds it, which is what dropping back to
# lossless does immediately: most of a lossless corpus lands over the ceiling,
# so that mistake never reaches the mean check.
#
# MAX_MEAN_BYTES is for the mistake that clears the per-file ceiling everywhere
# and still inflates the catalogue -- a re-encode at a higher quality, where no
# individual file looks wrong and the corpus grows anyway. The mean rather than
# the total, so that adding products does not fail a check about how they are
# encoded.
#
# The measurements behind both numbers live in the config's `_weights`, and
# deliberately only there. Restating them here is how this file and the config
# ended up quoting different figures for the same quantity, which is the drift
# the shared config exists to prevent.
MAX_BYTES = CONFIG["maxBytes"]
MAX_MEAN_BYTES = CONFIG["maxMeanBytes"]

IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}


def webp_dimensions(data: bytes) -> tuple[int, int]:
    """Canvas size from a WebP RIFF header, for the three chunk layouts."""
    if data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        raise ValueError("not a WebP file")
    chunk = data[12:16]
    payload = data[20:]

    if chunk == b"VP8 ":
        if payload[3:6] != b"\x9d\x01\x2a":
            raise ValueError("VP8 keyframe sync code missing")
        width = int.from_bytes(payload[6:8], "little") & 0x3FFF
        height = int.from_bytes(payload[8:10], "little") & 0x3FFF
        return width, height
    if chunk == b"VP8L":
        if payload[0] != 0x2F:
            raise ValueError("VP8L signature missing")
        bits = int.from_bytes(payload[1:5], "little")
        return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
    if chunk == b"VP8X":
        width = int.from_bytes(payload[4:7], "little") + 1
        height = int.from_bytes(payload[7:10], "little") + 1
        return width, height
    raise ValueError(f"unrecognised WebP chunk: {chunk!r}")


def raster_dimensions(data: bytes) -> tuple[int, int]:
    """Canvas size from a PNG, JPEG or WebP header.

    Only as much of each format as the allowlist needs: PNG carries width and
    height at a fixed offset in the IHDR chunk, and JPEG in whichever SOF marker
    the encoder used, which has to be walked to.
    """
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return (
            int.from_bytes(data[16:20], "big"),
            int.from_bytes(data[20:24], "big"),
        )
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return webp_dimensions(data)
    if data[:2] == b"\xff\xd8":
        offset = 2
        while offset + 9 < len(data):
            if data[offset] != 0xFF:
                raise ValueError("JPEG segment out of sync")
            marker = data[offset + 1]
            length = int.from_bytes(data[offset + 2 : offset + 4], "big")
            # SOF0-SOF15, excluding the non-frame markers that share the range.
            if 0xC0 <= marker <= 0xCF and marker not in (0xC4, 0xC8, 0xCC):
                return (
                    int.from_bytes(data[offset + 7 : offset + 9], "big"),
                    int.from_bytes(data[offset + 5 : offset + 7], "big"),
                )
            offset += 2 + length
        raise ValueError("no JPEG frame header found")
    raise ValueError("unrecognised image format")


def catalogue_images() -> list[Path]:
    """Every image under public/images that is not an allowlisted background."""
    return sorted(
        path
        for path in IMAGES_DIR.rglob("*")
        if path.is_file()
        and path.suffix.lower() in IMAGE_SUFFIXES
        and path.relative_to(IMAGES_DIR).as_posix() not in FULL_BLEED
    )


class WebpHeaderTests(unittest.TestCase):
    """The parser above is the thing every assertion below depends on."""

    def test_reads_a_real_catalogue_image(self):
        image = catalogue_images()[0]
        width, height = webp_dimensions(image.read_bytes())
        self.assertGreater(width, 0)
        self.assertGreater(height, 0)

    def test_rejects_a_non_webp_file(self):
        with self.assertRaises(ValueError):
            webp_dimensions(b"\x89PNG\r\n\x1a\n" + b"\x00" * 32)


class CatalogueEncodingTests(unittest.TestCase):
    def test_catalogue_images_are_found(self):
        """Guards against every assertion below passing on an empty set."""
        self.assertGreater(len(catalogue_images()), 100)

    def test_full_bleed_allowlist_is_not_stale(self):
        """An allowlist naming files that no longer exist stops being a decision."""
        missing = sorted(name for name in FULL_BLEED if not (IMAGES_DIR / name).is_file())
        self.assertEqual(missing, [], "allowlisted images no longer exist")

    def test_catalogue_images_are_webp(self):
        others = sorted(
            path.relative_to(IMAGES_DIR).as_posix()
            for path in catalogue_images()
            if path.suffix.lower() != ".webp"
        )
        self.assertEqual(
            others,
            [],
            "catalogue images must be WebP; run "
            "`node scripts/reencode-catalogue-images.mjs`",
        )

    def test_full_bleed_images_fit_the_srcset_ceiling(self):
        """The allowlist is exempt from the encoding, not from the delivery.

        `apps/web/next.config.js` derives its `deviceSizes` ceiling from
        `maxDimension`, because the optimiser never upscales and every srcset
        candidate above the largest source returns identical bytes. So an
        exempt image that goes through the optimiser and is wider than
        `maxDimension` would be capped on delivery with nothing to say so.

        The allowlist is one file now -- #158 converted the two CSS backgrounds
        and moved them into the contract -- and that one does go through the
        optimiser, so this applies to all of it. The reader is still generic
        because the allowlist is not: an exemption added tomorrow may be any
        format, and reading headers directly costs nothing.
        """
        undersupplied = {}
        for name in sorted(FULL_BLEED):
            path = IMAGES_DIR / name
            if not path.is_file():
                continue  # covered by test_full_bleed_allowlist_is_not_stale
            width, height = raster_dimensions(path.read_bytes())
            if max(width, height) > MAX_DIMENSION:
                undersupplied[name] = f"{width}x{height}"
        self.assertEqual(
            undersupplied,
            {},
            f"full-bleed images wider than the {MAX_DIMENSION}px srcset ceiling "
            "derived in apps/web/next.config.js; they would be served capped",
        )

    def test_catalogue_images_are_at_display_resolution(self):
        # Report every offender rather than raising on the first unreadable
        # header: a file the parser chokes on would otherwise mask genuinely
        # oversized images later in the walk. Non-WebP files are the test above.
        oversized = {}
        for path in catalogue_images():
            if path.suffix.lower() != ".webp":
                continue
            try:
                width, height = webp_dimensions(path.read_bytes())
            except ValueError as error:
                oversized[path.relative_to(IMAGES_DIR).as_posix()] = f"unreadable: {error}"
                continue
            if max(width, height) > MAX_DIMENSION:
                oversized[path.relative_to(IMAGES_DIR).as_posix()] = f"{width}x{height}"
        self.assertEqual(
            oversized,
            {},
            f"images must be at most {MAX_DIMENSION}px on the long edge, which is "
            "what the originals were; the catalogue renders at 350 and 550. Do not "
            "reach for maxDimension to admit a sharper full-bleed background: it "
            "governs all of the catalogue too, and next.config.js derives the srcset "
            "ceiling from it, so raising it re-adds duplicate candidates for 854 "
            "images that cannot use them -- while the background gains nothing, "
            "because a CSS background-image never reaches the optimiser. That needs "
            "the two ceilings separated first",
        )

    def test_no_catalogue_image_exceeds_the_outlier_ceiling(self):
        heavy = {
            path.relative_to(IMAGES_DIR).as_posix(): f"{path.stat().st_size // 1024} KiB"
            for path in catalogue_images()
            if path.stat().st_size > MAX_BYTES
        }
        self.assertEqual(
            heavy,
            {},
            f"catalogue images must be at most {MAX_BYTES // 1024} KiB each",
        )

    def test_catalogue_mean_weight_is_within_the_ceiling(self):
        """The per-file ceiling above is blind to a uniform quality bump.

        Re-encoding the catalogue at a higher quality leaves every file well
        under that ceiling while the corpus grows anyway. Nothing else in this
        repository would notice: the pages render identically, and the only
        symptom is a container that quietly regained what #96 removed.

        What this does not catch, so nobody reads it as more than it is:

        - A modest bump. The ceiling bites from around q95; a re-encode a
          notch or two above the configured quality passes. The config's
          `_weights` has the measured means per setting.
        - A *partial* regression. Moving the mean past the ceiling takes a
          large fraction of the catalogue, because the rest holds the average
          down. One category re-encoded by hand at a heavier lossy setting
          stays invisible to both checks -- though a lossless hand-edit does
          not, since the per-file ceiling catches it, and a PNG one fails the
          format check above.
        """
        images = catalogue_images()
        mean = sum(path.stat().st_size for path in images) / len(images)
        self.assertLessEqual(
            mean,
            MAX_MEAN_BYTES,
            f"catalogue mean is {mean / 1024:.0f} KiB against a "
            f"{MAX_MEAN_BYTES // 1024} KiB ceiling across {len(images)} images; "
            "re-encoded at the wrong quality or losslessly?",
        )


if __name__ == "__main__":
    unittest.main()
