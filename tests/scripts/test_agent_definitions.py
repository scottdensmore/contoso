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
EXPECTED_STEP = {"verifier": 6, "ui-reviewer": 7, "code-reviewer": 8}
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


def tools_of(fm: dict[str, str]) -> list[str]:
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

    def test_agents_cannot_ask_questions(self):
        """Generated review stages must return a verdict without blocking for input."""
        for name in sorted(defined_agents() | set(EXPECTED_STEP)):
            with self.subTest(agent=name):
                tools = tools_of(frontmatter(AGENTS_DIR / f"{name}.md"))
                # Assert parsing succeeded first. `assertNotIn(x, [])` is
                # trivially true, so an unparseable frontmatter would let this
                # test pass while proving nothing.
                self.assertTrue(tools, f"{name}: could not parse a tools list")
                for banned in INTERACTIVE_TOOLS:
                    self.assertNotIn(
                        banned,
                        tools,
                        f"{name} has {banned}, so it can block waiting for a human; "
                        "workflow review stages must run unattended",
                    )

    def test_agents_have_no_direct_editing_tools(self):
        """AGENTS.md claims none of them carries a tool whose purpose is editing.

        This checks tool grants separately from the definition's explicit
        read-only declaration and instruction not to edit files.
        """
        for name in sorted(defined_agents() | set(EXPECTED_STEP)):
            with self.subTest(agent=name):
                tools = tools_of(frontmatter(AGENTS_DIR / f"{name}.md"))
                self.assertTrue(tools, f"{name}: could not parse a tools list")
                for banned in MUTATING_TOOLS:
                    self.assertNotIn(
                        banned,
                        tools,
                        f"{name} has {banned}, an editing tool; AGENTS.md claims "
                        "these agents carry none",
                    )

    def test_agent_definitions_are_read_only_by_contract(self):
        """Claude definitions must request read-only execution and forbid edits."""

        for name in sorted(defined_agents() | set(EXPECTED_STEP)):
            with self.subTest(agent=name):
                path = AGENTS_DIR / f"{name}.md"
                self.assertEqual(
                    frontmatter(path).get("readonly"),
                    "true",
                    f"{name} is not declared read-only",
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

    def test_every_agent_declares_tools(self):
        """An omitted tools list would bypass the explicit read-only tool checks."""
        for name in sorted(defined_agents() | set(EXPECTED_STEP)):
            with self.subTest(agent=name):
                self.assertTrue(
                    tools_of(frontmatter(AGENTS_DIR / f"{name}.md")),
                    f"{name} declares no tools, so it would inherit the full tool set",
                )


if __name__ == "__main__":
    unittest.main()
