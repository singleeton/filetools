import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { db } from '@/lib/db'
import { getUserSession } from '@/lib/user-auth'

const MAX_SIZE = 2 * 1024 * 1024

export async function GET() {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ signatures: [] })
  }

  const signatures = await db.userSignature.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ signatures })
}

export async function POST(request: NextRequest) {
  const session = await getUserSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { dataUrl } = await request.json()
  const match = typeof dataUrl === 'string' && dataUrl.match(/^data:image\/(png|jpe?g);base64,(.+)$/)
  if (!match) {
    return NextResponse.json({ error: 'Invalid signature image' }, { status: 400 })
  }

  const mimeType = match[1] === 'png' ? 'image/png' : 'image/jpeg'
  const bytes = Buffer.from(match[2], 'base64')

  if (bytes.byteLength > MAX_SIZE) {
    return NextResponse.json({ error: 'Signature image too large' }, { status: 400 })
  }

  try {
    const ext = mimeType === 'image/png' ? 'png' : 'jpg'
    const blob = await put(`signatures/${session.id}/${crypto.randomUUID()}.${ext}`, bytes, {
      access: 'public',
      contentType: mimeType,
    })

    const signature = await db.userSignature.create({
      data: { userId: session.id, url: blob.url, pathname: blob.pathname },
    })

    return NextResponse.json({ signature })
  } catch (error) {
    console.error('Signature upload failed:', error)
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
