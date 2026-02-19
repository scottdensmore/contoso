import { NextResponse } from 'next/server'
import { getCategories } from '@/lib/categories'

export async function GET() {
  try {
    const categories = await getCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ message: 'Error fetching categories.' }, { status: 500 })
  }
}
