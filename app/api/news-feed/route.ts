import { NextResponse } from 'next/server'
import { getNewsFeed } from '@/lib/actions/news'

export async function GET() {
  try {
    const news = await getNewsFeed({ limit: 20 })
    return NextResponse.json(news)
  } catch (error) {
    console.error('Error in news API:', error)
    return NextResponse.json([], { status: 500 })
  }
}
