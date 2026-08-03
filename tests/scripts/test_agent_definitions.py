"""Guard AGENTS.md's claims about the workflow sub-agents against their definitions.

AGENTS.md states that `ui-review`, `verifier`, and `code-review` are defined in
`.claude/agents/`, that all three run unattended, and that none can modify the
repository it assesses. Those claims are load-bearing: the first is why the
workflow can run without a human present, the second is why a review agent is
trusted to look at uncommitted work.

Nothing else checks them. `verify_docs.py` validates that links resolve and that
pointer files stay pointers; it does not compare prose against the agent
definitions, and the references are inline code spans rather than links. So an
agent could gain `Write` or `AskUserQuestion` and the documentation would keep
asserting otherwise with every check green.

Same shape as the schema drift guarded in services/chat/tests/unit/test_schema_drift.py:
two files that must agree, with nothing enforcing it.
"""

import re
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
AGENTS_MD = REPO_ROOT / "AGENTS.md"
AGENTS_DIR = REPO_ROOT / ".claude/agents"

# Tools that would contradict a claim AGENTS.md makes about these agents.
INTERACTIVE_TOOLS = ("AskUserQuestion",)
MUTATING_TOOLS = ("Write", "Edit", "NotebookEdit")

# Step number in AGENTS.md that invokes each agent.
EXPECTED_STEP = {"ui-review": 6, "verifier": 7, "code-review": 8}


def defined_agents() -> set[str]:
    """Agents that actually exist on disk."""
    return {p.stem for p in AGENTS_DIR.glob("*.md")}


def agent_names_claimed_by_docs() -> set[str]:
    """Agent names AGENTS.md says live in .claude/agents/.

    Deliberately unfiltered. Filtering by a known set would make this a subset
    by construction, so it could only ever detect a missing name — never an
    extra one.
    """
    text = AGENTS_MD.read_text(encoding="utf-8")
    section = text.split("### Sub-agents this workflow depends on", 1)
    if len(section) < 2:
        return set()
    body = section[1].split("\n## ", 1)[0]
    return set(re.findall(r"`([a-z][a-z-]*[a-z])`", body))


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


class AgentDefinitionTests(unittest.TestCase):
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
        """AGENTS.md claims all three run unattended."""
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
                        "AGENTS.md claims these agents run unattended",
                    )

    def test_agents_cannot_modify_the_repository(self):
        """AGENTS.md claims none of them can modify what they assess."""
        for name in sorted(defined_agents() | set(EXPECTED_STEP)):
            with self.subTest(agent=name):
                tools = tools_of(frontmatter(AGENTS_DIR / f"{name}.md"))
                self.assertTrue(tools, f"{name}: could not parse a tools list")
                for banned in MUTATING_TOOLS:
                    self.assertNotIn(
                        banned,
                        tools,
                        f"{name} has {banned}, so it can modify the repository it reviews; "
                        "AGENTS.md claims it cannot",
                    )

    def test_agent_description_matches_the_step_that_invokes_it(self):
        """The step number is read from AGENTS.md, not hardcoded.

        Hardcoding lets the workflow renumber while the test keeps agreeing
        with a stale value.
        """
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
                description = frontmatter(AGENTS_DIR / f"{name}.md").get("description", "")
                self.assertIn(
                    f"step {step}",
                    description.lower(),
                    f"{name}'s description should say it is invoked at step {step}, "
                    "matching the workflow in AGENTS.md",
                )

    def test_every_agent_declares_tools(self):
        """An agent with no tools list inherits everything, defeating both claims."""
        for name in sorted(defined_agents() | set(EXPECTED_STEP)):
            with self.subTest(agent=name):
                self.assertTrue(
                    tools_of(frontmatter(AGENTS_DIR / f"{name}.md")),
                    f"{name} declares no tools, so it would inherit the full tool set",
                )


if __name__ == "__main__":
    unittest.main()
