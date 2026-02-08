import { prisma } from './prisma'

export async function getProductsByCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      products: true,
    },
  })
}
