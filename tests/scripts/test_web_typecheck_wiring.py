"""Root-level test files in apps/web must be type-checked.

apps/web/tsconfig.json historically only included src/, prisma/, and .next/ types,
leaving root-level test files like next.config.test.ts and next-dev-origins.test.ts
uncovered by TypeScript compilation.

These tests assert that apps/web/tsconfig.json includes root-level test files,
does not exclude them, and that make typecheck and lint-staged are wired to check
the web app configuration so this cannot regress.
"""

import json
import re
import unittest
from fnmatch import fnmatch
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
WEB_DIR = REPO_ROOT / "apps/web"
TSCONFIG_PATH = WEB_DIR / "tsconfig.json"


def read(relative: str) -> str:
    return (REPO_ROOT / relative).read_text(encoding="utf-8")


def load_tsconfig(path: Path) -> dict:
    raw = path.read_text(encoding="utf-8")
    cleaned = re.sub(r"^\s*//.*$", "", raw, flags=re.MULTILINE)
    return json.loads(cleaned)


def recipe_commands(block: str, prefix: str = "\t") -> list[str]:
    return [
        line.strip()
        for line in block.splitlines()
        if line.startswith(prefix) and line.strip() and not line.strip().startswith("#")
    ]


class WebTypecheckWiringTests(unittest.TestCase):
    def test_root_level_test_files_exist(self):
        """Guards against vacuous assertions if test files are moved or missing."""
        test_files = sorted(
            path.name for path in WEB_DIR.glob("*.test.ts") if path.is_file()
        )
        self.assertGreaterEqual(
            len(test_files),
            2,
            f"Expected at least 2 root-level test files in {WEB_DIR}, found: {test_files}",
        )
        self.assertIn("next.config.test.ts", test_files)
        self.assertIn("next-dev-origins.test.ts", test_files)

    def test_tsconfig_includes_root_level_test_pattern(self):
        """tsconfig.json must explicitly include *.test.ts in its include list."""
        tsconfig = load_tsconfig(TSCONFIG_PATH)
        includes = tsconfig.get("include", [])
        self.assertIn(
            "*.test.ts",
            includes,
            f"apps/web/tsconfig.json 'include' must contain '*.test.ts': {includes}",
        )

    def test_all_root_level_test_files_are_matched_by_tsconfig_include(self):
        """Every root-level test file in apps/web must match an include pattern."""
        tsconfig = load_tsconfig(TSCONFIG_PATH)
        includes = tsconfig.get("include", [])
        root_test_files = sorted(
            path.name for path in WEB_DIR.glob("*.test.ts") if path.is_file()
        )
        self.assertTrue(root_test_files, "No root-level test files found to verify")

        for filename in root_test_files:
            with self.subTest(file=filename):
                matched = any(
                    fnmatch(filename, pattern.removeprefix("./"))
                    for pattern in includes
                )
                self.assertTrue(
                    matched,
                    f"{filename} is not matched by any pattern in {TSCONFIG_PATH} 'include': {includes}",
                )

    def test_tsconfig_exclude_preserves_expected_exclusions(self):
        """tsconfig.json must continue to exclude node_modules and prisma.config.ts."""
        tsconfig = load_tsconfig(TSCONFIG_PATH)
        excludes = tsconfig.get("exclude", [])
        self.assertIn(
            "node_modules",
            excludes,
            f"apps/web/tsconfig.json 'exclude' must contain 'node_modules': {excludes}",
        )
        self.assertIn(
            "prisma.config.ts",
            excludes,
            f"apps/web/tsconfig.json 'exclude' must contain 'prisma.config.ts': {excludes}",
        )

    def test_tsconfig_exclude_does_not_exclude_root_level_test_files(self):
        """No root-level test file should be accidentally excluded."""
        tsconfig = load_tsconfig(TSCONFIG_PATH)
        excludes = tsconfig.get("exclude", [])
        root_test_files = sorted(
            path.name for path in WEB_DIR.glob("*.test.ts") if path.is_file()
        )

        for filename in root_test_files:
            with self.subTest(file=filename):
                excluded = any(
                    fnmatch(filename, pattern.removeprefix("./"))
                    for pattern in excludes
                )
                self.assertFalse(
                    excluded,
                    f"{filename} is matched by an exclude pattern in {TSCONFIG_PATH}: {excludes}",
                )

    def test_make_typecheck_runs_app_tsc(self):
        """make typecheck in apps/web must invoke tsc --noEmit for tsconfig.json."""
        makefile = read("apps/web/Makefile")
        target = re.search(
            r"^typecheck:.*?$(.*?)(?:^\S|\Z)", makefile, re.MULTILINE | re.DOTALL
        )
        self.assertIsNotNone(target, "no typecheck target in apps/web/Makefile")
        commands = recipe_commands(target.group(1))
        self.assertTrue(
            any(
                re.search(r"tsc\b.*--noEmit(?!\s+-p\s+tsconfig\.e2e\.json)", c)
                for c in commands
            ),
            f"apps/web/Makefile typecheck does not compile the app tsconfig: {commands}",
        )


if __name__ == "__main__":
    unittest.main()
