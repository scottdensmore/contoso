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
      update: { slug: category.slug },
      create: {
        name: category.name,
        slug: category.slug,
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
