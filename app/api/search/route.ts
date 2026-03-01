import { NextRequest, NextResponse } from 'next/server'
import { searchPosts } from '@/lib/actions/posts'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') ?? ''
  const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 100)

  if (!query.trim()) {
    return NextResponse.json([])
  }

  try {
    const results = await searchPosts(query, limit)
    return NextResponse.json(results)
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
