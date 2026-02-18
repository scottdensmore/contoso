import { NextResponse } from 'next/server'
import { getCategories } from '@/lib/categories'

export async function GET() {
  if (process.env.NEXT_BUILD_SKIP_DB === '1') {
    return NextResponse.json([])
  }

  try {
    const categories = await getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ message: 'Error fetching categories.' }, { status: 500 })
  }
}
