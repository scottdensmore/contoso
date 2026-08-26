"""Guard the managed workflow against its installed Claude agent definitions."""

import json
import re
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
AGENTS_MD = REPO_ROOT / "AGENTS.md"
AGENTS_DIR = REPO_ROOT / ".claude/agents"

# Tools that would contradict a claim AGENTS.md makes about these agents.
INTERACTIVE_TOOLS = ("AskUserQuestion",)
MUTATING_TOOLS = ("Write", "Edit", "NotebookEdit")

# Step number in AGENTS.md that invokes each agent.
EXPECTED_STEP = {
    "verifier": 6,
    "ui-reviewer": 7,
    "localization-reviewer": 8,
    "code-reviewer": 9,
}
MANAGED_ROOTS = (
    ".agents/agents",
    ".agents/skills",
    ".claude/agents",
    ".claude/skills",
    ".codex/agents",
    ".cursor/agents",
    ".github/agents",
)


def defined_agents() -> set[str]:
    """Agents that actually exist on disk."""
    return {p.stem for p in AGENTS_DIR.glob("*.md")}


def workflow_agent_skills(text: str | None = None) -> dict[str, str]:
    """Agent-to-skill pairs in workflow headings, independent of installed files."""

    text = text if text is not None else AGENTS_MD.read_text(encoding="utf-8")
    contract: dict[str, str] = {}
    for step in re.finditer(r"^\d+\.\s+\*\*(.+?)\*\*", text, re.M):
        heading = step.group(1)
        for match in re.finditer(
            r"`([a-z][a-z-]*[a-z])`(?:\s+subagent)?\s+→\s+"
            r"`([a-z][a-z-]*[a-z])`(?:\s+skill)?",
            heading,
        ):
            agent, skill = match.groups()
            if agent in contract and contract[agent] != skill:
                raise ValueError(
                    f"workflow pairs {agent} with both {contract[agent]} and {skill}"
                )
            contract[agent] = skill
    return contract


def agent_names_claimed_by_docs(text: str | None = None) -> set[str]:
    """Agent roles invoked by numbered workflow headings."""

    return set(workflow_agent_skills(text))


def frontmatter(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return {}
    block = text.split("---", 2)[1]
    out: dict[str, str] = {}
    for line in block.splitlines():
        if ":" in line and not line.startswith((" ", "\t")):
            key, _, value = line.partition(":")
            out[key.strip()] = value.strip()
    return out


def denied_tools_of(fm: dict[str, str]) -> list[str]:
    """Tools the definition explicitly denies.

    Upstream replaced the `tools:` allowlist with `disallowedTools:` on purpose,
    and the reason is worth keeping here rather than only in their notes: an
    allowlist is a guess at every tool the agent will ever need, and it failed
    silently — it omitted `Skill`, so on Claude Code a definition could not load
    the paired skill it is told to follow. Everything not denied is inherited.
    """
    return [t.strip() for t in fm.get("disallowedTools", "").split(",") if t.strip()]


def allowlisted_tools_of(fm: dict[str, str]) -> list[str]:
    """Any surviving `tools:` allowlist. Should always be empty now."""
    return [t.strip() for t in fm.get("tools", "").split(",") if t.strip()]


def step_that_invokes(agent: str) -> int | None:
    """The workflow step number whose text names this agent.

    Read from AGENTS.md rather than hardcoded, so renumbering the workflow
    cannot leave the test agreeing with a stale number.
    """
    text = AGENTS_MD.read_text(encoding="utf-8")
    for match in re.finditer(r"^(\d+)\.\s+\*\*(.+?)\*\*", text, re.M):
        number, heading = match.group(1), match.group(2)
        if f"`{agent}`" in heading:
            return int(number)
    return None


def body_of(path: Path) -> str:
    """Everything after the frontmatter.

    The instruction being checked has to be in the agent's operating rules, not
    in its `description:`. The description is a routing hint the caller reads
    when picking an agent; it is not something the agent is told. Matching the
    whole file passed on `description: ... does not modify code.` for two of the
    three agents, so the check was live for exactly the one whose description
    happened to omit the phrase.
    """
    parts = path.read_text(encoding="utf-8").split("---", 2)
    return parts[2] if len(parts) > 2 else ""


def skill_followed_by(path: Path) -> str | None:
    """The skill an installed agent definition instructs itself to follow."""

    match = re.search(r"Follow the `([a-z][a-z-]*[a-z])` skill", body_of(path))
    return match.group(1) if match else None


def unmanaged_workflow_files(root: Path, installed: set[str]) -> list[str]:
    """Files under generated roots that no manifest entry owns."""

    files = (
        path
        for managed_root in MANAGED_ROOTS
        for path in (root / managed_root).rglob("*")
        if path.is_file()
    )
    unmanaged = []
    for path in files:
        relative = path.relative_to(root).as_posix()
        if not any(
            relative == entry or relative.startswith(f"{entry}/")
            for entry in installed
        ):
            unmanaged.append(relative)
    return sorted(unmanaged)


class AgentDefinitionTests(unittest.TestCase):
    def test_workflow_agent_names_are_parsed_without_installed_definitions(self):
        runbook = """# AGENTS

8. **Review (`code-reviewer` → `code-review`, `security-reviewer` → `security-review`)**:
"""

        self.assertEqual(
            workflow_agent_skills(runbook),
            {
                "code-reviewer": "code-review",
                "security-reviewer": "security-review",
            },
        )

    def test_workflow_agent_skills_exist_and_match_definitions(self):
        contract = workflow_agent_skills()
        installed_skills = {
            path.name for path in (REPO_ROOT / ".claude/skills").iterdir() if path.is_dir()
        }

        self.assertEqual(set(contract.values()) - installed_skills, set())
        for agent, skill in sorted(contract.items()):
            with self.subTest(agent=agent, skill=skill):
                self.assertEqual(
                    skill_followed_by(AGENTS_DIR / f"{agent}.md"),
                    skill,
                    f"{agent} does not follow the skill paired with it in AGENTS.md",
                )

    def test_installer_manifest_owns_every_agent_and_skill_file(self):
        manifest = json.loads(
            (REPO_ROOT / ".agents/agent-skills.json").read_text(encoding="utf-8")
        )
        installed = set(manifest["installed"])

        self.assertEqual(
            [entry for entry in sorted(installed) if not (REPO_ROOT / entry).exists()],
            [],
            "reinstall workflow assets missing from the installer manifest",
        )

        self.assertEqual(
            unmanaged_workflow_files(REPO_ROOT, installed),
            [],
            "remove obsolete agent/skill files or reinstall the managed workflow bundle",
        )

    def test_unmanaged_workflow_file_detection_opens_the_fixture(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            current = root / ".claude/agents/verifier.md"
            obsolete = root / ".claude/skills/old-review/SKILL.md"
            current.parent.mkdir(parents=True)
            obsolete.parent.mkdir(parents=True)
            current.write_text("current\n", encoding="utf-8")
            obsolete.write_text("obsolete\n", encoding="utf-8")

            unmanaged = unmanaged_workflow_files(
                root, {".claude/agents/verifier.md"}
            )

        self.assertEqual(unmanaged, [".claude/skills/old-review/SKILL.md"])

    def test_every_agent_the_docs_name_exists(self):
        for name in sorted(EXPECTED_STEP):
            with self.subTest(agent=name):
                self.assertTrue(
                    (AGENTS_DIR / f"{name}.md").is_file(),
                    f"AGENTS.md names '{name}' but .claude/agents/{name}.md is missing",
                )

    def test_docs_reference_every_defined_agent(self):
        self.assertEqual(
            agent_names_claimed_by_docs(),
            set(EXPECTED_STEP),
            "AGENTS.md's sub-agent section should name exactly the agents the workflow uses",
        )

    def test_no_undocumented_agent_exists(self):
        """A new definition must be a deliberate decision, not a silent addition.

        Without this, someone can add .claude/agents/<name>.md granting Write
        and AskUserQuestion, mention it nowhere, and every other test here still
        passes — while this file claims none of them can modify the repository.
        """
        self.assertEqual(
            defined_agents(),
            set(EXPECTED_STEP),
            "every agent in .claude/agents/ must be named in AGENTS.md and listed "
            "in EXPECTED_STEP; add it deliberately or remove it",
        )

    def test_agents_are_told_to_return_a_verdict_unattended(self):
        """Review stages must return a verdict without blocking for input.

        **This guarantee is weaker than it was, and the weakening is upstream's,
        deliberate.** It used to be enforced by the absence of `AskUserQuestion`
        from an allowlist. The allowlist is gone, and a denylist naming only the
        editing tools leaves every other tool inherited — so nothing at the tool
        level now stops one of these agents asking a question.

        What is still checkable is the instruction, so that is what this asserts.
        Stated plainly rather than quietly downgraded: upstream made the same
        trade for hosts that document no denylist, and called body text "weaker,
        and honest about being weaker". If `AskUserQuestion` ever needs to be
        denied again, `disallowedTools:` is where it goes.
        """
        for name in sorted(defined_agents() | set(EXPECTED_STEP)):
            with self.subTest(agent=name):
                body = body_of(AGENTS_DIR / f"{name}.md")
                # `code-reviewer` opens "report findings" rather than "report a
                # verdict" -- its verdict lives in the report format. The shared
                # guarantee is that each is told to *return* a result, not to ask
                # for one, so that is what this matches.
                self.assertRegex(
                    body,
                    r"(?i)report (a verdict|findings)",
                    f"{name} is not told to report a verdict or findings, which is "
                    "the only remaining guard that it will not block for input",
                )
                # And nothing instructs it to ask. Weak, and the weakness is the
                # point of this test's docstring -- but a definition that started
                # telling an agent to consult the user would at least be caught.
                self.assertNotIn(
                    "AskUserQuestion",
                    body,
                    f"{name} names AskUserQuestion in its body; if asking is "
                    "intended, deny it or say so deliberately",
                )

    def test_agents_deny_the_direct_editing_tools(self):
        """AGENTS.md claims none of them carries a tool whose purpose is editing.

        Checked against the denylist rather than an allowlist. The guarantee is
        the same and the mechanism is stronger: an allowlist withheld everything
        nobody thought of, including tools these agents need, while a denylist
        names exactly the three that must never be reachable.
        """
        for name in sorted(defined_agents() | set(EXPECTED_STEP)):
            with self.subTest(agent=name):
                denied = denied_tools_of(frontmatter(AGENTS_DIR / f"{name}.md"))
                # Assert parsing succeeded first. `assertIn(x, [])` fails for the
                # wrong reason, and an unparseable frontmatter would otherwise be
                # reported as a missing denial.
                self.assertTrue(
                    denied, f"{name}: could not parse a disallowedTools list"
                )
                for banned in MUTATING_TOOLS:
                    self.assertIn(
                        banned,
                        denied,
                        f"{name} does not deny {banned}, an editing tool; AGENTS.md "
                        "claims these agents carry none",
                    )

    # The verifier is the exception, and it is deliberate: running a project's
    # gate writes — build output, caches, coverage — so a read-only sandbox makes
    # the one agent whose job is running the gate unable to do it. Upstream
    # declares `sandbox_mode: workspace-write` for it and derives `readonly:
    # false`; its prohibition on editing is carried by `disallowedTools` and by
    # its body instead. Every reviewer stays read-only.
    NOT_READ_ONLY = {"verifier"}

    def test_agent_definitions_are_read_only_by_contract(self):
        """Reviewers must request read-only execution; all four must forbid edits."""

        for name in sorted(defined_agents() | set(EXPECTED_STEP)):
            with self.subTest(agent=name):
                path = AGENTS_DIR / f"{name}.md"
                expected = "false" if name in self.NOT_READ_ONLY else "true"
                self.assertEqual(
                    frontmatter(path).get("readonly"),
                    expected,
                    f"{name} declares readonly="
                    f"{frontmatter(path).get('readonly')!r}, expected {expected!r}"
                    + (
                        " — a gate that cannot run a build is not a gate"
                        if name in self.NOT_READ_ONLY
                        else " — reviewers read a diff and need nothing else"
                    ),
                )
                self.assertRegex(
                    body_of(path),
                    r"(?i)never edit files",
                    f"{name} does not explicitly forbid editing",
                )

    def test_workflow_invokes_each_agent_at_the_expected_step(self):
        """The managed workflow and its guard must agree on role names and order."""

        for name, expected in sorted(EXPECTED_STEP.items()):
            with self.subTest(agent=name):
                step = step_that_invokes(name)
                self.assertIsNotNone(
                    step, f"no numbered workflow step in AGENTS.md names `{name}`"
                )
                self.assertEqual(
                    step,
                    expected,
                    f"AGENTS.md invokes {name} at step {step}, but this test expects "
                    f"{expected}; update EXPECTED_STEP if the workflow was renumbered",
                )

    def test_no_agent_carries_a_tool_allowlist(self):
        """An allowlist reads as a guarantee and behaves as a cage.

        This test used to require one. Upstream removed allowlists outright after
        measuring the cost — the list omitted `Skill`, so on the primary host a
        definition could not load the skill it is told to follow, and the fix
        that proves the shape is wrong is "append the missing tool". A returning
        allowlist would silently withhold whatever nobody predicted next.
        """
        for name in sorted(defined_agents() | set(EXPECTED_STEP)):
            with self.subTest(agent=name):
                fm = frontmatter(AGENTS_DIR / f"{name}.md")
                self.assertEqual(
                    allowlisted_tools_of(fm),
                    [],
                    f"{name} carries a `tools:` allowlist; the contract is a "
                    "denylist, and everything unnamed is inherited",
                )
                self.assertTrue(
                    denied_tools_of(fm),
                    f"{name} denies nothing, so it inherits the editing tools",
                )


if __name__ == "__main__":
    unittest.main()
