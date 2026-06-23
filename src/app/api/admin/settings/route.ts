import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAdminSession } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await request.json()

  for (const [key, value] of Object.entries(settings)) {
    if (typeof value !== 'string') continue

    await db.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value, type: 'string' },
    })
  }

  return NextResponse.json({ success: true })
}

export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const settings = await db.siteSetting.findMany()
  const map: Record<string, string> = {}
  settings.forEach((s) => { map[s.key] = s.value })

  return NextResponse.json(map)
}
