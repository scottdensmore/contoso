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
  for (const category of categoriesData) {
    await prisma.category.create({
      data: {
        id: category.id.toString(),
        name: category.name,
      },
    });
    console.log(`Created category with id: ${category.id}`);
  }

  // Seed Brands
  for (const brand of brandsData) {
    await prisma.brand.create({
      data: {
        id: brand.id.toString(),
        name: brand.name,
      },
    });
    console.log(`Created brand with id: ${brand.id}`);
  }

  // Seed Products
  for (const product of productsData) {
    await prisma.product.create({
      data: {
        id: product.id.toString(),
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        image: product.image,
        categoryId: product.categoryId.toString(),
        brandId: product.brandId.toString(),
      },
    });
    console.log(`Created product with id: ${product.id}`);
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
