"""Guard each Dependabot version hold against the upstream fact that justifies it.

An `ignore` entry in `.github/dependabot.yml` is a claim about the outside world:
that a resolver cannot install the upgrade. Claims like that expire silently. The
upstream project ships support, the hold keeps suppressing the pull request, and
the repository sits on an old major with nothing to say so.

Two assertions, catching two different mistakes:

- `test_next_eslint_major_is_still_unsupported_upstream` measures the fact. It
  reads every `eslint` peer range declared in the web lockfile and fails once
  none of them caps below the next major -- the signal to delete the hold, close
  #69, and delete this module.
- `test_config_holds_the_eslint_major` measures the declaration, and only the
  declaration. It catches the hold being dropped while the block is still real,
  which is what reopens the unmergeable weekly pull request (#223). It reads the
  hold out of the npm `/apps/web` entry specifically: a hold under one of the
  three `pip` entries would apply to the wrong dependency set while still
  reading, to an unscoped search, as present.

**The whole set, not one member.** Three packages cap ESLint below 10 today, and
`eslint-plugin-jsx-a11y` is only the one named in #69. The other two are pinned
inside `eslint-config-next`, so bumping ESLint alone does not move them. Tracking
one would mean that when jsx-a11y ships support first, this suite says the hold
is stale while `npm install` still fails -- sending someone to reopen exactly the
pull request the hold exists to suppress.

**An unreadable range counts as not blocking.** `admitted_majors` understands the
comparators these ranges actually use and reports the rest as unparsed. A range
carrying an unparsed token cannot be shown to exclude the major, so it is not
counted as a blocker: an upstream that starts writing `>=10` or `^10.0.0-0` --
both already present in this lockfile for other packages -- moves the suite
toward failing loudly rather than toward holding on in silence.

What this cannot catch: Dependabot's own reading of the config, which is only
observable from a Dependabot run; and npm's real resolution, which this
approximates by skipping any package with its own nested `eslint`. Every package
declaring an `eslint` peer here resolves against the hoisted one today, so that
filter is currently a no-op kept for the case where it stops being one.

`yaml` is deliberately not imported: CI's script-test job builds a bare
virtualenv, so a third-party import passes locally and fails there.
"""

import json
import re
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DEPENDABOT_CONFIG = REPO_ROOT / ".github/dependabot.yml"
WEB_LOCKFILE = REPO_ROOT / "apps/web/package-lock.json"

ESLINT_PACKAGE = "node_modules/eslint"


def lockfile_packages() -> dict:
    return json.loads(WEB_LOCKFILE.read_text(encoding="utf-8")).get("packages", {})


def installed_major(package: str) -> int:
    version = lockfile_packages().get(package, {}).get("version", "")
    match = re.match(r"(\d+)\.", version)
    if not match:
        raise AssertionError(f"no parseable version for {package} in {WEB_LOCKFILE}")
    return int(match.group(1))


def eslint_peer_ranges() -> dict[str, str]:
    """Every package declaring an `eslint` peer that resolves against the hoisted one."""
    packages = lockfile_packages()
    ranges = {}
    for name, meta in packages.items():
        if not isinstance(meta, dict):
            continue
        peers = meta.get("peerDependencies")
        if not isinstance(peers, dict) or "eslint" not in peers:
            continue
        if f"{name}/node_modules/eslint" in packages:
            continue
        ranges[name] = peers["eslint"]
    return ranges


def admitted_majors(spec: str) -> tuple[set[int], list[str]]:
    """Major versions a `^3 || ^4` style range admits, and the tokens not understood.

    Deliberately narrow. Returning the failures rather than dropping them is the
    point: a caller that treats "did not parse" as "does not admit" would let the
    hold outlive an upstream that changed comparator style.
    """
    majors: set[int] = set()
    unparsed: list[str] = []
    for token in spec.split("||"):
        token = token.strip()
        if not token:
            continue
        caret = re.fullmatch(r"\^(\d+)(?:\.\d+)*", token)
        if caret:
            majors.add(int(caret.group(1)))
            continue
        exact = re.fullmatch(r"(\d+)(?:\.[\dx*]+)*", token)
        if exact:
            majors.add(int(exact.group(1)))
            continue
        unparsed.append(token)
    return majors, unparsed


def classify_peers(major: int) -> tuple[dict[str, str], dict[str, str], dict[str, str]]:
    """Split every declared `eslint` peer range three ways against `major`.

    Returns (blocking, admitting, unreadable). The third group is the one worth
    seeing: those ranges are *treated as* admitting the major because nothing
    here can show otherwise, which is not the same as having read them and found
    the major allowed. `>=3 <10` lands there while still capping at 9.
    """
    blocking, admitting, unreadable = {}, {}, {}
    for name, spec in eslint_peer_ranges().items():
        majors, unparsed = admitted_majors(spec)
        if unparsed or not majors:
            unreadable[name] = spec
        elif major in majors:
            admitting[name] = spec
        else:
            blocking[name] = spec
    return blocking, admitting, unreadable


def blockers(major: int) -> dict[str, str]:
    """Packages whose declared peer range demonstrably excludes `major`."""
    return classify_peers(major)[0]


def update_entry(ecosystem: str, directory: str) -> list[str]:
    """The lines of one `updates:` entry, selected by ecosystem and directory.

    The hold has to sit in the entry that actually builds `apps/web`. Scoping by
    ecosystem alone is not enough -- this file carries three separate `pip`
    entries -- and an unscoped search would accept a hold placed under any of
    them, which Dependabot would apply to the wrong dependency set.
    """
    lines = DEPENDABOT_CONFIG.read_text(encoding="utf-8").splitlines()
    starts = [i for i, line in enumerate(lines) if "- package-ecosystem:" in line]
    for position, start in enumerate(starts):
        end = starts[position + 1] if position + 1 < len(starts) else len(lines)
        entry = lines[start:end]
        body = "\n".join(entry)
        if f'package-ecosystem: "{ecosystem}"' in body and f'directory: "{directory}"' in body:
            return entry
    return []


def eslint_hold_block() -> str:
    """The lines of the `eslint` ignore entry, or "" when there is no such entry."""
    lines = update_entry("npm", "/apps/web")
    for index, line in enumerate(lines):
        if re.fullmatch(r'\s*-\s*dependency-name:\s*"?eslint"?\s*', line):
            indent = len(line) - len(line.lstrip())
            block = [line]
            for following in lines[index + 1 :]:
                if following.strip() and (len(following) - len(following.lstrip())) <= indent:
                    break
                block.append(following)
            return "\n".join(block)
    return ""


class EslintMajorHoldTests(unittest.TestCase):
    def test_lockfile_declares_eslint_peers(self):
        """Vacuity guard: a lockfile shape change empties the staleness claim."""
        ranges = eslint_peer_ranges()
        self.assertTrue(
            ranges, f"no package in {WEB_LOCKFILE} declares an eslint peer range"
        )

    def test_web_npm_update_entry_is_locatable(self):
        """Vacuity guard: a renamed directory empties the hold assertion below."""
        entry = update_entry("npm", "/apps/web")
        self.assertTrue(
            entry, f'no npm entry for "/apps/web" found in {DEPENDABOT_CONFIG}'
        )
        self.assertIn("groups:", "\n".join(entry))

    def test_next_eslint_major_is_still_unsupported_upstream(self):
        blocked = installed_major(ESLINT_PACKAGE) + 1
        still_blocking, admitting, unreadable = classify_peers(blocked)

        def listing(ranges: dict[str, str]) -> str:
            return "\n".join(f"    {name} -> {spec}" for name, spec in sorted(ranges.items()))

        report = f"\n  admits eslint {blocked}:\n{listing(admitting)}"
        if unreadable:
            report += (
                f"\n  NOT READ, so counted as admitting -- check these before acting, "
                f"a range like `>=3 <{blocked}` still caps:\n{listing(unreadable)}"
            )
        self.assertTrue(
            still_blocking,
            f"nothing in {WEB_LOCKFILE} caps eslint below {blocked} any more, so the "
            f"hold in {DEPENDABOT_CONFIG} is stale. Remove it, close #69, and delete "
            f"this module with them.{report}",
        )

    def test_config_holds_the_eslint_major(self):
        block = eslint_hold_block()
        self.assertTrue(
            block,
            f"{DEPENDABOT_CONFIG} has no ignore entry for eslint, so Dependabot will "
            f"reopen the ESLint major every week while it cannot install (#223). If "
            f"the hold was removed on purpose, delete this module too.",
        )
        self.assertIn("version-update:semver-major", block)


if __name__ == "__main__":
    unittest.main()
