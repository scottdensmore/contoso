import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const categoriesPath = path.join(process.cwd(), 'public', 'categories.json');
  const brandsPath = path.join(process.cwd(), 'public', 'brands.json');
  const productsPath = path.join(process.cwd(), 'public', 'products.json');

  const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
  const brandsData = JSON.parse(fs.readFileSync(brandsPath, 'utf-8'));
  const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));

  // Seed Categories
  const categoryMap = new Map<string, string>();
  for (const category of categoriesData) {
    const created = await prisma.category.upsert({
      where: { name: category.name },
      update: { 
        slug: category.slug,
        description: category.description,
      },
      create: {
        name: category.name,
        slug: category.slug,
        description: category.description,
      },
    });
    categoryMap.set(category.name, created.id);
    console.log(`Synced category: ${category.name}`);
  }

  // Seed Brands
  const brandMap = new Map<string, string>();
  for (const brand of brandsData) {
    const created = await prisma.brand.upsert({
      where: { name: brand.name },
      update: { slug: brand.slug },
      create: {
        name: brand.name,
        slug: brand.slug,
      },
    });
    brandMap.set(brand.name, created.id);
    console.log(`Synced brand: ${brand.name}`);
  }

  // Seed Products
  for (const product of productsData) {
    const categoryId = categoryMap.get(product.category);
    const brandId = brandMap.get(product.brand);

    if (!categoryId || !brandId) {
      console.warn(`Skipping product ${product.name}: Category (${product.category}) or Brand (${product.brand}) not found.`);
      continue;
    }

    await prisma.product.upsert({
      where: { id: product.id.toString() },
      update: {
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        image: product.images[0],
        slug: product.slug,
        categoryId: categoryId,
        brandId: brandId,
      },
      create: {
        id: product.id.toString(),
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        image: product.images[0],
        slug: product.slug,
        categoryId: categoryId,
        brandId: brandId,
      },
    });
    console.log(`Synced product: ${product.name}`);
  }

  // Seed Customers
  const customersPath = path.join(process.cwd(), 'public', 'customers.json');
  if (fs.existsSync(customersPath)) {
    const customersData = JSON.parse(fs.readFileSync(customersPath, 'utf-8'));
    for (const customer of customersData) {
      const addressParts = customer.address ? customer.address.split(',').map((s: string) => s.trim()) : [];
      const addressLine1 = addressParts[0] || '';
      const cityState = addressParts[1] || ''; // simplistic parsing
      const zipCode = addressParts[2] || '';
      // Try to split city/state if possible, or just leave in city
      const city = cityState; 

      const upsertedUser = await prisma.user.upsert({
        where: { email: customer.email },
        update: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          age: customer.age,
          membership: customer.membership,
          phoneNumber: customer.phone,
          addressLine1,
          city,
          zipCode,
        },
        create: {
          id: customer.id,
          email: customer.email,
          password: 'password', // Default password
          firstName: customer.firstName,
          lastName: customer.lastName,
          age: customer.age,
          membership: customer.membership,
          phoneNumber: customer.phone,
          addressLine1,
          city,
          zipCode,
        },
      });
      console.log(`Synced user: ${customer.firstName} ${customer.lastName}`);

      for (const order of customer.orders) {
        // Upsert Order
        await prisma.order.upsert({
          where: { id: order.id.toString() },
          update: {
            userId: upsertedUser.id,
            date: new Date(order.date),
            total: order.total,
          },
          create: {
            id: order.id.toString(),
            userId: upsertedUser.id,
            date: new Date(order.date),
            total: order.total,
          },
        });

        // Upsert OrderItem (Assuming one item per order as per data structure)
        // Since we don't have a stable ID for OrderItem in the JSON, we find first or create
        const existingItem = await prisma.orderItem.findFirst({
          where: {
            orderId: order.id.toString(),
            productId: order.productId.toString(),
          },
        });

        if (!existingItem) {
          await prisma.orderItem.create({
            data: {
              orderId: order.id.toString(),
              productId: order.productId.toString(),
              quantity: order.quantity,
              price: order.unitprice,
            },
          });
        } else {
            // Optional: update if needed
            await prisma.orderItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: order.quantity,
                    price: order.unitprice
                }
            })
        }
      }
      console.log(`Synced orders for user: ${customer.email}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
