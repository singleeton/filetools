import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const locale = request.nextUrl.searchParams.get('locale')
  const status = request.nextUrl.searchParams.get('status')

  const posts = await db.blogPost.findMany({
    where: {
      ...(locale ? { locale } : {}),
      ...(status ? { status: status as 'DRAFT' | 'PUBLISHED' } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ posts })
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await request.json()
  const { slug, locale, title, excerpt, content, coverImageUrl, metaTitle, metaDescription, status } = data

  if (!slug || !locale || !title || !excerpt || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const post = await db.blogPost.create({
    data: {
      slug,
      locale,
      title,
      excerpt,
      content,
      coverImageUrl: coverImageUrl || null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      aiGenerated: false,
      status: status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
      publishedAt: status === 'PUBLISHED' ? new Date() : null,
    },
  })

  return NextResponse.json({ success: true, post })
}
