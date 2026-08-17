"""Guard AGENTS.md's claims about the workflow sub-agents against their definitions.

AGENTS.md states that `ui-review`, `verifier`, and `code-review` are defined in
`.claude/agents/`, that all three run unattended, and that each is *instructed*
not to modify the repository it assesses — an instruction rather than a sandbox,
because each of them has `Bash`. Those claims are load-bearing: the first is why the
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

    def test_agents_have_no_direct_editing_tools(self):
        """AGENTS.md claims none of them carries a tool whose purpose is editing.

        Deliberately not "cannot modify": every one of them has `Bash` and could
        write a file with it. AGENTS.md says so, and `test_agents_are_told_not_to_modify_and_could`
        below guards the other half of that sentence. What this checks is the
        weaker, true claim — that none of them is *equipped* to edit as a matter
        of course.
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

    def test_agents_are_told_not_to_modify_and_could(self):
        """Both halves of "an instruction rather than a sandbox".

        AGENTS.md was corrected to say these agents are *instructed* not to
        modify what they assess, rather than that they cannot — because each has
        `Bash` and plainly could. That correction put two new factual claims into
        the prose and neither was guarded: strip `Bash` from one agent, or drop
        the instruction from its body, and the documentation goes wrong with the
        suite green. That is the failure this module exists to prevent.
        """
        for name in sorted(defined_agents() | set(EXPECTED_STEP)):
            with self.subTest(agent=name):
                self.assertIn(
                    "Bash",
                    tools_of(frontmatter(AGENTS_DIR / f"{name}.md")),
                    f"{name} has no Bash; AGENTS.md says each of them has it, and "
                    "uses that to explain why not modifying is an instruction "
                    "rather than a sandbox",
                )
                # `never modify` is a separate branch rather than redundant with
                # `not modify` — it contains no "not".
                self.assertRegex(
                    body_of(AGENTS_DIR / f"{name}.md"),
                    r"(?i)(?:do(?:es)? not|never) modify",
                    f"{name} does not tell itself to leave the repository alone "
                    "anywhere in its operating rules; AGENTS.md claims all three "
                    "are instructed not to",
                )

    def test_code_review_carries_the_obligation_check_agents_md_claims(self):
        """AGENTS.md says `code-review` catches step-versus-definition drift.

        That is a claim about another file's body, which is the class this
        module exists for — the docstring above records the same shape being
        caught once already, in the "instructed rather than sandboxed" wording.

        Left unguarded it closes on itself: delete the instruction from
        `code-review.md` and AGENTS.md still says the check happens, while the
        only thing that would have noticed is the deleted instruction. Every
        other assertion here stays green, because none of them reads for it.

        Asserted as one match rather than as separate words. Two presence
        checks pass on a bullet that keeps the vocabulary and drops the
        instruction — and, worse, on one narrowed to the `.claude/agents/`
        trigger alone. AGENTS.md says in the same breath that dropping the
        numbered steps would disarm the check for the edit that motivated it,
        so a guard blind to that narrowing measures less than the prose claims.
        """
        self.assertRegex(
            body_of(AGENTS_DIR / "code-review.md"),
            r"(?is)numbered steps.{0,300}?\.claude/agents/.{0,120}?read both sides",
            "code-review.md no longer carries the obligation check as AGENTS.md "
            "describes it: the trigger list must still name the numbered steps "
            "and .claude/agents/, and still require reading both sides. Dropping "
            "the steps disarms it for a step-only edit, which is the case that "
            "produced #160",
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
