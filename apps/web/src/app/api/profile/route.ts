import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateUser, getUserById } from '@/lib/user'
import { pickProfileFields } from '@/lib/profile-fields'

export async function GET(_request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id
  const user = await getUserById(userId)

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 })
  }

  // Remove password from response
  const { password, ...userProfile } = user
  return NextResponse.json(userProfile)
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || !(session.user as any).id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id
  const data = await request.json()

  try {
    const updatedUser = await updateUser(userId, pickProfileFields(data))
    // Strip the hash, as GET already does. Returning it would hand the
    // credential back to the client on every profile save.
    const { password, ...userProfile } = updatedUser
    return NextResponse.json(userProfile)
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}