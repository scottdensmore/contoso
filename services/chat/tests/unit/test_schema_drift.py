"""Guard the hand-written SQL in db.py against the Prisma schema.

`db.py` names tables and columns literally. The schema those names come from is
`apps/web/prisma/schema.prisma`, owned by the web app, and nothing else in the
repo checks that the two agree — the type checker cannot see inside SQL strings
and the unit tests mock the driver. A rename on the web side would pass every
check and then fail at runtime as a failed customer lookup.

This closes that gap for identifiers the queries name explicitly. It reads the
schema rather than a database, so it needs no fixtures and runs with the normal
unit suite.

Not covered: types, nullability, and relation directions. Those need a real
database — see the integration option discussed in issue #68.
"""

from __future__ import annotations

import re
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[4]
SCHEMA_PATH = REPO_ROOT / "apps" / "web" / "prisma" / "schema.prisma"
DB_MODULE_PATH = Path(__file__).resolve().parents[2] / "src" / "api" / "db.py"

MODEL_RE = re.compile(r"^model\s+(\w+)\s*\{", re.M)
QUERY_CONST_RE = re.compile(r'^(_\w*QUERY)\s*=\s*"""(.*?)"""', re.M | re.S)
# FROM "Table" alias / JOIN "Table" alias — alias optional.
TABLE_RE = re.compile(r'\b(?:FROM|JOIN)\s+"(\w+)"(?:\s+(?!ON\b|WHERE\b|LEFT\b)(\w+))?')
# alias."column" or alias.column
QUALIFIED_COL_RE = re.compile(r'\b(\w+)\.(?:"(\w+)"|(\w+))')

SQL_KEYWORDS = {
    "select", "from", "where", "and", "or", "as", "on", "left", "right",
    "inner", "outer", "join", "order", "by", "asc", "desc", "null", "is",
    "not", "limit", "offset", "group", "having", "distinct",
}


def parse_schema_models(schema_text: str) -> dict[str, set[str]]:
    """Map each Prisma model to its scalar field names.

    The schema uses no `@map`, so field names are the column names. Relation
    fields are excluded: they are not columns, and treating them as valid
    would let a query reference one without failing.
    """
    model_names = set(MODEL_RE.findall(schema_text))
    models: dict[str, set[str]] = {}

    for match in MODEL_RE.finditer(schema_text):
        name = match.group(1)
        body = schema_text[match.end():]
        end = body.index("\n}")
        fields: set[str] = set()

        for raw in body[:end].splitlines():
            line = raw.strip()
            if not line or line.startswith(("//", "@@")):
                continue
            parts = line.split()
            if len(parts) < 2:
                continue
            field, field_type = parts[0], parts[1]
            if field_type.rstrip("[]?") in model_names:
                continue  # relation, not a column
            fields.add(field)

        models[name] = fields

    return models


def extract_queries(source: str) -> dict[str, str]:
    return {name: sql for name, sql in QUERY_CONST_RE.findall(source)}


@pytest.fixture(scope="module")
def models() -> dict[str, set[str]]:
    assert SCHEMA_PATH.is_file(), f"Prisma schema not found at {SCHEMA_PATH}"
    return parse_schema_models(SCHEMA_PATH.read_text(encoding="utf-8"))


@pytest.fixture(scope="module")
def queries() -> dict[str, str]:
    found = extract_queries(DB_MODULE_PATH.read_text(encoding="utf-8"))
    assert found, f"No _*QUERY constants found in {DB_MODULE_PATH}"
    return found


def test_queries_reference_existing_tables(models, queries):
    for name, sql in queries.items():
        for table, _alias in TABLE_RE.findall(sql):
            assert table in models, (
                f"{name} selects from table {table!r}, which is not a model in "
                f"schema.prisma (models: {sorted(models)})"
            )


def test_queries_reference_existing_columns(models, queries):
    for name, sql in queries.items():
        tables = TABLE_RE.findall(sql)
        alias_to_model = {alias: table for table, alias in tables if alias}

        if alias_to_model:
            for alias, quoted, bare in QUALIFIED_COL_RE.findall(sql):
                model = alias_to_model.get(alias)
                if model is None:
                    continue  # not a table alias (e.g. a module attribute)
                column = quoted or bare
                assert column in models[model], (
                    f"{name} references {alias}.{column!r} but {model} has no "
                    f"such field in schema.prisma"
                )
        else:
            # Single unaliased table: every identifier in the SELECT list is
            # one of its columns.
            table = tables[0][0]
            select_body = sql.split("SELECT", 1)[1].split("FROM", 1)[0]
            for token in re.findall(r'"(\w+)"|\b([a-zA-Z_]\w*)\b', select_body):
                column = token[0] or token[1]
                if column.lower() in SQL_KEYWORDS:
                    continue
                assert column in models[table], (
                    f"{name} selects {column!r} but {table} has no such field "
                    f"in schema.prisma"
                )


def test_detects_a_renamed_column(models):
    """The guard must fail when the schema drifts, not just pass when it agrees."""
    drifted = {**models, "User": models["User"] - {"firstName"}}
    sql = extract_queries(DB_MODULE_PATH.read_text(encoding="utf-8"))["_USER_QUERY"]

    select_body = sql.split("SELECT", 1)[1].split("FROM", 1)[0]
    columns = {
        (t[0] or t[1])
        for t in re.findall(r'"(\w+)"|\b([a-zA-Z_]\w*)\b', select_body)
        if (t[0] or t[1]).lower() not in SQL_KEYWORDS
    }

    assert "firstName" in columns, "expected _USER_QUERY to select firstName"
    assert not columns.issubset(drifted["User"]), (
        "removing firstName from the schema should make the query's columns "
        "no longer a subset of the model's fields"
    )
