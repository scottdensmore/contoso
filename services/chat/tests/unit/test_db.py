import db
import pytest


class TestNormalizeDsn:
    def test_leaves_plain_dsn_untouched(self):
        dsn = "postgresql://postgres:postgres@localhost:5432/contoso-db"
        assert db.normalize_dsn(dsn) == dsn

    def test_strips_prisma_schema_parameter(self):
        # The repo's own .env.example ships `?schema=public`, which asyncpg rejects.
        dsn = "postgresql://postgres:postgres@localhost:5432/contoso-db?schema=public"
        assert (
            db.normalize_dsn(dsn)
            == "postgresql://postgres:postgres@localhost:5432/contoso-db"
        )

    def test_strips_only_prisma_specific_parameters(self):
        dsn = (
            "postgresql://u:p@h:5432/d"
            "?schema=public&connection_limit=5&application_name=chat"
        )
        assert db.normalize_dsn(dsn) == "postgresql://u:p@h:5432/d?application_name=chat"

    def test_preserves_credentials_and_port(self):
        dsn = "postgresql://user:s3cret@db:5432/contoso-db?schema=public"
        assert db.normalize_dsn(dsn) == "postgresql://user:s3cret@db:5432/contoso-db"


def _row(order_id, item_id=None, product_id=None):
    return {
        "order_id": order_id,
        "order_user_id": "cust-1",
        "order_date": "2026-01-01",
        "order_total": 10.0,
        "order_created_at": "2026-01-01",
        "order_updated_at": "2026-01-01",
        "item_id": item_id,
        "item_order_id": order_id,
        "item_product_id": product_id,
        "item_quantity": 2,
        "item_price": 5.0,
        "product_id": product_id,
        "product_name": "Tent",
        "product_description": "A tent",
        "product_price": 5.0,
        "product_image": None,
        "product_category_id": "cat-1",
        "product_brand_id": "brand-1",
        "product_slug": "tent",
        "product_created_at": "2026-01-01",
        "product_updated_at": "2026-01-01",
    }


class TestBuildOrders:
    def test_groups_items_under_their_order(self):
        rows = [_row("o1", "i1", "p1"), _row("o1", "i2", "p2"), _row("o2", "i3", "p3")]

        orders = db._build_orders(rows)

        assert [o["id"] for o in orders] == ["o1", "o2"]
        assert [i["id"] for i in orders[0]["items"]] == ["i1", "i2"]
        assert orders[0]["items"][0]["product"]["id"] == "p1"

    def test_order_without_items_yields_empty_list(self):
        # LEFT JOIN produces one row with null item columns.
        orders = db._build_orders([_row("o1")])

        assert len(orders) == 1
        assert orders[0]["items"] == []

    def test_no_rows_yields_no_orders(self):
        assert db._build_orders([]) == []


@pytest.mark.anyio
async def test_connect_requires_database_url(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)

    with pytest.raises(RuntimeError, match="DATABASE_URL is not set"):
        await db.connect()


@pytest.fixture
def anyio_backend():
    return "asyncio"
