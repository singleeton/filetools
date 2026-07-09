import { NextRequest, NextResponse } from 'next/server'
import { list, del } from '@vercel/blob'

const MAX_AGE_MS = 24 * 60 * 60 * 1000

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = Date.now() - MAX_AGE_MS
  const deleted: string[] = []
  let cursor: string | undefined

  do {
    const page = await list({ prefix: 'tool-outputs/', cursor, limit: 1000 })
    const stale = page.blobs.filter((b) => new Date(b.uploadedAt).getTime() < cutoff)

    if (stale.length > 0) {
      await del(stale.map((b) => b.url))
      deleted.push(...stale.map((b) => b.pathname))
    }

    cursor = page.cursor
  } while (cursor)

  return NextResponse.json({ deleted: deleted.length })
}
