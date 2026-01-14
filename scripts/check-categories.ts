import { prisma } from '../src/lib/prisma'

async function main() {
  try {
    const categories = await prisma.category.findMany()
    console.log('Categories in DB:', categories)
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
