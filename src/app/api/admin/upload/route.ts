import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/admin-auth'

const MAX_SIZE = 5 * 1024 * 1024

export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const media = await db.media.findMany({
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  return NextResponse.json({ media })
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
  }

  try {
    const blob = await put(`uploads/${crypto.randomUUID()}-${file.name}`, file, {
      access: 'public',
    })

    const media = await db.media.create({
      data: {
        url: blob.url,
        pathname: blob.pathname,
        filename: file.name,
        size: file.size,
        mimeType: file.type,
      },
    })

    return NextResponse.json({ url: media.url, id: media.id })
  } catch (error) {
    console.error('Blob upload failed:', error)
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
