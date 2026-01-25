import pandas as pd

df = pd.read_csv("data/product_info/products.csv")

for index, row in df.iterrows():
    description = row['description'].replace("'", "''")
    print(f"INSERT INTO products (product_id, name, price, category, brand, description) VALUES ({row['id']}, '{row['name']}', {row['price']}, '{row['category']}', '{row['brand']}', '{description}') ON CONFLICT (product_id) DO NOTHING;")
