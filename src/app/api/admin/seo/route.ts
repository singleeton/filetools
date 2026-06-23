import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { section, locale, content } = await request.json()

  await db.landingContent.upsert({
    where: { section_locale: { section, locale } },
    update: { content },
    create: { section, locale, content },
  })

  return NextResponse.json({ success: true })
}
