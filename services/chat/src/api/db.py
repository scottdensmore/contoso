"""PostgreSQL access for the chat service.

Replaces the generated `prisma-client-py` client. That client pinned Prisma
5.17.0 and required a `url` in the schema's `datasource` block, which Prisma 7
removes. Because the web app and the chat service generated from the same
`schema.prisma`, the Python client held the whole repository back from
tracking Prisma releases.

The chat service only ever read from the database -- one customer lookup and a
health probe -- so it talks to Postgres directly instead.
"""

from __future__ import annotations

import os
from typing import Any
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import asyncpg

# Prisma accepts connection-string parameters that asyncpg rejects. `schema` is
# the common one: the repo's own .env.example ships `?schema=public`.
PRISMA_ONLY_QUERY_KEYS = frozenset(
    {
        "schema",
        "connection_limit",
        "connect_timeout",
        "pool_timeout",
        "pgbouncer",
        "socket_timeout",
        "sslcert",
        "sslidentity",
        "sslpassword",
    }
)


def normalize_dsn(url: str) -> str:
    """Strip Prisma-only query parameters so asyncpg can parse the DSN."""
    parts = urlsplit(url)
    if not parts.query:
        return url

    kept = [
        (key, value)
        for key, value in parse_qsl(parts.query, keep_blank_values=True)
        if key not in PRISMA_ONLY_QUERY_KEYS
    ]
    return urlunsplit(parts._replace(query=urlencode(kept)))


async def connect() -> asyncpg.Connection:
    dsn = os.environ.get("DATABASE_URL")
    if not dsn:
        raise RuntimeError("DATABASE_URL is not set.")
    return await asyncpg.connect(normalize_dsn(dsn))


async def check_connection() -> tuple[bool, str | None]:
    """Return (connected, error) for the dependency health endpoint."""
    connection = None
    try:
        connection = await connect()
        await connection.fetchval("SELECT 1")
        return True, None
    except Exception as exc:  # noqa: BLE001
        return False, str(exc)
    finally:
        if connection is not None:
            await connection.close()


# Table and column identifiers are quoted: Prisma maps models to PascalCase
# tables and fields to camelCase columns, neither of which survives Postgres
# identifier folding unquoted.
_USER_QUERY = """
SELECT id, email, name, avatar, "addressLine1", "addressLine2", city, state,
       "zipCode", country, "phoneNumber", "firstName", "lastName", age,
       membership, "createdAt", "updatedAt"
  FROM "User"
 WHERE id = $1
"""

_ORDER_ITEMS_QUERY = """
SELECT o.id            AS order_id,
       o."userId"      AS order_user_id,
       o.date          AS order_date,
       o.total         AS order_total,
       o."createdAt"   AS order_created_at,
       o."updatedAt"   AS order_updated_at,
       i.id            AS item_id,
       i."orderId"     AS item_order_id,
       i."productId"   AS item_product_id,
       i.quantity      AS item_quantity,
       i.price         AS item_price,
       p.id            AS product_id,
       p.name          AS product_name,
       p.description   AS product_description,
       p.price         AS product_price,
       p.image         AS product_image,
       p."categoryId"  AS product_category_id,
       p."brandId"     AS product_brand_id,
       p.slug          AS product_slug,
       p."createdAt"   AS product_created_at,
       p."updatedAt"   AS product_updated_at
  FROM "Order" o
  LEFT JOIN "OrderItem" i ON i."orderId" = o.id
  LEFT JOIN "Product" p ON p.id = i."productId"
 WHERE o."userId" = $1
 ORDER BY o.date DESC, i.id
"""


def _build_orders(rows: list[asyncpg.Record]) -> list[dict[str, Any]]:
    """Fold the joined rows back into the nested shape the client returned."""
    orders: dict[str, dict[str, Any]] = {}

    for row in rows:
        order_id = row["order_id"]
        order = orders.get(order_id)
        if order is None:
            order = {
                "id": order_id,
                "userId": row["order_user_id"],
                "date": row["order_date"],
                "total": row["order_total"],
                "createdAt": row["order_created_at"],
                "updatedAt": row["order_updated_at"],
                "items": [],
            }
            orders[order_id] = order

        # LEFT JOIN: an order with no items yields a row with null item columns.
        if row["item_id"] is None:
            continue

        order["items"].append(
            {
                "id": row["item_id"],
                "orderId": row["item_order_id"],
                "productId": row["item_product_id"],
                "quantity": row["item_quantity"],
                "price": row["item_price"],
                "product": {
                    "id": row["product_id"],
                    "name": row["product_name"],
                    "description": row["product_description"],
                    "price": row["product_price"],
                    "image": row["product_image"],
                    "categoryId": row["product_category_id"],
                    "brandId": row["product_brand_id"],
                    "slug": row["product_slug"],
                    "createdAt": row["product_created_at"],
                    "updatedAt": row["product_updated_at"],
                },
            }
        )

    return list(orders.values())


async def fetch_customer(customer_id: str) -> dict[str, Any] | None:
    """Return a customer with nested orders/items/products, or None."""
    connection = None
    try:
        connection = await connect()
        user_row = await connection.fetchrow(_USER_QUERY, customer_id)
        if user_row is None:
            return None

        customer = dict(user_row)
        customer["orders"] = _build_orders(
            await connection.fetch(_ORDER_ITEMS_QUERY, customer_id)
        )
        return customer
    finally:
        if connection is not None:
            await connection.close()
