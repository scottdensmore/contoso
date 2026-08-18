# AGENTS (Script Guardrails)

Root script-test scope for coding agents. This file adds authoritative
instructions for `tests/scripts/`; apply it together with the repo-root
`AGENTS.md`. Put instructions here, never in the sibling pointer files.

## Local commands

Run from the repository root:

```bash
make test-scripts
.venv/bin/python -m unittest tests.scripts.<module> -v
```

## Code Review Rules

- Point a guard demonstration at a fixture tree, never the checkout it protects.
  Rebind every imported path constant the assertion dereferences; changing a root
  after derived constants were created does not redirect those constants.
- Prove that the intended assertion catches its named mistake, and separately prove
  the fixture was opened. A vacuity failure on an empty or mistyped path is not
  evidence that the behavioral assertion ran.
- Compare effective sets and outputs from the owning tool where practical. Parsing
  one declaration is insufficient when includes, excludes, defaults, comments, or
  other configuration can change what the compiler, runner, or hook actually uses.

## Fixture isolation

These modules compute path constants at import, so read the module and rebind every
constant the demonstrated assertion reaches:

- `test_image_encoding.py` reaches its files through `IMAGES_DIR`.
- `test_image_references.py` also needs `PUBLIC_DIR`, which `relative_to` depends on,
  and `REPO_ROOT`, which it walks for references.
- `test_page_headings.py` reads `REPO_ROOT` directly for component-supplied headings,
  so rebinding `APP_DIR` alone leaves that assertion pointed at the checkout.
- `test_published_ports.py` needs both `REPO_ROOT`, which `read()` resolves every
  coupled file through, and `COMPOSE`, which the port parser opens directly.
  Rebinding one leaves half the comparison pointed at the checkout, and the halves
  agreeing is the whole assertion.
- `test_agent_doctor.py` loads `scripts/agent_doctor.py` as a module, so the
  constants to rebind are that module's `COMPOSE_FILE`, `ROOT_ENV` and `CHAT_ENV` —
  not this file's `REPO_ROOT`, which only locates the script to load. Its
  `stale_port_keys` tests take their inputs as arguments and reach no path at all,
  which is the reason they are shaped that way.

## Mutation demonstrations and stale bytecode

`load_script_module` reaches these scripts through `spec_from_file_location`, so
they compile into `scripts/__pycache__` like any import. Python treats a cached
`.pyc` as current when the source's **mtime and size** both match, and a mutation
demonstration defeats exactly that check: flipping a constant (`0x5C` to `0x58`)
leaves the file the same size, and restoring it from a backup seconds later
leaves the recorded mtime unchanged to the second.

Measured here: after restoring the source, `grep` showed the original constant
and the suite still failed, decoding through the mutated table. The source was
never wrong; the bytecode was. It reads exactly like a mutation that would not
revert.

So clear the cache between a mutation and its restore, or check the restore by
running the suite rather than by reading the file:

```bash
find . -name __pycache__ -type d -not -path './node_modules/*' -not -path './.venv/*' -exec rm -rf {} +
```

The same shape bites in the other direction. A mutation that never applied —
a `sed` whose pattern did not match — leaves every test passing, which is
indistinguishable from an assertion that catches nothing. Confirm the mutation
landed before believing its result, the same way you confirm the restore did.

Confirm the run opened the fixture with a failure that names a fixture path or a
vacuity guard whose count matches what the fixture contains. The count is the
evidence: a vacuity guard also fires when a fixture path is mistyped, while every
assertion inside the resulting empty loop passes.
