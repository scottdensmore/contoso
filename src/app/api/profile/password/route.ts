import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateUser, getUserById } from '@/lib/user'
import { compare, hash } from 'bcryptjs'

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id
  const { currentPassword, newPassword } = await request.json()

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ message: 'Missing fields' }, { status: 400 })
  }

  try {
    const user = await getUserById(userId)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const isMatch = await compare(currentPassword, user.password)
    if (!isMatch) {
      return NextResponse.json({ message: 'Incorrect current password' }, { status: 400 })
    }

    const hashedPassword = await hash(newPassword, 12)
    await updateUser(userId, { password: hashedPassword })

    return NextResponse.json({ message: 'Password updated' })
  } catch (error) {
    console.error('Password update error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
