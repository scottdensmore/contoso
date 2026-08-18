import os
import sys
import asyncio
import traceback
from prisma import Prisma
import chromadb
from chromadb.utils import embedding_functions

# Path to ChromaDB persistence directory
CHROMA_DB_PATH = os.getenv("CHROMA_DB_PATH", os.path.join(os.path.dirname(__file__), '../data/chroma_db'))

async def index_products():
    print("Starting local product indexing...")
    
    try:
        # 1. Fetch products from DB
        db = Prisma()
        await db.connect()
        products = await db.product.find_many(include={'category': True, 'brand': True})
        await db.disconnect()
        
        if not products:
            print("No products found in database. Skipping indexing.")
            return

        print(f"Fetched {len(products)} products from database.")

        # 2. Initialize ChromaDB
        os.makedirs(CHROMA_DB_PATH, exist_ok=True)
        
        client = chromadb.PersistentClient(path=CHROMA_DB_PATH)
        ef = embedding_functions.DefaultEmbeddingFunction()
        
        # get_or_create_collection is idempotent
        collection = client.get_or_create_collection(name="products", embedding_function=ef)

        # 3. Prepare data
        documents = []
        metadatas = []
        ids = []

        for p in products:
            category_name = p.category.name if p.category else "Unknown"
            brand_name = p.brand.name if p.brand else "Unknown"
            
            doc_text = f"Product: {p.name}\nCategory: {category_name}\nBrand: {brand_name}\nDescription: {p.description or ''}\nPrice: ${p.price}"
            documents.append(doc_text)
            
            metadatas.append({
                "id": p.id,
                "name": p.name,
                "price": p.price,
                "slug": p.slug,
                "category": category_name,
                "brand": brand_name
            })
            
            ids.append(p.id)

        # 4. Add to ChromaDB
        if ids:
            # upsert is idempotent (updates if ID exists, otherwise inserts)
            collection.upsert(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            print(f"Successfully indexed {len(ids)} products to {CHROMA_DB_PATH}")
    except Exception as e:
        print(f"Error during indexing: {e}", file=sys.stderr)
        traceback.print_exc()
        raise

if __name__ == "__main__":
    try:
        asyncio.run(index_products())
    except Exception:
        # chat-entrypoint.sh retries this command while it exits nonzero, so a
        # failed attempt has to be visible as one.
        sys.exit(1)
