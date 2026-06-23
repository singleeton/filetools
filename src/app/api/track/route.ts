import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    const userAgent = request.headers.get('user-agent') || ''

    if (type === 'page_view') {
      await db.pageView.create({
        data: {
          path: data.path || '/',
          locale: data.locale || null,
          referrer: data.referrer || null,
          userAgent,
          ip,
        },
      })
    }

    if (type === 'tool_event') {
      const tool = await db.tool.findUnique({ where: { slug: data.tool } })
      if (tool) {
        await db.toolUsageLog.create({
          data: {
            toolId: tool.id,
            event: data.event,
            fileSize: data.fileSize || null,
            outputSize: data.outputSize || null,
            duration: data.duration || null,
            locale: data.locale || null,
            userAgent,
            ip,
          },
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
