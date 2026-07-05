import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/admin-auth'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const post = await db.blogPost.findUnique({ where: { id } })

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  return NextResponse.json({ post })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const data = await request.json()

  const allowed = [
    'slug', 'title', 'excerpt', 'content', 'coverImageUrl',
    'metaTitle', 'metaDescription', 'status',
  ]
  const updateData: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in data) updateData[key] = data[key]
  }

  if (updateData.status === 'PUBLISHED') {
    const existing = await db.blogPost.findUnique({ where: { id } })
    if (existing && !existing.publishedAt) {
      updateData.publishedAt = new Date()
    }
  }

  const post = await db.blogPost.update({ where: { id }, data: updateData })

  return NextResponse.json({ success: true, post })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  await db.blogPost.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
