"""Guard which Dependabot group a package lands in, for packages whose name lies.

`eslint-config-next` is published from the Next.js repository and carries Next's
version numbers. Its name says ESLint, and `eslint-*` in the `eslint` group's
patterns believed the name -- so it versioned with a family it does not belong
to, and inherited that family's blockers. While the ESLint 10 major was
unmergeable, #223 bundled the two into one pull request and neither could land;
`main` sat with `next` at 16.3.0 against `eslint-config-next` 16.2.12. That is
#252.

The assertion is on group *membership*, computed from the config's own patterns,
rather than on the presence of the lines that produce it. The two come apart in
both directions worth catching: an `exclude-patterns` entry can be dropped while
the explicit pattern below it stays, or a new group matching `eslint-*` can be
declared above `next` and take the package back without either existing line
changing. Grepping for either line reads as correct in both cases.

**This models Dependabot rather than running it**, which is the same compromise
`test_dependabot_holds.py` makes for npm resolution and states in its own
docstring: Dependabot's reading of this file is only observable from a Dependabot
run. Three rules are modelled -- a dependency joins the first group whose
patterns match it, `exclude-patterns` removes it from that group's match set, and
a group carrying `update-types` claims only those types.

First-match-wins is not taken on documentation alone; this repository's own
history shows it. `82c01ac` (#256) bumped `eslint-config-next` and carries
Dependabot's trailer `dependency-group: eslint` -- so `eslint-*` really did claim
it. And it appeared in that group *only*, though `npm-minor-patch`'s `"*"` matches
it too: if every matching group claimed a package, the family-plus-catch-all
idiom used throughout this file would put every package in two pull requests, and
it does not.

What none of this guards is Dependabot changing those rules upstream, which would
leave the model agreeing with itself. That is the accepted limit, the same one
`test_dependabot_holds.py` accepts for npm. `test_model_matches_the_declaration_order_it_depends_on`
is not a defence against it: `groups()` re-reads the order from the file on every
run, so there is no stored order to go stale. What that test actually guards is
narrower and worth having -- that `eslint` is still declared before `next`, and
so that the exclude is still doing work rather than sitting there decorative.

`yaml` is deliberately not imported, for the reason `test_dependabot_holds.py`
gives: CI's script-test job builds a bare virtualenv, so a third-party import
passes locally and fails there.
"""

import fnmatch
import re
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DEPENDABOT_CONFIG = REPO_ROOT / ".github/dependabot.yml"

# The package this module exists for, and the group it belongs to.
PACKAGE = "eslint-config-next"
EXPECTED_GROUP = "next"


def update_entry(ecosystem: str, directory: str) -> list[str]:
    """The lines of one `updates:` entry, selected by ecosystem and directory."""
    lines = DEPENDABOT_CONFIG.read_text(encoding="utf-8").splitlines()
    starts = [i for i, line in enumerate(lines) if "- package-ecosystem:" in line]
    for position, start in enumerate(starts):
        end = starts[position + 1] if position + 1 < len(starts) else len(lines)
        entry = lines[start:end]
        body = "\n".join(entry)
        if f'package-ecosystem: "{ecosystem}"' in body and f'directory: "{directory}"' in body:
            return entry
    return []


def groups(entry: list[str]) -> list[tuple[str, list[str], list[str], list[str]]]:
    """Each group in declaration order, as (name, patterns, excludes, update_types).

    Order is carried rather than discarded because first-match-wins is the rule
    being modelled; a dict keyed by name would drop the one input the answer
    depends on.

    `update-types` is carried for the same reason. Read and thrown away, the
    model would answer for a group Dependabot would skip: adding
    `update-types: ["minor", "patch"]` to `next` leaves an `eslint-config-next`
    *major* ungrouped and decoupled from `next` -- the guarantee this module
    exists for -- while every assertion below still passed.
    """
    out: list[tuple[str, list[str], list[str], list[str]]] = []
    inside = False
    name = ""
    key = ""
    patterns: list[str] = []
    excludes: list[str] = []
    types: list[str] = []

    def flush() -> None:
        if name:
            out.append((name, list(patterns), list(excludes), list(types)))

    for line in entry:
        if re.fullmatch(r"\s*groups:\s*", line):
            inside = True
            continue
        if not inside:
            continue
        # A key at the entry's own indentation ends the groups block.
        if line.strip() and not line.startswith("      "):
            break
        header = re.fullmatch(r"\s{6}([A-Za-z][\w-]*):\s*", line)
        if header:
            flush()
            name, key = header.group(1), ""
            patterns, excludes, types = [], [], []
            continue
        listing = re.fullmatch(r"\s{8}(patterns|exclude-patterns|update-types):\s*", line)
        if listing:
            key = listing.group(1)
            continue
        item = re.fullmatch(r'\s{10}-\s*"([^"]*)"\s*', line)
        if item and key == "patterns":
            patterns.append(item.group(1))
        elif item and key == "exclude-patterns":
            excludes.append(item.group(1))
        elif item and key == "update-types":
            types.append(item.group(1))
    flush()
    return out


def group_for(
    package: str,
    declared: list[tuple[str, list[str], list[str], list[str]]],
    update_type: str = "minor",
) -> str | None:
    """The first group claiming `package` for `update_type`.

    A group with no `update-types` claims every type; one that names them claims
    only those, so the same package can land in different groups -- or in none --
    depending on the size of the bump.

    `"minor"` rather than `"version-update:semver-minor"`: a group's
    `update-types` takes the bare form, and only the `ignore` block above it uses
    the prefixed one. Passing the prefixed string here would match no group that
    names its types, and the model would quietly report everything ungrouped.
    """
    for name, patterns, excludes, types in declared:
        if types and update_type not in types:
            continue
        if any(fnmatch.fnmatchcase(package, pattern) for pattern in excludes):
            continue
        if any(fnmatch.fnmatchcase(package, pattern) for pattern in patterns):
            return name
    return None


class DependabotGroupingTests(unittest.TestCase):
    def setUp(self) -> None:
        self.entry = update_entry("npm", "/apps/web")
        self.groups = groups(self.entry)

    def test_the_web_npm_entry_declares_groups(self):
        # Vacuity guard. Every assertion below passes against an empty list --
        # `group_for` returns None, and a mistyped indent or a renamed key would
        # produce exactly that while looking like a parse.
        self.assertTrue(self.entry, "no npm entry for /apps/web in dependabot.yml")
        self.assertGreaterEqual(len(self.groups), 5, f"parsed only {self.groups}")

    def test_eslint_config_next_versions_with_next(self):
        self.assertEqual(group_for(PACKAGE, self.groups), EXPECTED_GROUP)

    def test_eslint_group_still_claims_eslint_itself(self):
        # The exclude has to be narrower than the pattern it corrects. Excluding
        # `eslint-*` wholesale would satisfy the test above and quietly ungroup
        # every real ESLint plugin, which is the lockstep failure the grouping
        # exists to prevent.
        self.assertEqual(group_for("eslint", self.groups), "eslint")
        self.assertEqual(group_for("eslint-plugin-jsx-a11y", self.groups), "eslint")
        self.assertEqual(group_for("@typescript-eslint/parser", self.groups), "eslint")

    def test_next_itself_is_unaffected(self):
        self.assertEqual(group_for("next", self.groups), "next")
        self.assertEqual(group_for("@next/third-parties", self.groups), "next")

    def test_the_pairing_holds_for_a_major_too(self):
        # The bump that matters most is the one this pairing exists for: a Next
        # major must carry `eslint-config-next` with it. Neither group names
        # `update-types`, so both claim every type -- but a later edit adding
        # `update-types: [minor, patch]` to `next` would decouple exactly the
        # case the grouping is for, while every minor-bump assertion above
        # stayed green.
        for package in ("next", PACKAGE):
            self.assertEqual(group_for(package, self.groups, "major"), EXPECTED_GROUP)

    def test_the_catch_all_group_claims_only_minor_and_patch(self):
        # Reads the other side of `update-types`, so the model is exercised
        # against a group that declares them rather than only groups that do
        # not. `npm-minor-patch` takes a stray minor; a stray major is grouped
        # by nothing and arrives on its own, which is what the file's header
        # comment says majors are for.
        self.assertEqual(group_for("clsx", self.groups, "minor"), "npm-minor-patch")
        self.assertIsNone(group_for("clsx", self.groups, "major"))

    def test_model_matches_the_declaration_order_it_depends_on(self):
        # The model's answer is only meaningful if `eslint` really is declared
        # before `next`; were that reversed, the exclude would be unnecessary and
        # this module would be asserting a rule the file no longer relies on.
        names = [group[0] for group in self.groups]
        self.assertIn("eslint", names)
        self.assertIn("next", names)
        self.assertLess(
            names.index("eslint"),
            names.index("next"),
            "`next` now precedes `eslint`; the exclude may be redundant -- recheck #252",
        )
