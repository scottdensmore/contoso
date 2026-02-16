import { prisma } from './prisma'

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: {
      name: 'asc',
    },
  })
}
