import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

const DATA_DIR = path.join(process.cwd(), 'services/chat/data/customer_info');

interface JsonOrder {
  id: number;
  productId: number;
  quantity: number;
  total: number;
  date: string;
  name: string;
  unitprice: number;
  category: string;
  brand: string;
  description: string;
}

interface JsonCustomer {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  phone: string;
  address: string;
  membership: string;
  orders: JsonOrder[];
}

async function main() {
  console.log('Starting migration of chat service data...');

  // 1. Cache Products
  const products = await prisma.product.findMany();
  const productMap = new Map<string, string>(); // Name -> ID
  products.forEach(p => productMap.set(p.name, p.id));

  console.log(`Loaded ${products.length} products from database.`);

  // 2. Read JSON files
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  console.log(`Found ${files.length} customer files.`);

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const customer: JsonCustomer = JSON.parse(content);

    console.log(`Processing customer: ${customer.email} (${customer.firstName} ${customer.lastName})`);

    // 3. Upsert User
    const user = await prisma.user.upsert({
      where: { email: customer.email },
      update: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        age: customer.age,
        phoneNumber: customer.phone,
        addressLine1: customer.address, // Mapping full address to addressLine1 for now
        membership: customer.membership,
      },
      create: {
        email: customer.email,
        password: 'password', // Default password for migrated users
        firstName: customer.firstName,
        lastName: customer.lastName,
        age: customer.age,
        phoneNumber: customer.phone,
        addressLine1: customer.address,
        membership: customer.membership,
      },
    });

    // 4. Group Orders by ID
    const ordersById = new Map<number, JsonOrder[]>();
    for (const orderItem of customer.orders) {
      if (!ordersById.has(orderItem.id)) {
        ordersById.set(orderItem.id, []);
      }
      ordersById.get(orderItem.id)!.push(orderItem);
    }

    // 5. Create Orders and OrderItems
    for (const [orderId, items] of Array.from(ordersById)) {
      // Assuming date is consistent across items in the same order
      const firstItem = items[0];
      const orderDate = new Date(firstItem.date);
      
      // Calculate total from items
      const orderTotal = items.reduce((sum: number, item: JsonOrder) => sum + item.total, 0);

      const createdOrder = await prisma.order.create({
        data: {
          userId: user.id,
          date: orderDate,
          total: orderTotal,
          items: {
            create: items.map((item: JsonOrder) => {
              const productId = productMap.get(item.name);
              if (!productId) {
                console.warn(`  WARNING: Product not found: "${item.name}". Skipping item.`);
                return undefined;
              }
              return {
                productId: productId,
                quantity: item.quantity,
                price: item.unitprice,
              };
            }).filter((item: any): item is { productId: string; quantity: number; price: number } => item !== undefined),
          },
        },
      });
      console.log(`  Created Order with ${createdOrder.id} (Legacy ID: ${orderId}) with ${items.length} items.`);
    }
  }

  console.log('Migration complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
