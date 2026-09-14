import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id
  const resolvedParams = await context.params
  const id = resolvedParams?.id

  if (!id || id.trim() === '') {
    return NextResponse.json({ message: 'Order ID is required' }, { status: 400 })
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order || order.userId !== userId) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Failed to fetch order:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
